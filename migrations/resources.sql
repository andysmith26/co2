-- Migration: Create independent resources system
-- Resources exist independently and can be linked to projects via junction table

-- Create the resources table (independent of projects)
CREATE TABLE resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL CHECK (type IN ('LINK')), -- Extensible for future types
  title VARCHAR(255) NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  
  -- Scoping: resources can be group-specific, student-specific, or global
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE, -- NULL = global resource
  student_id UUID REFERENCES students(id) ON DELETE CASCADE, -- NULL = not student-specific
  
  -- Tracking
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create junction table for project-resource relationships
CREATE TABLE project_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  
  -- Tracking who linked this resource to the project
  linked_by UUID REFERENCES auth.users(id),
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate links
  UNIQUE(project_id, resource_id)
);

-- Create indexes for better performance
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_group_id ON resources(group_id);
CREATE INDEX idx_resources_student_id ON resources(student_id);
CREATE INDEX idx_resources_created_by ON resources(created_by);
CREATE INDEX idx_resources_created_at ON resources(created_at);

CREATE INDEX idx_project_resources_project_id ON project_resources(project_id);
CREATE INDEX idx_project_resources_resource_id ON project_resources(resource_id);
CREATE INDEX idx_project_resources_linked_by ON project_resources(linked_by);

-- Add RLS (Row Level Security) policies for resources table
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view resources they have access to
-- (Global resources, group resources they're in, or student resources they own)
CREATE POLICY "Users can view accessible resources" ON resources
  FOR SELECT
  USING (
    -- Global resources (no group_id or student_id)
    (group_id IS NULL AND student_id IS NULL)
    OR
    -- Group resources where user is a member
    (group_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM group_members gm 
      WHERE gm.group_id = resources.group_id 
      AND gm.user_id = auth.uid()
    ))
    OR
    -- Student resources for students they have access to
    (student_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM students s
      INNER JOIN group_members gm ON s.teacher_id = gm.user_id
      WHERE s.id = resources.student_id
      AND (gm.user_id = auth.uid() OR s.teacher_id = auth.uid())
    ))
  );

-- Policy: Only teachers can insert resources
CREATE POLICY "Teachers can insert resources" ON resources
  FOR INSERT
  WITH CHECK (
    -- User must be a teacher in at least one group
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.user_id = auth.uid()
      AND gm.role = 'teacher'
    )
    AND
    -- If group_id is specified, user must be a teacher in that group
    (group_id IS NULL OR EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = resources.group_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'teacher'
    ))
    AND
    -- If student_id is specified, user must be that student's teacher or in their group
    (student_id IS NULL OR EXISTS (
      SELECT 1 FROM students s
      INNER JOIN group_members gm ON s.teacher_id = gm.user_id
      WHERE s.id = resources.student_id
      AND (gm.user_id = auth.uid() OR s.teacher_id = auth.uid())
      AND gm.role = 'teacher'
    ))
  );

-- Policy: Only teachers can update resources
CREATE POLICY "Teachers can update resources" ON resources
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.user_id = auth.uid()
      AND gm.role = 'teacher'
    )
    AND
    -- Additional checks for group/student specific resources
    (group_id IS NULL OR EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = resources.group_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'teacher'
    ))
  );

-- Policy: Only teachers can delete resources
CREATE POLICY "Teachers can delete resources" ON resources
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.user_id = auth.uid()
      AND gm.role = 'teacher'
    )
    AND
    (group_id IS NULL OR EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = resources.group_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'teacher'
    ))
  );

-- Add RLS policies for project_resources junction table
ALTER TABLE project_resources ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view project-resource links for projects they have access to
CREATE POLICY "Users can view project resource links" ON project_resources
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      INNER JOIN group_members gm ON p.group_id = gm.group_id
      WHERE p.id = project_resources.project_id
      AND gm.user_id = auth.uid()
    )
  );

-- Policy: Only teachers can link/unlink resources to projects
CREATE POLICY "Teachers can manage project resource links" ON project_resources
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      INNER JOIN group_members gm ON p.group_id = gm.group_id
      WHERE p.id = project_resources.project_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'teacher'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      INNER JOIN group_members gm ON p.group_id = gm.group_id
      WHERE p.id = project_resources.project_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'teacher'
    )
  );

-- Create functions to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_resources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on resources
CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_resources_updated_at();