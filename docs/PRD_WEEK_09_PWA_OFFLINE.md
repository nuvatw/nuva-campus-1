# PRD Week 9: PWA 與離線支援

**專案**: NUVA Campus 效能與 UI/UX 優化計畫
**週次**: 第 9 週 (共 10 週)
**負責人**: TBD
**預計交付日期**: TBD

---

## 1. 本週目標

將應用程式轉換為 Progressive Web App (PWA)，實作離線支援，特別針對報到功能提供離線能力。

---

## 2. 問題陳述

### 2.1 Check-in 沒有離線處理 (P2 - Medium)

**現況**:
- `/app/guardian/events/[id]/checkin/page.tsx` 完全依賴網路
- 網路不穩定時無法進行報到
- 活動現場網路品質通常不佳

**影響**:
- 活動現場報到可能中斷
- 使用者體驗差
- 可能造成排隊等待

### 2.2 沒有安裝能力 (P3 - Low)

**現況**:
- 無法安裝到手機主畫面
- 每次都需要開啟瀏覽器
- 無法接收推播通知

**影響**:
- 使用便利性差
- 品牌曝光度低
- 參與度可能較低

### 2.3 缺少離線指示 (P3 - Low)

**現況**:
- 沒有顯示網路狀態
- 離線時沒有任何提示
- 使用者不知道為何功能無法使用

**影響**:
- 使用者困惑
- 可能誤以為應用程式壞掉
- 支援負擔增加

---

## 3. 解決方案

### 3.1 PWA 基礎設定

#### 3.1.1 安裝 next-pwa

```bash
npm install next-pwa
```

#### 3.1.2 更新 next.config.ts

```typescript
import type { NextConfig } from 'next'
import withPWA from 'next-pwa'

const nextConfig: NextConfig = {
  // ... existing config
}

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'supabase-storage',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 5, // 5 minutes
        },
      },
    },
  ],
})

export default pwaConfig(nextConfig)
```

#### 3.1.3 建立 Web App Manifest

建立 `/public/manifest.json`:

```json
{
  "name": "NUVA Campus",
  "short_name": "NUVA",
  "description": "NUVA Campus 校園支持者平台",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "shortcuts": [
    {
      "name": "報到",
      "short_name": "報到",
      "description": "活動報到",
      "url": "/guardian/events",
      "icons": [{ "src": "/icons/checkin-96x96.png", "sizes": "96x96" }]
    }
  ],
  "categories": ["education", "productivity"]
}
```

#### 3.1.4 更新 Layout Head

修改 `/app/layout.tsx`:

```typescript
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'NUVA Campus',
  description: 'NUVA Campus 校園支持者平台',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NUVA Campus',
  },
}

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
```

### 3.2 離線報到功能

#### 3.2.1 建立離線儲存服務

建立 `/app/services/offline-storage.ts`:

```typescript
const DB_NAME = 'nuva-campus-offline'
const DB_VERSION = 1

interface PendingCheckIn {
  id: string
  eventId: string
  registrationId: string
  timestamp: number
  synced: boolean
}

class OfflineStorage {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // 待同步的報到記錄
        if (!db.objectStoreNames.contains('pendingCheckIns')) {
          const store = db.createObjectStore('pendingCheckIns', { keyPath: 'id' })
          store.createIndex('eventId', 'eventId', { unique: false })
          store.createIndex('synced', 'synced', { unique: false })
        }

        // 快取的報名資料
        if (!db.objectStoreNames.contains('cachedRegistrations')) {
          const store = db.createObjectStore('cachedRegistrations', { keyPath: 'id' })
          store.createIndex('eventId', 'eventId', { unique: false })
        }
      }
    })
  }

  // 儲存待同步的報到
  async savePendingCheckIn(data: Omit<PendingCheckIn, 'id' | 'synced'>): Promise<string> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID()
      const transaction = this.db!.transaction(['pendingCheckIns'], 'readwrite')
      const store = transaction.objectStore('pendingCheckIns')

      const request = store.add({
        ...data,
        id,
        synced: false,
      })

      request.onsuccess = () => resolve(id)
      request.onerror = () => reject(request.error)
    })
  }

  // 取得待同步的報到
  async getPendingCheckIns(eventId?: string): Promise<PendingCheckIn[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingCheckIns'], 'readonly')
      const store = transaction.objectStore('pendingCheckIns')
      const index = store.index('synced')
      const request = index.getAll(IDBKeyRange.only(false))

      request.onsuccess = () => {
        let results = request.result as PendingCheckIn[]
        if (eventId) {
          results = results.filter((r) => r.eventId === eventId)
        }
        resolve(results)
      }
      request.onerror = () => reject(request.error)
    })
  }

  // 標記為已同步
  async markAsSynced(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingCheckIns'], 'readwrite')
      const store = transaction.objectStore('pendingCheckIns')
      const request = store.get(id)

      request.onsuccess = () => {
        const data = request.result
        if (data) {
          data.synced = true
          store.put(data)
        }
        resolve()
      }
      request.onerror = () => reject(request.error)
    })
  }

  // 快取報名資料
  async cacheRegistrations(eventId: string, registrations: any[]): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedRegistrations'], 'readwrite')
      const store = transaction.objectStore('cachedRegistrations')

      // 先清除舊的快取
      const index = store.index('eventId')
      const deleteRequest = index.openCursor(IDBKeyRange.only(eventId))

      deleteRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        }
      }

      // 加入新的快取
      registrations.forEach((reg) => {
        store.put({ ...reg, eventId })
      })

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  // 取得快取的報名資料
  async getCachedRegistrations(eventId: string): Promise<any[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedRegistrations'], 'readonly')
      const store = transaction.objectStore('cachedRegistrations')
      const index = store.index('eventId')
      const request = index.getAll(IDBKeyRange.only(eventId))

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
}

export const offlineStorage = new OfflineStorage()
```

#### 3.2.2 建立同步服務

建立 `/app/services/sync-service.ts`:

```typescript
import { offlineStorage } from './offline-storage'
import { checkInRegistration } from './events'

class SyncService {
  private syncing = false

  async syncPendingCheckIns(): Promise<{ synced: number; failed: number }> {
    if (this.syncing) return { synced: 0, failed: 0 }

    this.syncing = true
    let synced = 0
    let failed = 0

    try {
      const pending = await offlineStorage.getPendingCheckIns()

      for (const item of pending) {
        try {
          const result = await checkInRegistration(item.eventId, item.registrationId)

          if (result.success) {
            await offlineStorage.markAsSynced(item.id)
            synced++
          } else {
            // 如果是已報到的錯誤，也標記為已同步
            if (result.error.code === 'ALREADY_CHECKED_IN') {
              await offlineStorage.markAsSynced(item.id)
              synced++
            } else {
              failed++
            }
          }
        } catch {
          failed++
        }
      }

      return { synced, failed }
    } finally {
      this.syncing = false
    }
  }

  // 監聽網路恢復時自動同步
  startAutoSync(): void {
    if (typeof window === 'undefined') return

    window.addEventListener('online', () => {
      console.log('[SyncService] Network restored, syncing...')
      this.syncPendingCheckIns()
    })

    // 定期同步（每 30 秒）
    setInterval(() => {
      if (navigator.onLine) {
        this.syncPendingCheckIns()
      }
    }, 30000)
  }
}

export const syncService = new SyncService()
```

#### 3.2.3 建立離線報到 Hook

建立 `/app/hooks/useOfflineCheckIn.ts`:

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { offlineStorage } from '@/services/offline-storage'
import { syncService } from '@/services/sync-service'
import { checkInRegistration } from '@/services/events'
import { useToast } from '@/hooks/useToast'

interface UseOfflineCheckInOptions {
  eventId: string
  onCheckInSuccess?: (registrationId: string) => void
}

export function useOfflineCheckIn({ eventId, onCheckInSuccess }: UseOfflineCheckInOptions) {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)
  const { toast } = useToast()

  // 監聽網路狀態
  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // 取得待同步數量
  useEffect(() => {
    const updatePendingCount = async () => {
      const pending = await offlineStorage.getPendingCheckIns(eventId)
      setPendingCount(pending.length)
    }

    updatePendingCount()
    const interval = setInterval(updatePendingCount, 5000)

    return () => clearInterval(interval)
  }, [eventId])

  // 執行報到
  const checkIn = useCallback(
    async (registrationId: string) => {
      if (isOnline) {
        // 線上模式：直接呼叫 API
        const result = await checkInRegistration(eventId, registrationId)

        if (result.success) {
          onCheckInSuccess?.(registrationId)
          return { success: true, offline: false }
        }

        return { success: false, error: result.error, offline: false }
      } else {
        // 離線模式：儲存到本地
        try {
          await offlineStorage.savePendingCheckIn({
            eventId,
            registrationId,
            timestamp: Date.now(),
          })

          toast({
            type: 'warning',
            title: '離線報到',
            message: '報到記錄已暫存，網路恢復後將自動同步',
          })

          onCheckInSuccess?.(registrationId)
          setPendingCount((prev) => prev + 1)

          return { success: true, offline: true }
        } catch (error) {
          return { success: false, error, offline: true }
        }
      }
    },
    [eventId, isOnline, onCheckInSuccess, toast]
  )

  // 手動同步
  const manualSync = useCallback(async () => {
    if (!isOnline) {
      toast({
        type: 'error',
        title: '無法同步',
        message: '請檢查網路連線',
      })
      return
    }

    toast({
      type: 'info',
      title: '同步中...',
      message: '正在同步離線報到記錄',
    })

    const result = await syncService.syncPendingCheckIns()

    if (result.synced > 0) {
      toast({
        type: 'success',
        title: '同步完成',
        message: `已同步 ${result.synced} 筆報到記錄`,
      })
      setPendingCount((prev) => Math.max(0, prev - result.synced))
    }

    if (result.failed > 0) {
      toast({
        type: 'warning',
        title: '部分同步失敗',
        message: `${result.failed} 筆記錄同步失敗，將稍後重試`,
      })
    }
  }, [isOnline, toast])

  return {
    isOnline,
    pendingCount,
    checkIn,
    manualSync,
  }
}
```

### 3.3 網路狀態指示器

建立 `/app/components/ui/NetworkStatus.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

interface NetworkStatusProps {
  pendingCount?: number
  onSync?: () => void
}

export function NetworkStatus({ pendingCount = 0, onSync }: NetworkStatusProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      // 顯示恢復訊息 3 秒
      setShowBanner(true)
      setTimeout(() => setShowBanner(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowBanner(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // 離線或有待同步時顯示
  const shouldShow = !isOnline || pendingCount > 0 || showBanner

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className={`
            fixed top-0 left-0 right-0 z-50 px-4 py-2
            flex items-center justify-center gap-2
            text-sm font-medium
            ${isOnline
              ? pendingCount > 0
                ? 'bg-yellow-500 text-white'
                : 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
            }
          `}
        >
          {isOnline ? (
            pendingCount > 0 ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{pendingCount} 筆待同步</span>
                <button
                  onClick={onSync}
                  className="ml-2 px-2 py-1 bg-white/20 rounded text-xs hover:bg-white/30"
                >
                  立即同步
                </button>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4" />
                <span>網路已恢復</span>
              </>
            )
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span>離線模式 - 報到記錄將在網路恢復後同步</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

### 3.4 安裝提示

建立 `/app/components/InstallPrompt.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'
import { Button } from './ui/Button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // 延遲顯示，不要太打擾使用者
      setTimeout(() => setShowPrompt(true), 30000) // 30 秒後顯示
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setShowPrompt(false)
    }

    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // 記住使用者選擇，一週內不再顯示
    localStorage.setItem('install-prompt-dismissed', Date.now().toString())
  }

  if (!showPrompt || !deferredPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-lg shadow-lg border p-4 z-50">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded"
        aria-label="關閉"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Download className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium">安裝 NUVA Campus</h3>
          <p className="text-sm text-gray-500 mt-1">
            安裝到主畫面，享受更流暢的體驗
          </p>
          <Button
            onClick={handleInstall}
            className="mt-3 w-full"
            size="sm"
          >
            安裝
          </Button>
        </div>
      </div>
    </div>
  )
}
```

---

## 4. 技術規格

### 4.1 快取策略

| 資源類型 | 策略 | TTL |
|----------|------|-----|
| 字體 | CacheFirst | 1 年 |
| 圖片 | CacheFirst | 30 天 |
| 靜態資源 | CacheFirst | 7 天 |
| API 回應 | NetworkFirst | 5 分鐘 |

### 4.2 離線儲存結構

```
IndexedDB: nuva-campus-offline
├── pendingCheckIns
│   ├── id (PK)
│   ├── eventId (Index)
│   ├── registrationId
│   ├── timestamp
│   └── synced (Index)
└── cachedRegistrations
    ├── id (PK)
    ├── eventId (Index)
    └── ...registration data
```

### 4.3 同步策略

| 觸發條件 | 行為 |
|----------|------|
| 網路恢復 | 自動同步 |
| 定時 (30s) | 背景同步 |
| 手動觸發 | 立即同步 |

---

## 5. 驗收標準

### 5.1 PWA 驗收

- [ ] Lighthouse PWA 分數 > 90
- [ ] 可安裝到主畫面
- [ ] 有適當的 Manifest 配置
- [ ] Service Worker 正確註冊

### 5.2 離線功能驗收

- [ ] 離線時可以進行報到操作
- [ ] 網路恢復後自動同步
- [ ] 同步失敗有適當處理
- [ ] 有清楚的離線狀態指示

### 5.3 使用者體驗驗收

- [ ] 安裝提示不過度打擾
- [ ] 網路狀態指示清楚
- [ ] 同步進度可見
- [ ] 錯誤訊息友善

---

## 6. 交付清單

- [ ] `next.config.ts` - 更新 PWA 配置
- [ ] `/public/manifest.json` - 新增
- [ ] `/public/icons/` - 所有尺寸的圖示
- [ ] `/app/services/offline-storage.ts` - 新增
- [ ] `/app/services/sync-service.ts` - 新增
- [ ] `/app/hooks/useOfflineCheckIn.ts` - 新增
- [ ] `/app/components/ui/NetworkStatus.tsx` - 新增
- [ ] `/app/components/InstallPrompt.tsx` - 新增
- [ ] `/app/layout.tsx` - 更新

---

## 7. 成功指標

| 指標 | 目標值 | 測量方式 |
|------|--------|----------|
| Lighthouse PWA | > 90 | Lighthouse |
| 離線報到成功率 | > 99% | 監控 |
| PWA 安裝率 | > 10% | 分析 |
| 同步成功率 | > 95% | 監控 |

---

*下一週預告: 監控、測試與最終驗收*
