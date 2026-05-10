import type { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "@/lib/db/queries/products";
import { getAdminTags } from "@/lib/db/queries/admin";
import { ProductForm } from "../ProductForm";

export const metadata: Metadata = { title: "Admin — New Product" };

export default async function NewProductPage() {
  const [allCategories, allTags] = await Promise.all([getCategories(), getAdminTags()]);

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          &larr; Products
        </Link>
        <h1 className="font-serif text-2xl font-light tracking-wide">New product</h1>
      </div>
      <ProductForm
        productId={null}
        allCategories={allCategories}
        allTags={allTags}
        allProducts={[]}
      />
    </div>
  );
}
