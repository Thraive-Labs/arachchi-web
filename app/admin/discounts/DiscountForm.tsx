"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { saveDiscountAction, deleteDiscountAction } from "./actions";

interface DiscountFormProps {
  initial?: {
    id: string;
    code: string;
    type: string;
    value: number;
    minSubtotalCents: number | null;
    maxUses: number | null;
    appliesTo: string;
    startsAt: Date | null;
    endsAt: Date | null;
    isActive: boolean;
  };
}

function fmtDate(d: Date | null) {
  if (!d) return "";
  return new Date(d).toISOString().split("T")[0];
}

export function DiscountForm({ initial }: DiscountFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState(initial?.type ?? "percentage");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (initial?.id) form.set("id", initial.id);
    setError(null);
    startTransition(async () => {
      const result = await saveDiscountAction(form);
      if (result.error) { setError(result.error); return; }
      router.push("/admin/discounts");
    });
  }

  function handleDelete() {
    if (!initial?.id || !confirm("Delete this discount code?")) return;
    startTransition(async () => {
      await deleteDiscountAction(initial.id);
      router.push("/admin/discounts");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs tracking-[0.15em] uppercase text-foreground">Code</label>
          <input name="code" defaultValue={initial?.code} required className="w-full border border-border bg-transparent px-3 py-2 text-sm uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-foreground" placeholder="SUMMER20" />
        </div>
        <div className="space-y-2">
          <label className="text-xs tracking-[0.15em] uppercase text-foreground">Type</label>
          <select name="type" value={type} onChange={(e) => setType(e.target.value)} className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground">
            <option value="percentage">Percentage off</option>
            <option value="fixed">Fixed amount off</option>
            <option value="free_shipping">Free shipping</option>
          </select>
        </div>
      </div>

      {type !== "free_shipping" && (
        <div className="space-y-2">
          <label className="text-xs tracking-[0.15em] uppercase text-foreground">
            {type === "percentage" ? "Discount %" : "Discount amount (cents)"}
          </label>
          <input type="number" name="value" defaultValue={initial?.value} required min={1} className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground" />
        </div>
      )}
      {type === "free_shipping" && <input type="hidden" name="value" value="0" />}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs tracking-[0.15em] uppercase text-foreground">Min subtotal (cents, optional)</label>
          <input type="number" name="minSubtotalCents" defaultValue={initial?.minSubtotalCents ?? ""} min={0} className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground" />
        </div>
        <div className="space-y-2">
          <label className="text-xs tracking-[0.15em] uppercase text-foreground">Max uses (optional)</label>
          <input type="number" name="maxUses" defaultValue={initial?.maxUses ?? ""} min={1} className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground" />
        </div>
        <div className="space-y-2">
          <label className="text-xs tracking-[0.15em] uppercase text-foreground">Starts at (optional)</label>
          <input type="date" name="startsAt" defaultValue={fmtDate(initial?.startsAt ?? null)} className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground" />
        </div>
        <div className="space-y-2">
          <label className="text-xs tracking-[0.15em] uppercase text-foreground">Expires at (optional)</label>
          <input type="date" name="endsAt" defaultValue={fmtDate(initial?.endsAt ?? null)} className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground" />
        </div>
      </div>

      <input type="hidden" name="appliesTo" value="all" />

      <div className="flex items-center gap-3">
        <input type="checkbox" name="isActive" id="isActive" defaultChecked={initial?.isActive ?? true} className="accent-foreground" />
        <label htmlFor="isActive" className="text-sm text-foreground">Active</label>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={isPending} className="border border-foreground bg-foreground px-6 py-3 text-xs tracking-[0.15em] uppercase text-background transition-opacity hover:opacity-80 disabled:opacity-50">
          {isPending ? "Saving…" : initial ? "Update" : "Create"}
        </button>
        {initial && (
          <button type="button" onClick={handleDelete} disabled={isPending} className="border border-destructive px-6 py-3 text-xs tracking-[0.15em] uppercase text-destructive hover:opacity-80 disabled:opacity-50">
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
