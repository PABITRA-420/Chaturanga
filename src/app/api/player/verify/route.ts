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
        return NextResponse.json({
          success: true,
          exists: false,
          platform: 'Chess.com',
          message: `Player "${username}" not found on Chess.com. Please check your ID carefully.`
        });
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
        return NextResponse.json({
          success: true,
          exists: false,
          platform: 'Lichess',
          message: `Player "${username}" not found on Lichess. Please check your ID carefully.`
        });
      }

      const u = await lichessRes.json();
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

    return NextResponse.json({
      success: true,
      exists: false,
      message: `Account "${username}" not found on Chess.com or Lichess. Please check your ID carefully.`
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
