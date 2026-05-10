"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getWishlistStatusAction, toggleWishlistAction } from "@/app/actions/wishlist";

interface WishlistButtonProps {
  variantId: string | null;
}

export function WishlistButton({ variantId }: WishlistButtonProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (!variantId) { setWishlisted(false); return; }
    getWishlistStatusAction(variantId).then((r) => {
      if (!r.requiresAuth) setWishlisted(r.wishlisted);
    });
  }, [variantId]);

  function handleToggle() {
    if (!variantId) return;
    startTransition(async () => {
      const result = await toggleWishlistAction(variantId);
      if (result.requiresAuth) {
        router.push("/login?redirectTo=/account/wishlist");
        return;
      }
      setWishlisted(result.wishlisted);
    });
  }

  if (!variantId) return null;

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
      className={`flex w-full items-center justify-center gap-2 border py-3.5 text-xs tracking-[0.2em] uppercase transition-colors disabled:opacity-50 ${
        wishlisted
          ? "border-foreground text-foreground"
          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
      }`}
    >
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill={wishlisted ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {wishlisted ? "Saved" : "Save to wishlist"}
    </button>
  );
}
