import type { Metadata } from "next";
import Link from "next/link";
import { getAdminJournalArticles } from "@/lib/db/queries/content";
import { deleteJournalArticleAction } from "@/app/actions/content";

export const metadata: Metadata = { title: "Admin — Journal" };

export default async function AdminJournalPage() {
  const articles = await getAdminJournalArticles();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-2xl font-light tracking-wide">Journal</h1>
        <Link
          href="/admin/journal/new"
          className="border border-foreground bg-foreground px-6 py-2.5 text-xs tracking-[0.15em] uppercase text-background hover:opacity-80 transition-opacity"
        >
          New article
        </Link>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-xs tracking-[0.1em] uppercase text-muted-foreground">
            <th className="pb-3 text-left font-normal">Title</th>
            <th className="pb-3 text-center font-normal">Status</th>
            <th className="pb-3 text-right font-normal">Published</th>
            <th className="pb-3 text-right font-normal">Updated</th>
            <th className="pb-3 text-right font-normal"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {articles.length === 0 && (
            <tr>
              <td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                No articles yet.
              </td>
            </tr>
          )}
          {articles.map((a) => (
            <tr key={a.id}>
              <td className="py-3 pr-3 text-foreground">{a.title}</td>
              <td className="py-3 text-center">
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    a.status === "published"
                      ? "bg-green-50 text-green-800"
                      : "bg-yellow-50 text-yellow-800"
                  }`}
                >
                  {a.status}
                </span>
              </td>
              <td className="py-3 text-right text-muted-foreground text-xs">
                {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("en-CA") : "—"}
              </td>
              <td className="py-3 text-right text-muted-foreground text-xs">
                {new Date(a.updatedAt).toLocaleDateString("en-CA")}
              </td>
              <td className="py-3 text-right">
                <div className="flex items-center justify-end gap-3">
                  <Link
                    href={`/admin/journal/${a.id}`}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Edit
                  </Link>
                  {a.status === "published" && (
                    <Link
                      href={`/journal/${a.slug}`}
                      target="_blank"
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      View
                    </Link>
                  )}
                  <form action={deleteJournalArticleAction}>
                    <input type="hidden" name="articleId" value={a.id} />
                    <button
                      type="submit"
                      className="text-xs text-muted-foreground hover:text-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
