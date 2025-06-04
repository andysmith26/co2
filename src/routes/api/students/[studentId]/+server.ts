// src/routes/api/students/[studentId]/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
  const { studentId } = params;
  
  try {
    // Get session
    const { session } = await locals.getSession();
    
    console.log('🔄 API: GET student request:', { studentId, userId: session?.user?.id });
    
    if (!session) {
      console.log('❌ API: Unauthorized - no session');
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the student and verify teacher ownership
    const { data: student, error } = await locals.supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .eq('teacher_id', session.user.id) // Only allow teachers to access their own students
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ API: Student not found or access denied:', { studentId, teacherId: session.user.id });
        return json({ error: 'Student not found or you do not have permission to view this student' }, { status: 404 });
      }
      console.error('❌ API: Database error fetching student:', error);
      return json({ error: error.message }, { status: 500 });
    }
    
    console.log('✅ API: Student fetched successfully:', { id: student.id, name: `${student.first_name} ${student.last_initial}` });
    return json(student);
  } catch (err) {
    console.error('❌ API: Unexpected error in GET student:', err);
    return json({ error: 'Server error' }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  const { studentId } = params;
  
  try {
    // Get session
    const { session } = await locals.getSession();
    
    console.log('🔄 API: PUT student request:', { studentId, userId: session?.user?.id });
    
    if (!session) {
      console.log('❌ API: Unauthorized - no session');
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
      console.log('🔍 API: PUT request body:', requestBody);
    } catch (parseError) {
      console.error('❌ API: Failed to parse request body:', parseError);
      return json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    const { first_name, last_initial } = requestBody;
    
    // Validate input
    if (!first_name || typeof first_name !== 'string' || !first_name.trim()) {
      console.error('❌ API: Validation failed - invalid first_name:', first_name);
      return json({ error: 'First name is required and must be a non-empty string' }, { status: 400 });
    }
    
    if (!last_initial || typeof last_initial !== 'string' || !last_initial.trim()) {
      console.error('❌ API: Validation failed - invalid last_initial:', last_initial);
      return json({ error: 'Last initial is required and must be a non-empty string' }, { status: 400 });
    }
    
    // Prepare update data
    const updateData = {
      first_name: first_name.trim(),
      last_initial: last_initial.trim().charAt(0).toUpperCase()
    };
    
    console.log('🔍 API: Update data prepared:', updateData);
    
    // Update the student (with teacher ownership verification)
    const { data: updatedStudent, error } = await locals.supabase
      .from('students')
      .update(updateData)
      .eq('id', studentId)
      .eq('teacher_id', session.user.id) // Only allow teachers to update their own students
      .select()
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ API: Student not found or access denied for update:', { studentId, teacherId: session.user.id });
        return json({ error: 'Student not found or you do not have permission to update this student' }, { status: 404 });
      }
      console.error('❌ API: Database error updating student:', error);
      return json({ error: error.message }, { status: 500 });
    }
    
    console.log('✅ API: Student updated successfully:', { id: updatedStudent.id, name: `${updatedStudent.first_name} ${updatedStudent.last_initial}` });
    return json(updatedStudent);
  } catch (err) {
    console.error('❌ API: Unexpected error in PUT student:', err);
    return json({ error: 'Server error' }, { status: 500 });
  }
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  const { studentId } = params;
  
  try {
    // Get session
    const { session } = await locals.getSession();
    
    console.log('🔄 API: PATCH student request:', { studentId, userId: session?.user?.id });
    
    if (!session) {
      console.log('❌ API: Unauthorized - no session');
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
      console.log('🔍 API: PATCH request body:', requestBody);
    } catch (parseError) {
      console.error('❌ API: Failed to parse request body:', parseError);
      return json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    // Build update object with only provided fields
    const updates: any = {};
    
    if (requestBody.status !== undefined) {
      // Validate status
      if (!['present', 'absent'].includes(requestBody.status)) {
        console.error('❌ API: Invalid status value:', requestBody.status);
        return json({ error: 'Status must be either "present" or "absent"' }, { status: 400 });
      }
      updates.status = requestBody.status;
    }
    
    if (requestBody.first_name !== undefined) {
      if (!requestBody.first_name || typeof requestBody.first_name !== 'string' || !requestBody.first_name.trim()) {
        console.error('❌ API: Invalid first_name in PATCH:', requestBody.first_name);
        return json({ error: 'First name must be a non-empty string' }, { status: 400 });
      }
      updates.first_name = requestBody.first_name.trim();
    }
    
    if (requestBody.last_initial !== undefined) {
      if (!requestBody.last_initial || typeof requestBody.last_initial !== 'string' || !requestBody.last_initial.trim()) {
        console.error('❌ API: Invalid last_initial in PATCH:', requestBody.last_initial);
        return json({ error: 'Last initial must be a non-empty string' }, { status: 400 });
      }
      updates.last_initial = requestBody.last_initial.trim().charAt(0).toUpperCase();
    }
    
    // Check if we have any updates to make
    if (Object.keys(updates).length === 0) {
      console.log('⚠️ API: No valid updates provided in PATCH request');
      return json({ error: 'No valid updates provided' }, { status: 400 });
    }
    
    console.log('🔍 API: PATCH updates prepared:', updates);
    
    // Update the student (with teacher ownership verification)
    const { data: updatedStudent, error } = await locals.supabase
      .from('students')
      .update(updates)
      .eq('id', studentId)
      .eq('teacher_id', session.user.id) // Only allow teachers to update their own students
      .select()
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ API: Student not found or access denied for patch:', { studentId, teacherId: session.user.id });
        return json({ error: 'Student not found or you do not have permission to update this student' }, { status: 404 });
      }
      console.error('❌ API: Database error patching student:', error);
      return json({ error: error.message }, { status: 500 });
    }
    
    console.log('✅ API: Student patched successfully:', { id: updatedStudent.id, updates });
    return json(updatedStudent);
  } catch (err) {
    console.error('❌ API: Unexpected error in PATCH student:', err);
    return json({ error: 'Server error' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  const { studentId } = params;
  
  try {
    // Get session
    const { session } = await locals.getSession();
    
    console.log('🔄 API: DELETE student request:', { studentId, userId: session?.user?.id });
    
    if (!session) {
      console.log('❌ API: Unauthorized - no session');
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First verify the student exists and belongs to this teacher
    const { data: student, error: fetchError } = await locals.supabase
      .from('students')
      .select('id, first_name, last_initial')
      .eq('id', studentId)
      .eq('teacher_id', session.user.id)
      .single();
      
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        console.log('❌ API: Student not found or access denied for delete:', { studentId, teacherId: session.user.id });
        return json({ error: 'Student not found or you do not have permission to delete this student' }, { status: 404 });
      }
      console.error('❌ API: Database error fetching student for delete:', fetchError);
      return json({ error: fetchError.message }, { status: 500 });
    }
    
    // Delete the student
    const { error: deleteError } = await locals.supabase
      .from('students')
      .delete()
      .eq('id', studentId)
      .eq('teacher_id', session.user.id); // Double-check ownership on delete
      
    if (deleteError) {
      console.error('❌ API: Database error deleting student:', deleteError);
      return json({ error: deleteError.message }, { status: 500 });
    }
    
    console.log('✅ API: Student deleted successfully:', { id: studentId, name: `${student.first_name} ${student.last_initial}` });
    return json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    console.error('❌ API: Unexpected error in DELETE student:', err);
    return json({ error: 'Server error' }, { status: 500 });
  }
};
