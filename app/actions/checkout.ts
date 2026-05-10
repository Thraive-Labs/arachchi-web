"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { eq, inArray } from "drizzle-orm";
import { getStripe } from "@/lib/stripe/server";
import { getUser } from "@/lib/auth/server";
import { db } from "@/lib/db/client";
import { productVariants, products, carts, cartItems, discounts } from "@/lib/db/schema";

const FREE_SHIPPING_THRESHOLD_CENTS = 25000; // $250 CAD
const STANDARD_SHIPPING_CENTS = 1500; // $15 CAD

const checkoutInputSchema = z.array(
  z.object({ variantId: z.string().uuid(), quantity: z.number().int().min(1).max(10) }),
).min(1).max(20);

export type CheckoutError = { error: string };

export async function createCheckoutSession(
  clientItems: Array<{ variantId: string; quantity: number }>,
  promoCode?: string,
): Promise<CheckoutError> {
  // ── 1. Validate input ──────────────────────────────────────────────────────
  const parsed = checkoutInputSchema.safeParse(clientItems);
  if (!parsed.success) return { error: "Invalid cart." };

  const variantIds = parsed.data.map((i) => i.variantId);
  const quantityMap = new Map(parsed.data.map((i) => [i.variantId, i.quantity]));

  // ── 2. Re-fetch prices + stock from DB (never trust client) ────────────────
  const rows = await db
    .select({
      variantId: productVariants.id,
      sku: productVariants.sku,
      size: productVariants.size,
      color: productVariants.color,
      priceCents: productVariants.priceCents,
      stockQuantity: productVariants.stockQuantity,
      isActive: productVariants.isActive,
      productName: products.name,
      productSlug: products.slug,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(inArray(productVariants.id, variantIds));

  if (rows.length !== variantIds.length) return { error: "One or more items are no longer available." };

  const validationErrors: string[] = [];
  for (const row of rows) {
    const qty = quantityMap.get(row.variantId)!;
    if (!row.isActive) {
      validationErrors.push(`${row.productName} is no longer available.`);
    } else if (row.stockQuantity < qty) {
      validationErrors.push(
        row.stockQuantity === 0
          ? `${row.productName} (${row.size ?? row.color ?? row.sku}) is out of stock.`
          : `Only ${row.stockQuantity} of ${row.productName} (${row.size ?? row.color ?? row.sku}) left.`,
      );
    }
  }
  if (validationErrors.length > 0) return { error: validationErrors[0]! };

  // ── 3. Compute subtotal ────────────────────────────────────────────────────
  let subtotalCents = 0;
  for (const row of rows) {
    subtotalCents += row.priceCents * quantityMap.get(row.variantId)!;
  }

  // ── 4. Validate promo code (optional) ──────────────────────────────────────
  let discountCents = 0;
  let discountCode: string | undefined;

  if (promoCode?.trim()) {
    const code = promoCode.trim().toUpperCase();
    const [discount] = await db
      .select()
      .from(discounts)
      .where(eq(discounts.code, code))
      .limit(1);

    if (
      !discount ||
      !discount.isActive ||
      (discount.endsAt && discount.endsAt < new Date()) ||
      (discount.startsAt && discount.startsAt > new Date()) ||
      (discount.maxUses != null && discount.usesCount >= discount.maxUses) ||
      (discount.minSubtotalCents != null && subtotalCents < discount.minSubtotalCents)
    ) {
      return { error: "Invalid or expired promo code." };
    }

    discountCode = code;
    if (discount.type === "percentage") {
      discountCents = Math.floor((subtotalCents * discount.value) / 100);
    } else if (discount.type === "fixed") {
      discountCents = Math.min(discount.value, subtotalCents);
    }
  }

  const discountedSubtotal = subtotalCents - discountCents;

  // ── 5. Get user ────────────────────────────────────────────────────────────
  const user = await getUser();

  // ── 6. Persist cart in DB ──────────────────────────────────────────────────
  let cartId: string;

  if (user) {
    const [existingCart] = await db
      .select({ id: carts.id })
      .from(carts)
      .where(eq(carts.userId, user.id))
      .limit(1);

    if (existingCart) {
      cartId = existingCart.id;
      await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
    } else {
      const [newCart] = await db
        .insert(carts)
        .values({ userId: user.id })
        .returning({ id: carts.id });
      cartId = newCart!.id;
    }
  } else {
    const [newCart] = await db.insert(carts).values({}).returning({ id: carts.id });
    cartId = newCart!.id;
  }

  await db.insert(cartItems).values(
    rows.map((row) => ({
      cartId,
      variantId: row.variantId,
      quantity: quantityMap.get(row.variantId)!,
    })),
  );

  // ── 7. Build Stripe line items ─────────────────────────────────────────────
  const stripe = getStripe();

  const lineItems = rows.map((row) => {
    const qty = quantityMap.get(row.variantId)!;
    const label = [row.size, row.color].filter(Boolean).join(" / ");
    return {
      quantity: qty,
      price_data: {
        currency: "cad",
        unit_amount: row.priceCents,
        product_data: {
          name: row.productName,
          ...(label ? { description: label } : {}),
        },
      },
    };
  });

  // Add discount line item if applicable
  if (discountCents > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "cad",
        unit_amount: -discountCents,
        product_data: { name: `Promo code: ${discountCode}` },
      },
    });
  }

  const shippingCents =
    discountedSubtotal >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : STANDARD_SHIPPING_CENTS;

  // ── 8. Create Stripe Checkout session ─────────────────────────────────────
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    shipping_address_collection: { allowed_countries: ["CA", "US"] },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: shippingCents, currency: "cad" },
          display_name: shippingCents === 0 ? "Free shipping" : "Standard shipping",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 5 },
            maximum: { unit: "business_day", value: 10 },
          },
        },
      },
    ],
    ...(user?.email ? { customer_email: user.email } : {}),
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
    metadata: {
      cartId,
      userId: user?.id ?? "",
    },
  });

  redirect(session.url!);
}
