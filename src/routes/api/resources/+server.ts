// src/routes/api/resources/+server.ts
import { json } from '@sveltejs/kit';
import { getSupabase } from '$lib/server/supabase';
import type { RequestHandler } from './$types';
import { GROUP_MEMBER_ROLES } from '$lib/constants';

export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    const { session } = await locals.getSession();
    
    if (!session) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabase(session.access_token);
    
    // Get query parameters for filtering
    const groupId = url.searchParams.get('groupId');
    const search = url.searchParams.get('search');
    const type = url.searchParams.get('type');
    
    // Build the query
    let query = supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (groupId && groupId !== 'all') {
      if (groupId === 'global') {
        // Global resources only
        query = query.is('group_id', null).is('student_id', null);
      } else {
        // Specific group resources
        query = query.eq('group_id', groupId);
      }
    }
    
    if (type) {
      query = query.eq('type', type);
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,url.ilike.%${search}%`);
    }
      
    const { data: resources, error } = await query;
      
    if (error) {
      console.error('Error fetching resources:', error);
      return json({ error: error.message }, { status: 500 });
    }
    
    // Enhance resources with creator information
    const resourcesWithCreators = await Promise.all((resources || []).map(async (resource) => {
      if (!resource.created_by) {
        return { ...resource, creator: null };
      }
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', resource.created_by)
        .single();
        
      if (profileError || !profile) {
        console.warn(`Creator profile ${resource.created_by} not found for resource ${resource.id}:`, profileError);
        return { ...resource, creator: null };
      }
      
      return { 
        ...resource, 
        creator: {
          id: resource.created_by,
          first_name: profile.first_name || 'Unknown',
          last_name: profile.last_name || '',
          email: profile.email
        }
      };
    }));
    
    return json(resourcesWithCreators || []);
  } catch (err) {
    console.error('Error processing request:', err);
    return json({ error: 'Server error' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const { session } = await locals.getSession();
    
    if (!session) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate input
    if (!body.title) {
      return json({ error: 'Resource title is required' }, { status: 400 });
    }
    
    if (!body.type) {
      return json({ error: 'Resource type is required' }, { status: 400 });
    }
    
    if (!body.url) {
      return json({ error: 'Resource URL is required' }, { status: 400 });
    }
    
    // Basic URL validation for LINK type
    if (body.type === 'LINK') {
      try {
        new URL(body.url);
      } catch {
        return json({ error: 'Invalid URL format' }, { status: 400 });
      }
    }
    
    const supabase = getSupabase(session.access_token);
    
    // Verify user is a teacher
    const { data: teacherCheck, error: teacherError } = await supabase
      .from('group_members')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', GROUP_MEMBER_ROLES.TEACHER)
      .limit(1);
      
    if (teacherError || !teacherCheck || teacherCheck.length === 0) {
      return json({ error: 'Only teachers can create resources' }, { status: 403 });
    }
    
    // If group_id is specified, verify user has access to that group
    if (body.group_id) {
      const { data: groupMember, error: memberError } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', body.group_id)
        .eq('user_id', session.user.id)
        .eq('role', GROUP_MEMBER_ROLES.TEACHER)
        .single();
        
      if (memberError || !groupMember) {
        return json({ error: 'You do not have access to this group' }, { status: 403 });
      }
    }
    
    // Insert the new resource
    const { data, error } = await supabase
      .from('resources')
      .insert({
        type: body.type,
        title: body.title,
        description: body.description || null,
        url: body.url,
        group_id: body.group_id || null,
        student_id: body.student_id || null,
        created_by: session.user.id
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating resource:', error);
      return json({ error: error.message }, { status: 500 });
    }
    
    return json(data, { status: 201 });
  } catch (err) {
    console.error('Error processing request:', err);
    return json({ error: 'Server error' }, { status: 500 });
  }
};