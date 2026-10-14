export type Department = 'CSE' | 'IT' | 'ECE' | 'ME' | 'CE' | 'EE' | string;
export type AcademicYear = '1st Year' | '2nd Year' | '3rd Year' | '4th Year' | 'Alumni' | string;
export type ClubTitle = 'Club Champion' | 'Candidate Master' | 'Collegiate Master' | 'Arbiter' | 'Club Expert' | 'Club Member' | string;
export type ChessPiece = 'King' | 'Queen' | 'Rook' | 'Bishop' | 'Knight';

export interface LeaderboardPlayer {
  rank: number;
  id: string;
  name: string;
  rollNumber: string;
  department: Department;
  year: AcademicYear;
  fideId?: string;
  chessUsername?: string;
  lichessUsername?: string;
  title?: ClubTitle;
  rating: {
    rapid: number;
    blitz: number;
    classical: number;
    bullet?: number;
    peak: number;
  };
  stats: {
    matchesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    winRate: number; // percentage
    tournamentsWon: number;
  };
  recentForm: ('W' | 'D' | 'L')[];
  avatarColor: string;
  chessPiece: ChessPiece;
  // Chess.com Live Sync Data
  chessComUsername?: string;
  chessComVerified?: boolean;
  chessComLastSyncedAt?: string;
  chessComBlitzRating?: number;
  chessComRapidRating?: number;
  chessComBulletRating?: number;
  chessComPuzzleRating?: number;
  chessComAvatarUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
