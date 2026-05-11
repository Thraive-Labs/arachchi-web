"use client";

import type { Metadata } from "next";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useActionState } from "react";
import { changePasswordAction, type AuthActionState } from "@/app/actions/auth";

// Metadata can't be exported from a client component — handled by layout
// export const metadata: Metadata = { title: "Admin — Settings" };

const themes = [
  { value: "light", label: "Light" },
  { value: "dark",  label: "Dark"  },
] as const;

function AppearanceSection() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <section>
      <p className="mb-6 text-xs tracking-[0.2em] uppercase text-foreground border-b border-border pb-3">
        Appearance
      </p>
      <div className="flex gap-3">
        {themes.map((t) => (
          <button
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={`px-6 py-3 text-xs tracking-[0.15em] uppercase border transition-colors ${
              resolvedTheme === t.value
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Theme preference is saved locally in your browser.
      </p>
    </section>
  );
}

function SecuritySection() {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    changePasswordAction,
    null,
  );

  return (
    <section>
      <p className="mb-6 text-xs tracking-[0.2em] uppercase text-foreground border-b border-border pb-3">
        Change password
      </p>
      <form action={formAction} className="max-w-md space-y-5">
        <div className="space-y-2">
          <label htmlFor="adm-password" className="text-xs tracking-[0.15em] uppercase text-foreground">
            New password
          </label>
          <input
            id="adm-password"
            name="password"
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
            className="w-full border border-border bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
          />
          <p className="text-xs text-muted-foreground">Minimum 12 characters.</p>
        </div>
        <div className="space-y-2">
          <label htmlFor="adm-passwordConfirm" className="text-xs tracking-[0.15em] uppercase text-foreground">
            Confirm new password
          </label>
          <input
            id="adm-passwordConfirm"
            name="passwordConfirm"
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
            className="w-full border border-border bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
          />
        </div>
        {state?.error   && <p className="text-sm text-red-600">{state.error}</p>}
        {state?.success && <p className="text-sm text-foreground">{state.success}</p>}
        <button
          type="submit"
          disabled={pending}
          className="border border-foreground bg-foreground px-8 py-3 text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {pending ? "Updating..." : "Update password"}
        </button>
      </form>
    </section>
  );
}

export default function AdminSettingsPage() {
  return (
    <div className="space-y-12">
      <h1 className="font-serif text-2xl font-light tracking-wide">Settings</h1>
      <AppearanceSection />
      <SecuritySection />
    </div>
  );
}
