import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './lib/types/database.types';
import type { Session } from '@supabase/supabase-js';

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      getSession: () => Promise<{ session: Session | null; user: any | null }>;
    }
    interface PageData {
      session: Session | null;
      user: any | null;
    }
  }
}

export {};