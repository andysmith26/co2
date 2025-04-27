// Import constants to use in type definitions
import { TASK_STATUS, STUDENT_STATUS, DIFFICULTY_LEVELS, TASK_CATEGORIES, VIEW_MODES } from '../constants';

// Student type definition
export interface Student {
  id: number;
  name: string;
  status: typeof STUDENT_STATUS[keyof typeof STUDENT_STATUS];
  currentTask: number | null;
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