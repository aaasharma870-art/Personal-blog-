# P3-11 round 2 · triage (assembler)

Inputs: `verdicts/` (j1-star, panel-j2/j3/j4, the stranger verdicts, j8-smooth, j9-honest), the assembler's scores
(`verdicts/score-{blind,read,hooks}-{1440,1024}.{json,md}` from `tools/capture/score.mjs`, run exactly as round 1's
MANIFEST §2 shows, and `verdicts/score-panel.{json,md}` for the panel bars), and `MANIFEST.md` §1 (automated J1, dead
screen, drift, keyboard, probes). Every finding names its source; read the source for the full wording.
R = `docs/build/motion-strips/p3-r2`, R1 = `docs/build/motion-strips/p3-r1`. Build judged: `dedd0f1`.

**Ship bar (PHASE3-PLAN §11.3–11.4): every axis ≥ 4 and every pass bar met. Not met.** Met this round: J9 honest (4,
green), no dead screen (0 gaps, 11/11 fills), the name (3/3) and the fast lane (3/3, 1 s). Everything else misses.
Round 3 is the last loop round; after it any residual goes to PHASE3-REPORT as a flag for Aryan.

## Scores

Panel judges scored 0–10 this round; the 1–5 value is half of it. "Eye" = the judge's count; "log" = `clips.mjs`.

| axis | r1 | r2 | pass bar | r2 status |
|---|---|---|---|---|
| J1 one star per screen | **2** · eye 53.6 / 54.5 % one-star; 109 / 102 star-less outside a breath; 2 two-plus | **2** · eye **48.8 / 45.8 %**; **108 / 108**; 0 two-plus (log: 63.8 / 64.8 %, 72 / 65, 2) | ≥ 90 % reader clips one star; star-less only in breaths; 0 two-plus | FAIL (2+ passes by eye) |
| J2 · J3 · J4 keep scrolling | 3 · 3 · 3 (56–66 % yes) | **3.75 · 2.5 · 3.75** (81.6 / 57.1 / 83.7 % at 1440; 81.5 / 51.9 / 81.5 % at 1024) | ≥ 80 % yes per act; no two consecutive no; hand-off + 4 cards + first Work screen yes | FAIL for all three judges at both widths (Act II < 80 % for all; the 1440 Kraken-gap screen s8 is "no" for all three) |
| J2 · J3 · J4 tempo | 3 · 3 · 3 (not scored) | **3.25 · 2.5 · 3.5** | §2.2 tempo named by ≥ 2/3 per act | FAIL: 4/7 acts (Act I, III, IV, credits pass; opening, **Act II** (slow vs brisk), films (brisk vs slow) fail) |
| J2 · J3 · J4 discovery | 2 · 3 · 3 | **2.5 · 2 · 2.75** | each judge: chip + one toy invite within 3 screens | FAIL: every judge found Take off within a screen; only J4 could read the chip while scrolling |
| J5–J7 blind recognizability | below base: pirates, idiots, rdr2 | pirates **5/9 · 4/8**, idiots **2/9 · 2/9** below base (10/10, 9/10); rdr2 8/11 · 8/10 and hp 10/10 · 10/10 at or above base; 0 wrong-film | ≥ P3-0 per world | FAIL (2 worlds); most misses are the right film at 0.40–0.55 |
| J5–J7 name · fast lane | 3/3 · 3/3 (1 s) | 3/3 · 3/3 (1 s) at both widths | 3/3 · found ≤ 10 s by 3/3 | PASS |
| J5–J7 can't read | 37 · 25 | **59 · 56** (≈ 21 · 12 are the still's bottom edge cutting text a scroll reveals; ≈ 80 are real: header slices, mid-write text, low contrast, layout, wording) | 0 | FAIL |
| J5–J7 hooks | 4/8 · 4/8 | **4/8 · 4/8** (per judge 6 · 7 · 5 of 8). Now 3/3: css-ignite, css-seam, gl-seam, gl-opening. Fail: **css-opening 0/3 (r1 3/3)**, css-tintype 2/3, gl-tintype 2/3, gl-ignite 2/3 | each hook 3/3 | FAIL |
| J8 smooth | 3 | **2.5** (1440 desktop 14.8 fps < 15.2 floor; CLS 0.006 / 0.0133; principles 4.2 and kill-list 5.4 at 1440; native 8.1 fps / 52 pops; intro 20.8 fps, 45 LoAF; skimmer 15 / 24 LoAF in the 3 s after quiet-end; LCP 280–904 ms) | §12.1 headless + §4.4 | FAIL |
| J9 honest + a11y | 3 (2 red rules) | **4** (0 red; RELEASE = 40 L2 + 5 TTS + 104 unsigned strings only) | green; RELEASE fails only per DP-9 | PASS (two medium findings, below) |
| automated · no dead screen | 0 gaps; 8/11 fills | 0 gaps; **11/11** fills at both widths | 0 gaps > 100vh; every §2.4 fill | PASS |
| director's cut (own axis, information) | 56.6 % one-star, 3 two-plus | 68.5 %, 0 two-plus | — | — |
| P3-5 #3 registration (ignite) | .951 / .923 | .953 / .923 (unchanged) | ≥ .95 | 1024 FAIL |
| probes | 19/21 · 20/21 | 12/21 · 13/21 (hunt, toys, keyboard, words, spotlight are probe drift; cinema.letterbox not reproduced; layout-gates' paused reload is real) | — | see F1, F3 |

**Panel bars in detail** (`verdicts/score-panel.md`). Per act, yes % at 1440 / 1024: Act II 60/61 (J2), 80/72 (J3),
73/72 (J4) is the one act every judge fails; Act I at 1024 71/57/71; credits J3 50/33, J4 50/67; films J3 14/14 (J2 and
J4 100). Must-yes misses: 1440 s8 (journey end into the seam card, the "Kraken gap") for all three; J2 also s32 (act-3
card, "the third identical card, then black"); J3 also the opening, act-1 s2, every act-2 / act-3 / act-4 card screen
and, at 1024, the first Work screen. Two consecutive no: J2 1440 16–17, 20–21 / 1024 17–19, 25–26; J4 1440 20–21 /
1024 18–19, 25–26 (all in Act II); J3 11 and 15 runs. Tempo: Act II read **slow** by J2 and J4 (spec brisk): it is the drag; films read **brisk** by J2 and J4 (spec slow)
and they gave it 100 % yes, so the films need content work (J3), not slowing down.

**What moved since round 1.** Better: dead-screen fills 8 → 11 of 11; no clip with two competing stars by eye; J9's
two red rules (RM motion, RM kill-list overprint) are gone; RM CLS 0.061 / 0.116 → 0; desktop CLS 0.0196 / 0.0435 →
0.006 / 0.0133; hooks css-ignite and css-seam 0/3 → 3/3; RDR2 blind at base (the journal frames ?? → 0.65–0.70);
Act III yes up for every judge (J3 29 → 42/46 %, J4 56 → 92 %); credits J2 0 → 100 %; palette → Map → Esc focus fixed.
Worse: css-opening hook 3/3 → 0/3; 3 Idiots blind 6/9 → 2/9; 1440 desktop fps 17.0 → 14.8 (below the floor) and
every 1440 run 7–21 % slower; J1 by eye 53.6 → 48.8 % (the log rose to 63.8 % because it now over-counts); a paused or
RM reload now reflows after hydration; probes 19/20 → 12/13 (mostly drift).

## Budgets (re-measured)

`bundle` probe on the `dedd0f1` build (`R/probes-{1440,1024}/p3-probes.json`): first-load JS **444,731 B gz** and CSS
**33,849 B gz** against the pre-Phase-3 base 439,092 / 29,433 (W3.md §2) and the +6,144 B line: **JS headroom 505 B
gz, CSS headroom 1,728 B gz**. Allocation (net first-load growth; report bytes in your return):

| | F1 | F2 | F3 | F4 | F5 | F6 | left for integration |
|---|---|---|---|---|---|---|---|
| JS gz | ≤ +80 | ≤ +80 | ≤ +80 | ≤ +80 | ≤ +80 | ≤ +80 | 25 |
| CSS gz | ≤ +150 | ≤ +250 | ≤ +150 | ≤ +150 | ≤ +150 | ≤ +500 | 378 |

Desktop-only code goes behind the facades / lazy chunks; desktop-only CSS goes in a stylesheet imported by a lazy
chunk (the `components/stage/stage-lazy.css`, `letterbox.css`, `app/p3/game-lazy.css` pattern). Cut to make room
before adding.

## Fixers (≤ 6, disjoint globs; the same builder rules as W1–W3 and round 1)

Rules for every fixer:
- Edit only your globs; never commit; no `npm run build` / server / browser in the main tree (own worktree +
  `cp -al` node_modules, own port, stop it; short browser time, one browser per fixer). `npx tsc --noEmit` and
  `npx eslint <your files>` clean.
- `lib/page.ts`, `lib/film.ts`, `lib/beats.ts` and `lib/spotlight*.ts` belong to **F1**. Others return beat
  declarations and copy keys as HANDOFFS (exact text; any new copy is page microcopy `status: "proposed"`,
  `unsigned: true`; never invent a fact; never touch Aryan's own words: list them for him instead).
  `lib/media.ts` and `public/media/**` are assembler only.
- `docs/build/CONTENT-RULES.md` is absolute. Sharpe / PSR / PF never animate; research data stays in Geist; RM and
  Pause stop all motion and sound within 100 ms with no layout shift; one h1; every-frame motion is transform /
  opacity only.
- **Rule 33:** no CSS rule that can match `<html>` for a class or attribute toggled at runtime; no `[class*=]` /
  `[class^=]`; nothing keyed on `html.lenis*`. A pre-paint attribute set once by the boot script
  (`html[data-motion-boot]`) is not a runtime toggle.
- **Exactly one star.** A reading stop is filled by a visible performer that holds the screen, never by declaring
  more breaths (breaths stay derived: the viewport after each weight-3 star). Anything you add must leave every
  screen with one star, not two: the spotlight arbitrates; register, do not self-start.
- Phones (< 64rem) keep today's behaviour (Phase 4 is later). DEFAULT and ALT variants both work.
- Media: no new generation this round (balance 184.88, reserve ≥ 100). Prefer a registered or staged plate
  (`lib/media.ts`, `docs/build/media-staged/p3/`) and crops / overlays inside today's art (no likeness, no logo).
  List any media wish as a handoff with the exact frame it would replace.
- Next 16: read `node_modules/next/dist/docs` before Next-specific code.

### Contracts between fixers
- **C1 live stars (F1 ↔ F2–F6).** The existing API is the contract: `useScrollStar(ref, id, { weight, own, live,
  onOwn, on })` and `beatAttrs(id, { weight, scroll, live })`. A host registers `live: true` only for something that
  visibly performs while the page is still (a camera push or drift, a loop, a draw), and passes `on = isPlaying` so
  the registration exists only while it moves. F1 makes the arbiter grant one live star to a still screen with no
  owner, logs live grants only while registered, and adds every host id from the handoffs to `lib/beats.ts` and
  `lib/spotlight-windows.ts` (`LIVE_STARS`, `SCROLL_WINDOWS`). Hosts return `{ id, element, weight, kind, own, live }`.
- **C2 hero (F2 ↔ F3).** F2 keeps setting `data-stage-covered` on `[data-section="hero"]` while the act-1 card covers
  it; F3 pauses the hero's loops while it is present and also stops and hides the hero video once `#top` is off
  screen (it repaints ×11–22 in journey, work and trading-algos today).
- **C3 letterbox (F2 ↔ F1, F6).** `html[data-letterbox] { scroll-padding }` (`components/stage/letterbox.css`) breaks
  rule 33 and moves. Default: one static rule inside the desktop-fine, motion-on media query in first-load CSS
  (`html { scroll-padding-top: max(var(--lb-h), calc(var(--header-h) + 24px)); scroll-padding-bottom: var(--lb-h) }`,
  never toggled; counts against F2's CSS), and the closed/open flag moves off `<html>` to the letterbox root
  (`.letterbox[data-state="closed"]`, no `<html>` attribute). If F2 prefers a JS offset instead, F6 adds
  `setJumpInset(px)` to `lib/smooth-scroll-jump.ts` and keyboard focus must still clear the bars (WCAG 2.4.11).
  F1's `cinema` probe reads the flag wherever F2 puts it (F2 names it in its return).
- **C4 game invitation (F6 → F1 → F2).** F6 writes the words for an invitation shown on the act-1 contents page
  (`frames/opening.tsx`, screen 3, desktop only), before the drone and Dead Eye; F1 adds the copy key (proposed,
  unsigned); F2 places it and shortens or keeps `films.play` as F6 says.
- **C5 header band (F6 ↔ F3, F4, F5).** F6 gives the sticky header an opaque or faded band on desktop so text passes
  under it, never half-visible. Hosts keep any caption above an h2 clear of the header at the h2's stop position
  (beyond's "A wanted poster", about's compass caption, the films Pirates title, journey's first line).
- **C6 stable heights (F6 ↔ F3, F4, F5).** F6 scopes the `<main>` ResizeObserver refresh; hosts keep their heights
  stable after load (machine-board, ledger-reckoning, plate-band, campfire-stage, principles-map, journey-voyage,
  credibility-strip all observe sizes today).
- **C7 hunt count (F6 ↔ F1).** The chip's count span holds exactly `N/12`; F1's hunt probe reads that span, not the
  chip's whole text.
- **C8 compass (F3 ↔ F1).** About's toy stays the `#about [data-instrument="jack-compass"]`; F1's probes scope to it
  and prove it by a key press.
- **C9 recognizability (F2 ↔ F4).** The act-2 settled frame (3 Idiots 0.50–0.60 blind) is F2's card; F4 owns the work,
  work-board and systems frames. Each adds one unmistakable 3 Idiots cue inside today's art.

### F1 STAR-CORE + MEASUREMENT · the spotlight, beats, words, checks, capture tools
Globs: `lib/spotlight*.ts`, `lib/beats.ts`, `lib/page.ts`, `lib/film.ts`, `components/primitives/use-enter-once.ts`,
`components/words/**`, `components/enhance/binders/words.ts`, `app/p3/words.css`, `scripts/checks/**`,
`tools/capture/**`.
1. **J1 #1–#3 (high): the reading stops and dead stretches.** Eye: 108 star-less clips outside a breath per reader
   width; every 2 s stop at an h2 or card settle gives 1–2 identical clips (1440 #25–26, #42–43, #61, #79–80, #92–93,
   #104–105, #113–114, #123–124, #134–135, #163, #190–191, #203–204, #215, #238–239, #244–245). Build C1: a still
   screen with no owner gets the one live star in its middle band; release on scroll start. Declare the hosts'
   handoffs. Record the §2.1 change ("a camera drift or loop may hold a still screen as a weight-1 live star, one at a
   time") in PHASE3-SPEC as a superseded note, like round 1's breath note.
2. **J1 #5 (medium): the log over-counts** (granted, nothing performing: 47 / 51 / 26 / 22 clips per run): B02 at y 0
   with `yRange` [0,0] (#16–18, both widths; it is in `LIVE_STARS` while the wave is frozen, see F3), B08-compass /
   B08-invite #35–36, B12-push #54, #56, B30 #133, #136, B32-finale #144, B33-finale #149, B38 #164, B41 #174–176, B47
   #205–210 (1024 #193), B50 #216, B56-trail #240–242, B57 #246, B58 #251. Each window covers only the visible
   performance (C1 for live ones). Add a check to `clips.mjs`: a scroll-compensated frame difference per clip (sticky
   header masked, J1's method) and a `grantedStatic` count, so the machine agrees with the eye within 5 points.
3. **J1 #7 (low): log overlaps** in hand-off windows: reader 1024 #51–52 B12-push + B12 (295 / 911 ms; also panel J4
   1024 #26 "two stars live for 1.2 s"); skimmer 1440 #80–81 B45 + B44-page4 + B46, #89–90 B53 + B54, #99–100 B56 +
   B56-trail; skimmer 1024 #23 B16 + B19, #73–74 B56 + B56-trail + B57. No overlap ≥ 100 ms in the log.
4. **J1 #8 (low):** skimmer-1024 #1 (y 0) is labelled "breath after B30" and row B58: fix the breath placement.
5. **J1 #6 (medium): register the movers** the hosts hand you (chalk quote B22, plate drifts, viaduct dot, compass
   lid, lens fade, footprints, credits glyph; see F2–F6).
6. **J8 F10:** the scrubbed sentence in `#beyond` shifts layout: the scrub-sentence primitive reserves its final
   layout from first paint (CLS 0).
7. **J2 low:** in-character titles caught mid-word read as typos ("HARRY P_TTER", panel 1440 #17, #34, #76): reveal so
   no misleading partial word holds at a stop, and finish inside the grant.
8. **Probe drift and gaps** (MANIFEST §1 "Probe runs"; J9 F4, F5, F7). Update to round-1 behaviour: `hunt` reads the
   count span (C7) and re-proves the SEEKER aside (J9: `complete` has `seeker:false`); `toys.compass` and keyboard
   `op.compass` scope to About's toy and prove 45° by a key press (C8); `words.scrub` expects "complete, never
   re-dims"; `spotlight`'s synthetic tests use the new arbiter (performance window, live) and read `a` / `b`, not
   `st.top` / `st.bottom`; `cinema.letterbox`: find why no flip happens inside the probe sequence (its earlier steps
   or its jumps after the films bill) and read the flag where C3 puts it; `layout-gates` gains a `--rm` hash-load
   check (J9 F1); `qa.js` no-JS lists every streamed section (`div[hidden][id^="S:"]` un-hidden by the noscript rule)
   with in-viewport shots; `aa-scrim` reports the 1.67:1 non-live sample (About "Process over outcome", 1024, RM) as a
   warning with coordinates and samples the lens-dimmed kill-list rows.
9. **J9 F3:** a rendered COMMUNITY-sourced quote becomes a `RELEASE=1` error (`scripts/checks/**`). **J9 F8:** check
   the provenance of visible lines missing from the unsigned list ("Skip intro", "↑ Back to the opening", "To be
   continued.", "Catch the snitch" / "Snitch caught", "Next step", the RM Lumos toast, the films bill head); new
   Phase-3 microcopy joins the unsigned list.
10. Apply the copy keys the others hand you (C4, F5's journal label, F5's Lumos hint), proposed + unsigned.

### F2 CARDS + STAGE + FILMS · the act cards, transitions, stage, letterbox, GL, films interlude
Globs: `components/sections/act-card/**`, `components/sections/films/**`, `components/stage/**`, `components/gl/**`,
`lib/gl/**`, `lib/{stage,sky,impact}.ts`, `components/primitives/{live-plate,camera,depth-plate}.tsx`,
`app/p3/{cards,cards-pin,cinema,stage,plates}.css`.
1. **Hooks regression (0/3 from 3/3):** css-opening at p .05 shows the porthole on flat black, "still loading"
   (`R/strangers/hooks-1440/H007`, `hooks-1024/H003`; named copies `R/hooks/{1440,1024}-css/opening-p05.jpg`). The
   plate and sea behind the porthole paint at p .05 in the css tier, as the GL tier does (likely round 1's
   "not-yet-started stage out of paint": paint from the hook frame, p ≥ 0, as the card rises).
2. **Title vs caption (every stranger judge's top finding; also panel J3, J4):** seam and ignite at p .05 show the
   new act's title over the old world's caption ("3 IDIOTS" over "THE KRAKEN'S STORM · PIRATES OF THE CARIBBEAN";
   "HARRY POTTER" over "THE CAMPFIRE · RED DEAD REDEMPTION 2"), both tiers (J6: 1440 H002, H003, H005, H008; 1024 H001,
   H002, H004, H008), and the burn-through leaves the RDR2 caption over the HP title (panel 1440 #106–107, 1024
   #100–101). The caption changes with the title, or the title waits for the new world.
3. **Hooks 2/3:** gl-ignite's hole is an empty black blob at p .05 (1440 H003, 1024 H008; the css tier shows the candle
   and passes): show the candle or warm interior from the hole's first frame. Tintype (both tiers, 1440 H004 / H006,
   1024 H005 / H006): "muddy, low contrast, left half a black tree mass, static": start the develop with visible
   detail and a motion cue.
4. **Near-black hand-offs (panel J2, J3, J4 medium; must-yes miss at 1440 s8 for all three):** about 1 s of black with
   a sliver of image at every act change (panel 1440 #28, #33, #84, #105, #110; 1024 #26, #30–31, #79, #100, #104).
   The Kraken gap (1440 s8 #27–29, 1024 s8 #25–27): ~4 s of near-black with a thin sea strip; fill the seam card's
   pre-roll with the storm itself. On release, hand straight to the next section's plate: no full-black hold over
   300 ms, and not the same fade-and-rise move at every breath (J4 1440 #33, #84, #110).
5. **Act-title cards (J3 medium, J2 low, J4 low):** the same ghosted text-mask at low contrast, 6–8 s each, four times
   (1440 #12–14, #29–33, #80–84, #107–110). Raise the ghost title's contrast, cut non-informative frames in cards 2–4
   to ≤ 3 s, and vary at least one card's reveal. Keep card 1 and the protected set pieces (J4 "protect": porthole
   iris, torn chalk reveal, grey-to-gold grade, The Frontier cut, burn-through into the Great Hall). Shrinking the
   cards further is Aryan's call (For Aryan).
6. **Films (J3 high; J2, J4 low):** the "Three films and a game" opener is ~90 % empty dark with a plain sans heading
   (1440 s24 #66–68, 1024 s27 #64–66): give it a themed frame and readable type. The four screens share one template
   (1440 s25–30, 1024 s28–33): vary at least two. The Dead Eye plate shows no targets while scrolling (1440 #75, 1024
   #71; `plate-marks.ts`). "Red Dead Redemption 2" wraps with an orphaned "2" at 1024 (#65). The RDR2 film screen
   and the act-3 card open on near-identical pictures 10 s apart (J2 1440 #80): make the act-3 card's first frame
   read as a different moment (no reorder).
7. **C4:** place the game invitation on the act-1 contents page (desktop only).
8. **J8 raster:** card stages paint outside their window (act-3 ×100 in films; act-4 ×41 in writing, ×17 in
   principles, ×3 in contact): out of paint outside the window, but painted from the hook frame on (item 1). The
   opening card is the worst transition (6.7 fps at 1440, P3-0 26.2; 18 will-change layers, 14 infinite animations;
   skimmer-1440 #7–9): pause loops off screen, drop `will-change` from idle layers. Films: Motion frames of 64–175 ms
   of script: stagger the entrances. Tintype: a mid-card tier flash at 1024 (`R/motion/1024/strips/pop-desktop-582.jpg`):
   switch tier only at p ends. GL: compile and upload before the ignite card (934 ms frame in the gl run).
9. **J1 #5 / #6:** the viaduct dot (#155, films B34) moves with no star: register (C1) or fold it into B34. B30 (#133,
   #136), B32/B33 finales (#144, #149) and the weight-3 B38 / B50 settles (#164, #216) are granted while nothing moves:
   perform across the window or end the window.
10. **C3** (rule 33): move `html[data-letterbox] { scroll-padding }`.
11. **P3-5 #3:** the ignite registration is .923 at 1024 (bar .95; content, not tone or geometry): start the push on a
    picture that equals SEQ-HALL frame 0 at that crop, or cross-fade into it; if it needs `lib/media.ts`, hand off.
12. **C9:** act-2 settled frame: one 3 Idiots cue inside today's art (blind A10 / D10 act-2-settled 0.50–0.60).

### F3 INTRO + HERO + ACT I · Pirates
Globs: `components/intro/**`, `public/intro/**` (rebuilt from the controller only), `app/intro.css`,
`components/sections/hero/**`, `components/site/{hero-scene,about,about-bio,about-pillars,journey*,credibility-strip}.tsx`,
`components/worlds/pirates/**`, `app/p3/world-pirates.css`.
1. **J9 F1 (medium, regression):** a paused or RM reload reflows after hydration (`layout-gates.pausedReload`: page
   39,852 px streamed → 39,759 paused / 37,754 RM; `#journey` 3,209 → 1,204 px; first box `#about`). The paused / RM
   layout is final at first paint (`journey-experience.tsx`; CSS under `prefers-reduced-motion` and the pre-paint
   `html[data-motion-boot="paused"]`). F1's `--rm` hash-load check proves it.
2. **Blind Pirates below base (5/9 · 4/8 vs 10/10):** the hero (A01 / D01 0.50 / 0.50 / 0.60: "the sea alone could be
   anything") and journey steps 3–4 (D22 / D23 0.40–0.60: "the storm sea alone is generic; the map card carries the
   pirate read"; J5: the night-sea and harbour plates "could equally be Sea of Thieves"). One unmistakable Pirates cue
   per frame inside today's art (the Pearl's black sails, the skull-and-X map, Jack's compass made legible); no
   likeness, no logo.
3. **J1 #4 (medium):** the hero is frozen for ~6 s after the titles (#13–18 at both widths; the wave does not move;
   frames pixel-identical). The sea loop plays from the reveal (§4.4 "sea never still"); B02 registers live only
   while it plays (C1).
4. **J8 §4.4 / F10 / F7 / F8:** the name lands as a one-frame pop (7.92 s at 1440, 7.07 s at 1024): a short fade or
   wipe. The hero compass shifts the play screen at 1024 (intro CLS 0.0094): reserve its box. C2: stop and hide the
   hero video off screen. Journey repaints at rest (idle 0.5 fps at 1440, 20.5 at 1024) and its sticky column repaints
   in top / about (raster-diet item 3): quiet at rest.
5. **Panel (J2 low, J3 medium, J4 medium):** About at 1024 is three narrow dense columns with the compass medallion
   wedged in the gutter (1024 s4–5 #17–19): two columns or stacked pillars, and the compass gets its own space.
6. **J1 #6 / #7:** About's compass lid opens with no star (#37): register (C1). Journey step 4 and the Kraken wave
   overlap at 1024 (B12-push + B12, reader-1024 #51–52, panel #26): B12-push ends before the gull.
7. **Can't read:** journey's first line "…of it failed me first. Step through it." sliced under the header at both
   widths (read-1440 C003, read-1024 C016; all three judges; C5); "03 THE BREAK" spills below the map frame (J6, both
   widths); "parley?" is small (J5); the hero's "SELF-TAUGHT HIGH-SCHOOL QUANT • LANDON SCHOOL, CLASS OF 2027" is small
   and low contrast (J5, read-1440 C004, read-1024 C005): AA at its size.
8. **J9 F9:** during the intro at 1024 the fast lane is Tab stop 7 (stop 2 at 1440): make it stop 2 at both widths.
9. **J4 low (1024 #10):** the hero exit ghosts a caption mid-frame before the Pirates title lands on black (with F2
   item 4).
10. Star coverage: eye star-less outside breaths at 1440: top 6, journey 6 (log: top 3, about 3, journey 3); hand F1
    live-star declarations for the journey plates and the hero.

### F4 ACT II · Work, chapters, experiment, systems, kill-list
Globs: `components/site/{projects,capabilities,gauntlet-tabs,metric-tile,ledger-reckoning,idiots-chalk,media-band}.tsx`,
`components/sections/{chapter,experiment,ledger}/**`, `components/sections/{credibility-section,media-band-section}.tsx`,
`components/worlds/idiots/**` EXCEPT `drone-band.tsx`, `components/visuals/backtest-demo.tsx`, `app/p3/world-idiots.css`.
1. **Act II drags (all three panel judges; < 80 % yes for each; tempo read slow by J2 and J4, spec brisk):** the second
   project repeats the first's template (photo, blueprint, stat block with chalk circles; 1440 s16–17, 1024 s17–19),
   then a skills table of tiny text in 3–5 columns held 8–10 s (1440 s20–21, 1024 s23), then small kill-list rows with
   a lens that reads as decoration (1440 s22–23, 1024 s25–26). Give the second project a different layout and rhythm,
   fold the skills table into something compact that moves or collapses (the collapse primitive, D3-9), make the
   kill-list rows larger and the lens read as a control. No change to any figure or claim (CONTENT-RULES).
2. **J1 dead stretches (high):** experiment 1440 #104–114; systems #117–125 (1024 #105–119); optuna (eye 8) and
   trading-algos (1024 eye 7). One performer per viewport that holds while reading (the curve draw, the blueprint
   ink, the "How this page is built" FIG ink across the matrix) and live stars for the window plates (C1). Reading
   stops: 1440 #79–80, #92–93, #104–105, #113–114, #123–124.
3. **The chalk quote (J1 #6; strangers):** "What is a machine?" writes itself outside the spotlight (1440 #89, 1024
   #84) and the stills catch it unfinished ("“A n … — RANCI" at 1440, read-1440 C005; "“A machine is anything" at 1024,
   read-1024 C009; r1 "reduces h…"). Register it as B22's time star, finish within its grant, show it complete at a
   stop, and never cut the attribution.
4. **Blind 3 Idiots 2/9 at both widths (base 9/10; r1 6/9):** work A24 / D24 (0.50–0.70), work-board D25 (0.30–0.40:
   "the chalkboard by a Gothic arched window reads as Hogwarts"), systems A29 / D29 (0.45–0.65). One unmistakable
   3 Idiots cue per frame inside today's art; crop or mask the arched window on the work board, or use a registered
   or staged plate (C9 for the card).
5. **J1 #6:** the corridor plate drifts under the finished blueprint (#84, 1024 #78), the classroom plate drifts (#96),
   the campus plate slides in (1024 #92), the kill-list lens fades out (#132, 1024 #127), all with no star: register
   them (C1) or keep them inside a granted window.
6. **Can't read:** "FIG. · OPTUNA-SCREENER" breaks mid-word at 1024 and its bracket diagram crowds the project text
   (read-1024 C012, three judges); the inactive toggle "Realistic costs · out-of-sample" is dim (read-1440 C009,
   read-1024 C010, three judges); the struck-through red "Killed" is small (J5); grey project descriptions are low
   contrast on the green grid (J7); the chart caption is small (J7). AA at size.
7. **Panel J2 low:** the blueprint panel slides over the sticky photo, which peeks out above and below (1024 #46 s18;
   1440 #42, #49).
8. **J3 low (and r1 J4):** the same astronaut-pen photo heads both Work and the kill-list: use another registered or
   staged plate for one of them, or list the wish.
9. **J8 / C6:** keep heights stable after load (machine-board, ledger-reckoning, plate-band observe sizes); kill-list
   1440 fps 5.4 rests on 12 frames: no regression.

### F5 ACT III + ACT IV + CREDITS · RDR2, HP, contact, credits
Globs: `components/site/{beyond,writing,testimonials,rdr2-frontier,rdr2-graphite,principles*,hp-ink,contact*,footer,film-quote,post-credits}.tsx`,
`components/sections/credits/**`, `components/worlds/{rdr2,hp}/**`, `app/p3/{world-rdr2,world-hp}.css`.
1. **The Map of the principles, B54 (J8 F5/F6; panel J3, J4 medium):** the slowest place in every capture
   (reader-1440 #231–235 at 3.9–4.5 fps with 0 ms of work; reader-1024 #220–224; skimmer-1440 #90–95; skimmer-1024
   #66–71; panel 1440 #115–118, 1024 #109–112). Make it one static layer moved by transform; it holds still ~6 s on
   arrival (J3) and shows five identical panels (J4 "no" at 1440 s46, 1024 s50): first motion on arrival, vary or
   shorten the panels.
2. **J1 dead stretches (high):** beyond beside the sticky horse plate (1440 #173–180, 1024 #162–171) and contact into
   the credits (1440 #237–252, 1024 #225–239). One performer per viewport; B41 (#174–176), B47 (#205–210), B56-trail
   (#240–242), B57 (#246) and B58 (#251) must actually perform across their windows (with F1).
3. **Credits (J3 and J4 "no" at 1440 s48, 1024 s52):** tiny grey type on near-black for ~6 s. Larger and brisker on
   desktop, nothing hidden (the AI-assistance row stays visible).
4. **Can't read:** the quill sits on the "Y" of PHILOSOPHY at 1024 (read-1024 C011, three judges): it clears the word
   at a stop; "I solemnly swear…" under the banner is tiny and faint (all judges, both widths); the grey serif body
   under the contact headline (J5, J7); "RÉSUMÉ · COMING SOON" (J6, J7; hiding it is Aryan's call); "Entry II" faint
   pencil (J6, J7); "AFTER MENGZI" (J5); the "Lumos" link gives no hint (J5, both widths: propose a hint, copy key to
   F1); the "A [candle] S" monogram reads only as initials (J6). AA at size.
5. **Panel J2, J3 low (1024 #90 s41):** the "A wanted poster" caption sits half under the top bar for the whole stop
   (C5).
6. **Panel J2, J4 low:** the horse plate beside the satchel is cropped to black hillside and reads as an empty box
   (1440 #92–93, 1024 #87); "three arenas" and the satchel are low-contrast mono text on brown (1440 s35–36, 1024
   s38–39).
7. **Blind:** voices A31 (0.40–0.45) and the wanted board A34 / D34 (0.50–0.60) miss; one RDR2 cue each inside
   today's art (the journal frames now pass at 0.65–0.70).
8. **J8:** the voices campSticky repaints ×26–43 outside its window (raster-diet item 6); the writing h3s shift layout
   (reserve their metrics); contact runs 2.5–2.8 fps (the act-4 stage half is F2's).
9. **J1 #6:** the map footprints shift with no star (#227): register (C1) or keep inside B53 / B54.
10. **J6 (both widths):** on the writing frame the only name is "ARTHUR MORGAN'S JOURNAL", which a skimmer takes as the
    author: propose a label that reads as a film reference (copy key to F1; Aryan signs).

### F6 PERF + A11Y + DISCOVERY · the engine, chrome, header, eggs, games
Globs: `lib/{ladder,idle,flags,fonts,smooth-scroll,smooth-scroll-jump,motion,events,use-scroll-scene,gsap,hunt}.ts`,
`lib/audio/**`, `components/enhance/desktop-enhancer.ts`, `components/enhance/binders/{dc,hotspots,games}.ts`,
`components/providers/**`, `components/site/{header,chapter-select,command-palette,section-rail,chrome-gate,page-hydrated,world-kit,world-motion,boot-head-script}.tsx`,
`components/eggs/**`, `components/games/**`, `components/worlds/idiots/drone-band.tsx`, `components/director/**`,
`components/audio/**`, `components/primitives/{scene-caption.tsx,world-face.ts,motion-toggle.tsx}`, `app/globals.css`,
`app/layout.tsx`, `app/page.tsx`, `app/p3/{type,foundation,game,games,game-lazy,sound}.css`.
1. **J8 F1 (no long task while the page moves):** the run-when-idle wrapper ignores the idle deadline (chunk
   `3-hs4lm3bz94q.js:192`): 708 ms on the opening card (skimmer-1440 #7–9), 320 ms in act-1 at 1024, 435 ms in journey,
   147 ms in voices, 96–222 ms at the director's-cut start. Slice to the deadline (≤ 10–15 ms) and pause the warm-up
   ladder while the page scrolls or a card plays its set piece.
2. **J8 F2 (the quiet window):** with the intro skipped, `p3:quiet-end` (1.03–1.18 s) fires before `page:hydrated`
   (1.49–1.64 s); hydration's largest task is 528–652 ms (808 ms on the play screen at 1024; P3-0 137 ms), so the first
   fling meets 233–321 ms of work (skimmer 15 / 24 LoAFs, director's cut 19, in the 3 s after quiet-end). End the quiet
   window only after hydration; hydrate below-the-fold sections later or in smaller pieces.
3. **J8 F3:** a ResizeObserver on `<main>` → 180 ms debounce → full re-measure costs 100–320 ms mid-scroll (act-1,
   about, optuna, voices; `smooth-scroll-impl.tsx`): re-measure only on a real viewport resize, or only the section that
   changed (C6).
4. **J8 F4 / native:** the native run (`?skip=smooth`, the P3-0 scroll method) is 8.1 fps at 1440 against P3-0's 15.2,
   and every 1440 run is 7–21 % slower than round 1: find why (still open from round 1). LCP 280–904 ms against 400:
   re-check the LCP element after item 2.
5. **J8 F10 CLS:** the world-face film names in scene captions change metrics when the face swaps
   (`scene-caption.tsx`, `world-face.ts`, `world-fonts-impl.tsx`): metric overrides or reserved boxes (CLS 0 is the
   bar; desktop 0.006 / 0.0133, gl 0.014, native 0.017 / 0.015).
6. **Discovery (panel 2.5 / 2 / 2.75; the bar fails on the chip):** J2 and J3 could not read "Egg hunt 0/12" at scroll
   speed; J4 understood it only at the films intro (1440 s24) after the drone and Dead Eye had passed (J4 high). Make
   the chip legible in motion (size, contrast; a one-time expanded state on first sight is fine) and make every play
   affordance read as a button (the drone's Take off pill, the Dead Eye pill, the Director's Cut toggle; J4 medium,
   1440 s1, 18, 19, 22). Write the words for C4.
7. **Can't read (C5):** the sticky header slices the text under it (journey's first line at both widths; at 1024 the
   about caption "…YOU WANT MOST", the films Pirates title, the wanted caption): an opaque or faded band on desktop.
   "DIRECTOR'S CUT (SOUND ON)" is dim grey (three judges, both widths); at 1024 the "CREDITS" rail label sits under the
   skip pill and crowds it (J5 read-1024 C017).
8. **J9 F10:** accessible names run together in the Tab walk ("Director's cutMotion is paused", "The CrossingAct I •
   …"): check the accessibility tree and separate them. **J9 F9** with F3 (the fast lane's Tab order in the intro).
9. **J1 #6:** a small glyph flutters in the credits with no star (#248–249, 1024 #235–236); if it is the Snitch
   (`components/eggs/snitch.tsx`), it plays only as B57's grant; if it is a credits element, F5 registers it (C1).
10. **C7:** keep the chip's count span exactly `N/12`. Report the first-load CSS and JS headroom after the round (budget
    owner).

## Integration (after the fixers)
Apply F1's late handoffs (beats, live stars, copy keys), run tsc / `npm run check` / `npx eslint .` / `npm run build`,
the bundle probe against the base, the smoke test and `RELEASE=1 npm run check` (DP-9 only). Then round 3 (the last):
re-capture every axis plus a full reader pass, take 3 motion.js runs per width (J8: no single-run section rows), re-run
the §4.4 intro trace rows, and re-judge with NEW judge instances (`p3-r3/`).

## For Aryan (his words, his facts, what goes public; nothing here is a fixer's to decide)
1. **Kill-list eyebrow (J9 F2, medium):** "3 SURVIVED THE FULL PROCESS" overclaims: the same section tags Volatility
   Breakout EXCEPTION, "not on clearing every gate". Reword it in your words.
2. **Survivor rows 04 and 05 (J9 F6, Phase 2):** they show results (PSR 0.92; OOS Sharpe 1.13 · 9 of 9 years · 100 %
   positive CV paths) with no limitation of their own. One true limitation line each, from you.
3. **Community-sourced film quotes (J9 F3):** Q-PC-1, Q-PC-3, Q-3I-3, Q-RD-1 and Q-RD-2 are shown in large type with
   attribution. Verify each against a source or drop it (F1 makes a rendered unverified one a RELEASE error).
4. **"never retuned" (strangers J6 at both widths, J5 at 1024):** "Failed strategies are never retuned" / "Killed and
   never retuned" reads as a typo for "returned" to two of three strangers. Your word: keep it, write "re-tuned", or
   rephrase.
5. **"Trading_Algos-" (stranger J7, both widths, every frame that shows it):** the repo link ends in a hyphen and looks
   truncated. It is the repo's real name (`lib/content.ts`): rename the repo or approve a display label.
6. **`films.play` (J9 F11):** "the homemade drone flies in Systems" can read as your own drone (it is the 3 Idiots
   drone). Sign or reword when you sign the unsigned list.
7. **Unsigned copy and DP-9:** the 104 unsigned strings (more after round 2's handoffs), 40 Check L2
   countersignatures, 5 TTS approvals (lumos, mischief, nox, parley, solemn); plus the lines F1 finds missing from the
   list (J9 F8).
8. **Layout calls already on your list (CONTINUE #11):** J3 (the busy recruiter) wants the name first, cards 2–4 cut to
   ~2 s and the films interlude moved or cut; J2 and J4 call the opening and the cards the best of the page. Opening
   opt-in, card size and the interlude's place stay your call; this round only removes dead frames inside today's
   design.
9. **Drafts and "coming soon" (J3, strangers):** the Writing section is all drafts with nothing to open, and "RÉSUMÉ ·
   COMING SOON" is shown: show or hide until real (CONTINUE #11 (4)); real entries are yours.
10. **Proposed labels to sign or reject:** F5's journal label (so "Arthur Morgan's Journal" no longer reads as the
    author) and the Lumos hint; F6's game invitation on the contents page.
11. **A real-laptop recording (J8):** the §12.1 GPU row and §4.4 can only be settled on your machine; the headless
    numbers are relative.
