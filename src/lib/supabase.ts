// This file is intentionally minimal - we use createServerClient and createBrowserClient directly
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from './types/database.types';

// Only use this client in server-only code that doesn't have access to event.locals
export const supabase = createClient<Database>(
  PUBLIC_SUPABASE_URL, 
  PUBLIC_SUPABASE_ANON_KEY
);