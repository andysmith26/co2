import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  // Get the verified session and user from the server
  const { session, user } = await locals.getSession();
  
  // Only return the data, not the client
  return {
    session,
    user
  };
};