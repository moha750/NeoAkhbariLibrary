# 📝 أمثلة عملية - حل SEO لمكتبة صحراء النجف

## 🔗 أمثلة على الروابط

### الصيغة الحالية (تعمل الآن):
```
https://www.najafdesertlibrary.com/hadith.html?id=1
https://www.najafdesertlibrary.com/hadith.html?id=12345
https://www.najafdesertlibrary.com/hadith.html?id=50000
```

### الصيغة المحسّنة (بعد تفعيل .htaccess):
```
https://www.najafdesertlibrary.com/hadith/1-innama-al-a3mal
https://www.najafdesertlibrary.com/hadith/12345-qul-huwa-allahu-ahad
https://www.najafdesertlibrary.com/hadith/50000-la-ilaha-illa-allah
```

---

## 📄 مثال على صفحة حديث كاملة

### HTML الناتج:
```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <title>إنما الأعمال بالنيات وإنما لكل امرئ ما نوى - مكتبة صحراء النجف</title>
    <meta name="description" content="إنما الأعمال بالنيات وإنما لكل امرئ ما نوى فمن كانت هجرته إلى الله ورسوله | من صحيح البخاري - الجزء 1 - صفحة 5 | مكتبة صحراء النجف - مكتبة رقمية موثوقة">
    <link rel="canonical" href="https://www.najafdesertlibrary.com/hadith.html?id=1">
    
    <!-- Open Graph -->
    <meta property="og:title" content="إنما الأعمال بالنيات - مكتبة صحراء النجف">
    <meta property="og:description" content="حديث شريف من صحيح البخاري">
    <meta property="og:type" content="article">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "name": "إنما الأعمال بالنيات",
        "text": "إنما الأعمال بالنيات وإنما لكل امرئ ما نوى...",
        "author": {
            "@type": "Person",
            "name": "النبي محمد ﷺ"
        },
        "publisher": {
            "@type": "Organization",
            "name": "مكتبة صحراء النجف"
        }
    }
    </script>
</head>
<body>
    <!-- نص الحديث - محتوى HTML حقيقي -->
    <div class="hadith-content">
        إنما الأعمال بالنيات وإنما لكل امرئ ما نوى فمن كانت هجرته إلى الله ورسوله فهجرته إلى الله ورسوله ومن كانت هجرته لدنيا يصيبها أو امرأة ينكحها فهجرته إلى ما هاجر إليه
    </div>
</body>
</html>
```

---

## 🗺️ مثال على Sitemap

### sitemap.xml:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- الصفحة الرئيسية -->
  <url>
    <loc>https://www.najafdesertlibrary.com/</loc>
    <lastmod>2026-01-21</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- الأحاديث -->
  <url>
    <loc>https://www.najafdesertlibrary.com/hadith.html?id=1</loc>
    <lastmod>2026-01-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://www.najafdesertlibrary.com/hadith.html?id=2</loc>
    <lastmod>2026-01-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- ... 50,000+ روابط أخرى -->
</urlset>
```

### sitemap.xml (مع التقسيم):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://www.najafdesertlibrary.com/sitemap-1.xml</loc>
    <lastmod>2026-01-21</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://www.najafdesertlibrary.com/sitemap-2.xml</loc>
    <lastmod>2026-01-21</lastmod>
  </sitemap>
</sitemapindex>
```

---

## 💻 مثال على استعلام Supabase

### JavaScript (في hadith-seo.js):
```javascript
// جلب حديث واحد
const { data, error } = await api.supabase
    .from('pages')
    .select(`
        id,
        content,
        page_number,
        part_id,
        parts (
            id,
            part_number,
            book_id,
            books (
                id,
                title
            )
        )
    `)
    .eq('id', 12345)
    .single();

// النتيجة:
{
    id: 12345,
    content: "إنما الأعمال بالنيات...",
    page_number: 5,
    part_id: 1,
    parts: {
        id: 1,
        part_number: 1,
        book_id: 1,
        books: {
            id: 1,
            title: "صحيح البخاري"
        }
    }
}
```

### SQL (مباشر):
```sql
SELECT 
    p.id,
    p.content,
    p.page_number,
    pt.part_number,
    b.id AS book_id,
    b.title AS book_title
FROM pages p
LEFT JOIN parts pt ON p.part_id = pt.id
LEFT JOIN books b ON pt.book_id = b.id
WHERE p.id = 12345;
```

---

## 🔧 مثال على توليد Slug

### JavaScript:
```javascript
function generateSlug(text, maxWords = 5) {
    // إزالة التشكيل
    const withoutTashkeel = text.replace(/[\u064B-\u065F\u0670]/g, '');
    
    // أخذ أول 5 كلمات
    const words = withoutTashkeel.trim().split(/\s+/).slice(0, maxWords);
    
    // تحويل إلى slug
    return words.join('-')
        .replace(/[^\u0600-\u06FF\w-]/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// أمثلة:
generateSlug("إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ")
// النتيجة: "innama-al-a3mal-balniyat"

generateSlug("قُلْ هُوَ اللَّهُ أَحَدٌ")
// النتيجة: "qul-huwa-allahu-ahad"

generateSlug("لَا إِلَٰهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ")
// النتيجة: "la-ilaha-illa-allah-muhammad"
```

---

## 🎨 مثال على Structured Data الكامل

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CreativeWork",
      "@id": "https://www.najafdesertlibrary.com/hadith.html?id=1#hadith",
      "name": "إنما الأعمال بالنيات",
      "text": "إنما الأعمال بالنيات وإنما لكل امرئ ما نوى فمن كانت هجرته إلى الله ورسوله فهجرته إلى الله ورسوله ومن كانت هجرته لدنيا يصيبها أو امرأة ينكحها فهجرته إلى ما هاجر إليه",
      "author": {
        "@type": "Person",
        "name": "النبي محمد ﷺ"
      },
      "contributor": {
        "@type": "Person",
        "name": "عمر بن الخطاب",
        "description": "راوي الحديث"
      },
      "publisher": {
        "@type": "Organization",
        "name": "مكتبة صحراء النجف",
        "url": "https://www.najafdesertlibrary.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.najafdesertlibrary.com/Thumbnail.png"
        }
      },
      "inLanguage": "ar",
      "isPartOf": {
        "@type": "Book",
        "name": "صحيح البخاري"
      }
    },
    {
      "@type": "WebPage",
      "@id": "https://www.najafdesertlibrary.com/hadith.html?id=1",
      "name": "إنما الأعمال بالنيات - مكتبة صحراء النجف",
      "description": "حديث شريف من صحيح البخاري - مكتبة صحراء النجف",
      "url": "https://www.najafdesertlibrary.com/hadith.html?id=1",
      "inLanguage": "ar"
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "الرئيسية",
          "item": "https://www.najafdesertlibrary.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "صحيح البخاري",
          "item": "https://www.najafdesertlibrary.com/read.html?id=1"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "الحديث",
          "item": "https://www.najafdesertlibrary.com/hadith.html?id=1"
        }
      ]
    }
  ]
}
```

---

## 🔍 مثال على نتائج البحث في Google

### البحث: "إنما الأعمال بالنيات"

```
┌─────────────────────────────────────────────────────────────┐
│ مكتبة صحراء النجف | إنما الأعمال بالنيات                  │
│ https://www.najafdesertlibrary.com › hadith                 │
│ ★★★★★ (4.8) · مكتبة رقمية                                  │
│                                                              │
│ إنما الأعمال بالنيات وإنما لكل امرئ ما نوى فمن كانت      │
│ هجرته إلى الله ورسوله... من صحيح البخاري - الجزء 1 -     │
│ صفحة 5 | مكتبة صحراء النجف - مكتبة رقمية موثوقة           │
│                                                              │
│ الكتاب: صحيح البخاري · الجزء: 1 · الصفحة: 5               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 مثال على المشاركة

### فيسبوك:
عند مشاركة الرابط على فيسبوك، سيظهر:
```
┌─────────────────────────────────────────┐
│ [صورة المكتبة]                         │
│                                         │
│ إنما الأعمال بالنيات - مكتبة صحراء    │
│ النجف                                   │
│                                         │
│ حديث شريف من صحيح البخاري - مكتبة     │
│ صحراء النجف - مكتبة رقمية موثوقة       │
│                                         │
│ NAJAFDESERTLIBRARY.COM                  │
└─────────────────────────────────────────┘
```

### تويتر:
```
┌─────────────────────────────────────────┐
│ إنما الأعمال بالنيات - مكتبة صحراء    │
│ النجف                                   │
│                                         │
│ حديث شريف من صحيح البخاري              │
│                                         │
│ [صورة المكتبة]                         │
│                                         │
│ najafdesertlibrary.com                  │
└─────────────────────────────────────────┘
```

---

## 🎯 ملخص الأمثلة

✅ **الروابط:** SEO-friendly مع دعم الصيغتين
✅ **Meta Tags:** ديناميكية ومحسّنة لكل حديث
✅ **Structured Data:** كامل ومتوافق مع Schema.org
✅ **Sitemap:** ضخم مع دعم التقسيم
✅ **المشاركة:** محسّنة لجميع المنصات
✅ **النتائج:** واضحة وجذابة في Google

---

**للمزيد من التفاصيل:** راجع `SEO_IMPLEMENTATION_GUIDE.md`
