// src/hooks.server.ts
import { createServerClient } from '@supabase/ssr';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Handle Supabase auth
const supabaseHandler: Handle = async ({ event, resolve }) => {
  /**
   * Create a Supabase client specific to this server request
   */
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (key) => event.cookies.get(key),
        set: (key, value, options) => {
          event.cookies.set(key, value, {
            ...options,
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
          });
        },
        remove: (key, options) => {
          event.cookies.delete(key, {
            ...options,
            path: '/'
          });
        }
      }
    }
  );

  /**
   * Helper method to safely get and validate the session
   */
  event.locals.getSession = async () => {
    const { data: { session } } = await event.locals.supabase.auth.getSession();
    return session;
  };

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version';
    }
  });
};

// Protect routes that require authentication
const authGuard: Handle = async ({ event, resolve }) => {
  // Get the session from the server
  const session = await event.locals.getSession();
  
  // Handle protected routes (any route under the /protected path)
  if (!session && event.url.pathname.startsWith('/(protected)')) {
    throw redirect(303, '/login');
  }
  
  // If user is logged in and tries to access login, redirect to dashboard
  if (session && event.url.pathname === '/login') {
    throw redirect(303, '/(protected)/dashboard');
  }

  return resolve(event);
};

// Export the handle function with the sequence of handlers
export const handle: Handle = sequence(supabaseHandler, authGuard);