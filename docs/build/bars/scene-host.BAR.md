# BAR: `scene` host — world-aware (film · sequence · seam · stills · title-card)
> **v3 deltas (SPEC v2, 2026-09-28):** a fifth world key, `rdr2` (deep `#0a0605`), joins the grounds; scenes in rdr2 use the graphite Line and the golden-hour/fire warm families. Scene captions may name works and quote lines (SPEC §9.4; quotes only via `FilmQuote`). H24 is updated to the hard limits and check L2.
> Adapted from `prep/bars/scene-host.BAR.md`. The generic host for any future cinematic `scene` placed by the manifest. The act cards are **not** scenes (they have their own bars), but they share the IceCut and letterbox primitives, and **scenes + long cards ≤ 2** page-wide (DESIGN §6.4). The Journey sequence uses the same frame-index machinery (`journey-voyage.BAR.md`). BUILD-SPEC 2026-09-28.
> **Binding:** SPEC §9.2–§9.3 (letterbox rules), §12. DESIGN v2 §1.2 (Law 1), §1.3 (world deep grounds), §3.3 (letterbox), §6 (budgets: mobile 0 travel), §7, §9, §10, §11.5.

## 1. Intent
A `scene` is a short change of place: the page steps onto its world's `deep` ground, one framed object carries 1–6 beats with real HTML captions, then the page goes back to reading. It never hides text, never hijacks the scroll, never depends on its neighbours, and **never mixes worlds**: a scene takes the world of its act.

**Principles:** SYN #10 · #6 (the frame follows the scroll; the clip follows the clock) · #1 · #3 · the counter-principle.

## 2. Benchmark frames (v1)
| Frame | Lock | Do NOT copy |
|---|---|---|
| `research/refs/lusion/custom/d-morph-1350-a.png` | The split: the geometry is a function of scroll; the clip runs on its own clock | `+` rows; "PLAY REEL" over video; the auto-scroll assist |
| `research/refs/lusion/custom/d-pct-025.png` | Enter the object: near-black, quiet chrome, one line over one object | 86 px uppercase; glow halo; a person |
| `research/refs/igloo/custom/journey/j202-project-click-1s.png` | The place change by ground tone | Frost/CA; blur animation; canvas text |

## 3. State machine (v1, plus the world)
- **The ground:** `SectionFrame` sets `data-tone="deep"` and `data-world=worldOf(scene)`, so `--bg` is that world's deep (pirates `#050b0d`, idiots `#060a09`, hp `#070504`, house `#05080a`). The auto dome seam applies only when no act card is adjacent.
- **States:** pre (SSR poster, `preload="none"` until within 1 viewport) → entry (R2 clip `inset(8% round frame)` → 0; beat-1 caption R1) → mid (pinned ≤ 30vh; the variant driver) → settled → exit/reverse.

| Variant | Mid driver | Settled |
|---|---|---|
| `film` | Time inside the R2 frame; play at ≥ .5 visible, pause below .25 | The held last frame or poster; never `currentTime` scrubbing |
| `sequence` | R2 frame index `round(p × (N−1))`, N 48–72, canvas; ≥ 1024 and fine pointer only; **the canvas singleton** | The last frame |
| `seam` | `IceCut` (shared with Card I→II); the aqua line only for .1 < p < .9 | The incoming still |
| `stills` | R2 picks the beat; the swap runs on `dur.preview` | The last still |
| `title-card` | R1 only | Static |

- **Letterbox** (≥ 640): 2.39:1, the ground is the bars, captions in the lower bar (`lead`); below 640, off.
- **v2 media rule:** scene media must belong to the scene's world (a validator warning otherwise). Glow lives only in the media (Law 1).

## 4. Reduced motion · 390 / touch · no-JS · Save-Data (v2: mobile travel is 0)
- **RM / Pause:** the static composition: poster, captions as an `<ol>`, `summary`; no spacer; no video or sequence request.
- **< 640 / coarse:** the static composition, with R1 allowed. `film` gets an opt-in `PLAY FILM` Meta button ≥ 44 px. **`seam` gets no pin and no scrub on mobile** (v2 resolves the v1 F5 conflict: 0 mobile travel page-wide).
- **No JS:** SSR static composition.
- **Save-Data:** stills only.

## 5. Keyboard · focus · ARIA (v1)
- `<section aria-labelledby>`; the visuals in a `<figure>` with `summary`.
- The video is muted, `aria-hidden`, no controls, 0 audio.
- The captions are one ordered list; non-current beats are visually hidden, never `aria-hidden`.
- 0 or 1 tab stops; the header waveform pauses a film longer than 5 s.

## 6. HARD pass/fail checks (v1 H1–H21, with v2 edits marked)
| # | Pass iff |
|---|---|
| H1 | The hero h1 is visible in the 0 ms frame (context `?skip`); 0 scene-media requests before the lookahead |
| H2 | All captions and `summary` in the server HTML; no hidden text outside `html.motion-ok` |
| H3 | Parked captions have opacity exactly 1 or are sr-only |
| H4 | `film` split proof: the bbox is equal ±1 px, and `currentTime` advanced ≥ 2 s over 3 s |
| H5 | Other variants: 0 changed px over a 3 s park; reverse-mid equals mid |
| H6 | Native scroll: no hidden overflow or snap; a 300 px wheel moves 300 ± 2 |
| H7 (v2) | Travel ≤ 0.30 × innerHeight at ≥ 1024 fine only; **= 0 below 640**, under RM and with no JS; the page total, including the long cards, ≤ 150vh |
| H8 | ≤ 1 playing video page-wide (DecoderLock); paused offscreen and on hidden tabs |
| H9 | 0 DOM aqua at rest (except the `seam` line window); viewport total ≤ 1 |
| H10 | ≤ 3 styles; captions in one step; ≥ 13 px; uppercase only in Meta |
| H11 | No clipping at 320, 390, 1024 or 1440 |
| H12 | Caption rects ∩ video or canvas rects = ∅ |
| H13 (v2) | Captions ≥ 4.5:1 on the **world** deep (DESIGN §1.3.1; every world's deep passes: ink ≥ 16.76, stone ≥ 8.85, muted ≥ 5.73) |
| H14 | CLS = 0; the height is stable through `playing` |
| H15 | Media opacity 1; no scrim beyond the feather; no filter transitions; no DOM glow |
| H16 | 0 infinite CSS animations; 0 offscreen rAF |
| H17 | RM: the static composition, 0 media requests |
| H18 | Save-Data: 0 video or sequence requests. No-JS: all captions and the summary visible |
| H19 | The header toggle pauses a film within 200 ms, Δ scrollY 0 |
| H20 | 0–1 tab stops; ring visible; target ≥ 44 |
| H21 | Every caption digit string occurs in `content.ts`; the authentic-provenance rule holds |
| **H22** (v2) | World purity: the scene's media `provenance.world` = `worldOf(scene)`, or the validator warning is logged. No second ambient light system in the viewport (canvas singleton plus decoder) |
| **H23** (v2) | Budget: scenes + long cards ≤ 2 page-wide (validator) |
| **H24** (v3) | Legal: every scene asset **check-L2**-signed (no people, riders or marks; our composition); work names in captions in house type only; any quoted line through `FilmQuote` with attribution |

## 7. Capture plan (v1)
- `/lab/scene?fixture=A–E&skip` with legacy assets (0 credits).
- Frames per variant: pre, entry, mid, mid+3s, settled, exit and reverse; plus 390, 320, 1024, RM, SD, NJ and keyboard.
- **v2:** add fixture W (a scene placed in each of the three acts) for H13 and H22.

## 8. Adaptability (v1)
- Data only; seams from `SectionFrame`; the reorder fixtures A–E; the v1 validator rules (≤ 2 scenes, beats increasing, media counts per variant, variant ↔ driver, a non-empty `summary`, caption length) **plus** `scenes + longCards ≤ 2` and world purity.

## 9. Honesty (v1)
- Captions state only sourced facts; metrics are never animated or used as captions.
- Generated media is abstract, decorative and provenance-complete; authentic media depicts Aryan.
- The §2 exclusions are respected; the driver is described honestly ("time-driven film", never "scroll-scrubbed video").
