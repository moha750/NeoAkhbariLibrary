-- جدول الزوار (Visitors)
-- قم بتشغيل هذا الكود في SQL Editor في Supabase

CREATE TABLE IF NOT EXISTS visitors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    visitor_id TEXT NOT NULL,
    is_returning BOOLEAN DEFAULT FALSE,
    country TEXT DEFAULT 'Unknown',
    device_type TEXT DEFAULT 'Unknown',
    browser TEXT DEFAULT 'Unknown',
    os TEXT DEFAULT 'Unknown',
    screen_resolution TEXT DEFAULT 'Unknown',
    language TEXT DEFAULT 'Unknown',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- إنشاء فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON visitors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_country ON visitors(country);
CREATE INDEX IF NOT EXISTS idx_visitors_device ON visitors(device_type);
CREATE INDEX IF NOT EXISTS idx_visitors_returning ON visitors(is_returning);

-- تفعيل Row Level Security
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- سياسة للسماح بالقراءة للجميع
CREATE POLICY "Allow public read access" ON visitors
    FOR SELECT
    USING (true);

-- سياسة للسماح بالإضافة للجميع
CREATE POLICY "Allow public insert access" ON visitors
    FOR INSERT
    WITH CHECK (true);

-- ملاحظة: يمكنك تعديل السياسات حسب احتياجاتك الأمنية
