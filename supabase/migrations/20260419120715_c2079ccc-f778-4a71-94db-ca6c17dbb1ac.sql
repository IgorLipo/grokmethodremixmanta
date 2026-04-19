-- 1. Add new status to job_status enum
ALTER TYPE public.job_status ADD VALUE IF NOT EXISTS 'awaiting_owner_details' BEFORE 'draft';

-- 2. Add new columns to jobs
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS case_no text,
  ADD COLUMN IF NOT EXISTS panel_count integer;

-- 3. Unique index on case_no (allows multiple NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS jobs_case_no_unique ON public.jobs (case_no) WHERE case_no IS NOT NULL;

-- 4. Add optimizer_no column on site_reports for quick export access (also stored in report_data)
ALTER TABLE public.site_reports
  ADD COLUMN IF NOT EXISTS optimizer_no text;

-- 5. Job invites table
CREATE TABLE IF NOT EXISTS public.job_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  used_at timestamptz,
  used_by uuid
);

CREATE INDEX IF NOT EXISTS job_invites_token_idx ON public.job_invites(token);
CREATE INDEX IF NOT EXISTS job_invites_job_id_idx ON public.job_invites(job_id);

ALTER TABLE public.job_invites ENABLE ROW LEVEL SECURITY;

-- Admins can manage all invites
CREATE POLICY "Admins manage invites"
  ON public.job_invites FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Anyone authenticated can read an invite by token (needed for redemption flow)
CREATE POLICY "Authenticated can read invites"
  ON public.job_invites FOR SELECT
  TO authenticated
  USING (true);

-- 6. SECURITY DEFINER function to redeem an invite: validates token, attaches caller as owner, updates job status
CREATE OR REPLACE FUNCTION public.redeem_job_invite(_token text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite public.job_invites%ROWTYPE;
  v_job public.jobs%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO v_invite FROM public.job_invites WHERE token = _token;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid invite link';
  END IF;

  IF v_invite.expires_at < now() THEN
    RAISE EXCEPTION 'Invite link has expired';
  END IF;

  SELECT * INTO v_job FROM public.jobs WHERE id = v_invite.job_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job no longer exists';
  END IF;

  -- If already redeemed by someone else, block
  IF v_invite.used_at IS NOT NULL AND v_invite.used_by <> auth.uid() THEN
    RAISE EXCEPTION 'Invite already used';
  END IF;

  -- Attach caller as owner if not set
  IF v_job.owner_id IS NULL THEN
    UPDATE public.jobs
      SET owner_id = auth.uid(),
          status = CASE WHEN status = 'awaiting_owner_details'::public.job_status THEN 'draft'::public.job_status ELSE status END,
          updated_at = now()
      WHERE id = v_job.id;
  ELSIF v_job.owner_id <> auth.uid() THEN
    RAISE EXCEPTION 'This job already belongs to another owner';
  END IF;

  -- Mark invite used
  UPDATE public.job_invites
    SET used_at = COALESCE(used_at, now()),
        used_by = COALESCE(used_by, auth.uid())
    WHERE id = v_invite.id;

  RETURN v_job.id;
END;
$$;

-- Allow the trigger / function to bypass: nothing extra needed because SECURITY DEFINER.

-- 7. Allow authenticated users (the invited owner) to UPDATE a job they were just attached to.
-- The existing "Owners can update own jobs" policy already covers this once owner_id = auth.uid().
-- No change needed.