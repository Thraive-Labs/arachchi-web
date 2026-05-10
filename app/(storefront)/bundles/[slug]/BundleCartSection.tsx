"use client";

import { useState } from "react";
import { useCartStore } from "@/stores/cart";
import type { BundleWithProducts } from "@/lib/db/queries/bundles";

interface BundleCartSectionProps {
  bundle: NonNullable<BundleWithProducts>;
}

export function BundleCartSection({ bundle }: BundleCartSectionProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  // selectedVariants: productId → variantId
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const p of bundle.products) {
      const first = p.variants.find((v) => v.stockQuantity > 0);
      if (first) init[p.id] = first.id;
    }
    return init;
  });

  const allSelected = bundle.products.every((p) => {
    const hasSizes = p.variants.some((v) => v.size);
    return !hasSizes || selectedVariants[p.id];
  });

  function handleAddAll() {
    // Pro-rate bundle price across products
    const totalOriginalCents = bundle.products.reduce((s, p) => s + p.basePriceCents, 0);
    const ratio = totalOriginalCents > 0 ? bundle.finalPriceCents / totalOriginalCents : 1;

    for (const p of bundle.products) {
      const variantId = selectedVariants[p.id] ?? p.variants[0]?.id;
      if (!variantId) continue;
      const variant = p.variants.find((v) => v.id === variantId);
      const size = variant?.size;
      addItem({
        variantId,
        productId: p.id,
        productSlug: p.slug,
        productName: p.name,
        variantLabel: size ? `${size} · ${bundle.name}` : bundle.name,
        image: p.primaryImage ?? "",
        priceCents: Math.round(p.basePriceCents * ratio),
        quantity: 1,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Size selectors per product */}
      {bundle.products.map((p) => {
        const hasSizes = p.variants.some((v) => v.size);
        if (!hasSizes) return null;
        return (
          <div key={p.id}>
            <p className="mb-2 text-xs tracking-[0.1em] uppercase text-muted-foreground">{p.name} — Size</p>
            <div className="flex flex-wrap gap-2">
              {p.variants.map((v) => {
                const oos = v.stockQuantity === 0;
                const active = selectedVariants[p.id] === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariants((prev) => ({ ...prev, [p.id]: v.id }))}
                    disabled={oos}
                    className={`h-9 min-w-[2.25rem] border px-2.5 text-xs transition-colors ${
                      oos
                        ? "cursor-not-allowed border-border text-border line-through"
                        : active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-foreground hover:border-foreground"
                    }`}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <button
        onClick={handleAddAll}
        disabled={!allSelected}
        className="w-full border border-foreground bg-foreground py-4 text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {added ? "Added to cart" : "Add all to cart"}
      </button>
    </div>
  );
}
