"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import { saveLookbookEntryAction, uploadContentImageAction } from "@/app/actions/content";
import { slugify } from "@/lib/utils";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { LookbookEntry } from "@/lib/db/schema";

interface ProductOption {
  id: string;
  name: string;
}

interface Props {
  entryId: string | null;
  initialEntry?: LookbookEntry;
  allProducts: ProductOption[];
}

export function LookbookForm({ entryId, initialEntry, allProducts }: Props) {
  const router = useRouter();
  const isNew = !entryId;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: initialEntry?.title ?? "",
    slug: initialEntry?.slug ?? "",
    coverImageUrl: initialEntry?.coverImageUrl ?? "",
    body: initialEntry?.body ?? "",
    productIds: initialEntry?.productIds ?? [],
    position: initialEntry?.position ?? 0,
    isActive: initialEntry?.isActive ?? true,
  });

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value;
    setForm((f) => ({ ...f, title, ...(isNew ? { slug: slugify(title) } : {}) }));
  }

  function toggleProduct(id: string) {
    setForm((f) => ({
      ...f,
      productIds: f.productIds.includes(id)
        ? f.productIds.filter((p) => p !== id)
        : [...f.productIds, id],
    }));
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

  function handleSave() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await saveLookbookEntryAction(entryId, form);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(result?.success ?? "Saved.");
        if (isNew && result?.id) {
          router.replace(`/admin/lookbook/${result.id}`);
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
            onChange={handleTitleChange}
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

      {/* Position + visibility */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-[0.1em] text-foreground">Position</label>
          <input
            type="number"
            min="0"
            value={form.position}
            onChange={(e) => setForm((f) => ({ ...f, position: Number(e.target.value) }))}
            className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
          />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="accent-foreground"
            />
            <span className="text-xs uppercase tracking-[0.1em] text-foreground">Active</span>
          </label>
        </div>
      </div>

      {/* Cover image */}
      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-[0.1em] text-foreground">Cover image</label>
        {form.coverImageUrl && (
          <div className="relative h-40 border border-border mb-2">
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

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-[0.1em] text-foreground">Description</label>
        <RichTextEditor
          content={form.body}
          onChange={(html) => setForm((f) => ({ ...f, body: html }))}
          placeholder="Describe this look..."
        />
      </div>

      {/* Products */}
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[0.1em] text-foreground">
          Featured products ({form.productIds.length} selected)
        </label>
        <div className="border border-border max-h-56 overflow-y-auto divide-y divide-border">
          {allProducts.length === 0 && (
            <p className="p-3 text-xs text-muted-foreground">No products available.</p>
          )}
          {allProducts.map((p) => (
            <label key={p.id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/30">
              <input
                type="checkbox"
                checked={form.productIds.includes(p.id)}
                onChange={() => toggleProduct(p.id)}
                className="accent-foreground"
              />
              <span className="text-sm text-foreground">{p.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Messages */}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {success && <p className="text-xs text-green-700">{success}</p>}

      {/* Save */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={isPending || uploading}
          className="border border-foreground bg-foreground px-8 py-2.5 text-xs tracking-[0.15em] uppercase text-background hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
