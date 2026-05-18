-- ============================================================
-- STEP 1: Update the role check constraint on profiles
-- to include all new role types: owner, admin, dispatcher, photographer
-- ============================================================
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('owner', 'admin', 'photographer'));


-- ============================================================
-- STEP 2: Also add service_regions and base_address columns
-- if they don't already exist (needed for the Team Management page).
-- Also make tenancy_id nullable so the trigger INSERT doesn't fail
-- (profiles created via trigger won't have a tenancy yet).
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS service_regions TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS base_address TEXT;

ALTER TABLE public.profiles
  ALTER COLUMN tenancy_id DROP NOT NULL;


-- ============================================================
-- STEP 3: Create the trigger function
-- This fires every time a new user signs up via Supabase Auth.
-- It reads metadata from the signup (full_name, first_name, last_name, email)
-- and creates an initial profile row with role = 'owner'.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    first_name,
    last_name,
    role,
    created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'owner',
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Safety: don't overwrite if profile already exists
  RETURN NEW;
END;
$$;


-- ============================================================
-- STEP 4: Attach the trigger to auth.users
-- Drop first in case it exists from a previous attempt, then recreate.
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- STEP 5: Backfill — create a profile for ANY existing auth users
-- who don't already have one (e.g. yourself, since you signed up before this trigger existed).
-- ============================================================
INSERT INTO public.profiles (id, email, full_name, first_name, role, created_at)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'first_name', split_part(u.email, '@', 1)),
  'owner',
  NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;
