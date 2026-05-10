"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveBundleAction, deleteBundleAction } from "./actions";

interface SimpleProduct { id: string; name: string; basePriceCents: number; }

interface BundleFormProps {
  allProducts: SimpleProduct[];
  initial?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    coverImageUrl: string | null;
    finalPriceCents: number;
    promoCode: string | null;
    isActive: boolean;
    productIds: string[];
  };
}

export function BundleForm({ allProducts, initial }: BundleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>(initial?.productIds ?? []);

  function toggleProduct(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    selectedIds.forEach((id) => form.append("productIds", id));
    if (initial?.id) form.set("id", initial.id);

    setError(null);
    startTransition(async () => {
      const result = await saveBundleAction(form);
      if (result.error) { setError(result.error); return; }
      router.push("/admin/bundles");
    });
  }

  function handleDelete() {
    if (!initial?.id || !confirm("Delete this bundle?")) return;
    startTransition(async () => {
      await deleteBundleAction(initial.id);
      router.push("/admin/bundles");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs tracking-[0.15em] uppercase text-foreground">Name</label>
          <input name="name" defaultValue={initial?.name} required className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground" />
        </div>
        <div className="space-y-2">
          <label className="text-xs tracking-[0.15em] uppercase text-foreground">Slug</label>
          <input name="slug" defaultValue={initial?.slug} required placeholder="e.g. summer-essentials" className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs tracking-[0.15em] uppercase text-foreground">Description</label>
        <textarea name="description" defaultValue={initial?.description} rows={3} required className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground" />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-2">
          <label className="text-xs tracking-[0.15em] uppercase text-foreground">Bundle price (CAD cents)</label>
          <input type="number" name="finalPriceCents" defaultValue={initial?.finalPriceCents} required min={0} className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground" />
        </div>
        <div className="space-y-2">
          <label className="text-xs tracking-[0.15em] uppercase text-foreground">Promo code (optional)</label>
          <input name="promoCode" defaultValue={initial?.promoCode ?? ""} className="w-full border border-border bg-transparent px-3 py-2 text-sm uppercase focus:outline-none focus:ring-1 focus:ring-foreground" />
        </div>
        <div className="space-y-2">
          <label className="text-xs tracking-[0.15em] uppercase text-foreground">Cover image URL (optional)</label>
          <input name="coverImageUrl" defaultValue={initial?.coverImageUrl ?? ""} className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground" />
        </div>
      </div>

      {/* Product selection */}
      <div className="space-y-3">
        <p className="text-xs tracking-[0.15em] uppercase text-foreground">Products in bundle</p>
        <div className="max-h-72 overflow-y-auto divide-y divide-border border border-border">
          {allProducts.map((p) => {
            const checked = selectedIds.includes(p.id);
            return (
              <label key={p.id} className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-muted transition-colors">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleProduct(p.id)}
                  className="accent-foreground"
                />
                <span className="flex-1 text-sm text-foreground">{p.name}</span>
                <span className="text-xs text-muted-foreground">${(p.basePriceCents / 100).toFixed(0)}</span>
              </label>
            );
          })}
        </div>
        {selectedIds.length > 0 && (
          <p className="text-xs text-muted-foreground">{selectedIds.length} product{selectedIds.length !== 1 ? "s" : ""} selected</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input type="checkbox" name="isActive" id="isActive" defaultChecked={initial?.isActive ?? true} className="accent-foreground" />
        <label htmlFor="isActive" className="text-sm text-foreground">Active (visible on storefront)</label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending || selectedIds.length === 0}
          className="border border-foreground bg-foreground px-6 py-3 text-xs tracking-[0.15em] uppercase text-background transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {isPending ? "Saving…" : initial ? "Update bundle" : "Create bundle"}
        </button>
        {initial && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="border border-destructive px-6 py-3 text-xs tracking-[0.15em] uppercase text-destructive transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
