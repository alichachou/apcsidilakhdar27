/*
  # إنشاء جدول الرسائل

  1. الجداول الجديدة
    - `messages`
      - `id` (uuid, primary key)
      - `name` (text, اسم المرسل)
      - `email` (text, البريد الإلكتروني)
      - `phone` (text, رقم الهاتف)
      - `inquiry_type` (text, نوع الاستفسار)
      - `subject` (text, موضوع الرسالة)
      - `message` (text, محتوى الرسالة)
      - `status` (text, حالة الرسالة)
      - `reply` (text, الرد على الرسالة)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. الأمان
    - تفعيل RLS على جدول `messages`
    - إضافة سياسات للمستخدمين المصادق عليهم
*/

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  inquiry_type text NOT NULL DEFAULT 'other',
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'unread',
  reply text DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- سياسة للقراءة للمستخدمين المصادق عليهم
CREATE POLICY "Authenticated users can read messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (true);

-- سياسة للإدراج للجميع (للنموذج العام)
CREATE POLICY "Anyone can insert messages"
  ON messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- سياسة للتحديث للمستخدمين المصادق عليهم فقط
CREATE POLICY "Authenticated users can update messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);