"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { bundles, bundleProducts } from "@/lib/db/schema";

export async function saveBundleAction(form: FormData): Promise<{ error?: string }> {
  const id = form.get("id") as string | null;
  const name = (form.get("name") as string)?.trim();
  const slug = (form.get("slug") as string)?.trim().toLowerCase().replace(/\s+/g, "-");
  const description = (form.get("description") as string)?.trim();
  const finalPriceCents = parseInt(form.get("finalPriceCents") as string, 10);
  const promoCode = (form.get("promoCode") as string)?.trim().toUpperCase() || null;
  const coverImageUrl = (form.get("coverImageUrl") as string)?.trim() || null;
  const isActive = form.get("isActive") === "on";
  const productIds = form.getAll("productIds") as string[];

  if (!name || !slug || !description || isNaN(finalPriceCents)) return { error: "Missing required fields." };
  if (productIds.length === 0) return { error: "Select at least one product." };

  try {
    if (id) {
      await db.update(bundles).set({ name, slug, description, finalPriceCents, promoCode, coverImageUrl, isActive, updatedAt: new Date() }).where(eq(bundles.id, id));
      await db.delete(bundleProducts).where(eq(bundleProducts.bundleId, id));
      await db.insert(bundleProducts).values(productIds.map((pid, i) => ({ bundleId: id, productId: pid, position: i })));
    } else {
      const [inserted] = await db.insert(bundles).values({ name, slug, description, finalPriceCents, promoCode, coverImageUrl, isActive }).returning({ id: bundles.id });
      await db.insert(bundleProducts).values(productIds.map((pid, i) => ({ bundleId: inserted.id, productId: pid, position: i })));
    }
    return {};
  } catch {
    return { error: "A bundle with that slug may already exist." };
  }
}

export async function deleteBundleAction(id: string): Promise<void> {
  await db.delete(bundles).where(eq(bundles.id, id));
}
