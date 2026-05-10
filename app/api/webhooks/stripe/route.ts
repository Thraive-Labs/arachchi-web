import { eq, inArray } from "drizzle-orm";
import { sql } from "drizzle-orm";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { db } from "@/lib/db/client";
import {
  orders,
  orderItems,
  cartItems,
  productVariants,
  products,
  discounts,
} from "@/lib/db/schema";
import { getResend, FROM_ADDRESS } from "@/lib/email/client";
import { orderConfirmationHtml } from "@/lib/email/templates/order-confirmation";

export const dynamic = "force-dynamic";

function generateOrderNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const random = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `AR-${random}`;
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  // ── Idempotency: skip if already processed ────────────────────────────────
  const [existing] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.stripeSessionId, session.id))
    .limit(1);

  if (existing) return;

  const cartId = session.metadata?.cartId;
  const userId = session.metadata?.userId || null;

  if (!cartId) {
    console.error("[stripe webhook] Missing cartId in session metadata", session.id);
    return;
  }

  // ── Fetch cart items with product/variant data ────────────────────────────
  const cartRows = await db
    .select({
      variantId: cartItems.variantId,
      quantity: cartItems.quantity,
      priceCents: productVariants.priceCents,
      size: productVariants.size,
      color: productVariants.color,
      sku: productVariants.sku,
      productName: products.name,
    })
    .from(cartItems)
    .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(eq(cartItems.cartId, cartId));

  if (cartRows.length === 0) {
    console.error("[stripe webhook] Cart empty or not found for cartId", cartId);
    return;
  }

  // ── Compute totals from Stripe session ────────────────────────────────────
  const subtotalCents = cartRows.reduce((sum, r) => sum + r.priceCents * r.quantity, 0);
  const shippingCents = session.total_details?.amount_shipping ?? 0;
  const taxCents = session.total_details?.amount_tax ?? 0;
  const totalCents = session.amount_total ?? subtotalCents + shippingCents + taxCents;
  const discountCents = session.total_details?.amount_discount ?? 0;

  const email = session.customer_details?.email ?? session.customer_email ?? "";
  const orderNumber = generateOrderNumber();
  const currency = (session.currency?.toUpperCase() ?? "CAD");

  // ── Create order ──────────────────────────────────────────────────────────
  const [order] = await db
    .insert(orders)
    .values({
      orderNumber,
      userId: userId || null,
      email,
      status: "paid",
      paymentStatus: "paid",
      subtotalCents,
      shippingCents,
      taxCents,
      discountCents,
      totalCents,
      currency,
      stripeSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === "string" ? session.payment_intent : null,
    })
    .returning();

  if (!order) return;

  // ── Create order items ────────────────────────────────────────────────────
  await db.insert(orderItems).values(
    cartRows.map((row) => {
      const variantLabel = [row.size, row.color].filter(Boolean).join(" / ") || row.sku;
      return {
        orderId: order.id,
        variantId: row.variantId,
        productName: row.productName,
        variantLabel,
        unitPriceCents: row.priceCents,
        quantity: row.quantity,
        lineTotalCents: row.priceCents * row.quantity,
      };
    }),
  );

  // ── Decrement stock ───────────────────────────────────────────────────────
  for (const row of cartRows) {
    await db
      .update(productVariants)
      .set({
        stockQuantity: sql`GREATEST(${productVariants.stockQuantity} - ${row.quantity}, 0)`,
      })
      .where(eq(productVariants.id, row.variantId));
  }

  // ── Increment discount usage ───────────────────────────────────────────────
  const discountCode = session.metadata?.discountCode;
  if (discountCode) {
    await db
      .update(discounts)
      .set({ usesCount: sql`${discounts.usesCount} + 1` })
      .where(eq(discounts.code, discountCode));
  }

  // ── Clean up cart items ───────────────────────────────────────────────────
  const variantIds = cartRows.map((r) => r.variantId);
  await db
    .delete(cartItems)
    .where(
      inArray(
        cartItems.variantId,
        variantIds,
      ),
    );

  // ── Send confirmation email ───────────────────────────────────────────────
  if (email) {
    try {
      const resend = getResend();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arachchi.com";
      await resend.emails.send({
        from: FROM_ADDRESS,
        to: [email],
        subject: `Your Arachchi order ${orderNumber}`,
        html: orderConfirmationHtml({
          orderNumber,
          email,
          items: cartRows.map((row) => ({
            productName: row.productName,
            variantLabel: [row.size, row.color].filter(Boolean).join(" / ") || row.sku,
            quantity: row.quantity,
            lineTotalCents: row.priceCents * row.quantity,
          })),
          subtotalCents,
          shippingCents,
          taxCents,
          totalCents,
          currency,
          siteUrl,
        }),
      });
    } catch (err) {
      // Email failure must not fail the webhook response
      console.error("[stripe webhook] Email send failed", err);
    }
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[stripe webhook] Signature verification failed", err);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
    }
  } catch (err) {
    console.error("[stripe webhook] Handler failed", event.type, err);
    return new Response("Webhook handler error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
