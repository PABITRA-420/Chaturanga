import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('chaturanga_admin_session');

    if (session && session.value === 'authenticated_arbiter_session_2026') {
      return NextResponse.json({
        authenticated: true,
        user: {
          username: process.env.ADMIN_USERNAME || 'admin',
          role: 'Chief Arbiter & Tournament Admin'
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
