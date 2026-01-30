# NUVA Campus 網站全面重構計劃書

> **版本**: 2.0
> **日期**: 2026-01-29
> **狀態**: 進行中

---

## 專案摘要

將現有網站重構為有明確身份區分的品牌互動區，支援四種角色：努努、校園大使、守護者、一般訪客。

### 核心目標

- 日系簡約高級感的視覺設計
- 資料庫驅動的密碼系統
- 守護者專區（活動報到、便當領取）
- 郵件通知系統（報到編號）
- 絲滑動畫與完美響應式

### 密碼結構

| 角色 | 密碼 | 說明 |
|------|------|------|
| 努努 | `0812` | 從 DB 讀取 |
| 校園大使 | `2180` | 從 DB 讀取 |
| 守護者 | `0001` | 第一層入口 |
| WS02 活動 | `0202` | 第二層活動專屬 |

---

## 章節索引

| 章節 | 標題 | 複雜度 | 狀態 |
|------|------|--------|------|
| [01](./ch01-overview.md) | 專案概述 | - | - |
| [02](./ch02-architecture.md) | 新網站架構設計 | 低 | 待開始 |
| [03](./ch03-visual-system.md) | 品牌視覺系統 - 日系簡約高級感 | 中 | 待開始 |
| [04](./ch04-identity-selector.md) | 入口頁面 - 四角色身份選擇器 | 中 | 待開始 |
| [05](./ch05-password-system.md) | 密碼驗證系統（資料庫驅動） | 中 | 待開始 |
| [06](./ch06-database.md) | Supabase 資料庫擴充 | 低 | 待開始 |
| [07](./ch07-recruit-page.md) | 校園計劃招募頁面 | 中 | 待開始 |
| [08](./ch08-nunu-zone.md) | 努努專區重構 | 低 | 待開始 |
| [09](./ch09-ambassador-zone.md) | 校園大使專區重構 | 中 | 待開始 |
| [10](./ch10-guardian-zone.md) | 守護者專區 | 高 | 待開始 |
| [11](./ch11-checkin-lunch.md) | 活動報到與便當系統 | 高 | 待開始 |
| [12](./ch12-code-generator.md) | 報到編號生成系統 | 中 | 待開始 |
| [13](./ch13-email-system.md) | 郵件通知系統 | 高 | 待開始 |
| [14](./ch14-animation.md) | 動畫與過場效果系統 | 中 | 待開始 |
| [15](./ch15-responsive.md) | 響應式設計規範 | 低 | 待開始 |
| [16](./ch16-implementation.md) | 實施順序與依賴關係 | - | - |

---

## 實施階段

```
階段 1：基礎建設
├── Chapter 06：Supabase 資料庫擴充
├── Chapter 03：品牌視覺系統
└── Chapter 05：密碼驗證系統

階段 2：核心頁面
├── Chapter 02：網站架構（資料夾）
├── Chapter 04：入口頁面
├── Chapter 07：校園計劃招募頁面
├── Chapter 08：努努專區重構
└── Chapter 09：校園大使專區重構

階段 3：守護者功能
├── Chapter 10：守護者專區
├── Chapter 12：報到編號生成
├── Chapter 11：報到與便當系統
└── Chapter 13：郵件通知系統

階段 4：優化
├── Chapter 14：動畫系統
└── Chapter 15：響應式設計
```

---

## 環境變數

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# 郵件服務 (Resend)
RESEND_API_KEY=your_resend_api_key

# 測試郵件收件人
TEST_EMAIL_RECIPIENT=ceo@meetnuva.com
```

---

## 新增檔案總覽

詳見 [Chapter 16](./ch16-implementation.md) 的完整檔案清單。
