-- Create Agencies table
CREATE TABLE IF NOT EXISTS public.agencies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Sub-Agencies (Locations) table
CREATE TABLE IF NOT EXISTS public.sub_agencies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    contact_info TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Agents table
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sub_agency_id UUID REFERENCES public.sub_agencies(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    contact_info TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop old agent_packages table if it exists (from the previous version)
DROP TABLE IF EXISTS public.agent_packages;

-- Create generic Packages table (can be assigned to an agency OR an agent)
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
    
    -- Ensure a package belongs to either an agency or an agent
    CONSTRAINT package_owner_check CHECK (
        (agency_id IS NOT NULL AND agent_id IS NULL) OR 
        (agency_id IS NULL AND agent_id IS NOT NULL)
    )
);

-- Enable RLS for all tables
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Agencies Policies
CREATE POLICY "Users can view own agencies" ON public.agencies FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own agencies" ON public.agencies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own agencies" ON public.agencies FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own agencies" ON public.agencies FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Sub-Agencies Policies
CREATE POLICY "Users can view own sub_agencies" ON public.sub_agencies FOR SELECT TO authenticated USING (
    agency_id IN (SELECT id FROM public.agencies WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert own sub_agencies" ON public.sub_agencies FOR INSERT TO authenticated WITH CHECK (
    agency_id IN (SELECT id FROM public.agencies WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update own sub_agencies" ON public.sub_agencies FOR UPDATE TO authenticated USING (
    agency_id IN (SELECT id FROM public.agencies WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete own sub_agencies" ON public.sub_agencies FOR DELETE TO authenticated USING (
    agency_id IN (SELECT id FROM public.agencies WHERE user_id = auth.uid())
);

-- Agents Policies
CREATE POLICY "Users can view own agents" ON public.agents FOR SELECT TO authenticated USING (
    sub_agency_id IN (SELECT id FROM public.sub_agencies WHERE agency_id IN (SELECT id FROM public.agencies WHERE user_id = auth.uid()))
);
CREATE POLICY "Users can insert own agents" ON public.agents FOR INSERT TO authenticated WITH CHECK (
    sub_agency_id IN (SELECT id FROM public.sub_agencies WHERE agency_id IN (SELECT id FROM public.agencies WHERE user_id = auth.uid()))
);
CREATE POLICY "Users can update own agents" ON public.agents FOR UPDATE TO authenticated USING (
    sub_agency_id IN (SELECT id FROM public.sub_agencies WHERE agency_id IN (SELECT id FROM public.agencies WHERE user_id = auth.uid()))
);
CREATE POLICY "Users can delete own agents" ON public.agents FOR DELETE TO authenticated USING (
    sub_agency_id IN (SELECT id FROM public.sub_agencies WHERE agency_id IN (SELECT id FROM public.agencies WHERE user_id = auth.uid()))
);

-- Packages Policies
CREATE POLICY "Users can view own packages" ON public.packages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own packages" ON public.packages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own packages" ON public.packages FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own packages" ON public.packages FOR DELETE TO authenticated USING (auth.uid() = user_id);
