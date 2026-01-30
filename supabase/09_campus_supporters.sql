-- 校園巡迴應援資料表
-- NUVA Campus Tour Supporters
--
-- 執行方式：在 Supabase SQL Editor 中執行此檔案

-- 先刪除舊的 view（如果存在）
DROP VIEW IF EXISTS university_support_stats;

-- 刪除舊表（如果存在）
DROP TABLE IF EXISTS campus_supporters CASCADE;

-- 建立應援者資料表
CREATE TABLE campus_supporters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  university_id TEXT NOT NULL,
  university_name TEXT NOT NULL,
  city TEXT NOT NULL,
  supporter_name TEXT NOT NULL,
  supporter_email TEXT NOT NULL,
  support_type TEXT NOT NULL CHECK (support_type IN ('attend', 'help')),
  organization TEXT,        -- 單位（僅 help 類型使用）
  job_title TEXT,           -- 職稱（僅 help 類型使用）
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- 防止重複應援（同一人對同一學校同一類型只能應援一次）
  UNIQUE(university_id, supporter_email, support_type)
);

-- 索引優化
CREATE INDEX idx_campus_supporters_university ON campus_supporters(university_id);
CREATE INDEX idx_campus_supporters_type ON campus_supporters(support_type);
CREATE INDEX idx_campus_supporters_created ON campus_supporters(created_at DESC);

-- 學校應援統計視圖
CREATE VIEW university_support_stats AS
SELECT
  university_id,
  university_name,
  city,
  COUNT(*) as total_supporters,
  COUNT(*) FILTER (WHERE support_type = 'attend') as attend_count,
  COUNT(*) FILTER (WHERE support_type = 'help') as help_count,
  MAX(created_at) as latest_support
FROM campus_supporters
GROUP BY university_id, university_name, city
ORDER BY total_supporters DESC;

-- 啟用 RLS
ALTER TABLE campus_supporters ENABLE ROW LEVEL SECURITY;

-- 允許匿名插入（讓未登入的使用者也可以應援）
CREATE POLICY "Allow anonymous insert"
  ON campus_supporters
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 允許匿名讀取（讓所有人都可以看到應援資料）
CREATE POLICY "Allow anonymous read"
  ON campus_supporters
  FOR SELECT
  TO anon
  USING (true);

-- 允許 authenticated 用戶插入
CREATE POLICY "Allow authenticated insert"
  ON campus_supporters
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 允許 authenticated 用戶讀取
CREATE POLICY "Allow authenticated read"
  ON campus_supporters
  FOR SELECT
  TO authenticated
  USING (true);

-- 測試資料（可選，取消註解執行）
-- INSERT INTO campus_supporters (university_id, university_name, city, supporter_name, supporter_email, support_type, message) VALUES
-- ('ntu', '國立臺灣大學', '台北市', '林上哲', 'test@example.com', 'attend', '很期待！'),
-- ('nthu', '國立清華大學', '新竹市', 'Lisa Chen', 'lisa@example.com', 'help', '我可以幫忙聯繫學校');

COMMENT ON TABLE campus_supporters IS '校園巡迴應援資料';
COMMENT ON COLUMN campus_supporters.support_type IS 'attend = 想參加活動, help = 可以幫忙';
COMMENT ON COLUMN campus_supporters.organization IS '單位（僅 help 類型使用）';
COMMENT ON COLUMN campus_supporters.job_title IS '職稱（僅 help 類型使用）';
