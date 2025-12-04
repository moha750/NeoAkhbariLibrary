// ملف تكوين Supabase
// يرجى استبدال القيم التالية بقيمك الخاصة من لوحة تحكم Supabase

const SUPABASE_CONFIG = {
    // URL مشروع Supabase الخاص بك
    // يمكنك الحصول عليه من: Settings > API > Project URL
    url: 'https://yfudytvojcusgemyager.supabase.co', // مثال: https://xxxxxxxxxxx.supabase.co
    
    // Anon/Public Key من Supabase
    // يمكنك الحصول عليه من: Settings > API > Project API keys > anon public
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmdWR5dHZvamN1c2dlbXlhZ2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NzU1OTgsImV4cCI6MjA4MDM1MTU5OH0.iPowb3xPmMeAwxy63zdbMdHzRYI26Q9tOjB5Efxr9EQ',
    
    // أسماء الجداول في قاعدة البيانات
    tables: {
        categories: 'categories',
        books: 'books',
        parts: 'parts',
        pages: 'pages',
        contact_messages: 'contact_messages',
        visitors: 'visitors'
    }
};

// تصدير التكوين
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SUPABASE_CONFIG;
}
