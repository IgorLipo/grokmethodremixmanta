
-- Create site_reports table for engineer questionnaire
CREATE TABLE public.site_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  engineer_id UUID NOT NULL,
  report_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  report_photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_reports ENABLE ROW LEVEL SECURITY;

-- Engineers can manage their own reports
CREATE POLICY "Engineers can manage own reports"
ON public.site_reports FOR ALL TO authenticated
USING (engineer_id = auth.uid())
WITH CHECK (engineer_id = auth.uid());

-- Admins can manage all reports
CREATE POLICY "Admins can manage all reports"
ON public.site_reports FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Owners can read reports for their jobs
CREATE POLICY "Owners can read own job reports"
ON public.site_reports FOR SELECT TO authenticated
USING (is_job_owner(job_id, auth.uid()));

-- Add engineer_id to job_assignments so engineers can be assigned to jobs
-- (reusing existing table, engineers are assigned like scaffolders but with a different role)
-- We'll use a 'role' column to distinguish assignment types
ALTER TABLE public.job_assignments ADD COLUMN IF NOT EXISTS assignment_role TEXT NOT NULL DEFAULT 'scaffolder';

-- Engineers can read their own assignments
CREATE POLICY "Engineers can read own assignments"
ON public.job_assignments FOR SELECT TO authenticated
USING (scaffolder_id = auth.uid() AND assignment_role = 'engineer');

-- Allow engineers to read jobs they're assigned to (update the is_job_assigned function or add policy)
-- We need engineers to see jobs too
CREATE POLICY "Engineers can read assigned jobs"
ON public.jobs FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.job_assignments 
    WHERE job_id = id AND scaffolder_id = auth.uid() AND assignment_role = 'engineer'
  )
);

-- Engineers can read photos for assigned jobs
CREATE POLICY "Engineers can read photos for assigned jobs"
ON public.photos FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.job_assignments 
    WHERE job_id = photos.job_id AND scaffolder_id = auth.uid() AND assignment_role = 'engineer'
  )
);
