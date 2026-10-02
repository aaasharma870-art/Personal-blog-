# Motion baseline — 2026-10-02T19:16:54.592Z

Base http://localhost:3162 · Chromium 141.0.7390.37 headless · 4 CPUs · screencast everyNthFrame=1.

> Headless Chromium rasterises in software (SwiftShader) on a few CPUs and pays for the screencast readback, so absolute frame times are pessimistic vs a real laptop/phone GPU. Read them as RELATIVE hotspots: which sections and transitions are worst. "busy∩jank %" = share of >33.4 ms frames that overlap a long animation frame in which the main thread really worked (script + style/layout/paint >= half the frame, or a >50 ms task); low = the frame was raster/composite-bound (the LoAF is the main thread waiting on the compositor), high = main-thread script/style/layout. "paint suspects" = what the section holds that is costly to raster (filters, blend, masks, canvas, video, image megapixels, infinite animations).

## Runs

| run | viewport | lenis | secs | rAF frames | fps | mean ms | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | LoAF block ms | busy∩jank % | CLS total | CLS (session) | pops | shots |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| desktop | 1440x900 | off | 65.2 | 805 | 12.3 | 81 | 16.7 | 333.4 | 683.3 | 32.5 | 28.4 | 1499.9 | 223 | 680 | 6.9 | 0 | 0 | 22 | 480 |

## Top 10 hotspots (by mean frame time; rm excluded)

| # | run | where | frames | fps | mean | p95 | p99 | >50 % | max | mean / run mean | LoAF block ms | likely cause |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | desktop | principles | 10 | 2.8 | 353.3 | 1333.3 | 1333.3 | 70 | 1333.3 | 4.4 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.6% waiting for the compositor — on screen: 52 will-change [while scrolling: raster 807.8 ms/s, 7.6 paints/s — repainting: #document ×8; div.relative.grid.grid-cols-1 in #principles ×3 \| idle 60.2 fps, raster 0 ms/s, 0 paints/s] |
| 2 | desktop | systems | 11 | 3.6 | 277.3 | 716.6 | 716.6 | 90.9 | 716.6 | 3.4 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.4% waiting for the compositor — on screen: 1 mask, 1 MP of images [while scrolling: raster 784 ms/s, 6.2 paints/s — repainting: #document ×10; svg.absolute.inset-0.size-full viewBox=0 0 360 488 in #systems ×2 \| idle 60.5 fps, raster 0 ms/s, 0 paints/s] |
| 3 | desktop | trading-algos | 7 | 3.7 | 273.8 | 566.6 | 566.6 | 100 | 566.6 | 3.4 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99% waiting for the compositor — on screen: 2 filter [while scrolling: raster 689.2 ms/s, 8.3 paints/s — repainting: #document ×7; div.relative.flex.flex-col in #act-2 ×6 \| idle 60.2 fps, raster 0 ms/s, 0 paints/s] |
| 4 | desktop | work | 11 | 3.9 | 257.6 | 599.9 | 599.9 | 81.8 | 599.9 | 3.2 | 243 | raster/composite-bound: only 22.2% of janky frames overlap real main-thread work; the LoAFs are 99.5% waiting for the compositor — on screen: 3 filter, 1 blend, 2 mask, 1.6 MP of images [while scrolling: raster 871.1 ms/s, 9.5 paints/s — repainting: #document ×9; div.relative.flex.flex-col in #act-2 ×7 \| idle 60.6 fps, raster 0 ms/s, 0.7 paints/s] |
| 5 | desktop | kill-list | 9 | 4 | 248.1 | 650 | 650 | 88.9 | 650 | 3.1 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.3% waiting for the compositor — on screen: 1 mask, 0.3 MP of images [while scrolling: raster 757.6 ms/s, 5.8 paints/s — repainting: #document ×9; div.absolute.inset-x-0.top-0 in #kill-list ×2 \| idle 60.6 fps, raster 0 ms/s, 0 paints/s] |
| 6 | desktop | writing | 13 | 4.2 | 239.7 | 650 | 650 | 69.2 | 650 | 3 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.2% waiting for the compositor — on screen: 8 filter, 1 mask, 2 will-change [while scrolling: raster 745.7 ms/s, 22.8 paints/s — repainting: #document ×13; svg.size-full.overflow-visible.will-change-transform viewBox=0 0 400 500[data-motif=journal-landscape] in #writing ×11 \| idle 60.7 fps, raster 0 ms/s, 1.3 paints/s] |
| 7 | desktop | journey | 16 | 4.5 | 219.8 | 500 | 500 | 87.5 | 500 | 2.7 | 33 | main thread, script-bound (0.8% script; top: event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 18 ms) [while scrolling: raster 833.2 ms/s, 13.9 paints/s — repainting: #document ×16; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×11 \| idle 60.6 fps, raster 0 ms/s, 0 paints/s] |
| 8 | desktop | beyond | 30 | 6.6 | 151.1 | 500.1 | 783.4 | 50 | 783.4 | 1.9 | 13 | raster/composite-bound: only 12.5% of janky frames overlap real main-thread work; the LoAFs are 99% waiting for the compositor — on screen: 6 filter, 2.8 MP of images [while scrolling: raster 788.4 ms/s, 12.6 paints/s — repainting: #document ×24; span.block in #header ×8 \| idle 60.3 fps, raster 0 ms/s, 0.7 paints/s] |
| 9 | desktop | optuna-screener | 29 | 7.2 | 139.7 | 333.3 | 566.6 | 65.5 | 566.6 | 1.7 | 67 | raster/composite-bound: only 10% of janky frames overlap real main-thread work; the LoAFs are 98.7% waiting for the compositor — on screen: 2 filter, 1 MP of images [while scrolling: raster 730.9 ms/s, 21.2 paints/s — repainting: #document ×28; svg.absolute.inset-0.size-full viewBox=0 0 1000 236 in #optuna-screener ×8 \| idle 60.6 fps, raster 0 ms/s, 0 paints/s] |
| 10 | desktop | top | 13 | 8.6 | 116.7 | 499.9 | 499.9 | 38.5 | 499.9 | 1.4 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.6% waiting for the compositor — on screen: 1 filter, 1 blend, 1 mask, 3 will-change, 2.3 MP of images [while scrolling: raster 1029.3 ms/s, 19.1 paints/s — repainting: #document ×9; header.fixed.inset-x-0.top-0 in #header ×5 \| idle 11.9 fps, raster 872 ms/s, 14.7 paints/s (#document ×11; div.relative.px-gutter.pt-tier-group ×9)] |

## Idle probe (desktop: parked 2.5 s on each section, then 1.5 s traced standing still; high raster with few paints = a raster-heavy layer, many paints/s = continuous animation)

| section | idle fps | raster ms/s | paints/s | paint ms/s | style+layout ms/s | rAF JS ms/s | top repainting nodes |
|---|---|---|---|---|---|---|---|
| top | 11.9 | 872 | 14.7 | 6.1 | 5.8 | 12.2 | #document ×11; div.relative.px-gutter.pt-tier-group ×9; img.pointer-events-none.absolute.inset-0 ×1 |
| act-1 | 60.6 | 0 | 1.3 | 0.5 | 3.5 | 13.1 | #document ×1; img.pointer-events-none.absolute.inset-0 ×1 |
| about | 60.6 | 0 | 0 | 0 | 3.4 | 16.4 |  |
| journey | 60.6 | 0 | 0 | 0 | 0.2 | 13.1 |  |
| act-2 | 60.1 | 0 | 0.7 | 0.3 | 6.9 | 18.5 | #document ×1 |
| work | 60.6 | 0 | 0.7 | 0.5 | 0.6 | 14 | #document ×1 |
| trading-algos | 60.2 | 0 | 0 | 0 | 0 | 16.6 |  |
| optuna-screener | 60.6 | 0 | 0 | 0 | 0 | 13.8 |  |
| experiment | 60.6 | 0 | 0 | 0 | 0 | 12.2 |  |
| systems | 60.5 | 0 | 0 | 0 | 0 | 12.9 |  |
| kill-list | 60.6 | 0 | 0 | 0 | 0 | 12.3 |  |
| films | 60.4 | 0 | 0.7 | 0.4 | 3.3 | 13.5 | #document ×1 |
| act-3 | 60.5 | 0 | 1.3 | 1.1 | 14.1 | 18.2 | #document ×2 |
| beyond | 60.3 | 0 | 0.7 | 0.4 | 6.9 | 15 | #document ×1 |
| writing | 60.7 | 0 | 1.3 | 0.8 | 11 | 17.5 | #document ×2 |
| voices | 60.5 | 0 | 0 | 0 | 0 | 12.6 |  |
| act-4 | 60.6 | 0 | 0 | 0 | 0 | 13.6 |  |
| principles | 60.2 | 0 | 0 | 0 | 0 | 13.7 |  |
| contact | 60.4 | 0 | 1.3 | 0.8 | 15.1 | 18 | #document ×2 |
| credits | 60.3 | 0 | 0 | 0 | 0 | 12.9 |  |

## desktop — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 13 | 8.6 | 116.7 | 16.7 | 499.9 | 499.9 | 38.5 | 38.5 | 499.9 | 4 | 0 | 0 | 0 | 1029.3 | 19.1 | #document ×9; header.fixed.inset-x-0.top-0 in #header ×5 |  | 1 filter, 1 blend, 1 mask, 3 will-change, 2.3 MP of images |
| act-1 | 97 | 23.5 | 42.6 | 16.7 | 283.3 | 550 | 12.4 | 11.3 | 550 | 6 | 0 | 0 | 0 | 533 | 13.8 | #document ×21; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×10 |  | 2 mask, 1 will-change, 1.2 MP of images |
| about | 10 | 7.3 | 136.7 | 133.3 | 283.4 | 283.4 | 80 | 80 | 283.4 | 6 | 11 | 12.5 | 0 | 805.7 | 22 | #document ×7; div.relative.flex.flex-col in #act-2 ×5 |  | 1 mask |
| journey | 16 | 4.5 | 219.8 | 266.7 | 500 | 500 | 87.5 | 87.5 | 500 | 13 | 33 | 35.7 | 0 | 833.2 | 13.9 | #document ×16; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×11 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (18 ms) | 1 mask, 0.8 MP of images |
| act-2 | 44 | 14.7 | 68.2 | 16.7 | 300 | 466.6 | 31.8 | 29.5 | 466.6 | 13 | 0 | 0 | 0 | 629.7 | 26.3 | #document ×25; span.block in #act-2 ×11 | user-callback:FrameRequestCallback @ 3ak3gv1hj96wq.js v (5 ms) | 2 filter, 2 mask, 7 will-change, 3.5 MP of images |
| work | 11 | 3.9 | 257.6 | 250 | 599.9 | 599.9 | 81.8 | 81.8 | 599.9 | 9 | 243 | 22.2 | 0 | 871.1 | 9.5 | #document ×9; div.relative.flex.flex-col in #act-2 ×7 |  | 3 filter, 1 blend, 2 mask, 1.6 MP of images |
| trading-algos | 7 | 3.7 | 273.8 | 250 | 566.6 | 566.6 | 100 | 100 | 566.6 | 7 | 0 | 0 | 0 | 689.2 | 8.3 | #document ×7; div.relative.flex.flex-col in #act-2 ×6 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (5 ms) | 2 filter |
| optuna-screener | 29 | 7.2 | 139.7 | 116.7 | 333.3 | 566.6 | 69 | 65.5 | 566.6 | 20 | 67 | 10 | 0 | 730.9 | 21.2 | #document ×28; svg.absolute.inset-0.size-full viewBox=0 0 1000 236 in #optuna-screener ×8 | user-callback:FrameRequestCallback @ 3ak3gv1hj96wq.js v (5 ms) | 2 filter, 1 MP of images |
| experiment | 53 | 46.8 | 21.4 | 16.7 | 49.9 | 200 | 5.7 | 1.9 | 200 | 2 | 0 | 0 | 0 | 390.9 | 15.9 | #document ×11; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×4 |  |  |
| systems | 11 | 3.6 | 277.3 | 233.3 | 716.6 | 716.6 | 90.9 | 90.9 | 716.6 | 10 | 0 | 0 | 0 | 784 | 6.2 | #document ×10; svg.absolute.inset-0.size-full viewBox=0 0 360 488 in #systems ×2 |  | 1 mask, 1 MP of images |
| kill-list | 9 | 4 | 248.1 | 216.7 | 650 | 650 | 88.9 | 88.9 | 650 | 8 | 0 | 0 | 0 | 757.6 | 5.8 | #document ×9; div.absolute.inset-x-0.top-0 in #kill-list ×2 | user-callback:FrameRequestCallback @ 3ak3gv1hj96wq.js v (5 ms) | 1 mask, 0.3 MP of images |
| films | 179 | 14.9 | 67.2 | 33.3 | 233.2 | 683.3 | 41.9 | 31.8 | 833.2 | 58 | 84 | 4 | 0 | 712.5 | 19.7 | #document ×127; svg.pointer-events-none.absolute.inset-0 viewBox=0 0 2333 1000 in #films ×38 | user-callback:FrameRequestCallback @ 3ak3gv1hj96wq.js v (8 ms) | 3.9 MP of images |
| act-3 | 67 | 21.2 | 47.3 | 16.7 | 166.6 | 1200 | 9 | 9 | 1200 | 6 | 141 | 33.3 | 0 | 484.4 | 13.6 | #document ×20; span.block in #header ×13 | user-callback:FrameRequestCallback @ 3ak3gv1hj96wq.js v (6 ms) | 1 filter, 2 mask, 5 will-change, 2 MP of images |
| beyond | 30 | 6.6 | 151.1 | 66.6 | 500.1 | 783.4 | 53.3 | 50 | 783.4 | 15 | 13 | 12.5 | 0 | 788.4 | 12.6 | #document ×24; span.block in #header ×8 | user-callback:FrameRequestCallback @ 3ak3gv1hj96wq.js v (6 ms) | 6 filter, 2.8 MP of images |
| writing | 13 | 4.2 | 239.7 | 199.9 | 650 | 650 | 76.9 | 69.2 | 650 | 9 | 0 | 0 | 0 | 745.7 | 22.8 | #document ×13; svg.size-full.overflow-visible.will-change-transform viewBox=0 0 400 500[data-motif=journal-landscape] in #writing ×11 |  | 8 filter, 1 mask, 2 will-change |
| voices | 8 | 5.8 | 172.9 | 233.3 | 300.1 | 300.1 | 87.5 | 87.5 | 300.1 | 7 | 0 | 0 | 0 | 655.7 | 16.6 | #document ×7; div.relative.flex.flex-col in #act-4 ×6 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (5 ms) | 1 mask, 2.3 MP of images |
| act-4 | 92 | 29.5 | 33.9 | 16.7 | 133.2 | 416.6 | 8.7 | 8.7 | 416.6 | 7 | 88 | 12.5 | 0 | 516.3 | 28.6 | #document ×36; div.block in #act-4 ×16 |  | 2 mask, 5 will-change, 2.3 MP of images |
| principles | 10 | 2.8 | 353.3 | 266.8 | 1333.3 | 1333.3 | 80 | 70 | 1333.3 | 7 | 0 | 0 | 0 | 807.8 | 7.6 | #document ×8; div.relative.grid.grid-cols-1 in #principles ×3 |  | 52 will-change |
| contact | 4 | 2.1 | 483.3 | 283.3 | 1499.9 | 1499.9 | 75 | 75 | 1499.9 | 3 | 0 | 0 | 0 | 914.5 | 6.2 | #document ×4; span.block in #contact ×2 |  | 4 mask, 0.9 MP of images |
| credits | 102 | 28.1 | 35.6 | 16.7 | 100 | 283.3 | 18.6 | 11.8 | 433.3 | 13 | 0 | 0 | 0 | 700.8 | 29.2 | #document ×50; footer#credits.relative.isolate.bg-bg in #credits ×36 |  |  |

### desktop — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 450→2484 | 104 | 21.1 | 47.4 | 16.7 | 283.3 | 400 | 15.4 | 550 | 10 | 0 | 0 |
| act-2 | 6146→8018 | 47 | 11.2 | 89 | 16.7 | 333.4 | 599.9 | 34 | 599.9 | 16 | 0 | 0 |
| act-3 | 25781→27131 | 80 | 21.1 | 47.3 | 16.7 | 200.1 | 1200 | 11.3 | 1200 | 9 | 141 | 22.2 |
| act-4 | 34491→36363 | 94 | 21.7 | 46.1 | 16.7 | 266.7 | 883.2 | 10.6 | 883.2 | 10 | 88 | 10 |

### desktop — longest animation frames (LoAF total 50362 ms, main-thread work 465 ms, blocking 680 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 59.78 | contact | 1496 | 0 | 1 | 1 | 0 | (no script) |  |
| 58.2 | principles | 1331 | 0 | 2 | 2 | 0 | (no script) |  |
| 40.97 | act-3 | 1195 | 141 | 2 | 2 | 0 | (no script) |  |
| 56.45 | principles | 880 | 0 | 3 | 3 | 0 | (no script) |  |
| 37.66 | films | 820 | 0 | 1 | 1 | 0 | (no script) |  |

### desktop — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 31.27 | films | 71 | 0 | 9 | 1 | 8 | user-callback:FrameRequestCallback @ 3ak3gv1hj96wq.js v 8 ms | `()=>{let s=i.MotionGlobalConfig.useManualTiming,o=s?a.timestamp:performance.now();n=!1,s\|\|` |
| 8.71 | journey | 338 | 0 | 8 | 1 | 7 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 7 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| 40.81 | act-3 | 156 | 0 | 8 | 2 | 6 | user-callback:FrameRequestCallback @ 3ak3gv1hj96wq.js v 6 ms | `()=>{let s=i.MotionGlobalConfig.useManualTiming,o=s?a.timestamp:performance.now();n=!1,s\|\|` |
| 47.88 | beyond | 53 | 0 | 8 | 2 | 6 | user-callback:FrameRequestCallback @ 3ak3gv1hj96wq.js v 6 ms | `()=>{let s=i.MotionGlobalConfig.useManualTiming,o=s?a.timestamp:performance.now();n=!1,s\|\|` |
| 7.39 | journey | 124 | 0 | 7 | 1 | 6 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 6 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |

### desktop — layout shifts (CLS total 0, session 0, 2 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 49.24 | 0 | writing | span.pointer-events-none.absolute.bottom-[0.18em] in #writing |
| 49.41 | 0 | writing | span.pointer-events-none.absolute.bottom-[0.18em] in #writing |

### desktop — visual pops (22; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 3.44 | 800 | act-1 | 0 | 16.3 | 7.6 | fill-in | 32.4 | 1 |
| 6.70 | 2000 | about | 0 | 5.1 | 5.6 | change | 7.2 | 2 |
| 7.14 | 2300 | journey | 0 | 4.8 | 15.3 | change | 11.4 | 1 |
| 12.96 | 6900 | act-2 | 0 | 33.1 | 18.1 | change | 45.3 | 1 |
| 13.59 | 7000 | act-2 | 0 | 10.6 | 17.7 | change | 21.6 | 1 |
| 15.51 | 7900 | work | 0 | 24.7 | 247.8 | fill-in | 25.3 | 1 |
| 17.16 | 9400 | trading-algos | 0 | 6.7 | 11.1 | change | 11.7 | 1 |
| 29.49 | 21000 | films | 0 | 6.1 | 37 | fill-in | 13.1 | 1 |
| 46.80 | 27400 | beyond | 0 | 10.7 | 5 | fill-in | 9.4 | 1 |
| 46.97 | 27600 | beyond | 0 | 8.3 | 4.1 | change | 12.2 | 1 |
| 48.92 | 30100 | writing | 0 | 13.5 | 6.7 | fill-in | 11.6 | 1 |
| 49.23 | 30200 | writing | 0 | 20 | 9.8 | change | 17.2 | 1 |
| 49.49 | 30700 | writing | 0 | 9 | 4.2 | blank-out | 5.1 | 1 |
| 51.06 | 31500 | writing | 0 | 16.7 | 7.8 | blank-out | 8.3 | 1 |
| 51.45 | 32100 | writing | 0 | 58.7 | 26.3 | change | 30 | 1 |
| 54.74 | 35200 | act-4 | 0 | 9.8 | 5.4 | change | 19.5 | 1 |
| 55.35 | 35300 | act-4 | 0 | 4.6 | 6.1 | change | 7.6 | 1 |
| 55.76 | 35400 | act-4 | 0 | 5.7 | 17 | change | 8.8 | 1 |
| 56.82 | 35800 | principles | 0 | 12.5 | 51.5 | change | 6.8 | 2 |
| 57.24 | 35900 | principles | 0 | 12.5 | 43.2 | change | 7.2 | 1 |
| 60.24 | 37300 | contact | 0 | 88.2 | 60.2 | change | 48 | 1 |
| 62.52 | 39500 | credits | 0 | 5.8 | 4 | fill-in | 6.1 | 1 |

## Strips

- strips/desktop-act-1.png
- strips/desktop-act-2.png
- strips/desktop-act-3.png
- strips/desktop-act-4.png
- strips/desktop-first-60s.png
- strips/pop-desktop-433.png
- strips/pop-desktop-358.png
- strips/pop-desktop-90.png
- strips/pop-desktop-109.png
