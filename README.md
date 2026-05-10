# Arachchi

Toronto-based luxury clothing brand — direct-to-consumer e-commerce storefront with a full admin panel, editorial content, and Stripe-powered checkout.

---

## Features

**Storefront**
- Editorial homepage with featured collections, trending products, lookbook teaser, and newsletter signup
- Shop with category, tag, and sort filters; mobile collapsible filter panel with active filter chips
- Tag-based collection routes (`/shop/tag/[slug]`)
- Product detail pages with image gallery (hover-preview, zoom, crossfade, swipe, video support), variant selector, size guide modal, wishlist button
- Persistent cart with free-shipping progress bar and promo code support
- Stripe Checkout (hosted, SAQ-A PCI scope)
- Guest and authenticated checkout; order confirmation email via Resend
- Account dashboard: order history, wishlist, profile and password settings
- Back-in-stock email notifications when wishlisted items are restocked
- Bundles — curated product sets at a combined price, availability gated on all-item stock
- Dark / light theme with system preference detection

**Editorial**
- Journal (blog) with rich text articles — index + full article pages with reading progress bar
- Lookbook with shoppable editorial spreads
- About page with brand story
- Newsletter subscription

**Admin panel** (`/admin`)
- Live dashboard: revenue chart, top sellers, top viewed, recent orders, low-stock alerts
- Products: create, edit, archive; variant management; image and video upload to Supabase Storage
- Tags, Orders, Customers, Inventory, Bundles, Discounts — full CRUD
- Journal and Lookbook with Tiptap rich text editor
- Mobile-responsive: collapsible sidebar on small screens, all data tables horizontally scrollable

**Technical**
- Next.js 16 App Router — Server Components by default
- TypeScript strict mode, 0 errors
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
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account
- A [Resend](https://resend.com) account with a verified sender domain

---

## Fresh Setup — Step by Step

Follow these steps in order when setting up on a new Supabase project.

### 1. Clone and install

```bash
git clone https://github.com/your-org/arachchi.git
cd arachchi
npm install
```

### 2. Create your Supabase project

Go to [supabase.com](https://supabase.com), create a new project (Canada Central region recommended), and wait for it to provision.

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in every value. See the **Environment Variables** table below for where to find each one.

### 4. Push the database schema

This creates all tables in your Supabase Postgres database:

```bash
npm run db:push
```

> Use the **Transaction** connection string from Supabase → Project Settings → Database → Connection string. Set it as `DATABASE_URL` in `.env.local`.

### 5. Run the RLS setup

Open the **SQL Editor** in your Supabase dashboard and run `supabase/rls.sql` in full. This:
- Enables Row Level Security on every table (default deny)
- Creates the `is_staff_or_admin()` helper function
- Creates all access policies

Copy the entire file contents and paste into the SQL Editor, then click **Run**.

### 6. Set up Supabase Storage

In the SQL Editor, run `supabase/storage.sql`. This:
- Creates the `product-images` bucket (public, 5 MB limit)
- Creates the public read policy for serving uploaded images

### 7. Create your admin account

1. Start the dev server: `npm run dev`
2. Go to `http://localhost:3000/register` and sign up with your email
3. In the Supabase SQL Editor, open `supabase/make-admin.sql`, replace `your@email.com` with the email you just registered, and run it

You can now log in and access `/admin`.

### 8. Seed sample data (optional)

Populates the database with 60 products, 6 categories, 7 tags, 8 journal articles, and 5 lookbook entries for development:

```bash
npm run db:seed
```

### 9. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The admin panel is at [http://localhost:3000/admin](http://localhost:3000/admin).

---

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values.

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role secret key |
| `DATABASE_URL` | Supabase → Project Settings → Database → Connection string → Transaction mode URI |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys → Secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Developers → Webhooks → Signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API keys → Publishable key |
| `RESEND_API_KEY` | Resend → API Keys |
| `NEXT_PUBLIC_SITE_URL` | Your production domain (`https://arachchi.com`). Use `http://localhost:3000` locally. |
| `CRON_SECRET` | Any random secret string — secures the Vercel cron endpoint |
| `SENTRY_DSN` | Sentry → Settings → Projects → your project → Client Keys |

---

## Supabase SQL Files

All files are in the `supabase/` folder. Run them in the SQL Editor in this order:

| File | When to run | What it does |
|---|---|---|
| `supabase/rls.sql` | Once after `db:push` | Enables RLS on all tables, creates all access policies |
| `supabase/storage.sql` | Once after `rls.sql` | Creates the `product-images` bucket, sets public read policy |
| `supabase/make-admin.sql` | Once after signing up | Promotes your account to `admin` role |

> **Re-running:** `rls.sql` and `storage.sql` are mostly idempotent (`OR REPLACE`, `ON CONFLICT DO UPDATE`) but policy `CREATE` statements will error if the policy already exists. If you need to re-run after schema changes, drop the affected policies first or use `DROP POLICY IF EXISTS` before re-applying.

---

## Stripe Webhook Setup

1. In the Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
3. Select event: `checkout.session.completed`
4. Copy the signing secret → `STRIPE_WEBHOOK_SECRET` in your env vars

Test locally with the [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Deployment (Vercel)

1. Push to GitHub and import the repo in Vercel
2. Add all environment variables in Vercel → Project Settings → Environment Variables
3. Set your custom domain in Vercel → Domains
4. The `vercel.json` registers a daily cron (`0 3 * * *`) that refreshes trending flags — `CRON_SECRET` must be set

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
  actions/            # Server actions (auth, checkout, admin, content, wishlist, search)
components/
  admin/              # Admin sidebar, shell, rich text editor
  cart/               # Cart drawer
  journal/            # Reading progress bar
  layout/             # Navbar, footer, mobile menu, search overlay, theme toggle
  product/            # Gallery, variant selector, product card, wishlist button, size guide
  shop/               # Filter sidebar
  storefront/         # Homepage sections (hero, editorial, carousel, newsletter)
lib/
  db/                 # Drizzle client, schema, queries
  auth/               # Supabase server/client helpers
  stripe/             # Stripe singleton
  email/              # Resend client and email templates
supabase/
  rls.sql             # Row Level Security — run after db:push
  storage.sql         # Storage bucket setup — run after rls.sql
  make-admin.sql      # Promote a user to admin role
scripts/
  seed.ts             # Development seed data
```

---

## License

Private — all rights reserved.
