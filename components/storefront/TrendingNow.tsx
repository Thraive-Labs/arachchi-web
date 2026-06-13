import Link from "next/link";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import type { getTrendingProducts } from "@/lib/db/queries/products";

interface TrendingNowProps {
  products: Awaited<ReturnType<typeof getTrendingProducts>>;
}

export function TrendingNow({ products }: TrendingNowProps) {
  if (!products.length) return null;

  return (
    <section className="bg-secondary py-16 lg:py-24" aria-label="Trending now">
      <div className="lg:px-32">
        <div className="mb-10 flex items-end justify-between">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">Trending now</p>
          <Link
            href="/shop"
            className="text-xs tracking-[0.15em] uppercase text-foreground/60 transition-colors hover:text-foreground"
          >
            View all
          </Link>
        </div>
        <ProductCarousel products={products} />
      </div>
    </section>
  );
}
