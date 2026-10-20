import { supabaseServer } from '@/lib/supabase/server';
import {
  MatchResult,
  RoundStatus,
  TournamentMatch,
  TournamentRound,
} from '@/types/pairing';
import {
  TournamentMatchInsert,
  TournamentMatchRow,
  TournamentRoundInsert,
  TournamentRoundRow,
} from '@/types/database';

export function dbToRound(row: TournamentRoundRow, matches: TournamentMatch[] = []): TournamentRound {
  return {
    id: row.id,
    tournament_id: row.tournament_id,
    round_number: row.round_number,
    status: row.status as RoundStatus,
    start_time: row.start_time || undefined,
    duration_minutes: row.duration_minutes ?? 60,
    created_at: row.created_at || undefined,
    updated_at: row.updated_at || undefined,
    matches,
  };
}

export function dbToMatch(row: TournamentMatchRow): TournamentMatch {
  return {
    id: row.id,
    round_id: row.round_id,
    tournament_id: row.tournament_id,
    board_number: row.board_number,
    white_player_id: row.white_player_id || undefined,
    white_player_name: row.white_player_name,
    black_player_id: row.black_player_id || undefined,
    black_player_name: row.black_player_name || undefined,
    result: row.result as MatchResult,
    pgn: row.pgn || undefined,
    arbiter_notes: row.arbiter_notes || undefined,
    created_at: row.created_at || undefined,
    updated_at: row.updated_at || undefined,
  };
}

// In-memory fallback cache for development & testing
const devRoundsStore: Map<string, TournamentRound> = new Map();
const devMatchesStore: Map<string, TournamentMatch> = new Map();

export function clearPairingsDevCache() {
  devRoundsStore.clear();
  devMatchesStore.clear();
}

/**
 * Handle Supabase errors uniformly with fail-fast in production
 */
function handleDbError(action: string, error: any) {
  console.error(`Supabase error during ${action}:`, error);
  if (process.env.NODE_ENV === 'production') {
    const prodErr = new Error(`Database service unavailable in production: ${error.message || error}`);
    (prodErr as any).status = 503;
    throw prodErr;
  }
}

/**
 * Retrieve all rounds for a tournament, including all matches
 */
export async function getRoundsByTournament(tournamentId: string): Promise<TournamentRound[]> {
  try {
    const { data: roundRows, error: roundErr } = await supabaseServer
      .from('tournament_rounds')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('round_number', { ascending: true });

    if (roundErr) {
      handleDbError('getRoundsByTournament', roundErr);
    } else if (roundRows && roundRows.length > 0) {
      const roundIds = (roundRows as TournamentRoundRow[]).map(r => r.id);
      const { data: matchRows, error: matchErr } = await supabaseServer
        .from('tournament_matches')
        .select('*')
        .in('round_id', roundIds)
        .order('board_number', { ascending: true });

      if (matchErr) {
        handleDbError('getRoundMatches', matchErr);
      }

      const matchesByRound = new Map<string, TournamentMatch[]>();
      ((matchRows || []) as TournamentMatchRow[]).forEach(m => {
        const match = dbToMatch(m);
        if (!matchesByRound.has(match.round_id)) {
          matchesByRound.set(match.round_id, []);
        }
        matchesByRound.get(match.round_id)!.push(match);
      });

      return (roundRows as TournamentRoundRow[]).map(r => dbToRound(r, matchesByRound.get(r.id) || []));
    }
  } catch (err: any) {
    if (err.status === 503) throw err;
    if (process.env.NODE_ENV === 'production') {
      const prodErr = new Error(`Database service unavailable in production: ${err.message}`);
      (prodErr as any).status = 503;
      throw prodErr;
    }
  }

  // Fallback to local dev memory store
  const rounds = Array.from(devRoundsStore.values())
    .filter(r => r.tournament_id === tournamentId)
    .sort((a, b) => a.round_number - b.round_number);

  return rounds.map(r => ({
    ...r,
    matches: Array.from(devMatchesStore.values())
      .filter(m => m.round_id === r.id)
      .sort((a, b) => a.board_number - b.board_number),
  }));
}

/**
 * Retrieve matches for a specific round
 */
export async function getRoundMatches(roundId: string): Promise<TournamentMatch[]> {
  try {
    const { data, error } = await supabaseServer
      .from('tournament_matches')
      .select('*')
      .eq('round_id', roundId)
      .order('board_number', { ascending: true });

    if (error) {
      handleDbError('getRoundMatches', error);
    } else if (data) {
      return data.map(dbToMatch);
    }
  } catch (err: any) {
    if (err.status === 503) throw err;
    if (process.env.NODE_ENV === 'production') {
      const prodErr = new Error(`Database service unavailable in production: ${err.message}`);
      (prodErr as any).status = 503;
      throw prodErr;
    }
  }

  return Array.from(devMatchesStore.values())
    .filter(m => m.round_id === roundId)
    .sort((a, b) => a.board_number - b.board_number);
}

/**
 * Creates a new tournament round draft with optional initial matches
 */
export async function createRound(
  roundData: Partial<TournamentRound> & { tournament_id: string; round_number: number }
): Promise<TournamentRound> {
  const roundId = roundData.id || `round-${roundData.tournament_id}-r${roundData.round_number}-${Date.now()}`;
  const status: RoundStatus = roundData.status || 'draft';
  const duration = roundData.duration_minutes || 60;
  const now = new Date().toISOString();

  const roundRecord: TournamentRound = {
    id: roundId,
    tournament_id: roundData.tournament_id,
    round_number: roundData.round_number,
    status,
    start_time: roundData.start_time,
    duration_minutes: duration,
    created_at: now,
    updated_at: now,
    matches: [],
  };

  const matchesToInsert: TournamentMatch[] = (roundData.matches || []).map((m, idx) => ({
    ...m,
    id: m.id || `match-${roundId}-b${m.board_number || idx + 1}-${Date.now()}`,
    round_id: roundId,
    tournament_id: roundData.tournament_id,
    board_number: m.board_number || idx + 1,
    result: m.result || 'pending',
    created_at: now,
    updated_at: now,
  }));

  try {
    const insertRow: TournamentRoundInsert = {
      id: roundRecord.id,
      tournament_id: roundRecord.tournament_id,
      round_number: roundRecord.round_number,
      status: roundRecord.status,
      start_time: roundRecord.start_time || null,
      duration_minutes: roundRecord.duration_minutes,
      created_at: now,
      updated_at: now,
    };

    const { error: rErr } = await supabaseServer.from('tournament_rounds').insert([insertRow]);
    if (rErr) {
      handleDbError('createRound', rErr);
    } else if (matchesToInsert.length > 0) {
      const matchRows: TournamentMatchInsert[] = matchesToInsert.map(m => ({
        id: m.id,
        round_id: m.round_id,
        tournament_id: m.tournament_id,
        board_number: m.board_number,
        white_player_id: m.white_player_id || null,
        white_player_name: m.white_player_name,
        black_player_id: m.black_player_id || null,
        black_player_name: m.black_player_name || null,
        result: m.result,
        pgn: m.pgn || null,
        arbiter_notes: m.arbiter_notes || null,
        created_at: now,
        updated_at: now,
      }));

      const { error: mErr } = await supabaseServer.from('tournament_matches').insert(matchRows);
      if (mErr) {
        handleDbError('createRoundMatches', mErr);
      }
    }
  } catch (err: any) {
    if (err.status === 503) throw err;
    if (process.env.NODE_ENV === 'production') {
      const prodErr = new Error(`Database service unavailable in production: ${err.message}`);
      (prodErr as any).status = 503;
      throw prodErr;
    }
  }

  // Update in-memory dev cache
  roundRecord.matches = matchesToInsert;
  devRoundsStore.set(roundRecord.id, roundRecord);
  matchesToInsert.forEach(m => devMatchesStore.set(m.id, m));

  return roundRecord;
}

/**
 * Updates round details (e.g., status, start_time, duration)
 */
export async function updateRound(
  roundId: string,
  updates: Partial<TournamentRound>
): Promise<TournamentRound | null> {
  const now = new Date().toISOString();

  try {
    const updatePayload: Record<string, any> = {
      updated_at: now,
    };
    if (updates.status !== undefined) updatePayload.status = updates.status;
    if (updates.start_time !== undefined) updatePayload.start_time = updates.start_time;
    if (updates.duration_minutes !== undefined) updatePayload.duration_minutes = updates.duration_minutes;

    const { data, error } = await supabaseServer
      .from('tournament_rounds')
      .update(updatePayload)
      .eq('id', roundId)
      .select()
      .single();

    if (error) {
      handleDbError('updateRound', error);
    } else if (data) {
      const matches = await getRoundMatches(roundId);
      return dbToRound(data, matches);
    }
  } catch (err: any) {
    if (err.status === 503) throw err;
    if (process.env.NODE_ENV === 'production') {
      const prodErr = new Error(`Database service unavailable in production: ${err.message}`);
      (prodErr as any).status = 503;
      throw prodErr;
    }
  }

  // Dev cache fallback
  const existing = devRoundsStore.get(roundId);
  if (!existing) return null;

  const updated: TournamentRound = {
    ...existing,
    ...updates,
    id: existing.id,
    updated_at: now,
  };
  devRoundsStore.set(roundId, updated);
  return updated;
}

/**
 * Publishes a round draft, stamping start_time and activating countdown clock
 */
export async function publishRound(
  roundId: string,
  durationMinutes = 60
): Promise<TournamentRound | null> {
  const startTime = new Date().toISOString();
  return updateRound(roundId, {
    status: 'published',
    start_time: startTime,
    duration_minutes: durationMinutes,
  });
}

/**
 * Records or updates a match result entered by an arbiter
 */
export async function updateMatchResult(
  matchId: string,
  result: MatchResult,
  arbiterNotes?: string,
  pgn?: string
): Promise<TournamentMatch | null> {
  const now = new Date().toISOString();

  try {
    const updatePayload: Record<string, any> = {
      result,
      updated_at: now,
    };
    if (arbiterNotes !== undefined) updatePayload.arbiter_notes = arbiterNotes;
    if (pgn !== undefined) updatePayload.pgn = pgn;

    const { data, error } = await supabaseServer
      .from('tournament_matches')
      .update(updatePayload)
      .eq('id', matchId)
      .select()
      .single();

    if (error) {
      handleDbError('updateMatchResult', error);
    } else if (data) {
      return dbToMatch(data);
    }
  } catch (err: any) {
    if (err.status === 503) throw err;
    if (process.env.NODE_ENV === 'production') {
      const prodErr = new Error(`Database service unavailable in production: ${err.message}`);
      (prodErr as any).status = 503;
      throw prodErr;
    }
  }

  // Dev cache fallback
  const existing = devMatchesStore.get(matchId);
  if (!existing) return null;

  const updated: TournamentMatch = {
    ...existing,
    result,
    arbiter_notes: arbiterNotes !== undefined ? arbiterNotes : existing.arbiter_notes,
    pgn: pgn !== undefined ? pgn : existing.pgn,
    updated_at: now,
  };
  devMatchesStore.set(matchId, updated);
  return updated;
}

/**
 * Manual arbiter override: swaps players between two matches
 */
export async function manualSwapBoardPlayers(
  matchId1: string,
  matchId2: string,
  swapWhite: boolean
): Promise<boolean> {
  const m1 = devMatchesStore.get(matchId1);
  const m2 = devMatchesStore.get(matchId2);

  if (!m1 || !m2) return false;

  if (swapWhite) {
    const tempId = m1.white_player_id;
    const tempName = m1.white_player_name;
    m1.white_player_id = m2.white_player_id;
    m1.white_player_name = m2.white_player_name;
    m2.white_player_id = tempId;
    m2.white_player_name = tempName;
  } else {
    const tempId = m1.black_player_id;
    const tempName = m1.black_player_name;
    m1.black_player_id = m2.black_player_id;
    m1.black_player_name = m2.black_player_name;
    m2.black_player_id = tempId;
    m2.black_player_name = tempName;
  }

  try {
    await supabaseServer
      .from('tournament_matches')
      .update({
        white_player_id: m1.white_player_id || null,
        white_player_name: m1.white_player_name,
        black_player_id: m1.black_player_id || null,
        black_player_name: m1.black_player_name || null,
      })
      .eq('id', matchId1);

    await supabaseServer
      .from('tournament_matches')
      .update({
        white_player_id: m2.white_player_id || null,
        white_player_name: m2.white_player_name,
        black_player_id: m2.black_player_id || null,
        black_player_name: m2.black_player_name || null,
      })
      .eq('id', matchId2);
  } catch (err: any) {
    if (process.env.NODE_ENV === 'production') throw err;
  }

  return true;
}
