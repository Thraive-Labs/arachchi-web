import Image from "next/image";
import Link from "next/link";

const hero = {
  image: "/images/hero.jpg",
  headline: ["Less,", "considered", "more."],
  cta: { label: "View the Store", href: "/shop" },
};

export function HeroSection() {
  return (
    <section
      className="relative h-screen min-h-[640px] overflow-hidden bg-black"
      aria-label="Hero"
    >
      {/* Image layer */}
      <div className="absolute inset-0">
        <Image
          src={hero.image}
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "contain" }}
        />
      </div>

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
        <div>
          {/* Headline */}
          <h1
            className="font-serif font-light leading-[0.93] tracking-tight text-white break-words"
            style={{ fontSize: "clamp(2.75rem, 8.5vw, 9rem)" }}
          >
            {hero.headline.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h1>

          {/* CTA */}
          <div className="mt-12">
            <Link
              href={hero.cta.href}
              className="inline-block border border-white/65 px-9 py-3.5 text-[10px] tracking-[0.3em] uppercase text-white transition-colors duration-200 hover:bg-white hover:text-foreground"
            >
              {hero.cta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
