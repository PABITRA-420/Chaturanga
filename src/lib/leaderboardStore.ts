import { supabaseServer } from '@/lib/supabase/server';
import { LEADERBOARD_PLAYERS } from '@/data/leaderboardData';
import { LeaderboardPlayer } from '@/types/leaderboard';
import { fetchChessComPlayerData } from '@/lib/chessComApi';

export * from '@/types/leaderboard';

function dbToPlayer(row: any): LeaderboardPlayer {
  return {
    id: row.id,
    rank: Number(row.rank || 1),
    name: row.name || 'Anonymous Player',
    rollNumber: row.roll_number || '',
    department: row.department || 'CSE',
    year: row.year || '1st Year',
    fideId: row.fide_id || 'Unrated',
    chessUsername: row.chess_username || row.chess_com_username || '',
    lichessUsername: row.lichess_username || '',
    title: row.title || 'Club Member',
    rating: {
      rapid: Number(row.rapid_elo ?? 1200),
      blitz: Number(row.blitz_elo ?? 1200),
      classical: Number(row.classical_elo ?? 1200),
      bullet: row.bullet_elo ? Number(row.bullet_elo) : undefined,
      peak: Number(row.peak_elo ?? 1200),
    },
    stats: {
      matchesPlayed: Number(row.matches_played ?? 0),
      wins: Number(row.wins ?? 0),
      draws: Number(row.draws ?? 0),
      losses: Number(row.losses ?? 0),
      winRate: Number(row.win_rate ?? 0),
      tournamentsWon: Number(row.tournaments_won ?? 0),
    },
    recentForm: Array.isArray(row.recent_form) ? row.recent_form : [],
    avatarColor: row.avatar_color || 'from-[#D4AF7C] to-[#E6C98A]',
    chessPiece: (row.chess_piece as any) || 'Knight',
    chessComUsername: row.chess_com_username || row.chess_username,
    chessComVerified: Boolean(row.chess_com_verified),
    chessComLastSyncedAt: row.chess_com_last_synced_at,
    chessComBlitzRating: row.chess_com_blitz_rating,
    chessComRapidRating: row.chess_com_rapid_rating,
    chessComBulletRating: row.chess_com_bullet_rating,
    chessComPuzzleRating: row.chess_com_puzzle_rating,
    chessComAvatarUrl: row.chess_com_avatar_url,
    isActive: row.is_active !== undefined ? Boolean(row.is_active) : true,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function playerToDb(p: Partial<LeaderboardPlayer>): any {
  const dbRecord: any = {};
  if (p.id) dbRecord.id = p.id;
  if (p.rank !== undefined) dbRecord.rank = p.rank;
  if (p.name !== undefined) dbRecord.name = p.name;
  if (p.rollNumber !== undefined) dbRecord.roll_number = p.rollNumber;
  if (p.department !== undefined) dbRecord.department = p.department;
  if (p.year !== undefined) dbRecord.year = p.year;
  if (p.fideId !== undefined) dbRecord.fide_id = p.fideId;
  if (p.chessUsername !== undefined) dbRecord.chess_username = p.chessUsername;
  if (p.chessComUsername !== undefined) dbRecord.chess_com_username = p.chessComUsername;
  if (p.lichessUsername !== undefined) dbRecord.lichess_username = p.lichessUsername;
  if (p.title !== undefined) dbRecord.title = p.title;

  if (p.rating) {
    if (p.rating.rapid !== undefined) dbRecord.rapid_elo = p.rating.rapid;
    if (p.rating.blitz !== undefined) dbRecord.blitz_elo = p.rating.blitz;
    if (p.rating.classical !== undefined) dbRecord.classical_elo = p.rating.classical;
    if (p.rating.bullet !== undefined) dbRecord.bullet_elo = p.rating.bullet;
    if (p.rating.peak !== undefined) dbRecord.peak_elo = p.rating.peak;
  }

  if (p.stats) {
    if (p.stats.matchesPlayed !== undefined) dbRecord.matches_played = p.stats.matchesPlayed;
    if (p.stats.wins !== undefined) dbRecord.wins = p.stats.wins;
    if (p.stats.draws !== undefined) dbRecord.draws = p.stats.draws;
    if (p.stats.losses !== undefined) dbRecord.losses = p.stats.losses;
    if (p.stats.winRate !== undefined) dbRecord.win_rate = p.stats.winRate;
    if (p.stats.tournamentsWon !== undefined) dbRecord.tournaments_won = p.stats.tournamentsWon;
  }

  if (p.recentForm !== undefined) dbRecord.recent_form = p.recentForm;
  if (p.avatarColor !== undefined) dbRecord.avatar_color = p.avatarColor;
  if (p.chessPiece !== undefined) dbRecord.chess_piece = p.chessPiece;
  if (p.chessComVerified !== undefined) dbRecord.chess_com_verified = p.chessComVerified;
  if (p.chessComLastSyncedAt !== undefined) dbRecord.chess_com_last_synced_at = p.chessComLastSyncedAt;
  if (p.chessComBlitzRating !== undefined) dbRecord.chess_com_blitz_rating = p.chessComBlitzRating;
  if (p.chessComRapidRating !== undefined) dbRecord.chess_com_rapid_rating = p.chessComRapidRating;
  if (p.chessComBulletRating !== undefined) dbRecord.chess_com_bullet_rating = p.chessComBulletRating;
  if (p.chessComPuzzleRating !== undefined) dbRecord.chess_com_puzzle_rating = p.chessComPuzzleRating;
  if (p.chessComAvatarUrl !== undefined) dbRecord.chess_com_avatar_url = p.chessComAvatarUrl;
  if (p.isActive !== undefined) dbRecord.is_active = p.isActive;
  dbRecord.updated_at = new Date().toISOString();

  return dbRecord;
}

/**
 * Fetch all leaderboard players sorted by rank or rating
 */
export async function getAllLeaderboardPlayers(sortBy: 'rapid' | 'blitz' | 'classical' | 'rank' = 'rapid'): Promise<LeaderboardPlayer[]> {
  try {
    let query = supabaseServer
      .from('leaderboard_players')
      .select('*')
      .eq('is_active', true);

    if (sortBy === 'blitz') {
      query = query.order('blitz_elo', { ascending: false });
    } else if (sortBy === 'classical') {
      query = query.order('classical_elo', { ascending: false });
    } else if (sortBy === 'rank') {
      query = query.order('rank', { ascending: true });
    } else {
      query = query.order('rapid_elo', { ascending: false });
    }

    const { data, error } = await query;
    if (!error && data !== null) {
      // Re-assign dynamic ranking 1..N based on active sort
      return data.map((row: any, idx: number) => ({
        ...dbToPlayer(row),
        rank: idx + 1
      }));
    }
    if (error) {
      console.warn('Supabase fetch leaderboard error:', error.message);
    }
  } catch (err) {
    console.warn('Supabase fetch leaderboard failed:', err);
  }

  return [];
}

/**
 * Get single player by ID
 */
export async function getLeaderboardPlayerById(id: string): Promise<LeaderboardPlayer | null> {
  try {
    const { data, error } = await supabaseServer
      .from('leaderboard_players')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!error) {
      return data ? dbToPlayer(data) : null;
    }
  } catch (err) {
    console.warn('Supabase getLeaderboardPlayerById error:', err);
  }

  return null;
}

/**
 * Create new player in Leaderboard
 */
export async function createLeaderboardPlayer(playerData: Partial<LeaderboardPlayer>): Promise<LeaderboardPlayer> {
  const newId = playerData.id || `player-${Date.now()}`;
  const totalExisting = (await getAllLeaderboardPlayers()).length;

  const player: LeaderboardPlayer = {
    id: newId,
    rank: playerData.rank || totalExisting + 1,
    name: playerData.name || 'Anonymous Player',
    rollNumber: playerData.rollNumber || `ROLL-${Math.floor(100000 + Math.random() * 900000)}`,
    department: playerData.department || 'CSE',
    year: playerData.year || '1st Year',
    fideId: playerData.fideId || 'Unrated',
    chessUsername: playerData.chessUsername || playerData.chessComUsername || '',
    chessComUsername: playerData.chessComUsername || playerData.chessUsername || '',
    lichessUsername: playerData.lichessUsername || '',
    title: playerData.title || 'Club Member',
    rating: {
      rapid: Number(playerData.rating?.rapid ?? 1200),
      blitz: Number(playerData.rating?.blitz ?? 1200),
      classical: Number(playerData.rating?.classical ?? 1200),
      bullet: playerData.rating?.bullet ? Number(playerData.rating.bullet) : 1200,
      peak: Number(playerData.rating?.peak ?? Math.max(playerData.rating?.rapid || 1200, playerData.rating?.blitz || 1200)),
    },
    stats: {
      matchesPlayed: Number(playerData.stats?.matchesPlayed ?? 0),
      wins: Number(playerData.stats?.wins ?? 0),
      draws: Number(playerData.stats?.draws ?? 0),
      losses: Number(playerData.stats?.losses ?? 0),
      winRate: Number(playerData.stats?.winRate ?? 0),
      tournamentsWon: Number(playerData.stats?.tournamentsWon ?? 0),
    },
    recentForm: playerData.recentForm || ['W'],
    avatarColor: playerData.avatarColor || 'from-[#D4AF7C] to-[#E6C98A]',
    chessPiece: (playerData.chessPiece as any) || 'Knight',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const dbRecord = playerToDb(player);
  const { data, error } = await supabaseServer
    .from('leaderboard_players')
    .insert([dbRecord])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create player in Supabase: ${error.message}`);
  }

  return dbToPlayer(data);
}

/**
 * Update existing player in Leaderboard
 */
export async function updateLeaderboardPlayer(id: string, updates: Partial<LeaderboardPlayer>): Promise<LeaderboardPlayer | null> {
  const dbRecord = playerToDb(updates);
  delete dbRecord.id;

  const { data, error } = await supabaseServer
    .from('leaderboard_players')
    .update(dbRecord)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update player: ${error.message}`);
  }

  return dbToPlayer(data);
}

/**
 * Delete player from Leaderboard
 */
export async function deleteLeaderboardPlayer(id: string): Promise<boolean> {
  const { error } = await supabaseServer
    .from('leaderboard_players')
    .delete()
    .eq('id', id);

  return !error;
}

/**
 * Live Sync with Chess.com API for a specific player
 */
export async function syncPlayerWithChessCom(playerId: string): Promise<{ success: boolean; player?: LeaderboardPlayer; error?: string }> {
  const player = await getLeaderboardPlayerById(playerId);
  if (!player) {
    return { success: false, error: 'Player not found' };
  }

  const handle = player.chessComUsername || player.chessUsername;
  if (!handle || handle === 'N/A' || handle.trim() === '') {
    return { success: false, error: 'Player does not have a Chess.com handle configured' };
  }

  const liveStats = await fetchChessComPlayerData(handle);
  if (!liveStats) {
    return { success: false, error: `Could not fetch live data from Chess.com for handle "${handle}"` };
  }

  const updates: Partial<LeaderboardPlayer> = {
    chessComVerified: liveStats.verified,
    chessComLastSyncedAt: liveStats.lastSyncedAt,
    chessComAvatarUrl: liveStats.avatarUrl || player.chessComAvatarUrl,
    chessComBlitzRating: liveStats.blitzRating,
    chessComRapidRating: liveStats.rapidRating,
    chessComBulletRating: liveStats.bulletRating,
    chessComPuzzleRating: liveStats.puzzleRating,
  };

  // Optionally update current rapid & blitz rating if provided by Chess.com
  const newRating = { ...player.rating };
  if (liveStats.rapidRating) newRating.rapid = liveStats.rapidRating;
  if (liveStats.blitzRating) newRating.blitz = liveStats.blitzRating;
  if (liveStats.bulletRating) newRating.bullet = liveStats.bulletRating;
  newRating.peak = Math.max(newRating.peak, liveStats.peakRating || 0, newRating.rapid, newRating.blitz);
  updates.rating = newRating;

  const updated = await updateLeaderboardPlayer(playerId, updates);
  return { success: true, player: updated || undefined };
}

/**
 * Sync all players with Chess.com handles
 */
export async function syncAllPlayersWithChessCom(): Promise<{ synced: number; failed: number; results: any[] }> {
  const players = await getAllLeaderboardPlayers();
  const eligible = players.filter(p => Boolean(p.chessComUsername || p.chessUsername));
  
  let synced = 0;
  let failed = 0;
  const results: any[] = [];

  for (const p of eligible) {
    try {
      const res = await syncPlayerWithChessCom(p.id);
      if (res.success) {
        synced++;
        results.push({ id: p.id, name: p.name, status: 'synced' });
      } else {
        failed++;
        results.push({ id: p.id, name: p.name, status: 'failed', error: res.error });
      }
    } catch (e: any) {
      failed++;
      results.push({ id: p.id, name: p.name, status: 'error', error: e.message });
    }
  }

  return { synced, failed, results };
}
