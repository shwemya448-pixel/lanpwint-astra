
-- Admin full access to jobs
CREATE POLICY "Admins manage jobs" ON public.jobs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Admin full access to applications
CREATE POLICY "Admins manage applications" ON public.applications
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Allow admins to insert jobs even without the 'employer' role (override existing INSERT check)
DROP POLICY IF EXISTS "Employers can create jobs" ON public.jobs;
CREATE POLICY "Employers or admins create jobs" ON public.jobs
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.uid() = employer_id AND public.has_role(auth.uid(), 'employer'::public.app_role))
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );
