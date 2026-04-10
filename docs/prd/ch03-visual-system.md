# Chapter 3: 品牌視覺系統 - 日系簡約高級感

[← 返回索引](./README.md) | [上一章](./ch02-architecture.md) | [下一章 →](./ch04-identity-selector.md)

---

## 3.1 設計理念

參考日系設計美學，追求「留白」、「簡潔」、「質感」三大原則。

**設計關鍵字**：
- 極簡主義 (Minimalism)
- 負空間 (Negative Space)
- 柔和色調 (Soft Palette)
- 精緻細節 (Refined Details)
- 呼吸感 (Breathing Room)

## 3.2 色彩系統

```css
/* 主色調 - 日系藍灰 */
--color-primary: #4A5568;        /* 深灰藍 */
--color-primary-light: #718096;  /* 淺灰藍 */
--color-primary-dark: #2D3748;   /* 墨色 */

/* 強調色 - 和風金 */
--color-accent: #D69E2E;         /* 金茶色 */
--color-accent-light: #ECC94B;   /* 淺金 */

/* 背景色 - 和紙質感 */
--color-bg-primary: #FAFAF9;     /* 生成色（米白）*/
--color-bg-secondary: #F7F5F3;   /* 淺亞麻 */
--color-bg-card: #FFFFFF;        /* 純白 */

/* 文字色 */
--color-text-primary: #1A1A1A;   /* 墨黑 */
--color-text-secondary: #6B7280; /* 灰 */
--color-text-muted: #9CA3AF;     /* 淺灰 */

/* 狀態色 */
--color-success: #48BB78;        /* 若竹色（綠）*/
--color-warning: #ED8936;        /* 橙 */
--color-error: #E53E3E;          /* 緋色 */

/* 邊框 */
--color-border: #E5E7EB;         /* 淺灰線 */
--color-border-light: #F3F4F6;   /* 極淺線 */
```

## 3.3 字型系統

```css
/* 主要字型 - 日系無襯線 */
font-family:
  "Noto Sans JP",      /* 日文優先 */
  "Noto Sans TC",      /* 繁體中文 */
  "Inter",             /* 英文 */
  system-ui,
  sans-serif;

/* 字重 */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;

/* 字級 */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 2rem;      /* 32px */
--text-4xl: 2.5rem;    /* 40px */

/* 行高 */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;

/* 字距 */
--tracking-tight: -0.02em;
--tracking-normal: 0;
--tracking-wide: 0.05em;
```

## 3.4 間距系統

```css
/* 基於 8px 網格 */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

## 3.5 圓角與陰影

```css
/* 圓角 - 柔和但不過圓 */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;

/* 陰影 - 極淺的自然陰影 */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.02);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.04), 0 4px 6px rgba(0, 0, 0, 0.02);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.04), 0 8px 10px rgba(0, 0, 0, 0.02);

/* 懸停陰影 */
--shadow-hover: 0 8px 16px rgba(0, 0, 0, 0.06);
```

## 3.6 UI 組件風格

### 按鈕

```css
/* 主要按鈕 */
.btn-primary {
  background: var(--color-primary);
  color: white;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-weight: 500;
  letter-spacing: 0.02em;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-hover);
}

/* 次要按鈕 - 線框 */
.btn-secondary {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-border);
  padding: 11px 23px;
}

/* 幽靈按鈕 */
.btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
}
```

### 卡片

```css
.card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### 輸入框

```css
.input {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  font-size: var(--text-base);
  transition: border-color 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(74, 85, 104, 0.1);
}
```

## 3.7 視覺元素

### 分隔線

```css
.divider {
  height: 1px;
  background: var(--color-border-light);
  margin: var(--space-8) 0;
}
```

### 標籤

```css
.tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: var(--color-bg-secondary);
  border-radius: 100px;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}
```

## 3.8 Chain of Thought - 實施步驟

```
1. 更新 Tailwind 配置
   - 新增自定義顏色
   - 新增自定義字型
   - 新增自定義間距

2. 更新 globals.css
   - 設定 CSS 變數
   - 設定全局樣式
   - 設定基礎組件樣式

3. 安裝 Google Fonts
   - Noto Sans JP
   - Inter

4. 建立 UI 組件庫
   - Button 組件（多種變體）
   - Card 組件
   - Input 組件
   - Tag 組件

5. 更新現有組件
   - 套用新的視覺風格
   - 調整間距和顏色
```
