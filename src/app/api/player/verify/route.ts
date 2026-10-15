import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username')?.trim();
  const platform = searchParams.get('platform')?.trim().toLowerCase(); // 'chesscom' | 'lichess' | undefined

  if (!username) {
    return NextResponse.json({ success: false, error: 'Username is required' }, { status: 400 });
  }

  try {
    // 1. If user explicitly chose Chess.com
    if (platform === 'chesscom' || platform === 'chess.com') {
      const chessRes = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(username.toLowerCase())}`, {
        headers: { 'User-Agent': 'Chaturanga-JGEC-ChessClub/1.0 (contact@chaturanga-jgec.ac.in)' },
        next: { revalidate: 120 }
      });

      if (!chessRes.ok) {
        if (chessRes.status === 404) {
          return NextResponse.json({
            success: true,
            exists: false,
            platform: 'Chess.com',
            message: `Player "${username}" not found on Chess.com. Please check your ID carefully.`
          });
        }

        const errStatus = chessRes.status === 503 || chessRes.status === 429 ? 503 : 502;
        return NextResponse.json({
          success: false,
          error: `Chess.com verification service unavailable (HTTP ${chessRes.status}). Please retry in a moment.`
        }, { status: errStatus });
      }

      const profile = await chessRes.json();
      let stats: any = {};
      try {
        const statsRes = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(username.toLowerCase())}/stats`, {
          headers: { 'User-Agent': 'Chaturanga-JGEC-ChessClub/1.0 (contact@chaturanga-jgec.ac.in)' },
          next: { revalidate: 120 }
        });
        if (statsRes.ok) stats = await statsRes.json();
      } catch {}

      return NextResponse.json({
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
        }
      });
    }

    // 2. If user explicitly chose Lichess
    if (platform === 'lichess') {
      const lichessRes = await fetch(`https://lichess.org/api/user/${encodeURIComponent(username)}`, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 120 }
      });

      if (!lichessRes.ok) {
        if (lichessRes.status === 404) {
          return NextResponse.json({
            success: true,
            exists: false,
            platform: 'Lichess',
            message: `Player "${username}" not found on Lichess. Please check your ID carefully.`
          });
        }

        const errStatus = lichessRes.status === 503 || lichessRes.status === 429 ? 503 : 502;
        return NextResponse.json({
          success: false,
          error: `Lichess verification service unavailable (HTTP ${lichessRes.status}). Please retry in a moment.`
        }, { status: errStatus });
      }

      const u = await lichessRes.json();
      if (u.disabled || u.tosViolation) {
        return NextResponse.json({
          success: true,
          exists: false,
          platform: 'Lichess',
          message: `Player "${username}" not found on Lichess. Please check your ID carefully.`
        });
      }

      return NextResponse.json({
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
        }
      });
    }

    // 3. Fallback: Try Chess.com first, then Lichess if platform is not specified
    const chessRes = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(username.toLowerCase())}`, {
      headers: { 'User-Agent': 'Chaturanga-JGEC-ChessClub/1.0 (contact@chaturanga-jgec.ac.in)' },
      next: { revalidate: 120 }
    });

    if (chessRes.ok) {
      const profile = await chessRes.json();
      let stats: any = {};
      try {
        const statsRes = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(username.toLowerCase())}/stats`, {
          headers: { 'User-Agent': 'Chaturanga-JGEC-ChessClub/1.0 (contact@chaturanga-jgec.ac.in)' },
          next: { revalidate: 120 }
        });
        if (statsRes.ok) stats = await statsRes.json();
      } catch {}

      return NextResponse.json({
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
        }
      });
    }

    const lichessRes = await fetch(`https://lichess.org/api/user/${encodeURIComponent(username)}`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 120 }
    });

    if (lichessRes.ok) {
      const u = await lichessRes.json();
      if (!u.disabled && !u.tosViolation) {
        return NextResponse.json({
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
          }
        });
      }
    }

    // Both did not return an active profile.
    // Check if both failed with 404 (or 404 and disabled/tosViolation)
    const chessIsNotFound = chessRes.status === 404;
    const lichessIsNotFound = lichessRes.status === 404 || lichessRes.ok;

    if (chessIsNotFound && lichessIsNotFound) {
      return NextResponse.json({
        success: true,
        exists: false,
        message: `Account "${username}" not found on Chess.com or Lichess. Please check your ID carefully.`
      });
    }

    // Otherwise, an upstream service returned a non-404 error (e.g. 429, 500, 502, 503)
    const errStatus = (chessRes.status === 503 || lichessRes.status === 503 || chessRes.status === 429 || lichessRes.status === 429) ? 503 : 502;
    return NextResponse.json({
      success: false,
      error: 'Upstream chess verification services temporarily unavailable. Please retry in a moment.'
    }, { status: errStatus });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
