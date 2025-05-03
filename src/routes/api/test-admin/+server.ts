// src/routes/api/test-admin/+server.ts
import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase';
import { isAdmin } from '$lib/server/supabase';

export async function GET({ locals }) {
  try {
    // First verify the user is authenticated with a secure method
    const { data: { user }, error: authError } = await locals.supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('Authentication check failed:', authError?.message);
      return json({ 
        admin: false, 
        message: 'Authentication failed'
      });
    }
    
    // Now check if they have admin privileges
    const admin = await isAdmin(locals);
    console.log('Admin test endpoint - isAdmin result:', admin);
    
    if (!admin) {
      return json({ 
        admin: false, 
        message: 'Not an admin user'
      });
    }
    
    // Test querying without RLS constraints - fixed to use count correctly
    const { count, error } = await supabaseAdmin
      .from('students')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
    
    return json({ 
      admin: true, 
      count: count || 0,
      email: user.email,
      message: 'Admin access confirmed'
    });
  } catch (err) {
    console.error('Admin client test failed:', err);
    // Return more detailed error information
    return json({ 
      success: false, 
      error: err.message || 'Unknown error',
      errorDetails: typeof err === 'object' ? JSON.stringify(err) : 'No details'
    });
  }
}