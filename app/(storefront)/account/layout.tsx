import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/auth/server";
import { logoutAction } from "@/app/actions/auth";

const navLinks = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/account/settings", label: "Settings" },
];

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-[1440px] px-6 pt-24 pb-24 lg:px-8">
      <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-48">
          <p className="mb-6 text-xs tracking-[0.2em] uppercase text-muted-foreground">
            Account
          </p>
          <nav className="flex flex-row flex-wrap gap-4 lg:flex-col lg:gap-0">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-1 text-sm text-muted-foreground transition-colors hover:text-foreground lg:border-b lg:border-border lg:py-3"
              >
                {link.label}
              </Link>
            ))}
            <form action={logoutAction}>
              <button
                type="submit"
                className="py-1 text-sm text-muted-foreground transition-colors hover:text-foreground lg:border-b lg:border-border lg:py-3 lg:w-full lg:text-left"
              >
                Sign out
              </button>
            </form>
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
