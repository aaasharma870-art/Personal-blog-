# P3 W2 visual capture (2026-10-02)

**Verdict: not clean.**
- **Two HIGH** (both in MEASURE, now confirmed on screen): the loglines never show, and the pinned cards trail the scroll by seconds.
- **Four new MEDIUM:**
  - css-tier title masks lose letters, and their exit tail looks broken at rest;
  - MATCH_ROW misses on two cards at 1440;
  - the chalk label is clipped;
  - the opening hook is a small clipped porthole.
- **Phones** (390, 320, 844×390): only the intended `#systems` strings change, plus W1's open `minimax_h3` credit.
- **iPad:** differs only by W1's open world-type question; W2 adds nothing there.

Contact sheet: `scenes/index.html`, 502 JPGs. It holds 118 + 119 scene frames, 192 card-scrub frames, 29 extras, 40 phone crops and 4 iPad pairs. Frames behind a finding carry a highlighted note.

## 0. What ran
- **Builds:** `:3161` (`.next` built at `9a3611f`) and `:3162` (base `5aa4587`).
- **scenes.js:** `--only=desktop,intro,alt,rm` at 1440 (118 frames) and 1024×768 (119).
- **DP-18 phones and tablet, base / after / after2:**
  - `--only=mobile --touch` at 390×844, 320×640 and 844×390;
  - `--only=mobile,desktop --touch` at 1024×1366;
  - W1's base runs serve as base2 (scenes.js is unchanged).
- **Diffs:** W1's 4-way aligned `adiff.mjs` (thr 8; FLAG = above 0.1 % and above same-build noise), W2-after against W1-after, and the DOM check (`layout.cjs`).
- **Card scrubs:**
  - p .05 / .22 / .45 / .47 / .5 / .75 / .9 / 1, each card, at 1440 and 1024;
  - DEFAULT, `?variant=alt` and `?gl=off`, plus `?gl=force` (scratch only, identical to DEFAULT);
  - each shot waits until the damped p is within .004 of p_raw. A first pass without the wait left frames unsettled.
- **Extras:** chip and panel, the Systems pencil, the post-credits tail (9 shots), a scenes-style act-1 and act-2 mid approach (+1.6 / +4 / +8 s), and the meet-frame MATCH_ROW.
- **checks.json, every run:** 0 console errors, 0 hydration warnings, 0 overflow, h1 = 1. cardFit passes at 900 and 768.
- **Servers:** both stopped. Evidence: `scratchpad/p3/w2/vis/`.

**Caveat:** headless never engaged GL in my scrubs. `tier` stayed `css` at every p, even with `?gl=force`, and DEFAULT ≈ `?gl=off` pixel for pixel. So every card frame here is the **css tier**; GL visuals remain MEASURE's lab evidence.

## 1. Findings (most severe first)

### HIGH 1: star (b) has an empty lower bar on every card (P3-7 #4)
- **Frames:**
  - `cards/*/{default,variant-alt,gl-off}/*-p0.5`, both widths;
  - `1440/D10-act-4-mid`;
  - `extras/1440x900-mid-act-2-mid-4000`.
- **What shows:** from p .5 the h2, caption and tip fade out as designed, and nothing replaces them. The logline is in the DOM with opacity 0 (seam: "What I build, how I try to break it, and what didn't survive.").
- **Cause:** MEASURE's specificity bug.

### HIGH 2: the pinned card trails the reader by seconds, visibly (MEASURE #3/#4)
- **Method:** a fresh load, then a 560 ms stepped scroll to act-2 mid (p .50).

  | | damped p at +1.6 s |
  |---|---|
  | 1440 | .34 |
  | 1024 | .06 (the hook, while the reader sits at the midpoint) |

  Both had settled by 4 s. At act-1 at 1440 the damped p was .63 against a target of .915.
- **Visible effect:**
  - `1440/D10-act-2-mid` and `1024/D10-act-2-mid` show a **blank board**, the FIG not yet drawn;
  - `D10-act-3/4-settled` sit near p .95.
- **Instant jumps:** in the scrubs, these took 4.5–5.4 s to settle: opening .05 from the page end, 5.4 s (DEFAULT) and 4.9 s (ALT); seam .9, 4.5 s (`?gl=off`). That does not read as "immediate jumps skip the damping" (P3-6 #2).

### MEDIUM 3: title masks (css) lose letters, and the exit tail reads as broken (P3-7 #1)
- **Frames:** `cards/*/default/*-p0.75`, `-p0.9`; `1440/D10-act-1-mid`.
- **At .75:** a dim word on near-black. Letters over dark plate vanish:
  - "The F" (the tree line);
  - "THE" of *THE LIGHT*;
  - the "C" of *Crossing*.
  - *The Workshop* reads well.
- **At p .92–.99:** the plate shows through one or two giant letters, and a reader who stops there keeps that frame:
  - `extras/1024x768-mid-act-1-mid-1600`: rest at .948, three vertical ship slabs;
  - `1440/D10-act-3-settled`: a blob;
  - `D10-act-4-settled`: ragged edges.
- **Fix:** a bone hairline or inner glow on the mask letters, or a luminance floor inside the mask; and let the > .92 tail resolve fast to the full plate.

### MEDIUM 4: MATCH_ROW misses on two cards (P3-6 #6; MEASURE had it NOT MEASURED)
Row = frame top + .47 × frame height, in viewport px, on the meet frames (opening .02, seam .22, tintype .03, ignite .22):

| | opening | seam | tintype | ignite | spec |
|---|---|---|---|---|---|
| 1440 | 480 | **452** | **455** | 480 | 480 ± 6 |
| 1024 | **418** | **403** | 406 | 410 | 410 ± 6 |

- **Cause:** the 3 IDIOTS and RDR2 heading blocks are shorter, so their frames start 25–28 px higher.
- **Overlays:** `extras/row-*`. I could not judge image-feature registration by eye at the css tier.
- **Decide:** is the spec row viewport-absolute (fix the offsets) or frame-relative (amend §13)?

### MEDIUM 5: the chalk FIG label is clipped (W2-CARDS left it unchecked)
- **1440:** fine at the settle. The push clips "…16 CONTROL POIN" from p .5 to 1 (`cards/1440x900/default/seam-p1`, `1440/D10-act-2-settled`).
- **1024:**
  - runs off the board at the settle ("…CONTROL PO", `seam-p0.47`);
  - "…16 C" at p 1 (`extras/chalk-1024-p1`);
  - also under RM (`1024/rm-04-act-2`).
- **History:** pre-existing at 1024 (W1 RM the same); W2's push adds it at 1440.
- **Fix:** shorten or wrap the label, or keep it inside the board's safe box at the maximum push zoom.

### MEDIUM 6: the opening hook (p .05) is a small, clipped porthole (P3-6 #3)
- **Frames:** `cards/*/default/opening-p0.05`, `extras/opening-hook-1440`; ALT is the same.
- **What shows:** about 70 % of the frame is empty dark. A ~340 px iris sits at the far right, and the frame edge shaves its gold rim flat.
- **Other hooks:** they read as pictures (the storm with a faint tentacle and the kraken toast; the sepia tintype; the camp).
- **Fix:** centre the iris, or keep it inside the frame, before the J5–J7 hook test.

### LOW 7: the outgoing caption sits over the new world at the meet
- **Frames:** `seam-p0.22`, `ignite-p0.22`, at both widths and in ALT.
- **What shows:**
  - "THE KRAKEN'S STORM · PIRATES…" stays over a frame that is mostly the hall;
  - "THE CAMPFIRE · RDR2" stays over a Great Hall that has fully replaced the camp;
  - the new caption shows at the bottom at the same time.
- **Fix:** fade the old caption by the meet.

### LOW 8: the post-credits tail plays, but is hard to see (P3-8 #8)
- **Frames:** `extras/*-tail-*`.
- **It plays:** the broom drifts in at about 3 s and tips up at about 4.4 s (1440).
- **Hard to see:** small, dark brown on near-black.
- **Staging:** the "↑ Back to the opening" link it pauses under is above the viewport at the page end, at both widths.
- **Slow shots:** one 1440 tail screenshot timed out at 30 s (with a second browser busy); a solo re-run took 1.6–4.8 s per shot.

### LOW 9: an honesty nit in the Systems META (CONTENT-RULES; unsigned)
- **Frames:** `extras/1440x900-X11-systems-pencil`, `extras/systems-390-base-after`.
- **The nit:** the pencil body is scoped "on desktop". The META "WEBGL, WHERE SUPPORTED, ONLY FOR SCENE CHANGES" is not, and it shows on phones, which never get GL.
- **Suggestion:** "ON DESKTOP, WHERE SUPPORTED" (Aryan or the orchestrator).

### LOW 10: the egg chip is a bare "0/12"
- **What shows:** no icon and no hover tooltip; the meaning lives only in the aria-label.
- **The panel is clear** (`extras/*-X03-hunt-panel`): 12 hints by world and "Turn off easter eggs".
- **Gap:** some hints point at W3 hosts not yet placed (HUNT #2). Feeds J4.

## 2. W1 items
- **Fixed:**
  - HIGH 1, satchel (`D33`/`D35`, both widths);
  - HIGH 2, soft plate (`D26` reads as soft, not blocky);
  - HIGH 3: no blank or half-painted scenes frame (`D39`/`D40`/`D43` fine);
  - LOW 9: the act-1 program has its backdrop.
- **Open:**
  - LOW 6: the ALT roll is never caught (`A00-*`);
  - LOW 7: stale "ACT III · RED DEAD REDEMPTION 2" over the intermission at 1024 (`1024/D43`, `A43`; 1440 is now correct);
  - LOW 8: line-end bullet wraps (`D00-intro-play`, "VIRUS'S DESK ·", "GOLDEN HOUR IN THE HEARTLANDS ·", "THE CAMPFIRE ·");
  - MEDIUM 4 iPad type and MEDIUM 5 `minimax_h3`, both with Aryan.
- **Pre-existing, not W2:** the 1024 "HOW THIS PAGE IS BUILT" FIG labels overprint.

## 3. Looks right
- **Header:** the chip and speaker show on desktop only; phones and the iPad keep "WORK ~ MENU".
- **Meets and settles:** the meets (.22) show both halves; all four settles (.47) are clean, including the tintype inset and the Dead Eye ALT.
- **Other states:** the ALT rack-focus, RM (static P3-0), and the Systems strings at all widths.
- **Hunt:** the kraken long look toasts "EGG 1 OF 12 · THE KRAKEN".

## 4. Phones and iPad
**DOM against base:**
- No font changes at 390, 320 or 844×390.
- Text changes:
  - **`#systems` (intended):** +58.87 / +77.06 / +18.18 px; the pencil line now renders on phones.
  - **`#credits`:** `minimax_h3` (+27 px).
  - **Loglines:** SR-only (h Δ0).
- Everything below `#systems` shifts by that height.

**Flagged frames** (per-frame % and crops are on the sheet's phone groups):
- **Above the threshold:** 390 has 14, 320 has 9, 844×390 has 11.
- **Noise:** the optuna typewriter (0.30–0.47 %).
- **Systems head:** the drone plate re-rasterised, no content change (0.86–11.16 %).
- **390 films:** 0.19 %. The compass finale's course line has started (animation phase).
- **Everything else (0.16–3.57 %):** sub-pixel. The same text is re-rasterised by the fractional offset below `#systems`.
- **Offsets differ:** the systems-mid frames (intended) and the credits-mid frames (`minimax_h3`).
- **844×390 act-3 and act-4 cards:** broken identically in base (a ~50 px column, overprinted title and caption). Pre-existing, for Phase 4.
- **Nothing above `#systems` differs** at any phone width.

**iPad:**
- 80 of 95 frames are flagged against base (median 5 %): W1's world type plus the fast-lane label.
- W2-after against W1-after differs only on W1's blank `D40` and `D43`.
- after against after2 is stable (≤ 0.06 %). No pin, Lenis, chip or sound shows.

## 5. Routing
1. **W2-CARDS:**
   - the subtitle (HIGH 1);
   - the masks (MEDIUM 3);
   - the chalk safe box (MEDIUM 5);
   - the iris (MEDIUM 6);
   - the old-caption fade (LOW 7).
2. **Perf:** the damped-p lag (HIGH 2). Re-shoot `scenes.js --only=desktop --names=D10` afterwards.
3. **Orchestrator:** MATCH_ROW semantics (MEDIUM 4).
4. **W2-HUNT:** the tail's contrast and staging (LOW 8); the chip affordance (LOW 10).
5. **Aryan:** the META scope (LOW 9), `minimax_h3`, the iPad type.
