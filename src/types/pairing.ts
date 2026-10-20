export type MatchResult =
  | 'pending'
  | '1-0'
  | '0.5-0.5'
  | '0-1'
  | '1F-0F'
  | '0F-1F'
  | '1-0_bye'
  | '0.5-bye';

export type RoundStatus = 'draft' | 'published' | 'in_progress' | 'completed';

export interface TournamentMatch {
  id: string;
  round_id: string;
  tournament_id: string;
  board_number: number;
  white_player_id?: string | null;
  white_player_name: string;
  black_player_id?: string | null;
  black_player_name?: string | null;
  result: MatchResult;
  pgn?: string | null;
  arbiter_notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TournamentRound {
  id: string;
  tournament_id: string;
  round_number: number;
  status: RoundStatus;
  start_time?: string | null;
  duration_minutes: number;
  created_at?: string;
  updated_at?: string;
  matches?: TournamentMatch[];
}

export interface TournamentGame {
  id: string;
  tournament_id: string;
  white_player: string;
  black_player: string;
  result: string;
  pgn: string;
  event_name: string;
  round: number;
  date?: string | null;
  created_at?: string;
}

export interface PairingPlayer {
  id: string;
  name: string;
  rating?: number;
  fide_id?: string | null;
  points?: number;
  color_history?: ('W' | 'B' | 'BYE')[];
  opponents?: string[];
  had_bye?: boolean;
}

export interface TieBreakScores {
  buchholz: number;
  buchholzCut1: number;
  directEncounter: number;
  sonnebornBerger: number;
}

export interface PlayerStanding {
  rank: number;
  playerId: string;
  playerName: string;
  points: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  tieBreaks: TieBreakScores;
}
