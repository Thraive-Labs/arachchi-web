import type { Metadata } from "next";
import { getAnalytics, type AnalyticsPeriod } from "@/lib/db/queries/admin";
import { formatPriceCents } from "@/lib/utils";
import {
  RevenueOrdersChart,
  CustomerGrowthChart,
  OrderStatusDonut,
  CategoryRevenueChart,
  DayOfWeekChart,
} from "./Charts";
import { PeriodSelector } from "./PeriodSelector";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — Analytics" };

interface PageProps {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}

export default async function AdminAnalyticsPage({ searchParams }: PageProps) {
  const { period: rawPeriod, from: rawFrom, to: rawTo } = await searchParams;

  const isCustom = rawPeriod === "custom";
  const period: AnalyticsPeriod =
    rawPeriod === "7d" || rawPeriod === "30d" || rawPeriod === "90d" || rawPeriod === "all"
      ? rawPeriod
      : "30d";

  const fromDate = rawFrom ? new Date(rawFrom) : undefined;
  const toDate   = rawTo   ? new Date(rawTo)   : undefined;

  const { kpi, revenueByDay, customersByDay, categoryData, dowData, statusData, dayCount } =
    await getAnalytics(period, fromDate, toDate);

  const periodLabel = isCustom
    ? `${rawFrom} → ${rawTo}`
    : period === "all"
    ? "All time"
    : `Last ${period}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-light tracking-wide">Analytics</h1>
          <p className="text-xs text-muted-foreground mt-1">{periodLabel}</p>
        </div>
        <PeriodSelector
          period={isCustom ? "custom" : period}
          from={rawFrom}
          to={rawTo}
        />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Revenue"       value={formatPriceCents(kpi.revenue_cents)} sub={periodLabel} />
        <KpiCard label="Orders"        value={String(kpi.order_count)} sub={kpi.order_count > 0 ? `avg ${formatPriceCents(kpi.avg_order_cents)} / order` : "no paid orders"} />
        <KpiCard label="New customers" value={String(kpi.newCustomers)} sub={periodLabel} />
        <KpiCard label="Avg order"     value={formatPriceCents(kpi.avg_order_cents)} sub={`from ${kpi.order_count} paid orders`} />
      </div>

      {/* Revenue & Orders over time */}
      <ChartCard title="Revenue & orders over time">
        <RevenueOrdersChart data={revenueByDay} days={dayCount} />
      </ChartCard>

      {/* Two-column row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="New customer signups">
          <CustomerGrowthChart data={customersByDay} days={dayCount} />
        </ChartCard>
        <ChartCard title="Orders by status">
          <OrderStatusDonut data={statusData} />
        </ChartCard>
      </div>

      {/* Two-column row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Revenue by category">
          <CategoryRevenueChart data={categoryData} />
        </ChartCard>
        <ChartCard title="Revenue by day of week">
          <DayOfWeekChart data={dowData} />
        </ChartCard>
      </div>

      {/* Category table */}
      <section className="border border-border">
        <div className="px-5 py-4 border-b border-border">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
            Revenue by category — {periodLabel}
          </p>
        </div>
        {categoryData.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">No sales data for this period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-border text-xs tracking-[0.1em] uppercase text-muted-foreground">
                  <th className="px-5 pb-3 pt-4 text-left font-normal">Category</th>
                  <th className="px-5 pb-3 pt-4 text-right font-normal">Revenue</th>
                  <th className="px-5 pb-3 pt-4 text-right font-normal">Orders</th>
                  <th className="px-5 pb-3 pt-4 text-right font-normal">Avg / order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categoryData.map((row, i) => (
                  <tr key={i} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3 text-foreground">{row.categoryName}</td>
                    <td className="px-5 py-3 text-right font-medium">{formatPriceCents(row.revenueCents)}</td>
                    <td className="px-5 py-3 text-right text-muted-foreground">{row.orderCount}</td>
                    <td className="px-5 py-3 text-right text-muted-foreground">
                      {row.orderCount > 0 ? formatPriceCents(Math.round(row.revenueCents / row.orderCount)) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border border-border p-5">
      <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">{label}</p>
      <p className="font-serif text-2xl font-light text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-border p-5">
      <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-5">{title}</p>
      {children}
    </section>
  );
}
