-- Add photographer-specific columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS equipment TEXT,
ADD COLUMN IF NOT EXISTS deliverable_products JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS internal_notes TEXT,
ADD COLUMN IF NOT EXISTS internal_pay_rate NUMERIC;

-- Optional: Create a specific table for photographer equipment/products if profiles gets too bloated
-- For now, adding to profiles as per hierarchical design in blueprint.
