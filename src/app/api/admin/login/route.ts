import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseServerClient, supabaseServer, getSupabaseConfig } from '@/lib/supabase/server';

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
    const { isConfigured } = getSupabaseConfig();
    let authData: any = null;
    let authError: any = null;

    if (isConfigured) {
      try {
        const supabase = await createSupabaseServerClient();
        const res = await supabase.auth.signInWithPassword({
          email: resolvedEmail,
          password: trimmedPass,
        });
        authData = res.data;
        authError = res.error;
      } catch (err: any) {
        console.warn('Supabase sign-in network error:', err);
        authError = err;
      }
    } else {
      authError = {
        message: 'Supabase authentication is not yet active on this deployment. Please trigger a redeploy on Netlify.'
      };
    }

    const adminSessionToken = process.env.ADMIN_SESSION_TOKEN || 'chaturanga_arbiter_session_key_2026';

    if (authData?.user && !authError) {
      // Cross-verify user role in public.admin_profiles
      let profile: any = null;
      try {
        const { data } = await supabaseServer
          .from('admin_profiles')
          .select('id, email, full_name, role, is_active')
          .eq('id', authData.user.id)
          .eq('is_active', true)
          .maybeSingle();
        profile = data;
      } catch (profileErr) {
        console.warn('Could not query admin_profiles:', profileErr);
      }

      const configuredAdminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
      const isPrimaryAdmin = 
        resolvedEmail.toLowerCase() === 'admin.jgechelper@gmail.com' ||
        (configuredAdminEmail !== '' && resolvedEmail.toLowerCase() === configuredAdminEmail);

      if (!profile && !isPrimaryAdmin) {
        // Sign out unauthorized user
        try {
          const supabase = await createSupabaseServerClient();
          await supabase.auth.signOut();
        } catch {}
        return NextResponse.json(
          { success: false, error: 'Access denied. Account is not registered as an authorized tournament administrator.' },
          { status: 403 }
        );
      }

      // Update last_login timestamp
      if (profile) {
        try {
          await supabaseServer
            .from('admin_profiles')
            .update({ last_login: new Date().toISOString() })
            .eq('id', profile.id);
        } catch {}
      }

      // Set session cookie for maximum compatibility across older sub-systems
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
    const envUser = process.env.ADMIN_USERNAME || 'admin.jgechelper@gmail.com';
    const envPass = process.env.ADMIN_PASSWORD || 'Pk@2029jgec';

    const configuredAdminEmail = (process.env.ADMIN_EMAIL || 'admin.jgechelper@gmail.com').toLowerCase();
    const isEnvUserMatch =
      rawIdentifier.toLowerCase() === envUser.toLowerCase() ||
      rawIdentifier.toLowerCase() === 'admin' ||
      resolvedEmail.toLowerCase() === configuredAdminEmail;

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
          email: process.env.ADMIN_EMAIL || 'admin.jgechelper@gmail.com',
          username: envUser,
          fullName: 'Chief Arbiter & Tournament Admin (Emergency Access)',
          role: 'superadmin',
          accessLevel: 'full_admin'
        }
      });
    }

    // Format human-friendly error
    let failureMessage = authError?.message || 'Invalid administrator credentials. Please check your email and password.';
    if (failureMessage.includes('fetch failed') || failureMessage.includes('ENOTFOUND')) {
      failureMessage = 'Unable to connect to authentication server. If you recently updated Netlify environment variables, trigger a redeploy so the build picks up the new credentials.';
    }

    // Authentication failure
    return NextResponse.json(
      { 
        success: false, 
        error: failureMessage
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
