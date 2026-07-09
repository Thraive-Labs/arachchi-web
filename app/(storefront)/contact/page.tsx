"use client";

import { useState } from "react";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "success">("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Wire to server action in Phase 4
    setStatus("success");
  }

  return (
    <div className="mx-auto max-w-2xl px-6 pt-32 pb-24 lg:px-8">
      <h1 className="font-serif text-3xl font-light tracking-wide mb-2">Contact</h1>
      <p className="mb-10 text-sm text-muted-foreground">
        We aim to respond within one business day.
      </p>

      {status === "success" ? (
        <p className="text-sm text-foreground">
          Thank you — we have received your message and will be in touch shortly.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs tracking-[0.15em] uppercase text-foreground">Name</label>
              <input id="name" type="text" required className="w-full border border-border bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground" />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs tracking-[0.15em] uppercase text-foreground">Email</label>
              <input id="email" type="email" required className="w-full border border-border bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="subject" className="text-xs tracking-[0.15em] uppercase text-foreground">Subject</label>
            <input id="subject" type="text" required className="w-full border border-border bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground" />
          </div>
          <div className="space-y-2">
            <label htmlFor="message" className="text-xs tracking-[0.15em] uppercase text-foreground">Message</label>
            <textarea id="message" rows={6} required className="w-full border border-border bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground resize-none" />
          </div>
          <button type="submit" className="border border-foreground bg-foreground px-8 py-3 text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-80">
            Send message
          </button>
        </form>
      )}

      <div className="mt-12 border-t border-border pt-8 space-y-2 text-sm text-muted-foreground">
        <p>Email: <a href="mailto:hello@arachchi.com" className="text-foreground hover:underline">hello@arachchi.com</a></p>
        <p>Based in Ceylon.</p>
      </div>
    </div>
  );
}
