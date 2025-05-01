// src/lib/stores/students.ts (replacing students.svelte.ts)
import { browser } from '$app/environment';

// Student type definition
interface Student {
  id: string;
  teacher_id: string;
  first_name: string;
  last_initial: string;
  status: string;
}

class StudentStore {
  // Use $state for reactive properties
  studentList = $state<Student[]>([]);
  loading = $state(false);
  error = $state<string | null>(null);
  
  constructor() {
    if (browser) {
      this.fetchStudents();
    }
  }
  
  async fetchStudents() {
    this.loading = true;
    this.error = null;
    
    try {
      const response = await fetch('/api/students');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch students');
      }
      
      const data = await response.json();
      this.studentList = data || [];
    } catch (err: any) {
      console.error('Error fetching students:', err);
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }
  
  getStudents() {
    return this.studentList;
  }
  
  async toggleStudentStatus(studentId: string) {
    try {
      // Find current student
      const student = this.studentList.find(s => s.id === studentId);
      if (!student) return;
      
      // Toggle status
      const newStatus = student.status === 'present' ? 'absent' : 'present';
      
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update student status');
      }
      
      // Update local state
      this.studentList = this.studentList.map(s => 
        s.id === studentId ? {...s, status: newStatus} : s
      );
    } catch (err: any) {
      console.error('Error toggling status:', err);
      this.error = err.message;
    }
  }

  async addStudent(firstName: string, lastInitial: string) {
    this.loading = true;
    this.error = null;
    
    try {
      // Validate input
      if (!firstName || !lastInitial) {
        throw new Error('First name and last initial are required');
      }
      
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_initial: lastInitial.charAt(0).toUpperCase()
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add student');
      }
      
      const data = await response.json();
      
      // Update local state
      this.studentList = [...this.studentList, data];
      return data;
    } catch (err: any) {
      console.error('Error adding student:', err);
      this.error = err.message;
      throw err;
    } finally {
      this.loading = false;
    }
  }
}

// Create and export a single instance
export const studentStore = new StudentStore();