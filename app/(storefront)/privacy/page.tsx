import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 pt-32 pb-24 lg:px-8">
      <h1 className="font-serif text-3xl font-light tracking-wide mb-2">Privacy Policy</h1>
      <p className="mb-10 text-xs text-muted-foreground">Last updated: May 2026</p>
      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-3 text-xs tracking-[0.2em] uppercase text-foreground">Who we are</h2>
          <p>Arachchi Inc. (&ldquo;Arachchi&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is a company incorporated in Ontario, Canada. Our website is arachchi.com. This policy describes how we collect, use, and protect your personal information in accordance with Canada&apos;s Personal Information Protection and Electronic Documents Act (PIPEDA).</p>
        </section>
        <section>
          <h2 className="mb-3 text-xs tracking-[0.2em] uppercase text-foreground">What we collect</h2>
          <p>When you place an order, create an account, or contact us, we collect: name, email address, shipping and billing address, phone number (optional), and payment information (processed securely by Stripe — we never store card details). When you browse, we collect anonymized analytics data (page views, session duration) to improve the site.</p>
        </section>
        <section>
          <h2 className="mb-3 text-xs tracking-[0.2em] uppercase text-foreground">How we use it</h2>
          <p>We use your information to fulfill orders, send transactional emails (order confirmation, shipping updates), provide customer support, and — with your consent — send marketing communications. We do not sell your data to third parties.</p>
        </section>
        <section>
          <h2 className="mb-3 text-xs tracking-[0.2em] uppercase text-foreground">Your rights</h2>
          <p>You may request access to, correction of, or deletion of your personal information at any time by contacting us at <a href="mailto:privacy@arachchi.com" className="text-foreground underline underline-offset-4">privacy@arachchi.com</a>. You may also withdraw consent to marketing communications at any time via the unsubscribe link in any email.</p>
        </section>
        <section>
          <h2 className="mb-3 text-xs tracking-[0.2em] uppercase text-foreground">Cookies</h2>
          <p>We use essential cookies for session management and cart persistence. We use analytics cookies (with your consent) to understand site usage. You can manage cookie preferences in your browser settings.</p>
        </section>
        <section>
          <h2 className="mb-3 text-xs tracking-[0.2em] uppercase text-foreground">Contact</h2>
          <p>Questions about this policy: <a href="mailto:privacy@arachchi.com" className="text-foreground underline underline-offset-4">privacy@arachchi.com</a>.</p>
        </section>
      </div>
    </div>
  );
}
