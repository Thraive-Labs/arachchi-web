import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getAdminProductById, getAdminTags } from "@/lib/db/queries/admin";
import { getCategories } from "@/lib/db/queries/products";
import { db } from "@/lib/db/client";
import { products } from "@/lib/db/schema";
import { ProductForm } from "../ProductForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getAdminProductById(id);
  return { title: data ? `Admin — ${data.product.name}` : "Admin — Product" };
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const [data, allCategories, allTags, allProductRows] = await Promise.all([
    getAdminProductById(id),
    getCategories(),
    getAdminTags(),
    db.select({ id: products.id, name: products.name }).from(products),
  ]);

  if (!data) notFound();

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          &larr; Products
        </Link>
        <h1 className="font-serif text-2xl font-light tracking-wide">{data.product.name}</h1>
        <Link
          href={`/product/${data.product.slug}`}
          target="_blank"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          View on site &rarr;
        </Link>
      </div>
      <ProductForm
        productId={id}
        initialProduct={data.product}
        initialVariants={data.variants}
        initialImages={data.images}
        initialTagIds={data.tagIds}
        allCategories={allCategories}
        allTags={allTags}
        allProducts={allProductRows}
      />
    </div>
  );
}
