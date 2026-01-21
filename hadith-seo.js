// ملف JavaScript لجلب الأحاديث من Supabase وتوليد SEO tags ديناميكياً
// يدعم هيكلة روابط SEO-Friendly ومحتوى HTML حقيقي لمحركات البحث

const SITE_URL = 'https://www.najafdesertlibrary.com';
const LIBRARY_NAME = 'مكتبة صحراء النجف';

// دالة لتوليد slug من النص العربي
function generateSlug(text, maxWords = 5) {
    if (!text) return '';
    
    // إزالة التشكيل
    const withoutTashkeel = text.replace(/[\u064B-\u065F\u0670]/g, '');
    
    // أخذ أول كلمات فقط
    const words = withoutTashkeel.trim().split(/\s+/).slice(0, maxWords);
    
    // تحويل إلى slug
    return words
        .join('-')
        .replace(/[^\u0600-\u06FF\w-]/g, '') // إبقاء الأحرف العربية والإنجليزية والأرقام والشرطات
        .replace(/--+/g, '-') // إزالة الشرطات المتكررة
        .replace(/^-+|-+$/g, ''); // إزالة الشرطات من البداية والنهاية
}

// دالة لاستخراج معرف الحديث من الرابط
function getHadithIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // دعم كلا الصيغتين: ?id=123 أو /hadith/123-slug
    let hadithId = urlParams.get('id');
    
    if (!hadithId) {
        const pathParts = window.location.pathname.split('/');
        const hadithPart = pathParts.find(part => part.includes('-'));
        if (hadithPart) {
            hadithId = hadithPart.split('-')[0];
        }
    }
    
    return hadithId;
}

// دالة لاختصار النص
function truncateText(text, maxLength = 150) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

// دالة لتحديث Meta Tags ديناميكياً
function updateMetaTags(hadithData) {
    const hadithText = hadithData.content || hadithData.text || '';
    const bookTitle = hadithData.book_title || hadithData.bookTitle || 'كتاب';
    const partNumber = hadithData.part_number || hadithData.partNumber || '';
    const pageNumber = hadithData.page_number || hadithData.pageNumber || '';
    
    // عنوان الصفحة
    const titleText = truncateText(hadithText, 60);
    const fullTitle = `${titleText} - ${LIBRARY_NAME}`;
    document.title = fullTitle;
    
    // الوصف
    const description = `${hadithText} | من ${bookTitle}${partNumber ? ` - الجزء ${partNumber}` : ''}${pageNumber ? ` - صفحة ${pageNumber}` : ''} | ${LIBRARY_NAME} - مكتبة رقمية موثوقة للأحاديث النبوية والكتب الإسلامية`;
    
    // تحديث meta description
    updateMetaTag('name', 'description', truncateText(description, 160));
    
    // تحديث Canonical URL
    const hadithId = hadithData.id;
    const slug = generateSlug(hadithText);
    const canonicalUrl = `${SITE_URL}/hadith.html?id=${hadithId}`;
    updateLinkTag('canonical', canonicalUrl);
    
    // Open Graph Tags
    updateMetaTag('property', 'og:title', fullTitle);
    updateMetaTag('property', 'og:description', truncateText(description, 200));
    updateMetaTag('property', 'og:url', canonicalUrl);
    updateMetaTag('property', 'og:type', 'article');
    
    // Twitter Card Tags
    updateMetaTag('name', 'twitter:title', fullTitle);
    updateMetaTag('name', 'twitter:description', truncateText(description, 200));
    
    // تحديث Structured Data
    updateStructuredData(hadithData);
}

// دالة مساعدة لتحديث meta tag
function updateMetaTag(attribute, attributeValue, content) {
    let tag = document.querySelector(`meta[${attribute}="${attributeValue}"]`);
    if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, attributeValue);
        document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
}

// دالة مساعدة لتحديث link tag
function updateLinkTag(rel, href) {
    let tag = document.querySelector(`link[rel="${rel}"]`);
    if (!tag) {
        tag = document.createElement('link');
        tag.setAttribute('rel', rel);
        document.head.appendChild(tag);
    }
    tag.setAttribute('href', href);
}

// دالة لتحديث Structured Data (Schema.org)
function updateStructuredData(hadithData) {
    const hadithText = hadithData.content || hadithData.text || '';
    const bookTitle = hadithData.book_title || hadithData.bookTitle || '';
    const author = hadithData.author || 'النبي محمد ﷺ';
    const narrator = hadithData.narrator || hadithData.rawi || '';
    const source = hadithData.source || bookTitle;
    
    const structuredData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "CreativeWork",
                "@id": `${SITE_URL}/hadith.html?id=${hadithData.id}#hadith`,
                "name": truncateText(hadithText, 100),
                "text": hadithText,
                "author": {
                    "@type": "Person",
                    "name": author
                },
                "publisher": {
                    "@type": "Organization",
                    "name": LIBRARY_NAME,
                    "url": SITE_URL,
                    "logo": {
                        "@type": "ImageObject",
                        "url": `${SITE_URL}/Thumbnail.png`
                    }
                },
                "inLanguage": "ar",
                "isPartOf": {
                    "@type": "Book",
                    "name": bookTitle
                }
            },
            {
                "@type": "WebPage",
                "@id": `${SITE_URL}/hadith.html?id=${hadithData.id}`,
                "name": `${truncateText(hadithText, 60)} - ${LIBRARY_NAME}`,
                "description": `حديث شريف من ${bookTitle} - ${LIBRARY_NAME}`,
                "url": `${SITE_URL}/hadith.html?id=${hadithData.id}`,
                "inLanguage": "ar",
                "isPartOf": {
                    "@type": "WebSite",
                    "name": LIBRARY_NAME,
                    "url": SITE_URL
                }
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "الرئيسية",
                        "item": SITE_URL
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": bookTitle,
                        "item": `${SITE_URL}/read.html?id=${hadithData.book_id || hadithData.bookId}`
                    },
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "name": "الحديث",
                        "item": `${SITE_URL}/hadith.html?id=${hadithData.id}`
                    }
                ]
            }
        ]
    };
    
    // إضافة الراوي إذا كان موجوداً
    if (narrator) {
        structuredData["@graph"][0].contributor = {
            "@type": "Person",
            "name": narrator,
            "description": "راوي الحديث"
        };
    }
    
    const scriptTag = document.getElementById('structuredData');
    if (scriptTag) {
        scriptTag.textContent = JSON.stringify(structuredData, null, 2);
    }
}

// دالة لعرض الحديث في الصفحة
function displayHadith(hadithData) {
    const hadithText = hadithData.content || hadithData.text || '';
    const bookTitle = hadithData.book_title || hadithData.bookTitle || '';
    const partNumber = hadithData.part_number || hadithData.partNumber;
    const pageNumber = hadithData.page_number || hadithData.pageNumber;
    const narrator = hadithData.narrator || hadithData.rawi || '';
    const source = hadithData.source || '';
    const bookId = hadithData.book_id || hadithData.bookId;
    const partId = hadithData.part_id || hadithData.partId;
    
    // عرض نص الحديث
    document.getElementById('hadithText').innerHTML = hadithText;
    
    // عرض المعلومات الإضافية
    let metaHtml = '';
    
    if (bookTitle) {
        metaHtml += `
            <div class="meta-item">
                <strong><i class="fas fa-book"></i> الكتاب:</strong>
                <span>${bookTitle}</span>
            </div>
        `;
    }
    
    if (partNumber) {
        metaHtml += `
            <div class="meta-item">
                <strong><i class="fas fa-bookmark"></i> الجزء:</strong>
                <span>${partNumber}</span>
            </div>
        `;
    }
    
    if (pageNumber) {
        metaHtml += `
            <div class="meta-item">
                <strong><i class="fas fa-file-alt"></i> الصفحة:</strong>
                <span>${pageNumber}</span>
            </div>
        `;
    }
    
    if (narrator) {
        metaHtml += `
            <div class="meta-item">
                <strong><i class="fas fa-user"></i> الراوي:</strong>
                <span>${narrator}</span>
            </div>
        `;
    }
    
    if (source) {
        metaHtml += `
            <div class="meta-item">
                <strong><i class="fas fa-archive"></i> المصدر:</strong>
                <span>${source}</span>
            </div>
        `;
    }
    
    metaHtml += `
        <div class="meta-item">
            <strong><i class="fas fa-library"></i> المكتبة:</strong>
            <span>${LIBRARY_NAME}</span>
        </div>
    `;
    
    document.getElementById('hadithMeta').innerHTML = metaHtml;
    
    // تحديث رابط الكتاب
    if (bookId) {
        const bookLink = document.getElementById('bookLink');
        bookLink.href = `read.html?id=${bookId}${partId ? `&part=${partId}` : ''}${pageNumber ? `&page=${pageNumber}` : ''}`;
        bookLink.textContent = bookTitle;
        
        const readBookBtn = document.getElementById('readBookBtn');
        readBookBtn.href = `read.html?id=${bookId}${partId ? `&part=${partId}` : ''}${pageNumber ? `&page=${pageNumber}` : ''}`;
    }
    
    // إخفاء Loading وإظهار المحتوى
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('hadithContainer').style.display = 'block';
}

// دالة لعرض رسالة خطأ
function displayError(message) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
    document.getElementById('errorMessage').textContent = message;
}

// دالة لجلب الحديث من Supabase
async function fetchHadith(hadithId) {
    try {
        // البحث في جدول pages عن الحديث
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
            .eq('id', hadithId)
            .single();
        
        if (error) throw error;
        if (!data) throw new Error('الحديث غير موجود');
        
        // تنسيق البيانات
        const hadithData = {
            id: data.id,
            content: data.content,
            text: data.content,
            page_number: data.page_number,
            pageNumber: data.page_number,
            part_id: data.part_id,
            partId: data.part_id,
            part_number: data.parts?.part_number,
            partNumber: data.parts?.part_number,
            book_id: data.parts?.books?.id,
            bookId: data.parts?.books?.id,
            book_title: data.parts?.books?.title,
            bookTitle: data.parts?.books?.title
        };
        
        return hadithData;
    } catch (error) {
        console.error('خطأ في جلب الحديث:', error);
        throw error;
    }
}

// دوال المشاركة على وسائل التواصل
function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

function shareOnTwitter() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(document.title);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
}

function shareOnWhatsApp() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(document.title);
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        alert('✅ تم نسخ الرابط بنجاح!');
    }).catch(() => {
        alert('❌ فشل نسخ الرابط');
    });
}

// تهيئة الصفحة عند التحميل
window.addEventListener('load', async function() {
    try {
        // تهيئة Supabase
        await api.init();
        
        // الحصول على معرف الحديث
        const hadithId = getHadithIdFromUrl();
        
        if (!hadithId) {
            displayError('معرف الحديث غير موجود في الرابط');
            return;
        }
        
        // جلب بيانات الحديث
        const hadithData = await fetchHadith(hadithId);
        
        // تحديث Meta Tags
        updateMetaTags(hadithData);
        
        // عرض الحديث
        displayHadith(hadithData);
        
    } catch (error) {
        console.error('خطأ في تحميل الصفحة:', error);
        displayError(error.message || 'حدث خطأ في تحميل الحديث. يرجى المحاولة مرة أخرى.');
    }
});
