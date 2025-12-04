-- ملف SQL لإضافة جدول الأجزاء إلى قاعدة البيانات الموجودة
-- نفذ هذا الكود في SQL Editor في Supabase

-- ===================================
-- 1. إنشاء جدول الأجزاء (Parts)
-- ===================================
CREATE TABLE IF NOT EXISTS parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    part_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(book_id, part_number)
);

-- ===================================
-- 2. إضافة عمود part_id إلى جدول الصفحات
-- ===================================
ALTER TABLE pages 
ADD COLUMN IF NOT EXISTS part_id UUID REFERENCES parts(id) ON DELETE SET NULL;

-- ===================================
-- 3. إنشاء الفهارس (Indexes)
-- ===================================
CREATE INDEX IF NOT EXISTS idx_parts_book ON parts(book_id);
CREATE INDEX IF NOT EXISTS idx_parts_number ON parts(book_id, part_number);
CREATE INDEX IF NOT EXISTS idx_pages_part ON pages(part_id);

-- ===================================
-- 4. إنشاء Trigger لتحديث updated_at
-- ===================================
CREATE TRIGGER update_parts_updated_at
    BEFORE UPDATE ON parts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- 5. تفعيل Row Level Security (RLS)
-- ===================================
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;

-- ===================================
-- 6. إنشاء سياسات الأمان (Security Policies)
-- ===================================

-- سياسات القراءة
CREATE POLICY "Allow public read access to parts"
    ON parts FOR SELECT
    USING (true);

-- سياسات الإضافة
CREATE POLICY "Allow public insert to parts"
    ON parts FOR INSERT
    WITH CHECK (true);

-- سياسات التحديث
CREATE POLICY "Allow public update to parts"
    ON parts FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- سياسات الحذف
CREATE POLICY "Allow public delete to parts"
    ON parts FOR DELETE
    USING (true);

-- ===================================
-- تم الانتهاء!
-- ===================================
-- الآن يمكنك استخدام نظام الأجزاء في المكتبة
-- الأجزاء اختيارية - يمكن ربط الصفحات بالكتاب مباشرة أو عبر جزء
