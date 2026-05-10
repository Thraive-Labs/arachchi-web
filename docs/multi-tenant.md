# Multi-Tenant Future


Not part of MVP. Document the approach now so the codebase doesn't paint itself into a corner.

Approach: domain-based multi-tenancy on the same deployment.

- One Vercel project, multiple domains pointing at it
- `middleware.ts` reads `host` header, sets a `brand` context
- Theme tokens swap per brand (separate CSS variables file)
- Database has a `brand_id` column on every tenant-scoped table (products, orders, users, etc.)
- RLS policies enforce `brand_id` boundary in addition to user-level checks
- Stripe: separate webhook endpoint per brand or single endpoint that routes by metadata
- Resend: verified sender domain per brand
- Storage: separate Supabase bucket per brand or shared bucket with brand-prefixed paths

For MVP: build with a `brand_id = 'arachchi'` constant everywhere, but plumb the column and middleware now so adding a second brand is a configuration change, not a refactor.

---

