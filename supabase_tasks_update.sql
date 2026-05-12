-- Add new columns to tasks for extended functionality
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Update RLS policies to allow assignees to view and update their tasks
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
CREATE POLICY "Users can view own tasks" ON public.tasks 
    FOR SELECT TO authenticated 
    USING (auth.uid() = user_id OR auth.uid() = assignee_id);

DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users can update own tasks" ON public.tasks 
    FOR UPDATE TO authenticated 
    USING (auth.uid() = user_id OR auth.uid() = assignee_id);
