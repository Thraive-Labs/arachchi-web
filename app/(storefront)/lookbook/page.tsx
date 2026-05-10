import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublishedLookbookEntries } from "@/lib/db/queries/content";

export const metadata: Metadata = {
  title: "Lookbook — Arachchi",
  description: "Editorial spreads from the studio. Each look, shoppable.",
};

export default async function LookbookPage() {
  const entries = await getPublishedLookbookEntries();

  return (
    <main className="pt-24 pb-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
            The looks
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-light tracking-wide">Lookbook</h1>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground">Coming soon.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, i) => (
              <Link
                key={entry.id}
                href={`/lookbook/${entry.slug}`}
                className="group block relative overflow-hidden"
                style={{ aspectRatio: i === 0 ? "16/9" : "3/1" }}
              >
                <div className="absolute inset-0 bg-muted">
                  {entry.coverImageUrl && (
                    <Image
                      src={entry.coverImageUrl}
                      alt={entry.title}
                      fill
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
                    />
                  )}
                </div>
                <div className="absolute inset-0 bg-foreground/20 group-hover:bg-foreground/30 transition-colors" />
                <div className="absolute bottom-6 left-8">
                  <p className="font-serif text-2xl font-light tracking-wide text-background">
                    {entry.title}
                  </p>
                  <p className="text-xs tracking-[0.15em] uppercase text-background/70 mt-1">
                    View look
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
