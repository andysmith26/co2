// src/lib/stores/projects.svelte.ts
import { browser } from '$app/environment';
import type { Project, Task } from '../types';

class ProjectStore {
  // Use $state for reactive properties with explicit type declarations
  projects: Project[] = $state([]);
  projectTasks: Record<string, Task[]> = $state({});
  loading: boolean = $state(false);
  tasksLoading: boolean = $state(false);
  error: string | null = $state(null);
  
  constructor() {
    if (browser) {
      this.fetchProjects();
    }
  }
  
  async fetchProjects() {
    this.loading = true;
    this.error = null;
    
    try {
      const response = await fetch('/api/projects');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch projects');
      }
      
      const data = await response.json();
      this.projects = data || [];
      
      // Fetch tasks for all projects
      this.fetchTasksForAllProjects();
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }
  
  async fetchTasksForAllProjects() {
    this.tasksLoading = true;
    
    try {
      const projectIds = this.projects.map(project => project.id);
      
      // Create a temporary object to store tasks by project ID
      const tasksMap: Record<string, Task[]> = {};
      
      // Fetch tasks for each project
      await Promise.all(
        projectIds.map(async (projectId) => {
          try {
            const response = await fetch(`/api/projects/${projectId}/tasks`);
            
            if (response.ok) {
              const tasks = await response.json();
              tasksMap[projectId] = tasks || [];
            }
          } catch (err) {
            console.error(`Error fetching tasks for project ${projectId}:`, err);
            // Continue with other projects even if one fails
          }
        })
      );
      
      // Update the state with all tasks
      this.projectTasks = tasksMap;
    } catch (err: any) {
      console.error('Error fetching tasks for projects:', err);
    } finally {
      this.tasksLoading = false;
    }
  }
  
  async fetchProjectsByGroup(groupId: string) {
    this.loading = true;
    this.error = null;
    
    try {
      const response = await fetch(`/api/projects?groupId=${groupId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch projects for group');
      }
      
      const data = await response.json();
      this.projects = data || [];
      
      // Fetch tasks for all projects in this group
      this.fetchTasksForAllProjects();
    } catch (err: any) {
      console.error('Error fetching projects by group:', err);
      this.error = err.message;
    } finally {
      this.loading = false;
    }
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
  
  getTasksForProject(projectId: string) {
    return this.projectTasks[projectId] || [];
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