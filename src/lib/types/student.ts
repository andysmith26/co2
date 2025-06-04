// src/lib/types/student.ts

// Re-export from main types to avoid conflicts
export type { Student, Group, Task } from '../types';

// Student-specific interfaces
export interface StudentExtended {
  id: string;
  first_name: string;
  last_initial: string;
  teacher_id: string;
  status: 'present' | 'absent';
  created_at: string;
  updated_at?: string;
}

export interface StudentGroup {
  id: string;
  role: string;
  created_at: string;
  groups: {
    id: string;
    name: string;
    description?: string;
    created_at: string;
  };
}

export interface StudentTask {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed';
  created_at: string;
  updated_at: string;
  projects: {
    id: string;
    title: string;
    group_id: string;
    groups: {
      id: string;
      name: string;
    };
  };
}

export interface StudentCollaborator {
  id: string;
  first_name: string;
  last_initial: string;
  teacher_id: string;
  shared_tasks: Array<{
    id: string;
    title: string;
  }>;
  shared_task_count: number;
}

export interface GroupStats {
  group_id: string;
  member_count: number;
  teacher_count: number;
  student_count: number;
  recent_activity_count: number;
}

export interface StudentStats {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  todo_tasks: number;
  completion_rate: number;
  last_completed_task?: StudentTask;
  tasks_by_project: Array<{
    project_name: string;
    group_name: string;
    tasks: StudentTask[];
  }>;
  most_active_group?: {
    name: string;
    task_count: number;
  };
  completion_streak: number;
  collaborator_count: number;
}

export interface StudentProfileData {
  student: Student;
  groups: StudentGroup[];
  groupStats: GroupStats[];
  tasks: StudentTask[];
  collaborators: StudentCollaborator[];
  stats: StudentStats;
}
