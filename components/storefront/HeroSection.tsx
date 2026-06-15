"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const INTERVAL_MS = 5500;

const slides = [
  {
    image: "/images/img1.jpeg",
    objectFit: "contain" as const,
    season: "Autumn / Winter 2026",
    headline: ["Dressed", "with", "intention."],
    cta: { label: "Explore Collection", href: "/shop" },
  },
  {
    image: "/images/img2.jpeg",
    objectFit: "contain" as const,
    season: "New Arrivals",
    headline: ["Built", "to last", "a decade."],
    cta: { label: "Shop Now", href: "/shop" },
  },
  {
    image: "/images/img3.jpeg",
    objectFit: "contain" as const,
    season: "The Edit",
    headline: ["Less,", "considered", "more."],
    cta: { label: "View the Store", href: "/shop" },
  },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const slideStartRef = useRef<number>(Date.now());

  useEffect(() => {
    slideStartRef.current = Date.now();
  }, [current]);

  useEffect(() => {
    if (paused) return;
    const elapsed = Date.now() - slideStartRef.current;
    const remaining = Math.max(600, INTERVAL_MS - elapsed);
    const id = setTimeout(
      () => setCurrent((c) => (c + 1) % slides.length),
      remaining,
    );
    return () => clearTimeout(id);
  }, [paused, current]);

  return (
    <section
      className="relative h-screen min-h-[640px] overflow-hidden bg-black"
      aria-label="Hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Image layer — crossfade */}
      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          <Image
            src={slides[current].image}
            alt=""
            fill
            priority={current === 0}
            sizes="100vw"
            style={{ objectFit: slides[current].objectFit }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Left-to-right gradient — keeps text legible */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.10) 100%)",
        }}
        aria-hidden="true"
      />
      {/* Bottom vignette */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.40) 0%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* Text content */}
      <div className="absolute inset-0 flex flex-col justify-end px-8 pb-24 lg:px-20 lg:pb-32">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Season label */}
            <div className="mb-8 flex items-center gap-4">
              <div className="h-px w-8 bg-white/50" aria-hidden="true" />
              <p className="text-[9px] tracking-[0.5em] uppercase text-white/65">
                {slides[current].season}
              </p>
            </div>

            {/* Headline */}
            <h1
              className="font-serif font-light leading-[0.93] tracking-tight text-white"
              style={{ fontSize: "clamp(3.75rem, 8.5vw, 9rem)" }}
            >
              {slides[current].headline.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h1>

            {/* CTA */}
            <div className="mt-12">
              <Link
                href={slides[current].cta.href}
                className="inline-block border border-white/65 px-9 py-3.5 text-[10px] tracking-[0.3em] uppercase text-white transition-colors duration-200 hover:bg-white hover:text-foreground"
              >
                {slides[current].cta.label}
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide navigation — bottom right */}
      <div className="absolute bottom-8 right-8 flex flex-col items-end gap-3 lg:right-20">
        <span
          className="font-mono text-[10px] tracking-[0.15em] text-white/40"
          aria-live="polite"
          aria-atomic="true"
        >
          {String(current + 1).padStart(2, "0")} /{" "}
          {String(slides.length).padStart(2, "0")}
        </span>
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-px transition-all duration-300 ${
                i === current ? "w-10 bg-white" : "w-5 bg-white/35"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
