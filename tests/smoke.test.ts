import { describe, it, expect } from 'vitest';
import { getSupabaseConfig } from '@/lib/supabase/server';

describe('Smoke Test Harness', () => {
  it('correctly loads test environment and path aliases', () => {
    const config = getSupabaseConfig();
    expect(config.url).toBe('https://test-project.supabase.co');
    expect(config.anonKey).toBe('test-anon-key');
    expect(config.isConfigured).toBe(true);
  });

  it('DOM environment is functional via happy-dom', () => {
    const element = document.createElement('div');
    element.textContent = 'Chaturanga JGEC';
    document.body.appendChild(element);

    expect(element).toBeInTheDocument();
    expect(element.textContent).toBe('Chaturanga JGEC');
    document.body.removeChild(element);
  });
});
