// src/lib/server/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from '$env/static/private';

// Server-side admin client with full privileges
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  {
    auth: {
      persistSession: false
    }
  }
);

// Helper function to check if a user is an admin
export async function isAdmin(locals) {
  const session = await locals.getSession();
  return session?.user?.app_metadata?.admin === true;
}