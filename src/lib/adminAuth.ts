import { cookies } from 'next/headers';

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('chaturanga_admin_session');
    return Boolean(session && session.value === 'authenticated_arbiter_session_2026');
  } catch {
    return false;
  }
}
