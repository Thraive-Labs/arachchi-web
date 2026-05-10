import Link from "next/link";
import { db } from "@/lib/db/client";
import { discounts } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { formatPriceCents } from "@/lib/utils";

export const metadata = { title: "Discounts — Admin" };

export default async function AdminDiscountsPage() {
  const rows = await db.select().from(discounts).orderBy(desc(discounts.createdAt));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-light tracking-wide">Discount codes</h1>
        <Link
          href="/admin/discounts/new"
          className="border border-foreground bg-foreground px-4 py-2 text-xs tracking-[0.15em] uppercase text-background transition-opacity hover:opacity-80"
        >
          New code
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No discount codes yet.</p>
      ) : (
        <div className="divide-y divide-border border border-border">
          {rows.map((d) => (
            <div key={d.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <span className="font-mono text-sm tracking-widest text-foreground">{d.code}</span>
              <span className="text-xs text-muted-foreground">
                {d.type === "percentage" ? `${d.value}% off` : d.type === "fixed" ? `${formatPriceCents(d.value)} off` : "Free shipping"}
              </span>
              {d.minSubtotalCents && (
                <span className="text-xs text-muted-foreground">Min {formatPriceCents(d.minSubtotalCents)}</span>
              )}
              {d.maxUses && (
                <span className="text-xs text-muted-foreground">{d.usesCount}/{d.maxUses} uses</span>
              )}
              {d.endsAt && (
                <span className="text-xs text-muted-foreground">Expires {new Date(d.endsAt).toLocaleDateString("en-CA")}</span>
              )}
              <span className={`ml-auto text-xs tracking-[0.1em] uppercase ${d.isActive ? "text-foreground" : "text-muted-foreground line-through"}`}>
                {d.isActive ? "Active" : "Inactive"}
              </span>
              <Link
                href={`/admin/discounts/${d.id}`}
                className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
