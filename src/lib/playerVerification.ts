export type VerificationPlatform = 'chesscom' | 'lichess';

export interface PlayerVerificationResult {
  success: boolean;
  exists?: boolean;
  platform?: 'Chess.com' | 'Lichess';
  username?: string;
  name?: string | null;
  avatar?: string | null;
  title?: string | null;
  ratings?: {
    rapid?: number | null;
    blitz?: number | null;
    bullet?: number | null;
    classical?: number | null;
  };
  message?: string;
  error?: string;
  status: number;
}

const CHESS_COM_HEADERS = {
  'User-Agent': 'Chaturanga-JGEC-ChessClub/1.0 (contact@chaturanga-jgec.ac.in)'
};

const LICHESS_HEADERS = {
  'Accept': 'application/json'
};

async function verifyChessCom(username: string): Promise<PlayerVerificationResult> {
  const cleanUsername = username.trim().toLowerCase();
  const chessRes = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(cleanUsername)}`, {
    headers: CHESS_COM_HEADERS,
    next: { revalidate: 120 }
  });

  if (!chessRes.ok) {
    if (chessRes.status === 404) {
      return {
        success: true,
        exists: false,
        platform: 'Chess.com',
        message: `Player "${username}" not found on Chess.com. Please check your ID carefully.`,
        status: 200
      };
    }

    const errStatus = chessRes.status === 503 || chessRes.status === 429 ? 503 : 502;
    return {
      success: false,
      error: `Chess.com verification service unavailable (HTTP ${chessRes.status}). Please retry in a moment.`,
      status: errStatus
    };
  }

  const profile = await chessRes.json();
  let stats: any = {};
  try {
    const statsRes = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(cleanUsername)}/stats`, {
      headers: CHESS_COM_HEADERS,
      next: { revalidate: 120 }
    });
    if (statsRes.ok) stats = await statsRes.json();
  } catch {}

  return {
    success: true,
    exists: true,
    platform: 'Chess.com',
    username: profile.username || username,
    name: profile.name || null,
    avatar: profile.avatar || null,
    title: profile.title || null,
    ratings: {
      rapid: stats.chess_rapid?.last?.rating || null,
      blitz: stats.chess_blitz?.last?.rating || null,
      bullet: stats.chess_bullet?.last?.rating || null
    },
    status: 200
  };
}

async function verifyLichess(username: string): Promise<PlayerVerificationResult> {
  const cleanUsername = username.trim();
  const lichessRes = await fetch(`https://lichess.org/api/user/${encodeURIComponent(cleanUsername)}`, {
    headers: LICHESS_HEADERS,
    next: { revalidate: 120 }
  });

  if (!lichessRes.ok) {
    if (lichessRes.status === 404) {
      return {
        success: true,
        exists: false,
        platform: 'Lichess',
        message: `Player "${username}" not found on Lichess. Please check your ID carefully.`,
        status: 200
      };
    }

    const errStatus = lichessRes.status === 503 || lichessRes.status === 429 ? 503 : 502;
    return {
      success: false,
      error: `Lichess verification service unavailable (HTTP ${lichessRes.status}). Please retry in a moment.`,
      status: errStatus
    };
  }

  const u = await lichessRes.json();
  if (u.disabled || u.tosViolation) {
    return {
      success: true,
      exists: false,
      platform: 'Lichess',
      message: `Player "${username}" not found on Lichess. Please check your ID carefully.`,
      status: 200
    };
  }

  return {
    success: true,
    exists: true,
    platform: 'Lichess',
    username: u.username || username,
    title: u.title || null,
    avatar: null,
    ratings: {
      rapid: u.perfs?.rapid?.rating || null,
      blitz: u.perfs?.blitz?.rating || null,
      bullet: u.perfs?.bullet?.rating || null,
      classical: u.perfs?.classical?.rating || null
    },
    status: 200
  };
}

async function verifyFallback(username: string): Promise<PlayerVerificationResult> {
  const cleanUsername = username.trim();
  const chessRes = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(cleanUsername.toLowerCase())}`, {
    headers: CHESS_COM_HEADERS,
    next: { revalidate: 120 }
  });

  if (chessRes.ok) {
    const profile = await chessRes.json();
    let stats: any = {};
    try {
      const statsRes = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(cleanUsername.toLowerCase())}/stats`, {
        headers: CHESS_COM_HEADERS,
        next: { revalidate: 120 }
      });
      if (statsRes.ok) stats = await statsRes.json();
    } catch {}

    return {
      success: true,
      exists: true,
      platform: 'Chess.com',
      username: profile.username || username,
      name: profile.name || null,
      avatar: profile.avatar || null,
      title: profile.title || null,
      ratings: {
        rapid: stats.chess_rapid?.last?.rating || null,
        blitz: stats.chess_blitz?.last?.rating || null,
        bullet: stats.chess_bullet?.last?.rating || null
      },
      status: 200
    };
  }

  const lichessRes = await fetch(`https://lichess.org/api/user/${encodeURIComponent(cleanUsername)}`, {
    headers: LICHESS_HEADERS,
    next: { revalidate: 120 }
  });

  if (lichessRes.ok) {
    const u = await lichessRes.json();
    if (!u.disabled && !u.tosViolation) {
      return {
        success: true,
        exists: true,
        platform: 'Lichess',
        username: u.username || username,
        title: u.title || null,
        avatar: null,
        ratings: {
          rapid: u.perfs?.rapid?.rating || null,
          blitz: u.perfs?.blitz?.rating || null,
          bullet: u.perfs?.bullet?.rating || null,
          classical: u.perfs?.classical?.rating || null
        },
        status: 200
      };
    }
  }

  const chessIsNotFound = chessRes.status === 404;
  const lichessIsNotFound = lichessRes.status === 404 || lichessRes.ok;

  if (chessIsNotFound && lichessIsNotFound) {
    return {
      success: true,
      exists: false,
      message: `Account "${username}" not found on Chess.com or Lichess. Please check your ID carefully.`,
      status: 200
    };
  }

  const errStatus = (chessRes.status === 503 || lichessRes.status === 503 || chessRes.status === 429 || lichessRes.status === 429) ? 503 : 502;
  return {
    success: false,
    error: 'Upstream chess verification services temporarily unavailable. Please retry in a moment.',
    status: errStatus
  };
}

export async function verifyPlayerAccount(
  platform?: string | null,
  username?: string | null
): Promise<PlayerVerificationResult> {
  const cleanUsername = username?.trim();
  if (!cleanUsername) {
    return {
      success: false,
      error: 'Username is required',
      status: 400
    };
  }

  try {
    const normPlatform = platform?.trim().toLowerCase();

    if (normPlatform === 'chesscom' || normPlatform === 'chess.com') {
      return await verifyChessCom(cleanUsername);
    }

    if (normPlatform === 'lichess') {
      return await verifyLichess(cleanUsername);
    }

    if (!normPlatform) {
      return await verifyFallback(cleanUsername);
    }

    return {
      success: false,
      error: 'Invalid chess platform. Only chesscom or lichess are supported.',
      status: 400
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Internal verification error',
      status: 500
    };
  }
}
