-- Run this in the Supabase SQL editor after creating all tables via Drizzle migrations.
-- Enable RLS on every table (default deny — explicit policies grant access).

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE recently_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lookbook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ── Helper: is the current user staff or admin? ────────────────────────
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

-- ── users ──────────────────────────────────────────────────────────────
CREATE POLICY "users: self read"
  ON users FOR SELECT
  USING (auth.uid() = id OR is_staff_or_admin());

CREATE POLICY "users: self update"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "users: staff read all"
  ON users FOR SELECT
  USING (is_staff_or_admin());

-- ── addresses ─────────────────────────────────────────────────────────
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

-- ── categories (public read, staff write) ─────────────────────────────
CREATE POLICY "categories: public read"
  ON categories FOR SELECT
  USING (is_active = true OR is_staff_or_admin());

CREATE POLICY "categories: staff write"
  ON categories FOR ALL
  USING (is_staff_or_admin());

-- ── products (public read active, staff write) ────────────────────────
CREATE POLICY "products: public read"
  ON products FOR SELECT
  USING (is_active = true OR is_staff_or_admin());

CREATE POLICY "products: staff write"
  ON products FOR ALL
  USING (is_staff_or_admin());

-- ── tags ──────────────────────────────────────────────────────────────
CREATE POLICY "tags: public read"
  ON tags FOR SELECT
  USING (true);

CREATE POLICY "tags: staff write"
  ON tags FOR ALL
  USING (is_staff_or_admin());

-- ── product_tags ───────────────────────────────────────────────────────
CREATE POLICY "product_tags: public read"
  ON product_tags FOR SELECT
  USING (true);

CREATE POLICY "product_tags: staff write"
  ON product_tags FOR ALL
  USING (is_staff_or_admin());

-- ── product_images ────────────────────────────────────────────────────
CREATE POLICY "product_images: public read"
  ON product_images FOR SELECT
  USING (true);

CREATE POLICY "product_images: staff write"
  ON product_images FOR ALL
  USING (is_staff_or_admin());

-- ── product_variants ──────────────────────────────────────────────────
CREATE POLICY "product_variants: public read"
  ON product_variants FOR SELECT
  USING (is_active = true OR is_staff_or_admin());

CREATE POLICY "product_variants: staff write"
  ON product_variants FOR ALL
  USING (is_staff_or_admin());

-- ── product_views ──────────────────────────────────────────────────────
CREATE POLICY "product_views: insert any"
  ON product_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "product_views: staff read"
  ON product_views FOR SELECT
  USING (is_staff_or_admin());

-- ── recently_viewed ────────────────────────────────────────────────────
CREATE POLICY "recently_viewed: owner"
  ON recently_viewed FOR ALL
  USING (user_id = auth.uid());

-- ── carts ─────────────────────────────────────────────────────────────
CREATE POLICY "carts: owner"
  ON carts FOR ALL
  USING (
    user_id = auth.uid()
    OR (user_id IS NULL AND session_id IS NOT NULL)
  );

-- ── cart_items ────────────────────────────────────────────────────────
CREATE POLICY "cart_items: owner via cart"
  ON cart_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
        AND (carts.user_id = auth.uid() OR carts.session_id IS NOT NULL)
    )
  );

-- ── orders ────────────────────────────────────────────────────────────
CREATE POLICY "orders: owner read"
  ON orders FOR SELECT
  USING (
    user_id = auth.uid()
    OR is_staff_or_admin()
  );

CREATE POLICY "orders: staff write"
  ON orders FOR ALL
  USING (is_staff_or_admin());

-- ── order_items ───────────────────────────────────────────────────────
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

-- ── discounts ─────────────────────────────────────────────────────────
CREATE POLICY "discounts: staff"
  ON discounts FOR ALL
  USING (is_staff_or_admin());

-- ── wishlists ─────────────────────────────────────────────────────────
CREATE POLICY "wishlists: owner"
  ON wishlists FOR ALL
  USING (user_id = auth.uid());

-- ── journal_articles ──────────────────────────────────────────────────
CREATE POLICY "journal_articles: public read published"
  ON journal_articles FOR SELECT
  USING (status = 'published' OR is_staff_or_admin());

CREATE POLICY "journal_articles: staff write"
  ON journal_articles FOR ALL
  USING (is_staff_or_admin());

-- ── lookbook_entries ──────────────────────────────────────────────────
CREATE POLICY "lookbook_entries: public read active"
  ON lookbook_entries FOR SELECT
  USING (is_active = true OR is_staff_or_admin());

CREATE POLICY "lookbook_entries: staff write"
  ON lookbook_entries FOR ALL
  USING (is_staff_or_admin());

-- ── newsletter_subscribers ────────────────────────────────────────────
CREATE POLICY "newsletter_subscribers: insert any"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "newsletter_subscribers: staff read"
  ON newsletter_subscribers FOR SELECT
  USING (is_staff_or_admin());

CREATE POLICY "newsletter_subscribers: staff update"
  ON newsletter_subscribers FOR UPDATE
  USING (is_staff_or_admin());

-- ── audit_log ─────────────────────────────────────────────────────────
CREATE POLICY "audit_log: staff read"
  ON audit_log FOR SELECT
  USING (is_staff_or_admin());

CREATE POLICY "audit_log: insert service role only"
  ON audit_log FOR INSERT
  WITH CHECK (is_staff_or_admin());
