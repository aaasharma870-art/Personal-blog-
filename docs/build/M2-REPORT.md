# M2-REPORT: "One Line, Four Lights", Milestone 2 (M2-COMBINED)

**Branch:** `design/three-films`, pushed. `main` is untouched.
**Date:** 2026-09-29.
**Code head:** `d4a2cd8`. This report's docs commit follows it.
**Executors:**
- The local workflow `wf_b15d4c6e-f32` ran until the 05:30 ET handoff.
- The claude.ai/code cloud session `session_01GFF9jaKCW8HAdt3ibcSBE7` ran from 12:35 UTC to the end.

## Summary

**Where M2 stands.** Every film scene on the page now has an iconic plate or a large code motif, plus a MOMENT • FILM caption in the world's fan face. The media behind that is 8 iconic plates plus the new CORRIDOR and PEN plates, each with a default and an alt, and all 18 staged M2 assets. Every SPEC v2 section is enabled (the retired D-3 bands stay off), every act card has a cross-world transition, and every loader exists in a default and an alt.

**Blind stranger test, BLIND-mode frames:**
- Audit: **15/53**
- Re-test #1: **25/43**
- Re-test #2: **35/44**

By world in re-test #2:
- Pirates 10/10
- Harry Potter 11/12
- RDR2 9/12
- 3 Idiots 5/10

**Build health, at `d4a2cd8`:**
- tsc, eslint, `npm run check` (OK, 94 release-gate warnings) and `npm run build` all pass.
- The re-captured `m2-after2` shows 0 console errors and 0 hydration errors, no overflow, and exactly one h1 in every mode.
- Every act card fits a 900 px viewport.

**Not yet proven.** The last fix round (`d4a2cd8`) targeted every remaining blind failure and all 11 critic items, and `m2-after2` was re-captured after it. **None of those post-fix frames has been judged.** The M5 blind test is the next measurement.

**What went wrong:**
1. **The capture harness produced false failures.**
   - The intro's blind shots were taken about 2 s after the captioned ones. That caused every intro "wrong film" result.
   - Fixed scroll offsets went stale after layout changes, so D25, D33 and D34 shot empty or wrong regions.
   - In re-test #1, a capture-timing issue left the alt films screens blank.
   - A mobile sweep timing issue blanked the m390 contact frame.
   - All four are fixed in `tools/capture`. The intro has still never been validly measured.
2. **The first fix round introduced hard-edged caption scrims.** Critic 2 caught them, and `d4a2cd8` fixed them.
3. **A motion-library behaviour caused the ghost hero caption.** motion runs scroll-linked fades as ViewTimeline WAAPI animations, and a fade whose range stops short of 1 springs back to full opacity afterwards. The hero and the Beyond band are fixed. Other partial-range fades have **not** been audited.
4. **Infrastructure:**
   - A container restart at about 14:30 UTC lost only the final integration check, which was re-run by hand and passed.
   - A GitHub credential-service 503 held `c0587f5` unpushed for a while; it has since been pushed.
   - The egress policy blocked the Higgsfield CDN, so the CORRIDOR and PEN plates, paid for at 13:04, could not be downloaded. Aryan lifted the block, and they landed at 14:06.
5. **Real gaps, not tooling:**
   - The ICE lecture hall reads as "a generic classroom" (0.50–0.60).
   - The CORRIDOR plate read as generic architecture (0.40). It was replaced on the page by the pen, so the corridor pair (14 credits) is now unused.
   - Some transition enter frames are dark.
   - Act III cannot get a pinned stage, because the validator allows at most 2. Its develop is never seen.

**ETA.** M2 is done with this commit. What remains is M5:
1. A final blind test of the post-fix frames: 3 judges + critic.
2. If needed, one fix round and a re-capture.
3. QA: anchors and links; overflow at 320/390/1024/1440; reduced motion, no-JS and media-blocked modes; LCP lab; hydration.
4. The final contact sheet and `FINAL-REPORT.md`.

The estimate below uses this session's measured step times: capture ≈ 14 min, judges + critic ≈ 15 min, fix round ≈ 1 h. It is an estimate, not a measurement.
- **Under about 1 h** if the post-fix frames pass.
- **About 1.5–2.5 h** if M5 needs one more fix round.

---

## 1. What shipped in M2

### 1.1 Media (all default + alt; every file registered in `lib/media.ts`)

| Set | Assets | Where it plays |
|---|---|---|
| M2-media lanes A/B (staged overnight, registered by the integrator `f462165`) | MV-04 storm; MV-05a–d voyage stills + JV sequence; MV-06 board-dawn; MV-07 lights-line; MV-08 last-light + MV-09 loop; MV-10 frontier-dusk (+ MV-10m); MV-11 campfire + MV-11L loop; F-3I, F-RD, F-HP films plates (F-HP is the HP screen's alt). F-PC is registered but no longer plays: the Pirates screen shows `iconic-pearl-alt`, because F-PC's intact grey sails were not the Black Pearl (critic 1 #9) | Journey, card I→II, the gauntlet board, the ignite, contact, card II→III, Beyond, Voices (alt), the films chapter |
| Iconic plates (M2 iconic lane, 140 cr) | `iconic-pearl`, `-hall`, `-express`, `-ice`, `-drone`, `-camp`, `-wanted`, `-deadeye` | Act I card; Act IV card; films HP screen; card I→II + Optuna head; Systems band; Voices; the WANTED board; the Dead Eye alts |
| M2 finish (28 cr) | **`iconic-corridor`**, **`iconic-pen`** | PEN: the Work head band (`iconic-pen-alt`) and the kill-list inset (`iconic-pen`); the two sides swap per variant. CORRIDOR: registered and accepted, but **not placed** since `d4a2cd8` (blind 0.40) |

`lib/media.ts` now holds **76 accepted, 18 integrated and 7 received** entries. No text is baked into any plate: the WANTED lettering, the chalk and every caption are HTML/SVG. The plates contain no people or faces.

### 1.2 The caption system
- **`SceneCaption`** (`components/primitives/scene-caption.tsx`) shows MOMENT • FILM in the world's fan face: Pirata One (pirates), Kalam (idiots), Rye (rdr2) and IM Fell English (hp).
- **Placements:** `bl`, `br`, `head` and `under`. Mobile always uses `under`.
- **Scrims:** feathered, with a 240 px horizontal ease.
- **Wrapping:** the last two words of a name never break apart.
- **Data:** `lib/film.ts` `captions` has 48 keys, every one `status: "proposed"`. The lettering derives from the captions, so the font subsetter cuts exactly the glyphs used.
- **Act card titles:** every card shows its film title at display size (PIRATES OF THE CARIBBEAN, 3 IDIOTS, RED DEAD REDEMPTION 2, HARRY POTTER).
- **Header:** the header act label reads `ACT II · 3 IDIOTS` and so on.
- **Overrides:** O-1 to O-7 (RECOGNIZABILITY §3) put this in place, and each can be reversed in data.

### 1.3 Every section and scene (page order; D = default, A = alt)
- **Prologue (HP):**
  - Play screen (D: candles; A: Marauder's footprints).
  - Broom flight video with the caption hand-off HP → Pirates. The alt now hands off at 2.9 s, before the splash-down.
- **Hero (Pirates):**
  - The Black Pearl at sea, with a persistent `cap.hero`.
  - D: the bracket is centred on the Pearl.
  - A: a spyglass bracket with a 1.18× zoom.
- **Act I card:**
  - `iconic-pearl` opens by aperture from the hero's horizon.
  - The Jolly Roger is registered to the mast.
  - An open-lid compass sits on the brass course.
  - A: the chart to Isla de Muerta.
- **About:** Jack's compass at 144 px, lid open. Its needle turns to the hovered pillar.
- **Journey:** the JV voyage sequence plus the MV-05 stills, with step captions: Port Royal, the fog, Calypso's storm, and "bring me that horizon".
- **Card I→II:**
  - MV-04 storm → `iconic-ice`, with the horizon registered to the chalk ledge.
  - Chalk FIG. 0, plus **Rancho's homemade drone chalked on the board**.
  - A: a duster wipe reveals the drone.
- **Work:**
  - Head band: Virus's astronaut pen.
  - The gauntlet on the MV-06 ICE board, with a Kalam chalk header and the `aalIzzWell` settle.
- **Trading_Algos and Optuna chapters:**
  - Chalkboard-framed blueprints.
  - Optuna's head band is "WHAT IS A MACHINE?", with the lettered machine definition.
- **Experiment:** **no film styling**, by rule H4.
- **Systems:** the `iconic-drone` band.
- **Kill-list:**
  - The pen inset and caption at the header only.
  - The rows stay austere (O-5).
- **Films chapter (house):**
  - Four screens: the Pearl by moonlight, the yellow scooter at Pangong, the Heartlands at dusk, and the Hogwarts Express.
  - Each has a lettered quote and a finale stroke.
  - 24vh world-deep seams between screens.
- **Card II→III:**
  - The tintype develops into MV-10 as the frame comes into view.
  - A: Dead Eye grade and X marks.
- **Beyond:**
  - The MV-10 band, framed closer than the card.
  - The satchel redrawn with his real kit.
  - The WANTED handbill mounted on `iconic-wanted`, with Rye lettering.
- **Writing:** Arthur's journal, with the sketch page opening beside the heading.
- **Voices:**
  - D: `iconic-camp` with a scrim.
  - A: MV-11 plus the MV-11L loop.
- **Card III→IV:**
  - Embers from the camp fire become candles, then the Great Hall. The hall leads at the middle.
  - A: Lumos, starting on the lit camp.
- **Principles:**
  - D: the Marauder's Map (parchment, creases, inked corridors, footprints, banner).
  - A: the Lumos ceiling with a candle per principle.
- **Contact:** a floating candle (MV-08 + the MV-09 loop).
- **Credits:**
  - Each title is in its own face (O-6).
  - The Snitch is visible at rest.
  - The Time-Turner is 24 px and the Hallows 16 px.
  - Ends on the lettered "Mischief managed."

### 1.4 Transitions (RECOGNIZABILITY §8, T1–T12)
All twelve are built with opacity and transform only.
- T1: caption hand-off.
- T2: hero feather.
- T3: storm → ICE seam and chalk dust.
- T5: grid → deep crossfade.
- T6: films seams.
- T7: stacked grounds into the tintype.
- T8: the tintype becomes the Beyond band.
- T10: embers → candles → hall.
- T11: hall → parchment or candles.
- T12: last light → credits.

Under reduced motion, Pause and no-JS, every card shows its static settled title card with its caption.

### 1.5 Loaders (4 worlds × default/alt, card size + route size)

| World | Default | Alt |
|---|---|---|
| Pirates | open-lid compass + a black-sailed ship on the course | ship in a bottle |
| 3 Idiots | mini ICE chalkboard with the drone and the pen in chalk | chalk derivation on the same board |
| RDR2 | journal sketch | Dead Eye X marks |
| HP | candles lighting along the ink line | Marauder's Map footprints |

Route cards are now 216 px (were 160), with a film title and a caption under each.

### 1.6 Review and fix rounds (cloud session)

| Step | Commit(s) | What happened |
|---|---|---|
| eslint + build green | `57f89bb` | eslint now ignores the CommonJS capture harness |
| Capture harness + `m2-after` | `6dd10db`, `f85e60f` | 1440 captioned/blind, alt, loaders, 390, reduced motion; waits for images |
| Blind re-test #1 + critic 1 | `729becb` | 25/43; 15 critic issues (`m2-review/BLIND-1.md`, `ART-DIRECTOR.md`) |
| 3 Idiots scenes + fix round 1 | `4249438` … `cb1b904` | CORRIDOR + PEN plates; 5 parallel builders (act cards, HP, films + sections, hero/intro, loaders + chrome) |
| Scorer + code review | `c0587f5`, `33b08f7` | `tools/capture/anon.mjs` + `score.mjs`; one plausible finding (`CODE-REVIEW.md`) |
| Assembly + `m2-after2` | `daac296` | 164 frames, all checks green |
| Blind re-test #2 + critic 2 | `f773e75` (checkpoint; its message says 35/42, but the correct figure is 35/44) + this commit | 35/44 (`BLIND-2.md`); 11 critic items (`CRITIC-2.md`) |
| Fix round 2 | `d4a2cd8` | All critic items + the blind failures; harness fixes; `m2-after2` re-captured |

---

## 2. Blind results, before and after

| Run | Frames judged | BLIND-mode pass | All frames with a film | Wrong-film frames |
|---|---|---|---|---|
| Audit (pre-M2, `m2-audit`) | 53 | — (all frames: **15/53**) | 15/53 | 1 |
| Re-test #1 (`m2-after`, `729becb`) | 77 | **25/43** | 38/75 | 5 |
| Re-test #2 (`m2-after2` @ `daac296`) | 84 | **35/44** | 52/82 (56/81 with the corrected scorer) | 8 (2 corrected) |
| Post-fix `m2-after2` @ `d4a2cd8` | — | **not judged** | — | — |

By world (BLIND mode, re-test #2): Pirates 10/10 · HP 11/12 · RDR2 9/12 · 3 Idiots 5/10.

The scene-by-scene final table is in `RECOGNIZABILITY.md` §11.

**Passing now:**
- the prologue play screen
- the hero (marginal)
- Act I card
- About
- Journey
- Systems
- the kill-list
- all 8 films screens
- the Act III and IV settled cards
- the Beyond band
- the WANTED board
- Voices (both variants)
- Principles (both variants)
- contact
- all default loaders

**Failing on record:**
- **Act II card settled, 0.55–0.60.** Fixed after re-test, not re-judged.
- **Work head band (corridor), 0.40.** Replaced by the pen, not re-judged.
- **Writing head, 0.55–0.60.** Fixed after re-test, not re-judged.
- **Alt card loaders for HP and RDR2.** Not fixed.
- **Some transition enter/mid frames.**
- **Capture misses (D25, D33, D34).** Re-aimed, not re-judged.
- **The intro beats.** Never validly measured.

---

## 3. Checks (at `d4a2cd8`)

- `npx tsc --noEmit`, `npx eslint .` and `npm run build` pass. The build is Next 16.2.9 (Turbopack) with 9 static routes.
- `npm run check`: **OK, 94 warnings**, all of them release-gate notes or data notes:
  - 78 media awaiting Aryan's Check L2 countersignature
  - `branchPreview` ON
  - 9 draft strings
  - 110 proposed strings + 12 quotes
  - 5 community-sourced quotes
  - 4 `variantOf` notes
  - 2 received alternates
  - 1 nav-label length note
- `m2-after2/checks.json`:
  - 0 console errors and 0 hydration errors
  - `overflow: []`
  - h1 = 1 at 390, 1440, 1440-alt, 390-after-scroll and 1440-rm
  - `cardFit`: act 2, 3 and 4 are 900/900 in both variants
- Critic 2's live probe found reduced motion fully static across 8 sections: 0 running animations, 0 playing videos and 0 rAF callbacks.

---

## 4. Credits (Higgsfield)

| Line | Credits |
|---|---|
| M2-media lanes A + B (overnight, before M2-COMBINED) | 321.0 |
| **M2 iconic lane** (8 plates × default + alt, incl. 4 edits) | **140.0** |
| **M2 finish** (CORRIDOR ×2, PEN ×2) | **28.0** |
| M2-COMBINED total (iconic + finish) | 168.0 |
| Program total since the 1,200 grant | 693.5 |
| **Balance now** | **506.5** |

- The reserve rule (≥ 150) and the MEDIA-PLAN v2 floor (250) were never approached.
- No regeneration was needed in the M2 finish; its lane has 42 of 70 unused.
- Ledgers: `media/LEDGER-m2iconic.md`, `media/LOG.md`.

---

## 5. Open issues (carry into M5)

1. **Nothing after `d4a2cd8` has been judged.** Every "fixed" claim for the fix round is the fixer's own view of the re-captured frames.
2. **3 Idiots is the weakest world** (5/10 blind). The ICE lecture hall reads as a generic classroom (S07, and S22's plate). The chalked drone and the pen band are the bets.
3. **Dark enter frames:**
   - The Act III enter frame (D and A).
   - A10-act-2-enter's top: the alt storm plate has a weak crest.
   - The alt Act IV enter was fixed in code (it starts on the lit camp) but has not been re-judged.
4. **Act III's develop is invisible.** There is no pinned stage, because the validator caps pinned stages at 2 and acts 2 and 4 use them. Its mid frame equals its settled frame.
5. **The alt card loaders for HP and RDR2 fail** (0.45–0.60). At about 120 px there is no room for detail.
6. **The alts barely differ in places.** A30 ≈ D30. 22 alt frames, the alt journey among them, were near-identical to their defaults when blind and were judged once.
7. **The default hero's Pearl is still about 35 px.** The bracket is centred on it, but it was not enlarged.
8. **Scroll-linked partial-range fades** may spring back to full opacity, like the ghost hero caption did. Only the hero and the Beyond band have been fixed; the rest are unaudited.
9. **`iconic-corridor` and `-alt` are registered but unused.** Keep them for another scene, or drop them.
10. **Code review (`m2-review/CODE-REVIEW.md`):** during the ALT hero's spyglass bracket opening on mobile, the zoomed still can overhang its box. This was not addressed and not seen in a browser.
11. **The intro flight beats need a valid blind + captioned test** with the fixed harness.
12. **Data warnings:** four `variantOf` notes (`work.head.alt`, `beyond.band.alt` and `voices.fire.alt` play plates that are not registered as alternates) and the nav label "Trading_Algos" (13 characters).

---

## 6. Flags for Aryan (none blocks the build; all are needed before `main`)

- **Check L2 countersignatures:** 78 media entries await your sign-off, including all iconic plates and the CORRIDOR and PEN plates. See `media/LEDGER-m2iconic.md` and the M2 finish table in `media/LOG.md`.
- **Proposed copy:** every caption is `status: "proposed"`: 110 proposed strings and 12 quotes, gated by `film.copySignedOff`. The captions that are new or changed since the plan's table (RECOGNIZABILITY §6) are:
  - "THE ASTRONAUT PEN ON VIRUS'S DESK"
  - "THE HOMEMADE DRONE, CHALKED AT ICE"
  - "GOLDEN HOUR IN THE HEARTLANDS"
  - "CALYPSO'S STORM"
  - "WHAT IS A MACHINE?"
  - "THE DRONE AND THE ASTRONAUT PEN"
  - "THE BLACK PEARL BY MOONLIGHT"
  - "LUMOS — THE ENCHANTED CEILING"
  - "THE BLACK PEARL ON THE HORIZON"
- **Draft strings:** 9 still render on this branch. They are the 4 act loglines, the 4 film reasons ("why this matters to me", for you to rewrite) and the handbill reward line.
- **`film.branchPreview` is ON.** Turn it off before `main`.
- **Overrides O-1 to O-7** (RECOGNIZABILITY §3):
  - fan faces for captions and card titles
  - the 56 KB display-font budget
  - Rye as the RDR2 face (the RFN note)
  - the opening card in Pirata One
  - the kill-list header cue
  - four faces in the credits
  - the kraken caption
- **Community-sourced quotes:** Q-PC-1, Q-PC-3, Q-3I-3, Q-RD-1 and Q-RD-2 need verifying in the works before they are marked "confirmed".
- Still open from the plan:
  - drone sensitivity (S10: the caption names no character)
  - the unverified stopwatch (it is not used as a claim)
  - `iconic-express`'s famous viaduct angle
- **Unused plates:** decide whether `iconic-corridor` and `-alt` stay.
- The legal and honesty audit was **not** run, at your request.

---

## 7. How to view the frames

- Open **`docs/build/m2-after2/index.html`** locally. It is the post-fix contact sheet (164 frames): intro, loaders, desktop D/A, alt, mobile 390 and reduced motion.
  - The PNGs are **gitignored**, so they exist only where the capture ran.
  - `manifest.json` (frame → world, mode, moment) and `checks.json` are committed.
- To re-shoot:
  1. Build.
  2. Run `next start -p 3161`.
  3. Run `node tools/capture/scenes.js` (see `tools/capture/`).
- To build a blind set: `node tools/capture/anon.mjs <framesDir> <outDir>`, then score with `node tools/capture/score.mjs`.
- Judged sets and verdicts:
  - `docs/build/m2-review/BLIND-1.md`, with `judge-key.json` and `verdicts-j*.json`
  - `BLIND-2.md`, with `judge2-key.json` and `verdicts2-j*.json`
  - The critics: `ART-DIRECTOR.md` and `CRITIC-2.md`.
- The superseded pre-fix frames (`docs/build/m2-after/`) are also local-only.
