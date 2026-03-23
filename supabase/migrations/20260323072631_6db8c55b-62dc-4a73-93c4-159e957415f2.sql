ALTER TABLE public.time_entries
  ADD COLUMN IF NOT EXISTS paused_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS paused_seconds integer NOT NULL DEFAULT 0;