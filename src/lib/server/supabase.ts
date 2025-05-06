// src/lib/server/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { SUPABASE_SERVICE_KEY } from '$env/static/private';
import type { Database } from '../types/database.types';

// Server-side admin client with full privileges
export const supabaseAdmin = createClient<Database>(
    PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_KEY,
    {
        auth: {
        persistSession: false
        }
    }
);

// Create a Supabase client with the user's access token
export function getSupabase(accessToken: string) {
  return createClient<Database>(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    }
  );
}

// Helper function to check if a user is an admin
export async function isAdmin(locals) {
  try {
    // Get user with token verification (secure method)
    const { data: { user }, error } = await locals.supabase.auth.getUser();
    
    if (error || !user) {
      console.log('User verification failed or no user found:', error?.message);
      return false;
    }
    
    // Log the user metadata for debugging
    console.log('User metadata (verified):', user.app_metadata);
    
    // Check admin flag in app_metadata
    return user.app_metadata?.admin === true;
  } catch (err) {
    console.error('Error checking admin status:', err);
    return false;
  }
}