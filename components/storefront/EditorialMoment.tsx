import Image from "next/image";
import Link from "next/link";

export function EditorialMoment() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 py-16 lg:px-8 lg:py-24" aria-label="Editorial">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src="https://picsum.photos/seed/editorial-moment/900/1125"
            alt="Arachchi editorial"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        {/* Text */}
        <div className="lg:pl-12">
          <p className="mb-6 text-xs tracking-[0.3em] uppercase text-muted-foreground">
            The Journal
          </p>
          <h2 className="font-serif text-3xl font-light leading-[1.3] text-foreground md:text-4xl">
            On the art of dressing slowly.
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            There is a kind of pleasure in taking a long time to get dressed — in holding a piece of fabric up to light, in trying something three ways before choosing the first. We think about that when we design.
          </p>
          <Link
            href="/about"
            className="mt-8 inline-block text-xs tracking-[0.2em] uppercase text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors"
          >
            About Arachchi
          </Link>
        </div>
      </div>
    </section>
  );
}
