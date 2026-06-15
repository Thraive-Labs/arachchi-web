"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

const SPEED_PX_S = 55;

const storeImages = [
  { src: "/images/convergence/1.jpeg", collection: "convergence", label: "Convergence" },
  { src: "/images/convergence/2.jpeg", collection: "convergence", label: "Convergence" },
  { src: "/images/zenith/1.jpeg",      collection: "zenith",      label: "Zenith"      },
  { src: "/images/zenith/2.jpeg",      collection: "zenith",      label: "Zenith"      },
  { src: "/images/monolith/1.jpeg",    collection: "monolith",    label: "Monolith"    },
  { src: "/images/vale/1.jpeg",        collection: "vale",        label: "Vale"        },
  { src: "/images/convergence/3.jpeg", collection: "convergence", label: "Convergence" },
  { src: "/images/convergence/4.jpeg", collection: "convergence", label: "Convergence" },
  { src: "/images/zenith/3.jpeg",      collection: "zenith",      label: "Zenith"      },
  { src: "/images/zenith/4.jpeg",      collection: "zenith",      label: "Zenith"      },
  { src: "/images/monolith/2.jpeg",    collection: "monolith",    label: "Monolith"    },
  { src: "/images/vale/2.jpeg",        collection: "vale",        label: "Vale"        },
  { src: "/images/vale/3.jpeg",        collection: "vale",        label: "Vale"        },
  { src: "/images/vale/4.jpeg",        collection: "vale",        label: "Vale"        },
];

export function CuratedPicks() {
  const innerRef = useRef<HTMLDivElement>(null);
  const posRef   = useRef(0);
  const pausedRef = useRef(false);
  const rafRef   = useRef(0);
  const lastRef  = useRef(0);

  const items = [...storeImages, ...storeImages];

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;

    const tick = (t: number) => {
      if (lastRef.current === 0) lastRef.current = t;
      const dt = Math.min(t - lastRef.current, 64);
      lastRef.current = t;

      if (!pausedRef.current) {
        posRef.current += (SPEED_PX_S * dt) / 1000;
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

  return (
    <section className="py-16 lg:px-32 lg:py-24" aria-label="Store">
      <div className="mb-10 flex items-end justify-between">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">STORE</p>
        <Link
          href="/shop"
          className="text-xs tracking-[0.15em] uppercase text-foreground/60 transition-colors hover:text-foreground"
        >
          View all
        </Link>
      </div>

      <div
        className="overflow-hidden"
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { lastRef.current = 0; pausedRef.current = false; }}
      >
        <div
          ref={innerRef}
          className="flex gap-4 pb-1 will-change-transform lg:gap-6"
          style={{ width: "max-content" }}
        >
          {items.map((img, i) => (
            <Link
              key={i}
              href={`/shop?collection=${img.collection}`}
              className="flex-none w-64 sm:w-72 lg:w-80"
              tabIndex={-1}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-black">
                <Image
                  src={img.src}
                  alt={img.label}
                  fill
                  sizes="320px"
                  className="object-contain"
                  priority={i < 6}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-white/80">
                    {img.label}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
