/*
  # NewU - Identity Transformation Platform Schema

  ## Overview
  Complete database schema for NewU addiction recovery app supporting
  smoking, vaping, snus, and alcohol tracking with identity-based transformation approach.

  ## New Tables
  
  ### `profiles`
  - `id` (uuid, primary key) - Links to auth.users
  - `display_name` (text) - User's chosen name
  - `avatar_url` (text, nullable) - Profile picture
  - `emergency_contact` (text, nullable) - Trusted person to call
  - `created_at` (timestamptz) - Account creation
  - `updated_at` (timestamptz) - Last profile update
  
  ### `journeys`
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to profiles)
  - `addiction_type` (text) - smoking, vaping, snus, alcohol
  - `quit_datetime` (timestamptz) - When they quit
  - `daily_cost` (numeric) - Daily spend on habit
  - `currency` (text) - USD, EUR, GBP, etc.
  - `my_why` (text) - Their vision and reason
  - `is_active` (boolean) - Current journey status
  - `created_at` (timestamptz)
  
  ### `triggers`
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to profiles)
  - `journey_id` (uuid, foreign key to journeys)
  - `category` (text) - emotional, situational, social
  - `name` (text) - Trigger name
  - `is_custom` (boolean) - User-created vs preset
  - `activation_count` (integer) - How many times triggered
  - `resistance_count` (integer) - How many times resisted
  - `created_at` (timestamptz)
  
  ### `trigger_logs`
  - `id` (uuid, primary key)
  - `trigger_id` (uuid, foreign key to triggers)
  - `user_id` (uuid, foreign key to profiles)
  - `was_resisted` (boolean) - Did they resist the craving
  - `strategy_used` (text, nullable) - What helped
  - `body_sensation` (text, nullable) - Physical feelings
  - `notes` (text, nullable) - Reflection notes
  - `created_at` (timestamptz)
  
  ### `activities`
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to profiles)
  - `activity_type` (text) - gym, walking, meditation, etc.
  - `activity_name` (text) - Display name
  - `duration_minutes` (integer, nullable)
  - `notes` (text, nullable)
  - `vitality_points` (integer) - Points earned
  - `logged_at` (timestamptz)
  
  ### `bucket_items`
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to profiles)
  - `title` (text) - Dream/goal title
  - `description` (text, nullable)
  - `cost` (numeric) - Target cost
  - `currency` (text)
  - `is_achieved` (boolean)
  - `achieved_at` (timestamptz, nullable)
  - `created_at` (timestamptz)
  
  ### `milestones`
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to profiles)
  - `journey_id` (uuid, foreign key to journeys)
  - `milestone_type` (text) - day_1, day_3, week_1, etc.
  - `days_count` (integer) - Number of days achieved
  - `achieved_at` (timestamptz)
  - `celebrated` (boolean) - Has user seen celebration
  
  ### `daily_checkins`
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to profiles)
  - `mood` (text) - strong, good, struggling, need_help
  - `notes` (text, nullable)
  - `checkin_date` (date)
  - `created_at` (timestamptz)
  
  ### `journal_entries`
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to profiles)
  - `journey_id` (uuid, foreign key to journeys)
  - `entry_type` (text) - trigger_journal, general, identity_statement
  - `content` (text)
  - `created_at` (timestamptz)

  ### `selfie_records`
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to profiles)
  - `journey_id` (uuid, foreign key to journeys)
  - `day_number` (integer) - Day of journey
  - `image_data` (text) - Base64 encoded image
  - `analysis_notes` (text, nullable) - AI analysis of improvements
  - `taken_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Authenticated access required for all operations
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  avatar_url text,
  emergency_contact text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create journeys table
CREATE TABLE IF NOT EXISTS journeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  addiction_type text NOT NULL CHECK (addiction_type IN ('smoking', 'vaping', 'snus', 'alcohol')),
  quit_datetime timestamptz NOT NULL,
  daily_cost numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  my_why text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE journeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journeys"
  ON journeys FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journeys"
  ON journeys FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journeys"
  ON journeys FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own journeys"
  ON journeys FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create triggers table
CREATE TABLE IF NOT EXISTS triggers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  journey_id uuid REFERENCES journeys(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('emotional', 'situational', 'social')),
  name text NOT NULL,
  is_custom boolean DEFAULT false,
  activation_count integer DEFAULT 0,
  resistance_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE triggers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own triggers"
  ON triggers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own triggers"
  ON triggers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own triggers"
  ON triggers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own triggers"
  ON triggers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger_logs table
CREATE TABLE IF NOT EXISTS trigger_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_id uuid REFERENCES triggers(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  was_resisted boolean NOT NULL,
  strategy_used text,
  body_sensation text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trigger_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trigger logs"
  ON trigger_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trigger logs"
  ON trigger_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trigger logs"
  ON trigger_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trigger logs"
  ON trigger_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  activity_type text NOT NULL,
  activity_name text NOT NULL,
  duration_minutes integer,
  notes text,
  vitality_points integer DEFAULT 10,
  logged_at timestamptz DEFAULT now()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities"
  ON activities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities"
  ON activities FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities"
  ON activities FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create bucket_items table
CREATE TABLE IF NOT EXISTS bucket_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  cost numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  is_achieved boolean DEFAULT false,
  achieved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bucket_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bucket items"
  ON bucket_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bucket items"
  ON bucket_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bucket items"
  ON bucket_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bucket items"
  ON bucket_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create milestones table
CREATE TABLE IF NOT EXISTS milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  journey_id uuid REFERENCES journeys(id) ON DELETE CASCADE NOT NULL,
  milestone_type text NOT NULL,
  days_count integer NOT NULL,
  achieved_at timestamptz DEFAULT now(),
  celebrated boolean DEFAULT false
);

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own milestones"
  ON milestones FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones"
  ON milestones FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones"
  ON milestones FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create daily_checkins table
CREATE TABLE IF NOT EXISTS daily_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mood text NOT NULL CHECK (mood IN ('strong', 'good', 'struggling', 'need_help')),
  notes text,
  checkin_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, checkin_date)
);

ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checkins"
  ON daily_checkins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkins"
  ON daily_checkins FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkins"
  ON daily_checkins FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  journey_id uuid REFERENCES journeys(id) ON DELETE CASCADE,
  entry_type text NOT NULL CHECK (entry_type IN ('trigger_journal', 'general', 'identity_statement')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journal entries"
  ON journal_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries"
  ON journal_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
  ON journal_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
  ON journal_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create selfie_records table
CREATE TABLE IF NOT EXISTS selfie_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  journey_id uuid REFERENCES journeys(id) ON DELETE CASCADE,
  day_number integer NOT NULL,
  image_data text NOT NULL,
  analysis_notes text,
  taken_at timestamptz DEFAULT now()
);

ALTER TABLE selfie_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own selfies"
  ON selfie_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own selfies"
  ON selfie_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own selfies"
  ON selfie_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_journeys_user_id ON journeys(user_id);
CREATE INDEX IF NOT EXISTS idx_triggers_user_id ON triggers(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_bucket_items_user_id ON bucket_items(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_user_id ON milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_id ON daily_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);