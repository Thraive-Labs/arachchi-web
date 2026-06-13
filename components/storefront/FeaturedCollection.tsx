import Image from "next/image";
import Link from "next/link";

const collections = [
  {
    index: "01",
    name: "Convergence",
    description: "The meeting of structure and movement.",
    href: "/shop?collection=convergence",
    image: "https://picsum.photos/seed/collection-convergence/1200/800",
  },
  {
    index: "02",
    name: "Zenith",
    description: "A study in elevation — garments reaching their highest form.",
    href: "/shop?collection=zenith",
    image: "https://picsum.photos/seed/collection-zenith/1200/800",
  },
  {
    index: "03",
    name: "Monolith",
    description: "Singular. Unmovable. Built to endure.",
    href: "/shop?collection=monolith",
    image: "https://picsum.photos/seed/collection-monolith/1200/800",
  },
  {
    index: "04",
    name: "Vale",
    description: "Quieter. Earthen. Close to the ground.",
    href: "/shop?collection=vale",
    image: "https://picsum.photos/seed/collection-vale/1200/800",
  },
];

export function FeaturedCollection() {
  return (
    <section
      className="py-16 lg:px-32 lg:py-24"
      aria-label="Collections"
    >
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
              {/* Image */}
              <div className="relative aspect-[3/2] overflow-hidden">
                <Image
                  src={col.image}
                  alt={col.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>

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
