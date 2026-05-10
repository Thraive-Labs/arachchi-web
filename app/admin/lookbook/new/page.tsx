import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db/client";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { LookbookForm } from "../LookbookForm";

export const metadata: Metadata = { title: "Admin — New Lookbook Entry" };

export default async function NewLookbookEntryPage() {
  const allProducts = await db
    .select({ id: products.id, name: products.name })
    .from(products)
    .where(eq(products.isActive, true));

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/lookbook"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Lookbook
        </Link>
        <h1 className="font-serif text-2xl font-light tracking-wide">New entry</h1>
      </div>
      <LookbookForm entryId={null} allProducts={allProducts} />
    </div>
  );
}
