"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { discounts } from "@/lib/db/schema";

export async function saveDiscountAction(form: FormData): Promise<{ error?: string }> {
  const id = form.get("id") as string | null;
  const code = (form.get("code") as string)?.trim().toUpperCase();
  const type = form.get("type") as "percentage" | "fixed" | "free_shipping";
  const value = parseInt(form.get("value") as string, 10);
  const minSubtotalCents = parseInt(form.get("minSubtotalCents") as string, 10) || null;
  const maxUses = parseInt(form.get("maxUses") as string, 10) || null;
  const appliesTo = form.get("appliesTo") as "all" | "category" | "product";
  const startsAt = (form.get("startsAt") as string) ? new Date(form.get("startsAt") as string) : null;
  const endsAt = (form.get("endsAt") as string) ? new Date(form.get("endsAt") as string) : null;
  const isActive = form.get("isActive") === "on";

  if (!code || !type || isNaN(value)) return { error: "Missing required fields." };

  try {
    if (id) {
      await db.update(discounts).set({ code, type, value, minSubtotalCents, maxUses, appliesTo, startsAt, endsAt, isActive }).where(eq(discounts.id, id));
    } else {
      await db.insert(discounts).values({ code, type, value, minSubtotalCents, maxUses, appliesTo, startsAt, endsAt, isActive });
    }
    return {};
  } catch {
    return { error: "A discount with that code may already exist." };
  }
}

export async function deleteDiscountAction(id: string): Promise<void> {
  await db.delete(discounts).where(eq(discounts.id, id));
}
