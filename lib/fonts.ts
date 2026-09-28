/* ============================================================================
   FONTS — the world DISPLAY faces ("lettering", SPEC v2 §9.7, DESIGN v3
   §2.1.1), self-hosted with next/font/local. One file, so every face, its
   licence and its budget are reviewed in one place.

   SCOPE (the only places a world face may appear): act titles (card lower
   bars, the Journey cartouche), loader ROUTE cards (the title lettering, never
   text inside a loader SVG) and easter eggs. NEVER the name, body, Meta,
   labels, verdicts, metrics, tips, quotes, figure labels or research data —
   those stay Geist / Geist Mono / Newsreader (validator #10).

   HOW TO USE: read the plane's slot, not a face —
     className="font-world-act"   (Tailwind: font-family: var(--world-font-act))
   SectionFrame / ActCard set data-world, and each [data-world] block in
   app/globals.css points --world-font-act at its --font-world-* var, falling
   back to Newsreader (fixture L: a missing face never shifts layout, because
   display "optional" never swaps late).

   FILES: assets/fonts/film/<face>/<face>-subset.woff2 + OFL.txt beside it,
   written by scripts/fetch-display-fonts.mjs from the `lettering` strings in
   lib/film.ts (glyph subsets; all four ≈ 18 KB ≤ the 24 KB budget). Add a
   lettering string → re-run the script (else its glyphs fall back).
   Licences and sources: research/build/FONTS.md.

   rdr2: Chinese Rocks (the SPEC's face) is outline-only by its Typodermic
   Desktop EULA (no website embedding) and is NOT shipped in M1, so
   --font-world-rdr2 is intentionally undefined → Newsreader. Rye (OFL) is
   loaded for the Dead Eye egg header only (`--font-egg-rye`).

   preload: false + display: "optional" → never on the LCP path; the browser
   fetches a face only when a glyph in it is actually rendered.
   ========================================================================== */

import localFont from "next/font/local";

// next/font needs LITERAL options in each call (no spreads, no shared
// consts), so every face repeats: weight 400 · normal · display "optional"
// · preload false · adjustFontFallback false (no metric-adjusted Arial: the
// CSS stack falls through to Newsreader, app/globals.css --world-font-act).

/** pirates — Pirata One (OFL 1.1): "THE CROSSING". */
export const fontWorldPirates = localFont({
  weight: "400",
  style: "normal",
  display: "optional",
  preload: false,
  adjustFontFallback: false,
  src: "../assets/fonts/film/pirata-one/pirata-one-subset.woff2",
  variable: "--font-world-pirates",
});

/** idiots — Kalam (OFL 1.1): "The Workshop". */
export const fontWorldIdiots = localFont({
  weight: "400",
  style: "normal",
  display: "optional",
  preload: false,
  adjustFontFallback: false,
  src: "../assets/fonts/film/kalam/kalam-subset.woff2",
  variable: "--font-world-idiots",
});

/** hp — IM Fell English (OFL 1.1): "The Light". */
export const fontWorldHp = localFont({
  weight: "400",
  style: "normal",
  display: "optional",
  preload: false,
  adjustFontFallback: false,
  src: "../assets/fonts/film/im-fell-english/im-fell-english-subset.woff2",
  variable: "--font-world-hp",
});

/** rdr2 egg — Rye (OFL 1.1): "DEAD EYE" (the Dead Eye toast header only). */
export const fontEggRye = localFont({
  weight: "400",
  style: "normal",
  display: "optional",
  preload: false,
  adjustFontFallback: false,
  src: "../assets/fonts/film/rye/rye-subset.woff2",
  variable: "--font-egg-rye",
});

/** Put on <html> (app/layout.tsx): declares every --font-world-* var. */
export const worldFontVariables = [
  fontWorldPirates.variable,
  fontWorldIdiots.variable,
  fontWorldHp.variable,
  fontEggRye.variable,
].join(" ");

/** The CSS var of each world's act-title face (null = Newsreader fallback). */
export const worldFontVar = {
  house: null,
  pirates: "--font-world-pirates",
  idiots: "--font-world-idiots",
  rdr2: null, // Chinese Rocks: outline-only, not shipped (FONTS.md)
  hp: "--font-world-hp",
} as const;
