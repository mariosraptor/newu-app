/*
  # Add Premium Features and Dopamine Bank System

  ## Overview
  Adds subscription status, dopamine points tracking, and stealth mode preferences
  to support NewU's gamification and monetization strategy.

  ## New Tables
  
  ### `subscription_status`
  - `user_id` (uuid, primary key) - Links to profiles
  - `is_premium` (boolean) - Premium subscription status
  - `subscription_tier` (text) - free, premium
  - `subscribed_at` (timestamptz) - When they subscribed
  - `expires_at` (timestamptz) - When subscription expires
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### `dopamine_points`
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to profiles)
  - `points` (integer) - Points earned/spent
  - `reason` (text) - Why points were awarded
  - `activity_reference` (uuid, nullable) - Link to related activity
  - `created_at` (timestamptz)
  
  ### `user_preferences`
  - `user_id` (uuid, primary key) - Links to profiles
  - `stealth_mode` (boolean) - Privacy mode enabled
  - `app_display_name` (text) - What to show in stealth mode
  - `notification_enabled` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Authenticated access required for all operations
*/

-- Create subscription_status table
CREATE TABLE IF NOT EXISTS subscription_status (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_premium boolean DEFAULT false,
  subscription_tier text NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  subscribed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscription_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscription_status FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own subscription"
  ON subscription_status FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscription_status FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Create dopamine_points table
CREATE TABLE IF NOT EXISTS dopamine_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  points integer NOT NULL,
  reason text NOT NULL,
  activity_reference uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE dopamine_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dopamine points"
  ON dopamine_points FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own dopamine points"
  ON dopamine_points FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  stealth_mode boolean DEFAULT false,
  app_display_name text DEFAULT 'Work Dashboard',
  notification_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dopamine_points_user_id ON dopamine_points(user_id);
CREATE INDEX IF NOT EXISTS idx_dopamine_points_created_at ON dopamine_points(created_at DESC);

-- Create function to calculate total dopamine points for a user
CREATE OR REPLACE FUNCTION get_total_dopamine_points(p_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(SUM(points), 0)::integer
  FROM dopamine_points
  WHERE user_id = p_user_id;
$$;