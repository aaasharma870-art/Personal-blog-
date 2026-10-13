# P3-11 round 1 · capture manifest (judge inputs)

2026-10-03 · branch `design/three-films` · app build of HEAD `5ef0d47` (the W3 gate; no app code changed since) served by
`next start -p 3161` · tools from the P3-11.0 commit (`tools/capture/`). Every path below is relative to the repo root.
`R` = `docs/build/motion-strips/p3-r1`.

**Machine.** 4 CPUs, no GPU: Chromium 141 rasterises in software (SwiftShader). Absolute frame times are pessimistic
against a real laptop; read them as relative (the P3-0 baseline `docs/build/motion-strips/p3-before/summary.md` was
taken on the same kind of machine). The screencasts run **headed Chrome under `xvfb-run`** (labelled in every
`screencast.json` as `meta.browserMode`); a 15 s A/B on the skimmer gave headed 11.0 fps vs `--headless=new` 9.4 fps, so
headed is not the slower mode here. motion.js, scenes.js, the probes and qa.js run headless as before.

**Not committed (local only, regenerable).** `R/raw/`: the screencast videos (`raw/screencast/*/video.mp4`) and frames,
the per-clip strips (`raw/screencast/*/clips/clip-NNNN.jpg`, 4 frames each, 1280 px), the scenes.js PNGs, the motion.js
frame dumps and full-size strips, the drift / hooks PNGs, qa.js shots. Probe PNGs are ignored by `.gitignore`.

---

## 1. Automated numbers

### J1 (one star per screen): the spotlight log, per 1 s clip

Source: `?debug=spotlight` (`window.__spotlight.log`) recorded in each screencast; `tools/capture/clips.mjs` turns it into
stars per clip (a scroll star from `own` to the next `own`/`free`; a time star from `grant` to `end`/`release`).
`2+ at once` counts a clip where two stars are active at the same instant (`overlapMs` = how long). The intro clips
(play screen → titles → quiet window, 13 per reader run) are outside the page rules and are not counted.
"With declared" adds the declared scroll stars that never registered with the spotlight in the run (B02 hero, B09
match cut, B10 / B11 voyage scrub, B54 ribbons) while their box crosses the middle 60 %.

| run | clips (intro) | exactly one star | 2+ at once (≥ 100 ms) | star-less outside a declared breath | star-less in a breath | with declared: one / 2+ / star-less outside |
|---|---|---|---|---|---|---|
| reader 1440 | 252 (13) | 132/239 = **55.2 %** | **5** (4) | **85** (35.6 %) | 17 | 63.2 % / 8 / 63 |
| reader 1024 | 237 (13) | 128/224 = **57.1 %** | **0** (0) | **81** (36.2 %) | 15 | 64.3 % / 3 / 62 |
| skimmer 1440 | 102 (0) | 67/102 = 65.7 % | 6 (5) | 24 (23.5 %) | 5 | 72.5 % / 10 / 13 |
| skimmer 1024 | 79 (0) | 63/79 = 79.7 % | 1 (0) | 13 (16.5 %) | 2 | 87.3 % / 4 / 4 |
| **reader, both widths** | 463 page clips | **260 = 56.2 %** (bar ≥ 90 %) | **5** (bar 0) | **166** (bar: none outside a breath) | 32 | 63.7 % / 11 / 125 |

The 2+ clips (spotlight log): reader 1440 #33–35 `B08-compass` hold + `B08` scrub (1,000 ms in #34), #85–86
`B21-circle` hold + `B21` scrub (369 / 262 ms); skimmer 1440 #20 `B12` + `B13` (95 ms), #28–29 `B18` + `B19` (469 / 569
ms), #56 `B34-finale` + `B35` (376 ms), #76–77 `B45` + `B46`/`B47` (278 / 309 ms); skimmer 1024 #23 `B17` + `B19`
(51 ms). Mechanism (from the log): a time star's hold (≤ 1.2 s) is still running when the reader scrolls a scroll
star into the middle band; the arbiter refuses a grant while a scroll star owns, but nothing stops a scroll star from
taking ownership during a hold. Star-less clips outside a breath, by section (reader 1440): journey 14, writing 10,
optuna-screener 8, systems 7, kill-list 7, principles 6, credits 6, top 5, work 5, experiment 5, contact 5, films 3,
beyond 3, about 1 (`totals.noneOutsideBreathBySection` in each `clips.json`).

Declared breaths = the ⟂ rows of PHASE3-SPEC §2.3 (B06, B07, B16, B31, B39, B40, B52), placed on each run's geometry.

### No dead screen (automated)

`R/beats/beats.json` (`beats.mjs --widths=1440,1024`): **0 gaps > 100vh, 0 declared-but-missing, 0 scroll-star spans
< 300 px at both widths** (page 4,950.2vh @1440, 5,366.8vh @1024). `R/deadscreen.json` (`deadscreen.mjs`, the §2.4
stretches against the reader runs): **8 of 11 stretches show their fill in the spotlight log at both widths**; the
three that do not:
- **D1** (program tail → About): row B06 (the course plot, a time star) is never requested from the spotlight.
- **D4** (trading-algos): B20 (the schematic ink, w2) is skipped every time: `maxWait 1500 ms` while B19 (the window
  arrival) owns the screen.
- **D10** (writing): B45 (the horse fly-through) is skipped: `host left the viewport` before a scroll-idle.
The check reads the log only: a host that animates without asking the spotlight reads as "no play", so the J1 / panel
sheets of those rows are the visual check (reader 1440 sheets 3, 9 and 20; reader 1024 sheets 3, 8 and 19).

### P3-5 #3 registration and FIG drift (`tools/capture/drift.mjs`)

`R/drift/drift-1440.json`, `R/drift/drift-1024.json`; the settle | push pairs `R/drift/reg-<w>-<tier>-<card>.jpg`.
**Registration** = the card frame's picture at p .497 (the settle) against p .503 (star (b) has begun), SSIM after
Wang's standard downsampling, with the push's own first step (scale ≈ 1.002) undone (`ssimAligned`, the verdict); the
noise floor (the settle against itself 1 s later) is 1.000 everywhere, so every change is the push start.

| push-in | 1440 css / gl (aligned; raw) | 1024 css / gl (aligned; raw) | bar ≥ .95 |
|---|---|---|---|
| #1 opening (code push on L01) | .978 / .978 (.930 / .930) | .959 / .951 (.857 / .861) | pass |
| #2 seam (ICE camera on L08) | .962 / .968 (.845 / .845) | .953 / .955 (.872 / .872) | pass |
| #3 ignite (SEQ-HALL frame 0 vs the hall still) | **.951 / .953** (.935 / .935) | **.923 / .923** (.899 / .900) | **fails at 1024**, marginal at 1440 |
| tintype sun push (extra) | .982 / .984 | .978 / .978 | pass |

The ignite residual is content, not tone or geometry: tone-matched SSIM .957 / .938 (1440 / 1024), mean luma −2.3,
the measured shift < 0.5 px. The raw values drop most on the seam (.845) because the camera's first step blurs the
chalk detail; that is the push itself, not a jump.

**FIG drift (the ICE push, p .50 → .66, before the title mask opens)**: the plate's measured scale follows the camera
(1.1118 measured vs 1.1117 expected at p .66, 1440 css). **FIG residual after the plate's motion: max 0.42 px (css) /
0.86 px (GL) at 1440**, 0.88 / 0.97 px at 1024; DOM cross-check (the FIG paths' box mapped through the plate
transform) 0.73 / 0.87 px at 1440. **Bar ≤ 2 px: pass.** GL vs css frames of the seam at the same p: SSIM .995–.999,
shift 0.00 px, scale 1.0000.

**P3-5 #3 verdict: 1440 PASS (ignite marginal); 1024 FAIL on #3 only.** Observation: on the default URL (no
`?gl=force`) the tintype card engages the GL tier by itself headless, while the other three stay css (drift and hooks
both log it).

### Keyboard (`tools/capture/probes/keyboard.mjs`)

Keyboard only (Tab, Shift+Tab, Enter, Space, Esc, arrows, typed words, Ctrl+K, and reloads; no click, `focus()` or
`blur()`), inside the full probe runs: **PASS at 1440 and 1024**.
- Walk: 71 Tab stops from the top to the wrap at both widths; 0 stops off-view, 0 stops covered by another element
  (the element under the focused box's centre).
- Operated where the walk reaches them, in Tab order (stop numbers at 1440): hunt chip 4 (panel opens, Esc closes,
  focus back), sound 5, Pause 6 (pauses and resumes; no count, no toast), menu 7, compass 16 (Enter spins and settles
  on a pillar bearing 45°, → steps to 225°), coin 21, kraken 22, Run 25 (3i-quad counts), chalk heart 28, drone 34
  (Enter flies with focus in the field, → moves it 157 px, Esc lands with focus back on the pill), Dead Eye 35 (focus
  on the first killed row, Enter / ↓ marks 5, Shift+Enter fires 5/5, Esc releases, focus back), pen 36 (after the Dead
  Eye win: counts, "Worthy."), eagle 59, bone 61, fire 62, Lumos 66 (all 29 candles lit; never armed dark, since a
  keyboard visitor never moves the pointer), Snitch 69. Fast lane (stop 3) → focus on `#work-title`; director's cut
  (stop 9) → starts with focus on ■ Stop, Esc stops it; chapter tile (menu → act-2) → focus on `#act-2-title`.
- Typed: "parley", "aal izz well", "nox" (pauses) → "lumos" (resumes), "I solemnly swear" (the Map opens with focus
  inside, Esc closes it in 9 ms); palette Ctrl+K "solemn" lists "Open the Marauder's Map" and opens it; Ctrl+K "Fly the
  homemade drone" focuses the pill without a take-off.
- **All 12 eggs counted by keyboard alone** at both widths.
- Finding: after **palette → Map → Esc**, focus lands on `<body>` (the opener was the palette's input, gone by then);
  the typed path returns focus to where it was.

---

## 2. Judges: exactly which files

Give each judge only its own list. Judges get images and the JSON / Markdown named here, never the repo, the build
notes or the spec (the PANEL's tempo answers are scored against PHASE3-SPEC §2.2 by the assembler, not shown to them).
Sheets are 1600 px wide (2 clips per row, 4 frames per clip at 1/8 3/8 5/8 7/8 of the clip, its label burned in).

### J1 STAR · one star per screen (1 s clips, both profiles, both widths)
- Reader 1440: `R/screencast/reader-1440/sheets/sheet-01.jpg … sheet-26.jpg` (252 clips; clips 1–13 are the intro)
- Reader 1024: `R/screencast/reader-1024/sheets/sheet-01.jpg … sheet-24.jpg` (237 clips; 1–13 intro)
- Skimmer 1440: `R/screencast/skimmer-1440/sheets/sheet-01.jpg … sheet-11.jpg` (102 clips)
- Skimmer 1024: `R/screencast/skimmer-1024/sheets/sheet-01.jpg … sheet-08.jpg` (79 clips)
- The machine record per clip (t, scrollY, section, stars per the spotlight, overlap, row, declared breath, frame
  timings): `R/screencast/{reader,skimmer}-{1440,1024}/clips.json` (`clips[i]` = clip #i+1 on the sheets).
- Geometry only (the beat boxes; not a motion record): `R/beats/beats.json`.
- Label key: `#n m:ss y<scrollY> <section>` left; right: `★<beat>·w<weight>` per spotlight star, `(+id unreg.)` for a
  declared scroll star that never registered, `breath Bnn` inside a declared breath, a red band for `NO STAR` (outside
  a breath) or `2+ AT ONCE`. The judge counts what it SEES; the labels are the machine's claim to check against.
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
Give the folders in this order (a judge must finish the blind set before it sees any text):
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
  against the pre-Phase-3 score (M5 final: Pirates 10/10, 3 Idiots 9/10, RDR2 9/13, HP 10/12).
- Named copies of the hook frames for the assembler / panel: `R/hooks/{1440,1024}-{css,gl}/<card>-p05.jpg`,
  `R/hooks/hooks-{1440,1024}.json` (damped p, tier, data-gl per frame).

### J8 SMOOTH · smoothness
- `motion.js` tables: `R/motion/1440/summary.md`, `R/motion/1024/summary.md` (runs intro, desktop = Lenis default,
  native = `?skip=smooth`, alt, rm, gl = `?gl=force`; per-section, act-card transitions, idle probe, LoAF, CLS, pops);
  raw numbers `R/motion/{1440,1024}/motion.json`; strips `R/motion/{1440,1024}/strips/*.jpg` (intro, landing, first
  60 s per run, the four act cards, the pops). Baseline (P3-0): `docs/build/motion-strips/p3-before/summary.md`.
- Skimmer frame timings (headed, Lenis on, fling peaks 2,400–3,260 px/s measured): `R/screencast/skimmer-{1440,1024}/screencast.json`
  (`summary.raf`, `summary.loaf`, `raf` = [t, dt, scrollY] per frame, `loaf`) and per clip `clips.json` (`fps`,
  `p95`, `maxDt`, `loaf50`); the reader's and the director's cut's the same way.
- Warm-up LoAF probe: `R/probes-{1440,1024}/p3-probes.json` → `results.loaf`.
- Targets: PHASE3-SPEC §12.1 (headless relative row) and §4.4 (intro). Headline (headless, this round):

| measure (§12.1 headless relative; §4.4 intro) | target | 1440 | 1024 |
|---|---|---|---|
| desktop (Lenis default) fps / p95 | ≥ 15.2 (target 18) / ≤ 316.7 ms | **17.0** / 200.1 | 23.4 / 133.3 |
| desktop pops / CLS | ≤ 12 / 0 | 10 / **0.0196** | 12 / **0.0435** |
| work · principles · journey · kill-list fps (desktop) | ≥ 4.8 · 4.95 · 5.25 · 5.85 | 14.7 · **4.9** · 7.2 · 12.3 | 24.1 · 7.1 · 10.8 · 16.2 |
| native (`?skip=smooth`) fps / p95 / pops / CLS | judged separately | **10.2** / **333.3** / **42** / 0.0204 | 16.1 / 250 / **35** / 0.0321 |
| native principles · journey fps | ≥ 4.95 · 5.25 | **2.0** · 7.5 | **3.6** · **4.6** |
| gl (`?gl=force`) fps / p95 / pops / CLS | judged separately | 18.7 / 183.4 / 8 / 0.0171 | 25.8 / 116.5 / 5 / 0.0438 |
| alt fps / p95 / pops | — | 14.8 / 266.7 / **21** | 21.4 / 183.3 / **13** |
| intro fps / p95 | ≥ 29.5 / ≤ 116.6 ms | **20.2** / **116.7** | 33.6 / 66.7 |
| intro LoAF > 50 ms, warm → titles-end (by duration) | none | **38** (max 586 ms, blocking 17 ms) | **27** (max 336, blocking 30) |
| rm fps / CLS | — / 0 | 57.4 / **0.061** (1 shift, about/journey, t 5.2 s) | 58.6 / **0.1164** (1 shift, same place) |
| skimmer screencast rAF fps / p95 / > 50 ms (headed, with readback) | relative | 9.6 / 233.3 / 87.5 % | 12.8 / 183.4 / 56 % |
| desktop lab LCP (qa.js, 3 loads) | ≤ 400 ms | **204 / 704 / 800** | **688 / 716 / 732** |

Bold = misses its target (or is a regression to look at). The desktop CLS comes from the world-font swap under the
scrubbed sentences (`span[data-w]` in #about and #beyond; P3-2 #7, open since W1). The §4.4 rows that need the intro
trace (`#intro` repaints, landing raster, hand-off script time, the name's frame) are not in motion.js's standard
output and were not re-measured this round.

### J9 HONEST · honesty + a11y
- `npm run check`: `R/honest/check.txt` (exit 0, 66 warnings). `RELEASE=1 npm run check`: `R/honest/release.txt`
  (exit 1 with 46 errors: 40 Check L2 countersignatures, 5 TTS approvals in SOUNDS.md, and the unsigned copy, 102
  strings; all DP-9 items for Aryan).
- Research-font probe, AA probe, layout gates (Pause mid-scroll shift), sound, lenis (Pause ≤ 100 ms), decoder:
  `R/probes-1440/p3-probes.json`, `R/probes-1024/p3-probes.json` → `results.research-font`, `results.aa-scrim`,
  `results.layout-gates`, `results.sound`, `results.lenis`, `results.decoder`.
- RM run (no motion, no sound, 0 video bytes): `R/probes-1440-rm/p3-probes.json`, motion.js `rm` rows in
  `R/motion/{1440,1024}/summary.md`, the RM frames `R/scenes/{1440,1024}/rm-01.jpg … rm-03.jpg`, qa.js
  `R/qa/qa-{1440,1024}.json` (`motion`, `lenis`).
- Keyboard-only pass: `results.keyboard` in `R/probes-{1440,1024}/p3-probes.json` (§1 above; `walk` lists every Tab
  stop in order) and under reduced motion `R/probes-1440-rm-keyboard/p3-probes.json`.
- qa.js (anchors, overflow at 320/390/1024/1440, no-JS, media blocked, LCP, console / hydration): `R/qa/qa-{1440,1024}.json`.

### Automated · no dead screen
- `R/beats/beats.json`, `R/deadscreen.json` (§1 above), with the static strips `R/scenes/{1440,1024}/sheet-*.jpg`
  and the reader sheets for the rows named in §1.

### Director's cut (its own axis only: it dwells on stars and flatters the pacing; never show it to J1–J7)
- `R/screencast/director-1440/sheets/sheet-01.jpg … sheet-20.jpg` (2 s clips, labels as J1's), `clips.json`,
  `screencast.json` (the cut ran top → end by itself in 394 s: `drive.endedBy = "cut ended"`, y 43,650).

### Phones (unchanged in Phase 3; for the 390 regression eye only)
- `R/scenes/390/sheet-01.jpg`, `sheet-02.jpg` (31 frames at 390×844), `R/scenes/390/checks.json` (0 console errors,
  0 overflow).

---

## 3. What ran, what did not

All on one machine, one browser at a time, against `http://localhost:3161` (the W3-gate build). Logs: `R/logs/*.log`.

| capture | command (abridged) | result |
|---|---|---|
| beats | `beats.mjs --widths=1440,1024 --out=R/beats` | 0 gaps, 0 missing, 0 short spans at both widths |
| reader / skimmer screencasts | `screencast.mjs --profile=reader\|skimmer --vw=1440x900\|1024x768 --out=R/screencast/<p>-<w> --raw=R/raw/screencast/<p>-<w>` → `clips.mjs` (+ `--clip=2 --plain --name=panel` for the reader) | reader 239 / 224 s of scroll, skimmer 101 / 78 s; 0 page errors; Lenis on in all four |
| director's cut | `screencast.mjs --profile=director --vw=1440x900` → `clips.mjs --clip=2` | ran top → end on its own (394 s) |
| scenes | `scenes.js --only=desktop,intro,alt,rm` at 1440 and `--vw=1024x768`; `--only=mobile` (390×844) | 118 / 118 / 31 frames; 0 console errors, 0 overflow; → `sheet.mjs` sheets |
| stranger sets | `anon.mjs` (blind: `--manifest … --modes=BLIND`; read: `--mode=captioned --match=…`; hooks: `--mode=frames`) | 39 + 37 blind, 17 + 17 read, 8 + 8 hooks |
| card hooks | `hooks.mjs --vw=… --tiers=css,gl` (p .05, damped p settled; GL waited to `data-gl="on"` at p 0) | 4 cards × 2 tiers × 2 widths; the GL tier engaged on every card |
| motion | `motion.js --runs=intro,desktop,native,alt,rm,gl` at 1440 and `--vw=1024x768` | see J8 |
| probes | `p3-probes.mjs` (all 21, `--timeout=1200000`) at 1440, `--vw=1024x768`, and `--rm` at 1440 | 1440: 19 / 21 pass (games.inp: a 688 ms keydown with 0 ms input delay; loaf by duration: worst main-thread work 12 ms; both the SwiftShader-only readings of W3.md §3). 1024: 20 / 21 (loaf by duration, worst work 14 ms; games.inp 56 ms passes). `--rm`: the 10 RM-aware probes of the W3 set (bundle, cards, cinema, games, gl, hunt, lenis, sound, spotlight, toys) pass, and so do aa-scrim, decoder, layout-gates, research-font; nav and words skip; font-network, loaf, plates-live and split assume motion on (their RM checks run inside the default runs) and fail by design; keyboard failed on its non-RM expectations and was re-run RM-aware: `R/probes-1440-rm-keyboard/` PASS (68 stops, 12 eggs; sound toggle disabled, the drone shows its flight plan, no candle toy, the cut never starts) |
| qa | `qa.js` at 1440 and `--vw=1024x768` | both widths: 0 hydration errors, 0 console errors outside the deliberate media-blocked context, 50 anchors 0 broken, no horizontal overflow at 320 / 390 / 1024 / 1440, no-JS h1 = 1 and no hidden text, RM and Pause: 0 running animations and 0 playing videos in 11 sections, Lenis gone after Pause; LCP desktop 204 / 704 / 800 ms (1440) and 688 / 716 / 732 ms (1024) against the ≤ 400 ms budget, mobile 1.33–1.85 s. qa.js fixed first: its Pause step clicked the header's sound toggle (the first `button[aria-pressed]`) |
| drift | `drift.mjs --tiers=css,gl` at 1440 and 1024 | see §1 |
| keyboard | inside the full probe runs at 1440 and 1024 (a standalone first run tested the probe; its Map-close check was fixed and the run dropped) | see §1 |
| check | `npm run check`, `RELEASE=1 npm run check` | exit 0 (66 warnings) / exit 1 on DP-9 items only |

**Caveats.**
- The screencasts' frame times are lower than motion.js's (screencast readback at ~10–24 fps under SwiftShader);
  compare a screencast with a screencast. A clip-cutting job (≈ 5 s of CPU) overlapped the 1024 reader and skimmer
  recordings once each.
- `deadscreen.mjs` and the J1 numbers read the spotlight log: a host that animates without the spotlight (B02, B06,
  B09–B11, B54 today) is invisible to the log, which is why the "with declared" column and the sheets exist.
- motion.js / probes are headless SwiftShader: INP and LoAF-by-duration readings are raster waits (W3.md §3).

## 4. Tools (P3-11.0)

| tool | what it does |
|---|---|
| `tools/capture/screencast.mjs` | headed Chrome (xvfb-run, else `--headless=new`, labelled) recording a reader (250 px/s, 2 s at each h2 / card settle), a skimmer (pixel wheel flings ≈ 2,500 px/s with an inertial tail) or the director's cut, Lenis on; CDP screencast → frames + VFR `video.mp4` (raw); rAF frame timings, LoAF, layout shifts, intro marks, page events, geometry every 5 s and the `?debug=spotlight` log in `screencast.json` |
| `tools/capture/clips.mjs` | 1 s (or `--clip=n`) clips: 4 frames each, labels burned in (time, scrollY, section, the spotlight's stars, breath), contact sheets of 10 clips, `clips.json` (stars per clip, max concurrent, overlap ms, row, declared breath, frame timings), J1 totals; `--plain` panel sheets |
| `tools/capture/deadscreen.mjs` | beats gaps + the §2.4 stretches' fills against the reader runs |
| `tools/capture/drift.mjs` (+ `drift_cv.py`) | P3-5 #3: registration SSIM at the push start (aligned, tone-matched, noise floor) and the ICE push's FIG drift (plate transform by ORB + RANSAC, FIG residual by phase correlation, DOM cross-check), css and GL tiers |
| `tools/capture/hooks.mjs` | the cards' p .05 frames (full viewport), both tiers |
| `tools/capture/sheet.mjs` | labelled contact sheets from a frame folder |
| `tools/capture/anon.mjs` | anonymized stranger sets at any width (blind / captioned / frames modes, manifest mode filter, seeded per set, keys kept apart) |
| `tools/capture/score.mjs` | scores blind (per world vs the pre-Phase-3 score), captioned (name, can't read, fast lane) and hooks verdicts |
| `tools/capture/probes/keyboard.mjs` | the keyboard-only walk (Tab / Enter / Space / Esc / arrows / typed words / Ctrl+K only) through every toy and egg; RM-aware under `--rm` |
| `tools/capture/qa.js` (fix) | the Pause step now finds `[data-motion-toggle]` first (it had pressed the header's sound toggle, the first `button[aria-pressed]`) |
