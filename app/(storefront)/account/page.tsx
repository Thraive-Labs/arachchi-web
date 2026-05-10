import type { Metadata } from "next";
import Link from "next/link";
import { getUser } from "@/lib/auth/server";
import { getOrdersByUser } from "@/lib/db/queries/orders";
import { formatPriceCents } from "@/lib/utils";

export const metadata: Metadata = { title: "Account" };

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  paid: "Processing",
  fulfilled: "Fulfilled",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export default async function AccountPage() {
  const user = await getUser();
  if (!user) return null;

  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "there";

  const recentOrders = await getOrdersByUser(user.id);
  const latest = recentOrders.slice(0, 3);

  return (
    <div>
      <h1 className="font-serif text-3xl font-light tracking-wide mb-1">
        Hello, {name}.
      </h1>
      <p className="text-sm text-muted-foreground mb-12">{user.email}</p>

      {/* Recent orders */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs tracking-[0.2em] uppercase text-foreground">
            Recent orders
          </p>
          {recentOrders.length > 0 && (
            <Link
              href="/account/orders"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View all
            </Link>
          )}
        </div>

        {latest.length === 0 ? (
          <div className="border border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">No orders yet.</p>
            <Link
              href="/shop"
              className="mt-4 inline-block text-xs tracking-[0.15em] uppercase text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity"
            >
              Browse the collection
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border border-t border-border">
            {latest.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center justify-between py-4 hover:opacity-70 transition-opacity"
              >
                <div>
                  <p className="text-sm text-foreground">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-CA", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground">
                    {formatPriceCents(order.totalCents)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {STATUS_LABELS[order.status] ?? order.status}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Quick links */}
      <section>
        <p className="text-xs tracking-[0.2em] uppercase text-foreground mb-4">
          Quick links
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { href: "/account/orders", label: "Order history" },
            { href: "/account/wishlist", label: "Wishlist" },
            { href: "/account/settings", label: "Settings" },
            { href: "/shop", label: "Shop" },
            { href: "/returns", label: "Returns" },
            { href: "/contact", label: "Contact" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border border-border px-4 py-3 text-xs tracking-[0.1em] uppercase text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
