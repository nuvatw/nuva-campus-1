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
