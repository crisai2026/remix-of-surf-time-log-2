ALTER TABLE public.time_entries 
ADD COLUMN IF NOT EXISTS planned_category text,
ADD COLUMN IF NOT EXISTS is_out_of_plan boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS motor integer;