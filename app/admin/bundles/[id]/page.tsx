import { notFound } from "next/navigation";
import { db } from "@/lib/db/client";
import { products } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { getBundleByIdAdmin } from "@/lib/db/queries/bundles";
import { BundleForm } from "../BundleForm";

export const metadata = { title: "Edit Bundle — Admin" };

interface Props { params: Promise<{ id: string }> }

export default async function EditBundlePage({ params }: Props) {
  const { id } = await params;
  const [bundle, allProducts] = await Promise.all([
    getBundleByIdAdmin(id),
    db.select({ id: products.id, name: products.name, basePriceCents: products.basePriceCents })
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(asc(products.name)),
  ]);

  if (!bundle) notFound();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-light tracking-wide">Edit bundle: {bundle.name}</h1>
      <BundleForm allProducts={allProducts} initial={bundle} />
    </div>
  );
}
