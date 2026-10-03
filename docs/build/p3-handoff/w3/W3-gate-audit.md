**W3 acceptance audit (read-only). Branch `design/three-films` at `5228000`, working tree clean.**

The W3 gate is **not met**. Six things block it:
- First-load JS is over budget.
- The beats probe still has 2 gaps over 100vh.
- Pause got slower: Lenis, sound and the drone now take 113–336 ms to stop.
- The fast lane takes 1.19 s to focus `#work` (limit 400 ms) and does not stop Dead Eye.
- Dead Eye's Release leaves the grade on screen.
- The films letterbox does not fully close.

Most other items are met in code. Their probe evidence is partial: the 1440 run exists, the 1024 and `--rm` runs were still running during this audit.

Evidence sources:
- Code, read file by file.
- `docs/build/motion-strips/p3-w3/beats/beats.json`.
- The measure agent's in-progress outputs: `docs/build/motion-strips/p3-w3/probes-1440/p3-probes.json` and `docs/build/motion-strips/p3-w3/direct/*.log`.
- `docs/build/p3-reports/W3-notes.md`.

The six W3 return files are fine (11–12 KB each, single-line JSON).

## A. §13 items for the W3 gate

| item | verdict | evidence | what is missing |
|---|---|---|---|
| P3-2 #5 films crossfade, ≤ 1 decoder | MET (1440) | `film-frame.tsx:47-49` DecoderLock; decoder probe: max 1 playing, `stageDuringCrossfade` [], films in `everPlayed`; `cinema.plates` maxPlaying 1 | 1024 run |
| P3-5 #2 ≥ 20 loops | PARTIAL | `lib/media.ts` registers 19 (L01–L23 without L03/L04/L07/L13) | one loop, or Aryan changes the bar |
| P3-5 #3 SSIM / FIG drift | NOT MEASURED | no probe exists | P3-11.0 tools |
| P3-5 #4 every plate moves | MET (1440) except Pause | plates-live: 35 plates, `dead` [], `deadOther` []; `cinema.plates` pass | Pause sub-check fails ("weather/camera outlived Pause" at 100 ms); 1024 and RM runs |
| P3-5 #6 seq mem ≤ 128 MB | MET (1440) | `seq.peakMB` 87.9; JV window mode in `journey-voyage.tsx` | confirm JV frames show up in `__seqMem` (peak is the same as W2's) |
| P3-7 #2 8 in-character hosts | MET | words probe played B07, B16, B31–B34, B40, B53, overlaps []; hosts `about.tsx:65`, `projects.tsx:94`, `beyond.tsx:162`, `principles.tsx:74`, `film-screen.tsx:102` | – |
| P3-7 #3 4 scrub sentences | MET | `about.tsx:43-47`, `chapter-section.tsx:269-275`, `beyond.tsx:169-173`, `principle-body.tsx:42-48`; `words.scrub` pass; `words.mjs` checks the exact strings | – |
| P3-7 #5 two physical words | MET | B23 `chapter-section.tsx:165`, B29 `ledger-section.tsx:152`; B29 granted in the spotlight page walk | – |
| P3-7 #6 two fly-throughs | PARTIAL | B45 played (`writing.tsx:98`; granted after idle) | B12 gull never asked the spotlight at 1440 in two walks (it did at 1024); mounts only while `active === NOW_INDEX` (`journey-voyage.tsx:476`); `words.fly` failed ("no fly-through": zones are client-mounted) |
| P3-7 #7 rations / spotlight | MET (headless) | check-manifest gate clean; spotlight page test: overlaps [], unresolved [], stillPending []; beats probe: no maxWait skips | screencasts are P3-11 |
| P3-8 #1 12 eggs | PARTIAL | all 12 placed in DEFAULT (table B) | rd-fire has no trigger under `voices.fire` ALT; `hunt.hotspot` failed on a probe artifact |
| P3-8 #2, #3, #7, #8 | MET (recheck) | hunt: eggsoff, pause, browse, complete, tail all pass | – |
| P3-8 #4 drone | PARTIAL | keys, course (verbatim gate lines), edge, esc and off pass; best time stored | Pause lands in 255–336 ms (probe limit 250; spec "at once") |
| P3-8 #5 Dead Eye | PARTIAL | start, time (0.25), grade, targets, fire, read, store, roving pass | Release: grade still shown at +1.2 s, gone by +2.5 s (`direct/games-1440.log`); INP up to 2.3 s, all presentation delay |
| P3-8 #6 compass + candles | PARTIAL | compass `compass-toy.tsx:81`, `use-compass-spin.ts:326-329`; candles `candle-toy.tsx:301`, Lumos; wand `wand-cursor.tsx` | spin ignores "the pillar focused by keyboard since then" (`about-pillars.tsx:114`); `toys.mjs` not run; 39 vs 29 candles is Aryan's call |
| P3-8 #9 B1, B5, B6 | MET | no `readSession` in `chalk.tsx`; `run.ts:196-197` gsap timeScale; grade layer at `games.css:191-219`, section background unchanged (`de.grade` pass) | – |
| P3-10 #1 director's cut | MET | `directors-cut.ts:290-398`, `timing.ts`, `api.ts`; `dc.run` (86 px/s, 2×), `dc.esc`, `dc.pause`, `dc.fastlane`, `off.1024touch` pass | – |
| P3-10 #2 chapter select | MET | `chapter-select.tsx`; `cinema.chapter`: 7 tiles, play first, lazy, landAt .47, hash pushed | – |
| P3-10 #3 fast lane | FAIL | `lenis.fastlane`: focus at 1,193 ms (limit 400), pill covered at 1440 | also does not stop Dead Eye: no `fastlane` listener in `components/games/**` |
| P3-10 #4 analytics | MET | `lib/analytics.ts`, SEND is constant false; `cinema.analytics` requests [] | – |
| P3-10 #5 collapses | MET | `chapter-section.tsx:293-405`, `about-bio.tsx:34`, `footer.tsx:286`, `words.css:20-48`; `cinema.credits` and `words.phone` pass; chart slots gone | – |
| Beats gate | FAIL on gaps | 0 missing, 0 undeclared, 0 short spans | B29→B30 159.4 / 199.5vh; B56→B57 167.1 / 178.5vh |

**Items left open by W1/W2, rechecked:**
- **P3-2 #1: regression.** Lenis is destroyed 126 ms after Pause (W1: 2 ms; limit 100).
- **P3-9 #3: regression.** Sound suspends 113 ms after Pause (W2: 4 ms).
- **P3-2 #2: partial.** Chapter tiles land correctly. Journey waypoints, map rooms, Time-Turner and the films "Seen here in Act n" links have not been probed.
- **P3-2 #4: unverified.** The AA probe fails on the About philosophy note and the credits lists. The direct check (`direct/aa-collapse.log`) shows that text sits inside closed `<details>` with `checkVisibility()` false, so it is probably a probe artifact.
- **P3-2 #7 (world-font CLS) and P3-3 #1:** still open.
- **P3-2 #9:** the intro LoAF is worse. Worst work is 58 ms at about 1.5 s (W1: 21–22 ms), just after ladder step 2.
- **P3-2 #10:** fails. JS is +8,081 B gz (bundle probe) or +8,813 B (W3-notes); the limit is 6,144. CSS is +6,100, 44 B under.
- **P3-2 #11:** the journey reflow is fixed (pauseMid shift 0). The `pausedReload` diff comes from the probe snapshotting at DOMContentLoaded, before act-3/act-4 stream in.
- **P3-6 #8:** partial. At the hold the bar scale is 0.82, and it dips on the way in (0.95 at 87% → 0.80 at 84.9% → 1.0 at 80%).
- **P3-6 #2, #3, #10:** P3-11. **P3-6 #6:** a decision is still needed.

## B. The 12 eggs (trigger · hint · keyboard · RM · sound)

| egg | trigger | hint | keyboard | RM | sound | verdict |
|---|---|---|---|---|---|---|
| hp-map | typed / palette "solemn" (`palette-dialog.tsx:255`) | `map-hint.tsx:28`, in `principles.tsx:49-50` | typed / palette | `egg-map.unfold` flat | `cues.ts:151` | MET |
| hp-lumos | typed / palette (`palette-dialog.tsx:256-257`) | `header.tsx:303` (Pause tooltip) | typed / palette | `toast.lumos.os` (`egg-runtime.tsx:221-228`) | lumos / nox cues | MET (`hunt.lumos`, `hunt.pause` pass) |
| hp-snitch | `snitch.tsx:131,151` (B57) | panel hint | its button | rests | flutter + found chime | MET |
| pc-parley | typed / palette (`palette-dialog.tsx:258-268`) | "parley?" `journey.tsx:97-103` → `journey-chart.tsx:243` | typed / palette | toast only | parley cues | MET (`hunt.typed`) |
| pc-coin | `journey.tsx:94` → `journey-chart.tsx:237` | hotspot label + moonlit art | button | hold, plus Esc (`coin-moon.tsx:110`) | coin cues | MET (code) |
| pc-kraken | `card-p3.tsx:529-530` | `act-card-section.tsx:516` | upper-bar button | static tip | kraken cues | MET (W2) |
| 3i-aal | `chalk-heart.tsx:45-55`, in `chapter-section.tsx:197`; 600 ms hold | the heart | Enter counts as the hold (`hotspots.ts:55-73`) | toast only | heartbeat-2 | MET |
| 3i-quad | `gauntlet-tabs.tsx:94-101` | doodle + panel | Run button | instant settle, counts | quad-spinup | MET |
| 3i-pen | `plate-band.tsx:460-519` → `pen-egg.tsx:66-86` | panel | button | circle drawn at once | pen cues | MET (rows read 10/10 with a real wheel) |
| rd-eagle | `rdr2-frontier.tsx:170-179` | the glyph | button | static trail (`rd-desktop.tsx`) | eagle-shimmer | MET |
| rd-bone | `writing.tsx:99` → `journal-spread.tsx:376-386` | drawn bone | button outside aria-hidden | note static | bone-scratch | MET |
| rd-fire | `testimonials.tsx:79` → `campfire-stage.tsx:186-188`; 800 ms dwell | hotspot | button | toast | fire cues | PARTIAL: under the ALT there is no fire point (`campfire-stage.tsx:172`, no `marks.fire` on MV-11) |

## C. Variants

- **All 60 keys** in `lib/variants.ts` have an ALT, and each has a consumer.
- **The new W3 keys** branch on `"alt"` in code:
  - `work.invite`: `run-invite.tsx:30`
  - `experiment.curve`: `curve-draw-impl.tsx:96,122`
  - `systems.drone`: `drone-band.tsx:78`
  - `kill-list.deadeye`: `run.ts:160,278-307`
  - `contact.candles`: `candle-toy.tsx:81-214`
  - `contact.wand`: `wand-cursor.tsx:112,205`
- **Gaps:**
  - `voices.fire` ALT loses rd-fire (see table B).
  - The horse ignores the manifest variant: `writing.tsx:98` passes no `variant`, while `journey.tsx:93` does for the gull.
  - Media registration warnings (on MV-01 and MV-06 the ALT plays the default plate):
    - not registered as alternates: `work.head.alt` → iconic-pen, `beyond.band.alt` → iconic-deadeye, `voices.fire.alt` → MV-11 / MV-11L;
    - received but not yet accepted: MV-01-alt, MV-06-alt.

## D. Binding rules 33–35

- **Rule 33: met for W3.** No new rule matches `<html>`. `html[data-game]` is set by JS only, with no CSS keyed on it. `#act-4[data-wand-in]` is on a section. There are no `[class*=]` selectors.
- **Rule 34: JS fails** (above).
- **Rule 35: at risk.** The Dead Eye grade (`games.css:191-219`) paints the whole 2,122 px section with full-size gradients and a full-size masked image. The probe shows next-paint delays of 0.26–2.3 s while a round runs.

## Prioritized gap list

1. **First-load JS +8.1–8.8 KB gz, over the 6,144 limit.** Owner: W3 fixer. Cut at least 2.7 KB gz:
   - Make the DEAD EYE pill and the drone pill server markup with `data-enhance-queue`, wired by new binders in `components/enhance/binders/` (the pattern `DirectorsCutButton` + `dc.ts` already uses).
   - Fold the per-host `React.lazy` facades (compass-toy, coin-moon, run-invite, curve-draw, pen-egg, rd-desktop, candle-toy, wand-cursor, films-desktop) into enhancer binders or one chunk per act. Each `import()` stub costs about 100–140 B.
   - Strip variant `name` in `scripts/build/browser-data-loader.cjs` if no client reads it.
   - Files: `components/games/dead-eye/dead-eye-call.tsx`, `components/worlds/idiots/drone-band.tsx`, `components/enhance/desktop-enhancer.ts`.
2. **Beats gap B29→B30.** Owner: W3-GAMES files.
   - Declare a quiet scroll beat `{ id: "B29-lens", kind: "signature", timing: "scroll", feature: "existing" }` in the kill-list beats in `lib/page.ts`. The spec row B29 already lists the "lens bracket".
   - Put `beatAttrs("B29-lens")` on `[data-ledger]` (`ledger-reckoning.tsx:282`).
   - Then run `beats.mjs --write` and rebuild.
3. **Beats gap B56→B57.** Owner: W3-CINEMA.
   - Add a quiet beat `B57-roll` (`timing: "scroll"`, `star` not set) to the credits beats in `lib/page.ts:607`.
   - Tag the credits roll block in `components/site/footer.tsx` (from `:171`). Keep B57 on the Snitch, so the spotlight's "host left the viewport" test is unchanged.
4. **Pause latency regression.** Lenis 126 ms, sound 113 ms, drone 255–336 ms, weather and camera still alive at 100 ms. Owner: C0-LIB file `lib/flags.ts` plus the fixer.
   - In `lib/flags.ts:140-146`, run the listeners before `syncMotionAttribute`. `:root[data-motion="paused"]` (`app/globals.css:548`) restyles the whole document.
   - Or add a first-run set for `smooth-scroll-impl.tsx:151`, `lib/audio/store-impl.ts`, `flight.ts:334` and the plates.
   - Move any synchronous layout reads in W3 Pause handlers to rAF. The handlers are in `words.ts`, `rd-desktop.tsx`, `use-compass-spin.ts`, `coin-moon.tsx`, `run-invite.tsx`, `invite.ts`, `journey-experience.tsx`.
5. **Fast lane focus 1,193 ms (limit 400), and the pill is covered during the cut at 1440.** Owner: B1-SCROLL files.
   - In `header.tsx:207-212` and `lib/smooth-scroll.ts`, move focus right after the immediate jump, before the font wait and `ScrollTrigger.update`.
   - Find the element covering the pill (use `elementFromPoint` during the cut).
6. **The fast lane does not stop Dead Eye** (spec §11.3). Owner: W3-GAMES.
   - `run.ts`: add `undo` for `on("fastlane", () => release("fastlane"))`.
   - `flight.ts`: add `on("fastlane", () => land("fastlane", false))`.
7. **Dead Eye Release leaves the grade visible for 1.2–2.5 s.** Owner: W3-GAMES. In `run.ts:464-506`, hide the grade at once on Esc/Release, or create its fade only after every slowed animation and the ramp are reset to 1×.
8. **Dead Eye grade breaks rule 35 and drives the INP failures.** Owner: W3-GAMES. In `games.css:191-219` and `run.ts` `fillGrade`, make the grade a static promoted layer (`will-change: transform`) with positioned 6% / 10% edge bands instead of full-size masks and gradients, and fade only the host.
9. **rd-fire is unreachable under the `voices.fire` ALT.** Owner: media lane / Aryan. Register a measured `marks.fire` for MV-11 and MV-11-alt in `lib/media.ts`. Never invent one.
10. **The B12 gull never asks the spotlight at 1440.** Owner: W3-PIRATES. In `journey-voyage.tsx:476`, keep the sky zone mounted once step 4 is reached, then confirm the words binder picks up zones that mount late.
11. **Letterbox hold at 0.82, with a dip during the close.** Owner: W3-CINEMA (+ B1-STAGE). Find the second thing driving the bars near the close's end in `films-desktop.tsx:55-58` and `letterbox-bars-impl.tsx` (the B31-bars scene). Clamp to 1 from 85% until the open.
12. **Intro LoAF regression: 58 ms of work at about 1.5 s.** Owner: fixer. Attribute chunk `3p9eevrhj` fn `st` (likely the desktop enhancer binding at ladder 2), then batch or yield through `lib/idle.ts`.
13. **Fix the probe artifacts, then re-run.** Owner: P3-11.0 tools / measure agent.
    - `words.mjs`: wait for the client-mounted `[data-words=fly]`, and compare by `data-beat` instead of by index (the fly zones shift every index, which breaks `identical` and `pause`).
    - `spotlight.mjs`: the idle test starts inside B08's band; move it to a region with no star.
    - `layout-gates.mjs`: take the early snapshot after all `[data-section]` have streamed in.
    - `games.mjs` rows.read: scroll slower (a real wheel reads 10/10).
    - `hunt.mjs`: remove leftover injected buttons before injecting (it hit a strict-mode error with 2 matches).
    - `aa-scrim`: find out why closed-`<details>` text is counted.
    - `split.mjs`: stale rects (#36).
14. **Probes still to run:** `toys.mjs`, the 1024 and `--rm` sets, the keyboard probe (skipped), and a nav probe for the W3 anchors (P3-2 #2). Owner: measure agent.
15. **Compass spin ignores the pillar focused by keyboard** (spec §9.2 #1). Owner: W3-PIRATES. Pass the last focused pillar since the last spin from `about-pillars.tsx:114,216` to `use-compass-spin.ts` as the goal. Low.
16. **The horse ignores the manifest variant.** Owner: W3-RDR2. Add `variant={pieceVariant(variantChoiceOf(entry), "flythrough")}` at `writing.tsx:98`. Low.
17. **P3-5 #2: 19 of 20 loops.** Owner: media lane / Aryan. Add one loop through `tools/media/loop.mjs` within the credit cap (for example an L13 retake), or Aryan changes the bar.
18. **Variant media registration.** Owner: media lane / Aryan. Register `variantOf` for iconic-pen, iconic-deadeye and MV-11 / MV-11L; MV-01-alt and MV-06-alt wait for Check L2. Low.
19. **Candle count: spec says 39, the build has 29 (24 at 64–80rem).** Aryan amends the spec or the composition.
20. **CSS headroom is 44 B.** Freeze first-load CSS; any new rule goes in a lazy chunk. Owner: fixer.
21. **P3-2 #7 world-font CLS of 0.003–0.005 (from W1).** Add metric overrides on the world faces in `app/globals.css` and `lib/fonts.ts`. Owner: fixer / P3-11.
22. **The hotspots binder's `syncOff` only marks hotspots present at bind time.** Later-mounted ones (coin, pen) never get `aria-disabled` when eggs are off; they still do nothing, because `fire()` checks. Re-sync on mount or on click in `hotspots.ts:106-112`. Low.
23. **Aryan decisions:**
    - P3-6 #6 MATCH_ROW: frame-relative or viewport-absolute.
    - Sign the 102 unsigned strings, including the new `toy.drone.best` and `toy.deadeye.best`.
    - Countersign the 40 Check L2 rows and 5 TTS lines.
    - P3-9 #5 listening check.
    - Rd-bone note: Newsreader or the hand face.