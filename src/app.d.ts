// src/app.d.ts
import type { SupabaseClient } from '@supabase/supabase-js';

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient;
      getSession: () => Promise<import('@supabase/supabase-js').Session | null>;
    }
  }
}

export {};