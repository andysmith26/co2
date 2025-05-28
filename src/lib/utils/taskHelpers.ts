// src/lib/utils/taskHelpers.ts
import { TASK_STATUS, GROUP_MEMBER_ROLES } from '$lib/constants';
import type { Task } from '$lib/types';

/**
 * Format assignee name to initials (e.g., "John Doe" -> "JD", "Jane S." -> "JS")
 */
export function formatAssigneeInitials(task: Task): string {
  // Handle teacher assignee
  if (task.assignee_type === 'teacher' && task.assignee) {
    const firstName = task.assignee.first_name?.charAt(0)?.toUpperCase() || '';
    const lastName = task.assignee.last_name?.charAt(0)?.toUpperCase() || '';
    return firstName + lastName;
  }
  
  // Handle student assignee
  if (task.assignee_type === 'student' && task.student_assignee) {
    const firstName = task.student_assignee.first_name?.charAt(0)?.toUpperCase() || '';
    const lastInitial = task.student_assignee.last_initial?.toUpperCase() || '';
    return firstName + lastInitial;
  }
  
  // No assignee
  return '??';
}

/**
 * Get the status type for visual indicators
 */
export function getTaskStatusType(status: string): 'todo' | 'in-progress' | 'completed' {
  switch (status) {
    case TASK_STATUS.TODO:
      return 'todo';
    case TASK_STATUS.IN_PROGRESS:
      return 'in-progress';
    case TASK_STATUS.COMPLETED:
      return 'completed';
    default:
      return 'todo';
  }
}

/**
 * Get the display color for task status
 */
export function getTaskStatusColor(status: string): string {
  switch (getTaskStatusType(status)) {
    case 'todo':
      return '#fbbf24'; // yellow-400
    case 'in-progress':
      return '#10b981'; // green-500
    case 'completed':
      return '#374151'; // gray-700 (for checkmark)
    default:
      return '#6b7280'; // gray-500
  }
}