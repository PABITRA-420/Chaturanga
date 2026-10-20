import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/admin/login/route';
import { createSupabaseServerClient, supabaseServer, getSupabaseConfig } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

vi.mock('@/lib/supabase/server', () => ({
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
}));

describe('API Route: POST /api/admin/login', () => {
  let mockSupabase: any;
  let mockProfileQuery: any;
  let mockCookieStore: any;

  beforeEach(() => {
    vi.clearAllMocks();

    process.env.ADMIN_EMAIL = 'admin@chaturanga-jgec.ac.in';
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD = 'super-secret-password-2026';
    process.env.ADMIN_SESSION_TOKEN = 'token-session-valid-999';

    mockProfileQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockReturnThis()
    };

    vi.mocked(supabaseServer.from).mockReturnValue(mockProfileQuery as any);

    mockSupabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Invalid login credentials')
        }),
        signOut: vi.fn().mockResolvedValue({})
      },
      from: vi.fn().mockReturnValue(mockProfileQuery)
    };

    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSupabase);

    mockCookieStore = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      getAll: vi.fn().mockReturnValue([])
    };

    vi.mocked(cookies).mockResolvedValue(mockCookieStore);
  });

  it('authenticates via Supabase Auth when credentials match active arbiter profile', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: {
        user: {
          id: 'admin-id-123',
          email: 'arbiter@chaturanga-jgec.ac.in'
        }
      },
      error: null
    });

    mockProfileQuery.maybeSingle.mockResolvedValueOnce({
      data: {
        id: 'admin-id-123',
        email: 'arbiter@chaturanga-jgec.ac.in',
        full_name: 'Tournament Arbiter',
        role: 'arbiter',
        is_active: true
      },
      error: null
    });

    const request = new Request('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'arbiter@chaturanga-jgec.ac.in',
        password: 'ArbiterSecurePassword!'
      })
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.authMethod).toBe('supabase_auth');
    expect(body.user.role).toBe('arbiter');
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      'chaturanga_admin_session',
      'token-session-valid-999',
      expect.any(Object)
    );
  });

  it('denies login and returns 403 when admin profile has is_active: false', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: {
        user: {
          id: 'admin-deactivated-456',
          email: 'deactivated@chaturanga-jgec.ac.in'
        }
      },
      error: null
    });

    mockProfileQuery.maybeSingle.mockResolvedValueOnce({
      data: {
        id: 'admin-deactivated-456',
        email: 'deactivated@chaturanga-jgec.ac.in',
        full_name: 'Deactivated Arbiter',
        role: 'arbiter',
        is_active: false
      },
      error: null
    });

    const request = new Request('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'deactivated@chaturanga-jgec.ac.in',
        password: 'Password123!'
      })
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.error).toContain('Administrator account has been deactivated');
    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });

  it('authenticates via legacy environment fallback credentials when Supabase sign-in fails', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('User not found in Supabase Auth')
    });

    const request = new Request('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'super-secret-password-2026'
      })
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.authMethod).toBe('legacy_env');
    expect(body.user.role).toBe('superadmin');
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      'chaturanga_admin_session',
      'token-session-valid-999',
      expect.any(Object)
    );
  });

  it('returns 400 when identifier or password is missing', async () => {
    const request = new Request('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin'
        // password omitted
      })
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toContain('Please enter both Admin Email / ID and Password');
  });

  it('returns 401 when invalid credentials fail both Supabase and env fallback', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('Invalid login credentials')
    });

    const request = new Request('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'intruder',
        password: 'wrongpassword'
      })
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error).toContain('Invalid');
  });
});
