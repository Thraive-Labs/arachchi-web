import type { Metadata } from "next";
import Link from "next/link";
import { getAdminProducts } from "@/lib/db/queries/admin";
import { formatPriceCents } from "@/lib/utils";
import { getCategories } from "@/lib/db/queries/products";
import { archiveProductAction } from "@/app/actions/admin";

export const metadata: Metadata = { title: "Admin — Products" };

interface PageProps {
  searchParams: Promise<{ search?: string; category?: string; page?: string }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const { search, category, page } = await searchParams;
  const currentPage = Number(page ?? 1);

  const [{ rows, total }, allCategories] = await Promise.all([
    getAdminProducts({ search, categorySlug: category, page: currentPage }),
    getCategories(),
  ]);

  const totalPages = Math.ceil(total / 30);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-2xl font-light tracking-wide">Products</h1>
        <Link
          href="/admin/products/new"
          className="border border-foreground bg-foreground px-6 py-2.5 text-xs tracking-[0.15em] uppercase text-background hover:opacity-80 transition-opacity"
        >
          Add product
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search products..."
          className="border border-border bg-transparent px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground w-56"
        />
        <select
          name="category"
          defaultValue={category}
          className="border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        >
          <option value="">All categories</option>
          {allCategories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <button
          type="submit"
          className="border border-border px-5 py-2 text-xs tracking-[0.15em] uppercase text-foreground hover:border-foreground transition-colors"
        >
          Filter
        </button>
        {(search || category) && (
          <Link href="/admin/products" className="border border-border px-5 py-2 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors">
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="overflow-x-auto -mx-5 px-5 lg:mx-0 lg:px-0">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-xs tracking-[0.1em] uppercase text-muted-foreground">
              <th className="pb-3 text-left font-normal">Name</th>
              <th className="pb-3 text-left font-normal">Category</th>
              <th className="pb-3 text-right font-normal">Price</th>
              <th className="pb-3 text-center font-normal">Active</th>
              <th className="pb-3 text-center font-normal">Featured</th>
              <th className="pb-3 text-center font-normal">Trending</th>
              <th className="pb-3 text-right font-normal">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((p) => (
              <tr key={p.id} className="group">
                <td className="py-3 pr-4">
                  <Link href={`/admin/products/${p.id}`} className="text-foreground hover:underline">
                    {p.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{p.slug}</p>
                </td>
                <td className="py-3 pr-4 text-muted-foreground">{p.categoryName ?? "—"}</td>
                <td className="py-3 pr-4 text-right">{formatPriceCents(p.basePriceCents)}</td>
                <td className="py-3 text-center">{p.isActive ? "Yes" : <span className="text-muted-foreground">No</span>}</td>
                <td className="py-3 text-center">{p.isFeatured ? "Yes" : <span className="text-muted-foreground">—</span>}</td>
                <td className="py-3 text-center">{p.isTrending ? "Yes" : <span className="text-muted-foreground">—</span>}</td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Edit
                    </Link>
                    {p.isActive && (
                      <form action={archiveProductAction}>
                        <input type="hidden" name="productId" value={p.id} />
                        <button type="submit" className="text-xs text-muted-foreground hover:text-red-600 transition-colors">
                          Archive
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No products found.</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>{total} products</span>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/admin/products?page=${p}${search ? `&search=${search}` : ""}${category ? `&category=${category}` : ""}`}
                className={`px-2 py-1 border ${p === currentPage ? "border-foreground text-foreground" : "border-border hover:border-foreground"}`}
              >
                {p}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
