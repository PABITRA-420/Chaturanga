import { supabaseServer } from '@/lib/supabase/server';

export interface LichessClubSyncResult {
  success: boolean;
  count: number;
  lastSyncedAt: string;
  top3: any[];
  skipped?: boolean;
  error?: string;
}

const LICHESS_TEAM_ID = 'jgec-chess-club';
const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Retrieve the actual timestamp of the most recent sync
 */
export async function getLastLichessClubSyncTime(): Promise<string | null> {
  try {
    const { data, error } = await supabaseServer
      .from('leaderboard_players')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0 || !data[0]?.updated_at) {
      return null;
    }

    return data[0].updated_at;
  } catch {
    return null;
  }
}

/**
 * Check if more than 24 hours have passed since the last Lichess club sync
 */
export async function shouldSyncLichessClub(): Promise<boolean> {
  const lastSyncStr = await getLastLichessClubSyncTime();
  if (!lastSyncStr) {
    return true; // No data yet, sync immediately
  }

  const lastSync = new Date(lastSyncStr).getTime();
  const now = Date.now();
  return now - lastSync >= SYNC_INTERVAL_MS;
}

let isSyncInProgress = false;

export function isLichessSyncInProgress(): boolean {
  return isSyncInProgress;
}

/**
 * Trigger background synchronization non-blockingly without waiting or launching duplicates
 */
export function triggerBackgroundLichessSync(): void {
  if (isSyncInProgress) return;

  Promise.resolve().then(async () => {
    try {
      const needed = await shouldSyncLichessClub();
      if (needed && !isSyncInProgress) {
        await syncLichessClub(true);
      }
    } catch (err) {
      console.warn('Background Lichess sync trigger failed:', err);
    }
  });
}

/**
 * Synchronize all members and ratings from https://lichess.org/team/jgec-chess-club into Supabase
 */
export async function syncLichessClub(force = false): Promise<LichessClubSyncResult> {
  if (isSyncInProgress) {
    const lastSyncTime = await getLastLichessClubSyncTime().catch(() => null);
    return {
      success: true,
      skipped: true,
      count: 0,
      lastSyncedAt: lastSyncTime || '',
      top3: [],
      error: 'Sync already in progress'
    };
  }

  isSyncInProgress = true;
  try {
    if (!force) {
      const lastSyncTime = await getLastLichessClubSyncTime();
      const needed = !lastSyncTime || (Date.now() - new Date(lastSyncTime).getTime() >= SYNC_INTERVAL_MS);
      if (!needed) {
        return {
          success: true,
          skipped: true,
          count: 0,
          lastSyncedAt: lastSyncTime || '',
          top3: []
        };
      }
    }

    // 1. Fetch team members stream from Lichess
    const res = await fetch(`https://lichess.org/api/team/${LICHESS_TEAM_ID}/users`, {
      headers: {
        'Accept': 'application/x-ndjson',
        'User-Agent': 'Chaturanga-JGEC-ChessClub/1.0 (+https://chaturangajgec.netlify.app)'
      },
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch Lichess team: HTTP ${res.status}`);
    }

    const text = await res.text();
    const members = text
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    if (members.length === 0) {
      throw new Error('No members returned from Lichess team');
    }

    // 2. Fetch bulk details for all members
    const userIds = members.map((m: any) => m.id);
    const chunkSize = 150;
    const allUsers: any[] = [];

    for (let i = 0; i < userIds.length; i += chunkSize) {
      const chunk = userIds.slice(i, i + chunkSize);
      try {
        const detailsRes = await fetch('https://lichess.org/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
            'User-Agent': 'Chaturanga-JGEC-ChessClub/1.0'
          },
          body: chunk.join(',')
        });

        if (detailsRes.ok) {
          const usersChunk = await detailsRes.json();
          allUsers.push(...usersChunk);
        }
      } catch (e) {
        console.warn('Lichess chunk fetch warning:', e);
      }
    }

    // 3. Parse stats and ratings
    const parsed = allUsers
      .filter((u: any) => !u.disabled && !u.tosViolation)
      .map((u: any) => {
        const rapid = u.perfs?.rapid?.rating || 1200;
        const blitz = u.perfs?.blitz?.rating || 1200;
        const classical = u.perfs?.classical?.rating || 1200;
        const bullet = u.perfs?.bullet?.rating || 1200;
        const peak = Math.max(rapid, blitz, classical, bullet);

        let bestFormat = 'Rapid';
        let bestRating = rapid;
        if (classical >= rapid && classical >= blitz && classical > 1500) {
          bestFormat = 'Classical';
          bestRating = classical;
        } else if (blitz >= rapid && blitz > 1500) {
          bestFormat = 'Blitz';
          bestRating = blitz;
        }

        const totalGames = typeof u.count?.all === 'number'
          ? u.count.all
          : u.count
          ? (u.count.win || 0) + (u.count.loss || 0) + (u.count.draw || 0)
          : 0;

        const wins = typeof u.count?.win === 'number' ? u.count.win : 0;
        const draws = typeof u.count?.draw === 'number' ? u.count.draw : 0;
        const losses = typeof u.count?.loss === 'number' ? u.count.loss : 0;
        const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : null;
        const tournamentsWon = typeof u.tournaments_won === 'number'
          ? u.tournaments_won
          : typeof u.tournamentsWon === 'number'
          ? u.tournamentsWon
          : null;
        const recentForm = Array.isArray(u.recent_form)
          ? u.recent_form
          : Array.isArray(u.recentForm)
          ? u.recentForm
          : null;

        return {
          id: u.id,
          username: u.username,
          title: u.title || null,
          rapid,
          blitz,
          classical,
          bullet,
          peak,
          bestFormat,
          bestRating,
          matchesPlayed: totalGames,
          wins,
          draws,
          losses,
          winRate,
          tournamentsWon,
          recentForm,
          profileUrl: `https://lichess.org/@/${u.username}`
        };
      });

    // Sort by highest peak rating
    parsed.sort((a, b) => b.peak - a.peak);

    // 4. Upsert into Supabase public.leaderboard_players
    const syncTimestamp = new Date().toISOString();
    const avatarColors = [
      'from-[#D4AF7C] to-[#E6C98A]',
      'from-slate-300 to-slate-500',
      'from-amber-600 to-yellow-700',
      'from-blue-500 to-indigo-700',
      'from-emerald-500 to-teal-700',
      'from-purple-500 to-violet-700'
    ];

    const rowsToUpsert = parsed.map((p, idx) => {
      const rank = idx + 1;
      const playerId = `player-lichess-${p.id}`;

      return {
        id: playerId,
        rank,
        name: p.username,
        roll_number: `@${p.username}`,
        department: 'Lichess JGEC Team',
        year: 'Collegiate Squad',
        fide_id: p.title ? `${p.title} (${p.username})` : `@${p.username}`,
        chess_username: p.username,
        lichess_username: p.username,
        title: p.title || (rank === 1 ? 'Club Grandmaster' : rank === 2 ? 'Master Candidate' : rank === 3 ? 'Blitz Specialist' : 'Squad Player'),
        rapid_elo: p.rapid,
        blitz_elo: p.blitz,
        classical_elo: p.classical,
        bullet_elo: p.bullet,
        peak_elo: p.peak,
        matches_played: p.matchesPlayed,
        wins: p.wins,
        draws: p.draws,
        losses: p.losses,
        win_rate: p.winRate,
        tournaments_won: p.tournamentsWon ?? 0,
        recent_form: p.recentForm,
        avatar_color: avatarColors[idx % avatarColors.length],
        chess_piece: rank === 1 ? 'King' : rank === 2 ? 'Queen' : rank === 3 ? 'Rook' : rank <= 6 ? 'Bishop' : 'Knight',
        is_active: true,
        updated_at: syncTimestamp
      };
    });

    // Upsert in batches of 50
    for (let i = 0; i < rowsToUpsert.length; i += 50) {
      const batch = rowsToUpsert.slice(i, i + 50);
      const { error } = await supabaseServer.from('leaderboard_players').upsert(batch, { onConflict: 'id' });
      if (error) {
        console.warn('Error upserting leaderboard batch:', error.message);
      }
    }

    // 5. Update Top 10 Team Members in public.team_members
    const top10 = parsed.slice(0, 10);
    const openings = [
      "Sicilian Defense (Najdorf)",
      "Queen's Gambit Declined",
      "King's Indian Defense",
      "Ruy Lopez (Berlin)",
      "Caro-Kann Defense",
      "French Defense (Winawer)",
      "English Opening",
      "Nimzo-Indian Defense",
      "Grünfeld Defense",
      "Italian Game (Giuoco Piano)"
    ];

    for (let i = 0; i < top10.length; i++) {
      const p = top10[i];
      const rank = i + 1;
      const teamId = `team-top10-${p.id}`;

      const role = rank === 1 
        ? '#1 Board • Classical Specialist' 
        : rank === 2 
        ? '#2 Board • Rapid Captain' 
        : rank === 3 
        ? '#3 Board • Blitz Lead' 
        : `Board #${rank} • Competitive Squad`;

      const category = rank <= 3 ? 'core' : rank <= 8 ? 'coordinator' : 'mentor';

      await supabaseServer.from('team_members').upsert({
        id: teamId,
        name: p.username,
        role,
        category,
        department: 'JGEC Chess Club Squad',
        year: 'Collegiate Squad',
        elo: `${p.bestRating} [Lichess ${p.bestFormat}]`,
        fide_id: `@${p.username}`,
        bio: `Official JGEC Collegiate Chess Team player holding ${p.bestRating} rating in ${p.bestFormat} on Lichess.org.`,
        responsibilities: [
          `Representing JGEC in Collegiate Board #${rank}`,
          `Leading team tactical clinics and arena matches`,
          `Analyzing endgames and opening theory`
        ],
        favorite_opening: openings[i % openings.length],
        achievements: [
          `Rank #${rank} in JGEC Club Roster`,
          `Peak Rating: ${p.peak} on Lichess.org`
        ],
        chess_piece: rank === 1 ? 'King' : rank === 2 ? 'Queen' : rank === 3 ? 'Rook' : rank <= 5 ? 'Bishop' : 'Knight',
        avatar_color: rank === 1 ? 'from-[#D4AF7C] via-[#E6C98A] to-[#B89355]' : rank === 2 ? 'from-amber-400 to-yellow-600' : 'from-blue-500 to-indigo-700',
        title_badge: rank === 1 ? 'Club Champion' : rank === 2 ? 'Vice Captain' : rank === 3 ? 'Blitz Master' : 'Squad Player',
        display_order: rank,
        is_active: true,
        updated_at: syncTimestamp
      }, { onConflict: 'id' });
    }

    return {
      success: true,
      skipped: false,
      count: parsed.length,
      lastSyncedAt: syncTimestamp,
      top3: parsed.slice(0, 3)
    };
  } catch (err: any) {
    console.error('syncLichessClub error:', err);
    return {
      success: false,
      count: 0,
      lastSyncedAt: '',
      top3: [],
      error: err.message || 'Lichess sync failed'
    };
  } finally {
    isSyncInProgress = false;
  }
}
