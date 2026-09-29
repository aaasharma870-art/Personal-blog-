# M1-REPORT: "One Line, Four Lights", Milestone 1

**Branch:** `design/three-films` (in `personal-website/`). **Not pushed.**
**Date:** 2026-09-29.
**Head:** `37161bb`.

**Milestone 1 commits (oldest first):**

| Commit | What it did |
|---|---|
| `39eb5f5` | integrator |
| `f4ca8d8` | four worlds |
| `49a4f1e` | hero, act cards and loaders |
| `1e6c30f` | prologue |
| `7d07da9` | assembler |
| `37161bb` | **fix round** |

**Frames:** `research/build/m1-frames/after/index.html` is the contact sheet for sign-off: 57 frames plus the checks. The pre-fix frames the critic reviewed are in `m1-frames/index.html`, now marked superseded.

---

## 1. What Milestone 1 delivers

The whole single-page site now plays as four worlds, in four acts, on one page. Each world is our own recreation of its film or game's iconography. Aryan's name remains the one `h1` from the first byte.

### The prologue (Harry Potter)

**The play screen:**
- the castle over the black lake, with floating candles
- a riderless broom
- `[ ▶ Play ]` inside the aqua bracket
- the oath line
- Skip intro

**Pressing Play (video path):** a six-second broom flight (IN-02) lands on the hero sea.

**The code flight** runs on mobile, on low-power devices, or when the video is late:
- The SVG broom lifts off a broom-less plate, and flies out with a tapered light trail.
- The overlay then exits by the dome.

**Rules the prologue follows:**
- It never gates content: the page underneath is complete in the SSR.
- It never arms under reduced motion, Pause, `?skip`, `#hash`, Save-Data, or when the intro has already been seen this session.
- Esc, Skip or scroll clears its text in 80 ms and hands focus to the `h1`.

### The hero (Act I, Pirates)

- "Aryan Sharma" over the night sea, with the Black Pearl on the horizon.
- The aqua Lens bracket frames the glowing crest. Its right spine sits on the page gutter.
- The MV-03 sea loop plays on desktop only, with one video decoder.
- An aperture opens the hero once per session when the intro did not play. The bracket halves ride a feathered clip.

### The four act cards

Each card is a letterboxed 2.39:1 "loading reel".

- **I · Opening:** the program. Jack's compass heads a brass course that plots through the four acts as you scroll, and the needle settles on Act I.
- **II · Storm → Blueprint:** a pinned card. A ragged ice-cut wipes the storm into a blueprint. FIG. 0 draws "The Line" with its true length. The card ends with Rancho's chalk circle and the title in Kalam.
- **III · The tintype:** a low sun sinks. A graphite trail is drawn, and a sepia tintype develops into a frontier dusk.
- **IV · The ignition:** a pinned card. Embers rise from a campfire and become floating candles along the Line. The title is in IM Fell.

### The four worlds across the sections

Each world has its own grounds, inks, type and one iconic motif per section.

- **Pirates:** About and Journey. Brass instruments, and the voyage chart with THE CROSSING cartouche.
- **3 Idiots:** Work and Systems. The blueprint and chalk.
- **RDR2:** Beyond, Writing and Voices. The frontier handbill and trail map, the journal on paper with graphite vignettes, and the campfire.
- **Harry Potter:** Principles and Contact. Ink that draws itself, and the candle.

### World loaders and chrome

- **World loaders**, each at card and route size (see `/lab`):
  - course / compass (Pirates)
  - gauge (3 Idiots)
  - plate-trail (RDR2)
  - ink-light (Harry Potter)
- **The header** shows the act label and the world ground, with Work, the motion toggle and Menu.
- **The closing credits roll** carries the exact fan-tribute line: "Fan tribute — not affiliated with Warner Bros., Disney, Vinod Chopra Films or Rockstar Games." It also credits imagery provenance and the AI assistance.

### Accessibility and performance (verified in the fix-round capture)

- 0 console errors or hydration warnings across 9 runs.
- One `h1` at 1440 and at 390.
- No horizontal overflow.
- At most 1 `<video>`; 0 on mobile and under reduced motion.
- Reduced motion and Pause give static compositions.
- Targets are at least 44 px.
- The video flight ends at 6.18 s (cap 7.0) and the code flight at 5.94 s. rAF p95 is 16.8 ms during both.

### Best 8 frames

1. `C:/Users/aaash/Desktop/Transcript/research/build/m1-frames/after/01-intro-play-settled.png`: the play screen.
2. `C:/Users/aaash/Desktop/Transcript/research/build/m1-frames/after/17-hero-1440-settled.png`: the name at sea, with the bracket on the crest.
3. `C:/Users/aaash/Desktop/Transcript/research/build/m1-frames/after/20-card-act-1-settled.png`: the opening program, with the compass course.
4. `C:/Users/aaash/Desktop/Transcript/research/build/m1-frames/after/22-card-act-2-settled.png`: the blueprint, with "The Workshop" in Kalam.
5. `C:/Users/aaash/Desktop/Transcript/research/build/m1-frames/after/24-card-act-3-settled.png`: the frontier tintype.
6. `C:/Users/aaash/Desktop/Transcript/research/build/m1-frames/after/26-card-act-4-settled.png`: the candles lit along the Line, with "The Light" in IM Fell.
7. `C:/Users/aaash/Desktop/Transcript/research/build/m1-frames/after/29-world-pirates-journey-1440.png`: the voyage chart and THE CROSSING cartouche.
8. `C:/Users/aaash/Desktop/Transcript/research/build/m1-frames/after/32-world-rdr2-writing-1440.png`: the journal on paper.

---

## 2. Run it locally

```bash
cd C:/Users/aaash/Desktop/Transcript/personal-website
npm install        # first time only
npm run dev        # → http://localhost:3000
```

- **`http://localhost:3000/?intro=1`** replays the prologue. It forces arming even when the intro was already seen this session. In the console, `window.__intro.replay()` does the same thing.
- **`http://localhost:3000/?skip`** skips every skippable moment: the intro and the hero aperture. `?skip=intro` or `?skip=hero` skip one moment by name.
- **`http://localhost:3000/lab`** is the noindex primitive workbench: the loaders, Lens and route loaders.
- **Dev versus production:** the prologue and the act titles use *proposed* copy.
  - They render in `npm run dev` and in `FILM_PREVIEW=1` builds.
  - A plain production build gates them until Aryan signs the copy off. The acts then read "Act I" to "Act IV", and no intro ships.
  - To preview production with the film copy: `FILM_PREVIEW=1 npm run build && FILM_PREVIEW=1 npx next start`.
- **Checks:** `npm run check` runs tsc and the manifest/film/media validator. Also run `npx eslint .` and `npm run build`.

---

## 3. Fix round (critic → disposition)

| # | Critic issue | Disposition |
|---|---|---|
| 1 | Cards III and IV showed legacy "Midnight Aqua" stills: a sci-fi horizon and a teal nebula | **Fixed, adapted.** See the note below the table. |
| 2 | World lettering never rendered on a first visit; "The Crossing" rendered in mixed faces | **Fixed.** See the note below the table. |
| 3 | Act I card never went live at 1440×900; weak composition | **Fixed.** See the note below the table. |
| 4 | Code flight looked theme-park: a smear, clip-art broom and lightsaber trail; frame 10 was mislabeled | **Fixed, 0 credits.** See the note below the table. |
| 5 | Lens right spine 8 px from the viewport edge | **Fixed.** See the note below the table. |
| 6 | Aperture halves lagged the clip; hard seam through "Sharma" | **Fixed.** See the note below the table. |
| 7 | Esc path double-exposed text over the name; stray aqua box | **Fixed.** See the note below the table. |
| 8 | Act II wedge | **Fixed.** See the note below the table. |
| 9 | Captures shot mid-scroll (`scroll-behavior: smooth`) | **Fixed.** See the note below the table. |

**Notes on each fix:**

1. **Legacy stills on cards III and IV.**
   - MV-06, MV-07, MV-08, MV-10 and MV-11, and F-RD and F-HP, no longer fall back to legacy stills. Each declares a `codeAlt` instead.
   - A new validator rule: a film world's media may never resolve to provenance `legacy`.
   - Instead of the generic ReelFrame the critic proposed, the cards keep their signature choreography with the MEDIA-PLAN code alternatives:
     - Card III develops into a code golden-hour frontier: ridges, haze, the low sun and a frayed grass line, all tintyped.
     - Card IV ends on its own final frame, as ignite.BAR specifies for "MV-07 missing". The static card is that same frame in SVG, with 0 canvas.
   - **Not done:** generating MV-10 and MV-07. MEDIA-PLAN gate G0 (the v2 RDR2 set) and gate G1 (composition drafts) are Aryan's to approve, so no credits were spent.
2. **World lettering.**
   - The three act-title faces now use `display: "swap"` instead of `optional`. With `optional` and no preload, a face missed its roughly 100 ms window and never rendered.
   - A fixed `.lettered-title` line box keeps CLS at 0. The swap lands offscreen.
   - `letteringFor()` matches the glyph subset case-sensitively, and sets all-caps lettering with `uppercase`. The cartouche and route loader now read THE CROSSING, entirely in Pirata One.
3. **Act I card.**
   - The IntersectionObserver now treats an edge-adjacent entry (ratio 0) as clear. All 4 cards are live at load.
   - Recomposed: the h2 sits on the left; on the right, a 112/144/160 px compass heads a brass course that runs through two-line rows. The course is the progress element, and the orphan rule is gone.
4. **Code flight.**
   - The broom mask is now filled from IN-01-empty and IN-01m-empty. These are the same plates with the broom removed by local OpenCV shift-map inpainting, pixel-registered, at 0 credits.
   - The SVG broom is re-graded to colours sampled from the plate.
   - The trail tapers (radius ∝ alpha^0.7), frays, and is composited from its own layer at 0.6 peak luminance.
   - The capture now waits for S2c and shoots the real 1440 code flight.
   - IN-02's pale handle remains a flag for Aryan's G3; it is media, not code.
5. **Lens right spine.**
   - `settleFrame` gets `margin` = the resolved page gutter (SSR: 64). The spine is now at x 1375–1376, which is 1440 − 64.
   - 94% of the crest stays inside the bracket, so the focal change was not needed.
6. **Aperture.** The Lens was rewritten imperatively: one clock drives the clip, and each half rides its clip edge until it rests. The clip is a 48 px feathered mask, centred on the edge.
7. **Esc path.**
   - `html.intro-leaving` hides the credits, oath, Play, bracket and Skip within 80 ms; only the plate fades.
   - The hero opens without an aperture.
   - The bookend line is removed. Q-HP-2 lives on in the credits and the footer egg.
8. **Act II wedge.**
   - `cutAt = 0.1 + 0.74w`. The edge now clears the frame at both ends, including the jitter.
   - The mask is set to `none` once the wipe completes.
9. **Mid-scroll captures.**
   - Every capture scroll now uses `behavior: "instant"`.
   - Frames 19–26, 42 and 44 were re-shot validly.
   - The screenshot-free timing probe is `tools/m1/intro-timing-probe.js`.

**Not addressed:** the critic's issue list was cut off after item 9 in the task text, so any minor items after it were not seen.

---

## 4. Deferred to Milestone 2 (SPEC v2 signature moments)

**Built in M1:**

| Moment | Status | Notes |
|---|---|---|
| SM-1 prologue | Built | |
| SM-2 hero | Built | |
| SM-3 opening card | Built | |
| SM-5 Card I→II seam | Built | Its storm plate MV-04 is still the code-graded MV-01 |
| SM-10 Card III→IV ignite | Built | In code; the MV-07 hall is pending |
| SM-13 credits | Built | In the footer |
| SM-14 Card II→III tintype | Built | In code; the MV-10 plate is pending |
| SM-4 the voyage | In code | The MV-05a–d stills and the JV sequence are not made |
| SM-11 the journal | In code | |
| SM-15 the frontier | In code | The MV-10 golden-hour band is pending |
| SM-16 by the fire | In code | The MV-11 plate and MV-11L loop are pending |
| SM-12 last light | Code InkCandle stand-in | The MV-08 plate and MV-09 loop are pending |

**Deferred to M2:**
- **SM-6 the gauntlet on the dawn board:** the MV-06 board plate, and `work`'s signature choreography beyond the M1 re-skin.
- **SM-7 honest chalk:** the chapters get their own sections (`trading-algos`, `optuna-screener` and `experiment` are `enabled: false` stubs; they render inside `work` today).
- **SM-8 the reckoning (Lens Index):** the ledger builder's M2 work. `#kill-list` still renders inside the `work` gauntlet.
- **SM-9 the Intermission, "Three films and a game":** the films chapter is not built (`enabled: false`), and neither are its F-PC, F-3I, F-RD and F-HP screens. This is also where each world's "why this film matters to me" line would show.
- **SM-17 Dead Eye:** the opt-in egg on the kill-list. The command-palette egg commands are also deferred.

**Media still to make, all behind Aryan's gates (MEDIA-PLAN):**
- MV-04, MV-05a–d, JV, MV-06
- MV-07 and MV-08/09
- MV-10, MV-10m, MV-11 and MV-11L
- F-PC, F-3I, F-RD and F-HP

---

## 5. DRAFT copy and decisions for Aryan

**Hidden until you write them** (status `draft`; never shown in production):
- **Each world's "why this film matters to me"** (`film.worlds.*.reason`: Pirates, 3 Idiots, RDR2, Harry Potter), 1–2 sentences in your own words. Leave it empty to ship that screen without one.
- **Each act's logline** (`film.acts.*.logline`, ×4).
- **The Beyond handbill REWARD line** (`copy.beyond.handbill.reward`).

**Proposed, awaiting sign-off.** 27 strings in all (the ones below and the rest in `lib/film.ts`). They render in dev and preview builds only:
- the act titles: The Crossing, The Workshop, The Frontier, The Light
- the opening h2: "A research journal in four acts."
- the intro copy: title, Play, Skip intro, description, "Loading the flight…"
- the four "On this page it became…" borrowed lines
- tips 3 and 6 ("The frozen rule is run on the holdout exactly once…" and "Target CPCV Sharpe 1.0–1.5 · anything > 2.0 is a red flag.")
- the Nox and Lumos pause tooltips
- the credits' AI line, legal line and "To be continued."
- the handbill subtitle
- the map and photo captions ("Photograph: Aryan Sharma" needs your OK)
- the Dead Eye status

**Quotes (12, all `proposed`):** Q-HP-1–4, Q-PC-1–3, Q-3I-1–3 and Q-RD-1–2.
- Q-PC-1, Q-PC-3, Q-3I-3, Q-RD-1 and Q-RD-2 are COMMUNITY-sourced. Verify each against the work before marking it confirmed.

**Writing entries** keep their visible **DRAFT** label; the essays are yours to write.

**Media check L2 countersignatures:** IN-01, IN-01m, IN-01-empty, IN-01m-empty, IN-02 (+ poster), MV-01, MV-02, MV-03 (+ poster).

**Open media flags:**
- IN-02: the pale bone-white handle (G3). Choose between the primary and alternate 1.
- MV-03: the wrap step (watch 3 joins).
- The MEDIA-PLAN v2 cap of 950 (RD-6), and the RDR2 set with riderless horses (G0 v2).
- The composition drafts for MV-07-C and MV-10-C (G1).

**Standing CLAUDE.md confirmations:** the Gita reference, teachers' names, and the curated repo set.

---

## 6. Credits spent (from `media/LEDGER.md`)

| Stage | Credits |
|---|---|
| Step 1 (stills: M-01, IN-C, MV-01, IN-01, MV-02, IN-01m) | **43** |
| Step 2 (motion: IN-02 ×13 runs + 2 keyframes, MV-03 ×2) | **161.5** |
| M1 fix round (IN-01-empty and IN-01m-empty made locally with OpenCV) | **0** |
| **Program total** | **204.5** |

- The LEDGER header cap is 750; MEDIA-PLAN v2 proposes 950, pending Aryan.
- The Higgsfield balance was **995.5** when last confirmed (2026-09-28 19:20 ET).
- No Higgsfield call was made this round.

---

## 7. Known issues

1. **Film plates still missing.** Cards III and IV and the RDR2 and Harry Potter sections run on code alternatives until MV-10, MV-07, MV-08 and MV-11 are generated (gated). They read clearly as each world, but not yet as photographic plates.
2. **IN-02 handle.** The video flight's broom handle is bone-white where IN-01's is dark wood (frames 04–05). This is media; it needs Aryan's G3 call or a regeneration (about 16 credits over IN-02's cap).
3. **Broom-less mobile plate.**
   - IN-01m-empty has a faint soft patch at the handle tip beside the castle's left tower, about 8 css px at 390. It shows only while the broom lifts off.
   - If Play is pressed before the broom-less plate has decoded, the fill falls back to the old pull-push smear. The plate loads right after the play plate.
4. **The code-flight broom is still a vector broom.** It is darker, rim-lit and graded to the plate, but its fan reads flatter than the photographic broom.
5. **Font policy change.** The act-title faces use `display: swap`. This deviates from DESIGN v3 §2.1.1 (`optional`), deliberately; see `lib/fonts.ts`. The Rye egg face stays `optional`.
6. **Opening card height.** Row heights are equal only while each credit fits on one line under its title. The card is sized for 4 rows: enabling the Intermission row adds a fifth, which would crowd the 1024×768 frame.
7. **LCP is not measured on a mobile lab.** The lab numbers (1440: 120 ms; 390: 508 ms, the MV-02 image) are unthrottled SwiftShader.
8. **Pre-existing overflow offender.** An SVG path extends to x −206…1864 at 1440 after the walk. It is clipped, and there is no document overflow. It existed before this round.
9. **Critic list truncated.** Any minor items after item 9 were not visible in the task text.

**Builder file list (committed in `37161bb`):**
- `app/globals.css`
- `app/intro.css`
- `components/intro/{broom.ts, controller.js, controller-version.ts, intro-model.ts, intro-overlay.tsx}`
- `components/primitives/lens.tsx`
- `components/primitives/loaders/route-loader.tsx`
- `components/sections/act-card/{act-card-section.tsx, card-shell.tsx, frames/ignite.tsx, frames/opening.tsx, frames/seam.tsx, frames/tintype.tsx}`
- `components/sections/hero/{focal.ts, hero-section.tsx, hero-stage.tsx}`
- `lib/{fonts.ts, media.ts, sections.ts}`
- `public/intro/intro.js`
- `public/media/films/{intro-play-empty.webp, intro-play-mobile-empty.webp}`
- `scripts/check-manifest.mjs`

**Research-side changes (not committed):**
- `tools/m1/capture.js` (the old version is kept as `capture.before-fix.js`)
- `tools/m1/sheet.js`
- `tools/m1/intro-timing-probe.js`
- `m1-frames/after/*`
- `m1-frames/summary.json` and `m1-frames/index.html`
- `media/LOG.md` and `media/LEDGER.md`
- `media/masters/IN-01-empty/`
- `media/accepted/intro-play*-empty.webp`
