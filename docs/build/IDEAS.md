# IDEAS: Phase 3, "Keep them scrolling" (brainstorm, 2026-09-30)

**Status: IDEAS ONLY. Nothing here is built.** Aryan and Claude brainstormed this after reviewing the finished site. A later session turns it into a spec and plan, then builds it.

**Aryan's verdict on the current site.** It feels choppy.
- The transitions aren't smooth or cool enough to be entertaining.
- The animations aren't as cool as they should be.
- Long stretches of reading with no image, transition, movement or easter egg feel "long and dreadful".
- The hand-off from the intro to the first page is choppy.
- It needs to be more interactive, with cool things to play around with.

**The goal:** entertain continuously so viewers keep scrolling. The site should feel interactive, even like the movies.

## 0. Decisions Aryan made (BINDING for Phase 3)

These override the older "native scroll only / no WebGL / no audio" rules in `SPEC.md`, `DESIGN.md` and `AUTOPILOT.md`.

| # | Decision | Answer |
|---|---|---|
| 1 | **Smooth scrolling** (Lenis + GSAP ScrollTrigger scrub smoothing) | **YES, absolutely.** Off for reduced motion and Pause. Phones keep native touch scroll unless testing shows Lenis is better there. |
| 2 | **One contained WebGL layer** for image transitions (liquid, displacement, ink, wave) | **YES.** Lazy-loaded, with a plain-image fallback. |
| 3 | **Spend ~350 of the 506.5 Higgsfield credits** turning stills into living loops | **YES.** Generation works in the cloud session too (Aryan confirmed). Keep a reserve of ≥ 100. |
| 4 | **Easter-egg hunt with a visible counter** | **YES.** |
| 5 | **Sound** | **YES.** Themed per world, enough to feel interactive or like the movies. It can call out eggs ("Lumos", "I solemnly swear that I am up to no good"). Muted by default, with a clear toggle. |
| 6 | **Everything in A–G below** | **YES, all of it.** |
| 7 | **More interactivity** | **YES.** Things to play with in every act (§H). |
| 8 | **Different fonts per movie/game** | **YES.** Headers match each film's iconic style; body text is a more legible mix of that style (§I). |
| 9 | **Fix the intro → first page hand-off** | **YES** (§J). |

## 1. Why it feels choppy (Claude's diagnosis)

1. **Raw native scroll.** Scroll-linked effects step with every wheel tick. Every award reference we studied (Lusion, Dennis, Obys, Igloo) smooths scroll. This is likely the biggest single cause.
2. **Visuals come in islands.** A plate, then a long run of text, then an act card. Nothing holds the eye in between.
3. **Most plates are stills.** About 5 of the 50+ images move.
4. **The intro hand-off** swaps video → poster → loop while the page hydrates (§J).

**First step before building anything:** record the real site on Aryan's actual laptop (GPU) and phone, using the Chrome performance panel plus `tools/capture/motion.js`. The cloud's motion report was measured in software rendering and says itself that it is pessimistic. We need to separate real frame drops from design that just feels steppy. **Aryan still owes:** where he saw the choppiness (laptop, phone, which browser).

## 2. The ideas

### A. A persistent "stage": an image always in view
- A sticky full-viewport media layer sits behind the content. Text scrolls over it, and the plate crossfades or morphs as each section passes (scrollytelling).
- On desktop, long reading sections become split-screen: text on one side, a pinned moving visual on the other.
- **Rule:** at nearly all times a film image or video is on screen.

### B. Every plate moves (three tiers)
1. **Depth parallax** (code, 0 credits): cut each still into 2–3 depth layers (a depth map or manual masks) that drift with scroll and pointer. Add a Ken Burns push where layers aren't worth it.
2. **Living loops** (Higgsfield, ~14 credits each): 6–8 s silent loops made from the existing stills, start frame = end frame. Flickering candles, drifting fog, rolling sea, campfire sparks, chalk dust in a sunbeam, sails moving, train steam. Budget about 25 loops. Default + alt is still the rule where affordable.
3. **Scroll-scrubbed sequences** (like the voyage) for 3–4 hero moments, with the camera pushing in as you scroll. Candidates: into the Great Hall, toward the Black Pearl, across the ICE lecture hall to the board, into the camp at dusk.

### C. World-specific transitions (not fades)
- **Harry Potter:** ink bleeding across parchment, or a Lumos light sweep.
- **Pirates:** a wave washing over the frame, or a spyglass iris.
- **3 Idiots:** a chalk-dust wipe, or a duster swipe.
- **RDR2:** a film burn, a tintype develop, or a Dead Eye red flash.
- **How:** animated masks for the simple ones. The contained WebGL layer (decision 2) does the true liquid and displacement transitions between any two plates.

### D. The "no dead screen" rule
- No visitor scrolls more than about 1 viewport without a **beat**: a reveal, a moving image, a transition, a toy, or an egg.
- Write a **beat map** of the whole page (section → beats → scroll position).
- Have `scripts/check-manifest.mjs` enforce it: each section declares its beats, and the validator warns on gaps over 100vh.

### E. Easter-egg hunt (collectible, with a counter)
- One or more eggs per section.
- A small **"4 / 12 found"** tracker in the header (saved in localStorage), and a reward at 12/12: a secret scene or credits gag.
- Eggs can be **pointed out** with themed hints, since Aryan wants them discoverable. For example, the word "Lumos" glows faintly, or a line of parchment reads "I solemnly swear…".

| World | Egg candidates |
|---|---|
| **Harry Potter** | Type or say **"Lumos"** and the page lights up (**"Nox"** darkens it). Typing **"I solemnly swear that I am up to no good"** reveals the Marauder's Map, with footprints following the cursor; **"Mischief managed"** wipes it. A golden snitch occasionally crosses the screen and can be caught. Platform 9¾ (click between sections 9 and 10). Wingardium Leviosa (hover-float an element). |
| **Pirates** | Click Jack's compass and it spins, then points at what you hover. A kraken tentacle curls in at a section edge. Find the Aztec gold coin, and the moonlight turns the page skeletal for a moment. "Savvy?" appears on a long-press. Rum bottle "why is the rum gone". |
| **3 Idiots** | Press and hold the heart: **"Aal izz well"** plays its settle, with a heartbeat. Draw on the chalkboard with the cursor. Fly Rancho's drone. Virus's stopwatch. The "machine" definition quiz. |
| **RDR2** | Hold a key for **Dead Eye**: time slows, the page goes red, and X marks lock onto the killed strategies. Pet the horse. A campfire that flares when you hover. An honor meter that moves as you explore. A WANTED poster with the visitor's "bounty". |

### F. Text that performs
- Words light up as you scroll (the "reading line" made literal).
- Line-by-line masked reveals.
- Pinned pull-quotes.
- A cursor trail per world: lumos glow, sea wake, chalk dust, embers.
- Rolling counters for neutral counts only. Never Sharpe, PSR or PF.

### G. Claude's additions
- **Real-hardware testing first** (§1).
- **Cut the reading.** Collapse long text behind "read more" or accordions so visuals carry the scroll. This fits the "info later" plan.
- **Sound design** (decision 5):
  - An ambient bed per world: great-hall hum and candle crackle; sea, creak and wind; classroom and chalk; campfire, crickets and a distant train.
  - Short effects on eggs and transitions.
  - Original or licensed audio only (no ripped film scores). Higgsfield audio tools (`generate_audio`) can make it.
  - Muted by default, with a persistent toggle, and paused with the Pause-motion control.
- **Scroll-depth analytics** (Vercel Analytics or similar), to see where real visitors stop.
- **"Director's cut" autoplay:** a ▶ button that auto-scrolls the page like a film, with ambient sound, for visitors who just want to watch.
- **DVD-style chapter select** in the menu: scene thumbnails per act.
- **A fast lane for admissions readers:** a "Skip to the research" control is always visible, so entertainment never blocks someone in a hurry.
- **Achievements and share card:** at 12/12 eggs, a shareable "Mischief managed" card.

### H. More interactivity: things to play with (one toy per act, minimum)
- **Prologue / Harry Potter:** the cursor becomes a wand tip that casts light. The play screen's candles react to the pointer.
- **Pirates:** steer toward the Black Pearl (drag the wheel or compass to pan the sea plate). Scratch the treasure map to reveal the X. Fire a cannon across the hero.
- **3 Idiots:** fly the drone with the arrow keys or drag across the systems band. Draw on the chalkboard. Run the gauntlet (exists; make it more game-like).
- **RDR2:** a Dead Eye target game on the kill-list ("shoot" the killed strategies to read each post-mortem). A sketch-in-the-journal pad. Stoke the campfire.
- **Harry Potter, Act IV:** light the candles by moving over them. Open the letter's wax seal to reveal contact.
- Every toy needs a keyboard path and a reduced-motion static state, and must never block content.

### I. Typography per world (decision 8)
- **Headers** match the film's iconic lettering. **Body** is a more legible cousin of the same flavour. **Research data** (numbers, tables, caveats) stays in Geist / Geist Mono for legibility and honesty.
- Self-host only fonts whose licences allow web embedding. Log each in `docs/build/FONTS.md`.
- The candidates below need their licences checked. Swap in a lookalike if one fails.

| World | Header (iconic) | Body (legible mix) |
|---|---|---|
| Harry Potter | A "Harry P"-style lightning display face (fan font, personal-use licence) or IM Fell English SC | IM Fell English / Crimson Pro |
| Pirates | Pirata One, or a "Pieces of Eight"-style face | IM Fell DW Pica / Cormorant Garamond |
| 3 Idiots | The film-title chalk/marker style (Kalam Bold / Permanent Marker) | Patrick Hand or Kalam Light; Nunito for long text |
| RDR2 | A "Chinese Rocks"-style slab. Its licence forbids web embedding, so use a lookalike: Rye / Sancreek / Smokum | Special Elite (typewriter) / Courier Prime; journal lines in a handwriting face |

- **Open:** does the hero name "Aryan Sharma" stay in Geist (the neutral house style), or take the Pirates face, since the hero is in the Pirates world?

### J. Fix the intro → first page hand-off (decision 9)
- **Symptom:** a choppy transition from the broom flight to the hero.
- **Suspects:**
  - the video → poster → loop swap
  - the single-decoder hand-over
  - hydration work during the landing
  - the mask sweep running on the main thread
  - the end frame not matching the hero pixel-for-pixel
- **Fix ideas:**
  - Pre-decode the hero poster and the first loop frame before the flight ends.
  - Hold the flight's last frame on a GPU layer and crossfade with opacity and transform only.
  - Start the hero loop exactly on the matching frame (a match cut).
  - Finish hydration before arming Play (the split-hydration work in `MOTION-REPORT.md` started this).
  - Replace the mask sweep with a WebGL or clip-path wipe driven off the main thread.
  - If the footage itself jumps, regenerate the flight with a cleaner landing (end frame = the hero plate) and a longer settle.
- Measure before and after with `tools/capture/motion.js` (`intro` run) **and** on real hardware.

## 3. Tensions to resolve with Aryan before building

`CONTINUE.md` phase-2 item 11 (the admissions review) suggested **less** film: an opt-in intro, slimmer act cards, and quieter captions. Phase 3 asks for **more**. Aryan's direction wins: it's a personal blog, and entertainment comes first. Keep the *useful* parts of that review:
- the fast lane ("Skip to the research")
- an "At a glance" strip
- hiding unfinished placeholders
- fixing empty scroll gaps (which the no-dead-screen rule also covers)

Performance is now a harder problem (Lenis, WebGL, about 25 more loops, audio). The plan must carry a budget:
- one video decoder at a time, still
- lazy-load everything below the fold
- WebGL off on low-power devices
- mobile gets a lighter cut
- reduced motion and Pause still stop everything

## 4. Skills (committed to the repo so cloud sessions have them)

All are in `.claude/skills/` (tracked from 2026-09-30).

- **Motion and scroll:** `gsap-scrolltrigger`, `gsap-react`, `gsap-performance` (official GreenSock), `cinematic-gsap-lenis-motion-system`, `motion`, `animate`, `emil-design-eng`, `review-animations`, `design-motion-principles`, `fixing-motion-performance`, `vercel-react-view-transitions`
- **Design and quality:** `frontend-design`, `impeccable` (hooks off), `better-typography`, `web-design-guidelines`
- **Performance:** `vercel-react-best-practices`, `core-web-vitals`
- **If WebGL needs more:** add `enzed/r3f-skills` or `cloudai-x/threejs-skills` with `npx skills add <id> -a claude-code -y`.

## 5. Suggested order for the build session (a proposal, not started)
1. Measure on real hardware, then write the beat map and the performance budget.
2. Foundation: Lenis + GSAP ScrollTrigger, and the persistent stage (A).
3. The intro hand-off fix (J).
4. Typography per world (I).
5. Living loops + depth parallax (B), with generation in parallel.
6. World transitions + the WebGL layer (C).
7. Toys (H), then the egg hunt with its counter (E), then sound (G).
8. Text performance (F), director's cut, and chapter select.
9. Critic loop: blind stranger test, plus a "would you keep scrolling?" judge panel and real-device motion runs.

---

# Round 2 brainstorm (2026-09-30): candidates, NOT yet decided by Aryan

Aryan asked for more ideas on movement on screen for dramatic effect, movement in the words, other cool ideas, and what else needs improving. Everything below is a candidate until he picks.

## K. Movement on screen (dramatic effect)
1. **Virtual camera.** Every plate gets a scroll-tied camera move: a push-in on the Black Pearl, a crane-up through the Great Hall candles, a dolly across the ICE benches to the board, a pan across the camp.
2. **Rack focus.** The background blurs while the text is the subject; then the text dims and the image snaps sharp.
3. **Letterbox breathing.** 2.39:1 bars slide in when a scene starts and open when it ends.
4. **Full-screen weather in the foreground.** Sea spray and rain (Pirates), chalk dust in a sunbeam (3 Idiots), embers and fireflies (RDR2), candle motes (HP). Particles in front of the text add depth. Capped and paused offscreen.
5. **Fly-throughs.** The broom streaks between sections; a gull or the Pearl's flag passes; the drone buzzes past; a horse gallops along the bottom edge; an owl drops a letter. Rare and quick.
6. **Light that reacts.** The cursor is a lantern or wand: a local brightening, with shadows shifting on the plate.
7. **Impact moments.** A tiny screen shake and flash on big beats (cannon, Dead Eye lock, Lumos ignition, the chalk circle closing). Within photosensitivity limits; off under reduced motion.
8. **Speed ramps.** Scenes go slow-motion at screen centre and speed up as they leave.
9. **Match cuts between worlds.** A carried shape: compass ring → gear → wagon wheel → snitch. A carried line: horizon → chalk ledge → prairie horizon → Great Hall table. One continuous object through all four acts (this extends "the Line").

## L. Movement in the words (kinetic typography)
1. **Titles arrive in character.** HP: ink written with a nib. Pirates: burned or stamped onto the chart. 3 Idiots: chalked stroke by stroke with falling dust. RDR2: typewriter, or a poster press with ink bleed.
2. **Words with physical behaviour.** "Killed" is struck through, "storm" shakes, "signal" sharpens out of noise, "drift" slides. At most 1–2 per section.
3. **Scroll-scrubbed sentences.** A key line assembles word by word with scroll, and reverses.
4. **Text revealed by light.** Paragraphs stay dim until the wand or lantern cursor, or the reading line, passes.
5. **Subtitles.** The one-liners appear as film subtitles over the plates.
6. **Text as mask.** A giant act title is a window onto the video; the letters expand until the video fills the screen.
7. **Credits crawl and marquee quotes.**
8. **Instrument counters.** Ship's log, Virus's stopwatch, a bounty amount. Never research metrics.

## M. Other ideas
- A **day-to-night arc** down the page: night sea → dawn classroom → golden-hour frontier → candlelit night.
- A **film-strip scroll indicator**: a side reel with scene thumbnails that can be dragged as a scrubber.
- An **opening title sequence** after the broom lands (about 3 s: "A film by Aryan Sharma…").
- A **"previously on…"** recap at each act start.
- A **post-credits scene** for people who scroll to the very end.
- **Idle moments:** after about 10 s without scrolling, the scene does something small (the candle gutters, the horse snorts, the compass twitches).
- **Phone tilt:** parallax and the compass respond to device orientation.

## N. What else needs improving
- **Pacing:** deliberate fast and slow passages. It is currently one speed.
- **Each act's first 2 seconds** needs a hook frame.
- **Mobile** needs its own lighter but still moving cut (it currently gets stills).
- **Restraint rule:** one dramatic thing per screen, with everything else quiet. Too much at once is the main risk of Phase 3.

---

# O. TRIAGE (2026-09-30): the working decision for Phase 3

Aryan liked every idea but fears "too much". He delegated the cut to Claude with this filter: **keep what makes it feel like an interactive game and/or a movie; cut what is merely decoration or too much.** This section overrides the A–N lists wherever they conflict.

## O.1 KEEP (core)
- **Movie:**
  - Lenis + GSAP smooth scroll
  - the persistent stage (A)
  - living loops + depth parallax (B)
  - the virtual camera (K1)
  - world transitions + the WebGL layer (C)
  - match cuts between worlds (K9)
  - letterbox breathing (K3)
  - titles arriving in character (L1)
  - the one-liners as subtitles (L5)
  - the opening title sequence, the intro hand-off fix (J), and the post-credits scene
  - the day-to-night arc
  - sound (G)
  - director's cut autoplay and DVD chapter select
- **Game:**
  - An egg hunt with a counter. **Exactly 12 eggs, 3 per world**, and a reward at 12/12.
  - **One toy per act**, only two of them real games: **fly Rancho's drone** and the **Dead Eye target game on the kill-list**. The others stay simple: spin Jack's compass, light the candles with the wand.
- **Safety nets:**
  - the no-dead-screen rule (D)
  - the "Skip to the research" fast lane
  - a lighter moving mobile cut
  - per-world fonts (I)
  - scroll-depth analytics
  - collapsing long text

## O.2 KEEP, RATIONED (hard caps)
| Idea | Cap |
|---|---|
| Weather particles (K4) | one kind per world, light density |
| Fly-throughs (K5) | ≤ 1 per act; the snitch counts as an egg |
| Impact shake/flash (K7) | 4 on the whole page (1 per world) |
| Words with physical behaviour (L2) | ≤ 1 per section |
| Text as mask (L6) | the four act titles only |
| Scroll-scrubbed sentences (L3) | 1 per act |
| Rack focus (K2) | pinned stage sections only |
| Light cursor (K6) | Harry Potter acts only (the wand) |

## O.3 CUT
- Speed ramps (K8). They fight smooth scroll and read as lag.
- Text revealed by light for paragraphs (L4). It hurts reading.
- Cursor trails in every world (F). The HP wand is the only one.
- Phone tilt. iOS shows a permission prompt, for low payoff.
- "Previously on…" recaps.
- The film-strip scroll indicator. Redundant with the compass and chapter select.
- Instrument counters (L8) and marquee quotes.
- Extra toys: cannon, scratch-off map, pet the horse, honor meter, visitor bounty poster, journal sketch pad, stoke the fire. The best may be reused as eggs.
- Eggs beyond 12: rum, Wingardium Leviosa, 9¾, stopwatch, quiz.
- **Deferred, not cut:** idle moments, and the 12/12 share card.

## O.4 THE RULE: one star per screen
At any scroll position, exactly ONE thing is dramatic: a camera move, a transition, a toy, or a title arriving. Everything else on screen is still and quiet. The critic loop checks this on every captured frame, alongside the blind stranger test and a "would you keep scrolling?" judge.
