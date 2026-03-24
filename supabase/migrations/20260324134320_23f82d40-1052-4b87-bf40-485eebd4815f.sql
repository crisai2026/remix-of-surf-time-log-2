-- Public read/write policies for all tables (no auth required)

-- PROJECTS
CREATE POLICY "Public read projects" ON public.projects FOR SELECT TO anon USING (true);
CREATE POLICY "Public insert projects" ON public.projects FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public update projects" ON public.projects FOR UPDATE TO anon USING (true);
CREATE POLICY "Public delete projects" ON public.projects FOR DELETE TO anon USING (true);

-- TIME_ENTRIES
CREATE POLICY "Public read time_entries" ON public.time_entries FOR SELECT TO anon USING (true);
CREATE POLICY "Public insert time_entries" ON public.time_entries FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public update time_entries" ON public.time_entries FOR UPDATE TO anon USING (true);
CREATE POLICY "Public delete time_entries" ON public.time_entries FOR DELETE TO anon USING (true);

-- TASKS
CREATE POLICY "Public read tasks" ON public.tasks FOR SELECT TO anon USING (true);
CREATE POLICY "Public insert tasks" ON public.tasks FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public update tasks" ON public.tasks FOR UPDATE TO anon USING (true);
CREATE POLICY "Public delete tasks" ON public.tasks FOR DELETE TO anon USING (true);

-- TAGS
CREATE POLICY "Public read tags" ON public.tags FOR SELECT TO anon USING (true);
CREATE POLICY "Public insert tags" ON public.tags FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public update tags" ON public.tags FOR UPDATE TO anon USING (true);
CREATE POLICY "Public delete tags" ON public.tags FOR DELETE TO anon USING (true);

-- TIME_ENTRY_TAGS
CREATE POLICY "Public read time_entry_tags" ON public.time_entry_tags FOR SELECT TO anon USING (true);
CREATE POLICY "Public insert time_entry_tags" ON public.time_entry_tags FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public update time_entry_tags" ON public.time_entry_tags FOR UPDATE TO anon USING (true);
CREATE POLICY "Public delete time_entry_tags" ON public.time_entry_tags FOR DELETE TO anon USING (true);