-- ===================================
-- حذف المستخدمين الذين تم إنشاؤهم عبر inviteUserByEmail
-- ===================================
-- نفذ هذا الملف في Supabase SQL Editor

-- 1. عرض المستخدمين الذين تم دعوتهم ولكن لم يكملوا التسجيل
SELECT 
    au.id,
    au.email,
    au.created_at,
    au.confirmed_at,
    u.id as user_profile_id
FROM auth.users au
LEFT JOIN users u ON u.id = au.id
WHERE au.email IN (
    SELECT email FROM invitations WHERE status = 'pending'
)
ORDER BY au.created_at DESC;

-- 2. حذف المستخدمين من auth.users (سيحذف من users تلقائياً بسبب CASCADE)
-- ⚠️ تأكد من المستخدمين قبل الحذف!
DELETE FROM auth.users
WHERE email IN (
    SELECT email FROM invitations WHERE status = 'pending'
)
AND confirmed_at IS NULL;  -- فقط المستخدمين غير المؤكدين

-- 3. إعادة تعيين حالة الدعوات إلى pending
UPDATE invitations
SET status = 'pending',
    accepted_at = NULL
WHERE status = 'accepted'
AND email NOT IN (
    SELECT email FROM auth.users WHERE confirmed_at IS NOT NULL
);

-- ✅ تم! الآن يمكن للمستخدمين التسجيل من جديد
