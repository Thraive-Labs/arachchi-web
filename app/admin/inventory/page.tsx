import type { Metadata } from "next";
import Link from "next/link";
import { getInventoryLevels } from "@/lib/db/queries/admin";
import { StockUpdateForm } from "./StockUpdateForm";

export const metadata: Metadata = { title: "Admin — Inventory" };

interface PageProps {
  searchParams: Promise<{ low?: string }>;
}

export default async function AdminInventoryPage({ searchParams }: PageProps) {
  const { low } = await searchParams;
  const lowStockOnly = low === "1";
  const variants = await getInventoryLevels({ lowStockOnly });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-2xl font-light tracking-wide">Inventory</h1>
        <div className="flex items-center gap-3">
          <Link
            href={lowStockOnly ? "/admin/inventory" : "/admin/inventory?low=1"}
            className={`text-xs tracking-[0.1em] uppercase transition-colors ${
              lowStockOnly
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {lowStockOnly ? "Show all" : "Low stock only"}
          </Link>
        </div>
      </div>

      {lowStockOnly && (
        <p className="text-xs text-muted-foreground mb-6">
          Showing variants with 3 or fewer units remaining.
        </p>
      )}

      <div className="overflow-x-auto -mx-5 px-5 lg:mx-0 lg:px-0">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border text-xs tracking-[0.1em] uppercase text-muted-foreground">
            <th className="pb-3 text-left font-normal">Product</th>
            <th className="pb-3 text-left font-normal">SKU</th>
            <th className="pb-3 text-left font-normal">Size / Color</th>
            <th className="pb-3 text-right font-normal">Price</th>
            <th className="pb-3 text-right font-normal">Stock</th>
            <th className="pb-3 text-right font-normal">Update</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {variants.length === 0 && (
            <tr>
              <td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                {lowStockOnly ? "No low-stock variants." : "No variants found."}
              </td>
            </tr>
          )}
          {variants.map((v) => (
            <tr key={v.variantId}>
              <td className="py-3 pr-3">
                <Link
                  href={`/admin/products/${v.productId}`}
                  className="text-foreground hover:opacity-70 transition-opacity"
                >
                  {v.productName}
                </Link>
              </td>
              <td className="py-3 pr-3 font-mono text-xs text-muted-foreground">
                {v.sku ?? "—"}
              </td>
              <td className="py-3 pr-3 text-muted-foreground text-xs">
                {[v.size, v.color].filter(Boolean).join(" / ") || "—"}
              </td>
              <td className="py-3 text-right text-muted-foreground">
                ${(v.priceCents / 100).toFixed(2)}
              </td>
              <td className="py-3 text-right">
                <span
                  className={
                    v.stockQuantity <= 3
                      ? "text-red-600 font-medium"
                      : "text-foreground"
                  }
                >
                  {v.stockQuantity}
                </span>
              </td>
              <td className="py-3 text-right">
                <StockUpdateForm variantId={v.variantId} currentStock={v.stockQuantity} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
