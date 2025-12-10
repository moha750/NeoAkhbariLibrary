-- إنشاء bucket للصور الشخصية في Supabase Storage

-- إنشاء bucket للصور الشخصية
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'user-avatars',
    'user-avatars',
    true,
    2097152, -- 2MB in bytes
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- سياسة للسماح للمستخدمين برفع صورهم الشخصية
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'user-avatars' 
    AND (storage.foldername(name))[1] = 'avatars'
    AND auth.uid()::text = (storage.filename(name))[1]
);

-- سياسة للسماح للجميع بقراءة الصور
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-avatars');

-- سياسة للسماح للمستخدمين بتحديث صورهم
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'user-avatars'
    AND (storage.foldername(name))[1] = 'avatars'
    AND auth.uid()::text = (storage.filename(name))[1]
);

-- سياسة للسماح للمستخدمين بحذف صورهم
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'user-avatars'
    AND (storage.foldername(name))[1] = 'avatars'
    AND auth.uid()::text = (storage.filename(name))[1]
);
