// src/routes/api/groups/+server.ts
import { json } from '@sveltejs/kit';
import { getSupabase } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  const { session } = await locals.getSession();
  if (!session) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase(session.access_token);
  
  // Get groups created by the current user (teacher)
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching groups:', error);
    return json({ error: error.message }, { status: 500 });
  }
  
  return json(data);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const { session } = await locals.getSession();
  if (!session) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, description } = await request.json();
    
    // Validate input
    if (!name || typeof name !== 'string' || !name.trim()) {
      return json({ error: 'Group name is required' }, { status: 400 });
    }
    
    const supabase = getSupabase(session.access_token);
    
    // Insert new group
    const { data, error } = await supabase
      .from('groups')
      .insert([{
        name: name.trim(),
        description: description?.trim() || null,
        created_by: session.user.id
      }])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating group:', error);
      return json({ error: error.message }, { status: 500 });
    }
    
    // Automatically add the creator as a teacher in the group
    const { error: memberError } = await supabase
      .from('group_members')
      .insert([{
        group_id: data.id,
        user_id: session.user.id,
        role: 'teacher'
      }]);
      
    if (memberError) {
      console.error('Error adding teacher to group:', memberError);
      // We don't return an error here as the group was created successfully
    }
    
    return json(data);
  } catch (err) {
    console.error('Error processing request:', err);
    return json({ error: 'Invalid request data' }, { status: 400 });
  }
};