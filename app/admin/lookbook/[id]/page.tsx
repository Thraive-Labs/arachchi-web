import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { products } from "@/lib/db/schema";
import { getAdminLookbookEntryById } from "@/lib/db/queries/content";
import { LookbookForm } from "../LookbookForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const entry = await getAdminLookbookEntryById(id);
  return { title: entry ? `Admin — ${entry.title}` : "Admin — Lookbook" };
}

export default async function EditLookbookEntryPage({ params }: PageProps) {
  const { id } = await params;
  const [entry, allProducts] = await Promise.all([
    getAdminLookbookEntryById(id),
    db.select({ id: products.id, name: products.name }).from(products).where(eq(products.isActive, true)),
  ]);

  if (!entry) notFound();

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/lookbook"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Lookbook
        </Link>
        <h1 className="font-serif text-2xl font-light tracking-wide">{entry.title}</h1>
        {entry.isActive && (
          <Link
            href={`/lookbook/${entry.slug}`}
            target="_blank"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View &rarr;
          </Link>
        )}
      </div>
      <LookbookForm entryId={id} initialEntry={entry} allProducts={allProducts} />
    </div>
  );
}
