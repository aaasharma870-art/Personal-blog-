# B1-STAGE return (status: done)

Files: lib/stage.ts, lib/sky.ts, lib/decoder-lock.ts, components/stage/{stage-gate,stage,stage-video,stage-window,stage-layers,letterbox-bars}.tsx, components/stage/scrim.tsx (new), components/sections/SectionFrame.tsx, components/sections/chapter/chapter-section.tsx, components/site/{world-kit,about,beyond,footer}.tsx, app/page.tsx, app/p3/stage.css, scripts/checks/stage.mjs, tools/capture/probes/{aa-scrim,decoder,split,layout-gates}.mjs.

APIs: stageCues / stageAt (as W1.0); StageShot, stageShots (consecutive same-plate backdrop cues merge), shotsNear, shotLocal, stageCamera(kind?, l, focal?, variant?) => {s,x,y}, poseTransform, CameraPose, shotArrival(scrollY, vh, splitTop, span=.4), rackSoft, STAGE_IMAGE, stageSpecIssues, RESEARCH_TYPES, OPAQUE_TONES, SCRIM_MIN; lib/sky.ts skyMix(a,b,t); decoder-lock mirrors the holder label on window.__decoderHolder; StageLayerPortal = real createPortal into its own fixed container per layer (z token, pointer-events none, empty:hidden; null on server/before mount); LetterboxBars + useLetterboxScene(ref, { close, open }) (on useScrollScene); StageWindow gains optional beat? rack?; NEW <StageSplit entry>{children}</StageSplit>; StageVideo props { host, loop, focal?, play }; Stage default (client only via StageGate); StageScrim { scrim, className? } (display:none unless stage live + section marked).

HANDOFFS:
1. W2-CARDS (act-card files): give the act-1 program block id="act-1-program", class `stage-backdrop`, and render <StageScrim scrim={film.acts[0].stage.scrim}/> as its first child inside a `relative isolate` box. Until then the stage skips the program cue and the pearl shot starts at #about.
2. W2-PLATES: not built in W1 — cue.weather (WeatherLayer), cue.depth, static cue.grade, and playOn="never" for inline plates the stage covers. Hooks: `.stage-layer > .stage-cam` (camera transform) with `.stage-video-host`; window = [data-stage-window] > [data-stage-window-host]. Loops light up via loopFor(plate).
3. Docs (assembler): PHASE3-SPEC §3.2 — split-stack container breakpoint is 40rem (not 48rem; text column ≈ 740 px at 1440); split windows show the stage via a portal INTO the sticky window, not by making the section transparent.
4. W3-IDIOTS visual check: inside the split, the ICE board breaks out over the whole grid ([data-stage-wide], opaque ground); the ChalkDrone beside the caption now sits over the window column on trading-algos — check at 1440/1024, hide/move under the boot gate if it fights the plate.
5. B1-TYPE: keep `typeCredits` export (footer derives the ≥ 64rem TYPE row from it, minus the house faces). [footer handoff from TYPE is therefore DONE by STAGE]
6. Copy (optional): the new credits row "Libraries · On desktop: GSAP (standard no-charge licence) · Lenis (MIT)" is hard-coded like the Type row, boot-gate only; could move to a `credits.libraries` copy key (proposed, unsigned).

ACCEPTANCE (assembler runs with the built app):
- P3-2 #4 mount + live: 1440 /?skip=intro, after ladder step 3, scroll to about → html[data-stage="live"], [data-section=about][data-stage-on], section transparent with gutters scrim; phones/RM/paused → no [data-stage-root] (layout-gates probe).
- AA: p3-probes --only=aa-scrim at 1440x900 + 1024x768.
- split: --only=split (grid, side, sticky at header height, decoded poster/layer at start/mid/end, no overflow, split-stack tracks).
- decoder: --only=decoder (intro on / + full wheel /?skip=intro, 100 ms samples) ≤ 1 playing, 0 during crossfades. (Headless Chromium has no H.264: it decodes WebM only.)
- layout gates: --only=layout-gates (paused reload no reflow; Pause mid-scroll no shift; no-JS 1440 no split/window; 390 + RM no split/stage/bars); z-scale main + credits z 1, [data-stage-layers] 25/30/32/35.
- npm run check (stage.mjs): 0 errors/warnings.
- Variants: ?variant=stage.camera:alt; ?variant=letterbox.breath:alt (once W3-CINEMA uses the bars).

NOTES: tsc fully clean, eslint clean on owned files; nothing runtime-verified. New anchor ids: #about-pillars, #<chapter>-approach, #<chapter>-metrics, #beyond-<first word of kicker> (#beyond-activities = cue anchor). Footer at < 64rem visually unchanged (390 HTML gains an inline span + a hidden row). LetterboxBars (~1.5 KB) is in the first-load bundle via app/page.tsx — move behind next/dynamic if the +6 KB budget is tight.
