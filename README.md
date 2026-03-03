# NUVA Campus

Campus event operations platform serving a Taiwanese university tour program. Coordinates ambassadors, event check-ins, lunch logistics, mission tracking, and public-facing recruitment.

## Tech Stack

- **Framework**: Next.js 16.1.0 (App Router) + React 19
- **Language**: TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL + Realtime)
- **Styling**: Tailwind CSS + CSS Variables (design tokens)
- **Data Fetching**: SWR
- **Animation**: motion (v12+, LazyMotion)
- **Testing**: Vitest + React Testing Library

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
app/
  components/
    ui/           # Shared UI components (Button, Card, Badge, Input, etc.)
    layout/       # Layout shells (SectionLayout, PageHeader, Breadcrumbs, BottomNav)
    motion/       # Animation primitives (FadeIn, StaggerChildren, PageTransition)
    operational/  # Operational page components (OperationalChecklist, ParticipantCard)
    shared/       # Cross-section shared components
    campus-tour/  # Homepage components
  hooks/          # Shared hooks (useAuth, useMissions, useSection)
  lib/            # Utilities (supabase, fetcher, logger, result, performance)
  styles/         # Design tokens (tokens.ts)
  types/          # Unified type definitions
  guardian/       # Guardian (organizer) dashboard and event management
  nunu/           # Nunu (participant) event pages
  ambassadors/    # Ambassador zone (missions, workshops)
  recruit/        # Public recruitment page
  fafa/           # FaFa zone
docs/
  prd/                                  # Core product documentation
  PRD_10_WEEKS_CODE_OPTIMIZATION.md     # Code optimization plan
  FRONTEND_TRANSFORMATION_BLUEPRINT.md  # UI/UX transformation blueprint
  DESIGN_SYSTEM_GUIDE.md                # Design system reference
  MAINTENANCE_GUIDE.md                  # Development conventions
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run test:run` | Run all tests |
| `npx tsc --noEmit` | TypeScript type check |

## Design System

See [docs/DESIGN_SYSTEM_GUIDE.md](docs/DESIGN_SYSTEM_GUIDE.md) for the full design system reference including color tokens, typography scale, spacing, elevation, and animation guidelines.

## Documentation

- [Design System Guide](docs/DESIGN_SYSTEM_GUIDE.md) - Color tokens, typography, components
- [Maintenance Guide](docs/MAINTENANCE_GUIDE.md) - Coding conventions, file size limits
- [Product Documentation](docs/prd/) - Core product specs
- [Code Optimization PRD](docs/PRD_10_WEEKS_CODE_OPTIMIZATION.md) - 10-week optimization plan
- [Frontend Blueprint](docs/FRONTEND_TRANSFORMATION_BLUEPRINT.md) - UI/UX transformation plan
