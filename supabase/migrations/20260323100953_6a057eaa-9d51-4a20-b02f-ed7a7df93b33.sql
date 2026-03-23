ALTER TABLE public.projects ADD COLUMN motor_number integer;

UPDATE public.projects SET motor_number = 1 WHERE name = 'Jobhunt';
UPDATE public.projects SET motor_number = 2 WHERE name = 'Aprender AI';
UPDATE public.projects SET motor_number = 3 WHERE name = 'Proyectos';