import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Checks whether valid Supabase credentials have been configured
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project-ref.supabase.co' &&
    supabaseUrl.startsWith('http') &&
    supabaseAnonKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' &&
    supabaseAnonKey.length > 20
  );
};

// Create typed Supabase client with graceful fallback for unconfigured environments
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl && supabaseUrl.startsWith('http') ? supabaseUrl : 'https://placeholder.supabase.co',
  supabaseAnonKey && supabaseAnonKey.length > 20 ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
);

/**
 * Verifies live Supabase connectivity against the brand_profiles table
 */
export async function checkSupabaseConnection(): Promise<{ connected: boolean; message: string; needsMigration?: boolean }> {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      message: 'Supabase credentials not configured. Running in Local Demo Mode.'
    };
  }

  try {
    const { error } = await supabase
      .from('brand_profiles')
      .select('id', { count: 'exact', head: true });

    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('Could not find the table')) {
        return {
          connected: false,
          needsMigration: true,
          message: 'Connected to Supabase project, but database tables are not yet created. Execute supabase/schema.sql in the Supabase SQL Editor.'
        };
      }
      return {
        connected: false,
        message: `Supabase error: ${error.message}`
      };
    }

    return {
      connected: true,
      message: 'Connected to Supabase (Row Level Security active).'
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Network error connecting to Supabase: ${err.message || 'Unknown error'}`
    };
  }
}

