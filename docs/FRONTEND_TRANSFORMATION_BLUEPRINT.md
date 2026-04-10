# NUVA Campus: Full-Spectrum Frontend Transformation Blueprint

> A 10-week plan to transform NUVA Campus from a functional platform into an unforgettable, premium product experience.

---

## 1. EXECUTIVE SUMMARY

NUVA Campus is a **campus event operations platform** serving a Taiwanese university tour program. It coordinates ambassadors, event check-ins, lunch logistics, mission tracking, and public-facing recruitment. The current codebase is technically solid: TypeScript strict mode, well-structured services layer, comprehensive caching, and thoughtful accessibility. But the **visual and experiential layer is generic** -- it reads as "competent SaaS starter kit" rather than "premium campus movement."

**The core problem:** The product has strong bones but no soul. The UI is clean but forgettable. The interactions are functional but flat. The loading states exist but don't feel designed. The motion system is scattered rather than choreographed. The typography is safe. The color language is textbook. There is no signature moment -- nothing that makes someone stop and think "this is different."

**The opportunity:** This platform touches real people at real events. Ambassadors checking in participants. Students discovering campus tours. Organizers running live operations. Every screen is a moment where design quality translates directly to confidence, speed, and emotional connection. A premium experience here isn't vanity -- it's operational advantage.

**The transformation thesis:** Evolve NUVA Campus from "functional admin tool with a nice landing page" into **"the most polished campus operations platform anyone has ever used"** -- where every interaction feels intentional, every transition feels choreographed, and every screen communicates "we care about every detail."

---

## 2. FULL UI/UX AUDIT

### 2.1 Product Understanding

**What it does:**
- **Campus Tour Discovery** (`/`): Multi-step wizard for exploring university tour schedules by region > city > university > agenda
- **Ambassador Hub** (`/ambassadors`): Mission tracking, workshop management, and status dashboards for campus ambassadors
- **Guardian Operations** (`/guardian`): Event management center for check-in, lunch distribution, email notifications, and analytics
- **Nunu Operations** (`/nunu`): Event execution views with real-time registration, check-in tracking, and run-mode content delivery
- **Recruit/Support** (`/recruit`): Public campaign page for supporter sign-ups with supporter wall and leaderboard
- **Campus Tour Admin** (`/nuvacampustour/create`): Log and template management behind password gate

**Who uses it:**
1. **Campus Ambassadors** (20-30 people): University students running events, tracking missions, attending workshops
2. **Guardians/Organizers** (3-5 people): Operations staff managing check-ins, lunch, notifications at live events
3. **Nunu Operators** (3-5 people): Event runners using real-time dashboards during events
4. **Public visitors** (hundreds): Prospective supporters exploring the campus tour

**Primary jobs-to-be-done:**
- Quickly check in participants at live events (speed-critical, mobile-first)
- Track mission completion across ambassador cohort
- Discover and explore campus tour schedules
- Sign up to support the campus movement
- Monitor event stats in real-time

**Correct emotional tone:** Energetic but trustworthy. Young but organized. Community-driven but professionally executed. Think: **the confidence of a well-run movement, not the sterility of an admin panel.**

---

### 2.2 Experience Diagnosis

#### What Currently Works
- **Step wizard on homepage**: Progressive disclosure is smart UX -- locking future steps until prerequisites are met is good
- **Numeric keypad for check-in**: Purpose-built for rapid event operations on mobile -- this is thoughtful
- **Real-time subscriptions**: Live data via Supabase realtime is genuinely useful for event day
- **Skeleton loading states**: Present across most routes -- better than most projects
- **Accessibility foundations**: sr-only, focus-visible, WCAG touch targets, reduced-motion support -- rare and commendable
- **3D flip cards on leaderboard**: Genuinely delightful interaction in the recruit section
- **Taiwan map component**: Interactive SVG with animated dots -- a signature element

#### What Currently Feels Weak
- **Visual identity is absent**: There is no visual signature. Remove the logo and nothing says "NUVA." The indigo/orange palette is stock Tailwind. The typography is Noto Sans (functional but characterless for a youth movement)
- **Operational pages feel like admin tools**: Check-in, lunch, dashboard pages look like internal tools rather than premium product screens. Participant grids are flat colored boxes with no personality
- **Motion is scattered, not systematic**: 30+ animation keyframes exist but they don't form a coherent language. Some pages have elaborate animations (recruit loading screen) while operational pages have none
- **Page transitions are nonexistent**: Navigating between routes is a hard cut. No continuity between pages
- **Empty states are utilitarian**: "No data" messages exist but feel like afterthoughts
- **Navbar is minimal to the point of invisible**: Two links, no personality, no indication of current section depth

#### What Feels Generic
- **The entire color system**: Indigo primary + orange accent is the #1 most common AI-generated color scheme. It signals "starter template"
- **Card patterns**: Every card is `bg-white border border-border rounded-xl p-6 shadow-sm`. Functional, repetitive, forgettable
- **Button styles**: Standard filled/outline/ghost variants with no distinctive character
- **Typography scale**: Standard Tailwind sizes with no dramatic hierarchy or rhythm variation
- **Section layouts**: Nearly every section is `max-w-5xl mx-auto` centered content. No asymmetry, no grid-breaking, no spatial drama

#### What Feels Fragmented
- **Inconsistent density**: Homepage is spacious, dashboard is cramped, ambassador page is medium -- no intentional density strategy
- **Inconsistent component patterns**: Some pages use shared UI components, others inline everything. Nunu event detail (625 lines) is a monolith
- **Visual language shifts between sections**: Recruit page has a distinct cinematic feel (hero image, loading screen, supporter wall). Ambassador/guardian/nunu pages feel like a different product entirely
- **No shared page structure**: Each section has its own header pattern, its own navigation depth indicator, its own spacing rhythm

#### What Hurts Perceived Quality
- **No page load choreography**: Content appears all at once. No staggered reveals, no orchestrated entrance
- **Flat data visualization**: Stats cards show numbers with no context, no sparklines, no trends, no visual weight
- **Generic status badges**: Status indicators are colored text -- no icons, no motion, no personality
- **Participant grids are just colored boxes**: On event pages, participants appear as flat grid items. No avatars, no progressive information, no hover depth

#### What Hurts Performance Perception
- **Homepage Suspense boundary wraps everything**: The entire page is client-rendered inside one Suspense. No streaming, no progressive rendering
- **No route transition indicators**: When navigating, there's no signal that anything is happening until the new page loads
- **SWR refresh intervals**: Some pages poll every 10-30 seconds but show no visual indicator of freshness

---

### 2.3 Structural Issues

| Issue | Severity | Opportunity |
|-------|----------|-------------|
| **Checkin + Lunch pages are 99% duplicated** (~400 lines each) | HIGH | Extract shared `OperationalChecklist` component. Week 3 target already identified |
| **Nunu event detail is 625-line monolith** | HIGH | Decompose into `EventHeader`, `MetricsRow`, `TeamRoster`, `SizeDistribution`, `DressCode`, `RegistrationModal` |
| **No layout shell pattern across sections** | MEDIUM | Each section (guardian, nunu, ambassadors) needs a shared section layout with consistent header, breadcrumbs, spacing |
| **Recruit page has 4 dead components** | LOW | ActionButtons, ActivityInfo, SupportForm, UniversityCard -- already identified |
| **No shared page header component** | MEDIUM | Every page reinvents its own header with back button, title, badges -- consolidate |
| **Missing breadcrumb/depth navigation** | MEDIUM | Deep pages (e.g., `/guardian/events/[id]/checkin`) have no context about where you are |
| **useData/useDataList hooks unused** | LOW | Either adopt them consistently or remove |
| **No error boundary per section** | MEDIUM | A single error in one component crashes the entire page |

---

### 2.4 Visual Design Issues

| Issue | Why It Matters | Severity |
|-------|---------------|----------|
| **Indigo/Orange is generic** | Looks like every AI-generated Tailwind starter. No brand recall | HIGH |
| **Noto Sans TC is functional but characterless** | For a youth movement, the typography should have energy. Noto Sans is the "safe choice" for CJK -- it signals nothing | HIGH |
| **No display typeface** | Headlines look the same as body text but bigger. No typographic drama | HIGH |
| **Cards are visually identical** | Every surface is white-bg/gray-border/rounded-xl. No hierarchy between card types | MEDIUM |
| **Shadows are timid** | Shadow system maxes out at very subtle elevations. No depth drama | MEDIUM |
| **No texture or atmosphere** | Every background is flat white or `#F8FAFC`. No gradients, no noise, no grain, no life | HIGH |
| **Buttons lack tactile feedback** | Hover states are color shifts only. No scale, no shadow lift, no spring physics | MEDIUM |
| **Tables are plain HTML** | DataTable has striped rows but no visual refinement -- standard admin table styling | MEDIUM |
| **Color usage is binary** | Elements are either primary indigo or plain gray. No nuanced color application, no gradients, no color-as-information | MEDIUM |
| **No signature visual element** | The Taiwan map is close, but it's buried. Nothing on the main pages creates visual memory | HIGH |

---

### 2.5 Interaction & Motion Issues

| Issue | Why It Matters | Severity |
|-------|---------------|----------|
| **No page transition system** | Route changes are hard cuts. Feels like a multi-page app from 2015 | HIGH |
| **No entrance choreography** | Page content appears all at once. No stagger, no cascade, no rhythm | HIGH |
| **Hover states are inconsistent** | Some cards translate-y, some don't. Some change shadow, some change color. No system | MEDIUM |
| **No exit animations** | Modals and toasts appear with animation but disappear instantly | MEDIUM |
| **Loading states are static** | Skeletons pulse but don't simulate real content rhythm. No shimmer direction | LOW |
| **No micro-interactions on data changes** | When a participant checks in, the grid just... updates. No celebration, no confirmation feedback beyond toast | HIGH |
| **Operational pages have zero motion** | Check-in/lunch/dashboard feel static and mechanical -- exactly where motion could reduce cognitive load and add confidence | HIGH |
| **Tab transitions are abrupt** | On pages with tabs (run mode, agenda), content swaps instantly. No cross-fade or slide | MEDIUM |
| **No scroll-linked animations** | Long pages (recruit, homepage) don't use scroll position for any reveal effects | MEDIUM |

---

### 2.6 Accessibility & Performance Risks

**Accessibility (mostly good, some gaps):**
- Focus trap in Modal: Excellent
- Skip link: Excellent
- Reduced-motion support: Excellent
- `touch-target` utility: Excellent
- **Gap**: No ARIA live regions for real-time data updates (check-in count changes)
- **Gap**: Color-only status indicators (no icon/shape redundancy for color-blind users)
- **Gap**: Modal focus restoration works but drawer patterns don't exist yet
- **Gap**: No visible focus indicator in dark/colored sections (white focus ring on light bg)

**Performance:**
- Image optimization configured well (AVIF/WebP, responsive sizes)
- Bundle optimization for Supabase/SWR
- **Risk**: Entire homepage is client-rendered (no SSR/streaming)
- **Risk**: TaiwanMap SVG with many animated dots could cause jank on low-end mobile
- **Risk**: Marquee animation (320s infinite) runs continuously -- GPU cost on mobile
- **Risk**: `will-change: transform` used broadly -- should be applied judiciously
- **Risk**: No code splitting within sections (entire route loaded as one chunk)

---

## 3. CORE DESIGN DIRECTION

### Design Philosophy: **"Warm Precision"**

NUVA Campus is not a corporate tool. It's a community platform for young people running real events on real campuses. The redesign should feel:

- **Warm** -- not cold SaaS blue. Inviting, human, community-oriented
- **Precise** -- not messy or amateur. Every pixel intentional. Every interaction crafted
- **Energetic** -- not static. The interface should feel alive, responsive, kinetic
- **Trustworthy** -- not flashy. Operations staff need confidence, not distraction

This is **"the intersection of a lifestyle brand and a mission-critical dashboard."**

### Emotional Tone
Confident optimism. The feeling of being part of something well-organized and exciting. Like the best event you've ever attended -- everything just works, and it feels effortless.

### Visual Identity Direction

**Color System: "Midnight Campus"**
- **Primary**: Deep teal `#0D9488` (teal-600) -- distinctive, not generic, works for both dark and light contexts
- **Secondary**: Warm amber `#F59E0B` (amber-500) -- energetic accent, complements teal beautifully
- **Neutrals**: Warm gray family (stone/zinc tones) instead of cold slate
- **Surface**: Soft warm white `#FAFAF9` (stone-50) with subtle warm undertone
- **Dark surfaces**: `#1C1917` (stone-900) for contrast sections and data-dense operational views
- **Gradient signature**: Teal-to-deep-blue gradient for hero/signature moments
- **Semantic colors**: Keep green/yellow/red status but with warmer, more saturated variants

**Why:** Teal is immediately distinctive from the indigo-purple flood of AI-generated UIs. Paired with amber, it creates a warm, premium, nature-inspired palette that suits a campus/community product. The warm neutrals soften the interface without making it feel childish.

**Typography Strategy**
- **Display/Headlines**: **Sora** (Google Fonts) -- geometric, modern, distinctive, excellent CJK pairing. Used for page titles, hero text, large numbers
- **CJK Body**: **Noto Sans TC** (keep) -- reliable for Traditional Chinese, but pair it with...
- **Latin Body**: **DM Sans** -- more personality than Inter, geometric but warm, excellent for UI
- **Monospace/Data**: **JetBrains Mono** -- for codes, IDs, timestamps in operational views

**Why:** Sora has geometric energy that signals "modern movement" without being overused. DM Sans is warm and readable. JetBrains Mono adds operational credibility to data-heavy screens.

**Motion Philosophy: "Purposeful Momentum"**

Every animation must answer: "What does this help the user understand?"

- **Page entrances**: Staggered cascade from top-left to bottom-right (reading flow). 50ms stagger delay between elements. Total orchestration under 600ms
- **Page transitions**: Cross-fade with subtle directional slide (forward = slide left, back = slide right). 250ms duration
- **State changes**: Spring physics for interactive elements (buttons, cards, toggles). Overshoot creates tactile feel
- **Data updates**: Morphing number transitions for counters. Green flash + scale pulse for successful check-ins
- **Loading**: Directional shimmer (left-to-right) instead of static pulse. Skeleton shapes match actual content proportions exactly
- **Exits**: Fade + slight scale-down. Faster than entrances (150ms)

**Layout Philosophy: "Intentional Density"**

- **Public pages** (homepage, recruit): Generous whitespace, editorial rhythm, breathing room. Content density: LOW
- **Hub pages** (ambassadors, guardian landing): Card-based dashboard with clear hierarchy. Content density: MEDIUM
- **Operational pages** (check-in, lunch, run mode): Dense but organized. Clear zones. Minimal decorative space. Content density: HIGH
- **Detail pages** (event detail, mission detail): Structured bento grid with clear information hierarchy. Content density: MEDIUM-HIGH

Each density level gets its own spacing scale multiplier applied to the base system.

### Signature Moments Users Will Remember

1. **The Check-In Celebration**: When a participant is successfully checked in, their grid card transforms -- a ripple emanates, the card briefly elevates with a shadow bloom, and a micro-confetti burst (3-4 particles) fires. The counter increments with a spring animation. This happens in under 400ms but creates a dopamine hit for the operator
2. **The Step Unlock**: On the homepage wizard, when you complete a step, the next section doesn't just unlock -- it exhales. A warm gradient pulse sweeps across the border, the lock icon dissolves into a checkmark with SVG morphing, and the content fades up with a gentle spring
3. **The Live Pulse**: On operational pages during an active event, a subtle ambient pulse radiates from the header -- like a heartbeat. It communicates "this is live" without being distracting. The pulse color matches event status
4. **The Supporter Wall Cascade**: When the recruit page loads, supporter cards don't just scroll -- they cascade in from different angles, settling into their rows like tiles finding their place. Each new submission triggers a single card that "flies in" from the form area to its position in the wall

### What Makes This Impossible to Confuse With Generic AI UI

- **Warm teal + amber** instead of purple/blue gradients
- **Sora display font** instead of Inter/Space Grotesk
- **Spring-based motion** instead of linear/ease transitions
- **Bento grid layouts** with intentional size variation instead of uniform card grids
- **Dark operational views** instead of all-white admin panels
- **Signature celebration micro-interactions** instead of plain toast notifications
- **Directional shimmer loading** instead of static pulse skeletons
- **Warm stone neutrals** instead of cold slate grays

---

## 4. 10-WEEK MASTER ROADMAP

### Week 1: Design System Foundation + Token Architecture

**Objective:** Establish the complete design token system and component primitives that everything else builds on.

**Why this week matters:** Every subsequent week depends on having a coherent token system. Building on ad-hoc values guarantees inconsistency. This is the foundation layer.

**Key Deliverables:**
- New `tailwind.config.ts` with complete token system (colors, typography, spacing, shadows, radii, animations)
- Updated `globals.css` with new CSS custom properties
- New `app/styles/tokens.ts` for programmatic access to design tokens
- Install and configure `motion` library (formerly framer-motion) for React animations
- Updated `fonts.ts` with Sora + DM Sans imports
- New `app/components/ui/AnimatedPresence.tsx` wrapper for page transitions

**UI/UX Focus:**
- Define complete color palette (primary, secondary, neutrals, semantic, surfaces)
- Define typography scale with clear hierarchy (display, heading, body, caption, mono)
- Define spacing scale (4px base, with density multipliers)
- Define shadow elevation system (5 levels + colored variants)
- Define border radius system (sharp to round, contextual)
- Define animation timing tokens (duration, easing, springs)

**Engineering Focus:**
- Migrate all hardcoded color values to CSS variables/Tailwind tokens
- Set up `motion` library with `LazyMotion` for tree-shaking
- Create `MotionConfig` provider with reduced-motion detection
- Establish animation variant presets (fadeIn, slideUp, stagger, spring)

**Files Impacted:**
- `tailwind.config.ts` (full rewrite of theme section)
- `globals.css` (CSS variables update)
- `fonts.ts` (add Sora, DM Sans)
- `layout.tsx` (font class updates, MotionConfig provider)
- `package.json` (add `motion` dependency)
- New: `app/styles/tokens.ts`
- New: `app/components/motion/index.ts`

**Success Criteria:**
- All colors reference tokens (zero raw hex in components)
- Typography scale renders correctly at all breakpoints
- `motion` library loads only for animated components (code-split)
- Reduced-motion preference disables all spring animations
- Existing UI looks visually identical (no regressions) but uses new tokens

**Risks:** Token migration touches every component. Mitigate with find-and-replace automation and visual regression testing.

---

### Week 2: Navigation + Layout Shell System

**Objective:** Create a unified layout system with premium navigation, section shells, and page structure patterns.

**Why this week matters:** Consistent layout is the skeleton everything hangs on. The current navbar is minimal and sections lack structural coherence. Fixing this creates immediate visual improvement across every page.

**Key Deliverables:**
- Redesigned `Navbar.tsx` with section awareness, mobile drawer, and personality
- New `SectionLayout.tsx` component for consistent section structure
- New `PageHeader.tsx` component replacing ad-hoc headers
- Breadcrumb component for deep navigation
- Mobile bottom navigation bar for operational pages
- Route transition system using `motion` AnimatePresence

**UI/UX Focus:**
- Navbar: Logo area, primary links, section indicator, mobile drawer with gesture support
- Section shells: Consistent max-width, padding, header pattern per section
- Breadcrumbs: Lightweight path display for `/guardian/events/[id]/checkin` style routes
- Mobile nav: Bottom tab bar for guardian/nunu operational pages (check-in, lunch, notify are frequent toggles)
- Page transitions: Cross-fade + directional slide, 250ms

**Engineering Focus:**
- Create shared layout components
- Implement `usePathname`-based section detection for nav highlighting
- Build AnimatePresence route wrapper in section layouts
- Mobile-first bottom nav with safe-area-inset handling

**Files Impacted:**
- `app/components/Navbar.tsx` (redesign)
- `app/guardian/layout.tsx` (add section shell)
- `app/nunu/layout.tsx` (add section shell)
- `app/ambassadors/layout.tsx` (add section shell)
- New: `app/components/ui/SectionLayout.tsx`
- New: `app/components/ui/PageHeader.tsx`
- New: `app/components/ui/Breadcrumbs.tsx`
- New: `app/components/ui/BottomNav.tsx`

**Success Criteria:**
- Every section has consistent header, spacing, and max-width
- Navigating between routes shows smooth transition (no hard cuts)
- Deep pages show breadcrumb context
- Mobile operational pages have thumb-friendly bottom navigation
- Navigation feels premium and intentional

---

### Week 3: Core Component Redesign (Cards, Buttons, Inputs, Tags)

**Objective:** Transform the fundamental UI building blocks from generic to distinctive.

**Why this week matters:** Cards, buttons, and inputs appear on every single page. Elevating these primitives creates a multiplied impact -- every screen improves simultaneously.

**Key Deliverables:**
- Redesigned `Button.tsx` with spring physics, gradient variants, and tactile feedback
- Redesigned card system with hierarchy variants (elevated, surface, interactive, hero)
- Redesigned `Input.tsx` with floating labels and focus animations
- New tag/badge system with icon support and motion
- Redesigned form patterns (validation states, error animations)
- New `StatsCard.tsx` with sparkline support and animated counters

**UI/UX Focus:**
- Buttons: Slight scale on press (0.97), shadow lift on hover, spring return. New gradient variant for primary CTAs. Danger button with attention-grabbing pulse option
- Cards: 4 elevation levels. Interactive cards have hover rise + shadow spread. Hero cards have gradient border or background treatment
- Inputs: Animated floating label (moves from placeholder to label on focus). Clear indicator. Character count. Group layout support
- Tags: Pill-shaped with optional leading icon/dot. Removable variant with close button. Animated appearance
- Stats: Animated number counting on mount. Optional trend arrow. Mini sparkline chart option

**Engineering Focus:**
- Implement spring-based hover/press states with `motion`
- Create card variant system (CSS classes + component variants)
- Build animated counter component for stats
- Create form field wrapper with consistent error handling

**Files Impacted:**
- `app/components/ui/Button.tsx` (redesign)
- `app/components/ui/Input.tsx` (redesign)
- `app/components/ui/StatsCard.tsx` (redesign)
- `globals.css` (card, tag, button class updates)
- New: `app/components/ui/Card.tsx` (explicit card component)
- New: `app/components/ui/Badge.tsx`
- New: `app/components/ui/AnimatedCounter.tsx`

**Success Criteria:**
- Button press feels tactile (spring physics)
- Cards have clear visual hierarchy (you can tell importance at a glance)
- Input focus is smooth and satisfying
- Stats animate on mount (numbers count up)
- All components respect design tokens

---

### Week 4: Homepage + Public Pages Transformation

**Objective:** Transform the homepage and recruit page into unforgettable, premium experiences.

**Why this week matters:** These are the highest-traffic, most public-facing pages. They define first impressions. They should be the "wow" moments.

**Key Deliverables:**
- Redesigned homepage with new hero, step wizard, and story section
- Redesigned recruit page with cinematic loading, better supporter wall, and premium CTA
- New page load choreography (staggered reveal)
- Enhanced Taiwan map with new color palette
- Redesigned JoinJourney CTA section

**UI/UX Focus:**
- Homepage hero: Atmospheric gradient background (teal-to-deep-blue mesh). Search bar with glass-morphism. Animated statistics badges. Floating decorative elements
- Step wizard: Steps feel more substantial. Unlock animation is dramatic (gradient sweep + icon morph). Completed steps have a satisfied visual state
- Recruit page: Loading screen with branded animation (not just percentage). Supporter wall with improved card design. Leaderboard with bolder 3D treatment
- Story progress: Timeline with more visual weight. Each entry has an icon and subtle animation

**Engineering Focus:**
- Implement gradient mesh background (CSS `conic-gradient` layers)
- Build staggered page entrance with `motion` `staggerChildren`
- Enhanced InfiniteScrollRow with pausable, direction-aware scrolling
- Progressive rendering for homepage sections

**Files Impacted:**
- `app/page.tsx` (homepage redesign)
- `app/recruit/page.tsx` (recruit redesign)
- `app/components/campus-tour/HeroSection.tsx` (redesign)
- `app/components/campus-tour/AgendaSection.tsx` (enhance)
- `app/components/campus-tour/StoryProgressSection.tsx` (enhance)
- `app/components/campus-tour/JoinJourney.tsx` (redesign)
- `app/components/TaiwanMap.tsx` (new palette)
- `app/recruit/components/HeroSection.tsx` (redesign)
- `app/recruit/components/LoadingScreen.tsx` (rebrand)
- `app/recruit/components/SupportersWall/` (redesign all)
- `app/recruit/components/Leaderboard.tsx` (enhance)

**Success Criteria:**
- Homepage loads with choreographed animation (under 600ms total)
- Step unlock feels dramatic and satisfying
- Recruit page loading screen feels branded, not generic
- Taiwan map uses new palette, feels premium
- First-time visitors immediately perceive premium quality

---

### Week 5: Ambassador + Mission System Redesign

**Objective:** Transform the ambassador experience from generic hub to engaging mission control.

**Why this week matters:** Ambassadors are power users. Their daily experience with the platform shapes their perception of the entire program. A premium ambassador experience builds community pride.

**Key Deliverables:**
- Redesigned ambassador hub page with mission-first layout
- Enhanced MissionGrid with richer status visualization
- Redesigned MissionItem with progress indicators and celebration states
- Enhanced WorkshopCard and WorkshopSection
- Redesigned AmbassadorStatus with better data visualization
- New mission detail page with countdown drama and submission celebration

**UI/UX Focus:**
- Ambassador hub: Lead with MissionGrid as the hero element. "Your missions" should dominate. Workshops below as secondary content
- MissionGrid: Each cell gets richer status treatment (gradient fill for progress, animated border for active, confetti burst for newly completed)
- Mission detail: Countdown timer with dramatic display (large numbers, pulsing border as deadline approaches). Submission rate as an animated progress ring
- Workshops: Card redesign with date proximity indicator ("in 3 days" badge with urgency color)

**Engineering Focus:**
- Implement animated progress rings (SVG stroke-dashoffset)
- Build countdown with urgency levels (calm > approaching > urgent)
- Implement celebration animation for mission completion
- Create workshop proximity calculator

**Files Impacted:**
- `app/ambassadors/page.tsx` (layout redesign)
- `app/components/ui/MissionGrid.tsx` (enhance)
- `app/components/ui/MissionItem.tsx` (enhance)
- `app/components/ui/WorkshopCard.tsx` (redesign)
- `app/components/ui/WorkshopSection.tsx` (redesign)
- `app/components/ui/AmbassadorStatus.tsx` (enhance)
- `app/ambassadors/missions/[id]/page.tsx` (redesign)
- `app/ambassadors/workshops/[id]/page.tsx` (enhance)

**Success Criteria:**
- Ambassador hub feels like a personal mission control, not a list page
- Mission completion triggers visible celebration
- Countdown timer creates appropriate urgency
- Workshop cards communicate temporal proximity at a glance

---

### Week 6: Operational Pages Overhaul (Check-in, Lunch, Dashboard)

**Objective:** Transform the most speed-critical pages into fast, confident, premium operational interfaces.

**Why this week matters:** Check-in and lunch pages are used under pressure at live events. Every millisecond of confusion costs real time. These pages need to be flawless, fast, and satisfying to use.

**Key Deliverables:**
- Extract shared `OperationalChecklist` component from checkin/lunch pages
- Redesigned participant grid with richer card design
- Enhanced numeric keypad with haptic-style feedback
- Check-in celebration micro-interaction
- Dark mode option for operational pages (reduced eye strain at events)
- Redesigned guardian dashboard with better data density

**UI/UX Focus:**
- Participant cards: Show initials/avatar, role badge, status indicator with icon (not just color). Completed cards get a subtle "done" overlay
- Check-in flow: Card tap > spring scale > confirmation ripple > counter increment with spring. Total animation under 400ms
- Keypad: Larger touch targets, press feedback (scale + background flash), haptic-style visual feedback
- Dashboard: Bento grid layout for stats. Expandable event rows with smooth animation. Better data table with row hover state
- Dark operational mode: Optional dark theme for guardian/nunu operational pages (better for event environments with mixed lighting)

**Engineering Focus:**
- Extract shared operational checklist component (eliminate checkin/lunch duplication)
- Implement card celebration animation (ripple + particle burst, lightweight)
- Build animated counter with spring physics
- Implement expandable row animation for dashboard
- Optional: dark theme CSS variables scoped to operational layouts

**Files Impacted:**
- `app/guardian/events/[id]/checkin/page.tsx` (major refactor)
- `app/guardian/events/[id]/lunch/page.tsx` (major refactor to shared component)
- `app/guardian/dashboard/page.tsx` (redesign)
- `app/guardian/events/[id]/page.tsx` (redesign)
- `app/nunu/events/[id]/checkin/page.tsx` (redesign)
- New: `app/components/operational/OperationalChecklist.tsx`
- New: `app/components/operational/ParticipantCard.tsx`
- New: `app/components/operational/NumericKeypadEnhanced.tsx`
- `app/components/ui/DataTable.tsx` (enhance)

**Success Criteria:**
- Checkin/lunch code duplication eliminated (single source of truth)
- Check-in operation feels satisfying (celebration animation)
- Numeric keypad feels responsive and tactile
- Dashboard shows data hierarchy clearly
- Operational pages can optionally switch to dark mode

---

### Week 7: Nunu Event System + Run Mode Enhancement

**Objective:** Transform nunu event pages from monolithic views into polished, real-time operational screens.

**Why this week matters:** Nunu event detail is 625 lines and the primary operational view during events. Run mode is where content is delivered live. Both need to be modular, fast, and visually premium.

**Key Deliverables:**
- Decomposed nunu event detail into modular components
- Enhanced bento grid with responsive reflow
- Redesigned run mode with better tab system
- Improved real-time update visualization
- Registration form modal redesign
- Enhanced markdown content rendering

**UI/UX Focus:**
- Event detail bento: Metrics cards with animated counters. Team roster with avatar-style participant cards. Size distribution with animated bar chart. Weather/dress cards with contextual icons
- Run mode tabs: Sliding indicator tab bar (already exists but enhance). Content transitions on tab switch. Sub-tab nesting with visual hierarchy. Markdown tables with zebra striping and hover
- Real-time updates: When new registration comes in, animate the participant into the roster (slide-in from edge). Counter pulses green briefly

**Engineering Focus:**
- Decompose 625-line monolith into 6-8 focused components
- Implement `motion` layout animations for bento grid responsive reflow
- Build tab transition system with AnimatePresence (cross-fade content)
- Optimize real-time subscription to batch UI updates

**Files Impacted:**
- `app/nunu/events/[id]/page.tsx` (decompose into sub-components)
- `app/nunu/events/[id]/run/page.tsx` (enhance)
- `app/nunu/events/[id]/checkin/page.tsx` (align with operational redesign)
- New: `app/nunu/events/[id]/components/EventMetrics.tsx`
- New: `app/nunu/events/[id]/components/TeamRoster.tsx`
- New: `app/nunu/events/[id]/components/SizeDistribution.tsx`
- New: `app/nunu/events/[id]/components/RegistrationModal.tsx`
- New: `app/nunu/events/[id]/components/EventInfoCards.tsx`

**Success Criteria:**
- Nunu event detail is under 100 lines (orchestration only)
- Each sub-component is independently testable
- Tab transitions feel smooth (no flash of empty content)
- Real-time updates have visual feedback
- Run mode markdown renders beautifully

---

### Week 8: Loading Experience + Empty/Error State System

**Objective:** Transform every loading, empty, and error state from utilitarian placeholder to designed experience.

**Why this week matters:** Users spend significant time in loading and transitional states. These moments are opportunities to build trust, not anxiety. A product that loads gracefully feels faster even if it isn't.

**Key Deliverables:**
- Directional shimmer skeleton system (replace pulse with left-to-right shimmer)
- Content-matched skeleton shapes for every page
- Designed empty states with contextual illustrations and actionable CTAs
- Redesigned error states with friendly messaging and clear recovery paths
- Route transition loading indicator (thin progress bar at top)
- Optimistic UI for check-in operations
- Background refresh indicator (subtle "syncing" dot)

**UI/UX Focus:**
- Skeletons: Must match exact content layout. Shimmer direction left-to-right. Slightly warm gray tones. Stagger appearance
- Empty states: Contextual message + illustration + primary action. "No missions yet" with a motivational message and link to learn more. "No events" with next event date if known
- Errors: Friendly language ("Something went wrong" not technical jargon). Retry button prominent. Error context (what was attempted). Contact option for persistent errors
- Route loading: Thin progress bar at page top (like YouTube/GitHub). Completes on route change. Color matches primary
- Optimistic check-in: When operator taps to check in, UI updates immediately. If server fails, revert with explanation toast

**Engineering Focus:**
- Build shimmer skeleton primitive with CSS gradient animation
- Create content-matched skeleton templates per page
- Implement NProgress-style route loading indicator
- Build optimistic update pattern for check-in mutations
- Create `SyncIndicator` component for background refresh visibility

**Files Impacted:**
- `app/components/ui/Skeleton.tsx` (complete redesign)
- `app/components/ui/EmptyState.tsx` (enhance with illustrations)
- `app/components/ui/ErrorDisplay.tsx` (redesign)
- `app/loading.tsx` (redesign global loading)
- `app/guardian/loading.tsx` (redesign)
- `app/guardian/events/[id]/loading.tsx` (redesign)
- Every `loading.tsx` file in the project
- New: `app/components/ui/RouteProgress.tsx`
- New: `app/components/ui/SyncIndicator.tsx`
- New: `app/components/ui/ShimmerSkeleton.tsx`

**Success Criteria:**
- Every page has a content-matched skeleton (not generic boxes)
- Shimmer moves left-to-right with warm tones
- Empty states are helpful and not depressing
- Error states offer clear recovery options
- Route transitions show progress indicator
- Check-in operations feel instant (optimistic UI)

---

### Week 9: Responsive + Accessibility + Performance

**Objective:** Ensure the redesigned system is flawless across devices, accessible to all users, and performant on low-end hardware.

**Why this week matters:** Beauty that doesn't work on mobile or excludes users with disabilities is unacceptable. Performance that degrades on event-day cellular networks is a failure.

**Key Deliverables:**
- Responsive audit and fix across all pages (especially operational pages on tablets)
- ARIA live regions for all real-time data updates
- Color contrast verification (WCAG AA minimum)
- Animation performance audit (composite-only animations, no layout thrash)
- Reduced-motion testing for all new animations
- Bundle size audit and code-splitting optimization
- Image loading optimization (lazy/priority strategy)
- Core Web Vitals baseline measurement

**UI/UX Focus:**
- Tablet optimization: Operational pages should shine on iPad-sized screens (common at events)
- Landscape mode: Check-in/lunch pages should work in landscape on phones
- Touch targets: Verify 44px minimum everywhere, especially in data-dense grids
- Keyboard navigation: Full tab-order audit, arrow key support in grids
- Screen reader: Announce dynamic content changes (check-in success, counter updates)

**Engineering Focus:**
- Add `aria-live="polite"` to all dynamic counter/status regions
- Audit all `motion` animations for `transform`/`opacity`-only compositing
- Remove unnecessary `will-change` declarations
- Implement `React.lazy` + `Suspense` for heavy components (TaiwanMap, MissionGrid)
- Measure and optimize LCP, FID/INP, CLS for key pages
- Configure Next.js `generateStaticParams` where applicable

**Files Impacted:**
- All page and component files (responsive/a11y audit)
- `app/components/motion/index.ts` (performance guard)
- `next.config.ts` (code splitting optimization)
- `app/layout.tsx` (performance monitoring setup)
- Various loading.tsx files (a11y announcements)

**Success Criteria:**
- All pages render correctly at 320px, 768px, 1024px, 1440px widths
- WCAG AA contrast ratio met for all text
- All animations use composite-only properties
- LCP < 2.5s on 4G connection
- INP < 200ms for all interactive elements
- Bundle size increase from motion library < 15KB gzipped
- Screen reader announces all dynamic content changes

---

### Week 10: Final Polish + Consistency Sweep + Wow Factor

**Objective:** The final pass to achieve perfection. Fix every inconsistency, add the final layer of delight, and ensure the entire experience is cohesive.

**Why this week matters:** The difference between "good" and "unforgettable" lives in the last 10% of polish. This week is about obsessive refinement.

**Key Deliverables:**
- Full visual consistency audit (spacing, colors, typography across every page)
- Add remaining signature moments (check-in celebration, step unlock drama)
- Final animation timing tuning (ensure rhythm feels natural, not mechanical)
- Cross-browser testing (Safari, Chrome, Firefox, mobile Safari, Chrome Android)
- Remove all dead code (recruit dead components, unused hooks)
- Documentation: Design system guide, component usage patterns, animation guidelines
- Performance final check (no regressions from animation additions)

**UI/UX Focus:**
- Walk through every route as each user type and verify experience quality
- Test emotional pacing: Does the experience build and release tension appropriately?
- Verify "one-thing-to-remember" exists on each major page
- Check page-to-page continuity (does navigation feel connected or disjointed?)
- Test under realistic conditions (event day scenario: rapid check-ins, mobile, spotty network)

**Engineering Focus:**
- Remove dead code: ActionButtons, ActivityInfo, SupportForm, UniversityCard from recruit
- Remove unused hooks: useData, useDataList (or integrate them)
- Remove duplicate types: recruit/types.ts
- Final bundle analysis
- Lighthouse audit for each major route
- Write design system documentation

**Files Impacted:**
- All files (consistency pass)
- `app/recruit/components/` (dead code removal)
- `app/hooks/useData.ts`, `useDataList.ts` (decision: use or remove)
- `app/recruit/types.ts` (remove duplicate)
- New: `docs/DESIGN_SYSTEM_GUIDE.md`
- New: `docs/ANIMATION_GUIDELINES.md`

**Success Criteria:**
- Every page passes visual consistency checklist
- Zero dead code remains
- All signature moments are implemented and tuned
- Lighthouse scores: Performance > 90, Accessibility > 95
- Cross-browser: No visual or functional regressions
- Design system documentation complete and useful

---

## 5. DESIGN SYSTEM PROPOSAL

### Color Tokens

```
/* Primary */
--color-primary-50:  #F0FDFA   /* Backgrounds, hover states */
--color-primary-100: #CCFBF1
--color-primary-200: #99F6E4
--color-primary-300: #5EEAD4
--color-primary-400: #2DD4BF
--color-primary-500: #14B8A6   /* Default buttons, links */
--color-primary-600: #0D9488   /* Primary CTA, active states */
--color-primary-700: #0F766E
--color-primary-800: #115E59
--color-primary-900: #134E4A   /* Dark text on light backgrounds */

/* Secondary (Amber) */
--color-secondary-50:  #FFFBEB
--color-secondary-100: #FEF3C7
--color-secondary-400: #FBBF24
--color-secondary-500: #F59E0B  /* Accents, badges, highlights */
--color-secondary-600: #D97706

/* Neutrals (Warm Stone) */
--color-neutral-50:  #FAFAF9   /* Page background */
--color-neutral-100: #F5F5F4   /* Section background */
--color-neutral-200: #E7E5E4   /* Borders, dividers */
--color-neutral-300: #D6D3D1   /* Disabled borders */
--color-neutral-400: #A8A29E   /* Muted text, placeholders */
--color-neutral-500: #78716C   /* Secondary text */
--color-neutral-600: #57534E   /* Body text */
--color-neutral-700: #44403C   /* Strong body text */
--color-neutral-800: #292524   /* Headings */
--color-neutral-900: #1C1917   /* Primary text, dark surfaces */

/* Semantic */
--color-success: #16A34A
--color-warning: #CA8A04
--color-error:   #DC2626
--color-info:    #0D9488
```

### Typography Scale

```
/* Display (Sora) */
display-2xl: 4.5rem / 1       font-weight: 700  letter-spacing: -0.02em
display-xl:  3.75rem / 1      font-weight: 700  letter-spacing: -0.02em
display-lg:  3rem / 1.1       font-weight: 600  letter-spacing: -0.01em
display-md:  2.25rem / 1.2    font-weight: 600  letter-spacing: -0.01em
display-sm:  1.875rem / 1.25  font-weight: 600

/* Heading (Sora for Latin, Noto Sans TC for CJK) */
heading-xl:  1.5rem / 1.3     font-weight: 600
heading-lg:  1.25rem / 1.4    font-weight: 600
heading-md:  1.125rem / 1.4   font-weight: 500
heading-sm:  1rem / 1.5       font-weight: 500

/* Body (DM Sans for Latin, Noto Sans TC for CJK) */
body-lg:     1.125rem / 1.6   font-weight: 400
body-md:     1rem / 1.6       font-weight: 400
body-sm:     0.875rem / 1.5   font-weight: 400

/* Caption / Label */
caption:     0.75rem / 1.4    font-weight: 500
overline:    0.75rem / 1.4    font-weight: 600  letter-spacing: 0.05em  text-transform: uppercase

/* Mono (JetBrains Mono) */
mono-lg:     1rem / 1.5       font-weight: 400
mono-md:     0.875rem / 1.4   font-weight: 400
mono-sm:     0.75rem / 1.3    font-weight: 400
```

### Spacing Scale

```
Base unit: 4px (0.25rem)

space-0:   0
space-0.5: 2px    (0.125rem)
space-1:   4px    (0.25rem)
space-1.5: 6px    (0.375rem)
space-2:   8px    (0.5rem)
space-3:   12px   (0.75rem)
space-4:   16px   (1rem)
space-5:   20px   (1.25rem)
space-6:   24px   (1.5rem)
space-8:   32px   (2rem)
space-10:  40px   (2.5rem)
space-12:  48px   (3rem)
space-16:  64px   (4rem)
space-20:  80px   (5rem)
space-24:  96px   (6rem)
space-32:  128px  (8rem)

/* Density Multipliers */
density-compact: 0.75x  (operational pages)
density-default: 1x     (standard pages)
density-spacious: 1.25x (public/marketing pages)
```

### Shadow Elevation System

```
elevation-0: none                                              /* Flat */
elevation-1: 0 1px 3px rgba(28, 25, 23, 0.06)                /* Subtle lift */
elevation-2: 0 4px 8px -2px rgba(28, 25, 23, 0.08)           /* Card resting */
elevation-3: 0 8px 16px -4px rgba(28, 25, 23, 0.1)           /* Card hover */
elevation-4: 0 16px 32px -8px rgba(28, 25, 23, 0.12)         /* Modal/drawer */
elevation-5: 0 24px 48px -12px rgba(28, 25, 23, 0.16)        /* Popup/tooltip */

/* Colored shadows for interactive elements */
shadow-primary: 0 8px 24px -4px rgba(13, 148, 136, 0.2)      /* Primary button hover */
shadow-secondary: 0 8px 24px -4px rgba(245, 158, 11, 0.2)    /* Secondary highlight */
shadow-success: 0 8px 24px -4px rgba(22, 163, 74, 0.2)       /* Success feedback */
```

### Border Radius System

```
radius-none: 0
radius-sm:   4px    /* Small elements: tags, badges */
radius-md:   8px    /* Inputs, small cards */
radius-lg:   12px   /* Standard cards, modals */
radius-xl:   16px   /* Large cards, sections */
radius-2xl:  20px   /* Hero cards, feature blocks */
radius-full: 9999px /* Circular elements, pills */
```

---

## 6. MOTION SYSTEM PROPOSAL

### Animation Timing Tokens

```
/* Durations */
duration-instant:  0ms
duration-micro:    100ms   /* Micro-interactions (button press) */
duration-fast:     200ms   /* Quick transitions (hover, focus) */
duration-normal:   300ms   /* Standard transitions */
duration-moderate: 400ms   /* Entrance animations */
duration-slow:     600ms   /* Orchestrated reveals */

/* Easings */
ease-default:     cubic-bezier(0.2, 0, 0, 1)       /* Material-style decelerate */
ease-in:          cubic-bezier(0.4, 0, 1, 1)        /* Accelerate (for exits) */
ease-out:         cubic-bezier(0, 0, 0.2, 1)        /* Decelerate (for entrances) */
ease-in-out:      cubic-bezier(0.4, 0, 0.2, 1)      /* Symmetric */
ease-spring:      { type: "spring", stiffness: 400, damping: 25 }  /* Tactile */
ease-bounce:      { type: "spring", stiffness: 300, damping: 15 }  /* Playful */
ease-gentle:      { type: "spring", stiffness: 200, damping: 30 }  /* Smooth */
```

### Motion Patterns

**Page Load Choreography:**
```
Container: opacity 0 -> 1, duration 200ms
  Children stagger: 50ms delay each
  Each child: opacity 0, y: 12px -> opacity 1, y: 0
  Duration: 300ms per child
  Easing: ease-out
Total orchestration: max 600ms for 8 children
```

**Route Transition:**
```
Exit: opacity 1 -> 0, duration 150ms, ease-in
Enter: opacity 0 -> 1, x: 20px -> 0, duration 250ms, ease-out
Overlap: 0ms (sequential)
Direction-aware: forward = slide left, backward = slide right
```

**Card Hover:**
```
Resting: elevation-2
Hover: y: -2px, elevation-3, transition 200ms ease-out
Press: y: 0px, scale: 0.98, transition 100ms ease-in
Release: spring back, stiffness 400, damping 25
```

**Check-In Celebration:**
```
Step 1: Card scale 1 -> 1.05, duration 100ms, spring
Step 2: Background flash to success-light, duration 150ms
Step 3: Ripple from tap point, duration 300ms, fade out
Step 4: Scale back to 1, spring (stiffness 300, damping 20)
Step 5: Counter increment with spring animation
Total: ~400ms
```

**Modal/Drawer:**
```
Enter backdrop: opacity 0 -> 0.5, duration 200ms
Enter modal: opacity 0, scale 0.95, y: 20px -> all normal, duration 300ms, spring
Exit modal: opacity 1 -> 0, scale 1 -> 0.95, duration 150ms, ease-in
Exit backdrop: opacity 0.5 -> 0, duration 200ms
```

**Tab Content Switch:**
```
Exit current: opacity 1 -> 0, duration 100ms
Enter new: opacity 0 -> 1, y: 8px -> 0, duration 200ms, ease-out
```

**Counter Animation:**
```
Number change: spring interpolation from old to new value
Duration: ~500ms, spring (stiffness 100, damping 20)
Display: Tabular numbers (font-variant-numeric: tabular-nums)
```

### What Should Use CSS Only
- Hover background color changes
- Focus ring appearance
- Skeleton shimmer animation
- Marquee scrolling
- Pulse/glow effects
- Simple opacity transitions

### What Should Use Motion Library
- Page transitions (AnimatePresence)
- Staggered entrance choreography
- Spring-based interactive elements (press, drag)
- Layout animations (list reordering)
- Counter number interpolation
- Complex orchestrated sequences

### Where Motion Should Be Avoided
- Skeleton loading (keep CSS for performance)
- Continuous background animations (CPU drain)
- Any animation longer than 1 second (user impatience)
- Scrolling list content (performance risk)
- Deeply nested animated components (rerender cascades)

---

## 7. LOADING EXPERIENCE PROPOSAL

### Loading Pattern Library

**1. Route Loading Bar (Top of Page)**
- Thin (3px) progress bar at top of viewport
- Primary color with luminous gradient
- Starts on route change, completes on render
- Easing: Fast start (0-80%), slow middle (80-95%), instant complete
- Always visible during route transitions
- Implementation: CSS-based with JS trigger

**2. Content Shimmer Skeletons**
- Replace pulse with directional shimmer (left-to-right gradient sweep)
- Warm neutral tones: `#E7E5E4` to `#F5F5F4` to `#E7E5E4`
- Shimmer duration: 1.5s infinite
- Each page has content-matched skeleton (exact proportions)
- Stagger skeleton appearance: 50ms between elements

**3. Operational Pages: Inline Spinners**
- When tapping to check in: Small spinner in the card (not full page overlay)
- Duration indicators: If operation > 500ms, show spinner. Below that, optimistic update only

**4. Data Refresh Indicator**
- Small dot in header or stats section: green = fresh, amber = refreshing
- Subtle pulse when SWR is revalidating in background
- No blocking UI -- always show latest cached data

**5. Empty States**
| Context | Message | Visual | Action |
|---------|---------|--------|--------|
| No missions | "Your missions are being prepared..." | Briefcase icon with subtle animation | Link to learn about missions |
| No workshops | "No workshops scheduled yet" | Calendar icon | Link to ambassador FAQ |
| No events | "No active events right now" | Clock icon | Show next planned event date |
| No registrations | "Waiting for the first participant..." | People icon with dots loading | No action needed |
| No supporters | "Be the first to support!" | Heart icon | Open support form |
| Search: no results | "No matches found" | Search icon | Suggest clearing filters |

**6. Error States**
- Friendly illustration (not error icon)
- Clear message: "We couldn't load the events right now"
- Reason (if known): "Check your internet connection"
- Primary action: "Try Again" button
- Secondary: "Contact support" link for persistent errors
- Auto-retry once after 3 seconds silently

**7. Optimistic UI Strategy**
- **Check-in**: Immediately show checked-in state, revert on error
- **Form submission**: Show success state immediately, queue server write
- **Real-time updates**: Apply optimistic then reconcile with server
- **Counter updates**: Immediately increment/decrement, adjust on server response

---

## 8. PAGE-BY-PAGE OPTIMIZATION PLAN

### Homepage (`/`)

| Aspect | Current | Proposed |
|--------|---------|----------|
| Hero | Search bar on light bg | Gradient mesh bg (teal-to-blue), glass-morphism search, floating stats |
| Step wizard | Functional but flat | Dramatic unlock animations, gradient sweep on completion, spring-based progression |
| Region buttons | Small pills | Larger, more tactile buttons with active state depth |
| University selector | Simple card grid | Cards with institution logo/type badge, selected state with ring |
| Agenda section | Tab content swap | Smooth tab transition, richer content layout |
| Story progress | Basic timeline | Enhanced timeline with icons, better spacing, fade-in on scroll |
| Footer | Minimal | Warmer design with links and brand message |
| **Overall feel** | Clean wizard | Premium interactive journey |

### Recruit Page (`/recruit`)

| Aspect | Current | Proposed |
|--------|---------|----------|
| Loading screen | Percentage counter | Branded animation with logo morph, ambient particle effect |
| Hero | Image with gradient overlay | Cinematic parallax, text animation, scroll indicator |
| Stats section | Icon + text blocks | Animated counters with spring, contextual icons |
| Supporter wall | Marquee scroll rows | Cascade entrance, better card design, new submission "fly-in" |
| CTA section | Two buttons | Dramatic section with gradient background, pulse attention |
| Leaderboard | 3D flip cards | Enhanced flip with depth, rank-specific styling (gold/silver/bronze) |

### Ambassador Hub (`/ambassadors`)

| Aspect | Current | Proposed |
|--------|---------|----------|
| Layout | Sections listed vertically | Mission-first bento layout, workshops as secondary cards |
| Mission grid | Functional grid | Richer status (gradient fill, celebration, animated border) |
| Workshop cards | Basic metadata | Date proximity badge, type icon, hover expansion |
| Status section | Grid of dots | Data visualization with survival rate chart |
| Contact card | Static card | Warm gradient card with copy-email action |

### Guardian Event Dashboard (`/guardian/events/[id]`)

| Aspect | Current | Proposed |
|--------|---------|----------|
| Layout | 2-column cards | Bento grid with metrics row, action cards, live status |
| Check-in card | Link card | Rich card with live counter, progress ring |
| Lunch card | Link card | Rich card with completion percentage |
| Notify card | Link card | Card with sent/pending counters, last sent time |

### Check-in/Lunch Pages (`/guardian/events/[id]/checkin|lunch`)

| Aspect | Current | Proposed |
|--------|---------|----------|
| Architecture | Duplicate 400-line pages | Single `OperationalChecklist` component with mode prop |
| Participant cards | Colored boxes with text | Cards with initials avatar, role badge, status icon |
| Check-in action | Tap > update | Tap > spring > ripple > celebrate > count |
| Keypad | Functional | Larger targets, press feedback, visual haptic |
| Filter bar | 3 text buttons | Segmented control with count badges |
| Dark mode | N/A | Optional dark theme for low-light event environments |

### Nunu Event Detail (`/nunu/events/[id]`)

| Aspect | Current | Proposed |
|--------|---------|----------|
| Architecture | 625-line monolith | 6-8 focused sub-components |
| Metrics row | Text cards | Animated counter cards with icons |
| Team roster | Numbered grid | Avatar-style cards with role indicators |
| Size distribution | Basic progress bars | Animated bar chart with labels |
| Registration modal | Basic form | Step-by-step form with validation animation |

### Run Mode (`/nunu/events/[id]/run`)

| Aspect | Current | Proposed |
|--------|---------|----------|
| Tab system | Sliding indicator (good) | Keep + enhance with content cross-fade |
| Markdown | React-markdown with gfm | Custom styled markdown with better tables, code blocks |
| Sub-tabs | Nested buttons | Clear visual nesting hierarchy |
| Content area | Plain text | Cards for content blocks, better spacing, contextual styling |

---

## 9. ARCHITECTURE & REFACTOR RECOMMENDATIONS

### Component Extraction Strategy

```
app/components/
  layout/
    SectionLayout.tsx      # Consistent section wrapper
    PageHeader.tsx          # Shared page header pattern
    Breadcrumbs.tsx         # Navigation depth
    BottomNav.tsx           # Mobile operational nav

  motion/
    AnimatedPresence.tsx    # Route transition wrapper
    FadeIn.tsx              # Staggered fade-in
    SpringPress.tsx         # Button/card press handler
    AnimatedCounter.tsx     # Number interpolation
    PageTransition.tsx      # Cross-fade route transition
    index.ts               # LazyMotion + exports

  operational/
    OperationalChecklist.tsx  # Shared checkin/lunch
    ParticipantCard.tsx       # Rich participant display
    NumericKeypadEnhanced.tsx # Enhanced keypad
    StatusFilter.tsx          # Segmented status filter
    LiveIndicator.tsx         # "Live event" pulse

  feedback/
    RouteProgress.tsx       # Top loading bar
    SyncIndicator.tsx       # Background refresh dot
    ShimmerSkeleton.tsx     # Directional shimmer
    CelebrationBurst.tsx    # Check-in celebration
    EmptyState.tsx          # Enhanced with illustrations
    ErrorDisplay.tsx        # Enhanced with recovery

  ui/                       # Existing, enhanced
    Button.tsx
    Input.tsx
    Card.tsx (new)
    Badge.tsx (new)
    Modal.tsx
    Toast.tsx
    DataTable.tsx
    StatsCard.tsx
    Countdown.tsx
    ...
```

### Theming Strategy

Maintain CSS custom properties approach (already in place) but:
1. Add scoped dark theme for operational pages via `.theme-dark` class
2. Create density variants via `.density-compact`, `.density-spacious` classes
3. All component styles reference CSS variables (never raw values)

### Animation Primitives

```typescript
// app/components/motion/index.ts
export { LazyMotion, domAnimation } from 'motion/react';
export { FadeIn } from './FadeIn';
export { SpringPress } from './SpringPress';
export { PageTransition } from './PageTransition';
export { AnimatedCounter } from './AnimatedCounter';
export { StaggerChildren } from './StaggerChildren';

// Preset variants
export const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0, 0, 0.2, 1] }
};

export const stagger = {
  animate: { transition: { staggerChildren: 0.05 } }
};

export const spring = {
  type: "spring", stiffness: 400, damping: 25
};
```

### Dead Code Removal (Week 10)
- `app/recruit/components/ActionButtons.tsx` -- unused
- `app/recruit/components/ActivityInfo.tsx` -- unused
- `app/recruit/components/SupportForm.tsx` -- duplicated by SupportFormModal
- `app/recruit/components/UniversityCard.tsx` -- unused
- `app/hooks/useData.ts` -- never imported
- `app/hooks/useDataList.ts` -- never imported
- `app/recruit/types.ts` -- identical to `app/types/supporter.ts`

### CSS Strategy Improvements
- Keep Tailwind + CSS variables (working well)
- Add `@layer theme` for design token variables
- Add `@layer motion` for animation keyframes
- Remove duplicate scrollbar-hide (appears twice in globals.css)
- Consider CSS Container Queries for responsive component internals

---

## 10. ACCESSIBILITY + PERFORMANCE PLAN

### Accessibility Priorities

| Priority | Item | Implementation |
|----------|------|---------------|
| P0 | ARIA live regions for dynamic data | Add `aria-live="polite"` to counters, status badges, participant grids |
| P0 | Color-blind safe status indicators | Add icon/shape alongside color for all status (check/x/clock icons) |
| P1 | Focus management on route change | Focus main content area on navigation |
| P1 | Announce check-in success | `aria-live` assertion: "{name} checked in successfully" |
| P1 | Keyboard grid navigation | Arrow keys for participant grids, Enter to toggle |
| P2 | Visible focus in dark theme | Ensure focus ring contrasts against dark backgrounds |
| P2 | Skip to actions | Skip links within dense operational pages |
| P2 | Table screen reader support | Proper `<th>` scoping, `<caption>` elements |
| P3 | Announcement of loading states | "Loading events..." announcements |

### Performance Targets

| Metric | Current (est.) | Target | Strategy |
|--------|---------------|--------|----------|
| LCP | ~3s | < 2.5s | SSR critical content, lazy non-critical, priority images |
| INP | ~250ms | < 200ms | Offload heavy computation, optimize event handlers |
| CLS | ~0.1 | < 0.05 | Skeleton exact dimensions, image aspect-ratio |
| FCP | ~2s | < 1.5s | Critical CSS inline, font-display: swap |
| Bundle size | ~180KB | < 200KB | Code split motion library, lazy routes |

### Performance Strategies
1. **Lazy load motion library**: `LazyMotion` with `domAnimation` feature set (~15KB vs 50KB)
2. **Code split heavy components**: TaiwanMap, MissionGrid, DataTable loaded on demand
3. **Image priority strategy**: Hero images = priority, below-fold = lazy
4. **Font subsetting**: Only load used weights (reduce from 5 to 3 for Noto Sans TC)
5. **SWR deduplication**: Ensure same data isn't fetched multiple times
6. **Reduce marquee GPU usage**: Pause marquee when off-screen (`IntersectionObserver`)

---

## 11. TOP 10 HIGHEST-IMPACT CHANGES

Ranked by (visual impact x user reach x effort efficiency):

| # | Change | Impact | Effort |
|---|--------|--------|--------|
| 1 | **New color system (teal/amber/warm stone)** | Transforms entire brand perception instantly | Medium |
| 2 | **Display typography (Sora headlines)** | Creates typographic hierarchy and brand energy | Low |
| 3 | **Page load choreography (staggered reveals)** | Every page feels premium on first render | Medium |
| 4 | **Check-in celebration animation** | Most-used operation becomes satisfying | Low |
| 5 | **Route transition system** | Eliminates "multi-page app" feeling | Medium |
| 6 | **Card hierarchy system (4 variants)** | Every surface gains visual meaning | Medium |
| 7 | **Homepage hero redesign (gradient mesh)** | First impression becomes unforgettable | Medium |
| 8 | **Directional shimmer skeletons** | Loading feels designed, not broken | Low |
| 9 | **Operational page dark mode option** | Event-day usability improvement | Medium |
| 10 | **Shared layout shells + breadcrumbs** | Cross-section coherence | Medium |

---

## 12. QUICK WINS VS HEAVY LIFTS

### Quick Wins (1-2 days each, high impact)

1. **Swap color tokens** -- Update CSS variables and Tailwind config to new palette. Instant brand transformation
2. **Add Sora font** -- Import in fonts.ts, apply to headings. Immediate typographic elevation
3. **Add stagger classes** -- Expand stagger-1 through stagger-10 utilities, apply to page sections
4. **Check-in sound + visual flash** -- On successful check-in, play success.wav (already exists!) + green flash on card
5. **Directional shimmer CSS** -- Replace `animate-pulse` on skeletons with gradient shimmer keyframe
6. **Remove dead code** -- Delete 4 unused recruit components, 2 unused hooks, 1 duplicate type file
7. **Better hover states** -- Add `translateY(-2px)` + shadow-lg to all interactive cards consistently
8. **Counter animation** -- CSS `counter-increment` or simple JS interpolation for stats on mount

### Heavy Lifts (1-2 weeks each)

1. **Checkin/Lunch shared component extraction** -- Architectural refactor, needs careful testing
2. **Motion library integration** -- New dependency, AnimatePresence setup, route wrappers
3. **Nunu event detail decomposition** -- 625 lines into 6-8 components, state management refactor
4. **Homepage hero redesign** -- New gradient mesh, glass-morphism, floating elements, responsive
5. **Complete skeleton redesign** -- Content-matched skeletons for every page/route
6. **Operational dark theme** -- CSS variable scoping, color contrast verification, toggle UI
7. **Guardian dashboard redesign** -- New bento layout, expandable rows, better DataTable

---

## 13. RISKS & TRADEOFFS

| Risk | Severity | Mitigation |
|------|----------|-----------|
| **Color change breaks visual associations** | Medium | Use semantic token names (primary/secondary), not color names. Users adapt in 1-2 sessions |
| **Motion library adds bundle size** | Medium | LazyMotion tree-shaking, code-split per route, target < 15KB addition |
| **Animation overwhelm** | Medium | Follow "purposeful momentum" principle. Every animation must have a UX reason. Strict `prefers-reduced-motion` support |
| **Dark theme maintenance burden** | Low | Scope to operational pages only. Use CSS variables (already in place) to minimize code |
| **Regression during refactor** | High | Tackle one page at a time. Visual snapshot testing (if feasible). Manual QA per week |
| **Font performance (4 font families)** | Medium | Subset aggressively. font-display: swap. Only load needed weights. Total budget: < 100KB fonts |
| **CJK font subsetting limitations** | Low | Noto Sans TC can't be subsetted easily. Accept full download but prioritize caching |
| **Feature creep in animation** | Medium | Define strict "animation budget" per page. Max 3 animated elements visible simultaneously |

---

## 14. RECOMMENDED ORDER OF EXECUTION (If Starting Immediately)

**Day 1-2:** Quick wins -- swap color tokens, add Sora font, shimmer skeletons, remove dead code
**Day 3-5:** Week 1 deliverables -- complete token system, install motion library, animation presets
**Week 2:** Navigation + layout shells + route transitions
**Week 3:** Core component redesign (buttons, cards, inputs)
**Week 4:** Homepage + recruit page transformation
**Week 5:** Ambassador + mission system
**Week 6:** Operational pages (checkin/lunch extraction + redesign)
**Week 7:** Nunu event system decomposition + enhancement
**Week 8:** Loading/empty/error state system
**Week 9:** Responsive + accessibility + performance audit
**Week 10:** Polish, consistency, wow-factor, documentation

---

## 15. STRETCH IDEAS FOR "WOW" MOMENTS

1. **Ambient event mode**: During a live event, operational pages get a subtle animated gradient background that shifts based on time of day (morning=warm, afternoon=bright, evening=cool). Creates atmosphere without distraction

2. **Live presence indicators**: Show small avatar bubbles of other guardians/operators currently on the same page. "3 people managing check-in right now." Creates team awareness

3. **Achievement toasts**: When milestones are hit (50% checked in, all participants arrived, all lunches distributed), show a special achievement toast with confetti and message

4. **Campus map journey visualization**: On the homepage, as a user selects region > city > university, the Taiwan map zooms to the selected area with a smooth camera motion, creating a "zooming into campus" feeling

5. **Sound design system**: Extend the existing success.wav into a full sound palette -- subtle click for keypad, success chime for check-in, notification sound for new registrations. Optional and off by default

6. **Mission completion streak**: In ambassador hub, if an ambassador completes 3+ missions in a row, show a streak counter with fire emoji and escalating celebration intensity

7. **Parallax depth on scroll**: Homepage sections have subtle parallax layers (foreground content scrolls faster than decorative backgrounds), creating depth without being disorienting

8. **Code input celebration**: On check-in pages, when the 3-digit code matches a participant, the code digits briefly flash green and the matched participant's card "calls out" from the grid with a pulse

---

## APPENDIX: BENCHMARK REFERENCES

### Design Inspiration Sources

- **Linear.app** -- Best-in-class SaaS dashboard UX. Speed, clarity, keyboard-first. Reference for: operational page design, keyboard navigation, command palette patterns
- **Notion** -- Empty state design, progressive disclosure, collaborative indicators. Reference for: empty states, onboarding cues
- **Vercel Dashboard** -- Clean operational UI with real-time deployment status. Reference for: status indicators, real-time data visualization, dark theme execution
- **Stripe Dashboard** -- Data density with clarity. Exemplary typography hierarchy. Reference for: stats cards, data tables, information hierarchy
- **Cal.com** -- Event scheduling UI with personality. Warm, approachable, yet professional. Reference for: event management UX, form design, booking flows
- **Awwwards & SiteInspire** -- Gallery-grade web experiences for hero/landing page inspiration. Reference for: homepage hero treatment, scroll-linked animations, editorial layouts
- **Apple.com** -- Scroll-driven storytelling, cinematic product reveals. Reference for: homepage progressive disclosure, section transitions
- **Raycast** -- Premium developer tool with exceptional motion design. Reference for: micro-interactions, spring-based UI, keyboard shortcuts

### Research Sources
- [SaaS Dashboard Design Trends 2025-2026](https://uitop.design/blog/design/top-dashboard-design-trends/)
- [Motion Library (formerly Framer Motion)](https://motion.dev/)
- [Framer Motion + Tailwind Animation Stack](https://dev.to/manukumar07/framer-motion-tailwind-the-2025-animation-stack-1801)
- [University Website Design Inspiration](https://concept3d.com/blog/higher-ed/best-university-website-designs/)
- [Advanced Animation Techniques 2025](https://www.luxisdesign.io/blog/advanced-framer-motion-animation-techniques-for-2025)

---

*This blueprint was created through comprehensive inspection of 50+ components, 28 routes, 38 UI primitives, 4 service modules, 10 type definitions, 809 lines of CSS, and the complete Tailwind configuration of the NUVA Campus project.*
