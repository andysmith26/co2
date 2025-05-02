// src/routes/(protected)/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  // Get validated session
  const { session, user } = await locals.getSession();
  
  // If there's no session, redirect to login with return URL
  if (!session) {
    // This is a backup check in case the hooks guard somehow didn't catch it
    throw redirect(303, `/login?redirectTo=${encodeURIComponent(url.pathname)}`);
  }
  
  // Return session and user for use in the layout
  return { session, user };
};