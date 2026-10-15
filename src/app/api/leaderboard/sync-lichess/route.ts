import { NextResponse } from 'next/server';
import { syncLichessClub } from '@/lib/lichessSync';
import { isAdminAuthenticated } from '@/lib/adminAuth';

async function isAuthorized(request: Request): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }
  return isAdminAuthenticated();
}

export async function POST(request: Request) {
  try {
    const authed = await isAuthorized(request);
    if (!authed) {
      return NextResponse.json({ success: false, error: 'Unauthorized credentials required.' }, { status: 401 });
    }

    const result = await syncLichessClub(true);
    return NextResponse.json(result, { status: result.success ? 200 : 502 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Lichess sync execution failed.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const authed = await isAuthorized(request);
    if (!authed) {
      return NextResponse.json({ success: false, error: 'Unauthorized credentials required.' }, { status: 401 });
    }

    // Check if 24 hours have passed and sync if needed
    const result = await syncLichessClub(false);
    return NextResponse.json(result, { status: result.success ? 200 : 502 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Lichess sync check failed.' },
      { status: 500 }
    );
  }
}
