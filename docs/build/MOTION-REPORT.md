# Motion report: before/after + admissions review (2026-09-30)

A measured motion pass on `design/three-films`: a baseline recording, a motion review, the fixes (`cccce75` and the regenerated intro bundle `a3b02d9`), a second recording, and an admissions-reader review of the site as it stands. No copy was changed.

## 1. Method

- **Harness:** `tools/capture/motion.js` (committed in `fb16d8e`). Each run records a CDP screencast of every frame, rAF frame timing, Long Animation Frames (LoAF), layout shifts (CLS), a paint trace while scrolling, and "pops": frames whose visual change survives undoing the scroll. It then writes strips at each act card and each pop.
- **Runs** (the same five before and after):
  - `intro`: the play screen, a click, the flight and the hand-off to the hero (1440×900).
  - `desktop`: a wheel scroll through the whole page at about 600–700 px/s (1440×900, `?skip=intro`).
  - `alt`: the same scroll on `variant=alt`.
  - `mobile`: raw touch strokes at 1200 px/s (390×844). Headless Chromium ignores synthetic scroll gestures.
  - `rm`: the desktop scroll with `prefers-reduced-motion`. This is the control: the same page and content with the motion layer off.
- **Scenes:** `tools/capture/scenes.js --only=desktop,mobile,rm` (98 frames, 0 console errors, 0 overflow), compared frame by frame with `docs/build/final-frames/`.

### The software-rendering caveat (read this before the numbers)

Headless Chromium here rasterises in **software (SwiftShader) on 4 CPUs** and also pays for the screencast readback.

- **Absolute fps are pessimistic.** A real laptop or phone GPU will do far better. About 99% of the long frames are the main thread *waiting on raster*, not running script: real script per frame is at most about 8–17 ms.
- **Compare relatively:** before against after, and one section against another.
- **The `rm` control is the ceiling.** At 55–57 fps it shows what the same page does with the motion layer off.
- **Run-to-run noise is large.** At 3–15 fps a section only gets about a dozen frames. A second `desktop` + `mobile` recording after the fix (`after-r2`) moved single sections by up to ±10 fps: desktop act-3 read 1.1 fps in one run and 12.6 in the next, and desktop act-2 read 17.0 and then 4.5. Only differences that repeat, or that are large (several ×), count as signal below.

## 2. Before / after

Whole runs (before → after):

| run | jank % (>33.4 ms) | p95 ms | longest frame ms | LoAF blocking ms | main-thread LoAF work ms | CLS | pops | fps |
|---|---|---|---|---|---|---|---|---|
| intro | 22.7 → 24.7 | 117 → 117 | 250 → 300 | **1087 → 465** | **1528 → 464** | **0.0051 → 0** | 6 → 6 | 29.2 → 27.3 |
| desktop | 30.5 → 27.9 | 317 → 317 | **3167 → 1450** | 409 → 221 | 364 → 362 | 0 → 0 | **28 → 19** | 12.9 → 13.4 |
| alt | 22.3 → 22.4 | 283 → 350 | 1133 → 1033 | 3081 → 4778¹ | 298 → 280 | 0 → 0 | 27 → 34 | 16.0 → 14.8 |
| mobile | 7.4 → 8.0 | 50 → 50 | **2300 → 283** | **516 → 44** | 117 → 153 | **0.0078 → 0** | 23 → 21 | **30.2 → 44.3** |
| rm (control) | 0.7 → 0.7 | 16.8 → 16.8 | 533 → 633 | 271 → 139 | 10 → 18 | 0 → 0 | 0 → 0 | 55.4 → 56.5 |

¹ The alt "blocking" figure is LoAF `blockingDuration` during frames that are almost entirely compositor wait (main-thread work only 280 ms in the whole run, down from 298). It isn't main-thread blocking and it isn't reproducible.

- **Intro, play screen:** the longest task fell from **984 ms** (887 ms blocking, the whole page hydrating in one pass) to **about 101 ms**. The worst play-screen frame fell from 984 to 257 ms.
- **Intro, hand-off:** the hand-off frame fell from 261 to 226 ms, with its main-thread work down from 116 to 65 ms.
- **Mobile:** the full scroll took **71.6 s instead of 105 s**. The Map no longer swallows about 36 s of it.

Sections that moved (fps / longest frame ms; before → after, with the second after run where recorded):

| section | desktop | mobile | rm (control) |
|---|---|---|---|
| top (hero) | 10.8 / 517 → 13.3 / 317 | 60 → 60 | 60 → 60 |
| principles (Map) | **1.5 / 3167 → 3.1 / 867** (r2 2.6 / 2000) | **2.1 / 2300 → 26.4 / 150** (r2 26.1 / 133) | 26.9 / 467 → 40.4 / 633 |
| contact (after the Map) | 3.0 / 717 → 1.7 / 1300 (r2 2.4 / 867) | **17.6 / 917 → 47.0 / 250** (r2 52.5 / 100) | 9.8 → 41.9 |
| writing (journal) | 3.5 / 667 → 3.8 / 883 (r2 4.9 / 733) | 50.6 / 67 → 37.8 / 67 (r2 41.9 / 83) | 60 → 60 |
| beyond | 8.2 / 567 → 12.6 / 500 (r2 6.4) | 48.6 → 43.9 | 60 → 60 |
| act-4 section | 31.0 / 483 → 31.9 / 433 | **30.3 / 433 → 60 / 17** | 60 → 60 |
| work | 3.5 / 717 → 3.4 / 950 (r2 4.7 / 617) | 36.8 → 36.6 | 60 → 60 |

Act-card transitions (fps / longest frame ms):

| transition | desktop | alt | mobile (stills) |
|---|---|---|---|
| act-1 (opening) | 16.9 / 483 → 14.9 / 650 (r2 14.9 / 750) | 13.9 / 500 → 13.8 / 717 | 60 → 60 |
| act-2 (I→II seam) | 20.0 / 767 → 14.5 / 667 (r2 4.3 / 633) | 23.3 / 533 → 20.6 / 550 | 34.1 → 25.4 (r2 28.7) |
| act-3 (II→III tintype) | 13.3 / 617 → 13.8 / 1383 (r2 12.2 / 733) | 17.7 / 583 → 12.1 / 567 | 55.6 → 55.6 |
| act-4 (III→IV ignite) | 23.3 / 483 → 26.6 / 433 (r2 27.1 / 350) | 30.1 / 300 → 22.1 / 450 | **17.5 / 850 → 42.1 / 117** |

Pops: the worst two before were writing y≈32,200 (46% of the frame) and act-2 y≈6,900 (45%).
- The **writing** pop is gone. The largest writing pop after is 10% of the frame.
- The **act-2** pop remains (45.7% at y 7,000).
- A new pop at contact y 36,900 (35%) is the lower Map rooms rastering in one frame. Before, the same place froze for about 3 s.

## 3. Per-transition verdicts (from the after strips)

- **Intro → hero hand-off: better.**
  - The T1 caption swap now runs in sequence: the old caption fades out at 9.46 s and the new one fades in by 9.78 s. The garbled "THE BLTOWARD THE BLACK PEARL" frame is gone.
  - The name sweeps in at 7.10 s. The header, nav and frame bracket follow a frame later instead of all snapping in on one frame.
  - The play screen answers a click about 0.9 s sooner, because the long hydration task is split.
- **Hero: better / same look.** The hero section runs at 13.3 fps against 10.8 before. Its frames are pixel-identical to `final-frames` D01 / m390-00.
- **Act I (opening card): same.** All three scene frames are identical to before. The fps change is within noise.
- **Act I→II seam (IceCut, default): look intact, still a hard cut in software.**
  - The ragged edge, aqua seam glow and chalk edge all match before (scene D10-act-2-mid is identical).
  - In the headless recording the storm-to-hall switch still lands in a single frame during a raster stall (pop-desktop-91, 45.7% of the frame).
  - The work now rides the compositor, so a GPU should show the sweep. Headless can't prove it.
- **Act I→II seam (ALT chalk sweep): better.**
  - The sweep is now caught mid-wipe across several frames (y 6,700–6,900), with the hall revealed behind a moving chalk edge.
  - The old "KRAKEN'S STORM" caption still sits over the hall plate for about two frames. This is unchanged.
- **Act II→III (tintype): same.**
  - The scene frames are identical.
  - One after run showed a 1.4 s raster stall (a half-drawn band at y 26,700). The second run didn't reproduce it (12.6 fps, 733 ms max), so it's noise.
- **Act III→IV (ignite): better.**
  - The recording now catches the in-between state: the hall with the Lumos scribble under the campfire caption at y 35,400, before "HARRY POTTER" settles. It no longer cuts from camp to hall in one notch.
  - On mobile the act-4 section went from 30 to 60 fps.
- **Principles (Marauder's Map): much better on mobile, better on desktop.**
  - Mobile runs about 12× faster (2.1 → 26 fps), with CLS at 0 and no more stalled strokes.
  - On desktop the 3.2 s frame is gone. The worst frame is 0.9–2.0 s, still the heaviest section in software.
  - The YOU banner glides on a transform, and every frame matches before.
- **Journal (writing): pop fixed; desktop same; mobile slightly slower.**
  - The 46% black-band pop is gone, and every frame matches before.
  - Mobile writing fell from about 50 to about 40 fps in both after runs.
  - The paint trace blames the Map's promoted parchment layers, which sit below and pre-raster tiles while the journal scrolls.
  - I tested removing that promotion on mobile (`sm:will-change-transform`). Writing stayed the same and the Map fell back to 12 fps, so I reverted it. It's a trade worth keeping.
- **Scenes check (desktop, mobile, rm):**
  - Every frame of the areas `cccce75` touched matches `final-frames`: hero, act 1–4 enter/mid/settled, writing, the Map, and the mobile top, writing and Map. No captions are lost, there are no layout breaks and no visual regressions.
  - The first scenes pass shot D10-act-2-enter about 2,400 px low, on Work. This was a cold-cache scroll flake: a re-shoot, and a probe of `#act-2`'s position over the scroll, both came out correct.

**Regressions:** none clear. The mobile writing dip, about 10 fps and repeated, is the one consistent loss. It is the cost of the Map fix and is accepted (see above). No code changed in this step.

## 4. What was fixed (`cccce75` + `a3b02d9`)

- **Principles Map:**
  - The YOU banner rides a transform, with no layout per step and no CLS, and glides 180 ms between steps.
  - The footprints, the active room's ink, the parchment and its wear each get their own layer.
  - The feTurbulence grain is baked once to a WebP tile (`tools/bake/textures.js`).
  - The static room drawing is memoised.
- **Hydration:**
  - Every page item except the hero hydrates in its own `Suspense` boundary.
  - The active section reaches only the header's ground, act label, Work pill and menu links, through context, instead of re-rendering the whole header.
- **Intro hand-off:**
  - `finish()` cancels its own WAAPI animations, with no `getAnimations()` style recalculation.
  - The video is unloaded and the h1 focused after the hand-off frame.
  - `intro:end` listeners run in the next task.
  - The T1 caption hand-off runs in sequence.
- **Act I→II IceCut:**
  - The ragged mask rides a composited transform on a layer three frames tall, with the hall counter-moved. There is no more `mask-position` scrub.
  - The blurred edge is baked to a PNG.
  - The saturation blend is now a grey copy faded by opacity.
  - The seam glow is pre-blurred strokes.
  - The ALT chalk sweep gets the same mask-on-transform treatment.
- **Act cards and hero:** the scrubbed plate layers get `will-change`. The progress line is a transform window instead of a clip-path scrub.
- **Act III→IV:** the hall's takeover spans .68–.92 (was .72–.88), and the canvas and drawn-hall fades are widened to match.
- **Journal:** the graphite SVGs sit on their own layers.

## 5. What remains (motion review items not addressed)

1. **Act III→IV pacing:** `--act-card-travel` for the ignite card is still 58vh. Making it longer (the review suggested 110vh) is **Aryan's pacing call**.
2. **Journal:**
   - The title's travelling dot still animates `left` (the only remaining layout shifts on desktop and alt, value about 0).
   - Furniture isn't baked to an image.
   - The Act II chalk filter (`worlds/idiots/chalk.tsx`) still draws inside a live filter.
3. **Hero velocity layers (`components/sections/hero/velocity-layers.tsx`):**
   - The speed signal still reacts to page-wide scroll.
   - The wake image and grain layers have no `will-change`.
   - `--vn` is written every frame.
4. **Mobile scroll trap:** `components/visuals/backtest-demo.tsx:152` is still `touch-none`, so a swipe on the chart doesn't scroll the page (re-confirmed at y 17,546). The review's one-line fix is `touch-pan-y`.
5. **Films finale and SVG overlays on photos** (`.films-finale`, `BoardFig`, tintype marks, ignite-lumos SVGs): no layer promotion yet.
6. **Act II plate-band entrances (`worlds/idiots/plate-band.tsx`):**
   - The `filter`, image scale and clip-path are still animated on the main thread.
   - No `will-change`.
   - A 150%-wide `mix-blend-screen` sweep band.
7. **Optional:** one scroll tracker for the Map instead of five.
8. **Unchanged visual nits in the strips:**
   - ALT act-2: the old caption sits over the new plate for about two frames.
   - ALT act-3: the "RED DEAD REDEMPTION 2" title is clipped by the letterbox as it enters, and "THE HEARTLANDS" caption overlaps another caption briefly.
   - Desktop act-1: the lower frame is blank until the pause.

## 6. Admissions review (summary)

**Verdict.** The hero is the strongest screen on the site. The substance is real, and both an admissions reader and a STEM faculty member would respect it. The problem is order. On a first laptop visit the reader gets about 7 s of Harry Potter before the name, then about 10 screens of film cards, bio and film stills before the first project. The film theme works when it carries his work (the 3 Idiots chalkboard). It turns into a fan site when the film is the subject itself: the HP opening, the "Three films and a game" intermission, and a film caption under nearly every image.

**First 10 seconds.**
- **Laptop, first visit:** Hogwarts, candles, a broom and "▷ Play". The first readable sentence is "I solemnly swear that I am up to no good", and his name appears only in tiny grey capitals. After Play, the name arrives at about 7.2 s, roughly 10% of a 60–90 s budget.
- **Skip, or scroll down:** the hero itself is excellent: the name large, "builds quantitative systems", Landon School class of 2027, and a portfolio button.
- **Phone:** it opens straight on the hero, which is the best first 10 seconds on the site.
- **Faculty reader:** reads the name and "self-taught high-school quant", then goes straight to WORK.

**Theme: impressive or distracting?**
- **Impressive:**
  - The hero, where the film is only a caption.
  - The Jack Sparrow compass in About.
  - The chalkboard gauntlet and the blueprint pipeline in Work.
  - The Marauder's Map design for Principles.
- **Distracting:**
  - The HP gate before the name.
  - Two full-screen title cards plus five film images before the first project.
  - The film-logo lettering on "SCENE · FILM" captions nearly everywhere.
  - The five-screen "Three films and a game" intermission right after the work.
  - The WANTED poster and the "Mischief managed" sign-off.

**Time to substance.**
- **Scrolling on a laptop:** Work starts about 9 screens down (y≈8,000, a nearly empty screen). The seven-step testing process is at y≈9,200 (t≈15.7 s), and the first project title is about 11 screens down.
- **Phone:** "Pre-registration" is about 10 screens down.
- **Shortcuts:** the hero button and the WORK pill get there in one click, which saves the site. WORK lands on a decorative pen image first.
- **Length:** about 54 phone screens. A 90 s reader never reaches Beyond, Writing, Principles or Contact.
- **Faculty:** the method (pre-registration, a blind holdout, deflated Sharpe, purged CV, a cost model, the kill-list) is above high-school level. But there is no real out-of-sample result, data period, trial count, or statement of what is his code versus libraries.

**Risks.**
- **Honesty:**
  - The AI drone image sits directly above "What I can actually do" and reads as *his* drone. The pen photo on Work has the same problem.
  - The film look-alike images have a glossy AI look, and the not-affiliated notice appears only in the Credits.
- **Tone:** "up to no good" is the first sentence an admissions reader sees. HP-first also reads younger than the content.
- **Reads unfinished:**
  - The visible "[ CHART SLOT … ]" placeholders.
  - "Résumé · coming soon".
  - A Writing section that is all drafts.
  - "12 illustrative hypotheses · not yet run".
- **Could read as gambling:**
  - The demo chart defaults to a rising "INDEX 330.0 · START 100" curve (labelled synthetic).
  - Jargon: alpha, GEX router, VIX-basis.
  - "Trading alongside my father", with no word on whether real money was involved.
- **Looks broken:**
  - The Contact heading appears clipped or overlapping (a reveal caught mid-way?).
  - "Killed and never retuned" reads as a typo.
  - The same pen image is used twice.
  - *Fixed by `cccce75`:* the intro caption overlap.
- **Unclear:** the kill-list header says "3 survived", but the list opens with the flagships under the kill-list heading.
- **Hidden facts:** his activities appear only on the WANTED poster, at y≈28,000.
- **Mobile:** a finger on the demo chart doesn't scroll the page.

**LAYOUT/UX items.**
- **Done in this pass:**
  - The garbled intro caption swap (sequential fade).
  - The worst late pops: writing fixed, the Map freeze removed.
  - The Map stutter on phones.
  - The slow Play response.
- **Left (queued in `CONTINUE.md` as item 11, all Aryan's call):**
  1. Land on the hero, not the HP gate, and make the opening opt-in from the hero.
  2. Shrink the Act I and Act II title cards and the first Work image to slim bands, and move the intermission to before Credits or collapse it to one strip, bringing the first project to about 5–6 screens.
  3. Add an "At a glance" strip under the hero: school/class, flagship, 2–3 activities, email.
  4. Hide the chart-slot placeholders, "Résumé · coming soon" and the drafts-only Writing section until real content exists.
  5. Move the drone image off "What I can actually do", or label it as an illustration.
  6. Make WORK and the hero button land on the testing process and the first project, and add a small table of contents inside Work.
  7. Rebuild the kill-list as a compact table (strategy · hypothesis · step that killed it · date · post-mortem), with survivors shown separately.
  8. Give each flagship a "Results" block, hidden until real numbers exist. Default the demo chart to the realistic curve, or overlay both.
  9. Move "How this page is built" from Systems to Credits.
  10. Close the empty scroll gaps (desktop y≈6,600–6,900, 8,000, 13,900, 25,900, 28,000; mobile y≈33,951).
  11. Fix the mobile chart scroll trap.
  12. Check the Contact heading clipping.
- **Wording suggestions** (Aryan's facts and words) are filed under queue items 4, 6 and 7 in `CONTINUE.md`.

## 7. Files

- Strips (JPG, 900 px wide, q72): `docs/build/motion-strips/before/` and `docs/build/motion-strips/after/`:
  - intro, intro-landing
  - desktop and alt act-1…4
  - desktop-first-60s, mobile-full-scroll, rm-act-2
  - the notable pops: before `pop-desktop-96` (act-2), `-427` (writing), `-479` (Map); after `pop-desktop-91` (act-2), `-438` (Map / contact)
- Full recordings (not committed): the session scratchpad `motion/before`, `motion/after`, `motion/after-r2` (second desktop+mobile run) and `motion/scenes-after`.
- Harness: `tools/capture/motion.js`. Re-run with `node tools/capture/motion.js http://localhost:3161 <outDir>` against `next start`.
