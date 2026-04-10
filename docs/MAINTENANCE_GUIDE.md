# NUVA Campus Maintenance Guide

Development conventions and coding standards for the NUVA Campus project.

---

## 1. File Size Limits

| Type | Target | Hard Limit |
|------|--------|------------|
| Page files (`page.tsx`) | < 100 lines | < 200 lines |
| Components | < 150 lines | < 200 lines |
| Hooks | < 80 lines | < 120 lines |
| Service files | < 150 lines | < 250 lines |
| Utility/lib files | < 100 lines | < 200 lines |

**Current exceptions** (documented, justified):
- `OperationalChecklist.tsx` (461 lines) — shared component replacing 2 full pages of duplicate code
- `DataTable.tsx` (392 lines) — generic table component with tightly coupled search/sort/pagination
- Several page files (300-400 lines) — enhanced with animation, motion, and improved UX

**When a file exceeds limits:**
1. Extract hooks to `app/hooks/` or a co-located `hooks/` directory
2. Extract sub-components to a co-located `components/` directory
3. Keep the page file as a thin orchestrator (data fetching + layout)

---

## 2. Component Conventions

### Naming
- **Components**: PascalCase (`ParticipantCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useMissions.ts`)
- **Types**: PascalCase, descriptive (`NunuEventRegistration`)
- **Files**: Match the primary export name

### Directory Structure

For simple components:
```
app/components/ui/Button.tsx
```

For complex page components:
```
app/nunu/events/[id]/
  page.tsx              # Thin orchestrator
  components/
    EventMetrics.tsx
    TeamRoster.tsx
    RegistrationModal.tsx
    index.ts            # Barrel export
```

### Barrel Exports
Every component directory should have an `index.ts`:

```ts
export { EventMetrics } from './EventMetrics';
export { TeamRoster } from './TeamRoster';
```

Main barrel exports:
- `app/components/ui/index.ts` — shared UI components
- `app/components/layout/index.ts` — layout components
- `app/components/motion/index.ts` — animation primitives
- `app/components/operational/index.ts` — operational page components
- `app/hooks/index.ts` — shared hooks
- `app/types/index.ts` — all type definitions

### New Component Checklist
1. Does this component already exist? Check barrel exports first
2. Is it shared across sections? Put it in `app/components/ui/`
3. Is it page-specific? Put it in a co-located `components/` directory
4. Export it from the appropriate barrel file
5. Use design tokens (not hardcoded colors)
6. Respect `useReducedMotion()` for any animations
7. Add `aria-live` for dynamic content updates

---

## 3. Color Tokens

**Never use raw Tailwind colors** (`slate-*`, `gray-*`, `emerald-*`, `rose-*`) in new code.

Use the design system tokens:
```
bg-primary / bg-bg-card / bg-bg-secondary   (backgrounds)
text-primary / text-secondary / text-muted   (text)
border / border-light                        (borders)
primary-* / accent-*                         (brand colors)
success / error / warning / info             (semantic status)
```

**Exception**: Decorative section colors (e.g., run mode's multi-color section themes) may use standard Tailwind colors when representing distinct visual identities, not semantic states.

---

## 4. Animation Guidelines

### Always
- Use `useReducedMotion()` and skip animations when it returns `true`
- Use spring presets from `@/app/styles/tokens` (not custom spring values)
- Use `FadeIn` and `StaggerChildren` from `@/app/components/motion` for entrance animations
- Use `animate-shimmer` for loading skeletons (never `animate-pulse`)
- Add `aria-live="polite"` to dynamically updating content

### Motion Library (`motion/react`)
- Use `m.div`, `m.button` etc. for interactive animations
- Use `AnimatePresence` for enter/exit transitions
- Use `whileHover`, `whileTap` for interactive feedback
- Use `layoutId` for shared layout animations

### Timing
- Micro-interactions: `spring.snappy` or `duration-micro`
- Interactive feedback: `spring.tactile`
- Entrances: `spring.gentle` or `duration-moderate`
- Celebrations: `spring.playful`
- Number counting: `spring.counter`

---

## 5. Import Conventions

### Preferred Import Order
1. React / Next.js imports
2. Third-party libraries
3. `@/app/components/*` (UI, layout, motion, operational)
4. `@/app/hooks/*`
5. `@/app/lib/*`
6. `@/app/types/*`
7. `@/app/styles/*`
8. Relative imports (co-located components)

### Type Imports
Always use `import type` for type-only imports:
```ts
import type { NunuEvent } from '@/app/types/nunu';
```

### Barrel Imports
Prefer barrel imports for shared modules:
```ts
// Good
import { Button, Card, Badge } from '@/app/components/ui';
import type { NunuEvent, NunuEventRegistration } from '@/app/types';

// Avoid (unless for tree-shaking reasons)
import { Button } from '@/app/components/ui/Button';
```

---

## 6. Testing

### Running Tests
```bash
npm run test:run      # Run all tests once
npx vitest            # Watch mode
npx tsc --noEmit      # Type check
npm run lint          # ESLint
```

### Test File Location
Test files live alongside source files: `Component.test.tsx` next to `Component.tsx`.

### What to Test
- Transform functions (pure logic, easy to test)
- Hooks with complex logic
- Service layer interactions (mock Supabase)
- Component rendering (React Testing Library)

---

## 7. Data Fetching Patterns

### SWR (Client Components)
```ts
import useSWR from 'swr';
import { clientFetcher } from '@/app/lib/fetcher';

const { data, error, isLoading } = useSWR('/api/endpoint', clientFetcher);
```

### Supabase Direct (Real-time)
```ts
import { supabase } from '@/app/lib/supabase';

// Subscribe to changes
const channel = supabase
  .channel('channel-name')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'table_name' }, callback)
  .subscribe();

// Cleanup
return () => { supabase.removeChannel(channel); };
```

### Error Handling
Use the Result pattern from `@/app/lib/result.ts`:
```ts
import { tryCatch } from '@/app/types';

const result = await tryCatch(someAsyncOperation());
if (!result.ok) {
  // Handle error
}
```

---

## 8. Performance

- Use `dynamic()` from Next.js for heavy components (TaiwanMap, DataTable)
- Use `LazyMotion` with `domAnimation` feature set (configured in Providers.tsx)
- Use `Suspense` boundaries for async components
- Keep loading pages content-matched to prevent layout shift
- Use `tabular-nums` class on numeric displays
- Operational pages: Optimistic UI updates (update SWR cache before server response)

---

## 9. Accessibility Checklist

- [ ] Interactive elements have minimum 44x44px touch targets
- [ ] Dynamic content has `aria-live="polite"`
- [ ] Loading states have `role="status"` and `aria-label`
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Color is not the only indicator of state (use icons/shapes too)
- [ ] Focus management on route changes
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
