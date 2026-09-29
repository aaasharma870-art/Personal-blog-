# SPEC — "One Line, Three Lights"
### The Reading Line × Three Films · binding design spec (v1, 2026-09-28)

> Aryan's site is one film in three acts. Direction 3, "The Reading Line", is the camera: the huge static name, one bracket `[ ]`, one reading line, native scroll. The three films are the light. **Pirates of the Caribbean** lights the crossing, **3 Idiots** lights the workshop and **Harry Potter** lights the ending. Harry Potter also opens the page: a candlelit play screen, and a riderless broom that carries you out to sea and sets you down in front of the name. One curve, **the Line**, runs through everything. It is drawn in brass at sea, in blueprint in the workshop and in ink that kindles into light at the end.

**Status:** SPEC. Nothing is built and 0 credits are spent. This file is the design authority for the build branch `design/three-films`, cut from `main` `b8444d3`.
**Spine:** concept `concepts/three-acts.md` (scored highest). **Grafts:** `concepts/screening-room.md` (a scroll-driven films chapter, silent reels, credits roll, the "weather vs instruments" law, the intensity knob) and `concepts/three-crafts.md` (voyage image sequence, 3 Idiots daylight, "Seen here in" links, one needle-points-at-intent wink, velocity dialects on media only).
**New binding requirements integrated here:** N1 (the Harry Potter opening play screen and broom flight, §5) and N2 (themed loaders and loading-reel interstitials, §8).

**Reads with (in this order):**
1. `personal-website/CLAUDE.md` Part I. It wins on content, and the §2 exclusions are absolute.
2. `build/DESIGN.md` (DESIGN v2). It wins on look: tokens, type, motion and bans.
3. This SPEC. It wins on structure: what goes where, the world system, the data model.
4. `build/MEDIA-PLAN.md` (Higgsfield assets) and `build/bars/*.BAR.md` (pass/fail gates).
5. Background only: `SYNTHESIS.md` §4/§5/§8/§9, `prep/*`, Kimi Part V/VI, and the concept files.

**Labels:** OBSERVED · CREATOR-DOCUMENTED · INFERRED · PROPOSED · CALC (computed with `build/tools/contrast.mjs` and `springs.mjs`). An unlabeled design value is PROPOSED: a starting value to tune by eye in `/lab` frame sequences.

---

## 0. Decisions this spec encodes

| # | Decision | Source | Where it lands |
|---|---|---|---|
| A-1 | Visual direction: D3 "The Reading Line" | Aryan (binding) | §11 lists every D3 element kept |
| A-2 | The films are a primary identity layer, felt strongly and **named openly** | Aryan (binding; overrules Kimi's restraint) | §2, §9.4, §9.5 |
| A-3 | Higgsfield media is approved as needed. The plan totals ≤ 750 cap and keeps ≥ 250 in reserve | Aryan (binding) | MEDIA-PLAN |
| A-4 | Adaptability: a typed manifest drives everything, worlds are data, and transitions derive | Aryan (binding) | §12 |
| D-1 | Huge name YES: `display` `clamp(4.5rem,11vw,10.5rem)` | Aryan | §6 |
| D-2 | One primary CTA YES: "View the quant portfolio ↓" → `#work` | Aryan | §6 |
| D-3 | Retire the old "max polish" layer YES; the film layer replaces it with meaning | Aryan | §11.3 |
| D-4 | Warm parchment for Writing YES (the HP parchment plane `#ebe0c6`) | Aryan | §7 SM-11; DESIGN §1.4 |
| D-5 | Up to **2** longer cinematic scroll moments (≤ 60vh each, desktop fine pointer only, static elsewhere) | Aryan | §7 SM-5, SM-10 |
| D-6 | The kill-list keeps equal quiet at rest | Aryan | §7 SM-8 |
| N1 | Harry Potter play screen + broom flight intro overlay | Aryan (binding, mid-design) | §5, `bars/intro.BAR.md` |
| N2 | Three themed loaders, used for real loads and as scroll-driven, non-blocking loading-reel interstitials | Aryan (binding, mid-design) | §8, `bars/loaders.BAR.md` |

---

## 1. Thesis and the four laws

**Thesis.** Aryan is a student researcher who kills his own ideas, so the page should read as a journal before it reads as a film. The films never replace the reading. They change the light the reading happens in:
- **Navigation** (Pirates) is how he got here.
- **Explanation** (3 Idiots) is how he works.
- **Revelation** (Harry Potter) is what the work taught him, and who it is for.

The page opens cool, at sea at night, and ends warm, in candlelight, so it literally warms as you read. Harry Potter is a bookend: it opens the prologue and closes Act III.

**The four laws** (every component obeys them; the critics cite them by number):

1. **Light lives in media; ink lives in the DOM.** Glow, flame, bioluminescence, lantern light and bloom exist only inside `MediaFrame` media, the one active *world canvas*, and the aria-hidden *world-media* sprites of the loaders. DOM text, controls, cards and chrome stay flat ink. Aqua stays **the one in-focus mark per viewport**, ember means **killed** only, and amber in the DOM means the **EXCEPTION** verdict only. (This replaces DESIGN v1 §1.3.5 "no glow" for world media only.)
2. **Higgsfield shoots the weather; code builds the instruments.** Generated media is atmosphere only: sea, sky, fog, flame, paper, slate, dust, light. Every instrument, compass, gear, chart line, blueprint, chalk mark, ink line, number and word is original SVG, canvas or HTML in code. Generated footage never contains an instrument, map, diagram, letter, person or film prop.
3. **One world per viewport; the incoming world owns the cut.** Each section has exactly one world. Where the world changes, the renderer inserts a derived **act card** whose choreography belongs to the incoming world. Acts are contiguous, and there are at most 3 film worlds and at most 3 major world changes.
4. **Films are named in words, never in their marks.** Titles appear in our own type (Newsreader or Geist Mono), as nominative credit ("AFTER HARRY POTTER"). There are no logos, title typography, stills, props, characters, spell words, catchphrases, dialogue or house colours. Research data never takes a film's colours.

---

## 2. Shape of the page

```
[PROLOGUE · Harry Potter]  play screen → broom flight → lands on the name          (overlay, not a section)
 COLD OPEN                  hero: the name in front of a night sea                  (world: pirates)
 ── opening card ──         "A research journal in three acts" + the program        (house · LD-PC course)
 ACT I   The Crossing       about · journey                                          (pirates)
 ══ Card I→II ══            Storm → Blueprint   (D-5 long #1)                        (→ idiots · LD-3I gauge)
 ACT II  The Workshop       work · trading-algos · optuna-screener · experiment · systems · kill-list   (idiots)
 INTERMISSION               Three films (the personal films chapter)                 (house; one world per screen)
 ══ Card II→III ══          Lights out → the Line ignites   (D-5 long #2)            (→ hp · LD-HP ink-light)
 ACT III The Light          principles · writing (parchment) · beyond · voices · contact   (hp)
 CREDITS                    closing credits roll                                     (house)
```

**Why this order** (Pirates → 3 Idiots → HP, with an HP prologue):
1. **The real Journey is already a voyage** (`content.ts` `journey`): Origin (learning the water) → Early work (maps of water already crossed) → The break (the storm) → Now (a method that points true). No fact changes.
2. **D3's noise → order seam becomes the hinge of the film.** The storm is wiped into a blueprint at the I→II break.
3. **Act II ends on the kill-list**, which is the "all is lost" beat and the artifact Aryan is proudest of. Light arrives after the graveyard.
4. **D-4 parchment Writing and Kimi's HP assignments** (principles, writing, voices) already sit late, so HP owns the finale without forced moves.
5. **The HP prologue fixes the spine's weakest point.** The cinematic critic noted that HP, the most instantly felt world, came last. Now it comes first *and* last. The broom literally carries the visitor from HP's candlelit sky into Pirates' sea, so the prologue *is* the first world transition.
6. **The intermission puts the personal films chapter mid-page (~55% down), where it will be seen.** It is not buried in the credits. Its three screens run in act order and end on a single warm point at the start of the Line, which the II→III card then ignites. The judges' graft asked for "between the Act II graveyard and the Ignite card", and this is exactly that slot.

The order is data (§12). Reordering acts re-derives cards, numerals, labels, menu groups and transitions. Pairs with no authored transition get the generic loading reel and a validator warning.

---

## 3. Manifest order (the binding sequence)

Travel = extra sticky scroll beyond content (desktop fine pointer). Mobile travel is 0 everywhere (§13). "Sig" = a `signature` section (the cap rises from 3 to 5 under A-2; the critics count them). Motif ids are defined in §10.

| # | id · type | Act · world · tone | What the visitor sees and feels | Motifs | Media | Travel | Sig |
|---|---|---|---|---|---|---|---|
| P | *(overlay)* `intro` | Prologue · hp · — | A candlelit night above a sea of moonlit cloud. A riderless broom waits. `[ ▶ Play ]` sits where the name will land. On Play, the camera follows the broom down through the cloud, out over the night sea, along a glowing wave, and away toward a far lantern. The last frame *is* the hero, and the name resolves in front of the sea. *Feel: the lights go down; you are carried in.* | IN-01, IN-02, LD-HP (real load only) | IN-01 (canvas), IN-02 flight; IN-01m mobile | 0 | ★ |
| 0 | `top` · hero | cold open · pirates · deep | The huge static name stands in front of the dark tail of a long bioluminescent wave. One tiny warm lantern point on the horizon foreshadows Act III. *Feel: the film has titled itself.* | Lens (aperture only if the intro didn't play), VelocityNoise = spray on media, PC-13 | MV-01 → MV-03; MV-02 mobile | 0 | ★ |
| — | card `act-1` · **opening** | — · house · deep | Letterboxed black. "A research journal in three acts." Below it, the program: I, II, the Intermission and III as rows naming each act and its film, joined by a brass course line. The instrument settles on row I as the card passes. *Feel: opening credits and a table of contents in one.* | TA-04, LD-PC (scroll) | — (code) | 0 | |
| 1 | `about` · story `split` | I · pirates · canvas | Sea-night ground. The authentic portrait and bio. The four pillars sit as **four bearings** on an original rhumb rose, drawn in brass once on entry. *Feel: a first log entry, quiet and plain.* | TA-06, PC-02 lattice ≤ 4% | portrait (authentic) | 0 | |
| 2 | `journey` · story `voyage` | I · pirates · canvas | A voyage chart. The four real steps scroll on the left. On the right, a sticky sea scrubs through harbour lantern → fog → squall → first light (the frames pass exactly through four approved stills). A brass course line runs through 4 waypoints; an octagonal instrument hunts and settles per leg, kinks at *The break* with one ember tick, and turns toward the waypoint you reach for. *Feel: the voyage that earned the method.* | PC-12 sequence, PC-06′ local course, TA-09 instrument, PC-09 wink, LD-PC (real frame loading) | MV-05a–d; JV sequence (desktop) | 0 (sticky column beside content) | ★ |
| — | card `act-2` · **seam** | I→II · idiots · deep | **Storm → Blueprint** (SM-5). The hero's sea, now a night squall, is wiped along a ragged diagonal into a blueprint. The Line draws on as FIG. 0 with true dimensions while a gear train measures the passage. Then the epigraph. | TA-01, IceCut, TA-02 FIG. 0, LD-3I (scroll) | MV-04 + code blueprint | ≤ 60vh (D-5 #1) | |
| 3 | `work` · gauntlet | II · idiots · canvas | The workshop at first light: a wiped chalkboard with a raking morning beam. Choosing a gate derives it in chalk. You can **run** seeded, labelled-illustrative hypotheses through the real gates; the tally gets one chalk circle. *Feel: the room where you're allowed to question everything.* | 3I-02, 3I-09, 3I-06 (entrances only), D3 gauntlet verb | MV-06 | 0 | ★ |
| 4 | `trading-algos` · chapter | II · idiots · canvas | Sticky facts column (limitations beside claims). On the right, the cover **is** a schematic of the real system on a blueprint panel (≤ 40% area), drawing itself once. Leaders run from metric to claim. **The chalk circle goes around the caveat, not the number** ("one-shot; in-sample +1.42"). | 3I-01, 3I-03, 3I-05, TA-07 | none (code) | 0 | |
| 5 | `optuna-screener` · chapter | II · idiots · canvas | Same grammar. The circle goes around "anything > 2.0 is a red flag". | same | none (code) | 0 | |
| 6 | `experiment` · experiment | II · idiots · raised | BacktestDemo on surface-1, `SYNTHETIC • ILLUSTRATIVE` adjacent. The quiet stretch of Act II. | (density valve: no chalk) | — | 0 | |
| 7 | `systems` · matrix | II · idiots · canvas | The capabilities table plus **FIG. "How this page is built"**: a true schematic of manifest → registry → SectionFrame → worlds → media. The grid starts thinning here. | 3I-01, 3I-07 | — | 0 | |
| 8 | `kill-list` · ledger (Lens Index) | II · idiots · canvas | **The reckoning.** 10 rows, equally quiet at rest (D-6). The aqua bracket tracks the active row; killed rows keep their ember strike when active. The grid is gone by the last row: open air. *Feel: the graveyard, laid out with dignity.* | D3 Lens, 3I-07 end | lens figures = schematic mono/colour pairs | 0 | ★ |
| 9 | `films` · films | Intermission · house · deep | **Three films.** Three letterboxed screens in act order (sea → dawn board → ink and light), each with the film named, its verb, a true line about what this page borrowed, "Seen here in" links, and Aryan's own reason (DRAFT-gated). Each screen settles once with a code finale. The last one leaves one warm point at the start of the Line. | FC-01, FC-02, finales PC-01/3I-01/LD-HP | F-PC, F-3I, F-HP | 0 | |
| — | card `act-3` · **ignite** | →III · hp · deep | **Lights out → the Line ignites** (SM-10). The house lights drop, 32–40 warm points kindle along the Line from that first point, and the hall of lights swaps in. | TA-01, TA-08, HP-11, LD-HP (scroll) | MV-07 | ≤ 60vh (D-5 #2) | |
| 10 | `principles` · principles | III · hp · canvas | Candle-night ground. Five numbered rows. On entry, 3–4 silver-blue ribbons converge once into an underline under each title. *Feel: ideas condensing out of the dark.* | HP-07 | — | 0 | |
| 11 | `writing` · index | III · hp · **paper** | The dome seam rises as warm parchment (D-4). A dark-ink index with static DRAFT; the section title writes itself once behind a nib dot; the fine-pointer filmstrip shows candlelit covers. *Feel: letters on a desk under a lamp.* | HP-04, HP-05, D3 filmstrip | W-01…05 (optional) | 0 | |
| 12 | `beyond` · story `notes` | III · hp · canvas | Athletics, leadership, community, creative. Beside Athletics, a trail of abstract footprint pairs draws once: evidence of movement, not the mover. | HP-06, HP-01 dividers | authentic only | 0 | |
| 13 | `voices` · quotes | III · hp · canvas | The lead teacher quote is *read into light*: a one-shot soft mask moves from muted to ink across it. There is no glow on the text. | HP-03′ | — | 0 | |
| 14 | `contact` · contact | III · hp · deep | Darkness. Far right, a single steady flame at the end of a fading trail of lights. The giant invitation sits left. **The bracket closes around the AS monogram over the flame.** Copy email → a 120 ms flare in the media. *Feel: someone left a light on for you.* | D3 resolve, success = flare | MV-08 → MV-09 | 0 | ★ |
| 15 | `credits` · credits | — · house · deep | The closing credits roll on native scroll: author, worlds borrowed from, imagery provenance, AI assistance, type, the non-affiliation line, "To be continued." (proposed) and ↑ back to the opening. Rendered as the page `<footer>`. | CR-01 | — | 0 | |

**Anchors.** `#top #about #journey #work #systems #principles #writing #beyond #contact` (the brief's required set, SYNTHESIS §8), plus `#kill-list` and `#voices` (baseline links, Kimi N-6), plus new ones: `#trading-algos #optuna-screener #experiment #films #credits #act-1 #act-2 #act-3`.

**Signature count: 5** (intro, hero, journey, gauntlet, ledger), with contact as "the ending" (D-3 wording). The two long cards are *scenes*: `maxScenes` stays 2.

---

## 4. The Line (TA-02): the through-object

- **What it is.** One asymmetric folded curve, stored in `lib/line.ts` as `LINE_D` (viewBox `0 0 1000 400`). It is hand-fitted **after MV-01 is approved** to the silhouette of the hero's bioluminescent wave crest. It is our own path, never traced from film art. It inherits PROMPTS §3.3 geometry: body at x 46–94%, the calm tail dissolving by x ≈ 38%, and focal (0.70, 0.50).
- **Its material per world** (the `line` slot, §12):

| World | Material | Where it appears |
|---|---|---|
| hp (prologue) | light: the broom's trail skims the crest in the flight's last second | IN-02 trail (canvas), over the hero plate |
| pirates | a dashed **brass course line** with waypoint ticks (DOM SVG). The aqua wake exists only *inside* media | opening card, Journey |
| idiots | a **blueprint line** `#cfe8f7` with dimension ticks and Meta "FIG. 0". It is labelled with its **true** measurements (path length and control-point count, computed from `LINE_D`) | Card I→II, films 3I finale |
| hp (Act III) | an **ink line** `#c9ac72` that kindles into points of light | LD-HP, Card II→III, films HP finale |

- **Why it matters.** Every world change is a *transformation of one object*, not a skin swap: storm foam becomes the drawn Line, the chalk Line becomes a string of lights. Generated plates that carry the Line (MV-01, MV-04, MV-07) are checked against `LINE_D` with an overlay diff (MEDIA-PLAN §6).
- **Rule.** The Line never passes through the h1 box, and no light ever runs across the name (a mustAvoid).

---

## 5. PROLOGUE — the intro overlay (N1)

**Intent.** The first thing a new visitor sees is a crafted Harry Potter play screen. Pressing Play starts a short chase shot that follows a riderless broom from the candlelit sky to the night sea and **lands on the real, server-rendered page**. It is a gift, never a gate: the page is complete underneath, one keystroke or scroll away.

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
  1. The night ground `--intro-night #06080d`, painted instantly by CSS.
  2. `<canvas>` (the world canvas while the intro lives). After `load` plus idle, it draws the **IN-01** plate (desktop 16:9 cover) or **IN-01m** (portrait), fading it in over `dur.preview`, plus ≤ 40 warm motes. Using canvas keeps the plate out of LCP (INFERRED: canvas is not an LCP candidate).
  3. The text block, positioned **exactly where the name will land** (plate x 9–46%, y 28–64% at ≥ 1024). This is continuity: *Play becomes the name*.
  4. The top row: `SKIP INTRO` on the right.
- **Text and controls (≤ 3 type styles: `meta`, `title`):**
  - `#intro-title` (Meta, `--fg-muted`): `ARYAN SHARMA • A RESEARCH JOURNAL IN THREE ACTS` (proposed microcopy).
  - The credit line (Meta, a separate block): `AFTER PIRATES OF THE CARIBBEAN • 3 IDIOTS • HARRY POTTER`. It is derived from enabled acts, in act order.
  - **The Play control:** a native `<button>` reading `[ ▶ Play ]`. The label "Play" is in `title` (Newsreader 400; 63 px at 1440, 35 px at 390), the triangle is lucide `Play` at 1em (functional icon), and the **bracket** (the D3 Lens primitive, aqua) frames it. The bracket is **the viewport's one aqua mark**. At arm, the bracket halves are *drawn in* (HP-01 ink draw-on, `pathLength` 0 → 1, `easeDraw`, 0.9 s), but the button is operable from the first frame. Target ≥ 44 px; the real hit area is the whole bracketed box.
  - `SKIP INTRO`: a native `<button>` in Meta, `--fg-muted` → `--fg` on hover and focus, ≥ 44 × 44.
  - `#intro-desc` (sr-only): "The page is already loaded behind this intro. Press Play to watch a six-second flight, or Escape to skip it."
- **Motion at rest.** ≤ 40 motes (pre-rendered warm sprites) drift at varied depths, with ≤ 8 px pointer parallax on a fine pointer. **12 of them hover within ~120 px of Play.** On Play hover *or* `:focus-visible` they gather to a ~72 px radius over `dur.reveal`: the lights lean toward your intent (focus parity). **All ambient mote motion stops 5 s after arming** (WCAG 2.2.2 without a separate control) and resumes only on hover or focus.
- **Initial focus.** On arm, focus moves to Play (`preventScroll`). Tab order: Play → Skip intro (the dialog traps Tab).
- **Contrast.** Ink on the intro zone passes ≥ 7:1: IN-01's Play zone is luminance ≤ 0.054 (MEDIA-PLAN IN-01 check E), and `--intro-night` gives ink 16.95 and stone 8.95 (CALC).

### 5.3 Play → flight → landing (desktop ≥ 1024, fine pointer, `hardwareConcurrency ≥ 4`)
| t | Driver | What happens |
|---|---|---|
| 0 | click / Enter / Space | The bracket halves travel outward to the viewport edges on `easeClip`/`dur.hero` (the one aperture, spent here). The text block exits on `dur.base`. The motes stream outward toward the broom (canvas, `dur.reveal`) |
| 0+ | readiness | If the flight video (IN-02, preloaded since idle) has `readyState ≥ HAVE_ENOUGH_DATA`, it plays and the canvas cross-cuts to it (its first frame *is* IN-01, so the join is invisible). Otherwise the **HP loader** (LD-HP, §8) appears after a 250 ms delay: bottom-centre, with real progress = `buffered / duration` and `role="status"` text "Loading the flight…". If it isn't playable within 4 s, the controller runs the **code flight** (§5.4) and never waits longer |
| 0–≤ 6.0 s | **time** (video clock) | The camera follows close behind the riderless broom: it tilts and takes off, passes through the floating lights, dives through the cloud deck, emerges over the night ocean, skims the glowing crest (tracing the Line), and rises away toward the lantern until it leaves frame. The final frame = **MV-01**, pixel-registered with the live hero (§5.5). A code **light trail** (≤ 48 sprites, 600 ms exponential decay, canvas) follows the baked broom path `intro-trail.json` |
| last 0.62 s | time | **Landing.** The overlay dissolves with a left-to-right `mask-image` sweep over `dur.reveal`, so the name zone clears first and the name *resolves* in front of the sea as the broom leaves at right. The h1 itself never animates |
| end | — | The overlay unmounts (canvas and video released, so the decoder frees for MV-03). `inert` is removed, `sessionStorage['intro-seen']="1"`, and focus moves to the h1 (`tabindex="-1"`, `preventScroll`; no visible ring on this non-interactive target). The hero Lens is `open` (the aperture was spent on Play) |

**Caps.** Play → content ≤ 7.0 s (flight ≤ 6.0 s plus landing 0.62 s plus slack). Skip or Esc → content ≤ 0.4 s.

### 5.4 Mobile and low-power: the lighter version
Used below 1024 px, on a coarse pointer, when `hardwareConcurrency < 4`, or as the fallback when the video isn't ready.
- **The play screen** uses IN-01m (portrait) in the canvas, with the same text and controls; the Play block sits in the lower third.
- **The code flight** (≤ 2.4 s total): an original SVG besom silhouette (a plain handle and bound twigs, no markings) flies a bezier from the lower left to the upper right over the still (transform only, `easeDraw`, 1.6 s), with a canvas light trail (≤ 24 sprites). At 1.2 s the overlay **exits by the dome** (the D3 `Seam` geometry: an ellipse edge rising over 0.6 s on `easeClip`), revealing the page top. Focus → h1. No video is ever requested.

### 5.5 Registration (the end frame lands on the page)
- The hero section is exactly `100svh` at ≥ 1024. Its `MediaFrame` fills it with `object-fit: cover` and `object-position` = MV-01's `focal`. The overlay video uses the **identical** box and fit.
- IN-02's end frame is generated with `end_image = MV-01` (MEDIA-PLAN). The bar gates it at ≥ 0.95 SSIM against the hero poster crop (±2 px registration).
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

### 5.8 Legal and honesty for the prologue
- **The broom** is a plain, riderless besom of natural wood and bound twigs, with no brand, lettering, footrests, metal fittings or streamlined racing shape (no Nimbus/Firebolt cues).
- **No** castle, towers, lake silhouette, stadium, hoops, balls, owls, wands, hats, scarves, crests, people, silhouettes or riders.
- The lights are small points, not candles in holders, and not a ceiling.
- **Check L:** "Could a fan mistake a frame for a still from the film?" Any "yes" or "maybe" → reject.
- The text is proposed microcopy (§9.6). Film titles appear only in the credit line.

---

## 6. The hero (cold open)

- **First paint (SSR, no JS):**
  - `<h1>` "Aryan / Sharma" in `display` (158 px at 1440), `--fg`, on the name zone (plate x 9–46%). It is **static and never animated**.
  - Below it: `site.throughline` (`lead`), `site.identity` (`meta`, `·` → `•`), and one CTA, "View the quant portfolio ↓" (ink, aqua focus ring, aqua-bright hover), linking to `#work`. That is exactly 3 type styles.
  - Header: `[AS]` · act label (empty at the top) · Work · waveform Pause · Menu.
- **Media.** MV-01 poster (`priority`, 200–350 KB, reserved 16:9, full-bleed `cover`, `100svh` on desktop):
  - Black open ocean under low overcast, with a faint moon glow behind cloud at upper right.
  - One long bioluminescent aqua crest folds across x 46–94%. Its tail dissolves into dark water and fog by x ≈ 38%: **the calm band**, where the name overlaps it (Dennis depth-by-overlap).
  - One tiny warm lantern point on the horizon at x ≈ 88%. It is the only warm pixel on screen one, the place the broom flew to, and a foreshadowing of Act III.
- **The one aqua mark** is the bracket, which rests around the crest's bounding box (`media.focalBox`, x 46–94%, ≥ 16 px from the h1). The wave's aqua lives inside media, which is exempt.
- **Aperture.** Only if the intro did *not* play (auto-skipped, skipped before Play, or already seen): the D3 aperture opens once per session on `poster.decode()`, from a slit at the focal x to full (`inset(0 30% 0 70%)` → `inset(0)`, `easeClip`/`dur.hero`). The halves ride the clip edges and stop at the `focalBox`. If the intro played, the Lens starts `open`.
- **Loop.** MV-03 (8 s, start = end = MV-01) swaps in on `playing`, only on desktop with a fine pointer, no Save-Data, and after the overlay unmounts. The crest rolls, glints travel its right edge, the fog drifts; the left half and the calm band stay static; the lantern stays steady.
- **Velocity dialect (media only).** Scrolling fast raises VelocityNoise grain (≤ .10) and a ≤ 2 px chroma offset on the plate, and brightens the wake (a ≤ 15% brightness lift on a masked wake layer of the media). Stopping restores clarity. Nothing touches text.
- **Scroll out.** The D3 exit map (scale 1.03 → 1.08; y −24 px; darken from .7 to 1). The opening card follows: the film has titled itself.
- **Hero credit line (optional, default OFF, decision H-1).** `film.heroCredit: true` adds a Meta line above the name, `IN THREE ACTS • AFTER PIRATES OF THE CARIBBEAN, 3 IDIOTS & HARRY POTTER`. OFF keeps screen one name-first for admissions readers; the prologue and the opening card name the films instead.
- **Mobile (<640 / coarse):** name → lead → meta → CTA → MV-02 (4:5), with no overlap and no video unless the visitor opts in. The aperture runs on MV-02's decode when ≥ 50% is in view.

---

## 7. Signature moments and set pieces

Each entry gives the **entry → mid → settled** states, the **driver**, the key **tokens** and the **fallbacks**. Tokens are DESIGN v2 names. RM = reduced motion or the Pause toggle; M = <640 or coarse pointer; NJ = no JS; SD = Save-Data, 2G or 3G.

### SM-1 · Prologue flight (N1)
See §5. Bar: `bars/intro.BAR.md`.

### SM-2 · Hero: the name at sea
See §6. Bar: `bars/hero-lens.BAR.md`.

### SM-3 · Opening card: the program (derived card, kind `opening`)
- **Entry:** the dome seam to `deep`, then R1 masked rise of the h2 "A research journal in three acts." (`title`, proposed).
- **Mid:** a **driver** `p` = the card's passage through the viewport (no pin) plots the LD-PC course line down the left edge through 4 waypoints: I, II, Intermission, III. Each row is an `<a>`: act title in `heading`, plus a Meta credit `ACT I • AFTER PIRATES OF THE CARIBBEAN`. Hovering or focusing a row draws that act's Line material in a 120 px vignette beside it (brass / blueprint / ink-light), with a static final state.
- **Settled:** at p = 1 the instrument (96 px) needle settles on row I's bearing (`springNeedle`), with a single 120 ms moon-white tip flash.
- **Tokens:** `--color-deep`, brass `#a8834a`, moon `#a9bcc0`, `easeDraw`, `springNeedle`.
- **Fallbacks:** RM/NJ → static: course fully drawn, needle at bearing, no flash. M → same static composition with rows full width.

### SM-4 · The voyage (Journey, story `voyage`)
- **Layout ≥ 1024, fine pointer:**
  - Left (cols 1–6): the four steps in normal flow, each an `<article id="journey-step-n">` with Meta `01 • ORIGIN`, the title in `heading` and the body in `body`, verbatim.
  - Right (cols 7–12): a **sticky** media column (not a pinned stage, so 0 extra travel). It holds the sequence canvas (72 frames, JV, 1280 w), and below it the chart strip: a dashed brass course through 4 waypoint links, with the instrument (72 px) at left.
- **Driver:** frame index = `round(p × 71)`, where p is the section's content progress (R2, direct). The frames pass **exactly** through MV-05a/b/c/d at the step beats (p = 0, ⅓, ⅔, 1).
- **Instrument:** state-driven, not scroll-mapped. When the active step changes (centre-line IO), the needle hunts and settles on that leg's heading (`springNeedle`). At step 3 ("They failed out-of-sample") the course **kinks** and one **ember tick** marks it: ember = killed, because those Smart-Money patterns are on the kill-list (`killList[4]`).
- **PC-09 wink:** hovering or focusing a waypoint link turns the needle toward it. Clicking scrolls natively to that step.
- **Real loading (N2):** until all frames decode, the column shows the active step's still (MV-05x) plus a 48 px LD-PC mini loader in the frame corner with real `decoded / 72`. Scrubbing activates when complete. The loader appears only after 400 ms, and it stops moving after 5 s (static frame) while decoding continues.
- **Fallbacks:** M / RM / SD → the existing journey carousel with MV-05a–d stills, the course drawn static, the needle at each bearing, and 0 sequence requests. NJ → the four steps plus the four stills stacked.
- **Bar:** `bars/journey-voyage.BAR.md`.

### SM-5 · Card I→II "Storm → Blueprint" (derived card, kind `seam`, D-5 long #1)
One `ScrollStage`, direct `useTransform`, no springs. Travel ≤ 60vh, desktop fine pointer ≥ 1024 only.

| p | Beat |
|---|---|
| 0–.15 | The dome seam to `deep`. The letterbox frame opens `inset(8%)` → 0 on **MV-04**: the hero's camera and horizon in a night squall, with the crest broken into foam along the Line's curve. Upper bar: Meta `ACT II • AFTER 3 IDIOTS` and the reel mark `II / III`. Lower bar: the act title "The Workshop" (`title`) rises once |
| .15–.75 | The D3 **IceCut**: a ragged-diagonal `mask-image` wipes the storm into a **code blueprint ground** (`--bp-panel #0f2c47` plus a 24 px CSS grid at 6%), with opposing ±40%·p² parallax. The **3 px aqua seam line** shows only for .1 < p < .9 (the viewport's only aqua). The Line draws on in `#cfe8f7` (`pathLength` = remap(p, .2, .75)), with dimension ticks and Meta `FIG. 0 • THE LINE • L = <computed length> • <n> CONTROL POINTS` (true values from `LINE_D`). **LD-3I gauge:** a 12T/8T gear pair at the dimension line's left end turns exactly as far as the rack pointer travels. Pointer x = p × L |
| .75–1 | The epigraph rises once in the lower bar (`lead`): "Treat every backtest as guilty until proven innocent." (existing copy, REPO interlude; `pillars[1]`). At p ≥ .95 one chalk circle draws around the dimension line's end tick (3I-09, `easeDraw`, 0.7 s) |

- **Fallbacks:** RM/NJ → a static title card: the blueprint frame with FIG. 0 drawn, the gauge at the end with the circle, captions as an `<ol>`, and the `summary`. **M** → the same static composition, with the FIG. 0 Line drawn once on entry (R1). There is no scrub and no pin (D-5: static elsewhere).
- **Bar:** `bars/noise-order-seam.BAR.md` (adapted).

### SM-6 · The gauntlet on the dawn board (`work`, verb)
- **Entry:** R1 heading rise, and `springSettle` on the board frame's non-interactive entrance (3I-06).
- **Structure:** the tablist (the 7 gates from `content.ts`) plus a `<figure>` on the MV-06 board still, whose left 60% is even and dark. The SVG gate diagram is drawn in chalk (`#f2efe6`, one shared `chalkRough` filter) over the board.
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
- **Leaders (3I-05)** run from each metric to its claim.
- **TA-07:** the one chalk circle per chapter goes around the **caveat** text span (Trading_Algos: "(one-shot; in-sample +1.42)" in the evidence, or the limitations sentence; Optuna: "anything > 2.0 is a red flag"). **Never around a metric.**
- **Fallbacks:** RM/NJ → drawn. M → the panel below the facts, full width, leaders hidden.

### SM-8 · The reckoning (Lens Index)
- D3's Lens Index, unchanged in structure (`bars/lens-index.BAR.md`).
- **World deltas:**
  - the idiots canvas ground
  - the 3I-07 grid, at ≤ 6% on entering `systems`, thins row by row and is **0 by the last ledger row**
  - the bracket is aqua; killed rows keep the ember strike when active
  - no chalk marks here: the graveyard's power is austerity
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

### SM-9 · Intermission: "Three films" (the personal films chapter)
- **Structure:**
  - `<section id="films" aria-labelledby>`, `h2` "Three films" (`title`, proposed), with Meta `INTERMISSION` above it.
  - One `lead` (proposed): "This page borrows its light from three films. Here is what it took from each."
  - Three **screens** in act order, each an `<article>`:
    - a letterboxed 2.39:1 `MediaFrame` still (F-PC, F-3I, F-HP) at full content width
    - under it, in the lower bar region: Meta `ACT I • NAVIGATION • 2003–2017`, the film title as `h3` in `title`, the **borrowed** line (`body`, proposed site fact), **Seen here in** (Meta links, derived), and the **reason** (Aryan's words, DRAFT-gated, §9.6)
- **Entry, per screen (R1, once, at ≥ 50% in view):** the frame clip opens `inset(8% round var(--radius-frame))` → `inset(0)` on `easeClip`/`dur.hero`. Then the **finale motif** draws over the still (aria-hidden, state-driven, once):
  - **Pirates:** the instrument (120 px) hunts, then settles on the bearing of the **next act** (derived: `bearingOf(nextAct)`), with a brass course line drawn to the frame edge.
  - **3 Idiots:** a blueprint draw-on of the **7 real gauntlet gates** across the blank board (strokes only; the gate labels are in the article as an HTML `<ol>` of `gauntlet[].title`), then one chalk circle around the final gate.
  - **Harry Potter:** LD-HP complete-state: the ink Line draws while a cool point travels it, ending with **one warm point lit at the Line's start**, the handoff to Card II→III.
- **Settled:** static. No time-driven clips, no sticky stage, 0 travel. One world per viewport: each screen is ~1 viewport tall at 1440×900 (frame 602 px plus text).
- **Fallbacks:** RM/NJ → stills with the finales in their final state. M → letterbox off (a 3:2 crop), finales drawn static. SD → stills at the smallest srcset.
- **Links:** "Seen here in" = nav-enabled sections whose `worldOf` equals this film's world (≤ 3 section links plus a link to the act card `#act-n`). Each target is ≥ 44 px, and each is a real anchor.
- **Bar:** `bars/films-chapter.BAR.md`.

### SM-10 · Card II→III "Lights out → the Line ignites" (derived card, kind `ignite`, D-5 long #2)
| p | Beat |
|---|---|
| 0–.2 | The house deep `#05080a` crossfades to hp deep `#070504` (two stacked ground layers, opacity only). The chalk Line appears drawn faintly (`#f2efe6` at 30%), with the **one warm point already lit at its start** (continuity from the films HP screen). Upper bar: Meta `ACT III • AFTER HARRY POTTER` and `III / III` |
| .2–.7 | **TA-08 ignition = the LD-HP loader at card scale:** 32–40 points along `LINE_D` (`getPointAtLength`) kindle left to right (pre-rendered warm sprites, canvas, transform and opacity only). A cool point travels just ahead of the kindling; the chalk stroke fades as the points light: ink becomes light. The lower bar shows the act title "The Light" |
| .7–1 | At p > .8, **MV-07** (hundreds of small warm lights densest along the same curve, no architecture) swaps in on `dur.preview`, a state swap, never a half-mix |

- **Fallbacks:** RM/NJ/M → the MV-07 still, the captions, and the `summary`. Sprites: 0 on mobile; paused offscreen and on hidden tabs; the canvas is released on exit.
- **Bar:** `bars/ignite.BAR.md`.

### SM-11 · Parchment writing
- The D3 writing index (`bars/writing-index.BAR.md`) on the **paper** plane (`#ebe0c6`, D-4, the one theme flip).
- **Deltas:**
  - the section h2 "Writing" (or FLAG-1's Meta h2) writes itself once behind a nib dot (HP-05: a mask-wipe of real Newsreader text driven by a moving nib point, ≤ 1.4 s)
  - the preview filmstrip shows W-01…05 (candlelit covers) if accepted, otherwise inline type only
  - drafts are not links (unchanged)
  - no candles, no motes (one warm family per viewport: parchment)
- **Entry:** the dome seam rises in `--paper` over `--hp-canvas`. The rows do a masked rise (R1). The nib-write runs once at ≥ 50% in view.
- **Mid:** fine-pointer hover drives the filmstrip (`springFollow`), the chip (`springNav`) and the strip slide (`dur.reveal`). The other rows ghost by colour (`--paper-ghost`).
- **Settled:** static, with 0 accent marks at rest.
- **Tokens:** `--paper*`, `--radius-frame`.
- **Fallbacks:** RM, NJ, SD and < 1024 → inline mode (art inline, or type-only if W is not approved), with the h2 present and no nib animation.

### SM-12 · Last light (contact)
- The D3 contact resolution (`bars/contact-resolution.BAR.md`) on hp deep, with **MV-08** (poster) → **MV-09** (the flame's glow breathes ≤ 15%).
- The bracket closes around the AS monogram placed over the flame (`focal` 0.85, 0.5). Copy email success fires a single 120 ms **flare**: the flame region brightens ≤ 20% via a masked overlay layer inside the MediaFrame (media, not DOM glow). It never loops.
- **Entry:** the dome seam flattens over the first 60vh (R2), and the invitation does a masked rise (R1).
- **Mid:** once the monogram is ≥ 25% in view, the bracket resolves on `easeClip`/`dur.hero`; its stroke turns aqua at arrival.
- **Settled:** the one aqua is the resolved bracket. MV-09 plays only while visible and while the decoder is free.
- **Interaction:** the magnetic Copy pill (R3), COPIED (`dur.base`), then the flare (`dur.flash`).
- **Tokens:** `--hp-deep`, `--accent`, `easeClip`, `dur.hero`, `dur.flash`.
- **Fallbacks:**
  - RM → the poster only, resolved bracket, no flare
  - touch → no magnetism; tap copies
  - NJ → the mailto link only
  - SD → the still only

### SM-13 · Closing credits (`credits`)
- **Native scroll is the roll:** no pin, no auto-scroll, R1 rises only. Rows are centred: the role in Meta at left, the name in `body` at right.
- **The rows (derived, factual):**
  - `A PERSONAL RESEARCH JOURNAL BY` — Aryan Sharma
  - `RESEARCH, SYSTEMS & WRITING` — Aryan Sharma
  - `WORLDS BORROWED FROM` — Pirates of the Caribbean (2003–2017) · 3 Idiots (2009) · the Harry Potter films (2001–2011) (act order; enabled films only; years verified before ship)
  - `ORIGINAL GENERATED IMAGERY` — Higgsfield (models aggregated from `lib/media.ts` provenance) · original prompts · no film imagery
  - `BUILT WITH AI ASSISTANCE` — Claude (Anthropic), directed and reviewed by Aryan Sharma (proposed wording)
  - `TYPE` — Geist · Geist Mono · Newsreader
- **Legal line** (`small`): "Film titles are named as personal references. This site is not affiliated with, sponsored or endorsed by the films' studios or rights holders. All imagery, motifs and words here are original." (Decision F-3: whether to name the studios.)
- `footerLine` (verbatim), "To be continued." (proposed), ↑ Back to the opening (`#top`), and the build year (derived).
- "GRADED AFTER" is deliberately **not** used: it could read as school grades (CLAUDE §2 sensitivity).
- **Entry and mid:** each row does an R1 rise as it enters, driven by native scroll. There is no pin, no auto-roll and no time drive.
- **Settled:** static text.
- **Tokens:** `--color-deep`, `meta`/`body`/`small`, `--rule` row hairlines.
- **Fallbacks:** identical everywhere (it is text). RM and NJ show the final state.
- **Bar:** `bars/films-chapter.BAR.md` §C.

---

## 8. The loader system (N2)

Three original, code-built loaders share one grammar. The loader is a `WorldLoader` primitive with `world`, `size` (`mini` 48 px · `card` 96–120 px · `route` 160 px), `mode` (`indeterminate | determinate | complete | static`) and `progress` (0–1). It is **world media**: aria-hidden, no text inside the SVG or canvas, and luminous points drawn only as pre-rendered sprites.

| Loader | World | Motif | Progress element | Indeterminate | Complete |
|---|---|---|---|---|---|
| **LD-PC "Course & needle"** | pirates | An original octagonal instrument: brass 1.5 px housing, a 32-tick moon ring (4 long cardinal ticks), a stone needle with a brass pivot. **No ember arrow, no dial art** | A dashed brass course line drawn to a waypoint (`pathLength = progress`, direct) | The needle hunts ±35° around the heading, re-excited every 1.8 s on `springNeedle` | The needle settles on the final bearing (`springNeedle`), then one 120 ms moon-white tip flash (area < 0.1% of the viewport) |
| **LD-3I "The honest gauge"** | idiots | A blueprint gear train: a 12T drive gear and an 8T driven gear, meshing at a true 3:2. A pinion on the driven gear drives a rack pointer along a dimension line with ticks (bp-line `#cfe8f7` strokes; an optional `#0f2c47` panel) | The rack pointer: x = progress × L. The gears turn **exactly** as the rack requires (θ₈ = x / r_pinion; θ₁₂ = −θ₈ × 8/12). Honest mechanism | The gears turn at 30°/s with the rack parked (clearly "working", not progressing) | One chalk circle draws around the end tick (`easeDraw`, 0.7 s) |
| **LD-HP "Light finds the ink"** | hp | `LINE_D` as a faint ink stroke (`#c9ac72` at 35%). A cool light point (`#eaf6ff` core sprite) travels it; warm candle sprites kindle behind | The light's position `pathLength = progress`. The ink behind it reaches full strength, and a warm point lights at every ⅛ (card scale: 32–40 points) | The light breathes at the Line's start (opacity .6 ↔ 1 at 0.5 Hz), and the first 12% of ink holds drawn | All points lit. The light rests at the end and becomes the last warm point |

### 8.1 Uses (a): REAL loading states (real progress or honest indeterminate)
| Where | Loader | Progress source | Text alternative |
|---|---|---|---|
| Intro: Play pressed before the flight is playable | LD-HP `card` | `video.buffered / duration` | `role="status"`: "Loading the flight…" (visible Meta) |
| Journey sequence decoding | LD-PC `mini` | decoded frames / 72 | none (decorative; the still and captions carry content) |
| Any world `MediaFrame` still pending decode after 400 ms | the section world's loader, `mini`, centred in the reserved box | indeterminate | none (aria-hidden; media is decorative) |
| Future article routes: `app/writing/[slug]/loading.tsx`, and chapter detail routes if added | the owning section's world loader (`worldOf` from the manifest), `route`, in a letterboxed full-viewport card | indeterminate (Suspense) | `role="status"`: "Loading essay…" / "Loading chapter…" |

**Rules for real loaders:**
- Show only after a 250–400 ms delay; never flash on fast loads.
- Never display a fake percentage. Where progress is unknown, use indeterminate.
- Never cover content that is already readable. Mini loaders sit only in empty reserved media boxes.
- Any loader in parallel with content stops moving after 5 s and holds a static frame (WCAG 2.2.2).

### 8.2 Uses (b): scroll-driven, non-blocking loading-reel interstitials
- **They are the act cards.** Every derived act card uses the loading-reel grammar:
  - letterbox (the ground is the bars)
  - upper bar: Meta act label plus a reel mark (`II / III`)
  - frame: the transition plus the incoming world's loader motif
  - lower bar: act title, optional epigraph, and the **progress element = scroll progress through the card**
- **Honesty:**
  - The word "loading", any spinner semantics, any percentage and `role="status"` **never** appear in an interstitial.
  - They never pin beyond their budget, never delay, and never block input.
  - Scrolling back reverses them exactly.
- **Derivation** (from the manifest, §12.3). A card is inserted before the first section of each act run. Its `kind` is `opening` for act 1, else `transitions[prevWorld>nextWorld]`, else `reel` (generic) if the worlds differ, else `title` (same world).
  - `reel` = the generic interstitial: 0 travel, natural passage, the incoming world's `cardStill` crossfaded in on `dur.preview` at p = .5, and its loader motif driven by passage progress.
  - Reordering or removing sections therefore always yields the right loader for the incoming world.
- **Reduced motion, Pause, no JS:** a **static title card**: letterbox, act label, act title, the motif in its `complete` state, epigraph, and the `summary` (sr and visible `small`).
- **No flashing.** No luminance change over 10% across more than 25% of a 10° field more than 3 times per second (WCAG 2.3.1). The only "flash" is the LD-PC tip, well under the area threshold.
- **Bar:** `bars/loaders.BAR.md` (the system) and `bars/act-cards.BAR.md` (the interstitials).

---

## 9. The world system

### 9.1 Worlds (tokens in DESIGN v2 §1.3; all AA CALC)
| World | Film · verb | canvas / raised / deep | Signature decorative inks (non-text) | Warm family | Grid / lattice |
|---|---|---|---|---|---|
| `house` | — | `#0b0f12` / `#121820` / `#05080a` | — | none | none |
| `pirates` | Pirates of the Caribbean · Navigation | `#0a1519` / `#10202a` / `#050b0d` | brass `#a8834a` (5.30), moon `#a9bcc0` (9.38), storm `#5f6e75` (3.50, never text) | lantern (in media only) | rhumb lattice ≤ 4% (desktop) |
| `idiots` | 3 Idiots · Explanation | `#0d1513` / `#141d1b` / `#060a09` (a green-black board) | chalk `#f2efe6` (16.1), bp-line `#cfe8f7` (14.6), graphite `#8b949e` (6.02); blueprint panel `#0f2c47` | morning daylight (in media only) | graph grid ≤ 6%, fading to 0 by the ledger's last row |
| `hp` | Harry Potter · Revelation | `#0f0c09` / `#18130e` / `#070504` | ink-contour `#c9ac72` (8.94), patronus `#b9d9f2` (13.25), lumos core `#eaf6ff` (sprites only) | candle (media, sprites) | none |
| `hp` paper plane | (Writing, D-4) | parchment `#ebe0c6` / `#f3ecda` / `#f7f2e4` | fg `#2e2318` 11.69 · muted `#5a4632` 6.79 · ghost `#6b5a47` 5.04 · accent `#115e59` 5.78 · kill `#b42318` 5.01 · exception `#7a4f00` 5.43 | parchment | none |

Text tokens (ink, stone, muted, aqua, ember, amber) pass AA on every world canvas, raised and deep (DESIGN v2 §1.3 table). Muted on the pirates overlay surface needed a retune to `#12232b` (4.67).

### 9.2 Transitions derived from data
`lib/film.ts`:
```ts
transitions: { "hp>pirates": "flight", "pirates>idiots": "seam", "idiots>hp": "ignite", "*": "reel" }
longCards:   ["pirates>idiots", "idiots>hp"]   // ≤ 2 (D-5); each ≤ 60vh, desktop fine pointer only
```
- `house` is **transparent**: it never triggers a transition. The "previous world" is the last non-house world before the card. So Card II→III after the intermission still resolves `idiots>hp` → `ignite`.
- `flight` is valid only for the prologue → hero pair.
- An unknown pair gets `reel`, plus a validator warning ("generic transition used for hp>idiots").
- `film.intensity` or a section's `worldIntensity` below `full` downgrades a long card to its static title card with 0 travel.

### 9.3 Title cards and letterbox rules
- **Letterbox:** ≥ 640 px wide, 2.39:1, on the incoming world's `deep`. The ground *is* the bars: no bar elements.
- **Upper bar:** Meta only (act label, reel mark). **Lower bar:** `title` (act title) plus at most one `lead` line (epigraph). Captions are never over moving media.
- **Type:** ≤ 3 styles (`meta`, `title`, `lead`). Film titles appear in the Meta credit only.
- **Structure:** each card is `<section id="act-n" aria-labelledby>` with an `h2` = the act title. Cards are nav-enabled in the menu and palette (group headers), but they are not numbered sections.
- **Below 640 px:** letterbox off, the static composition, 0 travel.

### 9.4 How films are named and credited (allow-list; everything else fails the lint)
| Place | Form |
|---|---|
| Prologue credit line | `AFTER PIRATES OF THE CARIBBEAN • 3 IDIOTS • HARRY POTTER` (Meta) |
| Opening card rows | `ACT I • AFTER PIRATES OF THE CARIBBEAN` (Meta) |
| Act card upper bars | `ACT II • AFTER 3 IDIOTS` (Meta) |
| Menu and command-palette group headers | "Act I · The Crossing — after Pirates of the Caribbean" |
| Films chapter | an `h3` title in Newsreader plus a Meta verb and years |
| Closing credits | `WORLDS BORROWED FROM` row plus the non-affiliation line |
| Hero (only if H-1 = on) | one Meta opening-credit line |

**Never:** in the header, the `alt` text, class names, public comments, the page `<title>` or meta description, OG images, logos, wordmarks, taglines, dialogue, catchphrases, character or spell names, or "inspired by" branding.

### 9.5 Header, menu, palette
- **Header:** `[AS]` · **act label** (Meta, `--fg-muted`, not `aria-live`; empty at the top; `ACT I • THE CROSSING` / `INTERMISSION` / `ACT III • THE LIGHT` / `CREDITS`; hidden below 640 px) · Work pill · waveform Pause · Menu. There is **no compass, no NOW SHOWING, no progress bar and no rail**.
- **Menu and palette** are grouped by act (derived), with film credits in the group headers. The palette adds "Skip to Act II", "Watch the intro again" (clears `intro-seen` and re-arms, not under RM) and "Pause motion".

### 9.6 Copy table and DRAFT policy (`lib/film.ts` `copy`)
Every new string has a status:
- `confirmed`: Aryan's existing words (`content.ts`, REPO). Renders everywhere.
- `proposed`: new microcopy about **the page** (labels, act titles, the borrowed lines, "Play"). Renders in dev and preview. **The production build fails** until Aryan signs the proposed list (`film.copySignedOff: true`, or per-string `status: "confirmed"`).
- `draft`: anything about **Aryan himself**: why a film matters, act loglines, personal notes. A DRAFT renders only in dev and preview, with a visible `DRAFT` Meta chip. **The production build fails if any draft would render**; a draft-reason screen ships *silent* (film, verb, borrowed line and links, but no reason).
- **Claude supplies prompts, never phrasings** for `draft` fields. There are no sample sentences and no aphorisms.

| Key | Status | Text / prompt |
|---|---|---|
| `act.1.title` / `2` / `3` | proposed | "The Crossing" / "The Workshop" / "The Light" |
| `act.n.logline` | draft | `[DRAFT — Aryan: one line, in your words, on what this act is about. Optional.]` |
| `opening.h2` | proposed | "A research journal in three acts." |
| `intro.title` | proposed | "ARYAN SHARMA • A RESEARCH JOURNAL IN THREE ACTS" |
| `intro.play` / `intro.skip` / `intro.desc` | proposed | "Play" / "Skip intro" / §5.2 description |
| `intro.loading` | proposed | "Loading the flight…" |
| `films.h2` / `films.lead` | proposed | "Three films" / "This page borrows its light from three films. Here is what it took from each." |
| `films.pirates.borrowed` | proposed (site fact) | "On this page it became the course line through the Journey and the instrument that settles on each bearing." |
| `films.idiots.borrowed` | proposed (site fact) | "On this page it became the blueprints: every schematic in Act II draws the real system, and the chalk circles the caveat, never the number." |
| `films.hp.borrowed` | proposed (site fact) | "On this page it became the light: ink that draws itself, and the lights that come on in Act III." |
| `films.<id>.reason` | **draft** | `[DRAFT — Aryan: what you took from this film, 1–2 sentences in your own words. Prompts: what do you remember first? Where does it show up in how you work? Leave empty to ship this screen without a reason.]` |
| `credits.ai` | proposed | "Claude (Anthropic), directed and reviewed by Aryan Sharma" |
| `credits.end` | proposed | "To be continued." |
| `card.2.epigraph` | confirmed | "Treat every backtest as guilty until proven innocent." (REPO) |

---

## 10. Motif registry (Kimi Part V §6 ids, plus new ids)

**Status legend:** KEEP (as Kimi specified, re-hosted) · AMPLIFY (bigger role) · MOVE (a new host) · RETUNE (behaviour changed) · DROP (with reason) · NEW.

| Id | Motif | Status | Host / rule |
|---|---|---|---|
| HP-01 | Ink draw-on strokes | KEEP | Intro bracket draw-on; Act III dividers (beyond, principles). ≤ 40 paths/scene |
| HP-02 | Candle point-light field | RETUNE → TA-08 + IN motes | No hero candle field. Intro motes ≤ 40 (canvas); ignite ≤ 40; never as ambient chrome |
| HP-03 | Lumos light sweep on text | DROP on text (Law 1) → **HP-03′** | HP-03′ = a one-shot mask moving the voices lead quote from `--fg-muted` to `--fg` (both AA). No luminous paint |
| HP-04 | Parchment | AMPLIFY | The whole Writing section on the paper plane (D-4 YES), not only a preview panel |
| HP-05 | Ink writes itself | KEEP | The Writing h2 nib-wipe; never a script font |
| HP-06 | Footprint traces | MOVE | Beyond, beside Athletics; abstract oval pairs; ember is not used |
| HP-07 | Patronus ribbons | KEEP | Principles titles, once on entry, no replay; `#b9d9f2`; never animal forms |
| HP-08 | Un-draw exit | DROP | P2 complexity, no gain |
| HP-09 | Lumos traverse over headings/name | **BANNED** | mustAvoid: light never runs across the name |
| HP-10 | Lumos lens light pool | DROP | Glow at the bracket breaks Law 1; the ledger is Act II |
| HP-11 | Far-to-near kindling | KEEP | Ignite order; intro mote arrival |
| PC-01 | Compass | MOVE / RETUNE | Only as the Journey instrument (TA-09), LD-PC and the films Pirates finale. **Never in chrome.** Ember arrow removed (ember = killed) |
| PC-02 | Chart / rhumb lattice | KEEP | Act I grounds, ≤ 4%, desktop only |
| PC-03 | Deep-sea grade | KEEP (as tokens) | The pirates world grounds |
| PC-04 | X-stamp | RETUNE | The pirates `emphasis` slot, in **brass**, not ember. Appears only if an evidence item is moved into Act I |
| PC-05 | Ring stack | DROP | Systems belongs to Explanation; the rings add ambient motion with no truth |
| PC-06 | Course-line progress | MOVE | A local course in Journey, the opening card and LD-PC. No page progress bar |
| PC-06′ | Moonlight hover | DROP | Unregistered; voices stays human |
| PC-07 | Lantern-in-fog layers | DROP (as code) | The lantern lives in MV-01 (foreshadow) and F-PC |
| PC-08 | Commit flash | KEEP | LD-PC completion only, 120 ms, tiny area |
| PC-09 | Needle points at intent | KEEP (one wink) | Journey waypoints only |
| PC-12 | Voyage image sequence | KEEP | Journey desktop |
| PC-13 | Wake brightens with velocity | KEEP | Hero media only |
| 3I-01 | Blueprint FIG panels | AMPLIFY | Chapters, the systems figure, Card I→II FIG. 0, films 3I finale |
| 3I-02 | Chalk marks | KEEP | Act II only; ≤ 3 per section |
| 3I-03 | Real-architecture schematics | AMPLIFY | Chapter covers **are** schematics (no generated covers) |
| 3I-04 | Gear pair | AMPLIFY → LD-3I | The honest gauge |
| 3I-05 | Callout leaders | KEEP | Chapters; hidden below md |
| 3I-06 | The Settle | KEEP | Non-interactive entrances in Act II only (`springSettle`) |
| 3I-07 | Grid → open air | KEEP | systems → ledger |
| 3I-08 | FIG numbering | NEW (from crafts) | Meta `FIG. n • …` derived per section |
| 3I-09 | Circled result | NEW | The gauntlet tally, the card gauge end, the films finale |
| TA-01 | Act cards | NEW (spine) | Derived loading-reel interstitials |
| TA-02 | The Line | NEW (spine) | §4 |
| TA-03 | Header act label | NEW | §9.5 |
| TA-04 | Opening card rows | NEW | SM-3 |
| TA-06 | Four bearings | NEW | About pillars |
| TA-07 | Chalk around the caveat | NEW | Chapters |
| TA-08 | Ignition sprites | NEW | Card II→III |
| TA-09 | Journey instrument | NEW | SM-4 |
| IN-01 | Play screen | NEW (N1) | §5.2 |
| IN-02 | Broom flight and trail | NEW (N1) | §5.3 |
| LD-PC / LD-3I / LD-HP | Loaders | NEW (N2) | §8 |
| FC-01 | Films screens | NEW | SM-9 |
| FC-02 | Seen here in | NEW (from crafts) | SM-9 |
| CR-01 | Credits roll | NEW (from screening room) | SM-13 |

### 10.1 Restraint rules, re-tuned for emphasis (per viewport unless noted)
1. **One world** per viewport. The exceptions are mid-card (two worlds by design) and the moment one films screen scrolls into the next.
2. **At most one ambient world-light system**: the hero loop, *or* the intro canvas, *or* the ignite canvas, *or* the contact loop.
3. **One aqua UI mark at rest** (the bracket group, an active gate, or the seam line in its window). Ember = killed only; amber in the DOM = EXCEPTION only.
4. **At most one emphasis cluster** (chalk circle / ribbon set / brass stamp); **≤ 3 chalk marks per section**.
5. Blueprint panels ≤ 40% of a section's area; the grid ≤ 6%; the lattice ≤ 4%.
6. **Canvas singleton** page-wide (intro, sequence, ignite: never two alive). **One video decoder** page-wide (IN-02, MV-03, MV-09: never two playing).
7. **Sprites:**
   - **Intro:** ≤ 64 live at any moment. At rest there are ≤ 40 motes. On launch the motes stream out and are culled to ≤ 16 before the trail (≤ 48 on desktop, ≤ 24 on mobile) peaks.
   - **Ignite and loaders:** ≤ 40 each.
   - All sprites are pre-rendered, DPR ≤ 2, and paused offscreen and on hidden tabs.
   - **Mobile:** 0, except the intro's lite trail (≤ 24).
8. **Film titles** only in the §9.4 allow-list.
9. **Instruments, compasses, gears, charts and diagrams** are code only (Law 2).
10. **Warm families:** exactly one per viewport (candle, lantern, parchment or morning light), and it lives in media, except parchment, which is a DOM plane.

---

## 11. The Reading Line: what is retained, and what changes

### 11.1 Retained unchanged
- The **huge static SSR name** (D-1), now read as the film's title. One `h1`, never animated, never crossed by light.
- The **bracket `[ ]`**, still the only framing device and still aqua. Its uses (≤ 1 per viewport):
  - ① the intro Play (the aperture spent on Play) or, when the intro didn't play, the hero aperture
  - ② the Lens Index tracker
  - ③ the contact close on AS
  - ④ the `[AS]` logo
- The **Lens Index**: D-6 equal quiet, verdict words always, and the ember strike on killed rows when active. It is the Act II climax.
- The **noise → order seam** (IceCut: ragged mask, ±40%·p², 3 px aqua line only mid-wipe), moved from the gauntlet's entry to Card I→II.
- The **writing index** (drafts are not links, the filmstrip slides) and the **contact resolution** (dome seam, invitation, magnetic Copy email plus mailto).
- **Type:** the 8-step scale; Geist / Geist Mono / Newsreader only; ≤ 3 styles per viewport; one Meta label system.
- **Motion:** native scroll; 3 registers plus 2 shapes (bracket, dome); poster-first media; one decoder; no WebGL; transform, opacity and clip-path only.
- **Honesty architecture:** the Sharpe-2.0 rule, limitations beside claims, `SYNTHETIC • ILLUSTRATIVE` adjacent, ratios never animated, drafts never links.

### 11.2 What changes
1. `data-world` recolours the tone planes inside the near-black band (AA computed).
2. The film light law (Law 1) replaces "no glow" for world media.
3. Derived act cards (loading reels) are a new element. The page sticky budget rises 90 → **150vh** desktop (2 × 60 + ≤ 30); mobile is 0.
4. Paper becomes HP parchment `#ebe0c6` with new inks.
5. The header gains the Meta act label. The progress bar and rail stay banned.
6. The hero is a **sea plate**, not the sculpture. The D3 HF pack is superseded by MEDIA-PLAN.
7. An **intro overlay** (N1) precedes the page, amending DESIGN v1 §11.4 "content-gating loaders" under §5's conditions.
8. Chapter covers become **truthful code schematics**, and the lens figures use schematic mono/colour pairs.

### 11.3 Retired (D-3 YES)
- chrome and effects: the credibility marquee, cursor glow, scroll-progress bar and section rail
- backgrounds: DotGrid, the hero bloom, the 13 faint backdrops and the second media band
- labels and counters: decrypting labels, replaying count-ups, ghost numerals and the draft pulse
- Kimi's header compass and PC-05 rings
- the D3 sculpture pack (HF-01…09)

---

## 12. Adaptability (SYNTHESIS §8 extended)

### 12.1 `lib/film.ts` (new; data only, no JSX)
```ts
export type WorldId = "house" | "pirates" | "idiots" | "hp";
export type Intensity = "whisper" | "grade" | "full";
export type CopyStatus = "confirmed" | "proposed" | "draft";
export type Copy = { text: string; status: CopyStatus; source?: string /* content.ts key or "REPO" */ };
export type LoaderKind = "course" | "gauge" | "ink-light" | "plain";
export type TransitionKind = "flight" | "seam" | "ignite" | "reel" | "title" | "opening";

export type WorldSpec = {
  id: WorldId;
  film: { title: string; years: string } | null;            // nominative credit only
  verb: "Navigation" | "Explanation" | "Revelation" | null;
  slots: {
    line: "course" | "blueprint" | "ink-light" | "none";
    emphasis: "stamp" | "chalk-circle" | "ribbon" | "none";
    ground: "rhumb" | "grid" | "none";
    reveal: "rise" | "draw" | "nib" | "clear";
    success: "needle-settle" | "chalk-tick" | "flare" | "none";
    loader: LoaderKind;
  };
  media: { plate?: MediaId; loop?: MediaId; mobile?: MediaId; cardStill?: MediaId; reelStill?: MediaId };
  borrowed?: Copy;                                            // films chapter, site fact
  reason?: Copy;                                              // Aryan's words; starts "draft"
};
export type ActSpec = { id: string; world: WorldId; title: Copy; logline?: Copy; epigraph?: Copy };
export type PrologueSpec = { enabled: boolean; world: WorldId; poster: MediaId; posterMobile: MediaId;
  flight: MediaId; trail: string /* json id */; landsOn: string /* section id */; maxFlightS: number };

export const film = {
  enabled: true,
  intensity: "full" as Intensity,
  heroCredit: false,
  copySignedOff: false,
  prologue: { enabled: true, world: "hp", poster: "IN-01", posterMobile: "IN-01m", flight: "IN-02",
              trail: "intro-trail", landsOn: "top", maxFlightS: 6.0 } satisfies PrologueSpec,
  worlds: { house, pirates, idiots, hp } satisfies Record<WorldId, WorldSpec>,
  acts: [
    { id: "act-1", world: "pirates", title: { text: "The Crossing", status: "proposed" } },
    { id: "act-2", world: "idiots",  title: { text: "The Workshop", status: "proposed" },
      epigraph: { text: "Treat every backtest as guilty until proven innocent.", status: "confirmed", source: "REPO" } },
    { id: "act-3", world: "hp",      title: { text: "The Light", status: "proposed" } },
  ] satisfies ActSpec[],
  transitions: { "hp>pirates": "flight", "pirates>idiots": "seam", "idiots>hp": "ignite", "*": "reel" },
  longCards: ["pirates>idiots", "idiots>hp"],
} as const;
```

### 12.2 `lib/page.ts` additions
```ts
type Base<T, P> = { /* …SYNTHESIS §8 fields… */
  act?: string | null;          // ActSpec.id; null = outside acts (hero cold open, intermission, credits)
  world?: WorldId;              // rare override; "house" allowed silently; any other warns ("world cameo")
  worldIntensity?: Intensity;   // default film.intensity
};
// New / changed union members
| Base<"gauntlet", { board: MediaId }>                                  // was { from, to }: the seam moved to Card I→II
| Base<"story", StoryProps & { variant: "split" | "filmstrip" | "contact-sheet" | "notes" | "voyage" }>
| Base<"films",   { order: "acts" }>                                    // the intermission; reads film.worlds
| Base<"credits", {}>                                                   // renders as <footer>
```

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
{ id:"principles", type:"principles", act:"act-3", numbered:true, props:{} },
{ id:"writing", type:"index", act:"act-3", tone:"paper", props:{ source:"writing", preview:"filmstrip" } },
{ id:"beyond", type:"story", act:"act-3", props:{ variant:"notes", … } },
{ id:"voices", type:"quotes", act:"act-3", props:{ source:"testimonials" } },
{ id:"contact", type:"contact", act:"act-3", tone:"deep", props:{ invitation:"…verbatim…", media:"MV-08" } },
{ id:"credits", type:"credits", act:null, world:"house", tone:"deep", props:{} },
```

### 12.3 Derivations in `lib/sections.ts` (pure, server-safe)
- **`worldOf(s)`** = `s.world ?? actOf(s)?.world ?? inherit(s)`. `inherit`: `hero` → the first act's world; `films`/`credits` → `house`.
- **`actRuns`:** contiguous runs by page order. **`numeral(act)`** = I, II, III by first appearance.
- **`cards`:** for each act run, a card before its first section:
  - `kind` = `opening` for the first act; else `transitions[\`${prevNonHouseWorld}>${act.world}\`]` ?? (same world ? `title` : `reel`)
  - `long` = `longCards.includes(key)` and intensity is `full`
  - `id` = `act-${n}`
- **`headerLabel(activeId)`:** hero → ""; an act section → `ACT ${numeral} • ${title}`; `films` → "INTERMISSION"; `credits` → "CREDITS".
- **Groups:**
  - `menuGroups` and `paletteGroups` are grouped by act run, with film credits in the headers.
  - `filmsInUse` = the films of the worlds of enabled acts, in act order (feeds the prologue credit line, the opening rows, the films chapter and the credits).
  - `seenHereIn(world)` = nav-enabled sections with `worldOf === world`.
- **Geometry:** `bearingOf(actIndex)` = `actIndex × 360 / acts.length + 22.5` (it feeds the films Pirates finale needle). `slot(section, name)` = `worlds[worldOf(section)].slots[name]`.
- **Rendering:** `app/page.tsx` renders `interleave(sections, cards)`, each via `ActCard` or `SectionFrame` + `registry[type]`. SectionFrame sets `data-tone` **and** `data-world`, provides `WorldContext`, and inserts the dome `Seam` only when no card sits between different tones.

### 12.4 How to…
- **Move a section between acts** (example: `systems` from Act II to Act III):
  1. In `lib/page.ts`, move the `systems` entry so it sits inside the Act III run (after `films`, before `contact`).
  2. Change `act: "act-2"` → `act: "act-3"`.
  3. Run `npm run check`.

  The following all re-derive, with no component edits:
  - its world (hp), ground and tokens
  - its emphasis slot (ribbon instead of chalk circle)
  - its FIG figure (drawn in ink-contour instead of blueprint)
  - the grid fade, which now ends at `kill-list` automatically
  - the header label, the menu group and the "Seen here in" links
  - `numberOf`
- **Reorder acts:** move whole runs. Cards, numerals, labels, groups and credits re-derive. Missing pairs get `reel` with a warning. If the first act's world is no longer `pirates`, the hero plate falls back to `worlds[first].media.plate`, and the validator warns that the prologue end frame no longer matches (the landing becomes a crossfade).
- **Add a film:** one `WorldSpec`, a `components/worlds/<id>/` folder implementing every slot (compile-time complete), tokens under `[data-world="<id>"]`, the AA table regenerated, and optional transitions.
- **Turn it down:**
  - `worldIntensity: "whisper"` on a section: ground grade plus act label only
  - `"grade"`: plus motifs and static cards, no loops or long cards
  - `film.intensity` sets the global default
- **Remove the movie layer:** `film.enabled = false`. The result:
  - every world is `house`; no intro, cards, films chapter or credits film rows
  - loaders become neutral (`plain`: a Meta status line only)
  - it renders **exactly Direction 3 minus its sculpture pack** (the hero uses `resolveMedia` fallbacks)
- **Delete an act:** set its sections to another act (or `enabled: false`). Its card, credit row, films screen and menu group vanish.

### 12.5 Validator additions (`scripts/check-manifest.mjs`, run in `npm run check` and CI)
**Errors:**
1. Acts are contiguous; ≤ 3 film worlds; ≤ 3 major world changes (the prologue flight counts).
2. Exactly one `hero`, first, with `act: null`. `credits`, if present, is last, and `contact` is the last section before it. ≤ 1 `films`.
3. ≤ 2 long cards (D-5), each ≤ 60vh travel, desktop fine pointer only. Page sticky travel ≤ 150vh desktop and **0** below 640. Per-section travel ≤ 30vh unless it is a long card.
4. `signature` ≤ 5; `scene` + long cards ≤ 2.
5. The world × tone AA table, computed from the CSS tokens: text < 4.5 or UI < 3 fails.
6. Any `draft` copy that would render in production fails. Any `proposed` copy in production without `copySignedOff` fails.
7. A **banned-term lint** over `content.ts`, `film.ts`, UI strings, alt text, class names, public comments and media prompts: character and spell names, catchphrases, dialogue, "lumos", "mischief", "arr", studio marks. Film **titles** are allowed only in `WorldSpec.film` and the §9.4 render sites.
8. Every `higgsfield` MediaAsset carries `accept: { people:false, text:false, filmLegal:true, checkL:"aryan:<date>" }` and complete provenance. Anything depicting Aryan is `authentic`.
9. The prologue's `landsOn` resolves to the hero, and `flight`, `poster` and `posterMobile` resolve (fallbacks allowed).
10. The hero `cta.to` resolves to an enabled section. Every `seenHereIn` link resolves.

**Warnings:**
- a `world` cameo override
- a generic `reel` transition in use
- the prologue end frame ≠ the hero plate
- `contact` not last-before-credits
- the Act II run is longer than 6 sections

### 12.6 Adaptability fixtures (each must pass every bar)
- **A:** the default.
- **B:** `systems` moved to Act III.
- **C:** acts reordered HP → 3 Idiots → Pirates (generic reels plus warnings, crossfade landing).
- **D:** `film.enabled = false`.
- **E:** `films` disabled (the II→III card still resolves `idiots>hp`).
- **F:** `journey` disabled (Act I = `about` only).
- **G:** `film.intensity = "grade"` (no long cards, no loops, static cards).
- **H:** the prologue disabled.

---

## 13. Reduced-motion / mobile / no-JS / Save-Data / `?skip` contract

| Element | Reduced motion or Pause | Mobile (<640 or coarse) | No JS | Save-Data / 2G / 3G | `?skip` |
|---|---|---|---|---|---|
| Intro (N1) | **never shown** | lite: still plus code flight, dome exit | never shown | never shown | never shown |
| Hero | open, poster only, no noise | stacked, MV-02 still, aperture on decode | open, poster | still, no aperture | open |
| Opening card | static course, needle at bearing | static | static SSR | static | static |
| Journey | carousel with stills | carousel | stacked stills | carousel, stills only | static |
| Card I→II | static title card | static (FIG drawn once, R1) | static | static | static |
| Gauntlet | settled tally, no Run | vertical tabs | list plus static SVG | Run works (SVG is code) | Run instant |
| Chapters | drawn | stacked, no leaders | drawn | drawn | drawn |
| Ledger | instant swaps | list, centre-line active | idle state, legible | colour figures lazy | instant |
| Films | stills plus final finales | 3:2 crops, final finales | stills plus text | small stills | final |
| Card II→III | MV-07 still plus captions | still | still | still | still |
| Writing | inline art, no nib-wipe | inline | inline | inline, mono | final |
| Contact | poster, resolved, no flare | still, tap to copy | mailto only | still | resolved |
| Loaders | static `complete` | same | static SSR (cards) | same | static |

**Global:**
- Reduced motion or Pause stops **all** JS, canvas and video motion, and makes 0 video requests.
- The waveform toggle (`aria-pressed`, sessionStorage in try/catch) is the WCAG 2.2.2 control for the page.
- The intro's own motion self-stops ≤ 5 s at rest.

---

## 14. Performance budget
| Item | Budget |
|---|---|
| LCP (mobile lab) | ≤ 2.5 s; the element is the h1 or the MV-01 poster, **with the intro armed** |
| CLS | 0 (including intro arm and exit, the poster → video swap, and card pins) |
| Intro controller | ≤ 6 KB gz vanilla; overlay first paint = CSS, text and SVG only |
| Video | IN-02 ≤ 4 MB; MV-03 / MV-09 2–4 MB; mobile 0 bytes of video unless opted in |
| Image sequence | JV 72 × WebP 1280 w ≤ 3 MB, desktop only, fetched within 1 viewport |
| Posters | the hero 200–350 KB; others lazy |
| Canvas | singleton; DPR ≤ 2; paused offscreen and on hidden tabs; skipped when `hardwareConcurrency < 4` (static fallback) |
| JS for the film layer | worlds and cards code-split per world; `film.enabled=false` drops them from the bundle |

---

## 15. Honesty and legal checklist (binary; the critics run it on every phase)
1. ☐ No film stills, posters, logos, wordmarks or title typography anywhere, including the OG image and favicon.
2. ☐ No characters, likenesses, actors, silhouettes, people, faces or hands in any generated asset (`accept.people=false`).
3. ☐ None of the following in media or code art:
   - wand, scar, round glasses, owl, snitch, Deathly Hallows, crest, house colours, castle or towers, great hall, floating-candle ceiling
   - ship, hull, sail, Black Pearl, skull, Jolly Roger, compass-dial art, Mao Kun or any traced map
   - campus, scooter, drone or quadcopter, mountain lake
4. ☐ The broom is a plain riderless besom with no brand cues.
5. ☐ No film dialogue, catchphrases, lyrics, or character or spell names in copy, alt text, class names, comments or prompts (banned-term lint green).
6. ☐ Film titles appear only in the §9.4 allow-list, in our type, as nominative credit, with the non-affiliation line in the credits.
7. ☐ Check L signed for every generated asset by Claude **and** Aryan.
8. ☐ No `draft` renders in production. Every personal reason is Aryan's own confirmed words, or absent.
9. ☐ No invented facts about Aryan. The Journey, the gauntlet, the metrics and the testimonials are verbatim `content.ts`. Voyage metaphors decorate verbatim facts; they never add events.
10. ☐ CLAUDE.md §2 exclusions are absent everywhere (grades, GPA, attendance, family finances, hardship narratives, address, phone, family identifiers).
11. ☐ The Sharpe-2.0 rule, `SYNTHETIC • ILLUSTRATIVE` adjacent to its figure, caveats beside claims, ratios never animated, and drafts not links: all unchanged.
12. ☐ Every schematic depicts the **real** system (nodes traceable to `content.ts`). The chalk circle marks a caveat, never a metric.
13. ☐ Generated media is decorative (`alt=""`), never evidence, never depicts Aryan, and carries provenance. The credits disclose Higgsfield and the AI assistance.
14. ☐ Loaders never fake progress. Interstitials never claim to load.
15. ☐ Film years are verified before ship (HP 2001–2011, POTC 2003–2017, 3 Idiots 2009; INFERRED correct, verify).

---

## 16. Decisions still for Aryan (each has a default that this spec already assumes)
| # | Decision | Default |
|---|---|---|
| H-1 | A film credit line in the hero? | **Off** (the prologue and the opening card name the films; screen one stays name-first) |
| F-1 | Act titles | The Crossing / The Workshop / The Light |
| F-2 | Act order | Pirates → 3 Idiots → HP, with the HP prologue |
| F-3 | Name the studios in the non-affiliation line? | No (a generic "the films' studios or rights holders") |
| F-4 | Writing covers W-01…05 | Yes, if the budget holds; type-only otherwise |
| F-5 | Sign off the §9.6 proposed microcopy | Required before production |
| F-6 | Write the three film reasons (or leave them silent) | Silent until written |
| F-7 | Page sticky budget 150vh (the D-5 consequence) | Yes |
| F-8 | Journey image sequence (≈ 66 credits planned) vs four stills | Sequence |

---

## 17. Hand-off to PLAN (build order; each phase ends in the bar loop: 3 critics, ≤ 3 rounds)
1. **Foundation:**
   - `lib/film.ts`, the `page.ts` additions, the `sections.ts` derivations and the validator
   - world tokens and `data-world`; DESIGN v2 motion tokens; `WorldLoader`; `ActCard` (static)
   - the head script (`motion-ok`, `intro-armed`, failsafe)
2. **`/lab` prototypes on native scroll:** the intro (code flight first), Card I→II (with legacy stills), Card II→III (code sprites), and the Journey sticky column (stills). These are judged with frame sequences before integration (SYNTHESIS §2.10).
3. **Media stage 1** (runs in parallel with 1–2): the M-01/IN-01/MV-06/MV-07 comps → MV-01 (gate) → the anchors per world.
4. **Sections, by act:** hero → Act I → Act II (gauntlet, chapters/schematics, ledger) → films → Act III → contact → credits.
5. **Media stages 2–6**, integrated as each is accepted. The code runs on fallbacks until then.
6. **Hardening:** the adaptability fixtures A–H, perf, a11y and the honesty checklist.

**Bars** (all in `build/bars/`):
- adapted: hero-lens · noise-order-seam · lens-index · writing-index · contact-resolution · scene-host
- new: intro · loaders · act-cards · ignite · journey-voyage · films-chapter
