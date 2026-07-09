import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Geist, Nunito } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const heading = Cormorant_Garamond({
  variable: "--font-heading",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

const body = Geist({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const display = Nunito({
  variable: "--font-display",
  weight: ["200", "300", "400"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Arachchi — Luxury Clothing from Ceylon",
    template: "%s — Arachchi",
  },
  description: "Ceylon-based luxury clothing — designed with intention, built to last.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    siteName: "Arachchi",
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@arachchi",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "hsl(24 35% 97%)" },
    { media: "(prefers-color-scheme: dark)",  color: "hsl(20 14% 8%)" },
  ],
  width: "device-width",
  initialScale: 1,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Arachchi",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://arachchi.com",
  logo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://arachchi.com"}/logo.png`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Ceylon",
    addressCountry: "LK",
  },
  sameAs: [],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${heading.variable} ${body.variable} ${display.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased bg-background text-foreground">
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false} storageKey="arachchi-theme">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
