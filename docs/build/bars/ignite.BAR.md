# BAR: Card III→IV — "Embers → the Line ignites" (D-5 long #2)
> A new signature moment (SPEC SM-10; TA-08 + HP-11 + LD-HP at card scale). It must also pass `act-cards.BAR.md` C1–C28 and `loaders.BAR.md` L2, L4–L8 and L10. BUILD-SPEC 2026-09-28. **v3 update (SPEC v2):** the card now follows RDR2's Act III: the kindling is lit **from the campfire** (embers rise and become floating candles along the Line), the Line arrives in graphite and is re-inked, the settled plate is **the enchanted hall** (MV-07, IC-HP-16), the title is IM Fell lettering, and the epigraph is "…if one only remembers to turn on the light." With the rdr2 act disabled (fixture I) this card is Card II→III again, with v1's beats.
> **Binding:** SPEC v2 §4 (the Line), SM-16 (the fire hand-off), SM-10, §9.6 (Q-HP-3), §10.1, §10.2. DESIGN v3 §1.2 (Law 1: the world canvas), §1.3 (rd deep `#0a0605` → hp deep `#070504`; pencil, ink-contour, dusk, flame sprite tokens), §2.1.1 (IM Fell), §2.2 (`epigraph`), §6.1 `ember.*`, `candle.*`, §6.3 ("Card III→IV"), §6.4 (canvas singleton, sprites ≤ 40), §7 (world canvas). MEDIA-PLAN v2 MV-07.

## 1. Intent
After the frontier, the journal and the voices by the fire, the fire burns low. Its embers rise, find their places along the Line (which arrives as a faint pencil trail) and, one by one, become floating candles; pencil becomes ink becomes light, and then the enchanted hall appears: hundreds of candles along the same curve under a ceiling that dissolves into the night sky. Act IV has begun. It is the moment visitors should describe to someone else, and it is carried entirely by light inside a canvas and an image. No DOM element glows.

**Principles:** SYN #5 continuity (the same Line, a new material) · #6 one driver (pinned p; kindling is position-mapped) · #10 a change of place · the counter-principle (native scroll, real RM).

## 2. Reference
| Source | Lock | Do NOT copy |
|---|---|---|
| KIMI HP-02 / HP-11 (density + depth falloff; far-to-near kindling); ICONS IC-HP-03, IC-HP-16 | One simple sprite, multiplied; size and alpha are the only depth cues; v3: floating candles and the enchanted hall are **allowed** (our composition) | A remake of the film's hall shot (tables, banners, people, house colours); ember sprites that stay ember-coloured after arrival (they become candles) |
| `research/refs/igloo/frames/key/trans1_t56.5s.png` | The change is a breath: one sharp thing arriving in a calm frame | The full-frame white fog flash; CA on anything |

## 3. State machine (`ScrollStage`, one `useScroll`, direct `useTransform`; travel ≤ 60vh at ≥ 1024 fine only)
| p | State | Spec |
|---|---|---|
| pre | SSR | The static composition: the MV-07 poster in the letterbox, the title, the epigraph, the `summary`. The canvas is **not** mounted |
| 0–.2 | the fire burns low | Two stacked ground layers crossfade (**rd deep `#0a0605`** → hp deep `#070504`), opacity only. The canvas mounts (the singleton; it releases any other canvas first). At the Line's start, the code campfire (R-6, ≤ 12 sprites) burns low. `LINE_D` in `--w-pencil` at 30%. Upper bar: `ACT IV • AFTER HARRY POTTER` · `IV / IV` |
| .2–.7 | ignition | N = 32–40 ember sprites (`--w-dusk` cores) rise from the fire; ember i reaches `getPointAtLength(i/N)` when p ≥ .2 + .5·i/N (a time tween inside the canvas, triggered by position; reversible) and **becomes a floating candle** (the cream taper appears under the flame). A cool light sprite (`--w-lumos`) leads the kindling front. The pencil stroke is re-inked `#c9ac72` behind the front, and its opacity = .3 × (1 − lit/N). The lower bar: the `h2` "The Light" (IM Fell lettering) rises once at p ≥ .25; the epigraph (Q-HP-3 excerpt) at p ≥ .6 |
| .7–1 | the enchanted hall | At p > .8, MV-07 swaps in on `dur.preview` as a state swap (never parked half-mixed), registered so its candle-density ridge lies on `LINE_D` (MEDIA-PLAN overlay ≤ ±6%). The canvas fades out and **unmounts** at p = 1 |
| settled | p = 1 | The MV-07 still in the letterbox, the title, no canvas |
| reverse | p ↓ | Exact reversal by position; the canvas remounts at p < .8 |

## 4. Reduced motion · mobile · no-JS · Save-Data
- **RM / Pause, < 1024, coarse pointer, no JS, Save-Data:** a static title card: the MV-07 still (or its code-render fallback), the Meta labels, the `h2`, the `summary`, **0 canvas, 0 sprites, 0 travel**.
- **`hardwareConcurrency < 4`:** the static card.

## 5. Keyboard · focus · ARIA
0 tab stops. `<section id="act-4" aria-labelledby>` with the `h2` (sr-only text inside the lettering). The canvas and still are `aria-hidden`, and the `summary` carries the meaning ("The campfire's embers become candles along the Line: Act IV, after Harry Potter."). There is no live region.

## 6. HARD pass/fail checks
| # | Check | Pass iff |
|---|---|---|
| G1 | Handoff | At p = 0 the code campfire sits at `LINE_D` length 0 and pairs with the Voices fire (SM-16) at the same relative position (a design pairing check). Fixture I: exactly one point is lit at length 0, paired with the films HP screen (v1) |
| G2 | Kindling map | The arrived (candle) count at p ∈ {.2, .35, .45, .6, .7} = ⌊N·(p−.2)/.5⌋ ± 1; no ember is left mid-air at p ≥ .75 |
| G3 | Monotonic and reversible | Scrolling from p .7 → .3 → .7 yields a pixel-identical canvas at .7 (± 0.5%) |
| G4 | Law 1 | Every luminous pixel is inside the `<canvas>` or the MV-07 `<img>`. 0 DOM `box-shadow`, `text-shadow`, `filter` or radial paint in the card |
| G5 | Sprite budget | Live sprites ≤ 40 embers/candles (plus 1 light, plus ≤ 12 fire frames that fade by p = .4); `drawImage` of pre-rendered sprites only (0 `createRadialGradient` calls per frame, via an instrumented canvas); DPR ≤ 2 |
| G6 | Canvas singleton | At any scrollY, live `<canvas>` count ≤ 1 page-wide. The canvas is unmounted at p = 1 and at p = 0 minus one viewport |
| G7 | Offscreen and hidden | 0 rAF over 2 s when the card is offscreen; and on `visibilitychange: hidden` |
| G8 | State swap | At p ∈ [.8, .8 + `dur.preview`-equivalent], MV-07 opacity ∈ {0, 1} after the tween completes (never parked in 0.05–0.95 after 300 ms without scroll) |
| G9 | Line alignment | The MV-07 density ridge vs `LINE_D`: ≤ ±6% of height across x 20–95% (MEDIA-PLAN §6.2) |
| G10 | Travel | Spacer ≤ 0.60 × innerHeight only at ≥ 1024 and fine pointer; 0 otherwise |
| G11 | No flash | 30 fps capture across p .2 → .8 at a fast scroll: 0 general flashes (the mean-luminance deltas per 1 s window, MEDIA-PLAN §6.2); no point pops from 0 → full in under 100 ms |
| G12 | Warm family | Fire hands over to candle inside the card (one warm family at a time: the fire ends before the first candle lights); 0 aqua in the canvas (hue scan) beyond the ≤ 1 cool leading light sprite; 0 paper |
| G13 | Captions not over motion | The caption rects ∩ the canvas rect = ∅ (captions in the bars) |
| G14 | Static fidelity | The RM, M and NJ frames equal the golden static composition (≤ 0.5% diff) |
| G15 | Honesty and legal (v3) | MV-07 **check L2** signed (Claude and Aryan). The hall and candles are allowed (IC-HP-16); **H1:** no people or figures; **H2:** no banners, crests, house colours or lettering; our composition, not the film's wide shot. The epigraph renders through `FilmQuote` with credits attribution (excerpt marked) |
| **G16** (v3) | Lettering | The `h2` uses IM Fell (mode A, OFL, subset) with real text, or the Newsreader fallback with 0 layout shift; ≤ 1 display face in the viewport |

## 7. Capture plan
- **`/lab/cards?fixture=A`:** p ∈ {0, .1, .2, .3, .45, .6, .7, .8, .85, 1}, plus reverse, plus a fast wheel through.
- **Recording:** 30 fps for G11.
- **Instrumentation:** canvas call counts and the rAF counter.
- **Other contexts:** M, RM and NJ static frames.
- **Critics:** "Is this the page's most memorable moment?" (fidelity) · kitsch/legal · a11y/perf.

## 8. Adaptability
- The kindle path is `LINE_D`, and the count comes from `motion.ts`.
- The card appears wherever the key resolves to `ignite` (`rdr2>hp` by default, `idiots>hp` when rdr2 is disabled).
- The ember source is the previous world's success motif: with rdr2 it is the campfire; in fixture I it is v1's single warm point (and the chalk Line).
- MV-07 missing → the code-rendered final frame (a PNG built from the same sprites).

## 9. FLAGS
F1 N (32 vs 40) · F2 the leading cool-light size · F3 the pencil start opacity (30%) · F4 the ground crossfade range · F5 the ember rise path (straight vs a slight arc) · F6 the epigraph entry point (p ≥ .6).
