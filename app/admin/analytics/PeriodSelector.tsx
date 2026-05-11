"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AnalyticsPeriod } from "@/lib/db/queries/admin";

const PRESETS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "7d",  label: "7 days"   },
  { value: "30d", label: "30 days"  },
  { value: "90d", label: "90 days"  },
  { value: "all", label: "All time" },
];

interface Props {
  period: AnalyticsPeriod | "custom";
  from?: string;
  to?: string;
}

export function PeriodSelector({ period, from, to }: Props) {
  const router = useRouter();
  const [showCustom, setShowCustom] = useState(period === "custom");
  const [fromVal, setFromVal] = useState(from ?? "");
  const [toVal, setToVal]     = useState(to   ?? new Date().toISOString().slice(0, 10));

  function applyCustom() {
    if (!fromVal || !toVal) return;
    router.push(`/admin/analytics?period=custom&from=${fromVal}&to=${toVal}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Preset buttons */}
      {PRESETS.map(({ value, label }) => (
        <a
          key={value}
          href={`/admin/analytics?period=${value}`}
          onClick={() => setShowCustom(false)}
          className={`px-4 py-2 text-xs tracking-[0.1em] uppercase border transition-colors ${
            period === value && !showCustom
              ? "border-foreground bg-foreground text-background"
              : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
          }`}
        >
          {label}
        </a>
      ))}

      {/* Custom toggle */}
      <button
        onClick={() => setShowCustom((v) => !v)}
        className={`px-4 py-2 text-xs tracking-[0.1em] uppercase border transition-colors ${
          showCustom || period === "custom"
            ? "border-foreground bg-foreground text-background"
            : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
        }`}
      >
        Custom
      </button>

      {/* Custom date inputs */}
      {showCustom && (
        <div className="flex flex-wrap items-center gap-2 mt-1 w-full sm:w-auto sm:mt-0">
          <input
            type="date"
            value={fromVal}
            onChange={(e) => setFromVal(e.target.value)}
            className="border border-border bg-transparent px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="date"
            value={toVal}
            onChange={(e) => setToVal(e.target.value)}
            className="border border-border bg-transparent px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
          />
          <button
            onClick={applyCustom}
            className="border border-foreground bg-foreground px-4 py-2 text-xs tracking-[0.1em] uppercase text-background transition-opacity hover:opacity-80"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
