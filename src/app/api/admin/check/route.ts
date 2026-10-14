import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/adminAuth';

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();

    if (admin) {
      return NextResponse.json({
        authenticated: true,
        user: {
          id: admin.id,
          email: admin.email,
          username: admin.email.split('@')[0],
          fullName: admin.fullName,
          role: admin.role === 'superadmin' ? 'Chief Arbiter & Superadmin' : 'Tournament Arbiter',
          authMethod: admin.authMethod
        }
      });
    }

    return NextResponse.json({
      authenticated: false
    });
  } catch (error: any) {
    return NextResponse.json(
      { authenticated: false, error: error.message },
      { status: 500 }
    );
  }
}
