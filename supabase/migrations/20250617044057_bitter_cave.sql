/*
  # Create competitions system

  1. New Tables
    - `competitions`
      - `id` (uuid, primary key)
      - `title` (text, competition title)
      - `description` (text, competition description)
      - `organizer_id` (uuid, foreign key to profiles)
      - `organization_name` (text, school/institute name)
      - `category` (enum, type of competition)
      - `start_date` (timestamp, competition start)
      - `end_date` (timestamp, competition end)
      - `registration_deadline` (timestamp, last date to register)
      - `max_participants` (integer, maximum participants)
      - `entry_fee` (decimal, competition fee)
      - `prize_pool` (text, prize description)
      - `rules` (text, competition rules)
      - `image_url` (text, competition banner)
      - `location` (text, venue or online)
      - `contact_email` (text, organizer contact)
      - `contact_phone` (text, organizer phone)
      - `is_approved` (boolean, admin approval)
      - `is_featured` (boolean, featured on homepage)
      - `status` (enum, competition status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `competition_participants`
      - `competition_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `team_name` (text, optional team name)
      - `team_members` (jsonb, team member details)
      - `registration_date` (timestamp)
      - `payment_status` (enum, payment status)
      - `submission_url` (text, project submission)
      - `submission_date` (timestamp)
      - `score` (decimal, competition score)
      - `rank` (integer, final ranking)
      - `certificate_url` (text, participation certificate)

    - `competition_judges`
      - `competition_id` (uuid, foreign key)
      - `judge_id` (uuid, foreign key to profiles)
      - `expertise` (text, judge expertise area)
      - `added_at` (timestamp)

  2. Security
    - Enable RLS on all competition tables
    - Add policies for organizers to manage their competitions
    - Add policies for users to participate
    - Add admin policies for approval and moderation

  3. Enums
    - competition_category: 'hackathon', 'coding', 'ai_ml', 'design', 'business', 'research', 'other'
    - competition_status: 'draft', 'open', 'ongoing', 'judging', 'completed', 'cancelled'
    - payment_status: 'pending', 'paid', 'failed', 'refunded'
*/

-- Create competition enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'competition_category') THEN
    CREATE TYPE competition_category AS ENUM ('hackathon', 'coding', 'ai_ml', 'design', 'business', 'research', 'other');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'competition_status') THEN
    CREATE TYPE competition_status AS ENUM ('draft', 'open', 'ongoing', 'judging', 'completed', 'cancelled');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
  END IF;
END$$;

-- Create competitions table
CREATE TABLE IF NOT EXISTS competitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  category competition_category NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  registration_deadline TIMESTAMPTZ NOT NULL,
  max_participants INTEGER,
  entry_fee DECIMAL(10,2) DEFAULT 0,
  prize_pool TEXT,
  rules TEXT,
  image_url TEXT,
  location TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  status competition_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_dates CHECK (start_date < end_date),
  CONSTRAINT valid_registration_deadline CHECK (registration_deadline <= start_date),
  CONSTRAINT valid_entry_fee CHECK (entry_fee >= 0)
);

-- Create competition participants table
CREATE TABLE IF NOT EXISTS competition_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  team_name TEXT,
  team_members JSONB DEFAULT '[]',
  registration_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  payment_status payment_status NOT NULL DEFAULT 'pending',
  submission_url TEXT,
  submission_date TIMESTAMPTZ,
  score DECIMAL(5,2),
  rank INTEGER,
  certificate_url TEXT,
  
  -- Unique constraint to prevent duplicate registrations
  UNIQUE(competition_id, user_id)
);

-- Create competition judges table
CREATE TABLE IF NOT EXISTS competition_judges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  judge_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  expertise TEXT,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Unique constraint to prevent duplicate judge assignments
  UNIQUE(competition_id, judge_id)
);

-- Enable Row Level Security
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_judges ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for competitions

-- Public can view approved competitions
CREATE POLICY "Public can view approved competitions" 
  ON competitions FOR SELECT USING (is_approved = true);

-- Organizers can view their own competitions
CREATE POLICY "Organizers can view own competitions" 
  ON competitions FOR SELECT USING (auth.uid() = organizer_id);

-- Admins can view all competitions
CREATE POLICY "Admins can view all competitions" 
  ON competitions FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Authenticated users can create competitions
CREATE POLICY "Users can create competitions" 
  ON competitions FOR INSERT WITH CHECK (auth.uid() = organizer_id);

-- Organizers can update their own competitions
CREATE POLICY "Organizers can update own competitions" 
  ON competitions FOR UPDATE USING (auth.uid() = organizer_id);

-- Admins can update any competition
CREATE POLICY "Admins can update any competition" 
  ON competitions FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Organizers can delete their own competitions (if no participants)
CREATE POLICY "Organizers can delete own competitions" 
  ON competitions FOR DELETE USING (
    auth.uid() = organizer_id AND 
    NOT EXISTS (SELECT 1 FROM competition_participants WHERE competition_id = id)
  );

-- Admins can delete any competition
CREATE POLICY "Admins can delete any competition" 
  ON competitions FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create RLS Policies for competition_participants

-- Users can view their own participation
CREATE POLICY "Users can view own participation" 
  ON competition_participants FOR SELECT USING (auth.uid() = user_id);

-- Organizers can view participants of their competitions
CREATE POLICY "Organizers can view own competition participants" 
  ON competition_participants FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM competitions c 
      WHERE c.id = competition_id AND c.organizer_id = auth.uid()
    )
  );

-- Judges can view participants of competitions they judge
CREATE POLICY "Judges can view competition participants" 
  ON competition_participants FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM competition_judges cj 
      WHERE cj.competition_id = competition_id AND cj.judge_id = auth.uid()
    )
  );

-- Admins can view all participants
CREATE POLICY "Admins can view all participants" 
  ON competition_participants FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Users can register for competitions
CREATE POLICY "Users can register for competitions" 
  ON competition_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own participation
CREATE POLICY "Users can update own participation" 
  ON competition_participants FOR UPDATE USING (auth.uid() = user_id);

-- Organizers can update participants of their competitions
CREATE POLICY "Organizers can update own competition participants" 
  ON competition_participants FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM competitions c 
      WHERE c.id = competition_id AND c.organizer_id = auth.uid()
    )
  );

-- Judges can update scores and rankings
CREATE POLICY "Judges can update participant scores" 
  ON competition_participants FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM competition_judges cj 
      WHERE cj.competition_id = competition_id AND cj.judge_id = auth.uid()
    )
  );

-- Create RLS Policies for competition_judges

-- Public can view judges of approved competitions
CREATE POLICY "Public can view competition judges" 
  ON competition_judges FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM competitions c 
      WHERE c.id = competition_id AND c.is_approved = true
    )
  );

-- Organizers can manage judges of their competitions
CREATE POLICY "Organizers can manage own competition judges" 
  ON competition_judges FOR ALL USING (
    EXISTS (
      SELECT 1 FROM competitions c 
      WHERE c.id = competition_id AND c.organizer_id = auth.uid()
    )
  );

-- Admins can manage all judges
CREATE POLICY "Admins can manage all judges" 
  ON competition_judges FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create update timestamp triggers
CREATE TRIGGER update_competitions_timestamp
BEFORE UPDATE ON competitions
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_competitions_organizer ON competitions(organizer_id);
CREATE INDEX IF NOT EXISTS idx_competitions_category ON competitions(category);
CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_competitions_dates ON competitions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_competition_participants_competition ON competition_participants(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_participants_user ON competition_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_competition_judges_competition ON competition_judges(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_judges_judge ON competition_judges(judge_id);