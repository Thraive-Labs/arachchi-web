import type { Metadata } from "next";

export const metadata: Metadata = { title: "FAQ" };

const faqs = [
  {
    group: "Orders",
    items: [
      { q: "Can I change or cancel my order?", a: "Orders can be changed or cancelled within 1 hour of placement by contacting us at hello@arachchi.com. After that, the order enters fulfillment and cannot be modified." },
      { q: "Do you offer gift wrapping?", a: "All orders ship in our signature packaging. We do not offer additional gift wrapping at this time, but every order is presentation-ready." },
    ],
  },
  {
    group: "Shipping",
    items: [
      { q: "How long does shipping take?", a: "Standard Canadian orders arrive in 5–7 business days. Express is 2–3 days. See our full shipping page for international details." },
      { q: "Do you ship internationally?", a: "Yes, to select destinations. Rates and timelines are shown at checkout. International customers are responsible for duties and customs fees." },
    ],
  },
  {
    group: "Returns",
    items: [
      { q: "What is your return policy?", a: "We accept returns within 30 days of delivery for unworn items with tags attached. Sale items are final sale." },
      { q: "How do I start a return?", a: "Log in to your account and visit your order history. Guest purchasers can email returns@arachchi.com with their order number." },
    ],
  },
  {
    group: "Products",
    items: [
      { q: "How do I know what size to order?", a: "Visit our size guide for detailed measurements by category. If you are between sizes, we generally recommend sizing up for a more relaxed fit." },
      { q: "How should I care for my Arachchi pieces?", a: "Care instructions are printed on each garment label and listed on every product page under Material & Care." },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 pt-32 pb-24 lg:px-8">
      <h1 className="font-serif text-3xl font-light tracking-wide mb-10">FAQ</h1>
      <div className="space-y-10">
        {faqs.map(({ group, items }) => (
          <section key={group}>
            <h2 className="mb-4 text-xs tracking-[0.2em] uppercase text-foreground">{group}</h2>
            <div className="divide-y divide-border border-t border-border">
              {items.map(({ q, a }) => (
                <details key={q} className="group py-4">
                  <summary className="flex cursor-pointer items-center justify-between text-sm text-foreground">
                    {q}
                    <span className="ml-4 shrink-0 text-muted-foreground group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
