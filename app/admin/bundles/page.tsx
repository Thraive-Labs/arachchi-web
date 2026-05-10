import Link from "next/link";
import { getAllBundlesAdmin } from "@/lib/db/queries/bundles";
import { formatPriceCents } from "@/lib/utils";

export const metadata = { title: "Bundles — Admin" };

export default async function AdminBundlesPage() {
  const bundleList = await getAllBundlesAdmin();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-light tracking-wide">Bundles</h1>
        <Link
          href="/admin/bundles/new"
          className="border border-foreground bg-foreground px-4 py-2 text-xs tracking-[0.15em] uppercase text-background transition-opacity hover:opacity-80"
        >
          New bundle
        </Link>
      </div>

      {bundleList.length === 0 ? (
        <p className="text-sm text-muted-foreground">No bundles yet.</p>
      ) : (
        <div className="divide-y divide-border border border-border">
          {bundleList.map((bundle) => (
            <div key={bundle.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm text-foreground">{bundle.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatPriceCents(bundle.finalPriceCents)}
                  {bundle.promoCode && ` · Code: ${bundle.promoCode}`}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs tracking-[0.1em] uppercase ${bundle.isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {bundle.isActive ? "Active" : "Inactive"}
                </span>
                <Link
                  href={`/admin/bundles/${bundle.id}`}
                  className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
