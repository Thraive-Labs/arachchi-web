import Link from "next/link";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import type { getFeaturedProducts } from "@/lib/db/queries/products";

interface CuratedPicksProps {
  products: Awaited<ReturnType<typeof getFeaturedProducts>>;
}

export function CuratedPicks({ products }: CuratedPicksProps) {
  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-[1440px] px-6 py-16 lg:px-8 lg:py-24" aria-label="Curated picks">
      <div className="mb-10 flex items-end justify-between">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">Curated picks</p>
        <Link
          href="/shop"
          className="text-xs tracking-[0.15em] uppercase text-foreground/60 transition-colors hover:text-foreground"
        >
          View all
        </Link>
      </div>
      <ProductCarousel products={products} />
    </section>
  );
}
