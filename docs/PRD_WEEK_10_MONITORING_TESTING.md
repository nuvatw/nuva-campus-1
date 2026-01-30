# PRD Week 10: 監控、測試與最終驗收

**專案**: NUVA Campus 效能與 UI/UX 優化計畫
**週次**: 第 10 週 (共 10 週)
**負責人**: TBD
**預計交付日期**: TBD

---

## 1. 本週目標

建立完整的監控系統、補足測試覆蓋、進行最終驗收與效能基準測試。

---

## 2. 問題陳述

### 2.1 缺乏效能監控 (P2 - Medium)

**現況**:
- 沒有 Web Vitals 監控
- 無法追蹤實際使用者效能數據
- 效能問題難以及時發現

**影響**:
- 無法持續優化
- 問題可能累積到嚴重程度才被發現
- 缺乏數據驅動的決策依據

### 2.2 測試覆蓋不足 (P2 - Medium)

**現況**:
- `/tests/` 只有 3 個測試檔案
- 缺少 E2E 測試
- 缺少整合測試

**影響**:
- 重構時風險高
- Bug 可能流入生產環境
- 團隊信心不足

### 2.3 缺乏錯誤追蹤 (P2 - Medium)

**現況**:
- 只有 console.error 記錄
- 無法追蹤生產環境錯誤
- 無法關聯使用者和錯誤

**影響**:
- 使用者遇到問題無法及時發現
- 難以重現和修復問題
- 支援效率低

---

## 3. 解決方案

### 3.1 Web Vitals 監控

#### 3.1.1 建立 Web Vitals 收集

建立 `/app/lib/web-vitals.ts`:

```typescript
import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB, Metric } from 'web-vitals'

type MetricName = 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB'

interface VitalsReport {
  name: MetricName
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  navigationType: string
  url: string
}

const vitalsEndpoint = process.env.NEXT_PUBLIC_VITALS_ENDPOINT

function sendToAnalytics(metric: Metric) {
  const report: VitalsReport = {
    name: metric.name as MetricName,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType || 'unknown',
    url: window.location.href,
  }

  // 發送到分析端點
  if (vitalsEndpoint) {
    const body = JSON.stringify(report)

    // 使用 sendBeacon 確保頁面關閉時也能發送
    if (navigator.sendBeacon) {
      navigator.sendBeacon(vitalsEndpoint, body)
    } else {
      fetch(vitalsEndpoint, {
        body,
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  // 開發環境輸出到 console
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}: ${metric.value} (${metric.rating})`)
  }
}

export function initWebVitals() {
  onCLS(sendToAnalytics)
  onFCP(sendToAnalytics)
  onFID(sendToAnalytics)
  onINP(sendToAnalytics)
  onLCP(sendToAnalytics)
  onTTFB(sendToAnalytics)
}
```

#### 3.1.2 建立 Vitals Provider

建立 `/app/components/VitalsProvider.tsx`:

```typescript
'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { initWebVitals } from '@/lib/web-vitals'

export function VitalsProvider() {
  const pathname = usePathname()

  useEffect(() => {
    initWebVitals()
  }, [])

  // 記錄頁面瀏覽
  useEffect(() => {
    // 可整合 Google Analytics 或其他分析工具
    console.log(`[Analytics] Page view: ${pathname}`)
  }, [pathname])

  return null
}
```

### 3.2 錯誤追蹤 (Sentry)

#### 3.2.1 安裝 Sentry

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

#### 3.2.2 配置 Sentry

建立 `/sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // 效能監控取樣率
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // 錯誤取樣率
  sampleRate: 1.0,

  // 除錯模式
  debug: false,

  // 整合設定
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  // Replay 取樣率
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // 忽略特定錯誤
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],

  // 在發送前處理
  beforeSend(event, hint) {
    // 過濾敏感資訊
    if (event.request?.headers) {
      delete event.request.headers['Authorization']
      delete event.request.headers['Cookie']
    }
    return event
  },
})
```

建立 `/sentry.server.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
})
```

#### 3.2.3 錯誤邊界整合

更新 `/app/error.tsx`:

```typescript
'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 回報錯誤到 Sentry
    Sentry.captureException(error, {
      tags: {
        digest: error.digest,
      },
    })
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          發生錯誤
        </h1>

        <p className="text-gray-500 mb-6">
          很抱歉，頁面發生了一些問題。我們已經收到錯誤報告。
        </p>

        <div className="flex gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            重試
          </Button>

          <Button
            variant="secondary"
            onClick={() => window.location.href = '/'}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            返回首頁
          </Button>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-gray-400">
            錯誤代碼: {error.digest}
          </p>
        )}

        {/* Sentry Feedback Button */}
        <button
          onClick={() => Sentry.showReportDialog({ eventId: error.digest })}
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          回報此問題
        </button>
      </div>
    </div>
  )
}
```

### 3.3 測試基礎設施

#### 3.3.1 單元測試配置

更新 `/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules',
        'tests',
        '**/*.d.ts',
        '**/*.config.*',
      ],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app'),
    },
  },
})
```

#### 3.3.2 測試設定

建立 `/tests/setup.ts`:

```typescript
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// 每個測試後清理
afterEach(() => {
  cleanup()
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
        order: vi.fn(),
      })),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
    auth: {
      getSession: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
  },
}))
```

#### 3.3.3 組件測試範例

建立 `/tests/components/Button.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state', () => {
    render(<Button loading>Submit</Button>)

    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByText('Submit')).toBeInTheDocument()
  })

  it('applies variant styles', () => {
    render(<Button variant="secondary">Secondary</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-gray') // 假設 secondary variant 有這個 class
  })
})
```

#### 3.3.4 服務測試範例

建立 `/tests/services/events.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { eventService } from '@/services/events'

// Mock Supabase client
vi.mock('@/lib/supabase-server', () => ({
  createServerClient: () => ({
    from: vi.fn((table: string) => ({
      select: vi.fn(() => ({
        order: vi.fn(() =>
          Promise.resolve({
            data: mockEvents,
            error: null,
          })
        ),
        eq: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({
              data: mockEvents[0],
              error: null,
            })
          ),
        })),
      })),
    })),
  }),
}))

const mockEvents = [
  {
    id: '1',
    title: 'Test Event',
    description: 'Test description',
    type: 'workshop',
    status: 'published',
    location: 'Test Location',
    capacity: 50,
    start_date: '2024-01-01T10:00:00Z',
    end_date: '2024-01-01T12:00:00Z',
    created_at: '2023-12-01T00:00:00Z',
    updated_at: '2023-12-01T00:00:00Z',
    created_by: 'user-1',
  },
]

describe('EventService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('returns events successfully', async () => {
      const result = await eventService.list()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(1)
        expect(result.data[0].title).toBe('Test Event')
      }
    })
  })

  describe('getById', () => {
    it('returns a single event', async () => {
      const result = await eventService.getById('1')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe('1')
      }
    })
  })
})
```

### 3.4 E2E 測試 (Playwright)

#### 3.4.1 安裝 Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

#### 3.4.2 配置 Playwright

建立 `/playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

#### 3.4.3 E2E 測試範例

建立 `/e2e/recruit.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Recruit Page', () => {
  test('should load the page successfully', async ({ page }) => {
    await page.goto('/recruit')

    // 檢查 Hero 區塊
    await expect(page.locator('h1')).toContainText('成為校園支持者')
  })

  test('should show form validation errors', async ({ page }) => {
    await page.goto('/recruit')

    // 直接提交空表單
    await page.click('button[type="submit"]')

    // 應該顯示錯誤訊息
    await expect(page.locator('text=請輸入姓名')).toBeVisible()
  })

  test('should submit form successfully', async ({ page }) => {
    await page.goto('/recruit')

    // 填寫表單
    await page.fill('input[name="name"]', '測試使用者')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.selectOption('select[name="university"]', '國立台灣大學')
    await page.fill('input[name="department"]', '資訊工程學系')
    await page.check('input[name="agreeToTerms"]')

    // 提交
    await page.click('button[type="submit"]')

    // 應該顯示成功訊息
    await expect(page.locator('text=報名成功')).toBeVisible()
  })
})

test.describe('Guardian Check-in', () => {
  test.beforeEach(async ({ page }) => {
    // 模擬登入
    await page.goto('/guardian')
    await page.fill('input[type="password"]', 'test-password')
    await page.click('button[type="submit"]')
  })

  test('should load events list', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('活動列表')
  })
})
```

### 3.5 效能基準測試

建立 `/scripts/lighthouse-ci.js`:

```javascript
const lighthouse = require('lighthouse')
const chromeLauncher = require('chrome-launcher')
const fs = require('fs')

const URLS = [
  { name: 'Home', url: '/' },
  { name: 'Recruit', url: '/recruit' },
  { name: 'Guardian Dashboard', url: '/guardian/dashboard' },
]

const THRESHOLDS = {
  performance: 80,
  accessibility: 90,
  'best-practices': 85,
  seo: 85,
  pwa: 80,
}

async function runLighthouse(url, chrome) {
  const result = await lighthouse(url, {
    port: chrome.port,
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
  })

  return result.lhr
}

async function main() {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] })
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
  const results = []

  for (const { name, url } of URLS) {
    console.log(`Testing ${name}...`)
    const result = await runLighthouse(`${baseUrl}${url}`, chrome)

    const scores = {
      name,
      url,
      performance: Math.round(result.categories.performance.score * 100),
      accessibility: Math.round(result.categories.accessibility.score * 100),
      'best-practices': Math.round(result.categories['best-practices'].score * 100),
      seo: Math.round(result.categories.seo.score * 100),
      pwa: Math.round(result.categories.pwa.score * 100),
    }

    results.push(scores)

    // 檢查閾值
    for (const [key, threshold] of Object.entries(THRESHOLDS)) {
      if (scores[key] < threshold) {
        console.error(`❌ ${name} ${key}: ${scores[key]} < ${threshold}`)
      } else {
        console.log(`✓ ${name} ${key}: ${scores[key]}`)
      }
    }
  }

  await chrome.kill()

  // 輸出報告
  fs.writeFileSync(
    'lighthouse-report.json',
    JSON.stringify(results, null, 2)
  )

  console.log('\nReport saved to lighthouse-report.json')

  // 如果任何測試失敗，返回非零退出碼
  const failed = results.some((r) =>
    Object.entries(THRESHOLDS).some(([key, threshold]) => r[key] < threshold)
  )

  process.exit(failed ? 1 : 0)
}

main().catch(console.error)
```

---

## 4. 技術規格

### 4.1 監控指標

| 類別 | 指標 | 目標值 |
|------|------|--------|
| Core Web Vitals | LCP | < 2.5s |
| Core Web Vitals | FID/INP | < 100ms |
| Core Web Vitals | CLS | < 0.1 |
| 效能 | TTFB | < 600ms |
| 效能 | FCP | < 1.8s |

### 4.2 測試覆蓋目標

| 類型 | 覆蓋率目標 |
|------|------------|
| 單元測試 | > 70% |
| 整合測試 | 關鍵流程 100% |
| E2E 測試 | 主要使用案例 |

### 4.3 CI/CD 流程

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test:coverage
      - run: npm run build

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run e2e

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - run: npm run start &
      - run: npm run lighthouse
```

---

## 5. 驗收標準

### 5.1 監控驗收

- [ ] Web Vitals 收集正常運作
- [ ] Sentry 錯誤追蹤正常
- [ ] 生產環境有完整監控儀表板
- [ ] 告警設定完成

### 5.2 測試驗收

- [ ] 單元測試覆蓋率 > 70%
- [ ] E2E 測試覆蓋主要流程
- [ ] CI 流程自動執行所有測試
- [ ] 測試文件完整

### 5.3 效能驗收

- [ ] Lighthouse Performance > 80
- [ ] Lighthouse Accessibility > 90
- [ ] Core Web Vitals 全綠
- [ ] PWA Score > 80

---

## 6. 最終驗收清單

### 6.1 安全性 (Week 1)

- [ ] 密碼安全儲存
- [ ] API 認證機制
- [ ] Rate Limiting

### 6.2 效能 (Week 2-4)

- [ ] 字體優化
- [ ] 首頁 SSR
- [ ] Code Splitting
- [ ] 圖片優化

### 6.3 UX (Week 5-6)

- [ ] 錯誤處理
- [ ] Loading 狀態
- [ ] 表單驗證
- [ ] Toast 系統

### 6.4 資料層 (Week 7-8)

- [ ] Real-time 訂閱
- [ ] Optimistic Updates
- [ ] 型別統一
- [ ] 程式碼品質

### 6.5 PWA (Week 9)

- [ ] 可安裝
- [ ] 離線支援
- [ ] 網路狀態指示

### 6.6 監控與測試 (Week 10)

- [ ] Web Vitals 監控
- [ ] 錯誤追蹤
- [ ] 測試覆蓋
- [ ] CI/CD 流程

---

## 7. 交付清單

- [ ] `/app/lib/web-vitals.ts` - 新增
- [ ] `/app/components/VitalsProvider.tsx` - 新增
- [ ] `/sentry.client.config.ts` - 新增
- [ ] `/sentry.server.config.ts` - 新增
- [ ] `/vitest.config.ts` - 更新
- [ ] `/playwright.config.ts` - 新增
- [ ] `/tests/setup.ts` - 新增
- [ ] `/tests/components/*.test.tsx` - 新增
- [ ] `/tests/services/*.test.ts` - 新增
- [ ] `/e2e/*.spec.ts` - 新增
- [ ] `/.github/workflows/ci.yml` - 新增
- [ ] `/scripts/lighthouse-ci.js` - 新增
- [ ] 最終效能報告文件
- [ ] 專案回顧文件

---

## 8. 成功指標總結

| 類別 | 指標 | Week 1 基準 | 目標值 | 達成率 |
|------|------|-------------|--------|--------|
| 安全 | P0 漏洞數 | 4 | 0 | TBD |
| 效能 | Lighthouse | ~60 | > 80 | TBD |
| 效能 | LCP | ~3.5s | < 2.5s | TBD |
| 效能 | CLS | ~0.15 | < 0.1 | TBD |
| 程式碼 | 型別覆蓋 | ~70% | > 95% | TBD |
| 測試 | 測試覆蓋 | ~10% | > 70% | TBD |
| PWA | Lighthouse PWA | N/A | > 80 | TBD |

---

## 9. 專案回顧

### 9.1 成就

- 安全性基礎已建立
- 效能顯著提升
- 使用者體驗改善
- 程式碼品質提升
- 完整的監控與測試

### 9.2 未來建議

1. **持續監控**: 定期檢視 Web Vitals 和錯誤報告
2. **效能預算**: 設定 bundle size 預算，避免效能退化
3. **A/B 測試**: 對 UI 變更進行 A/B 測試
4. **使用者回饋**: 定期收集使用者回饋
5. **技術債務**: 持續追蹤和處理技術債務

---

*專案完成！*
