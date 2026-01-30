# Chapter 6: Supabase 資料庫擴充

[← 返回索引](./README.md) | [上一章](./ch05-password-system.md) | [下一章 →](./ch07-recruit-page.md)

---

## 6.1 新增資料表總覽

| 資料表 | 用途 |
|--------|------|
| `access_passwords` | 密碼管理 |
| `partnership_applications` | 合作申請 |
| `newsletter_subscribers` | 訂閱者 |
| `email_logs` | 郵件發送記錄 |

## 6.2 access_passwords（密碼管理）

```sql
CREATE TABLE access_passwords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS：只允許讀取
ALTER TABLE access_passwords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON access_passwords
  FOR SELECT USING (is_active = true);

-- 初始資料
INSERT INTO access_passwords (key, password, description) VALUES
  ('nunu', '0812', '努努專區入口密碼'),
  ('ambassador', '2180', '校園大使專區入口密碼'),
  ('guardian', '0001', '守護者專區入口密碼'),
  ('event_ws02', '0202', 'WS02 活動執行密碼');
```

## 6.3 partnership_applications（合作申請）

```sql
CREATE TABLE partnership_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school TEXT NOT NULL,
  department TEXT NOT NULL,
  job_title TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE partnership_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert" ON partnership_applications
  FOR INSERT WITH CHECK (true);
```

## 6.4 newsletter_subscribers（訂閱者）

```sql
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);
```

## 6.5 修改 event_registrations（新增報到編號）

```sql
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

-- 建立唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_checkin_code
ON event_registrations(event_id, checkin_code)
WHERE checkin_code IS NOT NULL AND checkin_code != '0000';

CREATE UNIQUE INDEX IF NOT EXISTS idx_event_lunch_code
ON event_registrations(event_id, lunch_code)
WHERE lunch_code IS NOT NULL AND lunch_code != '0000';
```

## 6.6 email_logs（郵件發送記錄）

```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT NOT NULL,
  registration_id UUID REFERENCES event_registrations(id),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  email_type TEXT NOT NULL,  -- 'checkin_code', 'reminder', etc.
  status TEXT DEFAULT 'pending',  -- pending, sent, failed
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Realtime 支援
ALTER PUBLICATION supabase_realtime ADD TABLE email_logs;
```

## 6.7 資料表關係圖

```
┌──────────────────────────┐
│ access_passwords         │
├──────────────────────────┤
│ id (PK)                  │
│ key (UNIQUE)             │
│ password                 │
│ description              │
│ is_active                │
└──────────────────────────┘

┌──────────────────────────┐
│ partnership_applications │
├──────────────────────────┤
│ id (PK)                  │
│ school                   │
│ department               │
│ job_title                │
│ name                     │
│ phone                    │
│ email                    │
│ message                  │
│ status                   │
└──────────────────────────┘

┌──────────────────────────┐
│ newsletter_subscribers   │
├──────────────────────────┤
│ id (PK)                  │
│ name                     │
│ email (UNIQUE)           │
│ subscribed_at            │
│ is_active                │
└──────────────────────────┘

┌──────────────────────────┐
│ event_registrations      │
├──────────────────────────┤
│ ... 現有欄位 ...          │
│ + checkin_code (CHAR 4)  │
│ + lunch_code (CHAR 4)    │
│ + notification_sent      │
│ + notification_sent_at   │
└──────────────────────────┘

┌──────────────────────────┐
│ email_logs               │
├──────────────────────────┤
│ id (PK)                  │
│ event_id                 │
│ registration_id (FK)     │
│ recipient_email          │
│ recipient_name           │
│ email_type               │
│ status                   │
│ error_message            │
│ sent_at                  │
└──────────────────────────┘
```

## 6.8 Chain of Thought - 實施步驟

```
1. 建立 SQL 腳本檔案
   - /supabase/access_passwords.sql
   - /supabase/partnership_applications.sql
   - /supabase/newsletter_subscribers.sql
   - /supabase/email_logs.sql
   - /supabase/event_registrations_update.sql

2. 在 Supabase Dashboard 執行 SQL
   - 依序建立各表
   - 設定 RLS 政策

3. 更新 TypeScript 型別定義
   - /app/types/password.ts
   - /app/types/partnership.ts
   - /app/types/subscriber.ts
   - /app/types/email.ts

4. 測試資料庫操作
   - 密碼讀取
   - 表單提交
   - 郵件記錄
```
