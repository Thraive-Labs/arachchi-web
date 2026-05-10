import { db } from "@/lib/db/client";
import { products } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { BundleForm } from "../BundleForm";

export const metadata = { title: "New Bundle — Admin" };

export default async function NewBundlePage() {
  const allProducts = await db
    .select({ id: products.id, name: products.name, basePriceCents: products.basePriceCents })
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(asc(products.name));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-light tracking-wide">New bundle</h1>
      <BundleForm allProducts={allProducts} />
    </div>
  );
}
