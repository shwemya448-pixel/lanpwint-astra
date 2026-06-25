
-- Restrict profile visibility: a profile is visible only to its owner, admins,
-- employers who have an application from that student, students who received
-- an offer/accept from that employer, or anyone in a message thread with them.

CREATE OR REPLACE FUNCTION public.can_view_profile(_viewer uuid, _target uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    _viewer IS NOT NULL AND (
      _viewer = _target
      OR public.has_role(_viewer, 'admin'::public.app_role)
      -- Employer (viewer) can see a student (target) who applied to one of their jobs
      OR EXISTS (
        SELECT 1 FROM public.applications a
        JOIN public.jobs j ON j.id = a.job_id
        WHERE a.student_id = _target AND j.employer_id = _viewer
      )
      -- Student (viewer) can see an employer (target) once they've been offered/accepted
      OR EXISTS (
        SELECT 1 FROM public.applications a
        JOIN public.jobs j ON j.id = a.job_id
        WHERE a.student_id = _viewer
          AND j.employer_id = _target
          AND a.status IN ('offered','accepted')
      )
      -- Either party is in an existing message thread
      OR EXISTS (
        SELECT 1 FROM public.messages m
        WHERE (m.sender_id = _viewer AND m.recipient_id = _target)
           OR (m.sender_id = _target AND m.recipient_id = _viewer)
      )
    );
$$;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Profiles are viewable by related users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.can_view_profile(auth.uid(), id));
