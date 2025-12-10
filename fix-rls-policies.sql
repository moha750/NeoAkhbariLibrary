-- ===================================
-- إصلاح خطأ Infinite Recursion في RLS Policies
-- ===================================
-- نفذ هذا الملف في Supabase SQL Editor لإصلاح الخطأ

-- 1. حذف السياسات القديمة
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;
DROP POLICY IF EXISTS "Admins can manage invitations" ON invitations;

-- 2. إنشاء دالة مساعدة للتحقق من الصلاحيات (بدون infinite recursion)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users u
        INNER JOIN user_roles r ON u.role_id = r.id
        WHERE u.id = auth.uid() AND r.name = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. إنشاء السياسات الجديدة

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
CREATE POLICY "Admins can manage invitations" ON invitations
    FOR ALL USING (is_admin());

-- 4. التحقق من السياسات
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('users', 'invitations')
ORDER BY tablename, policyname;

-- ✅ تم! يجب أن يعمل النظام الآن بدون أخطاء
