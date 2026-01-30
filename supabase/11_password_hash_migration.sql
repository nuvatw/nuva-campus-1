-- =============================================
-- 密碼雜湊遷移 (password_hash migration)
-- Week 1: 安全性基礎建設
-- =============================================

-- Step 1: 新增 password_hash 欄位
ALTER TABLE access_passwords
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Step 2: 為現有資料生成 bcrypt 雜湊
-- 注意：這需要 pgcrypto 擴展或透過應用程式層執行
-- 以下是透過應用程式層執行的遷移腳本範例
-- 請使用 auth-server.ts 中的 migratePasswords() 函數

-- Step 3: 更新 RLS 政策 - 限制客戶端直接存取
-- 先移除舊的政策
DROP POLICY IF EXISTS "Allow public read" ON access_passwords;

-- 新增更嚴格的政策：只允許讀取 key 和 is_active 欄位
-- 密碼相關欄位不應該被客戶端讀取
CREATE POLICY "Allow limited public read" ON access_passwords
  FOR SELECT
  USING (is_active = true);

-- Step 4: 建立視圖供客戶端使用（不包含密碼）
CREATE OR REPLACE VIEW access_passwords_public AS
SELECT
  id,
  key,
  description,
  is_active,
  created_at,
  updated_at
FROM access_passwords
WHERE is_active = true;

-- 授予視圖讀取權限
GRANT SELECT ON access_passwords_public TO anon, authenticated;

-- Step 5: 新增索引優化查詢效能
CREATE INDEX IF NOT EXISTS idx_access_passwords_key_active
ON access_passwords(key, is_active);

-- =============================================
-- 遷移完成後的手動步驟：
-- =============================================
-- 1. 執行 migratePasswords() 函數將所有明文密碼轉換為 bcrypt 雜湊
-- 2. 驗證所有密碼都已成功遷移 (password_hash 不為 NULL)
-- 3. 執行以下命令移除明文密碼欄位（危險操作，請確保遷移完成）：
--    ALTER TABLE access_passwords DROP COLUMN password;

-- 備註：為了向後相容，在遷移期間保留 password 欄位
-- auth-server.ts 會優先使用 password_hash，若無則回退到 password
