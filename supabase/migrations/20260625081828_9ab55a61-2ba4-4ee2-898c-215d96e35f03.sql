CREATE POLICY "news_media_read_auth" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'news-media');

CREATE POLICY "news_media_admin_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'news-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "news_media_admin_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'news-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "news_media_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'news-media' AND public.has_role(auth.uid(), 'admin'));