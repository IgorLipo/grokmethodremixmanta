
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS schedule_confirmed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS schedule_response text,
ADD COLUMN IF NOT EXISTS schedule_notes text DEFAULT '';
