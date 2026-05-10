"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/auth/server";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

export type AuthActionState = { error?: string; success?: string } | null;

// ── Shared schemas ────────────────────────────────────────────────────────────

const emailSchema = z.object({ email: z.string().email() }).strict();

// ── Login ─────────────────────────────────────────────────────────────────────

const loginSchema = z
  .object({ email: z.string().email(), password: z.string().min(1), redirectTo: z.string().optional() })
  .strict();

export async function loginAction(
  prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo") ?? undefined,
  });

  if (!result.success) return { error: "Invalid email or password." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) return { error: "Invalid email or password." };

  const dest = result.data.redirectTo ?? "/account";
  // Only allow relative redirects to prevent open-redirect attacks
  redirect(dest.startsWith("/") ? dest : "/account");
}

// ── Magic link ────────────────────────────────────────────────────────────────

export async function magicLinkAction(
  prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = emailSchema.safeParse({ email: formData.get("email") });
  if (!result.success) return { error: "Please enter a valid email address." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: result.data.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) return { error: "Could not send the link. Please try again." };
  return { success: "Check your email — a sign-in link is on its way." };
}

// ── Register ──────────────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(12, "Password must be at least 12 characters."),
    fullName: z.string().min(1, "Please enter your name.").max(100),
    marketingOptIn: z
      .literal("on")
      .optional()
      .transform((v) => v === "on"),
  })
  .strict();

export async function registerAction(
  prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    marketingOptIn: formData.get("marketingOptIn") ?? undefined,
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid input." };
  }

  const { email, password, fullName, marketingOptIn } = result.data;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    if (error.code === "user_already_exists") {
      return { error: "An account with this email already exists." };
    }
    return { error: "Registration failed. Please try again." };
  }

  if (data.user) {
    await db
      .insert(users)
      .values({ id: data.user.id, email, fullName, marketingOptIn })
      .onConflictDoNothing();
  }

  if (data.session) {
    // Email confirmations disabled in Supabase — signed in immediately
    redirect("/account");
  }

  return {
    success:
      "Account created! Check your email to confirm your address, then sign in.",
  };
}

// ── Forgot password ───────────────────────────────────────────────────────────

export async function forgotPasswordAction(
  prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = emailSchema.safeParse({ email: formData.get("email") });
  if (!result.success) return { error: "Please enter a valid email address." };

  const supabase = await createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(result.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password`,
  });

  // Always respond with success to avoid revealing which emails are registered
  return {
    success:
      "If an account exists for that email, a reset link has been sent.",
  };
}

// ── Reset password ────────────────────────────────────────────────────────────

const resetPasswordSchema = z
  .object({
    password: z.string().min(12, "Password must be at least 12 characters."),
    passwordConfirm: z.string().min(1),
  })
  .strict()
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Passwords do not match.",
    path: ["passwordConfirm"],
  });

export async function resetPasswordAction(
  prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({
    password: result.data.password,
  });

  if (error) {
    return {
      error: "Could not update password. The reset link may have expired.",
    };
  }

  return { success: "Password updated. You can now sign in with your new password." };
}

// ── Update profile ─────────────────────────────────────────────────────────────

const profileSchema = z
  .object({
    fullName: z.string().min(1, "Please enter your name.").max(100),
    marketingOptIn: z
      .literal("on")
      .optional()
      .transform((v) => v === "on"),
  })
  .strict();

export async function updateProfileAction(
  prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const result = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    marketingOptIn: formData.get("marketingOptIn") ?? undefined,
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid input." };
  }

  const { fullName, marketingOptIn } = result.data;

  await Promise.all([
    supabase.auth.updateUser({ data: { full_name: fullName } }),
    db
      .update(users)
      .set({ fullName, marketingOptIn, updatedAt: new Date() })
      .where(eq(users.id, user.id)),
  ]);

  return { success: "Profile updated." };
}

// ── Change password (authenticated) ───────────────────────────────────────────

const changePasswordSchema = z
  .object({
    password: z.string().min(12, "Password must be at least 12 characters."),
    passwordConfirm: z.string().min(1),
  })
  .strict()
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Passwords do not match.",
    path: ["passwordConfirm"],
  });

export async function changePasswordAction(
  prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const result = changePasswordSchema.safeParse({
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await supabase.auth.updateUser({
    password: result.data.password,
  });
  if (error) return { error: "Password update failed. Please try again." };

  return { success: "Password changed successfully." };
}

// ── Logout ────────────────────────────────────────────────────────────────────

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
