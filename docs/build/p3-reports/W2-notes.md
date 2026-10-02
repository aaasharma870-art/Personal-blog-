# W2 integration notes (Phase 3, wave 2 assembly step A, 2026-10-02)

The W2 integrator merged the six W2 builder returns (CARDS, PLATES, WORDS, HUNT, GL, SOUND; checkpoint `5d505cf`) and applied every handoff addressed to the W2 assembler or to a W1/W2 file with no owner. The W2 gate itself (plan §10.1 #5, §10.2: probes, captures, `beats.mjs --write`, the 390 / 1024 diffs) is the verifier's next step. Handoffs for wave 3 are in `docs/build/p3-handoff/deferred-w3.md`, copied unchanged. The RELEASE output is `docs/build/p3-reports/W2-release.txt`.

## 1. Handoffs applied

| # | Source | Change |
|---|---|---|
| 1 | CARDS #2 (BLOCKING) | `lib/smooth-scroll.ts` `cardTravel()` measures the PIN WRAPPER (`:scope > [data-act-card-pin]`), and `landAtY()` starts from the pin's top. Before, `#act-1` landed at p ≈ .86 because the opening's program block is a sibling inside the section (section 2383 px, pin 1710 px at 1440×900). Smoke test: all four anchors land at p .470–.471. |
| 2 | CARDS #1, W2 gate | `lib/film.ts` `acts[].landAt` = .47 (spec .45: inside the settle .45–.50) and `maskOrigin` act-1 [.519, .5], act-2 [.507, .505], act-3 [.499, .457], act-4 [.472, .469]. |
| 3 | CARDS #3 | The dead Phase-2 travel block (`--act-card-travel: 58vh` + `[data-act-card-long]`) is gone from `app/globals.css`; travel.mjs no longer warns. |
| 4 | CARDS #4 | Already in place: the egg runtime (W2-HUNT) toasts `hidden-kraken` with its hunt line ("Egg n of 12 · {egg.hunt.name.pc-kraken}", world pirates), and the card's own `markFound` is idempotent, so a queued trigger still toasts once. Added for HUNT #3: the long-look auto path is skipped and nothing is triggered or counted while the eggs are off (session or registry), as the hotspots binder does. |
| 5 | CARDS #5 (a) | `GlCardSpec.inset` (new, optional; frame fractions + corner radius in frame heights). `pin-build.ts` passes the tintype's PLATE (40, 22, 920 × 374 of 1000 × 418, r 6). Shaders: new uniforms `uInset`, `uInsetR`, the `PL()` rounded-rect SDF and `inset()`. `develop` settles its bone border to the inset plate's 1 px line on `uDeep` (full-bleed cards keep the old "settles away"), and `deadeye` draws the deep margin and draws the bone line in at the end. Checked in the browser under `?gl=force`: the settled develop frame shows the inset plate on the deep margin with the hairline border. |
| 6 | CARDS #5 (b) | `lib/gl/plan.ts`: `wheelR` is read as a radius pair (x of the plate width, y of its height), scaled by the from-cover box: `uShape.z = max(rx·w·A, ry·h)`, clamped to .05–.15. The handoff's `2·max(…)` is the css tier's square BOX (a diameter, pin-build.ts). The SDF's unit is a radius, so GL takes half of it and the two tiers draw one wheel. Checked: the wheel is about .09 frame heights in radius (it was oversized). |
| 7 | PLATES #2 | `card-p3.tsx` SeqCanvas draw-effect deps gain `fs.ready`. |
| 8 | PLATES #1, #7 | #1 needs no change (CARDS' push #1 is 1 → 1.3 / 1.15 about the stern, as the stage expects). #7: `"stage:cover": void` added to `lib/events.ts`. |
| 9 | deferred #7 | `gl-gate.tsx` already had `registerChunk(loadFrame)` (module-level loader, tier "gl"). Added `requestScrollRefresh()` when the GL layer mounts. |
| 10 | deferred #6 (WebGL ships) | `capabilities.tsx` renders `systems.pencil.body.p3` on every device (it is scoped, so it is true everywhere; `boot:hidden` removed) and adds `systems.meta.webgl` to META. `honesty.mjs` DEFERRED is now empty. The M2 key `systems.pencil.body` ("no WebGL, just native scroll") is deleted from `lib/film.ts`, because the honesty lint reads every copy string, rendered or not. Phones: the pencil line and the Meta list change at 390, which spec §13 lists as an intended 390 change. |
| 11 | deferred #8 | "No WebGL" overrides recorded where they live: SPEC.md l.6 and §11.1 (the clause is now superseded), SPEC.md §2 row 7 and SM-7, ICONS.md IC-3I-06 and the systems caption row. MOTION-REPORT, DESIGN and AUTOPILOT have no WebGL clause. |
| 12 | deferred #13, SOUND | The 10 TTS files are copied to `public/audio/`. The SOUNDS.md rows were already written by W2-SOUND from `docs/build/media/p3/tts.md` §5. `npm run check`'s sound check passes, with two size warnings (solemn 21.5 KB and mischief 10.7 KB WebM) and five release gates (below). LOG.md records the registration. |
| 13 | HUNT #1 | The header's Lumos / Nox tooltip is wrapped in `<EggHint egg="lumos">`. |
| 14 | WORDS #8 | `lib/variants.ts`: `words.scrub` / `words.physical` / `words.flythrough` files gain `components/words/bind/**` (the title pieces already list `components/words/**`). |
| 15 | GL, SOUND, HUNT (blocking handoffs between builders) | Verified, not re-done: MediaFrame handles `gl:frame` / `gl:release`; CARDS passes `choice`; in-frame loops mount from p ≥ .50; egg-host typed words, the Snitch and the hotspots all go through `triggerEgg`. |

## 2. Integration fixes beyond the handoffs (budget)

The builders' tree (`5d505cf`) put the "/" first load at **+6,050 B gz JS and +6,343 B gz CSS** against the pre-Phase-3 base, over the CSS line (6,144) and 94 B under the JS line. Two fixes:

1. **`lib/hunt.ts` no longer imports `lib/content`.** `worthyOfPen()` used `featuredProjects.length + survivors.length + killList.length` as its default. lib/hunt is lazy, but `lib/content` is a SHARED first-load module (header, sections), and Turbopack's export usage is global. So a lazy import of those three exports made the first-load copy of `lib/content` ship them: **+1.86 KB gz** on "/" (found by source-map attribution against the base). The default is now the RENDERED ledger rows (`[data-ledger] li[data-row]`, ledger-reckoning.tsx), which are the same rows. The rule for wave 3: a lazy module must never import a `lib/content` export the first load does not already use.
2. **Lazy-only CSS rides its lazy chunk.** `app/p3/cards-pin.css` holds cards.css §3–§5 (the lower-bar phases, the GL-replaced layers, the title mask, the bars, the shape, the weather, the SEQ canvas, the puff, the kraken mass and tip) and is imported by `card-p3.tsx`. `app/p3/game-lazy.css` holds the hunt panel, the Lumos veil, the wand bloom and the post-credits scene, and is imported by `hunt-panel.tsx`, `egg-runtime.tsx` and `post-credits-scene.tsx`. Everything the server renders stays in the layout partials: the pin travel, the subtitle, the kraken button, the iris rim's resting state, the chip, the hotspots and the post-credits tail. Turbopack emits each file as a CSS chunk that its JS chunk loads. The smoke test reads the styles applied once card-p3 mounts. This is a deliberate exception to DP-10 (one layout-imported partial per owner), in the spirit of DP-13 (facade + lazy impl). `lib/variants.ts` `files` list the new files.

## 3. Budgets

**"/" first load** (gzip -9 of every script and stylesheet the built `index.html` references; the same set the bundle probe fetches):

| build | JS gz | Δ JS | CSS gz | Δ CSS |
|---|---|---|---|---|
| pre-Phase-3 base (`5aa4587`) | 439,092 | – | 29,433 | – |
| W1 (report) | – | +1,524 | – | +3,423 |
| W2 builders (`5d505cf`) | 445,142 | +6,050 | 35,776 | +6,343 |
| **W2 integrated** | **443,314** | **+4,222** | **34,728** | **+5,295** |

Headroom for wave 3: about 1.9 KB gz JS and 0.85 KB gz CSS. The `bundle.mjs --compare` probe run is the verifier's.

**Lazy chunks: deviations recorded from the builders** (none blocks; each is over a soft line in spec §12.1 or plan §6, inside the 115 KB lazy total):
- **GL** (W2-GL handoff): the first GL chunk is about 11.7 KB gz (gl-lock, plan, cover, shaders, textures, transition-gl, gl-frame), `sdf-title` is 1.3 KB on the first GL title, `gl-debug` is 0.27 KB (debug only) and the facade is 0.95 KB. The total over a full desktop scroll is about 12.8 KB gz against the 8 KB line. The spec's 3–4 KB shader + 1.5 KB SDF estimate left out the lock and plan runtime that §3.3 requires. The W2 inset uniforms add a few hundred bytes of shader source (not measured separately).
- **Plates** (PLATES #8): first load +252 B (media-frame) and +235 B (use-frame-sequence); the four facades are about +0.94 KB once cards import them; plates.css is about 0.6 KB gz render-blocking CSS; the stage/plates engine chunk went from 6.6 to 11.0 KB gz (spec line ≤ 8).
- **Sound** (W2-SOUND): the header (static store + toggle) is about 1.86 KB gz; the lazy store-impl + engine chunk is about 10.5–10.7 KB gz against the ≤ 10 KB audio line, because the split moved code out of the first load.
- **Words**: about 0 first-load JS from the primitives; the in-character helpers are about 0.2–0.3 KB gz in client chunks; words.css is about 0.35 KB gz.
- **Media**: SEQ-HALL is 3.66 MB against the 1.6 MB sequence budget (flag carried since W1).

## 4. Documented deviations (CARDS #7, WORDS #9, landAt)

- **landAt .47, not the spec's .45** (CARDS): the anchor lands inside the settle (.45–.50), with the new world fully shown and the damped p at rest.
- **Global-bars → card hand-off rule: not applicable in W2** (CARDS #7). There are no global letterbox bars over a pinned card in this wave. W3-CINEMA owns `letterbox` scenes.
- **The title.mask ALT** (CARDS #7) is two deep bands (14 %) that fade in over p .60–.68. Their scaleY goes to 0 by p 1, and the h2 rises back at .68.
- **The static pinned card** (a mid-session Pause) shows the h2 and the caption, with the subtitle screen-reader only. Cards with RM at boot keep the P3-0 layout (CARDS #7).
- **Devices ≥ 64rem with a fine pointer but no hover** lose the old Phase-2 travel, because the pin gate includes `(hover: hover)` (CARDS notes).
- **Words: the scrub** runs on a native document ScrollTimeline (WAAPI opacity), with a scroll-synced fallback. The ALT line sweep is word-granular. The pirates blot goes .5 → .25 → 0. The collapse hook is `[data-collapse]` (WORDS #9; spec Appendix A / §8 / §11.5).
- **Plates**: depth DEFAULT on the about exit frame only on ALT (iconic-pearl has the live L01 loop). `cue.grade` is a static multiply layer that fades in with progress (beyond ends at rgb(193 179 150)), a P3-11 taste call. Backdrop weather appears only in the outer gutters (~64 px at 1440).
- **Hunt**: Lumos resumes motion at the trigger (a delayed resume made the sound engine drop `lumos-bell`); Nox keeps dim-then-Pause.

## 5. Checks

- `npx tsc --noEmit`: clean. `npm run check`: OK (78 warnings). `npx eslint .`: clean. `npm run build`: green (14 static routes).
- `RELEASE=1 npm run check`: **54 errors**, all Aryan-owned or W3-gated, none a bug:
  - 40 × Check L2 `aryan:pending` (the 19 loops, their 19 frame-0 stills, SEQ-HALL and its end still);
  - 1 × the unsigned list: **100** strings (76 wired, 24 not yet). Three are new from W2-HUNT: `egg.hunt.found`, `egg.hunt.unfound`, `egg.hunt.reset.cancel`;
  - 5 × `#9 sound: tts-<line> … awaits Aryan` (new, by design: W2-SOUND's release gate for unapproved quotations and unconfirmed Higgsfield terms; its handoff asks to add them to DP-9 as the same kind as Check L2. PHASE3-PLAN DP-9 now says so);
  - 8 × beat pacing (`[P3 #1]` 2 gaps B24→B25 at 1440 and 1024, `[P3 #2]` 5 competing-star overlaps, `[P3 #12]` 1). They are identical at the W1 commit `dcd92ea` and at `5d505cf`: static estVh estimates that the W3 hosts' beats and `beats.mjs --write` (W2/W3 gate) resolve. They are not new in W2.
  - The `systems.pencil.body` honesty deferral is gone.

## 6. Smoke test (integrated build, `next start -p 3161`, headless Chromium 1440×900, `/?skip=intro&debug=cards`)

- **0 console errors, 0 hydration errors, 0 page errors.** One warning under `?gl=force`: Chromium headless cannot parse the H.264 `codecs` string.
- Pin geometry: opening 810 px travel (90vh), seam 990 (110vh), tintype 810, ignite 990; the opening section is 2383 px with the program block, and its pin is 1710.
- A 197-step wheel scroll through the whole page: every card's damped p reached 1 through phases a → b → m → e, the GL tier went css → gl with `data-gl="on"` on all four.
- Anchors (`#act-1`…`#act-4`, an in-page link through smooth-scroll): each lands at p .470–.471 in phase `a` (settled; p and the geometry agree).
- At each pin's end: p = 1, phase `e` on all four.
- The lazy CSS is applied once card-p3 mounts (title mask, weather, SEQ canvas, kraken tip: `position: absolute`).
- `?gl=force`: the tintype develop settles on the inset plate, and the ignite wheel is the right size; `__gl` reports 1 context and no compile, link or loss error.
