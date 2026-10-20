import { NextResponse } from 'next/server';
import { checkMediaStorageHealth } from '@/lib/blobStorage';
import { isAdminAuthenticated } from '@/lib/adminAuth';

export async function GET() {
  try {
    const isAuthed = await isAdminAuthenticated();
    if (!isAuthed) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin credentials required to inspect storage health.' },
        { status: 401 }
      );
    }

    const health = await checkMediaStorageHealth();
    const isHealthy = health.status === 'connected';

    // In production, an unbound storage is considered degraded (503)
    const statusCode = isHealthy || health.environment !== 'production' ? 200 : 503;

    return NextResponse.json(
      {
        success: isHealthy,
        health
      },
      { status: statusCode }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Storage health check failed'
      },
      { status: 500 }
    );
  }
}
