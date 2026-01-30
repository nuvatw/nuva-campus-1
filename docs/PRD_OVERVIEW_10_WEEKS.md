# NUVA Campus 效能與 UI/UX 優化計畫

## 10 週優化執行總覽

**專案名稱**: NUVA Campus 效能與 UI/UX 優化計畫
**執行週期**: 10 週
**建立日期**: 2026-01-30
**版本**: 1.0

---

## 執行摘要

本計畫針對 NUVA Campus 專案進行全面的效能優化和 UI/UX 改善。根據程式碼審查結果，我們識別出約 34 個待改善項目，依嚴重程度和優先級分配到 10 週執行週期中。

### 專案現況

| 項目 | 數值 |
|------|------|
| 框架 | Next.js 16.1.0 (App Router) + React 19.2.3 |
| 樣式 | Tailwind CSS 3.4.1 |
| 資料庫 | Supabase |
| 程式碼行數 | ~12,910 行 |

### 發現的問題統計

| 優先級 | 數量 | 類別 |
|--------|------|------|
| P0 (Critical) | 4 | 安全性 |
| P1 (High) | 6 | 效能關鍵 |
| P2 (Medium) | 16 | 效能/UX |
| P3 (Low) | 8 | 程式碼品質 |

---

## 10 週執行計畫

### Phase 1: 基礎建設 (Week 1-2)

| 週次 | 主題 | 重點 | PRD |
|------|------|------|-----|
| **Week 1** | 安全性基礎 | 密碼安全、API 認證、Rate Limiting | [PRD_WEEK_01](./PRD_WEEK_01_SECURITY_FOUNDATION.md) |
| **Week 2** | 效能關鍵 | 字體優化、首頁 SSR、Countdown 優化 | [PRD_WEEK_02](./PRD_WEEK_02_PERFORMANCE_CRITICAL.md) |

**Phase 1 目標**:
- 消除所有 P0 安全漏洞
- Lighthouse Performance 提升 20%

---

### Phase 2: 效能優化 (Week 3-4)

| 週次 | 主題 | 重點 | PRD |
|------|------|------|-----|
| **Week 3** | Code Splitting | 大型頁面拆分、動態載入 | [PRD_WEEK_03](./PRD_WEEK_03_CODE_SPLITTING.md) |
| **Week 4** | 圖片優化 | Blur placeholder、響應式圖片、預載入 | [PRD_WEEK_04](./PRD_WEEK_04_IMAGE_OPTIMIZATION.md) |

**Phase 2 目標**:
- 首次載入 bundle 減少 30%
- LCP < 2.5s

---

### Phase 3: UX 改善 (Week 5-6)

| 週次 | 主題 | 重點 | PRD |
|------|------|------|-----|
| **Week 5** | 錯誤處理 | Result 型別、Error Boundary、Loading 狀態 | [PRD_WEEK_05](./PRD_WEEK_05_ERROR_HANDLING.md) |
| **Week 6** | 表單驗證 | 即時驗證、Toast 系統、確認對話框 | [PRD_WEEK_06](./PRD_WEEK_06_FORM_VALIDATION.md) |

**Phase 3 目標**:
- CLS < 0.1
- 表單完成率提升 20%

---

### Phase 4: 資料層優化 (Week 7-8)

| 週次 | 主題 | 重點 | PRD |
|------|------|------|-----|
| **Week 7** | Real-time & Cache | Supabase Real-time、Optimistic Updates | [PRD_WEEK_07](./PRD_WEEK_07_REALTIME_CACHE.md) |
| **Week 8** | 程式碼品質 | 型別統一、服務層重構、ESLint | [PRD_WEEK_08](./PRD_WEEK_08_CODE_QUALITY.md) |

**Phase 4 目標**:
- API 請求減少 60%
- 型別覆蓋率 > 95%

---

### Phase 5: 進階功能與驗收 (Week 9-10)

| 週次 | 主題 | 重點 | PRD |
|------|------|------|-----|
| **Week 9** | PWA & 離線 | Service Worker、離線報到、安裝能力 | [PRD_WEEK_09](./PRD_WEEK_09_PWA_OFFLINE.md) |
| **Week 10** | 監控與測試 | Web Vitals、Sentry、E2E 測試 | [PRD_WEEK_10](./PRD_WEEK_10_MONITORING_TESTING.md) |

**Phase 5 目標**:
- Lighthouse PWA > 80
- 測試覆蓋率 > 70%

---

## 整體目標指標

### 效能指標

| 指標 | 當前值 | 目標值 | 改善幅度 |
|------|--------|--------|----------|
| Lighthouse Performance | ~60 | > 80 | +33% |
| First Contentful Paint | ~2.5s | < 1.5s | -40% |
| Largest Contentful Paint | ~3.5s | < 2.5s | -29% |
| Cumulative Layout Shift | ~0.15 | < 0.1 | -33% |
| Time to Interactive | ~4.0s | < 3.0s | -25% |

### 程式碼品質指標

| 指標 | 當前值 | 目標值 |
|------|--------|--------|
| TypeScript 嚴格模式覆蓋 | ~70% | > 95% |
| `any` 型別使用 | ~30 處 | < 10 處 |
| 單元測試覆蓋率 | ~10% | > 70% |
| ESLint 違規 | ~50 | 0 errors |

### 安全性指標

| 指標 | 當前值 | 目標值 |
|------|--------|--------|
| P0 安全漏洞 | 4 | 0 |
| API 未認證端點 | 3 | 0 |
| 密碼安全 | 明文 | bcrypt |

---

## 技術棧變更

### 新增依賴

```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "plaiceholder": "^3.0.0",
    "sharp": "^0.33.0",
    "react-hook-form": "^7.50.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "framer-motion": "^11.0.0",
    "@headlessui/react": "^1.7.0",
    "@sentry/nextjs": "^8.0.0",
    "web-vitals": "^3.5.0"
  },
  "devDependencies": {
    "@next/bundle-analyzer": "^16.0.0",
    "@playwright/test": "^1.42.0",
    "next-pwa": "^5.6.0"
  }
}
```

### 架構變更

```
/app
├── components/
│   ├── form/              # 新增 - 表單組件
│   ├── home/              # 新增 - 首頁組件
│   └── toast/             # 新增 - Toast 系統
├── hooks/
│   ├── useRealtimeSubscription.ts  # 新增
│   ├── useOptimisticMutation.ts    # 新增
│   └── useOfflineCheckIn.ts        # 新增
├── services/
│   ├── base.ts            # 新增 - 基礎服務類
│   ├── offline-storage.ts # 新增 - 離線儲存
│   └── sync-service.ts    # 新增 - 同步服務
├── types/
│   ├── index.ts           # 新增 - 統一匯出
│   ├── event.ts           # 新增 - 活動型別
│   └── registration.ts    # 新增 - 報名型別
├── transforms/            # 新增 - 資料轉換
├── schemas/               # 新增 - Zod 驗證
└── lib/
    ├── web-vitals.ts      # 新增
    └── swr-config.ts      # 新增
```

---

## 風險管理

### 高風險項目

| 風險 | 影響 | 緩解措施 |
|------|------|----------|
| 密碼遷移導致使用者無法登入 | 高 | 分階段遷移，保留回滾能力 |
| SSR 重構導致 Hydration 錯誤 | 中 | 充分測試 Server/Client 邊界 |
| 離線功能同步失敗 | 中 | 多重重試機制，使用者通知 |

### 緩解策略

1. **功能開關**: 關鍵功能使用 feature flags 控制
2. **灰度發布**: 新功能先在小範圍測試
3. **回滾計畫**: 每個階段都有明確的回滾步驟
4. **監控告警**: 即時監控關鍵指標

---

## 資源需求

### 人力需求

| 角色 | 週數 | 主要工作 |
|------|------|----------|
| 前端工程師 | 10 | 主要開發 |
| 後端工程師 | 4 | API、資料庫 |
| QA 工程師 | 3 | 測試驗收 |

### 外部服務

| 服務 | 用途 | 預估費用 |
|------|------|----------|
| Sentry | 錯誤追蹤 | ~$26/月 |
| Vercel Analytics | Web Vitals | 免費 |

---

## 驗收檢查清單

### Week 1-2 驗收
- [ ] 密碼以 bcrypt 儲存
- [ ] API 有認證機制
- [ ] Rate Limiting 運作
- [ ] 字體使用 next/font
- [ ] 首頁是 Server Component

### Week 3-4 驗收
- [ ] RecruitPage 拆分完成
- [ ] 動態載入設定完成
- [ ] 所有圖片有 blur placeholder
- [ ] 響應式圖片設定完成

### Week 5-6 驗收
- [ ] Result 型別套用到所有服務
- [ ] Error Boundary 設定完成
- [ ] 表單即時驗證運作
- [ ] Toast 有動畫效果

### Week 7-8 驗收
- [ ] Real-time 訂閱取代輪詢
- [ ] Optimistic Updates 運作
- [ ] 型別定義統一
- [ ] ESLint 無 error

### Week 9-10 驗收
- [ ] PWA 可安裝
- [ ] 離線報到功能運作
- [ ] Web Vitals 監控運作
- [ ] 測試覆蓋率達標

---

## 文件索引

| 文件 | 說明 |
|------|------|
| [Week 1: 安全性基礎](./PRD_WEEK_01_SECURITY_FOUNDATION.md) | 密碼安全、API 認證 |
| [Week 2: 效能關鍵](./PRD_WEEK_02_PERFORMANCE_CRITICAL.md) | 字體、SSR、Countdown |
| [Week 3: Code Splitting](./PRD_WEEK_03_CODE_SPLITTING.md) | 頁面拆分、動態載入 |
| [Week 4: 圖片優化](./PRD_WEEK_04_IMAGE_OPTIMIZATION.md) | Blur、響應式、預載入 |
| [Week 5: 錯誤處理](./PRD_WEEK_05_ERROR_HANDLING.md) | Result、Error Boundary |
| [Week 6: 表單驗證](./PRD_WEEK_06_FORM_VALIDATION.md) | Zod、Toast、Confirm |
| [Week 7: Real-time](./PRD_WEEK_07_REALTIME_CACHE.md) | 訂閱、Optimistic |
| [Week 8: 程式碼品質](./PRD_WEEK_08_CODE_QUALITY.md) | 型別、ESLint |
| [Week 9: PWA](./PRD_WEEK_09_PWA_OFFLINE.md) | 離線、安裝 |
| [Week 10: 監控測試](./PRD_WEEK_10_MONITORING_TESTING.md) | Vitals、Sentry、E2E |

---

## 聯絡資訊

**專案負責人**: TBD
**技術負責人**: TBD
**最後更新**: 2026-01-30

---

*本文件為 NUVA Campus 效能與 UI/UX 優化計畫的主要參考文件。*
