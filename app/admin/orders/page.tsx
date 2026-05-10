import type { Metadata } from "next";
import Link from "next/link";
import { getAdminOrders } from "@/lib/db/queries/admin";

export const metadata: Metadata = { title: "Admin — Orders" };

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];

interface PageProps {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const { status, q, page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const { rows: orders, total } = await getAdminOrders({ status, search: q, page: currentPage, limit: 30 });
  const totalPages = Math.ceil(total / 30);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-2xl font-light tracking-wide">Orders</h1>
        <span className="text-xs text-muted-foreground">{total} total</span>
      </div>

      <form method="GET" className="flex gap-3 mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search order # or email..."
          className="border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground flex-1 max-w-xs"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="border border-foreground bg-foreground px-5 py-2 text-xs tracking-[0.15em] uppercase text-background hover:opacity-80 transition-opacity"
        >
          Filter
        </button>
        {(q || status) && (
          <Link
            href="/admin/orders"
            className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors self-center"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="overflow-x-auto -mx-5 px-5 lg:mx-0 lg:px-0">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-border text-xs tracking-[0.1em] uppercase text-muted-foreground">
            <th className="pb-3 text-left font-normal">Order</th>
            <th className="pb-3 text-left font-normal">Customer</th>
            <th className="pb-3 text-left font-normal">Date</th>
            <th className="pb-3 text-center font-normal">Status</th>
            <th className="pb-3 text-right font-normal">Total</th>
            <th className="pb-3 text-right font-normal"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orders.length === 0 && (
            <tr>
              <td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                No orders found.
              </td>
            </tr>
          )}
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="py-3 pr-3 font-mono text-xs text-foreground">{order.orderNumber}</td>
              <td className="py-3 pr-3 text-muted-foreground">{order.email ?? "—"}</td>
              <td className="py-3 pr-3 text-muted-foreground text-xs">
                {new Date(order.createdAt).toLocaleDateString("en-CA")}
              </td>
              <td className="py-3 text-center">
                <StatusPill status={order.status} />
              </td>
              <td className="py-3 text-right text-foreground">
                ${(order.totalCents / 100).toFixed(2)}
              </td>
              <td className="py-3 text-right">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  View
                </Link>
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
              <PaginationLink
                href={buildHref({ q, status, page: currentPage - 1 })}
                label="Previous"
              />
            )}
            {currentPage < totalPages && (
              <PaginationLink
                href={buildHref({ q, status, page: currentPage + 1 })}
                label="Next"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-800",
    processing: "bg-blue-50 text-blue-800",
    shipped: "bg-purple-50 text-purple-800",
    delivered: "bg-green-50 text-green-800",
    cancelled: "bg-red-50 text-red-700",
    refunded: "bg-gray-100 text-gray-700",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs tracking-wide ${styles[status] ?? "bg-gray-100 text-gray-700"}`}
    >
      {status}
    </span>
  );
}

function PaginationLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="border border-border px-4 py-1.5 text-xs text-foreground hover:bg-muted transition-colors"
    >
      {label}
    </Link>
  );
}

function buildHref({
  q,
  status,
  page,
}: {
  q?: string;
  status?: string;
  page: number;
}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  params.set("page", String(page));
  return `/admin/orders?${params.toString()}`;
}
