-- إضافة حقل الصورة الشخصية إلى جدول users

-- إضافة حقل رابط الصورة الشخصية
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- تعليق على الحقل الجديد
COMMENT ON COLUMN users.avatar_url IS 'رابط الصورة الشخصية للمستخدم (اختياري)';

-- إنشاء bucket للصور الشخصية في Supabase Storage
-- يجب تنفيذ هذا الأمر في لوحة تحكم Supabase:
-- 1. اذهب إلى Storage
-- 2. أنشئ bucket جديد باسم: user-avatars
-- 3. اجعله public للقراءة
-- 4. حدد الحد الأقصى لحجم الملف: 2MB
