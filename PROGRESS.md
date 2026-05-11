# Arachchi - Current Progress

_Last updated: 2026-05-11, 18:30 Toronto local time_

## Current Phase
Phase 7 (SEO, performance, security) — complete. Phase 8 is pre-launch ops only.

## Completed
- **Phase 1: Foundation** — full stack setup, schema, RLS, brand tokens, layout, auth, middleware
- **Phase 2: Storefront browsing** — homepage, shop, product pages, cart drawer, view tracking, seed data
- **Phase 3: Auth + Account** — login/register/forgot-password/reset-password, account dashboard, orders, wishlist, settings
- **Phase 4: Checkout** — Stripe session creation, webhook handler, order creation, stock decrement, confirmation email, cart page, success page
- **Phase 5: Admin panel** — dashboard, products CRUD + image upload, tags, orders, customers, inventory, Vercel cron
- **Phase 6: Content** — Journal, Lookbook, About, Newsletter, Tiptap rich text editor
- **Phase 7: SEO, performance, security** — security headers, CSP, HSTS, sitemap.xml, robots.txt, JSON-LD (Product, Article, Organization), full OG/Twitter metadata, rate limiting in middleware; comprehensive admin dashboard (revenue chart, top sellers, top viewed, recent orders, customer/product/newsletter stats)

### Admin + auth polish pass (2026-05-11) — FINALISED
- **Auth**: role-based login redirect (admin/staff → `/admin`, customers → `/account`); logout redirects to `/login`
- **Navbar**: role-aware — shows "Dashboard" for admin/staff, "My Profile" for customers, "Sign In" when logged out
- **Admin sidebar**: Analytics + Settings nav items added; ThemeToggle in sidebar footer
- **Admin analytics**: full analytics page with KPI cards (revenue, orders, new customers, avg order) + 5 Recharts charts (revenue/orders line, customer growth area, order status donut, category revenue bar, day-of-week bar); period selector: 7d / 30d / 90d / All time / Custom date range
- **Customer settings**: Appearance (theme), Email Notifications, Privacy sections
- **Admin settings**: Appearance + password change
- **Seed scripts**: `scripts/seed-users.ts` (3 test accounts: customer/staff/admin at qwerty123456); `scripts/seed-orders.ts` (220 orders over 365 days, recency-biased, realistic status distribution)
- **Loading screen**: cream-to-blush gradient background + 10 falling plum blossoms (CSS-custom-property driven, manhwa-delicate)
- **Theme**: `storageKey="arachchi-theme"` resets stored dark preference so new users default to light

### Post-phase polish (2026-05-10) — FINALISED
- Fixed `NEXT_PUBLIC_SUPABASE_URL` (had `/rest/v1/` appended — breaking all auth)
- Expanded seed: 60 products across 6 categories, 8 journal articles, 5 lookbook entries, related product IDs set
- **Product images** — replaced all correlated subqueries with `attachImages` two-query helper (fetch products → fetch images by `inArray` → merge in JS). Eliminates `is_primary` flag dependency and Drizzle serialisation issues. Fixes shop, curated picks, trending now, related products.
- `ProductCard.tsx` — `primaryImage` type is now `string | null`; null guard renders `bg-muted` placeholder
- **Loading screen** — server-rendered `<div id="splash">` in `app/layout.tsx`; `SplashController` client component manages sessionStorage check and fade-out; Nunito 200-weight font, `clamp(2.5rem, 8vw, 5.5rem)`, lowercase "arachchi"; multi-property `splash-reveal` keyframe (opacity + letter-spacing + translateY + scale + blur); animated underline via `#splash::after`; 1.6s display + 0.5s fade; once per session
- **Hero section** — split layout: typographic left panel on `bg-secondary` with accent bar, watermark "A", collection tag, scroll indicator; Unsplash editorial fashion image right panel (`images.unsplash.com` added to remotePatterns + CSP)
- **Logo/wordmark** — Navbar and Footer both updated to lowercase "arachchi" in Nunito 200-weight (`font-display` class); removed uppercase serif treatment
- **Auto-scrolling carousel** — `ProductCarousel` client component; rAF loop with `translateX` at 72 px/s; items doubled for seamless infinite loop; GPU-composited via `will-change-transform`; pauses on hover/touch; arrow controls shift via modular arithmetic; used by Curated Picks and Trending Now (8 products each)
- **Dev image loading** — `unoptimized: true` in dev in `next.config.ts`; `*.picsum.photos` and `images.unsplash.com` added to remotePatterns and CSP
- Nunito font added to `app/layout.tsx` as `--font-display` CSS variable; mapped in `@theme inline`

### UI/UX + features polish pass (2026-05-11) — FINALISED
- **Product gallery**: hover-preview thumbnails (revert on mouse-leave, commit on click), 0.2s crossfade, 2.2x zoom-on-hover with cursor tracking, touch swipe + mobile dot indicators, full video support (`mediaType` schema field + URL fallback)
- **Product card**: viewport fade-in (Framer Motion `whileInView`), quick-add size overlay on hover (checkmark confirmation, OOS struck through)
- **Size guide**: slide-in modal from variant selector with EU/UK size table and measurement instructions
- **Wishlist button** on product page — save/unsaved toggle, heart SVG, redirects guest to login
- **Cart icon**: spring-bounce badge on item-add
- **Product page**: sticky right panel (`lg:sticky lg:top-24`)
- **Dark/light theme**: `next-themes` with `data-theme` attribute, warm dark palette in `globals.css`, `ThemeProvider` wrapper, `ThemeToggle` button in Navbar + MobileMenu
- **Navbar**: full client component rewrite — transparent on homepage when scroll < 40px, solid elsewhere; desktop nav links with active underline; search overlay trigger; hamburger for mobile menu
- **Mobile menu**: right-side drawer (spring animation), nav links, account/wishlist/search links, ThemeToggle, body overflow lock
- **Search overlay**: slide-down with debounced (280ms) `searchProductsAction`, image + name + price results grid
- **Cart drawer**: free shipping progress bar (threshold: $250 CAD)
- **Shop filters**: mobile bottom-sheet panel (spring animation) with filter count badge; active filter chips (removable) on both desktop sidebar and mobile bar; filter chip close on individual selection
- **Discounts**: full CRUD (admin create/edit/delete), server action with Zod validation (percentage/fixed/free_shipping), `discounts` schema table
- **Bundles**: full CRUD admin, storefront listing + detail pages, bundle availability gated on all-product stock, pro-rated cart pricing, `bundles` + `bundle_products` schema tables
- **Wishlist notifications**: back-in-stock email sent via Resend when admin sets stock 0→positive; queries all wishlist users for that variant; fire-and-forget (`Promise.allSettled`); email template in `lib/email/templates/back-in-stock.tsx`
- **Journal reading progress**: `ReadingProgress` component — fixed 2px bar at top, `useSpring` smoothing, scroll-driven 0→100%
- **Admin mobile**: `AdminShell` client component wraps layout; hamburger toggle slides in sidebar as overlay; mobile top bar; admin tables (inventory, orders, customers, products) all get `overflow-x-auto` + `min-w` for horizontal scroll on mobile
- **TypeScript**: `npx tsc --noEmit` passes (0 errors)
- **Build**: `npx next build` succeeds

### Schema changes requiring `npm run db:push`
- `media_type` column on `product_images`
- `bundles` table
- `bundle_products` table
- `discounts` table (if not already pushed)

## Deferred to Phase 8 (pre-launch ops — not code)
- Paste `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` into `.env.local` and Vercel
- Register `/api/webhooks/stripe` in Stripe dashboard (`checkout.session.completed`)
- Paste `RESEND_API_KEY` and verify sender domain in Resend dashboard
- Update `FROM_ADDRESS` in `lib/email/client.ts` to verified domain email
- DNS, Vercel domain, SSL
- Production env vars (`NEXT_PUBLIC_SITE_URL`, `CRON_SECRET`, Supabase keys, Sentry DSN)
- Sentry DSN + monitoring setup
- Backup schedule confirmed
- Soft launch → public launch

## Supabase Manual Steps Required
- Create `product-images` bucket in Supabase Storage, set to **public**
- Run `npm run db:push` when pulling new schema changes
- Add public SELECT RLS policies on read-only tables (see below)

## RLS Policies Required (run in Supabase SQL Editor)
```sql
CREATE POLICY "public_read_products" ON products FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "public_read_product_images" ON product_images FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_product_variants" ON product_variants FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "public_read_categories" ON categories FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "public_read_tags" ON tags FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY "public_read_product_tags" ON product_tags FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_journal" ON journal_articles FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "public_read_lookbook" ON lookbook_entries FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "anon_insert_newsletter" ON newsletter_subscribers FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_insert_views" ON product_views FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "public_read_bundles" ON bundles FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "public_read_bundle_products" ON bundle_products FOR SELECT TO anon USING (true);
```

## Phase 8 Checklist (no new code — just configuration)
1. Add all env vars to Vercel dashboard
2. Connect Stripe: add keys, register webhook endpoint, test end-to-end in Stripe test mode
3. Connect Resend: add key, verify domain, test order confirmation + back-in-stock emails
4. Configure Vercel domain + DNS
5. Confirm Supabase backup schedule
6. Set up Sentry + verify error alerts
7. Soft launch: share with small group, monitor Sentry + Vercel logs
8. Public launch

## Open Questions / Decisions Pending
- Logo wordmark font — Nunito 200-weight currently used. Confirm this is the intended brand font.
- Domain — confirm domain registered.
- `@arachchi` Twitter handle — update in layout.tsx if different.
- Sentry DSN — add to env vars in Phase 8.
- Rate limiting: current implementation is in-memory per serverless instance. For stronger protection, configure Vercel WAF or add Upstash Redis.
- Hero image — currently using Unsplash placeholder. Replace with actual brand photography before launch.

## Known Issues
- None.

## Environment Notes
- Supabase URL fixed (removed `/rest/v1/` suffix that was breaking auth)
- Stripe and Resend keys empty — checkout/email inactive until Phase 8
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000` for local dev
- Seed data: 60 products, 6 categories, 7 tags, 8 journal articles, 5 lookbook entries
- No deployments yet. Local dev: `npm run dev`
- Loading screen shows once per browser session. To re-test: DevTools → Application → Session Storage → delete `arachchi_splash_shown`
- Carousel speed: `SPEED_PX_S` constant in `components/product/ProductCarousel.tsx`
