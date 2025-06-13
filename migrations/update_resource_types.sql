-- Migration: Add IMAGE type support to resources table
-- This extends the existing type constraint to support image uploads

-- Remove the old constraint
ALTER TABLE resources DROP CONSTRAINT resources_type_check;

-- Add the new constraint with IMAGE support
ALTER TABLE resources ADD CONSTRAINT resources_type_check CHECK (type IN ('LINK', 'IMAGE'));