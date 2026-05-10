import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "../client";
import {
  bundles,
  bundleProducts,
  products,
  productVariants,
  productImages,
} from "../schema";

export type BundleWithProducts = Awaited<ReturnType<typeof getBundleBySlug>>;
export type BundleListItem = Awaited<ReturnType<typeof getActiveBundles>>[number];

async function attachBundleImages<T extends { id: string }>(rows: T[]) {
  if (!rows.length) return rows.map((r) => ({ ...r, coverImage: null as string | null }));
  return rows.map((r) => r); // cover image is stored directly on bundle
}

// Returns all products in a bundle with their stock and images
async function getBundleProductDetails(bundleId: string) {
  const bpRows = await db
    .select({ productId: bundleProducts.productId, position: bundleProducts.position })
    .from(bundleProducts)
    .where(eq(bundleProducts.bundleId, bundleId))
    .orderBy(asc(bundleProducts.position));

  if (!bpRows.length) return [];

  const ids = bpRows.map((r) => r.productId);

  const [productRows, variantRows, imageRows] = await Promise.all([
    db
      .select({ id: products.id, slug: products.slug, name: products.name, basePriceCents: products.basePriceCents })
      .from(products)
      .where(inArray(products.id, ids)),
    db
      .select({ productId: productVariants.productId, id: productVariants.id, size: productVariants.size, stockQuantity: productVariants.stockQuantity, priceCents: productVariants.priceCents })
      .from(productVariants)
      .where(and(inArray(productVariants.productId, ids), eq(productVariants.isActive, true))),
    db
      .select({ productId: productImages.productId, url: productImages.url })
      .from(productImages)
      .where(inArray(productImages.productId, ids))
      .orderBy(asc(productImages.position)),
  ]);

  const variantsByProduct = new Map<string, typeof variantRows>();
  for (const v of variantRows) {
    const arr = variantsByProduct.get(v.productId) ?? [];
    arr.push(v);
    variantsByProduct.set(v.productId, arr);
  }

  const imageByProduct = new Map<string, string>();
  for (const img of imageRows) {
    if (!imageByProduct.has(img.productId)) imageByProduct.set(img.productId, img.url);
  }

  const orderMap = new Map(bpRows.map((r, i) => [r.productId, i]));

  return productRows
    .sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0))
    .map((p) => {
      const variants = variantsByProduct.get(p.id) ?? [];
      const totalStock = variants.reduce((s, v) => s + v.stockQuantity, 0);
      return {
        ...p,
        variants,
        totalStock,
        primaryImage: imageByProduct.get(p.id) ?? null,
      };
    });
}

export async function getActiveBundles() {
  return db
    .select()
    .from(bundles)
    .where(and(eq(bundles.isActive, true), eq(bundles.brandId, "arachchi")))
    .orderBy(asc(bundles.createdAt));
}

export async function getAllBundlesAdmin() {
  return db.select().from(bundles).orderBy(asc(bundles.createdAt));
}

export async function getBundleBySlug(slug: string) {
  const [bundle] = await db
    .select()
    .from(bundles)
    .where(and(eq(bundles.slug, slug), eq(bundles.isActive, true)))
    .limit(1);

  if (!bundle) return null;

  const bundleProductDetails = await getBundleProductDetails(bundle.id);

  // Bundle is unavailable if any product has zero total stock
  const isAvailable = bundleProductDetails.every((p) => p.totalStock > 0);
  const regularTotalCents = bundleProductDetails.reduce((s, p) => s + p.basePriceCents, 0);
  const savingsCents = regularTotalCents - bundle.finalPriceCents;

  return { ...bundle, products: bundleProductDetails, isAvailable, regularTotalCents, savingsCents };
}

export async function getBundleByIdAdmin(id: string) {
  const [bundle] = await db.select().from(bundles).where(eq(bundles.id, id)).limit(1);
  if (!bundle) return null;

  const bpRows = await db
    .select({ productId: bundleProducts.productId })
    .from(bundleProducts)
    .where(eq(bundleProducts.bundleId, id))
    .orderBy(asc(bundleProducts.position));

  return { ...bundle, productIds: bpRows.map((r) => r.productId) };
}
