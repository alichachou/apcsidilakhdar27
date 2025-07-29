/*
  # إنشاء جدول المشاريع

  1. الجداول الجديدة
    - `projects`
      - `id` (uuid, primary key)
      - `title` (text, عنوان المشروع)
      - `description` (text, وصف المشروع)
      - `image_url` (text, رابط الصورة)
      - `status` (text, حالة المشروع)
      - `year` (integer, سنة المشروع)
      - `published` (boolean, منشور أم لا)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. الأمان
    - تفعيل RLS على جدول `projects`
    - إضافة سياسات للقراءة والكتابة
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  image_url text DEFAULT '',
  status text NOT NULL DEFAULT 'planned',
  year integer DEFAULT EXTRACT(year FROM now()),
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- سياسة للقراءة للمشاريع المنشورة للجميع
CREATE POLICY "Anyone can read published projects"
  ON projects
  FOR SELECT
  TO anon, authenticated
  USING (published = true);

-- سياسة للقراءة لجميع المشاريع للمستخدمين المصادق عليهم
CREATE POLICY "Authenticated users can read all projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (true);

-- سياسة للإدراج والتحديث للمستخدمين المصادق عليهم
CREATE POLICY "Authenticated users can manage projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(published);
CREATE INDEX IF NOT EXISTS idx_projects_year ON projects(year DESC);