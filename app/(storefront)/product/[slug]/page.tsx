import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ProductGallery } from "@/components/product/ProductGallery";
import { VariantSelector } from "@/components/product/VariantSelector";
import { ProductCard } from "@/components/product/ProductCard";
import { getProductBySlug, getRelatedProducts } from "@/lib/db/queries/products";
import { formatPriceCents } from "@/lib/utils";
import { trackProductView } from "@/app/actions/product-view";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const primaryImage = product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arachchi.com";
  return {
    title: product.seoTitle ?? `${product.name} — Arachchi`,
    description: product.seoDescription ?? product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      url: `${baseUrl}/product/${slug}`,
      images: primaryImage ? [{ url: primaryImage, alt: product.name }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.shortDescription,
      images: primaryImage ? [primaryImage] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(
    product.id,
    product.relatedProductIds ?? [],
    product.categoryId ?? null,
    4,
  );

  const primaryImage = product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url ?? "";
  const visibleTags = product.tags.filter((t) => t.isVisible);

  // Fire-and-forget view tracking — never blocks render
  trackProductView(product.id).catch(() => {});

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arachchi.com";
  const lowestPrice = product.variants.length > 0
    ? Math.min(...product.variants.map((v) => v.priceCents)) / 100
    : product.basePriceCents / 100;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image: product.images.map((i) => i.url),
    url: `${baseUrl}/product/${product.slug}`,
    brand: { "@type": "Brand", name: "Arachchi" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "CAD",
      lowPrice: lowestPrice.toFixed(2),
      availability: product.variants.some((v) => v.stockQuantity > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
    <div className="mx-auto max-w-[1440px] px-6 pt-24 pb-24 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-foreground transition-colors">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Gallery */}
        <ProductGallery images={product.images} productName={product.name} />

        {/* Info — sticky on desktop so add-to-cart stays visible while gallery scrolls */}
        <div className="lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pl-8 lg:scrollbar-none">
          <h1 className="font-serif text-3xl font-light tracking-wide text-foreground">
            {product.name}
          </h1>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-base text-foreground">
              {formatPriceCents(product.basePriceCents)}
            </span>
            {product.compareAtPriceCents && product.compareAtPriceCents > product.basePriceCents && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPriceCents(product.compareAtPriceCents)}
              </span>
            )}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {product.shortDescription}
          </p>

          {/* Variant selector + add to cart */}
          <div className="mt-8">
            <VariantSelector
              variants={product.variants}
              productId={product.id}
              productSlug={product.slug}
              productName={product.name}
              primaryImage={primaryImage}
            />
          </div>

          {/* Tags */}
          {visibleTags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {visibleTags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/shop/tag/${tag.slug}`}
                  className="border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Collapsible details */}
          <div className="mt-8 divide-y divide-border border-t border-border">
            <details className="group py-4">
              <summary className="flex cursor-pointer items-center justify-between text-xs tracking-[0.15em] uppercase text-foreground">
                Details
                <span className="text-muted-foreground group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </details>

            {product.metadata != null && (
              <details className="group py-4">
                <summary className="flex cursor-pointer items-center justify-between text-xs tracking-[0.15em] uppercase text-foreground">
                  Material &amp; care
                  <span className="text-muted-foreground group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {Object.entries(product.metadata as Record<string, unknown>).map(([k, v]) => (
                    <p key={k}>
                      <span className="capitalize">{k.replace(/_/g, " ")}</span>: {String(v)}
                    </p>
                  ))}
                </div>
              </details>
            )}

            <details className="group py-4">
              <summary className="flex cursor-pointer items-center justify-between text-xs tracking-[0.15em] uppercase text-foreground">
                Shipping &amp; returns
                <span className="text-muted-foreground group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <p>Free standard shipping on orders over $250 CAD.</p>
                <p>Returns accepted within 30 days of delivery in original condition.</p>
                <Link href="/returns" className="underline underline-offset-4 hover:text-foreground">Full returns policy</Link>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-24" aria-label="You may also like">
          <p className="mb-8 text-xs tracking-[0.3em] uppercase text-muted-foreground">
            You may also like
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 lg:gap-x-6">
            {related.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </section>
      )}
    </div>
    </>
  );
}
