-- ============================================================
-- Arachchi — Row Level Security
-- ============================================================
-- Run this ONCE in the Supabase SQL Editor after pushing the
-- Drizzle schema (npm run db:push).
--
-- This file is safe to re-run: all statements use
-- CREATE OR REPLACE or are idempotent where possible.
-- If you need to reset policies, run supabase/reset-policies.sql
-- first, then re-run this file.
-- ============================================================

-- ── 1. Enable RLS on every table (default deny) ────────────────────────

ALTER TABLE users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses            ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories           ENABLE ROW LEVEL SECURITY;
ALTER TABLE products             ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags         ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images       ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants     ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views        ENABLE ROW LEVEL SECURITY;
ALTER TABLE recently_viewed      ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts                ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders               ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists            ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_products      ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_articles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE lookbook_entries     ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log            ENABLE ROW LEVEL SECURITY;


-- ── 2. Helper function ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION is_staff_or_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND role IN ('staff', 'admin')
  );
$$;


-- ── 3. users ────────────────────────────────────────────────────────────

CREATE POLICY "users: self read"
  ON users FOR SELECT
  USING (auth.uid() = id OR is_staff_or_admin());

CREATE POLICY "users: self update"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "users: staff read all"
  ON users FOR SELECT
  USING (is_staff_or_admin());


-- ── 4. addresses ────────────────────────────────────────────────────────

CREATE POLICY "addresses: owner read"
  ON addresses FOR SELECT
  USING (user_id = auth.uid() OR is_staff_or_admin());

CREATE POLICY "addresses: owner insert"
  ON addresses FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "addresses: owner update"
  ON addresses FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "addresses: owner delete"
  ON addresses FOR DELETE
  USING (user_id = auth.uid());


-- ── 5. categories ───────────────────────────────────────────────────────

CREATE POLICY "categories: public read"
  ON categories FOR SELECT
  USING (is_active = true OR is_staff_or_admin());

CREATE POLICY "categories: staff write"
  ON categories FOR ALL
  USING (is_staff_or_admin());


-- ── 6. products ─────────────────────────────────────────────────────────

CREATE POLICY "products: public read"
  ON products FOR SELECT
  USING (is_active = true OR is_staff_or_admin());

CREATE POLICY "products: staff write"
  ON products FOR ALL
  USING (is_staff_or_admin());


-- ── 7. tags ─────────────────────────────────────────────────────────────

CREATE POLICY "tags: public read"
  ON tags FOR SELECT
  USING (true);

CREATE POLICY "tags: staff write"
  ON tags FOR ALL
  USING (is_staff_or_admin());


-- ── 8. product_tags ─────────────────────────────────────────────────────

CREATE POLICY "product_tags: public read"
  ON product_tags FOR SELECT
  USING (true);

CREATE POLICY "product_tags: staff write"
  ON product_tags FOR ALL
  USING (is_staff_or_admin());


-- ── 9. product_images ───────────────────────────────────────────────────

CREATE POLICY "product_images: public read"
  ON product_images FOR SELECT
  USING (true);

CREATE POLICY "product_images: staff write"
  ON product_images FOR ALL
  USING (is_staff_or_admin());


-- ── 10. product_variants ────────────────────────────────────────────────

CREATE POLICY "product_variants: public read"
  ON product_variants FOR SELECT
  USING (is_active = true OR is_staff_or_admin());

CREATE POLICY "product_variants: staff write"
  ON product_variants FOR ALL
  USING (is_staff_or_admin());


-- ── 11. product_views ───────────────────────────────────────────────────

CREATE POLICY "product_views: insert any"
  ON product_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "product_views: staff read"
  ON product_views FOR SELECT
  USING (is_staff_or_admin());


-- ── 12. recently_viewed ─────────────────────────────────────────────────

CREATE POLICY "recently_viewed: owner"
  ON recently_viewed FOR ALL
  USING (user_id = auth.uid());


-- ── 13. carts ───────────────────────────────────────────────────────────

CREATE POLICY "carts: owner"
  ON carts FOR ALL
  USING (
    user_id = auth.uid()
    OR (user_id IS NULL AND session_id IS NOT NULL)
  );


-- ── 14. cart_items ──────────────────────────────────────────────────────

CREATE POLICY "cart_items: owner via cart"
  ON cart_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
        AND (carts.user_id = auth.uid() OR carts.session_id IS NOT NULL)
    )
  );


-- ── 15. orders ──────────────────────────────────────────────────────────

CREATE POLICY "orders: owner read"
  ON orders FOR SELECT
  USING (user_id = auth.uid() OR is_staff_or_admin());

CREATE POLICY "orders: service role write"
  ON orders FOR ALL
  USING (is_staff_or_admin());


-- ── 16. order_items ─────────────────────────────────────────────────────

CREATE POLICY "order_items: owner via order"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (orders.user_id = auth.uid() OR is_staff_or_admin())
    )
  );

CREATE POLICY "order_items: staff write"
  ON order_items FOR ALL
  USING (is_staff_or_admin());


-- ── 17. discounts ───────────────────────────────────────────────────────
-- Discount validation happens server-side via direct Postgres (bypasses RLS).
-- This policy blocks any direct Supabase client access to discount data.

CREATE POLICY "discounts: staff only"
  ON discounts FOR ALL
  USING (is_staff_or_admin());


-- ── 18. wishlists ───────────────────────────────────────────────────────

CREATE POLICY "wishlists: owner"
  ON wishlists FOR ALL
  USING (user_id = auth.uid());


-- ── 19. bundles ─────────────────────────────────────────────────────────

CREATE POLICY "bundles: public read active"
  ON bundles FOR SELECT
  USING (is_active = true OR is_staff_or_admin());

CREATE POLICY "bundles: staff write"
  ON bundles FOR ALL
  USING (is_staff_or_admin());


-- ── 20. bundle_products ─────────────────────────────────────────────────

CREATE POLICY "bundle_products: public read"
  ON bundle_products FOR SELECT
  USING (true);

CREATE POLICY "bundle_products: staff write"
  ON bundle_products FOR ALL
  USING (is_staff_or_admin());


-- ── 21. journal_articles ────────────────────────────────────────────────

CREATE POLICY "journal_articles: public read published"
  ON journal_articles FOR SELECT
  USING (status = 'published' OR is_staff_or_admin());

CREATE POLICY "journal_articles: staff write"
  ON journal_articles FOR ALL
  USING (is_staff_or_admin());


-- ── 22. lookbook_entries ────────────────────────────────────────────────

CREATE POLICY "lookbook_entries: public read active"
  ON lookbook_entries FOR SELECT
  USING (is_active = true OR is_staff_or_admin());

CREATE POLICY "lookbook_entries: staff write"
  ON lookbook_entries FOR ALL
  USING (is_staff_or_admin());


-- ── 23. newsletter_subscribers ──────────────────────────────────────────

CREATE POLICY "newsletter_subscribers: insert any"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "newsletter_subscribers: staff read"
  ON newsletter_subscribers FOR SELECT
  USING (is_staff_or_admin());

CREATE POLICY "newsletter_subscribers: staff update"
  ON newsletter_subscribers FOR UPDATE
  USING (is_staff_or_admin());


-- ── 24. audit_log ───────────────────────────────────────────────────────

CREATE POLICY "audit_log: staff read"
  ON audit_log FOR SELECT
  USING (is_staff_or_admin());

CREATE POLICY "audit_log: insert service role only"
  ON audit_log FOR INSERT
  WITH CHECK (is_staff_or_admin());
