import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  // Get validated session
  const { session } = await locals.getSession();
  
  // If there's no session, redirect to login
  if (!session) {
    throw redirect(303, '/login');
  }
  
  // Return empty object - we already have session in the parent layout
  return {};
};