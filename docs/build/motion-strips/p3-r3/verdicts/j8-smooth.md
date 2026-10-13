# J8 SMOOTH: round 3 verdict

**Score: 2.5 / 5.** Confidence medium-low (one run per cell, headless software raster, no real GPU). About 2 if the real GPU leaves the raster-bound rows as they are, about 3.5 if it removes them; the app-owned problems below stand either way.

Targets: **5 met, 22 missed, 4 not measurable** from these files (of 31 rows; a row is 'met' only if it is met at both widths).

On the relative headless measure round 3 is level with P3-0, not smoother: desktop 1440 15.1 fps (floor 15.2, aim 18), the share of frames over 50 ms up from 21.7 % to 33.0 %, the like-for-like native path 34 % slower (10.0 fps), and the sections that were fast in P3-0 (act-1, act-4, experiment, credits) now 3-4x slower while the slow ones (work, principles, films) got faster. Misses that are app problems: an idle-time task of 100-1,013 ms on the play screen and in the first 2,000 px; CLS 0.0454 / 0.0124 (a 0.025 #films shift also occurs under reduced motion); the name still pops in 1.2-2.2 s after the reveal; script tasks of 76 / 112 ms at the intro hold; 12 / 11 will-change layers in principles (budget 8); camera and card layers repainting on most frames; journey idle 0.3 fps; LCP about twice P3-0. Misses that are environment artifacts: every long-frame / LoAF count (98-99 % have under 20 ms of main-thread work), the 731 ms reveal frame, INP 544 ms at 1440, the intro's absolute fps, skimmer 8.6 fps, native pops. Worst: principles (worst section in 4 of 5 recordings), act-1 -> about, the journey seam push B12 and opening B09, the intro reveal.

`R` = `docs/build/motion-strips/p3-r3`. r2 numbers are as published in the manifest. P3-0 = `docs/build/motion-strips/p3-before/summary.md` (1440 only, no Lenis).

## How to read the numbers

The machine is 4 CPUs, no GPU, SwiftShader. A frame that is slow with about 0 ms of main-thread work is a raster wait, not app work. In this data that is almost every long frame: of the LoAFs over 50 ms in the screencasts, only 15 of 2,382 (reader 1440), 13 of 1,652 (reader 1024), 10 of 976 (skimmer 1440), 10 of 661 (skimmer 1024) and 14 of 4,305 (director) carry 50 ms or more of main-thread work, and 98-99 % carry under 20 ms; the median such LoAF has 1 ms of work. motion.js says the same (busy-and-janky 2.9 % desktop 1440, 3.5 % at 1024). So **absolute fps, p95 and LoAF counts are environment; differences against P3-0, round 2 and between sections are the signal.** The few tasks that do carry real script are app problems and are called out as such.

## Targets

Section 12.1 (headless relative, default / native / gl judged separately, the raster diet, INP, main thread after titles, LCP) and section 4.4 (intro). Cause: app, env (environment), mixed.

| # | measure | target | 1440 | 1024 | met 1440 / 1024 | cause |
|---|---|---|---|---|---|---|
| T01 | desktop (Lenis default) fps | >= 15.2 floor (aim >= 18) | 15.1 (P3-0 15.2; r2 14.8) | 19.5 (r2 21.7; no P3-0 run at 1024) | NO / yes | mixed |
| T02 | desktop p95 frame | <= 316.7 ms | 250 ms (r2 233.3) | 166.7 ms (r2 150) | yes / yes | n/a |
| T03 | desktop work fps (>= 1.5x P3-0 3.2) | >= 4.8 | 13.0 (31 frames; r2 19.7) | 14.3 (30 frames; r2 34.1) | yes / yes | n/a |
| T04 | desktop principles fps (>= 1.5x P3-0 3.3) | >= 4.95 | 10.6 (34 frames; r2 4.2) | 4.4 (13 frames; r2 19.1) | yes / NO | mixed |
| T05 | desktop journey fps (>= 1.5x P3-0 3.5) | >= 5.25 | 5.6 (19 frames; r2 7.6) | 6.9 (19 frames; r2 9.9) | yes / yes | n/a |
| T06 | desktop kill-list fps (>= 1.5x P3-0 3.9) | >= 5.85 | 5.6 (13 frames; r2 5.4) | 9.9 (25 frames; r2 11.2) | NO / yes | mixed |
| T07 | desktop pops | <= 12 (P3-0 27) | 2 (r2 4) | 10 (r2 6) | yes / yes | n/a |
| T08 | desktop CLS | 0 | 0.0454 (r2 0.006) | 0.0124 (r2 0.0133) | NO / NO | app |
| T09 | native (?skip=smooth) fps / p95 (the like-for-like with P3-0, which had no Lenis) | judged separately; same floors >= 15.2 / <= 316.7 | 10.0 / 350 ms (r2 8.1 / 433.3) | 13.9 / 283.3 ms (r2 14.0 / 250.1) | NO / NO | mixed |
| T10 | native pops / CLS | <= 12 / 0 | 28 / 0.015 (r2 52 / 0.0173) | 39 / 0.0153 (r2 40 / 0.0149) | NO / NO | mixed |
| T11 | native work / principles / journey / kill-list fps (>= 1.5x P3-0) | >= 4.8 / 4.95 / 5.25 / 5.85 | 4.3 / 2.9 / 3.5 / 3.0: 0 of 4 pass | 20.5 / 4.3 / 3.3 / 6.5: 2 of 4 pass | NO / NO | mixed |
| T12 | gl (?gl=force) fps / p95 / pops / CLS + the four section rows | judged separately; same floors | 15.1 / 266.6 ms / 2 / 0.007; work 13.2 ok, principles 3.6 MISS, journey 8.2 ok, kill-list 5.9 ok | 21.7 / 150 ms / 14 / 0.0124; work 25.0 ok, principles 5.6 ok, journey 9.7 ok, kill-list 10.1 ok | NO / NO | mixed |
| T13 | raster diet #1: principles will-change layers | <= 8 (P3-0 52) | 12 on screen | 11 on screen | NO / NO | app |
| T14 | raster diet #2: work (no plate-band filter / mix-blend sweep) | transform/opacity only; blend sweep gone | 4 filter + 1 blend + 1 mask on screen (P3-0: 3 / 1 / 2) | 4 filter + 1 blend + 1 mask (5 filter in alt and rm) | NO / NO | app |
| T15 | raster diet #5: writing live filters | 8 filters -> baked (0) | 0 filter (P3-0 8); 6 mask, 4 will-change | 0 filter; 6 mask, 4 will-change | yes / yes | n/a |
| T16 | raster diet #6: voices campSticky repaints | baked mask; veil animates opacity only | campSticky still the top repainting node in act-4: x22 of 29 paints (P3-0 x5 of 8) | x25 of 37 paints | NO / NO | app |
| T17 | raster diet #3: journey sticky column repaints / card stage | stop repainting the sticky column | div.sticky (#journey) repaints in top x4, about x6 (desktop); alt act-1 x17; journey frames repaint act-card-stage 19 of 19 | alt act-1 x22, act-2 x16; journey act-card-stage x16 of 19 | NO / NO | app |
| T18 | idle: 60 fps at rest (headless proxy for the real-GPU row; a playing loop may cost) | every section ~60 fps | top 14.8, journey 0.3, act-4 27.1; the other 17 sections 60.0-60.6 | top 34.0, journey 0.6; the other 18 sections 59.5-60.6 | NO / NO | app |
| T19 | INP (game input, egg triggers, the cut) | <= 200 ms | 544 ms keydown, input delay 0 (games probe, run 7; r2 272 ms pointerdown, r1 688 ms) | 192 ms keyup, delay 5 (pass) | NO / yes | env (likely) |
| T20 | main thread after the titles: no LoAF > 50 ms in the 3 s after intro:quiet-end while wheel-scrolling | none | reader 1440: 33 LoAFs > 50 ms (max 152 ms, every one with <= 1 ms of work, 0 blocking); desktop run (wheel from t=0): 431 ms LoAF with 400 ms of script at 0.09 s, 381 ms (123 ms work) at 3.21 s | reader 1024: 37 LoAFs > 50 ms (max 102 ms, work 0); desktop run: 76 ms of script at 3.56 s | NO / NO | mixed |
| T21 | warm-up LoAF probe (results.loaf, metric = duration) | none > 50 ms | 18 (worst 600 ms, work 5 ms; r2 15) | 17 (worst 269 ms, work 16 ms; r2 16) | NO / NO | env |
| T22 | desktop lab LCP (qa.js, 3 loads; quoted from the manifest) | <= 400 ms | 780 / 732 / 764 (r2 772 / 624 / 280) | 816 / 724 / 736 (r2 748 / 904 / 748) | NO / NO | app (likely; regression vs P3-0 256-368 on the same kind of machine) |
| T23 | reduced motion: fps / CLS | ~60 / 0 | 58.0 / 0.025 | 58.8 / 0 | NO / yes | app (CLS) |
| T24 | 4.4 `#intro` repaints during the reveal | 0 (P3-0 x6) | not measured (needs the trace). Indirect: reveal and titles rows list only #document and the hero video; hold still repaints div#intro-stage x2 | not measured. Indirect: reveal x2 #document + video x1 | n/m / n/m | n/a |
| T25 | 4.4 landing raster | <= 150 ms/s (P3-0 644.6) | reveal 321.8; hold 1,715 (3 frames); titles 141.3 | reveal 285.9; hold 541.7; titles 2.4 | NO / NO | env (likely) |
| T26 | 4.4 LoAFs > 50 ms from warm to titles end | none (P3-0: several) | 47 (max 731 ms, blocking 35 ms; r2 45) | 30 (max 415 ms, blocking 66 ms; r2 25) | NO / NO | env (all but the hold task) |
| T27 | 4.4 hand-off script | < 10 ms (P3-0 54 ms) | not measured. Nearest evidence: 76 ms FrameRequestCallback at intro:hold, 0.2 s before the reveal | not measured. Nearest: 112 ms setInterval task at intro:hold, 0.5 s before the reveal | n/m / n/m | app (likely) |
| T28 | 4.4 name visible on the 2nd reveal frame, no pop | 2nd reveal frame; no pop in the strip | name appears at 8.04 s = reveal + 2.2 s (titles + 1.4 s), in ONE frame; tool flags a 'change' pop of 11.1 % of the frame (P3-0: 7.02 s, fill-in pop) | name appears at 7.33 s = reveal + 1.2 s, with one partial-opacity frame; tool flags a 'fill-in' pop of 7.3 % | NO / NO | app |
| T29 | 4.4 sea never still (playing at reveal t0) | data-media-state=playing at reveal t0 | not measured by attribute. Indirect: hero video is a repaint node in the reveal and titles rows | same, indirect | n/m / n/m | n/a |
| T30 | 4.4 intro run fps / p95 | >= 29.5 / <= 116.6 ms | 18.5 / 133.3 ms (r2 20.8 / 116.7) | 28.1 / 83.3 ms (r2 31.8 / 66.7) | NO / NO | mixed |
| T31 | Real GPU (Aryan's laptop; p95 <= 20 ms, <= 2 % > 33 ms, no frame > 50 ms in cards, hardware decoder, idle 60 fps) | per 12.1 | not measurable from these files | not measurable from these files | n/m / n/m | n/a |

Notes per row:

- **T01**: 1440 sits 0.1 under the floor and 2.9 under the aim: level with P3-0, not smoother. The share of frames > 50 ms went UP (21.7 % in P3-0 -> 33.0 % at 1440, 28.4 % at 1024) while the tail got shorter (p95 316.7 -> 250 ms, max 1,117 -> 767 ms).
- **T02**: Met, but one frame step (16.7 ms) worse than round 2 at both widths.
- **T03**: Met by a wide margin; but 1.5-2.4x lower than round 2.
- **T04**: 1024 misses on 13 frames (r2 had 59). Principles is the WORST section in the screencasts in 4 of 5 recordings (median clip fps 6.3 reader-1440, 5.5 skimmer-1440, 5.8 skimmer-1024, 7.5 director), so the 1440 pass here is not corroborated.
- **T05**: 1440 clears the bar by 0.35 fps on 19 frames: inside run-to-run noise.
- **T06**: 1440 misses by 0.25 fps on 13 frames: a coin-flip row, but there is no evidence it passes.
- **T07**: Met, with a measurement caveat: the pop detector only inspects frames where scroll moved < 40 px, and under Lenis the page almost never stands still, so 2 / 10 are not like-for-like with P3-0's 27. The like-for-like number is the native run (T10): 28 / 39.
- **T08**: 9 of the 12 runs have CLS > 0 (only intro at both widths and rm at 1024 are 0). Largest: one 0.025 shift in #films at 32.9 s that ALSO appears in the alt run (32.6 s) and in the reduced-motion run (26 s), so it is layout, not motion. Plus 0.0134 in #work (caption span, world-face-idiots) and 0.003-0.0113 in #beyond (words-scrub spans).
- **T09**: At 1440 the P3-0-equivalent path is 34 % slower than P3-0 (10.0 vs 15.2 fps). Sections that were FAST in P3-0 are 3.6-7.6x slower here: act-1 28.8 -> 4.0, experiment 52.7 -> 7.3, act-4 38.0 -> 5.0, credits 40.0 -> 11.2.
- **T10**: 28 pops at 1440 vs P3-0's 27: no change on the native path. By the tool's own definition these are raster lag under SwiftShader (environment) plus late fills.
- **T11**: At 1440, principles and journey are at or below P3-0 on the native path (2.9 vs 3.3, 3.5 vs 3.5); at 1024 there is no P3-0 run, and the same two rows read 4.3 and 3.3. Kill-list at 1440 is 23 % below P3-0 (3.0 vs 3.9).
- **T12**: GL costs no extra frames here (same fps as the default run at 1440). Misses: 1440 fps 0.1 under the floor and principles 3.6; 1024 pops 14 (> 12); CLS at both.
- **T13**: A 77 % cut but 3-4 over the budget. The reduced-motion run shows principles is heavy even with no motion: at 1440 it runs 31.5 fps (p95 150, raster 580 ms/s, `div.hidden.will-change-transform.xl:block` repainted 10x) while every other rm section holds 60; at 1024, where the xl-only block is hidden, rm principles is 40.6 fps.
- **T14**: Not demonstrated: the paint-suspect list still counts a blend and MORE filters than P3-0. (Presence on screen is not proof that they animate; work's fps did improve 4x.)
- **T15**: Met. writing 5.0 -> 9.8 fps at 1440. But writing now has the highest paints/s of any section (85 at 1440, 120 at 1024; P3-0 24).
- **T16**: Not fixed; it moved from voices to act-4 and got bigger.
- **T17**: The sticky column is still a top repainting node in the alt run at both widths, and the act-card-stage itself is repainted in 73-100 % of the document paints of nearly every card section (1440 desktop, paints of the node / paints of the document: act-1 18/22, journey 19/19, films 57/78, beyond 39/42, writing 30/30, principles 27/27).
- **T18**: P3-0 idle was 60 fps in every section except top (31.9) and voices (57.7). Journey at 0.3 / 0.6 fps with ~2 ms/s of rAF script and 4.7-5.3 paints/s is unexplained (a stalled frame loop at rest?). Act-4 at 1440 repaints `div.act-card-shape` x3 at rest (39.5 ms/s raster) with 21 infinite animations on screen (P3-0: 0). Hero idle is video-bound (environment, likely).
- **T19**: Delay 0 means the main thread was free: the time is handler + presentation, and in this setup presentation is a raster wait. Same class of failure in all three rounds at 1440.
- **T20**: By duration it fails; by main-thread work the reader recordings pass (0 tasks >= 50 ms of work). BUT neither the reader nor the skimmer scrolls inside that window (their scroll starts 3.1-3.75 s after quiet-end), so the clause 'while wheel-scrolling' was only exercised by motion.js desktop, which fails on the idle-callback task (F2).
- **T21**: All 12 listed LoAFs (top by duration) have <= 2 ms of work and 0 blocking (one 4 ms at 1024); the 1024 probe's 16 ms worst work is a LoAF outside that list, still far below 50 ms. Raster waits. Under --rm the probe passes. Not an app defect.
- **T22**: Roughly 2x the budget and 2x P3-0. Cause is not visible in the J8 files; it is a loading metric, not a scroll metric.
- **T23**: Frame rate is fine (the page can be smooth when no motion runs). The 1440 CLS is the same #films shift as T08.
- **T24**: Likely met, unproven.
- **T25**: The old 'landing' window is now hold + reveal; both exceed 150 ms/s at both widths (1-5 frames each). Only the titles row meets it. Under SwiftShader; read as relative.
- **T26**: The 731 ms (reveal) and 228 ms (titles) frames have 0 ms of work. The only tasks with real work in the window are at intro:hold: 76 ms rAF script (1440, t 5.65 s) and 112 ms setInterval script (1024, t 5.6 s).
- **T27**: If those hold tasks are the hand-off, they are 8-11x the budget and worse than P3-0 (54 ms). Needs the intro trace to confirm.
- **T28**: Strips: R/motion/1440/strips/pop-intro-77.jpg, R/motion/1024/strips/pop-intro-99.jpg. The sea is shown for 1.2-2.2 s with the name absent. If the titles design deliberately sequences caption -> name, section 4.4's wording and the design disagree: J8 can only apply 4.4 as written.
- **T29**: Likely met, unproven.
- **T30**: 1440 regressed 37 % vs P3-0 on the same kind of machine; 1024 misses fps by 1.4. The titles phase runs 24.1 fps at 1440 (P3-0 post-landing 54.5 fps) with a video now playing under the title cards (software decode + composite: environment, likely), and the play screen runs 12.5 fps (P3-0 22.7) with ~1.5 s of script on it (1,013 + 285 + 104 + 64 ms).
- **T31**: The only row that decides whether the raster-bound misses are real. Nothing here can substitute for it.

## Which misses are app problems and which are the environment

**Environment (raster waits under SwiftShader; do not fix in code on this evidence):**
- Every LoAF-by-duration count: across the five screencasts 98-99 % of LoAFs > 50 ms have < 20 ms of work (median 1 ms); warm-up probe 18 / 17; intro warm -> titles-end 47 / 30 except the hold task (T26).
- Absolute fps and p95 of every run; the skimmer's 8.6 / 11.0 fps; the headed screencasts' readback cost.
- The 731 ms reveal frame (1440), the 415 ms hold frame (1024), the 1,607 ms native act-1 LoAF (23 ms of work), the 1,883 ms max frame.
- INP 544 ms keydown at 1440 (input delay 0): presentation delay, likely.
- Intro 'titles' fps at 1440 (24.1) and the hero's idle 14.8 fps: software video decode + compositing, likely.
- Native-run pops (the tool defines them as raster lag under SwiftShader).

**App:**
- The idle-callback task of 100-1,013 ms (F2): script, not raster.
- The 76 / 112 ms script tasks at intro:hold (F5).
- CLS 0.0454 / 0.0124 (F4), including the #films shift that also happens under reduced motion.
- The name appearing in one step, 1.2-2.2 s after the reveal (T28).
- 12 / 11 will-change layers in principles; the xl-only layer that costs raster with motion off; infinite animations in act-3 / act-4 / voices; per-frame repaints of act-card-stage, stage-cam, plate-cam, campSticky (F6, F9, F10).
- Journey idle 0.3 / 0.6 fps and act-4 idle 27 fps at 1440 (F9).
- LCP 724-816 ms against 256-368 in P3-0 on the same kind of machine (T22).
- Weight added to act-1 (3.5 MP, 4 masks) and act-4 (21 infinite animations, 2 canvases): app weight that software raster makes visible (F1, F7).

**Unclear:**
- Five of five screencasts 6-16 % slower than round 2 (F11): extra raster weight, or a slower sitting.
- The ~2 s wall-clock for 100-155 px at the principles hand-off in both strips (F6).
- Whether the idle-callback task is the same job each time, and whether the 76 / 112 ms hold tasks are the hand-off.

## Worst sections and transitions

Ranked by how often they appear at the bottom across the five recordings and motion.js. Clip numbers are `clips[i]` = clip #i+1 on that run's sheets; strips are in `R/motion/<w>/strips/`.

| rank | where | evidence | refs |
|---|---|---|---|
| 1 | **Principles** (act-4 -> The Light -> Map) | Lowest median clip fps in 4 of 5 recordings (6.3 / 5.5 / 5.8 / 7.5), third in the fifth; 4.4 fps at 1024 desktop; rm 31.5 fps at 1440 | reader-1440 #225-#240 (#238), skimmer-1440 #99-#108 (#101 633 ms), skimmer-1024 #72-#79, director #176-#186, reader-1024 #225; `desktop-act-4.jpg` both widths |
| 2 | **Act-1 -> about** (first scroll) | Median 6.1-8.1 fps in all five; card 7.6 fps vs P3-0 26.2; the idle-callback task lands here | reader-1440 #22-#34, reader-1024 #21-#31, skimmer-1440 #7-#14 (#10 1.8 fps), skimmer-1024 #7-#11, director #7-#16; `desktop-act-1.jpg` (1440) |
| 3 | **Journey seam push B12 and opening B09** | Near-worst clip in 4-5 of 5; 416-500 ms frames; idle 0.3 fps | B12: reader-1440 #57, reader-1024 #54, skimmer-1440 #26, skimmer-1024 #21, director #34. B09: reader-1440 #44, reader-1024 #43, skimmer-1440 #19, skimmer-1024 #17 |
| 4 | **Intro reveal and name** | 733 ms frame at 1440; name pops at 8.04 s / 7.33 s; hold script 76 / 112 ms; intro 18.5 fps | `intro.jpg`, `intro-landing.jpg`, `pop-intro-77.jpg` (1440), `pop-intro-99.jpg` (1024); reader clips #1, #9 both widths |
| 5 | **Kill-list** | 5.6 fps (13 frames) at 1440; native 3.0; median 8.6 reader-1440, 7.8 skimmer-1440 | reader-1440 #127-#139, skimmer-1440 #58-#63 |
| 6 | **Act-4 / voices (campfire -> hall)** | 12.5 fps card transition (P3-0 29.2); 21 infinite animations; idle 27 fps at 1440 | reader-1440 #215-#224; `desktop-act-4.jpg` |
| 7 | **Contact entry** | 2.6 fps (4 frames) 1440, 1.8 (2 frames) 1024; 566 ms frame at reader-1024 #232 | reader-1024 #232 (B56-flame) |
| 8 | **#films layout shift and card arrivals** | CLS 0.025 at 32.9 s; pops at 37.4 s (RDR2 card arrival) | `pop-desktop-283.jpg` |

Fast and fine (for balance): work, films (33.2 fps at 1440), writing and credits-at-rest in the reader runs; contact is 20-26 fps in the reader runs when stationary.

## Findings

### F1 (high, mixed): Not smoother than P3-0 in the relative headless measure

Desktop 1440: 15.1 fps vs 15.2 (P3-0); share of frames > 50 ms 33.0 % vs 21.7 %; p95 250 vs 316.7 ms; max 767 vs 1,117 ms. The like-for-like native path (P3-0 had no Lenis) is 10.0 fps / 350 ms p95. The page-wide mean did not move because the weight moved: gains where P3-0 was slowest (work 3.2 -> 13.0, principles 3.3 -> 10.6, films 19.9 -> 33.2, writing 5.0 -> 9.8, journey 3.5 -> 5.6 fps) are offset by regressions where P3-0 was fastest (act-1 28.8 -> 7.7, experiment 52.7 -> 14.5, act-4 38.0 -> 12.6, credits 40.0 -> 14.3, optuna 10.1 -> 5.8, contact 5.6 -> 2.6). Act cards: act-1 26.2 -> 7.6 fps, act-4 29.2 -> 12.5 (act-2 and act-3 level or better). Act-1 now has 3.5 MP of images and 4 masks in view (P3-0: 1.2 MP, 2 masks); act-4 has 21 infinite animations and 2 canvases (P3-0: 0 and 0).

Refs: `R/motion/1440/summary.md (runs, desktop per-section, act-card transitions)`; `docs/build/motion-strips/p3-before/summary.md`; `R/motion/1440/strips/desktop-act-1.jpg`; `R/motion/1440/strips/desktop-act-4.jpg`

### F2 (high, app): A recurring idle-time task owns the main thread for 100-1,013 ms, on the play screen and in the first 2,000 px

Same function every time (chunk 1_p9cg58_0_83.js line 605, IdleRequestCallback 'n'); P3-0 had no such task (its largest single-LoAF script was 77 ms). motion.js intro: 1,013 ms of script at t -1.66 s on the play screen (1440; 793 ms at -2.61 s at 1024), before the user can press Play; baseline's pre-Play 895 ms frame had 1 ms of work. motion.js desktop 1440: 394 ms at 0.09 s, 122 ms in act-1, 121 ms in optuna-screener; native: 355 ms (act-1), 244 ms (act-4). Screencasts: reader-1440 463 ms at y 65 = clip #19 (6.4 fps, 517 ms frame, the worst clip of that run; #20 follows at 3.9 fps); reader-1024 296 ms at y 0 = clip #18 (283 ms frame); skimmer-1440 722 ms at y 1,928 = clip #10, the single worst clip of that run (1.8 fps, 650 ms frame); skimmer-1024 467 ms at y 852 = clip #6 (the stalled frame ends there; the task starts in #5); director 617 ms at y 1,535 = clip #11. It is not tied to one warm-up rung (0.3-5 s after ladder-5 in four recordings, 3 s before it in the fifth). It also shows as 8-47 ms in the 'top script' column of most sections, i.e. it recurs.

Refs: `R/motion/1440/summary.md 'intro - longest animation frames' and 'desktop - LoAFs with the most main-thread work'`; `R/motion/1024/summary.md (same tables)`; `R/screencast/reader-1440/clips.json #19, #20`; `R/screencast/reader-1024/clips.json #18`; `R/screencast/skimmer-1440/clips.json #10`; `R/screencast/skimmer-1024/clips.json #6`; `R/screencast/director-1440/clips.json #11`

### F3 (info, environment): Everything else that is 'long' is a raster wait: do not count LoAFs

Screencast LoAFs > 50 ms that carry >= 50 ms of main-thread work (counted from each screencast.json loaf list): reader-1440 15 of 2,382, reader-1024 13 of 1,652, skimmer-1440 10 of 976, skimmer-1024 10 of 661, director 14 of 4,305; the median > 50 ms LoAF has 1 ms of work and 98-99 % have under 20 ms. motion.js busy-and-janky share: 2.9 % (desktop 1440), 3.5 % (1024), 8.1 % (native 1440). Warm-up probe: 18 / 17 LoAFs, worst work 5 / 16 ms, 0 blocking. Reveal frame 731 ms with 0 work; native act-1 1,607 ms LoAF with 23 ms of work. So the absolute fps, p95 and LoAF counts are SwiftShader; only the differences between rounds and sections carry information.

Refs: `R/screencast/*/screencast.json -> loaf`; `R/probes-1440/p3-probes.json results.loaf`; `R/probes-1024/p3-probes.json results.loaf`

### F4 (high, app): CLS is non-zero everywhere and regressed at 1440 (0.0454; r2 0.006)

0.025 at 32.9 s in #films (`div.mt-tier-block` + two `div.pointer-events-none.absolute.inset-y-0`), reproduced in alt (32.6 s) and in the reduced-motion run (26 s): a layout shift independent of motion; r2 had 0 in rm. 0.0134 at 17.0 s in #work (`span.scene-caption__moment.world-face-idiots`); 0.0005-0.0018 on every caption span carrying a `world-face-*` class (likely the per-world face arriving after the caption laid out); 0.003-0.0113 in #beyond on `span[data-w]` inside `[data-words=scrub]` (0.009-0.0095 at 1024 in desktop, native, alt and gl). Spec 12.1 says CLS 0 and 'keyed on the boot gate only'.

Refs: `R/motion/1440/summary.md 'desktop - layout shifts', 'rm - layout shifts'`; `R/motion/1024/summary.md 'desktop - layout shifts'`

### F5 (high, mixed): Intro: the reveal hitches, the name still pops in, hold carries script, and intro fps regressed

1440: one 733 ms frame at the reveal (P3-0 landing worst 192 ms); reader clip #9 (reveal) 383 ms max frame at 1440, 333 ms at 1024; 1024 hold 415 ms frame. Name: one-step appearance at 8.04 s (reveal 5.84 s), 11.1 % of the frame (strip pop-intro-77); at 1024 7.33 s with a single partial frame, 'fill-in' pop 7.3 % (pop-intro-99). Hold tasks with real work: 76 ms rAF script (1440, 5.65 s) and 112 ms setInterval (1024, 5.6 s), 0.2-0.5 s before the reveal: likely the hand-off, 8-11x the < 10 ms budget. Play screen: 12.5 fps at 1440 (P3-0 22.7) with ~1.5 s of script on it (1,013 + 285 + 104 + 64 ms of script). Intro 18.5 fps (P3-0 29.5). Headed reader intro: flight 9.4 fps, titles 14.4 fps (p95 116.7) at 1440; 15.7 / 23.4 at 1024. On the good side: the reveal and titles rows no longer list `#intro` as a repainting node (P3-0 x6) and the hero video is repainting, so the loop is probably playing.

Refs: `R/motion/1440/strips/intro.jpg`; `R/motion/1440/strips/intro-landing.jpg`; `R/motion/1440/strips/pop-intro-77.jpg`; `R/motion/1024/strips/intro-landing.jpg`; `R/motion/1024/strips/pop-intro-99.jpg`; `R/screencast/reader-1440/clips.json #1-#12 (esp. #1, #9)`; `R/screencast/reader-1024/clips.json #1, #9`

### F6 (high, mixed): Principles is the worst section in most recordings and costs raster even with motion off

Lowest median clip fps of any section in reader-1440 (6.3; clips #225-#240, #238 366 ms), skimmer-1440 (5.5; #99-#108, #101 633 ms / 3.4 fps), skimmer-1024 (5.8; #72-#79), director-1440 (7.5; #176-#186); third in reader-1024 (9.8; #225 450 ms). motion.js: 1024 desktop 4.4 fps (13 frames), native 2.9 / 4.3, gl 3.6 at 1440; 11-12 will-change layers (budget 8). Reduced-motion run at 1440: principles 31.5 fps with `div.hidden.will-change-transform.xl:block` x10 repaints and 580 ms/s raster, every other rm section 60. The strips show the act-4 -> principles hand-off ('The Light' -> Map of the Principles) taking ~2 s of wall clock for 100-155 px of scroll at both widths (1440: 61.5 -> 63.7 s; 1024: 57.3 -> 59.2 s) although the rAF record has no frame gap above 0.47 s there: unexplained.

Refs: `R/motion/1440/strips/desktop-act-4.jpg`; `R/motion/1024/strips/desktop-act-4.jpg`; `R/motion/1440/summary.md 'rm - per section'`; `R/screencast/reader-1440/clips.json #225-#240`; `R/screencast/skimmer-1440/clips.json #99-#108`

### F7 (medium, mixed): Act-1 -> about is the first thing a visitor scrolls through, and it is among the three worst passages in every recording

Median clip fps in act-1: 6.4 reader-1440 (#22-#34, #31 4.5 fps), 8.1 reader-1024, 6.1 skimmer-1440 (#7-#14), 7.8 skimmer-1024, 8.1 director. motion.js: card transition 7.6 fps at 1440 (P3-0 26.2), native 3.9 with a 1,607 ms LoAF (23 ms of work) and a 1,883 ms frame. The strip shows 0.5-0.7 s gaps at t 4.0 -> 4.7 s and 4.8 -> 5.3 s and ~1.6 s for 154 px at 5.3 -> 6.9 s (about section). Strip frames are equally spaced in scroll distance, so a long time gap means little scroll progress for that wall-clock time: the same unexplained pattern as F6.

Refs: `R/motion/1440/strips/desktop-act-1.jpg`; `R/screencast/reader-1440/clips.json #22-#34`; `R/screencast/skimmer-1440/clips.json #7-#14`

### F8 (medium, mixed): The journey seam push (B12) and the journey opening (B09) are worst-clip moments in 4-5 of 5 recordings

B12 / B12-push (the ICE camera seam): reader-1440 #57 (5.2 fps, 450 ms), reader-1024 #54 (5.7 fps, 500 ms), skimmer-1440 #26 (B11 + B12, 6 fps, 417 ms), skimmer-1024 #21 (4.8 fps, 500 ms), director #34 (8.5 fps, 467 ms). B09: reader-1440 #44 (383 ms), reader-1024 #43 (4.2 fps, 417 ms), skimmer-1440 #19 (3.0 fps, 450 ms), skimmer-1024 #16-#17, director #21. Journey at rest: 0.3 fps (1440) / 0.6 fps (1024), P3-0 60.3. The same seam fails drift #2 in GL at 1024 (.944) and holds the only 2+ stars clips in the reader runs.

Refs: `R/screencast/reader-1440/clips.json #44, #57`; `R/screencast/reader-1024/clips.json #43, #54`; `R/screencast/skimmer-1440/clips.json #19, #26`; `R/screencast/skimmer-1024/clips.json #17, #21`; `R/screencast/director-1440/clips.json #34`

### F9 (medium, app): Things that should be still at rest are not

Idle (parked, then traced standing still): journey 0.3 / 0.6 fps (P3-0 60.3); act-4 27.1 fps at 1440 with `div.act-card-shape` x3 repainting, 39.5 ms/s raster, 6 paints/s (P3-0 60.6); hero 14.8 fps at 1440 (P3-0 31.9; raster is lower, 91.6 vs 560 ms/s: the loop video is the likely cost). Idle style+layout 10.9-15.2 ms/s in six sections (about, trading-algos, optuna-screener, act-3, voices, credits; P3-0 <= 4.5) and idle rAF script 11-34 ms/s in every section but journey (P3-0 6-10). 21 infinite animations on screen in act-4 and 9 in act-3 / voices (P3-0 0). The 1024 gl run lists `div#intro-film` as the top repainting node in journey (x24 of 25) and trading-algos (x17 of 26): an intro element repainting 5,000+ px below the hero.

Refs: `R/motion/1440/summary.md 'Idle probe'`; `R/motion/1024/summary.md 'Idle probe'`; `R/motion/1024/summary.md 'gl - per section'`

### F10 (medium, app): Camera and stage layers repaint on most scroll frames instead of compositing

`div.act-card-stage` is the top repainting node in 73-100 % of the document paints of act-1, journey, work, trading-algos, films, beyond, writing, voices and principles (1440 desktop); `div.stage-cam` x16 of 26 paints in credits (1440); `plate-cam` x3 in contact and x7 in kill-list (alt); `campSticky` x22-25 in act-4; `header` fixed layer x15 in act-3 (native). Raster during scroll is about 290-980 ms/s in every section of the Lenis desktop runs vs ~0 at rest. A transform/opacity-only camera shows ~0 repaints; these nodes drive masks, clips, filters or vars. Raster diet items 2, 3, 4, 6 and 8 are not shown fixed (T14, T16, T17).

Refs: `R/motion/1440/summary.md 'desktop - per section' (top repainting nodes)`; `R/motion/1024/summary.md 'desktop - per section'`

### F11 (medium, mixed): Every screencast is slower than round 2, and the fast-scroll experience is a slideshow in this setup

Reader 1440 15.8 -> 14.0 fps (p95 150 -> 166.7; > 50 ms 53.4 -> 63.0 %), reader 1024 21.9 -> 19.1 (23.1 -> 34.0 %), skimmer 1440 9.2 -> 8.6 (86.9 -> 94.6 %), skimmer 1024 13.1 -> 11.0 (55 -> 68.4 %), director 14.6 -> 12.2 (62.7 -> 82.0 %): 5 of 5 down 6-16 %. Control: motion.js 1440 desktop is level (14.8 -> 15.1) and native 1440 faster, so the machine was not uniformly slower, but the screencasts are headed with readback and one run each. Skimmer 1440: 67 % of clips < 10 fps, 12 % < 5 fps, 33 % contain a frame >= 250 ms and 6 % >= 400 ms; every section 6-13 fps. Skimmer 1024: 39 % < 10 fps, 21 % with a >= 250 ms frame. Reader 1440: 31 % of clips < 10 fps.

Refs: `R/screencast/skimmer-1440/screencast.json summary.raf`; `R/screencast/skimmer-1024/screencast.json summary.raf`; `R/screencast/reader-1440/screencast.json summary.raf`; `R/screencast/director-1440/screencast.json summary.raf`

### F12 (low, mixed): INP at 1440 and LCP

Games probe INP: 544 ms keydown (delay 0, run 7) at 1440 vs 192 ms at 1024; the failing class repeats each round (688 / 272 / 544 ms). Dead Eye's grade overlay passes its own check (z -1) but reads `transition: all`; whether it contributes is unknown. Desktop LCP 724-816 ms vs <= 400 (P3-0 256-368).

Refs: `R/probes-1440/p3-probes.json results.games.checks.inp`; `R/probes-1024/p3-probes.json results.games.checks.inp`

### F13 (low, app): Small script tasks at lazy-chunk time (42-60 ms)

`classic-script 19vq58ko3wg2v.js` 42 ms (writing, 1440) and 57 ms (writing, 1024); `TimerHandler:setTimeout` 60 ms in beyond (1024 desktop); `setInterval` 48 ms in films (1024); `Promise.resolve` 26 ms in voices (1440). Each is a LoAF of 65-327 ms by duration but under 60 ms of work; borderline against the 50 ms bar.

Refs: `R/motion/1440/summary.md 'desktop - LoAFs with the most main-thread work'`; `R/motion/1024/summary.md (same)`

### F14 (positive, n/a): What improved or held

Pops 27 -> 2 / 10 on the Lenis path; p95 and max tail shorter than P3-0 at 1440; work 4x, principles 3.2x (1440), films 1.7x, writing 2x, journey 1.6x vs P3-0; reduced motion 58-59 fps; writing's 8 filters are gone; after the intro, the reader recordings have no task with >= 50 ms of work in the 3 s after quiet-end at either width; the warm-up probe's LoAFs are all raster; games INP passes at 1024; the default desktop run's worst frame is 767 ms (1440) / 683 ms (1024) against P3-0's 1,117 ms and native's 1,883 / 1,250 ms.

Refs: `R/motion/1440/summary.md`; `R/motion/1024/summary.md`; `R/probes-1024/p3-probes.json results.games`

### F15 (info, measurement): Limits of this verdict

One run per cell; sections with <= 15 frames flip between pass and fail (1024 principles 13 frames here vs 59 in r2; 1440 kill-list 13). The pop detector skips frames where scroll moved >= 40 px, so Lenis runs under-count pops. No P3-0 run at 1024. The 'alt' run is not defined in the J8 inputs (treated as a second Lenis run). 4.4 rows needing the intro trace were not re-measured (#intro repaints, hand-off script, name frame, media state). The reader and skimmer recordings never wheel-scroll inside the 3 s after quiet-end. Nothing here shows real-GPU behaviour.

Refs: `R/MANIFEST.md section 2 J8 and section 3 caveats`

## Recommendations (behaviour, in priority order)

1. **Make sure no idle-time job can hold the main thread for more than about 50 ms, and keep all of it away from the play screen and from the first 2,000 px of scroll: run it in small slices, yield to input, and start only after the intro has ended and the visitor has stopped scrolling for a moment.**  
   Why: The only app-owned long task in the data (100-1,013 ms), and it lands on the two moments that set the first impression: Play and the first scroll. It is the worst clip of skimmer-1440 and an outlier in all five recordings.  
   Check: Re-capture: no LoAF with >= 50 ms of work on the play screen or at y < 2,000 in any recording; clips #19 / #18 / #10 / #6 / #11 stop being outliers; intro play-screen script < 100 ms.

2. **Bring layout shift to exactly 0: reserve the space of the films-section block that moves at about 33 s (it also moves under reduced motion), make caption lines keep their size when the per-world face arrives (fallback with matched metrics, or have the face ready before the caption enters), and split the scrubbed words before first paint in beyond.**  
   Why: Spec says 0; r3 is 0.0454 at 1440 (r2 0.006) and non-zero in 9 of 12 runs. These are deterministic, so they are real regardless of the GPU.  
   Check: CLS 0 in desktop, native, alt, gl and rm at both widths.

3. **Make the reveal a pure compositor wipe and the name an on-time fade: do the heavy preparation during the hold, with no script in the last half second before the reveal; show the name on the second reveal frame by fading opacity, never appearing in one step. If the titles design deliberately sequences caption then name, change section 4.4's wording to match.**  
   Why: The single biggest visible hitch (731 ms at 1440), the one-frame name pop at both widths, and a 76 / 112 ms script task at hold are all in the first 10 seconds.  
   Check: Intro trace: reveal-frame max < 100 ms headless; name present on frame 2, no pop in the strip; no task > 10 ms between hold and reveal.

4. **Cut principles to at most 8 promoted layers and remove or flatten the large xl-only block that costs raster even with motion off.**  
   Why: Worst section in 4 of 5 recordings; rm at 1440 is 31.5 fps against 60 everywhere else; 12 / 11 layers against the budget of 8.  
   Check: rm principles >= 55 fps at 1440; desktop principles >= 4.95 at 1024 on at least 40 frames; skimmer/reader principles no longer the lowest-fps section.

5. **Lighten the first scroll and the last card. Act-1: fewer large images and masks in view at once. Act-4 (and act-3 / voices): the 21 and 9 infinite animations pause while a card transition is running and whenever they are off screen.**  
   Why: Act-1 and act-4 are the sections that got 3-4x slower than P3-0 (28.8 -> 7.7, 38.0 -> 12.6 fps); act-1 is where every visitor starts scrolling.  
   Check: act-1 and act-4 card transitions back above P3-0's 26 / 29 fps on the Lenis path, or at least above 15.

6. **Find out why the journey section is not producing frames at rest (0.3 / 0.6 fps) and why act-4 at 1440 keeps repainting its card shape at rest; then make rest truly still: only a visible loop may run.**  
   Why: P3-0 idled at 60 fps in both. Something is looping or stalled, and it is a defect on a real GPU too.  
   Check: Idle probe: every section >= 55 fps at both widths, hero excepted until a real-GPU read.

7. **Calm the journey seam push (B12) and the journey opening (B09): make the push cheaper, or shorten it, so that it holds frames in the relative measure.**  
   Why: Worst or near-worst clip in 4-5 of 5 recordings at 416-500 ms per frame; also the drift #2 failure at 1024 and the only 2+ stars clips.  
   Check: Clips for B12 / B09 no longer in each run's worst ten; drift #2 >= .95 at 1024.

8. **Stop plate cameras, stage layers and cards from re-rasterising on every scroll frame: movement by transform and opacity only, and no filters, masks or blends on anything that moves.**  
   Why: Act-card-stage, stage-cam, plate-cam and campSticky repaint in 73-100 % of paints; raster during scroll is about 290-980 ms/s against about 0 at rest; raster-diet items 2, 3, 4, 6 and 8 are not shown fixed.  
   Check: Repaint-node list shows <= 2 repaints per card transition; will-change and filter counts match the diet table.

9. **Aryan's real-GPU pass on the laptop is now the deciding measure; ask for it on these five moments: the first scroll through act-1, journey B12, principles, kill-list and the intro reveal, plus a fast fling, with the Media panel open for the hardware decoder.**  
   Why: The raster-bound misses (skimmer 8.6 fps, intro fps, INP 544 ms) may disappear on a GPU, or may not; headless cannot say. Until then the score carries about a point of uncertainty either way.  
   Check: Spec 12.1 real-GPU row: p95 <= 20 ms, <= 2 % of frames > 33 ms, none > 50 ms in cards, idle 60 fps.

10. **Tighten the measurement for the next round: three motion.js runs per width with the spread reported; the intro trace so the four 4.4 rows are measured; LoAFs tagged by work >= 50 ms next to the duration count; a P3-0-style baseline at 1024; define the 'alt' run in the manifest; and let the pop detector see continuously moving frames.**  
   Why: Several verdict rows rest on 13-19 frames and one run, and four 4.4 rows are unmeasured.  
   Check: Each headline row carries a spread and a frame count.

## Not measured / caveats

- No real-GPU run; spec 12.1's real-GPU row and the Media-panel check cannot be judged here.
- Four section 4.4 rows need the intro trace and were not re-measured: `#intro` repaints, hand-off script time, the name's frame, `data-media-state` at reveal t0. T24, T27 and T29 give the nearest indirect evidence and are marked as such.
- One run per cell; rows resting on 13-19 frames (1024 principles, 1440 kill-list, journey) can flip between two runs without a code change.
- The pop detector ignores frames where scroll moved 40 px or more, so Lenis runs under-count pops; compare the native run for like-for-like.
- No P3-0 run exists at 1024; the 1024 columns are judged against the (1440) spec numbers and round 2.
- The 'alt' run is not defined in the J8 inputs; treated as a second Lenis run.
- Not opened: source code, earlier rounds' folders, other judges' verdicts. LCP is quoted from the manifest table.
