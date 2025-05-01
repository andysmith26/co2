// src/routes/api/test-rls/+server.ts
import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export async function GET({ locals }) {
  const session = await locals.getSession();
  
  try {
    // First test with authenticated client
    const { data: authData, error: authError } = await supabase
      .from('students')
      .select('*')
      .limit(1);
    
    // Create fresh anonymous client for comparison
    const anonClient = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
    const { data: anonData, error: anonError } = await anonClient
      .from('students')
      .select('*')
      .limit(1);
    
    return json({
      authenticated: {
        success: !authError,
        data: authData,
        error: authError?.message
      },
      anonymous: {
        success: !anonError,
        data: anonData,
        error: anonError?.message
      }
    });
  } catch (err) {
    return json({ error: err.message });
  }
}