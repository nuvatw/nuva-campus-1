# Chapter 15: 響應式設計規範

[← 返回索引](./README.md) | [上一章](./ch14-animation.md) | [下一章 →](./ch16-implementation.md)

---

## 15.1 斷點定義

| 斷點 | 寬度 | 設備 |
|------|------|------|
| `sm` | ≥640px | 大手機 |
| `md` | ≥768px | 平板 |
| `lg` | ≥1024px | 筆電 |
| `xl` | ≥1280px | 桌面 |

## 15.2 佈局策略

### 入口頁面

```
手機（< 768px）：
- 單列垂直堆疊
- 全寬卡片
- 間距 16px

平板以上（≥ 768px）：
- 2x2 網格
- 或水平排列四張卡片
- 間距 24px
```

### 報到系統

```
手機（< 768px）：
- 全螢幕佈局
- 數字鍵盤占滿下半部
- 大按鈕（min 56px）

平板以上（≥ 768px）：
- 居中卡片式佈局
- 最大寬度 480px
- 數字鍵盤居中
```

### 守護者首頁

```
手機（< 768px）：
- 單列卡片
- 統計數字水平排列

平板以上（≥ 768px）：
- 雙列網格
- 更大的統計卡片
```

## 15.3 觸控優化

```css
/* 最小觸控區域 */
.touch-target {
  min-width: 44px;
  min-height: 44px;
}

/* 數字鍵盤按鈕 */
.keypad-btn {
  width: 72px;
  height: 56px;
}

@media (min-width: 768px) {
  .keypad-btn {
    width: 80px;
    height: 64px;
  }
}
```

## 15.4 手機專屬優化

```css
/* 防止 iOS Safari 底部工具列遮擋 */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

/* 防止橫向滾動 */
html, body {
  overflow-x: hidden;
}

/* 防止 iOS 自動縮放輸入框 */
input, textarea, select {
  font-size: 16px;
}

/* 禁用雙擊縮放 */
button, a {
  touch-action: manipulation;
}
```

## 15.5 容器最大寬度

```css
/* 內容容器 */
.container-sm { max-width: 640px; }
.container-md { max-width: 768px; }
.container-lg { max-width: 1024px; }
.container-xl { max-width: 1280px; }

/* 居中 */
.container {
  margin-left: auto;
  margin-right: auto;
  padding-left: 16px;
  padding-right: 16px;
}

@media (min-width: 768px) {
  .container {
    padding-left: 24px;
    padding-right: 24px;
  }
}
```

## 15.6 各頁面響應式規格

### 入口頁面

```tsx
// 手機：flex-col, 平板以上：grid-cols-2 或 flex-row
<div className="
  flex flex-col gap-4
  md:grid md:grid-cols-2 md:gap-6
  lg:flex lg:flex-row lg:gap-8
">
  {/* 四張卡片 */}
</div>
```

### 密碼 Modal

```tsx
// 手機全螢幕, 平板以上居中彈窗
<div className="
  fixed inset-0
  md:inset-auto md:top-1/2 md:left-1/2
  md:-translate-x-1/2 md:-translate-y-1/2
  md:w-[400px] md:rounded-xl
">
```

### 報到頁面

```tsx
// 數字鍵盤
<div className="
  fixed bottom-0 left-0 right-0 p-4
  md:relative md:mt-8
  safe-area-bottom
">
```

## 15.7 測試檢查清單

- [ ] iPhone SE (375px)
- [ ] iPhone 14 Pro (393px)
- [ ] iPhone 14 Pro Max (430px)
- [ ] iPad Mini (768px)
- [ ] iPad Pro (1024px)
- [ ] MacBook (1440px)
- [ ] Desktop (1920px)

## 15.8 Chain of Thought - 實施步驟

```
1. 審查所有頁面在手機上的表現
   - 使用 Chrome DevTools
   - 檢查觸控目標大小
   - 確認沒有水平滾動

2. 調整入口頁面佈局
   - 手機垂直堆疊
   - 平板以上水平排列

3. 優化報到系統觸控
   - 加大數字鍵盤按鈕
   - 確保 safe area

4. 優化表單頁面
   - 輸入框 16px 防縮放
   - 適當的間距

5. 測試各種設備尺寸
   - 使用真實設備測試
   - 確認動畫流暢
```
