// src/lib/stores/students.svelte.ts
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
    console.log('🐛 DEBUG: fetchStudents called');
    this.loading = true;
    this.error = null;
    
    try {
      console.log('🐛 DEBUG: Making GET request to /api/students');
      const response = await fetch('/api/students');
      console.log('🐛 DEBUG: GET response status:', response.status);
      console.log('🐛 DEBUG: GET response headers:', Object.fromEntries(response.headers));
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('🐛 DEBUG: GET request failed with error data:', errorData);
        throw new Error(errorData.error || 'Failed to fetch students');
      }
      
      const data = await response.json();
      console.log('🐛 DEBUG: GET response data:', data);
      console.log('🐛 DEBUG: GET response data type:', typeof data);
      console.log('🐛 DEBUG: Is GET response data an array?', Array.isArray(data));
      
      // Handle the response structure - it might be wrapped in an object
      if (data && data.students && Array.isArray(data.students)) {
        console.log('🐛 DEBUG: Using data.students array');
        this.studentList = data.students;
      } else if (Array.isArray(data)) {
        console.log('🐛 DEBUG: Using data directly as array');
        this.studentList = data;
      } else {
        console.error('🐛 DEBUG: Response data is not in expected format, defaulting to empty array');
        this.studentList = [];
      }
      
      console.log('🐛 DEBUG: studentList updated to:', this.studentList);
      console.log('🐛 DEBUG: studentList length:', this.studentList.length);
    } catch (err: any) {
      console.error('🐛 DEBUG: fetchStudents error:', err);
      this.error = err.message;
    } finally {
      this.loading = false;
      console.log('🐛 DEBUG: fetchStudents completed, loading set to false');
    }
  }
  
  getStudents() {
    return this.studentList;
  }
  
  async toggleStudentStatus(studentId: string) {
    console.log('🐛 DEBUG: toggleStudentStatus called for:', studentId);
    try {
      // Find current student
      const student = this.studentList.find(s => s.id === studentId);
      if (!student) {
        console.error('🐛 DEBUG: Student not found for ID:', studentId);
        return;
      }
      
      // Toggle status
      const newStatus = student.status === 'present' ? 'absent' : 'present';
      console.log('🐛 DEBUG: Toggling status from', student.status, 'to', newStatus);

      const response = await fetch(`/api/students/${studentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      console.log('🐛 DEBUG: PATCH response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('🐛 DEBUG: PATCH request failed:', errorData);
        throw new Error(errorData.error || 'Failed to update student status');
      }
      
      // Update local state
      this.studentList = this.studentList.map(s => 
        s.id === studentId ? {...s, status: newStatus} : s
      );
      console.log('🐛 DEBUG: Local state updated after status toggle');
    } catch (err: any) {
      console.error('🐛 DEBUG: toggleStudentStatus error:', err);
      this.error = err.message;
    }
  }

  async addStudent(firstName: string, lastInitial: string) {
    console.log('🐛 DEBUG: addStudent called with:', { firstName, lastInitial });
    console.log('🐛 DEBUG: Current studentList state:', this.studentList);
    console.log('🐛 DEBUG: studentList type:', typeof this.studentList);
    console.log('🐛 DEBUG: Is studentList an array?', Array.isArray(this.studentList));
    
    this.loading = true;
    this.error = null;
    
    try {
      // Validate input
      if (!firstName || !lastInitial) {
        const error = 'First name and last initial are required';
        console.error('🐛 DEBUG: Validation failed:', error);
        throw new Error(error);
      }
      
      const requestBody = {
        first_name: firstName,
        last_initial: lastInitial.charAt(0).toUpperCase()
      };
      
      console.log('🐛 DEBUG: Preparing POST request to /api/students');
      console.log('🐛 DEBUG: Request body:', requestBody);
      
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      console.log('🐛 DEBUG: POST response status:', response.status);
      console.log('🐛 DEBUG: POST response status text:', response.statusText);
      console.log('🐛 DEBUG: POST response headers:', Object.fromEntries(response.headers));
      
      // Try to get response text first to see what we actually received
      const responseText = await response.text();
      console.log('🐛 DEBUG: Raw response text:', responseText);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
          console.error('🐛 DEBUG: POST request failed with parsed error:', errorData);
        } catch (parseError) {
          console.error('🐛 DEBUG: Could not parse error response as JSON:', parseError);
          console.error('🐛 DEBUG: Raw error response:', responseText);
          errorData = { error: `Server returned ${response.status}: ${responseText}` };
        }
        throw new Error(errorData.error || 'Failed to add student');
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('🐛 DEBUG: POST response parsed successfully:', data);
      } catch (parseError) {
        console.error('🐛 DEBUG: Could not parse success response as JSON:', parseError);
        throw new Error('Server returned invalid JSON response');
      }
      
      // Update local state
      console.log('🐛 DEBUG: About to update studentList. Current state:', this.studentList);
      console.log('🐛 DEBUG: Is current studentList iterable?', this.studentList && typeof this.studentList[Symbol.iterator] === 'function');
      
      if (!Array.isArray(this.studentList)) {
        console.error('🐛 DEBUG: studentList is not an array! Converting to array...');
        this.studentList = [];
      }
      
      this.studentList = [...this.studentList, data];
      console.log('🐛 DEBUG: Local studentList updated, new length:', this.studentList.length);
      return data;
    } catch (err: any) {
      console.error('🐛 DEBUG: Final addStudent error:', err);
      console.error('🐛 DEBUG: Error stack:', err.stack);
      this.error = err.message;
      throw err;
    } finally {
      this.loading = false;
      console.log('🐛 DEBUG: addStudent completed, loading set to false');
    }
  }
}

// Create and export a single instance
export const studentStore = new StudentStore();