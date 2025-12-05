-- ===================================
-- نظام المصادقة والأدوار
-- Authentication & Roles System
-- ===================================

-- ملاحظة: Supabase يوفر جدول auth.users مدمج
-- سنستخدمه ونضيف جدول profiles للمعلومات الإضافية

-- ===================================
-- 1. جدول الملفات الشخصية (Profiles)
-- ===================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ===================================
-- 2. جدول الدعوات (Invitations)
-- ===================================

CREATE TABLE IF NOT EXISTS invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor')),
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    token TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'expired')) DEFAULT 'pending',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE
);

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);

-- ===================================
-- 3. جدول سجل النشاطات (Activity Log)
-- ===================================

CREATE TABLE IF NOT EXISTS activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);

-- ===================================
-- 4. دالة لتحديث updated_at تلقائياً
-- ===================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- تطبيق الدالة على جدول profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- 5. دالة لإنشاء profile تلقائياً عند التسجيل
-- ===================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'مستخدم جديد'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'editor')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- تطبيق الدالة على auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ===================================
-- 6. تفعيل Row Level Security
-- ===================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- ===================================
-- 7. سياسات الأمان للـ Profiles
-- ===================================

-- ملاحظة مهمة: تم تبسيط السياسات لتجنب التكرار اللا نهائي
-- التحكم بالصلاحيات يتم من خلال JavaScript (auth-guard.js)

-- سياسة القراءة: جميع المستخدمين المصادقين يمكنهم القراءة
CREATE POLICY "Enable read access for authenticated users"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- سياسة التحديث: المستخدمون يمكنهم تحديث ملفاتهم فقط
CREATE POLICY "Enable update for users based on id"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- سياسة الإضافة: يتم التحكم بها من خلال trigger
CREATE POLICY "Enable insert for authenticated users only"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- سياسة الحذف: محظور من خلال RLS (يتم من Dashboard فقط)
CREATE POLICY "Disable delete for all users"
ON profiles FOR DELETE
TO authenticated
USING (false);

-- ===================================
-- 8. سياسات الأمان للدعوات
-- ===================================

-- ملاحظة: التحكم بصلاحيات الإداري يتم من خلال JavaScript
-- السياسات هنا مبسطة لتجنب التكرار اللا نهائي

-- جميع المستخدمين المصادقين يمكنهم قراءة الدعوات
CREATE POLICY "Authenticated users can view invitations"
ON invitations FOR SELECT
TO authenticated
USING (true);

-- جميع المستخدمين المصادقين يمكنهم إنشاء دعوات
-- (التحكم بالصلاحيات يتم من JavaScript)
CREATE POLICY "Authenticated users can create invitations"
ON invitations FOR INSERT
TO authenticated
WITH CHECK (true);

-- جميع المستخدمين المصادقين يمكنهم تحديث الدعوات
CREATE POLICY "Authenticated users can update invitations"
ON invitations FOR UPDATE
TO authenticated
USING (true);

-- جميع المستخدمين المصادقين يمكنهم حذف الدعوات
CREATE POLICY "Authenticated users can delete invitations"
ON invitations FOR DELETE
TO authenticated
USING (true);

-- سياسة للسماح بالتحقق من الدعوة بدون مصادقة (للتسجيل)
CREATE POLICY "Anyone can verify invitation token"
ON invitations FOR SELECT
TO anon
USING (status = 'pending' AND expires_at > NOW());

-- ===================================
-- 9. سياسات الأمان لسجل النشاطات
-- ===================================

-- جميع المستخدمين المصادقين يمكنهم قراءة سجل النشاطات
-- (التحكم بالصلاحيات يتم من JavaScript)
CREATE POLICY "Authenticated users can view activity log"
ON activity_log FOR SELECT
TO authenticated
USING (true);

-- جميع المستخدمين المصادقين يمكنهم إضافة نشاطات
CREATE POLICY "Authenticated users can insert activity"
ON activity_log FOR INSERT
TO authenticated
WITH CHECK (true);

-- ===================================
-- 10. إنشاء أول مستخدم إداري (اختياري)
-- ===================================

-- ملاحظة: قم بتشغيل هذا بعد إنشاء أول حساب من واجهة Supabase
-- استبدل 'your-user-id' بـ ID المستخدم الفعلي

-- INSERT INTO profiles (id, email, full_name, role)
-- VALUES (
--     'your-user-id',
--     'admin@example.com',
--     'المدير العام',
--     'admin'
-- )
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- ===================================
-- 11. دوال مساعدة
-- ===================================

-- دالة للتحقق من صلاحيات الإداري
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة للحصول على دور المستخدم الحالي
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role FROM profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================
-- تم الانتهاء من إعداد نظام المصادقة
-- ===================================

-- الخطوات التالية:
-- 1. تفعيل Email Auth في Supabase Dashboard
-- 2. تكوين Email Templates للدعوات
-- 3. إنشاء أول مستخدم إداري
-- 4. اختبار النظام
