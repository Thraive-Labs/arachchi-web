import type { MetadataRoute } from "next";
import { db } from "@/lib/db/client";
import { products, journalArticles, lookbookEntries, tags } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arachchi.com";
  const now = new Date();

  const [allProducts, articles, lookbooks, visibleTags] = await Promise.all([
    db.select({ slug: products.slug, updatedAt: products.updatedAt }).from(products).where(eq(products.isActive, true)),
    db.select({ slug: journalArticles.slug, updatedAt: journalArticles.updatedAt }).from(journalArticles).where(eq(journalArticles.status, "published")),
    db.select({ slug: lookbookEntries.slug, createdAt: lookbookEntries.createdAt }).from(lookbookEntries).where(eq(lookbookEntries.isActive, true)),
    db.select({ slug: tags.slug }).from(tags).where(eq(tags.isVisible, true)),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/journal`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/lookbook`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/shipping`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/returns`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  const productPages: MetadataRoute.Sitemap = allProducts.map((p) => ({
    url: `${baseUrl}/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const journalPages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${baseUrl}/journal/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const lookbookPages: MetadataRoute.Sitemap = lookbooks.map((l) => ({
    url: `${baseUrl}/lookbook/${l.slug}`,
    lastModified: l.createdAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const tagPages: MetadataRoute.Sitemap = visibleTags.map((t) => ({
    url: `${baseUrl}/shop/tag/${t.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...journalPages, ...lookbookPages, ...tagPages];
}
