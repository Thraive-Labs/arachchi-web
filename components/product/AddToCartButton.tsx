"use client";

import { useCartStore } from "@/stores/cart";
import { useState } from "react";

interface AddToCartButtonProps {
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  variantLabel: string;
  image: string;
  priceCents: number;
  stock: number;
}

export function AddToCartButton({
  variantId,
  productId,
  productSlug,
  productName,
  variantLabel,
  image,
  priceCents,
  stock,
}: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const outOfStock = stock === 0;
  const lowStock = stock > 0 && stock <= 3;

  function handleAdd() {
    if (outOfStock) return;
    addItem({ variantId, productId, productSlug, productName, variantLabel, image, priceCents, quantity: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="space-y-3">
      {lowStock && (
        <p className="text-xs text-foreground/60">Only {stock} left</p>
      )}
      <button
        onClick={handleAdd}
        disabled={outOfStock}
        className="w-full border border-foreground bg-foreground py-4 text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {outOfStock ? "Out of stock" : added ? "Added to cart" : "Add to cart"}
      </button>
    </div>
  );
}
