import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { Pool } from "pg";
import { users, orders, orderItems, productVariants, products } from "../lib/db/schema";

// ── Config ────────────────────────────────────────────────────────────────────

const ORDER_COUNT = 220;

const STATUS_WEIGHTS = [
  { status: "delivered",  weight: 55 },
  { status: "shipped",    weight: 15 },
  { status: "fulfilled",  weight: 10 },
  { status: "paid",       weight:  8 },
  { status: "pending",    weight:  4 },
  { status: "cancelled",  weight:  5 },
  { status: "refunded",   weight:  3 },
] as const;

const TOTAL_WEIGHT = STATUS_WEIGHTS.reduce((s, w) => s + w.weight, 0);

function pickStatus() {
  let r = Math.random() * TOTAL_WEIGHT;
  for (const { status, weight } of STATUS_WEIGHTS) {
    r -= weight;
    if (r <= 0) return status;
  }
  return "delivered";
}

// Bias towards recent dates — more orders in recent months
function randomDate(maxDaysAgo: number): Date {
  const u = Math.random();
  const bias = 1 - Math.pow(1 - u, 2.5); // more weight to recent dates
  const msAgo = bias * maxDaysAgo * 24 * 60 * 60 * 1000;
  return new Date(Date.now() - msAgo);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function seedOrders() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  // Get test customer
  const [customer] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.email, "test@customer.com"))
    .limit(1);

  if (!customer) {
    console.error("test@customer.com not found — run npm run db:seed-users first.");
    process.exit(1);
  }

  // Get all active variants
  const variants = await db
    .select({
      id:          productVariants.id,
      priceCents:  productVariants.priceCents,
      size:        productVariants.size,
      color:       productVariants.color,
      productName: products.name,
    })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(eq(productVariants.isActive, true));

  if (variants.length === 0) {
    console.error("No active variants — run npm run db:seed first.");
    process.exit(1);
  }

  console.log(`Creating ${ORDER_COUNT} orders for ${customer.email}...`);

  for (let i = 0; i < ORDER_COUNT; i++) {
    const createdAt = randomDate(365);
    const status = pickStatus();
    const paymentStatus =
      status === "pending" || status === "cancelled" ? "pending" : "paid";

    const itemCount = randInt(1, 3);
    const selectedVariants = Array.from({ length: itemCount }, () => pick(variants));

    const subtotalCents = selectedVariants.reduce((s, v) => s + v.priceCents, 0);
    const shippingCents = subtotalCents >= 25000 ? 0 : 1500;
    const taxCents      = Math.round(subtotalCents * 0.13); // 13% HST
    const totalCents    = subtotalCents + shippingCents + taxCents;

    const orderNumber = `AR-${String(100000 + i).padStart(6, "0")}`;

    const [order] = await db
      .insert(orders)
      .values({
        userId:          customer.id,
        email:           customer.email,
        orderNumber,
        status,
        paymentStatus,
        subtotalCents,
        discountCents:   0,
        shippingCents,
        taxCents,
        totalCents,
        stripeSessionId: `cs_seed_${Date.now()}_${i}`,
        createdAt,
        updatedAt: createdAt,
      })
      .returning({ id: orders.id });

    for (const v of selectedVariants) {
      const variantLabel = [v.size, v.color].filter(Boolean).join(" / ") || "One size";
      await db.insert(orderItems).values({
        orderId:       order.id,
        variantId:     v.id,
        productName:   v.productName,
        variantLabel,
        unitPriceCents: v.priceCents,
        quantity:       1,
        lineTotalCents: v.priceCents,
      });
    }

    if ((i + 1) % 50 === 0) console.log(`  ${i + 1} / ${ORDER_COUNT}`);
  }

  console.log(`\nDone — ${ORDER_COUNT} orders seeded over the past 365 days.`);
  await pool.end();
}

seedOrders().catch((err) => {
  console.error(err);
  process.exit(1);
});
