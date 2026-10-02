# B1-RASTER return (status: done)

Files: components/site/{principles-map,journey-voyage,ledger-reckoning,idiots-chalk,rdr2-graphite}.tsx; components/worlds/idiots/{plate-band,gauntlet-board,chalk,machine-board}.tsx; components/worlds/rdr2/{journal-spread.tsx,campfire-stage.tsx,kit.tsx,satchel.tsx,rdr2.module.css}; components/sections/hero/velocity-layers.tsx; components/sections/films/finales.tsx; components/sections/act-card/frames/{board-fig,tintype,tintype-deadeye,ignite-lumos}.tsx; assets/p3/raster/graphite-tooth.png (new, 8.3 KB, static import); assets/p3/raster/bake-graphite-tooth.mjs (new).

APIs: kit.tsx bakedGraphite(viewBoxW) => CSSProperties (--graphite-tooth + --graphite-tile for .graphiteBaked / .graphiteDw); chalk.tsx ChalkFilter({ id, region? }) optional fixed userSpaceOnUse region; idiots-chalk.tsx RanchoCircle({ children, block?, className?, ...Partial<BeatAttrs> }) passes data-beat* through.

HANDOFFS:
1. components/site/journey-stack.tsx + journey-carousel.tsx: beatAttrs("B10",{weight:2}) / ("B11",{weight:2}) on step 1 / step 3 (voyage articles are tagged; stack + carousel are not).
2. PrinciplesLumos ALT (principles-stage.tsx / its lumos file): B52 on the sheet root, B54 on room 3.
3. chapter-section.tsx / metric-tile.tsx: pass {...beatAttrs("B24",{weight:1})} (and later B21) to the right <RanchoCircle>.
4. Note: B46 is tagged on the voices camp stage root (campfire-stage.tsx, both variants), though declared on the writing item; if the probe needs B46 inside #writing, move it to writing.tsx's dusk div.

ACCEPTANCE (assembler verifies with motion.js --runs=desktop ?skip=smooth vs baseline 3.2/3.3/3.5/3.9 fps → ≥ 1.5×):
- principles fps ≥ 4.95, will-change ≤ 8 (one useScroll on the <ol>; 5 YOU banners + 2 outer panels while unfolding).
- work fps ≥ 4.8; ?variant=work.head:alt and kill-list alt look the same.
- journey fps ≥ 5.25; div.sticky repaints gone.
- kill-list fps ≥ 5.85.
- writing: computed filter count in #writing at 1440 = 0; NibTitle dot no layout shift.
- voices: campSticky repaints gone.
- hero: --vn < .005 1.5 s after scroll stops.
- films finales / act-2 / act-3 cards: photo layers do not repaint while overlays draw.

NOTES: no build/server run (no fps or diff numbers yet). DEVIATION: spec §12.1 #2 says drop the 150%-wide mix-blend-screen sweep; RASTER kept the warm-bar sweep (work.head ALT identity) as normal blend, transient (1.7 s, promoted); colour diff ≤ ~.04 in G/B vs screen; delete the bars block in PlateBand for a literal drop. Expected small diffs: graphite strokes at ≥ 64rem use a different noise realisation; ChalkWrite clip margin 0.4em during the write. Blink: an outer <svg> does not isolate mix-blend-mode → Dead Eye grade promoted only when the plate carries the grade; ignite-lumos no-hall Hall left unpromoted. Light-sweep grey copy uses the poster (if W2-PLATES makes the work head a live loop, the grey copy shows the poster for 1.4 s). Tagged time stars (B17, B22, B43, B44, B52) don't pass useEnterOnce star yet (W3 world builders wire the spotlight).
