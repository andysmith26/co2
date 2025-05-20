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
      if (!body.title.trim()) {
        return json({ error: 'Task title cannot be empty' }, { status: 400 });
      }
      updates.title = body.title;
    }
    
    if (body.description !== undefined) {
      updates.description = body.description;
    }
    
    if (body.status !== undefined) {
      updates.status = body.status;
    }
    
    if (body.assignee_id !== undefined) {
      // If assignee is specified, verify they are a member of the group
      if (body.assignee_id) {
        // First get the project to find the group
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('group_id')
          .eq('id', projectId)
          .single();
          
        if (projectError) {
          return json({ error: 'Project not found' }, { status: 404 });
        }
        
        // Then check if assignee is a member of the group
        const { data: assigneeMember, error: assigneeError } = await supabase
          .from('group_members')
          .select('id')
          .eq('group_id', project.group_id)
          .eq('user_id', body.assignee_id)
          .single();
          
        if (assigneeError || !assigneeMember) {
          return json({ error: 'Assignee is not a member of this group' }, { status: 400 });
        }
      }
      
      updates.assignee_id = body.assignee_id;
    }
    
    // Only proceed if there are updates to make
    if (Object.keys(updates).length === 0) {
      return json({ error: 'No updates provided' }, { status: 400 });
    }
    
    // Update the task
    const { data, error } = await supabase
      .from('project_tasks')
      .update(updates)
      .eq('id', taskId)
      .eq('project_id', projectId)
      .select()
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return json({ error: 'Task not found' }, { status: 404 });
      }
      console.error('Error updating task:', error);
      return json({ error: error.message }, { status: 500 });
    }
    
    return json(data);
  } catch (err) {
    console.error('Error processing request:', err);
    return json({ error: 'Server error' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  const { projectId, taskId } = params;
  
  try {
    const { session } = await locals.getSession();
    
    if (!session) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabase(session.access_token);
    
    // Delete the task
    const { error } = await supabase
      .from('project_tasks')
      .delete()
      .eq('id', taskId)
      .eq('project_id', projectId);
      
    if (error) {
      if (error.code === 'PGRST116') {
        return json({ error: 'Task not found' }, { status: 404 });
      }
      console.error('Error deleting task:', error);
      return json({ error: error.message }, { status: 500 });
    }
    
    return json({ success: true });
  } catch (err) {
    console.error('Error processing request:', err);
    return json({ error: 'Server error' }, { status: 500 });
  }
};
