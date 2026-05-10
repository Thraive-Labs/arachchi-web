"use client";

import { useActionState } from "react";
import { updateProfileAction, changePasswordAction, type AuthActionState } from "@/app/actions/auth";

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

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="marketingOptIn"
              className="mt-0.5 border border-border accent-foreground"
            />
            <span className="text-xs text-muted-foreground leading-relaxed">
              Receive emails about new arrivals and editorial content.
            </span>
          </label>

          {profileState?.error && (
            <p className="text-sm text-red-600">{profileState.error}</p>
          )}
          {profileState?.success && (
            <p className="text-sm text-foreground">{profileState.success}</p>
          )}

          <button
            type="submit"
            disabled={profilePending}
            className="border border-foreground bg-foreground px-8 py-3 text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {profilePending ? "Saving..." : "Save changes"}
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

          {passwordState?.error && (
            <p className="text-sm text-red-600">{passwordState.error}</p>
          )}
          {passwordState?.success && (
            <p className="text-sm text-foreground">{passwordState.success}</p>
          )}

          <button
            type="submit"
            disabled={passwordPending}
            className="border border-foreground bg-foreground px-8 py-3 text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {passwordPending ? "Updating..." : "Update password"}
          </button>
        </form>
      </section>
    </div>
  );
}
