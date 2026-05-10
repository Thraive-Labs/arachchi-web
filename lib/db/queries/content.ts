import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "../client";
import { journalArticles, lookbookEntries, products, productImages } from "../schema";

// ── Journal ────────────────────────────────────────────────────────────────────

export async function getPublishedJournalArticles() {
  return db
    .select({
      id: journalArticles.id,
      slug: journalArticles.slug,
      title: journalArticles.title,
      excerpt: journalArticles.excerpt,
      coverImageUrl: journalArticles.coverImageUrl,
      publishedAt: journalArticles.publishedAt,
    })
    .from(journalArticles)
    .where(eq(journalArticles.status, "published"))
    .orderBy(desc(journalArticles.publishedAt));
}

export async function getJournalArticleBySlug(slug: string) {
  const [article] = await db
    .select()
    .from(journalArticles)
    .where(and(eq(journalArticles.slug, slug), eq(journalArticles.status, "published")))
    .limit(1);
  return article ?? null;
}

export async function getAdminJournalArticles() {
  return db
    .select({
      id: journalArticles.id,
      slug: journalArticles.slug,
      title: journalArticles.title,
      status: journalArticles.status,
      publishedAt: journalArticles.publishedAt,
      updatedAt: journalArticles.updatedAt,
    })
    .from(journalArticles)
    .orderBy(desc(journalArticles.updatedAt));
}

export async function getAdminJournalArticleById(id: string) {
  const [article] = await db
    .select()
    .from(journalArticles)
    .where(eq(journalArticles.id, id))
    .limit(1);
  return article ?? null;
}

// ── Lookbook ───────────────────────────────────────────────────────────────────

export async function getPublishedLookbookEntries() {
  return db
    .select({
      id: lookbookEntries.id,
      slug: lookbookEntries.slug,
      title: lookbookEntries.title,
      coverImageUrl: lookbookEntries.coverImageUrl,
      position: lookbookEntries.position,
    })
    .from(lookbookEntries)
    .where(eq(lookbookEntries.isActive, true))
    .orderBy(asc(lookbookEntries.position), desc(lookbookEntries.createdAt));
}

export async function getLookbookEntryBySlug(slug: string) {
  const [entry] = await db
    .select()
    .from(lookbookEntries)
    .where(and(eq(lookbookEntries.slug, slug), eq(lookbookEntries.isActive, true)))
    .limit(1);
  if (!entry) return null;

  const productList =
    entry.productIds && entry.productIds.length > 0
      ? await db
          .select({
            id: products.id,
            slug: products.slug,
            name: products.name,
            basePriceCents: products.basePriceCents,
            primaryImage: productImages.url,
          })
          .from(products)
          .leftJoin(productImages, and(eq(productImages.productId, products.id), eq(productImages.isPrimary, true)))
          .where(eq(products.isActive, true))
      : [];

  const linked = productList.filter((p) => (entry.productIds ?? []).includes(p.id));

  return { ...entry, linkedProducts: linked };
}

export async function getAdminLookbookEntries() {
  return db
    .select({
      id: lookbookEntries.id,
      slug: lookbookEntries.slug,
      title: lookbookEntries.title,
      isActive: lookbookEntries.isActive,
      position: lookbookEntries.position,
      createdAt: lookbookEntries.createdAt,
    })
    .from(lookbookEntries)
    .orderBy(asc(lookbookEntries.position), desc(lookbookEntries.createdAt));
}

export async function getAdminLookbookEntryById(id: string) {
  const [entry] = await db
    .select()
    .from(lookbookEntries)
    .where(eq(lookbookEntries.id, id))
    .limit(1);
  return entry ?? null;
}
