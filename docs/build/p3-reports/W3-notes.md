# W3 integration notes (Phase 3, wave 3 assembly, 2026-10-02)

Inputs: the six W3 returns (`docs/build/p3-handoff/w3/W3-{CINEMA,GAMES,HP,IDIOTS,PIRATES,RDR2}.json`), `w3/ORCHESTRATOR-NOTES.md` and the W3-assembler items in `docs/build/p3-handoff/deferred-w3.md`. The builders' tree is `6771dc8`. The integration commit is "P3 W3 integrated: handoffs, variants, lazy horse frames, measured estVh".

## 1. Handoffs applied

**Variant registry (`lib/variants.ts`).**
- New keys, each with a DEFAULT, an ALT and its files: `work.invite` (pulse / nudge, IDIOTS #0), `experiment.curve` (draw / fade, IDIOTS #0), `systems.drone` (chalk-sprite / blueprint, GAMES #0), `kill-list.deadeye` (ember-x / tally, GAMES #0), `contact.candles` (wand-relight / ember-catch, HP #0) and `contact.wand` (tip-bloom / trailing-light, HP #0).
- Notes and file lists updated:
  - `about.compass`: the compass toy (PIRATES #0).
  - `journey.voyage`: window-mode JV, the L19 and L20 at-rest loops, coin-moon.tsx (PIRATES #0).
  - `kill-list.reckoning` ALT note: "opt-in game", not "opt-in egg" (GAMES #0).
  - `principles.map`: principle-body.tsx and map-hint.tsx added (HP #0).
  - `contact.lastlight`: LivePlate and CameraGroup in both notes (HP #0).
  - `films.screens`: films-desktop.tsx and film-beats.ts added (CINEMA #0).
  - `words.flythrough`: sprites/** added (RDR2 #4).
  - `writing.journal`: the reading-line swap (RDR2 #4).
  - `voices.fire` and `beyond.handbill`: rd-desktop.tsx and live-plate.tsx added (RDR2 #4).

**Copy (`lib/film.ts`).** `toy.drone.best` "Best {s} s" and `toy.deadeye.best` "Best {n}/5 · {s} s" were added as page microcopy, proposed and **unsigned** (GAMES #1). The unsigned list grows from 100 to 102. W3-CINEMA asked for no `credits.libraries` change: the key already exists.

**Dead Eye gate (GAMES #3).** `components/eggs/egg-host.tsx` (the typed word) and `components/eggs/palette-dialog.tsx` (the palette row) now gate on the full `DESKTOP_FINE` query and on `#deadeye-call` being present. The game's own gate (`components/eggs/dead-eye.ts`) already did this.

**Lazy horse frames (ORCHESTRATOR-NOTES #1).**
- `<FlyThrough lazyFrames="horse">` renders the B45 zone with an EMPTY sprite and `data-words-frames="horse"`. `components/site/writing.tsx` no longer imports `HORSE_FRAMES`.
- The words binder (`components/enhance/binders/words.ts`, the lazy desktop chunk, DESKTOP_FINE only) calls `loadFlyFrames()` (`components/words/bind/fly.ts`) when the B45 star asks the spotlight, and only then requests it. `loadFlyFrames()` dynamically imports `components/words/sprites/horse-frames.ts` (its own chunk, about 9.9 KB gz) and fills the sprite. If the frames fail to load, the star settles static. `playFly` refuses an unfilled sprite.
- Provenance is unchanged in horse-frames.ts. The lab (`/lab/p3/words`) still passes staged `frames` directly.
- Verified on the built site:
  - The frame path data appears 0 times in `.next/server/app/index.html` and in `index.rsc`. Only `"data-words-frames":"horse"` travels.
  - The data sits in one lazy chunk, which the HTML never references.
  - The smoke test's full scroll filled the sprite (8 `path[data-f]`).

**Words gate (deferred W2-WORDS #7, CINEMA #3).** In `scripts/checks/words.mjs`, the host-shortfall warning is now a **release gate**. A `<FilmTitle inCharacter beat={FILM_BEATS[…].title}>` fed from `components/sections/films/film-beats.ts` counts once per film title in that table. Today's count is 8 in-character, 4 scrub, 2 physical and 2 fly, so nothing fires.

**Stage carry layer (CINEMA #1, optional).** A `carry` StageLayer at `--z-carry: 22` sits above the bars (20) and below the game HUD (25). `films-desktop.tsx` portals the B35 warm point into it instead of `game-hud`.

**Beats probe (RDR2 #1, #2).** In `tools/capture/beats.mjs`:
- A `scrub-sentence` star's span is its height plus 40vh, its 92 % → 52 % scrub range (scrub.ts), instead of its inline box. B08, B21, B42 and B55 no longer read as < 300 px.
- For the GAPS only, a beat inside a `position: sticky` box spans its box plus the sticky travel to its containing block's content bottom. This covers B45 on the journal's sticky page, the split windows' racks and the pinned cards' layers. Competing stars and spans keep the box at scrollY 0, so they stay comparable with W1 and W2.
- **B44 × B45 "competing" is accepted** (RDR2 #2). The zone mounts only after the first entry crosses the reading line, and the fly is `needsIdle`.

**Static beats (`lib/page.ts`, `lib/film.ts`).**
- `beats.mjs --write` updated estVh for 20 items: about, journey, trading-algos, optuna (4.94 → 3.23 d after the appendix collapse), experiment, beyond, writing, contact, credits and others.
- Three measured spans were set:
  - B46 is now `at 254.5, span 36.5`, ending at the writing bottom (RDR2 #0). 36.5 is the 1024 box of 312 px expressed in d units, so the ≥ 300 px rule holds at 1024.
  - B09's span went from 66 to 40, its 360 px box at 1440. The shorter about section (1.211) had made it overlap B10.
  - B06's span went from 76 to 74.8, its 673 px box at 1440. This clears the 1.2vh B06 × B07 overlap carried since W1.
- The B24 → B25 static gap cleared with the new optuna estVh, so B25 stays at `at 0` (IDIOTS #1's fallback was not needed).
- `npm run check` now reports no beat gate.

**Docs.** `deferred-w3.md` now says the W2-gate "reserve the voyage's paused height" item was **solved differently** (PIRATES #3).

Already done by the builders, so nothing further was needed: `chalk.tsx` no longer reads `readSession`; `capabilities.tsx` passes B27 through the spotlight (IDIOTS #2); `ledger-reckoning.tsx` calls `recordLedgerRowRead` (IDIOTS #3).

`assets/p3/hp/hp-toys.css` was **not moved** (HP #1): the build accepts the import from `assets/`, and its rules ride the lazy toy chunks. None of them appears in the "/" first-load CSS.

## 2. Deferred (owner in brackets)

- **First-load JS budget breach** (§3; the W3 fixer).
- **Beats probe: two gaps over 100vh** (§4; the W3 fixer).
- Probe runs the builders asked the assembler to make go to the gate verifier: cinema (1440, 1024, `--rm`), games, the plates-live journey run (`__seqMem`), layout-gates pausedReload/pauseMid for `#journey`, words with `debug=words,spotlight`, hunt (the coin hotspot), bundle `--compare` (CINEMA #4, GAMES #4, PIRATES #2).
- A candles/wand probe (HP #2) goes to the verifier or P3-11.0 TOOLS. The smoke test covers only existence and the lazy arm.
- `marks.fire` on MV-11 / MV-11-alt (RDR2 #3) goes to the media lane or Aryan. It needs a measured mark, never an invented one, and until then the voices.fire ALT has no on-page rd-fire trigger.
- `iconic-corridor-alt` has no line mark (deferred W2-PLATES #6, media lane). `lib/stage.ts` `move` (W2-PLATES #5, optional) is not done. palette-dialog.tsx stays where it is (W2-HUNT #5, optional).
- **For Aryan:**
  - Spec §9.2 #4 says "39 candles", but the hall as built shows 29 at ≥ 80rem and 24 at 64–80rem (HP #3). Amend the spec, or add candles (a composition change).
  - Sign the two new copy strings.
  - The rd-bone note is set in Newsreader rather than the hand face (5 words, over the hand's 4-word cap; RDR2 note).

## 3. Budgets ("/" first load, the HTML-referenced scripts and styles, zlib level 9; base `5aa4587` rebuilt the same way)

| build | JS gz | Δ JS vs base | CSS gz | Δ CSS vs base |
|---|---|---|---|---|
| pre-Phase-3 base | 437,975 | – | 29,352 | – |
| W2 (`87e2b0f`, rebuilt in a scratch worktree) | 442,249 | +4,274 | 34,666 | +5,314 |
| **W3 integrated** | **446,788** | **+8,813** | **35,441** | **+6,089** |

**JS is over the binding +6 KB line (6,144) by 2,669 B. CSS is 55 B under it.** W3 adds +4,539 B gz JS and +775 B CSS over W2.

There is no single culprit. Source-map attribution of raw first-load bytes, W2 → W3 (a `productionBrowserSourceMaps` build of each tree), shows these W3 additions:
- dead-eye-call.tsx +1,591 and games/shared.ts +171 (GAMES)
- drone-band.tsx +1,077 (GAMES)
- journey-chart.tsx +989 (PIRATES)
- chalk.tsx +877 (IDIOTS)
- campfire-stage.tsx +862 (RDR2)
- film-frame.tsx +811 and film-beats.ts +203 (CINEMA)
- lib/variants.ts +806 (the new registry rows' keys and names; the notes and files are stripped)
- the W2 primitives that W3 hosts made first-load: live-plate.tsx +766, camera.tsx +743, weather-layer.tsx +273
- plate-band +725, journal-spread +700, gauntlet-tabs +692, contact-finale +655, curve-draw +471, contact-scene +467, rdr2/kit +465, journal-sketches +424, hall-ceiling +379, about-pillars +377, analytics +361, jack-compass +351, snitch +336
- about +3.7 KB raw of lazy-import loader stubs: each new `import()` adds a chunk-list stub of about 100–140 B to the first load

journey-voyage.tsx left the first load (−7,305 raw) and use-frame-sequence.ts left it too (−1,374).

Candidates for the fixer: lazy or server-markup splits of DeadEyeCall, the DroneBand game wiring, the chalk.tsx egg wiring and the films desktop parts, and fewer separate lazy entry points. The W2 worktree build (`scratchpad/p3-w2`, with source maps) and the attribution scripts (`scratchpad/smattr*.cjs`) are left in place for this.

## 4. Beats probe (`docs/build/motion-strips/p3-w3/beats/beats.json`, `/?skip=intro,smooth&debug=spotlight`, 1440×900 and 1024×768)

- 78 beat elements and 78 declared at both widths: **0 declared-but-missing, 0 undeclared, 0 spans < 300 px, 0 page errors.**
- Spotlight at 1440: 32 requests (5 need idle), 3 waits, 6 grants, 26 skips (all "host left the viewport" from the fast walk), 6 holds ended, 18 own and 10 free. At 1024: 34 requests, 3 waits, 7 grants and 27 skips. There are no maxWait skips and no stuck holds.
- **Two gaps over 100vh remain at both widths.** They are for the fixer. No beat was invented.
  1. **B29 → B30** at 1440: 2205.6 → 2365.0vh (159.4vh). At 1024: 2417.7 → 2617.1vh (199.5vh).
     - B29 is the 22 px "Killed" strike in the `#kill-list` header. B30 is the films letterbox marker.
     - `#kill-list` spans 2167.7–2403.5vh at 1440 and 2377.4–2655.8vh at 1024. Its ledger (`[data-ledger]`, 2234.6–2385.5 / 2436.6–2639.0vh) carries no beat.
     - Spec row B29 is "kill-list rows". Options: host the row's lens-index scroll on the ledger under a declared id, or re-place the B29 / B30 boxes.
  2. **B56 → B57** at 1440: 4684.1 → 4851.2vh (167.1vh). At 1024: 5084.6 → 5263.1vh (178.5vh).
     - B56 is a 56 px element in the contact scene (4652.4–4732.8 / 5051.9–5133.1vh). B57 is the 44 px Snitch, 105vh into the credits.
     - The credits roll (4758.4–4939.4 / 5154.4–5356.1vh) carries no beat. Spec row B57 is "credits: the roll over the last shot …; the Snitch darts once".
     - Moving `data-beat="B57"` onto the roll would change the spotlight's "host left the viewport" test for the dart (`lib/spotlight-impl.ts`), so it is left to the owner.
- The probe's competing-stars list is report-only. Its 1440 list matches W2's kinds plus B44 × B45 (accepted above).

## 5. Checks

- `npx tsc --noEmit`: clean.
- `npm run check`: OK, 66 warnings, no beat or words gate.
- `npx eslint .`: clean.
- `npm run build`: OK (16 routes).
- `RELEASE=1 npm run check` (`W3-release.txt`): **46 errors, all expected.**
  - 40 are Check L2 rows awaiting Aryan's countersignature (`aryan:pending`).
  - 5 are TTS lines awaiting Aryan (tts-lumos, -mischief, -nox, -parley, -solemn).
  - 1 is the unsigned copy list, with 102 strings (100 + `toy.drone.best` and `toy.deadeye.best`).
  - Nothing else.

## 6. Smoke test (`next start -p 3161`, headless Chromium, 1440×900, `/?skip=intro`, a full wheel scroll of 100 × 450 px to the bottom, 44,569 px)

- **0 console errors, 0 page errors, 0 hydration errors, 0 failed requests.** There are 13 console warnings, all "Failed to parse video contentType: video/mp4; codecs=avc1.640028": headless Chromium has no H.264, as in W2.
- These are present:
  - the drone pill `#drone-takeoff` (displayed)
  - the Dead Eye pill `#deadeye-call` (displayed)
  - the compass toy `[data-toy="compass"]`
  - 29 hall candles `svg[data-candle]`, with the toy armed (`[data-candle-toy]`) and the Lumos button
  - the director's cut button `[data-dc="hero"]` (from first paint)
  - the hunt chip `[data-hunt-chip]` (from first paint)
  - the `carry` stage layer
  - the B45 sprite filled lazily (8 frames)
- In a second run, opening the menu showed the chapter select: the Director's cut button and 7 tiles.
- The server was stopped afterwards.

## 7. Implementation notes the returns asked to record (spec Appendix A / §9.2 / §11.1)

- **CINEMA #2:**
  - The shot list's tempo travels in the hero button's `data-dc-shots`, server-rendered from lib/page.ts and lib/film.ts, because browser-data-loader strips tempo, estVh and beats.
  - Star weights and positions come from the live DOM (`data-beat-star` and `data-beat-weight`), not from estVh.
  - A scroll star (`[data-card-beat]`, `[data-beat-scroll]` or a scrub) dwells where its spotlight range lets go. That is when the box bottom reaches 20 % of the viewport: a card star's end, or the moment the house lights are fully down. A time star dwells centred, and 2× halves the dwells.
  - The stop pill is plain DOM in the `stop` layer, not a React portal.
- **GAMES #5:**
  - The DEAD EYE pill toggles: a press during a round releases it.
  - `--time-scale` is set on `#kill-list`, not on `<html>` (rule 33).
  - The drone's live HUD is fixed in `game-hud`. Its score and its "Next: the kill-list ↓" panel sit in the band.
  - Only a full 7/7 course shows the score panel. A partial flight ends quietly, with no fail state.
  - Under reduced motion, the Dead Eye score line is the template up to its " · " ("n/5 marked").
- **PIRATES #1:** the toy's `<button aria-label="Spin Jack's compass">` is laid exactly over the aria-hidden SVG instead of wrapping it, so JackCompass never remounts. Accessibility is the same.
- **RDR2:**
  - Under the boot gate, FrontierBand starts at ×1 so the camera can continue the card's push from 1.04 to 1.08. Everywhere else it keeps the static ×1.2 framing. This is a P3-11 taste call.
  - B41 breaks out across the Athletics note below 90rem.
  - B46 sits on writing.tsx's dusk, and B47 sits on the camp stage root.
