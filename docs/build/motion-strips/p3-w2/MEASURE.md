# P3 W2 gate: measurements (plan §10.1 #5, §10.2 W2)

2026-10-02. Headless Chromium 141, 4 CPUs, SwiftShader. Build: `56a9557`, plus `9a3611f` (estVh only), rebuilt and served.

**Verdict: the W2 gate is NOT met.** Do not tick P3-6. P3-9's items pass, except #5, the manual listen. Real failures, most severe first:
1. **The act loglines never show** (P3-7 #4). `.act-card-subtitle` has computed opacity 0 in phases b and m on all four cards, at both widths. `app/p3/cards.css` sets `opacity: 0` under `html.js:not([data-motion-boot="paused"]) [data-act-card-pin] .act-card-subtitle` (specificity 0,4,1). That beats `cards-pin.css`'s `[data-card-phase="b"] .act-card-subtitle { opacity: 1 }` (0,2,0). See `direct/phaseb-seam-no-subtitle.jpg`.
2. **Hash on load misses** (P3-2 #2, P3-6 #3). On load, `#act-1`…`#act-4` land at p −0.11 / 0.26 / scrollY 0 / scrollY 0, with Lenis and without it. `#work` with Lenis at 1440 stays at scrollY 0 in 3 of 3 loads. In-page links under Lenis land correctly at p .470–.471 (`direct/nav.log`).
3. **Fast-lane focus regressed** (P3-2 #2): 500 / 854 / 684 ms at 1440 and 227 / 1253 ms at 1024; the probe saw 1826 / 528 ms. The target is ≤ 400 ms, and W1 measured 254–296. The cut renders 4–8 frames of 700–1250 ms.
4. **The pinned cards are heavy.** Card transitions run 2–5× slower than the unpinned base measured today. The hero, act-1 and journey no longer idle at 60 fps (§3).
5. **LoAF at GL context creation:** 4 LoAFs over 50 ms by work (52–101 ms, all `IdleRequestCallback` via `lib/idle.ts` `onIdle`) within 1.5 s of `context`, in 1 of 2 runs (P3-6 #4).
6. **Star span:** B41 (beyond signature) is 229 px at 1024, under 300. Carried from W1; the owner is W3-RDR2.
7. **Paused reload:** `#journey` reflows from 3209 to 1204 px after hydration. The base does the same (3168 → 1163). The act cards now hold (P3-2 #11).

**Servers (still running):** `:3161` = this build, `next-server` PID **3896** (sh 3895, npm 3842). `:3162` = the base at 5aa4587, PID **3059** (sh 3058, npm 3018).

## 0. Steps
- Rebuilt (`.next` was older than HEAD). `beats.mjs --write` changed estVh on 7 items: the four pinned cards (act-1 2.648, act-2 2.1, act-3 1.9, act-4 2.1), systems, beyond and credits. `npm run check` is OK with 74 warnings (78 before); pacing warnings went from 8 to 4 (gap B24→B25 242 / 321 vh; overlaps B06×B07 1.2 vh and B46×B47 7.7 vh). Rebuilt, re-served, committed **`9a3611f`** (lib/page.ts, lib/film.ts).
- Probes: the full suite at 1440×900 and 1024×768 with `--compare=:3162`; fixed-probe re-runs in `*/rerun/`; an RM pass in `probes-1440-rm/`; direct checks in `direct/*.cjs` + logs.
- Motion: `motion-1440` (desktop, native, intro, gl), `motion-1024` (desktop, native), plus a **base-today** control (`motion/summary-base-1440.md`).
- The probe PNGs (161 MB) are in `scratchpad/p3/w2/probe-png/`, not the repo; contact sheets are in `direct/`.

## 1. Probe tool fixes (`tools/capture/probes/`, uncommitted)

| probe | bug | fix |
|---|---|---|
| cards | `at()` used pin geometry from before the full-page walk. The page then moved by −155…+287 px, so seam was off by p+.16 and ignite by p−.29. | Reads the live pin top and travel at each step. |
| gl | The lab took the previous card's `data-gl="on"` as engaged (4–17 ms) and stepped p mid-hand-over, so 2 draws. | Waits for this card's own `settle` in `__gl.log`. |
| spotlight | The synthetic test ran at y = 2 vh, now inside the opening pin, where B03/B04 own the band. | Steps down to an unowned spot (`tests.start`). |

## 2. Probes

| probe | raw 1440 / 1024 | verdict | evidence |
|---|---|---|---|
| aa-scrim | pass / pass | **PASS** | 641 live boxes, 0 failures (worst 3.78 in about). |
| bundle | pass / pass | **PASS** | JS **+4,222 B gz**, CSS **+5,295 B gz** against base (budget 6,144). gsap, lenis and ScrollTrigger are lazy (50.1 KB gz). No raw rIC. |
| cards | FAIL / FAIL | **FAIL** (after the fix) | pins, stars, impacts, RM and phone ✓. **The subtitle is at 0 (#1); landAt by hash fails (#2).** The 1.2 s settle misses are a frame-rate artifact (dt clamped at 64 ms, 2–5 fps headless); damping passes at 1024. |
| decoder | FAIL / pass | **PASS (flaky)** | ≤ 1 playing at every sample: 927 / 694 / re-run 910. One 1440 sample (y 13515) had a stage video decoding during a crossfade; the re-run had 0. |
| font-network | pass / pass | **PASS** | Every check passes, including desktop LCP/CLS and phone with no new font. |
| gl | FAIL / FAIL | **PASS** except the LoAF | After the fix, all 8 flavours engage and draw 9 of 9 (1 context, 0 compiles moving); loss, Pause, off, rm and phone ✓. The `page.force` disengages at p .8 are the probe jumping off screen: a real wheel scroll logs **0 mid switches** (`direct/glscroll.log`, `gl-lab.json`). |
| hunt | pass / pass | **PASS** | All 17 checks, plus `--rm` (chip shown, no tail). |
| layout-gates | FAIL / FAIL | **PARTIAL** | Pause mid-scroll: **0 shift**, and the cards keep their travel. The box diff is `#journey` collapsing 2856 → 1204, with scrollY anchored. Paused reload: `#journey` reflows (inherited). no-JS, phone, RM and z ✓. |
| lenis | FAIL / FAIL | **FAIL** | fastlane (#3); hash.load at 1440 (#2). Everything else passes, including the 1–2 ms keyboard mid-glide halt and Pause in 2 ms. |
| loaf | FAIL / FAIL | **PASS** (by work, the W1 rule) | Warm-up: worst work 9 / 10 ms; by duration it is raster-bound (434 / 276 ms). |
| plates-live | pass / pass | **PASS** | No dead plate in W2 scope; 7 W3 plates in `deadOther`; ≤ 1 playing; seq peak 87.9 MB. rm, pause (0 decoding at 100 ms), phone and lab ✓. Under `--rm` the live run fails by design (probe mode). |
| research-font | pass / pass | **PASS** | 237 boxes, 0 offenders. |
| sound | pass / pass | **PASS** | 14 / 14 (§4, P3-9). |
| split | FAIL / FAIL | **PASS** | Probe artifacts (zero rects). Direct check of all three splits at both widths (`direct/split-*.log`): sticky at 68 px, correct side, image at start/middle/end, overflow 0. |
| spotlight | FAIL / pass | **PASS** | After the fix, 9 of 9 at both widths, with no overlapping grants. |
| words | FAIL / FAIL | **PASS** | `leftArmed` is the last fly-through, still **playing** when read. The static is a title "in view at bind", by design (`direct/words.log`). |
| cinema, games, keyboard | skipped | n/a | W3 / P3-11. |

## 3. Performance (`motion.js`, headless)

| run (1440) | P3-0 | W1 (fix) | **base today** | **W2** |
|---|---|---|---|---|
| desktop (Lenis) fps / p95 / CLS / pops | 15.2 / 316.7 / 0 / 27 | 19.0 / 216.6 / .0047 / 1 | 12.3 / 333.4 / 0 / 22 | **11.8 / 300 / .0037 / 0** |
| native fps / CLS | – | 15.8 / .0032 | – | **8.1 / .0033** |
| gl (`?gl=force`) fps / p95 | – | – | – | **14.0 / 266.7** |
| intro fps / p95 | 29.5 / 116.6 | 18.5 / 133.3 | – | **14.8 / 166.7** |
| native work · principles · journey · kill-list | 3.2 · 3.3 · 3.5 · 3.9 | 5.5 · 4.5 · 3.7 · 6.8 | 3.9 · 2.8 · 4.5 · 4.0 | **3.9 · 2.5 · 1.5 · 7.2** |
| card transitions act-1…4 fps (desktop) | – | 22.9 · 28.3 · 28.3 · 31.6 (unpinned) | 21.1 · 11.2 · 21.1 · 21.7 | **css 4.4 · 8.4 · 7.9 · 13.5; gl 5.8 · 13.5 · 9.3 · 18.0; native 1.9 · 4.5 · 7.4 · 7.6** |
| idle fps < 55 | none | none | – | **top 41.6, act-1 29.3, journey 8.0** |

| run (1024) | W1 (MEASURE) | **W2** |
|---|---|---|
| desktop fps / p95 / CLS / pops | 15.8 / – / .0024 / – | **17.7 / 200.1 / .0052 / 5** |
| native fps / CLS | 13.4 / .0042 | **15.8 / 1.3884** |
| card transitions (desktop) | – | 7.8 · 10.4 · 22.4 · 20.9 |
| idle fps < 55 | – | act-1 49.2, journey 38.5 (canvas repaint) |

Notes:
- **Idle (1440):** the hero repaints `div.act-card-weather` ×2 plus the video (175 ms/s raster); act-1 repaints `div.absolute.inset-0` ×3 (276 ms/s); journey runs at 8 fps with 1.3 paints/s (the voyage `div.sticky`). All three were at 60 fps in W1. Rule 35 applies to the weather layer.
- **Pinned transitions** are raster-bound (97–99 % of LoAF time is compositor wait); GL beats css.
- **1024 native CLS 1.39:** two 0.69 shifts of `section#act-2` at 7.1 / 7.3 s, not reproduced in 2 direct wheel runs, which show 0.0369 instead (a world-font swap in work; `direct/cls1024.log`). P3-2 #7 (CLS 0) stays failed.
- The B1-RASTER targets fail for work, principles and journey; kill-list passes. Compare against base today: desktop is 0.96× base, where W1 was 1.5–2.2×.

Strips and summaries are in `motion/`; hook frames in `direct/cards-1440-p05-p50-p90.jpg`; GL frames in `direct/gl-page-force-1440.jpg`.

## 4. W2 gate (plan §10.2 W2 + spec §13)

| item | verdict | evidence |
|---|---|---|
| register SEQs, TTS, loops; CARDS `landAt` / `maskOrigin`; `beats --write` | **PASS** | W2-notes §1 #2 and #12; `9a3611f`. |
| no star span < 300 px | **FAIL** | Card stars 365–495 @1440 and 311–422 @1024 ✓; **B41 229 px @1024** (W3-RDR2). |
| one GL context, one decoder at every sample | **PASS** | contexts 1 (lab, page, wheel scroll); maxPlaying 1. The crossfade sample is flaky (1 of 3 runs). |
| P3-6 #1 pins under the boot gate | **PASS** (W2 scope) | Travel 90/110/90/110 vh exact; the opening program is a sibling; RM, 390 and 1024×1366 touch have no pin or Lenis. The 844×390 and 1024×1366 frame diffs are the visual step's. |
| P3-6 #2 two stars ≥ 300 px, damping | **PASS** (spans and trail) / skimmer n/a | The p trails at +60 ms and settles (1024). The ≥ 400 ms star on a fling needs the P3-11 screencast. |
| P3-6 #3 hooks, landAt | **FAIL** | The p .05 frames are pictures (judged in P3-11). Links under Lenis give .470–.471 ✓; **hash on load misses**; native in-page links land at the section top (p −.09…−.15). |
| P3-6 #4 GL tier | **FAIL** (LoAF only) | Flavours, gl=off/force, loss and 0 mid switches ✓; LoAF at context creation ✗ (1 of 2 runs). |
| P3-6 #5 one context, one decoder, no compile while moving | **PASS** | Lab and wheel scroll: compilesMoving []. |
| P3-6 #6 MATCH_ROW 480 ± 6 / 410 ± 6 | **NOT MEASURED** | No probe check exists; visual step. |
| P3-6 #7 four impacts, 0 under RM | **PASS** | pirates, idiots, rdr2, hp at both widths; RM 0. |
| P3-6 #8 letterbox | n/a (W3) | No global bars in W2 (W2-notes §4). |
| P3-6 #9 grades vs `lib/sky.ts` | **NOT MEASURED** | Visual step. |
| P3-6 #10 no act-2 pop > 25 % | **NOT VERIFIED** | Pops of 22–42 % area fall in the card pause (the damped push). Judge the seam strip. |
| P3-6 #11 kraken on GL | **NOT VERIFIED** | Lab seam with `kraken(1)` at p .1 shows no visible tentacle (`scratchpad/p3/w2/v/kraken2.jpg`). |
| P3-7 #1 title masks; h2 for SR | **PASS** (crispness visual) | The GL page frames show the four title masks over the push; each h2's text is in the DOM, visible and not aria-hidden. |
| P3-7 #4 loglines in star (b) | **FAIL** | Opacity 0 (failure #1). |
| P3-8 #1 12 eggs, count once, persist / sync, "–/12" | **PASS** | check: 12 eggs (3 per world), 4 spells; ssr, hydrate, typed and sync ✓. The W3 hosts' hints and keys are not wired yet. |
| P3-8 #2 Obliviate / Reset / eggs-off | **PASS** | obliviate, reset, eggsoff. |
| P3-8 #3 Pause never counts; palette | **PASS** | No toast, veil or bloom over two presses; browse ✓. |
| P3-8 #7 12/12 | **PASS** | Gold chip, 12 rows, SEEKER steps aside. The sting is not probed. |
| P3-8 #8 post-credits | **PASS** | 60vh tail, played once, extended at 12/12; phone has no tail; RM shows no tail. |
| P3-8 #9 bugs B1 B2 B3 B5 B6 B9 | **PARTIAL** | B1 (eggs-off) and B9 (`data-game`) are probed ✓; B2, B3, B5 and B6 are not. |
| P3-9 #1 muted, no context, 0 bytes | **PASS** | made 0, requests 0; the first unmute makes 1 context, running; a new visit is muted. |
| P3-9 #2 beds by world, SFX | **PASS** | bed.follow 6/6 in ≤ 501 ms; 5 of 5 SFX cues; typed and Lumos eggs voiced. |
| P3-9 #3 suspend ≤ 100 ms; toggle disabled | **PASS** | Pause 4 ms, hidden 46 ms, RM live 39 ms; aria-disabled with its note. |
| P3-9 #4 TTS, SOUNDS.md, ≤ 150 KB | **PASS** | 5 webm, 46.9 KB in total; provenance passes. solemn (21.5 KB) and mischief (10.7 KB) trip the 10 KB warning; 5 release gates await Aryan. |
| P3-9 #5 manual listen | **NOT DONE** | Needs a human; record it in the report. |
| P3-5 #1 re-seams, shared codec | **PASS** | `durationS: 8`; MediaFrame, StageVideo and the intro share the `lib/codec` rule; the network shows only the picked webm. The laptop HW decoder check is open. |
| P3-5 #3 push-ins, SSIM ≥ .95, ICE drift ≤ 2 px | **NOT MEASURED** | No probe check exists. |
| P3-5 #5 camera / depth ALTs | **PASS** | `stage.camera` alt "push"; `plates.loops` alt "code-depth-camera". |
| P3-5 #6 seq ≤ 128 MB, ≤ 1 resident | **PASS** | 87.9 MB peak live; the lab holds 25 frames / 92.2 MB, 1 resident. |
| P3-2 #11 layout gates | **PARTIAL** | Pause mid-scroll: 0 shift ✓ (W1's act-2 CLS 1.0 is gone). Paused reload: `#journey` reflows (inherited, base the same). no-JS ✓. |

## 5. Route
- W2-CARDS: the subtitle specificity.
- `lib/smooth-scroll.ts` hash path: `#act-n` should land at `landAt` on load, and `#work` should hold under Lenis. Also the 1440 fast-lane cut.
- Idle: weather, stage and journey (rule 35); pinned-card raster; GL idle jobs at context creation.
- Visual step: B41, MATCH_ROW, grades, the kraken, the act-2 pop, P3-5 #3, and the 390 / 844×390 / 1024×1366 diffs.
