-- =============================================
-- NUVA Campus: Workshops 表
-- 用於動態管理工作坊資料（取代硬編碼）
-- =============================================

-- 先刪除舊表（如果存在）
DROP TABLE IF EXISTS workshops CASCADE;

-- 建立 workshops 表
CREATE TABLE workshops (
  id TEXT PRIMARY KEY,                    -- 例如: 'ws01', 'ws02'
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'offline' CHECK (type IN ('online', 'offline', 'hybrid')),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  online_link TEXT,
  description TEXT,
  max_capacity INTEGER,
  tally_form_id TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_workshops_status ON workshops(status);
CREATE INDEX idx_workshops_date ON workshops(date);

-- RLS
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;

-- 允許公開讀取
DROP POLICY IF EXISTS "Allow public read workshops" ON workshops;
CREATE POLICY "Allow public read workshops" ON workshops
  FOR SELECT USING (true);

-- 允許更新（管理用）
DROP POLICY IF EXISTS "Allow public update workshops" ON workshops;
CREATE POLICY "Allow public update workshops" ON workshops
  FOR UPDATE USING (true);

-- 允許插入（管理用）
DROP POLICY IF EXISTS "Allow public insert workshops" ON workshops;
CREATE POLICY "Allow public insert workshops" ON workshops
  FOR INSERT WITH CHECK (true);

-- 自動更新 updated_at
CREATE OR REPLACE FUNCTION update_workshops_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS workshops_updated_at ON workshops;
CREATE TRIGGER workshops_updated_at
  BEFORE UPDATE ON workshops
  FOR EACH ROW
  EXECUTE FUNCTION update_workshops_updated_at();

-- 插入現有的 workshop 資料（從硬編碼遷移）
INSERT INTO workshops (id, title, type, date, start_time, end_time, location, description, tally_form_id, status)
VALUES
  ('ws02', '故事，是溝通的致勝關鍵！', 'offline', '2026-01-31', '09:30', '17:00', '台北松山', '學習說故事的技巧，成為溝通高手', '9qBWK4', 'upcoming');

-- 啟用 Realtime（忽略錯誤如果已啟用）
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE workshops;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
