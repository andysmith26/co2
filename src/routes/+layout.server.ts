import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  try {
    // First get authenticated user using recommended method
    const { data: { user }, error: userError } = await locals.supabase.auth.getUser();
    
    if (userError || !user) {
      // Not authenticated or error occurred
      return {
        session: null,
        user: null
      };
    }
    
    // If we have a user, get the session (which we know exists)
    const { data: { session } } = await locals.supabase.auth.getSession();
    
    // Return both user and session
    return {
      session,
      user
    };
  } catch (err) {
    console.error('Error in layout load function:', err);
    return {
      session: null,
      user: null
    };
  }
};