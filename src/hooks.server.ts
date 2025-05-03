// src/hooks.server.ts
import { createServerClient } from '@supabase/ssr';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Handle Supabase auth
const supabaseHandler: Handle = async ({ event, resolve }) => {
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

  // Add getSession helper for secure session validation
  event.locals.getSession = async () => {
    // First get session from cookie
    const { data: { session } } = await event.locals.supabase.auth.getSession();
    
    if (!session) {
      return { session: null, user: null };
    }
    
    // Then verify the JWT by getting the user - recommended by Supabase
    const { data: { user }, error } = await event.locals.supabase.auth.getUser();
    
    if (error) {
      // JWT validation failed
      console.warn('JWT validation failed:', error.message);
      return { session: null, user: null };
    }
    
    return { session, user };
  };

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version';
    }
  });
};

const authGuard: Handle = async ({ event, resolve }) => {
    // Get the validated session
    const { session, user } = await event.locals.getSession();
    
    // Identify protected routes by their actual URL paths
    const protectedPaths = ['/dashboard', '/profile', '/signout', '/admin'];
    const isProtectedRoute = protectedPaths.some(path => 
      event.url.pathname === path || event.url.pathname.startsWith(`${path}/`)
    );
    
    // If trying to access protected route without session, redirect to login
    if (isProtectedRoute && !session) {
      // Encode the current URL to redirect back after login
      const redirectTo = encodeURIComponent(event.url.pathname);
      throw redirect(303, `/login?redirectTo=${redirectTo}`);
    }
    
    // If user is logged in and tries to access login, redirect to dashboard
    if (session && event.url.pathname === '/login') {
      throw redirect(303, '/dashboard');
    }
  
    return resolve(event);
  };

export const handle: Handle = sequence(supabaseHandler, authGuard);