# PRD: 10-Week Codebase Simplification Plan

**Project:** NUVA Campus
**Date:** 2026-03-03
**Goal:** Delete dead code, remove over-engineering, collapse unnecessary abstractions, and reduce total source lines by ~30% while preserving all user-facing functionality.

---

## Executive Summary

After a thorough audit of every file in the codebase (~18,000 lines of TypeScript/TSX across 150+ files), this plan identifies **specific instances** of dead code, unused infrastructure, redundant abstractions, and over-engineering. The project has accumulated significant complexity through two overlapping optimization campaigns (a 10-week code optimization PRD and a 10-week frontend transformation blueprint) that added layers of abstraction, animation infrastructure, and caching systems beyond what this application actually needs.

The core app is straightforward: a Supabase-backed event management platform with check-in, lunch tracking, ambassador missions, and a recruit page. It does not need an enterprise-grade LRU cache system, a full Result/error-code pattern, a multi-layer transform pipeline, or a motion design system with 5 spring presets and 6 animation variants.

---

## Issue Inventory

### CATEGORY A: Completely Dead Code (never imported, zero consumers)

| # | File / Export | Evidence | Lines |
|---|---|---|---|
| A1 | `app/lib/fetcher.ts` — entire file (209 lines) | Zero imports outside of `docs/MAINTENANCE_GUIDE.md`. `clientFetchEvents`, `clientFetchWorkshops`, `clientFetchEventWithStats` are never called. The server-side `fetchEvents`, `fetchEventById`, etc. are duplicated by `eventsService` methods. `swrFetcher` is never used (all SWR calls use inline fetchers). | 209 |
| A2 | `app/lib/performance.ts` — `getOptimizationSuggestions()`, `measureTime()`, `measureTimeAsync()`, `CachePerformanceTracker` class, `cacheTracker` singleton, `reportMetric()` | Only file that imports these is `performance.ts` itself. Zero consumers in any page or component. `rateMetric` and `WebVitals` type also unused. | ~150 |
| A3 | `app/lib/rate-limit.ts` — `rateLimitMiddleware()`, `resetRateLimit()`, `getRateLimitStatus()`, `defaultKeyGenerator()`, `RateLimitConfig` interface | Only consumed within `rate-limit.ts` itself and `app/api/email/send/route.ts` (only `checkRateLimit` is used). The middleware pattern, config interface, status getter, and reset function have zero consumers. | ~80 |
| A4 | `app/lib/api-auth.ts` — `generateApiKey()`, `validateInternalRequest()` | Only consumed within `api-auth.ts` itself. Only `requireApiAuth`/`validateApiKey` are used (by `app/api/email/send/route.ts`). | ~30 |
| A5 | `app/lib/supabase-server.ts` — `createServerSupabaseClient()` | Zero imports anywhere in the codebase. All server-side code uses the client singleton from `supabase.ts`. | 17 |
| A6 | `app/components/ServerDataProvider.tsx` — `AsyncBoundary`, `DataContainer`, `DataProviderProps`, `StaggeredList`, `useRevalidate` | Zero imports anywhere. The entire 169-line file is unused dead code. | 169 |
| A7 | `app/components/icons/RoleIcons.tsx` — all 6 icon components | Zero imports anywhere. `GuardianIcon`, `NunuIcon`, `FafaIcon`, `AmbassadorIcon`, `BardIcon`, `LockIcon` are never used. | 54 |
| A8 | `app/components/ui/nuva-campus-1.code-workspace` | VS Code workspace file accidentally placed inside `app/components/ui/`. Not source code. | 7 |
| A9 | `app/utils/index.ts` — barrel file that exports nothing (`export {}`) | Empty barrel file, zero consumers. | 6 |
| A10 | `app/types/index.ts` — barrel re-export file | Only imported by `app/types/index.ts` itself (via self-reference). Zero external consumers use `from '@/app/types'`. All actual imports go directly to the specific type files. | 62 |
| A11 | `app/transforms/` — entire directory (event.ts, workshop.ts, index.ts) | Zero imports anywhere in the codebase. `transformEventForDisplay`, `transformWorkshopForDisplay`, `formatEventDate`, etc. are never called by any page or component. | ~390 |
| A12 | `app/constants/` — entire directory (roles.ts, index.ts) | Zero imports anywhere in the codebase. `ROLES`, `ROLE_LABELS`, `ROLE_ROUTES`, `isBaseRole`, `isEventRole`, `extractEventId`, `createEventKey` are never used. | ~70 |
| A13 | `app/components/ui/ErrorDisplay.tsx` | Exported in barrel but never imported by any page or component. | 163 |
| A14 | Top-level PRD files: `PRD_CODE_OPTIMIZATION_6WEEKS.md`, `PRD_OPTIMIZATION.md`, `PRD_UI_UX_OPTIMIZATION.md` | Obsolete planning documents sitting at project root (not in `docs/`). Superseded by documents in `docs/`. | ~2,700 lines of markdown |
| A15 | `app/hooks/index.ts` — does not export `useSection` | `useSection` is only used by `Navbar.tsx` which imports it directly. The barrel exists but is incomplete and adds no value. | 7 |

**Total dead code: ~1,400+ lines of TypeScript + ~2,700 lines of obsolete PRD markdown**

---

### CATEGORY B: Over-Engineered Systems (used but far too complex for need)

| # | System | Problem | Impact |
|---|---|---|---|
| B1 | **Cache system** (`app/lib/cache/` — 5 files, ~650 lines) | A full LRU cache with doubly-linked list, tag-based invalidation, cache strategies with L2 Redis placeholders, key prefix constants, cache key generators, and a `withCache` decorator factory. The app is a small internal tool. SWR already handles client-side caching. The `CacheManager` wraps an `LRUCache` which wraps a `Map` — three layers of abstraction for in-memory key-value storage. The L2 TTL values (`l2: 900`, `l2: 1800`) are configured but there is no Redis and will never be one. `CACHE_TAGS` constants duplicate string literals already in `CACHE_STRATEGIES`. `CACHE_KEY_PREFIX` constants are only used by services that could just use string literals. `withCache` decorator has zero consumers. `staleWhileRevalidate` field is defined but never read. | 650 lines of infrastructure for what could be a 20-line TTL map |
| B2 | **Result/Error pattern** (`app/types/result.ts` — 152 lines) | A Rust-inspired `Result<T, E>` type with `ok()`, `err()`, `tryCatch()`, `fromSupabaseError()`, `isNetworkError()`, `ErrorCodes` enum, `ErrorMessages` map, and `ApiError` interface. `tryCatch` is never called by any code outside the file. `fromSupabaseError` is never called. The `ErrorCodes` and `ErrorMessages` are only used by `ErrorDisplay.tsx` which is itself dead code (A13). Only `ApiError` type is referenced (by the dead `ErrorDisplay`). | 152 lines of error infrastructure with zero runtime consumers |
| B3 | **Services layer** (`app/services/` — 4 files, ~800 lines) | `eventsService` and `workshopsService` duplicate the exact same queries already in `app/lib/fetcher.ts` (which is also dead code). Both layers wrap Supabase with caching. The services are only used by `guardian/dashboard/page.tsx` (eventsService) and `ambassadors/page.tsx` + `nuvacampustour/` pages (storyService). Most pages bypass both layers and query Supabase directly (guardian events, nunu events, recruit). The service layer adds ~800 lines of code for wrapping 4 Supabase tables in a cache that duplicates SWR. | Two competing data-fetching patterns; most pages use neither |
| B4 | **Motion/animation infrastructure** (`app/components/motion/` + `app/styles/tokens.ts`) | 5 motion component files + tokens file = ~300 lines. `PageTransition` is only used by `SectionLayout`, which wraps all 4 section layouts — but `AnimatePresence mode="wait"` with page key means it animates between pages that already have Next.js routing transitions. `spring.counter` preset is only used by `AnimatedCounter`. `variants.slideInRight`, `variants.fadeInScale`, `pageTransition` presets are never referenced outside `tokens.ts`. `spacing` and `radius` token objects duplicate Tailwind config values and are never imported. `shadows` tokens duplicate `tailwind.config.ts` boxShadow values and are never imported outside tokens.ts. | ~120 lines of unused token definitions; PageTransition adding redundant animation layer |
| B5 | **Skeleton component library** (`app/components/ui/Skeleton.tsx` — 283 lines) | 10 exported skeleton variants: `Skeleton`, `SkeletonText`, `SkeletonCard`, `SkeletonStatsGrid`, `SkeletonTable`, `SkeletonList`, `SkeletonEventCard`, `SkeletonParticipantGrid`, `PageSkeleton`, `DashboardSkeleton`. `SkeletonList` and `SkeletonEventCard` are never used. `PageSkeleton` is never used. Each loading page builds its own skeleton inline anyway (e.g., `guardian/events/[id]/page.tsx` line 38-50). | ~80 lines of unused skeleton variants |
| B6 | **Tailwind config bloat** (`tailwind.config.ts` — 289 lines) | 6 "backward compat" color aliases (`primary.light`, `primary.dark`, `accent.light`, `locked.DEFAULT`, `locked.light`), duplicate shadow aliases (`sm`/`md`/`lg`/`xl`/`hover` duplicating `elevation-*`), 2 custom spacing values (`18`, `22`), custom overrides of default border-radius values (`sm: 4px`, etc.), duplicate animation definitions (`enter` = `fadeInUp`, `enter-scale` = `fadeInScale`), unused `glow-pulse` keyframe, custom transition durations/easing that duplicate CSS variables in globals.css. | ~50 lines of redundant config |
| B7 | **DarkModeToggle** (`app/components/operational/DarkModeToggle.tsx`) | Scoped dark mode that only applies `.operational-dark` class to `<html>`, with custom CSS variables in `globals.css`. Used on 3 pages (guardian dashboard, guardian event overview, nunu checkin). The dark mode is partial (only changes some variables), manually toggled, and saved to localStorage. It adds complexity to globals.css (~30 lines of dark-mode overrides). For an internal operational tool used during events, this is unnecessary complexity. | 49 lines + ~30 lines CSS |

---

### CATEGORY C: Duplicate / Redundant Type Definitions

| # | Issue | Files |
|---|---|---|
| C1 | `Mission` interface defined in both `app/types/mission.ts` and `app/hooks/useMissions.ts` with different shapes (types/mission.ts has `submissions` field; hooks version does not). Neither imports the other. | 2 conflicting definitions |
| C2 | `Workshop` interface defined in both `app/types/workshop.ts` and `app/services/workshops.service.ts` with different fields (types version has `youtubeVideoId`, `schedule`; service version has `start_time`, `end_time`, `max_capacity`, `online_link`, `tally_form_id`, `status`). | 2 conflicting definitions |
| C3 | `EventRegistration` in `app/types/workshop.ts` vs `Registration` in `app/services/registrations.service.ts` — similar but different field sets. | 2 overlapping definitions |
| C4 | Event stats calculated identically in `app/lib/fetcher.ts` lines 43-61, `app/services/events.service.ts` lines 106-141, and `app/guardian/events/[id]/page.tsx` lines 20-36. Three copies of the same registration-counting logic. | 3 copies |

---

### CATEGORY D: Unnecessary Complexity in Components

| # | Component | Issue |
|---|---|---|
| D1 | `app/components/ui/Badge.tsx` (137 lines) | Wraps content in a `<m.span>` with enter/exit animations even for static badges. The `BadgeGroup` wraps children in `AnimatePresence` for no clear reason. The `removable` prop is never used anywhere. |
| D2 | `app/components/ui/Input.tsx` (194 lines) | Animated label with `animate: { x: [0, -1, 0] }` — a 1px horizontal shake on focus. Error/helper text wrapped in `AnimatePresence` with enter/exit transitions. For a form input, this is excessive motion. |
| D3 | `app/components/ui/Card.tsx` (91 lines) | Every Card renders as a `motion.div` even when not interactive, calling `useReducedMotion()` on every render. The `as` prop (`div`/`article`/`section`) is never used (always renders `m.div`). |
| D4 | `app/components/ui/StatsCard.tsx` (193 lines) | `MiniStat` component exported but never used anywhere. `trend` prop never used by any consumer. |
| D5 | `app/components/campus-tour/SearchBar.tsx` (234 lines) | 234 lines for a search bar component. Likely doing too many things. |
| D6 | `app/components/shared/SupportFormModal.tsx` (286 lines) | Large modal component. Could potentially be simplified. |

---

### CATEGORY E: Documentation Bloat

| # | Issue | Files | Lines |
|---|---|---|---|
| E1 | 3 obsolete PRD files at project root | `PRD_CODE_OPTIMIZATION_6WEEKS.md`, `PRD_OPTIMIZATION.md`, `PRD_UI_UX_OPTIMIZATION.md` | 2,692 |
| E2 | 16 detailed chapter docs in `docs/prd/` | ch01 through ch16 — original specification documents that are now historical | ~2,000+ |
| E3 | `FRONTEND_TRANSFORMATION_BLUEPRINT.md` (1,336 lines) | The "transformation" is complete; this is now historical documentation | 1,336 |
| E4 | `DESIGN_SYSTEM_GUIDE.md` | References token values but tokens.ts is the source of truth | 316 |
| E5 | `MAINTENANCE_GUIDE.md` | References `app/lib/fetcher.ts` which is dead code | 231 |

---

## 10-Week Implementation Plan

### Week 1: Delete Dead Files

**Goal:** Remove all files with zero imports/consumers.

**Tasks:**
1. Delete `app/lib/fetcher.ts` (209 lines) — A1
2. Delete `app/lib/supabase-server.ts` (17 lines) — A5
3. Delete `app/components/ServerDataProvider.tsx` (169 lines) — A6
4. Delete `app/components/icons/RoleIcons.tsx` (54 lines) — A7
5. Delete `app/components/ui/nuva-campus-1.code-workspace` (7 lines) — A8
6. Delete `app/utils/index.ts` (6 lines) — A9
7. Delete `app/transforms/` directory (event.ts, workshop.ts, index.ts — ~390 lines) — A11
8. Delete `app/constants/` directory (roles.ts, index.ts — ~70 lines) — A12
9. Delete `app/components/ui/ErrorDisplay.tsx` (163 lines) — A13; remove its export from `app/components/ui/index.ts`
10. Move 3 top-level PRDs into `docs/archive/` or delete them — A14
11. Verify zero TypeScript errors after deletions
12. Verify all tests still pass

**Acceptance Criteria:**
- All files listed above are deleted
- `npx tsc --noEmit` passes with zero errors
- All tests pass
- App builds successfully with `next build`
- ~1,100 lines of TypeScript deleted

---

### Week 2: Gut the Cache System

**Goal:** Replace the 650-line enterprise cache system with a simple TTL map that the services actually need.

**Tasks:**
1. Create `app/lib/cache.ts` (~40 lines): a simple `Map<string, { data: unknown; expiresAt: number }>` with `get`, `set`, `delete`, `invalidateByPrefix` methods. No LRU, no tags, no strategies, no L2 placeholders, no decorator factory.
2. Update `app/services/events.service.ts` to use the simple cache
3. Update `app/services/registrations.service.ts` to use the simple cache
4. Update `app/services/workshops.service.ts` to use the simple cache
5. Update `app/services/story.service.ts` to use the simple cache
6. Delete `app/lib/cache/` directory (5 files: `types.ts`, `lru.ts`, `strategies.ts`, `manager.ts`, `index.ts`)
7. Verify all tests pass

**Acceptance Criteria:**
- `app/lib/cache/` directory deleted (5 files, ~650 lines)
- New `app/lib/cache.ts` is under 50 lines
- All service methods still work identically
- All tests pass
- Net deletion: ~600 lines

---

### Week 3: Collapse the Result/Error Pattern and Clean Types

**Goal:** Remove the unused error handling infrastructure and resolve duplicate type definitions.

**Tasks:**
1. Delete all unused exports from `app/types/result.ts`: `tryCatch`, `fromSupabaseError`, `isNetworkError`, `ErrorCodes`, `ErrorMessages`, `createApiError`, `ok`, `err`. Keep only `Result`, `ApiError`, `ErrorCode` types if anything still references them (verify first — likely nothing does after ErrorDisplay deletion in Week 1).
2. If nothing imports from `result.ts` after Week 1 cleanup, delete the entire file.
3. Delete `app/types/index.ts` barrel file (zero external consumers) — A10
4. Resolve Mission type conflict (C1): Remove the duplicate `Mission` interface from `app/hooks/useMissions.ts` and import from `app/types/mission.ts`, or consolidate into a single canonical definition.
5. Resolve Workshop type conflict (C2): Decide whether `app/types/workshop.ts` or `app/services/workshops.service.ts` is the canonical Workshop definition. Delete the other.
6. Resolve EventRegistration/Registration overlap (C3): Consolidate into one type.
7. Delete `app/hooks/index.ts` barrel file (incomplete, adds no value) — A15
8. Delete unused exports from `app/lib/rate-limit.ts`: `rateLimitMiddleware`, `resetRateLimit`, `getRateLimitStatus`, `defaultKeyGenerator`, `RateLimitConfig` — A3
9. Delete unused exports from `app/lib/api-auth.ts`: `generateApiKey`, `validateInternalRequest` — A4
10. Clean up `app/lib/performance.ts`: delete everything except the parts actually used (if any — verify). If entire file is unused, delete it. — A2

**Acceptance Criteria:**
- Zero duplicate type definitions
- Each type defined in exactly one place
- Unused error infrastructure deleted
- `app/lib/performance.ts` deleted or reduced to only used exports
- All tests pass, zero TypeScript errors
- Net deletion: ~300-500 lines

---

### Week 4: Simplify the Services Layer

**Goal:** Eliminate the redundant data-fetching layer where pages query Supabase directly anyway.

**Tasks:**
1. Audit every page that queries Supabase directly: identify all inline `supabase.from(...)` calls in page files
2. For pages already using inline Supabase calls with SWR (guardian/events, nunu/events, recruit pages): these are the correct pattern — leave them
3. For the 2-3 pages using `eventsService`/`storyService`: inline the Supabase queries directly with SWR, removing the service-layer indirection
4. After all consumers are migrated: delete `app/services/events.service.ts`, `app/services/workshops.service.ts`, `app/services/registrations.service.ts`, `app/services/story.service.ts`, `app/services/index.ts`
5. If the simplified cache from Week 2 is no longer needed (because SWR handles caching), delete `app/lib/cache.ts` too

**Alternative approach (if service layer is preferred):**
- Instead of deleting services, migrate ALL Supabase queries into services so there is ONE pattern. Remove the cache layer from services (SWR handles it). This makes services thin Supabase query wrappers used everywhere.

**Acceptance Criteria:**
- One consistent data-fetching pattern across the entire app (either all-inline-SWR or all-service-layer, not both)
- No redundant caching layers (SWR is sufficient for client-side)
- All functionality preserved
- All tests pass
- Net deletion: ~400-800 lines depending on approach

---

### Week 5: Simplify Motion Infrastructure

**Goal:** Remove unused motion tokens and simplify the animation system.

**Tasks:**
1. In `app/styles/tokens.ts`: delete unused exports:
   - `variants.slideInRight` (zero consumers)
   - `variants.fadeInScale` (zero consumers)
   - `variants.staggerContainer` and `variants.staggerChild` (StaggerChildren component uses inline variants instead)
   - `pageTransition` object (zero consumers outside tokens.ts)
   - `shadows` object (zero consumers — Tailwind classes used instead)
   - `spacing` object (zero consumers — Tailwind spacing used instead)
   - `radius` object (zero consumers — Tailwind radius used instead)
   - `colors` object (zero consumers — Tailwind/CSS variables used instead)
   - `duration` object (only `duration.normal` used by `pageTransition` which is itself unused)
   - `easing` object (only used by dead `pageTransition`)
2. After cleanup, `tokens.ts` should contain only: `spring` presets (which are actually used by Button, Card, Badge, etc.)
3. Evaluate `PageTransition` component: it is only used by `SectionLayout`. Consider removing it since Next.js already handles route transitions. If kept, simplify to a simple fade without spring physics.
4. Remove `variants` and `pageTransition` exports from tokens.ts
5. Simplify `Badge.tsx`: remove the `m.span` animation wrapper (D1). A badge does not need enter/exit animations.
6. Simplify `Input.tsx`: remove the label shake animation and `AnimatePresence` on helper/error text (D2). Use CSS transitions instead of motion library for these micro-interactions.
7. Simplify `Card.tsx`: only use `m.div` when the card is interactive; render a plain `div` for non-interactive cards (D3).

**Acceptance Criteria:**
- `tokens.ts` reduced from 203 to ~30 lines (just spring presets)
- Badge renders without motion wrapper for non-animated usage
- Input uses CSS transitions instead of motion library for helper text
- Card uses plain div for non-interactive variants
- All visual behavior preserved for interactive elements
- All tests pass
- Net deletion: ~250 lines

---

### Week 6: Clean Up Tailwind Config and globals.css

**Goal:** Remove backward-compat aliases, duplicate definitions, and unused configuration.

**Tasks:**
1. In `tailwind.config.ts`:
   - Remove `primary.light` and `primary.dark` aliases (use `primary-300` and `primary-700` directly) — grep for usage first, update any consumers
   - Remove `accent.light` alias (use `accent-400`)
   - Remove `locked.DEFAULT` and `locked.light` aliases (use `neutral-500` and `neutral-100`)
   - Remove duplicate shadow aliases (`sm`, `md`, `lg`, `xl`, `hover`) — they duplicate `elevation-*` shadows
   - Remove duplicate animation definitions (`enter` duplicates `fade-in-up`; `enter-scale` duplicates `fade-in-scale`)
   - Remove unused `glow-pulse` keyframe
   - Remove custom `spacing.18` and `spacing.22` if unused (grep first)
   - Remove custom `borderRadius` overrides that just restate Tailwind defaults
   - Remove `transitionDuration` custom values (`micro`, `fast`, etc.) if CSS variables in globals.css are used instead
   - Remove `transitionTimingFunction` custom values if CSS variables are used instead
2. In `globals.css` (782 lines):
   - Remove `.operational-dark` scoped CSS variables (~30 lines) if DarkModeToggle is removed
   - Audit remaining CSS classes for actual usage; delete unused ones
   - Consolidate any duplicated variable definitions

**Acceptance Criteria:**
- `tailwind.config.ts` reduced from 289 to ~200 lines
- No backward-compat aliases remain
- No duplicate shadow/animation definitions
- `globals.css` reduced by ~50 lines
- All visual appearance preserved
- All tests pass
- Net deletion: ~130 lines

---

### Week 7: Simplify Components — Remove DarkModeToggle and Unused Exports

**Goal:** Remove the partial dark mode system and clean up unused component exports.

**Tasks:**
1. Delete `app/components/operational/DarkModeToggle.tsx` (49 lines) — B7
2. Remove DarkModeToggle imports from `guardian/events/[id]/page.tsx`, `guardian/dashboard/page.tsx`, `nunu/events/[id]/checkin/page.tsx`
3. Remove `.operational-dark` CSS from `globals.css`
4. Remove `DarkModeToggle` export from `app/components/operational/index.ts`
5. In `StatsCard.tsx`: delete unused `MiniStat` component and unused `trend` prop — D4
6. In `Skeleton.tsx`: delete unused `SkeletonList`, `SkeletonEventCard`, `PageSkeleton` variants — B5. Remove their exports from `app/components/ui/index.ts`
7. In `Badge.tsx`: remove unused `removable` prop and its associated SVG/button code — D1
8. Verify `OptimizedImage` is worth keeping (only 2 consumers: Navbar and recruit HeroSection). If it just wraps `next/image` with blur, consider inlining.

**Acceptance Criteria:**
- DarkModeToggle completely removed (component + CSS + all imports)
- No unused component exports remain in barrel files
- All tests pass
- Net deletion: ~150 lines

---

### Week 8: Simplify the Logger and Remaining Lib Files

**Goal:** Reduce lib layer to only what is actively used.

**Tasks:**
1. `app/lib/logger.ts` (99 lines): Only consumed by `OperationalChecklist.tsx`. The structured logger with ANSI colors, log levels, and timestamps is over-engineered for a single consumer that only calls `log.error()`. Options:
   - Option A: Delete logger.ts entirely; use `console.error` directly in OperationalChecklist (it is already gated by the operational flow)
   - Option B: Reduce to a 10-line helper: `export function logError(category: string, msg: string, data?: unknown) { console.error(\`[${category}] ${msg}\`, data); }`
2. `app/lib/rate-limit.ts`: After Week 3 cleanup, verify only `checkRateLimit` remains. If the email route is the only consumer, consider inlining the rate-limit check directly in the route handler and deleting the file.
3. `app/lib/api-auth.ts`: After Week 3 cleanup, only `validateApiKey` and `requireApiAuth` should remain. Verify these are only used by the email route. Consider inlining if so.
4. `app/utils/image.ts` (70 lines): Only used by `OptimizedImage.tsx`. The `blurDataURLs` map has hardcoded base64 strings for 3 images. The `imageSizes` and `imageQuality` objects are reasonable but verify usage. If `OptimizedImage` is simplified/removed in Week 7, delete this file too.

**Acceptance Criteria:**
- Logger either deleted or reduced to <15 lines
- No unnecessary lib files remain
- Each lib file has clear, verified consumers
- All tests pass
- Net deletion: ~100-200 lines

---

### Week 9: Documentation Cleanup

**Goal:** Remove obsolete documentation, keep only what is current and useful.

**Tasks:**
1. Create `docs/archive/` directory
2. Move these obsolete files to `docs/archive/`:
   - `docs/PRD_10_WEEKS_CODE_OPTIMIZATION.md` (completed plan)
   - `docs/PRD_STORY_PROGRESS_6_WEEKS.md`
   - `docs/PRD_UNIVERSITY_POPUP.md`
   - `docs/FRONTEND_TRANSFORMATION_BLUEPRINT.md` (completed plan)
   - `docs/DESIGN_SYSTEM_GUIDE.md` (superseded by tokens.ts)
   - All 16 chapter files in `docs/prd/` (original spec, now historical)
3. Update `docs/MAINTENANCE_GUIDE.md`: remove references to deleted files (`fetcher.ts`, `cache/`, `transforms/`, etc.)
4. Verify README.md is accurate and does not reference deleted systems

**Acceptance Criteria:**
- Active docs directory contains only current, accurate documentation
- Archived docs preserved in `docs/archive/` for reference
- No documentation references deleted code
- Net effect: cleaner project navigation

---

### Week 10: Final Audit and Verification

**Goal:** Verify the simplified codebase is correct, consistent, and maintainable.

**Tasks:**
1. Run `npx tsc --noEmit` — zero errors
2. Run `npm run test:run` — all tests pass
3. Run `npm run build` — successful production build
4. Run `npm run lint` — zero warnings/errors
5. Verify each barrel export file (`components/ui/index.ts`, `components/operational/index.ts`, `components/layout/index.ts`, `components/motion/index.ts`) only exports things that are actually imported elsewhere
6. Grep for any remaining `console.log` (should only be in dev-gated code)
7. Grep for any remaining `animate-pulse` (should be `animate-shimmer`)
8. Audit remaining imports: ensure no circular dependencies
9. Count final line totals and compare to starting point
10. Write a brief summary of what was deleted and why

**Acceptance Criteria:**
- Zero TypeScript errors
- All tests pass
- Successful production build
- Zero lint warnings
- Total source lines reduced by ~2,500-3,500 (roughly 15-20% of TypeScript, more if counting deleted markdown)
- Every remaining file has at least one consumer
- One consistent data-fetching pattern across the app

---

## Summary of Expected Deletions

| Week | What | Lines Deleted |
|---|---|---|
| 1 | Dead files (fetcher, server-data-provider, icons, transforms, constants, etc.) | ~1,100 |
| 2 | Cache system replacement | ~600 |
| 3 | Result/error pattern, duplicate types, unused lib exports | ~400 |
| 4 | Services layer consolidation | ~400-800 |
| 5 | Motion tokens, component simplification | ~250 |
| 6 | Tailwind/CSS cleanup | ~130 |
| 7 | DarkModeToggle, unused component exports | ~150 |
| 8 | Logger, remaining lib simplification | ~150 |
| 9 | Documentation cleanup | ~5,000 (markdown) |
| 10 | Final audit | ~0 (verification only) |
| **Total** | | **~3,200-3,600 lines TS + ~5,000 lines markdown** |

---

## Principles

1. **Delete first, refactor second.** If something is unused, delete it. Do not refactor dead code.
2. **One pattern per concern.** Not two caching layers. Not two data-fetching patterns. Not two type definitions for the same entity.
3. **Inline over abstract.** A function used once does not need to be extracted. A type used in one file does not need a barrel export.
4. **SWR is your cache.** The app already uses SWR with `refreshInterval`. Adding a manual LRU cache on top is redundant.
5. **Motion where it matters.** Animated counters, page transitions, and stagger effects are nice. Animating a badge's entrance, shaking an input label by 1px, and wrapping every Card in a motion div are not.
6. **No "future-proofing".** L2 Redis TTL configs, `staleWhileRevalidate` flags, cache decorator factories, and rate-limit middleware patterns for an app with 1 API route are speculative infrastructure. Delete them.
