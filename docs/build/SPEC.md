# SPEC — "One Line, Four Lights"
### The Reading Line × three films and a game · binding design spec (v2, 2026-09-28)

> Aryan's site is one film in four acts. Direction 3, "The Reading Line", is the camera: the huge static name, one bracket `[ ]`, one reading line, native scroll. Three films and a game are the light. **Pirates of the Caribbean** lights the crossing, **3 Idiots** lights the workshop, **Red Dead Redemption 2** lights the frontier, and **Harry Potter** lights the ending. Harry Potter also opens the page: a castle across a black lake, floating candles, a riderless broom and a play screen that swears "I solemnly swear that I am up to no good." The broom carries you out over the sea toward the Black Pearl's stern lantern and sets you down in front of the name. One curve, **the Line**, runs through everything. It is drawn in brass at sea, in blueprint in the workshop, in graphite on the trail and in ink that kindles into light at the end. The last line of the page is "Mischief managed."

**Status:** SPEC **v2**. It replaces v1 (kept verbatim at `build/SPEC.v1.md`). Phase 0 (the typed manifest `lib/page.ts` → `lib/sections.ts` → `components/sections/registry.ts` → `SectionFrame`; `lib/media.ts`; `lib/flags.ts`; `npm run check`) is merged at `bcff748` on `design/three-films`, and Phase 1 foundation work has started (`lib/worlds.ts` with an `rdr2` placeholder, DESIGN v2 tokens and motion, SectionFrame v1.5 with `data-world`, the Pause toggle, DecoderLock; `8dc3059`). Nothing else in this spec is built.
**Media status (OBSERVED 2026-09-28 18:45 ET):** accepted: MV-01 (hero sea **with the Black Pearl** and its stern lantern), MV-02, IN-01 (play screen **with the castle, floating candles and a real-looking broom**), IN-01m; in progress: IN-02 (draft route A), MV-03. Balance 1,086.5 → **113.5 spent** of the new 950 cap (MEDIA-PLAN v2 §0; the LEDGER logs runs 1–3 = 43, the rest is Step 2 in flight).
**Spine** (unchanged): concept `concepts/three-acts.md`, with grafts from `concepts/screening-room.md` and `concepts/three-crafts.md`.
**What v2 changes (for critics):**
1. **A fourth world** (A-5): RDR2 owns Act III "The Frontier" (`beyond` · `writing` · `voices`); Harry Potter becomes Act IV "The Light" (`principles` · `contact`). Four acts, four cards, four world changes.
2. **The iconic override** (A-6): the real iconography of all four worlds is allowed and encouraged where it carries a site truth, **recreated by us** (ICONS.md is the catalog). Law 2 and Law 4 are rewritten; §9.4's allow-list becomes naming-and-quoting rules; §10.2 maps every icon to a section and a tier.
3. **Five hard limits** (A-7, §15) are the only remaining "never": no likeness · no ripped files or logo replicas in the public repo · the fan-tribute credits line · research honesty · the a11y/perf contracts.
4. **World display fonts** (A-8, §9.7) for act titles, loaders and easter eggs only.
5. **Easter eggs** become a registered, opt-in layer (§10.3): the Marauder's Map, Lumos/Nox, Dead Eye, the Snitch, and others.
6. The prologue and the hero now match the accepted media: castle, candles and broom on the play screen; the Black Pearl on the horizon of the sea.

**Reads with (in this order):**
1. `personal-website/CLAUDE.md` Part I. It wins on content, and the §2 exclusions are absolute.
2. `build/DESIGN.md` (**DESIGN v3**). It wins on look: tokens, type, motion, icon style.
3. This SPEC. It wins on structure: what goes where, the world system, the data model, **where each icon lands**.
4. `build/ICONS.md` (the icon catalog). It wins on **how an icon is drawn** (recipe, taste guard), and on quote verification status. Where ICONS and this SPEC disagree on placement, this SPEC wins (the resolved differences are listed in §10.2.3).
5. `build/rdr2/STUDY.md` (RDR2 research, recipes R-1…R-6, palette CALC).
6. `build/MEDIA-PLAN.md` (**v2**) and `build/bars/*.BAR.md` (pass/fail gates).
7. Background only: `SYNTHESIS.md` §4/§5/§8/§9, `prep/*`, Kimi Part V/VI, the concept files.

**Labels:** OBSERVED · CREATOR-DOCUMENTED · INFERRED · PROPOSED · CALC (computed with `build/tools/contrast.mjs` and `springs.mjs`) · VERIFIED / COMMUNITY (quote sourcing, ICONS §0). An unlabeled design value is PROPOSED: a starting value to tune by eye in `/lab` frame sequences.

---

## 0. Decisions this spec encodes

| # | Decision | Source | Where it lands |
|---|---|---|---|
| A-1 | Visual direction: D3 "The Reading Line" | Aryan (binding) | §11 lists every D3 element kept |
| A-2 | The films are a primary identity layer, felt strongly and **named openly** | Aryan (binding; overrules Kimi's restraint) | §2, §9.4, §9.5 |
| A-3 | Higgsfield media is approved as needed | Aryan (binding) | MEDIA-PLAN; the totals are now set by A-9 |
| A-4 | Adaptability: a typed manifest drives everything, worlds are data, and transitions derive | Aryan (binding) | §12 |
| **A-5** | **Red Dead Redemption 2 is a fourth world** alongside Harry Potter, Pirates of the Caribbean and 3 Idiots | Aryan (binding, 2026-09-28) | §1–§3, SM-14…SM-16, §9, §12 |
| **A-6** | **Iconic override:** "you can copy what we need — it's a personal website, not commercial use." Real iconography (castle, candles, broom, Marauder's Map, Lumos/Nox, the Pearl, Jack's compass, "Aal izz well", the quadcopter, Arthur's journal, Dead Eye, WANTED, tips, campfire…) is allowed and encouraged, **recreated by us**; titles, names and lines may appear in copy, cards, loaders and credits | Aryan (binding) | Laws 2 and 4, §9.4, §10.2, §10.3, §15; ICONS.md |
| **A-7** | **The five hard limits** (H1 likeness · H2 ripped files and logo replicas in the public repo · H3 the fan-tribute line · H4 research honesty · H5 a11y/perf) are the only remaining "never" | Aryan / Claude (binding) | §15 |
| **A-8** | Film-/game-evoking display fonts for **act titles, loaders and easter eggs only**, self-hosted and licence-checked; never the name, body or research data | Aryan (binding) | §9.7; DESIGN v3 §2.1 |
| **A-9** | Media budget: **program cap 950 credits including what is already spent**; reserve kept ≥ ~200 (the floor is 250) | Workflow directive; Aryan countersigns at G0 (RD-6) | MEDIA-PLAN v2 §0 |
| D-1 | Huge name YES: `display` `clamp(4.5rem,11vw,10.5rem)` | Aryan | §6 |
| D-2 | One primary CTA YES: "View the quant portfolio ↓" → `#work` | Aryan | §6 |
| D-3 | Retire the old "max polish" layer YES; the film layer replaces it with meaning | Aryan | §11.3 |
| D-4 | A warm paper plane for Writing YES (`#ebe0c6` and its proven inks). **v2:** the plane is kept and re-hosted as the RDR2 journal page (RD-1; option B keeps it as HP parchment) | Aryan | SM-11; DESIGN v3 §1.3.2 |
| D-5 | Up to **2** longer cinematic scroll moments (≤ 60vh each, desktop fine pointer only, static elsewhere): Card I→II and Card III→IV | Aryan | SM-5, SM-10 |
| D-6 | The kill-list keeps equal quiet at rest. **v2:** Dead Eye is opt-in only and leaves the ledger as it found it | Aryan | SM-8, §10.3 |
| N1 | Harry Potter play screen + broom flight intro overlay. **v2:** castle, Black Lake, floating candles, a real-looking riderless broom, the oath line | Aryan (binding, mid-design) | §5, `bars/intro.BAR.md` |
| N2 | **Four** themed loaders, used for real loads and as scroll-driven, non-blocking loading-reel interstitials | Aryan (binding, mid-design) | §8, `bars/loaders.BAR.md` |

---

## 1. Thesis and the four laws

**Thesis.** Aryan is a student researcher who kills his own ideas, so the page should read as a journal before it reads as a film. The worlds never replace the reading. They change the light the reading happens in:
- **Navigation** (Pirates) is how he got here.
- **Explanation** (3 Idiots) is how he works.
- **Reflection** (Red Dead Redemption 2) is the life around the work: the miles, the people, the notebook, the voices by the fire.
- **Revelation** (Harry Potter) is what the work taught him, and who it is for.

**The page is one day.** Night sea (I) → first light in the workshop (II) → golden hour, lamplight and campfire (III) → candle night (IV). It opens cool and ends warm, so it literally warms as you read. **One warm point travels the whole page:** the Black Pearl's stern lantern on screen one (the light the broom flies to) sinks into card III's low sun, burns as the campfire in Voices, rises as embers into Act IV's candles, and ends as the last flame over the AS monogram. Harry Potter is a bookend: it opens the prologue ("I solemnly swear…") and closes the page ("Mischief managed.").

**The four laws** (v2; every component obeys them; the critics cite them by number):

1. **Light lives in media; ink lives in the DOM.** Glow, flame, bioluminescence, lantern light, golden-hour sun, campfire and bloom exist only inside `MediaFrame` media, the one active *world canvas*, and the aria-hidden *world-media* sprites of the loaders and eggs. DOM text, controls, cards and chrome stay flat ink. Aqua stays **the one in-focus mark per viewport**, ember means **killed** only, and amber in the DOM means the **EXCEPTION** verdict only. (Unchanged from v1.)
2. **Higgsfield shoots the world; code builds the instruments.** Generated media may show the worlds' iconic **subjects** as our own compositions: the castle, the Black Lake, floating candles, the broom, the Black Pearl, the harbour, the campus, the yellow scooter at the lake, the frontier, a riderless horse, the camp and its fire. It never contains a person, face, hand or rider; legible text, a logo or crest; an instrument, map, chart, diagram, journal page or poster; or a remake of a specific film frame or game screenshot. Every instrument (Jack's compass, the gear train), map (the trail map, the Marauder's Map), journal page, poster, chart line, number and word is SVG, canvas or HTML in code.
3. **One world per viewport; the incoming world owns the cut.** Each section has exactly one world. Where the world changes, the renderer inserts a derived **act card** whose choreography belongs to the incoming world. Acts are contiguous; there are **at most 4 worlds** (three films and a game) and **at most 4 major world changes**. At rest a viewport shows only its own world's icons; a **user-invoked** egg may visit another world's section for ≤ 3 s and leaves nothing behind (Dead Eye on the ledger, §10.3).
4. **Iconic, recreated, never ripped.** The works are named openly, and their iconography appears wherever it **carries a site truth** (the compass settles on a real bearing; Dead Eye marks only rows whose verdict is KILLED; the Marauder's Map is the page's real structure). Everything is recreated by us, never traced, never a still, never a logo or crest, never a face (§15). Titles stay in our own type and are never set in a lookalike or logo face; lines are verbatim and attributed through the quote registry (§9.6); world display faces are scoped (§9.7). **Research data never takes a work's type, colour or marks.** The page `<title>`, meta description, OG image and the static favicon stay name-first with no film names or marks (hygiene: that is the surface brand sweeps crawl, and screen one belongs to Aryan). (Replaces v1 Law 4 "named in words, never in their marks".)

---

## 2. Shape of the page

```
[PROLOGUE · Harry Potter]  castle, Black Lake, candles, broom → "I solemnly swear…" → Play → flight
                            past the towers, through cloud, over the sea → lands on the name      (overlay, not a section)
 COLD OPEN                  hero: the name in front of a night sea; the Black Pearl's lantern      (world: pirates)
 ── opening card ──         "A research journal in four acts" + the program                        (house · LD-PC course, Jack's compass)
 ACT I   The Crossing       about · journey                                                        (pirates)
 ══ Card I→II ══            Storm → Blueprint   (D-5 long #1; the kraken hides in the storm)        (→ idiots · LD-3I gauge)
 ACT II  The Workshop       work · trading-algos · optuna-screener · experiment · systems · kill-list   (idiots; Dead Eye egg on the ledger)
 INTERMISSION               "Three films and a game" (the personal works chapter)                  (house; one world per screen)
 ══ Card II→III ══          The tintype: a plate develops, with a TIP   (reel-class, 0 travel)      (→ rdr2 · LD-RD plate & trail)
 ACT III The Frontier       beyond (golden hour) · writing (the journal) · voices (the campfire)   (rdr2)
 ══ Card III→IV ══          Embers → the Line ignites   (D-5 long #2)                               (→ hp · LD-HP ink-light)
 ACT IV  The Light          principles · contact                                                   (hp)
 CREDITS                    closing credits roll · "Mischief managed."                              (house)
```

**Why this order** (Pirates → 3 Idiots → RDR2 → HP, with an HP prologue):
1. **The real Journey is already a voyage** (`content.ts` `journey`): Origin → Early work → The break (the storm) → Now. No fact changes.
2. **D3's noise → order seam is the hinge of the film.** The storm is wiped into a blueprint at the I→II break.
3. **Act II ends on the kill-list**, the "all is lost" beat and the artifact Aryan is proudest of. It stays inside the workshop where the ideas were built and killed (D-6).
4. **Act III is the life around the work, and it is RDR2's by nature** (A-5):
   - *The facts fit the frontier.* Beyond holds cross-country miles, leadership, community and a creative life (drawing, photography, drone film). Arthur Morgan's world is a trail, a camp and a sketchbook.
   - *Writing is literally a journal.* The spec's own thesis ("read as a journal") gets its most natural host: Arthur's journal, on the same warm paper plane D-4 approved (RD-1).
   - *Voices are people heard, not shown.* The campfire is where RDR2's camp talks; the teacher quotes are read into firelight with no faces.
   - *Time runs forward inside the act:* ride in at golden hour, write by lamplight, sit by the fire at night, and the embers become Act IV's candles.
   - *RDR2's own signature is a loading screen with a tip*, so its card is a 0-travel reel: the D-5 budget holds.
5. **Why not "The Reckoning"** (ICONS §2 option A: kill-list + beyond in RDR2): it would split Act II's climax from its workshop, dress research data in film marks (a WANTED poster per killed row) and auto-run Dead Eye on the graveyard, which breaks D-6. Dead Eye survives as an opt-in egg on the ledger (§10.3), and WANTED moves to a handbill of confirmed facts in Beyond.
6. **HP stays the bookend.** The prologue opens it; Act IV (principles, contact) closes it; Card III→IV "Embers → the Line ignites" remains the page's most memorable moment, now lit by the campfire's embers.
7. **The intermission still sits mid-page (~50% down)**, after the graveyard. Its four screens run in act order and end on the HP screen's single warm point, which sinks into card III's low sun.

The order is data (§12). Reordering acts re-derives cards, numerals, labels, menu groups, transitions and the credits. Pairs with no authored transition get the generic loading reel and a validator warning. Removing the rdr2 act re-derives exactly the v1 three-act page (fixture I).

---

## 3. Manifest order (the binding sequence)

Travel = extra sticky scroll beyond content (desktop fine pointer). Mobile travel is 0 everywhere (§13). "Sig" = a `signature` section (the cap is **6** in v2: one per act plus the prologue and hero; the critics count them). Motif ids are defined in §10; icon ids (`IC-…`) are ICONS.md's, placed in §10.2.

| # | id · type | Act · world · tone | What the visitor sees and feels | Motifs / icons | Media | Travel | Sig |
|---|---|---|---|---|---|---|---|
| P | *(overlay)* `intro` | Prologue · hp · — | A candlelit night across a still black lake. On a crag at right, **a many-towered castle** with lit windows; **floating candles** at many depths; a **real-looking riderless broom** hovers, its handle pointing toward the name zone. There: *I solemnly swear that I am up to no good.* and `[ ▶ Play ]`. On Play, the camera follows the broom between the towers, down through cloud, out over the night sea, along a glowing wave and away toward **the Black Pearl's stern lantern**. The last frame *is* the hero. *Feel: the lights go down; you are carried in.* | IN-01, IN-02, IC-HP-01…04, candle sprites, oath (Q-HP-1), bolt-favicon egg, LD-HP (real load only) | IN-01 (canvas), IN-02 flight; IN-01m mobile | 0 | ★ |
| 0 | `top` · hero | cold open · pirates · deep | The huge static name stands in front of the dark tail of a long bioluminescent wave. On the far horizon, **the Black Pearl**, a tiny black-sailed silhouette whose stern lantern is the only warm pixel: the light the broom flew to, and the warm point the page will carry to its end. *Feel: the film has titled itself.* | Lens (aperture only if the intro didn't play), VelocityNoise = spray on media, PC-13, IC-PC-01, IC-PC-08 | MV-01 → MV-03; MV-02 mobile | 0 | ★ |
| — | card `act-1` · **opening** | — · house · deep | Letterboxed black. "A research journal in four acts." Below it, the program: I, II, the Intermission, III and IV as rows naming each act and its work, joined by a brass course line. **Jack's compass** settles on row I as the card passes. *Feel: opening credits and a table of contents in one.* | TA-04, LD-PC (scroll), IC-PC-02/03, optional IC-PC-10 rings | — (code) | 0 | |
| 1 | `about` · story `split` | I · pirates · canvas | Sea-night ground. The authentic portrait and bio. The four pillars sit as **four bearings** on an original rhumb rose, drawn in brass once on entry. *Feel: a first log entry, quiet and plain.* | TA-06, PC-02 lattice ≤ 4% | portrait (authentic) | 0 | |
| 2 | `journey` · story `voyage` | I · pirates · canvas | A voyage chart. The four real steps scroll on the left. On the right, a sticky sea scrubs through **a harbour at night** → fog → squall → first light. A brass course runs through 4 waypoints under a cartouche **THE CROSSING**; **Jack's compass** (red arrow, lid star chart) hunts and settles per leg, turns toward the waypoint you reach for, and at *The break* the course kinks with one ember tick while a small **Aztec medallion** turns to its moonlit skull. At *Now*, a brass **X** and `NOW • BRING ME THAT HORIZON.` *Feel: the voyage that earned the method.* | PC-12 sequence, local course, TA-09 = IC-PC-02, PC-09 = IC-PC-03, IC-PC-04, IC-PC-06, IC-PC-07, IC-PC-11, Q-PC-1, LD-PC (real frame loading) | MV-05a–d; JV sequence (desktop) | 0 (sticky column beside content) | ★ |
| — | card `act-2` · **seam** | I→II · idiots · deep | **Storm → Blueprint** (SM-5). The hero's sea in a night squall (a vast dark shape waits under the foam, for anyone who looks long), wiped along a ragged diagonal into a blueprint. The Line draws on as FIG. 0 with true dimensions while a gear train measures the passage. Title **The Workshop** in the chalk hand. Then the epigraph. | TA-01, IceCut, TA-02 FIG. 0, LD-3I (scroll), IC-PC-05 (egg in media) | MV-04 + code blueprint | ≤ 60vh (D-5 #1) | |
| 3 | `work` · gauntlet | II · idiots · canvas | The workshop at first light: a wiped chalkboard **under stone colonnade windows**, with a raking morning beam. Along the board's top margin: *Pursue excellence, and success will follow.* Choosing a gate derives it in chalk; you can **run** seeded, labelled-illustrative hypotheses through the real gates; the tally gets one chalk circle (**Rancho's circle**). A small chalk quadcopter in the corner lifts 8 px only when a Run clears all 7 gates. *Feel: the room where you're allowed to question everything.* | 3I-02, 3I-09 = IC-3I-02, 3I-06 (`aalIzzWell` settle), IC-3I-01, IC-3I-09, Q-3I-2, IC-3I-08 (egg) | MV-06 | 0 | ★ |
| 4 | `trading-algos` · chapter | II · idiots · canvas | Sticky facts column (limitations beside claims). The cover **is** a schematic of the real system on a blueprint panel (≤ 40% area), drawn in the **jugaad register** (visible bolts, taped joints, real parts only). **The chalk circle goes around the caveat, not the number.** | 3I-01, 3I-03, 3I-05, TA-07, IC-3I-04 | none (code) | 0 | |
| 5 | `optuna-screener` · chapter | II · idiots · canvas | Same grammar. The circle goes around "anything > 2.0 is a red flag". Under the pipeline FIG: *"A machine is anything that reduces human effort."* — Rancho, *3 Idiots*. | same, IC-3I-05, Q-3I-3 | none (code) | 0 | |
| 6 | `experiment` · experiment | II · idiots · raised | BacktestDemo on surface-1, `SYNTHETIC • ILLUSTRATIVE` adjacent. The quiet stretch of Act II. | (density valve: no chalk, no icons) | — | 0 | |
| 7 | `systems` · matrix | II · idiots · canvas | The capabilities table plus **FIG. "How this page is built"** (a true schematic, jugaad register) and the space-pen wink: "Why not just use a pencil?" with the true no-WebGL note. The grid starts thinning here. | 3I-01, 3I-07, IC-3I-04, IC-3I-06 | — | 0 | |
| 8 | `kill-list` · ledger (Lens Index) | II · idiots · canvas | **The reckoning.** 10 rows, equally quiet at rest (D-6). The aqua bracket tracks the active row; killed rows keep their ember strike when active. The grid is gone by the last row. **Opt-in egg: Dead Eye** (palette or typed): time slows, the section's media take a sepia-red grade, ember X's lock onto each KILLED row's recorded reason, then all strike at once and time returns. *Feel: the graveyard, laid out with dignity.* | D3 Lens, 3I-07 end, IC-RD-02 (egg only) | lens figures = schematic mono/colour pairs | 0 | ★ |
| 9 | `films` · films | Intermission · house · deep | **Three films and a game.** Four letterboxed screens in act order (the Pearl at anchor → the lake and the yellow scooter → a dusk ridge with a riderless horse → floating candles over inked paper), each with the work named, its verb, one attributed line from the work, a true line about what this page borrowed, "Seen here in" links, and Aryan's own reason (DRAFT-gated). The last screen leaves one warm point. | FC-01, FC-02, finales (compass / gates / trail-to-fire / ink-light) | F-PC, F-3I, F-RD, F-HP | 0 | |
| — | card `act-3` · **tintype** | →III · rdr2 · deep | **The tintype** (SM-14). The warm point sinks and becomes a low sun; the Line is re-traced as a graphite trail; the frame darkens into a tintype plate that **develops** into the golden-hour frontier as you scroll. Lower bar: the title art **THE FRONTIER** and `TIP • The result stands; no re-optimization after the fact.` | TA-01, LD-RD (scroll), IC-RD-08 | MV-10 (declared reuse ③) | 0 (reel-class) | |
| 10 | `beyond` · story `notes` (frontier dressing) | III · rdr2 · canvas | Golden hour. The dark foreground holds the notes; the lit distance (MV-10) holds the light. Beside Athletics, a small **trail map** un-fogs as you read and a line of running-shoe prints draws once; a pencil **satchel strip** of his real kit (camera, sketchbook, drone, running shoes); Aryan's own photographs as **tintypes**; at the end, a **WANTED handbill** of confirmed facts that links to contact. *Feel: the life around the work, at the best light of the day.* | RD-P3/P4/P7, IC-RD-01 (look), IC-RD-05, IC-RD-06 (in media), IC-RD-07, IC-RD-11, IC-RD-03 (handbill), IC-RD-13 | MV-10; MV-10m mobile; authentic photos | 0 | ★ |
| 11 | `writing` · index (journal) | III · rdr2 · **paper** | The dome seam rises as **a page of Arthur's journal** (D-4 paper, a leather edge). Left page: the five essays as dated entries with static DRAFT (drafts are not links). Right page: a graphite sketch for the hovered or focused entry draws once (the Blackwater-style plan crossed out beside "The kill-list"). The h2 writes itself in pencil. *Feel: entries kept by hand, by lamplight.* | RD-P1, IC-RD-01, IC-RD-13, graphite nib (HP-05 re-hosted) | none (code vignettes); Aryan's sketches if supplied | 0 | |
| 12 | `voices` · quotes (campfire dressing) | III · rdr2 · deep | Night. A small **campfire** in a stone ring burns at right, two canvas tents barely lit behind it. The three teacher quotes sit left in the dark; the lead quote is **read into firelight** (a one-shot mask from muted to ink; no glow on text). *Feel: people are heard, not shown.* | RD-P6, IC-RD-04, HP-03′ re-hosted | MV-11 → MV-11L | 0 | |
| — | card `act-4` · **ignite** | →IV · hp · deep | **Embers → the Line ignites** (SM-10). The fire burns low; 32–40 embers rise, find their places along the Line and kindle into candles, and **the enchanted hall** swaps in: floating candles densest along the curve under a ceiling that dissolves into night sky. Epigraph: *"Happiness can be found, even in the darkest of times, if one only remembers to turn on the light."* | TA-01, TA-08, HP-11, LD-HP (scroll), IC-HP-03, IC-HP-16, Q-HP-3 | MV-07 | ≤ 60vh (D-5 #2) | |
| 13 | `principles` · principles | IV · hp · canvas | Candle-night ground. Five numbered rows. On entry, 3–4 silver-blue ribbons converge once into an underline under each title. *Feel: ideas condensing out of the dark.* | HP-07 | — | 0 | |
| 14 | `contact` · contact | IV · hp · deep | Darkness. Far right, one floating candle's steady flame at the end of a fading trail of lights. The giant invitation sits left. **The bracket closes around the AS monogram over the flame.** Copy email → a 120 ms flare in the media. Egg: *Expecto patronum* sends a silver stag across the dark into the flame. *Feel: someone left a light on for you.* | D3 resolve, success = flare, IC-HP-13 (egg) | MV-08 → MV-09 | 0 | the ending |
| 15 | `credits` · credits | — · house · deep | The closing credits roll on native scroll: author, worlds borrowed from, lines quoted, imagery provenance, AI assistance, type (with the display faces and their licences), **the fan-tribute line**, "To be continued.", a Snitch that darts once and waits to be caught, ↑ back to the opening (a Time-Turner), and the very last line: **"Mischief managed."** Rendered as the page `<footer>`. | CR-01, IC-HP-11, IC-HP-12 (egg), IC-HP-15, Q-HP-2 | — | 0 | |

**Anchors.** `#top #about #journey #work #systems #principles #writing #beyond #contact` (the brief's required set), plus `#kill-list #voices`, plus `#trading-algos #optuna-screener #experiment #films #credits #act-1 #act-2 #act-3 #act-4`. (Anchor ids are stable across v1 → v2; only `#act-4` is new.)

**Signature count: 6** (intro, hero, journey, gauntlet, ledger, beyond), with contact as "the ending" (D-3 wording). The two long cards are *scenes*: `maxScenes` stays 2. Card III is a 0-travel reel.

---

## 4. The Line (TA-02): the through-object

- **What it is.** One asymmetric folded curve, stored in `lib/line.ts` as `LINE_D` (viewBox `0 0 1000 400`). It is hand-fitted **after MV-01 is approved** (G2 passed Claude's checks; Aryan's sign-off pending) to the silhouette of the hero's bioluminescent wave crest. It is our own path, never traced from film or game art. Geometry: body at x 46–94% (MV-01 measured: aqua body from x 0.485, bright body 0.60–0.96), the calm tail dissolving by x ≈ 0.36, and focal (0.70, 0.50).
- **Its material per world** (the `line` slot, §12). Every tool that ever drew the Line appears once:

| World | Material | Where it appears |
|---|---|---|
| hp (prologue) | light: the broom's trail skims the crest in the flight's last second | IN-02 trail (canvas), over the hero plate |
| pirates | a dashed **brass course line** with waypoint ticks (DOM SVG). The aqua wake exists only *inside* media | opening card, Journey |
| idiots | a **blueprint line** `#cfe8f7` with dimension ticks and Meta "FIG. 0". It is labelled with its **true** measurements (path length and control-point count, computed from `LINE_D`) | Card I→II, films 3I finale |
| **rdr2** | a **graphite pencil trail** `--w-pencil #a39686` (6.66 on rd canvas, CALC) with the R-1 paper-tooth filter on its static layer; boot/running prints walk beside it | Card II→III, films RDR finale, LD-RD, the Beyond trail map |
| hp (Act IV) | an **ink line** `#c9ac72` that kindles into points of light | LD-HP, Card III→IV, films HP finale |

- **Why it matters.** Every world change is a *transformation of one object*, not a skin swap: storm foam becomes the drawn Line; the blueprint Line is re-traced in pencil across hachures; the pencil trail is re-inked and its points kindle into candles. Generated plates that carry the Line (MV-01, MV-04, MV-07) are checked against `LINE_D` with an overlay diff (MEDIA-PLAN §6).
- **Rule.** The Line never passes through the h1 box, and no light ever runs across the name (a mustAvoid).

---

## 5. PROLOGUE — the intro overlay (N1)

**Intent.** The first thing a new visitor sees is a crafted Harry Potter play screen: the castle across the Black Lake, floating candles, a real-looking riderless broom, and the Marauder's oath above `[ ▶ Play ]`. Pressing Play starts a short chase shot that follows the broom between the castle's towers, down through cloud and out over the night sea to the Black Pearl's lantern, and **lands on the real, server-rendered page**. It is a gift, never a gate: the page is complete underneath, one keystroke or scroll away. (v2: aligned to the accepted IN-01/IN-01m/MV-01 and the IN-02 route-A draft, MEDIA LOG 2026-09-28.)

### 5.1 Architecture (non-negotiable)
- **Overlay above a fully SSR page.** `<main>` (h1, all content) ships in the server HTML exactly as without the intro. The overlay is a sibling `<div id="intro" role="dialog" aria-modal="true" aria-labelledby="intro-title" aria-describedby="intro-desc">` that is `position: fixed; inset: 0; z-index: 80` (below the 90 skip-link tier; header, menu and palette are covered).
- **Hidden by default in CSS.** `#intro { display: none }`. It shows only under `html.intro-armed`.
- **Armed before paint by the inline head script** (the same script that sets `html.motion-ok`), and only when **all** of these hold:
  - JS is running
  - `prefers-reduced-motion: no-preference`
  - no `?skip`
  - `location.hash` is empty
  - `navigator.connection.saveData !== true` and `effectiveType` is not `slow-2g`, `2g` or `3g`
  - `sessionStorage['intro-seen']` is not `"1"`, and `sessionStorage['motion']` is not `"paused"` (both reads in try/catch; a throw means *do not arm*)
  - `film.enabled && film.prologue.enabled` (serialized into the script as a data attribute)
  - `?intro=1` forces arming for QA, except under reduced motion.
- **Failsafe.** The head script also starts a 3000 ms timer. If the overlay controller hasn't set `window.__introReady` by then, it removes `intro-armed`, so the page shows. A controller that fails to load can never strand the visitor.
- **Controller.** A tiny vanilla module (≤ 6 KB gz, no React, `defer`), so Play, Skip and Esc work before hydration. It owns the canvas, the video and the state. While armed, it sets `inert` on the header, `<main>`, the footer and the site skip-link, and removes it on exit.
- **No-JS:** the overlay never shows. Everything is visible, as in D3.

### 5.2 The play screen (state `S0 armed`)
- **Layers, back → front:**
  1. The night ground `--intro-night` **`#020e1c`** (v2: retuned from `#06080d` to match IN-01's bluer night, MEDIA LOG flag 2; CALC ink 16.42 · stone 8.67 · muted 5.61 · aqua 10.42), painted instantly by CSS.
  2. `<canvas>` (the world canvas while the intro lives). After `load` plus idle, it draws the **IN-01** plate (desktop 16:9 cover: the castle on its crag at right with lit windows reflected in the Black Lake, ≈ 22 floating candles, the broom at centroid ≈ (0.77, 0.51) with its handle pointing up-left toward the name zone) or **IN-01m** (portrait: castle upper-middle, broom at ≈ 31% height), fading it in over `dur.preview`, plus ≤ 40 **floating-candle sprites** (IC-HP-03: pre-rendered cream taper, flame and halo in 3 sizes, bobbing ± 4 px at 0.15–0.25 Hz) at nearer depths than the plate's candles. Using canvas keeps the plate out of LCP (INFERRED: canvas is not an LCP candidate).
  3. The text block, positioned **exactly where the name will land** (plate x 9–46%, y 28–64% at ≥ 1024; IN-01 measured p95 luminance 0.0060 there). This is continuity: *Play becomes the name*.
  4. The top row: `SKIP INTRO` on the right.
- **Text and controls (≤ 3 type styles: `meta`, `quote`, `title`):**
  - `#intro-title` (Meta, `--fg-muted`): `ARYAN SHARMA • A RESEARCH JOURNAL IN FOUR ACTS` (proposed; the count is derived from enabled acts).
  - **The oath** (Q-HP-1, `quote` treatment: Newsreader italic at `lead` size, `--fg`), one line directly above Play: *I solemnly swear that I am up to no good.* Rendered through `<FilmQuote id="hp-oath" attribution="credits">` (its attribution appears in the credits' `LINES QUOTED` row; §9.6). It is not set in a display face (the play screen is not a display-font slot, §9.7).
  - The credit line (Meta, a separate block): `AFTER PIRATES OF THE CARIBBEAN • 3 IDIOTS • RED DEAD REDEMPTION 2 • HARRY POTTER`. It is derived from enabled acts, in act order (4 fields: the Meta maximum).
  - **The Play control:** a native `<button>` reading `[ ▶ Play ]`. The label "Play" is in `title` (Newsreader 400; 63 px at 1440, 35 px at 390), the triangle is lucide `Play` at 1em (functional icon), and the **bracket** (the D3 Lens primitive, aqua) frames it. The bracket is **the viewport's one aqua mark**. At arm, the bracket halves are *drawn in* (HP-01 ink draw-on, `pathLength` 0 → 1, `easeDraw`, 0.9 s), but the button is operable from the first frame. Target ≥ 44 px; the real hit area is the whole bracketed box.
  - `SKIP INTRO`: a native `<button>` in Meta, `--fg-muted` → `--fg` on hover and focus, ≥ 44 × 44.
  - `#intro-desc` (sr-only): "The page is already loaded behind this intro. Press Play to watch a six-second flight, or Escape to skip it."
- **Motion at rest.** ≤ 40 candle sprites drift and bob at varied depths, with ≤ 8 px pointer parallax on a fine pointer. **12 of them hover within ~120 px of the bracket, never over the text block** (sprite rect ∩ text rect = ∅). On Play hover *or* `:focus-visible` they gather to a ~72 px ring around the bracket over `dur.reveal`: the lights lean toward your intent (focus parity). **All ambient candle motion stops 5 s after arming** (WCAG 2.2.2 without a separate control) and resumes only on hover or focus. No flicker is used as feedback.
- **Egg (IC-HP-10):** while the flight plays, the tab favicon becomes a small gold lightning bolt (our 3-segment SVG), then returns to `[AS]`. Never under RM (the intro never arms).
- **Initial focus.** On arm, focus moves to Play (`preventScroll`). Tab order: Play → Skip intro (the dialog traps Tab).
- **Contrast.** Ink on the intro zone passes ≥ 7:1: IN-01's Play zone measured p95 0.0060 (≤ 0.054 required), and `--intro-night #020e1c` gives ink 16.42 and stone 8.67 (CALC).

### 5.3 Play → flight → landing (desktop ≥ 1024, fine pointer, `hardwareConcurrency ≥ 4`)
| t | Driver | What happens |
|---|---|---|
| 0 | click / Enter / Space | The bracket halves travel outward to the viewport edges on `easeClip`/`dur.hero` (the one aperture, spent here). The text block exits on `dur.base`. The candle sprites stream outward toward the broom (canvas, `dur.reveal`) |
| 0+ | readiness | If the flight video (IN-02, preloaded since idle) has `readyState ≥ HAVE_ENOUGH_DATA`, it plays and the canvas cross-cuts to it (its first frame *is* IN-01, so the join is invisible). Otherwise the **HP loader** (LD-HP, §8) appears after a 250 ms delay: bottom-centre, with real progress = `buffered / duration` and `role="status"` text "Loading the flight…". If it isn't playable within 4 s, the controller runs the **code flight** (§5.4) and never waits longer |
| 0–≤ 6.0 s | **time** (video clock) | The camera follows close behind the riderless broom: it lifts off above the Black Lake, weaves between the castle's towers and lit windows while floating candles slide past at many depths (an owl may cross the moon at 1–2 s, IC-HP-17, only if the model renders it cleanly), dives through a soft cloud deck (never a white flash), bursts out over the night ocean, skims the glowing crest (tracing the Line), and rises away toward **the Black Pearl's stern lantern** until it leaves frame. The final frame = **MV-01** (with the Pearl), pixel-registered with the live hero (§5.5). A code **light trail** (≤ 48 sprites, 600 ms exponential decay, canvas) follows the baked broom path `intro-trail.json` |
| last 0.62 s | time | **Landing.** The overlay dissolves with a left-to-right `mask-image` sweep over `dur.reveal`, so the name zone clears first and the name *resolves* in front of the sea as the broom leaves at right. The h1 itself never animates |
| end | — | The overlay unmounts (canvas and video released, so the decoder frees for MV-03). `inert` is removed, `sessionStorage['intro-seen']="1"`, and focus moves to the h1 (`tabindex="-1"`, `preventScroll`; no visible ring on this non-interactive target). The hero Lens is `open` (the aperture was spent on Play) |

**Caps.** Play → content ≤ 7.0 s (flight ≤ 6.0 s plus landing 0.62 s plus slack). Skip or Esc → content ≤ 0.4 s.

### 5.4 Mobile and low-power: the lighter version
Used below 1024 px, on a coarse pointer, when `hardwareConcurrency < 4`, or as the fallback when the video isn't ready.
- **The play screen** uses IN-01m (portrait) in the canvas, with the same text and controls; the Play block sits in the lower third.
- **The code flight** (≤ 2.4 s total): an original SVG of **the same real-looking broom** as IN-01 (IC-HP-04: a hand-carved dark handle with a gentle curve, a bound birch-twig tail tied with cord; no lettering or product marks; ≤ 60 path nodes) flies a bezier from the lower left to the upper right over the still, past the castle (transform only, `easeDraw`, 1.6 s), with a canvas light trail (≤ 24 sprites). At 1.2 s the overlay **exits by the dome** (the D3 `Seam` geometry: an ellipse edge rising over 0.6 s on `easeClip`), revealing the page top. Focus → h1. No video is ever requested.

### 5.5 Registration (the end frame lands on the page)
- The hero section is exactly `100svh` at ≥ 1024. Its `MediaFrame` fills it with `object-fit: cover` and `object-position` = MV-01's `focal`. The overlay video uses the **identical** box and fit.
- IN-02's end frame is generated with `end_image = MV-01` (MEDIA-PLAN), i.e. **against the accepted MV-01 with the Pearl**; any later MV-01 revision forces an IN-02 regeneration. The bar gates it at ≥ 0.95 SSIM against the hero poster crop (±2 px registration).
- If the manifest changes the hero plate, the validator warns "prologue end frame ≠ hero plate". The landing then falls back to a plain `dur.reveal` crossfade.

### 5.6 Exits and dismissal (the overlay never gates content)
- **Skip intro** (click / Enter / Space), **Esc**, and **any scroll intent** all dismiss immediately, fading on `dur.base`:
  - scroll intent means `wheel`, `touchmove`, or PageDown / PageUp / Space / arrows / Home / End with focus not on Play
  - the page scrolls natively underneath: there is no scroll lock and no hijack
- Dismissing pauses and removes the video, sets `intro-seen`, removes `inert` and focuses the h1.
- `visibilitychange: hidden` during the flight pauses it. On return, it resumes, or skips if more than 30 s passed.
- **Silent.** No audio track, no audio toggle (DESIGN bans audio). A deliberate muted toggle is *not* justified: the film is 6 s, and sound is the most kitsch-prone film signal (Kimi HP DO-NOT #9).

### 5.7 Performance contract
- The overlay's first paint is CSS, text and inline SVG only. IN-01 is fetched after `load` with `fetchpriority="low"` and drawn into the canvas. IN-02 (≤ 4 MB, H.264 1080p plus WebM, `-an`) is preloaded after idle on fast connections, or on the first Play hover or focus.
- **LCP stays the page's.** The SSR h1 (or the `priority` MV-01 poster) remains the LCP candidate: the overlay adds only small text and a canvas. The bar requires measured LCP ≤ 2.5 s (mobile lab), and the LCP element must be the h1 or the MV-01 poster.
- One canvas (the intro's) and at most one decoder (IN-02). MV-03 may not start until the overlay unmounts.

### 5.8 Legal and honesty for the prologue (v2: the iconic override applies; §15 is binding)
- **Allowed and wanted (A-6):** the castle on its crag (IC-HP-01, appears **once** on the page: here), the Black Lake (IC-HP-02), floating candles (IC-HP-03), a real-looking racing broom (IC-HP-04), an owl crossing the moon (IC-HP-17, optional), the oath line, the bolt-favicon egg.
- **Still out (H1/H2):** any rider, person, face, hand or character silhouette; the scar, round glasses, hats, scarves or house colours; crests, the HP logo or lightning-P lettering; any lettering or product name on the broom (no "Nimbus"/"Firebolt" marks; generated text garbles into a fake product mark); film stills, frame grabs or film audio.
- **Check L2** (DESIGN v3 §7; MEDIA-PLAN v2 §6): ours (text-only prompt, no film refs) · no faces · no marks · the subject, not the shot (our composition: a low lake-level view, not a remake of a film frame) · crafted. Claude signed IN-01 and IN-01m on 2026-09-28; **Aryan's signature is pending**.
- The oath is a verbatim, attributed quote (`proposed` until Aryan signs, §9.6). All other overlay text is proposed microcopy about the page.

---

## 6. The hero (cold open)

- **First paint (SSR, no JS):**
  - `<h1>` "Aryan / Sharma" in `display` (158 px at 1440), `--fg`, on the name zone (plate x 9–46%). It is **static and never animated**.
  - Below it: `site.throughline` (`lead`), `site.identity` (`meta`, `·` → `•`), and one CTA, "View the quant portfolio ↓" (ink, aqua focus ring, aqua-bright hover), linking to `#work`. That is exactly 3 type styles.
  - Header: `[AS]` · act label (empty at the top) · Work · waveform Pause · Menu.
- **Media.** MV-01 poster (`priority`, 200–350 KB, reserved 16:9, full-bleed `cover`, `100svh` on desktop):
  - Black open ocean under low overcast, with a faint moon glow behind cloud at upper right.
  - One long bioluminescent aqua crest folds across x 46–94%. Its tail dissolves into dark water and fog by x ≈ 38%: **the calm band**, where the name overlaps it (Dennis depth-by-overlap).
  - **The Black Pearl** (IC-PC-01; v2, accepted MV-01): a tiny black-sailed three-master silhouette on the far horizon (≈ 3% of plate width, ≤ 7% allowed), no crew, no legible flag. **Its stern lantern** at (0.893, 0.419) is the only warm pixel on screen one (0.001% of the frame): the place the broom flew to, and the warm point the page carries to its end (§1).
- **The one aqua mark** is the bracket, which rests around the crest's bounding box (`media.focalBox` measured x 0.49–0.96, y 0.46–0.60; the halves stop at x 0.96; ≥ 16 px from the h1). The Pearl sits above the box and is not bracketed: it is a discovery, not the focus. The wave's aqua lives inside media, which is exempt.
- **Aperture.** Only if the intro did *not* play (auto-skipped, skipped before Play, or already seen): the D3 aperture opens once per session on `poster.decode()`, from a slit at the focal x to full (`inset(0 30% 0 70%)` → `inset(0)`, `easeClip`/`dur.hero`). The halves ride the clip edges and stop at the `focalBox`. If the intro played, the Lens starts `open`.
- **Loop.** MV-03 (8 s, start = end = MV-01) swaps in on `playing`, only on desktop with a fine pointer, no Save-Data, and after the overlay unmounts. The crest rolls, glints travel its right edge, the fog drifts; the left half and the calm band stay static; the Pearl stays in place (drift ≤ 2 px) and its lantern stays steady (blob luminance varies ≤ 5%).
- **Velocity dialect (media only).** Scrolling fast raises VelocityNoise grain (≤ .10) and a ≤ 2 px chroma offset on the plate, and brightens the wake (a ≤ 15% brightness lift on a masked wake layer of the media). Stopping restores clarity. Nothing touches text.
- **Scroll out.** The D3 exit map (scale 1.03 → 1.08; y −24 px; darken from .7 to 1). The opening card follows: the film has titled itself.
- **Hero credit line (optional, default OFF, decision H-1).** `film.heroCredit: true` adds a Meta line above the name, `IN FOUR ACTS • AFTER THREE FILMS AND A GAME` (derived counts). OFF keeps screen one name-first for admissions readers; the prologue, the opening card and the intermission name the works instead.
- **Mobile (<640 / coarse):** name → lead → meta → CTA → MV-02 (4:5), with no overlap and no video unless the visitor opts in. The aperture runs on MV-02's decode when ≥ 50% is in view.

---

## 7. Signature moments and set pieces

Each entry gives the **entry → mid → settled** states, the **driver**, the key **tokens** and the **fallbacks**. Tokens are DESIGN v3 names. RM = reduced motion or the Pause toggle; M = <640 or coarse pointer; NJ = no JS; SD = Save-Data, 2G or 3G.

**Ids are stable, not ordinal** (the bars cite them). v2 re-hosts SM-10 (now Card III→IV) and SM-11 (now the journal), and adds SM-14 (Card II→III), SM-15 (Beyond), SM-16 (Voices) and SM-17 (Dead Eye). They are listed below **in page order**. Every icon named here is placed and tiered in §10.2 and drawn per ICONS.md.

### SM-1 · Prologue flight (N1)
See §5. Bar: `bars/intro.BAR.md`.

### SM-2 · Hero: the name at sea
See §6. Bar: `bars/hero-lens.BAR.md`.

### SM-3 · Opening card: the program (derived card, kind `opening`)
- **Entry:** the dome seam to `deep`, then R1 masked rise of the h2 "A research journal in four acts." (`title`, proposed; the count is derived).
- **Mid:** a **driver** `p` = the card's passage through the viewport (no pin) plots the LD-PC course line down the left edge through 5 waypoints: I, II, Intermission, III, IV. Each row is an `<a>`: act title in `heading` (Geist; the opening card never uses display faces, because it would put four faces in one viewport), plus a Meta credit `ACT III • AFTER RED DEAD REDEMPTION 2`. Hovering or focusing a row draws that act's Line material in a 120 px vignette beside it (brass / blueprint / graphite / ink-light), with a static final state. The rows point at intent: hovering or focusing a row turns the compass needle toward it (IC-PC-03).
- **Settled:** at p = 1 **Jack's compass** (IC-PC-02, 96 px: the octagonal brass case, 32-point dial, fleur-de-lis north, the red arrow) settles on row I's bearing (`springNeedle`), with a single 120 ms moon-white tip flash (IC-PC-09, the green-flash wink).
- **Option (FLAG, IC-PC-10):** four concentric rings, one per act, rotate with p and align at p = 1 (our own Mao Kun-style ring grammar). They never carry required information.
- **Tokens:** `--color-deep`, brass `#a8834a`, moon `#a9bcc0`, `--pir-compass-red #a8453a` (3.42 on house deep, CALC), `easeDraw`, `springNeedle`.
- **Fallbacks:** RM/NJ → static: course fully drawn, needle at bearing, no flash. M → same static composition with rows full width.

### SM-4 · The voyage (Journey, story `voyage`)
- **Layout ≥ 1024, fine pointer:**
  - Left (cols 1–6): the four steps in normal flow, each an `<article id="journey-step-n">` with Meta `01 • ORIGIN`, the title in `heading` and the body in `body`, verbatim.
  - Right (cols 7–12): a **sticky** media column (not a pinned stage, so 0 extra travel). It holds the sequence canvas (72 frames, JV, 1280 w), and below it the chart strip: a dashed brass course through 4 waypoint links, with **Jack's compass** (72 px) at left and a small cartouche **THE CROSSING** (IC-PC-07; the act title in Pirata One, the act's one display-face moment, §9.7). Soundings are Meta `.tnum`; waypoint names stay Geist/Mono (data never takes a display face).
- **Driver:** frame index = `round(p × 71)`, where p is the section's content progress (R2, direct). The frames pass **exactly** through MV-05a/b/c/d at the step beats (p = 0, ⅓, ⅔, 1). MV-05a is now **a harbour at night** (IC-PC-11: piers, moored ships, lanterns, no people); it decorates step 1 verbatim and adds nothing about family.
- **Instrument = Jack's compass (IC-PC-02):** state-driven, not scroll-mapped. When the active step changes (centre-line IO), the red arrow hunts and settles on that leg's heading (`springNeedle`). The lid opens on hover or focus to show a dot star chart. At step 3 ("They failed out-of-sample") the course **kinks** and one **ember tick** marks it: ember = killed, because those Smart-Money patterns are on the kill-list (`killList[4]`). The compass arrow is `--pir-compass-red #a8453a`, a darker red than ember (2.00:1 apart, CALC) and only ever on pirates canvas/deep (3.15/3.37; it fails on raised, 2.83).
- **The cursed medallion (IC-PC-04, one-shot TEXTURE):** a ≤ 40 px brass Aztec-style medallion at waypoint 3. When step 3 becomes active, a moon-silver mask sweeps it once and it reads as its moonlit skull state: gold in-sample, a skeleton under the moonlight of out-of-sample. It decorates the verbatim fact; it adds no event. RM shows the moonlit state static.
- **The X (IC-PC-06):** a two-stroke **brass** X (never ember) at waypoint 4 ("Now"), with the Meta caption `NOW • BRING ME THAT HORIZON.` (Q-PC-1, COMMUNITY; verify the ellipsis before ship). One X per page; it marks the last real step, never a metric.
- **PC-09 wink (IC-PC-03, "points to what you want most"):** hovering or focusing a waypoint link turns the needle toward it. Clicking scrolls natively to that step.
- **Real loading (N2):** until all frames decode, the column shows the active step's still (MV-05x) plus a 48 px LD-PC mini loader in the frame corner with real `decoded / 72`. Scrubbing activates when complete. The loader appears only after 400 ms, and it stops moving after 5 s (static frame) while decoding continues.
- **Fallbacks:** M / RM / SD → the existing journey carousel with MV-05a–d stills, the course drawn static, the needle at each bearing, and 0 sequence requests. NJ → the four steps plus the four stills stacked.
- **Bar:** `bars/journey-voyage.BAR.md`.

### SM-5 · Card I→II "Storm → Blueprint" (derived card, kind `seam`, D-5 long #1)
One `ScrollStage`, direct `useTransform`, no springs. Travel ≤ 60vh, desktop fine pointer ≥ 1024 only.

| p | Beat |
|---|---|
| 0–.15 | The dome seam to `deep`. The letterbox frame opens `inset(8%)` → 0 on **MV-04**: the hero's camera and horizon in a night squall, with the crest broken into foam along the Line's curve, the Pearl gone. **Egg (IC-PC-05):** a vast dark mass lies beneath the foam, visible only on a long look (media only; no tentacles, no ship under attack; the Line fit is unaffected). Upper bar: Meta `ACT II • AFTER 3 IDIOTS` and the reel mark `II / IV`. Lower bar: the act title "The Workshop" rises once, set as **Kalam lettering** (the act-title display slot, §9.7; the real h2 text is in the DOM) |
| .15–.75 | The D3 **IceCut**: a ragged-diagonal `mask-image` wipes the storm into a **code blueprint ground** (`--bp-panel #0f2c47` plus a 24 px CSS grid at 6%), with opposing ±40%·p² parallax. The **3 px aqua seam line** shows only for .1 < p < .9 (the viewport's only aqua). The Line draws on in `#cfe8f7` (`pathLength` = remap(p, .2, .75)), with dimension ticks and Meta `FIG. 0 • THE LINE • L = <computed length> • <n> CONTROL POINTS` (true values from `LINE_D`). **LD-3I gauge:** a 12T/8T gear pair at the dimension line's left end turns exactly as far as the rack pointer travels. Pointer x = p × L |
| .75–1 | The epigraph rises once in the lower bar (`lead`): "Treat every backtest as guilty until proven innocent." (existing copy, REPO interlude; `pillars[1]`). At p ≥ .95 one chalk circle draws around the dimension line's end tick (3I-09, `easeDraw`, 0.7 s) |

- **Fallbacks:** RM/NJ → a static title card: the blueprint frame with FIG. 0 drawn, the gauge at the end with the circle, captions as an `<ol>`, and the `summary`. **M** → the same static composition, with the FIG. 0 Line drawn once on entry (R1). There is no scrub and no pin (D-5: static elsewhere).
- **Bar:** `bars/noise-order-seam.BAR.md` (adapted).

### SM-6 · The gauntlet on the dawn board (`work`, verb)
- **Entry:** R1 heading rise, and the **`aalIzzWell`** settle (IC-3I-03: `springSettle` in two soft beats, "hand on heart") on the board frame's non-interactive entrance (3I-06). Never on anything clickable (no overshoot on controls, H5).
- **Structure:** the tablist (the 7 gates from `content.ts`) plus a `<figure>` on the MV-06 board still (v2: the board hangs under **stone colonnade windows** at dawn, IC-3I-09, no signage), whose left 60% is even and dark. The SVG gate diagram is drawn in chalk (`#f2efe6`, one shared `chalkRough` filter) over the board.
- **The board's top margin (IC-3I-01, Q-3I-2):** one line, *Pursue excellence, and success will follow.*, rendered through `<FilmQuote id="3i-excellence" excerpt>` in the `quote` treatment (house type, not a chalk font: the board is not a display-font slot, §9.7), with one chalk underline (counts toward the ≤ 3 chalk marks). Attribution inline in Meta: `— RANCHO, 3 IDIOTS (2009)`.
- **Egg (IC-3I-08):** a small unlabelled chalk quadcopter doodle in the board's bottom-right corner lifts 8 px once when a **Run** clears all 7 gates. It is never a window, camera feed or sprite, never linked to the film's grief context or to Aryan's real drone work.
- **Mid:** selecting a gate **derives** it: its chalk strokes draw in build order (`easeDraw`, ≤ 1.2 s), and the active gate is the one aqua. **Run** follows D3 exactly: anticipate on `dur.micro`, dots advance `dur.base` per gate, a failing dot shows ember only while stopping, then rests hollow.
- **Settled:** the tally is HTML, and one chalk circle goes around the tally line (3I-09). `SYNTHETIC • ILLUSTRATIVE` sits inside the same `<figure>`.
- **Fallbacks:** RM → the settled tally, chalk pre-drawn, no Run. NJ → all 7 gates as a list plus the static diagram. M → a vertical tablist, the figure below it, the board cropped 1:1.
- **Bar:** `bars/noise-order-seam.BAR.md` §B.

### SM-7 · Honest chalk (the chapters)
- **Entry:** the facts column rises (R1). The blueprint panel's schematic draws once when 35% is in view (3I-01, `easeDraw`, ≤ 1.5 s, < 60 path nodes).
- **Nodes** come only from `featuredProjects[i].approach` and `stack`:
  - Trading_Algos: pre-registration → LEAN backtest (signal at T close, fill at T+1 open) → 7 gates → survivors | kill-list with post-mortems
  - Optuna-Screener: strategy file / discovery → indicators → Optuna TPE + walk-forward → stress tests → 25% holdout → report; the v3 ensemble branch
- **Labels** are HTML Meta positioned over the panel, never SVG text.
- **The jugaad register (IC-3I-04):** schematics are drawn as Rancho-style salvaged machines: visible bolts, taped joints, parts labelled as found. **Every part drawn is the real system** (nodes traceable to `content.ts`); the "machine for show" ban stays (H4).
- **The machine line (IC-3I-05, Q-3I-3, `optuna-screener` only):** one caption under the pipeline FIG, *"A machine is anything that reduces human effort."* with inline Meta attribution `— RANCHO, 3 IDIOTS (2009)` (COMMUNITY; verify). It sits under the figure, never beside a metric.
- **Leaders (3I-05)** run from each metric to its claim.
- **TA-07:** the one chalk circle per chapter goes around the **caveat** text span (Trading_Algos: "(one-shot; in-sample +1.42)" in the evidence, or the limitations sentence; Optuna: "anything > 2.0 is a red flag"). **Never around a metric.**
- **Fallbacks:** RM/NJ → drawn. M → the panel below the facts, full width, leaders hidden.
- **`systems` (the matrix, same grammar) v2 wink (IC-3I-06):** under FIG. "How this page is built", a caption in our own words, "Why not just use a pencil?", then the true note that this page uses no WebGL (native scroll, CSS and SVG first), and a footnote that the famous space-pen story is a myth (verify the wording before ship). It is not a registered quote (our phrasing).

### SM-8 · The reckoning (Lens Index)
- D3's Lens Index, unchanged in structure (`bars/lens-index.BAR.md`).
- **World deltas:**
  - the idiots canvas ground
  - the 3I-07 grid, at ≤ 6% on entering `systems`, thins row by row and is **0 by the last ledger row**
  - the bracket is aqua; killed rows keep the ember strike when active
  - no chalk marks and no icons at rest: the graveyard's power is austerity (v2: the WANTED-poster-per-row and auto-running Dead Eye from ICONS §2 are **not** adopted; D-6)
  - the one exception is the **opt-in Dead Eye egg (SM-17)**, user-invoked only
- **Entry:** R1 rise of the `h2`. The bracket is ghost and closed until the first activation.
- **Mid:** the centre-line IO, hover or focus picks the active row. Text colour changes first (`dur.micro`), then the bracket y follows on `springFollow`, then the figure crossfades mono → colour (`dur.preview`).
- **Settled:** exactly one row takes hue; 0 rAF.
- **Drivers:** R3 (IO, pointer, keys), with no scroll-mapped spring.
- **Tokens:** `--idi-canvas`, `--fg-ghost`, `--accent`/`--kill`/`--exception`, `--w-grid`.
- **Fallbacks:**
  - RM → open lens, instant swaps
  - < 1024 → the mobile list (no lens), with the centre-line row active
  - NJ → idle and fully legible
  - SD → colour figures only, lazy

### SM-9 · Intermission: "Three films and a game" (the personal works chapter)
- **Structure:**
  - `<section id="films" aria-labelledby>`, `h2` **"Three films and a game"** (`title`, proposed; the words are derived from `worksInUse` kinds, so disabling RDR2 gives "Three films"), with Meta `INTERMISSION` above it.
  - One `lead` (proposed): "This page borrows its light from three films and a game. Here is what it took from each."
  - **Four screens** in act order, each an `<article>`:
    - a letterboxed 2.39:1 `MediaFrame` still (F-PC, F-3I, F-RD, F-HP) at full content width
    - under it, in the lower bar region: Meta `ACT III • REFLECTION • 2018`; the work title as `h3` in `title`; **the line**, one verbatim quote from the work in the `caption` rendition (a second Meta block with inline attribution, §9.6); the **borrowed** line (`body`, proposed site fact); **Seen here in** (Meta links, derived); and the **reason** (Aryan's words, DRAFT-gated, §9.6)
  - Type at rest stays {meta, title, body}: the line is a Meta caption, never a fourth style.
- **The stills (MEDIA-PLAN v2 §4, iconic, recreated):**
  - **F-PC:** the Black Pearl at anchor in still black water at night, from water level, black sails furled, its stern lantern lit, low fog (IC-PC-01; no crew, no legible flag).
  - **F-3I:** the high mountain lake at first light, pale mountains, and one yellow scooter parked on the shore as the frame's only amber (IC-3I-10; no people, no reunion tableau).
  - **F-RD:** a dusk ridge line in afterglow with one riderless horse at rest, small, at the right third (IC-RD-05/06).
  - **F-HP:** an unwritten sheet of cream paper on a dark desk; a fine line of ink spreading on its own; floating candles at varied depths above (IC-HP-03; no letters, no map).
- **The lines (Q-ids, §9.6; all `proposed` until Aryan signs):** Pirates *"Not all treasure is silver and gold, mate."* · 3 Idiots *"Aal izz well."* · RDR2 *"Be loyal to what matters."* · HP *"It does not do to dwell on dreams, Harry, and forget to live."* Each is set apart from the reason and never reads as Aryan's words. The HP and RDR2 lines never sit near SOS Foundation or family content (H4).
- **Entry, per screen (R1, once, at ≥ 50% in view):** the frame clip opens `inset(8% round var(--radius-frame))` → `inset(0)` on `easeClip`/`dur.hero`. Then the **finale motif** draws over the still (aria-hidden, state-driven, once):
  - **Pirates:** Jack's compass (120 px) hunts, then its red arrow settles on the bearing of the **next act** (derived: `bearingOf(nextAct)`), with a brass course line drawn to the frame edge.
  - **3 Idiots:** a blueprint draw-on of the **7 real gauntlet gates** across the lake's sky (strokes only; the gate labels are in the article as an HTML `<ol>` of `gauntlet[].title`), then one chalk circle around the final gate.
  - **RDR2:** LD-RD complete-state: a graphite trail drawn across hachures ends at a campfire point that kindles (≤ 12 sprites).
  - **Harry Potter:** LD-HP complete-state: the ink Line draws while a cool point travels it, ending with **one warm point lit at the Line's start**, which Card II→III takes over as its low sun.
- **Settled:** static. No time-driven clips, no sticky stage, 0 travel. One world per viewport: each screen is ~1 viewport tall at 1440×900 (frame 602 px plus text).
- **Fallbacks:** RM/NJ → stills with the finales in their final state. M → letterbox off (a 3:2 crop), finales drawn static. SD → stills at the smallest srcset.
- **Links:** "Seen here in" = nav-enabled sections whose `worldOf` equals this work's world (≤ 3 section links plus a link to the act card `#act-n`). Each target is ≥ 44 px, and each is a real anchor.
- **Bar:** `bars/films-chapter.BAR.md`.

### SM-14 · Card II→III "The tintype" (derived card, kind `tintype`, reel-class, 0 travel; rdr2 owns the cut)
RDR2's own signature is a loading screen, so its card is one (RD-P4 "develop, don't load"). It is driven by passage p (no pin), and scrolling back reverses it.

| p | Beat |
|---|---|
| pre | SSR static composition: the developed plate (MV-10), title, TIP and `summary` |
| 0–.3 | Letterbox 2.39:1 on `--rd-deep #0a0605`. Upper bar: Meta `ACT III • AFTER RED DEAD REDEMPTION 2` and the reel mark `III / IV`. The Intermission's last warm point **sinks and becomes a low sun** (a `--w-dusk` sprite, media only). Beneath it, the Line is re-traced as a **graphite trail** across 6 hachure arcs (`--w-pencil`, `pathLength` = remap(p, 0, .3)) |
| .3–.8 | The frame darkens into a **tintype plate** (R-2: 6 px radius, grayscale + .45 sepia, inset vignette) that **develops** into MV-10: a procedural ink-bleed mask whose threshold = remap(p, .3, .8). This is our own mask, not Lee Martin's sprite sheet |
| .8–1 | The `--w-bone` plate border draws. Lower bar: the `h2` **THE FRONTIER** as outlined lettering (Chinese Rocks, mode B, §9.7; the real text is an sr-only span) and one **TIP** line: Meta `TIP` + `lead` text *"The result stands; no re-optimization after the fact."* (tip #2, `gauntlet[0]`, confirmed: mark first, fire once) |

- **The progress element** is the pencil trail. The word "loading", a percentage and `role="status"` never appear (§8.2).
- **Honest TIPS:** tips are a Rockstar loading-screen convention; RDR2 story mode's own tip line is reported disabled (STUDY §1.4, REPORTED). Ours are Aryan's own rules, verbatim (§8.3), true to the genre and not a claim about the game.
- **MV-10 is a declared reuse (DESIGN v3 §7 ③):** the plate develops into the very world the reader is entering (Beyond's ground).
- **Type:** {meta, title (lettering), lead}.
- **Fallbacks:** RM/NJ/< 640 → a static title card (the developed plate, title, tip, `summary`). SD → the smallest MV-10.
- **Bar:** `bars/rdr2-act.BAR.md` §A (and `act-cards.BAR.md` C1–C24).

### SM-15 · The frontier (`beyond`, story `notes`, rdr2 frontier dressing; signature)
- **Opening band (≥ 1024):** a 16:9 MV-10 golden-hour band (≤ 80vh): a grassland valley, the low sun above a far ridge at x ≈ 78%, a slow river, one small riderless horse grazing mid-distance at x ≈ 70% (IC-RD-05/06), and a **dark foreground over the left 45%**, where the `h2` and the section intro sit (Law 1 / RD-P5 "dark foreground, lit distance"; MEDIA-PLAN check: left-45% p95 ≤ 0.054). This band is the viewport's one HERO.
- **Athletics** (TEXTURE): a small **trail-map inset** (map paper `#dec29b`, ≤ 30% of the area, desktop): build-time contours (R-5) and a dashed `--paper-pencil` trail. A brown fog mask lifts along the trail as the Athletics rows pass (CSS `animation-timeline: view()`, 0 runtime JS; unsupported or RM → fully revealed). It has **no place names, route or numbers**; the figures stay in the confirmed rows. Meta caption `ILLUSTRATIVE MAP` beside it (on rd canvas, never on the map paper). A line of **running-shoe prints** (IC-RD-07, `--w-pencil`) draws once beside the trail, replacing v1's HP-06 footprints.
- **Leadership and Community:** plain rows. The camp is carried by the ground alone, with no icons.
- **Creative:** **authentic only.** Aryan's photographs as **tintypes** (R-2 CSS applied to the real photo; caption "Photograph: Aryan Sharma", pending his OK) and his real sketches if he supplies them (RD-7). **No generated sketch** goes near the drawing claim. A pencil **satchel strip** (IC-RD-11) shows his real kit: camera, sketchbook and charcoal, drone, running shoes, each labelled in Meta (≤ 2 words). The drone is his own and stays apart from the 3 Idiots quadcopter.
- **The WANTED handbill** (IC-RD-03 re-hosted here; RD-3 default ON; the end of Beyond, right column on desktop, stacked on mobile, ≥ 1 viewport below the band so it never shares a viewport with the golden-hour plate):
  - `WANTED` (Newsreader caps at `title` with wood-type double rules by default; Rye only if Aryan extends the font scope, FT-1), then `for questions about quantitative research` (proposed).
  - A tintype of his **authentic** portrait (RD-4) or none; then **Aryan Sharma** in Newsreader.
  - `KNOWN FOR`: confirmed Beyond facts only, verbatim from `content.ts`.
  - `LAST SEEN:` `site.location` · `REWARD: [DRAFT — Aryan]` (never renders in production unless he writes it) · `Reply by email →` linking to `#contact`.
  - Never: "dead or alive", a crimes list, a bounty number, a sketched face.
  - Paper `#e4d5b3` carries graphite, pencil, fg, accent and red only: **no ghost text and no verdicts** (ghost 4.55, kill 4.53: too tight, CALC). The link keeps the paper-accent focus ring (5.22). `rotate: -1.2deg` desktop, 0 below 640.
- **Warm family:** golden hour (media) at the top; the handbill's paper at the end; never both in one viewport.
- **Fallbacks:** RM → the plate still, the map fully revealed, prints and satchel static. M → MV-10m (4:5) below the intro; the map and prints are omitted (illustrative, desktop only); the handbill full width. NJ → all static. SD → stills only.
- **Bar:** `bars/rdr2-act.BAR.md` §B.

### SM-11 · The journal (`writing`, index on the paper plane; v2 re-host of "Parchment writing")
- **The plane:** `tone="paper"` (D-4 tokens, unchanged: `#ebe0c6`, fg 11.69, muted 6.79, ghost 5.04, accent 5.78, kill 5.01, exception 5.43), world `rdr2`. The dome seam rises in `--paper` over the rd canvas: **a page of the journal** brought into the lamplight (RD-P1 "kept by hand").
- **Desktop spread (≥ 1024):** a 6 px `--w-leather` edge at the section's inline edges (decorative) and a CSS gutter shadow down the centre make a two-page spread.
  - **Left page:** the D3 writing index as five dated entries: Meta `ENTRY I`…`ENTRY V`, the title in Newsreader `title`, the angle in Geist, a static `DRAFT` chip. **Drafts are not links** (unchanged).
  - **Right page:** a code-drawn **graphite vignette** for the hovered or focused entry, drawn once per entry per session (R-1 filter on the static layer; `easeDraw`, `dur.draw.med`). The five vignettes: a balance scale ("How I try not to fool myself") · a small town plan crossed with one graphite X, after the Blackwater page (IC-RD-01; "The kill-list"; graphite, never ember) · a rail line ("From Pine Script to a real pipeline") · a contour trail ("What wrestling and cross country taught me") · one brush-like stroke ("Mandarin and global markets"). If Aryan supplies sketches (RD-7) they replace these as `authentic` media.
- **Emphasis:** exactly one `--paper-red #9b1c14` pencil underline (6.23 on paper, CALC) under the h2 (the rdr2 `pencil-underline` slot). No accent marks at rest.
- **The h2 writes itself in pencil** (HP-05 re-hosted): a mask wipe of real Newsreader text driven by a moving graphite nib dot, ≤ 1.4 s, once at ≥ 50% in view.
- **Not here:** candles, motes, fire, the W-01…05 covers (dropped in MEDIA-PLAN v2), wax seals, handwriting fonts on entries (FT-1).
- **Fallbacks:** RM, NJ, SD and < 1024 → a single page, vignettes inline at 64 px (drawn static), the h2 present with no pencil animation.
- **Option B (RD-1 = B):** move `writing` to `act-4`. It re-dresses as HP parchment (the same tokens), the nib writes in ink, and the loader becomes LD-HP (fixture J). No component edits.
- **Bars:** `bars/writing-index.BAR.md` (v3 deltas) and `bars/rdr2-act.BAR.md` §C.

### SM-16 · By the fire (`voices`, quotes, rdr2 campfire dressing)
- **The fire (IC-RD-04):** MV-11 on `--rd-deep`: a night clearing, one small campfire in a stone ring at (0.78, 0.62), two canvas tents barely rim-lit behind it, the left 55% near-black. Its **8 s loop MV-11L** is desktop only: it plays while visible and the decoder is free, and pauses under Pause or RM. No people, no bottles, no guns.
- **The quotes:** the three teacher quotes sit left in the dark foreground (RD-P6 "people are heard, not shown"). The lead quote is **read into firelight**: HP-03′ re-hosted, a one-shot mask from `--fg-muted` to `--fg` (both AA), 1.2 s, `ease`. No glow on text.
- **The hand-off:** the fire's embers seed Card III→IV.
- **Warm family:** fire (media).
- **Fallbacks:** RM → the MV-11 still, quotes in ink. M → a focal crop of MV-11 above the quotes, no loop. SD → still.
- **Bar:** `bars/rdr2-act.BAR.md` §D.

### SM-10 · Card III→IV "Embers → the Line ignites" (derived card, kind `ignite`, D-5 long #2; v2 retune)
| p | Beat |
|---|---|
| 0–.2 | The rd deep `#0a0605` crossfades to hp deep `#070504` (two stacked ground layers, opacity only). At the Line's start a **code campfire** (R-6: 3 pre-rendered flame sprites, ≤ 12) burns low; the graphite Line lies faintly along `LINE_D` (`--w-pencil` at 30%). Upper bar: Meta `ACT IV • AFTER HARRY POTTER` and `IV / IV` |
| .2–.7 | **TA-08 ignition = LD-HP at card scale, lit from the fire:** 32–40 ember sprites (`--w-dusk` cores) rise from the fire and are assigned to `LINE_D` points (`getPointAtLength`); ember i reaches its point when p ≥ .2 + .5·i/N and **becomes a floating candle** there (the cream taper appears under the flame, IC-HP-03). A cool point leads the kindling front; the graphite is re-inked `#c9ac72` behind it, then fades as the points light: pencil becomes ink becomes light. Lower bar: the title **The Light** as IM Fell English lettering (§9.7) and the epigraph in the `epigraph` rendition: *"…if one only remembers to turn on the light."* (Q-HP-3 excerpt; the full line and its attribution to the 2004 film sit in the credits' `LINES QUOTED`) |
| .7–1 | At p > .8, **MV-07** swaps in on `dur.preview` (a state swap, never a half-mix): **the enchanted hall** (IC-HP-16): an empty hall whose ceiling dissolves into a starry night, hundreds of floating candles densest along the same curve, the architecture barely visible at the edges, no people, no banners |

- **Fallbacks:** RM/NJ/M → the MV-07 still, the captions, and the `summary`. Sprites: 0 on mobile; paused offscreen and on hidden tabs; the canvas is released on exit.
- Without the rdr2 act (fixture I), the key `idiots>hp` resolves to this card and v1's beats return (house deep → hp deep; chalk Line; the films point as point 0).
- **Bar:** `bars/ignite.BAR.md`.

### SM-12 · Last light (contact)
- The D3 contact resolution (`bars/contact-resolution.BAR.md`) on hp deep, with **MV-08** (poster: v2, one small **floating candle** whose steady flame ends a fading trail of candle points; IC-HP-03) → **MV-09** (the flame's glow breathes ≤ 15%).
- The bracket closes around the AS monogram placed over the flame (`focal` 0.85, 0.5). Copy email success fires a single 120 ms **flare**: the flame region brightens ≤ 20% via a masked overlay layer inside the MediaFrame (media, not DOM glow). It never loops.
- **Entry:** the dome seam flattens over the first 60vh (R2), and the invitation does a masked rise (R1).
- **Mid:** once the monogram is ≥ 25% in view, the bracket resolves on `easeClip`/`dur.hero`; its stroke turns aqua at arrival.
- **Settled:** the one aqua is the resolved bracket. MV-09 plays only while visible and while the decoder is free.
- **Interaction:** the magnetic Copy pill (R3), COPIED (`dur.base`), then the flare (`dur.flash`). COPIED stays literal (no "owl post" flavour on a functional status).
- **Egg (IC-HP-13, §10.3):** the palette command or typed words *Expecto patronum* while `#contact` is in view: a silver-blue stag of ≤ 400 canvas particles (our own outline, `--w-patronus`, ~70% light and 30% form) forms from ribbons, crosses the dark and dissolves into the flame in ≤ 3 s. Only when no other canvas is alive; disabled under RM (the palette says why); never over text.
- **Tokens:** `--hp-deep`, `--accent`, `easeClip`, `dur.hero`, `dur.flash`.
- **Fallbacks:**
  - RM → the poster only, resolved bracket, no flare
  - touch → no magnetism; tap copies
  - NJ → the mailto link only
  - SD → the still only

### SM-13 · Closing credits (`credits`, house world carrying the HP bookend)
- **Native scroll is the roll:** no pin, no auto-scroll, R1 rises only. Rows are centred: the role in Meta at left, the name in `body` at right.
- **The rows (derived, factual):**
  - `A PERSONAL RESEARCH JOURNAL BY` — Aryan Sharma
  - `RESEARCH, SYSTEMS & WRITING` — Aryan Sharma
  - `WORLDS BORROWED FROM` — Pirates of the Caribbean (2003–2017) · 3 Idiots (2009) · Red Dead Redemption 2 (2018) · the Harry Potter films (2001–2011) (act order; enabled works only; years verified before ship)
  - `LINES QUOTED` — derived from the quote registry entries that actually render: each work and year with its lines (e.g. *Harry Potter and the Prisoner of Azkaban* (2004): "I solemnly swear that I am up to no good." · "Mischief managed." · "Happiness can be found, even in the darkest of times, if one only remembers to turn on the light."). It is the attribution for every quote marked `attribution: "credits"`
  - `ORIGINAL GENERATED IMAGERY` — Higgsfield (models aggregated from `lib/media.ts` provenance) · original text-only prompts · recreations made for this page, no film stills or game screenshots
  - `BUILT WITH AI ASSISTANCE` — Claude (Anthropic), directed and reviewed by Aryan Sharma (proposed wording)
  - `TYPE` — Geist · Geist Mono · Newsreader, plus the display faces actually shipped, with their licences (derived from `lettering`, §9.7)
- **The legal line (H3, required verbatim, `small`):** "Fan tribute — not affiliated with Warner Bros., Disney, Vinod Chopra Films or Rockstar Games." Then (proposed): "Titles, names and quoted lines belong to their owners and appear here as personal references. Every image, drawing, map and instrument on this page was made for it." (This resolves v1 decision F-3 as "name the studios".)
- `footerLine` (verbatim), "To be continued." (proposed), **↑ Back to the opening** (`#top`, with the Time-Turner icon IC-HP-15: aria-hidden, turns 3× in 600 ms on activation, no spin under RM; it does not re-arm the intro), and the build year (derived).
- **The last line:** *"Mischief managed."* (Q-HP-2, `line` rendition in `body`; the bookend to the oath on the play screen; decision R-3), followed by a 12 px **Deathly Hallows end mark** (IC-HP-11, `--w-ink-contour`, aria-hidden; one per page).
- **Egg (IC-HP-12):** once per session, when the credits are 60% in view, a small flat **Snitch** darts for ≤ 4 s on transform-only béziers and then rests beside ↑ Back to the opening. It is a real `<button aria-label="Catch the snitch">`; catching it adds the row `SEEKER — you`. Under RM or Pause it only rests (still catchable). It never follows the cursor or covers text; no score.
- **The HP bookend:** the credits are `house` world but carry the prologue world's bookend icons (derived from `film.prologue.world`); with the prologue disabled they drop (fixture H).
- "GRADED AFTER" is deliberately **not** used: it could read as school grades (CLAUDE §2 sensitivity).
- **Settled:** static text. **Tokens:** `--color-deep`, `meta`/`body`/`small`, `--rule` row hairlines. **Fallbacks:** identical everywhere (it is text). RM and NJ show the final state.
- **Bar:** `bars/films-chapter.BAR.md` §C.

### SM-17 · Dead Eye (opt-in egg on `kill-list`; the page's one cross-world moment)
- **Why here:** Dead Eye is *mark first, fire once* (RD-P2): pre-registration marks the targets and the blind holdout is the one shot. Its red X is the site's ember = killed. It lands only on rows whose verdict really is KILLED (ICONS §0.5: an icon must carry a site truth).
- **Trigger (user-invoked only; never auto-runs; D-6):** the palette command "Dead Eye (kill-list)", or the typed word `deadeye` while focus is not in an input and `#kill-list` is ≥ 50% in view. Desktop, fine pointer only. **No single-key shortcut** (WCAG 2.1.4); the palette's "Turn off easter eggs" disables typed triggers.
- **The run (≤ 3 s total):**
  1. **Time slows:** `document.getAnimations()` → `playbackRate .25`; the active video `.25`; canvases read `--time-scale`.
  2. **The grade:** the section's media layers take the Dead Eye grade (sepia, red vignette; `--w-deadeye` in media only) and the ground shifts to `--rd-deadeye-bg #1a0907` (CALC: ink 16.36 · muted 5.59 · ember 6.59). **Text colours never change.**
  3. **The marks:** an ember X (two 1.5 px strokes, 90 ms each, 160 ms stagger) locks onto each KILLED row's recorded reason. Survivors and EXCEPTION rows are never marked; the count is derived from data.
  4. **Fire once:** 400 ms after the last mark (or on Enter) every killed row strikes at once (the existing ember strike), the X's fade, and time returns to 1× over 300 ms.
  5. **The end line** in a polite status toast (caption rendition): *"We can't change what's done, we can only move on."* — Arthur Morgan, *Red Dead Redemption 2* (Q-RD-2, COMMUNITY; verify in-game).
- **A11y:** Esc aborts at any step. The palette entry carries `aria-pressed`. One polite status: "Dead Eye: N killed ideas marked" (proposed). No audio, no heartbeat.
- **RM / Pause:** no time-scale and no sequence: the static X's and the ground shift show until Esc. **M / coarse:** unavailable (hidden from the palette).
- **Never:** a gun, reticle, crosshair cursor, gunshot, blood, or a mark on a survivor. At rest the ledger is exactly as SM-8 specifies.
- **Bar:** `bars/rdr2-act.BAR.md` §E and `bars/eggs.BAR.md`.

---

## 8. The loader system (N2; v2: four loaders)

Four original, code-built loaders share one grammar. The loader is a `WorldLoader` primitive with `world`, `size` (`mini` 48 px · `card` 96–120 px · `route` 160 px), `mode` (`indeterminate | determinate | complete | static`) and `progress` (0–1). It is **world media**: aria-hidden, no text inside the SVG or canvas, and luminous points drawn only as pre-rendered sprites. v2: each loader may use its world's real icon (A-6), recreated in code.

| Loader | World | Motif | Progress element | Indeterminate | Complete |
|---|---|---|---|---|---|
| **LD-PC "Jack's compass"** | pirates | **Our own recreation of Jack's compass** (IC-PC-02): an octagonal lidded brass case (1.5 px `--w-brass`), a 32-point dial ring (`--w-moon`, 4 long cardinals, a fleur-de-lis north), **the red arrow** (`--pir-compass-red #a8453a`, darker than ember) on a brass pivot. Built from public-domain compass conventions, never traced from a prop photo | A dashed brass course line drawn to a waypoint (`pathLength = progress`, direct) | The arrow hunts ±35° around the heading, re-excited every 1.8 s on `springNeedle` ("it points to what you want most") | The arrow settles on the final bearing (`springNeedle`), then one 120 ms moon-white tip flash (IC-PC-09; area < 0.1% of the viewport) |
| **LD-3I "The honest gauge"** | idiots | A blueprint gear train in the **jugaad register** (IC-3I-04: visible bolts): a 12T drive gear and an 8T driven gear meshing at a true 3:2; a pinion drives a rack pointer along a dimension line (bp-line `#cfe8f7`; optional `#0f2c47` panel) | The rack pointer: x = progress × L. The gears turn **exactly** as the rack requires (θ₈ = x / r_pinion; θ₁₂ = −θ₈ × 8/12) | The gears turn at 30°/s with the rack parked (clearly "working", not progressing) | One chalk circle (Rancho's circle) around the end tick (`easeDraw`, 0.7 s) |
| **LD-RD "Plate & trail"** (new) | rdr2 | A **tintype plate** (6 px radius, `--w-bone` hairline, inset vignette), a **graphite trail** across its lower third over 6 hachure arcs, and a **campfire point** at the trail's end (R-6 sprites). `mini` = the trail and fire only | `trail.pathLength = p` **and** the plate's development threshold = p (R-2): the image developing *is* the progress (RD-P4) | The plate breathes between 10% and 22% developed at 0.4 Hz; the trail is parked at 12%; the pencil-tip dot ticks every 0.6 s | Fully developed; the bone border draws (0.5 s); the campfire kindles (≤ 12 sprites, 3 frames, no flash) |
| **LD-HP "Light finds the ink"** | hp | `LINE_D` as a faint ink stroke (`#c9ac72` at 35%). A cool light point (`#eaf6ff` core sprite: the wand-tip light, never the wand) travels it; **floating-candle** sprites kindle behind (IC-HP-03) | The light's position `pathLength = progress`. The ink behind it reaches full strength, and a candle lights at every ⅛ (card scale: 32–40 points) | The light breathes at the Line's start (opacity .6 ↔ 1 at 0.5 Hz), and the first 12% of ink holds drawn | All candles lit. The light rests at the end and becomes the last warm point |

### 8.1 Uses (a): REAL loading states (real progress or honest indeterminate)
| Where | Loader | Progress source | Text alternative |
|---|---|---|---|
| Intro: Play pressed before the flight is playable | LD-HP `card` | `video.buffered / duration` | `role="status"`: "Loading the flight…" (visible Meta) |
| Journey sequence decoding | LD-PC `mini` | decoded frames / 72 | none (decorative; the still and captions carry content) |
| Any world `MediaFrame` still pending decode after 400 ms | the section world's loader, `mini`, centred in the reserved box | indeterminate | none (aria-hidden; media is decorative) |
| `app/writing/[slug]/loading.tsx` (Writing is rdr2) | LD-RD `route` in a letterboxed full-viewport card, with the act's title lettering above it | indeterminate (Suspense) | `role="status"`: "Loading essay…"; one **TIP** (§8.3) as plain text *outside* the status |
| Chapter detail routes, if added (Act II) | LD-3I `route` | indeterminate (Suspense) | `role="status"`: "Loading chapter…". **After the 5 s idle freeze** (real loads only), the status updates once to *"Aal izz well — still loading."* (Q-3I-1, `line` rendition; never on an error, which is never "all well") |

**Rules for real loaders:**
- Show only after a 250–400 ms delay; never flash on fast loads.
- Never display a fake percentage. Where progress is unknown, use indeterminate.
- Never cover content that is already readable. Mini loaders sit only in empty reserved media boxes.
- Any loader in parallel with content stops moving after 5 s and holds a static frame (WCAG 2.2.2).
- The owning loader is always `worlds[worldOf(owner)].slots.loader`: moving `writing` to act-4 makes its route loader LD-HP (fixture J).

### 8.2 Uses (b): scroll-driven, non-blocking loading-reel interstitials
- **They are the act cards.** Every derived act card uses the loading-reel grammar:
  - letterbox (the ground is the bars)
  - upper bar: Meta act label plus a reel mark (`III / IV`)
  - frame: the transition plus the incoming world's loader motif
  - lower bar: act title (world lettering, §9.7), optional epigraph **or TIP**, and the **progress element = scroll progress through the card**
- **Honesty:**
  - The word "loading", any spinner semantics, any percentage and `role="status"` **never** appear in an interstitial. A TIP is not a status.
  - They never pin beyond their budget, never delay, and never block input.
  - Scrolling back reverses them exactly.
- **Derivation** (from the manifest, §12.3). A card is inserted before the first section of each act run. Its `kind` is `opening` for act 1, else `transitions[prevWorld>nextWorld]`, else `reel` (generic) if the worlds differ, else `title` (same world).
  - `reel` = the generic interstitial: 0 travel, natural passage, the incoming world's `cardStill` crossfaded in on `dur.preview` at p = .5, and its loader motif driven by passage progress.
  - `tintype` = a reel-class card with its own choreography (SM-14): 0 travel, passage-driven.
  - Reordering or removing sections therefore always yields the right loader for the incoming world.
- **Reduced motion, Pause, no JS:** a **static title card**: letterbox, act label, act title, the motif in its `complete` state, epigraph or TIP, and the `summary` (sr and visible `small`).
- **No flashing.** No luminance change over 10% across more than 25% of a 10° field more than 3 times per second (WCAG 2.3.1). The only "flash" is the LD-PC tip, well under the area threshold.
- **Bar:** `bars/loaders.BAR.md` (the system) and `bars/act-cards.BAR.md` (the interstitials).

### 8.3 TIPS (LD-RD and Card II→III; Aryan's own words)
Tips are a loading-screen idiom (IC-RD-08). **Every tip is Aryan's own rule, verbatim from `lib/content.ts` (`confirmed`), or a marked `proposed` edit.** Film or game lines are never tips.

| # | Tip | Source · status |
|---|---|---|
| 1 | "Treat every backtest as guilty until proven innocent." | REPO line (v1 card epigraph; `content.ts` reads "I treat every backtest…") · confirmed · Card I→II's epigraph, so never on card III |
| 2 | "The result stands; no re-optimization after the fact." | `gauntlet[0]` · confirmed · **Card II→III** (mark first, fire once) |
| 3 | "The frozen rule is run on the holdout exactly once, no retuning." | `gauntlet[1]` · proposed ("it" → "the holdout") |
| 4 | "Zero-cost runs are banned." | `gauntlet[4]` · confirmed |
| 5 | "Failed strategies are never retuned. Each ships a written post-mortem." | `gauntlet[6]` · confirmed |
| 6 | "Target CPCV Sharpe 1.0–1.5 · anything > 2.0 is a red flag." | Optuna metric + note (the Sharpe-2.0 rule) · proposed composite |
| 7 | "Models are instruments, not idols." | `site.principleCapsule` · confirmed |
| 8 | "Do the work well and hold the outcome loosely." | `principles[1]` · confirmed |
| 9 | "Good judgment is trained, not issued at birth." | `principles[0]` · confirmed |
| 10 | "Most failures I have seen were failures of attention before they were failures of math." | `principles[4]` · confirmed |

- **Verify at build:** the validator checks every `confirmed` tip byte-for-byte against its `content.ts` source (STUDY §7.4 transcribed them; the source file wins).
- **Choice is deterministic** (`hash(pathname) % n` over the eligible tips), never `Math.random()` at SSR (no hydration mismatch).
- Tips render in house type (`lead` on cards, `small` on route loaders), never in a display face.

---

## 9. The world system

### 9.1 Worlds (tokens in DESIGN v3 §1.3; all AA CALC)
| World | Work · kind · verb | canvas / raised / deep | Signature decorative inks (non-text) | Warm family | Grid / lattice |
|---|---|---|---|---|---|
| `house` | — | `#0b0f12` / `#121820` / `#05080a` | — | none | none |
| `pirates` | Pirates of the Caribbean · film · Navigation | `#0a1519` / `#10202a` / `#050b0d` | brass `#a8834a` (5.30), moon `#a9bcc0` (9.38), storm `#5f6e75` (3.50, never text), **compass red `#a8453a`** (3.15 canvas / 3.37 deep; never on raised, 2.83) | lantern (the Pearl's; media only) | rhumb lattice ≤ 4% (desktop) |
| `idiots` | 3 Idiots · film · Explanation | `#0d1513` / `#141d1b` / `#060a09` (a green-black board) | chalk `#f2efe6` (16.1), bp-line `#cfe8f7` (14.6), graphite `#8b949e` (6.02); blueprint panel `#0f2c47` | morning daylight (media only) | graph grid ≤ 6%, fading to 0 by the ledger's last row |
| **`rdr2`** | **Red Dead Redemption 2 · game · Reflection** | **`#130d0b` / `#1c1411` / `#0a0605`** (an oxblood-umber dusk); overlay `#231915`; Dead Eye ground `#1a0907` (egg only) | bone `#e3d6bd` (13.41), **pencil `#a39686` (6.66, the Line)**, sage `#8f9c78` (6.60), leather `#b5653a` (4.48), dusk `#e0a458` (sprites/media only), deadeye `#d64236` (media grade only; never text, never the X) | golden hour (media), paper (the journal, a DOM plane), fire (media, sprites): one per section | none (the dark foreground is the texture) |
| `hp` | Harry Potter · film · Revelation | `#0f0c09` / `#18130e` / `#070504` | ink-contour `#c9ac72` (8.94), patronus `#b9d9f2` (13.25), lumos core `#eaf6ff` (sprites only) | candle (media, sprites) | none |
| paper plane | (Writing, D-4: **the journal page** in rdr2; HP parchment under option B) | `#ebe0c6` / `#f3ecda` / `#f7f2e4` | fg `#2e2318` 11.69 · muted `#5a4632` 6.79 · ghost `#6b5a47` 5.04 · accent `#115e59` 5.78 · kill `#b42318` 5.01 · exception `#7a4f00` 5.43 · **pencil `#4a4036` 7.71 · red `#9b1c14` 6.23** | paper | none |

- Text tokens (ink, stone, muted, aqua, ember, amber) pass AA on every world canvas, raised and deep (DESIGN v3 §1.3.1). rdr2 CALC: canvas ink 16.30 · stone 8.60 · muted 5.57 · aqua 10.35 · amber 10.73 · ember 6.57; overlay muted 4.97 (the tightest cell, still ≥ 4.5).
- Two extra rdr2 papers are **objects, not planes**: the handbill `#e4d5b3` (no ghost text, no verdicts) and the trail-map paper `#dec29b` (graphite/pencil only; no text on it in v2).
- `lib/worlds.ts` already carries `rdr2` with `ready: false, loader: "plain"` (Phase 1 placeholder). This spec supplies the palette (DESIGN v3 §1.3) and the loader (`plate-trail`), so the build flips it to `ready: true`.

### 9.2 Transitions derived from data
`lib/film.ts`:
```ts
transitions: { "hp>pirates": "flight", "pirates>idiots": "seam", "idiots>rdr2": "tintype",
               "rdr2>hp": "ignite", "idiots>hp": "ignite" /* used when rdr2 is disabled */, "*": "reel" }
longCards:   ["pirates>idiots", "rdr2>hp", "idiots>hp"]   // the validator counts DERIVED long cards (≤ 2), not list entries
```
- `house` is **transparent**: it never triggers a transition. The "previous world" is the last non-house world before the card. So Card II→III after the intermission resolves `idiots>rdr2` → `tintype`, and with the rdr2 act disabled Card II→III resolves `idiots>hp` → `ignite` (v1 exactly).
- `flight` is valid only for the prologue → hero pair.
- `tintype` is reel-class: 0 travel, passage-driven (SM-14). It never counts as a long card.
- An unknown pair gets `reel`, plus a validator warning ("generic transition used for hp>idiots").
- `film.intensity` or a section's `worldIntensity` below `full` downgrades a long card to its static title card with 0 travel.

### 9.3 Title cards and letterbox rules
- **Letterbox:** ≥ 640 px wide, 2.39:1, on the incoming world's `deep`. The ground *is* the bars: no bar elements.
- **Upper bar:** Meta only (act label, reel mark `n / 4`). **Lower bar:** the act title (the world's **lettering**, §9.7, inside a real `h2`) plus at most one line: an epigraph (`lead`, or the `epigraph` rendition for a film line) **or** a TIP (Meta `TIP` + `lead`). Captions are never over moving media.
- **Type:** ≤ 3 styles (`meta`, the title lettering, `lead`/`epigraph`). The work's title appears in the Meta credit, in house type.
- **Structure:** each card is `<section id="act-n" aria-labelledby>` with an `h2` = the act title (`<h2 id><span class="sr-only">The Frontier</span><svg aria-hidden>…</svg></h2>` when lettering is outlined). Cards are nav-enabled in the menu and palette (group headers), but they are not numbered sections.
- **Below 640 px:** letterbox off, the static composition, 0 travel.

### 9.4 Naming and quoting (v2; replaces the v1 allow-list)
The works are named openly (A-2, A-6). The rules that remain are about **type, attribution, data and hygiene**, not about hiding the works.

| Allowed | Where and how |
|---|---|
| Work titles, character names, spell names, place names | Anywhere in copy, cards, loaders, credits, alt text, code and comments. Titles are set **in house type only** (Newsreader `title` for `h3`s, Meta for credits); never in a lookalike, logo or fan face |
| Meta credits | `AFTER <TITLE IN CAPS>` (prologue credit line, opening rows, card upper bars, header-free) |
| Act titles | The page's own words ("The Crossing", "The Workshop", "The Frontier", "The Light"), set in the world's lettering (§9.7) on cards and the Journey cartouche; Geist `heading` on opening rows; Meta in the header |
| Lines from the works | Verbatim, through `<FilmQuote id>` only, with attribution (§9.6). Never as a tip, never as a caption to a metric, never as Aryan's own words |
| Spell words and game labels | As **aliases** and egg triggers (Lumos, Nox, Accio, Obliviate, Expecto patronum, Dead Eye, Parley). The accessible name and the functional label stay literal ("Pause motion") |

**Never (hygiene and honesty, not squeamishness):**
- The page `<title>`, meta description, OG image and the **static** favicon: name-first, no film names or marks. (The bolt favicon swap during the flight is a transient runtime egg.)
- Research data (metrics, verdicts, labels, gates, schematics) in a display face, a film colour or a film mark.
- "Inspired by" branding, a logo or wordmark (including hand-redrawn replicas, H2), sample "reasons", ghostwritten aphorisms.

### 9.5 Header, menu, palette
- **Header:** `[AS]` · **act label** (Meta, `--fg-muted`, not `aria-live`; empty at the top; `ACT I • THE CROSSING` / `ACT II • THE WORKSHOP` / `INTERMISSION` / `ACT III • THE FRONTIER` / `ACT IV • THE LIGHT` / `CREDITS`; hidden below 640 px) · Work pill · waveform Pause · Menu. There is **no compass, no NOW SHOWING, no progress bar and no rail** (the compass is never chrome).
- **Pause (IC-HP-09):** the tooltip reads "Nox — pause motion" / "Lumos — resume motion". The accessible name stays "Pause motion" / "Resume motion" (label-in-name). On Nox, the world light in *media* dims 10% over 300 ms, then motion stops. Lumos never overrides OS reduced motion; it only undoes the user's own Pause.
- **Menu and palette** are grouped by act (derived), with work credits in the group headers ("Act III · The Frontier — after Red Dead Redemption 2"). The palette adds "Skip to Act …", "Watch the intro again" (clears `intro-seen` and re-arms, not under RM), "Pause motion" (aliases Nox/Lumos) and the egg commands (§10.3), plus **"Turn off easter eggs"** (session).

### 9.6 Copy table, quote registry and DRAFT policy (`lib/film.ts` `copy`, `lib/quotes.ts`)
Every new string has a status:
- `confirmed`: Aryan's existing words (`content.ts`, REPO). Renders everywhere.
- `proposed`: new microcopy about **the page** (labels, act titles, the borrowed lines, "Play", tips edited from his words) **and every film/game quote**. Renders in dev and preview. **The production build fails** until Aryan signs the proposed list (`film.copySignedOff: true`, or per-string `status: "confirmed"`).
- `draft`: anything about **Aryan himself**: why a work matters, act loglines, the handbill REWARD, personal notes, **any sentence that ties a film or game to his own life** (H4). A DRAFT renders only in dev and preview, with a visible `DRAFT` Meta chip. **The production build fails if any draft would render**; a draft-reason screen ships *silent*.
- **Claude supplies prompts, never phrasings** for `draft` fields. There are no sample sentences and no aphorisms.

**The quote registry (`lib/quotes.ts`; new).** Each entry: `{ id, text (verbatim), work, year, speaker?, verified: "VERIFIED" | "COMMUNITY", excerpt?: true, status: "proposed" }`. A quote renders **only** through `<FilmQuote id rendition attribution>`:
- `rendition`: `caption` (a Meta block: data-adjacent or crowded viewports) · `epigraph` (Newsreader italic at `lead` size: the intro and card lower bars) · `line` (inherits the host block's style: the credits, the loader status).
- `attribution`: `inline` (Meta `— SPEAKER, WORK (YEAR)` in the same block) or `credits` (the credits' `LINES QUOTED` row; allowed only for the intro oath, card epigraphs and the credits' last line).
- The lint fails on any UI string that matches a registry text but isn't rendered through `FilmQuote` (no unattributed quotes). COMMUNITY quotes must be checked in the film or game before `status: "confirmed"`.

| Key | Status | Text / prompt |
|---|---|---|
| `act.1.title` / `2` / `3` / `4` | proposed | "The Crossing" / "The Workshop" / "The Frontier" / "The Light" |
| `act.n.logline` | draft | `[DRAFT — Aryan: one line, in your words, on what this act is about. Optional.]` |
| `opening.h2` | proposed | "A research journal in four acts." (count derived) |
| `intro.title` | proposed | "ARYAN SHARMA • A RESEARCH JOURNAL IN FOUR ACTS" |
| `intro.play` / `intro.skip` / `intro.desc` | proposed | "Play" / "Skip intro" / §5.2 description |
| `intro.loading` | proposed | "Loading the flight…" |
| `films.h2` / `films.lead` | proposed | "Three films and a game" / "This page borrows its light from three films and a game. Here is what it took from each." (derived words) |
| `films.pirates.borrowed` | proposed (site fact) | "On this page it became the course line through the Journey and Jack's compass, which settles on each bearing." |
| `films.idiots.borrowed` | proposed (site fact) | "On this page it became the blueprints: every schematic in Act II draws the real system, and the chalk circles the caveat, never the number." |
| `films.rdr2.borrowed` | proposed (site fact) | "On this page it became the journal and the fire: graphite that keeps the record, a plate that develops while you wait, and the campfire where the voices sit." |
| `films.hp.borrowed` | proposed (site fact) | "On this page it became the light: the play screen, ink that draws itself, and the candles that come on in Act IV." |
| `films.<id>.line` | proposed (quote) | Q-PC-2 · Q-3I-1 · Q-RD-1 · Q-HP-4 (§10.2) |
| `films.<id>.reason` | **draft** | `[DRAFT — Aryan: what you took from this film or game, 1–2 sentences in your own words. Prompts: what do you remember first? Where does it show up in how you work? Leave empty to ship this screen without a reason.]` |
| `card.2.epigraph` | confirmed | "Treat every backtest as guilty until proven innocent." (REPO) |
| `card.3.tip` | confirmed | tip #2 (§8.3) |
| `card.4.epigraph` | proposed (quote) | Q-HP-3 excerpt, `epigraph` rendition, credits attribution |
| `beyond.handbill.sub` / `.reward` | proposed / **draft** | "for questions about quantitative research" / `[DRAFT — Aryan: a reward line in your words, or leave empty]` |
| `beyond.map.caption` | proposed | "ILLUSTRATIVE MAP" |
| `beyond.photo.caption` | proposed | "Photograph: Aryan Sharma" (pending his OK) |
| `deadeye.status` | proposed | "Dead Eye: N killed ideas marked" |
| `credits.ai` | proposed | "Claude (Anthropic), directed and reviewed by Aryan Sharma" |
| `credits.legal` | **required (H3)** | "Fan tribute — not affiliated with Warner Bros., Disney, Vinod Chopra Films or Rockstar Games." + the two proposed sentences (SM-13) |
| `credits.end` | proposed | "To be continued." then Q-HP-2 "Mischief managed." (R-3) |
| `pause.tooltip` | proposed | "Nox — pause motion" / "Lumos — resume motion" |

### 9.7 World display fonts: lettering (A-8)
**Scope (the only places a world face may appear):** act titles (card lower bars; the Journey cartouche "THE CROSSING"), **loaders** (the `route` card's title lettering; never text inside a loader SVG) and **easter eggs** (the Marauder's Map, the 404 variants, egg toasts). **Never:** the name, body, Meta, labels, verdicts, metrics, tips, quotes, figure labels or any research data (Geist / Geist Mono / Newsreader only).

| World | Face | Licence (verify the file) | Ship mode | Strings |
|---|---|---|---|---|
| pirates | **Pirata One** (Google Fonts) | OFL 1.1 | A: self-host woff2 subset | "THE CROSSING" (cartouche); pirates 404 variant |
| idiots | **Kalam** (Indian Type Foundry) | OFL 1.1 | A | "The Workshop" (Card I→II); LD-3I route card; the 3 Idiots 404 variant |
| rdr2 | **Chinese Rocks** (Ray Larabie / Typodermic, the base of the RDR logo lettering) | Free desktop licence: fixed graphics OK; **no embedding, no font-file sharing** | **B: outline-only** (the TTF lives in git-ignored `design-src/fonts-personal/`; `scripts/outline-lettering.mjs` writes SVG paths to `lib/lettering.generated.ts`) | "THE FRONTIER" (Card II→III); LD-RD route card. **Never** the words "Red Dead Redemption" (that would be a logo replica, H2) |
| rdr2 (egg only) | Rye (Google Fonts) | OFL 1.1 | A | the Dead Eye toast header "DEAD EYE" (optional); "WANTED" only if FT-1 extends the scope |
| hp | **IM Fell English / English SC** (Igino Marini) | OFL 1.1 | A | "The Light" (Card III→IV); LD-HP route card; the Marauder's Map room labels; the 404 map |

- **Budget:** ≤ 1 display face per viewport, counted as one of the ≤ 3 type styles; never smaller than the `title` step; AA on its fill; each woff2 subset only the glyphs used; `font-display: optional`, `preload: false`, loaded by the owning component only (never on the LCP path); all display fonts ≤ 24 KB total; each outline SVG ≤ 3 KB.
- **Mode C (never):** the RDR2 "Redemption" custom face, Hapna and mod "RDR2 font packs" (ripped), *Lipstick* (the 3 Idiots poster face, commercial), the HP logo lettering, the POTC wordmark, any font extracted from game or film files.
- **Data:** `lib/film.ts` `lettering: [{ id, text, face, mode, slot: "act-title" | "loader" | "egg" }]`. The validator fails a `lettering` entry whose slot is outside the scope unless `fontScope.extended` is set by Aryan (FT-1), and fails any tracked `.ttf/.otf/.woff/.woff2` without its licence file beside it (H2).
- **Fallback:** a missing outline or font → the act title renders in Newsreader `title` (fixture L). Nothing depends on a display face.

---

## 10. Motif registry, icon map and easter eggs

**Status legend:** KEEP (as Kimi specified, re-hosted) · AMPLIFY (bigger role) · MOVE (a new host) · RETUNE (behaviour changed) · DROP (with reason) · NEW. v2 changes are in bold.

| Id | Motif | Status | Host / rule |
|---|---|---|---|
| HP-01 | Ink draw-on strokes | KEEP | Intro bracket draw-on; Act IV dividers (principles). ≤ 40 paths/scene |
| HP-02 | Candle point-light field | RETUNE → TA-08 + intro candles | **v2: literal floating candles are allowed (IC-HP-03)**: the intro (≤ 40 sprites), the ignite (embers become candles), MV-07, MV-08. Never as ambient chrome, never in the Pirates hero, never flicker as UI feedback |
| HP-03 | Lumos light sweep on text | DROP on text (Law 1) → **HP-03′** | HP-03′ = a one-shot mask from `--fg-muted` to `--fg`; **MOVE to `voices` (rdr2): "read into firelight"** |
| HP-04 | Parchment | AMPLIFY → **MOVE** | The warm paper plane (D-4 tokens) is **the rdr2 journal page** (SM-11); HP parchment only under RD-1 option B |
| HP-05 | Ink writes itself | **RETUNE** | The Writing h2 is written by a **graphite nib** (rdr2); ink under option B. Never a script font |
| HP-06 | Footprint traces | **MOVE → RD-04 / IC-RD-07** | Running-shoe prints beside Athletics (rdr2). The Marauder's-Map footprints are the visitor's own trail inside the Map egg (IC-HP-06) |
| HP-07 | Patronus ribbons | KEEP | Principles titles, once on entry, no replay; `#b9d9f2`. **The stag form is now an egg (IC-HP-13, contact)**; the ribbons stay abstract |
| HP-08 | Un-draw exit | DROP | P2 complexity, no gain |
| HP-09 | Lumos traverse over headings/name | **BANNED** | mustAvoid: light never runs across the name. (Lumos/Nox survive as Pause aliases, IC-HP-09) |
| HP-10 | Lumos lens light pool | DROP | Glow at the bracket breaks Law 1 |
| HP-11 | Far-to-near kindling | KEEP | Ignite order (**now from the campfire's embers**); intro candle arrival |
| PC-01 | Compass | **AMPLIFY = Jack's compass (IC-PC-02)** | Journey (TA-09), the opening card, LD-PC and the films Pirates finale, **with the red arrow** `--pir-compass-red` and the lid star chart. **Never in chrome** |
| PC-02 | Chart / rhumb lattice | KEEP | Act I grounds, ≤ 4%, desktop only; **the cartouche THE CROSSING (IC-PC-07)** |
| PC-03 | Deep-sea grade | KEEP (as tokens) | The pirates world grounds |
| PC-04 | X-stamp | **RETUNE = the treasure X (IC-PC-06)** | Journey waypoint 4 only, brass, one per page |
| PC-05 | Ring stack | **REVIVED as an option (IC-PC-10)** | Opening-card rings that align at p = 1 (FLAG); never required information |
| PC-06 | Course-line progress | MOVE | A local course in Journey, the opening card and LD-PC. No page progress bar |
| PC-06′ | Moonlight hover | DROP | Unregistered; voices stays human |
| PC-07 | Lantern-in-fog layers | **RETUNE = the Pearl's stern lantern (IC-PC-01)** | In MV-01/MV-03 and F-PC, as media |
| PC-08 | Commit flash | KEEP (the "green flash" wink, IC-PC-09) | LD-PC completion only, 120 ms, tiny area |
| PC-09 | Needle points at intent | KEEP (IC-PC-03) | Journey waypoints and opening-card rows |
| PC-12 | Voyage image sequence | KEEP | Journey desktop (MV-05a is now a harbour at night) |
| PC-13 | Wake brightens with velocity | KEEP | Hero media only |
| 3I-01 | Blueprint FIG panels | AMPLIFY | Chapters, the systems figure, Card I→II FIG. 0, films 3I finale; **jugaad register (IC-3I-04)** |
| 3I-02 | Chalk marks | KEEP | Act II only; ≤ 3 per section |
| 3I-03 | Real-architecture schematics | AMPLIFY | Chapter covers **are** schematics (no generated covers) |
| 3I-04 | Gear pair | AMPLIFY → LD-3I | The honest gauge |
| 3I-05 | Callout leaders | KEEP | Chapters; hidden below md |
| 3I-06 | The Settle | **RETUNE: `aalIzzWell`** | Non-interactive entrances in Act II only, as a two-beat settle (IC-3I-03) |
| 3I-07 | Grid → open air | KEEP | systems → ledger |
| 3I-08 | FIG numbering | NEW (from crafts) | Meta `FIG. n • …` derived per section |
| 3I-09 | Circled result (Rancho's circle, IC-3I-02) | NEW | The gauntlet tally, the card gauge end, the films finale. **A caveat, never a metric** |
| TA-01 | Act cards | NEW (spine) | Derived loading-reel interstitials (**four**) |
| TA-02 | The Line | NEW (spine) | §4 (**five materials**) |
| TA-03 | Header act label | NEW | §9.5 |
| TA-04 | Opening card rows | NEW | SM-3 |
| TA-06 | Four bearings | NEW | About pillars |
| TA-07 | Chalk around the caveat | NEW | Chapters |
| TA-08 | Ignition sprites | NEW | Card III→IV (**embers → candles**) |
| TA-09 | Journey instrument | NEW (**= Jack's compass**) | SM-4 |
| IN-01 / IN-02 | Play screen / broom flight and trail | NEW (N1) | §5 (**castle, lake, candles, broom**) |
| LD-PC / LD-3I / **LD-RD** / LD-HP | Loaders | NEW (N2) | §8 |
| FC-01 / FC-02 | Films screens / Seen here in | NEW | SM-9 (**four screens**) |
| CR-01 | Credits roll | NEW | SM-13 |
| **RD-01** | **Graphite Line** | NEW | The rdr2 `line` material (§4): Card II→III, the films RDR finale, LD-RD, the trail map |
| **RD-02** | **Tintype develop** (R-2) | NEW | Card II→III, LD-RD, the Creative tintypes |
| **RD-03** | **Trail map with fog lift** (R-5) | NEW | Beyond · Athletics; `ILLUSTRATIVE`; no data |
| **RD-04** | **Running-shoe prints** (IC-RD-07) | NEW | Beyond · Athletics, once |
| **RD-05** | **Journal spread + graphite vignettes** (R-1, IC-RD-01) | NEW | Writing |
| **RD-06** | **Campfire** (MV-11/11L; R-6 sprites) | NEW | Voices; the ignite's source; the LD-RD complete state |
| **RD-07** | **The handbill** (R-4, IC-RD-03) | NEW | End of Beyond |
| **RD-08** | **TIP line** (IC-RD-08) | NEW | Card II→III; LD-RD route |
| **RD-09** | **Dead Eye** (R-3, IC-RD-02) | NEW (egg) | `kill-list`, opt-in (SM-17) |
| **RD-10** | **Satchel strip** (IC-RD-11) | NEW | Beyond · Creative/Athletics |

**RDR2 principles (STUDY §1, §4; cited as RD-P1…P8):** P1 kept by hand · P2 mark first, fire once · P3 drawn only where you've been · P4 develop, don't load · P5 dark foreground, lit distance · P6 people are heard, not staged · P7 one word, one name, one number · P8 shown, not scored (**nothing about Aryan is ever metered**; no honor meter).

### 10.1 Restraint rules, re-tuned for emphasis (per viewport unless noted)
1. **One world** per viewport. The exceptions are mid-card (two worlds by design), the moment one films screen scrolls into the next, and the ≤ 3 s Dead Eye egg.
2. **At most one ambient world-light system**: the hero loop, *or* the intro canvas, *or* the ignite canvas, *or* the fire loop (MV-11L), *or* the contact loop, *or* an egg canvas (the Patronus).
3. **One aqua UI mark at rest** (the bracket group, an active gate, or the seam line in its window). Ember = killed only (the Dead Eye X is ember because it marks KILLED rows); amber in the DOM = EXCEPTION only; the compass arrow is its own darker red and never sits beside ember.
4. **At most one emphasis cluster** per section (chalk circle / ribbon set / brass X / pencil underline); **≤ 3 chalk marks per section**.
5. Blueprint panels ≤ 40% of a section's area; the grid ≤ 6%; the lattice ≤ 4%; the trail map ≤ 30%.
6. **Canvas singleton** page-wide (intro, sequence, ignite, Patronus egg: never two alive). **One video decoder** page-wide (IN-02, MV-03, MV-11L, MV-09: never two playing).
7. **Sprites:**
   - **Intro:** ≤ 64 live at any moment. At rest ≤ 40 candle sprites. On launch they stream out and are culled to ≤ 16 before the trail (≤ 48 on desktop, ≤ 24 on mobile) peaks.
   - **Ignite:** ≤ 40 embers/candles (+1 light). **Loaders:** ≤ 40 each (LD-RD fire ≤ 12). **Patronus egg:** ≤ 400 particles, desktop only, only when no other canvas is alive.
   - All sprites are pre-rendered, DPR ≤ 2, and paused offscreen and on hidden tabs.
   - **Mobile:** 0, except the intro's lite trail (≤ 24).
8. **Names and quotes** follow §9.4 and §9.6.
9. **Instruments, compasses, gears, charts, maps, journals, posters and diagrams** are code only (Law 2).
10. **Warm families:** exactly one per viewport: candle, lantern, morning light, golden hour or fire (media), or paper (the journal plane, the handbill: DOM planes).
11. **Icon tiers (ICONS §0.5):** ≤ 1 **HERO** icon per viewport, and it *is* that viewport's hero motif; **TEXTURE** stays within the caps above; **EGG** is opt-in, off the reading path, never required to understand anything, and an auto-running egg runs ≤ 4 s once per session. **At rest a viewport shows only its own world's icons.** Every icon must carry a site truth or be TEXTURE at most. The admissions-reader test decides ties: "charming and well made, or childish?"

### 10.2 Icon map by section (placement authority; recipes in ICONS.md)
| Section | HERO (≤ 1 per viewport) | TEXTURE | EGG | Lines (§9.6 ids) |
|---|---|---|---|---|
| `intro` | the castle across the Black Lake with floating candles and the broom (IC-HP-01/02/03/04), IN-01 → IN-02 | candle sprites; the owl crossing the moon (IC-HP-17, optional) | the bolt favicon during the flight (IC-HP-10) | Q-HP-1 oath, `epigraph` |
| `top` | the name in front of the bioluminescent sea (IC-PC-08) | the Black Pearl and its stern lantern (IC-PC-01, a discovery), the Jolly Roger at unreadable scale only (IC-PC-12) | — | — |
| card `act-1` | Jack's compass settling on row I (IC-PC-02/03) | the green-flash tip (IC-PC-09); optional rings (IC-PC-10) | — | — |
| `about` | — | the four bearings (TA-06), rhumb lattice | — | — |
| `journey` | Jack's compass (IC-PC-02) | the harbour at night (IC-PC-11), the cartouche THE CROSSING (IC-PC-07), the cursed medallion (IC-PC-04), the brass X (IC-PC-06) | — | Q-PC-1 `NOW • BRING ME THAT HORIZON.` (caption) |
| card `act-2` | the storm wiped into the blueprint | Kalam act title | the hidden kraken (IC-PC-05, in media) | — (REPO epigraph) |
| `work` | the dawn board with the gates in chalk (IC-3I-01) | the colonnade windows (IC-3I-09), Rancho's circle (IC-3I-02), the `aalIzzWell` settle (IC-3I-03) | the quadcopter lift on 7/7 (IC-3I-08) | Q-3I-2 (caption, excerpt) |
| `trading-algos` / `optuna-screener` / `systems` | the schematic (3I-03) | the jugaad register (IC-3I-04); the space-pen wink in `systems` (IC-3I-06) | — | Q-3I-3 under the Optuna FIG (caption) |
| `experiment` | — | — (density valve) | — | — |
| `kill-list` | the Lens Index (D3) | — (austerity, D-6) | **Dead Eye (IC-RD-02, SM-17)** | Q-RD-2 in the Dead Eye toast only |
| `films` | one per screen: the Pearl at anchor · the lake and the yellow scooter (IC-3I-10) · the dusk ridge and riderless horse (IC-RD-05/06) · floating candles over inked paper | the finales (compass / gates / trail-to-fire / ink-light) | — | Q-PC-2, Q-3I-1, Q-RD-1, Q-HP-4 (captions) |
| card `act-3` | the tintype developing (RD-02, IC-RD-08) | the graphite trail, the low sun, Chinese Rocks lettering | — | tip #2 (not a quote) |
| `beyond` | the golden-hour frontier (MV-10); later, the WANTED handbill (IC-RD-03) | trail map (RD-03), running-shoe prints (IC-RD-07), satchel strip (IC-RD-11), tintype photos (RD-02), the graphite reveal (IC-RD-13) | — | — |
| `writing` | the journal spread (IC-RD-01) | graphite vignettes (the Blackwater-style crossed plan), the pencil nib, one red underline | — | — |
| `voices` | the campfire (IC-RD-04) | "read into firelight" (HP-03′) | — | — |
| card `act-4` | embers kindling into candles along the Line → the enchanted hall (IC-HP-03/16) | IM Fell lettering | — | Q-HP-3 (epigraph, excerpt) |
| `principles` | — | Patronus ribbons (HP-07) | — | — |
| `contact` | the last floating candle's flame and the resolved bracket | — | the Patronus stag (IC-HP-13) | — |
| `credits` | — | the Time-Turner (IC-HP-15), the Hallows end mark (IC-HP-11) | the Snitch (IC-HP-12) | Q-HP-2 "Mischief managed." (line) |
| chrome | — | — | Lumos/Nox Pause aliases (IC-HP-09); palette verbs | — |
| `404` | the Marauder's Map of the site (IC-HP-05/06) | — | alternates: 3 Idiots `DEFINE:`, Pirates "Davy Jones' locker … savvy?", RDR2 `TIP: This trail goes nowhere. Head back to camp.` (our line) | "Mischief managed" returns to `#top` |
| console | — | — | Barbossa's "guidelines" line, with the true rider "Not in this repo: `npm run check`." | Q-PC-3 |

**10.2.1 Quote registry, final assignment (all `proposed`; COMMUNITY = check in the work before `confirmed`):**
| Id | Line (verbatim) | Work · speaker · status | Placement |
|---|---|---|---|
| Q-HP-1 | "I solemnly swear that I am up to no good." | *Prisoner of Azkaban* (2004) · VERIFIED | Intro, above Play; Map egg trigger |
| Q-HP-2 | "Mischief managed." | *Prisoner of Azkaban* (2004) · VERIFIED | The credits' last line; the Map's close; the 404's way home |
| Q-HP-3 | "Happiness can be found, even in the darkest of times, if one only remembers to turn on the light." | Dumbledore, *Prisoner of Azkaban* (2004 **film-only** line) · VERIFIED | Card III→IV epigraph, as the excerpt "…if one only remembers to turn on the light." |
| Q-HP-4 | "It does not do to dwell on dreams, Harry, and forget to live." | Dumbledore, *Philosopher's Stone* (2001) · VERIFIED | Films HP screen. Never near SOS Foundation or family content (grief context) |
| Q-PC-1 | "Now… bring me that horizon." | Jack Sparrow, *The Curse of the Black Pearl* (2003) · COMMUNITY | Journey waypoint 4 caption |
| Q-PC-2 | "Not all treasure is silver and gold, mate." | Jack Sparrow, *Curse of the Black Pearl* · VERIFIED | Films Pirates screen; never next to a return or Sharpe figure |
| Q-PC-3 | "The code is more what you'd call 'guidelines' than actual rules." | Barbossa, *Curse of the Black Pearl* · COMMUNITY | Console egg only; never near the gauntlet or kill-list |
| Q-3I-1 | "Aal izz well." | Rancho, *3 Idiots* (2009) · VERIFIED | Films 3I screen; the LD-3I stall status (real loads only); the palette egg |
| Q-3I-2 | "Pursue excellence, and success will follow." | Farhan quoting Rancho · VERIFIED · `excerpt` | The dawn board's top margin |
| Q-3I-3 | "A machine is anything that reduces human effort." | Rancho · COMMUNITY | Under the Optuna pipeline FIG |
| Q-RD-1 | "Be loyal to what matters." | Arthur Morgan, *Red Dead Redemption 2* (2018) · COMMUNITY | Films RDR screen; never in Beyond beside the SOS Foundation (it would read as Aryan speaking about family → DRAFT) |
| Q-RD-2 | "We can't change what's done, we can only move on." | Arthur Morgan · COMMUNITY | The Dead Eye end toast |
| *parked* | "Words are, in my not-so-humble opinion, our most inexhaustible source of magic." · "Revenge is a fool's game." · "Savvy?" / "Parley!" (egg labels) | — | Unassigned or egg-only |
| **OUT** | "The problem is not the problem…" (misattributed to Jack Sparrow; never in the films) · any 3 Idiots lyric ("Give Me Some Sunshine") · the "chamatkar/balatkar" speech · "I have a plan" (its joke is that plans fail) · grief-context HP lines near family content | — | H4: never |

**10.2.2 Stays out (H1/H2) and declined (taste), across the four worlds** (full lists in ICONS §1, §3.2, §4.2, §5.2, §6.2):
- **OUT:** any actor, character face, figure, rider or costume silhouette (the tricorn profile, Arthur's hat on a rider, the scar on a face); logos, wordmarks, crests, studio marks **and hand-redrawn replicas of them**; stills, screenshots, footage, audio, extracted UI/fonts; the RDR2 "Redemption" face, *Lipstick*, Hapna; setting "Red Dead Redemption" in Chinese Rocks.
- **DECLINED:** house colours, sorting quizzes, Quidditch hoops, the acceptance-letter parody, wizard-hat or sparkle cursors; pirate-speak, rope borders, chests, parrots, the compass in chrome; Bollywood clip art, doodle or gear wallpaper, rank lists (they read as grades); every RDR2 weapon, blood, alcohol, tobacco, poker, robberies, bounty-hunting people, the illness and ending, saloon doors, bullet holes, "yee-haw"; the honor meter; WANTED on killed strategies; the "owl post" COPIED flavour.

**10.2.3 Resolved differences between ICONS.md and STUDY.md (this SPEC decides):**
1. **RDR2's act:** STUDY option A ("The Frontier": beyond, writing, voices), not ICONS option A ("The Reckoning": kill-list, beyond). Reason: §2 item 5.
2. **Dead Eye:** opt-in egg only (STUDY), not an auto one-shot on first entry (ICONS). Trigger by palette or typed word; **no Shift+D** (WCAG 2.1.4, ICONS §8).
3. **WANTED:** a handbill of confirmed facts in Beyond (STUDY), not a poster per killed row (ICONS).
4. **Journal:** Writing is the journal (STUDY); Beyond borrows only its tintypes, satchel and prints (ICONS IC-RD-01 spreads for the four notes are not adopted, so the journal appears once).
5. **RDR2 palette:** STUDY's CALC-verified `#130d0b / #1c1411 / #231915 / #0a0605` (ICONS' `#14100c` set is not adopted).
6. **Writing's HP items** (the "Words are…" epigraph, wax seals, the wand-tip touch, candlelit W covers) move out with Writing; they return only under RD-1 option B. The Hallows glyph moves to the credits' end mark.
7. **Honor ▲ toast:** declined (P8: never meter anything; and a cross-world auto-egg in Act II).
8. **"The Reckoning"** stays the ledger's descriptive name in Act II; the act is "The Frontier" (RD-2).

### 10.3 Easter eggs (registry and rules; `lib/film.ts` `eggs`)
- **Triggers:** palette commands (discoverable by search) and typed words (only while focus is not in an input, textarea or contenteditable; the buffer resets after 1.5 s). **No single-key shortcuts.** The palette toggle "Turn off easter eggs" (session, try/catch storage) disables typed triggers and auto-eggs.
- **A11y:** every egg has a keyboard path. Transient toasts use `role="status"` once or are aria-hidden. Nothing traps focus except the Map dialog (dialog rules: Esc and a close button).
- **Motion:** RM or Pause gives a static version or none. Eggs never start a second canvas or decoder. An auto-running egg lasts ≤ 4 s and runs once per session.
- **Never on the reading path:** no egg delays, covers or replaces content; none is needed to understand anything. Egg code is lazy-loaded on trigger (≤ 6 KB gz each; the Map ≤ 10 KB gz).
- **World:** an egg lives in its own world's section, except Dead Eye (user-invoked, ≤ 3 s, leaves nothing behind) and the credits' HP bookend.

| Egg | Trigger | Where | RM / Pause | Default |
|---|---|---|---|---|
| The Marauder's Map (IC-HP-05/06): the page's own map (rooms = enabled sections, corridors = page order, walls = microtext of each room's real title; the visitor's own trail as footprints labelled YOU); every room a real link | palette or typed "I solemnly swear…"; also the `404` body; closes with "Mischief managed" | overlay dialog | opens flat, no unfold | ON |
| Lumos / Nox (IC-HP-09) | Pause tooltip; palette; typed words | header | — | ON |
| Accio `<section>` / Obliviate ("forget this visit": clears `intro-seen`, the Map trail and egg flags) | palette | global | — | ON |
| The bolt favicon (IC-HP-10) | the intro flight plays | tab | never (the intro never arms) | ON |
| The Snitch (IC-HP-12) | credits at 60% in view (auto, once, ≤ 4 s) | `credits` | rests only | ON |
| The Patronus (IC-HP-13) | "Expecto patronum" | `contact` | disabled (the palette says why) | ON (desktop) |
| The hidden kraken (IC-PC-05) | a long look at the storm | card I→II (media) | still | ON |
| Parley | palette | → `#contact` | — | ON |
| The quadcopter lift (IC-3I-08) | a Run clears 7/7 gates | `work` | no lift | ON |
| Aal izz well (IC-3I-03) | palette | the current section heading gets one two-beat settle + a toast | toast only | ON |
| **Dead Eye (IC-RD-02, SM-17)** | palette or typed `deadeye` | `kill-list` | static X's until Esc | ON (desktop, opt-in) |
| The console line (Q-PC-3) | devtools | console | — | ON |
| The owl (IC-HP-17) | inside IN-02 | intro | — | only if the model renders it cleanly |

---

## 11. The Reading Line: what is retained, and what changes

### 11.1 Retained unchanged
- The **huge static SSR name** (D-1), now read as the film's title. One `h1`, never animated, never crossed by light, never set in a display face.
- The **bracket `[ ]`**, still the only framing device and still aqua. Its uses (≤ 1 per viewport):
  - ① the intro Play (the aperture spent on Play) or, when the intro didn't play, the hero aperture
  - ② the Lens Index tracker
  - ③ the contact close on AS
  - ④ the `[AS]` logo
- The **Lens Index**: D-6 equal quiet, verdict words always, and the ember strike on killed rows when active. It is the Act II climax; Dead Eye is only an opt-in lens on it.
- The **noise → order seam** (IceCut: ragged mask, ±40%·p², 3 px aqua line only mid-wipe), at Card I→II.
- The **writing index** (drafts are not links) and the **contact resolution** (dome seam, invitation, magnetic Copy email plus mailto).
- **Type:** the 8-step scale; Geist / Geist Mono / Newsreader for everything except the scoped world lettering (A-8, §9.7); ≤ 3 styles per viewport; one Meta label system.
- **Motion:** native scroll; 3 registers plus 2 shapes (bracket, dome); poster-first media; one decoder; no WebGL; transform, opacity and clip-path only.
- **Honesty architecture:** the Sharpe-2.0 rule, limitations beside claims, `SYNTHETIC • ILLUSTRATIVE` adjacent, ratios never animated, drafts never links.

### 11.2 What changes
1. `data-world` recolours the tone planes inside the near-black band (AA computed), now across **five** world keys (house + four works).
2. The film light law (Law 1) replaces "no glow" for world media.
3. Derived act cards (loading reels) are a new element: **four** of them. The page sticky budget is **150vh** desktop (2 × 60 + ≤ 30); mobile is 0. Card II→III adds 0.
4. The paper plane (`#ebe0c6` and its inks) is **re-hosted as the rdr2 journal** (RD-1).
5. The header gains the Meta act label. The progress bar and rail stay banned.
6. The hero is a **sea plate with the Black Pearl**, not the sculpture. The D3 HF pack is superseded by MEDIA-PLAN.
7. An **intro overlay** (N1) precedes the page, amending DESIGN §11.4 "content-gating loaders" under §5's conditions. It now shows the castle, candles and broom (A-6).
8. Chapter covers become **truthful code schematics** in the jugaad register, and the lens figures use schematic mono/colour pairs.
9. **v2:** the iconic override (A-6) rewrites Laws 2 and 4, §9.4, §15; ICONS.md recipes apply.
10. **v2:** scoped world lettering (A-8) for act titles, loaders and eggs.
11. **v2:** a registered easter-egg layer (§10.3) and a quote registry (§9.6) replace the banned-term lint.
12. **v2:** the writing preview becomes the journal's right-page graphite vignette (the D3 filmstrip mechanics are retired with W-01…05).

### 11.3 Retired (D-3 YES; v2 additions last)
- chrome and effects: the credibility marquee, cursor glow, scroll-progress bar and section rail
- backgrounds: DotGrid, the hero bloom, the 13 faint backdrops and the second media band
- labels and counters: decrypting labels, replaying count-ups, ghost numerals and the draft pulse
- Kimi's header compass and PC-05's ambient rings (the optional opening-card rings are a different, scroll-settled use)
- the D3 sculpture pack (HF-01…09)
- **v2:** the W-01…05 candlelit covers and the filmstrip preview; the banned-term lint; Check L (→ L2); the "≤ 3 film worlds" cap (→ 4); v1 §5.8's object bans

---

## 12. Adaptability (SYNTHESIS §8 extended)

### 12.1 `lib/worlds.ts` (exists) + `lib/film.ts` (new; data only, no JSX) + `lib/quotes.ts` (new)
`lib/worlds.ts` stays the world **key** registry (`WORLD_IDS` already includes `"rdr2"`; `ready`, `loader`). v2 adds `"plate-trail"` to its `LoaderKind` and flips `rdr2` to `{ ready: true, loader: "plate-trail" }` once the DESIGN v3 tokens land. `lib/film.ts` holds everything about the works, acts, slots and copy:
```ts
import type { WorldId, LoaderKind } from "./worlds";          // "house" | "pirates" | "idiots" | "hp" | "rdr2"
export type Intensity = "whisper" | "grade" | "full";
export type CopyStatus = "confirmed" | "proposed" | "draft";
export type Copy = { text: string; status: CopyStatus; source?: string /* content.ts key or "REPO" */ };
export type TransitionKind = "flight" | "seam" | "tintype" | "ignite" | "reel" | "title" | "opening";
export type WorkKind = "film" | "game";

export type WorldSpec = {
  id: WorldId;
  work: { title: string; years: string; kind: WorkKind } | null;        // nominative credit (house = null)
  verb: "Navigation" | "Explanation" | "Reflection" | "Revelation" | null;
  slots: {
    line: "course" | "blueprint" | "graphite" | "ink-light" | "none";
    emphasis: "stamp" | "chalk-circle" | "pencil-underline" | "ribbon" | "none";
    ground: "rhumb" | "grid" | "none";
    reveal: "rise" | "draw" | "sketch" | "nib" | "clear";
    success: "needle-settle" | "chalk-tick" | "kindle" | "flare" | "none";
    loader: LoaderKind;
    dressing: {                                                          // world skin for structural section types
      notes: "plain" | "frontier" | "footprints";                        // story/notes (Beyond)
      index: "plain" | "journal" | "parchment";                          // writing index plane dressing
      quotes: "plain" | "campfire" | "light";                            // voices
    };
  };
  lettering?: LetteringId;                                              // the act title's outline or font (§9.7)
  media: { plate?: MediaId; loop?: MediaId; mobile?: MediaId; cardStill?: MediaId; reelStill?: MediaId; filmsStill?: MediaId };
  borrowed?: Copy;                                                       // films chapter, site fact
  line?: QuoteId;                                                        // films chapter, one attributed line
  reason?: Copy;                                                         // Aryan's words; starts "draft"
};
export type ActSpec = { id: string; world: WorldId; title: Copy; logline?: Copy; epigraph?: Copy | QuoteId; tip?: number };
export type PrologueSpec = { enabled: boolean; world: WorldId; poster: MediaId; posterMobile: MediaId;
  flight: MediaId; trail: string /* json id */; landsOn: string /* section id */; maxFlightS: number };
export type EggSpec = { id: string; host: string | "global"; trigger: ("palette" | "typed" | "auto" | "media")[];
  desktopOnly?: boolean; enabled: boolean };
export type LetteringSpec = { id: string; text: string; face: string; mode: "A" | "B"; slot: "act-title" | "loader" | "egg" };

export const film = {
  enabled: true,
  intensity: "full" as Intensity,
  heroCredit: false,
  copySignedOff: false,
  fontScope: { extended: false },                                        // FT-1
  prologue: { enabled: true, world: "hp", poster: "IN-01", posterMobile: "IN-01m", flight: "IN-02",
              trail: "intro-trail", landsOn: "top", maxFlightS: 6.0 } satisfies PrologueSpec,
  worlds: { house, pirates, idiots, rdr2, hp } satisfies Record<WorldId, WorldSpec>,
  //   rdr2 = { work: { title: "Red Dead Redemption 2", years: "2018", kind: "game" }, verb: "Reflection",
  //            slots: { line: "graphite", emphasis: "pencil-underline", ground: "none", reveal: "sketch",
  //                     success: "kindle", loader: "plate-trail",
  //                     dressing: { notes: "frontier", index: "journal", quotes: "campfire" } },
  //            lettering: "rd-frontier", media: { plate: "MV-10", mobile: "MV-10m", loop: "MV-11L",
  //            cardStill: "MV-10", filmsStill: "F-RD" }, line: "Q-RD-1", … }
  acts: [
    { id: "act-1", world: "pirates", title: { text: "The Crossing", status: "proposed" } },
    { id: "act-2", world: "idiots",  title: { text: "The Workshop", status: "proposed" },
      epigraph: { text: "Treat every backtest as guilty until proven innocent.", status: "confirmed", source: "REPO" } },
    { id: "act-3", world: "rdr2",    title: { text: "The Frontier", status: "proposed" }, tip: 2 },
    { id: "act-4", world: "hp",      title: { text: "The Light", status: "proposed" }, epigraph: "Q-HP-3" },
  ] satisfies ActSpec[],
  transitions: { "hp>pirates": "flight", "pirates>idiots": "seam", "idiots>rdr2": "tintype",
                 "rdr2>hp": "ignite", "idiots>hp": "ignite", "*": "reel" },
  longCards: ["pirates>idiots", "rdr2>hp", "idiots>hp"],
  tips: [ /* §8.3, each a Copy with its content.ts source */ ],
  lettering: [ /* §9.7 */ ] satisfies LetteringSpec[],
  eggs: { enabled: true, typed: true, list: [ /* §10.3 */ ] satisfies EggSpec[] },
} as const;
```
`lib/quotes.ts` (§9.6): `export const quotes = { "Q-HP-1": { text, work, year, speaker?, verified, excerpt?, status }, … } as const;`

### 12.2 `lib/page.ts` additions
```ts
type Base<T, P> = { /* …existing fields… */
  act?: string | null;          // ActSpec.id; null = outside acts (hero cold open, intermission, credits)
  world?: WorldId;              // rare override; "house" allowed silently; any other warns ("world cameo")
  worldIntensity?: Intensity;   // default film.intensity
};
// New / changed union members
| Base<"gauntlet", { board: MediaId }>
| Base<"story", StoryProps & { variant: "split" | "filmstrip" | "contact-sheet" | "notes" | "voyage";
                               media?: MediaId; mediaMobile?: MediaId;
                               handbill?: { enabled: boolean; portrait: MediaId | null } }>
| Base<"index",   { source: "writing"; preview: "vignette" | "filmstrip" | "inline" }>
| Base<"quotes",  { source: "testimonials"; media?: MediaId; loop?: MediaId }>
| Base<"films",   { order: "acts" }>                                    // the intermission; reads film.worlds
| Base<"credits", {}>                                                   // renders as <footer>
```
Variants stay **structural**; the world supplies the skin through `slots.dressing` (a `notes` section in rdr2 renders the frontier dressing; the same entry moved to hp renders HP-06 footprints). Every world implements every dressing value it declares (compile-time complete) or declares `plain`.

**The default manifest** (abbreviated). The ids are fixed; `act` drives everything:
```ts
{ id:"top", type:"hero", act:null, tone:"deep", motion:"signature", props:{ cta:{label:"View the quant portfolio ↓", to:"work"}, media:"MV-01", mediaMobile:"MV-02" } },
{ id:"about", type:"story", act:"act-1", props:{ variant:"split", … } },
{ id:"journey", type:"story", act:"act-1", motion:"signature", props:{ variant:"voyage", … } },
{ id:"work", type:"gauntlet", act:"act-2", motion:"signature", props:{ board:"MV-06" } },
{ id:"trading-algos", type:"chapter", act:"act-2", numbered:true, props:{ projectId:"trading-algos", cover:"code:schematic-trading-algos" } },
{ id:"optuna-screener", type:"chapter", act:"act-2", numbered:true, props:{ projectId:"optuna-screener", cover:"code:schematic-optuna" } },
{ id:"experiment", type:"experiment", act:"act-2", tone:"raised", props:{ demo:"backtest" } },
{ id:"systems", type:"matrix", act:"act-2", props:{ source:"capabilities" } },
{ id:"kill-list", type:"ledger", act:"act-2", motion:"signature", props:{ include:["flagships","survivors","killed"] } },
{ id:"films", type:"films", act:null, world:"house", tone:"deep", props:{ order:"acts" } },
{ id:"beyond", type:"story", act:"act-3", motion:"signature", props:{ variant:"notes", media:"MV-10", mediaMobile:"MV-10m",
    handbill:{ enabled:true, portrait:"authentic:portrait" }, … } },
{ id:"writing", type:"index", act:"act-3", tone:"paper", props:{ source:"writing", preview:"vignette" } },
{ id:"voices", type:"quotes", act:"act-3", tone:"deep", props:{ source:"testimonials", media:"MV-11", loop:"MV-11L" } },
{ id:"principles", type:"principles", act:"act-4", numbered:true, props:{} },
{ id:"contact", type:"contact", act:"act-4", tone:"deep", props:{ invitation:"…verbatim…", media:"MV-08" } },
{ id:"credits", type:"credits", act:null, world:"house", tone:"deep", props:{} },
```

### 12.3 Derivations in `lib/sections.ts` (pure, server-safe)
- **`worldOf(s)`** = `s.world ?? actOf(s)?.world ?? inherit(s)`. `inherit`: `hero` → the first act's world; `films`/`credits` → `house`.
- **`actRuns`:** contiguous runs by page order. **`numeral(act)`** = I, II, III, IV by first appearance; the reel mark is `numeral / count`.
- **`cards`:** for each act run, a card before its first section:
  - `kind` = `opening` for the first act; else `transitions[\`${prevNonHouseWorld}>${act.world}\`]` ?? (same world ? `title` : `reel`)
  - `long` = `longCards.includes(key)` and intensity is `full`, and `kind` is `seam` or `ignite`
  - `id` = `act-${n}`
- **`headerLabel(activeId)`:** hero → ""; an act section → `ACT ${numeral} • ${title}`; `films` → "INTERMISSION"; `credits` → "CREDITS".
- **Groups and words:**
  - `menuGroups` and `paletteGroups` are grouped by act run, with work credits in the headers.
  - `worksInUse` = the works of the worlds of enabled acts, in act order (feeds the prologue credit line, the opening rows, the films chapter, `WORLDS BORROWED FROM` and the counted words: "four acts", "three films and a game").
  - `seenHereIn(world)` = nav-enabled sections with `worldOf === world`.
  - `quotesInUse` = registry ids that will render (feeds `LINES QUOTED`).
  - `tipFor(pathname)` = `eligibleTips[hash(pathname) % n]`.
  - `bookendWorld` = `film.prologue.enabled ? film.prologue.world : null` (the credits' eggs and last line).
- **Geometry:** `bearingOf(actIndex)` = `actIndex × 360 / acts.length + 22.5`. `slot(section, name)` = `worlds[worldOf(section)].slots[name]`.
- **Rendering:** `app/page.tsx` renders `interleave(sections, cards)`, each via `ActCard` or `SectionFrame` + `registry[type]`. SectionFrame sets `data-tone` **and** `data-world`, provides `WorldContext`, and inserts the dome `Seam` only when no card sits between different tones.

### 12.4 How to…
- **Move a section between acts** (example: `systems` from Act II to Act IV):
  1. In `lib/page.ts`, move the `systems` entry inside the Act IV run (after the `act-4` card's first section, before `contact`).
  2. Change `act: "act-2"` → `act: "act-4"`.
  3. Run `npm run check`.

  Re-derived with no component edits: its world (hp), ground and tokens; its emphasis slot (ribbon instead of chalk circle); its FIG figure (ink-contour instead of blueprint); the grid fade (now ends at `kill-list`); the header label, menu group and "Seen here in" links; `numberOf`.
- **Move an RDR2 section** (examples): `writing` → `act-4` gives HP parchment + ink nib + LD-HP (RD-1 option B, fixture J); `voices` → `act-4` gives the HP "read into light" dressing with no fire; `beyond` → `act-1` gives the plain notes dressing on the sea ground and drops the frontier plate (media props are ignored by worlds whose dressing is `plain`, with a validator warning).
- **Reorder acts:** move whole runs. Cards, numerals, labels, groups and credits re-derive. Missing pairs get `reel` with a warning. If the first act's world is no longer `pirates`, the hero plate falls back to `worlds[first].media.plate`, and the validator warns that the prologue end frame no longer matches (the landing becomes a crossfade).
- **Add a world:** one `WorldSpec`, its id in `WORLD_IDS`, a `components/worlds/<id>/` folder implementing every declared slot and dressing, tokens under `[data-world="<id>"]`, the AA table regenerated, optional transitions, lettering, tips, quotes and eggs. (This is exactly how rdr2 enters.)
- **Remove RDR2:** set the `act-3` sections to other acts or `enabled: false`. Card II→III re-derives as `idiots>hp` → ignite, and the page is the v1 three-act page (fixture I). Its screen, credit row, quotes and eggs vanish.
- **Turn it down:**
  - `worldIntensity: "whisper"` on a section: ground grade plus act label only
  - `"grade"`: plus motifs and static cards, no loops or long cards
  - `film.intensity` sets the global default; `film.eggs.enabled = false` removes every egg
- **Remove the movie layer:** `film.enabled = false`. Every world is `house`; no intro, cards, films chapter, eggs, lettering, quotes or credits film rows; loaders become `plain`; it renders **exactly Direction 3 minus its sculpture pack**.

### 12.5 Validator additions (`scripts/check-manifest.mjs`, run in `npm run check` and CI)
**Errors:**
1. Acts are contiguous; **≤ 4 film/game worlds; ≤ 4 major world changes** (the prologue flight counts).
2. Exactly one `hero`, first, with `act: null`. `credits`, if present, is last, and `contact` is the last section before it. ≤ 1 `films`.
3. ≤ 2 **derived** long cards (D-5), each ≤ 60vh travel, desktop fine pointer only. Page sticky travel ≤ 150vh desktop and **0** below 640. Per-section travel ≤ 30vh unless it is a long card. `tintype` and `reel` cards add 0.
4. `signature` ≤ **6**; `scene` + long cards ≤ 2.
5. The world × tone AA table, computed from the CSS tokens: text < 4.5 or UI < 3 fails (now including rdr2, the Dead Eye ground and the handbill paper).
6. Any `draft` copy that would render in production fails. Any `proposed` copy or quote in production without sign-off fails.
7. **Quote registry lint** (replaces the banned-term lint): any UI string, alt text or `film.ts` copy that matches a registry text but is not rendered through `FilmQuote` fails; any quote without `work` and `year` fails; OUT lines (§10.2.1) fail if present anywhere.
8. **H2 file checks:** every file in `public/` has a `lib/media.ts` provenance row; every `higgsfield` asset carries `accept: { people:false, likeness:false, text:false, ripped:false, checkL2:"claude:<date>+aryan:<date>" }`; any tracked `.ttf/.otf/.woff/.woff2` has `OFL.txt` or `LICENSE` beside it; `design-src/fonts-personal/` and `kimi/research/ref-images/` are git-ignored and never imported; no file in the repo is a film still, screenshot or official logo (provenance must be `higgsfield`, `authentic` or `code`).
9. **Hygiene:** `<title>`, meta description and the OG image metadata contain no work title; the static favicon is `[AS]`.
10. **Lettering scope** (§9.7): every `lettering.slot` ∈ {act-title, loader, egg} unless `fontScope.extended`; no display face referenced by the h1, body, Meta, figure or data components (component allow-list).
11. **H3:** with `film.enabled`, the credits contain the exact string "Fan tribute — not affiliated with Warner Bros., Disney, Vinod Chopra Films or Rockstar Games."
12. **Tips:** every `confirmed` tip equals its `content.ts` source byte-for-byte.
13. **Handbill:** its fields ⊆ confirmed `content.ts` facts + `site.location`; the REWARD never renders unless `confirmed`.
14. The prologue's `landsOn` resolves to the hero, and `flight`, `poster` and `posterMobile` resolve (fallbacks allowed). The hero `cta.to` resolves. Every `seenHereIn` link resolves. Every egg `host` resolves or the egg is dropped with a warning.

**Warnings:** a `world` cameo override · a generic `reel` transition in use · the prologue end frame ≠ the hero plate · `contact` not last-before-credits · the Act II run longer than 6 sections · a section's media props ignored by a `plain` dressing · a COMMUNITY quote still unverified.

### 12.6 Adaptability fixtures (each must pass every bar)
- **A:** the default (four acts).
- **B:** `systems` moved to Act IV.
- **C:** acts reordered HP → RDR2 → 3 Idiots → Pirates (generic reels plus warnings, crossfade landing).
- **D:** `film.enabled = false`.
- **E:** `films` disabled (Card II→III still resolves `idiots>rdr2`).
- **F:** `journey` disabled (Act I = `about` only).
- **G:** `film.intensity = "grade"` (no long cards, no loops, static cards).
- **H:** the prologue disabled (the credits drop the HP bookend eggs and "Mischief managed.").
- **I (new):** the rdr2 act removed (three acts; Card II→III = `idiots>hp` ignite; v1 behaviour).
- **J (new):** `writing` moved to act-4 (RD-1 option B: parchment, ink nib, LD-HP route loader).
- **K (new):** `film.eggs.enabled = false` (0 egg code shipped, palette without egg commands).
- **L (new):** lettering missing (every act title falls back to Newsreader; no layout shift).

---

## 13. Reduced-motion / mobile / no-JS / Save-Data / `?skip` contract

| Element | Reduced motion or Pause | Mobile (<640 or coarse) | No JS | Save-Data / 2G / 3G | `?skip` |
|---|---|---|---|---|---|
| Intro (N1) | **never shown** | lite: IN-01m still plus code flight, dome exit | never shown | never shown | never shown |
| Hero | open, poster only, no noise | stacked, MV-02 still, aperture on decode | open, poster | still, no aperture | open |
| Opening card | static course, compass at bearing | static | static SSR | static | static |
| Journey | carousel with stills; medallion in its moonlit state | carousel | stacked stills | carousel, stills only | static |
| Card I→II | static title card | static (FIG drawn once, R1) | static | static | static |
| Gauntlet | settled tally, no Run, no quadcopter lift | vertical tabs | list plus static SVG | Run works (SVG is code) | Run instant |
| Chapters | drawn | stacked, no leaders | drawn | drawn | drawn |
| Ledger | instant swaps | list, centre-line active | idle state, legible | colour figures lazy | instant |
| Dead Eye (egg) | static X's + ground until Esc | unavailable | unavailable | static | static |
| Films | stills plus final finales | 3:2 crops, final finales | stills plus text | small stills | final |
| **Card II→III** | developed plate, title, tip | static stack | static SSR | smallest MV-10 | final |
| **Beyond** | plate still; map fully revealed; prints and satchel static | MV-10m; no map or prints | static | stills | final |
| **Writing (journal)** | single page, vignettes static, no pencil wipe | single page, 64 px vignettes | inline | inline, no vignettes | final |
| **Voices** | MV-11 still, quotes in ink | crop, no loop | still | still | final |
| Card III→IV | MV-07 still plus captions | still | still | still | still |
| Contact | poster, resolved, no flare, no Patronus | still, tap to copy | mailto only | still | resolved |
| Credits | static; the Snitch rests | same | static | same | final |
| Loaders | static `complete` | same | static SSR (cards) | same | static |
| Other eggs | static or none | none unless tap-safe | none | none | none |

**Global:**
- Reduced motion or Pause stops **all** JS, canvas and video motion, and makes 0 video requests.
- The waveform toggle (`aria-pressed`, sessionStorage in try/catch; tooltip Nox/Lumos) is the WCAG 2.2.2 control for the page.
- The intro's own motion self-stops ≤ 5 s at rest.

---

## 14. Performance budget
| Item | Budget |
|---|---|
| LCP (mobile lab) | ≤ 2.5 s; the element is the h1 or the MV-01 poster, **with the intro armed** |
| CLS | 0 (including intro arm and exit, the poster → video swap, card pins, lettering load and egg toasts) |
| Intro controller | ≤ 6 KB gz vanilla; overlay first paint = CSS, text and SVG only |
| Video | IN-02 ≤ 4 MB; MV-03 / MV-11L / MV-09 2–4 MB each, desktop only; mobile 0 bytes of video unless opted in |
| Image sequence | JV 72 × WebP 1280 w ≤ 3 MB, desktop only, fetched within 1 viewport |
| Posters | the hero 200–350 KB; others lazy; MV-10 is never the LCP (below the fold) |
| Canvas | singleton; DPR ≤ 2; paused offscreen and on hidden tabs; skipped when `hardwareConcurrency < 4` (static fallback) |
| Display fonts | ≤ 24 KB total woff2 subsets + ≤ 3 KB per outline SVG; `display: optional`; never preloaded; never on the LCP path |
| Eggs | lazy on trigger; ≤ 6 KB gz each (the Map ≤ 10 KB gz); 0 bytes when `eggs.enabled = false` |
| JS for the film layer | worlds and cards code-split per world; `film.enabled=false` drops them from the bundle |

---

## 15. Honesty and legal checklist (binary; the critics run it on every phase)
**The five hard limits (A-7). These are the only remaining "never"; everything else in the old v1 list was flipped by A-6.**
1. ☐ **H1 · No likeness.** No actor or character face, figure, silhouette, rider or costume-as-person (the tricorn profile, Arthur's hat on a rider, the scar on a face, round-glasses shorthand) in any generated asset, SVG, canvas or egg. Riderless broom, riderless horse, empty camp, empty deck. `accept.people=false` and `accept.likeness=false` on every generated asset; every SVG reviewed for figures. The only person on the site is Aryan, in `authentic` media.
2. ☐ **H2 · Nothing ripped, no marks, in the public repo.** No film stills, frame grabs, game screenshots or photo-mode shots, trailers, GIFs, footage, audio, official posters, logo/wordmark/crest/UI-sprite files, or fonts extracted from game or film data. **Hand-redrawn replicas of logos, wordmarks and crests count as the mark** and are out. No film still is ever passed to Higgsfield as a reference. Personal-use font binaries never enter git (mode B outlines only). The §12.5 #8 file checks are green. (Recommended hardening: serve the most iconic generated plates from a media bucket, MEDIA-PLAN §0.)
3. ☐ **H3 · The fan-tribute line**, verbatim, in the credits: "Fan tribute — not affiliated with Warner Bros., Disney, Vinod Chopra Films or Rockstar Games."
4. ☐ **H4 · Research honesty untouched:**
   - No invented facts about Aryan. The Journey, the gauntlet, the metrics, the testimonials, the tips and the handbill are verbatim `content.ts`. Voyage, frontier and journal metaphors decorate verbatim facts; they never add events.
   - The Sharpe-2.0 rule, `SYNTHETIC • ILLUSTRATIVE` adjacent to its figure, caveats beside claims, ratios never animated, drafts never links.
   - Every schematic depicts the **real** system; the chalk circle marks a caveat, never a metric; Dead Eye marks only real KILLED rows; the trail map is `ILLUSTRATIVE` and carries no data; nothing about Aryan is metered.
   - Generated media is decorative (`alt=""`), never evidence, never depicts Aryan, and carries provenance. No generated sketch sits near the Drawing claim. The credits disclose Higgsfield and the AI assistance.
   - Quotes are verbatim, verified, attributed and never presented as Aryan's words. No misattributed line ships.
   - **Any line about why a film or game matters to Aryan is DRAFT** (his words or absent); no `draft` renders in production.
   - CLAUDE.md §2 exclusions are absent everywhere (grades, GPA, attendance, family finances, hardship narratives, address, phone, family identifiers). Grief-context and family-adjacent lines never sit near SOS Foundation or family content.
   - Loaders never fake progress; interstitials never claim to load; tips are Aryan's rules.
5. ☐ **H5 · Accessibility and performance contracts:** reduced motion stops all motion; the Pause control works; focus parity; AA contrast on every world × tone and paper; LCP ≤ 2.5 s; one decoder; one canvas; mobile stills; content never gated (the intro is an overlay); every egg has a keyboard path and no single-key shortcut.

**Hygiene and taste (KEEP; not legal limits, still binding):**
6. ☐ `<title>`, meta description, OG image and the static favicon are name-first with no work names or marks.
7. ☐ Research data never takes a work's type, colour or marks; titles are never set in a lookalike or logo face; display lettering stays in its scope (§9.7).
8. ☐ **Check L2** signed by Claude **and** Aryan for every generated asset (ours · no faces · no marks · the subject, not the shot · crafted).
9. ☐ The kitsch list (DESIGN v3 §11.5) and the declined list (§10.2.2) are absent.
10. ☐ Years are verified before ship (HP 2001–2011, POTC 2003–2017, 3 Idiots 2009, RDR2 2018; INFERRED correct, verify), and every COMMUNITY quote is checked in the work.

---

## 16. Decisions still for Aryan (each has a default that this spec already assumes)
| # | Decision | Default |
|---|---|---|
| H-1 | A work credit line in the hero? | **Off** (the prologue, opening card and intermission name the works) |
| F-1 | Act titles | The Crossing / The Workshop / The Frontier / The Light |
| F-2 | Act order | Pirates → 3 Idiots → RDR2 → HP, with the HP prologue |
| F-3 | Name the studios in the non-affiliation line? | **Resolved: yes** (H3 line, verbatim) |
| F-4 | Writing covers W-01…05 | **Dropped** (the journal vignettes are code); re-open only with RD-1 = B |
| F-5 | Sign off the §9.6 proposed microcopy **and every quote** (R-4) | Required before production |
| F-6 | Write the four reasons (or leave them silent) | Silent until written |
| F-7 | Page sticky budget 150vh (the D-5 consequence) | Yes |
| F-8 | Journey image sequence (≈ 66 credits planned) vs four stills | Sequence |
| RD-1 | Writing as Arthur's journal (A) or HP parchment (B) | **A** |
| RD-2 | Act III title and verb ("The Frontier" / "The Trail" / "The Reckoning"; "Reflection") | The Frontier / Reflection |
| RD-3 | The WANTED handbill in Beyond (tone for admissions readers) | ON, with REWARD left as a DRAFT |
| RD-4 | Handbill portrait: his real photo tintyped, or none | His real photo, tintyped |
| RD-5 | The Dead Eye egg on the kill-list | ON (desktop, opt-in) |
| RD-6 | The media cap rises to 950 including spent, floor 250 (MEDIA-PLAN v2 §0) | Approve at G0 |
| RD-7 | His photographs and sketches for Creative, the tintypes and (optionally) the journal | Required; otherwise text-only / code vignettes |
| R-3 | Credits sign-off | "To be continued." then "Mischief managed." as the last line |
| R-5 | Which eggs ship (§10.3) | All listed ON; the owl only if clean |
| FT-1 | Extend the display-font scope to three fixed decorative words (WANTED in Rye; journal "Entry" marginalia; the board header in Kalam)? | **No** (house type), per A-8 as written |
| SIG-1 | Signature cap 6 (Beyond is Act III's signature) | Yes |
| X-1 | Cross-study: Writing as the Marauder's Map? | No: the Map is the page's own map (egg + 404); Writing is the journal |

---

## 17. Hand-off to PLAN (build order; each phase ends in the bar loop: 3 critics, ≤ 3 rounds)
1. **Foundation** (partly landed on `design/three-films`: `lib/worlds.ts`, DESIGN v2 tokens and motion, SectionFrame v1.5 with `data-world`, the Pause toggle, DecoderLock at `8dc3059`):
   - `lib/film.ts`, `lib/quotes.ts`, the `page.ts` additions, the `sections.ts` derivations and the validator (§12.5, incl. the H2 file checks and the quote lint)
   - **rdr2 tokens** (DESIGN v3 §1.3) and `worlds.rdr2.ready = true`; `WorldLoader` incl. LD-RD; `ActCard` (static) incl. `tintype`
   - the head script (`motion-ok`, `intro-armed`, failsafe; `--intro-night #020e1c`)
   - `scripts/outline-lettering.mjs` and the git-ignored `design-src/fonts-personal/`
2. **`/lab` prototypes on native scroll:** the intro (code flight first), Card I→II (with legacy stills), **Card II→III tintype (R-2 mask)**, Card III→IV (code embers), the Journey sticky column with Jack's compass, **the journal spread**, **Dead Eye (R-3)**. Judged with frame sequences before integration (SYNTHESIS §2.10).
3. **Media** (runs in parallel; MEDIA-PLAN v2 §5): G2 sign-off → `LINE_D` → IN-02 final, MV-03, MV-04, MV-05; the idiots and hp anchors; **then the rdr2 set (MV-10/10m, MV-11/11L, F-RD)**.
4. **Sections, by act:** hero → Act I → Act II (gauntlet, chapters/schematics, ledger) → films → **Act III (beyond, writing, voices)** → Act IV (principles, contact) → credits → **eggs** (lazy, last).
5. **Media stages 2–6**, integrated as each is accepted. The code runs on fallbacks until then.
6. **Hardening:** the adaptability fixtures A–L, perf, a11y, the H1–H5 checklist and the hygiene items.

**Bars** (all in `build/bars/`):
- adapted: hero-lens · noise-order-seam · lens-index · writing-index · contact-resolution · scene-host (each with a v3 delta block)
- new (v1): intro · loaders · act-cards · ignite · journey-voyage · films-chapter (updated for v2)
- **new (v2): `rdr2-act.BAR.md`** (Card II→III, Beyond, the journal, Voices, LD-RD, Dead Eye) · **`eggs.BAR.md`** (the shared egg contract)