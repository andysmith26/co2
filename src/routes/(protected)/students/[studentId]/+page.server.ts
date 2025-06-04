// src/routes/(protected)/students/[studentId]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  const { studentId } = params;
  
  try {
    // Get session
    const { session } = await locals.getSession();
    
    if (!session) {
      // This will be caught by the authGuard in hooks.server.ts
      throw error(401, 'Authentication required');
    }
    
    // Get the student and verify teacher ownership
    const { data: student, error: studentError } = await locals.supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .eq('teacher_id', session.user.id) // Only allow teachers to see their own students
      .single();
    
    if (studentError) {
      if (studentError.code === 'PGRST116') {
        throw error(404, 'Student not found or you do not have permission to view this student');
      }
      console.error('Error fetching student:', studentError);
      throw error(500, 'Failed to load student data');
    }
    
    if (!student) {
      throw error(404, 'Student not found or you do not have permission to view this student');
    }
    
    // Get groups this student is a member of
    const { data: groupMemberships, error: groupError } = await locals.supabase
      .from('group_members')
      .select(`
        id,
        role,
        created_at,
        groups!inner(
          id,
          name,
          description
        )
      `)
      .eq('student_id', studentId)
      .eq('role', 'student');
    
    if (groupError) {
      console.error('Error fetching student groups:', groupError);
      // Don't fail the whole page for group errors
    }
    
    // Get projects this student is involved in through group membership
    let projects = [];
    if (groupMemberships && groupMemberships.length > 0) {
      const groupIds = groupMemberships.map(gm => gm.groups.id);
      
      const { data: studentProjects, error: projectError } = await locals.supabase
        .from('projects')
        .select(`
          id,
          title,
          description,
          status,
          created_at,
          groups!inner(
            id,
            name
          )
        `)
        .in('group_id', groupIds)
        .order('created_at', { ascending: false });
      
      if (projectError) {
        console.error('Error fetching student projects:', projectError);
      } else {
        projects = studentProjects || [];
      }
    }
    
    // Get tasks assigned to this student
    const { data: assignedTasks, error: tasksError } = await locals.supabase
      .from('project_tasks')
      .select(`
        id,
        title,
        description,
        status,
        created_at,
        updated_at,
        projects!inner(
          id,
          title,
          groups!inner(
            id,
            name
          )
        )
      `)
      .eq('student_assignee_id', studentId)
      .order('updated_at', { ascending: false });
    
    if (tasksError) {
      console.error('Error fetching student tasks:', tasksError);
    }
    
    return {
      student,
      groups: groupMemberships || [],
      projects: projects || [],
      tasks: assignedTasks || []
    };
    
  } catch (err) {
    console.error('Error loading student profile:', err);
    if (!(err instanceof Response)) {
      throw error(500, 'Failed to load student profile');
    }
    throw err;
  }
};
