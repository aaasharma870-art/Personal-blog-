import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import { preload } from "react-dom";
import "./globals.css";
import "./intro.css";
/* Phase 3 CSS partials (PHASE3-PLAN §4.6, DP-10): one owner each, after the
   base and the prologue so they cascade last. Tokens and custom variants
   stay in globals.css. */
import "./p3/foundation.css";
import "./p3/stage.css";
import "./p3/type.css";
import "./p3/cards.css";
import "./p3/plates.css";
import "./p3/words.css";
import "./p3/game.css";
import "./p3/sound.css";
import "./p3/games.css";
import "./p3/world-pirates.css";
import "./p3/world-idiots.css";
import "./p3/world-rdr2.css";
import "./p3/world-hp.css";
import "./p3/cinema.css";
import { MotionProvider } from "@/components/providers/motion-provider";
import { Header } from "@/components/site/header";
import { SectionRail } from "@/components/site/section-rail";
import { CommandPalette } from "@/components/site/command-palette";
import { ChromeGate } from "@/components/site/chrome-gate";
import { site } from "@/lib/content";
import { NAME_FONT_HREF, NOSCRIPT_WORLD_FONTS_CSS, worldFontVariables } from "@/lib/fonts";
import { introModel } from "@/components/intro/intro-model";
import { IntroHeadScript } from "@/components/intro/intro-head-script";
import { IntroOverlay } from "@/components/intro/intro-overlay";
import { IntroBridge } from "@/components/intro/intro-bridge";
import { BootHeadScript } from "@/components/site/boot-head-script";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { WorldFonts } from "@/components/providers/world-fonts";

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

// Not preloaded (M5, mobile LCP): the serif sets section titles and quotes,
// never the first view (the hero is Geist + Geist Mono below 64rem), and
// its two preloads competed with the hero still on a slow connection. It
// still swaps in when a section first uses it.
// §P(b) override (Phase 3, PHASE3-SPEC §5.4): at ≥ 64rem the hero h1 — the
// name — is set in Pirata One (`type-name`), so the name's 5.3 KB file IS
// preloaded, desktop only (`media`, below), from public/ (next/font preloads
// take no media). Phones keep the Geist h1 and fetch no new font. The world
// faces (lib/fonts.ts) are never preloaded: they load per world, lazily.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

/** No JS: React's streamed segments (hidden until its inline script moves
 *  them; see the <noscript> below) are shown where they are. In Tailwind's
 *  first layer: an important declaration in an earlier cascade layer beats
 *  preflight's `[hidden]{display:none!important}` (@layer base). */
const NOSCRIPT_SEGMENTS_CSS = '@layer theme{body>div[hidden][id^="S:"]{display:block!important}}';

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

  // The prologue (SPEC v2 §5): null when film/prologue is off, a plate is
  // unusable, or its copy may not render in this build — then neither the
  // head script nor the overlay ships, so nothing can arm.
  const intro = introModel();

  // The name's face, desktop only (PHASE3-SPEC §5.4): the LCP h1 at ≥ 64rem.
  // `media` keeps phones from fetching it; the @font-face (app/globals.css)
  // sits under the same query and reads the same URL, so the preload is used.
  preload(NAME_FONT_HREF, {
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
    media: "(min-width: 64rem)",
  });

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} ${worldFontVariables} h-full antialiased`}
      // the pre-paint head script adds `intro-armed` / `data-intro` here
      suppressHydrationWarning
    >
      <head>
        {intro ? <IntroHeadScript /> : null}
        {/* every request (Phase 3 boot gate: html.js); B1-SCROLL */}
        <BootHeadScript />
        {/* no JS: every world face is live at ≥ 64rem (no <WorldFonts/> to
            add the html[data-fonts] tokens; app/globals.css "world type").
            And the page itself: app/page.tsx hydrates each section in its
            own Suspense boundary, and React streams a boundary bigger than
            its chunk size as a hidden segment (`<div hidden id="S:n">`
            after </main>) that an inline script moves into place. Without
            JS nothing moves it, so this shows the segments where they sit
            (after the hero, in page order) — P3-11 J9 M4: no-JS showed
            the hero and nothing else. */}
        <noscript dangerouslySetInnerHTML={{ __html: `<style>${NOSCRIPT_WORLD_FONTS_CSS}${NOSCRIPT_SEGMENTS_CSS}</style>` }} />
      </head>
      <body className="flex min-h-full flex-col">
        {intro ? <IntroOverlay model={intro} /> : null}
        {intro ? <IntroBridge /> : null}
        <MotionProvider>
          <ChromeGate>
            <SmoothScroll />
            <SectionRail />
            <CommandPalette />
          </ChromeGate>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-md focus:border focus:border-line focus:bg-elevated focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
          >
            Skip to content
          </a>
          <ChromeGate>
            <Header />
          </ChromeGate>
          <WorldFonts />
          {/* <main id="main"> is rendered by each route (app/page.tsx, which
              also places the credits <footer> after it; app/lab/layout.tsx). */}
          {children}
        </MotionProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
        />
      </body>
    </html>
  );
}
