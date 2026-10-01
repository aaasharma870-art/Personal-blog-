# Motion baseline — 2026-10-01T13:34:14.004Z

Base http://localhost:3162 · Chromium 141.0.7390.37 headless · 4 CPUs · screencast everyNthFrame=1.

> Headless Chromium rasterises in software (SwiftShader) on a few CPUs and pays for the screencast readback, so absolute frame times are pessimistic vs a real laptop/phone GPU. Read them as RELATIVE hotspots: which sections and transitions are worst. "busy∩jank %" = share of >33.4 ms frames that overlap a long animation frame in which the main thread really worked (script + style/layout/paint >= half the frame, or a >50 ms task); low = the frame was raster/composite-bound (the LoAF is the main thread waiting on the compositor), high = main-thread script/style/layout. "paint suspects" = what the section holds that is costly to raster (filters, blend, masks, canvas, video, image megapixels, infinite animations).

## Runs

| run | viewport | lenis | secs | rAF frames | fps | mean ms | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | LoAF block ms | busy∩jank % | CLS total | CLS (session) | pops | shots |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| intro | 1440x900 |  | 10.4 | 237 | 22.8 | 44 | 16.7 | 183.4 | 283.4 | 19.4 | 19 | 483.4 | 62 | 579 | 15.2 | 0.0051 | 0.0051 | 12 | 72 |
| desktop | 1440x900 | off | 74.5 | 644 | 8.6 | 115.6 | 16.7 | 500 | 1066.6 | 34.6 | 31.8 | 2583.2 | 203 | 272 | 1.3 | 0 | 0 | 15 | 376 |

## Top 10 hotspots (by mean frame time; rm excluded)

| # | run | where | frames | fps | mean | p95 | p99 | >50 % | max | mean / run mean | LoAF block ms | likely cause |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | desktop | principles | 9 | 1.6 | 644.4 | 2583.2 | 2583.2 | 66.7 | 2583.2 | 5.6 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.8% waiting for the compositor — on screen: 52 will-change [while scrolling: raster 896.1 ms/s, 4.7 paints/s — repainting: #document ×9; div.relative.flex.flex-col in #act-4 ×7 \| idle 60.6 fps, raster 0 ms/s, 0 paints/s] |
| 2 | desktop | act-3 | 7 | 2 | 500 | 1383.3 | 1383.3 | 85.7 | 1383.3 | 4.3 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.3% waiting for the compositor — on screen: 1 filter, 2 mask, 5 will-change, 2 MP of images [while scrolling: raster 839.8 ms/s, 5.1 paints/s — repainting: #document ×7; video ×2 \| idle 60.5 fps, raster 0 ms/s, 0.7 paints/s] |
| 3 | desktop | kill-list | 8 | 2.5 | 404.2 | 850 | 850 | 87.5 | 850 | 3.5 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99% waiting for the compositor — on screen: 1 mask, 0.3 MP of images [while scrolling: raster 817.1 ms/s, 3.7 paints/s — repainting: #document ×8; svg.absolute.inset-0.size-full viewBox=0 0 360 488 in #systems ×1 \| idle 60.5 fps, raster 0 ms/s, 0.7 paints/s] |
| 4 | desktop | about | 9 | 2.6 | 377.8 | 983.3 | 983.3 | 77.8 | 983.3 | 3.3 | 47 | raster/composite-bound: only 28.6% of janky frames overlap real main-thread work; the LoAFs are 95.3% waiting for the compositor — on screen: 1 mask [while scrolling: raster 793.8 ms/s, 10.9 paints/s — repainting: #document ×7; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×6 \| idle 60.3 fps, raster 0 ms/s, 0 paints/s] |
| 5 | desktop | journey | 10 | 2.7 | 373.3 | 983.3 | 983.3 | 90 | 983.3 | 3.2 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.2% waiting for the compositor — on screen: 1 mask, 0.8 MP of images [while scrolling: raster 769.8 ms/s, 9.4 paints/s — repainting: #document ×10; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×7 \| idle 60.6 fps, raster 0 ms/s, 0 paints/s] |
| 6 | desktop | systems | 7 | 2.8 | 359.5 | 1116.7 | 1116.7 | 71.4 | 1116.7 | 3.1 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.2% waiting for the compositor — on screen: 1 mask, 1 MP of images [while scrolling: raster 923.9 ms/s, 7.5 paints/s — repainting: #document ×6; svg.absolute.inset-0.size-full viewBox=0 0 360 488 in #systems ×2 \| idle 60.5 fps, raster 0 ms/s, 0 paints/s] |
| 7 | desktop | work | 11 | 2.8 | 351.5 | 866.7 | 866.7 | 63.6 | 866.7 | 3 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.4% waiting for the compositor — on screen: 3 filter, 1 blend, 2 mask, 1.6 MP of images [while scrolling: raster 929.3 ms/s, 6.7 paints/s — repainting: #document ×10; div.relative.flex.flex-col in #act-2 ×5 \| idle 60.5 fps, raster 0 ms/s, 0 paints/s] |
| 8 | desktop | writing | 12 | 3.4 | 294.4 | 1049.9 | 1049.9 | 75 | 1049.9 | 2.5 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 98.9% waiting for the compositor — on screen: 8 filter, 1 mask, 2 will-change [while scrolling: raster 775.2 ms/s, 19 paints/s — repainting: #document ×12; svg.size-full.overflow-visible.will-change-transform viewBox=0 0 400 500[data-motif=journal-landscape] in #writing ×10 \| idle 60.2 fps, raster 0 ms/s, 2.7 paints/s] |
| 9 | desktop | trading-algos | 10 | 3.4 | 293.3 | 766.7 | 766.7 | 80 | 766.7 | 2.5 | 225 | raster/composite-bound: only 12.5% of janky frames overlap real main-thread work; the LoAFs are 98.9% waiting for the compositor — on screen: 2 filter [while scrolling: raster 876.2 ms/s, 10.9 paints/s — repainting: #document ×10; div.relative.flex.flex-col in #act-2 ×5 \| idle 60.4 fps, raster 0 ms/s, 0 paints/s] |
| 10 | desktop | beyond | 18 | 3.7 | 270.4 | 1066.6 | 1066.6 | 83.3 | 1066.6 | 2.3 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99% waiting for the compositor — on screen: 6 filter, 2.8 MP of images [while scrolling: raster 815.2 ms/s, 9.7 paints/s — repainting: #document ×17; div.rdr2-module__R8wI0W__bandLayer in #beyond ×4 \| idle 60.3 fps, raster 0 ms/s, 1.3 paints/s] |

## Idle probe (desktop: parked 2.5 s on each section, then 1.5 s traced standing still; high raster with few paints = a raster-heavy layer, many paints/s = continuous animation)

| section | idle fps | raster ms/s | paints/s | paint ms/s | style+layout ms/s | rAF JS ms/s | top repainting nodes |
|---|---|---|---|---|---|---|---|
| top | 17.3 | 731.9 | 2 | 1.4 | 2.2 | 5.7 | #document ×1; img.pointer-events-none.absolute.inset-0 ×1; div.pointer-events-none.absolute.inset-0 ×1 |
| act-1 | 60.3 | 0 | 2.7 | 2 | 13.2 | 20.1 | #document ×2; div.pointer-events-none.absolute.inset-0 ×1; img.pointer-events-none.absolute.inset-0 ×1 |
| about | 60.3 | 0 | 0 | 0 | 4.4 | 22.8 |  |
| journey | 60.6 | 0 | 0 | 0 | 0.3 | 16.1 |  |
| act-2 | 60.7 | 0 | 0 | 0 | 9.9 | 23.6 |  |
| work | 60.5 | 0 | 0 | 0 | 0 | 14.8 |  |
| trading-algos | 60.4 | 0 | 0 | 0 | 0 | 15 |  |
| optuna-screener | 59.8 | 0 | 0 | 0 | 0 | 15.9 |  |
| experiment | 60.2 | 0 | 0 | 0 | 0 | 16.2 |  |
| systems | 60.5 | 0 | 0 | 0 | 0 | 17.4 |  |
| kill-list | 60.5 | 0 | 0.7 | 0.9 | 2.7 | 18.3 | #document ×1 |
| films | 60.2 | 0 | 1.3 | 1.1 | 13.7 | 18.7 | #document ×2 |
| act-3 | 60.5 | 0 | 0.7 | 0.6 | 1.3 | 16 | #document ×1 |
| beyond | 60.3 | 0 | 1.3 | 2.2 | 18.6 | 22.2 | #document ×2 |
| writing | 60.2 | 0 | 2.7 | 1.9 | 28.2 | 24.3 | #document ×2; div.relative.flex.flex-col ×1; div.rdr2-module__R8wI0W__campSticky ×1 |
| voices | 60.3 | 0 | 0 | 0 | 0 | 15.8 |  |
| act-4 | 60.1 | 0 | 0 | 0 | 0 | 15.6 |  |
| principles | 60.6 | 0 | 0 | 0 | 0 | 16.7 |  |
| contact | 59.5 | 0.5 | 1.3 | 1.2 | 18.9 | 22 | #document ×2 |
| credits | 60.6 | 0 | 0 | 0 | 0 | 15 |  |

## intro — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| intro:play-screen | 35 | 8.8 | 113.8 | 50.1 | 250 | 1350 | 60 | 54.3 | 1350 | 17 | 355 | 28.6 | 0.0051 | 249.3 | 20.1 | #document ×28; span.block in #act-1 ×14 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (458 ms) |  |
| intro:flight | 39 | 6.8 | 147.9 | 133.3 | 266.6 | 483.4 | 97.4 | 94.9 | 483.4 | 37 | 142 | 7.9 | 0 | 572.1 | 4.9 | #document ×7; video ×5 | event-listener:BUTTON#intro-play.onclick @ intro.js (112 ms) |  |
| intro:reveal | 4 | 5.7 | 175 | 250 | 300.1 | 300.1 | 75 | 75 | 300.1 | 3 | 0 | 33.3 | 0 | 447.1 | 8.6 | #document ×3; div#intro ×3 |  |  |
| intro:titles | 115 | 44.5 | 22.5 | 16.7 | 16.8 | 250 | 3.5 | 3.5 | 283.4 | 4 | 41 | 50 | 0 | 128.1 | 2.7 | #document ×2; html.geist_deef94d5-module__Sms4YG__variable.geist_mono_1bf8cbf6-module__FlyLvG__variable.newsreader_7f842e3a-module__oV ×1 | user-callback:FrameRequestCallback (82 ms) |  |
| top | 79 | 57.8 | 17.3 | 16.7 | 16.8 | 66.7 | 1.3 | 1.3 | 66.7 | 1 | 41 | 100 | 0 | 2.2 | 3.7 | #document ×3; div.hero-cap__in in #top ×2 | user-callback:TimerHandler:setTimeout @ intro.js (89 ms) | 1 filter, 1 blend, 1 mask, 3 will-change, 2.3 MP of images |

### intro — marks and LoAF intro:warm → intro:titles-end

**window incomplete** (intro:warm or intro:titles-end mark missing)

intro:arm@-4.824 · intro:ready@-4.553 · intro:play@0 · intro:flight@0.103 · intro:landing@5.751 · intro:end@6.524

### intro — longest animation frames (LoAF total 9316 ms, main-thread work 1135 ms, blocking 579 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 0.39 | intro:flight | 491 | 0 | 1 | 1 | 0 | (no script) |  |
| -2.63 | intro:play-screen | 340 | 58 | 216 | 0 | 216 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 41 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| 6.44 | intro:titles | 336 | 41 | 90 | 3 | 87 | user-callback:FrameRequestCallback 82 ms |  |
| 5.58 | intro:flight | 285 | 64 | 112 | 112 | 0 | (no script) |  |
| 1.12 | intro:flight | 266 | 0 | 0 | 0 | 0 | (no script) |  |

### intro — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| -2.63 | intro:play-screen | 340 | 58 | 216 | 0 | 216 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 41 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| -2.29 | intro:play-screen | 209 | 153 | 187 | 3 | 184 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 178 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| -2.07 | intro:play-screen | 203 | 133 | 158 | 1 | 157 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 157 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| -0.02 | intro:flight | 139 | 78 | 113 | 1 | 112 | event-listener:BUTTON#intro-play.onclick @ intro.js 112 ms | `(){we()})),o.addEventListener("click",(function(){Ne("skip")})),a.addEventListener("pointe` |
| 5.58 | intro:flight | 285 | 64 | 112 | 112 | 0 | (no script) |  |

### intro — layout shifts (CLS total 0.0051, session 0.0051, 1 shifts)

| t s | value | section | sources |
|---|---|---|---|
| -2.64 | 0.0051 | intro:play-screen | svg in #top ; svg in #top |

### intro — visual pops (12; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| -0.88 | 0 | intro:play-screen | 0 | 5.6 | 33.6 | change | 6.3 | 1 |
| 2.55 | 0 | intro:flight | 0 | 10.1 | 399.3 | change | 16.7 | 1 |
| 2.73 | 0 | intro:flight | 0 | 13.3 | 523.4 | change | 18.9 | 2 |
| 3.12 | 0 | intro:flight | 0 | 14.1 | 551.7 | change | 22.4 | 1 |
| 3.27 | 0 | intro:flight | 0 | 12.3 | 480.7 | change | 20.5 | 2 |
| 3.61 | 0 | intro:flight | 0 | 9.4 | 239.7 | change | 16.9 | 1 |
| 3.90 | 0 | intro:flight | 0 | 10.3 | 261.2 | change | 20.2 | 2 |
| 4.21 | 0 | intro:flight | 0 | 17.4 | 440.8 | change | 36 | 1 |
| 4.44 | 0 | intro:flight | 0 | 18.8 | 475.9 | change | 40.2 | 2 |
| 4.86 | 0 | intro:flight | 0 | 12.4 | 194.8 | change | 20.2 | 1 |
| 5.13 | 0 | intro:flight | 0 | 16.3 | 133.4 | change | 26.5 | 1 |
| 5.42 | 0 | intro:flight | 0 | 11.5 | 49.3 | change | 11.7 | 2 |

## desktop — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 13 | 6.3 | 157.7 | 16.7 | 700 | 700 | 38.5 | 38.5 | 700 | 4 | 0 | 0 | 0 | 1094.7 | 14.1 | #document ×9; video ×5 |  | 1 filter, 1 blend, 1 mask, 3 will-change, 2.3 MP of images |
| act-1 | 34 | 8.4 | 118.6 | 49.9 | 416.6 | 833.3 | 50 | 41.2 | 833.3 | 13 | 0 | 0 | 0 | 652.4 | 10.2 | #document ×17; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×8 | user-callback:FrameRequestCallback @ 3ak3gv1hj96wq.js v (5 ms) | 2 mask, 1 will-change, 1.2 MP of images |
| about | 9 | 2.6 | 377.8 | 183.4 | 983.3 | 983.3 | 77.8 | 77.8 | 983.3 | 7 | 47 | 28.6 | 0 | 793.8 | 10.9 | #document ×7; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×6 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (68 ms) | 1 mask |
| journey | 10 | 2.7 | 373.3 | 350 | 983.3 | 983.3 | 90 | 90 | 983.3 | 9 | 0 | 0 | 0 | 769.8 | 9.4 | #document ×10; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×7 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (19 ms) | 1 mask, 0.8 MP of images |
| act-2 | 17 | 5.8 | 172.5 | 166.5 | 799.9 | 799.9 | 76.5 | 76.5 | 799.9 | 12 | 0 | 0 | 0 | 761.3 | 22.8 | #document ×13; div.pointer-events-none.absolute.origin-top-left in #act-2 ×8 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (8 ms) | 2 filter, 2 mask, 7 will-change, 3.5 MP of images |
| work | 11 | 2.8 | 351.5 | 250 | 866.7 | 866.7 | 63.6 | 63.6 | 866.7 | 7 | 0 | 0 | 0 | 929.3 | 6.7 | #document ×10; div.relative.flex.flex-col in #act-2 ×5 | user-callback:FrameRequestCallback @ 3ak3gv1hj96wq.js v (5 ms) | 3 filter, 1 blend, 2 mask, 1.6 MP of images |
| trading-algos | 10 | 3.4 | 293.3 | 283.4 | 766.7 | 766.7 | 80 | 80 | 766.7 | 7 | 225 | 12.5 | 0 | 876.2 | 10.9 | #document ×10; div.relative.flex.flex-col in #act-2 ×5 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (6 ms) | 2 filter |
| optuna-screener | 17 | 4.4 | 228.4 | 166.8 | 466.6 | 466.6 | 88.2 | 82.4 | 466.6 | 14 | 0 | 0 | 0 | 718.5 | 8.8 | #document ×17; svg.absolute.inset-0.size-full viewBox=0 0 1000 236 in #optuna-screener ×4 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (8 ms) | 2 filter, 1 MP of images |
| experiment | 46 | 38.3 | 26.1 | 16.7 | 66.7 | 199.9 | 8.7 | 6.5 | 199.9 | 3 | 0 | 0 | 0 | 492.5 | 10.8 | #document ×8; div.pointer-events-none.absolute.inset-x-0 in #systems ×3 |  |  |
| systems | 7 | 2.8 | 359.5 | 283.3 | 1116.7 | 1116.7 | 85.7 | 71.4 | 1116.7 | 5 | 0 | 0 | 0 | 923.9 | 7.5 | #document ×6; svg.absolute.inset-0.size-full viewBox=0 0 360 488 in #systems ×2 |  | 1 mask, 1 MP of images |
| kill-list | 8 | 2.5 | 404.2 | 483.3 | 850 | 850 | 87.5 | 87.5 | 850 | 7 | 0 | 0 | 0 | 817.1 | 3.7 | #document ×8; svg.absolute.inset-0.size-full viewBox=0 0 360 488 in #systems ×1 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (13 ms) | 1 mask, 0.3 MP of images |
| films | 217 | 17.8 | 56.1 | 16.7 | 283.4 | 566.7 | 20.3 | 18.9 | 766.6 | 43 | 0 | 0 | 0 | 644.7 | 15.7 | #document ×88; div.absolute.inset-0.overflow-hidden in #films ×30 | user-callback:FrameRequestCallback @ 3ak3gv1hj96wq.js v (5 ms) | 3.9 MP of images |
| act-3 | 7 | 2 | 500 | 300 | 1383.3 | 1383.3 | 85.7 | 85.7 | 1383.3 | 6 | 0 | 0 | 0 | 839.8 | 5.1 | #document ×7; video ×2 | user-callback:FrameRequestCallback @ 3ak3gv1hj96wq.js v (7 ms) | 1 filter, 2 mask, 5 will-change, 2 MP of images |
| beyond | 18 | 3.7 | 270.4 | 233.4 | 1066.6 | 1066.6 | 83.3 | 83.3 | 1066.6 | 15 | 0 | 0 | 0 | 815.2 | 9.7 | #document ×17; div.rdr2-module__R8wI0W__bandLayer in #beyond ×4 | user-callback:FrameRequestCallback @ 3ak3gv1hj96wq.js v (11 ms) | 6 filter, 2.8 MP of images |
| writing | 12 | 3.4 | 294.4 | 283.3 | 1049.9 | 1049.9 | 83.3 | 75 | 1049.9 | 9 | 0 | 0 | 0 | 775.2 | 19 | #document ×12; svg.size-full.overflow-visible.will-change-transform viewBox=0 0 400 500[data-motif=journal-landscape] in #writing ×10 | user-callback:FrameRequestCallback @ 3ak3gv1hj96wq.js v (5 ms) | 8 filter, 1 mask, 2 will-change |
| voices | 7 | 4.9 | 204.7 | 183.3 | 366.7 | 366.7 | 100 | 85.7 | 366.7 | 7 | 0 | 0 | 0 | 572.1 | 15.4 | #document ×6; div.relative.flex.flex-col in #act-4 ×5 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (9 ms) | 1 mask, 2.3 MP of images |
| act-4 | 81 | 25.7 | 38.9 | 16.7 | 216.7 | 399.9 | 13.6 | 11.1 | 399.9 | 8 | 0 | 0 | 0 | 482.9 | 21.6 | #document ×22; div.relative.flex.flex-col in #act-4 ×7 |  | 2 mask, 5 will-change, 2.3 MP of images |
| principles | 9 | 1.6 | 644.4 | 266.7 | 2583.2 | 2583.2 | 66.7 | 66.7 | 2583.2 | 6 | 0 | 0 | 0 | 896.1 | 4.7 | #document ×9; div.relative.flex.flex-col in #act-4 ×7 |  | 52 will-change |
| contact | 2 | 0.9 | 1149.9 | 1216.6 | 1216.6 | 1216.6 | 100 | 100 | 1216.6 | 2 | 0 | 0 | 0 | 707.4 | 1.3 | #document ×1; div.relative.flex.flex-col in #act-4 ×1 | user-callback:FrameRequestCallback @ 3ak3gv1hj96wq.js v (6 ms) | 4 mask, 0.9 MP of images |
| credits | 109 | 27.7 | 36.1 | 16.7 | 133.3 | 166.7 | 22 | 17.4 | 166.7 | 19 | 0 | 0 | 0 | 468.6 | 32.5 | #document ×52; footer#credits.relative.isolate.bg-bg in #credits ×17 |  |  |

### desktop — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 450→2484 | 37 | 8.1 | 123 | 50 | 416.6 | 833.3 | 45.9 | 833.3 | 17 | 0 | 0 |
| act-2 | 6146→8018 | 24 | 4.9 | 202.1 | 166.5 | 799.9 | 866.7 | 66.7 | 866.7 | 16 | 0 | 0 |
| act-3 | 25781→27131 | 10 | 2.4 | 416.6 | 283.2 | 1383.3 | 1383.3 | 90 | 1383.3 | 10 | 0 | 0 |
| act-4 | 34491→36363 | 83 | 20.5 | 48.8 | 16.7 | 266.7 | 633.3 | 13.3 | 633.3 | 11 | 0 | 0 |

### desktop — longest animation frames (LoAF total 62578 ms, main-thread work 700 ms, blocking 272 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 65.64 | principles | 2562 | 0 | 2 | 2 | 0 | (no script) |  |
| 63.44 | principles | 1788 | 0 | 3 | 3 | 0 | (no script) |  |
| 46.09 | act-3 | 1380 | 0 | 9 | 2 | 7 | user-callback:FrameRequestCallback @ 3ak3gv1hj96wq.js v 7 ms | `()=>{let s=i.MotionGlobalConfig.useManualTiming,o=s?a.timestamp:performance.now();n=!1,s\|\|` |
| 69.34 | contact | 1216 | 0 | 15 | 9 | 6 | user-callback:FrameRequestCallback @ 3ak3gv1hj96wq.js v 6 ms | `()=>{let s=i.MotionGlobalConfig.useManualTiming,o=s?a.timestamp:performance.now();n=!1,s\|\|` |
| 28.34 | systems | 1101 | 0 | 2 | 2 | 0 | (no script) |  |

### desktop — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 7.93 | about | 749 | 0 | 61 | 4 | 57 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 19 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| 7.6 | about | 323 | 47 | 50 | 3 | 47 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 22 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| 12.92 | journey | 313 | 0 | 15 | 3 | 12 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 7 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| 24.26 | optuna-screener | 437 | 0 | 15 | 2 | 13 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 8 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| 69.34 | contact | 1216 | 0 | 15 | 9 | 6 | user-callback:FrameRequestCallback @ 3ak3gv1hj96wq.js v 6 ms | `()=>{let s=i.MotionGlobalConfig.useManualTiming,o=s?a.timestamp:performance.now();n=!1,s\|\|` |

### desktop — layout shifts (CLS total 0, session 0, 1 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 55.19 | 0 | writing | span.pointer-events-none.absolute.bottom-[0.18em] in #writing |

### desktop — visual pops (15; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 4.48 | 1000 | act-1 | 0 | 17.5 | 8.8 | fill-in | 32.4 | 1 |
| 7.90 | 2100 | about | 0 | 3.3 | 3.1 | change | 5.2 | 1 |
| 10.45 | 2900 | journey | 0 | 3.9 | 3.6 | change | 9.7 | 1 |
| 15.37 | 6800 | act-2 | 0 | 18.1 | 11.1 | change | 24.9 | 1 |
| 16.02 | 7100 | act-2 | 0 | 29.2 | 27.3 | change | 43.5 | 1 |
| 18.72 | 7600 | work | 0 | 12.6 | 35.6 | fill-in | 14.6 | 1 |
| 19.85 | 7900 | work | 0 | 6 | 12.5 | change | 10.5 | 1 |
| 20.26 | 8600 | trading-algos | 0 | 4.9 | 10.1 | fill-in | 4.2 | 1 |
| 23.11 | 10600 | trading-algos | 0 | 12.1 | 6.1 | fill-in | 45.5 | 1 |
| 29.44 | 16300 | systems | 0 | 24.7 | 3.6 | change | 27.1 | 1 |
| 37.24 | 22100 | films | 0 | 8.5 | 3.8 | change | 7.2 | 1 |
| 55.45 | 30700 | writing | 0 | 58.1 | 8 | fill-in | 28.3 | 1 |
| 61.29 | 35300 | act-4 | 0 | 13.5 | 3.3 | change | 27.5 | 1 |
| 63.49 | 35900 | principles | 0 | 11.4 | 17.4 | change | 6.1 | 1 |
| 67.23 | 37100 | principles | 0 | 50.9 | 15.4 | change | 27.5 | 1 |

## Strips

- strips/intro.png
- strips/intro-landing.png
- strips/pop-intro-35.png
- strips/pop-intro-34.png
- strips/pop-intro-40.png
- strips/desktop-act-1.png
- strips/desktop-act-2.png
- strips/desktop-act-3.png
- strips/desktop-act-4.png
- strips/desktop-first-60s.png
- strips/pop-desktop-337.png
- strips/pop-desktop-78.png
- strips/pop-desktop-152.png
- strips/pop-desktop-266.png
