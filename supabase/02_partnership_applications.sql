-- =============================================
-- 合作申請表 (partnership_applications)
-- =============================================

CREATE TABLE IF NOT EXISTS partnership_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school TEXT NOT NULL,
  department TEXT NOT NULL,
  job_title TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',  -- pending, contacted, approved, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 啟用 RLS
ALTER TABLE partnership_applications ENABLE ROW LEVEL SECURITY;

-- 允許匿名插入（提交申請）
CREATE POLICY "Allow anonymous insert" ON partnership_applications
  FOR INSERT WITH CHECK (true);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_partnership_applications_status
  ON partnership_applications(status);
CREATE INDEX IF NOT EXISTS idx_partnership_applications_created_at
  ON partnership_applications(created_at DESC);

-- 更新時間觸發器
CREATE TRIGGER update_partnership_applications_updated_at
  BEFORE UPDATE ON partnership_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
