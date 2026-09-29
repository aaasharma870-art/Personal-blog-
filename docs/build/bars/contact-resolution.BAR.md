# BAR: Contact as resolution — "the last light"
> **v3 deltas (SPEC v2 SM-12, 2026-09-28):** contact is in **Act IV** (hp) after `principles`; the previous section is `principles` (`--hp-canvas`, the same seam fill as before). MV-08's flame is now **one floating candle** at the end of a trail of floating candles (IC-HP-03; allowed). New egg: **the Patronus** (IC-HP-13): "Expecto patronum" (palette or typed) sends a silver stag of ≤ 400 canvas particles across the dark into the flame in ≤ 3 s, only when no other canvas is alive, desktop only, disabled under RM; never over text. COPIED stays literal. H26 is updated; H27–H28 are new.
> Adapted from `prep/bars/contact-resolution.BAR.md` for SPEC SM-12. v2 changes:
> - the section is in Act III on `--hp-deep`
> - the media is **MV-08 / MV-09**: a single steady flame at the end of a fading trail of lights
> - the bracket closes around the AS monogram **over the flame**
> - Copy email success fires a single 120 ms **flare inside the media**
> - the credits follow the contact (`films-chapter.BAR.md` §C)
>
> BUILD-SPEC 2026-09-28.
> **Binding:** SPEC SM-12, §9.5. DESIGN v2 §1.2 (Law 1: the flare is media), §1.3.1 (hp deep), §5.1 use ④, §5.2, §6.1 (`dur.flash`), §6.3 ("Contact flare"), §7, §10. MEDIA-PLAN MV-08, MV-09.

## 1. Intent
The page ends by resolving, not by spectacle. The dark rises on a dome. One invitation is set large at left. At far right, one steady flame burns at the end of a trail of lights, and the bracket that opened on Play closes around the AS monogram over it: someone left a light on for you. Copying the address makes the flame answer once.

**Principles:** SYN #4 · #5 (the bracket opens at the start and closes here) · #3 (the resolved bracket is the one aqua) · #10 · #9 · #11 · the counter-principle.

## 2. Benchmark frames (v1)
| Frame | Lock | Do NOT copy |
|---|---|---|
| `research/refs/lusion/custom/d-pct-075.png` | The invitation is the largest object; a tiny question; a static per-letter baseline bob | Stickers; the `+` rows; the continue pill; scroll-past navigation; 144 px; a centred axis |
| `research/refs/dennis/desktop-scroll-03of16-y0.png` | A wide shallow dome cap of the previous ground; no stroke | The white → dark palette; the blue circle; superscripts |
| `research/refs/dennis/frames/key_magnetic.png` | The fill rises from the bottom and exits through the top; the label moves further than the shell | The circle; the elastic release; magnetism on nav |

## 3. State machine (v1, plus the world deltas)
| State | Driver | On screen |
|---|---|---|
| S0 (SSR / NJ / RM / `?skip` / `#contact` / in view at hydration) | none | The settled state |
| E entry | R2 | The Seam at full height, filled with the previous tone's `--bg` (`voices` = `--hp-canvas`); the bracket `open` around the monogram box in `--fg-ghost`; the text is usable |
| M1 seam | R2, direct | `scaleY` 1 → 0 over the first 60vh |
| M2 invitation | R1 once | One mask for the whole `<h2>` |
| M3 resolve | R1 event, once per page view | The halves travel to the monogram inset; the stroke turns ghost → accent **at arrival** |
| S settled | — | The resolved bracket = the one aqua. The monogram (`--fg`) sits at MV-08's `focal` (≈ 0.85, 0.50), over the flame's calm ±8% surround. MV-09 plays on its clock only while visible, and only when no other decoder runs |
| P1 / P2 magnetic | R3 | v1 (≤ 25/15 px; the fill enters from below and exits through the top) |
| C copy | click / Enter / Space | `writeText(site.email)` → **on resolve only**: the label swaps to COPIED (mask, `dur.base`), `aria-live` announces, and **one flare**: a masked media layer over the flame region, brightness ≤ 1.2 for `dur.flash` (120 ms), then back. It never repeats within 1 s. On reject: no success claim and no flare |

## 4. Reduced motion · touch · no-JS · Save-Data
| Mode | Seam | Bracket | Invitation | Media | Pill | Flare |
|---|---|---|---|---|---|---|
| RM / Pause | Flat | Resolved | Static | MV-08 poster; **no MV-09 request** | No pull | **None** |
| Touch / ≤ 540 | 5vh → 0 | R1 resolve | Same | MV-08 still | Magnetic off; tap copies | Allowed (single) |
| No JS | Flat | Resolved | Full | Poster | Not rendered (`html.js`); mailto is the action | None |
| Save-Data | Default | Default | Default | Still only | Default | Allowed |

## 5. Keyboard · focus · ARIA (v1)
- `<section id="contact" aria-labelledby>`. The Meta question is a `<p>`.
- The letter spans are `aria-hidden`, with one accessible string. The seam, bracket, monogram and media are `aria-hidden`.
- **Tab order:** Copy → mailto → GitHub → (résumé only if real).
- The focus ring shows unclipped; the copy button's name contains its label; `aria-live` is polite.

## 6. HARD pass/fail checks (v1 H1–H20 restated; v2 H21–H26)
| # | Pass iff |
|---|---|
| H1 | JS off and `#contact` deep link: the h2 === the manifest invitation; the email is visible; the monogram is in view; opacity 1 |
| H2 | 0 `opacity:0`/blur in the SSR `#contact`; the height is equal before and after hydration |
| H3 | At D5, R2 and M3: exactly 1 aqua mark (the bracket); aqua-bright = 0 |
| H4 | 1 Lens pair; its gap to the monogram = 16 / 8 px ± 1; stroke 2 / 1.5 px |
| H5 | ≤ 3 styles; ≥ 13 px; the invitation is Newsreader at the `title` size; ≤ 1 italic block |
| H6 | No single-word line; letter offsets ≤ .06em; no mid-word break |
| H7 | The invitation crop is pixel-identical at D5 and D5 + 2 s |
| H8 | CLS = 0 through the resolve, the MV-09 swap, COPIED and **the flare** |
| H9 | The seam heights (90 / 42 px at the start; 0 settled and under R); the fill = the previous `--bg` (`--hp-canvas` by default); no stroke; the L-same fixture has no Seam |
| H10 | 390/320 reflow; controls before media; targets ≥ 44 |
| H11 | The magnetic gates: transform `none` at 390, under R and on touch; ≤ 25 / 15 px at 1440 |
| H12 | The fill exits upward |
| H13 | Clipboard === `site.email`; COPIED plus `aria-live` on resolve; on reject, no "copied" text anywhere |
| H14 | The links are exact (mailto, GitHub; résumé only if real) |
| H15 | The Tab sequence and 4-sided rings; 0 focusables in decorative layers |
| H16 | axe: 0 serious or critical |
| H17 | MV-08/09 opacity 1; no scrim; the worst media pixel under the text gives ≥ 4.5:1 (MV-08's left 65% ≤ 0.054: MEDIA-PLAN) |
| H18 | ≤ 2 pills; 0 box-shadow/text-shadow (except the `--rule` inset); no radial paint in the DOM |
| H19 | MV-08 missing: no empty rectangle; the bracket resolves on plain `--bg` |
| H20 | R or SD: 0 MV-09 requests |
| **H21** (v2) | **The monogram over the flame:** the monogram centre is within 2% of the viewport width of MV-08's flame `focal`; the bracket rect ∩ the invitation rect = ∅ |
| **H22** (v2) | **The flare is media, single and safe:** exactly one brightness event per successful copy, duration 120 ± 20 ms, area ≤ 2% of the viewport, peak ≤ 1.2×, on a media-layer element; 0 DOM glow; 0 flare on reject or under R; no repeat within 1 s (double-click test) |
| **H23** (v2) | One ambient light system: MV-09 is the only moving light in the viewport; no candle sprites or canvas in `#contact` |
| **H24** (v2) | The decoder: MV-09 never plays while IN-02 or MV-03 is playing (DecoderLock log) |
| **H25** (v2) | The credits follow: the next sibling after `#contact` is `<footer id="credits">` (default); the validator warns if `contact` is not last-before-credits |
| **H26** (v3) | Legal: MV-08 and MV-09 **check L2** signed (Claude and Aryan); the floating candles are allowed; no holder, table, person or hand (H1); no lettering or crest (H2) |
| **H27** (v3) | The Patronus egg: never automatic; ≤ 3 s; ≤ 400 particles; the canvas registry shows ≤ 1 live canvas; the MV-09 loop pauses while it runs (one light system); the bracket and the invitation stay legible (particle rects ∩ text rects = ∅); disabled under R with a palette message |
| **H28** (v3) | The decoder list includes MV-11L: MV-09 never plays while IN-02, MV-03 or MV-11L is playing (DecoderLock log) |

## 7. Capture plan (v1)
- `/lab/contact` (fixtures `?prev=`, `?media=`), then `/`.
- **Frames:** D0–D8 (plus D8-flare at 0/60/120/240 ms), M1–M4, R1–R3, NJ, S1, L-same and L-none.
- **Clock:** `page.clock` for deterministic resolve and flare timings.

## 8. Adaptability (v1)
- Data only; the seam comes from the neighbours; its own Lens instance; 0 vh sticky; no cross-section choreography.
- **v2:** moving `contact` to another act swaps its `success` slot (`needle-settle` / `chalk-tick` / `flare`) and its media plate via `worlds[world].media`, and the checks re-run with that world's inks.

## 9. Honesty (v1)
- Verbatim invitation and lede. D13 ("high-school junior" vs Class of 2027) blocks shipping the lede until Aryan confirms.
- No figures. Generated media is labelled.
- **COPIED and the flare only on a real resolved promise.**
