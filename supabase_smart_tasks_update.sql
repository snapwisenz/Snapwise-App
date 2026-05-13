-- Update Bookings Table
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS package_details TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS package_tbc BOOLEAN DEFAULT false;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS requires_floor_plan BOOLEAN DEFAULT false;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS key_box_pin TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS key_pin_tbc BOOLEAN DEFAULT false;

-- Update Tasks Table
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS task_type TEXT DEFAULT 'manual';
