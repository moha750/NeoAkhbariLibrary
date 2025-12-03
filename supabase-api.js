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
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.books)
                .select('*')
                .eq('published', true)
                .ilike('title', `%${searchTerm}%`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('خطأ في البحث:', error);
            return [];
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

    // إضافة صفحة
    async addPage(bookId, pageNumber, content) {
        try {
            const { data, error } = await this.supabase
                .from(SUPABASE_CONFIG.tables.pages)
                .insert([{ book_id: bookId, page_number: pageNumber, content }])
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
                .insert([messageData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('خطأ في إرسال الرسالة:', error);
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
