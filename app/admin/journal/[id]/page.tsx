import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAdminJournalArticleById } from "@/lib/db/queries/content";
import { JournalForm } from "../JournalForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const article = await getAdminJournalArticleById(id);
  return { title: article ? `Admin — ${article.title}` : "Admin — Article" };
}

export default async function EditJournalArticlePage({ params }: PageProps) {
  const { id } = await params;
  const article = await getAdminJournalArticleById(id);
  if (!article) notFound();

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/journal"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Journal
        </Link>
        <h1 className="font-serif text-2xl font-light tracking-wide">{article.title}</h1>
        {article.status === "published" && (
          <Link
            href={`/journal/${article.slug}`}
            target="_blank"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View &rarr;
          </Link>
        )}
      </div>
      <JournalForm articleId={id} initialArticle={article} />
    </div>
  );
}
