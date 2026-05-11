import { count, sum, desc, eq, and, gte, lte, inArray, ilike, sql, avg } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  orders,
  orderItems,
  products,
  productVariants,
  productViews,
  users,
  categories,
  tags,
  productImages,
  productTags,
  newsletterSubscribers,
} from "@/lib/db/schema";

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const start30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const start60d = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const paidStatuses = ["paid", "fulfilled", "shipped", "delivered"] as const;

  const [
    [todayRow],
    [weekRow],
    [monthRow],
    [prevMonthRow],
    [allTimeRow],
    [allTimeOrdersRow],
    [monthOrdersRow],
    [avgOrderRow],
    [totalCustomersRow],
    [newCustomersRow],
    [activeProductsRow],
    [newsletterRow],
    statusCounts,
    recentOrders,
    lowStock,
    topViewed,
    topSelling,
    revenueByDay,
  ] = await Promise.all([
    // Revenue: today
    db.select({ total: sum(orders.totalCents) }).from(orders)
      .where(and(gte(orders.createdAt, startOfToday), inArray(orders.status, paidStatuses))),

    // Revenue: 7 days
    db.select({ total: sum(orders.totalCents) }).from(orders)
      .where(and(gte(orders.createdAt, start7d), inArray(orders.status, paidStatuses))),

    // Revenue: 30 days
    db.select({ total: sum(orders.totalCents) }).from(orders)
      .where(and(gte(orders.createdAt, start30d), inArray(orders.status, paidStatuses))),

    // Revenue: prior 30 days (31–60 days ago) for % change
    db.select({ total: sum(orders.totalCents) }).from(orders)
      .where(and(gte(orders.createdAt, start60d), lte(orders.createdAt, start30d), inArray(orders.status, paidStatuses))),

    // Revenue: all time
    db.select({ total: sum(orders.totalCents) }).from(orders)
      .where(inArray(orders.status, paidStatuses)),

    // Order count: all time
    db.select({ total: count() }).from(orders),

    // Order count: 30 days
    db.select({ total: count() }).from(orders)
      .where(gte(orders.createdAt, start30d)),

    // Avg order value: 30 days
    db.select({ avg: avg(orders.totalCents) }).from(orders)
      .where(and(gte(orders.createdAt, start30d), inArray(orders.status, paidStatuses))),

    // Total customers
    db.select({ total: count() }).from(users),

    // New customers: 30 days
    db.select({ total: count() }).from(users)
      .where(gte(users.createdAt, start30d)),

    // Active products
    db.select({ total: count() }).from(products)
      .where(eq(products.isActive, true)),

    // Newsletter subscribers
    db.select({ total: count() }).from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.isActive, true)),

    // Order status breakdown
    db.select({ status: orders.status, total: count() }).from(orders)
      .groupBy(orders.status),

    // Recent orders (last 8)
    db.select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      email: orders.email,
      status: orders.status,
      totalCents: orders.totalCents,
      createdAt: orders.createdAt,
    }).from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(8),

    // Low stock variants
    db.select({
      variantId: productVariants.id,
      sku: productVariants.sku,
      size: productVariants.size,
      color: productVariants.color,
      stockQuantity: productVariants.stockQuantity,
      productId: products.id,
      productName: products.name,
    }).from(productVariants)
      .innerJoin(products, eq(productVariants.productId, products.id))
      .where(and(lte(productVariants.stockQuantity, 3), eq(productVariants.isActive, true)))
      .orderBy(productVariants.stockQuantity)
      .limit(8),

    // Top viewed this week
    db.select({
      productId: productViews.productId,
      productName: products.name,
      viewCount: count(),
    }).from(productViews)
      .innerJoin(products, eq(productViews.productId, products.id))
      .where(gte(productViews.viewedAt, start7d))
      .groupBy(productViews.productId, products.name, products.slug)
      .orderBy(desc(count()))
      .limit(5),

    // Top selling by revenue (30 days, from order_items)
    db.select({
      productId: products.id,
      productName: products.name,
      revenueCents: sql<number>`SUM(${orderItems.unitPriceCents} * ${orderItems.quantity})::int`,
      unitsSold: sql<number>`SUM(${orderItems.quantity})::int`,
    }).from(orderItems)
      .innerJoin(orders, and(eq(orderItems.orderId, orders.id), inArray(orders.status, paidStatuses), gte(orders.createdAt, start30d)))
      .innerJoin(productVariants, eq(orderItems.variantId, productVariants.id))
      .innerJoin(products, eq(productVariants.productId, products.id))
      .groupBy(products.id, products.name)
      .orderBy(sql`SUM(${orderItems.unitPriceCents} * ${orderItems.quantity}) DESC`)
      .limit(5),

    // Daily revenue for last 30 days (for chart)
    db.execute(sql`
      SELECT
        DATE_TRUNC('day', ${orders.createdAt})::date AS day,
        COALESCE(SUM(${orders.totalCents}), 0)::int AS revenue_cents
      FROM ${orders}
      WHERE ${orders.createdAt} >= ${start30d}
        AND ${orders.status} = ANY(ARRAY['paid','fulfilled','shipped','delivered']::order_status[])
      GROUP BY 1
      ORDER BY 1
    `),
  ]);

  const monthRevenueCents = Number(monthRow?.total ?? 0);
  const prevMonthRevenueCents = Number(prevMonthRow?.total ?? 0);
  const revenueChangePercent =
    prevMonthRevenueCents > 0
      ? Math.round(((monthRevenueCents - prevMonthRevenueCents) / prevMonthRevenueCents) * 100)
      : null;

  return {
    todayRevenueCents: Number(todayRow?.total ?? 0),
    weekRevenueCents: Number(weekRow?.total ?? 0),
    monthRevenueCents,
    prevMonthRevenueCents,
    revenueChangePercent,
    allTimeRevenueCents: Number(allTimeRow?.total ?? 0),
    allTimeOrderCount: Number(allTimeOrdersRow?.total ?? 0),
    monthOrderCount: Number(monthOrdersRow?.total ?? 0),
    avgOrderValueCents: Math.round(Number(avgOrderRow?.avg ?? 0)),
    totalCustomers: Number(totalCustomersRow?.total ?? 0),
    newCustomers30d: Number(newCustomersRow?.total ?? 0),
    activeProducts: Number(activeProductsRow?.total ?? 0),
    newsletterSubscribers: Number(newsletterRow?.total ?? 0),
    statusCounts,
    recentOrders,
    lowStock,
    topViewed,
    topSelling,
    revenueByDay: (revenueByDay.rows as Array<{ day: string; revenue_cents: number }>),
  };
}

// ── Products ──────────────────────────────────────────────────────────────────

export async function getAdminProducts(opts: {
  search?: string;
  categorySlug?: string;
  page?: number;
  limit?: number;
}) {
  const { search, categorySlug, page = 1, limit = 30 } = opts;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (search) conditions.push(ilike(products.name, `%${search}%`));
  if (categorySlug) {
    const [cat] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, categorySlug))
      .limit(1);
    if (cat) conditions.push(eq(products.categoryId, cat.id));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        basePriceCents: products.basePriceCents,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        isTrending: products.isTrending,
        createdAt: products.createdAt,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(where)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(products).where(where),
  ]);

  return { rows, total };
}

export async function getAdminProductById(id: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  if (!product) return null;

  const [variants, images, tagRows] = await Promise.all([
    db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, id))
      .orderBy(productVariants.createdAt),
    db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, id))
      .orderBy(productImages.position),
    db
      .select({ tagId: productTags.tagId })
      .from(productTags)
      .where(eq(productTags.productId, id)),
  ]);

  return {
    product,
    variants,
    images,
    tagIds: tagRows.map((r) => r.tagId),
  };
}

// ── Tags ──────────────────────────────────────────────────────────────────────

export async function getAdminTags() {
  return db.select().from(tags).orderBy(tags.position, tags.name);
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function getAdminOrders(opts: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { status, search, page = 1, limit = 30 } = opts;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (status) conditions.push(eq(orders.status, status as typeof orders.status._.data));
  if (search) {
    conditions.push(
      sql`(${orders.orderNumber} ILIKE ${"%" + search + "%"} OR ${orders.email} ILIKE ${"%" + search + "%"})`,
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        email: orders.email,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        totalCents: orders.totalCents,
        currency: orders.currency,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(orders).where(where),
  ]);

  return { rows, total };
}

export async function getAdminOrderById(id: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return order ?? null;
}

// ── Customers ─────────────────────────────────────────────────────────────────

export async function getAdminCustomers(opts: { search?: string; page?: number; limit?: number }) {
  const { search, page = 1, limit = 30 } = opts;
  const offset = (page - 1) * limit;

  const where = search
    ? sql`(${users.email} ILIKE ${"%" + search + "%"} OR ${users.fullName} ILIKE ${"%" + search + "%"})`
    : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        createdAt: users.createdAt,
        orderCount: sql<number>`COALESCE(COUNT(${orders.id}), 0)::int`,
        totalSpentCents: sql<number>`COALESCE(SUM(${orders.totalCents}), 0)::int`,
      })
      .from(users)
      .leftJoin(orders, eq(orders.userId, users.id))
      .where(where)
      .groupBy(users.id)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(users).where(where),
  ]);

  return { customers: rows, total };
}

// ── Inventory ─────────────────────────────────────────────────────────────────

export async function getInventoryLevels(opts: { lowStockOnly?: boolean } = {}) {
  const { lowStockOnly } = opts;
  const conditions = [eq(productVariants.isActive, true)];
  if (lowStockOnly) conditions.push(lte(productVariants.stockQuantity, 3));

  return db
    .select({
      variantId: productVariants.id,
      sku: productVariants.sku,
      size: productVariants.size,
      color: productVariants.color,
      stockQuantity: productVariants.stockQuantity,
      priceCents: productVariants.priceCents,
      productId: products.id,
      productName: products.name,
      productSlug: products.slug,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(and(...conditions))
    .orderBy(productVariants.stockQuantity, products.name);
}
