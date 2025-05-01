import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Simply having this file makes the directory a server route
// The auth guard in hooks.server.ts will protect these routes

export const load: PageServerLoad = async ({ locals }) => {
  // This file ensures server-side protection of all routes
  return {};
};

// Define actions for forms in protected routes
export const actions: Actions = {
  signout: async ({ locals, cookies }) => {
    // Sign the user out
    await locals.supabase.auth.signOut();
    
    // Redirect to the login page
    throw redirect(303, '/login');
  }
};