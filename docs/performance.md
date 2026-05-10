# Performance and Caching


Targets:
- LCP under 1.8s on 4G
- INP under 200ms
- CLS under 0.1
- Lighthouse Performance score 90+ on every key page

## Rendering Strategy

- Marketing pages (home, about, lookbook, journal): **SSG with ISR** (`export const revalidate = 3600`)
- Product listing pages: **ISR** with shorter revalidate (300s) and on-demand revalidation on product update via webhook
- Product detail pages: **ISR** with on-demand revalidation
- Cart, checkout, account: **Dynamic** (always fresh, per-user)
- Admin: **Dynamic**

## Image Optimization

- Always use `next/image`
- Serve AVIF and WebP, fall back to JPEG/PNG
- Set explicit `width` and `height` to prevent CLS
- `priority` only on above-the-fold hero images
- Lazy-load everything else (default behavior)
- Configure `images.remotePatterns` in `next.config.ts` for Supabase Storage

## Font Optimization

- `next/font/google` with `display: swap`
- Preload only the primary heading and body weights
- Subset to Latin only for now

## Code Splitting

- Server Components by default
- `"use client"` only where genuinely needed (interactive components: cart, search, forms)
- Dynamic imports (`next/dynamic`) for heavy below-the-fold components like the lightbox

## Database Performance

- Use Supabase transaction pooler (port 6543) for serverless connections
- Add indexes documented in Section 6.1
- Avoid N+1: use joins or `IN (...)` queries
- For product listings, paginate at 24 items per page

## Caching Strategy

- Vercel edge cache for static and ISR pages (free, automatic)
- HTTP `Cache-Control` headers tuned per route
- Revalidate ISR via Supabase webhook on product / category updates
- No Redis at launch. Add Upstash if app-level cache becomes necessary.

---

