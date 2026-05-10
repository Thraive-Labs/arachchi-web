import Image from "next/image";
import Link from "next/link";

export function LookbookTeaser() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 py-16 lg:px-8 lg:py-24" aria-label="Lookbook">
      <Link href="/lookbook" className="group relative block overflow-hidden">
        <div className="relative aspect-[16/7] w-full">
          <Image
            src="https://picsum.photos/seed/lookbook-teaser/1440/630"
            alt="Arachchi Lookbook"
            fill
            sizes="100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-foreground/20" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <p className="text-xs tracking-[0.4em] uppercase text-background/80">
              Spring 2026
            </p>
            <h2 className="font-serif text-4xl font-light text-background md:text-6xl">
              The Lookbook
            </h2>
            <span className="mt-2 border border-background/70 px-6 py-2 text-xs tracking-[0.2em] uppercase text-background transition-colors group-hover:bg-background group-hover:text-foreground">
              View editorial
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
