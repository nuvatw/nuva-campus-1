# NUVA Campus 程式碼優化與模組化 10 週執行計畫

**專案名稱**: NUVA Campus 程式碼清理、去重、模組化與優化
**執行週期**: 10 週
**建立日期**: 2026-03-02
**版本**: 2.0

---

## 執行摘要

經過完整的程式碼審查，我們發現 NUVA Campus 專案中存在以下關鍵問題：

| 類別 | 問題數 | 嚴重度 |
|------|--------|--------|
| 重複檔案/元件 | 4 | Critical |
| 超大檔案需模組化 | 8 | High |
| 未使用程式碼 | 6 | Medium |
| Console 殘留 | 40+ | Medium |
| 混合關注點 | 10+ | Medium |
| 缺少共用抽象 | 5 | Low |

---

## 問題總覽

### Critical - 重複程式碼
1. `/app/ambassador/` vs `/app/ambassadors/` — 兩個幾乎相同的目錄
2. `/app/recruit/components/SupportFormModal.tsx` vs `/app/components/shared/SupportFormModal.tsx` — 重複元件
3. `checkin/page.tsx` (490 行) vs `lunch/page.tsx` (493 行) — 90% 重複邏輯
4. `ambassador/workshops/[id]/page.tsx` vs `ambassadors/workshops/[id]/page.tsx` — 重複頁面

### High - 超大檔案需拆分
1. `nunu/events/[id]/page.tsx` — 625 行（含 inline hook、表單、即時訂閱、多區塊 UI）
2. `guardian/events/[id]/lunch/page.tsx` — 493 行
3. `guardian/events/[id]/checkin/page.tsx` — 490 行
4. `ambassador/workshops/[id]/page.tsx` — 340 行
5. `components/ui/DataTable.tsx` — 392 行
6. `guardian/dashboard/page.tsx` — 331 行
7. `nunu/events/[id]/run/page.tsx` — 332 行
8. `components/ui/MissionGrid.tsx` — 285 行

### Medium - 未使用 / Console 殘留
1. `transformWorkshopForDisplay` 在 `ambassador/page.tsx` 引入但未使用
2. `useData` hook 匯出但從未被引入
3. `recruit/components/index.ts` 中多個未使用的匯出
4. 40+ 個 `console.error` / `console.log` 散布在 production 程式碼中
5. `performance.ts` 中的 `console.log` 用於效能指標

---

## 10 週執行計畫

---

### Week 1: 去重 — 消除重複檔案與路由衝突
**目標**: 移除所有重複程式碼，統一路由

**任務清單**:

- [ ] **1.1** 刪除 `/app/ambassador/` 整個目錄
  - 已有 `next.config.ts` 中的 redirect 從 `/ambassador` → `/ambassadors`
  - 確認 redirect 正常運作

- [ ] **1.2** 合併 SupportFormModal
  - 保留 `/app/components/shared/SupportFormModal.tsx`
  - 刪除 `/app/recruit/components/SupportFormModal.tsx`
  - 更新 `/app/recruit/page.tsx` 的引入路徑

- [ ] **1.3** 清除未使用的匯入與匯出
  - 移除 `ambassador/page.tsx` 中未使用的 `transformWorkshopForDisplay`
  - 審查並清理 `recruit/components/index.ts`
  - 審查 `hooks/index.ts` 中未使用的 `useData` 匯出

- [ ] **1.4** 移除殘留 console 語句
  - 將 `performance.ts` 的 console.log 改為條件式 (dev only)
  - 移除 `lunch/page.tsx`、`checkin/page.tsx` 中的 `console.log('Update success:')`
  - 保留 `console.error` 在 catch 區塊（之後 Week 5 統一處理）

**驗收標準**:
- `/ambassador` 路由自動跳轉至 `/ambassadors`
- 只存在一個 SupportFormModal
- 零未使用匯入
- 無 production console.log

---

### Week 2: 模組化 — Nunu Event 詳情頁拆分
**目標**: 將 625 行的 God File 拆為 6+ 個模組

**拆分計畫**:

```
app/nunu/events/[id]/
├── page.tsx                    (~80 行, 主容器)
├── components/
│   ├── PreMeetingCard.tsx      (~70 行, 行前會議倒數)
│   ├── EventMetrics.tsx        (~50 行, 報名人數 + 活動資訊)
│   ├── ParticipantRoster.tsx   (~60 行, 成員列表)
│   ├── ShirtSizeStats.tsx      (~50 行, 尺寸統計)
│   ├── DressCodeCard.tsx       (~40 行, 服裝儀容)
│   ├── WeatherTipsCard.tsx     (~40 行, 保暖建議)
│   ├── DietaryNotes.tsx        (~40 行, 飲食禁忌)
│   └── RegistrationModal.tsx   (~120 行, 報名表單 Modal)
app/hooks/
└── useCountdown.ts             (~50 行, 從 page 提取)
```

**任務清單**:

- [ ] **2.1** 提取 `useCountdown` hook → `/app/hooks/useCountdown.ts`
- [ ] **2.2** 提取 `RegistrationModal` 元件（含表單狀態管理）
- [ ] **2.3** 提取 `PreMeetingCard` 元件（含倒數計時 UI）
- [ ] **2.4** 提取 `EventMetrics` 元件（報名人數 + 活動日期）
- [ ] **2.5** 提取 `ParticipantRoster` 元件
- [ ] **2.6** 提取 `ShirtSizeStats`、`DressCodeCard`、`WeatherTipsCard`、`DietaryNotes`
- [ ] **2.7** 重組 `page.tsx` 為純容器元件

**驗收標準**:
- `page.tsx` 不超過 100 行
- 每個子元件不超過 120 行
- 所有功能與視覺完全不變
- `useCountdown` 可被其他頁面重複使用

---

### Week 3: 模組化 — Checkin/Lunch 頁面整合
**目標**: 消除 checkin 與 lunch 的 90% 重複程式碼

**整合策略**: 建立共用的 `ParticipantActionPage` 元件

```
app/guardian/events/[id]/
├── components/
│   ├── ParticipantActionPage.tsx   (~250 行, 共用邏輯)
│   ├── ParticipantCard.tsx         (~50 行, 卡片 UI)
│   ├── ParticipantModal.tsx        (~80 行, 確認 Modal)
│   ├── QuickSearchKeypad.tsx       (~60 行, 快速搜尋)
│   └── FilterBar.tsx               (~40 行, 篩選列)
├── checkin/
│   └── page.tsx                    (~30 行, 配置 wrapper)
└── lunch/
    └── page.tsx                    (~30 行, 配置 wrapper)
```

**任務清單**:

- [ ] **3.1** 建立 `ParticipantCard` 共用元件
- [ ] **3.2** 建立 `ParticipantModal` 共用元件
- [ ] **3.3** 建立 `QuickSearchKeypad` 共用元件
- [ ] **3.4** 建立 `FilterBar` 共用元件
- [ ] **3.5** 建立 `ParticipantActionPage` 容器（接受配置 props）
- [ ] **3.6** 改寫 `checkin/page.tsx` 使用共用元件
- [ ] **3.7** 改寫 `lunch/page.tsx` 使用共用元件
- [ ] **3.8** 提取共用的 `useParticipantData` hook

**驗收標準**:
- checkin 和 lunch 頁面各不超過 50 行
- 共用元件處理所有重複邏輯
- 功能完全不變（報到 / 便當領取 / 撤銷 / 篩選 / 搜尋）

---

### Week 4: 模組化 — Guardian Dashboard + Ambassador Workshop 頁面
**目標**: 拆分 guardian/dashboard (331 行) 和 ambassador workshop (340 行)

**Guardian Dashboard 拆分**:
```
app/guardian/dashboard/
├── page.tsx                (~60 行)
├── components/
│   ├── EventCard.tsx       (~80 行)
│   ├── StatsOverview.tsx   (~60 行)
│   └── EditModal.tsx       (已存在，保持)
```

**Ambassador Workshop 拆分**:
```
app/ambassadors/workshops/[id]/
├── page.tsx                (~80 行)
├── components/
│   ├── WorkshopHeader.tsx  (~50 行)
│   ├── WorkshopContent.tsx (~80 行)
│   └── WorkshopActions.tsx (~50 行)
```

**任務清單**:

- [ ] **4.1** 拆分 guardian dashboard 頁面
- [ ] **4.2** 拆分 ambassadors workshop 詳情頁面
- [ ] **4.3** 審查 `nunu/events/[id]/run/page.tsx` (332 行) 拆分需求
- [ ] **4.4** 拆分 `nunu/events/[id]/run/page.tsx` 若超過 200 行

**驗收標準**:
- 每個頁面主檔不超過 100 行
- 子元件單一職責

---

### Week 5: MissionGrid + DataTable 元件優化
**目標**: 拆分過大的共用 UI 元件

**MissionGrid 拆分** (285 行 → 模組化):
```
app/components/ui/
├── MissionGrid.tsx           (~80 行, 容器)
├── MissionCountdown.tsx      (~40 行)
├── MissionProgress.tsx       (~30 行)
└── MissionItemWrapper.tsx    (~60 行)
app/hooks/
└── useMissions.ts            (~80 行, 資料抓取 + 狀態)
```

**DataTable 審查** (392 行):
- 評估是否需要拆分
- 提取 sorting/filtering 邏輯到 hook

**任務清單**:

- [ ] **5.1** 提取 `useMissions` hook（含 Supabase 查詢和分頁邏輯）
- [ ] **5.2** 提取 `MissionCountdown` 元件
- [ ] **5.3** 提取 `MissionProgress` 元件
- [ ] **5.4** 重組 `MissionGrid.tsx` 為純容器
- [ ] **5.5** 審查 DataTable 是否需要拆分
- [ ] **5.6** 提取 `useDataTable` hook（若需要）

**驗收標準**:
- MissionGrid 主檔不超過 100 行
- Mission 相關 hooks 可獨立測試

---

### Week 6: Services + Lib 層重構
**目標**: 整理服務層和工具函式

**任務清單**:

- [ ] **6.1** 統一 `console.error` → 結構化錯誤日誌
  - 建立 `/app/lib/logger.ts` 工具
  - 替換所有 `console.error` 為 logger 呼叫

- [ ] **6.2** 重構 `lib/fetcher.ts` (221 行)
  - 拆分 server-side fetcher 和 client-side fetcher
  - 釐清 SWR fetcher 職責

- [ ] **6.3** 審查 `lib/performance.ts` (208 行)
  - 確保 dev-only console
  - 拆分效能工具若混合關注點

- [ ] **6.4** 統一 types 匯出
  - 建立 `/app/types/index.ts` 統一匯出
  - 減少各處分散的 type import

- [ ] **6.5** 清理 `/app/components/ui/index.ts` barrel export
  - 評估 tree-shaking 影響
  - 考慮是否需要拆分

**驗收標準**:
- 零散的 console.error 統一為 logger
- Fetcher 職責清晰分離
- Type imports 簡化

---

### Week 7: Recruit 頁面 + 共用元件優化
**目標**: 優化 recruit 頁面結構

**任務清單**:

- [ ] **7.1** 審查 `recruit/page.tsx` (253 行)
  - 確認 dynamic imports 最佳化
  - 提取 skeleton components 到共用

- [ ] **7.2** 審查 `recruit/components/SupportersWall/` 結構
  - 確認元件是否適當拆分
  - 優化 InfiniteScrollRow 效能

- [ ] **7.3** 審查 `recruit/hooks/useSupporters.ts`
  - 確認快取策略
  - 優化 data fetching

- [ ] **7.4** 建立共用 Skeleton 元件庫
  - 統一載入狀態 UI
  - 減少各頁面重複的 skeleton 程式碼

**驗收標準**:
- Recruit 頁面載入效能改善
- Skeleton 元件統一

---

### Week 8: CSS + Tailwind 優化
**目標**: 清理 globals.css (17KB)、統一設計 tokens

**任務清單**:

- [ ] **8.1** 審查 `globals.css` (17KB)
  - 找出未使用的 CSS 規則
  - 能用 Tailwind 類別取代的轉移

- [ ] **8.2** 統一色彩 token
  - 確認 `tailwind.config.ts` 的設計系統
  - 消除 hardcoded 色碼（如 `bg-slate-50` vs `bg-bg-primary`）

- [ ] **8.3** 清理 inline styles
  - 審查各元件的 inline style 使用
  - 儘可能轉為 Tailwind 類別

- [ ] **8.4** 移除 `app/dev/index.html` (30KB)
  - 確認是否為開發用臨時檔案
  - 若不需要則刪除

**驗收標準**:
- globals.css 減小 30%+
- 色彩系統統一
- 無不必要的開發檔案

---

### Week 9: 測試補全 + 靜態分析
**目標**: 提升測試覆蓋率，建立 CI 品質把關

**任務清單**:

- [ ] **9.1** 為提取的 hooks 撰寫單元測試
  - `useCountdown`
  - `useParticipantData`（Week 3 提取）
  - `useMissions`（Week 5 提取）

- [ ] **9.2** 為 transform 函式補充測試
  - 擴充 `transforms.test.ts`

- [ ] **9.3** 為 services 層撰寫測試
  - Mock Supabase client
  - 測試 error handling

- [ ] **9.4** 設定 ESLint 嚴格規則
  - 加入 `no-console` 規則 (warn)
  - 加入 `no-unused-imports` 規則
  - 加入 `@typescript-eslint/no-unused-vars` 嚴格

- [ ] **9.5** 設定 pre-commit hook（選擇性）
  - lint-staged + husky

**驗收標準**:
- 測試覆蓋率 > 50%
- ESLint 零 error
- Hooks 和 transforms 100% 覆蓋

---

### Week 10: 文件整理 + 最終審查
**目標**: 清理舊文件、最終程式碼審查

**任務清單**:

- [ ] **10.1** 清理根目錄舊 PRD 文件
  - 整理 `/docs/` 結構
  - 移除過時的 PRD 文件（如 `PRD_CODE_OPTIMIZATION_6WEEKS.md`）
  - 更新 README.md

- [ ] **10.2** 最終程式碼審查
  - 確認所有檔案 < 200 行（特殊例外需註記）
  - 確認零重複程式碼
  - 確認 barrel exports 正確

- [ ] **10.3** Bundle size 分析
  - 執行 `npm run analyze`
  - 記錄優化前後對比

- [ ] **10.4** 效能回歸測試
  - 確認所有頁面功能正常
  - Lighthouse 評分記錄

- [ ] **10.5** 建立維護指南
  - 元件命名規範
  - 檔案大小限制（建議 200 行）
  - 新元件建立流程

**驗收標準**:
- 所有 10 週任務完成
- 零重複程式碼
- 所有頁面主檔 < 100 行
- 文件完整更新

---

## 整體指標

### 程式碼品質指標

| 指標 | 優化前 | 目標值 |
|------|--------|--------|
| 重複檔案 | 4 組 | 0 |
| 超過 200 行的檔案 | 32 | < 10 |
| 超過 300 行的檔案 | 8 | 0 |
| 未使用的匯入 | 6+ | 0 |
| Production console.log | 6 | 0 |
| 最大檔案行數 | 625 行 | < 200 行 |

### 架構指標

| 指標 | 優化前 | 目標值 |
|------|--------|--------|
| 共用 hooks | 2 | 8+ |
| 共用元件 | ~25 | 35+ |
| 重複邏輯 | 3 組 | 0 |
| 測試覆蓋率 | ~10% | > 50% |

---

## 每週驗收檢查清單

每週完成後，使用以下方式驗證：

1. **功能驗證**: `npm run dev` → 手動測試受影響頁面
2. **型別檢查**: `npx tsc --noEmit` → 零錯誤
3. **Lint 檢查**: `npm run lint` → 零錯誤
4. **測試執行**: `npm run test:run` → 全部通過
5. **Bundle 檢查**: 確認 bundle size 未顯著增加

---

*本文件為 NUVA Campus 程式碼優化 10 週計畫主文件。*
