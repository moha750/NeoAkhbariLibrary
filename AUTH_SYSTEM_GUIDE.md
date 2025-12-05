# 🔐 دليل نظام المصادقة والأدوار الشامل

## 📋 نظرة عامة

تم إنشاء نظام مصادقة وأدوار متكامل يشمل:
- ✅ حماية لوحة التحكم
- ✅ نظام تسجيل دخول وخروج
- ✅ أدوار المستخدمين (إداري / محرر)
- ✅ نظام الدعوات عبر البريد الإلكتروني
- ✅ صلاحيات مخصصة لكل دور
- ✅ سجل النشاطات

---

## 🚀 خطوات الإعداد

### الخطوة 1: إعداد قاعدة البيانات

#### 1.1 تشغيل SQL للجداول والسياسات

```sql
-- في Supabase SQL Editor
-- افتح ملف: CREATE_AUTH_SYSTEM.sql
-- انسخ المحتوى كاملاً
-- الصق في SQL Editor
-- اضغط Run
```

هذا سينشئ:
- ✅ جدول `profiles` (الملفات الشخصية)
- ✅ جدول `invitations` (الدعوات)
- ✅ جدول `activity_log` (سجل النشاطات)
- ✅ جميع السياسات الأمنية (RLS Policies)
- ✅ الدوال المساعدة

#### 1.2 تفعيل Email Authentication

```
1. اذهب إلى: Authentication → Providers
2. فعّل Email provider
3. احفظ التغييرات
```

#### 1.3 تكوين Email Templates (اختياري)

```
1. اذهب إلى: Authentication → Email Templates
2. خصص رسائل البريد حسب رغبتك
3. احفظ التغييرات
```

---

### الخطوة 2: إنشاء أول مستخدم إداري

#### الطريقة الأولى: من واجهة Supabase

```
1. اذهب إلى: Authentication → Users
2. اضغط: Add user → Create new user
3. املأ البيانات:
   - Email: admin@yourdomain.com
   - Password: (كلمة مرور قوية)
   - Auto Confirm User: ✅ نعم
4. اضغط: Create user
5. انسخ User ID
```

#### الطريقة الثانية: تحديث الدور في SQL

```sql
-- استبدل 'USER_ID_HERE' بـ ID المستخدم الفعلي
UPDATE profiles 
SET role = 'admin', full_name = 'المدير العام'
WHERE id = 'USER_ID_HERE';
```

---

### الخطوة 3: اختبار تسجيل الدخول

```
1. افتح: login.html
2. أدخل بيانات المستخدم الإداري
3. اضغط: تسجيل الدخول
4. يجب أن يتم التحويل إلى dashboard.html
5. يجب أن ترى معلوماتك في الزاوية العلوية اليسرى
```

---

## 📁 الملفات المضافة

### 1. ملفات SQL

| الملف | الوصف |
|-------|-------|
| `CREATE_AUTH_SYSTEM.sql` | جداول المصادقة والسياسات |

### 2. ملفات HTML

| الملف | الوصف |
|-------|-------|
| `login.html` | صفحة تسجيل الدخول |
| `signup.html` | صفحة التسجيل بالدعوة |

### 3. ملفات JavaScript

| الملف | الوصف |
|-------|-------|
| `auth-guard.js` | نظام حماية لوحة التحكم |
| `supabase-api.js` | (محدث) دوال المصادقة والمستخدمين |

### 4. ملفات التوثيق

| الملف | الوصف |
|-------|-------|
| `AUTH_SYSTEM_GUIDE.md` | هذا الملف - الدليل الشامل |

---

## 🎯 الأدوار والصلاحيات

### 👑 الإداري (Admin)

**الصلاحيات:**
- ✅ الوصول إلى جميع التبويبات
- ✅ إدارة الأقسام
- ✅ إدارة الكتب
- ✅ إدارة الأجزاء
- ✅ إدارة الصفحات
- ✅ نشر/إلغاء نشر الكتب
- ✅ عرض الإحصائيات
- ✅ قراءة الرسائل
- ✅ **إدارة فريق العمل**
- ✅ **إرسال الدعوات**
- ✅ **حذف المستخدمين**

### ✍️ المحرر (Editor)

**الصلاحيات:**
- ✅ الوصول إلى تبويب **الصفحات فقط**
- ✅ إضافة صفحات جديدة
- ✅ تعديل الصفحات
- ✅ حذف الصفحات
- ❌ لا يمكنه إدارة الكتب أو الأقسام
- ❌ لا يمكنه النشر
- ❌ لا يمكنه إدارة المستخدمين

---

## 🔒 كيف يعمل نظام الحماية؟

### 1. عند فتح dashboard.html

```javascript
// auth-guard.js يتم تحميله تلقائياً
1. التحقق من وجود جلسة نشطة
   ↓
2. إذا لا توجد جلسة → التحويل إلى login.html
   ↓
3. جلب بيانات المستخدم
   ↓
4. جلب الملف الشخصي (role)
   ↓
5. تطبيق الصلاحيات حسب الدور
   ↓
6. عرض معلومات المستخدم
   ↓
7. ✅ السماح بالوصول
```

### 2. تطبيق الصلاحيات

```javascript
// للمحرر (Editor)
- إخفاء جميع التبويبات ماعدا "الصفحات"
- إخفاء أزرار التبويبات الأخرى
- التحويل تلقائياً إلى تبويب الصفحات

// للإداري (Admin)
- إظهار جميع التبويبات
- جميع الصلاحيات متاحة
```

### 3. مراقبة الجلسة

```javascript
// إذا تم تسجيل الخروج من أي صفحة
→ التحويل تلقائياً إلى login.html

// إذا انتهت الجلسة
→ التحويل تلقائياً إلى login.html
```

---

## 👥 نظام الدعوات

### إرسال دعوة (للإداريين فقط)

**الخطوات:**
1. اذهب إلى تبويب "فريق العمل"
2. اضغط "إضافة عضو جديد"
3. أدخل البريد الإلكتروني
4. اختر الدور (إداري / محرر)
5. اضغط "إرسال الدعوة"

**ما يحدث:**
```javascript
1. إنشاء سجل في جدول invitations
2. توليد token فريد
3. حفظ تاريخ الانتهاء (7 أيام)
4. إنشاء رابط الدعوة:
   https://yoursite.com/signup.html?token=inv_xxxxx
5. (يدوياً) إرسال الرابط للشخص عبر البريد
```

### قبول الدعوة

**الخطوات:**
1. المستخدم يفتح رابط الدعوة
2. يتم التحقق من صلاحية الدعوة
3. يدخل اسمه الكامل وكلمة المرور
4. يتم إنشاء الحساب تلقائياً
5. تحديث حالة الدعوة إلى "accepted"
6. تسجيل الدخول التلقائي
7. التحويل إلى dashboard.html

---

## 📊 سجل النشاطات

يتم تسجيل جميع الأنشطة المهمة:

```javascript
- تسجيل الدخول (login)
- تسجيل الخروج (logout)
- إنشاء دعوة (create_invitation)
- حذف دعوة (delete_invitation)
- إعادة إرسال دعوة (resend_invitation)
- تحديث ملف شخصي (update_profile)
- حذف مستخدم (delete_user)
```

**عرض السجل:**
```javascript
const log = await api.getActivityLog(50); // آخر 50 نشاط
```

---

## 🔧 الدوال المتاحة في API

### دوال المصادقة

```javascript
// تسجيل الدخول
await api.signIn(email, password);

// تسجيل الخروج
await api.signOut();

// الحصول على المستخدم الحالي
const user = await api.getCurrentUser();

// الحصول على الجلسة
const session = await api.getSession();

// التسجيل بدعوة
await api.signUpWithInvitation(token, password, fullName);
```

### دوال الملفات الشخصية

```javascript
// جلب ملف شخصي
const profile = await api.getProfile(userId);

// جلب جميع المستخدمين (للإداريين)
const users = await api.getAllUsers();

// تحديث ملف شخصي
await api.updateProfile(userId, { full_name: 'اسم جديد' });

// حذف مستخدم (للإداريين)
await api.deleteUser(userId);
```

### دوال الدعوات

```javascript
// إنشاء دعوة (للإداريين)
const invitation = await api.createInvitation(email, role);

// جلب جميع الدعوات
const invitations = await api.getInvitations();

// التحقق من دعوة
const result = await api.verifyInvitation(token);

// حذف دعوة
await api.deleteInvitation(invitationId);

// إعادة إرسال دعوة
await api.resendInvitation(invitationId);
```

### دوال سجل النشاطات

```javascript
// تسجيل نشاط
await api.logActivity('action_name', { details: 'value' });

// جلب سجل النشاطات
const log = await api.getActivityLog(50);
```

---

## 🎨 إضافة تبويب فريق العمل

### الخطوة 1: إضافة زر التبويب

في `dashboard.html`، أضف زر التبويب:

```html
<button class="tab-btn" onclick="switchTab('team')">
    <i class="fas fa-users"></i> فريق العمل
</button>
```

### الخطوة 2: إضافة محتوى التبويب

```html
<!-- Team Tab -->
<div id="team-tab" class="tab-content">
    <div class="form-section">
        <h2 style="color: #667eea; margin-bottom: 20px;">
            <i class="fas fa-users"></i> إدارة فريق العمل
        </h2>

        <!-- نموذج إضافة عضو -->
        <div style="background: white; padding: 25px; border-radius: 10px; margin-bottom: 30px;">
            <h3 style="margin-bottom: 20px;">
                <i class="fas fa-user-plus"></i> إضافة عضو جديد
            </h3>
            <form id="inviteForm" onsubmit="sendInvitation(event)">
                <div class="form-group">
                    <label><i class="fas fa-envelope"></i> البريد الإلكتروني</label>
                    <input type="email" id="inviteEmail" placeholder="example@domain.com" required>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-shield-alt"></i> الدور</label>
                    <select id="inviteRole" required>
                        <option value="">اختر الدور</option>
                        <option value="admin">إداري</option>
                        <option value="editor">محرر</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-paper-plane"></i> إرسال الدعوة
                </button>
            </form>
        </div>

        <!-- قائمة الأعضاء -->
        <h3 style="margin: 20px 0; color: #333;">
            <i class="fas fa-list"></i> الأعضاء الحاليون
        </h3>
        <div id="teamMembersList" class="items-list">
            <div class="loading">
                <i class="fas fa-spinner"></i>
                <p>جاري التحميل...</p>
            </div>
        </div>

        <!-- قائمة الدعوات -->
        <h3 style="margin: 20px 0; color: #333;">
            <i class="fas fa-envelope"></i> الدعوات المرسلة
        </h3>
        <div id="invitationsList" class="items-list">
            <div class="loading">
                <i class="fas fa-spinner"></i>
                <p>جاري التحميل...</p>
            </div>
        </div>
    </div>
</div>
```

### الخطوة 3: إضافة دوال JavaScript

```javascript
// إرسال دعوة
async function sendInvitation(event) {
    event.preventDefault();

    const email = document.getElementById('inviteEmail').value.trim();
    const role = document.getElementById('inviteRole').value;

    if (!email || !role) {
        alert('⚠️ الرجاء إدخال جميع البيانات');
        return;
    }

    try {
        const invitation = await api.createInvitation(email, role);
        
        // إنشاء رابط الدعوة
        const inviteLink = `${window.location.origin}/signup.html?token=${invitation.token}`;
        
        // عرض الرابط للإداري لإرساله يدوياً
        alert(`✅ تم إنشاء الدعوة بنجاح!\n\nالرابط:\n${inviteLink}\n\nقم بإرسال هذا الرابط للشخص عبر البريد الإلكتروني.`);
        
        document.getElementById('inviteForm').reset();
        await loadInvitations();
    } catch (error) {
        console.error('خطأ في إرسال الدعوة:', error);
        alert('❌ حدث خطأ: ' + error.message);
    }
}

// تحميل قائمة الأعضاء
async function loadTeamMembers() {
    try {
        const users = await api.getAllUsers();
        const container = document.getElementById('teamMembersList');

        if (users.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>لا يوجد أعضاء</h3>
                </div>
            `;
            return;
        }

        container.innerHTML = users.map(user => `
            <div class="item-card">
                <div class="item-info">
                    <h3><i class="fas fa-user"></i> ${user.full_name}</h3>
                    <p>
                        <i class="fas fa-envelope"></i> ${user.email}
                        <span style="margin: 0 10px;">|</span>
                        <span class="badge" style="background: ${user.role === 'admin' ? '#667eea' : '#4caf50'}; color: white;">
                            ${user.role === 'admin' ? 'إداري' : 'محرر'}
                        </span>
                    </p>
                </div>
                <div class="item-actions">
                    ${user.id !== authGuard.getCurrentUser().id ? `
                        <button class="btn btn-danger btn-small" onclick="deleteTeamMember('${user.id}', '${user.full_name}')">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    ` : '<span style="color: #999; font-size: 0.9em;">أنت</span>'}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('خطأ في تحميل الأعضاء:', error);
    }
}

// تحميل قائمة الدعوات
async function loadInvitations() {
    try {
        const invitations = await api.getInvitations();
        const container = document.getElementById('invitationsList');

        if (invitations.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-envelope"></i>
                    <h3>لا توجد دعوات</h3>
                </div>
            `;
            return;
        }

        container.innerHTML = invitations.map(inv => {
            const statusText = {
                'pending': 'قيد الانتظار',
                'accepted': 'مقبولة',
                'expired': 'منتهية'
            };

            const statusColor = {
                'pending': '#ff9800',
                'accepted': '#4caf50',
                'expired': '#f44336'
            };

            const isExpired = new Date(inv.expires_at) < new Date();
            const actualStatus = isExpired ? 'expired' : inv.status;

            return `
                <div class="item-card">
                    <div class="item-info">
                        <h3><i class="fas fa-envelope"></i> ${inv.email}</h3>
                        <p>
                            <span class="badge" style="background: ${statusColor[actualStatus]}; color: white;">
                                ${statusText[actualStatus]}
                            </span>
                            <span style="margin: 0 10px;">|</span>
                            <span style="color: #667eea;">
                                ${inv.role === 'admin' ? 'إداري' : 'محرر'}
                            </span>
                            <span style="margin: 0 10px;">|</span>
                            <small style="color: #999;">
                                ${new Date(inv.created_at).toLocaleDateString('ar-EG')}
                            </small>
                        </p>
                    </div>
                    <div class="item-actions">
                        ${inv.status === 'pending' && !isExpired ? `
                            <button class="btn btn-info btn-small" onclick="copyInviteLink('${inv.token}')">
                                <i class="fas fa-copy"></i> نسخ الرابط
                            </button>
                            <button class="btn btn-warning btn-small" onclick="resendInvite('${inv.id}')">
                                <i class="fas fa-redo"></i> إعادة إرسال
                            </button>
                        ` : ''}
                        <button class="btn btn-danger btn-small" onclick="deleteInvite('${inv.id}')">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('خطأ في تحميل الدعوات:', error);
    }
}

// نسخ رابط الدعوة
function copyInviteLink(token) {
    const link = `${window.location.origin}/signup.html?token=${token}`;
    navigator.clipboard.writeText(link).then(() => {
        alert('✅ تم نسخ الرابط!');
    }).catch(err => {
        alert('❌ فشل نسخ الرابط');
    });
}

// إعادة إرسال دعوة
async function resendInvite(invitationId) {
    if (!confirm('هل تريد إعادة إرسال هذه الدعوة؟')) return;

    try {
        await api.resendInvitation(invitationId);
        alert('✅ تم تجديد الدعوة بنجاح');
        await loadInvitations();
    } catch (error) {
        console.error('خطأ في إعادة الإرسال:', error);
        alert('❌ حدث خطأ: ' + error.message);
    }
}

// حذف دعوة
async function deleteInvite(invitationId) {
    if (!confirm('هل تريد حذف هذه الدعوة؟')) return;

    try {
        await api.deleteInvitation(invitationId);
        alert('✅ تم حذف الدعوة');
        await loadInvitations();
    } catch (error) {
        console.error('خطأ في حذف الدعوة:', error);
        alert('❌ حدث خطأ: ' + error.message);
    }
}

// حذف عضو
async function deleteTeamMember(userId, userName) {
    if (!confirm(`هل تريد حذف ${userName} من فريق العمل؟`)) return;

    try {
        await api.deleteUser(userId);
        alert('✅ تم حذف العضو');
        await loadTeamMembers();
    } catch (error) {
        console.error('خطأ في حذف العضو:', error);
        alert('❌ حدث خطأ: ' + error.message);
    }
}

// تحميل البيانات عند فتح التبويب
// أضف هذا في window.addEventListener('load')
await loadTeamMembers();
await loadInvitations();
```

---

## 🧪 الاختبار

### 1. اختبار تسجيل الدخول

```
✅ محاولة الوصول لـ dashboard.html بدون تسجيل دخول
   → يجب التحويل إلى login.html

✅ تسجيل دخول بحساب إداري
   → يجب الوصول إلى جميع التبويبات

✅ تسجيل دخول بحساب محرر
   → يجب رؤية تبويب الصفحات فقط
```

### 2. اختبار الدعوات

```
✅ إرسال دعوة كإداري
   → يجب إنشاء الدعوة بنجاح

✅ فتح رابط الدعوة
   → يجب فتح signup.html مع معلومات الدعوة

✅ إنشاء حساب من الدعوة
   → يجب إنشاء الحساب وتسجيل الدخول تلقائياً

✅ محاولة استخدام نفس الدعوة مرتين
   → يجب رفضها (مقبولة بالفعل)
```

### 3. اختبار الصلاحيات

```
✅ محاولة محرر الوصول لتبويب الكتب
   → يجب أن يكون مخفياً

✅ محاولة محرر حذف مستخدم
   → يجب أن تفشل (RLS Policy)

✅ إداري يحذف محرر
   → يجب أن تنجح
```

---

## 🔧 استكشاف الأخطاء

### المشكلة: لا يمكن تسجيل الدخول

**الحلول:**
1. تأكد من تفعيل Email Auth في Supabase
2. تأكد من تأكيد البريد الإلكتروني
3. تحقق من صحة البيانات
4. افتح Console للأخطاء

### المشكلة: التحويل إلى login.html باستمرار

**الحلول:**
1. تأكد من تحميل `auth-guard.js`
2. تحقق من وجود جلسة في Supabase
3. افتح Console وابحث عن أخطاء
4. تأكد من وجود profile للمستخدم

### المشكلة: المحرر يرى جميع التبويبات

**الحلول:**
1. تأكد من تحميل `auth-guard.js` بعد `supabase-api.js`
2. تحقق من دور المستخدم في جدول profiles
3. افتح Console وتحقق من تطبيق الصلاحيات

### المشكلة: الدعوة لا تعمل

**الحلول:**
1. تأكد من إنشاء جدول invitations
2. تحقق من RLS Policies
3. تأكد من عدم انتهاء صلاحية الدعوة
4. تحقق من token في URL

---

## 📝 ملاحظات مهمة

### 1. إرسال البريد الإلكتروني

حالياً، يتم إنشاء رابط الدعوة ويجب إرساله يدوياً. لإرسال تلقائي:

```javascript
// يمكن استخدام خدمة مثل:
- SendGrid
- Mailgun
- AWS SES
- Supabase Edge Functions
```

### 2. أمان الجلسات

```javascript
// الجلسات تنتهي تلقائياً بعد:
- 1 ساعة (Access Token)
- 7 أيام (Refresh Token)

// يمكن تغيير المدة من:
Supabase Dashboard → Authentication → Settings
```

### 3. حذف المستخدمين

```javascript
// حذف المستخدم من profiles يحذف:
- ✅ السجل من profiles
- ❌ لا يحذف من auth.users

// لحذف كامل، استخدم:
Supabase Dashboard → Authentication → Users → Delete
```

---

## 🎉 الخلاصة

الآن لديك نظام مصادقة وأدوار احترافي يشمل:

- ✅ حماية كاملة للوحة التحكم
- ✅ تسجيل دخول وخروج آمن
- ✅ أدوار مخصصة (إداري / محرر)
- ✅ نظام دعوات متكامل
- ✅ صلاحيات دقيقة لكل دور
- ✅ سجل نشاطات شامل
- ✅ واجهات جميلة وسهلة الاستخدام

استمتع بإدارة فريق عملك بأمان! 🔐✨
