
-- News categories
CREATE TABLE public.news_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name_en text NOT NULL,
  name_my text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.news_categories TO anon, authenticated;
GRANT ALL ON public.news_categories TO service_role;
ALTER TABLE public.news_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories readable by all" ON public.news_categories FOR SELECT USING (true);
CREATE POLICY "admins manage categories" ON public.news_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::public.app_role));

-- News posts
CREATE TABLE public.news_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title_en text NOT NULL,
  title_my text NOT NULL,
  excerpt_en text,
  excerpt_my text,
  body_en text NOT NULL,
  body_my text NOT NULL,
  image_url text,
  category_id uuid REFERENCES public.news_categories(id) ON DELETE SET NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published boolean NOT NULL DEFAULT true,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.news_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.news_posts TO authenticated;
GRANT ALL ON public.news_posts TO service_role;
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published news readable by all" ON public.news_posts FOR SELECT USING (published = true OR public.has_role(auth.uid(),'admin'::public.app_role));
CREATE POLICY "admins manage news" ON public.news_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::public.app_role));

CREATE TRIGGER trg_news_posts_updated BEFORE UPDATE ON public.news_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed categories
INSERT INTO public.news_categories(slug,name_en,name_my) VALUES
  ('announcements','Announcements','ကြေညာချက်များ'),
  ('jobs','Jobs','အလုပ်များ'),
  ('events','Events','ပွဲများ'),
  ('tips','Career Tips','အလုပ်အကိုင်အကြံပြုချက်');

-- Make shwemya448@gmail.com auto-admin with all roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE _role public.app_role;
BEGIN
  _role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role','')::public.app_role, 'student'::public.app_role);
  INSERT INTO public.profiles (id, full_name, contact_email, avatar_url)
  VALUES (NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email, NEW.raw_user_meta_data->>'avatar_url')
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

-- Re-attach trigger if missing
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
