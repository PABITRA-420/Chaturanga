import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseServerClient, supabaseServer } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    const rawIdentifier = (email || username || '').trim();
    const trimmedPass = (password || '').trim();

    if (!rawIdentifier || !trimmedPass) {
      return NextResponse.json(
        { success: false, error: 'Please enter both Admin Email / ID and Password.' },
        { status: 400 }
      );
    }

    // Resolve identifier to an email address
    let resolvedEmail = rawIdentifier;
    if (!rawIdentifier.includes('@')) {
      if (rawIdentifier.toLowerCase() === 'admin') {
        resolvedEmail = process.env.ADMIN_EMAIL || 'admin@jgec.ac.in';
      } else {
        resolvedEmail = `${rawIdentifier.toLowerCase()}@chaturanga-jgec.ac.in`;
      }
    }

    // 1. Primary: Supabase Auth Cryptographic Sign-in
    const supabase = await createSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: resolvedEmail,
      password: trimmedPass,
    });

    const adminSessionToken = process.env.ADMIN_SESSION_TOKEN || 'chaturanga_arbiter_session_key';

    if (authData?.user && !authError) {
      // Cross-verify user role in public.admin_profiles
      const { data: profile } = await supabaseServer
        .from('admin_profiles')
        .select('id, email, full_name, role, is_active')
        .eq('id', authData.user.id)
        .eq('is_active', true)
        .maybeSingle();

      const configuredAdminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
      const isPrimaryAdmin = 
        configuredAdminEmail !== '' && resolvedEmail.toLowerCase() === configuredAdminEmail;

      if (!profile && !isPrimaryAdmin) {
        // Sign out unauthorized user
        await supabase.auth.signOut();
        return NextResponse.json(
          { success: false, error: 'Access denied. Account is not registered as an authorized tournament administrator.' },
          { status: 403 }
        );
      }

      // Update last_login timestamp
      if (profile) {
        await supabaseServer
          .from('admin_profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', profile.id);
      }

      // Set fallback session cookie for maximum compatibility across older sub-systems
      const cookieStore = await cookies();
      cookieStore.set('chaturanga_admin_session', adminSessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return NextResponse.json({
        success: true,
        message: 'Supabase Authentication successful.',
        authMethod: 'supabase_auth',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          username: authData.user.email?.split('@')[0] || 'admin',
          fullName: profile?.full_name || 'Chief Arbiter & Tournament Admin',
          role: profile?.role || 'superadmin',
          accessLevel: 'full_admin'
        }
      });
    }

    // 2. Fallback: Check environment credentials for bootstrap / emergency access
    const envUser = process.env.ADMIN_USERNAME || 'admin';
    const envPass = process.env.ADMIN_PASSWORD;

    const configuredAdminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
    const isEnvUserMatch =
      rawIdentifier.toLowerCase() === envUser.toLowerCase() ||
      (configuredAdminEmail !== '' && resolvedEmail.toLowerCase() === configuredAdminEmail);

    const isEnvPassMatch = Boolean(envPass && trimmedPass === envPass);

    if (isEnvUserMatch && isEnvPassMatch) {
      const cookieStore = await cookies();
      cookieStore.set('chaturanga_admin_session', adminSessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return NextResponse.json({
        success: true,
        message: 'Transitional arbiter authentication successful.',
        authMethod: 'legacy_env',
        user: {
          id: 'env-admin',
          email: process.env.ADMIN_EMAIL || 'admin@jgec.ac.in',
          username: envUser,
          fullName: 'Chief Arbiter & Tournament Admin (Emergency Access)',
          role: 'superadmin',
          accessLevel: 'full_admin'
        }
      });
    }

    // Authentication failure
    return NextResponse.json(
      { 
        success: false, 
        error: authError?.message || 'Invalid administrator credentials. Please check your email and password.' 
      },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('Admin Login Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error during admin authentication.' },
      { status: 500 }
    );
  }
}
