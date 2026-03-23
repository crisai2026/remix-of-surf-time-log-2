
-- Projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  icon TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public insert projects" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update projects" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "Public delete projects" ON public.projects FOR DELETE USING (true);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Public insert tasks" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update tasks" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "Public delete tasks" ON public.tasks FOR DELETE USING (true);

-- Time entries table
CREATE TABLE public.time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_seconds INT,
  is_running BOOLEAN NOT NULL DEFAULT false,
  calendar_event_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read time_entries" ON public.time_entries FOR SELECT USING (true);
CREATE POLICY "Public insert time_entries" ON public.time_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update time_entries" ON public.time_entries FOR UPDATE USING (true);
CREATE POLICY "Public delete time_entries" ON public.time_entries FOR DELETE USING (true);

-- Create indexes
CREATE INDEX idx_time_entries_project ON public.time_entries(project_id);
CREATE INDEX idx_time_entries_start ON public.time_entries(start_time);
CREATE INDEX idx_tasks_project ON public.tasks(project_id);

-- Pre-load projects with Hawaiian-inspired colors
INSERT INTO public.projects (name, color, icon, sort_order) VALUES
  ('Jobhunt', '#2E86AB', '💼', 0),
  ('Proyectos', '#E8963E', '🏗️', 1),
  ('Aprender AI', '#6B5B95', '🤖', 2),
  ('Familia', '#F18F01', '👨‍👩‍👧‍👦', 3),
  ('Whanau Support', '#2D936C', '🤝', 4),
  ('Tarde hijas', '#E84855', '🌺', 5);
