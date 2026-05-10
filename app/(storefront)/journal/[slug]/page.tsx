import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getJournalArticleBySlug } from "@/lib/db/queries/content";
import { ReadingProgress } from "@/components/journal/ReadingProgress";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getJournalArticleBySlug(slug);
  if (!article) return { title: "Journal — Arachchi" };
  return {
    title: article.seoTitle ?? `${article.title} — Arachchi`,
    description: article.seoDescription ?? article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.coverImageUrl ? [{ url: article.coverImageUrl }] : [],
    },
  };
}

export default async function JournalArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getJournalArticleBySlug(slug);
  if (!article) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arachchi.com";
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.coverImageUrl,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    publisher: {
      "@type": "Organization",
      name: "Arachchi",
      url: baseUrl,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${baseUrl}/journal/${slug}` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <ReadingProgress />
    <main className="pt-24 pb-32">
      {/* Cover image */}
      <div className="relative h-[60vh] min-h-[400px] mb-16 bg-muted overflow-hidden">
        {article.coverImageUrl && (
          <Image
            src={article.coverImageUrl}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        )}
      </div>

      <article className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <header className="mb-12 text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-6">
            {article.publishedAt
              ? new Date(article.publishedAt).toLocaleDateString("en-CA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : ""}
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-light tracking-wide mb-6">
            {article.title}
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">{article.excerpt}</p>
        </header>

        {/* Body */}
        <div
          className="prose prose-neutral max-w-none [&_h1]:font-serif [&_h1]:font-light [&_h1]:tracking-wide [&_h2]:font-serif [&_h2]:font-light [&_h2]:tracking-wide [&_h3]:font-serif [&_h3]:font-light [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_a]:text-foreground [&_a]:underline [&_img]:rounded"
          dangerouslySetInnerHTML={{ __html: article.body }}
        />

        {/* Back link */}
        <div className="mt-16 pt-8 border-t border-border">
          <Link
            href="/journal"
            className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; All articles
          </Link>
        </div>
      </article>
    </main>
    </>
  );
}
