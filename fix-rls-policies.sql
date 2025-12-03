-- ملف SQL لإصلاح سياسات Row Level Security
-- قم بتنفيذ هذا الكود في SQL Editor في Supabase لإصلاح مشكلة الصلاحيات

-- ===================================
-- 1. حذف السياسات القديمة
-- ===================================

-- حذف سياسات الأقسام
DROP POLICY IF EXISTS "Allow public read access to categories" ON categories;
DROP POLICY IF EXISTS "Allow public insert to categories" ON categories;
DROP POLICY IF EXISTS "Allow public update to categories" ON categories;
DROP POLICY IF EXISTS "Allow public delete to categories" ON categories;

-- حذف سياسات الكتب
DROP POLICY IF EXISTS "Allow public read access to published books" ON books;
DROP POLICY IF EXISTS "Allow public read access to all books" ON books;
DROP POLICY IF EXISTS "Allow public insert to books" ON books;
DROP POLICY IF EXISTS "Allow public update to books" ON books;
DROP POLICY IF EXISTS "Allow public delete to books" ON books;

-- حذف سياسات الصفحات
DROP POLICY IF EXISTS "Allow public read access to pages of published books" ON pages;
DROP POLICY IF EXISTS "Allow public read access to all pages" ON pages;
DROP POLICY IF EXISTS "Allow public insert to pages" ON pages;
DROP POLICY IF EXISTS "Allow public update to pages" ON pages;
DROP POLICY IF EXISTS "Allow public delete to pages" ON pages;

-- حذف سياسات رسائل التواصل
DROP POLICY IF EXISTS "Allow public insert to contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow public read to contact messages" ON contact_messages;

-- ===================================
-- 2. إنشاء السياسات الجديدة
-- ===================================

-- سياسات الأقسام (السماح بجميع العمليات)
CREATE POLICY "Allow all operations on categories"
    ON categories
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- سياسات الكتب (السماح بجميع العمليات)
CREATE POLICY "Allow all operations on books"
    ON books
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- سياسات الصفحات (السماح بجميع العمليات)
CREATE POLICY "Allow all operations on pages"
    ON pages
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- سياسات رسائل التواصل (السماح بجميع العمليات)
CREATE POLICY "Allow all operations on contact_messages"
    ON contact_messages
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ===================================
-- تم الانتهاء من إصلاح السياسات
-- ===================================

-- ملاحظة: هذه السياسات تسمح بالوصول الكامل للجميع
-- في بيئة الإنتاج، يُفضل تقييد الصلاحيات حسب المستخدمين المصرح لهم
