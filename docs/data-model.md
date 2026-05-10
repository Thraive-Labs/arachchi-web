# Data Model


This is the launch schema. Drizzle in `lib/db/schema.ts`.

```ts
// Core tables (simplified — full Drizzle schema goes in code)

users {
  id uuid pk (Supabase Auth user id)
  email text unique
  full_name text
  phone text nullable
  role enum('customer', 'staff', 'admin') default 'customer'
  marketing_opt_in boolean default false
  created_at timestamptz
  updated_at timestamptz
}

addresses {
  id uuid pk
  user_id uuid fk users
  type enum('shipping', 'billing')
  is_default boolean default false
  full_name text
  line1 text
  line2 text nullable
  city text
  province text
  postal_code text
  country text default 'CA'
  phone text nullable
  created_at timestamptz
}

categories {
  id uuid pk
  parent_id uuid fk categories nullable
  slug text unique
  name text
  description text
  image_url text nullable
  position int
  is_active boolean default true
  created_at timestamptz
}

products {
  id uuid pk
  slug text unique
  name text
  description text                   -- rich text
  short_description text
  category_id uuid fk categories
  base_price_cents int               -- in CAD cents
  compare_at_price_cents int nullable
  is_active boolean default true
  is_featured boolean default false
  is_trending boolean default false  -- admin override, also auto-set by job
  related_product_ids uuid[]         -- manual "you may also like" curation
  pairing_product_ids uuid[]         -- manual "complete the look" curation
  metadata jsonb                     -- material, care, etc.
  seo_title text nullable
  seo_description text nullable
  created_at timestamptz
  updated_at timestamptz
}

tags {
  id uuid pk
  slug text unique                   -- 'summer-2026', 'gift-guide', 'under-200'
  name text                          -- display name
  description text nullable
  is_visible boolean default true    -- show as a filterable facet on /shop
  position int                       -- for ordering in UI
  created_at timestamptz
}

product_tags {
  product_id uuid fk products
  tag_id uuid fk tags
  created_at timestamptz
  primary key (product_id, tag_id)
}

product_views {
  id uuid pk
  product_id uuid fk products
  user_id uuid fk users nullable     -- null for guests
  session_id text nullable           -- for guest tracking
  viewed_at timestamptz
  -- index on (product_id, viewed_at), (user_id, viewed_at), (session_id, viewed_at)
}

recently_viewed {
  user_id uuid fk users
  product_id uuid fk products
  last_viewed_at timestamptz
  primary key (user_id, product_id)
  -- keep only last 20 per user via background job or trigger
}

product_images {
  id uuid pk
  product_id uuid fk products
  url text
  alt text
  position int
  is_primary boolean default false
}

product_variants {
  id uuid pk
  product_id uuid fk products
  sku text unique
  size text nullable                 -- 'XS', 'S', 'M', '42', etc.
  color text nullable
  color_hex text nullable
  price_cents int                    -- can override base_price_cents
  stock_quantity int default 0
  weight_grams int nullable
  is_active boolean default true
  created_at timestamptz
}

carts {
  id uuid pk
  user_id uuid fk users nullable     -- null for guest carts identified by session
  session_id text nullable
  created_at timestamptz
  updated_at timestamptz
}

cart_items {
  id uuid pk
  cart_id uuid fk carts
  variant_id uuid fk product_variants
  quantity int
  created_at timestamptz
}

orders {
  id uuid pk
  order_number text unique           -- human-readable, e.g. ARA-2026-00001
  user_id uuid fk users nullable     -- guests allowed
  email text
  status enum('pending', 'paid', 'fulfilled', 'shipped', 'delivered', 'cancelled', 'refunded')
  payment_status enum('pending', 'paid', 'failed', 'refunded')
  subtotal_cents int
  shipping_cents int
  tax_cents int
  discount_cents int
  total_cents int
  currency text default 'CAD'
  stripe_session_id text nullable
  stripe_payment_intent_id text nullable
  shipping_address_id uuid fk addresses
  billing_address_id uuid fk addresses
  shipping_method text
  tracking_number text nullable
  tracking_url text nullable
  notes text nullable
  created_at timestamptz
  updated_at timestamptz
}

order_items {
  id uuid pk
  order_id uuid fk orders
  variant_id uuid fk product_variants
  product_name text                  -- snapshot at order time
  variant_label text                 -- snapshot
  unit_price_cents int               -- snapshot
  quantity int
  line_total_cents int
}

discounts {
  id uuid pk
  code text unique
  type enum('percentage', 'fixed', 'free_shipping')
  value int                          -- percent or cents
  min_subtotal_cents int nullable
  max_uses int nullable
  uses_count int default 0
  applies_to enum('all', 'category', 'product') default 'all'
  category_id uuid fk categories nullable
  product_id uuid fk products nullable
  starts_at timestamptz nullable
  ends_at timestamptz nullable
  is_active boolean default true
  created_at timestamptz
}

wishlists {
  id uuid pk
  user_id uuid fk users
  variant_id uuid fk product_variants
  created_at timestamptz
  unique(user_id, variant_id)
}

journal_articles {
  id uuid pk
  slug text unique
  title text
  excerpt text
  body text                          -- rich text / MDX
  cover_image_url text
  author_id uuid fk users
  status enum('draft', 'published') default 'draft'
  published_at timestamptz nullable
  seo_title text nullable
  seo_description text nullable
  created_at timestamptz
  updated_at timestamptz
}

lookbook_entries {
  id uuid pk
  slug text unique
  title text
  cover_image_url text
  body text
  product_ids uuid[]                 -- shoppable products
  position int
  is_active boolean default true
  created_at timestamptz
}

newsletter_subscribers {
  id uuid pk
  email text unique
  source text                        -- 'homepage', 'footer', etc.
  is_active boolean default true
  created_at timestamptz
}

audit_log {
  id uuid pk
  actor_id uuid fk users nullable
  action text                        -- 'order.refund', 'product.update', etc.
  resource_type text
  resource_id text
  metadata jsonb
  ip_address text nullable
  user_agent text nullable
  created_at timestamptz
}
```

## Indexes

Add at minimum:
- `products(slug)`, `products(category_id, is_active)`, `products(is_featured) WHERE is_featured`, `products(is_trending) WHERE is_trending`
- `product_variants(product_id)`, `product_variants(sku)`
- `product_tags(tag_id)` and `product_tags(product_id)`
- `tags(slug)`, `tags(is_visible) WHERE is_visible`
- `product_views(product_id, viewed_at DESC)`, `product_views(user_id, viewed_at DESC)`, `product_views(session_id, viewed_at DESC)`
- `recently_viewed(user_id, last_viewed_at DESC)`
- `orders(user_id)`, `orders(email)`, `orders(status)`, `orders(created_at DESC)`
- `cart_items(cart_id)`
- GIN index on `products(name, description)` for full-text search

## Row Level Security (RLS)

Enable RLS on every table. Default deny. Examples:

```sql
-- Users can read and update only their own row
CREATE POLICY "users self read" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users self update" ON users FOR UPDATE USING (auth.uid() = id);

-- Anyone can read active products
CREATE POLICY "products public read" ON products FOR SELECT USING (is_active = true);

-- Only staff/admin can write products
CREATE POLICY "products staff write" ON products FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('staff', 'admin')));

-- Users see only their own orders; staff/admin see all
CREATE POLICY "orders own" ON orders FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('staff', 'admin'))
  );
```

Every table gets equivalent policies. Treat RLS as the ultimate backstop — never rely solely on application code to enforce access.

---

