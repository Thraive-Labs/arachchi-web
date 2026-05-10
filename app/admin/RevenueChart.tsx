"use client";

import { formatPriceCents } from "@/lib/utils";

interface DayData {
  day: string;
  revenue_cents: number;
}

interface Props {
  data: DayData[];
}

export function RevenueChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No revenue data for this period.</p>
      </div>
    );
  }

  // Fill in all 30 days (some days may have no orders)
  const days: DayData[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const found = data.find((r) => r.day.slice(0, 10) === key);
    days.push({ day: key, revenue_cents: found?.revenue_cents ?? 0 });
  }

  const max = Math.max(...days.map((d) => d.revenue_cents), 1);

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-0.5 h-28">
        {days.map((d) => {
          const heightPct = (d.revenue_cents / max) * 100;
          const hasRevenue = d.revenue_cents > 0;
          return (
            <div
              key={d.day}
              className="flex-1 flex flex-col items-center justify-end h-full group relative"
            >
              {/* Tooltip */}
              {hasRevenue && (
                <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {new Date(d.day).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}
                  <br />
                  {formatPriceCents(d.revenue_cents)}
                </div>
              )}
              <div
                className={`w-full transition-all ${hasRevenue ? "bg-foreground hover:bg-foreground/70" : "bg-border"}`}
                style={{ height: `${Math.max(heightPct, hasRevenue ? 4 : 1)}%` }}
              />
            </div>
          );
        })}
      </div>
      {/* X-axis labels: show every 7th day */}
      <div className="flex gap-0.5">
        {days.map((d, i) => (
          <div key={d.day} className="flex-1 text-center">
            {i % 7 === 0 && (
              <span className="text-[9px] text-muted-foreground">
                {new Date(d.day).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
