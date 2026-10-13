# J8 SMOOTH · round 2 verdict

**Score: 2.5 / 5.**

The 1440 width misses the headline floor (14.8 fps, floor 15.2) and is slower than round 1 in every run. The 1024 width
meets the headline. Most frame-time misses are SwiftShader raster waits: 77–85 % of the LoAFs over 50 ms carry under
5 ms of main-thread work. But there are real app stalls of 0.2–0.7 s:
- in the first seconds of scrolling;
- in the opening card;
- in films.

CLS is still above 0. The relative raster hotspots are app content, not the machine.

Inputs: `R/MANIFEST.md` (§1, J8), `R/motion/{1440,1024}/` (summary, motion.json, strips), `p3-before/summary.md`,
`R/screencast/*/screencast.json` + `clips.json` (sheets viewed: reader-1440 sheet-24, skimmer-1440 sheet-01),
`R/probes-{1440,1024}/p3-probes.json` (loaf, games), PHASE3-SPEC §12.1 and §4.4. Machine: 4 CPUs, no GPU. Absolute
numbers are relative only. "App" means main-thread work or raster cost that comes from the page's content. "Env" means
a frame that is slow with about 0 ms of work, which is a raster wait.

## Targets

| measure | target | 1440 | 1024 | met | app / env |
|---|---|---|---|---|---|
| desktop (Lenis) fps | ≥ 15.2 (stretch 18) | **14.8** (r1 17.0) | 21.7 (r1 23.4) | 1024 only | both (see F4) |
| desktop p95 | ≤ 316.7 ms | 233.3 | 150 | ✔ | |
| work · principles · journey · kill-list fps | ≥ 4.8 · 4.95 · 5.25 · 5.85 | 19.7 · **4.2** · 7.6 · **5.4** | 34.1 · 19.1 · 9.9 · 11.2 | 1024 only | app raster (few frames) |
| desktop pops | ≤ 12 | 4 | 6 | ✔ | |
| desktop CLS | 0 | **0.006** | **0.0133** | ✘ | app |
| native (`?skip=smooth`) fps / p95 | ≥ 15.2 / ≤ 316.7 | **8.1 / 433.3** | **14.0** / 250.1 | ✘ | app raster |
| native section floors | as above | 12.6 · **3.1** · **4.1** · **3.2** | 33.1 · **4.0** · 5.8 · 8.3 | ✘ | app raster |
| native pops / CLS | ≤ 12 / 0 | **52 / 0.0173** | **40 / 0.0149** | ✘ | set pieces + app |
| gl fps / p95 | ≥ 15.2 / ≤ 316.7 | 16.1 / 200.1 | 22.9 / 133.3 | ✔ | |
| gl section floors | as above | 23.3 · **4.8** · 8.8 · 6.0 | 34.6 · 18.1 · 12.0 · 12.6 | 1024 only | |
| gl pops / CLS | ≤ 12 / 0 | 7 / **0.0141** | 11 / **0.0139** | CLS ✘ | app |
| rm fps / CLS | – / 0 | 59.7 / 0 | 59.8 / 0 | ✔ | |
| intro fps | ≥ 29.5 | **20.8** | 31.8 | 1024 only | env (≤ 8 ms work) |
| intro p95 | ≤ 116.6 | 116.7 (one frame quantum) | 66.7 | at the bar | env |
| intro LoAF > 50 ms, warm → titles-end | none | **45** (max 657, block 25) | **25** (max 405, block 24) | ✘ | env |
| `#intro` repaints in the reveal | 0 | 0 (proxy) | 0 (proxy) | ✔ | |
| landing raster | ≤ 150 ms/s | **371** (proxy, 1 frame) | **185** (proxy) | ✘ | mostly env |
| hand-off script | < 10 ms | – | – | not measured | |
| name on the 2nd reveal frame, no pop | – | **pop at 7.92 s** | **pop at 7.07 s** | ✘ | app |
| sea never still at reveal | loop playing | moves (strip) | moves | ✔ (visual) | |
| intro CLS | 0 | 0 | **0.0094** (hero compass) | 1440 only | app |
| no LoAF > 50 ms in the 3 s after quiet-end while scrolling | none | **skimmer 15 (work 233 ms); cut 19 (242 ms)** | **skimmer 24 (work 321 ms)** | ✘ | **app** |
| no LoAF at GL create / compile | none | gl ignite: 934 ms frame, 865 ms blocking, 16 ms script | – | not isolated (suspect) | app, env-amplified |
| INP (games) | ≤ 200 ms | **272** (input delay 5 ms) | 176 | 1024 only | likely env |
| desktop lab LCP | ≤ 400 ms | **772 / 624 / 280** | **748 / 904 / 748** | ✘ | mixed |
| idle 60 fps (idle probe) | 60 | **journey 0.5**, act-1 28, top 29 | **journey 20.5** | ✘ | journey app; act-1/top env |
| real-GPU row | Aryan's laptop | not measured | not measured | – | the targets that count |
| skimmer screencast (vs r1) | no regression | 9.2 (9.6) | 13.1 (12.8) | flat | env-dominated |
| reader screencast (vs r1) | no regression | **15.8** (17.0) | **21.9** (23.6) | ✘ (−7 %) | |

## Where it is worst

**Sections**
1. **principles: B54, the Map of the principles.** It is the slowest place in every capture:
   - reader-1440 clips #231–235: 3.9–4.5 fps, 0 ms work (sheet-24);
   - reader-1024 clips #220–224: 4.2–6.0 fps;
   - skimmer-1440 clips #90–95 and skimmer-1024 clips #66–71: 2.7–5.5 fps;
   - director's cut clips #182–186.

   This is pure raster: a full-width parchment with masked panels.
2. **act-1, the opening card.** The motion.js transition runs at 6.7 fps at 1440 (P3-0: 26.2) and 10.8 fps at 1024.
   In the reader runs, 96 % / 60 % of frames are over 50 ms. On screen: 18 will-change layers, 14 infinite animations
   and the card stage repainting ×18. The two biggest app stalls (F1 and F3 below) land here; the 708 ms freeze is in
   skimmer-1440 clips #7–9, on "The Crossing".
3. **contact.** 2.5–2.8 fps in every Lenis run (few frames). Raster is about 1,000 ms/s while the act-4 stage repaints.
4. **about / journey.**
   - Native about runs at 2.3–3.2 fps.
   - The journey sticky column still repaints in top and about.
   - Journey at rest runs at 0.5 fps (1440) and 20.5 fps (1024).
5. **films.** The B34 finale is slow: reader-1440 clip #154 at 3.5 fps, and skimmer-1440 clip #64 has a 750 ms frame
   that is raster. Separately, Motion rAF frames spend 64–175 ms in script.

**Transitions**
- **Opening:** worst at both widths.
- **Seam:** 12.5 fps at 1440, flat against P3-0.
- **Ignite:** 17.1 fps at 1440 against P3-0's 29.2. The gl run has a 934 ms frame here.
- **Tintype:** best (29.8 / 42 fps), but at 1024 on the default URL it shows a one-frame grey-box flash
  (`motion/1024/strips/pop-desktop-582.jpg`).

## Causes visible in the data

### App problems

- **F1. Idle-callback warm-up tasks of 0.1–0.7 s.** These come from chunk `3-hs4lm3bz94q.js:192`, a run-when-idle
  wrapper that ignores the idle deadline.
  - skimmer-1440, opening card: 708 ms;
  - skimmer-1024, act-1: 320 ms;
  - journey: 435 ms (motion.js);
  - voices: 147 ms;
  - the director's cut start: 96–222 ms.
- **F2. The quiet window ends before hydration when the intro is skipped.** `p3:quiet-end` comes at 1.03–1.18 s and
  `page:hydrated` at 1.49–1.64 s. Hydration's largest task is 528–652 ms. In the intro run at 1024 it is 808 ms on
  the play screen; P3-0 had 137 ms.
- **F3. A ResizeObserver → 180 ms debounce → full re-measure**, at `1_2f9ddauvl4s.js:18755`, costs 100–320 ms of script
  mid-scroll. It shows up in act-1, about, optuna-screener and voices.
- **F4. Raster cost per frame has grown.** The native run uses the same scroll method as P3-0 and reaches about half the
  baseline frame rate (8.1 vs 15.2 fps). Against round 1, every run is 7–21 % slower.
- **F7. Layers repaint outside their window:**
  - the act-3 card stage, ×100 while the reader is in films;
  - the act-4 card stage, ×41 in writing, ×17 in principles and ×3 in contact;
  - the hero video in `#top`, ×11–22 in journey, work and trading-algos;
  - the voices campSticky, ×26–43;
  - the journey sticky column.

  Raster-diet items 3 and 6 are not finished.
- **F8. Journey repaints at rest.**
- **F9. The Motion frameloop spikes in films**, at 64–175 ms of script per frame.
- **F10. CLS sources:**
  - the scrubbed sentence in `#beyond`;
  - world-face film names in the scene captions;
  - the writing h3s;
  - the hero compass on the play screen at 1024.
- **F11.** A probable mid-card tier switch on tintype at 1024.
- **F12.** The intro name still lands as a single-frame cut.

### Environment artifacts

- Most frame times: 77–85 % of the LoAFs over 50 ms carry under 5 ms of work.
- The intro LoAF count (at most 8 ms of work) and the probe's warm-up LoAFs (worst work 8 / 2 ms).
- Games INP: the input delay is only 5 ms.
- act-1 and top idle at about 30 fps with zero raster, which is the sea loop's cadence.
- The 63/64 ms `PerformanceObserverCallback` exactly at `intro:hold` appears only in the debug screencasts, so it is
  harness overhead.

## Recommendations (priority order, behaviour)

1. **No long task while the page moves.** Split warm-up and deferred setup into slices that yield within the idle
   deadline. Pause the warm-up ladder while the page is scrolling or a card is playing its set piece.
2. **Make the quiet window hold when the intro is skipped.** It should not end before hydration finishes, and the first
   3 s of a fling should meet no task over 50 ms. Hydrate below-the-fold sections later or in smaller pieces.
3. **Stop the whole-page re-measure on content resizes.** Re-measure only what changed, or only on a real viewport
   resize. Keep content heights stable after load.
4. **Cut raster where the reader is:**
   - make the Map of the principles (B54) one static layer that moves by transform;
   - stop card stages painting outside their window;
   - stop and hide the hero video once it is off-screen;
   - finish raster-diet items 3 (journey sticky) and 6 (voices campSticky).
5. **Lighten the opening card.** Pause loops that are off-screen and drop will-change from layers that are not moving.
6. **Make journey go quiet at rest.**
7. **Stagger the films entrances** so that no frame runs 64–175 ms of animation script.
8. **Close CLS to 0:**
   - the scrubbed sentence reserves its final layout;
   - the caption film names keep their metrics when the world face swaps in;
   - the hero compass reserves its box.
9. **GL:**
   - switch tier only at p ends;
   - compile and upload before the ignite card.
10. **Intro name:** a short fade or wipe instead of a one-frame cut.
11. **Measurement:**
    - run the real-GPU row on Aryan's laptop, because it is the actual target;
    - re-run the §4.4 intro trace;
    - take 3 runs per width before acting on single-section rows.
