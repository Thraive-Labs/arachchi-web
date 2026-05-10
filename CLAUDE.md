# Arachchi - Project Context

This is the entry point for every session. Read this fully, then read `PROGRESS.md`, then read only the `docs/` file relevant to the current task.

## What This Is

Arachchi is a Toronto-based luxury clothing brand e-commerce site. Single-brand, direct-to-consumer, single-vendor. Storytelling-first like Gucci or SSENSE - editorial homepage, dedicated `/shop` for buying. Browsing requires no account; checkout does.

A second brand will be added later on the same codebase via multi-tenant pattern. Build with `brand_id = 'arachchi'` everywhere from day one.

## Stack (Use Exactly These - Latest Stable Versions)

- **Framework**: Next.js 16 (App Router), React 19, TypeScript 5 (strict)
- **Styling**: Tailwind 4, shadcn/ui primitives
- **Animation**: Framer Motion 12
- **Forms**: React Hook Form + Zod
- **State**: Zustand (client), TanStack Query 5 (server state)
- **Database**: Supabase Postgres (Canada Central region)
- **ORM**: Drizzle
- **Auth**: Supabase Auth
- **Payments**: Stripe Checkout (hosted page, SAQ-A scope)
- **Email**: Resend (React Email templates)
- **Storage**: Supabase Storage
- **Hosting**: Vercel
- **Monitoring**: Sentry
- **Currency/locale at launch**: CAD, English. Code is i18n-ready.

Do not introduce dependencies not in this list without asking.

## Documentation Map

Load only what's relevant to the current task:

- `@docs/architecture.md` - project structure, conventions, environment vars
- `@docs/design-system.md` - brand tokens, typography, animation language, loading screen spec
- `@docs/pages.md` - full spec for every page (homepage, shop, product, cart, checkout, account, admin, etc.)
- `@docs/data-model.md` - Drizzle schema, indexes, RLS policies
- `@docs/security.md` - payment, auth, RLS, rate limiting, headers, secrets
- `@docs/performance.md` - rendering strategy, caching, image and font optimization
- `@docs/seo-accessibility.md` - metadata, JSON-LD, sitemap, WCAG 2.1 AA
- `@docs/recommendations.md` - tags, related products, trending logic, view tracking
- `@docs/multi-tenant.md` - second-brand approach (deferred to phase 2)
- `@docs/phasing.md` - 8-phase MVP build order
- `@docs/deferred.md` - features explicitly NOT to build at launch

## Non-Negotiable Rules

1. **Security never gets weakened for speed.** See `@docs/security.md` for the full checklist.
2. **No client-trusted prices.** Always recompute server-side at checkout and re-verify in webhooks.
3. **RLS on every table, default deny.** No exceptions.
4. **Stripe Checkout for MVP** - keeps PCI scope at SAQ-A. Don't switch to Payment Element without discussing.
5. **Verify Stripe webhook signatures.** Idempotent handlers using event ID as dedup key.
6. **No splash animations or fake urgency** ("X people viewing", forced popups). Hurts both UX and brand.
7. **Server Components by default.** `"use client"` only where genuinely needed.
8. **No emojis** in code or copy.
9. **Don't create README, summary, or status files** unless explicitly asked. PROGRESS.md and CHANGELOG.md are the only exceptions.

## Session Workflow

**At the start of every session:**
1. Read this file
2. Read `PROGRESS.md`
3. Read the `@docs/` file(s) relevant to the task
4. Confirm understanding of next task with user before writing code

**At the end of every session:**
1. Overwrite `PROGRESS.md` with new state (timestamp it, Toronto local time)
2. Append a new dated entry to the top of `CHANGELOG.md` describing what was done
3. Commit both files alongside code changes

If a session is interrupted, still update both files. Partial progress recorded beats lost context.

## Conventions Quick Reference

- **TypeScript strict.** No `any` without comment justification.
- **File naming**: kebab-case files, PascalCase component exports, camelCase functions.
- **Branches**: `feature/...`, `fix/...`, `chore/...`. Conventional commits.
- **Always use latest stable versions.** Check `npm view <package> version` if uncertain.
- **Match existing code style.** Run lint after every change set.
- **Ask before guessing** when something is genuinely ambiguous.

Full conventions in `@docs/architecture.md`.

## What's Deferred (Don't Build Unless Asked)

Personalized ML recommendations, reviews/ratings, loyalty, referrals, gift cards, abandoned cart emails, live chat, 3D/AR, native apps, Cloudflare, Redis, Algolia, Klaviyo, Cloudinary, A/B testing, social commerce.

Full list with trigger conditions in `@docs/deferred.md`.
