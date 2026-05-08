-- Run this in your Supabase SQL Editor to add the new custom_pricing_rules column
ALTER TABLE public.agency_settings
ADD COLUMN IF NOT EXISTS custom_pricing_rules JSONB DEFAULT '[]'::jsonb;
