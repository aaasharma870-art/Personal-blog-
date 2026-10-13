# Phase 3 report: "Keep them scrolling"

For: Aryan Sharma. Branch: `design/three-films`. Written: 2026-10-13.
App code tested: `ef0a549` ("P3-11 final pass: review fixes"). The QA evidence sits on top of it as `ef69db5`.
Nothing in this final state is merged. This work did not push to or merge into `main`. (Earlier slices of the branch were merged into `main` through earlier PRs. See section 7.)

How to read the sources. A path in parentheses is where the number before it comes from. Short names:
`P3F` = `docs/build/motion-strips/p3-final`. `R1`, `R2`, `R3` = `docs/build/motion-strips/p3-r1`, `p3-r2`, `p3-r3` (the three critic rounds).
`REP` = `docs/build/p3-reports`. `MEDIA` = `docs/build/media`. If a number does not exist, this report says "not measured".

## In short

- The laptop version is built. `npx tsc --noEmit`, `npm run check`, `npx eslint .` and `npm run build` all pass on `ef0a549` (`P3F/logs/`).
- It did not clear the ship bar the critic loop set. After three rounds only one axis (honesty and accessibility, J9) reached 4 of 5, and it met its own bar only with exceptions (`R3/TRIAGE.md` lines 16-21; section 3.1).
- Smoothness did not improve by the headless speed test.
  - The default run (Lenis smooth scroll) is level with before: 15.1 fps now against 15.2 fps before (`R3/verdicts/j8-smooth.md` line 7). The two readings are from different sessions (2026-09-30 and 2026-10-12), and the base build alone ran at 55 to 75 % of its P3-0 speed in later sessions (`docs/build/motion-strips/p3-w1/MEASURE.md` line 31). So 15.1 against 15.2 cannot be separated from session drift.
  - The like-for-like path is the native one (`?skip=smooth`; P3-0 had no Lenis). It is **34 % slower**: 10.0 fps and p95 350 ms, against 15.2 fps and 316.7 ms before (`R3/verdicts/j8-smooth.md` T09).
  - The intro is worse: 18.5 fps and p95 133.3 ms against 29.5 and 116.6 at 1440 (section 2.2).
  - INP was 544 ms (keydown, 1440) against the 200 ms bar. J8 judges it likely a software-drawing artefact (`R3/verdicts/j8-smooth.md` T19).
- Recognition of the films fell below the pre-Phase-3 level, and the recognizability rule is binding (`docs/build/CONTENT-RULES.md` line 36, which points to `docs/build/AUTOPILOT.md` line 136). Blind recognition went from 38/45 to 23/39 and 24/37. Pirates went from 10/10 to 4/9, 3 Idiots from 9/10 to 4/9 and Harry Potter from 10/12 to 7/10 (`R3/TRIAGE.md` line 33; section 3.1). Star-per-screen is 33 % by eye against a 90 % bar.
- Two load budgets are missed in the final QA. Desktop LCP with the intro on is 440 to 1,024 ms at 1440 over six loads against 400 ms. With the same tool (`qa.js`) it was 732 to 780 ms in round 3 and is 904 to 948 ms now, so it got worse (section 5.5). Mobile LCP is +8.1 % against the +/-5 % bar, but the other mobile bar (at most 2.5 s) is met: median 1.636 s, worst load 2.432 s (`P3F/README.md` section 5; `docs/build/PHASE3-SPEC.md` line 1374).
- CLS is not 0. Page load with the intro on gives 0.00077 (1440) and 0.00117 (1024) on desktop, and 0.0142 on phones with the intro armed (the base is 0.0142 too). Instant-jump scripted scrolling gives up to 0.2363 at 1440. Wheel-paced scrolling gave 0 in the final QA (section 5.5).
- Bundle size is inside budget at the end: JS +3,612 B and CSS +4,906 B (gzip) against a +6,144 B limit each (`P3F/bundle-head.json`, `P3F/bundle-base.json`). Wave 3 was over on JS (+8,813 B) until it was fixed (section 2.1).
- `RELEASE=1 npm run check` fails with 47 errors (`P3F/release.txt`). 46 are sign-offs the plan expects (DP-9: the unsigned copy, the Check L2 countersignatures and the TTS approvals). The 47th is the community-quote gate, which is outside DP-9 and means verify or remove, not sign (section 6A).
- Phones were not part of Phase 3. They are almost, but not exactly, as before (section 5.2). The iPad (1024x1366 touch) differs most: its page is 1,281 to 1,618 px shorter, and about 3,300 characters sit in closed `<details>` boxes and the Systems fold. The plan asked for it to be unchanged except the intended changes (section 5.2).
- PR #11 is open and GitHub now reports it as not mergeable. A merge into `main` will conflict in 63 files, because `main` holds an older work-in-progress snapshot of Wave 3 (section 7).

Words used in this report:

| Word | Plain meaning |
|---|---|
| headless | A test browser with no screen and no graphics card. It paints in software, so it is slow. Its speed numbers only work for comparing builds on the same day. |
| fps | Frames per second. 60 is smooth. Under about 30 feels choppy. |
| p95 | The frame time that 95 of 100 frames beat. Lower is better. |
| LCP | Largest Contentful Paint. How long until the biggest thing on screen has painted. |
| CLS | Cumulative Layout Shift. How much the page jumps while it loads or scrolls. 0 means nothing jumped. |
| pop | A sudden visual jump, counted from screen recordings. |
| gz | Size after gzip compression. This is what a visitor downloads. |
| RM, Pause | RM is your device's "reduce motion" setting. Pause is the site's own pause button. Both must stop all motion and sound. |
| act card | The full-screen pinned card that opens each act. |
| star | The one thing that holds the screen at any moment (the "one star per screen" rule). |
| plate, loop | A plate is a background picture for a section. A loop is a short looping video laid on a plate. |
| ALT | The code-only alternate of a piece. Every piece has a DEFAULT and an ALT. |
| judges | Fresh AI instances that saw only screenshots and recordings, never the code. They scored each round. |
| owner item | Something only you can sign off. |
| native run | A speed run with `?skip=smooth`: the browser's own scroll, no Lenis. The pre-Phase-3 build had no Lenis, so this is the like-for-like comparison with P3-0. |
| DP-9 | The plan's rule for which `RELEASE=1` failures are expected: the unsigned copy, the Check L2 countersignatures and (by an amendment of 2026-10-02) the TTS approvals (`docs/build/PHASE3-PLAN.md` line 53). |

---

## 1. What Phase 3 delivered, in one page

Phase 3 is the laptop version. The motion layer switches on at 1024 px wide and up, with a mouse or trackpad (`lib/flags.ts` line 307: `(min-width: 64rem) and (hover: hover) and (pointer: fine)`). Phones are Phase 4 (`CONTINUE.md`, Phase 3 brief).

**What a visitor sees on a laptop now**

- **Opening.** A play screen with a looping sea video. Press Play: a flight, a landing, then a hand-off into the hero, with opening title cards. The header always shows "Skip to the research". Three of three AI judge instances (screenshots only) read your name, and three of three found the fast lane in about 1 second in every round (`R3/TRIAGE.md` line 34).
- **Smooth scroll and a persistent stage.** Lenis (smooth scrolling) and ScrollTrigger (scroll-driven scenes) run on laptops. A fixed stage sits behind the page so worlds fade into each other (`REP/W1.md`).
- **Four acts, each opened by a pinned act card.** Pirates (Act I: About, Journey), 3 Idiots (Act II: Work, Trading Algos, Optuna, Experiment, Systems, the kill-list), a Films section, Red Dead (Act III: Beyond, Writing, Voices) and Harry Potter (Act IV: Principles, Contact). The cards have title masks, push-ins, letterbox bars that breathe, match cuts, four impacts and a day-to-night arc. The spec estimated card travel at about +2.8 viewports of pinned scenes, with about 1.8 given back by the collapses (a net of about +1.0), and named the fast lane as the mitigation (`docs/build/PHASE3-SPEC.md` Appendix B #1, a design estimate). The measured page height grew more than that net: +2,751 px at 1440 (about 3.1 viewports) and +3,481 px at 1024 (about 4.5), roughly 3 to 4.5 times the net (section 2.1; derived). This report does not reconcile the two. The fast lane still mitigates.
- **Pictures that move.** 19 short Higgsfield video loops sit on plates. Code depth and camera drift moves the rest. Three push-ins: a code push on the Black Pearl, a code camera move on the ICE hall, and a 72-frame image sequence in the Great Hall. One small WebGL layer (WebGL = browser 3D drawing) does scene changes where the browser supports it (`REP/W2.md`, `REP/W3.md`).
- **Words.** Eight titles arrive in their film's style. Four act titles are text-as-mask. Four sentences are scrubbed by scroll. Two fly-throughs (a gull, a horse). The four act loglines, which Claude drafted, show as subtitles under the act cards (`lib/film.ts` lines 679-683). Each world has its own type face (`docs/build/FONTS.md`).
- **The hunt.** 12 eggs, 3 per world, with a header chip, a panel, a 12 of 12 end state and a post-credits scene.
- **Four toys.** Jack's compass (About), a chalk drone game (Systems), Dead Eye (the kill-list) and a wand with candles (Contact).
- **Director's cut and chapter select.** A hero button plays the page for you. A DVD-style chapter select has 7 tiles.
- **Sound.** Muted by default. Five ambient beds, small synthesized cues, and five spoken lines. Pause and RM stop all of it (`docs/build/SOUNDS.md`).
- **Folds.** At 1024 px and up, long reference text sits in closed `<details>` boxes (Optuna appendix, About note, credits lists, the Systems matrix) (`P3F/README.md` section 2).

**What is unchanged:** phones (under 1024 px) keep today's behaviour by design. QA found small text and height differences on the phones, and a larger one on the iPad (1024x1366 touch): all are listed in section 5.2.

**What did not land as hoped** (sections 2, 3 and 5):
- The page is not smoother by the headless test. The like-for-like native path is 34 % slower than before, and the intro is worse (18.5 fps and p95 133.3 ms against 29.5 and 116.6 at 1440).
- Blind recognition of the films fell below the pre-Phase-3 level (38/45 before; 23/39 and 24/37 now). The recognizability rule is binding.
- The "one star per screen" rule is far from its bar (33 % by eye against 90 %).
- The load-time budgets are missed with the intro on (desktop LCP, and mobile LCP against its +/-5 % bar).
- CLS is not 0 (section 5.5), and INP is 544 ms against 200 ms (keydown at 1440; likely a headless artefact).

**Not built, on purpose.** The cut list in `docs/build/IDEAS.md` section O.3 (speed ramps, cursor trails except the wand, phone tilt, "Previously on...", extra toys, eggs beyond 12) is absent from the code (checked by search of `components/`, `lib/` and `app/`). Dropped inside Phase 3: the drone's photographed lift, a toy in Act III's own screens, and the voices letterbox and subtitle (`docs/build/PHASE3-SPEC.md` Appendix B #12, #14, #16). The graphite horse is traced from Muybridge's 1878 plates (public domain, jockey left out) (Appendix B #15).

---

## 2. Before and after

**Before** is P3-0, measured 2026-09-30 on the pre-Phase-3 build (`docs/build/motion-strips/p3-before/summary.md`). Bundle sizes are for the pre-Phase-3 commit `5aa4587`, rebuilt for this QA (`P3F/logs/build-base-5aa4587.txt`).
**After** is the newest saved reading for each row. Say which build each one is:

- Bytes, counts and layout: the final build `ef0a549`.
- Speed (fps, p95, pops, section rates): round 3, build `ece90dc`, 2026-10-12 (`R3/MANIFEST.md` section 2). The final small pass (`9c5f6fc`, `ef0a549`) was **not** re-run through the speed tool.
- Load time (LCP): the final build `ef0a549`.

### 2.1 Exact numbers (do not depend on how fast the test machine is)

| What | Before | After | Change | Source |
|---|---|---|---|---|
| First-load JS, gz | 439,092 B | 442,704 B | +3,612 B (limit +6,144; 2,532 left) | `P3F/bundle-base.json`, `P3F/bundle-head.json` |
| First-load CSS, gz | 29,433 B | 34,339 B | +4,906 B (limit +6,144; 1,238 left) | same |
| "/" HTML, gz | 170,736 B | 202,351 B | +31,615 B (+18.5 %). No budget was set for HTML. | `P3F/README.md` section 5 (measured on `.next/server/app/index.html`); raw 982,238 to 1,179,857 B in the two bundle JSON files |
| Page height at 1440 wide | 41,499 px | 44,250 px | +2,751 px (derived) | `P3F/widths-base.json`, `P3F/widths-head.json` (`docHeight`) |
| Page height at 1024x768 | 37,916 px | 41,397 px | +3,481 px (derived) | `P3F/README.md` section 2 |
| Layout shift (CLS), wheel-paced scroll, 1440 and 1024, normal / RM / Pause | 1440: 0 (P3-0); 1024: not measured at P3-0 (P3-0 ran at 1440 only, `R3/verdicts/j8-smooth.md` line 9) | 0 in every run at both widths | none at 1440; no before value at 1024 | `docs/build/motion-strips/p3-before/summary.md`; `P3F/modes-*.json` |
| CLS, phone page load, 390x844, intro armed, throttled | base 0.01419 to 0.0142 | 0.0142 to 0.0143 | none, but not 0 | `P3F/lcp-mobile-head-r1.json`, `-r2.json`, `P3F/lcp-mobile-base-r1.json`, `-r2.json`; `P3F/README.md` section 5 |
| CLS, page load with the intro on (1440 / 1024) | base 0.00738 / 0.01599 | 0.00077 / 0.00117 | down, but not 0 | `P3F/lcp-base-desktop-1440-armed.json`, `P3F/lcp-base-desktop-1024-armed.json`, `P3F/modes-normal-*.json` |
| CLS, instant-jump scripted scroll (not a human pace), 1440 | base 0.055 to 0.108 | 0 / 0.2363 / 0.2363 | worse in 2 of 3 runs | `P3F/widths-head.json`, `P3F/widths-base.json`; see 5.5 |
| Piece variants (DEFAULT + ALT) | 37 keys on 25 hosts | 60 keys on 33 hosts, 0 without an ALT | +23 keys, +8 hosts | `lib/variants.ts` (HEAD and `5aa4587`), counted by a node script |
| Living video loops from Phase 3 | 0 | 19 (bar: 20) | one short | `lib/media.ts`, counted by a node script; `docs/build/PHASE3-SPEC.md` line 1454 |
| Higgsfield credits, Phase 3 | 0 | 333.62 spent of a 350 cap; balance 172.88 | within cap | `MEDIA/LEDGER-p3loops.md` line 4; `MEDIA/p3/B9.md` |
| Gaps over 100 viewport heights (vh) between beats | not measured at P3-0 | 0 gaps over 100 vh at 1440 and 1024. The longest gap itself is never measured, only whether any exceeds 100 vh. Page length: 4,923.6 / 5,406.3 vh in the round-3 build; about 4,920.8 / 5,406.2 vh in `release.txt` on `ef0a549` | none | `R3/beats-after/beats.json` (`pageVh`, `gaps`); `P3F/release.txt` line 5 |

Bundle history against the base, in bytes gz, JS / CSS: Wave 1 +1,524 / +3,423; Wave 2 +4,440 / +5,303; Wave 3 +4,284 / +6,104; after round 1 fixes +5,639 / +4,416; after round 2 fixes +3,159 / +4,906; final +3,612 / +4,906 (`REP/W1.md`, `REP/W2.md`, `REP/W3.md`, `R2/TRIAGE.md`, `R3/TRIAGE.md` "Budgets", `P3F/README.md` section 6). Every end-of-wave reading was under +6,144. Wave 3 was over before it was fixed: JS +8,813 at integration, 2,669 B over the line (`REP/W3-notes.md` line 78), and +6,278 in the fixers' reading before the cut at `1c93877` (`REP/W3.md` line 203), down to +4,284 (`REP/W3.md` line 237).

### 2.2 Headless readings (relative only)

All rows below come from headless Chromium 141 on 4 CPUs with software drawing (SwiftShader), at 1440x900 unless a row names another size. The rows that do: the intro at 1024 (1024x768), Principles at 1024, and the mobile LCP (390x844 with a 4x CPU slowdown and a 1.6 Mbps link). The P3-0 file says its own absolute times are pessimistic and should be read as relative (`docs/build/motion-strips/p3-before/summary.md` line 5). Compare a before with its after. Do not read any single number as what you would see on your laptop.

Two cautions that apply to every speed row.
- **Default run against native run.** The default run is the page as visitors get it, with Lenis smooth scroll. P3-0 had no Lenis, so spec 12.1 asks for the native run (`?skip=smooth`) to be judged separately, and J8 treats the native run as the like-for-like comparison (`R3/verdicts/j8-smooth.md` T07, T09 to T11). Native rows are marked "native" below, and every one of them is a miss.
- **Different sessions.** The before readings are from 2026-09-30 and the after readings from 2026-10-12. The machine drifts: the base build alone ran at 55 to 75 % of its P3-0 speed in later sessions (`docs/build/motion-strips/p3-w1/MEASURE.md` line 31). A difference as small as 15.1 against 15.2 fps cannot be separated from that drift.

| What | Before (P3-0) | After (round 3; the LCP rows: final build) | Bar (spec 12.1) | Verdict | Source |
|---|---|---|---|---|---|
| Whole-page scroll speed, default run | 15.2 fps | 15.1 fps | at least 15.2 (aim 18) | level, not smoother. 15.1 against 15.2 cannot be separated from session drift | `R3/MANIFEST.md` section 2; `R3/verdicts/j8-smooth.md` T01 |
| Whole-page scroll speed and p95, native run (`?skip=smooth`, like-for-like) | 15.2 fps, p95 316.7 ms | 10.0 fps, p95 350 ms | at least 15.2, at most 316.7 | **miss: 34 % slower**, and p95 over the bar | `R3/verdicts/j8-smooth.md` first paragraph, T09, T11 |
| Whole-page scroll speed and p95, default run, 1024x768 | not measured at P3-0 (1440 only) | 19.5 fps, p95 166.7 ms | same floors, no P3-0 baseline | no before value to compare with. The native run at 1024 is 13.9 fps, p95 283.3 ms | `R3/MANIFEST.md` section 2; `R3/verdicts/j8-smooth.md` T01, T02, T09 |
| p95 frame time, default run | 316.7 ms | 250 ms | at most 316.7 | better in the default run only (the native run misses, above) | same |
| Share of frames over 50 ms | 21.7 % | 33.0 % | none set | worse | `R3/verdicts/j8-smooth.md` T01 |
| Longest frame | 1,116.7 ms | 767 ms | none set | better (default run) | same |
| Pops, default run | 27 | 2 (at 1024: 10) | at most 12 | **not comparable.** The pop detector only inspects frames where scroll moved under 40 px, and under Lenis the page almost never stands still, so 2 and 10 are not like-for-like with 27 | `R3/verdicts/j8-smooth.md` T07; `R3/MANIFEST.md` section 2 |
| Pops, native run (like-for-like) | 27 | 28 (at 1024: 39) | at most 12 | **miss: unchanged (28 against 27)**, and over the bar | `R3/verdicts/j8-smooth.md` T07, T10 |
| Intro, 1440 | 29.5 fps, p95 116.6 | 18.5 fps, p95 133.3 | at least 29.5, at most 116.6 | worse | same |
| Intro, 1024 | not measured at P3-0 | 28.1 fps, p95 83.3 | at least 29.5 | just under | same |
| Work section, default run | 3.2 fps | 13.0 (31 frames) | at least 4.8 | better in the default run | `R3/verdicts/j8-smooth.md` line 133 |
| Principles section, default run | 3.3 fps | 10.6 (34 frames); at 1024: 4.4, on only 13 frames | at least 4.95 | better on one run, not corroborated: it is the worst section in 4 of 5 screencasts. Under the bar at 1024 | `R3/MANIFEST.md` section 2; `R3/verdicts/j8-smooth.md` T04 |
| Journey section, default run | 3.5 fps | 5.6 (19 frames) | at least 5.25 | better on one run, not corroborated: it clears the bar by 0.35 fps on 19 frames, inside run-to-run noise | `R3/MANIFEST.md` section 2; `R3/verdicts/j8-smooth.md` T05 |
| Kill-list section, default run | 3.9 fps | 5.6, on only 13 frames | at least 5.85 | just under | same |
| Work / principles / journey / kill-list, native run | 3.2 / 3.3 / 3.5 / 3.9 fps | 4.3 / 2.9 / 3.5 / 3.0 | at least 4.8 / 4.95 / 5.25 / 5.85 | **miss: 0 of 4 pass** (at 1024: 20.5 / 4.3 / 3.3 / 6.5, 2 of 4 pass, no P3-0 baseline) | `R3/verdicts/j8-smooth.md` T11 |
| Sections that were fast, default run: act-1 / experiment / act-4 / credits | 28.8 / 52.7 / 38.0 / 40.0 fps | 7.7 / 14.5 / 12.6 / 14.3 | none set | about 3 to 4 times slower (2.8 to 3.7 times; credits is under 3 times). In the native run they are 3.6 to 7.6 times slower (4.0 / 7.3 / 5.0 / 11.2 fps) | `R3/verdicts/j8-smooth.md` line 133, T09 |
| Act card transition, act-1 / act-4 | 26.2 / 29.2 fps | 7.6 / 12.5 | none set | slower (act-2 and act-3 level or better) | `R3/verdicts/j8-smooth.md` line 133 |
| Idle at rest: journey / act-4 / hero | 60.3 / 60.6 / 31.9 fps | 0.3 / 27.1 / 14.8 | 60 | worse | `R3/verdicts/j8-smooth.md` T18; `docs/build/motion-strips/p3-before/summary.md` idle table |
| Desktop LCP, intro on, 1440 | 260 to 368 ms (older M5 record); base, same method as the after: 240 to 292 ms | final build: 904 / 948 / 932 ms (`qa.js`) and 440 / 956 / 1,024 ms (the QA run's own loads). Round 3 (`qa.js`): 780 / 732 / 764 ms | at most 400 | **miss**, and higher than in round 3 (section 5.5) | `docs/build/FINAL-REPORT.md` lines 233-235; `P3F/lcp-base-desktop-1440-armed.json`; `P3F/qa/qa-head-1440x900.json`; `P3F/modes-normal-1440x900.json`; `R3/MANIFEST.md` line 282 |
| Desktop LCP, `?skip=intro`, 1440 | 264 / 380 / 312 ms (base, same method) | 212 / 216 / 288 ms | at most 400 | pass | `P3F/lcp-base-desktop-1440-skip.json`; `P3F/modes-normal-1440x900.json` |
| Mobile LCP, 390x844, 4x CPU slowdown, 1.6 Mbps, intro armed | base median 1,514 ms (same-session A/B) | median 1,636 ms (+8.1 %); worst load 2,432 ms | two bars (spec 12.1, line 1374): at most 2.5 s, and within +/-5 % of base | **absolute bar (at most 2.5 s) met; +/-5 % bar missed** | `P3F/lcp-mobile-base-r1.json`, `-r2.json`; `P3F/lcp-mobile-head-r1.json`, `-r2.json`; `docs/build/PHASE3-SPEC.md` line 1374 |

What is missing from the before column:

- The P3-0 file has no LCP and no byte counts. Those come from `docs/build/FINAL-REPORT.md` lines 233-235, `docs/build/PHASE3-SPEC.md` section 12.1 and `REP/W3.md` section 3. The mobile LCP of 1,332 to 2,020 ms (median 1,612) in the older record is a different build and session, so the same-session A/B above is the fair comparison (`P3F/README.md` section 5).
- The 54 ms hand-off script. P3-0 recorded it: `docs/build/motion-strips/p3-before/summary.md` lines 61 and 71 list a `user-callback:FrameRequestCallback 54 ms` long animation frame in section `top` at 6.27 s, right after the landing. `docs/build/PHASE3-SPEC.md` section 4.4 (line 615, the P3-0 column) and `REP/W1.md` line 120 ("P3-0 54") quote it. The 77 ms in the same file is a different task: `BUTTON#intro-play.onclick` at -0.03 s, the Play click, not the hand-off (lines 59 and 77). The hand-off script was not measured in round 3; the nearest evidence is a 76 ms (1440) and a 112 ms (1024) script task at the intro hold (`R3/verdicts/j8-smooth.md` T27). The last measured value is 21 to 22 ms against a target under 10 (`REP/W1.md` line 120).
- The real-GPU row (p95 at most 20 ms, at most 2 % of frames over 33 ms, none over 50 ms in card transitions) was never measured. No real-laptop recording exists (`R3/TRIAGE.md` R26).
- The speed tool (`motion.js`), the idle-task figure and the judges were not re-run on the final build. Their last numbers are round 3 (`P3F/README.md` section 8).
- The machine itself drifts. The same base build ran at 55 to 75 % of its P3-0 speed in later sessions (`docs/build/motion-strips/p3-w1/MEASURE.md` line 31).

---

## 3. The three critic rounds

Each round: capture the page, send the captures to fresh AI judges, sort their findings, fix, repeat. The plan allowed three rounds. The ship bar was "every axis at 4 or more and every pass bar met" (`docs/build/PHASE3-PLAN.md` section 11.4).

Before the rounds there were three build waves: Wave 1 (foundation, intro hand-off, type; integrated `4f4f7ef`, gate `dcd92ea`), Wave 2 (engines; integrated `56a9557`, gate `778d3b1`) and Wave 3 (hosts, games, cinema; integrated `79b69b1`, gate `5ef0d47`) (`REP/W1.md`, `REP/W2.md`, `REP/W3.md`).

Two commit titles are numbered by the round that comes next: `d7a6543` and `ece90dc` say "round 3" but carry the fixes for round 2's findings. (`21674b2` and `dedd0f1` are titled "round 1" and carry round 1's findings.)

### 3.1 Scores, round by round

Two values mean 1440 wide / 1024 wide. Judge scores are on a 1 to 5 scale (`R3/TRIAGE.md` lines 25-43).

| Axis | Pass bar | Round 1 | Round 2 | Round 3 | Met in round 3? |
|---|---|---|---|---|---|
| J1: one star per screen | 90 % of reader clips show exactly one star; none star-less outside a declared breath; none with two or more | **2.** By eye 53.6 / 54.5 % | **2.** 48.8 / 45.8 % | **2.** **33.1 / 34.1 %**. Star-less outside a breath 149 / 136. Two stars at once by eye: 1 clip at 1440, 2 at 1024 | No, on all three sub-bars |
| J2 / J3 / J4: would you keep scrolling | 80 % "yes" per act; no two "no" in a row; hand-off, 4 cards and first Work screen "yes" | 3 / 3 / 3 (yes 56 to 66 %) | 3.75 / 2.5 / 3.75 (yes 81.6 / 57.1 / 83.7 % at 1440) | **3.5 / 3.0 / 3.5** (1440: 77.6 / 69.4 / 73.5 %; 1024: 77.8 / 63.0 / 68.5 %) | No, on all six judge-and-width runs |
| J2 / J3 / J4: tempo | the spec's tempo word named right by 2 of 3 judges per act | 3 / 3 / 3 | 3.25 / 2.5 / 3.5 (4 of 7 acts right) | **3.15 / 3.0 / 3.25** (3 of 7 acts right) | No |
| J2 / J3 / J4: game discovery | each judge sees the chip and one toy invite within 3 screens | 2 / 3 / 3 | 2.5 / 2.0 / 2.75 (bar failed) | **3.0 / 2.75 / 3.0** (bar met 3 of 3) | Bar yes, score under 4 |
| J5 to J7: blind recognition | at least the P3-0 count in each world | below base | below base | below base for 3 worlds (table below) | No |
| J5 to J7: your name read | 3 of 3 | 3 of 3 | 3 of 3 | 3 of 3 | Yes |
| J5 to J7: fast lane found in 10 s | 3 of 3 | 3 of 3 (1 s) | 3 of 3 (1 s) | 3 of 3 (1 s) | Yes |
| J5 to J7: "can't read" items | 0 | 37 / 25 | 59 / 56 | **44 / 47** | No |
| J5 to J7: hooks (first 5 % of a card change), each 3 of 3 | 8 of 8 | 4 of 8 | 4 of 8 | **4 of 8** | No |
| J8: smoothness | spec 12.1 headless targets and 4.4 intro rows | 3 | 2.5 | **2.5** (5 of 31 target rows met, 22 missed, 4 not measurable) | No |
| J9: honesty and accessibility | green; RELEASE fails only per DP-9 (plan 11.3 and 12) | 3 (2 red rules) | 4 (0 red) | **4** (1 red rule: 5 community quotes, verify or remove) | **Met with exceptions.** There is 1 red rule, so it is not green. The quote gate is outside DP-9: J9 says it is "not one of the three classes" and should be reported separately (`R3/verdicts/j9-honest.md` line 9). J9 saw two of the five quotes (Q-3I-3 on the Optuna chalkboard, Q-RD-1 on the Red Dead film card) on the page for everyone (line 16), and the kill-list kicker contradicts the EXCEPTION row (F2, line 50). Both are live on the branch now, against "no unverifiable claims" (`docs/build/CONTENT-RULES.md` line 12) |
| Automated: no dead screen | 0 gaps over 100 vh; every fill shown | 0 gaps; 8 of 11 fills | 0 gaps; 11 of 11 | 0 gaps; 11 of 11 | Yes |
| Registration drift (ignite SSIM; bar 0.95) | at least 0.95 | 0.951 / 0.923 | 0.953 / 0.923 | ignite 0.994 / 0.991 and 0.983 / 0.983; GL seam at 1024: 0.944 | 1440 pass, 1024 fail |
| `RELEASE=1 npm run check` errors | fails only per DP-9 | 46 | 46 | 47 | **Met with one exception.** 46 are DP-9 items (40 Check L2 + 5 TTS + 1 unsigned-copy line). The 47th, the community-quote gate, is outside DP-9 |

Blind recognition, frames recognised out of frames shown, 1440 / 1024 (`R3/TRIAGE.md` line 33; `docs/build/m2-review/BLIND-FINAL.md` lines 37-42 for the base):

| World | Before (base) | Round 1 | Round 2 | Round 3 |
|---|---|---|---|---|
| Pirates | 10 / 10 | 7 / 9 and 6 / 8 | 5 / 9 and 4 / 8 | **4 / 9 and 4 / 8** |
| 3 Idiots | 9 / 10 | 6 / 9 and 6 / 9 | 2 / 9 and 2 / 9 | **4 / 9 and 4 / 9** |
| Red Dead | 9 / 13 | 5 / 11 and 6 / 10 | 8 / 11 and 8 / 10 | 8 / 11 and 8 / 10 (equal or better rate) |
| Harry Potter | 10 / 12 | 10 / 10 and 10 / 10 | 10 / 10 and 10 / 10 | **7 / 10 and 8 / 10** |
| Total | 38 / 45 | 28 / 39 and 28 / 37 | 25 / 39 and 24 / 37 | 23 / 39 and 24 / 37 |

There were 0 wrong-film frames in every round, recounted from all six `score-blind-*.md` files (`R1`, `R2` and `R3` `verdicts/`). The misses are the right film at 0.3 to 0.7 confidence per judge, plus some "unknown" (`??`) answers: 13 in round 1 (at 0.10 to 0.25), none in round 2 and 4 in round 3 (at 0.15, the drone-in-the-courtyard frame at both widths). The 0.30 to 0.55 range in `R3/TRIAGE.md` is the idiots Work frames only. The pass needed 0.6 or more from 2 of 3 judges (`R3/TRIAGE.md` line 79). The number of test frames differs a little between tests, so compare rates, not counts.

### 3.2 What each round fixed

- **Round 1** (judged `5ef0d47`; fixes `21674b2` and `dedd0f1`). A star arbiter so a scroll star owns the spotlight only during its own window. Card hook order. The intro name and hero. Act II's reduced-motion overprint. Act III and IV plate reuse. A hunt chip and a game invitation. Nine confirmed code-review findings. Result: J9 went from 3 to 4, dead-screen fills from 8 to 11 of 11, hooks css-ignite and css-seam from 0 of 3 to 3 of 3. Side effects: css-opening fell from 3 of 3 to 0 of 3 and 3 Idiots recognition from 6/9 to 2/9 (`R2/TRIAGE.md` lines 42-47).
- **Round 2** (judged `dedd0f1`; fixes `d7a6543` and `ece90dc`). A still screen with no owner is lent to one live star. New porthole sea, GL hole and tintype fixes. A films intertitle. The letterbox flag moved off `<html>`. A Pirates body face that never swaps late. The Systems matrix folded. Kill-list rows. A map walk. Idle work cut into slices. A header band. Seven more confirmed review findings. Result: 3 Idiots recognition 2/9 to 4/9, "can't read" 59 / 56 to 44 / 47, css-opening 0 of 3 to 2 of 3, ignite registration passes, the keyboard probe passes (78 stops, all 12 eggs, the compass). Worse: Act II yes-rates fell for all three judges, tempo went from 4 of 7 to 3 of 7, css-ignite and css-seam fell from 3 of 3 to 1 of 3, and CLS went from 0.006 to 0.0454 (`R3/TRIAGE.md` lines 53-69). Harry Potter recognition also fell (10/10 to 7/10 at 1440 and 8/10 at 1024), but by 3 and 2 frames, which is within the noise rule below. Pirates is left out of this list: it moved from 5/9 to 4/9 at 1440 (one frame) and stayed at 4/8 at 1024. Of the per-world blind numbers, only 3 Idiots (6/9, then 2/9, then 4/9) moved by more than noise.
- **Round 3** (judged `ece90dc`). No round 4. The judges' leftovers (R01 to R28) went into three piles: fix now, tell Aryan, and needs a real laptop (`R3/TRIAGE.md` "RESIDUALS").
- **The small pass after round 3** (`9c5f6fc`, `ef0a549`; not re-judged). R01: deep links such as `/#work` now land under RM and Pause on laptops. R02: layout-shift fixes (two-line film bill, near-zero opacity poses instead of 0). R03: the hero grain tile is built without a canvas read-back, and the GL canvas is created at final size. QA confirmed R01 (section 5.4). R02 held for wheel-paced scroll. R03 was **not** re-measured (`P3F/README.md` section 8).

### 3.3 Bars not met after round 3, and why

The ship bar was not met after round 3. Only the honesty axis reached 4. "App" means the page itself is at fault. "Test limit" means the way it was measured is. "Spec" means the spec was wrong. Sources are `R3/TRIAGE.md` lines 71-84 and residuals R04 to R28.

| Bar | Result | Cause | Kind | What would change it |
|---|---|---|---|---|
| One star per screen: 90 % | 33.1 / 34.1 % by eye. The spotlight log says 73.5 / 72.0 %, and the machine's own motion check says 51.0 / 55.2 %. | The loops lent to still screens do not read as motion at the 2 second dwell stops. The machine counts 76 / 61 reader clips with a star in the log and no motion (`R3/MANIFEST.md` line 97). J1's eye confirmed 68 / 55 of them as "(static)" star clips (`R3/verdicts/j1-star.md` line 94; R04 in `R3/TRIAGE.md`). | App, plus a test limit: the judge looked at 200 px frames, 4 per second, and in round 3 saw the machine's "(static)" labels, so 48.8 to 33.1 % overstates the fall. The machine's own motion count rose 4 to 9 points since round 2. | Your call on how much the page may move at stops (section 6C). Bigger movers: the pen, the compass invite, the hero sea, the Map. A real-laptop look at whether the loops read at full size. |
| Keep scrolling: 80 % | 63 to 78 % over six runs | Act II is the one stretch every judge fails (44 to 69 %). The first Work screen is "no" for two judges. Small grey type, one repeated template, 6 to 8 seconds of identical frames, a 25 to 30 second stretch from Optuna to the kill-list. | App, taste, and a test limit: the same page moves 4 to 10 points between judge instances. | Act II layout and your words. This is the hiring-evidence stretch and belongs with the Phase 2 info pass. |
| Hooks: 4 of 8 | css-ignite 1/3, css-seam 1/3, css-opening 2/3, gl-ignite 2/3 | At 5 % of a card change the new title sits over the old picture by design. Two judges read it as a glitch. At 1440 the capture also walked the page fast, so the act titles showed in the fallback serif. | Mixed | A design option: hold the old caption and picture until 15 %. It changes the cards you wanted protected. A fast scroller can still meet the fallback serif (R20). |
| Blind recognition | Pirates 4/9 (was 10/10), 3 Idiots 4/9 (was 9/10), Harry Potter 7/10 (was 10/12) | Weak cues on the hero sea, the journey steps, Work and Systems. The drone-in-the-courtyard frame reads as a generic picture. | App (art), plus a test limit: a pass needs 0.6 or more from 2 of 3 judges. | Stronger plates and your photos (section 6D). |
| Smoothness: 2.5 of 5 | Default run level with P3-0 (15.1 against 15.2 fps, from different sessions, so within session drift). Native path (the like-for-like) 10.0 fps and p95 350 ms against 15.2 and 316.7: 34 % slower, and 0 of 4 worst-section rows pass (section 2.2) | Page-owned costs: 12 / 11 will-change layers in Principles against a budget of 8, act-1 with 3.5 MP of images and 4 masks, act-4 with 21 endless animations, journey at 0.3 fps when idle. | Mixed. Every absolute number is software drawing: 98 to 99 % of the long animation frames over 50 ms carry under 20 ms of main-thread work. | A real-laptop recording. J8 puts the score at about 2 to 3.5 depending on a real GPU. Then fix what remains. |
| "Can't read": 0 | 44 / 47 | About 12 / 15 are stills cut at the bottom edge by the capture. 9 / 14 are text under the sticky header. The rest is tiny type. | Mostly test limit and app. AA contrast passes everywhere (0 failures on 510 / 527 live boxes). | Larger small type. The header band. |
| Tempo: 3 of 7 acts right | Films read brisk by 3 of 3, spec says slow. Act II reads slow, spec says brisk. | Films: the spec. Act II: the app. | Spec and app | Amend the spec for the films. Do not slow them. |
| 1024 registration (0.95) | GL seam 0.944; opening css push 0.9497 in a repeat | A tiny misalignment, not visible. | App, sub-visible | List only. |

Met in round 3: no dead screen, your name, the fast lane, the discovery pass bar as written and the keyboard probe. Met with exceptions: honesty and accessibility (J9 scored 4 with one red rule, the five community quotes) and RELEASE (46 of the 47 errors are DP-9 items; the community-quote gate is not).

Caution on every number above: the judges are new instances each round and the same page moves 4 to 10 points between two instances. Treat a swing under about 10 points on a panel number, or 2 to 3 frames on a per-world blind number, as noise (`R3/TRIAGE.md` lines 45-51).

---

## 4. Credits, loops and the loop table

### 4.1 Credits

- **Phase 3 spent 333.62 credits of a 350 cap. 16.38 are left in the lane. The balance is 172.88.** The balance was read at 2026-09-30 23:23 UTC (`MEDIA/LEDGER-p3loops.md` line 4; `MEDIA/LOG.md` line 948; `MEDIA/p3/B9.md` lines 5-11). Targets were a balance of at least 156.5 and a reserve of at least 100. Both are met.
- **Older files still show a balance of 184.88. That is stale.** At `ef0a549`, `CONTINUE.md` line 2 says about 322 credits spent with a balance of 184.88. `REP/W3.md` lines 110 and 308 give only the balance of 184.88, and so do the round 1 and 2 triage briefs (`R1/TRIAGE.md` line 35, `R2/TRIAGE.md` line 85). The figure 321.62 appears only in `MEDIA/p3/B8.md` (line 13) and `MEDIA/p3/B9.md` (lines 10 and 137). It is the lane spend after batch B8. Batch B9 then spent 12.00 on the L22 retake (job `0d55d8ed`, charged 2026-09-30 23:14:30 UTC; `MEDIA/p3/B9.md` lines 5-11 and 137-140; the same job is in `lib/media.ts`). The commit that adds this report refreshes `CONTINUE.md`.
- I did not query Higgsfield. No tool call was made. 172.88 is the ledger figure, not a live balance.
- Before Phase 3 the balance was 506.5 (`MEDIA/LOG.md` line 902; `CONTINUE.md`). 506.5 minus 333.62 is 172.88. The programme started at 1,200 credits (`MEDIA/LOG.md` line 3), so 1,027.12 have been spent in all (derived).

| Batch | What | Credits | Source |
|---|---|---|---|
| B1 | L01 to L04 (4 at 14) | 56 | `MEDIA/p3/B1.md` |
| B2 | L05, L06 (14 each), L08, L12 (10.5 each) | 49 | `MEDIA/p3/B2.md` |
| B3 | L09, L10, L11, L13 (10.5 each) | 42 | `MEDIA/p3/B3.md` |
| B4 | L14 to L17 (10.5 each) | 42 | `MEDIA/p3/B4.md` |
| B5 | L18, L19, L20 (10.5 each) | 31.5 | `MEDIA/p3/B5.md` |
| B6 | L21 (10.5), L22 first take (12), L23 (12), L24 (10.5) | 45 | `MEDIA/p3/B6.md` |
| B8 | SEQ-PEARL 8.75, SEQ-HALL 8.75, L03 retake 14, L04 retake 14, L07 10.5, spoken lines 0.12 | 56.12 | `MEDIA/p3/B8.md` |
| B9 | L22 retake | 12 | `MEDIA/p3/B9.md` |
| Check steps, marks, horse frames, tools, six re-seams | | 0 | `MEDIA/LEDGER-p3loops.md` |
| **Total** | | **333.62** | `MEDIA/LEDGER-p3loops.md` line 4 |

Derived split. **225.37 credits went on assets that shipped** (19 loops, SEQ-HALL and the spoken lines). **108.25 went on failed or replaced takes** (L03 14, L03 retake 14, L04 14, L04 retake 14, L07 10.5, L13 10.5, L24 10.5, L22 first take 12, SEQ-PEARL 8.75), which is 32.4 % of the spend.

### 4.2 Living loops against the bar

The spec asked for **at least 20 of the 25 planned loops** (`docs/build/PHASE3-SPEC.md` line 1454). **19 shipped. One short.** I counted them by running the registry's own rule over `lib/media.ts`: L01 L02 L05 L06 L08 L09 L10 L11 L12 L14 L15 L16 L17 L18 L19 L20 L21 L22 L23. Six free re-seams (MV-03, MV-03-alt, MV-11L, MV-11L-alt, MV-09, MV-09-alt) also play over plates. Counting them would clear 20, but the spec and the ledgers count the 19 (`MEDIA/LEDGER-p3loops.md`).

The cheapest way to reach 20 is the free "L04r living still": its master seams cleanly as a still with one tail swish. Its only miss is the sun-disc zone, which a sun hold would fix (`MEDIA/p3/B9.md` section 1). That is your call. The lane has 16.38 credits left, which "is not enough for another job under the rules" (`MEDIA/p3/B9.md` line 11).

### 4.3 The loop table

**Shipped: 19 loops, each the host's DEFAULT, each with the code depth-and-camera ALT** (`MEDIA/LEDGER-p3loops.md`; `MEDIA/p3/B9.md` section 5).

| Loop | Plate | Plays on | Credits | Flag |
|---|---|---|---|---|
| L01 | iconic-pearl | Opening card settle; Films Pirates ALT | 14 | |
| L02 | iconic-hall | Ignite (Great Hall) settle | 14 | lineStart 1.16/255 on the MP4 |
| L05 | IN-01 | Intro play screen | 14 | |
| L06 | MV-05a | About, cue 2 | 14 | |
| L08 | iconic-ice | Seam IN; Optuna cue 1 | 10.5 | near-still |
| L09 | MV-06 | Work board | 10.5 | |
| L10 | iconic-corridor | Trading Algos window | 10.5 | |
| L11 | MV-07 | Ignite css, middle still | 10.5 | near-still |
| L12 | MV-04 | Seam OUT storm (kraken egg host) | 10.5 | wave grows past the foam band at about 50 %; spray crosses the horizon at the right edge |
| L14 | iconic-pearl-alt | Films Pirates | 10.5 | |
| L15 | iconic-wanted | Beyond handbill | 10.5 | near-still |
| L16 | iconic-ice-alt | Optuna head | 10.5 | near-still |
| L17 | iconic-pen | Kill-list head | 10.5 | near-still |
| L18 | iconic-pen-alt | Work head | 10.5 | near-still |
| L19 | MV-05b | Journey fog, at rest | 10.5 | |
| L20 | MV-05d | Journey end, at rest | 10.5 | |
| L21 | iconic-deadeye | Films, Red Dead screen | 10.5 | near-still |
| L22 | F-3I | Films, 3 Idiots (21:9; B9 retake, lake-only cinemagraph) | 12 | watch the join and the shore lap in real time |
| L23 | F-HP | Films, Harry Potter ALT (21:9; flames only) | 12 | |

Also shipped: **SEQ-HALL**, a 72-frame sequence (push-in #3, DEFAULT), 3.66 MB against a 1.6 MB soft budget, 8.75 credits, first-frame SSIM 0.968 (`MEDIA/LEDGER-p3loops.md`). The six free re-seams also shipped.

**Failed, so the code ALT is the DEFAULT** (no further retake was bought):

| Asset | What happened | Credits spent | What plays instead |
|---|---|---|---|
| L03 iconic-camp | Failed twice (L03, L03 retake) | 28 | Code drift toward the fire mark |
| L04 MV-10 frontier-dusk | Failed twice (L04, L04 retake) | 28 | Code push toward the sun. A free "L04r living still" option exists. |
| L07 iconic-drone | Failed, not retaken | 10.5 | Code drift on the Systems band (the chalk-sprite drone is the toy) |
| L13 iconic-express | Failed, not retaken | 10.5 | Code ALT. L23 is the living ALT. |
| L24 MV-10-alt | Failed, no retake | 10.5 | Code ALT |
| SEQ-PEARL | Failed Check L2: 5 single-frame lightning flashes at frames 15, 31, 47, 74, 103, and three head-and-shoulders silhouettes growing on the bow rail | 8.75 | Push-in #1 is a code push on L01 (`card-opening.push` = `code-push-l01`, scale 1 to 1.3 about the stern) |

**Cut:** L25 iconic-camp-alt was never generated (the spec's "cut first"). The L22 first take (12 credits) was replaced by the B9 retake.

**Push-ins:** #1 code push on L01 (DEFAULT). #2 code camera on L08. #3 SEQ-HALL. Registration at 1024: #3 passes (0.983 / 0.983), #2 GL seam fails at 0.944, #1 css push is 0.9497 in a repeat (`R3/MANIFEST.md` section 1, drift).

Variant registry: 60 piece keys, 33 hosts, every key with an ALT (`lib/variants.ts`). The manifest never selects an ALT; `lib/film.ts` has `defaultVariant: "default"`. The check says "variants: 14 hosts in use, 30 pieces, 30 with an ALT" (`P3F/logs/check.txt`). The check also warns that three ALTs (work.head, beyond.band, voices.fire) play assets that are not registered media alternates.

---

## 5. Final QA

Run on `ef0a549` with a clean tree and no app code touched. Chromium 141 headless, 4 CPUs, software drawing, localhost, one browser and one server at a time (`P3F/README.md`, `P3F/METHODS.md`). The base for comparisons is `5aa4587`, rebuilt for this run.

### 5.1 Gates

| Gate | Result | Source |
|---|---|---|
| `npx tsc --noEmit -p .` | Pass (exit 0) | `P3F/logs/tsc.txt` |
| `npm run check` | Pass (exit 0, "check-manifest: OK (67 warning(s))") | `P3F/logs/check.txt` |
| `npx eslint .` | Pass (exit 0, no output) | `P3F/logs/eslint.txt` |
| `npm run build` | Pass (exit 0, Next 16.2.9 Turbopack, compiled in 12.1 s, 16 static pages) | `P3F/logs/build.txt` |
| `RELEASE=1 npm run check` | **Fail (exit 1, 47 errors).** 46 are DP-9 items (40 + 5 + 1). The 47th, the community-quote gate, is outside DP-9. 40 + 1 + 5 + 1 = 47. | `P3F/release.txt` |

The 47: 40 "Check L2 awaits Aryan's countersignature" media rows, 1 community-quote gate [J9 F3], 5 spoken lines awaiting you, 1 line listing 107 unsigned copy strings (all 107 wired into the page). The error lines are identical to `REP/P3-11-r3-release.txt`. Nothing else fails. Section 6A lists them.

What DP-9 covers. The plan's bar is that `RELEASE=1` fails only per DP-9 (`docs/build/PHASE3-PLAN.md` lines 53, 548 and 557). DP-9 names the unsigned copy, the Check L2 countersignatures and, by its amendment of 2026-10-02, the TTS approvals. That is 46 of the 47 errors. The community-quote gate is outside DP-9. J9 itself says it is "not one of the three classes" and should be reported separately (`R3/verdicts/j9-honest.md` line 9). It is not a sign-off: the answer is to verify each quote against the work or stop showing it (section 6A).

### 5.2 Widths

Six sizes, 3 runs each, on the new build and on the base. Scripted full scroll with `/?skip=intro`. Touch contexts for the four small ones (`P3F/widths-head.json`, `P3F/widths-base.json`, `P3F/compare-head-vs-base.json`).

| Size | Console / page / hydration errors, failed requests, HTTP 400+ | h1 | Sideways overflow | Page height, new (base) | Result |
|---|---|---|---|---|---|
| 1440x900 | 0 | 1 | 0 | 44,250 (41,499) | Pass |
| 1024x768 | 0 | 1 | 0 | 41,397 (37,916) | Pass |
| 1024x1366 touch | 0 | 1 | 0 | 37,425 to 37,762 (39,043) | Pass on errors. Differs from base (below). |
| 844x390 touch | 0 | 1 | 0 | 39,525 (39,564) | Pass on errors. Differs from base (below). |
| 390x844 touch | 0 | 1 | 0 | 46,356 (46,391) | Pass on errors. Differs from base (below). |
| 320x640 touch | 0 | 1 | 0 | 49,915 (49,968) | Pass on errors. Differs from base (below). |

All 18 runs: 0 console errors, 0 page errors, 0 hydration errors, 0 failed requests. The scroll width equals the client width at every size. One clipped SVG path (`path.stroke-(--w-storm)`) sits past the right edge but does not scroll the page. The base has the same one. `qa.js` at 1440 and 1024 agrees: 52 anchors, 0 broken, 0 hydration errors, no overflow at 320, 390, 1024 and 1440 (`P3F/qa/`).

**Phones, tablet and landscape are not strictly "unchanged except the intended changes".** 844x390, 390x844 and 320x640 show the same set of differences (`P3F/README.md` section 2). The tablet differs in addition (below):

- *Intended, on the spec's list (section 13):* the capabilities strip text now says smooth scroll on desktop and WebGL for scene changes. `systems.pencil.body` is longer. The "chart slot" placeholder is no longer drawn. Trading Algos is 42 / 61 / 78 px shorter and Optuna 43 / 60 / 79 px shorter at 844 / 390 / 320.
- *Not on the spec's list, small, all text:* four act loglines exist in the page text, as 1x1 px screen-reader-only subtitles with no layout (they change what a screen reader announces, not what a phone shows). The Writing caption `ARTHUR MORGAN'S JOURNAL` became `A JOURNAL LIKE ARTHUR MORGAN'S` (`cap.writing`, unsigned, commit `d7a6543`). The credits Higgsfield line gained `minimax_h3`, built from media provenance. Systems is +18 / +59 / +77 px and credits +27 / +28 / +27 px. Net page height is -39 / -35 / -53 px.
- 390 and 320 have identical text hashes within each build. At 844x390 both builds vary between runs, so no single hash is quoted for either. The new build has 3 distinct hashes (`innerText` 25,280 / 25,312 / 25,313 characters) and the base has 3 (24,975 / 24,957 / 24,990). The new build is not stable at 844x390, and the cause of the variation was not diagnosed (`P3F/compare-head-vs-base.json`).

**1024x1366 (iPad portrait)** gets the wide layout but not smooth scroll, the stage or WebGL. The page is 1,281 to 1,618 px shorter than the base. About 3,300 fewer characters are rendered, because the closed `<details>` boxes at 64rem and up hide them (Optuna appendix, About note, credits lists, the Systems matrix fold). The hidden text is still in the page (`textContent` is higher than the base). Tablet text rotates between runs on both builds, so there is no single hash. This is the largest difference from the base at any size, and the plan asks for 1024x1366 to be unchanged except the intended changes (`docs/build/PHASE3-PLAN.md` section 12). `REP/W1.md` section 7 (line 243) expected the iPad to be about 900 px taller from the world type. The folds more than cancelled that, and the page came out shorter. Section 6C asks you to keep or limit the folds.

### 5.3 Reduced motion and Pause

1440x900 and 1024x768, 2 loads each, then a wheel pass over the whole page and an 11-section walk (`P3F/modes-rm-*.json`, `P3F/modes-paused-*.json`, `P3F/README.md` section 3). All four cells gave the same result:

| Check | Result |
|---|---|
| Running animations | 0 |
| Video elements, playing, media requests, video bytes | 0, 0, 0, 0 |
| Audio contexts created, `play()` calls, audio requests | 0, 0, 0 |
| rAF callbacks in 1 s idle, WebGL canvases, Lenis | 0, 0, off |
| CLS at rest, after the wheel pass, after the walk; shifts after hydration | 0, 0, 0; 0 |
| h1, overflow, console errors | 1, 0, 0 |

Pass. The two `qa.js` readings `lenis.pauseBefore = false` and `noJs.allInView = false` are tool-side (a late attach and smooth scroll while the tool reads), as in round 3.

### 5.4 Deep links

- **Under RM and Pause on laptops: 48 of 48 landed** (4 links `#work #beyond #principles #journey`, 3 loads each, 4 mode-and-width cells). The target top sat at 92 or 93 px and did not move afterwards (`P3F/modes-rm-*.json`, `P3F/modes-paused-*.json`). Round 3 had 2 of 8 under RM and 0 of 4 under Pause (`R3/TRIAGE.md` lines 153-160). Pass.
- **45 of 45 loads across motion on, RM and Pause (links #work, #kill-list, #act-2), per the `ef0a549` commit message; not re-run in QA.** The commit message gives 27 loads at 1440 and 18 at 1024. It is not a motion-on-only figure, and its three links differ from the four links used above. The final QA did not re-run it (`P3F/modes-normal-*.json` have no deep-link loads).
- **On phones (390x844): 2 of 8 land on the new build and 2 of 8 on the base, at the same places.** `#work` overshoots by about 2,000 px. `#beyond` and `#principles` stay at the top (`P3F/phone-deeplinks-390-head.json`, `P3F/phone-deeplinks-390-base.json`). This is old behaviour, not a regression. It is Phase 4 scope.

### 5.5 Load time and layout shift

**Desktop LCP, 3 loads per cell, cache off** (budget: at most 400 ms) (`P3F/README.md` section 5):

| Width | Path | New build (ms) | Base, same method (ms) | Result |
|---|---|---|---|---|
| 1440 | intro on (`/`) | 440 / 956 / 1,024 (qa.js: 904 / 948 / 932) | 240 to 292 | **Fail** |
| 1440 | `?skip=intro` | 212 / 216 / 288 | 264 / 380 / 312 | Pass |
| 1024 | intro on | 380 / 972 / 828 (qa.js: 984 / 1,004 / 848) | 264 to 328 | **Fail** |
| 1024 | `?skip=intro` | 228 / 232 / 212 | 248 / 296 / 228 | Pass |

Cause: the page itself (the intro video becomes a larger LCP candidate). The name (h1) paints at 236 to 440 ms. In 4 of the 6 loads the QA run made itself, the intro play-screen loop video (`intro-play-loop.webm`) then arrives at about 830 to 1,020 ms as a larger candidate and becomes the LCP. In the other 2 (load 1 at each width, 440 ms at 1440 and 380 ms at 1024) no video candidate fired, and `lcpArmed` lists only the h1 span (`P3F/modes-normal-*.json`). So the video candidate is intermittent in the QA run's own loads. It was the LCP in all 6 `qa.js` loads. The ranges in this table are per method. Pooled over both methods, the intro-on LCP runs 440 to 1,024 ms at 1440 and 380 to 1,004 ms at 1024, against a budget of at most 400. The absolute video times include software video decode, so a real GPU will differ. The existence of a second, larger candidate is not a test artefact. Only a real-laptop trace can settle the number.

Trend since round 3. LCP was re-measured, and it went up. With the same tool (`qa.js`, 3 loads each), round 3 gave 780 / 732 / 764 ms at 1440 and 816 / 724 / 736 ms at 1024 (`R3/MANIFEST.md` line 282; `R3/qa/qa-1440.json`, `qa-1024.json`). The final build gives 904 / 948 / 932 ms and 984 / 1,004 / 848 ms. The means rise by about 169 ms at 1440 and 187 ms at 1024 (derived). That may come from the final pass (`9c5f6fc` / `ef0a549`) or from noise or session drift: no run isolates a cause. R03 (the idle task) was not re-measured in the final QA. LCP was.

**Mobile LCP** (390x844, intro on, 4x CPU slowdown, 150 ms round trip, 1.6 Mbps; same-session A/B, alternating, 6 loads each; element `hero-sea-mobile.webp` on both): new median **1,636 ms** (loads sorted: 1,580 / 1,596 / 1,612 / 1,660 / 1,772 / 2,432), base median **1,514 ms** (loads 1,404 to 1,564). Spec 12.1 sets two mobile bars (`docs/build/PHASE3-SPEC.md` line 1374). **The absolute bar, a lab LCP of at most 2.5 s with the intro armed, is met:** the median is 1.636 s and the worst load is 2.432 s. **The unchanged +/-5 % bar is missed:** +8.1 % on the median, outside +/-5 % (+6.5 % without the 2,432 ms load). A possible cause is bytes, not drawing. This is an untested hypothesis: no experiment isolates bytes. The "/" HTML grew by 31,615 B gz, plus JS +3,612 B and CSS +4,906 B, about 40 KB gz in all (40,133 B). At 1.6 Mbps that is roughly 200 ms (derived). That figure counts all of the JS and CSS as on the LCP critical path, so it is an upper bound. The measured gaps are smaller: **122 ms on the median (1,636 against 1,514)** and 176 ms on the best load (1,580 against 1,404). The +6 KB budget counts only JS and CSS, so the HTML growth is outside it. The gap size is a lab number (`P3F/lcp-mobile-*.json`).

**Layout shift (CLS).** The spec says 0.
- *Wheel-paced scroll* (100 px every 110 ms): 0 in every run at 1440 and 1024 (3 normal, 2 RM, 2 Pause per width), with 0 shifts after hydration. **Pass.** (`P3F/modes-*.json`)
- *Page load with the intro on:* 0.00077 at 1440 and 0.00117 at 1024. The intro play button's text moves 3 to 5 px at about 0.3 s. Tiny, but not strictly 0. With `?skip=intro`: 0. The base was 0.00738 / 0.01599 armed.
- *Phone page load with the intro armed* (390x844, throttled, the mobile A/B above): CLS 0.0142 to 0.0143 on the new build and 0.0142 on the base (0.01419 to 0.0142). Not 0 on either build, and no regression (`P3F/lcp-mobile-head-r1.json`, `-r2.json`, `P3F/lcp-mobile-base-r1.json`, `-r2.json`; `P3F/README.md` section 5).
- *Instant-jump scripted scroll* (0.8 viewport every 90 ms, not a human pace): 1440: 0 / 0.2363 / 0.2363. 1024x768: 0.10035 / 0.19813 / 0.19813. 1024x1366: 0 / 0 / 0.033. Phones 0 in this sweep.
  - *Stored evidence* (`P3F/widths-head.json`). At 1440 (runs 2 and 3) the node that moves is `div.stage-scrim` in `footer#credits`, going from 563 to 900 px tall, at scrollY 43,412 in run 2 and scrollY 0 in run 3. At 1024x768 the 0.19813 shift is `div.absolute.inset-0` in the act-card frame at scrollY 1,842, and its rect is identical before and after ([29, 0, 966, 249]). The 0.10035 run shows `section#act-2` changing height from 612 to 513 px at scrollY 7,982, with the Work background moving.
  - *Hypotheses, not measured.* The 1440 shift may come from the per-world type swap at the page end (`html[data-fonts]` going from `pirates` to `pirates rdr2 idiots`), when the reader jumps to the end before the warm-up finishes. The 1024x768 shifts may come from pin spacers being made while the page is jumped through. The `footdbg` output that was meant to show these causes is not on disk; only its script is (`P3F/METHODS.md`). The section deltas listed in `P3F/README.md` section 2 (+180, +97, +48, +54, -31) sum to +348, not the net +340 it quotes, so this report quotes no net figure.
  - The same 0.2363 appears on `e91fbd6` (2 of 3 runs), so it predates the final pass (`P3F/widths-e91fbd6-jump-cls.json`). The base is also non-zero in the same sweep (0.055 to 0.119, at load). This needs a non-human scroller. That the slow warm-up under software drawing makes it likelier is also a hypothesis.

### 5.6 No JavaScript

`javaScriptEnabled: false` at 1440, 1024 and 390 (`P3F/nojs-head.json`, `P3F/nojs-base.json`, `P3F/nojs-shots/`):

| Check | 1440 | 1024 | 390 |
|---|---|---|---|
| Sections with real height | 20 of 20 (min 900 px) | 20 of 20 (min 768) | 20 of 20 (min 721) |
| Streamed blocks shown | 19 of 19 | 19 of 19 | 19 of 19 |
| h1; overflow; console errors | 1; 0; 0 | 1; 0; 0 | 1; 0; 0 |
| Intro overlay visible | no | no | no |
| Act-card pin wrapper equals its stage (no travel) | 4 of 4 | 4 of 4 | 4 of 4 |
| Header fast-lane link | "Skip to the research" | same | "Work" (the phone label) |
| Page text / height | 23,973 chars / 40,552 px | 23,950 / 37,337 | 27,006 / 49,234 |

Pass on what was checked. The base page without JS is only the hero: 1 of 20 sections with height, 0 of 19 streamed blocks, 317 characters, no skip link. So the new page is much better than today's. Minor, app: the Egg hunt chip, the sound toggle and the Director's cut button show at desktop widths and do nothing without JS. A contrast sample flags 5 / 5 / 4 elements, all in Principles. The screenshots show them legible, so these are false positives of the colour check.

What was not checked. The plan asks for a no-JS page with no travel, no split layout and no tail (`docs/build/PHASE3-PLAN.md` section 12; `docs/build/PHASE3-SPEC.md` line 1407). The run above verifies only "no travel" (the pin wrapper equals its stage). The split layout and the post-credits tail were **not checked**: `P3F/nojs-head.json` records neither.

### 5.7 Bundle

First load of "/", gzip: JS 442,704 B (+3,612) and CSS 34,339 B (+4,906) against 439,092 B and 29,433 B. Both under the +6,144 B line. The bundle probe passes at 1440: no gsap, ScrollTrigger or lenis in the scripts the HTML references, or in anything a 390x844 phone fetches (23 responses). On desktop they arrive after `load` (50,143 B gz) (`P3F/probe-bundle-head-1440.json`). The HTML growth is outside this budget (see 5.5).

### 5.8 Cards probe re-check

Five runs each of the same probe on the new build and on `e91fbd6`, alternating: **3 of 5 pass on both**. The same two timing-sensitive sub-checks fail in both (scrub settle, damping early sample). Pins, stars, impacts, landAt, RM and phone passed in all 10 runs. The new build is not worse in this comparison, and no bisect was run. But the comparison has low power: with 5 runs per arm, 3 of 5 against 3 of 5 cannot rule out a regression. An earlier run, recorded only as a sentence in `P3F/README.md` section 7 (no raw output for it is stored in `P3F/cards/`), gave 4 of 5 on `e91fbd6` and **0 of 5 on `9c5f6fc`** (the first final-pass commit, not `ef0a549`). That result was not reproduced here. The probe is flaky under software drawing (`P3F/cards/cards-alternation.json`).

### 5.9 Red items

Rows 1 to 9 are the items found in the final QA run on `ef0a549`. Rows 10 to 14 are round-3 reds that the final QA did not re-run and that stay open. The full list of J8 misses is in `R3/verdicts/j8-smooth.md`: 22 of 31 target rows missed (row 15). The judges' misses (star per screen, keep scrolling, hooks, recognition, can't read, tempo) are in section 3.3.

| # | Item | Result | Cause | Note |
|---|---|---|---|---|
| 1 | Desktop LCP with the intro on | **Fail.** `qa.js`: 904 to 948 ms at 1440, 848 to 1,004 ms at 1024. The QA run's own loads: 440 / 956 / 1,024 ms at 1440 and 380 / 972 / 828 ms at 1024. Pooled: 440 to 1,024 ms and 380 to 1,004 ms, against at most 400. | App (the intro video becomes a larger LCP candidate: 4 of 6 own loads and 6 of 6 `qa.js` loads; intermittent in 2 of 6 own loads). Absolute time inflated by headless software decode. | `?skip=intro` passes (212 to 288 ms). Real-GPU value unknown. Higher than round 3 (`qa.js` 724 to 816 ms): the final pass or noise (section 5.5). |
| 2 | Mobile LCP | **Partial.** The absolute bar (at most 2.5 s) is met: median 1,636 ms, worst load 2,432 ms. The +/-5 % bar is missed: +8.1 %. | Untested hypothesis: payload growth (HTML +31,615 B gz, JS +3,612 B, CSS +4,906 B). The roughly 200 ms estimate is an upper bound; the measured median gap is 122 ms. | A lab number. The P3-0 baseline file has no LCP, so the A/B against the base build is the comparison. |
| 3 | CLS not strictly 0 | **Partial.** Wheel-paced, RM and Pause: 0. Load with intro: 0.00077 / 0.00117 on desktop and 0.0142 on phones (0.0142 on the base too). Instant-jump: up to 0.2363. | Hypotheses (section 5.5): type swap at page end, pin creation. Tiny load shift from the intro button. | Needs non-human scrolling. Predates the final pass. Base is non-zero too. |
| 4 | Phones, tablet and landscape not strictly unchanged | **Differs** (5.2). The tablet differs most: 1,281 to 1,618 px shorter, about 3,300 characters in closed boxes. | App. Intended copy and fold work, not all of it on the spec's section 13 list. | Needs your read on the unsigned strings, and your call on the folds (6C). |
| 5 | Phone deep links | 2 of 8 land, same as the base | Old app behaviour | Phase 4. |
| 6 | Cards probe | 3 of 5 on both builds | Test limit: probe timing under software drawing | Not shown to be a regression; low power, and an earlier 0 of 5 on `9c5f6fc` (5.8). |
| 7 | `RELEASE=1 npm run check` | **Fail**, 47 errors | 46 are Owner (you) sign-offs under DP-9. The 47th, the community-quote gate, is outside DP-9 and means verify or remove. | Section 6A. |
| 8 | No-JS desktop controls inert | Minor | App (controls gated only by a media query) | |
| 9 | Not re-measured in this run | Gap | Out of the QA brief | Speed tool, idle-task figure (R03), blind judges. Last numbers are round 3 and are headless. |
| 10 | INP (game input, egg triggers, the cut) | **Fail at 1440:** 544 ms keydown, input delay 0, against at most 200 ms. At 1024: 192 ms, pass. | Likely environment (presentation delay under software drawing). Not settled without a real GPU. | Round 3, `R3/verdicts/j8-smooth.md` T19. The same class of failure in all three rounds at 1440. |
| 11 | Long frames after the titles and in the warm-up probe | **Fail by duration.** 1440: 33 long animation frames over 50 ms in the 3 s after the titles (max 152 ms, each with at most 1 ms of work), and a 431 ms frame with 400 ms of script at 0.09 s in the wheel run. The warm-up probe has 18 (worst 600 ms) at 1440 and 17 (worst 269 ms) at 1024. | Mostly environment (raster waits with almost no work). The 400 ms script is the idle-time task, an app problem (J8 F2). | Round 3, `R3/verdicts/j8-smooth.md` T20, T21. |
| 12 | Raster diet | **Not met.** Principles has 12 / 11 will-change layers against at most 8. Work still shows 4 filters, 1 blend and 1 mask on screen. The voices `campSticky` is still the top repainting node in act-4. The sticky column and the act-card stage are still repainted. | App | Round 3, `R3/verdicts/j8-smooth.md` T13 to T17. The writing filters were baked (T15 met). |
| 13 | Intro: name timing and hand-off script | **Fail / not measured.** The name appears 1.2 to 2.2 s after the reveal (8.04 s at 1440, 7.33 s at 1024), against the 2nd reveal frame. The hand-off script was not measured; the nearest evidence is a 76 ms (1440) and a 112 ms (1024) script task at the intro hold. | App (likely) | Round 3, `R3/verdicts/j8-smooth.md` T27, T28. If the titles deliberately sequence caption then name, spec 4.4's wording and the design disagree (section 6C). |
| 14 | Reduced-motion layout shift | **Fail in round 3:** CLS 0.025 at 1440 (a `#films` shift; 0 at 1024). The final QA's wheel-paced RM runs gave 0 (section 5.3), a different test, so they do not settle it. | App | Round 3, `R3/verdicts/j8-smooth.md` T23. |
| 15 | Everything else J8 missed | 22 of 31 target rows missed, 5 met, 4 not measurable | Mixed | `R3/verdicts/j8-smooth.md` T01 to T31. |

### 5.10 Plan checklist at `ef0a549`

`CONTINUE.md` ticks P3-4 to P3-10. **P3-2 and P3-3 are not ticked.** P3-2 #7 (headless speed targets, and the type-swap shift) and P3-3 #1 (the intro rows of spec 4.4) are still open. Round 3 numbers still miss them (`REP/W3.md`; `R3/MANIFEST.md`). At `ef0a549`, P3-11 and P3-12 were not ticked and the banner at the top of `CONTINUE.md` was stale: it said P3-11 was next and the balance was 184.88. The commit that adds this report ticks P3-11 and P3-12 and refreshes the banner (333.62 spent, balance 172.88). P3-2 and P3-3 stay open.

Still open from earlier gates:
- The type-swap shift (world-font swap CLS). It is open. No commit message claims it fixed: `9c5f6fc` claims the two-line film bill and the near-zero opacity poses (R02), and `ef0a549` mentions the world-font swap only in the deep-link hold. Section 5.5 still sees a shift at 1440 (0.2363 in 2 of 3 instant-jump runs), although its cause there is a hypothesis. Recorded in `docs/build/p3-handoff/deferred-handoffs.md` #31 and `docs/build/p3-handoff/deferred-w3.md` #31 (line 56).
- GL-tier DOM overlays sit under the GL host (`docs/build/p3-handoff/deferred-w3.md` line 78).
- MATCH_ROW is frame-relative (`docs/build/p3-handoff/deferred-w3.md` line 79).
- `iconic-corridor-alt` has no measured line mark (`docs/build/p3-handoff/deferred-w3.md` line 43).
- rd-fire has no trigger under the `voices.fire` ALT (`REP/W3.md` lines 130 and 262).

---

## 6. What Aryan should review

Each line: the item, then where to find it. Group A blocks `RELEASE`. The rest do not.

### A. What blocks RELEASE (47 errors: 46 sign-offs under DP-9, plus the quote gate)

- [ ] **107 unsigned copy strings.** Sign each by removing `unsigned` in `lib/film.ts`. The printed list is in `P3F/release.txt` (line "[P3 #10]") and `REP/P3-11-polish-release.txt`. Biggest families: egg.hunt 47, toy.drone 8, director's cut 7, toy.deadeye 6, systems 5, sound 4, act loglines 4, titles 3, toy.candles 3. Count history: 96, 100, 102, 104, 107.
  - The four loglines are Claude's drafts, not yours, and they are on screen now as subtitles. The code marks them `[DRAFT by Claude ...]` and calls them "a new rendering of Claude's drafts" (`lib/film.ts` lines 679-683); the spec says "Claude drafts" (`docs/build/PHASE3-SPEC.md` D3-7 and Appendix B #6). You signed them as-is on 2026-09-29 (`lib/film.ts`, the `aryanDraft` helper). They are unsigned again because they now render as subtitles for the first time. Sign them, rewrite them, or take the alternate (no logline line). act-1: "Where I started, and the course I've been correcting ever since." act-2: "What I build, how I try to break it, and what didn't survive." act-3: "Life beyond the screen: the miles, the mat, the camera, and the people who have watched me work." act-4: "What I believe about doing this work honestly, and where to find me." (`REP/W2.md` section 6; also `CONTINUE.md` Phase 2 item 2.)
  - The judge said some visible strings might be missing from the unsigned list (`R3/verdicts/j9-honest.md` F11; `R3/TRIAGE.md` R24). The repo answers it. The 107 is only the copy registry's unsigned set, so it is not a count of everything you have not seen:
    - "Skip intro" (`intro.skip`, `lib/film.ts` line 442), "Play" (`intro.play`, line 441) and "Loading the flight…" (`intro.loading`, line 447) have status `proposed`. Your 2026-09-29 as-is sign-off covers them (`film.copySignedOff: true`, `lib/film.ts` line 835). That is why the check reports "0 proposed" (`P3F/logs/check.txt` line 11). They are not in the 107.
    - "THE RECKONING · 3 SURVIVED THE FULL PROCESS" is a template string at `components/sections/ledger/ledger-section.tsx` line 117, outside the copy registry. No sign-off flag covers it and it is not in the 107: it is unsigned and uncounted. It is also the kill-list kicker in 6B.
    - The two act-card taglines, "Treat every backtest as guilty until proven innocent." and "The result stands; no re-optimization after the fact.", are `confirmed` (`lib/film.ts` lines 419-420). They are not in the 107.
- [ ] **40 Check L2 countersignatures.** 19 loops, their 19 posters, SEQ-HALL and SEQ-HALL-end. Claude passed them on 2026-10-01; yours is pending. See `MEDIA/LEDGER-p3loops.md`. Look closely at: L12 (the storm wave and spray), L02 (hall), L11 (near-still), SEQ-HALL (3.66 MB; a 36-frame option of about 1.8 MB is described in `docs/build/media-staged/p3/accepted/seq-hall.json`), L22 (join and shore lap).
- [ ] **5 spoken lines** (voice "Nora", Higgsfield `qwen_audio_tts`, 0.12 credits in all). Listen first. Nobody has (`docs/build/SOUNDS.md` section 2). Test bench: `/lab/p3/sound`. "Lumos", "Nox" and "Parley" need you to confirm Higgsfield's terms. "Parley" was transcribed as "Harley" by an automatic check. "I solemnly swear that I am up to no good" (a quotation) and "Mischief managed" need you to approve and confirm. To drop a line, delete its two files and its rows. Also the manual listen (P3-9 #5): nothing should sound like a film score, an actor, a gunshot or the "Aal izz well" tune (`REP/W2.md` section 6 #3). Two files are over the 10 KB cap per TTS line (spec 10.4): `tts-solemn.webm` is 21,494 B and `tts-mischief.webm` is 10,741 B (2 of the 67 `npm run check` warnings, `P3F/logs/check.txt` lines 76-77). `docs/build/SOUNDS.md` section 2 flag 5 (line 42) says re-encoding those two at 24 to 40 kbps Opus would fit, at 0 credits. The voice is not a true whisper (flag 3, line 40). A 0-credit resynthesis could make it one, but it changes the voice, so it was not done.
- [ ] **5 community-sourced quotes** (`lib/quotes.ts`). This is the 47th error and it is outside DP-9. It is verify or remove, not sign. Verify each against the work (set `verified: "VERIFIED"`) or stop showing it. Until then they render on the branch against "no unverifiable claims" (`docs/build/CONTENT-RULES.md` line 12). J9 saw Q-3I-3 and Q-RD-1 on the page for everyone and listed the other three as egg-only; by the code Q-PC-1 is also a journey caption (`lib/quotes.ts`, host `journey`). Q-PC-1 "Now... bring me that horizon." (`lib/film.ts:237`, `:754`; shown to everyone). Q-PC-3 Barbossa's "guidelines" line (`components/eggs/egg-host.tsx:154`; egg only). Q-3I-3 "A machine is anything that reduces human effort." (`components/worlds/idiots/machine-board.tsx:337`; shown to everyone). Q-RD-1 "Be loyal to what matters." (`lib/film.ts:249`, `:389`; shown to everyone). Q-RD-2 "We can't change what's done, we can only move on." (`components/eggs/egg-runtime.tsx:236`; egg only). The judge could not vouch for Q-RD-1 and Q-RD-2 from memory. Also `CONTINUE.md` Phase 2 item 5.
- [ ] **Confirm DP-9 covers (a) the five TTS approvals and (b) the five-quote gate.** (a) `PHASE3-PLAN.md` DP-9 was amended on 2026-10-02 so that the five TTS approvals count as the same kind of expected failure as the Check L2 countersignatures, and it asks you to confirm that reading (`REP/W2.md` section 6 #2). (b) The five-quote gate is outside DP-9. Do you also accept it as a RELEASE failure until you verify or remove the quotes? That question has not been asked before.

### B. Your words and facts

- [ ] **Kill-list kicker** "THE RECKONING . 3 SURVIVED THE FULL PROCESS" contradicts the Volatility Breakout row tagged EXCEPTION. The judge offers "3 SURVIVED THE BLIND TEST, 1 AS AN EXCEPTION". The wording is yours (`R3/TRIAGE.md` "For Aryan" #3; `R3/verdicts/j9-honest.md` F2). It is live on the branch now and is not in the 107 (see 6A).
- [ ] **Three proposed labels to sign or reject** (`R2/TRIAGE.md` "For Aryan" #10). All three are inside the 107 count. `cap.writing` is the Writing caption `A JOURNAL LIKE ARTHUR MORGAN'S` (`lib/film.ts` line 785), so that "Arthur Morgan's Journal" no longer reads as the author. `toy.candles.lumos.hint` is the Lumos hint "relights the hall's candles" (line 654). `opening.play` is the game invitation on the Act I contents page (line 460).
- [ ] **"Killed and never retuned"** reads as a typo for "returned" to strangers. Keep it, write "re-tuned", or rephrase (`R2/TRIAGE.md` lines 360-385; `CONTINUE.md` Phase 2 item 4).
- [ ] **`Trading_Algos-`** repo label ends in a hyphen and looks cut off. Rename the repo or approve a display label. The nav label is 13 characters (limit 12) (`R3/TRIAGE.md` #5; `CONTINUE.md` Phase 2 item 8).
- [ ] **Survivor rows** VIX-Backwardation and Regime-Gated: each shows strong-looking results with only the CANDIDATE chip as a caveat. Add one true limitation line to each (`R3/verdicts/j9-honest.md` F9; `docs/build/CONTENT-RULES.md` "Limitations sit next to their claims").
- [ ] **WANTED poster.** The portrait on it, the weight-class line on the handbill (flagged "when in doubt, leave it out", J9 F10), and the reward line (`R3/TRIAGE.md` #8; `CONTINUE.md` Phase 2 item 3).
- [ ] **Writing stubs and "Résumé · coming soon".** Show or hide until real. The Writing section is all drafts ("Thinking in public, soon."), and the contact screen shows the résumé line under the email button (`R3/TRIAGE.md` #6 and R11; `CONTINUE.md` Phase 2 items 7 and 11).
- [ ] **Sound copy under your device's reduce-motion setting:** "Sound follows motion: resume motion to hear it" cannot be followed there. Two strings (`R3/verdicts/j9-honest.md` F5).
- [ ] **Drone image** on "What I can actually do" reads as a generic picture (0.15 confidence). Move it or label it an illustration. The `films.play` line "the homemade drone flies in Systems" can read as your own drone, but it is the 3 Idiots drone (`R3/TRIAGE.md` #10).
- [ ] **Systems meta line** "WEBGL, WHERE SUPPORTED, ONLY FOR SCENE CHANGES" also shows on phones, which never get WebGL. Suggested: "ON DESKTOP, WHERE SUPPORTED" (`REP/W2.md` section 6 #7). The QA text diff in 5.2 shows the new strip text on phones.
- [ ] **What goes public:** the credits line now names `minimax_h3` on every device. `credits.libraries` ("On desktop: GSAP (standard no-charge licence) - Lenis (MIT)") is unsigned (`REP/W1.md` section 7). Scroll-depth analytics is built as a no-op and sends nothing. On Vercel it needs your consent at hosting (`docs/build/PHASE3-SPEC.md` Appendix B #8).
- [ ] **The four "why this film matters to me" lines** are still drafts (Phase 2 item 1; `docs/build/CONTENT-RULES.md` "Film/game layer"). Not a Phase 3 blocker.

### C. Taste calls (defaults are built; each is yours)

- [ ] **How much the page may move at the dwell stops.** The lent loops are ambient. Making each stop perform means bigger movers: the pen, the compass invite, the hero sea, the Map (`R3/TRIAGE.md` #12; R04, R07).
- [ ] **Layout calls:** put your name first; cut cards 2 to 4 to about 2 seconds; move or cut the Films interlude. The busy-recruiter judge wants all three again; the other two judges call the opening and the cards the best of the page (`R3/TRIAGE.md` #11; `CONTINUE.md` Phase 2 item 11).
- [ ] **The first 20 seconds (R07).** J3 found that "Play" stays on screen while the flight runs, that your name appears at about 0:09 and About at about 0:34 (the other width, 0:30), and that the hero is static for 6 to 10 s (J1, J2, J3 and J4 all see it). The identity line "Self-taught high-school quant…" is tiny. The sea loop plays, but at that amplitude it reads as still. Putting your name first is already your layout call above (`R3/TRIAGE.md` R07 and "For Aryan" #11).
- [ ] **Dead stretches (R05, second stretch).** From Principles through Contact to Credits runs 13 to 16 s (1440 clips #228-240 and #246-254; 1024 #227-242) with nothing visibly performing, and the Map's footprints and ink are too faint. The 25 to 30 s stretch from Optuna to the kill-list is in section 3.3. The layout belongs with your Phase 2 info pass (`R3/TRIAGE.md` R05).
- [ ] **About is a wall of small serif (R08).** J2 and J4 gave it 0 % "yes", and all three judges read About as slow against the spec's medium. The words are yours (`R3/TRIAGE.md` R08 and line 111).
- [ ] **Two stars at once by eye in three clips (R17).** The journal's running horse B45 with the entry sketch B44-page4 / page3 (1440 #201, 1024 #189), and the ember B35 with the light band B36 (1024 #154). The suggested fix is to sequence the horse after the sketch draw ends (`R3/TRIAGE.md` R17).
- [ ] **The finale star is a faint comet (R18).** It needs about 3 times the brightness (J1 #255-257; 1024 #243-244). B58's breath (y 44,057 / 41,482) lies beyond the maximum scroll (43,312 / 40,857), so the last 3 to 4 clips count as star-less outside a breath. The breath is a counting rule in `tools/capture/clips.mjs` (`R3/TRIAGE.md` R18).
- [ ] **Accessibility evidence gaps (R25; J9 F6, F7, F8).** The intro play-screen loop has no Pause control, and Skip intro is the only stop (WCAG 2.2.2, arguable). The disabled sound icon under reduced motion is 2.9:1 (exempt), and its reason is only in the accessible description. No probe asserts that Sharpe, PSR and PF are never animated, which is a `docs/build/CONTENT-RULES.md` guardrail (line 18); J9 checked it by eye on six screencast frames. There is no focus-ring capture, the RM idle state is untraced and `--rm` ran at 1440 only (`R3/verdicts/j9-honest.md` F6 to F8; `R3/TRIAGE.md` R25).
- [ ] **Films tempo.** Judges read the four film plates as brisk and gave them 80 to 100 % "yes". Amend the spec's "slow" or keep it (`R3/TRIAGE.md` #11, R12).
- [ ] **Broom rear-up** (carried from earlier rounds; `R3/TRIAGE.md` #13).
- [ ] **Hero compass.** The medallion and teal bracket invite a click and explain nothing (`R3/TRIAGE.md` #13).
- [ ] **Brighter kill-list rows.** The dim rows measure 4.81 to 4.92:1, which already passes AA. One judge calls the list "a mono spreadsheet" (`R3/TRIAGE.md` #13).
- [ ] **Self-flipping demo (B25)** (`R3/TRIAGE.md` #13).
- [ ] **Chalked "AAL IZZ WELL".** It is the strongest 3 Idiots cue in the blind test (0.90 to 0.95) (`R3/TRIAGE.md` #13).
- [ ] **Candle count 29 against the spec's 39** (24 at 64 to 80rem). Amend the spec or add candles (`REP/W3.md` section 6).
- [ ] **Loops 19 against 20.** Add the free L04r living still, or lower the bar (section 4.2).
- [ ] **Compass keyboard focus.** The spin ignores the pillar focused by keyboard (spec 9.2 #1, low) (`REP/W3.md` section 6).
- [ ] **iPad portrait (1024x1366 touch): the world type and the folds.** It gets the world type and the wide layout's folds. Its page is 1,281 to 1,618 px shorter than the base, and about 3,300 characters sit in closed `<details>` boxes and the Systems fold (section 5.2). `REP/W1.md` section 7 said the iPad would be about 900 px taller; the folds made it shorter. The plan asked for this size to stay unchanged except the intended changes. Keep the world type and the folds, or limit them to mouse and trackpad devices (`REP/W1.md` section 7; `P3F/README.md` section 2).
- [ ] **Smaller calls:** MATCH_ROW, frame-relative recommended (`REP/W2.md` section 6); `landAt` .47 or the spec's .45 (`REP/W2.md` section 6); the rd-bone egg note is set in Newsreader, not the hand face (5 words against a cap of 4) and rd-fire has no trigger under the `voices.fire` ALT until MV-11 gets a measured fire mark (`REP/W3.md` section 6 #4 and #8); intro name timing, which is the page or spec 4.4's wording (`R3/TRIAGE.md` #15); shorten or vary the Map's principle cards and enlarge the credits fine print (`R3/TRIAGE.md` #14); the game invitations are 7 to 9 px (R15); lazy chunks over their soft size lines (GL about 12.8 KB against 8, plates about 11.0 against 8, audio about 10.5 against 10) (`REP/W2.md` section 6).
- [ ] **Spec Appendix B, all 16 flags** (defaults are built): `docs/build/PHASE3-SPEC.md` lines 1550-1566. Includes the roughly 56 MB of dead legacy media to prune in Phase 2 (#9). The ones that need your answer, each with the built default and the alternate:
  - **#1 Card travel.** Default: the pinned scenes at about 400vh against 116vh today. The measured page growth is larger than the spec's net (section 1). Appendix B names no alternate; the fast lane mitigates.
  - **#2 Hero name timing.** Default: the name is fully revealed about 0.7 to 1.0 s later than today (hold, then reveal). Alternate: the optional flight-to-loop re-blend, which removes the still. See also the name-timing rows in 5.9 #13.
  - **#3 Title card 2 and the reduced-motion credit line.** Default: card 2 reads "AFTER {WORKS}" (`lib/film.ts` line 547). The "directed by" alternate was deleted because `credits.ai` cannot be shortened (spec line 1599). Open: whether reduced-motion visitors get the static credit line (Appendix B calls it H-1). The spec gives them no intro and no titles (line 605).
  - **#11 `iconic-corridor` is now used** (L10, the Trading Algos window). That answers Phase 2 item 8, which offered to use it or delete its entries and files.
  - **#12 No toy in Act III's own screens.** Default: Dead Eye, the Red Dead toy, is hosted on the kill-list in Act II. Alternate: a "DEAD EYE ↑" pill in Act III (the Beyond Meta row) that jumps to the kill-list and starts the game.
  - **#13 Four of the 12 eggs were not in the triaged list:** `pc-parley`, `3i-pen`, `rd-eagle` and `rd-bone`. Default: built as spec 9.1. Alternate: you name a replacement, and the hunt stays at 3 per world. `CONTINUE.md` P3-0 (c) records that you like the eggs as triaged, so you may want to replace them.
  - **#14 The drone's photographed lift** is dropped, so the chalk sprite is the only drone. Alternate: budget the lift (an `iconic-drone-empty` inpaint and a cut-out sprite) from the reserve after a `get_cost` preflight.

### D. Media ideas (unverified, not confirmed by Aryan)

The lane is closed: 16.38 credits remain under a 350 cap, and the rules allow no further job. Any new picture needs you to approve more credits (`MEDIA/p3/B9.md` line 11). **These three items are unverified: they came from the build brief for this report, which is not Aryan speaking, and you have not confirmed them.** No repo file records them (checked by search of `docs/`, `CONTINUE.md` and `.claude/`). They are listed only because related evidence exists, so confirm or drop each. The evidence below comes from the judges, not from you.

- [ ] **Unverified idea: a 3 Idiots plate for the Work head.** Related evidence: the Work head is L18 `iconic-pen-alt`, a near-still. Blind recognition of 3 Idiots is 4/9 at both widths, and the Work frames read at 0.30 to 0.55 (`R3/TRIAGE.md` lines 121-123).
- [ ] **Unverified idea: Black Pearl sails for the storm step.** Related evidence: the Kraken's Storm interlude is near-black for about 2 seconds (`R3/TRIAGE.md` R10, "accept or fill"). The Pearl's sails already read well on the opening card (0.6 to 0.85).
- [ ] **Unverified idea: more Red Dead town detail.** Related evidence: the voices frame and the wanted board read at about 0.50 (`R3/TRIAGE.md` line 123).

### E. Real-laptop recording (optional, settles the speed questions)

Why: every speed number in this report comes from software drawing. A real recording is the only thing that settles the raster-bound misses. J8 puts the smoothness score at about 2 to 3.5 depending on it (`R3/TRIAGE.md` R26 and "For Aryan" #16; `R3/verdicts/j8-smooth.md`).

Steps:
1. In Chrome on your laptop, run the production build: `npm run build`, then `npm start`. Open `http://localhost:3000`. Use a normal window with extensions off, sized 1440x900 if you can. Repeat at 1024x768 if you can.
2. Open DevTools (F12, or Cmd+Option+I). Open the **Performance** panel. Also open the **Media** panel (three-dot menu, More tools, Media) so you can see whether loops use the hardware decoder.
3. For each moment below: reload, wait 5 seconds, press Record, do the moment, press Stop, save the profile (the down-arrow icon). Scroll like a reader, about 250 px per second.
   1. The first scroll through Act I, from the hero into About.
   2. The Journey seam push (B12).
   3. Principles (Act IV).
   4. The kill-list.
   5. The intro reveal: record from before you press Play until your name has appeared (about 10 seconds).
   6. A fast fling: from the top, flick the trackpad hard down the page for about 10 seconds.
4. While a loop is playing, note in the Media panel which decoder it uses. A screenshot is enough.
5. Tell Claude where you saved the files.

What it would settle (spec 12.1 real-GPU row: p95 at most 20 ms, at most 2 % of frames over 33 ms, no frame over 50 ms in card transitions): P3-2 #7, P3-3 #1, the 544 ms INP reading (software drawing), the GL-context long frame, whether the lent loops (R04), the hero sea (R07) and the faint title fades read at full size, the world-type swap for a fast scroller (R20), and LCP on a real network (R22).

---

## 7. How to see it and how to merge

**Branch:** `design/three-films`. Tip of the evidence when this was written: `ef69db5` (31 commits ahead of `main`). The commit that adds this report and the `CONTINUE.md` ticks sits on top of it.

**Run it on your computer.** Next 16.2.9 needs Node 20.9 or newer (`node_modules/next/package.json`). This machine runs Node 22.22.2 (`node --version`).

```
git fetch origin
git checkout design/three-films
npm install
npm run build
npm start        # then open http://localhost:3000
```

Everything in this report was measured on the production build (`npm run build`, then `npm start`). `npm run dev` is slower and was not measured. Two useful switches: `/?skip=intro` skips the play screen, and `?skip=smooth` uses the browser's own scroll. Test pages live under `/lab/p3/` (cards, cinema, games, gl, plates, sound, words).

**PR state** (read from the GitHub API on 2026-10-13, before the commit that adds this report was pushed). PR #11 "Design/three films" is **open**, not draft, head `ef69db5` (the branch tip then), base `main` at `33c9684`. It shows 31 commits, 1,778 changed files, +483,224 and -3,499 lines, no comments, no review comments, and no commit statuses. GitHub now reports its mergeable flag as `false` (merge state `dirty`, i.e. conflicts). An earlier read gave `unknown`. Two other PRs are also open: #10 "Wip/p3 w3 integrate 1" (head `wip/p3-w3-integrate-1`, base `main` at `33c9684`, 2 commits, 112 files; it follows the wave-3 snapshot PR #9 that causes the 63 conflicts below) and #1 "Wip/m1 snapshot" (head `wip/m1-snapshot`, 3 commits, 343 files). Both also read `mergeable: false`. PRs #2, #3, #4, #6, #7 and #8 from this same branch name show as merged: #8 on 2026-10-01 at head `42c17f9`, which is Wave 1 measured. I read these facts only. I did not open, edit or merge anything.

**A merge will conflict.** `main` is at `33c9684`, which holds PR #9 `wip/p3-w3-snapshot-1`: a commit named "WIP snapshot: wave 3 builders in progress" (`3a8c83f`, 96 files). The branch has the finished form of that wave. `main` has 15 commits the branch does not have (mostly merge commits for earlier PRs, two WIP snapshots and two early commits). I ran a read-only dry run (`git merge-tree --write-tree`, no refs or files changed): **63 files conflict, 41 in content and 22 add/add.** I did not compare the two sides line by line. When you ask for the merge, the first step would be to merge `origin/main` into `design/three-films`, resolve the 63 files, re-run the gates and push the branch. Only then can PR #11 merge cleanly. None of that has been done.

**Rules for the merge** (`CONTINUE.md`; your project instructions):
- Merge to `main` only when you ask.
- Only after all three pass: `RELEASE=1 npm run check`, `npx eslint .` and `npm run build`.
- Never force-push. No merge has been done.

**State of the gates today:** `npx eslint .` passes. `npm run build` passes. `npm run check` passes. `RELEASE=1 npm run check` fails with 47 errors: 46 DP-9 sign-offs and the community-quote gate, which is verify or remove (section 6A). So the merge waits on your sign-offs and your quote decisions in section 6A.

**Housekeeping, done in the commit that adds this report:** P3-11 and P3-12 are ticked in `CONTINUE.md` and its stale banner is refreshed (333.62 credits spent, balance 172.88). P3-2 and P3-3 stay open unless you accept them or the laptop recording settles them. After that comes Phase 2 (the info pass), then Phase 4 (phones), in that order (`.claude/CLAUDE.md`).
