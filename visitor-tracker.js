// نظام تتبع الزوار
class VisitorTracker {
    constructor() {
        this.visitorId = this.getOrCreateVisitorId();
        this.isReturning = this.checkIfReturning();
    }

    // إنشاء أو جلب معرف الزائر الفريد
    getOrCreateVisitorId() {
        let visitorId = localStorage.getItem('visitor_id');
        if (!visitorId) {
            visitorId = this.generateUniqueId();
            localStorage.setItem('visitor_id', visitorId);
            localStorage.setItem('first_visit', new Date().toISOString());
        }
        return visitorId;
    }

    // توليد معرف فريد
    generateUniqueId() {
        return 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // التحقق من كون الزائر عائد
    checkIfReturning() {
        const firstVisit = localStorage.getItem('first_visit');
        if (!firstVisit) {
            return false;
        }
        
        // إذا مر أكثر من 30 دقيقة على أول زيارة، يعتبر زائر عائد
        const firstVisitTime = new Date(firstVisit).getTime();
        const now = new Date().getTime();
        const thirtyMinutes = 30 * 60 * 1000;
        
        return (now - firstVisitTime) > thirtyMinutes;
    }

    // الحصول على نوع الجهاز
    getDeviceType() {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return 'Tablet';
        }
        if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
            return 'Mobile';
        }
        return 'Desktop';
    }

    // الحصول على المتصفح
    getBrowser() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        
        if (ua.indexOf('Firefox') > -1) {
            browser = 'Firefox';
        } else if (ua.indexOf('SamsungBrowser') > -1) {
            browser = 'Samsung Internet';
        } else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) {
            browser = 'Opera';
        } else if (ua.indexOf('Trident') > -1) {
            browser = 'Internet Explorer';
        } else if (ua.indexOf('Edge') > -1) {
            browser = 'Edge';
        } else if (ua.indexOf('Chrome') > -1) {
            browser = 'Chrome';
        } else if (ua.indexOf('Safari') > -1) {
            browser = 'Safari';
        }
        
        return browser;
    }

    // الحصول على نظام التشغيل
    getOS() {
        const ua = navigator.userAgent;
        let os = 'Unknown';
        
        if (ua.indexOf('Win') > -1) os = 'Windows';
        else if (ua.indexOf('Mac') > -1) os = 'MacOS';
        else if (ua.indexOf('Linux') > -1) os = 'Linux';
        else if (ua.indexOf('Android') > -1) os = 'Android';
        else if (ua.indexOf('like Mac') > -1) os = 'iOS';
        
        return os;
    }

    // الحصول على دقة الشاشة
    getScreenResolution() {
        return `${window.screen.width}x${window.screen.height}`;
    }

    // الحصول على اللغة
    getLanguage() {
        return navigator.language || navigator.userLanguage || 'Unknown';
    }

    // الحصول على الدولة (باستخدام API خارجي)
    async getCountry() {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            return data.country_name || 'Unknown';
        } catch (error) {
            console.error('خطأ في جلب الدولة:', error);
            return 'Unknown';
        }
    }

    // تسجيل الزيارة
    async trackVisit() {
        try {
            // التحقق من عدم تسجيل نفس الزيارة مرتين في نفس الجلسة
            if (sessionStorage.getItem('visit_tracked')) {
                return;
            }

            const country = await this.getCountry();
            
            const visitorData = {
                visitor_id: this.visitorId,
                is_returning: this.isReturning,
                country: country,
                device_type: this.getDeviceType(),
                browser: this.getBrowser(),
                os: this.getOS(),
                screen_resolution: this.getScreenResolution(),
                language: this.getLanguage()
            };

            // تسجيل الزيارة في قاعدة البيانات
            await api.addVisitor(visitorData);
            
            // تعليم الجلسة كمسجلة
            sessionStorage.setItem('visit_tracked', 'true');
            
            console.log('✅ تم تسجيل الزيارة بنجاح');
        } catch (error) {
            console.error('❌ خطأ في تسجيل الزيارة:', error);
        }
    }
}

// تهيئة وتشغيل تتبع الزوار تلقائياً
let visitorTracker;

window.addEventListener('load', async function() {
    // الانتظار حتى يتم تهيئة API
    if (typeof api !== 'undefined') {
        visitorTracker = new VisitorTracker();
        await visitorTracker.trackVisit();
    }
});
