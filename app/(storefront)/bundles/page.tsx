import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getActiveBundles } from "@/lib/db/queries/bundles";
import { formatPriceCents } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bundles",
  description: "Curated sets from Arachchi — complete looks at a special price.",
};

export default async function BundlesPage() {
  const bundleList = await getActiveBundles();

  return (
    <div className="mx-auto max-w-[1440px] px-6 pt-32 pb-24 lg:px-8">
      <div className="mb-16 max-w-lg">
        <p className="mb-3 text-xs tracking-[0.3em] uppercase text-muted-foreground">Collections</p>
        <h1 className="font-serif text-4xl font-light tracking-wide text-foreground">Bundles</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Complete looks, thoughtfully assembled. Each bundle is priced below individual retail.
        </p>
      </div>

      {bundleList.length === 0 ? (
        <p className="text-sm text-muted-foreground">No bundles available right now.</p>
      ) : (
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
          {bundleList.map((bundle) => (
            <Link key={bundle.id} href={`/bundles/${bundle.slug}`} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                {bundle.coverImageUrl ? (
                  <Image
                    src={bundle.coverImageUrl}
                    alt={bundle.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                    <span className="font-display text-4xl font-light tracking-[0.5em] text-foreground/20">A</span>
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-xs tracking-[0.2em] uppercase text-foreground">{bundle.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{bundle.description}</p>
                <p className="pt-1 text-sm text-foreground">{formatPriceCents(bundle.finalPriceCents)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
