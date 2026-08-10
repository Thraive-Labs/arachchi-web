"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { saveProductAction, uploadProductImageAction, deleteProductImageAction, setPrimaryImageAction, setImageColorAction, saveVariantAction, type ProductFormData } from "@/app/actions/admin";
import { slugify } from "@/lib/utils";
import { Plus, Trash2, Star } from "lucide-react";
import type { Category, Tag, ProductVariant, ProductImage, Product } from "@/lib/db/schema";
import { useActionState } from "react";

interface Props {
  productId: string | null;
  initialProduct?: Product;
  initialVariants?: ProductVariant[];
  initialImages?: ProductImage[];
  initialTagIds?: string[];
  allCategories: Category[];
  allTags: Tag[];
  allProducts: { id: string; name: string }[];
}

export function ProductForm({
  productId,
  initialProduct,
  initialVariants = [],
  initialImages = [],
  initialTagIds = [],
  allCategories,
  allTags,
  allProducts,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [images, setImages] = useState<ProductImage[]>(initialImages);
  const [uploadColor, setUploadColor] = useState("");

  const isNew = !productId;

  // Form state
  const [form, setForm] = useState({
    name: initialProduct?.name ?? "",
    slug: initialProduct?.slug ?? "",
    shortDescription: initialProduct?.shortDescription ?? "",
    description: initialProduct?.description ?? "",
    categoryId: initialProduct?.categoryId ?? "",
    basePriceStr: initialProduct ? (initialProduct.basePriceCents / 100).toFixed(2) : "",
    compareAtPriceStr: initialProduct?.compareAtPriceCents
      ? (initialProduct.compareAtPriceCents / 100).toFixed(2)
      : "",
    seoTitle: initialProduct?.seoTitle ?? "",
    seoDescription: initialProduct?.seoDescription ?? "",
    isFeatured: initialProduct?.isFeatured ?? false,
    isTrending: initialProduct?.isTrending ?? false,
    isActive: initialProduct?.isActive ?? true,
  });

  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set(initialTagIds));
  const [selectedRelatedIds, setSelectedRelatedIds] = useState<Set<string>>(
    new Set(initialProduct?.relatedProductIds ?? []),
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setForm((f) => ({
      ...f,
      [name]: checked !== undefined ? checked : value,
      ...(name === "name" && isNew ? { slug: slugify(value) } : {}),
    }));
  }

  function toggleTag(id: string) {
    setSelectedTagIds((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleRelated(id: string) {
    setSelectedRelatedIds((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSave() {
    setError(null);
    setSuccess(null);

    const basePriceCents = Math.round(parseFloat(form.basePriceStr || "0") * 100);
    const compareAtPriceCents = form.compareAtPriceStr
      ? Math.round(parseFloat(form.compareAtPriceStr) * 100)
      : null;

    const data: ProductFormData = {
      name: form.name,
      slug: form.slug,
      shortDescription: form.shortDescription,
      description: form.description,
      categoryId: form.categoryId || null,
      basePriceCents,
      compareAtPriceCents,
      seoTitle: form.seoTitle || null,
      seoDescription: form.seoDescription || null,
      isFeatured: form.isFeatured,
      isTrending: form.isTrending,
      isActive: form.isActive,
      tagIds: Array.from(selectedTagIds),
      relatedProductIds: Array.from(selectedRelatedIds),
    };

    startTransition(async () => {
      const result = await saveProductAction(productId, data);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Product saved.");
        if (isNew && result.id) {
          router.push(`/admin/products/${result.id}`);
        }
      }
    });
  }

  // Image upload
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !productId) return;
    const formData = new FormData();
    formData.append("image", file);
    const color = uploadColor.trim();
    if (color) formData.append("color", color);
    const result = await uploadProductImageAction(productId, formData);
    if (result.error) {
      setError(result.error);
    } else if (result.url && result.id) {
      setImages((prev) => [
        ...prev,
        {
          id: result.id!,
          productId: productId!,
          url: result.url!,
          alt: "",
          position: prev.length,
          isPrimary: prev.length === 0,
          color: color || null,
          mediaType: "image" as const,
        },
      ]);
      setUploadColor("");
    }
    e.target.value = "";
  }

  return (
    <div className="space-y-10 max-w-3xl">
      {/* Basic info */}
      <section>
        <p className="mb-5 border-b border-border pb-2 text-xs tracking-[0.2em] uppercase text-foreground">
          Basic info
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name">
              <input name="name" value={form.name} onChange={handleChange} required className={inputCls} />
            </Field>
            <Field label="Slug">
              <input name="slug" value={form.slug} onChange={handleChange} required className={inputCls} />
            </Field>
          </div>

          <Field label="Short description">
            <textarea name="shortDescription" value={form.shortDescription} onChange={handleChange} rows={2} className={inputCls} />
          </Field>

          <Field label="Description">
            <textarea name="description" value={form.description} onChange={handleChange} rows={5} className={inputCls} />
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Category">
              <select name="categoryId" value={form.categoryId} onChange={handleChange} className={inputCls}>
                <option value="">None</option>
                {allCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Price (CAD)">
              <input name="basePriceStr" type="number" min="0" step="0.01" value={form.basePriceStr} onChange={handleChange} className={inputCls} placeholder="0.00" />
            </Field>
            <Field label="Compare-at price">
              <input name="compareAtPriceStr" type="number" min="0" step="0.01" value={form.compareAtPriceStr} onChange={handleChange} className={inputCls} placeholder="0.00" />
            </Field>
          </div>

          <div className="flex gap-6">
            {(["isActive", "isFeatured", "isTrending"] as const).map((key) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name={key}
                  checked={form[key] as boolean}
                  onChange={handleChange}
                  className="accent-foreground"
                />
                <span className="text-xs tracking-[0.1em] uppercase text-foreground capitalize">
                  {key.replace("is", "")}
                </span>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Tags */}
      <section>
        <p className="mb-4 border-b border-border pb-2 text-xs tracking-[0.2em] uppercase text-foreground">Tags</p>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <label key={tag.id} className="flex items-center gap-2 cursor-pointer border border-border px-3 py-1.5">
              <input
                type="checkbox"
                checked={selectedTagIds.has(tag.id)}
                onChange={() => toggleTag(tag.id)}
                className="accent-foreground"
              />
              <span className="text-xs">{tag.name}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Related products */}
      {!isNew && allProducts.length > 0 && (
        <section>
          <p className="mb-4 border-b border-border pb-2 text-xs tracking-[0.2em] uppercase text-foreground">
            Related products
          </p>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
            {allProducts
              .filter((p) => p.id !== productId)
              .map((p) => (
                <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRelatedIds.has(p.id)}
                    onChange={() => toggleRelated(p.id)}
                    className="accent-foreground"
                  />
                  <span className="text-xs text-foreground">{p.name}</span>
                </label>
              ))}
          </div>
        </section>
      )}

      {/* SEO */}
      <section>
        <p className="mb-4 border-b border-border pb-2 text-xs tracking-[0.2em] uppercase text-foreground">SEO</p>
        <div className="space-y-4">
          <Field label="SEO title (max 60 chars)">
            <input name="seoTitle" value={form.seoTitle} onChange={handleChange} maxLength={60} className={inputCls} />
          </Field>
          <Field label="SEO description (max 160 chars)">
            <textarea name="seoDescription" value={form.seoDescription} onChange={handleChange} rows={2} maxLength={160} className={inputCls} />
          </Field>
        </div>
      </section>

      {/* Save button */}
      <div className="flex items-center gap-4 border-t border-border pt-6">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="border border-foreground bg-foreground px-8 py-3 text-xs tracking-[0.2em] uppercase text-background hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {isPending ? "Saving..." : isNew ? "Create product" : "Save changes"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-foreground">{success}</p>}
      </div>

      {/* Images (edit only) */}
      {!isNew && (
        <section>
          <p className="mb-4 border-b border-border pb-2 text-xs tracking-[0.2em] uppercase text-foreground">Images</p>
          <div className="flex flex-wrap gap-4 mb-4">
            {images.map((img) => (
              <div key={img.id} className="w-[100px] space-y-1">
                <div className="relative">
                  <Image src={img.url} alt={img.alt} width={100} height={125} className="object-cover border border-border" />
                  {img.isPrimary && (
                    <span className="absolute top-1 left-1 bg-foreground text-background text-[10px] px-1">Primary</span>
                  )}
                  <div className="absolute top-1 right-1 flex gap-1">
                    {!img.isPrimary && (
                      <form action={setPrimaryImageAction}>
                        <input type="hidden" name="imageId" value={img.id} />
                        <input type="hidden" name="productId" value={productId ?? ""} />
                        <button type="submit" title="Set as primary" className="bg-background border border-border p-0.5 hover:bg-muted">
                          <Star size={10} />
                        </button>
                      </form>
                    )}
                    <form action={deleteProductImageAction}>
                      <input type="hidden" name="imageId" value={img.id} />
                      <button type="submit" title="Delete" className="bg-background border border-border p-0.5 hover:text-red-600">
                        <Trash2 size={10} />
                      </button>
                    </form>
                  </div>
                </div>
                <form
                  action={setImageColorAction}
                  onSubmit={(e) => {
                    const input = e.currentTarget.elements.namedItem("color") as HTMLInputElement;
                    setImages((prev) => prev.map((p) => (p.id === img.id ? { ...p, color: input.value.trim() || null } : p)));
                  }}
                >
                  <input type="hidden" name="imageId" value={img.id} />
                  <input type="hidden" name="productId" value={productId ?? ""} />
                  <input
                    name="color"
                    defaultValue={img.color ?? ""}
                    onBlur={(e) => e.currentTarget.form?.requestSubmit()}
                    placeholder="Color"
                    title="Tag this image with a color name (matches a variant's Color field)"
                    className="w-full border border-border bg-transparent px-1.5 py-1 text-[10px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </form>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer border border-dashed border-border px-4 py-3 text-xs text-muted-foreground hover:border-foreground hover:text-foreground transition-colors w-fit">
              <Plus size={14} />
              Upload image
              <input type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" />
            </label>
            <input
              value={uploadColor}
              onChange={(e) => setUploadColor(e.target.value)}
              placeholder="Color (optional)"
              title="Tag the next uploaded image with a color name"
              className="border border-border bg-transparent px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Requires the <code className="font-mono">product-images</code> bucket to be created and set to public in Supabase Storage.
            Tag an image with a color name matching a variant&apos;s Color field to show it as that color&apos;s swatch on the shop card.
          </p>
        </section>
      )}

      {/* Variants (edit only) */}
      {!isNew && (
        <VariantsSection productId={productId!} initialVariants={initialVariants} />
      )}
    </div>
  );
}

// ── Variants ──────────────────────────────────────────────────────────────────

function VariantsSection({
  productId,
  initialVariants,
}: {
  productId: string;
  initialVariants: ProductVariant[];
}) {
  const [showNew, setShowNew] = useState(false);
  const [varState, varAction] = useActionState(saveVariantAction, null);

  return (
    <section>
      <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
        <p className="text-xs tracking-[0.2em] uppercase text-foreground">Variants</p>
        <button
          onClick={() => setShowNew((v) => !v)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showNew ? "Cancel" : "Add variant"}
        </button>
      </div>

      {initialVariants.length > 0 && (
        <table className="w-full text-xs mb-4">
          <thead>
            <tr className="text-muted-foreground border-b border-border">
              <th className="pb-2 text-left font-normal">SKU</th>
              <th className="pb-2 text-left font-normal">Size</th>
              <th className="pb-2 text-left font-normal">Color</th>
              <th className="pb-2 text-left font-normal">Hex</th>
              <th className="pb-2 text-right font-normal">Price</th>
              <th className="pb-2 text-right font-normal">Stock</th>
              <th className="pb-2 text-center font-normal">Active</th>
              <th className="pb-2 text-right font-normal">Save</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {initialVariants.map((v) => (
              <VariantRow key={v.id} variant={v} productId={productId} />
            ))}
          </tbody>
        </table>
      )}

      {showNew && (
        <form action={varAction} className="border border-dashed border-border p-4 space-y-3">
          <p className="text-xs text-muted-foreground mb-2">New variant</p>
          <input type="hidden" name="productId" value={productId} />
          <div className="grid grid-cols-3 gap-3">
            <Field label="SKU"><input name="sku" required className={inputCls} /></Field>
            <Field label="Size"><input name="size" className={inputCls} /></Field>
            <Field label="Color"><input name="color" className={inputCls} /></Field>
            <Field label="Color hex"><input name="colorHex" type="text" placeholder="#000000" className={inputCls} /></Field>
            <Field label="Price (CAD)"><input name="priceCents" type="number" min="1" required className={inputCls} placeholder="Cents (e.g. 12500)" /></Field>
            <Field label="Stock"><input name="stockQuantity" type="number" min="0" defaultValue="0" className={inputCls} /></Field>
            <Field label="Active">
              <select name="isActive" className={inputCls}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </Field>
          </div>
          {varState?.error && <p className="text-xs text-red-600">{varState.error}</p>}
          {varState?.success && <p className="text-xs text-foreground">{varState.success}</p>}
          <button type="submit" className="border border-foreground bg-foreground px-5 py-2 text-xs tracking-[0.15em] uppercase text-background hover:opacity-80 transition-opacity">
            Save variant
          </button>
        </form>
      )}
    </section>
  );
}

function VariantRow({ variant: v, productId }: { variant: ProductVariant; productId: string }) {
  const [, action] = useActionState(saveVariantAction, null);
  return (
    <tr>
      <td className="py-2 pr-2">{v.sku}</td>
      <td className="py-2 pr-2">{v.size ?? "—"}</td>
      <td className="py-2 pr-2">{v.color ?? "—"}</td>
      <form action={action} className="contents">
        <input type="hidden" name="id" value={v.id} />
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="sku" value={v.sku} />
        <input type="hidden" name="size" value={v.size ?? ""} />
        <input type="hidden" name="color" value={v.color ?? ""} />
        <input type="hidden" name="isActive" value={String(v.isActive)} />
        <td className="py-2 pr-2">
          <input name="colorHex" type="text" defaultValue={v.colorHex ?? ""} placeholder="#000000" className="w-20 border border-border bg-transparent px-2 py-1 text-xs focus:outline-none" />
        </td>
        <td className="py-2 pr-2">
          <input name="priceCents" type="number" defaultValue={v.priceCents} min="1" className="w-24 border border-border bg-transparent px-2 py-1 text-xs focus:outline-none" />
        </td>
        <td className="py-2 pr-2 text-right">
          <input name="stockQuantity" type="number" defaultValue={v.stockQuantity} min="0" className="w-16 border border-border bg-transparent px-2 py-1 text-xs focus:outline-none" />
        </td>
        <td className="py-2 text-center">{v.isActive ? "Yes" : "No"}</td>
        <td className="py-2 text-right">
          <button type="submit" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Save
          </button>
        </td>
      </form>
    </tr>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs tracking-[0.1em] uppercase text-foreground">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground";
