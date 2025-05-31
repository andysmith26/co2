// src/lib/stores/resources.svelte.ts
import { browser } from '$app/environment';
import type { Resource } from '../types';

class ResourceStore {
  // Use $state for reactive properties with explicit type declarations
  resources: Resource[] = $state([]);
  projectResources: Resource[] = $state([]); // Resources linked to current project
  loading: boolean = $state(false);
  projectResourcesLoading: boolean = $state(false);
  error: string | null = $state(null);
  
  constructor() {
    console.log('ResourceStore initialized');
  }
  
  // Fetch all available resources (with optional filtering)
  async fetchResources(filters?: { groupId?: string; search?: string; type?: string }) {
    this.loading = true;
    this.error = null;
    
    try {
      console.log('🔄 ResourceStore: Fetching resources with filters:', filters);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filters?.groupId) params.append('groupId', filters.groupId);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.type) params.append('type', filters.type);
      
      const response = await fetch(`/api/resources?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch resources');
      }
      
      const data = await response.json();
      console.log('✅ ResourceStore: Received resources:', data.length);
      this.resources = data || [];
    } catch (err: any) {
      console.error('Error fetching resources:', err);
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }
  
  // Fetch resources linked to a specific project
  async fetchProjectResources(projectId: string) {
    this.projectResourcesLoading = true;
    this.error = null;
    
    try {
      console.log('🔄 ResourceStore: Fetching project resources for:', projectId);
      const response = await fetch(`/api/projects/${projectId}/resources`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch project resources');
      }
      
      const data = await response.json();
      console.log('✅ ResourceStore: Received project resources:', data.length);
      this.projectResources = data || [];
    } catch (err: any) {
      console.error('Error fetching project resources:', err);
      this.error = err.message;
    } finally {
      this.projectResourcesLoading = false;
    }
  }
  
  getResources() {
    return this.resources;
  }
  
  getProjectResources() {
    return this.projectResources;
  }
  
  getResourceById(resourceId: string) {
    return this.resources.find(resource => resource.id === resourceId) ||
           this.projectResources.find(resource => resource.id === resourceId);
  }
  
  async createResource(type: string, title: string, url: string, description?: string, groupId?: string, studentId?: string) {
    this.loading = true;
    this.error = null;
    
    try {
      // Validate input
      if (!title.trim()) {
        throw new Error('Resource title is required');
      }
      
      if (!url.trim()) {
        throw new Error('Resource URL is required');
      }
      
      console.log('🔄 ResourceStore: Creating resource with:', {
        type,
        title,
        url,
        description,
        groupId,
        studentId
      });
      
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title,
          url,
          description,
          group_id: groupId,
          student_id: studentId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('🐛 ResourceStore: Create resource failed:', errorData);
        throw new Error(errorData.error || 'Failed to create resource');
      }
      
      const newResource = await response.json();
      console.log('✅ ResourceStore: Created resource:', newResource);
      
      // Update local state
      this.resources = [...this.resources, newResource];
      
      return newResource;
    } catch (err: any) {
      console.error('Error creating resource:', err);
      this.error = err.message;
      throw err;
    } finally {
      this.loading = false;
    }
  }
  
  async updateResource(resourceId: string, updates: Partial<Resource>) {
    this.loading = true;
    this.error = null;
    
    try {
      // Validate input
      if (updates.title !== undefined && !updates.title.trim()) {
        throw new Error('Resource title is required');
      }
      
      if (updates.url !== undefined && !updates.url.trim()) {
        throw new Error('Resource URL is required');
      }
      
      console.log('🔄 ResourceStore: Updating resource:', resourceId, 'with:', updates);
      
      const response = await fetch(`/api/resources/${resourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('🐛 ResourceStore: Update resource failed:', errorData);
        throw new Error(errorData.error || 'Failed to update resource');
      }
      
      const updatedResource = await response.json();
      console.log('✅ ResourceStore: Updated resource:', updatedResource);
      
      // Update local state
      this.resources = this.resources.map(resource => 
        resource.id === resourceId ? updatedResource : resource
      );
      
      this.projectResources = this.projectResources.map(resource => 
        resource.id === resourceId ? updatedResource : resource
      );
      
      return updatedResource;
    } catch (err: any) {
      console.error('Error updating resource:', err);
      this.error = err.message;
      throw err;
    } finally {
      this.loading = false;
    }
  }
  
  async deleteResource(resourceId: string) {
    this.loading = true;
    this.error = null;
    
    try {
      console.log('🔄 ResourceStore: Deleting resource:', resourceId);
      
      const response = await fetch(`/api/resources/${resourceId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('🐛 ResourceStore: Delete resource failed:', errorData);
        throw new Error(errorData.error || 'Failed to delete resource');
      }
      
      // Update local state
      this.resources = this.resources.filter(resource => resource.id !== resourceId);
      this.projectResources = this.projectResources.filter(resource => resource.id !== resourceId);
      
      console.log('✅ ResourceStore: Deleted resource:', resourceId);
      return true;
    } catch (err: any) {
      console.error('Error deleting resource:', err);
      this.error = err.message;
      throw err;
    } finally {
      this.loading = false;
    }
  }
  
  // Project-resource linking methods
  async linkResourceToProject(projectId: string, resourceId: string) {
    this.projectResourcesLoading = true;
    this.error = null;
    
    try {
      console.log('🔄 ResourceStore: Linking resource to project:', { projectId, resourceId });
      
      const response = await fetch(`/api/projects/${projectId}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource_id: resourceId })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('🐛 ResourceStore: Link resource failed:', errorData);
        throw new Error(errorData.error || 'Failed to link resource to project');
      }
      
      // Refresh project resources
      await this.fetchProjectResources(projectId);
      
      console.log('✅ ResourceStore: Linked resource to project');
      return true;
    } catch (err: any) {
      console.error('Error linking resource to project:', err);
      this.error = err.message;
      throw err;
    } finally {
      this.projectResourcesLoading = false;
    }
  }
  
  async unlinkResourceFromProject(projectId: string, resourceId: string) {
    this.projectResourcesLoading = true;
    this.error = null;
    
    try {
      console.log('🔄 ResourceStore: Unlinking resource from project:', { projectId, resourceId });
      
      const response = await fetch(`/api/projects/${projectId}/resources?resource_id=${resourceId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('🐛 ResourceStore: Unlink resource failed:', errorData);
        throw new Error(errorData.error || 'Failed to unlink resource from project');
      }
      
      // Update local state
      this.projectResources = this.projectResources.filter(resource => resource.id !== resourceId);
      
      console.log('✅ ResourceStore: Unlinked resource from project');
      return true;
    } catch (err: any) {
      console.error('Error unlinking resource from project:', err);
      this.error = err.message;
      throw err;
    } finally {
      this.projectResourcesLoading = false;
    }
  }
  
  // Helper method to get resources by type
  getResourcesByType(type: string) {
    return this.resources.filter(resource => resource.type === type);
  }
  
  // Helper method to get available resources (not yet linked to a project)
  getAvailableResourcesForProject(projectId: string) {
    const linkedResourceIds = this.projectResources.map(r => r.id);
    return this.resources.filter(resource => !linkedResourceIds.includes(resource.id));
  }
  
  // Helper method to clear resources
  clearResources() {
    this.resources = [];
    this.projectResources = [];
    this.error = null;
  }
}

// Create and export a single instance
export const resourceStore = new ResourceStore();