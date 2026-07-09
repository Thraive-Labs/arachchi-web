import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shipping" };

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 pt-32 pb-24 lg:px-8">
      <h1 className="font-serif text-3xl font-light tracking-wide mb-10">Shipping</h1>
      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-3 text-xs tracking-[0.2em] uppercase text-foreground">Ceylon</h2>
          <p>Standard shipping (5–7 business days): Free on orders over $250 CAD. $15 CAD flat rate on orders under $250.</p>
          <p className="mt-2">Express shipping (2–3 business days): $25 CAD.</p>
          <p className="mt-2">Overnight (next business day, order by 12 pm ET): $45 CAD.</p>
        </section>
        <section>
          <h2 className="mb-3 text-xs tracking-[0.2em] uppercase text-foreground">United States</h2>
          <p>Standard shipping (7–10 business days): $25 CAD. Express (4–6 business days): $45 CAD.</p>
          <p className="mt-2">US customers are responsible for any applicable duties or import taxes.</p>
        </section>
        <section>
          <h2 className="mb-3 text-xs tracking-[0.2em] uppercase text-foreground">International</h2>
          <p>We ship to select international destinations. Rates and timelines are calculated at checkout based on destination and weight. International customers are responsible for all duties and customs fees.</p>
        </section>
        <section>
          <h2 className="mb-3 text-xs tracking-[0.2em] uppercase text-foreground">Order processing</h2>
          <p>Orders are processed Monday to Friday. Orders placed before 2 pm ET on business days ship the same day. Orders placed on weekends or holidays ship the following business day.</p>
        </section>
      </div>
    </div>
  );
}
