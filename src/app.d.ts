// src/app.d.ts
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

  // Cloudinary Upload Widget declarations
  interface Window {
    cloudinary: {
      createUploadWidget: (
        options: any,
        callback: (error: any, result: any) => void
      ) => {
        open: () => void;
        close: () => void;
        destroy: () => void;
        hide: () => void;
        show: () => void;
        minimize: () => void;
        update: (options: any) => void;
        isDestroyed: () => boolean;
        isMinimized: () => boolean;
        isShowing: () => boolean;
      };
      openUploadWidget: (
        options: any,
        callback: (error: any, result: any) => void
      ) => void;
    };
  }
}

export {};