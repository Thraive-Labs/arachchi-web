import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 pt-32 pb-24 lg:px-8">
      <h1 className="font-serif text-3xl font-light tracking-wide mb-2">Terms of Service</h1>
      <p className="mb-10 text-xs text-muted-foreground">Last updated: May 2026</p>
      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-3 text-xs tracking-[0.2em] uppercase text-foreground">Acceptance</h2>
          <p>By accessing arachchi.com you agree to these terms. If you do not agree, please do not use the site.</p>
        </section>
        <section>
          <h2 className="mb-3 text-xs tracking-[0.2em] uppercase text-foreground">Orders and pricing</h2>
          <p>All prices are in Canadian dollars (CAD) and include applicable taxes unless otherwise noted. We reserve the right to refuse or cancel any order, including if a pricing error occurs. Payment is processed securely through Stripe.</p>
        </section>
        <section>
          <h2 className="mb-3 text-xs tracking-[0.2em] uppercase text-foreground">Intellectual property</h2>
          <p>All content on this site — images, text, design, and trademarks — is the property of Arachchi Inc. and may not be reproduced without written permission.</p>
        </section>
        <section>
          <h2 className="mb-3 text-xs tracking-[0.2em] uppercase text-foreground">Limitation of liability</h2>
          <p>To the maximum extent permitted by law, Arachchi Inc. is not liable for any indirect, incidental, or consequential damages arising from your use of this site or the products purchased through it.</p>
        </section>
        <section>
          <h2 className="mb-3 text-xs tracking-[0.2em] uppercase text-foreground">Governing law</h2>
          <p>These terms are governed by the laws of Ceylon.</p>
        </section>
        <section>
          <h2 className="mb-3 text-xs tracking-[0.2em] uppercase text-foreground">Contact</h2>
          <p><a href="mailto:hello@arachchi.com" className="text-foreground underline underline-offset-4">hello@arachchi.com</a></p>
        </section>
      </div>
    </div>
  );
}
