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
-- =============================================
-- 訂閱者表 (newsletter_subscribers)
-- =============================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 啟用 RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- 允許匿名插入（訂閱）
CREATE POLICY "Allow anonymous insert" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email
  ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_is_active
  ON newsletter_subscribers(is_active);
-- =============================================
-- 郵件發送記錄表 (email_logs)
-- =============================================

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT NOT NULL,
  registration_id UUID,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  email_type TEXT NOT NULL,  -- 'checkin_code', 'reminder', 'test', etc.
  status TEXT DEFAULT 'pending',  -- pending, sent, failed
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 啟用 RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- 允許匿名插入（記錄發送）
CREATE POLICY "Allow anonymous insert" ON email_logs
  FOR INSERT WITH CHECK (true);

-- 允許匿名讀取（查看發送記錄）
CREATE POLICY "Allow anonymous select" ON email_logs
  FOR SELECT USING (true);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_email_logs_event_id
  ON email_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_registration_id
  ON email_logs(registration_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status
  ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at
  ON email_logs(created_at DESC);

-- 啟用 Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE email_logs;
-- =============================================
-- 更新 event_registrations 表
-- 新增報到編號和便當編號欄位
-- =============================================

-- 新增報到編號欄位
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS checkin_code CHAR(4);

-- 新增便當編號欄位
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS lunch_code CHAR(4) DEFAULT '0000';

-- 新增郵件發送狀態
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT false;

-- 新增郵件發送時間
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMP WITH TIME ZONE;

-- 新增便當領取狀態
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS lunch_collected BOOLEAN DEFAULT false;

-- 新增便當領取時間
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS lunch_collected_at TIMESTAMP WITH TIME ZONE;

-- 建立唯一索引（同一活動內報到編號不重複）
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_checkin_code
ON event_registrations(event_id, checkin_code)
WHERE checkin_code IS NOT NULL AND checkin_code != '0000';

-- 建立唯一索引（同一活動內便當編號不重複）
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_lunch_code
ON event_registrations(event_id, lunch_code)
WHERE lunch_code IS NOT NULL AND lunch_code != '0000';

-- 建立索引加速查詢
CREATE INDEX IF NOT EXISTS idx_event_registrations_notification_sent
ON event_registrations(event_id, notification_sent);
-- =============================================
-- 為現有報名者生成報到編號和便當編號
-- =============================================

-- 創建生成唯一編號的函數
CREATE OR REPLACE FUNCTION generate_unique_code(p_event_id TEXT, p_code_type TEXT)
RETURNS CHAR(4) AS $$
DECLARE
  new_code CHAR(4);
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- 生成 4 位隨機數字（1000-9999）
    new_code := LPAD(FLOOR(1000 + RANDOM() * 9000)::TEXT, 4, '0');

    -- 檢查是否已存在
    IF p_code_type = 'checkin' THEN
      SELECT EXISTS(
        SELECT 1 FROM event_registrations
        WHERE event_id = p_event_id AND checkin_code = new_code
      ) INTO code_exists;
    ELSE
      SELECT EXISTS(
        SELECT 1 FROM event_registrations
        WHERE event_id = p_event_id AND lunch_code = new_code AND lunch_code != '0000'
      ) INTO code_exists;
    END IF;

    EXIT WHEN NOT code_exists;
  END LOOP;

  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- 為所有缺少 checkin_code 的報名者生成編號
UPDATE event_registrations
SET checkin_code = generate_unique_code(event_id, 'checkin')
WHERE checkin_code IS NULL;

-- 為需要便當的報名者生成 lunch_code（lunch_box_required = true 的才生成）
UPDATE event_registrations
SET lunch_code = generate_unique_code(event_id, 'lunch')
WHERE lunch_box_required = true
  AND (lunch_code IS NULL OR lunch_code = '0000');

-- 確保不需要便當的人 lunch_code 是 0000
UPDATE event_registrations
SET lunch_code = '0000'
WHERE lunch_box_required = false OR lunch_box_required IS NULL;

-- 顯示更新結果
SELECT
  event_id,
  COUNT(*) as total,
  COUNT(checkin_code) as has_checkin_code,
  COUNT(CASE WHEN lunch_code != '0000' THEN 1 END) as has_lunch_code
FROM event_registrations
GROUP BY event_id;
