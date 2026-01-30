# PRD Week 8: 程式碼品質與型別統一

**專案**: NUVA Campus 效能與 UI/UX 優化計畫
**週次**: 第 8 週 (共 10 週)
**負責人**: TBD
**預計交付日期**: TBD

---

## 1. 本週目標

統一型別定義、重構服務層、建立程式碼品質標準與自動化檢查。

---

## 2. 問題陳述

### 2.1 型別定義不一致 (P2 - Medium)

**現況**:
- 相同資料結構在不同檔案有不同定義
- `Registration` 在 service 和 page 中定義不同
- 部分地方使用 `any` 型別

**範例**:
```typescript
// services/events.ts
interface Registration {
  id: string
  name: string
  email: string
}

// pages/checkin/page.tsx
interface Registration {
  id: string
  userName: string  // 不同欄位名
  userEmail: string
  eventId: string   // 多了欄位
}
```

**影響**:
- 維護困難
- 型別檢查無法發揮作用
- 容易出現 runtime 錯誤

### 2.2 重複的 Fetcher 函數 (P2 - Medium)

**現況**:
- `fetchStats`、`fetchEvents` 等函數在多個頁面重複定義
- 相似邏輯沒有抽象
- 錯誤處理不一致

**影響**:
- 程式碼重複
- 修改時需要改多個地方
- 增加維護成本

### 2.3 組件檔案過大 (P3 - Low)

**現況**:
- `/app/guardian/dashboard/page.tsx` 包含多個內聯組件
- `/app/constants/roles.ts` 同時定義常數、型別和函數

**影響**:
- 可讀性差
- 測試困難
- 重用性低

---

## 3. 解決方案

### 3.1 建立統一型別系統

#### 3.1.1 型別目錄結構

```
/app/types/
├── index.ts              # 統一匯出
├── event.ts              # 活動相關型別
├── registration.ts       # 報名相關型別
├── user.ts               # 使用者相關型別
├── workshop.ts           # 工作坊型別
├── api.ts                # API 回應型別
└── common.ts             # 通用型別
```

#### 3.1.2 活動型別定義

建立 `/app/types/event.ts`:

```typescript
/**
 * 活動狀態
 */
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed'

/**
 * 活動類型
 */
export type EventType = 'workshop' | 'seminar' | 'social' | 'other'

/**
 * 活動基礎資訊
 */
export interface EventBase {
  id: string
  title: string
  description: string
  type: EventType
  status: EventStatus
  location: string
  capacity: number
  imageUrl?: string
}

/**
 * 活動時間資訊
 */
export interface EventTiming {
  startDate: string
  endDate: string
  registrationDeadline?: string
}

/**
 * 活動統計資訊
 */
export interface EventStats {
  registrationCount: number
  checkedInCount: number
  waitlistCount: number
}

/**
 * 完整活動資料（資料庫回傳）
 */
export interface Event extends EventBase, EventTiming {
  createdAt: string
  updatedAt: string
  createdBy: string
}

/**
 * 活動列表項目（含統計）
 */
export interface EventWithStats extends Event {
  stats: EventStats
}

/**
 * 建立活動請求
 */
export interface CreateEventRequest extends Omit<EventBase, 'id' | 'status'>, EventTiming {}

/**
 * 更新活動請求
 */
export interface UpdateEventRequest extends Partial<CreateEventRequest> {}
```

#### 3.1.3 報名型別定義

建立 `/app/types/registration.ts`:

```typescript
import type { Event } from './event'

/**
 * 報名狀態
 */
export type RegistrationStatus = 'confirmed' | 'waitlisted' | 'cancelled'

/**
 * 報名基礎資訊
 */
export interface RegistrationBase {
  id: string
  eventId: string
  userId?: string
  status: RegistrationStatus
}

/**
 * 報名者資訊
 */
export interface RegistrantInfo {
  name: string
  email: string
  phone?: string
  university?: string
  department?: string
}

/**
 * 報到資訊
 */
export interface CheckInInfo {
  checkedIn: boolean
  checkedInAt?: string
  checkedInBy?: string
}

/**
 * 完整報名資料
 */
export interface Registration extends RegistrationBase, RegistrantInfo, CheckInInfo {
  createdAt: string
  updatedAt: string
  notes?: string
}

/**
 * 報名列表項目（含活動資訊）
 */
export interface RegistrationWithEvent extends Registration {
  event: Pick<Event, 'id' | 'title' | 'startDate' | 'location'>
}

/**
 * 建立報名請求
 */
export interface CreateRegistrationRequest extends RegistrantInfo {
  eventId: string
}

/**
 * 報到請求
 */
export interface CheckInRequest {
  registrationId: string
  notes?: string
}
```

#### 3.1.4 統一匯出

建立 `/app/types/index.ts`:

```typescript
// 活動
export type {
  Event,
  EventBase,
  EventStatus,
  EventType,
  EventTiming,
  EventStats,
  EventWithStats,
  CreateEventRequest,
  UpdateEventRequest,
} from './event'

// 報名
export type {
  Registration,
  RegistrationBase,
  RegistrationStatus,
  RegistrantInfo,
  CheckInInfo,
  RegistrationWithEvent,
  CreateRegistrationRequest,
  CheckInRequest,
} from './registration'

// 使用者
export type {
  User,
  UserRole,
  AuthState,
} from './user'

// API
export type {
  ApiResponse,
  PaginatedResponse,
  ApiError,
} from './api'

// 通用
export type {
  ID,
  Timestamps,
  SortOrder,
  PaginationParams,
} from './common'
```

### 3.2 服務層重構

#### 3.2.1 建立基礎服務

建立 `/app/services/base.ts`:

```typescript
import { createServerClient } from '@/lib/supabase-server'
import { Result, ok, err, createApiError, ErrorCodes, ApiError } from '@/types/result'

export abstract class BaseService {
  protected supabase = createServerClient()

  protected handleError(error: unknown, context: string): ApiError {
    console.error(`[${context}] Error:`, error)

    if (error && typeof error === 'object' && 'code' in error) {
      const pgError = error as { code: string; message: string }

      switch (pgError.code) {
        case 'PGRST116':
          return createApiError(ErrorCodes.NOT_FOUND, '找不到資料')
        case '23505':
          return createApiError(ErrorCodes.VALIDATION_ERROR, '資料已存在')
        case '42501':
          return createApiError(ErrorCodes.UNAUTHORIZED, '權限不足')
        default:
          return createApiError(ErrorCodes.SERVER_ERROR, '伺服器錯誤')
      }
    }

    if (error instanceof Error) {
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return createApiError(ErrorCodes.NETWORK_ERROR, '網路連線錯誤')
      }
    }

    return createApiError(ErrorCodes.UNKNOWN, '發生未知錯誤')
  }

  protected async query<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    context: string
  ): Promise<Result<T, ApiError>> {
    try {
      const { data, error } = await queryFn()

      if (error) {
        return err(this.handleError(error, context))
      }

      if (data === null) {
        return err(createApiError(ErrorCodes.NOT_FOUND, '找不到資料'))
      }

      return ok(data)
    } catch (error) {
      return err(this.handleError(error, context))
    }
  }
}
```

#### 3.2.2 重構活動服務

修改 `/app/services/events.ts`:

```typescript
import { BaseService } from './base'
import { Result, ok, err, ApiError } from '@/types/result'
import type {
  Event,
  EventWithStats,
  CreateEventRequest,
  UpdateEventRequest,
} from '@/types'

class EventService extends BaseService {
  async list(): Promise<Result<Event[], ApiError>> {
    return this.query(
      () =>
        this.supabase
          .from('events')
          .select('*')
          .order('start_date', { ascending: false }),
      'EventService.list'
    )
  }

  async getById(id: string): Promise<Result<Event, ApiError>> {
    return this.query(
      () =>
        this.supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single(),
      'EventService.getById'
    )
  }

  async getWithStats(id: string): Promise<Result<EventWithStats, ApiError>> {
    const eventResult = await this.getById(id)
    if (!eventResult.success) return eventResult

    const statsResult = await this.query(
      () =>
        this.supabase
          .from('event_registrations')
          .select('id, checked_in, status')
          .eq('event_id', id),
      'EventService.getWithStats'
    )

    if (!statsResult.success) return statsResult

    const registrations = statsResult.data as any[]
    const stats = {
      registrationCount: registrations.length,
      checkedInCount: registrations.filter((r) => r.checked_in).length,
      waitlistCount: registrations.filter((r) => r.status === 'waitlisted').length,
    }

    return ok({ ...eventResult.data, stats })
  }

  async create(data: CreateEventRequest): Promise<Result<Event, ApiError>> {
    return this.query(
      () =>
        this.supabase
          .from('events')
          .insert(this.transformToDb(data))
          .select()
          .single(),
      'EventService.create'
    )
  }

  async update(id: string, data: UpdateEventRequest): Promise<Result<Event, ApiError>> {
    return this.query(
      () =>
        this.supabase
          .from('events')
          .update(this.transformToDb(data))
          .eq('id', id)
          .select()
          .single(),
      'EventService.update'
    )
  }

  async delete(id: string): Promise<Result<void, ApiError>> {
    const result = await this.query(
      () => this.supabase.from('events').delete().eq('id', id),
      'EventService.delete'
    )

    if (!result.success) return result
    return ok(undefined)
  }

  private transformToDb(data: Partial<CreateEventRequest>) {
    return {
      title: data.title,
      description: data.description,
      type: data.type,
      location: data.location,
      capacity: data.capacity,
      image_url: data.imageUrl,
      start_date: data.startDate,
      end_date: data.endDate,
      registration_deadline: data.registrationDeadline,
    }
  }
}

// 匯出單例
export const eventService = new EventService()

// 向後相容的函數匯出
export const fetchEvents = () => eventService.list()
export const fetchEventById = (id: string) => eventService.getById(id)
export const createEvent = (data: CreateEventRequest) => eventService.create(data)
export const updateEvent = (id: string, data: UpdateEventRequest) =>
  eventService.update(id, data)
export const deleteEvent = (id: string) => eventService.delete(id)
```

### 3.3 ESLint 和 Prettier 配置

#### 3.3.1 更新 ESLint 配置

建立 `/eslint.config.js`:

```javascript
import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import importPlugin from 'eslint-plugin-import'

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      'react': react,
      'react-hooks': reactHooks,
      'import': importPlugin,
    },
    rules: {
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // React
      'react/jsx-no-leaked-render': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Import
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'type',
          ],
          'newlines-between': 'never',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': 'error',

      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
]
```

#### 3.3.2 Prettier 配置

建立 `/prettier.config.js`:

```javascript
export default {
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 100,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindFunctions: ['cn', 'clsx'],
}
```

#### 3.3.3 更新 package.json scripts

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,json,md}\"",
    "typecheck": "tsc --noEmit",
    "validate": "npm run typecheck && npm run lint && npm run format:check"
  }
}
```

### 3.4 資料轉換層

#### 3.4.1 建立 Transform 函數

建立 `/app/transforms/event.ts`:

```typescript
import type { Event } from '@/types'

interface DbEvent {
  id: string
  title: string
  description: string
  type: string
  status: string
  location: string
  capacity: number
  image_url: string | null
  start_date: string
  end_date: string
  registration_deadline: string | null
  created_at: string
  updated_at: string
  created_by: string
}

export function transformEventFromDb(dbEvent: DbEvent): Event {
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    description: dbEvent.description,
    type: dbEvent.type as Event['type'],
    status: dbEvent.status as Event['status'],
    location: dbEvent.location,
    capacity: dbEvent.capacity,
    imageUrl: dbEvent.image_url ?? undefined,
    startDate: dbEvent.start_date,
    endDate: dbEvent.end_date,
    registrationDeadline: dbEvent.registration_deadline ?? undefined,
    createdAt: dbEvent.created_at,
    updatedAt: dbEvent.updated_at,
    createdBy: dbEvent.created_by,
  }
}

export function transformEventsFromDb(dbEvents: DbEvent[]): Event[] {
  return dbEvents.map(transformEventFromDb)
}
```

---

## 4. 技術規格

### 4.1 型別命名規範

| 類型 | 命名規則 | 範例 |
|------|----------|------|
| Entity | PascalCase 單數 | Event, Registration |
| Request | EntityRequest | CreateEventRequest |
| Response | EntityResponse | EventListResponse |
| Status | EntityStatus | EventStatus |
| Props | ComponentProps | EventCardProps |

### 4.2 檔案組織規範

| 目錄 | 用途 | 檔案大小限制 |
|------|------|--------------|
| /types | 型別定義 | < 200 行 |
| /services | 資料服務 | < 300 行 |
| /transforms | 資料轉換 | < 100 行 |
| /components | UI 組件 | < 300 行 |

### 4.3 ESLint 規則優先級

| 等級 | 規則類型 | 範例 |
|------|----------|------|
| error | 必須修復 | no-explicit-any, hooks/rules |
| warn | 建議修復 | exhaustive-deps, no-console |

---

## 5. 驗收標準

### 5.1 型別驗收

- [ ] 所有 Entity 有統一型別定義
- [ ] 沒有重複的 interface 定義
- [ ] `any` 型別使用 < 10 處
- [ ] 所有公開 API 有 TypeDoc 註解

### 5.2 服務層驗收

- [ ] 所有服務繼承 BaseService
- [ ] 錯誤處理統一
- [ ] 每個服務檔案 < 300 行
- [ ] 有向後相容的函數匯出

### 5.3 程式碼品質驗收

- [ ] ESLint 無 error
- [ ] Prettier 格式一致
- [ ] TypeScript 無編譯錯誤
- [ ] `npm run validate` 通過

---

## 6. 交付清單

- [ ] `/app/types/*.ts` - 所有型別定義
- [ ] `/app/services/base.ts` - 新增
- [ ] `/app/services/events.ts` - 重構
- [ ] `/app/services/registrations.ts` - 重構
- [ ] `/app/transforms/*.ts` - 新增
- [ ] `/eslint.config.js` - 更新
- [ ] `/prettier.config.js` - 新增
- [ ] `package.json` - 更新 scripts

---

## 7. 成功指標

| 指標 | 目標值 | 測量方式 |
|------|--------|----------|
| 型別覆蓋率 | > 95% | TypeScript strict |
| 重複程式碼 | 減少 50%+ | SonarQube |
| ESLint 違規 | 0 errors | CI 檢查 |
| 維護複雜度 | 降低 | 程式碼審查 |

---

*下一週預告: PWA 與離線支援*
