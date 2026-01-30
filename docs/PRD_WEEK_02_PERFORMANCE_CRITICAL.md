# PRD Week 2: 關鍵效能修復

**專案**: NUVA Campus 效能與 UI/UX 優化計畫
**週次**: 第 2 週 (共 10 週)
**負責人**: TBD
**預計交付日期**: TBD

---

## 1. 本週目標

修復最影響效能的關鍵問題：字體載入阻塞、首頁客戶端渲染、以及不必要的重新渲染。

---

## 2. 問題陳述

### 2.1 字體載入阻塞渲染 (P1 - High)

**現況**:
- `/app/globals.css` 第 1 行使用 `@import` 載入 Google Fonts
- CSS `@import` 會阻塞 CSS 解析，延遲 First Contentful Paint (FCP)

**影響**:
- 頁面載入時出現無樣式文字閃爍 (FOUT) 或白屏
- Core Web Vitals - LCP 指標受影響
- 使用者感知載入時間增加

### 2.2 首頁使用 Client Component (P1 - High)

**現況**:
- `/app/page.tsx` 第 1 行標記 `'use client'`
- 整個首頁作為 Client Component 執行
- 無法利用 Server-Side Rendering 優勢

**影響**:
- JavaScript 必須載入並執行後才能顯示內容
- SEO 效果降低
- 首次內容繪製延遲

### 2.3 MissionGrid 每秒倒數計時 (P1 - High)

**現況**:
- `/app/components/ui/MissionGrid.tsx:76` 使用 `setInterval` 每秒更新
- 每次更新觸發整個組件重新渲染
- 即使任務沒有變化也持續渲染

**影響**:
- 不必要的 CPU 使用
- 電池消耗增加 (行動裝置)
- 可能造成 UI 卡頓

---

## 3. 解決方案

### 3.1 字體載入優化

#### 3.1.1 使用 Next.js Font Optimization

建立 `/app/fonts.ts`:

```typescript
import { Noto_Sans_TC, Noto_Sans_JP } from 'next/font/google'

export const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  preload: true,
  variable: '--font-noto-sans-tc',
})

export const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  preload: false, // 次要字體不預載
  variable: '--font-noto-sans-jp',
})
```

#### 3.1.2 更新 Layout

修改 `/app/layout.tsx`:

```typescript
import { notoSansTC, notoSansJP } from './fonts'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="zh-TW"
      className={`${notoSansTC.variable} ${notoSansJP.variable}`}
    >
      <body className={notoSansTC.className}>
        {children}
      </body>
    </html>
  )
}
```

#### 3.1.3 更新 CSS

修改 `/app/globals.css`:

```css
/* 移除 @import 語句 */
/* @import url('https://fonts.googleapis.com/...'); */

:root {
  --font-sans: var(--font-noto-sans-tc), system-ui, sans-serif;
  --font-jp: var(--font-noto-sans-jp), var(--font-noto-sans-tc), sans-serif;
}

body {
  font-family: var(--font-sans);
}
```

### 3.2 首頁 SSR 重構

#### 3.2.1 拆分 Server 與 Client 組件

建立 `/app/components/home/HeroSection.tsx` (Server Component):

```typescript
// 不需要 'use client'
import Image from 'next/image'

export function HeroSection() {
  return (
    <section className="relative h-screen">
      <Image
        src="/hero-bg.jpg"
        alt="NUVA Campus"
        fill
        priority
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,..."
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl md:text-6xl font-bold text-white">
          NUVA Campus
        </h1>
      </div>
    </section>
  )
}
```

建立 `/app/components/home/InteractiveSection.tsx` (Client Component):

```typescript
'use client'

import { useState } from 'react'
import { MissionGrid } from '../ui/MissionGrid'

export function InteractiveSection() {
  // 所有互動邏輯放這裡
  return (
    <section>
      <MissionGrid />
    </section>
  )
}
```

#### 3.2.2 重構首頁

修改 `/app/page.tsx`:

```typescript
// 移除 'use client'
import { HeroSection } from './components/home/HeroSection'
import { InteractiveSection } from './components/home/InteractiveSection'
import { fetchInitialData } from './services/home'

export default async function HomePage() {
  // Server-side data fetching
  const initialData = await fetchInitialData()

  return (
    <main>
      <HeroSection />
      <InteractiveSection initialData={initialData} />
    </main>
  )
}
```

### 3.3 MissionGrid 倒數計時優化

#### 3.3.1 獨立 Countdown 組件

建立 `/app/components/ui/Countdown.tsx`:

```typescript
'use client'

import { useState, useEffect, memo } from 'react'

interface CountdownProps {
  targetDate: Date
  onComplete?: () => void
}

function CountdownComponent({ targetDate, onComplete }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(() =>
    calculateTimeLeft(targetDate)
  )

  useEffect(() => {
    // 只有當 targetDate 改變時才重新設定
    const interval = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(targetDate)
      setTimeLeft(newTimeLeft)

      if (newTimeLeft.total <= 0) {
        clearInterval(interval)
        onComplete?.()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate, onComplete])

  if (timeLeft.total <= 0) {
    return <span className="text-green-500">已開始</span>
  }

  return (
    <span className="font-mono tabular-nums">
      {timeLeft.days > 0 && `${timeLeft.days}天 `}
      {String(timeLeft.hours).padStart(2, '0')}:
      {String(timeLeft.minutes).padStart(2, '0')}:
      {String(timeLeft.seconds).padStart(2, '0')}
    </span>
  )
}

function calculateTimeLeft(targetDate: Date) {
  const total = targetDate.getTime() - Date.now()

  return {
    total,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / 1000 / 60) % 60),
    seconds: Math.floor((total / 1000) % 60),
  }
}

// Memo 防止父組件重新渲染時不必要的更新
export const Countdown = memo(CountdownComponent)
```

#### 3.3.2 重構 MissionGrid

修改 `/app/components/ui/MissionGrid.tsx`:

```typescript
'use client'

import { memo } from 'react'
import { Countdown } from './Countdown'
import { MissionItem } from './MissionItem'
import type { Mission } from '@/types/mission'

interface MissionGridProps {
  missions: Mission[]
}

function MissionGridComponent({ missions }: MissionGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {missions.map((mission) => (
        <MissionItemWithCountdown
          key={mission.id}
          mission={mission}
        />
      ))}
    </div>
  )
}

// 將 MissionItem 與 Countdown 組合，避免整個 Grid 重新渲染
const MissionItemWithCountdown = memo(function MissionItemWithCountdown({
  mission
}: {
  mission: Mission
}) {
  return (
    <MissionItem mission={mission}>
      {mission.startDate && (
        <Countdown targetDate={new Date(mission.startDate)} />
      )}
    </MissionItem>
  )
})

export const MissionGrid = memo(MissionGridComponent)
```

---

## 4. 技術規格

### 4.1 字體載入策略

| 字體 | 權重 | 策略 | 原因 |
|------|------|------|------|
| Noto Sans TC | 400, 500, 700 | preload | 主要字體 |
| Noto Sans JP | 400, 500, 700 | lazy | 次要語言 |

### 4.2 組件渲染策略

| 組件 | 類型 | 原因 |
|------|------|------|
| HeroSection | Server | 純展示，SEO 重要 |
| Navigation | Server | 無互動，可 SSR |
| MissionGrid | Client | 有倒數計時互動 |
| Countdown | Client | 需要 setInterval |

### 4.3 效能指標目標

| 指標 | 當前值 | 目標值 |
|------|--------|--------|
| First Contentful Paint | ~2.5s | < 1.5s |
| Largest Contentful Paint | ~3.5s | < 2.5s |
| Time to Interactive | ~4.0s | < 3.0s |
| Cumulative Layout Shift | ~0.15 | < 0.1 |

---

## 5. 驗收標準

### 5.1 字體優化驗收

- [ ] 移除所有 CSS `@import` 字體載入
- [ ] 使用 `next/font` 載入所有 Google Fonts
- [ ] 字體檔案通過 Next.js 自動優化
- [ ] 無 FOUT (Flash of Unstyled Text)
- [ ] Network waterfall 中字體與 CSS 並行載入

### 5.2 首頁 SSR 驗收

- [ ] `/app/page.tsx` 不再是 Client Component
- [ ] 檢視原始碼可看到完整 HTML 內容
- [ ] Hero 圖片有 blur placeholder
- [ ] 互動組件正確 hydrate

### 5.3 倒數計時優化驗收

- [ ] Countdown 組件獨立更新，不觸發 MissionGrid 重新渲染
- [ ] React DevTools Profiler 確認無不必要的渲染
- [ ] 多個倒數計時同時運作時 CPU 使用率穩定

### 5.4 效能測試

- [ ] Lighthouse Performance Score > 80
- [ ] 首頁 LCP < 2.5s (3G throttling)
- [ ] 首頁 FCP < 1.5s (3G throttling)

---

## 6. 實作步驟

### Day 1: 字體優化

1. 建立 `/app/fonts.ts`
2. 更新 `/app/layout.tsx`
3. 修改 `/app/globals.css`
4. 測試所有頁面字體顯示

### Day 2-3: 首頁重構

1. 建立 `/app/components/home/` 目錄結構
2. 拆分 HeroSection (Server Component)
3. 拆分 InteractiveSection (Client Component)
4. 重構 `/app/page.tsx`
5. 確保 hydration 正確

### Day 4: Countdown 優化

1. 建立獨立 Countdown 組件
2. 重構 MissionGrid 組件
3. 加入 memo 優化
4. 使用 React DevTools 驗證

### Day 5: 整合與測試

1. 執行 Lighthouse 測試
2. 效能回歸測試
3. 跨瀏覽器測試
4. 行動裝置測試

---

## 7. 風險與緩解措施

| 風險 | 機率 | 影響 | 緩解措施 |
|------|------|------|----------|
| Hydration mismatch | 中 | 高 | 仔細區分 Server/Client 組件 |
| 字體 fallback 不一致 | 低 | 低 | 設定適當的 font-display |
| 倒數計時精度問題 | 低 | 低 | 使用 requestAnimationFrame 作為備案 |

---

## 8. 交付清單

- [ ] `/app/fonts.ts` - 新增
- [ ] `/app/layout.tsx` - 修改
- [ ] `/app/globals.css` - 修改
- [ ] `/app/page.tsx` - 重構
- [ ] `/app/components/home/HeroSection.tsx` - 新增
- [ ] `/app/components/home/InteractiveSection.tsx` - 新增
- [ ] `/app/components/ui/Countdown.tsx` - 新增
- [ ] `/app/components/ui/MissionGrid.tsx` - 修改
- [ ] Lighthouse 測試報告

---

## 9. 成功指標

| 指標 | 目標值 | 測量方式 |
|------|--------|----------|
| Lighthouse Performance | > 80 | Lighthouse CI |
| FCP 改善 | > 40% | Web Vitals |
| LCP 改善 | > 30% | Web Vitals |
| Bundle Size | 不增加 | Bundle Analyzer |

---

## 10. 本週里程碑

- **Day 1**: 字體優化完成
- **Day 2-3**: 首頁 SSR 重構
- **Day 4**: Countdown 組件優化
- **Day 5**: 測試與驗證

---

*下一週預告: 大型頁面拆分與 Code Splitting*
