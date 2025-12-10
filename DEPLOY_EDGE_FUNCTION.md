# 🚀 نشر Edge Function (Supabase Built-in Email)

## ✅ تم التحديث!

Edge Function الآن تستخدم **Supabase Built-in Email** بدلاً من Resend.

---

## 📋 خطوات النشر (5 دقائق)

### الخطوة 1: تثبيت Supabase CLI

#### Windows (PowerShell):
```powershell
# باستخدام Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# أو باستخدام npm
npm install -g supabase
```

#### Mac/Linux:
```bash
# باستخدام Homebrew
brew install supabase/tap/supabase

# أو باستخدام npm
npm install -g supabase
```

---

### الخطوة 2: تسجيل الدخول

```bash
supabase login
```

سيفتح المتصفح لتسجيل الدخول. أدخل بيانات حساب Supabase.

---

### الخطوة 3: ربط المشروع

```bash
supabase link --project-ref yfudytvojcusgemyager
```

**ملاحظة:** `yfudytvojcusgemyager` هو معرف مشروعك من URL Supabase.

---

### الخطوة 4: إعداد متغيرات البيئة (اختياري)

```bash
# إعداد SITE_URL (رابط موقعك)
supabase secrets set SITE_URL=http://127.0.0.1:5500

# للإنتاج، استخدم رابط النطاق الحقيقي:
# supabase secrets set SITE_URL=https://yourdomain.com
```

**ملاحظة:** إذا لم تُعد `SITE_URL`، سيستخدم `http://localhost` افتراضياً.

---

### الخطوة 5: نشر Edge Function

```bash
cd e:\moham\Downloads\books
supabase functions deploy send-invitation
```

**النتيجة المتوقعة:**
```
Deploying Function send-invitation...
✓ Deployed Function send-invitation
Function URL: https://yfudytvojcusgemyager.supabase.co/functions/v1/send-invitation
```

---

## ✅ اختبار

### 1. أرسل دعوة جديدة

```
1. افتح dashboard.html
2. تبويب "فريق العمل"
3. أدخل بريد إلكتروني
4. اضغط "إرسال الدعوة"
```

### 2. تحقق من Console

يجب أن تظهر:

```
✅ تم إنشاء الدعوة بنجاح
🔄 محاولة إرسال البريد الإلكتروني...
📧 محاولة إرسال البريد الإلكتروني...
📋 رابط الدعوة: http://127.0.0.1:5500/signup.html?token=inv_xxxxx
✅ تم إرسال البريد بنجاح عبر Edge Function  ← هذه الرسالة
```

### 3. تحقق من البريد

```
1. افتح صندوق الوارد للبريد المُدعو
2. ابحث عن بريد من Supabase
3. قد يكون في البريد المزعج (أول مرة)
```

---

## 📧 شكل البريد

Supabase سيرسل بريد افتراضي يحتوي على:
- رابط التأكيد
- معلومات الدعوة (من `data`)
- رابط `redirectTo` (signup.html)

**ملاحظة:** يمكنك تخصيص القالب من:
```
Supabase Dashboard → Authentication → Email Templates → Invite user
```

---

## 🎨 تخصيص قالب البريد (اختياري)

### في Supabase Dashboard:

```
1. اذهب إلى: Authentication → Email Templates
2. اختر: "Invite user"
3. عدّل القالب:
```

```html
<h2>دعوة للانضمام إلى المكتبة الرقمية</h2>

<p>مرحباً!</p>

<p>تمت دعوتك للانضمام إلى فريق المكتبة الرقمية.</p>

<p><a href="{{ .ConfirmationURL }}">اضغط هنا لإنشاء حسابك</a></p>

<p>أو انسخ الرابط التالي:</p>
<p>{{ .ConfirmationURL }}</p>
```

**المتغيرات المتاحة:**
- `{{ .ConfirmationURL }}` - رابط التأكيد
- `{{ .Token }}` - رمز التأكيد
- `{{ .SiteURL }}` - رابط الموقع
- `{{ .Email }}` - بريد المستخدم

---

## ⚙️ إعدادات SMTP (اختياري - للإنتاج)

### Supabase Default SMTP:
```
✅ يعمل فوراً
⚠️ محدود: 4 رسائل/ساعة
⚠️ قد يذهب للبريد المزعج
```

### Custom SMTP (موصى به للإنتاج):

```
1. Supabase Dashboard → Authentication → Settings → SMTP
2. فعّل "Enable Custom SMTP"
3. أدخل بيانات SMTP:
   - Host: smtp.gmail.com
   - Port: 587
   - Username: your-email@gmail.com
   - Password: [App Password]
4. احفظ
```

**للحصول على Gmail App Password:**
```
1. https://myaccount.google.com/security
2. فعّل "2-Step Verification"
3. اذهب إلى "App passwords"
4. أنشئ كلمة مرور للتطبيق
```

---

## 🐛 استكشاف الأخطاء

### "Function not found"

**الحل:**
```bash
# تحقق من أن Edge Function منشورة
supabase functions list

# إذا لم تظهر، أعد النشر:
supabase functions deploy send-invitation
```

---

### "Service role key not found"

**الحل:**
```
Edge Function تستخدم SUPABASE_SERVICE_ROLE_KEY تلقائياً.
لا تحتاج إعداد يدوي - Supabase يوفرها تلقائياً.
```

---

### "User already registered"

**الحل:**
```
هذا طبيعي إذا كان البريد مسجل مسبقاً.
Supabase لا يسمح بدعوة مستخدم موجود.
```

---

### البريد لا يصل

**الحل:**
```
1. تحقق من صندوق البريد المزعج
2. تحقق من إعدادات SMTP في Supabase
3. استخدم Custom SMTP للموثوقية
4. تحقق من Logs:
   Supabase Dashboard → Logs → Auth Logs
```

---

## 📊 بعد النشر

### ما سيحدث:

```
1. الإداري يرسل دعوة
   ↓
2. ✅ تُنشأ في قاعدة البيانات
   ↓
3. ✅ Edge Function تُستدعى
   ↓
4. ✅ Supabase Auth يُرسل البريد
   ↓
5. ✅ المدعو يستلم البريد
   ↓
6. ✅ رسالة: "تم إرسال الدعوة بنجاح"
```

---

## 💰 التكلفة

```
✅ مجاني تماماً
✅ مدمج في Supabase
✅ لا حاجة لخدمات خارجية
```

**الحدود:**
- Default SMTP: 4 رسائل/ساعة
- Custom SMTP: حسب مزود SMTP (Gmail: 500/يوم)

---

## 🎯 الخلاصة

### قبل النشر:
```
⚠️ "تم إنشاء الدعوة، لكن البريد غير متاح"
📋 نسخ الرابط يدوياً
```

### بعد النشر:
```
✅ "تم إرسال الدعوة بنجاح إلى user@example.com"
📧 البريد يصل تلقائياً
```

---

## 🔗 روابط مفيدة

- Supabase CLI Docs: https://supabase.com/docs/guides/cli
- Edge Functions Docs: https://supabase.com/docs/guides/functions
- Auth Email Templates: https://supabase.com/docs/guides/auth/auth-email-templates

---

**ابدأ النشر الآن! 🚀**

```bash
supabase login
supabase link --project-ref yfudytvojcusgemyager
supabase functions deploy send-invitation
```
