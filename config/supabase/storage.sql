-- Storage buckets and policies for UploadThing integration
-- Note: We're using UploadThing for storage, but keeping some Supabase storage for user avatars

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('user-avatars', 'user-avatars', true),
  ('temp-uploads', 'temp-uploads', false);

-- Storage policies for user avatars
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'user-avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for temporary uploads
CREATE POLICY "Users can upload to temp" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'temp-uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own temp uploads" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'temp-uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own temp uploads" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'temp-uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );