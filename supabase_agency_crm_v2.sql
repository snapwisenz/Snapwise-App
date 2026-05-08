-- Drop old table if it exists
DROP TABLE IF EXISTS public.agent_packages;

-- Create generic Packages table
CREATE TABLE IF NOT EXISTS public.packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    ground_photos_qty INTEGER DEFAULT 0,
    drone_qty INTEGER DEFAULT 0,
    reels_qty INTEGER DEFAULT 0,
    twilight_qty INTEGER DEFAULT 0,
    video_package TEXT DEFAULT '', -- 'basic', 'standard', 'premium', 'ai'
    site_plan BOOLEAN DEFAULT false,
    floorplan BOOLEAN DEFAULT false,
    matterport BOOLEAN DEFAULT false,
    virtual_staging BOOLEAN DEFAULT false,
    virtual_staging_qty INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure a package belongs to either an agency or an agent, but not both (and not neither)
    CONSTRAINT package_owner_check CHECK (
        (agency_id IS NOT NULL AND agent_id IS NULL) OR 
        (agency_id IS NULL AND agent_id IS NOT NULL)
    )
);

-- Enable RLS
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Packages Policies
CREATE POLICY "Users can view own packages" ON public.packages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own packages" ON public.packages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own packages" ON public.packages FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own packages" ON public.packages FOR DELETE TO authenticated USING (auth.uid() = user_id);
