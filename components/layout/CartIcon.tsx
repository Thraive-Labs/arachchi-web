"use client";

import { motion } from "framer-motion";
import { useCartStore } from "@/stores/cart";

export function CartIcon() {
  const { totalItems, openCart } = useCartStore();
  const count = totalItems();

  return (
    <button
      onClick={openCart}
      className="relative text-xs tracking-[0.15em] uppercase text-foreground/70 transition-colors duration-200 hover:text-foreground"
      aria-label={`Cart${count > 0 ? `, ${count} items` : ""}`}
    >
      Cart
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 1.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center bg-foreground text-[9px] text-background"
        >
          {count > 9 ? "9+" : count}
        </motion.span>
      )}
    </button>
  );
}
