-- ==========================================================
-- Supabase artworks 表字段补全 SQL
-- ==========================================================
-- 在 Supabase 控制台 → SQL Editor 中执行此脚本
-- 路径：https://supabase.com/dashboard/project/_/sql
-- ==========================================================

-- 1. 添加 prompt 字段
ALTER TABLE artworks
  ADD COLUMN IF NOT EXISTS prompt TEXT;

-- 2. 添加 negativePrompt 字段
ALTER TABLE artworks
  ADD COLUMN IF NOT EXISTS "negativePrompt" TEXT;

-- 3. 添加 model 字段
ALTER TABLE artworks
  ADD COLUMN IF NOT EXISTS model TEXT;

-- 4. 添加 dimensions 字段（尺寸）
ALTER TABLE artworks
  ADD COLUMN IF NOT EXISTS dimensions TEXT;

-- 5. 添加 description 字段（作品描述）
ALTER TABLE artworks
  ADD COLUMN IF NOT EXISTS description TEXT;

-- 6. 如果 categories 列也不存在，一并添加
ALTER TABLE artworks
  ADD COLUMN IF NOT EXISTS categories TEXT;

-- 7. 验证：执行下面的 SQL 查看表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'artworks'
ORDER BY ordinal_position;
