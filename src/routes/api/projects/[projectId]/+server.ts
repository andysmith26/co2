// src/routes/api/projects/[projectId]/+server.ts
import { json } from '@sveltejs/kit';
import { getSupabase } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
  const { projectId } = params;
  
  try {
    const { session } = await locals.getSession();
    
    if (!session) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabase(session.access_token);
    
    // Get the project
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return json({ error: 'Project not found' }, { status: 404 });
      }
      console.error('Error fetching project:', error);
      return json({ error: error.message }, { status: 500 });
    }
    
    return json(data);
  } catch (err) {
    console.error('Error processing request:', err);
    return json({ error: 'Server error' }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  const { projectId } = params;
  
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
    
    const supabase = getSupabase(session.access_token);
    
    // Update the project
    const { data, error } = await supabase
      .from('projects')
      .update({
        title: body.title,
        description: body.description !== undefined ? body.description : undefined,
        status: body.status || undefined
      })
      .eq('id', projectId)
      .select()
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return json({ error: 'Project not found' }, { status: 404 });
      }
      console.error('Error updating project:', error);
      return json({ error: error.message }, { status: 500 });
    }
    
    return json(data);
  } catch (err) {
    console.error('Error processing request:', err);
    return json({ error: 'Server error' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  const { projectId } = params;
  
  try {
    const { session } = await locals.getSession();
    
    if (!session) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabase(session.access_token);
    
    // Delete the project
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
      
    if (error) {
      if (error.code === 'PGRST116') {
        return json({ error: 'Project not found' }, { status: 404 });
      }
      console.error('Error deleting project:', error);
      return json({ error: error.message }, { status: 500 });
    }
    
    return json({ success: true });
  } catch (err) {
    console.error('Error processing request:', err);
    return json({ error: 'Server error' }, { status: 500 });
  }
};
