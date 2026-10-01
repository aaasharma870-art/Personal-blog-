/* ============================================================================
   FONTS — the film faces (SPEC v2 §9.7, DESIGN v3 §2.1.1, PHASE3-SPEC §5),
   self-hosted with next/font/local. One file, so every face, its licence and
   its budget are reviewed in one place (licences + bytes: docs/build/
   FONTS.md; the registry of files: scripts/fetch-display-fonts.mjs FACES).

   TWO SETS, SPLIT AT 64rem (DESKTOP_WIDE, PHASE3-SPEC §5.5):

   1. LEGACY (phones and small tablets, < 64rem) — the four M2 lettering
      subsets, byte-for-byte as before (54,336 B): act titles, loader route
      cards, eggs and (fontScope.extended) the "caption" slot: scene
      captions, film titles, WANTED, lettered quotes. Read through
      `font-world-act` and the .world-face-<world> classes (app/globals.css).
      Below 64rem nothing else changed: the name, body, lead, Meta, labels,
      verdicts, metrics, tips and research data stay Geist / Geist Mono /
      Newsreader.

   2. WORLD TYPE (≥ 64rem only; Phase 3, Aryan's decision 8 + §P(b)) — per
      world a HEAD face (section h2s, non-data h3s, act titles, captions,
      film titles, WANTED, lettered quotes) and a BODY face (world prose
      through type-body / type-small / type-lead; 3 Idiots: a LEAD face
      only), plus the rdr2 journal HAND. Referenced ONLY inside
      `@media (min-width: 64rem)` in app/globals.css, so phones never fetch
      them, and desktop never requests the legacy subsets (they are not
      referenced at ≥ 64rem). Each world's faces load lazily: CSS maps
      `html[data-fonts~="<world>"]` to `--font-world-<world>-<role>-live`,
      and <WorldFonts/> (components/providers/world-fonts.tsx) adds the
      token as the world approaches, from warm-up ladder step 5.

   THE NAME (§P(b) override of "never the name"): the hero h1 is set in
   Pirata One at ≥ 64rem (`type-name`). Its ASCII+ file is NOT a next/font
   face: it lives in public/fonts/film/pirata-one/ so app/layout.tsx can
   preload it with `media: "(min-width: 64rem)"` (next/font preloads take no
   media), and its @font-face sits in app/globals.css under the same media
   query. The Pirates head reads the same file (one request, 5.3 KB).

   HOW TO USE: read the plane's slot, never a face —
     type-chapter / type-title / h3.type-heading  → the world head (CSS)
     type-body / type-small / type-lead           → the world body (CSS)
     className="font-world-head|body|lead|hand"   → explicit role classes
     className="font-world-act"                   → act-title lettering
   Research data never takes a world face: data islands carry
   `data-research` (CSS resets the roles there; validator #10 denies world
   classes next to tnum / type-meta / font-mono and on table / figcaption).

   next/font needs LITERAL options in each call (no spreads, no shared
   consts), so every face repeats: normal · display "swap" (the Dead Eye egg
   binding: "optional") · preload false (never on the LCP path; the name's
   preload is the layout's, desktop only) · adjustFontFallback false (no
   metric-adjusted Arial: each CSS stack falls through to a house face).
   ========================================================================== */

import localFont from "next/font/local";

/* — 1. LEGACY lettering subsets (< 64rem; frozen, 54,336 B) —————————————— */

/** pirates — Pirata One (OFL 1.1, RFN "Pirata"): the M2 lettering subset. */
export const fontWorldPirates = localFont({
  weight: "400",
  style: "normal",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  src: "../assets/fonts/film/pirata-one/pirata-one-subset.woff2",
  variable: "--font-world-pirates",
});

/** idiots — Kalam 400 (OFL 1.1): the M2 lettering subset. */
export const fontWorldIdiots = localFont({
  weight: "400",
  style: "normal",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  src: "../assets/fonts/film/kalam/kalam-subset.woff2",
  variable: "--font-world-idiots",
});

/** hp — IM Fell English (OFL 1.1): the M2 lettering subset. */
export const fontWorldHp = localFont({
  weight: "400",
  style: "normal",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  src: "../assets/fonts/film/im-fell-english/im-fell-english-subset.woff2",
  variable: "--font-world-hp",
});

/** rdr2 — Rye (OFL 1.1, RFN "Rye"): the M2 lettering subset (M2 O-3). */
export const fontWorldRdr2 = localFont({
  weight: "400",
  style: "normal",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  src: "../assets/fonts/film/rye/rye-subset.woff2",
  variable: "--font-world-rdr2",
});

/** rdr2 egg — Rye: "DEAD EYE" (the Dead Eye toast header binding). */
export const fontEggRye = localFont({
  weight: "400",
  style: "normal",
  display: "optional",
  preload: false,
  adjustFontFallback: false,
  src: "../assets/fonts/film/rye/rye-subset.woff2",
  variable: "--font-egg-rye",
});

/* — 2. WORLD TYPE (≥ 64rem only; PHASE3-SPEC §5.2) ——————————————————————
   (The Pirates head is the name's file: --font-name-pirates, globals.css.) */

/** pirates body — Cormorant Garamond 500 (OFL 1.1), latin: 20 px / 1.55, ink only. */
export const fontWorldPiratesBody = localFont({
  weight: "500",
  style: "normal",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  src: "../assets/fonts/film/cormorant-garamond-500/cormorant-garamond-500-latin.woff2",
  variable: "--font-world-pirates-body",
});

/** idiots head — Kalam 700 (OFL 1.1), ASCII+: replaces the 400 subset ≥ 64rem. */
export const fontWorldIdiotsHead = localFont({
  weight: "700",
  style: "normal",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  src: "../assets/fonts/film/kalam-700/kalam-700-ascii.woff2",
  variable: "--font-world-idiots-head",
});

/** idiots lead — Patrick Hand 400 (OFL 1.1), latin: type-lead intros and board notes only. */
export const fontWorldIdiotsLead = localFont({
  weight: "400",
  style: "normal",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  src: "../assets/fonts/film/patrick-hand/patrick-hand-latin.woff2",
  variable: "--font-world-idiots-lead",
});

/** rdr2 head — Rye 400 (OFL 1.1, RFN "Rye"), ASCII+ (Google-served, unmodified). */
export const fontWorldRdr2Head = localFont({
  weight: "400",
  style: "normal",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  src: "../assets/fonts/film/rye-ascii/rye-ascii.woff2",
  variable: "--font-world-rdr2-head",
});

/** rdr2 body — Courier Prime 400 (OFL 1.1), latin: 17 px / 1.65. */
export const fontWorldRdr2Body = localFont({
  weight: "400",
  style: "normal",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  src: "../assets/fonts/film/courier-prime/courier-prime-latin.woff2",
  variable: "--font-world-rdr2-body",
});

/** rdr2 hand — Nothing You Could Do (OFL 1.1): journal heads / dates, ≤ 4 words per page. */
export const fontWorldRdr2Hand = localFont({
  weight: "400",
  style: "normal",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  src: "../assets/fonts/film/nothing-you-could-do/nothing-you-could-do-strings.woff2",
  variable: "--font-world-rdr2-hand",
});

/** hp head — IM Fell English SC 400 (OFL 1.1), ASCII+: replaces the roman subset ≥ 64rem. */
export const fontWorldHpHead = localFont({
  weight: "400",
  style: "normal",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  src: "../assets/fonts/film/im-fell-english-sc/im-fell-english-sc-ascii.woff2",
  variable: "--font-world-hp-head",
});

/** hp body — Crimson Pro 400 (OFL 1.1), latin: 19 px / 1.6 (no italic shipped). */
export const fontWorldHpBody = localFont({
  weight: "400",
  style: "normal",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  src: "../assets/fonts/film/crimson-pro/crimson-pro-latin.woff2",
  variable: "--font-world-hp-body",
});

/** Put on <html> (app/layout.tsx): declares every --font-world-* var. A var
 *  alone fetches nothing; a face downloads when a glyph in it is laid out. */
export const worldFontVariables = [
  fontWorldPirates.variable,
  fontWorldIdiots.variable,
  fontWorldHp.variable,
  fontWorldRdr2.variable,
  fontEggRye.variable,
  fontWorldPiratesBody.variable,
  fontWorldIdiotsHead.variable,
  fontWorldIdiotsLead.variable,
  fontWorldRdr2Head.variable,
  fontWorldRdr2Body.variable,
  fontWorldRdr2Hand.variable,
  fontWorldHpHead.variable,
  fontWorldHpBody.variable,
].join(" ");

/** The CSS var of each world's legacy act-title face (null = Newsreader). */
export const worldFontVar = {
  house: null,
  pirates: "--font-world-pirates",
  idiots: "--font-world-idiots",
  rdr2: "--font-world-rdr2", // Rye (M2, O-3)
  hp: "--font-world-hp",
} as const;

/** The self-hosted name face (public/, preloaded ≥ 64rem by app/layout.tsx;
 *  its @font-face is in app/globals.css). */
export const NAME_FONT_HREF = "/fonts/film/pirata-one/pirata-one-ascii.woff2";

/** The lazy world faces: html[data-fonts~="<world>"] maps
 *  `--font-world-<world>-<role>-live` to the face (app/globals.css). The
 *  Pirates head is the name's file and is never gated. */
const LIVE_ROLES = [
  ["pirates", "body"],
  ["idiots", "head"],
  ["idiots", "lead"],
  ["rdr2", "head"],
  ["rdr2", "body"],
  ["rdr2", "hand"],
  ["hp", "head"],
  ["hp", "body"],
] as const;

/** No JS (app/layout.tsx <noscript>): every world face is live at ≥ 64rem. */
export const NOSCRIPT_WORLD_FONTS_CSS = `@media (min-width:64rem){:root{${LIVE_ROLES.map(
  ([w, r]) => `--font-world-${w}-${r}-live:var(--font-world-${w}-${r})`,
).join(";")}}}`;

/** The credits TYPE row (FONTS.md §4): every face that ships, house first.
 *  IM Fell English (roman) still ships to phones (the legacy subset). */
export const typeCredits = [
  "Geist",
  "Geist Mono",
  "Newsreader",
  "Pirata One",
  "Cormorant Garamond",
  "Kalam",
  "Patrick Hand",
  "Rye",
  "Courier Prime",
  "Nothing You Could Do",
  "IM Fell English",
  "IM Fell English SC",
  "Crimson Pro",
] as const;
