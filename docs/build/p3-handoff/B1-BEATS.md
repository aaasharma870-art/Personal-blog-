# B1-BEATS return (status: done)

Files: lib/beats.ts, lib/page.ts, lib/film.ts, lib/spotlight.ts, lib/spotlight-impl.ts, components/primitives/use-enter-once.ts, components/site/capabilities.tsx, scripts/check-manifest.mjs, scripts/checks/{beats,travel,honesty,unsigned}.mjs, tools/capture/beats.mjs (new), tools/capture/probes/spotlight.mjs; attribute-only data-beat: components/sections/act-card/card-shell.tsx (B06 on ProgramStage), components/site/contact-scene.tsx (B56 bracket monogram), components/worlds/rdr2/wanted-board.tsx (B43-wanted).

APIs: beatAttrs etc unchanged (docs: at/span units = vh of viewport-top scroll from item top, can be negative; estVh in viewports); spotlight impl per spec §3.8, ?debug=spotlight exposes window.__spotlight { log, state(), request, release, registerScrollStar }; useEnterOnce(ref, { amount?, star? }) play → entered, skip → static, asks only on DESKTOP_FINE; lib/film.ts ActSpec.estVh?, PrologueSpec.beats? (additive).

HANDOFFS:
1. When WebGL ships (W2 assembler): render systems.pencil.body.p3, add "systems.meta.webgl" to META in capabilities.tsx, remove the DEFERRED entry in scripts/checks/honesty.mjs.
2. DECISION (orchestrator): W1 keeps today's systems.pencil.body ("no WebGL, just native scroll") on the dev branch until W2 swaps it (RELEASE gate stays red for that one item until W2; main untouched).
3. Stage cue anchor ids used in lib/page.ts + lib/film.ts must exist: about-pillars, optuna-screener-approach, optuna-screener-metrics, beyond-activities, act-1-program (B1-STAGE files + the program block).
4. B1-STAGE files: tag B20 (trading-algos FIG. 1 inks; data-beat=B20, star, weight 2) and B41 (TrailMap fog lift; star, weight 2); rack ids B20-rack, B23-rack, B42-rack on the StageWindow.
5. B24 (Rancho's circle on "anything > 2.0 is a red flag"): data-beat=B24, data-beat-star, data-beat-weight=1 (metric-tile.tsx or chapter-section.tsx).
6. lib/film.ts acts[0].stage + lib/page.ts about cue 1: switch media iconic-pearl → the SEQ-PEARL end still once registered (variant-aware).
7. W2-CARDS: tag card beats (B03/B04, B13/B14, B36/B38, B48/B50, impacts, subtitles, B04-spray, B14-chalk, B48-fireflies, B50-motes, B35-sun); register scroll stars on the pin spacer, not the sticky frame; owns travel.mjs in W2.
8. Assembler after the W1 build: `node tools/capture/beats.mjs http://localhost:3161 --widths=1440,1024 --write --out=<dir>` (add --report-only for exit 0); `node tools/capture/p3-probes.mjs <base> <out> --only=spotlight`. W1 will report gaps because many beats are tagged in W2/W3.

ACCEPTANCE: npm run check prints "beats: 80 declared (60 stars) on 20 items; page ≈ 4713.7vh @1440, 4998.1vh @1024"; checks 1–14 as modules (gaps/competing/pacing/#13 = release gates; structure/rations/spans/hooks/travel = errors), negative-tested; validator #10: 96 unsigned strings (92 copy + 4 loglines) warn in check, error under RELEASE; old #3/#4 retired (travel.mjs: ≤ 110 each, ≤ 400 total, layout files must key travel on the boot gate).

NOTES: tsc clean (whole tree at its finish), eslint clean, npm run check OK. RELEASE=1 fails on unsigned copy (expected DP-9) + the deferred systems.pencil.body (one cause). Honesty: "Smooth scroll on desktop (Lenis)" in capabilities.tsx is only true if Lenis ships in the same commit — commit together. useEnterOnce star: an armed element can sit hidden in view up to 1.5 s before skipping (W3 hosts should know). The spotlight impl imports lib/smooth-scroll (lazy chunk shares modules) — check the bundle probe.
