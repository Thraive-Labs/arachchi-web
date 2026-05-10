import type { Metadata } from "next";
import Link from "next/link";
import { getUser } from "@/lib/auth/server";
import { getOrdersByUser } from "@/lib/db/queries/orders";
import { formatPriceCents } from "@/lib/utils";

export const metadata: Metadata = { title: "Orders" };

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  paid: "Processing",
  fulfilled: "Fulfilled",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export default async function OrdersPage() {
  const user = await getUser();
  if (!user) return null;

  const allOrders = await getOrdersByUser(user.id);

  return (
    <div>
      <h1 className="font-serif text-3xl font-light tracking-wide mb-8">
        Order history
      </h1>

      {allOrders.length === 0 ? (
        <div className="border border-border p-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">No orders yet.</p>
          <Link
            href="/shop"
            className="text-xs tracking-[0.15em] uppercase text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity"
          >
            Browse the collection
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border border-t border-b border-border">
          {allOrders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="flex items-center justify-between py-5 hover:opacity-70 transition-opacity group"
            >
              <div>
                <p className="text-sm text-foreground">{order.orderNumber}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(order.createdAt).toLocaleDateString("en-CA", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-foreground">
                  {formatPriceCents(order.totalCents)} {order.currency}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {STATUS_LABELS[order.status] ?? order.status}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
