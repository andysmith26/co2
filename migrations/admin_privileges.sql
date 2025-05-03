-- migrations/admin_privileges.sql
-- SQL script to grant admin privileges to a user
-- Run this in the Supabase SQL editor

-- RECOMMENDED METHOD: Update raw_app_meta_data to set admin flag
-- This is the most reliable method as it directly modifies the metadata
UPDATE auth.users 
SET raw_app_meta_data = raw_app_meta_data || '{"admin":true}'::jsonb 
WHERE email = 'your-admin-email@example.com';

-- To find users and their current metadata (helpful for debugging)
SELECT id, email, raw_app_meta_data
FROM auth.users
WHERE email = 'your-admin-email@example.com';

-- Verify admin users
SELECT id, email, raw_app_meta_data
FROM auth.users
WHERE raw_app_meta_data->>'admin' = 'true';

-- To revoke admin privileges
/*
UPDATE auth.users 
SET raw_app_meta_data = raw_app_meta_data - 'admin'
WHERE email = 'your-admin-email@example.com';
*/

-- TROUBLESHOOTING: If the above doesn't work, try this alternative approach
-- Some Supabase configurations might require this structure instead
/*
UPDATE auth.users 
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{app_metadata}',
  jsonb_set(
    COALESCE(raw_app_meta_data->'app_metadata', '{}'::jsonb),
    '{admin}',
    'true'::jsonb
  )
)
WHERE email = 'your-admin-email@example.com';
*/