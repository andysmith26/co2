// src/routes/(protected)/students/[studentId]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  const { studentId } = params;
  
  try {
    // Get session
    const { session } = await locals.getSession();
    
    if (!session) {
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
    
    // Get groups this student is a member of with enhanced data
    const { data: groupMemberships, error: groupError } = await locals.supabase
      .from('group_members')
      .select(`
        id,
        role,
        created_at,
        groups!inner(
          id,
          name,
          description,
          created_at
        )
      `)
      .eq('student_id', studentId)
      .eq('role', 'student');
    
    if (groupError) {
      console.error('Error fetching student groups:', groupError);
    }
    
    // Get group IDs for further queries
    const groupIds = groupMemberships?.map(gm => gm.groups.id) || [];
    
    // Get tasks assigned to this student with enhanced data
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
          group_id,
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
    
    // Get collaborators - students who worked on the same tasks
    let collaborators = [];
    if (assignedTasks && assignedTasks.length > 0) {
      const taskIds = assignedTasks.map(task => task.id);
      
      // Find other students assigned to the same tasks
      const { data: collaboratorTasks, error: collabError } = await locals.supabase
        .from('project_tasks')
        .select(`
          id,
          title,
          student_assignee_id,
          students!inner(
            id,
            first_name,
            last_initial,
            teacher_id
          )
        `)
        .in('id', taskIds)
        .neq('student_assignee_id', studentId)
        .not('student_assignee_id', 'is', null);
      
      if (!collabError && collaboratorTasks) {
        // Group by student and count shared tasks
        const collaboratorMap = new Map();
        
        collaboratorTasks.forEach(task => {
          const collabId = task.students.id;
          const collabInfo = task.students;
          
          if (!collaboratorMap.has(collabId)) {
            collaboratorMap.set(collabId, {
              id: collabId,
              first_name: collabInfo.first_name,
              last_initial: collabInfo.last_initial,
              teacher_id: collabInfo.teacher_id,
              shared_tasks: [],
              shared_task_count: 0
            });
          }
          
          const collab = collaboratorMap.get(collabId);
          collab.shared_tasks.push({
            id: task.id,
            title: task.title
          });
          collab.shared_task_count++;
        });
        
        collaborators = Array.from(collaboratorMap.values())
          .sort((a, b) => b.shared_task_count - a.shared_task_count);
      }
    }
    
    // Get group member counts for each group this student belongs to
    const groupStats = [];
    if (groupIds.length > 0) {
      for (const groupId of groupIds) {
        const { count: memberCount } = await locals.supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', groupId);
        
        const { count: teacherCount } = await locals.supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', groupId)
          .eq('role', 'teacher');
        
        const { count: studentCount } = await locals.supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', groupId)
          .eq('role', 'student');
        
        // Get recent activity (tasks updated in last 7 days in this group)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { count: recentTaskUpdates } = await locals.supabase
          .from('project_tasks')
          .select('*, projects!inner(*)', { count: 'exact', head: true })
          .eq('projects.group_id', groupId)
          .eq('student_assignee_id', studentId)
          .gte('updated_at', sevenDaysAgo.toISOString());
        
        groupStats.push({
          group_id: groupId,
          member_count: memberCount || 0,
          teacher_count: teacherCount || 0,
          student_count: studentCount || 0,
          recent_activity_count: recentTaskUpdates || 0
        });
      }
    }
    
    // Calculate enhanced stats
    const tasks = assignedTasks || [];
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
    const todoTasks = tasks.filter(t => t.status === 'todo');
    
    // Find most recent completion
    const recentCompletions = completedTasks
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    const lastCompletedTask = recentCompletions[0] || null;
    
    // Group tasks by project for workload analysis
    const tasksByProject = tasks.reduce((acc, task) => {
      const projectId = task.projects.id;
      if (!acc[projectId]) {
        acc[projectId] = {
          project_name: task.projects.title,
          group_name: task.projects.groups.name,
          tasks: []
        };
      }
      acc[projectId].tasks.push(task);
      return acc;
    }, {});
    
    // Find most active group (by task count)
    const tasksByGroup = tasks.reduce((acc, task) => {
      const groupName = task.projects.groups.name;
      acc[groupName] = (acc[groupName] || 0) + 1;
      return acc;
    }, {});
    
    const mostActiveGroup = Object.entries(tasksByGroup)
      .sort(([,a], [,b]) => b - a)[0];
    
    // Calculate completion streak (consecutive completed tasks from most recent)
    let completionStreak = 0;
    const sortedTasks = tasks.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
    
    for (const task of sortedTasks) {
      if (task.status === 'completed') {
        completionStreak++;
      } else {
        break;
      }
    }
    
    const stats = {
      total_tasks: tasks.length,
      completed_tasks: completedTasks.length,
      in_progress_tasks: inProgressTasks.length,
      todo_tasks: todoTasks.length,
      completion_rate: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
      last_completed_task: lastCompletedTask,
      tasks_by_project: Object.values(tasksByProject),
      most_active_group: mostActiveGroup ? { name: mostActiveGroup[0], task_count: mostActiveGroup[1] } : null,
      completion_streak: completionStreak,
      collaborator_count: collaborators.length
    };
    
    return {
      student,
      groups: groupMemberships || [],
      groupStats,
      tasks: assignedTasks || [],
      collaborators,
      stats
    };
    
  } catch (err) {
    console.error('Error loading student profile:', err);
    if (!(err instanceof Response)) {
      throw error(500, 'Failed to load student profile');
    }
    throw err;
  }
};
