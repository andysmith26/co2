// src/lib/stores/groups.svelte.ts
import { browser } from '$app/environment';
import type { Group, GroupMember } from '../types';
import { GROUP_MEMBER_ROLES } from '$lib/constants';

class GroupStore {
  // Use $state for reactive properties with explicit type declarations
  groups: Group[] = $state([]);
  currentGroupMembers: GroupMember[] = $state([]);
  loading: boolean = $state(false);
  membersLoading: boolean = $state(false);
  error: string | null = $state(null);
  
  constructor() {
    if (browser) {
      this.fetchGroups();
    }
  }
  
  async fetchGroups() {
    this.loading = true;
    this.error = null;
    
    try {
      const response = await fetch('/api/groups');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch groups');
      }
      
      const data = await response.json();
      this.groups = data || [];
    } catch (err: any) {
      console.error('Error fetching groups:', err);
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }
  
  async fetchGroupMembers(groupId: string) {
    this.membersLoading = true;
    this.error = null;
    
    try {
      const response = await fetch(`/api/groups/${groupId}/members`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch group members');
      }
      
      const data = await response.json();
      this.currentGroupMembers = data || [];
    } catch (err: any) {
      console.error('Error fetching group members:', err);
      this.error = err.message;
    } finally {
      this.membersLoading = false;
    }
  }
  
  getGroups() {
    return this.groups;
  }
  
  getGroupById(groupId: string) {
    return this.groups.find(group => group.id === groupId);
  }
  
  getGroupMembers() {
    return this.currentGroupMembers;
  }
  
  getTeacherMembers() {
    return this.currentGroupMembers.filter(
      member => member.role === GROUP_MEMBER_ROLES.TEACHER
    );
  }
  
  getStudentMembers() {
    return this.currentGroupMembers.filter(
      member => member.role === GROUP_MEMBER_ROLES.STUDENT
    );
  }
  
  async createGroup(name: string, description?: string) {
    this.loading = true;
    this.error = null;
    
    try {
      // Validate input
      if (!name.trim()) {
        throw new Error('Group name is required');
      }
      
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create group');
      }
      
      const newGroup = await response.json();
      
      // Update local state
      this.groups = [...this.groups, newGroup];
      return newGroup;
    } catch (err: any) {
      console.error('Error creating group:', err);
      this.error = err.message;
      throw err;
    } finally {
      this.loading = false;
    }
  }
  
  async updateGroup(groupId: string, name: string, description?: string) {
    this.loading = true;
    this.error = null;
    
    try {
      // Validate input
      if (!name.trim()) {
        throw new Error('Group name is required');
      }
      
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update group');
      }
      
      const updatedGroup = await response.json();
      
      // Update local state
      this.groups = this.groups.map(group => 
        group.id === groupId ? updatedGroup : group
      );
      
      return updatedGroup;
    } catch (err: any) {
      console.error('Error updating group:', err);
      this.error = err.message;
      throw err;
    } finally {
      this.loading = false;
    }
  }
  
  async deleteGroup(groupId: string) {
    this.loading = true;
    this.error = null;
    
    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete group');
      }
      
      // Update local state
      this.groups = this.groups.filter(group => group.id !== groupId);
      
      return true;
    } catch (err: any) {
      console.error('Error deleting group:', err);
      this.error = err.message;
      throw err;
    } finally {
      this.loading = false;
    }
  }
  
async addStudentToGroup(groupId: string, studentId: string, role: string) {
	this.membersLoading = true;
	this.error = null;
	
	try {
		const response = await fetch(`/api/groups/${groupId}/members`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				student_id: studentId, // Use student_id for students
				role
			})
		});
		
		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Failed to add student to group');
		}
		
		const newMember = await response.json();
		
		// Update local state if currentGroupMembers is for this group
		if (this.currentGroupMembers.length > 0 && 
				this.currentGroupMembers[0].group_id === groupId) {
			this.currentGroupMembers = [...this.currentGroupMembers, newMember];
		}
		
		return newMember;
	} catch (err: any) {
		console.error('Error adding student to group:', err);
		this.error = err.message;
		throw err;
	} finally {
		this.membersLoading = false;
	}
}
	async addTeacherToGroup(groupId: string, userId: string, role: string) {
	this.membersLoading = true;
	this.error = null;
	
	try {
		const response = await fetch(`/api/groups/${groupId}/members`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				user_id: userId,
				role
			})
		});
		
		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Failed to add teacher to group');
		}
		
		const newMember = await response.json();
		
		// Update local state if currentGroupMembers is for this group
		if (this.currentGroupMembers.length > 0 && 
				this.currentGroupMembers[0].group_id === groupId) {
			this.currentGroupMembers = [...this.currentGroupMembers, newMember];
		}
		
		return newMember;
	} catch (err: any) {
		console.error('Error adding teacher to group:', err);
		this.error = err.message;
		throw err;
	} finally {
		this.membersLoading = false;
	}
}

  async removeMemberFromGroup(groupId: string, memberId: string) {
    this.membersLoading = true;
    this.error = null;
    
    try {
      const response = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove member from group');
      }
      
      // Update local state if currentGroupMembers is for this group
      if (this.currentGroupMembers.length > 0 && 
          this.currentGroupMembers[0].group_id === groupId) {
        this.currentGroupMembers = this.currentGroupMembers.filter(
          member => member.id !== memberId
        );
      }
      
      return true;
    } catch (err: any) {
      console.error('Error removing member from group:', err);
      this.error = err.message;
      throw err;
    } finally {
      this.membersLoading = false;
    }
  }
}

// Create and export a single instance
export const groupStore = new GroupStore();
