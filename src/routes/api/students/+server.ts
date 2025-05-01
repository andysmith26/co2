// src/routes/api/students/+server.ts
import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('first_name');
      
    if (error) throw error;
    return json(data || []);
  } catch (err) {
    console.error('Error fetching students:', err);
    return json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST({ request }) {
    try {
      const body = await request.json();
      
      // Validate input
      if (!body.first_name) {
        return json({ error: 'First name is required' }, { status: 400 });
      }
      
      // Add a default teacher_id 
      // In a production app, you would get this from the authenticated user
      const defaultTeacherId = '00000000-0000-0000-0000-000000000000'; // Use a valid UUID that exists in your database
      
      const { data, error } = await supabase
        .from('students')
        .insert({
          teacher_id: defaultTeacherId, // Add this line
          first_name: body.first_name,
          last_initial: body.last_initial?.charAt(0).toUpperCase() || '',
          status: 'present'
        })
        .select()
        .single();
        
      if (error) throw error;
      return json(data, { status: 201 });
    } catch (err) {
      console.error('Error creating student:', err);
      return json({ error: 'Failed to create student' }, { status: 500 });
    }
  }