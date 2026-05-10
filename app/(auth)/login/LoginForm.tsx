"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, magicLinkAction, type AuthActionState } from "@/app/actions/auth";

interface Props {
  redirectTo: string;
}

export function LoginForm({ redirectTo }: Props) {
  const [loginState, loginFormAction, loginPending] = useActionState<AuthActionState, FormData>(loginAction, null);
  const [magicState, magicFormAction, magicPending] = useActionState<AuthActionState, FormData>(magicLinkAction, null);

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-serif text-3xl font-light tracking-wide text-center mb-2">
        Sign in
      </h1>
      <p className="text-center text-sm text-muted-foreground mb-10">
        New here?{" "}
        <Link
          href="/register"
          className="text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity"
        >
          Create an account
        </Link>
      </p>

      <form action={loginFormAction} className="space-y-5">
        <input type="hidden" name="redirectTo" value={redirectTo} />

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
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-xs tracking-[0.15em] uppercase text-foreground">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full border border-border bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
          />
        </div>

        {loginState?.error && (
          <p className="text-sm text-red-600">{loginState.error}</p>
        )}

        <button
          type="submit"
          disabled={loginPending}
          className="w-full border border-foreground bg-foreground px-8 py-3 text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {loginPending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-8 flex items-center gap-4">
        <span className="flex-1 border-t border-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <span className="flex-1 border-t border-border" />
      </div>

      <form action={magicFormAction} className="mt-6 space-y-4">
        <div className="space-y-2">
          <label htmlFor="magic-email" className="text-xs tracking-[0.15em] uppercase text-foreground">
            Sign in with a magic link
          </label>
          <input
            id="magic-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="your@email.com"
            className="w-full border border-border bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
          />
        </div>

        {magicState?.error && <p className="text-sm text-red-600">{magicState.error}</p>}
        {magicState?.success && <p className="text-sm text-foreground">{magicState.success}</p>}

        <button
          type="submit"
          disabled={magicPending}
          className="w-full border border-border px-8 py-3 text-xs tracking-[0.2em] uppercase text-foreground transition-colors hover:border-foreground disabled:opacity-50"
        >
          {magicPending ? "Sending..." : "Send magic link"}
        </button>
      </form>
    </div>
  );
}
