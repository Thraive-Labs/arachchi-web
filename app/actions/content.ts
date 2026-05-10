"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { journalArticles, lookbookEntries, newsletterSubscribers } from "@/lib/db/schema";
import { requireStaff } from "./admin";
import { createSupabaseServiceClient } from "@/lib/auth/server";

export type ContentActionState = { error?: string; success?: string; id?: string } | null;

// ── Journal ────────────────────────────────────────────────────────────────────

const journalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  body: z.string().min(1, "Body is required"),
  coverImageUrl: z.string().min(1, "Cover image is required"),
  status: z.enum(["draft", "published"]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export async function saveJournalArticleAction(
  articleId: string | null,
  data: z.infer<typeof journalSchema>,
): Promise<ContentActionState> {
  try {
    await requireStaff();
  } catch {
    return { error: "Unauthorized." };
  }

  const result = journalSchema.safeParse(data);
  if (!result.success) return { error: result.error.issues[0]?.message ?? "Invalid data." };

  const { title, slug, excerpt, body, coverImageUrl, status, seoTitle, seoDescription } =
    result.data;
  const publishedAt = status === "published" ? new Date() : null;

  if (articleId) {
    const existing = await db
      .select({ status: journalArticles.status, publishedAt: journalArticles.publishedAt })
      .from(journalArticles)
      .where(eq(journalArticles.id, articleId))
      .limit(1);
    const currentPublishedAt =
      status === "published" && existing[0]?.status !== "published"
        ? new Date()
        : existing[0]?.publishedAt ?? null;

    await db
      .update(journalArticles)
      .set({ title, slug, excerpt, body, coverImageUrl, status, publishedAt: currentPublishedAt, seoTitle: seoTitle ?? null, seoDescription: seoDescription ?? null, updatedAt: new Date() })
      .where(eq(journalArticles.id, articleId));
  } else {
    const [created] = await db
      .insert(journalArticles)
      .values({ title, slug, excerpt, body, coverImageUrl, status, publishedAt, seoTitle: seoTitle ?? null, seoDescription: seoDescription ?? null })
      .returning({ id: journalArticles.id });
    revalidatePath("/journal");
    revalidatePath("/admin/journal");
    return { success: "Article created.", id: created?.id };
  }

  revalidatePath("/journal");
  revalidatePath(`/journal/${slug}`);
  revalidatePath("/admin/journal");
  return { success: "Article saved." };
}

export async function deleteJournalArticleAction(formData: FormData): Promise<void> {
  try {
    await requireStaff();
  } catch {
    return;
  }
  const id = formData.get("articleId") as string;
  if (!id) return;
  await db.delete(journalArticles).where(eq(journalArticles.id, id));
  revalidatePath("/journal");
  revalidatePath("/admin/journal");
}

// ── Lookbook ───────────────────────────────────────────────────────────────────

const lookbookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  coverImageUrl: z.string().min(1, "Cover image is required"),
  body: z.string().min(1, "Description is required"),
  productIds: z.array(z.string().uuid()).default([]),
  position: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export async function saveLookbookEntryAction(
  entryId: string | null,
  data: z.infer<typeof lookbookSchema>,
): Promise<ContentActionState> {
  try {
    await requireStaff();
  } catch {
    return { error: "Unauthorized." };
  }

  const result = lookbookSchema.safeParse(data);
  if (!result.success) return { error: result.error.issues[0]?.message ?? "Invalid data." };

  const { title, slug, coverImageUrl, body, productIds, position, isActive } = result.data;

  if (entryId) {
    await db
      .update(lookbookEntries)
      .set({ title, slug, coverImageUrl, body, productIds, position, isActive })
      .where(eq(lookbookEntries.id, entryId));
  } else {
    const [created] = await db
      .insert(lookbookEntries)
      .values({ title, slug, coverImageUrl, body, productIds, position, isActive })
      .returning({ id: lookbookEntries.id });
    revalidatePath("/lookbook");
    revalidatePath("/admin/lookbook");
    return { success: "Lookbook entry created.", id: created?.id };
  }

  revalidatePath("/lookbook");
  revalidatePath(`/lookbook/${slug}`);
  revalidatePath("/admin/lookbook");
  return { success: "Lookbook entry saved." };
}

export async function deleteLookbookEntryAction(formData: FormData): Promise<void> {
  try {
    await requireStaff();
  } catch {
    return;
  }
  const id = formData.get("entryId") as string;
  if (!id) return;
  await db.delete(lookbookEntries).where(eq(lookbookEntries.id, id));
  revalidatePath("/lookbook");
  revalidatePath("/admin/lookbook");
}

// ── Content image upload ───────────────────────────────────────────────────────

export async function uploadContentImageAction(
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  try {
    await requireStaff();
  } catch {
    return { error: "Unauthorized." };
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file provided." };
  if (!file.type.startsWith("image/")) return { error: "File must be an image." };
  if (file.size > 10 * 1024 * 1024) return { error: "Image must be under 10MB." };

  const supabase = await createSupabaseServiceClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `content/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) return { error: "Upload failed." };

  const { data: publicData } = supabase.storage.from("product-images").getPublicUrl(path);
  return { url: publicData.publicUrl };
}

// ── Newsletter ─────────────────────────────────────────────────────────────────

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  source: z.string().default("footer"),
});

export async function subscribeToNewsletterAction(
  prevState: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const result = newsletterSchema.safeParse({
    email: formData.get("email"),
    source: formData.get("source") ?? "footer",
  });
  if (!result.success) return { error: result.error.issues[0]?.message ?? "Invalid email." };

  const { email, source } = result.data;

  await db
    .insert(newsletterSubscribers)
    .values({ email, source })
    .onConflictDoUpdate({ target: newsletterSubscribers.email, set: { isActive: true } });

  return { success: "You're subscribed." };
}
