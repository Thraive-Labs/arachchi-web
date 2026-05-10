import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublishedJournalArticles } from "@/lib/db/queries/content";

export const metadata: Metadata = {
  title: "Journal — Arachchi",
  description: "Stories, perspectives, and notes from the studio.",
};

export default async function JournalPage() {
  const articles = await getPublishedJournalArticles();

  return (
    <main className="pt-24 pb-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
            From the studio
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-light tracking-wide">Journal</h1>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground">No articles yet. Check back soon.</p>
          </div>
        ) : (
          <>
            {/* Featured first article */}
            {articles[0] && (
              <Link href={`/journal/${articles[0].slug}`} className="group block mb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="aspect-[4/3] bg-muted overflow-hidden">
                    {articles[0].coverImageUrl && (
                      <Image
                        src={articles[0].coverImageUrl}
                        alt={articles[0].title}
                        width={800}
                        height={600}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                      />
                    )}
                  </div>
                  <div className="space-y-4">
                    <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
                      {articles[0].publishedAt
                        ? new Date(articles[0].publishedAt).toLocaleDateString("en-CA", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : ""}
                    </p>
                    <h2 className="font-serif text-3xl font-light tracking-wide group-hover:opacity-70 transition-opacity">
                      {articles[0].title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">{articles[0].excerpt}</p>
                    <span className="text-xs tracking-[0.15em] uppercase text-foreground border-b border-foreground pb-0.5">
                      Read
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* Remaining articles grid */}
            {articles.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.slice(1).map((article) => (
                  <Link key={article.id} href={`/journal/${article.slug}`} className="group block">
                    <div className="aspect-[4/3] bg-muted overflow-hidden mb-4">
                      {article.coverImageUrl && (
                        <Image
                          src={article.coverImageUrl}
                          alt={article.title}
                          width={600}
                          height={450}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                        />
                      )}
                    </div>
                    <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString("en-CA", {
                            year: "numeric",
                            month: "long",
                          })
                        : ""}
                    </p>
                    <h2 className="font-serif text-xl font-light tracking-wide mb-2 group-hover:opacity-70 transition-opacity">
                      {article.title}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
