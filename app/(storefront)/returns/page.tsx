import type { Metadata } from "next";

export const metadata: Metadata = { title: "Returns" };

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 pt-32 pb-24 lg:px-8">
      <h1 className="font-serif text-3xl font-light tracking-wide mb-10">Returns</h1>
      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-3 text-xs tracking-[0.2em] uppercase text-foreground">30-day returns</h2>
          <p>We accept returns within 30 days of delivery for items in their original, unworn condition with all tags attached. Sale items are final sale.</p>
        </section>
        <section>
          <h2 className="mb-3 text-xs tracking-[0.2em] uppercase text-foreground">How to return</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Log in to your account and select the order you wish to return.</li>
            <li>Select the items and reason for return.</li>
            <li>Print the prepaid return label (Canadian orders only).</li>
            <li>Drop off at any Canada Post location.</li>
          </ol>
          <p className="mt-3">Guest purchasers can initiate a return by contacting us at <a href="mailto:returns@arachchi.com" className="text-foreground underline underline-offset-4">returns@arachchi.com</a> with your order number.</p>
        </section>
        <section>
          <h2 className="mb-3 text-xs tracking-[0.2em] uppercase text-foreground">Refunds</h2>
          <p>Refunds are issued to the original payment method within 5–10 business days of us receiving and inspecting the return. We will notify you by email once the refund is processed.</p>
        </section>
        <section>
          <h2 className="mb-3 text-xs tracking-[0.2em] uppercase text-foreground">Exceptions</h2>
          <p>Items marked as final sale, altered, washed, or worn cannot be returned. Accessories (scarves, hats, bags) must be in original packaging.</p>
        </section>
      </div>
    </div>
  );
}
