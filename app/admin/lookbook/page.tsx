import type { Metadata } from "next";
import Link from "next/link";
import { getAdminLookbookEntries } from "@/lib/db/queries/content";
import { deleteLookbookEntryAction } from "@/app/actions/content";

export const metadata: Metadata = { title: "Admin — Lookbook" };

export default async function AdminLookbookPage() {
  const entries = await getAdminLookbookEntries();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-2xl font-light tracking-wide">Lookbook</h1>
        <Link
          href="/admin/lookbook/new"
          className="border border-foreground bg-foreground px-6 py-2.5 text-xs tracking-[0.15em] uppercase text-background hover:opacity-80 transition-opacity"
        >
          New entry
        </Link>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-xs tracking-[0.1em] uppercase text-muted-foreground">
            <th className="pb-3 text-left font-normal">Title</th>
            <th className="pb-3 text-center font-normal">Pos</th>
            <th className="pb-3 text-center font-normal">Active</th>
            <th className="pb-3 text-right font-normal">Created</th>
            <th className="pb-3 text-right font-normal"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {entries.length === 0 && (
            <tr>
              <td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                No lookbook entries yet.
              </td>
            </tr>
          )}
          {entries.map((e) => (
            <tr key={e.id}>
              <td className="py-3 pr-3 text-foreground">{e.title}</td>
              <td className="py-3 text-center text-muted-foreground">{e.position}</td>
              <td className="py-3 text-center">
                {e.isActive ? (
                  <span className="text-xs text-foreground">Yes</span>
                ) : (
                  <span className="text-xs text-muted-foreground">No</span>
                )}
              </td>
              <td className="py-3 text-right text-muted-foreground text-xs">
                {new Date(e.createdAt).toLocaleDateString("en-CA")}
              </td>
              <td className="py-3 text-right">
                <div className="flex items-center justify-end gap-3">
                  <Link
                    href={`/admin/lookbook/${e.id}`}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Edit
                  </Link>
                  {e.isActive && (
                    <Link
                      href={`/lookbook/${e.slug}`}
                      target="_blank"
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      View
                    </Link>
                  )}
                  <form action={deleteLookbookEntryAction}>
                    <input type="hidden" name="entryId" value={e.id} />
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
