import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    // 1. Supabase Auth sign-out
    try {
      const supabase = await createSupabaseServerClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore if already signed out
    }

    // 2. Clear fallback session cookie
    const cookieStore = await cookies();
    cookieStore.delete('chaturanga_admin_session');

    return NextResponse.json({
      success: true,
      message: 'Supabase session terminated. Logged out successfully.'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Logout error' },
      { status: 500 }
    );
  }
}
