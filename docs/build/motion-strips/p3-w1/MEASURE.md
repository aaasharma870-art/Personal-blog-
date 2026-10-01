# P3 W1 gate: measurements (plan §10.1 #5, §10.2 W1)

2026-10-01. Headless Chromium, 4 CPUs, SwiftShader.

**Verdict: the W1 gate is NOT met.** Do not tick P3-2, P3-3 or P3-4 yet. The failures:
- first-load bundle size;
- warm-up and intro LoAFs;
- intro hand-off timing;
- a principles raster stall at 1440;
- three items inherited from before Phase 3 that the gate now covers.

## 0. What was measured

**The commit is not green.** `4f4f7ef` swept in in-progress W2-SOUND and W2-GL files: `lib/audio/*` and `lib/gl/*`, saved after the integrator's 12:20 build and before the 12:23 commit. At `4f4f7ef`:
- `tsc` fails: `lib/audio/store.ts:56` TS2339, so `next build` fails too;
- `npm run check` fails: validator #10, `lib/gl/types.ts` uses a world display face.

W2-SOUND's working copy already has the `store.ts` fix.

**The build I measured** is a clean worktree of `4f4f7ef` at `scratchpad/p3-w1` with two local changes:
- the one-line `store.ts` type cast;
- the `beats --write` estVh values (§2).

The rebuild is green. `check` fails only on the #10 `lib/gl/types.ts` error.

**Servers (still running):**
- **:3161** = the W1 worktree build. `next-server` PID **32690** (npm 32674).
- **:3162** = the base at 5aa4587. PID **11669** (npm 11623).
- Do not use `serve.sh after`: it serves the repo's stale `.next`.

**Machine drift:** the base build runs at about 55–75 % of its P3-0 speed today (desktop 8.6 against 15.2 fps). So I give motion numbers against both the P3-0 targets and a base run from this session.

## 1. Probes

The suite runner crashed: an unhandled rejection in `decoder.mjs` after the 120 s timeout. I re-ran each probe with `--only=<p> --timeout=900000`.
- Raw JSON: `probes-1440/`, `probes-1024/`.
- Fixed-probe re-runs: `*/patched/`, `probes-1440/rerun/`.

| probe | raw 1440 / 1024 | verdict | evidence |
|---|---|---|---|
| aa-scrim | FAIL / FAIL | **PASS** | The bearings at ratio 1 are a probe artifact (`transition-colors`). With `transition:none` added, about and credits pass: 590 boxes. |
| bundle | FAIL / FAIL | **FAIL** | JS **+25 822 B gz** (budget 6 144); CSS +3 022 B ✓; gsap/lenis lazy ✓ (50 KB gz). Raw `requestIdleCallback` at `components/intro/controller.js:328`. |
| decoder | pass / FAIL | **FAIL (1024)** | ≤ 1 playing at every sample (2798 / 931 samples). At 1024, one sample had a stage video decoding during a crossfade (y=11456). |
| font-network | FAIL / FAIL | **PASS** | It failed only on one cold LCP sample (704 / 520 ms). The median of 3 is **244 / 256 ms** (base 252 / 268). All other checks pass. |
| layout-gates | FAIL / FAIL | **FAIL (inherited)** | Pause selector fixed: Pause mid-scroll gives **CLS 1.0** (act-2 930→1422 px), and a paused reload reflows. **Base does the same.** No-JS, phone, RM and z-scale pass. |
| lenis | FAIL / FAIL | **partial** | Label checks fixed for CSS uppercase. Results below. |
| loaf | FAIL / FAIL | **FAIL** | By work: **4 LoAFs over 50 ms at each width** (max 109 / 147 ms). They are the gsap-ticker `FrameRequestCallback` (95–121 ms) and the ladder-1 `IdleRequestCallback` (85–109 ms). |
| research-font | FAIL / FAIL | **FAIL** | 4 strings in `fontWorldIdiotsHead` inside `[data-research]`: "“Pursue excellence, and success will follow.”", "THE", "ICE CHALKBOARD", "3 IDIOTS". |
| split | FAIL / FAIL | **PASS** | Probe artifacts (stale or zero rects, smooth `scrollTo`). Direct check of all 3 splits at both widths: correct side, sticky at the 68 px header, image shown at start/mid/end, overflow 0. |
| spotlight | FAIL / FAIL | **FAIL (timing)** | 7 of 8 tests pass. `pause` skips in 142 / 177 ms (target < 100). |
| cards, cinema, games, gl, hunt, keyboard, plates-live, sound, words | skipped | n/a | W2/W3 |

**Lenis, patched (1440 / 1024).** These pass at both widths:
- on, wheel, skip link, menu anchor;
- lock.menu, lock.palette, cut.z;
- pause (Lenis gone in 2 ms);
- off at 390 touch ("Work"), 1024×1366 touch, RM, `?skip=smooth`, /lab and 404.

These fail:
- **keyboard.midglide:** 160 / 176 ms (target ≤ 60).
- **fastlane, cold:** focus at 902 / 978 ms (target ≤ 400). Clicked after quiet-end it is 270 ms, with the overlay seen and the landing at 92 px.
- **hash.load at 1440:** flaky, and base fails 2 of 5 loads the same way.

With Lenis off, the fast lane can land 155 px past `#work`.

## 2. Beats (`--widths=1440,1024 --write`)

The run exits 1, which is expected in W1. Output is in `beats/`.
- **Size:** 4885.1 vh @1440 and 5408.7 vh @1024. 22 beat elements on the page against 78 declared.
- **Gaps > 100 vh @1440:** B02→B06 101, B06→B10 204, B11→B17 412, B22→B24 162, B24→B23-rack 149, B23-rack→B27 265, **B27→B41 1079**, B44→B46 271, B46→B52 184. At 1024 there are also B17→B20 and B42-rack→B43.
- **Competing stars:** B19 against B20, B21-circle and B22, all in trading-algos.
- **Span:** **B41 is 229 px at 1024**, under the 300 px minimum (a hard error).
- **Declared but missing (56):**
  - for W2-CARDS: B03/B04/B13/B14/B35/B36/B38/B48/B50, plus their impact, subtitle, spray, chalk, sun, fireflies and motes beats;
  - for W3: B07, B08, B08-invite, B09, B09-window, B12, B16, B18, B21, B23, B25, B26, B28–B34 with their finale/bars beats, B39-drift, B40, B42, B45, B47, B47-fireflies, B53, B55, B57, B58.
- **estVh:** written for 20 items (`scratchpad/p3/w1/estVh.patch`). I then ran `check` (same result), rebuilt and re-served.
  - **The patch is also applied, uncommitted, to the repo's `lib/page.ts` and `lib/film.ts`**; both were clean before.
  - The act-card values are for unpinned cards. Re-run `--write` after W2 lands the pins.

## 3. Motion (`motion.js`)

Summaries and strips are in `motion/`.

| run | W1 1440 | base 1440 today | P3-0 | W1 1024 | base 1024 today |
|---|---|---|---|---|---|
| intro fps / p95 | **10.4 / 183.3** | 22.8 / 183.4 | 29.5 / 116.6 | **13.3 / 166.6** | 28.2 / 116.6 |
| desktop (Lenis) fps / CLS | 5.9 / 0.0032 | 8.6 / 0 (native) | 15.2 / 0 | 15.8 / 0.0024 | 10.7 / 0 |
| native (`?skip=smooth`) fps / CLS | 5.9 / 0.0033; re-run 8.2 / 0.0026 | — | — | 13.4 / 0.0042 | — |
| rm fps / CLS | 50.6 / 0.008 | — | — | 46.3 / **0.1157** | — |

**Lenis on/off works as intended:** on for desktop, off for native and rm, at both widths. **At 1024, W1 beats base.**

**Principles stall at 1440:**
- 0.2–0.3 fps in all three 1440 scroll runs, with 10–25 s frames and no script. The native runs report "scroll stuck at 39200 / 38700".
- In the idle probe, principles is at **0.3 fps with raster 4731 ms/s** (base: 60.6 fps, raster 0). Credits is at 0.1 fps and repaints `div.stage-layer` / `stage-cam`.
- A direct jump to principles idles at 60 fps, so the stall needs the slow scroll-through that drives the unfold.
- Lead: `#principles div.origin-right.will-change-transform` repaints while far off screen; it shows in the repaint list during the intro. Points at `principles-map.tsx` (B1-RASTER).
- Strip: `motion/1440-native-principles-stall.jpg`.

**CLS:**
- **RM at 1024: CLS 0.116** in `#about` (figure and pillar `li`s), likely a world-font swap.
- Scroll CLS of 0.002–0.004 comes from world-font swaps: scene captions, writing h3s, hp lettering.

**B1-RASTER targets (native, 1440):**

| section | target | W1 (run / re-run) | base today | ratio | verdict |
|---|---|---|---|---|---|
| work | ≥ 4.8 | 7.8 / 5.5 | 2.8 | 2.0–2.8× | **PASS** |
| principles | ≥ 4.95 | 0.2 / 0.3 | 1.6 | 0.13× | **FAIL** |
| journey | ≥ 5.25 | 2.5 / 1.9 | 2.7 | 0.7–0.9× | **FAIL** |
| kill-list | ≥ 5.85 | 3.9 / 4.5 | 2.5 | 1.6–1.8× | FAIL absolute, PASS relative |
| CLS | 0 | 0.0033 / 0.0026 | 0 | — | **FAIL** |

**Intro, spec §4.4.** Sources: `motion.js` plus `intro-check.cjs`, which runs with no screencast (5 runs @1440, 2 @1024).

| measure | target | W1 | verdict |
|---|---|---|---|
| `#intro` repaints in reveal | 0 | 0 at both widths (base ×3 / ×5) | **PASS** |
| landing raster | ≤ 150 ms/s | 37.3 / 51.4 (base 447 / 570) | **PASS** |
| LoAF > 50 ms, warm→titles-end | none | 4–5 over by work (max 126–143 ms); every one over by duration | **FAIL** |
| hand-off script | < 10 ms | `hold()` takes **28–39 ms** (about 2 s under the screencast harness) | **FAIL** |
| name visible | 2nd reveal frame | **+751 to +776 ms** after reveal (frame 11–17), at `intro:end`. The name, header and copy arrive together. | **FAIL** |
| loop playing at reveal t0 | `playing` | `playing` (5/5) | **PASS** |
| fps / p95 | ≥ 29.5 / ≤ 116.6 | 10.4 / 183.3 and 13.3 / 166.6; fails against the session base too | **FAIL** |

## 4. Gate checklist

**P3-2**

| # | verdict | notes |
|---|---|---|
| 1 | **PASS** | Lenis on only where it should be; Pause removes it in 2 ms; `height:auto`. |
| 2 | **FAIL** | Mid-glide halt 160–176 ms; cold fast lane 900+ ms; hash flaky (base too). Time-Turner, waypoints, map rooms, CTA, tiles and films links not covered. |
| 3 | **PASS** | Menu and palette lock. Nested scrollers untested. |
| 4 | **PASS** (W1 scope) | Stage live at 1440/1024; none on phone, RM or no-JS. AA passes for about and credits. Splits pass. The act-1 program waits for W2-CARDS. 390 diff not run. |
| 5 | **FAIL** | One 1024 crossfade sample with stage video decoding. |
| 6 | **PASS** | Beats, tempo and validator in place; `beats.mjs` runs and writes estVh. |
| 7 | **FAIL** | Principles stall, journey, CLS > 0. |
| 8 | **PASS** | Dev branch. RELEASE is red on the deferred `pencil.body`, by decision. |
| 9 | **FAIL** | 4 LoAFs over 50 ms by work; raw `requestIdleCallback` in `controller.js`. |
| 10 | **FAIL** | +25.8 KB gz JS. CSS and lazy gsap/lenis pass. |
| 11 | **FAIL** (inherited) | Pause CLS 1.0 and paused-reload reflow, same on base. No-JS passes. |
| 12 | **PASS** | Layers z 25/30/32/35; cut overlay under the header. |

**Where the +25.8 KB goes:** first-load gz goes from 466.6 to 495.2 KB (gzip -9). About 9 KB is data:
- media manifest: +5.4 KB (17.3 → 22.7);
- film chunk: +1.9 KB;
- page/beats chunk: +2.0 KB.

The other ~16 KB is code: the largest chunk grows 91.7 → 96.1 KB, and `LetterboxBars` is in first load.

**P3-3**

| # | verdict | notes |
|---|---|---|
| 1 | **FAIL** | 3 of 7 §4.4 targets pass. |
| 2 | **PASS** | No still-poster frames in the strip. |
| 3 | **PASS** | Titles end 4 ms after input, then `cap.hero`. |
| 4 | **PASS** | Skip, Esc, `?skip`, RM and repeat visit show no titles. |
| 5 | **PASS** | Fast lane: `#work-title` focused at top 92; hidden at 1000 px. |
| 6 | **PASS** | `__codecPicks` set; `v.src` used, no `<source>`. |

**P3-4**

| # | verdict | notes |
|---|---|---|
| 1 | **PASS** | One h1, Pirata 172.8 px, line-height .96. |
| 3 | **PASS** | LCP 244 / 256 ms; CLS 0 before scroll; 390 has no new font; mobile LCP 224 ms (base 244). |
| 4 | **FAIL** | 4 ICE-board strings in `[data-research]`. |
| 5 | **PASS** | Budgets and glyphs pass; the #10 error is W2-GL's WIP. |
| 6 | **PASS** | FONTS.md names all 9 families. |
| 7 | **PASS** | World faces load after ladder step 5. |

## 5. Defects to route (most severe first)

1. **Build integrity:** commit the `store.ts` cast; fix the `lib/gl/types.ts` lettering (#10) or remove it.
2. **Principles stall at 1440,** plus the off-screen repaints. Owner: a B1-RASTER follow-up on `principles-map.tsx`. Also check the credits stage layer.
3. **Bundle +25.8 KB:** move the media, beats and copy data off first load; put `LetterboxBars` and the stage gate behind `next/dynamic`.
4. **Intro** (B1-INTRO follow-up): the `hold()` hand-off cost, the warm→titles LoAFs, the name only appearing at `intro:end`, and the fps drop.
5. **Warm-up LoAFs** (B1-SCROLL): the gsap-ticker callback and the ladder-1 idle callback.
6. **Journey fps** (div.sticky raster), and kill-list against the absolute target.
7. **World-font CLS:** 0.116 under RM at 1024, plus the scroll-time swaps.
8. **Pause CLS 1.0 and paused-reload reflow** (inherited). Fix in W2-CARDS' boot-gated pin mode.
9. **research-font scope:** move the ICE-board captions out of `[data-research]`, or exempt lettered captions. This needs a decision on the rule.
10. **Minor:**
    - mid-glide halt, cold fast lane, spotlight pause (timing; re-check on a laptop);
    - the 1024 decoder crossfade sample;
    - B41 span at 1024;
    - the 155 px overshoot with Lenis off;
    - `controller.js` raw `requestIdleCallback`.

## 6. Probe and tool bugs

- **`p3-probes.mjs`:** a probe's dangling promise after a timeout kills the runner. `decoder` needs more than 120 s.
- **`aa-scrim`:** add `transition:none !important` to the hide-text style.
- **`layout-gates`:** the Pause selector should be `header [data-motion-toggle]`.
- **`lenis`:** compare labels case-insensitively.
- **`split`:** read positions after the −353 px journey reflow, and scroll with `behavior:'instant'`.
- **`font-network`:** take the median LCP of 3 loads.
- **`motion.js`:** screencast readback inflates `hold()` to about 2 s; read script costs from a run with no screencast.

## 7. Not run

Not run here; they belong to the Visual phase:
- `scenes.js`, `diff.mjs` (390, 844×390, 1024×1366), `qa.js`;
- `--runs=alt`;
- ESLint on the measured tree;
- P3-4 #2 (the blind test).

Scripts I used are in `scratchpad/p3/w1/`: `run-probes.sh`, `intro-check.cjs`, `intro-paths.cjs`, `lcp.cjs`, `idle-diag.cjs`, `split2.cjs`, `fastlane.cjs`, `hash1024.cjs`, `reflow-check.cjs`.
