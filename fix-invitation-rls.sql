-- ===================================
-- إصلاح RLS Policy للدعوات
-- ===================================
-- نفذ هذا الملف في Supabase SQL Editor

-- 1. حذف السياسة القديمة
DROP POLICY IF EXISTS "Admins can manage invitations" ON invitations;
DROP POLICY IF EXISTS "Anyone can view pending invitations" ON invitations;

-- 2. إنشاء السياسات الجديدة

-- السماح للجميع بقراءة الدعوات المعلقة (للتحقق من الرمز في signup.html)
CREATE POLICY "Anyone can view pending invitations" ON invitations
    FOR SELECT USING (status = 'pending');

-- الإداريون فقط يمكنهم إدارة الدعوات (إنشاء، تحديث، حذف)
CREATE POLICY "Admins can manage invitations" ON invitations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u
            INNER JOIN user_roles r ON u.role_id = r.id
            WHERE u.id = auth.uid() AND r.name = 'admin'
        )
    );

-- 3. التحقق من السياسات
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'invitations'
ORDER BY policyname;

-- ✅ تم! الآن يمكن للمستخدمين غير المسجلين قراءة الدعوات المعلقة
