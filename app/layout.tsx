import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { MotionProvider } from "@/components/providers/motion-provider";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { SectionRail } from "@/components/site/section-rail";
import { CommandPalette } from "@/components/site/command-palette";
import { ScrollProgress } from "@/components/visuals/scroll-progress";
import { ScrollVelocity } from "@/components/visuals/scroll-velocity";
import { CursorGlow } from "@/components/visuals/cursor-glow";
import { site } from "@/lib/content";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const description =
  "Self-taught high-school quant building and validating systematic trading systems on ES/NQ futures — research, data pipelines, and a kill-list that treats every backtest as guilty until proven innocent.";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${site.domainNote}`),
  title: {
    default: "Aryan Sharma — Quantitative Research & Builder",
    template: "%s · Aryan Sharma",
  },
  description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  keywords: [
    "quantitative research",
    "algorithmic trading",
    "backtest validation",
    "deflated Sharpe ratio",
    "options and volatility",
    "QuantConnect",
    "Python",
    "Aryan Sharma",
  ],
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title: "Aryan Sharma — Quantitative Research & Builder",
    description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aryan Sharma — Quantitative Research & Builder",
    description,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    url: `https://${site.domainNote}`,
    jobTitle: "Quantitative researcher & engineer (student)",
    email: `mailto:${site.email}`,
    sameAs: [site.github],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Washington",
      addressRegion: "D.C.",
      addressCountry: "US",
    },
    knowsAbout: [
      "Quantitative finance",
      "Algorithmic trading",
      "Backtest validation",
      "Options and volatility",
      "Python",
      "Mandarin Chinese",
    ],
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <MotionProvider>
          <CursorGlow />
          <ScrollProgress />
          <ScrollVelocity />
          <SectionRail />
          <CommandPalette />
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-md focus:border focus:border-line focus:bg-elevated focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
          >
            Skip to content
          </a>
          <Header />
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <Footer />
        </MotionProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
        />
      </body>
    </html>
  );
}
