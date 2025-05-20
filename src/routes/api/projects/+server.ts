// src/routes/api/projects/+server.ts
import { json } from '@sveltejs/kit';
import { getSupabase } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    const { session } = await locals.getSession();
    
    if (!session) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabase(session.access_token);
    
    // Check if a specific group is requested
    const groupId = url.searchParams.get('groupId');
    
    // Build the query
    let query = supabase
      .from('projects')
      .select('*');
      
    // Filter by group if specified
    if (groupId) {
      query = query.eq('group_id', groupId);
    }
    
    // Execute the query with sorting
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching projects:', error);
      return json({ error: error.message }, { status: 500 });
    }
    
    return json(data || []);
  } catch (err) {
    console.error('Error processing request:', err);
    return json({ error: 'Server error' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const { session } = await locals.getSession();
    
    if (!session) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate input
    if (!body.title) {
      return json({ error: 'Project title is required' }, { status: 400 });
    }
    
    if (!body.group_id) {
      return json({ error: 'Group ID is required' }, { status: 400 });
    }
    
    const supabase = getSupabase(session.access_token);
    
    // Check if the user has permission to create a project in this group
    const { data: groupMember, error: memberError } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', body.group_id)
      .eq('user_id', session.user.id)
      .single();
      
    if (memberError || !groupMember) {
      return json({ error: 'You are not a member of this group' }, { status: 403 });
    }
    
    if (groupMember.role !== 'teacher') {
      return json({ error: 'Only teachers can create projects' }, { status: 403 });
    }
    
    // Insert the new project
    const { data, error } = await supabase
      .from('projects')
      .insert({
        title: body.title,
        description: body.description || null,
        status: body.status || 'active',
        created_by: session.user.id,
        group_id: body.group_id
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating project:', error);
      return json({ error: error.message }, { status: 500 });
    }
    
    return json(data, { status: 201 });
  } catch (err) {
    console.error('Error processing request:', err);
    return json({ error: 'Server error' }, { status: 500 });
  }
};
