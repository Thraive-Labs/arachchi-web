"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { wishlists } from "@/lib/db/schema";
import { getUser } from "@/lib/auth/server";

export interface WishlistStatus {
  wishlisted: boolean;
  requiresAuth: boolean;
}

export async function getWishlistStatusAction(variantId: string): Promise<WishlistStatus> {
  const user = await getUser();
  if (!user) return { wishlisted: false, requiresAuth: true };

  const [existing] = await db
    .select({ id: wishlists.id })
    .from(wishlists)
    .where(and(eq(wishlists.userId, user.id), eq(wishlists.variantId, variantId)))
    .limit(1);

  return { wishlisted: !!existing, requiresAuth: false };
}

export async function toggleWishlistAction(variantId: string): Promise<WishlistStatus> {
  const user = await getUser();
  if (!user) return { wishlisted: false, requiresAuth: true };

  const [existing] = await db
    .select({ id: wishlists.id })
    .from(wishlists)
    .where(and(eq(wishlists.userId, user.id), eq(wishlists.variantId, variantId)))
    .limit(1);

  if (existing) {
    await db.delete(wishlists).where(eq(wishlists.id, existing.id));
    return { wishlisted: false, requiresAuth: false };
  }

  await db.insert(wishlists).values({ userId: user.id, variantId });
  return { wishlisted: true, requiresAuth: false };
}

export async function removeFromWishlistAction(wishlistId: string): Promise<void> {
  const user = await getUser();
  if (!user) return;
  await db
    .delete(wishlists)
    .where(and(eq(wishlists.id, wishlistId), eq(wishlists.userId, user.id)));
}
