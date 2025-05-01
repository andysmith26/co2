// src/routes/api/test/+server.ts
import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase.from('students').select('count(*)');
    
    if (error) throw error;
    return json({ connected: true, count: data[0].count });
  } catch (err) {
    console.error('Database connection test failed:', err);
    return json({ connected: false, error: err.message });
  }
}