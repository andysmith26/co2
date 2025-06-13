// src/lib/types/index.ts

// Import constants to use in type definitions
import { 
  TASK_STATUS, 
  STUDENT_STATUS, 
  DIFFICULTY_LEVELS, 
  TASK_CATEGORIES, 
  VIEW_MODES, 
  GROUP_MEMBER_ROLES,
  PROJECT_STATUS,
  RESOURCE_TYPES
} from '../constants';

// Core Student type definition
export interface Student {
  id: string;
  first_name: string;
  last_initial: string;
  teacher_id: string;
  status: 'present' | 'absent';
  created_at: string;
  updated_at?: string;
}

// Enhanced Student interface for profile data
export interface StudentProfile extends Student {
  // Additional computed fields can be added here
}

// Group type definition
export interface Group {
  id: string;
  name: string;
  description?: string | null;
  created_at: string;
  created_by: string | null;
}

// GroupMember type definition
export interface GroupMember {
  id: string;
  group_id: string;
  user_id?: string | null;
  student_id?: string | null;
  role: typeof GROUP_MEMBER_ROLES[keyof typeof GROUP_MEMBER_ROLES];
  created_at: string;
  // These fields may come from joins with the users/students table
  first_name?: string;
  last_name?: string;
  last_initial?: string;
}

// Teacher type definition
export interface Teacher {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

// View mode type
export type ViewMode = typeof VIEW_MODES[keyof typeof VIEW_MODES];

// Component props interfaces
export interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  bgClass?: string;
  borderClass?: string;
  iconClass?: string;
  iconSvg?: string;
}

export interface AssignmentModalProps {
  show: boolean;
  taskId: number | null;
}

export interface StudentCardProps {
  student: Student;
  compact?: boolean;
}

export interface TaskCardProps {
  task: Task;
  compact?: boolean;
}

// Project type definition
export interface Project {
  id: string;
  title: string;
  description?: string | null;
  status: typeof PROJECT_STATUS[keyof typeof PROJECT_STATUS];
  created_by: string;
  group_id: string;
  created_at: string;
  updated_at: string;
}

// Task type definition
export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string | null;
  status: typeof TASK_STATUS[keyof typeof TASK_STATUS];
  assignee_id?: string | null;
  student_assignee_id?: string | null;
  assignee_type?: 'teacher' | 'student' | null;
  created_at: string;
  updated_at: string;
  
  // Populated assignee objects (added by API)
  assignee?: {
    id: string;
    first_name: string;
    last_name: string;
    role: string;
  } | null;
  
  student_assignee?: {
    id: string;
    first_name: string;
    last_initial: string;
    role: string;
  } | null;
}

// Resource type definition
export interface Resource {
  id: string;
  type: typeof RESOURCE_TYPES[keyof typeof RESOURCE_TYPES];
  title: string;
  description?: string | null;
  url: string;
  group_id?: string | null;
  student_id?: string | null;
  created_by: string;
  created_at: string;
  updated_at?: string;
  
  // Enhanced fields (from joins/API)
  creator?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  
  // For project-linked resources
  link_id?: string;
  linked_at?: string;
  linked_by?: string;
  linker?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}