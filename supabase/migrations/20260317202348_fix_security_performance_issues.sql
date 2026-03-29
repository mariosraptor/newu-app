/*
  # Fix Security and Performance Issues

  ## Changes Made

  ### 1. Add Missing Foreign Key Indexes
  Creating indexes on all foreign key columns to improve query performance:
  - `journal_entries.journey_id`
  - `milestones.journey_id`
  - `selfie_records.journey_id`
  - `selfie_records.user_id`
  - `trigger_logs.trigger_id`
  - `trigger_logs.user_id`
  - `triggers.journey_id`

  ### 2. Optimize RLS Policies for Performance
  Updating all RLS policies to use `(select auth.uid())` instead of `auth.uid()` 
  to prevent re-evaluation for each row. This significantly improves query performance at scale.

  Affected tables:
  - profiles (3 policies)
  - journeys (4 policies)
  - triggers (4 policies)
  - trigger_logs (4 policies)
  - activities (4 policies)
  - bucket_items (4 policies)
  - milestones (3 policies)
  - daily_checkins (3 policies)
  - journal_entries (4 policies)
  - selfie_records (3 policies)

  ### 3. Security Notes
  - All policies maintain the same security guarantees
  - Only performance optimization, no security model changes
  - Users can still only access their own data
*/

-- ============================================================================
-- STEP 1: Add Missing Foreign Key Indexes
-- ============================================================================

-- Index for journal_entries.journey_id foreign key
CREATE INDEX IF NOT EXISTS idx_journal_entries_journey_id 
  ON public.journal_entries(journey_id);

-- Index for milestones.journey_id foreign key
CREATE INDEX IF NOT EXISTS idx_milestones_journey_id 
  ON public.milestones(journey_id);

-- Index for selfie_records.journey_id foreign key
CREATE INDEX IF NOT EXISTS idx_selfie_records_journey_id 
  ON public.selfie_records(journey_id);

-- Index for selfie_records.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_selfie_records_user_id 
  ON public.selfie_records(user_id);

-- Index for trigger_logs.trigger_id foreign key
CREATE INDEX IF NOT EXISTS idx_trigger_logs_trigger_id 
  ON public.trigger_logs(trigger_id);

-- Index for trigger_logs.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_trigger_logs_user_id 
  ON public.trigger_logs(user_id);

-- Index for triggers.journey_id foreign key
CREATE INDEX IF NOT EXISTS idx_triggers_journey_id 
  ON public.triggers(journey_id);

-- ============================================================================
-- STEP 2: Optimize RLS Policies - Drop Old Policies
-- ============================================================================

-- Drop existing policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Drop existing policies for journeys
DROP POLICY IF EXISTS "Users can view own journeys" ON public.journeys;
DROP POLICY IF EXISTS "Users can insert own journeys" ON public.journeys;
DROP POLICY IF EXISTS "Users can update own journeys" ON public.journeys;
DROP POLICY IF EXISTS "Users can delete own journeys" ON public.journeys;

-- Drop existing policies for triggers
DROP POLICY IF EXISTS "Users can view own triggers" ON public.triggers;
DROP POLICY IF EXISTS "Users can insert own triggers" ON public.triggers;
DROP POLICY IF EXISTS "Users can update own triggers" ON public.triggers;
DROP POLICY IF EXISTS "Users can delete own triggers" ON public.triggers;

-- Drop existing policies for trigger_logs
DROP POLICY IF EXISTS "Users can view own trigger logs" ON public.trigger_logs;
DROP POLICY IF EXISTS "Users can insert own trigger logs" ON public.trigger_logs;
DROP POLICY IF EXISTS "Users can update own trigger logs" ON public.trigger_logs;
DROP POLICY IF EXISTS "Users can delete own trigger logs" ON public.trigger_logs;

-- Drop existing policies for activities
DROP POLICY IF EXISTS "Users can view own activities" ON public.activities;
DROP POLICY IF EXISTS "Users can insert own activities" ON public.activities;
DROP POLICY IF EXISTS "Users can update own activities" ON public.activities;
DROP POLICY IF EXISTS "Users can delete own activities" ON public.activities;

-- Drop existing policies for bucket_items
DROP POLICY IF EXISTS "Users can view own bucket items" ON public.bucket_items;
DROP POLICY IF EXISTS "Users can insert own bucket items" ON public.bucket_items;
DROP POLICY IF EXISTS "Users can update own bucket items" ON public.bucket_items;
DROP POLICY IF EXISTS "Users can delete own bucket items" ON public.bucket_items;

-- Drop existing policies for milestones
DROP POLICY IF EXISTS "Users can view own milestones" ON public.milestones;
DROP POLICY IF EXISTS "Users can insert own milestones" ON public.milestones;
DROP POLICY IF EXISTS "Users can update own milestones" ON public.milestones;

-- Drop existing policies for daily_checkins
DROP POLICY IF EXISTS "Users can view own checkins" ON public.daily_checkins;
DROP POLICY IF EXISTS "Users can insert own checkins" ON public.daily_checkins;
DROP POLICY IF EXISTS "Users can update own checkins" ON public.daily_checkins;

-- Drop existing policies for journal_entries
DROP POLICY IF EXISTS "Users can view own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can insert own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can update own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can delete own journal entries" ON public.journal_entries;

-- Drop existing policies for selfie_records
DROP POLICY IF EXISTS "Users can view own selfies" ON public.selfie_records;
DROP POLICY IF EXISTS "Users can insert own selfies" ON public.selfie_records;
DROP POLICY IF EXISTS "Users can delete own selfies" ON public.selfie_records;

-- ============================================================================
-- STEP 3: Create Optimized RLS Policies
-- ============================================================================

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Journeys policies
CREATE POLICY "Users can view own journeys"
  ON public.journeys FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own journeys"
  ON public.journeys FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own journeys"
  ON public.journeys FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own journeys"
  ON public.journeys FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Triggers policies
CREATE POLICY "Users can view own triggers"
  ON public.triggers FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = (
      SELECT user_id FROM public.journeys 
      WHERE journeys.id = triggers.journey_id
    )
  );

CREATE POLICY "Users can insert own triggers"
  ON public.triggers FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.uid()) = (
      SELECT user_id FROM public.journeys 
      WHERE journeys.id = triggers.journey_id
    )
  );

CREATE POLICY "Users can update own triggers"
  ON public.triggers FOR UPDATE
  TO authenticated
  USING (
    (select auth.uid()) = (
      SELECT user_id FROM public.journeys 
      WHERE journeys.id = triggers.journey_id
    )
  )
  WITH CHECK (
    (select auth.uid()) = (
      SELECT user_id FROM public.journeys 
      WHERE journeys.id = triggers.journey_id
    )
  );

CREATE POLICY "Users can delete own triggers"
  ON public.triggers FOR DELETE
  TO authenticated
  USING (
    (select auth.uid()) = (
      SELECT user_id FROM public.journeys 
      WHERE journeys.id = triggers.journey_id
    )
  );

-- Trigger logs policies
CREATE POLICY "Users can view own trigger logs"
  ON public.trigger_logs FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own trigger logs"
  ON public.trigger_logs FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own trigger logs"
  ON public.trigger_logs FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own trigger logs"
  ON public.trigger_logs FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Activities policies
CREATE POLICY "Users can view own activities"
  ON public.activities FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own activities"
  ON public.activities FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own activities"
  ON public.activities FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own activities"
  ON public.activities FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Bucket items policies
CREATE POLICY "Users can view own bucket items"
  ON public.bucket_items FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own bucket items"
  ON public.bucket_items FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own bucket items"
  ON public.bucket_items FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own bucket items"
  ON public.bucket_items FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Milestones policies
CREATE POLICY "Users can view own milestones"
  ON public.milestones FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = (
      SELECT user_id FROM public.journeys 
      WHERE journeys.id = milestones.journey_id
    )
  );

CREATE POLICY "Users can insert own milestones"
  ON public.milestones FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.uid()) = (
      SELECT user_id FROM public.journeys 
      WHERE journeys.id = milestones.journey_id
    )
  );

CREATE POLICY "Users can update own milestones"
  ON public.milestones FOR UPDATE
  TO authenticated
  USING (
    (select auth.uid()) = (
      SELECT user_id FROM public.journeys 
      WHERE journeys.id = milestones.journey_id
    )
  )
  WITH CHECK (
    (select auth.uid()) = (
      SELECT user_id FROM public.journeys 
      WHERE journeys.id = milestones.journey_id
    )
  );

-- Daily checkins policies
CREATE POLICY "Users can view own checkins"
  ON public.daily_checkins FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own checkins"
  ON public.daily_checkins FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own checkins"
  ON public.daily_checkins FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Journal entries policies
CREATE POLICY "Users can view own journal entries"
  ON public.journal_entries FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = (
      SELECT user_id FROM public.journeys 
      WHERE journeys.id = journal_entries.journey_id
    )
  );

CREATE POLICY "Users can insert own journal entries"
  ON public.journal_entries FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.uid()) = (
      SELECT user_id FROM public.journeys 
      WHERE journeys.id = journal_entries.journey_id
    )
  );

CREATE POLICY "Users can update own journal entries"
  ON public.journal_entries FOR UPDATE
  TO authenticated
  USING (
    (select auth.uid()) = (
      SELECT user_id FROM public.journeys 
      WHERE journeys.id = journal_entries.journey_id
    )
  )
  WITH CHECK (
    (select auth.uid()) = (
      SELECT user_id FROM public.journeys 
      WHERE journeys.id = journal_entries.journey_id
    )
  );

CREATE POLICY "Users can delete own journal entries"
  ON public.journal_entries FOR DELETE
  TO authenticated
  USING (
    (select auth.uid()) = (
      SELECT user_id FROM public.journeys 
      WHERE journeys.id = journal_entries.journey_id
    )
  );

-- Selfie records policies
CREATE POLICY "Users can view own selfies"
  ON public.selfie_records FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own selfies"
  ON public.selfie_records FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own selfies"
  ON public.selfie_records FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);