// src/routes/api/admin/stats/+server.ts
import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase';
import { isAdmin } from '$lib/server/supabase';

export async function GET({ locals }) {
  try {
    // Verify admin status using the secure isAdmin function
    if (!await isAdmin(locals)) {
      console.log('Stats access denied: User is not an admin');
      return json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }
    
    console.log('Admin status confirmed, fetching stats...');
    
    // Get stats across all teachers
    const { data, error } = await supabaseAdmin
      .from('students')
      .select('teacher_id, status');
      
    if (error) {
      console.error('Error fetching student data:', error);
      throw error;
    }
    
    if (!data) {
      console.log('No student data found');
      return json({
        totalStudents: 0,
        teacherCounts: {},
        teacherEmails: {},
        statusCounts: { present: 0, absent: 0, late: 0 }
      });
    }
    
    console.log(`Found ${data.length} student records`);
    
    // Process data 
    const teacherCounts = {};
    const statusCounts = {
      present: 0,
      absent: 0,
      late: 0
    };
    
    data.forEach(student => {
      // Count by teacher
      if (!teacherCounts[student.teacher_id]) {
        teacherCounts[student.teacher_id] = 0;
      }
      teacherCounts[student.teacher_id]++;
      
      // Count by status
      if (student.status) {
        statusCounts[student.status] = (statusCounts[student.status] || 0) + 1;
      }
    });
    
    let teacherEmails = {};
    
    // Try to get teacher emails from auth.users table
    try {
      if (Object.keys(teacherCounts).length > 0) {
        // Get user data from the admin API
        const { data: listData, error: userError } = await supabaseAdmin
          .auth
          .admin
          .listUsers();
        
        if (userError) {
          console.warn('Could not access admin.listUsers:', userError);
        } else if (listData && listData.users && Array.isArray(listData.users)) {
          // Map teacher IDs to emails
          listData.users.forEach(user => {
            if (teacherCounts[user.id]) {
              teacherEmails[user.id] = user.email;
            }
          });
          console.log(`Found ${Object.keys(teacherEmails).length} teacher emails`);
        }
      }
    } catch (emailLookupError) {
      // Just log it and continue - emails aren't critical
      console.warn('Error looking up teacher emails:', emailLookupError);
    }
    
    return json({
      totalStudents: data.length,
      teacherCounts,
      teacherEmails,
      statusCounts
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    return json({ 
      error: 'Failed to fetch stats',
      message: err.message || 'Unknown error'
    }, { status: 500 });
  }
}