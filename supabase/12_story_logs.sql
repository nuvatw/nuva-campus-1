-- ============================================
-- Story Logs & Templates
-- 故事進度紀錄與模板系統
-- ============================================

-- 1. story_logs 表：儲存巡迴故事紀錄
CREATE TABLE IF NOT EXISTS story_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  log_date DATE NOT NULL,
  log_time TIME NOT NULL,
  location TEXT NOT NULL,
  content TEXT NOT NULL,
  recorder TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 排序索引（最新在上）
CREATE INDEX IF NOT EXISTS idx_story_logs_created_at ON story_logs (created_at DESC);

-- 啟用 RLS
ALTER TABLE story_logs ENABLE ROW LEVEL SECURITY;

-- 公開讀取
CREATE POLICY "story_logs_select" ON story_logs
  FOR SELECT USING (true);

-- anon 可新增（前端密碼保護）
CREATE POLICY "story_logs_insert" ON story_logs
  FOR INSERT WITH CHECK (true);

-- anon 可刪除（前端密碼保護）
CREATE POLICY "story_logs_delete" ON story_logs
  FOR DELETE USING (true);

-- 自動更新 updated_at
CREATE OR REPLACE FUNCTION update_story_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_story_logs_updated_at
  BEFORE UPDATE ON story_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_story_logs_updated_at();


-- 2. story_templates 表：儲存常用模板
CREATE TABLE IF NOT EXISTS story_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT DEFAULT '',
  content TEXT DEFAULT '',
  recorder TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 啟用 RLS
ALTER TABLE story_templates ENABLE ROW LEVEL SECURITY;

-- 公開讀取
CREATE POLICY "story_templates_select" ON story_templates
  FOR SELECT USING (true);

-- anon 可新增
CREATE POLICY "story_templates_insert" ON story_templates
  FOR INSERT WITH CHECK (true);

-- anon 可刪除
CREATE POLICY "story_templates_delete" ON story_templates
  FOR DELETE USING (true);
