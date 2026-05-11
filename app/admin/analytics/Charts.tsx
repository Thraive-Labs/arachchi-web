"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// ── Shared helpers ────────────────────────────────────────────────────────────

function fmtCurrency(cents: number) {
  if (cents >= 100000) return `$${(cents / 100000).toFixed(1)}k`;
  return `$${(cents / 100).toFixed(0)}`;
}

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

const CHART_COLORS = {
  primary:  "#a0845c",
  secondary:"#6b7280",
  tertiary: "#c4a882",
  accent:   "#374151",
};

const CATEGORY_PALETTE = [
  "#a0845c", "#c4a882", "#7c6248", "#d4b896",
  "#6b7280", "#9ca3af", "#4b5563", "#374151",
];

const CustomTooltipStyle = {
  contentStyle: {
    background: "hsl(var(--background))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 0,
    fontSize: 11,
    color: "hsl(var(--foreground))",
  },
  itemStyle: { color: "hsl(var(--foreground))" },
  labelStyle: { color: "hsl(var(--muted-foreground))", marginBottom: 4 },
};

// ── Revenue + Orders combo line chart ────────────────────────────────────────

interface RevOrderRow {
  day: string;
  revenue_cents: number;
  order_count: number;
}

export function RevenueOrdersChart({ data, days }: { data: RevOrderRow[]; days: number }) {
  // Fill missing days
  const filled: RevOrderRow[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const found = data.find((r) => r.day.slice(0, 10) === key);
    filled.push({ day: key, revenue_cents: found?.revenue_cents ?? 0, order_count: found?.order_count ?? 0 });
  }

  const formatted = filled.map((r) => ({
    ...r,
    label: fmtDate(r.day),
    revenue: r.revenue_cents / 100,
  }));

  const tickEvery = days <= 7 ? 1 : days <= 30 ? 7 : 14;

  if (data.length === 0) return <EmptyState />;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={formatted} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
          interval={tickEvery - 1}
        />
        <YAxis
          yAxisId="rev"
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={fmtCurrency}
          width={48}
        />
        <YAxis
          yAxisId="ord"
          orientation="right"
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
          width={28}
        />
        <Tooltip
          {...CustomTooltipStyle}
          formatter={(value: number, name: string) =>
            name === "Revenue" ? [`$${value.toFixed(2)}`, "Revenue"] : [value, "Orders"]
          }
          labelFormatter={(l) => l}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line
          yAxisId="rev"
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke={CHART_COLORS.primary}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3 }}
        />
        <Line
          yAxisId="ord"
          type="monotone"
          dataKey="order_count"
          name="Orders"
          stroke={CHART_COLORS.secondary}
          strokeWidth={1.5}
          strokeDasharray="4 2"
          dot={false}
          activeDot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Customer growth area chart ────────────────────────────────────────────────

interface CustomerRow { day: string; new_customers: number }

export function CustomerGrowthChart({ data, days }: { data: CustomerRow[]; days: number }) {
  const filled: CustomerRow[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const found = data.find((r) => r.day.slice(0, 10) === key);
    filled.push({ day: key, new_customers: found?.new_customers ?? 0 });
  }

  let running = 0;
  const formatted = filled.map((r) => {
    running += r.new_customers;
    return { label: fmtDate(r.day), new_customers: r.new_customers, cumulative: running };
  });

  const tickEvery = days <= 7 ? 1 : days <= 30 ? 7 : 14;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={formatted} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={CHART_COLORS.tertiary} stopOpacity={0.3} />
            <stop offset="95%" stopColor={CHART_COLORS.tertiary} stopOpacity={0}   />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
          interval={tickEvery - 1}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          width={28}
        />
        <Tooltip {...CustomTooltipStyle} labelFormatter={(l) => l} />
        <Area
          type="monotone"
          dataKey="new_customers"
          name="New customers"
          stroke={CHART_COLORS.tertiary}
          strokeWidth={2}
          fill="url(#custGrad)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Order status donut ────────────────────────────────────────────────────────

const STATUS_COLORS_MAP: Record<string, string> = {
  pending:   "#f59e0b",
  paid:      "#3b82f6",
  fulfilled: "#6366f1",
  shipped:   "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
  refunded:  "#6b7280",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending", paid: "Processing", fulfilled: "Fulfilled",
  shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled", refunded: "Refunded",
};

interface StatusRow { status: string; total: number }

export function OrderStatusDonut({ data }: { data: StatusRow[] }) {
  const formatted = data.map((d) => ({
    name:  STATUS_LABELS[d.status] ?? d.status,
    value: d.total,
    color: STATUS_COLORS_MAP[d.status] ?? "#9ca3af",
  }));

  const total = formatted.reduce((s, d) => s + d.value, 0);

  if (total === 0) return <EmptyState />;

  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie
            data={formatted}
            cx="50%"
            cy="50%"
            innerRadius={44}
            outerRadius={64}
            dataKey="value"
            paddingAngle={2}
          >
            {formatted.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            {...CustomTooltipStyle}
            formatter={(v: number) => [v, ""]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-1.5 flex-1 min-w-0">
        {formatted.map((d) => (
          <div key={d.name} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.color }} />
              <span className="text-xs text-muted-foreground truncate">{d.name}</span>
            </div>
            <span className="text-xs font-medium text-foreground shrink-0">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Revenue by category horizontal bar ───────────────────────────────────────

interface CategoryRow { categoryName: string; revenueCents: number; orderCount: number }

export function CategoryRevenueChart({ data }: { data: CategoryRow[] }) {
  if (data.length === 0) return <EmptyState />;

  const formatted = data.map((d, i) => ({
    name:    d.categoryName,
    revenue: d.revenueCents / 100,
    orders:  d.orderCount,
    color:   CATEGORY_PALETTE[i % CATEGORY_PALETTE.length],
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, formatted.length * 36)}>
      <BarChart
        layout="vertical"
        data={formatted}
        margin={{ top: 0, right: 48, bottom: 0, left: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={fmtCurrency}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
          tickLine={false}
          axisLine={false}
          width={90}
        />
        <Tooltip
          {...CustomTooltipStyle}
          formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]}
        />
        <Bar dataKey="revenue" radius={[0, 2, 2, 0]} maxBarSize={20}>
          {formatted.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Revenue by day of week ────────────────────────────────────────────────────

const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface DowRow { dow: number; revenue_cents: number; order_count: number }

export function DayOfWeekChart({ data }: { data: DowRow[] }) {
  const all = Array.from({ length: 7 }, (_, i) => {
    const found = data.find((d) => d.dow === i);
    return {
      day: DOW_LABELS[i],
      revenue: (found?.revenue_cents ?? 0) / 100,
      orders:  found?.order_count ?? 0,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={all} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={fmtCurrency}
          width={44}
        />
        <Tooltip
          {...CustomTooltipStyle}
          formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]}
        />
        <Bar dataKey="revenue" fill={CHART_COLORS.primary} radius={[2, 2, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Shared empty state ────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex h-32 items-center justify-center">
      <p className="text-sm text-muted-foreground">No data for this period.</p>
    </div>
  );
}
