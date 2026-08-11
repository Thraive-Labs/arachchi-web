import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/node-postgres";
import { eq, notInArray } from "drizzle-orm";
import { Pool } from "pg";
import {
  categories,
  tags,
  products,
  productVariants,
  productImages,
  productTags,
} from "../lib/db/schema";

type ImageDef = { file: string; alt: string; color?: string };
type ColorDef = { name: string; hex: string };

type ProductDef = {
  slug: string;
  name: string;
  categorySlug: string;
  basePriceCents: number;
  shortDescription: string;
  description: string;
  isFeatured: boolean;
  isTrending: boolean;
  tagSlugs: string[];
  metadata: Record<string, string>;
  colors: ColorDef[];
  images: ImageDef[];
};

const productData: ProductDef[] = [
  {
    slug: "ceylon-puff-sleeve-dress",
    name: "Ceylon Puff-Sleeve Dress",
    categorySlug: "dresses",
    basePriceCents: 52500,
    shortDescription:
      "A washed linen midi dress with a fitted, pin-tucked bodice and dramatic puff sleeves.",
    description:
      "Cut from a heavyweight washed linen, the Ceylon Puff-Sleeve Dress pairs a fitted, pin-tucked bodice with an elasticated puff sleeve and a softly gathered skirt that falls to the ankle. The split neckline sits open at the collarbone; the waist is seamed for shape without structure. A quiet, considered piece for warm-weather occasions.",
    isFeatured: true,
    isTrending: true,
    tagSlugs: ["new-arrivals", "summer-2026"],
    metadata: { material: "100% Washed Linen", care: "Machine wash cold, line dry", origin: "Ceylon" },
    colors: [
      { name: "White", hex: "#f5f3ee" },
      { name: "Green", hex: "#5c6b3f" },
    ],
    images: [
      { file: "1.jpg", alt: "Ceylon Puff-Sleeve Dress, white", color: "White" },
      { file: "2.jpg", alt: "Ceylon Puff-Sleeve Dress, worn" },
      { file: "3.jpg", alt: "Ceylon Puff-Sleeve Dress, green", color: "Green" },
      { file: "4.jpg", alt: "Ceylon Puff-Sleeve Dress, worn, editorial" },
      { file: "5.jpg", alt: "Ceylon Puff-Sleeve Dress, worn, editorial black and white" },
    ],
  },
  {
    slug: "tiered-linen-midi-dress",
    name: "Tiered Linen Midi Dress",
    categorySlug: "dresses",
    basePriceCents: 56500,
    shortDescription:
      "A cap-sleeve linen dress with a fitted waist seam and a softly tiered, gathered skirt.",
    description:
      "The Tiered Linen Midi Dress is cut from a mid-weight linen blend with a cap sleeve, a fitted waist seam, and a skirt built from three gathered tiers that move with every step. The bodice is gently gathered at the bust; the silhouette narrows at the waist before releasing into fullness below. Considered movement, built for warm-weather ease.",
    isFeatured: false,
    isTrending: true,
    tagSlugs: ["new-arrivals", "summer-2026"],
    metadata: { material: "100% Belgian Linen", care: "Machine wash cold, line dry", origin: "Ceylon" },
    colors: [
      { name: "White", hex: "#f5f3ee" },
      { name: "Cream", hex: "#ece2c8" },
      { name: "Grey", hex: "#9a9a94" },
      { name: "Olive Green", hex: "#86937a" },
      { name: "Burgundy", hex: "#6b2632" },
    ],
    images: [
      { file: "1.jpg", alt: "Tiered Linen Midi Dress, white", color: "White" },
      { file: "2.jpg", alt: "Tiered Linen Midi Dress, worn, olive" },
      { file: "3.jpg", alt: "Tiered Linen Midi Dress, cream", color: "Cream" },
      { file: "4.jpg", alt: "Tiered Linen Midi Dress, grey", color: "Grey" },
      { file: "5.jpg", alt: "Tiered Linen Midi Dress, olive green", color: "Olive Green" },
      { file: "6.jpg", alt: "Tiered Linen Midi Dress, burgundy", color: "Burgundy" },
    ],
  },
  {
    slug: "signature-structural-sweater",
    name: "Signature Structural Sweater",
    categorySlug: "knitwear",
    basePriceCents: 49500,
    shortDescription:
      "A paneled, architectural knit with a high funnel neck and geometric seaming across the chest.",
    description:
      "The Signature Structural Sweater takes its shape from architecture rather than tradition — geometric panel seams run across the chest and shoulders, framed by a high, structured funnel neck. Knitted in a fine merino-nylon blend for shape retention, it holds its structural lines wear after wear without losing softness against the skin.",
    isFeatured: true,
    isTrending: true,
    tagSlugs: ["new-arrivals", "gift-guide"],
    metadata: { material: "78% Merino Wool, 22% Nylon", care: "Hand wash cold or dry clean", origin: "Ceylon" },
    colors: [
      { name: "Black", hex: "#1c1c1c" },
      { name: "Cream", hex: "#e4dcc8" },
      { name: "Olive Green", hex: "#6b7a4f" },
      { name: "Burgundy", hex: "#5c2430" },
      { name: "Chocolate", hex: "#8a6f63" },
      { name: "Navy", hex: "#38455a" },
    ],
    images: [
      { file: "1.jpg", alt: "Signature Structural Sweater, black", color: "Black" },
      { file: "2.jpg", alt: "Signature Structural Sweater, black, worn" },
      { file: "3.jpg", alt: "Signature Structural Sweater, cream", color: "Cream" },
      { file: "4.jpg", alt: "Signature Structural Sweater, olive green", color: "Olive Green" },
      { file: "5.jpg", alt: "Signature Structural Sweater, olive green, worn" },
      { file: "6.jpg", alt: "Signature Structural Sweater, burgundy", color: "Burgundy" },
      { file: "7.jpg", alt: "Signature Structural Sweater, chocolate", color: "Chocolate" },
      { file: "8.jpg", alt: "Signature Structural Sweater, navy, worn", color: "Navy" },
      { file: "9.jpg", alt: "Signature Structural Sweater, editorial" },
      { file: "10.jpg", alt: "Signature Structural Sweater, editorial, Toronto" },
      { file: "11.jpg", alt: "Signature Structural Sweater, fabric detail" },
    ],
  },
  {
    slug: "signature-lounge-set",
    name: "Signature Lounge Set",
    categorySlug: "outerwear",
    basePriceCents: 68500,
    shortDescription:
      "A zip-through fleece jacket and matching sweatpant, finished with an embroidered arachchi pocket.",
    description:
      "The Signature Lounge Set pairs a zip-through fleece jacket with a matching drawstring sweatpant, both finished in a brushed cotton fleece that softens with every wash. The jacket's chest pocket carries a subtle embroidered arachchi wordmark — worn tucked in for a cleaner line, or loose for the way it was designed to be worn on a slow morning at home.",
    isFeatured: true,
    isTrending: false,
    tagSlugs: ["new-arrivals", "gift-guide"],
    metadata: { material: "100% Brushed Cotton Fleece", care: "Machine wash cold, tumble dry low", origin: "Ceylon" },
    colors: [{ name: "Cream", hex: "#ece2cf" }],
    images: [
      { file: "1.jpg", alt: "Signature Lounge Set, jacket, cream", color: "Cream" },
      { file: "2.jpg", alt: "Signature Lounge Set, worn" },
      { file: "3.jpg", alt: "Signature Lounge Set, trouser detail" },
      { file: "4.jpg", alt: "Signature Lounge Set, styled loose" },
      { file: "5.jpg", alt: "Signature Lounge Set, styled tucked in" },
    ],
  },
  {
    slug: "beach-club-crochet-dress",
    name: "Beach Club Crochet Dress",
    categorySlug: "dresses",
    basePriceCents: 64500,
    shortDescription:
      "A sleeveless, button-front dress in cotton crochet lace, finished with a woven belt and fringed hem.",
    description:
      "Built for warm-weather travel, the Beach Club Crochet Dress is worked in an open cotton crochet lace over a lined base, with a button-through front and a hand-woven macramé belt that cinches the waist. The asymmetric, fringed hem catches the breeze. A piece for the coast — worn open over swimwear or alone in the evening.",
    isFeatured: true,
    isTrending: true,
    tagSlugs: ["new-arrivals", "summer-2026"],
    metadata: { material: "100% Cotton Crochet Lace", care: "Hand wash cold, line dry", origin: "Ceylon" },
    colors: [
      { name: "White", hex: "#f2efe9" },
      { name: "Beige", hex: "#cbb190" },
      { name: "Brown", hex: "#a15b3a" },
      { name: "Dark Blue", hex: "#3d5568" },
      { name: "Light Blue", hex: "#9dbccb" },
    ],
    images: [
      { file: "1.jpg", alt: "Beach Club Crochet Dress, white", color: "White" },
      { file: "2.jpg", alt: "Beach Club Crochet Dress, worn, white" },
      { file: "3.jpg", alt: "Beach Club Crochet Dress, beige", color: "Beige" },
      { file: "4.jpg", alt: "Beach Club Crochet Dress, brown", color: "Brown" },
      { file: "5.jpg", alt: "Beach Club Crochet Dress, dark blue", color: "Dark Blue" },
      { file: "6.jpg", alt: "Beach Club Crochet Dress, light blue", color: "Light Blue" },
      { file: "7.jpg", alt: "Beach Club Crochet Dress, worn, beige" },
      { file: "8.jpg", alt: "Beach Club Crochet Dress, worn, white, street" },
    ],
  },
  {
    slug: "weekend-oversized-set",
    name: "Weekend Oversized Set",
    categorySlug: "tops",
    basePriceCents: 38500,
    shortDescription:
      "A garment-dyed, boxy tee and matching short in heavyweight cotton jersey, finished with a woven arachchi Ceylon patch.",
    description:
      "The Weekend Oversized Set is built from a heavyweight cotton jersey, garment-dyed for a faded, lived-in finish, and cut deliberately oversized through the body. A woven arachchi Ceylon patch sits at the hem. Raw-edge cuffs and hem keep the finishing unfussy — this is the set for the days in between.",
    isFeatured: false,
    isTrending: true,
    tagSlugs: ["new-arrivals", "under-500"],
    metadata: { material: "100% Garment-Dyed Cotton Jersey", care: "Machine wash cold inside out, line dry", origin: "Ceylon" },
    colors: [
      { name: "Grey", hex: "#4b4750" },
      { name: "Beige", hex: "#b39a7c" },
      { name: "Green", hex: "#445d3e" },
      { name: "Maroon", hex: "#5c2331" },
    ],
    images: [
      { file: "1.jpg", alt: "Weekend Oversized Set, grey, flat lay", color: "Grey" },
      { file: "2.jpg", alt: "Weekend Oversized Set, grey, worn" },
      { file: "3.jpg", alt: "Weekend Oversized Set, beige", color: "Beige" },
      { file: "4.jpg", alt: "Weekend Oversized Set, green", color: "Green" },
      { file: "5.jpg", alt: "Weekend Oversized Set, maroon", color: "Maroon" },
      { file: "6.jpg", alt: "Weekend Oversized Set, grey, worn, alternate styling" },
    ],
  },
  {
    slug: "signature-polo-shirt",
    name: "Signature Polo Shirt",
    categorySlug: "tops",
    basePriceCents: 22500,
    shortDescription:
      "A classic-fit piqué polo with a subtly embroidered arachchi wordmark at the chest.",
    description:
      "Cut from a breathable cotton piqué in a classic fit, the Signature Polo Shirt keeps its detailing quiet — a two-button placket, a soft, structured collar, and a small embroidered arachchi wordmark at the chest. Considered enough for the office, relaxed enough for everywhere else.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["new-arrivals", "under-500"],
    metadata: { material: "100% Pima Cotton Piqué", care: "Machine wash cold, hang to dry", origin: "Ceylon" },
    colors: [
      { name: "White", hex: "#f5f4f0" },
      { name: "Black", hex: "#232227" },
    ],
    images: [
      { file: "1.jpg", alt: "Signature Polo Shirt, white", color: "White" },
      { file: "2.jpg", alt: "Signature Polo Shirt, white, worn" },
      { file: "3.jpg", alt: "Signature Polo Shirt, black, worn", color: "Black" },
    ],
  },
  {
    slug: "signature-hoodie",
    name: "Signature Hoodie",
    categorySlug: "outerwear",
    basePriceCents: 36500,
    shortDescription:
      "An oversized fleece hoodie with a cross-front cowl hood and a printed arachchi wordmark.",
    description:
      "The Signature Hoodie is cut oversized from a heavyweight brushed cotton fleece, with a distinctive cross-front cowl hood that sits low at the neck and a kangaroo pocket cut on the diagonal. The arachchi wordmark is printed small at the chest. Garment-washed for a soft hand-feel from the first wear.",
    isFeatured: true,
    isTrending: false,
    tagSlugs: ["new-arrivals", "gift-guide"],
    metadata: { material: "100% Brushed Cotton Fleece", care: "Machine wash cold, tumble dry low", origin: "Ceylon" },
    colors: [
      { name: "Black", hex: "#1c1c1c" },
      { name: "Green", hex: "#445b3d" },
      { name: "Maroon", hex: "#6d3a2e" },
      { name: "White", hex: "#eceae4" },
    ],
    images: [
      { file: "1.jpg", alt: "Signature Hoodie, still life" },
      { file: "2.jpg", alt: "Signature Hoodie, black, worn", color: "Black" },
      { file: "3.jpg", alt: "Signature Hoodie, green, worn", color: "Green" },
      { file: "4.jpg", alt: "Signature Hoodie, maroon, worn", color: "Maroon" },
      { file: "5.jpg", alt: "Signature Hoodie, white, worn", color: "White" },
      { file: "6.jpg", alt: "Signature Hoodie, black, worn, alternate" },
    ],
  },
  {
    slug: "woven-pocket-tee",
    name: "Woven Pocket Tee",
    categorySlug: "tops",
    basePriceCents: 19500,
    shortDescription:
      "A herringbone cotton tee with a woven chest pocket and a subtly embroidered arachchi wordmark.",
    description:
      "The Woven Pocket Tee is cut from a textured herringbone cotton — a step up from a standard jersey tee — with a structured woven chest pocket carrying a tonal embroidered arachchi wordmark. A considered basic, built to be worn on repeat.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["new-arrivals", "under-500"],
    metadata: { material: "100% Herringbone Cotton", care: "Machine wash cold, hang to dry", origin: "Ceylon" },
    colors: [
      { name: "White", hex: "#f5f4f0" },
      { name: "Green", hex: "#26362b" },
      { name: "Black", hex: "#1c1c1c" },
    ],
    images: [
      { file: "1.jpg", alt: "Woven Pocket Tee, white", color: "White" },
      { file: "2.jpg", alt: "Woven Pocket Tee, green", color: "Green" },
      { file: "3.jpg", alt: "Woven Pocket Tee, black", color: "Black" },
    ],
  },
  {
    slug: "classic-pocket-tee",
    name: "Classic Pocket Tee",
    categorySlug: "tops",
    basePriceCents: 17500,
    shortDescription: "A heavyweight cotton pocket tee with a woven arachchi label at the neck.",
    description:
      "A heavyweight cotton jersey tee with a structured chest pocket and a woven arachchi Ceylon label at the back neck. Cut with a classic, slightly boxy fit and a ribbed crew neck that holds its shape wash after wash.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["new-arrivals", "under-500"],
    metadata: { material: "100% Combed Cotton", care: "Machine wash cold, hang to dry", origin: "Ceylon" },
    colors: [
      { name: "White", hex: "#f5f4f0" },
      { name: "Green", hex: "#1f3d2b" },
      { name: "Black", hex: "#1c1c1c" },
      { name: "Maroon", hex: "#4e1f28" },
    ],
    images: [
      { file: "1.jpg", alt: "Classic Pocket Tee, white", color: "White" },
      { file: "2.jpg", alt: "Classic Pocket Tee, green", color: "Green" },
      { file: "3.jpg", alt: "Classic Pocket Tee, black", color: "Black" },
      { file: "4.jpg", alt: "Classic Pocket Tee, maroon", color: "Maroon" },
    ],
  },
  {
    slug: "essential-crew-tee",
    name: "Essential Crew Tee",
    categorySlug: "tops",
    basePriceCents: 14500,
    shortDescription:
      "The unmarked essential — a plain crewneck tee in heavyweight cotton, no logo, no distraction.",
    description:
      "The Essential Crew Tee is the piece we make with nothing to prove — a heavyweight cotton jersey, a clean crew neck, and zero branding. Cut with a classic fit that layers cleanly under everything else in the wardrobe. The plainest piece we make, and one of the most worn.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["new-arrivals", "under-500"],
    metadata: { material: "100% Combed Cotton", care: "Machine wash cold, hang to dry", origin: "Ceylon" },
    colors: [{ name: "White", hex: "#f5f4f0" }],
    images: [{ file: "1.jpg", alt: "Essential Crew Tee, white", color: "White" }],
  },
  {
    slug: "ceylon-logo-tee",
    name: "Ceylon Logo Tee",
    categorySlug: "tops",
    basePriceCents: 18500,
    shortDescription:
      "A heavyweight cotton tee with the arachchi wordmark and 'Ceylon' printed at the chest.",
    description:
      "The Ceylon Logo Tee carries the arachchi wordmark with 'Ceylon' set beneath it, printed at the chest in a clean sans-serif. Cut from a heavyweight cotton jersey with a relaxed, slightly boxy fit, it is the most direct statement of where the house comes from.",
    isFeatured: false,
    isTrending: true,
    tagSlugs: ["new-arrivals", "under-500"],
    metadata: { material: "100% Combed Cotton", care: "Machine wash cold, hang to dry", origin: "Ceylon" },
    colors: [
      { name: "White", hex: "#f5f4f0" },
      { name: "Black", hex: "#1a1a1a" },
      { name: "Green", hex: "#1f3a26" },
      { name: "Maroon", hex: "#4a1e26" },
    ],
    images: [
      { file: "1.jpg", alt: "Ceylon Logo Tee, white", color: "White" },
      { file: "2.jpg", alt: "Ceylon Logo Tee, black, worn" },
      { file: "3.jpg", alt: "Ceylon Logo Tee, black", color: "Black" },
      { file: "4.jpg", alt: "Ceylon Logo Tee, green", color: "Green" },
      { file: "5.jpg", alt: "Ceylon Logo Tee, maroon", color: "Maroon" },
      { file: "6.jpg", alt: "Ceylon Logo Tee, editorial" },
    ],
  },
];

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  console.log("Seeding new arrivals...");

  // ── Categories (must already exist; update-in-place is a no-op if unchanged) ─
  const categoryData = [
    { slug: "outerwear", name: "Outerwear", description: "Coats, jackets, and outerwear.", position: 1 },
    { slug: "knitwear", name: "Knitwear", description: "Cashmere, merino, and fine knits.", position: 2 },
    { slug: "dresses", name: "Dresses", description: "Silk, linen, and tailored dresses.", position: 3 },
    { slug: "trousers", name: "Trousers", description: "Tailored trousers and wide-leg cuts.", position: 4 },
    { slug: "tops", name: "Tops", description: "Blouses, shirts, and refined tops.", position: 5 },
    { slug: "accessories", name: "Accessories", description: "Bags, scarves, and finishing pieces.", position: 6 },
  ];

  const insertedCategories = await db
    .insert(categories)
    .values(categoryData)
    .onConflictDoUpdate({ target: categories.slug, set: { name: categories.name } })
    .returning();

  const catMap = Object.fromEntries(insertedCategories.map((c) => [c.slug, c.id]));

  // ── Tags ──────────────────────────────────────────────────────────────────
  const tagData = [
    { slug: "new-arrivals", name: "New Arrivals", isVisible: true, position: 1 },
    { slug: "summer-2026", name: "Summer 2026", isVisible: true, position: 2 },
    { slug: "gift-guide", name: "Gift Guide", isVisible: true, position: 3 },
    { slug: "editor-picks", name: "Editor's Picks", isVisible: true, position: 4 },
    { slug: "under-500", name: "Under $500", isVisible: true, position: 5 },
    { slug: "sustainable", name: "Sustainable", isVisible: true, position: 6 },
    { slug: "last-chance", name: "Last Chance", isVisible: true, position: 7 },
  ];

  const insertedTags = await db
    .insert(tags)
    .values(tagData)
    .onConflictDoUpdate({ target: tags.slug, set: { name: tags.name } })
    .returning();

  const tagMap = Object.fromEntries(insertedTags.map((t) => [t.slug, t.id]));

  // ── Products — additive; only touches the slugs defined above ─────────────
  for (const p of productData) {
    const [inserted] = await db
      .insert(products)
      .values({
        slug: p.slug,
        name: p.name,
        description: p.description,
        shortDescription: p.shortDescription,
        categoryId: catMap[p.categorySlug],
        basePriceCents: p.basePriceCents,
        isFeatured: p.isFeatured,
        isTrending: p.isTrending,
        isActive: true,
        metadata: p.metadata,
      })
      .onConflictDoUpdate({
        target: products.slug,
        set: {
          name: p.name,
          description: p.description,
          shortDescription: p.shortDescription,
          categoryId: catMap[p.categorySlug],
          basePriceCents: p.basePriceCents,
          isFeatured: p.isFeatured,
          isTrending: p.isTrending,
          isActive: true,
          metadata: p.metadata,
          updatedAt: new Date(),
        },
      })
      .returning();

    // Re-seed this product's images/variants/tags from scratch
    await db.delete(productImages).where(eq(productImages.productId, inserted.id));
    await db.delete(productVariants).where(eq(productVariants.productId, inserted.id));
    await db.delete(productTags).where(eq(productTags.productId, inserted.id));

    await db.insert(productImages).values(
      p.images.map((img, i) => ({
        productId: inserted.id,
        url: `/images/products/${p.slug}/${img.file}`,
        alt: img.alt,
        position: i,
        isPrimary: i === 0,
        color: img.color ?? null,
      })),
    );

    const sizes = ["XS", "S", "M", "L", "XL"];
    const colorSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");
    await db.insert(productVariants).values(
      p.colors.flatMap((c) =>
        sizes.map((size, i) => ({
          productId: inserted.id,
          sku: `${p.slug}-${size.toLowerCase()}-${colorSlug(c.name)}`,
          size,
          color: c.name,
          colorHex: c.hex,
          priceCents: p.basePriceCents,
          stockQuantity: i === 1 ? 2 : Math.floor(Math.random() * 12) + 4,
          isActive: true,
        })),
      ),
    );

    for (const tagSlug of p.tagSlugs) {
      if (tagMap[tagSlug]) {
        await db
          .insert(productTags)
          .values({ productId: inserted.id, tagId: tagMap[tagSlug] })
          .onConflictDoNothing();
      }
    }

    console.log(`  ${p.name} (${p.images.length} images, ${p.colors.length * sizes.length} variants)`);
  }

  // ── Shop now shows only these 12 products — deactivate every other product
  // (soft delete via is_active=false; preserves order history / FK integrity).
  const keepSlugs = productData.map((p) => p.slug);
  const deactivated = await db
    .update(products)
    .set({ isActive: false, updatedAt: new Date() })
    .where(notInArray(products.slug, keepSlugs))
    .returning({ slug: products.slug });
  console.log(`${deactivated.length} other products deactivated (removed from shop).`);

  console.log(`${productData.length} new-arrival products seeded.`);
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
