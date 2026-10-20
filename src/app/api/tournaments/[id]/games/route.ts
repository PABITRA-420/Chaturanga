import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { getGameById, getTournamentGames, saveGame } from '@/lib/pgnStore';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const gameId = url.searchParams.get('gameId');

    if (gameId) {
      const game = await getGameById(gameId);
      if (!game) {
        return NextResponse.json(
          { success: false, error: 'Game not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, game });
    }

    const games = await getTournamentGames(id);
    return NextResponse.json({ success: true, games, tournamentId: id });
  } catch (error: any) {
    const status = error.status === 503 ? 503 : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthed = await isAdminAuthenticated();
    if (!isAuthed) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Arbiter credentials required.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { white_player, black_player, pgn, result, event_name, round, date } = body;

    if (!white_player || !black_player || !pgn) {
      return NextResponse.json(
        { success: false, error: 'white_player, black_player, and pgn are required.' },
        { status: 400 }
      );
    }

    const saved = await saveGame({
      tournament_id: id,
      white_player,
      black_player,
      pgn,
      result: result || '*',
      event_name: event_name || 'Tournament Game',
      round: Number(round) || 1,
      date: date || new Date().toISOString().slice(0, 10),
    });

    return NextResponse.json({
      success: true,
      message: 'PGN game saved successfully.',
      game: saved,
    });
  } catch (error: any) {
    const status = error.status === 503 ? 503 : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status }
    );
  }
}
