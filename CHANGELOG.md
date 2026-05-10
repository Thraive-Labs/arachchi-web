# Arachchi - Changelog

All notable changes are recorded here. Newest entries at the top.

---

## 2026-05-10 — Phase 1: Foundation

### Added
- Next.js 16.2.6 project with TypeScript strict, Tailwind 4 (CSS-based `@theme inline` config), ESLint (flat config), Prettier + `prettier-plugin-tailwindcss`
- Full dependency set: Framer Motion 12, Drizzle ORM 0.45, Supabase SSR, Zustand 5, TanStack Query 5, React Hook Form 7, Zod 4, Stripe 22, Resend 6, Sentry 10, shadcn/ui 4.7
- Complete folder structure per `docs/architecture.md` (app router groups, components, lib, stores, hooks, types, tests)
- `lib/db/schema.ts` — complete Drizzle schema for all 20 tables with typed exports
- `supabase/rls.sql` — RLS enabled on every table, `is_staff_or_admin()` helper, all policies written (default deny)
- `app/globals.css` — brand tokens as CSS custom properties (`--background: 24 35% 97%`, etc.), Tailwind color and font theme mapping, `prefers-reduced-motion` global override
- `app/layout.tsx` — Cormorant Garamond + Geist via `next/font`, fonts wired as `--font-heading` / `--font-body` CSS variables; Tailwind `font-serif` / `font-sans` map to them
- `components/layout/Navbar.tsx` — fixed top, wordmark, primary nav, account/cart links
- `components/layout/Footer.tsx` — 3-column link grid, brand tagline, copyright
- `components/animations/LoadingScreen.tsx` — Framer Motion splash (fade in → wordmark blur-to-sharp → hold → fade out), ~1.8s total, sessionStorage flag, `prefers-reduced-motion` respected
- `lib/animations.ts` — `ease` and `duration` constants used site-wide
- `lib/auth/server.ts` — Supabase SSR server client, service client, `getUser()`, `getSession()`
- `lib/auth/client.ts` — Supabase browser client
- `lib/db/client.ts` — Drizzle + pg Pool client
- `lib/utils.ts` — `cn()`, `formatPriceCents()`, `slugify()`
- `middleware.ts` — session refresh, auth redirects for `/account`, `/checkout`, `/admin`
- `app/admin/layout.tsx` — RBAC guard (role checked against DB)
- `app/not-found.tsx`, `app/error.tsx` — brand-styled error pages
- `app/api/health/route.ts` — health check endpoint
- `drizzle.config.ts`, `.env.example`, `.gitignore`, `.prettierrc`
- shadcn/ui primitives: `components/ui/button.tsx`, `input.tsx`, `label.tsx`, `badge.tsx`, `separator.tsx`
- `components.json` for shadcn configuration

### Notes
- TypeScript strict check: 0 errors. ESLint: 0 errors.
- Supabase project not yet created — needs Canada Central region setup before DB work.
- `--radius: 0rem` enforced across all Tailwind radius utilities (sharp corners for luxury feel).
- Font choice (Cormorant Garamond) is a working placeholder; final font confirmed once logo is re-uploaded.

---

## 2026-05-10 (project start)

### Added
- CLAUDE.md as the slim entry-point file (~4.5k chars), loaded every session
- docs/ folder with 11 modular files loaded on demand:
  - architecture.md (project structure, conventions)
  - design-system.md (brand tokens, animation, loading screen)
  - pages.md (full page specs)
  - data-model.md (Drizzle schema, indexes, RLS)
  - security.md (security checklist)
  - performance.md (rendering, caching)
  - seo-accessibility.md (metadata, JSON-LD, WCAG)
  - recommendations.md (tags, related products, trending)
  - multi-tenant.md (second-brand approach)
  - phasing.md (8-phase MVP build order)
  - deferred.md (features explicitly NOT to build)
- PROGRESS.md and CHANGELOG.md established as the two living tracking files

### Notes
- Stack confirmed: Next.js 16 + React 19 + TypeScript + Tailwind 4 + Supabase (Canada Central) + Drizzle + Stripe + Resend
- Hosting: Vercel (single project for both current and future second brand via multi-tenant pattern)
- Payment: Stripe Checkout (hosted) for MVP to keep PCI scope at SAQ-A
- Currency and language at launch: CAD only, English only. Codebase is i18n-ready for future expansion.
- Recommendations at MVP are SQL-based (curated + trending + recently-viewed). Personalized ML deferred until 1000+ orders or 10000+ logged views.
- Plan was originally a single 51k-char file; split into CLAUDE.md + docs/ to stay under Claude Code's 40k context limit warning.
