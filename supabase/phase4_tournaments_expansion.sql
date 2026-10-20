-- ==============================================================================
-- CHATURANGA JGEC - PHASE 4: TOURNAMENT FEATURE EXPANSION SCHEMA
-- Tables: tournament_rounds, tournament_matches, tournament_games
-- Enables Swiss round pairings, match results, round clocks, and PGN replay
-- ==============================================================================

-- 1. TOURNAMENT ROUNDS
CREATE TABLE IF NOT EXISTS public.tournament_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id TEXT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'in_progress', 'completed')),
  start_time TIMESTAMPTZ,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unq_tournament_round UNIQUE(tournament_id, round_number)
);

-- 2. TOURNAMENT MATCHES
CREATE TABLE IF NOT EXISTS public.tournament_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES public.tournament_rounds(id) ON DELETE CASCADE,
  tournament_id TEXT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  board_number INTEGER NOT NULL,
  white_player_id TEXT,
  white_player_name TEXT NOT NULL,
  black_player_id TEXT,
  black_player_name TEXT,
  result TEXT NOT NULL DEFAULT 'pending' CHECK (result IN ('pending', '1-0', '0.5-0.5', '0-1', '1F-0F', '0F-1F', '1-0_bye', '0.5-bye')),
  pgn TEXT,
  arbiter_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unq_round_board UNIQUE(round_id, board_number)
);

-- 3. TOURNAMENT GAMES (HISTORICAL & FEATURED PGN ARCHIVES)
CREATE TABLE IF NOT EXISTS public.tournament_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id TEXT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  white_player TEXT NOT NULL,
  black_player TEXT NOT NULL,
  result TEXT NOT NULL,
  pgn TEXT NOT NULL,
  event_name TEXT NOT NULL,
  round INTEGER NOT NULL DEFAULT 1,
  date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_rounds_tournament ON public.tournament_rounds(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_tournament ON public.tournament_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_round ON public.tournament_matches(round_id);
CREATE INDEX IF NOT EXISTS idx_games_tournament ON public.tournament_games(tournament_id);
