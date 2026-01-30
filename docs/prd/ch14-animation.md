# Chapter 14: 動畫與過場效果系統

[← 返回索引](./README.md) | [上一章](./ch13-email-system.md) | [下一章 →](./ch15-responsive.md)

---

## 14.1 設計原則

遵循日系美學：
- **克制**：動畫簡潔，不過度
- **流暢**：使用 ease-out 曲線
- **有意義**：每個動畫都有目的
- **效能**：使用 transform 和 opacity

## 14.2 動畫時長規範

| 類型 | 時長 | 使用場景 |
|------|------|----------|
| 快速 | 150ms | 按鈕狀態、小元素 |
| 標準 | 250ms | 卡片、彈窗 |
| 慢速 | 400ms | 頁面過場、大元素 |

## 14.3 Easing 曲線

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
```

## 14.4 動畫清單

| 元素 | 動畫類型 | 觸發時機 |
|------|----------|----------|
| 入口卡片 | 依序淡入上滑 | 頁面載入 |
| 密碼輸入 | 淡入縮放 | Modal 開啟 |
| 數字輸入 | 柔和彈跳 | 輸入數字 |
| 錯誤提示 | 輕微震動 | 密碼錯誤 |
| 成功提示 | 淡入 + 勾選動畫 | 操作成功 |
| 卡片 hover | 微上浮 + 陰影 | 滑鼠懸停 |
| 統計數字 | 數字滾動 | 數值變化 |

## 14.5 CSS 動畫定義

```css
/* 淡入上滑 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 淡入縮放 */
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 輕微震動 */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}

/* 柔和彈跳 */
@keyframes softBounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* 勾選動畫 */
@keyframes drawCheck {
  to {
    stroke-dashoffset: 0;
  }
}

/* 淡出 */
@keyframes fadeOut {
  to {
    opacity: 0;
  }
}
```

## 14.6 Utility Classes

```css
/* 動畫基礎 */
.animate-fade-in-up {
  animation: fadeInUp 0.4s var(--ease-out) forwards;
}

.animate-fade-in-scale {
  animation: fadeInScale 0.25s var(--ease-out) forwards;
}

.animate-shake {
  animation: shake 0.4s ease-in-out;
}

.animate-soft-bounce {
  animation: softBounce 0.2s ease-out;
}

/* Stagger 延遲 */
.stagger-1 { animation-delay: 0.1s; }
.stagger-2 { animation-delay: 0.2s; }
.stagger-3 { animation-delay: 0.3s; }
.stagger-4 { animation-delay: 0.4s; }

/* 初始隱藏 */
.animate-initial {
  opacity: 0;
}
```

## 14.7 React Hook - useCountUp

```typescript
// /app/hooks/useCountUp.ts

import { useState, useEffect } from 'react';

export function useCountUp(
  target: number,
  duration: number = 1000,
  enabled: boolean = true
) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const startTime = Date.now();
    const startValue = count;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = Math.floor(startValue + (target - startValue) * eased);

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration, enabled]);

  return count;
}
```

## 14.8 成功勾選組件

```typescript
// /app/components/ui/SuccessCheck.tsx

export function SuccessCheck() {
  return (
    <div className="flex items-center justify-center">
      <svg
        className="w-16 h-16 text-success"
        viewBox="0 0 52 52"
      >
        <circle
          className="stroke-current"
          cx="26"
          cy="26"
          r="24"
          fill="none"
          strokeWidth="2"
        />
        <path
          className="stroke-current animate-draw-check"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14 27l8 8 16-16"
          style={{
            strokeDasharray: 50,
            strokeDashoffset: 50,
          }}
        />
      </svg>
    </div>
  );
}
```

## 14.9 Chain of Thought - 實施步驟

```
1. 更新 globals.css
   - 添加 CSS 變數（easing）
   - 添加 keyframes
   - 添加 utility classes

2. 建立動畫 Hook
   - useCountUp
   - useStaggerAnimation

3. 建立動畫組件
   - SuccessCheck
   - CountUpNumber
   - FadeInUp

4. 套用到各組件
   - 入口卡片
   - 密碼 Modal
   - 報到系統
   - 統計數字

5. 添加 prefers-reduced-motion 支援
   - 檢測用戶偏好
   - 禁用或簡化動畫
```
