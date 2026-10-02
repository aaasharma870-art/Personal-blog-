# B1-INTRO return (status: done)

Files: components/intro/controller.js, public/intro/intro.js (rebuilt, src:a7a8cbff9ab3 = controller-version.ts), components/intro/controller-version.ts, components/intro/intro-model.ts, components/intro/intro-overlay.tsx, components/intro/intro-bridge.tsx, components/intro/intro-head-script.tsx, app/intro.css, components/sections/hero/intro-phase.ts, components/sections/hero/hero-stage.tsx, components/primitives/media-frame.tsx, lib/codec.ts, lib/motion.ts, components/site/page-hydrated.tsx

APIs: lib/codec.ts pickCodec / pickCodecSync / codecKnown / codecConfigs / handoffSource; intro-phase.ts: IntroPhase gains 'handoff'; introSettled(phase) true for 'handoff'; NEW introGone(phase) = overlay off screen; MediaFrame new optional prop fade?: number (0 = cut), video waits for the codec pick, plays the intro hand-off blob when present; PageHydrated sets window.__pageHydrated + mark + emit('page:hydrated'); lib/motion.ts intro timings (warmMs 1400, handoffMaxMs 450, hydrateMaxMs 1200, trailFadeMs 600, liveFadeMs 200, feather .4, dprMax 1.5, pointerGainMs 800, titles {capOut .26, first .3, step 1, card .9, enter .3, exit .22, total 3.2, rise 8}); intro-model: + titles, fastLane, heroLoops[plateV][loopV], playLoop (loopFor('IN-01')), codec configs, flight fps/loopAt; variant keys + 'intro.titles'.

HANDOFFS:
1. lib/events.ts: add "intro:titles": void and "intro:titles-end": void to P3Events.
2. tools/capture/motion.js intro run: add PH labels intro-handoff→'hold', intro-sweep→'reveal', intro-caps-linger→'titles' (before intro-landing); keep recording while html has intro-caps-linger; measure LoAF between marks intro:warm and intro:titles-end.
3. B1-SCROLL Lenis gate on introGone(phase) — ALREADY DONE by B1-SCROLL.
4. types/p3-globals.d.ts (optional): __codecPicks?: Record<string,'video/mp4'|'video/webm'>; __introHandoff?: { src: string; url: string | null; at: number }.
5. lib/media.ts + FLIGHTS: when L05 (IN-01 loop, staged as intro-play-loop.*) registers registeredTo IN-01, it lights up via loopFor; set FLIGHTS['IN-02'].loopAt = 0.5 only if the MV-03 match-cut re-blend lands (not staged → leave unset).

ACCEPTANCE (verify with a server):
- §4.4: `node tools/capture/motion.js http://localhost:3161 <out> --runs=intro`; marks intro:warm / hold / reveal / end / titles / titles-end; 0 paint records for div#intro between intro:reveal and intro:end; at intro:reveal [data-hero-lens=desktop] [data-media] has data-media-state=playing; no LoAF > 50 ms warm→titles-end; fps/p95 ≥ baseline.
- P3-3 #2: intro-landing.jpg strip; hero-sea-loop fetched at intro:warm (low priority), played from blob: URL.
- P3-3 #3: 3 cards in #intro-titles (ALT ?variant=intro.titles:alt → #intro-roll) for 3.2 s, then cap.hero; input/Pause ends titles at once.
- P3-3 #4: Skip / ?skip / RM / second visit → no intro:titles.
- P3-3 #5: intro skip-row "Skip to the research" → #work focused; hidden below 64rem.
- P3-3 #6: window.__codecPicks; #intro-film has src, no <source>.
- Beats: #intro B00 (w2), #intro-stage B01 (w3), hero section B02 (w2).

NOTES: tsc clean (whole project at its finish), eslint clean; served controller 12.9 → 15.9 KB gz (async, only when the intro arms). Deviations: reveal geometry corrected (stage −W → +F, film 0 → −(W+F)) so the feather clears; hold uses createImageBitmap + bitmaprenderer (drawImage cost ~27 ms headless); codec rule ranks 'supported' too (ties → MP4). Titles render only if titles.1–3 + act title are visible (proposed + unsigned) — Aryan to sign; 'ACT I' literal in titles.3. Titles show only ≥ 40rem × ≥ 32rem tall. L05 dormant until registered. Harness (no server): scratchpad/harness/{build.mjs,run.js}: node run.js '?intro=1[&variant=…]' <label> [play|skip|fastlane|pause-mid-reveal].
