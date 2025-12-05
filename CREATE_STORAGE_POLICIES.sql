-- ===================================
-- إعداد Storage Bucket وسياسات الوصول
-- ===================================

-- ملاحظة مهمة:
-- يجب إنشاء الـ bucket يدوياً من واجهة Supabase أولاً
-- اذهب إلى: Storage > Create a new bucket
-- الاسم: book-covers
-- Public: نعم

-- ===================================
-- سياسات Storage للقراءة والرفع والحذف
-- ===================================

-- سياسة القراءة العامة (يمكن للجميع مشاهدة الصور)
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'book-covers');

-- سياسة الرفع العامة (يمكن للجميع رفع الصور)
CREATE POLICY "Public Upload Access"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'book-covers');

-- سياسة التحديث العامة (يمكن للجميع تحديث الصور)
CREATE POLICY "Public Update Access"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'book-covers')
WITH CHECK (bucket_id = 'book-covers');

-- سياسة الحذف العامة (يمكن للجميع حذف الصور)
CREATE POLICY "Public Delete Access"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'book-covers');

-- ===================================
-- ملاحظات:
-- ===================================
-- 1. يجب إنشاء bucket باسم 'book-covers' يدوياً أولاً
-- 2. يجب تفعيل خيار "Public bucket" عند الإنشاء
-- 3. هذه السياسات تسمح بالوصول العام (مناسب للصور العامة)
-- 4. إذا كنت تريد تقييد الوصول، استبدل 'public' بـ 'authenticated'
