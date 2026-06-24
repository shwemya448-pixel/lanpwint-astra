CREATE TYPE public.app_role AS ENUM ('student', 'employer', 'admin');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT, headline TEXT, school TEXT, bio TEXT, avatar_url TEXT, contact_email TEXT,
  skills text[] DEFAULT '{}', degree text, graduation_year int,
  education jsonb DEFAULT '[]'::jsonb, certificates jsonb DEFAULT '[]'::jsonb,
  location text, phone text, cv_url text,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO anon;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Roles are viewable by everyone" ON public.user_roles FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE _role public.app_role;
BEGIN
  _role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role','')::public.app_role, 'student'::public.app_role);
  INSERT INTO public.profiles (id, full_name, contact_email, avatar_url)
  VALUES (NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email, NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE TYPE public.job_type AS ENUM ('full_time','part_time','internship','contract','remote');
CREATE TYPE public.job_status AS ENUM ('open','closed','draft');
CREATE TYPE public.application_status AS ENUM ('pending','reviewing','offered','accepted','rejected','withdrawn');

CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL, company text, description text NOT NULL, requirements text, location text,
  job_type public.job_type NOT NULL DEFAULT 'full_time',
  salary_min int, salary_max int, salary_currency text DEFAULT 'MMK',
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
CREATE POLICY "Anyone can view open jobs" ON public.jobs FOR SELECT
  USING (status = 'open' OR auth.uid() = employer_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Employers can create jobs" ON public.jobs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = employer_id AND public.has_role(auth.uid(),'employer'));
CREATE POLICY "Employers can update own jobs" ON public.jobs FOR UPDATE TO authenticated
  USING (auth.uid() = employer_id) WITH CHECK (auth.uid() = employer_id);
CREATE POLICY "Employers can delete own jobs" ON public.jobs FOR DELETE TO authenticated
  USING (auth.uid() = employer_id);
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX jobs_employer_idx ON public.jobs(employer_id);
CREATE INDEX jobs_status_idx ON public.jobs(status);

CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cv_url text, cover_letter text,
  status public.application_status NOT NULL DEFAULT 'pending',
  employer_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(job_id, student_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own applications" ON public.applications FOR SELECT TO authenticated
  USING (auth.uid() = student_id);
CREATE POLICY "Employers view applications to own jobs" ON public.applications FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.employer_id = auth.uid()));
CREATE POLICY "Students create own applications" ON public.applications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id AND public.has_role(auth.uid(),'student'));
CREATE POLICY "Students update own applications" ON public.applications FOR UPDATE TO authenticated
  USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Employers update applications to own jobs" ON public.applications FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.employer_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.employer_id = auth.uid()));
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX applications_job_idx ON public.applications(job_id);
CREATE INDEX applications_student_idx ON public.applications(student_id);

CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL, description text, video_url text NOT NULL, thumbnail_url text,
  category text, level text DEFAULT 'beginner', duration_minutes int,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lessons TO authenticated;
GRANT SELECT ON public.lessons TO anon;
GRANT ALL ON public.lessons TO service_role;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published lessons" ON public.lessons FOR SELECT
  USING (published = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage lessons" ON public.lessons FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL, title text NOT NULL, body text, link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated can create notifications" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE INDEX notifications_user_idx ON public.notifications(user_id, read, created_at DESC);

CREATE OR REPLACE FUNCTION public.notify_on_application_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _employer uuid; _job_title text;
BEGIN
  SELECT employer_id, title INTO _employer, _job_title FROM public.jobs WHERE id = NEW.job_id;
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications(user_id, type, title, body, link)
    VALUES (_employer, 'application_received', 'New application',
            'A student applied to ' || _job_title, '/employer/applications');
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'offered' THEN
      INSERT INTO public.notifications(user_id, type, title, body, link)
      VALUES (NEW.student_id, 'offer_received', 'You received a job offer!',
              'Offer for ' || _job_title || ' — please confirm.', '/applications');
    ELSIF NEW.status = 'accepted' THEN
      INSERT INTO public.notifications(user_id, type, title, body, link)
      VALUES (_employer, 'offer_accepted', 'Offer accepted',
              'Student accepted your offer for ' || _job_title, '/employer/applications');
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO public.notifications(user_id, type, title, body, link)
      VALUES (NEW.student_id, 'application_rejected', 'Application update',
              'Your application for ' || _job_title || ' was not selected.', '/applications');
    END IF;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER application_event_notify AFTER INSERT OR UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_application_event();

REVOKE EXECUTE ON FUNCTION public.notify_on_application_event() FROM PUBLIC, anon, authenticated;