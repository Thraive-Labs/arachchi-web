import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db/client";
import { orders, orderItems, addresses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { OrderStatusForm } from "./OrderStatusForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const [order] = await db
    .select({ orderNumber: orders.orderNumber })
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);
  return { title: order ? `Admin — Order ${order.orderNumber}` : "Admin — Order" };
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) notFound();

  const [items, shippingAddress] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, id)),
    order.shippingAddressId
      ? db
          .select()
          .from(addresses)
          .where(eq(addresses.id, order.shippingAddressId))
          .limit(1)
          .then((rows) => rows[0] ?? null)
      : Promise.resolve(null),
  ]);

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/orders"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Orders
        </Link>
        <h1 className="font-serif text-2xl font-light tracking-wide">
          Order {order.orderNumber}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="border border-border p-5">
            <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-4">Items</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs tracking-[0.1em] uppercase text-muted-foreground">
                  <th className="pb-2 text-left font-normal">Product</th>
                  <th className="pb-2 text-center font-normal">Qty</th>
                  <th className="pb-2 text-right font-normal">Unit</th>
                  <th className="pb-2 text-right font-normal">Line</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 pr-3">
                      <p className="text-foreground">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">{item.variantLabel}</p>
                    </td>
                    <td className="py-2.5 text-center text-muted-foreground">{item.quantity}</td>
                    <td className="py-2.5 text-right text-muted-foreground">
                      ${(item.unitPriceCents / 100).toFixed(2)}
                    </td>
                    <td className="py-2.5 text-right text-foreground">
                      ${((item.unitPriceCents * item.quantity) / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 pt-4 border-t border-border space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${(order.subtotalCents / 100).toFixed(2)}</span>
              </div>
              {order.discountCents > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Discount</span>
                  <span>-${(order.discountCents / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>
                  {order.shippingCents === 0
                    ? "Free"
                    : `$${(order.shippingCents / 100).toFixed(2)}`}
                </span>
              </div>
              {order.taxCents > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax</span>
                  <span>${(order.taxCents / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium text-foreground pt-1 border-t border-border">
                <span>Total</span>
                <span>
                  {order.currency.toUpperCase()} ${(order.totalCents / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </section>

          <section className="border border-border p-5">
            <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-4">
              Shipping address
            </p>
            {shippingAddress ? (
              <address className="not-italic text-sm text-foreground space-y-0.5">
                <p>{shippingAddress.fullName}</p>
                <p>{shippingAddress.line1}</p>
                {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
                <p>
                  {shippingAddress.city}, {shippingAddress.province}{" "}
                  {shippingAddress.postalCode}
                </p>
                <p>{shippingAddress.country}</p>
              </address>
            ) : (
              <p className="text-sm text-muted-foreground">No shipping address recorded.</p>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="border border-border p-5">
            <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-4">
              Order info
            </p>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Date</dt>
                <dd className="text-foreground">
                  {new Date(order.createdAt).toLocaleDateString("en-CA")}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Customer</dt>
                <dd className="text-foreground text-xs">{order.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Payment</dt>
                <dd className="text-foreground text-xs">{order.paymentStatus}</dd>
              </div>
              {order.stripeSessionId && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Stripe</dt>
                  <dd className="font-mono text-xs text-muted-foreground truncate max-w-[120px]">
                    {order.stripeSessionId}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          <section className="border border-border p-5">
            <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-4">
              Status &amp; tracking
            </p>
            <OrderStatusForm
              orderId={order.id}
              currentStatus={order.status}
              currentTrackingNumber={order.trackingNumber ?? ""}
              currentTrackingUrl={order.trackingUrl ?? ""}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
