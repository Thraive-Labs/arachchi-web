# Arachchi - Current Progress

_Last updated: 2026-05-10, Toronto local time_

## Current Phase
Phase 1 complete. Phase 2 (Storefront browsing) is next.

## Completed
- Project plan written and split into modular structure (CLAUDE.md + 11 docs/ files)
- Tech stack decided: Next.js 16, React 19, TypeScript, Tailwind 4, Supabase (Canada Central), Drizzle, Stripe, Resend
- Brand direction confirmed: luxury minimalist, light pinkish-cream palette, editorial-first homepage
- **Phase 1: Foundation**
  - Next.js 16.2.6 project initialized with TypeScript strict, Tailwind 4 (CSS-based config), ESLint, Prettier
  - Full dependency set installed: Framer Motion 12, Drizzle ORM, Supabase SSR, Zustand, TanStack Query 5, React Hook Form + Zod, Stripe, Resend, Sentry
  - Complete folder structure per architecture.md
  - Drizzle schema (`lib/db/schema.ts`) — all 20 tables: users, addresses, categories, products, tags, product_tags, product_views, recently_viewed, product_images, product_variants, carts, cart_items, orders, order_items, discounts, wishlists, journal_articles, lookbook_entries, newsletter_subscribers, audit_log
  - RLS policies (`supabase/rls.sql`) — default deny, all tables covered, `is_staff_or_admin()` helper function
  - Brand tokens in `app/globals.css` using Tailwind 4 `@theme inline` — soft cream-pink palette, sharp corners (`--radius: 0rem`)
  - Font setup: Cormorant Garamond (headings) + Geist (body) via `next/font`, wired through `--font-heading` / `--font-body` CSS variables; Tailwind `font-serif` / `font-sans` map to these vars
  - Root layout with metadata, viewport, font CSS variables on `<html>`
  - Navbar — fixed top, wordmark + primary nav + utility links
  - Footer — 3-column links + brand tagline
  - LoadingScreen — Framer Motion splash (fade in, wordmark blur-to-sharp, fade out), sessionStorage flag prevents repeats, `prefers-reduced-motion` respected
  - shadcn/ui initialized: button, input, label, badge, separator generated in `components/ui/`
  - Animation constants: `ease` + `duration` in `lib/animations.ts`
  - Auth helpers: `lib/auth/server.ts` (Supabase SSR server client, service client, getUser), `lib/auth/client.ts`
  - Middleware: session refresh + auth redirects for `/account`, `/checkout`, `/admin`
  - Admin layout with RBAC guard (role check against DB)
  - `.env.example` — all 12 required variables documented
  - `drizzle.config.ts` with db:generate / db:migrate / db:push / db:studio scripts
  - `.prettierrc` with `prettier-plugin-tailwindcss`
  - `.gitignore`

## In Progress
- Nothing. Ready for Phase 2.

## Next Up (Phase 2: Storefront browsing)
1. Homepage — hero, brand statement, featured collection, editorial moment, curated picks, trending now
2. Shop page with filters (category, tags, size, color, price) and sort
3. Tag-based collection routes (`/shop/tag/[slug]`)
4. Product detail page — gallery, variant selector, tags, "you may also like", add to cart
5. Product view tracking (server action)
6. Cart drawer + cart page with suggestions
7. Static policy pages (shipping, returns, privacy, terms, FAQ, contact, size guide)
8. Mock data seeded for development

## Open Questions / Decisions Pending
- Logo wordmark font — confirm once logo file is re-uploaded. Font is currently Cormorant Garamond (working placeholder).
- Stripe account — confirm Canadian merchant setup is in progress.
- Domain — confirm domain registered.
- Supabase project — needs to be created in Canada Central region; credentials needed before any database work can run.

## Known Issues
- None.

## Environment Notes
- `DATABASE_URL` and Supabase env vars required before `npm run db:generate` or `npm run db:push` can run.
- After creating Supabase project: run Drizzle migrations, then execute `supabase/rls.sql` in the Supabase SQL editor.
- No deployments yet. Local dev server: `npm run dev` (add `.env.local` with real credentials first).
