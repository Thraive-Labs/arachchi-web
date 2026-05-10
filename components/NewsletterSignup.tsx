"use client";

import { useActionState } from "react";
import { subscribeToNewsletterAction } from "@/app/actions/content";

interface Props {
  source?: string;
  className?: string;
}

export function NewsletterSignup({ source = "footer", className = "" }: Props) {
  const [state, action, isPending] = useActionState(subscribeToNewsletterAction, null);

  if (state?.success) {
    return (
      <p className={`text-sm text-muted-foreground tracking-wide ${className}`}>
        {state.success}
      </p>
    );
  }

  return (
    <form action={action} className={`flex flex-col sm:flex-row gap-2 ${className}`}>
      <input type="hidden" name="source" value={source} />
      <input
        name="email"
        type="email"
        placeholder="Your email"
        required
        className="flex-1 border border-border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-foreground placeholder:text-muted-foreground"
      />
      <button
        type="submit"
        disabled={isPending}
        className="border border-foreground bg-foreground px-6 py-2.5 text-xs tracking-[0.15em] uppercase text-background hover:opacity-80 transition-opacity disabled:opacity-50 whitespace-nowrap"
      >
        {isPending ? "..." : "Subscribe"}
      </button>
      {state?.error && (
        <p className="text-xs text-red-600 sm:col-span-2 mt-1">{state.error}</p>
      )}
    </form>
  );
}
