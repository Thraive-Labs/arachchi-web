"use client";

import { useEffect, useRef } from "react";
import { ProductCard } from "./ProductCard";

const SPEED_PX_S = 72; // pixels per second — increase to speed up

interface CarouselProduct {
  id: string;
  slug: string;
  name: string;
  basePriceCents: number;
  compareAtPriceCents?: number | null;
  primaryImage: string | null;
  secondaryImage?: string | null;
}

interface ProductCarouselProps {
  products: CarouselProduct[];
}

export function ProductCarousel({ products }: ProductCarouselProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const posRef   = useRef(0);   // current translateX offset in px
  const pausedRef = useRef(false);
  const rafRef   = useRef(0);
  const lastRef  = useRef(0);   // last rAF timestamp

  // Duplicate so the loop point is seamless
  const items = [...products, ...products];

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;

    const tick = (t: number) => {
      if (lastRef.current === 0) lastRef.current = t;
      const dt = Math.min(t - lastRef.current, 64); // cap delta so big pauses don't jump
      lastRef.current = t;

      if (!pausedRef.current) {
        posRef.current += (SPEED_PX_S * dt) / 1000;

        // When we've scrolled past exactly one full set, reset without visual jump
        const half = inner.scrollWidth / 2;
        if (half > 0 && posRef.current >= half) {
          posRef.current -= half;
        }

        inner.style.transform = `translateX(-${posRef.current}px)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const pause = () => { pausedRef.current = true; };

  const resume = () => {
    lastRef.current = 0; // reset so the first resumed frame has dt=0, no jump
    pausedRef.current = false;
  };

  const jump = (dir: "left" | "right") => {
    const inner = innerRef.current;
    if (!inner) return;
    const card = inner.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 24 : 296;
    const half = inner.scrollWidth / 2;
    // Modular arithmetic keeps posRef inside [0, half)
    posRef.current = ((posRef.current + (dir === "right" ? step : -step)) % half + half) % half;
    inner.style.transform = `translateX(-${posRef.current}px)`;
  };

  return (
    <div>
      {/* Clipping container — hover/touch pauses the belt */}
      <div
        ref={outerRef}
        className="overflow-hidden"
        onMouseEnter={pause}
        onMouseLeave={resume}
        onTouchStart={pause}
        onTouchEnd={() => setTimeout(resume, 400)}
      >
        {/* Moving strip — GPU-composited via will-change */}
        <div
          ref={innerRef}
          className="flex gap-4 pb-1 will-change-transform lg:gap-6"
          style={{ width: "max-content" }}
        >
          {items.map((product, i) => (
            <div
              key={`${product.id}-${i}`}
              className="w-64 flex-none sm:w-72 md:w-72 lg:w-80"
            >
              <ProductCard {...product} priority={i < 4} />
            </div>
          ))}
        </div>
      </div>

      {/* Manual arrow controls — always enabled since it's infinite */}
      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={() => jump("left")}
          aria-label="Previous products"
          className="flex h-9 w-9 items-center justify-center border border-foreground/30 text-foreground transition-all duration-150 hover:border-foreground hover:bg-foreground hover:text-background"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={() => jump("right")}
          aria-label="Next products"
          className="flex h-9 w-9 items-center justify-center border border-foreground/30 text-foreground transition-all duration-150 hover:border-foreground hover:bg-foreground hover:text-background"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}
