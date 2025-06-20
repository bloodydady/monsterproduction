/*
  # Monster Production Database Schema

  1. New Tables
    - `profiles` - User profiles with role-based access control
    - `categories` - Categories for AI tools
    - `ai_tools` - AI tools with categorization
    - `requests` - User requests for mentorship, hackathon help, etc.
    - `workshops` - Workshop and event management
    - `messages` - Chat messages between users and admins/mentors
    - `newsletters` - Newsletter subscriptions
    - `testimonials` - User success stories

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add admin-specific policies
    - Add mentor-specific policies

  3. Storage
    - Create buckets for profile avatars and tool images
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'mentor', 'user');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_type') THEN
    CREATE TYPE request_type AS ENUM ('mentorship', 'hackathon', 'workshop', 'business', 'other');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
    CREATE TYPE request_status AS ENUM ('new', 'in_progress', 'completed', 'cancelled');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workshop_status') THEN
    CREATE TYPE workshop_status AS ENUM ('scheduled', 'completed', 'cancelled');
  END IF;
END$$;

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'user',
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Categories table for AI tools
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Tools table
CREATE TABLE IF NOT EXISTS ai_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  url TEXT,
  image_url TEXT,
  how_to_use TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Requests table
CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  request_type request_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status request_status NOT NULL DEFAULT 'new',
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  tool_id UUID REFERENCES ai_tools(id) ON DELETE SET NULL,
  private_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workshops table
CREATE TABLE IF NOT EXISTS workshops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  location TEXT,
  online_link TEXT,
  max_participants INTEGER,
  status workshop_status NOT NULL DEFAULT 'scheduled',
  organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workshop participants junction table
CREATE TABLE IF NOT EXISTS workshop_participants (
  workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  attended BOOLEAN DEFAULT false,
  feedback TEXT,
  PRIMARY KEY (workshop_id, user_id)
);

-- Messages table for chat
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Newsletter subscriptions
CREATE TABLE IF NOT EXISTS newsletters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create storage buckets
-- NOTE: This is a placeholder, as Supabase storage bucket creation is typically done via API or Console
-- You'll need to create these buckets in the Supabase dashboard
-- Profile avatars bucket
-- INSERT INTO storage.buckets (id, name) VALUES ('avatars', 'avatars');
-- AI tool images bucket 
-- INSERT INTO storage.buckets (id, name) VALUES ('tool-images', 'tool-images');

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Categories policies
CREATE POLICY "Categories are viewable by everyone" 
  ON categories FOR SELECT USING (true);

CREATE POLICY "Only admins can insert categories" 
  ON categories FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can update categories" 
  ON categories FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can delete categories" 
  ON categories FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- AI Tools policies
CREATE POLICY "AI Tools are viewable by everyone" 
  ON ai_tools FOR SELECT USING (true);

CREATE POLICY "Only admins and mentors can insert AI tools" 
  ON ai_tools FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'mentor'))
  );

CREATE POLICY "Only admins and mentors can update AI tools" 
  ON ai_tools FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'mentor'))
  );

CREATE POLICY "Only admins can delete AI tools" 
  ON ai_tools FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Requests policies
CREATE POLICY "Authenticated users can view their own requests" 
  ON requests FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() = assigned_to OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'mentor'))
  );

CREATE POLICY "Authenticated users can insert requests" 
  ON requests FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests" 
  ON requests FOR UPDATE USING (
    auth.uid() = user_id OR
    auth.uid() = assigned_to OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'mentor'))
  );

-- Workshops policies
CREATE POLICY "Workshops are viewable by everyone" 
  ON workshops FOR SELECT USING (true);

CREATE POLICY "Only admins and mentors can insert workshops" 
  ON workshops FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'mentor'))
  );

CREATE POLICY "Only admins, mentors, and organizers can update workshops" 
  ON workshops FOR UPDATE USING (
    auth.uid() = organizer_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'mentor'))
  );

-- Workshop participants policies
CREATE POLICY "Users can view workshops they're participating in" 
  ON workshop_participants FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM workshops w 
      WHERE w.id = workshop_id AND w.organizer_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'mentor')
    )
  );

CREATE POLICY "Authenticated users can register for workshops" 
  ON workshop_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only organizers, admins, and mentors can update workshop participants" 
  ON workshop_participants FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workshops w 
      WHERE w.id = workshop_id AND w.organizer_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'mentor')
    )
  );

-- Messages policies
CREATE POLICY "Users can view messages they're involved in" 
  ON messages FOR SELECT USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id OR
    EXISTS (
      SELECT 1 FROM requests r
      WHERE r.id = request_id AND (r.user_id = auth.uid() OR r.assigned_to = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can send messages" 
  ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they sent" 
  ON messages FOR UPDATE USING (auth.uid() = sender_id);

-- Newsletter policies
CREATE POLICY "Admins can view all newsletter subscriptions" 
  ON newsletters FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Anyone can subscribe to the newsletter" 
  ON newsletters FOR INSERT WITH CHECK (true);

-- Testimonials policies
CREATE POLICY "Testimonials are viewable by everyone" 
  ON testimonials FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create testimonials" 
  ON testimonials FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own testimonials" 
  ON testimonials FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can delete testimonials" 
  ON testimonials FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create database functions

-- Function to handle user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email,
    NULL,
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create update timestamp triggers for all tables with updated_at
CREATE TRIGGER update_profiles_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_categories_timestamp
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_ai_tools_timestamp
BEFORE UPDATE ON ai_tools
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_requests_timestamp
BEFORE UPDATE ON requests
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_workshops_timestamp
BEFORE UPDATE ON workshops
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_testimonials_timestamp
BEFORE UPDATE ON testimonials
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Insert initial data for categories
INSERT INTO categories (name, description, slug, icon)
VALUES 
  ('Hackathons', 'AI tools specifically designed for hackathon success', 'hackathons', 'trophy'),
  ('Business Growth', 'AI tools to help expand and optimize your business', 'business-growth', 'trending-up'),
  ('Learning AI', 'Resources and tools to help you master artificial intelligence', 'learning-ai', 'book-open'),
  ('Workshop Management', 'Tools to organize and run effective workshops', 'workshop-management', 'users');

-- Insert a default admin account
-- Note: In production, you'd want to create this through the auth system
-- This is just for demonstration purposes
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
-- VALUES (
--   'c0b0dd66-2ffe-4e44-8c79-48b5a825c9b1',
--   'admin@monster-production.com',
--   '[hashed_password_here]',
--   now(),
--   '{"first_name": "Admin", "last_name": "User"}'
-- );

-- INSERT INTO profiles (id, first_name, last_name, email, role)
-- VALUES (
--   'c0b0dd66-2ffe-4e44-8c79-48b5a825c9b1',
--   'Admin',
--   'User',
--   'admin@monster-production.com',
--   'admin'
-- );