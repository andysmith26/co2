// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './lib/types/database.types';
import type { Session } from '@supabase/supabase-js';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient<Database>;
			getSession: () => Promise<Session | null>;
		}
		interface PageData {
			session: Session | null;
			supabase: SupabaseClient<Database>;
		}
		// interface Platform {}
	}
}

export {};