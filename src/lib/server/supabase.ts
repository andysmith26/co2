// src/lib/server/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_KEY } from '$env/static/private';

// Server-side admin client with full privileges
export const supabaseAdmin = createClient(
    PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_KEY,
    {
        auth: {
        persistSession: false
        }
    }
);

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