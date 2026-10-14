import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const hasServiceRoleKey = Boolean(
    serviceKey && !serviceKey.includes('placeholder')
  );
  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
  );
  return { url, anonKey, serviceKey, hasServiceRoleKey, isConfigured };
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
 * Privileged queries against admin_profiles strictly require SUPABASE_SERVICE_ROLE_KEY and never fall back to anonKey.
 */
let cachedServerClient: any = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getSupabaseServerClient() {
  const { url, serviceKey, anonKey, hasServiceRoleKey } = getSupabaseConfig();
  const keyToUse = hasServiceRoleKey ? serviceKey : anonKey;
  if (!cachedServerClient || lastUsedUrl !== url || lastUsedKey !== keyToUse) {
    cachedServerClient = createClient(url, keyToUse, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    lastUsedUrl = url;
    lastUsedKey = keyToUse;
  }
  return cachedServerClient;
}

export const supabaseServer = new Proxy({} as any, {
  get(_target, prop) {
    const client = getSupabaseServerClient();
    if (prop === 'from') {
      return (table: string) => {
        if (table === 'admin_profiles') {
          const { hasServiceRoleKey } = getSupabaseConfig();
          if (!hasServiceRoleKey) {
            throw new Error(
              'Privileged access to admin_profiles via supabaseServer requires SUPABASE_SERVICE_ROLE_KEY. ' +
              'Perform the role check through an authenticated client created with createSupabaseServerClient() when service-role key is absent.'
            );
          }
        }
        return client.from(table);
      };
    }
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});
