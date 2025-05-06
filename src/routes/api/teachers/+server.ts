// src/routes/api/teachers/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url }) => {
  try {
    // Get session
    const { session } = await locals.getSession();
    
    if (!session) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if there's a search parameter
    const searchQuery = url.searchParams.get('search');
    
    // For authenticated requests, use the server's Supabase client which has the session
    let query = locals.supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .order('first_name');
    
    // Apply search filter if provided
    if (searchQuery) {
      query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
    }
    
    const { data, error } = await query;
      
    if (error) throw error;
    
    console.log(`API teachers - fetched ${data?.length || 0} teachers`);
    return json(data || []);
  } catch (err) {
    console.error('Error fetching teachers:', err);
    return json({ error: 'Failed to fetch teachers' }, { status: 500 });
  }
};