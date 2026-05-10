import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authUser = await getUser();
  if (!authUser) redirect("/login?redirectTo=/admin");

  const [dbUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (!dbUser || !["staff", "admin"].includes(dbUser.role)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-background px-6 py-4">
        <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
          Admin
        </p>
      </div>
      <main className="p-6">{children}</main>
    </div>
  );
}
