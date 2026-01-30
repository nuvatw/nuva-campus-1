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
