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
    
    // Handle assignee type
    if (body.assignee_type !== undefined) {
      updates.assignee_type = body.assignee_type;
    }
    
    // FIXED: Improved assignee validation for updates
    let needsValidation = false;
    let validationData = null;
    
    // Get project's group_id for validation if we're updating assignees
    if ((body.assignee_id !== undefined || body.student_assignee_id !== undefined) && 
        (body.assignee_id || body.student_assignee_id)) {
      
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('group_id')
        .eq('id', projectId)
        .single();
        
      if (projectError) {
        return json({ error: 'Project not found' }, { status: 404 });
      }
      
      needsValidation = true;
      validationData = { groupId: project.group_id };
    }
    
    // Handle teacher assignee
    if (body.assignee_id !== undefined) {
      // If assignee is specified, verify they are a member of the group
      if (body.assignee_id && needsValidation) {
        const { data: memberCheck, error: memberError } = await supabase
          .from('group_members')
          .select('id, role')
          .eq('group_id', validationData.groupId)
          .eq('user_id', body.assignee_id)
          .eq('role', 'teacher')
          .single();
          
        if (memberError || !memberCheck) {
          console.error('Teacher membership validation failed:', {
            assignee_id: body.assignee_id,
            group_id: validationData.groupId,
            error: memberError
          });
          return json({ error: 'Teacher assignee is not a member of this group' }, { status: 400 });
        }
      }
      
      updates.assignee_id = body.assignee_id;
      
      // If explicitly setting teacher assignee, clear any student assignee
      if (body.assignee_id && body.assignee_type === 'teacher') {
        updates.student_assignee_id = null;
      }
    }
    
    // Handle student assignee
    if (body.student_assignee_id !== undefined) {
      // If student assignee is specified, verify they are a member of the group
      if (body.student_assignee_id && needsValidation) {
        const { data: memberCheck, error: memberError } = await supabase
          .from('group_members')
          .select('id, role')
          .eq('group_id', validationData.groupId)
          .eq('student_id', body.student_assignee_id)
          .eq('role', 'student')
          .single();
          
        if (memberError || !memberCheck) {
          console.error('Student membership validation failed:', {
            student_assignee_id: body.student_assignee_id,
            group_id: validationData.groupId,
            error: memberError
          });
          return json({ error: 'Student assignee is not a member of this group' }, { status: 400 });
        }
      }
      
      updates.student_assignee_id = body.student_assignee_id;
      
      // If explicitly setting student assignee, clear any teacher assignee
      if (body.student_assignee_id && body.assignee_type === 'student') {
        updates.assignee_id = null;
      }
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