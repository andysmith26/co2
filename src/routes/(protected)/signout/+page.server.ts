import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export function load() {
  return {};
}

export const actions: Actions = {
  default: async ({ locals }) => {
    await locals.supabase.auth.signOut();
    throw redirect(303, '/login');
  }
};