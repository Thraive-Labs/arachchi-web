import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getUser } from "@/lib/auth/server";
import { getOrderById } from "@/lib/db/queries/orders";
import { formatPriceCents } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order ${id.slice(0, 8).toUpperCase()}` };
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  paid: "Processing",
  fulfilled: "Fulfilled",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export default async function OrderDetailPage({ params }: PageProps) {
  const user = await getUser();
  if (!user) return null;

  const { id } = await params;
  const order = await getOrderById(id, user.id);
  if (!order) notFound();

  return (
    <div>
      <Link
        href="/account/orders"
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; Order history
      </Link>

      <div className="mt-6 mb-8 flex flex-wrap items-baseline gap-4">
        <h1 className="font-serif text-3xl font-light tracking-wide">
          {order.orderNumber}
        </h1>
        <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      <p className="text-xs text-muted-foreground mb-8">
        Placed{" "}
        {new Date(order.createdAt).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      {/* Items */}
      <section className="mb-8">
        <p className="mb-4 text-xs tracking-[0.2em] uppercase text-foreground">
          Items
        </p>
        <div className="divide-y divide-border border-t border-border">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm text-foreground">{item.productName}</p>
                <p className="text-xs text-muted-foreground">{item.variantLabel}</p>
              </div>
              <div className="text-right text-sm">
                <p className="text-foreground">
                  {formatPriceCents(item.lineTotalCents)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Qty {item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Totals */}
      <section className="mb-8 max-w-xs ml-auto space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPriceCents(order.subtotalCents)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span>
            {order.shippingCents === 0 ? "Free" : formatPriceCents(order.shippingCents)}
          </span>
        </div>
        {order.discountCents > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Discount</span>
            <span>-{formatPriceCents(order.discountCents)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax</span>
          <span>{formatPriceCents(order.taxCents)}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-3 text-sm font-medium">
          <span>Total</span>
          <span>
            {formatPriceCents(order.totalCents)} {order.currency}
          </span>
        </div>
      </section>

      {/* Tracking */}
      {order.trackingNumber && (
        <section className="border border-border p-5">
          <p className="text-xs tracking-[0.2em] uppercase text-foreground mb-2">
            Tracking
          </p>
          {order.trackingUrl ? (
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity"
            >
              {order.trackingNumber}
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">{order.trackingNumber}</p>
          )}
        </section>
      )}

      {/* Help */}
      <div className="mt-8 text-xs text-muted-foreground">
        <p>
          Need help with this order?{" "}
          <Link href="/contact" className="text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}
