import { supabaseServer } from '@/lib/supabase/server';
import { TournamentGame } from '@/types/pairing';
import { TournamentGameInsert, TournamentGameRow } from '@/types/database';
import { SEED_GAMES } from '@/lib/pgnParser';

export * from '@/lib/pgnParser';

const devGamesStore: Map<string, TournamentGame> = new Map();
SEED_GAMES.forEach(g => devGamesStore.set(g.id, g));

export function clearGamesDevCache() {
  devGamesStore.clear();
  SEED_GAMES.forEach(g => devGamesStore.set(g.id, g));
}

export function dbToGame(row: TournamentGameRow): TournamentGame {
  return {
    id: row.id,
    tournament_id: row.tournament_id,
    white_player: row.white_player,
    black_player: row.black_player,
    result: row.result,
    pgn: row.pgn,
    event_name: row.event_name,
    round: row.round,
    date: row.date || undefined,
    created_at: row.created_at || undefined,
  };
}

/**
 * Retrieve all featured or recorded games for a tournament
 */
export async function getTournamentGames(tournamentId: string): Promise<TournamentGame[]> {
  try {
    const { data, error } = await supabaseServer
      .from('tournament_games')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('created_at', { ascending: false });

    if (error) {
      if (process.env.NODE_ENV === 'production') {
        const prodErr = new Error(`Database service unavailable in production: ${error.message}`);
        (prodErr as any).status = 503;
        throw prodErr;
      }
    } else if (data && data.length > 0) {
      return (data as TournamentGameRow[]).map(dbToGame);
    }
  } catch (err: any) {
    if (err.status === 503) throw err;
    if (process.env.NODE_ENV === 'production') {
      const prodErr = new Error(`Database service unavailable in production: ${err.message}`);
      (prodErr as any).status = 503;
      throw prodErr;
    }
  }

  // Fallback dev seeds
  return Array.from(devGamesStore.values()).filter(g => g.tournament_id === tournamentId);
}

/**
 * Retrieve single game by ID
 */
export async function getGameById(gameId: string): Promise<TournamentGame | null> {
  try {
    const { data, error } = await supabaseServer
      .from('tournament_games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (error) {
      if (process.env.NODE_ENV === 'production') {
        const prodErr = new Error(`Database service unavailable in production: ${error.message}`);
        (prodErr as any).status = 503;
        throw prodErr;
      }
    } else if (data) {
      return dbToGame(data as TournamentGameRow);
    }
  } catch (err: any) {
    if (err.status === 503) throw err;
    if (process.env.NODE_ENV === 'production') {
      const prodErr = new Error(`Database service unavailable in production: ${err.message}`);
      (prodErr as any).status = 503;
      throw prodErr;
    }
  }

  return devGamesStore.get(gameId) || null;
}

/**
 * Save a new tournament PGN game record
 */
export async function saveGame(
  game: Partial<TournamentGame> & {
    tournament_id: string;
    white_player: string;
    black_player: string;
    pgn: string;
  }
): Promise<TournamentGame> {
  const gameId = game.id || `game-${Date.now()}`;
  const now = new Date().toISOString();

  const record: TournamentGame = {
    id: gameId,
    tournament_id: game.tournament_id,
    white_player: game.white_player,
    black_player: game.black_player,
    result: game.result || '*',
    pgn: game.pgn,
    event_name: game.event_name || 'Tournament Game',
    round: game.round ?? 1,
    date: game.date || now.slice(0, 10),
    created_at: now,
  };

  try {
    const row: TournamentGameInsert = {
      id: record.id,
      tournament_id: record.tournament_id,
      white_player: record.white_player,
      black_player: record.black_player,
      result: record.result,
      pgn: record.pgn,
      event_name: record.event_name,
      round: record.round,
      date: record.date || null,
      created_at: now,
    };

    const { error } = await supabaseServer.from('tournament_games').insert([row]);
    if (error && process.env.NODE_ENV === 'production') {
      const prodErr = new Error(`Database service unavailable in production: ${error.message}`);
      (prodErr as any).status = 503;
      throw prodErr;
    }
  } catch (err: any) {
    if (err.status === 503) throw err;
    if (process.env.NODE_ENV === 'production') {
      const prodErr = new Error(`Database service unavailable in production: ${err.message}`);
      (prodErr as any).status = 503;
      throw prodErr;
    }
  }

  devGamesStore.set(record.id, record);
  return record;
}
