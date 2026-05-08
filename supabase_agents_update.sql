-- Add email and phone columns to the agents table
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;
