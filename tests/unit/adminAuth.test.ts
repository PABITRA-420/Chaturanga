import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAuthenticatedAdmin, isAdminAuthenticated } from '@/lib/adminAuth';
import { createSupabaseServerClient, supabaseServer, getSupabaseConfig } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

vi.mock('@/lib/supabase/server', () => {
  return {
    createSupabaseServerClient: vi.fn(),
    supabaseServer: {
      from: vi.fn()
    },
    getSupabaseConfig: vi.fn(() => ({
      hasServiceRoleKey: true,
      isConfigured: true,
      url: 'https://test.supabase.co',
      anonKey: 'test-anon',
      serviceKey: 'test-service'
    }))
  };
});

describe('Admin Authentication (adminAuth.ts)', () => {
  let mockSupabaseClient: any;
  let mockProfileQuery: any;
  let mockCookieStore: any;

  beforeEach(() => {
    vi.clearAllMocks();

    process.env.ADMIN_EMAIL = 'admin@chaturanga-jgec.ac.in';
    process.env.ADMIN_SESSION_TOKEN = 'test-admin-secret-token-12345';

    mockProfileQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
    };

    vi.mocked(supabaseServer.from).mockReturnValue(mockProfileQuery as any);

    mockSupabaseClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null })
      },
      from: vi.fn().mockReturnValue(mockProfileQuery)
    };

    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSupabaseClient);

    mockCookieStore = {
      get: vi.fn().mockReturnValue(undefined),
      set: vi.fn(),
      delete: vi.fn(),
      getAll: vi.fn().mockReturnValue([])
    };

    vi.mocked(cookies).mockResolvedValue(mockCookieStore);
  });

  describe('getAuthenticatedAdmin with Supabase Auth session', () => {
    it('authenticates active admin with profile from admin_profiles table', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: {
          user: {
            id: 'arbiter-uuid-001',
            email: 'arbiter@chaturanga-jgec.ac.in'
          }
        },
        error: null
      });

      mockProfileQuery.maybeSingle.mockResolvedValueOnce({
        data: {
          id: 'arbiter-uuid-001',
          email: 'arbiter@chaturanga-jgec.ac.in',
          full_name: 'Grandmaster Arbiter',
          role: 'arbiter',
          is_active: true
        },
        error: null
      });

      const admin = await getAuthenticatedAdmin();

      expect(admin).not.toBeNull();
      expect(admin?.id).toBe('arbiter-uuid-001');
      expect(admin?.email).toBe('arbiter@chaturanga-jgec.ac.in');
      expect(admin?.fullName).toBe('Grandmaster Arbiter');
      expect(admin?.role).toBe('arbiter');
      expect(admin?.authMethod).toBe('supabase_auth');
    });

    it('denies access immediately when admin profile has is_active: false', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: {
          user: {
            id: 'deactivated-uuid-002',
            email: 'revoked@chaturanga-jgec.ac.in'
          }
        },
        error: null
      });

      mockProfileQuery.maybeSingle.mockResolvedValueOnce({
        data: {
          id: 'deactivated-uuid-002',
          email: 'revoked@chaturanga-jgec.ac.in',
          full_name: 'Ex Arbiter',
          role: 'arbiter',
          is_active: false
        },
        error: null
      });

      const admin = await getAuthenticatedAdmin();
      expect(admin).toBeNull();
    });

    it('falls back to superadmin if user has no profile row but matches ADMIN_EMAIL', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: {
          user: {
            id: 'chief-uuid-003',
            email: 'admin@chaturanga-jgec.ac.in'
          }
        },
        error: null
      });

      // No profile found
      mockProfileQuery.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null
      });

      const admin = await getAuthenticatedAdmin();

      expect(admin).not.toBeNull();
      expect(admin?.id).toBe('chief-uuid-003');
      expect(admin?.email).toBe('admin@chaturanga-jgec.ac.in');
      expect(admin?.role).toBe('superadmin');
      expect(admin?.authMethod).toBe('supabase_auth');
    });
  });

  describe('getAuthenticatedAdmin with legacy cookie fallback', () => {
    it('authenticates using valid chaturanga_admin_session cookie when no Supabase user exists', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: new Error('No session')
      });

      mockCookieStore.get.mockImplementation((name: string) => {
        if (name === 'chaturanga_admin_session') {
          return { name, value: 'test-admin-secret-token-12345' };
        }
        return undefined;
      });

      const admin = await getAuthenticatedAdmin();

      expect(admin).not.toBeNull();
      expect(admin?.id).toBe('env-admin-fallback');
      expect(admin?.role).toBe('superadmin');
      expect(admin?.authMethod).toBe('legacy_env');
    });

    it('rejects invalid or tampered session token in cookie', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null
      });

      mockCookieStore.get.mockImplementation((name: string) => {
        if (name === 'chaturanga_admin_session') {
          return { name, value: 'forged-fake-token' };
        }
        return undefined;
      });

      const admin = await getAuthenticatedAdmin();
      expect(admin).toBeNull();
    });
  });

  describe('Unauthenticated callers', () => {
    it('returns null when neither Supabase auth nor legacy session cookie is present', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null
      });

      mockCookieStore.get.mockReturnValue(undefined);

      const admin = await getAuthenticatedAdmin();
      expect(admin).toBeNull();
    });
  });

  describe('isAdminAuthenticated helper', () => {
    it('returns true when getAuthenticatedAdmin succeeds', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: {
          user: {
            id: 'arbiter-uuid-001',
            email: 'admin@chaturanga-jgec.ac.in'
          }
        },
        error: null
      });

      const isAuth = await isAdminAuthenticated();
      expect(isAuth).toBe(true);
    });

    it('returns false when caller is unauthenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null
      });
      mockCookieStore.get.mockReturnValue(undefined);

      const isAuth = await isAdminAuthenticated();
      expect(isAuth).toBe(false);
    });
  });
});
