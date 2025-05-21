-- Add student_assignee_id and assignee_type columns to project_tasks table
ALTER TABLE project_tasks
ADD COLUMN student_assignee_id UUID REFERENCES students(id),
ADD COLUMN assignee_type TEXT CHECK (assignee_type IN ('teacher', 'student'));

-- Update existing tasks with assignee_id to have the correct assignee_type
UPDATE project_tasks
SET assignee_type = 'teacher'
WHERE assignee_id IS NOT NULL AND assignee_type IS NULL;

-- Add comment to the new columns
COMMENT ON COLUMN project_tasks.student_assignee_id IS 'Reference to a student that can be assigned to this task';
COMMENT ON COLUMN project_tasks.assignee_type IS 'Type of assignee - either teacher or student';

-- Add appropriate indexes
CREATE INDEX idx_project_tasks_student_assignee ON project_tasks(student_assignee_id);
CREATE INDEX idx_project_tasks_assignee_type ON project_tasks(assignee_type);
