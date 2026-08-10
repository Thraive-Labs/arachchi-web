"use server";

import { z } from "zod";
import { db } from "@/lib/db/client";
import { newsletterSubscribers } from "@/lib/db/schema";

export type ContentActionState = { error?: string; success?: string; id?: string } | null;

// ── Newsletter ─────────────────────────────────────────────────────────────────

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  source: z.string().default("footer"),
});

export async function subscribeToNewsletterAction(
  prevState: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const result = newsletterSchema.safeParse({
    email: formData.get("email"),
    source: formData.get("source") ?? "footer",
  });
  if (!result.success) return { error: result.error.issues[0]?.message ?? "Invalid email." };

  const { email, source } = result.data;

  await db
    .insert(newsletterSubscribers)
    .values({ email, source })
    .onConflictDoUpdate({ target: newsletterSubscribers.email, set: { isActive: true } });

  return { success: "You're subscribed." };
}
