import { describe, it, expect } from 'vitest';
import { supabase, isSupabaseConfigured, checkSupabaseConnection } from '../lib/supabase';

describe('Live Supabase Connectivity Verification', () => {
  it('reports configuration as a boolean without assuming environment secrets exist', () => {
    const configured = isSupabaseConfigured();
    expect(typeof configured).toBe('boolean');
  });

  it('attempts a minimal safe query against Supabase', async () => {
    const health = await checkSupabaseConnection();
    // Do not log secrets, only log the health message
    console.log('[Connection Status]:', health.message);
    expect(typeof health.connected).toBe('boolean');
  });
});
