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
            
            // تسجيل النشاط
            await this.logActivity('login', { email });
            
            return data;
        } catch (error) {
            console.error('خطأ في تسجيل الدخول:', error);
            throw error;
        }
    }

    // تسجيل الخروج
    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            
            // تسجيل النشاط
            await this.logActivity('logout', {});
            
            return true;
        } catch (error) {
            console.error('خطأ في تسجيل الخروج:', error);
            throw error;
        }
    }

    // الحصول على المستخدم الحالي
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await this.supabase.auth.getUser();
            if (error) throw error;
            return user;
        } catch (error) {
            console.error('خطأ في جلب المستخدم:', error);
            return null;
        }
    }

    // الحصول على الجلسة الحالية
    async getSession() {
        try {
            const { data: { session }, error } = await this.supabase.auth.getSession();
            if (error) throw error;
            return session;
        } catch (error) {
            console.error('خطأ في جلب الجلسة:', error);
            return null;
        }
    }

    // التسجيل بدعوة
    async signUpWithInvitation(token, password, fullName) {
        try {
            // التحقق من الدعوة
            const { data: invitation, error: invError } = await this.supabase
                .from('invitations')
                .select('*')
                .eq('token', token)
                .eq('status', 'pending')
                .single();

            if (invError || !invitation) {
                throw new Error('الدعوة غير صالحة أو منتهية الصلاحية');
            }

            // التحقق من انتهاء الصلاحية
            if (new Date(invitation.expires_at) < new Date()) {
                throw new Error('انتهت صلاحية الدعوة');
            }

            // إنشاء الحساب
            const { data: authData, error: signUpError } = await this.supabase.auth.signUp({
                email: invitation.email,
                password: password,
                options: {
                    data: {
                        full_name: fullName,
                        role: invitation.role
                    }
                }
            });

            if (signUpError) throw signUpError;

            // تحديث حالة الدعوة
            await this.supabase
                .from('invitations')
                .update({
                    status: 'accepted',
                    accepted_at: new Date().toISOString()
                })
                .eq('id', invitation.id);

            return authData;
        } catch (error) {
            console.error('خطأ في التسجيل:', error);
            throw error;
        }
    }

    // ===================================
    // دوال الملفات الشخصية (Profiles)
    // ===================================

    // جلب الملف الشخصي
    async getProfile(userId) {
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('خطأ في جلب الملف الشخصي:', error);
            return null;
        }
    }

    // جلب جميع المستخدمين (للإداريين فقط)
    async getAllUsers() {
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('خطأ في جلب المستخدمين:', error);
            return [];
        }
    }

    // تحديث الملف الشخصي
    async updateProfile(userId, updates) {
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            
            // تسجيل النشاط
            await this.logActivity('update_profile', { userId, updates });
            
            return data;
        } catch (error) {
            console.error('خطأ في تحديث الملف الشخصي:', error);
            throw error;
        }
    }

    // حذف مستخدم (للإداريين فقط)
    async deleteUser(userId) {
        try {
            const { error } = await this.supabase
                .from('profiles')
                .delete()
                .eq('id', userId);

            if (error) throw error;
            
            // تسجيل النشاط
            await this.logActivity('delete_user', { userId });
            
            return true;
        } catch (error) {
            console.error('خطأ في حذف المستخدم:', error);
            throw error;
        }
    }

    // ===================================
    // دوال الدعوات (Invitations)
    // ===================================

    // إنشاء دعوة جديدة (للإداريين فقط)
    async createInvitation(email, role) {
        try {
            // التحقق من صلاحيات الإداري
            const user = await this.getCurrentUser();
            const profile = await this.getProfile(user?.id);
            
            if (!profile || profile.role !== 'admin') {
                throw new Error('غير مصرح لك بإرسال الدعوات. الإداريون فقط.');
            }

            const token = this.generateToken();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7); // تنتهي بعد 7 أيام

            const { data, error } = await this.supabase
                .from('invitations')
                .insert([{
                    email,
                    role,
                    invited_by: user?.id,
                    token,
                    expires_at: expiresAt.toISOString()
                }])
                .select()
                .single();

            if (error) throw error;
            
            // تسجيل النشاط
            await this.logActivity('create_invitation', { email, role });
            
            // إرسال البريد الإلكتروني
            try {
                const inviteLink = `${window.location.origin}/signup.html?token=${token}`;
                await this.sendInvitationEmail(email, role, inviteLink, profile.full_name);
                console.log('✅ تم إرسال البريد الإلكتروني بنجاح');
            } catch (emailError) {
                console.warn('⚠️ فشل إرسال البريد الإلكتروني:', emailError);
                // لا نرمي خطأ هنا لأن الدعوة تم إنشاؤها بنجاح
                // المستخدم يمكنه نسخ الرابط يدوياً
            }
            
            return data;
        } catch (error) {
            console.error('خطأ في إنشاء الدعوة:', error);
            throw error;
        }
    }

    // إرسال بريد إلكتروني للدعوة
    async sendInvitationEmail(email, role, inviteLink, inviterName) {
        try {
            // محاولة استخدام Edge Function أولاً
            try {
                const { data, error } = await this.supabase.functions.invoke('send-invitation', {
                    body: {
                        email,
                        role,
                        inviteLink,
                        inviterName
                    }
                });

                if (error) throw error;
                return data;
            } catch (edgeFunctionError) {
                console.warn('⚠️ Edge Function غير متاح، استخدام Resend API...');
                
                // البديل: استخدام Resend API مباشرة
                // ضع API Key هنا من https://resend.com
                const RESEND_API_KEY = 'YOUR_RESEND_API_KEY_HERE';
                
                if (RESEND_API_KEY === 'YOUR_RESEND_API_KEY_HERE') {
                    throw new Error('يرجى إضافة Resend API Key في supabase-api.js');
                }
                
                return await this.sendViaResend(email, role, inviteLink, inviterName, RESEND_API_KEY);
            }
        } catch (error) {
            console.error('خطأ في إرسال البريد:', error);
            throw error;
        }
    }

    // إرسال عبر Resend API (بديل)
    async sendViaResend(email, role, inviteLink, inviterName, apiKey) {
        const roleText = role === 'admin' ? 'إداري' : 'محرر';
        
        const emailHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"></head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, sans-serif; background: #f4f4f4;">
    <table style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table style="width: 600px; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px 10px 0 0;">
                            <h1 style="margin: 0; color: white; font-size: 28px;">📧<br>دعوة للانضمام</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="color: #333; margin: 0 0 20px 0;">مرحباً!</h2>
                            <p style="color: #666; line-height: 1.8;">تم دعوتك من قبل <strong style="color: #667eea;">${inviterName}</strong> للانضمام إلى فريق العمل.</p>
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-right: 4px solid #667eea; margin: 20px 0;">
                                <p style="margin: 0; color: #333;"><strong>الدور المخصص لك:</strong> <span style="color: #667eea; font-weight: bold;">${roleText}</span></p>
                            </div>
                            <table style="margin: 30px 0;">
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="${inviteLink}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">قبول الدعوة والانضمام</a>
                                    </td>
                                </tr>
                            </table>
                            <p style="color: #999; font-size: 14px;">أو انسخ الرابط:<br><a href="${inviteLink}" style="color: #667eea;">${inviteLink}</a></p>
                            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-right: 4px solid #ffc107; margin: 30px 0 0 0;">
                                <p style="margin: 0; color: #856404; font-size: 14px;">⚠️ <strong>ملاحظة:</strong> صالحة لمدة 7 أيام فقط.</p>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px; text-align: center;">
                            <p style="margin: 0; color: #999; font-size: 14px;">إذا لم تكن تتوقع هذه الدعوة، يمكنك تجاهلها.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'نظام الدعوات <onboarding@resend.dev>',
                to: email,
                subject: 'دعوة للانضمام إلى فريق العمل',
                html: emailHtml
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'فشل إرسال البريد');
        }

        return await response.json();
    }

    // جلب جميع الدعوات
    async getInvitations() {
        try {
            const { data, error } = await this.supabase
                .from('invitations')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('خطأ في جلب الدعوات:', error);
            return [];
        }
    }

    // التحقق من الدعوة
    async verifyInvitation(token) {
        try {
            // استخدام maybeSingle() بدلاً من single() لتجنب خطأ 406
            const { data, error } = await this.supabase
                .from('invitations')
                .select('*')
                .eq('token', token)
                .eq('status', 'pending')
                .maybeSingle();

            // إذا كان هناك خطأ في الاستعلام نفسه
            if (error) {
                console.error('خطأ في الاستعلام:', error);
                throw error;
            }

            // إذا لم يتم العثور على دعوة
            if (!data) {
                return { valid: false, message: 'الدعوة غير موجودة أو تم استخدامها' };
            }

            // التحقق من انتهاء الصلاحية
            if (new Date(data.expires_at) < new Date()) {
                return { valid: false, message: 'انتهت صلاحية الدعوة' };
            }

            return { valid: true, invitation: data };
        } catch (error) {
            console.error('خطأ في التحقق من الدعوة:', error);
            return { valid: false, message: 'حدث خطأ أثناء التحقق من الدعوة' };
        }
    }

    // حذف دعوة
    async deleteInvitation(invitationId) {
        try {
            const { error } = await this.supabase
                .from('invitations')
                .delete()
                .eq('id', invitationId);

            if (error) throw error;
            
            // تسجيل النشاط
            await this.logActivity('delete_invitation', { invitationId });
            
            return true;
        } catch (error) {
            console.error('خطأ في حذف الدعوة:', error);
            throw error;
        }
    }

    // إعادة إرسال دعوة
    async resendInvitation(invitationId) {
        try {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            const { data, error } = await this.supabase
                .from('invitations')
                .update({
                    expires_at: expiresAt.toISOString(),
                    status: 'pending'
                })
                .eq('id', invitationId)
                .select()
                .single();

            if (error) throw error;
            
            // تسجيل النشاط
            await this.logActivity('resend_invitation', { invitationId });
            
            return data;
        } catch (error) {
            console.error('خطأ في إعادة إرسال الدعوة:', error);
            throw error;
        }
    }

    // ===================================
    // دوال سجل النشاطات (Activity Log)
    // ===================================

    // تسجيل نشاط
    async logActivity(action, details = {}) {
        try {
            const user = await this.getCurrentUser();
            
            const { error } = await this.supabase
                .from('activity_log')
                .insert([{
                    user_id: user?.id,
                    action,
                    details,
                    ip_address: null, // يمكن إضافة IP من الخادم
                    user_agent: navigator.userAgent
                }]);

            if (error) throw error;
        } catch (error) {
            console.error('خطأ في تسجيل النشاط:', error);
        }
    }

    // جلب سجل النشاطات
    async getActivityLog(limit = 50) {
        try {
            const { data, error } = await this.supabase
                .from('activity_log')
                .select(`
                    *,
                    profiles:user_id (full_name, email)
                `)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('خطأ في جلب سجل النشاطات:', error);
            return [];
        }
    }

    // ===================================
    // دوال مساعدة
    // ===================================

    // توليد رمز عشوائي للدعوة
    generateToken() {
        return 'inv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
    }

    // التحقق من حالة الاتصال
    isConnected() {
        return this.initialized && this.supabase !== null;
    }
}

// إنشاء نسخة واحدة من API
const api = new SupabaseAPI();
