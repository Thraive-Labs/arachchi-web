"use server";

import { and, eq, ilike, or } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { products, productImages } from "@/lib/db/schema";
import { asc, inArray } from "drizzle-orm";

export interface SearchResult {
  id: string;
  slug: string;
  name: string;
  basePriceCents: number;
  image: string | null;
}

export async function searchProductsAction(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      basePriceCents: products.basePriceCents,
    })
    .from(products)
    .where(
      and(
        eq(products.isActive, true),
        or(
          ilike(products.name, `%${q}%`),
          ilike(products.shortDescription, `%${q}%`),
        ),
      ),
    )
    .limit(8);

  if (!rows.length) return rows.map((r) => ({ ...r, image: null }));

  const ids = rows.map((r) => r.id);
  const imgs = await db
    .select({ productId: productImages.productId, url: productImages.url })
    .from(productImages)
    .where(inArray(productImages.productId, ids))
    .orderBy(asc(productImages.position))
    .limit(ids.length);

  const imageMap = new Map<string, string>();
  for (const img of imgs) {
    if (!imageMap.has(img.productId)) imageMap.set(img.productId, img.url);
  }

  return rows.map((r) => ({ ...r, image: imageMap.get(r.id) ?? null }));
}
