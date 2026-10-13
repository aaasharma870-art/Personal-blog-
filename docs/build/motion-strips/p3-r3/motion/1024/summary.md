# Motion baseline — 2026-10-12T23:23:07.135Z

Base http://localhost:3161 · Chromium 141.0.7390.37 headless · 4 CPUs · screencast everyNthFrame=1.

> Headless Chromium rasterises in software (SwiftShader) on a few CPUs and pays for the screencast readback, so absolute frame times are pessimistic vs a real laptop/phone GPU. Read them as RELATIVE hotspots: which sections and transitions are worst. "busy∩jank %" = share of >33.4 ms frames that overlap a long animation frame in which the main thread really worked (script + style/layout/paint >= half the frame, or a >50 ms task); low = the frame was raster/composite-bound (the LoAF is the main thread waiting on the compositor), high = main-thread script/style/layout. "paint suspects" = what the section holds that is costly to raster (filters, blend, masks, canvas, video, image megapixels, infinite animations).

## Runs

| run | viewport | lenis | secs | rAF frames | fps | mean ms | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | LoAF block ms | busy∩jank % | CLS total | CLS (session) | pops | shots |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| intro | 1024x768 |  | 11.5 | 325 | 28.1 | 35.6 | 16.7 | 83.3 | 166.7 | 28.9 | 16 | 466.7 | 79 | 1067 | 2.1 | 0 | 0 | 7 | 162 |
| desktop | 1024x768 | on | 67.2 | 1312 | 19.5 | 51.4 | 16.7 | 166.7 | 299.9 | 34.8 | 28.4 | 683.3 | 372 | 176 | 3.5 | 0.0124 | 0.0108 | 10 | 770 |
| native | 1024x768 | off | 61.5 | 852 | 13.9 | 72.2 | 16.8 | 283.3 | 516.7 | 37.3 | 31.2 | 1249.9 | 268 | 897 | 4.4 | 0.0153 | 0.0103 | 39 | 846 |
| alt | 1024x768 | on | 67.1 | 1373 | 19.8 | 50.4 | 16.7 | 166.7 | 316.6 | 34.6 | 26.3 | 2166.6 | 370 | 149 | 1.5 | 0.0118 | 0.0102 | 7 | 769 |
| rm | 1024x768 | off | 51.9 | 3047 | 58.8 | 17 | 16.7 | 16.8 | 16.8 | 0.3 | 0.2 | 349.9 | 9 | 68 | 22.2 | 0 | 0 | 0 | 443 |
| gl | 1024x768 | on | 66.9 | 1452 | 21.7 | 46.1 | 16.7 | 150 | 283.3 | 32.4 | 24.9 | 650 | 370 | 699 | 2.5 | 0.0124 | 0.0108 | 14 | 837 |

## Top 10 hotspots (by mean frame time; rm excluded)

| # | run | where | frames | fps | mean | p95 | p99 | >50 % | max | mean / run mean | LoAF block ms | likely cause |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | native | journey | 10 | 3.3 | 305 | 916.7 | 916.7 | 70 | 916.7 | 4.2 | 26 | main thread, script-bound (6.4% script; top: resolve-promise:Promise.resolve @ 3lv1a4umh4a4v.js 61 ms) [while scrolling: raster 555.8 ms/s, 31.1 paints/s — repainting: #document ×10; div.act-card-stage.relative.flex in #act-2 ×7 \| idle 0.6 fps, raster 22.9 ms/s, 5.3 paints/s] |
| 2 | alt | top | 12 | 3.5 | 287.5 | 2166.6 | 2166.6 | 58.3 | 2166.6 | 5.7 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 98.2% waiting for the compositor — on screen: 3 will-change, 0.6 MP of images [while scrolling: raster 231.3 ms/s, 13 paints/s — repainting: #document ×10; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×6 \| idle 34 fps, raster 0 ms/s, 0 paints/s] |
| 3 | native | act-2 | 11 | 3.8 | 260.6 | 1016.7 | 1016.7 | 90.9 | 1016.7 | 3.6 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 98% waiting for the compositor — on screen: 2 filter, 3 mask, 8 will-change, 2.4 MP of images [while scrolling: raster 634.6 ms/s, 29 paints/s — repainting: #document ×10; div.absolute.inset-x-0.top-0 in #act-2 ×8 \| idle 60.4 fps, raster 0 ms/s, 0 paints/s] |
| 4 | native | principles | 17 | 4.3 | 231.4 | 1249.9 | 1249.9 | 64.7 | 1249.9 | 3.2 | 0 | raster/composite-bound: only 9.1% of janky frames overlap real main-thread work; the LoAFs are 96.9% waiting for the compositor — on screen: 11 will-change [while scrolling: raster 852 ms/s, 21.4 paints/s — repainting: #document ×17; div.act-card-stage.relative.flex in #act-4 ×9 \| idle 60.2 fps, raster 0 ms/s, 0 paints/s] |
| 5 | desktop | principles | 13 | 4.4 | 229.5 | 483.4 | 483.4 | 92.3 | 483.4 | 4.5 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 98.6% waiting for the compositor — on screen: 11 will-change [while scrolling: raster 979.2 ms/s, 14.1 paints/s — repainting: #document ×13; div.act-card-stage.relative.flex in #act-4 ×13 \| idle 60.2 fps, raster 0 ms/s, 0 paints/s] |
| 6 | gl | principles | 14 | 5.6 | 177.4 | 400 | 400 | 71.4 | 400 | 3.8 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 98.5% waiting for the compositor — on screen: 11 will-change [while scrolling: raster 1073.2 ms/s, 23.4 paints/s — repainting: #document ×15; div.act-card-stage.relative.flex in #act-4 ×15 \| idle 60.2 fps, raster 0 ms/s, 0 paints/s] |
| 7 | native | voices | 11 | 5.6 | 177.3 | 366.6 | 366.6 | 81.8 | 366.6 | 2.5 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.3% waiting for the compositor — on screen: 1 mask, 3 will-change, 9 infinite anims, 1.8 MP of images [while scrolling: raster 386.7 ms/s, 42.1 paints/s — repainting: #document ×11; div.act-card-stage.relative.flex in #act-4 ×8 \| idle 60.2 fps, raster 0 ms/s, 0 paints/s] |
| 8 | native | act-1 transition | 28 | 5.8 | 172.6 | 499.9 | 700 | 82.1 | 700 | 2.4 | 676 | raster/composite-bound: only 12.5% of janky frames overlap real main-thread work; the LoAFs are 85.8% waiting for the compositor — on screen: 4 mask, 1.8 MP of images [while scrolling: raster 518.1 ms/s, 22.8 paints/s — repainting: #document ×19; div.act-card-stage.relative.flex in #act-1 ×11 \| idle 60 fps, raster 0 ms/s, 0 paints/s] |
| 9 | native | about | 11 | 5.9 | 168.2 | 416.7 | 416.7 | 63.6 | 416.7 | 2.3 | 11 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 92.8% waiting for the compositor — on screen: 1 mask [while scrolling: raster 743.3 ms/s, 35.7 paints/s — repainting: #document ×11; div.act-card-stage.relative.flex in #act-1 ×6 \| idle 60.3 fps, raster 0 ms/s, 0 paints/s] |
| 10 | desktop | top | 10 | 6.5 | 155 | 666.7 | 666.7 | 60 | 666.7 | 3 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.6% waiting for the compositor — on screen: 3 will-change, 0.6 MP of images [while scrolling: raster 592.9 ms/s, 16.8 paints/s — repainting: #document ×10; div.absolute.inset-0.will-change-transform in #top ×5 \| idle 34 fps, raster 0 ms/s, 0 paints/s] |

## Idle probe (desktop: parked 2.5 s on each section, then 1.5 s traced standing still; high raster with few paints = a raster-heavy layer, many paints/s = continuous animation)

| section | idle fps | raster ms/s | paints/s | paint ms/s | style+layout ms/s | rAF JS ms/s | top repainting nodes |
|---|---|---|---|---|---|---|---|
| top | 34 | 0 | 0 | 0 | 6.1 | 16.2 |  |
| act-1 | 60 | 0 | 0 | 0 | 0 | 20.7 |  |
| about | 60.3 | 0 | 0 | 0 | 14.5 | 31.6 |  |
| journey | 0.6 | 22.9 | 5.3 | 0.9 | 3.4 | 4 | #document ×1; div.relative.mx-auto.w-full ×1; div.absolute.inset-0.will-change-transform ×1 |
| act-2 | 60.4 | 0 | 0 | 0 | 0 | 17.9 |  |
| work | 60.3 | 0 | 0 | 0 | 0 | 18.6 |  |
| trading-algos | 60.2 | 0 | 0 | 0 | 12.2 | 29.2 |  |
| optuna-screener | 60.5 | 0 | 0 | 0 | 11.9 | 29.9 |  |
| experiment | 59.5 | 0 | 0 | 0 | 0 | 17.5 |  |
| systems | 59.6 | 0 | 0 | 0 | 0 | 17.7 |  |
| kill-list | 60.5 | 0 | 0 | 0 | 0 | 15.5 |  |
| films | 60.6 | 0 | 0 | 0 | 0 | 17 |  |
| act-3 | 60 | 0 | 0 | 0 | 13.5 | 33.3 |  |
| beyond | 60.3 | 0 | 0 | 0 | 0 | 18.4 |  |
| writing | 60.6 | 0 | 0 | 0 | 0 | 16.8 |  |
| voices | 60.2 | 0 | 0 | 0 | 12.4 | 31.8 |  |
| act-4 | 60.4 | 0 | 0 | 0 | 0 | 16.8 |  |
| principles | 60.2 | 0 | 0 | 0 | 0 | 15.8 |  |
| contact | 60.3 | 0 | 0 | 0 | 0 | 16.8 |  |
| credits | 60.2 | 0 | 0 | 0 | 14 | 33.4 |  |

## intro — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| intro:play-screen | 39 | 15 | 66.7 | 33.3 | 233.3 | 733.3 | 38.5 | 28.2 | 733.3 | 11 | 1001 | 40 | 0 | 379.6 | 41.9 | #document ×31; div#act-1-program.relative.px-gutter.pt-tier-group in #act-1 ×10 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (793 ms) |  |
| intro:flight | 130 | 23.2 | 43.1 | 33.4 | 83.4 | 150 | 47.7 | 26.9 | 350 | 47 | 0 | 0 | 0 | 248.9 | 8.4 | #document ×18; div#act-1-program.relative.px-gutter.pt-tier-group in #act-1 ×10 | event-listener:BUTTON#intro-play.onclick @ intro.js (16 ms) |  |
| intro:hold | 3 | 5.1 | 194.5 | 100 | 466.7 | 466.7 | 66.7 | 66.7 | 466.7 | 2 | 66 | 100 | 0 | 541.7 | 25.7 | #document ×3; div.absolute.inset-0.will-change-transform in #top ×2 | user-callback:TimerHandler:setInterval (112 ms) |  |
| intro:reveal | 5 | 8.8 | 113.3 | 100 | 183.3 | 183.3 | 100 | 100 | 183.3 | 5 | 0 | 0 | 0 | 285.9 | 5.3 | #document ×2; video.absolute.inset-0.size-full in #top ×1 |  |  |
| intro:titles | 147 | 43.7 | 22.9 | 16.7 | 50 | 66.7 | 9.5 | 4.1 | 166.7 | 9 | 0 | 0 | 0 | 2.4 | 2.7 | #document ×2; video.absolute.inset-0.size-full in #top ×2 | user-callback:FrameRequestCallback (5 ms) |  |
| top | 40 | 27.6 | 36.3 | 33.3 | 99.9 | 166.7 | 27.5 | 10 | 166.7 | 5 | 0 | 0 | 0 | 102.1 | 4.1 | #document ×3; div.hero-cap__in in #top ×2 |  | 1 video, 1 filter, 1 blend, 1 mask, 5 will-change, 1 infinite anims, 1.2 MP of images |

### intro — marks and LoAF intro:warm → intro:titles-end

warm t=4.147s → titles-end t=10.087s: 30 LoAF, **30 > 50 ms** (max 415 ms, blocking 66 ms)

intro:arm@-3.347 · intro:ready@-3.108 · intro:play@0 · intro:flight@0.359 · intro:warm@4.147 · intro:hold@5.577 · intro:reveal@6.153 · intro:landing@6.153 · intro:titles@6.886 · intro:end@6.887 · intro:titles-end@10.087

### intro — longest animation frames (LoAF total 7510 ms, main-thread work 1474 ms, blocking 1067 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| -2.61 | intro:play-screen | 800 | 746 | 793 | 0 | 793 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 793 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 5.74 | intro:hold | 415 | 0 | 6 | 1 | 5 | user-callback:FrameRequestCallback 5 ms |  |
| 0.14 | intro:flight | 348 | 0 | 3 | 3 | 0 | (no script) |  |
| -1.59 | intro:play-screen | 261 | 202 | 247 | 1 | 246 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 241 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |
| 6.53 | intro:reveal | 189 | 0 | 0 | 0 | 0 | (no script) |  |

### intro — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| -2.61 | intro:play-screen | 800 | 746 | 793 | 0 | 793 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 793 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| -1.59 | intro:play-screen | 261 | 202 | 247 | 1 | 246 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 241 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |
| 5.6 | intro:hold | 140 | 66 | 112 | 0 | 112 | user-callback:TimerHandler:setInterval 112 ms |  |
| -1.32 | intro:play-screen | 113 | 52 | 79 | 1 | 78 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 78 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |
| -0.91 | intro:play-screen | 119 | 0 | 53 | 1 | 52 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 23 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |

### intro — layout shifts (CLS total 0, session 0, 0 shifts)


### intro — visual pops (7; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| -0.95 | 0 | intro:play-screen | 0 | 4.4 | 9.3 | change | 3.9 | 1 |
| 1.35 | 0 | intro:flight | 0 | 2.3 | 32.9 | change | 5.6 | 1 |
| 1.61 | 0 | intro:flight | 0 | 11.9 | 168.6 | change | 19.1 | 5 |
| 2.16 | 0 | intro:flight | 0 | 11.1 | 156.9 | change | 18.7 | 4 |
| 2.66 | 0 | intro:flight | 0 | 12.4 | 120.6 | change | 26 | 4 |
| 3.06 | 0 | intro:flight | 0 | 21.2 | 15.7 | change | 43.6 | 3 |
| 7.33 | 0 | intro:titles | 0 | 5.7 | 7.7 | fill-in | 7.3 | 2 |

## desktop — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 10 | 6.5 | 155 | 66.6 | 666.7 | 666.7 | 80 | 60 | 666.7 | 4 | 0 | 0 | 0 | 592.9 | 16.8 | #document ×10; div.absolute.inset-0.will-change-transform in #top ×5 |  | 3 will-change, 0.6 MP of images |
| act-1 | 54 | 13 | 76.8 | 50 | 300.1 | 400 | 57.4 | 48.1 | 400 | 24 | 28 | 3.2 | 0 | 534.5 | 30.1 | #document ×27; div.act-card-stage.relative.flex in #act-1 ×20 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (122 ms) | 4 mask, 1.8 MP of images |
| about | 17 | 8.6 | 115.7 | 66.6 | 400 | 400 | 76.5 | 70.6 | 400 | 11 | 0 | 0 | 0 | 737.8 | 40.7 | #document ×13; div.absolute.inset-0.will-change-transform in #top ×13 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (23 ms) | 1 mask |
| journey | 19 | 6.9 | 145.6 | 133.4 | 266.6 | 266.6 | 100 | 94.7 | 266.6 | 19 | 30 | 10.5 | 0 | 846.5 | 48.4 | #document ×19; div.act-card-stage.relative.flex in #act-2 ×16 | user-callback:FrameRequestCallback @ 441c4j50hgigt.js r (23 ms) | 1 mask, 2 will-change, 0.6 MP of images |
| act-2 | 72 | 18.3 | 54.6 | 16.7 | 216.7 | 350 | 30.6 | 22.2 | 350 | 20 | 23 | 9.1 | 0 | 517.1 | 50.6 | #document ×20; div.relative.@container in #work ×19 | user-callback:FrameRequestCallback @ 35xowqx4mq6hh.js (44 ms) | 2 filter, 3 mask, 8 will-change, 2.4 MP of images |
| work | 30 | 14.3 | 70 | 50 | 183.4 | 266.6 | 50 | 43.3 | 266.6 | 12 | 0 | 0 | 0 | 517.6 | 45.7 | #document ×11; div.act-card-stage.relative.flex in #act-2 ×11 |  | 4 filter, 1 blend, 1 mask, 1 will-change, 1.6 MP of images |
| trading-algos | 33 | 13.5 | 74.2 | 66.6 | 183.3 | 200 | 60.6 | 54.5 | 200 | 18 | 0 | 0 | 0 | 700 | 35.9 | #document ×19; div.act-card-stage.relative.flex in #act-2 ×13 | event-listener:#document.onscroll @ 1is0gg5e6lopl.js tx (5 ms) | 2 filter, 0.1 MP of images |
| optuna-screener | 37 | 11.3 | 88.7 | 66.7 | 266.7 | 283.4 | 81.1 | 62.2 | 283.4 | 23 | 0 | 0 | 0 | 751.4 | 54.2 | #document ×29; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×26 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (9 ms) | 2 filter, 1.3 MP of images |
| experiment | 24 | 23.2 | 43.1 | 33.4 | 100 | 133.4 | 41.7 | 25 | 133.4 | 7 | 0 | 0 | 0 | 546.7 | 33.9 | #document ×11; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×6 |  |  |
| systems | 23 | 10.2 | 97.8 | 83.3 | 166.7 | 200 | 78.3 | 73.9 | 200 | 18 | 0 | 0 | 0 | 885 | 39.1 | #document ×23; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×18 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (6 ms) | 1 will-change, 0.6 MP of images |
| kill-list | 25 | 9.9 | 100.7 | 116.6 | 166.6 | 166.7 | 80 | 80 | 166.7 | 19 | 4 | 10 | 0 | 862.7 | 45.7 | #document ×22; div.relative.@container.will-change-[transform,opacity] in #header ×22 |  | 3 will-change, 0.3 MP of images |
| films | 538 | 39.3 | 25.4 | 16.7 | 83.3 | 166.6 | 12.1 | 8.2 | 283.2 | 44 | 43 | 4.6 | 0.0003 | 288.6 | 39.3 | #document ×122; div.act-card-stage.relative.flex in #act-3 ×81 | user-callback:TimerHandler:setInterval (48 ms) | 3 will-change, 3.8 MP of images |
| act-3 | 135 | 32.1 | 31.1 | 16.7 | 116.7 | 250 | 14.1 | 12.6 | 333.3 | 18 | 0 | 0 | 0 | 432.6 | 41.2 | #document ×44; div.act-card-stage.relative.flex in #act-3 ×30 | user-callback:TimerHandler:setTimeout (5 ms) | 1 filter, 2 mask, 6 will-change, 9 infinite anims, 1 MP of images |
| beyond | 58 | 12.7 | 78.4 | 66.8 | 183.3 | 200 | 77.6 | 67.2 | 200 | 39 | 15 | 4.4 | 0.0108 | 711.5 | 45.5 | #document ×52; div.act-card-stage.relative.flex in #act-3 ×46 | user-callback:TimerHandler:setTimeout @ 187a93e-_mwtb.js t (60 ms) | 7 mask, 1 will-change, 4.5 MP of images |
| writing | 41 | 14.8 | 67.5 | 50 | 166.6 | 266.6 | 65.9 | 48.8 | 266.6 | 19 | 30 | 7.4 | 0.0004 | 749.7 | 120.4 | #document ×41; div.act-card-stage.relative.flex in #act-4 ×41 | classic-script:/_next/static/chunks/19vq58ko3wg2v.js @ 19vq58ko3wg2v.js (57 ms) | 6 mask, 4 will-change |
| voices | 24 | 12.9 | 77.8 | 66.7 | 166.6 | 166.7 | 66.7 | 54.2 | 166.7 | 13 | 0 | 0 | 0 | 830.3 | 105.5 | #document ×25; div.act-card-stage.relative.flex in #act-4 ×23 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (5 ms) | 1 mask, 3 will-change, 9 infinite anims, 1.8 MP of images |
| act-4 | 98 | 22.9 | 43.7 | 16.7 | 150.1 | 233.4 | 27.6 | 24.5 | 233.4 | 21 | 3 | 7.4 | 0.0009 | 516.2 | 35.5 | #document ×37; div.rdr2-module__R8wI0W__campSticky in #voices ×25 | user-callback:FrameRequestCallback @ 23zdt5ifk7kj2.js f (24 ms) | 2 canvas, 3 mask, 5 will-change, 21 infinite anims, 1.2 MP of images |
| principles | 13 | 4.4 | 229.5 | 233.4 | 483.4 | 483.4 | 92.3 | 92.3 | 483.4 | 12 | 0 | 0 | 0 | 979.2 | 14.1 | #document ×13; div.act-card-stage.relative.flex in #act-4 ×13 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (16 ms) | 11 will-change |
| contact | 2 | 1.8 | 566.7 | 683.3 | 683.3 | 683.3 | 100 | 100 | 683.3 | 2 | 0 | 0 | 0 | 814.4 | 17.6 | #document ×2; div.act-card-stage.relative.flex in #act-4 ×2 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (16 ms) | 4 mask, 1 MP of images |
| credits | 59 | 14.9 | 66.9 | 50 | 183.3 | 400 | 64.4 | 45.8 | 400 | 29 | 0 | 0 | 0 | 529.4 | 18.5 | #document ×27; div.act-card-stage.relative.flex in #act-4 ×15 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (33 ms) | 1 will-change |

### desktop — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 384→2846 | 59 | 13.2 | 76 | 50.1 | 300.1 | 400 | 50.8 | 400 | 29 | 28 | 2.9 |
| act-2 | 6498→8495 | 75 | 17.1 | 58.4 | 16.7 | 216.7 | 350 | 25.3 | 350 | 24 | 23 | 8 |
| act-3 | 24780→26623 | 139 | 30.6 | 32.7 | 16.7 | 133.3 | 250 | 14.4 | 333.3 | 21 | 0 | 0 |
| act-4 | 34634→36631 | 101 | 22 | 45.5 | 16.7 | 150 | 233.2 | 25.7 | 233.4 | 24 | 3 | 6.9 |

### desktop — longest animation frames (LoAF total 45325 ms, main-thread work 1219 ms, blocking 176 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 62.12 | contact | 673 | 0 | 19 | 1 | 18 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 8 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 0.3 | top | 667 | 0 | 1 | 1 | 0 | (no script) |  |
| 61.13 | principles | 484 | 0 | 1 | 1 | 0 | (no script) |  |
| 62.8 | contact | 428 | 0 | 9 | 1 | 8 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 8 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 7.03 | about | 400 | 0 | 9 | 1 | 8 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 8 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |

### desktop — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 3.56 | act-1 | 125 | 28 | 76 | 0 | 76 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 76 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 47.74 | beyond | 121 | 15 | 61 | 1 | 60 | user-callback:TimerHandler:setTimeout @ 187a93e-_mwtb.js t 60 ms | `()=>{Y.size&&((0,i.motionOffNow)()\|\|"gl"!==(0,M.glTier)()\|\|document.hidden\|\|eo()\|\|eu())?wi` |
| 11.33 | act-2 | 251 | 23 | 59 | 4 | 55 | user-callback:FrameRequestCallback @ 35xowqx4mq6hh.js 44 ms | `()=>{g=0,j()}))}function H(){O=performance.now(),z(),function(){if(f)return;let e=()=>{let` |
| 50.84 | writing | 84 | 30 | 58 | 1 | 57 | classic-script:/_next/static/chunks/19vq58ko3wg2v.js @ 19vq58ko3wg2v.js 57 ms | `(globalThis.TURBOPACK\|\|(globalThis.TURBOPACK=[])).push(["object"==typeof document?document` |
| 36.69 | films | 65 | 9 | 49 | 1 | 48 | user-callback:TimerHandler:setInterval 48 ms |  |

### desktop — layout shifts (CLS total 0.0124, session 0.0108, 6 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 48.44 | 0.0095 | beyond | span[data-w] in #beyond ; span[data-w] in #beyond ; span[data-words=scrub][data-words-variant=default] in #beyond |
| 48.72 | 0.0013 | beyond | span.whitespace-nowrap in #beyond ; span.scene-caption__sep in #beyond ; span.scene-caption__film.world-face-rdr2 in #beyond |
| 55.17 | 0.0009 | act-4 | span.whitespace-nowrap in #act-4 ; span.scene-caption__film.world-face-rdr2 in #act-4 |
| 39.92 | 0.0003 | films | span[data-words-i] in #films |
| 51.18 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 51.57 | 0.0001 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |

### desktop — visual pops (10; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 5.62 | 1969 | about | 32 | 9.2 | 99.9 | change | 15.4 | 2 |
| 5.93 | 2234 | about | 39 | 8.7 | 95.4 | change | 15.4 | 1 |
| 6.72 | 2731 | about | 11 | 9.3 | 96.1 | change | 19.5 | 1 |
| 33.30 | 22573 | films | 16 | 7.2 | 30.7 | change | 16.6 | 2 |
| 34.84 | 22630 | films | 10 | 6.1 | 348.5 | change | 13.5 | 3 |
| 35.22 | 22730 | films | 21 | 7.4 | 393.8 | change | 14.5 | 1 |
| 37.86 | 23427 | films | 5 | 5.6 | 560 | change | 12.3 | 1 |
| 46.11 | 25866 | beyond | 25 | 10 | 1002.2 | change | 17.4 | 3 |
| 59.37 | 35851 | principles | 18 | 8.7 | 869 | change | 23.1 | 1 |
| 59.86 | 36239 | principles | 36 | 11.8 | 1176.6 | change | 9.8 | 1 |

## native — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 7 | 14.5 | 69 | 33.4 | 249.9 | 249.9 | 42.9 | 42.9 | 249.9 | 2 | 0 | 0 | 0 | 753.3 | 31 | #document ×8; section#about.relative.isolate.bg-bg in #about ×1 |  | 3 will-change, 0.6 MP of images |
| act-1 | 26 | 5.8 | 172.4 | 116.7 | 499.9 | 700 | 84.6 | 80.8 | 700 | 21 | 676 | 13.6 | 0 | 518.1 | 22.8 | #document ×19; div.act-card-stage.relative.flex in #act-1 ×11 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (567 ms) | 4 mask, 1.8 MP of images |
| about | 11 | 5.9 | 168.2 | 66.7 | 416.7 | 416.7 | 72.7 | 63.6 | 416.7 | 8 | 11 | 0 | 0 | 743.3 | 35.7 | #document ×11; div.act-card-stage.relative.flex in #act-1 ×6 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (93 ms) | 1 mask |
| journey | 10 | 3.3 | 305 | 316.6 | 916.7 | 916.7 | 70 | 70 | 916.7 | 8 | 26 | 57.1 | 0 | 555.8 | 31.1 | #document ×10; div.act-card-stage.relative.flex in #act-2 ×7 | resolve-promise:Promise.resolve @ 3lv1a4umh4a4v.js (61 ms) | 1 mask, 2 will-change, 0.6 MP of images |
| act-2 | 11 | 3.8 | 260.6 | 166.6 | 1016.7 | 1016.7 | 90.9 | 90.9 | 1016.7 | 9 | 0 | 0 | 0 | 634.6 | 29 | #document ×10; div.absolute.inset-x-0.top-0 in #act-2 ×8 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (26 ms) | 2 filter, 3 mask, 8 will-change, 2.4 MP of images |
| work | 41 | 20.5 | 48.8 | 16.7 | 250 | 300 | 22 | 17.1 | 300 | 8 | 0 | 0 | 0 | 444 | 66.5 | #document ×17; div.act-card-stage.relative.flex in #act-2 ×10 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (8 ms) | 4 filter, 1 blend, 1 mask, 1 will-change, 1.6 MP of images |
| trading-algos | 47 | 17.6 | 56.7 | 16.7 | 183.3 | 266.7 | 40.4 | 31.9 | 266.7 | 15 | 0 | 0 | 0.0018 | 458.7 | 35.6 | #document ×25; div.act-card-stage.relative.flex in #act-2 ×11 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (16 ms) | 2 filter, 0.1 MP of images |
| optuna-screener | 33 | 10.3 | 97 | 83.3 | 283.3 | 516.6 | 63.6 | 57.6 | 516.6 | 18 | 0 | 0 | 0 | 524.4 | 57.5 | #document ×33; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×20 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (17 ms) | 2 filter, 1.3 MP of images |
| experiment | 20 | 19.4 | 51.7 | 33.4 | 200.1 | 200.1 | 40 | 30 | 200.1 | 7 | 0 | 0 | 0 | 419 | 32.9 | #document ×11; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×8 |  |  |
| systems | 20 | 8.1 | 124.2 | 133.4 | 250 | 250 | 75 | 70 | 250 | 11 | 148 | 13.3 | 0.0008 | 781.7 | 25.4 | #document ×18; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×11 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (8 ms) | 1 will-change, 0.6 MP of images |
| kill-list | 16 | 6.5 | 154.2 | 149.9 | 300 | 300 | 87.5 | 81.3 | 300 | 14 | 0 | 0 | 0 | 787.3 | 37.3 | #document ×15; div.relative.@container.will-change-[transform,opacity] in #header ×13 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (10 ms) | 3 will-change, 0.3 MP of images |
| films | 308 | 29.8 | 33.5 | 16.7 | 116.7 | 316.6 | 14.6 | 9.4 | 350 | 34 | 31 | 2.2 | 0.0006 | 354.6 | 49.3 | #document ×133; div.absolute.inset-0.overflow-hidden in #films ×41 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (128 ms) | 4 will-change, 3.8 MP of images |
| act-3 | 93 | 28.3 | 35.3 | 16.7 | 150 | 450 | 15.1 | 11.8 | 450 | 10 | 4 | 7.1 | 0 | 425.8 | 49 | #document ×47; header.fixed.inset-x-0.top-0 in #header ×14 |  | 1 filter, 2 mask, 6 will-change, 9 infinite anims, 1 MP of images |
| beyond | 35 | 7.5 | 133.3 | 100 | 416.6 | 516.7 | 77.1 | 62.9 | 516.7 | 22 | 0 | 0 | 0.0103 | 508.5 | 27.2 | #document ×30; div.act-card-stage.relative.flex in #act-3 ×19 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (7 ms) | 7 mask, 1 will-change, 4.5 MP of images |
| writing | 39 | 13.4 | 74.4 | 50 | 266.6 | 283.3 | 51.3 | 46.2 | 283.3 | 16 | 1 | 10 | 0.0009 | 528.3 | 91.7 | #document ×39; div.act-card-stage.relative.flex in #act-4 ×19 | classic-script:/_next/static/chunks/19vq58ko3wg2v.js @ 19vq58ko3wg2v.js (37 ms) | 6 mask, 4 will-change |
| voices | 11 | 5.6 | 177.3 | 133.3 | 366.6 | 366.6 | 90.9 | 81.8 | 366.6 | 9 | 0 | 0 | 0 | 386.7 | 42.1 | #document ×11; div.act-card-stage.relative.flex in #act-4 ×8 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (7 ms) | 1 mask, 3 will-change, 9 infinite anims, 1.8 MP of images |
| act-4 | 49 | 14.1 | 70.7 | 16.7 | 266.6 | 533.3 | 32.7 | 28.6 | 533.3 | 14 | 0 | 0 | 0.0009 | 511.7 | 41 | #document ×32; canvas.act-card-seq in #act-4 ×15 | user-callback:FrameRequestCallback @ 23zdt5ifk7kj2.js f (10 ms) | 2 canvas, 3 mask, 5 will-change, 21 infinite anims, 1.2 MP of images |
| principles | 17 | 4.3 | 231.4 | 99.9 | 1249.9 | 1249.9 | 64.7 | 64.7 | 1249.9 | 11 | 0 | 9.1 | 0 | 852 | 21.4 | #document ×17; div.act-card-stage.relative.flex in #act-4 ×9 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (86 ms) | 11 will-change |
| contact | 3 | 4.3 | 233.3 | 250 | 333.4 | 333.4 | 100 | 100 | 333.4 | 3 | 0 | 0 | 0 | 748.6 | 32.9 | #document ×3; div.act-card-stage.relative.flex in #act-4 ×3 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (10 ms) | 4 mask, 1 MP of images |
| credits | 55 | 15 | 66.7 | 50 | 200.1 | 300 | 65.5 | 49.1 | 300 | 28 | 0 | 0 | 0 | 427.9 | 22.4 | #document ×26; footer#credits.relative.isolate.z-(--z-main) in #credits ×13 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (40 ms) | 1 will-change |

### native — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 384→2846 | 28 | 5.8 | 172.6 | 116.7 | 499.9 | 700 | 82.1 | 700 | 23 | 676 | 12.5 |
| act-2 | 6498→8495 | 14 | 4.4 | 226.2 | 166.6 | 1016.7 | 1016.7 | 78.6 | 1016.7 | 11 | 0 | 0 |
| act-3 | 24780→26623 | 95 | 26.4 | 37.9 | 16.7 | 150.1 | 450 | 13.7 | 450 | 12 | 4 | 6.3 |
| act-4 | 34634→36631 | 49 | 14.1 | 70.7 | 16.7 | 266.6 | 533.3 | 28.6 | 533.3 | 15 | 0 | 0 |

### native — longest animation frames (LoAF total 46021 ms, main-thread work 1699 ms, blocking 897 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 54.99 | principles | 1232 | 0 | 34 | 1 | 33 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 33 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 11.56 | act-2 | 1005 | 0 | 20 | 2 | 18 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 10 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 54.08 | principles | 905 | 0 | 8 | 3 | 5 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 5 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |
| 6.86 | journey | 871 | 0 | 13 | 0 | 13 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 13 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 0.48 | act-1 | 848 | 523 | 567 | 0 | 567 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 567 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |

### native — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 0.48 | act-1 | 848 | 523 | 567 | 0 | 567 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 567 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 33.55 | films | 81 | 31 | 79 | 0 | 79 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 79 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 8.88 | journey | 253 | 9 | 69 | 1 | 68 | resolve-promise:Promise.resolve @ 3lv1a4umh4a4v.js 47 ms |  |
| 6.8 | about | 64 | 11 | 60 | 1 | 59 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 59 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 7.87 | journey | 527 | 17 | 53 | 1 | 52 | user-callback:TimerHandler:setTimeout @ 0s61ww_t6ie45.js tp 44 ms | `(){tf=0;let t=window.scrollY,e=window.innerHeight;for(let i of[...ta])i.idle(t,e)}function` |

### native — layout shifts (CLS total 0.0153, session 0.0103, 13 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 43.27 | 0.009 | beyond | span[data-w] in #beyond ; span[data-w] in #beyond ; span[data-words=scrub][data-words-variant=default] in #beyond |
| 15.85 | 0.0018 | trading-algos | span.scene-caption__film.world-face-idiots in #trading-algos ; p.scene-caption.mb-tier-group[data-caption=cap.trading-algos][data-caption-world=idiots] in #trading-algos |
| 43.68 | 0.0013 | beyond | span.whitespace-nowrap in #beyond ; span.scene-caption__sep in #beyond ; span.scene-caption__film.world-face-rdr2 in #beyond |
| 50.19 | 0.0009 | act-4 | span.whitespace-nowrap in #act-4 ; span.scene-caption__film.world-face-rdr2 in #act-4 |
| 23.57 | 0.0004 | systems | h3.inline.type-heading.text-fg in #systems ; span.ml-3.type-body.text-fg-muted in #systems |
| 36.3 | 0.0004 | films | span[data-words-i] in #films |
| 47.07 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 24.05 | 0.0003 | systems | h3.inline.type-heading.text-fg in #systems |

### native — visual pops (39; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 2.20 | 400 | act-1 | 0 | 2.7 | 9.8 | change | 4.7 | 1 |
| 2.83 | 1400 | act-1 | 0 | 5.1 | 17.9 | change | 7.5 | 1 |
| 3.17 | 1500 | act-1 | 0 | 2.9 | 8.8 | change | 3.6 | 1 |
| 3.50 | 1500 | act-1 | 0 | 8.8 | 25 | change | 14.4 | 2 |
| 3.78 | 1500 | act-1 | 0 | 7.5 | 18.5 | change | 13 | 1 |
| 6.58 | 3000 | about | 0 | 2.7 | 23 | change | 1.9 | 1 |
| 8.57 | 4300 | journey | 0 | 3.7 | 6.6 | change | 4 | 1 |
| 8.88 | 5100 | journey | 0 | 8.3 | 8.1 | change | 11.3 | 1 |
| 9.27 | 5100 | journey | 0 | 3.7 | 6.6 | change | 7.3 | 1 |
| 9.65 | 5700 | journey | 0 | 3.9 | 3.8 | change | 3.9 | 1 |
| 10.45 | 6300 | act-2 | 0 | 3.7 | 3.1 | change | 6.2 | 1 |
| 10.94 | 7000 | act-2 | 0 | 7.6 | 4.8 | change | 13.5 | 1 |
| 11.54 | 7600 | act-2 | 0 | 31.6 | 19.5 | change | 41.1 | 2 |
| 12.05 | 7600 | act-2 | 0 | 7.1 | 4.4 | change | 12.7 | 1 |
| 12.27 | 7600 | act-2 | 0 | 17.9 | 20.8 | change | 32.1 | 1 |
| 13.19 | 7600 | work | 0 | 4.8 | 59.9 | change | 8.1 | 1 |
| 13.56 | 8200 | work | 0 | 3.6 | 51.3 | change | 7.2 | 1 |
| 14.04 | 8700 | work | 0 | 3.2 | 22.9 | fill-in | 5.9 | 2 |
| 28.16 | 21000 | films | 0 | 3.4 | 3.4 | fill-in | 4.8 | 1 |
| 32.73 | 22900 | films | 0 | 12.7 | 216.4 | fill-in | 22.2 | 1 |
| 33.26 | 23200 | films | 0 | 2.1 | 25.7 | fill-in | 4.7 | 1 |
| 38.54 | 25300 | act-3 | 0 | 9.2 | 362.3 | change | 32.5 | 1 |
| 39.20 | 25500 | act-3 | 0 | 16.6 | 264.1 | change | 41.6 | 1 |
| 39.88 | 25700 | act-3 | 0 | 3.1 | 6.4 | change | 4 | 2 |
| 40.49 | 25900 | beyond | 0 | 4.5 | 7.2 | change | 6.6 | 1 |
| 40.84 | 26200 | beyond | 0 | 6.9 | 5.3 | change | 11.2 | 1 |
| 44.60 | 30000 | beyond | 0 | 24.8 | 2481.3 | change | 25.7 | 2 |
| 45.09 | 30300 | writing | 0 | 2.5 | 251.1 | change | 2.6 | 1 |
| 45.38 | 30700 | writing | 0 | 6.4 | 140.3 | change | 4.6 | 3 |
| 46.51 | 31500 | writing | 0 | 15.1 | 6 | blank-out | 8.3 | 1 |
| 49.46 | 33600 | voices | 0 | 4 | 9.1 | change | 3.8 | 1 |
| 50.61 | 34400 | act-4 | 0 | 8.2 | 17.7 | change | 14.5 | 1 |
| 50.87 | 35000 | act-4 | 0 | 19.3 | 41.7 | change | 38.5 | 1 |
| 51.43 | 35500 | act-4 | 0 | 16.7 | 6.3 | change | 34.7 | 1 |
| 51.72 | 35500 | act-4 | 0 | 26.7 | 7.4 | change | 51.7 | 2 |
| 53.53 | 36000 | principles | 0 | 9.1 | 5.3 | change | 25.7 | 1 |
| 53.80 | 36700 | principles | 0 | 26 | 11.4 | change | 14.1 | 1 |
| 55.49 | 37600 | principles | 0 | 26 | 13.2 | change | 15.3 | 1 |
| 56.92 | 38400 | principles | 0 | 39.4 | 21.6 | change | 25.4 | 2 |

## alt — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 12 | 3.5 | 287.5 | 83.3 | 2166.6 | 2166.6 | 91.7 | 58.3 | 2166.6 | 7 | 0 | 0 | 0 | 231.3 | 13 | #document ×10; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×6 | event-listener:DOMWindow.onwheel @ 3nrw97bwi-rf0.js onWheel (6 ms) | 3 will-change, 0.6 MP of images |
| act-1 | 44 | 10.2 | 97.7 | 83.2 | 250 | 316.6 | 79.5 | 68.2 | 316.6 | 30 | 96 | 2.9 | 0 | 554.7 | 24 | #document ×26; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×22 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (149 ms) | 3 mask, 1.9 MP of images |
| about | 16 | 9.1 | 109.4 | 99.9 | 316.6 | 316.6 | 81.3 | 68.8 | 316.6 | 11 | 0 | 0 | 0 | 664.6 | 25.1 | #document ×10; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×9 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (16 ms) | 1 mask |
| journey | 27 | 9.9 | 101.2 | 83.3 | 250 | 250 | 88.9 | 85.2 | 250 | 22 | 0 | 0 | 0 | 749.3 | 47.6 | #document ×27; div.act-card-stage.relative.flex in #act-2 ×25 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (6 ms) | 1 mask, 2 will-change, 1 infinite anims, 0.6 MP of images |
| act-2 | 99 | 24 | 41.7 | 16.7 | 200 | 283.3 | 20.2 | 17.2 | 283.3 | 18 | 0 | 0 | 0 | 504.9 | 25.4 | #document ×18; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×16 | user-callback:FrameRequestCallback @ 441c4j50hgigt.js e (22 ms) | 1 filter, 3 mask, 5 will-change, 1.9 MP of images |
| work | 27 | 13.1 | 76.5 | 33.4 | 283.4 | 316.7 | 48.1 | 40.7 | 316.7 | 10 | 0 | 0 | 0 | 675.5 | 41.6 | #document ×11; div.act-card-stage.relative.flex in #act-2 ×11 | user-callback:IntersectionObserverCallback @ 0s61ww_t6ie45.js (6 ms) | 5 filter, 1 blend, 1 mask, 1 will-change, 0.8 MP of images |
| trading-algos | 31 | 10.9 | 91.4 | 83.3 | 249.9 | 283.4 | 71 | 58.1 | 283.4 | 18 | 0 | 0 | 0 | 794.9 | 27.2 | #document ×21; div.act-card-stage.relative.flex in #act-2 ×14 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (5 ms) | 2 filter, 0.1 MP of images |
| optuna-screener | 45 | 15.2 | 65.9 | 50 | 166.7 | 216.6 | 68.9 | 40 | 216.6 | 19 | 0 | 0 | 0 | 774.6 | 75.8 | #document ×45; div.stage-window in #optuna-screener ×45 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (5 ms) | 3 filter, 1 mask, 1 will-change, 1.3 MP of images |
| experiment | 27 | 23.5 | 42.6 | 16.8 | 149.9 | 233.3 | 29.6 | 14.8 | 233.3 | 4 | 0 | 0 | 0 | 625.3 | 40.9 | #document ×14; div.stage-window in #optuna-screener ×8 |  |  |
| systems | 24 | 11.4 | 87.5 | 83.3 | 183.3 | 200 | 66.7 | 54.2 | 200 | 13 | 0 | 0 | 0 | 921.9 | 29 | #document ×21; div.relative.@container.overflow-clip in #header ×14 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (11 ms) | 0.6 MP of images |
| kill-list | 26 | 10.5 | 95.5 | 83.4 | 166.7 | 250 | 88.5 | 80.8 | 250 | 19 | 1 | 8.7 | 0 | 847.3 | 29 | #document ×23; div.relative.@container.overflow-clip in #header ×11 |  | 2 will-change, 0.1 MP of images |
| films | 516 | 36.5 | 27.4 | 16.7 | 83.4 | 133.4 | 13.6 | 9.9 | 416.6 | 57 | 39 | 2.9 | 0.0001 | 312.3 | 26.7 | #document ×113; div.act-card-stage.relative.flex in #act-3 ×68 | user-callback:FrameRequestCallback (34 ms) | 2 mask, 5 will-change, 3.3 MP of images |
| act-3 | 116 | 25 | 39.9 | 16.7 | 166.7 | 349.9 | 23.3 | 16.4 | 466.6 | 20 | 0 | 0 | 0 | 501 | 33.7 | #document ×31; div.act-card-stage.relative.flex in #act-3 ×17 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (8 ms) | 1 filter, 2 mask, 9 will-change, 9 infinite anims, 1 MP of images |
| beyond | 57 | 13.5 | 74.3 | 50 | 183.3 | 416.7 | 64.9 | 47.4 | 416.7 | 27 | 0 | 0 | 0.0102 | 759.9 | 56 | #document ×55; div.act-card-stage.relative.flex in #act-3 ×51 |  | 7 mask, 1 will-change, 3.5 MP of images |
| writing | 53 | 18.6 | 53.8 | 33.4 | 150 | 366.6 | 47.2 | 28.3 | 366.6 | 19 | 13 | 8 | 0.0006 | 702.1 | 77.9 | #document ×54; div.act-card-stage.relative.flex in #act-4 ×54 | event-listener:DOMWindow.onscroll @ 1kte77d4x88st.js h (5 ms) | 5 mask, 3 will-change |
| voices | 25 | 17 | 58.7 | 50.1 | 133.3 | 133.4 | 56 | 52 | 133.4 | 12 | 0 | 0 | 0 | 602.8 | 44.3 | #document ×25; div.act-card-stage.relative.flex in #act-4 ×24 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (7 ms) | 9 infinite anims, 1.8 MP of images |
| act-4 | 131 | 32 | 31.3 | 16.7 | 99.9 | 200 | 18.3 | 13 | 299.9 | 18 | 0 | 0 | 0.0009 | 399.3 | 24.1 | #document ×24; div.absolute.inset-0 in #act-4 ×12 |  | 1 canvas, 1 blend, 2 mask, 6 will-change, 21 infinite anims, 1.2 MP of images |
| principles | 29 | 9.6 | 104.6 | 83.4 | 299.9 | 350.1 | 69 | 62.1 | 350.1 | 18 | 0 | 0 | 0 | 965.3 | 16.2 | #document ×22; div.act-card-stage.relative.flex in #act-4 ×22 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (5 ms) | 3 mask |
| contact | 3 | 3.7 | 272.2 | 183.3 | 499.9 | 499.9 | 100 | 100 | 499.9 | 3 | 0 | 0 | 0 | 640.5 | 9.8 | #document ×2; div.act-card-stage.relative.flex in #act-4 ×2 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (7 ms) | 4 mask, 0.5 MP of images |
| credits | 65 | 16.1 | 62 | 50 | 166.7 | 466.7 | 60 | 38.5 | 466.7 | 25 | 0 | 0 | 0 | 607 | 23.6 | #document ×30; div.stage-cam ×16 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (8 ms) |  |

### alt — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 384→2817 | 48 | 10.2 | 98.3 | 83.3 | 250 | 316.6 | 68.8 | 316.6 | 34 | 96 | 2.6 |
| act-2 | 6469→8466 | 102 | 21.8 | 45.9 | 16.7 | 200 | 283.3 | 19.6 | 316.7 | 22 | 0 | 0 |
| act-3 | 24791→26634 | 118 | 23.6 | 42.4 | 16.7 | 166.7 | 349.9 | 17.8 | 466.6 | 22 | 0 | 0 |
| act-4 | 34474→36471 | 139 | 31.7 | 31.5 | 16.7 | 99.9 | 200 | 12.9 | 299.9 | 20 | 0 | 0 |

### alt — longest animation frames (LoAF total 43371 ms, main-thread work 793 ms, blocking 149 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 62.3 | contact | 474 | 0 | 1 | 1 | 0 | (no script) |  |
| 63.14 | credits | 468 | 0 | 9 | 1 | 8 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v 8 ms | `()=>{let i=e.MotionGlobalConfig.useManualTiming,o=i?a.timestamp:performance.now();n=!1,i\|\|` |
| 0.39 | top | 465 | 0 | 2 | 2 | 0 | (no script) |  |
| 46.13 | act-3 | 451 | 0 | 1 | 1 | 0 | (no script) |  |
| 47.31 | beyond | 411 | 0 | 1 | 1 | 0 | (no script) |  |

### alt — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 3.38 | act-1 | 161 | 96 | 144 | 0 | 144 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 144 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 36.99 | films | 58 | 0 | 41 | 7 | 34 | user-callback:FrameRequestCallback 34 ms |  |
| 6.19 | about | 310 | 0 | 35 | 1 | 34 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 9 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |
| 10.12 | act-2 | 223 | 0 | 15 | 1 | 14 | user-callback:FrameRequestCallback @ 441c4j50hgigt.js e 14 ms | `(a){r<0&&(r=a,_(!0),J(null));let l=Math.min(1,(a-r)/n);ec(Math.round(t+(eo-t)*(l<.5?2*l*l:` |
| 10.36 | act-2 | 191 | 0 | 14 | 1 | 13 | user-callback:FrameRequestCallback @ 441c4j50hgigt.js e 8 ms | `(a){r<0&&(r=a,_(!0),J(null));let l=Math.min(1,(a-r)/n);ec(Math.round(t+(eo-t)*(l<.5?2*l*l:` |

### alt — layout shifts (CLS total 0.0118, session 0.0102, 7 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 49.09 | 0.009 | beyond | span[data-w] in #beyond ; span[data-w] in #beyond ; span[data-words=scrub][data-words-variant=default] in #beyond |
| 49.23 | 0.0012 | beyond | span.whitespace-nowrap in #beyond ; span.scene-caption__sep in #beyond ; span.scene-caption__film.world-face-rdr2 in #beyond |
| 55.45 | 0.0009 | act-4 | span.whitespace-nowrap in #act-4 ; span.scene-caption__film.world-face-rdr2 in #act-4 |
| 51.76 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 52.66 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 52.3 | 0.0001 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 40.45 | 0.0001 | films | span[data-words-i] in #films |

### alt — visual pops (7; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 0.80 | 0 | top | 0 | 2.4 | 12.2 | change | 2 | 1 |
| 3.36 | 1569 | act-1 | 33 | 10.2 | 19.5 | change | 17.8 | 1 |
| 15.02 | 7925 | work | 15 | 10 | 74.9 | change | 18 | 1 |
| 15.72 | 8506 | work | 34 | 18.2 | 13.4 | change | 27.3 | 1 |
| 36.32 | 23165 | films | 14 | 13.6 | 3.1 | change | 22.8 | 2 |
| 47.79 | 26156 | beyond | 12 | 5.5 | 549.9 | change | 6.8 | 1 |
| 59.42 | 35677 | principles | 27 | 2 | 203.6 | change | 1.9 | 1 |

## rm — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 22 | 60 | 16.7 | 16.7 | 16.7 | 16.7 | 0 | 0 | 16.7 | 0 | 0 |  | 0 | 13.6 | 8.2 | #document ×3 |  | 0.6 MP of images |
| act-1 | 170 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 1.4 | 1.8 | #document ×5 |  | 2 mask, 0.6 MP of images |
| about | 99 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 2.4 | 2.4 | #document ×3; img.object-cover in #act-2 ×1 |  | 1 mask |
| journey | 169 | 59.3 | 16.9 | 16.7 | 16.7 | 16.8 | 0.6 | 0 | 49.9 | 1 | 3 | 100 | 0 | 12.6 | 3.2 | #document ×7; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×2 |  | 1 mask, 0.7 MP of images |
| act-2 | 130 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 2.3 | 0.9 | #document ×2 |  | 1 filter, 2 mask, 0.6 MP of images |
| work | 132 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 20.5 | 1.4 | #document ×3 |  | 5 filter, 1 blend, 1 mask, 1 will-change, 0.8 MP of images |
| trading-algos | 99 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 26.7 | 1.8 | #document ×3 |  | 2 filter |
| optuna-screener | 159 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 1.5 | 2.3 | #document ×5; div.absolute.inset-x-0.top-0 in #kill-list ×1 |  | 2 filter, 0.6 MP of images |
| experiment | 66 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 1.8 | 1.8 | #document ×2 |  |  |
| systems | 125 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 5.8 | 1.9 | #document ×4 |  | 0.6 MP of images |
| kill-list | 150 | 58.8 | 17 | 16.7 | 16.8 | 33.3 | 0 | 0 | 33.4 | 1 | 0 |  | 0 | 10.2 | 13.7 | #document ×17; ol.relative.border-t.border-rule in #kill-list ×5 | user-callback:FrameRequestCallback (30 ms) | 1 will-change, 0.1 MP of images |
| films | 591 | 59.2 | 16.9 | 16.7 | 16.8 | 16.8 | 0.3 | 0.2 | 100 | 2 | 65 | 50 | 0 | 4.5 | 1 | #document ×10 | user-callback:FrameRequestCallback (103 ms) | 2.2 MP of images |
| act-3 | 130 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 1.4 | 2.8 | #document ×4; img.object-cover in #beyond ×2 |  | 2 mask, 0.5 MP of images |
| beyond | 264 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 13.2 | 3 | #document ×7; div.rdr2-module__R8wI0W__campSticky in #voices ×2 |  | 6 mask, 2.2 MP of images |
| writing | 159 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 1.5 | 8.7 | #document ×6; div.absolute.inset-0.-z-10 in #principles ×4 |  | 5 mask, 3 will-change |
| voices | 99 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 1.8 | 5.5 | #document ×4; div.rdr2-module__R8wI0W__campSticky in #voices ×3 |  | 1.2 MP of images |
| act-4 | 130 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 3.2 | 1.8 | #document ×2; div.rdr2-module__R8wI0W__campSticky in #voices ×2 |  | 2 mask, 0.6 MP of images |
| principles | 107 | 40.6 | 24.6 | 16.7 | 66.6 | 183.3 | 5.6 | 5.6 | 349.9 | 5 | 0 | 0 | 0 | 293.6 | 6.5 | #document ×15; div.relative.grid.grid-cols-1 in #principles ×1 |  | 1 will-change |
| contact | 47 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 5.1 | 2.6 | #document ×2 |  | 4 mask, 0.5 MP of images |
| credits | 199 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 0.9 | 0.9 | #document ×3 |  |  |

### rm — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 384→2093 | 189 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 16.8 | 0 | 0 |  |
| act-2 | 5845→7014 | 157 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 16.8 | 0 | 0 |  |
| act-3 | 22134→23326 | 157 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 16.8 | 0 | 0 |  |
| act-4 | 30837→32002 | 156 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 16.8 | 0 | 0 |  |

### rm — longest animation frames (LoAF total 1122 ms, main-thread work 149 ms, blocking 68 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 47.02 | principles | 346 | 0 | 0 | 0 | 0 | (no script) |  |
| 47.37 | principles | 179 | 0 | 0 | 0 | 0 | (no script) |  |
| 46.84 | principles | 141 | 0 | 0 | 0 | 0 | (no script) |  |
| 23.58 | films | 128 | 65 | 110 | 7 | 103 | user-callback:FrameRequestCallback 103 ms |  |
| 46.72 | principles | 79 | 0 | 0 | 0 | 0 | (no script) |  |

### rm — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 23.58 | films | 128 | 65 | 110 | 7 | 103 | user-callback:FrameRequestCallback 103 ms |  |
| 21.01 | kill-list | 57 | 0 | 39 | 9 | 30 | user-callback:FrameRequestCallback 30 ms |  |
| 6.08 | journey | 59 | 3 | 0 | 0 | 0 | (no script) |  |
| 31.86 | films | 62 | 0 | 0 | 0 | 0 | (no script) |  |
| 46.61 | principles | 71 | 0 | 0 | 0 | 0 | (no script) |  |

### rm — layout shifts (CLS total 0, session 0, 0 shifts)


### rm — visual pops (0; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)


## gl — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 10 | 6.9 | 145 | 66.6 | 650 | 650 | 80 | 60 | 650 | 4 | 581 | 25 | 0 | 528.3 | 15.2 | #document ×9; div.act-card-stage.relative.flex in #act-1 ×4 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (624 ms) | 3 will-change, 0.6 MP of images |
| act-1 | 69 | 15.6 | 64.2 | 33.4 | 183.3 | 316.6 | 47.8 | 36.2 | 316.6 | 30 | 26 | 9.1 | 0 | 561.2 | 32.7 | #document ×34; div.absolute.inset-0.origin-center in #top ×26 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (83 ms) | 4 mask, 1.8 MP of images |
| about | 18 | 9.7 | 102.8 | 83.4 | 400 | 400 | 77.8 | 72.2 | 400 | 11 | 0 | 0 | 0 | 667.6 | 41.1 | #document ×13; div.act-card-stage.relative.flex in #act-1 ×13 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (38 ms) | 1 mask |
| journey | 26 | 9.7 | 103.2 | 100 | 200 | 200 | 84.6 | 76.9 | 200 | 19 | 1 | 9.1 | 0 | 707 | 64.1 | #document ×25; div#intro-film ×24 | user-callback:FrameRequestCallback @ 441c4j50hgigt.js r (13 ms) | 1 mask, 2 will-change, 0.6 MP of images |
| act-2 | 85 | 20 | 50 | 16.7 | 150 | 433.3 | 37.6 | 30.6 | 433.3 | 27 | 0 | 0 | 0 | 618.6 | 67.8 | #document ×41; div.relative.@container in #work ×30 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (26 ms) | 2 filter, 3 mask, 8 will-change, 2.4 MP of images |
| work | 50 | 25 | 40 | 33.3 | 133.3 | 216.7 | 24 | 10 | 216.7 | 6 | 0 | 0 | 0 | 429 | 56 | #document ×12; div.act-card-stage.relative.flex in #act-1 ×12 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (5 ms) | 4 filter, 1 blend, 1 mask, 1 will-change, 1.6 MP of images |
| trading-algos | 41 | 16.6 | 60.2 | 50 | 116.8 | 133.3 | 58.5 | 46.3 | 133.3 | 20 | 0 | 0 | 0 | 649.1 | 43.8 | #document ×26; div#intro-film ×17 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (12 ms) | 2 filter, 0.1 MP of images |
| optuna-screener | 41 | 12 | 83.3 | 66.8 | 183.3 | 233.3 | 78 | 65.9 | 233.3 | 26 | 0 | 0 | 0 | 797 | 68.8 | div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×42; #document ×41 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (22 ms) | 2 filter, 1.3 MP of images |
| experiment | 24 | 24.4 | 41 | 33.2 | 100 | 100 | 37.5 | 33.3 | 100 | 9 | 0 | 0 | 0 | 619.3 | 43.7 | #document ×12; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×8 |  |  |
| systems | 23 | 10.5 | 94.9 | 100 | 183.4 | 216.6 | 87 | 65.2 | 216.6 | 15 | 0 | 0 | 0 | 826.7 | 35.7 | #document ×21; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×15 |  | 1 will-change, 0.6 MP of images |
| kill-list | 25 | 10.1 | 99.3 | 83.4 | 166.6 | 200 | 88 | 88 | 200 | 22 | 0 | 0 | 0 | 810.3 | 46.7 | #document ×22; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×22 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (10 ms) | 3 will-change, 0.3 MP of images |
| films | 550 | 40.5 | 24.7 | 16.7 | 66.6 | 166.7 | 11.5 | 6.2 | 266.6 | 39 | 63 | 4.8 | 0.0003 | 261.5 | 44.4 | #document ×147; div.act-card-stage.relative.flex in #act-3 ×92 | user-callback:FrameRequestCallback (65 ms) | 3 will-change, 3.8 MP of images |
| act-3 | 134 | 33.2 | 30.1 | 16.7 | 166.7 | 216.7 | 10.4 | 9.7 | 300 | 13 | 0 | 0 | 0 | 427.7 | 39.4 | #document ×50; div.act-card-stage.relative.flex in #act-3 ×28 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (5 ms) | 1 filter, 2 mask, 6 will-change, 9 infinite anims, 1 MP of images |
| beyond | 67 | 14 | 71.6 | 66.6 | 150 | 250 | 79.1 | 56.7 | 250 | 38 | 0 | 0 | 0.0108 | 700.9 | 46.9 | #document ×57; div.act-card-stage.relative.flex in #act-3 ×49 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (12 ms) | 7 mask, 1 will-change, 4.5 MP of images |
| writing | 53 | 19.3 | 51.9 | 33.3 | 116.7 | 333.4 | 41.5 | 35.8 | 333.4 | 19 | 28 | 9.1 | 0.0004 | 721.8 | 142.9 | #document ×54; div.act-card-stage.relative.flex in #act-4 ×54 | classic-script:/_next/static/chunks/19vq58ko3wg2v.js @ 19vq58ko3wg2v.js (57 ms) | 6 mask, 4 will-change |
| voices | 24 | 13.6 | 73.6 | 66.6 | 150 | 166.6 | 66.7 | 54.2 | 166.6 | 14 | 0 | 0 | 0 | 686.7 | 101.3 | #document ×24; div.act-card-stage.relative.flex in #act-4 ×22 | resolve-promise:Promise.resolve @ 3lv1a4umh4a4v.js (6 ms) | 1 mask, 3 will-change, 9 infinite anims, 1.8 MP of images |
| act-4 | 125 | 28.8 | 34.7 | 16.7 | 100 | 333.3 | 17.6 | 14.4 | 383.4 | 20 | 0 | 0 | 0.0009 | 484.4 | 31.6 | #document ×32; div.rdr2-module__R8wI0W__campSticky in #voices ×29 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (10 ms) | 2 canvas, 3 mask, 5 will-change, 21 infinite anims, 1.2 MP of images |
| principles | 14 | 5.6 | 177.4 | 183.4 | 400 | 400 | 85.7 | 71.4 | 400 | 10 | 0 | 0 | 0 | 1073.2 | 23.4 | #document ×15; div.act-card-stage.relative.flex in #act-4 ×15 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n (17 ms) | 11 will-change |
| contact | 6 | 4.2 | 236.1 | 250 | 566.6 | 566.6 | 83.3 | 66.7 | 566.6 | 3 | 0 | 0 | 0 | 607.8 | 20.5 | #document ×5; div.act-card-stage.relative.flex in #act-4 ×5 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (6 ms) | 4 mask, 1 MP of images |
| credits | 67 | 19 | 52.7 | 50 | 133.3 | 200 | 53.7 | 38.8 | 200 | 25 | 0 | 0 | 0 | 621 | 24.6 | #document ×33; div.act-card-stage.relative.flex in #act-4 ×17 |  |  |

### gl — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 384→2846 | 76 | 15.7 | 63.6 | 49.9 | 183.3 | 316.6 | 38.2 | 316.6 | 34 | 26 | 7.9 |
| act-2 | 6498→8495 | 90 | 19.9 | 50.4 | 16.7 | 150 | 433.3 | 30 | 433.3 | 30 | 0 | 0 |
| act-3 | 24780→26623 | 138 | 30.8 | 32.5 | 16.7 | 166.7 | 250 | 10.9 | 300 | 15 | 0 | 0 |
| act-4 | 34634→36631 | 129 | 28.8 | 34.8 | 16.7 | 100 | 333.3 | 14 | 383.4 | 21 | 0 | 0 |

### gl — longest animation frames (LoAF total 41088 ms, main-thread work 1708 ms, blocking 699 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 0.32 | top | 898 | 581 | 626 | 2 | 624 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 624 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 61.91 | contact | 564 | 0 | 7 | 1 | 6 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 6 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |
| 11.74 | act-2 | 436 | 0 | 9 | 1 | 8 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 8 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 6.54 | about | 399 | 0 | 46 | 3 | 43 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 8 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |
| 60.56 | principles | 384 | 0 | 1 | 1 | 0 | (no script) |  |

### gl — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 0.32 | top | 898 | 581 | 626 | 2 | 624 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 624 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 36.97 | films | 89 | 32 | 81 | 8 | 73 | user-callback:FrameRequestCallback 65 ms |  |
| 4.39 | act-1 | 77 | 26 | 75 | 0 | 75 | user-callback:IdleRequestCallback @ 1_p9cg58_0_83.js n 75 ms | `t=>{let a;if(o)return;let n=l>0&&performance.now()-i<l?(a=performance.now(),Math.max(0,s+2` |
| 51.13 | writing | 99 | 28 | 58 | 1 | 57 | classic-script:/_next/static/chunks/19vq58ko3wg2v.js @ 19vq58ko3wg2v.js 57 ms | `(globalThis.TURBOPACK\|\|(globalThis.TURBOPACK=[])).push(["object"==typeof document?document` |
| 6.54 | about | 399 | 0 | 46 | 3 | 43 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 8 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |

### gl — layout shifts (CLS total 0.0124, session 0.0108, 6 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 48.8 | 0.0095 | beyond | span[data-w] in #beyond ; span[data-w] in #beyond ; span[data-words=scrub][data-words-variant=default] in #beyond |
| 48.94 | 0.0013 | beyond | span.whitespace-nowrap in #beyond ; span.scene-caption__sep in #beyond ; span.scene-caption__film.world-face-rdr2 in #beyond |
| 55.39 | 0.0009 | act-4 | span.whitespace-nowrap in #act-4 ; span.scene-caption__film.world-face-rdr2 in #act-4 |
| 40.19 | 0.0003 | films | span[data-words-i] in #films |
| 51.43 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 51.87 | 0.0001 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |

### gl — visual pops (14; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 3.31 | 1453 | act-1 | 38 | 2.8 | 8.3 | change | 3.4 | 2 |
| 3.51 | 1685 | act-1 | 20 | 10.4 | 13.1 | change | 24.8 | 2 |
| 3.85 | 1694 | act-1 | 4 | 7.9 | 5.6 | change | 16.2 | 2 |
| 5.82 | 1778 | act-1 | 18 | 6.8 | 191.1 | change | 11.8 | 1 |
| 6.86 | 2436 | about | 35 | 11.9 | 333.1 | change | 19.5 | 1 |
| 14.29 | 7560 | act-2 | 18 | 3.8 | 119.7 | change | 5.3 | 1 |
| 14.56 | 7634 | act-2 | 39 | 5.5 | 172.3 | change | 7.1 | 2 |
| 14.81 | 7762 | work | 34 | 18.7 | 585 | change | 35.2 | 1 |
| 15.35 | 8065 | work | 22 | 8.4 | 262.3 | change | 13.2 | 1 |
| 38.14 | 23410 | films | 8 | 6.8 | 683 | change | 13.6 | 2 |
| 46.76 | 26026 | beyond | 22 | 12.8 | 1282.6 | change | 29.5 | 1 |
| 46.99 | 26252 | beyond | 10 | 9 | 898.5 | change | 17.3 | 1 |
| 47.40 | 26892 | beyond | 18 | 5.6 | 563.7 | change | 11.3 | 1 |
| 59.39 | 35725 | act-4 | 17 | 4.6 | 462.4 | change | 5.8 | 1 |

## Strips

- strips/intro.png
- strips/intro-landing.png
- strips/pop-intro-51.png
- strips/pop-intro-47.png
- strips/pop-intro-36.png
- strips/pop-intro-99.png
- strips/desktop-act-1.png
- strips/desktop-act-2.png
- strips/desktop-act-3.png
- strips/desktop-act-4.png
- strips/desktop-first-60s.png
- strips/pop-desktop-727.png
- strips/pop-desktop-555.png
- strips/pop-desktop-59.png
- strips/native-act-1.png
- strips/native-act-2.png
- strips/native-act-3.png
- strips/native-act-4.png
- strips/native-first-60s.png
- strips/pop-native-793.png
- strips/pop-native-129.png
- strips/pop-native-738.png
- strips/pop-native-665.png
- strips/alt-act-1.png
- strips/alt-act-2.png
- strips/alt-act-3.png
- strips/alt-act-4.png
- strips/alt-first-60s.png
- strips/pop-alt-161.png
- strips/pop-alt-419.png
- strips/pop-alt-34.png
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
- strips/pop-gl-157.png
- strips/pop-gl-607.png
- strips/pop-gl-67.png
