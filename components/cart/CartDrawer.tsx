"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/stores/cart";
import { formatPriceCents } from "@/lib/utils";
import { ease, duration } from "@/lib/animations";
import { X, Minus, Plus } from "lucide-react";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotalCents } =
    useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.micro }}
            onClick={closeCart}
            className="fixed inset-0 z-40 bg-foreground/20"
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: duration.short, ease: ease.refined }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-background shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <p className="text-xs tracking-[0.2em] uppercase text-foreground">
                Cart ({items.length})
              </p>
              <button
                onClick={closeCart}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <p className="text-sm text-muted-foreground">Your cart is empty.</p>
                  <button
                    onClick={closeCart}
                    className="text-xs tracking-[0.15em] uppercase text-foreground underline underline-offset-4"
                  >
                    Continue shopping
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {items.map((item) => (
                    <li key={item.variantId} className="flex gap-4 py-5">
                      {/* Image */}
                      <div className="relative h-24 w-16 shrink-0 overflow-hidden bg-muted">
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              href={`/product/${item.productSlug}`}
                              onClick={closeCart}
                              className="text-xs tracking-[0.1em] uppercase text-foreground hover:text-muted-foreground transition-colors"
                            >
                              {item.productName}
                            </Link>
                            {item.variantLabel && (
                              <p className="mt-0.5 text-xs text-muted-foreground">{item.variantLabel}</p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.variantId)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={`Remove ${item.productName}`}
                          >
                            <X size={14} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          {/* Quantity stepper */}
                          <div className="flex items-center gap-3 border border-border">
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-4 text-center text-xs">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <span className="text-xs text-foreground">
                            {formatPriceCents(item.priceCents * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border px-6 py-5 space-y-4">
                {/* Free shipping progress */}
                {(() => {
                  const sub = subtotalCents();
                  const threshold = 25000;
                  const progress = Math.min(sub / threshold, 1);
                  const remaining = threshold - sub;
                  return (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        {remaining > 0
                          ? `${formatPriceCents(remaining)} away from free shipping`
                          : "You have free shipping"}
                      </p>
                      <div className="h-px w-full bg-border overflow-hidden">
                        <motion.div
                          className="h-full bg-foreground"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress * 100}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  );
                })()}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatPriceCents(subtotalCents())}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Taxes calculated at checkout.
                </p>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="block w-full border border-foreground bg-foreground py-4 text-center text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-80"
                >
                  View cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
