# J1 STAR · round 3 verdict

**Score 2 / 5.** One star per screen holds for the big card beats and fails for most of the page between them. By eye 33.1 % (1440) and 34.1 % (1024) of reader clips have exactly one star, against a bar of 90 %. 149 and 136 reader clips have no star outside a declared breath. One clip (1440) and two clips (1024) show two separate things performing at once. The clearest breaches are 25 to 30 consecutive star-less seconds through optuna-screener to the kill-list, the pen dwell, and the whole parchment section.

| bar | reader 1440 | reader 1024 |
|---|---|---|
| at least 90 % of clips exactly one star | **fail** 33.1 % | **fail** 34.1 % |
| star-less clips only inside declared breaths | **fail** 149 outside (14 inside) | **fail** 136 outside (15 inside) |
| 0 clips with 2+ | **fail** 1 (#201) | **fail** 2 (#154, #189) |

Files read: `p3-r3/MANIFEST.md` (§1 numbers, §2 J1), all 72 J1 sheets, and the four `clips.json` records (labels, breath rows, motion flag). Nothing else. The first 12 clips of both reader runs (play screen, flight, reveal, titles) are skipped as the manifest says; the skimmer runs have no intro.

## What I counted

- A star is one element I can see performing across the clip's four frames: a reveal, wipe, iris, typing, image morph, draw-in, the lens widget, or a flicker I could resolve. Rigid scroll, sticky layers and plain parallax of a photo are not a star. Two stars means two different elements (different beat ids) performing in the same second.
- Frames are about 200 px wide and four samples per second, so low-contrast ambient loops (flames, shimmer, motes) are hard to resolve. I enlarged about 100 ambiguous clips 1.9x from the sheet. Where I could not decide and called a clip weak, `clips.json` motion of 0.01 or more kept it as a star and less made it a zero. The finale comet needed a 3x brightness boost (see findings).
- Breath status comes from the `clips.json` breath rows (20 reader clips at 1440 and 23 at 1024 carry a `breath after Bnn` label).

## Numbers (my eye)

| run | clips judged | exactly one star | no star | no star outside a breath | no star inside a breath | 2+ |
|---|---|---|---|---|---|---|
| reader 1440 | 245 | 81 (33.1 %) | 163 | 149 (60.8 %) | 14 | 1 |
| reader 1024 | 232 | 79 (34.1 %) | 151 | 136 (58.6 %) | 15 | 2 |
| skimmer 1440 | 117 | 54 (46.2 %) | 63 | 55 (47.0 %) | 8 | 0 |
| skimmer 1024 | 87 | 41 (47.1 %) | 46 | 42 (48.3 %) | 4 | 0 |

Reader both widths: 160 of 477 page clips have exactly one star (33.5 %), 285 have none outside a breath (59.7 %), 3 have two or more.

Against the machine (each cell is the machine's own count of the same run; my eye is the last column):

| run | log: exactly one | machine motion flag: exactly one | log: star-less outside breath | motion flag: star-less outside breath | eye: star-less outside breath |
|---|---|---|---|---|---|
| reader 1440 | 73.5 % | 51 % | 55 | 110 | 149 |
| reader 1024 | 72 % | 55.2 % | 53 | 93 | 136 |
| skimmer 1440 | 82.1 % | 65.8 % | 11 | 31 | 55 |
| skimmer 1024 | 93.1 % | 77 % | 3 | 20 | 42 |

Reader one-star share, bracketed: eye 33.1% / 34.1% (strict); about 39% if every machine-detected motion of 2% of pixels or more is counted as a star; 51.0% / 55.2% by the machine's own motion flag; 73.5% / 72.0% by the spotlight log. All four are below the 90% bar. The truth the eye gets is at the bottom of that range; the log's 73 % and 72 % include 68 (1440) and 55 (1024) clips whose star the sheet itself tags `(static)` and where I see a still.

## Where the page has no star

Runs of four or more consecutive star-less clips outside a breath (clip numbers; time as `m:ss` from the start of the recording):

| run | clips | time | y | section |
|---|---|---|---|---|
| reader 1440 | #14–#19 | 0:13–0:18 | 0 | top (hero idle) |
| reader 1440 | #36–#45 | 0:35–0:44 | 3,069–4,172 | about / journey (10) |
| reader 1440 | #47–#50 | 0:46–0:49 | 4,176–4,750 | journey |
| reader 1440 | #73–#78 | 1:12–1:17 | 9,676–9,854 | work (pen dwell) |
| reader 1440 | **#103–#132** | **1:42–2:11** | **14,495–19,607** | **optuna-screener → kill-list (30)** |
| reader 1440 | #140–#143 | 2:19–2:22 | 21,636–21,709 | films title |
| reader 1440 | #155–#158 | 2:34–2:37 | 24,695–25,321 | films |
| reader 1440 | #167–#170 | 2:46–2:49 | 27,332–27,638 | act-3 |
| reader 1440 | #181–#187 | 3:00–3:06 | 29,707–31,199 | beyond |
| reader 1440 | #193–#196 | 3:12–3:15 | 32,713–32,769 | writing |
| reader 1440 | #206–#213 | 3:25–3:32 | 35,186–36,199 | voices |
| reader 1440 | #228–#240 | 3:47–3:59 | 38,932–40,845 | principles (13) |
| reader 1440 | #246–#254 | 4:05–4:13 | 41,744–43,013 | contact / credits |
| reader 1024 | #14–#18 | 0:13–0:17 | 0 | top (hero idle) |
| reader 1024 | #32–#40 | 0:31–0:39 | 2,582–3,407 | about |
| reader 1024 | #68–#81 | 1:07–1:20 | 8,849–10,338 | work / trading-algos (14) |
| reader 1024 | #92–#96 | 1:31–1:35 | 12,983–13,418 | optuna-screener |
| reader 1024 | **#101–#125** | **1:40–2:04** | **14,627–18,557** | **optuna-screener → kill-list (25)** |
| reader 1024 | #134–#137 | 2:13–2:16 | 20,764–20,840 | films title |
| reader 1024 | #171–#177 | 2:50–2:56 | 27,850–29,300 | beyond |
| reader 1024 | #183–#186 | 3:02–3:05 | 30,738–30,887 | writing |
| reader 1024 | #201–#204 | 3:20–3:23 | 33,921–34,667 | voices / act-4 |
| reader 1024 | #227–#242 | 3:46–4:01 | 38,366–40,746 | principles → credits (16) |

Reader star-less clips outside a breath, by section (my eye): 1440 films 14, principles 13, optuna-screener 11, systems 11, beyond 11, about 9, work 8, voices 8; 1024 films 13, optuna-screener 11, beyond 11, work 10, systems 10, about 9, credits 8, journey 7.

The dwell stops are the main cause. The reader stops 2 s at each h2 and act-card settle; the log grants a star there (B08-invite, B14-loop, B16-pen, B28-pen, B30, B38-fireflies, B50-motes, B54-hall, B56-flame) but the sheet tags it `(static)` and the frames are identical. None of the 14 live-only loop stars the manifest lists reads as motion in any run.

## Where it works

Exactly one clear star, nothing competing: the hero lift and porthole ring expanding to the ship (1440 #20–#25), the sea image morphing through the journey (#51–#56), the liquid-edge wipe into the lecture hall (#61–#62), the heading typing in (#71–#72), the lens tracking the kill-list (#133–#138), the paper wipe and treeline takeover (#191–#195) and the campfire-to-hall iris (#216–#217). The same beats read the same at 1024.

## Two at once (by eye)

- **Journal horse + page sketch**: reader 1440 #201 (3:20) and reader 1024 #189 (3:08). The running horse (B45) and the entry sketch drawing (B44-page4 / page3) move in the same second. Small, but two elements.
- **Ember + light band**: reader 1024 #154 (2:33). The ember dot (B35) flies while the light band (B36) fades in over the image.
- The machine's red `2+ AT ONCE` bands (reader 1440 #57, reader 1024 #54, skimmer 1440 #26, #37, #73, #101) are log overlaps of 8 to 150 ms. At #57, #54 and #26 I see no star at all (the sunset sea image holds still); at the others I see one. So the 2+ bar reads as passed by the log for the wrong clips.

## Machine against eye

| run | no star on the sheet, I see one | star granted and motion flag set, I see scroll only | 2+ claimed, I see 0 or 1 | I see 2, machine 1 or fewer |
|---|---|---|---|---|
| reader 1440 | 4 | 29 | 1 | 1 |
| reader 1024 | 5 | 32 | 1 | 2 |
| skimmer 1440 | 2 | 22 | 4 | 0 |
| skimmer 1024 | 1 | 25 | 0 | 0 |

All 129 rows are in the JSON (`disagreements`). Separately, the machine's `(static)` star clips are not listed as disagreements because the label already says nothing moves and my eye agrees: 68 / 55 reader and 23 / 15 skimmer clips (1440 / 1024).

The `(moves)` label word never appears on any sheet, although `clips.json` flags 18 / 18 reader and 8 / 2 skimmer red-band clips as moving with no star; all red bands carry the same plain `NO STAR` text (a tooling finding).

## Findings (top, ranked)

1. **[high] optuna-screener → experiment → systems → kill-list (y14.5k–19.6k at 1440, y14.6k–18.6k at 1024)** (reader 1440 #103–#132 (30 clips); reader 1024 #101–#125 (25 clips); skimmer 1440 #50–#58; 1:42–2:11 (reader 1440), 1:40–2:04 (reader 1024); skimmer 1440 0:49–0:57). The longest star-less stretch: 30 and 25 consecutive 1 s clips in which nothing performs. Prose, a blueprint panel, a green chart, a photo and a panel stack scroll past at page speed. The log credits B23–B29 here (annotation oval, chart, drone photo, systems panel) but none of them shows as an animation by eye (clips.json motion is 0.012 or less on 25 of the 30 clips at 1440 and 22 of 25 at 1024; 10 and 8 of them carry a log star tagged '(static)'). No declared breath covers it. About 12% of all reader clips sit in this one stretch.
2. **[high] work: 'Led by what survived scrutiny' dwell and the validation gauntlet (y9.7k–10.3k at 1440, y8.8k–10.3k at 1024)** (reader 1440 #73–#78; reader 1024 #68–#81 (14 clips); 1:12–1:17 (reader 1440), 1:07–1:20 (reader 1024)). The 2 s stop on the pen heading is credited to B16-pen (a live-only loop) and shows a still screen for 5 clips at 1440 and 4 at 1024 (the sheet says '(static)'). At 1024 the star-less run continues through the chalkboard scroll and the colonnade for 14 s. The pen glint the loop is meant to supply is not visible in any frame.
3. **[high] principles (the Marauder's map) through contact and credits** (reader 1440 #228–#240 (13) and #246–#254 (9); reader 1024 #227–#242 (16); skimmer 1440 #102–#113 (12); 3:47–3:59 and 4:05–4:13 (reader 1440); 3:46–4:01 (reader 1024)). After the parchment unrolls (a good single star, #224–#227), 13 to 16 s of parchment pages follow with nothing I can see move: B54-hall is a still for the 4 s stop (#228–#231), and the footprints and ink marks the log credits to B54/B55 change fewer than about 1% of pixels, too faint to read as a star at 200 px. Contact and credits then scroll static. The declared breath after B50 (#223–#226) ends as the parchment finishes unrolling, before this stretch.
4. **[high] the 2 s dwell stops (every h2 and act-card settle)** (reader 1440: 68 clips and reader 1024: 55 clips carry a log star tagged '(static)', e.g. 1440 #37–#40 (B08-invite compass), #64 (B14-loop), #129–#131 (B28-pen), #167–#168 and #174–#175 (B38-fireflies), #219–#221 (B50-motes), #228–#231 (B54-hall), #242–#244 (B56-flame); throughout; reader 1440 e.g. 0:36–0:39, 1:03–1:04, 1:23–1:25, 1:39–1:40, 1:48–1:50, 1:58–1:59, 2:08–2:10, 2:19–2:22, 2:46–2:47, 3:38–3:40, 3:47–3:50, 4:01–4:03). The stops are where the page should perform a calm single star, and by eye almost every one is a still. The 14 loop stars the manifest marks 'live only, lent a still screen' (B04-loop, B10-sea, B14-loop, B16-pen, B17-beam, B20-window, B22-board, B25-demo, B28-pen, B38-fireflies, B50-motes, B50-loop, B54-hall, B56-flame) never read as motion in these recordings. This includes the compass invite on About (B08-invite) and the pen, which the game discovery relies on. The log's 73% / 72% 'exactly one star' therefore overstates what the eye gets: roughly a third of its 'one star' clips are stills.
5. **[medium] hero after the titles** (reader 1440 #14–#19; reader 1024 #14–#18; skimmer 1440 #2–#5; skimmer 1024 #2–#5; 0:13–0:18 (reader 1440), 0:13–0:17 (reader 1024); skimmer 0:01–0:04 at both widths). Five or six seconds of a motionless hero (name, sea, text) after the 'THE CROSSING' caption fade. The log credits B02 (mostly '(static)'), no breath is declared before B04, and no ambient loop is visible. This reads as the first dead screen after the intro, not a deliberate rest.
6. **[medium] About (builder of quantitative systems) into the journey intro** (reader 1440 #36–#45 (10 clips); reader 1024 #32–#40 (9 clips); 0:35–0:44 (reader 1440), 0:31–0:39 (reader 1024)). After the heading's gold wipe (#35 / #31) there are 9–10 star-less seconds: prose scrolling and a 4 s stop on the h2 where the compass invite (B08-invite) is credited but the compass does not move at either width.
7. **[medium] act 1 ship card, after the iris expands** (reader 1440 #26–#28; reader 1024 #24–#26; 0:25–0:27 (reader 1440), 0:23–0:25 (reader 1024)). Once the porthole ring has expanded to the full ship the screen is a still for 3 s (B04 and B04-loop credited, nothing moves) before 'The Crossing' title reveals (#29 / #27). The expansion itself (#22–#25) is a clean single star; the dwell that follows is not.
8. **[medium] writing journal: running horse and page sketch** (reader 1440 #201; reader 1024 #189; 3:20 (reader 1440), 3:08 (reader 1024)). Two stars at once by eye: the small running horse (B45) crosses the bottom of the page while the entry sketch (B44-page4 at 1440, B44-page3 at 1024) draws itself at the top right in the same second. Both are small and in the same ink idiom, but they are two different elements moving together; the log lists both beats without an overlap. In the neighbouring clips (#188, #190, #200, #202) only one of them moves.
9. **[medium] end of page: 'Mischief managed.'** (reader 1440 #255–#257 (last four clips #254–#257); reader 1024 #243–#244 (last three #242–#244); skimmer 1440 #114–#116 (end #113–#117); skimmer 1024 #84–#87; 4:14–4:16 (reader 1440), 4:02–4:03 (reader 1024); skimmer 1440 1:53–1:55, skimmer 1024 1:23–1:26). The finale star (B58, weight 3) is a faint comet streak that I could only resolve after brightening the frames about three times; at sheet contrast the last 3–4 seconds read as a black screen with one line of type. The breath that follows B58 (y44,057–44,957 at 1440; y41,482–42,250 at 1024) lies below the maximum scroll (43,312 / 40,857), so the final clips are star-less outside any declared breath. Either start the breath earlier or make the comet legible.
10. **[low] act 3 card: ember dot and light-leak band** (reader 1024 #154; 2:33 (reader 1024)). The ember dot (B35) flies down across the heading while the horizontal light band (B36) fades in over the same image. Two bright moving things in one second; the log has only B35 in this clip. At 1440 the band is already present when the ember flies (#162–#163), so there it reads as one star.
11. **[low] sea image hand-off (journey → kraken storm)** (reader 1440 #57; reader 1024 #54; skimmer 1440 #26, #37, #73, #101; 0:56 (reader 1440), 0:53 (reader 1024); skimmer 1440 0:25, 0:36, 1:12, 1:40). The machine's only red '2+ AT ONCE' bands (log overlaps of 8–150 ms) are not visible as two moving things. At reader #57 / #54 and skimmer #26 the sunset sea image already holds still and I see no star at all; at skimmer #37, #73 and #101 I see one. The 2+ bar is passed on the log (1 clip per reader run) for the wrong reason: the real 2+ clips are the horse/sketch and ember/band ones above, which the log does not flag.
12. **[low] motion the spotlight does not arbitrate** (reader 1440 #59, #102, #139; reader 1024 #56, #85, #133, #167; skimmer 1440 #1, #10; skimmer 1024 #1; 0:58 / 0:55 (ocean), 1:24 (colonnade, 1024), 1:41 (crossfade, 1440), 2:18 / 2:12 (lens exit)). Clips the sheet labels 'NO STAR' in which I do see one thing performing: the ocean caustics shimmer, the colonnade photo fading in, the classroom-to-people image crossfade, the lens widget leaving its list, the hero's sea glow fading up. These are host animations outside the spotlight, so the log cannot count or arbitrate them. They help the one-star count but are untracked (clips.json has moving=true on them; the sheets print plain 'NO STAR', never '(moves)').
13. **[low] sheet labels** (all four runs; whole run). The new '(moves)' label word never appears on any of the 72 sheets (I measured the width of every red NO STAR band: all 56 / 54 reader and 15 / 3 skimmer bands carry the same seven-character text). clips.json flags 18 (1440) and 18 (1024) of those reader clips, and 8 / 2 skimmer clips, as moving with no star, so they print as a plain red 'NO STAR' and the machine's own claim cannot be read from the label. The manifest's 21 / 22 and 12 / 5 'motion, no star' totals include breath rows that have no red band.
14. **[info] skimmer profile (2.3–2.7 kpx/s flings)** (skimmer 1440 117 clips; skimmer 1024 87 clips; whole run). One star by eye in 46% (1440) and 47% (1024) of fling clips, 55 and 42 clips with nothing outside a breath, and no clip with two competing stars by eye. At fling speed the stars that do read are the large card moves (ring, liquid wipe, iris, sea morph, lens) and typing; prose and diagrams are scroll only. No bar is set for the skimmer; nothing competes.
15. **[info] what works** (reader 1440 #20–#25 (hero lift, porthole ring, ring to ship), #51–#56 (sea image morph), #61–#62 (liquid wipe), #71–#72 (heading types in), #133–#138 (lens widget), #217 (iris to the hall); the same beats at 1024; 0:19–0:24, 0:50–0:55, 1:00–1:01, 1:10–1:11, 2:12–2:17, 3:36 (reader 1440)). The big beats are exactly one clear star each: the porthole-to-ship iris, the continuous sea-image morph through the journey, the liquid-edge wipe into the lecture hall, the typed 'Led by what survived scrutiny.', the lens tracking the kill-list, and the campfire-to-hall iris. Nothing else competes on those screens.

## Caveats

- My strict reading (scroll and parallax are not a star) puts the reader one-star share 17 to 21 points under the machine's motion flag. Counting every machine-detected motion of 2 % of pixels or more as a star lifts it only to about 39 %, so the pass or fail result does not depend on this choice.
- Low-contrast ambient loops at 200 px are the weakest part of my reading: campfire and candle flicker, parchment ink marks, ocean caustics. I counted them only where I could resolve a change or the machine's motion was 0.01 or more.
- Skimmer clips are fling frames; the machine's self-motion measure runs high there (parallax and blur), so I used it only as a tie-break.
- No bar is set for the skimmer; its numbers are context.
