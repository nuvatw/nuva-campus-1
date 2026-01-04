-- =============================================
-- Nunu Event Registrations Table
-- =============================================

-- 建立 nunu_event_registrations 表
CREATE TABLE IF NOT EXISTS nunu_event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL,  -- 活動 ID (如: 20260110)
  registration_number INTEGER NOT NULL,  -- 報名編號 (從 1 開始)
  chinese_name TEXT NOT NULL,  -- 中文姓名 (用於判斷重複)
  english_name TEXT NOT NULL,  -- 英文姓名
  shirt_size TEXT NOT NULL CHECK (shirt_size IN ('S', 'M', 'L', 'XL', '2XL')),  -- 衣服尺寸
  dietary_restrictions TEXT,  -- 飲食禁忌 (不能吃)
  picky_eating TEXT,  -- 挑食 (不愛吃)
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 每個活動中，每個中文姓名只能報名一次
  UNIQUE(event_id, chinese_name)
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_nunu_event_registrations_event_id
  ON nunu_event_registrations(event_id);

CREATE INDEX IF NOT EXISTS idx_nunu_event_registrations_chinese_name
  ON nunu_event_registrations(chinese_name);

-- 建立更新時間觸發器
CREATE OR REPLACE FUNCTION update_nunu_event_registrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_nunu_event_registrations_updated_at ON nunu_event_registrations;

CREATE TRIGGER trigger_nunu_event_registrations_updated_at
  BEFORE UPDATE ON nunu_event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_nunu_event_registrations_updated_at();

-- =============================================
-- Row Level Security (RLS) 政策
-- =============================================

-- 啟用 RLS
ALTER TABLE nunu_event_registrations ENABLE ROW LEVEL SECURITY;

-- 允許任何人讀取報名資料 (用於顯示報名列表)
CREATE POLICY "Anyone can read nunu_event_registrations"
  ON nunu_event_registrations FOR SELECT
  USING (true);

-- 允許任何人新增報名 (不需要登入)
CREATE POLICY "Anyone can insert nunu_event_registrations"
  ON nunu_event_registrations FOR INSERT
  WITH CHECK (true);

-- 允許任何人更新報名 (用於修改自己的資料)
CREATE POLICY "Anyone can update nunu_event_registrations"
  ON nunu_event_registrations FOR UPDATE
  USING (true);

-- =============================================
-- 啟用 Realtime
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE nunu_event_registrations;

-- =============================================
-- 完成提示
-- =============================================
-- 請在 Supabase Dashboard 的 SQL Editor 中執行此腳本
-- 執行完成後，nunu 活動報名功能即可使用
