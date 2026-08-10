"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { formatPriceCents } from "@/lib/utils";
import { removeFromWishlistAction } from "@/app/actions/wishlist";

interface WishlistItemProps {
  wishlistId: string;
  productSlug: string;
  productName: string;
  size: string | null;
  color: string | null;
  priceCents: number;
  stockQuantity: number;
  imageUrl: string | null;
}

export function WishlistItem({
  wishlistId,
  productSlug,
  productName,
  size,
  color,
  priceCents,
  stockQuantity,
  imageUrl,
}: WishlistItemProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleRemove() {
    startTransition(async () => {
      await removeFromWishlistAction(wishlistId);
      router.refresh();
    });
  }

  const label = [size, color].filter(Boolean).join(" / ");
  const oos = stockQuantity === 0;

  return (
    <div className="group relative">
      {/* Remove button */}
      <button
        onClick={handleRemove}
        disabled={isPending}
        aria-label={`Remove ${productName} from wishlist`}
        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center bg-background/80 text-muted-foreground opacity-100 backdrop-blur-sm transition-all hover:text-foreground disabled:opacity-50 lg:opacity-0 lg:group-hover:opacity-100"
      >
        <X size={12} />
      </button>

      <Link href={`/product/${productSlug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={productName}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
          {oos && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
              <p className="text-xs tracking-[0.2em] uppercase text-foreground">Out of stock</p>
            </div>
          )}
        </div>

        <div className="mt-3 space-y-0.5">
          <p className="text-xs tracking-[0.15em] uppercase text-foreground leading-relaxed">
            {productName}
          </p>
          {label && <p className="text-xs text-muted-foreground">{label}</p>}
          <p className="text-xs text-foreground">{formatPriceCents(priceCents)}</p>
        </div>
      </Link>
    </div>
  );
}
