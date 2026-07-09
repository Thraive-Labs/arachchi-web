import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { Pool } from "pg";
import {
  categories,
  tags,
  products,
  productVariants,
  productImages,
  productTags,
} from "../lib/db/schema";

type ImageDef = { file: string; alt: string };

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
    images: [
      { file: "1.jpg", alt: "Ceylon Puff-Sleeve Dress — white" },
      { file: "2.jpg", alt: "Ceylon Puff-Sleeve Dress — green" },
      { file: "3.jpg", alt: "Ceylon Puff-Sleeve Dress — worn, editorial" },
      { file: "4.jpg", alt: "Ceylon Puff-Sleeve Dress — worn, alternate view" },
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
    images: [
      { file: "1.jpg", alt: "Tiered Linen Midi Dress — white" },
      { file: "2.jpg", alt: "Tiered Linen Midi Dress — olive, worn" },
      { file: "3.jpg", alt: "Tiered Linen Midi Dress — grey" },
      { file: "4.jpg", alt: "Tiered Linen Midi Dress — burgundy" },
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
    images: [
      { file: "1.jpg", alt: "Signature Structural Sweater — green, worn" },
      { file: "2.jpg", alt: "Signature Structural Sweater — black" },
      { file: "3.jpg", alt: "Signature Structural Sweater — cream" },
      { file: "4.jpg", alt: "Signature Structural Sweater — editorial" },
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
    images: [
      { file: "1.jpg", alt: "Signature Lounge Set — cream, worn" },
      { file: "2.jpg", alt: "Signature Lounge Set — tucked styling" },
      { file: "3.jpg", alt: "Signature Lounge Set — jacket detail" },
      { file: "4.jpg", alt: "Signature Lounge Set — trouser detail" },
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
    images: [
      { file: "1.jpg", alt: "Beach Club Crochet Dress — white" },
      { file: "2.jpg", alt: "Beach Club Crochet Dress — beige, worn" },
      { file: "3.jpg", alt: "Beach Club Crochet Dress — dark blue" },
      { file: "4.jpg", alt: "Beach Club Crochet Dress — light blue" },
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
    images: [
      { file: "1.jpg", alt: "Weekend Oversized Set — grey, flat lay" },
      { file: "2.jpg", alt: "Weekend Oversized Set — grey, worn" },
      { file: "3.jpg", alt: "Weekend Oversized Set — beige" },
      { file: "4.jpg", alt: "Weekend Oversized Set — green" },
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
    images: [
      { file: "1.jpg", alt: "Signature Polo Shirt — white" },
      { file: "2.jpg", alt: "Signature Polo Shirt — white, worn" },
      { file: "3.jpg", alt: "Signature Polo Shirt — black, worn" },
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
    images: [
      { file: "1.jpg", alt: "Signature Hoodie — black" },
      { file: "2.jpg", alt: "Signature Hoodie — green" },
      { file: "3.jpg", alt: "Signature Hoodie — maroon" },
      { file: "4.jpg", alt: "Signature Hoodie — white" },
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
    images: [
      { file: "1.jpg", alt: "Woven Pocket Tee — white" },
      { file: "2.jpg", alt: "Woven Pocket Tee — green" },
      { file: "3.jpg", alt: "Woven Pocket Tee — black" },
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
    images: [
      { file: "1.jpg", alt: "Classic Pocket Tee — white" },
      { file: "2.jpg", alt: "Classic Pocket Tee — green" },
      { file: "3.jpg", alt: "Classic Pocket Tee — black" },
      { file: "4.jpg", alt: "Classic Pocket Tee — maroon" },
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
    images: [{ file: "1.jpg", alt: "Essential Crew Tee — white" }],
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
    images: [
      { file: "1.jpg", alt: "Ceylon Logo Tee — white" },
      { file: "2.jpg", alt: "Ceylon Logo Tee — black" },
      { file: "3.jpg", alt: "Ceylon Logo Tee — green" },
      { file: "4.jpg", alt: "Ceylon Logo Tee — maroon" },
      { file: "5.jpg", alt: "Ceylon Logo Tee — black, worn" },
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
      })),
    );

    const sizes = ["XS", "S", "M", "L", "XL"];
    await db.insert(productVariants).values(
      sizes.map((size, i) => ({
        productId: inserted.id,
        sku: `${p.slug}-${size.toLowerCase()}`,
        size,
        priceCents: p.basePriceCents,
        stockQuantity: i === 1 ? 2 : Math.floor(Math.random() * 12) + 4,
        isActive: true,
      })),
    );

    for (const tagSlug of p.tagSlugs) {
      if (tagMap[tagSlug]) {
        await db
          .insert(productTags)
          .values({ productId: inserted.id, tagId: tagMap[tagSlug] })
          .onConflictDoNothing();
      }
    }

    console.log(`  ${p.name} (${p.images.length} images, 5 variants)`);
  }

  console.log(`${productData.length} new-arrival products seeded.`);
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
