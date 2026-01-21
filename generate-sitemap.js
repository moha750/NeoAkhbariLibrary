// ملف لتوليد sitemap.xml ديناميكي لمكتبة صحراء النجف
// يجب تشغيل هذا الملف باستخدام Node.js لتوليد sitemap محدث

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// إعدادات Supabase (نفس الإعدادات من supabase-api.js)
const SUPABASE_URL = 'https://yfudytvojcusgemyager.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmdWR5dHZvamN1c2dlbXlhZ2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NzU1OTgsImV4cCI6MjA4MDM1MTU5OH0.iPowb3xPmMeAwxy63zdbMdHzRYI26Q9tOjB5Efxr9EQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function generateSitemap() {
    console.log('🚀 بدء توليد sitemap.xml...');
    
    try {
        // جلب جميع الكتب المنشورة
        console.log('📚 جلب الكتب...');
        const { data: books, error: booksError } = await supabase
            .from('books')
            .select('id, title, created_at, updated_at')
            .eq('published', true)
            .order('created_at', { ascending: true });

        if (booksError) throw booksError;
        console.log(`✅ تم جلب ${books?.length || 0} كتاب`);

        // جلب جميع الأجزاء
        console.log('📖 جلب الأجزاء...');
        const { data: parts, error: partsError } = await supabase
            .from('parts')
            .select('id, book_id, part_number, created_at, updated_at')
            .order('created_at', { ascending: true });

        if (partsError) throw partsError;
        console.log(`✅ تم جلب ${parts?.length || 0} جزء`);

        // جلب جميع الأقسام
        console.log('📂 جلب الأقسام...');
        const { data: categories, error: categoriesError } = await supabase
            .from('categories')
            .select('id, name, created_at, updated_at')
            .order('created_at', { ascending: true });

        if (categoriesError) throw categoriesError;
        console.log(`✅ تم جلب ${categories?.length || 0} قسم`);

        // لا نجلب جميع الصفحات لتجنب timeout
        // سنعتمد على الكتب والأجزاء فقط
        console.log('⚠️  تخطي جلب الصفحات الفردية لتجنب timeout (سيتم فهرستها تلقائياً عبر الكتب والأجزاء)');

        // بناء XML
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n';

        // الصفحة الرئيسية
        xml += '  <url>\n';
        xml += '    <loc>https://www.najafdesertlibrary.com/</loc>\n';
        xml += '    <changefreq>daily</changefreq>\n';
        xml += '    <priority>1.0</priority>\n';
        xml += '  </url>\n';

        // صفحة index.html
        xml += '  <url>\n';
        xml += '    <loc>https://www.najafdesertlibrary.com/index.html</loc>\n';
        xml += '    <changefreq>daily</changefreq>\n';
        xml += '    <priority>1.0</priority>\n';
        xml += '  </url>\n';

        // الأقسام
        if (categories && categories.length > 0) {
            for (const category of categories) {
                xml += '  <url>\n';
                xml += `    <loc>https://www.najafdesertlibrary.com/category.html?id=${category.id}</loc>\n`;
                xml += '    <changefreq>weekly</changefreq>\n';
                xml += '    <priority>0.8</priority>\n';
                if (category.updated_at) {
                    xml += `    <lastmod>${new Date(category.updated_at).toISOString().split('T')[0]}</lastmod>\n`;
                }
                xml += '  </url>\n';
            }
        }

        // الكتب
        if (books && books.length > 0) {
            for (const book of books) {
                // صفحة الأجزاء
                xml += '  <url>\n';
                xml += `    <loc>https://www.najafdesertlibrary.com/parts.html?id=${book.id}</loc>\n`;
                xml += '    <changefreq>weekly</changefreq>\n';
                xml += '    <priority>0.9</priority>\n';
                if (book.updated_at) {
                    xml += `    <lastmod>${new Date(book.updated_at).toISOString().split('T')[0]}</lastmod>\n`;
                }
                xml += '  </url>\n';

                // صفحة القراءة الرئيسية للكتاب
                xml += '  <url>\n';
                xml += `    <loc>https://www.najafdesertlibrary.com/read.html?id=${book.id}</loc>\n`;
                xml += '    <changefreq>weekly</changefreq>\n';
                xml += '    <priority>0.9</priority>\n';
                if (book.updated_at) {
                    xml += `    <lastmod>${new Date(book.updated_at).toISOString().split('T')[0]}</lastmod>\n`;
                }
                xml += '  </url>\n';
            }
        }

        // الأجزاء
        if (parts && parts.length > 0) {
            for (const part of parts) {
                xml += '  <url>\n';
                xml += `    <loc>https://www.najafdesertlibrary.com/read.html?id=${part.book_id}&amp;part=${part.id}</loc>\n`;
                xml += '    <changefreq>weekly</changefreq>\n';
                xml += '    <priority>0.8</priority>\n';
                if (part.updated_at) {
                    xml += `    <lastmod>${new Date(part.updated_at).toISOString().split('T')[0]}</lastmod>\n`;
                }
                xml += '  </url>\n';
            }
        }

        // ملاحظة: لا نضيف الصفحات الفردية لتجنب timeout
        // Google سيزحف للصفحات تلقائياً عبر روابط الكتب والأجزاء
        console.log('✅ تم تخطي الصفحات الفردية - سيتم فهرستها تلقائياً عبر الكتب والأجزاء');

        xml += '</urlset>';

        // حفظ الملف
        fs.writeFileSync('sitemap.xml', xml, 'utf8');
        console.log('✅ تم توليد sitemap.xml بنجاح!');
        console.log(`📊 إجمالي عدد الروابط: ${xml.split('<url>').length - 1}`);
        
    } catch (error) {
        console.error('❌ خطأ في توليد sitemap:', error);
        process.exit(1);
    }
}

// تشغيل الدالة
generateSitemap().then(() => {
    console.log('🎉 تم الانتهاء!');
    process.exit(0);
});
