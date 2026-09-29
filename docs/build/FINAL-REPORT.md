# FINAL-REPORT: "One Line, Four Lights", the autonomous build

**Branch:** `design/three-films`, pushed.
**Code head:** `bc1072b`. This report's commit follows it and changes docs only.
**Date:** 2026-09-29.
**Executors:** your laptop's local autopilot ran until 05:30 ET. The claude.ai/code cloud session `session_01GFF9jaKCW8HAdt3ibcSBE7` ran from 12:35 UTC to the end.
**Contact sheet:** `docs/build/final-frames/index.html`. It holds 165 frames plus the QA evidence as small committed JPGs, and it opens anywhere.

## Summary

- **Done.**
  - Every queue item is ticked: P0 → P1 → M1 → M1.5 → M2 → M5.
  - `npm run check`, `npx eslint .` and `npm run build` are green at `bc1072b`.
  - This build never pushed to or merged into `main`.
- **⚠ `main` is not clean today.**
  - `origin/main` already holds PRs #2–#4 (this branch, up to `c632803`), merged by aaasharma870-art.
  - It also holds PR #5 (`wip/m2-snapshot`), which contains two mid-edit WIP snapshots.
  - `npm run check` **fails on `origin/main`**: error #7 in `components/site/contact-scene.tsx`. See §7.1.
- **Blind stranger test, final:** **38/45 BLIND frames pass.**
  - History: audit 15/53 → re-test #1 25/43 → re-test #2 35/44 → final 38/45.
  - By world: Pirates 10/10 · 3 Idiots 9/10 · RDR2 9/13 · Harry Potter 10/12.
  - Every frame with a film: 63/83.
  - 3 wrong-film frames, all "enter" frames that show the outgoing world.
- **Not re-judged:** the M5 fix round then changed or re-captured 29 frames, among them every remaining failure except the transition enter frames. None of those frames has been re-judged; they are marked on the contact sheet.
- **M5 QA: every criterion passes after the fix round.**
  - Mobile LCP: 1.3–2.0 s (the target is ≤ 2.5 s).
  - Overflow is 0 at 320, 390, 1024 and 1440.
  - Reduced motion and Pause: 0 motion in 16 sections.
  - No-JS: all 20 sections render. Media-blocked: all 19 render, with 35 captions.
  - 0 hydration errors, and 49 of 49 links resolve.
  - **Caveats:** axe flags 6–7 contrast nodes in `#principles`, which we judge false positives. The one-decoder rule was not exercised by the headless probe.
- **Higgsfield credits:** 693.5 spent of the 1,200 grant. The balance is **506.5**, confirmed live at the end. M5 spent 0.
- **Unused plates:** the CORRIDOR pair (14 cr), F-RD and F-RD-alt (replaced in M5), and F-PC-alt.
- **Needs you before `main`:**
  - 9 draft one-liners
  - 111 proposed strings and 12 quotes, 5 of the quotes community-sourced
  - 78 Check L2 countersignatures
  - overrides O-1 to O-7
  - `film.branchPreview` → false
  - delete `.claude/`, `CONTINUE.md` and `docs/build/`
- **No legal or honesty audit was run**, at your request. That review is yours.

---

## 1. How to run it

```bash
npm ci                      # Node 22.18+ (check-manifest imports .ts natively)
npm run dev                 # http://localhost:3000
npm run build && npm run start          # production (9 static routes)
npm run check               # tsc + scripts/check-manifest.mjs (the manifest validator)
RELEASE=1 npm run check     # release gate: FAILS until drafts/proposed copy are signed and branchPreview is off
npx eslint .
npm run optimize:media      # regenerate public/media from media-src masters (masters are gitignored)
```

| URL | What it does |
|---|---|
| `/` | The page. On a first visit in a session, the Harry Potter prologue arms: the Play screen, then a six-second broom flight onto the hero. |
| `/?skip=intro` | No intro. `skip=hero` skips the hero aperture, and `skip=all` skips both. |
| `/?intro=1` | Forces the intro, for QA. It ignores intro-seen, `#hash` and Save-Data. |
| `/?variant=alt` | Previews every ALT at once. `?variant=<piece>:alt` previews one piece, for example `?variant=hero.loop:alt` or `?variant=voices:alt`. |
| `/lab` | Primitives, the four world loaders in every state, act cards and route loaders (noindex). |
| `/lab/variants` | Every DEFAULT and ALT side by side, with intro replays. |

**The intro stays out of the way:**
- It never arms under reduced motion, Pause, `?skip`, a `#hash`, Save-Data or 2G/3G, or when it has already been seen this session.
- Esc, Skip, or a wheel or touch scroll ends it.

**Capture and QA tools** live in `tools/capture/`. They need Playwright:
```bash
(cd tools/capture && npm init -y >/dev/null && npm i --no-save playwright@1.58)
npx playwright install --with-deps chromium
```

| Tool | What it does |
|---|---|
| `next start -p 3161` then `node tools/capture/scenes.js http://localhost:3161 <outDir>` | Captures every film scene, captioned and blind (1440, alt, loaders, intro), plus the 390 and reduced-motion sweeps. It writes `manifest.json`, `checks.json` and `index.html`. |
| `node tools/capture/anon.mjs <framesDir> <outDir>` | Builds the anonymized blind-judge set: shuffled ids, and identical alts judged once. |
| `node tools/capture/score.mjs _ <out.json> <key.json> <verdictsPrefix> <manifest.json>` | Scores 3 judges' verdicts. |
| `node tools/capture/qa.js http://localhost:3161 <outDir>` | The M5 probes: anchors, overflow at 320/390/1024/1440, no-JS, media-blocked, reduced motion + Pause, LCP lab, console and hydration errors. |
| `node tools/capture/capture.js <url> <outDir>` | The generic reference harness: intro timelapse, scroll sequence, webm. |

**Mapping the workflow scripts:** the scripts in `docs/build/workflows/*.js` hard-code Windows paths. Map `C:/Users/aaash/Desktop/Transcript/research/build/X` → `docs/build/X`.

---

## 2. What changed across the build

| Step | Head | What it delivered |
|---|---|---|
| **P0** manifest foundation | `bcff748` | A typed manifest drives the page: `lib/page.ts` → `lib/sections.ts` / `lib/derive.ts` → `components/sections/registry.ts`. Nav, rail, palette and sitemap are derived from it. `npm run check` validates it. |
| **P1-early** tokens + primitives | `d64bf51` | DESIGN v2 tokens and the four world palettes. SectionFrame v1.5 and WorldProvider. The Pause toggle joins reduced motion. **DecoderLock** (one page-wide video decoder). The Lens, Seam, MaskReveal, Loader, ActCard and MediaFrame primitives. `/lab`. |
| **Media 1** | — | The hero sea (MV-01 / MV-01m), the play screen (IN-01), the broom flight (IN-02) and the hero loop (MV-03). **204.5 cr.** |
| **M1** four worlds | `37161bb` | The whole page plays as four worlds in four acts: the HP prologue (Play → broom flight, plus the code flight on mobile and low-power), the Pirates hero, the four act cards, four world skins, the header compass, loaders and credits. |
| **M1.5** variants | `492f120` | A DEFAULT and an ALT for every animation and video (`variants` on media, `variant` per section), `?variant=alt`, `/lab/variants`, and the draft one-liners. |
| **M2-media** | (staged) | 18 world plates, loops, films plates and writing covers, each with a default and an alt. **321 cr.** |
| **M2-COMBINED** | `d4a2cd8` (report `968903d`) | The RECOGNIZABILITY RULE work: 8 iconic plates plus CORRIDOR and PEN, the `SceneCaption` system (MOMENT • FILM in the world's fan face), every SPEC v2 section enabled, 12 cross-world transitions, and 2 blind re-tests with fix rounds. **140 + 28 cr.** |
| **M5** final QA | `bc1072b` + this commit | The final blind test, the QA runner and one fix round: LCP, 320 overflow, the RDR2 films screen, 3 Idiots chalk drones, bigger loaders, the intro ALT sea chart, the satchel, and code-review items (a) and (b). Then this report and the contact sheet. **0 cr.** |

### 2.1 The four worlds and every signature scene (page order; D = default, A = alt)

Every scene carries a **MOMENT • FILM** caption in its world's fan face: Pirata One for Pirates, Kalam for 3 Idiots, Rye for RDR2, and IM Fell English for HP. Every act card shows its film title at display size.

- **Prologue (Harry Potter):**
  - The Play screen: Hogwarts across the black lake. D shows floating candles; A shows Marauder's footprints.
  - The six-second broom flight, with a caption hand-off from HP → Pirates. The alt hands off at 2.9 s. **New in M5:** its folding page is inked as a sea chart.
- **Hero (Pirates):**
  - "Aryan Sharma", the one `h1`, over the night sea with **the Black Pearl on the horizon**.
  - D: the bracket is centred on the Pearl. A: a spyglass bracket with a 1.18× zoom.
- **Act I card, *The Crossing*:**
  - `iconic-pearl`: tattered black sails, and the Jolly Roger in code on the stern flagstaff.
  - Jack's open-lid compass sits on a brass course.
  - A: the chart to Isla de Muerta.
- **About:** Jack's compass at 144 px, lid open. The needle turns to the hovered pillar.
- **Journey:** the voyage sequence, with captions: Port Royal harbour at night, the fog around Isla de Muerta, Calypso's storm, and "bring me that horizon".
- **Card I → II (storm → ICE):**
  - The Kraken's storm dissolves into the ICE lecture hall, with the horizon registered to the chalk ledge.
  - **Rancho's homemade drone is chalked large on the board.**
  - A: a duster wipe reveals the drone.
- **Act II, *The Workshop* (3 Idiots).** These are the new 3 Idiots scenes:
  - **Work head band:** Virus's astronaut pen on his desk (`iconic-pen-alt`). It replaced the corridor.
  - **The gauntlet:** on the ICE chalkboard (MV-06), with a Kalam chalk header and the "Aal izz well" settle.
  - **Trading_Algos:** a Rancho-style blueprint on a chalkboard frame. **New in M5:** a chalk drone beside the caption at ≥ 1024 px.
  - **Optuna-Screener:** "WHAT IS A MACHINE?" chalked on the lecture-hall board, with the lettered machine definition. **New in M5:** the chalk drone sits on the board's top right.
  - **Experiment:** no film styling, by rule H4, because it sits next to research.
  - **Systems:** the homemade drone band (`iconic-drone`).
  - **Kill-list:** Virus's astronaut pen inset (`iconic-pen`), with the caption at the header only. The rows stay austere (O-5).
- **Films chapter, "Three films and a game" (house), four screens, each with a lettered quote and a finale stroke:**
  - The Black Pearl by moonlight.
  - The yellow scooter at Pangong Lake.
  - **RDR2, new in M5:** D is **Dead Eye**, with ember X marks locking on the five birds; A is **the gang's camp at dusk** as a journal clipping.
  - The Hogwarts Express (A: floating candles and enchanted ink).
- **Card II → III (the tintype):** a tintype develops into golden hour in the Heartlands. A: the Dead Eye grade with X marks.
- **Act III, *The Frontier* (RDR2):**
  - **Beyond:** the Heartlands band; "What's in the satchel", **redrawn in M5 as a shoulder satchel**; the WANTED handbill in Rye on `iconic-wanted`.
  - **Writing:** Arthur's journal, with the sketch page opening beside the heading.
  - **Voices:** D is the gang's camp at dusk (`iconic-camp`); A is the campfire (MV-11 plus the MV-11L loop).
- **Card III → IV (the ignite):** campfire embers become floating candles, then the Great Hall. A: Lumos, starting on the lit camp.
- **Act IV, *The Light* (Harry Potter):**
  - **Principles:** D is the Marauder's Map (parchment, inked corridors, footprints, banner). A is the Lumos ceiling, with a candle per principle.
  - **Contact:** a floating candle from the Great Hall.
- **Credits:** each film title is set in its own face (O-6). The Snitch, a Time-Turner and the Hallows appear small. The page ends on the lettered "Mischief managed." The fan-tribute line is verbatim.
- **Loaders** (4 worlds, D and A):

  | World | Default | Alt |
  |---|---|---|
  | Pirates | compass and a black-sailed ship | ship in a bottle |
  | 3 Idiots | ICE board with the drone and the pen | chalk derivation |
  | RDR2 | journal sketch | Dead Eye X marks |
  | HP | candles along the ink line | Marauder's Map |

  **In M5**, card loaders grew from 120 to 176 px, and route art from 288 to 416 px at ≥ 1280.

### 2.2 Transitions (T1–T12, opacity and transform only; RECOGNIZABILITY §8)

| # | Transition | How it works |
|---|---|---|
| T1 | Prologue → hero | Caption hand-off HP → Pirates |
| T2 | Hero → Act I | The hero feathers into deep, and the Pearl opens by aperture from the same horizon |
| T3 | Storm → ICE | The horizon is registered to the chalk ledge; chalk dust; foam desaturates to chalk |
| T4 | Board → board | The lecture-hall board becomes the dawn board |
| T5 | Kill-list → films | The grid thins to deep |
| T6 | Between the films screens | 24vh world-deep seams |
| T7 | Films → tintype | Stacked grounds develop into the tintype |
| T8 | Tintype → Beyond | The tintype **is** the Beyond band |
| T9 | Writing → Voices | Dusk, with the camp fading up |
| T10 | Embers → hall | Embers → candles → the Great Hall |
| T11 | Hall → Principles | Into the parchment or the candles |
| T12 | Last light → credits | The last light becomes the credits' ink fold |

Under reduced motion, Pause and no-JS, every card shows its static settled title card with its caption. Mobile (< 640 px) gets static compositions and stills.

---

## 3. Recognizability (the blind stranger test)

PASS means at least 2 of 3 blind judges named the intended film at confidence ≥ 0.6, on a frame with all text hidden.

| Run | BLIND-mode frames | All frames with a film | Wrong-film frames |
|---|---|---|---|
| Audit, before M2 (`m2-audit`) | — (all frames: **15/53**) | 15/53 | 1 |
| Re-test #1 (`m2-after`) | **25/43** | 38/75 | 5 |
| Re-test #2 (`m2-after2` @ `daac296`) | **35/44** | 56/81 (corrected scorer) | 2 (corrected) |
| **Final (M5, `m2-after2` @ `d4a2cd8`)** | **38/45** | **63/83** | **3** (all outgoing-world enter frames) |

**By world, final:**

| World | BLIND-mode frames | All frames with a film |
|---|---|---|
| Pirates of the Caribbean | 10/10 | 20/21 |
| 3 Idiots | 9/10 (was 5/10) | 13/18 |
| Red Dead Redemption 2 | 9/13 | 15/23 |
| Harry Potter | 10/12 | 15/21 |

**The intro beats have now been measured validly for the first time:**
- The Play screen scores 0.95–0.97.
- The early flight (HP) scores 0.95–0.97.
- The late flight and the landing (Pirates) score 0.60–0.70.

**Every scene still failing in the final test, and its caption fallback.** "Fixed in M5" means the scene was changed after the test and has not been re-judged. The full table is in `m2-review/BLIND-FINAL.md`.

| Scene (frames) | Blind score | What carries it now |
|---|---|---|
| Films screen, RDR2 (D45, A45) | 0.55–0.60 | Film title RED DEAD REDEMPTION 2 and a moment caption under the screen. **Fixed in M5:** D is now Dead Eye ("DEAD EYE"), A is the camp ("THE GANG'S CAMP AT DUSK"). |
| Card-size loaders (D80 hp/idiots/rdr2, A80 hp/rdr2) | 0.35–0.55, "tiny" | No caption on the `/lab` strip. On the live page a card-size loader appears only in the fallback "reel" act card, which none of the four acts uses. **Enlarged in M5** (120 → 176 px). |
| Route loaders, alt (A85 principles/writing) | 0.45–0.50, 0 wrong | HARRY POTTER / RED DEAD REDEMPTION 2 title, plus "THE MARAUDER'S MAP • HARRY POTTER" / "DEAD EYE • RED DEAD REDEMPTION 2". These appear on `/lab` only. **Enlarged in M5.** |
| Trading_Algos head (D26) | 0.20–0.25, 0 wrong | "A RANCHO-STYLE BLUEPRINT • 3 IDIOTS" above the board. **Fixed in M5:** a chalk drone at ≥ 1024 px. |
| Optuna head (D27, A27) | 0.45–0.55, 0 wrong | "WHAT IS A MACHINE? • 3 IDIOTS", and the question chalked on the board. **Fixed in M5:** a chalk drone on the board. |
| Satchel, alt (A33) | 0.45–0.60, 0 wrong | "WHAT'S IN THE SATCHEL • RED DEAD REDEMPTION 2". **Fixed in M5:** redrawn. |
| Intro mid-flight (D00, A00) | 0.50–0.60, 0 wrong | The designed HP → Pirates hand-off, with "A BROOMSTICK OVER HOGWARTS" / "TOWARD THE BLACK PEARL" on screen. **A fixed in M5:** a sea-chart fold. |
| Act III enter (D10, A10) | 0.30–0.60 | RED DEAD REDEMPTION 2 at display size, plus the ACT III meta. The mid and settled frames pass (0.70–0.85). |
| Act II enter (D10) and Act IV enter (D10, A10) | wrong-film: the outgoing world | They show the outgoing world with its own caption ("THE KRAKEN'S STORM • PIRATES…", "THE CAMPFIRE • RED DEAD REDEMPTION 2"), which the TRANSITION rule allows. The mid and settled frames pass (Act IV settled: 0.95–0.97). |

Every CAPTION frame had 0 confident wrong-film guesses, which meets the RECOGNIZABILITY §10 blind guard.

---

## 4. M5 QA results

Measured by `tools/capture/qa.js` and the supplementary `qa2.js` on the production build at `bc1072b`. The evidence is in `docs/build/final-frames/qa/`: `qa-m5fix.json`, and in `supp/` the files `qa2-*.json` plus the JPG shots.

| M5 criterion | Result | Evidence and notes |
|---|---|---|
| Final blind stranger test | 38/45 BLIND; 63/83 all | §3 and `m2-review/BLIND-FINAL.md`. 29 post-fix frames are not re-judged. |
| check, eslint, build | **Green** | `npm run check`: OK with 94 warnings, all release-gate and data notes; re-run at this commit. `npx eslint .`: exit 0. `npm run build`: 9/9 static routes (at `bc1072b`; this commit is docs only). |
| Anchors and links | **Pass** | 49 links: 0 broken, 0 duplicate ids. 15/15 sitemap hashes resolve. 18 external links, all with `target=_blank` and `rel="noreferrer noopener"`. The menu's 17 hash links land at top = 92 px at 1440 and 390 (188 px for the four sections with sticky heads). `/lab` and `/lab/variants` return 200; `/does-not-exist` returns 404; robots, sitemap, og-image and icon return 200. |
| Overflow at 320 / 390 / 1024 / 1440 | **Pass** | scrollWidth equals clientWidth at all four. Before the fix, 320 measured 321 (the chalk-circle SVG); fixed in `idiots-chalk.tsx`. |
| Reduced motion | **Pass** | 16 sections, each at 0 rAF/s, 0 style mutations, 0 WAAPI animations, 0 canvas changes and 0 playing videos. The control run proves the probe works: it saw 35–62 rAF/s. |
| Pause toggle | **Pass** | The same zeros. `aria-pressed=true` and `html[data-motion=paused]`. |
| No-JS | **Pass** | 20 sections, 1 `h1`, no text hidden for a reveal, intro hidden. Only responsive `display:none` duplicates stay hidden. |
| Media-blocked | **Pass** | 19 sections, 35 captions, 1 `h1`, no page errors. The 100 console `ERR_FAILED` lines are the deliberate blocks. |
| LCP, mobile lab (390, 4× CPU, 1.6 Mbps, 150 ms RTT), intro armed | **Pass (≤ 2.5 s)** | qa.js: 1724, 1604 and 1500 ms. qa2 ×5: 1332–2020 ms, median 1612. It was 2552 ms before the fix, which added `fetchPriority="high"` on the hero still and its preload, and stopped preloading Newsreader. |
| LCP, mobile skip or repeat visit | **Pass** | 1612 and 2004 ms (was 3956–4440). The pre-paint slit now arms only at ≥ 640 px. |
| LCP, desktop | **Pass** | 260–368 ms. The LCP element is the name in the `h1`. |
| Hydration errors | **Pass: 0** | `qa-m5fix.json` `hydration: []`. |
| One `h1` (his name) | **Pass** | Exactly 1 in every mode measured: 1440 and 1440-alt (final capture), no-JS and media-blocked (final qa.js), and 390 and reduced motion (at `d4a2cd8`). |
| AA contrast | **Pass, with a caveat** | The manifest AA fixtures: 348 cells, tightest 4.65:1. axe flags 6 nodes at 390 and 7 at 1440 and 1440-RM, all in `#principles` (#5a4632 / #2e2318 on #0f0c09). The text actually sits on the parchment map layer, which axe cannot see. The QA runner's estimate is ≥ 6.5:1 (`qa/supp/principles-normal.jpg`), but that estimate was not measured with a tool. There are no other axe A/AA violations. |
| One video decoder | **Enforced in code; not exercised** | `lib/decoder-lock.ts` allows one page-wide decoder. The headless dwell probe mounted no `<video>` at 1440 or 390 (max playing: 0), so the rule was not tested live. Check it in real Chrome. |
| Mobile gets stills | **Pass** | The mobile LCP element is the still `hero-sea-mobile.webp`. The 390 dwell mounted 0 videos. |
| The intro never gates content | **Pass** | The page is complete in the SSR, and the intro is hidden without JS. It doesn't arm under reduced motion, Pause, `?skip`, `#hash`, Save-Data or a repeat visit. Esc, Skip, wheel or touch end it. While it is armed, `main` is inert until one of those happens. |

---

## 5. Credits (Higgsfield)

| Line | Credits | Ledger |
|---|---|---|
| Media 1 (hero sea, play screen, broom flight, hero loop) | 204.5 | `media/LEDGER.md` |
| M2-media: lane A 142.25 + lane B 178.75 | 321.0 | `media/LEDGER-laneA.md`, `LEDGER-laneB.md` |
| M2 iconic (8 plates × default + alt, including 4 edits) | 140.0 | `media/LEDGER-m2iconic.md` |
| M2 finish (CORRIDOR ×2, PEN ×2) | 28.0 | `media/LEDGER-m2iconic.md`, `media/LOG.md` |
| M5 | 0 | — |
| **Total spent since the 1,200 grant** | **693.5** | 1,200 − 693.5 = 506.5 |
| **Balance** | **506.5** | Confirmed live with Higgsfield `balance` at the end of M5 ("plus" plan) |

- The reserve (≥ 150) and the MEDIA-PLAN v2 floor (250) were never approached.

**Generated but not shown on the page:**

| Asset | Credits | Status |
|---|---|---|
| `iconic-corridor` + `-alt` | 7 + 7 | Registered `accepted`; nothing plays them. It read as "generic architecture" (0.40), so the pen replaced it. Delete it or reuse it. |
| `F-RD` + `F-RD-alt` (films screen, RDR2) | 4.5 + 4.5 (F-RD had one regeneration, per `LEDGER-laneB.md`) | Replaced in M5 by `iconic-deadeye` / `iconic-camp-alt`. Only `plate-marks.ts` coordinates still reference them. |
| `F-PC-alt` | 4.5 | Unused. `F-PC` itself survives only as `iconic-pearl`'s fallback; the Pirates screen shows `iconic-pearl-alt` (F-PC's grey sails were not the Pearl). |
| `MV-01-alt`, `MV-06-alt` | 0 extra (runner-ups) | `received`: rejected alternates. The default plays in both variants. |
| `IN-02-poster`, `MV-03-poster`, `MV-09-poster`, `MV-11L-poster` and their `-alt`s | 0 (frame grabs) | Registered, but no code and no asset `poster` field references them. |

---

## 6. DRAFT and sign-off items for Aryan

### 6.1 The one-liners: *Aryan to personalize before merging to main*

All 9 are `draft: true` / `status: "draft"` in `lib/film.ts`. They render normally, with no badge, because `branchPreview` is on. They are tied only to facts in `lib/content.ts`, and no life events are invented. How to make one yours: edit `text` (or paste an alternate), set `status: "confirmed"`, then delete `draft` and `alternates`. Background: `docs/build/ONE-LINERS.md`.

**"Why this matters to me"** (`film.worlds.<world>.reason`, shown on the films chapter screens):

- **Pirates of the Caribbean:** "My first strategies were a compass that pointed wherever I wanted it to. The real crossing began when I stopped steering by what I hoped and started steering by data I had never seen."
  - Alt 1: "A course is something you keep correcting, not something you declare once. That is how chart patterns on TradingView became a pipeline that tells me when I'm wrong."
  - Alt 2: "Everyone in it is sailing toward something they can't prove is there. I still am; I've just learned to test the map before I trust it."
- **3 Idiots:** "It made curiosity feel like a discipline instead of a distraction. Nobody assigned me a validation pipeline; I built one because I needed to know why my own ideas kept breaking."
  - Alt 1: "It is about learning something because you need to understand it, not to look like you do. Everything I have built on my own started exactly that way."
  - Alt 2: "It taught me that the honest explanation beats the impressive answer. So on this page the chalk circles the caveat, never the number."
- **Red Dead Redemption 2:** "Its hero keeps a journal of what really happened, not what he wished had. My kill-list is that journal: every idea that didn't survive, written down honestly, so the next one starts wiser."
  - Alt 1: "It moves slowly on purpose: long rides, quiet camps, nothing rushed. That is the patience distance running taught me, and the same patience a holdout asks for."
  - Alt 2: "Most of the frontier is waiting and watching the light change. That is what photography is to me, and on the good days it is what research is too."
- **Harry Potter:** "Even its magic has rules, and the wonder is in finding them. That is what markets still feel like to me: rules under the noise, and the honest work of proving which ones are real."
  - Alt 1: "Its bravest moments are about telling the truth when a lie would be easier. That is the whole job in research: say what the data shows, especially when it isn't what I hoped."
  - Alt 2: "It taught me that wonder and rigor aren't opposites. I still feel it when a pre-registered test comes back and the answer is real, whichever way it went."

**Act loglines** (`film.acts[].logline`):
- I · The Crossing: "Where I started, and the course I've been correcting ever since."
- II · The Workshop: "What I build, how I try to break it, and what didn't survive."
- III · The Frontier: "Life beyond the screen: the miles, the mat, the camera, and the people who have watched me work."
- IV · The Light: "What I believe about doing this work honestly, and where to find me."

**The WANTED handbill reward** (`copy["beyond.handbill.reward"]`): "An honest answer, including “I don't know yet.”"
- Alt 1: "A straight answer and a written post-mortem."
- Alt 2: "A good question back, and the data to test it."

### 6.2 Proposed copy: 111 strings + 12 quotes

- **Status:** every caption, microcopy string and quote is `status: "proposed"`. They render on this branch, and `RELEASE=1 npm run check` fails until you sign them.
  - Sign everything at once with `film.copySignedOff = true`, or set `"confirmed"` one string at a time.
- **Where to review:**
  - `lib/film.ts`: `copy`, `captions` (49 scene captions, all MOMENT • FILM), `worlds`, `acts` and `lettering`
  - `lib/quotes.ts`: the 12 film quotes
  - The contact sheet shows every caption in place.
- **New since the M2 report (M5):** "DEAD EYE" (the films RDR2 screen) and "THE GANG'S CAMP AT DUSK" (its alt).

### 6.3 Community-sourced quotes: verify in the work before you mark them "confirmed"

- Q-PC-1: "Now… bring me that horizon." (Jack Sparrow, *Curse of the Black Pearl*)
- Q-PC-3: "The code is more what you'd call 'guidelines' than actual rules." (Barbossa)
- Q-3I-3: "A machine is anything that reduces human effort." (Rancho)
- Q-RD-1: "Be loyal to what matters." (Arthur Morgan)
- Q-RD-2: "We can't change what's done, we can only move on." (Arthur Morgan)

### 6.4 Check L2 countersignatures: 78 media entries

Every generated plate, loop and still carries "Check L2: Claude ✓ / Aryan pending". That includes all 8 iconic plates plus CORRIDOR and PEN.
- The records are in `lib/media.ts` (`accept`/`provenance` per asset), `media/LEDGER*.md` and `media/LOG.md`.
- `npm run check` lists all 78.
- Still open from the plan: `iconic-express` recreates the famous viaduct angle (L2 #4, "subject, not the shot").

### 6.5 RECOGNIZABILITY overrides O-1 to O-7

Each can be reversed in data; see `RECOGNIZABILITY.md` §3.

| # | Override | To reverse |
|---|---|---|
| O-1 | Captions and film titles in the world fan faces (never a logo face or lockup) | `film.fontScope.extended` |
| O-2 | Display-font budget 24 → 56 KB | Lower it if the captions are trimmed |
| O-3 | Rye as the RDR2 face | One line, `worldFontVar.rdr2`. **Flag:** Rye carries a Reserved Font Name; we self-host Google's subset. |
| O-4 | The opening card uses Pirata One | Per-card data |
| O-5 | Kill-list header cue: caption plus inset at the header only | Remove `cap.kill-list` |
| O-6 | Credits set four faces in one viewport | `credits.titlesLettered` |
| O-7 | A caption names the kraken egg | Swap the caption text |

**Also open:**
- the drone's sensitivity (the Systems caption names no character)
- the stopwatch, which is unverified and not used as a claim

### 6.6 `film.branchPreview` is ON

Turn it **off** before `main`. While it is on, every draft and proposed string renders in every build.

---

## 7. Known issues (with evidence)

1. **`main` already holds build work, including a broken WIP snapshot.**
   - `git log design/three-films..origin/main` shows these, all authored by aaasharma870-art:
     - merges of PRs #2, #3 and #4 from this branch (the last at 09:28 ET, up to `c632803`)
     - PR #5 from `wip/m2-snapshot` (09:49 ET), which brought in two WIP snapshots: `c982dbf` and `ed2951a`, "check red … mid-edit"
   - **`npm run check` on `origin/main` fails.** I ran it in a detached worktree at the end of M5:
     `error #7 components/site/contact-scene.tsx contains the text of quote Q-HP-2: render it through <FilmQuote id="Q-HP-2">`.
   - `main` also carries `.claude/`, `CONTINUE.md`, `docs/build/` and `branchPreview: true`.
   - Nothing here touched `main`. Merging this branch into `main` through a normal PR brings in the fixed code, but only after the checklist in §8.
2. **29 frames changed or re-captured after the final blind test are not re-judged.**
   - 25 were changed: A00-intro-flight-mid, D/A26, D/A27, D/A33, D/A45, and all 16 loader frames.
   - 4 were re-captured with the scene unchanged: D/A01-hero, A00-intro-landed, D00-intro-flight-mid.
   - Every "fixed" claim for them is the fixer's own look at the new frames. Filter "Changed after the final test" on the contact sheet.
3. **The 3 Idiots lecture-hall plate still reads as "a generic classroom"** (0.45–0.55, on the Optuna head and the Act II card).
   - The chalked drone lifted the Act II settled card to a pass.
   - The Optuna head relies on its caption plus the chalk drone added in M5, which is not re-judged.
   - D26's drone shows only at ≥ 1024 px, so below that the caption alone carries it.
4. **Act III has no pinned stage.** The validator caps pinned stages at 2, and acts II and IV use them. So its develop is never seen (mid equals settled), and both enter frames are mostly dark (0.30–0.60).
5. **The alternates barely differ in places.** 20 alt frames had a blind image identical to their default and were judged once; A30 ≈ D30, for example.
6. **The default hero's Pearl is small** (about 35 px). The hero passes, but marginally (0.60–0.70).
7. **The loaders are mostly lab-only.**
   - Route loaders render only on `/lab`, and the 404 page uses the RDR2 stage loader.
   - A card-size loader appears on the home page only in the fallback "reel" act card.
   - Their weak blind scores therefore barely touch the live page.
8. **Unverified checks:**
   - The one-decoder rule was not exercised by the headless probe (§4).
   - LCP is lab-throttled headless Chromium, not field data.
   - The axe contrast hits in `#principles` are judged false positives, but only on an estimate.
9. **Tool limits:**
   - qa.js's own no-JS and media-blocked screenshots are torn: the page has smooth scroll, and qa.js shoots 200–600 ms after `scrollIntoView`. They are kept and labelled on the contact sheet. The instant-scroll re-shots are in `qa/supp/`.
   - `m2-after2/manifest.json` still lists a stale `m390-21-beyond-1818`, superseded by `-1824`.
   - The full-size PNG frames are gitignored and exist only in the cloud container. The committed record is the JPG contact sheet.
10. **`npm run check` data warnings (not errors):**
    - 4 `variantOf` notes: `work.head.alt`, `beyond.band.alt` and `voices.fire.alt` ×2 play plates that are not registered as alternates.
    - `MV-01-alt` and `MV-06-alt` are `received`.
    - `IN-01-empty` and `IN-01m-empty` have no alt.
    - The nav label "Trading_Algos" is 13 characters (the limit is 12).
11. **The credits are text-only by design.** The Snitch and Hallows are small (0.40–0.50). The contact frame passes marginally (0.55–0.65).

---

## 8. What needs your sign-off before `main`: the pre-merge checklist

- [ ] **Decide how to repair `main`** (§7.1). Its current state fails `npm run check`. The simplest route is a PR from this branch once the items below are done. Don't force-push unless you mean to.
- [ ] Rewrite or confirm the **9 one-liners** (§6.1).
- [ ] Sign the **111 proposed strings + 12 quotes** (`film.copySignedOff`, or per string) (§6.2).
- [ ] Verify the **5 community-sourced quotes** (§6.3).
- [ ] Countersign **Check L2 on all 78 generated media entries** (§6.4), and decide on `iconic-express`'s angle.
- [ ] Accept or reverse **O-1 to O-7**, including the Rye RFN (§6.5).
- [ ] Set **`film.branchPreview = false`** (`lib/film.ts`).
- [ ] Decide on the **unused plates**: the corridor pair, F-RD and F-RD-alt, F-PC-alt, the unreferenced posters. Deleting a file needs its `lib/media.ts` entry removed too, or `npm run check` errors.
- [ ] **Remove the build scaffolding:**
  - `.claude/`: keep only the SessionStart hook (`.claude/settings.json` + `.claude/hooks/session-start.sh`), and only if you want cloud sessions to self-install.
  - `CONTINUE.md`
  - `docs/build/`: then also drop its `.gitignore` lines.
  - optionally `tools/capture/`
- [ ] **Your legal and honesty review.**
- [ ] Run `RELEASE=1 npm run check`, `npx eslint .` and `npm run build`, and confirm all three are green.
- [ ] Look through `docs/build/final-frames/index.html`, or better, the live `npm run dev` with `?intro=1` and `?variant=alt`.

---

## 9. Legal and honesty

**No legal or honesty audit was run in M2 or M5, at your request (2026-09-29, 05:50 ET).** No legal or honesty findings were written and no edits of that kind were made.

The build did keep the standing hard limits as rules of work:
- no actor faces or likenesses
- no ripped stills, footage or logo files
- no text baked into generated media
- the fan-tribute credit, verbatim
- the research-honesty guardrails: `experiment` has no film styling, and captions never sit beside a metric

Keeping those rules is not an audit. Whether the result is acceptable is your call.

## Post-M5 skills pass (2026-09-29, cloud session)
- **Contact sheet (shareable):** https://claude.ai/artifact/332EBvDgmWczQpspZvBU7d — every final frame with its blind verdict, filterable by world / verdict / variant. Private to Aryan until shared from the page's Share menu. The same frames are committed in `docs/build/final-frames/`.
- **code-review:** one finding (hero ALT "spyglass" overhanging its box on phones during the bracket opening) — fixed in `bc1072b`. Notes: `docs/build/m2-review/CODE-REVIEW.md`.
- **security-review:** no findings (no new HTML/script sinks, no secrets, no PII, tooling local-only). Notes: `docs/build/m2-review/SECURITY-REVIEW.md`.
- **simplify:** 22 behaviour-preserving cleanups in `36d6dab` (shared `spanUnit` scroll maps, one `hash01` / `smooth01` / mask-style helper, `CampLayer`, dead code removed: CardShell `featherUp`, the work-head stand-in path, `PenCase`, the unreachable RDR2/Pirates finale branches, dead `mini` / `wrapperClassName` / `blobs` params; a `--loader-stage` token; fewer re-renders in the journal loader, seam-chalk and header). **Pixel-verified:** 250 frames re-captured and diffed against a pre-cleanup baseline — 205 identical, every reduced-motion frame 0.000%, the 8 frames > 0.5% were ALT scroll-timing noise that differs between two captures of the same build; SSR HTML and layout boxes identical apart from one mask-declaration order and one generated filter id.
- **Deliberately left as follow-ups:** move the header's settle-time re-probe into the shared active-section store; dedupe the hall-ceiling candle symbol / star tile in SSR HTML (~25–80 KB raw); `will-change` on the seam glow; act-card letterbox CSS tokens; plate-band `coverRect` via the act-card cover helpers; one shared "two soft pats" entrance helper.
- **Unused generated media:** the `iconic-corridor` pair (ICE corridor, 14 credits) is registered and deployed but not rendered — the fix round swapped the work head to Virus's astronaut pen because the corridor read as generic architecture (0.40 blind). Keep it for a future scene or delete the two entries and files.

## Heads-up: `main`
`origin/main` already contains merges of this branch (PRs #2–#4) and of `wip/m2-snapshot` (PR #5). PR #5 carried two mid-edit backup snapshots, so `npm run check` fails on `main` today (a quote not rendered through `FilmQuote` in `contact-scene.tsx`). Merging the current `design/three-films` (which is green) into `main` fixes it. The `wip/m2-snapshot` branch was only ever a backup — please don't merge `wip/*` branches. This build never pushed to `main`.

## Released to `main` (2026-09-29)
At Aryan's request ("let's do it all, let's finalize"): he signed everything **as-is** — all proposed microcopy and captions and the 12 quotes (`film.copySignedOff: true`), the 9 drafted personal lines (now `confirmed`, prompts + alternates kept for his rewrite), and every media plate's Check L2 (`aryan:2026-09-29`). `film.branchPreview` is off. `RELEASE=1 npm run check`, eslint and the production build pass; a reduced-motion + 390 re-capture of the release build matches the verified frames (58 frames, max 0.04% pixel difference — nothing hidden by the switch). `design/three-films` was merged into `main` with the branch's exact tree (main previously held two mid-edit backup snapshots from PR #5; they are superseded). Build files are kept on purpose; the next phase ("the info details") is briefed in `CONTINUE.md`. Hosting: not yet (Aryan's call).
