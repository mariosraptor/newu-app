/*
  # Fix RLS: Enable Row Level Security on ALL tables

  ## Problem
  Tables in the public schema are accessible without authentication.
  Previous migrations were never applied to the live database.

  ## What this migration does
  1. Enables RLS on every table in the public schema
  2. Drops any existing policies (idempotent — safe to re-run)
  3. Recreates correct policies restricting ALL access to the owning user only
  4. Fixes bugs in previous migration: triggers/milestones/journal_entries
     incorrectly used a nullable journey_id join instead of the direct user_id column
  5. Locks down the anon role — no table access whatsoever
  6. Secures the dopamine points function against search_path injection

  ## Policy pattern
  All policies use `(select auth.uid())` (evaluated once per query, not per row)
  and are scoped to the `authenticated` role only. The `anon` role gets no policies.
*/

-- ============================================================================
-- STEP 1: Enable RLS on every table (safe to run even if already enabled)
-- ============================================================================

ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journeys            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.triggers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trigger_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bucket_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checkins      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selfie_records      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dopamine_points     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences    ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: Drop ALL existing policies so we can recreate them cleanly
-- ============================================================================

-- profiles
DROP POLICY IF EXISTS "Users can view own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- journeys
DROP POLICY IF EXISTS "Users can view own journeys"   ON public.journeys;
DROP POLICY IF EXISTS "Users can insert own journeys" ON public.journeys;
DROP POLICY IF EXISTS "Users can update own journeys" ON public.journeys;
DROP POLICY IF EXISTS "Users can delete own journeys" ON public.journeys;

-- triggers
DROP POLICY IF EXISTS "Users can view own triggers"   ON public.triggers;
DROP POLICY IF EXISTS "Users can insert own triggers" ON public.triggers;
DROP POLICY IF EXISTS "Users can update own triggers" ON public.triggers;
DROP POLICY IF EXISTS "Users can delete own triggers" ON public.triggers;

-- trigger_logs
DROP POLICY IF EXISTS "Users can view own trigger logs"   ON public.trigger_logs;
DROP POLICY IF EXISTS "Users can insert own trigger logs" ON public.trigger_logs;
DROP POLICY IF EXISTS "Users can update own trigger logs" ON public.trigger_logs;
DROP POLICY IF EXISTS "Users can delete own trigger logs" ON public.trigger_logs;

-- activities
DROP POLICY IF EXISTS "Users can view own activities"   ON public.activities;
DROP POLICY IF EXISTS "Users can insert own activities" ON public.activities;
DROP POLICY IF EXISTS "Users can update own activities" ON public.activities;
DROP POLICY IF EXISTS "Users can delete own activities" ON public.activities;

-- bucket_items
DROP POLICY IF EXISTS "Users can view own bucket items"   ON public.bucket_items;
DROP POLICY IF EXISTS "Users can insert own bucket items" ON public.bucket_items;
DROP POLICY IF EXISTS "Users can update own bucket items" ON public.bucket_items;
DROP POLICY IF EXISTS "Users can delete own bucket items" ON public.bucket_items;

-- milestones
DROP POLICY IF EXISTS "Users can view own milestones"   ON public.milestones;
DROP POLICY IF EXISTS "Users can insert own milestones" ON public.milestones;
DROP POLICY IF EXISTS "Users can update own milestones" ON public.milestones;

-- daily_checkins
DROP POLICY IF EXISTS "Users can view own checkins"   ON public.daily_checkins;
DROP POLICY IF EXISTS "Users can insert own checkins" ON public.daily_checkins;
DROP POLICY IF EXISTS "Users can update own checkins" ON public.daily_checkins;

-- journal_entries
DROP POLICY IF EXISTS "Users can view own journal entries"   ON public.journal_entries;
DROP POLICY IF EXISTS "Users can insert own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can update own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can delete own journal entries" ON public.journal_entries;

-- selfie_records
DROP POLICY IF EXISTS "Users can view own selfies"   ON public.selfie_records;
DROP POLICY IF EXISTS "Users can insert own selfies" ON public.selfie_records;
DROP POLICY IF EXISTS "Users can delete own selfies" ON public.selfie_records;

-- subscription_status
DROP POLICY IF EXISTS "Users can view own subscription"   ON public.subscription_status;
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscription_status;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscription_status;

-- dopamine_points
DROP POLICY IF EXISTS "Users can view own dopamine points"   ON public.dopamine_points;
DROP POLICY IF EXISTS "Users can insert own dopamine points" ON public.dopamine_points;

-- user_preferences
DROP POLICY IF EXISTS "Users can view own preferences"   ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;

-- ============================================================================
-- STEP 3: Recreate all policies — authenticated users, own data only
-- ============================================================================

-- ── profiles ─────────────────────────────────────────────────────────────────
-- profiles.id IS the auth.uid() (FK to auth.users)

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

-- ── journeys ─────────────────────────────────────────────────────────────────

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

-- ── triggers ─────────────────────────────────────────────────────────────────
-- FIX: previous migration used a nullable journey_id join — use user_id directly

CREATE POLICY "Users can view own triggers"
  ON public.triggers FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own triggers"
  ON public.triggers FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own triggers"
  ON public.triggers FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own triggers"
  ON public.triggers FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ── trigger_logs ─────────────────────────────────────────────────────────────

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

-- ── activities ───────────────────────────────────────────────────────────────

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

-- ── bucket_items ─────────────────────────────────────────────────────────────

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

-- ── milestones ────────────────────────────────────────────────────────────────
-- FIX: previous migration used a journey subquery — use user_id directly

CREATE POLICY "Users can view own milestones"
  ON public.milestones FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own milestones"
  ON public.milestones FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own milestones"
  ON public.milestones FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ── daily_checkins ────────────────────────────────────────────────────────────

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

-- ── journal_entries ───────────────────────────────────────────────────────────
-- FIX: previous migration used a nullable journey_id join — user_id is NOT NULL

CREATE POLICY "Users can view own journal entries"
  ON public.journal_entries FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own journal entries"
  ON public.journal_entries FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own journal entries"
  ON public.journal_entries FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own journal entries"
  ON public.journal_entries FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ── selfie_records ────────────────────────────────────────────────────────────

CREATE POLICY "Users can view own selfies"
  ON public.selfie_records FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own selfies"
  ON public.selfie_records FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own selfies"
  ON public.selfie_records FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own selfies"
  ON public.selfie_records FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ── subscription_status ───────────────────────────────────────────────────────

CREATE POLICY "Users can view own subscription"
  ON public.subscription_status FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own subscription"
  ON public.subscription_status FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own subscription"
  ON public.subscription_status FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ── dopamine_points ───────────────────────────────────────────────────────────

CREATE POLICY "Users can view own dopamine points"
  ON public.dopamine_points FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own dopamine points"
  ON public.dopamine_points FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- ── user_preferences ─────────────────────────────────────────────────────────

CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- STEP 4: Revoke public/anon access to all tables
-- Belt-and-suspenders: even with RLS, explicitly deny anon the ability to
-- touch any table. Authenticated users keep their schema-level USAGE.
-- ============================================================================

REVOKE ALL ON public.profiles            FROM anon;
REVOKE ALL ON public.journeys            FROM anon;
REVOKE ALL ON public.triggers            FROM anon;
REVOKE ALL ON public.trigger_logs        FROM anon;
REVOKE ALL ON public.activities          FROM anon;
REVOKE ALL ON public.bucket_items        FROM anon;
REVOKE ALL ON public.milestones          FROM anon;
REVOKE ALL ON public.daily_checkins      FROM anon;
REVOKE ALL ON public.journal_entries     FROM anon;
REVOKE ALL ON public.selfie_records      FROM anon;
REVOKE ALL ON public.subscription_status FROM anon;
REVOKE ALL ON public.dopamine_points     FROM anon;
REVOKE ALL ON public.user_preferences    FROM anon;

-- ============================================================================
-- STEP 5: Fix the dopamine points function — lock down search_path
-- A SECURITY DEFINER function without search_path is vulnerable to hijacking.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_total_dopamine_points(p_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(points), 0)::integer
  FROM public.dopamine_points
  WHERE user_id = p_user_id;
$$;

-- ============================================================================
-- STEP 6: Update journeys addiction_type CHECK to include new addiction types
-- ============================================================================

ALTER TABLE public.journeys
  DROP CONSTRAINT IF EXISTS journeys_addiction_type_check;

ALTER TABLE public.journeys
  ADD CONSTRAINT journeys_addiction_type_check
  CHECK (addiction_type IN (
    'smoking', 'vaping', 'alcohol',
    'sugar', 'social-media', 'porn', 'gambling'
  ));
