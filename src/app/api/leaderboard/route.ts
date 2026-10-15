import { NextResponse } from 'next/server';
import { 
  getAllLeaderboardPlayers, 
  createLeaderboardPlayer, 
  updateLeaderboardPlayer, 
  deleteLeaderboardPlayer 
} from '@/lib/leaderboardStore';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { triggerBackgroundLichessSync } from '@/lib/lichessSync';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = (searchParams.get('sortBy') as 'rapid' | 'blitz' | 'classical' | 'rank') || 'rapid';

    // Trigger non-blocking background sync if needed without waiting or duplicate syncs
    triggerBackgroundLichessSync();

    const players = await getAllLeaderboardPlayers(sortBy);

    return NextResponse.json({
      success: true,
      players,
      total: players.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch leaderboard.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin credentials required.' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.name || !body.rollNumber) {
      return NextResponse.json({ success: false, error: 'Player name and roll number are required.' }, { status: 400 });
    }

    const created = await createLeaderboardPlayer(body);
    return NextResponse.json({
      success: true,
      message: 'Player created successfully.',
      player: created
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create player.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin credentials required.' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Player ID is required for update.' }, { status: 400 });
    }

    const updated = await updateLeaderboardPlayer(id, updates);
    return NextResponse.json({
      success: true,
      message: 'Player updated successfully.',
      player: updated
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update player.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin credentials required.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Player ID required.' }, { status: 400 });
    }

    const deleted = await deleteLeaderboardPlayer(id);
    return NextResponse.json({
      success: deleted,
      message: deleted ? 'Player deleted successfully.' : 'Failed to delete player.'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Server error while deleting player.' },
      { status: 500 }
    );
  }
}
