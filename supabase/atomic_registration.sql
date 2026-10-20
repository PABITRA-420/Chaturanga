-- ==============================================================================
-- CHATURANGA JGEC - ATOMIC REGISTRATION & CAPACITY ENFORCEMENT
-- Guaranteed Transactional Integrity: Row-Level Locking, Race Condition Prevention,
-- Auto-Close on Full Capacity, and Auto-Decrement on Cancellation/Deletion.
-- ==============================================================================

-- 1. ATOMIC REGISTRATION FUNCTION
CREATE OR REPLACE FUNCTION public.register_participant_atomic(
  p_ticket_id TEXT,
  p_tournament_id TEXT,
  p_tournament_title TEXT,
  p_full_name TEXT,
  p_roll_number TEXT,
  p_institution TEXT,
  p_department TEXT,
  p_year TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_rating_category TEXT DEFAULT 'Unrated (Club Player)',
  p_chess_platform TEXT DEFAULT NULL,
  p_chess_username TEXT DEFAULT 'N/A',
  p_fide_id TEXT DEFAULT 'Unrated',
  p_custom_answers JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_max_slots INTEGER;
  v_registered_count INTEGER;
  v_status TEXT;
  v_new_count INTEGER;
  v_new_status TEXT;
  v_result JSONB;
BEGIN
  -- 1. Obtain row-level exclusive lock on tournament
  SELECT max_slots, registered_count, status
  INTO v_max_slots, v_registered_count, v_status
  FROM public.tournaments
  WHERE id = p_tournament_id
  FOR UPDATE;

  -- Verify tournament exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'TOURNAMENT_NOT_FOUND';
  END IF;

  -- 2. Validate capacity limit
  v_registered_count := COALESCE(v_registered_count, 0);
  IF (v_status NOT IN ('open', 'upcoming')) OR (v_max_slots IS NOT NULL AND v_registered_count >= v_max_slots) THEN
    RAISE EXCEPTION 'CAPACITY_REACHED';
  END IF;

  -- 3. Check duplicate roll number for the same tournament (case-insensitive & trimmed)
  IF EXISTS (
    SELECT 1 FROM public.registrations
    WHERE (tournament_id = p_tournament_id OR tournament = p_tournament_title)
      AND LOWER(TRIM(roll_number)) = LOWER(TRIM(p_roll_number))
  ) THEN
    RAISE EXCEPTION 'DUPLICATE_REGISTRATION';
  END IF;

  -- 4. Insert registration record atomically
  INSERT INTO public.registrations (
    ticket_id,
    tournament_id,
    tournament,
    full_name,
    roll_number,
    institution,
    department,
    year,
    email,
    phone,
    rating_category,
    chess_username,
    fide_id,
    custom_answers,
    check_in_status,
    registered_at,
    created_at,
    updated_at
  ) VALUES (
    p_ticket_id,
    p_tournament_id,
    p_tournament_title,
    p_full_name,
    p_roll_number,
    p_institution,
    p_department,
    p_year,
    p_email,
    p_phone,
    p_rating_category,
    COALESCE(p_chess_username, 'N/A'),
    COALESCE(p_fide_id, 'Unrated'),
    COALESCE(p_custom_answers, '{}'::jsonb),
    'confirmed',
    now(),
    now(),
    now()
  );

  -- 5. Calculate new count and status
  v_new_count := v_registered_count + 1;
  v_new_status := v_status;

  -- Auto-close tournament if capacity reached
  IF v_max_slots IS NOT NULL AND v_new_count >= v_max_slots THEN
    v_new_status := 'closed';
  END IF;

  -- 6. Update tournament counter and status
  UPDATE public.tournaments
  SET registered_count = v_new_count,
      status = v_new_status,
      updated_at = now()
  WHERE id = p_tournament_id;

  v_result := jsonb_build_object(
    'ticket_id', p_ticket_id,
    'registered_count', v_new_count,
    'status', v_new_status,
    'tournament_id', p_tournament_id
  );

  RETURN v_result;
END;
$$;

-- 2. REGISTRATION DELETION TRIGGER (Auto-Decrement Counter)
CREATE OR REPLACE FUNCTION public.trg_on_registration_deleted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF OLD.tournament_id IS NOT NULL THEN
    UPDATE public.tournaments
    SET registered_count = GREATEST(0, COALESCE(registered_count, 1) - 1),
        updated_at = now()
    WHERE id = OLD.tournament_id;
  ELSIF OLD.tournament IS NOT NULL THEN
    UPDATE public.tournaments
    SET registered_count = GREATEST(0, COALESCE(registered_count, 1) - 1),
        updated_at = now()
    WHERE title = OLD.tournament;
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_registration_deleted ON public.registrations;
CREATE TRIGGER trg_registration_deleted
  AFTER DELETE ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_on_registration_deleted();

-- 3. COUNT RECONCILIATION HELPER
CREATE OR REPLACE FUNCTION public.recalculate_tournament_counts(p_tournament_id TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_actual_count INTEGER;
  v_max_slots INTEGER;
  v_curr_status TEXT;
  v_new_status TEXT;
BEGIN
  SELECT COUNT(*) INTO v_actual_count
  FROM public.registrations
  WHERE tournament_id = p_tournament_id;

  SELECT max_slots, status INTO v_max_slots, v_curr_status
  FROM public.tournaments
  WHERE id = p_tournament_id;

  IF FOUND THEN
    v_new_status := v_curr_status;
    IF v_curr_status = 'closed' AND v_max_slots IS NOT NULL AND v_actual_count < v_max_slots THEN
      v_new_status := 'open';
    ELSIF v_max_slots IS NOT NULL AND v_actual_count >= v_max_slots THEN
      v_new_status := 'closed';
    END IF;

    UPDATE public.tournaments
    SET registered_count = v_actual_count,
        status = v_new_status,
        updated_at = now()
    WHERE id = p_tournament_id;
  END IF;

  RETURN v_actual_count;
END;
$$;
