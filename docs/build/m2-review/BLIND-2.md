# M2 blind re-test #2 (3 judges, 84 anonymized blind frames) — 2026-09-29, 14:55–15:11 UTC

**What was judged:** the first `docs/build/m2-after2` capture, taken at head `daac296` (after the first fix round, `cb1b904`). The fix round that followed (`d4a2cd8`) re-captured `m2-after2` in place, so **the PNGs in `m2-after2/` today are newer than the frames scored here.** None of the post-fix frames has been judged yet.

**Method:**
- Judges saw only `*.blind.png`: all text hidden by CSS, shapes kept. Frames were downscaled to 1024 px JPGs with shuffled neutral ids (`tools/capture/anon.mjs`). An alt frame whose blind image matched its default's (48×30 greyscale, mean abs diff < 4) was judged once, under the default's name. That is why 22 alt frames have no row of their own, among them A00-intro-play, A10-act-2-enter, A20–A23, A25, A30, A32–A34, A36, A37, A40, and the A80/A85 pirates and idiots loaders.
- Key: `judge2-key.json` (J001…J084 → frame). Raw verdicts: `verdicts2-j1.json`, `verdicts2-j2.json`, `verdicts2-j3.json`.
- **PASS** means at least 2 of 3 judges named the intended film at confidence ≥ 0.6. **Wrong-film** means a judge named a different film at ≥ 0.5. Enter and mid transition frames legitimately show the outgoing world (RECOGNIZABILITY §10, TRANSITION rule).
- The table was scored by `score2.mjs`, the scorer of the time. The "J1 note" column is judge 1's reason.

| Frame | Mode | Intended | J1 / J2 / J3 | Result | J1 note |
|---|---|---|---|---|---|
| A00-intro-flight-early | CAPTION | hp | pirates 0.50 / pirates 0.45 / pirates 0.50 | FAIL (2 wrong-film) | Pirates seascape dominates; an HP broomstick is streaking in, blending the two |
| A00-intro-flight-late | CAPTION | hp | pirates 0.60 / pirates 0.65 / pirates 0.55 | FAIL (3 wrong-film) | Same as J001: ship plus eerie cursed sea says Pirates, but generic seascape |
| A00-intro-flight-mid | CAPTION | hp | pirates 0.60 / pirates 0.65 / pirates 0.55 | FAIL (3 wrong-film) | Same hero seascape |
| A00-intro-landed | TRANSITION | pirates | pirates 0.60 / pirates 0.65 / pirates 0.55 | PASS | Same hero seascape |
| A01-hero | BLIND | pirates | pirates 0.60 / pirates 0.65 / pirates 0.55 | PASS | Three-masted ship plus cursed-looking bioluminescent sea reads Black Pearl, but a ship at sea is fairly generic |
| A10-act-1-enter | TRANSITION | pirates | pirates 0.80 / pirates 0.80 / pirates 0.80 | PASS | Same as J018: shredded black sails |
| A10-act-1-mid | TRANSITION | pirates | pirates 0.90 / pirates 0.90 / pirates 0.85 | PASS | Ghostly ship with shredded sails and glowing lanterns is the Black Pearl |
| A10-act-1-settled | BLIND | pirates | pirates 0.85 / pirates 0.85 / pirates 0.80 | PASS | Pirate ship plus island treasure map is Pirates |
| A10-act-2-mid | TRANSITION | idiots | idiots 0.55 / idiots 0.50 / idiots 0.55 | FAIL | Lecture hall dominates; Pirates sea is blending in |
| A10-act-2-settled | BLIND | idiots | idiots 0.55 / idiots 0.55 / idiots 0.55 | FAIL | Lecture hall evokes ICE; the wavy board hints at a sea transition but classroom is generic |
| A10-act-3-enter | TRANSITION | rdr2 | rdr2 0.55 / rdr2 0.55 / rdr2 0.60 | FAIL | Red-tinted western skyline and vultures evoke RDR2 Dead Eye/frontier, but mostly a dark empty frame |
| A10-act-3-mid | TRANSITION | rdr2 | rdr2 0.80 / rdr2 0.85 / rdr2 0.80 | PASS | Red-filtered western ranch plus Dead Eye X-tag targets is classic RDR2 |
| A10-act-3-settled | BLIND | rdr2 | rdr2 0.80 / rdr2 0.85 / rdr2 0.80 | PASS | Same as J016: red western ranch plus Dead Eye X tags |
| A10-act-4-enter | TRANSITION | hp | ?? 0.20 / ?? 0.10 / rdr2 0.25 | FAIL | Too little visible; faint tent glow hints at camp but nothing readable |
| A10-act-4-mid | TRANSITION | hp | hp 0.85 / hp 0.90 / hp 0.90 | PASS | Great Hall tables and candles with a wand trail |
| A10-act-4-settled | BLIND | hp | hp 0.97 / hp 0.95 / hp 0.95 | PASS | Unmistakable Great Hall |
| A24-work | BLIND | idiots | idiots 0.40 / idiots 0.40 / idiots 0.40 | FAIL | Looks like the IIM-A style ICE campus, but a corridor alone is generic |
| A27-optuna-screener | CAPTION | idiots | idiots 0.55 / idiots 0.55 / idiots 0.55 | FAIL | Indian stone-walled lecture hall evokes ICE but a classroom is generic |
| A29-systems | BLIND | idiots | idiots 0.75 / idiots 0.75 / idiots 0.70 | PASS | DIY drone at an Indian campus colonnade is Rancho's drone at ICE |
| A31-voices | BLIND | rdr2 | rdr2 0.65 / rdr2 0.70 / rdr2 0.70 | PASS | Western canvas tents and campfire read RDR2 camp, though generic camping |
| A35-beyond-2800 | CAPTION | rdr2 | rdr2 0.70 / rdr2 0.55 / rdr2 0.70 | PASS | Same WANTED board |
| A38-principles | BLIND | hp | hp 0.70 / hp 0.80 / hp 0.75 | PASS | Floating candles in a night sky is the Great Hall ceiling |
| A39-principles-1000 | BLIND | hp | hp 0.55 / hp 0.80 / hp 0.70 | PASS | Floating candles give HP flavour but it's mostly a list layout |
| A43-films-pirates | BLIND | pirates | pirates 0.90 / pirates 0.90 / pirates 0.85 | PASS | Tattered-sail ghost ship plus treasure X is Pirates |
| A44-films-idiots | BLIND | idiots | idiots 0.85 / idiots 0.90 / idiots 0.90 | PASS | Yellow scooter at a still Himalayan lake is the 3 Idiots finale |
| A45-films-rdr2 | BLIND | rdr2 | rdr2 0.60 / rdr2 0.65 / rdr2 0.65 | PASS | Saddled horse on open prairie at twilight evokes RDR2, somewhat generic western |
| A46-films-hp | BLIND | hp | hp 0.90 / hp 0.85 / hp 0.80 | PASS | Parchment with glowing footprints, floating candles and castle window is pure HP |
| A80-loader-card-hp | BLIND | hp | hp 0.50 / hp 0.45 / hp 0.45 | FAIL | Parchment castle maps suggest Marauder's Map but they're very small |
| A80-loader-card-rdr2 | BLIND | rdr2 | rdr2 0.60 / rdr2 0.55 / rdr2 0.55 | FAIL | Red tint plus successive X tags reads as Dead Eye marking, but small thumbnails |
| A85-loader-route-principles | CAPTION | hp | hp 0.55 / hp 0.40 / hp 0.50 | FAIL | Parchment castle floor plan with banner suggests the Marauder's Map, but it's tiny and could pass as any treasure/floor map |
| A85-loader-route-writing | CAPTION | rdr2 | rdr2 0.50 / rdr2 0.50 / rdr2 0.50 | FAIL | Red-tinted frontier silhouette hints Dead Eye/western ranch, but tiny, flat and generic |
| D00-intro-flight-early | CAPTION | hp | hp 0.50 / hp 0.55 / hp 0.55 | FAIL | The broom is the subject (HP), but the backdrop is the Pirates cursed sea, a clear blend |
| D00-intro-flight-late | CAPTION | hp | pirates 0.60 / pirates 0.65 / pirates 0.55 | FAIL (3 wrong-film) | Same hero seascape |
| D00-intro-flight-mid | CAPTION | hp | pirates 0.60 / pirates 0.65 / pirates 0.55 | FAIL (3 wrong-film) | Same hero seascape |
| D00-intro-landed | TRANSITION | pirates | pirates 0.60 / pirates 0.65 / pirates 0.55 | PASS | Same hero seascape |
| D00-intro-play | BLIND | hp | hp 0.95 / hp 0.95 / hp 0.95 | PASS | Hogwarts silhouette, floating candles and a broom are instantly Harry Potter |
| D01-hero | BLIND | pirates | pirates 0.60 / pirates 0.65 / pirates 0.55 | PASS | Same hero seascape; ship plus cursed glow suggests Pirates |
| D10-act-1-enter | TRANSITION | pirates | pirates 0.80 / pirates 0.80 / pirates 0.80 | PASS | Shredded black sails are the Black Pearl |
| D10-act-1-mid | TRANSITION | pirates | pirates 0.90 / pirates 0.90 / pirates 0.85 | PASS | Tattered-sail ship plus Jack's compass is clearly Pirates |
| D10-act-1-settled | BLIND | pirates | pirates 0.70 / pirates 0.65 / pirates 0.75 | PASS | Jack's compass and sea strip read Pirates |
| D10-act-2-enter | TRANSITION | idiots | pirates 0.70 / pirates 0.70 / pirates 0.75 | FAIL (3 wrong-film) | Compass + treasure-route-to-X + Aztec coin medallion reads Pirates |
| D10-act-2-mid | TRANSITION | idiots | idiots 0.55 / idiots 0.50 / idiots 0.55 | FAIL | Lecture hall dominates; a Pirates sea is blending in from above |
| D10-act-2-settled | BLIND | idiots | idiots 0.55 / idiots 0.55 / idiots 0.60 | FAIL | Stone-walled Indian lecture hall with engineering chalk suggests ICE, but classrooms are generic |
| D10-act-3-enter | TRANSITION | rdr2 | rdr2 0.40 / rdr2 0.40 / rdr2 0.40 | FAIL | Sunlit frontier valley with mountains feels RDR2 but only a sliver is visible and the rest of the frame is black |
| D10-act-3-mid | TRANSITION | rdr2 | rdr2 0.75 / rdr2 0.70 / rdr2 0.70 | PASS | Saddled horse on warm frontier plains at golden hour feels exactly like RDR2 |
| D10-act-3-settled | BLIND | rdr2 | rdr2 0.75 / rdr2 0.70 / rdr2 0.70 | PASS | Same RDR2 golden-hour horse vista |
| D10-act-4-enter | TRANSITION | hp | rdr2 0.85 / rdr2 0.75 / rdr2 0.75 | FAIL (3 wrong-film) | Canvas tents, cookpot fire and tethered horses by a lake is the Van der Linde camp |
| D10-act-4-mid | TRANSITION | hp | hp 0.45 / hp 0.55 / hp 0.55 | FAIL | Long hall tables and candle/wand line dominate, but a western camp with pines and horses is blended in heavily |
| D10-act-4-settled | BLIND | hp | hp 0.97 / hp 0.95 / hp 0.95 | PASS | Unmistakable Great Hall |
| D20-about-120 | CAPTION | pirates | pirates 0.60 / pirates 0.55 / pirates 0.65 | PASS | Octagonal flip compass on nautical lines suggests Jack's compass, but it's a lone small icon |
| D21-journey-step-1 | BLIND | pirates | pirates 0.75 / pirates 0.80 / pirates 0.75 | PASS | Night port full of sailing ships plus compass route to X reads Port Royal/Tortuga |
| D22-journey-step-3 | BLIND | pirates | pirates 0.70 / pirates 0.85 / pirates 0.85 | PASS | Storm sea plus compass route to X with a skull is Pirates |
| D23-journey-step-4 | BLIND | pirates | pirates 0.75 / pirates 0.80 / pirates 0.80 | PASS | Ship, cursed-glow wake, compass and skull-to-X route together clearly say Pirates |
| D24-work | BLIND | idiots | idiots 0.40 / idiots 0.40 / idiots 0.40 | FAIL | Same campus corridor, generic |
| D25-work-700 | BLIND | idiots | ?? 0.10 / ?? 0.05 / ?? 0.00 | FAIL | No imagery |
| D26-trading-algos | CAPTION | idiots | ?? 0.25 / ?? 0.15 / idiots 0.30 | FAIL | Wood-framed board may be a 3 Idiots chalkboard, but it's just a generic system diagram |
| D27-optuna-screener | CAPTION | idiots | idiots 0.55 / idiots 0.55 / idiots 0.60 | FAIL | Indian lecture hall evokes ICE but generic |
| D28-experiment | NONE | idiots | ?? 0.10 / ?? 0.05 / ?? 0.00 | FAIL | Plain data chart, no film imagery |
| D29-systems | BLIND | idiots | idiots 0.75 / idiots 0.75 / idiots 0.70 | PASS | DIY drone on campus is Rancho's drone |
| D30-kill-list | CAPTION | idiots | idiots 0.70 / idiots 0.55 / idiots 0.70 | PASS | Heirloom pen in a box plus stopwatch in a chalkboard room is Virus's pen |
| D31-voices | BLIND | rdr2 | rdr2 0.85 / rdr2 0.80 / rdr2 0.80 | PASS | Covered wagon, canvas tents and campfire is the RDR2 camp |
| D32-beyond | BLIND | rdr2 | rdr2 0.75 / rdr2 0.70 / rdr2 0.70 | PASS | Same frontier golden-hour vista with a horse |
| D33-beyond-950 | CAPTION | rdr2 | rdr2 0.45 / rdr2 0.45 / rdr2 0.40 | FAIL | Hand-drawn wilderness map leading to a camp tent feels RDR2, but could be any adventure map |
| D34-beyond-1900 | BLIND | rdr2 | ?? 0.15 / ?? 0.20 / ?? 0.00 | FAIL | Generic 'what I carry' icons; drone hints 3 Idiots, satchel hints RDR2, nothing decisive |
| D35-beyond-2800 | CAPTION | rdr2 | rdr2 0.70 / rdr2 0.60 / rdr2 0.70 | PASS | Frontier-town bounty board with a fresh poster is RDR2's WANTED board |
| D36-writing | BLIND | rdr2 | rdr2 0.55 / rdr2 0.60 / rdr2 0.55 | FAIL | Hand-sketched journal page evokes Arthur's journal, but a sketchbook is fairly generic |
| D37-writing-1000 | BLIND | rdr2 | rdr2 0.70 / rdr2 0.65 / rdr2 0.75 | PASS | Sketched horse with saddlebags in a wilderness journal is Arthur's journal |
| D38-principles | BLIND | hp | hp 0.85 / hp 0.80 / hp 0.80 | PASS | Folded parchment, corridor outlines and walking inked footprints are unmistakably the Marauder's Map |
| D39-principles-1000 | BLIND | hp | hp 0.75 / hp 0.75 / hp 0.75 | PASS | Parchment corridors with moving ink footprints is the Marauder's Map |
| D40-contact | BLIND | hp | hp 0.75 / hp 0.75 / hp 0.70 | PASS | Floating candles under a night-sky ceiling is the Great Hall |
| D41-credits | CAPTION | — | ?? 0.10 / ?? 0.05 / ?? 0.00 | n/a | No imagery at all, just dividers on black |
| D42-credits-1000 | CAPTION | — | hp 0.55 / hp 0.30 / hp 0.45 | n/a (1 wrong-film) | Snitch and Hallows symbols are HP but they're tiny on a mostly empty page |
| D43-films-pirates | BLIND | pirates | pirates 0.92 / pirates 0.90 / pirates 0.85 | PASS | Tattered black sails, lanterns and the compass are unmistakable |
| D44-films-idiots | BLIND | idiots | idiots 0.85 / idiots 0.90 / idiots 0.90 | PASS | Yellow scooter at the Himalayan lake is the 3 Idiots ending |
| D45-films-rdr2 | BLIND | rdr2 | rdr2 0.60 / rdr2 0.65 / rdr2 0.65 | PASS | Horse on twilight prairie with a trail line feels RDR2, fairly generic |
| D46-films-hp | BLIND | hp | hp 0.95 / hp 0.95 / hp 0.95 | PASS | Red steam train on the curved stone viaduct is iconic Harry Potter |
| D80-loader-card-hp | BLIND | hp | hp 0.75 / hp 0.65 / hp 0.65 | PASS | Floating candles plus a wand-tip trail is Great Hall/Hogwarts iconography even at thumbnail size |
| D80-loader-card-idiots | BLIND | idiots | idiots 0.60 / idiots 0.50 / idiots 0.75 | PASS | Chalkboard drone doodle points to Rancho's drone, though tiny and could be any engineering classroom |
| D80-loader-card-pirates | BLIND | pirates | pirates 0.70 / pirates 0.70 / pirates 0.75 | PASS | Compass and ship-to-X, small but clear |
| D80-loader-card-rdr2 | BLIND | rdr2 | rdr2 0.60 / rdr2 0.60 / rdr2 0.50 | PASS | Pencil sketch of horse and fence reads as Arthur's journal |
| D85-loader-route-about | CAPTION | pirates | pirates 0.75 / pirates 0.75 / pirates 0.75 | PASS | Compass plus ship-to-X route reads as Jack's compass pointing to treasure |
| D85-loader-route-principles | CAPTION | hp | hp 0.75 / hp 0.75 / hp 0.80 | PASS | Wand lighting floating candles is HP |
| D85-loader-route-work | CAPTION | idiots | idiots 0.80 / idiots 0.60 / idiots 0.85 | PASS | Drone plus the space pen with an orbit ring on a chalkboard is very 3 Idiots |
| D85-loader-route-writing | CAPTION | rdr2 | rdr2 0.70 / rdr2 0.70 / rdr2 0.70 | PASS | Cowboy hat and horse pencil sketch reads as Arthur's journal |

**BLIND pass 35/44; all-with-film pass 52/82; wrong-film frames 8.**

| World | BLIND-mode frames | All frames with a film |
|---|---|---|
| Pirates | 10 / 10 | 18 / 18 |
| Harry Potter | 11 / 12 | 13 / 24 (includes the 6 intro hand-off beats, scored as HP) |
| Red Dead Redemption 2 | 9 / 12 | 14 / 21 |
| 3 Idiots | 5 / 10 | 7 / 19 |

**Trend (BLIND-mode frames):** audit 15/53 (all frames, pre-M2) → re-test #1 25/43 → **re-test #2 35/44**.

## Reading notes (they change what the numbers mean)

1. **The intro rows are not valid measurements.** The harness took each beat's blind shot about 2 s after its captioned shot. The judges therefore saw the sea while the captioned frame still showed Hogwarts. The old scorer also expected HP on beats where the flight had already handed off to the Pirates caption.
   - The fix round (`d4a2cd8`) now shoots both passes at the same instant on the video's own clock, labels each beat with the film whose caption is on screen, and accepts either film on the hand-off beats.
   - Re-scored with that corrected rule, the same verdicts give **BLIND 35/44; all-with-film 56/81; wrong-film frames 2.** The intro beats still need a real re-test.
2. **Three failures are capture misses, not scene failures.** D25-work-700 ("no imagery"), D33-beyond-950 and D34-beyond-1900 used fixed scroll offsets that went stale after layout changes, so they shot the wrong part of the page. D34 caught the satchel instead of the WANTED poster.
   - The same WANTED board, in D35/A35, reads as RDR2 at 0.70/0.60/0.70.
   - The fix round aims these frames at the elements themselves: D25/A25-work-board, D33/A33-beyond-satchel and D34/A34-beyond-wanted.
3. **D28-experiment carries no film by rule** (H4: no film styling next to research). The old scorer counted it as a 3 Idiots FAIL; the corrected scorer marks it n/a. D41 and D42 (credits) are text-only by design and are n/a.
4. **The other 7 BLIND failures** (9 in all, minus the capture misses D25 and D34), and what the fix round did about each:
   - D10/A10-act-2-settled: lecture hall "generic classroom", 0.55. Fix: Rancho's homemade drone chalked large on the board.
   - D24/A24-work: the corridor band read as generic architecture, 0.40. Fix: the band was replaced by Virus's astronaut pen on his desk.
   - D36-writing: 0.55–0.60. Fix: the journal sketch page now opens beside the section heading.
   - A80-loader-card-hp and A80-loader-card-rdr2: 0.45–0.60. **Not fixed.** At about 120 px there is too little room for detail; the route-size loaders carry captions.
   None of these fixes has been judged.
