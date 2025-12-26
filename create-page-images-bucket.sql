INSERT INTO storage.buckets (id, name, public)
VALUES ('page-images', 'page-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Authenticated users can upload page images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view page images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update page images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete page images" ON storage.objects;

CREATE POLICY "Authenticated users can upload page images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'page-images');

CREATE POLICY "Public can view page images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'page-images');

CREATE POLICY "Users can update page images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'page-images')
WITH CHECK (bucket_id = 'page-images');

CREATE POLICY "Users can delete page images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'page-images');
