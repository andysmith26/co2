// src/routes/(protected)/projects/[projectId]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  const { projectId } = params;
  
  try {
    // Get session
    const { session } = await locals.getSession();
    
    if (!session) {
      // This will be caught by the authGuard in hooks.server.ts
      // But we include it for clarity
      return { project: null, error: "Authentication required" };
    }
    
    return {
      projectId
    };
  } catch (err) {
    console.error('Error loading project page:', err);
    throw error(500, 'Failed to load project data');
  }
};
