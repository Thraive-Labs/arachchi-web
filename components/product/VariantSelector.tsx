"use client";

import { useState } from "react";
import { AddToCartButton } from "./AddToCartButton";
import { SizeGuideModal } from "./SizeGuideModal";
import { WishlistButton } from "./WishlistButton";
import type { ProductVariant } from "@/lib/db/schema";

interface VariantSelectorProps {
  variants: ProductVariant[];
  productId: string;
  productSlug: string;
  productName: string;
  primaryImage: string;
}

export function VariantSelector({
  variants,
  productId,
  productSlug,
  productName,
  primaryImage,
}: VariantSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    variants.find((v) => v.stockQuantity > 0)?.id ?? null,
  );
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const selected = variants.find((v) => v.id === selectedId) ?? null;
  const sizes = Array.from(new Set(variants.map((v) => v.size).filter(Boolean)));
  const hasSizes = sizes.length > 0;
  const variantLabel = [selected?.size, selected?.color].filter(Boolean).join(" / ");

  return (
    <>
      <div className="space-y-6">
        {hasSizes && (
          <div>
            <div className="mb-3 flex items-baseline justify-between">
              <p className="text-xs tracking-[0.15em] uppercase text-foreground">
                Size{selected?.size ? `: ${selected.size}` : ""}
              </p>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
              >
                Size guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => {
                const outOfStock = v.stockQuantity === 0;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedId(v.id)}
                    disabled={outOfStock}
                    className={`h-10 min-w-[2.5rem] border px-3 text-xs transition-colors ${
                      v.id === selectedId
                        ? "border-foreground bg-foreground text-background"
                        : outOfStock
                          ? "cursor-not-allowed border-border text-border line-through"
                          : "border-border text-foreground hover:border-foreground"
                    }`}
                    aria-label={`Size ${v.size}${outOfStock ? " — out of stock" : ""}`}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {selected ? (
          <AddToCartButton
            variantId={selected.id}
            productId={productId}
            productSlug={productSlug}
            productName={productName}
            variantLabel={variantLabel || selected.sku}
            image={primaryImage}
            priceCents={selected.priceCents}
            stock={selected.stockQuantity}
          />
        ) : (
          <button
            disabled
            className="w-full border border-border py-4 text-xs tracking-[0.2em] uppercase text-muted-foreground cursor-not-allowed"
          >
            Select a size
          </button>
        )}

        <WishlistButton variantId={selectedId} />
      </div>

      <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </>
  );
}
