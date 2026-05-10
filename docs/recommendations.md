# Recommendations and Tagging


Recommendations at MVP are intentionally simple: query-based, not ML-based. The goal is to ship something useful from day one and collect the data needed to upgrade later.

## Recommendation Surfaces

| Surface | Source | Fallback |
|---|---|---|
| Homepage "Curated picks" | `products WHERE is_featured = true` ordered by admin | None - admin must set at least 4 |
| Homepage "Trending now" | `products WHERE is_trending = true` (set by daily job) | Top sellers from last 30 days |
| Product detail "You may also like" | `products.related_product_ids` (manually set) | Same category, ordered by recency |
| Product detail "Complete the look" | `products.pairing_product_ids` (manually set) | Hidden if not set |
| Cart drawer "You might add" | Bestsellers from same categories as cart items | Hidden if cart is empty |
| Account "Recently viewed" | `recently_viewed` table for the user | Hidden if empty |

## Trending Logic (Daily Job)

A scheduled job (Vercel Cron, runs at 03:00 UTC daily) updates the `is_trending` flag:

```sql
-- Reset all trending flags
UPDATE products SET is_trending = false;

-- Set trending = true for top 12 products by combined score:
-- (units_sold_last_30_days * 3) + (views_last_30_days * 1)
WITH scores AS (
  SELECT
    p.id,
    COALESCE(SUM(oi.quantity), 0) * 3 + COUNT(DISTINCT pv.id) AS score
  FROM products p
  LEFT JOIN order_items oi ON oi.variant_id IN (
    SELECT id FROM product_variants WHERE product_id = p.id
  )
  LEFT JOIN orders o ON o.id = oi.order_id
    AND o.created_at > NOW() - INTERVAL '30 days'
    AND o.status NOT IN ('cancelled', 'refunded')
  LEFT JOIN product_views pv ON pv.product_id = p.id
    AND pv.viewed_at > NOW() - INTERVAL '30 days'
  WHERE p.is_active = true
  GROUP BY p.id
)
UPDATE products SET is_trending = true
WHERE id IN (SELECT id FROM scores ORDER BY score DESC LIMIT 12);
```

Admin can also manually toggle `is_trending` to override.

## View Tracking

On every product detail page render:
- Insert a row into `product_views` (fire-and-forget server action, never blocks render)
- For logged-in users: upsert into `recently_viewed`
- A background job prunes `product_views` older than 90 days nightly to control table size

## Tags

Tags are flexible labels for cross-cutting collections that don't fit the category hierarchy. Examples:
- Seasonal: `summer-2026`, `winter-essentials`
- Curatorial: `gift-guide`, `editor-picks`, `wedding-edit`
- Attribute-based: `under-200`, `sustainable`, `made-in-canada`
- Drop-based: `new-arrivals`, `last-chance`

Behavior:
- Many-to-many with products via `product_tags`
- Visible tags (`is_visible = true`) appear as filter facets on `/shop` and as breadcrumb collections at `/shop/tag/[slug]`
- Hidden tags are admin-only (used for internal organization or manual collection curation)
- A product can have unlimited tags
- Tags can be bulk-assigned to multiple products from the admin product list
- Tag pages are SSG'd with ISR like categories

## Future: Personalized Recommendations (Deferred)

When there is enough data (rough threshold: 1000+ orders or 10000+ logged-in product views), upgrade to:
- **Collaborative filtering**: "Customers who viewed X also viewed Y" using co-occurrence in `product_views`
- **Purchase-based**: "Customers who bought X also bought Y" using co-occurrence in `order_items`
- **Personalized homepage**: rank `is_featured` and `is_trending` products per user based on their view and purchase history

These are SQL queries, not ML models. No vector database, no embeddings, no LLM at this stage. If genuine ML is ever justified later, the data is already collected.

---

