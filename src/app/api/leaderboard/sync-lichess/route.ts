import { NextResponse } from 'next/server';
import { syncLichessClub } from '@/lib/lichessSync';
import { isAdminAuthenticated } from '@/lib/adminAuth';

export async function POST(request: Request) {
  try {
    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin credentials required.' }, { status: 401 });
    }

    const result = await syncLichessClub(true);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Lichess sync execution failed.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check if 24 hours have passed and sync if needed
    const result = await syncLichessClub(false);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Lichess sync check failed.' },
      { status: 500 }
    );
  }
}
