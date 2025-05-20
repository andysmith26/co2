// src/lib/stores/projects.svelte.ts
import { browser } from '$app/environment';
import type { Project } from '../types';

class ProjectStore {
  // Use $state for reactive properties with explicit type declarations
  projects: Project[] = $state([]);
  loading: boolean = $state(false);
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
      const response = await fetch(`/api/projects?groupId=${groupId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch projects for group');
      }
      
      const data = await response.json();
      this.projects = data || [];
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
