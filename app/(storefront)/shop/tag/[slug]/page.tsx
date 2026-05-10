import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { ProductCard } from "@/components/product/ProductCard";
import { getActiveCategories } from "@/lib/db/queries/categories";
import { getTagBySlug, getVisibleTags } from "@/lib/db/queries/tags";
import { getProducts } from "@/lib/db/queries/products";
import type { Metadata } from "next";

interface TagPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) return {};
  return { title: tag.name, description: `Shop the ${tag.name} collection.` };
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));

  const [tag, cats, allTags, result] = await Promise.all([
    getTagBySlug(slug),
    getActiveCategories(),
    getVisibleTags(),
    getProducts({
      tagSlugs: [slug],
      sort: (sp.sort as "newest" | "price-asc" | "price-desc") ?? "newest",
      page,
      limit: 12,
    }),
  ]);

  if (!tag) notFound();

  const { items, total } = result;

  return (
    <div className="mx-auto max-w-[1440px] px-6 pt-32 pb-24 lg:px-8">
      <div className="mb-12">
        <h1 className="font-serif text-3xl font-light tracking-wide text-foreground">
          {tag.name}
        </h1>
        {tag.description && (
          <p className="mt-2 text-sm text-muted-foreground max-w-lg">{tag.description}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">{total} pieces</p>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        <Suspense>
          <ShopFilters categories={cats} tags={allTags} />
        </Suspense>

        <div className="flex-1">
          {items.length === 0 ? (
            <p className="py-24 text-center text-sm text-muted-foreground">
              No products in this collection yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6 xl:grid-cols-4">
              {items.map((product, i) => (
                <ProductCard key={product.id} {...product} priority={i < 4} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
