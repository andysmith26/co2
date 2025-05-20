// src/routes/api/projects/[projectId]/tasks/[taskId]/+server.ts
import { json } from '@sveltejs/kit';
import { getSupabase } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
  const { projectId, taskId } = params;
  
  try {
    const { session } = await locals.getSession();
    
    if (!session) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabase(session.access_token);
    
    // Get the task
    const { data, error } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('id', taskId)
      .eq('project_id', projectId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return json({ error: 'Task not found' }, { status: 404 });
      }
      console.error('Error fetching task:', error);
      return json({ error: error.message }, { status: 500 });
    }
    
    return json(data);
  } catch (err) {
    console.error('Error processing request:', err);
    return json({ error: 'Server error' }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  const { projectId, taskId } = params;
  
  try {
    const { session } = await locals.getSession();
    
    if (!session) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const supabase = getSupabase(session.access_token);
    
    // Prepare update object with only the fields that are present
    const updates: any = {};
    
    if (body.title !== undefined) {
      if (!body.title.
