-- ==============================================================================
-- CHATURANGA JGEC - SUPABASE DATABASE INITIALIZATION SCRIPT
-- ==============================================================================

-- 1. Create TOURNAMENTS table
CREATE TABLE IF NOT EXISTS public.tournaments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  target_date TEXT NOT NULL,
  time TEXT NOT NULL,
  venue TEXT NOT NULL,
  format TEXT NOT NULL,
  prize_pool TEXT NOT NULL,
  slots TEXT,
  max_slots INTEGER DEFAULT 100,
  registered_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  description TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('open', 'upcoming', 'closing_soon', 'closed', 'live', 'completed')),
  registration_start_date TEXT,
  registration_end_date TEXT,
  entry_fee TEXT,
  arbiter_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  fair_play_notice TEXT,
  form_config JSONB DEFAULT '[]'::jsonb,
  custom_fields JSONB DEFAULT '[]'::jsonb,
  is_past BOOLEAN DEFAULT false,
  total_participants INTEGER DEFAULT 0,
  summary TEXT,
  podium JSONB DEFAULT '[]'::jsonb,
  results JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create REGISTRATIONS table
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id TEXT UNIQUE NOT NULL,
  tournament_id TEXT,
  tournament TEXT NOT NULL,
  full_name TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  institution TEXT NOT NULL,
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  rating_category TEXT,
  chess_username TEXT DEFAULT 'N/A',
  fide_id TEXT DEFAULT 'Unrated',
  custom_answers JSONB DEFAULT '{}'::jsonb,
  check_in_status TEXT DEFAULT 'confirmed' CHECK (check_in_status IN ('registered', 'confirmed', 'checked_in')),
  registered_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Prevent duplicate registrations for same roll number in same tournament (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_tournament_roll 
  ON public.registrations (LOWER(tournament), LOWER(roll_number));

-- Fast lookup by ticket_id and roll_number
CREATE INDEX IF NOT EXISTS idx_registrations_ticket 
  ON public.registrations (ticket_id);
CREATE INDEX IF NOT EXISTS idx_registrations_roll 
  ON public.registrations (roll_number);

-- 3. Automatic Live Registration Counter Trigger
CREATE OR REPLACE FUNCTION update_tournament_registration_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.tournaments 
    SET registered_count = registered_count + 1,
        updated_at = now()
    WHERE id = NEW.tournament_id OR title = NEW.tournament;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.tournaments 
    SET registered_count = GREATEST(0, registered_count - 1),
        updated_at = now()
    WHERE id = OLD.tournament_id OR title = OLD.tournament;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_registration_count ON public.registrations;
CREATE TRIGGER trg_update_registration_count
  AFTER INSERT OR DELETE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION update_tournament_registration_count();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Tournaments Policies:
-- Anyone (public) can view all tournaments
CREATE POLICY "Public tournaments viewable by everyone" 
  ON public.tournaments FOR SELECT 
  USING (true);

-- Registrations Policies:
-- Anyone can submit a registration
CREATE POLICY "Public registration submission" 
  ON public.registrations FOR INSERT 
  WITH CHECK (true);

-- Anyone can search/view their own ticket by ticket_id or roll_number
CREATE POLICY "Public ticket lookup" 
  ON public.registrations FOR SELECT 
  USING (true);

-- 5. Seed Initial Featured Tournaments
INSERT INTO public.tournaments (
  id, title, date, target_date, time, venue, format, prize_pool, slots, max_slots, registered_count, is_featured, description, status, entry_fee, arbiter_name, contact_email, contact_phone
) VALUES
(
  'inter-college-2026',
  'Chaturanga Annual Inter-College Chess Championship 2026',
  'November 07, 2026',
  '2026-11-07T09:30:00',
  '09:30 AM – 06:00 PM IST',
  'Main Auditorium, JGEC Campus',
  '7 Rounds Swiss System • Rapid (15m + 10s)',
  '₹25,000 + Trophies',
  '128 Max (42 Enrolled)',
  128,
  42,
  true,
  'The premier collegiate chess championship of North Bengal. Open for students across engineering and collegiate institutions with digital clock setups and broadcast live boards.',
  'open',
  'Free for JGEC • ₹100 External',
  'IA Dr. P. K. Sen / Chief Arbiter JGEC',
  'tournaments@chaturanga-jgec.ac.in',
  '+91 94340 12345'
),
(
  'state-rapid-2026',
  'State Rapid Chess Championship Leg',
  'December 12, 2026',
  '2026-12-12T10:00:00',
  '10:00 AM – 07:00 PM IST',
  'Indoor Sports Complex, Siliguri',
  '6 Rounds Swiss • Rapid (20m + 5s)',
  '₹35,000 + Medals',
  '64 Max (18 Enrolled)',
  64,
  18,
  false,
  'State-level rapid circuit leg sanctioned for collegiate and open category rated players. Electronic DGT boards for top 4 tables.',
  'closing_soon',
  '₹150 All Players',
  'IA S. Banerjee',
  'tournaments@chaturanga-jgec.ac.in',
  '+91 98320 67890'
)
ON CONFLICT (id) DO NOTHING;
