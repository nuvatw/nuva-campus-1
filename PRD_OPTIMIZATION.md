# NUVA Campus 全面優化執行計畫 (PRD)

> 版本: 1.0
> 日期: 2026-01-29
> 狀態: 待執行

---

## 一、專案現況分析

### 1.1 技術棧
- **Frontend**: Next.js 16.1.0 (App Router + Turbopack)
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Email**: Resend API
- **State Management**: SWR (Client-side caching)
- **Styling**: Tailwind CSS

### 1.2 現有問題

| 問題類型 | 描述 | 影響 |
|---------|------|------|
| **效能** | 無多層快取機制，每次請求直接打 Supabase | 延遲高、成本增加 |
| **架構** | Server/Client Component 混用不當 | 頁面載入慢 |
| **資料** | 校園大使 workshops 資料硬編碼 | 無法動態管理 |
| **管理** | 守護者缺乏總覽介面 | 無法一次看所有活動數據 |
| **模組化** | 重複代碼多，缺乏共用元件 | 維護困難 |

---

## 二、優化架構設計

### 2.1 多層快取架構 (Multi-Layer Caching)

```
┌─────────────────────────────────────────────────────────┐
│                      Client Browser                      │
│  ┌─────────────────────────────────────────────────┐    │
│  │  L0: SWR Cache (In-Memory, 自動失效)              │    │
│  │  - 自動 deduplication                            │    │
│  │  - Focus revalidation                           │    │
│  │  - staleTime: 30s ~ 5min                        │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Next.js Server                        │
│  ┌─────────────────────────────────────────────────┐    │
│  │  L1: In-Memory LRU Cache (node-cache)            │    │
│  │  - 快速存取，單機有效                             │    │
│  │  - TTL: 60s ~ 300s                              │    │
│  │  - Max entries: 1000                            │    │
│  └─────────────────────────────────────────────────┘    │
│                            │                             │
│                            ▼                             │
│  ┌─────────────────────────────────────────────────┐    │
│  │  L2: Redis Cache (Upstash)                       │    │
│  │  - 分散式快取，跨實例共享                         │    │
│  │  - TTL: 5min ~ 1hour                            │    │
│  │  - 支援 tag-based invalidation                  │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Supabase (PostgreSQL)                 │
│  - Connection Pooling (PgBouncer)                       │
│  - Read Replicas (如需要)                               │
│  - RLS Policy Caching                                   │
└─────────────────────────────────────────────────────────┘
```

### 2.2 推薦的快取策略

| 資料類型 | L0 (SWR) | L1 (Memory) | L2 (Redis) | 失效策略 |
|---------|----------|-------------|------------|---------|
| 活動列表 | 5min | 2min | 10min | 手動 + 定時 |
| 報到統計 | 10s | 30s | 60s | 即時更新 |
| 大使名單 | 10min | 5min | 30min | Webhook |
| 任務狀態 | 30s | 60s | 5min | Realtime |
| 密碼資料 | 不快取 | 不快取 | 不快取 | - |

---

## 三、資料庫 Schema 優化

### 3.1 新增 `workshops` 表（取代硬編碼）

```sql
-- 新增 workshops 表
CREATE TABLE workshops (
  id TEXT PRIMARY KEY,                    -- 例如: 'ws01', 'ws02'
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('online', 'offline', 'hybrid')),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  online_link TEXT,
  description TEXT,
  max_capacity INTEGER,
  tally_form_id TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_workshops_status ON workshops(status);
CREATE INDEX idx_workshops_date ON workshops(date);

-- RLS
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON workshops FOR SELECT USING (true);
CREATE POLICY "Allow authenticated update" ON workshops FOR UPDATE USING (true);
```

### 3.2 新增 `events` 總表（統一事件管理）

```sql
-- 統一事件表
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('workshop', 'mission', 'nunu_activity', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  date DATE,
  start_time TIME,
  end_time TIME,
  location TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'ongoing', 'completed', 'cancelled')),
  metadata JSONB DEFAULT '{}',           -- 彈性欄位存放各類型特有資料
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(date);
```

### 3.3 擴展 `event_registrations` 表

```sql
-- 新增欄位支援更多角色類型
ALTER TABLE event_registrations
ADD COLUMN role TEXT DEFAULT 'participant' CHECK (role IN ('participant', 'ambassador', 'nunu', 'guardian', 'speaker'));

-- 新增大使專屬欄位
ALTER TABLE event_registrations
ADD COLUMN ambassador_id TEXT REFERENCES ambassadors(ambassador_id);

-- 優化索引
CREATE INDEX idx_event_registrations_role ON event_registrations(event_id, role);
CREATE INDEX idx_event_registrations_ambassador ON event_registrations(ambassador_id) WHERE ambassador_id IS NOT NULL;
```

---

## 四、模組化架構

### 4.1 目錄結構重組

```
/app
├── (public)/                    # 公開頁面
│   ├── page.tsx                 # 首頁
│   └── recruit/
│
├── (protected)/                 # 需認證頁面
│   ├── guardian/
│   ├── ambassador/
│   └── nunu/
│
├── api/                         # API Routes
│   ├── auth/
│   ├── events/
│   ├── registrations/
│   └── cache/                   # 快取管理 API
│
├── components/
│   ├── ui/                      # 基礎 UI 元件
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── NumericKeypad.tsx
│   │   ├── DataTable.tsx        # 新增：通用資料表格
│   │   └── StatsCard.tsx        # 新增：統計卡片
│   │
│   ├── features/                # 功能模組
│   │   ├── auth/
│   │   │   ├── AuthGuard.tsx
│   │   │   ├── PasswordModal.tsx
│   │   │   └── useAuth.ts
│   │   │
│   │   ├── events/
│   │   │   ├── EventCard.tsx
│   │   │   ├── EventList.tsx
│   │   │   ├── EventStats.tsx
│   │   │   └── useEvents.ts
│   │   │
│   │   ├── registrations/
│   │   │   ├── RegistrationTable.tsx
│   │   │   ├── CheckinScanner.tsx
│   │   │   └── useRegistrations.ts
│   │   │
│   │   └── dashboard/
│   │       ├── DashboardStats.tsx
│   │       ├── ActivityChart.tsx
│   │       └── QuickActions.tsx
│   │
│   └── layouts/
│       ├── AdminLayout.tsx
│       ├── PublicLayout.tsx
│       └── ProtectedLayout.tsx
│
├── hooks/                       # 共用 Hooks
│   ├── useSupabase.ts
│   ├── useCache.ts
│   ├── useRealtime.ts
│   └── usePagination.ts
│
├── lib/                         # 工具函數
│   ├── supabase.ts
│   ├── supabase-server.ts
│   ├── cache.ts                 # 新增：快取邏輯
│   ├── redis.ts                 # 新增：Redis 客戶端
│   └── utils.ts
│
├── services/                    # 資料服務層
│   ├── events.service.ts
│   ├── registrations.service.ts
│   ├── ambassadors.service.ts
│   └── cache.service.ts
│
└── types/
    └── index.ts                 # 統一 export
```

### 4.2 共用 Hooks 設計

```typescript
// hooks/useEvents.ts
export function useEvents(options?: { type?: string; status?: string }) {
  return useSWR(
    ['events', options],
    () => eventsService.getAll(options),
    {
      refreshInterval: 30000,
      dedupingInterval: 5000,
    }
  );
}

// hooks/useRegistrations.ts
export function useRegistrations(eventId: string) {
  return useSWR(
    eventId ? ['registrations', eventId] : null,
    () => registrationsService.getByEvent(eventId),
    {
      refreshInterval: 10000,
    }
  );
}

// hooks/useRealtime.ts
export function useRealtime<T>(
  table: string,
  filter?: { column: string; value: string },
  onUpdate?: (payload: T) => void
) {
  useEffect(() => {
    const channel = supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table,
        filter: filter ? `${filter.column}=eq.${filter.value}` : undefined,
      }, onUpdate)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [table, filter?.value]);
}
```

---

## 五、守護者總覽 Dashboard

### 5.1 新增 `/guardian/dashboard` 頁面

功能需求：
- 所有活動一覽（Workshop、Mission、Nunu 活動）
- 即時統計數據
- 報名人數趨勢圖
- 快速操作按鈕
- 資料編輯功能

### 5.2 Dashboard 設計

```
┌─────────────────────────────────────────────────────────────────┐
│  守護者總覽 Dashboard                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ 總報名數  │  │ 今日報到  │  │ 便當領取  │  │ 待發通知  │         │
│  │   156    │  │   42     │  │  38/52   │  │    12    │         │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  活動列表                                          [新增]   │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │  活動名稱          │ 類型     │ 報名 │ 報到 │ 狀態  │ 操作 │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │  WS02 故事工作坊   │ Workshop │  52  │  42  │ 進行中│ 編輯 │ │
│  │  M03 品牌任務      │ Mission  │  --  │ 18/21│ 進行中│ 編輯 │ │
│  │  努努 0131 出團    │ Nunu     │  28  │   0  │ 即將  │ 編輯 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  報名詳情 (點擊活動展開)                                     │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │  姓名    │ Email           │ 角色    │ 報到 │ 便當 │ 操作  │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │  王小明  │ ming@test.com   │ 大使001 │  ✓  │  ✓  │ 編輯  │ │
│  │  李大華  │ hua@test.com    │ 一般    │  ✓  │  ✗  │ 編輯  │ │
│  │  張美麗  │ mei@test.com    │ 大使003 │  ✗  │  --  │ 編輯  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 資料編輯 Modal

```typescript
interface EditRegistrationModalProps {
  registration: EventRegistration;
  onSave: (data: Partial<EventRegistration>) => Promise<void>;
  onClose: () => void;
}

// 可編輯欄位
- participant_name
- participant_email
- attendance_mode (online/offline)
- lunch_box_required
- attended (手動報到)
- lunch_collected (手動發便當)
- notification_sent (重發通知)
```

---

## 六、校園大使資料串接

### 6.1 將 workshops 移至資料庫

```typescript
// 移除 /app/data/workshops.ts
// 新增 API: /api/workshops

// GET /api/workshops
export async function GET() {
  const { data } = await supabase
    .from('workshops')
    .select('*')
    .order('date', { ascending: true });
  return NextResponse.json(data);
}

// POST /api/workshops (管理用)
export async function POST(req: Request) {
  const body = await req.json();
  const { data, error } = await supabase
    .from('workshops')
    .insert(body)
    .select()
    .single();
  return NextResponse.json(data);
}
```

### 6.2 更新 Ambassador 頁面

```typescript
// /app/ambassador/page.tsx
'use client';

export default function AmbassadorPage() {
  // 使用 SWR 取得 workshops
  const { data: workshops, isLoading } = useSWR('workshops', fetchWorkshops);

  // 使用 SWR 取得 missions (已有)
  const { data: missions } = useSWR('missions', fetchMissions);

  // ... 其他邏輯不變
}
```

### 6.3 Workshops 管理頁面（守護者專用）

新增 `/guardian/workshops` 頁面：
- 列出所有 workshops
- 新增/編輯/刪除功能
- 複製 Tally form ID 功能
- 查看報名統計

---

## 七、Redis 快取實作

### 7.1 安裝依賴

```bash
npm install @upstash/redis
```

### 7.2 Redis 客戶端

```typescript
// /app/lib/redis.ts
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// 快取工具函數
export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300  // 預設 5 分鐘
): Promise<T> {
  // 嘗試從快取讀取
  const cachedData = await redis.get<T>(key);
  if (cachedData) {
    return cachedData;
  }

  // 從資料庫讀取
  const data = await fetcher();

  // 寫入快取
  await redis.set(key, data, { ex: ttl });

  return data;
}

// 快取失效
export async function invalidateCache(pattern: string) {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

### 7.3 使用範例

```typescript
// /app/services/events.service.ts
import { cached, invalidateCache } from '@/app/lib/redis';

export const eventsService = {
  async getAll() {
    return cached(
      'events:all',
      async () => {
        const { data } = await supabase
          .from('events')
          .select('*')
          .order('date');
        return data;
      },
      300  // 5 分鐘
    );
  },

  async getById(id: string) {
    return cached(
      `events:${id}`,
      async () => {
        const { data } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();
        return data;
      },
      600  // 10 分鐘
    );
  },

  async update(id: string, updates: Partial<Event>) {
    const { data } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    // 失效相關快取
    await invalidateCache(`events:${id}`);
    await invalidateCache('events:all');

    return data;
  },
};
```

---

## 八、效能監控

### 8.1 Vercel Analytics 整合

```typescript
// /app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 8.2 自訂效能追蹤

```typescript
// /app/lib/performance.ts
export function trackApiLatency(endpoint: string, duration: number) {
  if (typeof window !== 'undefined' && window.performance) {
    performance.mark(`api-${endpoint}-end`);
    // 可以送到 analytics 服務
    console.log(`[API] ${endpoint}: ${duration}ms`);
  }
}
```

---

## 九、執行計畫

### Phase 1: 基礎優化 (Week 1)
- [x] 修復 AuthGuard 重載問題
- [x] 轉換 Server Component 為 Client Component
- [ ] 實作 API Routes 層
- [ ] 新增 loading.tsx 骨架屏

### Phase 2: 資料庫擴展 (Week 1-2)
- [ ] 建立 `workshops` 表
- [ ] 建立 `events` 統一表
- [ ] 擴展 `event_registrations` 欄位
- [ ] 資料遷移腳本

### Phase 3: Redis 快取 (Week 2)
- [ ] 設定 Upstash Redis
- [ ] 實作快取層
- [ ] 整合到 services
- [ ] 設定快取失效策略

### Phase 4: 模組化重構 (Week 2-3)
- [ ] 重組目錄結構
- [ ] 抽取共用 Hooks
- [ ] 建立 Services 層
- [ ] 統一 Types export

### Phase 5: Dashboard 開發 (Week 3)
- [ ] 守護者總覽頁面
- [ ] 資料表格元件
- [ ] 編輯 Modal
- [ ] 統計圖表

### Phase 6: 校園大使串接 (Week 3-4)
- [ ] Workshops API
- [ ] 更新 Ambassador 頁面
- [ ] Workshops 管理頁面
- [ ] Realtime 訂閱優化

### Phase 7: 監控與測試 (Week 4)
- [ ] Vercel Analytics
- [ ] 效能測試
- [ ] 壓力測試
- [ ] 文件更新

---

## 十、預期成效

| 指標 | 優化前 | 優化後 | 改善幅度 |
|-----|-------|-------|---------|
| 首頁載入 (TTFB) | ~800ms | <200ms | 75%+ |
| 守護者頁面載入 | >60s | <2s | 97%+ |
| API 回應時間 | ~500ms | <50ms | 90%+ |
| Supabase 請求數 | 100/min | 20/min | 80%- |
| 維護複雜度 | 高 | 低 | - |

---

## 十一、參考資源

- [Redis Caching Strategies: Next.js Production Guide 2025](https://www.digitalapplied.com/blog/redis-caching-strategies-nextjs-production)
- [Next.js 15 App Router Caching with Redis](https://dev.to/technnik/nextjs-15-app-router-caching-why-self-hosted-apps-need-redis-and-how-to-implement-it-23op)
- [Supabase + Next.js Caching](https://supabase.com/blog/fetching-and-caching-supabase-data-in-next-js-server-components)
- [SWR with Next.js App Router](https://swr.vercel.app/docs/with-nextjs)
- [React Query vs SWR 2025](https://dev.to/rigalpatel001/react-query-or-swr-which-is-best-in-2025-2oa3)

---

## 十二、環境變數需求

```env
# 現有
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
RESEND_API_KEY=

# 新增 (Redis)
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=

# 新增 (監控)
VERCEL_ANALYTICS_ID=
```

---

*此文件將隨專案進展持續更新*
