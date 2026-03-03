# NUVA Campus 六週代碼優化計畫 PRD

**版本**: 1.0
**日期**: 2026-01-30
**專案**: nuva-campus-1
**文件類型**: Product Requirements Document (PRD)

---

## 目錄

1. [執行摘要](#1-執行摘要)
2. [現況分析](#2-現況分析)
3. [優化目標與指標](#3-優化目標與指標)
4. [六週詳細執行計畫](#4-六週詳細執行計畫)
5. [技術規格](#5-技術規格)
6. [風險評估與緩解](#6-風險評估與緩解)
7. [成功標準與驗收](#7-成功標準與驗收)

---

## 1. 執行摘要

### 1.1 專案概述

NUVA Campus 是一個基於 Next.js 16 + React 19 + Supabase 的校園活動管理平台，具有日系極簡設計風格。目前專案處於大型重構階段，存在顯著的代碼重複、效能瓶頸和架構不一致問題。

### 1.2 現況統計

| 指標 | 數值 |
|------|------|
| TypeScript 檔案總數 | 72 個 |
| 元件數量 | 28 個 |
| 服務層 | 3 個 |
| 頁面/佈局 | 20+ 個 |
| App 目錄大小 | 656 KB |
| 代碼重複率 | ~15% |
| 測試覆蓋率 | 0% |
| 型別覆蓋率 | ~95% |

### 1.3 核心問題

1. **認證邏輯三重複製** - `getAuthState()` 在 3 個檔案中重複
2. **無快取策略** - 每次請求直接打 Supabase
3. **N+1 查詢問題** - 服務層存在低效查詢模式
4. **魔術字串散落** - 角色、狀態、金鑰等硬編碼
5. **表單邏輯未抽象** - 數字鍵盤實作 3 份
6. **無測試覆蓋** - 零測試檔案

### 1.4 預期成果

經過六週優化後：
- **效能提升 60-70%** (減少 Supabase 查詢)
- **代碼重複率降至 5%** (從 15%)
- **測試覆蓋率達 60%** (從 0%)
- **可維護性大幅提升** (標準化架構)

---

## 2. 現況分析

### 2.1 技術棧

```
核心框架:
├── Next.js 16.1.0 (App Router + Turbopack)
├── React 19.2.3
├── TypeScript 5.9.3 (strict mode)
├── Tailwind CSS 3.4.1
├── Supabase 2.89.0 (PostgreSQL + Auth + Realtime)
├── SWR 2.3.8 (資料快取)
└── Resend 6.9.1 (郵件發送)
```

### 2.2 目錄結構

```
app/
├── components/          # 28 個 UI 元件
│   ├── ui/             # 15 個可重用元件
│   ├── icons/          # SVG 圖標元件
│   ├── AuthGuard.tsx   # 認證包裝器 (241 LOC)
│   ├── Providers.tsx   # Context providers
│   └── TaiwanMap.tsx
├── api/
│   ├── auth/           # 密碼驗證端點
│   ├── email/          # 郵件發送 (Resend)
│   └── nunu-content/   # 內容路由
├── lib/
│   ├── supabase.ts     # Client 端 Supabase
│   └── supabase-server.ts # Server 端 Supabase
├── services/           # 資料服務層
│   ├── events.service.ts (186 LOC)
│   ├── registrations.service.ts (212 LOC)
│   └── workshops.service.ts (163 LOC)
├── hooks/
│   └── useAuth.ts      # 認證 Hook (175 LOC)
├── types/              # 7 個 TypeScript 介面
├── data/               # 資料常數 (多為廢棄)
├── guardian/           # 監護人角色頁面
├── ambassador/         # 大使角色頁面
└── nunu/              # 活動志工頁面
```

### 2.3 代碼重複分析

#### 2.3.1 認證狀態邏輯 (三重複製)

| 檔案 | 行數 | 功能 |
|------|------|------|
| `AuthGuard.tsx` | 241 | getAuthState + Modal + Keypad |
| `PasswordModal.tsx` | 305 | getAuthState + Modal + Keypad |
| `useAuth.ts` | 175 | getAuthState + Supabase 查詢 |

**問題**: 相同的 `getAuthState()` 函數在三處實作，約 40 行/處，總計 ~120 行重複代碼。

#### 2.3.2 表單輸入邏輯 (三重實作)

- `CodeInput.tsx` - 4 位數字輸入
- `NumericKeypad.tsx` - 數字鍵盤
- `PasswordModal.tsx` - 完整密碼輸入邏輯

#### 2.3.3 魔術字串散落

```typescript
// 散落在多個檔案中
'event_' // prefix (3+ 檔案)
'done', 'ongoing', 'locked' // 狀態值
'nunu', 'ambassador', 'guardian' // 角色金鑰
'nuva_campus_auth' // localStorage 金鑰
```

### 2.4 效能瓶頸

#### 2.4.1 無快取策略

```
目前資料流:
Client → SWR (30-90s TTL) → Supabase
        ↓
     Cache Miss → 直接查詢資料庫
```

**問題**: 無伺服器端快取、無 Redis、無分散式快取

#### 2.4.2 N+1 查詢問題

```typescript
// events.service.ts - getWithStats()
async getWithStats(id: string) {
  const event = await this.getById(id);     // 查詢 1
  const registrations = await regService.getByEvent(id); // 查詢 2
  return { ...event, stats: calculate(registrations) };
}

// getAllWithStats() 更糟 - N+1 問題
async getAllWithStats() {
  const events = await this.getAll();  // 查詢 1
  for (const event of events) {        // N 次查詢
    event.stats = await this.getStats(event.id);
  }
}
```

#### 2.4.3 Realtime 過度使用

```typescript
// MissionGrid.tsx - 單一任務也使用 Realtime 訂閱
supabase.channel('missions').on('postgres_changes', ...)
```

### 2.5 架構不一致

| 問題 | 位置 | 影響 |
|------|------|------|
| 密碼驗證方式不一致 | PasswordModal vs useAuth | PasswordModal 用 API，useAuth 直接查 Supabase |
| 狀態值不統一 | MissionGrid | 'done' vs 'completed' 混用 |
| 資料轉換散落 | AmbassadorPage, GuardianPage | formatWorkshop 邏輯在元件內 |
| localStorage 存取重複 | AuthGuard, PasswordModal, useAuth | 每個元件都有 JSON.parse |

---

## 3. 優化目標與指標

### 3.1 主要目標

| 目標 | 當前值 | 目標值 | 優先級 |
|------|--------|--------|--------|
| Supabase 查詢次數/頁面 | 3-5 次 | 1-2 次 | P0 |
| 代碼重複率 | 15% | < 5% | P0 |
| 首次內容繪製 (FCP) | ~2s | < 1s | P1 |
| 測試覆蓋率 | 0% | 60% | P1 |
| 型別安全性 | 95% | 100% | P2 |
| Bundle 大小 | 656 KB | < 500 KB | P2 |

### 3.2 質量指標

```
可維護性指標:
├── 認知複雜度 < 15 per function
├── 函數行數 < 50 LOC
├── 檔案行數 < 300 LOC
├── 循環依賴 = 0
└── 魔術字串 = 0
```

### 3.3 效能指標

```
Core Web Vitals 目標:
├── LCP (Largest Contentful Paint) < 2.5s
├── FID (First Input Delay) < 100ms
├── CLS (Cumulative Layout Shift) < 0.1
├── TTFB (Time to First Byte) < 600ms
└── INP (Interaction to Next Paint) < 200ms
```

---

## 4. 六週詳細執行計畫

### 第一週: 基礎架構與認證重構

#### 目標
- 消除認證邏輯重複
- 建立常數檔案
- 統一 localStorage 存取

#### 任務清單

| 任務 | 檔案 | 預估工時 | 優先級 |
|------|------|----------|--------|
| 建立 `constants/auth.ts` | 新建 | 2h | P0 |
| 建立 `constants/roles.ts` | 新建 | 1h | P0 |
| 建立 `constants/storage.ts` | 新建 | 1h | P0 |
| 建立 `constants/status.ts` | 新建 | 1h | P0 |
| 建立 `utils/storage.ts` | 新建 | 3h | P0 |
| 建立 `hooks/useAuthState.ts` | 新建 | 4h | P0 |
| 重構 `AuthGuard.tsx` | 修改 | 3h | P0 |
| 重構 `PasswordModal.tsx` | 修改 | 3h | P0 |
| 重構 `useAuth.ts` | 修改 | 3h | P0 |
| 建立單元測試 (hooks) | 新建 | 4h | P1 |

#### 交付物

```typescript
// constants/auth.ts
export const AUTH_CONFIG = {
  PIN_LENGTH: 4,
  EXPIRY_HOURS: 24,
  STORAGE_KEY: 'nuva_campus_auth',
} as const;

export const ROLES = {
  NUNU: 'nunu',
  AMBASSADOR: 'ambassador',
  GUARDIAN: 'guardian',
  GUARDIAN_ADMIN: 'guardian_admin',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
```

```typescript
// utils/storage.ts
export class AuthStorage {
  private static readonly KEY = AUTH_CONFIG.STORAGE_KEY;

  static get(): AuthState | null { ... }
  static set(state: AuthState): void { ... }
  static clear(): void { ... }
  static isExpired(role: Role): boolean { ... }
}
```

```typescript
// hooks/useAuthState.ts
export function useAuthState() {
  const [state, setState] = useState<AuthState | null>(null);

  // 統一的認證狀態管理
  const verifyRole = useCallback(async (role: Role, pin: string) => { ... }, []);
  const isRoleVerified = useCallback((role: Role) => { ... }, []);
  const clearRole = useCallback((role: Role) => { ... }, []);

  return { state, verifyRole, isRoleVerified, clearRole };
}
```

#### 驗收標準

- [ ] `getAuthState()` 只存在於一處
- [ ] 所有魔術字串移至常數檔案
- [ ] localStorage 存取統一使用 AuthStorage
- [ ] 認證相關 hooks 測試覆蓋率 > 80%

---

### 第二週: 快取層實作

#### 目標
- 實作多層快取策略
- 減少 Supabase 查詢 50%
- 優化 N+1 查詢

#### 架構設計

```
新的快取架構:
                     ┌─────────────────┐
                     │    Client       │
                     └────────┬────────┘
                              │
                     ┌────────▼────────┐
                     │   SWR Cache     │  L0: Client Memory
                     │   (30-90s TTL)  │
                     └────────┬────────┘
                              │
                     ┌────────▼────────┐
                     │  API Routes     │
                     └────────┬────────┘
                              │
                     ┌────────▼────────┐
                     │  LRU Cache      │  L1: Server Memory
                     │  (5min TTL)     │
                     └────────┬────────┘
                              │
                     ┌────────▼────────┐
                     │  Redis/Upstash  │  L2: Distributed
                     │  (15min TTL)    │
                     └────────┬────────┘
                              │
                     ┌────────▼────────┐
                     │    Supabase     │  L3: Database
                     └─────────────────┘
```

#### 任務清單

| 任務 | 檔案 | 預估工時 | 優先級 |
|------|------|----------|--------|
| 安裝 `@upstash/redis` | package.json | 0.5h | P0 |
| 建立 `lib/cache/index.ts` | 新建 | 2h | P0 |
| 建立 `lib/cache/lru.ts` | 新建 | 3h | P0 |
| 建立 `lib/cache/redis.ts` | 新建 | 3h | P0 |
| 建立 `lib/cache/strategies.ts` | 新建 | 4h | P0 |
| 重構 `services/events.service.ts` | 修改 | 4h | P0 |
| 重構 `services/registrations.service.ts` | 修改 | 4h | P0 |
| 重構 `services/workshops.service.ts` | 修改 | 3h | P0 |
| 優化 N+1 查詢 (JOIN) | services | 4h | P0 |
| 建立快取測試 | 新建 | 4h | P1 |

#### 交付物

```typescript
// lib/cache/strategies.ts
export const CACHE_STRATEGIES = {
  events: {
    ttl: { l1: 300, l2: 900 }, // 5min, 15min
    staleWhileRevalidate: true,
    tags: ['events'],
  },
  registrations: {
    ttl: { l1: 60, l2: 180 },  // 1min, 3min
    staleWhileRevalidate: true,
    tags: ['registrations'],
  },
  workshops: {
    ttl: { l1: 600, l2: 1800 }, // 10min, 30min
    staleWhileRevalidate: true,
    tags: ['workshops'],
  },
} as const;
```

```typescript
// lib/cache/index.ts
export class CacheManager {
  private lru: LRUCache;
  private redis: Redis;

  async get<T>(key: string, fetcher: () => Promise<T>, strategy: CacheStrategy): Promise<T> {
    // L1: Check LRU
    const l1Hit = this.lru.get(key);
    if (l1Hit) return l1Hit;

    // L2: Check Redis
    const l2Hit = await this.redis.get(key);
    if (l2Hit) {
      this.lru.set(key, l2Hit, strategy.ttl.l1);
      return l2Hit;
    }

    // L3: Fetch from Supabase
    const data = await fetcher();
    await this.set(key, data, strategy);
    return data;
  }
}
```

```typescript
// services/events.service.ts (優化後)
export class EventsService {
  private cache = new CacheManager();

  async getWithStats(id: string): Promise<EventWithStats> {
    return this.cache.get(
      `event:${id}:stats`,
      async () => {
        // 使用 JOIN 一次查詢
        const { data } = await supabase
          .from('events')
          .select(`
            *,
            registrations:event_registrations(count),
            attended:event_registrations(count).filter(attended.eq.true),
            lunch_collected:event_registrations(count).filter(lunch_collected.eq.true)
          `)
          .eq('id', id)
          .single();
        return data;
      },
      CACHE_STRATEGIES.events
    );
  }
}
```

#### 驗收標準

- [ ] Supabase 查詢減少 50%
- [ ] 頁面載入時間減少 30%
- [ ] 快取命中率 > 70%
- [ ] N+1 查詢完全消除

---

### 第三週: 元件重構與抽象

#### 目標
- 統一表單輸入邏輯
- 抽象可重用元件
- 減少元件層級複雜度

#### 任務清單

| 任務 | 檔案 | 預估工時 | 優先級 |
|------|------|----------|--------|
| 建立 `hooks/useKeyboardInput.ts` | 新建 | 4h | P0 |
| 重構 `CodeInput.tsx` | 修改 | 2h | P0 |
| 重構 `NumericKeypad.tsx` | 修改 | 2h | P0 |
| 建立 `components/ui/PinInput.tsx` | 新建 | 4h | P0 |
| 重構 `PasswordModal.tsx` 使用 PinInput | 修改 | 3h | P0 |
| 重構 `AuthGuard.tsx` 使用 PinInput | 修改 | 3h | P0 |
| 建立 `components/ui/DataTable.tsx` | 新建 | 6h | P1 |
| 建立 `components/ui/StatsCard.tsx` | 新建 | 3h | P1 |
| 重構 Guardian 頁面使用 DataTable | 修改 | 4h | P1 |
| 元件測試 | 新建 | 4h | P1 |

#### 交付物

```typescript
// hooks/useKeyboardInput.ts
interface UseKeyboardInputOptions {
  maxLength: number;
  allowedChars?: RegExp;
  onComplete?: (value: string) => void;
  onBackspace?: () => void;
}

export function useKeyboardInput(options: UseKeyboardInputOptions) {
  const [value, setValue] = useState('');

  const append = useCallback((char: string) => {
    if (value.length >= options.maxLength) return;
    if (options.allowedChars && !options.allowedChars.test(char)) return;

    const newValue = value + char;
    setValue(newValue);

    if (newValue.length === options.maxLength) {
      options.onComplete?.(newValue);
    }
  }, [value, options]);

  const backspace = useCallback(() => {
    setValue(prev => prev.slice(0, -1));
    options.onBackspace?.();
  }, [options]);

  const clear = useCallback(() => setValue(''), []);

  return { value, append, backspace, clear, isFull: value.length === options.maxLength };
}
```

```typescript
// components/ui/PinInput.tsx
interface PinInputProps {
  length?: number;
  onComplete: (pin: string) => void;
  error?: string;
  loading?: boolean;
  showKeypad?: boolean;
}

export function PinInput({
  length = 4,
  onComplete,
  error,
  loading,
  showKeypad = true
}: PinInputProps) {
  const { value, append, backspace, clear } = useKeyboardInput({
    maxLength: length,
    allowedChars: /^[0-9]$/,
    onComplete,
  });

  return (
    <div className="flex flex-col items-center gap-6">
      <PinDisplay value={value} length={length} error={error} />
      {showKeypad && (
        <Keypad
          onDigit={append}
          onBackspace={backspace}
          onClear={clear}
          disabled={loading}
        />
      )}
    </div>
  );
}
```

```typescript
// components/ui/DataTable.tsx
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  emptyState?: ReactNode;
  onRowClick?: (row: T) => void;
  pagination?: PaginationConfig;
  sorting?: SortingConfig;
}

export function DataTable<T>({ data, columns, ...props }: DataTableProps<T>) {
  // 統一的資料表格實作
}
```

#### 驗收標準

- [ ] PinInput 取代所有密碼輸入實作
- [ ] useKeyboardInput 統一鍵盤輸入邏輯
- [ ] 表單元件程式碼減少 40%
- [ ] DataTable 用於所有資料列表
- [ ] 元件測試覆蓋率 > 70%

---

### 第四週: 資料層重構與 Server Components

#### 目標
- 統一資料轉換邏輯
- 實作 Server Components
- 優化 SEO 和首次載入

#### 任務清單

| 任務 | 檔案 | 預估工時 | 優先級 |
|------|------|----------|--------|
| 建立 `transforms/event.ts` | 新建 | 3h | P0 |
| 建立 `transforms/workshop.ts` | 新建 | 2h | P0 |
| 建立 `transforms/registration.ts` | 新建 | 2h | P0 |
| 建立 `transforms/index.ts` | 新建 | 1h | P0 |
| 重構 AmbassadorPage 為 Server Component | 修改 | 4h | P0 |
| 重構 GuardianPage 為 Server Component | 修改 | 4h | P0 |
| 建立 `components/providers/QueryProvider.tsx` | 新建 | 3h | P1 |
| 重構 Nunu 頁面為混合架構 | 修改 | 4h | P1 |
| 建立 Loading UI (Suspense) | 新建 | 3h | P1 |
| 資料層測試 | 新建 | 4h | P1 |

#### 架構設計

```
Server Components 架構:
┌─────────────────────────────────────────┐
│           Server Component              │
│  ┌─────────────────────────────────┐   │
│  │   Data Fetching (Supabase)      │   │
│  │   + Cache (Redis)               │   │
│  └───────────────┬─────────────────┘   │
│                  │                      │
│  ┌───────────────▼─────────────────┐   │
│  │   Transform Layer               │   │
│  │   (Pure functions)              │   │
│  └───────────────┬─────────────────┘   │
│                  │                      │
│  ┌───────────────▼─────────────────┐   │
│  │   Presentational Components     │   │
│  │   (Client or Server)            │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
          │
          │ Props
          ▼
┌─────────────────────────────────────────┐
│         Client Component                │
│  ┌─────────────────────────────────┐   │
│  │   Interactive UI                │   │
│  │   (Click, Input, Animation)     │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

#### 交付物

```typescript
// transforms/event.ts
import type { Event, EventWithStats, EventDisplay } from '@/types';

export function transformEventForDisplay(event: EventWithStats): EventDisplay {
  return {
    id: event.id,
    title: event.title,
    date: formatEventDate(event.date),
    time: formatEventTime(event.start_time, event.end_time),
    location: event.location,
    stats: {
      registered: event.registration_count,
      attended: event.attended_count,
      attendanceRate: calculateAttendanceRate(event),
      lunchCollected: event.lunch_collected_count,
    },
    status: getEventStatus(event),
  };
}

export function transformEventsForList(events: EventWithStats[]): EventDisplay[] {
  return events.map(transformEventForDisplay);
}
```

```typescript
// app/guardian/page.tsx (Server Component)
import { eventsService } from '@/services';
import { transformEventsForList } from '@/transforms';
import { EventList } from './components/EventList';

export default async function GuardianPage() {
  const events = await eventsService.getAllWithStats();
  const displayEvents = transformEventsForList(events);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-medium">活動管理</h1>
      <Suspense fallback={<EventListSkeleton />}>
        <EventList events={displayEvents} />
      </Suspense>
    </div>
  );
}
```

#### 驗收標準

- [ ] 資料轉換邏輯集中在 transforms/
- [ ] 主要頁面使用 Server Components
- [ ] FCP 減少 40%
- [ ] 元件 Props 完全型別化
- [ ] Suspense boundaries 正確設置

---

### 第五週: 測試與品質保證

#### 目標
- 建立完整測試基礎設施
- 達到 60% 測試覆蓋率
- 實作 E2E 測試關鍵流程

#### 任務清單

| 任務 | 檔案 | 預估工時 | 優先級 |
|------|------|----------|--------|
| 安裝測試框架 (Vitest + RTL) | package.json | 2h | P0 |
| 安裝 Playwright (E2E) | package.json | 2h | P0 |
| 建立 `tests/setup.ts` | 新建 | 2h | P0 |
| 建立 `tests/mocks/supabase.ts` | 新建 | 3h | P0 |
| 單元測試: hooks | tests/hooks/ | 6h | P0 |
| 單元測試: services | tests/services/ | 6h | P0 |
| 單元測試: transforms | tests/transforms/ | 4h | P0 |
| 元件測試: ui/ | tests/components/ | 6h | P1 |
| E2E: 認證流程 | tests/e2e/auth.spec.ts | 4h | P1 |
| E2E: 報到流程 | tests/e2e/checkin.spec.ts | 4h | P1 |
| 設置 CI/CD 測試 | .github/workflows/ | 3h | P1 |

#### 測試架構

```
tests/
├── setup.ts                    # Vitest 設定
├── mocks/
│   ├── supabase.ts            # Supabase mock
│   ├── handlers.ts            # MSW handlers
│   └── data.ts                # 測試資料
├── unit/
│   ├── hooks/
│   │   ├── useAuthState.test.ts
│   │   ├── useKeyboardInput.test.ts
│   │   └── useAuth.test.ts
│   ├── services/
│   │   ├── events.service.test.ts
│   │   ├── registrations.service.test.ts
│   │   └── workshops.service.test.ts
│   └── transforms/
│       ├── event.test.ts
│       └── workshop.test.ts
├── components/
│   ├── PinInput.test.tsx
│   ├── DataTable.test.tsx
│   └── Modal.test.tsx
└── e2e/
    ├── auth.spec.ts
    ├── checkin.spec.ts
    └── dashboard.spec.ts
```

#### 交付物

```typescript
// tests/unit/hooks/useAuthState.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuthState } from '@/hooks/useAuthState';
import { mockSupabase } from '../mocks/supabase';

describe('useAuthState', () => {
  beforeEach(() => {
    localStorage.clear();
    mockSupabase.reset();
  });

  it('should return null state initially', () => {
    const { result } = renderHook(() => useAuthState());
    expect(result.current.state).toBeNull();
  });

  it('should verify role with correct PIN', async () => {
    mockSupabase.mockPasswordVerification('nunu', '1234', true);

    const { result } = renderHook(() => useAuthState());

    await act(async () => {
      await result.current.verifyRole('nunu', '1234');
    });

    expect(result.current.isRoleVerified('nunu')).toBe(true);
  });

  it('should reject incorrect PIN', async () => {
    mockSupabase.mockPasswordVerification('nunu', '1234', false);

    const { result } = renderHook(() => useAuthState());

    await act(async () => {
      await result.current.verifyRole('nunu', '0000');
    });

    expect(result.current.isRoleVerified('nunu')).toBe(false);
  });

  it('should handle expiry correctly', () => {
    // 設置過期的認證狀態
    const expiredState = {
      nunu: { verified: true, expiry: Date.now() - 1000 },
    };
    localStorage.setItem('nuva_campus_auth', JSON.stringify(expiredState));

    const { result } = renderHook(() => useAuthState());
    expect(result.current.isRoleVerified('nunu')).toBe(false);
  });
});
```

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should authenticate with correct PIN', async ({ page }) => {
    await page.goto('/');

    // 點擊 Nunu 角色
    await page.click('button:has-text("活動志工")');

    // 輸入 PIN
    await page.click('button:has-text("1")');
    await page.click('button:has-text("2")');
    await page.click('button:has-text("3")');
    await page.click('button:has-text("4")');

    // 應該導向 Nunu 頁面
    await expect(page).toHaveURL('/nunu');
  });

  test('should show error with incorrect PIN', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("活動志工")');

    // 輸入錯誤 PIN
    await page.click('button:has-text("0")');
    await page.click('button:has-text("0")');
    await page.click('button:has-text("0")');
    await page.click('button:has-text("0")');

    // 應該顯示錯誤訊息
    await expect(page.locator('text=密碼錯誤')).toBeVisible();
  });
});
```

#### 驗收標準

- [ ] Vitest + RTL 設置完成
- [ ] Playwright E2E 設置完成
- [ ] Hooks 測試覆蓋率 > 80%
- [ ] Services 測試覆蓋率 > 70%
- [ ] 整體測試覆蓋率 > 60%
- [ ] CI/CD 自動執行測試

---

### 第六週: 效能最佳化與文件

#### 目標
- 最終效能調優
- 完成文件撰寫
- 建立監控系統

#### 任務清單

| 任務 | 檔案 | 預估工時 | 優先級 |
|------|------|----------|--------|
| Bundle 分析與優化 | next.config.ts | 4h | P0 |
| 圖片最佳化 (next/image) | 多個檔案 | 3h | P0 |
| 字型最佳化 (next/font) | layout.tsx | 2h | P0 |
| 實作動態 import | 多個檔案 | 3h | P0 |
| 建立效能監控 (Vercel Analytics) | 新建 | 2h | P1 |
| 建立錯誤追蹤 (Sentry) | 新建 | 3h | P1 |
| 撰寫架構文件 | docs/architecture.md | 4h | P1 |
| 撰寫 API 文件 | docs/api.md | 3h | P1 |
| 撰寫元件文件 (Storybook) | 多個檔案 | 6h | P2 |
| 最終驗收與部署 | - | 4h | P0 |

#### 交付物

```typescript
// next.config.ts (效能最佳化)
import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js', 'lucide-react'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  headers: async () => [
    {
      source: '/:all*(svg|jpg|png)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
};

export default withBundleAnalyzer(nextConfig);
```

```typescript
// lib/monitoring/index.ts
import { Analytics } from '@vercel/analytics/react';
import * as Sentry from '@sentry/nextjs';

export function initMonitoring() {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
    });
  }
}

export function trackPerformance(metric: {
  name: string;
  value: number;
  path: string;
}) {
  // 發送到 Vercel Analytics
  if (typeof window !== 'undefined' && window.va) {
    window.va('track', metric.name, {
      value: metric.value,
      path: metric.path,
    });
  }
}
```

```markdown
// docs/architecture.md
# NUVA Campus 架構文件

## 目錄結構
...

## 資料流
...

## 快取策略
...

## 認證系統
...

## 元件架構
...
```

#### 驗收標準

- [ ] Bundle 大小 < 500 KB
- [ ] Lighthouse 分數 > 90
- [ ] Core Web Vitals 全部通過
- [ ] 監控系統上線
- [ ] 架構文件完成
- [ ] API 文件完成

---

## 5. 技術規格

### 5.1 新增依賴

```json
{
  "dependencies": {
    "@upstash/redis": "^1.28.0",
    "@vercel/analytics": "^1.2.0",
    "@sentry/nextjs": "^7.100.0"
  },
  "devDependencies": {
    "vitest": "^1.2.0",
    "@testing-library/react": "^14.2.0",
    "@testing-library/jest-dom": "^6.4.0",
    "@playwright/test": "^1.41.0",
    "msw": "^2.1.0",
    "@next/bundle-analyzer": "^14.1.0"
  }
}
```

### 5.2 新增檔案結構

```
app/
├── constants/
│   ├── auth.ts
│   ├── roles.ts
│   ├── storage.ts
│   └── status.ts
├── utils/
│   └── storage.ts
├── transforms/
│   ├── index.ts
│   ├── event.ts
│   ├── workshop.ts
│   └── registration.ts
├── lib/
│   ├── cache/
│   │   ├── index.ts
│   │   ├── lru.ts
│   │   ├── redis.ts
│   │   └── strategies.ts
│   └── monitoring/
│       └── index.ts
└── tests/
    ├── setup.ts
    ├── mocks/
    ├── unit/
    ├── components/
    └── e2e/

docs/
├── architecture.md
├── api.md
└── components/
```

### 5.3 環境變數

```env
# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Monitoring
SENTRY_DSN=
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=

# Feature Flags
ENABLE_CACHE_L2=true
ENABLE_MONITORING=true
```

### 5.4 資料庫優化

```sql
-- 新增索引
CREATE INDEX idx_event_registrations_event_id
ON event_registrations(event_id);

CREATE INDEX idx_event_registrations_attended
ON event_registrations(event_id, attended);

CREATE INDEX idx_events_date
ON events(date);

-- 新增 materialized view (統計)
CREATE MATERIALIZED VIEW event_stats AS
SELECT
  e.id,
  e.title,
  COUNT(r.id) as registration_count,
  COUNT(r.id) FILTER (WHERE r.attended = true) as attended_count,
  COUNT(r.id) FILTER (WHERE r.lunch_collected = true) as lunch_count
FROM events e
LEFT JOIN event_registrations r ON e.id = r.event_id
GROUP BY e.id, e.title;

-- 定期刷新
CREATE OR REPLACE FUNCTION refresh_event_stats()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY event_stats;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

---

## 6. 風險評估與緩解

### 6.1 技術風險

| 風險 | 機率 | 影響 | 緩解策略 |
|------|------|------|----------|
| Redis 連線不穩定 | 中 | 高 | 實作 fallback 到 LRU cache |
| Server Components 相容性問題 | 中 | 中 | 漸進式遷移，保留 Client Component 備案 |
| 測試框架學習曲線 | 低 | 中 | 提供詳細文件和範例 |
| Bundle 大小增加 | 低 | 低 | 使用 bundle analyzer 持續監控 |

### 6.2 進度風險

| 風險 | 機率 | 影響 | 緩解策略 |
|------|------|------|----------|
| 第一週延遲影響後續 | 中 | 高 | 認證重構可獨立進行 |
| 快取層實作複雜度超預期 | 中 | 高 | 優先實作 LRU，Redis 可延後 |
| 測試撰寫耗時超預期 | 高 | 中 | 優先覆蓋關鍵路徑 |

### 6.3 緩解措施

1. **每週檢查點** - 每週五進行進度檢查和風險評估
2. **平行開發** - 認證重構和快取層可平行進行
3. **功能開關** - 新功能使用 feature flags，可快速回退
4. **增量部署** - 每週部署一次，及早發現問題

---

## 7. 成功標準與驗收

### 7.1 每週驗收標準

| 週次 | 驗收標準 | 驗收方式 |
|------|----------|----------|
| Week 1 | 認證邏輯統一，常數檔案建立 | Code review + 測試通過 |
| Week 2 | 快取層上線，查詢減少 50% | 效能測試報告 |
| Week 3 | PinInput 統一，DataTable 完成 | Code review + 視覺驗收 |
| Week 4 | Server Components 上線，FCP 減少 40% | Lighthouse 報告 |
| Week 5 | 測試覆蓋率 60%，CI/CD 完成 | 測試報告 |
| Week 6 | 效能達標，文件完成，監控上線 | 最終驗收清單 |

### 7.2 最終驗收清單

#### 效能指標
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Supabase 查詢減少 50%
- [ ] Bundle 大小 < 500 KB

#### 代碼品質
- [ ] 代碼重複率 < 5%
- [ ] 測試覆蓋率 > 60%
- [ ] 型別覆蓋率 100%
- [ ] 無 TypeScript errors
- [ ] ESLint 無錯誤

#### 文件
- [ ] 架構文件完成
- [ ] API 文件完成
- [ ] 部署文件完成

#### 監控
- [ ] Sentry 錯誤追蹤上線
- [ ] Vercel Analytics 上線
- [ ] 效能監控 dashboard 建立

---

## 附錄

### A. 參考資料

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [SWR Documentation](https://swr.vercel.app/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)

### B. 相關文件

- `PRD_OPTIMIZATION.md` - 原始優化 PRD
- `PRD_UI_UX_OPTIMIZATION.md` - UI/UX 優化 PRD

### C. 變更日誌

| 日期 | 版本 | 變更內容 | 作者 |
|------|------|----------|------|
| 2026-01-30 | 1.0 | 初版 | Claude |

---

*此文件由 Claude Code 自動生成，基於對 NUVA Campus 專案的完整分析。*
