# Motion baseline — 2026-10-04T01:04:58.878Z

Base http://localhost:3161 · Chromium 141.0.7390.37 headless · 4 CPUs · screencast everyNthFrame=1.

> Headless Chromium rasterises in software (SwiftShader) on a few CPUs and pays for the screencast readback, so absolute frame times are pessimistic vs a real laptop/phone GPU. Read them as RELATIVE hotspots: which sections and transitions are worst. "busy∩jank %" = share of >33.4 ms frames that overlap a long animation frame in which the main thread really worked (script + style/layout/paint >= half the frame, or a >50 ms task); low = the frame was raster/composite-bound (the LoAF is the main thread waiting on the compositor), high = main-thread script/style/layout. "paint suspects" = what the section holds that is costly to raster (filters, blend, masks, canvas, video, image megapixels, infinite animations).

## Runs

| run | viewport | lenis | secs | rAF frames | fps | mean ms | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | LoAF block ms | busy∩jank % | CLS total | CLS (session) | pops | shots |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| intro | 1440x900 |  | 11.2 | 233 | 20.8 | 48 | 16.8 | 116.7 | 283.4 | 41.6 | 31.8 | 716.6 | 107 | 141 | 2.1 | 0 | 0 | 10 | 121 |
| desktop | 1440x900 | on | 72.6 | 1072 | 14.8 | 67.8 | 33.3 | 233.3 | 433.3 | 44.4 | 36.4 | 699.9 | 389 | 1092 | 4.2 | 0.006 | 0.0036 | 4 | 636 |
| native | 1440x900 | off | 67.4 | 543 | 8.1 | 124 | 50 | 433.3 | 816.7 | 57.3 | 48.6 | 1116.6 | 262 | 466 | 5.1 | 0.0173 | 0.0112 | 52 | 681 |
| alt | 1440x900 | on | 72.6 | 1033 | 14.2 | 70.2 | 33.3 | 250 | 433.3 | 44.5 | 37.3 | 1133.3 | 398 | 264 | 2.2 | 0.0068 | 0.004 | 5 | 628 |
| rm | 1440x900 | off | 53.7 | 3207 | 59.7 | 16.7 | 16.7 | 16.7 | 16.8 | 0.1 | 0.1 | 100 | 5 | 0 | 0 | 0 | 0 | 0 | 459 |
| gl | 1440x900 | on | 72.1 | 1163 | 16.1 | 62 | 33.3 | 200.1 | 349.9 | 43.1 | 32.7 | 783.3 | 394 | 1194 | 3.8 | 0.0141 | 0.0112 | 7 | 705 |

## Top 10 hotspots (by mean frame time; rm excluded)

| # | run | where | frames | fps | mean | p95 | p99 | >50 % | max | mean / run mean | LoAF block ms | likely cause |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | gl | contact | 5 | 2.8 | 363.3 | 600 | 600 | 100 | 600 | 5.9 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.3% waiting for the compositor — on screen: 4 mask, 1.9 MP of images [while scrolling: raster 962.8 ms/s, 16.5 paints/s — repainting: #document ×5; div.act-card-stage.relative.flex in #act-4 ×5 \| idle 60.1 fps, raster 0 ms/s, 0 paints/s] |
| 2 | native | principles | 17 | 3.1 | 325.5 | 1116.6 | 1116.6 | 64.7 | 1116.6 | 2.6 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 98% waiting for the compositor — on screen: 7 will-change [while scrolling: raster 750 ms/s, 15.2 paints/s — repainting: #document ×14; div.act-card-stage.relative.flex in #act-4 ×8 \| idle 60.2 fps, raster 0 ms/s, 0 paints/s] |
| 3 | native | about | 5 | 3.2 | 316.7 | 650 | 650 | 80 | 650 | 2.6 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 96.9% waiting for the compositor — on screen: 1 mask [while scrolling: raster 689.1 ms/s, 19.6 paints/s — repainting: #document ×5; div#intro-film ×3 \| idle 60.5 fps, raster 0 ms/s, 0 paints/s] |
| 4 | native | kill-list | 9 | 3.2 | 316.7 | 616.6 | 616.6 | 88.9 | 616.6 | 2.6 | 60 | raster/composite-bound: only 25% of janky frames overlap real main-thread work; the LoAFs are 96.2% waiting for the compositor — on screen: 3 will-change, 0.6 MP of images [while scrolling: raster 677.9 ms/s, 20.7 paints/s — repainting: #document ×9; div.relative.@container.will-change-[transform,opacity] in #header ×7 \| idle 60.2 fps, raster 0 ms/s, 0 paints/s] |
| 5 | native | voices | 9 | 3.9 | 255.5 | 1066.6 | 1066.6 | 88.9 | 1066.6 | 2.1 | 28 | raster/composite-bound: only 25% of janky frames overlap real main-thread work; the LoAFs are 95.9% waiting for the compositor — on screen: 1 mask, 12 will-change, 9 infinite anims, 3.5 MP of images [while scrolling: raster 350.5 ms/s, 34.8 paints/s — repainting: #document ×8; div.relative in #principles ×5 \| idle 60.3 fps, raster 0 ms/s, 0 paints/s] |
| 6 | native | journey | 12 | 4.1 | 241.7 | 816.7 | 816.7 | 75 | 816.7 | 1.9 | 26 | raster/composite-bound: only 20% of janky frames overlap real main-thread work; the LoAFs are 98.3% waiting for the compositor — on screen: 1 mask, 2 will-change, 0.8 MP of images [while scrolling: raster 697.3 ms/s, 29.7 paints/s — repainting: #document ×12; div.act-card-stage.relative.flex in #act-2 ×9 \| idle 0.5 fps, raster 0.4 ms/s, 4.7 paints/s] |
| 7 | desktop | principles | 17 | 4.2 | 240.2 | 566.6 | 566.6 | 88.2 | 566.6 | 3.5 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.4% waiting for the compositor — on screen: 7 will-change [while scrolling: raster 854.5 ms/s, 18.6 paints/s — repainting: #document ×17; div.act-card-stage.relative.flex in #act-4 ×17 \| idle 60.2 fps, raster 0 ms/s, 0 paints/s] |
| 8 | native | beyond | 24 | 4.5 | 220.8 | 649.9 | 850 | 66.7 | 850 | 1.8 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.2% waiting for the compositor — on screen: 7 mask, 1 will-change, 5.7 MP of images [while scrolling: raster 571.2 ms/s, 25.5 paints/s — repainting: #document ×22; div.act-card-stage.relative.flex in #act-3 ×16 \| idle 60.2 fps, raster 0 ms/s, 0 paints/s] |
| 9 | gl | principles | 22 | 4.8 | 209.1 | 600 | 783.3 | 68.2 | 783.3 | 3.4 | 0 | raster/composite-bound: only 6.7% of janky frames overlap real main-thread work; the LoAFs are 99.3% waiting for the compositor — on screen: 7 will-change [while scrolling: raster 712.8 ms/s, 29.3 paints/s — repainting: #document ×23; div.act-card-stage.relative.flex in #act-4 ×23 \| idle 60.2 fps, raster 0 ms/s, 0 paints/s] |
| 10 | native | act-3 transition | 21 | 5.1 | 196 | 516.7 | 816.7 | 61.9 | 816.7 | 1.6 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.5% waiting for the compositor — on screen: 1 filter, 3 mask, 6 will-change, 2 MP of images [while scrolling: raster 626.7 ms/s, 17.2 paints/s — repainting: #document ×13; div.act-card-stage.relative.flex in #act-3 ×8 \| idle 60 fps, raster 0 ms/s, 0 paints/s] |

## Idle probe (desktop: parked 2.5 s on each section, then 1.5 s traced standing still; high raster with few paints = a raster-heavy layer, many paints/s = continuous animation)

| section | idle fps | raster ms/s | paints/s | paint ms/s | style+layout ms/s | rAF JS ms/s | top repainting nodes |
|---|---|---|---|---|---|---|---|
| top | 29.2 | 17.4 | 13.3 | 1.4 | 1.2 | 7.8 | #document ×2; div.act-card-stage.relative.flex ×1; div.absolute.inset-0.will-change-transform ×1 |
| act-1 | 28 | 0 | 0 | 0 | 5.8 | 13.2 |  |
| about | 60.5 | 0 | 0 | 0 | 16.2 | 34 |  |
| journey | 0.5 | 0.4 | 4.7 | 0.2 | 1.4 | 1.6 | div.relative.mx-auto.w-full ×1; div.absolute.inset-0.will-change-transform ×1; svg.absolute.inset-0.size-full viewBox=0 0 600 180 ×1 |
| act-2 | 60.2 | 0 | 0 | 0 | 0 | 17.3 |  |
| work | 60.5 | 0 | 0 | 0 | 0 | 16.9 |  |
| trading-algos | 60.3 | 0 | 0 | 0 | 11 | 27.7 |  |
| optuna-screener | 60.1 | 0 | 0 | 0 | 9.9 | 26 |  |
| experiment | 60.2 | 0 | 0 | 0 | 0 | 15.6 |  |
| systems | 60.3 | 0 | 0 | 0 | 0 | 18.9 |  |
| kill-list | 60.2 | 0 | 0 | 0 | 0 | 15.5 |  |
| films | 60.3 | 0 | 0 | 0 | 0 | 13.6 |  |
| act-3 | 60 | 0 | 0 | 0 | 0 | 15.5 |  |
| beyond | 60.2 | 0 | 0 | 0 | 0 | 16.2 |  |
| writing | 60.5 | 0 | 0 | 0 | 0 | 15.3 |  |
| voices | 60.3 | 0 | 0 | 0 | 10.8 | 26.1 |  |
| act-4 | 61.1 | 3.9 | 6.7 | 1.6 | 2 | 16.3 | #document ×4; div.act-card-shape ×3; div.act-card-lower.relative.order-2 ×1 |
| principles | 60.2 | 0 | 0 | 0 | 0 | 14.3 |  |
| contact | 60.1 | 0 | 0 | 0 | 0 | 15.6 |  |
| credits | 60.2 | 0 | 0 | 0 | 12.5 | 29.4 |  |

## intro — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| intro:play-screen | 60 | 22.8 | 43.9 | 16.7 | 200 | 249.9 | 35 | 18.3 | 249.9 | 15 | 116 | 19 | 0 | 552.6 | 40.3 | #document ×30; div#act-1-program.relative.px-gutter.pt-tier-group in #act-1 ×10 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (304 ms) |  |
| intro:flight | 104 | 18.6 | 53.7 | 49.9 | 116.8 | 166.7 | 50 | 41.3 | 416.6 | 51 | 0 | 0 | 0 | 275.7 | 5 | #document ×7; div#act-1-program.relative.px-gutter.pt-tier-group in #act-1 ×4 | event-listener:BUTTON#intro-play.onclick @ intro.js (12 ms) |  |
| intro:hold | 2 | 13.3 | 75 | 133.3 | 133.3 | 133.3 | 50 | 50 | 133.3 | 1 | 25 | 100 | 0 | 1573.3 | 106.7 | #document ×2; div#intro-stage ×2 |  |  |
| intro:reveal | 1 | 1.4 | 716.6 | 716.6 | 716.6 | 716.6 | 100 | 100 | 716.6 | 1 | 0 | 100 | 0 | 371.2 | 2.8 | #document ×1; video.absolute.inset-0.size-full in #top ×1 |  |  |
| intro:titles | 80 | 24.1 | 41.5 | 16.7 | 116.7 | 283.4 | 36.3 | 25 | 283.4 | 28 | 0 | 0 | 0 | 90.5 | 3 | #document ×3; video.absolute.inset-0.size-full in #top ×2 |  |  |
| top | 46 | 32.5 | 30.8 | 16.7 | 66.7 | 83.3 | 30.4 | 19.6 | 83.3 | 11 | 0 | 0 | 0 | 71.3 | 3.5 | #document ×3; div.hero-cap__in in #top ×2 |  | 1 video, 1 filter, 1 blend, 1 mask, 5 will-change, 2.3 MP of images |

### intro — marks and LoAF intro:warm → intro:titles-end

warm t=4.271s → titles-end t=9.759s: 45 LoAF, **45 > 50 ms** (max 657 ms, blocking 25 ms)

intro:arm@-4.2 · intro:ready@-3.836 · intro:play@0 · intro:flight@0.349 · intro:warm@4.271 · intro:hold@5.581 · intro:reveal@5.786 · intro:landing@5.786 · intro:titles@6.558 · intro:end@6.559 · intro:titles-end@9.759

### intro — longest animation frames (LoAF total 10072 ms, main-thread work 380 ms, blocking 141 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 5.79 | intro:reveal | 657 | 0 | 0 | 0 | 0 | (no script) |  |
| 0.22 | intro:flight | 413 | 0 | 1 | 1 | 0 | (no script) |  |
| 6.99 | intro:titles | 281 | 0 | 0 | 0 | 0 | (no script) |  |
| -1.47 | intro:play-screen | 248 | 0 | 9 | 2 | 7 | classic-script:/_next/static/chunks/3dewhjypacr5m.js @ 3dewhjypacr5m.js 7 ms | `(globalThis.TURBOPACK\|\|(globalThis.TURBOPACK=[])).push(["object"==typeof document?document` |
| 5.6 | intro:hold | 191 | 25 | 0 | 0 | 0 | (no script) |  |

### intro — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| -2.22 | intro:play-screen | 173 | 102 | 158 | 1 | 157 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 144 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |
| -2.05 | intro:play-screen | 122 | 13 | 100 | 8 | 92 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 42 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |
| -1.73 | intro:play-screen | 93 | 1 | 50 | 1 | 49 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 31 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |
| -1.63 | intro:play-screen | 160 | 0 | 18 | 1 | 17 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 9 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |
| -0.01 | intro:flight | 59 | 0 | 12 | 0 | 12 | event-listener:BUTTON#intro-play.onclick @ intro.js 12 ms | `(){Ke()})),l.addEventListener("click",(function(){Hn("skip")})),c&&c.addEventListener("cli` |

### intro — layout shifts (CLS total 0, session 0, 0 shifts)


### intro — visual pops (10; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| -1.87 | 0 | intro:play-screen | 0 | 6.4 | 411.4 | change | 6.5 | 1 |
| 1.67 | 0 | intro:flight | 0 | 2.2 | 52.2 | change | 4.8 | 1 |
| 1.94 | 0 | intro:flight | 0 | 13 | 258.6 | change | 22.2 | 2 |
| 2.20 | 0 | intro:flight | 0 | 10.6 | 197.6 | change | 16.3 | 3 |
| 2.55 | 0 | intro:flight | 0 | 11.1 | 197 | change | 21.2 | 2 |
| 2.85 | 0 | intro:flight | 0 | 11.2 | 184.4 | change | 23.6 | 1 |
| 3.01 | 0 | intro:flight | 0 | 10.4 | 157.7 | change | 21.3 | 1 |
| 3.50 | 0 | intro:flight | 0 | 15.6 | 42.9 | change | 35.3 | 7 |
| 7.92 | 0 | intro:titles | 0 | 11.7 | 12 | change | 10.7 | 1 |
| 10.89 | 0 | top | 0 | 2.1 | 11.2 | change | 1.2 | 1 |

## desktop — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 12 | 13.8 | 72.2 | 16.7 | 333.4 | 333.4 | 33.3 | 33.3 | 333.4 | 4 | 0 | 0 | 0 | 423.5 | 28.8 | #document ×5; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×5 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (5 ms) | 3 will-change, 1.2 MP of images |
| act-1 | 40 | 6.8 | 147.5 | 83.4 | 500 | 699.9 | 67.5 | 60 | 699.9 | 26 | 277 | 7.4 | 0 | 551.2 | 18.8 | #document ×21; div.act-card-stage.relative.flex in #act-1 ×18 | user-callback:TimerHandler:setTimeout @ 1_2f9ddauvl4s.js (318 ms) | 4 mask, 18 will-change, 14 infinite anims, 2.3 MP of images |
| about | 6 | 5.2 | 191.7 | 183.3 | 366.7 | 366.7 | 100 | 100 | 366.7 | 6 | 0 | 0 | 0 | 795.7 | 32.2 | #document ×5; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×5 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (7 ms) | 1 mask |
| journey | 24 | 7.6 | 131.2 | 116.6 | 266.7 | 433.4 | 87.5 | 83.3 | 433.4 | 20 | 439 | 14.3 | 0 | 802.6 | 47.9 | #document ×22; video.absolute.inset-0.size-full in #top ×22 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (435 ms) | 1 mask, 2 will-change, 0.8 MP of images |
| act-2 | 62 | 12.5 | 79.8 | 50 | 250 | 366.7 | 50 | 48.4 | 366.7 | 27 | 50 | 9.7 | 0 | 592 | 49.5 | #document ×34; div.relative.@container in #work ×26 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (117 ms) | 2 filter, 3 mask, 20 will-change, 12 infinite anims, 4.7 MP of images |
| work | 40 | 19.7 | 50.8 | 49.9 | 133.4 | 150 | 50 | 37.5 | 150 | 16 | 0 | 0 | 0 | 437.2 | 54.1 | #document ×15; video.absolute.inset-0.size-full in #top ×15 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (25 ms) | 3 filter, 1 blend, 1 mask, 1 will-change, 3.2 MP of images |
| trading-algos | 23 | 9.5 | 105.1 | 66.6 | 316.7 | 366.6 | 87 | 65.2 | 366.6 | 15 | 0 | 0 | 0.0009 | 791.6 | 41 | #document ×16; video.absolute.inset-0.size-full in #top ×11 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (12 ms) | 2 filter, 0.2 MP of images |
| optuna-screener | 19 | 6.1 | 163.2 | 116.6 | 550 | 550 | 100 | 94.7 | 550 | 19 | 0 | 0 | 0 | 815.5 | 37.4 | #document ×19; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×19 | user-callback:FrameRequestCallback @ 29bl5kt6u0_n3.js (6 ms) | 2 filter, 2.1 MP of images |
| experiment | 12 | 12.6 | 79.2 | 66.6 | 150.1 | 150.1 | 83.3 | 75 | 150.1 | 7 | 0 | 0 | 0 | 803.2 | 55.8 | #document ×12; div.relative.@container.will-change-[transform,opacity] in #header ×12 | event-listener:#document.onscroll @ 1is0gg5e6lopl.js tx (5 ms) |  |
| systems | 21 | 7.2 | 138.1 | 133.3 | 250.1 | 266.6 | 90.5 | 90.5 | 266.6 | 19 | 0 | 0 | 0.0001 | 871.1 | 26.9 | #document ×19; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×15 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (11 ms) | 1 will-change, 1 MP of images |
| kill-list | 12 | 5.4 | 184.7 | 183.4 | 316.6 | 316.6 | 100 | 91.7 | 316.6 | 12 | 0 | 0 | 0.0003 | 848.6 | 28 | #document ×12; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×12 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (6 ms) | 3 will-change, 0.6 MP of images |
| films | 363 | 23.9 | 41.8 | 16.7 | 133.4 | 233.3 | 27.5 | 20.7 | 366.7 | 77 | 120 | 6 | 0 | 452.3 | 45.9 | #document ×175; div.act-card-stage.relative.flex in #act-3 ×100 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (139 ms) | 4 will-change, 6.8 MP of images |
| act-3 | 130 | 32.1 | 31.2 | 16.7 | 116.6 | 216.7 | 16.9 | 11.5 | 216.7 | 16 | 0 | 0 | 0 | 499.5 | 27.9 | #document ×31; div.act-card-stage.relative.flex in #act-3 ×14 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (12 ms) | 1 filter, 3 mask, 6 will-change, 2 MP of images |
| beyond | 59 | 12.1 | 82.5 | 66.7 | 183.3 | 283.3 | 84.7 | 67.8 | 283.3 | 41 | 0 | 0 | 0.0036 | 665.2 | 50.1 | #document ×54; div.act-card-stage.relative.flex in #act-3 ×41 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (6 ms) | 7 mask, 1 will-change, 5.7 MP of images |
| writing | 40 | 14 | 71.7 | 33.4 | 250 | 316.7 | 47.5 | 42.5 | 316.7 | 16 | 12 | 10.5 | 0.0005 | 803 | 102.9 | div.act-card-stage.relative.flex in #act-4 ×41; div.rdr2-module__R8wI0W__campSticky in #voices ×41 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (16 ms) | 6 mask, 4 will-change |
| voices | 15 | 8.9 | 112.2 | 83.3 | 250 | 250 | 93.3 | 80 | 250 | 12 | 194 | 28.6 | 0 | 652.3 | 88.5 | #document ×14; div.relative in #principles ×14 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (284 ms) | 1 mask, 12 will-change, 9 infinite anims, 3.5 MP of images |
| act-4 | 89 | 19.1 | 52.4 | 16.7 | 233.3 | 450 | 28.1 | 25.8 | 450 | 23 | 0 | 0 | 0.0006 | 645.9 | 31.7 | #document ×30; div.rdr2-module__R8wI0W__campSticky in #voices ×26 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (20 ms) | 2 canvas, 3 mask, 26 will-change, 21 infinite anims, 2.3 MP of images |
| principles | 17 | 4.2 | 240.2 | 233.3 | 566.6 | 566.6 | 88.2 | 88.2 | 566.6 | 13 | 0 | 0 | 0 | 854.5 | 18.6 | #document ×17; div.act-card-stage.relative.flex in #act-4 ×17 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (8 ms) | 7 will-change |
| contact | 3 | 2.5 | 405.5 | 433.3 | 600 | 600 | 100 | 100 | 600 | 3 | 0 | 0 | 0 | 1000.3 | 18.9 | #document ×3; div.act-card-stage.relative.flex in #act-4 ×3 |  | 4 mask, 1.9 MP of images |
| credits | 85 | 19.3 | 51.8 | 33.4 | 83.4 | 649.9 | 45.9 | 22.4 | 649.9 | 17 | 0 | 0 | 0 | 572.1 | 14.3 | #document ×32; div.stage-cam ×17 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (15 ms) | 1 will-change |

### desktop — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 450→3283 | 43 | 6.7 | 148.4 | 83.4 | 466.8 | 699.9 | 62.8 | 699.9 | 30 | 277 | 6.7 |
| act-2 | 6861→9201 | 65 | 12.5 | 80.3 | 50.1 | 250 | 366.7 | 50.8 | 366.7 | 31 | 440 | 8.8 |
| act-3 | 26933→29093 | 136 | 29.8 | 33.6 | 16.7 | 133.3 | 216.7 | 14 | 216.7 | 21 | 0 | 0 |
| act-4 | 37028→39368 | 93 | 17.1 | 58.4 | 16.7 | 250 | 566.6 | 26.9 | 566.6 | 24 | 0 | 0 |

### desktop — longest animation frames (LoAF total 54092 ms, main-thread work 2081 ms, blocking 1092 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 2.47 | act-1 | 693 | 0 | 8 | 2 | 6 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v 6 ms | `()=>{let i=e.MotionGlobalConfig.useManualTiming,o=i?a.timestamp:performance.now();n=!1,i\|\|` |
| 1.38 | act-1 | 647 | 277 | 320 | 2 | 318 | user-callback:TimerHandler:setTimeout @ 1_2f9ddauvl4s.js 318 ms | `()=>{K=0,U&&eP(U)},180)));_&&_.parentElement!==e.el&&(e.el.appendChild(_),eM(e),V?.disconn` |
| 68.26 | credits | 637 | 0 | 8 | 1 | 7 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v 7 ms | `()=>{let i=e.MotionGlobalConfig.useManualTiming,o=i?a.timestamp:performance.now();n=!1,i\|\|` |
| 67.48 | contact | 587 | 0 | 2 | 2 | 0 | (no script) |  |
| 20.65 | optuna-screener | 559 | 0 | 1 | 1 | 0 | (no script) |  |

### desktop — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 10.64 | journey | 445 | 390 | 436 | 1 | 435 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r 435 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 1.38 | act-1 | 647 | 277 | 320 | 2 | 318 | user-callback:TimerHandler:setTimeout @ 1_2f9ddauvl4s.js 318 ms | `()=>{K=0,U&&eP(U)},180)));_&&_.parentElement!==e.el&&(e.el.appendChild(_),eM(e),V?.disconn` |
| 57.48 | voices | 155 | 102 | 149 | 2 | 147 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r 147 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 57.78 | voices | 144 | 92 | 138 | 1 | 137 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r 137 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 38.91 | films | 128 | 76 | 122 | 0 | 122 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r 122 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |

### desktop — layout shifts (CLS total 0.006, session 0.0036, 10 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 52.02 | 0.0028 | beyond | span[data-w] in #beyond ; span[data-w] in #beyond ; span[data-words=scrub][data-words-variant=default] in #beyond |
| 19.26 | 0.0009 | trading-algos | span.scene-caption__film.world-face-idiots in #trading-algos ; p.scene-caption.mb-tier-group[data-caption=cap.trading-algos][data-caption-world=idiots] in #trading-algos |
| 52.13 | 0.0008 | beyond | span.whitespace-nowrap in #beyond ; span.scene-caption__sep in #beyond ; span.scene-caption__film.world-face-rdr2 in #beyond |
| 58.7 | 0.0006 | act-4 | span.whitespace-nowrap in #act-4 ; span.scene-caption__film.world-face-rdr2 in #act-4 |
| 28.67 | 0.0003 | kill-list | span.scene-caption__film.world-face-idiots in #kill-list |
| 54.64 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 55.08 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 56.46 | 0.0001 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |

### desktop — visual pops (4; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 4.80 | 1999 | act-1 | 2 | 7.9 | 3.1 | change | 14.3 | 1 |
| 15.43 | 7957 | act-2 | 22 | 3.2 | 11.2 | change | 5.1 | 1 |
| 16.10 | 8189 | work | 36 | 15.6 | 54.9 | change | 36.4 | 2 |
| 63.76 | 38951 | principles | 0 | 2.9 | 19.5 | change | 6.1 | 1 |

## native — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 12 | 13.8 | 72.2 | 16.7 | 300 | 300 | 33.3 | 25 | 300 | 4 | 0 | 0 | 0 | 185.8 | 18.5 | #document ×5; header.fixed.inset-x-0.top-0 in #header ×3 |  | 3 will-change, 1.2 MP of images |
| act-1 | 28 | 6 | 166.7 | 100.1 | 483.3 | 516.6 | 71.4 | 67.9 | 516.6 | 14 | 211 | 10 | 0 | 435.9 | 22.3 | #document ×20; div.act-card-stage.relative.flex in #act-1 ×10 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (256 ms) | 4 mask, 18 will-change, 14 infinite anims, 2.3 MP of images |
| about | 5 | 3.2 | 316.7 | 300 | 650 | 650 | 100 | 80 | 650 | 4 | 0 | 0 | 0 | 689.1 | 19.6 | #document ×5; div#intro-film ×3 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (17 ms) | 1 mask |
| journey | 12 | 4.1 | 241.7 | 266.6 | 816.7 | 816.7 | 83.3 | 75 | 816.7 | 8 | 26 | 20 | 0 | 697.3 | 29.7 | #document ×12; div.act-card-stage.relative.flex in #act-2 ×9 | user-callback:FrameRequestCallback @ 0jah0qpwesagi.js r (16 ms) | 1 mask, 2 will-change, 0.8 MP of images |
| act-2 | 28 | 7 | 143.4 | 116.7 | 450 | 616.7 | 75 | 67.9 | 616.7 | 21 | 0 | 4.8 | 0 | 619.4 | 39.1 | #document ×23; div.act-card-stage.relative.flex in #act-2 ×9 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (52 ms) | 2 filter, 3 mask, 20 will-change, 12 infinite anims, 4.7 MP of images |
| work | 25 | 12.6 | 79.3 | 33.3 | 283.3 | 433.3 | 40 | 32 | 433.3 | 8 | 0 | 0 | 0.0035 | 441.7 | 58.5 | #document ×12; div.act-card-stage.relative.flex in #act-2 ×8 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (49 ms) | 3 filter, 1 blend, 1 mask, 1 will-change, 3.2 MP of images |
| trading-algos | 24 | 8.9 | 112.5 | 50.1 | 383.2 | 550 | 58.3 | 50 | 550 | 10 | 0 | 0 | 0.0009 | 641.5 | 28.5 | #document ×16; node 278 ×8 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (40 ms) | 2 filter, 0.2 MP of images |
| optuna-screener | 21 | 7.2 | 138.9 | 83.3 | 300.1 | 466.7 | 71.4 | 66.7 | 466.7 | 13 | 0 | 0 | 0 | 648.1 | 39.8 | #document ×21; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×10 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (35 ms) | 2 filter, 2.1 MP of images |
| experiment | 13 | 11.8 | 84.6 | 66.7 | 233.3 | 233.3 | 69.2 | 61.5 | 233.3 | 9 | 0 | 0 | 0 | 419.1 | 47.3 | #document ×12; div in #optuna-screener ×10 |  |  |
| systems | 14 | 5.7 | 175 | 216.6 | 450 | 450 | 64.3 | 64.3 | 450 | 9 | 0 | 0 | 0.0001 | 919.3 | 22 | #document ×15; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×11 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (15 ms) | 1 will-change, 1 MP of images |
| kill-list | 9 | 3.2 | 316.7 | 283.3 | 616.6 | 616.6 | 88.9 | 88.9 | 616.6 | 8 | 60 | 25 | 0 | 677.9 | 20.7 | #document ×9; div.relative.@container.will-change-[transform,opacity] in #header ×7 | user-callback:TimerHandler:setTimeout @ 41nayducv9yqc.js tf (102 ms) | 3 will-change, 0.6 MP of images |
| films | 165 | 14.2 | 70.6 | 16.7 | 266.6 | 383.3 | 38.8 | 33.3 | 433.3 | 55 | 91 | 7.8 | 0.0002 | 393.9 | 28.9 | #document ×94; div.act-card-stage.relative.flex in #act-3 ×25 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (77 ms) | 4 will-change, 6.8 MP of images |
| act-3 | 18 | 5.2 | 193.5 | 183.3 | 816.7 | 816.7 | 77.8 | 61.1 | 816.7 | 13 | 0 | 0 | 0 | 626.7 | 17.2 | #document ×13; div.act-card-stage.relative.flex in #act-3 ×8 |  | 1 filter, 3 mask, 6 will-change, 2 MP of images |
| beyond | 24 | 4.5 | 220.8 | 133.3 | 649.9 | 850 | 79.2 | 66.7 | 850 | 17 | 0 | 0 | 0.0112 | 571.2 | 25.5 | #document ×22; div.act-card-stage.relative.flex in #act-3 ×16 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (10 ms) | 7 mask, 1 will-change, 5.7 MP of images |
| writing | 21 | 7.2 | 138.1 | 83.3 | 316.6 | 550 | 71.4 | 57.1 | 550 | 13 | 50 | 13.3 | 0.0008 | 666.6 | 53.8 | #document ×21; svg.absolute.inset-0.size-full viewBox=0 0 400 500[data-motif=journal-landscape] in #writing ×16 | classic-script:/_next/static/chunks/19vq58ko3wg2v.js @ 19vq58ko3wg2v.js (76 ms) | 6 mask, 4 will-change |
| voices | 9 | 3.9 | 255.5 | 116.7 | 1066.6 | 1066.6 | 88.9 | 88.9 | 1066.6 | 8 | 28 | 25 | 0 | 350.5 | 34.8 | #document ×8; div.relative in #principles ×5 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (75 ms) | 1 mask, 12 will-change, 9 infinite anims, 3.5 MP of images |
| act-4 | 33 | 10 | 100 | 66.7 | 366.6 | 466.7 | 60.6 | 57.6 | 466.7 | 20 | 0 | 0 | 0.0006 | 574.3 | 34.8 | #document ×22; div.act-card-stage.relative.flex in #act-4 ×6 | user-callback:FrameRequestCallback @ 02frwek6itxvz.js f (14 ms) | 2 canvas, 3 mask, 26 will-change, 21 infinite anims, 2.3 MP of images |
| principles | 17 | 3.1 | 325.5 | 150 | 1116.6 | 1116.6 | 64.7 | 64.7 | 1116.6 | 9 | 0 | 0 | 0 | 750 | 15.2 | #document ×14; div.act-card-stage.relative.flex in #act-4 ×8 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (65 ms) | 7 will-change |
| contact | 4 | 2.7 | 375 | 549.9 | 566.7 | 566.7 | 75 | 75 | 566.7 | 3 | 0 | 0 | 0 | 867.3 | 29.3 | #document ×5; div.relative.grid.grid-cols-1 in #principles ×3 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (18 ms) | 4 mask, 1.9 MP of images |
| credits | 61 | 18.2 | 54.9 | 50 | 133.3 | 266.7 | 52.5 | 26.2 | 266.7 | 16 | 0 | 0 | 0 | 508.1 | 18.5 | #document ×28; footer#credits.relative.isolate.z-(--z-main) in #credits ×15 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (32 ms) | 1 will-change |

### native — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 450→3283 | 31 | 5.8 | 171 | 100.1 | 483.3 | 516.6 | 67.7 | 516.6 | 16 | 211 | 8.7 |
| act-2 | 6861→9201 | 31 | 6.6 | 151.6 | 116.7 | 450 | 616.7 | 67.7 | 616.7 | 23 | 0 | 4.3 |
| act-3 | 26933→29093 | 21 | 5.1 | 196 | 100 | 516.7 | 816.7 | 61.9 | 816.7 | 15 | 0 | 0 |
| act-4 | 37028→39368 | 34 | 10 | 100 | 66.7 | 366.6 | 466.7 | 58.8 | 466.7 | 22 | 0 | 0 |

### native — longest animation frames (LoAF total 56387 ms, main-thread work 1387 ms, blocking 466 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 60.41 | principles | 1138 | 0 | 17 | 1 | 16 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r 8 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 52.54 | voices | 1055 | 0 | 7 | 2 | 5 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 5 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |
| 61.56 | principles | 934 | 0 | 17 | 0 | 17 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r 9 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 46.49 | beyond | 845 | 0 | 3 | 3 | 0 | (no script) |  |
| 59.16 | principles | 805 | 0 | 22 | 1 | 21 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r 8 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |

### native — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 0.86 | act-1 | 269 | 211 | 256 | 0 | 256 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r 256 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 27.27 | kill-list | 622 | 60 | 103 | 1 | 102 | user-callback:TimerHandler:setTimeout @ 41nayducv9yqc.js tf 102 ms | `(){tn=0;let t=window.scrollY,e=window.innerHeight;for(let i of[...to])i.idle(t,e)}function` |
| 48.86 | writing | 110 | 50 | 84 | 2 | 82 | classic-script:/_next/static/chunks/19vq58ko3wg2v.js @ 19vq58ko3wg2v.js 76 ms | `(globalThis.TURBOPACK\|\|(globalThis.TURBOPACK=[])).push(["object"==typeof document?document` |
| 36.14 | films | 185 | 29 | 78 | 1 | 77 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r 77 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 52.46 | voices | 81 | 28 | 75 | 0 | 75 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r 75 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |

### native — layout shifts (CLS total 0.0173, session 0.0112, 10 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 47.33 | 0.0112 | beyond | span.whitespace-nowrap in #beyond ; span.scene-caption__film.world-face-rdr2 in #beyond ; span[data-words=scrub][data-words-variant=default] in #beyond |
| 15.1 | 0.0035 | work | span.whitespace-nowrap in #work ; span.scene-caption__film.world-face-idiots in #work |
| 17.13 | 0.0009 | trading-algos | span.scene-caption__film.world-face-idiots in #trading-algos ; p.scene-caption.mb-tier-group[data-caption=cap.trading-algos][data-caption-world=idiots] in #trading-algos |
| 53.68 | 0.0006 | act-4 | span.whitespace-nowrap in #act-4 ; span.scene-caption__film.world-face-rdr2 in #act-4 |
| 49.48 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 50.29 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 38.53 | 0.0002 | films | span[data-words-i] in #films |
| 49.79 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |

### native — visual pops (52; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 1.62 | 100 | act-1 | 0 | 2 | 16.3 | change | 3.3 | 1 |
| 1.99 | 400 | act-1 | 0 | 2.6 | 17.4 | change | 4.7 | 1 |
| 2.73 | 800 | act-1 | 0 | 2.3 | 14.9 | change | 3.3 | 1 |
| 3.26 | 1500 | act-1 | 0 | 2.7 | 14.5 | change | 3.3 | 1 |
| 3.90 | 1700 | act-1 | 0 | 10.7 | 49.4 | change | 22.5 | 1 |
| 4.12 | 1700 | act-1 | 0 | 8.4 | 38.6 | change | 15.4 | 1 |
| 4.46 | 1700 | act-1 | 0 | 11.5 | 24.2 | change | 24.9 | 2 |
| 7.04 | 3100 | about | 0 | 10.3 | 11.9 | change | 19.8 | 1 |
| 8.55 | 4500 | journey | 0 | 3.9 | 6.9 | change | 4.7 | 1 |
| 9.17 | 4500 | journey | 0 | 4.5 | 5.4 | change | 4.7 | 1 |
| 9.62 | 5300 | journey | 0 | 4.1 | 6.9 | change | 8.6 | 1 |
| 12.41 | 7900 | act-2 | 0 | 29.7 | 20.5 | change | 39.8 | 1 |
| 12.57 | 7900 | act-2 | 0 | 18.6 | 12.9 | change | 32.1 | 2 |
| 12.89 | 7900 | act-2 | 0 | 11.6 | 8 | change | 20.6 | 1 |
| 15.30 | 9200 | work | 0 | 2.5 | 39.9 | change | 2.7 | 1 |
| 17.51 | 11300 | trading-algos | 0 | 4.5 | 32.1 | fill-in | 15.2 | 1 |
| 19.74 | 12600 | optuna-screener | 0 | 8.3 | 37.4 | fill-in | 11 | 1 |
| 20.14 | 13300 | optuna-screener | 0 | 8.3 | 22.2 | change | 15 | 1 |
| 20.86 | 14200 | optuna-screener | 0 | 11.1 | 55.6 | fill-in | 41.5 | 1 |
| 21.59 | 14700 | optuna-screener | 0 | 13.9 | 277 | change | 21.7 | 1 |
| 23.34 | 16700 | systems | 0 | 17.1 | 142.7 | fill-in | 26.8 | 1 |
| 23.74 | 17000 | systems | 0 | 2.8 | 3.4 | change | 2.8 | 1 |
| 28.95 | 21500 | films | 0 | 3.8 | 3.6 | fill-in | 4.7 | 1 |
| 33.35 | 23700 | films | 0 | 4.2 | 16.5 | change | 5.8 | 1 |
| 33.67 | 23700 | films | 0 | 7.9 | 31.1 | change | 8.9 | 1 |
| 34.02 | 23700 | films | 0 | 6.1 | 24.2 | change | 7.6 | 1 |
| 34.91 | 24200 | films | 0 | 2 | 9.5 | fill-in | 3.2 | 1 |
| 39.55 | 26200 | films | 0 | 2.1 | 4.2 | change | 4.5 | 1 |
| 43.02 | 27800 | act-3 | 0 | 7.4 | 18.2 | change | 14.7 | 1 |
| 43.29 | 27800 | beyond | 0 | 13.5 | 33 | change | 11.8 | 1 |
| 44.64 | 29000 | beyond | 0 | 5.1 | 17.6 | change | 5.7 | 1 |
| 45.22 | 29700 | beyond | 0 | 11.4 | 31.8 | change | 21.3 | 1 |
| 45.38 | 29700 | beyond | 0 | 4.1 | 5.9 | change | 6.9 | 1 |
| 45.81 | 30000 | beyond | 0 | 10.4 | 15.2 | fill-in | 13.1 | 1 |
| 47.37 | 31400 | beyond | 0 | 2.5 | 6.6 | fill-in | 4.7 | 1 |
| 48.67 | 32598 | writing | 0 | 12.1 | 1206.4 | change | 13.4 | 1 |
| 49.16 | 32698 | writing | 0 | 6.1 | 605.4 | change | 7.4 | 1 |
| 49.48 | 33198 | writing | 0 | 3.6 | 359.5 | change | 4.8 | 1 |
| 50.88 | 34098 | writing | 0 | 14.3 | 22.7 | blank-out | 8.3 | 1 |
| 52.77 | 35898 | voices | 0 | 9.1 | 4.5 | change | 21 | 1 |
| 55.28 | 37998 | act-4 | 0 | 14.7 | 1471.9 | change | 31.1 | 4 |
| 55.73 | 37998 | act-4 | 0 | 27.5 | 291.1 | change | 54.1 | 2 |
| 56.08 | 37998 | act-4 | 0 | 8.4 | 88.8 | change | 19.5 | 1 |
| 56.25 | 37998 | act-4 | 0 | 6.2 | 65.9 | change | 1.5 | 1 |
| 56.50 | 37998 | act-4 | 0 | 3.3 | 13.2 | change | 0.7 | 1 |
| 57.44 | 38398 | principles | 0 | 10.1 | 19.5 | change | 27.5 | 1 |
| 58.32 | 39498 | principles | 0 | 14.1 | 5.9 | change | 9.7 | 1 |
| 58.49 | 39698 | principles | 0 | 19 | 5.9 | change | 10.3 | 1 |
| 58.75 | 39698 | principles | 0 | 25.7 | 7.8 | fill-in | 13.6 | 1 |
| 60.18 | 39798 | principles | 0 | 18.4 | 35.6 | change | 11.7 | 1 |
| 61.49 | 40498 | principles | 0 | 65 | 69.4 | change | 37 | 1 |
| 63.17 | 42098 | contact | 0 | 4.4 | 14.2 | fill-in | 3.2 | 1 |

## alt — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 12 | 6.7 | 150 | 16.7 | 1133.3 | 1133.3 | 41.7 | 41.7 | 1133.3 | 5 | 0 | 0 | 0 | 775 | 13.3 | #document ×7; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×6 |  | 3 will-change, 1.2 MP of images |
| act-1 | 39 | 7.1 | 141.4 | 100 | 366.7 | 766.6 | 84.6 | 76.9 | 766.6 | 31 | 59 | 3 | 0 | 599.5 | 19.6 | #document ×21; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×18 | user-callback:TimerHandler:setTimeout @ 1_2f9ddauvl4s.js (103 ms) | 3 mask, 18 will-change, 14 infinite anims, 2.4 MP of images |
| about | 5 | 3.7 | 273.3 | 150 | 633.3 | 633.3 | 100 | 100 | 633.3 | 5 | 0 | 0 | 0 | 764.7 | 18.3 | #document ×5; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×5 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (23 ms) | 1 mask |
| journey | 27 | 9.7 | 103.1 | 83.4 | 233.4 | 316.7 | 70.4 | 70.4 | 316.7 | 18 | 0 | 0 | 0 | 824.6 | 47.1 | #document ×27; node 80 ×24 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (75 ms) | 1 mask, 2 will-change, 0.8 MP of images |
| act-2 | 83 | 19 | 52.6 | 33.3 | 183.3 | 266.7 | 39.8 | 25.3 | 266.7 | 23 | 0 | 0 | 0 | 410.2 | 35.3 | #document ×23; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×21 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (13 ms) | 1 filter, 3 mask, 17 will-change, 12 infinite anims, 3.6 MP of images |
| work | 40 | 15.7 | 63.7 | 33.2 | 283.3 | 350 | 30 | 27.5 | 350 | 10 | 0 | 0 | 0 | 753 | 31.4 | #document ×10; node 80 ×10 |  | 4 filter, 1 blend, 1 mask, 1 will-change, 1.6 MP of images |
| trading-algos | 19 | 8.3 | 121.1 | 83.5 | 433.3 | 433.3 | 84.2 | 78.9 | 433.3 | 15 | 0 | 0 | 0.0009 | 877 | 38.7 | #document ×15; node 80 ×10 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (7 ms) | 2 filter, 0.2 MP of images |
| optuna-screener | 24 | 7.8 | 128.5 | 116.7 | 266.7 | 316.7 | 87.5 | 83.3 | 316.7 | 20 | 0 | 0 | 0 | 705.1 | 36.7 | #document ×24; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×24 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (16 ms) | 3 filter, 1 mask, 1 will-change, 2.1 MP of images |
| experiment | 16 | 18.8 | 53.1 | 50 | 150.1 | 150.1 | 50 | 43.8 | 150.1 | 7 | 0 | 0 | 0 | 816.5 | 89.4 | #document ×16; div.stage-window in #optuna-screener ×16 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (6 ms) |  |
| systems | 24 | 8.7 | 114.6 | 83.4 | 250 | 266.7 | 83.3 | 62.5 | 266.7 | 16 | 0 | 0 | 0.0001 | 853.9 | 22.9 | #document ×19; div.relative.@container.overflow-clip in #header ×13 |  | 1 MP of images |
| kill-list | 17 | 8.2 | 122.5 | 150 | 250 | 250 | 82.4 | 76.5 | 250 | 12 | 30 | 14.3 | 0.0005 | 847.2 | 26.4 | #document ×14; div.relative.@container.overflow-clip in #header ×8 |  | 2 will-change, 0.3 MP of images |
| films | 275 | 16.9 | 59.3 | 16.7 | 250 | 366.7 | 36.7 | 30.5 | 500 | 88 | 169 | 5 | 0 | 563.8 | 29.1 | #document ×145; div.act-card-stage.relative.flex in #act-3 ×67 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (172 ms) | 2 mask, 6 will-change, 5.7 MP of images |
| act-3 | 114 | 28.4 | 35.2 | 16.7 | 150 | 250.1 | 14.9 | 14.9 | 316.6 | 15 | 0 | 0 | 0 | 430.7 | 30.1 | #document ×31; div.plate-cam.rdr2-module__R8wI0W__boardCam in #beyond ×14 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (5 ms) | 1 filter, 2 mask, 9 will-change, 2 MP of images |
| beyond | 44 | 9.4 | 106.8 | 66.8 | 249.9 | 833.2 | 79.5 | 61.4 | 833.2 | 28 | 0 | 0 | 0.004 | 766.8 | 42.1 | #document ×41; div.act-card-stage.relative.flex in #act-3 ×37 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (5 ms) | 7 mask, 1 will-change, 5.3 MP of images |
| writing | 46 | 15.6 | 64.1 | 33.4 | 150 | 399.9 | 45.7 | 41.3 | 399.9 | 17 | 0 | 0 | 0.0007 | 615 | 69.8 | #document ×46; div.act-card-stage.relative.flex in #act-4 ×46 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (12 ms) | 5 mask, 3 will-change |
| voices | 21 | 12 | 83.3 | 66.6 | 166.7 | 183.3 | 85.7 | 61.9 | 183.3 | 14 | 6 | 11.1 | 0 | 596.6 | 38.3 | #document ×21; div.act-card-stage.relative.flex in #act-4 ×21 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (49 ms) | 9 will-change, 9 infinite anims, 3.5 MP of images |
| act-4 | 119 | 26.2 | 38.2 | 16.7 | 116.6 | 216.6 | 21.8 | 18.5 | 783.2 | 24 | 0 | 0 | 0.0006 | 425.5 | 25.3 | #document ×25; div.act-card-stage.relative.flex in #act-4 ×12 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (8 ms) | 1 canvas, 1 blend, 2 mask, 27 will-change, 21 infinite anims, 2.3 MP of images |
| principles | 21 | 6.4 | 156.3 | 150 | 366.7 | 583.3 | 76.2 | 71.4 | 583.3 | 15 | 0 | 0 | 0 | 968.9 | 11.9 | #document ×17; div.act-card-stage.relative.flex in #act-4 ×17 | user-callback:TimerHandler:setTimeout @ 29bl5kt6u0_n3.js (6 ms) | 3 mask |
| contact | 4 | 2.9 | 341.7 | 433.3 | 433.3 | 433.3 | 100 | 100 | 433.3 | 4 | 0 | 0 | 0 | 993 | 16.8 | #document ×3; div.act-card-stage.relative.flex in #act-4 ×3 | user-callback:IntersectionObserverCallback @ 2hx1u5zg-b95a.js (6 ms) | 4 mask, 0.9 MP of images |
| credits | 83 | 19.8 | 50.6 | 33.3 | 116.6 | 466.6 | 43.4 | 27.7 | 466.6 | 31 | 0 | 0 | 0 | 519.5 | 12.1 | #document ×27; div.stage-cam ×16 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (6 ms) |  |

### alt — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 450→3209 | 41 | 6.8 | 147.1 | 100 | 366.6 | 766.6 | 78 | 766.6 | 34 | 59 | 2.9 |
| act-2 | 6786→9126 | 91 | 19.4 | 51.6 | 33.3 | 183.3 | 266.7 | 26.4 | 266.7 | 26 | 0 | 0 |
| act-3 | 26903→29063 | 117 | 22.5 | 44.4 | 16.7 | 249.9 | 316.6 | 17.1 | 833.2 | 19 | 0 | 0 |
| act-4 | 37076→39416 | 124 | 25.9 | 38.6 | 16.7 | 116.6 | 216.6 | 19.4 | 783.2 | 27 | 0 | 0 |

### alt — longest animation frames (LoAF total 57114 ms, main-thread work 1200 ms, blocking 264 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 0.12 | top | 1183 | 0 | 1 | 1 | 0 | (no script) |  |
| 50.12 | beyond | 832 | 0 | 1 | 1 | 0 | (no script) |  |
| 62.64 | act-4 | 782 | 0 | 1 | 1 | 0 | (no script) |  |
| 3.6 | act-1 | 755 | 0 | 2 | 2 | 0 | (no script) |  |
| 7.84 | about | 633 | 0 | 1 | 1 | 0 | (no script) |  |

### alt — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 39.51 | films | 142 | 91 | 137 | 0 | 137 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r 137 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 4.65 | act-1 | 172 | 59 | 104 | 1 | 103 | user-callback:TimerHandler:setTimeout @ 1_2f9ddauvl4s.js 103 ms | `()=>{K=0,U&&eP(U)},180)));_&&_.parentElement!==e.el&&(e.el.appendChild(_),eM(e),V?.disconn` |
| 30.71 | films | 118 | 51 | 98 | 2 | 96 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v 96 ms | `()=>{let i=e.MotionGlobalConfig.useManualTiming,o=i?a.timestamp:performance.now();n=!1,i\|\|` |
| 29.53 | films | 241 | 27 | 72 | 2 | 70 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v 70 ms | `()=>{let i=e.MotionGlobalConfig.useManualTiming,o=i?a.timestamp:performance.now();n=!1,i\|\|` |
| 7.13 | act-1 | 208 | 0 | 52 | 1 | 51 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 23 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |

### alt — layout shifts (CLS total 0.0068, session 0.004, 11 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 52.85 | 0.0032 | beyond | span[data-w] in #beyond ; span[data-w] in #beyond ; span[data-words=scrub][data-words-variant=default] in #beyond |
| 19.29 | 0.0009 | trading-algos | span.scene-caption__film.world-face-idiots in #trading-algos ; p.scene-caption.mb-tier-group[data-caption=cap.trading-algos][data-caption-world=idiots] in #trading-algos |
| 53.2 | 0.0008 | beyond | span.whitespace-nowrap in #beyond ; span.scene-caption__sep in #beyond ; span.scene-caption__film.world-face-rdr2 in #beyond |
| 59.51 | 0.0006 | act-4 | span.whitespace-nowrap in #act-4 ; span.scene-caption__film.world-face-rdr2 in #act-4 |
| 28.35 | 0.0005 | kill-list | span.scene-caption__film.world-face-idiots in #kill-list ; p.scene-caption[data-caption=cap.kill-list][data-caption-world=idiots] in #kill-list |
| 56.3 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 55.36 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 56.01 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |

### alt — visual pops (5; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 4.77 | 1796 | act-1 | 16 | 8.7 | 5.4 | change | 15.7 | 1 |
| 16.88 | 8775 | work | 35 | 19.1 | 1056.6 | change | 28.8 | 1 |
| 36.21 | 23697 | films | 8 | 21.2 | 6.2 | change | 24.2 | 1 |
| 37.46 | 23719 | films | 19 | 12.1 | 3.5 | change | 21.2 | 1 |
| 37.80 | 23774 | films | 29 | 14.2 | 4.2 | change | 28.1 | 1 |

## rm — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 28 | 60 | 16.7 | 16.7 | 16.7 | 16.7 | 0 | 0 | 16.7 | 0 | 0 |  | 0 | 4.3 | 8.6 | #document ×3; img.object-cover in #journey ×1 |  | 1.2 MP of images |
| act-1 | 184 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 2 | 2.9 | #document ×7; img.object-cover in #work ×1 |  | 2 mask, 1.2 MP of images |
| about | 70 | 58.3 | 17.1 | 16.7 | 16.8 | 33.4 | 0 | 0 | 33.4 | 1 | 0 |  | 0 | 25 | 5.8 | #document ×5; svg.pointer-events-none.absolute.inset-0 viewBox=0 0 600 190 in #work ×2 | user-callback:FrameRequestCallback (37 ms) | 1 mask |
| journey | 79 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 32.7 | 1.5 | #document ×2 |  | 1 mask, 0.4 MP of images |
| act-2 | 137 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 3.1 | 0.9 | #document ×2 |  | 1 filter, 2 mask, 1.2 MP of images |
| work | 145 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 16.6 | 1.7 | #document ×4 |  | 4 filter, 1 blend, 1 mask, 1 will-change, 1.6 MP of images |
| trading-algos | 112 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 2.1 | 1.6 | #document ×3 |  | 2 filter |
| optuna-screener | 178 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 1.7 | 1.7 | #document ×5 |  | 2 filter, 1 MP of images |
| experiment | 73 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 3.3 | 4.1 | #document ×3; div.absolute.inset-x-0.top-0 in #kill-list ×1 |  |  |
| systems | 152 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 10.7 | 1.6 | #document ×4 |  | 1 MP of images |
| kill-list | 139 | 57.5 | 17.4 | 16.7 | 16.8 | 33.4 | 0.7 | 0.7 | 100 | 2 | 0 | 0 | 0 | 10.8 | 8.3 | #document ×14; div.absolute.inset-x-0.top-0 in #kill-list ×6 |  | 1 will-change, 0.3 MP of images |
| films | 686 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 4.6 | 1 | #document ×11 |  | 3.9 MP of images |
| act-3 | 137 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 1.8 | 0.9 | #document ×2 |  | 2 mask, 1 MP of images |
| beyond | 262 | 59.5 | 16.8 | 16.7 | 16.7 | 16.8 | 0.4 | 0 | 50 | 1 | 0 | 0 | 0 | 10.7 | 3.2 | #document ×7; div.rdr2-module__R8wI0W__campSticky in #voices ×2 |  | 6 mask, 2.8 MP of images |
| writing | 171 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 1.8 | 8.1 | #document ×8; div.absolute.inset-0.-z-10 in #principles ×5 |  | 5 mask, 3 will-change |
| voices | 99 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 1.8 | 4.8 | #document ×3; div.rdr2-module__R8wI0W__campSticky in #voices ×3 |  | 2.3 MP of images |
| act-4 | 137 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 2.6 | 2.6 | #document ×3; div.rdr2-module__R8wI0W__campSticky in #voices ×2 |  | 2 mask, 1.2 MP of images |
| principles | 172 | 58 | 17.2 | 16.7 | 16.7 | 33.3 | 0.6 | 0.6 | 83.3 | 1 | 0 | 0 | 0 | 82.2 | 4.4 | #document ×11; div.rdr2-module__R8wI0W__campSticky in #voices ×2 |  | 2 will-change |
| contact | 60 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 1 | 0 |  |  | 4 mask, 0.9 MP of images |
| credits | 186 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 0.6 | 1 | #document ×3 |  |  |

### rm — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 450→2481 | 210 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 16.8 | 0 | 0 |  |
| act-2 | 4325→5705 | 170 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 16.8 | 0 | 0 |  |
| act-3 | 23144→24523 | 168 | 59.3 | 16.9 | 16.7 | 16.8 | 16.8 | 0 | 50 | 1 | 0 | 0 |
| act-4 | 32115→33465 | 163 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 16.8 | 0 | 0 |  |

### rm — longest animation frames (LoAF total 356 ms, main-thread work 43 ms, blocking 0 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 20.42 | kill-list | 106 | 0 | 1 | 1 | 0 | (no script) |  |
| 49.13 | principles | 73 | 0 | 0 | 0 | 0 | (no script) |  |
| 35.78 | beyond | 68 | 0 | 0 | 0 | 0 | (no script) |  |
| 4.15 | about | 58 | 0 | 42 | 5 | 37 | user-callback:FrameRequestCallback 37 ms |  |
| 20.35 | kill-list | 51 | 0 | 0 | 0 | 0 | (no script) |  |

### rm — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 4.15 | about | 58 | 0 | 42 | 5 | 37 | user-callback:FrameRequestCallback 37 ms |  |
| 20.42 | kill-list | 106 | 0 | 1 | 1 | 0 | (no script) |  |
| 20.35 | kill-list | 51 | 0 | 0 | 0 | 0 | (no script) |  |
| 35.78 | beyond | 68 | 0 | 0 | 0 | 0 | (no script) |  |
| 49.13 | principles | 73 | 0 | 0 | 0 | 0 | (no script) |  |

### rm — layout shifts (CLS total 0, session 0, 0 shifts)


### rm — visual pops (0; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)


## gl — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 16 | 19.2 | 52.1 | 16.7 | 133.4 | 133.4 | 43.8 | 43.8 | 133.4 | 7 | 0 | 0 | 0 | 146.4 | 48 | #document ×8; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×8 |  | 3 will-change, 1.2 MP of images |
| act-1 | 46 | 8.1 | 123.5 | 83.3 | 283.3 | 516.7 | 84.8 | 65.2 | 516.7 | 36 | 22 | 5.1 | 0 | 515.2 | 20.8 | #document ×22; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×20 | user-callback:TimerHandler:setTimeout @ 1_2f9ddauvl4s.js (65 ms) | 4 mask, 18 will-change, 14 infinite anims, 2.3 MP of images |
| about | 9 | 10.2 | 98.1 | 50 | 416.6 | 416.6 | 55.6 | 44.4 | 416.6 | 4 | 0 | 0 | 0 | 560.4 | 46.4 | #document ×7; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×7 | event-listener:DOMWindow.onscroll @ 29bl5kt6u0_n3.js A (5 ms) | 1 mask |
| journey | 28 | 8.8 | 113.1 | 133.3 | 266.6 | 283.3 | 82.1 | 78.6 | 283.3 | 21 | 0 | 0 | 0 | 749.4 | 54.6 | #document ×28; div.act-card-stage.relative.flex in #act-2 ×28 | resolve-promise:Promise.resolve @ 2eq9kz53ofs73.js (5 ms) | 1 mask, 2 will-change, 0.8 MP of images |
| act-2 | 61 | 13.4 | 74.6 | 50 | 216.6 | 316.6 | 55.7 | 44.3 | 316.6 | 28 | 46 | 8.8 | 0 | 639.8 | 54.3 | #document ×31; div.relative.@container in #work ×30 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (158 ms) | 2 filter, 3 mask, 20 will-change, 12 infinite anims, 4.7 MP of images |
| work | 52 | 23.3 | 42.9 | 33.4 | 83.3 | 200.1 | 44.2 | 19.2 | 200.1 | 13 | 0 | 0 | 0 | 354.6 | 54.2 | #document ×16; div.act-card-stage.relative.flex in #act-2 ×16 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (5 ms) | 3 filter, 1 blend, 1 mask, 1 will-change, 3.2 MP of images |
| trading-algos | 24 | 9.7 | 103.5 | 66.7 | 266.7 | 383.3 | 79.2 | 54.2 | 383.3 | 15 | 0 | 0 | 0.0009 | 702.7 | 49.9 | #document ×20; div.act-card-stage.relative.flex in #act-2 ×14 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (8 ms) | 2 filter, 0.2 MP of images |
| optuna-screener | 24 | 8.1 | 123.6 | 116.7 | 233.4 | 300 | 87.5 | 87.5 | 300 | 21 | 0 | 0 | 0 | 700.5 | 51.6 | #document ×24; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×24 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (17 ms) | 2 filter, 2.1 MP of images |
| experiment | 14 | 13.8 | 72.6 | 66.7 | 200 | 200 | 71.4 | 57.1 | 200 | 9 | 0 | 0 | 0 | 711.2 | 61 | #document ×14; div.stage-window in #optuna-screener ×14 |  |  |
| systems | 23 | 8.1 | 123.2 | 116.7 | 266.7 | 283.4 | 78.3 | 73.9 | 283.4 | 16 | 0 | 0 | 0 | 838.2 | 26.5 | #document ×21; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×15 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (7 ms) | 1 will-change, 1 MP of images |
| kill-list | 13 | 6 | 165.4 | 150 | 349.9 | 349.9 | 92.3 | 84.6 | 349.9 | 11 | 0 | 0 | 0.0007 | 855.9 | 28.8 | #document ×12; svg.absolute.inset-0.size-full viewBox=0 0 400 500[data-motif=journal-ground] in #writing ×12 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (5 ms) | 3 will-change, 0.6 MP of images |
| films | 400 | 26.4 | 37.9 | 16.7 | 116.7 | 216.7 | 25.8 | 18 | 283.3 | 77 | 106 | 4.9 | 0 | 445.1 | 51.2 | #document ×202; div.act-card-stage.relative.flex in #act-3 ×109 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (175 ms) | 4 will-change, 6.8 MP of images |
| act-3 | 124 | 29.4 | 34 | 16.7 | 166.6 | 200 | 16.1 | 14.5 | 233.3 | 18 | 0 | 0 | 0 | 465.5 | 31.3 | #document ×37; div.act-card-stage.relative.flex in #act-3 ×19 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (6 ms) | 1 filter, 3 mask, 6 will-change, 2 MP of images |
| beyond | 62 | 12.8 | 78 | 66.6 | 183.3 | 316.7 | 72.6 | 54.8 | 316.7 | 35 | 0 | 0 | 0.0112 | 678.3 | 51.7 | #document ×57; div.act-card-stage.relative.flex in #act-3 ×42 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (11 ms) | 7 mask, 1 will-change, 5.7 MP of images |
| writing | 43 | 15.1 | 66.3 | 50 | 183.3 | 200 | 60.5 | 44.2 | 200 | 19 | 11 | 7.7 | 0.0007 | 801.1 | 118.2 | #document ×43; div.rdr2-module__R8wI0W__campSticky in #voices ×43 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (20 ms) | 6 mask, 4 will-change |
| voices | 16 | 9.4 | 106.2 | 83.4 | 316.7 | 316.7 | 87.5 | 81.3 | 316.7 | 13 | 135 | 21.4 | 0 | 675.9 | 88.8 | #document ×15; div.relative in #principles ×15 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (246 ms) | 1 mask, 12 will-change, 9 infinite anims, 3.5 MP of images |
| act-4 | 92 | 20.9 | 47.8 | 16.7 | 216.6 | 333.4 | 26.1 | 22.8 | 333.4 | 23 | 874 | 12.5 | 0.0006 | 562.5 | 29.3 | #document ×30; div.rdr2-module__R8wI0W__campSticky in #voices ×26 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (14 ms) | 2 canvas, 3 mask, 26 will-change, 21 infinite anims, 2.3 MP of images |
| principles | 22 | 4.8 | 209.1 | 200 | 600 | 783.3 | 68.2 | 68.2 | 783.3 | 12 | 0 | 6.7 | 0 | 712.8 | 29.3 | #document ×23; div.act-card-stage.relative.flex in #act-4 ×23 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (7 ms) | 7 will-change |
| contact | 5 | 2.8 | 363.3 | 300 | 600 | 600 | 100 | 100 | 600 | 5 | 0 | 0 | 0 | 962.8 | 16.5 | #document ×5; div.act-card-stage.relative.flex in #act-4 ×5 | user-callback:IntersectionObserverCallback @ 2hx1u5zg-b95a.js (7 ms) | 4 mask, 1.9 MP of images |
| credits | 89 | 24.2 | 41.4 | 33.4 | 66.7 | 366.6 | 42.7 | 14.6 | 366.6 | 11 | 0 | 0 | 0 | 523.5 | 17.9 | #document ×34; div.stage-cam ×16 |  | 1 will-change |

### gl — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 450→3283 | 49 | 7.8 | 128.2 | 83.3 | 366.6 | 516.7 | 65.3 | 516.7 | 39 | 22 | 4.9 |
| act-2 | 6861→9201 | 71 | 14.4 | 69.2 | 50 | 216.6 | 316.6 | 42.3 | 316.6 | 31 | 46 | 8.1 |
| act-3 | 26933→29093 | 133 | 28 | 35.7 | 16.7 | 166.7 | 200 | 15.8 | 233.3 | 21 | 0 | 0 |
| act-4 | 37028→39368 | 103 | 17.4 | 57.4 | 16.7 | 216.7 | 333.4 | 24.3 | 783.3 | 26 | 874 | 14.3 |

### gl — longest animation frames (LoAF total 51700 ms, main-thread work 1426 ms, blocking 1194 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 61.81 | act-4 | 934 | 865 | 16 | 2 | 14 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 7 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |
| 67.5 | contact | 594 | 0 | 1 | 1 | 0 | (no script) |  |
| 65.99 | principles | 585 | 0 | 1 | 1 | 0 | (no script) |  |
| 2.02 | act-1 | 530 | 0 | 1 | 1 | 0 | (no script) |  |
| 66.82 | contact | 519 | 0 | 1 | 1 | 0 | (no script) |  |

### gl — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 56.69 | voices | 138 | 87 | 134 | 1 | 133 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r 133 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 29.88 | films | 140 | 51 | 97 | 2 | 95 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v 95 ms | `()=>{let i=e.MotionGlobalConfig.useManualTiming,o=i?a.timestamp:performance.now();n=!1,i\|\|` |
| 56.04 | voices | 99 | 48 | 94 | 1 | 93 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r 93 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 13.32 | act-2 | 90 | 36 | 85 | 0 | 85 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r 85 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 38.07 | films | 78 | 28 | 75 | 1 | 74 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r 69 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |

### gl — layout shifts (CLS total 0.0141, session 0.0112, 9 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 51.49 | 0.0112 | beyond | span.whitespace-nowrap in #beyond ; span.scene-caption__film.world-face-rdr2 in #beyond ; span[data-words=scrub][data-words-variant=default] in #beyond |
| 18.52 | 0.0009 | trading-algos | span.scene-caption__film.world-face-idiots in #trading-algos ; p.scene-caption.mb-tier-group[data-caption=cap.trading-algos][data-caption-world=idiots] in #trading-algos |
| 27.7 | 0.0007 | kill-list | span.scene-caption__film.world-face-idiots in #kill-list ; p.scene-caption[data-caption=cap.kill-list][data-caption-world=idiots] in #kill-list |
| 58 | 0.0006 | act-4 | span.whitespace-nowrap in #act-4 ; span.scene-caption__film.world-face-rdr2 in #act-4 |
| 55.66 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 53.89 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 54.3 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 55.49 | 0.0001 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |

### gl — visual pops (7; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 7.67 | 3147 | journey | 26 | 11.3 | 241.9 | change | 21.1 | 1 |
| 13.50 | 8098 | act-2 | 2 | 23.9 | 4 | change | 45.4 | 1 |
| 36.77 | 24002 | films | 32 | 11.9 | 8.9 | change | 25.5 | 2 |
| 37.26 | 24175 | films | 39 | 12.5 | 9.4 | change | 22.2 | 1 |
| 63.27 | 39034 | principles | 35 | 16.4 | 1644 | change | 10.7 | 3 |
| 63.44 | 39100 | principles | 21 | 13.7 | 1373.4 | change | 10.4 | 2 |
| 65.15 | 39609 | principles | 34 | 6.6 | 15.6 | change | 13.8 | 1 |

## Strips

- strips/intro.png
- strips/intro-landing.png
- strips/pop-intro-55.png
- strips/pop-intro-42.png
- strips/pop-intro-90.png
- strips/desktop-act-1.png
- strips/desktop-act-2.png
- strips/desktop-act-3.png
- strips/desktop-act-4.png
- strips/desktop-first-60s.png
- strips/pop-desktop-116.png
- strips/pop-desktop-27.png
- strips/pop-desktop-112.png
- strips/native-act-1.png
- strips/native-act-2.png
- strips/native-act-3.png
- strips/native-act-4.png
- strips/native-first-60s.png
- strips/pop-native-615.png
- strips/pop-native-115.png
- strips/pop-native-575.png
- strips/pop-native-597.png
- strips/alt-act-1.png
- strips/alt-act-2.png
- strips/alt-act-3.png
- strips/alt-act-4.png
- strips/alt-first-60s.png
- strips/pop-alt-309.png
- strips/pop-alt-138.png
- strips/pop-alt-325.png
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
- strips/pop-gl-118.png
- strips/pop-gl-635.png
- strips/pop-gl-637.png
