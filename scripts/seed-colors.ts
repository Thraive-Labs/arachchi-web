// Additive seed: marks a handful of existing products as trending and gives them
// two color variants each (reusing the product's own existing photography), so the
// homepage "Store" section and the shop-card color swatch feature have real data to show.
// Safe to re-run — idempotent via slug/SKU checks.
import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, asc, and } from "drizzle-orm";
import { products, productImages, productVariants } from "../lib/db/schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const COLOR_A = { name: "Black", hex: "#1a1a1a" };
const COLOR_B = { name: "Ivory", hex: "#e8e2d5" };

const targetSlugs = [
  "convergence-jacket",
  "convergence-trousers",
  "zenith-coat",
  "zenith-dress",
  "monolith-jacket",
  "vale-dress",
  "signature-hoodie",
  "ceylon-puff-sleeve-dress",
];

async function main() {
  for (const slug of targetSlugs) {
    const [product] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    if (!product) {
      console.log(`  skip ${slug} — not found`);
      continue;
    }

    await db.update(products).set({ isTrending: true }).where(eq(products.id, product.id));

    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, product.id))
      .orderBy(asc(productImages.position));

    if (images[0]) {
      await db.update(productImages).set({ color: COLOR_A.name }).where(eq(productImages.id, images[0].id));
    }
    if (images[1]) {
      await db.update(productImages).set({ color: COLOR_B.name }).where(eq(productImages.id, images[1].id));
    }

    const existingVariants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, product.id));

    // Base color: tag existing (colorless) variants as Color A.
    for (const v of existingVariants) {
      if (!v.color) {
        await db
          .update(productVariants)
          .set({ color: COLOR_A.name, colorHex: COLOR_A.hex })
          .where(eq(productVariants.id, v.id));
      }
    }

    // Second color: clone each Color-A variant under Color B with a distinct SKU, if not already present.
    const colorAVariants = await db
      .select()
      .from(productVariants)
      .where(and(eq(productVariants.productId, product.id), eq(productVariants.color, COLOR_A.name)));

    for (const v of colorAVariants) {
      const newSku = `${v.sku}-ivory`;
      const [existing] = await db
        .select({ id: productVariants.id })
        .from(productVariants)
        .where(eq(productVariants.sku, newSku))
        .limit(1);
      if (existing) continue;

      await db.insert(productVariants).values({
        productId: product.id,
        sku: newSku,
        size: v.size,
        color: COLOR_B.name,
        colorHex: COLOR_B.hex,
        priceCents: v.priceCents,
        stockQuantity: v.stockQuantity,
        weightGrams: v.weightGrams,
        isActive: true,
      });
    }

    console.log(`  ${slug}: trending + 2 colors`);
  }

  console.log("Done.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
