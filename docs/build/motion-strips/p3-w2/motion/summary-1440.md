# Motion baseline — 2026-10-02T19:07:53.341Z

Base http://localhost:3161 · Chromium 141.0.7390.37 headless · 4 CPUs · screencast everyNthFrame=1.

> Headless Chromium rasterises in software (SwiftShader) on a few CPUs and pays for the screencast readback, so absolute frame times are pessimistic vs a real laptop/phone GPU. Read them as RELATIVE hotspots: which sections and transitions are worst. "busy∩jank %" = share of >33.4 ms frames that overlap a long animation frame in which the main thread really worked (script + style/layout/paint >= half the frame, or a >50 ms task); low = the frame was raster/composite-bound (the LoAF is the main thread waiting on the compositor), high = main-thread script/style/layout. "paint suspects" = what the section holds that is costly to raster (filters, blend, masks, canvas, video, image megapixels, infinite animations).

## Runs

| run | viewport | lenis | secs | rAF frames | fps | mean ms | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | LoAF block ms | busy∩jank % | CLS total | CLS (session) | pops | shots |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| intro | 1440x900 |  | 12.3 | 183 | 14.8 | 67.5 | 50 | 166.7 | 350 | 58.5 | 49.7 | 733.2 | 123 | 748 | 4.7 | 0.0051 | 0.0051 | 9 | 118 |
| desktop | 1440x900 | on | 77 | 912 | 11.8 | 84.4 | 33.3 | 300 | 533.3 | 45.8 | 41.7 | 1383.2 | 384 | 665 | 2.6 | 0.0037 | 0.0019 | 0 | 505 |
| native | 1440x900 | off | 76.4 | 616 | 8.1 | 124 | 50 | 483.3 | 983.3 | 51.1 | 45.9 | 2199.9 | 289 | 1524 | 4.4 | 0.0033 | 0.0012 | 36 | 663 |
| gl | 1440x900 | on | 74.8 | 1045 | 14 | 71.6 | 16.8 | 266.7 | 433.3 | 42.7 | 37.2 | 800 | 406 | 507 | 2.7 | 0.0041 | 0.0018 | 2 | 572 |

## Top 10 hotspots (by mean frame time; rm excluded)

| # | run | where | frames | fps | mean | p95 | p99 | >50 % | max | mean / run mean | LoAF block ms | likely cause |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | native | journey | 9 | 1.5 | 650 | 1349.9 | 1349.9 | 100 | 1349.9 | 5.2 | 97 | raster/composite-bound: only 22.2% of janky frames overlap real main-thread work; the LoAFs are 97% waiting for the compositor — on screen: 1 mask, 1 will-change, 0.8 MP of images [while scrolling: raster 482.6 ms/s, 11.8 paints/s — repainting: #document ×8; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×8 \| idle 8 fps, raster 98.5 ms/s, 1.3 paints/s] |
| 2 | native | act-1 | 17 | 1.9 | 519.6 | 2199.9 | 2199.9 | 88.2 | 2199.9 | 4.2 | 862 | raster/composite-bound: only 26.7% of janky frames overlap real main-thread work; the LoAFs are 99.3% waiting for the compositor — on screen: 4 mask, 18 will-change, 14 infinite anims, 2.3 MP of images [while scrolling: raster 286.2 ms/s, 12.1 paints/s — repainting: #document ×16; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×8 \| idle 29.3 fps, raster 275.6 ms/s, 26 paints/s (#document ×5; div.absolute.inset-0 ×3; div.absolute.inset-0 ×3)] |
| 3 | native | principles | 13 | 2.5 | 405.1 | 1299.9 | 1299.9 | 69.2 | 1299.9 | 3.3 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 98% waiting for the compositor — on screen: 7 will-change [while scrolling: raster 919.2 ms/s, 11.8 paints/s — repainting: #document ×13; div.act-card-stage.relative.flex in #act-4 ×9 \| idle 60.1 fps, raster 0 ms/s, 0 paints/s] |
| 4 | desktop | principles | 12 | 3 | 333.3 | 550 | 550 | 100 | 550 | 3.9 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.5% waiting for the compositor — on screen: 7 will-change [while scrolling: raster 995.5 ms/s, 12.8 paints/s — repainting: #document ×12; div.act-card-stage.relative.flex in #act-4 ×12 \| idle 60.1 fps, raster 0 ms/s, 0 paints/s] |
| 5 | gl | principles | 12 | 3.6 | 275 | 500 | 500 | 100 | 500 | 3.8 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.2% waiting for the compositor — on screen: 7 will-change [while scrolling: raster 957 ms/s, 16.1 paints/s — repainting: #document ×12; div.act-card-stage.relative.flex in #act-4 ×12 \| idle 60.1 fps, raster 0 ms/s, 0 paints/s] |
| 6 | native | work | 11 | 3.9 | 256.1 | 700.1 | 700.1 | 100 | 700.1 | 2.1 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 98.4% waiting for the compositor — on screen: 3 filter, 1 blend, 2 mask, 2 will-change, 1.6 MP of images [while scrolling: raster 681 ms/s, 33.4 paints/s — repainting: #document ×11; div.act-card-stage.relative.flex in #act-2 ×9 \| idle 60 fps, raster 0 ms/s, 0 paints/s] |
| 7 | desktop | act-1 | 26 | 4.2 | 239.7 | 450 | 1383.2 | 88.5 | 1383.2 | 2.8 | 0 | raster/composite-bound: only 4% of janky frames overlap real main-thread work; the LoAFs are 99.3% waiting for the compositor — on screen: 4 mask, 18 will-change, 14 infinite anims, 2.3 MP of images [while scrolling: raster 514.2 ms/s, 19.6 paints/s — repainting: #document ×24; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×15 \| idle 29.3 fps, raster 275.6 ms/s, 26 paints/s (#document ×5; div.absolute.inset-0 ×3; div.absolute.inset-0 ×3)] |
| 8 | native | trading-algos | 10 | 4.3 | 231.6 | 649.9 | 649.9 | 70 | 649.9 | 1.9 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 98.2% waiting for the compositor — on screen: 2 filter, 0.2 MP of images [while scrolling: raster 505.9 ms/s, 22.9 paints/s — repainting: #document ×10; div.act-card-stage.relative.flex in #act-2 ×7 \| idle 60.2 fps, raster 0 ms/s, 0 paints/s] |
| 9 | native | act-2 transition | 17 | 4.5 | 223.5 | 650 | 650 | 94.1 | 650 | 1.8 | 26 | raster/composite-bound: only 12.5% of janky frames overlap real main-thread work; the LoAFs are 96.6% waiting for the compositor — on screen: 2 filter, 3 mask, 20 will-change, 12 infinite anims, 4.7 MP of images [while scrolling: raster 634 ms/s, 37.6 paints/s — repainting: #document ×15; div.act-card-stage.relative.flex in #act-2 ×8 \| idle 60.4 fps, raster 0 ms/s, 0 paints/s] |
| 10 | desktop | beyond | 23 | 5 | 200 | 383.3 | 516.7 | 87 | 516.7 | 2.4 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.3% waiting for the compositor — on screen: 6 mask, 3 MP of images [while scrolling: raster 747.2 ms/s, 28.9 paints/s — repainting: #document ×22; div.act-card-stage.relative.flex in #act-3 ×21 \| idle 60.2 fps, raster 0 ms/s, 0 paints/s] |

## Idle probe (desktop: parked 2.5 s on each section, then 1.5 s traced standing still; high raster with few paints = a raster-heavy layer, many paints/s = continuous animation)

| section | idle fps | raster ms/s | paints/s | paint ms/s | style+layout ms/s | rAF JS ms/s | top repainting nodes |
|---|---|---|---|---|---|---|---|
| top | 41.6 | 175.4 | 31.3 | 10.8 | 20.1 | 39.3 | #document ×22; video.absolute.inset-0.size-full ×5; div.act-card-weather ×2 |
| act-1 | 29.3 | 275.6 | 26 | 4.3 | 10.5 | 18.5 | #document ×5; div.absolute.inset-0 ×3; div.absolute.inset-0 ×3 |
| about | 60.2 | 0 | 0 | 0 | 17.5 | 38.2 |  |
| journey | 8 | 98.5 | 1.3 | 0.9 | 1.1 | 3.1 | #document ×1; div.sticky.top-[calc(var(--header-h)+1.5rem)] ×1 |
| act-2 | 60.4 | 0 | 0 | 0 | 13.6 | 31.4 |  |
| work | 60 | 0 | 0 | 0 | 0 | 18.5 |  |
| trading-algos | 60.2 | 0 | 0 | 0 | 14.5 | 33.9 |  |
| optuna-screener | 60.1 | 0 | 0 | 0 | 14.6 | 32.6 |  |
| experiment | 60.1 | 0 | 0 | 0 | 0 | 16.4 |  |
| systems | 60.5 | 0 | 0 | 0 | 0 | 15 |  |
| kill-list | 60.5 | 0 | 0 | 0 | 0 | 17.4 |  |
| films | 60.5 | 0 | 0 | 0 | 0 | 17.8 |  |
| act-3 | 60.4 | 0 | 0 | 0 | 0 | 18.1 |  |
| beyond | 60.2 | 0 | 0 | 0 | 0 | 17.3 |  |
| writing | 60.4 | 0 | 0 | 0 | 0 | 17.7 |  |
| voices | 60.6 | 0 | 0 | 0 | 0 | 18.2 |  |
| act-4 | 60.2 | 0 | 0 | 0 | 18.5 | 34.9 |  |
| principles | 60.1 | 0 | 0 | 0 | 0 | 16.8 |  |
| contact | 60.2 | 0 | 0 | 0 | 0 | 17.4 |  |
| credits | 60.2 | 0 | 0 | 0 | 14.3 | 32.3 |  |

## intro — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| intro:play-screen | 56 | 21.5 | 46.4 | 49.9 | 116.6 | 216.8 | 50 | 30.4 | 216.8 | 21 | 129 | 17.9 | 0.0051 | 426.9 | 39.2 | #document ×35; div#act-1-program.relative.px-gutter.pt-tier-group in #act-1 ×15 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (278 ms) |  |
| intro:flight | 92 | 14.7 | 68.1 | 66.7 | 150 | 350 | 67.4 | 62 | 350 | 59 | 0 | 0 | 0 | 299.7 | 4.9 | #document ×9; node 71 ×5 | event-listener:BUTTON#intro-play.onclick @ intro.js (16 ms) |  |
| intro:hold | 3 | 9.5 | 105.6 | 83.3 | 200 | 200 | 66.7 | 66.7 | 200 | 3 | 21 | 50 | 0 | 1237.8 | 53.7 | #document ×3; div#intro-stage ×2 | user-callback:VideoFrameRequestCallback @ intro.js hn (13 ms) |  |
| intro:reveal | 1 | 1.4 | 733.2 | 733.2 | 733.2 | 733.2 | 100 | 100 | 733.2 | 1 | 0 | 0 | 0 | 227.8 | 2.7 | #document ×1; video.absolute.inset-0.size-full in #top ×1 |  |  |
| intro:titles | 64 | 19.8 | 50.5 | 33.3 | 133.4 | 316.6 | 42.2 | 31.3 | 316.6 | 26 | 0 | 0 | 0 | 139.5 | 3.7 | #document ×4; video.absolute.inset-0.size-full in #top ×3 |  |  |
| top | 23 | 12.8 | 78.3 | 50 | 233.2 | 316.7 | 65.2 | 47.8 | 316.7 | 13 | 598 | 26.7 | 0 | 190 | 28.3 | #document ×9; div.act-card-stage.relative.flex in #act-1 ×2 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (558 ms) | 1 video, 1 filter, 1 blend, 1 mask, 5 will-change, 2.3 MP of images |

### intro — marks and LoAF intro:warm → intro:titles-end

warm t=4.818s → titles-end t=10.521s: 45 LoAF, **45 > 50 ms** (max 719 ms, blocking 21 ms)

intro:arm@-4.18 · intro:ready@-3.968 · intro:play@0 · intro:flight@0.168 · intro:warm@4.818 · intro:hold@6.316 · intro:reveal@6.547 · intro:landing@6.547 · intro:titles@7.32 · intro:end@7.321 · intro:titles-end@10.521

### intro — longest animation frames (LoAF total 12571 ms, main-thread work 978 ms, blocking 748 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 6.56 | intro:reveal | 719 | 0 | 0 | 0 | 0 | (no script) |  |
| 11.75 | top | 555 | 503 | 552 | 0 | 552 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i 552 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |
| 0.21 | intro:flight | 357 | 0 | 1 | 1 | 0 | (no script) |  |
| 7.86 | intro:titles | 310 | 0 | 0 | 0 | 0 | (no script) |  |
| 11.5 | top | 207 | 95 | 1 | 1 | 0 | (no script) |  |

### intro — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 11.75 | top | 555 | 503 | 552 | 0 | 552 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i 552 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |
| -2.16 | intro:play-screen | 196 | 83 | 166 | 1 | 165 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 122 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| -1.96 | intro:play-screen | 130 | 36 | 102 | 12 | 90 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 56 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| -1.79 | intro:play-screen | 154 | 10 | 45 | 0 | 45 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 34 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| -1.64 | intro:play-screen | 59 | 0 | 21 | 1 | 20 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 20 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |

### intro — layout shifts (CLS total 0.0051, session 0.0051, 1 shifts)

| t s | value | section | sources |
|---|---|---|---|
| -2.64 | 0.0051 | intro:play-screen | svg in #top ; svg in #top |

### intro — visual pops (9; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| -1.67 | 0 | intro:play-screen | 0 | 5.9 | 59.6 | change | 5.6 | 1 |
| 1.58 | 0 | intro:flight | 0 | 2.4 | 61.2 | change | 5.4 | 1 |
| 2.07 | 0 | intro:flight | 0 | 13.7 | 241 | change | 16.1 | 5 |
| 2.39 | 0 | intro:flight | 0 | 3.8 | 67.5 | change | 3.9 | 1 |
| 2.65 | 0 | intro:flight | 0 | 9.4 | 165 | change | 12 | 1 |
| 3.20 | 0 | intro:flight | 0 | 8.4 | 83.2 | change | 13.7 | 6 |
| 3.59 | 0 | intro:flight | 0 | 15.4 | 6.4 | change | 30.8 | 3 |
| 3.92 | 0 | intro:flight | 0 | 17.3 | 4.5 | change | 41.5 | 1 |
| 9.03 | 0 | intro:titles | 0 | 11.7 | 7.3 | change | 10.6 | 1 |

## desktop — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 10 | 8 | 125 | 16.8 | 833.2 | 833.2 | 30 | 30 | 833.2 | 3 | 330 | 33.3 | 0 | 613.6 | 11.2 | #document ×3; div.act-card-stage.relative.flex in #act-1 ×3 | user-callback:IntersectionObserverCallback @ 156sqqmkx2usx.js (376 ms) | 1 filter, 1 blend, 1 mask, 5 will-change, 2.3 MP of images |
| act-1 | 26 | 4.2 | 239.7 | 183.3 | 450 | 1383.2 | 96.2 | 88.5 | 1383.2 | 25 | 0 | 4 | 0 | 514.2 | 19.6 | #document ×24; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×15 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (12 ms) | 4 mask, 18 will-change, 14 infinite anims, 2.3 MP of images |
| about | 7 | 5.3 | 190.5 | 150 | 350 | 350 | 85.7 | 85.7 | 350 | 6 | 0 | 0 | 0 | 909 | 31.5 | #document ×7; div.relative.z-10.mx-auto in #top ×7 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (44 ms) | 1 mask |
| journey | 17 | 5.5 | 180.4 | 149.9 | 450 | 450 | 100 | 94.1 | 450 | 15 | 50 | 11.8 | 0 | 744.5 | 35.9 | #document ×17; div.relative.z-10.mx-auto in #top ×17 | resolve-promise:Promise.resolve @ 00a5balkm-w3j.js (96 ms) | 1 mask, 1 will-change, 0.8 MP of images |
| act-2 | 38 | 8.5 | 117.5 | 83.4 | 299.9 | 333.4 | 89.5 | 81.6 | 333.4 | 30 | 31 | 5.9 | 0 | 639.4 | 52.2 | #document ×30; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×24 | user-callback:IdleRequestCallback @ 3291fmnlvu1sw.js i (80 ms) | 2 filter, 3 mask, 20 will-change, 12 infinite anims, 4.7 MP of images |
| work | 20 | 7.4 | 135.8 | 133.3 | 333.4 | 333.4 | 100 | 100 | 333.4 | 19 | 0 | 0 | 0 | 886.4 | 44.5 | #document ×16; div.stage-window in #trading-algos ×13 | user-callback:IdleRequestCallback @ 3291fmnlvu1sw.js i (54 ms) | 3 filter, 1 blend, 2 mask, 2 will-change, 1.6 MP of images |
| trading-algos | 14 | 6.5 | 153.6 | 116.7 | 516.6 | 516.6 | 85.7 | 85.7 | 516.6 | 12 | 0 | 0 | 0 | 780.5 | 31.2 | #document ×12; div.relative.z-10.mx-auto in #top ×12 | user-callback:IdleRequestCallback @ 3291fmnlvu1sw.js i (32 ms) | 2 filter, 0.2 MP of images |
| optuna-screener | 37 | 7.8 | 127.9 | 100 | 283.3 | 333.3 | 75.7 | 70.3 | 333.3 | 25 | 0 | 0 | 0.0009 | 762.9 | 31.1 | #document ×30; div.stage-window in #trading-algos ×22 | user-callback:IdleRequestCallback @ 3291fmnlvu1sw.js i (80 ms) | 2 filter, 1.2 MP of images |
| experiment | 20 | 17.6 | 56.7 | 33.4 | 166.6 | 166.6 | 45 | 45 | 166.6 | 9 | 0 | 0 | 0 | 866.4 | 36.2 | #document ×11; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×7 | user-callback:IdleRequestCallback @ 3291fmnlvu1sw.js i (7 ms) |  |
| systems | 17 | 6.5 | 153.9 | 150.1 | 349.9 | 349.9 | 88.2 | 88.2 | 349.9 | 15 | 0 | 0 | 0 | 844.6 | 24.5 | #document ×16; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×13 |  | 1 mask, 1 will-change, 1 MP of images |
| kill-list | 14 | 6.3 | 158.3 | 150 | 350.1 | 350.1 | 100 | 100 | 350.1 | 14 | 0 | 0 | 0 | 922.6 | 27.1 | #document ×14; div.relative.@container.will-change-[transform,opacity] in #header ×14 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (7 ms) | 1 mask, 3 will-change, 0.3 MP of images |
| films | 436 | 26.9 | 37.2 | 16.7 | 166.7 | 283.3 | 13.1 | 12.4 | 533.2 | 51 | 230 | 7 | 0 | 514.1 | 27.5 | #document ×157; div.act-card-stage.relative.flex in #act-3 ×79 | user-callback:FrameRequestCallback @ 1rezhhvr7fq6o.js v (15 ms) | 4 will-change, 3.9 MP of images |
| act-3 | 43 | 8.5 | 118.2 | 66.7 | 366.7 | 583.3 | 72.1 | 55.8 | 583.3 | 26 | 0 | 0 | 0 | 595.5 | 24.6 | #document ×38; div.stage-window in #beyond ×30 | user-callback:FrameRequestCallback @ 1rezhhvr7fq6o.js v (13 ms) | 1 filter, 3 mask, 6 will-change, 2 MP of images |
| beyond | 23 | 5 | 200 | 166.7 | 383.3 | 516.7 | 91.3 | 87 | 516.7 | 20 | 0 | 0 | 0 | 747.2 | 28.9 | #document ×22; div.act-card-stage.relative.flex in #act-3 ×21 | user-callback:FrameRequestCallback @ 2gtmnwptgq-6o.js (6 ms) | 6 mask, 3 MP of images |
| writing | 30 | 10.6 | 94.4 | 83.3 | 166.6 | 183.3 | 96.7 | 83.3 | 183.3 | 25 | 0 | 0 | 0.0009 | 827.7 | 66.7 | #document ×29; div.act-card-stage.relative.flex in #act-4 ×28 | user-callback:FrameRequestCallback @ 1rezhhvr7fq6o.js v (21 ms) | 4 mask, 3 will-change |
| voices | 29 | 13.6 | 73.6 | 33.4 | 183.3 | 600 | 48.3 | 37.9 | 600 | 13 | 24 | 7.1 | 0 | 795.9 | 93.3 | #document ×29; div.act-card-stage.relative.flex in #act-4 ×26 | user-callback:IdleRequestCallback @ 3291fmnlvu1sw.js i (152 ms) | 2 will-change, 2.3 MP of images |
| act-4 | 59 | 14.4 | 69.5 | 49.9 | 216.7 | 400.1 | 52.5 | 40.7 | 400.1 | 26 | 0 | 0 | 0 | 663.7 | 31.7 | #document ×36; div.rdr2-module__R8wI0W__campSticky in #voices ×27 | user-callback:FrameRequestCallback @ 1pew_5_y-lfic.js f (12 ms) | 2 canvas, 3 mask, 26 will-change, 21 infinite anims, 2.3 MP of images |
| principles | 12 | 3 | 333.3 | 333.4 | 550 | 550 | 100 | 100 | 550 | 12 | 0 | 0 | 0.0019 | 995.5 | 12.8 | #document ×12; div.act-card-stage.relative.flex in #act-4 ×12 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (10 ms) | 7 will-change |
| contact | 3 | 1.6 | 644.4 | 633.3 | 783.3 | 783.3 | 100 | 100 | 783.3 | 3 | 0 | 0 | 0 | 917.1 | 10.3 | #document ×3; div.act-card-stage.relative.flex in #act-4 ×3 | user-callback:IdleRequestCallback @ 3291fmnlvu1sw.js i (17 ms) | 4 mask, 0.9 MP of images |
| credits | 57 | 13.7 | 73.1 | 66.6 | 216.7 | 566.6 | 64.9 | 56.1 | 566.6 | 35 | 0 | 0 | 0 | 559 | 13.7 | #document ×28; div.stage-cam ×15 | user-callback:FrameRequestCallback @ 1rezhhvr7fq6o.js v (11 ms) | 1 will-change |

### desktop — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 450→3283 | 28 | 4.4 | 229.2 | 150 | 450 | 1383.2 | 85.7 | 1383.2 | 27 | 330 | 3.8 |
| act-2 | 7015→9355 | 42 | 8.4 | 119.4 | 99.9 | 283.3 | 333.4 | 83.3 | 333.4 | 35 | 31 | 5.3 |
| act-3 | 28472→30632 | 46 | 7.9 | 126.8 | 83.2 | 366.7 | 583.3 | 58.7 | 583.3 | 29 | 0 | 0 |
| act-4 | 38532→40872 | 62 | 13.5 | 74.2 | 50 | 216.6 | 400.1 | 43.5 | 400.1 | 30 | 0 | 0 |

### desktop — longest animation frames (LoAF total 64390 ms, main-thread work 1542 ms, blocking 665 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 3.28 | act-1 | 1364 | 0 | 1 | 1 | 0 | (no script) |  |
| 0.29 | top | 833 | 0 | 1 | 1 | 0 | (no script) |  |
| 70.91 | contact | 777 | 0 | 6 | 1 | 5 | user-callback:IntersectionObserverCallback @ 26z_dkgic0ush.js 5 ms | `e=>{let t=i;for(let n of e)n.isIntersecting&&(t=n.target.id);t!==i&&(i=t,r.forEach(e=>e())` |
| 72.22 | contact | 618 | 0 | 11 | 1 | 10 | user-callback:IdleRequestCallback @ 3291fmnlvu1sw.js i 10 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |
| 62.21 | voices | 586 | 0 | 8 | 0 | 8 | user-callback:IdleRequestCallback @ 3291fmnlvu1sw.js i 8 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |

### desktop — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 1.15 | top | 386 | 330 | 377 | 1 | 376 | user-callback:IntersectionObserverCallback @ 156sqqmkx2usx.js 376 ms | `e=>{e.forEach(e=>{let t=H.get(e.target);if(!t)return;let r=e.boundingClientRect;t.visible=` |
| 9.57 | journey | 130 | 50 | 97 | 1 | 96 | resolve-promise:Promise.resolve @ 00a5balkm-w3j.js 96 ms |  |
| 12.34 | act-2 | 84 | 31 | 77 | 3 | 74 | user-callback:IdleRequestCallback @ 3291fmnlvu1sw.js i 74 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |
| 60.8 | voices | 62 | 12 | 57 | 0 | 57 | user-callback:IdleRequestCallback @ 3291fmnlvu1sw.js i 57 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |
| 60.72 | voices | 64 | 12 | 56 | 1 | 55 | user-callback:IdleRequestCallback @ 3291fmnlvu1sw.js i 55 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |

### desktop — layout shifts (CLS total 0.0037, session 0.0019, 10 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 68.42 | 0.0019 | principles | span.whitespace-nowrap in #principles ; h3.type-title.text-fg.max-sm:hyphens-auto in #principles ; span.scene-caption__film.world-face-hp in #principles |
| 24.56 | 0.0009 | optuna-screener | h3.mt-tier-pair.max-w-title.type-title in #optuna-screener |
| 59.73 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 58.9 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 60.54 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 59.3 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 28.74 | 0 | systems | h3.type-heading.text-fg.lg:text-[length:var(--text-lead)] in #systems |
| 29.09 | 0 | systems | h3.type-heading.text-fg.lg:text-[length:var(--text-lead)] in #systems |

### desktop — visual pops (0; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)


## native — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 10 | 12.2 | 81.7 | 16.7 | 266.7 | 266.7 | 40 | 30 | 266.7 | 4 | 388 | 25 | 0 | 694.3 | 22 | #document ×5; header.fixed.inset-x-0.top-0 in #header ×3 | user-callback:IntersectionObserverCallback @ 156sqqmkx2usx.js (435 ms) | 1 filter, 1 blend, 1 mask, 5 will-change, 2.3 MP of images |
| act-1 | 17 | 1.9 | 519.6 | 483.3 | 2199.9 | 2199.9 | 88.2 | 88.2 | 2199.9 | 14 | 862 | 26.7 | 0 | 286.2 | 12.1 | #document ×16; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×8 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (32 ms) | 4 mask, 18 will-change, 14 infinite anims, 2.3 MP of images |
| about | 2 | 1.2 | 850 | 983.3 | 983.3 | 983.3 | 100 | 100 | 983.3 | 2 | 0 | 0 | 0 | 280.6 | 9.4 | #document ×2; div.act-card-stage.relative.flex in #act-2 ×2 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (23 ms) | 1 mask |
| journey | 9 | 1.5 | 650 | 483.3 | 1349.9 | 1349.9 | 100 | 100 | 1349.9 | 9 | 97 | 22.2 | 0 | 482.6 | 11.8 | #document ×8; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×8 | resolve-promise:Promise.resolve @ 00a5balkm-w3j.js (143 ms) | 1 mask, 1 will-change, 0.8 MP of images |
| act-2 | 15 | 4.5 | 223.3 | 200 | 650 | 650 | 93.3 | 93.3 | 650 | 14 | 26 | 14.3 | 0 | 634 | 37.6 | #document ×15; div.act-card-stage.relative.flex in #act-2 ×8 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (63 ms) | 2 filter, 3 mask, 20 will-change, 12 infinite anims, 4.7 MP of images |
| work | 11 | 3.9 | 256.1 | 183.3 | 700.1 | 700.1 | 100 | 100 | 700.1 | 11 | 0 | 0 | 0 | 681 | 33.4 | #document ×11; div.act-card-stage.relative.flex in #act-2 ×9 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (31 ms) | 3 filter, 1 blend, 2 mask, 2 will-change, 1.6 MP of images |
| trading-algos | 10 | 4.3 | 231.6 | 266.7 | 649.9 | 649.9 | 70 | 70 | 649.9 | 7 | 0 | 0 | 0.0006 | 505.9 | 22.9 | #document ×10; div.act-card-stage.relative.flex in #act-2 ×7 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (29 ms) | 2 filter, 0.2 MP of images |
| optuna-screener | 31 | 6.4 | 156.4 | 116.7 | 450 | 616.6 | 83.9 | 71 | 616.6 | 22 | 0 | 0 | 0 | 543.3 | 21 | #document ×21; div.stage-window in #trading-algos ×15 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (114 ms) | 2 filter, 1.2 MP of images |
| experiment | 19 | 17.5 | 57 | 16.7 | 250 | 250 | 42.1 | 36.8 | 250 | 7 | 0 | 0 | 0 | 667.4 | 26.8 | #document ×9; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×6 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (16 ms) |  |
| systems | 17 | 6.8 | 147.1 | 116.7 | 433.2 | 433.2 | 76.5 | 76.5 | 433.2 | 12 | 0 | 0 | 0 | 696.8 | 18.8 | #document ×15; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×9 | user-callback:FrameRequestCallback @ 1rezhhvr7fq6o.js v (6 ms) | 1 mask, 1 will-change, 1 MP of images |
| kill-list | 18 | 7.2 | 139.8 | 150 | 383.2 | 383.2 | 66.7 | 66.7 | 383.2 | 12 | 0 | 0 | 0 | 741.9 | 33.8 | #document ×18; div.relative.@container.will-change-[transform,opacity] in #header ×14 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (5 ms) | 1 mask, 3 will-change, 0.3 MP of images |
| films | 264 | 22.1 | 45.3 | 16.7 | 199.9 | 350 | 20.8 | 17 | 850 | 45 | 147 | 3.6 | 0 | 570.1 | 33.5 | #document ×157; svg.pointer-events-none.absolute.inset-0 viewBox=0 0 2333 1000 in #films ×63 | user-callback:TimerHandler:setTimeout @ 26z_dkgic0ush.js (177 ms) | 4 will-change, 3.9 MP of images |
| act-3 | 25 | 7 | 143.3 | 150 | 283.3 | 316.7 | 72 | 68 | 316.7 | 18 | 0 | 0 | 0 | 507.1 | 19.8 | #document ×23; div.act-card-stage.relative.flex in #act-3 ×9 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (5 ms) | 1 filter, 3 mask, 6 will-change, 2 MP of images |
| beyond | 27 | 5.6 | 179.6 | 133.3 | 483.3 | 600 | 77.8 | 63 | 600 | 18 | 0 | 0 | 0.0006 | 530.3 | 29.3 | #document ×27; div.act-card-stage.relative.flex in #act-3 ×15 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (10 ms) | 6 mask, 3 MP of images |
| writing | 29 | 10.4 | 96 | 99.9 | 200 | 216.6 | 72.4 | 69 | 216.6 | 21 | 0 | 4.8 | 0.0009 | 674 | 55.3 | #document ×28; svg.size-full.overflow-visible.will-change-transform viewBox=0 0 400 500[data-motif=journal-landscape] in #writing ×23 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (40 ms) | 4 mask, 3 will-change |
| voices | 13 | 6.5 | 153.8 | 83.3 | 916.6 | 916.6 | 61.5 | 53.8 | 916.6 | 7 | 4 | 25 | 0 | 592.6 | 30 | #document ×12; div.act-card-stage.relative.flex in #act-4 ×5 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (77 ms) | 2 will-change, 2.3 MP of images |
| act-4 | 26 | 7.8 | 128.8 | 133.3 | 266.6 | 450 | 69.2 | 69.2 | 450 | 17 | 0 | 0 | 0 | 594 | 28.1 | #document ×23; div.act-card-stage.relative.flex in #act-4 ×10 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (16 ms) | 2 canvas, 3 mask, 26 will-change, 21 infinite anims, 2.3 MP of images |
| principles | 13 | 2.5 | 405.1 | 266.7 | 1299.9 | 1299.9 | 69.2 | 69.2 | 1299.9 | 9 | 0 | 0 | 0.0012 | 919.2 | 11.8 | #document ×13; div.act-card-stage.relative.flex in #act-4 ×9 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (69 ms) | 7 will-change |
| contact | 2 | 1.5 | 658.3 | 866.6 | 866.6 | 866.6 | 100 | 100 | 866.6 | 2 | 0 | 0 | 0 | 576.5 | 15.2 | #document ×2; footer#credits.relative.isolate.z-(--z-main) in #credits ×1 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (16 ms) | 4 mask, 0.9 MP of images |
| credits | 58 | 12.4 | 80.7 | 66.6 | 250 | 366.6 | 72.4 | 56.9 | 366.6 | 38 | 0 | 0 | 0 | 318.4 | 9.6 | #document ×21; div.stage-cam ×8 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (74 ms) | 1 will-change |

### native — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 450→3283 | 17 | 1.9 | 519.6 | 483.3 | 2199.9 | 2199.9 | 88.2 | 2199.9 | 15 | 1250 | 26.7 |
| act-2 | 7015→9355 | 17 | 4.5 | 223.5 | 200 | 650 | 650 | 94.1 | 650 | 17 | 26 | 12.5 |
| act-3 | 28472→30632 | 31 | 7.4 | 135.5 | 133.3 | 283.3 | 316.7 | 61.3 | 316.7 | 20 | 0 | 0 |
| act-4 | 38532→40872 | 29 | 7.6 | 131.6 | 133.3 | 283.3 | 450 | 69 | 450 | 20 | 0 | 0 |

### native — longest animation frames (LoAF total 65936 ms, main-thread work 1892 ms, blocking 1524 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 5.45 | act-1 | 2198 | 0 | 3 | 3 | 0 | (no script) |  |
| 11.66 | journey | 1349 | 0 | 1 | 1 | 0 | (no script) |  |
| 65.61 | principles | 1300 | 0 | 17 | 1 | 16 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i 8 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |
| 69.31 | principles | 1062 | 0 | 21 | 0 | 21 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i 13 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |
| 13.72 | journey | 1050 | 0 | 6 | 0 | 6 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 6 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |

### native — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 0.68 | top | 443 | 388 | 437 | 2 | 435 | user-callback:IntersectionObserverCallback @ 156sqqmkx2usx.js 435 ms | `e=>{e.forEach(e=>{let t=H.get(e.target);if(!t)return;let r=e.boundingClientRect;t.visible=` |
| 37.89 | films | 335 | 147 | 179 | 2 | 177 | user-callback:TimerHandler:setTimeout @ 26z_dkgic0ush.js 177 ms | `()=>{let e=function(){let e=.475*window.innerHeight,t=null;for(let n of R){let i=document.` |
| 14.78 | journey | 476 | 97 | 149 | 1 | 148 | resolve-promise:Promise.resolve @ 00a5balkm-w3j.js 143 ms |  |
| 18.04 | act-2 | 443 | 26 | 64 | 1 | 63 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i 63 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |
| 59.81 | voices | 76 | 4 | 53 | 2 | 51 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i 51 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |

### native — layout shifts (CLS total 0.0033, session 0.0012, 8 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 66.91 | 0.0012 | principles | p.world-face-hp.text-center.text-[1rem][data-lettered=hp] in #principles ; span.whitespace-nowrap in #principles ; span.scene-caption__sep in #principles |
| 24.35 | 0.0006 | trading-algos | span.scene-caption__film.world-face-idiots in #trading-algos |
| 56.42 | 0.0006 | beyond | span.whitespace-nowrap in #beyond ; span.scene-caption__film.world-face-rdr2 in #beyond |
| 59.09 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 58.07 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 59.63 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 58.66 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 33.98 | 0 | systems | h3.type-heading.text-fg.lg:text-[length:var(--text-lead)] in #systems |

### native — visual pops (36; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 1.82 | 100 | act-1 | 0 | 2.1 | 17.9 | change | 3.5 | 1 |
| 5.60 | 1800 | act-1 | 0 | 2.1 | 9.6 | change | 1.9 | 1 |
| 6.00 | 1800 | act-1 | 0 | 9.5 | 53.8 | change | 17.2 | 1 |
| 8.83 | 1800 | act-1 | 0 | 12.9 | 369.1 | change | 25.6 | 1 |
| 9.46 | 2000 | act-1 | 0 | 2.5 | 71.7 | change | 4.7 | 1 |
| 9.83 | 2600 | act-1 | 0 | 3.5 | 99.9 | blank-out | 5.2 | 1 |
| 11.81 | 3400 | journey | 0 | 4.8 | 177.7 | blank-out | 6.9 | 2 |
| 16.50 | 5400 | journey | 0 | 4.1 | 405.1 | change | 8.2 | 1 |
| 16.84 | 6000 | journey | 0 | 3.5 | 345.6 | change | 5.1 | 1 |
| 17.05 | 6200 | journey | 0 | 3.6 | 361.1 | change | 8.3 | 1 |
| 18.91 | 7800 | act-2 | 0 | 2.9 | 19.3 | change | 4.6 | 1 |
| 19.41 | 8000 | act-2 | 0 | 16.9 | 90 | change | 21.9 | 2 |
| 19.64 | 8000 | act-2 | 0 | 28.9 | 39.6 | change | 42.4 | 1 |
| 19.81 | 8000 | act-2 | 0 | 7.1 | 4.6 | change | 14.7 | 1 |
| 20.99 | 8000 | work | 0 | 2.8 | 28.4 | change | 4.1 | 1 |
| 21.23 | 8000 | work | 0 | 2.2 | 37.6 | change | 2 | 1 |
| 22.03 | 9000 | work | 0 | 14.9 | 100.1 | change | 24.4 | 1 |
| 23.31 | 10500 | work | 0 | 14.6 | 11 | fill-in | 28 | 1 |
| 24.74 | 12000 | trading-algos | 0 | 11.6 | 5.6 | change | 46 | 1 |
| 26.93 | 13800 | optuna-screener | 0 | 2 | 173.9 | change | 4.2 | 1 |
| 27.66 | 14600 | optuna-screener | 0 | 18.9 | 264.9 | change | 52.5 | 1 |
| 32.31 | 18600 | systems | 0 | 18.5 | 27.7 | fill-in | 19.3 | 1 |
| 40.75 | 24700 | films | 0 | 5.6 | 15.3 | change | 5.3 | 1 |
| 41.04 | 24800 | films | 0 | 7.2 | 5.6 | change | 6.7 | 1 |
| 47.50 | 27300 | films | 0 | 3 | 4.1 | change | 4.5 | 1 |
| 50.12 | 28500 | act-3 | 0 | 7.3 | 7.6 | change | 14.8 | 1 |
| 51.99 | 29500 | act-3 | 0 | 11.3 | 16.1 | change | 25.7 | 4 |
| 52.63 | 29500 | beyond | 0 | 7.1 | 5.5 | change | 12.2 | 1 |
| 52.92 | 29500 | beyond | 0 | 3.9 | 9.7 | change | 9.9 | 1 |
| 55.62 | 31700 | beyond | 0 | 19.3 | 9 | fill-in | 18.8 | 1 |
| 57.61 | 34400 | writing | 0 | 5.5 | 10.1 | change | 3.9 | 1 |
| 64.08 | 39700 | act-4 | 0 | 11.2 | 5.5 | change | 24.5 | 1 |
| 64.51 | 39700 | act-4 | 0 | 24.7 | 13.9 | change | 51.6 | 2 |
| 68.22 | 41000 | principles | 0 | 8.7 | 5.5 | change | 9.4 | 1 |
| 68.72 | 41800 | principles | 0 | 37.9 | 12.3 | change | 19.8 | 2 |
| 69.73 | 42300 | principles | 0 | 34.2 | 18.7 | change | 18.3 | 1 |

## gl — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 10 | 8.7 | 115 | 16.7 | 800 | 800 | 30 | 30 | 800 | 3 | 194 | 33.3 | 0 | 683.5 | 14.8 | #document ×4; div.absolute.inset-0.origin-center in #top ×4 | user-callback:IntersectionObserverCallback @ 156sqqmkx2usx.js (240 ms) | 1 filter, 1 blend, 1 mask, 5 will-change, 2.3 MP of images |
| act-1 | 29 | 5.5 | 180.5 | 150.1 | 400 | 683.3 | 82.8 | 75.9 | 683.3 | 23 | 0 | 4.2 | 0 | 481.9 | 20.4 | #document ×26; div.act-card-stage.relative.flex in #act-1 ×15 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (18 ms) | 4 mask, 18 will-change, 14 infinite anims, 2.3 MP of images |
| about | 9 | 5.6 | 179.6 | 200 | 316.6 | 316.6 | 88.9 | 88.9 | 316.6 | 8 | 0 | 0 | 0 | 723.7 | 42.7 | #document ×9; div.act-card-stage.relative.flex in #act-2 ×9 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (15 ms) | 1 mask |
| journey | 24 | 8.6 | 116 | 83.4 | 233.3 | 350 | 95.8 | 87.5 | 350 | 21 | 56 | 8.7 | 0 | 828.2 | 50.3 | #document ×23; div.act-card-stage.relative.flex in #act-2 ×23 | resolve-promise:Promise.resolve @ 00a5balkm-w3j.js (100 ms) | 1 mask, 1 will-change, 0.8 MP of images |
| act-2 | 62 | 14.4 | 69.6 | 50.1 | 166.6 | 266.7 | 59.7 | 50 | 266.7 | 34 | 21 | 5.4 | 0 | 606.5 | 63.2 | #document ×35; div.relative.sm:overflow-hidden.sm:rounded-frame in #work ×31 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (92 ms) | 2 filter, 3 mask, 20 will-change, 12 infinite anims, 4.7 MP of images |
| work | 24 | 8.8 | 113.2 | 116.7 | 183.4 | 199.9 | 83.3 | 83.3 | 199.9 | 20 | 0 | 0 | 0 | 806.9 | 54.1 | #document ×19; div.act-card-stage.relative.flex in #act-2 ×16 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (42 ms) | 3 filter, 1 blend, 2 mask, 2 will-change, 1.6 MP of images |
| trading-algos | 18 | 6.9 | 144.4 | 133.4 | 383.2 | 383.2 | 83.3 | 77.8 | 383.2 | 13 | 0 | 0 | 0.0009 | 870.4 | 37.3 | #document ×16; div.stage-window in #optuna-screener ×14 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (47 ms) | 2 filter, 0.2 MP of images |
| optuna-screener | 36 | 8.2 | 121.3 | 116.6 | 283.4 | 300.1 | 75 | 69.4 | 300.1 | 26 | 0 | 0 | 0.0005 | 706.5 | 27.5 | #document ×30; div.stage-window in #trading-algos ×21 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (96 ms) | 2 filter, 1.2 MP of images |
| experiment | 27 | 17.4 | 57.4 | 33.3 | 200 | 300 | 44.4 | 29.6 | 300 | 11 | 0 | 0 | 0 | 790.4 | 32.3 | #document ×14; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×9 |  |  |
| systems | 17 | 7.4 | 135.3 | 100 | 250 | 250 | 100 | 88.2 | 250 | 16 | 0 | 0 | 0 | 887 | 29.1 | #document ×16; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×12 | user-callback:FrameRequestCallback @ 1rezhhvr7fq6o.js v (7 ms) | 1 mask, 1 will-change, 1 MP of images |
| kill-list | 13 | 5.5 | 182 | 166.7 | 350 | 350 | 100 | 84.6 | 350 | 12 | 0 | 0 | 0 | 896.6 | 22.4 | #document ×13; div.relative.@container.will-change-[transform,opacity] in #header ×11 |  | 1 mask, 3 will-change, 0.3 MP of images |
| films | 455 | 28.6 | 34.9 | 16.7 | 150 | 333.3 | 13 | 11.2 | 583.3 | 54 | 197 | 6.8 | 0 | 474.3 | 29 | #document ×165; div.act-card-stage.relative.flex in #act-3 ×79 | user-callback:TimerHandler:setTimeout @ 26z_dkgic0ush.js (103 ms) | 4 will-change, 3.9 MP of images |
| act-3 | 50 | 10.3 | 96.7 | 66.7 | 449.9 | 483.3 | 60 | 58 | 483.3 | 29 | 0 | 0 | 0 | 616.4 | 23.2 | #document ×30; div.stage-window in #beyond ×28 |  | 1 filter, 3 mask, 6 will-change, 2 MP of images |
| beyond | 27 | 5.8 | 172.8 | 133.3 | 400 | 449.9 | 88.9 | 88.9 | 449.9 | 23 | 0 | 0 | 0 | 718.5 | 31.9 | #document ×26; div.act-card-stage.relative.flex in #act-3 ×25 | user-callback:FrameRequestCallback @ 1rezhhvr7fq6o.js v (6 ms) | 6 mask, 3 MP of images |
| writing | 37 | 12.8 | 77.9 | 66.7 | 166.6 | 183.3 | 78.4 | 73 | 183.3 | 26 | 39 | 3.4 | 0.0009 | 778.3 | 80.5 | #document ×36; div.act-card-stage.relative.flex in #act-4 ×35 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (84 ms) | 4 mask, 3 will-change |
| voices | 29 | 16.9 | 59.2 | 49.9 | 150 | 183.4 | 55.2 | 41.4 | 183.4 | 14 | 0 | 6.3 | 0 | 691.5 | 117.7 | #document ×29; div.act-card-stage.relative.flex in #act-4 ×26 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (34 ms) | 2 will-change, 2.3 MP of images |
| act-4 | 86 | 18.6 | 53.9 | 16.7 | 166.7 | 349.9 | 31.4 | 30.2 | 349.9 | 25 | 0 | 0 | 0 | 631.8 | 29.4 | #document ×36; div.rdr2-module__R8wI0W__campSticky in #voices ×29 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (24 ms) | 2 canvas, 3 mask, 26 will-change, 21 infinite anims, 2.3 MP of images |
| principles | 12 | 3.6 | 275 | 299.9 | 500 | 500 | 100 | 100 | 500 | 12 | 0 | 0 | 0.0018 | 957 | 16.1 | #document ×12; div.act-card-stage.relative.flex in #act-4 ×12 | user-callback:IntersectionObserverCallback @ 26z_dkgic0ush.js (10 ms) | 7 will-change |
| contact | 3 | 2.1 | 472.2 | 416.6 | 633.3 | 633.3 | 100 | 100 | 633.3 | 3 | 0 | 0 | 0 | 978.4 | 14.1 | #document ×3; div.act-card-stage.relative.flex in #act-4 ×3 | user-callback:IntersectionObserverCallback @ 26z_dkgic0ush.js (9 ms) | 4 mask, 0.9 MP of images |
| credits | 77 | 17.3 | 57.8 | 50 | 116.7 | 433.3 | 61 | 35.1 | 433.3 | 33 | 0 | 0 | 0 | 445.4 | 11.7 | #document ×27; div.stage-cam ×13 | user-callback:FrameRequestCallback @ 1rezhhvr7fq6o.js v (6 ms) | 1 will-change |

### gl — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 450→3283 | 33 | 5.8 | 173.7 | 150.1 | 400 | 683.3 | 75.8 | 683.3 | 27 | 194 | 3.7 |
| act-2 | 7015→9355 | 67 | 13.5 | 73.9 | 50.1 | 166.8 | 266.7 | 53.7 | 266.7 | 40 | 21 | 4.8 |
| act-3 | 28472→30632 | 54 | 9.3 | 107.1 | 66.7 | 449.9 | 483.3 | 61.1 | 483.3 | 33 | 0 | 0 |
| act-4 | 38532→40872 | 89 | 18 | 55.6 | 16.7 | 166.7 | 349.9 | 32.6 | 349.9 | 29 | 0 | 0 |

### gl — longest animation frames (LoAF total 59929 ms, main-thread work 1421 ms, blocking 507 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 0.1 | top | 807 | 0 | 1 | 1 | 0 | (no script) |  |
| 2.74 | act-1 | 682 | 0 | 1 | 1 | 0 | (no script) |  |
| 69.3 | contact | 635 | 0 | 0 | 0 | 0 | (no script) |  |
| 43.87 | films | 572 | 0 | 1 | 1 | 0 | (no script) |  |
| 47.57 | act-3 | 486 | 0 | 1 | 1 | 0 | (no script) |  |

### gl — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 1.06 | top | 247 | 194 | 241 | 1 | 240 | user-callback:IntersectionObserverCallback @ 156sqqmkx2usx.js 240 ms | `e=>{e.forEach(e=>{let t=H.get(e.target);if(!t)return;let r=e.boundingClientRect;t.visible=` |
| 35.99 | films | 261 | 69 | 104 | 1 | 103 | user-callback:TimerHandler:setTimeout @ 26z_dkgic0ush.js 103 ms | `()=>{let e=function(){let e=.475*window.innerHeight,t=null;for(let n of R){let i=document.` |
| 8.66 | journey | 362 | 56 | 101 | 1 | 100 | resolve-promise:Promise.resolve @ 00a5balkm-w3j.js 100 ms |  |
| 59.22 | writing | 92 | 39 | 85 | 1 | 84 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i 84 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |
| 11.21 | act-2 | 78 | 21 | 67 | 1 | 66 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i 66 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |

### gl — layout shifts (CLS total 0.0041, session 0.0018, 7 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 66.77 | 0.0018 | principles | span.whitespace-nowrap in #principles ; span.scene-caption__sep in #principles ; span.scene-caption__film.world-face-hp in #principles |
| 18.78 | 0.0009 | trading-algos | span.scene-caption__film.world-face-idiots in #trading-algos ; p.scene-caption.mb-tier-group[data-caption=cap.trading-algos][data-caption-world=idiots] in #trading-algos |
| 23.45 | 0.0005 | optuna-screener | h3.mt-tier-pair.max-w-title.type-title in #optuna-screener |
| 58.37 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 57.56 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 59.17 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 57.85 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |

### gl — visual pops (2; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 3.06 | 689 | act-1 | 29 | 5.5 | 36 | change | 7.2 | 1 |
| 63.38 | 39666 | act-4 | 19 | 30.9 | 3 | change | 54.3 | 1 |

## Strips

- strips/intro.png
- strips/intro-landing.png
- strips/pop-intro-58.png
- strips/pop-intro-55.png
- strips/pop-intro-40.png
- strips/desktop-act-1.png
- strips/desktop-act-2.png
- strips/desktop-act-3.png
- strips/desktop-act-4.png
- strips/desktop-first-60s.png
- strips/native-act-1.png
- strips/native-act-2.png
- strips/native-act-3.png
- strips/native-act-4.png
- strips/native-first-60s.png
- strips/pop-native-598.png
- strips/pop-native-607.png
- strips/pop-native-161.png
- strips/pop-native-487.png
- strips/gl-act-1.png
- strips/gl-act-2.png
- strips/gl-act-3.png
- strips/gl-act-4.png
- strips/gl-first-60s.png
- strips/pop-gl-486.png
- strips/pop-gl-17.png
