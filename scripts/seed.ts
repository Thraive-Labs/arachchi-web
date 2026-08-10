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

type ProductDef = {
  slug: string;
  name: string;
  categorySlug: string;
  basePriceCents: number;
  compareAtPriceCents?: number;
  primaryImage: string;
  secondaryImage: string;
  shortDescription: string;
  description: string;
  isFeatured: boolean;
  isTrending: boolean;
  tagSlugs: string[];
  metadata: Record<string, string>;
  sizes?: string[];
};

const productData: ProductDef[] = [
  // ── CONVERGENCE ───────────────────────────────────────────────────────────
  {
    slug: "convergence-jacket",
    name: "Convergence Jacket",
    categorySlug: "outerwear",
    basePriceCents: 89500,
    primaryImage: "/images/convergence/1.jpeg",
    secondaryImage: "/images/convergence/2.jpeg",
    shortDescription: "A structured jacket from the Convergence collection — architectural in form, deliberate in every seam.",
    description: "The Convergence Jacket is cut from a medium-weight wool blend with a defined shoulder and a clean, unadorned front. The construction borrows from tailoring: the lining is hand-finished, the buttonholes are worked by machine with a bespoke setting. This is the jacket that holds a room together.",
    isFeatured: true,
    isTrending: true,
    tagSlugs: ["new-arrivals", "editor-picks"],
    metadata: { material: "72% Wool, 28% Polyamide", care: "Dry clean only", origin: "Italy" },
  },
  {
    slug: "convergence-trousers",
    name: "Convergence Trousers",
    categorySlug: "trousers",
    basePriceCents: 48500,
    primaryImage: "/images/convergence/2.jpeg",
    secondaryImage: "/images/convergence/1.jpeg",
    shortDescription: "Tailored trousers from Convergence — clean lines, precise cut, effortless drape.",
    description: "Cut from a crisp Italian wool blend, the Convergence Trousers balance architectural structure with a relaxed leg. A high waistband with a single front pleat, clean-cut pockets, and a hem that sits precisely where it should. The silhouette is deliberately elongating.",
    isFeatured: true,
    isTrending: false,
    tagSlugs: ["new-arrivals"],
    metadata: { material: "80% Wool, 20% Viscose", care: "Dry clean recommended", origin: "Italy" },
  },
  {
    slug: "convergence-tee",
    name: "Convergence T-Shirt",
    categorySlug: "tops",
    basePriceCents: 28500,
    primaryImage: "/images/convergence/3.jpeg",
    secondaryImage: "/images/convergence/4.jpeg",
    shortDescription: "A refined cotton tee from Convergence — the simplest piece in the collection, made to the same standard.",
    description: "The Convergence T-Shirt is made from a 200-gsm Egyptian cotton jersey with a slightly boxy cut and a reinforced crew neck. It is not a basic — it is the result of applying the same design rigour to a simple form. The seams are flat-felled. The fit is considered.",
    isFeatured: false,
    isTrending: true,
    tagSlugs: ["under-500"],
    metadata: { material: "100% 200-gsm Egyptian Cotton", care: "Machine wash cold, hang to dry", origin: "Portugal" },
  },
  {
    slug: "convergence-denims",
    name: "Convergence Denims",
    categorySlug: "trousers",
    basePriceCents: 38500,
    primaryImage: "/images/convergence/4.jpeg",
    secondaryImage: "/images/convergence/3.jpeg",
    shortDescription: "Convergence Denims — selvedge denim cut with the same architectural precision as the rest of the collection.",
    description: "Cut from a 13.5oz Japanese selvedge denim in a straight, slightly relaxed leg. The Convergence Denims are sanforized to minimise shrinkage and washed once to soften the hand. The rise is high; the hem falls to the ankle without break.",
    isFeatured: false,
    isTrending: true,
    tagSlugs: ["new-arrivals", "under-500"],
    metadata: { material: "100% 13.5oz Japanese Selvedge Denim", care: "Machine wash cold inside out, line dry", origin: "Japan" },
  },

  // ── ZENITH ────────────────────────────────────────────────────────────────
  {
    slug: "zenith-coat",
    name: "Zenith Coat",
    categorySlug: "outerwear",
    basePriceCents: 125000,
    primaryImage: "/images/zenith/1.jpeg",
    secondaryImage: "/images/zenith/2.jpeg",
    shortDescription: "The peak of the Zenith collection — a long overcoat cut from the finest double-faced wool.",
    description: "The Zenith Coat is our most elevated outerwear piece. Cut from a double-faced wool blend woven in Biella, it reaches mid-calf and falls with the weight that only natural fibre can provide. The silhouette is single-breasted with a clean notch lapel, large-format buttons, and deep pockets.",
    isFeatured: true,
    isTrending: true,
    tagSlugs: ["editor-picks", "gift-guide"],
    metadata: { material: "85% Wool, 15% Cashmere, double-faced", care: "Dry clean only", origin: "Italy" },
  },
  {
    slug: "zenith-dress",
    name: "Zenith Dress",
    categorySlug: "dresses",
    basePriceCents: 79500,
    primaryImage: "/images/zenith/2.jpeg",
    secondaryImage: "/images/zenith/1.jpeg",
    shortDescription: "The Zenith Dress — a bias-cut silk piece that reaches its highest form in movement.",
    description: "Cut on the bias from 22-momme silk charmeuse, the Zenith Dress moves like water and catches light differently at every angle. The hem falls mid-calf with a subtle fishtail at the back. Adjustable straps, a hand-rolled hem, and zero hardware.",
    isFeatured: true,
    isTrending: false,
    tagSlugs: ["editor-picks", "summer-2026"],
    metadata: { material: "100% 22mm Silk Charmeuse", care: "Dry clean only", origin: "France" },
  },
  {
    slug: "zenith-knit",
    name: "Zenith Knit",
    categorySlug: "knitwear",
    basePriceCents: 54500,
    primaryImage: "/images/zenith/3.jpeg",
    secondaryImage: "/images/zenith/4.jpeg",
    shortDescription: "Grade-A cashmere knit from Zenith — elevated to its most refined form.",
    description: "Knitted in 14-gauge Grade-A cashmere, the Zenith Knit is structured enough to wear as a layer but refined enough to stand alone. The ribbed hem and cuffs are tighter than the body to define the silhouette without restricting movement. The neckline is a precise crew.",
    isFeatured: false,
    isTrending: true,
    tagSlugs: ["gift-guide"],
    metadata: { material: "100% Grade-A Cashmere, 14-gauge", care: "Hand wash cold or dry clean", origin: "Scotland" },
  },
  {
    slug: "zenith-blouse",
    name: "Zenith Blouse",
    categorySlug: "tops",
    basePriceCents: 39500,
    primaryImage: "/images/zenith/4.jpeg",
    secondaryImage: "/images/zenith/3.jpeg",
    shortDescription: "A silk blouse from Zenith — understated, elevated, effortless.",
    description: "Cut from a heavy silk crêpe de Chine in a loose, draping silhouette, the Zenith Blouse tucks into everything but works equally well worn out. The collar is a soft notch that sits against the neck without a button. The cuffs are single-button, finished by hand.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["under-500", "summer-2026"],
    metadata: { material: "100% Heavy Silk Crêpe de Chine", care: "Dry clean only", origin: "France" },
  },

  // ── MONOLITH ──────────────────────────────────────────────────────────────
  {
    slug: "monolith-jacket",
    name: "Monolith Jacket",
    categorySlug: "outerwear",
    basePriceCents: 98500,
    primaryImage: "/images/monolith/1.jpeg",
    secondaryImage: "/images/monolith/2.jpeg",
    shortDescription: "A singular structured jacket from Monolith — built to endure.",
    description: "The Monolith Jacket is heavy, precise, and made for permanence. Cut from a double-faced boiled wool in a boxy, minimal silhouette with concealed press-stud closure. No lapels. No external pockets. Nothing that does not need to be there.",
    isFeatured: true,
    isTrending: false,
    tagSlugs: ["editor-picks"],
    metadata: { material: "100% Boiled Wool", care: "Dry clean only", origin: "Austria" },
  },
  {
    slug: "monolith-trousers",
    name: "Monolith Trousers",
    categorySlug: "trousers",
    basePriceCents: 52500,
    primaryImage: "/images/monolith/2.jpeg",
    secondaryImage: "/images/monolith/1.jpeg",
    shortDescription: "Monolith Trousers — unmovable in form, flawless in execution.",
    description: "A straight-leg trouser in a substantial Italian wool with a concealed side-zip and a clean, pleat-free front. The Monolith Trousers are designed to be worn high at the waist with everything tucked in, or with a jacket that ends exactly at the hip. Proportions are everything.",
    isFeatured: false,
    isTrending: true,
    tagSlugs: ["new-arrivals"],
    metadata: { material: "90% Wool, 10% Polyamide", care: "Dry clean only", origin: "Italy" },
  },

  // ── VALE ──────────────────────────────────────────────────────────────────
  {
    slug: "vale-shirt",
    name: "Vale Shirt",
    categorySlug: "tops",
    basePriceCents: 34500,
    primaryImage: "/images/vale/1.jpeg",
    secondaryImage: "/images/vale/2.jpeg",
    shortDescription: "A washed linen shirt from Vale — close to the ground, effortlessly worn.",
    description: "The Vale Shirt is stone-washed in a mid-weight Belgian linen until it reaches the kind of softness that cannot be manufactured — only earned. The fit is slightly oversized with a dropped shoulder. The collar is unfused; the placket is clean. It improves with every wash.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["summer-2026", "under-500", "sustainable"],
    metadata: { material: "100% Belgian Linen, stone-washed", care: "Machine wash cold, line dry", origin: "Belgium" },
  },
  {
    slug: "vale-trouser",
    name: "Vale Trouser",
    categorySlug: "trousers",
    basePriceCents: 44500,
    primaryImage: "/images/vale/2.jpeg",
    secondaryImage: "/images/vale/1.jpeg",
    shortDescription: "Relaxed trousers from Vale — earthen in colour, quiet in character.",
    description: "Cut from a garment-dyed ripstop linen with an elastic waistband and a wide, slightly tapered leg. The Vale Trouser is the piece you reach for on days when you want to look considered without trying. The linen softens with every wash.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["summer-2026", "under-500"],
    metadata: { material: "100% Garment-dyed Ripstop Linen", care: "Machine wash cold, line dry", origin: "Lithuania" },
  },
  {
    slug: "vale-knit",
    name: "Vale Knit",
    categorySlug: "knitwear",
    basePriceCents: 48500,
    primaryImage: "/images/vale/3.jpeg",
    secondaryImage: "/images/vale/4.jpeg",
    shortDescription: "A brushed merino knit from Vale — soft, warm, and deeply understated.",
    description: "Knitted in a brushed 12-gauge merino with a soft halo, the Vale Knit is warm without weight and quiet without being plain. The silhouette is relaxed through the body with a subtle tuck at the hem. The colour is deliberately earthen — it goes with everything in the collection.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["gift-guide"],
    metadata: { material: "100% Brushed Merino, 12-gauge", care: "Hand wash cold, dry flat", origin: "Italy" },
  },
  {
    slug: "vale-dress",
    name: "Vale Dress",
    categorySlug: "dresses",
    basePriceCents: 69500,
    primaryImage: "/images/vale/4.jpeg",
    secondaryImage: "/images/vale/3.jpeg",
    shortDescription: "The Vale Dress — a quiet garment in washed silk, close to the body and close to the earth.",
    description: "The Vale Dress is cut in a washed silk habotai with a relaxed, slightly A-line silhouette and a hem that falls below the knee. The fabric is lightweight enough to feel like wearing nothing, substantial enough to move with intention. The collar is a soft V; the sleeves are three-quarter length.",
    isFeatured: true,
    isTrending: true,
    tagSlugs: ["editor-picks", "summer-2026"],
    metadata: { material: "100% Washed Silk Habotai", care: "Hand wash cold or dry clean", origin: "France" },
  },
];

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  console.log("Seeding database...");

  // ── Categories ────────────────────────────────────────────────────────────
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
  console.log(`  ${insertedCategories.length} categories`);

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
  console.log(`  ${insertedTags.length} tags`);

  // ── Products — clear first, then re-seed ──────────────────────────────────
  await db.delete(productTags);
  await db.delete(productImages);
  await db.delete(productVariants);
  await db.delete(products);
  console.log("  cleared existing products");

  const productSlugToId = new Map<string, string>();

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
        compareAtPriceCents: p.compareAtPriceCents ?? null,
        isFeatured: p.isFeatured,
        isTrending: p.isTrending,
        isActive: true,
        metadata: p.metadata,
      })
      .returning();

    productSlugToId.set(p.slug, inserted.id);

    await db.insert(productImages).values([
      { productId: inserted.id, url: p.primaryImage,   alt: p.name,                          position: 0, isPrimary: true  },
      { productId: inserted.id, url: p.secondaryImage, alt: `${p.name} — alternate view`,    position: 1, isPrimary: false },
    ]);

    const sizes = p.sizes ?? ["XS", "S", "M", "L", "XL"];
    await db.insert(productVariants).values(
      sizes.map((size, i) => ({
        productId: inserted.id,
        sku: `${p.slug}-${size.toLowerCase().replace(/\s+/g, "-")}`,
        size,
        priceCents: p.basePriceCents,
        stockQuantity: i === 1 ? 2 : Math.floor(Math.random() * 12) + 4,
        isActive: true,
      }))
    );

    for (const tagSlug of p.tagSlugs) {
      if (tagMap[tagSlug]) {
        await db
          .insert(productTags)
          .values({ productId: inserted.id, tagId: tagMap[tagSlug] })
          .onConflictDoNothing();
      }
    }
  }

  console.log(`  ${productData.length} products with variants and images`);

  // ── Related products (same-category links) ────────────────────────────────
  for (const p of productData) {
    const productId = productSlugToId.get(p.slug);
    if (!productId) continue;

    const relatedIds = productData
      .filter((other) => other.categorySlug === p.categorySlug && other.slug !== p.slug)
      .slice(0, 6)
      .map((other) => productSlugToId.get(other.slug))
      .filter((id): id is string => Boolean(id));

    if (relatedIds.length > 0) {
      await db
        .update(products)
        .set({ relatedProductIds: relatedIds })
        .where(eq(products.id, productId));
    }
  }

  console.log("  related product links set");

  console.log("Done.");
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
