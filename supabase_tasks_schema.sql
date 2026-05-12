-- Tasks Table Schema

CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    job_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    due_date TIMESTAMPTZ,
    asset_name TEXT, -- To support the existing 'missing asset' feature from mock data
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Tasks Policies
CREATE POLICY "Users can view own tasks" ON public.tasks 
    FOR SELECT TO authenticated 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON public.tasks 
    FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON public.tasks 
    FOR UPDATE TO authenticated 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON public.tasks 
    FOR DELETE TO authenticated 
    USING (auth.uid() = user_id);
