# Motion baseline — 2026-10-12T23:14:22.085Z

Base http://localhost:3161 · Chromium 141.0.7390.37 headless · 4 CPUs · screencast everyNthFrame=1.

> Headless Chromium rasterises in software (SwiftShader) on a few CPUs and pays for the screencast readback, so absolute frame times are pessimistic vs a real laptop/phone GPU. Read them as RELATIVE hotspots: which sections and transitions are worst. "busy∩jank %" = share of >33.4 ms frames that overlap a long animation frame in which the main thread really worked (script + style/layout/paint >= half the frame, or a >50 ms task); low = the frame was raster/composite-bound (the LoAF is the main thread waiting on the compositor), high = main-thread script/style/layout. "paint suspects" = what the section holds that is costly to raster (filters, blend, masks, canvas, video, image megapixels, infinite animations).

## Runs

| run | viewport | lenis | secs | rAF frames | fps | mean ms | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | LoAF block ms | busy∩jank % | CLS total | CLS (session) | pops | shots |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| intro | 1440x900 |  | 11.2 | 207 | 18.5 | 54 | 33.4 | 133.3 | 233.3 | 49.8 | 38.6 | 733.3 | 108 | 1208 | 1 | 0 | 0 | 6 | 105 |
| desktop | 1440x900 | on | 72.2 | 1087 | 15.1 | 66.4 | 16.7 | 250 | 450 | 38.5 | 33 | 766.6 | 367 | 593 | 2.9 | 0.0454 | 0.025 | 2 | 582 |
| native | 1440x900 | off | 66.7 | 668 | 10 | 99.9 | 33.3 | 350 | 766.7 | 46 | 40.9 | 1883.2 | 273 | 891 | 8.1 | 0.015 | 0.0113 | 28 | 643 |
| alt | 1440x900 | on | 73.2 | 1011 | 13.7 | 72.9 | 16.7 | 283.3 | 483.3 | 40.1 | 35.9 | 816.6 | 370 | 258 | 2 | 0.0306 | 0.025 | 0 | 529 |
| rm | 1440x900 | off | 55.5 | 3220 | 58 | 17.2 | 16.7 | 16.8 | 16.8 | 0.4 | 0.3 | 299.9 | 14 | 62 | 8.3 | 0.025 | 0.025 | 0 | 473 |
| gl | 1440x900 | on | 72 | 1097 | 15.1 | 66.1 | 16.8 | 266.6 | 500 | 38.8 | 32.6 | 966.7 | 368 | 139 | 3.3 | 0.007 | 0.0037 | 2 | 570 |

## Top 10 hotspots (by mean frame time; rm excluded)

| # | run | where | frames | fps | mean | p95 | p99 | >50 % | max | mean / run mean | LoAF block ms | likely cause |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | alt | contact | 5 | 2.9 | 350 | 616.6 | 616.6 | 80 | 616.6 | 4.8 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.1% waiting for the compositor — on screen: 4 mask, 0.9 MP of images [while scrolling: raster 889.8 ms/s, 16.6 paints/s — repainting: #document ×5; div.act-card-stage.relative.flex in #act-4 ×5 \| idle 60 fps, raster 0 ms/s, 0 paints/s] |
| 2 | native | principles | 14 | 2.9 | 342.8 | 1249.9 | 1249.9 | 71.4 | 1249.9 | 3.4 | 49 | main thread, script-bound (2.6% script; top: user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 83 ms) [while scrolling: raster 703.2 ms/s, 21.9 paints/s — repainting: #document ×14; div.act-card-stage.relative.flex in #act-4 ×8 \| idle 60.3 fps, raster 0 ms/s, 0 paints/s] |
| 3 | native | kill-list | 8 | 3 | 331.2 | 766.7 | 766.7 | 87.5 | 766.7 | 3.3 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 97.9% waiting for the compositor — on screen: 3 will-change, 0.6 MP of images [while scrolling: raster 720.1 ms/s, 29.1 paints/s — repainting: #document ×8; div.relative.@container.will-change-[transform,opacity] in #header ×7 \| idle 60.6 fps, raster 0 ms/s, 0 paints/s] |
| 4 | native | journey | 13 | 3.5 | 283.3 | 933.3 | 933.3 | 92.3 | 933.3 | 2.8 | 59 | main thread, script-bound (8% script; top: user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 161 ms) [while scrolling: raster 620.4 ms/s, 33.4 paints/s — repainting: #document ×13; div.act-card-stage.relative.flex in #act-2 ×9 \| idle 0.3 fps, raster 2.8 ms/s, 4.7 paints/s] |
| 5 | gl | principles | 11 | 3.6 | 275.7 | 533.3 | 533.3 | 90.9 | 533.3 | 4.2 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 98.1% waiting for the compositor — on screen: 12 will-change [while scrolling: raster 988.4 ms/s, 12.9 paints/s — repainting: #document ×11; div.act-card-stage.relative.flex in #act-4 ×11 \| idle 60.3 fps, raster 0 ms/s, 0 paints/s] |
| 6 | native | act-1 transition | 22 | 3.9 | 258.3 | 533.3 | 1883.2 | 72.7 | 1883.2 | 2.6 | 318 | raster/composite-bound: only 17.6% of janky frames overlap real main-thread work; the LoAFs are 91.2% waiting for the compositor — on screen: 4 mask, 3.5 MP of images [while scrolling: raster 556.4 ms/s, 15 paints/s — repainting: #document ×18; div.act-card-stage.relative.flex in #act-1 ×9 \| idle 60.3 fps, raster 0 ms/s, 0 paints/s] |
| 7 | alt | about | 7 | 4.1 | 245.2 | 566.7 | 566.7 | 85.7 | 566.7 | 3.4 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 96.8% waiting for the compositor — on screen: 1 mask [while scrolling: raster 725.9 ms/s, 18.1 paints/s — repainting: #document ×7; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×7 \| idle 60.2 fps, raster 0 ms/s, 0 paints/s] |
| 8 | native | work | 9 | 4.3 | 235.2 | 600 | 600 | 88.9 | 600 | 2.4 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 98.4% waiting for the compositor — on screen: 4 filter, 1 blend, 1 mask, 1 will-change, 3.2 MP of images [while scrolling: raster 593.4 ms/s, 22.2 paints/s — repainting: #document ×5; div.act-card-stage.relative.flex in #act-2 ×4 \| idle 60.1 fps, raster 0 ms/s, 0 paints/s] |
| 9 | gl | top | 10 | 4.3 | 231.7 | 966.7 | 966.7 | 80 | 966.7 | 3.5 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.4% waiting for the compositor — on screen: 3 will-change, 1.2 MP of images [while scrolling: raster 426.1 ms/s, 9.5 paints/s — repainting: #document ×9; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×4 \| idle 14.8 fps, raster 91.6 ms/s, 6.7 paints/s (#document ×4)] |
| 10 | alt | top | 9 | 4.6 | 218.5 | 583.2 | 583.2 | 100 | 583.2 | 3 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 97.3% waiting for the compositor — on screen: 3 will-change, 1.2 MP of images [while scrolling: raster 360.5 ms/s, 20.3 paints/s — repainting: #document ×10; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×4 \| idle 14.8 fps, raster 91.6 ms/s, 6.7 paints/s (#document ×4)] |

## Idle probe (desktop: parked 2.5 s on each section, then 1.5 s traced standing still; high raster with few paints = a raster-heavy layer, many paints/s = continuous animation)

| section | idle fps | raster ms/s | paints/s | paint ms/s | style+layout ms/s | rAF JS ms/s | top repainting nodes |
|---|---|---|---|---|---|---|---|
| top | 14.8 | 91.6 | 6.7 | 2.2 | 4.4 | 11.9 | #document ×4; div.absolute.inset-0.will-change-transform ×2; div.act-card-stage.relative.flex ×1 |
| act-1 | 60.3 | 0 | 0 | 0 | 0 | 14.4 |  |
| about | 60.2 | 0 | 0 | 0 | 13 | 28.2 |  |
| journey | 0.3 | 2.8 | 4.7 | 0.2 | 1.4 | 2 | div.relative.mx-auto.w-full ×1; div.absolute.inset-0.will-change-transform ×1; div.pointer-events-none.absolute ×1 |
| act-2 | 60.1 | 0 | 0 | 0 | 0 | 17.4 |  |
| work | 60.1 | 0 | 0 | 0 | 0 | 16 |  |
| trading-algos | 60.3 | 0 | 0 | 0 | 13.4 | 30.1 |  |
| optuna-screener | 60.1 | 0.7 | 0 | 0 | 10.9 | 26.1 |  |
| experiment | 60.4 | 0 | 0 | 0 | 0 | 16.1 |  |
| systems | 60.6 | 0 | 0 | 0 | 0 | 16.9 |  |
| kill-list | 60.6 | 0 | 0 | 0 | 0 | 15 |  |
| films | 60.6 | 0 | 0 | 0 | 0 | 16.7 |  |
| act-3 | 60.5 | 0 | 0 | 0 | 11.7 | 29.8 |  |
| beyond | 60.3 | 0 | 0 | 0 | 0 | 15.8 |  |
| writing | 60.6 | 0 | 0 | 0 | 0 | 18.2 |  |
| voices | 60.1 | 0 | 0 | 0 | 11.6 | 28.2 |  |
| act-4 | 27.1 | 39.5 | 6 | 1.5 | 2.4 | 11.4 | #document ×3; div.act-card-shape ×3; div.act-card-lower.relative.order-2 ×1 |
| principles | 60.3 | 0 | 0 | 0 | 0 | 16.1 |  |
| contact | 60 | 0 | 0 | 0 | 0 | 17.4 |  |
| credits | 60.6 | 0 | 0 | 0 | 15.2 | 33.9 |  |

## intro — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| intro:play-screen | 33 | 12.5 | 79.8 | 16.8 | 166.7 | 1000.1 | 39.4 | 30.3 | 1000.1 | 10 | 1173 | 38.5 | 0 | 354.7 | 44.1 | #document ×33; span.block in #act-1 ×10 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (1013 ms) |  |
| intro:flight | 102 | 18.8 | 53.1 | 50 | 133.2 | 149.9 | 53.9 | 47.1 | 150.1 | 55 | 0 | 0 | 0 | 237.4 | 8.1 | #document ×16; div#act-1-program.relative.px-gutter.pt-tier-group in #act-1 ×10 | event-listener:BUTTON#intro-play.onclick @ intro.js (12 ms) |  |
| intro:waiting | 2 | 7.5 | 133.4 | 200 | 200 | 200 | 100 | 100 | 200 | 2 | 0 | 0 | 0 | 629.9 | 15 | #document ×2; div.intro-top ×1 |  |  |
| intro:hold | 3 | 15 | 66.7 | 16.7 | 166.6 | 166.6 | 33.3 | 33.3 | 166.6 | 2 | 35 | 100 | 0 | 1715 | 85 | #document ×3; div#intro-stage ×2 | user-callback:FrameRequestCallback (76 ms) |  |
| intro:reveal | 1 | 1.4 | 733.3 | 733.3 | 733.3 | 733.3 | 100 | 100 | 733.3 | 1 | 0 | 0 | 0 | 321.8 | 2.7 | #document ×1; video.absolute.inset-0.size-full in #top ×1 |  |  |
| intro:titles | 78 | 24.1 | 41.5 | 16.7 | 133.3 | 233.3 | 38.5 | 24.4 | 233.3 | 28 | 0 | 0 | 0 | 141.3 | 3.7 | #document ×4; video.absolute.inset-0.size-full in #top ×3 |  |  |
| top | 21 | 15.8 | 63.5 | 50 | 116.7 | 316.7 | 66.7 | 42.9 | 316.7 | 10 | 0 | 0 | 0 | 228.8 | 4.5 | #document ×3; div.hero-cap__in in #top ×2 |  | 1 video, 1 filter, 1 blend, 1 mask, 5 will-change, 1 infinite anims, 2.3 MP of images |

### intro — marks and LoAF intro:warm → intro:titles-end

warm t=4.265s → titles-end t=9.813s: 48 LoAF, **47 > 50 ms** (max 731 ms, blocking 35 ms)

intro:arm@-3.254 · intro:ready@-2.996 · intro:play@0 · intro:flight@0.44 · intro:warm@4.265 · intro:hold@5.648 · intro:reveal@5.84 · intro:landing@5.84 · intro:titles@6.612 · intro:end@6.613 · intro:titles-end@9.813

### intro — longest animation frames (LoAF total 11174 ms, main-thread work 1667 ms, blocking 1208 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| -1.66 | intro:play-screen | 1017 | 966 | 1014 | 1 | 1013 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 1013 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 5.84 | intro:reveal | 731 | 0 | 0 | 0 | 0 | (no script) |  |
| -2.23 | intro:play-screen | 316 | 137 | 286 | 1 | 285 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 178 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |
| 10 | top | 315 | 0 | 0 | 0 | 0 | (no script) |  |
| 7.35 | intro:titles | 228 | 0 | 0 | 0 | 0 | (no script) |  |

### intro — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| -1.66 | intro:play-screen | 1017 | 966 | 1014 | 1 | 1013 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 1013 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| -2.23 | intro:play-screen | 316 | 137 | 286 | 1 | 285 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 178 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |
| -2.67 | intro:play-screen | 124 | 58 | 105 | 1 | 104 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 99 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |
| 5.65 | intro:hold | 93 | 35 | 80 | 4 | 76 | user-callback:FrameRequestCallback 76 ms |  |
| -1.91 | intro:play-screen | 85 | 12 | 65 | 1 | 64 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 55 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |

### intro — layout shifts (CLS total 0, session 0, 0 shifts)


### intro — visual pops (6; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| -0.56 | 0 | intro:play-screen | 0 | 7 | 30.2 | change | 7.8 | 1 |
| 2.08 | 0 | intro:flight | 0 | 13.2 | 313.1 | change | 23.5 | 5 |
| 2.66 | 0 | intro:flight | 0 | 9.7 | 220.5 | change | 16.5 | 1 |
| 2.96 | 0 | intro:flight | 0 | 10.3 | 174.5 | change | 19.8 | 3 |
| 3.49 | 0 | intro:flight | 0 | 19 | 321.1 | change | 39.6 | 6 |
| 8.04 | 0 | intro:titles | 0 | 12 | 12.9 | change | 11.1 | 1 |

## desktop — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 10 | 5 | 200 | 166.6 | 766.6 | 766.6 | 90 | 80 | 766.6 | 7 | 347 | 22.2 | 0 | 428.5 | 11.5 | #document ×10; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×4 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (399 ms) | 3 will-change, 1.2 MP of images |
| act-1 | 36 | 7.7 | 129.2 | 83.4 | 450 | 483.4 | 75 | 66.7 | 483.4 | 25 | 81 | 7.4 | 0 | 619 | 24.3 | #document ×22; div.act-card-stage.relative.flex in #act-1 ×18 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (162 ms) | 4 mask, 3.5 MP of images |
| about | 8 | 5.9 | 168.7 | 133.3 | 350 | 350 | 87.5 | 87.5 | 350 | 7 | 0 | 0 | 0 | 788.9 | 31.1 | #document ×7; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×6 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (32 ms) | 1 mask |
| journey | 19 | 5.6 | 179.8 | 150.1 | 483.2 | 483.2 | 84.2 | 78.9 | 483.2 | 14 | 22 | 12.5 | 0 | 798.5 | 39.8 | #document ×19; div.act-card-stage.relative.flex in #act-2 ×19 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (30 ms) | 1 mask, 2 will-change, 0.8 MP of images |
| act-2 | 54 | 12.6 | 79.6 | 33.3 | 266.7 | 550 | 44.4 | 38.9 | 550 | 21 | 0 | 0 | 0 | 581 | 42.6 | #document ×20; div.relative.@container in #work ×18 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (42 ms) | 2 filter, 3 mask, 8 will-change, 4.7 MP of images |
| work | 31 | 13 | 76.9 | 50.1 | 233.3 | 233.4 | 67.7 | 51.6 | 233.4 | 14 | 0 | 0 | 0.0134 | 543.4 | 37.3 | #document ×10; div.act-card-stage.relative.flex in #act-2 ×10 | user-callback:IntersectionObserverCallback @ 0s61ww_t6ie45.js (6 ms) | 4 filter, 1 blend, 1 mask, 1 will-change, 3.2 MP of images |
| trading-algos | 21 | 8.8 | 113.5 | 99.9 | 300 | 399.9 | 76.2 | 61.9 | 399.9 | 13 | 0 | 0 | 0.0009 | 870.3 | 32.7 | #document ×13; div.act-card-stage.relative.flex in #act-2 ×10 | event-listener:#document.onscroll @ 1is0gg5e6lopl.js tx (5 ms) | 2 filter, 0.2 MP of images |
| optuna-screener | 18 | 5.8 | 172.2 | 166.7 | 500 | 500 | 77.8 | 77.8 | 500 | 14 | 82 | 14.3 | 0 | 784.5 | 37.7 | #document ×18; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×18 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (121 ms) | 2 filter, 2.1 MP of images |
| experiment | 14 | 14.5 | 69 | 66.7 | 133.4 | 133.4 | 71.4 | 71.4 | 133.4 | 9 | 0 | 0 | 0 | 759.4 | 63.1 | #document ×14; div.relative.@container.will-change-[transform,opacity] in #header ×14 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (5 ms) |  |
| systems | 21 | 7.3 | 136.5 | 83.3 | 300 | 450 | 81 | 76.2 | 450 | 17 | 0 | 0 | 0.0005 | 880.2 | 24.4 | #document ×19; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×14 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (35 ms) | 1 will-change, 1 MP of images |
| kill-list | 13 | 5.6 | 178.2 | 199.9 | 333.2 | 333.2 | 100 | 84.6 | 333.2 | 13 | 0 | 0 | 0.0005 | 821.9 | 39.3 | #document ×13; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×13 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (10 ms) | 3 will-change, 0.6 MP of images |
| films | 499 | 33.2 | 30.2 | 16.7 | 116.7 | 200.1 | 12.8 | 10 | 499.9 | 53 | 52 | 3.1 | 0.0254 | 327 | 27 | #document ×78; div.act-card-stage.relative.flex in #act-3 ×57 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (16 ms) | 3 will-change, 6.8 MP of images |
| act-3 | 107 | 20.6 | 48.4 | 16.7 | 233.4 | 416.6 | 21.5 | 17.8 | 566.6 | 19 | 0 | 0 | 0 | 568 | 24.5 | #document ×35; div.act-card-stage.relative.flex in #act-3 ×26 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (5 ms) | 1 filter, 2 mask, 6 will-change, 9 infinite anims, 2 MP of images |
| beyond | 42 | 9.8 | 101.6 | 83.3 | 233.3 | 283.3 | 85.7 | 73.8 | 283.3 | 34 | 0 | 0 | 0.0035 | 743.2 | 43.4 | #document ×42; div.act-card-stage.relative.flex in #act-3 ×39 | event-listener:#document.onscroll @ 1is0gg5e6lopl.js tx (5 ms) | 7 mask, 1 will-change, 5.7 MP of images |
| writing | 30 | 9.8 | 102.2 | 100 | 233.4 | 283.3 | 76.7 | 66.7 | 283.3 | 20 | 9 | 8.7 | 0.0006 | 685.1 | 85.4 | #document ×30; div.act-card-stage.relative.flex in #act-4 ×30 | classic-script:/_next/static/chunks/19vq58ko3wg2v.js @ 19vq58ko3wg2v.js (42 ms) | 6 mask, 4 will-change |
| voices | 12 | 7.3 | 136.1 | 133.2 | 316.7 | 316.7 | 83.3 | 75 | 316.7 | 10 | 0 | 0 | 0 | 753.7 | 64.3 | #document ×12; div.act-card-stage.relative.flex in #act-4 ×12 | resolve-promise:Promise.resolve @ 3lv1a4umh4a4v.js (26 ms) | 1 mask, 3 will-change, 9 infinite anims, 3.5 MP of images |
| act-4 | 57 | 12.6 | 79.2 | 16.7 | 299.9 | 333.3 | 42.1 | 40.4 | 333.3 | 25 | 0 | 0 | 0.0006 | 726.9 | 27.5 | #document ×29; div.rdr2-module__R8wI0W__campSticky in #voices ×22 | user-callback:FrameRequestCallback @ 23zdt5ifk7kj2.js f (21 ms) | 2 canvas, 3 mask, 5 will-change, 21 infinite anims, 2.3 MP of images |
| principles | 34 | 10.6 | 94.1 | 66.7 | 366.6 | 466.7 | 67.6 | 58.8 | 466.7 | 20 | 0 | 0 | 0 | 879.1 | 18.1 | #document ×27; div.act-card-stage.relative.flex in #act-4 ×27 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (17 ms) | 12 will-change |
| contact | 4 | 2.6 | 391.7 | 466.6 | 533.3 | 533.3 | 100 | 100 | 533.3 | 4 | 0 | 0 | 0 | 721.9 | 14.7 | #document ×3; div.plate-cam.absolute.inset-0 in #contact ×3 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (16 ms) | 4 mask, 1.9 MP of images |
| credits | 57 | 14.3 | 69.9 | 50 | 150 | 383.4 | 64.9 | 49.1 | 383.4 | 28 | 0 | 0 | 0 | 584.2 | 17.3 | #document ×26; div.stage-cam ×16 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (32 ms) | 1 will-change |

### desktop — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 450→3283 | 39 | 7.6 | 131.6 | 83.4 | 450 | 483.4 | 69.2 | 483.4 | 29 | 81 | 6.7 |
| act-2 | 6861→9201 | 60 | 12.6 | 79.4 | 49.9 | 266.7 | 550 | 40 | 550 | 26 | 0 | 0 |
| act-3 | 26505→28665 | 110 | 19.2 | 52.1 | 16.7 | 283.3 | 416.6 | 20 | 566.6 | 22 | 0 | 0 |
| act-4 | 36633→38973 | 60 | 12.5 | 79.7 | 16.8 | 299.9 | 333.3 | 43.3 | 333.3 | 29 | 0 | 0 |

### desktop — longest animation frames (LoAF total 55493 ms, main-thread work 1681 ms, blocking 593 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 0.81 | top | 760 | 0 | 1 | 1 | 0 | (no script) |  |
| 49.35 | act-3 | 563 | 0 | 1 | 1 | 0 | (no script) |  |
| 13.08 | act-2 | 548 | 0 | 9 | 1 | 8 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 8 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 66.6 | contact | 541 | 0 | 10 | 2 | 8 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 8 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 20.61 | optuna-screener | 501 | 0 | 1 | 1 | 0 | (no script) |  |

### desktop — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 0.09 | top | 431 | 347 | 400 | 1 | 399 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 394 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 21.92 | optuna-screener | 387 | 82 | 135 | 1 | 134 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 121 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 3.21 | act-1 | 381 | 81 | 123 | 1 | 122 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 122 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 54.91 | writing | 90 | 9 | 43 | 1 | 42 | classic-script:/_next/static/chunks/19vq58ko3wg2v.js @ 19vq58ko3wg2v.js 42 ms | `(globalThis.TURBOPACK\|\|(globalThis.TURBOPACK=[])).push(["object"==typeof document?document` |
| 57.38 | voices | 327 | 0 | 28 | 2 | 26 | resolve-promise:Promise.resolve @ 3lv1a4umh4a4v.js 18 ms |  |

### desktop — layout shifts (CLS total 0.0454, session 0.025, 15 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 32.85 | 0.025 | films | div.mt-tier-block in #films ; div.pointer-events-none.absolute.inset-y-0 in #films ; div.pointer-events-none.absolute.inset-y-0 in #films |
| 16.97 | 0.0134 | work | span.scene-caption__moment.world-face-idiots in #work ; span.scene-caption__moment.world-face-idiots in #work ; span.whitespace-nowrap in #work |
| 52.66 | 0.0027 | beyond | span[data-w] in #beyond ; span[data-w] in #beyond ; span[data-words=scrub][data-words-variant=default] in #beyond |
| 19.08 | 0.0009 | trading-algos | span.scene-caption__film.world-face-idiots in #trading-algos ; p.scene-caption.mb-tier-group[data-caption=cap.trading-algos][data-caption-world=idiots] in #trading-algos |
| 52.76 | 0.0008 | beyond | span.whitespace-nowrap in #beyond ; span.scene-caption__film.world-face-rdr2 in #beyond |
| 59.38 | 0.0006 | act-4 | span.whitespace-nowrap in #act-4 ; span.scene-caption__film.world-face-rdr2 in #act-4 |
| 28.63 | 0.0005 | kill-list | span.scene-caption__film.world-face-idiots in #kill-list |
| 43.07 | 0.0005 | films | span[data-words-i] in #films |

### desktop — visual pops (2; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 4.35 | 1706 | act-1 | 33 | 2 | 4.8 | change | 2.1 | 1 |
| 37.37 | 24002 | films | 24 | 6.9 | 244.6 | change | 14.5 | 2 |

## native — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 11 | 6.8 | 147 | 100 | 450 | 450 | 100 | 90.9 | 450 | 8 | 90 | 36.4 | 0 | 485.6 | 13.6 | #document ×8; div#act-1-program.relative.px-gutter.pt-tier-group in #act-1 ×4 | classic-script:/_next/static/chunks/3dewhjypacr5m.js @ 3dewhjypacr5m.js (10 ms) | 3 will-change, 1.2 MP of images |
| act-1 | 21 | 4 | 247.6 | 150 | 533.3 | 1883.2 | 76.2 | 71.4 | 1883.2 | 14 | 312 | 12.5 | 0 | 556.4 | 15 | #document ×18; div.act-card-stage.relative.flex in #act-1 ×9 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (378 ms) | 4 mask, 3.5 MP of images |
| about | 5 | 5 | 200 | 100 | 483.3 | 483.3 | 100 | 100 | 483.3 | 5 | 6 | 40 | 0 | 570 | 36 | #document ×5; div.absolute.inset-0.origin-center in #top ×3 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (47 ms) | 1 mask |
| journey | 13 | 3.5 | 283.3 | 266.6 | 933.3 | 933.3 | 92.3 | 92.3 | 933.3 | 12 | 59 | 41.7 | 0 | 620.4 | 33.4 | #document ×13; div.act-card-stage.relative.flex in #act-2 ×9 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (161 ms) | 1 mask, 2 will-change, 0.8 MP of images |
| act-2 | 29 | 7.4 | 135.1 | 83.4 | 383.3 | 450 | 82.8 | 72.4 | 450 | 22 | 0 | 0 | 0 | 625.5 | 42.1 | #document ×25; div.absolute.inset-x-0.top-0 in #act-2 ×15 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (40 ms) | 2 filter, 3 mask, 8 will-change, 4.7 MP of images |
| work | 9 | 4.3 | 235.2 | 166.6 | 600 | 600 | 100 | 88.9 | 600 | 9 | 0 | 0 | 0 | 593.4 | 22.2 | #document ×5; div.act-card-stage.relative.flex in #act-2 ×4 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (24 ms) | 4 filter, 1 blend, 1 mask, 1 will-change, 3.2 MP of images |
| trading-algos | 15 | 7 | 142.2 | 83.3 | 583.3 | 583.3 | 80 | 73.3 | 583.3 | 10 | 0 | 0 | 0.0008 | 556.4 | 26.7 | #document ×13; div.act-card-stage.relative.flex in #act-2 ×5 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (24 ms) | 2 filter, 0.2 MP of images |
| optuna-screener | 16 | 5 | 201 | 233.3 | 366.7 | 366.7 | 100 | 93.8 | 366.7 | 14 | 0 | 0 | 0 | 689.5 | 35.1 | #document ×16; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×9 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (36 ms) | 2 filter, 2.1 MP of images |
| experiment | 9 | 7.3 | 137 | 149.9 | 283.4 | 283.4 | 77.8 | 77.8 | 283.4 | 7 | 0 | 0 | 0 | 485.7 | 25.9 | #document ×9; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×7 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (8 ms) |  |
| systems | 15 | 5.5 | 181.1 | 166.7 | 400 | 400 | 86.7 | 80 | 400 | 12 | 0 | 0 | 0.0007 | 944.6 | 19.9 | #document ×15; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×11 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (24 ms) | 1 will-change, 1 MP of images |
| kill-list | 8 | 3 | 331.2 | 283.3 | 766.7 | 766.7 | 87.5 | 87.5 | 766.7 | 7 | 0 | 0 | 0 | 720.1 | 29.1 | #document ×8; div.relative.@container.will-change-[transform,opacity] in #header ×7 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (27 ms) | 3 will-change, 0.6 MP of images |
| films | 325 | 27.9 | 35.8 | 16.7 | 116.7 | 333.4 | 14.5 | 12 | 850.1 | 42 | 43 | 2.1 | 0.0005 | 423.4 | 29.1 | #document ×87; div.absolute.inset-0.overflow-hidden in #films ×24 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (156 ms) | 4 will-change, 6.8 MP of images |
| act-3 | 56 | 15.3 | 65.2 | 16.7 | 266.6 | 399.9 | 37.5 | 32.1 | 399.9 | 18 | 110 | 4.8 | 0 | 676.7 | 37.5 | #document ×41; header.fixed.inset-x-0.top-0 in #header ×15 |  | 1 filter, 2 mask, 6 will-change, 9 infinite anims, 2 MP of images |
| beyond | 28 | 5.9 | 169 | 133.4 | 433.3 | 500.1 | 85.7 | 82.1 | 500.1 | 21 | 0 | 0 | 0.0113 | 506.6 | 32.5 | #document ×27; div.act-card-stage.relative.flex in #act-3 ×18 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (6 ms) | 7 mask, 1 will-change, 5.7 MP of images |
| writing | 22 | 7.5 | 132.6 | 66.7 | 383.3 | 433.4 | 72.7 | 59.1 | 433.4 | 14 | 22 | 12.5 | 0.0011 | 617.5 | 66.2 | #document ×22; div.act-card-stage.relative.flex in #act-4 ×13 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (14 ms) | 6 mask, 4 will-change |
| voices | 9 | 5 | 200 | 216.6 | 416.7 | 416.7 | 88.9 | 88.9 | 416.7 | 7 | 0 | 0 | 0 | 743.3 | 49.4 | #document ×9; svg.absolute.inset-0.size-full viewBox=0 0 400 500[data-motif=journal-vignette] in #writing ×9 | resolve-promise:Response.blob.then @ 3cq5gxl4wak-n.js (10 ms) | 1 mask, 3 will-change, 9 infinite anims, 3.5 MP of images |
| act-4 | 16 | 5 | 200 | 116.8 | 549.9 | 549.9 | 75 | 75 | 549.9 | 12 | 200 | 33.3 | 0.0006 | 545 | 30 | #document ×15; div.act-card-stage.relative.flex in #act-4 ×8 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (293 ms) | 2 canvas, 3 mask, 5 will-change, 21 infinite anims, 2.3 MP of images |
| principles | 14 | 2.9 | 342.8 | 250 | 1249.9 | 1249.9 | 78.6 | 71.4 | 1249.9 | 10 | 49 | 36.4 | 0 | 703.2 | 21.9 | #document ×14; div.act-card-stage.relative.flex in #act-4 ×8 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (83 ms) | 12 will-change |
| contact | 3 | 5.1 | 194.5 | 266.7 | 300.1 | 300.1 | 66.7 | 66.7 | 300.1 | 3 | 0 | 0 | 0 | 615.4 | 32.6 | #document ×3; div.act-card-stage.relative.flex in #act-4 ×2 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (8 ms) | 4 mask, 1.9 MP of images |
| credits | 44 | 11.2 | 89.4 | 66.6 | 216.7 | 666.6 | 77.3 | 56.8 | 666.6 | 26 | 0 | 0 | 0 | 590.1 | 18.6 | #document ×22; footer#credits.relative.isolate.z-(--z-main) in #credits ×14 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (33 ms) | 1 will-change |

### native — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 450→3283 | 22 | 3.9 | 258.3 | 166.7 | 533.3 | 1883.2 | 72.7 | 1883.2 | 15 | 318 | 17.6 |
| act-2 | 6861→9201 | 31 | 7 | 143 | 100 | 383.3 | 450 | 74.2 | 450 | 25 | 0 | 0 |
| act-3 | 26505→28665 | 59 | 13.7 | 73.2 | 16.7 | 333.3 | 399.9 | 33.9 | 399.9 | 20 | 110 | 4.3 |
| act-4 | 36633→38973 | 19 | 5.2 | 193.9 | 116.8 | 549.9 | 549.9 | 78.9 | 549.9 | 16 | 222 | 40 |

### native — longest animation frames (LoAF total 56931 ms, main-thread work 2011 ms, blocking 891 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 5.03 | act-1 | 1607 | 0 | 23 | 0 | 23 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 7 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 60.89 | principles | 1054 | 0 | 17 | 0 | 17 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 9 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 57.83 | principles | 1045 | 0 | 1 | 1 | 0 | (no script) |  |
| 7.79 | journey | 958 | 35 | 82 | 1 | 81 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 76 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 59.72 | principles | 892 | 0 | 21 | 0 | 21 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 13 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |

### native — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 4.41 | act-1 | 621 | 312 | 355 | 0 | 355 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 355 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 54.94 | act-4 | 517 | 199 | 244 | 0 | 244 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 244 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 35.82 | films | 839 | 43 | 89 | 1 | 88 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 88 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 7.79 | journey | 958 | 35 | 82 | 1 | 81 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 76 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 57.5 | principles | 325 | 22 | 65 | 1 | 64 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 53 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |

### native — layout shifts (CLS total 0.015, session 0.0113, 10 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 48.31 | 0.0113 | beyond | span.whitespace-nowrap in #beyond ; span[data-w] in #beyond ; span[data-words=scrub][data-words-variant=default] in #beyond |
| 18.87 | 0.0008 | trading-algos | span.scene-caption__film.world-face-idiots in #trading-algos ; p.scene-caption.mb-tier-group[data-caption=cap.trading-algos][data-caption-world=idiots] in #trading-algos |
| 26.39 | 0.0007 | systems | h3.inline.type-heading.text-fg in #systems ; span.ml-3.type-body.text-fg-muted in #systems ; span.ml-3.type-body.text-fg-muted in #systems |
| 54.61 | 0.0006 | act-4 | span.whitespace-nowrap in #act-4 ; span.scene-caption__film.world-face-rdr2 in #act-4 |
| 40.26 | 0.0005 | films | span[data-words-i] in #films |
| 52.35 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 51.38 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 50.49 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |

### native — visual pops (28; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 2.60 | 400 | act-1 | 0 | 4.8 | 12.1 | change | 4.7 | 1 |
| 3.16 | 1400 | act-1 | 0 | 8.7 | 21.7 | change | 14.4 | 1 |
| 3.69 | 1900 | act-1 | 0 | 7.7 | 22.9 | change | 15.8 | 1 |
| 3.96 | 1900 | act-1 | 0 | 11.6 | 28.8 | change | 41.6 | 1 |
| 4.17 | 1900 | act-1 | 0 | 10.2 | 17.9 | change | 32.5 | 3 |
| 5.57 | 2400 | act-1 | 0 | 5.6 | 3.6 | change | 8.7 | 1 |
| 8.42 | 3200 | journey | 0 | 2.4 | 45.6 | change | 0.6 | 1 |
| 9.32 | 4100 | journey | 0 | 3.2 | 61.7 | change | 3.3 | 1 |
| 10.01 | 4200 | journey | 0 | 3.7 | 72.1 | change | 4.5 | 1 |
| 10.59 | 5000 | journey | 0 | 9.5 | 163 | change | 15 | 1 |
| 13.00 | 6900 | act-2 | 0 | 4.4 | 8.4 | change | 7.1 | 1 |
| 13.88 | 7700 | act-2 | 0 | 33 | 13.7 | change | 46.1 | 1 |
| 15.68 | 8200 | work | 0 | 13.7 | 29.8 | change | 24.5 | 1 |
| 18.83 | 11600 | trading-algos | 0 | 8.6 | 6.8 | fill-in | 40.4 | 1 |
| 21.41 | 13000 | optuna-screener | 0 | 15.8 | 43.3 | change | 22.9 | 1 |
| 23.05 | 14500 | experiment | 0 | 23.6 | 3.4 | change | 30.5 | 1 |
| 24.90 | 17000 | systems | 0 | 34.4 | 6.4 | fill-in | 46.8 | 1 |
| 33.95 | 23500 | films | 0 | 5.9 | 8.9 | change | 5.2 | 1 |
| 36.80 | 24500 | films | 0 | 2.2 | 7.5 | fill-in | 4.9 | 1 |
| 43.61 | 27200 | act-3 | 0 | 8.2 | 99.2 | change | 18 | 2 |
| 43.89 | 27400 | act-3 | 0 | 4 | 7.8 | small | 0 | 1 |
| 46.67 | 29200 | beyond | 0 | 19 | 15.4 | fill-in | 21.3 | 1 |
| 50.03 | 32400 | writing | 0 | 5.4 | 53.8 | change | 4.1 | 1 |
| 50.33 | 32700 | writing | 0 | 2.7 | 8.2 | change | 2.8 | 1 |
| 55.36 | 36600 | act-4 | 0 | 13 | 4.6 | change | 24.8 | 1 |
| 56.26 | 37600 | act-4 | 0 | 19 | 3.8 | change | 34.9 | 1 |
| 58.97 | 38700 | principles | 0 | 28.7 | 13.2 | change | 17.6 | 1 |
| 60.41 | 39700 | principles | 0 | 48.6 | 36 | fill-in | 24.4 | 1 |

## alt — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 9 | 4.6 | 218.5 | 83.4 | 583.2 | 583.2 | 100 | 100 | 583.2 | 8 | 0 | 0 | 0 | 360.5 | 20.3 | #document ×10; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×4 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (7 ms) | 3 will-change, 1.2 MP of images |
| act-1 | 35 | 6.6 | 151.4 | 116.7 | 416.7 | 616.7 | 77.1 | 71.4 | 616.7 | 26 | 160 | 7.4 | 0 | 656.8 | 16.4 | #document ×20; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×17 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (209 ms) | 3 mask, 3.6 MP of images |
| about | 7 | 4.1 | 245.2 | 183.3 | 566.7 | 566.7 | 85.7 | 85.7 | 566.7 | 6 | 0 | 0 | 0 | 725.9 | 18.1 | #document ×7; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×7 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (16 ms) | 1 mask |
| journey | 21 | 7.2 | 138.1 | 133.3 | 283.3 | 283.3 | 85.7 | 85.7 | 283.3 | 18 | 0 | 0 | 0 | 784.5 | 36.6 | #document ×21; div.act-card-stage.relative.flex in #act-2 ×21 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (18 ms) | 1 mask, 2 will-change, 1 infinite anims, 0.8 MP of images |
| act-2 | 69 | 15.1 | 66.4 | 16.7 | 316.6 | 483.3 | 37.7 | 34.8 | 483.3 | 24 | 51 | 7.7 | 0 | 550.7 | 20.7 | #document ×16; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×16 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (149 ms) | 1 filter, 3 mask, 5 will-change, 3.6 MP of images |
| work | 15 | 6.7 | 148.9 | 83.3 | 450.1 | 450.1 | 80 | 80 | 450.1 | 12 | 0 | 0 | 0 | 726.3 | 34.5 | #document ×10; div.act-card-stage.relative.flex in #act-2 ×10 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (6 ms) | 5 filter, 1 blend, 1 mask, 1 will-change, 1.6 MP of images |
| trading-algos | 20 | 8.1 | 124.2 | 99.9 | 400 | 400 | 80 | 75 | 400 | 15 | 0 | 0 | 0 | 914.9 | 24.6 | #document ×14; div.act-card-stage.relative.flex in #act-2 ×9 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (12 ms) | 2 filter, 0.2 MP of images |
| optuna-screener | 17 | 5.9 | 168.6 | 133.4 | 433.3 | 433.3 | 82.4 | 76.5 | 433.3 | 13 | 0 | 0 | 0 | 744.8 | 34.2 | #document ×14; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×12 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (6 ms) | 3 filter, 1 mask, 1 will-change, 2.1 MP of images |
| experiment | 15 | 15 | 66.7 | 50.1 | 183.4 | 183.4 | 60 | 53.3 | 183.4 | 8 | 0 | 0 | 0 | 920.1 | 61 | #document ×16; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×13 | event-listener:#document.onscroll @ 1is0gg5e6lopl.js tx (12 ms) |  |
| systems | 21 | 7.6 | 131.7 | 116.7 | 283.3 | 283.3 | 76.2 | 71.4 | 283.3 | 16 | 0 | 0 | 0 | 878.7 | 22 | #document ×16; div.relative.@container.overflow-clip in #header ×13 | user-callback:IntersectionObserverCallback @ 1xxi13clge4be.js (9 ms) | 1 MP of images |
| kill-list | 16 | 6.9 | 144.8 | 133.3 | 300 | 300 | 87.5 | 81.3 | 300 | 12 | 0 | 0 | 0 | 855.2 | 27.6 | #document ×15; div.plate-cam.absolute.inset-0 in #header ×7 |  | 2 will-change, 0.3 MP of images |
| films | 383 | 24.1 | 41.6 | 16.7 | 166.6 | 416.6 | 20.6 | 17.5 | 450 | 68 | 47 | 5.1 | 0.0254 | 417.6 | 20.6 | #document ×114; div.plate-depth-far in #films ×49 | user-callback:FrameRequestCallback @ 35xowqx4mq6hh.js (7 ms) | 2 mask, 5 will-change, 5.7 MP of images |
| act-3 | 101 | 22.2 | 45 | 16.7 | 183.5 | 250 | 22.8 | 19.8 | 366.7 | 21 | 0 | 0 | 0 | 495 | 25.3 | #document ×21; div.act-card-stage.relative.flex in #act-3 ×12 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (12 ms) | 1 filter, 2 mask, 9 will-change, 9 infinite anims, 2 MP of images |
| beyond | 31 | 6.4 | 156.4 | 116.6 | 450 | 750 | 93.5 | 80.6 | 750 | 27 | 0 | 0 | 0.0039 | 778.2 | 31.3 | #document ×30; div.act-card-stage.relative.flex in #act-3 ×29 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (10 ms) | 7 mask, 1 will-change, 5.3 MP of images |
| writing | 38 | 12.2 | 82 | 50 | 233.2 | 483.4 | 57.9 | 44.7 | 483.4 | 18 | 0 | 0 | 0.0007 | 706.5 | 62.2 | #document ×38; div.act-card-stage.relative.flex in #act-4 ×38 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (38 ms) | 5 mask, 4 will-change |
| voices | 14 | 8.6 | 116.7 | 83.3 | 333.3 | 333.3 | 71.4 | 71.4 | 333.3 | 9 | 0 | 0 | 0 | 706 | 24.5 | #document ×14; div.act-card-stage.relative.flex in #act-4 ×14 |  | 9 infinite anims, 3.5 MP of images |
| act-4 | 114 | 24.2 | 41.4 | 16.7 | 133.4 | 216.7 | 20.2 | 19.3 | 816.6 | 22 | 0 | 0 | 0.0006 | 443.5 | 19.7 | #document ×23; div.act-card-stage.relative.flex in #act-4 ×11 | user-callback:FrameRequestCallback @ 35xowqx4mq6hh.js (6 ms) | 1 canvas, 1 blend, 2 mask, 6 will-change, 21 infinite anims, 2.3 MP of images |
| principles | 16 | 5.1 | 197.9 | 183.3 | 733.3 | 733.3 | 75 | 75 | 733.3 | 12 | 0 | 0 | 0 | 979.3 | 9.2 | #document ×13; div.act-card-stage.relative.flex in #act-4 ×13 | user-callback:TimerHandler:setTimeout @ 35xowqx4mq6hh.js (5 ms) | 3 mask |
| contact | 5 | 2.9 | 350 | 316.6 | 616.6 | 616.6 | 80 | 80 | 616.6 | 4 | 0 | 0 | 0 | 889.8 | 16.6 | #document ×5; div.act-card-stage.relative.flex in #act-4 ×5 | event-listener:#document.onscroll @ 1is0gg5e6lopl.js tx (6 ms) | 4 mask, 0.9 MP of images |
| credits | 64 | 16.4 | 60.9 | 50 | 133.4 | 416.6 | 56.3 | 43.8 | 416.6 | 31 | 0 | 0 | 0 | 533.6 | 14.6 | #document ×30; div.stage-cam ×16 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (5 ms) |  |

### alt — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 450→3209 | 38 | 6.2 | 162.3 | 150 | 566.7 | 616.7 | 73.7 | 616.7 | 30 | 160 | 6.7 |
| act-2 | 6786→9126 | 71 | 14.7 | 68.1 | 16.8 | 316.6 | 483.3 | 36.6 | 483.3 | 27 | 51 | 7.1 |
| act-3 | 26475→28635 | 105 | 17.1 | 58.4 | 16.7 | 249.9 | 450 | 22.9 | 750 | 26 | 0 | 0 |
| act-4 | 36681→39021 | 116 | 23.2 | 43.1 | 16.7 | 133.4 | 216.7 | 20.7 | 816.6 | 25 | 0 | 0 |

### alt — longest animation frames (LoAF total 58653 ms, main-thread work 1135 ms, blocking 258 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 63.14 | act-4 | 827 | 0 | 1 | 1 | 0 | (no script) |  |
| 50.5 | beyond | 746 | 0 | 1 | 1 | 0 | (no script) |  |
| 64.72 | principles | 732 | 0 | 6 | 1 | 5 | user-callback:TimerHandler:setTimeout @ 187a93e-_mwtb.js 5 ms | `()=>{B=0,L&&eC(L)},_)));D&&D.parentElement!==e.el&&(e.el.appendChild(D),eI(e),V?.disconnec` |
| 68.67 | contact | 620 | 0 | 1 | 1 | 0 | (no script) |  |
| 2.52 | act-1 | 604 | 0 | 1 | 1 | 0 | (no script) |  |

### alt — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 3.31 | act-1 | 463 | 160 | 199 | 2 | 197 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 197 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 14.52 | act-2 | 88 | 38 | 87 | 0 | 87 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 87 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 14.25 | act-2 | 64 | 13 | 62 | 0 | 62 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 62 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 6.73 | about | 561 | 0 | 47 | 1 | 46 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 9 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |
| 19.43 | trading-algos | 268 | 0 | 18 | 1 | 17 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 7 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |

### alt — layout shifts (CLS total 0.0306, session 0.025, 8 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 32.57 | 0.025 | films | div.pointer-events-none.absolute.inset-y-0 in #films |
| 53.34 | 0.0031 | beyond | span[data-w] in #beyond ; span[data-w] in #beyond ; span[data-words=scrub][data-words-variant=default] in #beyond |
| 53.79 | 0.0008 | beyond | span.whitespace-nowrap in #beyond ; span.scene-caption__sep in #beyond ; span.scene-caption__film.world-face-rdr2 in #beyond |
| 60.11 | 0.0006 | act-4 | span.whitespace-nowrap in #act-4 ; span.scene-caption__film.world-face-rdr2 in #act-4 |
| 43.89 | 0.0005 | films | span[data-words-i] in #films |
| 57.08 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 55.86 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 56.36 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |

### alt — visual pops (0; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)


## rm — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 28 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 4.3 | 2.1 | #document ×1 |  | 1.2 MP of images |
| act-1 | 183 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 2.3 | 2.6 | #document ×6; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×1 |  | 2 mask, 1.2 MP of images |
| about | 73 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 14.8 | 2.5 | #document ×3 |  | 1 mask |
| journey | 209 | 59.4 | 16.8 | 16.7 | 16.7 | 16.8 | 0 | 0 | 33.3 | 1 | 0 |  | 0 | 13.9 | 2.6 | #document ×7; svg.pointer-events-none.absolute.inset-0 viewBox=0 0 600 190 in #work ×2 | user-callback:FrameRequestCallback (34 ms) | 1 mask, 1.4 MP of images |
| act-2 | 135 | 59.1 | 16.9 | 16.7 | 16.8 | 33.3 | 0 | 0 | 33.4 | 0 | 0 |  | 0 | 1.8 | 0.9 | #document ×2 |  | 1 filter, 2 mask, 1.2 MP of images |
| work | 145 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 31 | 1.7 | #document ×4 |  | 5 filter, 1 blend, 1 mask, 1 will-change, 1.6 MP of images |
| trading-algos | 119 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 2 | 1.5 | #document ×3 |  | 2 filter |
| optuna-screener | 178 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 1.7 | 2.4 | #document ×6; img.object-cover in #systems ×1 |  | 2 filter, 1 MP of images |
| experiment | 79 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 4.6 | 3.8 | #document ×3; div.absolute.inset-x-0.top-0 in #kill-list ×1 |  |  |
| systems | 152 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 13 | 2 | #document ×5 |  | 1 MP of images |
| kill-list | 143 | 59.2 | 16.9 | 16.7 | 16.8 | 16.8 | 0.7 | 0 | 50 | 1 | 0 | 0 | 0 | 10.8 | 10.3 | #document ×15; div.absolute.inset-x-0.top-0 in #kill-list ×5 |  | 1 will-change, 0.3 MP of images |
| films | 642 | 59.5 | 16.8 | 16.7 | 16.7 | 16.8 | 0.2 | 0.2 | 100 | 1 | 62 | 100 | 0.025 | 3 | 1.2 | #document ×12; img.object-cover in #films ×1 | user-callback:FrameRequestCallback (100 ms) | 3.9 MP of images |
| act-3 | 136 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 4 | 0.9 | #document ×2 |  | 2 mask, 1 MP of images |
| beyond | 264 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 10.5 | 3.4 | #document ×7; svg.pointer-events-none.absolute.inset-0 viewBox=0 0 2333 1000 in #films ×3 |  | 6 mask, 2.8 MP of images |
| writing | 172 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 1.4 | 9.8 | #document ×7; div.absolute.inset-0.-z-10 in #principles ×4 |  | 5 mask, 3 will-change |
| voices | 99 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 2.4 | 6.1 | #document ×3; svg.pointer-events-none.absolute.inset-0 viewBox=0 0 2333 1000 in #films ×3 |  | 2.3 MP of images |
| act-4 | 137 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 4.4 | 3.9 | #document ×3; svg.pointer-events-none.absolute.inset-0 viewBox=0 0 2333 1000 in #films ×3 |  | 2 mask, 1.2 MP of images |
| principles | 93 | 31.5 | 31.7 | 16.7 | 150.1 | 299.9 | 8.6 | 8.6 | 299.9 | 9 | 0 | 0 | 0 | 579.7 | 9.5 | #document ×13; div.hidden.will-change-transform.xl:block in #principles ×10 |  | 2 will-change |
| contact | 40 | 44.4 | 22.5 | 16.7 | 99.9 | 166.7 | 5 | 5 | 166.7 | 2 | 0 | 0 | 0 | 174.5 | 0 |  |  | 4 mask, 0.9 MP of images |
| credits | 193 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 0.3 | 0.6 | #document ×1; div.hidden.will-change-transform.xl:block in #principles ×1 |  |  |

### rm — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 450→2481 | 210 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 16.8 | 0 | 0 |  |
| act-2 | 6330→7710 | 168 | 59.3 | 16.9 | 16.7 | 16.8 | 33.3 | 0 | 33.4 | 0 | 0 |  |
| act-3 | 24785→26164 | 169 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 16.8 | 0 | 0 |  |
| act-4 | 33790→35140 | 162 | 59.6 | 16.8 | 16.7 | 16.8 | 16.8 | 0 | 33.3 | 1 | 0 |  |

### rm — longest animation frames (LoAF total 2021 ms, main-thread work 148 ms, blocking 62 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 50.24 | principles | 312 | 0 | 0 | 0 | 0 | (no script) |  |
| 50.65 | principles | 283 | 0 | 0 | 0 | 0 | (no script) |  |
| 51.1 | principles | 244 | 0 | 0 | 0 | 0 | (no script) |  |
| 49.98 | principles | 232 | 0 | 0 | 0 | 0 | (no script) |  |
| 51.37 | contact | 174 | 0 | 0 | 0 | 0 | (no script) |  |

### rm — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 25.88 | films | 124 | 62 | 107 | 7 | 100 | user-callback:FrameRequestCallback 100 ms |  |
| 6.3 | journey | 58 | 0 | 41 | 7 | 34 | user-callback:FrameRequestCallback 34 ms |  |
| 22.79 | kill-list | 55 | 0 | 0 | 0 | 0 | (no script) |  |
| 48.55 | principles | 51 | 0 | 0 | 0 | 0 | (no script) |  |
| 49.69 | principles | 53 | 0 | 0 | 0 | 0 | (no script) |  |

### rm — layout shifts (CLS total 0.025, session 0.025, 1 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 26 | 0.025 | films | div.pointer-events-none.absolute.inset-y-0 in #films |

### rm — visual pops (0; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)


## gl — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 10 | 4.3 | 231.7 | 99.9 | 966.7 | 966.7 | 100 | 80 | 966.7 | 8 | 0 | 0 | 0 | 426.1 | 9.5 | #document ×9; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×4 |  | 3 will-change, 1.2 MP of images |
| act-1 | 36 | 7.4 | 135.2 | 100.1 | 416.6 | 416.7 | 88.9 | 72.2 | 416.7 | 29 | 31 | 12.5 | 0 | 598.4 | 27.7 | #document ×33; div.act-card-stage.relative.flex in #act-1 ×20 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (145 ms) | 4 mask, 3.5 MP of images |
| about | 6 | 6.3 | 158.3 | 200 | 266.6 | 266.6 | 100 | 83.3 | 266.6 | 4 | 0 | 0 | 0 | 587.4 | 44.2 | #document ×6; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×6 |  | 1 mask |
| journey | 25 | 8.2 | 121.3 | 83.3 | 316.6 | 383.3 | 84 | 72 | 383.3 | 18 | 24 | 19 | 0 | 722 | 53.1 | #document ×25; div.act-card-stage.relative.flex in #act-2 ×23 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (75 ms) | 1 mask, 2 will-change, 0.8 MP of images |
| act-2 | 79 | 16.7 | 59.9 | 16.7 | 266.7 | 500 | 30.4 | 25.3 | 500 | 21 | 0 | 0 | 0 | 589.7 | 45.4 | #document ×30; div.relative.@container in #work ×23 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (24 ms) | 2 filter, 3 mask, 8 will-change, 4.7 MP of images |
| work | 27 | 13.2 | 75.9 | 83.3 | 150 | 150 | 77.8 | 59.3 | 150 | 18 | 0 | 0 | 0 | 560 | 46.8 | #document ×13; div.act-card-stage.relative.flex in #act-2 ×13 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t (5 ms) | 4 filter, 1 blend, 1 mask, 1 will-change, 3.2 MP of images |
| trading-algos | 24 | 9.2 | 109 | 66.8 | 316.7 | 450.1 | 75 | 62.5 | 450.1 | 16 | 0 | 0 | 0.0009 | 790.3 | 36.3 | #document ×17; div.act-card-stage.relative.flex in #act-2 ×12 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (19 ms) | 2 filter, 0.2 MP of images |
| optuna-screener | 18 | 5.8 | 172.2 | 183.4 | 400 | 400 | 88.9 | 88.9 | 400 | 16 | 0 | 0 | 0 | 832.6 | 41 | #document ×18; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×18 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (26 ms) | 2 filter, 2.1 MP of images |
| experiment | 11 | 14 | 71.2 | 66.7 | 183.3 | 183.3 | 72.7 | 72.7 | 183.3 | 6 | 0 | 0 | 0 | 675.3 | 53.6 | #document ×11; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×9 |  |  |
| systems | 21 | 7.1 | 141.3 | 116.7 | 300.1 | 316.7 | 81 | 76.2 | 316.7 | 16 | 0 | 0 | 0.0004 | 883.2 | 23.3 | #document ×19; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×13 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (31 ms) | 1 will-change, 1 MP of images |
| kill-list | 13 | 5.9 | 170.5 | 150 | 333.4 | 333.4 | 92.3 | 92.3 | 333.4 | 12 | 54 | 16.7 | 0.0004 | 885.6 | 41.1 | #document ×12; div.relative.@container.will-change-[transform,opacity] in #header ×12 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (11 ms) | 3 will-change, 0.6 MP of images |
| films | 450 | 30 | 33.3 | 16.7 | 100 | 266.7 | 17.3 | 12.9 | 516.6 | 60 | 17 | 3.8 | 0.0004 | 343.5 | 29.2 | #document ×97; div.act-card-stage.relative.flex in #act-3 ×56 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (165 ms) | 3 will-change, 6.8 MP of images |
| act-3 | 103 | 21.2 | 47.1 | 16.7 | 250 | 383.4 | 20.4 | 18.4 | 433.2 | 19 | 0 | 0 | 0 | 613 | 26.2 | #document ×33; div.act-card-stage.relative.flex in #act-3 ×24 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (11 ms) | 1 filter, 2 mask, 6 will-change, 9 infinite anims, 2 MP of images |
| beyond | 41 | 9.3 | 107.7 | 83.4 | 266.7 | 366.7 | 78 | 65.9 | 366.7 | 29 | 0 | 0 | 0.0037 | 767.8 | 41.2 | #document ×41; div.act-card-stage.relative.flex in #act-3 ×38 |  | 7 mask, 1 will-change, 5.7 MP of images |
| writing | 31 | 10.2 | 98.4 | 83.2 | 200.1 | 316.6 | 67.7 | 64.5 | 316.6 | 21 | 13 | 4.8 | 0.0006 | 707.6 | 77.4 | #document ×30; div.act-card-stage.relative.flex in #act-4 ×30 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (19 ms) | 6 mask, 5 will-change |
| voices | 15 | 9.1 | 110 | 100 | 183.4 | 183.4 | 93.3 | 93.3 | 183.4 | 14 | 0 | 0 | 0 | 723.1 | 78.2 | #document ×15; div.relative in #principles ×14 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (14 ms) | 1 mask, 3 will-change, 9 infinite anims, 3.5 MP of images |
| act-4 | 101 | 18.5 | 54 | 16.7 | 183.3 | 616.6 | 23.8 | 20.8 | 683.3 | 21 | 0 | 0 | 0.0006 | 595.3 | 23.3 | #document ×26; div.rdr2-module__R8wI0W__campSticky in #voices ×21 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (32 ms) | 2 canvas, 3 mask, 5 will-change, 21 infinite anims, 2.3 MP of images |
| principles | 11 | 3.6 | 275.7 | 250 | 533.3 | 533.3 | 100 | 90.9 | 533.3 | 11 | 0 | 0 | 0 | 988.4 | 12.9 | #document ×11; div.act-card-stage.relative.flex in #act-4 ×11 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (24 ms) | 12 will-change |
| contact | 4 | 3.2 | 312.5 | 350 | 550.1 | 550.1 | 75 | 75 | 550.1 | 3 | 0 | 0 | 0 | 748 | 19.2 | #document ×3; div.act-card-stage.relative.flex in #act-4 ×3 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (17 ms) | 4 mask, 1.9 MP of images |
| credits | 71 | 17 | 58.9 | 49.9 | 133.3 | 749.9 | 52.1 | 36.6 | 749.9 | 26 | 0 | 0 | 0 | 505.1 | 19.8 | #document ×32; div.stage-cam ×18 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (24 ms) | 1 will-change |

### gl — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 450→3283 | 39 | 7.5 | 134.2 | 100 | 416.6 | 416.7 | 71.8 | 416.7 | 31 | 31 | 11.4 |
| act-2 | 6861→9201 | 82 | 16.5 | 60.8 | 16.7 | 216.7 | 500 | 26.8 | 500 | 25 | 0 | 0 |
| act-3 | 26505→28665 | 106 | 18.9 | 53 | 16.7 | 283.4 | 383.4 | 20.8 | 433.2 | 22 | 0 | 0 |
| act-4 | 36633→38973 | 103 | 18.1 | 55.3 | 16.7 | 199.9 | 616.6 | 21.4 | 683.3 | 24 | 0 | 0 |

### gl — longest animation frames (LoAF total 54159 ms, main-thread work 1361 ms, blocking 139 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 0.45 | top | 972 | 0 | 1 | 1 | 0 | (no script) |  |
| 67.87 | credits | 758 | 0 | 9 | 1 | 8 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 8 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 62.82 | act-4 | 680 | 0 | 15 | 1 | 14 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 8 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 61.7 | act-4 | 626 | 0 | 24 | 2 | 22 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 8 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 66.57 | contact | 549 | 0 | 10 | 1 | 9 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 9 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |

### gl — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 9.03 | journey | 338 | 20 | 74 | 2 | 72 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 50 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 4.47 | act-1 | 66 | 16 | 65 | 1 | 64 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 64 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 36.19 | films | 65 | 15 | 63 | 0 | 63 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 63 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 2.86 | act-1 | 328 | 15 | 55 | 1 | 54 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 54 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 35.36 | films | 100 | 2 | 50 | 1 | 49 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 49 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |

### gl — layout shifts (CLS total 0.007, session 0.0037, 12 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 51.93 | 0.0029 | beyond | span[data-w] in #beyond ; span[data-w] in #beyond ; span[data-words=scrub][data-words-variant=default] in #beyond |
| 18.53 | 0.0009 | trading-algos | span.scene-caption__film.world-face-idiots in #trading-algos ; p.scene-caption.mb-tier-group[data-caption=cap.trading-algos][data-caption-world=idiots] in #trading-algos |
| 52.06 | 0.0008 | beyond | span.whitespace-nowrap in #beyond ; span.scene-caption__film.world-face-rdr2 in #beyond |
| 58.57 | 0.0006 | act-4 | span.whitespace-nowrap in #act-4 ; span.scene-caption__film.world-face-rdr2 in #act-4 |
| 28 | 0.0004 | kill-list | span.scene-caption__film.world-face-idiots in #kill-list |
| 42.51 | 0.0004 | films | span[data-words-i] in #films |
| 54.45 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 26.33 | 0.0002 | systems | h3.inline.type-heading.text-fg in #systems |

### gl — visual pops (2; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 37.16 | 23920 | films | 20 | 7.6 | 7.3 | change | 16.2 | 1 |
| 37.37 | 23982 | films | 25 | 7.3 | 7 | change | 14.5 | 1 |

## Strips

- strips/intro.png
- strips/intro-landing.png
- strips/pop-intro-40.png
- strips/pop-intro-30.png
- strips/pop-intro-77.png
- strips/desktop-act-1.png
- strips/desktop-act-2.png
- strips/desktop-act-3.png
- strips/desktop-act-4.png
- strips/desktop-first-60s.png
- strips/pop-desktop-283.png
- strips/pop-desktop-21.png
- strips/native-act-1.png
- strips/native-act-2.png
- strips/native-act-3.png
- strips/native-act-4.png
- strips/native-first-60s.png
- strips/pop-native-112.png
- strips/pop-native-585.png
- strips/pop-native-201.png
- strips/pop-native-595.png
- strips/alt-act-1.png
- strips/alt-act-2.png
- strips/alt-act-3.png
- strips/alt-act-4.png
- strips/alt-first-60s.png
- strips/rm-act-1.png
- strips/rm-act-2.png
- strips/rm-act-3.png
- strips/rm-act-4.png
- strips/rm-first-60s.png
- strips/gl-act-1.png
- strips/gl-act-2.png
- strips/gl-act-3.png
- strips/gl-act-4.png
- strips/gl-first-60s.png
- strips/pop-gl-292.png
- strips/pop-gl-295.png
