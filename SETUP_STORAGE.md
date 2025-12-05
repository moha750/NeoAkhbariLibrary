# إعداد Storage لرفع صور الأغلفة

## 📦 نظرة عامة

تم تحديث النظام ليستخدم رفع الصور مباشرة بدلاً من إدخال روابط خارجية.

## 🚀 خطوات الإعداد في Supabase

### الخطوة 1: إنشاء Storage Bucket

1. افتح لوحة تحكم Supabase
2. اذهب إلى **Storage** من القائمة الجانبية
3. اضغط على **Create a new bucket**
4. أدخل المعلومات التالية:
   - **Name**: `book-covers`
   - **Public bucket**: ✅ نعم (حدد هذا الخيار)
   - **File size limit**: 5 MB (اختياري)
   - **Allowed MIME types**: `image/*` (اختياري)
5. اضغط على **Create bucket**

### الخطوة 2: تعيين سياسات الوصول (Policies)

بعد إنشاء الـ bucket، نحتاج إلى تعيين سياسات للسماح برفع وقراءة الصور.

#### الطريقة الأولى: استخدام SQL Editor (الأسهل)

1. اذهب إلى **SQL Editor** في Supabase
2. افتح ملف `CREATE_STORAGE_POLICIES.sql`
3. انسخ محتوى الملف بالكامل
4. الصق في SQL Editor
5. اضغط على **Run**
6. ✅ تم! جميع السياسات تم إنشاؤها

#### الطريقة الثانية: من واجهة Storage (يدوياً)

**سياسة القراءة:**
1. اذهب إلى **Storage** > **Policies**
2. اضغط على **New Policy**
3. اختر **For full customization**
4. املأ الحقول:
   ```
   Policy name: Public Read Access
   Policy definition (USING): bucket_id = 'book-covers'
   Allowed operation: SELECT
   Target roles: public
   ```
5. اضغط **Review** ثم **Save**

**سياسة الرفع:**
1. اضغط على **New Policy**
2. اختر **For full customization**
3. املأ الحقول:
   ```
   Policy name: Public Upload Access
   Policy definition (WITH CHECK): bucket_id = 'book-covers'
   Allowed operation: INSERT
   Target roles: public
   ```
4. اضغط **Review** ثم **Save**

**سياسة الحذف:**
1. اضغط على **New Policy**
2. اختر **For full customization**
3. املأ الحقول:
   ```
   Policy name: Public Delete Access
   Policy definition (USING): bucket_id = 'book-covers'
   Allowed operation: DELETE
   Target roles: public
   ```
4. اضغط **Review** ثم **Save**

### الخطوة 3: التحقق من الإعداد

1. اذهب إلى لوحة التحكم في موقعك
2. حاول إضافة كتاب جديد
3. اختر صورة غلاف
4. إذا تم الرفع بنجاح، ستظهر رسالة: ✅ تم إضافة الكتاب بنجاح

## 📋 الكود المستخدم

### في `supabase-api.js`:

```javascript
async uploadBookCover(file, bookId) {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${bookId}-${Date.now()}.${fileExt}`;
        const filePath = `book-covers/${fileName}`;

        const { data, error } = await this.supabase.storage
            .from('book-covers')
            .upload(filePath, file);

        if (error) throw error;

        // الحصول على URL العام للصورة
        const { data: urlData } = this.supabase.storage
            .from('book-covers')
            .getPublicUrl(filePath);

        return urlData.publicUrl;
    } catch (error) {
        console.error('خطأ في رفع الصورة:', error);
        throw error;
    }
}
```

### في `dashboard.html`:

```javascript
// رفع صورة الغلاف
const coverUrl = await api.uploadBookCover(coverFile, newBook.id);

// تحديث الكتاب برابط الصورة
await api.updateBook(newBook.id, { cover_image: coverUrl });
```

## ✨ المميزات الجديدة

### 1. حقل رفع الصورة
- **نوع الحقل**: `<input type="file">`
- **القبول**: صور فقط (`accept="image/*"`)
- **إجباري**: نعم (`required`)
- **رسالة توضيحية**: يُفضل استخدام صور بحجم 800x1200 بكسل

### 2. التحقق من الصورة

**الصيغ المسموحة:**
- ✅ JPEG / JPG
- ✅ PNG
- ✅ WEBP
- ✅ GIF

**الحجم الأقصى:**
- 📏 5 ميجابايت

### 3. سير العمل

```
1. المستخدم يختار صورة
   ↓
2. التحقق من الصيغة والحجم
   ↓
3. إنشاء الكتاب في قاعدة البيانات
   ↓
4. رفع الصورة إلى Supabase Storage
   ↓
5. تحديث الكتاب برابط الصورة
   ↓
6. ✅ تم بنجاح!
```

## 🎨 التصميم

### CSS للحقل:

```css
.form-group input[type="file"] {
    padding: 10px;
    cursor: pointer;
    background: #f8f9fa;
}

.form-group input[type="file"]:hover {
    background: #e9ecef;
    border-color: #667eea;
}
```

### HTML للحقل:

```html
<div class="form-group">
    <label>
        <i class="fas fa-image"></i> صورة الغلاف 
        <span style="color: red;">*</span>
    </label>
    <input type="file" id="bookCover" accept="image/*" required>
    <small style="color: #666; display: block; margin-top: 5px;">
        <i class="fas fa-info-circle"></i> 
        يُفضل استخدام صور بحجم 800x1200 بكسل
    </small>
</div>
```

## 🔒 الأمان

### سياسات RLS (Row Level Security):

يمكنك تحسين الأمان بتقييد الرفع للمستخدمين المصرح لهم فقط:

```sql
-- سياسة رفع للمصرح لهم فقط
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'book-covers');

-- سياسة قراءة للجميع
CREATE POLICY "Anyone can view"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'book-covers');
```

## 📊 إدارة الملفات

### عرض الملفات المرفوعة:

1. اذهب إلى **Storage** > **book-covers**
2. ستجد جميع الصور المرفوعة
3. يمكنك:
   - 👁️ معاينة الصورة
   - 📥 تحميل الصورة
   - 🗑️ حذف الصورة
   - 📋 نسخ الرابط

### تنظيف الملفات القديمة:

يمكنك إنشاء دالة لحذف الصور القديمة عند حذف الكتاب:

```javascript
async deleteBook(id) {
    // جلب معلومات الكتاب
    const book = await this.getBookById(id);
    
    // حذف صورة الغلاف إذا كانت موجودة
    if (book.cover_image) {
        await this.deleteBookCover(book.cover_image);
    }
    
    // حذف الكتاب
    await this.supabase
        .from('books')
        .delete()
        .eq('id', id);
}
```

## 🐛 استكشاف الأخطاء

### المشكلة: خطأ في رفع الصورة

**الحلول:**
1. تأكد من إنشاء bucket باسم `book-covers`
2. تأكد من تفعيل "Public bucket"
3. تأكد من إضافة سياسات الوصول
4. تحقق من Console للأخطاء

### المشكلة: الصورة لا تظهر

**الحلول:**
1. تحقق من أن الـ bucket عام (Public)
2. تحقق من رابط الصورة في قاعدة البيانات
3. افتح رابط الصورة مباشرة في المتصفح
4. تحقق من سياسة القراءة (SELECT)

### المشكلة: حجم الملف كبير

**الحلول:**
1. ضغط الصورة قبل الرفع
2. استخدام أدوات مثل TinyPNG
3. تغيير الحد الأقصى في الكود (حالياً 5MB)

## 📱 التوافق

النظام يعمل على:
- ✅ جميع المتصفحات الحديثة
- ✅ الموبايل والتابلت
- ✅ أنظمة Windows, Mac, Linux
- ✅ أنظمة Android, iOS

## 🎉 الخلاصة

الآن لديك نظام احترافي لرفع صور الأغلفة:
- ✅ رفع مباشر من الجهاز
- ✅ التحقق من الصيغة والحجم
- ✅ تخزين آمن في Supabase
- ✅ روابط عامة للصور
- ✅ واجهة سهلة الاستخدام

استمتع بإضافة كتبك مع صور أغلفة جميلة! 📚✨
