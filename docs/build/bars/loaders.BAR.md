# BAR: The themed loader system — LD-PC · LD-3I · LD-RD · LD-HP (N2)
> A new system bar (SPEC §8). It covers the `WorldLoader` primitive and every **real** loading use. The **interstitial** use (act cards) is judged by `act-cards.BAR.md`, which must also pass L-checks L1–L10 below. BUILD-SPEC 2026-09-28: nothing is built.
> **v3 update (SPEC v2 §8 / DESIGN v3):** a fourth loader, **LD-RD "Plate & trail"** (rdr2); LD-PC is now **our recreation of Jack's compass with its red arrow** (the iconic override); the Writing route loader is LD-RD with a TIP; Act II route loaders may show "Aal izz well — still loading." after the 5 s idle freeze.
> **Binding:** SPEC v2 §8 (incl. §8.3 TIPS), §4 (the Line), §10.1. DESIGN v3 §1.2 (Law 1: loader sprites are *world media*), §1.3.3 (decorative inks incl. `--pir-compass-red` and the rdr2 inks), §2.1.1 (route-card lettering), §6.1 `loader.*`, `develop.*`, `ember.*`, `springNeedle`, `easeDraw`, `dur.flash`, §8.1 (icon style), §9 (`WorldLoader`, `Instrument`, `Gauge`, `Tintype`, `GraphiteStroke`, `Campfire`), §10 (loaders), §11.6 (hard limits).
> **Labels** as in the other bars. **FLAG** = tune in `/lab`.

## 1. Intent
Each world has one original loader that *is* its film's verb:
- **Pirates navigates:** a needle hunts and then commits to a bearing, while a course line plots.
- **3 Idiots explains:** a gear train that turns exactly as much as the progress it reports. It is an honest mechanism.
- **RDR2 reflects:** a tintype plate develops while a pencil trail runs to a campfire; the image developing *is* the progress (RD-P4).
- **Harry Potter reveals:** a point of light travels the Line, and ink and floating candles appear behind it.

Real loaders show real progress (or an honest indeterminate state) and never cover readable content. The same motifs, driven by scroll, become the act cards' loading reels.

## 2. Reference (qualities to lock; never copy)
| Source | Lock | Do NOT copy |
|---|---|---|
| KIMI Part V PC-01 (the compass spring), 3I-04 (the gear pair), HP-01/HP-02 (ink draw, point lights); ICONS IC-PC-02, IC-RD-08; STUDY R-2, R-6 | Hunt-and-settle as an underdamped spring; a 12T/8T mesh at a true 3:2; reveal-as-propagation; develop-as-progress | An **ember** arrow (ember = killed: the arrow is `--pir-compass-red`, a darker red); any compass dial **traced from a prop photo**; a gear-pattern background; Lee Martin's tintype sprite sheet (we write our own mask) |
| `research/refs/lusion/…` loader (VER in NOTES: `MIN_PRELOAD 1 s`, a loader that never completed in ~10 attempts) | — | **Everything:** a loader that gates content, a minimum display time, fake percentages |

## 3. The primitive `WorldLoader` (`world`, `size`, `mode`, `progress`)
| Loader | Parts (all aria-hidden SVG + pre-rendered sprites; no text inside) | `determinate` mapping | `indeterminate` | `complete` | `static` (RM/NJ) |
|---|---|---|---|---|---|
| **LD-PC (Jack's compass)** | Lidded octagon (`--w-brass` 1.5 px); 32-point ring (`--w-moon`, 4 long cardinals, a fleur-de-lis north); **the red arrow** (`--pir-compass-red #a8453a`, brass pivot); dashed course (`--w-brass` 6/6) | Course `pathLength = progress` (direct). The needle heads toward the course tangent on `springNeedle` | The needle hunts ±35° around the heading, re-excited every `needleReexciteMs` (1800). **It stops at 5 s** in parallel contexts | Settles on the final bearing (`springNeedle`), then a single `dur.flash` moon-white tip flash (area < 0.1% of the viewport) | Course drawn; needle at bearing; no flash |
| **LD-3I** | 12T drive gear + 8T driven gear (`--w-bp-line` strokes), meshing at 3:2; a pinion on the 8T; a rack pointer on a dimension line with 0/end + 10 minor ticks; optional `--bp-panel` ground | Rack x = progress × L; θ₈ = x / r_pinion; θ₁₂ = −θ₈ × 8/12 (**exact**) | Gears turn at `gaugeIdleDegPerS` (30°/s) **with the rack parked** at 0; stops at 5 s in parallel contexts | A chalk circle (`--w-chalk`, `chalkRough`) around the end tick, `easeDraw` .7 s; the gear-teeth nudge on `springPlayful` | Rack at the end; circle drawn |
| **LD-RD** (v3) | A tintype plate (6 px radius, `--w-bone` hairline, inset vignette; R-2); a graphite trail (`--w-pencil`) over 6 hachure arcs across the plate's lower third; a campfire point (R-6, ≤ 12 sprites). `mini` = trail + fire only | `trail.pathLength = progress` **and** the develop threshold = progress (direct) | The plate breathes 10% ↔ 22% developed at 0.4 Hz; the trail parked at 12%; the pencil-tip dot ticks every 0.6 s; **stops at 5 s** in parallel contexts | Fully developed; the bone border draws (0.5 s); the fire kindles (3 frames, no flash) | Developed plate, trail drawn, fire lit (static frame) |
| **LD-HP** | `LINE_D` at `--w-ink-contour` 35%; one cool light sprite (`--w-lumos` core); floating-candle sprites (`--w-flame-*`) | The light at `pathLength = progress`. Ink behind it at 100%. A warm point lights at every ⅛ (cards: 32–40 points) | The light breathes at the start (opacity .6 ↔ 1 at 0.5 Hz); the first 12% of ink is drawn; stops at 5 s in parallel contexts | All points lit; the light becomes the last warm point | Ink drawn; points lit; light at the end |

Sizes: `mini` 48 px · `card` 96–120 px (motif) · `route` 160 px. Loader sprites are the only DOM-hosted luminous paint on the page (DESIGN §1.2.4c).

## 4. Real-loading uses (SPEC §8.1)
| Use | Loader | Shown when | Text alternative |
|---|---|---|---|
| Intro flight not ready | LD-HP card | 250 ms after Play if `readyState < 4`; hidden at play or at the 4 s fallback | Visible Meta `role="status"`: "Loading the flight…" |
| Journey sequence decoding | LD-PC mini, frame corner | 400 ms after the section is within 1 viewport and not all 72 frames are decoded; hidden on completion | none (the step still and captions carry the content) |
| World MediaFrame pending | the world's loader, mini, centred in the empty reserved box | 400 ms after mount if the poster hasn't decoded | none (the media is decorative) |
| Route `app/writing/[slug]/loading.tsx` | `worldOf(writing)` = rdr2 → **LD-RD `route`**, with the act's title lettering above it | Next Suspense fallback | Visible `role="status"`: "Loading essay…"; one **TIP** (SPEC §8.3, deterministic by pathname) as plain text **outside** the status |
| Route chapter detail (if added; Act II) | LD-3I `route` | Next Suspense fallback | Visible `role="status"`: "Loading chapter…"; after the 5 s idle freeze it updates once to "Aal izz well — still loading." (Q-3I-1; real loads only; never on an error) |

## 5. Reduced motion · mobile · no-JS · Save-Data
- **RM / Pause:** `static` mode everywhere. The flight loader never appears, because the intro never arms. Route loaders show the static motif plus the status text.
- **Mobile:** the same modes, at `mini` or `route` sizes; ≤ 24 sprites.
- **No JS:** route loaders never render (the SSR page arrives whole). The card motifs ship SSR in the `complete` state.
- **Save-Data:** the same. No sequence, so no Journey loader.

## 6. Keyboard · focus · ARIA
- The loader graphics are `aria-hidden`, `focusable="false"` and never tab stops.
- A real loader pairs with a **visible** text status in `role="status"` (polite). Media and mini loaders carry no status (they are decorative).
- Interstitial motifs **never** carry `role="status"` or the word "loading" (checked in the act-cards bar).

## 7. HARD pass/fail checks
| # | Check | Pass iff |
|---|---|---|
| L1 | Truthful LD-3I kinematics | For progress ∈ {0, .25, .5, .75, 1}: the rack x = p·L ± 0.5 px; the 8T rotation = x / r_pinion ± 0.5°; the 12T rotation = −⅔ × the 8T ± 0.5°. The gears never turn while determinate progress is unchanged |
| L2 | Determinate mapping | LD-PC course and LD-HP light `pathLength` = progress ± 0.01 at 5 samples (direct; no spring on the progress value) |
| L3 | Needle physics | LD-PC complete: the needle reaches its bearing ± 1° within 900 ms, overshoot ≤ 16% (the `springNeedle` CALC is 13.3%), and **no ember** anywhere in the loader |
| L4 | Idle stop | Any loader in a parallel context: 0 rAF callbacks and 0 running `getAnimations()` after `idleStopMs` (5000) + 100 ms |
| L5 | No flashing | Frame-diff capture at 30 fps: ≤ 1 flash event per completion, area < 0.1% of the viewport, and never repeated within 1 s |
| L6 | Law 1 | Loader luminous points are `<img>`/canvas sprites of pre-rendered PNGs. 0 CSS `box-shadow`, `text-shadow`, `filter: blur/drop-shadow` or radial-gradient paint on loader DOM |
| L7 | No text inside | 0 `<text>` in loader SVG; 0 glyphs in the sprites |
| L8 | Contrast (non-text) | The meaningful strokes (arrow, course, rack, trail, ink) are ≥ 3:1 against their ground: compass red 3.15 (pirates canvas) / 3.37 (pirates deep) and **never on pirates raised (2.83)**, brass 5.30, bp-line 11.24 on the panel, pencil 6.66 (rd canvas) / 6.98 (rd deep), bone 14.04, ink-contour 8.94 (DESIGN v3 §1.3.3 CALC) |
| L9 | World-correct | For each world, the rendered loader kind = `worlds[world].slots.loader` (moving a section re-derives it; fixture B) |
| L10 | Static fidelity | The RM and NJ frames show the `complete`/static composition exactly (pixel diff ≤ 0.5% vs the golden image) |
| L11 | Delay | A fast load (decode < 250/400 ms) → 0 loader frames |
| L12 | Real progress | Intro: displayed progress = `buffered/duration` ± 2%. Journey: = decoded/72 ± 1 frame. Never a percentage string |
| L13 | Never covers content | A loader rect intersects no text rect; mini loaders sit only inside empty reserved media boxes |
| L14 | Status text | Real loaders: a visible text node inside `role="status"`, ≥ 13 px, contrast ≥ 4.5:1. Removed when loading ends |
| L15 | Route loader | `app/writing/[slug]/loading.tsx` renders **LD-RD** (as `writing` is rdr2) with "Loading essay…" and one TIP outside the status. With `writing` moved to act-4 it renders LD-HP (fixture J); moved to act-2, the idiots gauge |
| L16 | Perf | Loader JS ≤ 4 KB gz per world (code-split); ≤ 40 sprites; DPR ≤ 2; paused offscreen and on hidden tabs |
| L17 | Tokens only | 0 raw hex, rgba or px in `components/primitives/WorldLoader*` |
| **L18** (v3) | Honest development (LD-RD) | For progress ∈ {0, .25, .5, .75, 1}: the develop mask threshold = progress ± 0.02 and the trail `pathLength` = progress ± 0.01; the plate never "completes" before progress = 1 |
| **L19** (v3) | TIPS | Every tip shown is a `confirmed` string byte-equal to its `content.ts` source, or a registered `proposed` edit; the choice is `hash(pathname) % n` (identical SSR and client; 0 hydration warnings); no film or game line is ever a tip; the tip is never inside `role="status"` |
| **L20** (v3) | Aal izz well | The stall text appears only on a real Act II route load after 5000 ms, once; never on an error or a failed fetch; never on a scroll interstitial |
| **L21** (v3) | Icon hard limits | LD-PC's compass is our geometry (no traced dial); LD-RD shows no person, rider, gun or logo; LD-HP shows candles, never a wand (only its light) |

## 8. Capture plan
- **`/lab/loaders`:** a fixture grid of **4** worlds × 3 sizes × 4 modes, with a `?progress=` slider and throttled network presets for the real-use cases.
- **Recording:** 30 fps for L3, L4 and L5.
- **Logs:** SVG transform attributes for L1–L2 and the network plus `readyState` for L12.
- **Critics:** fidelity · craft (instrument, not toy; no kitsch) · honesty (no fake waiting) and a11y.

## 9. Adaptability
- A world's loader is a slot (`worlds[id].slots.loader`), so a new film supplies its own or uses `plain` (a Meta status line only).
- `film.enabled=false` → every loader is `plain`.
- Loaders take `progress` as a number and know nothing about sections.

## 10. Honesty and legal
- **v3 (iconic override):** LD-PC **is** Jack's compass, recreated by us from public-domain compass conventions (a lidded octagon, a 32-point ring, a fleur-de-lis, the red arrow). It is never traced from a prop photo or a still (H2).
- The gears are generic 12T/8T outlines in the jugaad register. The tintype mask and the campfire are our own code (not Lee Martin's sprite sheet, not game assets).
- The Line is our own path; the light is a sprite. Spell words may appear in identifiers and aliases (v3), but functional labels stay literal.
- Loaders never claim to load anything that isn't loading. Tips are Aryan's rules, not the game's.

## 11. FLAGS
F1 needle hunt amplitude (±35°) · F2 gear radii at `mini` · F3 LD-HP breathe rate · F4 the `route` letterbox size below 640 · F5 whether `mini` shows at all below 640 · F6 the LD-RD develop breathe range (10–22%) · F7 whether the compass lid opens in LD-PC `card` size.
