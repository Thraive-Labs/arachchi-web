import { cache } from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { getSession } from "@/lib/auth/server";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export type UserRole = "customer" | "staff" | "admin" | null;

// Memoised per-request — safe to call from multiple layout segments
const getUserRole = cache(async (userId: string): Promise<UserRole> => {
  const [dbUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return dbUser?.role ?? "customer";
});

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // getSession reads the JWT from the cookie — no Supabase network round-trip
  const session = await getSession();
  const role: UserRole = session?.user ? await getUserRole(session.user.id) : null;

  return (
    <>
      <Navbar role={role} />
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
