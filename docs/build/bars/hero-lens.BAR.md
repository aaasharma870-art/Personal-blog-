# BAR: Hero — the name in front of the night sea + the bracket + media-only velocity (cold open)
> **v3 deltas (SPEC v2 §6 / DESIGN v3 / MEDIA-PLAN v2, 2026-09-28):** MV-01 is **accepted** and carries **the Black Pearl** (IC-PC-01): a tiny black-sailed silhouette on the horizon whose stern lantern at (0.893, 0.419) is the plate's one warm pixel. The measured focalBox is x 0.49–0.96, y 0.46–0.60 (the bracket halves stop at 0.96). MV-03 keeps the Pearl in place. H24 and H27 are updated below; H29–H30 are new. Legal checks use **check L2** and the hard limits (DESIGN v3 §11.6), not the retired check L.
> Adapted from `prep/bars/hero-lens.BAR.md` for SPEC §6 (SM-2). The sculpture is replaced by the **MV-01 sea plate**, and the bracket aperture now runs **only when the intro didn't play**. BUILD-SPEC 2026-09-28.
> **Binding:** SPEC §5.5 (registration), §6, §11. DESIGN v2 §1.2, §1.3.1 (pirates deep), §2.2–§2.3, §3.3 (the hero row), §5.1 (Lens uses ①/②), §6.3, §6.5, §7, §10, §11. MEDIA-PLAN M-01, MV-01, MV-02, MV-03. `intro.BAR.md` I13–I15 (the landing).

## 1. Intent
At first paint the reader sees "Aryan Sharma" at `display` scale standing in front of the dark tail of one long glowing wave, with one tiny warm light far out on the horizon. The bracket frames the wave: the thing in focus. The sea turns to spray only while the reader hurries, then clears when they stop. The film has titled itself.

**Principles:** SYN #1 · #2 (158 : 13 ≈ 12:1) · #3 (the bracket is the one aqua; the wave's aqua is media) · #4 · #5 (the intro's last frame = this plate) · #6 · the counter-principle.

## 2. Benchmark frames (lock the quality; never copy)
| Frame | Lock | Do NOT copy |
|---|---|---|
| `research/refs/dennis/desktop-intro-12000ms.png` | **Depth by overlap:** the name passes in front of the subject's calm part while the focal point stays clear | The cropped marquee; low contrast; a real person; the preloader |
| `research/refs/obys/custom/g-05-hover-mid.png` | The clip opens from a slit, with the bracket halves riding the clip edges; the only colour is inside the lens | Filled half-moons; opening in both axes; 11 px type |
| `research/refs/igloo/custom/journey/j010-sigA-after-wheel.png` | Same position, only velocity differs; clarity is the reward for stopping | Any effect over text; full-spectrum CA |

## 3. State machine
**Planes, back → front:**
1. `MediaFrame`: full-bleed 16:9 `cover` plate, `100svh` at ≥ 1024, holding MV-01 → MV-03, the feather ≤ 35%, and `VelocityNoise` plus the wake layer inside its clip
2. `Lens`, resting on `media.focalBox`
3. the text column (h1, lead, Meta, CTA)
4. the header (z 40)

| State | Driver | What is true |
|---|---|---|
| **S0 first paint** | SSR + the head script | h1 `display`, lead, identity Meta, CTA: final, never hidden. `html.aperture-pending` **only if** motion-ok AND no session flag AND not Save-Data AND **the intro is not armed**: the media is clipped `inset(0 30% 0 70%)` (a slit at focal x) and the Lens is closed at the focal point. Otherwise the Lens is **open** |
| **S0i intro landed** | `intro` S4 | The Lens is `open` at the `focalBox`; there is no aperture; MV-03 may start |
| **S1 opening** | `poster.decode()` | The clip → `inset(0)`; the halves ride the clip edges and **stop at the `focalBox`** (x ≈ 46% / 94%, y ≈ 30–75%), on `easeClip`/`dur.hero`. The session flag is set in try/catch |
| S1′ timeout | decode reject, or `apertureTimeoutMs` 1200 | Jump to S2 |
| **S2 settled** | — | The Lens around the crest = the one aqua. MV-03 crossfades in on `playing` (desktop, fine pointer, no SD, overlay unmounted) over `dur.preview` |
| **S3 moving** | R3 · \|v\| | Grain ≤ .10 and chroma ≤ 2 px on media; the **wake layer brightness ≤ +15%**; decays on `springSoft`. Text styles never change |
| S3p pointer | R3 · fine pointer | Media shift ≤ 6 px, reset on leave |
| **S4 exit** | R2 · hero progress | 0–.2 scale 1.03 · .2–.7 1.08 and y −24 px (text ≤ −16 px) · .7–1 darken. 0 vh spacer |
| S5 offscreen | IO / visibility | The video paused; noise inactive; returning never replays S1 |

## 4. Reduced motion · 390 · no JS · Save-Data · `?skip`
| Condition | Behaviour |
|---|---|
| RM / Pause | S2 from first paint; poster only (**no video request**); no noise, shift or exit transforms |
| 390 / coarse | Content height: name → lead → Meta → CTA → MV-02 (4:5), no overlap. The aperture runs on MV-02's decode when ≥ 50% is in view. Noise and shift are off. Stills only |
| No JS | Open, poster only; the CTA is a plain link |
| Save-Data | Stills; no aperture; no grain request |
| `?skip` | S2 immediately |

## 5. Keyboard · focus · ARIA
- One `<h1>`: two spans with a real space; the accessible name = `site.name`. `tabindex="-1"` (the intro's landing target only; no focus ring drawn on this non-interactive target).
- **Exactly one tab stop:** the CTA `<a href="#work">`, ≥ 44 px, `:focus-visible` = a 2 px aqua outline, never clipped.
- Media, Lens, grain, wake and video are `aria-hidden`. WCAG 2.2.2: the header waveform pauses MV-03.

## 6. HARD pass/fail checks (the v1 H1–H23, adapted, plus new ones)
| # | Check | Pass iff |
|---|---|---|
| H1 | Name at first paint | Prehydration and JS-off frames at D, M and R, **with the intro not armed** (`?skip`): the h1 is in the viewport, opacity 1, no filter or transform, text = `site.name`. With the intro armed, the h1 is in the DOM at first paint and the intro BAR governs visibility |
| H2 | SSR clean | No hero text node or ancestor with `opacity:0` or `blur(` in the server HTML |
| H3 | Nothing clipped | At D, M, 1024 and 320: all hero text within the gutters; `scrollWidth === clientWidth`; page `scrollWidth === innerWidth` |
| H4 | Line collision | The "y" of Aryan and the "S" of Sharma share no ink pixel (else line-height .92) |
| H5 | ≤ 3 styles | Visible text = {display, lead, meta}, header included (the act label is empty at the top) |
| H6 | Aqua once | At D and M settled, pointer parked, focus on body: the aqua DOM/SVG elements = the Lens only. The wave's aqua pixels are exempt (media). No nav dot at scroll 0 |
| H7 | Overlap geometry | D: the h1 right edge falls inside the plate's **calm band** (x 36–52% of the plate as rendered); the h1 rect ∩ the `focalBox` = ∅; the Lens `[` is ≥ 16 px right of the h1 rect. M: h1 ∩ media = ∅ |
| H8 | Name contrast over media | With the h1 hidden, the 95th-percentile luminance of the plate pixels under the h1 box gives ink ≥ 4.5:1 (target) and ≥ 3:1 (floor, large text), at rest and at peak noise. No scrim |
| H9 | No layout shift | CLS = 0 from load to +3 s, including S1, the poster → video swap, the font swap and the intro unmount |
| H10 | Aperture order | Only in no-intro contexts: the clip is monotonic from slit → open; the halves stay within 1 px of the clip edges until they reach the `focalBox`, then stop; the text is static |
| H11 | Aperture timing | `dur.hero` + `easeClip` (`getAnimations()`) |
| H12 | Once per session | The same context reload → open at frame 0; a new context (`?skip`-free, intro disabled) → S1 plays |
| H13 | Never gates | The poster request held → open at 1200 ms; name and CTA visible throughout |
| H14 | Noise and wake on media only | In a fling frame, the grain, chroma and wake nodes are descendants of `MediaFrame`, below the h1; text styles equal the rest state |
| H15 | Bounds | Grain ≤ .10; offset ≤ 2 px; wake brightness ≤ 1.15 |
| H16 | Clear at rest | +1500 ms after scroll: `--vn` < .005; grain 0; offset 0; wake 1.0 |
| H17 | Off where required | M, R and SD: `--vn` stays 0; R and SD make no `.mp4` or grain request |
| H18 | RM frame | The S2 state, no `<video>`, and an identity transform after a pointer sweep and a scroll to .5 |
| H19 | Pointer shift | ≤ 6 px; back to 0 after leave |
| H20 | Exit table | Scale 1.03 → 1.08 (± .005); media y −24 ± 1 at .7; text y ≥ −16 |
| H21 | One CTA | CTA above the fold at D and M; exactly 1 focusable in the hero; ≤ 2 pills; `href` resolves |
| H22 | Media is imagery | Media opacity 1; only the feather; no radial, glow or text-shadow in the DOM |
| H23 | 390 order | name → lead → Meta → CTA → MV-02; the Meta wraps only at `•`; "Sharma" fits 343 px (278 at 320) |
| **H24** (v3) | The lantern foreshadow | MV-01 contains exactly one warm blob, **the Pearl's stern lantern**, at x 86–90% on the horizon (measured 0.893, 0.419; 0.001%), with no other warm pixels |
| **H25** (v2) | Intro interplay | After the intro's S4: the Lens is `open` at the `focalBox` with no S1 animation (0 aperture animations); MV-03's `playing` happens only after the overlay unmounts; one decoder |
| **H26** (v2) | Registration box | At ≥ 1024: the hero section height = `innerHeight` ± 1 px, and the `MediaFrame` box = the viewport box at scroll 0 (the intro's I13 relies on it) |
| **H27** (v3) | No work names on screen one by default | With `film.heroCredit=false`: 0 work titles in the hero viewport (header included). With `true`: exactly one Meta credit line (`IN FOUR ACTS • AFTER THREE FILMS AND A GAME`), still ≤ 3 styles |
| **H28** (v2) | Line provenance | `LINE_D` exists and its fit overlay against MV-01 is archived (`masters/MV-01/line-fit.png`); the Line is not drawn in the hero DOM |
| **H29** (v3) | The Pearl stays a discovery | The ship silhouette is ≤ 7% of plate width, sits outside the bracket's focalBox and ≥ 16 px from the h1 rect at D and T; no crew, no legible flag or hull lettering at full resolution (H1/H2); MV-03 moves it ≤ 2 px and its lantern ≤ 5% luminance |
| **H30** (v3) | Check L2 | MV-01, MV-02 and MV-03 are check-L2-signed by Claude **and** Aryan in the LEDGER (Claude signed MV-01/MV-02 on 2026-09-28; Aryan pending) |

## 7. Capture plan
The v1 plan (D, M, R, NJ, SD; the prehydration, reload, timeout, pointer, velocity and exit sets), run twice:
- (a) with `?skip` (no-intro aperture path)
- (b) after an intro landing (S0i path; H25–H26)

Output to `research/build/bars/frames/hero-lens/<sha>/`. Three critics, ≤ 3 rounds.

## 8. Adaptability
- Data only: `entry.props` plus `site.*`. A grep of `components/sections/hero/**` finds 0 hits for names, film titles, ids, paths or raw values.
- `media` via `resolveMedia`: with MV-01 `planned`, the legacy plate shows with the same aperture.
- Changing the hero world (acts reordered) swaps the plate through `worlds[first].media.plate`, with a validator warning for the prologue.

## 9. Honesty
- The text is verbatim `site.*`, and there are no numbers in the hero. MV-01/02/03 are `higgsfield`, decorative and check-L2-signed; the sea (and the Pearl) is our recreation, not evidence.
- The wave never encodes data. The name is never crossed by light.
