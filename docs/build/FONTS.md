# FONTS — the film faces: licences, sources, what shipped (M1 2026-09-28; M2 2026-09-29; **Phase 3 P3-4, 2026-10-01**)

## P3. Phase 3 (B1-TYPE, PHASE3-SPEC §5): typography per world + the name

**This section overrides everything below it** (IDEAS §0/§O/§P; Aryan's decision 8 and §P(b)). §0–§4 stay as the record of M1/M2; where they disagree with this section, this section wins.

### P3.1 The override: the name, and the world roles (≥ 64rem only)
- **The name (§P(b)).** The hero h1, "Aryan Sharma", is set in **Pirata One** at DESKTOP_WIDE (≥ 64rem) only: the `type-name` step (`app/globals.css`), mixed case only (no `uppercase`, blackletter caps are illegible), line-height .96, tracking .01em, 172.8 px @1440 / 122.9 px @1024. It is still the page's only `<h1>`, with the same markup (two block spans and a real space). Below 64rem it is `type-display` in Geist, declaration for declaration. This retires the old "never the name" rule (the scope reminder under §0 below).
- **World roles (decision 8).** At ≥ 64rem every film world has a **head** face (section h2s, non-data h3s, act titles, captions, film titles, WANTED, lettered quotes) and a **body** face (world prose: `type-body` / `type-small` / `type-lead`; 3 Idiots: a **lead** face only), plus the rdr2 journal **hand** (≤ 4 words per page). The type steps read `--world-font-head|body|lead` (set by the `[data-world]` / `[data-section][data-world]` blocks); explicit classes `font-world-head|body|lead|hand` exist for hosts.
- **Never a world face:** Meta, labels, verdicts, numbers, tables, charts, metric tiles, reported figures, caveats, gauntlet steps, kill-list rows, synthetic labels, figure labels and the whole experiment section (Geist / Geist Mono). Data islands carry `data-research`; `app/p3/type.css` resets the roles inside them (and on `.tnum`, `table`, research figures …). Also house type: the hero lead and identity line, subtitles, title cards 1–2 and all UI chrome (`data-house-type`, controls, the header, act cards' subtitles).
- **Below 64rem nothing changed.** Phones keep the four M2 lettering subsets (§0 table) for act titles, loaders, eggs and captions, byte-for-byte: **54,336 B**, and fetch no new font. Every new face, var and file is referenced only inside `@media (min-width: 64rem)`; at ≥ 64rem the legacy subsets are not referenced, so desktop never requests them.

### P3.2 What ships at ≥ 64rem (fetched 2026-10-01 by `scripts/fetch-display-fonts.mjs`)

| World | Role | Face | Cut | Licence (verified in the file) | woff2 | File |
|---|---|---|---|---|---|---|
| pirates | display + head | **Pirata One** 400 (Rodrigo Fuenzalida, Nicolás Massi) | ASCII+ | SIL OFL 1.1, © 2012, **RFN "Pirata"** | 5,312 B | `public/fonts/film/pirata-one/pirata-one-ascii.woff2` |
| pirates | body | **Cormorant Garamond** 500 (Christian Thalmann) | latin | SIL OFL 1.1, © 2015 the Cormorant Project Authors | 23,312 B | `assets/fonts/film/cormorant-garamond-500/cormorant-garamond-500-latin.woff2` |
| idiots | head | **Kalam** 700 (Indian Type Foundry) | ASCII+ | SIL OFL 1.1, © 2014 Indian Type Foundry | 13,448 B | `assets/fonts/film/kalam-700/kalam-700-ascii.woff2` |
| idiots | lead | **Patrick Hand** 400 (Patrick Wagesreiter) | latin | SIL OFL 1.1, © 2010–2012 Patrick Wagesreiter | 23,944 B | `assets/fonts/film/patrick-hand/patrick-hand-latin.woff2` |
| rdr2 | head | **Rye** 400 (Nicole Fally, Sorkin Type) | ASCII+ | SIL OFL 1.1, © 2011 Sorkin Type Co, **RFN "Rye"** | 27,536 B | `assets/fonts/film/rye-ascii/rye-ascii.woff2` |
| rdr2 | body | **Courier Prime** 400 (Alan Dague-Greene) | latin | SIL OFL 1.1, © 2015 the Courier Prime Project Authors | 18,640 B | `assets/fonts/film/courier-prime/courier-prime-latin.woff2` |
| rdr2 | hand | **Nothing You Could Do** 400 (Kimberly Geswein) | strings (A–Z a–z 0–9 + `.,:;’'–-` + any registered string) | SIL OFL 1.1, © 2010 Kimberly Geswein | 9,004 B | `assets/fonts/film/nothing-you-could-do/nothing-you-could-do-strings.woff2` |
| hp | head | **IM Fell English SC** 400 (Igino Marini) | ASCII+ | SIL OFL 1.1, © 2010 Igino Marini | 44,432 B | `assets/fonts/film/im-fell-english-sc/im-fell-english-sc-ascii.woff2` |
| hp | body | **Crimson Pro** 400 (Jacques Le Bailly) | latin | SIL OFL 1.1, © 2018 the Crimson Pro Project Authors | 18,336 B | `assets/fonts/film/crimson-pro/crimson-pro-latin.woff2` |

- **Per world:** pirates 28,624 B · idiots 37,392 B · rdr2 55,180 B · hp 62,768 B (each ≤ 64 KB). **All desktop film faces:** 183,964 B (≤ 192 KB). **Preloaded:** 5,312 B (≤ 6 KB). **Below 64rem:** 54,336 B (= today's). The validator enforces all five (`scripts/checks/fonts.mjs`), from the files on disk, so a hand-added file cannot bypass them.
- **Cuts.** ASCII+ = Google's `text=` subset of the 95 printable ASCII + `‘’“”–—…•·×` (any English heading: heading copy can change without a re-run). latin = Google's `/* latin */` unicode-range file. strings = `text=` with a base set plus the registered strings. Each file has its licence and a **`glyphs.txt`** (its real cmap) beside it. Designers verified against fonts.google.com metadata; copyright lines against each licence file.
- **Every face is SIL OFL 1.1** (no Apache face ships): web embedding, self-hosting and subsetting are allowed. The legacy subsets keep their M2 `OFL.txt`.
- **Retired at ≥ 64rem** (still the phone set): Pirata One subset 3,036 · Kalam 400 subset 7,932 · Rye subset 13,516 · IM Fell English (roman) subset 29,852. The roman IM Fell is replaced by the SC cut on desktop; Kalam 400 by Kalam 700.
- **Not shipped:** the Crimson Pro italic (+19 KB; the HP copy uses none). **Rejected** (PHASE3-SPEC §5.2): IM Fell / IM Fell DW Pica as body, Cormorant 400, Permanent Marker, Kalam 300, Nunito, Special Elite as body, Cedarville, Homemade Apple, Ewert. **Fallback face** if the 1024 blind test of the name fails (P3-11): New Rocker (OFL, RFN "New Rocker").

### P3.3 Sizes, measures, lines (PHASE3-SPEC §5.3; `app/globals.css` "world type")

| Face | Role | Scale / size | Line-height | Tracking | Measure |
|---|---|---|---|---|---|
| Pirata One | head | ×1.0 of `type-chapter` 86.4 / `type-title` 63.4 px @1440 | .95 | 0 | — |
| Kalam 700 | head | ×.95 | **1.05** (MaskReveal clips at .95; also the lettered act title) | 0 | — |
| Rye | head | ×.8, heads ≤ 6 words | 1.0 | +.01em | — |
| IM Fell English SC | head | ×1.1 | 1.0 | +.02em | — |
| Cormorant Garamond 500 | body | 20 px (small 18, lead 22) | 1.55 | 0 | 32rem (lead 30rem), **ink only** (never `--fg-muted`) |
| Patrick Hand | lead | 22 px, ≤ 3 lines | 1.45 | 0 | 25rem |
| Courier Prime | body | 17 px (small 15, lead 20) | 1.65 | 0 | 36rem (lead 34rem) |
| Crimson Pro | body | 19 px (small 16, lead 22) | 1.6 | 0 | 31rem (lead 30rem) |
| Geist (house) | body | 17 px | 1.6 | — | **35rem** at ≥ 64rem (was `68ch` ≈ 96 Geist characters) |

All heads: weight 400, `text-wrap: balance`, `font-synthesis: none`, never `uppercase` on Pirata or Kalam sentences. Measures are in rem, not `ch` (`ch` is each face's "0").

### P3.4 Loading (PHASE3-SPEC §5.4–5.5)
- **The name is preloaded, desktop only.** `app/layout.tsx` calls `ReactDOM.preload("/fonts/film/pirata-one/pirata-one-ascii.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous", media: "(min-width: 64rem)" })`. It is a `public/` file because next/font preloads take no `media`. Its `@font-face` ("Film Name Pirates", `font-display: swap`) is in `app/globals.css` under `@media (min-width: 64rem)`, with **Geist-matched vertical metrics** (`ascent-override: 100.5%; descent-override: 29.5%; line-gap-override: 0%`, Geist's 1005 / 295 / 0 per 1000 upm; Pirata's own are 1006 / 279 / 0), so the Geist fallback and Pirata share one line box and baseline: a late swap changes glyph widths only (CLS 0). The Pirates head reads the same file (one request).
- **Every other face is lazy per world.** They are `next/font/local` faces in `lib/fonts.ts` (`preload: false`, `display: "swap"`, `adjustFontFallback: false`), referenced only through `--font-world-<world>-<role>-live`, which exists only while `html[data-fonts~="<world>"]` holds the token. `<WorldFonts/>` (`components/providers/world-fonts.tsx`) adds a token from warm-up ladder step 5 (DESKTOP_FINE; wide touch screens: the quiet end, then an idle slice) when any plane of that world is within `rootMargin: "150% 0px"`: Pirates at once at the top of the page. The chapter select, the fast lane and anchor jumps call `markWorldFontsReady(world)` (`lib/world-fonts.ts`, awaits `document.fonts.load()` ≤ 300 ms). `loadingdone` → `requestScrollRefresh()`.
- **Before the first scroll** (before ladder step 5): only the name's file and the house faces (Geist, Geist Mono, Newsreader) load. **One exception:** on a first visit the prologue (`html.intro-armed`) letters its play-screen and flight captions in the hp head, so IM Fell English SC (44 KB) loads with the page then, as the roman subset (29.9 KB) did before. With `?skip=intro` or a returning visit it does not.
- **No JS:** a `<noscript>` style in `app/layout.tsx` makes every face live at ≥ 64rem.
- **Probes:** `tools/capture/probes/font-network.mjs` (preload with media, h1 in Pirata, nothing but the name + house before step 5, no legacy subset on desktop, every world after a scroll, 390 fetches no new font and ≤ 54,336 B of film fonts, LCP, CLS) and `research-font.mjs` (0 non-Geist text in `[data-research]` / `.tnum` / tables / research figures / the experiment at ≥ 64rem).

### P3.5 Validator (#10 + check 8)
- **#10 (`scripts/checks/lettering.mjs`): class allow + data deny.** Lettering slots: act-title, loader, egg, caption (`fontScope.extended`), **display** (`fontScope.name`: exactly one entry, `text === site.name`, the hero world's face, mode A, shipped, rendered only by `hero-section.tsx`); the head / body / lead / hand roles are in scope while `fontScope.worlds` is on. The role classes `font-world-head|body|lead|hand` are allowed in any `components/**`. Raw faces (`--font-world-*`, `world-face-*`, `font-world-act`, `fontWorld*`, `worldFaceClass(`) keep an allow-list (plus `world-kit.tsx`, `hero-section.tsx`, `components/words/**`, `chapter-select.tsx` and `film-quote.tsx`). **Denied:** any world face in `components/visuals/**`, `metric-tile.tsx` or the experiment section; on a className that also has `tnum`, `tabular-nums`, `type-meta` or `font-mono`; on `table` / `td` / `th` / `figcaption`. The h1 carries `type-name`, never `uppercase`, and is the only `<h1>`.
- **Check 8 (`scripts/checks/fonts.mjs`):** every FACES file, its licence and `glyphs.txt`; the legacy bytes; the budgets; **glyph coverage** (every shipped mode-A lettering string and lettered quote against its desktop face's `glyphs.txt`; a miss in the frozen phone subset is a warning: that glyph falls back below 64rem); new face vars only inside `@media (min-width: 64rem)`; `-live` vars only under their `html[data-fonts~=…]` token (the name's file and the prologue's hp head excepted); the name's `@font-face` and preload; every `localFont()` `preload: false`; #5 extended: each world sets `--world-font-head`, `--world-font-body` (idiots `--world-font-lead`) and `--world-head-scale`.
- **Regenerate:** `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/fetch-display-fonts.mjs` refetches the desktop faces and licences, rewrites every `glyphs.txt`, enforces the budgets and prints the table above (`--check`: no network). It never touches the legacy subsets (phones keep today's bytes); a new lettering string with a glyph outside a legacy subset renders that glyph in the fallback below 64rem.

### P3.6 RFN note (Pirata One, Rye only)
Pirata One ("Pirata") and Rye ("Rye") carry Reserved Font Names. As in §1's note, we ship only the **unmodified files Google Fonts itself generates and serves** under the family names (the CSS2 `text=` ASCII+ subsets), never our own subset, and our CSS alias for the name face ("Film Name Pirates") is not a font name inside any file. Every other Phase-3 face has no RFN and could be subset by any tool; we still ship Google's served files.

### P3.7 Credits `TYPE` row
"Geist · Geist Mono · Newsreader · Pirata One, Cormorant Garamond, Kalam, Patrick Hand, Rye, Courier Prime, Nothing You Could Do, IM Fell English, IM Fell English SC, Crimson Pro (SIL Open Font License 1.1)". IM Fell English (roman) stays listed because phones still load its subset. The list is exported as `typeCredits` from `lib/fonts.ts` for the footer's `Type` row.

---


## 0. M2 update (integrator, 2026-09-29): the captions scope, Rye for rdr2

RECOGNIZABILITY O-1…O-3 override the M1 scope below (the rule outranks subtlety):

- **Scope extended (O-1).** `film.fontScope.extended = true` adds the lettering slot **`caption`**: scene captions (`MOMENT • FILM`, 45 derived strings), the four **film titles** (`PIRATES OF THE CARIBBEAN`, `3 IDIOTS`, `RED DEAD REDEMPTION 2`, `HARRY POTTER`), **`WANTED`**, and the **lettered quotes** (Q-PC-1, Q-3I-2, Q-3I-3, Q-HP-2, plus the films chapter's Q-PC-2, Q-3I-1, Q-RD-1, Q-HP-4; their glyphs come from `lib/quotes.ts`, so the line never appears outside the registry). **Guard:** these are OFL text faces, never a logo face or layout: no Mode C face, no bolt-in-a-P, no bevel/gradient type, no skull-and-swords, no stacked RED DEAD / REDEMPTION lockup.
- **Where a face may appear now** (validator #10): the M1 slots below **plus** `components/primitives/scene-caption.tsx` and `components/primitives/world-face.ts`. Everyone else uses `<SceneCaption>`, `<FilmTitle>`, `<Lettered>` or `<FilmQuote rendition="lettered">`, which set a face **only on registered strings** (`lib/sections.ts` `letteredIn`); anything unregistered stays in house type. CSS: `.world-face-<world>` in `app/globals.css`.
- **Rye is the rdr2 world face (O-3 = FT-2 option c).** `--font-world-rdr2` → Rye (`lib/fonts.ts` `fontWorldRdr2`, display swap, preload false). `rd-frontier` "THE FRONTIER" is now Rye, mode A, shipped. **Flag for Aryan:** Rye carries the Reserved Font Name "Rye"; we self-host Google's served subset (the RFN note below applies). Chinese Rocks stays unused (§2); options (a)/(b) remain one line away.
- **Budget (O-2): 56 KB** (was 24 KB). Measured after `scripts/fetch-display-fonts.mjs` on 2026-09-29:

| Face | woff2 | Glyphs |
|---|---|---|
| Pirata One | 3,036 B | ` ,.ABCDEFGHIJKLMNOPRSTUWYabdeghilmnorstuvwz—’…` |
| Kalam | 7,932 B | ` ,-.3?ABCDEFGHIKLMNOPRSTUVWYacdefghiklmnoprstuwxyz’` (M2 finish: + `?` for `3i-machine-q` "What is a machine?") |
| Rye | 13,516 B | ` .2ABCDEFGHIJKLMNOPRSTUWYaehlmorstwy’` |
| IM Fell English | 29,852 B | ` ,.ABCDEFGHIKLMNOPRSTUVWXYacdefghilmnorstvwy—’` |
| **Total** | **54,336 B** (re-measured 2026-10-01; M2 recorded 3,008 / 54,308) | budget 57,344 B (re-measured after the films chapter's four lines were lettered: Q-PC-2, Q-3I-1, Q-RD-1, Q-HP-4; ~3 KB of headroom left) |

- All four stay `preload: false`, off the LCP path; a face downloads only when its world's text lays out. The credits' `TYPE` row: Rye is now a world face, not only the egg's.

---


Authority: SPEC v2 §9.7 (scope, modes), DESIGN v3 §2.1.1 (look, budget), ICONS §9 (catalogue). This file is the licence record the SPEC §12.5 #8 check and the credits' `TYPE` row rely on.

**Scope reminder (M1; superseded by §P3.1 at ≥ 64rem: the name and the world head / body roles):** a world display face may set **act titles** (card lower bars, the Journey cartouche), **loader route cards** (the title lettering above the loader, never text inside a loader SVG) and **easter eggs**. Never the name, body, lead, Meta, labels, verdicts, metrics, tips, quotes, figure labels or research data. Those stay Geist / Geist Mono / Newsreader.

## 1. What shipped

| World | Face | Licence (verified in the file) | Source | Mode | Glyphs shipped (from `lib/film.ts` `lettering`) | woff2 |
|---|---|---|---|---|---|---|
| pirates | **Pirata One** 400 | SIL OFL 1.1. © 2012 Rodrigo Fuenzalida, Nicolas Massi, **Reserved Font Name "Pirata"** | Google Fonts CSS2 API `text=` subset; licence `github.com/google/fonts/ofl/pirataone/OFL.txt` | A (self-hosted subset) | `THE CROSSING` → ` CEGHINORST` | 1,300 B |
| idiots | **Kalam** 400 | SIL OFL 1.1. © 2014 Indian Type Foundry (no RFN) | same API; `ofl/kalam/OFL.txt` | A | `The Workshop` → ` TWehkoprs` | 3,392 B |
| hp | **IM Fell English** 400 (roman) | SIL OFL 1.1. © 2010 Igino Marini (no RFN) | same API; `ofl/imfellenglish/OFL.txt` | A | `The Light` → ` LTeghit` | 10,044 B |
| rdr2 (egg only) | **Rye** 400 | SIL OFL 1.1. © 2011 Sorkin Type Co, **Reserved Font Name "Rye"** | same API; `ofl/rye/OFL.txt` | A | `DEAD EYE` → ` ADEY` | 3,696 B |
| | | | | | **Total** | **18,432 B** (budget 24,576 B) |

- **Files:** `personal-website/assets/fonts/film/<face>/<face>-subset.woff2`, each with its **`OFL.txt` beside it** (validator #8 fails any font without its licence).
- **Loader (M1; M1 fix: `display: "swap"`; Phase 3: §P3.4):** `personal-website/lib/fonts.ts` (next/font/local): `weight 400`, `display: "optional"`, `preload: false`, `adjustFontFallback: false`. The variables go on `<html>` in `app/layout.tsx`. The `@font-face` rules are global, but a browser downloads a face only when it renders a glyph in it, so there is nothing on the LCP path and no preload. Verified in the build output: only the Geist/Newsreader files are preloaded.
- **CSS vars:** `--font-world-pirates`, `--font-world-idiots`, `--font-world-hp`, `--font-egg-rye`. (M1: `--font-world-rdr2` was undefined; since M2 it is Rye, §0.)
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
