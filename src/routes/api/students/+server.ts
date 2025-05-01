// src/routes/api/students/+server.ts
import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

export async function GET({ locals, request }) {
  try {
    // Get session
    const session = await locals.getSession();
    
    // Log authentication status
    console.log("API students - authentication status:", session ? "Authenticated" : "Not authenticated");
    
    if (!session) {
      console.log("API students - unauthorized access attempt");
      return json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // For authenticated requests, use the server's Supabase client which has the session
    const { data, error } = await locals.supabase
      .from('students')
      .select('*')
      .order('first_name');
      
    if (error) throw error;
    
    console.log(`API students - fetched ${data?.length || 0} students for user ${session.user.email}`);
    return json(data || []);
  } catch (err) {
    console.error('Error fetching students:', err);
    return json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST({ request, locals }) {
  try {
    // Get session
    const session = await locals.getSession();
    
    if (!session) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    if (!body.first_name) {
      return json({ error: 'First name is required' }, { status: 400 });
    }
    
    // Use the server's Supabase client which has the session
    const { data, error } = await locals.supabase
      .from('students')
      .insert({
        first_name: body.first_name,
        last_initial: body.last_initial?.charAt(0).toUpperCase() || '',
        teacher_id: session.user.id, // Set the teacher_id to the logged-in user's ID
        status: 'present'
      })
      .select()
      .single();
      
    if (error) throw error;
    
    console.log(`API students - created student for user ${session.user.email}`);
    return json(data, { status: 201 });
  } catch (err) {
    console.error('Error creating student:', err);
    return json({ error: 'Failed to create student' }, { status: 500 });
  }
}