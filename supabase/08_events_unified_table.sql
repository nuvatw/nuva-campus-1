-- =============================================
-- NUVA Campus: Events 統一事件表
-- 統一管理所有類型的活動
-- =============================================

-- 建立 events 統一表
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('workshop', 'mission', 'nunu_activity', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  date DATE,
  start_time TIME,
  end_time TIME,
  location TEXT,
  online_link TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'ongoing', 'completed', 'cancelled')),
  metadata JSONB DEFAULT '{}',           -- 彈性欄位存放各類型特有資料
  password TEXT,                         -- 活動專屬密碼
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_type_status ON events(type, status);

-- RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 允許公開讀取
CREATE POLICY "Allow public read events" ON events
  FOR SELECT USING (true);

-- 允許更新
CREATE POLICY "Allow public update events" ON events
  FOR UPDATE USING (true);

-- 允許插入
CREATE POLICY "Allow public insert events" ON events
  FOR INSERT WITH CHECK (true);

-- 自動更新 updated_at
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS events_updated_at ON events;
CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_events_updated_at();

-- 同步 workshop 到 events 表的函數
CREATE OR REPLACE FUNCTION sync_workshop_to_events()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    INSERT INTO events (id, type, title, description, date, start_time, end_time, location, online_link, status, metadata)
    VALUES (
      NEW.id,
      'workshop',
      NEW.title,
      NEW.description,
      NEW.date,
      NEW.start_time,
      NEW.end_time,
      NEW.location,
      NEW.online_link,
      CASE
        WHEN NEW.status = 'upcoming' THEN 'published'
        WHEN NEW.status = 'ongoing' THEN 'ongoing'
        WHEN NEW.status = 'completed' THEN 'completed'
        WHEN NEW.status = 'cancelled' THEN 'cancelled'
        ELSE 'draft'
      END,
      jsonb_build_object(
        'max_capacity', NEW.max_capacity,
        'tally_form_id', NEW.tally_form_id
      )
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      date = EXCLUDED.date,
      start_time = EXCLUDED.start_time,
      end_time = EXCLUDED.end_time,
      location = EXCLUDED.location,
      online_link = EXCLUDED.online_link,
      status = EXCLUDED.status,
      metadata = EXCLUDED.metadata,
      updated_at = NOW();
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM events WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 觸發器：當 workshops 變更時同步到 events
DROP TRIGGER IF EXISTS sync_workshops_to_events ON workshops;
CREATE TRIGGER sync_workshops_to_events
  AFTER INSERT OR UPDATE OR DELETE ON workshops
  FOR EACH ROW
  EXECUTE FUNCTION sync_workshop_to_events();

-- 啟用 Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE events;
