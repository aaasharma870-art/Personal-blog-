# B1-SCROLL return (status: done)

Files: lib/smooth-scroll.ts, lib/gsap.ts, lib/use-scroll-scene.ts, lib/ladder.ts, lib/flags.ts, components/providers/smooth-scroll.tsx, components/site/boot-head-script.tsx, components/enhance/desktop-enhancer.ts, components/director/cut-overlay.tsx, components/site/header.tsx, components/site/command-palette.tsx, components/site/hp-ink.tsx, components/eggs/egg-host.tsx, components/eggs/marauders-map-dialog.tsx, app/p3/foundation.css, tools/capture/{motion.js,scenes.js,qa.js,browser.js,diff.mjs (new)}, tools/capture/probes/{lenis,bundle,loaf}.mjs

New APIs beyond W1.0: lib/smooth-scroll.ts haltGlide(), setCutRunner(run)/CutRunner, trackScrollInput(); lib/ladder.ts useQuiet(), registerChunk(load); lib/gsap.ts gsapIfLoaded(), prefetchGsap(), sleepTickerIfIdle(); lib/flags.ts onMotionOffChange(fn); desktop-enhancer default enhance(root) + type Binder; CutOverlay (aria-hidden div.cut-overlay); BootHeadScript (<script id=p3-boot>, 392 B); tools/capture/browser.js parseViewport, contextFor, IPHONE_UA, IPAD_UA.

HANDOFFS:
1. eslint.config.mjs: replace the SCROLL_LIB_PATTERNS `group` with { regex: "^(gsap|lenis)(/.*)?$|^@gsap/react$", allowTypeImports: true, message } — the gitignore-style pattern `gsap` also matches `@/lib/gsap` and `./gsap` so importing loadGsap() from the wrapper fails lint. Then delete the two `eslint-disable-next-line no-restricted-imports` lines above the ./gsap imports in lib/smooth-scroll.ts and lib/use-scroll-scene.ts.
2. components/stage/stage-gate.tsx (B1-STAGE) / components/gl/gl-gate.tsx (W2-GL): call registerChunk(() => import("./stage")) (and the GL equivalent) once on mount (DESKTOP_FINE) so the warm-up prefetch fetches those chunks early; call requestScrollRefresh() when the stage mounts.
3. card-shell.tsx (W2-CARDS): keep the sticky element marked `.act-card-stage` or `[data-card-stage]` inside the `[data-act-card]` section with id act-n (scrollToTarget('#act-n') lands at landAt × travel measured from it).
4. docs/build/PHASE3-SPEC.md §3.1: record that the lenis CSS lives in app/p3/foundation.css and that ScrollTrigger.sort() before each refresh replaces per-trigger refreshPriority.

ACCEPTANCE (to verify with a server):
- P3-2 #1: `node tools/capture/p3-probes.mjs http://localhost:3161 <out> --only=lenis` (lenis.on + off.390touch / off.1024x1366touch / off.rm / off.skipsmooth / off.lab / off.404 / pause ≤100 ms); qa.js R.lenis.
- P3-2 #2: lenis probe anchor.menu, anchor.skiplink, fastlane, hash.load, keyboard.midglide, palette jump under Pause.
- P3-2 #3: lenis probe lock.menu, lock.palette.
- P3-2 #9: `--only=loaf` (/?intro=1 → Play → p3:quiet-end → 3 s wheel; --loaf-metric=work headless); bundle probe static.ric.
- P3-2 #10: `--only=bundle --compare=http://localhost:3162` (firstLoad.markers, desktop.lazy, ≤6 KB gz JS/CSS).
- P3-2 #12 fast lane: lenis probe fastlane + cut.z.
- P3-10 #3: lenis probe fastlane (label, #work focused ≤400 ms, overlay, fonts idiots) + off.390touch label 'Work'; scenes.js --only=mobile + diff.mjs vs base.

NOTES:
- tsc error outside its globs: components/providers/world-fonts.tsx(63,14) TS2339 'add' on ReadonlySet<string> (B1-TYPE).
- Probes and tool changes untested against a live page (no server).
- Ladder halts while motion is off; anything that must run with motion off uses whenQuietEnd()+onIdle (world-fonts and the enhancer loader already do).
- Lenis gates on introGone(phase) (B1-INTRO added a 'handoff' phase still under the overlay).
- Long jumps (> 3 viewports) cut on ≥64rem or with Lenis; phones keep native smooth for palette/egg jumps; palette and Time-Turner jumps now move focus to the target heading.
- COPY: fastlane.label "Skip to the research" is proposed + unsigned and now rendered at DESKTOP_WIDE → Aryan must sign it.
- motion.js: default runs unchanged; new opt-in 'native' run (/?skip=intro,smooth), --vw=WxH, per-run 'lenis' column; pauses wait for __lenis.isScrolling===false. scenes.js/qa.js gain --vw/--touch.
- Not done (optional): the header settle probe on Lenis idle.
