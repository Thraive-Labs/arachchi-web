"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SLIDE_INTERVAL_MS = 3500;

const collections = [
  {
    index: "01",
    name: "Convergence",
    description: "The meeting of structure and movement.",
    href: "/shop?collection=convergence",
    images: [
      "/images/convergence/1.jpeg",
      "/images/convergence/2.jpeg",
      "/images/convergence/3.jpeg",
      "/images/convergence/4.jpeg",
    ],
  },
  {
    index: "02",
    name: "Zenith",
    description: "A study in elevation — garments reaching their highest form.",
    href: "/shop?collection=zenith",
    images: [
      "/images/zenith/1.jpeg",
      "/images/zenith/2.jpeg",
      "/images/zenith/3.jpeg",
      "/images/zenith/4.jpeg",
    ],
  },
  {
    index: "03",
    name: "Monolith",
    description: "Singular. Unmovable. Built to endure.",
    href: "/shop?collection=monolith",
    images: [
      "/images/monolith/1.jpeg",
      "/images/monolith/2.jpeg",
    ],
  },
  {
    index: "04",
    name: "Vale",
    description: "Quieter. Earthen. Close to the ground.",
    href: "/shop?collection=vale",
    images: [
      "/images/vale/1.jpeg",
      "/images/vale/2.jpeg",
      "/images/vale/3.jpeg",
      "/images/vale/4.jpeg",
    ],
  },
];

function CollectionImageCarousel({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(
      () => setCurrent((c) => (c + 1) % images.length),
      SLIDE_INTERVAL_MS,
    );
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div className="relative aspect-[3/2] overflow-hidden bg-black">
      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        >
          <Image
            src={images[current]}
            alt={`${name} collection`}
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-contain"
          />
        </motion.div>
      </AnimatePresence>

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrent(i);
              }}
              aria-label={`Image ${i + 1}`}
              className={`h-px transition-all duration-300 ${
                i === current ? "w-8 bg-white" : "w-4 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FeaturedCollection() {
  return (
    <section className="py-16 lg:px-32 lg:py-24" aria-label="Collections">
      {/* Section header */}
      <div className="border-t border-foreground/12 pb-10 pt-8">
        <h2 className="text-sm tracking-[0.4em] uppercase text-muted-foreground">
          Collections
        </h2>
      </div>

      {/* Collection rows */}
      <div>
        {collections.map((col) => (
          <Link
            key={col.index}
            href={col.href}
            className="group block border-t border-foreground/10 last:border-b"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[60%_40%]">
              {/* Image carousel */}
              <CollectionImageCarousel images={col.images} name={col.name} />

              {/* Text */}
              <div className="flex flex-col justify-center py-8 pl-16 pr-6 lg:py-12 lg:pl-24 lg:pr-8">
                <p className="mb-5 text-[9px] tracking-[0.45em] text-muted-foreground">
                  {col.index}
                </p>
                <h3
                  className="font-serif font-light leading-none tracking-tight text-foreground"
                  style={{ fontSize: "clamp(2.5rem, 4vw, 5rem)" }}
                >
                  {col.name}
                </h3>
                <p className="mt-5 max-w-[28ch] text-sm leading-[1.75] text-muted-foreground">
                  {col.description}
                </p>
                <div className="mt-7 flex items-center gap-3">
                  <span className="text-[10px] tracking-[0.3em] uppercase text-foreground/60 transition-colors duration-200 group-hover:text-foreground">
                    Shop the collection
                  </span>
                  <svg
                    width="16"
                    height="10"
                    viewBox="0 0 16 10"
                    fill="none"
                    className="text-foreground/60 transition-all duration-200 group-hover:translate-x-2 group-hover:text-foreground"
                    aria-hidden="true"
                  >
                    <path
                      d="M0 5H14M10 1L15 5L10 9"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="square"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
