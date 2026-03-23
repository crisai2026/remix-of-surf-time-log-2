
-- Tags table
CREATE TABLE public.tags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#D97757',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Public insert tags" ON public.tags FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update tags" ON public.tags FOR UPDATE USING (true);
CREATE POLICY "Public delete tags" ON public.tags FOR DELETE USING (true);

-- Junction table for time_entry <-> tag
CREATE TABLE public.time_entry_tags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  time_entry_id uuid NOT NULL REFERENCES public.time_entries(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  UNIQUE(time_entry_id, tag_id)
);

ALTER TABLE public.time_entry_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read time_entry_tags" ON public.time_entry_tags FOR SELECT USING (true);
CREATE POLICY "Public insert time_entry_tags" ON public.time_entry_tags FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete time_entry_tags" ON public.time_entry_tags FOR DELETE USING (true);
