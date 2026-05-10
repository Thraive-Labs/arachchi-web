import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterSignup } from "@/components/NewsletterSignup";

export const metadata: Metadata = {
  title: "About — Arachchi",
  description:
    "Arachchi is a Toronto-based luxury clothing house rooted in the belief that clothing should be felt before it is seen.",
};

export default function AboutPage() {
  return (
    <main className="pt-24 pb-32">
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] mb-24 overflow-hidden">
        <div className="absolute inset-0 bg-muted" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-6">
            Est. Toronto, 2024
          </p>
          <h1 className="font-serif text-5xl md:text-7xl font-light tracking-wide text-foreground">
            About Arachchi
          </h1>
        </div>
      </section>

      {/* Brand statement */}
      <section className="max-w-3xl mx-auto px-6 text-center mb-24">
        <p className="font-serif text-2xl md:text-3xl font-light leading-relaxed tracking-wide text-foreground">
          Clothing should be felt before it is seen. Arachchi exists in that space between
          restraint and expression — where a garment becomes a second skin.
        </p>
      </section>

      {/* Story */}
      <section className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24 items-center">
        <div className="aspect-[3/4] bg-muted" />
        <div className="space-y-6">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">Our story</p>
          <h2 className="font-serif text-3xl font-light tracking-wide">
            Born from a different kind of discipline
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Arachchi began not with a runway, but with a question: what does it mean to dress
              with intention? Founded in Toronto by a team shaped by architecture, material science,
              and a deep respect for craft traditions across South Asia and Europe, the house was
              built on the conviction that luxury is not a price point — it is a standard of care.
            </p>
            <p>
              Every collection starts with fabric. We work with mills that have been producing
              textiles for generations, choosing fibres for how they age, how they breathe, how
              they reward years of wear. Construction is unhurried. Finishing is considered.
              Nothing is made to be discarded.
            </p>
            <p>
              We are based in Toronto because this city asks you to be real. There is no
              performance here. Our clothes reflect that — they are designed for a life that is
              actually lived.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted/30 py-20 px-6 mb-24">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground text-center mb-12">
            What we believe
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "Material honesty",
                body: "We name every fibre, describe every origin. You should know exactly what you are wearing and where it came from.",
              },
              {
                title: "Considered production",
                body: "Small runs. Deliberate choices. We produce less so that each piece receives the attention it deserves.",
              },
              {
                title: "Permanence over trend",
                body: "We do not follow seasons. We design clothes that belong to no particular moment and therefore to every moment.",
              },
            ].map((v) => (
              <div key={v.title} className="space-y-4">
                <h3 className="font-serif text-xl font-light tracking-wide">{v.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Craft image */}
      <section className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24 items-center">
        <div className="order-2 lg:order-1 space-y-6">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">The craft</p>
          <h2 className="font-serif text-3xl font-light tracking-wide">
            Made to last more than a season
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Each Arachchi piece is constructed with a level of finish that most customers will
              never see — and that is exactly the point. The interior of a jacket matters as much
              as the exterior. The seam allowance is generous. The button thread is knotted by
              hand. We hold these standards not because we talk about them, but because we believe
              they are felt.
            </p>
            <p>
              We work with a small network of production partners, all within arms reach of our
              design team. Oversight is not outsourced.
            </p>
          </div>
        </div>
        <div className="order-1 lg:order-2 aspect-[3/4] bg-muted" />
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 text-center mb-24">
        <p className="font-serif text-2xl font-light tracking-wide mb-8">
          Discover the collection
        </p>
        <Link
          href="/shop"
          className="inline-block border border-foreground bg-foreground px-10 py-3.5 text-xs tracking-[0.2em] uppercase text-background hover:opacity-80 transition-opacity"
        >
          Shop now
        </Link>
      </section>

      {/* Newsletter */}
      <section className="border-t border-border pt-20 max-w-lg mx-auto px-6 text-center">
        <h2 className="font-serif text-xl font-light tracking-wide mb-2">Stay close</h2>
        <p className="text-sm text-muted-foreground mb-8">
          New arrivals, editorial notes, and quiet updates from the studio.
        </p>
        <NewsletterSignup source="about" />
      </section>
    </main>
  );
}
