import type { Metadata } from "next";
import Link from "next/link";
import { getDashboardStats } from "@/lib/db/queries/admin";
import { formatPriceCents } from "@/lib/utils";
import { RevenueChart } from "./RevenueChart";

export const metadata: Metadata = { title: "Admin — Dashboard" };

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-800 border-yellow-200",
  paid: "bg-blue-50 text-blue-800 border-blue-200",
  fulfilled: "bg-indigo-50 text-indigo-800 border-indigo-200",
  shipped: "bg-purple-50 text-purple-800 border-purple-200",
  delivered: "bg-green-50 text-green-800 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  refunded: "bg-gray-100 text-gray-700 border-gray-200",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  paid: "Processing",
  fulfilled: "Fulfilled",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

function pct(val: number | null) {
  if (val === null) return null;
  return val > 0 ? `+${val}%` : `${val}%`;
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const {
    todayRevenueCents,
    weekRevenueCents,
    monthRevenueCents,
    revenueChangePercent,
    allTimeRevenueCents,
    allTimeOrderCount,
    monthOrderCount,
    avgOrderValueCents,
    totalCustomers,
    newCustomers30d,
    activeProducts,
    newsletterSubscribers,
    statusCounts,
    recentOrders,
    lowStock,
    topViewed,
    topSelling,
    revenueByDay,
  } = stats;

  const now = new Date();
  const todayLabel = now.toLocaleDateString("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-serif text-2xl font-light tracking-wide">Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-1">{todayLabel}</p>
        </div>
        <Link
          href="/admin/orders"
          className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          All orders &rarr;
        </Link>
      </div>

      {/* Top metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Today"
          value={formatPriceCents(todayRevenueCents)}
          sub="revenue"
        />
        <MetricCard
          label="This month"
          value={formatPriceCents(monthRevenueCents)}
          sub={
            revenueChangePercent !== null ? (
              <span className={revenueChangePercent >= 0 ? "text-green-700" : "text-red-600"}>
                {pct(revenueChangePercent)} vs last month
              </span>
            ) : (
              "revenue"
            )
          }
        />
        <MetricCard
          label="Avg order"
          value={formatPriceCents(avgOrderValueCents)}
          sub={`${monthOrderCount} orders this month`}
        />
        <MetricCard
          label="All time"
          value={formatPriceCents(allTimeRevenueCents)}
          sub={`${allTimeOrderCount} total orders`}
        />
      </div>

      {/* Revenue chart */}
      <section className="border border-border p-5">
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
            Daily revenue — last 30 days
          </p>
          <p className="text-sm font-light text-foreground">{formatPriceCents(weekRevenueCents)} this week</p>
        </div>
        <RevenueChart data={revenueByDay} />
      </section>

      {/* Order status row */}
      <section>
        <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
          Orders by status
        </p>
        <div className="flex flex-wrap gap-2">
          {statusCounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            statusCounts.map((s) => (
              <Link
                key={s.status}
                href={`/admin/orders?status=${s.status}`}
                className={`border px-4 py-2 text-xs transition-opacity hover:opacity-70 ${STATUS_COLORS[s.status] ?? "bg-muted text-foreground border-border"}`}
              >
                {STATUS_LABELS[s.status] ?? s.status}
                <span className="ml-2 font-semibold">{s.total}</span>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Three-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <section className="lg:col-span-2 border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
              Recent orders
            </p>
            <Link
              href="/admin/orders"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="px-5 py-8 text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {recentOrders.map((o) => (
                <Link
                  key={o.id}
                  href={`/admin/orders/${o.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-mono text-foreground">{o.orderNumber}</p>
                    <p className="text-xs text-muted-foreground truncate">{o.email}</p>
                  </div>
                  <div className="flex items-center gap-4 ml-4 shrink-0">
                    <span
                      className={`text-xs px-2 py-0.5 rounded border ${STATUS_COLORS[o.status] ?? "bg-muted text-foreground border-border"}`}
                    >
                      {STATUS_LABELS[o.status] ?? o.status}
                    </span>
                    <span className="text-sm text-foreground font-light w-20 text-right">
                      {formatPriceCents(o.totalCents)}
                    </span>
                    <span className="text-xs text-muted-foreground w-20 text-right">
                      {new Date(o.createdAt).toLocaleDateString("en-CA")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Right column: summary stats */}
        <div className="space-y-4">
          {/* Customers */}
          <section className="border border-border p-5 space-y-3">
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Customers</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="font-serif text-2xl font-light">{totalCustomers}</p>
                <p className="text-xs text-muted-foreground">total registered</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-green-700">+{newCustomers30d}</p>
                <p className="text-xs text-muted-foreground">this month</p>
              </div>
            </div>
            <Link
              href="/admin/customers"
              className="block text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View customers &rarr;
            </Link>
          </section>

          {/* Catalogue */}
          <section className="border border-border p-5 space-y-3">
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Catalogue</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="font-light text-foreground">{activeProducts}</p>
                <p className="text-xs text-muted-foreground">active products</p>
              </div>
              <div>
                <p className="font-light text-foreground">{newsletterSubscribers}</p>
                <p className="text-xs text-muted-foreground">subscribers</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Bottom row: top sellers + top viewed + low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top selling */}
        <section className="border border-border">
          <div className="px-5 py-4 border-b border-border">
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
              Top selling — 30 days
            </p>
          </div>
          {topSelling.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted-foreground">No sales data yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {topSelling.map((p, i) => (
                <Link
                  key={p.productId}
                  href={`/admin/products/${p.productId}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors"
                >
                  <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{p.productName}</p>
                    <p className="text-xs text-muted-foreground">{p.unitsSold} units</p>
                  </div>
                  <span className="text-sm text-foreground shrink-0">
                    {formatPriceCents(p.revenueCents)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Top viewed */}
        <section className="border border-border">
          <div className="px-5 py-4 border-b border-border">
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
              Top viewed — 7 days
            </p>
          </div>
          {topViewed.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted-foreground">No views recorded yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {topViewed.map((p, i) => (
                <Link
                  key={p.productId}
                  href={`/admin/products/${p.productId}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors"
                >
                  <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                  <p className="flex-1 text-sm text-foreground truncate">{p.productName}</p>
                  <span className="text-xs text-muted-foreground shrink-0">{p.viewCount} views</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Low stock */}
        <section className="border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Low stock</p>
            <Link
              href="/admin/inventory?low=1"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Inventory &rarr;
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted-foreground">All variants well-stocked.</p>
          ) : (
            <div className="divide-y divide-border">
              {lowStock.map((v) => (
                <Link
                  key={v.variantId}
                  href={`/admin/products/${v.productId}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground truncate">{v.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {[v.size, v.color].filter(Boolean).join(" / ") || v.sku || "—"}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium ml-3 shrink-0 ${v.stockQuantity === 0 ? "text-red-600" : "text-amber-600"}`}
                  >
                    {v.stockQuantity === 0 ? "Out" : `${v.stockQuantity} left`}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
}) {
  return (
    <div className="border border-border p-5">
      <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">{label}</p>
      <p className="font-serif text-2xl font-light text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}
