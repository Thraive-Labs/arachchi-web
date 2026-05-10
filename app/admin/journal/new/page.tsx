import type { Metadata } from "next";
import Link from "next/link";
import { JournalForm } from "../JournalForm";

export const metadata: Metadata = { title: "Admin — New Article" };

export default function NewJournalArticlePage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/journal"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Journal
        </Link>
        <h1 className="font-serif text-2xl font-light tracking-wide">New article</h1>
      </div>
      <JournalForm articleId={null} />
    </div>
  );
}
