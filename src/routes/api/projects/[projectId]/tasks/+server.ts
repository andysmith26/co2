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
    
    // First, get the tasks for this project
    const { data: tasks, error: tasksError } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });
      
    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      return json({ error: tasksError.message }, { status: 500 });
    }
    
    // If there are no tasks, return an empty array
    if (!tasks || tasks.length === 0) {
      return json([]);
    }

    // Process each task to include assignee information
    const tasksWithAssignees = await Promise.all(tasks.map(async (task) => {
      // If there's no assignee_id, return the task as is
      if (!task.assignee_id) {
        return task;
      }
      
      // First, try to find the assignee as a user (teacher)
      const { data: teacher, error: teacherError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('id', task.assignee_id)
        .single();
      
      if (!teacherError && teacher) {
        // If found as a teacher, include teacher data
        return {
          ...task,
          assignee: {
            id: teacher.id,
            first_name: teacher.first_name || 'Unknown',
            last_name: teacher.last_name || '',
            email: teacher.email,
            role: 'teacher'
          }
        };
      }
      
      // If not found as a teacher, try as a student
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id, first_name, last_initial, teacher_id')
        .eq('id', task.assignee_id)
        .single();
      
      if (!studentError && student) {
        // If found as a student, include student data
        return {
          ...task,
          assignee: {
            id: student.id,
            first_name: student.first_name || 'Unknown',
            last_initial: student.last_initial || '',
            teacher_id: student.teacher_id,
            role: 'student'
          }
        };
      }
      
      // If not found in either table, return task with original assignee_id
      // but mark as not found to help with debugging
      console.log(`Assignee not found for task ${task.id}, assignee_id: ${task.assignee_id}`);
      return task;
    }));
    
    return json(tasksWithAssignees);
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
  // Check if the assignee is in the group (either as a user or a student)
  const { data: groupMembers, error: membersError } = await supabase
    .from('group_members')
    .select('id, role, user_id, student_id')
    .eq('group_id', project.group_id)
    .or(`user_id.eq.${body.assignee_id},student_id.eq.${body.assignee_id}`);
    
  if (membersError || groupMembers.length === 0) {
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
