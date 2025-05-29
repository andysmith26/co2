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
    
    // ENHANCED LOGGING: Log the incoming request
    console.log('🔄 API: Task update request received');
    console.log('- projectId:', projectId);
    console.log('- taskId:', taskId);
    console.log('- userId:', session.user.id);
    console.log('- requestBody:', body);
    
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
    
    // ENHANCED: Improved assignee validation with detailed logging
    let needsValidation = false;
    let validationData = null;
    
    // Get project's group_id for validation if we're updating assignees
    if ((body.assignee_id !== undefined || body.student_assignee_id !== undefined)) {
      
      console.log('🔍 API: Assignment update detected, fetching project group');
      
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('group_id')
        .eq('id', projectId)
        .single();
        
      if (projectError) {
        console.error('❌ API: Project not found:', projectError);
        return json({ error: 'Project not found' }, { status: 404 });
      }
      
      console.log('✅ API: Project found, group_id:', project.group_id);
      needsValidation = true;
      validationData = { groupId: project.group_id };
    }
    
    // Handle teacher assignee
    if (body.assignee_id !== undefined) {
      console.log('🔍 API: Processing teacher assignee:', body.assignee_id);
      
      // If assignee is specified, verify they are a member of the group
      if (body.assignee_id && needsValidation) {
        console.log('🔍 API: Validating teacher membership in group:', validationData.groupId);
        
        const { data: memberCheck, error: memberError } = await supabase
          .from('group_members')
          .select('id, role, user_id')
          .eq('group_id', validationData.groupId)
          .eq('user_id', body.assignee_id)
          .eq('role', 'teacher');
          
        console.log('🔍 API: Teacher membership query result:', {
          data: memberCheck,
          error: memberError,
          count: memberCheck?.length || 0
        });
        
        if (memberError) {
          console.error('❌ API: Database error during teacher validation:', memberError);
          return json({ error: 'Database error during validation' }, { status: 500 });
        }
        
        if (!memberCheck || memberCheck.length === 0) {
          console.error('❌ API: Teacher membership validation failed:', {
            assignee_id: body.assignee_id,
            group_id: validationData.groupId,
            message: 'Teacher not found in group members'
          });
          
          // ENHANCED: Get all group members for debugging
          const { data: allMembers } = await supabase
            .from('group_members')
            .select('user_id, student_id, role')
            .eq('group_id', validationData.groupId);
            
          console.log('🔍 API: All group members for debugging:', allMembers);
          
          return json({ error: 'Teacher assignee is not a member of this group' }, { status: 400 });
        }
        
        console.log('✅ API: Teacher validation passed');
      }
      
      updates.assignee_id = body.assignee_id;
      
      // If explicitly setting teacher assignee, clear any student assignee
      if (body.assignee_id && body.assignee_type === 'teacher') {
        updates.student_assignee_id = null;
      }
    }
    
    // Handle student assignee
    if (body.student_assignee_id !== undefined) {
      console.log('🔍 API: Processing student assignee:', body.student_assignee_id);
      
      // If student assignee is specified, verify they are a member of the group
      if (body.student_assignee_id && needsValidation) {
        console.log('🔍 API: Validating student membership in group:', validationData.groupId);
        
        const { data: memberCheck, error: memberError } = await supabase
          .from('group_members')
          .select('id, role, student_id')
          .eq('group_id', validationData.groupId)
          .eq('student_id', body.student_assignee_id)
          .eq('role', 'student');
          
        console.log('🔍 API: Student membership query result:', {
          data: memberCheck,
          error: memberError,
          count: memberCheck?.length || 0
        });
        
        if (memberError) {
          console.error('❌ API: Database error during student validation:', memberError);
          return json({ error: 'Database error during validation' }, { status: 500 });
        }
        
        if (!memberCheck || memberCheck.length === 0) {
          console.error('❌ API: Student membership validation failed:', {
            student_assignee_id: body.student_assignee_id,
            group_id: validationData.groupId,
            message: 'Student not found in group members'
          });
          
          // ENHANCED: Get all group members for debugging
          const { data: allMembers } = await supabase
            .from('group_members')
            .select('user_id, student_id, role')
            .eq('group_id', validationData.groupId);
            
          console.log('🔍 API: All group members for debugging:', allMembers);
          
          return json({ error: 'Student assignee is not a member of this group' }, { status: 400 });
        }
        
        console.log('✅ API: Student validation passed');
      }
      
      updates.student_assignee_id = body.student_assignee_id;
      
      // If explicitly setting student assignee, clear any teacher assignee
      if (body.student_assignee_id && body.assignee_type === 'student') {
        updates.assignee_id = null;
      }
    }
    
    // Only proceed if there are updates to make
    if (Object.keys(updates).length === 0) {
      console.log('⚠️ API: No updates provided');
      return json({ error: 'No updates provided' }, { status: 400 });
    }
    
    console.log('🔄 API: Executing task update with:', updates);
    
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
        console.error('❌ API: Task not found during update');
        return json({ error: 'Task not found' }, { status: 404 });
      }
      console.error('❌ API: Database error during update:', error);
      return json({ error: error.message }, { status: 500 });
    }
    
    console.log('✅ API: Task updated successfully:', {
      id: data.id,
      title: data.title,
      assignee_type: data.assignee_type,
      assignee_id: data.assignee_id,
      student_assignee_id: data.student_assignee_id
    });
    
    return json(data);
  } catch (err) {
    console.error('❌ API: Unexpected error processing request:', err);
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
    
    console.log('🔄 API: Deleting task:', taskId);
    
    // Delete the task
    const { error } = await supabase
      .from('project_tasks')
      .delete()
      .eq('id', taskId)
      .eq('project_id', projectId);
      
    if (error) {
      if (error.code === 'PGRST116') {
        console.error('❌ API: Task not found during delete');
        return json({ error: 'Task not found' }, { status: 404 });
      }
      console.error('❌ API: Error deleting task:', error);
      return json({ error: error.message }, { status: 500 });
    }
    
    console.log('✅ API: Task deleted successfully');
    return json({ success: true });
  } catch (err) {
    console.error('❌ API: Unexpected error processing delete request:', err);
    return json({ error: 'Server error' }, { status: 500 });
  }
};