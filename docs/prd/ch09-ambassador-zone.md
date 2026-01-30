# Chapter 9: 校園大使專區重構

[← 返回索引](./README.md) | [上一章](./ch08-nunu-zone.md) | [下一章 →](./ch10-guardian-zone.md)

---

## 9.1 功能描述

將現有首頁的校園大使相關內容移至專屬專區，加入密碼保護。

## 9.2 遷移內容

從原首頁遷移：
- MissionGrid 任務網格
- WorkshopSection 工作坊區塊
- AmbassadorStatus 大使存活狀態
- ContactCard 聯繫卡片

## 9.3 專區首頁結構

```
┌─────────────────────────────────────────────────────────────┐
│  [← 返回首頁]                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    校園大使專區                              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  任務進度                                                   │
│  ─────────                                                  │
│  [MissionGrid 組件]                                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  工作坊                                                     │
│  ──────                                                     │
│  [WorkshopSection 組件]                                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  大使存活狀態                                                │
│  ───────────                                                │
│  [AmbassadorStatus 組件]                                    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [ContactCard 組件]                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 9.4 路由結構

```
/ambassador                     # 大使首頁（受保護）
/ambassador/missions/[id]       # 任務詳情
/ambassador/workshops/[id]      # 工作坊詳情
```

## 9.5 檔案遷移對照

| 原路徑 | 新路徑 |
|--------|--------|
| `/app/missions/[id]/page.tsx` | `/app/ambassador/missions/[id]/page.tsx` |
| `/app/workshops/[id]/page.tsx` | `/app/ambassador/workshops/[id]/page.tsx` |

## 9.6 需要更新的連結

```typescript
// MissionGrid.tsx
// 舊: href={`/missions/${mission.id}`}
// 新: href={`/ambassador/missions/${mission.id}`}

// WorkshopCard.tsx
// 舊: href={`/workshops/${workshop.id}`}
// 新: href={`/ambassador/workshops/${workshop.id}`}
```

## 9.7 Chain of Thought - 實施步驟

```
1. 建立資料夾結構
   - mkdir /app/ambassador
   - mkdir /app/ambassador/missions
   - mkdir /app/ambassador/workshops

2. 建立 /app/ambassador/layout.tsx
   - 加入 AuthGuard 組件
   - 檢查 ambassador 權限

3. 建立 /app/ambassador/page.tsx
   - 從原 /app/page.tsx 複製內容
   - 加入返回首頁按鈕
   - 套用日系風格

4. 移動任務相關檔案
   - /app/missions/[id]/ → /app/ambassador/missions/[id]/

5. 移動工作坊相關檔案
   - /app/workshops/[id]/ → /app/ambassador/workshops/[id]/

6. 更新組件內部連結
   - MissionGrid 中的連結
   - WorkshopCard 中的連結

7. 刪除舊的資料夾
   - /app/missions/
   - /app/workshops/

8. 測試完整流程
```
