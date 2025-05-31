// Import constants to use in type definitions
import { TASK_STATUS, STUDENT_STATUS, DIFFICULTY_LEVELS, TASK_CATEGORIES, VIEW_MODES, GROUP_MEMBER_ROLES, RESOURCE_TYPES } from '../constants';

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

// Task type definition
export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string | null;
  status: typeof TASK_STATUS[keyof typeof TASK_STATUS];
  assignee_id?: string | null;        // For teacher assignees (ID)
  student_assignee_id?: string | null; // For student assignees (ID)
  assignee_type?: 'teacher' | 'student' | null; // Indicates which assignee field is being used
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

// Resource type definition - UPDATED for independent resources
export interface Resource {
  id: string;
  type: typeof RESOURCE_TYPES[keyof typeof RESOURCE_TYPES];
  title: string;
  description?: string | null;
  url: string;
  group_id?: string | null; // NULL = global resource
  student_id?: string | null; // NULL = not student-specific
  created_by: string;
  created_at: string;
  updated_at: string;
  
  // Populated creator object (added by API)
  creator?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  
  // For project-linked resources (when fetched via project endpoints)
  link_id?: string; // ID of the project_resources junction record
  linked_at?: string;
  linked_by?: string;
  linker?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
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

// Resource props interfaces - NEW
export interface ResourceCardProps {
  resource: Resource;
  compact?: boolean;
}

export interface ResourceFormProps {
  projectId: string;
  initialResource?: Resource | null;
}

export interface ResourceListProps {
  resources: Resource[];
  loading?: boolean;
}

// Project Status Constants
export const PROJECT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived'
} as const;

// Task Status Constants 
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed'
} as const;

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