DROP POLICY IF EXISTS "Profiles are viewable by related users" ON public.profiles;

CREATE POLICY "Profiles are viewable by related users"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND (
    auth.uid() = id
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1
      FROM public.applications a
      JOIN public.jobs j ON j.id = a.job_id
      WHERE a.student_id = profiles.id
        AND j.employer_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.applications a
      JOIN public.jobs j ON j.id = a.job_id
      WHERE a.student_id = auth.uid()
        AND j.employer_id = profiles.id
        AND a.status IN ('offered', 'accepted')
    )
    OR EXISTS (
      SELECT 1
      FROM public.messages m
      WHERE (m.sender_id = auth.uid() AND m.recipient_id = profiles.id)
         OR (m.sender_id = profiles.id AND m.recipient_id = auth.uid())
    )
  )
);

REVOKE EXECUTE ON FUNCTION public.can_view_profile(uuid, uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.can_view_profile(uuid, uuid) FROM anon;