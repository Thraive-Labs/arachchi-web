import type { Metadata } from "next";
import Link from "next/link";
import { eq, inArray } from "drizzle-orm";
import { getUser } from "@/lib/auth/server";
import { db } from "@/lib/db/client";
import { wishlists, productVariants, products, productImages } from "@/lib/db/schema";
import { WishlistItem } from "./WishlistItem";

export const metadata: Metadata = { title: "Wishlist" };

async function getWishlist(userId: string) {
  return db
    .select({
      wishlistId: wishlists.id,
      variantId: wishlists.variantId,
      size: productVariants.size,
      color: productVariants.color,
      productId: products.id,
      productName: products.name,
      productSlug: products.slug,
      priceCents: productVariants.priceCents,
      stockQuantity: productVariants.stockQuantity,
    })
    .from(wishlists)
    .innerJoin(productVariants, eq(wishlists.variantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(eq(wishlists.userId, userId))
    .orderBy(wishlists.createdAt);
}

async function getFirstImages(productIds: string[]) {
  if (!productIds.length) return new Map<string, string>();
  const rows = await db
    .select({ productId: productImages.productId, url: productImages.url })
    .from(productImages)
    .where(inArray(productImages.productId, productIds))
    .orderBy(productImages.position);
  const map = new Map<string, string>();
  for (const r of rows) {
    if (!map.has(r.productId)) map.set(r.productId, r.url);
  }
  return map;
}

export default async function WishlistPage() {
  const user = await getUser();
  if (!user) return null;

  const items = await getWishlist(user.id);
  const productIds = [...new Set(items.map((i) => i.productId))];
  const imageMap = await getFirstImages(productIds);

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl font-light tracking-wide">Wishlist</h1>

      {items.length === 0 ? (
        <div className="border border-border p-12 text-center">
          <p className="mb-4 text-sm text-muted-foreground">Your wishlist is empty.</p>
          <Link
            href="/shop"
            className="text-xs tracking-[0.15em] uppercase text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
          >
            Browse the collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6">
          {items.map((item) => (
            <WishlistItem
              key={item.wishlistId}
              wishlistId={item.wishlistId}
              productSlug={item.productSlug}
              productName={item.productName}
              size={item.size}
              color={item.color}
              priceCents={item.priceCents}
              stockQuantity={item.stockQuantity}
              imageUrl={imageMap.get(item.productId) ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
