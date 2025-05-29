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
      console.log('🔄 TASK STORE: Fetching tasks for project:', projectId);
      const response = await fetch(`/api/projects/${projectId}/tasks`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ TASK STORE: Fetch failed:', errorData);
        throw new Error(errorData.error || 'Failed to fetch tasks');
      }
      
      const data = await response.json();
      console.log('✅ TASK STORE: Received', data?.length || 0, 'tasks');
      this.tasks = data || [];
      
      // Enhanced logging for task structure
      if (data && data.length > 0) {
        console.log('🔍 TASK STORE: First task structure:', {
          id: data[0].id,
          title: data[0].title,
          assignee_type: data[0].assignee_type,
          assignee_id: data[0].assignee_id,
          student_assignee_id: data[0].student_assignee_id,
          hasAssignee: !!data[0].assignee,
          hasStudentAssignee: !!data[0].student_assignee
        });
      }
    } catch (err: any) {
      console.error('❌ TASK STORE: Error fetching tasks:', err);
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
      
      console.log('🔄 TASK STORE: Creating task with enhanced logging:');
      console.log('- projectId:', projectId);
      console.log('- title:', title);
      console.log('- assigneeId:', assigneeId);
      console.log('- assigneeType:', assigneeType);
      console.log('- description:', description?.substring(0, 50) + '...');
      
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
        console.log('- Setting teacher assignee:', assigneeId);
      } else if (assigneeType === 'student' && assigneeId) {
        assigneeData.student_assignee_id = assigneeId;
        assigneeData.assignee_id = null;
        console.log('- Setting student assignee:', assigneeId);
      } else {
        // No assignee or invalid type
        assigneeData.assignee_id = null;
        assigneeData.student_assignee_id = null;
        assigneeData.assignee_type = null;
        console.log('- No assignee set');
      }
      
      const requestBody = {
        title,
        ...assigneeData,
        description
      };
      
      console.log('- Request body:', requestBody);
      
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ TASK STORE: Create task failed:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.error || 'Failed to create task');
      }
      
      const newTask = await response.json();
      console.log('✅ TASK STORE: Created task successfully:', {
        id: newTask.id,
        title: newTask.title,
        assignee_type: newTask.assignee_type,
        assignee_id: newTask.assignee_id,
        student_assignee_id: newTask.student_assignee_id
      });
      
      // Update local state
      this.tasks = [...this.tasks, newTask];
      
      // Refresh tasks to get complete assignee information
      setTimeout(() => {
        console.log('🔄 TASK STORE: Refreshing tasks to get complete assignee info');
        this.fetchTasksForProject(projectId);
      }, 500);
      
      return newTask;
    } catch (err: any) {
      console.error('❌ TASK STORE: Error creating task:', err);
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
      
      console.log('🔄 TASK STORE: Updating task with enhanced logging:');
      console.log('- projectId:', projectId);
      console.log('- taskId:', taskId);
      console.log('- updates:', updates);
      
      // Enhanced logging for assignment updates
      if (updates.assignee_id !== undefined || updates.student_assignee_id !== undefined || updates.assignee_type !== undefined) {
        console.log('- Assignment update detected:');
        console.log('  - assignee_type:', updates.assignee_type);
        console.log('  - assignee_id:', updates.assignee_id);
        console.log('  - student_assignee_id:', updates.student_assignee_id);
        
        // Find the current task for comparison
        const currentTask = this.getTaskById(taskId);
        if (currentTask) {
          console.log('- Current task assignment:');
          console.log('  - current assignee_type:', currentTask.assignee_type);
          console.log('  - current assignee_id:', currentTask.assignee_id);
          console.log('  - current student_assignee_id:', currentTask.student_assignee_id);
        }
      }
      
      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ TASK STORE: Update task failed:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          requestBody: updates
        });
        throw new Error(errorData.error || 'Failed to update task');
      }
      
      const updatedTask = await response.json();
      console.log('✅ TASK STORE: Updated task successfully:', {
        id: updatedTask.id,
        title: updatedTask.title,
        assignee_type: updatedTask.assignee_type,
        assignee_id: updatedTask.assignee_id,
        student_assignee_id: updatedTask.student_assignee_id
      });
      
      // Update local state
      this.tasks = this.tasks.map(task => 
        task.id === taskId ? updatedTask : task
      );
      
      // Refresh tasks to get complete assignee information
      setTimeout(() => {
        console.log('🔄 TASK STORE: Refreshing tasks to get complete assignee info');
        this.fetchTasksForProject(projectId);
      }, 500);
      
      return updatedTask;
    } catch (err: any) {
      console.error('❌ TASK STORE: Error updating task:', err);
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
      console.log('🔄 TASK STORE: Deleting task:', taskId);
      
      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ TASK STORE: Delete task failed:', errorData);
        throw new Error(errorData.error || 'Failed to delete task');
      }
      
      console.log('✅ TASK STORE: Deleted task successfully');
      
      // Update local state
      this.tasks = this.tasks.filter(task => task.id !== taskId);
      
      return true;
    } catch (err: any) {
      console.error('❌ TASK STORE: Error deleting task:', err);
      this.error = err.message;
      throw err;
    } finally {
      this.loading = false;
    }
  }
  
  async updateTaskStatus(projectId: string, taskId: string, status: string) {
    console.log('🔄 TASK STORE: Updating task status:', { taskId, status });
    return this.updateTask(projectId, taskId, { status });
  }
  
  // REMOVED: The problematic assignTask method that was causing the error
  // Assignment changes should only happen through the main updateTask method
  // or during task creation in the TaskForm component
}

// Create and export a single instance
export const taskStore = new TaskStore();