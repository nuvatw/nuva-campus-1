# PRD Week 5: 錯誤處理與 Loading 狀態優化

**專案**: NUVA Campus 效能與 UI/UX 優化計畫
**週次**: 第 5 週 (共 10 週)
**負責人**: TBD
**預計交付日期**: TBD

---

## 1. 本週目標

建立統一的錯誤處理機制，優化 Loading 狀態，提升使用者體驗的一致性與可靠性。

---

## 2. 問題陳述

### 2.1 服務層錯誤處理不一致 (P1 - High)

**現況**:
- 服務檔案只 `console.error` 並返回空值/空陣列
- UI 無法區分「無資料」和「發生錯誤」
- 使用者看不到有意義的錯誤訊息

**範例**:
```typescript
// 當前實作
export async function fetchEvents(): Promise<Event[]> {
  const { data, error } = await supabase.from('events').select('*')
  if (error) {
    console.error(error)
    return [] // 無法區分錯誤和空資料
  }
  return data
}
```

**影響**:
- 使用者困惑（為什麼沒有資料？）
- 無法進行錯誤追蹤
- 無法提供重試機制

### 2.2 AuthGuard 初始載入空白 (P1 - High)

**現況**:
- `/app/components/AuthGuard.tsx:68-70` 當 `isVerified === null` 時返回 `null`
- 頁面出現短暫空白

**影響**:
- 使用者可能認為頁面壞了
- CLS 增加
- 使用者體驗不佳

### 2.3 缺少全域 Error Boundary (P2 - Medium)

**現況**:
- 沒有 `/app/error.tsx`
- 未捕獲的錯誤會導致白屏
- 無法優雅地恢復

**影響**:
- 單一組件錯誤可能導致整個頁面崩潰
- 無法提供重試機制
- 使用者體驗極差

---

## 3. 解決方案

### 3.1 統一錯誤處理架構

#### 3.1.1 定義 Result 型別

建立 `/app/types/result.ts`:

```typescript
/**
 * 統一的操作結果型別
 * 參考 Rust 的 Result 模式
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

/**
 * API 錯誤型別
 */
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
  statusCode?: number
}

/**
 * 常見錯誤碼
 */
export const ErrorCodes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN',
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

/**
 * 建立 API 錯誤
 */
export function createApiError(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>
): ApiError {
  return { code, message, details }
}

/**
 * 成功結果
 */
export function ok<T>(data: T): Result<T, never> {
  return { success: true, data }
}

/**
 * 失敗結果
 */
export function err<E>(error: E): Result<never, E> {
  return { success: false, error }
}
```

#### 3.1.2 重構服務層

修改 `/app/services/events.ts`:

```typescript
import { createServerClient } from '@/lib/supabase-server'
import { Result, ok, err, createApiError, ErrorCodes, ApiError } from '@/types/result'
import type { Event } from '@/types/event'

export async function fetchEvents(): Promise<Result<Event[], ApiError>> {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[fetchEvents] Supabase error:', error)
      return err(createApiError(
        ErrorCodes.SERVER_ERROR,
        '無法載入活動資料',
        { originalError: error.message }
      ))
    }

    return ok(data ?? [])
  } catch (error) {
    console.error('[fetchEvents] Unexpected error:', error)
    return err(createApiError(
      ErrorCodes.NETWORK_ERROR,
      '網路連線錯誤，請稍後再試'
    ))
  }
}

export async function fetchEventById(id: string): Promise<Result<Event, ApiError>> {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return err(createApiError(
          ErrorCodes.NOT_FOUND,
          '找不到該活動'
        ))
      }
      return err(createApiError(
        ErrorCodes.SERVER_ERROR,
        '無法載入活動資料'
      ))
    }

    return ok(data)
  } catch (error) {
    return err(createApiError(
      ErrorCodes.NETWORK_ERROR,
      '網路連線錯誤'
    ))
  }
}
```

#### 3.1.3 UI 層錯誤處理

建立 `/app/components/ui/ErrorDisplay.tsx`:

```typescript
'use client'

import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react'
import { Button } from './Button'
import type { ApiError } from '@/types/result'
import { ErrorCodes } from '@/types/result'

interface ErrorDisplayProps {
  error: ApiError
  onRetry?: () => void
  className?: string
}

export function ErrorDisplay({ error, onRetry, className }: ErrorDisplayProps) {
  const { icon: Icon, title } = getErrorMeta(error.code)

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
      role="alert"
    >
      <Icon className="w-12 h-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4 max-w-md">{error.message}</p>

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="secondary"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          重試
        </Button>
      )}
    </div>
  )
}

function getErrorMeta(code: string) {
  switch (code) {
    case ErrorCodes.NETWORK_ERROR:
      return { icon: WifiOff, title: '網路連線錯誤' }
    case ErrorCodes.NOT_FOUND:
      return { icon: AlertCircle, title: '找不到資料' }
    case ErrorCodes.UNAUTHORIZED:
      return { icon: AlertCircle, title: '權限不足' }
    default:
      return { icon: AlertCircle, title: '發生錯誤' }
  }
}
```

### 3.2 全域 Error Boundary

#### 3.2.1 建立全域 Error 頁面

建立 `/app/error.tsx`:

```typescript
'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 記錄錯誤到監控服務
    console.error('Global error boundary caught:', error)
    // 未來可整合 Sentry 等服務
    // captureException(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          發生錯誤
        </h1>

        <p className="text-gray-500 mb-6">
          很抱歉，頁面發生了一些問題。請嘗試重新載入或返回首頁。
        </p>

        {process.env.NODE_ENV === 'development' && (
          <pre className="bg-red-50 border border-red-200 rounded-lg p-4 text-left text-sm text-red-700 mb-6 overflow-auto max-h-48">
            {error.message}
            {error.stack && (
              <>
                {'\n\n'}
                {error.stack}
              </>
            )}
          </pre>
        )}

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
      </div>
    </div>
  )
}
```

#### 3.2.2 建立 Not Found 頁面

建立 `/app/not-found.tsx`:

```typescript
import Link from 'next/link'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <FileQuestion className="w-20 h-20 text-gray-300 mx-auto mb-6" />

        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          404
        </h1>

        <h2 className="text-xl font-medium text-gray-700 mb-4">
          找不到頁面
        </h2>

        <p className="text-gray-500 mb-8">
          您要找的頁面不存在或已被移除。
        </p>

        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link href="/" className="gap-2">
              <Home className="w-4 h-4" />
              返回首頁
            </Link>
          </Button>

          <Button variant="secondary" onClick={() => history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回上一頁
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### 3.3 Loading 狀態優化

#### 3.3.1 AuthGuard Skeleton

修改 `/app/components/AuthGuard.tsx`:

```typescript
'use client'

import { useAuth } from '@/hooks/useAuth'
import { AuthGuardSkeleton } from './AuthGuardSkeleton'

interface AuthGuardProps {
  children: React.ReactNode
  role: string
  fallback?: React.ReactNode
}

export function AuthGuard({ children, role, fallback }: AuthGuardProps) {
  const { isVerified, isLoading } = useAuth(role)

  // 載入中顯示 Skeleton
  if (isLoading) {
    return fallback ?? <AuthGuardSkeleton />
  }

  // 未驗證顯示登入表單
  if (!isVerified) {
    return <LoginForm role={role} />
  }

  return <>{children}</>
}
```

建立 `/app/components/AuthGuardSkeleton.tsx`:

```typescript
import { Skeleton } from '@/components/ui/Skeleton'

export function AuthGuardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

#### 3.3.2 優化全域 Loading

修改 `/app/loading.tsx`:

```typescript
import { Logo } from '@/components/Logo'

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      {/* 品牌 Logo */}
      <Logo className="w-16 h-16 mb-6 animate-pulse" />

      {/* 載入動畫 */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>

      <p className="mt-4 text-sm text-gray-500">
        載入中...
      </p>
    </div>
  )
}
```

### 3.4 SWR 錯誤處理整合

建立 `/app/hooks/useData.ts`:

```typescript
import useSWR, { SWRConfiguration } from 'swr'
import { ApiError, Result } from '@/types/result'

interface UseDataOptions<T> extends SWRConfiguration {
  fallbackData?: T
}

interface UseDataReturn<T> {
  data: T | undefined
  error: ApiError | undefined
  isLoading: boolean
  isValidating: boolean
  mutate: () => void
}

export function useData<T>(
  key: string | null,
  fetcher: () => Promise<Result<T, ApiError>>,
  options?: UseDataOptions<T>
): UseDataReturn<T> {
  const { data: result, error: swrError, isLoading, isValidating, mutate } = useSWR(
    key,
    async () => {
      const result = await fetcher()
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    {
      ...options,
      fallbackData: options?.fallbackData,
    }
  )

  return {
    data: result,
    error: swrError as ApiError | undefined,
    isLoading,
    isValidating,
    mutate,
  }
}
```

---

## 4. 技術規格

### 4.1 錯誤型別層級

```
Result<T, E>
├── success: true  → data: T
└── success: false → error: ApiError
                          ├── code: ErrorCode
                          ├── message: string
                          └── details?: object
```

### 4.2 錯誤代碼對應

| 錯誤碼 | HTTP Status | 使用者訊息 |
|--------|-------------|------------|
| NETWORK_ERROR | - | 網路連線錯誤 |
| NOT_FOUND | 404 | 找不到資料 |
| UNAUTHORIZED | 401/403 | 權限不足 |
| VALIDATION_ERROR | 400 | 資料格式錯誤 |
| SERVER_ERROR | 500 | 伺服器錯誤 |

### 4.3 Loading 狀態設計

| 情境 | 顯示內容 | 持續時間 |
|------|----------|----------|
| 頁面導航 | 全域 Loading + Logo | < 3s |
| 認證檢查 | AuthGuardSkeleton | < 1s |
| 資料載入 | 內容 Skeleton | 依資料量 |
| 按鈕操作 | Button Loading State | 依操作 |

---

## 5. 驗收標準

### 5.1 錯誤處理驗收

- [ ] 所有服務函數返回 Result 型別
- [ ] UI 能區分「無資料」和「錯誤」狀態
- [ ] 錯誤有對應的使用者友善訊息
- [ ] 有重試機制

### 5.2 Error Boundary 驗收

- [ ] `/app/error.tsx` 捕獲所有未處理錯誤
- [ ] `/app/not-found.tsx` 處理 404
- [ ] 開發模式顯示錯誤詳情
- [ ] 生產模式只顯示友善訊息

### 5.3 Loading 狀態驗收

- [ ] AuthGuard 載入時顯示 Skeleton
- [ ] 全域 Loading 有品牌元素
- [ ] 無空白閃爍 (CLS < 0.1)
- [ ] Loading 狀態時間合理 (< 3s)

---

## 6. 交付清單

- [ ] `/app/types/result.ts` - 新增
- [ ] `/app/components/ui/ErrorDisplay.tsx` - 新增
- [ ] `/app/error.tsx` - 新增
- [ ] `/app/not-found.tsx` - 新增
- [ ] `/app/components/AuthGuard.tsx` - 修改
- [ ] `/app/components/AuthGuardSkeleton.tsx` - 新增
- [ ] `/app/loading.tsx` - 修改
- [ ] `/app/hooks/useData.ts` - 新增
- [ ] `/app/services/*.ts` - 重構

---

## 7. 成功指標

| 指標 | 目標值 | 測量方式 |
|------|--------|----------|
| 錯誤訊息覆蓋率 | 100% | 程式碼審查 |
| CLS | < 0.1 | Web Vitals |
| 使用者錯誤回報 | 減少 50% | 客服紀錄 |
| 重試成功率 | > 80% | 應用監控 |

---

*下一週預告: 表單驗證與使用者回饋優化*
