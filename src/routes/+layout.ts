import { createBrowserClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data, depends, fetch }) => {
  // Register dependency on auth state
  depends('supabase:auth');

  // Create a Supabase client in the browser
  const supabase = isBrowser()
    ? createBrowserClient(
        PUBLIC_SUPABASE_URL,
        PUBLIC_SUPABASE_ANON_KEY,
        {
          global: {
            fetch
          },
          cookies: {
            get(key) {
              return document.cookie
                .split('; ')
                .find((row) => row.startsWith(`${key}=`))
                ?.split('=')[1];
            },
            set(key, value, options) {
              let cookie = `${key}=${value}`;
              if (options?.expires) {
                cookie += `; expires=${options.expires.toUTCString()}`;
              }
              if (options?.path) {
                cookie += `; path=${options.path}`;
              }
              if (options?.domain) {
                cookie += `; domain=${options.domain}`;
              }
              if (options?.sameSite) {
                cookie += `; samesite=${options.sameSite}`;
              }
              if (options?.secure) {
                cookie += '; secure';
              }
              document.cookie = cookie;
            },
            remove(key, options) {
              document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${options?.path || '/'}`;
            }
          }
        }
      )
    : null;

  return {
    ...data,
    supabase
  };
}