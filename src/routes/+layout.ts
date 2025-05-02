import { createBrowserClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data, depends, fetch }) => {
  // Register dependency on auth state
  depends('supabase:auth');

  // Only create the browser client on the client side
  const supabase = isBrowser() 
    ? createBrowserClient(
        PUBLIC_SUPABASE_URL,
        PUBLIC_SUPABASE_ANON_KEY,
        {
          global: { fetch },
          cookies: {
            get(key) {
              // This only runs in the browser now
              return document.cookie
                .split('; ')
                .find((row) => row.startsWith(`${key}=`))
                ?.split('=')[1];
            },
            set(key, value, options) {
              document.cookie = `${key}=${value}; path=${options?.path || '/'}`;
            },
            remove(key, options) {
              document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${options?.path || '/'}`;
            }
          }
        }
      )
    : null; // Return null during SSR

  return {
    ...data,
    supabase: supabase || data.supabase // Fall back to data.supabase if supabase is null
  };
};