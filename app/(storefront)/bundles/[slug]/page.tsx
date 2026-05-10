import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getBundleBySlug } from "@/lib/db/queries/bundles";
import { formatPriceCents } from "@/lib/utils";
import { BundleCartSection } from "./BundleCartSection";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const bundle = await getBundleBySlug(slug);
  if (!bundle) return {};
  return {
    title: `${bundle.name} Bundle`,
    description: bundle.description,
  };
}

export default async function BundleDetailPage({ params }: Props) {
  const { slug } = await params;
  const bundle = await getBundleBySlug(slug);
  if (!bundle) notFound();

  return (
    <div className="mx-auto max-w-[1440px] px-6 pt-24 pb-24 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/bundles" className="hover:text-foreground transition-colors">Bundles</Link>
        <span>/</span>
        <span className="text-foreground">{bundle.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-16 grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Cover image */}
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          {bundle.coverImageUrl ? (
            <Image src={bundle.coverImageUrl} alt={bundle.name} fill sizes="(max-width: 1024px) 100vw, 50vw" priority className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary">
              <span className="font-display text-6xl font-light tracking-[0.5em] text-foreground/20">A</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto scrollbar-none">
          <p className="mb-2 text-xs tracking-[0.3em] uppercase text-muted-foreground">Bundle</p>
          <h1 className="font-serif text-3xl font-light tracking-wide text-foreground">{bundle.name}</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{bundle.description}</p>

          {/* Pricing */}
          <div className="mt-8 space-y-2 border-t border-border pt-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Individual total</span>
              <span className="text-muted-foreground line-through">{formatPriceCents(bundle.regularTotalCents)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium text-foreground">Bundle price</span>
              <span className="font-medium text-foreground">{formatPriceCents(bundle.finalPriceCents)}</span>
            </div>
            {bundle.savingsCents > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">You save</span>
                <span className="text-foreground">{formatPriceCents(bundle.savingsCents)}</span>
              </div>
            )}
          </div>

          {/* Availability */}
          {!bundle.isAvailable && (
            <div className="mt-6 border border-border px-4 py-3">
              <p className="text-xs tracking-[0.1em] uppercase text-muted-foreground">
                One or more items in this bundle are currently out of stock.
              </p>
            </div>
          )}

          {/* Promo code */}
          {bundle.promoCode && (
            <div className="mt-6 border border-border px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Use code <span className="font-medium text-foreground tracking-widest">{bundle.promoCode}</span> at checkout to apply bundle savings.
              </p>
            </div>
          )}

          {/* Cart section (client) */}
          {bundle.isAvailable && (
            <div className="mt-8">
              <BundleCartSection bundle={bundle} />
            </div>
          )}
        </div>
      </div>

      {/* Products in bundle */}
      <section>
        <p className="mb-8 text-xs tracking-[0.3em] uppercase text-muted-foreground">
          {bundle.products.length} pieces in this bundle
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 lg:gap-x-6">
          {bundle.products.map((p) => (
            <Link key={p.id} href={`/product/${p.slug}`} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                {p.primaryImage ? (
                  <Image
                    src={p.primaryImage}
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-muted" />
                )}
              </div>
              <div className="mt-3 space-y-1">
                <p className="text-xs tracking-[0.15em] uppercase text-foreground leading-relaxed">{p.name}</p>
                <p className="text-xs text-muted-foreground">{formatPriceCents(p.basePriceCents)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
