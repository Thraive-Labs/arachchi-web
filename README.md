# Arachchi

Toronto-based luxury clothing brand — direct-to-consumer e-commerce storefront with a full admin panel, editorial content, and Stripe-powered checkout.

---

## Features

**Storefront**
- Editorial homepage with featured collections, trending products, lookbook teaser, and newsletter signup
- Shop with category, tag, size, color, and price filters
- Tag-based collection routes (`/shop/tag/[slug]`)
- Product detail pages with image gallery, variant selector, size guide, and material/care info
- Shoppable wishlist
- Persistent cart with free-shipping progress bar and promo code support
- Stripe Checkout (hosted, SAQ-A PCI scope)
- Guest and authenticated checkout; order confirmation email via Resend
- Account dashboard: order history, wishlist, profile and password settings

**Editorial**
- Journal (blog) with rich text articles — index + full article pages
- Lookbook with shoppable editorial spreads
- About page with brand story
- Newsletter subscription

**Admin panel** (`/admin`)
- Live dashboard: revenue chart, top sellers, top viewed, recent orders, low-stock alerts, customer and catalogue stats
- Products: create, edit, archive; variant management; image upload to Supabase Storage; tag and related-product assignment
- Tags: create, edit, reorder, visibility toggle
- Orders: list with status/search filters, detail view, status and tracking number update
- Customers: searchable list with order count and total spend
- Inventory: stock levels per variant with inline update, low-stock filter
- Journal: create and edit articles with Tiptap rich text editor, draft/publish workflow
- Lookbook: create and edit entries with product linking

**Technical**
- Next.js 16 App Router — Server Components by default
- TypeScript strict mode throughout
- Supabase Auth + Row Level Security on every table
- Daily Vercel Cron job refreshes trending product flags
- Security headers (CSP, HSTS, X-Frame-Options), sitemap, robots.txt
- JSON-LD structured data (Product, Article, Organization)
- IP-based rate limiting on auth routes in middleware

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4, shadcn/ui primitives |
| Animation | Framer Motion 12 |
| Forms | React Hook Form + Zod |
| Database | Supabase Postgres (Canada Central) |
| ORM | Drizzle |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Payments | Stripe Checkout |
| Email | Resend |
| Rich text | Tiptap |
| Hosting | Vercel |
| Monitoring | Sentry |

---

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (Canada Central region recommended)
- A [Stripe](https://stripe.com) account
- A [Resend](https://resend.com) account with a verified sender domain

---

## Installation

```bash
git clone https://github.com/your-org/arachchi.git
cd arachchi
npm install
```

---

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| `DATABASE_URL` | Supabase → Project Settings → Database → Connection string (URI mode) |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Developers → Webhooks |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API keys |
| `RESEND_API_KEY` | Resend → API Keys |
| `NEXT_PUBLIC_SITE_URL` | Your production domain, e.g. `https://arachchi.com` |
| `CRON_SECRET` | Any random secret string — used to authenticate the Vercel cron endpoint |
| `SENTRY_DSN` | Sentry → Settings → Projects → Client Keys |

For local development set `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.

---

## Database Setup

Push the schema to your Supabase project:

```bash
npm run db:push
```

Seed development data (12 sample products, 7 tags, 6 categories):

```bash
npm run db:seed
```

> **Supabase Storage**: create a bucket named `product-images` in your Supabase project and set it to **public**. Product images and content images both use this bucket.

---

## Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The admin panel is at [http://localhost:3000/admin](http://localhost:3000/admin). Access requires a user with `role = 'staff'` or `role = 'admin'` in the `users` table. Update your user's role directly in the Supabase Table Editor after signing up.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format all files with Prettier |
| `npm run type-check` | Run TypeScript compiler check |
| `npm run db:push` | Push Drizzle schema to database |
| `npm run db:generate` | Generate Drizzle migration files |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:studio` | Open Drizzle Studio (DB GUI) |
| `npm run db:seed` | Seed development data |

---

## Project Structure

```
app/
  (storefront)/       # Public-facing pages (shop, product, cart, account, journal, lookbook)
  (auth)/             # Login, register, forgot/reset password
  admin/              # Admin panel (dashboard, products, orders, etc.)
  api/                # Route handlers (webhooks, cron, health check)
  actions/            # Server actions (auth, checkout, admin, content)
components/
  admin/              # Admin-only components (sidebar, rich text editor)
  product/            # Product gallery, variant selector, product card
  ui/                 # shadcn/ui primitives
lib/
  db/                 # Drizzle client, schema, queries
  auth/               # Supabase server/client helpers
  stripe/             # Stripe singleton
  email/              # Resend client and email templates
  utils.ts            # Shared utilities (formatPriceCents, slugify, etc.)
docs/                 # Architecture and feature documentation
scripts/              # Seed script
```

---

## Stripe Webhook Setup

1. In the Stripe Dashboard, go to **Developers → Webhooks → Add endpoint**
2. Set the endpoint URL to `https://your-domain.com/api/webhooks/stripe`
3. Listen for the `checkout.session.completed` event
4. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`

---

## Deployment

The project is designed for [Vercel](https://vercel.com):

1. Push to GitHub and import the repo in Vercel
2. Add all environment variables in the Vercel project settings
3. The `vercel.json` at the root registers a daily cron job (`0 3 * * *`) that refreshes trending product flags — add `CRON_SECRET` to your Vercel env vars to secure it
4. Set your custom domain in Vercel → Domains

---

## License

Private — all rights reserved.
