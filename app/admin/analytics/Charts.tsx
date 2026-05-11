"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  BarChart,
  Bar,
  AreaChart,
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

// Editorial palette — warm luxury tones
const ROSE    = "#c97b8e";
const AMBER   = "#d4935a";
const TEAL    = "#6fa8a0";
const PLUM    = "#8f7aab";
const CARAMEL = "#b8935a";
const SLATE   = "#6f8db5";
const SAGE    = "#87a87a";

const CATEGORY_PALETTE = [ROSE, AMBER, TEAL, PLUM, CARAMEL, SLATE, SAGE, "#b57a8f"];

const DOW_COLORS = [ROSE, AMBER, TEAL, PLUM, CARAMEL, SLATE, SAGE];

const STATUS_COLORS_MAP: Record<string, string> = {
  pending:   "#e8a83c",
  paid:      SLATE,
  fulfilled: PLUM,
  shipped:   TEAL,
  delivered: SAGE,
  cancelled: "#c96464",
  refunded:  "#a0a0a0",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending", paid: "Processing", fulfilled: "Fulfilled",
  shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled", refunded: "Refunded",
};

const tooltipStyle = {
  contentStyle: {
    background: "hsl(var(--background))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 0,
    fontSize: 11,
    color: "hsl(var(--foreground))",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  },
  itemStyle: { color: "hsl(var(--foreground))" },
  labelStyle: { color: "hsl(var(--muted-foreground))", marginBottom: 4 },
};

// ── Revenue + Orders combo chart ──────────────────────────────────────────────

interface RevOrderRow {
  day: string;
  revenue_cents: number;
  order_count: number;
}

export function RevenueOrdersChart({ data, days }: { data: RevOrderRow[]; days: number }) {
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
    label:   fmtDate(r.day),
    revenue: r.revenue_cents / 100,
  }));

  const tickEvery = days <= 7 ? 1 : days <= 30 ? 7 : 14;

  if (data.length === 0) return <EmptyState />;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={formatted} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={ROSE} stopOpacity={0.25} />
            <stop offset="95%" stopColor={ROSE} stopOpacity={0}    />
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
          {...tooltipStyle}
          formatter={(value, name) => {
            const v = Number(value);
            return name === "Revenue" ? [`$${v.toFixed(2)}`, "Revenue"] : [v, "Orders"];
          }}
          labelFormatter={(l) => l}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Area
          yAxisId="rev"
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke={ROSE}
          strokeWidth={2}
          fill="url(#revGrad)"
          dot={false}
          activeDot={{ r: 4, fill: ROSE }}
        />
        <Line
          yAxisId="ord"
          type="monotone"
          dataKey="order_count"
          name="Orders"
          stroke={SLATE}
          strokeWidth={1.5}
          strokeDasharray="4 2"
          dot={false}
          activeDot={{ r: 3, fill: SLATE }}
        />
      </ComposedChart>
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

  const formatted = filled.map((r) => ({ label: fmtDate(r.day), new_customers: r.new_customers }));
  const tickEvery = days <= 7 ? 1 : days <= 30 ? 7 : 14;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={formatted} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={TEAL} stopOpacity={0.3} />
            <stop offset="95%" stopColor={TEAL} stopOpacity={0}   />
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
        <Tooltip {...tooltipStyle} labelFormatter={(l) => l} />
        <Area
          type="monotone"
          dataKey="new_customers"
          name="New customers"
          stroke={TEAL}
          strokeWidth={2}
          fill="url(#custGrad)"
          dot={false}
          activeDot={{ r: 4, fill: TEAL }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Order status donut ────────────────────────────────────────────────────────

interface StatusRow { status: string; total: number }

export function OrderStatusDonut({ data }: { data: StatusRow[] }) {
  const formatted = data.map((d) => ({
    name:  STATUS_LABELS[d.status] ?? d.status,
    value: d.total,
    color: STATUS_COLORS_MAP[d.status] ?? "#a0a0a0",
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
          <Tooltip {...tooltipStyle} formatter={(raw) => [Number(raw), ""]} />
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
          {...tooltipStyle}
          formatter={(raw) => [`$${Number(raw).toFixed(2)}`, "Revenue"]}
        />
        <Bar dataKey="revenue" radius={[0, 3, 3, 0]} maxBarSize={22}>
          {formatted.map((entry, i) => (
            <Cell key={i} fill={entry.color} fillOpacity={0.88} />
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
      day:     DOW_LABELS[i],
      revenue: (found?.revenue_cents ?? 0) / 100,
      orders:  found?.order_count ?? 0,
      color:   DOW_COLORS[i],
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
          {...tooltipStyle}
          formatter={(raw) => [`$${Number(raw).toFixed(2)}`, "Revenue"]}
        />
        <Bar dataKey="revenue" radius={[3, 3, 0, 0]} maxBarSize={36}>
          {all.map((entry, i) => (
            <Cell key={i} fill={entry.color} fillOpacity={0.88} />
          ))}
        </Bar>
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
