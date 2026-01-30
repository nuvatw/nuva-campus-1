# PRD Week 4: 圖片優化與資源預載入策略

**專案**: NUVA Campus 效能與 UI/UX 優化計畫
**週次**: 第 4 週 (共 10 週)
**負責人**: TBD
**預計交付日期**: TBD

---

## 1. 本週目標

優化所有圖片載入策略，實作資源預載入，減少 Largest Contentful Paint (LCP) 時間。

---

## 2. 問題陳述

### 2.1 圖片缺少 Blur Placeholder (P2 - Medium)

**現況**:
- `/app/recruit/page.tsx:137-143` Hero 圖片無 blur placeholder
- 圖片載入時出現空白區域或版面位移
- 缺少漸進式載入體驗

**影響**:
- 使用者體驗不佳 (內容閃爍)
- Cumulative Layout Shift (CLS) 分數降低
- 首屏視覺完整性差

### 2.2 缺少圖片大小指定 (P2 - Medium)

**現況**:
- 部分圖片未指定 `sizes` 屬性
- 瀏覽器可能載入過大的圖片
- 未充分利用 responsive images

**影響**:
- 浪費頻寬
- 行動裝置載入過大圖片
- 效能浪費

### 2.3 無關鍵資源預載入 (P2 - Medium)

**現況**:
- 關鍵資源未設定 preload
- Hero 圖片需等待 CSS 解析後才開始載入
- 字體載入延遲

**影響**:
- LCP 時間增加
- 頁面視覺完成時間延遲

---

## 3. 解決方案

### 3.1 圖片優化策略

#### 3.1.1 建立圖片工具函數

建立 `/app/utils/image.ts`:

```typescript
import { getPlaiceholder } from 'plaiceholder'
import fs from 'fs/promises'
import path from 'path'

/**
 * 生成圖片的 blur data URL
 */
export async function getBlurDataURL(imagePath: string): Promise<string> {
  try {
    const absolutePath = path.join(process.cwd(), 'public', imagePath)
    const buffer = await fs.readFile(absolutePath)
    const { base64 } = await getPlaiceholder(buffer)
    return base64
  } catch (error) {
    console.error(`Failed to generate blur for ${imagePath}:`, error)
    // 返回預設的極小 placeholder
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACv/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q=='
  }
}

/**
 * 圖片 srcset sizes 配置
 */
export const imageSizes = {
  hero: '100vw',
  card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  avatar: '48px',
  thumbnail: '(max-width: 640px) 50vw, 200px',
} as const

/**
 * 預定義的圖片品質設定
 */
export const imageQuality = {
  hero: 85,
  card: 75,
  thumbnail: 60,
} as const
```

#### 3.1.2 預生成 Blur Placeholder

建立 `/scripts/generate-blur.ts`:

```typescript
import { getPlaiceholder } from 'plaiceholder'
import fs from 'fs/promises'
import path from 'path'
import glob from 'fast-glob'

interface BlurData {
  [key: string]: string
}

async function generateBlurData() {
  const publicDir = path.join(process.cwd(), 'public')
  const outputPath = path.join(process.cwd(), 'app/data/blur-data.json')

  // 找出所有圖片
  const images = await glob('**/*.{jpg,jpeg,png,webp}', {
    cwd: publicDir,
    ignore: ['**/node_modules/**'],
  })

  const blurData: BlurData = {}

  for (const image of images) {
    try {
      const buffer = await fs.readFile(path.join(publicDir, image))
      const { base64 } = await getPlaiceholder(buffer, { size: 10 })
      blurData[`/${image}`] = base64
      console.log(`✓ Generated blur for ${image}`)
    } catch (error) {
      console.error(`✗ Failed to process ${image}:`, error)
    }
  }

  await fs.writeFile(outputPath, JSON.stringify(blurData, null, 2))
  console.log(`\nBlur data saved to ${outputPath}`)
}

generateBlurData().catch(console.error)
```

#### 3.1.3 優化後的 Image 組件

建立 `/app/components/ui/OptimizedImage.tsx`:

```typescript
import Image, { ImageProps } from 'next/image'
import blurData from '@/data/blur-data.json'

interface OptimizedImageProps extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  fallbackBlur?: string
}

const DEFAULT_BLUR = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...'

export function OptimizedImage({
  src,
  fallbackBlur = DEFAULT_BLUR,
  ...props
}: OptimizedImageProps) {
  const srcString = typeof src === 'string' ? src : ''
  const blur = blurData[srcString as keyof typeof blurData] || fallbackBlur

  return (
    <Image
      src={src}
      placeholder="blur"
      blurDataURL={blur}
      {...props}
    />
  )
}
```

### 3.2 Hero 圖片優化

#### 3.2.1 更新 RecruitPage Hero

修改 `/app/recruit/components/HeroSection.tsx`:

```typescript
import { OptimizedImage } from '@/components/ui/OptimizedImage'

export function HeroSection() {
  return (
    <section className="relative min-h-screen">
      <OptimizedImage
        src="/campus_tour.jpeg"
        alt="NUVA Campus Tour - 學生們在校園中交流"
        fill
        priority // 關鍵圖片優先載入
        sizes="100vw"
        quality={85}
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      {/* Content */}
    </section>
  )
}
```

### 3.3 資源預載入策略

#### 3.3.1 設定 Preload Hints

修改 `/app/layout.tsx`:

```typescript
import { Metadata } from 'next'

export const metadata: Metadata = {
  // ... existing metadata
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <head>
        {/* 預載入關鍵圖片 */}
        <link
          rel="preload"
          href="/campus_tour.jpeg"
          as="image"
          type="image/jpeg"
        />

        {/* 預連接外部資源 */}
        <link rel="preconnect" href="https://your-supabase-url.supabase.co" />
        <link rel="dns-prefetch" href="https://your-supabase-url.supabase.co" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
```

#### 3.3.2 頁面級別預載入

建立 `/app/recruit/loading.tsx`:

```typescript
export default function RecruitLoading() {
  return (
    <>
      {/* 預載入此頁面需要的資源 */}
      <link
        rel="preload"
        href="/campus_tour.jpeg"
        as="image"
        type="image/jpeg"
      />

      {/* Loading Skeleton */}
      <div className="min-h-screen bg-gray-900 animate-pulse">
        <div className="h-screen w-full bg-gray-800" />
      </div>
    </>
  )
}
```

### 3.4 響應式圖片配置

#### 3.4.1 更新 next.config.ts

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // 定義響應式斷點
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // 圖片格式
    formats: ['image/avif', 'image/webp'],

    // 允許的外部圖片來源
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],

    // 最小化 cache 頭設定
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },
}

export default nextConfig
```

### 3.5 SupporterCard 圖片優化

修改 `/app/recruit/components/SupportersWall/SupporterCard.tsx`:

```typescript
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { imageSizes } from '@/utils/image'

interface SupporterCardProps {
  supporter: {
    id: string
    name: string
    avatar?: string
    university: string
    message?: string
  }
}

export function SupporterCard({ supporter }: SupporterCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex items-start gap-3">
      {supporter.avatar ? (
        <OptimizedImage
          src={supporter.avatar}
          alt={`${supporter.name} 的頭像`}
          width={48}
          height={48}
          sizes={imageSizes.avatar}
          className="rounded-full object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
          {supporter.name.charAt(0)}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">
          {supporter.name}
        </h3>
        <p className="text-sm text-gray-500 truncate">
          {supporter.university}
        </p>
        {supporter.message && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {supporter.message}
          </p>
        )}
      </div>
    </div>
  )
}
```

---

## 4. 技術規格

### 4.1 圖片格式策略

| 用途 | 格式優先順序 | 品質 | 說明 |
|------|--------------|------|------|
| Hero 背景 | AVIF > WebP > JPEG | 85 | 全螢幕，品質重要 |
| 卡片圖片 | AVIF > WebP > JPEG | 75 | 中等大小 |
| 頭像 | WebP > PNG | 80 | 小尺寸，需透明支援 |
| 縮圖 | WebP > JPEG | 60 | 小尺寸，效能優先 |

### 4.2 Sizes 屬性配置

| 組件 | sizes 值 | 說明 |
|------|----------|------|
| Hero | 100vw | 全寬背景 |
| SupporterCard | 48px | 固定尺寸頭像 |
| WorkshopCard | (max-width: 640px) 100vw, 33vw | 響應式卡片 |
| EventImage | (max-width: 768px) 100vw, 50vw | 響應式事件圖 |

### 4.3 新增依賴

```json
{
  "dependencies": {
    "plaiceholder": "^3.0.0",
    "sharp": "^0.33.0"
  }
}
```

---

## 5. 驗收標準

### 5.1 Blur Placeholder 驗收

- [ ] 所有 Hero 圖片有 blur placeholder
- [ ] 圖片載入時有模糊過渡效果
- [ ] blur-data.json 自動生成且包含所有圖片

### 5.2 響應式圖片驗收

- [ ] 所有 Image 組件有適當的 sizes 屬性
- [ ] 不同螢幕寬度載入適當大小的圖片
- [ ] Network tab 確認使用 WebP/AVIF 格式

### 5.3 預載入驗收

- [ ] Hero 圖片設定 priority
- [ ] 關鍵圖片有 preload link
- [ ] 外部 API 有 preconnect

### 5.4 效能驗收

- [ ] LCP 改善 > 20%
- [ ] CLS < 0.1
- [ ] 圖片總傳輸量減少 > 30%

---

## 6. 實作步驟

### Day 1: 基礎設施

1. 安裝 plaiceholder 和 sharp
2. 建立 `/app/utils/image.ts`
3. 建立 blur 生成腳本
4. 執行生成所有圖片的 blur data

### Day 2: OptimizedImage 組件

1. 建立 `/app/components/ui/OptimizedImage.tsx`
2. 設定 blur data 映射
3. 測試組件功能

### Day 3: 頁面圖片更新

1. 更新 RecruitPage Hero 圖片
2. 更新 SupporterCard 圖片
3. 更新其他頁面的圖片組件

### Day 4: 預載入設定

1. 更新 layout.tsx 加入 preload
2. 設定各頁面的 loading.tsx
3. 配置 next.config.ts 圖片設定

### Day 5: 測試與優化

1. 執行 Lighthouse 測試
2. 檢查 Network waterfall
3. 調整優化參數

---

## 7. 風險與緩解措施

| 風險 | 機率 | 影響 | 緩解措施 |
|------|------|------|----------|
| Sharp 安裝失敗 | 中 | 中 | 提供 Docker 環境或預生成 blur |
| Blur 品質不佳 | 低 | 低 | 調整 size 參數 |
| 圖片格式不支援 | 低 | 低 | 設定 fallback 格式 |

---

## 8. 交付清單

- [ ] `/app/utils/image.ts` - 新增
- [ ] `/scripts/generate-blur.ts` - 新增
- [ ] `/app/data/blur-data.json` - 生成
- [ ] `/app/components/ui/OptimizedImage.tsx` - 新增
- [ ] `/app/recruit/components/HeroSection.tsx` - 修改
- [ ] `/app/recruit/components/SupportersWall/SupporterCard.tsx` - 修改
- [ ] `/app/layout.tsx` - 修改
- [ ] `next.config.ts` - 修改
- [ ] `package.json` - 更新

---

## 9. 成功指標

| 指標 | 目標值 | 測量方式 |
|------|--------|----------|
| LCP | < 2.0s | Web Vitals |
| CLS | < 0.1 | Web Vitals |
| 圖片傳輸量 | 減少 30%+ | Network tab |
| Lighthouse Image 分數 | 通過 | Lighthouse |

---

## 10. 本週里程碑

- **Day 1**: 基礎工具完成
- **Day 2**: OptimizedImage 組件完成
- **Day 3**: 所有頁面圖片更新
- **Day 4**: 預載入設定完成
- **Day 5**: 測試驗收

---

*下一週預告: 錯誤處理與 Loading 狀態優化*
