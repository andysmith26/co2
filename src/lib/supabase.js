import { createClient } from '@supabase/supabase-js';
import { browser } from '$app/environment';

// Get environment variables - prioritize Vercel's Supabase integration variables
const supabaseUrl = browser 
  ? import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL
  : process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey = browser 
  ? import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
  : process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  if (browser) {
    console.error('Missing Supabase environment variables. Check your Vercel configuration.');
  } else {
    console.error('Missing Supabase environment variables in server environment');
  }
}

// Create and export the Supabase client
export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
);

// Test connection in development mode
if (browser && import.meta.env.DEV) {
  testConnection();
}

// Function to test the connection
async function testConnection() {
  try {
    // Use a simple auth check first
    const { data, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      throw authError;
    }
    
    // Then try to access the database
    const { count, error } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      // If the error is just that the table doesn't exist, that's okay
      if (error.message && error.message.includes('does not exist')) {
        console.log('✅ Supabase connection successful!');
        console.log(`Database URL: ${supabaseUrl}`);
        console.log('💡 The students table does not exist yet. Run the schema.sql script in Supabase.');
        return true;
      }
      throw error;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log(`Database URL: ${supabaseUrl}`);
    console.log(`Found ${count} students in database`);
    return true;
  } catch (err: any) {
    console.error('❌ Supabase connection failed:', err.message);
    console.log('Check your environment variables in Vercel or .env file');
    return false;
  }
}
