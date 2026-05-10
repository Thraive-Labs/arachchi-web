"use client";

import { useState, useTransition } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { saveTagAction, toggleTagVisibilityAction } from "@/app/actions/admin";
import { slugify } from "@/lib/utils";
import type { Tag } from "@/lib/db/schema";

interface Props {
  initialTags: Tag[];
}

export function TagsManager({ initialTags }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [newTag, setNewTag] = useState({ name: "", slug: "", isVisible: true, position: 0 });

  async function handleSave(tagId: string | null, data: typeof newTag) {
    setError(null);
    startTransition(async () => {
      const result = await saveTagAction(tagId, { ...data, description: null });
      if (result.error) {
        setError(result.error);
      } else {
        setShowNew(false);
        setEditingId(null);
        setNewTag({ name: "", slug: "", isVisible: true, position: 0 });
        router.refresh();
      }
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-2xl font-light tracking-wide">Tags</h1>
        <button
          onClick={() => setShowNew((v) => !v)}
          className="border border-foreground bg-foreground px-6 py-2.5 text-xs tracking-[0.15em] uppercase text-background hover:opacity-80 transition-opacity"
        >
          Add tag
        </button>
      </div>

      {showNew && (
        <div className="border border-dashed border-border p-5 mb-6 space-y-3">
          <p className="text-xs tracking-[0.15em] uppercase text-foreground mb-3">New tag</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-[0.1em] text-foreground">Name</label>
              <input
                value={newTag.name}
                onChange={(e) =>
                  setNewTag((t) => ({ ...t, name: e.target.value, slug: slugify(e.target.value) }))
                }
                className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-[0.1em] text-foreground">Slug</label>
              <input
                value={newTag.slug}
                onChange={(e) => setNewTag((t) => ({ ...t, slug: e.target.value }))}
                className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-[0.1em] text-foreground">Position</label>
              <input
                type="number"
                min="0"
                value={newTag.position}
                onChange={(e) => setNewTag((t) => ({ ...t, position: Number(e.target.value) }))}
                className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newTag.isVisible}
                  onChange={(e) => setNewTag((t) => ({ ...t, isVisible: e.target.checked }))}
                  className="accent-foreground"
                />
                <span className="text-xs uppercase tracking-[0.1em] text-foreground">
                  Visible in storefront
                </span>
              </label>
            </div>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={() => handleSave(null, newTag)}
              disabled={isPending}
              className="border border-foreground bg-foreground px-6 py-2 text-xs tracking-[0.15em] uppercase text-background hover:opacity-80 disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save tag"}
            </button>
            <button
              onClick={() => setShowNew(false)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-xs tracking-[0.1em] uppercase text-muted-foreground">
            <th className="pb-3 text-left font-normal">Name</th>
            <th className="pb-3 text-left font-normal">Slug</th>
            <th className="pb-3 text-center font-normal">Position</th>
            <th className="pb-3 text-center font-normal">Visible</th>
            <th className="pb-3 text-right font-normal">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {initialTags.map((tag) => (
            <TagRow
              key={tag.id}
              tag={tag}
              isEditing={editingId === tag.id}
              onEdit={() => setEditingId(tag.id)}
              onCancel={() => setEditingId(null)}
              onSave={(data) => handleSave(tag.id, data)}
              isPending={isPending}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TagRow({
  tag,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  isPending,
}: {
  tag: Tag;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (data: { name: string; slug: string; isVisible: boolean; position: number }) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState({
    name: tag.name,
    slug: tag.slug,
    isVisible: tag.isVisible,
    position: tag.position,
  });
  const [, visAction] = useActionState(toggleTagVisibilityAction, null);

  if (isEditing) {
    return (
      <tr>
        <td className="py-3 pr-3">
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full border border-border bg-transparent px-2 py-1 text-sm focus:outline-none"
          />
        </td>
        <td className="py-3 pr-3">
          <input
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            className="w-full border border-border bg-transparent px-2 py-1 text-sm focus:outline-none"
          />
        </td>
        <td className="py-3 text-center">
          <input
            type="number"
            min="0"
            value={form.position}
            onChange={(e) => setForm((f) => ({ ...f, position: Number(e.target.value) }))}
            className="w-16 border border-border bg-transparent px-2 py-1 text-sm text-center focus:outline-none"
          />
        </td>
        <td className="py-3 text-center">
          <input
            type="checkbox"
            checked={form.isVisible}
            onChange={(e) => setForm((f) => ({ ...f, isVisible: e.target.checked }))}
            className="accent-foreground"
          />
        </td>
        <td className="py-3 text-right">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => onSave(form)}
              disabled={isPending}
              className="text-xs text-foreground hover:opacity-70"
            >
              Save
            </button>
            <button onClick={onCancel} className="text-xs text-muted-foreground hover:text-foreground">
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td className="py-3 pr-3 text-foreground">{tag.name}</td>
      <td className="py-3 pr-3 text-muted-foreground font-mono text-xs">{tag.slug}</td>
      <td className="py-3 text-center text-muted-foreground">{tag.position}</td>
      <td className="py-3 text-center">
        <form action={visAction}>
          <input type="hidden" name="tagId" value={tag.id} />
          <input type="hidden" name="isVisible" value={String(tag.isVisible)} />
          <button
            type="submit"
            className={`text-xs ${tag.isVisible ? "text-foreground" : "text-muted-foreground"} hover:opacity-70`}
          >
            {tag.isVisible ? "Yes" : "No"}
          </button>
        </form>
      </td>
      <td className="py-3 text-right">
        <button
          onClick={onEdit}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Edit
        </button>
      </td>
    </tr>
  );
}
