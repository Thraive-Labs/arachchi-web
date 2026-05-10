# Security Requirements


These are not optional. Every item is part of the launch checklist.

## Payment Security

- Use Stripe Checkout (hosted) for MVP. Card data never touches our server. PCI scope: SAQ-A.
- Verify Stripe webhook signatures using `stripe.webhooks.constructEvent` with `STRIPE_WEBHOOK_SECRET`.
- Never trust client-side cart totals. Recompute prices, taxes, shipping server-side at session creation and again in the webhook before fulfilling.
- Idempotency: webhook handlers must be idempotent (same event delivered twice must not create duplicate orders). Use the Stripe event ID as a deduplication key.

## Authentication

- Supabase Auth handles password hashing, session tokens, refresh rotation.
- Enforce minimum password length 12, common-password blocklist (Supabase handles this).
- Email verification required before checkout.
- MFA available in account settings; required for admin and staff roles.
- Session cookies: `HttpOnly`, `Secure`, `SameSite=Lax`.
- Auth tokens never logged or stored in localStorage.

## Authorization

- RBAC enforced in three layers:
  1. Middleware (`middleware.ts`): admin routes redirect non-staff
  2. Server actions / route handlers: explicit role check
  3. RLS policies: database refuses unauthorized reads/writes regardless of code
- Never use `service_role` key on the client. Server-only env var.

## Input Validation

- Every form, server action, and API route validates input with Zod.
- Reject unexpected fields. Use `.strict()` on all schemas.
- Validate IDs are UUID format before database queries.
- Sanitize rich text content (journal, product descriptions) with DOMPurify or rehype-sanitize before rendering.

## Rate Limiting

Use Vercel's built-in rate limiting (or a simple Postgres counter for MVP). Add Upstash Redis later if needed.

Limits at launch:
- Login attempts: 5 per IP per 15 minutes
- Password reset requests: 3 per email per hour
- Registration: 5 per IP per hour
- Checkout session creation: 10 per session per hour
- Newsletter signup: 3 per IP per hour

## HTTP Security Headers

Set in `next.config.ts`:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://js.stripe.com https://*.vercel.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://*.supabase.co https://*.stripe.com;
  font-src 'self' data:;
  connect-src 'self' https://*.supabase.co https://api.stripe.com;
  frame-src https://js.stripe.com https://hooks.stripe.com;
  frame-ancestors 'none';

Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Data Protection

- Supabase region: Canada Central (PIPEDA-friendly).
- Encryption at rest (Supabase default).
- TLS 1.3 in transit.
- Sensitive fields in audit log encrypted at column level if they contain PII.
- Daily automated database backups (Supabase Pro feature).

## Secrets Management

- All secrets in `.env.local` (gitignored) and Vercel project env vars.
- `.env.example` committed with placeholder values and clear comments.
- Never commit, log, or echo secrets. Treat the Stripe webhook secret and Supabase service role as classified.

## Dependency Hygiene

- `npm audit` in CI on every PR
- Dependabot enabled for security updates
- Review and update dependencies quarterly

## Admin Hardening

- Admin routes on a separate path (`/admin`) with strict middleware
- MFA enforced for any user with `staff` or `admin` role
- Admin actions logged to `audit_log`
- Consider IP allowlist for admin once team is fixed

---

