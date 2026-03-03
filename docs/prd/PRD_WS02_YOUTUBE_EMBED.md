# PRD: 工作坊 YouTube 影片嵌入功能

## 概述

為校園大使工作坊 (ws02) 頁面新增 YouTube 影片嵌入播放器，讓使用者可以直接在網站內觀看工作坊回放影片，同時提供一個按鈕可跳轉至 YouTube 觀看。

## 背景與目的

- **影片連結**: https://www.youtube.com/live/iAfrQb6S9XY
- **影片 ID**: `iAfrQb6S9XY`
- **目標**: 提升使用者體驗，讓無法實體參與的成員可以回顧工作坊內容

## 功能需求

### 1. 資料模型擴充

**修改檔案**: `app/types/workshop.ts`

在 `Workshop` interface 新增欄位：

```typescript
export interface Workshop {
  // ... 現有欄位
  youtubeVideoId?: string;  // YouTube 影片 ID (例如: iAfrQb6S9XY)
}
```

### 2. 工作坊資料更新

**修改檔案**: `app/data/workshops.ts`

為 ws02 新增 YouTube 影片 ID：

```typescript
{
  id: 'ws02',
  title: '故事，是溝通的致勝關鍵！',
  // ... 現有欄位
  youtubeVideoId: 'iAfrQb6S9XY',
}
```

### 3. YouTube 嵌入元件

**新建檔案**: `app/components/ui/YouTubeEmbed.tsx`

#### 元件規格

| 屬性 | 類型 | 必填 | 說明 |
|------|------|------|------|
| videoId | string | 是 | YouTube 影片 ID |
| title | string | 否 | 影片標題 (用於 accessibility) |

#### 技術實作重點

1. **響應式設計** - 使用 intrinsic ratio 技術 (16:9 比例)
   ```css
   .video-container {
     position: relative;
     width: 100%;
     padding-top: 56.25%; /* 16:9 比例 = 9/16 = 0.5625 */
   }

   .video-iframe {
     position: absolute;
     top: 0;
     left: 0;
     width: 100%;
     height: 100%;
   }
   ```

2. **iframe 嵌入 URL 格式**
   ```
   https://www.youtube.com/embed/{VIDEO_ID}
   ```

3. **建議參數**
   - `rel=0` - 相關影片只顯示同頻道
   - `modestbranding=1` - 減少 YouTube logo (已棄用，但可保留)

4. **最小尺寸要求**
   - YouTube 規定嵌入播放器最小 200x200 像素
   - 建議最小 480x270 像素以顯示完整控制列

### 4. 頁面整合

**修改檔案**: `app/ambassador/workshops/[id]/page.tsx`

#### UI 位置

在「工作坊資訊」和「報名統計」卡片**上方**新增影片區塊：

```
┌──────────────────────────────────────────────────┐
│  🎬 工作坊回放                                    │
│  ┌────────────────────────────────────────────┐  │
│  │                                            │  │
│  │         YouTube 嵌入式播放器                │  │
│  │         (16:9 響應式)                       │  │
│  │                                            │  │
│  └────────────────────────────────────────────┘  │
│  [▶ 在 YouTube 播放]                             │
└──────────────────────────────────────────────────┘
```

#### 按鈕規格

- 文字: 「在 YouTube 播放」
- 圖示: YouTube 紅色播放圖示 或 外部連結圖示
- 行為: 新分頁開啟 YouTube 原始連結
- 連結: `https://www.youtube.com/watch?v={VIDEO_ID}`
- 樣式: 與現有設計語言一致 (圓角、hover 效果)

### 5. 條件渲染邏輯

只有當 `workshop.youtubeVideoId` 存在時才顯示影片區塊：

```tsx
{workshop.youtubeVideoId && (
  <YouTubeEmbed
    videoId={workshop.youtubeVideoId}
    title={workshop.title}
  />
)}
```

## 設計規格

### 色彩

- 區塊背景: `bg-white`
- 邊框: `border border-gray-100`
- 圓角: `rounded-xl`
- 陰影: `shadow-sm`
- 按鈕: YouTube 紅 `#FF0000` 或使用現有 `primary` 色

### 響應式斷點

| 裝置 | 寬度 | 影片區塊行為 |
|------|------|-------------|
| 手機 | < 640px | 全寬，padding 減少 |
| 平板 | 640-1024px | 全寬 |
| 桌面 | > 1024px | 最大寬度限制 |

### 間距

- 卡片內 padding: `p-4 sm:p-6`
- 標題與影片間距: `mb-4`
- 影片與按鈕間距: `mt-4`

## 安全性考量

1. **iframe sandbox** - 限制 iframe 權限
   ```html
   <iframe
     sandbox="allow-scripts allow-same-origin allow-presentation"
     ...
   />
   ```

2. **Content Security Policy** - 確保 CSP 允許 YouTube domain
   ```
   frame-src: https://www.youtube.com
   ```

3. **X-Frame-Options** - 無需修改 (YouTube 控制其 embed 政策)

## 無障礙性 (Accessibility)

1. iframe 需包含 `title` 屬性描述影片內容
2. 按鈕需有明確的 `aria-label`
3. 鍵盤可聚焦並操作

```tsx
<iframe
  title={`${title} - YouTube 影片`}
  // ...
/>

<a
  href={youtubeUrl}
  target="_blank"
  rel="noopener noreferrer"
  aria-label="在 YouTube 新分頁播放此影片"
>
  在 YouTube 播放
</a>
```

## 實作步驟

### 階段一：資料層 (Phase 1)

1. [ ] 更新 `app/types/workshop.ts` - 新增 `youtubeVideoId` 欄位
2. [ ] 更新 `app/data/workshops.ts` - 為 ws02 新增影片 ID

### 階段二：元件開發 (Phase 2)

3. [ ] 建立 `app/components/ui/YouTubeEmbed.tsx` 元件
4. [ ] 實作響應式 16:9 比例容器
5. [ ] 實作「在 YouTube 播放」按鈕

### 階段三：頁面整合 (Phase 3)

6. [ ] 修改 `app/ambassador/workshops/[id]/page.tsx`
7. [ ] 引入 YouTubeEmbed 元件
8. [ ] 在工作坊資訊上方新增影片區塊
9. [ ] 實作條件渲染邏輯

### 階段四：測試 (Phase 4)

10. [ ] 桌面瀏覽器測試 (Chrome, Firefox, Safari)
11. [ ] 手機響應式測試
12. [ ] 無影片工作坊頁面測試 (確認不顯示區塊)

## 程式碼範例

### YouTubeEmbed.tsx 完整範例

```tsx
'use client';

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
}

export default function YouTubeEmbed({ videoId, title = '工作坊影片' }: YouTubeEmbedProps) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
      <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">
        🎬 工作坊回放
      </h3>

      {/* 響應式 16:9 影片容器 */}
      <div className="relative w-full pt-[56.25%] bg-gray-100 rounded-lg overflow-hidden">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={embedUrl}
          title={`${title} - YouTube 影片`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      {/* 在 YouTube 播放按鈕 */}
      <div className="mt-4 flex justify-center">
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
          aria-label="在 YouTube 新分頁播放此影片"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          在 YouTube 播放
        </a>
      </div>
    </div>
  );
}
```

## 驗收標準

1. **功能面**
   - [ ] 影片可在網站內正常播放
   - [ ] 點擊「在 YouTube 播放」按鈕可在新分頁開啟 YouTube
   - [ ] 無 `youtubeVideoId` 的工作坊不顯示影片區塊

2. **UI/UX 面**
   - [ ] 影片保持 16:9 比例
   - [ ] 手機/平板/桌面響應式正常
   - [ ] 與現有頁面設計風格一致

3. **效能面**
   - [ ] iframe 採用 lazy loading
   - [ ] 不影響頁面初始載入速度

## 時程規劃

此 PRD 涵蓋單一功能，實作複雜度低，可由一位開發者完成。

## 參考資料

- [YouTube Embedded Players and Player Parameters](https://developers.google.com/youtube/player_parameters)
- [W3Schools - Responsive Iframes](https://www.w3schools.com/howto/howto_css_responsive_iframes.asp)
- [Intrinsic Ratio for Responsive Video](https://css-tricks.com/fluid-width-video/)

---

**文件版本**: 1.0
**建立日期**: 2026-01-31
**作者**: Claude Code
