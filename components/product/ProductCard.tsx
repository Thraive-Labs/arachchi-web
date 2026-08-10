"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { formatPriceCents } from "@/lib/utils";
import { useCartStore } from "@/stores/cart";
import type { CardVariant, CardColor } from "@/lib/db/queries/products";

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  basePriceCents: number;
  compareAtPriceCents?: number | null;
  primaryImage: string | null;
  secondaryImage?: string | null;
  priority?: boolean;
  variants?: CardVariant[];
  colors?: CardColor[];
}

export function ProductCard({
  id,
  slug,
  name,
  basePriceCents,
  compareAtPriceCents,
  primaryImage,
  secondaryImage,
  priority = false,
  variants,
  colors,
}: ProductCardProps) {
  const [addedId, setAddedId] = useState<string | null>(null);
  const [activeColor, setActiveColor] = useState<CardColor | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  const sizedVariants = variants?.filter((v) => v.size) ?? [];
  const hasQuickAdd = sizedVariants.length > 0 && primaryImage !== null;
  const hasColors = (colors?.length ?? 0) > 1;
  const displayImage = activeColor?.image || primaryImage;
  const showSecondaryHover = !!secondaryImage && !activeColor;

  function handleQuickAdd(v: CardVariant) {
    if (!primaryImage || v.stockQuantity === 0) return;
    addItem({
      variantId: v.id,
      productId: id,
      productSlug: slug,
      productName: name,
      variantLabel: v.size ?? "One size",
      image: primaryImage,
      priceCents: v.priceCents,
      quantity: 1,
    });
    setAddedId(v.id);
    setTimeout(() => setAddedId(null), 1800);
  }

  return (
    <motion.article
      className="group"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Image area */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {/* Image link — aria-hidden; text link below is the primary nav target */}
        <Link
          href={`/product/${slug}`}
          className="absolute inset-0 z-0"
          tabIndex={-1}
          aria-hidden="true"
        >
          {displayImage ? (
            <Image
              src={displayImage}
              alt={name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              priority={priority}
              className={`object-cover transition-opacity duration-300 ${
                showSecondaryHover ? "group-hover:opacity-0" : ""
              }`}
            />
          ) : (
            <div className="absolute inset-0 bg-muted" />
          )}
          {showSecondaryHover && (
            <Image
              src={secondaryImage!}
              alt={`${name} — alternate view`}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="absolute inset-0 object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          )}
        </Link>

        {/* Color swatches — appear on hover, vertical stack top-left; click swaps the card image */}
        {hasColors && (
          <div className="absolute left-2 top-2 z-10 flex flex-col gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {colors!.map((c) => (
              <button
                key={c.color}
                type="button"
                onClick={() => setActiveColor(activeColor?.color === c.color ? null : c)}
                aria-label={`View in ${c.color}`}
                aria-pressed={activeColor?.color === c.color}
                title={c.color}
                className={`h-4 w-4 rounded-full border shadow-sm transition-transform hover:scale-110 ${
                  activeColor?.color === c.color ? "border-foreground ring-1 ring-foreground" : "border-white/80"
                }`}
                style={{ backgroundColor: c.colorHex ?? "#ccc" }}
              />
            ))}
          </div>
        )}

        {/* Quick-add overlay — appears on hover, sibling to the Link (no nesting issue) */}
        {hasQuickAdd && (
          <div className="absolute inset-x-0 bottom-0 z-10 bg-background/92 px-3 pb-3 pt-2 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
            <p className="mb-1.5 text-[9px] tracking-[0.2em] uppercase text-muted-foreground">
              Quick add
            </p>
            <div className="flex flex-wrap gap-1.5">
              {sizedVariants.map((v) => {
                const oos = v.stockQuantity === 0;
                const added = addedId === v.id;
                return (
                  <button
                    key={v.id}
                    disabled={oos}
                    onClick={() => handleQuickAdd(v)}
                    className={`h-7 min-w-[1.75rem] border px-2 text-[10px] transition-colors ${
                      oos
                        ? "cursor-not-allowed border-border text-border line-through"
                        : added
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-foreground hover:border-foreground"
                    }`}
                    aria-label={`Add size ${v.size}${oos ? " — out of stock" : ""}`}
                  >
                    {added ? "✓" : v.size}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Info — primary accessible link */}
      <Link href={`/product/${slug}`} className="mt-3 block space-y-1">
        <p className="text-xs tracking-[0.15em] uppercase text-foreground leading-relaxed">
          {name}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-xs text-foreground">
            {formatPriceCents(basePriceCents)}
          </span>
          {compareAtPriceCents && compareAtPriceCents > basePriceCents && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPriceCents(compareAtPriceCents)}
            </span>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
