// src/lib/stores/tasks.svelte.ts
import { browser } from '$app/environment';
import type { Task } from '../types';

class TaskStore {
  // Use $state for reactive properties with explicit type declarations
  tasks: Task[] = $state([]);
  loading: boolean = $state(false);
  error: string | null = $state(null);
  currentProjectId: string | null = $state(null);
  
  constructor() {
    // We don't fetch tasks on initial load since they are project-specific
  }
  
  async fetchTasksForProject(projectId: string) {
    this.loading = true;
    this.error = null;
    this.currentProjectId = projectId;
    
    try {
      console.log('🐛 TASK STORE: Fetching tasks for project:', projectId);
      const response = await fetch(`/api/projects/${projectId}/tasks`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch tasks');
      }
      
      const data = await response.json();
      console.log('🐛 TASK STORE: Received tasks:', data);
      this.tasks = data || [];
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }
  
  getTasks() {
    return this.tasks;
  }
  
  getTaskById(taskId: string) {
    return this.tasks.find(task => task.id === taskId);
  }
  
  async createTask(projectId: string, title: string, assigneeId?: string, assigneeType?: 'teacher' | 'student' | null, description?: string) {
    this.loading = true;
    this.error = null;
    
    try {
      // Validate input
      if (!title.trim()) {
        throw new Error('Task title is required');
      }
      
      console.log('🐛 TASK STORE: Creating task with:', {
        projectId,
        title,
        assigneeId,
        assigneeType,
        description
      });
      
      // Determine which assignee fields to send based on assignee type
      let assigneeData: {
        assignee_id?: string | null;
        student_assignee_id?: string | null;
        assignee_type?: 'teacher' | 'student' | null;
      } = {
        assignee_type: assigneeType
      };
      
      if (assigneeType === 'teacher' && assigneeId) {
        assigneeData.assignee_id = assigneeId;
        assigneeData.student_assignee_id = null;
      } else if (assigneeType === 'student' && assigneeId) {
        assigneeData.student_assignee_id = assigneeId;
        assigneeData.assignee_id = null;
      } else {
        // No assignee or invalid type
        assigneeData.assignee_id = null;
        assigneeData.student_assignee_id = null;
        assigneeData.assignee_type = null;
      }
      
      console.log('🐛 TASK STORE: Sending assignee data:', assigneeData);
      
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          ...assigneeData,
          description
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('🐛 TASK STORE: Create task failed:', errorData);
        throw new Error(errorData.error || 'Failed to create task');
      }
      
      const newTask = await response.json();
      console.log('🐛 TASK STORE: Created task:', newTask);
      
      // Update local state
      this.tasks = [...this.tasks, newTask];
      
      // Refresh tasks to get complete assignee information
      setTimeout(() => {
        this.fetchTasksForProject(projectId);
      }, 500);
      
      return newTask;
    } catch (err: any) {
      console.error('Error creating task:', err);
      this.error = err.message;
      throw err;
    } finally {
      this.loading = false;
    }
  }
  
  async updateTask(projectId: string, taskId: string, updates: Partial<Task>) {
    this.loading = true;
    this.error = null;
    
    try {
      // Validate input
      if (updates.title !== undefined && !updates.title.trim()) {
        throw new Error('Task title is required');
      }
      
      console.log('🐛 TASK STORE: Updating task:', taskId, 'with:', updates);
      
      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('🐛 TASK STORE: Update task failed:', errorData);
        throw new Error(errorData.error || 'Failed to update task');
      }
      
      const updatedTask = await response.json();
      console.log('🐛 TASK STORE: Updated task:', updatedTask);
      
      // Update local state
      this.tasks = this.tasks.map(task => 
        task.id === taskId ? updatedTask : task
      );
      
      // Refresh tasks to get complete assignee information
      setTimeout(() => {
        this.fetchTasksForProject(projectId);
      }, 500);
      
      return updatedTask;
    } catch (err: any) {
      console.error('Error updating task:', err);
      this.error = err.message;
      throw err;
    } finally {
      this.loading = false;
    }
  }
  
  async deleteTask(projectId: string, taskId: string) {
    this.loading = true;
    this.error = null;
    
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete task');
      }
      
      // Update local state
      this.tasks = this.tasks.filter(task => task.id !== taskId);
      
      return true;
    } catch (err: any) {
      console.error('Error deleting task:', err);
      this.error = err.message;
      throw err;
    } finally {
      this.loading = false;
    }
  }
  
  async updateTaskStatus(projectId: string, taskId: string, status: string) {
    return this.updateTask(projectId, taskId, { status });
  }
  
  async assignTask(projectId: string, taskId: string, assigneeId: string | null, assigneeType: 'teacher' | 'student' | null = null) {
    console.log('🐛 TASK STORE: Assigning task:', {
      taskId,
      assigneeId,
      assigneeType
    });
    
    const updates: any = { assignee_type: assigneeType };
    
    if (assigneeType === 'teacher') {
      updates.assignee_id = assigneeId;
      updates.student_assignee_id = null;
    } else if (assigneeType === 'student') {
      updates.student_assignee_id = assigneeId;
      updates.assignee_id = null;
    } else {
      // No assignee or unspecified type
      updates.assignee_id = null;
      updates.student_assignee_id = null;
    }
    
    return this.updateTask(projectId, taskId, updates);
  }
}

// Create and export a single instance
export const taskStore = new TaskStore();