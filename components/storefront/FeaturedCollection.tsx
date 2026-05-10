import Image from "next/image";
import Link from "next/link";

const tiles = [
  {
    label: "Outerwear",
    href: "/shop?category=outerwear",
    image: "https://picsum.photos/seed/featured-outerwear/900/1100",
    aspect: "aspect-[3/4]",
  },
  {
    label: "Knitwear",
    href: "/shop?category=knitwear",
    image: "https://picsum.photos/seed/featured-knitwear/900/1100",
    aspect: "aspect-[3/4]",
  },
  {
    label: "Summer 2026",
    href: "/shop/tag/summer-2026",
    image: "https://picsum.photos/seed/featured-summer/900/1100",
    aspect: "aspect-[3/4]",
  },
];

export function FeaturedCollection() {
  return (
    <section className="bg-muted py-16 lg:py-24" aria-label="Featured collections">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-8">
        <p className="mb-10 text-xs tracking-[0.3em] uppercase text-muted-foreground">
          Collections
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {tiles.map((tile) => (
            <Link key={tile.href} href={tile.href} className="group relative overflow-hidden">
              <div className={`relative ${tile.aspect} w-full`}>
                <Image
                  src={tile.image}
                  alt={tile.label}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-foreground/10 transition-opacity duration-300 group-hover:bg-foreground/20" />
                <div className="absolute bottom-6 left-6">
                  <span className="text-xs tracking-[0.25em] uppercase text-background">
                    {tile.label}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
