// src/routes/api/students/+server.ts
import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

export async function GET({ locals, request, url }) {
  console.log('🐛 DEBUG: GET /api/students called');
  try {
    // Get session
    const session = await locals.getSession();
    
    // Log authentication status
    console.log("🐛 DEBUG: API students GET - authentication status:", session ? "Authenticated" : "Not authenticated");
    
    if (!session) {
      console.log("🐛 DEBUG: API students GET - unauthorized access attempt");
      return json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check for query parameters
    const searchQuery = url.searchParams.get('search');
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const offset = (page - 1) * limit;
    const getAll = url.searchParams.get('all') === 'true';
    
    console.log('🐛 DEBUG: Query parameters:', { searchQuery, limit, page, offset, getAll });
    
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
    
    console.log('🐛 DEBUG: Total student count:', totalCount);
    
    const { data, error } = await query;
      
    if (error) {
      console.error('🐛 DEBUG: Database query error:', error);
      throw error;
    }
    
    console.log(`🐛 DEBUG: GET fetched ${data?.length || 0} students for user ${session.user.email}`);
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
    console.error('🐛 DEBUG: GET /api/students error:', err);
    return json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST({ locals, request }) {
  console.log('🐛 DEBUG: POST /api/students called');
  
  try {
    // Get session
    const session = await locals.getSession();
    
    console.log("🐛 DEBUG: API students POST - authentication status:", session ? "Authenticated" : "Not authenticated");
    console.log("🐛 DEBUG: Session user:", session?.user?.email);
    
    if (!session) {
      console.log("🐛 DEBUG: API students POST - unauthorized access attempt");
      return json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
      console.log('🐛 DEBUG: Request body received:', requestBody);
    } catch (parseError) {
      console.error('🐛 DEBUG: Failed to parse request body:', parseError);
      return json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    const { first_name, last_initial } = requestBody;
    
    // Validate input
    if (!first_name || typeof first_name !== 'string' || !first_name.trim()) {
      console.error('🐛 DEBUG: Validation failed - first_name missing or invalid:', first_name);
      return json({ error: 'First name is required and must be a non-empty string' }, { status: 400 });
    }
    
    if (!last_initial || typeof last_initial !== 'string' || !last_initial.trim()) {
      console.error('🐛 DEBUG: Validation failed - last_initial missing or invalid:', last_initial);
      return json({ error: 'Last initial is required and must be a non-empty string' }, { status: 400 });
    }
    
    // Prepare data for insertion
    const studentData = {
      first_name: first_name.trim(),
      last_initial: last_initial.trim().charAt(0).toUpperCase(),
      teacher_id: session.user.id,
      status: 'present' // default status
    };
    
    console.log('🐛 DEBUG: Data prepared for database insertion:', studentData);
    
    // Insert into database
    const { data, error } = await locals.supabase
      .from('students')
      .insert([studentData])
      .select()
      .single();
    
    if (error) {
      console.error('🐛 DEBUG: Database insertion error:', error);
      console.error('🐛 DEBUG: Error code:', error.code);
      console.error('🐛 DEBUG: Error message:', error.message);
      console.error('🐛 DEBUG: Error details:', error.details);
      console.error('🐛 DEBUG: Error hint:', error.hint);
      
      // Check for specific database constraint errors
      if (error.code === '23505') {
        return json({ error: 'A student with these details already exists' }, { status: 409 });
      } else if (error.code === '23502') {
        return json({ error: 'Missing required field' }, { status: 400 });
      } else if (error.code === '23514') {
        return json({ error: 'Data does not match expected format or constraint' }, { status: 400 });
      }
      
      return json({ 
        error: `Database error: ${error.message}`,
        code: error.code,
        details: error.details 
      }, { status: 500 });
    }
    
    console.log('🐛 DEBUG: Student created successfully:', data);
    return json(data, { status: 201 });
    
  } catch (err) {
    console.error('🐛 DEBUG: Unexpected error in POST /api/students:', err);
    console.error('🐛 DEBUG: Error stack:', err.stack);
    return json({ 
      error: 'Internal server error', 
      message: err.message 
    }, { status: 500 });
  }
}