
-- Fix the broken scaffolder SELECT policy on jobs that causes infinite recursion
DROP POLICY IF EXISTS "Scaffolders can read assigned jobs" ON public.jobs;

CREATE POLICY "Scaffolders can read assigned jobs"
ON public.jobs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.job_assignments
    WHERE job_assignments.job_id = jobs.id
      AND job_assignments.scaffolder_id = auth.uid()
  )
);
