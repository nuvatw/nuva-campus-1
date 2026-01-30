# PRD Week 7: 資料快取與 Real-time 優化

**專案**: NUVA Campus 效能與 UI/UX 優化計畫
**週次**: 第 7 週 (共 10 週)
**負責人**: TBD
**預計交付日期**: TBD

---

## 1. 本週目標

優化資料快取策略，使用 Supabase Real-time 取代輪詢，實作 Optimistic Updates 提升使用者體驗。

---

## 2. 問題陳述

### 2.1 SWR 輪詢過於頻繁 (P2 - Medium)

**現況**:
- `/app/guardian/events/[id]/checkin/page.tsx:71` 設定 10 秒輪詢
- 即使沒有變化也持續請求 API
- 浪費頻寬和伺服器資源

**影響**:
- 不必要的網路請求
- 伺服器負載增加
- 電池消耗（行動裝置）

### 2.2 Real-time 訂閱未優化 (P2 - Medium)

**現況**:
- `/app/nunu/events/[id]/checkin/page.tsx:63-76` 每次收到變更都 fetchData()
- 沒有使用 Optimistic Update
- 使用者需等待伺服器回應才能看到變化

**影響**:
- 操作感覺遲緩
- 使用者體驗不佳
- 多餘的資料請求

### 2.3 LRU Cache 清理問題 (P2 - Medium)

**現況**:
- `/app/lib/cache/lru.ts:250-254` 使用 `setInterval` 清理
- Serverless 環境中 interval 可能無法正常運作
- 沒有手動清理機制

**影響**:
- 記憶體可能持續增長
- 快取可能無法正確失效
- Serverless 環境不穩定

---

## 3. 解決方案

### 3.1 Supabase Real-time 整合

#### 3.1.1 建立 Real-time Hook

建立 `/app/hooks/useRealtimeSubscription.ts`:

```typescript
'use client'

import { useEffect, useCallback, useRef } from 'react'
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface UseRealtimeOptions<T> {
  table: string
  schema?: string
  filter?: string
  onInsert?: (payload: T) => void
  onUpdate?: (payload: { old: T; new: T }) => void
  onDelete?: (payload: T) => void
  enabled?: boolean
}

export function useRealtimeSubscription<T extends Record<string, unknown>>({
  table,
  schema = 'public',
  filter,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}: UseRealtimeOptions<T>) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  // 使用 useCallback 包裝處理函數避免重新訂閱
  const handleChange = useCallback(
    (payload: RealtimePostgresChangesPayload<T>) => {
      switch (payload.eventType) {
        case 'INSERT':
          onInsert?.(payload.new as T)
          break
        case 'UPDATE':
          onUpdate?.({
            old: payload.old as T,
            new: payload.new as T,
          })
          break
        case 'DELETE':
          onDelete?.(payload.old as T)
          break
      }
    },
    [onInsert, onUpdate, onDelete]
  )

  useEffect(() => {
    if (!enabled) return

    const channelName = `${table}-${filter ?? 'all'}-${Date.now()}`

    channelRef.current = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema,
          table,
          filter,
        },
        handleChange
      )
      .subscribe()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [table, schema, filter, enabled, handleChange])

  return {
    channel: channelRef.current,
  }
}
```

#### 3.1.2 建立 Optimistic Update Hook

建立 `/app/hooks/useOptimisticMutation.ts`:

```typescript
'use client'

import { useState, useCallback } from 'react'
import { KeyedMutator } from 'swr'

interface UseOptimisticMutationOptions<T, R> {
  mutate: KeyedMutator<T[]>
  mutationFn: (data: R) => Promise<T>
  optimisticData: (currentData: T[] | undefined, newItem: R) => T[]
  rollbackOnError?: boolean
}

export function useOptimisticMutation<T, R>({
  mutate,
  mutationFn,
  optimisticData,
  rollbackOnError = true,
}: UseOptimisticMutationOptions<T, R>) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(
    async (data: R) => {
      setIsPending(true)
      setError(null)

      // 樂觀更新
      const previousData = await mutate(
        (currentData) => optimisticData(currentData, data),
        { revalidate: false }
      )

      try {
        const result = await mutationFn(data)

        // 成功後用真實資料更新
        await mutate((currentData) => {
          if (!currentData) return [result]
          return currentData.map((item) =>
            (item as any).id === (result as any).id ? result : item
          )
        }, { revalidate: false })

        return { success: true, data: result }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)

        // 失敗時回滾
        if (rollbackOnError && previousData !== undefined) {
          await mutate(previousData, { revalidate: false })
        }

        return { success: false, error }
      } finally {
        setIsPending(false)
      }
    },
    [mutate, mutationFn, optimisticData, rollbackOnError]
  )

  return {
    execute,
    isPending,
    error,
  }
}
```

### 3.2 Check-in 頁面重構

修改 `/app/guardian/events/[id]/checkin/page.tsx`:

```typescript
'use client'

import { useState, useCallback } from 'react'
import useSWR from 'swr'
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription'
import { useOptimisticMutation } from '@/hooks/useOptimisticMutation'
import { fetchRegistrations, checkInRegistration } from '@/services/events'
import type { Registration } from '@/types/event'

interface CheckinPageProps {
  params: { id: string }
}

export default function CheckinPage({ params }: CheckinPageProps) {
  const { id: eventId } = params

  // SWR 資料獲取（禁用輪詢）
  const {
    data: registrations,
    mutate,
    isLoading,
  } = useSWR(
    `registrations-${eventId}`,
    () => fetchRegistrations(eventId),
    {
      refreshInterval: 0, // 禁用輪詢
      revalidateOnFocus: false,
    }
  )

  // Real-time 訂閱
  useRealtimeSubscription<Registration>({
    table: 'event_registrations',
    filter: `event_id=eq.${eventId}`,
    onInsert: (newReg) => {
      mutate((current) => current ? [...current, newReg] : [newReg], {
        revalidate: false,
      })
    },
    onUpdate: ({ new: updatedReg }) => {
      mutate(
        (current) =>
          current?.map((reg) =>
            reg.id === updatedReg.id ? updatedReg : reg
          ),
        { revalidate: false }
      )
    },
    onDelete: (deletedReg) => {
      mutate(
        (current) => current?.filter((reg) => reg.id !== deletedReg.id),
        { revalidate: false }
      )
    },
  })

  // Optimistic Check-in
  const { execute: performCheckIn, isPending } = useOptimisticMutation({
    mutate,
    mutationFn: (regId: string) => checkInRegistration(eventId, regId),
    optimisticData: (current, regId) =>
      current?.map((reg) =>
        reg.id === regId
          ? { ...reg, checked_in: true, checked_in_at: new Date().toISOString() }
          : reg
      ) ?? [],
  })

  const handleCheckIn = useCallback(
    async (registrationId: string) => {
      const result = await performCheckIn(registrationId)
      if (!result.success) {
        // 顯示錯誤通知
        console.error('Check-in failed:', result.error)
      }
    },
    [performCheckIn]
  )

  // 統計資料（從本地計算，不另外請求）
  const stats = registrations
    ? {
        total: registrations.length,
        checkedIn: registrations.filter((r) => r.checked_in).length,
      }
    : { total: 0, checkedIn: 0 }

  return (
    <div className="p-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-sm text-gray-500">總報名人數</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-sm text-gray-500">已報到</p>
          <p className="text-3xl font-bold text-green-600">
            {stats.checkedIn}
          </p>
        </div>
      </div>

      {/* Registrations List */}
      <RegistrationsList
        registrations={registrations ?? []}
        isLoading={isLoading}
        onCheckIn={handleCheckIn}
        isPending={isPending}
      />
    </div>
  )
}
```

### 3.3 快取策略優化

#### 3.3.1 重構 LRU Cache

修改 `/app/lib/cache/lru.ts`:

```typescript
interface CacheEntry<T> {
  value: T
  expiresAt: number
  tags: Set<string>
}

export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>
  private maxSize: number
  private defaultTTL: number

  constructor(maxSize: number = 100, defaultTTL: number = 5 * 60 * 1000) {
    this.cache = new Map()
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key)

    if (!entry) return undefined

    // 檢查是否過期
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return undefined
    }

    // 更新 LRU 順序（移到最後）
    this.cache.delete(key)
    this.cache.set(key, entry)

    return entry.value
  }

  set(key: string, value: T, options?: { ttl?: number; tags?: string[] }): void {
    const ttl = options?.ttl ?? this.defaultTTL
    const tags = new Set(options?.tags ?? [])

    // 如果已滿，刪除最舊的項目
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
      tags,
    })
  }

  invalidate(key: string): boolean {
    return this.cache.delete(key)
  }

  invalidateByTag(tag: string): number {
    let count = 0
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.has(tag)) {
        this.cache.delete(key)
        count++
      }
    }
    return count
  }

  invalidateByPrefix(prefix: string): number {
    let count = 0
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key)
        count++
      }
    }
    return count
  }

  // 手動清理過期項目（用於 API 請求時順便清理）
  cleanup(): number {
    const now = Date.now()
    let count = 0
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
        count++
      }
    }
    return count
  }

  clear(): void {
    this.cache.clear()
  }

  get size(): number {
    return this.cache.size
  }
}

// 全域快取實例
export const globalCache = new LRUCache(200, 5 * 60 * 1000)
```

#### 3.3.2 建立快取 Wrapper

建立 `/app/lib/cache/cached.ts`:

```typescript
import { globalCache } from './lru'
import { Result, ok, err, ApiError } from '@/types/result'

interface CacheOptions {
  ttl?: number
  tags?: string[]
  staleWhileRevalidate?: boolean
}

export async function cached<T>(
  key: string,
  fetcher: () => Promise<Result<T, ApiError>>,
  options?: CacheOptions
): Promise<Result<T, ApiError>> {
  // 嘗試從快取取得
  const cachedValue = globalCache.get(key) as T | undefined

  if (cachedValue !== undefined) {
    // Stale-while-revalidate: 返回快取並在背景更新
    if (options?.staleWhileRevalidate) {
      fetcher().then((result) => {
        if (result.success) {
          globalCache.set(key, result.data, options)
        }
      })
    }
    return ok(cachedValue)
  }

  // 順便清理過期快取
  globalCache.cleanup()

  // 獲取新資料
  const result = await fetcher()

  if (result.success) {
    globalCache.set(key, result.data, options)
  }

  return result
}

// 使用範例
export async function getCachedEvents(): Promise<Result<Event[], ApiError>> {
  return cached(
    'events:list',
    () => fetchEvents(),
    { ttl: 60000, tags: ['events'] }
  )
}
```

### 3.4 SWR 全域配置

建立 `/app/lib/swr-config.ts`:

```typescript
import { SWRConfiguration } from 'swr'

export const swrConfig: SWRConfiguration = {
  // 錯誤重試
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    // 404 不重試
    if (error.status === 404) return

    // 最多重試 3 次
    if (retryCount >= 3) return

    // 指數退避
    setTimeout(() => revalidate({ retryCount }), Math.pow(2, retryCount) * 1000)
  },

  // 預設不自動重新驗證
  revalidateOnFocus: false,
  revalidateOnReconnect: true,

  // 錯誤邊界
  suspense: false,

  // 快取保持時間
  dedupingInterval: 2000,
}
```

更新 `/app/components/Providers.tsx`:

```typescript
'use client'

import { SWRConfig } from 'swr'
import { swrConfig } from '@/lib/swr-config'
import { ToastProvider } from '@/components/toast/ToastProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={swrConfig}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </SWRConfig>
  )
}
```

---

## 4. 技術規格

### 4.1 Real-time 訂閱策略

| 頁面 | 訂閱表格 | Filter | 事件 |
|------|----------|--------|------|
| Check-in | event_registrations | event_id=eq.{id} | INSERT, UPDATE |
| Dashboard | events | - | UPDATE, DELETE |
| Stats | event_registrations | event_id=eq.{id} | * |

### 4.2 快取 TTL 策略

| 資料類型 | TTL | 原因 |
|----------|-----|------|
| 活動列表 | 60s | 較少變動 |
| 報名資料 | 30s | 需要即時性 |
| 統計資料 | 10s | 常變動 |
| 使用者資料 | 5min | 很少變動 |

### 4.3 Optimistic Update 流程

```
使用者操作
    ↓
樂觀更新 UI
    ↓
發送 API 請求
    ↓
成功 → 用實際資料更新
失敗 → 回滾到之前狀態
```

---

## 5. 驗收標準

### 5.1 Real-time 驗收

- [ ] Check-in 頁面使用 Real-time 訂閱
- [ ] 多個使用者同時操作時資料同步
- [ ] 訂閱在離開頁面時正確清理
- [ ] 網路斷線時有適當處理

### 5.2 Optimistic Update 驗收

- [ ] 報到操作立即反映在 UI
- [ ] API 失敗時正確回滾
- [ ] 有適當的錯誤提示
- [ ] Loading 狀態正確顯示

### 5.3 快取驗收

- [ ] 快取命中時不發送 API 請求
- [ ] 快取過期後正確重新獲取
- [ ] 標籤失效功能正常
- [ ] 記憶體使用穩定

---

## 6. 交付清單

- [ ] `/app/hooks/useRealtimeSubscription.ts` - 新增
- [ ] `/app/hooks/useOptimisticMutation.ts` - 新增
- [ ] `/app/guardian/events/[id]/checkin/page.tsx` - 重構
- [ ] `/app/nunu/events/[id]/checkin/page.tsx` - 重構
- [ ] `/app/lib/cache/lru.ts` - 重構
- [ ] `/app/lib/cache/cached.ts` - 新增
- [ ] `/app/lib/swr-config.ts` - 新增
- [ ] `/app/components/Providers.tsx` - 更新

---

## 7. 成功指標

| 指標 | 目標值 | 測量方式 |
|------|--------|----------|
| API 請求數量 | 減少 60%+ | 監控 |
| 操作響應時間 | < 100ms (感知) | 使用者測試 |
| 資料同步延遲 | < 1s | 測試 |
| 記憶體使用 | 穩定 | 監控 |

---

*下一週預告: 程式碼品質與型別統一*
