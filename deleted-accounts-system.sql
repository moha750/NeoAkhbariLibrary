-- ===================================
-- نظام الحسابات المحذوفة
-- ===================================

-- جدول الحسابات المحذوفة
CREATE TABLE IF NOT EXISTS deleted_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role_name VARCHAR(50),
    role_display_name VARCHAR(100),
    invitation_email VARCHAR(255),
    invitation_token VARCHAR(255),
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deletion_reason TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_data JSONB -- لحفظ جميع بيانات المستخدم
);

-- فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_deleted_accounts_email ON deleted_accounts(email);
CREATE INDEX IF NOT EXISTS idx_deleted_accounts_deleted_at ON deleted_accounts(deleted_at);

-- تفعيل RLS
ALTER TABLE deleted_accounts ENABLE ROW LEVEL SECURITY;

-- سياسة للإداريين فقط
CREATE POLICY "Admins can view deleted accounts" ON deleted_accounts
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage deleted accounts" ON deleted_accounts
    FOR ALL USING (is_admin());

-- ===================================
-- دالة لحذف مستخدم ونقله للحسابات المحذوفة
-- ===================================

CREATE OR REPLACE FUNCTION delete_user_with_archive(
    target_user_id UUID,
    deleter_user_id UUID,
    reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    user_record RECORD;
    invitation_record RECORD;
    result JSONB;
BEGIN
    -- جلب بيانات المستخدم
    SELECT 
        u.*,
        r.name as role_name,
        r.display_name as role_display_name
    INTO user_record
    FROM users u
    LEFT JOIN user_roles r ON u.role_id = r.id
    WHERE u.id = target_user_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'المستخدم غير موجود'
        );
    END IF;
    
    -- البحث عن الدعوة المرتبطة بالمستخدم
    SELECT * INTO invitation_record
    FROM invitations
    WHERE email = user_record.email
    AND status = 'accepted'
    ORDER BY accepted_at DESC
    LIMIT 1;
    
    -- حفظ بيانات المستخدم في جدول الحسابات المحذوفة
    INSERT INTO deleted_accounts (
        user_id,
        email,
        full_name,
        role_name,
        role_display_name,
        invitation_email,
        invitation_token,
        deleted_by,
        deletion_reason,
        user_data
    ) VALUES (
        user_record.id,
        user_record.email,
        user_record.full_name,
        user_record.role_name,
        user_record.role_display_name,
        invitation_record.email,
        invitation_record.token,
        deleter_user_id,
        reason,
        jsonb_build_object(
            'is_active', user_record.is_active,
            'last_login', user_record.last_login,
            'created_at', user_record.created_at,
            'updated_at', user_record.updated_at
        )
    );
    
    -- حذف الدعوة المرتبطة (جميع الدعوات بنفس البريد)
    DELETE FROM invitations
    WHERE email = user_record.email;
    
    -- حذف المستخدم (سيتم حذف auth.users تلقائياً بسبب CASCADE)
    DELETE FROM users WHERE id = target_user_id;
    
    -- إرجاع النتيجة
    RETURN jsonb_build_object(
        'success', true,
        'deleted_user', jsonb_build_object(
            'email', user_record.email,
            'full_name', user_record.full_name
        ),
        'deleted_invitations_count', (
            SELECT COUNT(*) 
            FROM invitations 
            WHERE email = user_record.email
        )
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================
-- دالة لاستعادة حساب محذوف (اختياري)
-- ===================================

CREATE OR REPLACE FUNCTION restore_deleted_account(deleted_account_id UUID)
RETURNS JSONB AS $$
DECLARE
    account_record RECORD;
BEGIN
    -- جلب بيانات الحساب المحذوف
    SELECT * INTO account_record
    FROM deleted_accounts
    WHERE id = deleted_account_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'الحساب المحذوف غير موجود'
        );
    END IF;
    
    -- ملاحظة: لا يمكن استعادة auth.users تلقائياً
    -- يجب على المستخدم إنشاء حساب جديد
    
    RETURN jsonb_build_object(
        'success', false,
        'error', 'لا يمكن استعادة الحساب تلقائياً. يجب إرسال دعوة جديدة.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================
-- دالة لحذف حساب محذوف نهائياً
-- ===================================

CREATE OR REPLACE FUNCTION permanently_delete_account(deleted_account_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM deleted_accounts WHERE id = deleted_account_id;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
