# J8 SMOOTH · round 1 (p3-r1)

**Score: 3 / 5 (a low 3).** Full data: `j8-smooth.json` (37 target rows, 20 findings, 9 recommendations).

The machine has 4 CPUs and no GPU (SwiftShader). Every number below is read relative to the P3-0 baseline, which was taken on the same kind of machine. A slow frame with about 0 ms of main-thread work is a raster wait (environment-scaled). A long animation frame (LoAF) with real script or layout is an app cost.

## Verdict in one paragraph

On the default path (Lenis), both widths meet the headless floors: 17.0 / 23.4 fps against a floor of 15.2, p95 200 / 133 ms, and 10 / 12 pops. Work, journey and kill-list improve 2–4× on the baseline. Principles misses its 1.5× target at 1440 by 0.05 fps. Six things hold the score at 3:

- **The intro regressed.** At 1440 it runs at 20.2 fps against the baseline's 29.5.
- **CLS is not 0 in any run.** Reduced motion has the largest single shift: 0.12 at 1024.
- **The main thread is busy after the titles.** Real script runs as the first scroll starts: 83–367 ms of idle-time work, plus a 180–350 ms first-scroll observer pass.
- **One idle task stalls a fling.** It runs for 500 ms during a skimmer fling.
- **Act-1 is now the slowest transition on the page.** The opening card runs at 4.8 fps, against 26.2 for the old act-1.
- **Three designed effects end in one-frame cuts.** They are the act-2 title mask, the act-4 hall flash and the films hand-off.

With native scroll, which uses the same driver as the baseline, the page went backwards: 15.2 → 10.2 fps and 27 → 42 pops at 1440.

## Targets

| measure | target | 1440 | 1024 | met |
|---|---|---|---|---|
| desktop fps (floor / stretch) | ≥ 15.2 / ≥ 18 | 17.0 | 23.4 | floor yes · stretch 1024 only |
| desktop p95 | ≤ 316.7 ms | 200.1 | 133.3 | yes |
| desktop pops | ≤ 12 | 10 | 12 | yes* |
| desktop CLS | 0 | 0.0196 | 0.0435 | **no** |
| work · principles · journey · kill-list (desktop) | ≥ 4.8 · 4.95 · 5.25 · 5.85 | 14.7 · **4.9** · 7.2 · 12.3 | 24.1 · 7.1 · 10.8 · 16.2 | 1440 principles **no** |
| native fps / p95 | ≥ 15.2 / ≤ 316.7 | **10.2** / **333.3** | 16.1 / 250 | 1440 **no** |
| native pops / CLS | ≤ 12 / 0 | **42** / **0.0204** | **35** / **0.0321** | **no** |
| native principles · journey | ≥ 4.95 · 5.25 | **2.0** · 7.5 | **3.6** · **4.6** | **no** |
| native work · kill-list | ≥ 4.8 · 5.85 | 8.4 · 7.3 | 10.3 · 8.8 | yes |
| gl fps / p95 / pops | as desktop | 18.7 / 183.4 / 8 | 25.8 / 116.5 / 5 | yes (the smoothest mode) |
| gl CLS / principles | 0 / ≥ 4.95 | **0.0171** / **4.5** | **0.0438** / 7.1 | **no** |
| intro fps / p95 (§4.4) | ≥ 29.5 / ≤ 116.6 | **20.2** / **116.7**† | 33.6 / 66.7 | 1440 **no** |
| intro LoAF > 50 ms, warm → titles-end | none | **38** (blocking 17 ms) | **27** (blocking 30 ms) | **no** (raster) |
| `#intro` repaints in the reveal (proxy) | 0 | 0 | 0 | yes (proxy) |
| landing raster (proxy) | ≤ 150 ms/s | **591.8** | **161.5** | **no** (proxy) |
| hand-off script (proxy) | < 10 ms | **148 + 367 ms** | **161 ms** | **no** (proxy) |
| name on the 2nd reveal frame, no pop | — | **8.44 s, pop** | **7.59 s, fill-in pop** | **no** |
| sea never still | — | not measured | not measured | — |
| main thread, 3 s after quiet-end (§12.1) | no LoAF > 50 | **3 with real work** (225 / 145 / 83 ms) | **1** (144 ms) | **no** (app) |
| RM CLS | 0 | **0.061** | **0.1164** | **no** |
| INP | ≤ 200 ms | **688** (0 ms input delay) | 56 | 1440 **no** (raster) |
| warm-up LoAF probe | none > 50 ms | **25** (work ≤ 12 ms) | **22** (work ≤ 14 ms) | **no** (raster) |
| lab LCP (load, not motion) | ≤ 400 ms | **204 / 704 / 800** | **688 / 716 / 732** | **no** |

\* Pops under Lenis are partly a measurement artifact. A pop needs a frame where the page scrolls < 40 px, and Lenis frames usually move further, so fewer frames qualify. On the baseline's own driver (the native run) the counts are 42 / 35.

† 116.7 against 116.6 falls in the same 7-vsync bucket, so it misses by the letter only.

"Proxy" rows come from the per-section table, because the manifest says the formal intro trace was not re-run.

1024 has no baseline of its own. Judging it against the 1440 baseline is lenient, since it has 0.6× the pixels to raster.

## Worst places

1. **Act-1 opening card.** At 1440 it runs at 4.8 fps (p95 733 ms, max 800 ms) against 26.2 for the old act-1. It is also the lowest card at 1024 (11.6 fps). See `motion/1440/strips/desktop-act-1.jpg` and reader-1440 clips #26–#30 (3.2–5.5 fps). On screen at once: 14 infinite animations, 4 masks and 18 promoted layers, while the hero's layers repaint under the card.
2. **Principles (B55, the Map).** It is the worst section in every screencast: skimmer-1440 #92 (2.0 fps, 617 ms), skimmer-1024 #70, reader-1440 #233, reader-1024 #219–#221, director #182. In native it runs at 2.0 fps, with a 1,228 ms frame. Its own content is light (7 promoted layers). The raster goes into repainting the act-4 card stage and the voices sticky layer.
3. **Contact.** It runs at 1.8–4.1 fps and holds the run's longest raster frames (667–801 ms). The cause is the same: the act-4 stage repainting.
4. **The intro hold and reveal.** The page freezes for 0.34–0.59 s. The name and all of the hero's controls then appear together in one frame, 1–2 s after the reveal. See `pop-intro-102.jpg` (1440) and `pop-intro-137.jpg` (1024).
5. **Act-2 seam.** The title mask snaps in and out in one frame (17–44 % of the frame). See `pop-desktop-108.jpg` (1440), and `pop-desktop-128.jpg` and `pop-desktop-152.jpg` (1024).
6. **Act-4 ignite.** The hall brightens, then drops back to dark in one frame (50–57 % of the frame), in every run. See `pop-desktop-679.jpg` and `pop-gl-739.jpg`.
7. **Films hand-off, 3 Idiots → RDR2.** The plate jumps and the next block fills in all at once (23–50 %, over 7–9 frames). See `pop-desktop-364.jpg` and `pop-gl-434.jpg` (1440), and `pop-gl-573.jpg` (1024).

## Causes visible in the data

**App: main-thread work**
- **Idle-time warm-up task.** It runs 500 ms in a skimmer-1440 fling (#29), 288 ms at act-1 (reader-1440 #27), 225 ms right after the titles, and 248 ms at 1024 (#31).
- **First-scroll IntersectionObserver pass.** It takes 177–349 ms in every motion-on run.
- **Journey entry.** A promise does 91–141 ms of script, in every run.
- **Kill-list and films.** The animation library's per-frame callback takes 58–120 ms.
- **Native only.** A 102–125 ms reading-line scan runs on a timer in films.

**App: raster**
- **Stale layers keep repainting.** Card stages repaint in neighbouring sections: act-2 in journey, act-3 in films and beyond, act-4 from writing through contact. The intro layer still repaints during act-1 through trading-algos in the native, alt and gl runs.
- **Idle repaints.** At rest, journey runs at 7.3 fps at 1440 (it was 60 in the baseline) and act-4 at 41.6 fps.

**App: CLS**
- the per-world font swap under the scrubbed sentences (#beyond, #about);
- the caption world-faces;
- the principles h3;
- a writing h3 that animates a layout property (4 small shifts per run);
- the play-screen SVG;
- the reduced-motion about/journey jump (0.06 / 0.12).

**Environment**
- LoAF and INP failures counted by duration; the main-thread work in them is only 12–30 ms.
- Absolute fps, and the 1440 < 1024 gap, which scales with pixel count.
- Screencast fps, which pays for frame readback.
- The 1440 hero idle reading of 0.6 fps, which needs a re-run.

The games are smooth: the drone flies at about 55–60 fps.

## Recommendations, in priority order

1. **Keep the main thread free while people scroll.** Idle and warm-up slices should take ≤ 10–15 ms, start only after scrolling settles, and never run in the 3 s after the titles. Split the first-scroll visibility pass so it measures a few elements per frame. Spread out or prepare ahead the work at journey entry and in kill-list and films.
2. **Make off-screen layers cost nothing.** Take finished or not-yet-started card stages, the intro layer after the hand-off, and the sticky columns outside their sections out of painting entirely. Zero opacity is not enough. This is what is holding principles and contact down.
3. **Lighten the act-1 card.** Stop the hero's ambient loops once the card covers the hero. Make the iris a move/fade of an already-drawn layer, not a redraw every frame.
4. **Bring CLS to 0.** Give text whose font changes per world a fixed line box. Animate the writing title without moving layout. Make the reduced-motion layout final at first paint.
5. **Ease the cuts.** The act-2 mask should dissolve over 200–300 ms. The act-4 flash should decay over at least 300 ms. The films hand-off should draw the next block a viewport early and let it arrive by a fade or move.
6. **Intro.** Draw the name and the hero's controls under the intro so they show on the 2nd reveal frame. Prepare the hero layer before the wipe so the reveal does not stall.
7. **Stop idle repaints.** Nothing in journey or act-4 should redraw at rest.
8. **Native path, lower priority.** In principles and contact, effects should step smoothly between wheel notches rather than jump. Recheck pops on the baseline's driver.
9. **Measure what this machine can't.** Re-run the 1440 hero idle probe, and do the §12.1 real-laptop pass. A GPU will shrink most raster waits, but it will not fix recommendations 1, 2, 4 and 5.
