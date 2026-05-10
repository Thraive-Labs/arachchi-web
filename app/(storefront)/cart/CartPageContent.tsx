"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useCartStore } from "@/stores/cart";
import { formatPriceCents } from "@/lib/utils";
import { createCheckoutSession } from "@/app/actions/checkout";

const FREE_SHIPPING_THRESHOLD_CENTS = 25000;
const STANDARD_SHIPPING_CENTS = 1500;

export function CartPageContent() {
  const { items, removeItem, updateQuantity, subtotalCents, clearCart } = useCartStore();
  const [promoCode, setPromoCode] = useState("");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const subtotal = subtotalCents();
  const estimatedShipping = subtotal >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : STANDARD_SHIPPING_CENTS;

  function handleCheckout() {
    setCheckoutError(null);
    startTransition(async () => {
      const result = await createCheckoutSession(
        items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        promoCode.trim() || undefined,
      );
      // If no error, the server action called redirect() — we never reach here
      if (result?.error) {
        setCheckoutError(result.error);
      }
    });
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-serif text-2xl font-light tracking-wide mb-4">Your cart is empty.</p>
        <Link
          href="/shop"
          className="text-xs tracking-[0.2em] uppercase text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity"
        >
          Browse the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
      {/* Items */}
      <div className="flex-1">
        <ul className="divide-y divide-border border-t border-border">
          {items.map((item) => (
            <li key={item.variantId} className="flex gap-5 py-6">
              {/* Image */}
              <div className="relative h-28 w-20 shrink-0 overflow-hidden bg-muted">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.productName}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                )}
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link
                      href={`/product/${item.productSlug}`}
                      className="text-sm text-foreground hover:text-muted-foreground transition-colors"
                    >
                      {item.productName}
                    </Link>
                    {item.variantLabel && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.variantLabel}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={`Remove ${item.productName}`}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  {/* Quantity stepper */}
                  <div className="flex items-center gap-0 border border-border">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="flex h-8 w-8 items-center justify-center text-xs border-x border-border">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <span className="text-sm text-foreground">
                    {formatPriceCents(item.priceCents * item.quantity)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => clearCart()}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            Clear cart
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="w-full shrink-0 lg:w-80">
        <div className="border border-border p-6 space-y-4">
          <p className="text-xs tracking-[0.2em] uppercase text-foreground">Order summary</p>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPriceCents(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>
                {estimatedShipping === 0 ? "Free" : formatPriceCents(estimatedShipping)}
              </span>
            </div>
            {subtotal < FREE_SHIPPING_THRESHOLD_CENTS && (
              <p className="text-xs text-muted-foreground">
                Add {formatPriceCents(FREE_SHIPPING_THRESHOLD_CENTS - subtotal)} more for free shipping.
              </p>
            )}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Taxes</span>
              <span>Calculated at checkout</span>
            </div>
          </div>

          <div className="border-t border-border pt-4 flex justify-between text-sm font-medium">
            <span>Estimated total</span>
            <span>{formatPriceCents(subtotal + estimatedShipping)}</span>
          </div>

          {/* Promo code */}
          <div className="border-t border-border pt-4">
            <label htmlFor="promoCode" className="text-xs tracking-[0.15em] uppercase text-foreground">
              Promo code
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="promoCode"
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="flex-1 min-w-0 border border-border bg-transparent px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground uppercase"
              />
            </div>
          </div>

          {checkoutError && (
            <p className="text-sm text-red-600">{checkoutError}</p>
          )}

          <button
            onClick={handleCheckout}
            disabled={isPending}
            className="w-full border border-foreground bg-foreground py-4 text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {isPending ? "Redirecting to checkout..." : "Proceed to checkout"}
          </button>

          <p className="text-xs text-center text-muted-foreground">
            Secure checkout via Stripe.
          </p>
        </div>
      </div>
    </div>
  );
}
