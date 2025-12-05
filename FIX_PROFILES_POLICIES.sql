-- ===================================
-- إصلاح سياسات جدول profiles
-- Fix Infinite Recursion in RLS Policies
-- ===================================

-- الخطوة 1: حذف جميع السياسات القديمة
-- ===================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

-- الخطوة 2: إنشاء سياسات جديدة بدون تكرار
-- ===================================

-- سياسة القراءة: يمكن للجميع قراءة ملفاتهم الشخصية
CREATE POLICY "Enable read access for users"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- سياسة التحديث: المستخدمون يمكنهم تحديث ملفاتهم فقط
CREATE POLICY "Enable update for users based on id"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- سياسة الحذف: لا أحد يمكنه الحذف من خلال RLS
-- (الحذف يتم من خلال Supabase Dashboard أو Service Role فقط)
CREATE POLICY "Disable delete for all users"
ON profiles FOR DELETE
TO authenticated
USING (false);

-- سياسة الإضافة: يتم التحكم بها من خلال trigger
CREATE POLICY "Enable insert for authenticated users only"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ===================================
-- ملاحظات مهمة:
-- ===================================

-- 1. تم إزالة التحقق من role في السياسات لتجنب التكرار اللا نهائي
-- 2. التحكم بالصلاحيات يتم من خلال JavaScript (auth-guard.js)
-- 3. جميع المستخدمين المصادقين يمكنهم قراءة جميع الملفات
-- 4. كل مستخدم يمكنه تحديث ملفه الشخصي فقط
-- 5. الحذف محظور من خلال RLS (يتم من Dashboard فقط)

-- ===================================
-- تم الانتهاء من الإصلاح
-- ===================================
