// src/routes/api/groups/[groupId]/+server.ts
import { json } from '@sveltejs/kit';
import { getSupabase } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
  const { groupId } = params;
  const { session } = await locals.getSession();
  
  if (!session) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase(session.access_token);
  
  // Get specific group by ID
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();
    
  if (error) {
    console.error(`Error fetching group ${groupId}:`, error);
    if (error.code === 'PGRST116') {
      return json({ error: 'Group not found' }, { status: 404 });
    }
    return json({ error: error.message }, { status: 500 });
  }
  
  return json(data);
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  const { groupId } = params;
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
    
    // Update the group
    const { data, error } = await supabase
      .from('groups')
      .update({
        name: name.trim(),
        description: description?.trim() || null
      })
      .eq('id', groupId)
      .select()
      .single();
      
    if (error) {
      console.error(`Error updating group ${groupId}:`, error);
      if (error.code === 'PGRST116') {
        return json({ error: 'Group not found' }, { status: 404 });
      }
      return json({ error: error.message }, { status: 500 });
    }
    
    return json(data);
  } catch (err) {
    console.error('Error processing request:', err);
    return json({ error: 'Invalid request data' }, { status: 400 });
  }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  const { groupId } = params;
  const { session } = await locals.getSession();
  
  if (!session) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase(session.access_token);
  
  // Delete the group (cascade delete will handle group members due to foreign key constraint)
  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId);
    
  if (error) {
    console.error(`Error deleting group ${groupId}:`, error);
    if (error.code === 'PGRST116') {
      return json({ error: 'Group not found' }, { status: 404 });
    }
    return json({ error: error.message }, { status: 500 });
  }
  
  return json({ success: true });
};