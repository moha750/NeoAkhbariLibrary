-- ملف SQL لإعداد قاعدة بيانات المكتبة الرقمية في Supabase
-- قم بتنفيذ هذا الكود في SQL Editor في لوحة تحكم Supabase

-- ===================================
-- 1. إنشاء جدول الأقسام (Categories)
-- ===================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- 2. إنشاء جدول الكتب (Books)
-- ===================================
CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    cover_image TEXT,
    published BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- 3. إنشاء جدول الصفحات (Pages)
-- ===================================
CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(book_id, page_number)
);

-- ===================================
-- 4. إنشاء جدول رسائل التواصل (Contact Messages)
-- ===================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- 5. إنشاء الفهارس (Indexes) لتحسين الأداء
-- ===================================
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_published ON books(published);
CREATE INDEX IF NOT EXISTS idx_pages_book ON pages(book_id);
CREATE INDEX IF NOT EXISTS idx_pages_number ON pages(book_id, page_number);
CREATE INDEX IF NOT EXISTS idx_contact_read ON contact_messages(read);
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_messages(created_at DESC);

-- ===================================
-- 6. إنشاء دالة لتحديث updated_at تلقائياً
-- ===================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===================================
-- 7. إنشاء Triggers لتحديث updated_at
-- ===================================
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at
    BEFORE UPDATE ON pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- 8. تفعيل Row Level Security (RLS)
-- ===================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- ===================================
-- 9. إنشاء سياسات الأمان (Security Policies)
-- ===================================

-- سياسات الأقسام
CREATE POLICY "Allow public read access to categories"
    ON categories FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert to categories"
    ON categories FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update to categories"
    ON categories FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public delete to categories"
    ON categories FOR DELETE
    USING (true);

-- سياسات الكتب
CREATE POLICY "Allow public read access to published books"
    ON books FOR SELECT
    USING (published = true);

CREATE POLICY "Allow public read access to all books"
    ON books FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert to books"
    ON books FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update to books"
    ON books FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public delete to books"
    ON books FOR DELETE
    USING (true);

-- سياسات الصفحات
CREATE POLICY "Allow public read access to pages of published books"
    ON pages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = pages.book_id
            AND books.published = true
        )
    );

CREATE POLICY "Allow public read access to all pages"
    ON pages FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert to pages"
    ON pages FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update to pages"
    ON pages FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public delete to pages"
    ON pages FOR DELETE
    USING (true);

-- سياسات رسائل التواصل
CREATE POLICY "Allow public insert to contact messages"
    ON contact_messages FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public read to contact messages"
    ON contact_messages FOR SELECT
    USING (true);

-- ===================================
-- 10. إنشاء دالة لزيادة عدد المشاهدات
-- ===================================
CREATE OR REPLACE FUNCTION increment_book_views(book_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE books
    SET views = views + 1
    WHERE id = book_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================
-- 11. إدراج بيانات تجريبية (اختياري)
-- ===================================
-- يمكنك حذف هذا القسم إذا كنت لا تريد بيانات تجريبية

-- إدراج قسم تجريبي
INSERT INTO categories (name, description) VALUES
    ('الكتب الإسلامية', 'كتب في العلوم الشرعية والدراسات الإسلامية'),
    ('الأدب العربي', 'كتب الأدب والشعر والقصص العربية')
ON CONFLICT DO NOTHING;

-- ملاحظة: يمكنك إضافة المزيد من البيانات التجريبية حسب الحاجة

-- ===================================
-- 12. منح الصلاحيات (Permissions)
-- ===================================
-- تأكد من أن المستخدم المجهول (anon) لديه صلاحيات القراءة
GRANT SELECT ON categories TO anon;
GRANT SELECT ON books TO anon;
GRANT SELECT ON pages TO anon;
GRANT INSERT ON contact_messages TO anon;

-- ===================================
-- تم الانتهاء من إعداد قاعدة البيانات
-- ===================================
