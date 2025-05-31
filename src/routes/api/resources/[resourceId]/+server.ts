// src/routes/api/resources/[resourceId]/+server.ts
import { json } from '@sveltejs/kit';
import { getSupabase } from '$lib/server/supabase';
import type { RequestHandler } from './$types';
import { GROUP_MEMBER_ROLES } from '$lib/constants';

export const GET: RequestHandler = async ({ params, locals }) => {
  const { resourceId } = params;
  
  try {
    const { session } = await locals.getSession();
    
    if (!session) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabase(session.access_token);
    
    // Get the resource
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', resourceId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return json({ error: 'Resource not found' }, { status: 404 });
      }
      console.error('Error fetching resource:', error);
      return json({ error: error.message }, { status: 500 });
    }
    
    return json(data);
  } catch (err) {
    console.error('Error processing request:', err);
    return json({ error: 'Server error' }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  const { resourceId } = params;
  
  try {
    const { session } = await locals.getSession();
    
    if (!session) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const supabase = getSupabase(session.access_token);
    
    // Verify the resource exists and user has permission
    const { data: resource, error: resourceError } = await supabase
      .from('resources')
      .select('*')
      .eq('id', resourceId)
      .single();
      
    if (resourceError) {
      if (resourceError.code === 'PGRST116') {
        return json({ error: 'Resource not found' }, { status: 404 });
      }
      return json({ error: resourceError.message }, { status: 500 });
    }
    
    // Verify user is a teacher and has permission to edit this resource
    const { data: teacherCheck, error: teacherError } = await supabase
      .from('group_members')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', GROUP_MEMBER_ROLES.TEACHER)
      .limit(1);
      
    if (teacherError || !teacherCheck || teacherCheck.length === 0) {
      return json({ error: 'Only teachers can update resources' }, { status: 403 });
    }
    
    // If resource is group-specific, verify user has access to that group
    if (resource.group_id) {
      const { data: groupMember, error: memberError } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', resource.group_id)
        .eq('user_id', session.user.id)
        .eq('role', GROUP_MEMBER_ROLES.TEACHER)
        .single();
        
      if (memberError || !groupMember) {
        return json({ error: 'You do not have access to this group resource' }, { status: 403 });
      }
    }
    
    // Prepare update object with only the fields that are present
    const updates: any = {};
    
    if (body.title !== undefined) {
      if (!body.title.trim()) {
        return json({ error: 'Resource title cannot be empty' }, { status: 400 });
      }
      updates.title = body.title;
    }
    
    if (body.description !== undefined) {
      updates.description = body.description;
    }
    
    if (body.url !== undefined) {
      if (!body.url.trim()) {
        return json({ error: 'Resource URL cannot be empty' }, { status: 400 });
      }
      
      // Basic URL validation for LINK type
      if (resource.type === 'LINK') {
        try {
          new URL(body.url);
        } catch {
          return json({ error: 'Invalid URL format' }, { status: 400 });
        }
      }
      
      updates.url = body.url;
    }
    
    if (body.type !== undefined) {
      updates.type = body.type;
    }
    
    if (body.group_id !== undefined) {
      // If changing group assignment, verify access to new group
      if (body.group_id) {
        const { data: newGroupMember, error: newMemberError } = await supabase
          .from('group_members')
          .select('role')
          .eq('group_id', body.group_id)
          .eq('user_id', session.user.id)
          .eq('role', GROUP_MEMBER_ROLES.TEACHER)
          .single();
          
        if (newMemberError || !newGroupMember) {
          return json({ error: 'You do not have access to the specified group' }, { status: 403 });
        }
      }
      updates.group_id = body.group_id;
    }
    
    // Only proceed if there are updates to make
    if (Object.keys(updates).length === 0) {
      return json({ error: 'No updates provided' }, { status: 400 });
    }
    
    // Update the resource
    const { data, error } = await supabase
      .from('resources')
      .update(updates)
      .eq('id', resourceId)
      .select()
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return json({ error: 'Resource not found' }, { status: 404 });
      }
      console.error('Error updating resource:', error);
      return json({ error: error.message }, { status: 500 });
    }
    
    return json(data);
  } catch (err) {
    console.error('Error processing request:', err);
    return json({ error: 'Server error' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  const { resourceId } = params;
  
  try {
    const { session } = await locals.getSession();
    
    if (!session) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabase(session.access_token);
    
    // Verify the resource exists and user has permission
    const { data: resource, error: resourceError } = await supabase
      .from('resources')
      .select('*')
      .eq('id', resourceId)
      .single();
      
    if (resourceError) {
      if (resourceError.code === 'PGRST116') {
        return json({ error: 'Resource not found' }, { status: 404 });
      }
      return json({ error: resourceError.message }, { status: 500 });
    }
    
    // Verify user is a teacher and has permission to delete this resource
    const { data: teacherCheck, error: teacherError } = await supabase
      .from('group_members')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', GROUP_MEMBER_ROLES.TEACHER)
      .limit(1);
      
    if (teacherError || !teacherCheck || teacherCheck.length === 0) {
      return json({ error: 'Only teachers can delete resources' }, { status: 403 });
    }
    
    // If resource is group-specific, verify user has access to that group
    if (resource.group_id) {
      const { data: groupMember, error: memberError } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', resource.group_id)
        .eq('user_id', session.user.id)
        .eq('role', GROUP_MEMBER_ROLES.TEACHER)
        .single();
        
      if (memberError || !groupMember) {
        return json({ error: 'You do not have access to this group resource' }, { status: 403 });
      }
    }
    
    // Delete the resource
    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', resourceId);
      
    if (error) {
      if (error.code === 'PGRST116') {
        return json({ error: 'Resource not found' }, { status: 404 });
      }
      console.error('Error deleting resource:', error);
      return json({ error: error.message }, { status: 500 });
    }
    
    return json({ success: true });
  } catch (err) {
    console.error('Error processing request:', err);
    return json({ error: 'Server error' }, { status: 500 });
  }
};