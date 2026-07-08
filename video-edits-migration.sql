-- ==========================================================
-- Supabase video_edits 表创建 SQL
-- ==========================================================
-- 在 Supabase 控制台 → SQL Editor 中执行此脚本
-- 路径：https://supabase.com/dashboard/project/_/sql
-- ==========================================================

-- 1. 创建 video_edits 表
CREATE TABLE IF NOT EXISTS video_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  videoUrl TEXT,
  videoFile TEXT,
  duration TEXT,
  category TEXT,
  tags TEXT DEFAULT '[]',
  software TEXT DEFAULT '[]',
  prompt TEXT,
  workflow TEXT DEFAULT '[]',
  status TEXT DEFAULT 'published',
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 启用 RLS
ALTER TABLE video_edits ENABLE ROW LEVEL SECURITY;

-- 3. 删除已存在的策略（避免重复执行报错）
DROP POLICY IF EXISTS "Allow public read access" ON video_edits;
DROP POLICY IF EXISTS "Allow anon insert access" ON video_edits;
DROP POLICY IF EXISTS "Allow anon update access" ON video_edits;
DROP POLICY IF EXISTS "Allow anon delete access" ON video_edits;

-- 4. 创建 RLS 策略
-- 任何人都可以读取
CREATE POLICY "Allow public read access"
  ON video_edits
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 允许匿名用户插入（管理后台通过密码保护）
CREATE POLICY "Allow anon insert access"
  ON video_edits
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 允许匿名用户更新
CREATE POLICY "Allow anon update access"
  ON video_edits
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 允许匿名用户删除
CREATE POLICY "Allow anon delete access"
  ON video_edits
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- 5. 验证表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'video_edits'
ORDER BY ordinal_position;
