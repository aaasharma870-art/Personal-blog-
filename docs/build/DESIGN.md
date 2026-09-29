# The Reading Line × three films and a game — Style Reference (DESIGN.md v3)
> A research journal set in type: one name, one bracket, one reading line, lit by three films and a game.

**Theme:** dark, with an **optional paper plane that is ON for Writing (D-4)**. There are three dark tone planes (`canvas`, `raised`, `deep`) × five **world keys** (`house`, `pirates`, `idiots`, `rdr2`, `hp`), plus the `paper` plane (v3: **the rdr2 journal page**; HP parchment under SPEC RD-1 option B; the tokens are identical).
**Status:** **v3** (2026-09-28). It replaces v2 (kept verbatim at `build/DESIGN.v2.md`) and applies Aryan's newest directions: RDR2 as a fourth world (SPEC A-5), the iconic override (A-6), the five hard limits (A-7) and scoped world display fonts (A-8). Every build prompt and every critique prompt reads this file together with `build/SPEC.md` (v2) and `build/ICONS.md`.
**Reads with:** `build/SPEC.md` v2 (structure, the world system, the manifest, **icon placement**; it wins on *what goes where*) · `build/ICONS.md` (how each icon is recreated; taste guards) · `build/rdr2/STUDY.md` (RDR2 recipes R-1…R-6) · `personal-website/CLAUDE.md` Part I (content truth; the §2 exclusions are absolute) · `build/MEDIA-PLAN.md` v2 · `build/bars/*.BAR.md` · `prep/TEARDOWN.md` · `prep/VERIFIED-VALUES.md`.

**Art direction.** The site reads like a quantitative researcher's journal, set in type and lit by three films and a game. Aryan's name is the largest object on the page: a quiet grotesk standing in front of a night sea with a black-sailed ship on its horizon. One device, the interval bracket `[ ]`, marks whatever is in focus: the Play control, the in-focus row of the research ledger, and finally the AS monogram over the last flame. Outside the bracket everything is legible but quiet.

The worlds arrive as **light, material and their own iconography, recreated by us** (v3; the v2 rule "never objects or marks" is lifted by the iconic override, within the hard limits of §11.6):
- **Harry Potter (the prologue and Act IV):** a castle across a black lake, floating candles, a real-looking riderless broom, ink that draws itself, the enchanted hall, Lumos and Nox, the Marauder's Map.
- **Pirates (Act I):** the crossing: a night sea, bioluminescence, the Black Pearl's stern lantern, Jack's compass with its red arrow, brass course lines, the treasure X.
- **3 Idiots (Act II):** the workshop at first light: a chalkboard under stone colonnades, blueprints in the jugaad register, gears that tell the truth, Rancho's circle, "Aal izz well".
- **Red Dead Redemption 2 (Act III):** the frontier at golden hour, a journal kept in graphite, a tintype that develops, a campfire where people are heard, and (opt-in) Dead Eye.

One curve, the Line, is drawn in each world's material. Hierarchy comes from scale and space, never from boxes, glows or labels. Killed ideas get the same dignity as survivors. Places change by tone and world, at a curved dome seam or a letterboxed act card. Motion is scarce and named. Nothing hides the text, nothing hijacks the scroll, and every world light lives inside media. **Iconic, not theme-park:** every icon carries a site truth, is drawn with instrument-grade care, and passes the admissions-reader test (§8.1).

---

## 0. Rules of this file

- **Precedence:**
  - Content: CLAUDE.md Part I.
  - Structure: SPEC.md.
  - Look: this file, over CLAUDE.md Part II and over v1.
  - The brief wins unless this file or SPEC names an override (D-1…D-6, N1, N2, **A-5…A-9**).
  - **Aryan's newest directions (SPEC A-5…A-8) override any conflicting v2, Kimi or brief rule.** Where an icon's drawing is concerned, ICONS.md wins; where its placement is concerned, SPEC §10.2 wins.
- **Evidence tags:**
  - **OBSERVED:** `VER` (checked against saved source) · `MEAS` (counted in TEARDOWN).
  - **CREATOR-DOCUMENTED:** `REPO` (a repo token at `b8444d3`) · `BRIEF` · `KIMI` (Kimi Part V/VI, which is itself INFERRED for hexes).
  - **INFERRED:** `CALC` (WCAG contrast from `build/tools/contrast.mjs`; spring step response from `build/tools/springs.mjs`).
  - **PROPOSED:** `SYN` (SYNTHESIS) · `SPEC` · `PROP` (new here).
  - **A PROP value is a starting value** to tune by eye against `/lab` frame sequences at 1440, 390 and reduced motion.
- **Tokens only.** Components contain no raw hex, rgba or px; the validator and `impeccable audit` check this. World values live under `[data-world]` selectors in `app/globals.css`.
- **Fonts.** Every build prompt names them: **"Geist (next/font), Geist Mono, Newsreader."** v3: the only other families are the **scoped world display faces** of §2.1.1 (act titles, loaders, easter eggs; never the name, body or research data), loaded only by their owning components.
- **v2 / v3 markers.** A **v2** tag marks a change from v1; a **v3** tag marks a change from v2; unmarked rows are v1 unchanged.

---

## 1. Colour

### 1.1 Base palette (house world; v1 unchanged unless marked)
| Name | Value | Token | Role | On canvas | Basis |
|---|---|---|---|---|---|
| Deep | `#05080a` | `--color-deep` | Ground of the `deep` tone: act cards, the intermission, credits, letterbox bars | — | SYN |
| Canvas | `#0b0f12` | `--color-canvas` | The default ground; every house value is judged on it | — | REPO |
| Raised | `#121820` | `--color-raised` | The `raised` tone; surface-1 on canvas | — | REPO |
| Overlay | `#18212a` | `--color-overlay` | Surface-2 on canvas (palette, menu sheet, demo readout) | — | REPO |
| Slate | `#202b35` | `--color-slate` | Surface-2 on the raised tone only; ink and stone text only (muted is 4.17 and fails) | — | REPO, CALC |
| Ink | `#e6edf3` | `--color-ink` | `--fg`: the name, headings, all prose | 16.29 | REPO, CALC |
| Stone | `#9db0bd` | `--color-stone` | `--fg-muted`: Meta, captions | 8.59 | REPO, CALC |
| Muted | `#7c8c9a` | `--color-muted` | `--fg-ghost`: everything outside the bracket; the AA floor for text | 5.57 | REPO, CALC |
| Aqua | `#2dd4bf` | `--color-aqua` | `--accent`: **the one in-focus mark per viewport** | 10.34 | REPO |
| Aqua bright | `#5eead4` | `--color-aqua-bright` | Hover and pressed state of what is already aqua. Never at rest | 13.01 | REPO |
| Amber | `#f4b740` | `--color-amber` | `--exception`: only the EXCEPTION verdict | 10.72 | REPO |
| Ember | `#ef6f6c` | `--color-ember` | `--kill`: killed or rejected only | 6.56 | REPO |
| Rule | `rgb(230 237 243 / .10)` | `--color-rule` | Hairlines; decorative | 1.25 | REPO |
| **Intro night** (v3 retune) | **`#020e1c`** (was `#06080d`) | `--color-intro-night` | The prologue overlay ground, matched to the accepted IN-01's bluer night (MEDIA LOG flag: IN-01 corners ≈ (1,15,30)) | ink 16.42 · stone 8.67 · muted 5.61 · aqua 10.42 | OBSERVED (IN-01), CALC |

### 1.2 Accent law (v2: the four laws of SPEC §1 apply)
1. **At most 1 aqua mark per viewport at rest**, counted over DOM and SVG, chrome included; media pixels are exempt.
   - Exempt: hover, `:focus-visible`, pressed, and motion-only chroma.
   - The Lens group (bracket + the active SURVIVED word) counts as one mark (v1 lens BAR O-3).
2. **Where the aqua lives:**
   - **The prologue:** the Play bracket.
   - **The hero:** the bracket (resting around the wave crest, or open after Play). The CTA is ink, with an aqua focus ring and an aqua-bright hover.
   - **The ledger:** only the active row takes hue.
   - **Card I→II:** only the 3 px seam line in its window .1 < p < .9.
   - **The gauntlet:** only the active gate.
3. **Meaning is carried by the word** (SURVIVED / KILLED / EXCEPTION), never by hue alone.
4. **Film light law (v2, replaces v1 rule 5 "No glow").** Luminous paint (glow, bloom, flame, bioluminescence, lantern, lumos, **golden-hour sun, campfire, embers**) may appear **only** in:
   - (a) `MediaFrame` media
   - (b) the one active **world canvas** (the intro, the Journey sequence, or the ignite)
   - (c) aria-hidden **world-media sprites** inside `WorldLoader`, as pre-rendered PNG sprites
   - **Never** on DOM text, controls, cards, chrome or seams. No `text-shadow`, glow `box-shadow`, radial-gradient paint or animated `filter` on DOM.
   - The intro overlay's CSS night ground (a flat `--color-intro-night`) is not paint.
5. **Semantic reservations in the DOM:** ember = killed (the Dead Eye X is ember precisely because it marks KILLED rows); amber = EXCEPTION. The world warm families (candle, lantern, morning light, **golden hour, fire**) are pixels, not UI colour. **Film palettes never colour research data.** v3: the compass red `#a8453a` and the Dead Eye red `#d64236` are decorative only and never sit beside ember (2.00 and 1.53 apart, CALC).
6. **Colour is attention.** Unfocused figures show their `-mono` variant; focus crossfades them to colour.
7. **Retired:** `gold`, `gold-bright`, `cyan` (which renders amber), `surface`, `elevated`, `line-strong`, all component rgba and hex literals (MEAS), and Kimi's `--hp-oxblood` (no seal element ships).

### 1.3 World palettes (v2). Every hex, its role, and AA CALC against its background
Worlds recolour **only the tone planes, inside the near-black band**. Sections read only `--bg --surface-1 --surface-2 --fg --fg-muted --fg-ghost --accent --kill --exception --rule` plus the world's decorative tokens `--w-*`. `SectionFrame` sets `data-tone` × `data-world`.

**1.3.1 Grounds × text (WCAG 2.x; normal text needs ≥ 4.5; all pass except the marked cells)**

| World · plane | Hex | Token | Role | ink | stone | muted | aqua | aqua-br | amber | ember |
|---|---|---|---|---|---|---|---|---|---|---|
| house · canvas | `#0b0f12` | `--color-canvas` | Default | 16.29 | 8.59 | 5.57 | 10.34 | 13.01 | 10.72 | 6.56 |
| house · raised | `#121820` | `--color-raised` | Raised tone | 15.10 | 7.97 | 5.16 | 9.58 | 12.06 | 9.93 | 6.08 |
| house · deep | `#05080a` | `--color-deep` | Cards, films, credits | 17.00 | 8.97 | 5.81 | 10.79 | 13.58 | 11.18 | 6.85 |
| house · overlay | `#18212a` | `--color-overlay` | Surface-2 | 13.78 | 7.27 | 4.71 | 8.75 | 11.01 | 9.07 | 5.55 |
| pirates · canvas | `#0a1519` | `--pir-canvas` | Sea-night ground (Act I) | 15.67 | 8.27 | 5.36 | 9.95 | 12.52 | 10.31 | 6.31 |
| pirates · raised | `#10202a` | `--pir-raised` | Raised / surface-1 | 14.08 | 7.43 | 4.81 | 8.94 | 11.25 | 9.27 | 5.67 |
| pirates · overlay | `#12232b` | `--pir-overlay` | Surface-2 (retuned from `#162a33`, where muted was 4.30 ✗) | 13.66 | 7.21 | 4.67 | 8.67 | — | 8.99 | 5.50 |
| pirates · deep | `#050b0d` | `--pir-deep` | Hero ground, Act I deep | 16.76 | 8.85 | 5.73 | 10.64 | 13.39 | 11.03 | 6.75 |
| idiots · canvas | `#0d1513` | `--idi-canvas` | Green-black board ground (Act II) | 15.68 | 8.27 | 5.36 | 9.95 | 12.52 | 10.31 | 6.32 |
| idiots · raised | `#141d1b` | `--idi-raised` | Raised (experiment) / surface-1 | 14.55 | 7.68 | 4.97 | 9.24 | 11.62 | 9.57 | 5.86 |
| idiots · overlay | `#1a2320` | `--idi-overlay` | Surface-2 (retuned from `#1b2522`, muted 4.55, too tight) | 13.62 | 7.19 | 4.65 | 8.64 | — | 8.96 | 5.49 |
| idiots · deep | `#060a09` | `--idi-deep` | Card I→II lower bars | 16.84 | 8.89 | 5.76 | 10.69 | 13.45 | 11.08 | 6.79 |
| **blueprint panel** | `#0f2c47` | `--bp-panel` | Schematic panels ≤ 40% area; Card I→II ground | 12.08 | 6.37 | **4.13 ✗** | 7.67 | 9.65 | 7.95 | 4.87 |
| hp · canvas | `#0f0c09` | `--hp-canvas` | Candle-night ground (Act III) | 16.50 | 8.71 | 5.64 | 10.48 | 13.18 | 10.86 | 6.65 |
| hp · raised | `#18130e` | `--hp-raised` | Raised / surface-1 | 15.61 | 8.24 | 5.34 | 9.91 | 12.47 | 10.27 | 6.29 |
| hp · overlay | `#1f1812` | `--hp-overlay` | Surface-2 | 14.84 | 7.83 | 5.07 | 9.42 | — | 9.76 | 5.98 |
| hp · deep | `#070504` | `--hp-deep` | Card III→IV, contact | 17.21 | 9.08 | 5.88 | 10.93 | 13.75 | 11.33 | 6.94 |
| **rdr2 · canvas** (v3) | `#130d0b` | `--rd-canvas` | Oxblood-umber dusk ground (Act III: Beyond) | 16.30 | 8.60 | 5.57 | 10.35 | 13.02 | 10.73 | 6.57 |
| **rdr2 · raised** (v3) | `#1c1411` | `--rd-raised` | Raised / surface-1 | 15.35 | 8.10 | 5.25 | 9.75 | 12.26 | 10.10 | 6.19 |
| **rdr2 · overlay** (v3) | `#231915` | `--rd-overlay` | Surface-2 (the tightest cell: muted 4.97) | 14.55 | 7.68 | 4.97 | 9.24 | 11.62 | 9.57 | 5.86 |
| **rdr2 · deep** (v3) | `#0a0605` | `--rd-deep` | Card II→III, Voices (the campfire) | 17.07 | 9.01 | 5.83 | 10.84 | 13.63 | 11.23 | 6.88 |
| **Dead Eye ground** (v3, egg only) | `#1a0907` | `--rd-deadeye-bg` | The ledger's ground while the Dead Eye egg runs (text colours never change) | 16.36 | 8.64 | 5.59 | 10.39 | 13.07 | 10.77 | 6.59 |

**Rules from the table:**
- **Blueprint panels** carry ink, stone, bp-line or chalk only. **No muted/ghost text and no ghosted rows on a panel** (4.13 fails). Ember passes (4.87) but is still never placed on a panel (a verdict never sits on a figure).
- Kimi's `#123a5e` panel is **rejected**: muted 3.39 and ember 3.99 fail (CALC).
- Slate `#202b35` still carries ink and stone only.

**1.3.2 The paper plane: the journal page (D-4 YES; Writing only). v3: re-hosted in the rdr2 world as Arthur-style journal paper; under SPEC RD-1 option B it is HP parchment again. The tokens are identical either way (world-independent `--paper-*`).**

| Role | Hex | Token | On `#ebe0c6` | Note |
|---|---|---|---|---|
| Ground | `#ebe0c6` | `--paper` | — | Chosen over Kimi's `#e6d3a8` (ghost 4.48 ✗, kill 4.46 ✗, exception 4.02 ✗ there) and v1's `#ece6da` (DESIGN v1's inks fail on warmer paper) |
| Surface-1 | `#f3ecda` | `--paper-s1` | — | fg 13.01 · ghost 5.61 · kill 5.58 · exc 6.05 · accent 6.44 |
| Surface-2 | `#f7f2e4` | `--paper-s2` | — | ghost 5.91 |
| fg | `#2e2318` | `--paper-fg` | **11.69** | HP ink (Kimi `--hp-ink`) |
| fg-muted | `#5a4632` | `--paper-muted` | **6.79** | |
| fg-ghost | `#6b5a47` | `--paper-ghost` | **5.04** | v1 `#5b6670` fails on the warmer paper (≈ 4.4) |
| accent | `#115e59` | `--paper-accent` | **5.78** | Focus ring ≥ 3 ✔. Aqua `#2dd4bf` on paper is ≈ 1.5 and **never used** |
| kill | `#b42318` | `--paper-kill` | **5.01** | |
| exception | `#7a4f00` | `--paper-exception` | **5.43** | v1 `#8a5a00` = 4.52, too tight |
| rule | `rgb(46 35 24 / .14)` | `--paper-rule` | decorative | |
| Edge vignette only | `#e6d3a8`, `#c9ac72` | `--paper-edge` | never under text | A text-free edge feather only |
| **pencil** (v3) | `#4a4036` | `--paper-pencil` | **7.71** | Journal graphite vignettes, the pencil nib dot, entry Meta if tinted |
| **red** (v3) | `#9b1c14` | `--paper-red` | **6.23** | The journal's **one** pencil underline (the rdr2 emphasis slot). Never a verdict, never beside `--paper-kill` |
| **leather edge** (v3) | `#b5653a` | `--w-leather` | 3.28 (decorative) | The 6 px spread edge and strap; never text |

**1.3.2a rdr2 paper objects (v3; objects on the rd canvas, not planes)**

| Object | Ground | Text allowed (CALC) | Not allowed |
|---|---|---|---|
| **The WANTED handbill** (SPEC SM-15) | `#e4d5b3` | graphite `#2f2a24` 9.79 · fg `#2e2318` 10.56 · pencil `#4a4036` 6.96 · muted `#5a4632` 6.14 · red `#9b1c14` 5.63 · accent `#115e59` 5.22 (focus ring ≥ 3) | ghost text (4.55, too tight) and any verdict (kill 4.53): **none on the handbill** |
| **The trail map** (SPEC SM-15) | `#dec29b` (contours `#c8b28d`, water `#9e9985`: decorative fills) | graphite 8.32 · pencil 5.92 only; v3 puts **no text on the map** (its caption sits on rd canvas) | fg-ghost 3.87, kill 3.85, accent 4.44: fail |

**1.3.3 World decorative inks (non-text strokes and fills; ≥ 3:1 where they carry meaning, all CALC)**

| Token | Hex | World | Role | pirates cv | idiots cv | hp cv | deep |
|---|---|---|---|---|---|---|---|
| `--w-brass` | `#a8834a` | pirates | Course lines, instrument housing, waypoint ticks, the brass X-stamp | 5.30 | 5.30 | 5.58 | 5.75 |
| `--w-moon` | `#a9bcc0` | pirates | Tick rings, soundings rules, the LD-PC completion flash | 9.38 | 9.39 | 9.88 | 10.18 |
| `--w-storm` | `#5f6e75` | pirates | Inactive ticks, contour hairlines. **Never text** | 3.50 | 3.50 | 3.69 | 3.80 |
| `--w-chalk` | `#f2efe6` | idiots | Chalk strokes, circles, gate diagrams. Never fills or paragraphs | 16.10 | 16.11 | 16.96 | 17.47 |
| `--w-bp-line` | `#cfe8f7` | idiots | Blueprint strokes, dimension ticks, leaders (11.24 on the panel). **Never links or body text** | 14.58 | 14.59 | 15.36 | 15.82 |
| `--w-graphite` | `#8b949e` | idiots | Sketch-phase and ghost diagram strokes | 6.02 | 6.02 | 6.34 | 6.53 |
| `--w-grid` | `#22303c` | idiots | Graph grid, **used at 4–6% opacity only** (decorative) | 1.37 | 1.37 | 1.45 | 1.49 |
| `--w-ink-contour` | `#c9ac72` | hp | The ink Line on dark, dividers, LD-HP stroke | 8.49 | 8.49 | 8.94 | 9.21 |
| `--w-patronus` | `#b9d9f2` | hp | Principles ribbons | 12.58 | 12.59 | 13.25 | 13.65 |
| `--w-lumos` | `#eaf6ff` | hp | Light-point sprite cores (**sprites only**, never DOM paint) | — | — | 17.76 | 18.29 |
| `--w-flame-core` / `--w-flame-halo` | `#ffe9c4` / `#f4b740`→0 | hp | Candle sprite gradient stops (**sprites only**, never DOM paint). The halo stop reuses the amber value **inside the sprite PNG only**, never as a DOM colour, never beside an EXCEPTION verdict. v3: also the floating-candle sprites (IC-HP-03) and the ember → candle arrivals | — | — | — | — |
| **`--pir-compass-red`** (v3) | `#a8453a` | pirates | **Jack's compass red arrow only** (IC-PC-02). Darker than ember (2.00 apart), so it never reads as "killed"; never beside ember | **3.15** | — | — | 3.42 (house deep) · 3.37 (pirates deep). **Fails on pirates raised (2.83): never placed there** |

**v3 rdr2 decorative inks** (CALC on rd canvas / rd deep / house canvas; non-text)

| Token | Hex | Role | rd cv | rd deep | house cv |
|---|---|---|---|---|---|
| `--w-bone` | `#e3d6bd` | Tintype hairline; plate border; handbill edge on dark | 13.41 | 14.04 | 13.40 |
| `--w-pencil` | `#a39686` | **The Line in graphite**; trail dashes; hachures; running-shoe prints; satchel strip | 6.66 | 6.98 | 6.66 |
| `--w-sage` | `#8f9c78` | Grass contours (the trail map's dark-ground inset frame, if any) | 6.60 | 6.91 | 6.59 |
| `--w-dusk` | `#e0a458` | The low sun and ember sprite cores. **Sprites and media only** (in the DOM it would read as amber = EXCEPTION) | 8.83 | 9.24 | 8.82 |
| `--w-deadeye` | `#d64236` | The Dead Eye grade stop and media vignette **only**. Never text, never the X (the X is ember), never beside ember (1.53) | 4.30 | 4.51 | 4.30 |
| `--w-leather` | `#b5653a` | The journal's spread edge and strap (decorative) | 4.48 | 4.69 | 4.48 |

**Golden-hour and fire media grades** (prompt and grading targets only, never DOM tokens; STUDY §3.3): sun gold `#e8b45a`, haze peach `#d9a07a`, shadow blue `#3b4a5a`, dry grass `#9a8a52`, oxblood `#5a1712`.

**1.3.4 Tone planes × worlds → semantic variables** (`SectionFrame`; `[data-world][data-tone]`)

| Var | canvas | raised | deep | paper |
|---|---|---|---|---|
| `--bg` | world canvas | world raised | world deep | `--paper` |
| `--surface-1` / `--surface-2` | world raised / world overlay | world overlay / slate (house) or overlay (worlds) | world canvas / world raised | `--paper-s1` / `--paper-s2` |
| `--fg` / `--fg-muted` / `--fg-ghost` | ink / stone / muted | ink / stone / muted | ink / stone / muted | `--paper-fg` / `--paper-muted` / `--paper-ghost` |
| `--rule` | ink / .10 | ink / .10 | ink / .10 | `--paper-rule` |
| `--accent` · `--kill` · `--exception` | aqua · ember · amber | same | same | `--paper-accent` · `--paper-kill` · `--paper-exception` |

- Expose through `@theme inline`, so utilities read `bg-bg`, `text-fg`, `bg-surface-1`.
- The validator **computes this whole table from `globals.css`** and fails text < 4.5 and UI < 3 (SPEC §12.5).

### 1.4 World grounds, texture and warmth budgets (v2)
| World | Ground texture | Opacity cap | Warm family (where it lives) |
|---|---|---|---|
| pirates | Rhumb lattice (16-point, original SVG `<pattern>`, 0 JS), desktop only | ≤ 4% | Lantern (media) |
| idiots | Graph grid (24 px, CSS gradients), fading from `systems` to 0 by the last ledger row | ≤ 6% | Morning daylight (media) |
| hp | None (darkness is the texture) | — | Candle (media and sprites) |
| **rdr2** (v3) | None (the dark foreground is the texture, RD-P5); the trail-map inset (≤ 30% of Beyond, desktop) and hachures in cards are figures, not grounds | — | Golden hour (Beyond, media) · paper (the journal plane; the handbill) · fire (Voices, media and ≤ 12 sprites): one per section |
| house | Grain only if v1 keeps it | 2% | none |

**One warm family per viewport.** On the paper plane there are no candle, fire or sun sprites. The handbill (paper) never shares a viewport with the golden-hour plate.

---

## 2. Type

### 2.1 Families (house families unchanged; v3 adds scoped world display faces, §2.1.1)
| Family | Load | Weights | Role | Substitutes |
|---|---|---|---|---|
| **Geist** | `next/font`, `--font-geist-sans`; `ss01`, `cv01` | 400; 500 for `heading` only | display, chapter, heading, lead, body, small | Inter, Söhne, Neue Haas; `ui-sans-serif` |
| **Geist Mono** | `--font-geist-mono` | 400 | `meta` only: the one label system | JetBrains Mono, IBM Plex Mono; `ui-monospace` |
| **Newsreader** | `--font-newsreader` | 400 (500 optional on `title`); italic 400 | `title` only | Source Serif 4, Literata; Georgia |

**v3 (A-8): the v2 novelty-font ban is lifted for three slots only.** Film-/game-evoking display faces may set **act titles, loaders and easter eggs**. Everything else (the name, body, lead, Meta, labels, verdicts, metrics, figure labels, tips, quotes, chrome and all research data) stays Geist / Geist Mono / Newsreader. Hand-made quality on content still comes from SVG path irregularity (`chalkRough`, the R-1 graphite filter) and **motion** (ink or pencil drawing itself), never from a typeface.

**2.1.1 World display faces (lettering)** — SPEC §9.7 is the authority; this is the look contract.

| World | Face | Licence | Ship mode | Used for | Treatment |
|---|---|---|---|---|---|
| pirates | Pirata One | OFL 1.1 | A (self-host woff2 subset) | Journey cartouche "THE CROSSING"; pirates 404 variant | `--w-brass` fill on pirates canvas (5.30); caps; tracking +.02em; ≥ `title` size |
| idiots | Kalam | OFL 1.1 | A | Card I→II "The Workshop"; LD-3I route card; 3 Idiots 404 variant | `--w-chalk` fill (16.1 on idiots deep); sentence case; the `chalkRough` filter on its static layer only |
| rdr2 | Chinese Rocks (Typodermic free licence) | Fixed graphics only; no embedding | **B (outline-only SVG, TTF never committed)** | Card II→III "THE FRONTIER"; LD-RD route card | `--w-bone` fill (14.04 on rd deep); caps as the face is; never the words "Red Dead Redemption" |
| rdr2 (egg) | Rye | OFL 1.1 | A | "DEAD EYE" toast header (optional); "WANTED" only if FT-1 | ink or `--paper-fg` fill |
| hp | IM Fell English / English SC | OFL 1.1 | A | Card III→IV "The Light"; LD-HP route card; the Marauder's Map room labels and 404 | `--w-ink-contour` (8.94 on hp canvas) or `--paper-fg` on the Map's parchment |

- **Budget:** ≤ 1 display face per viewport, counted as one of the ≤ 3 styles; never smaller than `title`; AA on its fill (text ≥ 4.5 or, at `title` size and above, the large-text 3:1 minimum; every row above clears 4.5); total woff2 ≤ 24 KB; each outline SVG ≤ 3 KB.
- **Loading:** `next/font/local`, `preload: false`, `display: "optional"` (a miss renders Newsreader; no layout shift, fixture L). The owning component imports its face; no global `@font-face` for display faces.
- **Accessibility:** outlined lettering sits inside the real heading as `<span class="sr-only">text</span><svg aria-hidden="true">…</svg>`; self-hosted faces render real text.
- **Never (mode C):** the RDR2 "Redemption" face, Hapna, mod font packs, *Lipstick*, the HP logo lettering, the POTC wordmark, or any font extracted from film or game files; any title of a work set in a lookalike face.

### 2.2 The 8 steps (unchanged from v1)
| Step | Face / weight | Size | Line-height | Tracking | Case | Role |
|---|---|---|---|---|---|---|
| `display` | Geist 400 | `clamp(4.5rem, 11vw, 10.5rem)` | .9 | −.03em | Sentence | The `<h1>` "Aryan / Sharma" **only**. Static SSR, never cropped, never animated, never crossed by light |
| `chapter` | Geist 400 | `clamp(2.75rem, 6vw, 6rem)` | .95 | −.025em | Sentence | One `h2` per major section |
| `title` | Newsreader 400 | `clamp(2.2rem, 4.4vw, 4.75rem)` | 1.02 | −.015em | Sentence | Chapter project names, writing rows, principles, lead quote, invitation, **act titles, film titles, the Play label** |
| `heading` | Geist 500 | `1.75rem` | 1.15 | −.015em | Sentence | `h3`; the opening-card act rows |
| `lead` | Geist 400 | `1.25rem` | 1.45 | −.01em | Sentence | Throughline, section intros, **card epigraphs** |
| `body` | Geist 400 | `1.0625rem` | 1.6 | −.005em | Sentence | All prose; the films "borrowed" lines |
| `small` | Geist 400 | `.9375rem` | 1.5 | 0 | Sentence | Captions, limitations, legal line, card `summary` |
| `meta` | Geist Mono 400 | `.8125rem` | 1.4 | +.04em | UPPER | The one label system: act labels, film credits, FIG labels, reel marks, Skip intro, credits roles. **13 px is the floor** |

Computed at QA widths (CALC): display 158 / 113 / 72 / 72 · chapter 86 / 61 / 44 / 44 · title 63 / 45 / 35 / 35 px at 1440 / 1024 / 390 / 320.

**v3 named treatment (not a new step): `epigraph`** = Newsreader italic 400 at the `lead` size (1.25rem, lh 1.45, tracking −.01em, sentence case, ≤ 46ch). It is used **only** for film/game lines in the `epigraph` rendition (SPEC §9.6): the intro oath and card lower-bar epigraphs. It counts as one type style and uses the viewport's one italic.

### 2.3 Type rules (v1, plus the film-world treatments)
- **At most 3 type styles per viewport** (family × step × case). Chrome speaks `meta`. Examples:
  - the hero = `display` + `lead` + `meta`
  - the intro = `meta` + `epigraph` (the oath) + `title` (Play)
  - act cards = `meta` + the act-title lettering (or `title`) + `lead`/`epigraph`
  - the films chapter at rest = `meta` + `title` + `body`
- **Weight** 400; 500 for `heading` only; no 600 or 700.
- **Italic:** Newsreader italic in at most one place per viewport (testimonials, the contact invitation). Principles attributions are roman.
- **Case and tracking:** uppercase and positive tracking only in `meta`.
- **Wrapping:** `text-wrap: balance` on display, chapter, title and lead; `pretty` on body. No manual `<br>`. The name is two spans with a real space.
- **Figures:** `.tnum` in Meta, the ledger, the odometer, the demo readout, **FIG dimensions and waypoint soundings**. Sharpe, PSR and PF are always static text.
- **Masked reveals** keep `y: 115%` and a .15em descender pad.
- **Caveats** sit in the same block as their claim, never below `small`, never dimmer than `--fg-muted`.

**Film-world type treatments (v2):**

| Element | Treatment |
|---|---|
| Work titles (films chapter `h3`, credits) | Newsreader `title` roman, sentence case as the title is written ("Pirates of the Caribbean", "3 Idiots", "Red Dead Redemption 2", "Harry Potter"). No quotation marks, no italics, no ™, **never in a display or lookalike face** |
| Work credits in Meta | `AFTER <TITLE IN CAPS>` using the Meta uppercase transform; `•` separators; ≤ 4 fields (the four-work prologue line is exactly 4) |
| Act titles (v3) | The world's **lettering** (§2.1.1) in the card's lower bar, inside the real `h2`; Newsreader `title` is the fallback. The opening card rows use Geist `heading`; the header uses Meta `ACT III • THE FRONTIER` |
| Reel marks | Meta `III / IV` (derived) |
| **Film/game lines** (v3) | Only through `FilmQuote` (SPEC §9.6). `caption` = a Meta block (uppercase, ≤ 4 fields, attribution as the last field, e.g. `NOW • BRING ME THAT HORIZON.`); `epigraph` = the §2.2 treatment; `line` = the host's style. Never in a display face; never as a caption to a metric |
| **TIP** (v3) | Meta `TIP` + the tip in `lead` (cards) or `small` (route loaders). House type always |
| **Journal entries** (v3) | Meta `ENTRY I`…`V`, the title in Newsreader `title`, the angle in Geist `body`, a static `DRAFT` chip. No handwriting face (FT-1) |
| **The handbill** (v3) | `WANTED` in Newsreader caps at `title` with a 3 px double rule above and below (Rye only if FT-1); the name in Newsreader; facts in Geist `small`; labels in Meta |
| FIG labels (3 Idiots) | Meta `FIG. n • <REAL NAME> • <TRUE VALUE>`, HTML positioned over the SVG, never SVG `<text>` |
| Waypoint soundings (Pirates) | Meta digits `01`–`04`, `.tnum`, HTML |
| Nib-written title (v3: pencil in rdr2; ink under option B) | Real Newsreader text revealed by a mask behind a moving graphite (or ink) nib point; the text is in the DOM from first paint |
| Chalk emphasis (3 Idiots) | An SVG stroke around real HTML text; the text itself is never restyled |
| Play control | `[ ▶ Play ]`: Newsreader `title` "Play"; lucide `Play` icon at 1em; the bracket is the Lens |
| Credits roll | The role in Meta (left), the name in `body` (right), centred rows |

---

## 3. Space, density, layout

**3.1 Spacing ladder:** `--spacing: .25rem`; permitted steps **1 2 3 4 6 8 12 16 24** (4–96 px). Four tiers, each ≥ 2× the previous: **pair** 8–12 · **group** 16–24 · **block** 48–64 · **section** `--section-pad`.

**3.2 Density:** spacious `clamp(5.5rem,10vw,8.75rem)` · default `clamp(4.5rem,8vw,7.5rem)` · tight `clamp(4rem,7vw,6.25rem)` (140/115/101 px at 1440; 88/72/64 px at 390).

**3.3 Grid:**

| | 1440×900 | 1024×768 | 390×844 | 320 |
|---|---|---|---|---|
| Container | max 1440 | fluid | fluid | fluid |
| Gutter `clamp(1.25rem, .54rem + 3.85vw, 4rem)` | 64 | 48 | 23.7 | 21 |
| Content width | 1312 | 928 | 343 | 278 |
| Columns / gap | 12 / 24 | 12 / 20.8 | 4 / 16 | 4 / 16 |
| **Hero (v2)** | `100svh`; the **full-bleed 16:9 sea plate** (`cover`, `object-position` = focal). The name at plate x 9–46% (cols 1–6). Its right edge (≈ 43% of the plate at 1440, PROMPTS §3.3 CALC) overlaps the crest's **calm tail** (x 36–52%). The bracket rests on `media.focalBox` (x 46–94%), ≥ 16 px from the h1 rect | same, name ≈ 44% | content height: name → lead → Meta → CTA → MV-02 (4:5), no overlap | same |
| **Intro (v2)** | Fixed full viewport. The text block sits in the name zone (x 9–46%, y 28–64%) so Play lands where the name lands. Skip is top-right in the header row height | same | Play block in the lower third; Skip top-right | same |
| **Act card (v2)** | Letterbox 2.39:1: frame 602.5 px tall with 148.7 px bars at 1440×900 (CALC). The upper bar holds Meta; the lower bar holds the title plus ≤ 1 lead line | frame 428 px, bars 170 px | letterbox off; static stack | same |

- **Breakpoints:** 12 columns ≥ 1024; 8 columns from 640 to 1023; 4 columns below 640.
- **Measures:** body 60–68ch; lead ≤ 46ch; chapter and title ≤ 20ch.
- **z-scale (v2):** 0 content · 10 sticky stage · 40 header · 60 menu, palette and backdrop · **80 intro overlay** · 90 skip link.

---

## 4. Radii, surfaces, rules

**4.1 Radii (5):** `none` 0 (rules, ledger rows, full-bleed media, **letterbox frames**) · `focus` 3px · `control` 12px · `frame` 20px (MediaFrame, cover clip, **blueprint panels**, films frames before they open) · `pill` 9999px (the CTA, Copy email, the Work pill; ≤ 2 pills per viewport; **the Play control is not a pill**: it is the bracket).

**4.2 Surface ladder** (per world, §1.3.4): ground → `surface-1` → `surface-2`.
- **Surfaces are for interactive objects only:** BacktestDemo, the gauntlet figure, palette and menu. There are **no cards** (the act "cards" are full-bleed letterboxed sections, not boxed cards).
- **Blueprint panels** (`--bp-panel`) are figure grounds, not surfaces. They hold no controls, no body text and no verdicts, and cover ≤ 40% of a section's area.
- **Elevation** = one tone step + `inset 0 0 0 1px var(--rule)`. `--shadow-overlay` is for palette and menu only.

**4.3 Rules budget (v1):**
- **Allowed:** table rows (the matrix, the mobile ledger, **the credits roll**), chapter breaks, the 1 px surface inset.
- **Never:** around cards, tags, pills or images; as a section top rule; gradient hairlines; left accent rails.
- Controls whose boundary carries state get a 1 px `--fg-ghost` outline ≥ 3:1.

---

## 5. The two shapes and the Line

### 5.1 Bracket `[ ]` (`primitives/Lens`)
| Property | Spec |
|---|---|
| Construction | Inline SVG, two paths, `aria-hidden`, square caps, non-scaling stroke |
| Stroke | 2 px ≥ 1024, 1.5 px below. `--accent` in focus; `--fg-ghost` idle |
| Proportion | Arm `clamp(8px, .12 × h, 24px)`; inset 16 px desktop, 8 px mobile |
| States | **closed** · **opening** · **open** · **tracking** (ledger) · **resolve** (contact) · **drawn-in** (v2, intro arm: `pathLength` 0 → 1 on `easeDraw` 0.9 s) · **launch** (v2, intro Play: the halves travel to the viewport edges on `easeClip`/`dur.hero`) |
| Uses (only these; ≤ 1 per viewport in `<main>` or the overlay) | ① the **intro Play** (drawn-in → launch) ② the **hero aperture**, only when the intro did not play; the halves rest on `media.focalBox` ③ the Lens Index frame ④ the contact close on the AS monogram ⑤ the `[AS]` logo (chrome, not counted) |
| Motion | open, launch and resolve on `easeClip`/`dur.hero`; tracking on `springFollow`; drawn-in on `easeDraw` |
| Reduced motion / no JS | Final state. The intro never shows |

### 5.2 Dome seam (`primitives/Seam`)
- **Geometry:** v1 (Dennis VER): an ellipse at 150% / 750%, `translate(-50%,-86.666%)`, filled with the previous tone's `--bg`.
- **Size:** 10vh; 5vh at ≤ 540 px.
- **Motion:** R2, 10vh → 0 over the first 60vh of entry (`scaleY`, origin top).
- **Stroke:** none.
- **Also used for (v2):**
  - the **mobile intro exit** (the overlay leaves by a rising dome edge: 0.6 s on `easeClip`)
  - the menu drawer edge
- **Suppression (v2):** no dome where a derived act card sits between two sections (the card owns the place change) or where a section declares an IceCut stage.
- **Reduced motion:** a flat edge.

### 5.3 The Line (`lib/line.ts` `LINE_D`, v2)
- **Construction:** one SVG path (viewBox 1000 × 400), hand-fitted to MV-01's crest after approval. Our own geometry. **It never enters the h1 rect.**
- **Materials** by world slot (SPEC §4):
  - course: brass, dashed 6/6
  - blueprint: bp-line 1.5 px, dimension ticks every 100 units
  - **graphite (v3, rdr2):** `--w-pencil` 1.4 px with the R-1 paper-tooth filter on the static layer only (animate an unfiltered twin, then swap); hachure arcs `--w-pencil` 0.6 px at 55%
  - ink-light: ink-contour 1.2 px at 35% → 100% behind the light
- **Truth rule:** FIG. 0 prints the path's real `getTotalLength()` and its real control-point count, computed at build time. There are no invented dimensions.

---

## 6. Motion

### 6.1 Tokens (`lib/motion.ts`)
| Token | Value | Status | Use |
|---|---|---|---|
| `ease` | `[0.22, 1, 0.36, 1]` | REPO · VER | All enters, exits and state swaps |
| `easeClip` | `[0.16, 1, 0.3, 1]` | VER (Obys `d.css`) | Clip and inset openings: bracket, aperture, launch, cover, films frames, the dome exit |
| **`easeDraw`** (v2) | `[0.65, 0, 0.35, 1]` | KIMI (PROP) | **Stroke draw-on only** (`pathLength`): ink, chalk, blueprint, course lines, the bracket drawn-in. Never for position, opacity or UI state |
| `dur.micro` / `base` / `reveal` / `hero` | .18 / .34 / .62 / .85 | REPO | micro: hover colour · base: swaps and **all exits** (incl. Skip intro) · reveal: masked rise, filmstrip, the intro landing dissolve · hero: bracket, aperture, launch |
| `dur.preview` | .26 | BRIEF | Crossfades: preview, mono → colour, plate state swaps (MV-07 on the ignite), the intro plate fade-in |
| **`dur.draw`** (v2) | .7 / 1.2 / 1.5 (`short` / `med` / `long`) | PROP | Chalk circle / gate derivation / schematic draw-on. **All ≤ 1.5 s** (KIMI 3I "draw-ons ≤ 1.5 s") |
| **`dur.flash`** (v2) | .12 | KIMI PC-08 | A single commit flash (LD-PC tip, contact flare). Never repeats within 1 s |
| **`intro.*`** (v2) | `flightMaxS 6.0` · `landing .62` · `readyWaitMs 4000` · `loaderDelayMs 250` · `motesRestMs 5000` · `failsafeMs 3000` · `mobileFlightS 1.6` · `mobileTotalMaxS 2.4` | SPEC §5 | Prologue timing |
| **`loader.*`** (v2) | `showDelayMs 400` (media) / `250` (intro) · `idleStopMs 5000` · `needleReexciteMs 1800` · `gaugeIdleDegPerS 30` · `inkBreatheHz 0.5` | SPEC §8 | Loaders |
| `stagger.line` | .08 s, ≤ 4 lines | PROP | R1 multi-line headings |
| `viewportOnce` · `maskedLine` | `{once:true, amount:.25}` · `y 115% → 0` | REPO | R1 |
| `springFollow` | `{120, 22, .6}`: ζ 1.30, 0% overshoot, t63 187 ms | CALC | Preview follow, lens track, magnetic pull |
| `springNav` | `{380, 30}`: ζ 0.77, 2.2% overshoot, t63 94 ms | CALC | Nav dot, DRAFT chip, magnetic release |
| `springSoft` | `{120, 30, .4}`: ζ 2.17, t63 251 ms | CALC | Hero pointer shift, velocity-noise decay |
| **`springSnap`** (v2) | `{stiffness 420, damping 41}`: **ζ 1.00, 0% overshoot**, t63 105 ms, 2% settle 286 ms | CALC. **Kimi's `{420,28}` overshoots 5.2%** and is rejected as "no overshoot" | Anything a reader clicks: nav, CTAs, tabs, the Play and Skip state, links. **No overshoot on interactive elements, ever** |
| **`springSettle`** (v2) | `{260, 22, .9}`: **ζ 0.72, 3.8% overshoot**, t63 104 ms, settle 347 ms | CALC. **Kimi's `{260,17,.9}` overshoots 12.2%**, not "≈ 4%", so damping is raised | **The Settle (3I-06):** non-interactive entrances in **Act II only** (the board frame, schematic panels, gauge). Scale .96 → 1 or y 8 → 0 |
| **`springPlayful`** (v2) | `{180, 14, 1.1}`: ζ 0.50, 16.4% overshoot, settle 631 ms | CALC (Kimi `{180,11,1.1}` = 26% overshoot, settle 656 ms: too loose) | Decorative motifs only: gear teeth nudge on gauge complete, waypoint tick pop. Never text, never controls |
| **`springNeedle`** (v2) | `{55, 8}`: ζ 0.54, 13.3% overshoot, settle 781 ms | CALC (KIMI PC-01) | The instrument needle's underdamped **hunt and settle** (Journey, LD-PC, films finale). Decorative, aria-hidden. "Spin the long way": target = bearing + 360·k |
| `scrollBudget` (v3) | `{stickyMaxVh 30, longCardMaxVh 60, maxLongCards 2, pageStickyMaxVh 150, mobileStickyMaxVh 0, maxSignature 6, maxScenes 2, maxWorlds 4, maxWorldChanges 4}` | SPEC v2 | Read by the validator |
| **`aalIzzWell`** (v3) | `springSettle` fired twice, 180 ms apart: y 8 → 0, then 4 → 0 ("two soft pats") | PROP (IC-3I-03) | Act II **non-interactive** entrances only; never on controls, never on an error state |
| **`candle.*`** (v3) | `bobPx 4` · `bobHz .15–.25` · sizes 3 · `restMs 5000` | PROP (IC-HP-03) | Intro candle sprites; Card III→IV arrivals |
| **`develop.*`** (v3) | mask threshold = remap(p, a, b) (R-2) · `borderS .5` · `breatheHz .4` (indeterminate 10–22%) | STUDY R-2 | Card II→III, LD-RD, tintype photos (static p = 1) |
| **`ember.*`** (v3) | rise on `ease`, arrival when p ≥ .2 + .5·i/N; ≤ 40 sprites; campfire frames 3 at ≤ 2 Hz | STUDY R-6 | Card III→IV; LD-RD complete |
| **`deadEye.*`** (v3) | `rate .25` · `markMs 90` · `staggerMs 160` · `holdMs 400` · `returnMs 300` · `maxS 3` | STUDY R-3 | The Dead Eye egg only |
| **`egg.*`** (v3) | `autoMaxS 4` · `typedBufferMs 1500` · `snitchDartS ≤ 4` · `patronusS ≤ 3` · `mapUnfoldS ≤ 1` | ICONS §8 | Easter eggs |

**Rules:**
- **No other eases.** `easeDraw` is for strokes only. No imported reference curves.
- **Springs are time-based**, never per-frame lerps.
- **No spring longer than ~800 ms to 2% settle** (the needle is the one exception, at 781 ms).
- **Entrances never delay reading:** text is in its final layout from first paint.

### 6.2 The three registers (v1, with film additions)
| Register | Driver | Allowed forms (v2 additions in bold) | Never |
|---|---|---|---|
| **R1 enter-once** | Viewport entry, once | Masked line rise; opacity fade on non-text blocks; the odometer on neutral counts; **stroke draw-ons (`easeDraw`)**; **the Settle on Act II non-interactive entrances**; **films finales (state-driven, once)**; **the nib-wipe (Writing h2)**; **the ribbon convergence (principles)**; **the HP-03′ quote mask (v3: read into firelight)**; **v3: journal vignettes (once per entry), running-shoe prints, the satchel strip, the medallion sweep, the Snitch dart (egg, once)** | Animating body prose; blur, decrypt, tilt, x-slides; replays |
| **R2 scroll-positioned frames** | Section scroll progress, one `useScroll` owner | Hero exit, **IceCut (Card I→II)**, cover clip, dome Seam, scene frames, **Journey sequence index**, **long-card beats**, **loader progress in interstitials**, **ignite kindling**; **v3: tintype development (Card II→III), the graphite trail, ember rise, the trail-map fog lift (CSS `view()` timeline, 0 JS)** | Springs on scroll values; velocity on text; `video.currentTime` scrubbing; pins over budget |
| **R3 pointer and interaction** | Pointer, hover, focus, click, keys; scroll *velocity* on media only | Preview follow, lens track, magnetic CTA, tabs, gauntlet Run, demo morph, VelocityNoise, **the needle (state changes)**, **intro candles leaning to Play (hover and focus)**, **waypoint wink**; **v3: the compass lid (hover and focus), the journal vignette on hover or focus, egg triggers (palette, typed words), the Dead Eye run** | Cursor glow, tilt, spotlight, card lift, proximity lattices; **light over text** |
| **Time (media and world canvas only)** | Clock | Video loops (MV-03, **MV-11L**, MV-09), **IN-02 flight**, intro candles (≤ 5 s, then rest), **egg canvases (the Patronus ≤ 3 s)**, loader indeterminate states (≤ 5 s when in parallel with content) | Always-on loops in the DOM |

### 6.3 What drives what (v2 additions; v1 rows for the name, hero wrapper, pointer shift, VelocityNoise, Lens Index, cover, dome, writing preview, magnetic, nav dot, odometer, gauntlet, demo and scene are unchanged)
| Element | Register · driver | Spec | Reduced motion |
|---|---|---|---|
| Intro arm | Pre-paint class | Instant ground, text and controls; the bracket drawn in `easeDraw` .9 s; the plate fades in `dur.preview` after decode | Never shown |
| Intro candles (v3; were motes) | Time + R3 | ≤ 40 sprites drift at ≤ 0.08 vw/s; parallax ≤ 8 px; gather to 72 px on Play hover/focus over `dur.reveal`; rest at 5 s | — |
| Intro Play → flight | Event, then time | Launch (`easeClip`/`dur.hero`); the video plays on its clock; the trail follows the baked path (sprites decay τ = 600 ms) | — |
| Intro landing | Time | A left → right mask dissolve over `dur.reveal`; the h1 is static beneath | — |
| Intro skip | Event | Opacity out on `dur.base` | — |
| Hero wake velocity | R3 · \|v\| | The wake layer brightness ≤ +15%, decaying on `springSoft`; media only | Off |
| Journey sequence | R2 · content progress | Frame = round(p × 71); frames pass through the 4 stills at the step beats | Carousel |
| Journey needle | R3 · active step / waypoint focus | `springNeedle` to the leg heading; spin the long way | At bearing |
| Opening card course | R2 · passage | Course `pathLength` = p; the needle settles at p = 1 | Drawn |
| Card I→II | R2 · p (≤ 60vh) | IceCut mask + ±.4·p²·H parallax; aqua line .1 < p < .9; FIG. 0 `pathLength` = remap(p, .2, .75); gauge x = p·L; the epigraph R1 at p ≥ .75; the chalk circle at p ≥ .95 | Static card |
| **Card II→III tintype** (v3) | R2 · passage p (0 travel) | 0–.3 the warm point sinks to a low-sun sprite and the graphite trail draws (`pathLength` = remap(p,0,.3)); .3–.8 the develop mask threshold = remap(p,.3,.8) into MV-10; .8–1 the bone border draws | Developed plate |
| **Card III→IV** (v3; was Card II→III) | R2 · p (≤ 60vh) | The ground crossfade rd deep → hp deep 0–.2; ember i rises and arrives when p ≥ .2 + .5·i/N (each on `dur.preview`), then becomes a candle; graphite opacity 1 − kindled fraction; MV-07 swap at p > .8 on `dur.preview` | MV-07 still |
| Generic reel | R2 · passage | The loader motif progress = p; `cardStill` crossfade at p = .5 on `dur.preview` | Static card |
| Films finales | R1 state, once, ≥ 50% in view | Compass arrow (`springNeedle`) / blueprint draw (`dur.draw.med`) + a chalk circle (`dur.draw.short`) / **graphite trail to a kindling fire (`dur.draw.med`)** / ink-light (1.4 s) | Final state |
| Chalk circle (TA-07, 3I-09) | R1 | `easeDraw`, `dur.draw.short`, `chalkRough` filter (static, never boiled) | Pre-drawn |
| Schematic draw-on | R1 (amount .35) | `easeDraw`, `dur.draw.long`, < 60 nodes; leaders after, with an 80 ms stagger | Drawn |
| Principles ribbons | R1 | 3–4 strokes converge to the underline, `easeDraw` 0.9 s; no replay | Static underline |
| Writing nib-wipe (v3: pencil) | R1 | A mask follows the graphite nib point along a baseline path, 1.4 s | Text present |
| **Journal vignette** (v3) | R3 hover/focus, once per entry | Unfiltered twin draws on `easeDraw` `dur.draw.med`, then swaps to the R-1 filtered layer | Drawn |
| **Trail-map fog** (v3) | R2 · CSS `animation-timeline: view()` | Per-waypoint radial mask opacity 1 → 0 as the Athletics rows pass | Revealed |
| **Dead Eye** (v3, egg) | Event, then time (≤ 3 s) | `deadEye.*`: rate .25 → marks (90 ms, 160 ms stagger) → hold 400 ms → strike all → return 300 ms | Static X + ground until Esc |
| **Candle sprites** (v3) | Time + R3 | Bob ±4 px at .15–.25 Hz; lean to Play on hover/focus; rest at 5 s | — |
| Voices HP-03′ (v3: read into firelight) | R1 | The mask edge moves from `--fg-muted` to `--fg`, 1.2 s, `ease` | Ink |
| Contact flare | Event (copy resolved) | The masked media layer brightness +20% for `dur.flash`, once | None |
| Loaders | Real progress / scroll p / time | §6.1 `loader.*`; indeterminate stops at 5 s in parallel contexts | `complete`/static |

### 6.4 Budgets (v2)
| Budget | Value |
|---|---|
| `signature` sections | ≤ **6** (intro, hero, journey, gauntlet, ledger, **beyond**) |
| Long cards | ≤ 2, each ≤ 60vh, ≥ 1024 fine pointer only |
| Scenes + long cards | ≤ 2 |
| Per-section sticky | ≤ 30vh (the Journey uses a sticky column: 0 extra) |
| Page sticky | ≤ **150vh** desktop, **0** below 640 |
| Always-on DOM loops | **0** |
| Decoding videos | ≤ 1 (DecoderLock; IN-02 / MV-03 / **MV-11L** / MV-09) |
| Live canvases | ≤ 1 (intro / sequence / ignite / **Patronus egg** singleton) |
| Sprites | intro ≤ 64 (≤ 40 candles + ≤ 24 trail on mobile, or ≤ 48 on desktop with ≤ 16 motes left by launch); ignite ≤ 40 (embers → candles); loaders ≤ 40 (LD-RD fire ≤ 12); **Patronus egg ≤ 400 particles (desktop, singleton)**; mobile ≤ 24 (intro only); DPR ≤ 2 |
| Rendering | Everything pauses offscreen and on a hidden tab; no rAF without a visible, active consumer |

### 6.5 Reduced motion, Pause, `?skip`, no JS, Save-Data (v1 plus the intro)
- **SSR ships every readable text element in its final state.** Pre-reveal hiding happens only under `html.motion-ok`, set by the inline head script before paint.
- **The head script also decides `html.intro-armed`** (SPEC §5.1 conditions) and `html.js` (for JS-only controls). It starts the 3 s intro failsafe.
- **Reduced motion:** R1, R2 and R3 springs are off. Loops, video and canvas are off (**no video request**). The intro never arms. Loaders are static. Functional state still changes.
- **Pause / Resume (the waveform, `aria-pressed`, sessionStorage in try/catch)** behaves as reduced motion for decorative motion, and also prevents the intro from arming in the session.
- **`?skip`:** every flourish runs instantly, and the intro never arms. **`?intro=1`** forces the intro for QA (not under RM).
- **Save-Data / 2G / 3G:** stills only; the intro never arms; no sequence frames.

---

## 7. Media (MediaFrame + `lib/media.ts`)
| Rule | Spec |
|---|---|
| Poster first | `priority` only for MV-01 (and MV-02 on mobile). Everything else is lazy. Swap to video on `playing`; a rejection or error keeps the poster |
| One decoder | DecoderLock page-wide. Pause offscreen and on a hidden tab. Never download a CSS-hidden variant |
| Video | `muted playsInline`, no audio track (generated with sound off, then `-an`, verified with ffprobe). A failed loop falls back to the still |
| Weight | Hero poster 200–350 KB · loops 2–4 MB · IN-02 ≤ 4 MB · JV sequence ≤ 3 MB (desktop) · mobile art smaller |
| Strength | **Imagery, never wallpaper.** Opacity 1; the one treatment is a static text-side feather ≤ 35% of width (v1). If text needs a scrim, move the text |
| Count (v2) | The v1 "2–4 framed placements" rule is superseded by SPEC's asset list (A-2, A-3). **No asset is reused**, with three declared exceptions: ① MV-01 is both the hero plate and IN-02's end frame (registration); ② act plates act as `cardStill` fallbacks for generic reels; **③ (v3) MV-10 is both Beyond's plate and the image Card II→III develops into** (the tintype develops into the world you enter) |
| Mono variants | `-mono.webp` produced in code (sharp: grayscale, contrast .85), for lens figures and the writing preview |
| Status gating | `planned → received → accepted → integrated`; `resolveMedia()` walks `fallback`. No 404s, no empty rectangles, no dev text |
| Provenance | `source: higgsfield · authentic · code · legacy`, with model, credits and date |
| **Acceptance flags (v3)** | Every `higgsfield` asset: `accept: { people:false, likeness:false, text:false, ripped:false, icon?: "castle"|"pearl"|"frontier"|…, checkL2:"claude:<date>+aryan:<date>" }`. The validator rejects missing flags |
| **Check L2** (v3; replaces check L) | ① **Ours?** a text-only prompt, or drawn/coded by us; never traced; no still, screenshot or fan art passed as a reference · ② **No faces?** no person, face, hands or character silhouette (H1) · ③ **No marks?** no legible logo, wordmark, crest, studio mark, HUD/UI replica, no legible text · ④ **Subject, not the shot?** the icon in *our* composition, camera and time of day, never a frame-for-frame remake of a famous shot or a game screenshot · ⑤ **Crafted?** passes the admissions-reader test (§8.1). Claude **and** Aryan sign, with dates |
| Authentic rule | Anything that depicts Aryan, his life or his experiences must be `authentic` |
| Generated rule (v3) | Atmosphere **and the worlds' iconic subjects** (the castle, candles, broom, the Pearl, the harbour, the colonnades, the scooter at the lake, the frontier, a riderless horse, the camp and fire), as our own compositions under check L2. Text-free, people-free, rider-free. Decorative (`alt=""`, `aria-hidden`). Never evidence, charts or numbers. **Never a film still or game screenshot, never an instrument, map, journal page or poster (code builds those), never a remake of a specific frame** |
| **Storage hardening** (v3, recommended) | The most iconic plates (the castle, the Pearl, the enchanted hall, the frontier) may be served from a media bucket (Vercel Blob or R2) referenced by URL in `lib/media.ts`, so a takedown hits one object, not the public repo. Masters and rejected candidates never enter `public/` |
| **World canvas (v2)** | One registered canvas at a time. Pre-rendered sprites (`drawImage`), never per-frame `createRadialGradient`; `globalCompositeOperation: "lighter"` for warm points; DPR ≤ 2; IntersectionObserver + `visibilitychange` pause; skipped when `hardwareConcurrency < 4` (static fallback) |
| Labels | "SYNTHETIC • ILLUSTRATIVE" in the same `<figure>` as its chart. The credits roll discloses Higgsfield imagery and the AI assistance |

---

## 8. Labels and icons: ONE label system
**`Meta`** is Geist Mono 400 at 13 px, uppercase, +.04em, `.tnum`, in `--fg-muted`, with `•` separators in `--fg-ghost`. There are ≤ 4 fields per line and 1 Meta line per block, and a kicker appears only where it carries information.

| Use | Form |
|---|---|
| Identity line | `site.identity` (`·` → `•`) |
| Ledger fields | `No.` • verdict • status (the v1 lens BAR O-1 default) |
| Verdicts | `SURVIVED` · `KILLED` · `EXCEPTION` |
| Status / figure labels | `DRAFT` (static) · `SYNTHETIC • ILLUSTRATIVE` · `ILLUSTRATIVE MAP` (v3) (locked words) |
| **Header act label (v3)** | `ACT I • THE CROSSING` · `ACT II • THE WORKSHOP` · `INTERMISSION` · `ACT III • THE FRONTIER` · `ACT IV • THE LIGHT` · `CREDITS`; empty at the top |
| **Act card bars (v3)** | Upper: `ACT III • AFTER RED DEAD REDEMPTION 2` + `III / IV`. Lower: act title (lettering) + epigraph (`lead`/`epigraph`) **or** `TIP` + tip (`lead`) |
| **Work credits (v3)** | `AFTER <TITLE>`; the films chapter uses `ACT III • REFLECTION • 2018` |
| **Quote captions (v3)** | `NOW • BRING ME THAT HORIZON.` · `NOT ALL TREASURE IS SILVER AND GOLD, MATE. • JACK SPARROW, 2003` (≤ 4 fields; attribution last) |
| **FIG labels (v2)** | `FIG. 0 • THE LINE • L = <getTotalLength()> • <n> CONTROL POINTS`. Both values are computed from `LINE_D` at build time and never typed by hand |
| **Intro (v3)** | `ARYAN SHARMA • A RESEARCH JOURNAL IN FOUR ACTS` · `AFTER PIRATES OF THE CARIBBEAN • 3 IDIOTS • RED DEAD REDEMPTION 2 • HARRY POTTER` · `SKIP INTRO` |
| **Credits roles (v3)** | `WORLDS BORROWED FROM`, `LINES QUOTED`, `ORIGINAL GENERATED IMAGERY`, `BUILT WITH AI ASSISTANCE`, `TYPE`… (never "GRADED", because it reads as school grades) |
| **Journal and handbill (v3)** | `ENTRY I`…`ENTRY V` · `KNOWN FOR` · `LAST SEEN` · `REWARD` (DRAFT-gated) |
| **Egg labels (v3)** | `DEAD EYE` · `TIP` · `SEEKER — you` (credits row after the Snitch is caught) |
| Numbering | Derived, for `numbered: true` entries only (chapters, principles); printed once |

**Dropped systems (v1 list, plus v2):**
- `.eyebrow` kickers, ghost numerals, bordered Tag pills, `+` rows, `//` slashes, the four-corner HUD, `( 01 )` labels, LED dots, gradient hairlines, left rails, terminal chrome
- **v2:** "NOW SHOWING", reel-strip sprocket borders, film-slate/clapperboard graphics, ticket-stub motifs, marquee lights (generic cinema kitsch, not these worlds' iconography: still dropped in v3)
- **v3:** game HUD replicas (RDR2 cores, the minimap, the honor meter, the weapon wheel), a crosshair or revolver cursor

**Icons (v3):**
- **Functional chrome** stays `lucide-react` only: arrows, external, copy, close, menu, search, play. Stroke 1.5, 1em, ≤ 1 per control. The GitHub icon is the local SVG. **No emoji anywhere.**
- **World icons are allowed** (the iconic override, SPEC A-6) as **world media, TEXTURE and eggs**, placed only where SPEC §10.2 puts them. They are never chrome, with two text-only exceptions: the Pause tooltip ("Nox — pause motion") and the transient bolt favicon during the flight.
- Instruments, gears, the compass, the broom (SVG version), the castle silhouette (code-flight fallback), the medallion, the X, the quadcopter doodle, the satchel strip, the running-shoe prints, the Snitch, the Time-Turner, the Hallows glyph and the Marauder's Map are **our own drawings in code** (Law 2).

### 8.1 Icon style rules (v3; every world icon, drawn or generated)
1. **Instrument-grade craft.** Correct geometry (the compass is a true octagon with a 32-point ring; the gears mesh at a true 3:2; the Hallows is three exact primitives), a restrained palette from §1.3.3, real easing from §6.1. No clip-art, no stock icon packs, no sparkle trails, no custom cursors, no bevels, no drop shadows, no gradients on strokes.
2. **Stroke system.** One stroke weight per world at a given size: brass 1.5 px (pirates) · chalk 2 px with `chalkRough` (idiots) · bp-line 1.5 px (idiots figures) · graphite 1.4 px with the R-1 filter on the static layer (rdr2) · ink-contour 1.2 px (hp). Non-scaling strokes; square or round caps per world (pirates square, others round); ≤ 60 path nodes per icon (the castle fallback, the broom) and ≤ 40 for small marks.
3. **Colour.** Icons use their world's decorative inks only; never aqua (the one in-focus UI mark), never amber in the DOM, **ember only for killed** (the Dead Eye X). The compass red and the Dead Eye red never sit beside ember.
4. **Tiers (SPEC §10.1 #11).** ≤ 1 HERO icon per viewport, and it *is* the viewport's hero motif. TEXTURE icons are ≤ 40 px or ≤ 30% of the section area (the trail map), quiet, and draw once (R1). EGG icons are off the reading path and opt-in.
5. **Truth.** An icon must carry a site truth (a real bearing, a real caveat, a real KILLED row, the page's real structure, his real kit) or be TEXTURE at most. Nothing is metered about Aryan.
6. **One world's icons per viewport at rest.** A Pirates icon never sits in an RDR2 viewport (the credits' HP bookend and the user-invoked Dead Eye are the declared exceptions).
7. **Motion.** Icons animate once (draw-on, settle, sweep) or on state change; nothing loops in the DOM; RM shows the final state.
8. **Accessibility.** Decorative icons are `aria-hidden` and `focusable="false"`; any icon that is a control (the Snitch, the Time-Turner link) has a text accessible name and a ≥ 44 px target.
9. **The admissions-reader test.** "Would a teacher who has never seen the film find this charming and well made, or childish?" Anything that fails is declined even when it is allowed (ICONS §0.5).
10. **Hard limits apply to drawings too:** no figure, face or rider (H1); no logo, wordmark or crest replica (H2); nothing traced from a still, screenshot or prop photo (H2).

---

## 9. Component inventory (v1, plus the film layer)
| Primitive / module | Owns | Register |
|---|---|---|
| `Lens` | The bracket (§5.1) incl. drawn-in and launch | R1 event / R3 |
| `Seam` | The dome (§5.2) incl. the mobile intro exit | R2 / event |
| `MediaFrame` | Poster-first, DecoderLock, gating, feather, mono/colour, Save-Data | — |
| `MaskReveal`, `ScrollStage`, `VelocityNoise`, `Odometer`, `Meta` | v1 | — |
| **`IceCut`** (v2) | The ragged-diagonal wipe (Card I→II; the scene `seam` variant) | R2 |
| **`WorldProvider` / `useWorld()`** (v2) | `data-world`, slots, tokens | — |
| **`Line`** (v2) | `LINE_D` in a slot material | R1 / R2 |
| **`WorldLoader`** (v2) | LD-PC / LD-3I / **LD-RD** / LD-HP; sizes, modes, progress (SPEC §8) | R2 / time / state |
| **`Instrument`** (v2; v3 = **Jack's compass**) | The octagonal lidded compass with the red arrow and lid star chart (shared by LD-PC, the opening card, the Journey and the films finale) | R3 state |
| **`Gauge`** (v2) | The 12T/8T gear train + rack (shared by LD-3I and the films finale) | R2 / state |
| **`WorldCanvas`** (v2) | The singleton canvas host (intro candles and trail, sequence, ignite embers, the Patronus egg) | time / R2 |
| **`ChalkMark`** (v2) | Circle / underline strokes with the `chalkRough` filter | R1 |
| **`Schematic`** (v2) | The real-architecture draw-on figure plus HTML labels and leaders (v3: the jugaad register) | R1 |
| **`FilmQuote`** (v3) | Renders a `lib/quotes.ts` entry in the `caption` / `epigraph` / `line` rendition with inline or credits attribution; the only way a film/game line reaches the page | — |
| **`Lettering`** (v3) | An act title in its world face: outlined SVG (mode B) or self-hosted face (mode A) inside the real heading, sr-only text, Newsreader fallback | R1 |
| **`Tintype`** (v3) | R-2: the grayscale/sepia treatment and the procedural develop mask (`progress`) for card III, LD-RD and authentic photos | R2 / static |
| **`GraphiteStroke`** (v3) | R-1: the pencil stroke (unfiltered animating twin → filtered static layer); the rdr2 Line, hachures, vignettes, prints, the satchel strip | R1 / R2 |
| **`TrailMap`** (v3) | R-5: build-time contours, the dashed trail, the `view()`-timeline fog lift; `ILLUSTRATIVE MAP` caption outside it | R2 (CSS) |
| **`Handbill`** (v3) | R-4: the WANTED handbill of confirmed facts; DRAFT-gated reward | — |
| **`JournalSpread`** (v3) | The paper-plane dressing for `index` in rdr2: leather edge, gutter, the right-page vignette slot | R1 / R3 |
| **`Campfire`** (v3) | R-6: the code fire (≤ 12 sprites) for LD-RD, the films finale and the ignite's source | time |
| **`EggHost`** (v3) | The registry-driven egg layer: palette commands, the typed-word buffer, the "Turn off easter eggs" toggle, lazy loading, singleton checks | R3 / time |
| **Eggs** (v3, lazy) | `MaraudersMap` (also the 404 body) · `DeadEye` · `Snitch` · `Patronus` · `QuadcopterLift` · `BoltFavicon` | per SPEC §10.3 |

**Chrome:**
- `Header`: `[AS]`, **act label**, Work pill, waveform, Menu.
- `Menu` and `CommandPalette`: groups derived by act, with work credits in the headers; v3 adds the egg commands and aliases (Lumos/Nox, Accio, Obliviate, Parley, Dead Eye, Aal izz well, Expecto patronum, the oath) and "Turn off easter eggs".
- The waveform Pause carries the tooltip "Nox — pause motion" / "Lumos — resume motion" (the accessible name stays literal).
- `Footer` is replaced by the `credits` section (`<footer>`).
- **Intro:** `IntroOverlay` is SSR markup plus a vanilla controller `public/intro.js` (≤ 6 KB gz) and the head script.

| Section type | Props / variants | Design rules (v2 deltas) |
|---|---|---|
| `hero` | statement?, cta, media, mediaMobile | The full-bleed sea plate; `100svh` desktop; the aperture only when the intro didn't play; one CTA |
| `statement`, `experiment`, `matrix`, `principles`, `quotes` | v1; `quotes` gains media?, loop? (v3) | World-aware grounds. The matrix adds FIG "How this page is built" and the space-pen wink. Principles add ribbons; quotes add HP-03′ (v3: the rdr2 `campfire` dressing = MV-11/11L + "read into firelight") |
| `chapter` | projectId, cover (`code:schematic-*`) | Blueprint panel ≤ 40%, leaders, **one chalk circle on the caveat** |
| `ledger` | include | v1 Lens Index; the grid → open air ends here |
| `gauntlet` | **board: MediaId** (v2; was from/to) | Chalk derivation on the dawn board; Run verb; tally circled |
| `index` | source, preview (v3: `vignette` · filmstrip · inline) | The paper plane; the nib-wipe h2 (pencil in rdr2); v3: the rdr2 `journal` dressing (spread, graphite vignettes); the candlelit covers are retired |
| `story` | split · filmstrip · contact-sheet · notes · **voyage** (v2); v3: media?, mediaMobile?, handbill? | The voyage = sticky sequence column + course + Jack's compass. v3: `notes` in rdr2 = the **frontier** dressing (MV-10 band, trail map, prints, satchel, tintypes, handbill) |
| `scene` | film · sequence · seam · stills · title-card | v1 (≤ 2 incl. long cards) |
| **`films`** (v2) | order | The intermission; **4 screens** (three films and a game); a quote caption per screen; finales; DRAFT-gated reasons |
| **`credits`** (v2) | — | The native-scroll roll; `<footer>`; v3: `LINES QUOTED`, the H3 fan-tribute line, "Mischief managed.", the Snitch, the Time-Turner, the Hallows end mark |
| **ActCard** (v2, derived, not in the manifest) | kind: opening · seam · **tintype** (v3) · ignite · reel · title | Letterbox loading-reel grammar (SPEC §8.2) |
| `contact` | question?, invitation, media? | The last light; the bracket on AS over the flame; flare on copy |

---

## 10. Accessibility (v1, plus the film layer)
- **Structure:** one `h1` (the name). Act cards and the films chapter are `h2` sections (`aria-labelledby`); films are `h3`. Landmarks; the skip link; Mandarin marked `lang="zh-Hans"`.
- **Contrast:** text ≥ 4.5:1 (large ≥ 3:1) in every state, **on every world × tone** (§1.3.1). Ghosting is a colour step (`--fg-ghost`), never opacity. Non-text UI and focus rings ≥ 3:1.
- **Focus:** `:focus-visible` = a 2 px `--accent` outline, 3 px offset, radius 3, never clipped. Targets ≥ 44 px, including Skip intro, waypoint links, "Seen here in" links and opening-card rows.
- **Parity:** every hover has a focus equivalent:
  - intro candles lean on hover **and** focus
  - (v3) the compass lid opens and the journal vignette draws on hover **and** focus
  - opening rows draw their Line on hover **and** focus
  - waypoints turn the needle on hover **and** focus
  - decorative-only effects (the schematic draw, ribbons) are R1, never hover-gated
- **Intro dialog:** `role="dialog" aria-modal="true"`, labelled and described. Focus starts on Play; Tab is trapped between Play and Skip; Esc exits. The page behind is `inert`. On exit, focus moves to the h1 (`tabindex=-1`). No `aria-live` except the real-loading status.
- **Loaders:** real loaders carry visible `role="status"` text. Mini media loaders and interstitial motifs are `aria-hidden`, and interstitials never use `role="status"`.
- **Patterns:** the gauntlet `tablist`; the ledger `<ol>` of buttons (no listbox); menu and palette focus traps; the waveform `aria-pressed`; Copy email via `aria-live`.
- **Media:** decorative media, SVG and canvas are `aria-hidden`. No text in canvas or images. Captions and FIG labels are real HTML. Every figure has a text equivalent (`summary`, tally, gate list).
- **Motion safety:**
  - No flashing: no more than 3 flashes per second (the general flash / red flash thresholds, WCAG 2.3.1). Single flashes stay below 0.1% of the viewport area.
  - Intro and loader ambient motion stops ≤ 5 s; the Pause toggle stops everything.
- **Reflow:** no horizontal overflow at 320, 390, 1024 or 1440; the page survives 200% zoom.
- **Eggs (v3):** every egg has a keyboard path (palette commands; typed words only outside inputs); **no single-key shortcuts** (WCAG 2.1.4); a palette toggle turns typed triggers off; egg toasts are one polite `role="status"` or aria-hidden; the Map dialog follows dialog rules (Esc, a close button, focus return); the Snitch is a real `<button>` with a text name; Dead Eye never tints text and Esc aborts it.
- **Lettering (v3):** outlined act titles keep a real heading with sr-only text; display faces never carry information that is not also in the DOM as text.
- **Honesty counts as accessibility:** illustrative labels beside visuals, caveats beside claims, drafts not links, **interstitials never claim to load**.

---

## 11. BANNED PATTERNS (critics fail a build on any of these)

### 11.1 The five tells (v1)
| Tell | Our rule |
|---|---|
| More than 3 type styles in a viewport | ≤ 3; chrome speaks `meta` |
| Every gap identical | The spacing tier ladder |
| An accent everywhere | The accent law (§1.2) |
| A grey box round every card | No cards; surfaces for interactive objects only |
| Stock icons | Functional icons only |

### 11.2 Slop and lookalikes (v1)
- **Slop V2:** a glow orb, a bento grid, a floating pill nav.
- **Slop V1:** a purple gradient, four identical cards.
- **The explainer-deck pattern:** a coloured italic-serif accent phrase, glowing gradient hairlines, a dot progress rail, `● | EYEBROW · 01` pills, colour-coded card tops.

### 11.3 The baseline's own tells (v1 TEARDOWN list, unchanged)
- mono eyebrows at 11 px / +.22em; text under 13 px; ghost numerals
- card-in-card; bordered tag pills; spotlight cards
- radial glow orbs; the cursor glow; glow text-shadow; gradient text
- media as wallpaper; one still reused 3×
- per-word blur; decrypt; replaying reveals; bobbing scroll cues
- the progress bar; a duplicate rail; "Contact" twice
- SSR `opacity:0`; hydration swaps; always-on loops

### 11.4 Reference-copying traps (v1, plus the v2 amendment)
- **v1 traps still hold:** Lusion's global ribbon, virtual scroll or wheel hijack, auto-scroll assist, competing hero reveals, Dennis name marquees, Obys 11 px UI, Igloo `//` or HUD, audio, overscroll navigation, a live NYSE clock, unsourced claims, and generated media showing people, text or charts.
- **Content-gating loaders, amended by N1:** the prologue overlay is permitted **only** under all of the following. Otherwise it is a banned gate:
  - (a) SSR content beneath is complete, and no-JS never sees it
  - (b) Skip, Esc and scroll dismiss it in ≤ 0.4 s
  - (c) it is auto-skipped for RM, `?skip`, `#hash`, Save-Data, Pause, and once per session
  - (d) a 3 s failsafe
  - (e) the name is visible on the play screen (Meta) and lands as the page h1
  - (f) no fake progress
  - (g) LCP stays the page's

### 11.5 Film-layer bans (v2, re-affirmed in v3 as taste; the iconic override does not lift them)
**Kitsch and theme-park tells:**
- a compass as the menu button or anywhere in chrome
- "NOW SHOWING"
- sprocket or film-strip borders, clapperboards, ticket stubs, marquee bulbs, popcorn
- rope borders, treasure-chest icons, "arr" copy and pirate-speak, parrots, eyepatches, a ship's wheel as decor
- chalkboard-texture wallpaper, doodle backgrounds, gear-pattern backgrounds, Bollywood clip art
- sepia full pages, house-colour section themes, sorting quizzes
- a traveling light across the name or headings (lumos traverse)
- candle-guttering or flicker as a UI response on text or chrome
- a candle field in the hero
- **v3 (RDR2):** guns, revolvers, reticles or a crosshair cursor, bullet holes, saloon-door transitions, a weapon-wheel palette, "yee-haw", wanted posters on research rows, an honor meter, HUD cores
- **v3 (all):** wizard-hat or sparkle cursors, emoji, stock icon packs, a work's title set in a lookalike face

**Structure tells:**
- **world ping-pong:** non-contiguous acts, **more than 4 worlds, more than 4 major world changes** (v3)
- two ambient world-light systems in one viewport
- chalk circles, ribbons, stamps or pencil underlines from different worlds in one section
- **v3:** two worlds' icons in one viewport at rest (the user-invoked Dead Eye and the credits' HP bookend are the only exceptions); more than one HERO icon per viewport; an egg on the reading path
- time-driven clips the reader must wait through in a sticky stage (the films chapter is scroll-settled)
- light, glow or bloom as DOM paint
- a film colour, display face or mark on research data

**Copy tells:**
- ghostwritten aphorisms presented as Aryan's lessons
- sample "reasons" in any status (prompts only)
- "inspired by" branding
- "GRADED" wording
- **v3:** an unattributed film or game line; a line placed as a caption to a metric; a film line used as a TIP; a misattributed quote

### 11.6 The hard limits (v3; replaces the v2 legal DO-NOT list, which the iconic override flipped)
The v2 per-film DO-NOT table is superseded by SPEC A-6 and ICONS.md §1 (every former ban with its new verdict). What remains absolute is the five hard limits (SPEC §15, ICONS §0.2), applied to code, copy, alt text, prompts and media:

| # | Limit | In practice |
|---|---|---|
| **H1** | No actor faces or likenesses | No person, face, hand, rider, character figure or costume-as-person silhouette (the tricorn profile, Arthur's hat on a rider, the scar on a face) in any generated asset, SVG, canvas or egg. Riderless broom, riderless horse, empty camp, empty deck |
| **H2** | Nothing ripped, no marks, in the public repo | No stills, frame grabs, screenshots, footage, audio, official posters, logo/wordmark/crest/UI-sprite files, extracted fonts; **hand-redrawn replicas of logos, wordmarks and crests count as the mark**; no film still as a model reference; personal-use font binaries never tracked |
| **H3** | The fan-tribute line | "Fan tribute — not affiliated with Warner Bros., Disney, Vinod Chopra Films or Rockstar Games." verbatim in the credits |
| **H4** | Research honesty | CLAUDE.md §2 exclusions; no invented facts; quotes verbatim and attributed; any line about why a work matters to Aryan is DRAFT; research data never takes film styling |
| **H5** | Accessibility and performance | §6.5, §10, §12 and the SPEC §13–§14 contracts |

**Check L2 (every generated asset; §7):** ours · no faces · no marks · the subject, not the shot · crafted. Claude and Aryan both sign. (Replaces check L, "could a fan mistake this for a still?", which the override retired.)

**Kept as hygiene, not law:** the page `<title>`, meta description, OG image and static favicon stay name-first with no film names or marks; `kimi/research/ref-images/` never enters a build path.

---

## 12. Acceptance gates (re-run `teardown-tools/teardown-scan.mjs` and `ssr-deep.mjs` after every phase)
| Gate | Today (MEAS) | Target |
|---|---|---|
| Distinct compiled font sizes / text under 13 px | 29 / 203 elements | ≤ 8 / 0 (display lettering counts toward sizes; it is always ≥ `title`) |
| Radius values / surface expressions | 8 / 54 | ≤ 5 / 3 per tone × world |
| Raw colour literals in components | 64 rgba + 10 hex | 0 (tokens only; world tokens in `globals.css`) |
| Aqua marks per viewport at rest / type styles | ≥ 15 / ≈ 10 | 1 / ≤ 3 |
| Always-on DOM loops / `useScroll` owners | 7 / ≈ 34 | 0 / ≤ 1 per section (cards own one each) |
| SSR `opacity: 0` / blurred words / hydration height change | 127 / 16 / ≈ 2k px | 0 / 0 / 0 |
| The name at first paint | 14 px, header only | `display` h1 in the DOM at first paint; visible at first paint when the intro is not armed; visible within ≤ 7 s of Play or ≤ 0.4 s of Skip when armed |
| **World × tone AA table (v3: incl. rdr2, Dead Eye, handbill, map)** | — | 100% pass (validator) |
| **Quote registry lint + H2 file checks (v3; replaces the banned-term lint)** | — | 0 hits |
| **Display lettering outside its scope (v3)** | — | 0 |
| **Draft or unapproved copy/quotes in the production build** | — | 0 |
| **LCP with the intro armed** | — | ≤ 2.5 s mobile lab; the element is the h1 or MV-01 |
| **Generated assets with check L2 signed (v3)** | — | 100% (Claude and Aryan) |

**Frame checks (the BAR loop):** the name is visible (or intro armed, per the intro BAR) · the reduced-motion frame is correct · nothing clipped at 390 or 320 · the synthetic label next to its chart · no horizontal overflow · **one world per viewport at rest** · **one ambient light system per viewport** · **≤ 1 HERO icon per viewport (v3)** · **no display face on data (v3)**.

**Deviations from v1 (critics should not flag these):**
1. Film light law (glow allowed in world media only).
2. `data-world` tone recolouring.
3. The paper plane is `#ebe0c6` with new inks (v3: hosted as the rdr2 journal).
4. The blueprint panel is `#0f2c47` (not Kimi's `#123a5e`).
5. Spring retunes: `springSnap` critically damped; `springSettle` 3.8%.
6. `easeDraw` for strokes only.
7. `pageStickyMaxVh` 150, `maxSignature` **6** (v3).
8. The intro overlay under §11.4's conditions.
9. The hero is a full-bleed sea plate, not the cols 7–12 sculpture.
10. The bracket gains drawn-in and launch states; the hero aperture runs only when the intro didn't play.
11. Pirates and idiots surface-2 retuned for muted AA.
12. The mobile pin budget is 0: the v1 seam BAR F5 conflict is resolved in favour of no pin on mobile.

**Deviations from v2 (v3; critics should not flag these):**
13. Four works, five world keys; ≤ 4 worlds and ≤ 4 major changes.
14. The iconic override: the castle, candles, broom, the Pearl, Jack's compass with its red arrow, the colonnades, the scooter, the frontier, riderless horses, the campfire, the Marauder's Map, Lumos/Nox, Dead Eye and the quoted lines are **allowed** (recreated; within H1–H5).
15. Scoped world display faces (§2.1.1) for act titles, loaders and eggs.
16. `--intro-night` retuned to `#020e1c`.
17. The `epigraph` treatment (Newsreader italic at `lead` size) for film lines only.
18. The registered easter-egg layer (SPEC §10.3).