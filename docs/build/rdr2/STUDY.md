# RDR2 world study — "The Frontier"
### Red Dead Redemption 2 as the fourth world of "One Line, Three Lights" (→ Four Lights) · study v1, 2026-09-28

**Status:** STUDY (research + proposal). Nothing built, 0 credits spent. It feeds a SPEC/DESIGN v3 amendment. Binding inputs: Aryan's direction (1) add RDR2, (2) the iconic override, (3) the hard limits. Where this file conflicts with SPEC/DESIGN v2 (Law 3's "≤ 3 film worlds", Law 4 "no marks", DESIGN §2.1 font bans, MEDIA-PLAN [E] animal exclusions), **Aryan's direction wins** and the conflict is listed in §5.4.
**Labels:** SOURCED (press/wiki, linked in §12) · CREATOR-DOCUMENTED (Rockstar staff quoted in a source) · REPORTED (search snippet or single secondary source; unverified) · INFERRED · PROPOSED · CALC (WCAG 2.x, `build/tools/contrast.mjs` formula). Claude has not played or screenshotted the game for this study. No browser was used.

## 0. The proposal in twelve lines
1. **RDR2 owns a new Act III, "The Frontier"** (verb: **Reflection**), placed between the Intermission and Harry Potter, who becomes **Act IV, "The Light"**. It owns `beyond` → `writing` → `voices`.
2. **The page becomes one day.** Night sea (I) → first light (II) → **golden hour, dusk and campfire (III)** → candle night (IV). The "warms as you read" thesis gets stronger, not weaker.
3. **The Line's fourth material is graphite.** Brass course → blueprint → **pencil trail** → ink → light: every tool that ever drew the Line.
4. **Writing becomes Arthur's journal** (Option A): the D-4 warm paper plane survives, re-hosted as a leather journal spread with graphite sketches. Option B keeps Writing on HP parchment (§5.3).
5. **Beyond is the frontier at golden hour:** a hand-drawn trail map that un-fogs as you scroll, tintype-toned authentic photographs, and a **WANTED handbill** of confirmed facts that links to `#contact`.
6. **Voices sit by the campfire.** The lead quote is read into firelight (the HP-03′ mask, re-hosted; no glow on text).
7. **The Act III card is a Rockstar loading screen:** letterbox, a tintype plate that *develops* (the progress), and a **TIP** quoted verbatim from Aryan's own principles.
8. **Card III→IV (HP-owned ignite):** the campfire burns down and its embers rise to become the lights along the Line.
9. **Dead Eye is an opt-in easter egg on the kill-list:** time slows, the ground goes sepia-red, ember X marks paint onto each killed idea's recorded cause of death, then all strike at once. At rest the ledger stays equally quiet (D-6).
10. **Loader LD-RD "Plate & trail":** a tintype plate develops while a graphite trail runs to a campfire.
11. **Fonts:** the RDR2 logo face is Rockstar-custom (from Chinese Rocks). We outline Chinese Rocks into one SVG title (licence-OK), use **Rye** (OFL) for the word WANTED and **Homemade Apple** (Apache-2.0) for journal marginalia only.
12. **Media:** 5 Higgsfield assets (golden-hour plate + mobile edit, campfire still + 8 s loop, a 21:9 films still). Planned ≈ 35 credits, cap 65, which needs Aryan's G0 approval (§9).

## 1. Visual language (research)

### 1.1 Arthur's journal: the record kept by hand
- **What it is.** A leather-bound journal. Arthur writes and sketches entries as things happen: missions, animals, plants, people. "No two journals are the same." (SOURCED: PC Gamer)
- **Hand and medium.** Harsh graphite lines, broad strokes and bold shading. The range runs from "rather amateurish scribbles to weirdly detailed" textbook-grade botanicals, often across two-page spreads. The cursive is old-timey; captions are blunt, a few words, often a question. (SOURCED: GameRant, TheGamer)
- **Two hands, one book.** John's entries are "simple, almost child-like", and he underlines words to keep his lines straight. (SOURCED: ScreenRant) The illustrator is reported to be **Reuben Dangoor**: Arthur's pages with his dominant hand, John's with the other. (REPORTED: Fandom via search snippet)
- **A plan crossed out.** Arthur draws "a detailed map of the whole town" of Blackwater, marked with a cross to indicate failure. (SOURCED: TheGamer) This is the closest RDR2 image to a kill-list.
- **Principle P1: kept by hand.** A thing appears in the record *because it happened*, and imperfection proves a hand was there. On this site the hand is **SVG path irregularity and draw-on motion**, never a handwriting font for content.

### 1.2 The map: drawn only where you have been
- **Style.** A hand-drawn map on aged paper, with contour lines, dashed trails and labels "from massive slab serifs to handwritten cursive". Lee Martin's screenshot picks: land `#DEC29B`, ink `#40423D`, water `#9E9985`, contours `#C8B28D`, pencil `#716454`. (SOURCED: dev.to; his picks, not Rockstar values)
- **Fog.** A brown fog covers the map until you ride there. There are no viewpoints: you uncover it only by going. (SOURCED: Steam discussion)
- **Principle P3: the map is drawn where you've been.** Our trail map reveals with scroll and never draws an invented route, place name or number.

### 1.3 Dead Eye: mark first, fire once
- **The sequence.** Aim and activate. Time slows, and "a sepia tone is painted over the screen". (SOURCED: Fextralife) You paint targets with **red X marks**, as many as the cylinder holds, then fire, and every mark is shot at once. (SOURCED: GameRant)
- **Levels.** Slow → auto-mark → manual mark → critical spots; at the top levels you see the vitals ("brains, hearts, lungs"). (SOURCED: Fextralife, RDR2.org) A core ring meter drains while it is active, and Honor changes the Dead Eye sound. (SOURCED) A heartbeat is commonly associated but unverified here (INFERRED), so we ship **no audio**.
- **Principle P2: mark first, fire once.** This is Aryan's method in game form. Pre-registration marks the targets; the blind holdout is the one shot. The weak points show only when you slow down (principle 05, "Attend carefully").

### 1.4 Loading screens: develop, don't load
- **Look.** Story-mode loads show sepia **tintype photographs** that reveal through an ink-bleed transition. Lee Martin's 2018 CSS recreation drives an ink sprite sheet through a CSS mask with `steps()`. (SOURCED: Level Up Coding / CodePen)
- **TIPS, honestly.** RDR2 story mode built a lower-left tip line (`LOADING_TIP_*` strings exist), but its visibility is **disabled** in `loading_screen.xml`. (REPORTED: TCRF via search snippet) Tips are a Rockstar loading-screen convention (GTA V), so our TIPS are true to the genre but not a literal RDR2 feature. The SPEC should say so.
- **Principle P4: develop, don't load.** The wait is an image developing, and the development *is* the progress.

### 1.5 WANTED posters: one word, one name, one number
- **Content.** A name, a sketched likeness, "WANTED DEAD OR ALIVE", a reward that rises with the crimes, and the list of crimes, pinned to sheriff's boards. (SOURCED: Fandom Wanted Poster) In-world print mixes "antique slab-serifs, Tuscans, and condensed gothics to mimic real Victorian-era American printing". (SOURCED: madegooddesigns)
- **Principle P7: legible from across the street.** One word, one name, one number, small facts below. We keep the hierarchy and drop "dead or alive".

### 1.6 Camp and the campfire: people are heard, not staged
- **Camp is home.** Stew, coffee, chores, and conversations that change with how close you stand. (SOURCED: Fandom Camps/Camp Events) Woody Jackson's score comes in three kinds: narrative, interactive and **environmental** (campfire singing). (CREATOR-DOCUMENTED: Wikipedia, *Music of RDR2*)
- **Principle P6: the fire is where people talk.** Voices is the campfire: the quotes are heard, and no person is shown.

### 1.7 Golden-hour frontier: dark foreground, lit distance
- **Named references.** Lighting director Owen Shepherd drew on Turner, Rembrandt and 19th-century American landscape painters. The vistas draw on Albert Bierstadt, Frank Tenney Johnson and Charles M. Russell. Rob Nelson: "obsessed with it feeling natural or organic in every respect". Cutscene letterboxing was added late in development. (CREATOR-DOCUMENTED: Wikipedia *Development of RDR2*; ScreenRant)
- **Luminism (Bierstadt).** A light-bathed, hazy distance behind a darker foreground. (SOURCED: ScreenRant, Medium essay)
- **Regions.** The Heartlands are grassland and oaks around Valentine; Big Valley is forested mountains modelled on the Sierra Nevada; Blackwater is the modern town (cobbles, telephone poles). (SOURCED: Fandom)
- **Principle P5: dark foreground, lit distance.** Type lives in the dark foreground and light on the horizon, inside media. That is Law 1, and RDR2's own compositions already obey it.

### 1.8 Menus, HUD, honor, satchel
- **HUD and chrome.** The HUD is minimal and context-dependent: a **core** is an icon inside a ring meter, shown only when relevant. (SOURCED: GameSpot core guide) Chrome is black, with bone-white type and red for danger and selection. A brand palette is listed as `#EE0000` / `#191C1F` / `#FFFFFF`. (REPORTED: brandpalettes.com)
- **Honor.** A slider from white to red with a silhouette icon; it changes journal entries, the soundtrack and the Dead Eye audio. (SOURCED: RDR2.org) **Principle P8: honor is shown, not scored.** We never meter Aryan's character; that would be a fabricated metric.
- **Satchel.** It has no honest host. Park it as a possible future résumé-download glyph, never chrome.

## 2. Typography: what RDR2 uses, and what we may use
| Game face (identified) | Where in RDR2 | Status / licence reality | Our move |
|---|---|---|---|
| **Redemption** (Rockstar custom, from **Chinese Rocks**, Ray Larabie 1999; complemented by Larabie's **Kirsty**) | Logo, official site, key art (SOURCED: Fonts In Use) | Proprietary. Never extract it from game files | **Chinese Rocks** under Typodermic's free *desktop* licence. "Fixed website graphics" with no font software are allowed; `@font-face` is **not** (SOURCED: Typodermic). Convert locally with opentype.js to **one SVG** (`public/film/rdr2-title.svg`, ≤ 3 KB). **Never commit the TTF** (that is redistribution) |
| **Hapna Slab Serif DemiBold** (Mariya Pigoulevskaya/Lish; The Northern Block / Inhouse Type, commercial) | Menus (REPORTED: GTAForums, mod font packs) | Commercial. Mod "RDR2 font packs" are ripped Rockstar + commercial files: **banned** (hard limit b) | Not needed: chrome stays Geist. OFL lookalike if ever wanted: Arvo or Zilla Slab |
| **RDR Catalogue / RDR Gothica / RDR Lino** | Catalogue, signage, UI (REPORTED) | Proprietary | Not used. Period feel if needed: IM Fell English, League Gothic (both OFL) |
| Wood-type Tuscan / Clarendon (poster idiom) | Posters, signage (SOURCED: madegooddesigns) | Genre, not Rockstar | **Rye** (OFL, Nicole Fally; Tuscan wood type) for the word "WANTED". Alternatives: Holtwood One SC, Sancreek, Ewert, Smokum (all OFL) |
| Hand-lettered cursive (journal) | Journal art | Drawn art, not a font | **Homemade Apple** (Apache-2.0, Font Diner; also Lee Martin's map pick) or Cedarville Cursive (OFL), for **aria-hidden marginalia only** ("Entry III") |
| DaFont "Red Dead" fan fonts | — | Mostly personal-use-only, unclear provenance (some are traced logos) | Avoid. OFL covers every need |

**Rules (PROPOSED amendment to DESIGN §2.1):**
- Film faces appear only in the act-title art, the word WANTED, journal marginalia and easter eggs. **Never** in the name (the handbill's "Aryan Sharma" stays in Newsreader), body text, TIPS or research data.
- Self-host `woff2` subsets containing only the glyphs used (Rye "WANTED" ≈ 3 KB; Homemade Apple digits + "Entry" ≈ 6 KB), with the licence texts in `public/fonts/film/`. Load them from the owning component with `font-display: optional`, so they are never on the LCP path.
- The SVG title art sits inside the real `<h2>` as `role="img"` with a `<title>`.

## 3. Palette (hex · role · AA CALC)
**3.1 World `rdr2` grounds × house text.** All pass 4.5. The rdr2 canvas is an oxblood-umber dusk, a redder cast than hp `#0f0c09` (the luminance is nearly equal, so the difference is hue; the card and the media carry the change).

| Plane | Hex | Token | ink | stone | muted | aqua | amber | ember |
|---|---|---|---|---|---|---|---|---|
| canvas | `#130d0b` | `--rd-canvas` | 16.30 | 8.60 | 5.57 | 10.35 | 10.73 | 6.57 |
| raised | `#1c1411` | `--rd-raised` | 15.35 | 8.10 | 5.25 | 9.75 | 10.10 | 6.19 |
| overlay | `#231915` | `--rd-overlay` | 14.55 | 7.68 | 4.97 | 9.24 | 9.57 | 5.86 |
| deep | `#0a0605` | `--rd-deep` | 17.07 | 9.01 | 5.83 | 10.84 | 11.23 | 6.88 |
| Dead-Eye ground (mode only) | `#1a0907` | `--rd-deadeye-bg` | 16.36 | 8.64 | 5.59 | 10.39 | 10.77 | 6.59 |
| house canvas (reference) | `#0b0f12` | — | 16.29 | 8.59 | 5.57 | 10.34 | 10.72 | 6.56 |

**3.2 Decorative inks** (non-text; ≥ 3:1 where they carry meaning; CALC on rd canvas / rd deep / house canvas)

| Token | Hex | Role | CALC |
|---|---|---|---|
| `--w-bone` | `#e3d6bd` | Tintype hairline; handbill edge on dark; LD-RD plate border | 13.41 / 14.04 / 13.40 |
| `--w-pencil` | `#a39686` | **The Line in graphite** on dark; trail dashes; contour hairlines; boot prints | 6.66 / 6.98 / 6.66 |
| `--w-sage` | `#8f9c78` | Grass contours on the trail map | 6.60 / 6.91 / 6.59 |
| `--w-dusk` | `#e0a458` | Low sun and ember sprites. **Sprites and media only:** in the DOM it would read as amber (EXCEPTION) | 8.83 (sprite) |
| `--w-deadeye` | `#d64236` | Dead Eye grade stop and media vignette **only**. Never text, and never the X (the X is ember = killed). Its contrast with ember is only 1.53, so the two never sit together | 4.30 / 4.51 / 4.30 |
| `--w-leather` | `#b5653a` | Journal cover edge and strap (decorative) | 4.48 / 4.69 / 4.48 |

**3.3 Paper planes**
- **Journal (Writing, Option A).** Reuse D-4 exactly: `#ebe0c6` with its proven inks (fg `#2e2318` 11.69, muted 6.79, ghost 5.04, accent 5.78, kill 5.01, exception 5.43). Add `--paper-pencil` `#4a4036` (**7.71**) for sketches and marginalia, and `--paper-red` `#9b1c14` (**6.23**) for one red underline. A new journal hex (`#e9ddc2`: ghost 4.80, kill 4.88) buys nothing.
- **Handbill paper `#e4d5b3`.** Graphite `#2f2a24` **9.79**, pencil `#4a4036` **6.96**, red `#9b1c14` **5.63**, accent `#115e59` 5.22. Ghost `#6a5c4c` is **4.45 ✗** and kill is 4.53 (tight), so the handbill carries **no ghost text and no verdicts**.
- **Map paper `#dec29b`** (Lee Martin's land). Only graphite (**8.32**) and pencil (**5.92**) may be text. Contours `#c8b28d` (1.20) and water `#9e9985` are decorative fills only.
- **Golden-hour media grade** (targets for prompts and grading, not the DOM; PROPOSED): sun gold `#e8b45a`, haze peach `#d9a07a`, shadow blue `#3b4a5a`, dry grass `#9a8a52`, oxblood `#5a1712`.

## 4. Signature moments → site principles
| RDR2 moment | Principle | Where it lands |
|---|---|---|
| The journal filling as you ride (1.1) | **P1 Kept by hand**: entries exist because something happened | Writing as the journal; draw-on graphite |
| Blackwater plan crossed out (1.1) | A failed plan is kept, not erased | The sketch beside "The kill-list" essay |
| Fog lifting where you rode (1.2) | **P3 Drawn where you've been** | The Beyond trail map reveals with scroll |
| Dead Eye (1.3) | **P2 Mark first, fire once** | The kill-list easter egg; TIPS from the gauntlet |
| Tintype loading (1.4) | **P4 Develop, don't load** | LD-RD; card III |
| WANTED board (1.5) | **P7 One word, one name, one number** | The handbill |
| Campfire (1.6) | **P6 People are heard, not staged** | Voices |
| Luminist vistas (1.7) | **P5 Dark foreground, lit distance** | MV-10 composition; Law 1 |
| Letterboxed cutscenes (1.7) | Letterbox for the passage | Card III (2.39:1) |
| Honor slider (1.8) | **P8 Shown, not scored** | Nothing is metered about Aryan |

## 5. Fit into the SPEC act structure
### 5.1 Proposed manifest (changes from SPEC §3 in bold)
```
[PROLOGUE · hp]      play screen → broom flight                                   (unchanged)
 COLD OPEN · pirates  hero at sea                                                  (unchanged)
 ── opening card ──   "A research journal in **four** acts." rows I · II · Intermission · **III** · **IV**
 ACT I   The Crossing   about · journey                                   pirates  (unchanged)
 ══ Card I→II ══        Storm → Blueprint (D-5 long #1)                             (unchanged)
 ACT II  The Workshop   work · algos · screener · experiment · systems · kill-list   idiots (+ Dead Eye egg)
 INTERMISSION           **Four** films: PC · 3I · **RD** · HP screens (act order)    house
 ══ **Card II→III** ══  **Tintype: the TIP reel** (kind `tintype`, reel-class, 0 travel)   → rdr2
 **ACT III The Frontier**  **beyond (golden hour) · writing (journal paper) · voices (campfire)**   rdr2
 ══ Card III→IV ══      **Embers → the Line ignites** (kind `ignite`, D-5 long #2, retuned)  → hp
 **ACT IV** The Light     principles · contact                                          hp
 CREDITS                closing credits roll (+ Rockstar in the non-affiliation line)  house
```
- **Why this order.** Work first, then the life around it, then what it all meant. Time also runs forward inside the act: you ride in at golden hour (beyond), write by lamplight (writing), sit by the fire at night (voices), and the embers become candlelight (IV).
- **Budgets hold.** D-5 is unchanged: card III is a 0-travel reel, which suits RDR2, whose signature already *is* a loading screen. `maxScenes` stays 2, and the signature count stays 5.
- **Labels.** Header: `ACT III • THE FRONTIER` / `ACT IV • THE LIGHT`. Menu group: "Act III · The Frontier — after Red Dead Redemption 2". Prologue credit: `AFTER PIRATES OF THE CARIBBEAN • 3 IDIOTS • RED DEAD REDEMPTION 2 • HARRY POTTER`.
- **Intermission hand-off.** The HP screen's last warm point now sinks to the horizon and becomes card III's low sun. The ignite's first point moves to the campfire (§7.3).

### 5.2 `lib/film.ts` data (PROPOSED; worlds stay data, transitions still derive)
```ts
worlds.rdr2 = { film: "Red Dead Redemption 2", year: "2018", verb: "Reflection", act: { title: "The Frontier" },
  tone: { canvas: "#130d0b", raised: "#1c1411", overlay: "#231915", deep: "#0a0605" },
  line: "graphite", loader: "LD-RD", warm: "fire", cardStill: "frontier-dusk", titleArt: "/film/rdr2-title.svg" };
transitions = { "hp>pirates": "flight", "pirates>idiots": "seam", "idiots>rdr2": "tintype",
                "rdr2>hp": "ignite", "idiots>hp": "ignite" /* fallback if rdr2 is disabled */, "*": "reel" };
longCards = ["pirates>idiots", "rdr2>hp", "idiots>hp"]; // validator counts DERIVED long cards (≤ 2), not list entries
```
- **Fixture.** Removing the rdr2 act must re-derive exactly SPEC v2 (Card II→III = `idiots>hp` ignite; three acts).

### 5.3 Option B (fallback if Aryan keeps D-4 on HP parchment)
- **Shape.** Act III = `beyond · voices`; Act IV = `principles · writing · contact`. The journal idea then lives only in Beyond's Creative block, beside Aryan's real sketchbook (`beyond` → Creative → Drawing).
- **Cost.** RDR2 loses its most iconic artifact at its most natural host, and the SPEC thesis ("the page should read as a journal") argues for A.
- **Cross-study conflict.** The HP study may want Writing as the Marauder's Map. The orchestrator decides; this study recommends **A**.

### 5.4 Conflicts with SPEC/DESIGN v2 (each resolved by Aryan's direction; the amendment must edit them)
1. Law 3: "≤ 3 film worlds / ≤ 3 major changes" → 4 worlds, 4 changes (flight, seam, tintype, ignite).
2. Law 4 and §9.4: marks are now allowed (WANTED, tintype, the Dead Eye X, the journal) as **our own recreations**. Titles are still named in words, and the credits call the site a "Fan tribute".
3. DESIGN §2.1's novelty-font ban → the scoped exception in §2 above.
4. MEDIA-PLAN [E] excludes animals and silhouettes → the **[E-RD] unexclusion** for riderless horses, campfire and tents (§9).
5. HP-06 footprints (beside Athletics): Athletics moves to rdr2, so they become **boot prints on the trail** (`--w-pencil`). The HP study re-homes its Marauder's-Map footprints.
6. HP-03′ (voices read into light) → the same mask mechanism, re-hosted as "read into firelight" (rdr2 world).
7. Warm families: rdr2 has three (golden-hour daylight, paper, fire), one per section, so there is still one per viewport.

## 6. Section treatments (Act III)
### 6.1 `beyond` · story `frontier` (rd canvas; MV-10 golden-hour plate on the right, dark foreground on the left)
- **Athletics.** A small **trail-map inset** (map paper `#dec29b`, ≤ 30% of the area, desktop): build-time contours and a dashed `--paper-pencil` trail. A brown fog mask lifts along the trail as the athletics rows pass. It has **no place names, route or numbers**; the figures stay in the confirmed rows ("~20–40 miles a week"). Meta caption: `ILLUSTRATIVE MAP`. Boot-print pairs replace HP-06.
- **Community and Activities.** Plain rows. The camp is carried by the ground alone, with no icons.
- **Creative.** **Authentic only:** Aryan's photographs as tintype-toned prints (CSS applied to the real photo; caption "Photograph: Aryan Sharma", pending his OK) and his real sketches if he supplies them. **No generated "sketches"** go near the drawing claim, since they could be mistaken for his. The dev-only placeholder is `[Aryan: add 2–3 photographs / 1–2 sketches]`.
- **The WANTED handbill** (end of Beyond; right column on desktop, stacked on mobile), top to bottom:
  - `WANTED` in Rye, then `for questions about quantitative research` (proposed).
  - A tintype of his authentic portrait (decision RD-4), then **Aryan Sharma** in Newsreader.
  - `KNOWN FOR` (confirmed facts only): "Cross Country (varsity) · Wrestling (Varsity B) · Mandarin (6 yrs) · Photography & drone film · Drawing".
  - `LAST SEEN: Washington, D.C.` (`site.location`) · `REWARD: [DRAFT — Aryan]` · `Reply by email →` linking to `#contact`.
  - Never: "dead or alive", a crimes list, or a reward number Aryan hasn't written.

### 6.2 `writing` · index as **the journal** (paper plane with the D-4 tokens; the dome seam rises as the journal page)
- **Desktop spread (≥ 1024).** A two-page spread on rd canvas with a leather edge (`--w-leather`, 6 px) and a CSS strap.
  - Left page: the 5 seeded essays. Title in Newsreader, angle in Geist, a static `DRAFT` Meta chip. **Drafts are not links.**
  - Right page: a code-drawn graphite vignette for the hovered or focused entry, drawn once (`easeDraw`).
- **The five vignettes:**
  - "How I try not to fool myself": a balance scale.
  - "The kill-list": a small plan crossed with one X, after the Blackwater page.
  - "From Pine Script to a real pipeline": a rail line (1899's pipeline).
  - "What wrestling and cross country taught me": a contour trail.
  - "Mandarin and global markets": one brush-like stroke.
- **Details.** Marginalia "Entry I–V" in Homemade Apple (aria-hidden), and one `--paper-red` underline. The h2 writes itself in pencil: a mask wipe behind a graphite nib dot, set in Newsreader (HP-05 re-hosted).
- **Mobile.** A single page, with the vignettes inline at 64 px.

### 6.3 `voices` · quotes "by the fire" (rd deep)
- **The fire.** The MV-11 campfire sits right, focal (0.78, 0.62). Its **8 s loop** is desktop only: it plays while visible with the decoder free, and pauses under Pause or RM.
- **The quotes.** The three teacher quotes sit left, in the dark foreground. The lead quote is read into firelight: a one-shot mask from `--fg-muted` to `--fg`, both AA, with no glow.
- **The hand-off.** The fire's embers seed the Card III→IV ignite.

### 6.4 The Dead Eye easter egg on `kill-list` (Act II; user-invoked, so at rest it breaks no world rule)
- **Trigger.** The command palette entry "Dead Eye (kill-list)", or `Shift+D` while focus is inside `#kill-list` (a modifier combo satisfies WCAG 2.1.4). Desktop fine pointer only.
- **The run** (total ≤ 3 s):
  1. Time slows: `document.getAnimations()` → `playbackRate .25`, the active video `playbackRate .25`, and canvases read `timeScale`.
  2. Grounds shift to `--rd-deadeye-bg`, and world media take the grade.
  3. An **ember X** (two 1.5 px strokes, 90 ms each, 160 ms stagger) paints onto each **killed** row's recorded reason ("t-stat was an overlap artifact"). Survivors are never marked.
  4. 400 ms after the last mark (or on Enter), every row strikes at once, the X's fade, and time returns to 1× over 300 ms.
- **Exit and accessibility.** Esc exits. The toggle carries `aria-pressed`, and a polite status says "Dead Eye: N killed ideas marked" (proposed). Text is never tinted.
- **RM and Pause.** No time-scale and no sequence: the static X's and the ground shift show until Esc.
- **Honesty.** The marks land only on real data. The mode is a lens on the ledger and makes no new claim.

### 6.5 The films screen `F-RD` (Intermission)
- **Contents.** An h3 "Red Dead Redemption 2", with the Meta line `REFLECTION • 2018`, then `films.rdr2.borrowed` (proposed, a site fact): "On this page it became the journal and the fire: graphite that keeps the record, a plate that develops while you wait, and the campfire where the voices sit."
- **Links and finale.** "Seen here in" `#beyond #writing #voices #kill-list`. `films.rdr2.reason` stays a **DRAFT** prompt. The finale draws a graphite trail to a campfire point.

## 7. Loader LD-RD and the act cards
### 7.1 LD-RD "Plate & trail" (SPEC §8 grammar; aria-hidden; no text in the SVG; pre-rendered sprites)
| Size | Motif | Progress (honest) | Indeterminate | Complete |
|---|---|---|---|---|
| `card`/`route` | A tintype plate (6 px radius, `--w-bone` hairline, inset vignette); a graphite trail across its lower third, over 6 hachure arcs; a campfire point at the trail's end | `trail.pathLength = p` **and** the plate's development threshold = p (§8 R-2) | The plate breathes between 10% and 22% developed at 0.4 Hz; the trail is parked at 12%, and the pencil-tip dot ticks every 0.6 s. Stops after 5 s (WCAG 2.2.2) | Fully developed; the bone border draws (0.5 s); the campfire kindles (≤ 12 sprites, 3 frames, no flash) |
| `mini` 48 px | Trail and fire only | `pathLength = p` | Tip tick | The fire kindles |
- **Real uses.** `app/writing/[slug]/loading.tsx` (Writing is rdr2 under Option A) uses the `route` size, with `role="status"` "Loading essay…" and one **TIP** as plain text *outside* the status. Pending rdr2 MediaFrames use `mini`.
- **Rules.** Show only after a 250–400 ms delay, and never show a fake percentage. **Tip choice is deterministic** (`hash(pathname) % n`), never `Math.random()` at SSR, which would cause a hydration mismatch.

### 7.2 Card II→III `tintype` (rdr2 owns the cut; reel-class, 0 travel; scrolling back reverses it)
- **Letterbox.** 2.39:1 on `--rd-deep`. The upper bar (Meta) reads `ACT III • AFTER RED DEAD REDEMPTION 2` with the reel mark `III / IV`.
- **The frame, over scroll progress p:**
  - 0–.3: the Intermission's warm point sinks and becomes a low sun (a sprite); beneath it, the Line is re-traced as a graphite trail across hachures.
  - .3–.8: the frame darkens into a tintype plate that **develops** into MV-10 (our own procedural ink-bleed mask, not Martin's sprite sheet).
  - .8–1: the bone border draws.
- **Lower bar.** The **title art "THE FRONTIER"** (the Chinese Rocks SVG, `<h2 role="img">` with a `<title>`), then `TIP` in Meta with tip #2 in `small` house type. The progress element is the pencil trail.
- **Never.** The word "loading", a percentage, or `role="status"` (SPEC §8.2). RM, no-JS and < 640: a static title card (the developed plate, title, tip and `summary`).

### 7.3 Card III→IV `ignite` (HP-owned; this is only RDR2's contribution)
- The Voices fire burns low (the MV-11 poster at 60% brightness, inside media). 32–40 ember sprites (`--w-dusk` → the candle sprite) rise, are assigned to `LINE_D` points (`getPointAtLength`) and ease there on scroll. The graphite Line is re-inked `#c9ac72` behind them. Same canvas singleton, ≤ 40 sprites.

### 7.4 TIPS (verbatim from `lib/content.ts` = `confirmed`; any edit or composite = `proposed`)
| # | Tip | Source · status |
|---|---|---|
| 1 | "Treat every backtest as guilty until proven innocent." | pillars[1] · confirmed (already Card I→II's epigraph, so not used on card III) |
| 2 | "The result stands; no re-optimization after the fact." | gauntlet[0] · confirmed · **card III** (mark first, fire once) |
| 3 | "The frozen rule is run on the holdout exactly once, no retuning." | gauntlet[1] · proposed ("it" → "the holdout") |
| 4 | "Zero-cost runs are banned." | gauntlet[4] · confirmed |
| 5 | "Failed strategies are never retuned. Each ships a written post-mortem." | gauntlet[6] · confirmed |
| 6 | "Target CPCV Sharpe 1.0–1.5 · anything > 2.0 is a red flag." | Optuna metric + note (the Sharpe-2.0 rule) · proposed composite |
| 7 | "Models are instruments, not idols." | site.principleCapsule · confirmed |
| 8 | "Do the work well and hold the outcome loosely." | principles[1] · confirmed |
| 9 | "Good judgment is trained, not issued at birth." | principles[0] · confirmed |
| 10 | "Most failures I have seen were failures of attention before they were failures of math." | principles[4] · confirmed |
- **Game quotes.** Allowed only as easter-egg microcopy, never in TIPS or data, and Aryan-gated. Example: Dutch's "I have a plan" as the Dead Eye status header (proposed).

## 8. Recipes (code-built motifs; transform, opacity, clip and mask only; RM shows the final state)
**R-1 Graphite stroke (paper tooth and wobble), SVG**
```svg
<filter id="rd-graphite" x="-5%" y="-5%" width="110%" height="110%">
  <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="3" result="g"/>
  <feDisplacementMap in="SourceGraphic" in2="g" scale="1.2" result="w"/>
  <feColorMatrix in="g" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1.6 1.25" result="tooth"/>
  <feComposite in="w" in2="tooth" operator="in"/></filter>
<pattern id="rd-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
  <path d="M0 0V4" stroke="#4a4036" stroke-width=".6" opacity=".55"/></pattern>
<!-- draw-on: <path pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"> → 0 on easeDraw -->
```
- Filter only the static layer. Animate the dashoffset on an unfiltered twin, then swap it for the filtered layer (filters on animating paths are costly).

**R-2 Tintype, with procedural development (progress p ∈ [0,1])**
```css
.tintype{position:relative;border-radius:6px;overflow:hidden;background:#0a0605}
.tintype img{filter:grayscale(1) sepia(.45) contrast(1.18) brightness(.88)}
.tintype::after{content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;
  box-shadow:inset 0 0 48px 18px rgb(10 6 5/.85);outline:1px solid rgb(227 214 189/.35);outline-offset:-1px}
```
```svg
<mask id="develop"><rect width="100%" height="100%" fill="#fff" filter="url(#dev)"/></mask>
<filter id="dev"><feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="3" seed="11"/>
  <feColorMatrix type="luminanceToAlpha"/><feComponentTransfer>
  <feFuncA id="devA" type="linear" slope="6" intercept="-6"/></feComponentTransfer></filter>
<!-- JS: devA.setAttribute("intercept", String(-6 + 7 * p)); p = 0 → nothing, p = 1 → all -->
```
- Mobile and RM skip the mask and show `p = 1`.

**R-3 Dead Eye mode**
```css
:root[data-deadeye]{--time-scale:4}
:root[data-deadeye] [data-world]{--bg:#1a0907}
:root[data-deadeye] [data-media]{filter:sepia(.75) saturate(1.5) hue-rotate(-14deg) contrast(1.08);transition:filter .2s}
:root[data-deadeye] [data-media]::after{background:radial-gradient(ellipse at center,#0000 55%,rgb(214 66 54/.35))}
.de-x path{stroke:var(--kill);stroke-width:1.5;fill:none}
```
```ts
const slow = (r: number) => document.getAnimations().forEach(a => (a.playbackRate = r));
// enter: slow(.25) → mark each killed row (160 ms stagger) → wait 400 ms or Enter → strike all → slow(1); Esc aborts
```

**R-4 The handbill**
```css
.handbill{background:#e4d5b3;color:#2f2a24;padding:28px 24px;rotate:-1.2deg;max-width:22rem;
  clip-path:polygon(0 1%,4% 0,52% .6%,97% 0,100% 3%,99.4% 60%,100% 98%,60% 100%,3% 99.2%,0 96%);
  background-image:radial-gradient(circle at 50% 10px,#3a2a1e 2.5px,#0000 3px)} /* one nail */
.handbill .wanted{font-family:var(--font-film-rye);font-size:clamp(3rem,7vw,4.5rem);letter-spacing:.04em;
  text-align:center;border-block:3px double currentColor}
```
- The link keeps the paper-accent `#115e59` focus ring (5.22). Use rotate 0 at < 640.

**R-5 Trail map with fog lift (no runtime JS).** `scripts/gen-contours.mjs` runs at build time (seeded noise → marching squares) and writes `public/film/rd-contours.svg` (≤ 12 KB). The fog is a `<mask>` of radial gradients per waypoint whose opacity is driven by CSS `animation-timeline: view()`. Where that is unsupported, or under RM, the map shows fully revealed.

**R-6 Campfire (code; for mini loaders and the ember source).** Three pre-rendered flame sprites (a `--w-dusk` → `#ffe9c4` radial) cycle at ≤ 2 Hz between opacity .85 and 1. The area is < 0.1% of the viewport, so there is no flash risk (WCAG 2.3.1).

## 9. Higgsfield (atmosphere only; no people, faces, riders, text, maps, posters or journals; code builds every mark)
- **Prompt hygiene (kept from MEDIA-PLAN).** No franchise words or character names in prompts. Describe the light and the land, and cite public-domain painters (Bierstadt). That keeps the outputs original rather than near-copies of game frames.
- **[B-RD] world paragraph:**
  > World: the open frontier from golden hour into dusk. A warm low sun, long raking shadows and dust hanging in the air over tall dry grass, scattered oaks and a slow river; distant blue mountains. Luminist nineteenth-century landscape-painting light: a hazy, light-filled distance behind a darker, quiet foreground. Earthy umber, bone, sage and dusk-gold, with at most one deep oxblood. Wild, calm and unpopulated.
- **[E-RD] unexclusions.** Allowed: **riderless horses at rest or grazing (small, mid-distance, never galloping), one campfire in a stone ring, canvas tents, a split-rail fence, a dirt trail**. Still excluded: people, riders, hands, faces, hats, guns, branded tack, lettered wagons, trains, towns, signs, posters, paper, books, and any text.

| ID | Use | Model / settings | [C] asset paragraph (abridged) | Plan / cap |
|---|---|---|---|---|
| **MV-10** `frontier-dusk.webp` 16:9 | Beyond ground; card III end frame; LD-RD plate | `gpt_image_2_5`: 2k medium drafts ×2 (1 each), 2k high finals ×2 (2.75) | A wide grassland valley; the low sun just above a far ridge at x ≈ 78%; a hazy, lit distance; a slow river catching the light mid-frame; the **left 45% is dark foreground grass**, calm for type; one small riderless horse grazing at x ≈ 70%, mid-distance | 7.5 / 12 |
| **MV-10m** 4:5 | Mobile | `nano_banana_pro` 2k from MV-10, ×2 | The same light, recomposed: sun upper-right, the lower half dark | 4 / 6 |
| **MV-11** `campfire.webp` 16:9 | Voices; the ignite source | `gpt_image_2_5` 2k high ×2 | A night clearing; one small campfire in a stone ring at x ≈ 78%, y ≈ 62%; two canvas tents barely rim-lit behind it; the left 55% near-black; warm light that falls off fast; faint embers | 5.5 / 11 |
| **MV-11L** 8 s loop | Voices (desktop) | `kling3_0` pro 8 s, first = last = MV-11, `sound:"off"` | "Camera completely locked. Only the flames move gently and a few embers drift slowly upward; the glow varies ≤ 15%, never flickering faster than twice a second. Same first and last frame. No smoke bursts, sparks at camera, people, text or audio." | 14 / 28 |
| **F-RD** 21:9 | Films screen | `gpt_image_2_5` 21:9 high, ×1–2, ref MV-10 | A dusk ridge line in afterglow; one riderless horse, small and at rest, as a silhouette at the right third | 3–5.5 / 8 (preflight 21:9) |
- **Budget.** **About 35 planned, capped at 65.** This needs a **new G0 line**: raising the program cap by up to 65 (750 → ≤ 815) moves the floor to 382, and the **≥ 250 reserve stays intact**. Aryan approves it.
- **Built in code instead (0 credits).** Paper tooth (R-1), tintype (R-2), Dead Eye (R-3), the handbill (R-4), the map (R-5) and every fire sprite (R-6).
- **Acceptance, beyond MEDIA-PLAN §6 A–M:** horse anatomy at a 200% crop (4 legs, no fusions); no rider, tack logos or human traces; the fire loop passes flash analysis (`ffmpeg -threads 2 … signalstats`: per-frame luminance Δ, with the area under 25% of a 10° field); no baked-in letterbox or UI; transcode with `-an`.

## 10. Hard limits applied to RDR2 (binary; the critics run these)
- [ ] **No likenesses.** No Arthur, John, Dutch or any other character, and no actor (e.g. Roger Clark). There is no human figure anywhere in the RDR2 art. The handbill shows **only Aryan's authentic portrait**, or no portrait.
- [ ] **Nothing ripped is committed.** No screenshots, loading-screen art, journal or map scans, logo files, or **game-extracted fonts** (mod font packs). The Chinese Rocks TTF is **not committed**; only our SVG outlines are.
- [ ] **Credits.** Add `Red Dead Redemption 2 (2018)` to `WORLDS BORROWED FROM` (verify the year before ship). The legal line reads: "Fan tribute — not affiliated with Warner Bros., Disney, Vinod Chopra Films or Rockstar Games."
- [ ] **Research honesty.** TIPS are verbatim confirmed strings or marked proposed, and the Sharpe-2.0 rule appears as written. The trail map is labelled `ILLUSTRATIVE` and carries no data. Dead Eye marks only real killed rows. There is no honor or score meter about Aryan, no generated sketch near the Drawing claim, and no draft is a link. Nothing from CLAUDE.md §2 appears: the handbill shows no grades, no family, no finances and no address beyond `site.location`.
- [ ] **DRAFT-gated** (Claude supplies prompts, never phrasings): `films.rdr2.reason`, `act.3.logline`, the handbill `REWARD`, and any line on *why* RDR2 matters to Aryan.
- [ ] **Accessibility.** RM stops the trail, embers, development, loop and Dead Eye time-scale. Pause covers MV-11L. Focus parity holds on the handbill link, the journal entries and the Dead Eye toggle. AA follows the §3 tables (no text on map paper, no ghost text on the handbill). Film fonts are aria-hidden or carry an accessible name.
- [ ] **Performance.** MV-10 is never the LCP element (it sits below the fold). One decoder: MV-11L never plays alongside MV-03 or MV-09. The ignite canvas stays a singleton. Film fonts total ≤ 12 KB with `display: optional`. Mobile gets stills only, and no Dead Eye.

## 11. Decisions for Aryan (each default is already assumed above)
| # | Decision | Default |
|---|---|---|
| RD-1 | Writing becomes Arthur's journal (A), or stays on HP parchment (B) | **A** |
| RD-2 | Act title "The Frontier" (or "The Trail"); verb "Reflection" | The Frontier / Reflection |
| RD-3 | The WANTED handbill in Beyond (consider the tone for admissions readers) | ON, with REWARD left as a DRAFT |
| RD-4 | Handbill portrait: his real photo tintyped, or none | His real photo, tintyped |
| RD-5 | The Dead Eye easter egg on the kill-list | ON (desktop, opt-in) |
| RD-6 | Raise the credit cap by up to 65 for MV-10/10m/11/11L/F-RD | Approve at G0 |
| RD-7 | His photographs and sketches for the Creative block and tintypes | Required; otherwise the block ships text-only |

## 12. Sources
- **Journal:** [PC Gamer (via Yahoo)](https://tech.yahoo.com/gaming/articles/coolest-game-art-arthur-morgans-150000970.html) · [GameRant, drawing style](https://gamerant.com/red-dead-redemption-2-arthur-drawing-style/) · [TheGamer](https://www.thegamer.com/red-dead-redemption-2-arthur-best-drawings-journal/) · [ScreenRant](https://screenrant.com/rdr2-journal-entries-secrets-arthur-morgan-john-marston/) · [Fandom Journal (the Dangoor credit, REPORTED)](https://reddead.fandom.com/wiki/Journal_(RDR_2))
- **Map and Dead Eye:** [Lee Martin, Mapbox map](https://dev.to/leemartin/how-i-designed-a-red-dead-redemption-2-inspired-map-in-mapbox-studio-4gkh) · [Steam, fog of war](https://steamcommunity.com/app/1174180/discussions/0/4514380548230679294/) · [Fextralife](https://reddeadredemption2.wiki.fextralife.com/Dead-Eye) · [RDR2.org](https://www.rdr2.org/wiki/dead-eye/) · [GameRant, Dead Eye](https://gamerant.com/red-dead-redemption-2-how-to-use-dead-eye/)
- **Loading screens:** [Lee Martin, tintype](https://levelup.gitconnected.com/recreating-the-red-dead-redemption-2-tintype-loading-screen-effect-in-css-10ca87d5b9de) · [CodePen](https://codepen.io/leemartin/pen/KrKGbM) · [TCRF, unused text (REPORTED)](https://tcrf.net/Red_Dead_Redemption_2/Unused_Text)
- **Posters, camp, honor and HUD:** [Fandom, Wanted Poster](https://reddead.fandom.com/wiki/Wanted_Poster) · [Fandom, Camps](https://reddead.fandom.com/wiki/Camps) · [RDR2.org, Honor](https://www.rdr2.org/wiki/honor-system/) · [GameSpot, cores](https://www.gamespot.com/articles/red-dead-2-core-guide-how-the-health-stamina-and-d/1100-6462802/) · [brandpalettes (third party)](https://brandpalettes.com/red-dead-redemption-2-color-codes/)
- **Art direction:** [Wikipedia, Development of RDR2](https://en.wikipedia.org/wiki/Development_of_Red_Dead_Redemption_2) · [ScreenRant, Hudson River School](https://screenrant.com/rdr2-landscapes-hudson-river-school-art-western-paintings/) · [Medium, Victorian Romantic landscapes](https://jsimpson1110.medium.com/victorian-romantic-landscapes-and-work-in-red-dead-redemption-2-d80370f33714) · [Wikipedia, Music of RDR2](https://en.wikipedia.org/wiki/Music_of_Red_Dead_Redemption_2) · [Fandom, Big Valley](https://reddead.fandom.com/wiki/Big_Valley) · [Fandom, Heartlands](https://reddead.fandom.com/wiki/The_Heartlands)
- **Type:** [Fonts In Use](https://fontsinuse.com/uses/30563/red-dead-redemption) · [madegooddesigns](https://madegooddesigns.com/red-dead-redemption-font/) · [Typodermic licence](https://typodermicfonts.com/license/) · [Chinese Rocks](https://www.dafont.com/chinese-rocks.font) · [Hapna (MyFonts)](https://www.myfonts.com/collections/hapna-font-inhouse-type/) · [Rye](https://fonts.google.com/specimen/Rye) · [Homemade Apple](https://www.fontsquirrel.com/fonts/homemade-apple)
