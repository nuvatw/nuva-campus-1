# PRD Week 3: 大型頁面拆分與 Code Splitting

**專案**: NUVA Campus 效能與 UI/UX 優化計畫
**週次**: 第 3 週 (共 10 週)
**負責人**: TBD
**預計交付日期**: TBD

---

## 1. 本週目標

拆分大型頁面檔案，實作 Code Splitting 策略，減少初始載入 bundle 大小。

---

## 2. 問題陳述

### 2.1 RecruitPage 檔案過大 (P1 - High)

**現況**:
- `/app/recruit/page.tsx` 超過 1,300 行
- 單一檔案包含多個完整組件 (HeroSection, SupportersWall, SupportForm 等)
- 所有組件一次性載入，無法利用 Code Splitting

**影響**:
- 初始 bundle 大小過大
- 難以維護和閱讀
- 無法針對特定組件進行優化

### 2.2 Guardian Dashboard 檔案過大 (P2 - Medium)

**現況**:
- `/app/guardian/dashboard/page.tsx` 包含 `EditModal`、`DashboardContent` 等
- 內聯定義多個組件
- 組件間耦合度高

**影響**:
- 增加維護成本
- 無法重用組件
- 測試困難

### 2.3 缺少動態載入策略 (P2 - Medium)

**現況**:
- 沒有使用 `next/dynamic` 進行動態載入
- 非關鍵組件與關鍵組件一起載入
- 首屏以下的內容也在初始 bundle 中

**影響**:
- 首次載入時間過長
- 浪費頻寬載入可能不會使用的程式碼
- Time to Interactive 延遲

---

## 3. 解決方案

### 3.1 RecruitPage 組件拆分

#### 3.1.1 目錄結構

```
/app/recruit/
├── page.tsx                    # 主頁面 (Server Component)
├── components/
│   ├── HeroSection.tsx         # Hero 區塊
│   ├── SupportersWall/
│   │   ├── index.tsx           # 主組件
│   │   ├── SupporterCard.tsx   # 支持者卡片
│   │   └── InfiniteScroll.tsx  # 無限滾動邏輯
│   ├── SupportForm/
│   │   ├── index.tsx           # 表單主組件
│   │   ├── FormFields.tsx      # 表單欄位
│   │   └── SubmitButton.tsx    # 提交按鈕
│   ├── StatsSection.tsx        # 統計數據
│   └── FAQSection.tsx          # FAQ 區塊
└── hooks/
    ├── useSupportForm.ts       # 表單邏輯 hook
    └── useSupporters.ts        # 支持者資料 hook
```

#### 3.1.2 HeroSection (Server Component)

建立 `/app/recruit/components/HeroSection.tsx`:

```typescript
import Image from 'next/image'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center">
      <Image
        src="/campus_tour.jpeg"
        alt="NUVA Campus Tour"
        fill
        priority
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
      <div className="relative z-10 container mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          成為校園支持者
        </h1>
        <p className="text-xl text-white/80 max-w-2xl">
          加入 NUVA Campus 的校園支持者計畫，與我們一起推動創新教育。
        </p>
      </div>
    </section>
  )
}
```

#### 3.1.3 SupportersWall (動態載入)

建立 `/app/recruit/components/SupportersWall/index.tsx`:

```typescript
'use client'

import { memo, useRef } from 'react'
import { useSupporters } from '../../hooks/useSupporters'
import { SupporterCard } from './SupporterCard'

function SupportersWallComponent() {
  const { supporters, isLoading } = useSupporters()
  const scrollRef = useRef<HTMLDivElement>(null)

  if (isLoading) {
    return <SupportersWallSkeleton />
  }

  // 分成三列
  const columns = [
    supporters.filter((_, i) => i % 3 === 0),
    supporters.filter((_, i) => i % 3 === 1),
    supporters.filter((_, i) => i % 3 === 2),
  ]

  return (
    <section className="py-20 overflow-hidden">
      <h2 className="text-3xl font-bold text-center mb-12">
        校園支持者牆
      </h2>
      <div className="flex gap-4" ref={scrollRef}>
        {columns.map((column, columnIndex) => (
          <ScrollColumn
            key={columnIndex}
            supporters={column}
            direction={columnIndex % 2 === 0 ? 'up' : 'down'}
          />
        ))}
      </div>
    </section>
  )
}

// 單列滾動組件
const ScrollColumn = memo(function ScrollColumn({
  supporters,
  direction,
}: {
  supporters: Supporter[]
  direction: 'up' | 'down'
}) {
  return (
    <div
      className={`flex flex-col gap-4 animate-scroll-${direction}`}
      style={{ '--scroll-duration': '60s' } as React.CSSProperties}
    >
      {[...supporters, ...supporters].map((supporter, index) => (
        <SupporterCard
          key={`${supporter.id}-${index}`}
          supporter={supporter}
        />
      ))}
    </div>
  )
})

function SupportersWallSkeleton() {
  return (
    <section className="py-20">
      <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-12 animate-pulse" />
      <div className="flex gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-4 flex-1">
            {[0, 1, 2, 3, 4].map((j) => (
              <div
                key={j}
                className="h-32 bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

export const SupportersWall = memo(SupportersWallComponent)
```

#### 3.1.4 主頁面重構

修改 `/app/recruit/page.tsx`:

```typescript
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { HeroSection } from './components/HeroSection'
import { Skeleton } from '@/components/ui/Skeleton'

// 動態載入非首屏組件
const SupportersWall = dynamic(
  () => import('./components/SupportersWall').then(mod => ({ default: mod.SupportersWall })),
  {
    loading: () => <SupportersWallSkeleton />,
    ssr: true
  }
)

const SupportForm = dynamic(
  () => import('./components/SupportForm').then(mod => ({ default: mod.SupportForm })),
  {
    loading: () => <FormSkeleton />,
    ssr: false // 表單不需要 SSR
  }
)

const FAQSection = dynamic(
  () => import('./components/FAQSection'),
  {
    loading: () => <FAQSkeleton />,
    ssr: true
  }
)

export default function RecruitPage() {
  return (
    <main>
      {/* 關鍵內容 - 直接載入 */}
      <HeroSection />

      {/* 支持者牆 - 動態載入 */}
      <Suspense fallback={<SupportersWallSkeleton />}>
        <SupportersWall />
      </Suspense>

      {/* 表單 - 動態載入，不 SSR */}
      <Suspense fallback={<FormSkeleton />}>
        <SupportForm />
      </Suspense>

      {/* FAQ - 動態載入 */}
      <Suspense fallback={<FAQSkeleton />}>
        <FAQSection />
      </Suspense>
    </main>
  )
}

// Skeleton 組件
function SupportersWallSkeleton() {
  return (
    <section className="py-20">
      <Skeleton className="h-8 w-48 mx-auto mb-12" />
      <div className="flex gap-4 px-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-4 flex-1">
            {Array.from({ length: 5 }).map((_, j) => (
              <Skeleton key={j} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

function FormSkeleton() {
  return (
    <section className="py-20 max-w-2xl mx-auto px-4">
      <Skeleton className="h-8 w-64 mb-8" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
        <Skeleton className="h-12 w-32" />
      </div>
    </section>
  )
}

function FAQSkeleton() {
  return (
    <section className="py-20 max-w-3xl mx-auto px-4">
      <Skeleton className="h-8 w-32 mb-8" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full mb-4" />
      ))}
    </section>
  )
}
```

### 3.2 Guardian Dashboard 拆分

#### 3.2.1 目錄結構

```
/app/guardian/dashboard/
├── page.tsx                    # 主頁面
├── components/
│   ├── DashboardHeader.tsx     # 頁首
│   ├── StatsGrid.tsx           # 統計卡片
│   ├── EventsTable.tsx         # 活動列表
│   ├── EditModal/
│   │   ├── index.tsx           # Modal 主組件
│   │   └── EventForm.tsx       # 活動編輯表單
│   └── QuickActions.tsx        # 快速操作
└── hooks/
    ├── useDashboardData.ts     # 資料 hook
    └── useEventMutation.ts     # 活動修改 hook
```

#### 3.2.2 EditModal 動態載入

```typescript
// /app/guardian/dashboard/page.tsx
import dynamic from 'next/dynamic'

const EditModal = dynamic(
  () => import('./components/EditModal'),
  {
    ssr: false,
    loading: () => null // Modal 不需要 loading state
  }
)

export default function DashboardPage() {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  return (
    <>
      <DashboardContent onEdit={setEditingEvent} />

      {editingEvent && (
        <EditModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
        />
      )}
    </>
  )
}
```

### 3.3 Bundle 分析設定

#### 3.3.1 安裝 Bundle Analyzer

```bash
npm install @next/bundle-analyzer
```

#### 3.3.2 設定 next.config.ts

```typescript
import type { NextConfig } from 'next'

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  // ... existing config
}

export default withBundleAnalyzer(nextConfig)
```

#### 3.3.3 新增分析腳本

更新 `package.json`:

```json
{
  "scripts": {
    "analyze": "ANALYZE=true next build",
    "analyze:server": "BUNDLE_ANALYZE=server next build",
    "analyze:browser": "BUNDLE_ANALYZE=browser next build"
  }
}
```

---

## 4. 技術規格

### 4.1 Code Splitting 策略

| 組件 | 載入策略 | SSR | 原因 |
|------|----------|-----|------|
| HeroSection | 立即載入 | Yes | 首屏內容，SEO 重要 |
| SupportersWall | 動態載入 | Yes | 首屏以下，但 SEO 有幫助 |
| SupportForm | 動態載入 | No | 互動組件，不需 SSR |
| EditModal | 動態載入 | No | 條件渲染，不需 SSR |
| FAQSection | 動態載入 | Yes | 首屏以下，SEO 有幫助 |

### 4.2 檔案大小目標

| 頁面 | 當前大小 | 目標大小 |
|------|----------|----------|
| /recruit | ~150KB | < 80KB (首次載入) |
| /guardian/dashboard | ~120KB | < 60KB (首次載入) |

### 4.3 組件拆分原則

1. **單一職責**: 每個檔案 < 300 行
2. **可重用性**: 通用組件放 `/components/ui/`
3. **頁面專屬**: 特定頁面組件放各自的 `components/` 目錄
4. **邏輯分離**: Hooks 放獨立檔案

---

## 5. 驗收標準

### 5.1 拆分驗收

- [ ] RecruitPage 拆分為至少 5 個獨立組件
- [ ] Dashboard 拆分為至少 4 個獨立組件
- [ ] 每個檔案不超過 300 行
- [ ] 組件之間 interface 清晰

### 5.2 Code Splitting 驗收

- [ ] 使用 `next/dynamic` 延遲載入非首屏組件
- [ ] 動態載入組件有適當的 loading fallback
- [ ] Bundle Analyzer 報告顯示多個 chunk

### 5.3 效能驗收

- [ ] 首次載入 bundle 減少 > 30%
- [ ] Lighthouse Performance 分數維持或提升
- [ ] 沒有功能回歸

---

## 6. 實作步驟

### Day 1-2: RecruitPage 拆分

1. 建立目錄結構
2. 抽取 HeroSection
3. 抽取 SupportersWall 相關組件
4. 抽取 SupportForm 相關組件
5. 抽取 FAQSection
6. 設定動態載入

### Day 3: Guardian Dashboard 拆分

1. 建立目錄結構
2. 抽取 EditModal
3. 抽取 StatsGrid
4. 抽取 EventsTable
5. 設定動態載入

### Day 4: Bundle 分析與優化

1. 安裝並設定 Bundle Analyzer
2. 執行分析找出大型模組
3. 優化依賴載入

### Day 5: 測試與驗收

1. 功能回歸測試
2. 效能測試
3. 文件更新

---

## 7. 風險與緩解措施

| 風險 | 機率 | 影響 | 緩解措施 |
|------|------|------|----------|
| 組件間狀態管理複雜化 | 中 | 中 | 使用 Context 或狀態提升 |
| 動態載入導致閃爍 | 中 | 低 | 提供合適的 Skeleton |
| Import 路徑錯誤 | 低 | 低 | 使用 TypeScript 路徑別名 |

---

## 8. 交付清單

- [ ] `/app/recruit/components/` 目錄及所有組件
- [ ] `/app/recruit/hooks/` 目錄及所有 hooks
- [ ] `/app/recruit/page.tsx` 重構
- [ ] `/app/guardian/dashboard/components/` 目錄
- [ ] `/app/guardian/dashboard/page.tsx` 重構
- [ ] `next.config.ts` 更新 (Bundle Analyzer)
- [ ] `package.json` 更新 (scripts)
- [ ] Bundle 分析報告

---

## 9. 成功指標

| 指標 | 目標值 | 測量方式 |
|------|--------|----------|
| 首次載入 JS 大小 | 減少 30%+ | Bundle Analyzer |
| RecruitPage 最大檔案 | < 300 行 | 程式碼行數統計 |
| 組件重用次數 | > 5 個組件 | 程式碼審查 |
| Lighthouse TTI | 改善 20%+ | Lighthouse |

---

## 10. 本週里程碑

- **Day 1-2**: RecruitPage 完全拆分
- **Day 3**: Guardian Dashboard 拆分
- **Day 4**: Bundle 分析與優化
- **Day 5**: 測試驗收

---

*下一週預告: 圖片優化與資源預載入策略*
