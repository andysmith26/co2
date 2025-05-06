// src/lib/constants/index.ts

// Task status constants
export const TASK_STATUS = {
    TODO: 'todo',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed'
  } as const;
  
  // Student status constants
  export const STUDENT_STATUS = {
    PRESENT: 'present',
    ABSENT: 'absent',
    LATE: 'late' // This may need to be removed if the database schema only accepts 'present' and 'absent'
  } as const;
  
  // Task difficulty levels
  export const DIFFICULTY_LEVELS = {
    EASY: 'Easy',
    MEDIUM: 'Medium',
    HARD: 'Hard'
  } as const;
  
  // Task categories
  export const TASK_CATEGORIES = {
    ROBOTICS: 'Robotics',
    CODING: 'Coding',
    MAKING: 'Making',
    RESEARCH: 'Research'
  } as const;
  
  // View modes
  export const VIEW_MODES = {
    BOARD: 'board',
    STUDENTS: 'students',
    TASKS: 'tasks'
  } as const;

  // Group member roles
  export const GROUP_MEMBER_ROLES = {
    STUDENT: 'student',
    TEACHER: 'teacher'
  } as const;

/**
 * Feature Flags
 * 
 * This file contains flags to enable or disable features across the application.
 * Use these flags to conditionally render components or load routes.
 */

export const FEATURES = {
  /**
   * CONCEPT_MAPPING: Controls whether concept mapping visualization features are enabled
   * Currently under development and planned for future integration
   */
  CONCEPT_MAPPING: false,
  
  /**
   * PROJECT_TRACKING: Controls whether project tracking features are enabled
   * This is the currently active development focus
   */
  PROJECT_TRACKING: true
};

/**
 * Check if a feature is enabled
 * @param featureName The name of the feature to check
 * @returns boolean indicating if the feature is enabled
 */
export function isFeatureEnabled(featureName: keyof typeof FEATURES): boolean {
  return FEATURES[featureName] === true;
}