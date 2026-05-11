import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Geist, Nunito } from "next/font/google";
import { SplashController } from "@/components/animations/SplashController";
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
    default: "Arachchi — Toronto Luxury Clothing",
    template: "%s — Arachchi",
  },
  description: "Toronto-based luxury clothing — designed with intention, built to last.",
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
    addressLocality: "Toronto",
    addressRegion: "ON",
    addressCountry: "CA",
  },
  sameAs: [],
};

// Plum blossom SVG (5 petals, manhwa-delicate)
function Blossom({ style }: { style: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="splash-blossom"
      style={style}
    >
      <g transform="translate(12,12)">
        {([0, 72, 144, 216, 288] as const).map((a) => (
          <ellipse key={a} cx="0" cy="-4.8" rx="2.6" ry="4.4" fill="hsl(350 62% 87%)" opacity="0.82" transform={`rotate(${a})`} />
        ))}
        <circle cx="0" cy="0" r="2" fill="hsl(350 42% 74%)" opacity="0.9" />
        <circle cx="0" cy="0" r="0.9" fill="hsl(350 25% 88%)" opacity="0.8" />
      </g>
    </svg>
  );
}

// Blossom config: left %, width px, dur, delay, drift, spin
const BLOSSOMS: [number, number, string, string, string, string][] = [
  [  7, 13, "3.4s", "0.0s",  "18px", "320deg"],
  [ 18, 10, "2.9s", "0.7s", "-14px", "280deg"],
  [ 30, 15, "3.7s", "0.2s",  "22px", "360deg"],
  [ 44, 11, "3.1s", "1.1s", "-10px", "300deg"],
  [ 57, 14, "2.7s", "0.4s",  "16px", "340deg"],
  [ 68, 10, "3.5s", "0.9s", "-20px", "260deg"],
  [ 79, 13, "3.0s", "0.1s",  "12px", "380deg"],
  [ 89, 12, "2.8s", "0.6s", "-16px", "310deg"],
  [ 23, 9,  "3.2s", "1.3s",  "10px", "290deg"],
  [ 52, 16, "3.8s", "0.5s", "-12px", "350deg"],
];

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
          <div id="splash" aria-hidden="true">
            {BLOSSOMS.map(([left, size, dur, delay, drift, spin], i) => (
              <Blossom
                key={i}
                style={{
                  left: `${left}%`,
                  width: size,
                  height: size,
                  // CSS custom properties consumed by the animation
                  ["--dur" as string]:   dur,
                  ["--delay" as string]: delay,
                  ["--drift" as string]: drift,
                  ["--spin" as string]:  spin,
                }}
              />
            ))}
            <span>arachchi</span>
          </div>
          <SplashController />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
