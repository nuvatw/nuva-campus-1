# Chapter 2: 新網站架構設計

[← 返回索引](./README.md) | [上一章](./ch01-overview.md) | [下一章 →](./ch03-visual-system.md)

---

## 2.1 新 Site Map

```
/                              # 入口頁面（四角色選擇器）
│
├── /nunu                      # 努努專區（需密碼）
│   ├── /                      # 努努首頁（活動列表）
│   └── /events/[id]           # 活動詳情
│       └── /run               # 活動執行模式
│
├── /ambassador                # 校園大使專區（需密碼）
│   ├── /                      # 大使首頁（任務、工作坊、狀態）
│   ├── /missions/[id]         # 任務詳情
│   └── /workshops/[id]        # 工作坊詳情
│
├── /guardian                  # 守護者專區（需密碼）
│   ├── /                      # 守護者首頁（ongoing 活動列表）
│   └── /events/[id]           # 活動執行介面（需活動專屬密碼）
│       ├── /                  # 執行團隊首頁
│       ├── /checkin           # 參與者報到
│       ├── /lunch             # 便當領取
│       └── /notify            # 發送通知
│
└── /recruit                   # 校園計劃招募頁（公開）
    └── /                      # 合作申請 + 訂閱表單
```

## 2.2 密碼層級結構

```
首頁入口
├── 努努 ──────────── 密碼驗證（從 DB 讀取）
├── 校園大使 ──────── 密碼驗證（從 DB 讀取）
├── 守護者 ──────────┬ 第一層密碼（進入守護者專區）
│                    └ 第二層密碼（進入特定活動）
└── 都不是 ────────── 無需密碼
```

## 2.3 路由對照表

| 舊路由 | 新路由 | 說明 |
|--------|--------|------|
| `/` | `/` | 改為四角色選擇器 |
| `/missions/[id]` | `/ambassador/missions/[id]` | 移至大使專區 |
| `/workshops/[id]` | `/ambassador/workshops/[id]` | 移至大使專區 |
| `/nunu` | `/nunu` | 保持不變，加密碼保護 |
| - | `/guardian` | 新增守護者專區 |
| - | `/recruit` | 新增招募頁面 |

## 2.4 Chain of Thought - 實施步驟

```
1. 建立新的資料夾結構
   - 建立 /app/ambassador/ 目錄
   - 建立 /app/guardian/ 目錄
   - 建立 /app/recruit/ 目錄

2. 移動現有檔案
   - 將 /app/missions/ 移至 /app/ambassador/missions/
   - 將 /app/workshops/ 移至 /app/ambassador/workshops/

3. 更新所有內部連結
   - 更新 MissionGrid.tsx 中的導航連結
   - 更新 WorkshopCard.tsx 中的導航連結

4. 建立新的首頁入口選擇器
   - 重寫 /app/page.tsx

5. 建立專區首頁
   - /app/ambassador/page.tsx（移植現有首頁內容）
   - /app/guardian/page.tsx（新建）
   - /app/recruit/page.tsx（新建）
```
