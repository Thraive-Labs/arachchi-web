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
  shortDescription: string;
  description: string;
  isFeatured: boolean;
  isTrending: boolean;
  tagSlugs: string[];
  metadata: Record<string, string>;
  sizes?: string[];
};

const productData: ProductDef[] = [
  // ── OUTERWEAR ────────────────────────────────────────────────────────────
  {
    slug: "langford-oversized-coat",
    name: "Langford Oversized Coat",
    categorySlug: "outerwear",
    basePriceCents: 125000,
    shortDescription: "A signature double-faced wool coat, cut with generous proportions for effortless drape.",
    description: "The Langford is our house coat — structured through the shoulder, relaxed through the body, and finished with hand-sewn details that reward close inspection. Made in Italy from a double-faced wool blend.",
    isFeatured: true,
    isTrending: true,
    tagSlugs: ["new-arrivals", "editor-picks"],
    metadata: { material: "70% Wool, 20% Cashmere, 10% Polyamide", care: "Dry clean only", origin: "Italy" },
  },
  {
    slug: "structured-blazer",
    name: "Structured Blazer",
    categorySlug: "outerwear",
    basePriceCents: 92000,
    shortDescription: "A one-button blazer with a defined shoulder and clean canvas construction.",
    description: "Half-canvas construction gives this blazer a structured silhouette that softens to the body over time. The lapel is cut slightly narrower than current trends, making it a long-term investment.",
    isFeatured: false,
    isTrending: true,
    tagSlugs: ["editor-picks"],
    metadata: { material: "60% Wool, 35% Silk, 5% Cashmere", care: "Dry clean only", origin: "Italy" },
  },
  {
    slug: "birchwood-trench-coat",
    name: "Birchwood Trench Coat",
    categorySlug: "outerwear",
    basePriceCents: 148000,
    shortDescription: "A double-breasted trench in water-resistant gabardine, cut to the knee.",
    description: "The Birchwood is our take on the classic trench — double-breasted, belted, and cut precisely to the knee. Water-resistant gabardine means it handles the city in any season.",
    isFeatured: true,
    isTrending: false,
    tagSlugs: ["new-arrivals", "editor-picks"],
    metadata: { material: "100% Cotton Gabardine (water-resistant finish)", care: "Dry clean only", origin: "United Kingdom" },
  },
  {
    slug: "ashford-leather-jacket",
    name: "Ashford Leather Jacket",
    categorySlug: "outerwear",
    basePriceCents: 198000,
    shortDescription: "Full-grain lambskin with a minimal moto silhouette — clean, not decorative.",
    description: "Cut from a single hide of vegetable-tanned lambskin, the Ashford develops a rich patina with every wear. The silhouette is moto-inspired but stripped of all unnecessary hardware.",
    isFeatured: false,
    isTrending: true,
    tagSlugs: ["editor-picks", "gift-guide"],
    metadata: { material: "100% Full-grain lambskin leather", care: "Professional leather care only", origin: "Italy" },
  },
  {
    slug: "holt-cashmere-topcoat",
    name: "Holt Cashmere Topcoat",
    categorySlug: "outerwear",
    basePriceCents: 285000,
    shortDescription: "A single-breasted overcoat in 100% cashmere — the pinnacle of the collection.",
    description: "The Holt is made from 80% cashmere blended with silk for added strength and luminosity. The cut is long, lean, and deliberately timeless — a piece you will pass down.",
    isFeatured: true,
    isTrending: false,
    tagSlugs: ["editor-picks", "gift-guide"],
    metadata: { material: "80% Cashmere, 20% Silk", care: "Dry clean only", origin: "Scotland" },
  },
  {
    slug: "windsor-camel-coat",
    name: "Windsor Camel Coat",
    categorySlug: "outerwear",
    basePriceCents: 168000,
    shortDescription: "Classic camel double-face wool in a straight, notch-lapel silhouette.",
    description: "Camel is not a trend. This coat is built to outlast decades of them — straight cut, notch lapel, quality corozo buttons, and a double-face wool that is as good inside as it is out.",
    isFeatured: false,
    isTrending: true,
    tagSlugs: ["new-arrivals"],
    metadata: { material: "85% Wool, 15% Cashmere", care: "Dry clean only", origin: "Italy" },
  },
  {
    slug: "slate-boucle-blazer",
    name: "Slate Bouclé Blazer",
    categorySlug: "outerwear",
    basePriceCents: 125000,
    shortDescription: "Textured bouclé in a relaxed, collarless silhouette with patch pockets.",
    description: "The Slate is our collarless blazer — a French-inspired form that works equally as a jacket or a top layer. The bouclé fabric adds visual texture while remaining lightweight.",
    isFeatured: true,
    isTrending: false,
    tagSlugs: ["new-arrivals", "editor-picks"],
    metadata: { material: "55% Wool, 30% Acrylic, 15% Cotton bouclé", care: "Dry clean only", origin: "France" },
  },
  {
    slug: "nightfall-velvet-jacket",
    name: "Nightfall Velvet Jacket",
    categorySlug: "outerwear",
    basePriceCents: 142000,
    shortDescription: "A tailored velvet jacket that transitions effortlessly from day to evening.",
    description: "Cut in a deep midnight silk-blend velvet, the Nightfall has a slim notch lapel and clean patch pockets. The lining is printed silk. This is the piece that elevates everything it is worn with.",
    isFeatured: false,
    isTrending: true,
    tagSlugs: ["new-arrivals", "editor-picks"],
    metadata: { material: "65% Silk, 35% Cotton velvet", care: "Dry clean only", origin: "Italy" },
  },
  {
    slug: "harbour-waxed-anorak",
    name: "Harbour Waxed Anorak",
    categorySlug: "outerwear",
    basePriceCents: 88000,
    shortDescription: "Waxed cotton anorak with a boxy silhouette and utility-style pockets.",
    description: "Re-waxable, repairable, and built to handle weather that doesn't care about your plans. The Harbour has a dropped shoulder, chest-level kangaroo pocket, and draws at the hem.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["under-500", "sustainable"],
    metadata: { material: "100% Waxed Cotton (re-waxable)", care: "Re-wax annually, wipe clean", origin: "United Kingdom" },
  },
  {
    slug: "estate-herringbone-coat",
    name: "Estate Herringbone Coat",
    categorySlug: "outerwear",
    basePriceCents: 195000,
    shortDescription: "A full-length herringbone wool coat with a generous shawl collar.",
    description: "Woven on Biella looms from a fine herringbone tweed, the Estate is built for the person who refuses to be cold. The shawl collar is wide, the pockets are deep, and the hem falls to the ankle.",
    isFeatured: true,
    isTrending: false,
    tagSlugs: ["editor-picks", "gift-guide"],
    metadata: { material: "90% Wool, 10% Cashmere herringbone tweed", care: "Dry clean only", origin: "Italy" },
  },
  {
    slug: "camp-collar-linen-jacket",
    name: "Camp Collar Linen Jacket",
    categorySlug: "outerwear",
    basePriceCents: 85000,
    shortDescription: "A relaxed unstructured linen jacket with a camp collar and patch pockets.",
    description: "The camp collar and unlined construction make this the summer jacket for people who think summer jackets shouldn't be warm. Stone-washed linen crumples beautifully.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["summer-2026", "under-500"],
    metadata: { material: "100% Stone-washed linen", care: "Machine wash cold, line dry", origin: "Portugal" },
  },
  {
    slug: "moto-suede-jacket",
    name: "Moto Suede Jacket",
    categorySlug: "outerwear",
    basePriceCents: 225000,
    shortDescription: "Split suede in a clean moto cut — understated and immediately recognisable.",
    description: "The softest split suede we could source, cut into a minimal moto silhouette with just two zip pockets and a single chest zip. No studs, no buckles. Nothing to date it.",
    isFeatured: false,
    isTrending: true,
    tagSlugs: ["editor-picks", "gift-guide"],
    metadata: { material: "100% Split lamb suede", care: "Professional suede care only", origin: "Italy" },
  },
  {
    slug: "pinstripe-tailored-blazer",
    name: "Pinstripe Tailored Blazer",
    categorySlug: "outerwear",
    basePriceCents: 112000,
    shortDescription: "A chalk-stripe wool blazer with peaked lapels and functional buttonholes.",
    description: "The chalk stripe is a tailoring tradition we refuse to let die. This blazer is cut in Italian wool with a slightly suppressed waist, peaked lapels, and a four-button cuff that actually buttons.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["editor-picks"],
    metadata: { material: "95% Wool, 5% Cashmere pinstripe", care: "Dry clean only", origin: "Italy" },
  },
  {
    slug: "maritime-quilted-vest",
    name: "Maritime Quilted Vest",
    categorySlug: "outerwear",
    basePriceCents: 52000,
    shortDescription: "A lightweight quilted gilet in a matte shell — a perfect layer for any season.",
    description: "Down-filled and lightweight enough to fold into a tote bag, the Maritime is our utility layer. The matte shell resists snags, and the hidden zip pockets are deep enough to matter.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["under-500"],
    metadata: { material: "Shell: 100% Nylon; Fill: 90/10 Down", care: "Machine wash cold, tumble dry low", origin: "Canada" },
  },

  // ── KNITWEAR ─────────────────────────────────────────────────────────────
  {
    slug: "cashmere-rib-turtleneck",
    name: "Cashmere Rib Turtleneck",
    categorySlug: "knitwear",
    basePriceCents: 45000,
    shortDescription: "Pure Grade-A cashmere in a substantial 12-gauge rib. Warm without bulk.",
    description: "Knitted from Grade-A Mongolian cashmere in a tight 12-gauge rib that retains its shape wash after wash. The elongated body and relaxed turtleneck drape beautifully worn tucked or untucked.",
    isFeatured: true,
    isTrending: false,
    tagSlugs: ["gift-guide", "under-500"],
    metadata: { material: "100% Grade-A Cashmere", care: "Hand wash cold or dry clean", origin: "Scotland" },
  },
  {
    slug: "merino-wool-cardigan",
    name: "Merino Wool Cardigan",
    categorySlug: "knitwear",
    basePriceCents: 58000,
    shortDescription: "A long-line cardigan in extra-fine merino with a minimal mother-of-pearl button.",
    description: "Knitted from ultra-fine 17.5-micron merino, this long-line cardigan is the kind of piece that works as a layer or on its own. Finished with a single mother-of-pearl button at the neck.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["gift-guide"],
    metadata: { material: "100% Extra-Fine Merino, 17.5 micron", care: "Hand wash cold", origin: "Italy" },
  },
  {
    slug: "sheer-mohair-crewneck",
    name: "Sheer Mohair Crewneck",
    categorySlug: "knitwear",
    basePriceCents: 48000,
    shortDescription: "An airy mohair crewneck — lightweight, warm, and impossibly soft.",
    description: "Knitted from kid mohair in a loose, open gauge that lets light through. The halo of fibres catches the light differently throughout the day. Warmer than it looks, lighter than it feels.",
    isFeatured: true,
    isTrending: false,
    tagSlugs: ["under-500", "summer-2026"],
    metadata: { material: "70% Kid Mohair, 30% Silk", care: "Hand wash cold only", origin: "Italy" },
  },
  {
    slug: "oversized-alpaca-sweater",
    name: "Oversized Alpaca Sweater",
    categorySlug: "knitwear",
    basePriceCents: 82000,
    shortDescription: "A dropped-shoulder alpaca sweater that wears like a second skin.",
    description: "Royal Alpaca is softer and finer than standard wool, with none of the itch. This sweater is knitted in a substantial 8-gauge to give it the weight and drape that makes it feel like a garment, not just a layer.",
    isFeatured: true,
    isTrending: true,
    tagSlugs: ["new-arrivals"],
    metadata: { material: "80% Royal Alpaca, 20% Merino Wool", care: "Dry clean recommended", origin: "Peru" },
  },
  {
    slug: "ribbed-cashmere-tank",
    name: "Ribbed Cashmere Tank",
    categorySlug: "knitwear",
    basePriceCents: 38000,
    shortDescription: "A fine-rib cashmere tank — the most refined layering piece in your wardrobe.",
    description: "Knitted from Grade-A cashmere in a slim 2x2 rib, this tank is the foundational piece that goes under everything. It is also complete on its own, with a V-neck that is not quite deep.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["under-500", "summer-2026"],
    metadata: { material: "100% Grade-A Cashmere", care: "Hand wash cold", origin: "Scotland" },
  },
  {
    slug: "cable-knit-fisherman-sweater",
    name: "Cable-Knit Fisherman Sweater",
    categorySlug: "knitwear",
    basePriceCents: 72000,
    shortDescription: "A traditional Aran cable-knit in undyed merino — a garment with a history.",
    description: "The fisherman's sweater is one of the few garments that genuinely pre-dates fashion. Ours is knitted in undyed natural merino with a traditional Aran cable pattern, in a slightly relaxed boxy fit.",
    isFeatured: false,
    isTrending: true,
    tagSlugs: ["gift-guide"],
    metadata: { material: "100% Natural Undyed Merino", care: "Hand wash cold, dry flat", origin: "Ireland" },
  },
  {
    slug: "cropped-merino-vest",
    name: "Cropped Merino Vest",
    categorySlug: "knitwear",
    basePriceCents: 42000,
    shortDescription: "A slim, cropped vest in fine merino — made to be seen, not hidden under layers.",
    description: "Cut just above the natural waist, this fine-rib merino vest is structured enough to wear alone and slim enough to layer under blazers without bulk. The V-neck is precisely calibrated.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["under-500"],
    metadata: { material: "100% Fine Merino, 18.5 micron", care: "Hand wash cold", origin: "Italy" },
  },
  {
    slug: "cashmere-half-zip",
    name: "Cashmere Half-Zip",
    categorySlug: "knitwear",
    basePriceCents: 88000,
    shortDescription: "A heritage half-zip in two-ply cashmere — refined enough for any occasion.",
    description: "The half-zip is having its moment, but ours is built to outlast it. Two-ply Grade-A cashmere, a substantial weight, and a barely-there collar that sits cleanly under a coat or on its own.",
    isFeatured: true,
    isTrending: true,
    tagSlugs: ["new-arrivals", "gift-guide"],
    metadata: { material: "100% Two-Ply Grade-A Cashmere", care: "Dry clean recommended", origin: "Scotland" },
  },
  {
    slug: "mohair-blend-wrap",
    name: "Mohair Blend Wrap",
    categorySlug: "knitwear",
    basePriceCents: 36000,
    shortDescription: "A generously sized mohair wrap that doubles as a shawl or a statement layer.",
    description: "Large enough to wrap twice, soft enough to sleep in, and lightweight enough to take on a plane without regret. Made from a brushed mohair blend in a shade that goes with everything.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["under-500", "gift-guide"],
    metadata: { material: "60% Mohair, 40% Fine Merino", care: "Hand wash cold", origin: "Italy" },
  },
  {
    slug: "striped-cashmere-pullover",
    name: "Striped Cashmere Pullover",
    categorySlug: "knitwear",
    basePriceCents: 95000,
    shortDescription: "A tonal stripe cashmere crewneck — a masterclass in restraint.",
    description: "Four shades of cashmere, all in the same tonal family, knitted into a quiet stripe pattern that reads as texture rather than print. This is a piece people will ask you about for years.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["editor-picks"],
    metadata: { material: "100% Two-Ply Cashmere", care: "Dry clean recommended", origin: "Scotland" },
  },
  {
    slug: "long-line-wool-cardigan",
    name: "Long-Line Wool Cardigan",
    categorySlug: "knitwear",
    basePriceCents: 78000,
    shortDescription: "A floor-grazing merino cardigan that wears like a coat and moves like a dress.",
    description: "Long enough to be a dress, open enough to be a coat, casual enough to be a cardigan. This is the piece that works at the end of a long day when you just need to put something on.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["gift-guide"],
    metadata: { material: "100% Extra-Fine Merino", care: "Hand wash cold, dry flat", origin: "Italy" },
  },
  {
    slug: "fine-rib-polo-knit",
    name: "Fine-Rib Polo Knit",
    categorySlug: "knitwear",
    basePriceCents: 44000,
    shortDescription: "A fine-rib polo-collar knit in cotton — a smarter take on a casual classic.",
    description: "This is the knit that fills the gap between a T-shirt and a proper top. Fine cotton rib, a two-button polo collar, and a fit that works tucked or untucked with anything in your wardrobe.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["summer-2026", "under-500"],
    metadata: { material: "100% Organic Egyptian Cotton", care: "Machine wash cold", origin: "Portugal" },
  },

  // ── DRESSES ───────────────────────────────────────────────────────────────
  {
    slug: "silk-bias-cut-slip-dress",
    name: "Silk Bias-Cut Slip Dress",
    categorySlug: "dresses",
    basePriceCents: 68000,
    shortDescription: "Cut on the bias from 19-momme silk charmeuse. Moves like water.",
    description: "A study in restraint. The bias cut creates fluid movement from a single piece of 19-momme silk charmeuse, finished with a hand-rolled hem and adjustable spaghetti straps.",
    isFeatured: true,
    isTrending: true,
    tagSlugs: ["summer-2026", "editor-picks"],
    metadata: { material: "100% Silk Charmeuse, 19mm", care: "Dry clean only", origin: "France" },
  },
  {
    slug: "pleated-silk-midi-skirt",
    name: "Pleated Silk Midi Skirt",
    categorySlug: "dresses",
    basePriceCents: 48000,
    shortDescription: "Micro-pleated silk georgette falls to the midi with beautiful movement.",
    description: "Hundreds of micro-pleats permanently set into silk georgette give this skirt extraordinary movement. The high waistband is clean-cut, the hem falls just below the knee.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["summer-2026", "under-500"],
    metadata: { material: "100% Silk Georgette", care: "Dry clean only", origin: "France" },
  },
  {
    slug: "linen-column-dress",
    name: "Linen Column Dress",
    categorySlug: "dresses",
    basePriceCents: 62000,
    shortDescription: "A sleeveless column dress in Belgian linen — effortless from morning to evening.",
    description: "The column silhouette is flattering on every body because it suggests rather than reveals. This linen version is cut slightly wider than body-conscious, with a concealed zip and invisible pockets.",
    isFeatured: true,
    isTrending: true,
    tagSlugs: ["summer-2026", "sustainable"],
    metadata: { material: "100% Belgian Linen", care: "Machine wash cold, hang to dry", origin: "Belgium" },
  },
  {
    slug: "velvet-slip-midi-dress",
    name: "Velvet Slip Midi Dress",
    categorySlug: "dresses",
    basePriceCents: 85000,
    shortDescription: "Silk-blend velvet falls to the midi in a minimal slip silhouette.",
    description: "Silk-blend velvet has a warmth and luminosity that cotton velvet cannot match. This dress is cut on the straight grain with a low back, adjustable straps, and a hem that falls mid-calf.",
    isFeatured: true,
    isTrending: false,
    tagSlugs: ["new-arrivals", "editor-picks"],
    metadata: { material: "70% Silk, 30% Viscose velvet", care: "Dry clean only", origin: "Italy" },
  },
  {
    slug: "smocked-cotton-maxi",
    name: "Smocked Cotton Maxi",
    categorySlug: "dresses",
    basePriceCents: 54000,
    shortDescription: "Elastic-smocked bodice, wide skirt, and a hem that skims the ground.",
    description: "Smocked construction gives this dress a built-in fit — no sizing compromise, no adjustment required. The skirt is full enough to move in, the fabric is GOTS-certified organic cotton.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["summer-2026", "under-500", "sustainable"],
    metadata: { material: "100% GOTS Organic Cotton", care: "Machine wash cold, hang to dry", origin: "Portugal" },
  },
  {
    slug: "asymmetric-wrap-dress",
    name: "Asymmetric Wrap Dress",
    categorySlug: "dresses",
    basePriceCents: 78000,
    shortDescription: "A silk wrap with an asymmetric hem and a draped front — understated drama.",
    description: "Wrap construction means this dress fits without trying. The hem is cut at an angle — longer at the back, shorter at the front — creating movement with every step. Secured with an interior tie.",
    isFeatured: false,
    isTrending: true,
    tagSlugs: ["editor-picks"],
    metadata: { material: "100% Silk Crepe de Chine", care: "Dry clean only", origin: "France" },
  },
  {
    slug: "knit-bodycon-midi",
    name: "Ribbed Knit Bodycon Midi",
    categorySlug: "dresses",
    basePriceCents: 55000,
    shortDescription: "A fine-rib knit midi that fits close to the body without restriction.",
    description: "The ribbed construction gives this dress just enough stretch to move with you while maintaining its shape. The hem falls mid-calf; the neckline is a simple round cut with no hardware.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["new-arrivals", "under-500"],
    metadata: { material: "55% Viscose, 40% Polyamide, 5% Elastane rib", care: "Hand wash cold", origin: "Italy" },
  },
  {
    slug: "organza-layered-dress",
    name: "Organza Layered Dress",
    categorySlug: "dresses",
    basePriceCents: 112000,
    shortDescription: "Layers of silk organza over a silk slip — sheer at the edges, substantial at the core.",
    description: "Three layers of silk organza over a fitted silk slip create a dress that reads simply but rewards attention. The hem is raw-edge; the silhouette is A-line. This is the piece you remember.",
    isFeatured: true,
    isTrending: false,
    tagSlugs: ["editor-picks", "gift-guide"],
    metadata: { material: "Outer: 100% Silk Organza; Lining: 100% Silk Charmeuse", care: "Dry clean only", origin: "France" },
  },
  {
    slug: "jersey-polo-dress",
    name: "Jersey Polo Dress",
    categorySlug: "dresses",
    basePriceCents: 38000,
    shortDescription: "A shirt-collar polo dress in heavy jersey — casual but deliberately cut.",
    description: "This is the dress for days when you want to look considered without trying. Heavy jersey, a two-button polo collar, and a straight hem that sits mid-thigh with a slightly relaxed fit.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["summer-2026", "under-500"],
    metadata: { material: "100% Organic Pima Cotton Jersey", care: "Machine wash cold", origin: "Portugal" },
  },
  {
    slug: "sweater-maxi-dress",
    name: "Sweater Maxi Dress",
    categorySlug: "dresses",
    basePriceCents: 72000,
    shortDescription: "A floor-length knit dress in extra-fine merino — warmth without compromise.",
    description: "Knitted in extra-fine merino to a heavy gauge, this maxi dress is warm enough for winter without the restriction of layering. The neckline is a wide crew; the hem just touches the floor.",
    isFeatured: true,
    isTrending: false,
    tagSlugs: ["gift-guide"],
    metadata: { material: "100% Extra-Fine Merino", care: "Hand wash cold, dry flat", origin: "Italy" },
  },

  // ── TROUSERS ─────────────────────────────────────────────────────────────
  {
    slug: "wide-leg-tailored-trouser",
    name: "Wide-Leg Tailored Trouser",
    categorySlug: "trousers",
    basePriceCents: 52000,
    shortDescription: "A relaxed wide leg balanced by a precise waistband and clean front pleat.",
    description: "Cut in a crisp Italian wool blend, these trousers balance a roomy wide leg with a precisely tailored waistband and single front pleat. The silhouette is effortlessly elongating.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["new-arrivals"],
    metadata: { material: "80% Wool, 20% Viscose", care: "Dry clean recommended", origin: "Italy" },
  },
  {
    slug: "relaxed-linen-trousers",
    name: "Relaxed Linen Trousers",
    categorySlug: "trousers",
    basePriceCents: 36000,
    shortDescription: "Stone-washed linen trousers with a drawstring waist and tapered hem.",
    description: "Stone-washed until perfectly soft, these linen trousers have a slightly tapered leg and an elastic-and-drawstring waist that sits comfortably all day. The fabric is OEKO-TEX certified.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["summer-2026", "sustainable", "under-500"],
    metadata: { material: "100% OEKO-TEX Linen", care: "Machine wash cold, line dry", origin: "Lithuania" },
  },
  {
    slug: "high-waist-pleated-trouser",
    name: "High-Waist Pleated Trouser",
    categorySlug: "trousers",
    basePriceCents: 58000,
    shortDescription: "A high-waisted trouser with two front pleats and a long, straight leg.",
    description: "The pleat is structural, not decorative. It creates room across the hip and falls into a clean straight leg that works with any shoe height. Made from an Italian wool-blend in a medium weight.",
    isFeatured: false,
    isTrending: true,
    tagSlugs: ["new-arrivals", "under-500"],
    metadata: { material: "75% Wool, 25% Polyester", care: "Dry clean only", origin: "Italy" },
  },
  {
    slug: "leather-straight-pant",
    name: "Leather Straight-Leg Pant",
    categorySlug: "trousers",
    basePriceCents: 145000,
    shortDescription: "Nappa leather in a clean straight cut — the most versatile leather trouser.",
    description: "Full-grain nappa leather with a cigarette-straight leg and a high waist. No visible seams down the front, concealed zip closure, and an interior waistband that keeps shirts in place.",
    isFeatured: true,
    isTrending: false,
    tagSlugs: ["editor-picks", "gift-guide"],
    metadata: { material: "100% Full-grain nappa leather", care: "Professional leather care only", origin: "Italy" },
  },
  {
    slug: "silk-palazzo-trousers",
    name: "Silk Palazzo Trousers",
    categorySlug: "trousers",
    basePriceCents: 88000,
    shortDescription: "Wide-leg palazzo trousers in heavy silk crêpe — effortlessly formal.",
    description: "The width of the leg in heavy silk creates a drape that simulates a skirt when standing still. An elasticated waistband makes sizing irrelevant. These are the trousers that stop a room.",
    isFeatured: true,
    isTrending: true,
    tagSlugs: ["editor-picks", "summer-2026"],
    metadata: { material: "100% Heavy Silk Crêpe", care: "Dry clean only", origin: "France" },
  },
  {
    slug: "utility-cargo-trouser",
    name: "Utility Cargo Trouser",
    categorySlug: "trousers",
    basePriceCents: 62000,
    shortDescription: "Ripstop cotton with four pockets and a cropped, tapered leg.",
    description: "The cargo trouser, stripped of everything excessive. Four pockets — two at hip, two at thigh — all with magnetic closures. Cropped to the ankle with a taper that keeps it from reading military.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["under-500"],
    metadata: { material: "100% Ripstop Cotton", care: "Machine wash cold", origin: "Japan" },
  },
  {
    slug: "cropped-cigarette-pant",
    name: "Cropped Cigarette Pant",
    categorySlug: "trousers",
    basePriceCents: 52000,
    shortDescription: "A slim cigarette cut cropped at the ankle — the most reliable trouser in the wardrobe.",
    description: "The cigarette pant predates every contemporary trouser trend and will outlast them all. This one is cut in a crease-resistant Italian wool and cropped two inches above the ankle for a clean finish.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["under-500"],
    metadata: { material: "70% Wool, 30% Polyester (crease-resistant)", care: "Dry clean recommended", origin: "Italy" },
  },
  {
    slug: "velvet-flared-trouser",
    name: "Velvet Flared Trouser",
    categorySlug: "trousers",
    basePriceCents: 65000,
    shortDescription: "A high-waist flare in stretch velvet that works from dinner to dancing.",
    description: "The flare begins at the knee and opens to a generous sweep at the hem. Stretch velvet ensures comfort across the hip and thigh without the stiffness of woven velvet. Fully lined.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["new-arrivals", "under-500"],
    metadata: { material: "85% Viscose, 15% Elastane stretch velvet", care: "Dry clean only", origin: "Italy" },
  },
  {
    slug: "pintuck-wide-leg-jean",
    name: "Pintuck Wide-Leg Jean",
    categorySlug: "trousers",
    basePriceCents: 42000,
    shortDescription: "A wide-leg denim with two front pintucks — elevated without trying.",
    description: "The pintuck creates the illusion of a pleat without the volume. Cut from a medium-weight Japanese selvedge denim in a wide leg silhouette that sits at the natural waist.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["under-500"],
    metadata: { material: "100% Japanese Selvedge Denim", care: "Machine wash cold, line dry", origin: "Japan" },
  },

  // ── TOPS ──────────────────────────────────────────────────────────────────
  {
    slug: "open-back-linen-blouse",
    name: "Open-Back Linen Blouse",
    categorySlug: "tops",
    basePriceCents: 32000,
    shortDescription: "Washed Belgian linen with a draped open back and relaxed front tuck.",
    description: "Washed until perfectly soft, this Belgian linen blouse features a low open back and a relaxed front that tucks naturally at the waist. The fabric improves with every wash.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["summer-2026", "under-500", "sustainable"],
    metadata: { material: "100% Belgian Linen", care: "Machine wash cold, lay flat to dry", origin: "Belgium" },
  },
  {
    slug: "ribbed-tank-set",
    name: "Ribbed Tank Set",
    categorySlug: "tops",
    basePriceCents: 28000,
    shortDescription: "A pair of fine-rib tanks in organic Egyptian cotton. Wear together or alone.",
    description: "Two fine-rib tanks cut from GOTS-certified organic Egyptian cotton. The fabric has a natural sheen and a weight that sits between a T-shirt and a singlet.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["summer-2026", "under-500", "sustainable"],
    metadata: { material: "100% GOTS-certified Organic Egyptian Cotton", care: "Machine wash cold", origin: "Portugal" },
  },
  {
    slug: "silk-cowl-neck-top",
    name: "Silk Cowl-Neck Top",
    categorySlug: "tops",
    basePriceCents: 54000,
    shortDescription: "A bias-cut cowl-neck in heavy silk — the simplest elegant top possible.",
    description: "The cowl neck in heavy silk crêpe falls into a perfect drape that requires no adjustment. Cut on the bias, it skims the body without clinging. There is no simpler way to look this elegant.",
    isFeatured: true,
    isTrending: true,
    tagSlugs: ["summer-2026", "under-500", "editor-picks"],
    metadata: { material: "100% Heavy Silk Crêpe de Chine", care: "Dry clean only", origin: "France" },
  },
  {
    slug: "fitted-polo-shirt",
    name: "Fitted Polo Shirt",
    categorySlug: "tops",
    basePriceCents: 38000,
    shortDescription: "A slim-fit polo in fine piqué — smarter than a T-shirt, more relaxed than a shirt.",
    description: "Cut from extra-fine piqué cotton with a three-button placket and a slightly longer back hem that stays tucked. The collar has a hidden stay stitch that keeps it lying flat all day.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["summer-2026", "under-500"],
    metadata: { material: "100% Extra-Fine Piqué Cotton", care: "Machine wash cold", origin: "Portugal" },
  },
  {
    slug: "sheer-organza-blouse",
    name: "Sheer Organza Blouse",
    categorySlug: "tops",
    basePriceCents: 62000,
    shortDescription: "A silk organza blouse with voluminous sleeves and a fitted button cuff.",
    description: "Sheer enough to require layering, beautiful enough to not care. The sleeves balloon from the shoulder and gather into a fitted cuff with four pearl buttons. The back has a half placket.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["editor-picks"],
    metadata: { material: "100% Silk Organza", care: "Dry clean only", origin: "France" },
  },
  {
    slug: "cropped-leather-top",
    name: "Cropped Leather Top",
    categorySlug: "tops",
    basePriceCents: 95000,
    shortDescription: "A fitted cropped top in nappa leather — a statement that needs nothing else.",
    description: "The fit is precise. The leather is soft enough to wear against skin. The cropped length sits just above the natural waist and works with high-waist everything. There are no seams at the front.",
    isFeatured: true,
    isTrending: true,
    tagSlugs: ["editor-picks", "new-arrivals"],
    metadata: { material: "100% Nappa lamb leather", care: "Professional leather care only", origin: "Italy" },
  },
  {
    slug: "classic-tailored-shirt",
    name: "Classic Tailored Shirt",
    categorySlug: "tops",
    basePriceCents: 44000,
    shortDescription: "A 120-count cotton poplin shirt with a slim, tucked silhouette.",
    description: "Made from 120-count Egyptian cotton poplin that holds a press and stays crisp all day. The fit is slightly slim through the body without being tight. French seams, mother-of-pearl buttons throughout.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["under-500"],
    metadata: { material: "100% 120-count Egyptian Cotton Poplin", care: "Machine wash cold, iron while damp", origin: "Italy" },
  },
  {
    slug: "broderie-anglaise-blouse",
    name: "Broderie Anglaise Blouse",
    categorySlug: "tops",
    basePriceCents: 48000,
    shortDescription: "A cotton eyelet blouse with a peasant neckline and gathered sleeves.",
    description: "Traditional broderie anglaise in a warm cotton — the kind of fabric that looks handmade because it effectively is. The elasticated neckline sits off the shoulder or up, depending on the day.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["summer-2026", "under-500"],
    metadata: { material: "100% Broderie Anglaise Cotton", care: "Machine wash cold, line dry", origin: "Portugal" },
  },
  {
    slug: "satin-camisole",
    name: "Satin Camisole",
    categorySlug: "tops",
    basePriceCents: 28000,
    shortDescription: "A liquid-finish satin camisole with fine adjustable straps.",
    description: "The camisole you wear alone or under a blazer for a decade. Heavy satin in a fluid cut, adjustable straps with gold hardware, and a lace trim at the hem that is visible only at a second glance.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["summer-2026", "under-500"],
    metadata: { material: "100% Acetate Satin", care: "Hand wash cold only", origin: "China" },
  },
  {
    slug: "corseted-top",
    name: "Corseted Top",
    categorySlug: "tops",
    basePriceCents: 72000,
    shortDescription: "A boned corset top in heavy duchess satin — structured, deliberate, unforgettable.",
    description: "Six bones and a back lacing create a fit that is specific to your body. Made in duchess satin with a sweetheart neckline and a hem that sits just above the natural waist. Fully lined in silk.",
    isFeatured: true,
    isTrending: false,
    tagSlugs: ["editor-picks", "new-arrivals"],
    metadata: { material: "Shell: 100% Duchess Satin; Lining: 100% Silk", care: "Dry clean only", origin: "Italy" },
  },

  // ── ACCESSORIES ───────────────────────────────────────────────────────────
  {
    slug: "minimal-leather-tote",
    name: "Minimal Leather Tote",
    categorySlug: "accessories",
    basePriceCents: 85000,
    shortDescription: "Full-grain vegetable-tanned leather with a single internal compartment.",
    description: "Made from full-grain vegetable-tanned leather that develops a rich patina with use. A single interior compartment, one flat pocket, and a magnetic closure — nothing more.",
    isFeatured: true,
    isTrending: false,
    tagSlugs: ["gift-guide", "editor-picks"],
    sizes: ["ONE SIZE"],
    metadata: { material: "Full-grain vegetable-tanned leather", care: "Condition with leather cream as needed", origin: "Canada" },
  },
  {
    slug: "fine-knit-cashmere-beret",
    name: "Fine-Knit Cashmere Beret",
    categorySlug: "accessories",
    basePriceCents: 18000,
    shortDescription: "A classic beret in 4-ply cashmere with a slouchy, relaxed crown.",
    description: "Knitted from 4-ply cashmere in a traditional beret shape with a relaxed, slightly slouchy crown. One size with a knitted band that adjusts to fit.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["gift-guide", "under-500"],
    sizes: ["ONE SIZE"],
    metadata: { material: "100% Cashmere, 4-ply", care: "Hand wash cold or dry clean", origin: "Scotland" },
  },
  {
    slug: "silk-twill-scarf",
    name: "Silk Twill Scarf",
    categorySlug: "accessories",
    basePriceCents: 28000,
    shortDescription: "A 90cm square scarf in heavyweight silk twill — the most versatile piece you own.",
    description: "90 × 90cm of heavyweight silk twill with hand-rolled edges. The print is designed in-house and exclusive to this season. Wear as a headscarf, a necktie, a top, or a bag wrap.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["summer-2026", "under-500", "gift-guide"],
    sizes: ["ONE SIZE"],
    metadata: { material: "100% Heavyweight Silk Twill", care: "Dry clean only", origin: "France" },
  },
  {
    slug: "leather-statement-belt",
    name: "Leather Statement Belt",
    categorySlug: "accessories",
    basePriceCents: 35000,
    shortDescription: "A wide vegetable-tanned belt with a polished gold buckle.",
    description: "Four centimetres wide and made from the same vegetable-tanned leather as our tote. The buckle is solid brass, polished to a warm gold. Available in two widths on request.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["under-500", "gift-guide"],
    sizes: ["XS", "S", "M", "L", "XL"],
    metadata: { material: "Full-grain vegetable-tanned leather; Solid brass buckle", care: "Condition with leather balm", origin: "Canada" },
  },
  {
    slug: "cashmere-lined-gloves",
    name: "Cashmere-Lined Gloves",
    categorySlug: "accessories",
    basePriceCents: 24000,
    shortDescription: "Nappa leather gloves lined in Grade-A cashmere — warmth without compromise.",
    description: "The leather exterior is soft enough to read through without removing them. The cashmere lining is Grade-A, single-ply, and sits against the hand like a second skin.",
    isFeatured: false,
    isTrending: false,
    tagSlugs: ["under-500", "gift-guide"],
    sizes: ["S", "M", "L"],
    metadata: { material: "Exterior: Nappa leather; Lining: Grade-A Cashmere", care: "Professional leather care only", origin: "Italy" },
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

  // ── Products ──────────────────────────────────────────────────────────────
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
      .onConflictDoUpdate({
        target: products.slug,
        set: {
          name: p.name,
          basePriceCents: p.basePriceCents,
          isFeatured: p.isFeatured,
          isTrending: p.isTrending,
          metadata: p.metadata,
        },
      })
      .returning();

    productSlugToId.set(p.slug, inserted.id);

    // Delete existing images and variants to ensure clean re-seed
    await db.delete(productImages).where(eq(productImages.productId, inserted.id));
    await db.delete(productVariants).where(eq(productVariants.productId, inserted.id));
    await db.delete(productTags).where(eq(productTags.productId, inserted.id));

    // Images — always set first image as primary
    await db.insert(productImages).values([
      { productId: inserted.id, url: img(`${p.slug}-1`), alt: p.name, position: 0, isPrimary: true },
      { productId: inserted.id, url: img(`${p.slug}-2`), alt: `${p.name} — alternate view`, position: 1, isPrimary: false },
    ]);

    // Variants
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

    // Tags
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
      body: `<p>The first piece we made was a coat. Not because a coat is the most commercially viable starting point — it is arguably the opposite — but because a coat is the piece that tells you the most about a brand. It requires the most fabric, the most construction, the most fit. You cannot hide behind a coat.</p><p>We made twelve of them in the first run. Six sold in the first week. The other six we wore ourselves through the winter of 2025, noticing what worked and what needed to change.</p><h2>The decisions</h2><p>Every brand starts with a set of decisions that are made before anyone is paying attention. We made ours in a rented studio in the west end of Toronto, with reference books spread across the floor and fabric samples pinned to the walls.</p><p>The first decision was that we would not compromise on fabric. This sounds obvious; it is not. Fabric is the most expensive line item in clothing production, and the pressure to reduce it is constant. We decided early that we would price our pieces to cover the fabric we wanted to use, not the other way around.</p><h2>The pieces we almost didn't make</h2><p>The Silk Bias-Cut Slip Dress almost didn't happen. The bias cut is difficult to execute at scale — the fabric stretches differently on different bodies, and the fit can go wrong in ways that are hard to predict. We made it anyway, and it is now the piece we are most asked about.</p>`,
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
      slug: "spring-2026-the-light-collection",
      title: "Spring 2026: The Light Collection",
      coverImageUrl: img("lookbook-spring-2026", 1440, 900),
      body: "<p>Everything for the season when you want to wear less and look like you thought harder about it. Silk, linen, fine cotton. Nothing heavy; nothing throwaway.</p>",
      linkedProductSlugs: [
        "silk-bias-cut-slip-dress",
        "linen-column-dress",
        "open-back-linen-blouse",
        "relaxed-linen-trousers",
        "silk-cowl-neck-top",
        "pleated-silk-midi-skirt",
      ],
      position: 1,
    },
    {
      slug: "the-coat-edit",
      title: "The Coat Edit",
      coverImageUrl: img("lookbook-coat-edit", 1440, 900),
      body: "<p>Six coats. One for every kind of cold — the practical, the formal, the beautiful-but-not-warm-enough-for-a-Canadian-winter. Worn here as the only thing you need.</p>",
      linkedProductSlugs: [
        "langford-oversized-coat",
        "birchwood-trench-coat",
        "windsor-camel-coat",
        "estate-herringbone-coat",
        "holt-cashmere-topcoat",
        "slate-boucle-blazer",
      ],
      position: 2,
    },
    {
      slug: "evening-uniform",
      title: "Evening Uniform",
      coverImageUrl: img("lookbook-evening-uniform", 1440, 900),
      body: "<p>The pieces that work when the light is low and the occasion is ambiguous. Not formalwear, not casual — something in between that reads as deliberate.</p>",
      linkedProductSlugs: [
        "velvet-slip-midi-dress",
        "organza-layered-dress",
        "corseted-top",
        "silk-palazzo-trousers",
        "nightfall-velvet-jacket",
        "cropped-leather-top",
      ],
      position: 3,
    },
    {
      slug: "weekend-away",
      title: "Weekend Away",
      coverImageUrl: img("lookbook-weekend-away", 1440, 900),
      body: "<p>The three-bag edit. What to bring when you want to look considered but have packed light: knitwear that travels, trousers that don't wrinkle, a coat that works for dinner.</p>",
      linkedProductSlugs: [
        "cashmere-rib-turtleneck",
        "cashmere-half-zip",
        "wide-leg-tailored-trouser",
        "langford-oversized-coat",
        "minimal-leather-tote",
        "classic-tailored-shirt",
      ],
      position: 4,
    },
    {
      slug: "office-hours",
      title: "Office Hours",
      coverImageUrl: img("lookbook-office-hours", 1440, 900),
      body: "<p>Dressing for work without dressing for an office from 1995. The pieces that read professional without the uniform: a good blazer, a silk top, trousers that mean business but aren't boring.</p>",
      linkedProductSlugs: [
        "structured-blazer",
        "pinstripe-tailored-blazer",
        "high-waist-pleated-trouser",
        "cropped-cigarette-pant",
        "silk-cowl-neck-top",
        "sheer-organza-blouse",
      ],
      position: 5,
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
