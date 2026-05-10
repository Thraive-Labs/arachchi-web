"use client";

import { useState } from "react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // Wired to server action in Phase 4 — placeholder submit for now
    setStatus("success");
    setEmail("");
  }

  return (
    <section className="border-t border-border" aria-label="Newsletter signup">
      <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-serif text-xl text-foreground">
              Stay in the conversation.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              New arrivals, editorial notes, and occasional invitations. No noise.
            </p>
          </div>

          {status === "success" ? (
            <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
              Thank you — you are on the list.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex w-full max-w-sm gap-0">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 border border-border bg-transparent px-4 py-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              />
              <button
                type="submit"
                className="border border-l-0 border-foreground bg-foreground px-5 py-3 text-xs tracking-[0.15em] uppercase text-background transition-opacity hover:opacity-80"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
