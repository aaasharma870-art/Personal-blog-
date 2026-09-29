# BAR: Card I→II "Storm → Blueprint" (the noise → order seam) + the gauntlet on the dawn board
> **v3 deltas (SPEC v2 SM-5 / SM-6, 2026-09-28):** the reel mark is `II / IV`; the act title "The Workshop" is set in **Kalam lettering** (the act-title slot; real text in the DOM); MV-04 may hide **the kraken** as a dark mass under the foam (IC-PC-05, an egg in media; the Line overlay must still pass). The gauntlet board (MV-06) now hangs under **stone colonnade windows** (IC-3I-09, no signage); its top margin carries *Pursue excellence, and success will follow.* as a `FilmQuote` caption with inline attribution (house type, one chalk underline counted in the ≤ 3 chalk marks); the board frame enters on the **`aalIzzWell`** two-beat settle (non-interactive only); a chalk **quadcopter** doodle lifts 8 px once when a Run clears 7/7 (IC-3I-08). N31 is updated; N32–N34 are new.
> Adapted from `prep/bars/noise-order-seam.BAR.md`. D3's seam moves from the gauntlet's entry to the **I→II act card** (SPEC SM-5, D-5 long #1). Part B keeps the gauntlet verb on the Act II chalkboard (SM-6). Part A must also pass `act-cards.BAR.md` C1–C24 and `loaders.BAR.md` L1, L2, L6–L8 and L10. BUILD-SPEC 2026-09-28.
> **Binding:** SPEC §4, §7 SM-5, SM-6. DESIGN v2 §1.3.1 (`--bp-panel`), §1.3.3 (bp-line, chalk), §6.1 (`easeDraw`, `dur.draw`, `springSettle`), §6.3 ("Card I→II", "Chalk circle"), §9 (`IceCut`, `Gauge`, `ChalkMark`). MEDIA-PLAN MV-04, MV-06.

## 1. Intent
- **A.** The sea the reader met in the hero comes back as a storm, and is wiped, along one ragged diagonal, into a blueprint. The curve that was foam is now drawn as FIG. 0, with its true dimensions, while a small gear train measures exactly how far you have come. Noise becomes order: the hinge of the film.
- **B.** In the workshop at first light, the reader **runs** labelled-illustrative hypotheses through the real seven gates, derived in chalk as a mind would build them. Rigour is something you do.

**Principles:** SYN #5 (one object transforms) · #6 (the scroll drives the wipe; the click drives the run; the drivers never mix) · #11 (a verb) · #3 (aqua only on the moving seam line, then only on the active gate).

## 2. Benchmark frames (v1, retained)
| Frame | Lock | Do NOT copy |
|---|---|---|
| `research/refs/igloo/frames/key/trans1_t56.5s.png` | The incoming is the one sharp thing, arriving from below; the midpoint is a breath | The white fog flash; HUD blocks |
| `research/refs/igloo/frames/key/trans2_t85.0s.png` | Opposing motion; the change lives in one band; chroma only on the moving edge | Rainbow CA; row shear; auto-snap |
| `research/refs/bruno/best/06-start-mid-disc-contracts.png` | One verb; a small anticipation before the release | `back.in`; the click-to-start gate |

VER (Igloo): parallax 0.4 with `power2In`; cut slope −0.2 × aspect; the velocity-coupled cut was disabled by its creator, so ours is position-only.

## 3A. Card I→II state machine (one `ScrollStage`, direct `useTransform`, no springs; pinned ≤ 60vh at ≥ 1024 fine only)
| p | State | Spec |
|---|---|---|
| pre | SSR | The static composition: the blueprint frame with FIG. 0 drawn, the gauge at the end with its circle, the captions, the `summary` |
| 0–.15 | entry | The frame opens `inset(8%)` → 0 on **MV-04**. Upper bar: `ACT II • AFTER 3 IDIOTS` · `II / IV`. Lower bar: `h2` "The Workshop" in Kalam lettering (R1 rise) |
| .15–.75 | wipe | **IceCut:** `mask-position` linear in p over the pre-baked ragged mask (`seam.slope`). Outgoing y = −.4·p²·H; incoming y = +.4·(1−p)²·H. The **incoming is the code blueprint ground** (`--bp-panel` + a 24 px grid at 6%). A **3 px `--accent` line** (the mask offset) is visible only for .1 < p < .9. **FIG. 0:** `LINE_D` in `--w-bp-line`, `pathLength` = remap(p, .2, .75), with dimension ticks, plus the HTML Meta `FIG. 0 • THE LINE • L = <computed> • <n> CONTROL POINTS`. **Gauge (LD-3I):** at the dimension line's left end, the rack x = p·L and the gears follow exactly (`loaders.BAR` L1) |
| .75–1 | epigraph | The lower bar `lead`: "Treat every backtest as guilty until proven innocent." (R1 rise once at p ≥ .75). At p ≥ .95, one chalk circle around the end tick (`dur.draw.short`) |
| settled | p = 1 | The blueprint with FIG. 0 and the gauge complete; 0 aqua |

**Registration:** the MV-04 foam centreline follows `LINE_D` within ±4% of height (MEDIA-PLAN), so the wipe visibly turns foam into the drawn Line.

## 3B. The gauntlet on the dawn board (`work`)
**Layout:**
- the `chapter` h2 plus a lead (R1)
- the **board**: a `MediaFrame` of MV-06, 16:9, radius `frame`, with the Settle entrance (`springSettle`, scale .96 → 1, non-interactive)
- at the block tier: the tablist (cols 1–5) and a `<figure>` (cols 6–12), whose SVG chalk gate diagram sits over the board's dark left 60%
- `SYNTHETIC • ILLUSTRATIVE` inside the figure

| State | Driver | Spec |
|---|---|---|
| idle | load | Tab 1 is selected; N = `gauntlet.length` gates drawn in `--fg-ghost` chalk; the active gate is the one aqua; seeded dots at the start line |
| derive | tab select (click, arrows, Home/End) | The selected gate's strokes draw in build order (`easeDraw`, `dur.draw.med`); the panel text swaps in a mask on `dur.base`; a run in progress continues |
| anticipate | Run (click, Enter, Space) | Dots pull back ≤ `gauntlet.anticipation` on `dur.micro` |
| run | time | Dots advance `dur.base` per gate; a failing dot shows `--kill` only while stopping, then rests hollow `--fg-ghost`; survivors rest filled `--fg` |
| settled | end | The tally is HTML; **one chalk circle** around the tally line (`dur.draw.short`); `aria-live` announces once, and the announcement contains "illustrative"; Run re-arms |

## 4. Reduced motion · mobile · no-JS · Save-Data
| Condition | Card I→II | Gauntlet |
|---|---|---|
| RM / Pause | The static title card (blueprint + FIG. 0 drawn + the gauge complete + the circle); 0 spacer; **0 mask requests**; 0 aqua | The settled tally, chalk pre-drawn, no Run, instant tabs |
| < 1024 / coarse | The static composition; the FIG. 0 line draws once on entry (R1), with no scrub and 0 travel (D-5) | A vertical tablist; the figure below; the board cropped 1:1 on the focal point |
| No JS | The SSR static composition | All N stages as a list plus the static SVG; no Run button |
| Save-Data | Static; MV-04 not requested (the blueprint is code) | Unchanged (the SVG is code); Run works |
| MV-04 missing | The code "storm grade" of MV-01, or the static composition | — |

## 5. Keyboard · focus · ARIA
- **Card:** 0 tab stops; `h2` labelled; the stage `aria-hidden`; the `summary` carries the meaning.
- **Gauntlet:** v1 semantics are kept:
  - `tablist` with roving tabindex, arrows/Home/End with wrap, `aria-orientation="vertical"`, and a focusable tabpanel
  - Run is a native button with `aria-describedby` → the label
  - one polite live region
  - no left rail, no pill-cards, no ghost numerals, no count-up

## 6. HARD pass/fail checks
Aqua = within ΔE ≤ 10 of `#2dd4bf`/`#5eead4`.

| ID | Pass condition |
|---|---|
| N0 | The page h1 passes `hero-lens` H1 (context `?skip`) |
| N1 | Card captions (bars) never intersect the frame rect at any p; the gauntlet text never intersects the board media rect |
| N2 | 0 aqua px in the frame at p ∈ {0, .1, .9, 1}. At p ∈ {.25, .5, .75}, exactly one connected aqua band spans ≥ 90% of the frame width, ≤ 4 px thick |
| N3 | The mean y of the aqua band strictly decreases from p .25 → .5 → .75 (order rises from below) |
| N4 | Translate y: outgoing −.4·p²·H and incoming +.4·(1−p)²·H, each ± 2 px |
| N5 | `?qa=fills` (outgoing magenta, incoming green): 0 px of `--bg` inside the frame at p ∈ {.1, .25, .5, .75, .9} |
| N6 | p = .5 from above vs from below: ≤ .5% of px differ; two frames 500 ms apart with no input: identical |
| N7 | FIG. 0 `pathLength` = remap(p, .2, .75) ± .01. The printed L and n equal `getTotalLength()` (rounded) and the path's control-point count, **computed, not literal** (grep: no numeric literal in the label source) |
| N8 | Spacer ≤ 0.60 × innerHeight at 1440 (≤ 540 px) only with a fine pointer; = 0 at 390, 1024-coarse, RM and NJ |
| N9 | ≤ 1 aqua component per viewport at rest in each section box (the card: 0 at rest; the gauntlet: the active gate only) |
| N10 | No dome `Seam` adjacent to the card |
| N11 | CLS = 0 through the card and across all N tab selections and Runs |
| N12 | 0 video requests in both parts; the image requests are MV-04, MV-06 and the mask only |
| N13 | ≤ 3 type styles per viewport; ≥ 13 px |
| N14 | 390: `scrollWidth` 390; the tabs and Run are ≥ 44 × 44; no internal horizontal scroll |
| N15 | Idle: N tabs with text === `gauntlet[i].title` in order, N gates, tab 1 selected, the label present |
| N16 | → → → tab 3 is focused and selected; the panel = `gauntlet[2].body`; End → N; Home → 1; → on N wraps to 1 |
| N17 | The run settles by `dur.micro + N·dur.base + dur.base` + 250 ms; two frames 500 ms later are identical |
| N18 | The anticipation never pulls a dot past the start line; no overshoot at rest |
| N19 | Seeded determinism: two runs give identical final dots; the count stays constant through a restart |
| N20 | 0 sim rAF offscreen or on a hidden tab |
| N21 | `SYNTHETIC • ILLUSTRATIVE` sits in the same `<figure>` as the SVG, within the pair tier (≤ 12 px) in the settled frames at 1440 and 390 |
| N22 | RM and Pause: N8 = 0, 0 mask requests, 0 aqua in the card; the gauntlet has no Run button and no dot motion |
| N23 | No JS: the card's static composition is visible; all N gate titles and bodies are visible; 0 dead buttons |
| N24 | Save-Data: 0 mask requests; MV-04 not requested |
| N25 | Focus rings are visible on all 4 sides for a tab, the panel and Run |
| N26 | Every text node ≥ 4.5:1 on its ground: idiots canvas (DESIGN §1.3.1), the card bars on `--idi-deep`. **0 text on `--bp-panel` except ink, stone or bp-line** (muted fails there) |
| N27 | PageDown through the card raises `scrollY` by ≥ 80% of the viewport each press |
| **N28** (v2) | The gauge honesty: `loaders.BAR` L1 at p ∈ {.2, .5, .75, 1} |
| **N29** (v2) | Chalk circles: exactly 1 in the card (at p ≥ .95) and 1 in the gauntlet (settled); ≤ 3 chalk marks per section; the chalk is never on an interactive element |
| **N30** (v2) | The epigraph string === the REPO interlude line, byte-equal |
| **N31** (v3) | MV-04 / `LINE_D` overlay ≤ ±4% of height (MEDIA-PLAN §6.2); **check L2** signed for MV-04 and MV-06 (no people, signage or marks; the kraken reads as a shape, not a creature with eyes or tentacles) |
| **N32** (v3) | The board quote: rendered through `FilmQuote` (caption, inline attribution, `excerpt` marked); never beside a gate verdict or the tally; its underline counts toward ≤ 3 chalk marks |
| **N33** (v3) | `aalIzzWell` runs only on the board frame and other non-interactive Act II entrances (0 on tabs, Run, links); 0 under R |
| **N34** (v3) | The quadcopter lifts only after a real 7/7 Run (0 lifts on fewer), once per Run, 8 px, ≤ 400 ms; it is unlabelled, aria-hidden and static under R |
| **N32** (v2) | The Settle is applied only to the board frame's entrance (non-interactive); 0 overshoot on tabs and Run (`springSnap` or none) |

## 7. Capture plan
v1 positions with p mapped by `window.__bar.cardRange`:
- **Card:** `card-{D,M}-p000…p100`, `-p050-from-below`, `-qafills`, and `{RM,NJ,SD,P}`
- **Gauntlet:** `g-{D,M}-idle|derive-3|run-mid|settled|settled+500` and `{RM,NJ}`
- pixel checks via canvas `getImageData`
- output to `research/build/bars/frames/noise-order-seam/<date>/`
- 3 critics, ≤ 3 rounds

## 8. Adaptability
- **AD1:** the gauntlet stages come from `gauntlet[]`; a 5-item fixture gives 5 tabs and gates (N15–N17 with N = 5).
- **AD2:** the card is derived. It appears only where `pirates>idiots` resolves, and moving `work` to act 3 moves the chalk board's `emphasis` to ribbons and its `ground` to none (the fixture must pass N11–N16, N21).
- **AD3 (validator):**
  - ≤ 1 IceCut per page unless Aryan approves
  - the card counts toward `maxLongCards` and the sticky budget
  - `board` resolves to an accepted asset, or its code alternative
- **AD4:** `IceCut` is one primitive shared by this card and the scene `seam` variant.

## 9. Honesty
- **HO1:** every word comes from `content.ts`, the REPO epigraph, the locked Meta words, approved microcopy or (v3) a registered, attributed `FilmQuote` (the board line).
- **HO2:** the sim is labelled (N21), and the live text contains "illustrative".
- **HO3:** the dot counts never equal a `content.ts` count (3, 5, 470, 15, 6, 9, 3,000+).
- **HO4:** only step 2 is implied as the plurality killer ("This gate killed most ideas").
- **HO5:** FIG. 0's numbers are the path's own true measurements. The gauge moves only as far as the scroll.
- **HO6:** MV-04 and MV-06 are decorative weather. The blueprint is code.
