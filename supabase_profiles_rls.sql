-- Enable Row Level Security (just in case it's not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view profiles (needed for dashboard/layout)
CREATE POLICY "Users can view profiles"
ON public.profiles
FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile (if not already handled by an auth trigger)
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);
