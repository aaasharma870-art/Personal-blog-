# W1 handoffs deferred to waves 2 and 3 (collected by the W1 integrator, 2026-10-01)

Source: scratchpad/p3/w1/returns/B1-*.md. Everything addressed to a W1 file or the W1 assembler was applied in the W1 commit; the rest is below, grouped by the builder that owns the target files next.

## W2-CARDS (act-card files, lib/motion.ts in W2, travel.mjs in W2)
1. (B1-STAGE #1, B1-BEATS #3) Give the act-1 program block `id="act-1-program"`, class `stage-backdrop`, and render `<StageScrim scrim={film.acts[0].stage.scrim}/>` as its first child inside a `relative isolate` box. Until then the stage skips the program cue and the pearl shot starts at #about. (The `act-1-program` anchor id is named by lib/page.ts + lib/film.ts stage cues.)
2. (B1-SCROLL #3) Keep the sticky element marked `.act-card-stage` or `[data-card-stage]` inside the `[data-act-card]` section with id act-n (`scrollToTarget('#act-n')` lands at landAt × travel measured from it).
3. (B1-BEATS #7) Tag the card beats: B03/B04, B13/B14, B36/B38, B48/B50, impacts, subtitles, B04-spray, B14-chalk, B48-fireflies, B50-motes, B35-sun; register scroll stars on the pin spacer, not the sticky frame; W2-CARDS owns travel.mjs in W2.
4. (W1 assembler, media) `card-opening.push`: SEQ-PEARL FAILED Check L2 (flash frames + figure-like bow-rail silhouettes; not registered). lib/variants.ts now names DEFAULT = `code-push-l01` (the code push on L01, 1 → 1.3 about the stern) and ALT = `code-rack-l01` (a rack-focus crossfade on L01 from the soft to the sharp rung, then a shorter push 1 → 1.15). Build both. `card-ignite.push` DEFAULT plays the registered `SEQ-HALL` (72 frames, 1280×720, `sequenceFrames("SEQ-HALL")`; end still `SEQ-HALL-end`; FLAG 3.66 MB vs the 1.6 MB budget: fetch within one viewport, desktop only; consider 36 frames). The push is only 1.07×: add a code scale on top if the title mask needs more travel.
5. W2 assembler: apply CARDS' `landAt` / `maskOrigin` to lib/film.ts (placeholders .45 / [.5,.5] today).

## W2-GL + the W2 assembler (when WebGL ships)
6. (B1-BEATS #1/#2, orchestrator decision) Render `systems.pencil.body.p3` instead of `systems.pencil.body`; add `"systems.meta.webgl"` to META in components/site/capabilities.tsx; remove the DEFERRED entry in scripts/checks/honesty.mjs. Until then RELEASE stays red on the two `systems.pencil.body` honesty gates (W1 kept today's text on the dev branch; main untouched). NOTE: the W1 text says "just native scroll", which is no longer true on desktop now that Lenis ships.
7. (B1-SCROLL #2) components/gl/gl-gate.tsx: call `registerChunk(() => import(<the GL chunk>))` once on mount (DESKTOP_FINE, a stable module-level loader) so the warm-up ladder prefetches it; call `requestScrollRefresh()` when the GL layer mounts (the stage gate/stage got the same in W1).
8. Docs (W2 assembler, PHASE3-SPEC Appendix A): record the "no WebGL" overrides where they live: SPEC §11.1 / SM-7 `systems` wink (l.327) / l.843 "no WebGL" clause, ICONS IC-3I-06 (the "true note: the site uses no WebGL (native scroll, CSS and SVG first)"), `capabilities.tsx:116`. W1 recorded only the scroll + type + travel + validator overrides.

## W2-PLATES (stage refinements, media-frame, stage.tsx/stage-video.tsx in W2)
9. (B1-STAGE #2) Not built in W1: `cue.weather` (WeatherLayer), `cue.depth`, static `cue.grade`, and `playOn="never"` for inline plates the stage covers. Hooks: `.stage-layer > .stage-cam` (camera transform) with `.stage-video-host`; window = `[data-stage-window] > [data-stage-window-host]`. Loops light up via `loopFor(plate)`: 19 loops are now registered (L01 L02 L05 L06 L08–L12 L14–L23), so every plate below has a live loop: iconic-pearl, iconic-hall, IN-01, MV-05a, iconic-ice, MV-06, iconic-corridor, MV-07, MV-04, iconic-pearl-alt, iconic-wanted, iconic-ice-alt, iconic-pen, iconic-pen-alt, MV-05b, MV-05d, iconic-deadeye, F-3I, F-HP.
10. (B1-BEATS #6, superseded) The act-1 program / about cue 1 stays `iconic-pearl` (SEQ-PEARL failed; no end still). The ignite / about stage end still for push-in #3 is `SEQ-HALL-end` if a cue wants it.
11. (B1-INTRO #5) FLIGHTS['IN-02'].loopAt = 0.5 only if the MV-03 match-cut re-blend lands (not staged → leave unset). L05 (IN-01 living play screen) is now registered and lights up via `loopFor("IN-01")`: verify the B00/L05 path.
12. New plate marks are registered (PHASE3-SPEC §7.2 `registerLine`): MV-10/-alt `horizon`, iconic-deadeye `horizon`, iconic-camp/-alt `lake` `wheel` `wheelR`, iconic-hall/-alt `tableL` `tableR`.

## W2-SOUND / W2 assembler
13. TTS (5 lines, staged `docs/build/media-staged/p3/accepted/audio/`): register in `public/audio/<id>.{webm,mp3}` + SOUNDS.md rows (draft in `docs/build/media/p3/tts.md` §5); Aryan to listen and approve the two quotation lines.

## W3-IDIOTS
14. (B1-STAGE #4) Visual check inside the split: the ICE board breaks out over the whole grid (`[data-stage-wide]`, opaque ground); the ChalkDrone beside the caption now sits over the window column on trading-algos: check at 1440/1024, hide/move under the boot gate if it fights the plate.
15. (done in W1 by the integrator) B21-circle is tagged on the trading-algos limitations `<RanchoCircle>`; B24 on optuna's last metric note (metric-tile.tsx). B21 (the scrub sentence, P3-7) is W3-IDIOTS.

## W3-RDR2
16. (B1-RASTER #4) B46 is tagged on the voices camp stage root (campfire-stage.tsx, both variants) though it is declared on the writing item; if the beats probe needs B46 inside #writing, move it to writing.tsx's dusk div.
17. (B1-TYPE #7) `font-world-hand` for rdr2 journal heads/dates (≤ 4 words).

## W3-PIRATES / W3-HP / every W3 world builder
18. (B1-RASTER notes) Tagged time stars (B17, B22, B43, B44, B52) do not pass `useEnterOnce({ star })` yet: the world builders wire the spotlight.
19. (B1-TYPE #7) `font-world-lead` for idiots board notes; `data-house-type` on new chrome (fast lane, hunt chip, sound toggle, director's cut).

## W3-CINEMA
20. (B1-STAGE #6, optional copy) The credits row "Libraries · On desktop: GSAP (standard no-charge licence) · Lenis (MIT)" is hard-coded like the Type row; could move to a `credits.libraries` copy key (proposed, unsigned → Aryan signs).

## Aryan (decisions / signatures; not a builder)
21. Sign the unsigned copy (96 strings incl. `fastlane.label` "Skip to the research", `titles.1–3`, the `systems.meta.*` lines).
22. Countersign Check L2 on the 40 new P3 media rows (lib/media.ts `aryan:pending`).
23. 19 of 25 loops pass (one short of "≥ 20"); SEQ-HALL 3.66 MB vs 1.6 MB budget; L12 storm composition flag; IM Fell English SC (44 KB) loads with the page on a first visit for the hp captions (B1-TYPE note).

---

# W1 fix stage (the W1 fixer + gatekeeper, 2026-10-01; full report `docs/build/p3-reports/W1.md`)

Numbering continues from above. Item 20 (the libraries credit as a copy key) is **done**: `credits.libraries` (p3, unsigned) is rendered by the footer.

## W2-CARDS
24. (P3-2 #11, inherited: base does the same) Pause mid-scroll CLS 1.0 on act-2 and the paused-reload reflow (layout-gates). Key the card travel / pin mode on the boot gate only (`@media (min-width:64rem) and (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)` + `html.js:not([data-motion-boot="paused"])`), so Pause and a paused reload keep the same box heights.
25. (visual judge 4, not a W1 regression) The act-2 chalk label is clipped at 1024, and act-card images sit 17 px outside the gutters at 1024.
26. (visual judge 7, not a W1 regression) The outgoing caption shows over the wipe.
27. (judge 12) The act-1 caption is orphaned until the act-1 program block (item 1) lands.

## W2-SOUND / W2-HUNT
28. The sound probe's `eggs.typed` and `eggs.lumos` fail until the egg cues are wired. Pause (2 ms) and RM (37 ms) now pass: lib/audio/store-impl.ts suspends the context at once when `motionOffNow()`.
29. TTS registration is still item 13.

## W2-GL
30. The gl probe's `lab` check fails: GL is not mounted on `/` yet (items 6–8).

## B1-TYPE follow-up (W2)
31. World-font swap CLS: 0.003–0.005 remains on lettered captions and rdr2 h3s (P3-2 #7 wants 0). The `html[data-fonts~=world]` token is now added only after the faces load (lib/world-fonts.ts, timeout 4000 / 3000 for the fast-lane warm), which took it from 0.0151. Next: metric overrides (`size-adjust` / `ascent-override` / `descent-override`) on the world faces, or reserve the line boxes.
32. Glue or balance the dangling separators (LOW 8 / judge 11; glued to the moment by an M2 decision, so a taste call for P3-11).

## Every builder: a new rule
33. Never add a CSS rule that can match `<html>` itself for a class or attribute toggled at runtime, and never use `[class*=…]` / `[class^=…]` substring selectors. Each such toggle restyles the whole document (70–100 ms headless). Lenis rewrites `html` classes at every glide start and stop, so nothing may key on `html.lenis*` (foundation.css now keys on the boot gate and `html[data-smooth]`). `html[data-letterbox]` (stage.css scroll-padding) is one such toggle: W3-CINEMA keeps it to once per scene.
34. Budget headroom: first-load JS has ≈ 4.6 KB gz left (base +1,524 B of 6,144). Desktop-only code goes behind a facade (`React.lazy` mounted under `useDesktopFine()` / `useDesktopWide()`, DP-13), as smooth-scroll, world-fonts, stage-gate, letterbox-bars and the cut overlay now do. Docs-only data fields are stripped from browser chunks by `scripts/build/browser-data-loader.cjs`: a client file that starts reading `provenance.*` (other than `source`), a variant's `note`/`plan`/`files`, or a section's `beats`/`tempo`/`estVh` must be removed from its RULES first.
35. Large painted layers (gradients, wear, grain) must be static promoted layers (`will-change: transform` that never changes) with positioned, non-repeating bands, not full-size gradients re-rastered on repaint (see the principles fix in components/site/principles-map.tsx).

## Probes (W2 assembler)
36. `split.mjs` still reads stale rects; use the direct check (`docs/build/motion-strips/p3-w1/fix/split-*.json`).
37. `motion.js`'s idle probe and intro run pay the screencast cost; the intro "name visible" metric should read the stage's mask edge, not `elementFromPoint` (the empty `.intro-block` is hit-testable but transparent).

## Aryan
38. The iPad (1024×1366 touch) gets the world type (spec §5.4 keys it on DESKTOP_WIDE; DP-18 says "1024×1366 unchanged"): keep, or key it on DESKTOP_FINE?
39. The `minimax_h3` credit now shows on every device (true, public): OK?
40. Sign `credits.libraries` with the 96 unsigned strings (item 21).
41. Optional: a real-laptop Chrome performance recording of the intro and one full scroll at 1440 (§4.4 hand-off script 21–22 ms and intro fps 18.5 / p95 133.3 are software-raster bound headless).
