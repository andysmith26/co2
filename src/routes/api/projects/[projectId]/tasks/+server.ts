// src/routes/api/projects/[projectId]/tasks/+server.ts
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
    
    // Get the tasks for this project
    const { data, error } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('Error fetching tasks:', error);
      return json({ error: error.message }, { status: 500 });
    }
    
    return json(data || []);
  } catch (err) {
    console.error('Error processing request:', err);
    return json({ error: 'Server error' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
  const { projectId } = params;
  
  try {
    const { session } = await locals.getSession();
    
    if (!session) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate input
    if (!body.title) {
      return json({ error: 'Task title is required' }, { status: 400 });
    }
    
    const supabase = getSupabase(session.access_token);
    
    // Verify the project exists and user has access
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, group_id')
      .eq('id', projectId)
      .single();
      
    if (projectError) {
      if (projectError.code === 'PGRST116') {
        return json({ error: 'Project not found' }, { status: 404 });
      }
      return json({ error: projectError.message }, { status: 500 });
    }
    
    // Verify user has permission (is a teacher in this group)
    const { data: groupMember, error: memberError } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', project.group_id)
      .eq('user_id', session.user.id)
      .single();
      
    if (memberError || !groupMember) {
      return json({ error: 'You do not have access to this project' }, { status: 403 });
    }
    
    if (groupMember.role !== 'teacher') {
      return json({ error: 'Only teachers can create tasks' }, { status: 403 });
    }
    
    // If assignee is specified, verify they are a member of the group
    if (body.assignee_id) {
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
    
    // Insert the new task
    const { data, error } = await supabase
      .from('project_tasks')
      .insert({
        project_id: projectId,
        title: body.title,
        description: body.description || null,
        status: body.status || 'todo',
        assignee_id: body.assignee_id || null
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating task:', error);
      return json({ error: error.message }, { status: 500 });
    }
    
    return json(data, { status: 201 });
  } catch (err) {
    console.error('Error processing request:', err);
    return json({ error: 'Server error' }, { status: 500 });
  }
};
