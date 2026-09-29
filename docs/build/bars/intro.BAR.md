# BAR: Prologue — the Harry Potter play screen and the broom flight (N1)
> A new signature moment (SPEC §5, SM-1). BUILD-SPEC 2026-09-28. **v3 update (SPEC v2 / DESIGN v3):** the iconic override applies. The play screen shows the castle across the Black Lake, floating candles and a real-looking riderless broom (IN-01 and IN-01m are **accepted**); the oath line sits above Play; the credit line names four works; the flight weaves past the towers to the Black Pearl's lantern (the IN-02 route-A draft is in flight); `--intro-night` is `#020e1c`.
> **Binding:** SPEC v2 §5 (all of it), §9.4 (naming), §9.6 (copy statuses and the quote registry), §10.2 (icon map), §10.3 (the bolt-favicon egg), §13–§15. DESIGN v3 §1.1 (intro night `#020e1c`), §1.2 (Law 1), §2.2 (`epigraph`), §2.3 (type), §3.3 (intro layout), §5.1 (Lens *drawn-in* and *launch*), §5.2 (dome exit), §6.1 `intro.*` and `candle.*`, §6.5, §8.1 (icon style), §10 (intro dialog), §11.4 (the gating amendment), §11.6 (hard limits). MEDIA-PLAN v2 IN-01, IN-01m, IN-02. ICONS IC-HP-01…04, 10, 17.
> **Labels:** OBSERVED / CREATOR-DOCUMENTED / INFERRED / PROPOSED. **FLAG** = a value to tune by eye in `/lab`, recorded in DESIGN before the build.

## 1. Intent
A first-time visitor meets a crafted, candlelit play screen, not a loader: the castle on its crag across the Black Lake, floating candles, a real-looking riderless broom, and *I solemnly swear that I am up to no good.* above `[ ▶ Play ]`. Pressing Play starts a six-second chase behind the broom (between the towers, down through cloud, over the sea toward the Black Pearl's lantern) that lands exactly on the real page, where the name resolves in front of the sea. Declining costs one keystroke or one scroll. The page underneath was complete all along.

**Principles:**
- SYN #1 (one object: the Play control sits where the name will land)
- #5 continuity (the last frame *is* the hero)
- #6 one driver per motion (event → launch; clock → flight; time → landing)
- #9 anticipation then release (the motes gather, then stream)
- the counter-principle: nothing gates, native scroll, a real reduced-motion path

## 2. Reference frames (viewed for the prep bars; lock the quality, never copy)
| Frame | Lock | Do NOT copy |
|---|---|---|
| `research/refs/bruno/best/06-start-mid-disc-contracts.png` | A mark becomes the window onto the world: a small anticipation beat, then release (our bracket *launch*) | Bruno's **click-to-start gate with nothing behind it** (ours has the full SSR page beneath); `back.in` curves; the magenta lattice |
| `research/refs/lusion/custom/d-pct-025.png` | "Enter the object": the ground flips to near-black, the chrome stays quiet, one line of type plus one object | Lusion's `MIN_PRELOAD` loader gate (VER); 86 px uppercase captions |
| `research/refs/dennis/desktop-intro-12000ms.png` | The end state: the name in front of its subject (our landing frame) | Dennis's "Hello" preloader (a content gate, DESIGN §11.4) |

## 3. State machine
| State | Driver | What is true |
|---|---|---|
| **S-1 pre-paint** | the inline head script | Arms `html.intro-armed` only if **every** SPEC §5.1 condition holds; starts the 3000 ms failsafe. Otherwise nothing: the overlay stays `display:none` |
| **S0 armed** | first paint | `--color-intro-night` (`#020e1c`) ground; Meta `#intro-title` (`… IN FOUR ACTS`) + the four-work credit line; the oath (`FilmQuote`, `epigraph` rendition, credits attribution); `[ ▶ Play ]` (the bracket *drawn-in* on `easeDraw` .9 s, operable from frame 0); SKIP INTRO. `main`, header, footer and skip-link are `inert`. Focus → Play |
| **S0a plate** | `load` + idle → decode | IN-01 (or IN-01m: castle, lake, ≈ 22 candles, the broom) drawn into the canvas, fading in over `dur.preview`; ≤ 40 floating-candle sprites bob ±4 px; parallax ≤ 8 px on a fine pointer |
| **S0b intent** | Play hover **or** `:focus-visible` | 12 candle sprites gather from ~120 px to a ~72 px ring around the bracket over `dur.reveal` (never over the text block); the bracket goes aqua-bright (hover only) |
| **S0c rest** | arm + `intro.motesRestMs` (5000) | The canvas holds a static frame (0 rAF) until the next hover or focus |
| **S1 launch** | click / Enter / Space | The bracket halves travel to the viewport edges (`easeClip`/`dur.hero`); the text exits on `dur.base`; the motes stream out |
| **S1w waiting** | flight not playable at launch | LD-HP (`card`) appears after 250 ms with real `buffered/duration` and a visible `role="status"` "Loading the flight…". At 4000 ms → S2c |
| **S2 flight** | the video clock (IN-02, ≤ 6.0 s) | The canvas cuts to the video (first frame = IN-01): the broom weaves between the towers, dives through cloud, skims the crest and leaves toward the Pearl's lantern; the trail sprites follow `intro-trail.json` (≤ 48, τ 600 ms); the favicon shows the gold bolt (IC-HP-10); the overlay stays opaque |
| **S2c code flight** | fallback (mobile, low-power, video not ready) | The SVG broom (the same real-looking broom as IN-01, no lettering) along a bezier past the castle (1.6 s, `easeDraw`) + trail ≤ 24 → the dome exit at 1.2 s (0.6 s `easeClip`) |
| **S3 landing** | the last `intro.landing` (.62 s) | A left → right mask dissolves the overlay; the name zone clears first; the h1 is untouched |
| **S4 landed** | end | The overlay unmounts (canvas and video released). `inert` removed, `intro-seen=1`, focus → h1. The hero Lens is `open`, and MV-03 may start |
| **SX dismissed** | Skip / Esc / scroll intent / palette command | Opacity out on `dur.base`; video paused and removed; `intro-seen=1`; focus → h1; the page scrolls natively (no `preventDefault`) |
| **SH hidden tab** | `visibilitychange` | The video pauses; on return it resumes, or → SX if more than 30 s have passed |

## 4. Reduced motion · mobile · no-JS · Save-Data · `?skip` · deep links
| Condition | Behaviour |
|---|---|
| Reduced motion; Pause set this session; `?skip`; any `#hash`; Save-Data / 2G / 3G; `intro-seen=1`; the prologue disabled | **Never armed.** 0 overlay frames, 0 IN-01 or IN-02 requests. The hero runs the D3 aperture |
| No JS | Never armed (CSS default hidden). The SSR page is complete |
| < 1024, coarse pointer, or `hardwareConcurrency < 4` | The lite path: IN-01m still + code flight + dome exit, ≤ 2.4 s; **0 video requests** |
| `?intro=1` (QA) | Forces arming, except under reduced motion |

## 5. Keyboard · focus · ARIA
- The overlay is `role="dialog" aria-modal="true" aria-labelledby="intro-title" aria-describedby="intro-desc"`. `#intro-desc` is sr-only (SPEC §5.2).
- Play and Skip are native `<button>`s. The Play accessible name is "Play" (the bracket and icon are `aria-hidden`). Skip's name is "Skip intro".
- Tab cycles Play ↔ Skip only; Esc = Skip. There is no other focusable in the overlay, and the canvas and video are `aria-hidden` with `tabindex=-1`.
- The status region exists only in S1w. Nothing is `aria-live` otherwise.
- On exit, focus → the h1 (`tabindex="-1"`, `preventScroll`); `inert` is fully removed.

## 6. HARD pass/fail checks (binary; any FAIL blocks the ship)
Frames: **D** 1440×900 fine · **T** 1024×768 fine · **M** 390×844 touch · **R** reduced motion · **NJ** JS off · **SD** Save-Data stub.

| # | Check | Pass iff |
|---|---|---|
| I1 | SSR completeness | `curl /` contains the h1 === `site.name` and every enabled section's heading. `#intro` is in the HTML with the computed `display:none` when `html.intro-armed` is absent |
| I2 | No-JS | NJ at D and M: no overlay pixels; the h1 is visible in the 0 ms frame |
| I3 | Armed before paint | D fresh context: the first painted frame (trace screenshot) shows the intro ground, and **no** frame shows the hero before the overlay |
| I4 | Auto-skip matrix | For each of RM, `?skip`, `/#contact`, SD, `intro-seen=1`, `motion=paused`, prologue off: 0 overlay frames; 0 requests for IN-01, IN-01m or IN-02 |
| I5 | Failsafe | `/intro.js` blocked: `html.intro-armed` is removed within 3000 ms + 1 frame, and the h1 is visible and focusable content is reachable |
| I6 | Storage throws | `sessionStorage.getItem` stubbed to throw: never armed |
| I7 | Focus and inert | On arm, `activeElement` = Play. Ten Tabs cycle only Play/Skip. `main`, header and footer have `inert` during S0–S3 and none after S4/SX |
| I8 | Activation | Enter, Space and click each start S1 (3 separate runs) |
| I9 | Esc | Esc at S0 and at S2 mid-flight: content visible within 400 ms; the video is paused and removed from the DOM; `intro-seen="1"`; `activeElement` = h1 |
| I10 | Skip | Same as I9, via the button, at S0 and S2 |
| I11 | Scroll dismisses, never hijacks | A 100 px wheel at S0: dismissed within 400 ms, `scrollY` increased by 100 ± 2 (no `preventDefault`), and there is no scroll-lock style on html/body in any state |
| I12 | Timing | With the video ready: Play → S4 ≤ 7.0 s (performance marks). Video blocked: LD-HP visible at 250 ± 50 ms with `role=status` text; S2c starts ≤ 4050 ms; S4 ≤ 6.5 s |
| I13 | Registration | D and T: the last overlay frame vs the post-unmount hero screenshot with the h1 set `visibility:hidden`, SSIM ≥ 0.95 over the plate box |
| I14 | The name resolves first | At 25/50/75% of the landing: the mask coverage over the h1 rect is ≤ the coverage over the `focalBox`, and the h1 rect is fully clear by 60% of the landing |
| I15 | No light across the name | Trail sprite centres logged during the last 1.2 s are ≥ 24 px from the h1 rect (D, T). The overlay opacity is 1 over the h1 before S3 |
| I16 | Law 1 in the DOM | 0 overlay elements with `text-shadow`, glow `box-shadow`, `filter` animation or radial-gradient paint. The Play label computes to ink. At rest there is **exactly one** aqua mark group (the bracket); focus and hover are exempt |
| I17 | Type | Visible overlay text uses exactly {meta, epigraph, title} (the oath is the viewport's one italic). No display face on the play screen. The minimum font size is ≥ 13 px |
| I18 | Contrast | For each overlay text box (incl. the oath), the 95th-percentile luminance of the canvas pixels **and candle sprites** beneath it gives ≥ 4.5:1 with its colour (D, T, M); sprite rects never intersect text rects |
| I19 | Targets | Play and Skip ≥ 44 × 44 at D and M; the Play hit area covers the bracketed box |
| I20 | Candles rest | 5000 ms after arm with no input: 0 rAF callbacks over 1 s, and two canvas captures 500 ms apart are identical |
| I21 | Focus parity | Keyboard `:focus-visible` on Play: the mean candle radius around the bracket ≤ 80 px within `dur.reveal` + 100 ms (the same as hover) |
| I22 | One decoder, one canvas | During S2, `!paused` videos = 1 (IN-02). MV-03 fires no `playing` before S4. Live canvases ≤ 1 |
| I23 | LCP | Mobile lab (Lighthouse mobile), intro armed: the LCP element is the h1 or the MV-01 image, and LCP ≤ 2.5 s. It is never the overlay canvas or text |
| I24 | CLS | 0 layout-shift entries from load through S4/SX. `<main>` `offsetHeight` is identical with the intro armed vs `?skip` |
| I25 | Silent | IN-02 has 0 audio streams (ffprobe); `<video muted playsinline>`; no `AudioContext` constructed |
| I26 | Mobile lite | M: 0 video requests; the code flight plus dome exit reach S4 ≤ 2.4 s after Play; focus → h1 |
| I27 | Hidden tab | A dispatched `visibilitychange: hidden` in S2 → `video.paused` within 200 ms |
| I28 | Once per session | After S4, a reload in the same context shows 0 overlay frames; a new context arms |
| I29 | Flash safety | `/lab` 30 fps capture of S2: 0 general flashes and 0 red flashes by the MEDIA-PLAN §6.2 recipe |
| I30 | Legal (v3: hard limits + L2) | LEDGER shows **check L2** signed (Claude **and** Aryan) for IN-01, IN-01m and IN-02. Frames sampled every 0.5 s show **no rider, person, face, hand or character silhouette (H1)** and **no legible text, lettering on the broom, crest or logo (H2)**; the castle keeps its silhouette; the owl appears only if clean. The oath renders through `FilmQuote` and appears in the credits' `LINES QUOTED`. The quote lint is green. The page `<title>` and the static favicon stay name-first |
| I31 | Honest loading | In S1w, the LD-HP progress equals `buffered/duration` ± 2% at 5 samples; no percentage text is shown |
| I32 | Copy status | Every overlay string has `status` ∈ {proposed, confirmed}. The production build fails if `proposed` and not signed off |
| I33 | Replay | The palette "Watch the intro again" re-arms (not under R) and ends with focus on the h1 |
| **I34** (v3) | Bolt favicon egg | The favicon is the gold bolt only during S2/S2c and is `[AS]` again within 100 ms of S4/SX; never swapped under R (the intro never arms); no favicon request on `?skip` |
| **I35** (v3) | Night match | The CSS ground `#020e1c` is within ±4/channel of IN-01's corner patches (or the plate is graded to match); no visible seam when the plate fades in |
| **I36** (v3) | Credit line | The credit line equals `worksInUse` in act order (4 fields at default); disabling the rdr2 act removes "RED DEAD REDEMPTION 2"; it wraps only at `•` at 1024 |

## 7. Capture plan (after the build; `/lab/intro` first, then `/`)
- **Harness:** `research/build/bars/capture-intro.js` on `research/browser.js`. One browser, one context at a time. `page.clock.install()` for deterministic timing, where Motion's rAF allows it (INFERRED; verify).
- **Sequences:** D `S0` (0, 900, 5100 ms) → focus Play → `S0b` → Enter → `S1` (0, 425, 850 ms) → `S2` every 500 ms → `S3` (0, 155, 310, 465, 620 ms) → `S4`. Then repeat with the video route blocked (S1w, S2c). M: S0 → tap → S2c every 200 ms → S4. Esc, Skip and wheel runs at S0 and S2. The I4 matrix runs.
- **Logs:** performance marks, `activeElement` per step, `inert` attributes, trail JSON, network log, layout-shift, LCP entries, rAF counter.
- **Judging:** contact sheets (S0 → S4, and the landing quarter-steps); 3 critics (fidelity · craft/kitsch against DESIGN §11.5 · honesty/a11y/legal); ≤ 3 rounds.

## 8. Adaptability
- **Data only:** the controller reads `film.prologue` and `filmsInUse` (the credit line) from a serialized `<script type="application/json">`. There are 0 literal film titles in `intro.js`.
- **Changing the hero plate** triggers the validator warning, and the landing falls back to a crossfade (I13 is then waived; I14–I15 still apply).
- **`film.enabled=false` or `prologue.enabled=false`** → the overlay markup is not rendered at all.
- **Reordering acts:** the credit line re-derives. If the first act is not `pirates`, the warning fires and the landing crossfades.

## 9. Honesty and legal
- **v3 (iconic override):** the castle, lake, floating candles and a real-looking broom are wanted; the oath is a verbatim, attributed quote (`proposed` until Aryan signs). Still out: riders, people, faces, character silhouettes (H1); crests, logos, lettering on the broom, film stills or audio (H2).
- No fake waiting: the play screen is ready at once, and the loader appears only on a real unready state, with real progress.
- The content is never gated: SSR page beneath; Skip, Esc and scroll; auto-skips; failsafe.
- All other overlay copy is `proposed` microcopy about the page. Nothing in it is a claim about Aryan.

## 10. FLAGS
F1 the mote count and speeds · F2 the landing mask edge softness (a 12–20% gradient) · F3 the trail sprite decay τ · F4 the Play-block position at 1024 · F5 `intro.readyWaitMs` 4000 vs 3000 · F6 whether the four-work credit line wraps at 1024 (it wraps only at `•`) · F7 the oath's gap above Play (8–16 px) · F8 candle sprite sizes vs the plate's candles.
