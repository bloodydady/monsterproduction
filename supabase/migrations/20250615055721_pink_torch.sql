/*
  # Enable user project uploads

  1. Schema Changes
    - Add user_id column to projects table
    - Add is_featured column for admin curation
    - Add is_approved column for moderation

  2. Security
    - Update RLS policies to allow users to manage their own projects
    - Add policies for public viewing of approved projects
    - Maintain admin control over featuring and approval

  3. Changes
    - Users can now create, edit, and delete their own projects
    - Admins can approve/disapprove and feature projects
    - Public can view approved projects
*/

-- Add new columns to projects table
DO $$
BEGIN
  -- Add user_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE projects ADD COLUMN user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;

  -- Add is_approved column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'is_approved'
  ) THEN
    ALTER TABLE projects ADD COLUMN is_approved BOOLEAN NOT NULL DEFAULT false;
  END IF;

  -- Add is_featured column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE projects ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- Update existing projects to be approved (for backward compatibility)
UPDATE projects SET is_approved = true WHERE is_approved IS NULL OR is_approved = false;

-- Drop existing policies
DROP POLICY IF EXISTS "Projects are viewable by everyone" ON projects;
DROP POLICY IF EXISTS "Only admins can insert projects" ON projects;
DROP POLICY IF EXISTS "Only admins can update projects" ON projects;
DROP POLICY IF EXISTS "Only admins can delete projects" ON projects;

-- Create new RLS policies

-- Public can view approved projects
CREATE POLICY "Public can view approved projects" 
  ON projects FOR SELECT USING (is_approved = true);

-- Users can view their own projects (regardless of approval status)
CREATE POLICY "Users can view own projects" 
  ON projects FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all projects
CREATE POLICY "Admins can view all projects" 
  ON projects FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Authenticated users can insert their own projects
CREATE POLICY "Users can insert own projects" 
  ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
CREATE POLICY "Users can update own projects" 
  ON projects FOR UPDATE USING (auth.uid() = user_id);

-- Admins can update any project (for approval/featuring)
CREATE POLICY "Admins can update any project" 
  ON projects FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Users can delete their own projects
CREATE POLICY "Users can delete own projects" 
  ON projects FOR DELETE USING (auth.uid() = user_id);

-- Admins can delete any project
CREATE POLICY "Admins can delete any project" 
  ON projects FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );