import { Chess } from 'chess.js';
import { TournamentGame } from '@/types/pairing';

export interface ParsedMove {
  ply: number;
  moveNumber: number;
  color: 'w' | 'b';
  san: string;
  from: string;
  to: string;
  fen: string;
  piece: string;
  captured?: string;
  promotion?: string;
}

export interface ParsedPgnGame {
  headers: Record<string, string>;
  white: string;
  black: string;
  result: string;
  event: string;
  date: string;
  round: string;
  eco?: string;
  moves: ParsedMove[];
  initialFen: string;
  finalFen: string;
}

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

/**
 * Parses a PGN string into structured headers and step-by-step moves with board FEN states
 */
export function parsePgn(pgnText: string): ParsedPgnGame {
  const chess = new Chess();

  let valid = false;
  try {
    chess.loadPgn(pgnText);
    valid = true;
  } catch (err) {
    console.warn('Failed to parse full PGN, attempting sanitized parse:', err);
  }

  // If loading failed, fallback to fresh chess board
  if (!valid) {
    return {
      headers: { Event: 'Casual Game', White: 'White', Black: 'Black', Result: '*' },
      white: 'White',
      black: 'Black',
      result: '*',
      event: 'Casual Game',
      date: new Date().toISOString().slice(0, 10),
      round: '1',
      moves: [],
      initialFen: STARTING_FEN,
      finalFen: STARTING_FEN,
    };
  }

  const rawHeaders = chess.header();
  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawHeaders)) {
    if (v !== undefined && v !== null) headers[k] = String(v);
  }

  const white = headers['White'] || 'White';
  const black = headers['Black'] || 'Black';
  const result = headers['Result'] || '*';
  const event = headers['Event'] || 'Tournament Game';
  const date = headers['Date'] || new Date().toISOString().slice(0, 10);
  const round = headers['Round'] || '1';
  const eco = headers['ECO'];

  // Replay moves to record FEN after each move
  const historyMoves = chess.history({ verbose: true });
  const replay = new Chess();
  const parsedMoves: ParsedMove[] = [];

  for (let i = 0; i < historyMoves.length; i++) {
    const m = historyMoves[i];
    replay.move(m.san);

    parsedMoves.push({
      ply: i + 1,
      moveNumber: Math.floor(i / 2) + 1,
      color: m.color,
      san: m.san,
      from: m.from,
      to: m.to,
      fen: replay.fen(),
      piece: m.piece,
      captured: m.captured,
      promotion: m.promotion,
    });
  }

  return {
    headers,
    white,
    black,
    result,
    event,
    date,
    round,
    eco,
    moves: parsedMoves,
    initialFen: STARTING_FEN,
    finalFen: replay.fen(),
  };
}

export const SEED_GAMES: TournamentGame[] = [
  {
    id: 'game-autumn-2025-finals',
    tournament_id: 'autumn-swiss-2025',
    white_player: 'Aniket Roy (CSE)',
    black_player: 'Ritwick Paul (ECE)',
    result: '1-0',
    event_name: 'Autumn Swiss Cup 2025 - Finals',
    round: 7,
    date: '2025-09-18',
    pgn: `[Event "Autumn Swiss Cup 2025 - Finals"]
[Site "Jalpaiguri GEC Auditorium"]
[Date "2025.09.18"]
[Round "7"]
[White "Aniket Roy (CSE)"]
[Black "Ritwick Paul (ECE)"]
[Result "1-0"]
[ECO "C50"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. d3 Nf6 5. c3 d6 6. O-O a6 7. a4 Ba7 8. Re1 O-O 9. Nbd2 Be6 10. Bxe6 fxe6 11. Nf1 Qe8 12. Be3 Bxe3 13. Rxe3 Nh5 14. d4 exd4 15. cxd4 Nf4 16. Ng3 e5 17. dxe5 dxe5 18. Qb3+ Kh8 19. Qxb7 Nd4 20. Nxd4 exd4 21. Rf3 Rb8 22. Qxc7 Nh3+ 23. gxh3 Rxf3 24. Nf5 Qg8 25. Rd1 Rxb2 26. Rxd4 Rfxf2 27. Rd8 Rg2+ 28. Kh1 Rxh2+ 29. Qxh2 Rxh2+ 30. Kxh2 Qxd8 1-0`,
  },
  {
    id: 'game-blitz-2025-finals',
    tournament_id: 'grand-blitz-2025',
    white_player: 'Suman Sen (ME)',
    black_player: 'Aniket Roy (CSE)',
    result: '1-0',
    event_name: 'Grand Blitz Summer Derby 2025 - Finals Game 4',
    round: 4,
    date: '2025-06-22',
    pgn: `[Event "Grand Blitz Summer Derby 2025 - Finals Game 4"]
[Site "JGEC SAC Room 204"]
[Date "2025.06.22"]
[Round "4"]
[White "Suman Sen (ME)"]
[Black "Aniket Roy (CSE)"]
[Result "1-0"]
[ECO "B01"]

1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 4. d4 Nf6 5. Nf3 c6 6. Bc4 Bf5 7. Bd2 e6 8. Nd5 Qd8 9. Nxf6+ Qxf6 10. Qe2 Bg4 11. O-O-O Nd7 12. d5 cxd5 13. Bxd5 Bxf3 14. Bxf3 Ba3 15. c3 Bc5 16. Bxb7 Rb8 17. Bc6 Ke7 18. Bxd7 Kxd7 19. Bg5+ 1-0`,
  },
];
