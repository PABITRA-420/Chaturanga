import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gwceeuyenweuszxzmewp.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_94kWHRyoKPPlJ77l01RvQg_yEwhnNsy';
  return createBrowserClient(url, key);
}
