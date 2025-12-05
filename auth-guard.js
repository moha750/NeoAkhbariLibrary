// نظام حماية لوحة التحكم
// Authentication Guard System

class AuthGuard {
    constructor() {
        this.currentUser = null;
        this.currentProfile = null;
        this.isInitialized = false;
        this._isRedirecting = false;
    }

    // تهيئة نظام الحماية
    async init() {
        try {
            // التحقق من وجود جلسة نشطة
            const session = await api.getSession();
            
            if (!session) {
                this.redirectToLogin();
                return false;
            }

            // جلب المستخدم الحالي
            this.currentUser = await api.getCurrentUser();
            
            if (!this.currentUser) {
                this.redirectToLogin();
                return false;
            }

            // جلب الملف الشخصي
            this.currentProfile = await api.getProfile(this.currentUser.id);
            
            if (!this.currentProfile) {
                console.error('لم يتم العثور على الملف الشخصي');
                this.redirectToLogin();
                return false;
            }

            this.isInitialized = true;
            
            // تطبيق الصلاحيات
            this.applyPermissions();
            
            // عرض معلومات المستخدم
            this.displayUserInfo();
            
            console.log('✅ تم التحقق من الصلاحيات:', this.currentProfile.role);
            
            return true;
        } catch (error) {
            console.error('❌ خطأ في نظام الحماية:', error);
            this.redirectToLogin();
            return false;
        }
    }

    // التحويل إلى صفحة تسجيل الدخول
    redirectToLogin() {
        // منع إعادة التحويل المتكررة
        if (this._isRedirecting) {
            return;
        }
        this._isRedirecting = true;
        
        console.log('🔄 التحويل إلى صفحة تسجيل الدخول...');
        const currentPage = window.location.pathname;
        
        // استخدام setTimeout لتجنب حلقات التحديث
        setTimeout(() => {
            window.location.href = `login.html?redirect=${encodeURIComponent(currentPage)}`;
        }, 100);
    }

    // تطبيق الصلاحيات حسب الدور
    applyPermissions() {
        const role = this.currentProfile.role;
        
        if (role === 'editor') {
            // المحرر: إخفاء جميع التبويبات ماعدا الصفحات
            this.hideTabsForEditor();
        } else if (role === 'admin') {
            // الإداري: إظهار جميع التبويبات
            this.showAllTabs();
        }
    }

    // إخفاء التبويبات للمحرر
    hideTabsForEditor() {
        const tabsToHide = [
            'categories-tab',
            'books-tab',
            'parts-tab',
            'publish-tab',
            'analytics-tab',
            'messages-tab',
            'team-tab'
        ];

        const tabButtonsToHide = [
            'categories',
            'books',
            'parts',
            'publish',
            'analytics',
            'messages',
            'team'
        ];

        // إخفاء محتوى التبويبات
        tabsToHide.forEach(tabId => {
            const tab = document.getElementById(tabId);
            if (tab) {
                tab.style.display = 'none';
            }
        });

        // إخفاء أزرار التبويبات
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            const onclick = btn.getAttribute('onclick');
            if (onclick) {
                tabButtonsToHide.forEach(tabName => {
                    if (onclick.includes(`'${tabName}'`)) {
                        btn.style.display = 'none';
                    }
                });
            }
        });

        // التحويل تلقائياً إلى تبويب الصفحات
        setTimeout(() => {
            const pagesTab = document.querySelector('[onclick*="pages"]');
            if (pagesTab) {
                pagesTab.click();
            }
        }, 100);
    }

    // إظهار جميع التبويبات للإداري
    showAllTabs() {
        // جميع التبويبات مرئية افتراضياً
        console.log('✅ الإداري: جميع الصلاحيات متاحة');
    }

    // عرض معلومات المستخدم
    displayUserInfo() {
        // إنشاء عنصر معلومات المستخدم إذا لم يكن موجوداً
        let userInfoDiv = document.getElementById('userInfo');
        
        if (!userInfoDiv) {
            userInfoDiv = document.createElement('div');
            userInfoDiv.id = 'userInfo';
            userInfoDiv.style.cssText = `
                position: fixed;
                top: 20px;
                left: 20px;
                background: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                gap: 15px;
                z-index: 1000;
            `;
            document.body.appendChild(userInfoDiv);
        }

        const roleText = this.currentProfile.role === 'admin' ? 'إداري' : 'محرر';
        const roleColor = this.currentProfile.role === 'admin' ? '#667eea' : '#4caf50';

        userInfoDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 1.2em;
                ">
                    ${this.currentProfile.full_name.charAt(0)}
                </div>
                <div>
                    <div style="font-weight: 600; color: #333; font-size: 0.95em;">
                        ${this.currentProfile.full_name}
                    </div>
                    <div style="font-size: 0.85em; color: ${roleColor}; font-weight: 500;">
                        <i class="fas fa-shield-alt"></i> ${roleText}
                    </div>
                </div>
            </div>
            <button 
                onclick="authGuard.logout()" 
                style="
                    background: #f44336;
                    color: white;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.9em;
                    transition: all 0.3s;
                "
                onmouseover="this.style.background='#d32f2f'"
                onmouseout="this.style.background='#f44336'"
            >
                <i class="fas fa-sign-out-alt"></i> خروج
            </button>
        `;
    }

    // تسجيل الخروج
    async logout() {
        if (!confirm('هل أنت متأكد من تسجيل الخروج؟')) {
            return;
        }

        try {
            await api.signOut();
            window.location.href = 'login.html';
        } catch (error) {
            console.error('خطأ في تسجيل الخروج:', error);
            alert('حدث خطأ في تسجيل الخروج');
        }
    }

    // التحقق من صلاحية الإداري
    isAdmin() {
        return this.currentProfile && this.currentProfile.role === 'admin';
    }

    // التحقق من صلاحية المحرر
    isEditor() {
        return this.currentProfile && this.currentProfile.role === 'editor';
    }

    // الحصول على المستخدم الحالي
    getCurrentUser() {
        return this.currentUser;
    }

    // الحصول على الملف الشخصي الحالي
    getCurrentProfile() {
        return this.currentProfile;
    }
}

// إنشاء نسخة واحدة من AuthGuard
const authGuard = new AuthGuard();

// دالة للتهيئة (يتم استدعاؤها من dashboard.html)
async function initAuthGuard() {
    // الانتظار حتى يتم تهيئة API
    if (typeof api === 'undefined') {
        console.error('❌ API غير محمل');
        window.location.href = 'login.html';
        return false;
    }

    // التحقق من تهيئة API
    if (!api.isConnected()) {
        console.error('❌ API غير متصل');
        window.location.href = 'login.html';
        return false;
    }
    
    // تهيئة نظام الحماية
    const isAuthorized = await authGuard.init();
    
    if (!isAuthorized) {
        console.log('❌ غير مصرح بالدخول');
        return false;
    }
    
    console.log('✅ تم التحقق من الصلاحيات بنجاح');
    return true;
}

// مراقبة تغييرات حالة المصادقة (يتم تفعيلها بعد التهيئة)
function setupAuthStateListener() {
    if (typeof api !== 'undefined' && api.supabase) {
        api.supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                console.log('🔒 تم تسجيل الخروج - التحويل إلى صفحة الدخول');
                window.location.href = 'login.html';
            } else if (event === 'TOKEN_REFRESHED') {
                console.log('🔄 تم تحديث الجلسة');
            }
        });
    }
}
