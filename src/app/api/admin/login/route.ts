import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const envUser = process.env.ADMIN_USERNAME || 'admin';
    const envPass = process.env.ADMIN_PASSWORD || '1234';

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Please enter both username and password.' },
        { status: 400 }
      );
    }

    const trimmedUser = String(username).trim();
    const trimmedPass = String(password).trim();

    // Check credentials against .env (also accept common aliases like admin@jgec.ac.in)
    const isUserValid =
      trimmedUser === envUser ||
      trimmedUser.toLowerCase() === `${envUser.toLowerCase()}@jgec.ac.in` ||
      trimmedUser.toLowerCase() === 'admin@jgec.ac.in';

    const isPassValid = trimmedPass === envPass;

    if (!isUserValid || !isPassValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials. Please check your username and password.' },
        { status: 401 }
      );
    }

    // Set secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('chaturanga_admin_session', 'authenticated_arbiter_session_2026', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      message: 'Authentication successful.',
      user: {
        username: envUser,
        role: 'Chief Arbiter & Tournament Admin',
        accessLevel: 'full_admin'
      }
    });
  } catch (error: any) {
    console.error('Admin Login Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error during login.' },
      { status: 500 }
    );
  }
}
