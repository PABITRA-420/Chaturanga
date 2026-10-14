-- ==============================================================================
-- CHATURANGA JGEC - COMPREHENSIVE SUPABASE DATABASE ARCHITECTURE
-- Fully Admin-Controlled: Tournaments, Capacity, Dynamic Form Options,
-- Registrations/Check-in, Podium & Results Standings, Collegiate Leaderboard,
-- Chess.com Live API Integration Ready, and Club Announcements.
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
  is_visible BOOLEAN DEFAULT true,
  description TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('open', 'upcoming', 'closing_soon', 'closed', 'live', 'completed', 'cancelled')),
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

-- Ensure is_visible column exists if table was created previously
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tournaments' AND column_name = 'is_visible') THEN
    ALTER TABLE public.tournaments ADD COLUMN is_visible BOOLEAN DEFAULT true;
  END IF;
END $$;

-- 2. Create REGISTRATIONS table (Event Participants & Check-in Desk)
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
  check_in_status TEXT DEFAULT 'confirmed' CHECK (check_in_status IN ('registered', 'confirmed', 'checked_in', 'waitlisted', 'withdrawn', 'disqualified')),
  checked_in_at TIMESTAMPTZ,
  arbiter_notes TEXT,
  registered_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure new columns exist if table was created previously
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'registrations' AND column_name = 'checked_in_at') THEN
    ALTER TABLE public.registrations ADD COLUMN checked_in_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'registrations' AND column_name = 'arbiter_notes') THEN
    ALTER TABLE public.registrations ADD COLUMN arbiter_notes TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'registrations' AND column_name = 'updated_at') THEN
    ALTER TABLE public.registrations ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- 3. Create LEADERBOARD_PLAYERS table (Collegiate Ratings & Chess.com Live Sync Ready)
CREATE TABLE IF NOT EXISTS public.leaderboard_players (
  id TEXT PRIMARY KEY,
  rank INTEGER,
  name TEXT NOT NULL,
  roll_number TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  fide_id TEXT DEFAULT 'Unrated',
  chess_username TEXT,
  lichess_username TEXT,
  title TEXT DEFAULT 'Club Member',
  rapid_elo INTEGER NOT NULL DEFAULT 1200,
  blitz_elo INTEGER NOT NULL DEFAULT 1200,
  classical_elo INTEGER NOT NULL DEFAULT 1200,
  bullet_elo INTEGER NOT NULL DEFAULT 1200,
  peak_elo INTEGER NOT NULL DEFAULT 1200,
  matches_played INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  win_rate NUMERIC(5,2) DEFAULT 0.0,
  tournaments_won INTEGER NOT NULL DEFAULT 0,
  recent_form JSONB DEFAULT '["W"]'::jsonb,
  avatar_color TEXT DEFAULT 'from-[#D4AF7C] to-[#E6C98A]',
  chess_piece TEXT DEFAULT 'Knight',
  -- Live Chess.com API integration columns
  chess_com_username TEXT,
  chess_com_verified BOOLEAN DEFAULT false,
  chess_com_last_synced_at TIMESTAMPTZ,
  chess_com_blitz_rating INTEGER,
  chess_com_rapid_rating INTEGER,
  chess_com_bullet_rating INTEGER,
  chess_com_puzzle_rating INTEGER,
  chess_com_avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create ANNOUNCEMENTS table (Dynamic Banners & Club Notices)
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'GENERAL' CHECK (category IN ('TOURNAMENT', 'PRACTICE', 'SELECTION', 'GENERAL')),
  date TEXT NOT NULL,
  badge_color TEXT DEFAULT 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  is_urgent BOOLEAN DEFAULT false,
  link_text TEXT DEFAULT 'Learn More',
  link_url TEXT DEFAULT '/upcoming',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create ADMIN_SETTINGS table (Global configs & key-value CMS store)
CREATE TABLE IF NOT EXISTS public.admin_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Create ADMIN_PROFILES table (Supabase Auth RBAC for Arbiter & Admin Access)
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT 'Tournament Arbiter',
  role TEXT NOT NULL DEFAULT 'arbiter' CHECK (role IN ('superadmin', 'arbiter', 'editor')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_tournament_roll 
  ON public.registrations (LOWER(tournament), LOWER(roll_number));

CREATE INDEX IF NOT EXISTS idx_registrations_ticket 
  ON public.registrations (ticket_id);

CREATE INDEX IF NOT EXISTS idx_registrations_roll 
  ON public.registrations (roll_number);

CREATE INDEX IF NOT EXISTS idx_registrations_status 
  ON public.registrations (check_in_status);

CREATE INDEX IF NOT EXISTS idx_registrations_tourn_id 
  ON public.registrations (tournament_id);

CREATE INDEX IF NOT EXISTS idx_tournaments_status 
  ON public.tournaments (status);

CREATE INDEX IF NOT EXISTS idx_tournaments_visible 
  ON public.tournaments (is_visible);

CREATE INDEX IF NOT EXISTS idx_leaderboard_rank 
  ON public.leaderboard_players (rank);

CREATE INDEX IF NOT EXISTS idx_leaderboard_rapid 
  ON public.leaderboard_players (rapid_elo DESC);

CREATE INDEX IF NOT EXISTS idx_leaderboard_blitz 
  ON public.leaderboard_players (blitz_elo DESC);

CREATE INDEX IF NOT EXISTS idx_leaderboard_chesscom 
  ON public.leaderboard_players (chess_com_username);

CREATE INDEX IF NOT EXISTS idx_announcements_active 
  ON public.announcements (is_active, display_order);

-- ==============================================================================
-- TRIGGERS & STORED FUNCTIONS
-- ==============================================================================

-- Trigger: Update Tournament Registered Count on Registration Insert/Delete
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

-- Trigger: Automatically calculate win rate and peak rating on leaderboard player update
CREATE OR REPLACE FUNCTION auto_calculate_player_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate Win Rate
  IF (NEW.matches_played > 0) THEN
    NEW.win_rate = ROUND(((NEW.wins::numeric + (0.5 * NEW.draws::numeric)) / NEW.matches_played::numeric) * 100.0, 1);
  ELSE
    NEW.win_rate = 0.0;
  END IF;

  -- Ensure peak_elo tracks highest known rating
  NEW.peak_elo = GREATEST(
    COALESCE(NEW.peak_elo, 0),
    COALESCE(NEW.rapid_elo, 0),
    COALESCE(NEW.blitz_elo, 0),
    COALESCE(NEW.classical_elo, 0),
    COALESCE(NEW.bullet_elo, 0),
    COALESCE(NEW.chess_com_rapid_rating, 0),
    COALESCE(NEW.chess_com_blitz_rating, 0)
  );

  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_calculate_player_stats ON public.leaderboard_players;
CREATE TRIGGER trg_auto_calculate_player_stats
  BEFORE INSERT OR UPDATE ON public.leaderboard_players
  FOR EACH ROW EXECUTE FUNCTION auto_calculate_player_stats();

-- ==============================================================================
-- SUPABASE AUTH FUNCTIONS & ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Helper function to check if current user is an active admin or service_role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Service role and postgres superuser always have administrative access
  IF (current_user = 'postgres' OR auth.role() = 'service_role') THEN
    RETURN true;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid() AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function to check if current user is a superadmin or service_role
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  IF (current_user = 'postgres' OR auth.role() = 'service_role') THEN
    RETURN true;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Enable RLS across all tables
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- 1. Tournaments Policies
DROP POLICY IF EXISTS "Public tournaments viewable by everyone" ON public.tournaments;
CREATE POLICY "Public tournaments viewable by everyone" 
  ON public.tournaments FOR SELECT 
  USING (is_visible = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin write access for tournaments" ON public.tournaments;
CREATE POLICY "Admin write access for tournaments" 
  ON public.tournaments FOR ALL 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2. Registrations Policies
DROP POLICY IF EXISTS "Public registration submission" ON public.registrations;
CREATE POLICY "Public registration submission" 
  ON public.registrations FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public ticket lookup" ON public.registrations;
CREATE POLICY "Public ticket lookup" 
  ON public.registrations FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Admin write access for registrations" ON public.registrations;
CREATE POLICY "Admin write access for registrations" 
  ON public.registrations FOR UPDATE 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin delete access for registrations" ON public.registrations;
CREATE POLICY "Admin delete access for registrations" 
  ON public.registrations FOR DELETE 
  USING (public.is_admin());

-- 3. Leaderboard Players Policies
DROP POLICY IF EXISTS "Public leaderboard viewable by everyone" ON public.leaderboard_players;
CREATE POLICY "Public leaderboard viewable by everyone" 
  ON public.leaderboard_players FOR SELECT 
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin write access for leaderboard" ON public.leaderboard_players;
CREATE POLICY "Admin write access for leaderboard" 
  ON public.leaderboard_players FOR ALL 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. Announcements Policies
DROP POLICY IF EXISTS "Public announcements viewable by everyone" ON public.announcements;
CREATE POLICY "Public announcements viewable by everyone" 
  ON public.announcements FOR SELECT 
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin write access for announcements" ON public.announcements;
CREATE POLICY "Admin write access for announcements" 
  ON public.announcements FOR ALL 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. Admin Settings Policies
DROP POLICY IF EXISTS "Public admin settings viewable" ON public.admin_settings;
CREATE POLICY "Public admin settings viewable" 
  ON public.admin_settings FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Admin write access for settings" ON public.admin_settings;
CREATE POLICY "Admin write access for settings" 
  ON public.admin_settings FOR ALL 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 6. Admin Profiles Policies
DROP POLICY IF EXISTS "Admin view own profile" ON public.admin_profiles;
CREATE POLICY "Admin view own profile" 
  ON public.admin_profiles FOR SELECT 
  USING (auth.uid() = id OR public.is_superadmin());

DROP POLICY IF EXISTS "Superadmin manage admin profiles" ON public.admin_profiles;
CREATE POLICY "Superadmin manage admin profiles" 
  ON public.admin_profiles FOR ALL 
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

-- ==============================================================================
-- SEED INITIAL DATA (IDEMPOTENT INSERTIONS)
-- ==============================================================================

-- 1. Seed Tournaments
INSERT INTO public.tournaments (
  id, title, date, target_date, time, venue, format, prize_pool, slots, max_slots, registered_count, is_featured, is_visible, description, status, entry_fee, arbiter_name, contact_email, contact_phone
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
  true,
  'State-level rapid circuit leg sanctioned for collegiate and open category rated players. Electronic DGT boards for top 4 tables.',
  'closing_soon',
  '₹150 All Players',
  'IA S. Banerjee',
  'tournaments@chaturanga-jgec.ac.in',
  '+91 98320 67890'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Leaderboard Players (with Chess.com handles ready for live sync)
INSERT INTO public.leaderboard_players (
  id, rank, name, roll_number, department, year, fide_id, chess_username, chess_com_username, title,
  rapid_elo, blitz_elo, classical_elo, bullet_elo, peak_elo,
  matches_played, wins, draws, losses, win_rate, tournaments_won,
  recent_form, avatar_color, chess_piece
) VALUES
(
  'player-1', 1, 'Aritra Sen', '22101104012', 'CSE', '3rd Year', '50291844', 'aritra_gambit', 'aritra_gambit', 'Club Champion',
  2185, 2210, 2150, 2100, 2240,
  48, 38, 7, 3, 86.5, 5,
  '["W", "W", "W", "D", "W"]'::jsonb, 'from-[#D4AF7C] to-[#E6C98A]', 'King'
),
(
  'player-2', 2, 'Debanjan Ghosh', '23101102008', 'IT', '2nd Year', '50314890', 'debanjan_knight', 'debanjan_knight', 'Candidate Master',
  2095, 2140, 2060, 2020, 2155,
  42, 32, 6, 4, 83.3, 3,
  '["W", "W", "D", "W", "W"]'::jsonb, 'from-amber-400 to-yellow-600', 'Queen'
),
(
  'player-3', 3, 'Rohan Mukherjee', '21101101004', 'ECE', '4th Year', '50271109', 'rohan_rook', 'rohan_rook', 'Collegiate Master',
  2040, 2010, 2075, 1980, 2100,
  56, 40, 10, 6, 80.4, 4,
  '["D", "W", "W", "W", "D"]'::jsonb, 'from-orange-400 to-amber-700', 'Rook'
),
(
  'player-4', 4, 'Sayanika Roy', '24101103019', 'ECE', '1st Year', 'Unrated', 'sayanika_queen', 'sayanika_queen', 'Club Expert',
  1980, 2025, 1940, 1910, 2030,
  28, 21, 4, 3, 82.1, 2,
  '["W", "W", "W", "L", "W"]'::jsonb, 'from-emerald-400 to-teal-600', 'Bishop'
),
(
  'player-5', 5, 'Tanmoy Barman', '22101105023', 'ME', '3rd Year', 'Unrated', 'tanmoy_sicilian', 'tanmoy_sicilian', 'Club Expert',
  1920, 1890, 1945, 1850, 1970,
  36, 25, 6, 5, 77.8, 1,
  '["W", "D", "W", "W", "L"]'::jsonb, 'from-blue-400 to-indigo-600', 'Knight'
),
(
  'player-6', 6, 'Sneha Paul', '23101106015', 'CE', '2nd Year', 'Unrated', 'sneha_endgame', 'sneha_endgame', 'Club Expert',
  1875, 1840, 1900, 1800, 1910,
  30, 20, 5, 5, 75.0, 1,
  '["W", "W", "L", "W", "D"]'::jsonb, 'from-purple-400 to-pink-600', 'Knight'
),
(
  'player-7', 7, 'Subhadip Das', '22101107011', 'EE', '3rd Year', 'Unrated', 'subhadip_tactics', 'subhadip_tactics', 'Club Member',
  1830, 1860, 1805, 1780, 1870,
  34, 21, 5, 8, 69.1, 0,
  '["L", "W", "W", "D", "W"]'::jsonb, 'from-rose-400 to-red-600', 'Bishop'
),
(
  'player-8', 8, 'Aniket Choudhury', '24101101032', 'CSE', '1st Year', 'Unrated', 'aniket_caro', 'aniket_caro', 'Club Member',
  1795, 1820, 1770, 1750, 1835,
  22, 14, 4, 4, 72.7, 0,
  '["W", "D", "W", "L", "W"]'::jsonb, 'from-cyan-400 to-blue-600', 'Rook'
)
ON CONFLICT (roll_number) DO UPDATE SET
  rank = EXCLUDED.rank,
  name = EXCLUDED.name,
  department = EXCLUDED.department,
  year = EXCLUDED.year,
  fide_id = EXCLUDED.fide_id,
  chess_username = EXCLUDED.chess_username,
  chess_com_username = EXCLUDED.chess_com_username,
  title = EXCLUDED.title,
  rapid_elo = EXCLUDED.rapid_elo,
  blitz_elo = EXCLUDED.blitz_elo,
  classical_elo = EXCLUDED.classical_elo,
  bullet_elo = EXCLUDED.bullet_elo,
  peak_elo = EXCLUDED.peak_elo,
  matches_played = EXCLUDED.matches_played,
  wins = EXCLUDED.wins,
  draws = EXCLUDED.draws,
  losses = EXCLUDED.losses,
  tournaments_won = EXCLUDED.tournaments_won,
  recent_form = EXCLUDED.recent_form,
  avatar_color = EXCLUDED.avatar_color,
  chess_piece = EXCLUDED.chess_piece;

-- 3. Seed Announcements
INSERT INTO public.announcements (
  id, title, category, date, badge_color, summary, content, is_urgent, link_text, link_url, is_active, display_order
) VALUES
(
  'ann-1',
  'Chaturanga Spring Blitz Open 2026: Registrations Now Live!',
  'TOURNAMENT',
  'April 02, 2026',
  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Registrations are open for the 7-round Swiss Rapid Championship on April 28, 2026. JGEC students enter free.',
  'All players must register online before April 25, 2026. Entry is 100% free for bona fide students of Jalpaiguri Government Engineering College. Bring valid student ID card on tournament day. Total prize pool is ₹25,000 with trophies across Top 5 open and Best Department.',
  true,
  'Register Now',
  '/register',
  true,
  1
),
(
  'ann-2',
  'Weekly Collegiate Practice Sessions & Clock Sparring in Room 204',
  'PRACTICE',
  'March 28, 2026',
  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Join us every Wednesday & Friday from 4:30 PM to 6:30 PM for digital DGT clock practice and grandmaster game analysis.',
  'Open to all years and skill levels. Beginners will be paired with rated club seniors for opening repertoire and tactical drills. Digital clocks and standard weighted Staunton pieces provided by the club.',
  false,
  'Explore Events',
  '/upcoming',
  true,
  2
),
(
  'ann-3',
  'Inter-College State Championship Trials Announced',
  'SELECTION',
  'March 20, 2026',
  'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Official college team selection trials for the West Bengal Inter-University Chess Meet will take place on May 10, 2026.',
  'Top 4 players from the selection tournament will represent Jalpaiguri Government Engineering College at the State Inter-University Championship with college sports sponsorship and travel allowance.',
  false,
  'View Calendar',
  '/#calendar',
  true,
  3
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  date = EXCLUDED.date,
  badge_color = EXCLUDED.badge_color,
  summary = EXCLUDED.summary,
  content = EXCLUDED.content,
  is_urgent = EXCLUDED.is_urgent,
  link_text = EXCLUDED.link_text,
  link_url = EXCLUDED.link_url,
  is_active = EXCLUDED.is_active;
