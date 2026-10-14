import { cookies } from 'next/headers';
import { createSupabaseServerClient, supabaseServer } from '@/lib/supabase/server';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'superadmin' | 'arbiter' | 'editor';
  authMethod: 'supabase_auth' | 'legacy_env';
}

/**
 * Validates the caller's admin authentication.
 * 1. Checks Supabase Auth session via createSupabaseServerClient().auth.getUser()
 * 2. Cross-references with public.admin_profiles to ensure the user is an active admin
 * 3. Supports transitional fallback session for uninterrupted arbiter operations
 */
export async function getAuthenticatedAdmin(): Promise<AdminUser | null> {
  try {
    // 1. Supabase Auth Session Check (Cryptographic JWT Verification)
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (user && !error) {
      // Query admin profile to verify role and active status
      const { data: profile } = await supabaseServer
        .from('admin_profiles')
        .select('id, email, full_name, role, is_active')
        .eq('id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (profile) {
        return {
          id: profile.id,
          email: profile.email || user.email || '',
          fullName: profile.full_name || 'Tournament Arbiter',
          role: profile.role || 'arbiter',
          authMethod: 'supabase_auth'
        };
      }

      // Check if user email matches primary administrator
      const primaryAdminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
      if (user.email && primaryAdminEmail && user.email.toLowerCase() === primaryAdminEmail) {
        return {
          id: user.id,
          email: user.email,
          fullName: 'Chief Arbiter & Tournament Admin',
          role: 'superadmin',
          authMethod: 'supabase_auth'
        };
      }
    }

    // 2. Fallback Session Cookie Check
    const cookieStore = await cookies();
    const session = cookieStore.get('chaturanga_admin_session');
    const adminSessionToken = process.env.ADMIN_SESSION_TOKEN || 'chaturanga_arbiter_session_key';
    if (session && session.value === adminSessionToken) {
      return {
        id: 'env-admin-fallback',
        email: process.env.ADMIN_EMAIL || 'admin@jgec.ac.in',
        fullName: 'Chief Arbiter & Tournament Admin',
        role: 'superadmin',
        authMethod: 'legacy_env'
      };
    }

    return null;
  } catch (err) {
    console.error('Error verifying admin authentication:', err);
    return null;
  }
}

/**
 * Boolean helper to check whether request is authenticated as admin
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const admin = await getAuthenticatedAdmin();
  return admin !== null;
}
