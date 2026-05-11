"use client";

import { useActionState } from "react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { updateProfileAction, changePasswordAction, type AuthActionState } from "@/app/actions/auth";

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

export default function SettingsPage() {
  const [profileState, profileAction, profilePending] = useActionState<AuthActionState, FormData>(
    updateProfileAction,
    null,
  );
  const [passwordState, passwordAction, passwordPending] = useActionState<AuthActionState, FormData>(
    changePasswordAction,
    null,
  );

  return (
    <div className="space-y-12">
      <h1 className="font-serif text-3xl font-light tracking-wide">Settings</h1>

      {/* Appearance */}
      <AppearanceSection />

      {/* Profile */}
      <section>
        <p className="mb-6 text-xs tracking-[0.2em] uppercase text-foreground border-b border-border pb-3">
          Profile
        </p>
        <form action={profileAction} className="max-w-md space-y-5">
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

          {profileState?.error   && <p className="text-sm text-red-600">{profileState.error}</p>}
          {profileState?.success && <p className="text-sm text-foreground">{profileState.success}</p>}

          <button
            type="submit"
            disabled={profilePending}
            className="border border-foreground bg-foreground px-8 py-3 text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {profilePending ? "Saving..." : "Save changes"}
          </button>
        </form>
      </section>

      {/* Email notifications */}
      <section>
        <p className="mb-6 text-xs tracking-[0.2em] uppercase text-foreground border-b border-border pb-3">
          Email notifications
        </p>
        <form action={profileAction} className="max-w-md space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="marketingOptIn"
              defaultChecked
              className="mt-0.5 border border-border accent-foreground"
            />
            <div>
              <p className="text-sm text-foreground">New arrivals & editorial</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Be the first to know about new collections and brand stories.
              </p>
            </div>
          </label>
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked
              disabled
              className="mt-0.5 border border-border accent-foreground"
            />
            <div>
              <p className="text-sm text-foreground">Order updates</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Shipping confirmations and delivery notifications. Always on.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked
              disabled
              className="mt-0.5 border border-border accent-foreground"
            />
            <div>
              <p className="text-sm text-foreground">Back in stock</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Alerts when a wishlisted item is restocked. Always on.
              </p>
            </div>
          </div>
          <button
            type="submit"
            disabled={profilePending}
            className="mt-2 border border-foreground bg-foreground px-8 py-3 text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {profilePending ? "Saving..." : "Save preferences"}
          </button>
        </form>
      </section>

      {/* Change password */}
      <section>
        <p className="mb-6 text-xs tracking-[0.2em] uppercase text-foreground border-b border-border pb-3">
          Change password
        </p>
        <form action={passwordAction} className="max-w-md space-y-5">
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
            <p className="text-xs text-muted-foreground">Minimum 12 characters.</p>
          </div>
          <div className="space-y-2">
            <label htmlFor="passwordConfirm" className="text-xs tracking-[0.15em] uppercase text-foreground">
              Confirm new password
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
          {passwordState?.error   && <p className="text-sm text-red-600">{passwordState.error}</p>}
          {passwordState?.success && <p className="text-sm text-foreground">{passwordState.success}</p>}
          <button
            type="submit"
            disabled={passwordPending}
            className="border border-foreground bg-foreground px-8 py-3 text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {passwordPending ? "Updating..." : "Update password"}
          </button>
        </form>
      </section>

      {/* Privacy & data */}
      <section>
        <p className="mb-6 text-xs tracking-[0.2em] uppercase text-foreground border-b border-border pb-3">
          Privacy & data
        </p>
        <div className="max-w-md space-y-4 text-sm text-muted-foreground">
          <p>
            Your personal data is used solely to process orders and provide account features.
            We do not sell or share your data with third parties for advertising purposes.
          </p>
          <div className="space-y-2 pt-2">
            <p className="text-xs tracking-[0.15em] uppercase text-foreground">Account deletion</p>
            <p className="text-xs text-muted-foreground">
              To permanently delete your account and all associated data, email{" "}
              <a href="mailto:privacy@arachchi.com" className="underline underline-offset-4 hover:text-foreground transition-colors">
                privacy@arachchi.com
              </a>{" "}
              from your registered address.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
