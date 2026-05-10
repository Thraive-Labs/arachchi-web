import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getLookbookEntryBySlug } from "@/lib/db/queries/content";
import { formatPriceCents } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getLookbookEntryBySlug(slug);
  if (!entry) return { title: "Lookbook — Arachchi" };
  return {
    title: `${entry.title} — Arachchi Lookbook`,
    description: entry.body.replace(/<[^>]+>/g, "").slice(0, 160),
    openGraph: { images: entry.coverImageUrl ? [{ url: entry.coverImageUrl }] : [] },
  };
}

export default async function LookbookEntryPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = await getLookbookEntryBySlug(slug);
  if (!entry) notFound();

  return (
    <main className="pt-24 pb-32">
      {/* Hero cover */}
      <div className="relative h-[80vh] min-h-[500px] mb-20 bg-muted overflow-hidden">
        {entry.coverImageUrl && (
          <Image
            src={entry.coverImageUrl}
            alt={entry.title}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-foreground/30" />
        <div className="absolute bottom-10 left-10">
          <h1 className="font-serif text-5xl md:text-6xl font-light tracking-wide text-background">
            {entry.title}
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {/* Description */}
        {entry.body && (
          <div
            className="max-w-2xl mx-auto text-center mb-20 prose prose-neutral [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:text-lg"
            dangerouslySetInnerHTML={{ __html: entry.body }}
          />
        )}

        {/* Shoppable products */}
        {entry.linkedProducts.length > 0 && (
          <section>
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground text-center mb-10">
              Shop this look
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {entry.linkedProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="group block"
                >
                  <div className="aspect-[3/4] bg-muted overflow-hidden mb-3">
                    {product.primaryImage && (
                      <Image
                        src={product.primaryImage}
                        alt={product.name}
                        width={400}
                        height={533}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      />
                    )}
                  </div>
                  <p className="text-sm text-foreground group-hover:opacity-70 transition-opacity">
                    {product.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatPriceCents(product.basePriceCents)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Back */}
        <div className="mt-20 pt-8 border-t border-border">
          <Link
            href="/lookbook"
            className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; All looks
          </Link>
        </div>
      </div>
    </main>
  );
}
