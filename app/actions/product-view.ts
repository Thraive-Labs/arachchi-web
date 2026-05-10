"use server";

import { db } from "@/lib/db/client";
import { productViews, recentlyViewed } from "@/lib/db/schema";
import { getUser } from "@/lib/auth/server";
import { cookies } from "next/headers";
import { sql } from "drizzle-orm";

export async function trackProductView(productId: string) {
  const user = await getUser();
  const cookieStore = await cookies();

  // Use a stable session identifier from the Supabase auth cookie, or a guest token
  const rawToken =
    cookieStore.get("sb-access-token")?.value ??
    cookieStore.get("sb-refresh-token")?.value;
  const sessionId = user ? null : (rawToken?.slice(0, 16) ?? "anonymous");

  await db.insert(productViews).values({
    productId,
    userId: user?.id ?? null,
    sessionId,
  });

  if (user) {
    await db
      .insert(recentlyViewed)
      .values({ userId: user.id, productId, lastViewedAt: new Date() })
      .onConflictDoUpdate({
        target: [recentlyViewed.userId, recentlyViewed.productId],
        set: { lastViewedAt: new Date() },
      });

    // Keep only the last 20 per user
    await db.execute(sql`
      DELETE FROM recently_viewed
      WHERE user_id = ${user.id}
        AND product_id NOT IN (
          SELECT product_id FROM recently_viewed
          WHERE user_id = ${user.id}
          ORDER BY last_viewed_at DESC
          LIMIT 20
        )
    `);
  }
}
