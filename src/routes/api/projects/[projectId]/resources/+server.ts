// src/routes/api/projects/[projectId]/resources/+server.ts
// This handles linking/unlinking existing resources to/from projects
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
    
    // Get resources linked to this project
    const { data: projectResources, error } = await supabase
      .from('project_resources')
      .select(`
        id,
        linked_at,
        linked_by,
        resources!inner(*)
      `)
      .eq('project_id', projectId)
      .order('linked_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching project resources:', error);
      return json({ error: error.message }, { status: 500 });
    }
    
    // Enhance with creator and linker information
    const enhancedResources = await Promise.all((projectResources || []).map(async (item) => {
      const resource = item.resources;
      let creator = null;
      let linker = null;
      
      // Get resource creator info
      if (resource.created_by) {
        const { data: creatorProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', resource.created_by)
          .single();
          
        if (creatorProfile) {
          creator = {
            id: resource.created_by,
            first_name: creatorProfile.first_name || 'Unknown',
            last_name: creatorProfile.last_name || '',
            email: creatorProfile.email
          };
        }
      }
      
      // Get linker info
      if (item.linked_by) {
        const { data: linkerProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', item.linked_by)
          .single();
          
        if (linkerProfile) {
          linker = {
            id: item.linked_by,
            first_name: linkerProfile.first_name || 'Unknown',
            last_name: linkerProfile.last_name || '',
            email: linkerProfile.email
          };
        }
      }
      
      return {
        link_id: item.id,
        linked_at: item.linked_at,
        linked_by: item.linked_by,
        linker,
        ...resource,
        creator
      };
    }));
    
    return json(enhancedResources || []);
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
    if (!body.resource_id) {
      return json({ error: 'Resource ID is required' }, { status: 400 });
    }
    
    const supabase = getSupabase(session.access_token);
    
    // Verify the project exists and user has permission
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
    
    if (groupMember.role !== GROUP_MEMBER_ROLES.TEACHER) {
      return json({ error: 'Only teachers can link resources to projects' }, { status: 403 });
    }
    
    // Verify the resource exists and user has access to it
    const { data: resource, error: resourceError } = await supabase
      .from('resources')
      .select('*')
      .eq('id', body.resource_id)
      .single();
      
    if (resourceError) {
      if (resourceError.code === 'PGRST116') {
        return json({ error: 'Resource not found' }, { status: 404 });
      }
      return json({ error: resourceError.message }, { status: 500 });
    }
    
    // Check if this link already exists
    const { data: existingLink, error: linkError } = await supabase
      .from('project_resources')
      .select('id')
      .eq('project_id', projectId)
      .eq('resource_id', body.resource_id)
      .single();
      
    if (linkError && linkError.code !== 'PGRST116') {
      return json({ error: linkError.message }, { status: 500 });
    }
    
    if (existingLink) {
      return json({ error: 'Resource is already linked to this project' }, { status: 409 });
    }
    
    // Create the link
    const { data, error } = await supabase
      .from('project_resources')
      .insert({
        project_id: projectId,
        resource_id: body.resource_id,
        linked_by: session.user.id
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error linking resource to project:', error);
      return json({ error: error.message }, { status: 500 });
    }
    
    return json(data, { status: 201 });
  } catch (err) {
    console.error('Error processing request:', err);
    return json({ error: 'Server error' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params, url, locals }) => {
  const { projectId } = params;
  const resourceId = url.searchParams.get('resource_id');
  
  try {
    const { session } = await locals.getSession();
    
    if (!session) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!resourceId) {
      return json({ error: 'Resource ID is required' }, { status: 400 });
    }

    const supabase = getSupabase(session.access_token);
    
    // Verify the project exists and user has permission
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
    
    if (groupMember.role !== GROUP_MEMBER_ROLES.TEACHER) {
      return json({ error: 'Only teachers can unlink resources from projects' }, { status: 403 });
    }
    
    // Delete the link
    const { error } = await supabase
      .from('project_resources')
      .delete()
      .eq('project_id', projectId)
      .eq('resource_id', resourceId);
      
    if (error) {
      console.error('Error unlinking resource from project:', error);
      return json({ error: error.message }, { status: 500 });
    }
    
    return json({ success: true });
  } catch (err) {
    console.error('Error processing request:', err);
    return json({ error: 'Server error' }, { status: 500 });
  }
};