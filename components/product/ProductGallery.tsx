"use client";

import Image from "next/image";
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProductImage } from "@/lib/db/schema";

function resolveMediaType(item: ProductImage): "image" | "video" {
  if (item.mediaType === "video") return "video";
  const url = item.url.toLowerCase();
  if (url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".mov") || url.endsWith(".m4v")) return "video";
  return "image";
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [committed, setCommitted] = useState(0);
  const [hoveredThumb, setHoveredThumb] = useState<number | null>(null);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const touchStartX = useRef<number | null>(null);

  const active = hoveredThumb ?? committed;
  const currentItem = images[active];
  const mediaType = currentItem ? resolveMediaType(currentItem) : "image";

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (mediaType !== "image") return;
      const rect = e.currentTarget.getBoundingClientRect();
      setZoomOrigin({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    },
    [mediaType],
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(diff) > 50) {
      setCommitted((c) =>
        diff < 0 ? Math.min(c + 1, images.length - 1) : Math.max(c - 1, 0),
      );
    }
    touchStartX.current = null;
  };

  if (!images.length) return null;

  return (
    <div className="flex gap-4">
      {/* Thumbnail strip — desktop only */}
      {images.length > 1 && (
        <div className="hidden flex-col gap-2 lg:flex">
          {images.map((img, i) => {
            const thumbType = resolveMediaType(img);
            return (
              <button
                key={img.id}
                onClick={() => { setCommitted(i); setHoveredThumb(null); }}
                onMouseEnter={() => setHoveredThumb(i)}
                onMouseLeave={() => setHoveredThumb(null)}
                className={`relative h-16 w-12 overflow-hidden border transition-colors ${
                  i === committed
                    ? "border-foreground"
                    : "border-transparent hover:border-foreground/40"
                }`}
                aria-label={`View ${thumbType === "video" ? "video" : "image"} ${i + 1}`}
              >
                {thumbType === "video" ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <svg className="h-3 w-3 fill-foreground/50" viewBox="0 0 10 10" aria-hidden>
                      <path d="M2 1.5l7 3.5-7 3.5V1.5z" />
                    </svg>
                  </div>
                ) : img.url ? (
                  <Image src={img.url} alt={img.alt} fill sizes="48px" className="object-cover" />
                ) : null}
              </button>
            );
          })}
        </div>
      )}

      {/* Main media */}
      <div
        className="relative flex-1 aspect-[4/5] overflow-hidden bg-muted"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => {
          if (mediaType !== "image") return;
          if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches) {
            setIsZooming(true);
          }
        }}
        onMouseLeave={() => setIsZooming(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: mediaType === "image" ? "crosshair" : "default" }}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            {currentItem?.url ? (
              mediaType === "video" ? (
                <video
                  src={currentItem.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={currentItem.url}
                  alt={currentItem.alt ?? productName}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={active === 0}
                  className="object-cover"
                  style={{
                    transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                    transform: isZooming ? "scale(2.2)" : "scale(1)",
                    transition: "transform 0.25s ease",
                  }}
                />
              )
            ) : (
              <div className="absolute inset-0 bg-muted" />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Mobile swipe dot indicators */}
        {images.length > 1 && (
          <div
            className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 lg:hidden"
            aria-hidden
          >
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCommitted(i)}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === committed ? "bg-foreground" : "bg-foreground/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
