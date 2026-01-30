-- =============================================
-- 密碼管理表 (access_passwords)
-- =============================================

CREATE TABLE IF NOT EXISTS access_passwords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 啟用 RLS
ALTER TABLE access_passwords ENABLE ROW LEVEL SECURITY;

-- 允許公開讀取（只讀取啟用的密碼）
CREATE POLICY "Allow public read" ON access_passwords
  FOR SELECT USING (is_active = true);

-- 插入初始密碼資料
INSERT INTO access_passwords (key, password, description) VALUES
  ('guardian', '0001', '守護者專區入口密碼'),
  ('nunu', '0002', '努努專區入口密碼'),
  ('ambassador', '0004', '校園大使專區入口密碼'),
  ('guardian_admin', '0812', '守護者密碼管理區域密碼'),
  ('event_ws02', '0202', 'WS02 活動執行密碼')
ON CONFLICT (key) DO UPDATE SET
  password = EXCLUDED.password,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 建立更新時間觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_access_passwords_updated_at
  BEFORE UPDATE ON access_passwords
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
