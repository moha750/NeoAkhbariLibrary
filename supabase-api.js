// ملف API للتعامل مع Supabase
// يحتوي على جميع الدوال المطلوبة للتفاعل مع قاعدة البيانات

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

    // التحقق من حالة الاتصال
    isConnected() {
        return this.initialized && this.supabase !== null;
    }
}

// إنشاء نسخة واحدة من API
const api = new SupabaseAPI();
