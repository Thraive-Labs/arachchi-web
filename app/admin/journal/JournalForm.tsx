"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import { saveJournalArticleAction, uploadContentImageAction } from "@/app/actions/content";
import { slugify } from "@/lib/utils";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { JournalArticle } from "@/lib/db/schema";

interface Props {
  articleId: string | null;
  initialArticle?: JournalArticle;
}

export function JournalForm({ articleId, initialArticle }: Props) {
  const router = useRouter();
  const isNew = !articleId;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: initialArticle?.title ?? "",
    slug: initialArticle?.slug ?? "",
    excerpt: initialArticle?.excerpt ?? "",
    body: initialArticle?.body ?? "",
    coverImageUrl: initialArticle?.coverImageUrl ?? "",
    status: (initialArticle?.status ?? "draft") as "draft" | "published",
    seoTitle: initialArticle?.seoTitle ?? "",
    seoDescription: initialArticle?.seoDescription ?? "",
  });

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value;
    setForm((f) => ({ ...f, title, ...(isNew ? { slug: slugify(title) } : {}) }));
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadContentImageAction(fd);
    setUploading(false);
    if ("error" in result) {
      setError(result.error);
    } else {
      setForm((f) => ({ ...f, coverImageUrl: result.url }));
    }
  }

  function handleSave(status: "draft" | "published") {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await saveJournalArticleAction(articleId, { ...form, status });
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(result?.success ?? "Saved.");
        if (isNew && result?.id) {
          router.replace(`/admin/journal/${result.id}`);
        }
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Title + slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-[0.1em] text-foreground">Title</label>
          <input
            value={form.title}
            onChange={handleNameChange}
            className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-[0.1em] text-foreground">Slug</label>
          <input
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
          />
        </div>
      </div>

      {/* Excerpt */}
      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-[0.1em] text-foreground">Excerpt</label>
        <textarea
          value={form.excerpt}
          onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
          rows={2}
          className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground resize-none"
        />
      </div>

      {/* Cover image */}
      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-[0.1em] text-foreground">Cover image</label>
        {form.coverImageUrl && (
          <div className="relative h-32 border border-border mb-2">
            <NextImage
              src={form.coverImageUrl}
              alt="Cover"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        <div className="flex items-center gap-3">
          <label className="cursor-pointer border border-dashed border-border px-4 py-2 text-xs text-muted-foreground hover:border-foreground hover:text-foreground transition-colors">
            {uploading ? "Uploading..." : "Upload image"}
            <input type="file" accept="image/*" onChange={handleCoverUpload} className="sr-only" />
          </label>
          <span className="text-xs text-muted-foreground">or</span>
          <input
            value={form.coverImageUrl}
            onChange={(e) => setForm((f) => ({ ...f, coverImageUrl: e.target.value }))}
            placeholder="Paste image URL"
            className="flex-1 border border-border bg-transparent px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-foreground"
          />
        </div>
      </div>

      {/* Body */}
      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-[0.1em] text-foreground">Body</label>
        <RichTextEditor
          content={form.body}
          onChange={(html) => setForm((f) => ({ ...f, body: html }))}
          placeholder="Write the article..."
        />
      </div>

      {/* SEO */}
      <details className="border border-border">
        <summary className="px-4 py-3 text-xs uppercase tracking-[0.1em] text-muted-foreground cursor-pointer hover:text-foreground">
          SEO (optional)
        </summary>
        <div className="p-4 space-y-3 border-t border-border">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-[0.1em] text-foreground">SEO title</label>
            <input
              value={form.seoTitle}
              onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))}
              className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-[0.1em] text-foreground">
              SEO description
            </label>
            <textarea
              value={form.seoDescription}
              onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))}
              rows={2}
              className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground resize-none"
            />
          </div>
        </div>
      </details>

      {/* Messages */}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {success && <p className="text-xs text-green-700">{success}</p>}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => handleSave("published")}
          disabled={isPending || uploading}
          className="border border-foreground bg-foreground px-8 py-2.5 text-xs tracking-[0.15em] uppercase text-background hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Publish"}
        </button>
        <button
          onClick={() => handleSave("draft")}
          disabled={isPending || uploading}
          className="border border-border px-8 py-2.5 text-xs tracking-[0.15em] uppercase text-foreground hover:border-foreground transition-colors disabled:opacity-50"
        >
          Save draft
        </button>
      </div>
    </div>
  );
}
