# 🔧 حل مشكلة Row Level Security

## المشكلة
```
✗ خطأ: new row violates row-level security policy
```

## الحل السريع ⚡

### الطريقة 1: تنفيذ ملف الإصلاح (موصى به)

1. افتح **SQL Editor** في Supabase
2. انسخ محتوى ملف `fix-rls-policies.sql`
3. الصقه في SQL Editor
4. اضغط **Run** (Ctrl + Enter)
5. أعد تشغيل `migrate-to-supabase.html`

---

### الطريقة 2: تعطيل RLS مؤقتاً (للتطوير فقط)

في SQL Editor، نفذ:

```sql
-- تعطيل RLS على جميع الجداول
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE books DISABLE ROW LEVEL SECURITY;
ALTER TABLE pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;
```

⚠️ **تحذير**: لا تستخدم هذا في بيئة الإنتاج!

---

### الطريقة 3: إعادة إنشاء قاعدة البيانات

1. احذف الجداول القديمة:
```sql
DROP TABLE IF EXISTS pages CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;
```

2. نفذ `database-setup.sql` المحدث من جديد

---

## التحقق من الحل ✅

بعد تطبيق الحل:

1. افتح `migrate-to-supabase.html`
2. اضغط **بدء النقل**
3. يجب أن ترى:
   ```
   ✓ تم نقل القسم: الكتب الحديثية
   ✓ تم نقل الكتاب: الكافي الشريف
   ```

---

## فهم المشكلة 📚

**Row Level Security (RLS)** هو نظام أمان في PostgreSQL/Supabase يتحكم في:
- من يمكنه قراءة البيانات
- من يمكنه إضافة بيانات
- من يمكنه تعديل البيانات
- من يمكنه حذف البيانات

في الإعداد الأولي، كانت السياسات تسمح فقط بالقراءة، لذا فشلت عمليات الإدخال.

---

## للإنتاج 🔒

في بيئة الإنتاج، يُفضل تقييد الصلاحيات:

```sql
-- مثال: السماح بالإضافة فقط للمستخدمين المسجلين
CREATE POLICY "Authenticated users can insert books"
    ON books
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
```

---

## موارد إضافية

- [Row Level Security - Supabase Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
