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
