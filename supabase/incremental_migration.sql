-- ==============================================================================
-- CHATURANGA JGEC - INCREMENTAL MIGRATION
-- Tables: public.team_members, public.gallery
-- Row Level Security (RLS) & Seed Data
-- ==============================================================================

-- 1. Create TEAM_MEMBERS table
CREATE TABLE IF NOT EXISTS public.team_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('core', 'coordinator', 'mentor')),
  department TEXT,
  year TEXT,
  elo TEXT,
  fide_id TEXT,
  bio TEXT,
  responsibilities JSONB DEFAULT '[]'::jsonb,
  favorite_opening TEXT,
  achievements JSONB DEFAULT '[]'::jsonb,
  chess_piece TEXT DEFAULT 'Knight' CHECK (chess_piece IN ('King', 'Queen', 'Rook', 'Bishop', 'Knight')),
  avatar_color TEXT DEFAULT 'from-amber-400 to-yellow-600',
  title_badge TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create GALLERY table
CREATE TABLE IF NOT EXISTS public.gallery (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Tournaments', 'Awards', 'Blitz Night', 'Club Room')),
  date TEXT,
  tournament_name TEXT,
  description TEXT,
  image_src TEXT NOT NULL,
  aspect TEXT DEFAULT 'landscape' CHECK (aspect IN ('landscape', 'portrait', 'square')),
  tag TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_team_members_active ON public.team_members (is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_team_members_category ON public.team_members (category);
CREATE INDEX IF NOT EXISTS idx_gallery_active ON public.gallery (is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON public.gallery (category);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- Team Members Policies
DROP POLICY IF EXISTS "Public team members viewable by everyone" ON public.team_members;
CREATE POLICY "Public team members viewable by everyone" 
  ON public.team_members FOR SELECT 
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin write access for team members" ON public.team_members;
CREATE POLICY "Admin write access for team members" 
  ON public.team_members FOR ALL 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Gallery Policies
DROP POLICY IF EXISTS "Public gallery photos viewable by everyone" ON public.gallery;
CREATE POLICY "Public gallery photos viewable by everyone" 
  ON public.gallery FOR SELECT 
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin write access for gallery" ON public.gallery;
CREATE POLICY "Admin write access for gallery" 
  ON public.gallery FOR ALL 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- SEED DATA (IDEMPOTENT - ON CONFLICT DO NOTHING)
-- ==============================================================================

-- Seed Team Members
INSERT INTO public.team_members (
  id, name, role, category, department, year, elo, fide_id, bio, responsibilities, favorite_opening, achievements, chess_piece, avatar_color, title_badge, image_url, display_order, is_active
) VALUES
(
  'aniket-roy',
  'Aniket Roy',
  'President & Head Arbiter',
  'core',
  'Computer Science & Engineering',
  '4th Year',
  '2085 FIDE',
  '25048112',
  'Leading the chess club''s competitive operations and institutional collaborations. State Rapid finalist and collegiate championship gold medalist.',
  '["Overseeing collegiate tournament operations and FIDE arbiter alignments", "Mentoring club team for inter-college championships", "Coordinating with college administration and sports board"]'::jsonb,
  'Sicilian Defense (Najdorf Variation)',
  '["Winner - Autumn Swiss Cup 2025", "Gold Board 1 - North Bengal Inter-Tech Cup", "FIDE Arbiter Certified - Level 3"]'::jsonb,
  'King',
  'from-[#D4AF7C] via-[#E6C98A] to-[#B89355]',
  'Club President',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  1,
  true
),
(
  'ritwick-paul',
  'Ritwick Paul',
  'Vice President & Tournament Director',
  'core',
  'Electronics & Communication Engg',
  '4th Year',
  '2010 FIDE',
  '25061904',
  'Head of tournament logistics and Swiss pairings software. Passionate positional player specializing in deep endgame grinds.',
  '["Directing round pairings using Swiss-Manager systems", "Organizing weekly Stockfish analysis and blitz arenas", "Managing live DGT electronic broadcast board streams"]'::jsonb,
  'Queen''s Gambit Declined (Tartakower)',
  '["Runner-Up - Autumn Swiss Cup 2025", "Finalist - Bengal State Collegiate Derby", "Senior Arbiter - JGEC Annual Circuit"]'::jsonb,
  'Queen',
  'from-amber-400 to-yellow-600',
  'Tournament Director',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  2,
  true
),
(
  'suman-sen',
  'Suman Sen',
  'Technical Lead & Blitz Captain',
  'core',
  'Mechanical Engineering',
  '3rd Year',
  '1890 Elo',
  NULL,
  'Tactical wizard and aggressive attacking player. Directs the club''s technical platform, rating leaderboard, and puzzle challenge workshops.',
  '["Maintaining digital club leaderboards & player ratings", "Curating weekly grandmaster endgame studies and puzzle sets", "Leading collegiate blitz knockout arenas"]'::jsonb,
  'King''s Indian Defense (Mar del Plata)',
  '["Champion - Grand Blitz Summer Derby 2025", "Winner - North Bengal Speed Cup", "Puzzle Rush Club Record: 54 in 5 mins"]'::jsonb,
  'Rook',
  'from-blue-500 to-indigo-700',
  'Blitz Captain',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  3,
  true
),
(
  'priya-das',
  'Priya Das',
  'Events Head & Community Lead',
  'core',
  'Information Technology',
  '3rd Year',
  '1945 Elo',
  NULL,
  'Leading event outreach, registration workflows, and beginner discovery clinics. Passionate about collegiate female participation in competitive chess.',
  '["Coordinating player onboarding and registration desks", "Hosting ''Women in Chess'' discovery sessions & mentorship", "Public relations, prize distribution, and arbiter coordination"]'::jsonb,
  'Caro-Kann Defense (Classical)',
  '["4th Place - Autumn Swiss Cup 2025", "Captain - JGEC Women''s Collegiate Team", "Community Organizer of the Year 2025"]'::jsonb,
  'Bishop',
  'from-purple-500 to-pink-600',
  'Events Head',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  4,
  true
),
(
  'debjyoti-bose',
  'Debjyoti Bose',
  'Equipment & Logistics Coordinator',
  'coordinator',
  'Electrical Engineering',
  '2nd Year',
  '1720 Elo',
  NULL,
  'Manages club room equipment, Staunton tournament sets, and digital timers for all university sessions.',
  '["Inventory of weighted tournament boards and DGT clocks", "Club Room 204 open hours management", "Venue setup for flagship tournaments"]'::jsonb,
  'Ruy Lopez (Berlin Defense)',
  '["Top 5 - Autumn Swiss Cup 2025", "Best Junior Player - JGEC Intra 2024"]'::jsonb,
  'Knight',
  'from-emerald-500 to-teal-700',
  'Logistics Head',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
  5,
  true
),
(
  'sneha-mukherjee',
  'Sneha Mukherjee',
  'Outreach & Communications Lead',
  'coordinator',
  'Civil Engineering',
  '2nd Year',
  '1680 Elo',
  NULL,
  'Handles social media announcements, player spotlight stories, and tournament photography.',
  '["Publishing round summaries and highlight photos", "Managing club Discord and communications", "Coordinating with campus media club"]'::jsonb,
  'French Defense (Winawer)',
  '["6th Place - Autumn Swiss Cup 2025", "Inter-College Qualifier Participant"]'::jsonb,
  'Bishop',
  'from-rose-500 to-red-700',
  'Outreach Lead',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  6,
  true
),
(
  'abhirup-ghosh',
  'Abhirup Ghosh',
  'Ratings & Pairings Coordinator',
  'coordinator',
  'Electronics & Communication Engg',
  '2nd Year',
  '1810 Elo',
  NULL,
  'Handles tiebreak calculations, pairing displays, and verification of collegiate credentials.',
  '["Buchholz and Sonneborn-Berger verification", "Live score displays in the tournament hall", "Assisting chief arbiters in round transitions"]'::jsonb,
  'English Opening (Botvinnik System)',
  '["3rd Place - Grand Blitz Summer Derby 2025", "Rising Star Award 2025"]'::jsonb,
  'Rook',
  'from-cyan-500 to-blue-700',
  'Pairings Coordinator',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  7,
  true
),
(
  'dr-subhasis-saha',
  'Dr. S. Saha',
  'Faculty Advisor & Grand Patron',
  'mentor',
  'Department of Computer Science & Engg',
  'Faculty',
  'Former State Senior Representative',
  NULL,
  'Longstanding faculty mentor supporting mental sports and cognitive tactical training at JGEC for over a decade.',
  '["Institutional patron and administrative oversight", "Academic alignment with university sports committee", "Official representation in state collegiate federations"]'::jsonb,
  'Queen''s Indian Defense',
  '["Founding Faculty Mentor - CHATURANGA.JGEC", "Patron for 15+ State & Collegiate Championships"]'::jsonb,
  'King',
  'from-amber-600 via-orange-600 to-yellow-700',
  'Faculty Advisor',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
  8,
  true
)
ON CONFLICT (id) DO NOTHING;

-- Seed Gallery Photos
INSERT INTO public.gallery (
  id, title, category, date, tournament_name, description, image_src, aspect, tag, display_order, is_active
) VALUES
(
  'gal-1',
  'Final Round Board 1 Clash • Annual Championship 2025',
  'Tournaments',
  'November 2025',
  'Chaturanga Annual Championship 2025',
  'A tense Queen and Pawn endgame deciding the JGEC College Champion on Board 1 with 120 spectators observing.',
  'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80',
  'landscape',
  'Championship',
  1,
  true
),
(
  'gal-2',
  'Trophy Presentation by Principal & Chief Arbiter',
  'Awards',
  'November 2025',
  'Chaturanga Annual Championship 2025',
  'Champion Aritra Sen receiving the rolling gold cup and cash scholarship from IA Dr. P. K. Sen.',
  'https://images.unsplash.com/photo-1580541832626-2a7131ee809f?auto=format&fit=crop&w=1200&q=80',
  'landscape',
  'Medal & Trophy',
  2,
  true
),
(
  'gal-3',
  'Midnight Blitz Arena • 3+2 Sudden Death',
  'Blitz Night',
  'January 2026',
  'New Year Midnight Blitz 2026',
  '32 students battling across 5 rounds of high-octane 3-minute blitz under the auditorium lights.',
  'https://images.unsplash.com/photo-1586165368502-1bad197a6461?auto=format&fit=crop&w=1200&q=80',
  'square',
  'Blitz',
  3,
  true
),
(
  'gal-4',
  'Tactics & Opening Theory in Room 204',
  'Club Room',
  'February 2026',
  'Weekly Club Masterclass',
  'Club seniors breaking down Kasparov’s immortal Queen sacrifice on the demonstration magnetic board.',
  'https://images.unsplash.com/photo-1560174038-da43ac74f01b?auto=format&fit=crop&w=1200&q=80',
  'landscape',
  'Analysis',
  4,
  true
),
(
  'gal-5',
  'Main Hall Panorama: 64 Boards in Simultaneous Play',
  'Tournaments',
  'October 2025',
  'Inter-College Invitational 2025',
  'Over 120 collegiate players from North Bengal engineering colleges competing in Round 4.',
  'https://images.unsplash.com/photo-1528819622765-d6bcf132f793?auto=format&fit=crop&w=1200&q=80',
  'landscape',
  '64 Boards',
  5,
  true
),
(
  'gal-6',
  'Best Female Player Award & Runner-Up Podium',
  'Awards',
  'October 2025',
  'Inter-College Invitational 2025',
  'Sayanika Roy and Debanjan Ghosh honored on stage by the Sports Secretary with commemorative shields.',
  'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80',
  'square',
  'Podium',
  6,
  true
)
ON CONFLICT (id) DO NOTHING;
