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
  journalArticles,
  lookbookEntries,
} from "../lib/db/schema";

const img = (seed: string, w = 800, h = 1000) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

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

  // ── Journal articles ──────────────────────────────────────────────────────
  const journalData = [
    {
      slug: "the-considered-wardrobe",
      title: "The Art of the Considered Wardrobe",
      excerpt: "On building a wardrobe that lasts — not by spending more, but by buying less and choosing better.",
      coverImageUrl: img("journal-considered-wardrobe", 1200, 800),
      body: `<p>We spend a lot of time thinking about what it means to dress well. Not fashionably — well. The distinction matters more than most people allow themselves to believe.</p><p>A well-dressed person is not someone who owns the most clothes or the most expensive ones. They are someone who has learned exactly what they need and stopped acquiring everything else.</p><h2>Start with the basics</h2><p>Every considered wardrobe begins with a handful of pieces that do the heavy lifting: coats, trousers, knitwear. These are the things you reach for without thinking — the ones that make the complicated decisions feel simple.</p><p>Quality here is not a luxury. It is arithmetic. A coat you wear for fifteen years costs less per wear than one you replace every two. The maths is uncomplicated; the discipline is less so.</p><h2>Resist the edit</h2><p>Capsule wardrobe culture has an editing problem. The advice is always to cut down, cut down, cut down — as though fewer pieces automatically mean better choices. This is not true. What matters is that every piece you own earns its place.</p><p>The question to ask of any garment is not how many things it goes with. It is whether you reach for it without thinking. That unconscious reach is the only honest metric.</p>`,
      publishedAt: "2026-04-15",
      status: "published" as const,
      seoTitle: "The Art of the Considered Wardrobe — Arachchi Journal",
      seoDescription: "Building a wardrobe that lasts by buying less and choosing better.",
    },
    {
      slug: "on-wearing-things-that-last",
      title: "On Wearing Things That Last",
      excerpt: "What longevity in clothing actually requires — from the fabric to the way you move in it.",
      coverImageUrl: img("journal-things-that-last", 1200, 800),
      body: `<p>The most expensive garment you will ever buy is the one you stop wearing. Its cost does not decrease because it sits in a wardrobe — it simply moves off the ledger and into the space where good decisions should have been.</p><p>Longevity in clothing is not a quality you can read from the label. It is the product of several things working together: the fibre, the construction, the care, and — perhaps most importantly — the cut.</p><h2>What fabric actually does</h2><p>Natural fibres age. Synthetic fibres degrade. This is not a value judgement; it is a material fact. A merino sweater worn for ten years looks like a ten-year-old sweater — which is to say, characterful. A polyester one looks like a tired polyester sweater.</p><p>The fibres that last longest are also the ones that require the most care: cashmere, silk, wool, linen. The care instructions are not suggestions. They are the terms of a long relationship.</p><h2>The cut matters most</h2><p>A garment that fits imprecisely will always look imprecise, regardless of how expensive the fabric is. The inverse is also true: a beautifully cut garment in an ordinary fabric looks considered. Most people have this backwards.</p>`,
      publishedAt: "2026-04-02",
      status: "published" as const,
      seoTitle: "On Wearing Things That Last — Arachchi Journal",
      seoDescription: "What longevity in clothing actually requires — from the fabric to the way you move in it.",
    },
    {
      slug: "inside-the-atelier",
      title: "Inside the Atelier: How Our Coats Are Made",
      excerpt: "A visit to the production facility outside Biella, where every coat begins as a drawing on a table.",
      coverImageUrl: img("journal-atelier", 1200, 800),
      body: `<p>The town of Biella sits in the foothills of the Alps, and it has been making fabric for 600 years. The air is damp in a way that is good for wool — it keeps the fibres pliable during processing and prevents the static that plagues drier climates.</p><p>We come here twice a year. Not to browse a catalogue of fabrics, but to have a conversation about what we are trying to make and why. The mills we work with are small enough that this conversation still means something.</p><h2>The coat begins as a drawing</h2><p>Every coat starts as a sketch — not a fashion sketch, which tends toward exaggeration, but a technical drawing with measurements attached. From there, a toile is made in calico, which is fitted on a dress form and then on a real person. The fitting process takes longer than most people imagine.</p><p>Small adjustments at the toile stage have large consequences at the finished garment stage. A shoulder seam moved by a centimetre changes the way the lapel rolls. The lapel roll changes the way the coat hangs. These are not small things.</p><h2>The cut</h2><p>Cutting a coat in a double-faced fabric — one where both sides are finished to the same standard — requires a precision that single-faced fabrics do not. Every seam must be opened and pressed by hand. The hem is hand-sewn. The buttonholes are worked with a machine setting that took years to calibrate.</p>`,
      publishedAt: "2026-03-20",
      status: "published" as const,
      seoTitle: "Inside the Atelier — Arachchi Journal",
      seoDescription: "A visit to the production facility in Biella, where every coat begins as a drawing.",
    },
    {
      slug: "cashmere-care-guide",
      title: "A Complete Guide to Caring for Cashmere",
      excerpt: "The right way to wash, dry, store, and repair cashmere — from the people who make it.",
      coverImageUrl: img("journal-cashmere-care", 1200, 800),
      body: `<p>Cashmere has a reputation for being difficult to care for. This is not entirely undeserved, but it is exaggerated. Cashmere is resilient — it has to be, to survive on a goat in the Mongolian steppe — and if you treat it with the minimum amount of respect, it will last decades.</p><h2>Washing</h2><p>Hand washing in cool water with a small amount of gentle wool wash is the correct method. The water should be around 30°C — roughly the temperature of a comfortable bath. Submerge the garment, move it gently for a few minutes, then lift it out without wringing. Wring water out by pressing between two towels, never by twisting.</p><p>Dry cleaning is acceptable, but not preferable for regular washes. The chemicals used in dry cleaning are effective but can, over time, strip the natural oils from cashmere fibres.</p><h2>Drying</h2><p>Dry flat, away from direct sunlight or heat. Cashmere stretched while wet will dry in that stretched shape. A sweater placed on a hanger while damp will develop shoulder bumps that cannot be removed.</p><h2>Pilling</h2><p>All cashmere pills. This is a feature, not a defect — it indicates the fibres are natural and alive. Remove pills with a cashmere comb or a dedicated fabric shaver. Do not use a razor blade. Do not use tape. Use the right tool.</p>`,
      publishedAt: "2026-03-08",
      status: "published" as const,
      seoTitle: "A Complete Guide to Caring for Cashmere — Arachchi Journal",
      seoDescription: "The right way to wash, dry, store, and repair cashmere.",
    },
    {
      slug: "our-first-collection",
      title: "The Story Behind Our First Collection",
      excerpt: "How Arachchi began — the decisions, the doubts, and the pieces we almost didn't make.",
      coverImageUrl: img("journal-first-collection", 1200, 800),
      body: `<p>The first piece we made was a coat. Not because a coat is the most commercially viable starting point — it is arguably the opposite — but because a coat is the piece that tells you the most about a brand. It requires the most fabric, the most construction, the most fit. You cannot hide behind a coat.</p><p>We made twelve of them in the first run. Six sold in the first week. The other six we wore ourselves through the winter of 2025, noticing what worked and what needed to change.</p><h2>The decisions</h2><p>Every brand starts with a set of decisions that are made before anyone is paying attention. We made ours in a rented studio in the west end of Toronto, with reference books spread across the floor and fabric samples pinned to the walls.</p><p>The first decision was that we would not compromise on fabric. This sounds obvious; it is not. Fabric is the most expensive line item in clothing production, and the pressure to reduce it is constant. We decided early that we would price our pieces to cover the fabric we wanted to use, not the other way around.</p><h2>The pieces we almost didn't make</h2><p>The Zenith Dress almost didn't happen. The bias cut is difficult to execute at scale — the fabric stretches differently on different bodies, and the fit can go wrong in ways that are hard to predict. We made it anyway, and it is now the piece we are most asked about.</p>`,
      publishedAt: "2026-02-14",
      status: "published" as const,
      seoTitle: "The Story Behind Our First Collection — Arachchi Journal",
      seoDescription: "How Arachchi began — the decisions, the doubts, and the pieces we almost didn't make.",
    },
    {
      slug: "five-pieces-every-season",
      title: "Five Pieces That Work for Every Season",
      excerpt: "Not a capsule wardrobe formula. Five specific garments that genuinely transcend the calendar.",
      coverImageUrl: img("journal-five-pieces", 1200, 800),
      body: `<p>The concept of the capsule wardrobe has produced a great deal of bad advice. The most common version involves a set of numbers — ten pieces, thirty pieces, a hundred pieces — and a list of types: the white shirt, the navy blazer, the well-cut trouser. What it rarely involves is specificity about the actual garments.</p><h2>A coat that goes past the knee</h2><p>Not a jacket. Not a trench. A coat — full-length, in a neutral — that works over everything you own. The length is important: below the knee means it works with dresses, skirts, and trousers equally.</p><h2>A fine-gauge turtleneck</h2><p>In cashmere if the budget allows, in merino if it doesn't. The turtleneck is the most versatile neckline in knitwear — it works under blazers, over shirts, and on its own with any trouser. The fine gauge means it layers without bulk.</p><h2>A silk or satin camisole</h2><p>One that can be worn alone or under anything else. The camisole has spent the last few years being elevated — from underwear to outerwear — and this elevation is well-deserved. It is the most effortless way to look finished.</p><h2>A wide-leg trouser</h2><p>Proportions change, but the wide leg has a permanence that the slim cut and the straight cut share. It works with everything above the waist, from a bodysuit to a coat.</p><h2>A quality knit bag</h2><p>Not a leather tote — though that is good too. A knit or canvas bag in a neutral that works for work and for weekends without the weight of leather.</p>`,
      publishedAt: "2026-01-22",
      status: "published" as const,
      seoTitle: "Five Pieces That Work for Every Season — Arachchi Journal",
      seoDescription: "Five specific garments that genuinely transcend the seasonal calendar.",
    },
    {
      slug: "fabric-glossary",
      title: "Fabric Glossary: From Merino to Silk",
      excerpt: "A guide to the fibres we use — what they are, where they come from, and how they behave.",
      coverImageUrl: img("journal-fabric-glossary", 1200, 800),
      body: `<p>The language of fabric is not arcane — it is practical. Knowing the difference between a merino and a cashmere, or between a silk charmeuse and a silk crêpe, helps you make better decisions about what to buy and how to care for it.</p><h2>Cashmere</h2><p>The fibre comes from the undercoat of cashmere goats, primarily raised in Mongolia and Inner Mongolia. The finest cashmere is graded by fibre diameter: anything under 15 microns is Grade A. For context, a human hair is approximately 60-70 microns. The diameter determines softness; the length determines pill resistance.</p><h2>Merino Wool</h2><p>Merino sheep produce a wool fibre that is finer than most — typically 15 to 24 microns, compared to standard wool at 25 to 40 microns. The fineness means merino wool does not itch against skin, which makes it suitable for garments worn directly on the body. Extra-fine merino, at 17.5 microns or below, is the standard we use.</p><h2>Silk</h2><p>Silk is a protein fibre produced by silkworms during the cocoon stage. Charmeuse is a silk weave with a glossy front and a matte back — it drapes beautifully and is the standard for slip dresses and bias-cut garments. Crêpe de Chine is woven with a slightly crinkled texture that creates less sheen but better drape and wrinkle resistance. Organza is a sheer, crisp weave used for structure.</p><h2>Linen</h2><p>Linen is made from the fibre of the flax plant. Belgian linen is considered the finest — the flax is water-retted, a traditional process that preserves the fibre's strength. Linen has a natural antibacterial property and improves with each wash, becoming softer without losing its characteristic texture.</p>`,
      publishedAt: "2026-01-05",
      status: "published" as const,
      seoTitle: "Fabric Glossary: From Merino to Silk — Arachchi Journal",
      seoDescription: "A guide to the fibres we use — what they are, where they come from, and how they behave.",
    },
    {
      slug: "what-we-mean-by-quality",
      title: "What We Mean When We Say Quality",
      excerpt: "Quality in clothing is not one thing. It is the absence of every possible compromise.",
      coverImageUrl: img("journal-quality", 1200, 800),
      body: `<p>Quality is the word the fashion industry uses when it doesn't want to be specific. We would like to be specific.</p><p>Quality in a garment is not a single property. It is the cumulative absence of compromises — in the fibre selection, in the fabric construction, in the cut, in the sewing, in the finishing. Remove one, and the whole thing shifts.</p><h2>In the fibre</h2><p>The grade of the fibre determines everything downstream. A Grade-A cashmere sweater made in a basic way will still feel better than a Grade-B cashmere sweater made with care. Start with the best fibre you can source, and work from there.</p><h2>In the construction</h2><p>The difference between a garment that costs £100 and one that costs £1,000 is rarely visible from the outside. It is in the seams, the stitching, the interfacing, the lining. These are the details that determine how a garment ages rather than how it looks on the rack.</p><p>French seams — where the raw edge is folded inside a second seam — take twice as long as an overlocked seam. They also last twice as long and look better in the process. This is the kind of detail we care about.</p><h2>In the cut</h2><p>A garment can be made from the best available fabric with the finest available construction and still look wrong if the cut is incorrect. The cut is where most of the work is done, and most of the money is saved. We do not save money on the cut.</p>`,
      publishedAt: "2025-12-10",
      status: "published" as const,
      seoTitle: "What We Mean When We Say Quality — Arachchi Journal",
      seoDescription: "Quality in clothing is not one thing. It is the absence of every possible compromise.",
    },
  ];

  for (const article of journalData) {
    await db
      .insert(journalArticles)
      .values({
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        coverImageUrl: article.coverImageUrl,
        body: article.body,
        status: article.status,
        publishedAt: new Date(article.publishedAt),
        seoTitle: article.seoTitle,
        seoDescription: article.seoDescription,
      })
      .onConflictDoUpdate({
        target: journalArticles.slug,
        set: {
          title: article.title,
          excerpt: article.excerpt,
          body: article.body,
          status: article.status,
          publishedAt: new Date(article.publishedAt),
        },
      });
  }

  console.log(`  ${journalData.length} journal articles`);

  // ── Lookbook entries ──────────────────────────────────────────────────────
  const lookbookData = [
    {
      slug: "convergence-editorial",
      title: "Convergence",
      coverImageUrl: "/images/convergence/1.jpeg",
      body: "<p>Structure and movement. Four pieces built around the meeting point — where architectural form gives way to effortless wear.</p>",
      linkedProductSlugs: ["convergence-jacket", "convergence-trousers", "convergence-tee", "convergence-denims"],
      position: 1,
    },
    {
      slug: "zenith-editorial",
      title: "Zenith",
      coverImageUrl: "/images/zenith/1.jpeg",
      body: "<p>Elevation in every sense. The Zenith collection reaches for the highest form — in fabric, in cut, in the quiet authority of each piece.</p>",
      linkedProductSlugs: ["zenith-coat", "zenith-dress", "zenith-knit", "zenith-blouse"],
      position: 2,
    },
    {
      slug: "monolith-editorial",
      title: "Monolith",
      coverImageUrl: "/images/monolith/1.jpeg",
      body: "<p>Singular. Unmovable. Two pieces built to endure — the Monolith Jacket and Monolith Trousers, worn together or apart.</p>",
      linkedProductSlugs: ["monolith-jacket", "monolith-trousers"],
      position: 3,
    },
    {
      slug: "vale-editorial",
      title: "Vale",
      coverImageUrl: "/images/vale/1.jpeg",
      body: "<p>Quieter. Earthen. Close to the ground. The Vale collection is for the days when you want to look considered without trying.</p>",
      linkedProductSlugs: ["vale-shirt", "vale-trouser", "vale-knit", "vale-dress"],
      position: 4,
    },
  ];

  for (const entry of lookbookData) {
    const productIds = entry.linkedProductSlugs
      .map((slug) => productSlugToId.get(slug))
      .filter((id): id is string => Boolean(id));

    await db
      .insert(lookbookEntries)
      .values({
        slug: entry.slug,
        title: entry.title,
        coverImageUrl: entry.coverImageUrl,
        body: entry.body,
        productIds,
        position: entry.position,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: lookbookEntries.slug,
        set: {
          title: entry.title,
          body: entry.body,
          productIds,
          isActive: true,
        },
      });
  }

  console.log(`  ${lookbookData.length} lookbook entries`);
  console.log("Done.");
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
