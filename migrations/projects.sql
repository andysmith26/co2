-- database/migrations/projects_schema.sql

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  group_id UUID NOT NULL REFERENCES public.groups(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security for projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policies for projects
-- Teachers can see all projects for groups they belong to
CREATE POLICY projects_select_policy ON public.projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE 
        group_members.group_id = projects.group_id AND
        group_members.user_id = auth.uid() AND
        group_members.role = 'teacher'
    )
  );

-- Only teachers can insert projects
CREATE POLICY projects_insert_policy ON public.projects
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE 
        group_members.group_id = projects.group_id AND
        group_members.user_id = auth.uid() AND
        group_members.role = 'teacher'
    )
  );

-- Only the creator or teachers in the group can update projects
CREATE POLICY projects_update_policy ON public.projects
  FOR UPDATE
  USING (
    projects.created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE 
        group_members.group_id = projects.group_id AND
        group_members.user_id = auth.uid() AND
        group_members.role = 'teacher'
    )
  );

-- Only the creator or teachers in the group can delete projects
CREATE POLICY projects_delete_policy ON public.projects
  FOR DELETE
  USING (
    projects.created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE 
        group_members.group_id = projects.group_id AND
        group_members.user_id = auth.uid() AND
        group_members.role = 'teacher'
    )
  );

-- Create an index on group_id for faster queries
CREATE INDEX IF NOT EXISTS projects_group_id_idx ON public.projects(group_id);

-- Project Tasks table
CREATE TABLE IF NOT EXISTS public.project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  assignee_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security for project_tasks
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

-- Policies for project_tasks
-- Teachers can see all tasks for projects in groups they belong to
CREATE POLICY tasks_select_policy ON public.project_tasks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.group_members ON group_members.group_id = projects.group_id
      WHERE 
        project_tasks.project_id = projects.id AND
        group_members.user_id = auth.uid()
    )
  );

-- Only teachers can insert tasks
CREATE POLICY tasks_insert_policy ON public.project_tasks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.group_members ON group_members.group_id = projects.group_id
      WHERE 
        project_tasks.project_id = projects.id AND
        group_members.user_id = auth.uid() AND
        group_members.role = 'teacher'
    )
  );

-- Only teachers in the group can update tasks
CREATE POLICY tasks_update_policy ON public.project_tasks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.group_members ON group_members.group_id = projects.group_id
      WHERE 
        project_tasks.project_id = projects.id AND
        group_members.user_id = auth.uid() AND
        group_members.role = 'teacher'
    )
  );

-- Only teachers in the group can delete tasks
CREATE POLICY tasks_delete_policy ON public.project_tasks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.group_members ON group_members.group_id = projects.group_id
      WHERE 
        project_tasks.project_id = projects.id AND
        group_members.user_id = auth.uid() AND
        group_members.role = 'teacher'
    )
  );

-- Create an index on project_id for faster queries
CREATE INDEX IF NOT EXISTS project_tasks_project_id_idx ON public.project_tasks(project_id);
-- Create an index on assignee_id for faster queries
CREATE INDEX IF NOT EXISTS project_tasks_assignee_id_idx ON public.project_tasks(assignee_id);

-- Add triggers to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER project_tasks_updated_at
BEFORE UPDATE ON public.project_tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
