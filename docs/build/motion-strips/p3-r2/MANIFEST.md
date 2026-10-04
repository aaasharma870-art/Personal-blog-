# P3-11 round 2 · capture manifest (judge inputs)

2026-10-04 · branch `design/three-films` · app build of HEAD `dedd0f1` (the round-1 fixes `21674b2` + their review
fixes) served by `next start -p 3161` · tools as of the same HEAD (`tools/capture/`; since round 1 only `clips.mjs`,
`deadscreen.mjs` and `probes/keyboard.mjs` changed, in `21674b2`). Every path below is relative to the repo root.
`R` = `docs/build/motion-strips/p3-r2`, `R1` = `docs/build/motion-strips/p3-r1` (round 1, for comparison).

**Machine.** The same kind as round 1: 4 CPUs, no GPU, Chromium 141 rasterising in software (SwiftShader). Absolute
frame times are pessimistic against a real laptop; read them as relative, and compare a round-2 number with the
round-1 number beside it. The screencasts run **headed Chrome under `xvfb-run`** (`meta.browserMode` in every
`screencast.json`); motion.js, scenes.js, the probes and qa.js run headless, as in round 1. This round, nothing else
ran while a screencast recorded (round 1 had one clip-cutting job overlap the 1024 recordings): the five recordings
ran back to back, and the clips were cut afterwards.

**Same input as round 1.** Reader: 250 px/s as 50 px wheel notches, a 2 s stop at each h2 and act-card settle, the
intro played. Skimmer: the same seeded flings (seed 20261003: 47 flings at 1440 and 39 at 1024, commanded peaks
2,278–2,745 px/s, the same values as round 1). Director's cut: the hero's button, recorded until the cut ends.
**New stranger seeds**: every stranger set was reshuffled with a new seed, chosen so that **no id names the same
frame as in round 1** (0 of 39 + 37 blind, 17 + 17 read, 8 + 8 hooks ids repeat a round-1 pairing); the sets hold the
same frames as round 1.

**Not committed (local only, regenerable).** `R/raw/`: the screencast videos (`raw/screencast/*/video.mp4`) and
frames, the per-clip strips (`raw/screencast/*/clips/clip-NNNN.jpg`), the scenes.js PNGs, the motion.js frame dumps and
full-size strips, the drift / hooks PNGs, the hook mixes behind the stranger hook sets, qa.js shots. Probe PNGs are
ignored by `.gitignore` (`p3-r*/**/*.png`).

**Counting rules changed between the rounds (read this before comparing J1 numbers).** The round-1 fixes changed how
`clips.mjs` counts and how `deadscreen.mjs` judges: (a) a scroll star now counts only while the page moves (≥ 12 px
inside the clip) inside its performance window, unless the log marks it `how: "live"`; (b) a declared breath is now
the viewport after each weight-3 star (`lib/beats.ts` BREATHS), not the ⟂ rows of PHASE3-SPEC §2.3; (c) a dead-screen
row that begins inside a breath is a rest and needs no fill. Round 1's published numbers used the old rules. So that
like is compared with like, round 1's own recordings (still local in `R1/raw/`) were **re-counted with today's
`clips.mjs` and `deadscreen.mjs`** (the "r1 re-counted" columns; written to a scratch folder, not committed, round 1's
folder untouched). Caveat: the re-count reads round 1's spotlight log and geometry but today's beat declarations
(89 beat elements today, 80 in round 1), so it is a fair reading of the counter, not a re-run of round 1's page.

---

## 1. Automated numbers

### J1 (one star per screen): the spotlight log, per 1 s clip

Source: `?debug=spotlight` (`window.__spotlight.log`) recorded in each screencast; `tools/capture/clips.mjs` turns it into
stars per clip (a scroll star from `own` to the next `own` / `free`, counted while the page moves inside it; a time star
from `grant` to `end` / `release`). `2+ at once` counts a clip where two stars are active at the same instant
(`overlapMs` = how long). The intro clips (play screen → titles → quiet window: 12 per reader run this round, 13 in
round 1) are outside the page rules and are not counted. "With declared" adds the declared scroll stars that never
registered with the spotlight in the run while their box crosses the middle 60 %: **none this round in the reader runs**
(round 1: B02, B09, B10, B11, B54); one in the skimmer 1440 run (B21).

Each cell: **r2** · r1 as published · r1 re-counted (today's rules).

| run | clips (intro) | exactly one star | 2+ at once (≥ 100 ms) | star-less outside a breath | star-less in a breath | with declared: one / 2+ / star-less outside |
|---|---|---|---|---|---|---|
| reader 1440 | **252 (12)** · 252 (13) | **153/240 = 63.8 %** · 55.2 % · 50.6 % | **0 (0)** · 5 (4) · 3 (3) | **72 (30.0 %)** · 85 (35.6 %) · 100 (41.8 %) | **15** · 17 · 15 | **63.8 % / 0 / 72** · 63.2 % / 8 / 63 · 58.6 % / 6 / 78 |
| reader 1024 | **239 (12)** · 237 (13) | **147/227 = 64.8 %** · 57.1 % · 52.2 % | **2 (2)** · 0 (0) · 0 (0) | **65 (28.6 %)** · 81 (36.2 %) · 96 (42.9 %) | **13** · 15 · 11 | **64.8 % / 2 / 65** · 64.3 % / 3 / 62 · 59.4 % / 3 / 77 |
| skimmer 1440 | **106 (0)** · 102 | **84/106 = 79.2 %** · 65.7 % · 66.7 % | **6 (4)** · 6 (5) · 5 (5) | **12 (11.3 %)** · 24 (23.5 %) · 23 (22.5 %) | **4** · 5 · 6 | **78.3 % / 7 / 12** · 72.5 % / 10 / 13 · 73.5 % / 9 / 13 |
| skimmer 1024 | **79 (0)** · 79 | **65/79 = 82.3 %** · 79.7 % · 78.5 % | **3 (3)** · 1 (0) · 1 (0) | **7 (8.9 %)** · 13 (16.5 %) · 13 (16.5 %) | **4** · 2 · 3 | **82.3 % / 3 / 7** · 87.3 % / 4 / 4 · 86.1 % / 4 / 5 |
| **reader, both widths** | 467 page clips · 463 | **300 = 64.2 %** · 56.2 % · 51.4 % (bar ≥ 90 %) | **2** · 5 · 3 (bar 0) | **137 (29.3 %)** · 166 · 196 (bar: none outside a breath) | **28** · 32 · 26 | **64.2 % / 2 / 137** · 63.7 % / 11 / 125 · 59.0 % / 9 / 155 |
| director's cut 1440 (2 s clips; r2 · r1, not re-counted) | 200 · 198 | 137 = 68.5 % · 56.6 % | 0 · 3 (2) | 49 · 71 | 14 · 12 | 68.5 % / 0 / 49 · 62.6 % / 9 / 53 |

The 2+ clips (spotlight log): reader 1024 #51–52 `B12-push` + `B12` (295 / 911 ms); skimmer 1440 #80–81 `B45` +
`B44-page4` + `B46` (335 / 12 ms), #89–90 `B53` + `B54` (395 / 283 ms), #99–100 `B56` + `B56-trail` (610 / 20 ms); skimmer
1024 #23 `B16` + `B19` (120 ms), #73–74 `B56` + `B56-trail` (+ `B57`) (169 / 116 ms). Round 1's two reader pairs
(`B08-compass` + `B08`, `B21-circle` + `B21`) are gone; the reader 1440 run has no 2+ clip. Spotlight skips in the
reader runs: 1440 `B12` (host left the viewport), `B44-page3` and `B44-page5` (maxWait 700 ms); 1024 `B44-page2`,
`B44-page5` (maxWait 700 ms) (round 1 at 1440: B08-invite, B12, B18, B20, B31, B43, B45). Distinct stars seen: 65 / 66
(reader 1440 / 1024; round 1 46 / 46). Star-less clips outside a breath, by section (reader 1440): films 8,
optuna-screener 7, systems 7, credits 6, experiment 5, beyond 5, work 4, kill-list 4, top 3, about 3, journey 3,
trading-algos 3, writing 3, act-1 2, voices 2, principles 2, contact 2, act-2 1, act-3 1, act-4 1
(`totals.noneOutsideBreathBySection` in each `clips.json`; round 1: journey 14, writing 10, optuna-screener 8, …).

Declared breaths (today's rule) on the reader 1440 geometry: after B04, B14, B30, B38, B50, B58
(`totals.breaths` in each `clips.json`); the beat-map rows that begin inside one: B06, B07, B16, B31, B39, B52.

### No dead screen (automated)

`R/beats/beats.json` (`beats.mjs --widths=1440,1024`): **0 gaps > 100vh, 0 declared-but-missing, 0 scroll-star spans
< 300 px at both widths** (page 4,959.8vh @1440, 5,383.7vh @1024; round 1 4,950.2 / 5,366.8; 89 beat elements, all
declared; round 1 80). `R/deadscreen.json` (`deadscreen.mjs`, the §2.4 stretches against the reader runs):
**11 of 11 stretches show their fill at both widths** (round 1 as published: 8 of 11; round 1 re-counted with today's
rules: 9 of 11, D4 and D10 still failing).
- D1: B06 (the course plot) now begins inside the breath after B04, so it is a rest and needs no fill (round 1:
  never requested from the spotlight); the other rows of D1 show their fill.
- D4: B20 (the schematic ink) plays at both widths (round 1: skipped, `maxWait 1500 ms` behind B19).
- D10: B45 (the horse fly-through) plays at both widths (round 1: skipped, `host left the viewport`).
- D3: B16 is a rest (begins inside the breath after B14) and plays as well.
The check reads the log only: a host that animates without asking the spotlight reads as "no play", so the J1 / panel
sheets of those rows remain the visual check.

### P3-5 #3 registration and FIG drift (`tools/capture/drift.mjs`)

`R/drift/drift-1440.json`, `R/drift/drift-1024.json`; the settle | push pairs `R/drift/reg-<w>-<tier>-<card>.jpg`.
Method as in round 1 (`ssimAligned` is the verdict; the noise floor is 1.000 everywhere).

| push-in | 1440 css / gl aligned (raw) | r1 1440 | 1024 css / gl aligned (raw) | r1 1024 | bar ≥ .95 |
|---|---|---|---|---|---|
| #1 opening (code push on L01) | .978 / .977 (.928 / .930) | .978 / .978 | .959 / .952 (.857 / .858) | .959 / .951 | pass |
| #2 seam (ICE camera on L08) | .967 / .969 (.845 / .845) | .962 / .968 | .953 / .953 (.872 / .872) | .953 / .955 | pass |
| #3 ignite (SEQ-HALL frame 0 vs the hall still) | **.953 / .951** (.935 / .935) | .951 / .953 | **.923 / .923** (.899 / .900) | .923 / .923 | **fails at 1024**, marginal at 1440 (unchanged) |
| tintype sun push (extra) | .981 / .981 | .982 / .984 | .979 / .978 | .978 / .978 | pass |

Ignite residual, as in round 1: tone-matched SSIM .960 / .957 (1440 css / gl) and .938 / .939 (1024), mean luma −2.3,
shift < 0.4 px: content, not tone or geometry.

**FIG drift (the ICE push, p .50 → .66)**: the plate's measured scale follows the camera (1.1118 measured vs 1.1117
expected at p .66, 1440 css). **FIG residual: max 0.64 px (css) / 0.49 px (GL) at 1440** (r1 0.42 / 0.86), **1.08 /
1.09 px at 1024** (r1 0.88 / 0.97); DOM cross-check 0.45 / 0.85 px at 1440, 0.68 / 0.69 px at 1024. **Bar ≤ 2 px:
pass.** GL vs css frames of the seam at the same p: SSIM .996–.999, shift 0.00 px, scale 1.0000.

**P3-5 #3 verdict: unchanged from round 1. 1440 PASS (ignite marginal); 1024 FAIL on #3 only (.923).** The tintype card
still engages the GL tier by itself headless on the default URL (`R/hooks/hooks-{1440,1024}.json`: tier gl, data-gl on).

### Keyboard (`tools/capture/probes/keyboard.mjs`)

Keyboard only (Tab, Shift+Tab, Enter, Space, Esc, arrows, typed words, Ctrl+K, and reloads; no click, `focus()` or
`blur()`), inside the full probe runs: **FAIL at 1440 and 1024 on one check, `op.compass`; every other check passes**
(round 1: PASS at both widths). **The failure is the probe's selector, not the toy.** Since `21674b2` the hero carries
a static Jack's compass (`hero-section.tsx`: aria-hidden, no needle attribute), which is now the first
`[data-instrument="jack-compass"]` on the page; the probe reads that one (`Number(null)` = 0) instead of About's.
Checked on the same build with a one-off read (`R/probes-diag/diag-1440.json` → `compass`): three instruments (top,
about, journey); About's toy settles 275.0° at rest → 45.3° after a press → 225.0° after → (round 1, through the
probe: rest 275, Enter 45, → 225). The same selector fails `toys.compass` (and `toys.rm.compass` under `--rm`).
- Walk: 73 Tab stops from the top to the wrap at both widths (round 1: 71; the two new stops are the "Systems" and
  "kill-list" links in the new films invitation, `copy.films.play`); 0 stops off-view, 0 covered.
- Operated where the walk reaches them, in Tab order (stop numbers at 1440): hunt chip 4, sound 5, Pause 6 (no count,
  no toast), menu 7, coin 21, kraken 22, Run 25, chalk heart 28, drone 34 (flies with focus in the field; → moved it
  128 px at 1440, 269 at 1024; round 1 245 / 266), Dead Eye 35 (5/5, focus back), pen 36 ("Worthy."), eagle 61,
  bone 63, fire 64, Lumos 68 (all 29 candles lit), Snitch 71. Fast lane (stop 3) → `#work-title`; director's cut
  (stop 9) → focus on ■ Stop, Esc stops it; chapter tile → `#act-2-title`.
- Typed: "parley", "aal izz well", "nox" → "lumos", "I solemnly swear" (Map opens with focus inside, Esc closes in
  12 / 22 ms); palette Ctrl+K "solemn" opens the Map; Ctrl+K "Fly the homemade drone" focuses the pill without a
  take-off.
- **All 12 eggs counted by keyboard alone** at both widths.
- Round 1's finding is fixed: after **palette → Map → Esc**, focus now lands on a link (`a`), not `<body>`, at both
  widths and under reduced motion.
- Reduced motion (`R/probes-1440-rm-keyboard/p3-probes.json`, the RM-aware run): the same one failure (`op.compass`,
  the selector); otherwise as round 1: 70 stops (round 1 68: the same two links), 12 eggs, sound toggle disabled, the
  drone shows its flight plan, no candle toy, the cut never starts.

### Probe runs (`p3-probes.mjs`, all 21, both widths, and `--rm`): round 2 against round 1

| run | r2 pass | r1 pass | failing in r2 (r1 in brackets) |
|---|---|---|---|
| 1440 | **12 / 21** | 19 / 21 | cinema, games, hunt, keyboard, layout-gates, loaf, spotlight, toys, words (r1: games, loaf) |
| 1024 | **13 / 21** | 20 / 21 | cinema, hunt, keyboard, layout-gates, loaf, spotlight, toys, words (r1: loaf) |
| 1440 `--rm` | 12 / 21 (+ nav, words skipped) | 13 / 21 | font-network, hunt, keyboard, layout-gates, plates-live, split, toys; nav and words skip (r1: font-network, keyboard, loaf, nav, plates-live, split, words) |
| 1440 `--rm --only=keyboard` | 0 / 1 | 1 / 1 | keyboard (`op.compass` only) |

The new failures read the same at both widths. What each one is (from the probe JSON, the code of `21674b2`, and the
one-off read `R/probes-diag/diag-1440.json` on the same build; "drift" = the page changed on purpose in round 1 and
the probe still checks the old behaviour; the probes themselves were not changed in this capture):
- **hunt (drift).** The chip now reads "Egg hunt 0/12" (`egg.hunt.chip.word`, r1 F6). The probe compares the chip's
  whole text with "N/12": all 8 failing checks (`ssr` "Egg hunt", `hydrate` "Egg hunt0/12", `typed`, `sync`,
  `obliviate`, `eggsoff`, `reset`, `complete`) compare that text. The behaviour under them holds: `typed` found pc-parley, toast "Egg 1 of 12", tick; `complete` gold, 12 credit rows, SEEKER aside.
  Diag: server markup "Egg hunt | –/12", hydrated count span "0/12".
- **toys.compass, keyboard op.compass (drift).** The hero's static compass (above). About's toy works.
- **words.scrub (drift).** r1 F1 made a scrubbed sentence complete when the reader stops and never re-dim
  (`scrub.ts`: "it never re-dims"); the probe still expects "dim again when scrolled back" (`backFirst` 1, expected
  ≈ .28). `ssr`, `rm`, `phone`, `fly`, `titles`, `identical` and `pause` pass.
- **spotlight (drift, by code reading).** r1 rewrote the arbiter (`lib/spotlight-impl.ts`: a scroll star owns inside
  its performance window and performs only while the page moves or when `live`). The probe's synthetic tests assume the
  old rule (a still star in the middle 60 % blocks). Failing: 1440 `start`, `queue`, `idle`, `pause`; 1024 `own`,
  `free`, `idle`, `pause` (`own` / `pause` answer "play" where they expect a wait). Its quiet-spot and `idle` searches read `st.top` / `st.bottom`, which the new star records no longer carry (they carry
  `a` / `b`), so `idle` finds "no 600 px stretch" at both widths. The real-page check (`page`: no two grants at
  once) passes at both widths. Diag: in a fresh view, y 1800 has no owner (the probe's `start` at 1440 read B02 there).
- **cinema.letterbox (not reproduced).** Inside the probe's sequence `html[data-letterbox]` never flipped (flips 0)
  at either width. In a fresh view the bars work (diag `letterbox`): on from frame top 120 % to 30 %, scaleY 1 at frame
  top 80–70 %, open as the centre goes 92 % → 52 % (the r1 F2 timing). Open question for the triage: the probe's
  earlier steps (the director's-cut button, the films walk) or its jump positions after the new films bill.
- **layout-gates.pausedReload (looks real; not diagnosed).** A paused reload (sessionStorage `motion=paused`) at
  1440×900 reflows after hydration: the streamed server layout and the layout 3 s later differ (page 39,852 px streamed
  vs 39,759 px 3 s later; the first boxes that moved or resized: #about, #journey, #act-2 …). Round 1: identical
  (39,779 both). Under `--rm` the same check differs more (39,852 vs 37,754 px; #journey is 1,204 px tall 3 s after
  load, 3,209 px in the default run's paused reload). `pauseMid` (Pause pressed mid-scroll:
  shift 0, boxes identical), `noJs`, `phone`, `rm` and `zScale` pass.
- **games.inp (1440 only, as round 1).** One 272 ms pointerdown with 5 ms input delay (round 1: a 688 ms keydown);
  1024 passes (176 ms keyup). SwiftShader raster waits (W3.md §3).
- **loaf (as round 1).** Intro warm-up, by duration: 15 / 16 frames > 50 ms (round 1 25 / 22), worst main-thread work
  8 / 2 ms (round 1 12 / 14): raster waits. Under `--rm` it now passes (round 1 failed by design).

---

## 2. Judges: exactly which files

Give each judge only its own list. Judges get images and the JSON / Markdown named here, never the repo, the build
notes, the spec or anything from round 1 (the PANEL's tempo answers are scored against PHASE3-SPEC §2.2 by the
assembler, not shown to them). Sheets are 1600 px wide (2 clips per row, 4 frames per clip at 1/8 3/8 5/8 7/8 of the
clip, its label burned in). File names and counts match round 1's, so a round-1 finding can be looked up at the same
place in round 2 (by section and time; clip numbers shift by the run's own timing).

### J1 STAR · one star per screen (1 s clips, both profiles, both widths)
- Reader 1440: `R/screencast/reader-1440/sheets/sheet-01.jpg … sheet-26.jpg` (252 clips; clips 1–12 are the intro)
- Reader 1024: `R/screencast/reader-1024/sheets/sheet-01.jpg … sheet-24.jpg` (239 clips; 1–12 intro)
- Skimmer 1440: `R/screencast/skimmer-1440/sheets/sheet-01.jpg … sheet-11.jpg` (106 clips)
- Skimmer 1024: `R/screencast/skimmer-1024/sheets/sheet-01.jpg … sheet-08.jpg` (79 clips)
- The machine record per clip (t, scrollY, section, stars per the spotlight, overlap, row, declared breath, frame
  timings): `R/screencast/{reader,skimmer}-{1440,1024}/clips.json` (`clips[i]` = clip #i+1 on the sheets).
- Geometry only (the beat boxes; not a motion record): `R/beats/beats.json`.
- Label key: `#n m:ss y<scrollY> <section>` left; right: `★<beat>·w<weight>` per spotlight star, `(+id unreg.)` for a
  declared scroll star that never registered, `breath after Bnn` inside a declared breath, a red band for `NO STAR`
  (outside a breath) or `2+ AT ONCE`. The judge counts what it SEES; the labels are the machine's claim to check against.
- Score: per clip "stars seen" (0 / 1 / 2+), flag every 0 outside a breath and every 2+; findings
  `{screen, t, clip, finding, severity}`. The automated numbers are §1 above.

### J2–J4 PANEL · would you keep scrolling · tempo · game discovery (the reader capture, per screen)
- Reader 1440: `R/screencast/reader-1440/sheets-panel/sheet-01.jpg … sheet-13.jpg` (2 s clips, labels = clip, time,
  `screen N` = scrollY / viewport + 1; no star or beat annotation; sheet 1 = the play screen → flight → name hand-off)
- Reader 1024: `R/screencast/reader-1024/sheets-panel/sheet-01.jpg … sheet-12.jpg`
- `R/screencast/reader-{1440,1024}/clips-panel.json` maps each 2 s clip to its screen (`clips[i].screen`) for the
  per-screen yes/no; the hand-off = the clips labelled "opening" plus screen 1; the four cards and the first Work
  screen are found by the assembler from `clips.json` `section` (act-1…act-4, work).
- The reader's input: 250 px/s as 50 px wheel notches (Lenis on), a 2 s stop at each h2 and at each act card's settle,
  the intro played (Play clicked after 2.5 s, untouched until the titles end). For the assembler only (never tell
  the judges): game discovery = the hunt chip ("0/12") in the header from screen 1 and the toy invites B08 compass,
  B18 Run, B26 Take off, B28 Dead Eye (their screens are in `clips.json` `row`).
- Optional context for the panel (static frames, not motion): `R/scenes/1440/sheet-01.jpg … sheet-08.jpg`,
  `R/scenes/1024/sheet-01.jpg … sheet-08.jpg` (captioned D/A frames; `sheets.json` lists the frames per sheet).

### J5–J7 STRANGERS · blind stranger test · hooks (ONLY these folders; neutral ids, no URL, film or person in any name)
Give the folders in this order (a judge must finish the blind set before it sees any text). Use judges who did not
see round 1's sets; the ids were reshuffled (no id repeats a round-1 pairing), so a round-1 answer key is useless here.
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
  `R/scenes/{1440,1024}/manifest.json`. Score (one command per set, verdicts in `<prefix>1.json … 3.json`):
  `node tools/capture/score.mjs --kind=blind --key=R/keys/blind-1440-key.json --manifest=R/scenes/1440/manifest.json --verdicts=<dir>/blind-1440-j --width=1440 --out=… --md=…`
  (`--kind=captioned` with the read keys, `--kind=hooks` with the hook keys). The blind per-world bar is printed
  against the pre-Phase-3 score (M5 final: Pirates 10/10, 3 Idiots 9/10, RDR2 9/13, HP 10/12). Round 1's verdicts are
  in `R1/verdicts/` (score them with round 1's keys only).
- Named copies of the hook frames for the assembler / panel: `R/hooks/{1440,1024}-{css,gl}/<card>-p05.jpg`,
  `R/hooks/hooks-{1440,1024}.json` (damped p, tier, data-gl per frame).

### J8 SMOOTH · smoothness
- `motion.js` tables: `R/motion/1440/summary.md`, `R/motion/1024/summary.md` (runs intro, desktop = Lenis default,
  native = `?skip=smooth`, alt, rm, gl = `?gl=force`; per-section, act-card transitions, idle probe, LoAF, CLS, pops);
  raw numbers `R/motion/{1440,1024}/motion.json`; strips `R/motion/{1440,1024}/strips/*.jpg` (intro, landing, first
  60 s per run, the four act cards, the pops). Round 1: `R1/motion/{1440,1024}/summary.md`. Baseline (P3-0):
  `docs/build/motion-strips/p3-before/summary.md`.
- Skimmer frame timings (headed, Lenis on, the same seeded flings as round 1): `R/screencast/skimmer-{1440,1024}/screencast.json`
  (`summary.raf`, `summary.loaf`, `raf` = [t, dt, scrollY] per frame, `loaf`) and per clip `clips.json` (`fps`,
  `p95`, `maxDt`, `loaf50`); the reader's and the director's cut's the same way.
- Warm-up LoAF probe: `R/probes-{1440,1024}/p3-probes.json` → `results.loaf`.
- Targets: PHASE3-SPEC §12.1 (headless relative row) and §4.4 (intro). Headline (headless; each cell **r2** · r1):

| measure (§12.1 headless relative; §4.4 intro) | target | 1440 **r2** · r1 | 1024 **r2** · r1 |
|---|---|---|---|
| desktop (Lenis default) fps / p95 | ≥ 15.2 (target 18) / ≤ 316.7 ms | **14.8** / 233.3 · 17.0 / 200.1 | 21.7 / 150 · 23.4 / 133.3 |
| desktop pops / CLS | ≤ 12 / 0 | 4 / **0.006** · 10 / 0.0196 | 6 / **0.0133** · 12 / 0.0435 |
| work · principles · journey · kill-list fps (desktop) | ≥ 4.8 · 4.95 · 5.25 · 5.85 | 19.7 · **4.2** · 7.6 · **5.4** · 14.7 · 4.9 · 7.2 · 12.3 | 34.1 · 19.1 · 9.9 · 11.2 · 24.1 · 7.1 · 10.8 · 16.2 |
| native (`?skip=smooth`) fps / p95 / pops / CLS | judged separately | **8.1** / **433.3** / **52** / 0.0173 · 10.2 / 333.3 / 42 / 0.0204 | 14.0 / 250.1 / **40** / 0.0149 · 16.1 / 250 / 35 / 0.0321 |
| native principles · journey fps | ≥ 4.95 · 5.25 | **3.1** · **4.1** · 2.0 · 7.5 | **4.0** · 5.8 · 3.6 · 4.6 |
| gl (`?gl=force`) fps / p95 / pops / CLS | judged separately | 16.1 / 200.1 / 7 / 0.0141 · 18.7 / 183.4 / 8 / 0.0171 | 22.9 / 133.3 / 11 / 0.0139 · 25.8 / 116.5 / 5 / 0.0438 |
| alt fps / p95 / pops | — | 14.2 / 250 / 5 · 14.8 / 266.7 / 21 | 22.6 / 133.3 / 11 · 21.4 / 183.3 / 13 |
| intro fps / p95 | ≥ 29.5 / ≤ 116.6 ms | **20.8** / **116.7** · 20.2 / 116.7 | 31.8 / 66.7 · 33.6 / 66.7 |
| intro LoAF > 50 ms, warm → titles-end (by duration) | none | **45** (max 657 ms, blocking 25) · 38 (586, 17) | **25** (max 405, blocking 24) · 27 (336, 30) |
| rm fps / CLS | — / 0 | 59.7 / 0 · 57.4 / 0.061 | 59.8 / 0 · 58.6 / 0.1164 |
| skimmer screencast rAF fps / p95 / > 50 ms (headed, with readback) | relative | 9.2 / 233.4 / 86.9 % · 9.6 / 233.3 / 87.5 % | 13.1 / 166.7 / 55 % · 12.8 / 183.4 / 56 % |
| reader screencast rAF fps / p95 / > 50 ms (headed) | relative | 15.8 / 150 / 53.4 % · 17.0 / 133.3 / 46.4 % | 21.9 / 100.1 / 23.1 % · 23.6 / 99.9 / 19.6 % |
| desktop lab LCP (qa.js, 3 loads) | ≤ 400 ms | **772 / 624 / 280** · 800 / 204 / 704 | **748 / 904 / 748** · 688 / 716 / 732 |

Bold = misses its target (or is a regression to look at). Read the rows as one run each on a shared software
rasteriser: run-to-run spread was not measured this round, and a section row rests on few frames (desktop kill-list:
12 frames at 1440 in r2, 27 in r1; principles 17 / 15), so a single section's fps can move by half between two runs
without a code change. What moved beyond that: the desktop and gl runs at 1440 are 12–14 % slower overall (17.0 →
14.8, 18.7 → 16.1 fps), the native run's pops rose at 1440 (42 → 52), the intro warm-up's LoAF count rose at 1440
(38 → 45), and the 1024 principles section is faster in every Lenis run (7.1 → 19.1 desktop). What improved: the
round-1 CLS (P3-2 #7, the world-font swap under the scrubbed sentences) is down from 0.0196 / 0.0435 to 0.006 / 0.0133
on the desktop run, the reduced-motion layout shift (about/journey, 0.061 / 0.1164) is gone (0 / 0), and the alt run's
pops fell (21 → 5 at 1440). The §4.4 rows that need the intro trace (`#intro` repaints, landing raster, hand-off
script time, the name's frame) are not in motion.js's standard output and were not re-measured this round.

### J9 HONEST · honesty + a11y
- `npm run check`: `R/honest/check.txt` (exit 0, 66 warnings; round 1 the same). `RELEASE=1 npm run check`:
  `R/honest/release.txt` (exit 1 with 46 errors, as round 1: 40 Check L2 countersignatures, 5 TTS approvals in
  SOUNDS.md, and the unsigned copy, now 104 strings (round 1: 102; the two new ones are r1's `copy.films.play` and
  `copy.egg.hunt.chip.word`, page microcopy, proposed and unsigned); all DP-9 items for Aryan). New line in both: the
  spotlight check (26/26 scroll stars with a performance window; the six derived breaths). Beats: 91 declared (70
  stars) on 20 items (round 1: 82 / 60).
- Research-font probe, AA probe, layout gates (Pause mid-scroll shift; the paused reload), sound, lenis (Pause ≤ 100
  ms), decoder: `R/probes-1440/p3-probes.json`, `R/probes-1024/p3-probes.json` → `results.research-font`,
  `results.aa-scrim`, `results.layout-gates`, `results.sound`, `results.lenis`, `results.decoder`. All pass at both
  widths except `layout-gates` (its paused-reload run reflows after hydration; §1 "Probe runs"); Pause mid-scroll:
  shift 0, boxes identical, scroll kept, at both widths.
- RM run (no motion, no sound, 0 video bytes): `R/probes-1440-rm/p3-probes.json` (the 10 RM-aware probes of the W3
  set: bundle, cards, cinema, games, gl, lenis, sound, spotlight pass; hunt fails on its chip-text check only and
  toys on the compass selector only, both drift, §1), motion.js `rm` rows in `R/motion/{1440,1024}/summary.md`
  (59.7 / 59.8 fps, CLS 0 at both widths; round 1 0.061 / 0.1164), the RM frames
  `R/scenes/{1440,1024}/rm-01.jpg … rm-03.jpg`, qa.js `R/qa/qa-{1440,1024}.json` (`motion`, `lenis`).
- Keyboard-only pass: `results.keyboard` in `R/probes-{1440,1024}/p3-probes.json` (§1 above; `walk` lists every Tab
  stop in order) and under reduced motion `R/probes-1440-rm-keyboard/p3-probes.json`.
- qa.js (anchors, overflow at 320/390/1024/1440, no-JS, media blocked, LCP, console / hydration):
  `R/qa/qa-{1440,1024}.json`.
- The one-off read behind the probe diagnosis (compass instruments, the chip's markup, the letterbox walk, the
  spotlight owner by height; fresh views of the same build, 1440×900): `R/probes-diag/diag-1440.json`.

### Automated · no dead screen
- `R/beats/beats.json`, `R/deadscreen.json` (§1 above), with the static strips `R/scenes/{1440,1024}/sheet-*.jpg`
  and the reader sheets for the rows named in §1.

### Director's cut (its own axis only: it dwells on stars and flatters the pacing; never show it to J1–J7)
- `R/screencast/director-1440/sheets/sheet-01.jpg … sheet-20.jpg` (2 s clips, labels as J1's), `clips.json`,
  `screencast.json` (the cut ran top → end by itself in 397 s: `drive.endedBy = "cut ended"`, y 43,717; round 1 394 s,
  y 43,650).

### Phones (unchanged in Phase 3; for the 390 regression eye only)
- `R/scenes/390/sheet-01.jpg`, `sheet-02.jpg` (31 frames at 390×844), `R/scenes/390/checks.json` (0 console errors,
  0 overflow).

---

## 3. What ran, what did not

All on one machine, one browser at a time, against `http://localhost:3161` (the `dedd0f1` build, `next build` at
00:07 UTC on 2026-10-04; no source file newer than the build). Logs: `R/logs/*.log` (round 1's set plus `beats.log`).

**Two sessions.** The capture ran in two sittings on the same build. Sitting 1 (2026-10-04 00:07–01:36 UTC): the
build, beats, the five screencasts back to back then their clips and sheets, scenes, hooks, drift, motion at both
widths, the stranger sets and keys, and the full probes at 1440 (01:14–01:36). It stopped on a usage limit during the
1024 probe run (its `aa-scrim` died with the browser; nothing of it is kept). Sitting 2 (20:12–20:58 UTC, after a
container restart; the same `.next` build served again): the full 1024 probes from scratch, the `--rm` set, the RM
keyboard run, qa.js at both widths, the probe diagnosis read, then `npm run check` and `RELEASE=1 npm run check` with
the server stopped. Nothing ran in parallel with a browser in either sitting.

| capture | command (abridged) | result (r2 · r1) |
|---|---|---|
| beats | `beats.mjs --widths=1440,1024 --out=R/beats` | 0 gaps, 0 missing, 0 short spans at both widths (r1 the same); 89 beat elements (r1 80) |
| reader / skimmer screencasts | `screencast.mjs --profile=reader\|skimmer --vw=1440x900\|1024x768 --out=R/screencast/<p>-<w> --raw=R/raw/screencast/<p>-<w>` → `clips.mjs` (+ `--clip=2 --plain --name=panel` for the reader) | reader 237.0 / 223.9 s of scroll (r1 239 / 224), skimmer 105.8 / 78.1 s (r1 101 / 78); 0 page errors; Lenis on in all four |
| director's cut | `screencast.mjs --profile=director --vw=1440x900` → `clips.mjs --clip=2` | ran top → end on its own in 397 s (`endedBy` "cut ended"; r1 394 s) |
| scenes | `scenes.js --only=desktop,intro,alt,rm` at 1440 and `--vw=1024x768`; `--only=mobile` (390×844) | 118 / 118 / 31 frames (r1 the same); 0 console errors, 0 overflow; every act card fits the viewport; → `sheet.mjs` sheets |
| stranger sets | `anon.mjs` (blind: `--manifest … --modes=BLIND`; read: `--mode=captioned --match=…`; hooks: `--mode=frames`), new seeds | 39 + 37 blind, 17 + 17 read, 8 + 8 hooks (r1 the same frames); 0 ids repeat a round-1 pairing (checked key against key) |
| card hooks | `hooks.mjs --vw=… --tiers=css,gl` (p .05) | 4 cards × 2 tiers × 2 widths; GL engaged on every GL-tier card; the tintype engages GL by itself on the default URL (as r1) |
| motion | `motion.js --runs=intro,desktop,native,alt,rm,gl` at 1440 and `--vw=1024x768` | see J8 |
| drift | `drift.mjs --tiers=css,gl` at 1440 and 1024 | see §1 (1440 PASS, 1024 FAIL on #3 only; as r1) |
| probes | `p3-probes.mjs` (all 21, `--timeout=1200000`) at 1440, `--vw=1024x768`, and `--rm` at 1440; then `--rm --only=keyboard` | 1440: 12 / 21 (r1 19); 1024: 13 / 21 (r1 20); `--rm`: 12 / 21 with nav and words skipped (r1 13); RM keyboard: fails `op.compass` only (r1 PASS). Of the new failures, hunt, toys, keyboard, words and spotlight are probe drift (the probes check pre-round-1 behaviour or pick the hero's new compass), cinema.letterbox does not reproduce in a fresh view, and layout-gates' paused reload looks like a real reflow; §1 "Probe runs" |
| qa | `qa.js` at 1440 and `--vw=1024x768` | both widths: 0 hydration errors, 0 console errors outside the deliberate media-blocked context (69 / 68 there), 52 anchors 0 broken (r1 50), no horizontal overflow at 320 / 390 / 1024 / 1440, no-JS h1 = 1 and no hidden text, media blocked: 19 sections / 35 captions / h1 1, RM and Pause: 0 running animations and 0 playing videos in 11 sections, Lenis gone after Pause; LCP desktop 772 / 624 / 280 ms (1440) and 748 / 904 / 748 ms (1024) against the ≤ 400 ms budget (r1 800 / 204 / 704 and 688 / 716 / 732), mobile 1.33–1.39 s (1440 run) and 1.59–2.09 s (1024 run) (r1 1.33–1.85) |
| probe diagnosis | a one-off read script (not a tool; not committed): fresh 1440×900 views of the same build | `R/probes-diag/diag-1440.json` (§1 "Probe runs") |
| keyboard | inside the full probe runs at 1440 and 1024, and the RM-aware `--rm --only=keyboard` run | see §1 |
| check | `npm run check`, `RELEASE=1 npm run check` | exit 0 (66 warnings) / exit 1 on DP-9 items only (46 errors; as r1) |

**Caveats.**
- The screencasts' frame times are lower than motion.js's (screencast readback under SwiftShader); compare a
  screencast with a screencast. This round no other job overlapped a recording.
- `deadscreen.mjs` and the J1 numbers read the spotlight log: a host that animates without the spotlight is invisible
  to the log; this round every declared scroll star registered in the reader runs, so the "with declared" column
  equals the plain one there.
- motion.js / probes are headless SwiftShader: INP and LoAF-by-duration readings are raster waits (W3.md §3). Every
  motion.js number is a single run (§2 J8).
- The probes were run as they stand at `dedd0f1` (only `keyboard.mjs` changed in round 1): their drift is reported,
  not fixed, so that a round-2 probe number reads against the same probe code as round 1's.
- The build was not re-run in sitting 2: the `.next` build of sitting 1 (from `dedd0f1`, clean tree) served both
  sittings, so every round-2 capture saw the same bytes.

## 4. Tools

Unchanged from round 1 (`R1/MANIFEST.md` §4) except the round-1 fixes' own edits in `21674b2`: `clips.mjs` (a scroll
star counts while the page moves inside its window, unless `live`; breaths after each weight-3 star), `deadscreen.mjs`
(a row that begins inside a breath is a rest) and `probes/keyboard.mjs` (accessible names). No tool was changed in
this capture.
