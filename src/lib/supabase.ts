// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Create the Supabase client with environment variables
export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

// Optional helper for checking connection status (used in dev UI only)
export async function checkConnection() {
	try {
		const { error } = await supabase.auth.getSession();
		return { connected: !error, error: error?.message };
	} catch (err: any) {
		return { connected: false, error: err.message };
	}
}
