CREATE OR REPLACE FUNCTION public.notify_on_application_event()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
              'Offer for ' || _job_title || ' — please confirm.', '/student/applications');
    ELSIF NEW.status = 'accepted' THEN
      INSERT INTO public.notifications(user_id, type, title, body, link)
      VALUES (_employer, 'offer_accepted', 'Offer accepted',
              'Student accepted your offer for ' || _job_title, '/employer/applications');
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO public.notifications(user_id, type, title, body, link)
      VALUES (NEW.student_id, 'application_rejected', 'Application update',
              'Your application for ' || _job_title || ' was not selected.', '/student/applications');
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;