import { and, asc, desc, eq, gte, inArray, lte, ne, notInArray, sql } from "drizzle-orm";
import { db } from "../client";
import {
  categories,
  productImages,
  productTags,
  productVariants,
  products,
  tags,
} from "../schema";

export type ProductWithDetails = Awaited<ReturnType<typeof getProductBySlug>>;
export type ProductListItem = Awaited<ReturnType<typeof getProducts>>["items"][number];

export interface ProductFilters {
  categorySlug?: string;
  tagSlugs?: string[];
  sizes?: string[];
  minPriceCents?: number;
  maxPriceCents?: number;
  sort?: "newest" | "price-asc" | "price-desc";
  page?: number;
  limit?: number;
}

export interface CardVariant {
  id: string;
  size: string | null;
  color: string | null;
  stockQuantity: number;
  priceCents: number;
}

export interface CardColor {
  color: string;
  colorHex: string | null;
  image: string;
}

// Fetches primary + secondary image URLs for an array of product rows.
// Two queries: one for the products, one for their images — no correlated subquery.
async function attachImages<T extends { id: string }>(rows: T[]) {
  if (!rows.length) {
    return rows.map((r) => ({ ...r, primaryImage: null as string | null, secondaryImage: null as string | null }));
  }

  const ids = rows.map((r) => r.id);
  const imgs = await db
    .select({ productId: productImages.productId, url: productImages.url })
    .from(productImages)
    .where(inArray(productImages.productId, ids))
    .orderBy(asc(productImages.position));

  const byProduct = new Map<string, string[]>();
  for (const img of imgs) {
    const arr = byProduct.get(img.productId) ?? [];
    arr.push(img.url);
    byProduct.set(img.productId, arr);
  }

  return rows.map((r) => ({
    ...r,
    primaryImage: (byProduct.get(r.id)?.[0] ?? null) as string | null,
    secondaryImage: (byProduct.get(r.id)?.[1] ?? null) as string | null,
  }));
}

// Fetches active variants (id, size, stockQuantity, priceCents) for list cards.
async function attachVariants<T extends { id: string }>(rows: T[]) {
  if (!rows.length) {
    return rows.map((r) => ({ ...r, variants: [] as CardVariant[] }));
  }
  const ids = rows.map((r) => r.id);
  const variantRows = await db
    .select({
      productId: productVariants.productId,
      id: productVariants.id,
      size: productVariants.size,
      color: productVariants.color,
      stockQuantity: productVariants.stockQuantity,
      priceCents: productVariants.priceCents,
    })
    .from(productVariants)
    .where(and(inArray(productVariants.productId, ids), eq(productVariants.isActive, true)));

  const byProduct = new Map<string, CardVariant[]>();
  for (const v of variantRows) {
    const arr = byProduct.get(v.productId) ?? [];
    arr.push({ id: v.id, size: v.size, color: v.color, stockQuantity: v.stockQuantity, priceCents: v.priceCents });
    byProduct.set(v.productId, arr);
  }
  return rows.map((r) => ({ ...r, variants: byProduct.get(r.id) ?? [] }));
}

// Builds a per-color swatch list (color, hex, image) from color-tagged variants + images.
// Falls back to the product's primary image when no image is tagged for that color.
async function attachColors<T extends { id: string; primaryImage: string | null }>(rows: T[]) {
  if (!rows.length) {
    return rows.map((r) => ({ ...r, colors: [] as CardColor[] }));
  }
  const ids = rows.map((r) => r.id);

  const [variantRows, imageRows] = await Promise.all([
    db
      .select({ productId: productVariants.productId, color: productVariants.color, colorHex: productVariants.colorHex })
      .from(productVariants)
      .where(and(inArray(productVariants.productId, ids), eq(productVariants.isActive, true))),
    db
      .select({ productId: productImages.productId, color: productImages.color, url: productImages.url })
      .from(productImages)
      .where(inArray(productImages.productId, ids))
      .orderBy(asc(productImages.position)),
  ]);

  const imageByProductColor = new Map<string, string>();
  for (const img of imageRows) {
    if (!img.color) continue;
    const key = `${img.productId}:${img.color}`;
    if (!imageByProductColor.has(key)) imageByProductColor.set(key, img.url);
  }

  const colorsByProduct = new Map<string, CardColor[]>();
  const seen = new Set<string>();
  for (const v of variantRows) {
    if (!v.color) continue;
    const key = `${v.productId}:${v.color}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const arr = colorsByProduct.get(v.productId) ?? [];
    arr.push({ color: v.color, colorHex: v.colorHex, image: imageByProductColor.get(key) ?? "" });
    colorsByProduct.set(v.productId, arr);
  }

  return rows.map((r) => ({
    ...r,
    colors: (colorsByProduct.get(r.id) ?? [])
      .map((c) => ({ ...c, image: c.image || r.primaryImage || "" }))
      .filter((c) => c.image),
  }));
}

export async function getProducts(filters: ProductFilters = {}) {
  const {
    categorySlug,
    tagSlugs,
    minPriceCents,
    maxPriceCents,
    sort = "newest",
    page = 1,
    limit = 12,
  } = filters;

  const conditions = [eq(products.isActive, true)];

  if (categorySlug) {
    const [cat] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, categorySlug))
      .limit(1);
    if (cat) conditions.push(eq(products.categoryId, cat.id));
  }

  if (tagSlugs?.length) {
    const taggedProductIds = db
      .selectDistinct({ id: productTags.productId })
      .from(productTags)
      .innerJoin(tags, eq(tags.id, productTags.tagId))
      .where(inArray(tags.slug, tagSlugs));
    conditions.push(inArray(products.id, taggedProductIds));
  }

  if (minPriceCents) conditions.push(gte(products.basePriceCents, minPriceCents));
  if (maxPriceCents) conditions.push(lte(products.basePriceCents, maxPriceCents));

  const orderBy =
    sort === "price-asc"
      ? [products.basePriceCents]
      : sort === "price-desc"
        ? [desc(products.basePriceCents)]
        : [desc(products.createdAt)];

  const offset = (page - 1) * limit;

  const [rawItems, [{ total }]] = await Promise.all([
    db
      .select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        basePriceCents: products.basePriceCents,
        compareAtPriceCents: products.compareAtPriceCents,
      })
      .from(products)
      .where(and(...conditions))
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(products)
      .where(and(...conditions)),
  ]);

  const withImages = await attachImages(rawItems);
  const withVariants = await attachVariants(withImages);
  const items = await attachColors(withVariants);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getProductBySlug(slug: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.isActive, true)))
    .limit(1);

  if (!product) return null;

  const [images, variants, productTagRows, category] = await Promise.all([
    db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, product.id))
      .orderBy(productImages.position),
    db
      .select()
      .from(productVariants)
      .where(and(eq(productVariants.productId, product.id), eq(productVariants.isActive, true))),
    db
      .select({ tag: tags })
      .from(productTags)
      .innerJoin(tags, eq(tags.id, productTags.tagId))
      .where(eq(productTags.productId, product.id)),
    product.categoryId
      ? db
          .select()
          .from(categories)
          .where(eq(categories.id, product.categoryId))
          .limit(1)
          .then((r) => r[0] ?? null)
      : Promise.resolve(null),
  ]);

  return {
    ...product,
    images,
    variants,
    tags: productTagRows.map((r) => r.tag),
    category,
  };
}

export async function getFeaturedProducts(limit = 8) {
  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      basePriceCents: products.basePriceCents,
      compareAtPriceCents: products.compareAtPriceCents,
    })
    .from(products)
    .where(and(eq(products.isActive, true), eq(products.isFeatured, true)))
    .orderBy(desc(products.createdAt))
    .limit(limit);
  return attachColors(await attachVariants(await attachImages(rows)));
}

// Trending products first, backfilled with the newest other active products
// so the homepage Store grid always shows a full `limit` tiles even when
// fewer than `limit` products happen to be flagged trending.
export async function getTrendingProducts(limit = 8) {
  const selectCols = {
    id: products.id,
    slug: products.slug,
    name: products.name,
    basePriceCents: products.basePriceCents,
    compareAtPriceCents: products.compareAtPriceCents,
  };

  const trending = await db
    .select(selectCols)
    .from(products)
    .where(and(eq(products.isActive, true), eq(products.isTrending, true)))
    .orderBy(desc(products.createdAt))
    .limit(limit);

  let rows = trending;
  if (trending.length < limit) {
    const excludeIds = trending.map((p) => p.id);
    const backfill = await db
      .select(selectCols)
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          excludeIds.length ? notInArray(products.id, excludeIds) : undefined,
        ),
      )
      .orderBy(desc(products.createdAt))
      .limit(limit - trending.length);
    rows = [...trending, ...backfill];
  }

  return attachColors(await attachVariants(await attachImages(rows)));
}

export async function getRelatedProducts(
  productId: string,
  relatedIds: string[],
  categoryId: string | null,
  limit = 6,
) {
  let rows;

  if (relatedIds.length >= limit) {
    rows = await db
      .select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        basePriceCents: products.basePriceCents,
        compareAtPriceCents: products.compareAtPriceCents,
      })
      .from(products)
      .where(and(eq(products.isActive, true), inArray(products.id, relatedIds.slice(0, limit))))
      .limit(limit);
  } else {
    const conditions = [eq(products.isActive, true), ne(products.id, productId)];
    if (categoryId) conditions.push(eq(products.categoryId, categoryId));

    rows = await db
      .select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        basePriceCents: products.basePriceCents,
        compareAtPriceCents: products.compareAtPriceCents,
      })
      .from(products)
      .where(and(...conditions))
      .orderBy(desc(products.createdAt))
      .limit(limit);
  }

  return attachColors(await attachVariants(await attachImages(rows)));
}

export async function getCategories() {
  return db.select().from(categories).orderBy(asc(categories.name));
}
