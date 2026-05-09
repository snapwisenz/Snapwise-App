-- Enable PostGIS for the GEOGRAPHY type
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create the new Bookings table replacing the legacy jobs table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- The franchise owner/admin
    agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL,
    sub_agency_id UUID REFERENCES public.sub_agencies(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
    package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
    photographer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')),
    shoot_location TEXT NOT NULL,
    coordinates GEOGRAPHY(POINT),
    
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    upload_buffer_end TIMESTAMPTZ,
    
    -- Dynamic deliverables structure (replacing hardcoded booleans)
    deliverables JSONB DEFAULT '[]',
    delivery_url TEXT,
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: We drop the legacy jobs and job_assets tables if they exist to keep the database clean
DROP TABLE IF EXISTS public.job_assets CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;

-- Enable RLS for the bookings table
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Booking Policies
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() = photographer_id);
CREATE POLICY "Users can insert own bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE TO authenticated USING (auth.uid() = user_id OR auth.uid() = photographer_id);
CREATE POLICY "Users can delete own bookings" ON public.bookings FOR DELETE TO authenticated USING (auth.uid() = user_id);
