"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction, type AuthActionState } from "@/app/actions/auth";

export function ForgotPasswordForm() {
  const [state, action, isPending] = useActionState<AuthActionState, FormData>(forgotPasswordAction, null);

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-serif text-3xl font-light tracking-wide text-center mb-2">
        Reset password
      </h1>
      <p className="text-center text-sm text-muted-foreground mb-10">
        Enter your email and we&apos;ll send a reset link.
      </p>

      {state?.success ? (
        <div className="space-y-6 text-center">
          <p className="text-sm text-foreground">{state.success}</p>
          <Link
            href="/login"
            className="inline-block text-xs tracking-[0.15em] uppercase text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form action={action} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs tracking-[0.15em] uppercase text-foreground">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full border border-border bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>

          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="w-full border border-foreground bg-foreground px-8 py-3 text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {isPending ? "Sending..." : "Send reset link"}
          </button>

          <div className="text-center">
            <Link
              href="/login"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
