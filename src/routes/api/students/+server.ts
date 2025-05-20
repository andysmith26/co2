// src/routes/api/students/+server.ts
import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

export async function GET({ locals, request, url }) {
  try {
    // Get session
    const session = await locals.getSession();
    
    // Log authentication status
    console.log("API students - authentication status:", session ? "Authenticated" : "Not authenticated");
    
    if (!session) {
      console.log("API students - unauthorized access attempt");
      return json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check for query parameters
    const searchQuery = url.searchParams.get('search');
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const offset = (page - 1) * limit;
    const getAll = url.searchParams.get('all') === 'true';
    
    // For authenticated requests, use the server's Supabase client which has the session
    let query = locals.supabase
      .from('students')
      .select('id, first_name, last_initial, teacher_id, status')
      .order('first_name');
    
    // Apply search filter if provided
    if (searchQuery) {
      query = query.ilike('first_name', `%${searchQuery}%`);
    }
    
    // If not getting all, apply pagination
    if (!getAll) {
      query = query.range(offset, offset + limit - 1);
    }
    
    // Get total count for pagination
    const { count: totalCount } = await locals.supabase
      .from('students')
      .select('*', { count: 'exact', head: true });
    
    const { data, error } = await query;
      
    if (error) throw error;
    
    console.log(`API students - fetched ${data?.length || 0} students for user ${session.user.email}`);
    return json({
      students: data || [],
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching students:', err);
    return json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}
