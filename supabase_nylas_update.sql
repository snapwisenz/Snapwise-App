-- Add Nylas fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS nylas_account_id TEXT,
ADD COLUMN IF NOT EXISTS nylas_grant_id TEXT;

-- Add nylas_event_id to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS nylas_event_id TEXT;
