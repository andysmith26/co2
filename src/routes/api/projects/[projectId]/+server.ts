// src/routes/api/projects/[projectId]/+server.ts
import { json } from '@sveltejs/kit';
import { getSupabase } from '$lib/server/supabase';
import type { RequestHandler } from './$types';
import { GROUP_MEMBER_ROLES } from '$lib/constants';

export const GET: RequestHandler = async ({ params, locals }) => {
  const { projectId } = params;
  
  try {
    const { session } = await locals.getSession();
    
    if (!session) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabase(session.access_token);
    
    // Get the tasks for this project
    const { data: tasks, error } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('Error fetching tasks:', error);
      return json({ error: error.message }, { status: 500 });
    }
    
    // If we have tasks with assignees, fetch the assignee details
    const tasksWithAssignees = await Promise.all((tasks || []).map(async (task) => {
      // If there's no assignee, just return the task as is
      if (!task.assignee_id) {
        return { ...task, assignee: null };
      }
      
      // First get the project to find the group
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('group_id')
        .eq('id', projectId)
        .single();
        
      if (projectError) {
        console.warn(`Could not find project ${projectId} for task ${task.id}:`, projectError);
        return { ...task, assignee: null };
      }
      
      // Now find if the assignee is a teacher or student in this group
      const { data: groupMember, error: memberError } = await supabase
        .from('group_members')
        .select('role, user_id, student_id')
        .eq('group_id', project.group_id)
        .or(`user_id.eq.${task.assignee_id},student_id.eq.${task.assignee_id}`)
        .single();
      
      if (memberError || !groupMember) {
        console.warn(`Assignee ${task.assignee_id} not found in group for task ${task.id}:`, memberError);
        return { ...task, assignee: null };
      }
      
      // Based on the role, fetch the appropriate user details
      if (groupMember.role === GROUP_MEMBER_ROLES.TEACHER && groupMember.user_id === task.assignee_id) {
        // Fetch teacher profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', task.assignee_id)
          .single();
          
        if (profileError || !profile) {
          console.warn(`Teacher profile ${task.assignee_id} not found for task ${task.id}:`, profileError);
          return { ...task, assignee: null };
        }
        
        return { 
          ...task, 
          assignee: {
            id: task.assignee_id,
            first_name: profile.first_name || 'Unknown',
            last_name: profile.last_name || '',
            role: GROUP_MEMBER_ROLES.TEACHER
          }
        };
        
      } else if (groupMember.role === GROUP_MEMBER_ROLES.STUDENT && groupMember.student_id === task.assignee_id) {
        // Fetch student details
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('first_name, last_initial')
          .eq('id', task.assignee_id)
          .single();
          
        if (studentError || !student) {
          console.warn(`Student ${task.assignee_id} not found for task ${task.id}:`, studentError);
          return { ...task, assignee: null };
        }
        
        return { 
          ...task, 
          assignee: {
            id: task.assignee_id,
            first_name: student.first_name || 'Unknown',
            last_initial: student.last_initial || '',
            role: GROUP_MEMBER_ROLES.STUDENT
          }
        };
      }
      
      // If we couldn't determine the role or find the details, return null assignee
      return { ...task, assignee: null };
    }));
    
    return json(tasksWithAssignees || []);
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
