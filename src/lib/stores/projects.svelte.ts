// src/lib/stores/projects.svelte.ts
import { browser } from '$app/environment';
import type { Project, Task } from '../types';

class ProjectStore {
  // Use $state for reactive properties with explicit type declarations
  projects: Project[] = $state([]);
  projectTasks: Record<string, Task[] | null> = $state({}); // null = not loaded, [] = loaded but empty, Task[] = loaded with data
  loading: boolean = $state(false);
  tasksLoading: Set<string> = $state(new Set()); // Track which projects are currently loading tasks
  error: string | null = $state(null);
  
  constructor() {
    console.log('ProjectStore initialized');
  }
  
  async fetchProjects() {
    this.loading = true;
    this.error = null;
    
    try {
      console.log('🔄 ProjectStore: Fetching projects');
      const response = await fetch('/api/projects');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch projects');
      }
      
      const data = await response.json();
      this.projects = data || [];
      
      console.log('✅ ProjectStore: Fetched', this.projects.length, 'projects');
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }
  
  async fetchProjectsByGroup(groupId: string) {
    this.loading = true;
    this.error = null;
    
    try {
      console.log('🔄 ProjectStore: Fetching projects for group:', groupId);
      const response = await fetch(`/api/projects?groupId=${groupId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch projects for group');
      }
      
      const data = await response.json();
      this.projects = data || [];
      
      // Clear task cache when switching groups since different projects are shown
      this.projectTasks = {};
      
      console.log('✅ ProjectStore: Fetched', this.projects.length, 'projects for group');
    } catch (err: any) {
      console.error('Error fetching projects by group:', err);
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }
  
  // Progressive task loading - load tasks for a single project
  async fetchTasksForProject(projectId: string, force = false) {
    // Don't reload if already loaded/loading unless forced
    if (!force && (this.tasksLoading.has(projectId) || this.projectTasks[projectId] !== undefined)) {
      return;
    }
    
    // Mark as loading
    this.tasksLoading.add(projectId);
    
    try {
      console.log('🔄 ProjectStore: Fetching tasks for project:', projectId);
      const response = await fetch(`/api/projects/${projectId}/tasks`);
      
      if (response.ok) {
        const tasks = await response.json();
        this.projectTasks = {
          ...this.projectTasks,
          [projectId]: tasks || []
        };
        console.log('✅ ProjectStore: Loaded', tasks?.length || 0, 'tasks for project', projectId);
      } else {
        console.error('Failed to fetch tasks for project:', projectId);
        this.projectTasks = {
          ...this.projectTasks,
          [projectId]: [] // Mark as loaded but empty on error
        };
      }
    } catch (err) {
      console.error(`Error fetching tasks for project ${projectId}:`, err);
      this.projectTasks = {
        ...this.projectTasks,
        [projectId]: [] // Mark as loaded but empty on error
      };
    } finally {
      // Remove from loading set
      this.tasksLoading.delete(projectId);
    }
  }
  
  // Load tasks for all visible projects progressively
  async loadTasksForVisibleProjects(force = false) {
    if (this.projects.length === 0) return;
    
    console.log('🔄 ProjectStore: Starting progressive task loading for', this.projects.length, 'projects');
    
    // Start loading tasks for each project concurrently
    const loadPromises = this.projects.map(project => 
      this.fetchTasksForProject(project.id, force)
    );
    
    // Don't await all - let them complete individually
    // This allows each project card to update as soon as its tasks are loaded
    Promise.allSettled(loadPromises).then((results) => {
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      console.log('✅ ProjectStore: Progressive task loading complete.', successful, 'successful,', failed, 'failed');
    });
  }
  
  getProjects() {
    return this.projects;
  }
  
  getProjectById(projectId: string) {
    return this.projects.find(project => project.id === projectId);
  }
  
  getProjectTasks() {
    return this.projectTasks;
  }
  
  getTasksForProject(projectId: string): Task[] | null {
    return this.projectTasks[projectId] ?? null; // null means not loaded yet
  }
  
  isProjectTasksLoading(projectId: string): boolean {
    return this.tasksLoading.has(projectId);
  }
  
  // Get total task count across all loaded projects
  getTotalTaskCount(): number {
    return Object.values(this.projectTasks)
      .filter((tasks): tasks is Task[] => Array.isArray(tasks))
      .reduce((total, tasks) => total + tasks.length, 0);
  }
  
  async createProject(title: string, groupId: string, description?: string) {
    this.loading = true;
    this.error = null;
    
    try {
      // Validate input
      if (!title.trim()) {
        throw new Error('Project title is required');
      }
      
      if (!groupId) {
        throw new Error('Group is required');
      }
      
      console.log('🔄 ProjectStore: Creating project:', title);
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          group_id: groupId,
          description
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }
      
      const newProject = await response.json();
      
      // Update local state
      this.projects = [...this.projects, newProject];
      
      // Initialize empty tasks array for the new project
      this.projectTasks = {
        ...this.projectTasks,
        [newProject.id]: []
      };
      
      console.log('✅ ProjectStore: Created project:', newProject.title);
      return newProject;
    } catch (err: any) {
      console.error('Error creating project:', err);
      this.error = err.message;
      throw err;
    } finally {
      this.loading = false;
    }
  }
  
  async updateProject(projectId: string, title: string, description?: string, status?: string) {
    this.loading = true;
    this.error = null;
    
    try {
      // Validate input
      if (!title.trim()) {
        throw new Error('Project title is required');
      }
      
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          status
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update project');
      }
      
      const updatedProject = await response.json();
      
      // Update local state
      this.projects = this.projects.map(project => 
        project.id === projectId ? updatedProject : project
      );
      
      return updatedProject;
    } catch (err: any) {
      console.error('Error updating project:', err);
      this.error = err.message;
      throw err;
    } finally {
      this.loading = false;
    }
  }
  
  async deleteProject(projectId: string) {
    this.loading = true;
    this.error = null;
    
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete project');
      }
      
      // Update local state
      this.projects = this.projects.filter(project => project.id !== projectId);
      
      // Remove tasks for this project
      const { [projectId]: _, ...remainingTasks } = this.projectTasks;
      this.projectTasks = remainingTasks;
      
      return true;
    } catch (err: any) {
      console.error('Error deleting project:', err);
      this.error = err.message;
      throw err;
    } finally {
      this.loading = false;
    }
  }
}

// Create and export a single instance
export const projectStore = new ProjectStore();