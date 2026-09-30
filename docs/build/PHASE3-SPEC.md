# PHASE3-SPEC — "Keep them scrolling" (desktop first)

**Status:** binding build spec for Phase 3 (P3-2 … P3-12). Written 2026-09-30 on `design/three-films` (P3-1); revised the same day after the director, engineer and completeness reviews (Review log at the end).
**Authority, in order:** `docs/build/IDEAS.md` §O (triage) + §0 (Aryan's binding decisions) + §P (Aryan's answers) → `CONTINUE.md` Phase 3 brief and Rules → this spec → `SPEC.md`, `DESIGN.md`, `ICONS.md`, `MOTION-REPORT.md` (every "native scroll only / no WebGL / no audio" rule in them is overridden; the full list of superseded rules is Appendix A).
**Evidence:** the seven stage-3 maps (page-beats, motion-infra, media-loops, game-eggs, intro-hero, typography, transitions; scratchpad `p3/maps/`), the P3-0 baseline (`docs/build/motion-strips/p3-before/summary.md`) and the media lane's tool notes (`docs/build/media/p3/tools.md`).
**Content and honesty:** `docs/build/CONTENT-RULES.md` is absolute. This spec adds **no fact**. Every word it puts on screen is an existing string in `lib/content.ts`, `lib/film.ts` or `lib/quotes.ts`, or new microcopy about *the page* (status `proposed` + `unsigned: true`, signed later by Aryan). Sharpe, PSR and PF are never animated.
**Next 16:** read `node_modules/next/dist/docs` before any Next-specific code (fonts: `01-app/03-api-reference/02-components/font.md`; resource hints: `…/04-functions/generate-metadata.md` → `ReactDOM.preload`, whose React 19 options include `media`; inline `<head>` scripts in the root layout: the `script` / `layout` pages there).

Words used below:
- **DESKTOP_WIDE** = `(min-width: 64rem)`. Type (world faces, the Pirata h1) and the fast-lane label only.
- **DESKTOP_FINE** = `(min-width: 64rem) and (hover: hover) and (pointer: fine)`. Everything that moves, plays or sounds: Lenis, stage, GL, pins, loops beyond today's, toys, hunt hotspots and chip, sound UI, director's cut. Both become exports in `lib/flags.ts` (a string for CSS/JS `matchMedia` plus a hook), replacing the duplicates in `card-shell.tsx:131` and `media-frame.tsx:84`. **Server-rendered desktop-only UI is hidden with the full media query, never with `lg:`.**
- **Motion on** = not OS reduced motion and not Pause (`useReducedMotion()` false; `motionOffNow()` false).
- **RM** = reduced motion OR Pause.
- **Boot gate** = `html.js:not([data-motion-boot="paused"])` inside `@media DESKTOP_FINE and (prefers-reduced-motion: no-preference)`. Every *layout* difference Phase 3 makes (card travel, split grids, the post-credits tail) is keyed on it and on nothing that changes mid-session (§3.2).
- **p_raw** = a pinned card's scroll progress, 0 → 1. **p** = the damped value the card draws with (§7.1).
- **Star** = the one dramatic thing on screen (O.4). A **scroll star** is driven by scroll position; a **time star** plays for a fixed time once triggered. Stars carry a **weight** 1–3 (§2.1). A **breath** is ≥ 1 viewport with no star above weight 1.
- **Spotlight** = the runtime arbiter that keeps time stars off scroll stars (§3.8).
- **landAt** = the p at which a card's new world is fully shown (every act anchor lands there).
- **scrollY** = the viewport-top scroll position at 1440×900 unless a width is named.

---

## 0. Decisions this spec makes (the maps disagreed or left these open)

| # | Decision | Why |
|---|---|---|
| D3-1 | **All four act cards pin on DESKTOP_FINE with motion on (the boot gate).** Travel: opening **90vh**, seam **110vh**, tintype **90vh**, ignite **110vh** = **400vh** (today 0 / 58 / 0 / 58). Pinning is a **DESKTOP_FINE mode, not a card property**: `pinned = travelOf(kind) > 0 && desktopFine && !pausedAtBoot`. Below DESKTOP_FINE every card keeps today's `long` flag, driver and eligibility, byte-for-byte. Pins stay **CSS sticky**, never a GSAP `pin`. | Squeezing a transition into 125–315 px is the measured cause of card choppiness. Passage cards also moved twice (card slide + transition). Supersedes D-5, validator #3/#4 and the 150vh sticky budget. Net page length ≈ +1 viewport after the D3-9 collapses. |
| D3-2 | **Each pinned card runs two stars:** (a) **the world transition**, p 0–.45 (OUT and IN halves are one star; the impact lands at its end); (b) **the push through the title**, p .50–1: the push-in and the act title as text-as-mask are one continuous camera move, the letters opening over the still-moving plate and exiting to full-bleed ("bars open"). p .45–.50 is a settle. No sub-notch holds. | Every star gets ≥ 300 px at 1440 and 1024 (311–495 px); a trackpad flick can no longer fire three stars back-to-back. |
| D3-3 | **Three push-ins**, each inside a card's star (b): #1 toward the Black Pearl (opening) and #3 into the Great Hall (ignite) are generated scroll-scrubbed sequences (DEFAULT; the ALT is a code push on the living loop); #2 across the ICE hall to the board (seam) is a code camera move on the L08 loop. The camp at dusk (voices) is a **quiet drift**, no longer a push-in. The tintype's star (b) is a code push toward the sun on L04, not counted as a push-in. | Frees Act III → IV of its double push; the two generated dollies still give real parallax at the page's first and last hero moments. |
| D3-4 | **Dead Eye stays hosted on the kill-list (Act II)** as RDR2's toy "visiting" another world (SPEC §3 rule 3). It becomes a replayable game with sound; it is no longer a hunt egg. (Act III's own screens have no toy: flagged, Appendix B.) | Moving the kill-list was rejected in SPEC §2 item 5. |
| D3-5 | **The four impacts** each land on "new world revealed": the Pirates spyglass iris reaching full frame (opening p .45); the **duster slap** as the chalk-IN reveals the ICE hall (seam p .45: a dust puff + 2 px shake); the tintype flash-powder exposure that starts the develop (tintype p .03, the card's hook); the Lumos bloom as the Great Hall takes the frame (ignite p .45). The Dead Eye game's volley gets no shake and no flash. | Every scroller meets all four; one per world (O.2). |
| D3-6 | **Scroll-scrubbed sentences (one per act)** are existing strings: Act I `pillars[1].body` second sentence; Act II `featuredProjects[0].learned` second sentence; Act III `beyond[3].items[0].body`; Act IV `principles[4].body` second sentence (§8.3). | Act I avoids repeating Act II's epigraph. Nothing contains a research figure. |
| D3-7 | **Subtitles (L5)** are the four act **loglines**, each one static line in its card's lower bar through star (b) (Act III's in the tintype, not voices). There are **no reason subtitles**: the films reasons stay visible in flow. The loglines render nowhere today and are Claude drafts, so they ship `unsigned` (Appendix B; the alternate is no logline). | These are the "one-liners" in `docs/build/ONE-LINERS.md`; a 0.5 s cue cannot be read. |
| D3-8 | **The hero h1 takes Pirata One** at DESKTOP_WIDE only, preloaded with `media`. Below 64rem: Geist and today's four world subsets byte-for-byte (§5). | §P(b), plus "phones unchanged". |
| D3-9 | **Collapse and hide** (§11.5): the optuna appendix (Option Alpha + supporting list + earlier repos) behind a native `<details>`, the About philosophy note, and the long credit lists. Chart-slot placeholders stop rendering (an intended change at every width, §13). Phones keep everything expanded. | IDEAS §3 keeps "hiding unfinished placeholders"; O.1 keeps "collapsing long text". |
| D3-10 | **Sound is procedural Web Audio (0 credits, 0 files)**, plus ≤ 5 generic-voice TTS spell callouts (≤ 10 credits) and optional CC0 recordings. Higgsfield audio is TTS-only; its music/SFX models are "game pipeline only". | The media-loops map's §7. |
| D3-11 | **Lenis is never created during the intro** or during its title "quiet window". It is destroyed (never `stop()`ed) under RM. Everything heavy starts through the **warm-up ladder** (§3.1), one step per idle slice. | motion-infra R1/R2/R7 + intro-hero §9 + the engineer review (#4). |
| D3-12 | **Canvas rule, updated:** ≤ 1 live WebGL context page-wide and ≤ 1 animating 2D canvas; the two are never both full-viewport. The ignite ember canvas (frame-sized) may run beside the GL frame. | Replaces SPEC §10.1 #6's "canvas singleton". |
| D3-13 | **The toy is labelled "Fly the homemade drone"**, never "Rancho's drone" (IC-3I-08: the drone was Joy Lobo's). O.1's "fly Rancho's drone" is shorthand. O.1 overrides IC-3I-08's "never a comic flying sprite" **for the drone toy only** (Appendix A). Every other IC-3I-08 guard stands: no window, no camera feed, no "Give Me Some Sunshine", no crash, fall or fail, no comic sound, never linked to Aryan's drone reel; there is no fly-through in Act II. | ICONS guard stands except where O.1 names the toy. |
| D3-14 | **Analytics:** ship a no-op `track()` hook with privacy-light events. Installing `@vercel/analytics` waits for Aryan's hosting and consent. | "No third-party trackers without consent." |
| D3-15 | **Pacing is weighted.** Every star has a weight (3 set piece · 2 signature · 1 quiet star) and every item a tempo (slow / medium / brisk). After any weight-3 star comes a breath. | IDEAS N: "deliberate fast and slow passages". |
| D3-16 | **Titles arrive in character 8 times:** the first world h2 of each act (about, work, beyond, principles) and the four films-screen film titles. Every other world h2 keeps its world face with today's quiet `MaskReveal`. | The gag wears out at 15. |
| D3-17 | **Split screens keep the stage at 1024:** the split text column is a named container `split`, and research grids inside it stack below 48rem of column width (§3.2). | Chosen over "split only at ≥ 80rem" so both judged widths keep the window. |

---

## 1. Goals and non-goals

### 1.1 Goals (judged at 1440×900 and 1024×768, laptop Chrome first)
1. **Smooth.** Scroll-linked motion glides (Lenis + ScrollTrigger scrub smoothing, §0 #1). **Every scroll star spans ≥ 300 px (~3 wheel notches) at both widths**; inside a pin, p is damped so each star shows for ≥ ~400 ms even on a flick; the intro → hero hand-off has no freeze, pop or repaint storm; nothing heavy starts under the visitor's first wheel (warm-up ladder).
2. **No dead screen.** No stretch longer than 100vh without a beat (§2; quiet beats count), measured at both widths.
3. **One star per screen** (O.4), enforced at runtime by the spotlight (§3.8), not only on static spans. Everything else is quiet (loops, camera drift, weather, grain).
4. **A hook in every act's first 2 seconds** (IDEAS N): each card's p ≤ .05 frame is already a picture worth stopping for (§7.1).
5. **Deliberate tempo** (IDEAS N): slow set pieces, brisk research, breaths after every set piece (§2.1).
6. **A movie:** a persistent stage, living loops, a virtual camera, world transitions through one small WebGL layer, match cuts, letterbox breathing, a day-to-night arc, titles arriving in character, subtitles, opening titles, a post-credits scene, sound (muted by default), the director's cut and DVD chapter select.
7. **A game:** a 12-egg hunt (3 per world) with a header counter and a 12/12 reward, and one toy per act (two real games: the homemade drone and Dead Eye).
8. **Never in the way:** "Skip to the research" is always visible, no entertainment blocks content, and RM/Pause stops all motion and sound. The Pause button is never a toy or an egg trigger.

### 1.2 Non-goals (Phase 3)
- **Below DESKTOP_WIDE (phones, small tablets):** today's behaviour, byte-for-byte where practical (the intended 390 changes are listed in §13). No Lenis, stage, WebGL, pins, loops beyond today's, new fonts, sound UI, hunt chip or hotspots, toys, fast-lane relabel, director's cut or post-credits tail. Typed/palette eggs keep working everywhere. The mobile cut is Phase 4.
- **DESKTOP_WIDE but not DESKTOP_FINE (large touch tablets, hover-less laptops in tablet mode):** the Phase-3 type only (world faces, the Pirata h1, the "Skip to the research" label). No motion, game or sound UI: those are DESKTOP_FINE.
- **The info** (Phase 2 queue): no rewrite of facts, loglines, reasons or quotes. Phase 3 only *places* existing strings.
- **Cut (O.3), never built:** speed ramps; text revealed by light for paragraphs; cursor trails outside HP (the wand is the only light cursor); phone tilt; "previously on…" recaps; the film-strip scroll indicator; instrument counters and marquee quotes; the cannon, scratch-off map, pet the horse, honor meter, visitor bounty poster, journal sketch pad and stoke-the-fire toys (§P overrules O.3's "the best may be reused as eggs": none is); eggs beyond 12 (rum, Wingardium Leviosa, 9¾, stopwatch, quiz).
- **Deferred:** idle moments (no scene ever reacts to the visitor doing nothing); the 12/12 share card.
- **Not in the plan without Aryan's OK:** harvesting Kling "sound on" audio; any film score or ripped audio; any voice imitating an actor.

---

## 2. Beat map (the whole page, in order)

### 2.1 Grammar
- **Star kinds** (dramatic; one at a time): world transition (with its impact) · push through the title · title arriving in character · scroll-scrubbed sentence · physical word · fly-through · a signature scene already built (voyage scrub, course plot, gauntlet chalk, schematic ink, map unfold, WANTED nail-up, film finales, the voices quote into firelight) · letterbox close ("house lights down") · match cut · window arrival · toy invite · post-credits scene. `signature` beats **are stars** for the validator.
- **Quiet kinds** (never a star): living loops, stage camera drift (including the camp drift), depth parallax, weather particles, hero velocity grain, rack focus, stage crossfades within a world (≥ 40vh of scroll), letterbox opens, subtitles (a static logline line in a card bar), hunt-chip tick, toasts.
- **Opt-in** (never auto-run, never a scroller's star): toys and eggs. A toy's *invite* may be a weight-1 time star (one 400 ms pulse, on scroll-idle, once). **One exception:** the credits Snitch's existing once-per-session dart (IC-HP-12) is the credits' star (B57), requested through the spotlight like any time star.
- **Weights:** **3** = card set pieces (both card stars), the films opening ("house lights down"), the post-credits scene. **2** = signature scenes, fly-throughs, the voices quote. **1** = titles in character, physical words, scrubbed sentences, invites, match cuts, window arrivals, and any signature demoted because it sits in a breath (marked).
- **Pacing rules:** after any weight-3 star, ≥ 1 viewport of weight ≤ 1 (the breath; a card's star (a) → star (b) pair is one set piece and exempt); no two weight-3 stars within 2 viewports outside a card; research sections (`chapter`, `ledger`, `experiment`, `matrix`) stay weight ≤ 1 apart from signatures already built.
- **Tempo** (per item): **slow** = the hero, cards, films frames, voices, credits (long spans; the director's cut runs cards at 140 px/s, where the damped p gives each star its time, and other slow items at 90 px/s); **medium** = about, journey, beyond, writing, principles, contact (110 px/s); **brisk** = work → kill-list including the experiment (150 px/s; weight-1 stars, short gaps).
- Every beat carries `data-beat="<id>"` in the DOM (§3.4) so the probe can measure it; stars also carry `data-beat-star` and `data-beat-weight`.

### 2.2 Page geometry after Phase 3 (≈; the beat probe re-measures)
The heights are today's measured heights plus D3-1 travel and minus D3-9 collapses. Page ≈ **42,420 px (47.1 viewports)** at 1440×900 (today 41,499) and ≈ **38,380 px (50.0)** at 1024×768 (today 37,916). Two rows must be re-probed before anything trusts them: row 2 (the opening's new pin wrapper, §7.1) and the split rows at 1024 (the research grids stack inside the split column, §3.2).

| # | item | mode (§3.2) | tempo | top @1440 | h @1440 | h @1024 | change |
|---|---|---|---|---|---|---|---|
| 1 | top (hero) | own | slow | 0 | 900 | 768 | hand-off fix, name in Pirata One |
| 2 | act-1 card `opening` | card: pin wrapper 90vh + program sibling | slow | 900 | ≈2394 (wrapper 1710 + program ≈684) | ≈2016 (1459 + ≈557) | letterbox layout inside its own pin wrapper on DESKTOP_FINE; the program block becomes a `backdrop` sibling; **re-probe** |
| 3 | about | **backdrop** | medium | 3294 | ≈1250 | ≈1317 | philosophy note collapsed |
| 4 | journey | own | medium | 4544 | 2815 | 2373 | sticky column starts at the h2 |
| 5 | act-2 card `seam` | card, 110vh | slow | 7359 | 1890 | 1612 | +52vh |
| 6 | work | own | brisk | 9249 | 2292 | 1986 | HeadBand arrival fix |
| 7 | trading-algos | **split (window right)** | brisk | 11541 | ≈1610 | ≈1448, **re-probe** | chart slot hidden |
| 8 | optuna-screener | head own + body **split (right)** | brisk | 13151 | ≈2270 | ≈2021, **re-probe** | appendix collapsed, chart slot hidden |
| 9 | experiment | opaque (H4: no film) | brisk | 15421 | ≈1000 | ≈898 | empty head tightened |
| 10 | systems | own | brisk | 16421 | 1958 | 1756 | — |
| 11 | kill-list | opaque (+ own head inset) | brisk | 18379 | 2122 | 2169 | — |
| 12 | films | own + "house lights down" | slow | 20501 | 5334 | 4477 | — |
| 13 | act-3 card `tintype` | card, pinned 90vh | slow | 25835 | 1710 | 1459 | +90vh |
| 14 | beyond | own band + lower half **split (window left)** | medium | 27545 | 3763 | 3643, **re-probe** | — |
| 15 | writing | opaque (paper) | medium | 31308 | 2653 | 2469 | — |
| 16 | voices | own (campSticky), no letterbox | slow | 33961 | 1393 | 1461 | — |
| 17 | act-4 card `ignite` | card, 110vh | slow | 35354 | 1890 | 1612 | +52vh |
| 18 | principles | opaque (map) | medium | 37244 | 2327 | 2230 | — |
| 19 | contact | own | medium | 39571 | 900 | 768 | — |
| 20 | credits + post-credits | **backdrop** | slow | 40471 | ≈1950 | ≈1903 | lists collapsed; +60vh post-credits tail (boot gate) |

Pinned scroll windows at 1440: act-1 900→1710 · act-2 7359→8349 · act-3 25835→26645 · act-4 35354→36344. Star spans per card are in §7.1.

### 2.3 The beat map (1440×900; scrollY = viewport top; one star per row)
Key to the kind column: kind · `s` scroll / `t` time · weight. Rows marked ⟂ are breaths (weight ≤ 1 after a weight-3 star).

| # | scrollY ≈ | where | beats in order (quiet ones in *italics*) | **THE ONE STAR** | kind · timing · w | tempo | supplied by |
|---|---|---|---|---|---|---|---|
| B00 | intro, time | prologue play screen | *IN-01 living loop (L05)*; Play; Skip intro; Skip to the research | the living play screen | signature · t · 2 | slow | P3-5 (L05, only after P3-3) |
| B01 | intro, time | flight → hold → reveal → titles | broom flight; hold on the last frame; compositor wipe; 3 title cards; then `cap.hero` | flight, then wipe, then titles (sequential) | signature · t · 3 (outside the page rules) | slow | P3-3 |
| B02 | 0–900 | hero | *MV-03 re-seamed loop, velocity grain, pointer shift*; the opening card slides up already showing its **hook frame** (a 12%-radius spyglass disc on the lit stern; the film title static) | hero exit camera push + darken | signature · s · 2 | slow | existing + P3-5, P3-6 |
| B03 | 900–1265 | act-1 p 0–.45 | the disc sits on the horizon row the hero left; **spyglass iris** opens to the frame diagonal; **impact** (Pirates) at .45 | spyglass iris → impact | transition · s · 3 | slow | P3-6 |
| B04–05 | 1305–1710 | act-1 p .50–1 | *p .45–.50 settle on L01*; **push through the title #1**: SEQ-PEARL dolly toward the Black Pearl, "THE CROSSING" opening as text-as-mask over the moving plate from p .68 → full-bleed; the stage takes the same frame; Act I logline static in the lower bar; *sea-spray* | push through the title | push-title · s · 3 | slow | P3-5, P3-6, P3-7, P3-2 (hand-off) |
| B06 ⟂ | 1710–2394 | act-1 program (backdrop over the stage) | brass course plots compass → rows; needle settles with the moon-tip flash; *stage drift* | course plot (small, inline) | signature · t · 1 (demoted: breath) | medium | existing ProgramStage on P3-2 backdrop |
| B07 ⟂ | 2394–3294 | about head + bio | About h2 **stamped in character** (Pirata One; Act I's one animated h2); *stage: SEQ-PEARL end still, drift + depth parallax, scrim .86* | h2 in character | title · t · 1 | medium | P3-7, P3-2 |
| B08 | 3294–3950 | about pillars | **scroll-scrubbed sentence (Act I)** on pillar 02; then, on scroll-idle and only once the sentence leaves the middle 60%, the compass toy invite (one needle twitch) | scrubbed sentence, then compass invite (sequential, spotlight) | scrub-sentence · s · 1; toy-invite · t · 1 | medium | P3-7, P3-8 |
| B09 | 3950–4544 | about end → journey head | *stage crossfades (≥ 40vh) to MV-05a L06*; journey h2 (Pirata, quiet MaskReveal) with the sticky column arriving at the h2, showing JV frame 0 = MV-05a | **match cut:** stage harbour → voyage window | match-cut · s · 1 | medium | P3-2 (stage), journey head fix |
| B10 | 4544–5500 | journey steps 1–2 | JV sea scrub; compass per leg | voyage scrub | signature · s · 2 | medium | existing |
| B11 | 5500–6450 | journey steps 3–4 | voyage scrub; ember tick at "The break"; medallion moon sweep (`pc-coin` egg host); "parley?" marginal; *L19 fog at rest* | voyage scrub | signature · s · 2 | medium | existing + P3-8 |
| B12 | 6450–7359 | journey end | *first light (L20) at rest*; **gull fly-through (Act I)** on scroll-idle, across the voyage window's sky only (never a text column); the seam card rises already showing its hook frame | gull fly-through | fly-through · t · 2 | medium | P3-7 |
| B13 | 7359–7805 | act-2 p 0–.45 | hook: the breaker already rolling in from the left over the storm (*L12 still*); **Pirates wave OUT** (0–.22); meet on the carried line (storm horizon = ICE ledge) and carried shape (compass ring → gear); **3I chalk-dust IN** (.22–.45) reveals the ICE hall with FIG. 0 already on the board; dawn grade ramp; **impact** (3I duster slap) at .45 | world transition I→II → impact | transition · s · 3 | slow | P3-6 |
| B14–15 | 7854–8349 | act-2 p .50–1 | **push through the title #2**: code camera across the hall to the board (L08, 1 → 1.35; FIG. 0 static inside the camera group; gauge = p), "The Workshop" opening as text-as-mask from p .68 → full-bleed; Act II logline static in the lower bar; *chalk dust in the beam* | push through the title | push-title · s · 3 | slow | P3-5, P3-6, P3-7 |
| B16 ⟂ | 8349–9249 | card release → work head | Work HeadBand (L18) settles **as it enters** (no longer armed at opacity 0); Work h2 **chalked in character** (Act II's one animated h2) | h2 chalked | title · t · 1 | brisk | P3-7, P3-5 |
| B17 | 9249–10150 | work: standing rule → dawn board | *board L09 living beam*; tabs derive each gate in chalk on entry | board gates chalk on | signature · t · 2 | brisk | existing |
| B18 | 10150–10641 | work gauntlet | Run button invite (one pulse, scroll-idle); Run = the existing toy; `3i-quad` egg | Run invite | toy-invite · t · 1 | brisk | existing + P3-8 |
| B19 | 10641–11541 | trading-algos arrival | **split window slides in** over ≥ 40vh (iconic-corridor, L10, camera pan-l); h2 in Kalam with today's quiet MaskReveal; *chalk-dust weather in the window* | window arrival | stage-cue ★ · s · 1 | brisk | P3-2 |
| B20 | 11541–12400 | trading-algos FIG. 1 + approach | blueprint schematic inks itself; *rack focus in the window between blocks* | schematic ink | signature · t · 2 | brisk | existing |
| B21 | 12400–13151 | trading-algos learned / limitations | **scroll-scrubbed sentence (Act II)**; then Rancho's circle on the caveat | scrubbed sentence, then circle (sequential) | scrub-sentence · s · 1 | brisk | P3-7 |
| B22 | 13151–13900 | optuna head | MachineBoard (L16): "What is a machine?" chalk-writes; answer line | chalk-write | signature · t · 2 | brisk | existing + L16 |
| B23 | 13900–14700 | optuna body (split, window cue 1 = iconic-ice L08) | **physical word "noise"** (one grain-settle); *rack focus at the approach → metrics gap*; `3i-aal` chalk heart on the board ledge | physical word | physical-word · t · 1 | brisk | P3-7, P3-8 |
| B24 | 14700–15421 | optuna end (window cue 2 = iconic-corridor-alt, depth parallax) | Rancho's circle on "anything > 2.0 is a red flag"; collapsed appendix disclosures | Rancho's circle | signature · t · 1 | brisk | existing, P3-10 collapse |
| B25 | 15421–16421 | experiment (no film, H4) | the synthetic curve draws once on entry (its "Synthetic • illustrative" label visible from frame 1); toggle toy | curve draw | signature · t · 1 | brisk | P3-7 (small) |
| B26 | 16421–17300 | systems head | *DroneBand L07*; the **Take-off invite**: on scroll-idle the band's drone lifts 8 px once beside the "▲ Take off" pill (no fly-through in Act II) | Take-off invite | toy-invite · t · 1 | brisk | P3-8 |
| B27 | 17300–18379 | systems matrix | FIG. "How this page is built" inks (copy made honest, §8.6); drone game (opt-in) | FIG ink | signature · t · 2 | brisk | existing |
| B28 | 18379–19250 | kill-list head | h2 in Kalam, quiet MaskReveal; *PenInset L17*; **"DEAD EYE" pill invite** (scroll-idle); `3i-pen` egg | Dead Eye invite | toy-invite · t · 1 | brisk | P3-8 |
| B29 | 19250–20100 | kill-list rows | **physical word "Killed"** struck through once; lens bracket; Dead Eye game (opt-in) | "Killed" strike | physical-word · t · 1 | brisk | P3-7, P3-8 |
| B30 | 20100–20460 | fade-out → films head | **letterbox bars close** over 40vh at the INTERMISSION head: "house lights down" | house lights down | letterbox · s · 3 | slow | P3-6 |
| B31 ⟂ | 20501–21500 | films: Pirates screen | film title **burned/stamped**; plate opens (*L14*); *the bars open as the Pirates frame centres (≈ 1.5 screens after the close); from here the frame's own 2.39 matte carries the scene*; compass finale (demoted: breath); the reason stays visible in flow | title in character | title · t · 1 | slow | P3-7, P3-5, P3-6 |
| B32 | 21500–22700 | films: 3 Idiots screen | title **chalked**; plate (*L22*); gates finale | title, then finale (sequential) | title · t · 1; signature · t · 2 | slow | same |
| B33 | 22700–23900 | films: RDR2 screen | title **poster-pressed**; plate (*L21*); X finale | title, then finale | title · t · 1; signature · t · 2 | slow | same |
| B34 | 23900–25100 | films: HP screen | title **inked with a nib**; plate (*L13*); ink + Lumos finale | title, then finale | title · t · 1; signature · t · 2 | slow | same |
| B35 | 25100–25835 | films end → act-3 arrives | the Intermission warm point descends over ≥ 40vh and settles on the rising tintype card's sun mark (both halves on screen together); the card arrives on its latent ghost | **carried shape:** warm point → sun | match-cut · s · 1 | slow | P3-6 |
| B36–37 | 25835–26200 | act-3 p 0–.45 | hook: **impact** (RDR2 flash powder) at p .03 starts the **tintype develop** outward from the horizon row (.03–.45); sepia → golden hour; bone border settles .38–.45; TIP in the lower bar | flash powder → develop | transition · s · 3 | slow | P3-6 |
| B38 | 26240–26645 | act-3 p .50–1 | **push through the title**: code push toward the sun on L04 (1 → 1.04), "THE FRONTIER" opening as text-as-mask from p .68 → full-bleed MV-10; **Act III logline** static in the lower bar (moved from voices) | push through the title | push-title · s · 3 | slow | P3-5, P3-7 |
| B39 ⟂ | 26645–27545 | card release → FrontierBand | *L04 continues full-bleed; the band's push continues 1.04 → 1.08 (quiet drift)* | — (breath, quiet only) | — | medium | existing + L04 |
| B40 ⟂ | 27545–28430 | beyond head + Athletics | h2 **poster-pressed** (Rye; Act III's one animated h2); notes rise; ShoePrints; `rd-eagle` eye-ring | h2 in character | title · t · 1 | medium | P3-7, P3-8 |
| B41 | 28430–29330 | TrailMap + Activities (split window LEFT: MV-10 L04, camera push toward the sun) | TrailMap fog lifts | fog lift | signature · s · 2 | medium | existing (CSS `view()`) |
| B42 | 29330–30230 | Community + Creative (split) | *rack focus between blocks*; **scroll-scrubbed sentence (Act III)** | scrubbed sentence | scrub-sentence · s · 1 | medium | P3-7 |
| B43 | 30230–31308 | satchel + handbill | satchel spill → WANTED nailed up (*L15 street dust*) | satchel, then WANTED (sequential) | signature · t · 2 | medium | existing |
| B44 | 31308–32180 | writing head | NibTitle writes the h2 (already in character; not a `title` beat); right page draws its landscape; `rd-bone` | NibTitle | signature · t · 2 | medium | existing |
| B45 | 32180–33080 | writing entries | **riderless-horse fly-through (Act III)**: an 8-frame graphite gallop (traced from Muybridge, 1878, public domain; the jockey omitted) along the journal's bottom edge only, ≤ 1.2 s, on scroll-idle; *vignettes also swap as entries cross the reading line* | horse fly-through | fly-through · t · 2 | medium | P3-7 |
| B46 | 33080–33961 | writing foot → voices | dusk recede; the camp plate fades up out of the journal's dusk | camp fade-up | signature · s · 1 | medium | existing |
| B47 | 33961–35354 | voices | *camp drift toward the fire (L03, 1 → 1.04; no letterbox, no subtitle)*; night veil; **the lead quote read into firelight**; *fireflies*; `rd-fire` | the quote into firelight | signature · s · 2 | slow | P3-5, existing |
| B48–49 | 35354–35800 | act-4 p 0–.45 | hook: the **RDR2 film burn OUT** already eating in from the camp's fire mark at p 0 (no freeze hold); embers rise (2D canvas); meet at .22 (lake line = high table; wagon wheel → ring → snitch, which ends **at rest**); **HP ink bleed IN** (.22–.45); **impact** (Lumos bloom) at .45 | film burn → ink → impact | transition · s · 3 | slow | P3-6 |
| B50–51 | 35849–36344 | act-4 p .50–1 | **push through the title #3**: SEQ-HALL into the Great Hall, "The Light" opening as text-as-mask from p .68 → full-bleed; Act IV logline static in the lower bar; *candle motes* | push through the title | push-title · s · 3 | slow | P3-5, P3-7 |
| B52 ⟂ | 36344–37244 | card release → principles | the map sheet unfolds from the centre (demoted: breath) | map unfold | signature · t · 1 | medium | existing |
| B53 | 37244–38130 | principles rooms 1–2 | h2 **inked with a nib** (IM Fell SC; Act IV's one animated h2); *footprints walk, YOU banner*; wand cursor active | h2 in character | title · t · 1 | medium | P3-7, P3-8 |
| B54 | 38130–38980 | rooms 3–4 | ribbons converge under each title; *footprints* | ribbons converge | signature · s · 2 | medium | existing |
| B55 | 38980–39571 | room 5 | **scroll-scrubbed sentence (Act IV)**; `hp-map` hint on the banner | scrubbed sentence | scrub-sentence · s · 1 | medium | P3-7, P3-8 |
| B56 | 39571–40471 | contact | h2 lines ink in → bracket closes [A · flame · S]; *MV-08 → MV-09 loop*; candle toy (armed dark only on the first pointer move inside `#contact`; never self-lights) | bracket close | signature · t · 2 | medium | existing + P3-8 |
| B57 | 40471–41380 | credits | the roll over the last shot (stage backdrop: MV-08 still → MV-09 loop, push 1 → 1.06); *candle motes*; **the Snitch darts once** (IC-HP-12's existing dart; the §2.1 exception) | Snitch dart | signature · t · 2 | slow | P3-2, existing egg |
| B58 | 41380–41520 (+ the 60vh tail) | end + post-credits tail | "Mischief managed" ink fold → **post-credits scene** (riderless broom; the 12/12 extended cut) | post-credits scene | post-credits · t · 3 | slow | P3-8 |

At 1024×768 every range scales by roughly 0.9 (cards scale with vh; reading sections reflow taller). The **P3-2 beat probe** (§3.4) is the authority for both widths. The time stars (every `t` row) run through the spotlight (§3.8); where a row lists two stars they are sequential by construction or by the spotlight.

### 2.4 How each of today's dead stretches is filled

| today (1440 scrollY) | fill (beat rows) |
|---|---|
| **D1** 1650–3750 (2.33vh), program tail → About → journey head | The opening card now pins (B03, B04–05) and exits full-bleed into the **persistent stage**. The program and About read over it as `backdrop` (B06–B08). The pillars carry the scrubbed sentence; the journey sticky column starts at its h2 with a stage → voyage **match cut** (B09). |
| **D2** 6.6k–6.9k hard cut in the seam | 110vh of travel with Lenis; the GL wave → chalk runs as two halves meeting at the carried line, starting at p 0; no one-frame swap (B13). |
| **D3** ~8k, empty first Work screen | HeadBand's settle starts when its top crosses 90% of the viewport, with no armed-at-0 state on arrival; the h2 is chalked in character (B16). |
| **D4** 9.9k–11.4k trading-algos | Split window arrival (L10) + schematic + scrubbed sentence (B19–B21). |
| **D5** 12.6k–16.2k (worst) | Split window with two cues and rack focus, the physical word, Rancho's circle, the appendix collapsed (≈ −1.4 viewports), and the experiment curve draw (B22–B25). |
| **D6** 17.4k–18.3k systems matrix | The Take-off invite + FIG ink + the drone game (B26–B27). |
| **D7** 19.05k–20.7k kill-list rows → films head | Dead Eye invite + "Killed" strike + house lights down (B28–B30). |
| **D8** 25.5k–25.95k black | The warm point settles on the arriving card's sun; the flash powder at p .03 is the hook, and the latent plate starts as a faint ghost (GL γ curve / DOM cover .6), never black (B35–B37). |
| **D9** 27.75k–29.25k beyond notes | Split window LEFT in the empty column (MV-10 L04), fog lift, scrubbed sentence (B41–B42). |
| **D10** 30.6k–33k writing | Horse gallop; vignettes swap on scroll as well as hover (B45). |
| **D11** 39.15k–40.65k credits | Backdrop stage (the last shot), Snitch, collapsed lists, post-credits scene (B57–B58). |

### 2.5 Where every rationed or placed element goes

| element (cap) | placement |
|---|---|
| **Persistent stage** `backdrop` | act-1 program block, about, credits |
| **Split-screen** `split` | trading-algos (window right), optuna body (right), beyond lower half (left) |
| **Rack focus** (split windows only) | trading-algos, optuna, beyond windows |
| **Push-ins (3)** | #1 toward the Black Pearl (opening, B04–05) · #2 across the ICE hall to the board (seam, B14–15) · #3 into the Great Hall (ignite, B50–51). The camp is a quiet drift. |
| **Push through the title (4, one per card)** | B04–05 · B14–15 · B38 (a code push toward the sun) · B50–51 |
| **Letterbox breathing** | every card exit (bars open through the title mask); films: "house lights down" only (close at the INTERMISSION head over 40vh, open when the Pirates frame centres). No bars at voices. |
| **Match cuts** (both halves on screen within 1 viewport) | flight → hero loop · hero horizon → the iris disc's row · stage MV-05a → JV frame 0 · storm horizon = ICE ledge and compass ring → gear (inside the seam) · Intermission warm point → the tintype plate's sun (B35) · camp lake line = high table and wagon wheel → ring → snitch (inside the ignite) · credits snitch = the same object · post-credits broom = the intro broom |
| **Day-to-night stops** | §7.5 |
| **Impacts (4, one per world)** | B03 iris (.45) · B13 duster slap (.45) · B36–37 flash powder (.03) · B48–49 Lumos bloom (.45) |
| **Scroll-scrubbed sentence (1 per act)** | B08 · B21 · B42 · B55 |
| **Fly-through (≤ 1 per act)** | Act I gull (B12) · Act II none · Act III graphite horse (B45) · Act IV none. The snitch is never a fly-through (O.2: it counts as an egg); the credits dart is an egg; the post-credits broom sits outside the acts. |
| **Text-as-mask (act titles only)** | inside the four push-through-the-title stars |
| **Subtitles** | the four loglines, static in the card lower bars: B04–05 · B14–15 · B38 · B50–51. No reason subtitles. |
| **Titles in character (8; ≤ 2 per world)** | about (B07), work (B16), beyond (B40), principles (B53) + the four films-screen film titles (B31–B34). Every other world h2 keeps its world face with today's quiet MaskReveal. Never the act titles (those are the masks), never the experiment (H4); writing's NibTitle is existing and not counted. |
| **Physical words (≤ 1 per section)** | optuna "noise" (B23), kill-list "Killed" (B29). No others in Phase 3. |
| **Weather (one kind per world, light)** | Pirates **sea-spray flecks** (opening push, about image side) · 3 Idiots **chalk dust in the sunbeam** (seam push, split windows) · RDR2 **fireflies** (voices after the veil falls, ignite p < .1) · HP **candle motes** (ignite push, credits backdrop) |
| **Wand light cursor (HP only)** | act-4 card, principles, contact |

---

## 3. Architecture

### 3.1 Smooth scroll: Lenis + GSAP ScrollTrigger
**Packages:** `lenis ^1.3.26` (MIT, 5.4 KB gz) and `gsap ^3.15.0` (core 28.3 + ScrollTrigger 18.0 KB gz; the standard no-charge licence). **No `@gsap/react`** (its static import would ship GSAP to every device). All are loaded by dynamic `import()` only on DESKTOP_FINE with motion on. Never `ScrollSmoother`: its transformed wrapper breaks the four CSS-sticky surfaces, the fixed header and motion's compositor timelines. Never `lenis/react`'s `ReactLenis`, and never `ScrollTrigger.normalizeScroll()`.

**Files:**
- `lib/smooth-scroll.ts` (store + helpers; no Lenis import at module top).
- `lib/gsap.ts` exports **only** `loadGsap(): Promise<{ gsap, ScrollTrigger }>`; it registers ScrollTrigger and runs `ScrollTrigger.config({ ignoreMobileResize: true })` once, inside the promise. The modules have no side effects at evaluation.
- `lib/use-scroll-scene.ts`: `useScrollScene(ref, build, deps)`. On DESKTOP_FINE with motion on it awaits `loadGsap()`, runs `build` inside `gsap.context(…, ref)`, and cleans up with `ctx.revert()`; it re-runs when motion turns off/on. Components never import GSAP.
- `lib/idle.ts`: `onIdle(fn, { timeout })` = `requestIdleCallback` → `scheduler.postTask(fn, { priority:"background" })` → `setTimeout(fn, 1)` (Safari has no rIC). Raw `requestIdleCallback` is banned outside this file (ESLint `no-restricted-globals`).
- `components/providers/smooth-scroll.tsx` (`<SmoothScroll/>`, renders null).
- `lib/flags.ts` gains `motionOffNow()` (non-hook: matchMedia + the pause snapshot), `DESKTOP_WIDE` and `DESKTOP_FINE`.
- **ESLint `no-restricted-imports` (mandatory):** `gsap`, `gsap/*`, `@gsap/react` and `lenis` may be imported only in `lib/gsap.ts` and `components/providers/smooth-scroll.tsx`.

**Wiring (one instance, one clock):**
- `new Lenis({ autoRaf:false, lerp:0.1, smoothWheel:true, syncTouch:false, anchors:false, respectReducedMotion:true, virtualScroll:({deltaX,deltaY}) => Math.abs(deltaY) >= Math.abs(deltaX) })`. The `virtualScroll` rule keeps horizontal gestures (history swipe) native.
- `gsap.ticker.add(t => lenis.raf(t*1000))`, `gsap.ticker.lagSmoothing(0)`, `lenis.on("scroll", ScrollTrigger.update)`.
- Lenis scrolls the real window. Sticky, fixed, IntersectionObserver, CSS `view()` timelines, motion's `useScroll` (both paths) and ScrollTrigger need no scroller proxy.

**Warm-up ladder (engineer #4; D3-11).** Nothing heavy starts under the visitor's first wheel after the titles.
- **(a) Prefetch:** during the flight, before warm (or at page idle when there is no intro), `onIdle` → `import()` the lenis, gsap, stage and gl chunks, one per idle slice: fetch and evaluate only; no instance, no context.
- **(b) Ladder:** after `intro:quiet-end`, one step per idle slice, each gated on **scroll-idle** (150 ms without wheel/scroll) or its own 1.5 s timeout, in this order: 1 Lenis → 2 ScrollTrigger creation (every `useScrollScene` build is queued and flushed here, followed by **one** `requestScrollRefresh()`) → 3 StageGate → 4 GL tier + context + compile (§3.3) → 5 world fonts (§5.5).
- **Acceptance:** no LoAF > 50 ms in the 3 s after quiet-end while wheel-scrolling (P3-2).

**When it exists (D3-11):** `enabled = DESKTOP_FINE && !motionOffNow() && pathname === "/" && introSettled(phase) && !quietWindow && !shouldSkip("smooth")`.
- Created as ladder step 1.
- After the import resolves, re-check `motionOffNow()`: the hydration snapshot says motion is on even for RM visitors.
- Mount it inside `MotionProvider` → `ChromeGate` in `app/layout.tsx`, so `/lab` and the 404 never get it and the keyed remount tears it down.
- The intro controller dispatches `intro:quiet` at warm and `intro:quiet-end` after the titles (or on any exit). Lenis, ScrollTrigger refreshes, analytics, lazy loops and world fonts all wait for `quiet-end` (§4).

**RM, Pause, modals:**
- RM or Pause → `destroy()`, remove the ticker callback, `requestScrollRefresh()`. Destroy, never `stop()`, so the only Lenis state under RM is none.
- Lumos/resume mid-session re-creates it (the effect re-runs).
- Do not import `lenis.css`. Add to `globals.css`: **`html.lenis, html.lenis body{height:auto}`** (without it Lenis's ResizeObserver on the `h-full` `<html>` never fires and its scroll limit goes stale), `html.lenis{scroll-behavior:auto}` and `.lenis [data-lenis-prevent]{overscroll-behavior:contain}`.
- **Scroll lock:** `lockScroll(owner)`/`unlockScroll(owner)` (ref-counted) sets `body.style.overflow="hidden"` and `lenis?.stop()/start()`. It replaces the three hand-rolled locks (`header.tsx:289-307`, `command-palette.tsx:293-302`, `marauders-map-dialog.tsx:54-69`). Add `data-lenis-prevent` to the menu sheet (`header.tsx:366`), the palette overlay and list (`command-palette.tsx:353/398`) and the map dialog (`marauders-map-dialog.tsx:98`).

**Anchors and jumps:** `scrollToTarget(target, { block, focus, history, immediate, cut })` in `lib/smooth-scroll.ts`.
- Without Lenis or under RM: `scrollIntoView({ behavior: motionOffNow() ? "instant" : "smooth", block })`. This fixes the palette's Pause bug (`command-palette.tsx:146-158`).
- With Lenis: `lenis.scrollTo(el, { force:true, immediate })`. Lenis subtracts `scroll-margin-top` and `scroll-padding-top` (92 px, or the letterbox value in §7.4). For `block:"center"`, pass a computed number.
- **Act anchors land at `landAt`** (§7.1): `#act-n` resolves to the card's top + `landAt × travel`, so a chapter tile or a films "Seen here in Act n" link lands on the new world fully shown, never on a dark p 0.
- **Long jumps (> 3 viewports) never glide.** They are `immediate`, wrapped in the **cut** (§11.3). An immediate jump also sets every card's damped p to its raw value (no catch-up animation after a cut).
- On completion, focus the target's heading, or give the target `tabindex=-1` and focus it (`preventScroll`).
- History: `pushState` for link clicks, `replaceState` for programmatic jumps.
- One delegated **window bubble-phase click handler** takes same-page `#` links that are not `defaultPrevented`, with no modifier and button 0, and calls `scrollToTarget(…, { history:"push", focus:true, immediate: e.detail===0 })`. This keeps the Time-Turner spin, journey waypoints and map-dialog close-then-scroll intact.
- Move to `scrollToTarget`: palette `go()`, `hp-ink.tsx:196-209`, `journey-voyage.tsx:261-270`, `ledger-reckoning.tsx:251`, and `egg-host.tsx:160/185/270`, which now awaits completion instead of the fixed 900 ms.
- `keydown` (capture) → if Lenis is gliding, `lenis.scrollTo(lenis.actualScroll, { immediate:true, force:true })` (`reset()` is private in Lenis 1.3), so keyboard, focus and find-in-page scrolls are never overridden.
- A MutationObserver on `html.intro-armed` → the same call, so the replay's `scrollTo(0)` wins.

**Refresh strategy:** `requestScrollRefresh()` runs a 200 ms debounced **`lenis?.resize()` then `ScrollTrigger.refresh()`**, deferred while Lenis is gliding, followed by `ScrollTrigger.sort()`. It is triggered by:
- a `ResizeObserver` on `<main>` (the Journey Stack → Voyage swap, collapses, late media);
- `document.fonts` `loadingdone`;
- `intro:quiet-end` (once, at the end of ladder step 2);
- the stage mounting.

Each Suspense section hydrates separately, so every ScrollTrigger gets `refreshPriority` from manifest order. After the first refresh, re-apply `location.hash` once.

**Which driver for which motion (the 1-frame rule):**
- Anything whose transform must track content that is itself scrolling (depth parallax in flow, in-flow camera, scrubbed sentences) uses **motion's accelerated path** first (`useScroll` + array `useTransform` onto opacity/clipPath/transform), else `useScrollScene` with ScrollTrigger **`scrub:true`** (0-frame lag inside Lenis's emit). In-flow motion is never damped.
- Anything inside a sticky or fixed layer (pinned cards, the stage, split windows, campSticky) may keep motion `useScroll` (JS path); a 1-frame lag is invisible there.
- The card driver stays motion `useScroll` for **p_raw** (one system measures card layout); the card draws with the **damped p** (§7.1): IDEAS §0 #1's "scrub smoothing", applied inside the pin only.
- GSAP is used only where a timeline is needed (multi-step scrubbed scenes, Dead Eye's time scale), always through `useScrollScene`.

**Words, hotspots and desktop-only buttons are server markup** (engineer #5): the in-character title, scrub sentence, physical word, StageWindow poster, egg hotspots, director's-cut button and the stop pill's host are rendered by server components with `data-*` attributes (`data-words="title|scrub|physical"`, `data-world`, `data-egg-hotspot`, `data-dc`). **One lazy desktop "enhancer" chunk** (`components/enhance/desktop-enhancer.ts`, loaded as ladder step 2 on DESKTOP_FINE) binds them by selector. A click on a `[data-enhance-queue]` element before the enhancer binds is recorded by the pre-paint boot script (§3.2) in `window.__enhanceQ` and replayed. The chapter select loads with the menu, on open.

**Also in P3-2:**
- `tools/capture/motion.js` waits on `window.__lenis?.isScrolling === false` instead of its 80 ms pause, and gains a `?skip=smooth` A/B run.
- `tools/capture/screencast.mjs --profile=reader|skimmer` (new; §13 P3-11): Lenis-on wheel screencasts. **reader** ≈ 250 px/s with a 2 s pause at each h2; **skimmer** = trackpad flings ≈ 2,500 px/s (pixel-mode wheel deltas with an inertial tail).
- Optional: the header settle probe (`header.tsx:95-114`) listens for Lenis's final scroll emit instead of a 150 ms debounce.

**Phones:** never created; the GSAP, Lenis, enhancer, stage and GL chunks are never requested. **Acceptance:** gsap and lenis are absent from the `/` first-load chunks (build manifest check).

### 3.2 The persistent stage (desktop only)
**Mount:** `app/page.tsx` renders `<StageGate/>`, `<LetterboxBars/>` and **`<StageLayers/>`** before `<main>`. `<main>` and the credits `<footer>` get `relative z-[var(--z-main)]`.
- The stage is `fixed inset-0 z-[var(--z-stage)] pointer-events-none aria-hidden`.
- `StageGate` = `dynamic(() => import("@/components/stage/stage"), { ssr:false })`. It mounts only on DESKTOP_FINE, with motion on, no Save-Data, as ladder step 3.
- It renders nothing on the server, so the hero poster stays LCP. Phones never load it.
- **`<StageLayers/>`** is the portal root for every viewport-fixed Phase-3 layer: the cut overlay, the director's-cut stop pill, the Dead Eye HUD, any fixed drone HUD, and toasts. Nothing fixed is rendered inside `<main>` (it could never rise above the bars or the header). Layers that belong *under* text (the wand bloom, the Dead Eye grade, weather in split windows) stay inside their section.

**z-scale (in `globals.css`, one place):** `--z-stage:0` · `--z-main:1` (main, footer) · `--z-sticky:10` · `--z-bars:20` (letterbox bars) · `--z-game-hud:25` · `--z-stop:30` · `--z-toast:32` · `--z-cut:35` (below the header, so the fast lane never disappears) · `--z-header:40` · `--z-menu:60` · `--z-intro:80` · `--z-skip:90`. The existing `--z-content/--z-sticky/--z-header/--z-menu/--z-intro/--z-skip` keep their values.

**Pre-paint boot script (engineer #6):** `components/site/boot-head-script.tsx`, an inline `<script>` of < 400 B rendered in `<head>` on **every** request (today `IntroHeadScript` ships only when the intro is on, `layout.tsx:121`; it keeps its own job). It:
- adds `html.js`;
- reads the Pause key that `lib/flags.ts` persists in sessionStorage (try/catch) and sets `html[data-motion-boot="paused"]`, which never changes mid-session;
- installs the `[data-enhance-queue]` click recorder (§3.1).

**Layout gates:** every layout difference (card travel, split grids, the post-credits tail) is keyed only on the **boot gate** (`html.js:not([data-motion-boot="paused"])` inside `@media DESKTOP_FINE and (prefers-reduced-motion:no-preference)`), so: no-JS gets today's page (no pins, no split, no tail); a view that starts paused never reserves travel and never reflows after hydration; **a mid-session Pause never changes layout** (cards rest static at their travel, split windows show their SSR poster, the tail stays). `data-motion` and `data-stage` only flip transparency and backgrounds. Collapses (§11.5) are keyed on width only: they are content structure, not motion, and native without JS.

**Liveness contract:** once the first cue's poster has decoded, the stage sets `html[data-stage="live"]`. Every `backdrop` transparency rule is keyed on `html[data-stage="live"]:not([data-motion="paused"])` inside the boot gate. Until then, and whenever it is off, every section renders **opaque, exactly as today**, so there is never a blank transparent section.

**Data (`lib/stage.ts`, pure, validator-importable):**
```ts
type StageCue = { at?: string /* child anchor id; default: section top */; media: MediaId; loop?: MediaId;
                  camera?: "drift" | "push" | "pan-l" | "pan-r" | "hold"; depth?: boolean; grade?: SkyKey; weather?: WeatherKind };
type Scrim = { text: number /* ≥ .86 */; image: number /* ≥ .45 */; imageZone: "right" | "left" | "gutters" };
type StageSpec = { mode: "backdrop" | "split" | "own" | "opaque"; side?: "left" | "right"; scrim?: Scrim; cues?: StageCue[] };
```
Manifest entries (`lib/page.ts`) gain `stage?: StageSpec`, `beats` and `tempo`. `stageCues(pageItems)` and `stageAt(y, cues) → { a, b, mix, local }` are pure functions.

**Driver:**
- One page-scroll value (motion `useScroll()`; it works with or without Lenis).
- Cue positions are measured once and on `ResizeObserver(document.body)`. There are no layout reads per frame.
- `mix` drives slot B's opacity; `local` drives the camera (transform only).
- Two slots, A and B; `will-change` only on them.
- In `own`, `opaque` or card cues the stage sets `visibility:hidden` (a discrete state).

**Modes:**
- **`backdrop`:** the section is `bg-transparent` plus one static scrim layer built from its `Scrim`:
  - `imageZone:"right"` (text on the left): `linear-gradient(to right, color-mix(in oklab, var(--bg) 86%, transparent) 0 58%, color-mix(in oklab, var(--bg) 45%, transparent) 72% 100%)`. The text column's right edge must stay at or left of the 58% stop at 1440 and 1024.
  - `imageZone:"gutters"`: a uniform `.86` over the content box; the plate shows at `.45` only in the outer gutters outside the container.
  - **About is `gutters`** (its pillars, muted text and the right-aligned caption live in the right `lg:col-span-7`, `about.tsx:24-45`, `about-pillars.tsx:152`). The act-1 program block and the credits start as `gutters` and may become `right`/`left` only after P3-2 measures their text boxes.
  - Text AA: muted `#9db0bd` needs ≥ .77 against a white plate pixel; at .86 ink ≈ 11.7:1 and muted ≈ 6.3:1. **The AA probe** samples every text box against the brightest plate pixel under it, for every cue (including the L06 loop playing), at 1440 and 1024.
- **`split`:** `lg:grid-cols-[7fr_5fr]` (or `[5fr_7fr]` for a left window) inside the boot gate. The text column keeps `bg-bg`.
  - **The grid is CSS from first paint** under the boot gate. It never waits for the stage, so a late mount causes no CLS.
  - **The text column is a named container `split`** (`container: split / inline-size`). Research grids inside it (`chapter-section.tsx:108` claim/problem, `:164` approach + metric tiles, and the Option Alpha block) carry a `split-stack` class: `@container split (width < 48rem) { .split-stack { grid-template-columns: 1fr } }`. At 1024 (≈ 560 px column) they stack; at 1440 (≈ 790 px) they keep two columns. Outside a split the container does not exist, so phones, tablets and RM keep today's `lg:` layout byte-for-byte.
  - The window column is `<StageWindow>` (server markup): `self-start sticky top-[var(--header-h)] h-[calc(100svh-var(--header-h))]`. It registers its rect on resize only.
  - It SSR-renders a lazy `next/image` of cue 1 with the same focal fit. When `data-stage="live"` it turns transparent and the stage shows the same pixels, so the column is never empty; under a mid-session Pause the poster simply stays.
  - Under RM (at boot) and on phones the section keeps today's single-column layout.
  - The stage centres the cue's `focal` in that rect by translating the slot (transform).
  - **Rack focus** here only: the 384 px `next/image` rung, stretched, is crossfaded with the sharp slot by opacity (soft while the reading line is inside a text block, sharp for 30vh between blocks). Never animate `filter: blur`.
  - **Checks:** no horizontal overflow at 1024 (`scrollWidth ≤ clientWidth` on every split section); heights re-probed before §2.2 is trusted.

**Validator rules:**
- Research types (`chapter`, `ledger`, `experiment`, `matrix`) may be `split`, never `backdrop`.
- `paper`/`raised` tones are never `backdrop`.
- `experiment` is `opaque` (H4).
- Every `backdrop` has a `Scrim` with `text ≥ .86`.
- Every cue's media resolves and is a film asset.

**Cue plan:**

| section | mode | cues (media · loop · camera · extras) |
|---|---|---|
| act-1 program block | backdrop, scrim `gutters` | the opening card's **exit frame** (variant-aware: `seq-pearl-end` still for DEFAULT, iconic-pearl at the ALT push's end scale) · drift · depth · spray |
| about | backdrop, scrim `gutters` | cue 1 = same as above (continuous) · cue 2 at `#about-pillars` = MV-05a · L06 · drift toward the lights (≥ 40vh crossfade, ends before the journey h2) |
| trading-algos | split right | iconic-corridor · L10 · pan-l · chalk dust |
| optuna-screener (body only; the head keeps MachineBoard) | split right | cue 1 at the approach = iconic-ice · L08 · push 1 → 1.05 · cue 2 at the metrics block = iconic-corridor-alt (still) · drift · depth |
| beyond (Activities → Creative) | split left | MV-10 · L04 · push toward the sun, grade golden → dusk |
| credits | backdrop, scrim `gutters` | MV-08 · MV-09 · push 1 → 1.06 · candle motes |
| hero, journey, work, systems, films, voices, contact | own | — (they own their plates and decoder) |
| experiment, kill-list, writing, principles | opaque | — |
| act cards | card | the stage swaps its slots **under the opaque card**, invisibly |

**Card → stage hand-off:** at a card's exit the frame shows a **still**: the push's last frame, with the video released. The stage's first cue is that same still at the same transform. After the card has scrolled away, the stage fades its loop in (poster → video, 600 ms).

**One decoder (media-loops §1.4):**
- A single `StageVideo` owner holds the DecoderLock at **priority 1** and reuses **one `<video>` element** (set `video.src` directly, wait for `requestVideoFrameCallback`, then fade from the poster). The encode comes from `pickCodec()` (§6.3).
- Only the active slot plays, and only when `mix ≤ .02` or `≥ .98`. During a crossfade both slots show posters, so **0 decoders run during any transition**.
- **Every crossfade between two video hosts** (own sections, films screens, the intro) shows the outgoing video as a still (its current frame drawn or its poster) before the incoming one plays. On Play, L05 pauses and releases its decoder, and the crossfade is L05-still → IN-02.
- `own` sections claim the decoder themselves at priority 0; the stage's cue ends one viewport earlier and releases.
- A card's frame loop may take **priority 2** only while the card is its screen's star.
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
- **The probe canvas is the page canvas:** the tier probe creates the one real context on the page's GL canvas and keeps it; there is never a second, throwaway context.

**Timing (engineer #11):**
- Context creation, SDF generation and each program compile run as separate `onIdle` slices (ladder step 4), once the card is ≤ 2 viewports away; **poll `COMPLETION_STATUS_KHR` (`KHR_parallel_shader_compile`) before reading `LINK_STATUS`**; never during a transition.
- **A host switches tier only at p ≤ 0 or p ≥ 1.** If GL becomes ready while 0 < p < 1, the card finishes on the css tier and the GL frame takes over at the next end. There is never a CSS → GL cross-fade mid-transition.
- Acceptance: no tier switch while 0 < p < 1; no LoAF > 50 ms at context creation or compile.

**Behaviour:**
- **One context, one canvas**, re-parented between hosts (the four card frames; hosts are ≥ 1 viewport apart). The nearest-to-centre live host wins.
- **Images:** `getImageProps({ src, width, quality:75 })` → `fetch` → `createImageBitmap` (off the main thread) → `texImage2D` in `onIdle` slices, one texture per slice, once the card is ≤ 1 viewport away. Width = frame CSS width × min(DPR, 1.5): the 1920 rung at 1440, 1440 at 1024.
- **Noise:** a 256² texture generated in JS (0 bytes over the network).
- **Draw only on p change** (one coalesced rAF, the `IgniteCanvas.schedule` pattern). 0 rAF at rest, offscreen, or on a hidden tab.
- **Budget:** buffer 1922×804 (1.55 MP), LRU of 3 plates, ≤ 25 MB GPU, < 1 ms per frame on an iGPU.
- **Context loss:** `webglcontextlost` → DOM fallback; `restored` → lazy rebuild (tier switch rules apply).
- It never decodes video. If a transition starts over a playing loop, it takes one `texImage2D(video)` frame and releases the decoder.
- **Mount:** `<GlFrame>` sits inside the card frame div (`card-shell.tsx:286-300`), above the plate layers and below the SVG/DOM overlays (BoardFig, Dead Eye marks, the kraken tentacle sprite, ember canvas, captions). After its first draw, at a p end, it fades in (opacity .2 s), and `data-gl="on"` hides `[data-gl-replaced]` DOM layers.
- **Gated on** `glTier()==="gl"` **and** the card's `live` (never before the card has been offscreen once; never under RM).
- **Egg hooks live in GL where GL replaces the plate:** the kraken swell is the `wave` flavour's `uKraken` uniform (§9.1 #6).

**Fallbacks are today's code:**
- tier `css` = today's DOM choreographies (baked-mask transforms, opacity stacks, the 2D canvas) plus the CSS title mask (§8.1).
- tier `off`, RM, no-JS and phones = today's static settled card.
- The layer is purely additive, so the plain-image fallback exists by construction.

**Shader contract (shared header):**
- Samplers: `uFrom, uTo, uNoise, uTitle` (SDF).
- `uP`, `uRes`.
- `uCoverFrom/uCoverTo` (vec4 scale + offset = PlateBox's cover box, including registration and zoom).
- `uRow` (MATCH_ROW), `uCenter, uRadius`, `uShapeFrom/uShapeTo/uMorph` (carried-shape SDF ids).
- `uGradeFrom/uGradeTo` (vec3 gain + EV), `uFlash`, `uKraken` (0 → 1 → 0, `wave` only).

Flavours (each ≤ ~40 GLSL lines): `iris`, `wave`, `chalk`, `duster`, `develop`, `deadeye`, `burn`, `ink`, `lumos`, `title`. Per boundary see §7.

### 3.4 Beats in the manifest + validator
**Types (`lib/beats.ts`, pure):**
```ts
type BeatKind = "transition" | "push-title" | "push-in" | "title" | "scrub-sentence" | "subtitle" | "physical-word"
  | "fly-through" | "impact" | "letterbox" | "match-cut" | "signature" | "toy-invite" | "stage-cue" | "post-credits";
type Beat = { id: string; at: number /* vh from the item top @1440×900 */; span: number /* vh */; kind: BeatKind;
              timing: "scroll" | "time"; star?: true; weight?: 1 | 2 | 3 /* required on stars */;
              push?: "in" | "sun" /* push-title only */; pairWith?: string /* match-cut: the other half's data-beat */;
              needsIdle?: true /* invites, fly-throughs */; world?: WorldId; act?: ActId; feature: `P3-${number}` | "existing" };
type Tempo = "slow" | "medium" | "brisk";
```
- Sections carry `beats` and `tempo` in `lib/page.ts`.
- Cards carry them in `lib/film.ts` `acts[].beats` (at `p × travel`), plus `acts[].tempo`, `acts[].landAt` and `acts[].maskOrigin`.
- Every item carries `estVh: { d: number; t: number }` (1440 and 1024), written by the probe.
- The DOM element that performs each beat carries `data-beat="<id>"` (plus `data-beat-star` and `data-beat-weight` for stars).

**Validator (`scripts/check-manifest.mjs`), new checks** (numbered within this list; "#5"/"#10" in §5.5 are the existing validator's numbers):
1. **Gaps (WARN; ERROR in P3-11/RELEASE):** page positions from `estVh`. Any gap between consecutive beats (quiet beats count) > **100vh** at either width.
2. **Competing stars (WARN; ERROR under RELEASE):** two stars whose spans overlap. `signature` beats are stars. A **time star occupies its trigger zone ±50vh**. A card's star (a) and star (b) are sequential by construction.
3. **Rations (ERROR):**
   - `impact` ≤ 4 and ≤ 1 per world;
   - `scrub-sentence` ≤ 1 per act;
   - `fly-through` ≤ 1 per act, never the snitch, and never in a sensitive context (IC-3I-08);
   - `push-title` exactly one per act card and only there;
   - push-ins (`push-title` with `push:"in"`, plus any `push-in`) 3–4;
   - `title` ≤ 2 per world (8 in total);
   - `subtitle` only the four loglines;
   - `physical-word` ≤ 1 per section;
   - weather kind ≤ 1 per world;
   - `rack focus` only on `split`.
4. **StageSpec rules** (§3.2).
5. **Card travel:** `film.cardTravel` ≤ 110vh each, sum ≤ 400vh, desktop-fine (boot gate) only, 0 below. Replaces #3/#4.
6. **Honesty lint (ERROR):** while `film.smoothScroll`/`film.gl`/`film.sound` are on, no rendered copy may claim "native scroll", "no WebGL" or "silent/no audio"; **and no unqualified positive claim** either: any rendered string naming Lenis/smooth scroll or WebGL must also carry its scope ("on desktop", "where supported"), because phones, RM, Pause and the css/off tiers get neither (catches `capabilities.tsx:116` and `systems.pencil.body`).
7. **Hunt:** exactly 12 hunt eggs, 3 per world, each with a hint copy key, `keyboard: true`, an `rm` state and `browse: false` (hidden from the palette's empty-query list, §9).
8. **Fonts:** §5.5.
9. **Sound provenance:** every audio file under `public/` has a `docs/build/SOUNDS.md` row (source, licence, edits).
10. **Unsigned copy:** the `Copy` type gains `unsigned?: true`. Any rendered `unsigned` string is a WARN in `npm run check` and an ERROR under `RELEASE=1`; both print the full list (key, text, where it renders).
11. **Star span (ERROR):** every scroll star spans ≥ 300 px at 1440 **and** 1024 (from `estVh`). Time stars are exempt (they are time-held). An existing scroll signature that measures shorter is stretched to 300 px or re-timed as a time star through the spotlight in P3-2.
12. **Pacing (WARN; ERROR under RELEASE):** every star has a weight and every item a tempo; after any weight-3 star, ≥ 1 viewport where no star exceeds weight 1 (a card's (a) → (b) pair counts as one set piece); no two weight-3 stars within 2 viewports outside a card; research types keep stars ≤ 1 except `signature` beats marked `feature:"existing"`.
13. **Carried shapes (probe):** every `match-cut` with `pairWith` has both halves in the viewport together at some scroll position at both widths.
14. **Hooks:** every act card has `landAt` and a star beginning at p ≤ .05 (its hook frame).

**Runtime probe `tools/capture/beats.mjs <baseUrl> --widths=1440,1024 [--write]`:**
- Scrolls `/?skip=intro` with `?skip=smooth`. **Geometry only:** positions are identical with or without Lenis. No motion judgement ever uses `?skip=smooth` (P3-11 uses Lenis-on screencasts).
- Records every `[data-beat]` page-y, star flag and weight, and the spotlight's grant/skip log (`?debug=spotlight`).
- Prints the gaps, the one-star overlaps, the star spans and the pacing breaches; exits non-zero on a gap > 100vh or a star span < 300 px.
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
- A `HUNT` registry: 12 ids → `{ world, registryId, host, name: CopyKey, hint: CopyKey, spell?: string[] }`.
- `useHunt()` = `useSyncExternalStore(subscribe, readLocal, () => null)`. The server and hydration render "–/12"; the count arrives one render later, so there is no hydration mismatch.
- Storage: `localStorage["aryan:hunt:v1"] = {"v":1,"found":{"<id>":<ts>}}`. Every access is in try/catch; unknown ids are dropped; the count is capped at 12. A `storage` event syncs tabs.
- `markFound(id)` is idempotent and dispatches `hunt:found`.

**Rules:**
- **Obliviate never clears the hunt;** a separate palette command "Reset the egg hunt" (with a confirm step) does.
- "Turn off easter eggs" hides the chip and the hint marginals and keeps the count.
- The Snitch's SEEKER row reads the hunt, not sessionStorage.
- Games store bests under `localStorage["aryan:games:v1"]`.
- **The Pause control is never an egg trigger** (§9.1 #2).

**Fixes that land here:**
- `chalk.tsx:189` reads `"eggs-off"` → must be `"eggs:off"`.
- `patronus` → `enabled:false`.
- EggHost ignores typed keys while `html[data-game]` is set.

### 3.7 Shared runtime rules
- **One decoder, one WebGL context, ≤ 1 animating 2D canvas** (D3-12).
- **The quiet window** (intro warm → `intro:quiet-end`): nothing new starts. No Lenis, ScrollTrigger refresh, lazy loop fetch, world-font request, analytics beacon or GL context creation. (Chunk prefetch happens before warm, §3.1.)
- **The warm-up ladder** (§3.1) is the only way heavy work starts after `quiet-end`; every deferred job goes through `onIdle`.
- **Transform/opacity only** for anything that moves every frame. A mask may ride a transform (the seam technique). No animated filter, blur, `mask-position`, `background-color` or `box-shadow`.
- **Hydration:** all new client state appears after mount (the `lib/flags.ts` HYDRATION RULE). SSR markup is identical for every visitor; device differences are CSS (the boot gate, DESKTOP_WIDE/DESKTOP_FINE media queries).
- **Every new piece registers a DEFAULT and an ALT** in `lib/variants.ts`: the M1.5 rule.

### 3.8 The spotlight (`lib/spotlight.ts`; one star at runtime)
Static spans cannot see time-based stars; the spotlight arbitrates them at real scroll speeds. It ships in the desktop enhancer chunk (phones and RM never load it; there, time stars behave as today or are static).
- **Scroll stars own it** while their element's range intersects the middle 60% of the viewport (20%–80%). Ranges come from rects cached on resize (no layout reads per frame).
- **Time stars ask:** `request(id, { weight, needsIdle?, maxWait = 1500 }) → Promise<"play" | "skip">`. It resolves `play` when no other star owns the spotlight; it waits up to 1.5 s; on timeout it resolves `skip` and the element **jumps to its end state without animating** (a title is simply there; an invite is dropped). A granted time star holds the spotlight for its duration (≤ 1.2 s).
- **`needsIdle`** (toy invites, fly-throughs): additionally waits for scroll-idle (velocity < 300 px/s for 600 ms, from Lenis's `velocity` or scrollY deltas). Each fires once per page view; if its host leaves the viewport first, it is dropped.
- **Paths:** fly-throughs travel only through image zones and margins, never across a text column (the gull stays in the voyage window's sky; the horse stays on the journal's bottom edge).
- **Bypass:** egg effects the visitor triggers, toys, and the fast lane's cut never wait.
- **Exceptions:** the Snitch dart (B57) and the post-credits scene request like any time star.
- **Debug:** `?debug=spotlight` logs grants, waits and skips; the beats probe records them.

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
- Before warm, the page prefetches the lenis, gsap, stage and gl chunks in idle slices (§3.1 ladder (a)); the intro fps target (§4.4) must still hold.
- The codec comes from `pickCodec()` (§6.3): the first encode whose `mediaCapabilities.decodingInfo` is `smooth && powerEfficient`, H.264 on a tie; `video.src` is set directly.

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

**Files:** `components/intro/controller.js` (rebuild with `node components/intro/build-controller.mjs`), `app/intro.css`, `components/intro/intro-overlay.tsx`, `components/intro/intro-model.ts` (`t.warm` 1400, `t.handoffMax` 450, `t.hydrateMax` 1200, titles timings, `heroLoop`, `"hero.loop"` in the prepaint variants), `lib/motion.ts` (`intro.warmMs/handoffMaxMs/hydrateMaxMs/titles`), `components/intro/intro-bridge.tsx`, `components/sections/hero/intro-phase.ts`, `components/sections/hero/hero-stage.tsx`, `components/primitives/media-frame.tsx` (the `fade` override; `pickCodec()` + `video.src`), `lib/media.ts` (`pickCodec()`), `app/page.tsx`.

### 4.3 Opening title sequence (≈ 3.2 s; replaces the 2.5 s caption linger, so it adds no time)
**Slot:** the T1 caption slot, bottom-right, inside `#intro-caps`: fixed, z 81, `aria-hidden`, and it outlives the overlay. The controller drives it by WAAPI (opacity + an 8 px translateY), so no React work lands in the hand-off window. It never covers the h1 zone, the crest, the header or the fast lane.

| t after end | card (existing strings only; added as `copy["titles.1..3"]`, `proposed`, `unsigned`) |
|---|---|
| 0–0.26 | the flight caption fades out (sequential, never a same-spot crossfade) |
| 0.3–1.2 | `A RESEARCH JOURNAL IN FOUR ACTS` (`opening.h2`/`intro.title` with `{acts}`) |
| 1.3–2.2 | `AFTER PIRATES OF THE CARIBBEAN • 3 IDIOTS • RED DEAD REDEMPTION 2 • HARRY POTTER` (`creditLead` + `worksInUse`). No "directed by" variant: `credits.ai` reads "Claude (Anthropic), directed and reviewed by Aryan Sharma" and is never shortened. |
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
- **New step `type-name`** (leave `type-display` alone), DESKTOP_WIDE (≥ 64rem) only:
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
  - A client hook adds the world to `html[data-fonts~="X"]` when that world's first section is within `rootMargin:"150% 0px"` (Pirates at mount), after `intro:quiet-end` (on DESKTOP_FINE this is ladder step 5, §3.1; DESKTOP_WIDE touch devices run it through `onIdle`).
  - CSS maps `html[data-fonts~="hp"] { --font-world-hp-live: var(--font-world-hp-head) }`.
  - Chapter select, the fast lane and anchor jumps mark the target world ready and `await document.fonts.load(…)` (≤ 300 ms timeout) before the cut.
  - `requestScrollRefresh()` (Lenis `resize()` + one debounced `ScrollTrigger.refresh()`) runs on `loadingdone`.
- **Below 64rem unchanged:** every new head/body/lead var and every new file is referenced only inside `@media (min-width:64rem)` (DESKTOP_WIDE). Below that, today's four subsets, slot rules and `--font-world-act` stay byte-for-byte, so phones download exactly today's fonts. Desktop never requests the old subsets, because they are not referenced at ≥ 64rem.
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
    | below 64rem (phones, small tablets) | = today's 54,336 B |
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
| iconic-pearl L01 (opening settle, p .45–.50) | settle drift; ALT push-in #1 | ALT 1 → 1.3 about `marks.stern` over p .50–1 |
| SEQ-PEARL end still (act-1 program, about) | drift + depth | 1.04 → 1.0, x +1% |
| MV-05a L06 (about cue 2) | drift toward the harbour lights | 1.0 → 1.03 |
| JV (journey) | the existing scrub; no camera | — |
| MV-05b L19, MV-05d L20 (journey at rest) | none (they swap in at rest only) | — |
| MV-04 L12 (seam OUT) | tilt settle (existing) + push | 1 → 1.04 over p 0–.22 |
| iconic-ice L08 (seam IN) | **push-in #2** toward the boardRect centre | 1 → 1.35 over p .50–1 (continuous into the title mask) |
| iconic-pen-alt L18 (work head) | settle 1.07 → 1 (existing), started at 90% entry | — |
| MV-06 L09 (work board) | none (the gauntlet overlay is registered) | — |
| iconic-corridor L10 (trading window) | pan-l | x +2% → −2% |
| iconic-ice-alt L16 (optuna head) | drift (the boardRect overlay inside) | 1.02 → 1 |
| iconic-ice L08 (optuna cue 1) | push | 1 → 1.05 |
| iconic-corridor-alt (optuna cue 2) | drift + depth | 1.03 → 1 |
| iconic-drone L07 (systems) | drift; still while the drone flies | 1 → 1.02 |
| iconic-pen L17 (kill-list head) | drift | 1 → 1.02 |
| F-* films screens (L14, L22, L21, L13) | push during the screen's passage | 1 → 1.05 |
| MV-10 L04 (tintype star (b), FrontierBand, beyond window) | push toward the sun | tintype 1 → 1.04 over p .50–1; the FrontierBand's existing push starts from the card's end scale, 1.04 → 1.08 |
| iconic-wanted L15 | none (the posterRect carries the HTML WANTED) | — |
| iconic-camp L03 (voices) | quiet drift toward `marks.fire` (.535, .68) (formerly push-in #3) | 1 → 1.04 over the read range |
| iconic-hall L02 (ignite settle) | settle; ALT push-in #3 crane | ALT 1.089 → 1.25 over p .50–1, focal → .45 |
| MV-08/MV-09 (contact; credits) | drift; credits push | 1 → 1.02; 1 → 1.06 |
| IN-01 L05 (play screen) | none (the broom and Play zone are registered) | — |

### 6.2 The push-ins (scroll-scrubbed; each inside its card's star (b), p .50–1)

| # | where | DEFAULT | ALT | frame registration |
|---|---|---|---|---|
| 1 | opening card p .50–1 | **SEQ-PEARL**: kling3_0 pro 5 s, start image iconic-pearl (job 4273a1be), start frame only, "slow steady dolly-in toward the ship" + the locked prefix/suffix without the camera-lock sentence → `tools/media/loop.mjs sequence --frames=72 --width=1280` → 72 webp (≈ 1.3 MB), drawn on a card-frame canvas. Frames map over p .50–1, so the dolly is still moving while "THE CROSSING" opens (p .68–1). | code push on the L01 loop (1 → 1.3 about the stern) | frame 0 = the iconic-pearl still. The loop → sequence swap is a 150 ms freeze-frame settle inside p .45–.50. The end frame is extracted as `seq-pearl-end.webp` for the stage. |
| 2 | seam card p .50–1 | code camera on L08 toward the board (1 → 1.35); FIG. 0 static inside the camera group (it arrived with the chalk-IN) | code "rack from the benches": rack-focus crossfade, then a shorter push (1 → 1.2) | exact (same plate) |
| 3 | ignite card p .50–1 | **SEQ-HALL**: kling3_0 pro 5 s, start image iconic-hall (1ef4355e), "slow steady dolly-in along the tables toward the high table" → 72 webp | code crane-up on L02 (zoom 1.089 at the join → 1.25, focal .45) | frame 0 = iconic-hall at the join zoom; the settled frame must keep the starry ceiling (S17) |

- **Retired:** the camp push (voices) is now a quiet drift (§6.1, D3-3). The tintype's star (b) is a code push toward the sun on L04 (§6.1), not counted as a push-in.
- Sequences load within one viewport, on the card-frame canvas (the 2D canvas slot; no decoder).
- **Decoded-memory budget (engineer #13):** a 1280×720 frame is ≈ 3.7 MB decoded, so 72 frames held decoded ≈ 265 MB per sequence (JV holds all 72 today as decoded `<img>`s, `use-frame-sequence.ts`). New rule for JV, SEQ-PEARL and SEQ-HALL: keep all 72 frames as compressed `Blob`s (≈ 1.3–1.6 MB); keep a decoded `ImageBitmap` window of ±12 frames around the current index (≤ 25 × 3.7 ≈ 92 MB), decoded ahead in the scroll direction by `createImageBitmap` (off the main thread) and `close()`d outside the window; **≤ 1 sequence resident** page-wide (a sequence > 1 viewport away drops its bitmaps and keeps its blobs); **≤ 128 MB decoded in total**. `useFrameSequence` gains this window mode; its `ready` means "every blob fetched and the window around the entry index decoded" (the LD-PC loader still shows real progress).
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
| L01 | iconic-pearl (4273a1be) | opening card settle (+ ALT push); films Pirates ALT | tattered black sails billow slowly and settle; lit stern windows and deck lanterns glow and dim very softly; the moon path shimmers; the pale wake foams and returns; the hull rises and falls a hair | masts, rigging, hull hold; the small flag stays plain and dark, no symbol; sky still. `mastTop`/`ensign` ≤ 2 px | residual K12 | T1 · 14 · S |
| L02 | iconic-hall (1ef4355e) | ignite settle (+ ALT push) | hundreds of floating candles bob very slowly, each out of step, flames flicker softly; faint clouds drift across the starry ceiling and return | long tables, plates, high table, tall window perfectly still; no new light sources; `lineStart` static | residual | T1 · 14 · S |
| L03 | iconic-camp (3c420eac) | voices (camp drift); the ignite OUT still | flames sway, a thin smoke column rises and drifts, a few embers float and fade; the lit tent's glow breathes (≤ 15%); the lake glints | three horses still apart from one slow tail swish; wagon, tents, pot, tripod still; no figures. Flicker ≤ 2 Hz; horses 4 legs / 1 head at 0/25/50/75/100% | residual (never boomerang: smoke) | T1 · 14 · S |
| L04 | MV-10 (32281e86; **upload the 2560×1440 web still**) | tintype star (b), FrontierBand, beyond window | tall grass and oak leaves sway in a warm breeze; the river glints; soft heat haze on the horizon; the riderless horse flicks its tail and mane once | horse 4 legs / 1 head, does not walk; sun disc and the dark left side still (left 45% × y .25–.75) | residual | T1 · 14 · S |
| L05 | IN-01 (3edb46de) | intro play screen (**only after P3-3**; mounts after hydration + idle; on Play L05 pauses and releases its decoder, then a 200 ms crossfade from its still into IN-02 frame 0) | floating candles bob gently, flames flicker softly; a few windows twinkle; low mist drifts over the black lake, which ripples faintly | the broom stays exactly where it is; the Play zone x 9–46% y 28–64% stays dark and still | residual | T1 · 14 · S |
| L06 | MV-05a (6ce86233) | about stage cue 2 (match cut to JV frame 0) | harbour lanterns glow and dim softly, reflections waver; moored masts sway slightly; small ripples lap the piers | quays empty; horizon (y .431) level | residual | T1 · 14 · S |
| L07 | iconic-drone (69cafb24) | systems band | the small quadcopter hovers, bobbing a few px, rotors a soft blur; courtyard leaves stir; sun flecks shift | colonnade and courtyard still; the circuit board shows no glyphs | boomerang OK | T2 · 10.5 · I |
| L08 | iconic-ice (0e7a3d5c) | seam IN + push-in #2; optuna cue 1 | dust motes drift through slanted sunbeams; pergola shadows creep a hair and return | the green board (boardRect x .389–.961, y .091–.41) blank and perfectly still; benches still | residual | T2 · 10.5 · S |
| L09 | MV-06 (4686928b; **upload the web still**) | work board | the dawn beam on the right slowly brightens and eases back; chalk dust floats in the beam | board interior left 60% still; the beam stays right of 65% | residual | T2 · 10.5 · I |
| L10 | iconic-corridor (14f08567; unused today) | trading-algos window | bold pergola shadow stripes creep slowly and return; courtyard trees sway; dust motes hang in the light | granite wall (left ~40%) and columns still | residual | T2 · 10.5 · S |
| L11 | MV-07 (5155788f) | ignite css tier mid still | the ribbon of floating candles bobs very slowly, flames flicker softly; faint stars twinkle | left 40% dark and still; the ribbon keeps its curve (`LINE_D`) | boomerang OK | T2 · 10.5 · I |
| L12 | MV-04 (350f546b) | seam OUT storm; `pc-kraken` host (the swell is `uKraken` on the GL tier) | rain streaks slant; the dark sea heaves; foam blows off the crests; low clouds race; a large swell under the foam rises slowly and sinks back | **no lightning, no flashes**; horizon (y .423) level | residual (never boomerang: rain) | T2 · 10.5 · S |
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
- **One `pickCodec()` in `lib/media`** for the intro, MediaFrame and StageVideo: the first encode whose `mediaCapabilities.decodingInfo` is `smooth && powerEfficient`, H.264 (MP4) on a tie or when unknown. `video.src` is set directly (swapping `<source>` children needs `load()`). VP9 1080p without hardware decode (common on older laptop iGPUs) runs on the CPU, which is exactly the laptop choppiness Aryan reported.
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
- **Not budgeted (0 credits):** the drone's photographed lift is dropped (Appendix B #14); the graphite horse (B45) is traced from a public-domain source.

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

### 7.1 The four cards: two stars each (D3-1, D3-2)
**Structure of every pinned card** (DESKTOP_FINE, boot gate): hook frame at p ≤ .05 → **star (a) the world transition, p 0–.45**, its impact at the end (Act III: at the start, the hook) → settle p .45–.50 (the new world breathes; quiet) → **star (b) the push through the title, p .50–1**: the camera push and the act title as text-as-mask are one continuous move; the letters start opening at p .68 over the still-moving plate and reach full-bleed at p 1, where the stage takes the same frame. The film title in the upper bar is **static and legible from arrival** (no stamp). The lower bar carries the epigraph/TIP during (a) and the act logline (a static line) during (b).

**Damped p (IDEAS §0 #1 "scrub smoothing", inside the pin only):** the card draws with `p += (p_raw − p) · (1 − e^(−λ·dt))`, λ ≈ 8/s, one rAF owner in CardShell that runs only while |p_raw − p| > .002 and **snaps exactly to 0 and 1** at the ends. On a trackpad flick each star still shows for ≥ ~400 ms. An immediate jump (the cut, chapter select, a hash) sets p = p_raw. RM: no damping (the card is static anyway). In-flow motion is never damped (§3.1).

**Star spans (validator #11: ≥ 300 px at both widths):**

| card | travel | star (a) p 0–.45 @1440 / @1024 | star (b) p .50–1 @1440 / @1024 | pinned window @1440 |
|---|---|---|---|---|
| opening | 90vh | 365 / 311 px | 405 / 346 px | 900 → 1710 |
| seam | 110vh | 446 / 380 px | 495 / 422 px | 7359 → 8349 |
| tintype | 90vh | 365 / 311 px | 405 / 346 px | 25835 → 26645 |
| ignite | 110vh | 446 / 380 px | 495 / 422 px | 35354 → 36344 |

**Per card (DEFAULT / ALT). Two halves meet at the carried line/shape.**

| boundary | hook frame (p ≤ .05) | star (a), p 0–.45 | meet | impact | star (b), p .50–1 | landAt | ALT |
|---|---|---|---|---|---|---|---|
| hero → Act I (opening) | the iris **pre-opened** to a 12%-radius spyglass disc (brass SDF rim) on the lit stern, centred on the horizon row the hero left | **Pirates spyglass iris** (`iris`): radius 12% → frame diagonal | the hero horizon → the disc's row (`marks.horizon` .8) | iris reaches full frame, p .45 | push-in #1 (SEQ-PEARL) + "THE CROSSING" mask; Act I logline | .45 | chart-unfold (DOM, existing) |
| I → II (seam) | the breaker already rolling in from the left over the storm still (L12's poster/freeze) | **Pirates wave OUT** (`wave`) p 0–.22: a breaker from the left, displacement near the front, foam = noise → white-teal; then **3I chalk-dust IN** (`chalk`) p .22–.45: foam white turns to chalk speckle, a diagonal noisy edge uncovers the hall (FIG. 0 already on the board); dawn grade ramp 8000 K → 4200 K → 5500 K | p .22: storm horizon = ICE ledge at MATCH_ROW; compass ring (32 ticks) folds into the 12-tooth gauge gear | **duster slap** at the chalk-IN reveal, p .45: a dust puff + 2 px shake | push-in #2 (code camera on L08, 1 → 1.35) + "The Workshop" mask; Act II logline | .45 | wave → **duster** (`duster`: anisotropic streaks along the 110° stroke; the SVG duster rides on top) |
| II → III (tintype) | the latent ghost plate (GL γ curve / DOM cover .6, never black) with the warm point already on its sun mark (carried in B35); the **flash powder fires at p .03** | **RDR2 tintype develop** (`develop`) p .03–.45: exposure curve `pow(luma, γ(p))` with grain, outward from the horizon row (MV-10 `horizon` .33, provisional); sepia → golden hour; bone border settles .38–.45 | the Intermission warm point → the plate's sun mark (before p 0, B35); **no gear → wheel** (§7.3) | **flash powder**, p .03 (the hook) | code push toward the sun on L04 (1 → 1.04) + "THE FRONTIER" mask; Act III logline | .45 | **Dead Eye** (`deadeye`): a red-sepia grade *ramp* (≥ 300 ms equivalent, never a strobe) + a radial chroma split; the four DOM X marks stay |
| III → IV (ignite) | the burn **already eating in** from the camp's `fire` mark at p 0 (no freeze hold); embers rising | **RDR2 film burn OUT** (`burn`) p 0–.22, orange-white rim; the 2D ember canvas keeps rising; then **HP ink bleed IN** (`ink`) p .22–.45: domain-warped fbm from `marks.lineStart` | p .22: camp lake line (`lake` .378, new mark) = high-table top (`tableL/R` .638, new) at MATCH_ROW; wagon wheel (`wheel` .888, .565) → ring → gold sphere + wings = the snitch, which **ends at rest** (never flies off) | **Lumos bloom** as the hall takes the frame, p .45 | push-in #3 (SEQ-HALL) + "The Light" mask; Act IV logline | .45 | burn → **Lumos sweep** (`lumos`: reveal radius around the light on `SWEEP_D`, exposure bloom) |

- **Card exits:** every exit is the `title` flavour (§8.1) inside star (b): SDF knockout over the live push frame → full-bleed, the "bars open".
- **The opening card's pin (engineer #1):** today the opening renders `layout="flow"` (`act-card-section.tsx:471`) with its program inside the same `<section>` (`card-shell.tsx:335`), and `p` is measured over the whole section (`card-shell.tsx:198`), so a `min-height` pin would add no travel and the sticky block would sit under the scrolling program. New structure, SSR'd identically for everyone (§3.7): the card stage sits in its own **pin wrapper** (`data-act-card-pin`), which is the `useScroll` target for p and carries the section's `bg-bg`; the program (`ProgramStage`) becomes a **sibling block after the wrapper**, still inside the section, transparent for its `backdrop`. Under the boot gate the wrapper gets `min-height: calc(100svh + var(--act-card-travel-opening))` and the opening uses the letterbox grid (CSS only). Below DESKTOP_FINE the wrapper is a plain block and the `flow` layout renders pixel-identical to today. Re-probe §2.2 row 2 afterwards.
- **Pin mode (engineer #2):** `pinned = travelOf(kind) > 0 && desktopFine && !pausedAtBoot`. Below DESKTOP_FINE every card keeps today's `long` flag, driver and `eligible` rule (`card-shell.tsx:193`), so the opening and tintype still animate as passage cards at 640–1023 px. Per-kind `--act-card-travel-*` is declared only inside the boot-gate block.
- **tier `css`:** today's DOM choreographies on the new p ranges. The seam and ignite keep their baked-mask transforms; the tintype keeps its 3-plate stack; the opening keeps its inset aperture (starting at the 12% disc), converted to mask-on-transform. The CSS title mask applies.
- **tier `off`:** the static settled card.
- **Intra-world stage crossfades:** opacity over ≥ 40vh (quiet).
- **Films screen → screen:** the existing 24vh ground crossfade; the outgoing loop shows as a still before the incoming one plays (one decoder, §3.2).
- **The kraken** (`pc-kraken`, §9.1 #6) plays on the seam's storm at p ≤ .05 only: `uKraken` in the `wave` flavour on the GL tier, the plate swell on the css tier, plus a DOM tentacle sprite above the canvas on both.

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

### 7.3 Carried shapes: compass ring → gear (seam); wagon wheel → ring → snitch (ignite)
- **Rule:** both halves of a carried shape are on screen within 1 viewport (validator #13). The old "gear → wagon wheel" across the films (≈ 18,000 px apart) is deleted; the tintype carries only the warm point → sun (B35).
- **In GL:** SDFs (ring + angular repetition: 32 ticks / 12 teeth / 12 spokes; sphere + two wing ellipses), part of each transition's composition and never a second star.
- **Fallback:** a static SVG of the incoming shape (`components/stage/carried-shape.tsx`), never animated.
- **ICONS:** the compass is IC-PC-02 (never a ship's wheel); the wagon wheel is already in the camp plate (IC-RD-04); the snitch is our own drawing (IC-HP-12) and it ends at rest.

### 7.4 Letterbox breathing (K3)
- **Global bars:** `components/stage/letterbox-bars.tsx`, one fixed pair at `--z-bars`, `scaleY` 0 → 1 from the viewport edges (compositor), in the scene world's deep.
  - Height `--lb-h`: `max(0px,(100svh − 100vw/2.39)/2)` at ≥ 80rem (**148.7 px @1440×900**); below 80rem `min(max(0px,(100svh − 100vw/2.39)/2), 11svh)` (**84.5 px @1024×768**, a 599 px band instead of 428).
  - Below the header and the fast lane.
  - `useLetterboxScene(ref, { close:[start, end], open:[start, end] })`: close over **40vh** (≥ 300 px at both widths), hold, open over 40vh (quiet).
- **Consumers:**
  - **films only, as "house lights down":** close at the INTERMISSION head (B30), open when the Pirates frame is centred (≈ 1.5 screens later, B31). From there each screen's own 2.39 matte carries the scene; no bars over the films' reading text.
  - **voices: no bars** (D3-3; B47).
  - Card exits "open" their own bars through the title mask (cards keep SPEC §9.3's "the ground is the bars").
  - **Rule for any global-bars → card hand-off:** the global bars take their heights from the card's geometry (`--card-frame-w` at `globals.css:1070`: the card frames a centred window with ≥ 196 px bars at 1440), never the full-bleed 2.39 formula, so the bars never jump.
- **Focus and anchors while bars are live:** `html[data-letterbox]{ scroll-padding-top: max(var(--lb-h), calc(var(--header-h) + 24px)); scroll-padding-bottom: var(--lb-h) }` (Lenis's `scrollTo` reads it), and a `focusin` handler opens the bars when the focused element intersects one (WCAG 2.4.11).
- No subtitles in the global bars. Off for RM/phones (the bars never mount).

### 7.5 Day-to-night arc (`lib/sky.ts`, pure keyframes)

| where | time | grade (K / EV) | plates |
|---|---|---|---|
| hero, act I, about | moonlit night | 9500 K, −1.3 | MV-01, iconic-pearl, SEQ-PEARL, MV-05a–c |
| journey end → seam OUT | pre-dawn squall | 8000 K, −1.6 | MV-05d, MV-04 |
| seam IN → work | **dawn breaks** (over p .22–.45 of the seam) | 4200 → 5500 K, −1.0 → 0 | iconic-ice, MV-06 |
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

| world | moment (every impact lands on "new world revealed") | shake | flash |
|---|---|---|---|
| Pirates | the iris reaches full frame, opening p .45 | 3 px, 280 ms decay | white .16, 120 ms |
| 3 Idiots | the duster slap as the chalk-IN reveals the hall, seam p .45 | 2 px | none (a chalk-dust puff) |
| RDR2 | flash-powder exposure, tintype p .03 (starts the develop; the card's hook) | 2 px | white .18, 120 ms |
| HP | Lumos: the hall takes the frame, ignite p .45 | 0 | exposure bloom +0.35 EV, 180 ms |

**Files:**
- `lib/{stage,sky,impact,beats,spotlight,idle}.ts`;
- `lib/gl/*`, `components/gl/*`;
- `components/stage/{stage-gate,stage,stage-window,stage-layers,letterbox-bars,carried-shape,weather-layer,subtitle}.tsx`;
- `card-shell.tsx` (pin mode, the opening's pin wrapper, damped p, `<GlGate>`, `live`, `landAt`);
- `act-card-section.tsx` (GL specs, beats, the logline line);
- `plate.tsx`;
- the frames `opening-plate.tsx`, `seam.tsx`, `seam-chalk.tsx`, `tintype.tsx`, `tintype-deadeye.tsx`, `ignite.tsx`, `ignite-lumos.tsx` (register to the row; `data-gl-replaced`; overlays stay);
- `lib/media.ts` (marks);
- `lib/film.ts` (`acts[].landAt`, `acts[].tempo`, beats);
- `lib/variants.ts` (register `stage.camera`, `match.shape`, `letterbox.breath`, `title.mask` with DEFAULT + ALT);
- `globals.css` (the z-scale, `--lb-h`, per-kind `--act-card-travel-*` inside the boot gate, `[data-gl="on"] [data-gl-replaced]{visibility:hidden}`);
- `tools/capture/motion.js` (a `?gl=force` run with `--use-angle=swiftshader --enable-unsafe-swiftshader`; the default headless run measures the css tier).

### 7.7 Weather (`components/stage/weather-layer.tsx`)
- ≤ 16 pre-rendered sprites per world (DPR ≤ 2).
- Each sprite is its own small layer animated by an infinite WAAPI transform/opacity keyframe (compositor).
- Confined to the image side, split windows or card frames: **never over a text column or research data**.
- Paused when the host is offscreen or the stage is hidden; cancelled under RM.
- Kinds: Pirates spray flecks (drift + fall), 3I chalk dust (slow rise in the beam), RDR2 fireflies (slow blink ≤ 1 Hz), HP candle motes (rise).

---

## 8. Words (P3-7)

All word primitives are **server markup + `data-*` attributes**, bound by the desktop enhancer (§3.1). Without it (phones, no-JS, RM) the text is simply there.

### 8.1 Act titles as text-as-mask (the four act titles only; inside star (b))
- **DOM:** the card's real `<h2 id>` keeps its text (SR). The visual is `aria-hidden`.
- **GL `title` flavour:**
  1. A per-title SDF texture (the title set in its world face at 512 px cap height, EDT in `lib/gl/sdf-title.ts`, cached; generated in an `onIdle` slice).
  2. Over p .68–1, while the push is still moving, the frame outside the letters fades to the world deep: "the frame collapses into the letters".
  3. The letters, filled with **the live push frame**, scale about `maskOrigin` (a point inside a glyph stroke, measured per title and stored in `lib/film.ts` `acts[].maskOrigin`) until the stroke covers the viewport at p 1.
  4. The frame is full-bleed and the stage shows the same frame.
  - SDF keeps the edge crisp at any scale.
- **css tier:** an SVG knockout overlay (deep rect with the title cut out) zoomed ×1 → ×6 by transform over p .68–1, without `will-change` (let Chrome re-raster), then an opacity crossfade to full-bleed.
- **ALT:** today's rising title in the lower bar + plain bars opening.
- **RM:** the static title card.

### 8.2 Titles arriving in character (L1; 8 hosts, D3-16)
**Primitive:** `components/words/in-character-title.tsx` (server markup around `SectionHead`/`MaskReveal`; the enhancer animates it).
- SSR renders the final text: no-JS readable, identical markup.
- It animates only after the enter-once "armed" state (mounted offscreen), once per page view, as a **time star through the spotlight** (§3.8): on `skip` the title is simply there. RM → static.
- Moving layers are transform/opacity: a mask rides a transform. Nothing animates filter, text-shadow or background.

| world | DEFAULT | ALT | duration |
|---|---|---|---|
| Pirates | **stamped/burned:** the text is revealed by a scorch-edged mask sliding left → right while a pre-rendered scorch blot behind fades .5 → .25; scale 1.04 → 1 | branded: a radial burn-in from the centre | 420 ms |
| 3 Idiots | **chalked:** a baked ragged chalk-edge mask sweeps along the line (≈ stroke-by-stroke), with ≤ 12 dust sprites falling from the baseline | duster-reveal (the inverse wipe) | 600 ms |
| RDR2 | **poster press:** scale 1.02 → 1 with a pre-blurred ink-bleed duplicate fading .6 → 0 | typewriter: per-character opacity steps, 28 ms/char, cap 800 ms (Courier-like carriage click when sound is on) | 360 ms / ≤ 800 ms |
| HP | **ink nib:** a mask sweep along the baseline with a nib sprite riding the edge, and a wet-ink sheen duplicate fading out | ink bleed from the centre (radial mask) | 900 ms |

- **Hosts (8):** the About, Work, Beyond and Principles h2s (the first world h2 of each act) and the four films-screen film titles (the lettered captions). Every other world h2 (journey, trading-algos, optuna, systems, kill-list, voices, contact) keeps its world face with today's quiet `MaskReveal`.
- Kalam heads keep line-height ≥ 1.05, so `MaskReveal` does not clip them.
- Never on act titles, research data, the experiment section, or any `tnum` element.

### 8.3 Scroll-scrubbed sentences (1 per act; L3)
**Primitive:** `components/words/scrub-sentence.tsx`.
- The sentence renders as normal text; words are wrapped in spans server-side.
- On DESKTOP_FINE with motion on, per-word opacity .28 → 1 is scrubbed as the line moves from **92% to 52%** of the viewport (40vh: 360 px @1440, 307 @1024; motion's accelerated opacity map first, else `useScrollScene` `scrub:true`). It completes before the reading line (45–50%), and reverses when scrolling back.
- RM, no-JS and phones: fully visible. No number is ever scrubbed.

| act | string (source) | host |
|---|---|---|
| I | "The work I am proudest of is not a winning strategy — it is the documented graveyard of my own ideas that did not survive testing." (`pillars[1].body`, sentence 2) | About, pillar 02 |
| II | "A documented 'no' protects capital better than another optimistic 'yes'." (`featuredProjects[0].learned`, sentence 2) | trading-algos "learned" |
| III | "Nature, architecture, people — studying composition and the behavior of light and shadow." (`beyond[3].items[0].body`) | beyond, Creative · Photography |
| IV | "Most failures I have seen were failures of attention before they were failures of math." (`principles[4].body`, sentence 2) | principles, room 05 |

### 8.4 Subtitles (L5): the four loglines, static
**Primitive:** `components/stage/subtitle.tsx`.
- Each act logline renders as **one static line** in its card's lower bar, subtitle-styled: Geist 500, 20 px @1440 / 18 @1024, `--fg` on the bar's deep (AA), centred, wrapping to ≤ 2 lines at 1024. It fades in (200 ms) at p .50 and out (200 ms) as the mask opens the bars. It is real text (read once by SR).
- There are **no reason subtitles** and no subtitles in the global bars: the four films reasons stay visible in flow, unchanged.
- **Time-held cues (only if Phase 2 makes a logline multi-cue):** each cue is one clause between existing punctuation, word-wrapped to ≤ 3 lines of ≤ 42 characters, held max(1.5 s, characters ÷ 15 per second) once triggered; cues queue, never crossfade in place; a longer clause shows as the static full sentence under the frame (the RM version).
- RM: the full line renders static in the bar.
- **Honesty:** the loglines render nowhere today and are "[DRAFT by Claude — … Optional]" (`lib/film.ts:497-506`); the AS-IS sign-off (`lib/film.ts:230`) covered only rendered strings. They ship `unsigned: true` (Appendix B; the alternate is no logline line).

| act | line | where |
|---|---|---|
| I | "Where I started, and the course I've been correcting ever since." | opening lower bar, B04–05 |
| II | "What I build, how I try to break it, and what didn't survive." | seam lower bar, B14–15 |
| III | "Life beyond the screen: the miles, the mat, the camera, and the people who have watched me work." | **tintype** lower bar, B38 (moved from voices) |
| IV | "What I believe about doing this work honestly, and where to find me." | ignite lower bar, B50–51 |

- Loglines stay Aryan's drafts to rewrite (Phase 2). Rewording flows through automatically.

### 8.5 Physical words (L2, ≤ 1 per section)
**Primitive:** `components/words/physical-word.tsx`.
- It wraps the **first** matching token in prose (never in a metric, label or caption). One-shot, 600 ms, transform/opacity, a time star through the spotlight; RM static; no effect if the token is absent (Phase 2 may reword).
- optuna-screener: "noise" in the problem paragraph. A pre-rendered grain sprite over the word settles to 0 while the word's letter-spacing jitter is done by per-letter translate (≤ 1 px).
- kill-list: "Killed" in the intro paragraph. An ember strike line draws through it once (`scaleX` 0 → 1 on a 1.5 px bar), then stays as a static strike. The word stays readable.

### 8.6 Honesty copy (lands with P3-2 Lenis and P3-6 WebGL; `proposed`, `unsigned`)
Both strings render at every width, and phones, RM, Pause and the css/off tiers have neither Lenis nor WebGL, so the copy must be true on every device:
- `components/site/capabilities.tsx:116` Meta: `["Smooth scroll on desktop (Lenis)", "Native scroll on phones and with reduced motion", "CSS + SVG first", "WebGL, where supported, only for scene changes"]`.
- `systems.pencil.body`: "The same question, asked of this page: CSS and SVG first; on desktop, one small WebGL layer only where the scenes change."
- ICONS IC-3I-06's "true note: the site uses no WebGL" is superseded by these lines (Appendix A).
- Also grep the FIG "How this page is built" labels, SPEC SM-7 and the credits for "native scroll", "no WebGL" or "silent", and for unqualified claims (validator #6).
- The credits list GSAP and Lenis (and the fonts) under their licences.
- Both strings are intended changes in the 390 run (§13).

---

## 9. Game layer (P3-8)

**Rules for every egg:**
- One *spell* (typed + palette + a lettered hint) and two *finds* per world.
- Each counts once, when the visitor triggers it. Palette triggers count, but **hunt eggs are hidden from the palette's browse list** (the empty query lists every command today, `command-palette.tsx:262-266`): an egg appears only when the query contains its spell word (`solemn`, `lumos`/`nox`, `parley`, `aal`), which is still a keyboard path. The browse list keeps Obliviate, replay intro and eggs on/off; the "Easter eggs" group (Map, Parley, Aal izz well) leaves it.
- **The Pause button is never a trigger** (it pauses instantly and silently; §12.2).
- Hotspot effects the visitor triggers bypass the spotlight (§3.8).
- Effect ≤ 4 s, lazy (≤ 6 KB gz), never over text, leaves nothing behind.
- New on-page hotspots render only on DESKTOP_FINE (server markup shown by the full media query, bound by the enhancer); typed and palette paths work everywhere.
- No cut toy returns (§P), and §P overrules O.3's "the best may be reused as eggs". `rd-fire` is IDEAS E's "a campfire that flares when you hover", not the cut "stoke the fire" toy. Four eggs are not in E (`pc-parley`, in today's registry; the new `3i-pen`, `rd-eagle`, `rd-bone`): flagged in Appendix B #13.
- Quotes stay gated by verification: Q-PC-3 and Q-RD-1 are COMMUNITY-sourced and need their fallbacks.
- ICONS guards stand, with the overrides recorded in Appendix A: IC-RD-02 (no gun, reticle, gunshot, heartbeat or blood on Dead Eye; the grade on the media layer below the text), IC-3I-08 (every guard except the comic-sprite rule, overridden for the drone toy only), IC-PC-03 (the needle never follows the cursor), IC-PC-05 (the tentacle wraps nothing), IC-HP-09 (no light across text: the wand bloom sits below text), IC-HP-12.

### 9.1 The 12 eggs (3 per world; 7 in today's registry, 5 new to it)

| # | hunt id → registry id | world · host | trigger | hint (where) | effect (≤ 4 s) | keyboard | RM | sound |
|---|---|---|---|---|---|---|---|---|
| 1 | `hp-map` → marauders-map | HP · global | typed "I solemnly swear…" / palette query "solemn" | faint IM Fell line "I solemnly swear…" on the Principles Map banner (`principles-map.tsx:277`, aria-hidden) | the Map dialog unfolds with the visitor's footprints; "Mischief managed" closes it | typed / palette; the dialog is fully keyboard | opens flat | parchment unfold + ink scratch; TTS whisper (flagged) |
| 2 | `hp-lumos` → lumos-nox | HP · global (a spell) | typed "lumos"/"nox", or a palette query containing "lumos"/"nox". **The Pause button is never a trigger:** it pauses instantly and silently and never counts | the Pause tooltip "Lumos — resume motion" (a hint only) | Lumos: media light +10% over 300 ms + a wand-tip bloom at the Pause control, then motion resumes. Nox: media −10% over 300 ms, then Pause. | typed / palette | OS RM: toast `toast.lumos.os`, no bloom; still counts | bell swell / snuff (Pause then kills sound); TTS "Lumos" / "Nox" |
| 3 | `hp-snitch` → snitch | HP · credits | catch it | it rests visibly by "↑ Back to the opening" and darts once (credits ≥ 60% in view) | the SEEKER — you row (from the hunt) | its `<button>` | rests, catchable | wing flutter + catch ting |
| 4 | `pc-parley` → parley | Pirates · global | typed "parley" (new) / palette query "parley" | faint Pirata One "parley?" marginal by the brass X at Now (IC-PC-06) | toast with **Q-PC-3**; until it is verified: "Parley granted — the terms are at Contact." The palette still jumps to Contact. | typed / palette | toast only | rope creak + flag snap; TTS "Parley" (generic voice) |
| 5 | `pc-coin` → aztec-coin (new) | Pirates · journey | the medallion (56 px at 1183, 4871 → a ≥ 44 px button) "Hold the coin to the moonlight" | it already turns moonlit at step 3 | a moon-silver mask sweeps the chart's brass layer (not text) for 1.2 s, gold → skeleton → back; adds no event (IC-PC-04) | button | an instant swap to the moonlit art; holds until the next press / Esc | coin ting + hollow wind |
| 6 | `pc-kraken` → hidden-kraken | Pirates · seam storm (act-2 card, p ≤ .05) | a long look: the seam card pinned at p ≤ .05 with the pin still (no scroll) for 2.0 s; or the "HERE BE MONSTERS" button (new Meta) in the seam card's **upper bar**, beside the frame it changes (if the card is past p .05, activating it first scrolls the card to p .02, then plays) | the upper-bar button | the dark mass swells once under the foam: on the GL tier the `wave` flavour's `uKraken` uniform (0 → 1 → 0), on the css tier a masked scale/brightness on the plate; on both, one tentacle tip (a DOM sprite above the canvas; ours, wraps nothing) breaks the foam and sinks, 1.5 s | the upper-bar button | static tip + toast | sub rumble + wave slap |
| 7 | `3i-aal` → aal-izz-well | 3I · optuna-screener | typed "aal izz well" (buffer `aalizzwell`) / palette query "aal" / press-and-hold 600 ms on a chalk heart on the ICE board ledge (`chalk.tsx:277`; our 2-stroke heart, no hand) | the heart itself | the section h2 settles twice (existing, 700 ms) + a Q-3I-1 toast | heart `<button>` (Enter = the hold) / typed / palette | toast only | **two soft heartbeats** (the heartbeat lives here, never in Dead Eye) |
| 8 | `3i-quad` → quadcopter-lift | 3I · work | a gauntlet Run clears a hypothesis through 7/7 gates | the doodle on the board | the doodle lifts 8 px, rotors blurred 400 ms; toast "It flies. Take it up in Systems." | the Run button | counts on settle; no lift | rotor spin-up |
| 9 | `3i-pen` → worthy-pen (new) | 3I · kill-list head | activate the PenInset (`plate-band.tsx:315`) | "Kept for the one who proves worthy." | counts only if every ledger row reached the reading line / was activated, OR Dead Eye was won; otherwise the toast "Kept for the one who proves worthy. Read the whole ledger." Win: Rancho's circle draws round the pen + "Worthy." | inset `<button>` | circle drawn at once | case creak + ting |
| 10 | `rd-eagle` → eagle-eye (new) | RDR2 · beyond | an eye-ring glyph (our IC-RD-09 inner glyph) at the TrailMap start (`rdr2-frontier.tsx:109`) | the glyph | the Beyond **media** greys for 1.5 s; the ShoePrints and the dashed trail brighten in sequence to the tent (IC-RD-07) | glyph `<button>` | trail bright, static | low shimmer + wind |
| 11 | `rd-bone` → fossil-bone (new) | RDR2 · writing | a fossil bone half-buried in the journal landscape's hachures (new graphite strokes in `journal-sketches.ts`, slightly heavier line) | drawn | a pencilled margin note draws on: "another bone for the collector" (proposed; names no character) + a small bone sketch, 1.2 s | a `<button>` **outside** the aria-hidden page, positioned over the bone | note drawn, static | pencil scratch |
| 12 | `rd-fire` → campfire-flare (new; IDEAS E "a campfire that flares when you hover") | RDR2 · voices | hover the fire 0.8 s, or focus/activate the ≥ 44 px hotspot at `useFirePoint` "Warm your hands by the fire" | the hotspot | one flare: brightness 1.2 on a masked fire region of the **plate** + ≤ 16 ember sprites rising 1.2 s (IC-RD-04 cap 24); toast: our own line, or Q-RD-1 once verified (never near the WANTED bill) | hotspot `<button>` | no flare; toast | log shift + crackle burst |

**Demoted, kept, not counted:**
- Obliviate/Accio (utilities);
- the bolt favicon;
- the console line, which gains "12 eggs hide on this page (on a desktop browser)" (`unsigned`);
- "Turn off easter eggs";
- the 404 Map.

`patronus` → `enabled:false`; `owl` stays off; `dead-eye` becomes a toy.

### 9.2 The four toys (one per act)
**1. Act I · spin Jack's compass (simple)**
- **Host:** the About compass (144×207 at 926, 3091 @1440 today).
- Wrap the SVG in `<button aria-label="Spin Jack's compass">`; the SVG stays aria-hidden.
- **Click:** an impulse of +720…1080° (seeded), then `springNeedle` always settles on a **pillar bearing**: the next pillar in reading order after the one it last pointed at, or the pillar focused by keyboard since then.
- **Drag:** pointer capture on the case; the drag **rotates the case** about its centre (direct manipulation). The needle never follows the pointer (IC-PC-03): on release it springs to the next pillar bearing, with a flick carrying 3 s⁻¹ friction. The lid clicks open on each spin.
- **Invite (B08):** one needle twitch on scroll-idle, once, through the spotlight.
- **Keyboard:** Enter/Space spin; ←/→ step to the next pillar bearing.
- **RM:** a press jumps to the next bearing.
- **Sound:** lid click, a ratchet tick per 45° (≤ 12/s), a settle clunk.
- **Implementation:** `components/worlds/pirates/use-compass-spin.ts` (motion values, no re-render per frame). The Journey compass stays passive.

**2. Act II · FLY THE HOMEMADE DRONE (a real game)**
- **Host:** the systems DroneBand (1312×562 @1440, 928×398 @1024).
- **Entry:** a Meta pill "▲ Take off" (lower right of the band); palette "Fly the homemade drone" scrolls there and focuses the pill. It never auto-starts.
- **Invite (B26):** on scroll-idle, the band's drone lifts 8 px once beside the pill (the IC-3I-08 lift microbeat), through the spotlight. There is no fly-through in Act II.
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
  - the band edge stops the drone with no bounce (restitution 0); **no crash, no fall, no fail state**;
  - dt clamped to 1/30 s; rAF only while flying, in view and visible.
- **Controls:**
  - arrows/WASD **only while the play field has focus** (it has instructions via `aria-describedby`; `preventDefault` only there);
  - pointer press-and-drag (spring k 90 s⁻², ζ .9);
  - Esc lands (600 ms back to the mark);
  - the band dropping below 50% visible auto-lands. Wheel and scroll are never captured.
  - Sets `html[data-game]`.
- **Score:** "7/7 gates · 18.4 s"; best time in `aryan:games:v1`. No time limit.
- **Media:**
  - **The only drone (0 cr):** the plate dims to the slate "board" state and the chalk `ChalkQuadcopter` flies as a **pre-rasterized PNG sprite**. Never a live ChalkFilter on a moving element.
  - The photographed lift (an `iconic-drone-empty` inpaint + a cut-out sprite) is dropped from Phase 3 (Appendix B #14).
- **IC-3I-08 guards (D3-13):** no window, no camera feed, no "Give Me Some Sunshine", no crash, fall or fail, no comic sound; never linked to Aryan's drone reel. O.1 overrides only "never a comic flying sprite", and only inside this game.
- **RM:** take-off disabled with the note "Motion is off: here is the flight plan", showing the static labelled course. Pause lands at once.
- **Sound:** rotor hum loop (rate = speed), a chalk tick per gate, a finish chord.
- **Performance:** one sprite (`translate3d` + rotate) on its own layer; gates are static SVG; the plate is never repainted; < 2 ms JS/frame.
- **Files:** `components/games/drone/{drone-game.tsx,course.ts,physics.ts}`, `drone-band.tsx`, `capabilities.tsx`.

**3. Act III (RDR2) · DEAD EYE TARGET GAME on the kill-list (a real game; D3-4)**
- **Entry:** a Meta pill "DEAD EYE" in Rye with our eye-ring glyph (**not a reticle**) in the ledger header's Meta row (`ledger-section.tsx:109`); typed "deadeye" (existing gate: ≥ 50% in view, DESKTOP_FINE); palette. Never auto-runs; IC-RD-02's automatic first-entry one-shot is removed (Appendix A).
- **Invite (B28):** the pill pulses once on scroll-idle, through the spotlight.
- **On start:** `scrollToTarget` centres the killed block (593 px @1440, which fits the 832 px under the header), awaiting completion.
- **Draw** (0.4 s):
  - time → 0.25× (WAAPI, videos, `--time-scale`, **and `gsap.globalTimeline.timeScale`**);
  - the grade is an **opacity overlay on the section's media layer, below the text** (never over DOM text; never transition the 2,122 px section's background: B6);
  - survivors and flagships dim a step to `--fg-muted` at ≥ 4.5:1 on the graded ground, and are never targets.
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
  - one 96 px Lumos bloom sprite following by transform; rAF only while the pointer moves; fades after 1 s still. The bloom layer sits **below the text** (inside the section's media/art layer) and shows only over media and art, never across text (IC-HP-09).
  - This is the page's one light cursor.
- **Host:** contact's `HallField` (39 candles in 621×900 at x 819 @1440).
  - SSR and default: **lit** (today). The toy arms on the **first pointer move inside `#contact`** (DESKTOP_FINE, motion on, and only if `#contact` was fully offscreen before: the Lens rule): the candles snuff dark in a 600 ms sweep away from the wand. When `#contact` leaves the viewport fully, they return to lit.
  - A candle within 56 px of the wand tip lights (a 300 ms crossfade to the lit sprite + `LumosSpark`).
  - All 39 lit → the existing copy-flare on the MV-08 flame + "The hall is lit."
  - They **never light themselves** (idle moments are deferred, O.3; toys never auto-run).
- **Keyboard:** a "Lumos" button in the contact column lights them all (1.6 s sweep).
- **SSR / no-JS / RM / coarse pointer:** every candle lit (today's state).
- **Sound:** a soft ignition "fwip" per candle (pitch-varied, ≤ 10/s); the hall hum swells with the count.
- **Files:** `hall-ceiling.tsx` (a per-candle `lit`), `components/worlds/hp/candle-toy.tsx`, `contact-scene.tsx`.

### 9.3 Header counter "4 / 12 found"
- `components/eggs/hunt-chip.tsx` in the header's right cluster, before Pause. It is server-rendered and shown only under DESKTOP_FINE by the full media query in CSS (never `lg:`), so touch tablets never show a hunt they cannot play.
- A `<button>`, Meta `tnum`, **fixed width reserving "12/12"** (no CLS).
- Name: "Easter-egg hunt: 4 of 12 found. Show hints".
- It ticks once on `hunt:found` (400 ms; none under RM).
- It opens the lazy `hunt-panel.tsx` popover (non-modal; Esc closes; focus returns): 4 worlds × 3 slots (found = name + ✓; unfound = the themed hint), "Reset the egg hunt" (confirm), "Turn off easter eggs".
- Toast: "Egg 5 of 12 · The cursed coin".
- All copy goes in `egg.hunt.*` (`proposed`, `unsigned`).

### 9.4 12/12 reward + post-credits scene
**The 12th find:**
- toast "12 / 12" + Q-HP-2 (via `FilmQuote`);
- the chip turns Snitch gold;
- **THE HUNT credits block** (`components/eggs/hunt-credits.tsx`, after `<SeekerRow/>` in `footer.tsx:200`): 12 rows, each role in its world's face, about the visitor, never facts about Aryan (`proposed`, `unsigned`): "Solemn swearer — you", "Light-bringer — you", "Seeker — you", "Parley negotiator — you", "Moonlight witness — you", "Kraken spotter — you", "Hand on heart — you", "Test pilot — you", "Worthy of the pen — you", "Eagle eye — you", "Bone collector — you", "Warmed by the fire — you";
- a 3-note original chime sting (≤ 2 s, no film theme).

**Post-credits scene** (`components/site/post-credits.tsx`, after `[data-credits-last]`):
- The page ends only 116 px after the last line today, so add a **60vh tail**, under the boot gate only (DESKTOP_FINE): phones, no-JS and paused-at-boot views get neither the tail nor the scene.
- **Trigger:** the tail ≥ 50% in view + 1.0 s dwell; once per session; a time star through the spotlight.
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
  - Lumos bell swell (+ TTS) / Nox snuff (+ TTS), for the typed/palette spells only (the Pause button is silent);
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
- **UI:** `components/audio/sound-toggle.tsx` in the header, between the hunt chip and Pause; server-rendered and shown only under DESKTOP_FINE by the full media query (never `lg:`).
  - A speaker icon (SVG) `<button aria-pressed>`, name "Sound", tooltip "Sound on"/"Sound off" (`proposed`, `unsigned`).
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
- It is server markup (`data-dc`, bound by the enhancer) shown only under DESKTOP_FINE by the full media query (never `lg:`), so a touch tablet never shows a button that cannot work, and there is no CLS.
- Before the enhancer and Lenis are ready, a click is recorded (`[data-enhance-queue]`, §3.1) and replayed.
- Under RM/Pause it is `aria-disabled` with "Motion is paused".

**Behaviour:**
- `components/director/directors-cut.tsx` builds a shot list from the manifest beats.
- It chains `lenis.scrollTo(y, { duration: dist/speed, easing: t=>t })` per segment:

  | segment (tempo, §2.1) | speed |
  |---|---|
  | act cards (slow) | 140 px/s |
  | other slow items (hero, films, voices, credits) | 90 px/s |
  | medium (about, journey, beyond, writing, principles, contact) | 110 px/s |
  | brisk (work → kill-list) | 150 px/s |

- **Dwell by weight:** 1.2 s on weight-3 stars, 0.6 s on weight 2, none on weight 1. A "2×" toggle. (The director's cut is not the pacing judge's capture: P3-11 judges the reader screencast.)
- It stops at the post-credits scene.
- **Sound:** the click is consent. If muted, it unmutes for the duration and restores the previous state on stop. The label says "(sound on)".
- **Stop:** any wheel, touch, key or pointerdown, Esc, Pause, the fast lane, or the stop control. That is a fixed bottom-centre pill "■ Stop · 2× · Act n/4" rendered in `<StageLayers/>` at `--z-stop`, clear of the egg toasts and above the letterbox bars.
- Toys and eggs never auto-play. The Snitch and the post-credits scene play as usual.

### 11.2 DVD chapter select (the menu, DESKTOP_FINE)
- `components/site/chapter-select.tsx` in the menu sheet above today's links, loaded with the menu on open (DESKTOP_FINE).
- 7 tiles:
  1. Prologue / hero (MV-01)
  2. I The Crossing (iconic-pearl)
  3. II The Workshop (iconic-ice)
  4. Intermission (F-3I)
  5. III The Frontier (MV-10)
  6. IV The Light (iconic-hall)
  7. Credits (MV-08)
- **Each tile:** a 16:9 `next/image` 320w (lazy, loaded when the menu opens), the numeral, and the act title in its world face (a lettering slot: add the file to the validator allow-list); the section links listed under it.
- **Behaviour:** a grid of real links; hover = a transform zoom only; no video. Selecting one closes the menu → `scrollToTarget(anchor, { cut:true, focus:true, history:"push" })`; act tiles land at the card's `landAt`, on the new world fully shown.
- Phones keep today's menu.

### 11.3 "Skip to the research" fast lane (always visible)
- **Header (DESKTOP_WIDE):** the existing Work pill (`header.tsx:179-190`) is relabelled **"Skip to the research"** (`proposed`), `href="#work"`, `data-fast-lane`. Below 64rem it stays "Work" (phones unchanged).
- **During the intro** (the header is under the overlay): add a "Skip to the research" link to the overlay's skip row (DESKTOP_WIDE only). The controller treats it as `dismiss()` then the jump.
- **The jump:** `scrollToTarget("#work", { immediate:true, cut:true, focus:true, history:"push" })`.
  - It marks the Idiots world fonts ready first (≤ 300 ms).
  - It stops the director's cut and any game.
  - It never glides through 20 screens.
- **The cut** (`components/director/cut-overlay.tsx`): a fixed deep layer, opacity 0 → 1 (140 ms) → the immediate scroll + `ScrollTrigger.update()` → 1 → 0 (220 ms). RM: an instant jump, no overlay.
- **z-order:** `--z-cut` (35), rendered in `<StageLayers/>`: above the stage, bars, weather, game HUDs, the stop pill and toasts; **below the header (40)**, so the fast lane stays visible through the cut; below modal dialogs the visitor opened. It is never covered by toasts, the stop pill or title cards.

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
     - Option Alpha as **one whole block**, with its honest framing inside. Summary: "Where the discipline started · Automated 0DTE Options Bots · paper-traded on a no-code platform; not a proven edge" (every phrase from `optionAlpha.tag`/`name`/`summary`/`honest`; no numbers; `proposed`, `unsigned`). When the block is closed this is the only framing a reader sees, so it carries CONTENT-RULES' "early, experimental paper-trading on a no-code platform" and never a bare "(paper)".
     - "Tools, pipelines, automation" (supporting list).
     - "Also on GitHub" (earlier repos).
  2. The About philosophy note. Summary: "The philosophy note".
  3. The credits' long provenance/quote lists. The fan-tribute line (H3, byte-for-byte), "To be continued." and "Mischief managed." stay visible.
- **Never split a claim from its caveat.** Never collapse metrics, limitations or research verdicts.
- **Hidden (not collapsed):** the chart-slot placeholders (`chapter-section.tsx:198`) stop rendering until real charts exist (an intended change at every width, including 390: §13).
- **Aryan's calls, untouched:** the Writing drafts and the films chapter length (CONTINUE Phase 2 item 11).

---

## 12. Performance budget + a11y

### 12.1 Budget

| item | budget |
|---|---|
| **Initial route (`/` first load), every device** | JS ≤ **+6 KB gz** vs P3-0 (the boot script, the hunt chip + store, server-markup attributes); render-blocking CSS ≤ **+6 KB gz** (fonts, stage, split, letterbox, collapse, z-scale). Measured, not estimated. **gsap and lenis are absent** from the first-load chunks. |
| **JS added, desktop, lazy** (gz) | Lenis + GSAP core + ScrollTrigger ≈ 52 (no `@gsap/react`); desktop enhancer (words, hotspots, spotlight) ≤ 6; stage + bars + weather + subtitle ≤ 8; GL (support, lock, transition, shaders, SDF) ≤ 8; audio ≤ 10 (after the first unmute); hunt panel ≤ 4; drone ≤ 8 and Dead Eye ≤ 8 on start; director's cut + cut ≤ 4. **Total ≤ 115 KB gz** (plus per-egg chunks ≤ 6 each, loaded on trigger), every piece through the warm-up ladder or on demand. |
| **JS added, phones** | the initial-route delta only (≤ 6 KB gz); nothing lazy loads |
| **Fonts** | preload ≤ 6 KB (DESKTOP_WIDE); ≤ 64 KB per world; ≤ 192 KB for all desktop film faces, loaded per world on approach; below 64rem = today's 54,336 B |
| **Video** | **1 decoder at a time, always** (crossfades between video hosts go through a still); ≤ 2.5 MB of video in flight per screen; the encode from `pickCodec()` (hardware-decodable first, H.264 on a tie); S ≤ 1.6 MB MP4 / ≈ 0.8 MB WebM (sea/rain ≤ 2.5 MB); I ≤ 0.8 / 0.4 MB; ≈ 25–30 MB total, lazy, desktop only; **phones 0 bytes** (unchanged) |
| **Sequences** | JV + SEQ-PEARL + SEQ-HALL ≤ 1.6 MB compressed each, fetched within 1 viewport, desktop only; **decoded ≤ 128 MB total** (±12-frame `ImageBitmap` window, ≤ 1 sequence resident, §6.2) |
| **WebGL** | 1 context (the probe is the page canvas); ≤ 25 MB GPU; draws only on p change; 0 shader compiles during a transition; tier switches only at p ends; tier-gated |
| **2D canvas** | ≤ 1 animating (intro, JV, ignite embers, sequence canvases); DPR ≤ 2 (intro trail ≤ 1.5) |
| **Audio** | 0 bytes until the first unmute; files ≤ 150 KB total |
| **LCP** | mobile lab ≤ 2.5 s with the intro armed (unchanged ±5%); desktop lab ≤ 400 ms (today 256–368 ms; the h1 in preloaded Pirata One) |
| **CLS** | **0**: h1 font swap (metric fallback), hunt-chip reserve, card travel / split grids / the tail keyed on the boot gate only (never on post-hydration state), collapses closed in SSR, `data-stage`/`data-motion` flip transparency only, desktop-only buttons SSR'd and shown by media query; **Pause mid-scroll: 0 layout shift** |
| **INP** | ≤ 200 ms (game input, egg triggers, the cut) |
| **Main thread after the titles** | no LoAF > 50 ms in the 3 s after `intro:quiet-end` while wheel-scrolling; none at GL context creation or compile |
| **Real GPU** (Aryan's laptop Chrome; 1440 and 1024; the target) | wheel-scroll through the whole page: p95 frame ≤ 20 ms, ≤ 2% of frames > 33 ms, **no frame > 50 ms** inside card transitions, push-ins, the intro hold → titles and the cut; idle 60 fps with a loop playing; the Media panel shows a **hardware decoder for loops**, not only the intro |
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
  - Lenis destroyed; GSAP contexts reverted;
  - loops → posters (0 video requests under RM);
  - GL off; weather cancelled; stage transparency off (sections opaque; layout unchanged);
  - bars never mount; audio suspended;
  - director's cut stopped; games landed/paused;
  - Dead Eye untimed.
  - The waveform Pause remains the WCAG 2.2.2 control. **It pauses instantly and silently and is never an egg or a toy** (no dim, bloom, sound, toast or hunt credit; the Lumos/Nox effects belong to the typed and palette spells only).
- **One h1** (the name), mixed case, legible (blind test). Act titles are real `h2`s; masks and in-character layers are `aria-hidden` duplicates, or the real text with only its opacity animated. The logline line is real text.
- **AA:** backdrop scrims `.86` under text, `.45` only over image zones (the AA probe samples the brightest plate pixel under every text box, every cue, 1440 and 1024); subtitles on deep; world body faces in `--fg` only; Dead Eye's dimmed rows use `--fg-muted` at ≥ 4.5:1 on the graded ground; the validator's #5 table covers every new world × tone.
- **Focus:** every jump focuses its target heading; the fast lane is reachable in the header's tab order and stays above the cut; modals trap and return focus; the hunt panel is non-modal (Esc); while the letterbox bars are live, `scroll-padding` keeps focus and anchors clear of them and a focused element under a bar opens the bars (WCAG 2.4.11).
- **Keyboard path for every toy and egg** (§9); no single-key shortcuts outside a focused game (WCAG 2.1.4); typed words are ignored in fields and while `html[data-game]`.
- **Flash safety** (WCAG 2.3.1): ≤ 3 flashes/s everywhere (loops checked), no saturated-red flash (Dead Eye is a ramp), 4 impacts per page view.
- **Timing:** the Dead Eye core is an essential game timing, with an untimed path under RM; nothing else times out (time-held subtitle cues never hide text: the line is also static under RM and in the DOM).
- **Live regions:** polite, once per event (gates, egg found, game score).
- **No-JS:** today's page, fully readable. Without `html.js` there is no card travel, no split grid and no post-credits tail; collapses are native disclosures.

---

## 13. Acceptance criteria

Each item:
- passes `npm run check`, `npx eslint .` and `npm run build`;
- shows no console errors or hydration warnings at 1440/1024/390;
- keeps the 390 run visually unchanged (`tools/capture/scenes.js … --only=desktop,mobile,rm`) **except the intended 390 changes**: (1) the §8.6 capabilities Meta and `systems.pencil.body` strings; (2) the chart-slot placeholders no longer render (D3-9); (3) the initial-route bytes (≤ +6 KB JS, ≤ +6 KB CSS). Nothing else may differ at 390;
- is committed and pushed.

**New copy:** every new string is `status:"proposed"` plus `unsigned: true` (the `Copy` type gains `unsigned?: true`). Validator #10 warns in `npm run check` and fails under `RELEASE=1`, printing exactly the Phase 3 strings Aryan must sign. Never flip `copySignedOff` for them. The list includes: the §4.3 title cards, the §8.6 honesty copy, the four logline lines (§8.4), the Option Alpha summary (§11.5), the fast-lane label, the hunt/egg/toy microcopy (`egg.hunt.*`, THE HUNT credits rows, the console line), the sound-toggle tooltips, the director's-cut labels and the post-credits copy.

**P3-2 Foundation**
1. `window.__lenis` exists only on DESKTOP_FINE with motion on after `intro:quiet-end`. It is absent at 390, at 1024×1366 touch, under OS RM, after Pause (destroyed within 100 ms; the page stays scrollable), with `?skip=smooth`, and on `/lab` and the 404. `html.lenis` has `height:auto`; the post-credits tail is reachable by wheel after collapses toggle and fonts swap.
2. Every anchor path works under Lenis with the correct offset and focus move: skip link, logo, fast lane, menu, palette (also under Pause: instant), Time-Turner (spin first), journey waypoints (centred), map rooms, hero CTA, chapter tiles and films "Seen here in Act n" links (landing at `landAt`), and a hash on load. Keyboard scrolling mid-glide is never overridden.
3. Modals lock the scroll (wheel over the backdrop does not move the page); nested scrollers scroll.
4. The stage mounts only on DESKTOP_FINE with motion on, as ladder step 3. `html[data-stage="live"]` is set. The about, act-1 program and credits backdrops show the plate behind their scrim, and **the AA probe passes for every text box, every cue, at 1440 and 1024**. The trading-algos, optuna and beyond split windows are sticky (`self-start`) and never empty (SSR poster before the stage is live); at 1024 their research grids stack inside the split and **no split section overflows horizontally**. Under RM, with no JS and at 390, every section renders as in P3-0.
5. The decoder log shows ≤ 1 playing video at every sample of a full scroll, **including the intro run (L05 → IN-02) and the films screens**, and 0 during stage crossfades.
6. `beats` (with timing and weight) and `tempo` exist on every manifest item. The validator's checks 1–14 run: gaps and pacing warn, rations/star spans error. `tools/capture/beats.mjs` runs at 1440 and 1024 and writes `estVh`.
7. The raster diet (§12.1) is landed. The headless desktop run (`?skip=smooth`) shows the four worst sections at ≥ 1.5× baseline fps and CLS 0.
8. The honesty copy (§8.6) ships in the same commit as Lenis, and the honesty lint (with the scope rule) passes.
9. **Warm-up:** no LoAF > 50 ms in the 3 s after `quiet-end` while wheel-scrolling (a Lenis-on screencast with the LoAF observer). No raw `requestIdleCallback` outside `lib/idle.ts`.
10. **Bundles:** gsap and lenis are absent from the `/` first-load chunks; the initial route grows ≤ 6 KB gz JS and ≤ 6 KB gz CSS; the ESLint import rule passes.
11. **Layout gates:** a reload in a paused session paints the final layout with no reflow after hydration; **Pause mid-scroll causes 0 layout shift**; no-JS at 1440 shows no pinned travel, no split and no tail.
12. **z-scale:** every fixed Phase-3 layer renders through `<StageLayers/>`; the fast lane stays visible over the cut, the bars, the stop pill and the game HUDs.

**P3-3 Intro hand-off + titles**
1. Every target in §4.4 is met in `motion.js --runs=intro` (0 `#intro` repaints in the reveal; no LoAF > 50 ms from warm to titles end; hand-off script < 10 ms; the name on the 2nd reveal frame; the loop playing at reveal t0), with the chunk prefetch running during the flight.
2. The strip shows no still-poster frames between the flight and the live sea.
3. The titles play only on the played path, end on any input or Pause, and hand off to `cap.hero`.
4. Skip/Esc/scroll, RM, `?skip` and repeat visits show no titles and no regression.
5. The intro fast-lane link dismisses and lands on `#work` with focus.
6. The flight uses `pickCodec()`; `video.src` is set directly.

**P3-4 Typography**
1. The h1 renders in Pirata One at DESKTOP_WIDE (mixed case, lh .96), in Geist at 390. It is the only `<h1>`.
2. Blind strangers read "Aryan Sharma" correctly at 1440 and 1024 (3/3).
3. The desktop LCP ≤ 400 ms; mobile LCP unchanged ±5%; CLS 0; the 390 network trace fetches no new font.
4. The world head and body faces apply per §5.2. The research probe finds 0 non-Geist text in `[data-research]`/`.tnum`/tables/figures/the experiment.
5. The font budgets pass in the validator; the glyph-coverage check passes.
6. FONTS.md lists every face, licence and byte count; the credits TYPE row is updated.
7. Before the first scroll only Pirata ASCII+ and the house faces load; other worlds load on approach (ladder step 5).

**P3-5 Every plate moves**
1. The 6 re-seams are registered (`durationS` 8.0). MediaFrame, the intro and StageVideo share `pickCodec()`; the network panel shows the chosen encode, and on a real laptop the Media panel shows a hardware decoder for loops.
2. ≥ 20 of the 25 loops ship, each with a `loop.mjs check` JSON passing §6.4 on both encodes, L2 sweep frames stored, logged in LOG.md and `LEDGER-p3loops.md`, and credits ≤ 350 with a balance ≥ 100 (target ≥ 156).
3. All three push-ins scrub smoothly inside their star (b). Registration: the first frame vs plate SSIM ≥ .95; the ICE push keeps its overlays registered (≤ 2 px drift of the chalk FIG at 1440).
4. Every film plate on screen > 1 s on DESKTOP_FINE with motion on is playing a loop, scrubbing, or under a camera move (a headed-Chrome probe of `data-media-state` + transforms). Under RM: posters only, 0 video bytes.
5. Camera and depth ALTs are registered in `lib/variants.ts`.
6. Decoded sequence memory ≤ 128 MB at every sample of a full scroll; ≤ 1 sequence resident.

**P3-6 World transitions**
1. All four cards pin with the D3-1 travel under the boot gate only. 390, **844×390** and **1024×1366** are unchanged (the opening and tintype still animate as passage cards at 640–1023 px). The opening's pin wrapper gives it real travel (p spans the wrapper, not the program).
2. Every card runs exactly two stars (§7.1): each scroll star spans ≥ 300 px at 1440 and 1024; the damped p shows each star ≥ 400 ms on a skimmer fling; immediate jumps skip the damping.
3. **Hooks:** each card's p .05 frame is a picture (judged 3/3 in P3-11); act anchors land at `landAt`.
4. The GL tier runs all DEFAULT flavours and the ALTs. `?gl=off` shows the css tier; `?gl=force` in headless renders. Context loss falls back live. **No tier switch while 0 < p < 1; no LoAF > 50 ms at context creation.**
5. The one-GL-context and one-decoder logs hold. No shader compiles during p motion (trace).
6. MATCH_ROW registration: the carried line sits at y 480 ± 6 px @1440 (410 ± 6 @1024) at each meet frame; the carried shapes morph in GL and are static SVG in css; both halves of every carried shape are on screen together.
7. Exactly 4 impacts fire per full scroll (1 per world, each on "new world revealed"); 0 under RM.
8. The letterbox bars close over 40vh at the films head and open when the Pirates frame centres; no bars at voices; they sit below the header and fast lane; `--lb-h` is capped at 11svh below 80rem; focus never lands under a bar.
9. The day-to-night grades match `lib/sky.ts` at each card meet.
10. The act-2 "one-frame pop" is gone: no frame-diff > 25% between consecutive samples in the seam strip.
11. The kraken is visible on the GL tier (`uKraken` + the tentacle sprite).

**P3-7 Words**
1. The four act titles exit as masks over the still-moving push (GL SDF crisp at every scale; the css tier works). The h2 text is present for SR.
2. The in-character titles play once per page view on exactly the 8 hosts (§8.2), through the spotlight, never on data or the experiment. RM is static.
3. The four scrubbed sentences are exactly the §8.3 strings, complete before 52% of the viewport, and reversible.
4. The four loglines render as static lines in the card lower bars during star (b); no reason subtitles exist; the films reasons are visible in flow.
5. There are two physical words, each one-shot.
6. Exactly two fly-throughs (Act I gull, Act III graphite horse) fire once each on scroll-idle, only through image zones and margins.
7. The validator's ration counts pass; the spotlight log shows no two stars playing together in the reader and skimmer screencasts (visitor-triggered eggs excepted).

**P3-8 Game layer**
1. Exactly 12 hunt eggs (3 per world) with triggers, hints, keyboard paths and RM states per §9.1. Each counts once; the counter survives a reload (localStorage) and syncs across tabs; server/hydration renders "–/12" with no hydration warning.
2. Obliviate keeps the count; Reset clears it; eggs-off hides the chip and hints.
3. **The Pause button never counts and never dims, blooms, sounds or toasts.** The palette's empty-query list shows no hunt egg; typing a spell word surfaces it.
4. The drone game: 7 labelled gates with verbatim titles; no fail state, no bounce (restitution 0); keyboard only inside the focused field; auto-lands off-screen; Pause lands; best time stored; the chalk sprite is the default.
5. Dead Eye: marks only killed rows, fires once, reveals only the existing reasons and links; Esc restores the ledger exactly; no gunshot or heartbeat; untimed under RM; the grade sits below the text and every row stays AA.
6. The compass spin and the wand candles work by mouse and keyboard. The needle always settles on a pillar bearing. The candles are lit by default, arm dark only on the first pointer move inside `#contact`, and **never light themselves**. The wand bloom never covers text.
7. 12/12 shows the gold chip, THE HUNT credits and the sting.
8. The post-credits scene plays once per session on the 60vh tail (the extended cut at 12/12), DESKTOP_FINE only; RM static; phones have no tail.
9. Bugs B1 (`eggs:off`), B2 (patronus), B3 (the fixed 900 ms), B5 (gsap timeScale), B6 (bg-color transition) and B9 (`data-game`) are fixed.

**P3-9 Sound**
1. Muted on every new visit. The first unmute creates the AudioContext (none before). 0 audio bytes before the first unmute.
2. Beds crossfade by world at the reading line (1.5 s); SFX fire on their events; levels per §3.5.
3. Pause, OS RM and a hidden tab suspend within 100 ms; the toggle is disabled with its note under RM/Pause.
4. The TTS lines are generic voices, logged with credits; SOUNDS.md lists every file; the validator's provenance check passes; files ≤ 150 KB.
5. Nothing sounds like a film score, an actor, a gunshot or the "Aal izz well" tune (a manual listen, recorded in the report).

**P3-10 Director's cut, chapter select, fast lane, analytics, collapse**
1. The director's cut runs top → post-credits at the tempo speeds with dwell by weight, stops on any input, Esc or Pause, restores the mute state, and never plays a toy. It is invisible on DESKTOP_WIDE touch devices.
2. The chapter select (7 tiles, lazy thumbnails) lands with the cut and focus; act tiles land at `landAt`.
3. The fast lane is visible at every scroll position, over bars, games, titles and the cut, during the intro (DESKTOP_WIDE) and during the director's cut. It lands on `#work` focused within 400 ms (the cut) with world fonts ready. It is "Work" at 390.
4. `track()` is a no-op in production without the env flag; no network request to any analytics host appears in the trace.
5. The collapses are closed at ≥ 64rem and expanded at 390 (supported browsers); Option Alpha's closed summary carries its honest framing; the chart slots are gone; ScrollTrigger positions refresh after a toggle.

**P3-11 Critic loop: judge rubric** (up to 3 rounds; each judge is an independent subagent without build context, given captures only)

**Captures:** Lenis-on headed-Chrome screencasts (`tools/capture/screencast.mjs`) at 1440 and 1024 in two human profiles: **reader** (≈ 250 px/s, a 2 s pause at each h2) and **skimmer** (trackpad flings ≈ 2,500 px/s), cut into 1 s clips; plus the beats probe (geometry only) and the static strips. The director's-cut capture is shown only for its own axis; it dwells on stars and flatters the pacing.

| axis | method | pass bar |
|---|---|---|
| **One star per screen** (O.4: exactly ONE) | 1 s clips from **both** profiles at both widths; the judge counts dramatic elements per clip | ≥ 90% of reader clips show exactly one star; a clip with none is allowed only inside a declared breath; **0 clips with two or more stars** (visitor-triggered eggs excepted); every flagged clip fixed or justified |
| **No dead screen** | `tools/capture/beats.mjs` at both widths + the strips | 0 measured gaps > 100vh; every §2.4 stretch shows its fill |
| **Hooks** | the p .05 frame of each card, at both widths | each judged "a hook" 3/3 |
| **"Would you keep scrolling?"** | 3 judges watch the **reader** capture; yes/no + a reason per screen | ≥ 80% "yes" per act, no two consecutive "no" screens, and the hand-off, the four cards and the first Work screen all "yes" |
| **Tempo** | the reader capture against §2.2's tempo column | judges name the slow/brisk passages correctly per act (≥ 2 of 3 judges) |
| **Game discovery** | the reader capture | each judge notices the hunt chip and at least one toy invite within 3 screens of its first appearance |
| **Blind stranger test** | `tools/capture/anon.mjs` + 3 judges + `tools/capture/score.mjs` | world recognizability ≥ the P3-0 score for each world; the hero name read correctly 3/3 at 1440 and 1024; 0 "can't read this" findings on text; the fast lane found within 10 s by 3/3 |
| **Smoothness** | `motion.js` desktop + intro, default vs `?skip=smooth`, plus `?gl=force`; the skimmer capture's frame timings; Aryan's laptop recording if available | §12.1 headless targets and §4.4 met; on real hardware (if available) the §12.1 GPU targets |
| **Honesty + a11y** | `npm run check`, `RELEASE=1 npm run check`, the research-font probe, an RM run (no motion, no sound, 0 video bytes), Pause mid-scroll (0 layout shift, silent), a keyboard-only pass through every toy and egg, the AA probe on scrims and the logline lines | `npm run check` green; **`RELEASE=1` fails only on the §13 unsigned list**; everything else passes |

Each judge scores every axis 1–5. **Ship bar: all axes ≥ 4 and every pass bar met.** Fix the findings, re-capture, re-judge.

**P3-12 Final QA**
- Check, eslint and build are green; all widths (1440, 1024, 390, 320, plus 844×390 and 1024×1366); RM; no-JS; LCP.
- Write `docs/build/PHASE3-REPORT.md`: before/after numbers, credits spent, what Aryan should review (Appendix B), and **the unsigned list printed by `RELEASE=1 npm run check`**.
- No merge to `main` unless Aryan asks.

---

## Appendix A: rules superseded by IDEAS §0/§O/§P (record the override where each rule lives)

| rule | where | new rule |
|---|---|---|
| Native scroll only; "no WebGL" | SPEC §11.1, SM-7, DESIGN, AUTOPILOT, `capabilities.tsx:116`, `systems.pencil.body` | Lenis + ScrollTrigger on desktop (§3.1); one contained WebGL layer where supported (§3.3); copy per §8.6, true on every device |
| IC-3I-06's "true note: the site uses no WebGL (native scroll, CSS and SVG first)" | ICONS IC-3I-06 | the §8.6 lines ("CSS and SVG first; on desktop, one small WebGL layer only where the scenes change") |
| No audio; the intro "Silent. No audio track, no toggle" | SPEC §5.6, DESIGN | sound per §10; still muted by default and silent until the visitor unmutes |
| D-5 / validator #3 / #4: ≤ 2 long cards ≤ 60vh; page sticky ≤ 150vh; `scene` + long ≤ 2 | SPEC §0, §12.5, §9.2 `longCards`, F-7 | `film.cardTravel` (D3-1), ≤ 110vh each, sum ≤ 400vh, desktop-fine only |
| Canvas singleton page-wide | SPEC §10.1 #6 | D3-12 |
| Display face never on the name; the display font budget ≤ 24 KB `optional`, never preloaded | SPEC l.41, l.650, l.833, §14; DESIGN l.35, l.207; FONTS.md l.27; `lib/fonts.ts:6-10` | §5 |
| Dead Eye egg ≤ 3 s, once per session, no sound; world-visit ≤ 3 s; **IC-RD-02's automatic first-entry one-shot** | SPEC §10.3, `components/eggs/dead-eye.ts` header, ICONS IC-RD-02 | the opt-in replayable game (§9.2); nothing runs on first entry. IC-RD-02's other guards stand (no gun, reticle, gunshot, heartbeat or blood; grade on the media layer below the text; text AA untouched) |
| IC-3I-08 "never … a comic flying sprite" | ICONS IC-3I-08 | overridden by O.1 **for the drone toy only** (a chalk sprite in a game the visitor starts). Every other IC-3I-08 guard stands (no window, camera feed, "Give Me Some Sunshine", crash, fall, fail or comic sound; never linked to Aryan's drone reel); no Act II fly-through |
| IC-PC-03 "no cursor-following elsewhere" | ICONS IC-PC-03 | holds: the compass toy's drag rotates the *case* (direct manipulation); the needle only ever springs to pillar bearings |
| IC-HP-09 "On Nox … dims 10% … then motion stops" (on the Pause control); "no light across text" | ICONS IC-HP-09 | the Pause control pauses instantly and silently; the dim/bloom belong to the typed/palette spells only. "No light across text" holds: the wand bloom renders below text, only over media and art |
| The Snitch "no score" | IC-HP-12 | the hunt counter (§0 #4); its existing once-per-session dart is the credits' star (§2.1 exception) |
| "At most one ambient world-light system" | SPEC §10.1 #2 | holds per screen: the stage is hidden under `own` sections; loops never double up (one decoder) |
| Lettering scope allow-list | validator #10 | §5.5 |

## Appendix B: flags for Aryan (non-blocking; the defaults are built)
1. Card travel (D3-1) adds ≈ 2.8 viewports of pinned scenes (400vh vs today's 116vh); the collapses give back ≈ 1.8; the fast lane mitigates.
2. The hero name is fully revealed about 0.7–1.0 s later than today (hold → reveal); the optional flight → loop re-blend removes the still.
3. Title card 2 wording (there is no "directed by" option: `credits.ai` cannot be shortened); whether RM visitors get the static H-1 credit line.
4. TTS callouts, including "I solemnly swear that I am up to no good" (also his Phase 2 item 4).
5. **The unsigned list** (printed by `RELEASE=1 npm run check`, attached to PHASE3-REPORT): the honesty copy (§8.6), the egg, hunt and toy microcopy, the title cards, the Option Alpha summary, the sound and director's-cut labels.
6. **The four loglines on screen** (§8.4): Claude drafts, rendered for the first time. Default: static lines in the card lower bars. Alternate: no logline line.
7. Loop ALTs are code parallax rather than a second generated take; SEQ-PEARL/SEQ-HALL vs the code push.
8. Analytics on Vercel needs his consent at hosting.
9. The legacy ~56 MB of `public/media` is dead weight (prune in Phase 2).
10. The real-laptop Chrome performance recording (optional; it confirms the GPU targets, pre-raster and the hardware decoder).
11. `iconic-corridor` is now used (it answers Phase 2 item 8).
12. **No toy in Act III's own screens.** Default: Dead Eye (RDR2's toy) is hosted on the kill-list in Act II (D3-4). Alternate: add a "DEAD EYE ↑" entry pill in Act III (beyond's Meta row) that jumps to the kill-list and starts the game.
13. **Four eggs not listed in IDEAS E:** `pc-parley` (in today's registry), and the new `3i-pen` (worthy-pen), `rd-eagle` (eagle-eye) and `rd-bone` (fossil-bone). Default: built as §9.1. Alternate: Aryan names a replacement; the hunt stays 3 per world. `rd-fire` is E's "a campfire that flares when you hover", not the cut "stoke the fire" toy (§P: no cut toy returns).
14. **The drone's photographed lift** (an `iconic-drone-empty` inpaint + a cut-out sprite) is dropped from Phase 3; the chalk sprite is the only drone. Alternate: budget it from the reserve after a `get_cost` preflight.
15. **The graphite horse** (B45) is traced from Muybridge's "The Horse in Motion" (1878, public domain), jockey omitted; provenance logged in `lib/media.ts` and LOG.md.
16. **Voices loses its letterbox and subtitle**, and the camp push becomes a drift (D3-3). Alternate: none needed unless he wants the camp push back (then another push must go).

## Appendix C: ownership hints for PHASE3-PLAN (to avoid parallel conflicts)
- **Shared files with a single owner each:**
  - `lib/page.ts` (beats, stage, tempo) → P3-2;
  - `lib/film.ts` (copy, eggs, acts beats, `cardTravel`, `maskOrigin`, `landAt`) → one "copy + registry" owner, who takes requests from the others;
  - `lib/media.ts` (incl. `pickCodec()`) → the media lane;
  - `app/globals.css` → P3-2 (the others append in marked blocks);
  - `scripts/check-manifest.mjs` → P3-2 (the others submit check functions);
  - `lib/spotlight.ts`, `lib/idle.ts`, the desktop enhancer and `<StageLayers/>` → P3-2;
  - `components/site/header.tsx` → P3-10 (it mounts the chip and sound toggle from P3-8/P3-9);
  - `components/intro/*` → P3-3 only;
  - `card-shell.tsx` + frames → P3-6 (P3-5/P3-7 plug in via props and slots).
- **Order:**
  1. P3-2 (Lenis, ladder, boot script, stage, beats, spotlight, raster diet) and P3-3 and P3-4 in parallel;
  2. then P3-5 media (0-credit work first, generation in parallel from day 1), P3-6 and P3-7;
  3. then P3-8, P3-9 and P3-10;
  4. then P3-11 and P3-12.

---

## Review log (2026-09-30: director, engineer and completeness reviews)
All three reviews were applied except where noted. Items that were cut off in the review text were applied only as far as they could be read.
- **Director #1, #3 (impact timing):** applied with one exception: Act III's impact is the hook at p .03 (director #3) rather than at the end of star (a); the flash powder is itself the "new world revealed" moment.
- **Director #5(a):** the camp push is retired, so there are 3 push-ins, numbered #1 Pearl, #2 ICE hall, #3 Great Hall (formerly #4).
- **Director #12 vs completeness #8 (B19):** director wins. The trading-algos h2 no longer chalks; the window arrival (over ≥ 40vh) is B19's single star.
- **Director #6 vs completeness #4 and engineer #10 (films reason as `opacity:0`/`sr-only`):** moot. Reason subtitles are deleted, so the reasons stay visible in flow.
- **Engineer #6 (collapse as a layout gate):** partial. Collapses are keyed on width only: native `<details>` needs no JS, and nothing about Pause or boot state touches them. The split grid, card travel and tail use the boot gate.
- **Engineer #7:** chose the named-container split (D3-17) over splitting only at ≥ 80rem, so 1024 keeps the window.
- **Engineer #10 ("bars only as ≤ 1-screen breaths"):** partial. The films bars hold ≈ 1.5 screens, per director #7. The 11svh cap, `scroll-padding` and `focusin` rules are applied.
- **Engineer #13 (truncated; decoded memory for sequences):** applied from its readable part as the §6.2 windowed-decode budget (≤ 128 MB, ≤ 1 sequence resident).
- **Completeness #6 (drone photographed lift):** chose "drop it" (Appendix B #14) rather than budgeting credits.
- **Completeness #9(c):** chose the explicit exception: the Snitch dart is the credits' star, requested through the spotlight.
- **Completeness #2 ("DIRECTED BY" card):** deleted the option; the full `credits.ai` line is not a title card.
- **Director #15 (truncated after "toy spread and affordance (§9.2)"), completeness #14 (truncated after "Also: D3") and completeness #15–#20 (not received):** not applied beyond what overlapping items cover. Act III's missing toy and the new eggs are Appendix B #12–#13; invite affordance is covered by scroll-idle invites through the spotlight.
