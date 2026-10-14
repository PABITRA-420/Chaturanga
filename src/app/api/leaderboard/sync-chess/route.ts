import { NextResponse } from 'next/server';
import { 
  syncPlayerWithChessCom, 
  syncAllPlayersWithChessCom 
} from '@/lib/leaderboardStore';
import { isAdminAuthenticated } from '@/lib/adminAuth';

export async function POST(request: Request) {
  try {
    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized admin credentials required.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { playerId, syncAll } = body;

    if (syncAll) {
      const summary = await syncAllPlayersWithChessCom();
      return NextResponse.json({
        success: true,
        message: `Synced ${summary.synced} players from Chess.com (${summary.failed} skipped/failed).`,
        summary
      });
    }

    if (!playerId) {
      return NextResponse.json(
        { success: false, error: 'Provide either playerId or set syncAll: true.' },
        { status: 400 }
      );
    }

    const result = await syncPlayerWithChessCom(playerId);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to sync with Chess.com.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${result.player?.name}'s rating from Chess.com!`,
      player: result.player
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Server error while syncing with Chess.com.' },
      { status: 500 }
    );
  }
}
