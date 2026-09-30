# PHASE3-SPEC — "Keep them scrolling" (desktop first)

**Status:** binding build spec for Phase 3 (P3-2 … P3-12). Written 2026-09-30 on `design/three-films` (P3-1).
**Authority, in order:** `docs/build/IDEAS.md` §O (triage) + §0 (Aryan's binding decisions) + §P (Aryan's answers) → `CONTINUE.md` Phase 3 brief and Rules → this spec → `SPEC.md`, `DESIGN.md`, `ICONS.md`, `MOTION-REPORT.md` (every "native scroll only / no WebGL / no audio" rule in them is overridden; the full list of superseded rules is Appendix A).
**Evidence:** the seven stage-3 maps (page-beats, motion-infra, media-loops, game-eggs, intro-hero, typography, transitions; scratchpad `p3/maps/`), the P3-0 baseline (`docs/build/motion-strips/p3-before/summary.md`) and the media lane's tool notes (`docs/build/media/p3/tools.md`).
**Content and honesty:** `docs/build/CONTENT-RULES.md` is absolute. This spec adds **no fact**. Every word it puts on screen is an existing string in `lib/content.ts`, `lib/film.ts` or `lib/quotes.ts`, or new microcopy about *the page* (status `proposed`, signed later by Aryan). Sharpe, PSR and PF are never animated.
**Next 16:** read `node_modules/next/dist/docs` before any Next-specific code (fonts: `01-app/03-api-reference/02-components/font.md`; resource hints: `…/04-functions/generate-metadata.md` → `ReactDOM.preload`, whose React 19 options include `media`).

Words used below:
- **DESKTOP_FINE** = `(min-width: 64rem) and (hover: hover) and (pointer: fine)`. It becomes one export in `lib/flags.ts`, replacing the duplicates in `card-shell.tsx:131` and `media-frame.tsx:84`.
- **Motion on** = not OS reduced motion and not Pause (`useReducedMotion()` false; `motionOffNow()` false).
- **RM** = reduced motion OR Pause.
- **p** = a pinned card's progress, 0 → 1.
- **scrollY** = the viewport-top scroll position at 1440×900 unless a width is named.

---

## 0. Decisions this spec makes (the maps disagreed or left these open)

| # | Decision | Why |
|---|---|---|
| D3-1 | **All four act cards pin on DESKTOP_FINE with motion on.** Travel: opening **90vh**, seam **110vh**, tintype **70vh**, ignite **110vh** (today: 0 / 58 / 0 / 58). Pins stay **CSS sticky**, never a GSAP `pin`. | Squeezing a transition into 125–315 px is the measured cause of card choppiness. Passage cards also moved twice (card slide + transition). Supersedes D-5, validator #3/#4 and the 150vh sticky budget. Net page length stays ≈ the same because of D3-9. |
| D3-2 | **Each pinned card runs three stars in sequence:** world transition → push-in (or develop) → act title as text-as-mask, which exits to full-bleed ("bars open"). | One star per screen inside a card; the text-as-mask cap (four act titles only) and letterbox breathing both land on the card exit. |
| D3-3 | **Four push-ins.** Toward the Black Pearl (opening card) and into the Great Hall (ignite card) are generated scroll-scrubbed sequences (DEFAULT; the ALT is a code push on the living loop). Across the ICE hall to the board (seam card) and into the camp at dusk (Voices) are code camera moves on living loops (DEFAULT and ALT are two code paths). | This is the media-loops map's credit plan. Code moves keep registration exact; the two generated dollies give real parallax at the page's first and last hero moments. |
| D3-4 | **Dead Eye stays hosted on the kill-list (Act II)** as RDR2's toy "visiting" another world (SPEC §3 rule 3). It becomes a replayable game with sound; it is no longer a hunt egg. | Moving the kill-list was rejected in SPEC §2 item 5. |
| D3-5 | **The four impacts** are: the Pirates spyglass iris reaching full frame, Rancho's circle closing (3 Idiots), the tintype flash-powder exposure (RDR2), and the Lumos bloom as the Great Hall takes the frame (HP). The Dead Eye game's volley gets no shake and no flash. | Every scroller meets all four; one per world (O.2). |
| D3-6 | **Scroll-scrubbed sentences (one per act)** are existing strings: Act I `pillars[1].body` second sentence; Act II `featuredProjects[0].learned` second sentence; Act III `beyond[3].items[0].body`; Act IV `principles[4].body` second sentence (§8.3). | Act I avoids repeating Act II's epigraph. Nothing contains a research figure. |
| D3-7 | **Subtitles (L5)** are the four act **loglines** (rendered nowhere today) during each act's push-in, and the four films-chapter **reasons** as subtitles on the films screens. | These are the "one-liners" in `docs/build/ONE-LINERS.md`. |
| D3-8 | **The hero h1 takes Pirata One** at ≥ 64rem only, preloaded with `media`. Phones keep Geist and today's four world subsets byte-for-byte (§5). | §P(b), plus "phones unchanged". |
| D3-9 | **Collapse and hide** (§11.5): the optuna appendix (Option Alpha + supporting list + earlier repos) behind a native `<details>`, the About philosophy note, and the long credit lists. Chart-slot placeholders stop rendering. Phones keep everything expanded. | IDEAS §3 keeps "hiding unfinished placeholders"; O.1 keeps "collapsing long text". |
| D3-10 | **Sound is procedural Web Audio (0 credits, 0 files)**, plus ≤ 5 generic-voice TTS spell callouts (≤ 10 credits) and optional CC0 recordings. Higgsfield audio is TTS-only; its music/SFX models are "game pipeline only". | The media-loops map's §7. |
| D3-11 | **Lenis is never created during the intro** or during its title "quiet window". It is destroyed (never `stop()`ed) under RM. | motion-infra R1/R2/R7 + intro-hero §9. |
| D3-12 | **Canvas rule, updated:** ≤ 1 live WebGL context page-wide and ≤ 1 animating 2D canvas; the two are never both full-viewport. The ignite ember canvas (frame-sized) may run beside the GL frame. | Replaces SPEC §10.1 #6's "canvas singleton". |
| D3-13 | **The toy is labelled "Fly the homemade drone"**, never "Rancho's drone" (IC-3I-08: the drone was Joy Lobo's). O.1's "fly Rancho's drone" is shorthand. | ICONS guard stands; §0 overrides only scroll/WebGL/audio. |
| D3-14 | **Analytics:** ship a no-op `track()` hook with privacy-light events. Installing `@vercel/analytics` waits for Aryan's hosting and consent. | "No third-party trackers without consent." |

---

## 1. Goals and non-goals

### 1.1 Goals (judged at 1440×900 and 1024×768, laptop Chrome first)
1. **Smooth.** Scroll-linked motion glides (Lenis + ScrollTrigger), no transition fits in fewer than ~3 wheel notches, and the intro → hero hand-off has no freeze, pop or repaint storm.
2. **No dead screen.** No stretch longer than 100vh without a beat (§2), measured at both widths.
3. **One star per screen** (O.4). Exactly one dramatic thing at any scroll position; everything else is quiet (loops, camera drift, weather, grain).
4. **A movie:** a persistent stage, living loops, a virtual camera, world transitions through one small WebGL layer, match cuts, letterbox breathing, a day-to-night arc, titles arriving in character, subtitles, opening titles, a post-credits scene, sound (muted by default), the director's cut and DVD chapter select.
5. **A game:** a 12-egg hunt (3 per world) with a header counter and a 12/12 reward, and one toy per act (two real games: the homemade drone and Dead Eye).
6. **Never in the way:** "Skip to the research" is always visible, no entertainment blocks content, and RM/Pause stops all motion and sound.

### 1.2 Non-goals (Phase 3)
- **Phones and tablets** (below DESKTOP_FINE): today's behaviour, byte-for-byte where practical. No Lenis, stage, WebGL, loops beyond today's, new fonts, sound UI, hunt hotspots, toys, fast-lane relabel or director's cut. Typed/palette eggs keep working everywhere. The mobile cut is Phase 4.
- **The info** (Phase 2 queue): no rewrite of facts, loglines, reasons or quotes. Phase 3 only *places* existing strings.
- **Cut (O.3), never built:** speed ramps; text revealed by light for paragraphs; cursor trails outside HP (the wand is the only light cursor); phone tilt; "previously on…" recaps; the film-strip scroll indicator; instrument counters and marquee quotes; the cannon, scratch-off map, pet the horse, honor meter, visitor bounty poster, journal sketch pad and stoke-the-fire toys; eggs beyond 12 (rum, Wingardium Leviosa, 9¾, stopwatch, quiz).
- **Deferred:** idle moments; the 12/12 share card.
- **Not in the plan without Aryan's OK:** harvesting Kling "sound on" audio; any film score or ripped audio; any voice imitating an actor.

---

## 2. Beat map (the whole page, in order)

### 2.1 Grammar
- **Star kinds** (dramatic; one at a time): world transition · push-in · act title as mask · title arriving in character · scroll-scrubbed sentence · physical word · fly-through · impact (inside a transition) · a signature scene already built (voyage scrub, course plot, gauntlet chalk, schematic ink, map unfold, WANTED nail-up, film finales) · letterbox close/open · match cut · toy invite · post-credits scene.
- **Quiet kinds** (never a star): living loops, stage camera drift, depth parallax, weather particles, hero velocity grain, rack focus, stage crossfades within a world (≥ 40vh of scroll), hunt-chip tick, toasts.
- **Opt-in** (never auto-run, never a scroller's star): toys and eggs. A toy's *invite* may be a star (a single 400 ms pulse).
- Every beat carries `data-beat="<id>"` in the DOM (§3.4) so the probe can measure it.

### 2.2 Page geometry after Phase 3 (≈; the beat probe re-measures)
The heights are today's measured heights plus D3-1 travel and minus D3-9 collapses. Page ≈ **42,240 px (46.9 viewports)** at 1440×900 (today 41,499) and ≈ **38,230 px (49.8)** at 1024×768 (today 37,916).

| # | item | mode (§3.2) | top @1440 | h @1440 | h @1024 | change |
|---|---|---|---|---|---|---|
| 1 | top (hero) | own | 0 | 900 | 768 | hand-off fix, name in Pirata One |
| 2 | act-1 card `opening` | card, pinned 90vh | 900 | 2394 | 2016 | +90vh; the program block becomes `backdrop` |
| 3 | about | **backdrop** | 3294 | ≈1250 | ≈1317 | philosophy note collapsed |
| 4 | journey | own | 4544 | 2815 | 2373 | sticky column starts at the h2 |
| 5 | act-2 card `seam` | card, 110vh | 7359 | 1890 | 1612 | +52vh |
| 6 | work | own | 9249 | 2292 | 1986 | HeadBand arrival fix |
| 7 | trading-algos | **split (window right)** | 11541 | ≈1610 | ≈1448 | chart slot hidden |
| 8 | optuna-screener | head own + body **split (right)** | 13151 | ≈2270 | ≈2021 | appendix collapsed, chart slot hidden |
| 9 | experiment | opaque (H4: no film) | 15421 | ≈1000 | ≈898 | empty head tightened |
| 10 | systems | own | 16421 | 1958 | 1756 | — |
| 11 | kill-list | opaque (+ own head inset) | 18379 | 2122 | 2169 | — |
| 12 | films | own + letterbox scene | 20501 | 5334 | 4477 | — |
| 13 | act-3 card `tintype` | card, pinned 70vh | 25835 | 1530 | 1306 | +70vh |
| 14 | beyond | own band + lower half **split (window left)** | 27365 | 3763 | 3643 | — |
| 15 | writing | opaque (paper) | 31128 | 2653 | 2469 | — |
| 16 | voices | own (campSticky) + letterbox scene | 33781 | 1393 | 1461 | — |
| 17 | act-4 card `ignite` | card, 110vh | 35174 | 1890 | 1612 | +52vh |
| 18 | principles | opaque (map) | 37064 | 2327 | 2230 | — |
| 19 | contact | own | 39391 | 900 | 768 | — |
| 20 | credits + post-credits | **backdrop** | 40291 | ≈1950 | ≈1903 | lists collapsed; +60vh post-credits tail |

Pinned scroll windows at 1440: act-1 900→1710 · act-2 7359→8349 · act-3 25835→26465 · act-4 35174→36164.

### 2.3 The beat map (1440×900; scrollY = viewport top; one star per row)

| # | scrollY ≈ | where | beats in order (quiet ones in *italics*) | **THE ONE STAR** | supplied by |
|---|---|---|---|---|---|
| B00 | intro, time | prologue play screen | *IN-01 living loop (L05)*; Play; Skip intro; Skip to the research | the living play screen | P3-5 (L05, only after P3-3) |
| B01 | intro, time | flight → hold → reveal → titles | broom flight; hold on the last frame; compositor wipe; 3 title cards; then `cap.hero` | flight, then wipe, then titles (sequential) | P3-3 |
| B02 | 0–900 | hero | *MV-03 re-seamed loop, velocity grain, pointer shift*; the opening card slides up **static** (closed iris) | hero exit camera push + darken | existing + P3-5 |
| B03 | 900–1208 | act-1 p 0–.38 | *hero horizon carried into the iris slit*; spyglass iris opens on the Pearl; **impact** (Pirates) as the film title stamps in | spyglass iris → impact | P3-6 (iris, impact), P3-7 (title) |
| B04 | 1208–1548 | act-1 p .38–.80 | *hold: L01 loop*; **push-in #1 toward the Black Pearl** (SEQ-PEARL); Act I logline subtitles; *sea-spray weather* | push-in #1 | P3-5, P3-7 |
| B05 | 1548–1710 | act-1 p .80–1 | "THE CROSSING" as text-as-mask expands to full-bleed; bars open; the stage takes the same frame | text-as-mask | P3-7, P3-2 (stage hand-off) |
| B06 | 1710–2394 | act-1 program (backdrop over the stage) | brass course plots compass → rows; needle settles with the moon-tip flash; *stage drift* | course plot | existing ProgramStage on P3-2 backdrop |
| B07 | 2394–3294 | about head + bio | About h2 **stamped in character** (Pirata One); *stage: SEQ-PEARL end still, drift + depth parallax, scrim .82* | h2 in character | P3-7, P3-2 |
| B08 | 3294–3950 | about pillars | compass toy invite (one needle twitch); **scroll-scrubbed sentence (Act I)**; pc hint marginal | scrubbed sentence | P3-7, P3-8 |
| B09 | 3950–4544 | about end → journey head | *stage crossfades (≥ 40vh) to MV-05a L06*; journey h2 with the sticky column arriving at the h2, showing JV frame 0 = MV-05a | **match cut:** stage harbour → voyage window | P3-2 (stage), journey head fix |
| B10 | 4544–5500 | journey steps 1–2 | JV sea scrub; compass per leg | voyage scrub | existing |
| B11 | 5500–6450 | journey steps 3–4 | voyage scrub; ember tick at "The break"; medallion moon sweep (`pc-coin` egg host); "parley?" marginal; *L19 fog at rest* | voyage scrub | existing + P3-8 |
| B12 | 6450–7359 | journey end | *first light (L20) at rest*; **gull fly-through (Act I)** across the viewport; "HERE BE MONSTERS" marginal; the seam card rises with its storm frame static | gull fly-through | P3-7 |
| B13 | 7359–7854 | act-2 p 0–.50 | storm frame opens (*L12 at rest*); **Pirates wave OUT**; meet on the carried line (storm horizon = ICE ledge) and carried shape (compass ring → gear); **3I chalk-dust IN** reveals the ICE hall; dawn grade ramp | world transition I→II | P3-6 |
| B14 | 7854–8171 | act-2 p .50–.82 | *hold: L08*; **push-in #2 across the hall to the board**; FIG. 0 chalks on; gauge = p; Act II logline subtitles; **impact** (3I) as Rancho's circle closes at .82 | push-in #2 → impact | P3-5, P3-6, P3-7 |
| B15 | 8171–8349 | act-2 p .82–1 | "The Workshop" text-as-mask → full-bleed | text-as-mask | P3-7 |
| B16 | 8349–9249 | card release → work head | Work HeadBand (L18) settles **as it enters** (no longer armed at opacity 0); Work h2 **chalked in character** | h2 chalked | P3-7, P3-5 |
| B17 | 9249–10150 | work: standing rule → dawn board | *board L09 living beam*; tabs derive each gate in chalk on entry | board gates chalk on | existing |
| B18 | 10150–10641 | work gauntlet | Run button invite (one pulse); Run = the existing toy; `3i-quad` egg | Run invite | existing + P3-8 |
| B19 | 10641–11541 | trading-algos arrival | split window slides in (iconic-corridor, L10, camera pan-l); h2 chalked; *chalk-dust weather in the window* | h2 chalked + window arrival | P3-2, P3-7 |
| B20 | 11541–12400 | trading-algos FIG. 1 + approach | blueprint schematic inks itself; *rack focus in the window between blocks* | schematic ink | existing |
| B21 | 12400–13151 | trading-algos learned / limitations | **scroll-scrubbed sentence (Act II)**; then Rancho's circle on the caveat | scrubbed sentence | P3-7 |
| B22 | 13151–13900 | optuna head | MachineBoard (L16): "What is a machine?" chalk-writes; answer line | chalk-write | existing + L16 |
| B23 | 13900–14700 | optuna body (split, window cue 1 = iconic-ice L08) | **physical word "noise"** (one grain-settle); *rack focus at the approach → metrics gap*; `3i-aal` chalk heart on the board ledge | physical word | P3-7, P3-8 |
| B24 | 14700–15421 | optuna end (window cue 2 = iconic-corridor-alt, depth parallax) | Rancho's circle on "anything > 2.0 is a red flag"; collapsed appendix disclosures | Rancho's circle | existing, P3-10 collapse |
| B25 | 15421–16421 | experiment (no film, H4) | the synthetic curve draws once on entry (its "Synthetic • illustrative" label visible from frame 1); toggle toy | curve draw | P3-7 (small) |
| B26 | 16421–17300 | systems head | **homemade drone fly-through (Act II)** buzzes across the head and lands on its mark in the band; *DroneBand L07*; "▲ Take off" pill | drone fly-through | P3-7, P3-8 |
| B27 | 17300–18379 | systems matrix | FIG. "How this page is built" inks (copy made honest, §8.6); drone game (opt-in) | FIG ink | existing |
| B28 | 18379–19250 | kill-list head | h2 **chalked in character**; *PenInset L17*; "DEAD EYE" pill invite; `3i-pen` egg | h2 chalked | P3-7, P3-8 |
| B29 | 19250–20100 | kill-list rows | **physical word "Killed"** struck through once; lens bracket; Dead Eye game (opt-in) | "Killed" strike | P3-7, P3-8 |
| B30 | 20100–20501 | fade-out → films head | **letterbox bars close** ("house lights down"); INTERMISSION head | letterbox close | P3-6 |
| B31 | 20501–21500 | films: Pirates screen | film title **burned/stamped**; plate opens (*L14*); compass finale; reason subtitle | title in character | P3-7, P3-5 |
| B32 | 21500–22700 | films: 3 Idiots screen | title **chalked**; plate (*L22*); gates finale; subtitle | title in character | same |
| B33 | 22700–23900 | films: RDR2 screen | title **poster-pressed**; plate (*L21*); X finale; subtitle | title in character | same |
| B34 | 23900–25100 | films: HP screen | title **inked with a nib**; plate (*L13*); ink + Lumos finale; subtitle | title in character | same |
| B35 | 25100–25835 | films end | **letterbox bars open**; the warm point descends toward Act III | letterbox open | P3-6 |
| B36 | 25835–25993 | act-3 p 0–.25 | sun sinks onto the plate's sun mark; graphite trail; **carried shape: the gear rolls as a wagon wheel**, drawing the Line | wheel rolls the Line | P3-6 |
| B37 | 25993–26276 | act-3 p .25–.70 | **impact** (RDR2 flash-powder) → **tintype develop** outward from the horizon row; sepia → golden hour; bone border; TIP in the lower bar | develop | P3-6 |
| B38 | 26276–26465 | act-3 p .70–1 | *hold: L04*; "THE FRONTIER" text-as-mask → full-bleed MV-10 | text-as-mask | P3-7 |
| B39 | 26465–27365 | card release → FrontierBand | L04 continues full-bleed; push 1 → 1.08 toward the sun | band push | existing + L04 |
| B40 | 27365–28250 | beyond head + Athletics | h2 **poster-pressed** (Rye); notes rise; ShoePrints; `rd-eagle` eye-ring | h2 in character | P3-7, P3-8 |
| B41 | 28250–29150 | TrailMap + Activities (split window LEFT: MV-10 L04, camera push toward the sun) | TrailMap fog lifts | fog lift | existing (CSS `view()`) |
| B42 | 29150–30050 | Community + Creative (split) | *rack focus between blocks*; **scroll-scrubbed sentence (Act III)** | scrubbed sentence | P3-7 |
| B43 | 30050–31128 | satchel + handbill | satchel spill → WANTED nailed up (*L15 street dust*) | satchel, then WANTED (sequential) | existing |
| B44 | 31128–32000 | writing head | NibTitle writes the h2 (already in character); right page draws its landscape; `rd-bone` | NibTitle | existing |
| B45 | 32000–32900 | writing entries | **riderless-horse fly-through (Act III)** gallops along the journal's bottom edge in graphite; vignettes also swap as entries cross the reading line | horse fly-through | P3-7 |
| B46 | 32900–33781 | writing foot → voices | dusk recede; the camp plate fades up out of the journal's dusk | camp fade-up | existing |
| B47 | 33781–35174 | voices | **letterbox bars close**; Act III logline subtitles; **push-in #3 into the camp at dusk** (L03); night veil; lead quote read into firelight; *fireflies*; `rd-fire`; bars open | push-in #3 | P3-5, P3-6, P3-7 |
| B48 | 35174–35521 | act-4 p 0–.35 | camp holds (freeze-frame of L03); **RDR2 film burn OUT** from the fire mark; embers rise (2D canvas) | film burn | P3-6 |
| B49 | 35521–35718 | act-4 p .35–.55 | meet (lake line = high table; wagon wheel → ring → snitch); **HP ink bleed IN**; the snitch leaves along the candle Line (Act IV fly-through, part of the transition); **impact** (Lumos bloom) at .55 | ink bleed → impact | P3-6 |
| B50 | 35718–36025 | act-4 p .55–.86 | *hold: L02, candle motes*; **push-in #4 into the Great Hall** (SEQ-HALL); Act IV logline subtitles | push-in #4 | P3-5, P3-7 |
| B51 | 36025–36164 | act-4 p .86–1 | "The Light" text-as-mask → full-bleed | text-as-mask | P3-7 |
| B52 | 36164–37064 | card release → principles | the map sheet unfolds from the centre | map unfold | existing |
| B53 | 37064–37950 | principles rooms 1–2 | h2 **inked with a nib** (IM Fell SC); *footprints walk, YOU banner*; wand cursor active | h2 in character | P3-7, P3-8 |
| B54 | 37950–38800 | rooms 3–4 | ribbons converge under each title; *footprints* | ribbons converge | existing |
| B55 | 38800–39391 | room 5 | **scroll-scrubbed sentence (Act IV)**; `hp-map` hint on the banner | scrubbed sentence | P3-7, P3-8 |
| B56 | 39391–40291 | contact | h2 lines ink in → bracket closes [A · flame · S]; *MV-08 → MV-09 loop*; candle toy (wand), which self-lights after 6 s in view if untouched | bracket close | existing + P3-8 |
| B57 | 40291–41200 | credits | the roll over the last shot (stage backdrop: MV-08 still → MV-09 loop, push 1 → 1.06); *candle motes*; the Snitch darts once | Snitch dart | P3-2, existing egg |
| B58 | 41200–41341 | end + post-credits tail | "Mischief managed" ink fold → **post-credits scene** (riderless broom; the 12/12 extended cut) | post-credits scene | P3-8 |

At 1024×768 every range scales by roughly 0.9 (cards scale with vh; reading sections reflow taller). The **P3-2 beat probe** (§3.4) is the authority for both widths.

### 2.4 How each of today's dead stretches is filled

| today (1440 scrollY) | fill (beat rows) |
|---|---|
| **D1** 1650–3750 (2.33vh), program tail → About → journey head | The opening card now pins (B03–B05) and exits full-bleed into the **persistent stage**. The program and About read over it as `backdrop` (B06–B08). The pillars carry the scrubbed sentence; the journey sticky column starts at its h2 with a stage → voyage **match cut** (B09). |
| **D2** 6.6k–6.9k hard cut in the seam | 110vh of travel with Lenis; the GL wave → chalk runs as two halves meeting at the carried line; no one-frame swap (B13). |
| **D3** ~8k, empty first Work screen | HeadBand's settle starts when its top crosses 90% of the viewport, with no armed-at-0 state on arrival; the h2 is chalked in character (B16). |
| **D4** 9.9k–11.4k trading-algos | Split window (L10) + h2 chalked + schematic + scrubbed sentence (B19–B21). |
| **D5** 12.6k–16.2k (worst) | Split window with two cues and rack focus, the physical word, Rancho's circle, the appendix collapsed (≈ −1.4 viewports), and the experiment curve draw (B22–B25). |
| **D6** 17.4k–18.3k systems matrix | Drone fly-through + FIG ink + the drone game (B26–B27). |
| **D7** 19.05k–20.7k kill-list rows → films head | "Killed" strike + Dead Eye invite + letterbox close (B28–B30). |
| **D8** 25.5k–25.95k black | Letterbox open + the warm point + the wheel rolling the Line. The latent plate starts as a faint ghost (GL γ curve / DOM cover .6), never black (B35–B36). |
| **D9** 27.75k–29.25k beyond notes | Split window LEFT in the empty column (MV-10 L04), fog lift, scrubbed sentence (B41–B42). |
| **D10** 30.6k–33k writing | Horse fly-through; vignettes swap on scroll as well as hover (B45). |
| **D11** 39.15k–40.65k credits | Backdrop stage (the last shot), Snitch, collapsed lists, post-credits scene (B57–B58). |

### 2.5 Where every rationed or placed element goes

| element (cap) | placement |
|---|---|
| **Persistent stage** `backdrop` | act-1 program block, about, credits |
| **Split-screen** `split` | trading-algos (window right), optuna body (right), beyond lower half (left) |
| **Rack focus** (split windows only) | trading-algos, optuna, beyond windows |
| **Push-ins (4)** | #1 toward the Black Pearl (opening card) · #2 across the ICE hall to the board (seam) · #3 into the camp at dusk (voices) · #4 into the Great Hall (ignite) |
| **Letterbox breathing** | every card exit (bars open through the title mask); films (close at the head, open at the end); voices (close/open around push-in #3) |
| **Match cuts** | flight → hero loop · hero horizon → iris slit · stage MV-05a → JV frame 0 · storm horizon = ICE ledge, compass ring → gear · gear → wagon wheel on the trail; Intermission warm point → the plate's sun · camp lake line = high table, wheel → ring → snitch · credits snitch = the same object; post-credits broom = the intro broom |
| **Day-to-night stops** | §7.5 |
| **Impacts (4, one per world)** | B03 iris · B14 Rancho's circle · B37 flash powder · B49 Lumos bloom |
| **Scroll-scrubbed sentence (1 per act)** | B08 · B21 · B42 · B55 |
| **Fly-through (≤ 1 per act)** | Act I gull (B12) · Act II homemade drone (B26) · Act III riderless horse in graphite (B45) · Act IV the snitch leaving the ignite frame (B49, part of the transition). The credits Snitch dart is an **egg**, not a fly-through; the post-credits broom sits outside the acts. |
| **Text-as-mask (act titles only)** | B05 · B15 · B38 · B51 |
| **Subtitles** | loglines in B04 · B14 · B47 · B50; reasons in B31–B34 |
| **Titles in character** | world section h2s (about, journey, work, trading-algos, optuna, systems, kill-list, beyond, voices, principles, contact; writing already has NibTitle) and the four films-screen film titles; never the act titles (those are the masks) and never the experiment (H4) |
| **Physical words (≤ 1 per section)** | optuna "noise" (B23), kill-list "Killed" (B29). No others in Phase 3. |
| **Weather (one kind per world, light)** | Pirates **sea-spray flecks** (opening card hold/push, about image side) · 3 Idiots **chalk dust in the sunbeam** (seam push, split windows) · RDR2 **fireflies** (voices after the veil falls, ignite p < .1) · HP **candle motes** (ignite hold/push, credits backdrop) |
| **Wand light cursor (HP only)** | act-4 card, principles, contact |

---

## 3. Architecture

### 3.1 Smooth scroll: Lenis + GSAP ScrollTrigger
**Packages:** `lenis ^1.3.26` (MIT, 5.4 KB gz), `gsap ^3.15.0` (core 28.3 + ScrollTrigger 18.0 KB gz; the standard no-charge licence), `@gsap/react ^2.1.2`. All are loaded by dynamic `import()` after hydration, on DESKTOP_FINE with motion on only. Never `ScrollSmoother`: its transformed wrapper breaks the four CSS-sticky surfaces, the fixed header and motion's compositor timelines. Never `lenis/react`'s `ReactLenis`, and never `ScrollTrigger.normalizeScroll()`.

**Files:**
- `lib/smooth-scroll.ts` (store + helpers; no Lenis import at module top).
- `lib/gsap.ts` (`registerPlugin(ScrollTrigger, useGSAP)`, `ScrollTrigger.config({ ignoreMobileResize: true })`, re-exports).
- `components/providers/smooth-scroll.tsx` (`<SmoothScroll/>`, renders null).
- `lib/flags.ts` gains `motionOffNow()` (non-hook: matchMedia + the pause snapshot) and `DESKTOP_FINE`.

**Wiring (one instance, one clock):**
- `new Lenis({ autoRaf:false, lerp:0.1, smoothWheel:true, syncTouch:false, anchors:false, respectReducedMotion:true, virtualScroll:({deltaX,deltaY}) => Math.abs(deltaY) >= Math.abs(deltaX) })`. The `virtualScroll` rule keeps horizontal gestures (history swipe) native.
- `gsap.ticker.add(t => lenis.raf(t*1000))`, `gsap.ticker.lagSmoothing(0)`, `lenis.on("scroll", ScrollTrigger.update)`.
- Lenis scrolls the real window. Sticky, fixed, IntersectionObserver, CSS `view()` timelines, motion's `useScroll` (both paths) and ScrollTrigger need no scroller proxy.

**When it exists (D3-11):** `enabled = !reduced && DESKTOP_FINE && pathname === "/" && introSettled(phase) && !quietWindow && !shouldSkip("smooth")`.
- Created in `requestIdleCallback` (timeout 1500).
- After the import resolves, re-check `motionOffNow()`: the hydration snapshot says motion is on even for RM visitors.
- Mount it inside `MotionProvider` → `ChromeGate` in `app/layout.tsx`, so `/lab` and the 404 never get it and the keyed remount tears it down.
- The intro controller dispatches `intro:quiet` at warm and `intro:quiet-end` after the titles (or on any exit). Lenis, ScrollTrigger refreshes, analytics, lazy loops and world fonts all wait for `quiet-end` (§4).

**RM, Pause, modals:**
- RM or Pause → `destroy()`, remove the ticker callback, `ScrollTrigger.refresh()`. Never `stop()`: `lenis.css` turns `.lenis-stopped` into `overflow: clip`.
- Lumos/resume mid-session re-creates it (the effect re-runs).
- Do not import `lenis.css`. Add to `globals.css`: `html.lenis{scroll-behavior:auto}` and `.lenis [data-lenis-prevent]{overscroll-behavior:contain}`.
- **Scroll lock:** `lockScroll(owner)`/`unlockScroll(owner)` (ref-counted) sets `body.style.overflow="hidden"` and `lenis?.stop()/start()`. It replaces the three hand-rolled locks (`header.tsx:289-307`, `command-palette.tsx:293-302`, `marauders-map-dialog.tsx:54-69`). Add `data-lenis-prevent` to the menu sheet (`header.tsx:366`), the palette overlay and list (`command-palette.tsx:353/398`) and the map dialog (`marauders-map-dialog.tsx:98`).

**Anchors and jumps:** `scrollToTarget(target, { block, focus, history, immediate, cut })` in `lib/smooth-scroll.ts`.
- Without Lenis or under RM: `scrollIntoView({ behavior: motionOffNow() ? "instant" : "smooth", block })`. This fixes the palette's Pause bug (`command-palette.tsx:146-158`).
- With Lenis: `lenis.scrollTo(el, { force:true, immediate })`. Lenis already subtracts `scroll-margin-top` and the 92 px `scroll-padding-top`. For `block:"center"`, pass a computed number.
- **Long jumps (> 3 viewports) never glide.** They are `immediate`, wrapped in the **cut** (§11.3).
- On completion, focus the target's heading, or give the target `tabindex=-1` and focus it (`preventScroll`).
- History: `pushState` for link clicks, `replaceState` for programmatic jumps.
- One delegated **window bubble-phase click handler** takes same-page `#` links that are not `defaultPrevented`, with no modifier and button 0, and calls `scrollToTarget(…, { history:"push", focus:true, immediate: e.detail===0 })`. This keeps the Time-Turner spin, journey waypoints and map-dialog close-then-scroll intact.
- Move to `scrollToTarget`: palette `go()`, `hp-ink.tsx:196-209`, `journey-voyage.tsx:261-270`, `ledger-reckoning.tsx:251`, and `egg-host.tsx:160/185/270`, which now awaits completion instead of the fixed 900 ms.
- `keydown` (capture) → `lenis.reset()` if it is gliding, so keyboard, focus and find-in-page scrolls are never overridden.
- A MutationObserver on `html.intro-armed` → `lenis.reset()`, so the replay's `scrollTo(0)` wins.

**Refresh strategy:** `requestScrollRefresh()` runs a 200 ms debounced `ScrollTrigger.refresh()`, deferred while Lenis is gliding, followed by `ScrollTrigger.sort()`. It is triggered by:
- a `ResizeObserver` on `<main>` (the Journey Stack → Voyage swap, collapses, late media);
- `document.fonts` `loadingdone`;
- `intro:quiet-end`;
- the stage mounting.

Each Suspense section hydrates separately, so every ScrollTrigger gets `refreshPriority` from manifest order. After the first refresh, re-apply `location.hash` once.

**Which driver for which motion (the 1-frame rule):**
- Anything whose transform must track content that is itself scrolling (depth parallax in flow, in-flow camera, scrubbed sentences) uses **ScrollTrigger `scrub:true`** (0-frame lag inside Lenis's emit) or motion's **accelerated** path (array `useTransform` onto opacity/clipPath/filter/transform string).
- Anything inside a sticky or fixed layer (pinned cards, the stage, split windows, campSticky) may keep motion `useScroll` (JS path); a 1-frame lag is invisible there.
- The card driver `p` stays motion `useScroll`: one system measures card layout.
- Components use `useGSAP(fn, { dependencies:[reduced], revertOnUpdate:true, scope })`.

**Also in P3-2:**
- `tools/capture/motion.js` waits on `window.__lenis?.isScrolling === false` instead of its 80 ms pause, and gains a `?skip=smooth` A/B run.
- Optional: the header settle probe (`header.tsx:95-114`) listens for Lenis's final scroll emit instead of a 150 ms debounce.
- Optional: ESLint `no-restricted-imports` so `lenis` is imported only in the provider and `gsap/ScrollTrigger` only through `lib/gsap.ts`.

**Phones:** never created. The non-passive wheel/touch listeners never reach them.

### 3.2 The persistent stage (desktop only)
**Mount:** `app/page.tsx` renders `<StageGate/>` and `<LetterboxBars/>` before `<main>`. `<main>` and the credits `<footer>` get `relative z-[1]`.
- The stage is `fixed inset-0 z-0 pointer-events-none aria-hidden`.
- `StageGate` = `dynamic(() => import("@/components/stage/stage"), { ssr:false })`. It mounts only on DESKTOP_FINE, with motion on, no Save-Data, after `intro:quiet-end` + idle.
- It renders nothing on the server, so the hero poster stays LCP. Phones never load it.

**Liveness contract:** once the first cue's poster has decoded, the stage sets `html[data-stage="live"]`. Every `backdrop`/`split` rule is keyed on `html[data-stage="live"]:not([data-motion="paused"])` inside `@media (min-width:64rem) and (pointer:fine) and (prefers-reduced-motion:no-preference)`. Until then, and whenever it is off, every section renders **opaque, exactly as today**, so there is never a blank transparent section.

**Data (`lib/stage.ts`, pure, validator-importable):**
```ts
type StageCue = { at?: string /* child anchor id; default: section top */; media: MediaId; loop?: MediaId;
                  camera?: "drift" | "push" | "pan-l" | "pan-r" | "hold"; depth?: boolean; grade?: SkyKey; weather?: WeatherKind };
type StageSpec = { mode: "backdrop" | "split" | "own" | "opaque"; side?: "left" | "right"; scrim?: number /* ≥ .82 */; cues?: StageCue[] };
```
Manifest entries (`lib/page.ts`) gain `stage?: StageSpec`. `stageCues(pageItems)` and `stageAt(y, cues) → { a, b, mix, local }` are pure functions.

**Driver:**
- One page-scroll value (motion `useScroll()`; it works with or without Lenis).
- Cue positions are measured once and on `ResizeObserver(document.body)`. There are no layout reads per frame.
- `mix` drives slot B's opacity; `local` drives the camera (transform only).
- Two slots, A and B; `will-change` only on them.
- In `own`, `opaque` or card cues the stage sets `visibility:hidden` (a discrete state).

**Modes:**
- **`backdrop`:** the section is `bg-transparent` plus one static scrim layer: `linear-gradient(to right, var(--bg) 0 58%, color-mix(in oklab, var(--bg) 55%, transparent))`.
  - Scrim **≥ .82 under any text column**: muted `#9db0bd` needs ≥ .77 against a white plate pixel; ink ≈ 11.7:1 and muted ≈ 6.3:1 at .86.
  - The image-only side may drop to .45.
- **`split`:** `lg:grid-cols-[7fr_5fr]` (or `[5fr_7fr]` for a left window). The text column keeps `bg-bg`.
  - **The grid is CSS from first paint** under DESKTOP_FINE + motion on + not paused. It never waits for the stage, so a late mount causes no CLS.
  - The window column is `<StageWindow>`: `sticky top-[var(--header-h)] h-[calc(100svh-var(--header-h))]`. It registers its rect on resize only.
  - It SSR-renders a lazy `next/image` of cue 1 with the same focal fit. When `data-stage="live"` it turns transparent and the stage shows the same pixels, so the column is never empty.
  - Under RM and on phones the section keeps today's single-column layout.
  - The stage centres the cue's `focal` in that rect by translating the slot (transform).
  - **Rack focus** here only: the 384 px `next/image` rung, stretched, is crossfaded with the sharp slot by opacity (soft while the reading line is inside a text block, sharp for 30vh between blocks). Never animate `filter: blur`.

**Validator rules:**
- Research types (`chapter`, `ledger`, `experiment`, `matrix`) may be `split`, never `backdrop`.
- `paper`/`raised` tones are never `backdrop`.
- `experiment` is `opaque` (H4).
- Every cue's media resolves and is a film asset.

**Cue plan:**

| section | mode | cues (media · loop · camera · extras) |
|---|---|---|
| act-1 program block | backdrop .82 | the opening card's **exit frame** (variant-aware: `seq-pearl-end` still for DEFAULT, iconic-pearl at the ALT push's end scale) · drift · depth · spray |
| about | backdrop .82 | cue 1 = same as above (continuous) · cue 2 at `#about-pillars` = MV-05a · L06 · drift toward the lights (≥ 40vh crossfade, ends before the journey h2) |
| trading-algos | split right | iconic-corridor · L10 · pan-l · chalk dust |
| optuna-screener (body only; the head keeps MachineBoard) | split right | cue 1 at the approach = iconic-ice · L08 · push 1 → 1.05 · cue 2 at the metrics block = iconic-corridor-alt (still) · drift · depth |
| beyond (Activities → Creative) | split left | MV-10 · L04 · push toward the sun, grade golden → dusk |
| credits | backdrop .82 | MV-08 · MV-09 · push 1 → 1.06 · candle motes |
| hero, journey, work, systems, films, voices, contact | own | — (they own their plates and decoder) |
| experiment, kill-list, writing, principles | opaque | — |
| act cards | card | the stage swaps its slots **under the opaque card**, invisibly |

**Card → stage hand-off:** at a card's exit the frame shows a **still**: the freeze-frame, with the video released. The stage's first cue is that same still at the same transform. After the card has scrolled away, the stage fades its loop in (poster → video, 600 ms).

**One decoder (media-loops §1.4):**
- A single `StageVideo` owner holds the DecoderLock at **priority 1** and reuses **one `<video>` element** (swap `src`, wait for `requestVideoFrameCallback`, then fade from the poster).
- Only the active slot plays, and only when `mix ≤ .02` or `≥ .98`. During a crossfade both slots show posters, so **0 decoders run during any transition**.
- `own` sections claim the decoder themselves at priority 0; the stage's cue ends one viewport earlier and releases.
- A card's frame loop may take **priority 2** only while it is that screen's star (the card hold).
- The intro keeps priority 10. Inline plates render `playOn="never"` while the stage covers them.

### 3.3 The contained WebGL layer
**Library: raw WebGL2** (1.8 KB min / 0.96 KB gz measured for the core; ≈ 3–4 KB gz with every flavour shader, plus the SDF title generator ≈ 1.5 KB). Not ogl (13.9 KB gz), not three (132.7 KB gz).

**Files:**
- `lib/gl/support.ts`: `glTier(): "gl" | "css" | "off"`.
- `lib/gl/gl-lock.ts`: one owner, like the decoder lock.
- `lib/gl/transition-gl.ts`: framework-free. `createTransitionGL(canvas)` → `{ load(from,to), program(flavour), draw(p, uniforms), dispose() }`.
- `lib/gl/shaders.ts`: a shared header + the flavours.
- `lib/gl/textures.ts`.
- `lib/gl/sdf-title.ts`: a tiny EDT → SDF texture of an act title.
- `components/gl/gl-gate.tsx`: `dynamic(..., { ssr:false })`.
- `components/gl/gl-frame.tsx`: the canvas host.

**Tiers (`glTier`):**
- `off`: not DESKTOP_FINE, RM, Save-Data/2G/3G.
- `css`: any of —
  - no WebGL2;
  - `getContext("webgl2", { failIfMajorPerformanceCaveat:true, alpha:false, antialias:false, depth:false, stencil:false, powerPreference:"low-power" })` returns null (this also rejects SwiftShader);
  - `hardwareConcurrency < 4`;
  - `deviceMemory < 4` where it is reported;
  - `MAX_TEXTURE_SIZE < 4096`.
- `gl`: otherwise. `?gl=off|force` overrides for capture.

**Behaviour:**
- **One context, one canvas**, re-parented between hosts (the four card frames and the opening iris; hosts are ≥ 1 viewport apart). The nearest-to-centre live host wins.
- **Images:** `getImageProps({ src, width, quality:75 })` → `fetch` → `createImageBitmap` (off the main thread) → `texImage2D` in idle callbacks, one texture per frame, once the card is ≤ 1 viewport away. Width = frame CSS width × min(DPR, 1.5): the 1920 rung at 1440, 1440 at 1024.
- **Noise:** a 256² texture generated in JS (0 bytes over the network).
- **Shaders** compile when the card is ≤ 2 viewports away, with `KHR_parallel_shader_compile`; never during a transition.
- **Draw only on `p` change** (one coalesced rAF, the `IgniteCanvas.schedule` pattern). 0 rAF at rest, offscreen, or on a hidden tab.
- **Budget:** buffer 1922×804 (1.55 MP), LRU of 3 plates, ≤ 25 MB GPU, < 1 ms per frame on an iGPU.
- **Context loss:** `webglcontextlost` → DOM fallback; `restored` → lazy rebuild.
- It never decodes video. If a transition starts over a playing loop, it takes one `texImage2D(video)` frame and releases the decoder.
- **Mount:** `<GlFrame>` sits inside the card frame div (`card-shell.tsx:286-300`), above the plate layers and below the SVG overlays (BoardFig, Dead Eye marks, ember canvas, captions). After its first draw it fades in (opacity .2 s), and `data-gl="on"` hides `[data-gl-replaced]` DOM layers.
- **Gated on** `glTier()==="gl"` **and** the card's `live` (never before the card has been offscreen once; never under RM).

**Fallbacks are today's code:**
- tier `css` = today's DOM choreographies (baked-mask transforms, opacity stacks, the 2D canvas) plus the CSS title mask (§8.1).
- tier `off`, RM, no-JS and phones = today's static settled card.
- The layer is purely additive, so the plain-image fallback exists by construction.

**Shader contract (shared header):**
- Samplers: `uFrom, uTo, uNoise, uTitle` (SDF).
- `uP`, `uRes`.
- `uCoverFrom/uCoverTo` (vec4 scale + offset = PlateBox's cover box, including registration and zoom).
- `uRow` (MATCH_ROW), `uCenter, uRadius`, `uShapeFrom/uShapeTo/uMorph` (carried-shape SDF ids).
- `uGradeFrom/uGradeTo` (vec3 gain + EV), `uFlash`.

Flavours (each ≤ ~40 GLSL lines): `iris`, `wave`, `chalk`, `duster`, `develop`, `deadeye`, `burn`, `ink`, `lumos`, `title`. Per boundary see §7.

### 3.4 Beats in the manifest + validator
**Types (`lib/beats.ts`, pure):**
```ts
type BeatKind = "transition" | "push-in" | "mask-title" | "title" | "scrub-sentence" | "subtitle" | "physical-word"
  | "fly-through" | "impact" | "letterbox" | "match-cut" | "signature" | "toy-invite" | "stage-cue" | "post-credits";
type Beat = { id: string; at: number /* vh from the item top @1440×900 */; span: number /* vh */; kind: BeatKind;
              star?: true; world?: WorldId; act?: ActId; feature: `P3-${number}` | "existing" };
```
- Sections carry `beats` in `lib/page.ts`.
- Cards carry them in `lib/film.ts` `acts[].beats`, at `p × travel`.
- Every item carries `estVh: { d: number; t: number }` (1440 and 1024), written by the probe.
- The DOM element that performs each beat carries `data-beat="<id>"` (plus `data-beat-star` for stars).

**Validator (`scripts/check-manifest.mjs`), new checks:**
1. **Gaps (WARN):** page positions from `estVh`. Any gap between consecutive beats > **100vh** at either width warns (an error in P3-11/RELEASE).
2. **Competing stars (WARN):** two `star` beats whose spans overlap.
3. **Rations (ERROR):**
   - `impact` ≤ 4 and ≤ 1 per world;
   - `scrub-sentence` ≤ 1 per act;
   - `fly-through` ≤ 1 per act;
   - `mask-title` only on the four act cards;
   - `physical-word` ≤ 1 per section;
   - `push-in` 3–4;
   - weather kind ≤ 1 per world;
   - `rack focus` only on `split`.
4. **StageSpec rules** (§3.2).
5. **Card travel:** `film.cardTravel` ≤ 110vh each, sum ≤ 400vh, desktop-fine only, 0 below 64rem. Replaces #3/#4.
6. **Honesty lint (ERROR):** while `film.smoothScroll`/`film.gl`/`film.sound` are on, no rendered copy may claim "native scroll", "no WebGL" or "silent/no audio" (catches `capabilities.tsx:116` and `systems.pencil.body`).
7. **Hunt:** exactly 12 hunt eggs, 3 per world, each with a hint copy key, `keyboard: true` and an `rm` state (§9).
8. **Fonts:** §5.5.
9. **Sound provenance:** every audio file under `public/` has a `docs/build/SOUNDS.md` row (source, licence, edits).

**Runtime probe `tools/capture/beats.mjs <baseUrl> --widths=1440,1024 [--write]`:**
- Scrolls `/?skip=intro` with `?skip=smooth`.
- Records every `[data-beat]` page-y and star flag.
- Prints the gaps and the one-star overlaps; exits non-zero on a gap > 100vh.
- `--write` updates `estVh`.

### 3.5 Audio engine (P3-9)
**Files:**
- `lib/audio/store.ts`: `useSound()` via `useSyncExternalStore`; server/hydration = muted; persisted in `sessionStorage "sound"` (try/catch), so every new visit starts muted.
- `lib/audio/engine.ts`: framework-free, lazy.
- `lib/audio/recipes.ts`: procedural graphs.
- `lib/audio/cues.ts`: the id → recipe/file map.
- `components/audio/sound-toggle.tsx`.

**Lifecycle:**
- The `AudioContext` is created **only on the first unmute click** (autoplay policy). The engine chunk loads then.
- Pause, RM, or the tab going hidden → `ctx.suspend()` (< 100 ms). Unpausing resumes only if sound is on.
- Under RM or Pause the toggle is disabled, with a note (§10.4).

**API:**
- `sound.bed(world)`: 1.5 s equal-power crossfade, following the world of the section at the reading line (the active-section store, debounced 300 ms).
- `sound.cue(id, { pan?, rate? })`.
- `sound.duck(db, ms)`.
- It listens to the `impact`, `hunt:found`, `egg:trigger`, `letterbox`, `transition:meet` and `game:*` events.

**Mix:**
- beds ≈ −30 LUFS;
- SFX peaks ≤ −6 dBFS;
- beds duck −6 dB under SFX;
- one master gain.

Files play through `AudioBufferSourceNode`, never `<audio loop>`.

### 3.6 Egg / hunt state store (P3-8)
**`lib/hunt.ts`:**
- A `HUNT` registry: 12 ids → `{ world, registryId, host, name: CopyKey, hint: CopyKey }`.
- `useHunt()` = `useSyncExternalStore(subscribe, readLocal, () => null)`. The server and hydration render "–/12"; the count arrives one render later, so there is no hydration mismatch.
- Storage: `localStorage["aryan:hunt:v1"] = {"v":1,"found":{"<id>":<ts>}}`. Every access is in try/catch; unknown ids are dropped; the count is capped at 12. A `storage` event syncs tabs.
- `markFound(id)` is idempotent and dispatches `hunt:found`.

**Rules:**
- **Obliviate never clears the hunt;** a separate palette command "Reset the egg hunt" (with a confirm step) does.
- "Turn off easter eggs" hides the chip and the hint marginals and keeps the count.
- The Snitch's SEEKER row reads the hunt, not sessionStorage.
- Games store bests under `localStorage["aryan:games:v1"]`.

**Fixes that land here:**
- `chalk.tsx:189` reads `"eggs-off"` → must be `"eggs:off"`.
- `patronus` → `enabled:false`.
- EggHost ignores typed keys while `html[data-game]` is set.

### 3.7 Shared runtime rules
- **One decoder, one WebGL context, ≤ 1 animating 2D canvas** (D3-12).
- **The quiet window** (intro warm → `intro:quiet-end`): nothing new starts. No Lenis, ScrollTrigger refresh, lazy loop fetch, world-font request, analytics beacon or GL context creation.
- **Transform/opacity only** for anything that moves every frame. A mask may ride a transform (the seam technique). No animated filter, blur, `mask-position`, `background-color` or `box-shadow`.
- **Hydration:** all new client state appears after mount (the `lib/flags.ts` HYDRATION RULE). SSR markup is identical for every visitor.
- **Every new piece registers a DEFAULT and an ALT** in `lib/variants.ts`: the M1.5 rule.

---

## 4. Intro hand-off fix + opening title sequence (P3-3)

### 4.1 Causes, ranked (intro-hero §4)
1. The `mask-position` sweep repaints `#intro` every frame (`div#intro` ×6, raster 644.6 ms/s, 9.2 fps).
2. The hero is never rasterised or decoded under the opaque overlay (the name, header and Lens pop in at 7.02 s).
3. A moving/still seam crosses the crest (a 25.4-level difference at sweep start).
4. The loop is fetched only after `finish()`: the sea freezes on the poster, then restarts.
5. `frame()` never idles; there are two DPR-2 canvases.
6. The expensive hand-off frame: `inert` removal, 13 classes, `display:none`, and a 54 ms React re-render.
7. 24 fps on 60 Hz, with the trail timed off `currentTime`; VP9 is offered first.

### 4.2 New state machine
`flight → warm → hold → reveal → end → titles`

**Flight:**
- The trail is drawn from `requestVideoFrameCallback` `mediaTime` (24 draws/s, locked to the broom).
- Landing is detected by rVFC + `ended`, with no polling.
- `frame()` idles when nothing draws (`more = trail.length || motes || code || ink || loader`).
- At 4.55 s the trail canvas freezes and fades by WAAPI opacity over 600 ms.
- Trail canvases are capped at DPR 1.5.
- The codec comes from `mediaCapabilities.decodingInfo` (`smooth && powerEfficient`), MP4 first on desktop.

**Warm** (`FL.dur − 1400 ms`, v ≈ 4.64 s):
- (a) `img.decode()` on the hero poster.
- (b) `html.intro-warm` → `#intro{opacity:.999; will-change:opacity}`, so the compositor rasterises the hero (in its final Pirata One face) about a second early.
- (c) `fetch(heroLoopSrc, {priority:"low"})` once the flight is fully buffered. If the video's range request misses the cache, hand MediaFrame a `blob:` URL.
- (d) Dispatch `intro:quiet`.
- Verify (b) and (c) in DevTools (Layers/Paint flashing, Network).

**Hold** (last presented frame):
1. `drawImage(video)` into a new static `#intro-hold` canvas.
2. `killVideo()`.
3. Add `html.intro-handoff`.
4. `setInert(false)` in its own task.
5. IntroBridge releases the decoder on `intro-handoff`.
6. `useIntroPhase` gains `"handoff"`; `introSettled()` is true for media, so MV-03 mounts under the hold (MediaFrame `fade={0}`: frame 0 = the poster).
7. The spyglass ALT treats handoff as armed.
8. The controller proceeds when `[data-hero-lens="desktop"] [data-media]` reports `data-media-state="playing"` (≤ 450 ms, `t.handoffMax`) **and** the new `<PageHydrated/>` sentinel (the last Suspense child in `app/page.tsx`, which sets `window.__pageHydrated` and dispatches `page:hydrated`) has fired (≤ 1200 ms, `t.hydrateMax`).

**Reveal** (620 ms, easeClip, compositor only):
- `#intro-stage` is 300% wide at `translateX(-33.333%)` with a **static** wide-feather mask (F ≈ 40vw), and `#intro-film` inside is counter-moved (the IceCut technique from `seam.tsx:93-100, 225-241`).
- Two WAAPI transforms are created in the same task. The name zone clears first.
- Fallbacks: without WAAPI, an opacity fade; RM or Pause mid-way → `finish()` at once.
- Delete the `mask-position` rules (`intro.css` 362–371).
- The ALT map-fold bakes its feather into a static PNG and pre-draws `foldShade` once.
- The optional P3-6 upgrade is a GL "wave" wipe from an OffscreenCanvas worker, created during warm, with the same handshake. That context dies before the page's GL layer can exist.

**End:** light work only (classes, `data-intro`, `intro:end`, `focusLanding()` in its own task), then `titles()`. The hero pointer-shift gain ramps 0 → 1 over 800 ms after the titles.

**Optional 0-credit media:**
- Re-blend IN-02's last 12 frames into **MV-03 frames 0–11** and set `FLIGHTS["IN-02"].loopAt = 0.5` (a true match cut, no still at all).
- Tag the encodes BT.709.
- Interpolate the flight to 60 fps only if Aryan's laptop shows judder.

**Files:** `components/intro/controller.js` (rebuild with `node components/intro/build-controller.mjs`), `app/intro.css`, `components/intro/intro-overlay.tsx`, `components/intro/intro-model.ts` (`t.warm` 1400, `t.handoffMax` 450, `t.hydrateMax` 1200, titles timings, `heroLoop`, `"hero.loop"` in the prepaint variants), `lib/motion.ts` (`intro.warmMs/handoffMaxMs/hydrateMaxMs/titles`), `components/intro/intro-bridge.tsx`, `components/sections/hero/intro-phase.ts`, `components/sections/hero/hero-stage.tsx`, `components/primitives/media-frame.tsx` (the `fade` override; WebM-first `<source>`), `app/page.tsx`.

### 4.3 Opening title sequence (≈ 3.2 s; replaces the 2.5 s caption linger, so it adds no time)
**Slot:** the T1 caption slot, bottom-right, inside `#intro-caps`: fixed, z 81, `aria-hidden`, and it outlives the overlay. The controller drives it by WAAPI (opacity + an 8 px translateY), so no React work lands in the hand-off window. It never covers the h1 zone, the crest, the header or the fast lane.

| t after end | card (existing strings only; added as `copy["titles.1..3"]`, `proposed`) |
|---|---|
| 0–0.26 | the flight caption fades out (sequential, never a same-spot crossfade) |
| 0.3–1.2 | `A RESEARCH JOURNAL IN FOUR ACTS` (`opening.h2`/`intro.title` with `{acts}`) |
| 1.3–2.2 | `AFTER PIRATES OF THE CARIBBEAN • 3 IDIOTS • RED DEAD REDEMPTION 2 • HARRY POTTER` (`creditLead` + `worksInUse`). Aryan's option: `DIRECTED BY ARYAN SHARMA` (from `credits.ai`). |
| 2.3–3.2 | `ACT I • THE CROSSING ↓` ("THE CROSSING" through `<Lettered>`, the registered `pc-crossing`) |
| 3.2–3.8 | `intro-caps-linger` is removed → `cap.hero` fades in (the existing CSS) |

- **Exits:** wheel, touchmove, keydown, pointerdown, a fast-lane click, `data-motion="paused"`, a reduced-motion change, or the tab going hidden → `capsStop(200)`; RM → `capsStop(0)`.
- Skip, Esc or a scroll during the flight: no titles.
- No JS, RM, `?skip` or already seen this session: no intro and no titles.
- Performance marks: `intro:titles`, `intro:titles-end`. `intro:quiet-end` fires at titles-end or on any exit.

### 4.4 Measurable targets (`node tools/capture/motion.js http://localhost:3161 <out> --runs=intro`; baseline `docs/build/motion-strips/p3-before/`)

| measure | P3-0 | target |
|---|---|---|
| `#intro` repaints during the reveal | ×6 | **0** |
| landing raster | 644.6 ms/s | ≤ 150 ms/s (headless) |
| LoAFs > 50 ms from warm to titles end | several (162, 160 ms) | **none** |
| hand-off script | 54 ms | **< 10 ms** |
| name visible | 7.02 s, a fill-in pop | on the **2nd reveal frame**, with no pop in the strip |
| sea after landing | freezes on the poster, then restarts | never still: loop playing before the reveal starts (`data-media-state="playing"` at reveal t0) |
| intro run fps / p95 | 29.5 / 116.6 ms | ≥ 29.5 / ≤ 116.6 ms (no regression) |
| real laptop (optional, Aryan) | — | Animations track shows the wipe on the compositor; Media panel shows a hardware decoder; no dropped frames through hold → titles |

---

## 5. Typography per world (P3-4)

### 5.1 Roles
- **display:** the hero h1 only (Pirates).
- **head:** world section h2s (`SectionHead` `world-kit.tsx:173`, `ledger-section.tsx:110`, `chapter-section.tsx:111`), non-data h3s, act titles, captions, film titles, WANTED, lettered quotes.
- **body:** world prose through `type-body`/`type-small`/`type-lead` (3 Idiots uses a lead face only).
- **meta:** Geist Mono, unchanged.
- **data, always Geist / Geist Mono:** numbers, tables, charts, metric tiles (`metric-tile.tsx:17`), reported figures (`chapter-section.tsx:223`), caveats and limitations (`:185-188`), gauntlet steps, kill-list rows, verdicts, synthetic labels, figure labels, and the whole experiment section.
- **Also Geist:** the hero lead and identity line, subtitles, title cards 1–2, and all UI chrome (fast lane, hunt chip, sound, director's cut).

### 5.2 Faces (all verified web-embeddable; sizes are Google-served woff2)

| world | HEADER | BODY | extra | licence | bytes |
|---|---|---|---|---|---|
| **Pirates** (hero, act-1, about, journey) | **Pirata One 400**; also the hero h1 (ASCII+ cut 5,312 B, **preloaded ≥ 64rem**) | **Cormorant Garamond 500**, 20 px / 1.55, `--fg` only (never muted, never 400), no italic | — | Pirata One OFL 1.1 **RFN "Pirata"**; Cormorant OFL 1.1 | 5,312 + 23,312 = **28.6 KB** |
| **3 Idiots** (act-2 … kill-list; never the experiment) | **Kalam 700** (h2/h3, act title, captions, quotes, "What is a machine?"): one ASCII+ file replaces the 400 subset | **Patrick Hand 400** on `type-lead` intros and board notes only, 22 px / 1.45, ≤ 3 lines. Long text and all research stay Geist. | — | both OFL 1.1 | 13,448 + 23,944 = **37.4 KB** |
| **RDR2** (beyond, writing, voices) | **Rye 400**, `--world-head-scale:.8`, heads ≤ 6 words (swap: Sancreek, RFN-free; Smokum, Apache, most legible) | **Courier Prime 400**, 17 px / 1.65 (beyond items, writing angles, testimonials) | **Nothing You Could Do**: journal heads/dates, ≤ 4 words per page, `text=` cut | Rye OFL **RFN "Rye"**; Courier Prime OFL; NYCD OFL | 27,536 + 18,640 + ≤ 4,824 = **≈ 51 KB** |
| **HP** (act-4, principles, contact) | **IM Fell English SC 400** (h2, principle h3s, "The Light", captions, map title, quotes): replaces the roman subset | **Crimson Pro 400**, 19 px / 1.6 (the italic only if copy needs it: +19 KB) | — | both OFL 1.1 | 44,432 + 18,336 = **62.8 KB** (budget fallback: body = Newsreader, 0 extra → 44.4 KB) |

- **Rejected:** IM Fell or IM Fell DW Pica as body; Cormorant 400; Permanent Marker; Kalam 300; Nunito (a second sans beside Geist); Special Elite as body; Cedarville; Homemade Apple; Ewert.
- **RFN faces** (Pirata One, Rye): ship only the unmodified Google-served files (the `text=` cut or the `latin` file), never our own subset.

### 5.3 Sizes, measures, lines
- **Heads:** keep `type-chapter` (86.4 px @1440 / 61.4 @1024) and `type-title` (63.4 / 45.1), times `--world-head-scale`:

  | face | scale | line-height | tracking |
  |---|---|---|---|
  | Pirata | 1.0 | .95 | 0 |
  | Kalam | .95 | **1.05** (`MaskReveal` clips at .95) | 0 |
  | Rye | .8 | 1.0 | +.01em |
  | IM Fell SC | 1.1 | 1.0 | +.02em |

  All heads: `text-wrap:balance`, weight 400, `font-synthesis:none`, and never `uppercase` on Pirata or Kalam sentences.
- **Body:** ≥ 16 px, weight ≥ 400, line-height 1.5–1.65. Measures **in rem, not `ch`**: Cormorant 32rem, Crimson 31rem, Courier 36rem, Patrick lead 25rem, Geist body 35rem. `--container-body:68ch` is ≈ 96 characters in Geist: fix it.
- ≤ 3 styles and ≤ 1 display face per viewport. AA on the fill.

### 5.4 The hero h1 in Pirata One (§P(b))
- **Markup:** unchanged: `<h1 id="top-title" tabIndex={-1}>` with two block spans and a real space. It stays the only h1.
- **New step `type-name`** (leave `type-display` alone), ≥ 64rem only:
  - `font-family: var(--font-name-pirates), var(--font-geist-sans), ui-sans-serif, sans-serif`
  - `font-size: clamp(4.75rem, 12vw, 11.5rem)` → **172.8 px @1440** ("Sharma" 476 px) and **122.9 px @1024** (339 px)
  - `line-height:.96` (0.9 collides the y descender with the h), `letter-spacing:.01em`, weight 400, `font-kerning:normal`
  - **mixed case only.** Blackletter caps are illegible; no `uppercase` anywhere on it.
- **Loading:**
  - Self-host the ASCII+ file at `public/fonts/film/pirata-one/pirata-one-ascii.woff2` with `OFL.txt` beside it (H2 walks `public/`).
  - Declare the `@font-face` in `globals.css` (`font-display:swap`, a metric-matched fallback via `size-adjust`/`ascent-override` computed from Geist) under `@media (min-width:64rem)`.
  - Preload with `ReactDOM.preload(href, { as:"font", type:"font/woff2", crossOrigin:"anonymous", media:"(min-width: 64rem)" })` in `app/layout.tsx`.
  - Verify in the built HTML, and verify that a 390-px run does not fetch it (`tools/capture/qa.js` network probe).
- The current Pirata subset lacks lowercase `y`. The ASCII+ cut fixes that, and the new glyph-coverage check (§5.5) guards it.
- `HeroStage` re-measures the bracket on the h1 resize and on `fonts.ready` (`hero-stage.tsx:391-431`), so `avoidRight` moves left. The intro's `rectOfH1()` is live. The play-screen "Play becomes the name" block still contains the box (≈ 37% of 900).
- **Docs that must record the §P override:** SPEC l.41, l.650, l.833; DESIGN l.35 and l.207; FONTS.md l.27; `lib/fonts.ts:6-10`; the `app/layout.tsx` comment (~l.30).
- **Fallback face** if the 1024 blind test fails: New Rocker (OFL, RFN "New Rocker").

### 5.5 Loading, phones, validator
- **Lazy per world, for real:**
  - `[data-world]` blocks reference `--font-world-X-live`.
  - A client hook adds the world to `html[data-fonts~="X"]` when that world's first section is within `rootMargin:"150% 0px"` (Pirates at mount), after `intro:quiet-end`.
  - CSS maps `html[data-fonts~="hp"] { --font-world-hp-live: var(--font-world-hp-head) }`.
  - Chapter select, the fast lane and anchor jumps mark the target world ready and `await document.fonts.load(…)` (≤ 300 ms timeout) before the cut.
  - One debounced `ScrollTrigger.refresh()` runs on `loadingdone`.
- **Phones unchanged:** every new head/body/lead var and every new file is referenced only inside `@media (min-width:64rem)`. Below that, today's four subsets, slot rules and `--font-world-act` stay byte-for-byte, so phones download exactly today's fonts. Desktop never requests the old subsets, because they are not referenced at ≥ 64rem.
- **Research guard (runtime):** data islands carry `data-research`, and CSS resets `--world-font-head/body/lead: initial` inside them. A `tools/capture/qa.js` probe asserts that every text node in `[data-research]`, `.tnum`, `table` and `figure` computes to Geist or Geist Mono.
- **`scripts/fetch-display-fonts.mjs`:**
  - `FACES` entries `{ family, weight, dir, slug, world, role:"display"|"head"|"body"|"hand", cut:"strings"|"ascii+"|"latin", license:"ofl"|"apache" }`.
  - It fetches `ofl/<dir>/OFL.txt` or `apache/<dir>/LICENSE.txt`, writes `glyphs.txt` beside each file, enforces the budgets, and prints the FONTS.md table.
- **Validator changes:**
  - (#10) Slots gain `display` (the name: exactly one entry, `text === site.name`, face = the hero world's face, `mode "A"`, shipped, rendered only by `hero-section.tsx`) and the `head`/`body`/`lead` roles, gated by `film.fontScope.worlds`.
  - (#10) The file rule moves from an allow-list to **class allow + data deny**:
    - allow `font-world-head/body/lead` in any `components/**`;
    - keep the raw `--font-world-*`/`world-face-*` list plus `world-kit.tsx`, `hero-section.tsx` and the words primitives;
    - add `worldFaceClass\(` to the detection regex;
    - **deny** any world face in `components/visuals/**`, `metric-tile.tsx`, the experiment section, and on any className that also has `tnum|tabular-nums|type-meta|font-mono`, or on `table|td|th|figcaption`;
    - the h1 must carry the name class, no `uppercase`, and be the only `<h1>`.
  - **Glyph coverage:** every shipped mode-A lettering entry and quote must be covered by its face's `glyphs.txt`.
  - (#5) Each `[data-world]` also sets `--world-font-head`, `--world-font-body` (Idiots: `--world-font-lead`) and `--world-head-scale`.
  - **Budget (new, in the validator):**

    | rule | limit |
    |---|---|
    | preloaded world bytes | ≤ 6 KB |
    | per world (head + body + hand) | ≤ 64 KB |
    | all desktop film faces | ≤ 192 KB |
    | the phone set | = today's 54,336 B |
    | before the first scroll (desktop) | Pirata ASCII+ + the house faces only |

- **Docs:** FONTS.md (every new face, licence, bytes, the RFN note now for Pirata One + Rye only, the name override), DESIGN §2.1.1, SPEC §9.7, ICONS §9, and the credits `TYPE` row (Pirata One, Cormorant Garamond, Kalam, Patrick Hand, Rye, Courier Prime, Nothing You Could Do, IM Fell English SC, Crimson Pro). Also fix the stale comments listed in the typography map §1.

---

## 6. Every plate moves (P3-5)

### 6.1 Virtual camera + depth parallax (code, 0 credits)
**Camera:**
- A wrapper transform (scale + translate) per plate. Registration overlays (BoardFig chalk, WANTED text, Jolly Roger anchors, gauntlet SVG) live **inside** the camera wrapper.
- `will-change:transform` only while in view.
- In-flow plates use ScrollTrigger `scrub:true`; sticky, fixed and card plates may use motion `useScroll`.
- Pointer shift ≤ 6 px on the hero and the stage only.

**Depth parallax:** 2 bands split along the plate's registered line mark (horizon, ledge, lake), with a 6% feather.
- Two copies of the same `<img>` (one decode) with static `mask-image` gradients; the far band moves 0.4× and the near band 1.0× of the camera translate (max ±1.5% of width).
- A third foreground layer only where a free cut-out already exists.
- **DEFAULT** on the two stage stills (the About exit frame, optuna cue 2). **ALT** for every loop host (the same still, depth + camera, 0 credits).

| plate (host) | camera (DEFAULT) | range / driver |
|---|---|---|
| MV-01/MV-03 (hero) | exit push + darken (existing) + pointer ≤ 6 px | 1 → 1.08 over the hero |
| iconic-pearl L01 (opening hold) | hold drift; ALT push-in #1 | 1 → 1.3 about `marks.stern` (ALT) |
| SEQ-PEARL end still (act-1 program, about) | drift + depth | 1.04 → 1.0, x +1% |
| MV-05a L06 (about cue 2) | drift toward the harbour lights | 1.0 → 1.03 |
| JV (journey) | the existing scrub; no camera | — |
| MV-05b L19, MV-05d L20 (journey at rest) | none (they swap in at rest only) | — |
| MV-04 L12 (seam OUT) | tilt settle (existing) + push | 1 → 1.04 over p 0–.3 |
| iconic-ice L08 (seam IN) | **push-in #2** toward the boardRect centre | 1 → 1.35 over p .56–.82 |
| iconic-pen-alt L18 (work head) | settle 1.07 → 1 (existing), started at 90% entry | — |
| MV-06 L09 (work board) | none (the gauntlet overlay is registered) | — |
| iconic-corridor L10 (trading window) | pan-l | x +2% → −2% |
| iconic-ice-alt L16 (optuna head) | drift (the boardRect overlay inside) | 1.02 → 1 |
| iconic-ice L08 (optuna cue 1) | push | 1 → 1.05 |
| iconic-corridor-alt (optuna cue 2) | drift + depth | 1.03 → 1 |
| iconic-drone L07 (systems) | drift; still while the drone flies | 1 → 1.02 |
| iconic-pen L17 (kill-list head) | drift | 1 → 1.02 |
| F-* films screens (L14, L22, L21, L13) | push during the screen's passage | 1 → 1.05 |
| MV-10 L04 (tintype hold, FrontierBand, beyond window) | push toward the sun (existing on the band) | 1 → 1.08 |
| iconic-wanted L15 | none (the posterRect carries the HTML WANTED) | — |
| iconic-camp L03 (voices) | **push-in #3** toward `marks.fire` (.535, .68) | 1 → 1.15 over the read range |
| iconic-hall L02 (ignite hold) | hold; ALT push-in #4 crane | ALT 1.089 → 1.25, focal → .45 |
| MV-08/MV-09 (contact; credits) | drift; credits push | 1 → 1.02; 1 → 1.06 |
| IN-01 L05 (play screen) | none (the broom and Play zone are registered) | — |

### 6.2 The push-ins (scroll-scrubbed)

| # | where | DEFAULT | ALT | frame registration |
|---|---|---|---|---|
| 1 | opening card p .46–.80 | **SEQ-PEARL**: kling3_0 pro 5 s, start image iconic-pearl (job 4273a1be), start frame only, "slow steady dolly-in toward the ship" + the locked prefix/suffix without the camera-lock sentence → `tools/media/loop.mjs sequence --frames=72 --width=1280` → 72 webp (≈ 1.3 MB), drawn on a card-frame canvas | code push on the L01 loop (1 → 1.3 about the stern) | frame 0 = the iconic-pearl still. The loop → sequence swap is a 150 ms freeze-frame settle. The end frame is extracted as `seq-pearl-end.webp` for the stage. |
| 2 | seam card p .56–.82 | code camera on L08 toward the board (1 → 1.35); FIG. 0 chalks inside the camera group | code "rack from the benches": rack-focus crossfade, then a shorter push (1 → 1.2) | exact (same plate) |
| 3 | voices, campSticky read range | code push on L03 toward the fire (1 → 1.15) inside letterbox bars | code pan tent → fire (x +3% → 0, scale 1.08) | exact |
| 4 | ignite card p .62–.86 | **SEQ-HALL**: kling3_0 pro 5 s, start image iconic-hall (1ef4355e), "slow steady dolly-in along the tables toward the high table" → 72 webp | code crane-up on L02 (zoom 1.089 at the join → 1.25, focal .45) | frame 0 = iconic-hall at the join zoom; the settled frame must keep the starry ceiling (S17) |

- Sequences load within one viewport, on the card-frame canvas (the 2D canvas slot; no decoder).
- If a generated sequence fails L2 (people, text, logos, likeness) or registration (first frame vs plate SSIM < .95), its ALT becomes the DEFAULT. No retake is bought.

### 6.3 The loop list (ranked; `kling3_0` pro, `sound:"off"`, 16:9, start_image = end_image = the plate job; desktop only; RM → poster)
**Prompt** = PREFIX + MOTION + STILL + SUFFIX. Never name a film, character, studio or place.
- **PREFIX:** "Animate the supplied image with extremely restrained, continuous ambient motion while preserving the exact composition, framing, colours and lighting. Camera locked on a tripod: zero orbit, dolly, pan, zoom, shake or focus pull."
- **SUFFIX:** "One uninterrupted shot. Every moving element completes exactly one slow, even cycle and eases back to its original shape, so the first and last frames are identical. No cuts, flashes, lightning, bursts, sparkles toward the camera, whole-frame flicker or exposure change; nothing flickers faster than twice a second. No people, figures, riders, faces, hands, text, letters, symbols, logos or new objects appear. No audio."

**Tiers:**
- **T1** = 8 s, 14 credits.
- **T2/T3** = 6 s, 10.5 credits.
- The two 21:9 plates = `minimax_h3` 21:9 6 s, 12 credits (Kling has no 21:9; strip its audio).
- **S** = stage/full-bleed (encode 1080p); **I** = inline (720p).

| # | plate (job) | host | MOTION | STILL (static zones checked ≤ 1/255) | seam | tier · cr |
|---|---|---|---|---|---|---|
| L01 | iconic-pearl (4273a1be) | opening card hold (+ ALT push); films Pirates ALT | tattered black sails billow slowly and settle; lit stern windows and deck lanterns glow and dim very softly; the moon path shimmers; the pale wake foams and returns; the hull rises and falls a hair | masts, rigging, hull hold; the small flag stays plain and dark, no symbol; sky still. `mastTop`/`ensign` ≤ 2 px | residual K12 | T1 · 14 · S |
| L02 | iconic-hall (1ef4355e) | ignite hold (+ ALT push) | hundreds of floating candles bob very slowly, each out of step, flames flicker softly; faint clouds drift across the starry ceiling and return | long tables, plates, high table, tall window perfectly still; no new light sources; `lineStart` static | residual | T1 · 14 · S |
| L03 | iconic-camp (3c420eac) | voices (push-in #3); ignite freeze-frame | flames sway, a thin smoke column rises and drifts, a few embers float and fade; the lit tent's glow breathes (≤ 15%); the lake glints | three horses still apart from one slow tail swish; wagon, tents, pot, tripod still; no figures. Flicker ≤ 2 Hz; horses 4 legs / 1 head at 0/25/50/75/100% | residual (never boomerang: smoke) | T1 · 14 · S |
| L04 | MV-10 (32281e86; **upload the 2560×1440 web still**) | tintype hold, FrontierBand, beyond window | tall grass and oak leaves sway in a warm breeze; the river glints; soft heat haze on the horizon; the riderless horse flicks its tail and mane once | horse 4 legs / 1 head, does not walk; sun disc and the dark left side still (left 45% × y .25–.75) | residual | T1 · 14 · S |
| L05 | IN-01 (3edb46de) | intro play screen (**only after P3-3**; mounts after hydration + idle; on Play a 200 ms crossfade into IN-02 frame 0) | floating candles bob gently, flames flicker softly; a few windows twinkle; low mist drifts over the black lake, which ripples faintly | the broom stays exactly where it is; the Play zone x 9–46% y 28–64% stays dark and still | residual | T1 · 14 · S |
| L06 | MV-05a (6ce86233) | about stage cue 2 (match cut to JV frame 0) | harbour lanterns glow and dim softly, reflections waver; moored masts sway slightly; small ripples lap the piers | quays empty; horizon (y .431) level | residual | T1 · 14 · S |
| L07 | iconic-drone (69cafb24) | systems band | the small quadcopter hovers, bobbing a few px, rotors a soft blur; courtyard leaves stir; sun flecks shift | colonnade and courtyard still; the circuit board shows no glyphs | boomerang OK | T2 · 10.5 · I |
| L08 | iconic-ice (0e7a3d5c) | seam IN + push-in #2; optuna cue 1 | dust motes drift through slanted sunbeams; pergola shadows creep a hair and return | the green board (boardRect x .389–.961, y .091–.41) blank and perfectly still; benches still | residual | T2 · 10.5 · S |
| L09 | MV-06 (4686928b; **upload the web still**) | work board | the dawn beam on the right slowly brightens and eases back; chalk dust floats in the beam | board interior left 60% still; the beam stays right of 65% | residual | T2 · 10.5 · I |
| L10 | iconic-corridor (14f08567; unused today) | trading-algos window | bold pergola shadow stripes creep slowly and return; courtyard trees sway; dust motes hang in the light | granite wall (left ~40%) and columns still | residual | T2 · 10.5 · S |
| L11 | MV-07 (5155788f) | ignite css tier mid still | the ribbon of floating candles bobs very slowly, flames flicker softly; faint stars twinkle | left 40% dark and still; the ribbon keeps its curve (`LINE_D`) | boomerang OK | T2 · 10.5 · I |
| L12 | MV-04 (350f546b) | seam OUT storm; `pc-kraken` host | rain streaks slant; the dark sea heaves; foam blows off the crests; low clouds race; a large swell under the foam rises slowly and sinks back | **no lightning, no flashes**; horizon (y .423) level | residual (never boomerang: rain) | T2 · 10.5 · S |
| L13 | iconic-express (4c065bde; **upload the retouched web still**, not the job) | films HP screen | white steam rolls from the chimney and drifts back along the train; mist drifts over the loch; water ripples | the train fixed on the viaduct; no lettering or numbers on the carriages | residual | T2 · 10.5 · I |
| L14 | iconic-pearl-alt (c2967ce4) | films Pirates screen | tattered sails billow and settle; the moon path shimmers; the aqua wake foams and returns | stern finial and outline hold; no flag symbol | residual | T2 · 10.5 · I |
| L15 | iconic-wanted (3af08f65) | beyond handbill | dust blows lazily along the street; a loose paper corner at the board's edge lifts and falls | **the five blank posters (posterRect x .255–.493, y .165–.748) flat and still**; no lettering | residual | T2 · 10.5 · I |
| L16 | iconic-ice-alt (950f30c7) | optuna head band | as L08 | boardRect x .398–1, y .178–.473 still | residual | T3 · 10.5 · I |
| L17 | iconic-pen (8ad09fd8) | kill-list head | dust motes drift in the lamp light; light on the velvet and the pen's trim shimmers faintly | the stopwatch hands do not move; pen and case still | residual | T3 · 10.5 · I |
| L18 | iconic-pen-alt (d8c90c09) | work head | as L17 | as L17 | residual | T3 · 10.5 · I |
| L19 | MV-05b (57a84723) | journey fog beat (at rest only) | thick fog drifts right to left, thinning and thickening; the moonlit sea swells gently | horizon (~.45) soft and level | residual | T3 · 10.5 · I |
| L20 | MV-05d (f73d3e86) | journey end (at rest) | first light brightens very slightly; small waves glint; the distant ship's silhouette rocks a hair | the ship stays on the horizon; no crew, flag or lettering | residual | T3 · 10.5 · I |
| L21 | iconic-deadeye (0a60fa27) | films RDR screen | only the red-sepia haze breathes very slowly; a few dust specks drift | birds frozen mid-air; oak, fence, homestead still | boomerang OK | T3 · 10.5 · I |
| L22 | F-3I (a4ec7e96), 21:9 | films 3 Idiots screen | the blue lake ripples; high thin clouds drift over the pale mountains | the yellow scooter (.79, .62) still, no badge or plate | minimax_h3 21:9 6 s | T3 · 12 · I |
| L23 | F-HP (0b8c414a), 21:9 | films HP ALT | candle flames above the paper flicker softly; ink lines glisten as if wet | the ink branches keep their shape; never letters or a map | minimax_h3 21:9 6 s | T3 · 12 · I |
| L24 | MV-10-alt (c249b137; upload) | beyond ALT | as L04 | as L04 | residual | T3 · 10.5 · **cut first** |
| L25 | iconic-camp-alt (37726d77) | films ALT RDR | as L03 | horses from behind, 4 legs each | residual | T3 · 10.5 · **cut first** |

**0-credit work first (P3-5 lane A):**
- Register the six re-seams staged in `docs/build/media-staged/p3/accepted/reseam/` (MV-03, MV-03-alt, MV-11L, MV-11L-alt, MV-09, MV-09-alt): copy them over `public/media/films/`, set `durationS` 8.04 → 8.0 in `lib/media.ts`, and update provenance.
- MediaFrame serves **WebM first** (`<source type="video/webm">` then MP4, or by `mediaCapabilities`).
- Stage and depth ALTs.

**Credit plan (balance 506.5; approved ≈ 350; reserve ≥ 100):**

| line | credits |
|---|---|
| loops L01–L25 (6 × 14 + 17 × 10.5 + 2 × 12) | 286.5 |
| retakes (≈ 3; passing runner-ups become media ALTs via `variantOf`) | 36 |
| SEQ-PEARL + SEQ-HALL (8.75 each) | 17.5 |
| TTS (≤ 5 lines × 2 takes) | ≤ 10 |
| **total** | **≤ 350** |
| **balance after** | **≥ 156.5** |

- **Cut order if prices moved:** L24, L25 → SEQ-PEARL (ALT becomes DEFAULT) → L23 → L18.
- **Run protocol:**
  - `get_cost` preflight per distinct config.
  - `generate_video_batch` ≤ 4 per batch (HTTP 429 at 8+); resubmit with `declined_preset_id` if the "IN THE DARK" preset intercepts.
  - `jobs_wait`, then one `show_generation_by_ids`.
  - Log every job in `docs/build/media/LOG.md` plus a new `LEDGER-p3loops.md`.
  - Downloads come from `d8j0ntlcm91z4.cloudfront.net`.
  - If the tools are missing in a session, build with existing media and list what is missing.
- **ALT rule:** each loop's ALT is the code depth/camera treatment (0 credits); retake runner-ups become media ALTs. Flag for Aryan.

### 6.4 Seam, checks, encode targets (`tools/media/loop.mjs`)
- **Seam:** `seam <master> <out> --k=12|24 --tier=S|I --method=residual` for every pinned master whose raw join is ≥ 0.98. Otherwise `--method=blend --rotate=auto --plate=<still>`. `boomerang` only for L07, L11, L21.
- **Defaults:** one keyframe per loop in both codecs; x264 tail boost 2.
- **Checks** (`check` on **both** encodes, with `--plate`, `--static` rects and `--light` zones):
  - first/last vs plate SSIM ≥ .95 (yuv 960×540);
  - `seamCheck.pass.join === true` (an MP4 `"codec"` verdict is OK);
  - consecutive min ≥ .99;
  - static zones ≤ 1/255;
  - ≤ 3 flashes/s (whole frame and 4×4 tiles);
  - flames ≤ 2 Hz and glow ≤ 15%;
  - 0 audio streams;
  - an L2 sweep (`frames --at=0,25,50,75,100 --crop --scale=2`) with no people, riders, faces, hands, text, flags or marks, and horses with 4 legs / 1 head.
  - Watch 3 joins in real time.
- **Encode targets:**

  | tier | MP4 (H.264 High yuv420p, +faststart, -an) | WebM (VP9 `-b:v 0`) |
  |---|---|---|
  | S (1920×1080 24 fps) | CRF 22–24, ≤ 1.6 MB (sea/rain ≤ 2.5 MB) | CRF 30–32 (dark plates 26; near-black gradients ≤ 20), ≈ 50% of the MP4 |
  | I (1280×720) | CRF 26, ≤ 0.8 MB | ≤ 0.4 MB |

- **Poster** = the plate still (already fetched). Frame 0 is saved as `<name>-loop-poster.webp` (1920, q80, ≤ 100 KB) for the registration record.
- **Manifest entry:** `kind:"video"`, `webm`, `poster`, `endsOn`, `durationS`, `reduced:"poster"`, `provenance.hf2(...)`, `accept: cleanM2()` with `checkL2:"claude:<date>"` (Aryan countersigns later), `variants.alt`.
- **Totals:** ≈ 25–30 MB WebM in total, lazy, desktop only; phones 0 bytes.

---

## 7. World transitions (P3-6)

### 7.1 Per pair (DEFAULT / ALT). Two halves meet at the carried line/shape at the midpoint.

| boundary | card, p ranges | OUT half | meet | IN half | then | ALT |
|---|---|---|---|---|---|---|
| hero → Act I | opening, 90vh | — (the hero's static feather; the card arrives static) | the hero horizon → the Pearl's horizon slit (`marks.horizon` .8) | **Pirates spyglass iris** (`iris`): a circular iris with a brass SDF rim centred on the ship, radius 0 → frame diagonal, p .06–.38; **impact** at .38 | hold .38–.46 → push-in #1 .46–.80 → mask .80–1 | chart-unfold (DOM, existing) |
| I → II | seam, 110vh | **Pirates wave** (`wave`), p .06–.30: a breaker from the left, displacement near the front, foam = noise → white-teal | storm horizon = ICE ledge at MATCH_ROW; compass ring (32 ticks) folds into the 12-tooth gauge gear | **3I chalk-dust** (`chalk`), p .30–.50: foam white turns to chalk speckle; a diagonal noisy edge uncovers the hall; dawn grade ramp 8000 K → 4200 K → 5500 K | hold .50–.56 → push-in #2 .56–.82 → **impact** (circle) .82 → mask .84–1 | wave → **duster** (`duster`: anisotropic streaks along the 110° stroke; the SVG duster rides on top) |
| II → III | tintype, 70vh | — (the house intermission) | the Intermission warm point → the plate's sun mark; gear → wagon wheel rolling the graphite trail (rotation = arc length / r), p 0–.25 | **RDR2 tintype develop** (`develop`), p .25–.70: exposure curve `pow(luma, γ(p))` with grain, outward from the horizon row (MV-10 `horizon` .33, provisional); latent starts as a faint ghost, never black; **impact** (flash powder) at .25 | bone border .62–.72 → hold .70–.78 → mask .78–1 | **Dead Eye** (`deadeye`): a red-sepia grade *ramp* (≥ 300 ms equivalent, never a strobe) + a radial chroma split; the four DOM X marks stay |
| III → IV | ignite, 110vh | **RDR2 film burn** (`burn`) from the camp's `fire` mark, orange-white rim, p .10–.35; the 2D ember canvas keeps rising | camp lake line (`lake` .378, new mark) = high-table top (`tableL/R` .638, new) at MATCH_ROW; wagon wheel (`wheel` .888, .565) → ring → gold sphere + wings = the snitch | **HP ink bleed** (`ink`), p .35–.55: domain-warped fbm from `marks.lineStart`; the snitch leaves along the candle Line; **impact** (Lumos) at .55 | hold .55–.62 → push-in #4 .62–.86 → mask .86–1 | burn → **Lumos sweep** (`lumos`: reveal radius around the light on `SWEEP_D`, exposure bloom) |

- **Card exits:** every exit is the `title` flavour (§8.1): SDF knockout zoom → full-bleed, the "bars open".
- **tier `css`:** today's DOM choreographies. The seam and ignite keep their baked-mask transforms; the tintype keeps its 3-plate stack; the opening keeps its inset aperture, converted to mask-on-transform. The CSS title mask applies.
- **tier `off`:** the static settled card.
- **Intra-world stage crossfades:** opacity over ≥ 40vh (quiet).
- **Films screen → screen:** the existing 24vh ground crossfade.

### 7.2 Carried line: MATCH_ROW = .47 of the letterbox frame (y 480 px @1440, 410 @1024)
- Generalise `registerY` (`plate.tsx:50`) into `registerLine(plate, marks, row, maxZoom)` with a zoom term in `coverBox`/`PlateBox`; export `MATCH_ROW`.
- **Crops:**

  | plate | line (plate y) | pos_y | zoom |
  |---|---|---|---|
  | MV-04 horizon | .423 | .286 | 1 |
  | iconic-ice ledge mid | .3775 | .109 | 1 |
  | (ALT) iconic-ice-alt | .425 | .294 | 1 |
  | MV-10 horizon | ≈ .33 | 0 | 1.02 |
  | iconic-camp lake | ≈ .378 | .111 | 1 |
  | iconic-hall table | ≈ .638 | 1 | **1.089 at the join** |

- **New marks** in `lib/media.ts`: MV-10 `horizon`; iconic-camp `lake`, `wheel`, `wheelR`; iconic-hall `tableL`, `tableR`; plus the same on MV-10-alt, iconic-camp-alt, iconic-hall-alt and iconic-deadeye. They were measured on 2000-px previews: **re-measure on the 2560 files**.

### 7.3 Carried shape: compass ring → gear → wagon wheel → snitch
- **In GL:** SDFs (ring + angular repetition: 32 ticks / 12 teeth / 12 spokes; sphere + two wing ellipses), part of each transition's composition and never a second star.
- **Fallback:** a static SVG of the incoming shape (`components/stage/carried-shape.tsx`), never animated.
- **ICONS:** the compass is IC-PC-02 (never a ship's wheel); the wagon wheel is already in the camp plate (IC-RD-04); the snitch is our own drawing (IC-HP-12).

### 7.4 Letterbox breathing (K3)
- **Global bars:** `components/stage/letterbox-bars.tsx`, one fixed pair, `scaleY` 0 → 1 from the viewport edges (compositor), in the scene world's deep.
  - Height `max(0px,(100svh − 100vw/2.39)/2)`: **148.7 px @1440×900, 169.8 @1024×768**.
  - z above the stage and content, **below the header and the fast lane**.
  - `useLetterboxScene(ref, { close:["start 20%","start start"], open:["end end","end 80%"] })`: close over 12vh, hold, open over 12vh.
- **Consumers:**
  - films: close at the head (B30), open at the end (B35);
  - voices: around push-in #3.
  - Card exits "open" their own bars through the title mask (cards keep SPEC §9.3's "the ground is the bars").
- **Subtitles render inside the bottom bar.** Body text scrolls through the band between the bars.
- On films, the in-flow reason paragraph becomes `sr-only` while the bars are live; the subtitle is `aria-hidden`.
- Off for RM/phones (the bars never mount).

### 7.5 Day-to-night arc (`lib/sky.ts`, pure keyframes)

| where | time | grade (K / EV) | plates |
|---|---|---|---|
| hero, act I, about | moonlit night | 9500 K, −1.3 | MV-01, iconic-pearl, SEQ-PEARL, MV-05a–c |
| journey end → seam OUT | pre-dawn squall | 8000 K, −1.6 | MV-05d, MV-04 |
| seam IN → work | **dawn breaks** (over p .30–.50 of the seam) | 4200 → 5500 K, −1.0 → 0 | iconic-ice, MV-06 |
| act II body | day | 5500 K, 0 | pen, corridor, drone, ice-alt |
| films | the cinema, lights down | house deep | F-*, films plates |
| act III card → beyond | golden hour → dusk (beyond window push) | 3200 K, −0.2 | MV-10, iconic-wanted |
| voices | dusk → night except the fire | 2800 K | iconic-camp |
| act IV, contact, credits | candlelit night | 2400 K candle / 7000 K ceiling | iconic-hall, MV-08/MV-09 |

**Where the grade lives:**
- The GL IN half ramps `uGradeFrom → uGradeTo` (the only animated grade).
- Stage slots take a **static** filter set only under an opaque card, or a baked graded poster where the difference is large (measure the raster).
- Loop prompts.

There is no page-wide animated tint and no blend layer.

### 7.6 Impacts (`lib/impact.ts`)
- `impact(world, { shake, flash })`: once per world per page view; a no-op under RM.
- Shake = a WAAPI transform on the **frame element only**. Flash = one overlay opacity pulse, or `uFlash`.
- It emits `impact` for sound.
- WCAG 2.3.1: a single flash, no saturated-red flash.

| world | moment | shake | flash |
|---|---|---|---|
| Pirates | the iris reaches full frame, opening p .38 (the title drop) | 3 px, 280 ms decay | white .16, 120 ms |
| 3 Idiots | Rancho's circle closes, seam p .82 | 2 px | none (a chalk-dust puff) |
| RDR2 | flash-powder exposure, tintype p .25 | 2 px | white .18, 120 ms |
| HP | Lumos: the hall takes the frame, ignite p .55 | 0 | exposure bloom +0.35 EV, 180 ms |

**Files:**
- `lib/{stage,sky,impact,beats}.ts`;
- `lib/gl/*`, `components/gl/*`;
- `components/stage/{stage-gate,stage,stage-window,letterbox-bars,carried-shape,weather-layer,subtitles}.tsx`;
- `card-shell.tsx` (per-kind travel/pin, `<GlGate>`, `live`);
- `act-card-section.tsx` (GL specs, beats, subtitles);
- `plate.tsx`;
- the frames `opening-plate.tsx`, `seam.tsx`, `seam-chalk.tsx`, `tintype.tsx`, `tintype-deadeye.tsx`, `ignite.tsx`, `ignite-lumos.tsx` (register to the row; `data-gl-replaced`; overlays stay);
- `lib/media.ts` (marks);
- `lib/variants.ts` (register `stage.camera`, `match.shape`, `letterbox.breath`, `title.mask` with DEFAULT + ALT);
- `globals.css` (`--z-stage`, `--lb-h`, per-kind `--act-card-travel`, `[data-gl="on"] [data-gl-replaced]{visibility:hidden}`);
- `tools/capture/motion.js` (a `?gl=force` run with `--use-angle=swiftshader --enable-unsafe-swiftshader`; the default headless run measures the css tier).

### 7.7 Weather (`components/stage/weather-layer.tsx`)
- ≤ 16 pre-rendered sprites per world (DPR ≤ 2).
- Each sprite is its own small layer animated by an infinite WAAPI transform/opacity keyframe (compositor).
- Confined to the image side, split windows or card frames: **never over a text column or research data**.
- Paused when the host is offscreen or the stage is hidden; cancelled under RM.
- Kinds: Pirates spray flecks (drift + fall), 3I chalk dust (slow rise in the beam), RDR2 fireflies (slow blink ≤ 1 Hz), HP candle motes (rise).

---

## 8. Words (P3-7)

### 8.1 Act titles as text-as-mask (the four act titles only; D3-2)
- **DOM:** the card's real `<h2 id>` keeps its text (SR). The visual is `aria-hidden`.
- **GL `title` flavour:**
  1. A per-title SDF texture (the title set in its world face at 512 px cap height, EDT in `lib/gl/sdf-title.ts`, cached).
  2. Over the card's exit window, the frame outside the letters fades to the world deep: "the frame collapses into the letters".
  3. The letters, filled with the push-in's end frame, scale about `maskOrigin` (a point inside a glyph stroke, measured per title and stored in `lib/film.ts` `acts[].maskOrigin`) until the stroke covers the viewport.
  4. The frame is full-bleed and the stage shows the same frame.
  - SDF keeps the edge crisp at any scale.
- **css tier:** an SVG knockout overlay (deep rect with the title cut out) zoomed ×1 → ×6 by transform, without `will-change` (let Chrome re-raster), then an opacity crossfade to full-bleed.
- **ALT:** today's rising title in the lower bar + plain bars opening.
- **RM:** the static title card.

### 8.2 Titles arriving in character (L1)
**Primitive:** `components/words/in-character-title.tsx` wraps `SectionHead`/`MaskReveal`.
- SSR renders the final text: no-JS readable, identical markup.
- It animates only after the enter-once "armed" state (mounted offscreen), once per page view. RM → static.
- Moving layers are transform/opacity: a mask rides a transform. Nothing animates filter, text-shadow or background.

| world | DEFAULT | ALT | duration |
|---|---|---|---|
| Pirates | **stamped/burned:** the text is revealed by a scorch-edged mask sliding left → right while a pre-rendered scorch blot behind fades .5 → .25; scale 1.04 → 1 | branded: a radial burn-in from the centre | 420 ms |
| 3 Idiots | **chalked:** a baked ragged chalk-edge mask sweeps along the line (≈ stroke-by-stroke), with ≤ 12 dust sprites falling from the baseline | duster-reveal (the inverse wipe) | 600 ms |
| RDR2 | **poster press:** scale 1.02 → 1 with a pre-blurred ink-bleed duplicate fading .6 → 0 | typewriter: per-character opacity steps, 28 ms/char, cap 800 ms (Courier-like carriage click when sound is on) | 360 ms / ≤ 800 ms |
| HP | **ink nib:** a mask sweep along the baseline with a nib sprite riding the edge, and a wet-ink sheen duplicate fading out | ink bleed from the centre (radial mask) | 900 ms |

- **Hosts:** the world h2s listed in §2.5 and the four films-screen film titles (the lettered captions).
- Kalam heads keep line-height ≥ 1.05, so `MaskReveal` does not clip them.
- Never on act titles, research data, the experiment section, or any `tnum` element.

### 8.3 Scroll-scrubbed sentences (1 per act; L3)
**Primitive:** `components/words/scrub-sentence.tsx`.
- The sentence renders as normal text; words are wrapped in spans server-side.
- On DESKTOP_FINE with motion on, per-word opacity .28 → 1 is scrubbed as the line moves from 85% to 55% of the viewport (ScrollTrigger `scrub:true`, or motion's accelerated opacity map). It completes **before** the reading line (45–50%), and reverses when scrolling back.
- RM, no-JS and phones: fully visible. No number is ever scrubbed.

| act | string (source) | host |
|---|---|---|
| I | "The work I am proudest of is not a winning strategy — it is the documented graveyard of my own ideas that did not survive testing." (`pillars[1].body`, sentence 2) | About, pillar 02 |
| II | "A documented 'no' protects capital better than another optimistic 'yes'." (`featuredProjects[0].learned`, sentence 2) | trading-algos "learned" |
| III | "Nature, architecture, people — studying composition and the behavior of light and shadow." (`beyond[3].items[0].body`) | beyond, Creative · Photography |
| IV | "Most failures I have seen were failures of attention before they were failures of math." (`principles[4].body`, sentence 2) | principles, room 05 |

### 8.4 Subtitles (L5)
**Primitive:** `components/stage/subtitles.tsx`.
- Geist 500, 20 px @1440 / 18 @1024, `--fg` on the bar's deep (AA), centred, max 2 lines of ≤ 42 characters.
- Cues are split at existing punctuation (never re-worded). Each cue fades 120 ms in and out; cues never crossfade in place.
- The full sentence is in the DOM as `sr-only` text; the visual cues are `aria-hidden`.
- RM: the full line renders static under the frame.

| subtitle | cues |
|---|---|
| Act I logline (B04) | "Where I started," / "and the course I've been correcting ever since." |
| Act II logline (B14) | "What I build, how I try to break it," / "and what didn't survive." |
| Act III logline (B47) | "Life beyond the screen: the miles, the mat, the camera," / "and the people who have watched me work." |
| Act IV logline (B50) | "What I believe about doing this work honestly," / "and where to find me." |
| films reasons (B31–B34) | `film.worlds.<w>.reason`, one sentence per cue, shown while that screen's still is centred (in the global bottom bar) |

- In a card's lower bar the sequence is: the epigraph/TIP during the transition → the subtitle during the push → the mask.
- Loglines and reasons stay Aryan's drafts to rewrite (Phase 2). Rewording flows through automatically; the cue splitter uses the new punctuation.

### 8.5 Physical words (L2, ≤ 1 per section)
**Primitive:** `components/words/physical-word.tsx`.
- It wraps the **first** matching token in prose (never in a metric, label or caption). One-shot, 600 ms, transform/opacity; RM static; no effect if the token is absent (Phase 2 may reword).
- optuna-screener: "noise" in the problem paragraph. A pre-rendered grain sprite over the word settles to 0 while the word's letter-spacing jitter is done by per-letter translate (≤ 1 px).
- kill-list: "Killed" in the intro paragraph. An ember strike line draws through it once (`scaleX` 0 → 1 on a 1.5 px bar), then stays as a static strike. The word stays readable.

### 8.6 Honesty copy (lands with P3-2 Lenis and P3-6 WebGL; `proposed`)
- `components/site/capabilities.tsx:116` Meta: `["Smooth scroll (Lenis)", "CSS + SVG first", "WebGL only for scene changes"]`.
- `systems.pencil.body`: "The same question, asked of this page: CSS and SVG first, and one small WebGL layer only where the scenes change."
- Also grep the FIG "How this page is built" labels, SPEC SM-7 and the credits for "native scroll", "no WebGL" or "silent".
- The credits list GSAP and Lenis (and the fonts) under their licences.

---

## 9. Game layer (P3-8)

**Rules for every egg:**
- One *spell* (typed + palette + a lettered hint) and two *finds* per world.
- Each counts once, when the visitor triggers it; palette triggers count (that is the keyboard path).
- Effect ≤ 4 s, lazy (≤ 6 KB gz), never over text, leaves nothing behind.
- New on-page hotspots render only on DESKTOP_FINE; typed and palette paths work everywhere.
- No cut toy returns (§P).
- Quotes stay gated by verification: Q-PC-3 and Q-RD-1 are COMMUNITY-sourced and need their fallbacks.
- ICONS guards stand: IC-RD-02 (no gun, reticle, gunshot, heartbeat or blood on Dead Eye), IC-3I-08, IC-PC-03 (no cursor-following), IC-PC-05 (the tentacle wraps nothing), IC-HP-09 (no light across text), IC-HP-12.

### 9.1 The 12 eggs (3 per world; 7 reused, 5 new)

| # | hunt id → registry id | world · host | trigger | hint (where) | effect (≤ 4 s) | keyboard | RM | sound |
|---|---|---|---|---|---|---|---|---|
| 1 | `hp-map` → marauders-map | HP · global | typed "I solemnly swear…" / palette | faint IM Fell line "I solemnly swear…" on the Principles Map banner (`principles-map.tsx:277`, aria-hidden) | the Map dialog unfolds with the visitor's footprints; "Mischief managed" closes it | typed / palette; the dialog is fully keyboard | opens flat | parchment unfold + ink scratch; TTS whisper (flagged) |
| 2 | `hp-lumos` → lumos-nox | HP · header | typed "lumos"/"nox" / palette / Pause | the Pause tooltip "Lumos — resume motion" | Lumos: media light +10% over 300 ms + a wand-tip bloom **at the Pause control**, then motion resumes. Nox: media −10%, then Pause. | typed / palette / Pause | OS RM: toast `toast.lumos.os`, no bloom; still counts | bell swell / snuff (Pause then kills sound); TTS "Lumos" / "Nox" |
| 3 | `hp-snitch` → snitch | HP · credits | catch it | it rests visibly by "↑ Back to the opening" and darts once (credits ≥ 60% in view) | the SEEKER — you row (from the hunt) | its `<button>` | rests, catchable | wing flutter + catch ting |
| 4 | `pc-parley` → parley | Pirates · global | typed "parley" (new) / palette | faint Pirata One "parley?" marginal by the brass X at Now (IC-PC-06) | toast with **Q-PC-3**; until it is verified: "Parley granted — the terms are at Contact." The palette still jumps to Contact. | typed / palette | toast only | rope creak + flag snap; TTS "Parley" (generic voice) |
| 5 | `pc-coin` → aztec-coin (new) | Pirates · journey | the medallion (56 px at 1183, 4871 → a ≥ 44 px button) "Hold the coin to the moonlight" | it already turns moonlit at step 3 | a moon-silver mask sweeps the chart's brass layer (not text) for 1.2 s, gold → skeleton → back; adds no event (IC-PC-04) | button | an instant swap to the moonlit art; holds until the next press / Esc | coin ting + hollow wind |
| 6 | `pc-kraken` → hidden-kraken | Pirates · seam storm | a long look: frame ≥ 60% in view and no scroll for 2.0 s; or the "HERE BE MONSTERS" marginal button (new Meta, on the chart's east edge) | the marginal | the dark mass swells once under the foam (masked scale/brightness on the **plate**); one tentacle tip (ours, wraps nothing) breaks the foam and sinks, 1.5 s | the marginal button | static tip + toast | sub rumble + wave slap |
| 7 | `3i-aal` → aal-izz-well | 3I · optuna-screener | typed "aal izz well" (buffer `aalizzwell`) / palette / press-and-hold 600 ms on a chalk heart on the ICE board ledge (`chalk.tsx:277`; our 2-stroke heart, no hand) | the heart itself | the section h2 settles twice (existing, 700 ms) + a Q-3I-1 toast | heart `<button>` (Enter = the hold) / typed / palette | toast only | **two soft heartbeats** (the heartbeat lives here, never in Dead Eye) |
| 8 | `3i-quad` → quadcopter-lift | 3I · work | a gauntlet Run clears a hypothesis through 7/7 gates | the doodle on the board | the doodle lifts 8 px, rotors blurred 400 ms; toast "It flies. Take it up in Systems." | the Run button | counts on settle; no lift | rotor spin-up |
| 9 | `3i-pen` → worthy-pen (new) | 3I · kill-list head | activate the PenInset (`plate-band.tsx:315`) | "Kept for the one who proves worthy." | counts only if every ledger row reached the reading line / was activated, OR Dead Eye was won; otherwise the toast "Kept for the one who proves worthy. Read the whole ledger." Win: Rancho's circle draws round the pen + "Worthy." | inset `<button>` | circle drawn at once | case creak + ting |
| 10 | `rd-eagle` → eagle-eye (new) | RDR2 · beyond | an eye-ring glyph (our IC-RD-09 inner glyph) at the TrailMap start (`rdr2-frontier.tsx:109`) | the glyph | the Beyond **media** greys for 1.5 s; the ShoePrints and the dashed trail brighten in sequence to the tent (IC-RD-07) | glyph `<button>` | trail bright, static | low shimmer + wind |
| 11 | `rd-bone` → fossil-bone (new) | RDR2 · writing | a fossil bone half-buried in the journal landscape's hachures (new graphite strokes in `journal-sketches.ts`, slightly heavier line) | drawn | a pencilled margin note draws on: "another bone for the collector" (proposed; names no character) + a small bone sketch, 1.2 s | a `<button>` **outside** the aria-hidden page, positioned over the bone | note drawn, static | pencil scratch |
| 12 | `rd-fire` → campfire-flare (new) | RDR2 · voices | hover the fire 0.8 s, or focus/activate the ≥ 44 px hotspot at `useFirePoint` "Warm your hands by the fire" | the hotspot | one flare: brightness 1.2 on a masked fire region of the **plate** + ≤ 16 ember sprites rising 1.2 s (IC-RD-04 cap 24); toast: our own line, or Q-RD-1 once verified (never near the WANTED bill) | hotspot `<button>` | no flare; toast | log shift + crackle burst |

**Demoted, kept, not counted:**
- Obliviate/Accio (utilities);
- the bolt favicon;
- the console line, which gains "12 eggs hide on this page";
- "Turn off easter eggs";
- the 404 Map.

`patronus` → `enabled:false`; `owl` stays off; `dead-eye` becomes a toy.

### 9.2 The four toys (one per act)
**1. Act I · spin Jack's compass (simple)**
- **Host:** the About compass (144×207 at 926, 3091 @1440 today).
- Wrap the SVG in `<button aria-label="Spin Jack's compass">`; the SVG stays aria-hidden.
- **Click:** an impulse of +720…1080° (seeded), then `springNeedle` settles on the pillar under the pointer, else the last focused pillar, else NW.
- **Drag:** pointer capture on the case; the needle follows the pointer angle about the centre (direct manipulation, not cursor-following). Release = a flick with 3 s⁻¹ friction. The lid clicks open on each spin.
- **Keyboard:** Enter/Space spin; ←/→ step to the next pillar bearing.
- **RM:** a press jumps to the next bearing.
- **Sound:** lid click, a ratchet tick per 45° (≤ 12/s), a settle clunk.
- **Implementation:** `components/worlds/pirates/use-compass-spin.ts` (motion values, no re-render per frame). The Journey compass stays passive.

**2. Act II · FLY THE HOMEMADE DRONE (a real game)**
- **Host:** the systems DroneBand (1312×562 @1440, 928×398 @1024).
- **Entry:** a Meta pill "▲ Take off" (lower right of the band); palette "Fly the homemade drone" scrolls there and focuses the pill. It never auto-starts.
- **Goal:** fly the seven gates of the research gauntlet in order.
  - Chalk gates (`GateStroke` grammar) labelled 01…07; the next gate is the viewport's one aqua mark.
  - Passing gate *n* prints its **verbatim** `gauntlet[n].title` in a polite live region ("Gate 2 of 7 · A blind holdout, spent once").
  - At gate 7 the band shows a real link "Next: the kill-list ↓".
- **Course** (band-normalised):
  - gate x = .10 + .13·i;
  - centre y = .34, .66, .28, .60, .36, .70, .42;
  - opening = .22 of the band height;
  - pass = the centre crosses the gate x with y inside the opening;
  - take-off from `marks.drone` [.60, .47].
- **Physics** (px @1440, scaled by band width / 1312):
  - thrust 1500 px/s², max 460 px/s, drag v·e^(−2.6·dt);
  - tilt ±10°; hover bob ±2 px at 1.6 Hz;
  - soft bounce (restitution .35); **no crash, no fall, no fail state**;
  - dt clamped to 1/30 s; rAF only while flying, in view and visible.
- **Controls:**
  - arrows/WASD **only while the play field has focus** (it has instructions via `aria-describedby`; `preventDefault` only there);
  - pointer press-and-drag (spring k 90 s⁻², ζ .9);
  - Esc lands (600 ms back to the mark);
  - the band dropping below 50% visible auto-lands. Wheel and scroll are never captured.
  - Sets `html[data-game]`.
- **Score:** "7/7 gates · 18.4 s"; best time in `aryan:games:v1`. No time limit.
- **Media:**
  - **Preferred:** the photographed drone lifts off the plate. This needs `iconic-drone-empty` (drone inpainted out) + a cut-out sprite; both are new assets (log them).
  - **Fallback (0 cr, the default if assets are missing):** the plate dims to the slate "board" state and the chalk `ChalkQuadcopter` flies as a **pre-rasterized PNG sprite**. Never a live ChalkFilter on a moving element.
- **RM:** take-off disabled with the note "Motion is off: here is the flight plan", showing the static labelled course. Pause lands at once.
- **Sound:** rotor hum loop (rate = speed), a chalk tick per gate, a finish chord.
- **Performance:** one sprite (`translate3d` + rotate) on its own layer; gates are static SVG; the plate is never repainted; < 2 ms JS/frame.
- **Files:** `components/games/drone/{drone-game.tsx,course.ts,physics.ts}`, `drone-band.tsx`, `capabilities.tsx`.

**3. Act III (RDR2) · DEAD EYE TARGET GAME on the kill-list (a real game; D3-4)**
- **Entry:** a Meta pill "DEAD EYE" in Rye with our eye-ring glyph (**not a reticle**) in the ledger header's Meta row (`ledger-section.tsx:109`); typed "deadeye" (existing gate: ≥ 50% in view, DESKTOP_FINE); palette. Never auto-runs.
- **On start:** `scrollToTarget` centres the killed block (593 px @1440, which fits the 832 px under the header), awaiting completion.
- **Draw** (0.4 s):
  - time → 0.25× (WAAPI, videos, `--time-scale`, **and `gsap.globalTimeline.timeScale`**);
  - the grade is an **opacity overlay** (never transition the 2,122 px section's background: B6);
  - survivors and flagships dim a step and are never targets.
- **Paint** (5.0 s core, a draining white ring = IC-RD-09):
  - click a killed row (a 1312×119 target) → an ember X locks beside its reason (the existing `lock()`);
  - clicking a survivor costs 0.5 s and says "Survived: not a target".
  - Mark first, fire once.
- **Fire:** Enter, the "Fire" button, or the core running out. Every marked row strikes at once (180 ms); time returns to 1× over 300 ms. **No shake, no flash** (D3-5).
- **Read:** each struck row goes ghost → full ink and gets a disclosure with its **verbatim** reason and "Read the post-mortem in the repo ↗" (the existing href). Never invent a post-mortem.
- **Score:** "5/5 marked · 2.3 s of Dead Eye left"; best in `aryan:games:v1`; replayable.
- **Exit:** Esc/"Release" restores the ledger exactly (D-6).
- **Keyboard:** roving focus limited to the 5 killed rows (↑/↓, Enter/Space mark, Shift+Enter fire, Esc); no page-wide single keys (WCAG 2.1.4).
- **RM:** untimed, no time-scale, instant marks and strikes.
- **Sound:** a low-pass "time slows" swell, a pencil scratch per X, one dry ink strike, a release exhale. **No gunshot, no heartbeat.**
- **Files:** `components/games/dead-eye/{run.ts,dead-eye-hud.tsx,dead-eye-call.tsx}` (replaces `components/eggs/dead-eye.ts`, keeping the `killedRows` contract); `ledger-reckoning.tsx` (target mode, `data-deadeye-struck`, the rows-read set for egg 9); `ledger-section.tsx`.

**4. Act IV · light the candles with the wand (simple)**
- **Wand cursor** (HP acts only; `components/worlds/hp/wand-cursor.tsx`), in `#act-4`, `#principles` and `#contact` on DESKTOP_FINE with motion on:
  - `cursor:url(wand.png) 3 3` on non-interactive areas only;
  - one 96 px Lumos bloom sprite following by transform; rAF only while the pointer moves; fades after 1 s still.
  - This is the page's one light cursor.
- **Host:** contact's `HallField` (39 candles in 621×900 at x 819 @1440).
  - Armed dark **only if `#contact` was fully offscreen** (the Lens rule).
  - A candle within 56 px of the wand tip lights (a 300 ms crossfade to the lit sprite + `LumosSpark`).
  - All 39 lit → the existing copy-flare on the MV-08 flame + "The hall is lit."
  - **If untouched for 6 s in view, they light themselves** in a 40 ms/candle sweep, so the scene always resolves.
- **Keyboard:** a "Lumos" button in the contact column lights them all (1.6 s sweep).
- **SSR / no-JS / RM / coarse pointer:** every candle lit (today's state).
- **Sound:** a soft ignition "fwip" per candle (pitch-varied, ≤ 10/s); the hall hum swells with the count.
- **Files:** `hall-ceiling.tsx` (a per-candle `lit`), `components/worlds/hp/candle-toy.tsx`, `contact-scene.tsx`.

### 9.3 Header counter "4 / 12 found"
- `components/eggs/hunt-chip.tsx` in the header's right cluster, before Pause (≥ 64rem: `hidden lg:inline-flex`).
- A `<button>`, Meta `tnum`, **fixed width reserving "12/12"** (no CLS).
- Name: "Easter-egg hunt: 4 of 12 found. Show hints".
- It ticks once on `hunt:found` (400 ms; none under RM).
- It opens the lazy `hunt-panel.tsx` popover (non-modal; Esc closes; focus returns): 4 worlds × 3 slots (found = name + ✓; unfound = the themed hint), "Reset the egg hunt" (confirm), "Turn off easter eggs".
- Toast: "Egg 5 of 12 · The cursed coin".
- All copy goes in `egg.hunt.*` (`proposed`).

### 9.4 12/12 reward + post-credits scene
**The 12th find:**
- toast "12 / 12" + Q-HP-2 (via `FilmQuote`);
- the chip turns Snitch gold;
- **THE HUNT credits block** (`components/eggs/hunt-credits.tsx`, after `<SeekerRow/>` in `footer.tsx:200`): 12 rows, each role in its world's face, about the visitor, never facts about Aryan (`proposed`): "Solemn swearer — you", "Light-bringer — you", "Seeker — you", "Parley negotiator — you", "Moonlight witness — you", "Kraken spotter — you", "Hand on heart — you", "Test pilot — you", "Worthy of the pen — you", "Eagle eye — you", "Bone collector — you", "Warmed by the fire — you";
- a 3-note original chime sting (≤ 2 s, no film theme).

**Post-credits scene** (`components/site/post-credits.tsx`, after `[data-credits-last]`):
- The page ends only 116 px after the last line today, so add a **60vh tail**.
- **Trigger:** the tail ≥ 50% in view + 1.0 s dwell; once per session.
- **Scene** (≤ 5 s, transform/opacity): the **riderless broom** (the SVG in `components/intro/broom.ts`) drifts in along the bottom, pauses under "↑ Back to the opening", tips up and exits up-left. It is the bookend match cut to the intro.
- **12/12 extended cut:** first the four instruments play one beat each (the compass needle swings to point up; the chalk quadcopter lifts; the Dead Eye core fills gold; one candle lights), then the broom.
- **RM:** the broom rests beside the link, static.
- **Sound:** a broom whoosh + a soft chime.

---

## 10. Sound (P3-9)

### 10.1 Sources and cost
- **Procedural Web Audio:** 0 credits, 0 files, ~6–10 KB gz of JS. Original by construction, with no loop points.
- **Higgsfield TTS** (`qwen_audio_tts`, instruction "a hushed, breathy whisper", a generic preset voice, never "Arthur", never an audio reference from any film): ≤ 5 lines × 2 takes, **≤ 10 credits** (preflight `get_cost`).
  - Lines: "Lumos", "Nox", "I solemnly swear that I am up to no good", "Mischief managed", "Parley".
  - **Flag all five for Aryan.** "I solemnly swear…" is also CONTINUE Phase 2 item 4's open question.
- **No voice** for 3 Idiots (never the "Aal izz well" melody or rhythm: heartbeat only) or for RDR2 (actor-likeness risk).
- **CC0 assists (optional):** a sea wash for the Pirates bed only if synthesis is weak (Freesound, CC0 filter). Log it in the new `docs/build/SOUNDS.md` (source URL, licence, edits).
- No film score, no ripped audio, no cloned voice. Kling "sound on" harvest: not without Aryan's OK.

### 10.2 Beds (1 per world + house; follow the world at the reading line)

| bed | recipe |
|---|---|
| Pirates (intro landing → act-1, about, journey) | sea swell = brown noise → LP 500–900 Hz, amplitude LFO .09 Hz; wind = BP noise 800 Hz Q .7 with a slow LFO; hull/rope creak = resonant BP sawtooth glide 120 → 260 Hz every 6–14 s; seam storm = rain hiss (HP noise 3 kHz) + a low rumble (no thunder crack) |
| 3 Idiots (act-2 … kill-list; **silent bed in experiment**) | room tone = brown noise LP 200 Hz; ceiling fan = 70 Hz hum, AM 5–6 Hz; sparse courtyard FM chirps 2–5 kHz. **No crowd murmur.** |
| RDR2 (act-3, beyond, writing, voices) | campfire = random impulses → BP 1–4 kHz crackle + a 150 Hz noise roar; crickets = 4.5 kHz sine AM 30 Hz in 3–5 pulse groups; prairie wind; a distant train chuff 1.5 Hz + a faint generic horn every ~40 s (not any game's sound) |
| HP (intro play screen, act-4, principles, contact) | great-hall hum = non-melodic sines 110/165/220 Hz detuned ±3 cents, very soft; candle crackle; soft window wind. **Never** a celesta/music-box figure. |
| House (films, credits) | projector whir = 24 Hz AM on BP noise + a faint gate clatter |

### 10.3 Effects (all procedural unless noted)
- **Transitions and scenes:**
  - T0 broom whoosh: BP sweep 300 → 2500 Hz, 1.2 s, panned; a soft landing thump.
  - Wave-wash swell (hero → I, 1.5 s).
  - Wave recede + chalk-duster swipe (I → II, 0.6 s).
  - Shutter + flash-powder "whumpf" (II → III).
  - Match strike + rising shimmer (III → IV).
  - Letterbox "whum" (0.4 s low).
  - Projector start (films close); reel run-out (credits).
  - Impacts: iris ring, chalk-circle tock, flash-powder, Lumos swell.
  - Title-card sting: one soft note, only if unmuted.
- **Toys:**
  - compass: lid click / ratchet / settle;
  - drone: hum loop (180–320 Hz sawtooth + noise, pitch = speed) / gate tick / finish chord;
  - Dead Eye: slow swell / pencil scratch / ink strike / release exhale (no gunshot, no heartbeat);
  - candles: ignition fwip (pitch-varied) / hall swell.
- **Eggs:**
  - map unfold + ink scratch (+ TTS);
  - Lumos bell swell (+ TTS) / Nox snuff (+ TTS);
  - snitch flutter (18–20 Hz wing buzz) + catch ting;
  - parley rope creak + flag snap (+ TTS);
  - coin ting + hollow wind;
  - kraken sub rumble 40–70 Hz + wave slap;
  - aal two heartbeats;
  - quad spin-up;
  - pen case creak + ting;
  - eagle shimmer + wind;
  - bone pencil scratch;
  - fire log shift + crackle.
- **Hunt UI:** a per-world "found" chime (bell, chalk tick, spur jingle, glass chime); hunt complete = a 3-note original chime.
- **Other:** post-credits broom whoosh + chime; typewriter carriage clicks (RDR2 ALT titles); the toggle's own click.

### 10.4 Format, sizes, UI
- **Files** (TTS + CC0 only): Opus in WebM, 48 kHz mono, 48–64 kbps, with an MP3 96 kbps fallback chosen by `canPlayType`. Decoded into `AudioBuffer`s.
  - TTS ≤ 10 KB each; SFX ≤ 15 KB each (≤ 1.5 s); a file bed (if ever) ≤ 120 KB, made with ffmpeg `acrossfade` tail → head and `loudnorm=I=-30`.
  - **Total ≤ 150 KB, fetched only after the first unmute.**
- **UI:** `components/audio/sound-toggle.tsx` in the header (DESKTOP_FINE), between the hunt chip and Pause.
  - A speaker icon (SVG) `<button aria-pressed>`, name "Sound", tooltip "Sound on"/"Sound off" (`proposed`).
  - SSR renders the muted state. The first press creates the context and plays one soft click.
  - Under RM or Pause: `aria-disabled` with the tooltip "Sound follows motion: resume motion to hear it".
- **Rules:** muted by default every visit; the director's cut may unmute for its duration only (§11.1); Pause/RM suspend everything; no audio before the Play click; the intro stays silent unless the visitor unmutes.

---

## 11. Director's cut, chapter select, fast lane, analytics, collapsing (P3-10)

### 11.1 Director's cut autoplay (DESKTOP_FINE, motion on, Lenis alive)
**Entry:**
- a secondary button in the hero CTA row: "▶ Director's cut";
- the menu;
- the palette ("Play the director's cut").

**Always visible, never popping in:**
- SSR renders it at ≥ 64rem, so there is no CLS.
- Before Lenis is ready a click queues the start.
- Under RM/Pause it is `aria-disabled` with "Motion is paused".

**Behaviour:**
- `components/director/directors-cut.tsx` builds a shot list from the manifest beats.
- It chains `lenis.scrollTo(y, { duration: dist/speed, easing: t=>t })` per segment:

  | segment | speed |
  |---|---|
  | act cards | 160 px/s |
  | backdrop/split reading | 70 px/s |
  | research sections | 110 px/s |
  | films | 90 px/s |

- **Dwell 1.2 s at every star beat.** A "2×" toggle.
- It stops at the post-credits scene.
- **Sound:** the click is consent. If muted, it unmutes for the duration and restores the previous state on stop. The label says "(sound on)".
- **Stop:** any wheel, touch, key or pointerdown, Esc, Pause, the fast lane, or the stop control. That is a fixed bottom-centre pill "■ Stop · 2× · Act n/4", clear of the egg toasts and above the letterbox bars.
- Toys and eggs never auto-play. The Snitch and the post-credits scene play as usual.

### 11.2 DVD chapter select (the menu, DESKTOP_FINE)
- `components/site/chapter-select.tsx` in the menu sheet above today's links.
- 7 tiles:
  1. Prologue / hero (MV-01)
  2. I The Crossing (iconic-pearl)
  3. II The Workshop (iconic-ice)
  4. Intermission (F-3I)
  5. III The Frontier (MV-10)
  6. IV The Light (iconic-hall)
  7. Credits (MV-08)
- **Each tile:** a 16:9 `next/image` 320w (lazy, loaded when the menu opens), the numeral, and the act title in its world face (a lettering slot: add the file to the validator allow-list); the section links listed under it.
- **Behaviour:** a grid of real links; hover = a transform zoom only; no video. Selecting one closes the menu → `scrollToTarget(anchor, { cut:true, focus:true, history:"push" })`.
- Phones keep today's menu.

### 11.3 "Skip to the research" fast lane (always visible)
- **Header (≥ 64rem):** the existing Work pill (`header.tsx:179-190`) is relabelled **"Skip to the research"** (`proposed`), `href="#work"`, `data-fast-lane`. Below 64rem it stays "Work" (phones unchanged).
- **During the intro** (the header is under the overlay): add a "Skip to the research" link to the overlay's skip row (≥ 64rem only). The controller treats it as `dismiss()` then the jump.
- **The jump:** `scrollToTarget("#work", { immediate:true, cut:true, focus:true, history:"push" })`.
  - It marks the Idiots world fonts ready first (≤ 300 ms).
  - It stops the director's cut and any game.
  - It never glides through 20 screens.
- **The cut** (`components/director/cut-overlay.tsx`): a fixed deep layer, opacity 0 → 1 (140 ms) → the immediate scroll + `ScrollTrigger.update()` → 1 → 0 (220 ms). RM: an instant jump, no overlay.
- **z-order:** above the stage, bars, weather and games; below modal dialogs the visitor opened. It is never covered by toasts, the stop pill or title cards.

### 11.4 Scroll-depth analytics (privacy-light)
- `lib/analytics.ts` exports `track(event, props)`.
- It is a **no-op** unless `process.env.NEXT_PUBLIC_ANALYTICS === "vercel"` **and** `@vercel/analytics` is installed. **Neither happens in Phase 3** (D3-14); Aryan decides at hosting.
- In dev, `?debug=analytics` logs to the console.
- **Events** (no cookies, no IDs, no personal data, no third party):
  - `depth` at 25/50/75/100%;
  - `act` (first time each card reaches p .5);
  - `fast_lane`, `chapter`, `directors_cut` (start/stop, the % reached);
  - `toy` (name, start/finish);
  - `egg_count` (a bucket: 1–3/4–6/7–11/12);
  - `sound_on`.
- Sent after `intro:quiet-end`, batched on `visibilitychange`.

### 11.5 Collapsing long text (D3-9)
- **Native `<details class="collapse">`**, closed in SSR: no-JS works, and find-in-page opens it in Chromium.
- **Phones stay expanded:** `@media (max-width:63.99rem) { @supports selector(::details-content) { .collapse > summary {display:none} .collapse::details-content {display:contents; content-visibility:visible} } }`. A browser without that support shows a normal, working disclosure.
- The open/close height animation uses `interpolate-size: allow-keywords` where supported; RM instant.
- `requestScrollRefresh()` on toggle.
- **Collapsed:**
  1. The optuna appendix:
     - Option Alpha as **one whole block**, with its honest framing inside. Summary: "Where the discipline started · Automated 0DTE Options Bots (paper)" (existing strings; no numbers in the summary).
     - "Tools, pipelines, automation" (supporting list).
     - "Also on GitHub" (earlier repos).
  2. The About philosophy note. Summary: "The philosophy note".
  3. The credits' long provenance/quote lists. The fan-tribute line (H3, byte-for-byte), "To be continued." and "Mischief managed." stay visible.
- **Never split a claim from its caveat.** Never collapse metrics, limitations or research verdicts.
- **Hidden (not collapsed):** the chart-slot placeholders (`chapter-section.tsx:198`) stop rendering until real charts exist.
- **Aryan's calls, untouched:** the Writing drafts and the films chapter length (CONTINUE Phase 2 item 11).

---

## 12. Performance budget + a11y

### 12.1 Budget

| item | budget |
|---|---|
| **JS added, desktop** (gz) | Lenis + GSAP + ScrollTrigger + @gsap/react ≈ 53; stage + bars + weather + subtitles ≤ 8; GL (support, lock, transition, shaders, SDF) ≤ 8; words primitives ≤ 4; audio ≤ 10 (after the first unmute); hunt chip + store ≤ 3 in the header chunk, panel ≤ 4 lazy; drone ≤ 8 and Dead Eye ≤ 8 lazy on start; director's cut + cut ≤ 4 lazy. **Total ≤ 115 KB gz** (plus per-egg chunks ≤ 6 each, loaded on trigger). **All of it is dynamic after hydration/idle except the chip (≤ 3 KB).** |
| **JS added, phones** | ≤ 3 KB (the hunt store + chip code in a shared chunk; nothing else loads) |
| **Initial route chunk** | ≤ +3 KB vs P3-0 |
| **Fonts** | preload ≤ 6 KB (≥ 64rem); ≤ 64 KB per world; ≤ 192 KB for all desktop film faces, loaded per world on approach; phones = today's 54,336 B |
| **Video** | **1 decoder at a time, always**; ≤ 2.5 MB of video in flight per screen; WebM first; S ≤ 1.6 MB MP4 / ≈ 0.8 MB WebM (sea/rain ≤ 2.5 MB); I ≤ 0.8 / 0.4 MB; ≈ 25–30 MB total, lazy, desktop only; **phones 0 bytes** (unchanged) |
| **Sequences** | JV + SEQ-PEARL + SEQ-HALL ≤ 1.6 MB each, fetched within 1 viewport, desktop only |
| **WebGL** | 1 context; ≤ 25 MB GPU; draws only on p change; 0 shader compiles during a transition; tier-gated |
| **2D canvas** | ≤ 1 animating (intro, JV, ignite embers, sequence canvases); DPR ≤ 2 (intro trail ≤ 1.5) |
| **Audio** | 0 bytes until the first unmute; files ≤ 150 KB total |
| **LCP** | mobile lab ≤ 2.5 s with the intro armed (unchanged ±5%); desktop lab ≤ 400 ms (today 256–368 ms; the h1 in preloaded Pirata One) |
| **CLS** | **0**: h1 font swap (metric fallback), hunt-chip reserve, card travel reserved in CSS, collapses closed in SSR, split grids from CSS at first paint (`data-stage` only flips backgrounds/transparency, never layout), director's cut button SSR'd |
| **INP** | ≤ 200 ms (game input, egg triggers, the cut) |
| **Real GPU** (Aryan's laptop Chrome; 1440 and 1024; the target) | wheel-scroll through the whole page: p95 frame ≤ 20 ms, ≤ 2% of frames > 33 ms, **no frame > 50 ms** inside card transitions, push-ins, the intro hold → titles and the cut; idle 60 fps with a loop playing |
| **Headless relative** (`motion.js`, same machine as P3-0; judge `?skip=smooth` and default separately; `?gl=force` separately) | desktop fps ≥ 15.2 (target ≥ 18), p95 ≤ 316.7 ms; work, principles, journey, kill-list each ≥ 1.5× their baseline fps (3.2 / 3.3 / 3.5 / 3.9); pops ≤ 12 (baseline 27); CLS 0; intro targets §4.4 |

**Raster diet (required in P3-2, because Lenis makes 4–5× more frames per notch; headless shows 99% compositor-bound jank):**
1. principles: 52 `will-change` → ≤ 8 (moving leaves only); one scroll tracker for the Map instead of five.
2. work: plate-band `filter`/scale/clip-path entrances → transform/opacity; drop the 150%-wide `mix-blend-screen` sweep.
3. journey: stop repainting the sticky column (`div.sticky` ×8): promote the sequence canvas; the cartouche is static.
4. kill-list: the lens bracket moves by transform only; the Dead Eye grade becomes an overlay (B6).
5. writing: 8 live filters → baked graphite (images or paths); the title dot animates transform, not `left`.
6. voices: `campSticky` ×5 repaints → a baked mask, and the veil animates opacity only.
7. hero velocity layers: `will-change` on the wake and grain; write `--vn` only on a change > .01.
8. The Act II chalk filter never on a moving element; SVG overlays on photos (films finale, BoardFig, tintype marks, ignite-lumos) get their own layers.

### 12.2 A11y rules
- **RM/Pause stop ALL motion and sound within 100 ms:**
  - Lenis destroyed; GSAP tweens reverted;
  - loops → posters (0 video requests under RM);
  - GL off; weather cancelled; stage off (sections opaque);
  - bars never mount; audio suspended;
  - director's cut stopped; games landed/paused;
  - Dead Eye untimed.
  - The waveform Pause remains the WCAG 2.2.2 control.
- **One h1** (the name), mixed case, legible (blind test). Act titles are real `h2`s; masks, subtitles and in-character layers are `aria-hidden` duplicates, or the real text with only its opacity animated.
- **AA:** scrims ≥ .82 under text; subtitles on deep; world body faces in `--fg` only; the validator's #5 table covers every new world × tone.
- **Focus:** every jump focuses its target heading; the fast lane is reachable in the header's tab order; modals trap and return focus; the hunt panel is non-modal (Esc).
- **Keyboard path for every toy and egg** (§9); no single-key shortcuts outside a focused game (WCAG 2.1.4); typed words are ignored in fields and while `html[data-game]`.
- **Flash safety** (WCAG 2.3.1): ≤ 3 flashes/s everywhere (loops checked), no saturated-red flash (Dead Eye is a ramp), 4 impacts per page view.
- **Timing:** the Dead Eye core is an essential game timing, with an untimed path under RM; nothing else times out.
- **Live regions:** polite, once per event (gates, egg found, game score).
- **No-JS:** today's page, fully readable (collapses are native disclosures; no stage, no cards pinned).

---

## 13. Acceptance criteria

Each item:
- passes `npm run check`, `npx eslint .` and `npm run build`;
- shows no console errors or hydration warnings at 1440/1024/390;
- keeps the 390 run visually unchanged (`tools/capture/scenes.js … --only=desktop,mobile,rm`; phone diffs are limited to the intended header-chunk bytes);
- is committed and pushed.

**New copy:** every new string is `status:"proposed"` plus `unsigned: true`. The validator's RELEASE rule fails on `unsigned` (so `RELEASE=1` lists exactly the Phase 3 strings Aryan must sign), and plain `npm run check` stays green. Never flip `copySignedOff` for them.

**P3-2 Foundation**
1. `window.__lenis` exists only on DESKTOP_FINE with motion on after `intro:quiet-end`. It is absent at 390, under OS RM, after Pause (destroyed within 100 ms; the page stays scrollable, with no `overflow:clip`), with `?skip=smooth`, and on `/lab` and the 404.
2. Every anchor path works under Lenis with the correct offset and focus move: skip link, logo, fast lane, menu, palette (also under Pause: instant), Time-Turner (spin first), journey waypoints (centred), map rooms, hero CTA, and a hash on load.
3. Modals lock the scroll (wheel over the backdrop does not move the page); nested scrollers scroll.
4. The stage mounts only on DESKTOP_FINE with motion on after the intro. `html[data-stage="live"]` is set. The about, act-1 program and credits backdrops show the plate behind a ≥ .82 scrim (AA probe passes). The trading-algos, optuna and beyond split windows are sticky and never empty (SSR poster before the stage is live). Under RM, with no JS and at 390, every section renders as in P3-0.
5. The decoder log shows ≤ 1 playing video at every sample of a full scroll, and 0 during stage crossfades.
6. `beats` exist on every manifest item. The validator warns on gaps > 100vh and errors on the ration rules. `tools/capture/beats.mjs` runs at 1440 and 1024 and writes `estVh`.
7. The raster diet (§12.1) is landed. The headless desktop run (`?skip=smooth`) shows the four worst sections at ≥ 1.5× baseline fps and CLS 0.
8. The honesty copy (§8.6) ships in the same commit as Lenis, and the honesty lint passes.

**P3-3 Intro hand-off + titles**
1. Every target in §4.4 is met in `motion.js --runs=intro` (0 `#intro` repaints in the reveal; no LoAF > 50 ms from warm to titles end; hand-off script < 10 ms; the name on the 2nd reveal frame; the loop playing at reveal t0).
2. The strip shows no still-poster frames between the flight and the live sea.
3. The titles play only on the played path, end on any input or Pause, and hand off to `cap.hero`.
4. Skip/Esc/scroll, RM, `?skip` and repeat visits show no titles and no regression.
5. The intro fast-lane link dismisses and lands on `#work` with focus.

**P3-4 Typography**
1. The h1 renders in Pirata One at ≥ 64rem (mixed case, lh .96), in Geist at 390. It is the only `<h1>`.
2. Blind strangers read "Aryan Sharma" correctly at 1440 and 1024 (3/3).
3. The desktop LCP ≤ 400 ms; mobile LCP unchanged ±5%; CLS 0; the 390 network trace fetches no new font.
4. The world head and body faces apply per §5.2. The research probe finds 0 non-Geist text in `[data-research]`/`.tnum`/tables/figures/the experiment.
5. The font budgets pass in the validator; the glyph-coverage check passes.
6. FONTS.md lists every face, licence and byte count; the credits TYPE row is updated.
7. Before the first scroll only Pirata ASCII+ and the house faces load; other worlds load on approach.

**P3-5 Every plate moves**
1. The 6 re-seams are registered (`durationS` 8.0). MediaFrame serves WebM first (network panel).
2. ≥ 20 of the 25 loops ship, each with a `loop.mjs check` JSON passing §6.4 on both encodes, L2 sweep frames stored, logged in LOG.md and `LEDGER-p3loops.md`, and credits ≤ 350 with a balance ≥ 100 (target ≥ 156).
3. All four push-ins scrub smoothly. Registration: the first frame vs plate SSIM ≥ .95; the camp/ICE pushes keep their overlays registered (≤ 2 px drift of the chalk FIG at 1440).
4. Every film plate on screen > 1 s on DESKTOP_FINE with motion on is playing a loop, scrubbing, or under a camera move (a headed-Chrome probe of `data-media-state` + transforms). Under RM: posters only, 0 video bytes.
5. Camera and depth ALTs are registered in `lib/variants.ts`.

**P3-6 World transitions**
1. All four cards pin with the D3-1 travel on DESKTOP_FINE only; 390 is unchanged.
2. The GL tier runs all DEFAULT flavours and the ALTs. `?gl=off` shows the css tier; `?gl=force` in headless renders. Context loss falls back live.
3. The one-GL-context and one-decoder logs hold. No shader compiles during p motion (trace).
4. MATCH_ROW registration: the carried line sits at y 480 ± 6 px @1440 (410 ± 6 @1024) at each meet frame; the carried shapes morph in GL and are static SVG in css.
5. Exactly 4 impacts fire per full scroll (1 per world); 0 under RM.
6. Letterbox bars close/open on films and voices and sit below the header and fast lane.
7. The day-to-night grades match `lib/sky.ts` at each card meet.
8. The act-2 "one-frame pop" is gone: no frame-diff > 25% between consecutive samples in the seam strip.

**P3-7 Words**
1. The four act titles exit as masks (GL SDF crisp at every scale; the css tier works). The h2 text is present for SR.
2. The in-character titles play once per page view on the §2.5 hosts, never on data or the experiment. RM is static.
3. The four scrubbed sentences are exactly the §8.3 strings, complete before 50% of the viewport, and reversible.
4. The subtitles are the exact logline/reason strings split only at existing punctuation; SR reads each full sentence once.
5. There are two physical words, each one-shot.
6. Exactly one fly-through per act fires once.
7. The validator's ration counts pass.

**P3-8 Game layer**
1. Exactly 12 hunt eggs (3 per world) with triggers, hints, keyboard paths and RM states per §9.1. Each counts once; the counter survives a reload (localStorage) and syncs across tabs; server/hydration renders "–/12" with no hydration warning.
2. Obliviate keeps the count; Reset clears it; eggs-off hides the chip and hints.
3. The drone game: 7 labelled gates with verbatim titles; no fail state; keyboard only inside the focused field; auto-lands off-screen; Pause lands; best time stored.
4. Dead Eye: marks only killed rows, fires once, reveals only the existing reasons and links; Esc restores the ledger exactly; no gunshot or heartbeat; untimed under RM.
5. The compass spin and the wand candles work by mouse and keyboard. The candles self-light after 6 s untouched.
6. 12/12 shows the gold chip, THE HUNT credits and the sting.
7. The post-credits scene plays once per session on the 60vh tail (the extended cut at 12/12); RM static.
8. Bugs B1 (`eggs:off`), B2 (patronus), B3 (the fixed 900 ms), B5 (gsap timeScale), B6 (bg-color transition) and B9 (`data-game`) are fixed.

**P3-9 Sound**
1. Muted on every new visit. The first unmute creates the AudioContext (none before). 0 audio bytes before the first unmute.
2. Beds crossfade by world at the reading line (1.5 s); SFX fire on their events; levels per §3.5.
3. Pause, OS RM and a hidden tab suspend within 100 ms; the toggle is disabled with its note under RM/Pause.
4. The TTS lines are generic voices, logged with credits; SOUNDS.md lists every file; the validator's provenance check passes; files ≤ 150 KB.
5. Nothing sounds like a film score, an actor, a gunshot or the "Aal izz well" tune (a manual listen, recorded in the report).

**P3-10 Director's cut, chapter select, fast lane, analytics, collapse**
1. The director's cut runs top → post-credits with dwell at every star, stops on any input, Esc or Pause, restores the mute state, and never plays a toy.
2. The chapter select (7 tiles, lazy thumbnails) lands with the cut and focus.
3. The fast lane is visible at every scroll position, over bars, games and titles, during the intro (≥ 64rem) and during the director's cut. It lands on `#work` focused within 400 ms (the cut) with world fonts ready. It is "Work" at 390.
4. `track()` is a no-op in production without the env flag; no network request to any analytics host appears in the trace.
5. The collapses are closed at ≥ 64rem and expanded at 390 (supported browsers); Option Alpha's framing stays inside its block; the chart slots are gone; ScrollTrigger positions refresh after a toggle.

**P3-11 Critic loop: judge rubric** (up to 3 rounds; each judge is an independent subagent without build context, given captures only)

| axis | method | pass bar |
|---|---|---|
| **One star per screen** | capture a frame every 150 px of scroll at 1440 and 1024 (plus 2 s screencasts at every beat row); the judge counts dramatic elements per frame | ≥ 95% of frames have ≤ 1 star; 0 frames have ≥ 3; every flagged pair is fixed or justified |
| **No dead screen** | `tools/capture/beats.mjs` at both widths + the strips | 0 measured gaps > 100vh; every §2.4 stretch shows its fill |
| **"Would you keep scrolling?"** | 3 judges watch the director's-cut capture and the per-screen strips; yes/no + a reason per screen | ≥ 80% "yes" per act, no two consecutive "no" screens, and the hand-off, the four cards and the first Work screen all "yes" |
| **Blind stranger test** | `tools/capture/anon.mjs` + 3 judges + `tools/capture/score.mjs` | world recognizability ≥ the P3-0 score for each world; the hero name read correctly 3/3 at 1440 and 1024; 0 "can't read this" findings on text; the fast lane found within 10 s by 3/3 |
| **Smoothness** | `motion.js` desktop + intro, default vs `?skip=smooth`, plus `?gl=force`; Aryan's laptop recording if available | §12.1 headless targets and §4.4 met; on real hardware (if available) the §12.1 GPU targets |
| **Honesty + a11y** | RELEASE check, the research-font probe, an RM run (no motion, no sound, 0 video bytes), Pause mid-scroll, a keyboard-only pass through every toy and egg, the AA probe on scrims and subtitles | all pass |

Each judge scores every axis 1–5. **Ship bar: all axes ≥ 4 and every pass bar met.** Fix the findings, re-capture, re-judge.

**P3-12 Final QA**
- Check, eslint and build are green; all widths (1440, 1024, 390, 320); RM; no-JS; LCP.
- Write `docs/build/PHASE3-REPORT.md`: before/after numbers, credits spent, what Aryan should review (Appendix B).
- No merge to `main` unless Aryan asks.

---

## Appendix A: rules superseded by IDEAS §0/§O/§P (record the override where each rule lives)

| rule | where | new rule |
|---|---|---|
| Native scroll only; "no WebGL" | SPEC §11.1, SM-7, DESIGN, AUTOPILOT, `capabilities.tsx:116`, `systems.pencil.body` | Lenis + ScrollTrigger (§3.1); one contained WebGL layer (§3.3); copy per §8.6 |
| No audio; the intro "Silent. No audio track, no toggle" | SPEC §5.6, DESIGN | sound per §10; still muted by default and silent until the visitor unmutes |
| D-5 / validator #3 / #4: ≤ 2 long cards ≤ 60vh; page sticky ≤ 150vh; `scene` + long ≤ 2 | SPEC §0, §12.5, §9.2 `longCards`, F-7 | `film.cardTravel` (D3-1), ≤ 110vh each, sum ≤ 400vh, desktop-fine only |
| Canvas singleton page-wide | SPEC §10.1 #6 | D3-12 |
| Display face never on the name; the display font budget ≤ 24 KB `optional`, never preloaded | SPEC l.41, l.650, l.833, §14; DESIGN l.35, l.207; FONTS.md l.27; `lib/fonts.ts:6-10` | §5 |
| Dead Eye egg ≤ 3 s, once per session, no sound; world-visit ≤ 3 s | SPEC §10.3, `components/eggs/dead-eye.ts` header | the replayable game (§9.2) |
| The Snitch "no score" | IC-HP-12 | the hunt counter (§0 #4) |
| "At most one ambient world-light system" | SPEC §10.1 #2 | holds per screen: the stage is hidden under `own` sections; loops never double up (one decoder) |
| Lettering scope allow-list | validator #10 | §5.5 |

## Appendix B: flags for Aryan (non-blocking; the defaults are built)
1. Card travel (D3-1) adds ≈ 2.6 viewports of pinned scenes; the collapses give back ≈ 1.8; the fast lane mitigates.
2. The hero name is fully revealed about 0.7–1.0 s later than today (hold → reveal); the optional flight → loop re-blend removes the still.
3. Title card 2 wording, or "DIRECTED BY ARYAN SHARMA"; whether RM visitors get the static H-1 credit line.
4. TTS callouts, including "I solemnly swear that I am up to no good" (also his Phase 2 item 4).
5. The honesty copy (§8.6), the egg and hunt microcopy, the subtitle cue splits: all `proposed`.
6. Loop ALTs are code parallax rather than a second generated take; SEQ-PEARL/SEQ-HALL vs the code push.
7. Analytics on Vercel needs his consent at hosting.
8. The legacy ~56 MB of `public/media` is dead weight (prune in Phase 2).
9. The real-laptop Chrome performance recording (optional; it confirms the GPU targets, pre-raster and the hardware decoder).
10. `iconic-corridor` is now used (it answers Phase 2 item 8).

## Appendix C: ownership hints for PHASE3-PLAN (to avoid parallel conflicts)
- **Shared files with a single owner each:**
  - `lib/page.ts` (beats, stage) → P3-2;
  - `lib/film.ts` (copy, eggs, acts beats, `cardTravel`, `maskOrigin`) → one "copy + registry" owner, who takes requests from the others;
  - `lib/media.ts` → the media lane;
  - `app/globals.css` → P3-2 (the others append in marked blocks);
  - `scripts/check-manifest.mjs` → P3-2 (the others submit check functions);
  - `components/site/header.tsx` → P3-10 (it mounts the chip and sound toggle from P3-8/P3-9);
  - `components/intro/*` → P3-3 only;
  - `card-shell.tsx` + frames → P3-6 (P3-5/P3-7 plug in via props and slots).
- **Order:**
  1. P3-2 (Lenis, stage, beats, raster diet) and P3-3 and P3-4 in parallel;
  2. then P3-5 media (0-credit work first, generation in parallel from day 1), P3-6 and P3-7;
  3. then P3-8, P3-9 and P3-10;
  4. then P3-11 and P3-12.
