# PRD Week 1: 安全性基礎與關鍵修復

**專案**: NUVA Campus 效能與 UI/UX 優化計畫
**週次**: 第 1 週 (共 10 週)
**負責人**: TBD
**預計交付日期**: TBD

---

## 1. 本週目標

建立安全性基礎架構，修復最關鍵的安全漏洞，確保使用者資料安全。

---

## 2. 問題陳述

### 2.1 密碼明文儲存 (P0 - Critical)

**現況**:
- `access_passwords` 表中密碼以明文方式儲存
- 客戶端 (`/app/hooks/useAuth.ts:31-37`) 直接查詢密碼表
- 驗證邏輯 (`/app/api/auth/verify/route.ts:25`) 進行明文比對

**風險**:
- 資料庫洩漏將直接暴露所有密碼
- 客戶端可能在 Network Tab 看到密碼資料
- 違反基本資安標準 (OWASP A02:2021)

### 2.2 API 缺乏認證機制 (P0 - Critical)

**現況**:
- `/api/email/send` 無任何認證
- 任何人都可以觸發郵件發送
- 沒有 Rate Limiting 機制

**風險**:
- 可被用於垃圾郵件攻擊
- 可能造成郵件服務費用暴增
- 可能被列入垃圾郵件黑名單

---

## 3. 解決方案

### 3.1 密碼安全重構

#### 3.1.1 資料庫層修改

```sql
-- 新增 password_hash 欄位
ALTER TABLE access_passwords
ADD COLUMN password_hash TEXT;

-- 移除明文密碼欄位 (完成遷移後執行)
-- ALTER TABLE access_passwords DROP COLUMN password;
```

#### 3.1.2 Server-Side 驗證服務

建立 `/app/services/auth-server.ts`:

```typescript
import { createServerClient } from '@/lib/supabase-server'
import bcrypt from 'bcryptjs'

export async function verifyPassword(
  role: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('access_passwords')
    .select('password_hash')
    .eq('role', role)
    .single()

  if (error || !data) {
    return { success: false, error: 'Invalid role' }
  }

  const isValid = await bcrypt.compare(password, data.password_hash)

  return { success: isValid }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}
```

#### 3.1.3 API Route 重構

修改 `/app/api/auth/verify/route.ts`:

```typescript
import { verifyPassword } from '@/services/auth-server'

export async function POST(request: Request) {
  const { role, password } = await request.json()

  if (!role || !password) {
    return Response.json(
      { success: false, error: 'Missing credentials' },
      { status: 400 }
    )
  }

  const result = await verifyPassword(role, password)

  if (!result.success) {
    return Response.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    )
  }

  return Response.json({ success: true })
}
```

#### 3.1.4 客戶端修改

修改 `/app/hooks/useAuth.ts` 移除直接查詢:

```typescript
export function useAuth() {
  const verify = async (role: string, password: string) => {
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, password })
    })

    const data = await response.json()

    if (data.success) {
      setAuthState(role)
    }

    return data
  }

  // ... rest of hook
}
```

### 3.2 API 認證機制

#### 3.2.1 簡易 Token 認證

建立 `/app/lib/api-auth.ts`:

```typescript
import { headers } from 'next/headers'

const API_SECRET = process.env.API_SECRET_KEY

export function validateApiKey(): boolean {
  const headersList = headers()
  const apiKey = headersList.get('x-api-key')

  return apiKey === API_SECRET
}

export function requireAuth() {
  if (!validateApiKey()) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  return null
}
```

#### 3.2.2 Rate Limiting 基礎實作

建立 `/app/lib/rate-limit.ts`:

```typescript
const rateLimitMap = new Map<string, { count: number; timestamp: number }>()

export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now - record.timestamp > windowMs) {
    rateLimitMap.set(identifier, { count: 1, timestamp: now })
    return { allowed: true, remaining: limit - 1 }
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: limit - record.count }
}
```

#### 3.2.3 應用到 Email API

修改 `/app/api/email/send/route.ts`:

```typescript
import { requireAuth } from '@/lib/api-auth'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  // 認證檢查
  const authError = requireAuth()
  if (authError) return authError

  // Rate Limiting
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown'
  const rateLimit = checkRateLimit(clientIp, 5, 60000) // 5 requests per minute

  if (!rateLimit.allowed) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  // ... existing logic
}
```

---

## 4. 技術規格

### 4.1 新增依賴

```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6"
  }
}
```

### 4.2 環境變數

```env
# .env.local
API_SECRET_KEY=your-secure-random-key-here
```

### 4.3 資料庫遷移

建立 `/supabase/migrations/20240101_password_hash.sql`:

```sql
-- Step 1: Add hash column
ALTER TABLE access_passwords ADD COLUMN password_hash TEXT;

-- Step 2: Update RLS policy to restrict client access
ALTER POLICY "public_read" ON access_passwords
USING (false);

-- Step 3: Create server-only read policy
CREATE POLICY "server_read" ON access_passwords
FOR SELECT
USING (auth.role() = 'service_role');
```

---

## 5. 驗收標準

### 5.1 功能驗收

- [ ] 密碼以 bcrypt hash 儲存，明文欄位已移除
- [ ] 客戶端無法直接查詢 `access_passwords` 表
- [ ] 驗證流程透過 API Route 進行
- [ ] Email API 需要有效的 API Key 才能呼叫
- [ ] Rate Limiting 正常運作 (每分鐘 5 次限制)

### 5.2 安全驗收

- [ ] Network Tab 中看不到密碼相關資料
- [ ] 無效密碼返回 401 狀態碼
- [ ] 超過頻率限制返回 429 狀態碼
- [ ] RLS 政策已更新並測試

### 5.3 回歸測試

- [ ] Guardian 登入功能正常
- [ ] Ambassador 登入功能正常
- [ ] Nunu 登入功能正常
- [ ] 郵件發送功能正常 (需帶 API Key)

---

## 6. 風險與緩解措施

| 風險 | 機率 | 影響 | 緩解措施 |
|------|------|------|----------|
| 現有使用者無法登入 | 中 | 高 | 先進行密碼遷移再切換驗證邏輯 |
| API Key 洩漏 | 低 | 中 | 定期輪換，監控異常使用 |
| Rate Limit 誤擋 | 低 | 中 | 設定合理閾值，加入白名單機制 |

---

## 7. 交付清單

- [ ] `/app/services/auth-server.ts` - 新增
- [ ] `/app/lib/api-auth.ts` - 新增
- [ ] `/app/lib/rate-limit.ts` - 新增
- [ ] `/app/api/auth/verify/route.ts` - 修改
- [ ] `/app/api/email/send/route.ts` - 修改
- [ ] `/app/hooks/useAuth.ts` - 修改
- [ ] `/supabase/migrations/20240101_password_hash.sql` - 新增
- [ ] `.env.example` - 更新
- [ ] 測試報告文件

---

## 8. 成功指標

| 指標 | 目標值 | 測量方式 |
|------|--------|----------|
| 安全漏洞數量 | 0 個 P0 | 安全掃描工具 |
| 登入成功率 | > 99% | 應用監控 |
| API 濫用事件 | 0 件 | 日誌分析 |

---

## 9. 本週里程碑

- **Day 1-2**: 密碼 Hash 遷移腳本開發與測試
- **Day 3**: API 認證模組實作
- **Day 4**: Rate Limiting 實作
- **Day 5**: 整合測試與部署
- **Day 6-7**: 監控與緊急修復緩衝

---

*下一週預告: 字體載入優化與首頁 SSR 重構*
