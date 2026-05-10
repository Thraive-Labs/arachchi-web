# SEO and Accessibility


## Metadata

Every page exports `metadata` (or `generateMetadata`) using the Next.js Metadata API. Include `title`, `description`, `openGraph`, `twitter` cards.

Provide a helper in `lib/seo.ts` to build consistent metadata.

## Structured Data (JSON-LD)

Inject on relevant pages:
- Homepage: `Organization`
- Product detail: `Product` with `offers`, `aggregateRating` once reviews exist
- Article: `BlogPosting`
- Breadcrumbs: `BreadcrumbList`

## Sitemap and Robots

- `app/sitemap.ts` auto-generates entries for all public products, categories, journal articles, and static pages
- `app/robots.ts` allows everything except `/admin`, `/api`, `/account`, `/checkout`

## URL Structure

- `/product/[slug]` not `/product/[id]`
- `/shop/[category-slug]`
- Canonical tags on filtered/paginated pages
- Trailing slashes consistent (Next.js default)

## Performance and SEO

Core Web Vitals are ranking factors. Performance targets in Section 8 are also SEO targets.

---


Target: WCAG 2.1 AA.

- Semantic HTML (`<button>`, `<nav>`, `<main>`, `<article>`)
- All images have descriptive `alt` text
- All form fields have associated `<label>`
- Color contrast 4.5:1 for body text, 3:1 for large text
- Keyboard navigation works for every interactive element including the cart drawer and modals
- Focus states are visible and styled (not removed)
- ARIA where semantic HTML is insufficient (announcement of cart updates, loading states)
- `prefers-reduced-motion` respected by all animations
- Test with axe DevTools and keyboard-only navigation before launch

---

