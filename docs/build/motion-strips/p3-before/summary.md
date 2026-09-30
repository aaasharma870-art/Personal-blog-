# Motion baseline — 2026-09-30T16:38:52.547Z

Base http://localhost:3161 · Chromium 141.0.7390.37 headless · 4 CPUs · screencast everyNthFrame=1.

> Headless Chromium rasterises in software (SwiftShader) on a few CPUs and pays for the screencast readback, so absolute frame times are pessimistic vs a real laptop/phone GPU. Read them as RELATIVE hotspots: which sections and transitions are worst. "busy∩jank %" = share of >33.4 ms frames that overlap a long animation frame in which the main thread really worked (script + style/layout/paint >= half the frame, or a >50 ms task); low = the frame was raster/composite-bound (the LoAF is the main thread waiting on the compositor), high = main-thread script/style/layout. "paint suspects" = what the section holds that is costly to raster (filters, blend, masks, canvas, video, image megapixels, infinite animations).

## Runs

| run | viewport | secs | rAF frames | fps | mean ms | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | LoAF block ms | busy∩jank % | CLS total | CLS (session) | pops | shots |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| intro | 1440x900 | 10.5 | 309 | 29.5 | 33.9 | 16.7 | 116.6 | 133.4 | 24.3 | 21.7 | 183.4 | 83 | 1024 | 10.7 | 0 | 0 | 4 | 134 |
| desktop | 1440x900 | 61.6 | 937 | 15.2 | 65.7 | 16.7 | 316.7 | 633.4 | 25.5 | 21.7 | 1116.7 | 202 | 343 | 1.7 | 0 | 0 | 27 | 583 |

## Top 10 hotspots (by mean frame time; rm excluded)

| # | run | where | frames | fps | mean | p95 | p99 | >50 % | max | mean / run mean | LoAF block ms | likely cause |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | desktop | work | 8 | 3.2 | 312.5 | 616.6 | 616.6 | 87.5 | 616.6 | 4.8 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.5% waiting for the compositor — on screen: 3 filter, 1 blend, 2 mask, 1.6 MP of images [while scrolling: raster 771.2 ms/s, 8.4 paints/s — repainting: #document ×7; div.relative.flex.flex-col in #act-2 ×6 \| idle 60.1 fps, raster 0 ms/s, 0 paints/s] |
| 2 | desktop | principles | 13 | 3.3 | 298.7 | 1083.3 | 1083.3 | 69.2 | 1083.3 | 4.5 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.7% waiting for the compositor — on screen: 52 will-change [while scrolling: raster 813.5 ms/s, 10.3 paints/s — repainting: #document ×11; div.relative.flex.flex-col in #act-4 ×6 \| idle 60.2 fps, raster 0 ms/s, 0 paints/s] |
| 3 | desktop | journey | 14 | 3.5 | 286.9 | 766.6 | 766.6 | 92.9 | 766.6 | 4.4 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.4% waiting for the compositor — on screen: 1 mask, 0.8 MP of images [while scrolling: raster 757.1 ms/s, 11 paints/s — repainting: #document ×12; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×8 \| idle 60.3 fps, raster 0 ms/s, 0 paints/s] |
| 4 | desktop | kill-list | 10 | 3.9 | 253.3 | 733.3 | 733.3 | 80 | 733.3 | 3.9 | 248 | raster/composite-bound: only 25% of janky frames overlap real main-thread work; the LoAFs are 99.6% waiting for the compositor — on screen: 1 mask, 0.3 MP of images [while scrolling: raster 747.7 ms/s, 9.9 paints/s — repainting: #document ×10; div.relative.@container in #header ×2 \| idle 60.6 fps, raster 0 ms/s, 0 paints/s] |
| 5 | desktop | writing | 13 | 5 | 198.7 | 483.4 | 483.4 | 76.9 | 483.4 | 3 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99% waiting for the compositor — on screen: 8 filter, 1 mask, 2 will-change [while scrolling: raster 742.5 ms/s, 24 paints/s — repainting: #document ×13; svg.size-full.overflow-visible.will-change-transform viewBox=0 0 400 500[data-motif=journal-landscape] in #writing ×12 \| idle 60.3 fps, raster 0 ms/s, 0.7 paints/s] |
| 6 | desktop | voices | 8 | 5.2 | 193.7 | 566.7 | 566.7 | 50 | 566.7 | 2.9 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.3% waiting for the compositor — on screen: 1 mask, 2.3 MP of images [while scrolling: raster 728.4 ms/s, 20 paints/s — repainting: #document ×8; div.rdr2-module__R8wI0W__campSticky in #voices ×5 \| idle 57.7 fps, raster 0 ms/s, 0 paints/s] |
| 7 | desktop | trading-algos | 11 | 6.5 | 153 | 399.9 | 399.9 | 63.6 | 399.9 | 2.3 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.4% waiting for the compositor — on screen: 2 filter [while scrolling: raster 785.4 ms/s, 16.6 paints/s — repainting: #document ×11; div.relative.flex.flex-col in #act-2 ×6 \| idle 60.3 fps, raster 0 ms/s, 0 paints/s] |
| 8 | desktop | systems | 16 | 6.8 | 146.9 | 533.3 | 533.3 | 56.3 | 533.3 | 2.2 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.4% waiting for the compositor — on screen: 1 mask, 1 MP of images [while scrolling: raster 940.9 ms/s, 16.6 paints/s — repainting: #document ×15; svg.absolute.inset-0.size-full viewBox=0 0 360 488 in #systems ×5 \| idle 60.2 fps, raster 0 ms/s, 0 paints/s] |
| 9 | desktop | about | 11 | 7.2 | 139.4 | 400.1 | 400.1 | 63.6 | 400.1 | 2.1 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 98.4% waiting for the compositor — on screen: 1 mask [while scrolling: raster 771.5 ms/s, 26.7 paints/s — repainting: #document ×10; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×8 \| idle 60.5 fps, raster 0 ms/s, 0 paints/s] |
| 10 | desktop | top | 14 | 8.6 | 116.7 | 433.3 | 433.3 | 42.9 | 433.3 | 1.8 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.6% waiting for the compositor — on screen: 1 filter, 1 blend, 1 mask, 3 will-change, 2.3 MP of images [while scrolling: raster 945.3 ms/s, 17.8 paints/s — repainting: #document ×9; header.fixed.inset-x-0.top-0 in #header ×5 \| idle 31.9 fps, raster 560.6 ms/s, 5.3 paints/s (#document ×4)] |

## Idle probe (desktop: parked 2.5 s on each section, then 1.5 s traced standing still; high raster with few paints = a raster-heavy layer, many paints/s = continuous animation)

| section | idle fps | raster ms/s | paints/s | paint ms/s | style+layout ms/s | rAF JS ms/s | top repainting nodes |
|---|---|---|---|---|---|---|---|
| top | 31.9 | 560.6 | 5.3 | 1.7 | 2.8 | 9.4 | #document ×4; div.relative.px-gutter.pt-tier-group ×2; img.pointer-events-none.absolute.inset-0 ×1 |
| act-1 | 60.3 | 0 | 0 | 0 | 0 | 6.7 |  |
| about | 60.5 | 0 | 0 | 0 | 1.3 | 7.4 |  |
| journey | 60.3 | 0 | 0 | 0 | 0.1 | 7.4 |  |
| act-2 | 60.6 | 0 | 0 | 0 | 1.5 | 8.2 |  |
| work | 60.1 | 0 | 0 | 0 | 0 | 6.4 |  |
| trading-algos | 60.3 | 0 | 0 | 0 | 0 | 7.6 |  |
| optuna-screener | 60.3 | 0 | 0 | 0 | 0 | 6 |  |
| experiment | 60.4 | 0 | 0 | 0 | 0 | 7.2 |  |
| systems | 60.2 | 0 | 0 | 0 | 0 | 6 |  |
| kill-list | 60.6 | 0 | 0 | 0 | 0 | 6.1 |  |
| films | 60.4 | 0 | 0.7 | 0.3 | 0.6 | 7 | #document ×1 |
| act-3 | 60.6 | 0 | 0.7 | 0.4 | 4.5 | 10 | #document ×1 |
| beyond | 60.1 | 0 | 0 | 0 | 0 | 5.7 |  |
| writing | 60.3 | 0 | 0.7 | 1.7 | 0.2 | 6.1 | #document ×1 |
| voices | 57.7 | 0 | 0 | 0 | 0 | 6.9 |  |
| act-4 | 60.6 | 0 | 0 | 0 | 0 | 5.9 |  |
| principles | 60.2 | 0 | 0 | 0 | 0 | 7.4 |  |
| contact | 60.6 | 0 | 0.7 | 0.2 | 0.8 | 6.4 | #document ×1 |
| credits | 60.4 | 0 | 0 | 0 | 0 | 6.4 |  |

## intro — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| intro:play-screen | 61 | 22.7 | 44 | 16.7 | 83.4 | 883.4 | 26.2 | 18 | 883.4 | 11 | 908 | 25 | 0 | 172.2 | 20.9 | #document ×26; div.relative.px-gutter.pt-tier-group in #act-1 ×17 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (137 ms) |  |
| intro:flight | 75 | 13.3 | 75.3 | 66.7 | 133.4 | 183.3 | 85.3 | 77.3 | 183.3 | 62 | 51 | 4.7 | 0 | 517.7 | 3.7 | #document ×6; video ×3 | event-listener:BUTTON#intro-play.onclick @ intro.js (77 ms) |  |
| intro:landing | 6 | 9.2 | 108.3 | 116.7 | 183.4 | 183.4 | 83.3 | 83.3 | 183.4 | 4 | 0 | 20 | 0 | 644.6 | 21.5 | #document ×6; div#intro ×6 |  |  |
| top | 228 | 54.5 | 18.3 | 16.7 | 16.8 | 83.3 | 2.6 | 1.8 | 116.7 | 6 | 65 | 66.7 | 0 | 17.5 | 3.3 | #document ×6; div.hero-cap__in in #top ×2 | user-callback:FrameRequestCallback (54 ms) | 1 filter, 1 blend, 1 mask, 3 will-change, 2.3 MP of images |

### intro — longest animation frames (LoAF total 7883 ms, main-thread work 396 ms, blocking 1024 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| -2.39 | intro:play-screen | 895 | 836 | 1 | 1 | 0 | (no script) |  |
| 5.74 | intro:landing | 192 | 0 | 0 | 0 | 0 | (no script) |  |
| 0.53 | intro:flight | 180 | 0 | 0 | 0 | 0 | (no script) |  |
| 5.53 | intro:flight | 162 | 16 | 65 | 65 | 0 | (no script) |  |
| 6.27 | top | 160 | 8 | 56 | 2 | 54 | user-callback:FrameRequestCallback 54 ms |  |

### intro — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| -0.03 | intro:flight | 114 | 35 | 77 | 0 | 77 | event-listener:BUTTON#intro-play.onclick @ intro.js 77 ms | `(){we()})),o.addEventListener("click",(function(){Ne("skip")})),a.addEventListener("pointe` |
| -2.52 | intro:play-screen | 86 | 34 | 70 | 0 | 70 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 70 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| -2.61 | intro:play-screen | 88 | 38 | 68 | 1 | 67 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 67 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| 5.53 | intro:flight | 162 | 16 | 65 | 65 | 0 | (no script) |  |
| 6.27 | top | 160 | 8 | 56 | 2 | 54 | user-callback:FrameRequestCallback 54 ms |  |

### intro — layout shifts (CLS total 0, session 0, 0 shifts)


### intro — visual pops (4; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 1.52 | 0 | intro:flight | 0 | 8.4 | 168 | change | 13.7 | 1 |
| 2.00 | 0 | intro:flight | 0 | 9.7 | 17.1 | change | 12.3 | 6 |
| 3.12 | 0 | intro:flight | 0 | 15.7 | 8.4 | change | 34.8 | 9 |
| 7.02 | 0 | top | 0 | 8.9 | 9.1 | change | 9.2 | 1 |

## desktop — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 14 | 8.6 | 116.7 | 16.8 | 433.3 | 433.3 | 42.9 | 42.9 | 433.3 | 5 | 0 | 0 | 0 | 945.3 | 17.8 | #document ×9; header.fixed.inset-x-0.top-0 in #header ×5 |  | 1 filter, 1 blend, 1 mask, 3 will-change, 2.3 MP of images |
| act-1 | 98 | 28.8 | 34.7 | 16.7 | 200 | 283.3 | 12.2 | 11.2 | 283.3 | 7 | 67 | 8.3 | 0 | 456.2 | 17.4 | #document ×23; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×10 |  | 2 mask, 1 will-change, 1.2 MP of images |
| about | 11 | 7.2 | 139.4 | 83.2 | 400.1 | 400.1 | 63.6 | 63.6 | 400.1 | 6 | 0 | 0 | 0 | 771.5 | 26.7 | #document ×10; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×8 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (11 ms) | 1 mask |
| journey | 14 | 3.5 | 286.9 | 266.6 | 766.6 | 766.6 | 92.9 | 92.9 | 766.6 | 12 | 0 | 0 | 0 | 757.1 | 11 | #document ×12; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×8 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (13 ms) | 1 mask, 0.8 MP of images |
| act-2 | 39 | 13.8 | 72.6 | 16.7 | 433.3 | 483.4 | 35.9 | 28.2 | 483.4 | 10 | 0 | 0 | 0 | 737.7 | 35.3 | #document ×32; span.block in #act-2 ×11 |  | 2 filter, 2 mask, 7 will-change, 3.5 MP of images |
| work | 8 | 3.2 | 312.5 | 349.9 | 616.6 | 616.6 | 100 | 87.5 | 616.6 | 7 | 0 | 0 | 0 | 771.2 | 8.4 | #document ×7; div.relative.flex.flex-col in #act-2 ×6 |  | 3 filter, 1 blend, 2 mask, 1.6 MP of images |
| trading-algos | 11 | 6.5 | 153 | 99.9 | 399.9 | 399.9 | 63.6 | 63.6 | 399.9 | 7 | 0 | 0 | 0 | 785.4 | 16.6 | #document ×11; div.relative.flex.flex-col in #act-2 ×6 |  | 2 filter |
| optuna-screener | 35 | 10.1 | 99 | 50 | 433.4 | 466.6 | 57.1 | 42.9 | 466.6 | 18 | 0 | 0 | 0 | 720 | 23.7 | #document ×30; svg.absolute.inset-0.size-full viewBox=0 0 1000 236 in #optuna-screener ×9 |  | 2 filter, 1 MP of images |
| experiment | 72 | 52.7 | 19 | 16.7 | 16.7 | 150 | 2.8 | 1.4 | 150 | 1 | 0 | 0 | 0 | 168.3 | 14.6 | #document ×12; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×4 |  |  |
| systems | 16 | 6.8 | 146.9 | 66.7 | 533.3 | 533.3 | 62.5 | 56.3 | 533.3 | 10 | 0 | 0 | 0 | 940.9 | 16.6 | #document ×15; svg.absolute.inset-0.size-full viewBox=0 0 360 488 in #systems ×5 |  | 1 mask, 1 MP of images |
| kill-list | 10 | 3.9 | 253.3 | 266.7 | 733.3 | 733.3 | 80 | 80 | 733.3 | 8 | 248 | 25 | 0 | 747.7 | 9.9 | #document ×10; div.relative.@container in #header ×2 |  | 1 mask, 0.3 MP of images |
| films | 234 | 19.9 | 50.4 | 16.7 | 150 | 666.6 | 22.2 | 17.1 | 1116.7 | 41 | 28 | 1.9 | 0 | 675.9 | 25.7 | #document ×153; svg.pointer-events-none.absolute.inset-0 viewBox=0 0 2333 1000 in #films ×57 | user-callback:FrameRequestCallback @ 3ak3gv1hj96wq.js v (6 ms) | 3.9 MP of images |
| act-3 | 34 | 13 | 77 | 16.7 | 349.9 | 549.9 | 32.4 | 26.5 | 549.9 | 10 | 0 | 0 | 0 | 671.1 | 18 | #document ×22; span.block in #header ×11 | user-callback:FrameRequestCallback @ 3ak3gv1hj96wq.js v (5 ms) | 1 filter, 2 mask, 5 will-change, 2 MP of images |
| beyond | 44 | 9.5 | 105.7 | 50.1 | 400 | 450 | 56.8 | 52.3 | 450 | 23 | 0 | 0 | 0 | 834.4 | 13.1 | #document ×29; div.rdr2-module__R8wI0W__bandLayer in #beyond ×7 | user-callback:FrameRequestCallback @ 3ak3gv1hj96wq.js v (5 ms) | 6 filter, 2.8 MP of images |
| writing | 13 | 5 | 198.7 | 166.7 | 483.4 | 483.4 | 84.6 | 76.9 | 483.4 | 11 | 0 | 0 | 0 | 742.5 | 24 | #document ×13; svg.size-full.overflow-visible.will-change-transform viewBox=0 0 400 500[data-motif=journal-landscape] in #writing ×12 | user-callback:FrameRequestCallback @ 3ak3gv1hj96wq.js v (7 ms) | 8 filter, 1 mask, 2 will-change |
| voices | 8 | 5.2 | 193.7 | 233.3 | 566.7 | 566.7 | 50 | 50 | 566.7 | 4 | 0 | 0 | 0 | 728.4 | 20 | #document ×8; div.rdr2-module__R8wI0W__campSticky in #voices ×5 |  | 1 mask, 2.3 MP of images |
| act-4 | 112 | 38 | 26.3 | 16.7 | 50 | 266.7 | 6.3 | 4.5 | 283.3 | 6 | 0 | 0 | 0 | 326.8 | 46.4 | #document ×41; span.block in #act-4 ×20 |  | 2 mask, 5 will-change, 2.3 MP of images |
| principles | 13 | 3.3 | 298.7 | 216.6 | 1083.3 | 1083.3 | 76.9 | 69.2 | 1083.3 | 9 | 0 | 0 | 0 | 813.5 | 10.3 | #document ×11; div.relative.flex.flex-col in #act-4 ×6 |  | 52 will-change |
| contact | 3 | 5.6 | 177.8 | 233.5 | 283.2 | 283.2 | 66.7 | 66.7 | 283.2 | 2 | 0 | 0 | 0 | 877.4 | 11.2 | #document ×2; div.relative.flex.flex-col in #act-4 ×1 |  | 4 mask, 0.9 MP of images |
| credits | 148 | 40 | 25 | 16.7 | 50 | 83.3 | 6.8 | 4.1 | 649.9 | 5 | 0 | 0 | 0 | 494.4 | 41.6 | #document ×73; footer#credits.relative.isolate.bg-bg in #credits ×47 |  |  |

### desktop — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 450→2484 | 103 | 26.2 | 38.2 | 16.7 | 200 | 283.3 | 12.6 | 400.1 | 10 | 67 | 7.1 |
| act-2 | 6146→8018 | 40 | 12.6 | 79.6 | 16.7 | 433.3 | 483.4 | 30 | 483.4 | 12 | 0 | 0 |
| act-3 | 25781→27131 | 51 | 16.1 | 62.1 | 16.7 | 333.4 | 549.9 | 23.5 | 549.9 | 15 | 0 | 0 |
| act-4 | 34491→36363 | 116 | 29.2 | 34.2 | 16.7 | 183.3 | 283.3 | 6 | 666.7 | 8 | 0 | 0 |

### desktop — longest animation frames (LoAF total 45086 ms, main-thread work 345 ms, blocking 343 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 36.79 | films | 1137 | 0 | 1 | 1 | 0 | (no script) |  |
| 56.01 | principles | 1092 | 0 | 1 | 1 | 0 | (no script) |  |
| 37.94 | films | 1041 | 0 | 1 | 1 | 0 | (no script) |  |
| 6.74 | journey | 769 | 0 | 4 | 4 | 0 | (no script) |  |
| 54.48 | principles | 750 | 0 | 1 | 1 | 0 | (no script) |  |

### desktop — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 40.64 | act-3 | 304 | 0 | 13 | 13 | 0 | (no script) |  |
| 19.91 | optuna-screener | 137 | 0 | 11 | 11 | 0 | (no script) |  |
| 46.94 | writing | 133 | 0 | 9 | 2 | 7 | user-callback:FrameRequestCallback @ 3ak3gv1hj96wq.js v 7 ms | `()=>{let s=i.MotionGlobalConfig.useManualTiming,o=s?a.timestamp:performance.now();n=!1,s\|\|` |
| 3.15 | act-1 | 119 | 0 | 8 | 8 | 0 | (no script) |  |
| 8.7 | journey | 265 | 0 | 7 | 0 | 7 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 7 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |

### desktop — layout shifts (CLS total 0, session 0, 3 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 46.77 | 0 | writing | span.pointer-events-none.absolute.bottom-[0.18em] in #writing |
| 46.93 | 0 | writing | span.pointer-events-none.absolute.bottom-[0.18em] in #writing |
| 46.43 | 0 | writing | span.pointer-events-none.absolute.bottom-[0.18em] in #writing |

### desktop — visual pops (27; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 2.91 | 1000 | act-1 | 0 | 17.5 | 9 | fill-in | 32.5 | 1 |
| 5.69 | 2000 | about | 0 | 4.7 | 469.6 | change | 6.5 | 3 |
| 6.04 | 2200 | about | 0 | 3.1 | 310.2 | change | 7 | 1 |
| 6.35 | 2300 | about | 0 | 6.3 | 632.5 | change | 14.9 | 2 |
| 7.26 | 2800 | journey | 0 | 2.4 | 8.1 | fill-in | 7.2 | 1 |
| 12.07 | 6900 | act-2 | 0 | 31.3 | 9.7 | change | 43.9 | 1 |
| 14.39 | 7900 | work | 0 | 24.5 | 215.2 | fill-in | 25.1 | 1 |
| 15.92 | 9100 | work | 0 | 16.8 | 133.6 | fill-in | 29.1 | 2 |
| 16.79 | 10600 | trading-algos | 0 | 11 | 10.4 | fill-in | 44.9 | 1 |
| 29.07 | 21400 | films | 0 | 4.1 | 10.3 | fill-in | 5.9 | 2 |
| 29.76 | 21400 | films | 0 | 3.8 | 18.1 | change | 7.8 | 1 |
| 32.56 | 22300 | films | 0 | 15.3 | 100.2 | change | 13.1 | 1 |
| 32.87 | 22500 | films | 0 | 2.7 | 17.2 | change | 4.2 | 1 |
| 41.05 | 25900 | act-3 | 0 | 9.3 | 82 | change | 14.3 | 1 |
| 41.37 | 26100 | act-3 | 0 | 7.3 | 4.4 | change | 13 | 1 |
| 44.12 | 27400 | beyond | 0 | 5.2 | 4.6 | change | 8.1 | 1 |
| 47.09 | 30900 | writing | 0 | 54 | 10.6 | blank-out | 26.7 | 1 |
| 49.34 | 32100 | voices | 0 | 4.6 | 4.6 | change | 10.3 | 1 |
| 49.93 | 32800 | voices | 0 | 2.3 | 4.2 | change | 4.9 | 1 |
| 50.28 | 33200 | voices | 0 | 6.7 | 12.3 | fill-in | 15 | 1 |
| 50.63 | 34000 | act-4 | 0 | 4 | 7.4 | change | 8 | 2 |
| 51.92 | 35300 | act-4 | 0 | 13.5 | 29.4 | change | 27.5 | 1 |
| 52.74 | 35400 | act-4 | 0 | 5.7 | 24.1 | change | 8.8 | 1 |
| 53.41 | 35800 | act-4 | 0 | 6.6 | 13.5 | change | 3.6 | 1 |
| 53.99 | 35900 | principles | 0 | 11.5 | 18.1 | change | 6.6 | 2 |
| 55.80 | 37000 | principles | 0 | 47.8 | 19.5 | change | 26 | 2 |
| 57.24 | 37900 | principles | 0 | 13.1 | 5.3 | change | 8.6 | 1 |

## Strips

- strips/intro.png
- strips/intro-landing.png
- strips/pop-intro-64.png
- strips/pop-intro-50.png
- strips/pop-intro-108.png
- strips/desktop-act-1.png
- strips/desktop-act-2.png
- strips/desktop-act-3.png
- strips/desktop-act-4.png
- strips/desktop-first-60s.png
- strips/pop-desktop-504.png
- strips/pop-desktop-93.png
- strips/pop-desktop-291.png
- strips/pop-desktop-397.png
