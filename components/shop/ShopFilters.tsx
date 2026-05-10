"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import type { Category, Tag } from "@/lib/db/schema";

interface ShopFiltersProps {
  categories: Category[];
  tags: Tag[];
}

export function ShopFilters({ categories, tags }: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/shop?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const toggleTag = useCallback(
    (slug: string) => {
      const current = searchParams.get("tags")?.split(",").filter(Boolean) ?? [];
      const next = current.includes(slug)
        ? current.filter((t) => t !== slug)
        : [...current, slug];
      updateParam("tags", next.length ? next.join(",") : null);
    },
    [searchParams, updateParam],
  );

  const clearAll = () => {
    router.push("/shop", { scroll: false });
    setMobileOpen(false);
  };

  const activeCategory = searchParams.get("category") ?? "";
  const activeTags = searchParams.get("tags")?.split(",").filter(Boolean) ?? [];
  const activeSort = searchParams.get("sort") ?? "newest";
  const activeCount = (activeCategory ? 1 : 0) + activeTags.length + (activeSort !== "newest" ? 1 : 0);

  const filterContent = (
    <div className="space-y-8">
      {/* Sort */}
      <div>
        <p className="mb-3 text-xs tracking-[0.2em] uppercase text-foreground">Sort</p>
        <div className="space-y-2">
          {[
            { value: "newest", label: "Newest" },
            { value: "price-asc", label: "Price: low to high" },
            { value: "price-desc", label: "Price: high to low" },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => updateParam("sort", value === "newest" ? null : value)}
              className={`block text-xs transition-colors ${
                activeSort === value
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <div>
          <p className="mb-3 text-xs tracking-[0.2em] uppercase text-foreground">Category</p>
          <div className="space-y-2">
            <button
              onClick={() => updateParam("category", null)}
              className={`block text-xs transition-colors ${
                !activeCategory ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  updateParam("category", activeCategory === cat.slug ? null : cat.slug)
                }
                className={`block text-xs transition-colors ${
                  activeCategory === cat.slug
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div>
          <p className="mb-3 text-xs tracking-[0.2em] uppercase text-foreground">Collections</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const active = activeTags.includes(tag.slug);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.slug)}
                  className={`border px-3 py-1 text-xs transition-colors ${
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeCount > 0 && (
        <button
          onClick={clearAll}
          className="text-xs tracking-[0.1em] uppercase text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:block w-56 shrink-0">
        {/* Active chips on desktop */}
        {activeCount > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {activeCategory && (
              <ActiveChip
                label={categories.find((c) => c.slug === activeCategory)?.name ?? activeCategory}
                onRemove={() => updateParam("category", null)}
              />
            )}
            {activeTags.map((slug) => (
              <ActiveChip
                key={slug}
                label={tags.find((t) => t.slug === slug)?.name ?? slug}
                onRemove={() => toggleTag(slug)}
              />
            ))}
            {activeSort !== "newest" && (
              <ActiveChip
                label={activeSort === "price-asc" ? "Price: low–high" : "Price: high–low"}
                onRemove={() => updateParam("sort", null)}
              />
            )}
          </div>
        )}
        {filterContent}
      </aside>

      {/* ── Mobile filter bar ── */}
      <div className="lg:hidden">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center gap-2 border border-border px-4 py-2 text-xs tracking-[0.1em] uppercase text-foreground transition-colors hover:bg-muted"
          >
            <SlidersHorizontal size={12} />
            Filters
            {activeCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-background text-[10px]">
                {activeCount}
              </span>
            )}
          </button>

          {/* Active chips on mobile */}
          {activeCategory && (
            <ActiveChip
              label={categories.find((c) => c.slug === activeCategory)?.name ?? activeCategory}
              onRemove={() => updateParam("category", null)}
            />
          )}
          {activeTags.map((slug) => (
            <ActiveChip
              key={slug}
              label={tags.find((t) => t.slug === slug)?.name ?? slug}
              onRemove={() => toggleTag(slug)}
            />
          ))}
          {activeSort !== "newest" && (
            <ActiveChip
              label={activeSort === "price-asc" ? "Price: low–high" : "Price: high–low"}
              onRemove={() => updateParam("sort", null)}
            />
          )}
        </div>

        {/* Mobile filter panel */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 32 }}
                className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-y-auto bg-background border-t border-border px-6 pt-6 pb-10"
              >
                <div className="flex items-center justify-between mb-8">
                  <p className="text-xs tracking-[0.2em] uppercase text-foreground">Filters</p>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Close filters"
                  >
                    <X size={18} />
                  </button>
                </div>
                {filterContent}
                <div className="h-8" />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1.5 border border-foreground bg-foreground/5 px-3 py-1 text-xs text-foreground">
      {label}
      <button
        onClick={onRemove}
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X size={10} />
      </button>
    </span>
  );
}
