# Chapter 16: 實施順序與依賴關係

[← 返回索引](./README.md) | [上一章](./ch15-responsive.md)

---

## 16.1 實施階段總覽

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

## 16.2 依賴關係圖

```
Ch06 (Database)
  │
  ├──→ Ch03 (Visual)
  │      │
  │      └──→ Ch04 (Entry Page) ──→ Ch07 (Recruit)
  │
  └──→ Ch05 (Password)
         │
         ├──→ Ch08 (Nunu Zone)
         │
         ├──→ Ch09 (Ambassador Zone)
         │
         └──→ Ch10 (Guardian Zone)
                │
                ├──→ Ch12 (Code Generator)
                │      │
                │      └──→ Ch11 (Checkin/Lunch)
                │
                └──→ Ch13 (Email System)

Ch14 (Animation) ←── 可在任何階段並行開發
Ch15 (Responsive) ←── 可在任何階段並行開發
```

## 16.3 預估複雜度

| Chapter | 複雜度 | 主要工作 |
|---------|--------|----------|
| 02 | 低 | 建立資料夾、移動檔案 |
| 03 | 中 | 視覺系統設計、Tailwind 配置 |
| 04 | 中 | 入口頁面組件開發 |
| 05 | 中 | 認證系統、Hook 開發 |
| 06 | 低 | SQL 執行、表建立 |
| 07 | 中 | 表單頁面開發 |
| 08 | 低 | Layout 添加、小幅修改 |
| 09 | 中 | 檔案遷移、連結更新 |
| 10 | 高 | 雙層密碼、活動列表 |
| 11 | 高 | 報到系統完整開發 |
| 12 | 中 | 編號生成邏輯 |
| 13 | 高 | 郵件 API、模板、發送邏輯 |
| 14 | 中 | CSS 動畫、Hook 開發 |
| 15 | 低 | CSS 調整、測試 |

## 16.4 新增檔案清單

```
/app
├── page.tsx                                    # 重寫（四角色選擇器）
├── loading.tsx                                 # 新增（全局載入）
│
├── components/ui/
│   ├── IdentitySelector.tsx                    # 新增
│   ├── IdentityCard.tsx                        # 新增
│   ├── PasswordModal.tsx                       # 新增
│   ├── NumericKeypad.tsx                       # 新增
│   ├── CodeInput.tsx                           # 新增
│   ├── SearchPopup.tsx                         # 新增
│   ├── ParticipantCard.tsx                     # 新增
│   ├── SuccessScreen.tsx                       # 新增
│   ├── CountUpNumber.tsx                       # 新增
│   └── Button.tsx                              # 新增（日系樣式）
│
├── hooks/
│   ├── useAuth.ts                              # 新增
│   ├── useCountUp.ts                           # 新增
│   └── useFormValidation.ts                    # 新增
│
├── lib/
│   ├── codeGenerator.ts                        # 新增
│   └── emailTemplates.ts                       # 新增
│
├── api/
│   └── email/
│       └── send/
│           └── route.ts                        # 新增
│
├── recruit/
│   └── page.tsx                                # 新增
│
├── nunu/
│   └── layout.tsx                              # 新增
│
├── ambassador/
│   ├── layout.tsx                              # 新增
│   ├── page.tsx                                # 新增
│   ├── missions/[id]/page.tsx                  # 移動
│   └── workshops/[id]/page.tsx                 # 移動
│
├── guardian/
│   ├── layout.tsx                              # 新增
│   ├── page.tsx                                # 新增
│   └── events/[id]/
│       ├── layout.tsx                          # 新增
│       ├── page.tsx                            # 新增
│       ├── checkin/page.tsx                    # 新增
│       ├── lunch/page.tsx                      # 新增
│       └── notify/page.tsx                     # 新增
│
└── types/
    ├── password.ts                             # 新增
    ├── partnership.ts                          # 新增
    ├── subscriber.ts                           # 新增
    └── email.ts                                # 新增

/supabase
├── access_passwords.sql                        # 新增
├── partnership_applications.sql                # 新增
├── newsletter_subscribers.sql                  # 新增
├── email_logs.sql                              # 新增
└── event_registrations_update.sql              # 新增

/docs/prd
├── README.md                                   # 索引
├── ch01-overview.md                            # 專案概述
├── ch02-architecture.md                        # 架構設計
├── ch03-visual-system.md                       # 視覺系統
├── ch04-identity-selector.md                   # 入口頁面
├── ch05-password-system.md                     # 密碼系統
├── ch06-database.md                            # 資料庫
├── ch07-recruit-page.md                        # 招募頁面
├── ch08-nunu-zone.md                           # 努努專區
├── ch09-ambassador-zone.md                     # 大使專區
├── ch10-guardian-zone.md                       # 守護者專區
├── ch11-checkin-lunch.md                       # 報到便當
├── ch12-code-generator.md                      # 編號生成
├── ch13-email-system.md                        # 郵件系統
├── ch14-animation.md                           # 動畫系統
├── ch15-responsive.md                          # 響應式設計
└── ch16-implementation.md                      # 實施順序
```

## 16.5 建議開始順序

1. **Chapter 06**：建立資料庫表（基礎）
2. **Chapter 03**：設定視覺系統（Tailwind）
3. **Chapter 05**：建立密碼驗證 Hook
4. **Chapter 04**：建立入口頁面
5. **依序完成其他章節**

---

準備好開始時，從 Chapter 06 開始執行。
