# Architecture

Project structure, conventions, and environment setup.


Use this folder layout. It is small enough for a startup and clean enough to scale.

```
arachchi/
├── app/
│   ├── (storefront)/
│   │   ├── page.tsx                    home (editorial)
│   │   ├── shop/
│   │   │   ├── page.tsx                product browsing
│   │   │   └── [category]/page.tsx
│   │   ├── product/[slug]/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── checkout/success/page.tsx
│   │   ├── account/
│   │   │   ├── page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   ├── orders/[id]/page.tsx
│   │   │   ├── wishlist/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── lookbook/page.tsx
│   │   ├── about/page.tsx
│   │   ├── journal/page.tsx
│   │   ├── journal/[slug]/page.tsx
│   │   ├── shipping/page.tsx
│   │   ├── returns/page.tsx
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── faq/page.tsx
│   │   └── size-guide/page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── admin/
│   │   ├── layout.tsx                  admin shell, RBAC guard
│   │   ├── page.tsx                    dashboard
│   │   ├── products/
│   │   ├── orders/
│   │   ├── customers/
│   │   ├── inventory/
│   │   ├── discounts/
│   │   ├── content/                    journal, lookbook, banners
│   │   └── settings/
│   ├── api/
│   │   ├── webhooks/stripe/route.ts
│   │   ├── webhooks/supabase/route.ts
│   │   └── health/route.ts
│   ├── layout.tsx                      root layout
│   ├── not-found.tsx
│   ├── error.tsx
│   ├── sitemap.ts                      auto sitemap
│   └── robots.ts
├── components/
│   ├── ui/                             shadcn primitives
│   ├── storefront/                     branded components
│   ├── product/
│   ├── cart/
│   ├── checkout/
│   ├── admin/
│   ├── animations/                     LoadingScreen, page transitions
│   └── layout/                         Navbar, Footer, etc.
├── lib/
│   ├── db/
│   │   ├── client.ts                   Drizzle client
│   │   ├── schema.ts                   tables
│   │   └── queries/                    typed query functions
│   ├── auth/
│   │   ├── server.ts                   server-side helpers
│   │   └── client.ts                   client-side helpers
│   ├── stripe/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── webhook-handlers.ts
│   ├── email/
│   │   ├── client.ts                   Resend setup
│   │   └── templates/                  React Email components
│   ├── validation/                     Zod schemas
│   ├── rate-limit.ts
│   ├── seo.ts                          metadata helpers
│   └── utils.ts
├── hooks/
├── stores/                             Zustand stores
├── types/
├── public/
├── styles/
│   └── globals.css                     Tailwind + brand tokens
├── drizzle/                            migrations
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/                            Playwright
├── .env.local
├── .env.example
├── middleware.ts                       auth + rate limiting
├── next.config.ts
├── tailwind.config.ts
├── drizzle.config.ts
├── tsconfig.json
├── package.json
└── CLAUDE.md                           project context (this file)
```

---



## Code

- TypeScript strict mode on. No `any` without comment justification.
- ESLint + Prettier configured, CI fails on lint errors.
- Server Components by default; `"use client"` only when needed.
- Server Actions for mutations from forms; Route Handlers for webhooks and external integrations.
- Co-locate component-specific files (component.tsx, component.test.tsx, component.stories.tsx if used).
- File naming: `kebab-case` for files, `PascalCase` for component exports, `camelCase` for functions.

## Git

- Branch naming: `feature/...`, `fix/...`, `chore/...`
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- PRs require passing CI before merge
- Squash merge to main

## CI/CD (GitHub Actions)

Pipeline on every PR:
1. Lint (ESLint)
2. Type check (`tsc --noEmit`)
3. Unit and integration tests (Vitest)
4. Build (`next build`)
5. E2E tests on critical flows (Playwright, on PRs to main only)
6. Security scan (`npm audit`)

Auto-deploy to Vercel preview on PR. Auto-deploy to production on merge to main.

## Testing

- **Unit**: Vitest for utility functions, validation schemas, server actions logic
- **Integration**: Vitest with test database for query functions
- **E2E**: Playwright for browse → cart → checkout flow, login, admin product creation
- Coverage target: 70% for `lib/`, no enforced target for components

## Environment Variables

Document every required variable in `.env.example` with a comment describing what it is and where to obtain it. Never commit real values.

Required at launch:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_SITE_URL=
SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

---
