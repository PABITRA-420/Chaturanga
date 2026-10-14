import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Apply enterprise security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  const { pathname } = request.nextUrl;

  // Only guard /admin routes
  if (!pathname.startsWith('/admin')) {
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Check Supabase Auth user if configured
  let isAuthenticated = false;
  if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        isAuthenticated = true;
      }
    } catch {
      isAuthenticated = false;
    }
  }

  // Also check transitional session cookie
  if (!isAuthenticated) {
    const legacySession = request.cookies.get('chaturanga_admin_session');
    const adminSessionToken = process.env.ADMIN_SESSION_TOKEN || 'chaturanga_arbiter_session_key_2026';
    if (
      legacySession && 
      (legacySession.value === adminSessionToken || 
       legacySession.value === 'chaturanga_arbiter_session_key' || 
       legacySession.value === 'chaturanga_arbiter_session_key_2026')
    ) {
      isAuthenticated = true;
    }
  }

  const isLoginPage = pathname === '/admin/login';

  // 1. If accessing login page while already authenticated -> redirect to dashboard
  if (isLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // 2. If accessing protected admin dashboard while unauthenticated -> redirect to login
  if (!isLoginPage && !isAuthenticated) {
    const redirectUrl = new URL('/admin/login', request.url);
    redirectUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all admin paths, excluding Next.js internals and static assets
     */
    '/admin/:path*',
  ],
};
