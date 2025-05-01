// src/routes/login/+page.ts
import type { PageLoad } from './$types';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createBrowserClient } from '@supabase/ssr';

export const load: PageLoad = async ({ parent }) => {
  // Get data from parent layout
  const parentData = await parent();
  
  // Create browser client specifically for this page if needed
  if (!parentData.supabase) {
    console.log("Login page - creating browser client because it wasn't available from parent");
    const supabase = createBrowserClient(
      PUBLIC_SUPABASE_URL,
      PUBLIC_SUPABASE_ANON_KEY
    );
    
    return {
      ...parentData,
      supabase
    };
  }
  
  console.log("Login page - supabase client available from parent");
  return parentData;
};