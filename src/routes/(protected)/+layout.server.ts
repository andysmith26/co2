// src/routes/(protected)/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  try {
    // Get authenticated user with the secure method
    const { data: { user }, error: userError } = await locals.supabase.auth.getUser();
    
    if (userError || !user) {
      // User is not authenticated or token is invalid
      throw redirect(303, `/login?redirectTo=${encodeURIComponent(url.pathname)}`);
    }
    
    // Now get the session (which we know exists since user is authenticated)
    const { data: { session } } = await locals.supabase.auth.getSession();
    
    // Return both for use in the layout
    return { session, user };
  } catch (err) {
    // If err is not a redirect, it's an unexpected error
    if (!(err instanceof Response)) {
      console.error('Error in protected layout:', err);
    }
    throw err;
  }
};