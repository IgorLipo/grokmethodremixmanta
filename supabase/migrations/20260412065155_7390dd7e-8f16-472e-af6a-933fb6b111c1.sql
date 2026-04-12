
ALTER TABLE public.quotes
ADD COLUMN counter_amount numeric DEFAULT NULL,
ADD COLUMN counter_notes text DEFAULT NULL;
