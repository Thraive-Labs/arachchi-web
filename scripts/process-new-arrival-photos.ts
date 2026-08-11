// One-time processing: compress the client's real product photography (from
// "Zip file to send to sl/") into public/images/products/<slug>/N.jpg, replacing
// the placeholder images. Matches source files by regex against the actual
// directory listing (source filenames have inconsistent spacing/casing).
import { readdirSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import sharp from "sharp";

const SRC_DIR = join(process.cwd(), "Zip file to send to sl", "Zip file to send to sl");
const OUT_ROOT = join(process.cwd(), "public", "images", "products");

const files = readdirSync(SRC_DIR);

function findFile(pattern: RegExp): string {
  const match = files.find((f) => pattern.test(f));
  if (!match) throw new Error(`No source file matched ${pattern}`);
  return match;
}

type ImageSpec = { match: RegExp; alt: string; color?: string };

type ProductSpec = {
  slug: string;
  images: ImageSpec[];
};

const products: ProductSpec[] = [
  {
    slug: "ceylon-puff-sleeve-dress",
    images: [
      { match: /^#1 women dress\s+-\s*white\.png$/i, alt: "Ceylon Puff-Sleeve Dress, white", color: "White" },
      { match: /^#1 with lady 2\.png$/i, alt: "Ceylon Puff-Sleeve Dress, worn" },
      { match: /^#1 women dress\s+-\s*green\.png$/i, alt: "Ceylon Puff-Sleeve Dress, green", color: "Green" },
      { match: /^#1 with lady 1\.jpeg$/i, alt: "Ceylon Puff-Sleeve Dress, worn, editorial" },
      { match: /^#1 with lady 1 \+ g wagon\.png$/i, alt: "Ceylon Puff-Sleeve Dress, worn, editorial black and white" },
    ],
  },
  {
    slug: "signature-structural-sweater",
    images: [
      { match: /^#2 Signature sweater- black -\.png$/i, alt: "Signature Structural Sweater, black", color: "Black" },
      { match: /^#2 - Signature sweater- MAN 1 - black\.png$/i, alt: "Signature Structural Sweater, black, worn" },
      { match: /^#2 - Signature sweater- cream-\.png$/i, alt: "Signature Structural Sweater, cream", color: "Cream" },
      { match: /^#2 - Signature sweater-olive green -\.png$/i, alt: "Signature Structural Sweater, olive green", color: "Olive Green" },
      { match: /^#2 - Signature sweater- MAN 1 - Green\.png$/i, alt: "Signature Structural Sweater, olive green, worn" },
      { match: /^#2- Signature sweater-burgendy-\.png$/i, alt: "Signature Structural Sweater, burgundy", color: "Burgundy" },
      { match: /^#2- signature sweater chocalate \+ black chain\.png$/i, alt: "Signature Structural Sweater, chocolate", color: "Chocolate" },
      { match: /^#2 - Signature sweater- MAN 1 -blue\.png$/i, alt: "Signature Structural Sweater, navy, worn", color: "Navy" },
      { match: /^#2 - signature sweater - red car\.png$/i, alt: "Signature Structural Sweater, editorial" },
      { match: /^#2 - signature sweater - red car \+ cn tower\.png$/i, alt: "Signature Structural Sweater, editorial, Toronto" },
      { match: /^#2- original- signature sweater\.jpeg$/i, alt: "Signature Structural Sweater, fabric detail" },
    ],
  },
  {
    slug: "tiered-linen-midi-dress",
    images: [
      { match: /^#3 dress\s+-\s*white\.png$/i, alt: "Tiered Linen Midi Dress, white", color: "White" },
      { match: /^#3 with lady 1\.png$/i, alt: "Tiered Linen Midi Dress, olive, worn" },
      { match: /^#3 dress-\s*cream\.png$/i, alt: "Tiered Linen Midi Dress, cream", color: "Cream" },
      { match: /^#3 grey dress\.png$/i, alt: "Tiered Linen Midi Dress, grey", color: "Grey" },
      { match: /^#3 olive green dress\.png$/i, alt: "Tiered Linen Midi Dress, olive green", color: "Olive Green" },
      { match: /^#3- bugendy dress\.png$/i, alt: "Tiered Linen Midi Dress, burgundy", color: "Burgundy" },
    ],
  },
  {
    slug: "signature-lounge-set",
    images: [
      { match: /^#4 sweater - top only\.png$/i, alt: "Signature Lounge Set, jacket, cream", color: "Cream" },
      { match: /^#4 sweater and sweat pants- original\.png$/i, alt: "Signature Lounge Set, worn" },
      { match: /^#4 - sweat pants -\.png$/i, alt: "Signature Lounge Set, trouser detail" },
      { match: /^#4 sweater and sweat pants - not tucked in\.png$/i, alt: "Signature Lounge Set, styled loose" },
      { match: /^#4 sweater and sweat pants- tucked in\.png$/i, alt: "Signature Lounge Set, styled tucked in" },
    ],
  },
  {
    slug: "beach-club-crochet-dress",
    images: [
      { match: /^#5 - beach club women-White\.png$/i, alt: "Beach Club Crochet Dress, white", color: "White" },
      { match: /^#5 - beach club women- WOMEN 3- White\.png$/i, alt: "Beach Club Crochet Dress, white, worn" },
      { match: /^#5 - beach club women- baige\.jpg$/i, alt: "Beach Club Crochet Dress, beige", color: "Beige" },
      { match: /^#5 - beach club women- brown\.png$/i, alt: "Beach Club Crochet Dress, brown", color: "Brown" },
      { match: /^#5 - beach club women-dark blue\.png$/i, alt: "Beach Club Crochet Dress, dark blue", color: "Dark Blue" },
      { match: /^#5 - beach club women-light blue\.png$/i, alt: "Beach Club Crochet Dress, light blue", color: "Light Blue" },
      { match: /^#5 - beach club women-WOMEN 1 - baige\.png$/i, alt: "Beach Club Crochet Dress, beige, worn" },
      { match: /^#5 - beach club women-WOMEN 2- White\.png$/i, alt: "Beach Club Crochet Dress, white, worn, street" },
    ],
  },
  {
    slug: "weekend-oversized-set",
    images: [
      { match: /^#6- oversize men wear-grey\.jpg$/i, alt: "Weekend Oversized Set, grey, flat lay", color: "Grey" },
      { match: /^#6- oversize men wear-grey- MAN 1 \(baggy pants with white shoes\)\.png$/i, alt: "Weekend Oversized Set, grey, worn" },
      { match: /^#6- oversize men wear- Baige\.png$/i, alt: "Weekend Oversized Set, beige", color: "Beige" },
      { match: /^#6- oversize men wear- green\.png$/i, alt: "Weekend Oversized Set, green", color: "Green" },
      { match: /^#6- oversize men wear- maroon\.png$/i, alt: "Weekend Oversized Set, maroon", color: "Maroon" },
      { match: /^#6- oversize men wear-grey- MAN 1 \(short pants with grey shoes\)\.png$/i, alt: "Weekend Oversized Set, grey, worn, alternate styling" },
    ],
  },
  {
    slug: "signature-polo-shirt",
    images: [
      { match: /^#7 - polo shirt - White\.png$/i, alt: "Signature Polo Shirt, white", color: "White" },
      { match: /^#7 - polo shirt - MAN 1 WHITE\.png$/i, alt: "Signature Polo Shirt, white, worn" },
      { match: /^#7 - polo shirt - MAN 1 BLACK\.png$/i, alt: "Signature Polo Shirt, black, worn", color: "Black" },
    ],
  },
  {
    slug: "signature-hoodie",
    images: [
      { match: /^#8 Hoodie- no arachchi logo\.png$/i, alt: "Signature Hoodie, still life" },
      { match: /^#8 hoodie- with logo-black\.png$/i, alt: "Signature Hoodie, black, worn", color: "Black" },
      { match: /^#8 hoodie- with logo- green\.png$/i, alt: "Signature Hoodie, green, worn", color: "Green" },
      { match: /^#8 hoodie- with logo- maroon\.png$/i, alt: "Signature Hoodie, maroon, worn", color: "Maroon" },
      { match: /^#8 hoodie- with logo- white\.png$/i, alt: "Signature Hoodie, white, worn", color: "White" },
      { match: /^#8 Hoodie-no arachchi logo - black\.png$/i, alt: "Signature Hoodie, black, worn, alternate" },
    ],
  },
  {
    slug: "woven-pocket-tee",
    images: [
      { match: /^#9- T shirt -weaven- pocket- white\.png$/i, alt: "Woven Pocket Tee, white", color: "White" },
      { match: /^#9- T shirt -weaven- pocket-green\.png$/i, alt: "Woven Pocket Tee, green", color: "Green" },
      { match: /^#9- T shirt weaven -pocket- black\.png$/i, alt: "Woven Pocket Tee, black", color: "Black" },
    ],
  },
  {
    slug: "classic-pocket-tee",
    images: [
      { match: /^#9- T shirt- plain- pocket- white \.png$/i, alt: "Classic Pocket Tee, white", color: "White" },
      { match: /^#9- T shirt- plain- pocket- green\.png$/i, alt: "Classic Pocket Tee, green", color: "Green" },
      { match: /^#9- T shirt- plain- pocket-black\.png$/i, alt: "Classic Pocket Tee, black", color: "Black" },
      { match: /^#9- T shirt- plain- pocket-maroon\.png$/i, alt: "Classic Pocket Tee, maroon", color: "Maroon" },
    ],
  },
  {
    slug: "essential-crew-tee",
    images: [
      { match: /^#10- t shirt- no logo- white \.png$/i, alt: "Essential Crew Tee, white", color: "White" },
    ],
  },
  {
    slug: "ceylon-logo-tee",
    images: [
      { match: /^#11- T shirt- arachchi \+ceylon - white\.png$/i, alt: "Ceylon Logo Tee, white", color: "White" },
      { match: /^#11- T shirt- arachchi \+ceylon -MODEL male- black \.png$/i, alt: "Ceylon Logo Tee, black, worn" },
      { match: /^#11- T shirt- arachchi \+ceylon -black \.png$/i, alt: "Ceylon Logo Tee, black", color: "Black" },
      { match: /^#11- T shirt- arachchi \+ceylon -green\.png$/i, alt: "Ceylon Logo Tee, green", color: "Green" },
      { match: /^#12- t shirt- arachchi \+ ceylon- HIGHER LOGO POSITION- marrron\.png$/i, alt: "Ceylon Logo Tee, maroon", color: "Maroon" },
      { match: /^#11- T shirt- arachchi \+ceylon - green and white\.png$/i, alt: "Ceylon Logo Tee, editorial" },
    ],
  },
];

async function main() {
  for (const product of products) {
    const outDir = join(OUT_ROOT, product.slug);
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

    let i = 1;
    for (const img of product.images) {
      const srcFile = findFile(img.match);
      const srcPath = join(SRC_DIR, srcFile);
      const outFile = `${i}.jpg`;
      const outPath = join(outDir, outFile);

      await sharp(srcPath)
        .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
        .flatten({ background: "#ffffff" })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(outPath);

      console.log(`  ${product.slug}/${outFile}  <-  ${srcFile}${img.color ? `  [${img.color}]` : ""}`);
      i++;
    }
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
