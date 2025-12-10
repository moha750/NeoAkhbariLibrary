-- ===================================
-- إصلاح سياسات RLS لجميع الجداول
-- ===================================

-- 1. حذف جميع السياسات القديمة
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

DROP POLICY IF EXISTS "Anyone can view pending invitations" ON invitations;
DROP POLICY IF EXISTS "Admins can manage invitations" ON invitations;

DROP POLICY IF EXISTS "Everyone can view roles" ON user_roles;

DROP POLICY IF EXISTS "Admins can view deleted accounts" ON deleted_accounts;
DROP POLICY IF EXISTS "Admins can manage deleted accounts" ON deleted_accounts;

DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;

DROP POLICY IF EXISTS "Anyone can view published books" ON books;
DROP POLICY IF EXISTS "Admins can manage books" ON books;

DROP POLICY IF EXISTS "Anyone can view parts of published books" ON parts;
DROP POLICY IF EXISTS "Admins can manage parts" ON parts;

DROP POLICY IF EXISTS "Anyone can view pages of published books" ON pages;
DROP POLICY IF EXISTS "Admins can manage pages" ON pages;

DROP POLICY IF EXISTS "Anyone can submit messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can view messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can manage messages" ON contact_messages;

DROP POLICY IF EXISTS "Anyone can track visits" ON visitors;
DROP POLICY IF EXISTS "Admins can view visitors" ON visitors;

-- ===================================
-- 2. إنشاء السياسات الجديدة
-- ===================================

-- سياسات جدول users
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can insert users" ON users
    FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id OR is_admin());

CREATE POLICY "Admins can delete users" ON users
    FOR DELETE USING (is_admin());

-- سياسات جدول invitations
CREATE POLICY "Anyone can view pending invitations" ON invitations
    FOR SELECT USING (status = 'pending');

CREATE POLICY "Admins can manage invitations" ON invitations
    FOR ALL USING (is_admin());

-- سياسات جدول user_roles
CREATE POLICY "Everyone can view roles" ON user_roles
    FOR SELECT USING (true);

-- سياسات جدول deleted_accounts
CREATE POLICY "Admins can view deleted accounts" ON deleted_accounts
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage deleted accounts" ON deleted_accounts
    FOR ALL USING (is_admin());

-- سياسات جدول categories
CREATE POLICY "Anyone can view categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (is_admin());

-- سياسات جدول books
CREATE POLICY "Anyone can view published books" ON books
    FOR SELECT USING (published = true OR is_admin());

CREATE POLICY "Admins can manage books" ON books
    FOR ALL USING (is_admin());

-- سياسات جدول parts
CREATE POLICY "Anyone can view parts of published books" ON parts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM books b 
            WHERE b.id = parts.book_id 
            AND (b.published = true OR is_admin())
        )
    );

CREATE POLICY "Admins can manage parts" ON parts
    FOR ALL USING (is_admin());

-- سياسات جدول pages
CREATE POLICY "Anyone can view pages of published books" ON pages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM books b 
            WHERE b.id = pages.book_id 
            AND (b.published = true OR is_admin())
        )
    );

CREATE POLICY "Admins can manage pages" ON pages
    FOR ALL USING (is_admin());

-- سياسات جدول contact_messages
CREATE POLICY "Anyone can submit messages" ON contact_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view messages" ON contact_messages
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage messages" ON contact_messages
    FOR ALL USING (is_admin());

-- سياسات جدول visitors
CREATE POLICY "Anyone can track visits" ON visitors
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view visitors" ON visitors
    FOR SELECT USING (is_admin());

-- ===================================
-- 3. التحقق من تفعيل RLS
-- ===================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE deleted_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- ===================================
-- 4. عرض السياسات الحالية
-- ===================================

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
