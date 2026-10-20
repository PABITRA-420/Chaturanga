import '@testing-library/jest-dom/vitest';
import { beforeEach, vi } from 'vitest';

// Configure test environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.ADMIN_SESSION_TOKEN = 'test-admin-secret-token-12345';
process.env.ADMIN_EMAIL = 'admin@chaturanga-jgec.ac.in';
process.env.ADMIN_PASSWORD = 'test-password';
process.env.GOOGLE_SHEET_WEBAPP_URL = 'https://script.google.com/macros/s/test-app-id/exec';

// Mock Next.js navigation hooks
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Mock Next.js headers (cookies)
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn((name: string) => {
      if (name === 'chaturanga_admin_session') {
        return { name, value: 'test-admin-secret-token-12345' };
      }
      return undefined;
    }),
    set: vi.fn(),
    delete: vi.fn(),
    getAll: vi.fn(() => []),
  })),
}));

beforeEach(() => {
  vi.clearAllMocks();
});
