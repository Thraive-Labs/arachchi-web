import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getStripe } from "@/lib/stripe/server";

export const metadata: Metadata = { title: "Order confirmed" };

interface PageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { session_id } = await searchParams;

  if (!session_id) redirect("/cart");

  let email: string | null = null;
  const orderNumber: string | null = null;

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") redirect("/cart");

    email = session.customer_details?.email ?? session.customer_email ?? null;
  } catch {
    // Stripe not configured or session invalid — show generic confirmation
  }

  return (
    <div className="mx-auto max-w-2xl px-6 pt-32 pb-24 lg:px-8 text-center">
      <p className="mb-6 text-xs tracking-[0.3em] uppercase text-muted-foreground">Order confirmed</p>

      <h1 className="font-serif text-4xl font-light tracking-wide mb-6">
        Thank you.
      </h1>

      <p className="text-sm leading-relaxed text-muted-foreground max-w-sm mx-auto mb-2">
        Your order has been placed and is being prepared.
        {email && (
          <> A confirmation has been sent to <span className="text-foreground">{email}</span>.</>
        )}
      </p>

      {orderNumber && (
        <p className="text-xs text-muted-foreground mb-8">Order {orderNumber}</p>
      )}

      <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Link
          href="/account/orders"
          className="border border-foreground bg-foreground px-10 py-3 text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-80"
        >
          View orders
        </Link>
        <Link
          href="/shop"
          className="border border-border px-10 py-3 text-xs tracking-[0.2em] uppercase text-foreground transition-colors hover:border-foreground"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
