// Shared Supabase Configuration for All 3 Sites
// Add your Supabase credentials to .env.local in the ROOT of the project

import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { env } from '../utils/runtimeEnv';

// Supabase configuration from environment variables
const supabaseUrl = env('VITE_SUPABASE_URL');
const supabaseAnonKey = env('VITE_SUPABASE_ANON_KEY');

// Initialize Supabase client (singleton)
let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// Export for use in all sites
export { supabase };

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && supabase);
};

// Get current Supabase client
export const getSupabase = (): SupabaseClient => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local file.');
  }
  return supabase;
};
