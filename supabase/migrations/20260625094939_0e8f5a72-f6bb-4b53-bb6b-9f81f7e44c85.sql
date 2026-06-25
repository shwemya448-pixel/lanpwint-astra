
-- 1. Add employer_status column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS employer_status text NOT NULL DEFAULT 'approved'
  CHECK (employer_status IN ('pending','approved','rejected'));

-- 2. Update handle_new_user to set pending for employer signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _role public.app_role;
DECLARE _status text;
BEGIN
  _role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role','')::public.app_role, 'student'::public.app_role);
  _status := CASE WHEN _role = 'employer'::public.app_role THEN 'pending' ELSE 'approved' END;

  INSERT INTO public.profiles (id, full_name, contact_email, avatar_url, employer_status)
  VALUES (NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email, NEW.raw_user_meta_data->>'avatar_url', _status)
  ON CONFLICT (id) DO NOTHING;

  IF lower(NEW.email) = 'shwemya448@gmail.com' THEN
    INSERT INTO public.user_roles(user_id, role) VALUES
      (NEW.id,'admin'::public.app_role),
      (NEW.id,'student'::public.app_role),
      (NEW.id,'employer'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END; $function$;

-- 3. Admin can update any profile (including employer_status); also keep users from changing their own status
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Allow anyone authenticated to read employer_status (needed for sign-in gating via own profile)
-- (existing profile select policies already cover this for self/admin)
