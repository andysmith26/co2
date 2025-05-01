// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

export const handle: Handle = async ({ event, resolve }) => {
  // TEMPORARY SOLUTION: Using browser-style client in server context
  // NOTE: This is insecure for proper session validation and will be fixed in Phase 4
  event.locals.supabase = supabase;
  
  // Simple session access for now
  event.locals.getSession = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session;
  };

  return resolve(event);
};