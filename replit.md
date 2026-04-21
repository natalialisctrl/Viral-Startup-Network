# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## FoundrMatch App

Full-stack startup hiring platform (Tinder + LinkedIn + AngelList + TikTok mashup).

### Artifacts
- **FoundrMatch Frontend** (`artifacts/foundr-match`) — React/Vite app at `/` (port 8081 internal, external port 80)
- **API Server** (`artifacts/api-server`) — Express/PostgreSQL API at `/api` (port 8080)

### Important: Port Configuration
The foundr-match frontend MUST run on port 8081 (which maps to external port 80 in .replit).
The mockup-sandbox also uses port 8081, so they CANNOT run simultaneously.
When starting foundr-match, the mockup-sandbox will be stopped automatically.

### Demo Users (password: `password123`)
- `demo@talent.com` — Talent user
- `demo@founder.com` — Founder/startup user
- `admin@foundrMatch.com` — Admin user

### Frontend Pages
- `/` — Landing page
- `/login` — Login
- `/register` — Registration
- `/onboarding` — Profile onboarding flow
- `/swipe` — Tinder-style swipe interface
- `/matches` — Match list
- `/chat/:matchId` — Chat with matches
- `/feed` — TikTok-style founder video feed
- `/dashboard` — User dashboard with stats
- `/talent/:id` — Talent profile view
- `/startup/:id` — Startup profile view
- `/equity-calculator` — Startup equity calculator
- `/premium` — Subscription/premium page
- `/settings` — User settings
- `/admin` — Admin panel

### API Features
- Session auth (bcrypt + express-session + connect-pg-simple)
- Swipe matching with AI scoring (OpenAI integration with mock fallback)
- Real-time-ready messaging
- Video feed with likes
- Stripe-ready subscription tiers
- Analytics endpoints

### Known Configuration Notes
- `lib/api-zod/src/index.ts` must ONLY export `./generated/api` (not api.schemas separately)
- OPENAI_API_KEY not set — AI routes use mock responses
- Session secret set via `SESSION_SECRET` env var
- connect-pg-simple auto-creates `session` table
