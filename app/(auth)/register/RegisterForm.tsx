"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthActionState } from "@/app/actions/auth";

export function RegisterForm() {
  const [state, action, isPending] = useActionState<AuthActionState, FormData>(registerAction, null);

  if (state?.success) {
    return (
      <div className="w-full max-w-sm text-center">
        <h1 className="font-serif text-3xl font-light tracking-wide mb-4">Check your email</h1>
        <p className="text-sm text-muted-foreground">{state.success}</p>
        <Link
          href="/login"
          className="mt-8 inline-block text-xs tracking-[0.15em] uppercase text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-serif text-3xl font-light tracking-wide text-center mb-2">
        Create account
      </h1>
      <p className="text-center text-sm text-muted-foreground mb-10">
        Already have one?{" "}
        <Link
          href="/login"
          className="text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity"
        >
          Sign in
        </Link>
      </p>

      <form action={action} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-xs tracking-[0.15em] uppercase text-foreground">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            autoComplete="name"
            className="w-full border border-border bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
          />
        </div>

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

        <div className="space-y-2">
          <label htmlFor="password" className="text-xs tracking-[0.15em] uppercase text-foreground">
            Password
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
          <p className="text-xs text-muted-foreground">Minimum 12 characters.</p>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="marketingOptIn"
            className="mt-0.5 border border-border accent-foreground"
          />
          <span className="text-xs text-muted-foreground leading-relaxed">
            I&apos;d like to receive occasional emails about new arrivals and editorial content.
          </span>
        </label>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="w-full border border-foreground bg-foreground px-8 py-3 text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {isPending ? "Creating account..." : "Create account"}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="text-foreground underline underline-offset-4">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-foreground underline underline-offset-4">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
