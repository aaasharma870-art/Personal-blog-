# FONTS — world display faces: licences, sources, what shipped (M1 integrator, 2026-09-28; **M2 update 2026-09-29**)

## 0. M2 update (integrator, 2026-09-29): the captions scope, Rye for rdr2

RECOGNIZABILITY O-1…O-3 override the M1 scope below (the rule outranks subtlety):

- **Scope extended (O-1).** `film.fontScope.extended = true` adds the lettering slot **`caption`**: scene captions (`MOMENT • FILM`, 45 derived strings), the four **film titles** (`PIRATES OF THE CARIBBEAN`, `3 IDIOTS`, `RED DEAD REDEMPTION 2`, `HARRY POTTER`), **`WANTED`**, and four **lettered quotes** (Q-PC-1, Q-3I-2, Q-3I-3, Q-HP-2; their glyphs come from `lib/quotes.ts`, so the line never appears outside the registry). **Guard:** these are OFL text faces, never a logo face or layout: no Mode C face, no bolt-in-a-P, no bevel/gradient type, no skull-and-swords, no stacked RED DEAD / REDEMPTION lockup.
- **Where a face may appear now** (validator #10): the M1 slots below **plus** `components/primitives/scene-caption.tsx` and `components/primitives/world-face.ts`. Everyone else uses `<SceneCaption>`, `<FilmTitle>`, `<Lettered>` or `<FilmQuote rendition="lettered">`, which set a face **only on registered strings** (`lib/sections.ts` `letteredIn`); anything unregistered stays in house type. CSS: `.world-face-<world>` in `app/globals.css`.
- **Rye is the rdr2 world face (O-3 = FT-2 option c).** `--font-world-rdr2` → Rye (`lib/fonts.ts` `fontWorldRdr2`, display swap, preload false). `rd-frontier` "THE FRONTIER" is now Rye, mode A, shipped. **Flag for Aryan:** Rye carries the Reserved Font Name "Rye"; we self-host Google's served subset (the RFN note below applies). Chinese Rocks stays unused (§2); options (a)/(b) remain one line away.
- **Budget (O-2): 56 KB** (was 24 KB). Measured after `scripts/fetch-display-fonts.mjs` on 2026-09-29:

| Face | woff2 | Glyphs |
|---|---|---|
| Pirata One | 2,720 B | ` .ABCDEFGHIJKLMNOPRSTUWYZabeghimnortwz—’…` |
| Kalam | 7,772 B | ` ,-.3?ABCDEFGHIKLMNOPRSTUVWYacdefghiklmnoprstuwxy’` (M2 finish: + `?` for `3i-machine-q` "What is a machine?") |
| Rye | 9,480 B | ` 2ACDEFGHIJKLMNOPRSTUWY’` |
| IM Fell English | 26,336 B | ` ,.ABCDEFGHIKLMNOPRSTUVWXYacdefghimnst—’` |
| **Total** | **46,308 B** | budget 57,344 B |

- All four stay `preload: false`, off the LCP path; a face downloads only when its world's text lays out. The credits' `TYPE` row: Rye is now a world face, not only the egg's.

---


Authority: SPEC v2 §9.7 (scope, modes), DESIGN v3 §2.1.1 (look, budget), ICONS §9 (catalogue). This file is the licence record the SPEC §12.5 #8 check and the credits' `TYPE` row rely on.

**Scope reminder (binding):** a world display face may set **act titles** (card lower bars, the Journey cartouche), **loader route cards** (the title lettering above the loader, never text inside a loader SVG) and **easter eggs**. Never the name, body, lead, Meta, labels, verdicts, metrics, tips, quotes, figure labels or research data. Those stay Geist / Geist Mono / Newsreader.

## 1. What shipped

| World | Face | Licence (verified in the file) | Source | Mode | Glyphs shipped (from `lib/film.ts` `lettering`) | woff2 |
|---|---|---|---|---|---|---|
| pirates | **Pirata One** 400 | SIL OFL 1.1. © 2012 Rodrigo Fuenzalida, Nicolas Massi, **Reserved Font Name "Pirata"** | Google Fonts CSS2 API `text=` subset; licence `github.com/google/fonts/ofl/pirataone/OFL.txt` | A (self-hosted subset) | `THE CROSSING` → ` CEGHINORST` | 1,300 B |
| idiots | **Kalam** 400 | SIL OFL 1.1. © 2014 Indian Type Foundry (no RFN) | same API; `ofl/kalam/OFL.txt` | A | `The Workshop` → ` TWehkoprs` | 3,392 B |
| hp | **IM Fell English** 400 (roman) | SIL OFL 1.1. © 2010 Igino Marini (no RFN) | same API; `ofl/imfellenglish/OFL.txt` | A | `The Light` → ` LTeghit` | 10,044 B |
| rdr2 (egg only) | **Rye** 400 | SIL OFL 1.1. © 2011 Sorkin Type Co, **Reserved Font Name "Rye"** | same API; `ofl/rye/OFL.txt` | A | `DEAD EYE` → ` ADEY` | 3,696 B |
| | | | | | **Total** | **18,432 B** (budget 24,576 B) |

- **Files:** `personal-website/assets/fonts/film/<face>/<face>-subset.woff2`, each with its **`OFL.txt` beside it** (validator #8 fails any font without its licence).
- **Loader:** `personal-website/lib/fonts.ts` (next/font/local): `weight 400`, `display: "optional"`, `preload: false`, `adjustFontFallback: false`. The variables go on `<html>` in `app/layout.tsx`. The `@font-face` rules are global, but a browser downloads a face only when it renders a glyph in it, so there is nothing on the LCP path and no preload. Verified in the build output: only the Geist/Newsreader files are preloaded.
- **CSS vars:** `--font-world-pirates`, `--font-world-idiots`, `--font-world-hp`, `--font-egg-rye`. **`--font-world-rdr2` is deliberately undefined** (see §2).
- **Slot:** each `[data-world]` block in `app/globals.css` sets `--world-font-act: var(--font-world-<id>, var(--font-newsreader)), var(--font-newsreader), Georgia, serif`. The Tailwind utility is **`font-world-act`**, so components use the plane's slot and never name a face. Fixture L holds: a missing face falls through to Newsreader, and with `display: optional` nothing swaps late, so there is no layout shift.
- **Regenerate:** add or change a `lettering` string in `lib/film.ts`, then run `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/fetch-display-fonts.mjs`. The script refetches the glyph subsets and OFL files and fails above 24 KB. **The subsets contain only the listed glyphs.** Any other string set in a display face renders its missing glyphs in the fallback, so a builder who adds lettering (a 404 title, the Map's room labels) must add it to `lettering` and re-run the script.
- **Allow-list:** validator #10 fails any file outside the display-font slots that references `font-world-` / `--font-egg-`. The allowed files are `act-card`, `loader`, `components/primitives/loaders/**`, `components/sections/act-card/**`, `components/eggs/**`, the Journey cartouche (`components/site/journey*.tsx`), `app/not-found*`, `/lab`, `lib/fonts.ts`, `globals.css` and `layout.tsx`. **The intro is not a display-font slot** (SPEC §5.2).

**RFN note (Pirata One, Rye).** Both carry Reserved Font Names, and the OFL forbids a *Modified Version* from using a reserved name. The files we ship are the byte-for-byte subsets that **Google Fonts itself generates and serves** under the family names (the CSS2 API `text=` endpoint). We self-host that served file without modifying it. The subsetting was Google's, done as the families' OFL distributor. I judge this low-risk, but it is an interpretation, not a ruling. If Aryan wants zero ambiguity, the alternative is to drop Rye (the Dead Eye header is optional) and keep Pirata One on the Google-served file. No action is needed for Kalam or IM Fell English, which have no RFN.

## 2. Not shipped: Chinese Rocks (the SPEC's rdr2 act-title face)

- **What the licence says.** Source: `typodermicfonts.com`, free-fonts bundle `typodermic-free-fonts-2026i.zip`, file `chinese rocks rg.otf` v3.104, "Typodermic Desktop EULA v260817" (read 2026-09-28):
  - §2.2 allows *finished materials and static images* only if the representation is **fixed artwork**, not individually addressable glyphs.
  - §4.3 forbids embedding in any **website or webfont implementation**.
  - §4.2 forbids **subsetting** or converting the font.
  - §4.4 forbids storing it on shared or server locations.
  - §4.5 forbids reusable glyph products.
  - §4.7 forbids using glyph outlines "in connection with the development, training, or fine-tuning" of AI models.
- **What that means here.** Chinese Rocks can never go through `next/font`, and this task's "self-host via next/font/local" path is excluded. The only licensed route is SPEC mode B: an outline of the fixed phrase "THE FRONTIER" drawn as **one merged path** (not per-glyph paths), with the font binary kept out of git.
- **Why M1 did not do mode B:**
  1. The licensee who accepts the EULA should be **Aryan**, on his machine, not an agent acting for him.
  2. §4.7's AI clause makes an agent-run outline extraction a judgement call that belongs to him.
  3. The fallback costs nothing: Newsreader `title`, fixture L.
  
  The bundle was downloaded only to the session scratchpad to read the EULA, and the zip and `.otf` were **deleted** afterwards. Nothing Typodermic is in the repo.
- **Current rdr2 act titles:** "THE FRONTIER" (Card II→III) and the LD-RD route card render in **Newsreader** via the slot fallback. `lib/film.ts` keeps the `rd-frontier` lettering entry with `shipped: false`.
- **Options for Aryan (decision FT-2, new):**
  - **(a) Mode B:** he downloads Chinese Rocks himself into the git-ignored `design-src/fonts-personal/` (the ignore line is already in `.gitignore`), and a small `scripts/outline-lettering.*` writes the single-path SVG for "THE FRONTIER" to `lib/lettering.generated.ts`. Validator #10 then requires that file.
  - **(b)** Keep Newsreader.
  - **(c)** Use an OFL western face for the rdr2 act title instead, e.g. **Rye** (already shipped for Dead Eye; ICONS §9 lists it as an rdr act-title alternative) or Sancreek / Ewert. This is a one-line change, `worldFontVar.rdr2`, plus a lettering entry and the fetch script.

## 3. Other faces considered (not needed in M1)
- IM Fell English SC, IM Fell DW Pica, Cinzel, Architects Daughter, Cabin Sketch, Sancreek / Smokum / Ewert, Cedarville Cursive, Homemade Apple: all OFL/Apache via Google Fonts and fetchable with the same script if a slot needs them.
- Mode C (never): the RDR2 "Redemption" face, Hapna, mod font packs, *Lipstick*, HP logo lettering, the POTC wordmark, anything extracted from game or film files.
- Personal-use faces (Harry P, Pieces of Eight, Arthurmorgancursivehandwriting): mode B only, the same licensee caveat as Chinese Rocks, and none are planned.

## 4. Credits `TYPE` row (for the credits roll)
"Geist, Geist Mono (Vercel, OFL) · Newsreader (Production Type, OFL) · Pirata One (Rodrigo Fuenzalida & Nicolás Massi, OFL) · Kalam (Indian Type Foundry, OFL) · IM Fell English (Igino Marini, OFL) · Rye (Sorkin Type, OFL)". Derive it from what actually ships. Newsreader stands in for the rdr2 lettering.
