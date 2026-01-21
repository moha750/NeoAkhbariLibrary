// سكربت Node.js لتوليد Sitemap ديناميكي لجميع الأحاديث
// يدعم تقسيم الخرائط إلى ملفات متعددة (50,000 رابط لكل ملف)

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// إعدادات Supabase
const SUPABASE_URL = 'https://yfudytvojcusgemyager.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmdWR5dHZvamN1c2dlbXlhZ2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NzU1OTgsImV4cCI6MjA4MDM1MTU5OH0.iPowb3xPmMeAwxy63zdbMdHzRYI26Q9tOjB5Efxr9EQ';

// إعدادات الموقع
const SITE_URL = 'https://www.najafdesertlibrary.com';
const MAX_URLS_PER_SITEMAP = 50000; // الحد الأقصى حسب معايير Google

// إنشاء عميل Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// دالة لتوليد slug من النص العربي
function generateSlug(text, maxWords = 5) {
    if (!text) return '';
    
    const withoutTashkeel = text.replace(/[\u064B-\u065F\u0670]/g, '');
    const words = withoutTashkeel.trim().split(/\s+/).slice(0, maxWords);
    
    return words
        .join('-')
        .replace(/[^\u0600-\u06FF\w-]/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// دالة لتنسيق التاريخ بصيغة ISO
function formatDate(date) {
    return new Date(date).toISOString().split('T')[0];
}

// دالة لإنشاء XML للصفحة
function createUrlEntry(loc, lastmod = null, changefreq = 'monthly', priority = '0.8') {
    return `  <url>
    <loc>${escapeXml(loc)}</loc>
    ${lastmod ? `<lastmod>${formatDate(lastmod)}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

// دالة لتحويل الأحرف الخاصة في XML
function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

// دالة لإنشاء ملف Sitemap
function createSitemapFile(urls, filename) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
    
    fs.writeFileSync(filename, xml, 'utf8');
    console.log(`✅ تم إنشاء: ${filename} (${urls.length} رابط)`);
}

// دالة لإنشاء ملف Sitemap Index
function createSitemapIndex(sitemapFiles) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapFiles.map(file => `  <sitemap>
    <loc>${SITE_URL}/${file}</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;
    
    fs.writeFileSync('sitemap.xml', xml, 'utf8');
    console.log(`✅ تم إنشاء: sitemap.xml (${sitemapFiles.length} ملف فرعي)`);
}

// دالة لجلب جميع الأحاديث من Supabase
async function fetchAllHadiths() {
    console.log('📥 جاري جلب الأحاديث من Supabase...');
    
    let allPages = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;
    
    while (hasMore) {
        const { data, error } = await supabase
            .from('pages')
            .select('id, content, created_at, updated_at')
            .range(page * pageSize, (page + 1) * pageSize - 1)
            .order('id', { ascending: true });
        
        if (error) {
            console.error('❌ خطأ في جلب البيانات:', error);
            throw error;
        }
        
        if (data && data.length > 0) {
            allPages = allPages.concat(data);
            console.log(`   جلب ${data.length} حديث (الإجمالي: ${allPages.length})`);
            hasMore = data.length === pageSize;
            page++;
        } else {
            hasMore = false;
        }
    }
    
    console.log(`✅ تم جلب ${allPages.length} حديث إجمالاً`);
    return allPages;
}

// دالة لجلب جميع الكتب
async function fetchAllBooks() {
    console.log('📥 جاري جلب الكتب...');
    
    const { data, error } = await supabase
        .from('books')
        .select('id, title, updated_at')
        .eq('is_published', true);
    
    if (error) {
        console.error('❌ خطأ في جلب الكتب:', error);
        return [];
    }
    
    console.log(`✅ تم جلب ${data?.length || 0} كتاب`);
    return data || [];
}

// دالة لجلب جميع الأقسام
async function fetchAllCategories() {
    console.log('📥 جاري جلب الأقسام...');
    
    const { data, error } = await supabase
        .from('categories')
        .select('id, name, updated_at');
    
    if (error) {
        console.error('❌ خطأ في جلب الأقسام:', error);
        return [];
    }
    
    console.log(`✅ تم جلب ${data?.length || 0} قسم`);
    return data || [];
}

// الدالة الرئيسية
async function generateSitemap() {
    try {
        console.log('🚀 بدء توليد Sitemap...\n');
        
        // جلب البيانات
        const [hadiths, books, categories] = await Promise.all([
            fetchAllHadiths(),
            fetchAllBooks(),
            fetchAllCategories()
        ]);
        
        console.log('\n📝 جاري إنشاء ملفات Sitemap...\n');
        
        const allUrls = [];
        
        // إضافة الصفحة الرئيسية
        allUrls.push(createUrlEntry(
            `${SITE_URL}/`,
            new Date(),
            'daily',
            '1.0'
        ));
        
        // إضافة صفحات الأقسام
        categories.forEach(category => {
            allUrls.push(createUrlEntry(
                `${SITE_URL}/category.html?id=${category.id}`,
                category.updated_at,
                'weekly',
                '0.8'
            ));
        });
        
        // إضافة صفحات الكتب
        books.forEach(book => {
            allUrls.push(createUrlEntry(
                `${SITE_URL}/read.html?id=${book.id}`,
                book.updated_at,
                'weekly',
                '0.9'
            ));
            
            allUrls.push(createUrlEntry(
                `${SITE_URL}/parts.html?id=${book.id}`,
                book.updated_at,
                'weekly',
                '0.7'
            ));
        });
        
        // إضافة صفحات الأحاديث
        hadiths.forEach(hadith => {
            const slug = generateSlug(hadith.content);
            const url = `${SITE_URL}/hadith.html?id=${hadith.id}`;
            
            allUrls.push(createUrlEntry(
                url,
                hadith.updated_at || hadith.created_at,
                'monthly',
                '0.8'
            ));
        });
        
        console.log(`📊 إجمالي الروابط: ${allUrls.length}\n`);
        
        // تقسيم الروابط إلى ملفات متعددة إذا لزم الأمر
        if (allUrls.length <= MAX_URLS_PER_SITEMAP) {
            // ملف واحد فقط
            createSitemapFile(allUrls, 'sitemap.xml');
        } else {
            // ملفات متعددة
            const sitemapFiles = [];
            const numFiles = Math.ceil(allUrls.length / MAX_URLS_PER_SITEMAP);
            
            for (let i = 0; i < numFiles; i++) {
                const start = i * MAX_URLS_PER_SITEMAP;
                const end = Math.min((i + 1) * MAX_URLS_PER_SITEMAP, allUrls.length);
                const fileUrls = allUrls.slice(start, end);
                const filename = `sitemap-${i + 1}.xml`;
                
                createSitemapFile(fileUrls, filename);
                sitemapFiles.push(filename);
            }
            
            // إنشاء ملف Sitemap Index
            createSitemapIndex(sitemapFiles);
        }
        
        console.log('\n✅ تم إنشاء جميع ملفات Sitemap بنجاح!');
        console.log(`\n📌 لا تنسى رفع الملفات إلى الموقع وإرسال الـ Sitemap إلى Google Search Console`);
        
    } catch (error) {
        console.error('\n❌ حدث خطأ:', error);
        process.exit(1);
    }
}

// تشغيل السكربت
if (require.main === module) {
    generateSitemap();
}

module.exports = { generateSitemap };
