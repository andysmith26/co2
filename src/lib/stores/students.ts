// src/lib/stores/students.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export const students = writable([]);
export const loading = writable(false);
export const error = writable(null);

export async function fetchStudents() {
  if (!browser) return;
  
  loading.set(true);
  error.set(null);
  
  try {
    const response = await fetch('/api/students');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch students');
    }
    
    const data = await response.json();
    students.set(data || []);
  } catch (err) {
    console.error('Error fetching students:', err);
    error.set(err.message);
  } finally {
    loading.set(false);
  }
}

export async function addStudent(firstName, lastInitial) {
  loading.set(true);
  error.set(null);
  
  try {
    const response = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: firstName,
        last_initial: lastInitial
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add student');
    }
    
    const newStudent = await response.json();
    students.update(s => [...s, newStudent]);
    return newStudent;
  } catch (err) {
    console.error('Error adding student:', err);
    error.set(err.message);
    throw err;
  } finally {
    loading.set(false);
  }
}

// Initialize store
if (browser) {
  fetchStudents();
}