// Additive seed: gives every remaining colorless product two color variants
// (Black/Ivory), reusing the product's own existing photography, so the shop
// card color-swatch feature shows up everywhere, not just on the 8 products
// seeded by scripts/seed-colors.ts. Does not touch isTrending. Safe to re-run.
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

async function main() {
  const allProducts = await db.select().from(products);

  for (const product of allProducts) {
    const existingVariants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, product.id));

    // Skip products that already have color data (the 8 from seed-colors.ts).
    if (existingVariants.some((v) => v.color)) {
      continue;
    }
    if (existingVariants.length === 0) continue;

    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, product.id))
      .orderBy(asc(productImages.position));

    if (!images.length) continue;

    const secondImage = images[1] ?? images[0];

    if (images[0]) {
      await db.update(productImages).set({ color: COLOR_A.name }).where(eq(productImages.id, images[0].id));
    }
    // Falls back to re-tagging the same single image under Ivory when there's only one photo —
    // the swatch still appears, it just won't visually change the picture on click.
    if (secondImage) {
      await db.update(productImages).set({ color: COLOR_B.name }).where(eq(productImages.id, secondImage.id));
    }

    for (const v of existingVariants) {
      await db
        .update(productVariants)
        .set({ color: COLOR_A.name, colorHex: COLOR_A.hex })
        .where(eq(productVariants.id, v.id));
    }

    for (const v of existingVariants) {
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

    console.log(`  ${product.slug}: 2 colors (${images.length} image${images.length === 1 ? " reused for both" : "s"})`);
  }

  console.log("Done.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
