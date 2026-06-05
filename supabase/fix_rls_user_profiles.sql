-- ============================================================
-- Fix C-3: Allow Owners to read all user_profiles rows
-- Run this in Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Drop the existing restrictive policy (own row only)
DROP POLICY IF EXISTS "own_profile" ON user_profiles;

-- Owners can read all profiles (needed for User Management page)
-- Everyone can read/write their own profile
CREATE POLICY "read_own_profile"
  ON user_profiles FOR SELECT
  USING (id = auth.uid() OR get_my_role() = 'Owner');

CREATE POLICY "write_own_profile"
  ON user_profiles FOR ALL
  USING (id = auth.uid());
