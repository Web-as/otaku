import { createClient } from '@supabase/supabase-js';
import { env } from '../utils/runtimeEnv';

// Use the Service Role Key for Admin operations (Server-side ONLY)
const supabaseUrl = env('VITE_SUPABASE_URL') || env('SUPABASE_URL');
const supabaseServiceKey = env('SUPABASE_SERVICE_ROLE_KEY');

export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;
