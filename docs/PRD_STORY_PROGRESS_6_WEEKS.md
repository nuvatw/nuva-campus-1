# 故事進度（Story Progress）— 6 週執行計畫

> **目標**：在校園巡迴首頁新增第 5 區塊「故事進度」，讓團隊可以寫 log 記錄巡迴故事，並提供隱藏管理頁面供新增 log 與管理 template。

---

## 需求摘要

| 項目 | 說明 |
|------|------|
| **新區塊** | 首頁 Step 5：故事進度（最新 log 在最上面） |
| **Log 欄位** | 日期、時間、地點、內容（log）、記錄人 |
| **Template** | 記錄人可建立 template，之後新增 log 時直接套用 |
| **管理入口** | 隱藏網址 `/nuvacampustour/create` |
| **密碼保護** | 簡單密碼 `0812`（前端硬編碼，不走 Supabase 驗證） |

---

## 技術決策

| 決策 | 選擇 | 原因 |
|------|------|------|
| 資料庫 | Supabase `story_logs` + `story_templates` 表 | 與現有架構一致 |
| 密碼驗證 | 前端 localStorage + 硬編碼比對 | 需求為簡單密碼，不需 DB 查詢 |
| 路由 | `/nuvacampustour/create` | 隱藏入口，不加到 Navbar |
| 資料抓取 | SWR + Supabase client | 即時更新，與現有 pattern 一致 |
| 排序 | `created_at DESC` | 最新 log 在最上面 |

---

## 資料庫 Schema

### `story_logs` 表

```sql
CREATE TABLE story_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  log_date DATE NOT NULL,
  log_time TIME NOT NULL,
  location TEXT NOT NULL,
  content TEXT NOT NULL,
  recorder TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 啟用 RLS
ALTER TABLE story_logs ENABLE ROW LEVEL SECURITY;

-- 公開讀取
CREATE POLICY "story_logs_select" ON story_logs
  FOR SELECT USING (true);

-- anon 可新增（前端密碼保護）
CREATE POLICY "story_logs_insert" ON story_logs
  FOR INSERT WITH CHECK (true);

-- 排序索引
CREATE INDEX idx_story_logs_created_at ON story_logs (created_at DESC);
```

### `story_templates` 表

```sql
CREATE TABLE story_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT DEFAULT '',
  content TEXT DEFAULT '',
  recorder TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE story_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "story_templates_select" ON story_templates
  FOR SELECT USING (true);

CREATE POLICY "story_templates_insert" ON story_templates
  FOR INSERT WITH CHECK (true);

CREATE POLICY "story_templates_delete" ON story_templates
  FOR DELETE USING (true);
```

---

## 檔案結構規劃

```
app/
├── page.tsx                              # 修改：新增 Step 5 故事進度
├── components/
│   └── campus-tour/
│       └── StoryProgressSection.tsx      # 新增：故事進度展示元件
├── nuvacampustour/
│   └── create/
│       ├── page.tsx                      # 新增：log 管理頁面（密碼保護）
│       └── components/
│           ├── CreateLogForm.tsx          # 新增：新增 log 表單
│           ├── LogList.tsx               # 新增：已建立 log 列表
│           ├── TemplateManager.tsx        # 新增：template 管理
│           └── PasswordGate.tsx           # 新增：密碼驗證閘門
├── services/
│   └── story.service.ts                  # 新增：story log CRUD
├── types/
│   └── story.ts                          # 新增：StoryLog, StoryTemplate 型別
supabase/
└── migrations/
    └── 12_story_logs.sql                 # 新增：資料庫 migration
```

---

## 6 週執行計畫

---

### Week 1：資料庫 + 型別 + Service 層

**目標**：建立資料基礎設施，確保 CRUD 運作正常。

**任務清單**：

1. **建立 Supabase migration** (`supabase/migrations/12_story_logs.sql`)
   - `story_logs` 表 + RLS policies + 索引
   - `story_templates` 表 + RLS policies

2. **建立 TypeScript 型別** (`app/types/story.ts`)
   ```typescript
   export interface StoryLog {
     id: string;
     log_date: string;      // YYYY-MM-DD
     log_time: string;      // HH:mm
     location: string;
     content: string;
     recorder: string;
     created_at: string;
   }

   export interface StoryTemplate {
     id: string;
     name: string;
     location: string;
     content: string;
     recorder: string;
     created_at: string;
   }

   export interface CreateStoryLogInput {
     log_date: string;
     log_time: string;
     location: string;
     content: string;
     recorder: string;
   }

   export interface CreateTemplateInput {
     name: string;
     location: string;
     content: string;
     recorder: string;
   }
   ```

3. **建立 Service 層** (`app/services/story.service.ts`)
   - `getLogs()` — 取得所有 log（DESC 排序）
   - `createLog(input)` — 新增 log
   - `deleteLog(id)` — 刪除 log
   - `getTemplates()` — 取得所有 template
   - `createTemplate(input)` — 新增 template
   - `deleteTemplate(id)` — 刪除 template

4. **手動執行 SQL migration**（在 Supabase Dashboard）

**驗收標準**：
- [ ] SQL 在 Supabase 執行成功
- [ ] Service 層可正確 CRUD
- [ ] TypeScript 型別無錯誤

---

### Week 2：密碼保護 + Create 頁面基礎

**目標**：建立 `/nuvacampustour/create` 頁面，密碼輸入後可進入。

**任務清單**：

1. **建立 PasswordGate 元件** (`nuvacampustour/create/components/PasswordGate.tsx`)
   - 硬編碼密碼 `0812`
   - 4 位數字鍵盤輸入（復用現有 `NumericKeypad` + `CodeInput`）
   - 驗證成功後存 localStorage（key: `story_create_auth`，24 小時過期）
   - 全頁面覆蓋，驗證後顯示實際內容

2. **建立 Create 頁面** (`nuvacampustour/create/page.tsx`)
   - 頁面 layout：左上標題、密碼保護
   - 不加到 Navbar（隱藏入口）
   - 基本頁面框架：表單區 + log 列表區

3. **建立 CreateLogForm 元件** (`nuvacampustour/create/components/CreateLogForm.tsx`)
   - 表單欄位：日期（date picker）、時間（time picker）、地點、內容（textarea）、記錄人
   - 日期/時間預設為當前時間
   - 送出後呼叫 `storyService.createLog()`
   - 成功後清空表單 + 顯示 Toast

**驗收標準**：
- [ ] 訪問 `/nuvacampustour/create` 需輸入密碼
- [ ] 密碼 `0812` 可通過驗證
- [ ] 可成功新增 log 到 Supabase

---

### Week 3：Log 列表 + 刪除功能

**目標**：在 create 頁面顯示已建立的 log，支援刪除。

**任務清單**：

1. **建立 LogList 元件** (`nuvacampustour/create/components/LogList.tsx`)
   - 使用 SWR 抓取 log 列表
   - 最新 log 在最上面
   - 每筆 log 顯示：日期、時間、地點、內容摘要、記錄人
   - 支援展開/收合長內容
   - 刪除按鈕（確認對話框）

2. **整合到 Create 頁面**
   - 上方：新增表單
   - 下方：log 列表
   - 新增 log 後自動更新列表（SWR mutate）

3. **空狀態處理**
   - 無 log 時顯示引導訊息

**驗收標準**：
- [ ] log 列表正確顯示（最新在上）
- [ ] 可刪除 log
- [ ] 新增 log 後列表即時更新

---

### Week 4：Template 系統

**目標**：讓記錄人可以儲存/載入 template，加速 log 建立。

**任務清單**：

1. **建立 TemplateManager 元件** (`nuvacampustour/create/components/TemplateManager.tsx`)
   - 「儲存為 Template」按鈕（從目前表單欄位儲存）
   - 輸入 template 名稱的 modal
   - Template 列表展示（可展開的側欄或下拉選單）
   - 點擊 template 自動填入表單
   - 刪除 template

2. **整合到 CreateLogForm**
   - 表單上方加入 template 選擇器（下拉選單）
   - 選擇 template 後自動填入：地點、內容、記錄人
   - 「儲存為 Template」按鈕放在表單下方

3. **Template 資料流**
   - 使用 SWR 抓取 template 列表
   - 新增/刪除後 mutate 更新

**驗收標準**：
- [ ] 可從表單儲存 template
- [ ] 可從 template 載入到表單
- [ ] 可刪除 template
- [ ] Template 欄位（地點/內容/記錄人）正確填入

---

### Week 5：首頁 Step 5 故事進度展示

**目標**：在首頁新增第 5 區塊，展示故事進度 log。

**任務清單**：

1. **建立 StoryProgressSection 元件** (`app/components/campus-tour/StoryProgressSection.tsx`)
   - 從 Supabase 抓取最近 log（限制 10 筆）
   - 時間軸樣式展示（vertical timeline）
   - 每筆 log 顯示：日期時間、地點標籤、內容、記錄人
   - 響應式設計（mobile/desktop）
   - Loading skeleton

2. **修改首頁** (`app/page.tsx`)
   - 在 Step 4（活動議程）後面加入 Step 5
   - Step 5 不需要鎖定機制（任何人都可以看）
   - 獨立於其他 step 的選擇狀態

3. **樣式設計**
   - 時間軸左側：日期 + 時間
   - 時間軸右側：地點 badge + 內容 + 記錄人
   - 配色與現有設計系統一致（primary、text-secondary）
   - 漸層時間線連接

**驗收標準**：
- [ ] 首頁可看到 Step 5 故事進度
- [ ] Log 正確顯示（最新在上）
- [ ] 手機/桌面顯示正常
- [ ] Loading 狀態正確

---

### Week 6：測試 + 打磨 + 邊界處理

**目標**：完善細節、測試、效能優化。

**任務清單**：

1. **單元測試**
   - `story.service.ts` 的 CRUD 測試
   - `StoryLog` / `StoryTemplate` 型別測試
   - PasswordGate 邏輯測試

2. **UX 打磨**
   - 表單驗證（必填欄位提示）
   - Toast 訊息（成功/失敗）
   - 動畫過渡（新 log 加入時的 fade-in）
   - 日期格式化為中文格式（3月2日）
   - 時間格式化為 12 小時制或 24 小時制

3. **邊界處理**
   - 網路錯誤處理
   - 空內容防護
   - 超長內容截斷
   - Supabase 連線失敗 fallback

4. **效能優化**
   - 首頁 log 載入加入快取策略
   - 避免不必要的 re-render
   - 圖片/icon 優化（如果有）

5. **最終檢查**
   - TypeScript 零錯誤
   - 所有既有測試通過
   - 手動測試完整流程

**驗收標準**：
- [ ] 所有測試通過
- [ ] TypeScript 零錯誤
- [ ] 完整流程：密碼 → 建 template → 用 template 建 log → 首頁看到 log
- [ ] 手機/桌面體驗流暢

---

## 頁面 wireframe

### `/nuvacampustour/create`（密碼驗證後）

```
┌─────────────────────────────────────────────┐
│  故事進度管理                                  │
│                                              │
│  ┌─ 新增 Log ─────────────────────────────┐  │
│  │                                         │  │
│  │  Template: [▼ 選擇 template...]         │  │
│  │                                         │  │
│  │  日期: [2026-03-02]  時間: [14:30]      │  │
│  │  地點: [________________]               │  │
│  │  內容:                                  │  │
│  │  [____________________________________] │  │
│  │  [____________________________________] │  │
│  │  記錄人: [________________]             │  │
│  │                                         │  │
│  │  [儲存為 Template]          [送出 Log]  │  │
│  └─────────────────────────────────────────┘  │
│                                              │
│  ┌─ 歷史紀錄 ─────────────────────────────┐  │
│  │                                         │  │
│  │  📅 2026/03/02 14:30 · 台大             │  │
│  │  今天在台大校園遇到了很多有興趣的同學...  │  │
│  │  — 記錄人：小明                  [刪除]  │  │
│  │  ─────────────────────────────────────  │  │
│  │  📅 2026/03/01 10:00 · 政大             │  │
│  │  政大場次順利完成，報名人數超出預期...     │  │
│  │  — 記錄人：小華                  [刪除]  │  │
│  └─────────────────────────────────────────┘  │
│                                              │
│  ┌─ Template 管理 ────────────────────────┐  │
│  │  📋 日常巡迴紀錄    [套用] [刪除]       │  │
│  │  📋 特別活動紀錄    [套用] [刪除]       │  │
│  └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### 首頁 Step 5：故事進度

```
┌─ Step 5: 故事進度 ───────────────────────────┐
│                                               │
│  ●─── 2026/03/02 14:30                       │
│  │   📍 台大                                  │
│  │   今天在台大校園遇到了很多有興趣的同學，    │
│  │   大家對 nuva 計畫非常好奇...              │
│  │   — 小明                                   │
│  │                                            │
│  ●─── 2026/03/01 10:00                       │
│  │   📍 政大                                  │
│  │   政大場次順利完成，報名人數超出預期，      │
│  │   下次需要準備更多資料...                   │
│  │   — 小華                                   │
│  │                                            │
│  ●─── 2026/02/28 16:00                       │
│     📍 師大                                   │
│     師大的同學們非常熱情，活動氣氛很好...      │
│     — 小明                                    │
│                                               │
└───────────────────────────────────────────────┘
```

---

## 風險與注意事項

| 風險 | 應對措施 |
|------|---------|
| 密碼硬編碼安全性低 | 需求已明確為簡單保護，非機敏資料 |
| `/nuvacampustour/create` 可被猜到 | 配合密碼保護，風險可接受 |
| RLS policy 過於寬鬆 | log 為公開資料，insert 有前端密碼保護 |
| 首頁增加 Supabase 查詢 | 加入快取策略，限制查詢筆數 |
