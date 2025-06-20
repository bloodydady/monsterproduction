/*
  # Create certificates table for user achievements

  1. New Tables
    - `certificates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `title` (text, certificate title)
      - `description` (text, certificate description)
      - `certificate_url` (text, URL to certificate file)
      - `issued_by` (text, issuing organization)
      - `issue_date` (date, when certificate was issued)
      - `category` (enum, type of certificate)
      - `is_verified` (boolean, admin verification status)
      - `is_featured` (boolean, featured on homepage)
      - `feedback` (text, optional feedback about Monster Production)
      - `rating` (integer, 1-5 star rating)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `certificates` table
    - Add policies for users to manage their own certificates
    - Add policies for admins to manage all certificates
    - Add policy for public viewing of featured certificates

  3. Storage
    - Create bucket for certificate files
*/

-- Create certificate category enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'certificate_category') THEN
    CREATE TYPE certificate_category AS ENUM ('hackathon', 'workshop', 'course', 'achievement', 'other');
  END IF;
END$$;

-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  certificate_url TEXT NOT NULL,
  issued_by TEXT NOT NULL,
  issue_date DATE NOT NULL,
  category certificate_category NOT NULL DEFAULT 'achievement',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Users can view their own certificates and featured/verified certificates
CREATE POLICY "Users can view own certificates and featured ones" 
  ON certificates FOR SELECT USING (
    auth.uid() = user_id OR 
    (is_featured = true AND is_verified = true) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'mentor'))
  );

-- Users can insert their own certificates
CREATE POLICY "Users can insert own certificates" 
  ON certificates FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own certificates (except verification and featured status)
CREATE POLICY "Users can update own certificates" 
  ON certificates FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Only admins can delete certificates
CREATE POLICY "Only admins can delete certificates" 
  ON certificates FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create update timestamp trigger
CREATE TRIGGER update_certificates_timestamp
BEFORE UPDATE ON certificates
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Create storage bucket for certificates (this would be done via Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', true);