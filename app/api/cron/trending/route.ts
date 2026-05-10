import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { products, productViews } from "@/lib/db/schema";
import { eq, sql, gte, and } from "drizzle-orm";

// Vercel cron — runs daily via vercel.json schedule
// Marks top-10 most-viewed products (last 7 days) as isTrending, clears others.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const topViewed = await db
    .select({
      productId: productViews.productId,
      viewCount: sql<number>`COUNT(*)::int`,
    })
    .from(productViews)
    .where(gte(productViews.viewedAt, sevenDaysAgo))
    .groupBy(productViews.productId)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(10);

  const trendingIds = topViewed.map((r) => r.productId);

  await db
    .update(products)
    .set({ isTrending: false })
    .where(and(eq(products.isTrending, true)));

  if (trendingIds.length > 0) {
    for (const productId of trendingIds) {
      await db
        .update(products)
        .set({ isTrending: true })
        .where(eq(products.id, productId));
    }
  }

  return NextResponse.json({ updated: trendingIds.length, trendingIds });
}
