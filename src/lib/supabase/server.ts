import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey;
  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
  );
  return { url, anonKey, serviceKey, isConfigured };
}

/**
 * Server-side Supabase client for Next.js App Router route handlers & server components.
 * Seamlessly manages session cookies and JWT exchange.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseConfig();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Can happen in Server Components where cookies cannot be mutated
        }
      },
    },
  });
}

/**
 * Direct server client instance for background operations and queries.
 * Wrapped in a Proxy to ensure dynamic resolution of environment variables in serverless environments.
 */
let cachedServerClient: any = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getSupabaseServerClient() {
  const { url, serviceKey } = getSupabaseConfig();
  if (!cachedServerClient || lastUsedUrl !== url || lastUsedKey !== serviceKey) {
    cachedServerClient = createClient(url, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    lastUsedUrl = url;
    lastUsedKey = serviceKey;
  }
  return cachedServerClient;
}

export const supabaseServer = new Proxy({} as any, {
  get(_target, prop) {
    const client = getSupabaseServerClient();
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});
