import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

export async function GET() {
  try {
    // Use the proper Supabase count method
    const { count, error } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return json({ connected: true, count: count });
  } catch (err) {
    console.error('Database connection test failed:', err);
    return json({ connected: false, error: err.message });
  }
}