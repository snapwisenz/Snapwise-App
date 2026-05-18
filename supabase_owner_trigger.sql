-- ============================================================
-- Snapwise 3-Tier RBAC Migration
-- Roles: owner | admin | staff
-- Job function flag: is_photographer (boolean)
-- ============================================================

-- STEP 1: Migrate existing roles
UPDATE public.profiles SET role = 'admin' WHERE role = 'dispatcher';
UPDATE public.profiles SET role = 'staff' WHERE role = 'photographer';

-- STEP 2: Update the role check constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('owner', 'admin', 'staff'));

-- STEP 3: Add is_photographer flag + logistics columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_photographer BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS service_regions TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS base_address TEXT;

ALTER TABLE public.profiles
  ALTER COLUMN tenancy_id DROP NOT NULL;

-- STEP 4: Backfill is_photographer for profiles that have a base_address
UPDATE public.profiles
SET is_photographer = true
WHERE base_address IS NOT NULL AND base_address != '';

-- STEP 5: Create the trigger function
-- First user → 'owner'. Subsequent users → role from metadata or 'staff'.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role TEXT;
  _existing_count INT;
BEGIN
  SELECT COUNT(*) INTO _existing_count FROM public.profiles;

  IF _existing_count = 0 THEN
    _role := 'owner';
  ELSE
    _role := COALESCE(NEW.raw_user_meta_data->>'role', 'staff');
    IF _role NOT IN ('owner', 'admin', 'staff') THEN
      _role := 'staff';
    END IF;
  END IF;

  INSERT INTO public.profiles (
    id, email, full_name, first_name, last_name, role, is_photographer
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    _role,
    COALESCE((NEW.raw_user_meta_data->>'is_photographer')::boolean, false)
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- STEP 6: Attach the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- STEP 7: Backfill – first existing user without a profile gets 'owner'
INSERT INTO public.profiles (id, email, full_name, first_name, role)
SELECT u.id, u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'first_name', split_part(u.email, '@', 1)),
  'owner'
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ORDER BY u.created_at ASC
LIMIT 1;

-- Remaining users without profiles get 'staff'
INSERT INTO public.profiles (id, email, full_name, first_name, role)
SELECT u.id, u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'first_name', split_part(u.email, '@', 1)),
  'staff'
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;


-- ============================================================
-- STEP 8: RLS Policies for profiles table
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (safe to re-run)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Owners and admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Owners and admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role has full access" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Owners can delete profiles" ON public.profiles;

-- 1. Everyone can read their OWN profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- 2. Owners and Admins can read ALL profiles (for Team Management)
CREATE POLICY "Owners and admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid() AND p.role IN ('owner', 'admin')
    )
  );

-- 3. Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Owners and Admins can update ANY profile
CREATE POLICY "Owners and admins can update all profiles"
  ON public.profiles FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid() AND p.role IN ('owner', 'admin')
    )
  );

-- 5. Service role can insert (trigger)
CREATE POLICY "Service role can insert profiles"
  ON public.profiles FOR INSERT TO service_role
  WITH CHECK (true);

-- 6. Authenticated users can insert their own profile (onboarding)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- 7. Owners can delete profiles (remove team member)
CREATE POLICY "Owners can delete profiles"
  ON public.profiles FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );
