-- Migration: Add groups and group_members tables
-- Description: Creates tables for managing groups and their members

-- Create groups table
CREATE TABLE public.groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add RLS policies for the groups table
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Teachers can create, read, update, and delete their own groups
CREATE POLICY "Teachers can manage their own groups" 
    ON public.groups
    USING (created_by = auth.uid());

-- Create group_members junction table to track students and teachers in groups
CREATE TABLE public.group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher')), -- Role in the group (student or teacher)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id) -- Prevent duplicate memberships
);

-- Add RLS policies for the group_members table
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Teachers can manage group members for groups they created
CREATE POLICY "Teachers can manage group members" 
    ON public.group_members
    USING (
        group_id IN (
            SELECT id FROM public.groups WHERE created_by = auth.uid()
        )
    );

-- Create an index on group_id for faster lookups
CREATE INDEX group_members_group_id_idx ON public.group_members(group_id);