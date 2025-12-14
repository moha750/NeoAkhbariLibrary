// ===================================
// نظام حماية لوحة التحكم
// Auth Guard System
// ===================================

class AuthGuard {
    constructor() {
        this.currentUser = null;
        this.userRole = null;
        this.permissions = null;
        this.initialized = false;
    }

    // تهيئة نظام الحماية
    async init() {
        if (this.initialized) return;

        try {
            // تهيئة API
            await api.init();

            // الحصول على الجلسة الحالية
            const session = await api.getSession();

            if (!session) {
                this.redirectToLogin();
                return false;
            }

            // الحصول على بيانات المستخدم
            const userData = await api.getCurrentUser();

            if (!userData) {
                this.redirectToLogin();
                return false;
            }

            // التحقق من أن المستخدم نشط
            if (!userData.is_active) {
                alert('حسابك غير نشط. يرجى التواصل مع الإدارة.');
                await api.signOut();
                this.redirectToLogin();
                return false;
            }

            this.currentUser = userData;
            this.userRole = userData.role_name;
            this.permissions = userData.permissions;
            this.initialized = true;

            console.log('✅ تم تهيئة نظام الحماية بنجاح');
            console.log('المستخدم:', this.currentUser.email);
            console.log('الدور:', this.userRole);

            return true;

        } catch (error) {
            console.error('❌ خطأ في تهيئة نظام الحماية:', error);
            this.redirectToLogin();
            return false;
        }
    }

    // التحويل إلى صفحة تسجيل الدخول
    redirectToLogin() {
        const currentPath = window.location.pathname;
        const loginPath = '/login.html';

        // تجنب التكرار إذا كنا بالفعل في صفحة تسجيل الدخول
        if (!currentPath.includes('login.html')) {
            // حفظ الصفحة الحالية للعودة إليها بعد تسجيل الدخول
            sessionStorage.setItem('redirectAfterLogin', currentPath);
            window.location.href = loginPath;
        }
    }

    // التحقق من أن المستخدم مسجل دخول
    isAuthenticated() {
        return this.initialized && this.currentUser !== null;
    }

    // التحقق من أن المستخدم إداري
    isAdmin() {
        return this.isAuthenticated() && this.userRole === 'admin';
    }

    // التحقق من أن المستخدم محرر
    isEditor() {
        return this.isAuthenticated() && this.userRole === 'editor';
    }

    // التحقق من صلاحية معينة
    hasPermission(permissionKey) {
        if (!this.isAuthenticated()) return false;

        // الإداري لديه جميع الصلاحيات
        if (this.permissions && this.permissions.all === true) {
            return true;
        }

        // التحقق من الصلاحية المحددة
        return this.permissions && this.permissions[permissionKey] === true;
    }

    // التحقق من صلاحية الوصول لتبويب معين
    canAccessTab(tabName) {
        if (!this.isAuthenticated()) return false;

        // الإداري يمكنه الوصول لكل شيء
        if (this.isAdmin()) return true;

        // المحرر يمكنه الوصول فقط للمحتوى
        const editorAllowedTabs = ['categories', 'books', 'parts', 'chapters', 'pages', 'publish'];
        
        if (this.isEditor()) {
            return editorAllowedTabs.includes(tabName);
        }

        return false;
    }

    // إخفاء التبويبات غير المصرح بها
    hideUnauthorizedTabs() {
        if (!this.isAuthenticated()) return;

        const allTabs = document.querySelectorAll('.tab-btn');
        
        allTabs.forEach(tab => {
            const tabName = tab.getAttribute('onclick')?.match(/switchTab\('(.+?)'\)/)?.[1];
            
            if (tabName && !this.canAccessTab(tabName)) {
                tab.style.display = 'none';
            }
        });
    }

    // عرض معلومات المستخدم في الواجهة
    displayUserInfo() {
        if (!this.isAuthenticated()) return;

        // إنشاء عنصر معلومات المستخدم
        const userInfoHTML = `
            <div class="user-info" style="display: flex; align-items: center; gap: 15px;">
                <div style="text-align: right;">
                    <div style="font-weight: bold; color: #333;">${this.currentUser.full_name || this.currentUser.email}</div>
                    <div style="font-size: 0.85em; color: #666;">
                        <i class="fas fa-user-tag"></i> ${this.getRoleDisplayName()}
                    </div>
                </div>
                <button onclick="authGuard.logout()" class="btn btn-secondary" style="padding: 10px 20px;">
                    <i class="fas fa-sign-out-alt"></i> تسجيل الخروج
                </button>
            </div>
        `;

        // إضافة معلومات المستخدم إلى الهيدر
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            headerActions.insertAdjacentHTML('afterbegin', userInfoHTML);
        }
    }

    // الحصول على اسم الدور المعروض
    getRoleDisplayName() {
        const roleNames = {
            'admin': 'إداري',
            'editor': 'محرر'
        };
        return roleNames[this.userRole] || this.userRole;
    }

    // تسجيل الخروج
    async logout() {
        if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
            try {
                await api.signOut();
                window.location.href = 'login.html';
            } catch (error) {
                console.error('خطأ في تسجيل الخروج:', error);
                alert('حدث خطأ في تسجيل الخروج');
            }
        }
    }

    // الحصول على المستخدم الحالي
    getCurrentUser() {
        return this.currentUser;
    }

    // الحصول على دور المستخدم
    getUserRole() {
        return this.userRole;
    }

    // الحصول على صلاحيات المستخدم
    getPermissions() {
        return this.permissions;
    }

    // حماية صفحة معينة (استخدام في بداية كل صفحة محمية)
    async protectPage(requiredRole = null) {
        const isInitialized = await this.init();

        if (!isInitialized) {
            return false;
        }

        // التحقق من الدور المطلوب
        if (requiredRole) {
            if (requiredRole === 'admin' && !this.isAdmin()) {
                alert('ليس لديك صلاحية الوصول لهذه الصفحة');
                window.location.href = 'dashboard.html';
                return false;
            }
        }

        // إخفاء التبويبات غير المصرح بها
        this.hideUnauthorizedTabs();

        // عرض معلومات المستخدم
        this.displayUserInfo();

        return true;
    }

    // التحقق من انتهاء الجلسة
    async checkSessionExpiry() {
        try {
            const session = await api.getSession();
            
            if (!session) {
                alert('انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.');
                this.redirectToLogin();
                return false;
            }

            return true;
        } catch (error) {
            console.error('خطأ في التحقق من الجلسة:', error);
            return false;
        }
    }

    // مراقبة حالة المصادقة
    setupAuthListener() {
        if (!api.supabase) return;

        api.supabase.auth.onAuthStateChange((event, session) => {
            console.log('حدث مصادقة:', event);

            if (event === 'SIGNED_OUT') {
                this.redirectToLogin();
            } else if (event === 'TOKEN_REFRESHED') {
                console.log('تم تحديث الرمز بنجاح');
            } else if (event === 'USER_UPDATED') {
                console.log('تم تحديث بيانات المستخدم');
                // إعادة تحميل بيانات المستخدم
                this.init();
            }
        });
    }
}

// إنشاء نسخة واحدة من AuthGuard
const authGuard = new AuthGuard();

// التحقق التلقائي من الجلسة كل 5 دقائق
setInterval(() => {
    if (authGuard.isAuthenticated()) {
        authGuard.checkSessionExpiry();
    }
}, 5 * 60 * 1000);

// ===================================
// دوال مساعدة عامة
// ===================================

// حماية صفحة لوحة التحكم
async function protectDashboard() {
    return await authGuard.protectPage();
}

// حماية صفحة للإداريين فقط
async function protectAdminPage() {
    return await authGuard.protectPage('admin');
}

// التحقق من صلاحية قبل تنفيذ إجراء
function requirePermission(permissionKey, action) {
    if (!authGuard.hasPermission(permissionKey)) {
        alert('ليس لديك صلاحية لتنفيذ هذا الإجراء');
        return false;
    }
    
    if (typeof action === 'function') {
        action();
    }
    
    return true;
}

// التحقق من أن المستخدم إداري قبل تنفيذ إجراء
function requireAdmin(action) {
    if (!authGuard.isAdmin()) {
        alert('هذا الإجراء متاح للإداريين فقط');
        return false;
    }
    
    if (typeof action === 'function') {
        action();
    }
    
    return true;
}

console.log('✅ تم تحميل نظام حماية لوحة التحكم');
