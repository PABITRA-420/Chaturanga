/**
 * Chess.com Public API Integration Service
 * Fetches live Elo ratings, peak records, and avatars for club players.
 */

export interface ChessComStats {
  username: string;
  avatarUrl?: string;
  rapidRating?: number;
  blitzRating?: number;
  bulletRating?: number;
  puzzleRating?: number;
  peakRating?: number;
  fideRating?: number;
  lastSyncedAt: string;
  verified: boolean;
}

export async function fetchChessComPlayerData(username: string): Promise<ChessComStats | null> {
  const cleanUsername = username.trim().toLowerCase();
  if (!cleanUsername || cleanUsername === 'n/a' || cleanUsername === 'none') {
    return null;
  }

  const headers = {
    'User-Agent': 'Chaturanga-JGEC-ChessClub/1.0 (contact@chaturanga-jgec.ac.in)',
    'Accept': 'application/json'
  };

  try {
    // 1. Fetch player profile (avatar, verification)
    const profileRes = await fetch(`https://api.chess.com/pub/player/${cleanUsername}`, {
      headers,
      next: { revalidate: 3600 } // cache for 1 hour in Next.js
    });

    let avatarUrl: string | undefined = undefined;
    if (profileRes.ok) {
      const profileData = await profileRes.json();
      avatarUrl = profileData.avatar;
    }

    // 2. Fetch player stats (rapid, blitz, bullet, tactics)
    const statsRes = await fetch(`https://api.chess.com/pub/player/${cleanUsername}/stats`, {
      headers,
      next: { revalidate: 3600 }
    });

    if (!statsRes.ok) {
      return {
        username: cleanUsername,
        avatarUrl,
        lastSyncedAt: new Date().toISOString(),
        verified: profileRes.ok
      };
    }

    const stats = await statsRes.json();

    const rapid = stats.chess_rapid?.last?.rating;
    const blitz = stats.chess_blitz?.last?.rating;
    const bullet = stats.chess_bullet?.last?.rating;
    const puzzle = stats.tactics?.highest?.rating || stats.tactics?.lowest?.rating;
    const fide = stats.fide;

    const allRatings = [
      stats.chess_rapid?.best?.rating,
      stats.chess_blitz?.best?.rating,
      stats.chess_bullet?.best?.rating,
      rapid,
      blitz,
      bullet
    ].filter((r): r is number => typeof r === 'number' && r > 0);

    const peak = allRatings.length > 0 ? Math.max(...allRatings) : undefined;

    return {
      username: cleanUsername,
      avatarUrl,
      rapidRating: rapid,
      blitzRating: blitz,
      bulletRating: bullet,
      puzzleRating: puzzle,
      peakRating: peak,
      fideRating: fide,
      lastSyncedAt: new Date().toISOString(),
      verified: true
    };
  } catch (error) {
    console.error(`Failed to fetch Chess.com stats for ${cleanUsername}:`, error);
    return null;
  }
}
