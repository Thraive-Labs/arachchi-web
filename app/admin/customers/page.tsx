import type { Metadata } from "next";
import Link from "next/link";
import { getAdminCustomers } from "@/lib/db/queries/admin";
import { RoleSelector } from "@/components/admin/RoleSelector";

export const metadata: Metadata = { title: "Admin — Customers" };

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function AdminCustomersPage({ searchParams }: PageProps) {
  const { q, page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const { customers, total } = await getAdminCustomers({
    search: q,
    page: currentPage,
    limit: 30,
  });
  const totalPages = Math.ceil(total / 30);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-2xl font-light tracking-wide">Customers</h1>
        <span className="text-xs text-muted-foreground">{total} total</span>
      </div>

      <form method="GET" className="flex gap-3 mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name or email..."
          className="border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground flex-1 max-w-sm"
        />
        <button
          type="submit"
          className="border border-foreground bg-foreground px-5 py-2 text-xs tracking-[0.15em] uppercase text-background hover:opacity-80 transition-opacity"
        >
          Search
        </button>
        {q && (
          <Link
            href="/admin/customers"
            className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors self-center"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="overflow-x-auto -mx-5 px-5 lg:mx-0 lg:px-0">
      <table className="w-full min-w-[680px] text-sm">
        <thead>
          <tr className="border-b border-border text-xs tracking-[0.1em] uppercase text-muted-foreground">
            <th className="pb-3 text-left font-normal">Name</th>
            <th className="pb-3 text-left font-normal">Email</th>
            <th className="pb-3 text-left font-normal">Role</th>
            <th className="pb-3 text-center font-normal">Orders</th>
            <th className="pb-3 text-right font-normal">Spent</th>
            <th className="pb-3 text-right font-normal">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {customers.length === 0 && (
            <tr>
              <td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                No customers found.
              </td>
            </tr>
          )}
          {customers.map((c) => (
            <tr key={c.id}>
              <td className="py-3 pr-3 text-foreground">{c.fullName ?? "—"}</td>
              <td className="py-3 pr-3 text-muted-foreground text-xs">{c.email}</td>
              <td className="py-3 pr-3">
                <RoleSelector
                  userId={c.id}
                  currentRole={c.role as "customer" | "staff" | "admin"}
                />
              </td>
              <td className="py-3 text-center text-muted-foreground">{c.orderCount}</td>
              <td className="py-3 text-right text-foreground">
                {c.totalSpentCents > 0
                  ? `$${(c.totalSpentCents / 100).toFixed(2)}`
                  : "—"}
              </td>
              <td className="py-3 text-right text-muted-foreground text-xs">
                {new Date(c.createdAt).toLocaleDateString("en-CA")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={buildHref({ q, page: currentPage - 1 })}
                className="border border-border px-4 py-1.5 text-xs text-foreground hover:bg-muted transition-colors"
              >
                Previous
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={buildHref({ q, page: currentPage + 1 })}
                className="border border-border px-4 py-1.5 text-xs text-foreground hover:bg-muted transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function buildHref({ q, page }: { q?: string; page: number }) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  params.set("page", String(page));
  return `/admin/customers?${params.toString()}`;
}
