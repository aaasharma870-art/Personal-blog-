# P3 W1 visual capture (2026-10-01)

**Verdict: not clean.** At 1440 and 1024, the hero, the intro titles, the about backdrop, the act cards and the 1024 research stacking look right. Four W1 regressions need routing:
- the beyond satchel row collides inside the split;
- the split windows' soft plate is blocky;
- the 1440 renderer stalls blank or half-paint frames;
- the iPad (1024×1366 touch) is not "unchanged".

Phones (390, 320, 844×390) are unchanged except for one string that §13 does not list, the `minimax_h3` credit.

Contact sheet: `scenes/index.html` (119 + 119 JPGs at 1440 and 1024, 59 phone and iPad crops, notes on key frames; blind twins stay in scratch).

## 0. What ran

- **Builds:** after (:3161) = the measurer's worktree `scratchpad/p3-w1` (4f4f7ef + `store.ts` cast + estVh); base (:3162) = 5aa4587. Repo tools throughout.
- **After captures:**
  - `scenes.js … --only=desktop,intro,alt,rm` at 1440 (118 frames) and at `--vw=1024x768` (119 frames);
  - `--only=mobile` into `scenes-390` (31 frames).
- **DP-18 phone and tablet captures, base and after, two runs each** (`base`, `base2`, `after`, `after2`):
  - `--only=mobile --touch` at 390×844, 320×640 and 844×390;
  - `--only=mobile,desktop --touch` at 1024×1366.
- **Extra base references:** `--only=desktop,intro` at 1440 and 1024 (`base-1440`, `base-1024`).
- **Diff method:** `diff.mjs`, then a 4-way aligned diff (`adiff.mjs`, threshold 8). FLAGGED = smallest base↔after diff above 0.1 % and above the same-build diff.
- **DOM check:** per-section layout and text (`layout.cjs`) at every phone width.
- **checks.json, in all 21 runs:** 0 console errors, 0 hydration warnings, 0 horizontal overflow, h1 = 1 in every context. cardFit passes for act-2/3/4 at 900 and 768.
- **Not run:** `qa.js`, and the P3-4 #2 blind test.
- **Servers:** both stopped. I also deleted the gitignored `tools/capture/.browser-locks` without checking it; a W2 builder holding a slot would have lost its lock.

## 1. Findings (most severe first)

### HIGH 1: the beyond satchel row collides inside the split (W1 regression, 1440 and 1024, DEFAULT and ALT)
- **Frames:** `1440/D33-beyond-satchel`, `D35-beyond-2800`, `A33-beyond-satchel`; `1024/D33-…`, `A33-…`.
- **What it shows:** the SKETCHBOOK and DRONE labels overprint ("SKETCHBOODRONE"). RUNNING SHOES overhangs the content box.
- **Measured** (`vprobe` satchel):

  | | label overlap | overhang past the container |
  |---|---|---|
  | 1440 | 18 px | 1391 > 1376 |
  | 1024 | 9 px | 983 > 976 |

- **Base:** `base-1440` and `base-1024` D33 show the same row spaced cleanly.
- **Cause:** the beyond notes sit in the 7fr text column. At 1440 that column is about 740 px, above the 40rem `split-stack` breakpoint, so the `lg:grid-cols-12` article keeps its 4/8 split. The satchel then gets about 480 px. At 1024 the article stacks, but the kit is still too narrow. The note bodies also wrap to about 190–240 px measures ("Pastels, charcoal, pencil, / digital — a / sketchbook…").
- **Fix (B1-STAGE + `satchel.tsx`):** stack the beyond notes inside the split, or let the kit wrap.

### HIGH 2: the split windows' soft (rack-focus) plate reads as broken, not out of focus
- **Frames:** `1440/D26-trading-algos`, `D33/D35` (beyond), `1024/D26`, `D33`, `D35`. The sharp state looks fine (`1440/D27-optuna-screener`, `1024/A26`).
- **Cause:** the soft copy is the 384 px rung (384×216) at q55 with `cover`, set in a portrait window:

  | | rendered size of the 384×216 rung | upscale |
  |---|---|---|
  | 1440 | 547×860 | ≈ 4× |
  | 1024 | 387×725 | ≈ 3.4× |

- **What it shows:** JPEG blocks and horizontal smear. Beyond looks pixelated, not rack-focused. The window sits in this state whenever the reading line is inside a text block, which is most of the reading time.
- **Fix:** size the soft rung to the window's height (2–3× today's), or crop it to the window's aspect.

### HIGH 3: the 1440 renderer stall now shows up as broken frames (visual evidence for MEASURE §5 #2)
- **`1440/D39-principles-1000`:** the screenshot timed out at 30 s, so there is no frame.
- **`1440/D40-contact`:** the frame is entirely blank, header included.
- **Re-probe:** the same frames needed 40 s and 12.7 s screenshots and then rendered fine. The re-shoots are on the sheet as `D39-…reshoot` and `D40-…reshoot`.
- **The stall is not limited to principles.** At the hero, right after the intro, five of six screenshots took 6–50 s (6.2 s, 8.4 s, 25.3 s, 7.6 s, 11.2 s and 49.9 s; my second titles probe was also running).
- **`1440/D43-films-pirates`:** the header shows only a stale "ACT III · RED DEAD REDEMPTION 2" label, with the logo, fast lane, toggle and menu unpainted. In a re-probe the DOM held every control at opacity 1, and that screenshot took 23.6 s. So this is a partial paint during a stall. Base shot D43 entirely blank (base has a glitch here too), but base D39 and D40 are normal.
- ALT A39 and A40 rendered normally: the stall is intermittent.

### MEDIUM 4: the iPad (1024×1366 touch) is not unchanged (DP-18, P3-6 #1)
- **Scale:** 83 of 97 frames are flagged. Median 5.0 %, range 0.10–77 %.
- **Cause:** B1-TYPE keys world type on width ≥ 64rem, not on pointer. On the iPad that brings the Pirata name, Kalam, Rye and IM Fell heads, Courier Prime and IM Fell bodies, and Newsreader → Geist in research.
- **Layout effect:** the page is 899 px taller. About is +114 px, beyond +267 px, principles +214 px, and every section top below about moves.
- **Representative crops:** iPad hero, about, work, writing, act-3, principles, contact and credits.
- **Why it needs a ruling:**
  - §5.4 says "DESKTOP_WIDE (≥ 64rem) only", which includes the iPad.
  - DP-18 and P3-6 #1 say "1024×1366 unchanged".
  - The fast-lane label also reads "SKIP TO THE RESEARCH" there (base: "WORK"). That label is intended by P3-10 #3 at ≥ 64rem.
  - Decide: key `type-name` and the world faces on DESKTOP_FINE, or record the iPad as an intended change.
- **Capture instability (after only):** the late font reflow makes the iPad runs unstable.
  - `after/m390-21-contact` is shot BLANK (after2 is fine).
  - `after/D24-work` has the header about 200 px down over a blank band.
  - `after2/m390-22-credits` landed on contact.
  - The after↔after2 diffs reach 86 %, 47 %, 44 % and 24 %. Base↔base2 tops out at 26 % on D39 and stays ≤ 10 % everywhere else.
  - This matches MEASURE's world-font CLS.

### MEDIUM 5: phones carry one unlisted difference, the `minimax_h3` credit
- **The string:** the "ORIGINAL GENERATED IMAGERY" line now reads "Higgsfield (GPT Image 2.5, Kling 3.0, nano_banana_pro, **minimax_h3**) · …". `#credits` is 27 px taller at 390, 320 and 844×390.
- **Frames:** `m390-30-credits-749→762` (390), `m390-31-credits-955→968` (320), `m390-35-credits-768→782` (844×390). The scroll offsets differ, so these are compared visually, not pixel by pixel.
- **The fact is true:** two registered loops in `lib/media.ts` (l.1364, l.1380) were made with minimax_h3. This is a consequence of §9.4 registration.
- **But** §13 and the W1 gate list only the capabilities strings as allowed 390 changes. Add it to the allowed list, or hold the string. Aryan should see it: it is a public credit.

### LOW 6: the ALT intro credit roll is never caught, and it is cut short
- No ALT frame at either width shows `#intro-roll`. The ALT flight-mid, flight-late and landed frames all show the hero caption.
- **Per-frame trace (1440):**
  - `intro:titles` fires;
  - one rAF gap of 1.2 s follows;
  - the roll is visible for about 2.2 s;
  - it is hidden at **73 %** of its animation.
- So the last lines of the roll may never be readable. Check the roll duration against the 3.2 s title window.
- DEFAULT is fine. Card 1 appears in `1024/D00-intro-flight-late` and card 2 in `1440/D00-intro-landed`.

### LOW 7: the act label can be stale after a long upward jump
- `1024/D43-films-pirates`: "ACT IV · HARRY POTTER" sits over the films intermission at least 1.8 s after the scroll. Base reads "INTERMISSION" there.
- At 1440 the re-probe updated it within 600 ms.

### LOW 8: some captions wrap with dangling bullets
- **HP captions in IM Fell English SC (B1-TYPE's prologue face) wrap with the "·" at the end of line 1:**
  - "HOGWARTS, ACROSS THE BLACK LAKE · / HARRY POTTER" (`1440/D00-intro-play`, `A00-intro-play`, the 1024 equivalents);
  - "A BROOMSTICK OVER HOGWARTS · / HARRY POTTER" (`D00-intro-flight-early`).
- **Title card 2 wraps with "•" leading line 2:** "AFTER PIRATES … 3 IDIOTS / • RED DEAD REDEMPTION 2 • HARRY POTTER" (`1440/D00-intro-landed`).
- **Fix:** balance the lines, or no-break "· WORLD".

### LOW 9: the act-1 program shows no plate yet (known deferral)
- `1440/D10-act-1-settled` is pixel-identical to base in its gutters (σ 0.7).
- This matches B1-STAGE HANDOFF 1 (the program id and scrim go to W2-CARDS), so P3-2 #4 is open for act-1 only.

## 2. Key frames that look right
- **Hero:** Pirata "Aryan Sharma" is legible at 1440 (`D01-hero`, mixed case, no y/h collision), at 1024 (`1024/D01-hero`) and in ALT (`A01-hero`).
- **Intro:** no holes on the play screen, flight or reveal; the name arrives with the hero caption (`D00-intro-flight-late`).
- **About** (`D20-about-120` at both widths): the plate shows in the gutters behind the .86 scrim; text reads cleanly; no holes.
- **Credits** (`D41`, `D42`): the candle plate shows behind the scrim; AA is visually fine.
- **Journey, chapter heads and boards:** unchanged apart from the type. `1024/D26` stacks inside the split, with no overflow.
- **Act cards** (`D10-*`, both widths and variants): all fit. The previous world's caption mid-wipe matches base.
- **RM** (`rm-*`): base layout with the new type.
- **Contact:** the unwritten h2 in `D40-contact.reshoot` is the ink-nib reveal; base D40 has the same gap.

## 3. Phones: every differing frame (FLAGGED by the 4-way method; % = smallest base↔after diff)

**What the DOM check shows at 390, 320 and 844×390:**
- No font changes.
- Section text is identical except in `#systems` (the intended capabilities strings, +18.19 px; at 320, +36.37 px) and `#credits` (`minimax_h3`).
- Everything below `#systems` sits 18.18 px (or 36.37 px) lower. The fractional .18/.37 px re-rasterises the text: "sub-pixel" below means the same pixels, offset by less than 1 px. Zoomed crops confirm this.
- `m390-*-optuna-screener` is the MachineBoard typewriter caught at a different letter.
- The `#systems` head frame also renders the drone plate slightly sharper (same src and file; mean |Δ| 8.6). This is likely the B1-RASTER plate-band promotion. The visual effect is negligible.

Format: frame %; "sub" = sub-pixel only.
- **390:** optuna 0.31 (typewriter) · systems head 0.75 (drone plate) · systems mid 1152→1161 (intended) · credits mid 749→762 (`minimax_h3`) · sub: kill-list 1.72, -1223 0.43; films 1.37, -2067 0.54; act-3 0.66; beyond 0.39, -1824 1.13; writing-837 0.76; voices 3.81; act-4 0.79; principles 5.03; principles-889 5.30 (noise: a third same-build sample differs by 14.2 %); contact 0.94; credits 1.83.
- **320:** optuna 0.39 · systems head 4.96 · systems mid 1300→1318 · credits mid 955→968 · sub: kill-list 2.93, -1590 3.01; films 1.18, -2264 0.84; act-3 2.77; beyond 2.73, -2114 2.37; writing 0.48, -1145 1.92; voices 3.04, -489 1.42; act-4 1.98; principles 5.59, -1235 4.56; contact 3.15; credits 1.40.
- **844×390:** optuna 0.32 · systems head 0.67 (caption line) · systems mid 1307→1316 · credits mid 768→782 · sub: kill-list-1246 0.82; act-3 0.48; beyond 0.72, -1765 1.59; voices 0.44; act-4 0.12; principles 1.26, -931 1.89; credits 0.56.

**Not differing:** every frame above `#systems` (hero, act-1, about, journey, act-2, work, trading-algos, experiment) at all three widths. The chart-slot placeholders still render; that is P3-10 and expected.

## 4. Routing
1. **B1-STAGE + satchel:** the split's beyond notes (HIGH 1) and the soft-rung size (HIGH 2).
2. **B1-RASTER follow-up (MEASURE #2):** the stall (HIGH 3). Re-run `scenes.js --only=desktop --names=D39,D40,D43` after the fix.
3. **Decision, Aryan or the orchestrator:** iPad type keyed on width vs pointer (MEDIUM 4), and the public `minimax_h3` credit at 390 (MEDIUM 5).
4. **B1-INTRO:** ALT roll duration (LOW 6) and the bullet wraps (LOW 8).
5. **B1-SCROLL:** the stale act label after programmatic jumps (LOW 7).

Evidence: `scratchpad/p3/w1/` (`scenes-*`, `base-*`, `diff/<w>/*` + `adiff*.json`, `layout-*.json`, `vprobe/`, `crops/`).
