# M2 art-director + a11y/mobile critic, round 2 — 2026-09-29, about 14:55–15:10 UTC

**What was reviewed:** the first `docs/build/m2-after2` capture at head `daac296`: desktop 1440 default (D) and `?variant=alt` (A), mobile 390 (m390-*), and reduced motion (rm-*), plus a live probe of the running build. The "previous 15" are the issues in `ART-DIRECTOR.md`.

**Below:** the critic's report, verbatim, then what the fix round (`d4a2cd8`) did with each item. The critic's `scratchpad/critic3/…` paths were session-local and are not in the repo.

---

**Art direction + a11y/mobile critique, round 2 (desktop 1440 D/A, m390, RM, plus a live probe)**

To your question: the fix round cleared most of the old list. 8 of the 15 issues are fixed, 4 are partly fixed, and 3 remain. It also broke one thing: the new caption backgrounds (scrims) now show hard rectangular edges. The rest of the work is layout and CSS. No new media is needed, apart from an optional re-crop or regeneration of one image (issue 9). My guess is one more fix round and one more capture. I can't estimate that in hours.

**Checks that pass:** exactly one h1 in every mode. No console or hydration errors. No overflow at 390. Reduced-motion probe across 8 sections: 0 running animations, 0 videos playing, 0 rAF callbacks, and every rm-* frame is fully composed.

**Harness artifact, not a site bug:** frame m390-28-contact came out blank (the header is drawn at y=597). The live page renders it correctly (scratchpad/critic3/m-contact-1200.png). Fix: in `tools/capture/scenes.js` `sweep()`, wait about 800 ms more after the last scroll.

**Status of the previous 15**
- **FIXED:** #1 (alt plates A43–46 and A29 render), #2 (alt journey captions show), #8 (the rotating map-fold and the skip crossing MENU are gone), #9 (Calypso's Storm, chart caption under the chart, pen photo, tattered sails, wiped board), #10 (the Marauder's Map now has a banner, creases, inked walls and footprints), #11 (the quotes are lettered at display size), #13, #14.
- **PARTLY FIXED:**
  - #3: the caption and the alt lens are done, but the default hero still frames the wave.
  - #4: film titles no longer split, but moment lines still leave orphans.
  - #6: act 4 mid now shows both worlds and the act 2 outgoing caption is visible; act 3 still has no visible develop.
  - #7: act 1 feather, Jolly Roger, act 2 seam, duster sweep and act 3 band are fixed; new edges came from the scrims.
- **REMAIN:** #5 (title under the header at settled), #12 (finale strokes), #15 (the alts still barely differ).

**Issues, in priority order**

1. **MAJOR (new, caused by the fix round): hard-edged caption scrims.**
   - Frames: D24, D27 (right edge at about x=420/1024 cuts across the benches), D29/A29 (about x=443, across the grass), D10-act-2-enter, A10-act-2-enter/mid, D10-act-4-enter/mid.
   - Evidence: the act-card scrim shows a vertical edge at x≈490 and leaves an unscrimmed strip at x≈945–988.
   - Cause: `app/globals.css` lines 1219–1227. The bl/br `::after` is only a vertical gradient. The `.card-cap-frame ::after` (lines 1237–1246) stops 48px short on the right, but the caption sits about 93px inside the plate edge. Its 88px left feather is too short against a bright plate.
   - Fix for bl/br: add `mask-image: linear-gradient(to right, #000 55%, transparent)` (use `to left` for br) and set `inset: -56px -120px -24px -24px`.
   - Fix for card-cap: set `inset: -72px calc(-1*var(--cap-inset)) -64px -40%`, a left mask `transparent → #000 45%`, and a 72px top fade.

2. **MAJOR (REMAIN #5): act title still jammed under the fixed header.**
   - Frames: D10/A10-act-2/3/4-settled. "3 IDIOTS", "RED DEAD REDEMPTION 2" and "HARRY POTTER" sit at real y≈63–120, and the meta line is hidden. In D10/A10-act-3-mid the meta line is clipped at y≈50.
   - The mid frames are fine. The card is about 950–960px tall in a 900px viewport (act 3 section measured 952px), so at the end of the sticky range it gets pushed up about 60px.
   - Fix: in `globals.css:1060` change the `--card-frame-w` reserve from `17rem` to `21rem`, so the card is no taller than 100svh. Then add an assert `card.offsetHeight <= innerHeight` to the capture.

3. **MAJOR: outgoing plates are black at enter, so the caption names something that isn't visible.**
   - D10/A10-act-2-enter: "THE KRAKEN'S STORM" sits over grey-black. No ship, no crest.
   - A10-act-4-enter: "THE CAMPFIRE" sits over black with a single ember.
   - Fix: in `frames/seam.tsx`, `seam-chalk.tsx` and `ignite-lumos.tsx`, hold the outgoing plate at full exposure for p 0–.3 and only darken after that. Start alt act 4 on the lit camp plate, as default does.

4. **MAJOR (REMAIN #6, act 3): nobody sees the tintype develop.**
   - Act 3 has no pinned travel (section is 952px, against 1422px for acts 2 and 4). So `DEVELOP {from:.15,to:.7}` (`tintype.tsx:83`) plays while the plate is still below the fold, and mid is the same as settled (D/A).
   - D10-act-3-enter also shows two blurred dark blobs (x≈520 and 910, y≈580) that read as dirt.
   - Fix: give act 3 the same travel height as acts 2 and 4 in `act-card-section.tsx`, or drive the develop from the frame's own in-view progress. Keep the undeveloped noise as grain, not solid blobs.

5. **MAJOR (partly fixed #3): the default hero still reads as a teal wave.**
   - Frames: D01, rm-00. The lens brackets frame the crest, and the Pearl is about 35px, pinned in the bracket's corner.
   - Alt (A00-landed, A01, lens tight on the Pearl) works.
   - The hero caption also renders dim (sampled ≈#8f959a / #8a6a3a) even though its computed colour is #e6edf3 at opacity 1. Something is stacked over `.hero-cap` (z-10). After landing, the bright flight caption visibly dims. It still passes AA for large text (about 3.9:1) but looks disabled.
   - Fix: in `hero-stage.tsx`, give default MV-01 the alt's Pearl-tight focal box and crop so the ship is at least 90px. Find the overlay with `elementFromPoint` and raise `.hero-cap` to z-30 (line 746).

6. **MAJOR (REMAIN #12): finale strokes read as bugs.**
   - D44: the gates are dark on a pale sky and read as a fence of torii.
   - D45: a dashed trail ends in a glowing vertical smear at x≈437.
   - D43: the compass leader line runs off the plate and ends in the page.
   - D46: a stray gold squiggle.
   - D10-act-3: a white swoosh across the grass. A10-act-3: floating grey hachure arcs.
   - Fix in `films/finales.tsx`:
     - `IdiotsGates`: chalk-white stroke, width 2.4, halo 1 at 0.35.
     - rdr2: a 6px ember plus a 12px glow sitting on the ridge, or drop it.
     - Clip the compass leader line inside the plate.
   - In `tintype-deadeye.tsx`, drop the arcs.

7. **MINOR (partly fixed #4): captions still wrap into orphans.**
   - D10-act-3/rm-16: "…AT GOLDEN / HOUR · / RED DEAD…" runs to 3 lines.
   - D40/A40: "GREAT / HALL".
   - D44: "PANGONG / LAKE".
   - m390-19: the counter splits into "III /" and "IV".
   - m390-29: "REDEMPTION / 2".
   - Fix:
     - Change `.act-card-cap` width factor from `0.46` to `0.56` (`globals.css:1064`).
     - Retitle to "GOLDEN HOUR IN THE HEARTLANDS" (proposed).
     - Add `whitespace-nowrap` to the upper-right `<p>` in `card-shell.tsx` (about line 285).
     - Set `white-space: nowrap` on the film titles in credits.

8. **MINOR (new): alt intro splash-down artifact.**
   - At 3.1–3.5s (scratchpad/critic3/A-intro-11..13) the broom plunges into the crest. The foam burst is a rectangle with a hard vertical right edge at x≈810–835/1440, and a stray speck is left in the sky.
   - Fix: in `components/intro/controller.js` (alt branch), hand off to the hero at about 2.9s, before `emitUntil` in `intro-trail-alt.json`.
   - The default flight (Hogwarts → sea → Pearl, with a crossfaded caption) is smooth. Keep it.

9. **MINOR (REMAIN #15): repetition.**
   - The act 3 card plate is the same image as the Beyond band (D32 and A32), same crop.
   - A30 is almost the same as D30.
   - Fix: use the dusk-ridge plate from D45 or a river-only crop for Beyond, and a clearly different alt pen shot.

10. **MINOR: ghost hero caption.**
    - D10/A10-act-1-enter: "THE BLACK PEARL ON THE HORIZON" hangs at about 15% opacity in empty black.
    - Fix: in `hero-stage.tsx:129`, change `EXIT.caption.at` from `[0.25,0.55]` to `[0.1,0.3]`.

11. **MINOR: the compass caption labels nothing on screen.**
    - D20: the caption sits about 200px from a 75px compass.
    - m390-02: the compass only appears about 900px later (m390-03).
    - Fix: in the About section, put the caption `under` the compass and make the compass at least 140px.

Probe script and frames are in `/tmp/claude-0/-home-user-Personal-blog-/32ca8fee-928d-5e0c-94e7-a2ae8772bf3c/scratchpad/critic3/` (`probe.js`).

---

## Disposition after the fix round (`d4a2cd8`, 15:11–16:15 UTC)

These are the fixer's own claims, checked only by eye on the re-captured frames. **Nothing below has been re-judged.**

| # | Issue | Status | What changed |
|---|---|---|---|
| 1 | Hard-edged caption scrims | Fixed | bl/br and act-card outgoing scrims fade out over 240 px. The outgoing scrim wraps only the text. Caption hosts clip on x, which also removed an 85 px sideways overflow the scrims caused in reduced motion. |
| 2 | Act title under the fixed header | Fixed | The cause was two flexible grid rows that each grew to the larger minimum. Cards now measure exactly 900 px at 1440×900 and 720 px at 1280×720. The capture asserts the fit (`checks.json` → `cardFit`). The II / IV counter no longer splits. |
| 3 | Outgoing plates black at enter | Fixed, except alt act 2 | The storm starts lifted, with its crest in view, in both variants. Alt Act IV starts on the lit camp plate (`iconic-camp-alt`). **Open:** A10-act-2-enter still has a dark top, because the alt storm plate's crest is weak. |
| 4 | Tintype develop not seen | Partly fixed | The plate now develops evenly as a latent print while the frame scrolls into view, and the dirt blobs are gone. **Open:** act 3 cannot get a pinned stage, because the site validator allows at most 2 and acts 2 and 4 use them. Its mid frame still equals settled. |
| 5 | Default hero reads as a teal wave; dim caption | Fixed (framing), caption fixed | The default bracket is centred on the Pearl. The Act I card's dark fade was painting over `.hero-cap`; it now sits under the caption. **Not done:** the ship was not enlarged to the ≥ 90 px the critic asked for. |
| 6 | Finale strokes read as bugs | Fixed | 3 Idiots gates are now simple chalk hurdles. RDR2 has a small ember on the ridge. The Pirates compass line is clipped to the plate. The HP gold line fades after it draws. Act 3's trail is faint, and the alt's hachure arcs are dropped. |
| 7 | Caption orphans | Fixed | A caption's last two words stay together. Credits keep "REDEMPTION 2" together. Act 3 is retitled "GOLDEN HOUR IN THE HEARTLANDS" (proposed). |
| 8 | Alt intro splash-down | Fixed | The alt flight hands off at 2.9 s, before the splash, and holds that frame. |
| 9 | Repetition (act 3 plate = Beyond band; A30 ≈ D30) | Partly fixed | The Beyond band opens zoomed in closer than the Act 3 card plate. The Work band and the kill-list always show different pen photos. **Open:** A30 still looks almost the same as D30. |
| 10 | Ghost hero caption | Fixed | The cause: motion's ViewTimeline (WAAPI) fades spring back to full opacity after their range ends. The hero and Beyond band maps now span 0–1. **Open risk:** other partial-range fades may have the same problem and have not been audited. |
| 11 | Compass caption labels nothing | Fixed | The compass is 144 px. On mobile the caption sits right under it. |
| — | Harness: blank m390 contact | Fixed | The mobile/RM sweep re-measures each section after scrolling. |
