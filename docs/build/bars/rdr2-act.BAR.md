# BAR: Act III "The Frontier" (Red Dead Redemption 2) — the tintype card, Beyond, the journal, Voices by the fire, and Dead Eye
> A new act bar (SPEC v2 A-5; SM-14, SM-15, SM-11, SM-16, SM-17; §8 LD-RD and §8.3 TIPS). BUILD-SPEC 2026-09-28: nothing is built and 0 RDR2 credits are spent. Card II→III must also pass `act-cards.BAR.md` C1–C28 and `loaders.BAR.md` L1–L21; the journal must also pass `writing-index.BAR.md` (v3 deltas); Dead Eye must also pass `eggs.BAR.md`.
> **Binding:** SPEC v2 §1–§3 (why Act III is RDR2 and owns `beyond · writing · voices`), §4 (the graphite Line), SM-14/15/11/16/17, §8.1–§8.3, §9.1, §9.6–§9.7, §10.2–§10.3, §12 (fixtures I, J), §13–§15. DESIGN v3 §1.3.1 (rd grounds, Dead Eye ground), §1.3.2–§1.3.2a (journal paper, handbill, map), §1.3.3 (rdr2 inks), §2.1.1 (Chinese Rocks outline), §2.3 (TIP, journal, handbill type), §6.1 `develop.*`, `ember.*`, `deadEye.*`, §8.1 (icon style), §9 (`Tintype`, `GraphiteStroke`, `TrailMap`, `Handbill`, `JournalSpread`, `Campfire`, `DeadEye`), §11.5–§11.6. MEDIA-PLAN v2 MV-10, MV-10m, MV-11, MV-11L, F-RD. STUDY R-1…R-6. ICONS IC-RD-01…13.
> **Labels** as in the other bars. **FLAG** = tune in `/lab`.

## 1. Intent
After the graveyard and the intermission, the page rides out. A tintype develops on a letterboxed card while a pencil trail runs across it, with one of Aryan's own rules as the tip. Then golden hour: the life around the work (the miles, the people, the camera and sketchbook) in the dark foreground of a lit frontier, a trail map that appears only where he has been, and a WANTED handbill of plain facts that asks you to write. Then a page of the journal, entries kept by hand. Then night, a campfire, and the voices of the people who taught him, heard and not shown. The embers become Act IV's candles.

**Principles:** RD-P1 kept by hand · RD-P3 drawn only where you've been · RD-P4 develop, don't load · RD-P5 dark foreground, lit distance · RD-P6 people are heard, not staged · RD-P7 one word, one name, one number · RD-P8 shown, not scored · SYN #5 continuity (the same Line in graphite) · the counter-principle (native scroll, real RM).

## 2. Reference (qualities to lock; never copy)
| Source | Lock | Do NOT copy |
|---|---|---|
| RDR2 story loading screens (STUDY §1.4; Lee Martin's CSS recreation) | The image *developing* is the progress; a tintype's grain, vignette and bone edge | Any game screenshot, loading art or sprite sheet; the in-game tip layout; the RDR2 logo lettering |
| Arthur's journal (STUDY §1.1) | Graphite draw-on, blunt captions, the plan crossed out | Journal scans; portraits of gang members; the "Redemption" or Arthur handwriting fonts |
| The in-game map fog (STUDY §1.2) | Drawn only where you've ridden | The game map, place names, the minimap |
| Bierstadt / luminism (STUDY §1.7) | Dark foreground, lit distance | A game vista screenshot or photo-mode shot |

## 3. Sections, state machines and HARD pass/fail checks
Frames: **D** 1440×900 fine · **T** 1024×768 fine · **M** 390×844 touch · **R** reduced motion · **NJ** JS off · **SD** Save-Data stub.

### §A · Card II→III "The tintype" (SPEC SM-14; kind `tintype`, reel-class, 0 travel)
| p | State | Spec |
|---|---|---|
| pre | SSR | The static composition: the developed plate (MV-10), the lettered `h2` THE FRONTIER, the TIP, the `summary` |
| 0–.3 | sunset | The Intermission's warm point sinks to a low-sun sprite; the graphite trail draws across 6 hachure arcs (`pathLength` = remap(p, 0, .3)) |
| .3–.8 | develop | The tintype mask threshold = remap(p, .3, .8) into MV-10 (R-2, our procedural mask) |
| .8–1 | fixed | The `--w-bone` border draws; the plate is fully developed |
| reverse | p ↓ | Exact reversal by position |

| # | Check | Pass iff |
|---|---|---|
| A1 | Derivation | Default: `act-3.kind === "tintype"` (key `idiots>rdr2`), 0 spacer at every width; fixture I: no tintype card exists |
| A2 | Honest progress | The trail `pathLength` and the develop threshold equal their p-maps ± 0.02 at p ∈ {0, .15, .3, .55, .8, 1}; no text says "loading", "%", "please wait"; 0 `role=status` |
| A3 | Handoff | At p = 0 the low-sun sprite starts at the films HP screen's warm-point position (design pairing); at p = 1 the plate equals the MV-10 poster crop (SSIM ≥ 0.95) |
| A4 | Lettering | The `h2` contains sr-only "The Frontier" and an aria-hidden outline SVG ≤ 3 KB generated from Chinese Rocks (mode B); **no Chinese Rocks font file is tracked**; the text is never "Red Dead Redemption"; fixture L renders Newsreader with 0 CLS |
| A5 | TIP | The TIP is tip #2 (`gauntlet[0]`, byte-equal to `content.ts`), in house type (Meta `TIP` + `lead`), not a film line, not in `role=status` |
| A6 | Type and aqua | {meta, lettering, lead}; 0 DOM aqua at rest |
| A7 | Law 1 | The low sun, fire and plate light are sprites or media; 0 DOM glow |
| A8 | Static | R, NJ, M: the developed plate, the title, the tip, the `summary`; 0 mask animation; ≤ 0.5% diff vs the golden image |

### §B · Beyond: the frontier (SPEC SM-15; story `notes`, rdr2 frontier dressing; signature)
| # | Check | Pass iff |
|---|---|---|
| B1 | Dark foreground | At D and T, the `h2` and intro sit on MV-10's left 45%, where the p95 luminance under each text box gives ink ≥ 7:1 (MEDIA-PLAN check 1) |
| B2 | One HERO per viewport | The MV-10 band is the only HERO in its viewport; the handbill's viewport contains no golden-hour plate pixels (warm families never mix) |
| B3 | Trail map truth | The map carries **0 text, 0 place names, 0 numbers, 0 route claims**; its Meta caption `ILLUSTRATIVE MAP` sits on rd canvas beside it; contours are build-time (`public/film/rd-contours.svg` ≤ 12 KB); the map is ≤ 30% of the section area and desktop only |
| B4 | Fog honesty | The fog lifts via CSS `animation-timeline: view()` as the Athletics rows pass (0 runtime JS); unsupported browsers and R show the map fully revealed |
| B5 | Prints and satchel | The running-shoe prints draw once (≤ 1.5 s) beside the trail; the satchel strip shows only Aryan's real kit (camera, sketchbook/charcoal, drone, running shoes) with Meta labels ≤ 2 words; no handwriting face |
| B6 | Authentic only | Every photograph in Creative is `authentic` (provenance), tintyped by CSS (R-2) with the caption "Photograph: Aryan Sharma" (pending his OK); **0 generated sketches** in the section; without his photos, the block ships text-only (no placeholder in production) |
| B7 | Handbill facts | Every handbill field is a confirmed `content.ts` fact or `site.location`; the REWARD renders only if `confirmed` (production: absent); **never** "dead or alive", a crimes list, a bounty number or a drawn face; the portrait (RD-4) is the authentic photo tintyped, or none |
| B8 | Handbill contrast | On `#e4d5b3`: 0 ghost-text elements, 0 verdict words; every text ≥ 4.5:1 (graphite 9.79, fg 10.56, pencil 6.96, muted 6.14, red 5.63, accent 5.22); the link's focus ring is `--paper-accent` (≥ 3:1) |
| B9 | Handbill type | `WANTED` is Newsreader caps (Rye only if FT-1 is set; the validator checks `fontScope`); `rotate: -1.2deg` ≥ 640, 0 below; `Reply by email →` is a real link to `#contact`, ≥ 44 px |
| B10 | Mobile | M: MV-10m (4:5) below the intro; the map and prints are absent; the handbill is full width; 0 horizontal overflow at 320 |
| B11 | Nothing metered | No honor meter, score, rank or bar about Aryan anywhere in the act (RD-P8, H4) |

### §C · The journal (SPEC SM-11; `writing` on the paper plane, rdr2 journal dressing)
| # | Check | Pass iff |
|---|---|---|
| C1 | Plane | `data-tone="paper"`, `data-world="rdr2"`; the dome seam fills with `--rd-canvas` and the paper rises beneath it; the D-4 inks are unchanged (fg 11.69 … exception 5.43) |
| C2 | Spread | ≥ 1024: a 6 px `--w-leather` edge and a central gutter shadow (decorative); < 1024: one page |
| C3 | Entries | Five entries: Meta `ENTRY I`…`V`, titles/angles byte-equal to `content.ts`, a static DRAFT chip each; **drafts are not links** (0 focusables in draft rows) |
| C4 | Vignettes | Hover **and** focus on an entry draw its graphite vignette once (`easeDraw`, ≤ 1.2 s; the unfiltered twin animates, the R-1 filtered layer rests); "The kill-list" vignette's X is **graphite**, never ember; RD-7 sketches, if supplied, replace them as `authentic` |
| C5 | Emphasis | Exactly one `--paper-red` underline (under the h2); 0 `--paper-accent` marks at rest; 0 aqua |
| C6 | Pencil title | The h2 text is in the DOM from first paint; the pencil mask wipe runs once (≤ 1.4 s) under `html.motion-ok` only |
| C7 | One warm family | 0 canvas, 0 fire or candle sprites, 0 golden-hour media in `#writing` |
| C8 | Route loader | `app/writing/[slug]/loading.tsx` renders LD-RD `route` with "Loading essay…" in `role=status` and a deterministic TIP outside it (L15, L19) |
| C9 | Option B | Fixture J (writing → act-4): the same entries on the same paper tokens, an ink nib, no leather edge, the LD-HP route loader; 0 component edits |

### §D · Voices by the fire (SPEC SM-16; `quotes`, rdr2 campfire dressing)
| # | Check | Pass iff |
|---|---|---|
| D1 | The fire | MV-11 on `--rd-deep`; the quotes' boxes sit on its left 55% (p95 ≤ 0.054 under each); no person, bottle, gun or lettering in the plate (L2) |
| D2 | Loop discipline | MV-11L plays only at ≥ 1024, fine pointer, visible, decoder free, not RM/Pause/SD; it pauses offscreen and on hidden tabs; never plays alongside MV-03, IN-02 or MV-09 (DecoderLock) |
| D3 | Firelight read | The lead quote's mask moves `--fg-muted` → `--fg` once (1.2 s); 0 glow, `text-shadow` or `filter` on text |
| D4 | People heard | 0 faces, figures or silhouettes anywhere in the section; testimonials verbatim from `content.ts` |
| D5 | Flash safety | MV-11L passes the MEDIA-PLAN flash check (flicker ≤ 2 Hz; no whole-frame spikes) |
| D6 | Hand-off | The ignite card's code campfire sits at the Line's start and pairs visually with the Voices fire (ignite G1) |

### §E · Dead Eye (SPEC SM-17; opt-in egg on `kill-list`)
| # | Check | Pass iff |
|---|---|---|
| E1 | Never automatic | With no palette command or typed trigger, 0 Dead Eye frames on any visit; the ledger at rest is pixel-identical with the egg code loaded or not (D-6) |
| E2 | Triggers | Palette "Dead Eye (kill-list)" and the typed word `deadeye` (outside inputs, `#kill-list` ≥ 50% in view) start it; **no single-key shortcut** exists; "Turn off easter eggs" disables the typed trigger; M/coarse: the command is hidden |
| E3 | Marks are truth | The X count = the number of rows whose verdict is KILLED; each X sits on that row's recorded reason; 0 marks on SURVIVED or EXCEPTION rows |
| E4 | Timing | Total ≤ 3 s; marks 90 ms each with a 160 ms stagger; fire-once at 400 ms after the last mark (or Enter); time returns to 1× over 300 ms; `playbackRate` restored to 1 on every animation afterwards |
| E5 | Text untouched | During the run every text node keeps its computed colour; only the ground (`--rd-deadeye-bg`, AA CALC ink 16.36 / muted 5.59 / ember 6.59) and media layers change |
| E6 | No weapon, no sound | 0 gun, reticle, crosshair cursor, gunshot, heartbeat or blood; 0 `AudioContext` |
| E7 | A11y | Esc aborts at any step and restores state; one polite status "Dead Eye: N killed ideas marked"; the end-line toast is a `FilmQuote` caption with inline attribution (Q-RD-2) |
| E8 | RM / Pause | No time-scale and no sequence: the static X's and the ground shift show until Esc |
| E9 | Flash | The ground shift is one transition (≤ 200 ms), never repeated within 1 s; no red flash over 25% of the field |

## 4. Reduced motion · mobile · no-JS · Save-Data (summary; SPEC §13)
- **R / Pause:** card III static (developed plate); Beyond plate still, map revealed, prints and satchel static; the journal single-page with static vignettes and no pencil wipe; Voices MV-11 still; Dead Eye static until Esc.
- **M:** no letterbox, no map, no prints, no loop, no Dead Eye; MV-10m; journal single page.
- **NJ:** all static SSR; the handbill link works; drafts remain non-links.
- **SD:** stills only at the smallest srcset; no MV-11L request.

## 5. Keyboard · focus · ARIA
- Card III: 0 tab stops; `<section id="act-3" aria-labelledby>`; the `summary` reads "A tintype develops into the frontier: Act III, after Red Dead Redemption 2."
- Beyond: headings h2 → h3 per note; the handbill is a `<aside aria-labelledby>` with a real heading; its only focusable is the email link.
- Journal: the `<ol>` of entries; the right-page vignette is aria-hidden; its meaning is the entry's title.
- Voices: `<figure>`/`<blockquote>` with `<cite>` per testimonial; the fire is aria-hidden.
- Dead Eye: palette entry with `aria-pressed`; no focus trap; Esc.

## 6. Capture plan
- **`/lab/rdr2`:** card III at p ∈ {0, .15, .3, .55, .8, 1} + reverse; Beyond at D/T/M/R with and without authentic photos (fixture), handbill with REWARD draft (dev) and absent (prod build); the journal hover/focus per entry; Voices with the loop on/off; Dead Eye run at 30 fps (E4, E9) + Esc mid-run + R.
- **Logs:** SVG `pathLength` and mask thresholds (A2), text colours during Dead Eye (E5), the DecoderLock log (D2), the validator output (B7, C3, A4, A5), network (SD).
- **Critics:** fidelity (a frontier journal, not a western theme park) · craft/kitsch (DESIGN §11.5 v3 list; the admissions-reader test on the handbill) · honesty/a11y/legal (H1–H5).

## 7. Adaptability
- Everything is data: `worlds.rdr2` (slots, dressing, lettering, media), `acts[2]` (title, tip), `tips`, `eggs`. 0 literals in components (grep for "Red Dead", "Frontier", tip text).
- **Fixture I** (rdr2 removed): 3 acts, Card II→III = ignite, no Dead Eye, "Three films", the credits drop RDR2 from `WORLDS BORROWED FROM` and its lines from `LINES QUOTED` (the **H3 line stays verbatim**, as required).
- **Fixture J** (writing → act-4): HP parchment dressing, LD-HP route loader.
- Moving `beyond` or `voices` to another act re-dresses them from that world's `dressing` slot; media props for a `plain` dressing are ignored with a validator warning.

## 8. Honesty and legal (H1–H5)
- **H1:** no Arthur, Dutch, John or any character; no rider on any horse; no human figure anywhere in RDR2 art; the only person is Aryan (authentic).
- **H2:** no screenshots, loading-screen art, journal or map scans, logo files, or game-extracted/mod fonts; the Chinese Rocks TTF stays in git-ignored `design-src/fonts-personal/`; outlines only.
- **H3:** the credits' fan-tribute line names Rockstar Games verbatim.
- **H4:** tips, handbill facts and entries are verbatim; the map carries no data; Dead Eye marks only real KILLED rows; nothing is metered about Aryan; `films.rdr2.reason`, `act.3.logline` and the handbill REWARD are DRAFT; Q-RD-1 never sits near SOS Foundation or family content.
- **H5:** §4 above; AA per DESIGN v3 §1.3; one decoder; one canvas; mobile stills.
- **Declined (taste):** guns, blood, alcohol, tobacco, poker, robberies, bounty-hunting people, the illness and ending, saloon doors, bullet holes, "yee-haw", an honor meter, "I have a plan".

## 9. FLAGS
F1 the develop mask noise scale (`baseFrequency` .012) · F2 the hachure count (6) · F3 the handbill rotation (−1.2°) and width (22rem) · F4 the trail-map size (≤ 30%) · F5 the journal gutter shadow strength · F6 Dead Eye's grade strength (sepia .75) · F7 whether the satchel strip sits in Creative or Athletics · F8 MV-11L on/off by default on low-power desktops.
