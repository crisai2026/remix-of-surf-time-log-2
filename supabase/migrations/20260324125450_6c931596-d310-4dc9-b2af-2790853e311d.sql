
-- Add user_id to projects
ALTER TABLE public.projects ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

-- Add user_id to tasks
ALTER TABLE public.tasks ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

-- Add user_id to time_entries
ALTER TABLE public.time_entries ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

-- Add user_id to tags
ALTER TABLE public.tags ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

-- Drop all public policies on projects
DROP POLICY IF EXISTS "Public read projects" ON public.projects;
DROP POLICY IF EXISTS "Public insert projects" ON public.projects;
DROP POLICY IF EXISTS "Public update projects" ON public.projects;
DROP POLICY IF EXISTS "Public delete projects" ON public.projects;

-- New RLS for projects
CREATE POLICY "Users read own projects" ON public.projects FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own projects" ON public.projects FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own projects" ON public.projects FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Drop all public policies on tasks
DROP POLICY IF EXISTS "Public read tasks" ON public.tasks;
DROP POLICY IF EXISTS "Public insert tasks" ON public.tasks;
DROP POLICY IF EXISTS "Public update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Public delete tasks" ON public.tasks;

-- New RLS for tasks
CREATE POLICY "Users read own tasks" ON public.tasks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own tasks" ON public.tasks FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own tasks" ON public.tasks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Drop all public policies on time_entries
DROP POLICY IF EXISTS "Public read time_entries" ON public.time_entries;
DROP POLICY IF EXISTS "Public insert time_entries" ON public.time_entries;
DROP POLICY IF EXISTS "Public update time_entries" ON public.time_entries;
DROP POLICY IF EXISTS "Public delete time_entries" ON public.time_entries;

-- New RLS for time_entries
CREATE POLICY "Users read own time_entries" ON public.time_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own time_entries" ON public.time_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own time_entries" ON public.time_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own time_entries" ON public.time_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Drop all public policies on tags
DROP POLICY IF EXISTS "Public read tags" ON public.tags;
DROP POLICY IF EXISTS "Public insert tags" ON public.tags;
DROP POLICY IF EXISTS "Public update tags" ON public.tags;
DROP POLICY IF EXISTS "Public delete tags" ON public.tags;

-- New RLS for tags
CREATE POLICY "Users read own tags" ON public.tags FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own tags" ON public.tags FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own tags" ON public.tags FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own tags" ON public.tags FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Drop all public policies on time_entry_tags
DROP POLICY IF EXISTS "Public read time_entry_tags" ON public.time_entry_tags;
DROP POLICY IF EXISTS "Public insert time_entry_tags" ON public.time_entry_tags;
DROP POLICY IF EXISTS "Public delete time_entry_tags" ON public.time_entry_tags;

-- New RLS for time_entry_tags (via join to time_entries)
CREATE POLICY "Users read own time_entry_tags" ON public.time_entry_tags FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.time_entries WHERE time_entries.id = time_entry_tags.time_entry_id AND time_entries.user_id = auth.uid()));
CREATE POLICY "Users insert own time_entry_tags" ON public.time_entry_tags FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.time_entries WHERE time_entries.id = time_entry_tags.time_entry_id AND time_entries.user_id = auth.uid()));
CREATE POLICY "Users delete own time_entry_tags" ON public.time_entry_tags FOR DELETE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.time_entries WHERE time_entries.id = time_entry_tags.time_entry_id AND time_entries.user_id = auth.uid()));
