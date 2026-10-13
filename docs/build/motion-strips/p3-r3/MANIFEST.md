# P3-11 round 3 · capture manifest (judge inputs)

2026-10-13 · branch `design/three-films` · app build of HEAD `ece90dc` (the round-3 fixes `d7a6543` + their review
fixes) served by `next start -p 3161` · tools as of the same HEAD (`tools/capture/`, `scripts/checks/`; what changed
since round 2 is in §4). Every path below is relative to the repo root. `R` = `docs/build/motion-strips/p3-r3`,
`R2` = `docs/build/motion-strips/p3-r2` (round 2, for comparison).

**Machine.** The same kind as rounds 1 and 2: 4 CPUs, no GPU, Chromium 141.0.7390.37 rasterising in software
(SwiftShader). Absolute frame times are pessimistic against a real laptop; read them as relative, and compare a
round-3 number with the round-2 number beside it. The screencasts ran **headed Chrome under `xvfb-run`**
(`meta.browserMode` in every `screencast.json`); motion.js, scenes.js, the probes and qa.js ran headless, as before.
Nothing else ran while a screencast recorded: the five recordings ran back to back (22:12–22:32 UTC on 2026-10-12)
and the clips were cut afterwards.

**Same input as round 2.** Reader: 250 px/s as 50 px wheel notches, a 2 s stop at each h2 and act-card settle, the
intro played. Skimmer: the same seeded flings (seed 20261003, commanded peaks 2,278–2,745 px/s as in rounds 1 and 2;
50 flings at 1440 and 40 at 1024, round 2 had 47 and 39: the page is a little longer, so the sequence runs one fling
further). Director's cut: the hero's button, recorded until the cut ends. Page height changed with the round-3 fixes:
44,212 px at 1440 (round 2 44,617), 41,625 at 1024 (round 2 41,570), so a clip number or a y position does not name the
same moment as in round 2: compare by section and beat.
**New stranger seeds**: every stranger set was reshuffled, and **no id names the same frame as in round 2 or round 1**
(0 of 39 + 37 blind, 17 + 17 read, 8 + 8 hooks ids repeat a round-2 or a round-1 pairing, checked key against key;
the sets hold the same frames as round 2, from the round-3 captures). The seed values were not logged by the
interrupted run; `R/keys/*.json` is the authority.

**Not committed (local only, regenerable).** `R/raw/`: the screencast videos (`raw/screencast/*/video.mp4`) and frames,
the per-clip strips (`raw/screencast/*/clips/clip-NNNN.jpg`), the scenes.js PNGs, the motion.js frame dumps and
full-size strips, the drift / hooks PNGs, the hook mixes behind the stranger hook sets, qa.js shots. Probe PNGs are
ignored by `.gitignore` (`p3-r*/**/*.png`). Committed: 337 JPG (all ≤ 1600 px), JSON, Markdown and logs, about 34 MB.

**What changed in the counting (read this before comparing J1 numbers).**
(a) The counting rules of round 2 stand (a scroll star counts only while the page moves ≥ 12 px inside its window,
unless the log says `how: "live"`; a declared breath is the viewport after each weight-3 star; a dead-screen row that
begins inside a breath is a rest). Round 2's numbers below are **as published in `R2/MANIFEST.md`**. Round 2's
recordings re-counted with today's `clips.mjs` reproduce them, with two star-less-outside-a-breath counts one higher
(skimmer 1024 7 → 8, director 49 → 50; most likely the new rule that an item not streamed yet places nothing; not
checked): `R/r2-recount.json` (scratch; written from `R2/raw`, round 2's folder untouched).
(b) **New: the self-motion count** (`clips.mjs`, `totals.seen`, per clip `motion` / `moving`). The log-based "exactly
one star" counts a star the spotlight granted; J1 counts what the eye sees move. The self-motion count compares a
clip's four frames after lining them up by their scroll shift (rigid scroll and sticky layers cancel, the header is
masked) and calls a clip "moving" above 0.3 % changed pixels. It was calibrated on round 2's J1 eye counts (the
tool's own comment: reader one-star share 47.1 / 46.7 % against the eye's 48.8 / 45.8 %; skimmers read 7.5 / 13.9
points high). **The sheet labels now carry it**: `(static)` = a star in the log while nothing in the clip moves,
`(moves)` = motion with no star in the log. Round 2's sheets did not have these two words; a J1 judge who must stay
blind to the machine's reading would need the sheets re-cut with `clips.mjs --no-motion` (needs the local raw frames).

---

## 1. Automated numbers

### J1 (one star per screen): the spotlight log, per 1 s clip

Source: `?debug=spotlight` (`window.__spotlight.log`) recorded in each screencast; `tools/capture/clips.mjs` turns it
into stars per clip. `2+ at once` counts a clip where two stars are active at the same instant (`overlapMs` = how
long). The intro clips (play screen → titles → quiet window: 12 per reader run, as in round 2) are outside the page
rules and are not counted. "With declared" adds the declared scroll stars that never registered with the spotlight in
the run while their box crosses the middle 60 %: **none in any run this round** (round 2: B21 in the skimmer 1440 run),
so it equals the plain column.

Each cell: **r3** · r2 as published.

| run | clips (intro) | exactly one star | 2+ at once (clips, ≥ 100 ms) | star-less outside a breath | star-less in a breath | with declared: one / 2+ / star-less outside |
|---|---|---|---|---|---|---|
| reader 1440 | **257 (12)** · 252 (12) | **180/245 = 73.5 %** · 153/240 = 63.8 % | **1 (1)** · 0 (0) | **55 (22.4 %)** · 72 (30.0 %) | **9** · 15 | **73.5 % / 1 / 55** · 63.8 % / 0 / 72 |
| reader 1024 | **244 (12)** · 239 (12) | **167/232 = 72.0 %** · 147/227 = 64.8 % | **1 (1)** · 2 (2) | **53 (22.8 %)** · 65 (28.6 %) | **11** · 13 | **72.0 % / 1 / 53** · 64.8 % / 2 / 65 |
| skimmer 1440 | **117 (0)** · 106 (0) | **96/117 = 82.1 %** · 84/106 = 79.2 % | **4 (0)** · 6 (4) | **11 (9.4 %)** · 12 (11.3 %) | **6** · 4 | **82.1 % / 4 / 11** · 78.3 % / 7 / 12 |
| skimmer 1024 | **87 (0)** · 79 (0) | **81/87 = 93.1 %** · 65/79 = 82.3 % | **0 (0)** · 3 (3) | **3 (3.4 %)** · 7 (8.9 %) | **3** · 4 | **93.1 % / 0 / 3** · 82.3 % / 3 / 7 |
| **reader, both widths** | 477 page clips · 467 | **347 = 72.7 %** · 300 = 64.2 % (bar ≥ 90 %) | **2** · 2 (bar 0) | **108 (22.6 %)** · 137 (29.3 %) (bar: none outside a breath) | **20** · 28 | **72.7 % / 2 / 108** · 64.2 % / 2 / 137 |
| director's cut 1440 (2 s clips) | 199 · 200 | 144 = 72.4 % · 137 = 68.5 % | 0 · 0 | 48 · 49 | 7 · 14 | 72.4 % / 0 / 48 · 68.5 % / 0 / 49 |

The 2+ clips (spotlight log): reader 1440 #57 `B11` + `B12-push` + `B12` (131 ms); reader 1024 #54 the same three
(150 ms) (round 2's reader 1024 pair was `B12-push` + `B12`, 295 / 911 ms); skimmer 1440 #26 `B11` + `B12` (8 ms), #37
`B19` + `B18` (21 ms), #73 `B35` + `B34-finale` (20 ms), #101 `B54` + `B53` (63 ms); skimmer 1024 none. Spotlight skips
in the reader runs: 1440 `B08-compass` (maxWait 1,500 ms), `B44-page3`, `B44-page5` (maxWait 700 ms); 1024 `B44-page2`,
`B44-page5` (maxWait 700 ms) (round 2: 1440 `B12` host left the viewport, `B44-page3`, `B44-page5`; 1024 `B44-page2`,
`B44-page5`). Distinct stars seen: 74 / 74 (reader 1440 / 1024; round 2 65 / 66). Star-less clips outside a breath, by
section (reader 1440): optuna-screener 8, systems 7, about 6, films 6, beyond 5, trading-algos 4, experiment 4,
writing 4, credits 4, then one each in top, journey, act-2, work, kill-list, act-4, contact (`totals.noneOutsideBreathBySection`
in each `clips.json`; round 2: films 8, optuna-screener 7, systems 7, credits 6, experiment 5, beyond 5, …).

Declared breaths on the reader 1440 geometry: after B04, B14, B30, B38, B50, B58 (`totals.breaths`; the same six as
round 2); the beat-map rows that begin inside one: B06, B07, B16.

**The self-motion count** (new; `totals.seen` in each `clips.json`; each cell **r3** · r2 re-counted with today's tool,
`R/r2-recount.json`; exactly one = moving with ≤ 1 star in the log; performing one = moving with exactly one):

| run | exactly one (moving, ≤ 1 star) | performing one | star-less (no motion) outside a breath | star in the log, nothing moves | motion, no star in the log |
|---|---|---|---|---|---|
| reader 1440 | **125/245 = 51.0 %** · 113/240 = 47.1 % | **104 = 42.4 %** · 92 = 38.3 % | **110** · 113 | **76** · 61 | **21** · 21 |
| reader 1024 | **128/232 = 55.2 %** · 106/227 = 46.7 % | **106 = 45.7 %** · 89 = 39.2 % | **93** · 107 | **61** · 60 | **22** · 17 |
| skimmer 1440 | **77/117 = 65.8 %** · 73/106 = 68.9 % | **65 = 55.6 %** · 64 = 60.4 % | **31** · 27 | **31** · 22 | **12** · 9 |
| skimmer 1024 | **67/87 = 77.0 %** · 58/79 = 73.4 % | **62 = 71.3 %** · 52 = 65.8 % | **20** · 19 | **19** · 15 | **5** · 6 |
| director's cut 1440 | **129/199 = 64.8 %** · 123/200 = 61.5 % | **108 = 54.3 %** · 97 = 48.5 % | **63** · 68 | **36** · 40 | **21** · 26 |

The log-based share rose 7–10 points in the reader runs (63.8 / 64.8 → 73.5 / 72.0 %); the motion-based share rose
4–9 points (47.1 / 46.7 → 51.0 / 55.2 %). The gap between the two (the log grants a star that nothing visibly
performs: 76 and 61 reader clips) is still there and is the number to read J1's eye count against.

### No dead screen (automated)

`R/beats/beats.json` (`beats.mjs --widths=1440,1024`): **0 gaps > 100vh, 0 declared-but-missing, 0 scroll-star spans
< 300 px at both widths** (page 4,923.6vh @1440, 5,406.3vh @1024; round 2 4,959.8 / 5,383.7; 103 beat elements, all
declared; round 2 89). `R/deadscreen.json` (`deadscreen.mjs`, the §2.4 stretches against the reader runs): **11 of 11
stretches show their fill at both widths** (round 2 11 of 11); rests (rows that begin inside a breath, so need no
fill): B06, B07, B16; no row of the 11 stretches was skipped by the spotlight at either width. The check reads the
log only: a host that animates without asking the spotlight reads as "no play", so the J1 / panel sheets of those rows
remain the visual check.

### P3-5 #3 registration and FIG drift (`tools/capture/drift.mjs`)

`R/drift/drift-1440.json`, `R/drift/drift-1024.json`; a second 1024 run, `R/drift/drift-1024-repeat.json` (run
because the first 1024 run had one registration below the bar and one on it; written to a scratch folder and copied);
the settle | push pairs `R/drift/reg-<w>-<tier>-<card>.jpg` (from the first run of each width). Method as before
(`ssimAligned` is the verdict; the noise floor is 1.000 everywhere).

| push-in | 1440 css / gl aligned (raw) | r2 1440 | 1024 css / gl aligned (raw) · repeat run | r2 1024 | bar ≥ .95 |
|---|---|---|---|---|---|
| #1 opening (code push on L01) | .976 / .973 (.864 / .859) | .978 / .977 | .953 / .957 (.851 / .855) · **.950** / .952 | .959 / .952 | 1440 pass; 1024 first run pass (css .953), **repeat css .9497 fails by 0.0003** |
| #2 seam (ICE camera on L08) | .964 / .963 (.845 / .845) | .967 / .969 | .952 / **.944** (.872 / .872) · .952 / **.944** | .953 / .953 | 1440 pass; **1024 gl fails (.944 in both runs)**, css .952 |
| #3 ignite (SEQ-HALL frame 0 vs the hall still) | **.994 / .991** (.971 / .971) | .953 / .951 | **.983 / .983** (.940 / .940) · .986 / .983 | .923 / .923 | **pass at both widths** (round 2: marginal at 1440, fail at 1024) |
| tintype sun push (extra) | .990 / .990 (.970 / .970) | .981 / .981 | .975 / .975 (.937 / .938) · .975 / .975 | .979 / .978 | pass |

Ignite residual (tone-matched SSIM .988 / .985 at 1440, .976 / .976 at 1024; mean luma Δ 0.01–0.12; shift ≤ 0.4 px).

**FIG drift (the ICE push, p .50 → .66)**: **FIG residual: max 0.61 px (css) / 1.01 px (GL) at 1440** (round 2 0.64 /
0.49), **1.05 / 0.87 px at 1024** (round 2 1.08 / 1.09; repeat run 1.45 / 0.85); DOM cross-check 0.56 / 1.31 px at
1440, 0.93 / 0.57 px at 1024 (repeat 1.77 / 0.79). **Bar ≤ 2 px: pass at both widths.** GL vs css frames of the seam
at the same p: SSIM .998–1.000, shift 0.00 px, scale 1.0000 at both widths.

**P3-5 #3 verdict: #3 now passes at both widths (.994 / .991 at 1440; .983 / .983 at 1024; round 2 .953 / .951 and
.923 / .923). The drift tool as a whole reads PASS at 1440 and FAIL at 1024, on #2 (the GL seam, .944 against the .95
bar; round 2 .953), and #1's css push on the bar (.953 in the first run, .9497 in the repeat, which also reads FAIL).**
The tintype card engaged
the GL tier by itself on the default URL in round 2; in this round's hook captures its css tier shows no GL (`gl: null`
in `R/hooks/hooks-{1440,1024}.json`), while the drift run reads the 1024 css tintype as "gl on" (drift log; not
diagnosed).

### Keyboard (`tools/capture/probes/keyboard.mjs`)

Keyboard only (Tab, Shift+Tab, Enter, Space, Esc, arrows, typed words, Ctrl+K, and reloads; no click, `focus()` or
`blur()`), inside the full probe runs: **PASS at 1440 and 1024, and under reduced motion** (round 2: FAIL at both on
`op.compass`, the probe's selector, which read the hero's static compass; the probe changed in `d7a6543`).
- Walk: 78 Tab stops from the top to the wrap at both widths (round 2 73; the 77 under reduced motion, round 2 70); 0
  stops covered (`walk.covered`).
- Operated where the walk reaches them, in Tab order (stop numbers at 1440 and 1024): hunt chip 4, sound 5, Pause 6 (no
  count, no toast), menu 7, About's compass 18 (rest 265.8° at 1440 / 275° at 1024 → 45° after Enter → 225° after an
  arrow), coin 23, kraken 24, Run 27, chalk heart 29, drone 36 (flies with focus in the field; moved 51 px at 1440,
  234 at 1024; round 2 128 / 269), Dead Eye 42 (5/5, focus back), pen 43 ("Worthy."), eagle 66, bone 68, fire 69,
  Lumos 73 (all 29 candles lit), Snitch 76. Fast lane (stop 3) → `#work-title`; director's cut (stop 9) → focus on
  ■ Stop, Esc stops it; chapter tile → `#act-2-title`.
- Typed: "parley", "aal izz well", "nox" → "lumos", "I solemnly swear" (Map opens with focus inside, Esc closes in
  8 / 15 ms); palette Ctrl+K "solemn" opens the Map; Ctrl+K "Fly the homemade drone" focuses the pill without a
  take-off. After **palette → Map → Esc** focus lands on a link (`a`) at both widths and under reduced motion.
- **All 12 eggs counted by keyboard alone** at both widths and under reduced motion.
- Reduced motion (`R/probes-1440-rm-keyboard/p3-probes.json`, the RM-aware run): PASS; 77 stops; sound toggle disabled,
  the drone shows its flight plan (focus enters the game and returns after Esc), no candle toy, the cut never starts
  ("Motion is paused").

### Probe runs (`p3-probes.mjs`, all 21, both widths, and `--rm`): round 3 against round 2

| run | r3 pass | r2 pass | failing in r3 (r2 in brackets) |
|---|---|---|---|
| 1440 | **19 / 21** | 12 / 21 | games, loaf (r2: cinema, games, hunt, keyboard, layout-gates, loaf, spotlight, toys, words) |
| 1024 | **20 / 21** | 13 / 21 | loaf (r2: cinema, hunt, keyboard, layout-gates, loaf, spotlight, toys, words) |
| 1440 `--rm` | **16 / 21** (+ nav, words skipped) | 12 / 21 (+ nav, words skipped) | layout-gates, plates-live, split (r2: font-network, hunt, keyboard, layout-gates, plates-live, split, toys) |
| 1440 `--rm --only=keyboard` | **1 / 1** | 0 / 1 | none |

**Not like with like.** Eleven probe files and `qa.js` changed in `d7a6543` (§4); round 2's failures that were probe
drift (the hunt chip's text, the hero compass selector, `words.scrub`, the spotlight arbiter's synthetic tests) were
fixed in the probes along with the page, so a pass count against round 2's is partly the probes catching up. What fails
now, from the probe JSON:
- **games.inp (1440 only, as rounds 1 and 2).** One 544 ms keydown, input delay 0, in run 7 (round 2: a 272 ms
  pointerdown; round 1: a 688 ms keydown); 1024 passes. SwiftShader raster waits (W3.md §3).
- **loaf (as rounds 1 and 2).** Intro warm-up, by duration: 18 frames > 50 ms at 1440 (worst 600 ms, main-thread work
  5 ms) and 17 at 1024 (worst 269 ms, work 16 ms) (round 2: 15 / 16, work 8 / 2 ms): raster waits. Under `--rm` it
  passes.
- **`--rm` layout-gates.** `pauseMid` (`stageWasLive` false and `onBefore` 0: there is no stage under reduced
  motion, so the Pause-mid-scroll test has nothing to pause; shift 0.00008, boxes identical) and `rmHash` (the `/#work`
  load reads y 0 in both its early and its late read, section top 7,710). In the default runs the probe's own
  reduced-motion `rmHash` check passes at both widths (y 7,618, section top 92) and `pauseMid` passes, so the same
  build and viewport read both ways; not diagnosed (probably the probe's `--rm` mode, not the page; an open question
  for the triage). The paused reload, `noJs`, `phone`, `rm` and `zScale` pass in all runs (round 2: the paused reload
  failed).
- **`--rm` plates-live.** 19 plates, `maxPlaying` 0, every plate reads `how: dead` with state `poster` (as round 2).
- **`--rm` split.** trading-algos, optuna-screener and beyond read `display: contents`, no columns, at both widths
  (the split layout is absent under reduced motion; as round 2).
- The default runs pass hunt, toys, words, spotlight, cinema, keyboard and layout-gates, which failed in round 2.

---

## 2. Judges: exactly which files

Give each judge only its own list. Judges get images and the JSON / Markdown named here, never the repo, the build
notes, the spec or anything from rounds 1 and 2 (the PANEL's tempo answers are scored against PHASE3-SPEC §2.2 by the
assembler, not shown to them). Sheets are 1600 px wide (2 clips per row, 4 frames per clip at 1/8 3/8 5/8 7/8 of the
clip, its label burned in). File names and layout match round 2's, so a round-2 finding can be looked up at the same
place by section and beat (clip numbers shift with the run's own timing and the longer page).

### J1 STAR · one star per screen (1 s clips, both profiles, both widths)
- Reader 1440: `R/screencast/reader-1440/sheets/sheet-01.jpg … sheet-26.jpg` (257 clips; clips 1–12 are the intro)
- Reader 1024: `R/screencast/reader-1024/sheets/sheet-01.jpg … sheet-25.jpg` (244 clips; 1–12 intro)
- Skimmer 1440: `R/screencast/skimmer-1440/sheets/sheet-01.jpg … sheet-12.jpg` (117 clips)
- Skimmer 1024: `R/screencast/skimmer-1024/sheets/sheet-01.jpg … sheet-09.jpg` (87 clips)
- The machine record per clip (t, scrollY, section, stars per the spotlight, overlap, row, declared breath, frame
  timings, and new: `motion` / `moving`): `R/screencast/{reader,skimmer}-{1440,1024}/clips.json` (`clips[i]` = clip
  #i+1 on the sheets). `totals.seen` is the assembler's (it is the machine's reading of the same question).
- Geometry only (the beat boxes; not a motion record): `R/beats/beats.json`.
- Label key: `#n m:ss y<scrollY> <section>` left; right: `★<beat>·w<weight>` per spotlight star, `(+id unreg.)` for a
  declared scroll star that never registered, `breath after Bnn` inside a declared breath, a red band for `NO STAR`
  (outside a breath) or `2+ AT ONCE`. **New this round:** `(static)` after a star = the log has it, nothing in the
  clip moves on its own; `(moves)` after `no star` = motion with no star in the log. The judge counts what it SEES; the
  labels are the machine's claim to check against (see "What changed in the counting" (b) if the labels must be off).
- Score: per clip "stars seen" (0 / 1 / 2+), flag every 0 outside a breath and every 2+; findings
  `{screen, t, clip, finding, severity}`. The automated numbers are §1 above.

### J2–J4 PANEL · would you keep scrolling · tempo · game discovery (the reader capture, per screen)
- Reader 1440: `R/screencast/reader-1440/sheets-panel/sheet-01.jpg … sheet-13.jpg` (2 s clips, 128 of them; labels =
  clip, time, `screen N` = scrollY / viewport + 1; no star or beat annotation; sheet 1 = the play screen → flight →
  name hand-off)
- Reader 1024: `R/screencast/reader-1024/sheets-panel/sheet-01.jpg … sheet-13.jpg` (122 clips; round 2 had 12 sheets)
- `R/screencast/reader-{1440,1024}/clips-panel.json` maps each 2 s clip to its screen (`clips[i].screen`; screens 1–49
  at 1440, 1–54 at 1024) for the per-screen yes/no; the hand-off = the clips labelled "opening" plus screen 1; the four
  cards and the first Work screen are found by the assembler from `clips.json` `section` (act-1…act-4, work).
- The reader's input: 250 px/s as 50 px wheel notches (Lenis on), a 2 s stop at each h2 and at each act card's settle,
  the intro played (Play clicked after 2.5 s, untouched until the titles end). For the assembler only (never tell
  the judges): game discovery = the hunt chip ("0/12") in the header from screen 1 and the toy invites B08 compass,
  B18 Run, B26 Take off, B28 Dead Eye (their screens are in `clips.json` `row`).
- Optional context for the panel (static frames, not motion): `R/scenes/1440/sheet-01.jpg … sheet-08.jpg`,
  `R/scenes/1024/sheet-01.jpg … sheet-08.jpg` (captioned D/A frames; `sheets.json` lists the frames per sheet).

### J5–J7 STRANGERS · blind stranger test · hooks (ONLY these folders; neutral ids, no URL, film or person in any name)
Give the folders in this order (a judge must finish the blind set before it sees any text). Use judges who did not
see round 1's or round 2's sets; the ids were reshuffled (no id repeats a round-1 or round-2 pairing), so an older
answer key is useless here.
1. Blind (text hidden by CSS; world recognizability): `R/strangers/blind-1440/J001.jpg … J039.jpg`, then
   `R/strangers/blind-1024/J001.jpg … J037.jpg` (BLIND-mode frames only; an ALT identical to its DEFAULT is judged once).
   Verdict rows: `{ "frame": "J001", "film": "<film or ??>", "moment": "…", "confidence": 0–1, "why": "…" }`.
2. Read (text visible): `R/strangers/read-1440/C001.jpg … C017.jpg`, then `R/strangers/read-1024/C001.jpg … C017.jpg`.
   Questions: whose name is the page about (as written), any text you cannot read, and where you would click to skip
   straight to the research (and how many seconds it took). Verdict rows:
   `{ "frame": "C001", "name": "<as read or null>", "cantRead": ["…"], "fastLane": { "found": true, "where": "…", "seconds": 3 } }`.
3. Hooks (each a full screen at the moment a section's card arrives): `R/strangers/hooks-1440/H001.jpg … H008.jpg`,
   `R/strangers/hooks-1024/H001.jpg … H008.jpg` (4 cards × 2 render tiers each). Verdict rows:
   `{ "frame": "H001", "hook": true|false, "why": "…" }`.
- Keys (assembler only, never to a judge): `R/keys/{blind,read,hooks}-{1440,1024}-key.json`; scenes manifests
  `R/scenes/{1440,1024}/manifest.json` (119 frames each; round 2 118). Score (one command per set, verdicts in
  `<prefix>1.json … 3.json`):
  `node tools/capture/score.mjs --kind=blind --key=R/keys/blind-1440-key.json --manifest=R/scenes/1440/manifest.json --verdicts=<dir>/blind-1440-j --width=1440 --out=… --md=…`
  (`--kind=captioned` with the read keys, `--kind=hooks` with the hook keys). The blind per-world bar is printed
  against the pre-Phase-3 score (M5 final: Pirates 10/10, 3 Idiots 9/10, RDR2 9/13, HP 10/12). Round 1's and round 2's
  verdicts are in `R1/verdicts/` and `R2/verdicts/` (score them with their own keys only).
- Named copies of the hook frames for the assembler / panel: `R/hooks/{1440,1024}-{css,gl}/<card>-p05.jpg`,
  `R/hooks/hooks-{1440,1024}.json` (damped p, tier, data-gl per frame).

### J8 SMOOTH · smoothness
- `motion.js` tables: `R/motion/1440/summary.md`, `R/motion/1024/summary.md` (runs intro, desktop = Lenis default,
  native = `?skip=smooth`, alt, rm, gl = `?gl=force`; per-section, act-card transitions, idle probe, LoAF, CLS, pops);
  raw numbers `R/motion/{1440,1024}/motion.json`; strips `R/motion/{1440,1024}/strips/*.jpg` (intro, landing, first
  60 s per run, the four act cards, the pops). Round 2: `R2/motion/{1440,1024}/summary.md`. Baseline (P3-0):
  `docs/build/motion-strips/p3-before/summary.md`.
- Skimmer frame timings (headed, Lenis on, the same seeded flings): `R/screencast/skimmer-{1440,1024}/screencast.json`
  (`summary.raf`, `summary.loaf`, `raf` = [t, dt, scrollY] per frame, `loaf`) and per clip `clips.json` (`fps`,
  `p95`, `maxDt`, `loaf50`); the reader's and the director's cut's the same way.
- Warm-up LoAF probe: `R/probes-{1440,1024}/p3-probes.json` → `results.loaf`.
- Targets: PHASE3-SPEC §12.1 (headless relative row) and §4.4 (intro). Headline (headless; each cell **r3** · r2):

| measure (§12.1 headless relative; §4.4 intro) | target | 1440 **r3** · r2 | 1024 **r3** · r2 |
|---|---|---|---|
| desktop (Lenis default) fps / p95 | ≥ 15.2 (target 18) / ≤ 316.7 ms | **15.1** / 250 · 14.8 / 233.3 | 19.5 / 166.7 · 21.7 / 150 |
| desktop pops / CLS | ≤ 12 / 0 | 2 / **0.0454** · 4 / 0.006 | 10 / **0.0124** · 6 / 0.0133 |
| desktop work · principles · journey · kill-list fps (frames in brackets) | ≥ 4.8 · 4.95 · 5.25 · 5.85 | 13.0 (31) · 10.6 (34) · 5.6 (19) · **5.6 (13)** ‖ r2 19.7 · **4.2** · 7.6 · **5.4** | 14.3 (30) · **4.4 (13)** · 6.9 (19) · 9.9 (25) ‖ r2 34.1 · 19.1 · 9.9 · 11.2 |
| native (`?skip=smooth`) fps / p95 / pops / CLS | judged separately | 10.0 / 350 / 28 / 0.015 · 8.1 / 433.3 / 52 / 0.0173 | 13.9 / 283.3 / 39 / 0.0153 · 14.0 / 250.1 / 40 / 0.0149 |
| native principles · journey fps | ≥ 4.95 · 5.25 | **2.9** · **3.5** ‖ r2 3.1 · 4.1 | **4.3** · **3.3** ‖ r2 4.0 · 5.8 |
| gl (`?gl=force`) fps / p95 / pops / CLS | judged separately | 15.1 / 266.6 / 2 / 0.007 · 16.1 / 200.1 / 7 / 0.0141 | 21.7 / 150 / 14 / 0.0124 · 22.9 / 133.3 / 11 / 0.0139 |
| alt fps / p95 / pops | — | 13.7 / 283.3 / 0 · 14.2 / 250 / 5 | 19.8 / 166.7 / 7 · 22.6 / 133.3 / 11 |
| intro fps / p95 | ≥ 29.5 / ≤ 116.6 ms | **18.5** / **133.3** · 20.8 / 116.7 | **28.1** / 83.3 · 31.8 / 66.7 |
| intro LoAF > 50 ms, warm → titles-end (by duration) | none | **47** (max 731 ms, blocking 35) · 45 (657, 25) | **30** (max 415, blocking 66) · 25 (405, 24) |
| rm fps / CLS | — / 0 | 58.0 / **0.025** · 59.7 / 0 | 58.8 / 0 · 59.8 / 0 |
| skimmer screencast rAF fps / p95 / > 50 ms (headed, with readback) | relative | 8.6 / 250 / 94.6 % · 9.2 / 233.4 / 86.9 % | 11.0 / 200 / 68.4 % · 13.1 / 166.7 / 55 % |
| reader screencast rAF fps / p95 / > 50 ms (headed) | relative | 14.0 / 166.7 / 63.0 % · 15.8 / 150 / 53.4 % | 19.1 / 116.8 / 34.0 % · 21.9 / 100.1 / 23.1 % |
| director's cut screencast rAF fps / p95 / > 50 ms (headed) | relative | 12.2 / 150.1 / 82.0 % · 14.6 / 133.4 / 62.7 % | — |
| desktop lab LCP (qa.js, 3 loads) | ≤ 400 ms | **780 / 732 / 764** · 772 / 624 / 280 | **816 / 724 / 736** · 748 / 904 / 748 |

Bold = misses its target (or is a regression to look at). Read the rows as one run each on a shared software
rasteriser: run-to-run spread was not measured, and a section row rests on few frames (desktop 1024 principles: 13
frames in r3, 59 in r2; 1440 kill-list: 13 and 12), so a single section's fps can move by half between two runs without
a code change. What moved beyond that, and what to look at:
- **Layout shift (the largest change).** The 1440 desktop CLS is 0.0454 (round 2 0.006): one 0.025 shift at 32.9 s in
  `#films` (`div.pointer-events-none.absolute.inset-y-0 in #films`) and one 0.0134 shift at 17.0 s in `#work`
  (`span.scene-caption__moment.world-face-idiots`). The same 0.025 `#films` shift is in the alt run (0.0306 total) and
  **in the reduced-motion run (0.025 at 26 s; round 2: 0, round 1: 0.061)**. At 1024 the desktop CLS is 0.0124 and rm 0.
- **Intro.** The 1440 intro fps (18.5, round 2 20.8) and the LoAF count in the warm → titles-end window (47, round 2
  45) are slightly worse, the 1024 intro fps (28.1) now sits below the 29.5 target (round 2 31.8). The intro run at 1440
  also holds a 1,017 ms LoAF on the play screen (t −1.66 s, before Play is pressed; script 1,013 ms in an
  `IdleRequestCallback`), outside the warm → titles-end window; round 2's worst at 1440 was 657 ms at the landing, and
  its 1024 run had a similar pre-Play task (827 ms).
- **Frame rates.** The reader and skimmer screencasts are 6–16 % slower than round 2 (reader 1440 15.8 → 14.0 fps,
  skimmer 1024 13.1 → 11.0), the gl runs 5–6 % and the 1024 desktop run 10 % slower (21.7 → 19.5); the 1440 desktop
  run is level (14.8 → 15.1) and native 1440 is faster (8.1 → 10.0 fps, pops 52 → 28). The 1024 principles section is
  19.1 → 4.4 fps in the desktop run (13 frames) and misses its target; the 1440 kill-list misses by 0.25 fps (13 frames).
- **Pops.** Desktop 1440 2 (4), native 1440 28 (52), alt 1440 0 (5); up at 1024 (desktop 10 vs 6, gl 14 vs 11).
- Not re-measured: the §4.4 rows that need the intro trace (`#intro` repaints, landing raster, hand-off script time, the
  name's frame).

### J9 HONEST · honesty + a11y
- `npm run check`: `R/honest/check.txt` (exit 0, 67 warnings; round 2 66). `RELEASE=1 npm run check`:
  `R/honest/release.txt` (exit 1 with **47 errors**, round 2 46: 40 Check L2 countersignatures, 5 TTS approvals in
  SOUNDS.md, the unsigned copy, now **107 strings** (round 2 104), and **one new error, `[J9 F3]`: 5 COMMUNITY-sourced
  quotes render on the page unverified** (Q-PC-1, Q-PC-3, Q-3I-3, Q-RD-1, Q-RD-2; the check, `scripts/checks/quotes.mjs`,
  was added in `d7a6543`); all DP-9 items for Aryan). Lines in both: beats 105 declared (84 stars) on 20 items, page ≈
  4,920.8vh @1440 and 5,406.2vh @1024 (round 2 91 / 70; 4,959.8 / 5,383.7); the spotlight check **26 of 40 scroll stars
  with a performance window, 14 live only** (C1, lent a still screen: B04-loop, B10-sea, B14-loop, B16-pen, B17-beam,
  B20-window, B22-board, B25-demo, B28-pen, B38-fireflies, B50-motes, B50-loop, B54-hall, B56-flame; round 2: 26/26) and
  the six derived breaths.
- Research-font probe, AA probe, layout gates (Pause mid-scroll shift; the paused reload), sound, lenis (Pause ≤ 100
  ms), decoder: `R/probes-1440/p3-probes.json`, `R/probes-1024/p3-probes.json` → `results.research-font`,
  `results.aa-scrim`, `results.layout-gates`, `results.sound`, `results.lenis`, `results.decoder`. **All pass at both
  widths** (round 2: layout-gates failed on its paused reload); Pause mid-scroll: shift 0, boxes identical, scroll
  kept, at both widths.
- RM run (no motion, no sound, 0 video bytes): `R/probes-1440-rm/p3-probes.json` (the RM-aware probes: bundle, cards,
  cinema, games, gl, lenis, sound, spotlight, hunt, toys, keyboard, decoder, font-network, loaf, aa-scrim,
  research-font pass; layout-gates, plates-live and split fail, §1 "Probe runs"), motion.js `rm` rows in
  `R/motion/{1440,1024}/summary.md` (58.0 / 58.8 fps; CLS 0.025 at 1440, the `#films` shift above, 0 at 1024), the RM
  frames `R/scenes/{1440,1024}/rm-01.jpg … rm-03.jpg`, qa.js `R/qa/qa-{1440,1024}.json` (`motion`, `lenis`).
- Keyboard-only pass: `results.keyboard` in `R/probes-{1440,1024}/p3-probes.json` (§1 above; `walk` lists every Tab
  stop in order) and under reduced motion `R/probes-1440-rm-keyboard/p3-probes.json`.
- qa.js (anchors, overflow at 320/390/1024/1440, no-JS, media blocked, LCP, console / hydration):
  `R/qa/qa-{1440,1024}.json`. Both widths: 0 hydration errors; every console line (59 / 60) is inside the deliberate
  media-blocked context (round 2 69 / 68); 52 anchors, 0 broken; no horizontal overflow at any of the four widths;
  no-JS h1 = 1, no hidden text, introVisible false, **new in this qa.js: all 19 streamed `div[hidden][id^="S:"]`
  blocks are shown without JS** and the six sections are listed (top, act-1…act-4, credits); media blocked: 19
  sections / 35 captions / h1 1; RM and Pause: 0 running animations and 0 playing videos in 11 sections; Lenis gone
  after Pause (`pauseAfter` false). Two readings to flag: `lenis.pauseBefore` is **false** (round 2 true): in the Pause
  context `window.__lenis` was not yet there at `networkidle`, while the default context has it (`default` true), so it
  reads as a late attach rather than a missing one, not diagnosed; and `noJs.allInView` is **false** (new field): of
  the six per-section no-JS shots only top and act-1 land in the viewport, the rest report `top` 5,880 / 22,278 /
  27,527 / 27,099 px at 1440 (5,543 / 20,513 / 25,671 / 24,952 at 1024), which is consistent with `html { scroll-behavior:
  smooth }` (`app/globals.css`) making `window.scrollTo` animate while the tool waits 150 ms (the saved shots in
  `R/raw/qa-*` show mid-scroll frames); not re-run, so no claim about the page without JS beyond the checks above.
  Desktop LCP 780 / 732 / 764 ms (1440 run) and 816 / 724 / 736 ms (1024 run) against the ≤ 400 ms budget (round 2 772 /
  624 / 280 and 748 / 904 / 748), mobile 1.55–2.15 s (1440 run) and 1.56–1.94 s (1024 run) (round 2 1.33–1.39 and
  1.59–2.09).

### Automated · no dead screen
- `R/beats/beats.json`, `R/deadscreen.json` (§1 above), with the static strips `R/scenes/{1440,1024}/sheet-*.jpg`
  and the reader sheets for the rows named in §1.

### Director's cut (its own axis only: it dwells on stars and flatters the pacing; never show it to J1–J7)
- `R/screencast/director-1440/sheets/sheet-01.jpg … sheet-20.jpg` (2 s clips, 199, labels as J1's), `clips.json`,
  `screencast.json` (the cut ran top → end by itself in 391 s from its first sample: `drive.endedBy = "cut ended"`, y
  43,312 = the page bottom; round 2 395 s, y 43,717).

### Phones (unchanged in Phase 3; for the 390 regression eye only)
- `R/scenes/390/sheet-01.jpg`, `sheet-02.jpg` (31 frames at 390×844), `R/scenes/390/checks.json` (0 console errors,
  0 overflow).

---

## 3. What ran, what did not

All on one machine, one browser at a time, against `http://localhost:3161` (the `ece90dc` build, `next build` at
22:11 UTC on 2026-10-12, 28.7 s; clean tree, no source file newer than the build). Logs: `R/logs/*.log` and the
`*.status` files (round 2's set plus `beats.log`, `build.log`, per-run `clips-*.log`, `deadscreen.log`).

**Two sittings.** Sitting 1 (2026-10-12 22:11 → 2026-10-13 00:49 UTC, one capture agent): the build; phase A (beats,
the five screencasts back to back, 22:12–22:32); phase B (clips + sheets, panel sheets, deadscreen, scenes at 1440 /
1024 / 390, hooks, drift, motion at both widths, 22:32–23:23); scenes at 1440 once more with its sheets, then the
stranger sets and keys (23:25–23:36); phase C (the full probes at 1440, 1024 and `--rm`, the RM keyboard run, qa.js at
both widths, 23:36–00:41); `npm run check` and `RELEASE=1 npm run check` (00:41); a second 1024 drift run and the round-2
re-count (00:48–00:49). A container restart stopped the agent before this manifest and the commit. Sitting 2
(2026-10-13, after the restart): every item was checked against round 2's file counts and the JSON inside (all five
screencasts with `clips.json`, sheets and panel sheets; deadscreen; scenes; motion with all six runs at both widths;
beats; drift; hooks; strangers and keys; the four probe folders with their 21 / 21 / 21 / 1 results; qa; honest); none
was missing or partial, so nothing was re-run, **no server and no browser was started in sitting 2**, and this
manifest, the commit and the push are all it did. The scenes 1440 run appears twice in the logs
(`logs/scenes-1440-attempt1.log`, 22:37–22:48; `logs/scenes-1440.log`, the run whose frames and sheets are committed,
finished 23:35); the two logs are identical (119 frames, 0 console errors, 0 overflow); why the first was repeated was
not recorded.

| capture | command (abridged) | result (r3 · r2) |
|---|---|---|
| beats | `beats.mjs --widths=1440,1024 --out=R/beats` | 0 gaps, 0 missing, 0 short spans at both widths (r2 the same); 103 beat elements (r2 89) |
| reader / skimmer screencasts | `screencast.mjs --profile=reader\|skimmer --vw=1440x900\|1024x768 --out=R/screencast/<p>-<w> --raw=R/raw/screencast/<p>-<w>` → `clips.mjs` (+ `--clip=2 --plain --name=panel` for the reader) | reader 241.2 / 229.3 s of scroll (r2 237.0 / 223.9), skimmer 114.2 / 83.7 s (r2 105.8 / 78.1); 0 page errors; Lenis on in all four |
| director's cut | `screencast.mjs --profile=director --vw=1440x900` → `clips.mjs --clip=2` | ran top → end on its own in 391 s (`endedBy` "cut ended"; r2 395 s) |
| scenes | `scenes.js --only=desktop,intro,alt,rm` at 1440 and `--vw=1024x768`; `--only=mobile` (390×844) | 119 / 119 / 31 frames (r2 118 / 118 / 31); 0 console errors, 0 overflow, 0 hydration errors; every act card fits the viewport at both widths and in the alt run; → `sheet.mjs` sheets |
| stranger sets | `anon.mjs` (blind: `--manifest … --modes=BLIND`; read: `--mode=captioned --match=…`; hooks: `--mode=frames`), new seeds | 39 + 37 blind, 17 + 17 read, 8 + 8 hooks (r2 the same count); 0 ids repeat an r1 or r2 pairing (checked key against key); keys in `R/keys/` |
| card hooks | `hooks.mjs --vw=… --tiers=css,gl` (p .05) | 4 cards × 2 tiers × 2 widths; GL engaged on every GL-tier card; css tier shows no GL on any card (r2: the tintype engaged GL by itself) |
| motion | `motion.js --runs=intro,desktop,native,alt,rm,gl` at 1440 and `--vw=1024x768` | see J8; 0 page errors |
| drift | `drift.mjs --tiers=css,gl` at 1440 and 1024, and a second 1024 run | see §1 (1440 PASS; 1024 FAIL on #2 gl seam .944 in both runs; #3 passes at both widths) |
| probes | `p3-probes.mjs` (all 21, `--timeout=1200000`) at 1440, `--vw=1024x768`, and `--rm` at 1440; then `--rm --only=keyboard` | 1440 19 / 21 (r2 12); 1024 20 / 21 (r2 13); `--rm` 16 / 21 with nav and words skipped (r2 12); RM keyboard 1 / 1 (r2 0) |
| qa | `qa.js` at 1440 and `--vw=1024x768` | see J9 |
| keyboard | inside the full probe runs at 1440 and 1024, and the RM-aware `--rm --only=keyboard` run | PASS at all three (r2: FAIL on the compass selector); see §1 |
| r2 re-count | `clips.mjs` on `R2/raw/screencast/*` into a scratch folder | `R/r2-recount.json` (§ "What changed in the counting") |
| check | `npm run check`, `RELEASE=1 npm run check` | exit 0 (67 warnings) / exit 1 on DP-9 items only (47 errors, incl. the new quote check) |

**Not run:** the one-off probe-diagnosis read of round 2 (`R2/probes-diag`) was not repeated: every default-run probe
failure of round 2 passes now, and the two open items (the `--rm` `rmHash` / `pauseMid` reading and the
`pauseBefore` reading) are flagged above, not diagnosed. No judge ran, and no verdicts or scores are in this folder.

**Caveats.**
- The screencasts' frame times are lower than motion.js's (screencast readback under SwiftShader); compare a
  screencast with a screencast. No other job overlapped a recording.
- `deadscreen.mjs` and the J1 log numbers read the spotlight log: a host that animates without the spotlight is invisible
  to the log (the self-motion rows are the cross-check); every declared scroll star registered in all four runs.
- motion.js / probes are headless SwiftShader: INP and LoAF-by-duration readings are raster waits (W3.md §3). Every
  motion.js number is a single run (§2 J8). The one repeated run (drift at 1024) moved #1 css by .003 and nothing else.
- The probes were run as they stand at `ece90dc`, which is not the code round 2 ran (§4): their pass counts do not
  compare one to one.
- The build was not re-run in sitting 2: the `.next` build of 22:11 UTC (from `ece90dc`, clean tree) served every
  capture, so all round-3 captures saw the same bytes.

## 4. Tools

As in round 2 (`R2/MANIFEST.md` §4) except what `d7a6543` and `ece90dc` changed (`git diff c193fd4 HEAD --stat --
tools scripts`): `clips.mjs` (the self-motion count and the `(static)` / `(moves)` label words; items not streamed yet
place no breath), `qa.js` (per-section no-JS shots, the streamed blocks), eleven probes (`aa-scrim`, `cards`, `cinema`,
`font-network`, `hunt`, `keyboard`, `layout-gates`, `plates-live`, `spotlight` (+313 lines, +20 in `ece90dc`), `toys`,
`words`), the checks (`scripts/checks/beats.mjs`, `fonts.mjs`, `quotes.mjs` new, `unsigned.mjs`, `signed-copy.json`
new) and `scripts/fetch-display-fonts.mjs`. `anon.mjs`, `scenes.js`, `motion.js`, `drift.mjs`, `hooks.mjs`,
`screencast.mjs`, `sheet.mjs`, `deadscreen.mjs`, `beats.mjs`, `score.mjs` and `p3-probes.mjs` are unchanged since
round 2. No tool was changed in this capture.
