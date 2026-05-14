-- 1. Update Profiles Table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS service_regions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_global_preferred BOOLEAN DEFAULT false;

-- 2. Update Agencies Table
ALTER TABLE public.agencies 
ADD COLUMN IF NOT EXISTS preferred_photographer_id UUID REFERENCES public.profiles(id);
