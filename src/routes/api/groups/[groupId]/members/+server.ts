// src/routes/api/groups/[groupId]/members/+server.ts
import { json } from '@sveltejs/kit';
import { getSupabase } from '$lib/server/supabase';
import type { RequestHandler } from './$types';
import { GROUP_MEMBER_ROLES } from '$lib/constants';

export const GET: RequestHandler = async ({ params, locals }) => {
  const { groupId } = params;
  const { session } = await locals.getSession();
  
  if (!session) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase(session.access_token);
  
  // Get members for this group with user information
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      id,
      group_id,
      user_id,
      role,
      created_at
    `)
    .eq('group_id', groupId)
    .order('created_at', { ascending: true });
    
  if (error) {
    console.error(`Error fetching members for group ${groupId}:`, error);
    return json({ error: error.message }, { status: 500 });
  }
  
  // Fetch user details separately based on role to avoid join issues
  const members = await Promise.all(data.map(async (member) => {
    // Create base member object with common properties
    const memberData = {
      id: member.id,
      group_id: member.group_id,
      user_id: member.user_id,
      role: member.role,
      created_at: member.created_at,
      first_name: 'Unknown',
      last_name: '',
      last_initial: ''
    };
    
    if (member.role === GROUP_MEMBER_ROLES.TEACHER) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', member.user_id)
        .single();
        
      if (!profileError && profileData) {
        memberData.first_name = profileData.first_name || 'Unknown';
        memberData.last_name = profileData.last_name || '';
      }
    } else {
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('first_name, last_initial')
        .eq('id', member.user_id)
        .single();
        
      if (!studentError && studentData) {
        memberData.first_name = studentData.first_name || 'Unknown';
        memberData.last_initial = studentData.last_initial || '';
      }
    }
    
    return memberData;
  }));
  
  return json(members);
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
  const { groupId } = params;
  const { session } = await locals.getSession();
  
  if (!session) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { user_id, role } = await request.json();
    
    // Validate input
    if (!user_id || typeof user_id !== 'string') {
      return json({ error: 'User ID is required' }, { status: 400 });
    }
    
    if (!Object.values(GROUP_MEMBER_ROLES).includes(role)) {
      return json({ error: 'Invalid role' }, { status: 400 });
    }
    
    const supabase = getSupabase(session.access_token);
    
    // First, check if the group exists
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('id')
      .eq('id', groupId)
      .single();
      
    if (groupError) {
      if (groupError.code === 'PGRST116') {
        return json({ error: 'Group not found' }, { status: 404 });
      }
      return json({ error: groupError.message }, { status: 500 });
    }
    
    // Then, check if the member already exists in this group
    const { data: existingMember, error: existingError } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', user_id);
      
    if (existingError) {
      return json({ error: existingError.message }, { status: 500 });
    }
    
    if (existingMember && existingMember.length > 0) {
      return json({ error: 'User is already a member of this group' }, { status: 409 });
    }
    
    // Add the member
    const { data, error } = await supabase
      .from('group_members')
      .insert([{
        group_id: groupId,
        user_id,
        role
      }])
      .select()
      .single();
      
    if (error) {
      console.error(`Error adding member to group ${groupId}:`, error);
      return json({ error: error.message }, { status: 500 });
    }
    
    // Create response object with base properties
    const memberResponse = {
      ...data,
      first_name: 'Unknown',
      last_name: '',
      last_initial: ''
    };
    
    // Get user details to include in the response
    if (role === GROUP_MEMBER_ROLES.TEACHER) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user_id)
        .single();
        
      if (profileData) {
        memberResponse.first_name = profileData.first_name || 'Unknown';
        memberResponse.last_name = profileData.last_name || '';
      }
    } else {
      const { data: studentData } = await supabase
        .from('students')
        .select('first_name, last_initial')
        .eq('id', user_id)
        .single();
        
      if (studentData) {
        memberResponse.first_name = studentData.first_name || 'Unknown';
        memberResponse.last_initial = studentData.last_initial || '';
      }
    }
    
    return json(memberResponse);
  } catch (err) {
    console.error('Error processing request:', err);
    return json({ error: 'Invalid request data' }, { status: 400 });
  }
};

// Handler for deleting a specific member
export const DELETE: RequestHandler = async ({ params, url, locals }) => {
  const { groupId } = params;
  const memberId = url.searchParams.get('memberId');
  const { session } = await locals.getSession();
  
  if (!session) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!memberId) {
    return json({ error: 'Member ID is required' }, { status: 400 });
  }

  const supabase = getSupabase(session.access_token);
  
  // Delete the member
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('id', memberId)
    .eq('group_id', groupId);
    
  if (error) {
    console.error(`Error removing member ${memberId} from group ${groupId}:`, error);
    return json({ error: error.message }, { status: 500 });
  }
  
  return json({ success: true });
};