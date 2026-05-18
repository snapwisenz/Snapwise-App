-- ============================================================
-- Snapwise 3-Tier RBAC Migration
-- Roles: owner | admin | photographer
-- ============================================================

-- STEP 1: Migrate any existing 'dispatcher' roles to 'admin'
UPDATE public.profiles SET role = 'admin' WHERE role = 'dispatcher';

-- STEP 2: Update the role check constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('owner', 'admin', 'photographer'));

-- STEP 3: Add photographer logistics columns if missing
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS service_regions TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS base_address TEXT;

ALTER TABLE public.profiles
  ALTER COLUMN tenancy_id DROP NOT NULL;

-- STEP 4: Create the trigger function
-- First user → 'owner'. Subsequent users → role from metadata or 'photographer'.
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
    _role := COALESCE(NEW.raw_user_meta_data->>'role', 'photographer');
    IF _role NOT IN ('owner', 'admin', 'photographer') THEN
      _role := 'photographer';
    END IF;
  END IF;

  INSERT INTO public.profiles (
    id, email, full_name, first_name, last_name, role
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    _role
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- STEP 5: Attach the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- STEP 6: Backfill – first existing user without a profile gets 'owner'
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

-- Remaining users without profiles get 'photographer'
INSERT INTO public.profiles (id, email, full_name, first_name, role)
SELECT u.id, u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'first_name', split_part(u.email, '@', 1)),
  'photographer'
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;
