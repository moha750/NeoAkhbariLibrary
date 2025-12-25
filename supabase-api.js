// ملف API للتعامل مع Supabase
// يحتوي على جميع الدوال المطلوبة للتفاعل مع قاعدة البيانات

// إعدادات Supabase
const SUPABASE_CONFIG = {
    url: 'https://yfudytvojcusgemyager.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmdWR5dHZvamN1c2dlbXlhZ2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NzU1OTgsImV4cCI6MjA4MDM1MTU5OH0.iPowb3xPmMeAwxy63zdbMdHzRYI26Q9tOjB5Efxr9EQ',
    tables: {
        categories: 'categories',
        books: 'books',
        parts: 'parts',
        chapters: 'chapters',
        pages: 'pages',
        contact_messages: 'contact_messages',
        visitors: 'visitors',
        users: 'users',
        user_roles: 'user_roles',
        invitations: 'invitations'
    }
};

class SupabaseAPI {
    constructor() {
        this.supabase = null;
        this.initialized = false;
    }

    // تهيئة الاتصال بـ Supabase
    async init() {
        if (this.initialized) return;
        
        try {
            // التحقق من وجود مكتبة Supabase
            if (typeof supabase === 'undefined') {
                throw new Error('مكتبة Supabase غير محملة. تأكد من إضافة السكريبت في HTML');
            }

            // التحقق من إعدادات Supabase
            if (SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL' || SUPABASE_CONFIG.anonKey === 'YOUR_SUPABASE_ANON_KEY') {
                throw new Error('يرجى تحديث إعدادات Supabase في ملف supabase-api.js');
            }

            // إنشاء عميل Supabase
            this.supabase = supabase.createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.anonKey
            );

            this.initialized = true;
            console.log('✅ تم الاتصال بـ Supabase بنجاح');
        } catch (error) {
            console.error('❌ خطأ في الاتصال بـ Supabase:', error);
            throw error;
        }
    }

    async getBookChapters(bookId, partId = null) {
        try {
            let query = this.supabase
                .from(SUPABASE_CONFIG.tables.chapters)
                .select('*')
                .eq('book_id', bookId)
                .order('page_start', { ascending: true });

            if (partId) {
                query = query.eq('part_id', partId);
            } else {
                query = query.is('part_id', null);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('خطأ في جلب الأبواب:', error);
            return [];
        }
    }
    async addChapter(chapterData) {
        try {
            const payload = {
                book_id: chapterData.book_id,
                title: chapterData.title,
                page_start: chapterData.page_start,
                page_end: chapterData.page_end
            };

            if (chapterData.part_id) {
                payload.part_id = chapterData.part_id;
            }

            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.chapters)
                .insert([payload])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('خطأ في إضافة الباب:', error);
            throw error;
        }
    }
    async updateChapter(chapterId, updates) {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.chapters)
                .update(updates)
                .eq('id', chapterId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('خطأ في تحديث الباب:', error);
            throw error;
        }
    }
    async deleteChapter(chapterId) {
        try {
            const { error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.chapters)
                .delete()
                .eq('id', chapterId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('خطأ في حذف الباب:', error);
            throw error;
        }
    }
    async getChapterForPage(bookId, pageNumber, partId = null) {
        try {
            let query = this.supabase
                .from(SUPABASE_CONFIG.tables.chapters)
                .select('id, title, page_start, page_end, book_id, part_id')
                .eq('book_id', bookId)
                .lte('page_start', pageNumber)
                .gte('page_end', pageNumber)
                .limit(1);

            if (partId) {
                query = query.eq('part_id', partId);
            } else {
                query = query.is('part_id', null);
            }

            const { data, error } = await query.maybeSingle();
            if (error) throw error;
            return data || null;
        } catch (error) {
            console.error('خطأ في جلب باب الصفحة:', error);
            return null;
        }
    }

    // ===================================
    // دوال الأقسام (Categories)
    // ===================================

    // جلب جميع الأقسام
    async getCategories() {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.categories)
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('خطأ في جلب الأقسام:', error);
            return [];
        }
    }

    // جلب قسم واحد
    async getCategory(categoryId) {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.categories)
                .select('*')
                .eq('id', categoryId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('خطأ في جلب القسم:', error);
            return null;
        }
    }

    // إضافة قسم جديد
    async addCategory(name, description = '') {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.categories)
                .insert([{ name, description }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('خطأ في إضافة القسم:', error);
            throw error;
        }
    }

    // تحديث قسم
    async updateCategory(categoryId, updates) {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.categories)
                .update(updates)
                .eq('id', categoryId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('خطأ في تحديث القسم:', error);
            throw error;
        }
    }

    // حذف قسم
    async deleteCategory(categoryId) {
        try {
            const { error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.categories)
                .delete()
                .eq('id', categoryId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('خطأ في حذف القسم:', error);
            throw error;
        }
    }

    // ===================================
    // دوال الكتب (Books)
    // ===================================

    // جلب جميع الكتب المنشورة
    async getPublishedBooks() {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.books)
                .select('*')
                .eq('published', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('خطأ في جلب الكتب:', error);
            return [];
        }
    }

    // جلب جميع الكتب (منشورة وغير منشورة)
    async getAllBooks() {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.books)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('خطأ في جلب الكتب:', error);
            return [];
        }
    }

    // جلب كتب قسم معين
    async getBooksByCategory(categoryId) {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.books)
                .select('*')
                .eq('category_id', categoryId)
                .eq('published', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('خطأ في جلب كتب القسم:', error);
            return [];
        }
    }

    // جلب كتاب واحد
    async getBook(bookId) {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.books)
                .select('*')
                .eq('id', bookId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('خطأ في جلب الكتاب:', error);
            return null;
        }
    }

    // إضافة كتاب جديد
    async addBook(bookData) {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.books)
                .insert([bookData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('خطأ في إضافة الكتاب:', error);
            throw error;
        }
    }

    // تحديث كتاب
    async updateBook(bookId, updates) {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.books)
                .update(updates)
                .eq('id', bookId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('خطأ في تحديث الكتاب:', error);
            throw error;
        }
    }

    // حذف كتاب
    async deleteBook(bookId) {
        try {
            const { error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.books)
                .delete()
                .eq('id', bookId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('خطأ في حذف الكتاب:', error);
            throw error;
        }
    }

    // زيادة عدد المشاهدات
    async incrementBookViews(bookId) {
        try {
            const { error } = await this.supabase
                .rpc('increment_book_views', { book_uuid: bookId });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('خطأ في تحديث المشاهدات:', error);
            return false;
        }
    }

    // البحث في الكتب
    async searchBooks(searchTerm) {
        try {
            // البحث في عناوين الكتب
            const { data: booksByTitle, error: titleError } = await this.supabase
                .from(SUPABASE_CONFIG.tables.books)
                .select('*')
                .eq('published', true)
                .ilike('title', `%${searchTerm}%`)
                .order('created_at', { ascending: false });

            if (titleError) throw titleError;

            // البحث في محتوى الصفحات
            const { data: pagesByContent, error: contentError } = await this.supabase
                .from(SUPABASE_CONFIG.tables.pages)
                .select('book_id')
                .ilike('content', `%${searchTerm}%`);

            if (contentError) throw contentError;

            // جمع IDs الكتب من نتائج البحث في المحتوى
            const bookIdsFromContent = [...new Set(pagesByContent.map(page => page.book_id))];

            // جلب الكتب التي تحتوي على المحتوى
            let booksByContent = [];
            if (bookIdsFromContent.length > 0) {
                const { data: booksData, error: booksError } = await this.supabase
                    .from(SUPABASE_CONFIG.tables.books)
                    .select('*')
                    .eq('published', true)
                    .in('id', bookIdsFromContent)
                    .order('created_at', { ascending: false });

                if (booksError) throw booksError;
                booksByContent = booksData || [];
            }

            // دمج النتائج وإزالة التكرار
            const allBooks = [...booksByTitle];
            const bookIds = new Set(booksByTitle.map(book => book.id));

            booksByContent.forEach(book => {
                if (!bookIds.has(book.id)) {
                    allBooks.push(book);
                }
            });

            return allBooks;
        } catch (error) {
            console.error('خطأ في البحث:', error);
            return [];
        }
    }

    // البحث التفصيلي في المحتوى مع معلومات الصفحات والأجزاء
    async searchInContent(searchTerm) {
        try {
            // البحث في محتوى الصفحات مع جلب معلومات الكتاب والجزء
            const { data: pages, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.pages)
                .select(`
                    id,
                    content,
                    page_number,
                    book_id,
                    part_id,
                    books!inner(id, title, published),
                    parts(id, part_number)
                `)
                .eq('books.published', true)
                .ilike('content', `%${searchTerm}%`)
                .limit(50);

            if (error) throw error;

            // معالجة النتائج لاستخراج السياق
            const results = pages.map(page => {
                const content = page.content;
                const searchLower = searchTerm.toLowerCase();
                const contentLower = content.toLowerCase();
                const index = contentLower.indexOf(searchLower);
                
                // استخراج السياق (50 حرف قبل وبعد)
                const start = Math.max(0, index - 50);
                const end = Math.min(content.length, index + searchTerm.length + 50);
                let context = content.substring(start, end);
                
                // إضافة ... في البداية والنهاية إذا لزم الأمر
                if (start > 0) context = '...' + context;
                if (end < content.length) context = context + '...';

                return {
                    pageId: page.id,
                    bookId: page.book_id,
                    bookTitle: page.books.title,
                    partId: page.part_id,
                    partNumber: page.parts ? page.parts.part_number : null,
                    pageNumber: page.page_number,
                    context: context,
                    searchTerm: searchTerm
                };
            });

            return results;
        } catch (error) {
            console.error('خطأ في البحث التفصيلي:', error);
            return [];
        }
    }

    // ===================================
    // دوال الأجزاء (Parts)
    // ===================================

    // جلب أجزاء كتاب
    async getBookParts(bookId) {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.parts)
                .select('*')
                .eq('book_id', bookId)
                .order('part_number', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('خطأ في جلب أجزاء الكتاب:', error);
            return [];
        }
    }

    // إضافة جزء
    async addPart(bookId, partNumber) {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.parts)
                .insert([{ book_id: bookId, part_number: partNumber }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('خطأ في إضافة الجزء:', error);
            throw error;
        }
    }

    // تحديث جزء
    async updatePart(partId, updates) {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.parts)
                .update(updates)
                .eq('id', partId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('خطأ في تحديث الجزء:', error);
            throw error;
        }
    }

    // حذف جزء
    async deletePart(partId) {
        try {
            const { error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.parts)
                .delete()
                .eq('id', partId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('خطأ في حذف الجزء:', error);
            throw error;
        }
    }

    // ===================================
    // دوال الصفحات (Pages)
    // ===================================

    // جلب صفحات كتاب
    async getBookPages(bookId) {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.pages)
                .select('*')
                .eq('book_id', bookId)
                .order('page_number', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('خطأ في جلب صفحات الكتاب:', error);
            return [];
        }
    }

    // جلب صفحات جزء معين
    async getPartPages(partId) {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.pages)
                .select('*')
                .eq('part_id', partId)
                .order('page_number', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('خطأ في جلب صفحات الجزء:', error);
            return [];
        }
    }

    // إضافة صفحة
    async addPage(bookId, pageNumber, content, partId = null) {
        try {
            const pageData = {
                book_id: bookId,
                page_number: pageNumber,
                content: content
            };
            
            // إضافة part_id فقط إذا كان موجوداً
            if (partId) {
                pageData.part_id = partId;
            }

            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.pages)
                .insert([pageData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('خطأ في إضافة الصفحة:', error);
            throw error;
        }
    }

    // تحديث صفحة
    async updatePage(pageId, content) {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.pages)
                .update({ content })
                .eq('id', pageId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('خطأ في تحديث الصفحة:', error);
            throw error;
        }
    }

    // تحديث رقم الصفحة
    async updatePageNumber(pageId, pageNumber) {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.pages)
                .update({ page_number: pageNumber })
                .eq('id', pageId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('خطأ في تحديث رقم الصفحة:', error);
            throw error;
        }
    }

    // حذف صفحة
    async deletePage(pageId) {
        try {
            const { error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.pages)
                .delete()
                .eq('id', pageId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('خطأ في حذف الصفحة:', error);
            throw error;
        }
    }

    // حذف جميع صفحات كتاب
    async deleteBookPages(bookId) {
        try {
            const { error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.pages)
                .delete()
                .eq('book_id', bookId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('خطأ في حذف صفحات الكتاب:', error);
            throw error;
        }
    }

    // ===================================
    // دوال رسائل التواصل (Contact Messages)
    // ===================================

    // إضافة رسالة تواصل
    async addContactMessage(messageData) {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.contact_messages)
                .insert([{
                    name: messageData.name,
                    email: messageData.email,
                    subject: messageData.subject,
                    message: messageData.message,
                    read: false
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('خطأ في إضافة الرسالة:', error);
            throw error;
        }
    }

    // حذف رسالة تواصل
    async deleteContactMessage(messageId) {
        try {
            const { error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.contact_messages)
                .delete()
                .eq('id', messageId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('خطأ في حذف الرسالة:', error);
            throw error;
        }
    }

    // جلب جميع الرسائل (للإدارة)
    async getContactMessages() {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.contact_messages)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('خطأ في جلب الرسائل:', error);
            return [];
        }
    }

    // تحديث حالة قراءة الرسالة
    async markMessageAsRead(messageId, read = true) {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.contact_messages)
                .update({ read })
                .eq('id', messageId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('خطأ في تحديث حالة الرسالة:', error);
            throw error;
        }
    }

    // ===================================
    // دوال الزوار (Visitors)
    // ===================================

    // إضافة زائر جديد
    async addVisitor(visitorData) {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.visitors)
                .insert([{
                    visitor_id: visitorData.visitor_id,
                    is_returning: visitorData.is_returning,
                    country: visitorData.country || 'Unknown',
                    device_type: visitorData.device_type || 'Unknown',
                    browser: visitorData.browser || 'Unknown',
                    os: visitorData.os || 'Unknown',
                    screen_resolution: visitorData.screen_resolution || 'Unknown',
                    language: visitorData.language || 'Unknown'
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('خطأ في إضافة الزائر:', error);
            throw error;
        }
    }

    // جلب إحصائيات الزوار
    async getVisitorStats() {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.visitors)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('خطأ في جلب إحصائيات الزوار:', error);
            return [];
        }
    }

    // جلب عدد الزوار حسب النوع
    async getVisitorCounts() {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.visitors)
                .select('is_returning');

            if (error) throw error;
            
            const newVisitors = data.filter(v => !v.is_returning).length;
            const returningVisitors = data.filter(v => v.is_returning).length;
            
            return {
                total: data.length,
                new: newVisitors,
                returning: returningVisitors
            };
        } catch (error) {
            console.error('خطأ في حساب الزوار:', error);
            return { total: 0, new: 0, returning: 0 };
        }
    }

    // جلب الزوار حسب الدولة
    async getVisitorsByCountry() {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.visitors)
                .select('country');

            if (error) throw error;
            
            const countryCounts = {};
            data.forEach(v => {
                countryCounts[v.country] = (countryCounts[v.country] || 0) + 1;
            });
            
            return Object.entries(countryCounts)
                .map(([country, count]) => ({ country, count }))
                .sort((a, b) => b.count - a.count);
        } catch (error) {
            console.error('خطأ في جلب الزوار حسب الدولة:', error);
            return [];
        }
    }

    // جلب الزوار حسب نوع الجهاز
    async getVisitorsByDevice() {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.visitors)
                .select('device_type');

            if (error) throw error;
            
            const deviceCounts = {};
            data.forEach(v => {
                deviceCounts[v.device_type] = (deviceCounts[v.device_type] || 0) + 1;
            });
            
            return Object.entries(deviceCounts)
                .map(([device, count]) => ({ device, count }))
                .sort((a, b) => b.count - a.count);
        } catch (error) {
            console.error('خطأ في جلب الزوار حسب الجهاز:', error);
            return [];
        }
    }

    // ===================================
    // دوال مساعدة
    // ===================================

    // رفع صورة غلاف الكتاب
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

    // حذف صورة غلاف
    async deleteBookCover(coverUrl) {
        try {
            // استخراج اسم الملف من URL
            const fileName = coverUrl.split('/').pop();
            const filePath = `book-covers/${fileName}`;

            const { error } = await this.supabase.storage
                .from('book-covers')
                .remove([filePath]);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('خطأ في حذف الصورة:', error);
            return false;
        }
    }

    // ===================================
    // دوال مساعدة
    // ===================================

    // التحقق من حالة الاتصال
    isConnected() {
        return this.initialized && this.supabase !== null;
    }

    // ===================================
    // دوال المصادقة (Authentication)
    // ===================================

    // تسجيل الدخول
    async signIn(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // تحديث آخر تسجيل دخول
            if (data.user) {
                await this.updateUserLastLogin(data.user.id);
            }

            return { success: true, data };
        } catch (error) {
            console.error('خطأ في تسجيل الدخول:', error);
            return { success: false, error: error.message };
        }
    }

    // تسجيل الخروج
    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('خطأ في تسجيل الخروج:', error);
            return { success: false, error: error.message };
        }
    }

    // التسجيل بدعوة
    async signUpWithInvitation(email, password, invitationToken) {
        try {
            // التسجيل في Supabase Auth مع تعطيل Email Confirmation للدعوات
            const { data: authData, error: authError } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: window.location.origin + '/dashboard.html',
                    data: {
                        invitation_token: invitationToken
                    }
                }
            });

            if (authError) throw authError;

            // التحقق من أن المستخدم تم إنشاؤه
            if (!authData.user) {
                throw new Error('فشل إنشاء المستخدم');
            }

            console.log('✅ تم إنشاء المستخدم في Auth:', authData.user.id);

            // الانتظار قليلاً للتأكد من إنشاء السجل في auth.users
            await new Promise(resolve => setTimeout(resolve, 1000));

            // قبول الدعوة وإنشاء سجل المستخدم
            const { data: acceptData, error: acceptError } = await this.supabase
                .rpc('accept_invitation', {
                    invitation_token: invitationToken,
                    user_id: authData.user.id
                });

            if (acceptError) {
                console.error('خطأ في accept_invitation:', acceptError);
                throw acceptError;
            }

            if (!acceptData) {
                throw new Error('الدعوة غير صالحة أو منتهية الصلاحية');
            }

            console.log('✅ تم قبول الدعوة بنجاح');

            return { success: true, data: authData };
        } catch (error) {
            console.error('خطأ في التسجيل بالدعوة:', error);
            return { success: false, error: error.message };
        }
    }

    // الحصول على الجلسة الحالية
    async getSession() {
        try {
            const { data, error } = await this.supabase.auth.getSession();
            if (error) throw error;
            return data.session;
        } catch (error) {
            console.error('خطأ في الحصول على الجلسة:', error);
            return null;
        }
    }

    // الحصول على المستخدم الحالي
    async getCurrentUser() {
        try {
            const { data: { user }, error: authError } = await this.supabase.auth.getUser();
            
            if (authError) throw authError;
            if (!user) return null;

            // جلب بيانات المستخدم من جدول users
            const { data: userData, error: userError } = await this.supabase
                .from(SUPABASE_CONFIG.tables.users)
                .select(`
                    *,
                    user_roles (
                        name,
                        display_name,
                        permissions
                    )
                `)
                .eq('id', user.id)
                .single();

            if (userError) throw userError;

            return {
                ...userData,
                role_name: userData.user_roles?.name,
                role_display_name: userData.user_roles?.display_name,
                permissions: userData.user_roles?.permissions
            };
        } catch (error) {
            console.error('خطأ في الحصول على المستخدم:', error);
            return null;
        }
    }

    // تحديث آخر تسجيل دخول
    async updateUserLastLogin(userId) {
        try {
            const { error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.users)
                .update({ last_login: new Date().toISOString() })
                .eq('id', userId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('خطأ في تحديث آخر تسجيل دخول:', error);
            return false;
        }
    }

    // إعادة تعيين كلمة المرور
    async resetPassword(email) {
        try {
            const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password.html`
            });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('خطأ في إعادة تعيين كلمة المرور:', error);
            return { success: false, error: error.message };
        }
    }

    // ===================================
    // دوال المستخدمين (Users)
    // ===================================

    // جلب جميع المستخدمين
    async getAllUsers() {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.users)
                .select(`
                    *,
                    user_roles (
                        name,
                        display_name
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('خطأ في جلب المستخدمين:', error);
            return [];
        }
    }

    // جلب مستخدم واحد
    async getUser(userId) {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.users)
                .select(`
                    *,
                    user_roles (
                        name,
                        display_name,
                        permissions
                    )
                `)
                .eq('id', userId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('خطأ في جلب المستخدم:', error);
            return null;
        }
    }

    // تحديث مستخدم
    async updateUser(userId, updates) {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.users)
                .update(updates)
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('خطأ في تحديث المستخدم:', error);
            throw error;
        }
    }

    // حذف مستخدم (الطريقة القديمة - للتوافق)
    async deleteUser(userId) {
        try {
            const { error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.users)
                .delete()
                .eq('id', userId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('خطأ في حذف المستخدم:', error);
            throw error;
        }
    }

    // حذف مستخدم مع الأرشفة (الطريقة الجديدة)
    async deleteUserWithArchive(userId, reason = null) {
        try {
            const currentUser = await this.getCurrentUser();
            
            const { data, error } = await this.supabase
                .rpc('delete_user_with_archive', {
                    target_user_id: userId,
                    deleter_user_id: currentUser?.id,
                    reason: reason
                });

            if (error) throw error;
            
            if (!data.success) {
                throw new Error(data.error || 'فشل حذف المستخدم');
            }
            
            return data;
        } catch (error) {
            console.error('خطأ في حذف المستخدم:', error);
            throw error;
        }
    }

    // جلب جميع الحسابات المحذوفة
    async getDeletedAccounts() {
        try {
            const { data, error } = await this.supabase
                .from('deleted_accounts')
                .select(`
                    *,
                    deleted_by_user:users!deleted_accounts_deleted_by_fkey (
                        email,
                        full_name
                    )
                `)
                .order('deleted_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('خطأ في جلب الحسابات المحذوفة:', error);
            return [];
        }
    }

    // حذف حساب محذوف نهائياً
    async permanentlyDeleteAccount(deletedAccountId) {
        try {
            const { data, error } = await this.supabase
                .rpc('permanently_delete_account', {
                    deleted_account_id: deletedAccountId
                });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('خطأ في الحذف النهائي:', error);
            throw error;
        }
    }

    // ===================================
    // دوال الأدوار (Roles)
    // ===================================

    // جلب جميع الأدوار
    async getAllRoles() {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.user_roles)
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('خطأ في جلب الأدوار:', error);
            return [];
        }
    }

    // ===================================
    // دوال الدعوات (Invitations)
    // ===================================

    // إنشاء دعوة جديدة
    async createInvitation(email, roleId) {
        try {
            // إنشاء رمز فريد للدعوة
            const token = this.generateInvitationToken();
            
            // تاريخ انتهاء الدعوة (7 أيام من الآن)
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            // الحصول على المستخدم الحالي
            const currentUser = await this.getCurrentUser();

            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.invitations)
                .insert([{
                    email,
                    role_id: roleId,
                    invited_by: currentUser?.id,
                    token,
                    expires_at: expiresAt.toISOString(),
                    status: 'pending'
                }])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('خطأ في إنشاء الدعوة:', error);
            return { success: false, error: error.message };
        }
    }

    // جلب جميع الدعوات
    async getAllInvitations() {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.invitations)
                .select(`
                    *,
                    user_roles (
                        name,
                        display_name
                    ),
                    invited_by_user:users!invitations_invited_by_fkey (
                        email,
                        full_name
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('خطأ في جلب الدعوات:', error);
            return [];
        }
    }

    // حذف دعوة
    async deleteInvitation(invitationId) {
        try {
            const { error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.invitations)
                .delete()
                .eq('id', invitationId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('خطأ في حذف الدعوة:', error);
            throw error;
        }
    }

    // التحقق من صلاحية الدعوة
    async validateInvitation(token) {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.invitations)
                .select('*')
                .eq('token', token)
                .eq('status', 'pending')
                .single();

            if (error) throw error;

            // التحقق من انتهاء الصلاحية
            const expiresAt = new Date(data.expires_at);
            const now = new Date();

            if (now > expiresAt) {
                return { valid: false, error: 'انتهت صلاحية الدعوة' };
            }

            return { valid: true, data };
        } catch (error) {
            console.error('خطأ في التحقق من الدعوة:', error);
            return { valid: false, error: 'الدعوة غير صالحة' };
        }
    }

    // إرسال دعوة عبر البريد الإلكتروني
    async sendInvitationEmail(invitationId) {
        let invitation = null;
        let invitationLink = '';
        
        try {
            // جلب بيانات الدعوة
            const { data: invData, error: invError } = await this.supabase
                .from(SUPABASE_CONFIG.tables.invitations)
                .select(`
                    *,
                    user_roles (
                        display_name
                    ),
                    invited_by_user:users!invitations_invited_by_fkey (
                        email,
                        full_name
                    )
                `)
                .eq('id', invitationId)
                .single();

            if (invError) throw invError;
            if (!invData) throw new Error('الدعوة غير موجودة');
            
            invitation = invData;

            // إنشاء رابط الدعوة مع المسار الكامل
            const origin = window.location.origin;
            const pathname = window.location.pathname;
            const basePath = pathname.substring(0, pathname.lastIndexOf('/'));
            invitationLink = `${origin}${basePath}/signup.html?token=${invitation.token}`;
            
            console.log('📧 محاولة إرسال البريد الإلكتروني...');
            console.log('📧 ملاحظة: إرسال البريد يتطلب Edge Function منشورة');
            console.log('📋 رابط الدعوة:', invitationLink);

            // محاولة استدعاء Edge Function إذا كانت موجودة
            try {
                const { data, error } = await this.supabase.functions.invoke('send-invitation', {
                    body: { 
                        invitationId,
                        siteUrl: window.location.origin  // إرسال الرابط الحالي
                    }
                });

                if (error) {
                    console.warn('⚠️ خطأ في Edge Function:', error.message);
                    throw error;
                }

                // التحقق من نتيجة Edge Function
                if (data && data.success === true) {
                    console.log('✅ تم إرسال البريد بنجاح عبر Edge Function');
                    return { success: true, data, invitationLink };
                } else {
                    // البريد لم يُرسل - استخدام الوضع اليدوي
                    console.log('📋 الوضع اليدوي: الرابط جاهز للنسخ');
                    return { 
                        success: false, 
                        error: data?.error || 'إرسال البريد غير متاح حالياً. يمكنك نسخ الرابط وإرساله يدوياً.',
                        invitationLink,
                        manualMode: true
                    };
                }
            } catch (edgeFunctionError) {
                // Edge Function غير متوفرة أو فشلت
                console.warn('⚠️ Edge Function غير متوفرة:', edgeFunctionError.message);
                
                return { 
                    success: false, 
                    error: 'إرسال البريد غير متاح حالياً. يمكنك نسخ الرابط وإرساله يدوياً.',
                    invitationLink,
                    manualMode: true
                };
            }
        } catch (error) {
            console.error('❌ خطأ في معالجة الدعوة:', error);
            
            return { 
                success: false, 
                error: error.message || 'حدث خطأ غير متوقع',
                invitationLink: invitationLink || `${window.location.origin}/signup.html`,
                manualMode: true
            };
        }
    }

    // إنشاء قالب البريد الإلكتروني
    createInvitationEmailTemplate(invitation, invitationLink) {
        const roleName = invitation.user_roles?.display_name || 'عضو';
        const invitedBy = invitation.invited_by_user?.full_name || invitation.invited_by_user?.email || 'الإدارة';
        const expiryDate = new Date(invitation.expires_at).toLocaleDateString('ar-EG');

        return `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">المكتبة الرقمية</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">دعوة للانضمام إلى الفريق</p>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333; margin-top: 0;">مرحباً!</h2>
                    
                    <p style="color: #666; line-height: 1.6;">
                        تمت دعوتك للانضمام إلى فريق المكتبة الرقمية بصفة <strong>${roleName}</strong>.
                    </p>
                    
                    <p style="color: #666; line-height: 1.6;">
                        <strong>دعوة من:</strong> ${invitedBy}
                    </p>
                    
                    <p style="color: #666; line-height: 1.6;">
                        <strong>البريد الإلكتروني:</strong> ${invitation.email}
                    </p>
                    
                    <p style="color: #666; line-height: 1.6;">
                        للانضمام، يرجى النقر على الزر أدناه لإنشاء حسابك:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${invitationLink}" 
                           style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px;">
                            إنشاء الحساب
                        </a>
                    </div>
                    
                    <p style="color: #999; font-size: 14px; line-height: 1.6;">
                        أو انسخ الرابط التالي في المتصفح:<br>
                        <a href="${invitationLink}" style="color: #667eea; word-break: break-all;">${invitationLink}</a>
                    </p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                        <p style="color: #999; font-size: 13px; margin: 0;">
                            <strong>ملاحظة:</strong> هذه الدعوة صالحة حتى ${expiryDate}
                        </p>
                        <p style="color: #999; font-size: 13px; margin: 10px 0 0 0;">
                            إذا لم تطلب هذه الدعوة، يمكنك تجاهل هذا البريد.
                        </p>
                    </div>
                </div>
                
                <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                    <p style="margin: 0;">© 2024 المكتبة الرقمية. جميع الحقوق محفوظة.</p>
                </div>
            </div>
        `;
    }

    // توليد رمز دعوة فريد
    generateInvitationToken() {
        return 'inv_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    // ===================================
    // دوال مساعدة
    // ===================================

    // إنشاء أول مستخدم إداري
    async createFirstAdmin(email, password, fullName) {
        try {
            // التسجيل في Supabase Auth
            const { data: authData, error: authError } = await this.supabase.auth.signUp({
                email,
                password
            });

            if (authError) throw authError;

            // استدعاء دالة إنشاء الإداري الأول
            const { data: adminData, error: adminError } = await this.supabase
                .rpc('create_first_admin', {
                    admin_email: email,
                    admin_user_id: authData.user.id
                });

            if (adminError) throw adminError;

            if (!adminData) {
                throw new Error('يوجد مستخدمون بالفعل في النظام');
            }

            // تحديث الاسم الكامل
            if (fullName) {
                await this.updateUser(authData.user.id, { full_name: fullName });
            }

            return { success: true, data: authData };
        } catch (error) {
            console.error('خطأ في إنشاء الإداري الأول:', error);
            return { success: false, error: error.message };
        }
    }
}

// إنشاء نسخة واحدة من API
const api = new SupabaseAPI();
