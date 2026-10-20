import { MatchResult, RoundStatus } from './pairing';

export type DepartmentCode =
  | 'CSE'
  | 'IT'
  | 'ME'
  | 'EE'
  | 'ECE'
  | 'CE'
  | string;

export interface TeamPlayer {
  id: string;
  name: string;
  roll?: string;
  rating: number;
  fide_id?: string | null;
  board_number: number; // 1-4 for main boards, 5-6 for reserves
  is_reserve: boolean;
  department_code: DepartmentCode;
}

export interface DepartmentTeam {
  id: string;
  tournament_id: string;
  department_code: DepartmentCode;
  department_name: string;
  captain_name: string;
  captain_contact?: string;
  roster: TeamPlayer[];
  seed_rating?: number;
  created_at?: string;
  updated_at?: string;
}

export interface BoardPairing {
  board_number: number; // 1 to 4
  white_player: TeamPlayer;
  black_player: TeamPlayer;
  result: MatchResult;
  pgn?: string | null;
  notes?: string | null;
}

export type TeamMatchOutcome =
  | 'pending'
  | 'white_win'
  | 'black_win'
  | 'draw'
  | 'bye';

export interface TeamMatch {
  id: string;
  tournament_id: string;
  round_number: number;
  table_number: number;
  white_team_id: string;
  white_team_name: string;
  white_team_dept: DepartmentCode;
  black_team_id?: string | null; // null if bye
  black_team_name?: string | null;
  black_team_dept?: DepartmentCode | null;
  boards: BoardPairing[];
  is_bye: boolean;
  outcome: TeamMatchOutcome;
  white_game_points: number;
  black_game_points: number;
  white_match_points: number;
  black_match_points: number;
  created_at?: string;
  updated_at?: string;
}

export interface TeamRound {
  id: string;
  tournament_id: string;
  round_number: number;
  status: RoundStatus;
  start_time?: string | null;
  matches: TeamMatch[];
  created_at?: string;
  updated_at?: string;
}

export interface TeamStanding {
  rank: number;
  team_id: string;
  department_code: DepartmentCode;
  department_name: string;
  captain_name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  match_points: number; // 2 for W, 1 for D, 0 for L
  game_points: number;  // sum of board points (0.0 to 4.0 per match)
  sonneborn_berger: number;
  buchholz: number;
  direct_encounter_record?: Record<string, 'W' | 'D' | 'L'>;
}
