-- Migration to alter projects table status check and add optional columns
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;

-- Update status constraint to DRAFT, ACTIVE, ARCHIVED
ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (status IN ('DRAFT', 'ACTIVE', 'ARCHIVED'));

-- Alter default value for status to DRAFT
ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'DRAFT';

-- Update existing records if any mismatch exists (for schema compatibility)
UPDATE projects SET status = 'DRAFT' WHERE status NOT IN ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- Add description and thumbnail_url columns
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description VARCHAR(1000);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(2048);
