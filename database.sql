-- ===================================
-- نظام المصادقة والأدوار
-- ===================================

-- جدول الأدوار (Roles)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- إدراج الأدوار الافتراضية
INSERT INTO user_roles (name, display_name, description, permissions) VALUES
('admin', 'إداري', 'صلاحيات كاملة لجميع أقسام لوحة التحكم', '{"all": true}'),
('editor', 'محرر', 'صلاحيات محدودة للمحتوى فقط', '{"content": true, "pages": true}')
ON CONFLICT (name) DO NOTHING;

-- جدول المستخدمين (Users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role_id UUID REFERENCES user_roles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- جدول الدعوات (Invitations)
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    role_id UUID REFERENCES user_roles(id) ON DELETE CASCADE,
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, expired
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_pending_invitation UNIQUE (email, status)
);

-- ===================================
-- الجداول الموجودة (من النظام الحالي)
-- ===================================

-- جدول الأقسام
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- جدول الكتب
CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    cover_url TEXT,
    published BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- جدول الأجزاء
CREATE TABLE IF NOT EXISTS parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    part_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(book_id, part_number)
);

-- جدول الصفحات
CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    part_id UUID REFERENCES parts(id) ON DELETE SET NULL,
    page_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

 CREATE EXTENSION IF NOT EXISTS btree_gist;

 CREATE TABLE IF NOT EXISTS chapters (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
     part_id UUID REFERENCES parts(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     page_start INTEGER NOT NULL,
     page_end INTEGER NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
     CONSTRAINT chapters_page_range_valid CHECK (page_start <= page_end)
 );

 CREATE OR REPLACE FUNCTION book_has_parts(book_uuid UUID)
 RETURNS BOOLEAN AS $$
 BEGIN
     RETURN EXISTS (
         SELECT 1 FROM parts p WHERE p.book_id = book_uuid
     );
 END;
 $$ LANGUAGE plpgsql;

 CREATE OR REPLACE FUNCTION enforce_chapter_consistency()
 RETURNS TRIGGER AS $$
 DECLARE
     has_parts BOOLEAN;
     book_min_page INTEGER;
     book_max_page INTEGER;
     part_min_page INTEGER;
     part_max_page INTEGER;
     chapter_part_book UUID;
 BEGIN
     has_parts := book_has_parts(NEW.book_id);

     IF has_parts AND NEW.part_id IS NULL THEN
         RAISE EXCEPTION 'part_id is required for chapters when the book has parts';
     END IF;

     IF (NOT has_parts) AND NEW.part_id IS NOT NULL THEN
         RAISE EXCEPTION 'part_id must be NULL for chapters when the book has no parts';
     END IF;

     IF NEW.part_id IS NOT NULL THEN
         SELECT p.book_id INTO chapter_part_book
         FROM parts p
         WHERE p.id = NEW.part_id;

         IF chapter_part_book IS NULL THEN
             RAISE EXCEPTION 'part_id does not exist';
         END IF;

         IF chapter_part_book <> NEW.book_id THEN
             RAISE EXCEPTION 'part_id does not belong to the given book_id';
         END IF;
     END IF;

     SELECT MIN(pg.page_number), MAX(pg.page_number)
     INTO book_min_page, book_max_page
     FROM pages pg
     WHERE pg.book_id = NEW.book_id;

     IF NEW.part_id IS NOT NULL THEN
         SELECT MIN(pg.page_number), MAX(pg.page_number)
         INTO part_min_page, part_max_page
         FROM pages pg
         WHERE pg.book_id = NEW.book_id
         AND pg.part_id = NEW.part_id;

         IF part_min_page IS NOT NULL THEN
             IF NEW.page_start < part_min_page OR NEW.page_end > part_max_page THEN
                 RAISE EXCEPTION 'chapter page range is outside the part page range';
             END IF;
         END IF;
     END IF;

     IF book_min_page IS NOT NULL THEN
         IF NEW.page_start < book_min_page OR NEW.page_end > book_max_page THEN
             RAISE EXCEPTION 'chapter page range is outside the book page range';
         END IF;
     END IF;

     RETURN NEW;
 END;
 $$ LANGUAGE plpgsql;

 DROP TRIGGER IF EXISTS trg_chapters_enforce_consistency ON chapters;
 CREATE TRIGGER trg_chapters_enforce_consistency
     BEFORE INSERT OR UPDATE ON chapters
     FOR EACH ROW
     EXECUTE FUNCTION enforce_chapter_consistency();

 DO $$
 BEGIN
     IF NOT EXISTS (
         SELECT 1 FROM pg_constraint WHERE conname = 'chapters_no_overlap'
     ) THEN
         ALTER TABLE chapters
             ADD CONSTRAINT chapters_no_overlap
             EXCLUDE USING gist (
                 book_id WITH =,
                 (COALESCE(part_id, '00000000-0000-0000-0000-000000000000'::uuid)) WITH =,
                 int4range(page_start, page_end, '[]') WITH &&
             );
     END IF;
 END $$;

-- جدول رسائل التواصل
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- جدول الزوار
CREATE TABLE IF NOT EXISTS visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id VARCHAR(255) NOT NULL,
    is_returning BOOLEAN DEFAULT false,
    country VARCHAR(100),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    screen_resolution VARCHAR(50),
    language VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===================================
-- الفهارس (Indexes)
-- ===================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_published ON books(published);
CREATE INDEX IF NOT EXISTS idx_parts_book ON parts(book_id);
CREATE INDEX IF NOT EXISTS idx_pages_book ON pages(book_id);
CREATE INDEX IF NOT EXISTS idx_pages_part ON pages(part_id);
 CREATE INDEX IF NOT EXISTS idx_chapters_book_part ON chapters(book_id, part_id);
 CREATE INDEX IF NOT EXISTS idx_chapters_book_range ON chapters(book_id, page_start, page_end);

-- ===================================
-- الدوال (Functions)
-- ===================================

-- دالة لزيادة عدد المشاهدات
CREATE OR REPLACE FUNCTION increment_book_views(book_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE books SET views = views + 1 WHERE id = book_uuid;
END;
$$ LANGUAGE plpgsql;

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===================================
-- المحفزات (Triggers)
-- ===================================

-- محفز لتحديث updated_at في جدول users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- محفز لتحديث updated_at في جدول books
DROP TRIGGER IF EXISTS update_books_updated_at ON books;
CREATE TRIGGER update_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- محفز لتحديث updated_at في جدول pages
DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
CREATE TRIGGER update_pages_updated_at
    BEFORE UPDATE ON pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

 DROP TRIGGER IF EXISTS update_chapters_updated_at ON chapters;
 CREATE TRIGGER update_chapters_updated_at
     BEFORE UPDATE ON chapters
     FOR EACH ROW
     EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- دوال مساعدة للسياسات
-- ===================================

-- دالة للتحقق من كون المستخدم إداري (بدون infinite recursion)
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

-- ===================================
-- سياسات الأمان (RLS Policies)
-- ===================================

-- حذف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;
DROP POLICY IF EXISTS "Anyone can view pending invitations" ON invitations;
DROP POLICY IF EXISTS "Admins can manage invitations" ON invitations;
DROP POLICY IF EXISTS "Everyone can view roles" ON user_roles;

-- تفعيل RLS على الجداول
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- سياسات جدول users
-- السماح للجميع بقراءة بياناتهم الخاصة
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

-- السماح للإداريين بقراءة جميع المستخدمين
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (is_admin());

-- السماح للإداريين بإضافة مستخدمين
CREATE POLICY "Admins can insert users" ON users
    FOR INSERT WITH CHECK (is_admin());

-- السماح للمستخدمين بتحديث بياناتهم والإداريين بتحديث الجميع
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id OR is_admin());

-- السماح للإداريين فقط بحذف المستخدمين
CREATE POLICY "Admins can delete users" ON users
    FOR DELETE USING (is_admin());

-- سياسات جدول invitations
-- السماح للجميع بقراءة الدعوات المعلقة (للتحقق من الرمز)
CREATE POLICY "Anyone can view pending invitations" ON invitations
    FOR SELECT USING (status = 'pending');

-- الإداريون فقط يمكنهم إدارة الدعوات (إنشاء، تحديث، حذف)
CREATE POLICY "Admins can manage invitations" ON invitations
    FOR ALL USING (is_admin());

-- سياسات جدول user_roles
CREATE POLICY "Everyone can view roles" ON user_roles
    FOR SELECT USING (true);

-- ===================================
-- دالة للتحقق من الصلاحيات
-- ===================================

CREATE OR REPLACE FUNCTION check_user_permission(user_id UUID, permission_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    has_permission BOOLEAN;
BEGIN
    SELECT 
        CASE 
            WHEN r.permissions->>'all' = 'true' THEN true
            WHEN r.permissions->>permission_key = 'true' THEN true
            ELSE false
        END INTO has_permission
    FROM users u
    INNER JOIN user_roles r ON u.role_id = r.id
    WHERE u.id = user_id AND u.is_active = true;
    
    RETURN COALESCE(has_permission, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================
-- دالة لإنشاء مستخدم جديد من دعوة
-- ===================================

CREATE OR REPLACE FUNCTION accept_invitation(invitation_token TEXT, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    invitation_record RECORD;
BEGIN
    -- البحث عن الدعوة
    SELECT * INTO invitation_record
    FROM invitations
    WHERE token = invitation_token
    AND status = 'pending'
    AND expires_at > CURRENT_TIMESTAMP;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- تحديث حالة الدعوة
    UPDATE invitations
    SET status = 'accepted',
        accepted_at = CURRENT_TIMESTAMP
    WHERE id = invitation_record.id;
    
    -- إنشاء سجل المستخدم
    INSERT INTO users (id, email, role_id, is_active)
    VALUES (user_id, invitation_record.email, invitation_record.role_id, true)
    ON CONFLICT (id) DO UPDATE
    SET role_id = invitation_record.role_id,
        email = invitation_record.email;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================
-- دالة لإنشاء أول مستخدم إداري
-- ===================================

CREATE OR REPLACE FUNCTION create_first_admin(admin_email TEXT, admin_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    admin_role_id UUID;
    user_count INTEGER;
BEGIN
    -- التحقق من عدم وجود مستخدمين
    SELECT COUNT(*) INTO user_count FROM users;
    
    IF user_count > 0 THEN
        RETURN false;
    END IF;
    
    -- الحصول على role_id للإداري
    SELECT id INTO admin_role_id FROM user_roles WHERE name = 'admin';
    
    -- إنشاء المستخدم الإداري
    INSERT INTO users (id, email, role_id, is_active)
    VALUES (admin_user_id, admin_email, admin_role_id, true);
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
