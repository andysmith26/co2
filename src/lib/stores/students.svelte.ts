// src/lib/stores/students.svelte.ts
import { supabase } from '$lib/supabase';
import { browser } from '$app/environment';

// Define the Student interface
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
      // In development mode, fetch all students without filtering by teacher_id
      const { data, error } = await supabase
        .from('students')
        .select('id, teacher_id, first_name, last_initial, status')
        .order('first_name', { ascending: true });
      
      if (error) throw error;
      
      this.studentList = data || [];
      
      console.log('Fetched students:', this.studentList);
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
  
  // Simple toggle status function
  async toggleStudentStatus(studentId: string) {
    try {
      // Find current student
      const student = this.studentList.find(s => s.id === studentId);
      if (!student) return;
      
      // Toggle status
      const newStatus = student.status === 'present' ? 'absent' : 'present';
      
      const { error } = await supabase
        .from('students')
        .update({ status: newStatus })
        .eq('id', studentId);
      
      if (error) throw error;
      
      // Update local state
      this.studentList = this.studentList.map(s => 
        s.id === studentId ? {...s, status: newStatus} : s
      );
    } catch (err: any) {
      console.error('Error toggling status:', err);
      this.error = err.message;
    }
  }

  // Add to the StudentStore class
async addStudent(firstName: string, lastInitial: string) {
    this.loading = true;
    this.error = null;
    
    try {
      // Validate input
      if (!firstName || !lastInitial) {
        throw new Error('First name and last initial are required');
      }
      
      // Use a default teacher_id
      const teacherId = '00000000-0000-0000-0000-000000000000';
      
      const { data, error } = await supabase
        .from('students')
        .insert({
          teacher_id: teacherId,
          first_name: firstName,
          last_initial: lastInitial.charAt(0).toUpperCase(),
          status: 'absent'
        })
        .select()
        .single();
      
      if (error) throw error;
      
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