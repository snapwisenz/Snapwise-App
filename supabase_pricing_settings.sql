-- Create agency_settings table for pricing
CREATE TABLE IF NOT EXISTS public.agency_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    ground_photo_price NUMERIC DEFAULT 10,
    drone_photo_price NUMERIC DEFAULT 15,
    reel_price NUMERIC DEFAULT 50,
    twilight_photo_price NUMERIC DEFAULT 25,
    video_basic_price NUMERIC DEFAULT 150,
    video_standard_price NUMERIC DEFAULT 250,
    video_premium_price NUMERIC DEFAULT 350,
    video_ai_price NUMERIC DEFAULT 200,
    site_plan_price NUMERIC DEFAULT 50,
    floorplan_price NUMERIC DEFAULT 75,
    matterport_price NUMERIC DEFAULT 100,
    virtual_staging_price NUMERIC DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.agency_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own agency settings"
ON public.agency_settings FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own agency settings"
ON public.agency_settings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agency settings"
ON public.agency_settings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
