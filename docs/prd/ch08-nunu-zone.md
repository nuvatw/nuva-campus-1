# Chapter 8: 努努專區重構

[← 返回索引](./README.md) | [上一章](./ch07-recruit-page.md) | [下一章 →](./ch09-ambassador-zone.md)

---

## 8.1 功能描述

努努專區保持現有功能，加入密碼保護機制，更新視覺風格。

## 8.2 現有功能保留

- 活動列表頁面 (`/nunu`)
- 活動詳情儀表板 (`/nunu/events/[id]`)
- 活動執行模式 (`/nunu/events/[id]/run`)
- Nunu 報名表單
- 即時數據同步

## 8.3 新增功能

- 密碼保護（從 DB 讀取，預設 0812）
- 日系風格視覺更新
- 返回首頁按鈕

## 8.4 路由結構

```
/nunu                      # 活動列表（受保護）
/nunu/events/[id]          # 活動詳情
/nunu/events/[id]/run      # 執行模式
```

## 8.5 Layout 結構

```typescript
// /app/nunu/layout.tsx
import { AuthGuard } from '@/app/components/AuthGuard';

export default function NunuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard roleKey="nunu">
      <div className="min-h-screen bg-bg-primary">
        <header className="p-4">
          <a href="/" className="text-text-secondary hover:text-text-primary">
            ← 返回首頁
          </a>
        </header>
        <main>{children}</main>
      </div>
    </AuthGuard>
  );
}
```

## 8.6 Chain of Thought - 實施步驟

```
1. 建立 /app/nunu/layout.tsx
   - 加入 AuthGuard 組件
   - 檢查 nunu 權限

2. 更新視覺風格
   - 套用日系配色
   - 更新卡片樣式
   - 調整間距

3. 更新 /app/nunu/page.tsx
   - 加入返回首頁按鈕
   - 更新標題樣式

4. 測試完整流程
   - 首頁進入
   - 密碼驗證
   - 頁面瀏覽
```
