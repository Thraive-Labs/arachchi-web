import { Suspense } from "react";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { ProductCard } from "@/components/product/ProductCard";
import { getActiveCategories } from "@/lib/db/queries/categories";
import { getVisibleTags } from "@/lib/db/queries/tags";
import { getProducts } from "@/lib/db/queries/products";
import Link from "next/link";

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    tags?: string;
    sort?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: "Shop",
  description: "Browse the Arachchi collection.",
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const tagSlugs = params.tags?.split(",").filter(Boolean) ?? [];

  const [cats, tags, result] = await Promise.all([
    getActiveCategories(),
    getVisibleTags(),
    getProducts({
      categorySlug: params.category,
      tagSlugs,
      sort: (params.sort as "newest" | "price-asc" | "price-desc") ?? "newest",
      page,
      limit: 12,
    }),
  ]);

  const { items, total, totalPages } = result;

  return (
    <div className="mx-auto max-w-[1440px] px-6 pt-32 pb-24 lg:px-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="font-serif text-3xl font-light tracking-wide text-foreground">
          {params.category
            ? (cats.find((c) => c.slug === params.category)?.name ?? "Shop")
            : "All"}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">{total} pieces</p>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        {/* Filters — wrapped in Suspense because it uses useSearchParams */}
        <Suspense>
          <ShopFilters categories={cats} tags={tags} />
        </Suspense>

        {/* Grid */}
        <div className="flex-1">
          {items.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-sm text-muted-foreground">No products match your filters.</p>
              <Link href="/shop" className="mt-4 inline-block text-xs tracking-[0.15em] uppercase text-foreground underline underline-offset-4">
                Clear all filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6 xl:grid-cols-4">
              {items.map((product, i) => (
                <ProductCard key={product.id} {...product} priority={i < 4} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const pParams = new URLSearchParams({
                  ...(params.category ? { category: params.category } : {}),
                  ...(params.tags ? { tags: params.tags } : {}),
                  ...(params.sort ? { sort: params.sort } : {}),
                  page: String(p),
                });
                return (
                  <Link
                    key={p}
                    href={`/shop?${pParams.toString()}`}
                    className={`flex h-8 w-8 items-center justify-center text-xs transition-colors ${
                      p === page
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
