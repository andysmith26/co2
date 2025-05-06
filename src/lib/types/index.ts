// Import constants to use in type definitions
import { TASK_STATUS, STUDENT_STATUS, DIFFICULTY_LEVELS, TASK_CATEGORIES, VIEW_MODES, GROUP_MEMBER_ROLES } from '../constants';

// Student type definition
export interface Student {
  id: number;
  name: string;
  status: typeof STUDENT_STATUS[keyof typeof STUDENT_STATUS];
  currentTask: number | null;
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
  user_id: string;
  role: typeof GROUP_MEMBER_ROLES[keyof typeof GROUP_MEMBER_ROLES];
  created_at: string;
  // These fields may come from joins with the users/students table
  first_name?: string;
  last_initial?: string;
}

// Teacher type definition
export interface Teacher {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

// Task type definition
export interface Task {
  id: number;
  title: string;
  category: typeof TASK_CATEGORIES[keyof typeof TASK_CATEGORIES];
  difficulty: typeof DIFFICULTY_LEVELS[keyof typeof DIFFICULTY_LEVELS];
  status: typeof TASK_STATUS[keyof typeof TASK_STATUS];
  assignedTo: number[];
  featured: boolean;
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