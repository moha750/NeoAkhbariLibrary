-- ملف SQL لإزالة أعمدة title و description من جدول parts
-- نفذ هذا الكود في SQL Editor في Supabase إذا كنت قد أنشأت الجدول مسبقاً

-- ===================================
-- إزالة الأعمدة غير المطلوبة
-- ===================================

-- حذف عمود title إن وجد
ALTER TABLE parts DROP COLUMN IF EXISTS title;

-- حذف عمود description إن وجد
ALTER TABLE parts DROP COLUMN IF EXISTS description;

-- ===================================
-- تم الانتهاء!
-- ===================================
-- الآن جدول parts يحتوي فقط على:
-- - id
-- - book_id
-- - part_number
-- - created_at
-- - updated_at
