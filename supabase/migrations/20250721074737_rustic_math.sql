/*
  # إنشاء جدول الأخبار

  1. الجداول الجديدة
    - `news`
      - `id` (uuid, primary key)
      - `title` (text, عنوان الخبر)
      - `content` (text, محتوى الخبر)
      - `image_url` (text, رابط الصورة)
      - `published` (boolean, منشور أم لا)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. الأمان
    - تفعيل RLS على جدول `news`
    - إضافة سياسات للقراءة والكتابة
*/

CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  image_url text DEFAULT '',
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- سياسة للقراءة للأخبار المنشورة للجميع
CREATE POLICY "Anyone can read published news"
  ON news
  FOR SELECT
  TO anon, authenticated
  USING (published = true);

-- سياسة للقراءة لجميع الأخبار للمستخدمين المصادق عليهم
CREATE POLICY "Authenticated users can read all news"
  ON news
  FOR SELECT
  TO authenticated
  USING (true);

-- سياسة للإدراج والتحديث للمستخدمين المصادق عليهم
CREATE POLICY "Authenticated users can manage news"
  ON news
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_news_published ON news(published);
CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at DESC);