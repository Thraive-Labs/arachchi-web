# Page Specifications


## Homepage `/`

Editorial-first. The user should not see a product grid above the fold.

Sections, in order:
1. **Hero**: full-viewport (100vh) image or short autoplay-muted-loop video, brand tagline overlaid with fade-up, scroll cue at bottom.
2. **Brand statement**: short editorial paragraph, large serif type, generous whitespace.
3. **Featured collection**: 2–4 large image tiles, each linking to a collection in `/shop` or to a tag-based collection at `/shop/tag/[slug]`.
4. **Editorial moment**: split layout, image + narrative paragraph + CTA to `/about` or `/journal/[slug]`.
5. **Curated picks**: 4–6 hand-selected products in a horizontal scroll or asymmetric grid (not a generic grid). Sourced from `products WHERE is_featured = true ORDER BY position`.
6. **Trending now**: 4-6 products. Auto-populated from `products WHERE is_trending = true`, with `is_trending` flag set by a daily background job that picks top sellers and most-viewed in the last 30 days. Admin can also manually set the flag.
7. **Lookbook teaser**: large editorial image with link to `/lookbook`.
8. **Newsletter signup**: simple email field, refined styling, subtle.
9. **Footer**.

## Shop `/shop` and `/shop/[category]`

This is where buying actually happens.

- Filter sidebar (desktop) / drawer (mobile): category, **tags (visible tags only)**, size, color, price range, availability
- Sort: newest, price ascending, price descending, bestsellers
- Product grid: 4 columns desktop, 2 mobile, full-bleed images, hover swap to second image
- Pagination or infinite scroll (recommend pagination for SEO)
- Empty/loading states styled
- **Tag-based collection routes**: `/shop/tag/[tag-slug]` (e.g. `/shop/tag/summer-2026`, `/shop/tag/gift-guide`) - same UI as category page, filtered by tag

## Product detail `/product/[slug]`

- Image gallery: thumbnails on desktop left, swipeable on mobile, click to zoom (use a library like `yet-another-react-lightbox` or build a simple zoom modal)
- Product name, price, short description
- Variant selector: size (XS, S, M, L, XL, XXL, XXXL for clothing; numeric for shoes; configured per category)
- Color/material selector if applicable
- Stock indicator (only show "low stock" when ≤ 3, never invented "X people viewing")
- Add to cart, add to wishlist
- Long description (rich text)
- Tags displayed below description as small links to `/shop/tag/[slug]` (visible tags only)
- Size guide link (opens modal)
- Material and care info (collapsible)
- Shipping and returns info (collapsible)
- Reviews section (deferred; show "No reviews yet" placeholder at launch)
- **"You may also like"** (4-6 products): admin-curated `related_product_ids` first, then filled in from same category by recency
- **"Complete the look"** (only shown if curated): admin-curated `pairing_product_ids`, hidden if empty
- On page view: log to `product_views` table and update `recently_viewed` for logged-in users (fire-and-forget server action, don't block render)

## Cart

Two surfaces share the same state:
- **Cart drawer**: slide-in from right, accessible from any page via cart icon
- **Cart page** `/cart`: full-page review before checkout

Both show: line items with image, name, variant, quantity stepper, line total, remove button. Subtotal, estimated shipping, estimated tax, total. Promo code field. Proceed to checkout button.

The cart drawer also includes a small **"You might add"** strip (2-3 products) showing bestsellers from the same categories as the items in the cart. Hidden when the cart is empty.

Cart persists in:
- `localStorage` for guests
- `cart` table in Postgres for logged-in users, keyed by user_id
- On login, merge guest localStorage cart into server cart

## Checkout

Use **Stripe Checkout** (hosted page) for MVP. This minimizes PCI scope to SAQ-A and provides a polished, PCI-compliant flow including Apple Pay, Google Pay, and Link out of the box.

Flow:
1. User clicks "Checkout" in cart
2. Server action validates cart server-side: re-fetches all prices, re-checks stock, recomputes totals
3. Server creates Stripe Checkout session with line items, shipping options, customer email if known
4. User redirects to Stripe-hosted page
5. After payment, Stripe redirects to `/checkout/success?session_id=...`
6. Stripe webhook to `/api/webhooks/stripe` confirms payment, creates order, decrements inventory, sends confirmation email
7. Success page shows order summary

Never trust client-side prices or totals. Always recompute server-side at session creation and re-verify in the webhook.

## Account pages

- `/account`: dashboard with recent orders, profile summary, quick links
- `/account/orders`: full order history
- `/account/orders/[id]`: order detail with tracking, items, totals
- `/account/wishlist`: saved products
- `/account/settings`: profile, addresses, password, MFA toggle

## Auth pages

- `/login`: email + password, "Continue with Google", magic link option
- `/register`: email, password, marketing opt-in checkbox
- `/forgot-password`: email field, sends reset link
- `/reset-password`: new password form, validates token

## Editorial pages

- `/about`: brand story, founder narrative, photography
- `/lookbook`: curated editorial spreads, shoppable images (each look links to its products)
- `/journal`: blog index (articles, categories)
- `/journal/[slug]`: article detail with rich text, images, related products

## Policy pages

- `/shipping`: zones, methods, timelines, costs, customs note for international
- `/returns`: 30-day return policy (configurable), process, prepaid label info, exceptions
- `/privacy`: PIPEDA-compliant policy
- `/terms`: terms of service
- `/faq`: accordion grouped by topic
- `/contact`: contact form, business address, support email
- `/size-guide`: interactive size charts per category

## Admin `/admin/*`

Protected route. Only users with role `admin` or `staff` can access. RBAC enforced both in middleware and at the database layer via RLS.

Sections:
- Dashboard: revenue today/week/month, orders by status, low-stock alerts, top-viewed products this week
- Products: list, create, edit, archive, manage variants and images, **assign tags**, **set related and pairing products**, bulk operations
- Tags: list, create, edit, archive, set visibility, reorder. Bulk-assign tag to selected products from products list.
- Orders: list, filter by status, view detail, mark as shipped, generate label, refund, add note
- Customers: list, search, view order history, view loyalty
- Inventory: stock levels per variant, bulk update, low-stock thresholds
- Discounts: create percentage / fixed / free shipping codes, set rules and expiry
- Content: edit journal articles, lookbook entries, homepage banners, featured collections
- Settings: shipping zones, tax rates, store info, integrations

Roles:
- `admin`: full access
- `staff`: products, orders, inventory, customers (no settings, no discounts beyond view, no user management)
- `customer`: storefront only

---

