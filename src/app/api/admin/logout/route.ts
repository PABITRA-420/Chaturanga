import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('chaturanga_admin_session');

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Logout error' },
      { status: 500 }
    );
  }
}
