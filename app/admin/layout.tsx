import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authUser = await getUser();
  if (!authUser) redirect("/login?redirectTo=/admin");

  const [dbUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (!dbUser || !["staff", "admin"].includes(dbUser.role)) redirect("/");

  return <AdminShell>{children}</AdminShell>;
}
