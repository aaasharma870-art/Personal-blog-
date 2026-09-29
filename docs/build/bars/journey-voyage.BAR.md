# BAR: The voyage — Journey as a sea chart (story `voyage`)
> **v3 deltas (SPEC v2 SM-4 / ICONS §4, 2026-09-28):** the instrument **is Jack's compass** (IC-PC-02): a lidded brass octagon, a 32-point ring with a fleur-de-lis, **the red arrow** in `--pir-compass-red #a8453a` (never ember; never on pirates raised), and a lid that opens on hover **and** focus to show a dot star chart. New TEXTURE icons: the cartouche **THE CROSSING** (Pirata One, the act-title slot), the **cursed Aztec medallion** at waypoint 3 (one moonlit sweep), the **brass X** at waypoint 4 with the caption `NOW • BRING ME THAT HORIZON.` (a `FilmQuote` caption). MV-05a is now **a harbour at night** (moored ships, no people). J8 and J17 are updated; J18–J21 are new.
> A new signature moment (SPEC SM-4; PC-12 sequence, TA-09 instrument, PC-06′ local course, PC-09 wink, LD-PC real loading). BUILD-SPEC 2026-09-28.
> **Binding:** SPEC §3 row 2, §7 SM-4, §8.1, §15. DESIGN v2 §1.3 (pirates world), §6.3 ("Journey sequence", "Journey needle"), §6.4 (sticky column = 0 extra travel; the canvas singleton), §9 (`Instrument`). MEDIA-PLAN MV-05a–d and JV-1…3. `loaders.BAR.md` L2, L3, L11–L13.

## 1. Intent
Aryan's real four-step path reads as a crossing. The weather changes with each step: harbour lights, then fog, then the squall where the pretty backtests failed, then first light when the method points true. **No fact changes:** the step titles and bodies are verbatim `content.ts`. The sea and the instrument are only the light the facts are read in.

**Principles:** SYN #5 (continuity: one sea transforms) · #6 (the scroll drives frames; state drives the needle; the pointer drives the wink) · #11 (a verb: reach for a waypoint and the needle turns to it).

## 2. Reference
| Source | Lock | Do NOT copy |
|---|---|---|
| SYNTHESIS §9 `sequence` variant; `research/refs/lusion/custom/rm-scroll-1350.png` | A frame whose geometry follows the scroll while its content changes | `video.currentTime` scrubbing; the 300vh journey pin (baseline) |
| KIMI PC-01/PC-06; ICONS IC-PC-02/04/06/07 | Hunt-and-settle; the plotted course as progress; v3: Jack's compass, the medallion, the X | A global progress rail; an **ember** arrow (the arrow is compass red); a dial traced from a prop photo or still |

## 3. Layout and state machine (≥ 1024, fine pointer, not RM/SD)
- **The left column (cols 1–6):** four `<article id="journey-step-n">`, each with Meta `0n • MARKER`, a `heading` title and a `body` text, all verbatim from `journey[]`. Normal flow.
- **The right column (cols 7–12):** `position: sticky` (top = header + block tier). It holds a `MediaFrame` (16:9, radius `frame`) and a `<canvas>` sequence (72 frames) whose poster is the active step still. Below it, the **chart strip**: a dashed brass course through 4 waypoint `<a href="#journey-step-n">` (Meta soundings `01`–`04`), with the `Instrument` (72 px) at left.
- **Travel:** the section height = the content height. The sticky column adds 0 spacer.

| State | Driver | Spec |
|---|---|---|
| pre | SSR | The four steps plus four stills stacked (the no-JS truth). Hiding happens only under `html.motion-ok` |
| loading | real: decoded/72 | The active step's still shows; an LD-PC `mini` in the frame corner after 400 ms with real progress; the scrub is disabled until 72/72 |
| scrub | R2 · p = the section content progress | frame = round(p × 71). The frames at indices 0/24/48/71 **are** MV-05a/b/c/d |
| active step | centre-line IO over the articles | Waypoint i active (`--fg`), others `--fg-ghost`. The needle → the leg-i heading on `springNeedle` (spin the long way) |
| the break | active step = 3 | The course segment 2→3 carries its kink; **one ember tick** at waypoint 3 (the killed Smart-Money patterns, `killList[4]`) |
| wink | hover **or** focus on waypoint j | The needle turns to the bearing of waypoint j; on leave or blur it returns to the active step's heading |
| click waypoint | native anchor | Scrolls to step j (smooth only if not RM); focus lands on the article's heading (`tabindex=-1`) |

## 4. Reduced motion · mobile · no-JS · Save-Data
| Condition | Behaviour |
|---|---|
| RM / Pause | The existing accessible journey carousel with the MV-05a–d stills; the course drawn static; the needle static at each step's bearing; 0 sequence requests |
| < 1024 / coarse | The carousel plus stills (the touch path); the chart strip static below it; the needle at the active slide's bearing (state change, instant under RM) |
| No JS | Four articles plus four stills stacked; the static course SVG with 4 plain anchor links |
| Save-Data | The carousel with stills at the smallest srcset; 0 frames |

## 5. Keyboard · focus · ARIA
- Tab stops: the 4 waypoint links (≥ 44 × 44) plus the carousel controls (when shown).
- The canvas, stills, course and instrument are `aria-hidden`. The ember tick has no text: its meaning is in the step text itself ("They failed out-of-sample").
- The carousel keeps its existing ARIA (REPO; v1 unchanged).

## 6. HARD pass/fail checks
| # | Check | Pass iff |
|---|---|---|
| J1 | Verbatim | The four marker, title and body strings are byte-equal to `content.ts` `journey[]`. 0 added words in the section (the Meta numbering only) |
| J2 | Beats are the stills | At p ∈ {0, ⅓, ⅔, 1}, the drawn frame is byte-identical to the MV-05a/b/c/d source (the frame index = 0/24/48/71) |
| J3 | Scrub is positional | The same scrollY reached from above and from below → an identical frame index. A 3 s park → no change |
| J4 | Zero spacer | Section `offsetHeight` = the sum of its content rows + padding (± 2 px); page sticky accounting counts 0 for this section |
| J5 | One active step | Exactly one waypoint in `--fg` at rest, matching the centre-line article |
| J6 | Needle | After an active-step change, the needle reaches the leg heading ± 1° within 900 ms (overshoot ≤ 16%). Under RM, instant |
| J7 | Wink parity | Hover **and** keyboard focus on waypoint 4 while step 1 is active → the needle points to waypoint 4 ± 1°; blur → it returns |
| J8 | Ember semantics | Exactly one ember mark in the section (at waypoint 3); 0 ember elsewhere in the section; 0 amber. The compass arrow is `--pir-compass-red` (2.00:1 from ember) and the X is brass |
| J9 | Aqua | ≤ 1 DOM aqua mark per viewport at rest (0 expected; focus is exempt). Sequence pixels are exempt (media) |
| J10 | Real loading | The mini loader appears only if decoding exceeds 400 ms; its progress = decoded/72 ± 1; no percentage text; it doesn't cover text |
| J11 | Budget | ≤ 3 MB of frames, fetched only when the section is within 1 viewport, desktop only. 0 frame requests at M, RM and SD |
| J12 | Canvas singleton | The sequence canvas unmounts when the section is > 1 viewport away (it frees the singleton for the ignite and the intro) |
| J13 | Carousel path | M, RM and SD render the carousel with 4 slides and working controls, Tab and arrow keys (the REPO behaviour) |
| J14 | No clipping | At 1440, 1024, 390 and 320, no text overflows. Waypoint links are ≥ 44 px |
| J15 | CLS | 0, including the frame swap and the loader show/hide |
| J16 | Type | ≤ 3 styles per viewport ({meta, heading, body}) |
| J17 | Legal (v3) | MV-05a–d and JV **check L2** signed (Claude and Aryan). **H1:** no person on the quay, deck or shore in any frame (a sample every 6th frame); **H2:** no flag marking or hull lettering; our harbour and sea, not a remake of a film shot. Vessels appear only in MV-05a (moored) and optionally MV-05d (one distant ship) |
| **J18** (v3) | Compass geometry | The octagon is regular (±0.5°), the ring has 32 ticks with 4 long cardinals, the arrow pivots at the centre; the lid opens on hover **and** `:focus-visible` of a waypoint link (parity) and closes on leave/blur; aria-hidden |
| **J19** (v3) | Compass contrast | The arrow sits only on pirates canvas or deep (3.15 / 3.37 ≥ 3:1); 0 compass-red pixels on pirates raised |
| **J20** (v3) | Medallion and X | The medallion sweep runs once when step 3 becomes active (≤ 1.2 s; static moonlit state under R); exactly one X on the page (waypoint 4); the caption renders through `FilmQuote` and never sits beside a metric |
| **J21** (v3) | Cartouche | "THE CROSSING" is the act title in Pirata One (mode A, OFL subset, ≥ `title` size, brass 5.30); waypoint names and soundings stay Geist/Mono; ≤ 1 display face in the viewport |

## 7. Capture plan
`/lab/journey`, then `/`:
- **D:** p sweep (every 5%) plus the exact beat positions; a waypoint hover and a Tab walk; a throttled network run for the loading state.
- **M, RM, NJ and SD** frames.
- **Logs:** frame index, needle rotation, network, CLS.
- **Critics:** a voyage that honours the facts (fidelity) · no pirate kitsch (craft/legal) · a11y.

## 8. Adaptability
- Steps come from `journey[]`, so any count from 2 to 6 works: waypoints and beats re-space (frame beats at i/(n−1)).
- With JV missing, the `stills` behaviour applies (a crossfade at beats on `dur.preview`).
- Moving `journey` to another act swaps the `line` and `emphasis` slots. The instrument exists only in the `voyage` variant with the pirates slot; otherwise the chart strip draws the world's Line material and no needle.

## 9. FLAGS
F1 the sticky column top offset · F2 the instrument size (72 px) · F3 the frame count (72) vs 60 · F4 the kink geometry at step 3.
