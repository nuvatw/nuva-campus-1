# NUVA Campus UI/UX 全面優化執行計畫

> 版本: 1.0
> 日期: 2026-01-30
> 狀態: 待執行

---

## 一、現況分析摘要

### 1.1 專案規模
- **頁面數量**: 15+ 頁面
- **元件數量**: 14 個 UI 元件
- **設計系統**: 已有基礎 Design Tokens (色彩、字型、間距)
- **框架**: Next.js 16 + Tailwind CSS

### 1.2 現有優點
| 項目 | 評分 | 說明 |
|-----|------|------|
| 色彩系統 | ★★★★☆ | 日式極簡風格，對比度良好 (9.8:1) |
| 響應式設計 | ★★★★☆ | Mobile-first 實作良好 |
| 動畫系統 | ★★★☆☆ | 有基礎動畫，但未完全尊重 reduced-motion |
| 即時資料 | ★★★★★ | SWR + Supabase Realtime 實作完善 |
| 載入狀態 | ★★★★☆ | Skeleton loading 使用得當 |

### 1.3 待改善問題

#### 嚴重問題 (Critical)
| 問題 | 位置 | 影響 |
|-----|------|------|
| 色彩作為唯一狀態指示 | MissionGrid.tsx:136 | 色盲用戶無法區分狀態 |
| Modal 缺少 ARIA 屬性 | PasswordModal.tsx:158 | 螢幕閱讀器無法正確解讀 |
| div onClick 代替 button | AmbassadorStatus.tsx:26 | 鍵盤導航失效 |

#### 高優先問題 (High)
| 問題 | 位置 | 影響 |
|-----|------|------|
| 圖示按鈕缺少 aria-label | 全站 20+ 處 | 輔助技術無法描述 |
| Keypad 重複實作 | 3 個不同檔案 | 維護困難、不一致 |
| Hero 動畫忽略 reduced-motion | Hero.tsx:20-35 | 動暈症用戶不適 |

#### 中優先問題 (Medium)
| 問題 | 位置 | 影響 |
|-----|------|------|
| 無 skip-to-content 連結 | 全站 | 鍵盤用戶效率低 |
| lg/xl 斷點使用不足 | 全站 | 大螢幕體驗未優化 |
| 硬編碼色彩值 | 多處使用 gray-800 | Design Token 一致性差 |

---

## 二、研究洞察

### 2.1 2025 Dashboard UI/UX 趨勢

根據 [Admin Dashboard UI/UX Best Practices 2025](https://medium.com/@CarlosSmith24/admin-dashboard-ui-ux-best-practices-for-2025-8bdc6090c57d) 和 [Dashboard Design Guide 2025](https://www.designstudiouiux.com/blog/dashboard-ui-design-guide/)：

**關鍵原則:**
1. **即時互動性** - 用戶期望 real-time 資料更新 ✓ (已實作)
2. **漸進式揭露** - 先顯示摘要，詳情按需載入 ✓ (Dashboard 可展開)
3. **Mobile-First** - 觸控友善、大點擊區域 ⚠️ (部分實作)
4. **AI 整合** - 預測分析、異常偵測 ✗ (未實作)

### 2.2 元件庫最佳實踐

根據 [React + Tailwind Component Libraries 2025](https://medium.com/@mernstackdevbykevin/react-tailwind-building-scalable-component-libraries-that-actually-ship-a7b00d07f260)：

**推薦架構:**
```
Design Tokens (tailwind.config.ts)
    ↓
Primitive Components (Button, Input, Card)
    ↓
Composite Components (NumericKeypad, Modal)
    ↓
Feature Components (CheckinFlow, MissionGrid)
```

**推薦工具:**
- [shadcn/ui](https://ui.shadcn.com/) - 可自訂、無障礙的元件
- [Radix UI](https://www.radix-ui.com/) - Headless 元件，完整 a11y
- [Headless UI](https://headlessui.com/) - 官方 Tailwind 整合

### 2.3 活動管理 App UX 要點

根據 [Event Management UI/UX Design](https://flatirons.com/services/event-management-ui-ux-design/)：

**報到體驗優化:**
- 支援條碼/QR Code 掃描
- 姓名搜尋輔助（不只數字碼）
- 批次操作功能
- 即時同步指示

---

## 三、設計系統強化

### 3.1 Design Tokens 完善

```typescript
// tailwind.config.ts 新增

const tokens = {
  // 語義化色彩 (新增)
  colors: {
    // 互動狀態
    interactive: {
      default: '#4A5568',
      hover: '#2D3748',
      active: '#1A202C',
      disabled: '#A0AEC0',
    },
    // 表面色彩
    surface: {
      elevated: '#FFFFFF',
      default: '#FAFAF9',
      sunken: '#F7F5F3',
      inverse: '#1A1A1A',
    },
    // 回饋狀態 (完善)
    feedback: {
      info: { bg: '#EBF8FF', text: '#2B6CB0', border: '#90CDF4' },
      success: { bg: '#C6F6D5', text: '#22543D', border: '#48BB78' },
      warning: { bg: '#FEEBC8', text: '#744210', border: '#ED8936' },
      error: { bg: '#FED7D7', text: '#742A2A', border: '#E53E3E' },
    },
  },

  // 動畫時長 Token
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
  },

  // 緩動函數
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // 層級系統
  zIndex: {
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    modalBackdrop: 40,
    modal: 50,
    popover: 60,
    tooltip: 70,
  },
};
```

### 3.2 間距規範

```css
/* 區塊間距標準 */
--section-gap-mobile: 3rem;    /* 48px */
--section-gap-desktop: 4rem;   /* 64px */

/* 元件內間距標準 */
--card-padding-mobile: 1rem;   /* 16px */
--card-padding-desktop: 1.5rem; /* 24px */

/* 元素間距標準 */
--element-gap-tight: 0.5rem;   /* 8px */
--element-gap-normal: 1rem;    /* 16px */
--element-gap-loose: 1.5rem;   /* 24px */
```

### 3.3 字型層級

| 層級 | 桌面 | 手機 | 用途 |
|-----|------|------|------|
| Display | 3rem (48px) | 2rem (32px) | 主標題、Hero |
| H1 | 2rem (32px) | 1.5rem (24px) | 頁面標題 |
| H2 | 1.5rem (24px) | 1.25rem (20px) | 區塊標題 |
| H3 | 1.25rem (20px) | 1.125rem (18px) | 卡片標題 |
| Body | 1rem (16px) | 1rem (16px) | 內文 |
| Caption | 0.875rem (14px) | 0.75rem (12px) | 說明文字 |

---

## 四、元件庫重構

### 4.1 基礎元件 (Primitives)

#### Button 元件標準化

```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

// 尺寸規範
const sizes = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-base gap-2',
  lg: 'h-12 px-6 text-lg gap-2.5',
};

// 變體規範
const variants = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  secondary: 'bg-transparent border-2 border-primary text-primary hover:bg-primary/5',
  ghost: 'bg-transparent text-text-secondary hover:bg-bg-secondary',
  danger: 'bg-error text-white hover:bg-error/90',
};
```

#### Input 元件標準化

```typescript
// components/ui/Input.tsx
interface InputProps {
  type: 'text' | 'email' | 'tel' | 'password' | 'number';
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  isRequired?: boolean;
  isDisabled?: boolean;
}
```

#### Modal 元件 (a11y 強化)

```typescript
// components/ui/Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

// 關鍵 a11y 屬性
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby={titleId}
  aria-describedby={descriptionId}
>
  {/* Focus trap 實作 */}
  {/* ESC 關閉 */}
  {/* 點擊外部關閉 */}
</div>
```

### 4.2 複合元件整合

#### NumericKeypad 統一版

```typescript
// components/ui/NumericKeypad.tsx (重構)
interface NumericKeypadProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  showConfirm?: boolean;
  onConfirm?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// 尺寸變體
const sizes = {
  sm: { button: 'w-14 h-12', gap: 'gap-2', maxWidth: 'max-w-[200px]' },
  md: { button: 'w-[72px] h-14', gap: 'gap-3', maxWidth: 'max-w-[240px]' },
  lg: { button: 'w-20 h-16', gap: 'gap-4', maxWidth: 'max-w-[280px]' },
};
```

**整合三個實作:**
- PasswordModal.tsx → 使用 NumericKeypad
- AuthGuard.tsx → 使用 NumericKeypad
- 獨立使用 → NumericKeypad

### 4.3 功能元件強化

#### MissionGrid 狀態可視化修復

```tsx
// 修復：加入文字標籤
<div className="flex items-center gap-2">
  <div className="w-4 h-4 bg-success-light border-2 border-success rounded" />
  <span className="text-sm text-text-secondary">已完成</span>
</div>
<div className="flex items-center gap-2">
  <div className="w-4 h-4 bg-primary/20 border-2 border-primary rounded" />
  <span className="text-sm text-text-secondary">進行中</span>
</div>
<div className="flex items-center gap-2">
  <div className="w-4 h-4 bg-bg-secondary border-2 border-border rounded" />
  <span className="text-sm text-text-secondary">未開放</span>
</div>
```

---

## 五、無障礙改善 (a11y)

### 5.1 ARIA 標籤清單

#### 緊急修復項目

| 元件 | 修復內容 | 優先級 |
|-----|---------|--------|
| PasswordModal | 加入 `role="dialog"`, `aria-modal="true"` | P0 |
| 所有關閉按鈕 | 加入 `aria-label="關閉"` | P0 |
| 返回按鈕 | 加入 `aria-label="返回上一頁"` | P1 |
| NumericKeypad 退格 | 已有 `aria-label="退格"` ✓ | - |
| 狀態圖示 | 加入 `aria-label` 描述狀態 | P0 |

#### 新增 ARIA Live Regions

```tsx
// MissionGrid - 倒數計時
<div aria-live="polite" aria-atomic="true">
  <span className="sr-only">距離截止還有</span>
  {countdown}
</div>

// 報到統計
<div aria-live="polite">
  已報到 {checkedIn} / {total} 人
</div>
```

### 5.2 鍵盤導航

#### Skip Link 實作

```tsx
// app/layout.tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
             focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2
             focus:rounded-lg"
>
  跳至主要內容
</a>

// 各頁面 main
<main id="main-content" tabIndex={-1}>
  {children}
</main>
```

#### Focus Trap (Modal)

```typescript
// hooks/useFocusTrap.ts
export function useFocusTrap(ref: RefObject<HTMLElement>, isActive: boolean) {
  useEffect(() => {
    if (!isActive || !ref.current) return;

    const focusableElements = ref.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    ref.current.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      ref.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref, isActive]);
}
```

### 5.3 Reduced Motion 支援

```css
/* globals.css - 強化版 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* 保留必要的過渡（如 focus 指示） */
  :focus {
    transition-duration: 150ms !important;
  }
}
```

```tsx
// hooks/useReducedMotion.ts
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

// 使用
const reducedMotion = useReducedMotion();
const animationClass = reducedMotion ? '' : 'animate-fade-in-up';
```

---

## 六、行動體驗優化

### 6.1 觸控目標尺寸

```css
/* 最小觸控目標 44x44px (WCAG 2.5.5) */
.touch-target {
  min-width: 44px;
  min-height: 44px;
}

/* 按鈕增強 */
.btn-primary, .btn-secondary {
  min-height: 44px;
  padding-left: 1rem;
  padding-right: 1rem;
}

/* 連結增強 */
a.touch-target {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  margin: -0.5rem; /* 擴大點擊區域但不影響視覺 */
}
```

### 6.2 手勢支援

```typescript
// hooks/useSwipe.ts
export function useSwipe(
  ref: RefObject<HTMLElement>,
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  threshold = 50
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let startX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const diff = endX - startX;

      if (Math.abs(diff) > threshold) {
        if (diff > 0) onSwipeRight?.();
        else onSwipeLeft?.();
      }
    };

    el.addEventListener('touchstart', handleTouchStart);
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [ref, onSwipeLeft, onSwipeRight, threshold]);
}
```

### 6.3 Safe Area 完整支援

```css
/* 底部安全區域 */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

/* 浮動按鈕位置 */
.floating-action-button {
  position: fixed;
  bottom: calc(1rem + env(safe-area-inset-bottom, 0));
  right: 1rem;
}

/* 底部導航 */
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
```

### 6.4 響應式斷點擴展

```css
/* 現有 */
sm: 640px
md: 768px
lg: 1024px

/* 新增 */
xl: 1280px  /* 大螢幕筆電 */
2xl: 1536px /* 桌面顯示器 */
```

**使用建議:**
```tsx
// 容器最大寬度擴展
<div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">

// 網格欄位擴展
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">

// 字體大小擴展
<h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl">
```

---

## 七、互動回饋強化

### 7.1 Toast 通知系統

```typescript
// components/ui/Toast.tsx
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

// hooks/useToast.ts
const toast = useToast();
toast.success('報到成功', { description: '歡迎參加活動！' });
toast.error('操作失敗', { description: '請稍後再試' });
```

### 7.2 進度指示器

```typescript
// components/ui/Progress.tsx
interface ProgressProps {
  value: number;         // 0-100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  animate?: boolean;
}

// 使用
<Progress value={checkedIn} max={total} showLabel />
// 顯示: "42/52 (81%)"
```

### 7.3 空狀態設計

```typescript
// components/ui/EmptyState.tsx
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// 使用
<EmptyState
  icon={<CalendarIcon className="w-12 h-12 text-text-muted" />}
  title="目前沒有進行中的活動"
  description="新活動將在這裡顯示"
  action={{
    label: '查看歷史活動',
    onClick: () => router.push('/history'),
  }}
/>
```

### 7.4 骨架屏標準化

```typescript
// components/ui/Skeleton.tsx
interface SkeletonProps {
  variant: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

// 組合使用
function CardSkeleton() {
  return (
    <div className="card">
      <Skeleton variant="rectangular" height={120} />
      <div className="mt-4 space-y-2">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
  );
}
```

---

## 八、頁面特定優化

### 8.1 首頁 (Role Selection)

**現有問題:**
- 法法角色鎖定無說明
- 密碼 Modal 缺少無障礙

**優化方案:**
```tsx
// 鎖定說明 Tooltip
<IdentityCard
  isLocked={true}
  lockReason="即將開放，敬請期待"
/>

// 改善後的 Lock Overlay
<div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
  <div className="text-center text-white">
    <LockIcon className="w-8 h-8 mx-auto mb-2" />
    <p className="text-sm font-medium">即將開放</p>
  </div>
</div>
```

### 8.2 報到頁面 (Check-in)

**現有問題:**
- 只能用數字碼查詢
- 無批次操作

**優化方案:**
```tsx
// 新增搜尋模式切換
<div className="flex gap-2 mb-4">
  <button
    className={mode === 'code' ? 'btn-primary' : 'btn-secondary'}
    onClick={() => setMode('code')}
  >
    編號查詢
  </button>
  <button
    className={mode === 'name' ? 'btn-primary' : 'btn-secondary'}
    onClick={() => setMode('name')}
  >
    姓名搜尋
  </button>
</div>

// 姓名搜尋模式
{mode === 'name' && (
  <input
    type="text"
    placeholder="輸入姓名搜尋..."
    className="input w-full"
    onChange={handleSearch}
  />
)}
```

### 8.3 Dashboard 資料表格

**現有問題:**
- 無排序功能
- 無篩選功能
- 無分頁

**優化方案:**
```tsx
// components/ui/DataTable.tsx
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  sortable?: boolean;
  filterable?: boolean;
  pagination?: {
    pageSize: number;
    pageSizes?: number[];
  };
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
}

// 使用
<DataTable
  data={registrations}
  columns={[
    { key: 'participant_name', label: '姓名', sortable: true },
    { key: 'participant_email', label: 'Email', sortable: true },
    { key: 'attended', label: '報到', render: (v) => v ? '✓' : '-' },
  ]}
  pagination={{ pageSize: 20 }}
  selectable
  onSelectionChange={handleBatchAction}
/>
```

---

## 九、效能優化

### 9.1 圖片優化

```tsx
// next.config.ts
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128],
  },
};

// 使用
<Image
  src="/hero-image.jpg"
  alt="描述文字"
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL={blurDataURL}
  priority={isAboveFold}
/>
```

### 9.2 字型優化

```tsx
// app/layout.tsx
import { Noto_Sans_JP, Noto_Sans_TC, Inter } from 'next/font/google';

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-jp',
  display: 'swap',
  preload: true,
});

const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-tc',
  display: 'swap',
});
```

### 9.3 Bundle 優化

```tsx
// 動態載入重型元件
const PieChart = dynamic(() => import('@/components/ui/PieChart'), {
  loading: () => <Skeleton variant="circular" width={200} height={200} />,
  ssr: false,
});

const MarkdownRenderer = dynamic(() => import('@/components/ui/MarkdownRenderer'), {
  loading: () => <Skeleton variant="rectangular" height={300} />,
});
```

---

## 十、執行計畫

### Phase 1: 緊急修復 (Week 1)
- [ ] 修復 Modal ARIA 屬性
- [ ] 加入所有 aria-label
- [ ] 修復 div onClick → button
- [ ] 加入色彩狀態的文字替代
- [ ] 實作 Skip Link

### Phase 2: 元件重構 (Week 1-2)
- [ ] 統一 NumericKeypad 實作
- [ ] 建立 Button 標準元件
- [ ] 建立 Input 標準元件
- [ ] 建立 Modal 標準元件 (含 Focus Trap)
- [ ] 建立 Toast 系統

### Phase 3: 設計系統強化 (Week 2)
- [ ] 完善 Design Tokens
- [ ] 移除硬編碼色彩值
- [ ] 標準化間距使用
- [ ] 擴展響應式斷點

### Phase 4: 互動優化 (Week 2-3)
- [ ] 實作 reduced-motion 支援
- [ ] 優化載入狀態
- [ ] 加入 EmptyState 元件
- [ ] 強化錯誤回饋

### Phase 5: 功能增強 (Week 3)
- [ ] 報到頁面姓名搜尋
- [ ] Dashboard 資料表格升級
- [ ] 批次操作功能

### Phase 6: 效能優化 (Week 3-4)
- [ ] 圖片優化
- [ ] 字型優化
- [ ] 動態載入優化
- [ ] Lighthouse 審計

---

## 十一、成功指標

| 指標 | 現狀 | 目標 |
|-----|------|------|
| Lighthouse Accessibility | ~75 | >95 |
| Lighthouse Performance | ~80 | >90 |
| WCAG 2.1 AA 符合度 | 60% | 100% |
| 首次內容繪製 (FCP) | ~1.5s | <1.0s |
| 最大內容繪製 (LCP) | ~2.5s | <1.5s |
| 累積版面位移 (CLS) | ~0.15 | <0.1 |

---

## 十二、參考資源

### 研究來源
- [Admin Dashboard UI/UX Best Practices 2025](https://medium.com/@CarlosSmith24/admin-dashboard-ui-ux-best-practices-for-2025-8bdc6090c57d)
- [Mobile Dashboard UI Best Practices](https://www.toptal.com/designers/dashboard-design/mobile-dashboard-ui)
- [React + Tailwind Component Libraries](https://medium.com/@mernstackdevbykevin/react-tailwind-building-scalable-component-libraries-that-actually-ship-a7b00d07f260)
- [Event Management UI/UX Design](https://flatirons.com/services/event-management-ui-ux-design/)
- [SWR with Next.js](https://swr.vercel.app/docs/with-nextjs)

### 推薦工具
- [shadcn/ui](https://ui.shadcn.com/) - 元件庫
- [Radix UI](https://www.radix-ui.com/) - Headless 元件
- [Tailwind UI](https://tailwindui.com/) - 官方模板
- [Axe DevTools](https://www.deque.com/axe/) - a11y 測試

---

*此文件將隨專案進展持續更新*
