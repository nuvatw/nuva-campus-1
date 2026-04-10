# NUVA Campus Design System Guide

> "Warm Precision" — A design language that balances operational clarity with emotional warmth.

---

## 1. Color System

### Primary — Teal
The core brand color. Used for primary actions, links, and key interactive elements.

| Token | Hex | Usage |
|-------|-----|-------|
| `primary-50` | `#F0FDFA` | Hover backgrounds, highlight areas |
| `primary-100` | `#CCFBF1` | Active backgrounds |
| `primary-200` | `#99F6E4` | Light accents |
| `primary-300` | `#5EEAD4` | Borders on hover |
| `primary-400` | `#2DD4BF` | Secondary buttons |
| `primary` / `primary-500` | `#14B8A6` | Default buttons, links, icons |
| `primary-600` | `#0D9488` | Primary CTA, active states |
| `primary-700` | `#0F766E` | Dark mode primary |
| `primary-800` | `#115E59` | Dark backgrounds |
| `primary-900` | `#134E4A` | Darkest teal |

### Secondary — Amber (Accent)
Energetic accent for highlights, badges, and attention-grabbing elements.

| Token | Hex | Usage |
|-------|-----|-------|
| `accent-50` | `#FFFBEB` | Light amber backgrounds |
| `accent-100` | `#FEF3C7` | Badge backgrounds |
| `accent` / `accent-500` | `#F59E0B` | Accent elements, highlights |
| `accent-600` | `#D97706` | Active accent states |

### Backgrounds
| Token | Hex | Usage |
|-------|-----|-------|
| `bg-primary` | `#FAFAF9` | Page background |
| `bg-secondary` | `#F5F5F4` | Section/card background |
| `bg-card` | `#FFFFFF` | Card surfaces |

### Text
| Token | Hex | Usage |
|-------|-----|-------|
| `text-primary` | `#1C1917` | Headings, primary content |
| `text-secondary` | `#57534E` | Body text, descriptions |
| `text-muted` | `#A8A29E` | Placeholders, captions, timestamps |

### Semantic Status
| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#16A34A` | Checked in, completed, positive |
| `success-light` | `#DCFCE7` | Success backgrounds |
| `warning` | `#CA8A04` | Caution, pending states |
| `warning-light` | `#FEF3C7` | Warning backgrounds |
| `error` | `#DC2626` | Errors, destructive actions, "run mode" |
| `error-light` | `#FEE2E2` | Error backgrounds |
| `info` | `#0D9488` | Informational (same as primary-600) |

### Borders
| Token | Hex | Usage |
|-------|-----|-------|
| `border` | `#E7E5E4` | Default borders, dividers |
| `border-light` | `#F5F5F4` | Subtle separators |

### Neutrals (Full Scale)
Direct access to the warm stone palette: `neutral-50` through `neutral-900`.

---

## 2. Typography

### Font Families
- **Display** (`font-display`): Sora — for headlines and hero text
- **Body** (`font-sans`): DM Sans — for body text and UI labels
- **Mono** (`font-mono`): JetBrains Mono — for code and data displays
- **CJK**: Noto Sans TC + Noto Sans JP — automatically mixed with Latin fonts

### Scale

**Display** (for hero sections, page titles):
| Class | Size | Weight |
|-------|------|--------|
| `text-display-2xl` | 4.5rem | 700 |
| `text-display-xl` | 3.75rem | 700 |
| `text-display-lg` | 3rem | 600 |
| `text-display-md` | 2.25rem | 600 |
| `text-display-sm` | 1.875rem | 600 |

**Heading** (for section headers, card titles):
| Class | Size | Weight |
|-------|------|--------|
| `text-heading-xl` | 1.5rem | 600 |
| `text-heading-lg` | 1.25rem | 600 |
| `text-heading-md` | 1.125rem | 500 |
| `text-heading-sm` | 1rem | 500 |

**Body** (for paragraphs, descriptions):
| Class | Size | Weight |
|-------|------|--------|
| `text-body-lg` | 1.125rem | 400 |
| `text-body-md` | 1rem | 400 |
| `text-body-sm` | 0.875rem | 400 |

**Caption / Overline**:
| Class | Size | Weight | Notes |
|-------|------|--------|-------|
| `text-caption` | 0.75rem | 500 | Timestamps, labels |
| `text-overline` | 0.75rem | 600 | Uppercase tracking, section tags |

---

## 3. Shadow Elevation System

Five levels of depth, plus colored variants for interactive elements.

| Token | Usage |
|-------|-------|
| `shadow-elevation-0` | Flat, no shadow |
| `shadow-elevation-1` | Subtle lift — default cards |
| `shadow-elevation-2` | Card resting state |
| `shadow-elevation-3` | Card hover state |
| `shadow-elevation-4` | Modals, drawers |
| `shadow-elevation-5` | Popups, tooltips |

**Colored Shadows** (for interactive elements on hover):
| Token | Color |
|-------|-------|
| `shadow-primary-glow` | Teal glow |
| `shadow-secondary-glow` | Amber glow |
| `shadow-success-glow` | Green glow |
| `shadow-error-glow` | Red glow |

---

## 4. Border Radius

| Token | Size | Usage |
|-------|------|-------|
| `rounded-sm` | 4px | Tags, badges |
| `rounded-md` | 8px | Inputs, small cards |
| `rounded-lg` | 12px | Standard cards, modals |
| `rounded-xl` | 16px | Large cards, sections |
| `rounded-2xl` | 20px | Hero cards, feature blocks |
| `rounded-full` | 9999px | Circular elements, pills |

---

## 5. Animation System

### CSS Animations (Tailwind)
| Class | Usage |
|-------|-------|
| `animate-enter` | Standard entrance (fade + slide up) |
| `animate-enter-scale` | Scale entrance (modals) |
| `animate-exit` | Standard exit (fade out) |
| `animate-shimmer` | Loading skeleton shimmer (directional) |
| `animate-shake` | Error feedback |
| `animate-soft-bounce` | Micro celebration |
| `animate-draw-check` | Checkmark SVG draw |
| `animate-spin-slow` | Slow rotation (3s) |

### Motion Library Springs (JS)
Import from `@/app/styles/tokens`:

```tsx
import { spring } from '@/app/styles/tokens';

// Available presets:
spring.tactile   // Interactive elements (buttons, cards)
spring.playful   // Celebrations, bouncy reveals
spring.gentle    // Layout transitions
spring.snappy    // Quick micro-interactions
spring.counter   // Animated number interpolation
```

### Motion Components
Import from `@/app/components/motion`:

```tsx
import { FadeIn, StaggerChildren, PageTransition, useReducedMotion } from '@/app/components/motion';

// FadeIn — animate a single element on viewport entry
<FadeIn delay={0.1} direction="up" offset={12}>
  <Card>...</Card>
</FadeIn>

// StaggerChildren — orchestrate sequential child entrances
<StaggerChildren>
  <StaggerChildren.Item>First</StaggerChildren.Item>
  <StaggerChildren.Item>Second</StaggerChildren.Item>
</StaggerChildren>

// Always respect reduced motion
const prefersReduced = useReducedMotion();
```

### Transition Durations
| Token | Duration | Usage |
|-------|----------|-------|
| `duration-micro` | 100ms | Button press |
| `duration-fast` | 200ms | Hover, focus |
| `duration-normal` | 300ms | Standard transitions |
| `duration-moderate` | 400ms | Entrance animations |
| `duration-slow` | 600ms | Orchestrated reveals |

### Easing Functions
| Token | Usage |
|-------|-------|
| `ease-default` | Material-style decelerate |
| `ease-in` | For exits |
| `ease-out` | For entrances |
| `ease-in-out` | Symmetric |

---

## 6. Component Library

### Core Components (`@/app/components/ui`)

| Component | Variants | Usage |
|-----------|----------|-------|
| `Button` | `primary`, `secondary`, `ghost`, `outline`, `gradient` | CTAs, actions |
| `Card` | `surface`, `elevated`, `interactive`, `hero` | Content containers |
| `Input` | `default`, `filled` | Form inputs with animated focus |
| `Badge` | `default`, `success`, `warning`, `error`, `info`, `accent` | Status indicators |
| `Modal` | — | Dialogs, forms |
| `DataTable` | — | Sortable, searchable tables |
| `AnimatedCounter` | — | Spring-interpolated counting |
| `StatsCard` | — | Metric display with AnimatedCounter |
| `EmptyState` | 6 illustrations | No-data states |
| `ErrorDisplay` | — | Error messages with retry |
| `Skeleton` | Multiple variants | Loading placeholders |

### Layout Components (`@/app/components/layout`)

| Component | Usage |
|-----------|-------|
| `SectionLayout` | Shared shell for guardian/nunu/fafa |
| `PageHeader` | 3 variants: centered, left, three-column |
| `Breadcrumbs` | Auto-generated from pathname |
| `BottomNav` | Mobile-only fixed bottom navigation |

### Operational Components (`@/app/components/operational`)

| Component | Usage |
|-----------|-------|
| `OperationalChecklist` | Config-driven checkin/lunch page |
| `ParticipantCard` | Participant display with status |
| `NumericKeypadEnhanced` | Touch-friendly number input |
| `CelebrationOverlay` | Success animation overlay |
| `FilterBar` | Animated filter pills |
| `DarkModeToggle` | Operational dark mode switch |

---

## 7. Usage Patterns

### Card with Hover Effect
```tsx
<div className="bg-bg-card rounded-2xl p-5 border border-border hover:border-primary-300 hover:shadow-lg transition-all duration-300">
  {/* content */}
</div>
```

### Section Label (Overline)
```tsx
<p className="text-[10px] text-primary tracking-widest uppercase font-medium">Section Name</p>
```

### Status Indicator
```tsx
// Success state
<div className="bg-success-light border-success/20 text-success">Checked In</div>

// Error state
<div className="bg-error-light border-error/20 text-error">Missing</div>
```

### Animated Entrance
```tsx
<FadeIn delay={0.1}>
  <StaggerChildren>
    {items.map(item => (
      <StaggerChildren.Item key={item.id}>
        <Card variant="interactive">{item.name}</Card>
      </StaggerChildren.Item>
    ))}
  </StaggerChildren>
</FadeIn>
```

### Loading Skeleton
```tsx
// Always use animate-shimmer, never animate-pulse
<div className="h-4 w-32 rounded-lg animate-shimmer bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%]" />
```

---

## 8. Accessibility

- All `AnimatedCounter` components include `aria-live="polite"` for screen readers
- `useReducedMotion()` hook respected throughout — animations disabled when user prefers
- Loading pages include `role="status" aria-label="頁面載入中"`
- Color contrast meets WCAG AA: muted text `#918882` on white achieves ~4.6:1
- Touch targets minimum 44x44px on interactive elements
- Filter counts use `aria-live="polite"` for dynamic updates

---

## 9. Dark Mode (Operational)

Operational pages (checkin, lunch) support a scoped dark mode via `.operational-dark` class on `<html>`. Toggle with the `DarkModeToggle` component.

Dark mode overrides CSS variables for bg, text, border, and shimmer colors. It does NOT affect public-facing pages.
