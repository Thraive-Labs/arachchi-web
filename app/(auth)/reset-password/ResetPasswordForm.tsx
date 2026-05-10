"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction, type AuthActionState } from "@/app/actions/auth";

export function ResetPasswordForm() {
  const [state, action, isPending] = useActionState<AuthActionState, FormData>(resetPasswordAction, null);

  if (state?.success) {
    return (
      <div className="w-full max-w-sm text-center space-y-6">
        <h1 className="font-serif text-3xl font-light tracking-wide">Password updated</h1>
        <p className="text-sm text-muted-foreground">{state.success}</p>
        <Link
          href="/login"
          className="inline-block border border-foreground bg-foreground px-8 py-3 text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-80"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-serif text-3xl font-light tracking-wide text-center mb-2">
        Choose a new password
      </h1>
      <p className="text-center text-sm text-muted-foreground mb-10">
        Minimum 12 characters.
      </p>

      <form action={action} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="password" className="text-xs tracking-[0.15em] uppercase text-foreground">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
            className="w-full border border-border bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="passwordConfirm" className="text-xs tracking-[0.15em] uppercase text-foreground">
            Confirm password
          </label>
          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
            className="w-full border border-border bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
          />
        </div>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="w-full border border-foreground bg-foreground px-8 py-3 text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {isPending ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  );
}
