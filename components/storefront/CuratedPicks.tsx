import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import type { getTrendingProducts } from "@/lib/db/queries/products";

interface CuratedPicksProps {
  products: Awaited<ReturnType<typeof getTrendingProducts>>;
}

export function CuratedPicks({ products }: CuratedPicksProps) {
  if (!products.length) return null;

  return (
    <section className="px-6 py-16 lg:px-32 lg:py-24" aria-label="Store">
      <div className="mb-10 flex items-end justify-between">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">STORE</p>
        <Link
          href="/shop"
          className="text-xs tracking-[0.15em] uppercase text-foreground/60 transition-colors hover:text-foreground"
        >
          View all
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:gap-x-6 xl:grid-cols-4">
        {products.map((product, i) => (
          <ProductCard key={product.id} {...product} priority={i < 4} />
        ))}
      </div>
    </section>
  );
}
