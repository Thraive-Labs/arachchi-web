import type { Metadata } from "next";
import Image from "next/image";
import { NewsletterSignup } from "@/components/NewsletterSignup";

export const metadata: Metadata = {
  title: "Philosophy — Arachchi",
  description:
    "Quiet luxury. Engineered precision. The philosophy behind Arachchi — where Ceylon's textile heritage meets the structural precision of our Toronto studio.",
};

export default function AboutPage() {
  return (
    <main className="pt-24 pb-32">
      {/* Image */}
      <section className="relative mx-auto mb-20 aspect-[16/9] max-w-5xl overflow-hidden px-6">
        <div className="relative h-full w-full overflow-hidden">
          <Image
            src="/images/philosophy.png"
            alt="Arachchi — engineered precision"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
          />
        </div>
      </section>

      {/* Philosophy statement */}
      <section className="mx-auto max-w-2xl px-6 text-center">
        <h1 className="font-display text-4xl font-light text-foreground md:text-5xl">
          arachchi
        </h1>

        <div className="mt-12 space-y-6 text-sm leading-[1.9] text-muted-foreground md:text-base">
          <p>
            Our commitment to the craft is the culmination of decades spent in
            quiet pursuit of the perfect garment. We view fashion not as an
            exercise in trend, but as a discipline — a rigorous practice of
            editing, refining, and engineering.
          </p>
          <p>
            Our perspective is defined by a unique duality: the rich,
            enduring textile heritage of Ceylon and the structural, modern
            precision of our Toronto studio.
          </p>
          <p>
            From Ceylon, we inherit a deep respect for the tactile — an
            understanding of how fiber, hand, and patience create something
            that truly lasts. From Toronto, we adopt an architectural
            approach to utility — designing garments that are built to
            thrive in the demanding pace of the urban landscape.
          </p>
          <p>
            The result is clothing engineered with intention. We do not
            design for the moment; we design for the life lived within the
            seams. Our process is uncompromising, our materials are selected
            for their evolution, and our finish is, quite simply, the
            product of a lifetime of experience.
          </p>
          <p>
            This is arachchi: Quiet luxury. Engineered precision. A
            permanent fixture in a transient world.
          </p>
        </div>

        <p className="mt-14 font-serif text-2xl font-light tracking-wide text-foreground md:text-3xl">
          Don&apos;t just wear it. Be an arachchi.
        </p>
      </section>

      {/* Newsletter */}
      <section className="mx-auto mt-28 max-w-lg border-t border-border px-6 pt-20 text-center">
        <h2 className="font-serif text-xl font-light tracking-wide mb-2">Stay close</h2>
        <p className="text-sm text-muted-foreground mb-8">
          New arrivals, editorial notes, and quiet updates from the studio.
        </p>
        <NewsletterSignup source="about" />
      </section>
    </main>
  );
}
