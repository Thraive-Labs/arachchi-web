import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="flex min-h-screen flex-col lg:flex-row" aria-label="Hero">
      {/* ── Left: editorial text panel ── */}
      <div className="relative flex w-full flex-col justify-end overflow-hidden bg-secondary px-8 pb-20 pt-32 lg:w-[54%] lg:px-20 lg:pb-28">

        {/* Thin left accent bar */}
        <div className="absolute left-0 top-0 h-full w-[3px] bg-accent/40" aria-hidden="true" />

        {/* Large decorative watermark letter */}
        <span
          className="pointer-events-none absolute -right-6 bottom-0 select-none font-serif leading-none text-foreground/[0.05]"
          style={{ fontSize: "clamp(14rem, 28vw, 26rem)" }}
          aria-hidden="true"
        >
          A
        </span>

        {/* Subtle top gradient fade */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-foreground/[0.03] to-transparent" aria-hidden="true" />

        {/* Collection tag */}
        <div
          className="anim-rise mb-10 flex items-center gap-4"
          style={{ animationDelay: "0ms" }}
        >
          <div className="h-px w-10 bg-foreground/25" aria-hidden="true" />
          <p className="text-[9px] tracking-[0.45em] uppercase text-muted-foreground">
            Autumn / Winter 2026
          </p>
        </div>

        {/* Main headline */}
        <h1
          className="anim-rise font-serif font-light leading-[1.04] tracking-tight text-foreground"
          style={{
            animationDelay: "120ms",
            fontSize: "clamp(3.25rem, 5.5vw, 7rem)",
          }}
        >
          Dressed
          <br />
          <em className="not-italic text-accent">with intention.</em>
        </h1>

        {/* Editorial copy */}
        <p
          className="anim-rise mt-7 max-w-[28ch] text-sm leading-[1.75] text-muted-foreground"
          style={{ animationDelay: "260ms" }}
        >
          Quietly considered clothing for the deliberate wardrobe.
          Made to last a decade, not a season.
        </p>

        {/* CTAs */}
        <div
          className="anim-rise mt-12 flex items-center gap-10"
          style={{ animationDelay: "380ms" }}
        >
          <Link
            href="/shop"
            className="inline-block border border-foreground px-9 py-3.5 text-[10px] tracking-[0.25em] uppercase text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
          >
            Explore the collection
          </Link>
          <Link
            href="/lookbook"
            className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground underline-offset-4 transition-opacity hover:opacity-60 hover:underline"
          >
            Lookbook
          </Link>
        </div>

        {/* Scroll cue */}
        <div
          className="anim-rise mt-16 hidden lg:flex lg:flex-col lg:items-start lg:gap-3"
          style={{ animationDelay: "900ms" }}
          aria-hidden="true"
        >
          <div className="h-10 w-px bg-foreground/20" />
          <span className="text-[8px] tracking-[0.3em] uppercase text-muted-foreground/60">Scroll</span>
        </div>
      </div>

      {/* ── Right: editorial image ── */}
      <div className="relative h-[70vw] w-full lg:h-auto lg:w-[46%]">
        <Image
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=85&fit=crop&crop=top"
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 46vw"
          priority
          className="object-cover"
        />
        {/* Subtle left-edge vignette where image meets text */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-secondary/30 to-transparent" aria-hidden="true" />
      </div>
    </section>
  );
}
