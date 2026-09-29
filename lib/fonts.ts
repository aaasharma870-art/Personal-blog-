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
   back to Newsreader (fixture L).

   FILES: assets/fonts/film/<face>/<face>-subset.woff2 + OFL.txt beside it,
   written by scripts/fetch-display-fonts.mjs from the `lettering` strings in
   lib/film.ts (glyph subsets; all four ≈ 18 KB ≤ the 24 KB budget). Add a
   lettering string → re-run the script (else its glyphs fall back).
   Licences and sources: research/build/FONTS.md.

   rdr2 (M2, RECOGNIZABILITY O-3 = FONTS.md FT-2 option c): Rye (OFL; it
   has a Reserved Font Name — we self-host Google's served subset) is the
   rdr2 world face: the act title, captions and WANTED (`--font-world-rdr2`).
   Chinese Rocks stays outline-only by its EULA and is not used. The Dead Eye
   egg header keeps its own `--font-egg-rye` binding (the same file).

   M2 CAPTIONS SCOPE (O-1): with film.fontScope.extended the faces also set
   the "caption" lettering slot — scene captions, film titles, WANTED and
   lettered quotes — through components/primitives/scene-caption.tsx (the
   .world-face-<world> classes in app/globals.css). Budget (O-2): ≤ 56 KB.

   preload: false → never on the LCP path; the browser fetches a face only
   when a glyph in it is laid out.
   display: "swap" for the three act-title faces (M1 fix; DESIGN v3 §2.1.1
   said "optional"). With "optional" + no preload a face missed its ~100 ms
   block window on a first visit and NEVER rendered on that page: every act
   title fell back to Newsreader. The faces set only act titles (cards, the
   Journey cartouche) and route loaders — at least a viewport below the fold
   — so the swap lands offscreen: CLS 0, and the lettered span has a fixed
   line box (.lettered-title in app/globals.css) so the title's line never
   changes height. Rye (the Dead Eye egg header) stays "optional".
   ========================================================================== */

import localFont from "next/font/local";

// next/font needs LITERAL options in each call (no spreads, no shared
// consts), so every face repeats: weight 400 · normal · display "swap"
// (Rye: "optional") · preload false · adjustFontFallback false (no
// metric-adjusted Arial: the CSS stack falls through to Newsreader,
// app/globals.css --world-font-act).

/** pirates — Pirata One (OFL 1.1): "THE CROSSING". */
export const fontWorldPirates = localFont({
  weight: "400",
  style: "normal",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  src: "../assets/fonts/film/pirata-one/pirata-one-subset.woff2",
  variable: "--font-world-pirates",
});

/** idiots — Kalam (OFL 1.1): "The Workshop". */
export const fontWorldIdiots = localFont({
  weight: "400",
  style: "normal",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  src: "../assets/fonts/film/kalam/kalam-subset.woff2",
  variable: "--font-world-idiots",
});

/** hp — IM Fell English (OFL 1.1): "The Light". */
export const fontWorldHp = localFont({
  weight: "400",
  style: "normal",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  src: "../assets/fonts/film/im-fell-english/im-fell-english-subset.woff2",
  variable: "--font-world-hp",
});

/** rdr2 — Rye (OFL 1.1): "THE FRONTIER", the rdr2 captions, WANTED (M2). */
export const fontWorldRdr2 = localFont({
  weight: "400",
  style: "normal",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  src: "../assets/fonts/film/rye/rye-subset.woff2",
  variable: "--font-world-rdr2",
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
  fontWorldRdr2.variable,
  fontEggRye.variable,
].join(" ");

/** The CSS var of each world's act-title face (null = Newsreader fallback). */
export const worldFontVar = {
  house: null,
  pirates: "--font-world-pirates",
  idiots: "--font-world-idiots",
  rdr2: "--font-world-rdr2", // Rye (M2, O-3)
  hp: "--font-world-hp",
} as const;
