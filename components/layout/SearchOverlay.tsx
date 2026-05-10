"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { searchProductsAction, type SearchResult } from "@/app/actions/search";
import { formatPriceCents } from "@/lib/utils";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 80);
    else { setQuery(""); setResults([]); }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const search = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const data = await searchProductsAction(value);
        setResults(data);
      });
    }, 280);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 top-0 z-50 bg-background shadow-lg"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="mx-auto max-w-[1440px] px-6 py-5 lg:px-8">
              <div className="flex items-center gap-4">
                <svg className="h-4 w-4 shrink-0 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  ref={inputRef}
                  type="search"
                  placeholder="Search products…"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); search(e.target.value); }}
                  className="flex-1 bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <button onClick={onClose} aria-label="Close search" className="text-muted-foreground hover:text-foreground transition-colors">
                  <X size={18} />
                </button>
              </div>

              <AnimatePresence>
                {(results.length > 0 || (isPending && query.length > 1)) && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="border-t border-border py-4"
                  >
                    {isPending && results.length === 0 ? (
                      <p className="py-4 text-center text-xs text-muted-foreground">Searching…</p>
                    ) : (
                      <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-4">
                        {results.map((r) => (
                          <li key={r.id}>
                            <Link
                              href={`/product/${r.slug}`}
                              onClick={onClose}
                              className="flex items-center gap-3 rounded p-2 transition-colors hover:bg-muted"
                            >
                              <div className="relative h-14 w-10 shrink-0 overflow-hidden bg-muted">
                                {r.image && <Image src={r.image} alt={r.name} fill sizes="40px" className="object-cover" />}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-xs tracking-[0.1em] uppercase text-foreground">{r.name}</p>
                                <p className="mt-0.5 text-xs text-muted-foreground">{formatPriceCents(r.basePriceCents)}</p>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}
                {!isPending && query.length >= 2 && results.length === 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t border-border py-6 text-center text-xs text-muted-foreground"
                  >
                    No results for &ldquo;{query}&rdquo;
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
