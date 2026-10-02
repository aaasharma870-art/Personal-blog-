# Motion baseline — 2026-10-02T22:03:59.763Z

Base http://localhost:3161 · Chromium 141.0.7390.37 headless · 4 CPUs · screencast everyNthFrame=1.

> Headless Chromium rasterises in software (SwiftShader) on a few CPUs and pays for the screencast readback, so absolute frame times are pessimistic vs a real laptop/phone GPU. Read them as RELATIVE hotspots: which sections and transitions are worst. "busy∩jank %" = share of >33.4 ms frames that overlap a long animation frame in which the main thread really worked (script + style/layout/paint >= half the frame, or a >50 ms task); low = the frame was raster/composite-bound (the LoAF is the main thread waiting on the compositor), high = main-thread script/style/layout. "paint suspects" = what the section holds that is costly to raster (filters, blend, masks, canvas, video, image megapixels, infinite animations).

## Runs

| run | viewport | lenis | secs | rAF frames | fps | mean ms | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | LoAF block ms | busy∩jank % | CLS total | CLS (session) | pops | shots |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| desktop | 1024x768 | on | 70.2 | 1376 | 19.6 | 51 | 16.7 | 166.7 | 299.9 | 33.6 | 27.5 | 883.3 | 382 | 484 | 2.6 | 0.0049 | 0.0018 | 6 | 791 |

## Top 10 hotspots (by mean frame time; rm excluded)

| # | run | where | frames | fps | mean | p95 | p99 | >50 % | max | mean / run mean | LoAF block ms | likely cause |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | desktop | principles | 16 | 5.2 | 190.6 | 533.3 | 533.3 | 87.5 | 533.3 | 3.7 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.3% waiting for the compositor — on screen: 7 will-change [while scrolling: raster 876.8 ms/s, 21.6 paints/s — repainting: #document ×16; div.act-card-stage.relative.flex in #act-4 ×16 \| idle 60.1 fps, raster 0 ms/s, 0 paints/s] |
| 2 | desktop | about | 12 | 6.7 | 148.6 | 299.9 | 299.9 | 83.3 | 299.9 | 2.9 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 98.1% waiting for the compositor — on screen: 1 mask [while scrolling: raster 853.5 ms/s, 33.6 paints/s — repainting: #document ×12; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×11 \| idle 60.4 fps, raster 0 ms/s, 0 paints/s] |
| 3 | desktop | journey | 19 | 7.1 | 141.2 | 333.4 | 333.4 | 78.9 | 333.4 | 2.8 | 56 | raster/composite-bound: only 13.3% of janky frames overlap real main-thread work; the LoAFs are 95.2% waiting for the compositor — on screen: 1 mask, 1 will-change, 0.6 MP of images [while scrolling: raster 833.3 ms/s, 52.2 paints/s — repainting: #document ×19; div.act-card-stage.relative.flex in #act-2 ×19 \| idle 47 fps, raster 39.7 ms/s, 2 paints/s] |
| 4 | desktop | act-1 | 36 | 8.1 | 124.1 | 300 | 883.3 | 72.2 | 883.3 | 2.4 | 0 | raster/composite-bound: only 3.6% of janky frames overlap real main-thread work; the LoAFs are 98.9% waiting for the compositor — on screen: 4 mask, 18 will-change, 14 infinite anims, 1.2 MP of images [while scrolling: raster 577 ms/s, 31.8 paints/s — repainting: #document ×24; div.act-card-stage.relative.flex in #act-1 ×21 \| idle 47.1 fps, raster 0 ms/s, 0 paints/s] |
| 5 | desktop | kill-list | 22 | 8.4 | 118.9 | 199.9 | 200 | 95.5 | 200 | 2.3 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.6% waiting for the compositor — on screen: 1 mask, 3 will-change, 0.1 MP of images [while scrolling: raster 877.1 ms/s, 34.8 paints/s — repainting: #document ×21; div.relative.@container.will-change-[transform,opacity] in #header ×20 \| idle 60.2 fps, raster 0 ms/s, 0 paints/s] |
| 6 | desktop | beyond | 38 | 8.5 | 117.1 | 283.4 | 383.3 | 76.3 | 383.3 | 2.3 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 98.9% waiting for the compositor — on screen: 6 mask, 2.3 MP of images [while scrolling: raster 715.1 ms/s, 38.4 paints/s — repainting: #document ×37; div.act-card-stage.relative.flex in #act-3 ×30 \| idle 60.2 fps, raster 0 ms/s, 0 paints/s] |
| 7 | desktop | systems | 18 | 9.2 | 108.3 | 216.6 | 216.6 | 77.8 | 216.6 | 2.1 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 98.9% waiting for the compositor — on screen: 1 mask, 1 will-change, 0.6 MP of images [while scrolling: raster 870.8 ms/s, 42.6 paints/s — repainting: #document ×18; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×16 \| idle 61.9 fps, raster 0 ms/s, 0 paints/s] |
| 8 | desktop | work | 32 | 14 | 71.4 | 166.7 | 266.6 | 53.1 | 266.6 | 1.4 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 95.6% waiting for the compositor — on screen: 3 filter, 1 blend, 2 mask, 2 will-change, 0.8 MP of images [while scrolling: raster 779.6 ms/s, 60.4 paints/s — repainting: #document ×24; div.act-card-stage.relative.flex in #act-2 ×14 \| idle 60.2 fps, raster 0 ms/s, 0 paints/s] |
| 9 | desktop | trading-algos | 35 | 14.1 | 70.9 | 183.3 | 283.3 | 45.7 | 283.3 | 1.4 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 98.9% waiting for the compositor — on screen: 2 filter, 0.1 MP of images [while scrolling: raster 815.1 ms/s, 64.4 paints/s — repainting: #document ×24; div.relative.sm:overflow-hidden.sm:rounded-frame in #work ×24 \| idle 60.6 fps, raster 0 ms/s, 0 paints/s] |
| 10 | desktop | act-2 | 61 | 14.4 | 69.7 | 199.9 | 466.8 | 42.6 | 466.8 | 1.4 | 11 | raster/composite-bound: only 2.9% of janky frames overlap real main-thread work; the LoAFs are 97.4% waiting for the compositor — on screen: 2 filter, 3 mask, 20 will-change, 12 infinite anims, 2.4 MP of images [while scrolling: raster 587.8 ms/s, 62.1 paints/s — repainting: #document ×30; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×25 \| idle 60 fps, raster 0 ms/s, 0 paints/s] |

## Idle probe (desktop: parked 2.5 s on each section, then 1.5 s traced standing still; high raster with few paints = a raster-heavy layer, many paints/s = continuous animation)

| section | idle fps | raster ms/s | paints/s | paint ms/s | style+layout ms/s | rAF JS ms/s | top repainting nodes |
|---|---|---|---|---|---|---|---|
| top | 60.6 | 0 | 0 | 0 | 2.5 | 18.8 |  |
| act-1 | 47.1 | 0 | 0 | 0 | 11 | 23.3 |  |
| about | 60.4 | 0 | 0 | 0 | 13.8 | 31 |  |
| journey | 47 | 39.7 | 2 | 0.6 | 1.1 | 12 | #document ×1; div.sticky.top-[calc(var(--header-h)+1.5rem)] ×1; canvas.absolute.inset-0.size-full ×1 |
| act-2 | 60 | 0 | 0 | 0 | 0 | 17.6 |  |
| work | 60.2 | 0 | 0 | 0 | 0 | 17.7 |  |
| trading-algos | 60.6 | 0 | 0 | 0 | 14.8 | 33.6 |  |
| optuna-screener | 60.2 | 0 | 0 | 0 | 14.3 | 33.2 |  |
| experiment | 60.1 | 0 | 0 | 0 | 0 | 17.1 |  |
| systems | 61.9 | 0 | 0 | 0 | 0 | 18.4 |  |
| kill-list | 60.2 | 0 | 0 | 0 | 0 | 16.8 |  |
| films | 60.1 | 0 | 0 | 0 | 0 | 15.5 |  |
| act-3 | 60.3 | 0 | 0 | 0 | 0 | 16.2 |  |
| beyond | 60.2 | 0 | 0 | 0 | 0 | 18 |  |
| writing | 60.3 | 0 | 0 | 0 | 0 | 17.3 |  |
| voices | 60.2 | 0 | 0 | 0 | 0 | 17.8 |  |
| act-4 | 60.2 | 0.4 | 0 | 0 | 0 | 17.3 |  |
| principles | 60.1 | 0 | 0 | 0 | 0 | 17.9 |  |
| contact | 60.6 | 0 | 0 | 0 | 13.9 | 35.5 |  |
| credits | 60.2 | 0 | 0 | 0 | 12.4 | 28.8 |  |

## desktop — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 14 | 15.3 | 65.5 | 16.7 | 283.3 | 283.3 | 35.7 | 35.7 | 283.3 | 5 | 67 | 20 | 0 | 391.7 | 61.1 | #document ×16; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×8 | user-callback:IntersectionObserverCallback @ 17uxrkbdeaanq.js (113 ms) | 1 filter, 1 blend, 1 mask, 5 will-change, 1.2 MP of images |
| act-1 | 36 | 8.1 | 124.1 | 83.4 | 300 | 883.3 | 77.8 | 72.2 | 883.3 | 26 | 0 | 3.6 | 0 | 577 | 31.8 | #document ×24; div.act-card-stage.relative.flex in #act-1 ×21 | user-callback:FrameRequestCallback @ 1rezhhvr7fq6o.js v (10 ms) | 4 mask, 18 will-change, 14 infinite anims, 1.2 MP of images |
| about | 12 | 6.7 | 148.6 | 133.3 | 299.9 | 299.9 | 83.3 | 83.3 | 299.9 | 10 | 0 | 0 | 0 | 853.5 | 33.6 | #document ×12; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×11 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (22 ms) | 1 mask |
| journey | 19 | 7.1 | 141.2 | 116.7 | 333.4 | 333.4 | 78.9 | 78.9 | 333.4 | 14 | 56 | 13.3 | 0 | 833.3 | 52.2 | #document ×19; div.act-card-stage.relative.flex in #act-2 ×19 | resolve-promise:Promise.resolve @ 1vb142oniqzf6.js (101 ms) | 1 mask, 1 will-change, 0.6 MP of images |
| act-2 | 61 | 14.4 | 69.7 | 50 | 199.9 | 466.8 | 55.7 | 42.6 | 466.8 | 27 | 11 | 2.9 | 0 | 587.8 | 62.1 | #document ×30; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×25 | user-callback:IdleRequestCallback @ 1zum7z4o80845.js i (58 ms) | 2 filter, 3 mask, 20 will-change, 12 infinite anims, 2.4 MP of images |
| work | 32 | 14 | 71.4 | 66.6 | 166.7 | 266.6 | 65.6 | 53.1 | 266.6 | 17 | 0 | 0 | 0 | 779.6 | 60.4 | #document ×24; div.act-card-stage.relative.flex in #act-2 ×14 | user-callback:IdleRequestCallback @ 1zum7z4o80845.js i (64 ms) | 3 filter, 1 blend, 2 mask, 2 will-change, 0.8 MP of images |
| trading-algos | 35 | 14.1 | 70.9 | 50 | 183.3 | 283.3 | 54.3 | 45.7 | 283.3 | 16 | 0 | 0 | 0.0018 | 815.1 | 64.4 | #document ×24; div.relative.sm:overflow-hidden.sm:rounded-frame in #work ×24 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (8 ms) | 2 filter, 0.1 MP of images |
| optuna-screener | 94 | 17 | 58.7 | 50 | 150.1 | 183.3 | 55.3 | 41.5 | 183.3 | 39 | 0 | 0 | 0.0002 | 747.6 | 34.6 | #document ×48; div.stage-window in #trading-algos ×40 | user-callback:FrameRequestCallback @ 1rezhhvr7fq6o.js v (24 ms) | 2 filter, 0.7 MP of images |
| experiment | 25 | 17.4 | 57.3 | 33.3 | 216.6 | 249.9 | 40 | 36 | 249.9 | 10 | 0 | 0 | 0 | 801 | 45.4 | #document ×17; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×12 |  |  |
| systems | 18 | 9.2 | 108.3 | 100 | 216.6 | 216.6 | 88.9 | 77.8 | 216.6 | 14 | 0 | 0 | 0 | 870.8 | 42.6 | #document ×18; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×16 | user-callback:IntersectionObserverCallback @ 3nczl85xqg5o6.js (5 ms) | 1 mask, 1 will-change, 0.6 MP of images |
| kill-list | 22 | 8.4 | 118.9 | 116.7 | 199.9 | 200 | 95.5 | 95.5 | 200 | 21 | 0 | 0 | 0 | 877.1 | 34.8 | #document ×21; div.relative.@container.will-change-[transform,opacity] in #header ×20 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t (5 ms) | 1 mask, 3 will-change, 0.1 MP of images |
| films | 515 | 38.1 | 26.2 | 16.7 | 83.3 | 150 | 11.5 | 8.3 | 333.4 | 40 | 210 | 8.5 | 0 | 448.3 | 57.9 | #document ×286; svg.pointer-events-none.absolute.inset-0 viewBox=0 0 1778 1000 in #films ×117 | user-callback:IdleRequestCallback @ 1zum7z4o80845.js i (79 ms) | 4 will-change, 2.2 MP of images |
| act-3 | 130 | 30.7 | 32.6 | 16.7 | 116.6 | 233.3 | 18.5 | 13.8 | 250 | 18 | 0 | 0 | 0 | 290.8 | 46.8 | #document ×58; div.stage-window in #beyond ×47 | user-callback:FrameRequestCallback @ 1rezhhvr7fq6o.js v (15 ms) | 1 filter, 3 mask, 6 will-change, 1 MP of images |
| beyond | 38 | 8.5 | 117.1 | 100 | 283.4 | 383.3 | 84.2 | 76.3 | 383.3 | 31 | 0 | 0 | 0.0013 | 715.1 | 38.4 | #document ×37; div.act-card-stage.relative.flex in #act-3 ×30 | user-callback:FrameRequestCallback @ 1rezhhvr7fq6o.js v (10 ms) | 6 mask, 2.3 MP of images |
| writing | 45 | 17 | 58.9 | 50 | 100 | 133.3 | 64.4 | 46.7 | 133.3 | 23 | 0 | 0 | 0.0005 | 793.2 | 107.2 | #document ×44; div.act-card-stage.relative.flex in #act-4 ×41 | user-callback:FrameRequestCallback @ 1rezhhvr7fq6o.js v (6 ms) | 4 mask, 3 will-change |
| voices | 45 | 26 | 38.5 | 16.7 | 100 | 233.4 | 31.1 | 24.4 | 233.4 | 11 | 0 | 0 | 0 | 709.1 | 143.7 | #document ×40; div.act-card-stage.relative.flex in #act-4 ×33 | user-callback:IdleRequestCallback @ 1zum7z4o80845.js i (24 ms) | 2 will-change, 1.2 MP of images |
| act-4 | 119 | 28.8 | 34.7 | 16.7 | 133.4 | 166.6 | 21 | 16 | 200.1 | 20 | 0 | 0 | 0 | 488 | 36 | #document ×40; div.rdr2-module__R8wI0W__campSticky in #voices ×32 | user-callback:FrameRequestCallback @ 2gtmnwptgq-6o.js (9 ms) | 2 canvas, 3 mask, 26 will-change, 21 infinite anims, 1.2 MP of images |
| principles | 16 | 5.2 | 190.6 | 200 | 533.3 | 533.3 | 100 | 87.5 | 533.3 | 15 | 0 | 0 | 0.0011 | 876.8 | 21.6 | #document ×16; div.act-card-stage.relative.flex in #act-4 ×16 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (11 ms) | 7 will-change |
| contact | 3 | 2.1 | 472.2 | 483.2 | 683.3 | 683.3 | 100 | 100 | 683.3 | 3 | 140 | 66.7 | 0 | 1056.8 | 14.8 | #document ×3; div.act-card-stage.relative.flex in #act-4 ×3 | user-callback:IntersectionObserverCallback @ 3nczl85xqg5o6.js (11 ms) | 4 mask, 0.5 MP of images |
| credits | 97 | 21.1 | 47.4 | 33.3 | 116.7 | 450 | 29.9 | 23.7 | 450 | 22 | 0 | 0 | 0 | 533.7 | 15.9 | #document ×35; div.stage-cam ×18 | user-callback:FrameRequestCallback @ 1rezhhvr7fq6o.js v (7 ms) | 1 will-change |

### desktop — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 384→2846 | 42 | 8.2 | 122.2 | 83.4 | 300 | 883.3 | 71.4 | 883.3 | 31 | 67 | 3.1 |
| act-2 | 6367→8364 | 70 | 15 | 66.7 | 50 | 199.9 | 466.8 | 40 | 466.8 | 30 | 11 | 2.7 |
| act-3 | 26843→28686 | 133 | 26.7 | 37.5 | 16.7 | 133.3 | 250 | 15.8 | 383.3 | 21 | 0 | 0 |
| act-4 | 36445→38442 | 124 | 27.3 | 36.7 | 16.7 | 133.4 | 166.6 | 17.7 | 200.1 | 24 | 0 | 0 |

### desktop — longest animation frames (LoAF total 46780 ms, main-thread work 951 ms, blocking 484 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 2.4 | act-1 | 874 | 0 | 1 | 1 | 0 | (no script) |  |
| 64.88 | contact | 687 | 0 | 1 | 1 | 0 | (no script) |  |
| 62.33 | principles | 520 | 0 | 6 | 1 | 5 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 5 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| 11.27 | act-2 | 468 | 0 | 1 | 1 | 0 | (no script) |  |
| 64.4 | contact | 465 | 0 | 1 | 1 | 0 | (no script) |  |

### desktop — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 0.84 | top | 121 | 67 | 114 | 1 | 113 | user-callback:IntersectionObserverCallback @ 17uxrkbdeaanq.js 113 ms | `e=>{e.forEach(e=>{let t=H.get(e.target);if(!t)return;let r=e.boundingClientRect;t.visible=` |
| 8.06 | journey | 285 | 56 | 102 | 1 | 101 | resolve-promise:Promise.resolve @ 1vb142oniqzf6.js 101 ms |  |
| 12.57 | act-2 | 61 | 11 | 59 | 1 | 58 | user-callback:IdleRequestCallback @ 1zum7z4o80845.js i 58 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |
| 38.23 | films | 57 | 7 | 53 | 0 | 53 | user-callback:IdleRequestCallback @ 1zum7z4o80845.js i 53 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |
| 6.84 | about | 224 | 0 | 18 | 1 | 17 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 6 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |

### desktop — layout shifts (CLS total 0.0049, session 0.0018, 11 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 17.45 | 0.0018 | trading-algos | span.scene-caption__film.world-face-idiots in #trading-algos ; p.scene-caption.mb-tier-group[data-caption=cap.trading-algos][data-caption-world=idiots] in #trading-algos |
| 51.52 | 0.0013 | beyond | span.whitespace-nowrap in #beyond ; span.scene-caption__sep in #beyond ; span.scene-caption__film.world-face-rdr2 in #beyond |
| 62.11 | 0.0011 | principles | span.scene-caption__film.world-face-hp in #principles ; p.scene-caption[data-caption=cap.principles][data-caption-world=hp] in #principles ; h3.type-title.text-fg.max-sm:hyphens-auto in #principles |
| 22.38 | 0.0002 | optuna-screener | h3.mt-tier-pair.max-w-title.type-title in #optuna-screener |
| 55.14 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 53.99 | 0.0001 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 53.75 | 0.0001 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 54.44 | 0.0001 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |

### desktop — visual pops (6; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 12.70 | 7399 | act-2 | 10 | 22.9 | 3 | change | 41.7 | 1 |
| 14.16 | 7526 | work | 26 | 4.1 | 117.2 | change | 6.9 | 3 |
| 14.46 | 7729 | work | 38 | 19.3 | 553.3 | change | 36.1 | 1 |
| 36.86 | 24340 | films | 14 | 12.3 | 1226.1 | change | 21.5 | 2 |
| 37.08 | 24414 | films | 33 | 15.1 | 1513.3 | change | 30.8 | 5 |
| 61.27 | 37602 | principles | 32 | 2.1 | 211.5 | change | 3.5 | 1 |

## Strips

- strips/desktop-act-1.png
- strips/desktop-act-2.png
- strips/desktop-act-3.png
- strips/desktop-act-4.png
- strips/desktop-first-60s.png
- strips/pop-desktop-98.png
- strips/pop-desktop-126.png
- strips/pop-desktop-421.png
