// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  // Get the session from the server
  const session = await locals.getSession();
  
  // Return session data
  return {
    session
  };
};