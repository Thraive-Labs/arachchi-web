# MVP Phasing


Build in this order. Do not skip ahead. Each phase ends with a working, deployable site at that level of completeness.

## Phase 1: Foundation (week 1)
- Initialize Next.js 16 project with TypeScript, Tailwind 4, ESLint, Prettier
- Set up Supabase project in Canada Central, configure auth
- Drizzle schema for users, products, variants, categories, orders, cart_items
- RLS policies on all tables
- Layout, Navbar, Footer with brand styling
- Loading screen component
- Brand tokens, typography, basic UI primitives via shadcn/ui

## Phase 2: Storefront browsing (week 2)
- Homepage with hero, brand statement, featured collection, editorial moment, curated picks, trending now, footer
- Shop page with filters (category, tags, size, color, price), sort, grid
- Tag-based collection routes (`/shop/tag/[slug]`)
- Product detail page with gallery, variant selector, tags display, "you may also like", add to cart
- Product view tracking (server action logs to `product_views`)
- Cart drawer + cart page with "you might add" suggestions
- Static policy pages (shipping, returns, privacy, terms, FAQ, contact, size guide)
- Mock data seeded for development

## Phase 3: Auth and account (week 3)
- Login, register, forgot password, reset password
- Email verification flow
- Account dashboard, orders, wishlist, settings, addresses
- MFA setup

## Phase 4: Checkout and payments (week 4)
- Stripe Checkout integration
- Server-side cart validation
- Stripe webhook handler creating orders, decrementing inventory
- Order confirmation page
- Transactional emails via Resend (welcome, order confirmation, shipping update, password reset)

## Phase 5: Admin (week 5)
- Admin layout with RBAC guard
- Products CRUD with image upload to Supabase Storage
- Variants management
- Tags management (create, edit, bulk-assign to products)
- Related products and pairing products curation per product
- Orders list and detail with status update
- Inventory levels view
- Customers list
- Daily Vercel Cron job to update `is_trending` flags

## Phase 6: Content (week 6)
- Journal index and article pages
- Lookbook
- About page with editorial copy
- Newsletter subscription flow
- Admin content editing for journal, lookbook, homepage banners

## Phase 7: SEO, performance, security pass (week 7)
- Metadata helpers, JSON-LD, sitemap, robots
- Performance audit (Lighthouse 90+ on key pages)
- Security headers configured
- Rate limiting on auth and checkout
- Accessibility audit with axe
- E2E tests for critical flows: register, login, browse, add to cart, checkout, view order

## Phase 8: Pre-launch (week 8)
- Stripe in test mode end-to-end test
- DNS, Vercel domain, SSL
- Production env vars set
- Backup schedule confirmed
- Monitoring (Sentry) live with alert routing
- Soft launch to small audience for feedback
- Public launch

---

