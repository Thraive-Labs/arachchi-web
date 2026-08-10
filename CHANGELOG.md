# Arachchi - Changelog

All notable changes are recorded here. Newest entries at the top.

---

## 2026-08-10 — Static hero + Store grid, Lookbook/Journal removed, shop card color swatches (session 7)

### Hero (`components/storefront/HeroSection.tsx`)
- Replaced the 3-slide auto-advancing carousel with a single static slide (image, headline, CTA only) — removed autoplay, prev/next arrows, dot indicators, and the small "season" label line entirely

### Homepage Store section (`components/storefront/CuratedPicks.tsx`, `app/(storefront)/page.tsx`)
- Replaced the rAF auto-scrolling strip of hardcoded collection images with a static grid using the same `ProductCard` component as the shop page
- Now populated with real trending products (`isTrending = true`) from the database instead of a hardcoded image list
- Removed the separate "Trending Now" section (`TrendingNow.tsx`, deleted) and its carousel component (`components/product/ProductCarousel.tsx`, deleted) since Store now covers the same purpose without duplication

### Lookbook and Journal removed site-wide
- Deleted storefront routes (`/lookbook`, `/lookbook/[slug]`, `/journal`, `/journal/[slug]`) and admin routes (`/admin/lookbook*`, `/admin/journal*`)
- Removed nav links from `Navbar.tsx`, `MobileMenu.tsx`, `Footer.tsx`, and `AdminSidebar.tsx`; removed dead components `LookbookTeaser.tsx` and `EditorialMoment.tsx`
- Removed `lib/db/queries/content.ts`, journal/lookbook server actions from `app/actions/content.ts` (newsletter action retained), sitemap entries, `types/index.ts` exports, and seed data in `scripts/seed.ts`
- `journal_articles` and `lookbook_entries` DB tables intentionally left in the schema (unused, non-destructive) — not dropped
- Navbar/MobileMenu "Collection" link, which previously pointed at `/lookbook`, now points to a new `#collections` anchor on the homepage (`FeaturedCollection.tsx`); Footer's "Collections" link updated to match

### Shop card color swatches (new feature)
- Added a nullable `color` column to `product_images` (schema + `npm run db:push` already applied to local dev) so an image can be tagged with a color name matching a variant's existing `color` field
- `lib/db/queries/products.ts`: new `attachColors` step builds a per-product `colors: { color, colorHex, image }[]` list from color-tagged variants + images (falls back to the product's primary image if no image is tagged for that color); wired into `getProducts`, `getFeaturedProducts`, `getTrendingProducts`, `getRelatedProducts`
- `ProductCard.tsx`: hovering a card with 2+ colors reveals a vertical stack of color swatches (colorHex circles) top-left of the image; clicking a swatch swaps the displayed image to that color's photo without navigating
- Admin (`app/admin/products/ProductForm.tsx`, `app/actions/admin.ts`): image upload now accepts an optional color tag, existing images get an inline color-tag input, variant rows/new-variant form gained a "Color hex" field (`setImageColorAction` added, `saveVariantAction` now accepts `colorHex`)
- `scripts/seed-colors.ts` (new, additive/idempotent): marks 8 existing products as trending and gives each two color variants (Black/Ivory) reusing the product's own existing photography, tagging one image per color — run against local dev DB. **Needs re-running against any other environment's DB**, same as `seed-new-arrivals.ts`.

---

## 2026-07-10 — Wordmark simplification, hero/nav rework, Philosophy page, 12 new products (session 6)

### Wordmark (`Navbar.tsx`, `Footer.tsx`, `MobileMenu.tsx`, `app/(auth)/layout.tsx`)
- Removed the wide `tracking-[0.35em]` letter-spacing from the "arachchi" wordmark everywhere it appears — plainer, more consistent lowercase treatment site-wide (Nunito light weight retained)

### Navbar (`components/layout/Navbar.tsx`, `components/layout/MobileMenu.tsx`, `components/layout/Footer.tsx`)
- Nav label "Story" renamed to **Philosophy** (still routes to `/about`); Footer's "About" link renamed to match
- Cart icon and Sign In now swapped — Cart appears before Sign In / account links

### Hero carousel (`components/storefront/HeroSection.tsx`)
- Slide 1 and slide 3 swapped (image + original copy moved together); slide 2 keeps its image but headline changed to "From / luxury to / serenity"
- Auto-advance sped up from 5.5s to 3.2s
- Added manual prev/next arrow controls (left/right chevrons) alongside the existing dot indicators
- Swapped in new brand photography (`public/images/img1.png`, `img2.png`, `img3.png`, replacing the old placeholder JPEGs) — `objectFit` kept as `contain` so the full image always shows against the black letterbox background

### Homepage restructure (`app/(storefront)/page.tsx`)
- Removed the "Our Story" section (`BrandStatement.tsx`, deleted — content superseded by the new Philosophy page)
- "Store" section (`CuratedPicks`) moved up to appear right after the hero, ahead of "Collections"

### Philosophy page (`app/(storefront)/about/page.tsx`)
- Rebuilt from scratch: brand image at top (`public/images/philosophy.png`), centered "arachchi" heading, full philosophy statement copy, centered closing line ("Don't just wear it. Be an arachchi."), newsletter signup retained at the bottom
- Metadata updated to "Philosophy — Arachchi"

### 12 new products added (`scripts/seed-new-arrivals.ts`)
- Client supplied ~68 product photos (AI-generated garment renders) with no naming key beyond filenames; reviewed images and wrote names/descriptions/pricing/materials from what's visible in each photo
- Products: Ceylon Puff-Sleeve Dress, Tiered Linen Midi Dress, Signature Structural Sweater, Signature Lounge Set, Beach Club Crochet Dress, Weekend Oversized Set, Signature Polo Shirt, Signature Hoodie, Woven Pocket Tee, Classic Pocket Tee, Essential Crew Tee, Ceylon Logo Tee
- Each product: 1–5 gallery images, 5 size variants (XS–XL), category + tag assignments, material/care/origin metadata — all tagged `new-arrivals`
- Source images (6.2–15MB PNGs each, 322MB total) resized to max width 1400px and compressed to JPEG (quality 80) via `sharp` before committing — final footprint ~6MB in `public/images/products/<slug>/`
- Script is additive/idempotent: only touches these 12 slugs (upserts categories/tags, re-seeds images/variants/tags scoped to each product's own id) — does not clear the rest of the catalog like `scripts/seed.ts` does

---

## 2026-06-13 — Homepage overhaul: bold/neutral redesign (session 5)

### Motivation
Client feedback: homepage felt too feminine. Redesigned for a neutral, bold, architectural luxury aesthetic.

### Navbar (`components/layout/Navbar.tsx`, `components/layout/MobileMenu.tsx`)
- Nav links simplified to: **Story** (→ `/about`), **Collection** (→ `/lookbook`), **Shop** (→ `/shop`)
- Layout changed: logo on far left; all nav links + utility icons consolidated in one right-side group
- Thin vertical rule separates nav links from utility icons on desktop
- When floating over the hero carousel on the homepage, nav text becomes white for legibility over dark images

### Hero (`components/storefront/HeroSection.tsx`)
- Replaced static split-panel with a full-viewport Framer Motion crossfade carousel
- 3 slides, auto-advancing every 6s; pauses on hover
- Each slide: full-bleed image + left-to-right dark gradient overlay + large serif headline stacked line by line
- Slide navigation: `01 / 03` counter + clickable indicator bars, bottom-right corner
- Dropped rose accent color from headline text in favour of pure white

### Story section (`components/storefront/BrandStatement.tsx`)
- Bolder two-column layout: label column left (9px uppercase tracking), statement column right
- Added horizontal rule accent
- Expanded body copy for more voice

### Collections (`components/storefront/FeaturedCollection.tsx`)
- Replaced 3-column category grid with 4 full-width collection rows: Convergence, Zenith, Monolith, Vale
- Layout per row: image left (60%), collection name + description + arrow link right (40%)
- Numbered (01–04), large serif name, animated arrow on hover
- Each row is a link to `/shop?collection=<name>`

### Page composition (`app/(storefront)/page.tsx`)
- Removed `EditorialMoment` (narrative now handled by BrandStatement)
- Order: HeroSection → BrandStatement → FeaturedCollection → CuratedPicks → TrendingNow → LookbookTeaser → NewsletterSignup

---

## 2026-05-11 — Admin polish, analytics, loading screen (session 4)

### Auth & role routing
- Role-based login redirect: admin/staff go to `/admin`, customers to `/account`
- Logout redirects to `/login` instead of homepage
- Navbar shows "Dashboard" (→ `/admin`) for admin/staff, "My Profile" (→ `/account`) for customers, "Sign In" for guests

### Admin analytics page — `app/admin/analytics/`
- New `page.tsx` with KPI cards (revenue, orders, new customers, avg order) and 5 Recharts charts
- `Charts.tsx`: `RevenueOrdersChart` (dual-axis line), `CustomerGrowthChart` (area + gradient), `OrderStatusDonut` (pie), `CategoryRevenueChart` (horizontal bar), `DayOfWeekChart` (vertical bar)
- `PeriodSelector.tsx`: preset buttons (7d / 30d / 90d / All time) + Custom toggle with from/to date inputs
- `lib/db/queries/admin.ts`: `getAnalytics()` now accepts optional `from`/`to` dates; `getDateRange()` helper centralises all period logic; returns `dayCount` for chart filling; category join fixed to go through `productVariants`; status filter uses raw SQL `::order_status[]` cast to avoid Drizzle enum conflict

### Admin sidebar & settings
- Analytics and Settings nav items added to `AdminSidebar`
- `ThemeToggle` added to sidebar footer
- New `app/admin/settings/page.tsx`: Appearance (theme) + password change

### Customer settings — `app/(storefront)/account/settings/page.tsx`
- Appearance section (Light/Dark buttons via `useTheme`)
- Email Notifications section (marketing opt-in + always-on items)
- Privacy & Data section (account deletion instructions)

### Seed scripts
- `scripts/seed-users.ts`: creates test@customer.com, test@staff.com, test@admin.com (password: qwerty123456) via Supabase admin API
- `scripts/seed-orders.ts`: 220 orders over 365 days with recency bias, realistic status distribution (55% delivered, 15% shipped, etc.), 1–3 items per order

### Loading screen
- `#splash` background updated to cream-to-blush gradient (bottom-left cream → center pinkish → top-right blush)
- 10 falling plum blossom SVGs (5 petals, manhwa-delicate) with CSS custom properties (`--dur`, `--delay`, `--drift`, `--spin`) driving a single `@keyframes blossom-fall` definition
- Blossoms rendered server-side in `app/layout.tsx` alongside the "arachchi" wordmark

### Theme default
- `storageKey="arachchi-theme"` added to ThemeProvider, resetting any stored dark preference so new users always start in light mode

---

## 2026-05-11 — Full feature + UI/UX pass (session 3)

### Back-in-stock notifications — `app/actions/admin.ts`
- `updateStockAction` now fetches prior stock before updating; detects 0→positive transition; queries all wishlist users for that variant; sends Resend email via `Promise.allSettled` (fire-and-forget, email failure cannot block the stock update).
- Email template `lib/email/templates/back-in-stock.tsx` rewritten as plain HTML string function (matching existing `order-confirmation.ts` pattern — no extra dependency).

### Journal reading progress — `components/journal/ReadingProgress.tsx` (new)
- Fixed 2px bar at viewport top; `useMotionValue` + `useSpring` (stiffness 120) for smooth tracking; scroll listener updates 0–1 progress; `useTransform` maps to `0%–100%` width. Added to journal article page.

### Shop filters — `components/shop/ShopFilters.tsx`
- **Mobile**: "Filters" button with active-filter count badge; tapping opens a spring-animated bottom sheet (`max-h-[80vh]`, `overflow-y-auto`); backdrop closes it.
- **Active chips**: removable chips render on both mobile bar and desktop sidebar (individual category, tags, and sort chips, each with an × button).
- Extracted `ActiveChip` sub-component.

### Admin responsive — `components/admin/AdminShell.tsx` (new)
- Wraps admin layout; desktop: permanent sidebar; mobile: hamburger in top bar slides the sidebar in as a fixed overlay (spring animation with backdrop).
- `AdminSidebar` now accepts optional `onClose` prop; shows X button on mobile when overlay is open.
- Admin layout simplified to `<AdminShell>{children}</AdminShell>`.

### Admin tables — horizontal scroll on mobile
- Inventory, orders, customers, products tables all wrapped in `overflow-x-auto` div with `min-w` on the table to prevent column collapse on small screens.

### Dark/light theme, Navbar, Mobile menu, Search, Cart drawer, Discounts, Bundles, Wishlist
- (See 2026-05-11 UI/UX session 2 entry below for full details — these were completed in the prior session and carried forward.)

### Build
- `/bundles` storefront listing page marked `export const dynamic = "force-dynamic"` to prevent static prerender failure when bundles table hasn't been migrated yet.
- `npx tsc --noEmit` — 0 errors.
- `npx next build` — clean build, all routes compile.

---

## 2026-05-11 — UI/UX polish pass (pre-phase 8)

### Product gallery — `components/product/ProductGallery.tsx`
- Thumbnail **hover-preview**: hovering a thumbnail swaps the main image instantly; mouse-leave reverts to last clicked (committed) image.
- **Click-to-commit**: clicking a thumbnail permanently locks that image.
- **Zoom on hover**: main image scales to 2.2x centered on cursor position via CSS `transform-origin` tracking; smooth 0.25s ease in/out; crosshair cursor; only activates on pointer devices (`hover: hover` media query).
- **Crossfade** between images via Framer Motion `AnimatePresence` (0.2s fade).
- **Swipe support**: `touchstart`/`touchend` handlers advance/retreat committed index on 50px+ swipe; mobile dot-indicator row added at bottom of main image.
- **Video support**: `mediaType` field drives rendering; URL-extension fallback for existing records; renders `<video autoPlay muted loop playsInline>`; thumbnail shows play-triangle SVG icon.

### Product card — `components/product/ProductCard.tsx`
- Converted to client component to support hooks.
- **Viewport fade-in**: Framer Motion `whileInView` with `once: true`, 0.5s ease-out reveal.
- **Quick-add overlay**: on card hover, a frosted overlay appears at the bottom of the image showing size pills. Clicking a size adds to cart immediately; pill shows `✓` for 1.8s confirmation. Out-of-stock sizes are struck through and disabled.
- Accepts new `id` and optional `variants: CardVariant[]` props; both are backward-compatible (carousel uses spread without variants and continues to work).

### Size guide modal — `components/product/SizeGuideModal.tsx` (new)
- Slide-in right-panel with EU/UK/CA sizing table, measurement instructions.
- Escape-key and backdrop-click to close.

### Variant selector — `components/product/VariantSelector.tsx`
- Added "Size guide" link inline with the size label; opens `SizeGuideModal`.

### Cart icon — `components/layout/CartIcon.tsx`
- Badge bounces on item-add via Framer Motion spring (key change re-triggers initial → animate).

### Product page — sticky right panel
- Info/variant panel gets `lg:sticky lg:top-24 lg:self-start` so the add-to-cart button stays visible while the gallery scrolls.
- Added `scrollbar-none` CSS utility in `globals.css` to hide overflow scrollbar on the sticky panel.

### Schema — `lib/db/schema.ts`
- Added `media_type text default 'image'` to `product_images` table. **Run `npm run db:push` to apply.**

### Queries — `lib/db/queries/products.ts`
- Exported `CardVariant` interface.
- Added `attachVariants` helper (mirrors `attachImages` pattern; two-query, no correlated subquery).
- All four list functions (`getProducts`, `getFeaturedProducts`, `getTrendingProducts`, `getRelatedProducts`) now chain `attachVariants` so cards have size data for quick-add.

---

## 2026-05-10 — Carousel, logo, image fix finalised

### Product images — definitive fix
- `lib/db/queries/products.ts` — replaced all correlated subquery approaches with a two-query `attachImages` helper: fetch product rows, then fetch all their images in one `inArray` query ordered by `position ASC`, merge in JS. Completely eliminates dependency on `is_primary` flag and any Drizzle column-reference serialisation issues. Used by `getProducts`, `getFeaturedProducts`, `getTrendingProducts`, `getRelatedProducts`.
- `components/product/ProductCard.tsx` — `primaryImage` prop type loosened to `string | null` to match actual runtime values.

### Auto-scrolling carousel
- `components/product/ProductCarousel.tsx` — new client component; items rendered twice for seamless loop; `requestAnimationFrame` loop drives `translateX` at 72 px/s on a GPU-composited (`will-change-transform`) inner strip; when offset reaches halfway (end of first set), resets by that amount — no visible jump; delta capped at 64 ms so backgrounded tabs don't lurch on return; pauses on hover/touch, resumes with `lastRef = 0` so first post-pause frame has dt = 0; arrow buttons shift position via modular arithmetic and auto-play continues from new position.
- `components/storefront/CuratedPicks.tsx` — switched from static grid to `ProductCarousel`
- `components/storefront/TrendingNow.tsx` — same; background changed to `bg-secondary` for visual distinction from adjacent sections
- `app/(storefront)/page.tsx` — requests 8 products per section (was 4) to give carousel meaningful depth

### Logo / wordmark
- `components/layout/Navbar.tsx` — wordmark changed to lowercase "arachchi", `font-display` (Nunito 200-weight), removed `uppercase` and `font-serif`
- `components/layout/Footer.tsx` — same treatment
- `app/globals.css` — added `--font-display` to `@theme inline` so `font-display` Tailwind class resolves to Nunito

---

## 2026-05-10 — Image query fix, hero redesign, splash overhaul (Nunito)

### Product images — root cause fixed
- `lib/db/queries/products.ts` — removed `WHERE is_primary = true` from all primaryImage/secondaryImage correlated subqueries; replaced with `ORDER BY position ASC LIMIT 1` (primary) and `LIMIT 1 OFFSET 1` (secondary). The boolean flag can be incorrect if `db:push` zeroed it; position is always reliable. Fixes images in shop, curated picks, trending now, related products.

### Splash screen — visual upgrade
- `app/layout.tsx` — added Nunito (weight 200/300/400) as `--font-display` variable; splash `<span>` changed to lowercase "arachchi"; `display.variable` added to html element
- `app/globals.css` — splash text now uses `--font-display` (Nunito), `font-size: clamp(2.5rem, 8vw, 5.5rem)`, `font-weight: 200`; new `splash-reveal` keyframe animates opacity + letter-spacing + translateY + scale + blur simultaneously; added `#splash::after` thin line that animates width from 0 to 6rem beneath the text

### Hero — left panel redesign
- `components/storefront/HeroSection.tsx` — left panel now uses `bg-secondary` (warmer than background); added: 3px accent-tinted left bar, translucent giant "A" watermark, top-to-content gradient fade, "Autumn / Winter 2026" collection tag with horizontal rule, scroll indicator with "Scroll" label; headline scaled up with clamp; vignette gradient at image/text boundary; right image column adjusted to 46% width

---

## 2026-05-10 — Loading screen fix, typographic hero, image loading fix

### Loading screen — complete rewrite
- Removed React `LoadingScreen` client component (`useEffect`-based); was firing after hydration causing ~100–200ms flash of page content before splash appeared
- `app/layout.tsx` — server-rendered `<div id="splash"><span>Arachchi</span></div>` injected directly in `<body>` before `{children}`; inline `<script>` runs synchronously during HTML parsing (before React hydrates) to check `sessionStorage` and hide splash immediately on repeat visits
- `app/globals.css` — `#splash` and `#splash span` styles + `@keyframes splash-reveal` (opacity + letter-spacing + blur); splash text animates in at 350ms, fades out at 1600ms total (down from 3200ms)
- `app/(storefront)/page.tsx` — removed `<LoadingScreen />` import and usage (replaced by layout-level approach)

### Hero section — redesigned to typographic (no external image)
- `components/storefront/HeroSection.tsx` — removed picsum background image entirely; redesigned as warm cream typographic layout: large `clamp`-sized serif headline with `with intention.` line in accent color, editorial subline copy, dual CTA (Shop + Lookbook), decorative oversized "A" letterform in translucent foreground, scroll cue
- No external image dependency; renders instantly; on-brand; no CSP concerns

### Product images in dev
- `next.config.ts` — `unoptimized: process.env.NODE_ENV === "development"` skips Next.js image optimization pipeline in dev so picsum images load directly without server-side fetch failures
- Added `{ protocol: "https", hostname: "*.picsum.photos" }` to `remotePatterns`; added `https://*.picsum.photos` to CSP `img-src` (picsum redirects to CDN subdomain)

---

## 2026-05-10 — Bug fixes and seed data expansion

### Bug fixes
- `NEXT_PUBLIC_SUPABASE_URL` had `/rest/v1/` appended — removed; Supabase JS client needs just the base URL. This was breaking all auth operations.
- `HeroSection` converted from Client Component (Framer Motion) to Server Component with CSS `@keyframes` animation (`rise`). Text is now always visible regardless of JS hydration state; hero now has a real background image from picsum.
- `components/product/ProductCard.tsx` — null guard: renders `bg-muted` placeholder instead of passing empty string to `<Image src>` when `primaryImage` is null (occurs when seed hasn't run or column migration zeroed `is_primary`).
- `components/product/ProductGallery.tsx` — same null guard on main image and thumbnails.
- `app/globals.css` — added `animation-delay: 0ms !important` to the reduced-motion media query so delayed CSS animations don't hold elements at opacity 0 for users with that preference.
- Added `CRON_SECRET=dev_cron_secret_local` to `.env.local` (was missing).

### Seed data expansion (`scripts/seed.ts` — complete rewrite)
- **Products**: 12 → 60 products (5× increase) across all 6 categories (14 outerwear, 12 knitwear, 10 dresses, 9 trousers, 10 tops, 5 accessories)
- **Related products**: seed now does a second pass after inserting all products and sets `relatedProductIds` to up to 6 same-category products per product; product pages now show 4 meaningful recommendations
- **Image fix**: seed now uses delete-then-insert for product images (instead of `onConflictDoNothing`) — ensures `is_primary = true` is always correctly set for the first image, fixing the pinkish-card issue caused by `db:push` zeroing the `is_primary` column on existing rows
- **Journal**: 8 published articles seeded with full HTML body content, excerpts, cover images, SEO fields, and publish dates
- **Lookbook**: 5 active entries seeded with cover images, editorial body copy, and linked product IDs resolved from product slugs
- Seed uses `onConflictDoUpdate` for all tables — safe to re-run on existing data

## 2026-05-10 — Phase 7: SEO, security, and dashboard overhaul

### Admin dashboard — rebuilt as comprehensive ops center
- `lib/db/queries/admin.ts` `getDashboardStats()` now returns 18 data points: today/7d/30d/all-time revenue, month-over-month % change, avg order value, total and 30d order counts, total customers + 30d new, active product count, newsletter subscriber count, status breakdown, last 8 orders, low-stock variants, top-5 viewed (7d), top-5 selling by revenue (30d from order_items JOIN), daily revenue for last 30 days for chart
- `app/admin/RevenueChart.tsx` — pure CSS bar chart with hover tooltips (no library); fills all 30 days including zero-revenue days; x-axis labels every 7th day
- `app/admin/page.tsx` — fully rebuilt: 4 top metric cards, revenue chart, order status pills, 2-col section (recent orders + customer/catalogue summary), 3-col bottom section (top selling, top viewed, low stock); links to filtered order/inventory views

### SEO
- `app/sitemap.ts` — dynamic sitemap covering all static pages + live products/journal/lookbook/tags; pulls from DB; changeFrequency + priority set per content type
- `app/robots.ts` — disallows admin/account/api/checkout; points to sitemap
- `app/layout.tsx` — improved default metadata (full title template, robots directives, twitter card); Organization JSON-LD in root layout body
- Product page — full OG + Twitter metadata with primary image; Product JSON-LD (AggregateOffer with priceCurrency, lowPrice, availability)
- Journal article page — Article JSON-LD (headline, image, datePublished, dateModified, publisher)

### Security
- `next.config.ts` — security headers on all routes: X-Content-Type-Options, X-Frame-Options (DENY), X-XSS-Protection, Referrer-Policy, Permissions-Policy, HSTS (2-year preload), Content-Security-Policy (Stripe + Supabase whitelisted)
- `middleware.ts` — IP-based rate limiting per route: login (10/min), register (5/min), forgot-password (5/min), webhooks (100/min); returns 429 with Retry-After header; note: in-memory per serverless instance (upgrade to Upstash Redis for full effectiveness)

---

## 2026-05-10 — Phase 6: Content pages

### Added
- `lib/db/queries/content.ts` — read queries for journal (published list, by-slug, admin list, admin by-id) and lookbook (published list, by-slug with linked products, admin list, admin by-id)
- `app/actions/content.ts` — server actions: `saveJournalArticleAction` (create/update, preserves original publishedAt if re-publishing), `deleteJournalArticleAction`, `saveLookbookEntryAction`, `deleteLookbookEntryAction`, `uploadContentImageAction` (reuses `product-images` Supabase Storage bucket), `subscribeToNewsletterAction` (upserts on conflict to re-activate unsubscribed emails)
- `components/admin/RichTextEditor.tsx` — Tiptap editor with StarterKit, Link, Image, Placeholder; toolbar: bold/italic/H1/H2/H3/UL/OL/blockquote/link/unlink/hr/undo/redo
- `components/NewsletterSignup.tsx` — `useActionState` form; shows success message in place of form after subscribe
- `app/(storefront)/about/page.tsx` — hardcoded editorial brand story: hero, brand statement, story split layout, 3 brand values, craft section, CTA to shop, newsletter signup
- `app/(storefront)/journal/page.tsx` — journal index: featured first article (large split layout), remaining in 3-col grid; empty state
- `app/(storefront)/journal/[slug]/page.tsx` — article detail: full-bleed cover image, header with date + title + excerpt, body via `dangerouslySetInnerHTML` (admin-controlled HTML from Tiptap), back link; OG metadata
- `app/(storefront)/lookbook/page.tsx` — lookbook index: stacked editorial image tiles with overlay title, first entry large (16:9), rest shorter (3:1)
- `app/(storefront)/lookbook/[slug]/page.tsx` — lookbook entry: full-bleed hero, description, shoppable product grid with product images + prices; OG metadata
- `app/admin/journal/` — list page (title/status/published/updated + delete), new article page, edit article page, `JournalForm.tsx` client component (title+slug with auto-gen, excerpt, cover image upload or URL paste, Tiptap body, SEO accordion, publish/draft buttons)
- `app/admin/lookbook/` — list page, new entry page, edit entry page, `LookbookForm.tsx` client component (title+slug auto-gen, position, active toggle, cover image, Tiptap description, product multi-select checklist)
- `components/admin/AdminSidebar.tsx` — added Journal and Lookbook nav items

### Packages installed
- `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-image`, `@tiptap/extension-placeholder` (all v3.23.x)

### Fixed
- `requireStaff` exported from `app/actions/admin.ts` so `content.ts` can import it
- `createSupabaseServiceClient` import corrected to `@/lib/auth/server`

---

## 2026-05-10 — Phase 5: Admin panel

### Added
- `lib/db/queries/admin.ts` — all admin read queries: `getDashboardStats()` (3 revenue periods + status counts + low-stock + top-viewed), `getAdminProducts()` (paginated, search, category filter), `getAdminProductById()`, `getAdminTags()`, `getAdminOrders()` (paginated, status + search filter), `getAdminCustomers()` (with order count + total spent via LEFT JOIN), `getInventoryLevels()` (optional low-stock-only filter)
- `app/actions/admin.ts` — all admin mutations behind `requireStaff()` role guard: product create/update (with tag replacement), `archiveProductAction`, variant save/delete, image upload to Supabase Storage, image delete/set-primary, tag save, toggle tag visibility, order status + tracking update, stock update
- `components/admin/AdminSidebar.tsx` — client component using `usePathname()` for active nav state; links: Dashboard, Products, Tags, Orders, Customers, Inventory; footer: Back to site, Sign out
- `app/admin/layout.tsx` — flex full-height layout with `AdminSidebar`; role-guards all admin routes
- `app/admin/page.tsx` — live dashboard: 3 revenue cards (today/7-day/30-day), order status pills linking to filtered order list, low-stock table, top-viewed table
- `app/admin/products/` — list page with GET filter form + pagination; `ProductForm.tsx` (create/edit: all fields, tag checkboxes, related product checkboxes, image upload/delete/set-primary, variants inline via `useActionState`); new product page; edit product page
- `app/admin/tags/` — `TagsManager.tsx` client component with inline create (auto-slug) + inline row editing + visibility toggle; server page wrapper fetches tags and passes to manager
- `app/admin/orders/` — list page with status + search filter + pagination; detail page showing items, totals breakdown, shipping address; `OrderStatusForm.tsx` client component for status + tracking number + tracking URL update via `useActionState`
- `app/admin/customers/page.tsx` — customer list with name/email/order-count/total-spent/joined; search filter + pagination
- `app/admin/inventory/page.tsx` + `StockUpdateForm.tsx` — variant stock levels table with low-stock highlight (≤3 units in red); inline stock update form per variant using `useActionState`
- `app/api/cron/trending/route.ts` — Vercel cron endpoint (Bearer token auth via `CRON_SECRET`): computes top-10 most-viewed products over last 7 days from `product_views`, sets `isTrending=true` on those, clears flag on all others
- `vercel.json` — registers cron at `0 3 * * *` (3 AM UTC daily)
- `lib/db/queries/products.ts` — added `getCategories()` export (returns full category rows ordered by name)

### Fixed
- `deleteProductImageAction` and `setPrimaryImageAction` changed from `useActionState` signature to plain `(formData: FormData)` so they can be used directly as `form action=`
- `archiveProductAction` changed from `.bind(null, productId)` pattern to reading `productId` from formData, eliminating TS type error on `form action=`
- Removed `useEffect` slug auto-generation in `ProductForm.tsx` (violated `react-hooks/set-state-in-effect`); moved logic into `handleChange` for the `name` field when creating a new product
- `getAdminCustomers` return key corrected from `rows` to `customers`

---

## 2026-05-10 — Phase 4: Checkout

### Added
- `lib/stripe/server.ts` — lazy singleton Stripe client; throws a clear error if `STRIPE_SECRET_KEY` is missing so checkout fails loudly rather than silently
- `lib/email/client.ts` — lazy singleton Resend client + `FROM_ADDRESS` constant
- `lib/email/templates/order-confirmation.ts` — branded HTML email: table-based layout, per-item rows with name/variant/qty/total, totals section, CTA button linking to `/account/orders`; no external dependencies
- `app/actions/checkout.ts` — `createCheckoutSession(items, promoCode?)` server action: Zod input validation; server-side price + stock re-fetch via DB join (never trusts client prices); promo code validation against `discounts` table (checks active, date window, usage limit, min subtotal); cart persisted to `carts`/`cart_items` tables; Stripe Checkout session created with CAD line items, shipping options (free above $250 CAD, $15 below), customer email pre-fill; calls `redirect(session.url)` on success
- `app/api/webhooks/stripe/route.ts` — POST route handler: raw body read for Stripe signature verification via `stripe.webhooks.constructEvent`; handles `checkout.session.completed`: idempotency check via `stripeSessionId`; creates `orders` + `order_items` from cart DB data; decrements stock with `GREATEST(qty - sold, 0)` to prevent negatives; increments discount `uses_count`; sends HTML confirmation email via Resend (email failure does not fail webhook); cleans up cart items
- `/cart` (`CartPageContent.tsx` + server page wrapper) — item list with image, name, variant, quantity stepper, remove; free-shipping progress ("Add $X more for free shipping"); subtotal + estimated shipping; promo code input; "Proceed to checkout" calls server action with `useTransition` for pending state; inline error display for stock/validation errors
- `/checkout/success` — server-rendered page: fetches Stripe session to verify `payment_status === "paid"`; shows confirmation message with customer email; links to orders and shop; gracefully degrades if Stripe not configured

### Notes
- `@react-email/components` was installed then removed (all sub-packages deprecated); using plain HTML string template with Resend's `html` prop instead
- Checkout flow is fully wired; activate by adding Stripe keys to `.env.local`
- Local webhook testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

---

## 2026-05-10 — Phase 3: Auth + Account

### Added
- `app/actions/auth.ts` — server actions for the full auth lifecycle: `loginAction` (email + password), `magicLinkAction` (Supabase OTP), `registerAction` (creates Supabase auth user + `public.users` row), `forgotPasswordAction` (always returns success to avoid email enumeration), `resetPasswordAction`, `updateProfileAction`, `changePasswordAction`, `logoutAction`; all inputs Zod-validated, open-redirect protection on login/callback redirects
- `app/auth/callback/route.ts` — exchanges Supabase auth `code` for session, handles magic links and OAuth callbacks, safe relative-only redirect
- `/login` (`LoginForm.tsx` + server page wrapper) — email/password form + magic link section, `redirectTo` passed via hidden field from middleware
- `/register` (`RegisterForm.tsx` + server page wrapper) — name, email, password (min 12), marketing opt-in checkbox, success state with email confirmation message
- `/forgot-password` (`ForgotPasswordForm.tsx` + server page wrapper) — email field, always returns ambiguous success response
- `/reset-password` (`ResetPasswordForm.tsx` + server page wrapper) — new + confirm password, success redirect state
- All auth pages use server component page wrapper + client component form pattern (clean `Metadata` exports without `"use client"` collision)
- `lib/db/queries/orders.ts` — `getOrdersByUser` (50 most recent), `getOrderById` (ownership-checked, with items)
- `app/(storefront)/account/layout.tsx` — sidebar nav (Overview / Orders / Wishlist / Settings / Sign out), auth guard redirects to `/login`
- `app/(storefront)/account/page.tsx` — greeting with user name, last 3 orders, quick links grid
- `app/(storefront)/account/orders/page.tsx` — full order history with status labels and CAD totals
- `app/(storefront)/account/orders/[id]/page.tsx` — order detail: items table, subtotal/shipping/tax/total breakdown, tracking number with external link, help link
- `app/(storefront)/account/wishlist/page.tsx` — product image grid sourced from `wishlists` join; empty state with shop link
- `app/(storefront)/account/settings/page.tsx` — two independent server action forms: profile (name + marketing opt-in) and change password; both show inline success/error feedback
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000` added to `.env.local` (required for Supabase email redirect URLs)

### Fixed
- Zod v4 uses `.issues` not `.errors` on `ZodError` — updated all server action error extraction

---

## 2026-05-10 — Phase 2: Storefront browsing

### Added
- Homepage (`app/(storefront)/page.tsx`) — hero with styled cream-pink placeholder, brand statement, featured collection 4-up grid, editorial moment panel, trending now row, curated picks row; fully server-rendered
- Shop page (`/shop`) — server-side filter by category slug, tag slugs, max price; URL-based filter state (searchParams); sort by newest/price asc/price desc; pagination-ready count query
- Tag collection route (`/shop/tag/[slug]`) — filtered grid with tag heading and back link
- Product detail page (`/product/[slug]`) — 2-column layout, breadcrumb, gallery, variant selector, tags, collapsible details / material & care / shipping panels, "You may also like" related row; fire-and-forget view tracking
- `app/actions/product-view.ts` — server action tracking `product_views` insert + `recently_viewed` upsert (pruned to 20 per user); session ID derived from Supabase auth cookie, never from `Date.now()`
- `stores/cart.ts` — Zustand cart store with `persist` middleware (localStorage); `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `openCart`, `closeCart`, `totalItems`, `subtotalCents`
- `components/cart/CartDrawer.tsx` — Framer Motion slide-in from right, backdrop, full item management, subtotal display
- `components/layout/CartIcon.tsx` — client component with live badge count, wired into Navbar
- `components/product/ProductCard.tsx` — image with hover swap (CSS group-hover), name, price, quick "add" on hover
- `components/product/ProductGallery.tsx` — primary + thumbnail image strip, click to switch
- `components/product/VariantSelector.tsx` — size buttons, low-stock indicator, add-to-cart dispatch
- `components/product/AddToCartButton.tsx` — client wrapper dispatching to Zustand cart store
- `components/shop/ShopFilters.tsx` — client component, URL-driven filter/sort controls, wrapped in `<Suspense>` in shop page
- `lib/db/queries/products.ts` — `getProducts`, `getProductBySlug`, `getRelatedProducts`, `getProductsByTag`, `getCategories`, `getTags`, `getFeaturedProducts`, `getTrendingProducts` using Drizzle dynamic conditions and joins
- Static policy pages: `/shipping`, `/returns`, `/privacy`, `/terms`, `/faq` (accordion with `<details>`), `/contact` (client form), `/size-guide` (measurement table)
- `scripts/seed.ts` — 6 categories, 7 tags, 12 luxury products with XS-XL variants (2 picsum.photos images each); `Pool` created inside async function to avoid dotenv hoisting issue
- `next.config.ts` updated with `remotePatterns` for `picsum.photos` and `*.supabase.co`
- Supabase project created (Canada Central); Drizzle schema pushed; RLS SQL applied; seed data confirmed loaded

### Fixed
- `ProductImage` type not exported from schema — added `export type ProductImage` and `export type ProductVariant`
- `product.metadata` (`unknown` JSONB) rendered as ReactNode — fixed with `!= null` guard and `String(v)` cast
- Seed script pg Pool created at module top level (before dotenv ran) — moved Pool creation inside `seed()` function
- Unescaped HTML entities in policy pages — replaced with `&ldquo;`, `&rdquo;`, `&apos;`

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
