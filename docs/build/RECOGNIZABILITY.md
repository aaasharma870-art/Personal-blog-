# RECOGNIZABILITY: blind stranger test and upgrade plan (M2-COMBINED, stage "plan")

**Date:** 2026-09-29, about 04:00 ET. **Branch audited:** `design/three-films` at `6c893c1`, production build.
**Inputs:**
- 53 frame pairs in `research/build/m2-audit/` (`FNN.captioned.png` / `FNN.blind.png`), listed in `m2-audit/manifest.json`.
- 3 blind judges (workflow `wf_b15d4c6e-f32`: agents `a1b63c85…` = J1, `ae01a305…` = J2, `a6547275…` = J3). All three verdict sets were read in full from the workflow `journal.jsonl`. The copy in the plan task was truncated after J2 · F23, and J3 was missing from it entirely.
- The captioned frames, which the planner viewed itself.
- The staged M2 media (`media/accepted/`, `media/M2-MEDIA-REPORT.md`).
- The iconic lane's first masters (`media/masters/m2iconic/`: PEARL, HALL, EXPRESS, ICE, DRONE, CAMP, all viewed; WANTED and DEADEYE were still generating).

**Authority:** AUTOPILOT.md, the RECOGNIZABILITY RULE (binding; it outranks subtlety and the SPEC's own taste rules), then SPEC v2 §7/§9/§10, ICONS.md and FONTS.md. Where this plan overrides a SPEC or ICONS rule, it says so in §3 and gives the reason.

**PASS rule:** at least 2 of 3 judges named the intended film, each with confidence ≥ 0.6, on the **blind** frame.

---

## 0. Bottom line

**15 of 53 frames pass.** The results split by world:

| World | Pass | Verdict |
|---|---|---|
| Harry Potter | 7 of 16 | The prologue is excellent: the castle plus candles plus broom score 0.95. The ignite card passes, barely (0.60–0.75). Principles, contact, the credits and every HP loader fail. |
| Pirates | 7 of 13 | The hero, journey and ship-in-a-bottle pass. The opening card, About and the compass loaders sit at 0.35–0.60: the compass alone is not enough. |
| **3 Idiots** | **0 of 12** | **Nothing passes.** Blueprints, gears and flowcharts read as "generic engineering" (0.02–0.45). There is no chalkboard, no ICE college, no drone and no "Aal izz well" anywhere on screen. The staged `board-dawn` plate is not wired. |
| **Red Dead Redemption 2** | **1 of 12** | Only the journal-sketch loader alt passes (0.60–0.65). Everything else is code sepia, blank paper or tiny icons. None of the staged plates is wired: frontier-dusk, campfire, and the WANTED text is invisible when blind. |

**Diagnosis:**
1. **The iconic media is made but not wired.** Of the 18 staged M2 assets, the site uses none, and the eight iconic plates are still arriving.
2. **Code motifs are too small and too abstract to carry a film by themselves.** Compass-only frames score about 0.55. Gears score about 0.3. Ticks, ribbons and flowcharts score about 0.1.
3. **The film is never named prominently.** Film names exist only as 11–13 px Meta ("ACT II • AFTER 3 IDIOTS"), which fails rule (b).
4. **The transition frames are muddled.** F13 still shows the Pirates ship under the blueprint; F36 reads as Pirates (2 wrong-film guesses). F20 has a hard edge.

**What fixes it:**
- **(A) Wire an iconic plate into every scene that can hold one.** §7 lists the plate for each scene.
- **(B) One shared `SceneCaption` primitive.** It names MOMENT • FILM in the world's fan face on every scene and every act card, with the film title set at display size on the cards (§4, §6).
- **(C) Bigger, truer code motifs** where there is no plate: the chalkboard frame, Jack's compass with its lid open, Marauder's-Map parchment, candles that read as candles, Dead Eye red plus X (§5, §9).
- **(D) Explicit cross-world morphs** for every pair (§8).

The expected result, if built as specified, is that every scene passes: the imagery carries the blind frames, and the captions carry the text-bound scenes. §10 gives the acceptance rules for each scene.

---

## 1. Frame-by-frame verdicts (blind)

"wrong-film" counts the judges who confidently named a *different* film. Confidence is 0–1.

| Frame | Var | Intended (film · moment) | Judges J1 / J2 / J3 (film conf) | What J1 saw (blind) | Result |
|---|---|---|---|---|---|
| F01 | def | HP · SM-1 play screen: Hogwarts over the Black Lake, candles, broom | HP .95 / HP .95 / HP .95 | Hogwarts across the Black Lake at night, floating Great Hall candles,… | **PASS** |
| F02 | def | HP · SM-1 broom flight video (HP→PC hand-off) | HP .55 / HP .50 / HP .55 | Broomstick flight at night over a glowing sea | **FAIL** |
| F03 | alt | HP · SM-1 play screen, Marauder's-Map footprints | HP .95 / HP .95 / HP .95 | Hogwarts and the Black Lake with candles, broom, and Marauder's Map… | **PASS** |
| F04 | alt | HP · SM-1 flight video, dive to the crest | HP .45 / HP .45 / HP .45 | Broom flying over the ocean toward a distant tall ship (handoff from… | **FAIL** |
| F05 | def | HP · SM-1 code flight: SVG broom past Hogwarts | HP .90 / HP .90 / HP .95 | Hogwarts at night with floating candles and a broom sweeping across | **PASS** |
| F06 | def | PC · SM-2 hero: name at sea, Pearl on the horizon | PC .80 / PC .70 / PC .65 | Black Pearl on the horizon of a stormy night sea, glowing cursed-teal… | **PASS** |
| F07 | def | PC · SM-3 opening card entering (compass) | PC .60 / PC .55 / PC .55 | Dark sea fading into Jack Sparrow's compass | **FAIL** |
| F08 | def | PC · SM-3 opening card: Jack's compass on the brass course | PC .55 / PC .50 / PC .50 | Jack's compass spinning, dotted course below it | **FAIL** |
| F09 | def | PC · About: rhumb rose, ship's-log feel | PC .45 / PC .35 / PC .40 | Nautical chart with rhumb lines and a compass rose | **FAIL** |
| F10 | def | PC · SM-4 Journey step 1: harbour (chart + compass) | PC .75 / PC .60 / PC .65 | Jack's compass pointing along a dashed course to X marks the spot | **PASS** |
| F11 | def | PC · SM-4 step 3: the break (Aztec medallion) | PC .75 / PC .60 / PC .65 | Compass needle swinging toward the X on the treasure chart | **PASS** |
| F12 | def | PC · SM-4 step 4: X + "bring me that horizon" | PC .75 / PC .60 / PC .65 | Compass settling as the route reaches the X | **PASS** |
| F13 | def | 3I · SM-5 Card I→II mid: storm → blueprint (kraken) | 3I .30 / 3I .30 / 3I .30 | Sea horizon (with ship) turning into an engineering blueprint with… | **FAIL** |
| F14 | def | 3I · SM-5 Card I→II settled: FIG. 0, "The Workshop" | 3I .35 / 3I .30 / 3I .35 | Engineering blueprint: gears, ruler, and a drafted curve (Rancho's… | **FAIL** |
| F15 | def | 3I · SM-6 gauntlet on the ICE board | 3I .20 / ?? .10 / ?? .15 | Row of classroom desks/benches with one highlighted | **FAIL** |
| F16 | def | 3I · SM-7 Trading_Algos chapter (jugaad blueprint) | ?? .10 / ?? .05 / ?? .10 | Blueprint-style flowchart of taped boxes | **FAIL** |
| F17 | def | 3I · SM-7 Optuna chapter (machine definition) | ?? .10 / ?? .05 / ?? .10 | Longer blueprint flowchart of stacked boxes | **FAIL** |
| F18 | def | 3I · SM-8 kill-list (austere) | ?? .05 / ?? .02 / ?? .05 | Plain list rows with link arrows | **FAIL** |
| F19 | def | 3I · Systems FIG (space-pen wink) | ?? .10 / ?? .05 / ?? .08 | Blueprint flowchart panel beside empty rows | **FAIL** |
| F20 | def | RD · SM-14 Card II→III mid: tintype develops | RD .35 / RD .35 / RD .35 | Transition into a hazy sepia frontier sunset silhouette | **FAIL** |
| F21 | def | RD · SM-14 settled: frontier tintype + TIP | RD .55 / RD .60 / RD .55 | Sunset over rolling hills and pines with a lasso rope and… | **FAIL** |
| F22 | def | RD · SM-15 Beyond top: golden-hour band | RD .35 / RD .40 / RD .40 | Parchment topographic map with a dashed trail | **FAIL** |
| F23 | def | RD · SM-15 satchel strip | RD .25 / RD .30 / RD .30 | Pinned parchment (wanted poster?) under a row of… | **FAIL** |
| F24 | def | RD · SM-15 WANTED handbill | RD .30 / RD .30 / RD .30 | Tall pinned parchment notice (wanted poster) | **FAIL** |
| F25 | def | RD · SM-11 Arthur's journal spread | RD .40 / RD .40 / RD .30 | Arthur's journal open, with a scales-of-justice (honor) sketch | **FAIL** |
| F26 | def | RD · SM-16 by the fire (camp) | RD .60 / RD .55 / RD .55 | Gang camp: campfire between two tents, ringed with stones | **FAIL** |
| F27 | def | HP · SM-10 ignite mid: embers → floating candles | HP .65 / HP .60 / HP .45 | Wand trail lighting floating Great Hall candles one by one | **PASS** |
| F28 | def | HP · SM-10 ignite settled: candles on the Line | HP .65 / HP .60 / HP .45 | Full curl of floating candles along the wand's path | **PASS** |
| F29 | def | HP · Principles: wand-light ribbons | HP .30 / HP .25 / HP .30 | Minimal line-art broomstick (bristles plus handle) | **FAIL** |
| F30 | def | HP · SM-12 last light: one floating candle | HP .35 / HP .35 / HP .30 | Single floating candle beside the contact button | **FAIL** |
| F31 | def | HP · SM-13 credits roll (HP bookend) | ?? .05 / ?? .02 / ?? .05 | Empty list/table rows | **FAIL** |
| F32 | def | HP · SM-13 credits end: Mischief managed, Hallows, Time-Turner | HP .50 / HP .25 / HP .35 | Footer Easter eggs: Time-Turner hourglass and Deathly Hallows sigil | **FAIL** |
| F33 | alt | PC · SM-2 hero | PC .80 / PC .70 / PC .65 | Black Pearl on a stormy horizon with a glowing teal wave | **PASS** |
| F34 | alt | PC · SM-3 opening card entering: treasure chart | PC .55 / PC .45 / PC .45 | Night sea scrolling down to a treasure-map panel | **FAIL** |
| F35 | alt | PC · SM-3 settled: X inked on Act I | PC .75 / PC .60 / PC .60 | Treasure map: island, compass rose, dotted path to the X | **PASS** |
| F36 | alt | 3I · SM-5 mid: chalk duster wipes the storm | 3I .20 / PC .30 / PC .25 | Ocean dissolving into a blueprint grid | **FAIL** (2 wrong-film) |
| F37 | alt | 3I · SM-5 settled: chalk FIG. 0 | 3I .35 / 3I .25 / 3I .35 | Engineering blueprint with gears, scale, and drafted curve | **FAIL** |
| F38 | alt | RD · SM-14 mid: Dead Eye grade | RD .40 / RD .40 / RD .40 | Red desert sunset over dunes (New Austin) | **FAIL** |
| F39 | alt | RD · SM-14 settled: X marks on the act points | RD .50 / RD .55 / RD .55 | Sunset ride with the rope trail marked at waypoints over the hills | **FAIL** |
| F40 | alt | HP · SM-10 mid: Lumos sweep lights candles | HP .70 / HP .75 / HP .70 | Glowing wand tip lighting a field of floating candles | **PASS** |
| F41 | alt | HP · SM-10 settled | HP .70 / HP .75 / HP .70 | All the Great Hall candles lit, with the golden wand trail complete | **PASS** |
| F42 | def | PC · LD-PC card loader: compass + course | PC .60 / PC .50 / PC .50 | Filmstrip of Jack's compass needle swinging toward its heading | **FAIL** |
| F43 | def | 3I · LD-3I card loader: gear gauge | 3I .30 / 3I .20 / 3I .20 | Filmstrip of gears turning along a measuring scale | **FAIL** |
| F44 | def | RD · LD-RD card loader: plate-trail | RD .30 / RD .30 / RD .25 | Filmstrip of sepia frontier cards with the rope trail | **FAIL** |
| F45 | def | HP · LD-HP card loader: ink-light | HP .55 / HP .45 / HP .35 | Filmstrip of the wand trail lighting candles | **FAIL** |
| F46 | def | PC · Route loader (About): compass | PC .55 / PC .40 / PC .40 | Jack's compass alone, needle pointing off-screen | **FAIL** |
| F47 | def | 3I · Route loader (Work): gauge | 3I .25 / 3I .15 / ?? .15 | Gears and ruler icon alone | **FAIL** |
| F48 | def | RD · Route loader (Writing): plate + TIP | RD .15 / ?? .05 / ?? .05 | Tiny dark sepia card with hill/hoof arcs | **FAIL** |
| F49 | def | HP · Route loader (Principles): ink-light | HP .20 / HP .30 / ?? .15 | Lone wand-tip spark trailing a thin golden line | **FAIL** |
| F50 | alt | PC · LD-PC: ship in a bottle | PC .75 / PC .60 / PC .60 | Black Pearl shrunk into a ship-in-a-bottle (On Stranger Tides) | **PASS** |
| F51 | alt | 3I · LD-3I: chalk derivation | 3I .45 / 3I .40 / 3I .45 | Classroom blackboard: deriving f(x)=x^2+2x, solving f'(x)=0 to get x=-1 | **FAIL** |
| F52 | alt | RD · LD-RD: journal sketch | RD .65 / RD .60 / RD .60 | Arthur Morgan sketching mountains, lake and pines in his journal | **PASS** |
| F53 | alt | HP · LD-HP: Marauder's footprints | HP .55 / HP .45 / HP .45 | Marauder's Map footprints walking along a path | **FAIL** |

**Reading notes:**
- **F02 and F04** are the HP→Pirates hand-off, mid-flight. A mixed read (broom + sea + galleon) is the *intended* crossover. They fail by rule, and the fix is a caption hand-off (S02), not new imagery.
- **F31 and F32** (credits) are `house` world carrying the HP bookend. The roll is text by nature. Its acceptance is the captioned test plus a visible Snitch, Time-Turner and Hallows (S19).
- **F18** (kill-list) is austere by SPEC D-6. The rule now requires a film cue at its header only (§3 O-5).

---

## 2. Method notes (for the re-test)
- The judges saw only `*.blind.png`. Text was removed by CSS, and shapes were kept (0 text leaks). **Captions are text, so blind frames never benefit from them.** Scenes marked **BLIND** in §10 must pass on imagery alone. Scenes marked **CAPTION** may rely on rule (b) text, but must not be *misread* blind.
- Re-capture the same 53 beats, plus the films chapter (SM-9, now enabled), plus 3 scroll points for each act-card transition, into `m2-after/`.

---

## 3. Overrides this plan makes (the rule outranks; each is reversible in data)

| # | Override | What it overrides | Why | How to reverse it |
|---|---|---|---|---|
| **O-1** | **Captions and card film titles are set in the world's fan face.** Film titles (e.g. "3 IDIOTS") and MOMENT captions are set in Pirata One, Kalam, Rye or IM Fell English, including lettered film quotes used as captions. | SPEC §9.4 ("titles in house type only; never … a fan face"); §9.7 scope (act titles, loaders and eggs only; never quotes or labels); SM-6 (board header in house type). | Rule (b), verbatim: "PROMINENT … in that world's display (fan) font". | Set `film.fontScope.extended: true` and add a new `LetteringSlot` `"caption"`. Validator #10 must accept `slot: "caption"` when extended, and add `components/primitives/scene-caption.tsx` to the display-face allow-list. |
| **O-1 guard** | These are OFL text faces, not the logos. **Never:** Mode C faces (the RDR "Redemption" face, *Lipstick*, HP logo lettering, the POTC wordmark); a bolt in the "P"; gold bevel or gradient type; a skull-and-swords emblem; a stacked red "RED DEAD / REDEMPTION" lockup; any logo layout. | ICONS H2. | A title typeset plainly in a generic OFL face is not a mark. | — |
| **O-2** | **Display-font budget rises from 24 KB to 56 KB total.** | SPEC §9.7 budget, FONTS.md. | Measured on the Google Fonts `text=` API, 09-29, all-caps plus punctuation: Pirata One 2.6 KB, Kalam 6.3 KB (9.3 KB mixed case), IM Fell English 23 KB, Rye 13 KB. The realistic caption set is about 45–50 KB. The faces stay `preload:false`, off the LCP path, and each loads only when its world's text renders. | Lower it if Aryan trims the captions. |
| **O-3** | **Rye becomes the rdr2 world face** for act title, captions and WANTED. This is FT-2 option (c), plus FT-1 for WANTED. | FONTS.md §2 left FT-2 open (Newsreader fallback). | A Western woodtype is the only way the RDR2 caption reads as RDR2. Chinese Rocks can't ship as a webfont (EULA), and its outline-only mode B is Aryan's call. | One line, `worldFontVar.rdr2`. Aryan may still pick (a) or (b). **Flag: Rye carries an RFN; we self-host Google's served subset, as FONTS.md already judged low-risk.** |
| **O-4** | **The opening card uses Act I's face** (Pirata One) for its film title and caption. The four act rows stay in Geist. | SM-3 ("the opening card never uses display faces"). | Every act card must show its film title prominently. | Per-card data. |
| **O-5** | **Kill-list header cue:** a code motif plus a caption at the section head only. Rows stay D-6 austere. | SM-8 "no icons at rest". | Rule (a) and (b): F18 scores 0.02–0.05. | Remove `cap.kill-list`. |
| **O-6** | **Credits "WORLDS BORROWED FROM" sets each title in its own face** (4 faces in one viewport). | §9.7 "≤ 1 display face per viewport". | Credits sit at the page end, so all four faces are already loaded. The credits are the one place all four worlds meet. | Data flag `credits.titlesLettered`. |
| **O-7** | **Captions name the kraken egg** ("THE KRAKEN'S STORM"). | ICONS IC-PC-05 (hidden, found on a long look). | Rule (b) outranks subtlety. | Swap the caption text. |

**Unchanged, and never overridden:**
- H1: no faces, figures or riders.
- H2: no ripped or logo files; no text baked into media, so captions, WANTED and chalk are all HTML/SVG.
- H3: the credit line.
- H4: honesty. Captions never sit beside a metric, verdict or research label. `experiment` gets **no** film styling. Quotes still render only through `<FilmQuote>`.
- H5: accessibility and performance.

---

## 4. The caption system (integrator builds it; every builder uses it)

### 4.1 Data (`lib/film.ts`)
```ts
export type SceneCaption = {
  world: Exclude<WorldId, "house">;
  /** MOMENT, in caps. Absent when `quote` is set. */
  moment?: Copy;                 // status "proposed"
  /** A registered line used as the moment (renders via <FilmQuote id rendition="lettered">). */
  quote?: QuoteId;
  /** Film name. Default: worlds[world].work.title, upper-cased. */
  film?: "auto" | false;
  variant?: "default" | "alt";   // when the default and alt imagery differ
};
captions: Record<CaptionKey, SceneCaption>   // keys: §6
```
- Add one `lettering` entry for each world's **film title** and for **every caption string**: `slot: "caption"`, face = the world face. Then re-run `scripts/fetch-display-fonts.mjs` so the subsets contain every glyph, including ’ — … “ ” , . 2 3.
- The film-title lettering strings are:
  - `PIRATES OF THE CARIBBEAN` (Pirata One)
  - `3 IDIOTS` (Kalam)
  - `RED DEAD REDEMPTION 2` (Rye)
  - `HARRY POTTER` (IM Fell English)
- Add a `FilmQuote` rendition `"lettered"`: the quote in the world face, with the attribution kept in Meta beside it. This satisfies lint #7 without special-casing it.

### 4.2 The component: `components/primitives/scene-caption.tsx` (the integrator creates it)

**Markup:**
```tsx
<p className="scene-caption" data-world="idiots" data-place="bl">
  <span className="scene-caption__moment">THE LECTURE HALL AT ICE</span>
  <span className="scene-caption__sep" aria-hidden="true">•</span><span className="sr-only">, </span>
  <span className="scene-caption__film">3 IDIOTS</span>
</p>
```
It is a `<p>`, never a heading, so there is still one `h1`. It is real text, present in the SSR and hydration-safe. `aria-hidden` is used only on the intro flight caption, which narrates a visual.

**Type:**
- **Section and loader captions:** the world face, all caps, `font-size: clamp(1.375rem, 1rem + 1vw, 2rem)` (22–32 px), letter-spacing .04em, line-height 1.1.
- **Separator:** house Geist Mono at 0.6em, so it is not a subset glyph.
- **Film span:** the same size, with the world accent colour *only if* CALC ≥ 3:1 (large text); otherwise it uses `--fg`.
- A 1 px rule 24 px long, in the world accent, sits above the caption: the "museum label" cue.

**Colour:** the moment uses the world `--fg` on its deep (CALC ≥ 7:1). Over media, a scrim `linear-gradient(to top, var(--w-deep) 0 40%, transparent 100%)` under the caption box. Probe the worst pixel under the glyph box with `tools/contrast.mjs`: ≥ 4.5:1 required, including on the alt plate.

**Placements** (`data-place`):
- `bl`: bottom-left of the media frame, 24 px inset, inside the plate's calm lower-left quarter. The iconic plates were composed to leave this zone.
- `br`: bottom-right.
- `under`: directly below the frame, left-aligned.
- `head`: the section head, above the h2 and right after the section number.

**Mobile < 640:** always `under`. The caption wraps at "•" into two lines (moment / film), minimum 20 px.

**Motion:**
- The caption rises once (R1, 400 ms) when its scene settles.
- On act cards its opacity is driven by `p` (§5).
- Under RM, Pause or NJ it is static and fully visible.
- **Never over moving media** (SPEC §9.3). Over the hero loop, MV-11L or MV-09, use `under` or `head`, or show it only on the poster/still state.

### 4.3 Act-card title block (every card, both variants): the cards builder owns it
The lower bar, left, stacked:
1. **The film title** in the world face at `--text-title` (35–76 px), all caps, `<p class="card-film">`.
2. **The act `h2`**, unchanged (lettered "The Workshop" and so on), at `clamp(1.75rem, 2.9vw, 3.1rem)`. The film title is the larger of the two.
3. **The epigraph or TIP**, unchanged (≤ 1 line).

The **moment caption** sits at the frame's `br` corner, in the fan face at `--text-heading`, over the settled still only.

The upper bar keeps the Meta `ACT n • AFTER <FILM>` and `n / IV`. Type styles per card: meta + world face + lead, which is still ≤ 3, because the film title and h2 share one face.

### 4.4 Chrome (loaders-eggs-chrome builder)
The header act label becomes `ACT II · 3 IDIOTS` (Meta, house type, replacing the act title). The menu and palette group headers use `Act II — 3 Idiots · The Workshop`.

---

## 5. Scene-by-scene plan

For each scene: frames → blind result → **imagery** (plate ids; default / alt) → **code motifs** → **caption** (key, §6) → **transition** → owner → **re-test mode** (§10).

### S01 · Prologue play screen (SM-1): F01 default, F03 alt. **PASS 0.95/0.95/0.95.**
- **Imagery:** unchanged (IN-01, IN-01-empty).
- **Caption:** `cap.intro.play` → **HOGWARTS, ACROSS THE BLACK LAKE • HARRY POTTER**, IM Fell English, `data-place="bl"`: bottom-left at y ≈ 86%, under Play, in the dark play zone. It is visible while armed, and clears with the rest of the intro text (80 ms) on Play, Skip or Esc.
- **Owner:** cards (`components/intro/**`, hand-off scope). **Re-test:** BLIND.

### S02 · Prologue flight (SM-1): F02 video default, F04 video alt, F05 code. **F05 PASS; F02 and F04 FAIL (intended mixed hand-off).**
- **Imagery:** unchanged (IN-02, IN-02-alt).
- **Caption hand-off**, `aria-hidden`, driven by flight time:
  - 0–2.5 s: `cap.intro.flight.hp` → **A BROOMSTICK OVER HOGWARTS • HARRY POTTER** (IM Fell).
  - 2.5–3.5 s: cross-dissolve.
  - 3.5 s → landing: `cap.intro.flight.pc` → **TOWARD THE BLACK PEARL • PIRATES OF THE CARIBBEAN** (Pirata One).
  - The PC caption **persists 2.5 s over the landed hero** in `data-place="br"` (below the crest bracket, not over the loop's crest). It then fades over 600 ms and never returns. This is the hero's only naming.
  - The code flight uses the same timeline, scaled to its duration.
  - Skip, Esc, RM or `?skip`: no flight captions.
- **Transition:** already smooth (registered end frame). The caption hand-off is the fix.
- **Owner:** cards. **Re-test:** CAPTION. These frames are transitional; the captioned frame must name both films.

### S03 · Hero (SM-2): F06 default, F33 alt. **PASS 0.80/0.70/0.65.**
- **No permanent caption.** Screen one is the name, and it passes blind. The S02 hand-off names the Pearl for 2.5 s.
- **Media swap**, per M2-MEDIA-REPORT §6.6: the rejected M1.5 alts become `hero-sea-mobile-alt2` (MV-02 alt) and `hero-sea-loop-alt2.*` (MV-03 alt). MV-01 has no acceptable alt: the hero ships the DEFAULT plate under both variants, with the choreography differing.
- **Transition to S04:** the hero plate's bottom 18vh feathers into `--color-deep`, with a mask gradient on the MediaFrame. **No hard sea edge** (F07 shows one today).
- **Owner:** cards (the feather is painted by the opening card's top, overlapping −18vh). **Re-test:** BLIND.

### S04 · Act I opening card (SM-3): F07/F08 default, F34/F35 alt. **F35 PASS; F07, F08 and F34 FAIL (0.45–0.6).**
- **Imagery (default):** **`iconic-pearl`**, the Black Pearl close up with tattered black sails. It takes a 2.39:1 letterboxed frame across the card's top ≈ 55% (≥ 40% of the settled viewport). It opens by aperture (`inset(8%)` → 0) *from the hero's horizon line*: "from the horizon to the ship". The program rows sit below it: the h2 left; rows plus course right.
- **Imagery (alt):** **`iconic-pearl-alt`** in the same frame; the treasure chart unfolds over the plate's lower-left and inks its X on Act I (the existing alt, which passed).
- **Code motifs:**
  - Jack's compass (96 → 120 px) sits at the head of the course, with its lid **open** (dot star chart) and the red arrow settling on row I.
  - **Jolly Roger:** our own SVG tattered black flag with a plain white skull and crossbones, ≤ 5% of frame width, registered to the Pearl's main-mast top. The builder measures the mast coordinate on the accepted plate and stores it in the plate's `focal`/`anchors`. It flutters at 0.3 Hz; static under RM. The plates carry no flag (lane rule), so this adds one legally.
- **Title block (§4.3):** the film **PIRATES OF THE CARIBBEAN** (Pirata One, `--text-title`) over the plate's lower-left, then the h2 "A research journal in four acts." (Newsreader, unchanged). The rows stay Geist, but raise the per-row Meta credit to 13 px caps (it is 11 px today).
- **Caption:** `cap.act-1` → **THE BLACK PEARL** (default), or `cap.act-1.alt` → **THE CHART TO ISLA DE MUERTA** (alt). Place `br` on the plate.
- **Transition:** the hero sea feathers to deep (S03), the Pearl frame opens on the same horizon y, and the caption rises after the aperture.
- **Owner:** cards. **Re-test:** BLIND (both variants).

### S05 · About (Act I): F09. **FAIL 0.45/0.35/0.40.**
- **Code motif:** replace the faint rhumb rose at the pillar hub with **Jack's compass at 120 px, lid open**. The red arrow turns toward the hovered or focused pillar (IC-PC-03, "points to what you want most"), and settles on pillar 1 at rest. The rhumb lattice stays at ≤ 4%.
- **Caption:** `cap.about` → **JACK'S COMPASS — IT POINTS TO WHAT YOU WANT MOST • PIRATES OF THE CARIBBEAN**, `data-place="head"`, right-aligned opposite the h2, above the pillars. It is not next to any metric (About has none).
- **Owner:** act1-pirates. **Re-test:** CAPTION. Blind must not misread; target ≥ 0.6 PC.

### S06 · Journey, the voyage (SM-4): F10, F11, F12. **PASS, marginal (0.60–0.75).**
- **Imagery:** wire the **JV** sequence (`voyage-seq/`, alt `voyage-seq-alt/`) and **MV-05a–d** stills. MV-05d is the DEFAULT, with the distant ship.
- **Code motifs:**
  - The Aztec medallion at step 3 grows to 56 px, and the moonlit-skull sweep stays.
  - The brass X stays at step 4.
  - The compass hunts and settles on each leg (as specified).
- **Captions:** swap on the active step, cross-dissolving 300 ms, `data-place="bl"` on the sticky media column (over the *still* frame; hidden while the sequence scrubs):
  1. `cap.journey.1` → **PORT ROYAL HARBOUR AT NIGHT**
  2. `cap.journey.2` → **THE FOG AROUND ISLA DE MUERTA**
  3. `cap.journey.3` → **THE CURSE OF THE AZTEC GOLD**
  4. `cap.journey.4` → quote **Q-PC-1** "Now… bring me that horizon." (lettered), and the film.

  All carry **• PIRATES OF THE CARIBBEAN**. The cartouche THE CROSSING stays.
- **Owner:** act1-pirates. **Re-test:** BLIND.

### S07 · Card I→II "Storm → Blueprint" (SM-5): F13/F14 default, F36/F37 alt. **FAIL 0.20–0.35 on all four; F36 read as Pirates by 2 judges.**
- **Imagery:**
  - The outgoing half is **MV-04 `storm`** (alt `storm-alt`). It has **no ship**, which removes F13's "pirate ship still visible" muddle; the kraken mass is under the foam.
  - The incoming half is **`iconic-ice`**, the ICE lecture hall with its blank board (alt `iconic-ice-alt`). It **replaces the navy blueprint ground.**
- **Code motifs:**
  - The **horizon becomes the chalk ledge**: MV-04's horizon y is registered to the board's chalk-ledge y, so the ragged ice-cut wipes the sea into the board along the same line.
  - Chalk dust (≤ 24 sprites) runs along the cut edge.
  - FIG. 0, "The Line", is drawn in chalk (`chalkRough`, `#f2efe6`) *on the board region*, which the builder measures from the plate, with the chalk gear gauge at its left end. Rancho's chalk circle closes the end tick.
  - Keep the FIG labels as HTML Meta.
  - **Alt:** the existing five-stroke duster wipe, over `iconic-ice-alt`.
- **Title block:** the film **3 IDIOTS** (Kalam, `--text-title`), the h2 "The Workshop" (Kalam), and the epigraph (unchanged).
- **Captions** (on the settled still), both `br`:
  - Outgoing, fading out over p .1–.35: `cap.act-2.out` → **THE KRAKEN'S STORM • PIRATES OF THE CARIBBEAN** (Pirata One).
  - Incoming, fading in over p .6–.8: `cap.act-2` → **THE LECTURE HALL AT ICE • 3 IDIOTS**. Alt: `cap.act-2.alt` → **THE ICE BOARD, WIPED CLEAN • 3 IDIOTS**.
- **Owner:** cards. **Re-test:** BLIND, plus 3 transition points.

### S08 · The gauntlet on the dawn board (SM-6): F15. **FAIL 0.10–0.20.**
- **Imagery:** wire **MV-06 `board-dawn`** as the gauntlet board: the stone colonnade window with a morning beam. The **alt** is `board-dawn-alt`, flagged: it fails board evenness (SD 12.5); accept it only with Aryan's A-gate. **Otherwise the alt variant keeps the DEFAULT plate** and differs in choreography.
- **Code motifs:**
  - The chalk gate diagram goes *on the board* (the left 60%).
  - The board header **Q-3I-2** "Pursue excellence, and success will follow." is set in **Kalam chalk** (O-1) with one chalk underline, with the Meta attribution beside it.
  - The `aalIzzWell` two-pat settle plays on the board frame's entrance.
  - The quadcopter chalk doodle egg sits bottom-right.
  - `SYNTHETIC • ILLUSTRATIVE` stays inside the figure.
- **Caption:** `cap.work` → **THE ICE CHALKBOARD • 3 IDIOTS**, `bl` on the board frame (the lower-left, away from the tally and the tablist).
- **Owner:** act2-idiots. **Re-test:** BLIND.

### S09 · Chapters: Trading_Algos (F16) and Optuna-Screener (F17), SM-7. **FAIL 0.05–0.10.**
- **Code motifs:**
  - Each blueprint panel is **framed as a chalkboard**: a wooden frame, a chalk ledge with one chalk stub and a felt duster, and a slate-green margin around the navy panel. That makes the panel read as "the ICE classroom board".
  - The jugaad register stays: bolts, tape, and every part real.
  - The one chalk circle goes around the caveat, never the number (unchanged).
- **Captions:**
  - Trading_Algos: `cap.trading-algos` → **A RANCHO-STYLE BLUEPRINT • 3 IDIOTS**, `under` the panel.
  - Optuna: `cap.optuna-screener` → quote **Q-3I-3** "A machine is anything that reduces human effort.", lettered in Kalam chalk *under the pipeline FIG* (SPEC's slot, now prominent), with `— RANCHO • 3 IDIOTS (2009)` in Meta.
  - **Never beside a metric tile.**
- **Owner:** act2-idiots. **Re-test:** CAPTION.

### S10 · Systems (F19). **FAIL 0.05–0.10.**
- **Imagery:** a new 21:9 band at the section head: **`iconic-drone`**, the homemade quadcopter in the college courtyard (alt `iconic-drone-alt`). The h2 comes after the band.
- **Code motifs:** FIG. 3 "How this page is built" (jugaad) keeps the "Why not just use a pencil?" wink (our phrasing, space-pen myth footnote).
- **Caption:** `cap.systems` → **THE HOMEMADE DRONE • 3 IDIOTS**, `bl` on the band.
- **Sensitivity (ICONS IC-3I-08):** the film's drone is tied to Joy Lobo's death.
  - The caption names no character.
  - The plate has no window or camera feed.
  - It is never linked to Aryan's own drone videography.
  - If Aryan objects, the fallback is `films-idiots` cropped to the scooter.
- **Owner:** act2-idiots. **Re-test:** BLIND (band) + CAPTION.

### S11 · Kill-list (SM-8): F18. **FAIL 0.02–0.05.**
- **Code motif (O-5):** at the section head, **Virus's astronaut pen**: an SVG space pen on a small lacquered stand, brass, 96 px, aria-hidden, by the "3 SURVIVED THE FULL PROCESS" Meta. Its site truth: in the film only the one who proves worthy earns it, and here only 3 survived. Rows stay austere.
- **Not used:** "Virus's stopwatch" (AUTOPILOT's list) is **not verified** in the film, and rule (c) requires accuracy. Use it only after Aryan confirms it.
- **Caption:** `cap.kill-list` → **VIRUS'S ASTRONAUT PEN • 3 IDIOTS**, `head`, right of the h2. It never sits on a row.
- **Dead Eye egg (SM-17):** uses `iconic-deadeye` as its media grade layer, with the Rye "DEAD EYE" toast header. It stays opt-in.
- **Owner:** act2-idiots. **Re-test:** CAPTION.

### S12 · Films chapter "Three films and a game" (SM-9): not captured (disabled). **Built in M2; all four screens must pass BLIND.**

| Screen | Plate: default / alt | Film title (h3, world face, `--text-title`) | Caption (`under`) |
|---|---|---|---|
| Pirates | `films-pirates` / `films-pirates-alt` | PIRATES OF THE CARIBBEAN | `cap.films.pirates` **THE BLACK PEARL AT ANCHOR** |
| 3 Idiots | `films-idiots` / `films-idiots-alt` | 3 IDIOTS | `cap.films.idiots` **THE YELLOW SCOOTER AT PANGONG LAKE** |
| RDR2 | `films-rdr2` / `films-rdr2-alt` | RED DEAD REDEMPTION 2 | `cap.films.rdr2` **THE HEARTLANDS AT DUSK** |
| Harry Potter | **`iconic-express`** / `films-hp` | HARRY POTTER | `cap.films.hp` **THE HOGWARTS EXPRESS** (alt: `cap.films.hp.alt` **FLOATING CANDLES AND ENCHANTED INK**) |

- Swap F-HP's default to `iconic-express`, because the ink sheet reads weakly. Keep `films-hp` as the alt.
- The F-3I and F-RD bright-sky flags (M2-MEDIA-REPORT §6.5) are solved by putting captions `under` the frame, never over it.
- Everything else follows SM-9: the line, the borrowed line, the DRAFT reason (branchPreview).
- Between screens, each `<article>` ground is its world's deep, with a 24vh gradient seam (a smooth PC→3I→RD→HP run).
- **Owner:** act4-hp-films.

### S13 · Card II→III "The tintype" (SM-14): F20/F21 default, F38/F39 alt. **FAIL 0.35–0.60.**
- **Imagery:**
  - **Default:** the plate develops into **MV-10 `frontier-dusk`** (Heartlands golden hour, riderless horse, river), replacing the code ridges.
  - **Alt:** `iconic-deadeye` (the red-sepia frozen frontier). The **settled alt keeps the Dead Eye grade** (at rest it is red today) and the 4 ember-red X marks locked on the act points.
- **Title block:** the film **RED DEAD REDEMPTION 2** (Rye, `--text-title`), then the h2 **THE FRONTIER** (Rye, O-3), then TIP (unchanged).
- **Caption:** `cap.act-3` → **THE HEARTLANDS AT GOLDEN HOUR** (default) or `cap.act-3.alt` → **DEAD EYE** (alt), plus **• RED DEAD REDEMPTION 2**, `br`.
- **Transition (F20's hard edge):**
  - The kill-list's 3I grid already thins to 0. Add a **ground crossfade** from `--idi-canvas` to `--color-deep` over the kill-list's last 30vh.
  - The card opens house deep → rd deep (two stacked grounds, opacity).
  - The films chapter's last warm point (HP screen) sinks into the low sun. When films is disabled, the chalk circle's end point becomes the sun.
- **Owner:** cards. **Re-test:** BLIND, plus 3 transition points.

### S14 · Beyond, the frontier (SM-15): F22 band, F23 satchel, F24 handbill. **FAIL 0.25–0.40.**
- **Band:** wire **MV-10** (mobile **MV-10m**; alt `frontier-dusk-alt` / `-mobile-alt`) as the 16:9 golden-hour band. It is the developed plate from S13, a declared reuse, so there is no cut.
  - Caption: `cap.beyond` → **THE HEARTLANDS • RED DEAD REDEMPTION 2**, `bl` in the dark left foreground under the h2.
- **Satchel (F23):**
  - Redraw it as a **leather satchel outline** (flap, strap, buckle) with his real kit spilling from it: camera, sketchbook and charcoal, drone, shoes. Each icon ≥ 48 px (≈ 24 px today).
  - Only true objects: **no hat in the kit**.
  - Caption: `cap.beyond.satchel` → **WHAT'S IN THE SATCHEL • RED DEAD REDEMPTION 2**, `head` of the Creative block.
- **Handbill (F24):**
  - Mount the HTML handbill **on `iconic-wanted`**, the weathered notice board with blank posters. The handbill registers over the central blank poster, using the builder-measured box from the accepted plate. The neighbouring blank posters stay blank paper.
  - "WANTED" is set in **Rye** (O-3/FT-1) with nails and a torn corner.
  - The facts stay verbatim in Newsreader. No bounty, no face, no crimes.
  - Caption: `cap.beyond.handbill` → **A WANTED POSTER • RED DEAD REDEMPTION 2**, `under` the board.
  - The board plate carries no warm-family conflict: the golden-hour band is ≥ 1 viewport above.
- **Owner:** act3-rdr2. **Re-test:** BLIND for the band and handbill; CAPTION for the satchel.

### S15 · Writing, the journal (SM-11): F25. **FAIL 0.30–0.40.**
- **Code motifs:**
  - The right page shows, **at rest**, a full-page **graphite frontier sketch**: ridge line, pines, lake, a small riderless horse, the date corner. It is the passing LD-RD-alt sketch grammar (F52, 0.60–0.65) at page scale.
  - The hover vignettes still replace it for each entry.
  - Add a pasted-clipping corner and a pencil-hatched margin rule.
  - The red pencil underline stays. DRAFT chips stay non-links.
- **Caption:** `cap.writing` → **ARTHUR MORGAN'S JOURNAL • RED DEAD REDEMPTION 2**, `head` on the left page above ENTRY I, in Rye on the paper tokens. CALC for Rye ink on `#ebe0c6`: use `--fg` at 11.69.
- **Owner:** act3-rdr2. **Re-test:** BLIND.

### S16 · Voices, by the fire (SM-16): F26. **FAIL 0.55–0.60.**
- **Imagery:**
  - **Default:** **`iconic-camp`**: tents, wagon, hitched horses, the fire, a lake sunset. It runs full-bleed, with a left scrim (`--rd-deep` from 0.9 → 0 across the left 55%) under the three quotes.
  - **Alt:** **MV-11 `campfire`** plus the **MV-11L** loop (the existing SM-16 design; desktop, one decoder).
- **Caption:**
  - Default: `cap.voices` → **THE GANG'S CAMP AT DUSK • RED DEAD REDEMPTION 2**, `br`.
  - Alt: `cap.voices.alt` → **THE CAMPFIRE • RED DEAD REDEMPTION 2**, `under` (the loop moves).
- **Hand-off:** export the fire's position (`anchors.fire`) from the plate row so the ignite card's embers rise from the *same* x/y.
- **Owner:** act3-rdr2 (the plate); the integrator adds `anchors`. **Re-test:** BLIND.

### S17 · Card III→IV "Embers → the Line ignites" (SM-10): F27/F28 default, F40/F41 alt. **PASS (0.60–0.75); J3 scored the default only 0.45.**
- **Imagery:**
  - p .7–.85: **MV-07 `lights-line`** (candles along the Line; alt `lights-line-alt`).
  - p > .85: the state swaps to **`iconic-hall`**, the Great Hall with floating candles over the long tables under the starry ceiling (alt `iconic-hall-alt`).
  - Both variants settle on the hall.
- **Code motifs:**
  - Embers rise from Voices' `anchors.fire`.
  - In the alt, a Lumos wand-tip light sweeps the hall (existing).
- **Title block:** the film **HARRY POTTER** (IM Fell, `--text-title`), then the h2 "The Light", then the epigraph Q-HP-3 (excerpt, unchanged).
- **Captions**, both `br`:
  - Outgoing, fading out over p .05–.3: `cap.act-4.out` → **THE CAMPFIRE • RED DEAD REDEMPTION 2** (Rye).
  - Incoming, over p > .85: `cap.act-4` → **THE GREAT HALL • HARRY POTTER** (default), or `cap.act-4.alt` → **LUMOS — THE GREAT HALL LIGHTS UP • HARRY POTTER** (alt).
- **Owner:** cards. **Re-test:** BLIND, plus 3 transition points.

### S18 · Principles (Act IV): F29. **FAIL 0.25–0.30.**
- **Default code motif: the Marauder's Map.**
  - The section ground becomes aged parchment (the hp parchment tokens, fold creases ≤ 3%).
  - Ink corridors connect the five principles as "rooms".
  - Footprint pairs (IC-HP-06 grammar) **walk to the active principle**, scroll-driven, and fade behind.
  - Under RM the trail is static.
  - Text on the parchment uses the paper tokens (AA already CALC'd).
- **Alt code motif: Lumos.** Dark hp ground; one floating candle per principle (≥ 28 px taper, flame and halo, a canvas sprite or SVG). Each candle lights as its row enters. The ribbons stay as the underline.
- **Captions** (`head`, right of the h2):
  - Default: `cap.principles` → **THE MARAUDER'S MAP • HARRY POTTER**.
  - Alt: `cap.principles.alt` → **LUMOS • HARRY POTTER**.
- **Transition:** out of S17 the hall plate darkens to hp deep. Default: the parchment unfolds from the centre (3 panels, transform only). Alt: the hall's candles persist as the principles' candles.
- **Owner:** act4-hp-films. **Re-test:** BLIND.

### S19 · Contact, last light (SM-12) and Credits (SM-13): F30, F31, F32. **FAIL (0.02–0.50).**
- **Contact imagery:** wire **MV-08 `last-light`** with the **MV-09** loop (alt `last-light-alt` + `last-light-loop-alt`). The bracket closes on the AS monogram over the flame.
- **Contact caption:** `cap.contact` → **A FLOATING CANDLE FROM THE GREAT HALL • HARRY POTTER**, `under` the plate on mobile, `head` on desktop (the loop moves).
- **Credits:**
  1. **The Snitch must be visible at rest** beside "↑ Back to the opening". F32 shows none: either a bug or the pre-dart state. The resting state must render without needing the dart.
  2. The Time-Turner icon grows to 24 px; the Hallows end mark to 16 px.
  3. "WORLDS BORROWED FROM" sets each work title in its own face (O-6).
  4. The last line, **Q-HP-2 "Mischief managed."**, is lettered in IM Fell at `--text-heading`, with a short ink fold-line drawing closed under it (the Map closing).
  5. `cap.credits` is not needed: the lettered quote carries its attribution.
- **Owner:** act4-hp-films (contact); loaders-eggs-chrome (footer, credits, Snitch). **Re-test:** contact BLIND; credits CAPTION.

### S20 · World loaders (§8): card size F42–F45 / F50–F53; route size F46–F49.

| World | Default (card size) | Alt | Blind now |
|---|---|---|---|
| **PC** | Jack's compass ≥ 64 px with its **lid open** (star chart) and red arrow. The progress head is a **3-masted, black-tattered-sail ship silhouette** sailing the dashed course to a brass X. | Ship in a bottle (passes 0.75/0.60/0.60). Make the sails black and tattered. | def FAIL 0.40–0.60 / alt PASS |
| **3I** | A **mini ICE chalkboard**: slate green, wooden frame, chalk ledge with a chalk stub and duster. The gear gauge is drawn *in chalk* on it. After 5 s the stall caption Q-3I-1 "Aal izz well — still loading." (existing). | The chalk derivation *on the same mini board* (framed; today it floats on navy). | FAIL 0.15–0.45 |
| **RD** | **Swap:** the journal sketch (passing, 0.60–0.65) becomes the DEFAULT. | New alt, **Dead Eye**: a red-sepia CSS plate (`--w-deadeye`) on which 4 ember X marks lock one per 25% of progress, then "fire once" (≤ 120 ms flash, WCAG-safe). No reticle, no gun. | def FAIL 0.05–0.30 / alt PASS |
| **HP** | **Floating candles light one by one** along the ink line. Each is a taper, flame and halo ≥ 12 px tall at card size (today they are ticks). | **Marauder's Map:** a parchment tile with ink corridor lines; the footprints walk them. | FAIL 0.15–0.55 |

- **Route cards (F46–F49):** the loader art is ≥ 200 px (≈ 90–150 px today). The title block is the film name (world face, 28–32 px) over the act title lettering (existing).
- **Route-card captions,** under the loader, one per world and variant:

  | World | Default | Alt |
  |---|---|---|
  | PC | `cap.loader.pirates` **JACK'S COMPASS** | `.alt` **THE BLACK PEARL IN A BOTTLE** |
  | 3I | `cap.loader.idiots` **THE ICE CHALKBOARD** | `.alt` **A DERIVATION ON THE ICE BOARD** |
  | RD | `cap.loader.rdr2` **ARTHUR MORGAN'S JOURNAL** | `.alt` **DEAD EYE** |
  | HP | `cap.loader.hp` **THE FLOATING CANDLES** | `.alt` **THE MARAUDER'S MAP** |

  Each is followed by "• <FILM>". The TIP (RD) and status text stay.
- **"Never text inside a loader SVG" still holds:** captions and titles are HTML.
- **Owner:** loaders-eggs-chrome. **Re-test:** BLIND at card size; CAPTION at route size.

---

## 6. Caption master table (integrator puts these in `lib/film.ts` `captions`; all `status: "proposed"`)

**Format:** MOMENT • FILM (film auto). Faces:
- pirates = Pirata One
- idiots = Kalam
- rdr2 = Rye (O-3)
- hp = IM Fell English

| Key | World | Moment (exact; caps) or quote | Where | Place | Var |
|---|---|---|---|---|---|
| `cap.intro.play` | hp | HOGWARTS, ACROSS THE BLACK LAKE | intro play screen | bl (below Play) | both |
| `cap.intro.flight.hp` | hp | A BROOMSTICK OVER HOGWARTS | flight 0–2.5 s (aria-hidden) | bl | both |
| `cap.intro.flight.pc` | pirates | TOWARD THE BLACK PEARL | flight 3.5 s → hero +2.5 s | br | both |
| `cap.act-1` | pirates | THE BLACK PEARL | opening card plate | br | default |
| `cap.act-1.alt` | pirates | THE CHART TO ISLA DE MUERTA | opening card plate | br | alt |
| `cap.about` | pirates | JACK'S COMPASS — IT POINTS TO WHAT YOU WANT MOST | about head | head | both |
| `cap.journey.1` | pirates | PORT ROYAL HARBOUR AT NIGHT | journey media, step 1 | bl | both |
| `cap.journey.2` | pirates | THE FOG AROUND ISLA DE MUERTA | step 2 | bl | both |
| `cap.journey.3` | pirates | THE CURSE OF THE AZTEC GOLD | step 3 | bl | both |
| `cap.journey.4` | pirates | quote **Q-PC-1** (lettered) | step 4 | bl | both |
| `cap.act-2.out` | pirates | THE KRAKEN'S STORM | card I→II, p .1–.35 | br | both |
| `cap.act-2` | idiots | THE LECTURE HALL AT ICE | card I→II settled | br | default |
| `cap.act-2.alt` | idiots | THE ICE BOARD, WIPED CLEAN | card I→II settled | br | alt |
| `cap.work` | idiots | THE ICE CHALKBOARD | gauntlet board | bl | both |
| (board header) | idiots | quote **Q-3I-2** in Kalam chalk (lettered) | board top margin | — | both |
| `cap.trading-algos` | idiots | A RANCHO-STYLE BLUEPRINT | under the chapter panel | under | both |
| `cap.optuna-screener` | idiots | quote **Q-3I-3** in Kalam chalk (lettered) | under the pipeline FIG | under | both |
| `cap.systems` | idiots | THE HOMEMADE DRONE | systems band | bl | both |
| `cap.kill-list` | idiots | VIRUS'S ASTRONAUT PEN | kill-list head | head | both |
| `cap.films.pirates` | pirates | THE BLACK PEARL AT ANCHOR | films screen | under | both |
| `cap.films.idiots` | idiots | THE YELLOW SCOOTER AT PANGONG LAKE | films screen | under | both |
| `cap.films.rdr2` | rdr2 | THE HEARTLANDS AT DUSK | films screen | under | both |
| `cap.films.hp` | hp | THE HOGWARTS EXPRESS | films screen | under | default |
| `cap.films.hp.alt` | hp | FLOATING CANDLES AND ENCHANTED INK | films screen | under | alt |
| `cap.act-3` | rdr2 | THE HEARTLANDS AT GOLDEN HOUR | card II→III settled | br | default |
| `cap.act-3.alt` | rdr2 | DEAD EYE | card II→III settled | br | alt |
| `cap.beyond` | rdr2 | THE HEARTLANDS | beyond band | bl | both |
| `cap.beyond.satchel` | rdr2 | WHAT'S IN THE SATCHEL | Creative block head | head | both |
| `cap.beyond.handbill` | rdr2 | A WANTED POSTER | under the notice board | under | both |
| `cap.writing` | rdr2 | ARTHUR MORGAN'S JOURNAL | left page head | head | both |
| `cap.voices` | rdr2 | THE GANG'S CAMP AT DUSK | voices plate | br | default |
| `cap.voices.alt` | rdr2 | THE CAMPFIRE | under the loop | under | alt |
| `cap.act-4.out` | rdr2 | THE CAMPFIRE | card III→IV, p .05–.3 | br | both |
| `cap.act-4` | hp | THE GREAT HALL | card III→IV settled | br | default |
| `cap.act-4.alt` | hp | LUMOS — THE GREAT HALL LIGHTS UP | card III→IV settled | br | alt |
| `cap.principles` | hp | THE MARAUDER'S MAP | principles head | head | default |
| `cap.principles.alt` | hp | LUMOS | principles head | head | alt |
| `cap.contact` | hp | A FLOATING CANDLE FROM THE GREAT HALL | contact | head / under | both |
| (credits end) | hp | quote **Q-HP-2** (lettered, IM Fell) | credits last line | — | both |
| `cap.loader.pirates` / `.alt` | pirates | JACK'S COMPASS / THE BLACK PEARL IN A BOTTLE | route card | under loader | def / alt |
| `cap.loader.idiots` / `.alt` | idiots | THE ICE CHALKBOARD / A DERIVATION ON THE ICE BOARD | route card | under loader | def / alt |
| `cap.loader.rdr2` / `.alt` | rdr2 | ARTHUR MORGAN'S JOURNAL / DEAD EYE | route card | under loader | def / alt |
| `cap.loader.hp` / `.alt` | hp | THE FLOATING CANDLES / THE MARAUDER'S MAP | route card | under loader | def / alt |

**Card film titles (lettering, `--text-title`):** PIRATES OF THE CARIBBEAN · 3 IDIOTS · RED DEAD REDEMPTION 2 · HARRY POTTER.

**Accuracy notes** (rule c; verify before `confirmed`):
- Port Royal, Isla de Muerta and the Aztec-gold curse come from *Curse of the Black Pearl* (2003).
- The bottled Pearl is from *On Stranger Tides* (2011).
- ICE is the film's Imperial College of Engineering.
- The yellow scooter at Pangong lake is the final scene.
- The astronaut pen is Virus's pen, kept for a worthy student and finally given to Rancho.
- The gang's camp, the Heartlands, Dead Eye, WANTED posters and Arthur Morgan's journal are all RDR2.
- The first-years' Black Lake crossing, the Great Hall's floating candles and enchanted ceiling, the Hogwarts Express and the Marauder's Map are all HP.
- **Unverified, so not used:** "Virus's stopwatch".

---

## 7. Media wiring

### 7.1 Staged M2 assets (the integrator copies all of them to `public/media/films/` and registers each)

| Asset (DEFAULT / ALT) | Media id | Wire into | Note |
|---|---|---|---|
| `storm` / `storm-alt` | MV-04 | S07 card I→II, outgoing half | No ship; kraken egg |
| `voyage-a…d` (+ `-alt`) | MV-05a–d | S06 journey stills, mobile/RM | Keep the MV-05d DEFAULT (with the ship). Swapping one breaks JV |
| `voyage-seq/`, `voyage-seq-alt/` | JV | S06 desktop scrub | JV-2 tail-anchored (disclosed) |
| `board-dawn` / `board-dawn-alt` | MV-06 | S08 gauntlet board | The ALT fails evenness: register it, but the alt variant uses the DEFAULT until Aryan accepts it |
| `frontier-dusk` / `-alt` | MV-10 | S13 settled + S14 band | Declared reuse |
| `frontier-dusk-mobile` / `-alt` | MV-10m | S14 mobile | — |
| `campfire` / `-alt` | MV-11 | S16 **alt** variant | The iconic-camp is the default |
| `campfire-loop.*` / `-alt.*` | MV-11L | S16 alt, desktop | One decoder |
| `lights-line` / `-alt` | MV-07 | S17 p .7–.85 | Then iconic-hall |
| `last-light` / `-alt` | MV-08 | S19 contact | DEFAULT trail flag (x ≈ .44), disclosed |
| `last-light-loop.*` / `-alt.*` | MV-09 | S19 contact, desktop | — |
| `films-pirates`, `films-idiots`, `films-rdr2` (+ `-alt`) | F-PC, F-3I, F-RD | S12 screens | Captions `under` (bright skies) |
| `films-hp` / `-alt` | F-HP | S12 HP screen **alt** | The default becomes iconic-express |
| `hero-sea-mobile-alt2` | MV-02 alt | Hero mobile alt | Replaces the rejected M1.5 alt |
| `hero-sea-loop-alt2.*` | MV-03 alt | Hero loop alt | Replaces the rejected M1.5 alt |

### 7.2 Iconic plates (the lane is generating them; the integrator pre-registers them `planned`, and the assembler flips them to `accepted`)

| Id (+ `-alt`) | Masters seen | Wire into | Fallback while planned |
|---|---|---|---|
| `iconic-pearl` | pearl_b ✓ (a retrying) | S04 opening card (both variants) | `films-pirates` (F-PC), cropped 2.39:1 |
| `iconic-ice` | ice_a, ice_b ✓ | S07 card I→II incoming board | `board-dawn` (MV-06) |
| `iconic-drone` | drone_a, drone_b ✓ | S10 systems band | `films-idiots`, cropped to the scooter (no band on mobile) |
| `iconic-hall` | hall_a, hall_b ✓ | S17 settled; HP films alt option | MV-07 `lights-line` |
| `iconic-express` | express_a, express_b ✓ | S12 F-HP default | `films-hp` |
| `iconic-camp` | camp_a, camp_b ✓ | S16 voices default | MV-11 `campfire` |
| `iconic-wanted` | pending | S14 handbill board | A CSS plank board (`--rd-deep` + 3 plank gradients + nails) |
| `iconic-deadeye` | pending | S13 alt; SM-17 egg grade; LD-RD alt (CSS grade only) | A CSS red-sepia grade over MV-10 |

- **Every plate row needs** `anchors` (builder-measured on the accepted plate):
  - `pearl.mastTop`
  - `ice.boardRect` and `ice.ledgeY`
  - `camp.fire`
  - `wanted.posterRect`
  - `hall.lineStart`
- **Pre-register them with provisional anchors** so builders code against the data and never against magic numbers.

**Optional extra plate, only if the iconic lane has credits left after the eight (P2; one count-2 batch):**
- `iconic-hat`, for the RDR route-card and 404 backdrop, or the F-RD alt.
- **Prompt, in the lane's own template language:** "a weathered brown cowboy hat hanging from the saddle horn of a riderless saddled horse tied at a split-rail fence, a leather satchel over the fence post, open Heartlands grassland at golden hour, long shadows."
- **Exclusions:** no person, rider or face, and no text.

Nothing else is requested: every other scene's gap is closed by code motifs and captions.

---

## 8. Transitions: every world pair (rule d)

| # | Pair (page order) | Today | Fix | Owner |
|---|---|---|---|---|
| T1 | prologue **HP → Pirates** hero (`flight`) | Smooth: the registered end frame; only the mixed read | Caption hand-off HP → PC over the flight, persisting 2.5 s on the hero (S02) | cards |
| T2 | hero → Act I card (PC) | **Hard sea edge** (F07) | The hero's bottom 18vh feathers to deep; the Pearl frame opens by aperture from the same horizon y (S03–S04) | cards |
| T3 | Journey **PC → 3I** (`seam`) | **Hard diagonal; the ship persists** (F13); alt read as PC (F36) | MV-04 without the ship. Horizon ↔ chalk-ledge registration; chalk dust on the cut; teal foam desaturates to chalk white over p .15–.75; caption crossfade PC→3I. Alt: duster wipe over iconic-ice-alt (S07) | cards |
| T4 | card I→II → work (3I) | Blueprint → dark grid | Board to board: the ICE hall board's green-black crossfades into board-dawn's slate over the first 30vh of `work`; FIG. 0 chalk erases as the gate chalk draws | act2-idiots |
| T5 | kill-list **3I → house** films | Grid → plain | The grid thins to 0 (spec) and the ground crossfades `--idi-canvas` → `--color-deep` over the last 30vh | act2-idiots |
| T6 | films screens PC→3I→RD→HP (house) | Not built | Each article's ground is its world deep, with 24vh gradient seams; the finales run in act order | act4-hp-films |
| T7 | films (house) **→ RDR2** (`tintype`) | **Hard edge** (F20) | The HP screen's warm point sinks into the low sun. House deep → rd deep (stacked grounds). The plate develops into MV-10 (S13). Without films, the kill-list's chalk-circle point becomes the sun | cards |
| T8 | card II→III → beyond (RD) | Code plate → plain | The developed MV-10 **is** the Beyond band (0 cut) | act3-rdr2 |
| T9 | beyond → writing → voices (RD) | Dome seams | The paper plane rises (existing). Out of writing, the page recedes into dusk and the camp plate fades up from `--rd-deep` | act3-rdr2 |
| T10 | voices **RD → HP** (`ignite`) | Smooth (embers → candles) | Embers start at the camp plate's `anchors.fire`; caption crossfade RD→HP; settles on iconic-hall (S17) | cards |
| T11 | card III→IV → principles (HP) | Black → dark | The hall darkens to hp deep. Default: the parchment unfolds. Alt: the hall's candles stay as the principle candles (S18) | act4-hp-films |
| T12 | contact **HP → house** credits | Plain | The last-light trail continues as the credits' ink fold. hp deep → color deep over 30vh. "Mischief managed." closes the fold | loaders-eggs-chrome |

**Rules for every transition:**
- Opacity and transform only.
- Under RM, Pause or NJ, each card shows its static settled title card with the caption.
- Mobile < 640 uses the static composition (no scrub), with captions `under`.

---

## 9. Code motifs by owner (0 credits)

- **cards:**
  - Hero bottom feather.
  - Pearl aperture, plus the Jolly Roger flag registered to `pearl.mastTop`.
  - Open-lid compass on the course.
  - Storm→ICE horizon/ledge registration, chalk dust, chalk FIG. 0 and gauge on the board.
  - Duster alt.
  - Tintype → MV-10, and Dead Eye alt settled with red grade and X marks.
  - Embers from `anchors.fire` → candles → hall; Lumos alt.
  - All card title blocks.
  - Caption crossfades.
  - Flight caption hand-off.
- **act1-pirates:**
  - About compass (120 px, lid open, star chart, needle to hovered pillar).
  - Journey JV/stills, 56 px Aztec medallion, step captions.
- **act2-idiots:**
  - board-dawn board, Kalam chalk header, `aalIzzWell` settle, quadcopter doodle egg.
  - Chalkboard frames (wood, ledge, chalk stub, duster) around chapter blueprints.
  - Lettered machine definition.
  - Systems drone band.
  - Kill-list astronaut pen.
  - Grid-to-deep crossfade.
- **act3-rdr2:**
  - MV-10 band.
  - Satchel redraw at ≥ 48 px.
  - WANTED handbill on the board with Rye WANTED, nails and torn corner.
  - Journal rest-state landscape sketch and clipping.
  - Camp plate with scrim; alt MV-11 and loop.
- **act4-hp-films:**
  - Marauder's-Map principles (parchment, corridors, footprints); Lumos candles alt.
  - Last light.
  - Films chapter with fan-face h3s and captions.
- **loaders-eggs-chrome:**
  - The 4 loaders × 2 variants (§5 S20); route cards at ≥ 200 px.
  - Header `ACT II · 3 IDIOTS`.
  - Snitch at rest, Time-Turner 24 px, Hallows 16 px, lettered "Mischief managed.", titles in their own faces in the credits.
  - Dead Eye egg with the iconic-deadeye grade.
- **integrator:**
  - The `SceneCaption` primitive and CSS.
  - `captions` data, `lettering` caption entries, `fontScope.extended`, O-2 budget.
  - FONTS.md updated for Rye as the rdr2 face.
  - Validator #10 allow-list (`scene-caption.tsx`, slot `caption`).
  - `FilmQuote` rendition `lettered`.
  - Media rows plus `anchors`.

---

## 10. Re-test acceptance (the retest judges and the fixer use this)

| Mode | Scenes | Pass condition |
|---|---|---|
| **BLIND** | S01, S03, S04 (both variants), S06, S07 (both), S08, S10 band, S12 (4 screens), S13 (both), S14 band and handbill, S15, S16 (both), S17 (both), S18 (both), S19 contact, S20 card-size loaders (both) | ≥ 2 of 3 blind judges name the right film at ≥ 0.6. **0 wrong-film guesses on act cards.** |
| **CAPTION** | S02 flight, S05 about, S09 chapters, S11 kill-list, S14 satchel, S19 credits, S20 route cards | The captioned frame names film + moment, legible at a glance (a judge calls it "unmistakable"). Blind: no confident wrong-film guess (≥ 0.5). |
| **TRANSITION** | T1–T12 (3 scroll points per card; T4/T5/T9/T11/T12 at section boundaries) | No hard edge or hard cut visible in any frame. The mid frame shows both worlds, and the caption belongs to the dominant world. |
| **Guards** | All | Captions AA (probe ≥ 4.5:1 on media; ≥ 3:1 only for ≥ 24 px); one h1; 0 hydration or console errors; RM/Pause static with captions present; mobile 390 captions `under` with no overflow; no caption beside a metric or verdict; no text baked into any plate; `experiment` without film styling. |

**Flags for Aryan** (none blocks the build):
- O-1 to O-7.
- Drone sensitivity (S10).
- The stopwatch is unverified (S11).
- The Rye RFN (O-3).
- The board-dawn ALT's evenness (S08).
- `iconic-express` recreates a famous landmark angle (L2 #4 "subject, not the shot": the media lane decides).
- Every caption string is `proposed` until he signs (`copySignedOff`).

---

## 11. Final re-test (M2 fix round, 2026-09-29)

**Sources:**
- Blind re-test #2 (`m2-review/BLIND-2.md`) of the first `m2-after2` capture at `daac296`, with 3 judges and 84 frames.
- Critic round 2 (`m2-review/CRITIC-2.md`).
- The fix round `d4a2cd8`, which re-captured `m2-after2` in place (164 frames) but was **not re-judged**.

**How to read the Result column:** it is the last *judged* result. Where the fix round then changed the scene and re-captured it, the column also says **"fixed after re-test, not re-judged"**. Any improvement from that fix round is an expectation only; the next measurement is the M5 blind test.

**Scores:** each is J1/J2/J3 confidence for the intended film. PASS means at least 2 of 3 judges were at ≥ 0.6.

**Overall:**
- BLIND-mode frames: **35 / 44 pass**. The audit found 15/53 (all frames), and re-test #1 found 25/43.
- By world (BLIND mode): Pirates 10/10, Harry Potter 11/12, RDR2 9/12, 3 Idiots 5/10.
- Wrong-film frames: 8 under the scorer of the time. Under the corrected scorer they drop to 2, both enter frames that legitimately show the outgoing world.

| Scene | Frames (round 2) | Mode | Final blind result | PASS/FAIL | Remaining gaps |
|---|---|---|---|---|---|
| S01 Prologue play screen | D00-intro-play (A00 judged as identical) | BLIND | HP .95/.95/.95 | **PASS** | None. |
| S02 Prologue flight | D/A00-intro-flight-early/mid/late, -landed | CAPTION | early: HP .50–.55 (D), PC .45–.50 (A). mid/late: PC .55–.65. landed: PC .55–.65. **Invalid measurement:** the blind shots were ~2 s late. Harness fixed after re-test, not re-judged. | **Unmeasured** (FAIL on record) | Needs a valid blind + captioned re-test. The early beat's broom-over-sea is a genuine blend; the caption carries it. |
| S03 Hero | D01, A01 | BLIND | PC .60/.65/.55, both variants | **PASS** (marginal) | Default bracket re-centred on the Pearl; caption dimming and the ghost caption are fixed. Fixed after re-test, not re-judged. The ship was **not** enlarged (still about 35 px). |
| S04 Act I opening card | D/A10-act-1-enter/mid/settled | BLIND + TRANSITION | enter .80; mid .85–.90; settled D .65–.75, A .80–.85 | **PASS** (both variants, all 3 points) | None. |
| S05 About | D20-about-120 | CAPTION | PC .60/.55/.65; 0 wrong-film | **PASS** | Compass 144 px, caption under it on mobile. Fixed after re-test, not re-judged. |
| S06 Journey, the voyage | D21, D22, D23 (A judged as identical) | BLIND | PC .70–.85 | **PASS** | Step 3 caption retitled "CALYPSO'S STORM" (proposed). |
| S07 Card I→II Storm → ICE | D10-act-2-enter/mid/settled, A10-act-2-mid/settled | BLIND + TRANSITION | enter PC .70–.75 (the outgoing world); mid 3I .50–.55; settled 3I .55–.60 | **FAIL** (settled, both variants) | "A generic classroom." Rancho's homemade drone is now chalked large on the board (alt: the duster wipe reveals it, caption "THE HOMEMADE DRONE, CHALKED AT ICE", proposed). The storm enters with its crest lit. Fixed after re-test, not re-judged. **Open:** the alt enter frame's top is still dark (weak crest on the alt storm plate). |
| S08 Gauntlet on the ICE board | D25-work-700 | BLIND | ?? .10/.05/.00: a **capture miss** (stale scroll offset, no board in frame). Re-test #1 on the board: 3I .50/.55/.55. | **FAIL** (unmeasured this round) | Re-captured as D25/A25-work-board, not re-judged. On re-test #1's evidence the board is marginal. |
| S09 Chapters | D26 Trading_Algos; D/A27 Optuna | CAPTION | D26 ?? .25/.15, 3I .30. D27 3I .55/.55/.60. 0 wrong-film on both. | **FAIL** by the ≥ 0.6 scorer; the §10 CAPTION blind guard is met | D26's caption was off-screen when the board entered; it now sits above the board. Fixed after re-test, not re-judged. Whether the captioned frames are "unmistakable" has not been judged. |
| S10 Systems (drone band) | D29, A29 | BLIND | 3I .70–.75, both variants | **PASS** | Its hard scrim edge (critic 2 #1) is fixed. |
| S11 Kill-list | D30 (A30 judged as identical) | CAPTION | 3I .70/.55/.70, reading the pen plate as "Virus's pen" | **PASS** | A30 ≈ D30 (the alts barely differ). Not fixed. |
| S12 Films chapter (4 screens) | D/A43–46 | BLIND | PC .85–.92; 3I .85–.90; RD .60–.65; HP .80–.95 | **PASS** (8/8) | The RDR2 screen is marginal ("fairly generic western"). Finale strokes are cleaned up (fixed after re-test, not re-judged). |
| S13 Card II→III tintype | D/A10-act-3-enter/mid/settled | BLIND + TRANSITION | enter RD .40 (D), .55–.60 (A), mostly black. mid and settled RD .70–.85. | **PASS** (settled, both variants); enter FAIL | The develop is now even and tied to in-view progress, and the blobs are gone. Fixed after re-test, not re-judged. **Open:** no pinned stage (the validator caps pinned stages at 2), so mid == settled and the develop is not seen. The enter frame stays dark. |
| S14 Beyond | band D32; satchel D33-beyond-950; WANTED D34-beyond-1900, D/A35 | BLIND (band, WANTED); CAPTION (satchel) | band RD .70–.75. WANTED board (D/A35) RD .55–.70. D34 ?? .00–.20 and D33 RD .40–.45 were **capture misses** (stale offsets). | Band **PASS**; WANTED **PASS** (via D/A35); satchel **unmeasured** | Re-aimed as D/A33-beyond-satchel and D/A34-beyond-wanted. The band now opens closer than the Act III plate. Fixed after re-test, not re-judged. |
| S15 Writing, the journal | D36, D37 | BLIND | head .55/.60/.55; lower page .70/.65/.75 | **FAIL** (head) / PASS (pages) | The journal sketch page now opens beside the heading in the first view. Fixed after re-test, not re-judged. |
| S16 Voices, by the fire | D31, A31 | BLIND | D .80–.85; A .65–.70 | **PASS** | None. |
| S17 Card III→IV ignite | D/A10-act-4-enter/mid/settled | BLIND + TRANSITION | settled HP .95–.97 (both). D enter RD .75–.85 (the outgoing camp, correct). D mid HP .45–.55. A enter ?? .10–.25 (black). A mid HP .85–.90. | **PASS** (settled); D mid and A enter FAIL | The Great Hall now leads at the middle, and alt Act IV starts on the lit camp. Fixed after re-test, not re-judged. |
| S18 Principles | D/A38, D/A39 | BLIND | D .75–.85 (Marauder's Map); A .55–.80 (Lumos ceiling) | **PASS** (both variants) | None. Up from .25–.30 in the audit. |
| S19 Contact + credits | D40; D41, D42 | BLIND (contact); CAPTION (credits) | contact HP .70–.75. Credits text-only: D42 HP .30–.55 (Snitch and Hallows are small). | Contact **PASS**; credits n/a | D40 was captured while its heading was still animating in. Credits are text by design. |
| S20 World loaders | D80 ×4, A80 hp/rdr2; D85 ×4, A85 principles/writing | BLIND (card); CAPTION (route) | D80: PC .70–.75, 3I .50–.75, RD .50–.60, HP .65–.75. A80 hp .45–.50, A80 rdr2 .55–.60. D85 all .60–.85. A85 principles .40–.55, A85 writing .50. | Default card **PASS** (4/4); alt card hp/rdr2 **FAIL**; default route PASS; alt route hp/rdr2 FAIL (0 wrong-film) | Route loaders are now 216 px (were 160). Fixed after re-test, not re-judged. **Not fixed:** A80 card-size alts; at ~120 px there is no room for detail. |
| S21 Work head band (new; was the ICE corridor) | D24, A24 | BLIND | corridor 3I .40/.40/.40, "generic architecture" | **FAIL** | The corridor was replaced by Virus's astronaut pen on his desk (`iconic-pen-alt`), captioned "THE ASTRONAUT PEN ON VIRUS'S DESK" (proposed). Replaced after re-test, not re-judged. `iconic-corridor` and `-alt` stay registered but are now unused. |
| S22 Optuna head "What is a machine?" (new) | D27, A27 | CAPTION | 3I .55/.55/.60 (D), .55 ×3 (A); 0 wrong-film | **FAIL** by the scorer; §10 CAPTION blind guard met | The plate (lecture hall) reads as a generic classroom; the caption "WHAT IS A MACHINE?" carries it. Its hard scrim edge (critic 2 #1) is fixed. |
| S23 Kill-list astronaut pen (new plate for S11) | D30 | CAPTION | 3I .70/.55/.70 | **PASS** | The alt barely differs (A30 ≈ D30). |

**What still blocks "every scene passes":**
1. **3 Idiots.** The lecture hall (S07, and S22's plate) sits at 0.50–0.60. The chalked drone and the pen band are the bets, and both are unjudged.
2. **Transition enter frames** are dark on S13 and on the alt S07/S17.
3. **Act III has no visible develop.**
4. **Alt card loaders** (HP, RDR2) are too small to carry detail.
5. **The intro beats have never been validly measured.**

All five go to M5's final blind test.

## 12. M5 final blind test (2026-09-29, 16:27–16:51 UTC)

**Full results:** `m2-review/BLIND-FINAL.md`, plus the contact sheet `final-frames/index.html`. It judged the post-fix `m2-after2` frames at `d4a2cd8`, with 3 judges on 86 blind frames.

**Results:**
- **BLIND-mode frames: 38 / 45.** Earlier runs: audit 15/53, re-test #1 25/43, re-test #2 35/44.
- By world: Pirates 10/10, 3 Idiots 9/10 (was 5/10), RDR2 9/13, Harry Potter 10/12.
- All frames with a film: 63/83.
- Wrong-film frames: 3, all outgoing-world "enter" frames.
- Every CAPTION frame has 0 wrong-film guesses.

**Still failing when judged:**
- the RDR2 films screen, both variants (0.55)
- the card-size loaders: default hp, idiots and rdr2; alt hp and rdr2 (0.35–0.55)
- the Trading_Algos and Optuna chapter heads, which carry captions (0.20–0.55)
- the alt satchel and the alt HP/RDR2 route loaders, which carry captions
- the two intro mid hand-off beats, which carry captions
- the Act III enter frames, and the Act II/IV enter frames that show the outgoing world

**Fixed afterwards in `bc1072b`, not re-judged:**
- The RDR2 films screen: Dead Eye plate (default) and the gang's camp at dusk (alt).
- Chalk drones on the two chapter heads.
- The satchel, redrawn.
- The loaders, enlarged.
- The intro ALT fold, inked as a sea chart.
