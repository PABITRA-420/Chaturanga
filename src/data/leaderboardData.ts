export interface LeaderboardPlayer {
  rank: number;
  id: string;
  name: string;
  rollNumber: string;
  department: 'CSE' | 'IT' | 'ECE' | 'ME' | 'CE' | 'EE';
  year: '1st Year' | '2nd Year' | '3rd Year' | '4th Year' | 'Alumni';
  fideId?: string;
  chessUsername?: string;
  title?: 'Club Champion' | 'Candidate Master' | 'Collegiate Master' | 'Arbiter' | 'Club Expert';
  rating: {
    rapid: number;
    blitz: number;
    classical: number;
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
  chessPiece: 'King' | 'Queen' | 'Rook' | 'Bishop' | 'Knight';
}

export const LEADERBOARD_PLAYERS: LeaderboardPlayer[] = [
  {
    rank: 1,
    id: 'player-1',
    name: 'Aritra Sen',
    rollNumber: '22101104012',
    department: 'CSE',
    year: '3rd Year',
    fideId: '50291844',
    chessUsername: 'aritra_gambit',
    title: 'Club Champion',
    rating: {
      rapid: 2185,
      blitz: 2210,
      classical: 2150,
      peak: 2240,
    },
    stats: {
      matchesPlayed: 48,
      wins: 38,
      draws: 7,
      losses: 3,
      winRate: 86.5,
      tournamentsWon: 5,
    },
    recentForm: ['W', 'W', 'W', 'D', 'W'],
    avatarColor: 'from-[#D4AF7C] to-[#E6C98A]',
    chessPiece: 'King'
  },
  {
    rank: 2,
    id: 'player-2',
    name: 'Debanjan Ghosh',
    rollNumber: '23101102008',
    department: 'IT',
    year: '2nd Year',
    fideId: '50314890',
    chessUsername: 'debanjan_knight',
    title: 'Candidate Master',
    rating: {
      rapid: 2095,
      blitz: 2140,
      classical: 2060,
      peak: 2155,
    },
    stats: {
      matchesPlayed: 42,
      wins: 32,
      draws: 6,
      losses: 4,
      winRate: 83.3,
      tournamentsWon: 3,
    },
    recentForm: ['W', 'W', 'D', 'W', 'W'],
    avatarColor: 'from-amber-400 to-yellow-600',
    chessPiece: 'Queen'
  },
  {
    rank: 3,
    id: 'player-3',
    name: 'Rohan Mukherjee',
    rollNumber: '21101101004',
    department: 'ECE',
    year: '4th Year',
    fideId: '50271109',
    chessUsername: 'rohan_rook',
    title: 'Collegiate Master',
    rating: {
      rapid: 2040,
      blitz: 2010,
      classical: 2075,
      peak: 2100,
    },
    stats: {
      matchesPlayed: 56,
      wins: 40,
      draws: 10,
      losses: 6,
      winRate: 80.4,
      tournamentsWon: 4,
    },
    recentForm: ['D', 'W', 'W', 'W', 'D'],
    avatarColor: 'from-orange-400 to-amber-700',
    chessPiece: 'Rook'
  },
  {
    rank: 4,
    id: 'player-4',
    name: 'Sayanika Roy',
    rollNumber: '24101103019',
    department: 'ECE',
    year: '1st Year',
    chessUsername: 'sayanika_queen',
    title: 'Club Expert',
    rating: {
      rapid: 1980,
      blitz: 2025,
      classical: 1940,
      peak: 2030,
    },
    stats: {
      matchesPlayed: 28,
      wins: 21,
      draws: 4,
      losses: 3,
      winRate: 82.1,
      tournamentsWon: 2,
    },
    recentForm: ['W', 'W', 'W', 'L', 'W'],
    avatarColor: 'from-emerald-400 to-teal-600',
    chessPiece: 'Bishop'
  },
  {
    rank: 5,
    id: 'player-5',
    name: 'Tanmoy Barman',
    rollNumber: '22101105023',
    department: 'ME',
    year: '3rd Year',
    chessUsername: 'tanmoy_sicilian',
    title: 'Club Expert',
    rating: {
      rapid: 1920,
      blitz: 1890,
      classical: 1945,
      peak: 1970,
    },
    stats: {
      matchesPlayed: 36,
      wins: 25,
      draws: 6,
      losses: 5,
      winRate: 77.8,
      tournamentsWon: 1,
    },
    recentForm: ['W', 'D', 'W', 'W', 'L'],
    avatarColor: 'from-blue-400 to-indigo-600',
    chessPiece: 'Knight'
  },
  {
    rank: 6,
    id: 'player-6',
    name: 'Sneha Paul',
    rollNumber: '23101106015',
    department: 'CE',
    year: '2nd Year',
    chessUsername: 'sneha_endgame',
    title: 'Club Expert',
    rating: {
      rapid: 1875,
      blitz: 1840,
      classical: 1900,
      peak: 1910,
    },
    stats: {
      matchesPlayed: 30,
      wins: 20,
      draws: 5,
      losses: 5,
      winRate: 75.0,
      tournamentsWon: 1,
    },
    recentForm: ['W', 'W', 'L', 'W', 'D'],
    avatarColor: 'from-purple-400 to-pink-600',
    chessPiece: 'Knight'
  },
  {
    rank: 7,
    id: 'player-7',
    name: 'Subhadip Das',
    rollNumber: '22101107011',
    department: 'EE',
    year: '3rd Year',
    chessUsername: 'subhadip_tactics',
    rating: {
      rapid: 1830,
      blitz: 1860,
      classical: 1805,
      peak: 1870,
    },
    stats: {
      matchesPlayed: 34,
      wins: 21,
      draws: 5,
      losses: 8,
      winRate: 69.1,
      tournamentsWon: 0,
    },
    recentForm: ['L', 'W', 'W', 'D', 'W'],
    avatarColor: 'from-rose-400 to-red-600',
    chessPiece: 'Bishop'
  },
  {
    rank: 8,
    id: 'player-8',
    name: 'Aniket Choudhury',
    rollNumber: '24101101032',
    department: 'CSE',
    year: '1st Year',
    chessUsername: 'aniket_caro',
    rating: {
      rapid: 1795,
      blitz: 1820,
      classical: 1770,
      peak: 1835,
    },
    stats: {
      matchesPlayed: 22,
      wins: 14,
      draws: 4,
      losses: 4,
      winRate: 72.7,
      tournamentsWon: 0,
    },
    recentForm: ['W', 'D', 'W', 'L', 'W'],
    avatarColor: 'from-cyan-400 to-blue-600',
    chessPiece: 'Rook'
  }
];
