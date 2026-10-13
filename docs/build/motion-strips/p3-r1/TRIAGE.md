# P3-11 round 1 · triage (assembler)

Inputs: `verdicts/` (j1-star, panel-j2/j3/j4, the stranger verdicts + `score-*.md`, j8-smooth, j9-honest) and
`MANIFEST.md` §1 (automated J1, dead screen, drift, keyboard). Every finding below names its source; read the source
file for the clip numbers and the full wording. R = `docs/build/motion-strips/p3-r1`.

## Scores (ship bar: every axis ≥ 4 and every pass bar met)

| axis | r1 | pass bar | status |
|---|---|---|---|
| J1 one star per screen | **2** | ≥ 90 % reader clips one star; none star-less outside breaths; 0 two-plus | eye: 53.6 % / 54.5 %; 109 / 102 star-less; 2 two-plus at 1440 |
| J2–J4 keep scrolling | **3 / 3 / 3** | ≥ 80 % yes per act, no two consecutive no, hand-off + 4 cards + first Work screen yes | 56–66 % overall; Act III 29–56 %, credits 0 % (2 of 3), Act II 60 % |
| J2–J4 tempo | **3 / 3 / 3** | tempo named right by ≥ 2/3 (assembler vs SPEC §2.2) | assembler scores at re-judge |
| J2–J4 discovery | **2 / 3 / 3** | chip + one invite noticed within 3 screens | the chip is unexplained; "a game" promised, never found |
| J5–J7 blind recognizability | — | ≥ P3-0 per world | below base for pirates, idiots, rdr2 (most misses = right film at < 0.6); 0 wrong-film |
| J5–J7 name / can't read / fast lane | — | 3/3 · 0 · ≤ 10 s 3/3 | 3/3 · **several** · 3/3 (1 s) |
| J5–J7 hooks | — | each hook 3/3 | **4/8** at each width |
| J8 smooth | **3** | §12.1 + §4.4 | see F6 / F2 |
| J9 honest + a11y | **3** | green | 2 red rules (RM motion, RM kill-list overprint) |

## Fixers (≤ 6, disjoint globs; the same builder rules as W1–W3)

Rules for every fixer:
- Edit only your globs; never commit; no `npm run build` / server / browser in the main tree (use your own worktree +
  `cp -al` node_modules, your own port, and stop it; keep browser time short, one browser per fixer).
- `lib/page.ts` and `lib/film.ts` belong to **F1**; others return beat declarations and copy keys as HANDOFFS
  (exact text; any new copy is page microcopy `status: "proposed"`, `unsigned: true`; never invent facts).
- **First-load CSS has 40 B of headroom.** Net first-load CSS growth must be ≤ 0 per fixer: put desktop-only rules
  in CSS imported by a lazy chunk, or cut an equal amount; report bytes. First-load JS headroom ≈ 1.8 KB in total:
  ≤ +300 B gz per fixer, desktop code behind facades / lazy chunks.
- CONTENT-RULES.md is absolute; Sharpe/PSR/PF never animated; research data in Geist; RM + Pause stop everything;
  one h1; no `<html>`-matching rule for a runtime attribute; no `[class*=]`; nothing keyed on `html.lenis*`.
- Phones (< 64rem) keep today's behaviour.
- Media: reuse is a panel complaint. Prefer an already registered or staged plate (`lib/media.ts`,
  `docs/build/media-staged/p3/`) over repeating one; generating new media is NOT in this round (credits: 184.88,
  reserve ≥ 100) — list the wish as a handoff with the exact frame you'd replace.

### F1 STAR-CORE · the spotlight, beats, breaths, word primitives
Globs: `lib/spotlight*.ts`, `lib/beats.ts`, `lib/page.ts`, `lib/film.ts`, `components/primitives/use-enter-once.ts`,
`components/words/**`, `components/enhance/binders/words.ts`, `scripts/checks/**`, `tools/capture/{clips,deadscreen}.mjs`.
- J1 #3 (high): a scroll star keeps the spotlight after its performance ends (116 clips "granted, nothing moves").
  A scroll star's ownership should cover its visible performance (scrub range or entrance), then free.
- J1 automated 2+: a scroll star takes ownership while a time star's hold runs (B08-compass + B08, B21-circle + B21).
  One arbiter rule, both directions; B21 + B21-circle are one visual registered twice (J1 #10).
- J1 #9: grants land off-beat: hosts start before the grant (B16 / B26 typewriter). Hosts must wait for the grant;
  give the in-character title primitive the grant gate.
- J1 #8: the breaths (B07, B31, B52 hold strong motion) are misplaced; re-declare breaths where the page is really
  still, and only where a rest is right (SPEC §2.3 intent).
- J1 #1 (high) "too few stars": each star is a ~1 s entrance, reading stretches go up to 14 s still. Core part:
  allow a scroll-linked star whose performance spans its reading stretch (scrub-tied draws/ink, not loops), so
  F3–F5's hosts can fill journey / writing / optuna / systems / kill-list / principles / credits stretches.
  Declare the new beats the host fixers hand you (integration applies late handoffs).
- Register-or-declare: B02 hero wave, B10/B11 crossing crossfades, B54 principles ink, plus the undeclared performers
  (journal sketches, blueprint draws, kill-list mini-card, credits comet; J1 #4). B09 weak, B17 never performs:
  fix or retire. Keep validator checks 1–14 green (`npm run check`).
- Tools: make `clips.mjs` / `deadscreen.mjs` count a scroll star only for its performance window (so the machine
  agrees with the eye), and count a registered host's own animation.
- Dead screen D1 (B06 never requested), D4 (B20 skipped behind B19), D10 (B45 skipped, host leaves first).
- J9 low + strangers: about words mid-scrub sit at 0.28 opacity ("did not survive testing" fades to near-invisible).
  The scrub-sentence primitive must never leave words unreadable when the reader stops.
- Copy: apply the copy keys the others hand you (F6's game invitation and chip hint), proposed + unsigned.

### F2 CARDS + STAGE + FILMS · the act cards, transitions, stage, letterbox, films interlude
Globs: `components/sections/act-card/**`, `lib/gl/**`, `components/gl/**` (if present), `app/p3/cards*.css`,
`app/p3/cinema.css`, `components/stage/**`, `components/primitives/{live-plate,camera,depth-plate}.tsx`,
`components/sections/films/**`, `app/p3/stage.css`, `app/p3/plates.css`.
- Hooks (strangers, 0/3): css-ignite and css-seam at p .05 show the NEXT act's title over the OLD world's image and
  caption ("HARRY POTTER" over the RDR2 campfire; "3 IDIOTS" over the Kraken storm), also seen by all three panel
  judges for 2–4 s (J2 #1, J3, J4 #5). The title must not land before the new world shows (or the old caption must
  go with the old image); the GL tier passes 3/3, so match its order in the css tier.
- Hooks: the tintype at p .05 (both tiers) reads as "a muddy sepia smear / image failed to load". Start it
  recognisably developed (detail visible), then develop.
- Panel (J3 #1 high, J4 #3): the act-title text-mask reveal shows half-words ("Wor", "…rontier", "THE LIGH") and
  near-black middle frames, used 4×. Shorten the masked middle, keep a legible state, vary at least one.
- Panel J3 #2 / J4 #1 (high, 1024): the 3 Idiots paper/cloud wipe fills the frame with a pale blank texture and a
  ring (reads "failed to load"). Strangers: the egg toast "EGG 1 OF 12 · THE KRAKEN" sits on the RDR2 opener
  (coordinate the toast's timing with F6).
- Panel J2 #4, J3 #5, J4 #7: image hand-offs leave dark gaps / two half-images stacked (lecture hall → pen; the dawn
  photo into itself).
- Panel J3 #6, J2 #3, J4 #8: "Three films and a game" = a bare grey title on black for 4–5 s. Give it a frame worth
  holding (and the game promise: see F6 discovery). RDR2 twice back to back (film card then the Act III header, J4 #10).
- CONTRACT with F3 (hero loops, J8 #3): F2 sets the attribute `data-stage-covered` on the hero's
  `[data-section="hero"]` element while the act-1 card fully covers it and removes it when it no longer does; F3's
  hero pauses its loops while the attribute is present (MutationObserver) and resumes when it goes.
- The films interlude hosts the plain game invitation (F6 writes the words, F1 adds the copy key, F2 places it in
  `components/sections/films/**`; desktop only).
- J8 #2 (cheapest win): finished or not-yet-started card stages and the intro layer must cost nothing (out of paint,
  not opacity 0); principles and contact are slow because they repaint the previous card's stage. J8 #3: stop the
  hero's background loops once the act-1 card covers the hero (act-1 is now the slowest transition, 4.8 fps): via the
  `data-stage-covered` contract above.
- J8 #5: ease the three one-frame cuts (act-2 title mask, act-4 hall flash, films 3 Idiots → RDR2) over 200–300 ms.
- P3-5 #3: the ignite push registration SSIM .923 at 1024 (SEQ-HALL frame 0 vs the hall still; content, not tone).

### F3 INTRO + HERO + ACT I · Pirates
Globs: `components/intro/**`, `public/intro/**` (rebuilt from the controller only), `app/intro.css`,
`components/sections/hero/**`, `components/site/{hero-scene,about,about-bio,about-pillars,journey*,credibility-strip}.tsx`,
`components/worlds/pirates/**`, `app/p3/world-pirates.css`.
- J8 #3 (CONTRACT with F2): pause the hero's background loops while `[data-section="hero"]` carries
  `data-stage-covered` (F2 sets it while the act-1 card covers the hero); resume when it goes.
- J4 #9: in the opening the broom flips vertical for a frame and two captions overlap (clips 2–4, both widths).
- J8 #6 / §4.4: the name and hero controls must be drawn under the intro so they show on the 2nd reveal frame
  (they pop in 1–2 s later); intro 20.2 fps at 1440 (29.5 target); the ~3 s after the titles must stay free of work
  you own. J3 #10: ~25 s before anything beyond the name; J2: ~16 s before you can scroll.
- J3 #7: the ghost "The Crossing" title is dark on dark. Strangers: the Black Pearl frame's second paragraph shows
  only letter tops (1440); about headings half under the sticky header.
- J1 #5 real 2+: r1440 #34, the compass needle swings while the about body text is still revealing.
- Strangers blind: the hero's glowing sea reads only 0.45–0.5 "Pirates" (could be any sea) — give the first screen one
  unmistakable Pirates cue within the existing art (no likeness, no logo).
- Star coverage for the journey stretch (14 star-less clips at 1440): hand F1 your beat declarations.
- RM (J9 red #1): the RM layout shift (0.061 / 0.116, about → journey at ~5 s): the RM layout must be final at first
  paint.

### F4 ACT II · Work, chapters, experiment, systems, kill-list
Globs: `components/site/{projects,capabilities,gauntlet-tabs,metric-tile,ledger-reckoning,idiots-chalk,media-band}.tsx`,
`components/sections/{chapter,experiment,ledger,credibility-section.tsx,media-band-section.tsx}/**`,
`components/worlds/idiots/**` EXCEPT `drone-band.tsx`, `app/p3/world-idiots.css`.
- J9 red #2 (HIGH): under RM at 1024 a ghost copy of kill-list rows 01–02 is painted over rows 05–06; "OOS Sharpe
  1.13 · profitable 9 of 9 years · 100% positive CV paths" cannot be read (`R/scenes/1024/rm-02.jpg`, tile
  rm-14-kill-list-685). Research data must be readable in every state.
- J9 red #1: under RM, 6 running CSS transitions on the #work headings (`mt-tier-group` / `mt-tier-pair`) at 1440;
  the kill-list keeps repainting (21.8 / 32.7 paints/s) with Motion's frame loop running.
- Panel: an empty outlined box in the kill-list looks broken (J2 #5, J4 #6, J3 low); strangers: an empty rectangle
  over the "FIG. · TRADING_ALGOS-" label (1440); J1 #6: r1440 #96 the blueprint still draws while the sticky backdrop
  crossfades (classroom → corridor) — order them as at 1024.
- Panel J2 #2: the second project repeats the first's layout and the same corridor photo; J4 #2: the skills matrix is
  cramped into five columns at 1024; small dim text (skills, kill-list rows). J4 #8: "Led by what survived scrutiny"
  holds ~4 s with two-thirds of the frame empty. Strangers: the chalk quote stops mid-word ("reduces h…") at 1440.
- Strangers blind: work-board (0.35–0.5) and systems (0.45–0.65) read weakly as 3 Idiots.
- Star coverage: optuna 8, systems 7, kill-list 7, work 5, experiment 5 star-less clips at 1440: hand F1 the beats.

### F5 ACT III + ACT IV + CREDITS · RDR2, HP, contact, credits
Globs: `components/site/{beyond,writing,testimonials,rdr2-frontier,rdr2-graphite,principles*,hp-ink,contact*,footer,film-quote,post-credits}.tsx`,
`components/worlds/{rdr2,hp}/**`, `app/p3/world-rdr2.css`, `app/p3/world-hp.css`, `app/p3/words.css`.
- Act III is the panel's low point (J3 29 %, J2 55 %, J4 56 %): the RDR2 sunset photo is used back to back over ~5
  screens and twice on screen at once (J3 #3); "Golden hour in the heartlands" caption overlaps the Frontier
  paragraph and "THE FRONTIER" collides with a caption (J3 #4, J4 #10); a thick grey brush arc in the journal looks
  like an artifact (J2 #6). J1 #7: skim collisions (target sketch + horse; typewriter heading + journal sketch).
- Strangers: the journal sketchbook pages read "??" (0.1–0.2): give them an RDR2 journal cue in the existing style.
  Wanted board 0.5–0.6 and voices 0.35–0.5 read weakly.
- Act IV: the principles are five identical boxes (J2 #10) at ~5 fps; "PHILOSOPHY" clipped to "PHILOSOPH" at the map
  fold (1440, strangers); a blank cream box before the map (J4 #6). Contact 667–801 ms frames (J8: the previous
  stage; F2 removes it).
- Credits: 0 % keep-scrolling (2 of 3 panels), small dim text. Make the roll brisker/shorter on desktop without
  hiding anything (the AI-assistance row stays visible); the credits comet is an undeclared performer (F1).
- Star coverage: writing 10, principles 6, credits 6, contact 5, beyond 3 star-less clips at 1440: hand F1 the beats.

### F6 PERF + A11Y + DISCOVERY · the engine, chrome, eggs, games
Globs: `lib/{ladder,idle,flags,fonts,smooth-scroll,smooth-scroll-jump,motion,events}.ts`, `lib/audio/**`,
`components/enhance/desktop-enhancer.ts`, `components/enhance/binders/{dc,hotspots,games}.ts`,
`components/providers/**`, `components/site/{header,chapter-select,command-palette,section-rail,chrome-gate,page-hydrated,world-kit,world-motion,boot-head-script}.tsx`,
`components/eggs/**`, `components/games/**`, `components/worlds/idiots/drone-band.tsx`, `components/director/**`,
`app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `app/p3/{type,foundation,game,games,game-lazy,sound}.css`.
- J8 #1: keep the main thread free during scroll: slice idle and warm-up work to 10–15 ms, start it only after
  scrolling settles, never in the 3 s after the titles; split the 180–350 ms first-scroll visibility pass and the
  ~100 ms at journey entry; the 500 ms idle task mid-fling (skimmer-1440 #29). Native (`?skip=smooth`) regressed
  15.2 → 10.2 fps and 27 → 42 pops vs P3-0: find why.
- J8 #4 / P3-2 #7: CLS to 0: world-font text gets a fixed line box (metric overrides or reserved boxes) — this needs
  first-load CSS: find the bytes (you own globals.css; cut dead rules) and report the new headroom.
- Discovery (J2 2/5, all panels): "Three films and a game" promises a game nobody finds; the 0/12 chip doesn't explain
  itself. Make the hunt chip self-explaining on first sight (desktop) and give one plain invitation to play (drone /
  Dead Eye / the hunt) near the films interlude or the first toy — page microcopy, proposed + unsigned (copy keys to
  F1 as handoffs). The egg toast must not land on a card opener (coordinate with F2).
- J9: palette → Map → Esc leaves focus on `<body>`; the keyboard walk reads "WorkSkip to the research" (doubled label)
  and "…Motion is paused" while motion runs (check the accessibility tree); Dead Eye under RM stores "Best 0.0 s", a
  time never measured (honesty: store nothing); verify no-JS (qa lists 2 sections vs 19: are 12 sections hidden until
  script? the intro must never gate content).
- CSS budget owner: report the first-load CSS headroom after the round.

## Integration (after the fixers)
Apply F1's late handoffs, run tsc / check / eslint / build, bundle vs base, the smoke test, then re-capture the
affected axes plus one full reader pass and re-judge with NEW judge instances (round 2 → `p3-r2/`).
