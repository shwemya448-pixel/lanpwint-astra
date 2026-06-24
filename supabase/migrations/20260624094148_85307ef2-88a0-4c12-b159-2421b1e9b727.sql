
-- =========================================
-- Extend profiles with student fields
-- =========================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS degree text,
  ADD COLUMN IF NOT EXISTS graduation_year int,
  ADD COLUMN IF NOT EXISTS education jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS certificates jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS cv_url text;

-- =========================================
-- Job types enum
-- =========================================
DO $$ BEGIN
  CREATE TYPE public.job_type AS ENUM ('full_time','part_time','internship','contract','remote');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.job_status AS ENUM ('open','closed','draft');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.application_status AS ENUM ('pending','reviewing','offered','accepted','rejected','withdrawn');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================================
-- Jobs
-- =========================================
CREATE TABLE IF NOT EXISTS public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  company text,
  description text NOT NULL,
  requirements text,
  location text,
  job_type public.job_type NOT NULL DEFAULT 'full_time',
  salary_min int,
  salary_max int,
  salary_currency text DEFAULT 'MMK',
  skills text[] DEFAULT '{}',
  status public.job_status NOT NULL DEFAULT 'open',
  application_deadline date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT SELECT ON public.jobs TO anon;
GRANT ALL ON public.jobs TO service_role;

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view open jobs"
  ON public.jobs FOR SELECT
  USING (status = 'open' OR auth.uid() = employer_id OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Employers can create jobs"
  ON public.jobs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = employer_id AND public.has_role(auth.uid(),'employer'));

CREATE POLICY "Employers can update own jobs"
  ON public.jobs FOR UPDATE TO authenticated
  USING (auth.uid() = employer_id)
  WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can delete own jobs"
  ON public.jobs FOR DELETE TO authenticated
  USING (auth.uid() = employer_id);

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS jobs_employer_idx ON public.jobs(employer_id);
CREATE INDEX IF NOT EXISTS jobs_status_idx ON public.jobs(status);

-- =========================================
-- Applications
-- =========================================
CREATE TABLE IF NOT EXISTS public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cv_url text,
  cover_letter text,
  status public.application_status NOT NULL DEFAULT 'pending',
  employer_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(job_id, student_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view own applications"
  ON public.applications FOR SELECT TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Employers view applications to own jobs"
  ON public.applications FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.employer_id = auth.uid()));

CREATE POLICY "Students create own applications"
  ON public.applications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id AND public.has_role(auth.uid(),'student'));

CREATE POLICY "Students update own applications"
  ON public.applications FOR UPDATE TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Employers update applications to own jobs"
  ON public.applications FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.employer_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.employer_id = auth.uid()));

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS applications_job_idx ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS applications_student_idx ON public.applications(student_id);

-- =========================================
-- Lessons (admin-uploaded learning videos)
-- =========================================
CREATE TABLE IF NOT EXISTS public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  category text,
  level text DEFAULT 'beginner',
  duration_minutes int,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lessons TO authenticated;
GRANT SELECT ON public.lessons TO anon;
GRANT ALL ON public.lessons TO service_role;

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published lessons"
  ON public.lessons FOR SELECT
  USING (published = true OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admins manage lessons"
  ON public.lessons FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- Notifications
-- =========================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow any authenticated user to insert notifications for any user
-- (used to notify the counterparty in job offer / application flows)
CREATE POLICY "Authenticated can create notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications(user_id, read, created_at DESC);

-- =========================================
-- Auto-notify on new application & status changes
-- =========================================
CREATE OR REPLACE FUNCTION public.notify_on_application_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _employer uuid;
  _job_title text;
BEGIN
  SELECT employer_id, title INTO _employer, _job_title FROM public.jobs WHERE id = NEW.job_id;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications(user_id, type, title, body, link)
    VALUES (_employer, 'application_received',
            'New application',
            'A student applied to ' || _job_title,
            '/employer/applications');
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'offered' THEN
      INSERT INTO public.notifications(user_id, type, title, body, link)
      VALUES (NEW.student_id, 'offer_received',
              'You received a job offer!',
              'Offer for ' || _job_title || ' — please confirm.',
              '/applications');
    ELSIF NEW.status = 'accepted' THEN
      INSERT INTO public.notifications(user_id, type, title, body, link)
      VALUES (_employer, 'offer_accepted',
              'Offer accepted',
              'Student accepted your offer for ' || _job_title,
              '/employer/applications');
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO public.notifications(user_id, type, title, body, link)
      VALUES (NEW.student_id, 'application_rejected',
              'Application update',
              'Your application for ' || _job_title || ' was not selected.',
              '/applications');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS application_event_notify ON public.applications;
CREATE TRIGGER application_event_notify
  AFTER INSERT OR UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_application_event();
