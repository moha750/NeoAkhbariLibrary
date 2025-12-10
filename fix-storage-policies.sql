-- ===================================
-- إصلاح سياسات Storage لرفع الصور
-- ===================================

-- 1. حذف السياسات القديمة
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- 2. إنشاء bucket إذا لم يكن موجوداً
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-avatars', 'user-avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. إنشاء السياسات الجديدة

-- السماح لجميع المستخدمين المسجلين برفع الصور
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'user-avatars' 
    AND (storage.foldername(name))[1] = 'avatars'
);

-- السماح للجميع بقراءة الصور (لأن الـ bucket عام)
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-avatars');

-- السماح للمستخدمين بتحديث صورهم
CREATE POLICY "Users can update avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'user-avatars')
WITH CHECK (bucket_id = 'user-avatars');

-- السماح للمستخدمين بحذف صورهم
CREATE POLICY "Users can delete avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'user-avatars');

-- 4. التحقق من السياسات
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%avatar%'
ORDER BY policyname;
