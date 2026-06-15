"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

const SPEED_PX_S = 55;

const storeImages = [
  { src: "/images/convergence/1.jpeg", slug: "convergence-jacket",   name: "Convergence Jacket",   price: "CAD $895"   },
  { src: "/images/convergence/2.jpeg", slug: "convergence-trousers", name: "Convergence Trousers", price: "CAD $485"   },
  { src: "/images/convergence/3.jpeg", slug: "convergence-tee",      name: "Convergence T-Shirt",  price: "CAD $285"   },
  { src: "/images/convergence/4.jpeg", slug: "convergence-denims",   name: "Convergence Denims",   price: "CAD $385"   },
  { src: "/images/zenith/1.jpeg",      slug: "zenith-coat",          name: "Zenith Coat",          price: "CAD $1,250" },
  { src: "/images/zenith/2.jpeg",      slug: "zenith-dress",         name: "Zenith Dress",         price: "CAD $795"   },
  { src: "/images/zenith/3.jpeg",      slug: "zenith-knit",          name: "Zenith Knit",          price: "CAD $545"   },
  { src: "/images/zenith/4.jpeg",      slug: "zenith-blouse",        name: "Zenith Blouse",        price: "CAD $395"   },
  { src: "/images/monolith/1.jpeg",    slug: "monolith-jacket",      name: "Monolith Jacket",      price: "CAD $985"   },
  { src: "/images/monolith/2.jpeg",    slug: "monolith-trousers",    name: "Monolith Trousers",    price: "CAD $525"   },
  { src: "/images/vale/1.jpeg",        slug: "vale-shirt",           name: "Vale Shirt",           price: "CAD $345"   },
  { src: "/images/vale/2.jpeg",        slug: "vale-trouser",         name: "Vale Trouser",         price: "CAD $445"   },
  { src: "/images/vale/3.jpeg",        slug: "vale-knit",            name: "Vale Knit",            price: "CAD $485"   },
  { src: "/images/vale/4.jpeg",        slug: "vale-dress",           name: "Vale Dress",           price: "CAD $695"   },
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
              href={`/product/${img.slug}`}
              className="group flex-none w-64 sm:w-72 lg:w-80"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-black">
                <Image
                  src={img.src}
                  alt={img.name}
                  fill
                  sizes="320px"
                  className="object-contain transition-opacity duration-300 group-hover:opacity-90"
                  priority={i < 6}
                />
              </div>
              <div className="mt-3 space-y-1">
                <p className="text-xs tracking-[0.15em] uppercase text-foreground leading-relaxed">
                  {img.name}
                </p>
                <p className="text-xs text-foreground/70">{img.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
