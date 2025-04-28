// @ts-nocheck
import { createClient } from '@supabase/supabase-js';

// Use environment variables for connection details
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection in development mode
if (import.meta.env.DEV) {
	testConnection();
}

// Function to test the connection
async function testConnection() {
	try {
		// Use the correct count syntax for the REST API
		const { count, error } = await supabase
			.from('students')
			.select('*', { count: 'exact', head: true });

		if (error) throw error;

		console.log('✅ Supabase connection successful!');
		console.log(`Database URL: ${supabaseUrl}`);
		console.log(`Found ${count} students in database`);
		return true;
	} catch (err) {
		console.error('❌ Supabase connection failed:', err);

		// Check if table doesn't exist
		if (err.message && err.message.includes('does not exist')) {
			console.log('💡 The students table might not exist yet. Try creating it first.');
		}

		return false;
	}
}
