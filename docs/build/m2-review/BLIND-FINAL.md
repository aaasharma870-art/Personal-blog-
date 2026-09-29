# M5 final blind stranger test (3 judges, 86 anonymized blind frames), 2026-09-29, 16:27–16:51 UTC

**What was judged:** the post-fix `docs/build/m2-after2` capture at code head `d4a2cd8` (M2 fix round 2). This is the first judging of those frames.
- The M5 fix round (`bc1072b`, 17:43 UTC) then changed 25 of these scenes and re-captured them, plus 4 more without a scene change. **Those frames were not re-judged.** They are marked in the "After the test" column below, and on the contact sheet `docs/build/final-frames/index.html`.
- For each marked frame, the verdict below is for the **old** scene.

**Method:**
- Judges saw only `*.blind.png`: CSS hides all text and keeps the shapes. The frames were downscaled to 1024 px JPGs with shuffled neutral ids (`tools/capture/anon.mjs`).
- **The set is 86 of 106 desktop frames.** An alt frame whose blind image matched its default's (48×30 greyscale, mean absolute difference < 4) was judged once, under the default's name. The 20 frames handled that way:
  - A00-intro-play, A10-act-2-enter
  - A20-about-120, A21/A22/A23 journey, A25-work-board, A26-trading-algos, A28-experiment, A30-kill-list
  - A32-beyond, A36/A37 writing, A40-contact, A41/A42 credits
  - the A80 loaders for pirates and idiots, and the A85 route loaders for about and work
- **Files:**
  - Key: `FINAL-judge-key.json` (J001…J086 → frame)
  - Raw verdicts: `FINAL-verdicts-j1.json`, `FINAL-verdicts-j2.json`, `FINAL-verdicts-j3.json`
  - Scored rows: `FINAL-scores.json` (from `tools/capture/score.mjs`, the corrected scorer from the M2 fix round)
- **PASS** means at least 2 of 3 judges named the intended film at confidence ≥ 0.6. **Wrong-film** means a judge named a different film at ≥ 0.5.
- **What counts as intended on the intro hand-off beats:** the film whose caption is on screen.
- **Frames with no film:** D28-experiment carries no film by rule H4, and the credits (D41/D42) are text-only by design. All three are n/a.
- **The mode rules** (RECOGNIZABILITY §10) go further than the scorer:
  - **CAPTION** scenes pass when the on-screen caption names the film and the moment, and no blind judge makes a confident wrong-film guess.
  - **TRANSITION** "enter" frames may legitimately show the outgoing world.

## Totals

| Measure | Result |
|---|---|
| **BLIND-mode frames** | **38 / 45** |
| CAPTION frames (scorer's ≥ 0.6 rule) | 13 / 21. All 21 have 0 wrong-film guesses, so all meet the §10 CAPTION blind guard |
| TRANSITION frames | 12 / 17. The 3 wrong-film frames are all "enter" frames that show the outgoing world |
| All frames with a film | **63 / 83** |
| Wrong-film frames | 3: D10-act-2-enter, D10-act-4-enter and A10-act-4-enter, all outgoing-world enter frames |

| World | BLIND-mode frames | All frames with a film |
|---|---|---|
| Pirates of the Caribbean | 10 / 10 | 20 / 21 |
| 3 Idiots | 9 / 10 | 13 / 18 |
| Red Dead Redemption 2 | 9 / 13 | 15 / 23 |
| Harry Potter | 10 / 12 | 15 / 21 |

**Trend (BLIND-mode frames):** audit 15/53 (all frames, before M2) → re-test #1 25/43 → re-test #2 35/44 → **final 38/45**.

**By world since re-test #2:**
- **3 Idiots:** 5/10 → 9/10. The chalked drone on the Act II board and the astronaut-pen head band both now pass.
- **Harry Potter:** 11/12 → 10/12. The default card loader dropped from a pass to 0.50–0.55.
- **RDR2:** 9/12 → 9/13. The films screen dropped from 0.60–0.65 to 0.55.
- **Pirates:** 10/10, unchanged.

**The intro:** this is the first valid measurement of the intro beats, now that the capture harness is fixed.
- The play screen scores 0.95–0.97.
- The early beat (HP) scores 0.95–0.97.
- The late beat and the landing (Pirates) score 0.60–0.70.
- Only the mid hand-off beat fails, in both variants.

## Every failing frame, and its fallback

| Frame | Mode | Scores | On-screen fallback (captioned frame) | After the test |
|---|---|---|---|---|
| D45 / A45-films-rdr2 | BLIND | 0.55 / 0.55–0.60 ("a generic sunset horse") | Film title RED DEAD REDEMPTION 2, plus the moment caption under the screen | **Replaced:** D is now the Dead Eye plate with ember X marks ("DEAD EYE"); A is the gang's camp at dusk ("THE GANG'S CAMP AT DUSK"). Both captions are proposed. Not re-judged |
| D80-loader-card-hp / -idiots / -rdr2, A80-loader-card-hp / -rdr2 | BLIND | 0.35–0.55 ("tiny") | The /lab strip shows no caption. On the live home page, a card-size loader renders only in the fallback "reel" act card, which none of the four current acts uses. The route loaders render only on /lab, and the 404 page uses the RDR2 stage loader | Enlarged from 120 to 176 px; the motifs are unchanged. Not re-judged |
| D26-trading-algos | CAPTION | 0.20–0.25, 0 wrong-film | A RANCHO-STYLE BLUEPRINT • 3 IDIOTS, above the board | The Act II chalk drone now sits beside the caption at ≥ 1024 px. Not re-judged |
| D27 / A27-optuna-screener | CAPTION | 0.45–0.55, 0 wrong-film ("lecture hall, no signature prop") | WHAT IS A MACHINE? • 3 IDIOTS, plus "What is a machine?" chalked on the board | The chalk drone is on the board's free top-right. Not re-judged |
| A33-beyond-satchel | CAPTION | 0.45–0.60, 0 wrong-film | WHAT'S IN THE SATCHEL • RED DEAD REDEMPTION 2 | Redrawn as a shoulder satchel (D33 too, which passed). Not re-judged |
| A85-loader-route-principles | CAPTION | 0.45–0.50, 0 wrong-film | HARRY POTTER / The Light, plus THE MARAUDER'S MAP • HARRY POTTER | Route art enlarged from 288 to 416 px at ≥ 1280. Not re-judged |
| A85-loader-route-writing | CAPTION | 0.45, 0 wrong-film | RED DEAD REDEMPTION 2 title, plus DEAD EYE • RED DEAD REDEMPTION 2 | Enlarged, as above. Not re-judged |
| A00-intro-flight-mid | CAPTION | Pirates 0.50–0.60, 0 wrong-film | TOWARD THE BLACK PEARL • PIRATES OF THE CARIBBEAN | The folding page is now inked as a sea chart (compass rose, dotted course, red X). Not re-judged |
| D00-intro-flight-mid | CAPTION | HP 0.50–0.60, 0 wrong-film | The designed HP → Pirates hand-off, with both captions on screen | Unchanged, by design |
| D10 / A10-act-3-enter | TRANSITION | 0.30–0.60 ("little is visible") | Card title RED DEAD REDEMPTION 2 at display size, with the ACT III meta | Unchanged. The settled and mid frames pass at 0.70–0.85 |
| D10-act-2-enter | TRANSITION | Pirates 0.60–0.75 (3 wrong-film) | THE KRAKEN'S STORM • PIRATES OF THE CARIBBEAN over the storm, and the 3 IDIOTS title above | Unchanged. The outgoing world is allowed by the TRANSITION rule. Mid and settled pass |
| D10 / A10-act-4-enter | TRANSITION | RDR2 0.50–0.75 (3 wrong-film each) | THE CAMPFIRE • RED DEAD REDEMPTION 2 on the outgoing camp, with the ACT IV · AFTER HARRY POTTER meta | Unchanged, as above. Mid (0.90–0.95) and settled (0.95–0.97) pass |

## Full table (sorted by frame)

The "J1 note" is judge 1's reason, and each score is the film named at that judge's confidence.

| Frame | Mode | Intended | J1 / J2 / J3 | Result | After the test | J1 note |
|---|---|---|---|---|---|---|
| A00-intro-flight-early | CAPTION | hp | hp 0.95 / hp 0.97 / hp 0.95 | PASS |  | Broomstick and Hogwarts spires are unmistakable |
| A00-intro-flight-late | CAPTION | pirates | pirates 0.70 / pirates 0.60 / pirates 0.60 | PASS |  | Stormy ocean plus distant ship silhouette reads as Pirates; somewhat generic seascape |
| A00-intro-flight-mid | CAPTION | pirates | pirates 0.60 / pirates 0.50 / pirates 0.50 | FAIL | **fixed, not re-judged** | Dominant image is the Pirates sea; incoming parchment panel suggests a blend toward a map/journal world |
| A00-intro-landed | TRANSITION | pirates | pirates 0.70 / pirates 0.60 / pirates 0.60 | PASS | re-captured, not re-judged | Stormy ocean with a tall-ship silhouette reads Pirates |
| A01-hero | BLIND | pirates | pirates 0.70 / pirates 0.60 / pirates 0.60 | PASS | re-captured, not re-judged | Dark stormy ocean with a square-rigged ship silhouette reads as Pirates, though a night sea is somewhat generic |
| A10-act-1-enter | TRANSITION | pirates | pirates 0.75 / pirates 0.80 / pirates 0.80 | PASS |  | Both halves are Pirates imagery: dark teal sea and shredded black sails |
| A10-act-1-mid | TRANSITION | pirates | pirates 0.90 / pirates 0.85 / pirates 0.90 | PASS |  | Tattered-sailed ghost ship in fog is the Black Pearl |
| A10-act-1-settled | BLIND | pirates | pirates 0.85 / pirates 0.85 / pirates 0.85 | PASS |  | Ghost-ship hull plus treasure island chart is Pirates |
| A10-act-2-mid | TRANSITION | idiots | idiots 0.55 / idiots 0.60 / idiots 0.60 | PASS |  | Lecture hall and drone sketch dominate (3 Idiots); right side blends into the Pirates sea |
| A10-act-2-settled | BLIND | idiots | idiots 0.75 / idiots 0.70 / idiots 0.75 | PASS |  | Stone lecture hall, wooden benches and drone chalk drawing are ICE |
| A10-act-3-enter | TRANSITION | rdr2 | rdr2 0.50 / rdr2 0.60 / rdr2 0.50 | FAIL |  | Blood-red western sky with vultures feels RDR2, but most of the frame is empty |
| A10-act-3-mid | TRANSITION | rdr2 | rdr2 0.85 / rdr2 0.85 / rdr2 0.85 | PASS |  | Red-filtered western homestead with painted-X targets mirrors RDR2's Dead Eye |
| A10-act-3-settled | BLIND | rdr2 | rdr2 0.85 / rdr2 0.85 / rdr2 0.85 | PASS |  | Red-tinted homestead with X targets is RDR2 Dead Eye |
| A10-act-4-enter | TRANSITION | hp | rdr2 0.55 / rdr2 0.50 / rdr2 0.50 | FAIL (3 wrong-film) |  | Canvas tent and covered wagon among pines read as RDR2 camp, but only partly visible |
| A10-act-4-mid | TRANSITION | hp | hp 0.93 / hp 0.95 / hp 0.90 | PASS |  | Floating candles in the Great Hall plus a spell trail are iconic HP |
| A10-act-4-settled | BLIND | hp | hp 0.97 / hp 0.97 / hp 0.95 | PASS |  | Floating candles and long tables in a Gothic hall are iconic HP |
| A24-work | BLIND | idiots | idiots 0.65 / idiots 0.55 / idiots 0.60 | PASS |  | Engraved pen in presentation box with stopwatch in a classroom is the astronaut pen |
| A27-optuna-screener | CAPTION | idiots | idiots 0.55 / idiots 0.45 / idiots 0.45 | FAIL | **fixed, not re-judged** | Stone lecture hall with wooden benches reads as ICE, but no signature prop |
| A29-systems | BLIND | idiots | idiots 0.75 / idiots 0.60 / idiots 0.75 | PASS |  | Taped DIY drone over an Indian campus lawn is Rancho's drone |
| A31-voices | BLIND | rdr2 | rdr2 0.65 / rdr2 0.50 / rdr2 0.60 | PASS |  | Canvas tents around a campfire in the wilderness evoke RDR2 camp, though camping is generic |
| A33-beyond-satchel | CAPTION | rdr2 | rdr2 0.60 / rdr2 0.45 / rdr2 0.55 | FAIL | **fixed, not re-judged** | Satchel inventory UI and bounty board feel RDR2 |
| A34-beyond-wanted | BLIND | rdr2 | rdr2 0.70 / rdr2 0.60 / rdr2 0.75 | PASS |  | Weathered frontier board with nailed parchment posters is RDR2 bounty board |
| A35-beyond-2800 | CAPTION | rdr2 | rdr2 0.70 / rdr2 0.60 / rdr2 0.75 | PASS |  | Frontier notice board with nailed posters reads as RDR2 bounties |
| A38-principles | BLIND | hp | hp 0.60 / hp 0.80 / hp 0.60 | PASS |  | Floating candles against a night sky evoke the Great Hall ceiling |
| A39-principles-1000 | BLIND | hp | hp 0.60 / hp 0.70 / hp 0.60 | PASS |  | Floating lit candles against a night sky evoke the Great Hall ceiling; otherwise sparse |
| A43-films-pirates | BLIND | pirates | pirates 0.90 / pirates 0.90 / pirates 0.90 | PASS |  | Tattered-sail ghost ship plus treasure trail is the Black Pearl |
| A44-films-idiots | BLIND | idiots | idiots 0.85 / idiots 0.85 / idiots 0.85 | PASS |  | Yellow scooter by a mirror-still Ladakh lake is the 3 Idiots finale |
| A45-films-rdr2 | BLIND | rdr2 | rdr2 0.55 / rdr2 0.60 / rdr2 0.55 | FAIL | **fixed, not re-judged** | Lone saddled horse on prairie at sunset evokes RDR2 but is fairly generic |
| A46-films-hp | BLIND | hp | hp 0.85 / hp 0.85 / hp 0.85 | PASS |  | Floating candles and a castle through arched windows plus footprints on parchment read as Hogwarts and the Marauder's Map |
| A80-loader-card-hp | BLIND | hp | hp 0.40 / hp 0.40 / hp 0.35 | FAIL | **fixed, not re-judged** | Parchment map with scroll banner and corridors hints at the Marauder's Map, but thumbnails are very small |
| A80-loader-card-rdr2 | BLIND | rdr2 | rdr2 0.45 / rdr2 0.50 / rdr2 0.40 | FAIL | **fixed, not re-judged** | Red sunset, lone tree and birds with X targets suggest RDR2 Dead Eye, but thumbnails are tiny |
| A85-loader-route-principles | CAPTION | hp | hp 0.50 / hp 0.45 / hp 0.45 | FAIL | **fixed, not re-judged** | Parchment floor plan with title banner hints Marauder's Map; small |
| A85-loader-route-writing | CAPTION | rdr2 | rdr2 0.45 / rdr2 0.45 / rdr2 0.45 | FAIL | **fixed, not re-judged** | Red western sunset with homestead suggests RDR2, but it is a tiny icon |
| D00-intro-flight-early | CAPTION | hp | hp 0.95 / hp 0.97 / hp 0.95 | PASS |  | Broomstick and lit Hogwarts spires are unmistakable |
| D00-intro-flight-late | CAPTION | pirates | pirates 0.70 / pirates 0.60 / pirates 0.60 | PASS |  | Stormy ocean with a tall-ship silhouette reads Pirates |
| D00-intro-flight-mid | CAPTION | hp | hp 0.60 / hp 0.50 / hp 0.55 | FAIL | re-captured, not re-judged | The broomstick is the clear subject (HP); the bioluminescent night sea is the Pirates world, so this is a mid-transition blend |
| D00-intro-landed | TRANSITION | pirates | pirates 0.70 / pirates 0.60 / pirates 0.60 | PASS |  | Stormy ocean with a tall-ship silhouette reads Pirates |
| D00-intro-play | BLIND | hp | hp 0.95 / hp 0.97 / hp 0.95 | PASS |  | Hogwarts silhouette, floating candles and a broom are unmistakable |
| D01-hero | BLIND | pirates | pirates 0.70 / pirates 0.60 / pirates 0.60 | PASS | re-captured, not re-judged | Stormy ocean with a tall-ship silhouette reads Pirates |
| D10-act-1-enter | TRANSITION | pirates | pirates 0.75 / pirates 0.80 / pirates 0.80 | PASS |  | Dark teal sea and shredded black sails are Pirates |
| D10-act-1-mid | TRANSITION | pirates | pirates 0.90 / pirates 0.90 / pirates 0.90 | PASS |  | Ghostly ship with shredded black sails plus the hinged compass is unmistakably Pirates |
| D10-act-1-settled | BLIND | pirates | pirates 0.70 / pirates 0.65 / pirates 0.65 | PASS |  | Hinged octagonal compass with red needle reads as Jack's compass |
| D10-act-2-enter | TRANSITION | idiots | pirates 0.75 / pirates 0.60 / pirates 0.70 | FAIL (3 wrong-film) |  | Compass, dashed route to X, Aztec medallion and teal sea are Pirates |
| D10-act-2-mid | TRANSITION | idiots | idiots 0.70 / idiots 0.65 / idiots 0.60 | PASS |  | Tiered wooden benches, stone lecture hall and drone chalkboard read as ICE; teal wave edge suggests a blend from the Pirates sea |
| D10-act-2-settled | BLIND | idiots | idiots 0.75 / idiots 0.70 / idiots 0.75 | PASS |  | Tiered wooden benches in a stone lecture hall with a quadcopter chalk sketch is ICE |
| D10-act-3-enter | TRANSITION | rdr2 | rdr2 0.40 / rdr2 0.30 / rdr2 0.35 | FAIL |  | Sepia frontier valley hints at RDR2, but little is visible |
| D10-act-3-mid | TRANSITION | rdr2 | rdr2 0.75 / rdr2 0.70 / rdr2 0.70 | PASS |  | Frontier vista at golden hour with a saddled horse is very RDR2 |
| D10-act-3-settled | BLIND | rdr2 | rdr2 0.75 / rdr2 0.70 / rdr2 0.70 | PASS |  | Sweeping frontier vista at golden hour with a saddled horse and lasso is very RDR2 |
| D10-act-4-enter | TRANSITION | hp | rdr2 0.75 / rdr2 0.60 / rdr2 0.70 | FAIL (3 wrong-film) |  | Both halves show the frontier camp and campfire |
| D10-act-4-mid | TRANSITION | hp | hp 0.90 / hp 0.93 / hp 0.90 | PASS |  | Great Hall with floating candles is iconic HP; faint foliage ghost hints at a blend |
| D10-act-4-settled | BLIND | hp | hp 0.97 / hp 0.97 / hp 0.95 | PASS |  | Floating candles over house tables under an enchanted sky is iconic HP |
| D20-about-120 | CAPTION | pirates | pirates 0.65 / pirates 0.60 / pirates 0.55 | PASS |  | Hinged octagonal compass on a nautical chart reads Pirates |
| D21-journey-step-1 | BLIND | pirates | pirates 0.80 / pirates 0.70 / pirates 0.80 | PASS |  | Lantern-lit port of tall ships plus compass, treasure X and Aztec medallion is Pirates |
| D22-journey-step-3 | BLIND | pirates | pirates 0.75 / pirates 0.75 / pirates 0.75 | PASS |  | Rough sea plus compass and treasure X read Pirates |
| D23-journey-step-4 | BLIND | pirates | pirates 0.75 / pirates 0.70 / pirates 0.80 | PASS |  | Tall ship at sea plus compass, X and skull medallion read Pirates |
| D24-work | BLIND | idiots | idiots 0.65 / idiots 0.55 / idiots 0.60 | PASS |  | Engraved pen in a presentation box in a classroom is the astronaut pen |
| D25-work-board | BLIND | idiots | idiots 0.60 / idiots 0.45 / idiots 0.60 | PASS |  | Chalkboard with a drone diagram suggests Rancho; stone arched window is less specific |
| D26-trading-algos | CAPTION | idiots | idiots 0.25 / idiots 0.20 / idiots 0.25 | FAIL | **fixed, not re-judged** | A framed board diagram suggests a classroom, but it is a generic flowchart |
| D27-optuna-screener | CAPTION | idiots | idiots 0.55 / idiots 0.45 / idiots 0.45 | FAIL | **fixed, not re-judged** | Stone lecture hall with tiered wooden benches reads as ICE, but no signature prop |
| D28-experiment | NONE | none | ?? 0.10 / ?? 0.10 / ?? 0.10 | n/a |  | Generic analytics chart with no themed imagery |
| D29-systems | BLIND | idiots | idiots 0.75 / idiots 0.60 / idiots 0.75 | PASS |  | Taped-together DIY drone at an Indian stone campus is the 3 Idiots drone scene |
| D30-kill-list | CAPTION | idiots | idiots 0.65 / idiots 0.45 / idiots 0.60 | PASS |  | Ornate pen in a presentation box plus stopwatch in a classroom is the astronaut pen |
| D31-voices | BLIND | rdr2 | rdr2 0.80 / rdr2 0.70 / rdr2 0.80 | PASS |  | Canvas tents, campfire pot and chuck wagon among pines are pure RDR2 camp |
| D32-beyond | BLIND | rdr2 | rdr2 0.70 / rdr2 0.70 / rdr2 0.70 | PASS |  | Warm frontier vista with a saddled horse evokes RDR2 |
| D33-beyond-satchel | CAPTION | rdr2 | rdr2 0.60 / rdr2 0.50 / rdr2 0.60 | PASS | **fixed, not re-judged** | Satchel inventory and bounty board feel RDR2, though the icons are modern |
| D34-beyond-wanted | BLIND | rdr2 | rdr2 0.70 / rdr2 0.60 / rdr2 0.75 | PASS |  | Weathered frontier board with nailed parchment posters reads as an RDR2 bounty board |
| D35-beyond-2800 | CAPTION | rdr2 | rdr2 0.70 / rdr2 0.60 / rdr2 0.75 | PASS |  | Weathered frontier notice board with nailed posters reads as RDR2 bounties |
| D36-writing | BLIND | rdr2 | rdr2 0.80 / rdr2 0.55 / rdr2 0.75 | PASS |  | Cream journal paper with hatched pencil sketch of a horse and frontier landscape is pure Arthur's journal |
| D37-writing-1000 | BLIND | rdr2 | rdr2 0.80 / rdr2 0.55 / rdr2 0.75 | PASS |  | Hatched pencil journal sketch of a horse in the wilderness is Arthur's journal |
| D38-principles | BLIND | hp | hp 0.80 / hp 0.85 / hp 0.80 | PASS |  | Parchment map with ribbon banner, corner seals and footprints is the Marauder's Map |
| D39-principles-1000 | BLIND | hp | hp 0.75 / hp 0.80 / hp 0.75 | PASS |  | Folded parchment floor plan with moving inked footprints is the Marauder's Map |
| D40-contact | BLIND | hp | hp 0.60 / hp 0.65 / hp 0.55 | PASS |  | Floating candles evoke Hogwarts; frame is mostly dark and abstract |
| D41-credits | CAPTION | none | ?? 0.10 / ?? 0.10 / ?? 0.10 | n/a |  | No imagery at all, just empty dark layout lines |
| D42-credits-1000 | CAPTION | none | hp 0.50 / hp 0.50 / hp 0.40 | n/a |  | Snitch and Hallows symbols are distinctly HP, but the icons are minute on a mostly empty frame |
| D43-films-pirates | BLIND | pirates | pirates 0.92 / pirates 0.90 / pirates 0.90 | PASS |  | Tattered black sails plus Jack's compass are unmistakable Pirates |
| D44-films-idiots | BLIND | idiots | idiots 0.85 / idiots 0.85 / idiots 0.85 | PASS |  | Yellow scooter at a still blue high-altitude lake is the 3 Idiots finale |
| D45-films-rdr2 | BLIND | rdr2 | rdr2 0.55 / rdr2 0.55 / rdr2 0.55 | FAIL | **fixed, not re-judged** | Lone horse on open grassland at sunset evokes the RDR2 frontier, but a sunset horse is fairly generic |
| D46-films-hp | BLIND | hp | hp 0.95 / hp 0.95 / hp 0.90 | PASS |  | Red steam train on the curved stone viaduct in the Highlands is iconic HP |
| D80-loader-card-hp | BLIND | hp | hp 0.55 / hp 0.55 / hp 0.50 | FAIL | **fixed, not re-judged** | Floating candles and wand spark evoke HP, but thumbnails are tiny |
| D80-loader-card-idiots | BLIND | idiots | idiots 0.55 / idiots 0.50 / idiots 0.55 | FAIL | **fixed, not re-judged** | Drone plus pen on chalkboards suggests 3 Idiots, but thumbnails are small |
| D80-loader-card-pirates | BLIND | pirates | pirates 0.60 / pirates 0.60 / pirates 0.60 | PASS | **fixed, not re-judged** | Hinged compass with ship and treasure X reads Pirates, but icons are tiny |
| D80-loader-card-rdr2 | BLIND | rdr2 | rdr2 0.45 / rdr2 0.50 / rdr2 0.50 | FAIL | **fixed, not re-judged** | Pencil western sketches suggest Arthur's journal, but tiny |
| D85-loader-route-about | CAPTION | pirates | pirates 0.75 / pirates 0.70 / pirates 0.70 | PASS | **fixed, not re-judged** | Hinged compass, galleon and treasure X are Pirates |
| D85-loader-route-principles | CAPTION | hp | hp 0.60 / hp 0.60 / hp 0.55 | PASS | **fixed, not re-judged** | Floating candles with a wand spark evoke Hogwarts; icon-scale |
| D85-loader-route-work | CAPTION | idiots | idiots 0.60 / idiots 0.55 / idiots 0.60 | PASS | **fixed, not re-judged** | Drone sketch plus orbiting pen on a classroom chalkboard points to 3 Idiots; tiny icon-scale |
| D85-loader-route-writing | CAPTION | rdr2 | rdr2 0.60 / rdr2 0.65 / rdr2 0.60 | PASS | **fixed, not re-judged** | Pencil sketch of horse and cowboy hat evokes Arthur's journal; icon-scale |
