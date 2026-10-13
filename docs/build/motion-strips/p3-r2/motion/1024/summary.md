# Motion baseline — 2026-10-04T01:13:34.602Z

Base http://localhost:3161 · Chromium 141.0.7390.37 headless · 4 CPUs · screencast everyNthFrame=1.

> Headless Chromium rasterises in software (SwiftShader) on a few CPUs and pays for the screencast readback, so absolute frame times are pessimistic vs a real laptop/phone GPU. Read them as RELATIVE hotspots: which sections and transitions are worst. "busy∩jank %" = share of >33.4 ms frames that overlap a long animation frame in which the main thread really worked (script + style/layout/paint >= half the frame, or a >50 ms task); low = the frame was raster/composite-bound (the LoAF is the main thread waiting on the compositor), high = main-thread script/style/layout. "paint suspects" = what the section holds that is costly to raster (filters, blend, masks, canvas, video, image megapixels, infinite animations).

## Runs

| run | viewport | lenis | secs | rAF frames | fps | mean ms | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | LoAF block ms | busy∩jank % | CLS total | CLS (session) | pops | shots |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| intro | 1024x768 |  | 11.1 | 353 | 31.8 | 31.5 | 16.7 | 66.7 | 116.7 | 25.2 | 12.5 | 416.7 | 72 | 862 | 2.2 | 0.0094 | 0.0094 | 7 | 174 |
| desktop | 1024x768 | on | 67.5 | 1464 | 21.7 | 46.1 | 16.7 | 150 | 283.3 | 32.1 | 23.9 | 616.7 | 358 | 428 | 3.2 | 0.0133 | 0.0108 | 6 | 894 |
| native | 1024x768 | off | 62.2 | 872 | 14 | 71.3 | 33.3 | 250.1 | 533.2 | 40 | 32.8 | 983.3 | 285 | 272 | 5.4 | 0.0149 | 0.0108 | 40 | 917 |
| alt | 1024x768 | on | 66.2 | 1499 | 22.6 | 44.2 | 16.8 | 133.3 | 216.7 | 32.8 | 23.7 | 516.7 | 369 | 353 | 2.8 | 0.0139 | 0.0108 | 11 | 947 |
| rm | 1024x768 | off | 50 | 2990 | 59.8 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 66.7 | 3 | 30 | 100 | 0 | 0 | 0 | 424 |
| gl | 1024x768 | on | 66.4 | 1522 | 22.9 | 43.7 | 16.7 | 133.3 | 216.7 | 31.5 | 24.9 | 533.3 | 381 | 103 | 2.5 | 0.0139 | 0.0108 | 11 | 929 |

## Top 10 hotspots (by mean frame time; rm excluded)

| # | run | where | frames | fps | mean | p95 | p99 | >50 % | max | mean / run mean | LoAF block ms | likely cause |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | native | about | 6 | 2.3 | 441.7 | 983.3 | 983.3 | 83.3 | 983.3 | 6.2 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.6% waiting for the compositor — on screen: 1 mask [while scrolling: raster 411.3 ms/s, 23 paints/s — repainting: #document ×5; div.act-card-stage.relative.flex in #act-2 ×3 \| idle 60.2 fps, raster 0 ms/s, 0 paints/s] |
| 2 | native | principles | 16 | 4 | 250 | 950 | 950 | 56.3 | 950 | 3.5 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 98.9% waiting for the compositor — on screen: 7 will-change [while scrolling: raster 724.3 ms/s, 17.3 paints/s — repainting: #document ×16; div.relative in #principles ×9 \| idle 60.7 fps, raster 0 ms/s, 0 paints/s] |
| 3 | native | journey | 14 | 5.8 | 172.6 | 300 | 300 | 85.7 | 300 | 2.4 | 8 | raster/composite-bound: only 25% of janky frames overlap real main-thread work; the LoAFs are 97.3% waiting for the compositor — on screen: 1 mask, 2 will-change, 0.6 MP of images [while scrolling: raster 551.6 ms/s, 47.6 paints/s — repainting: #document ×14; div.act-card-stage.relative.flex in #act-2 ×11 \| idle 20.5 fps, raster 143 ms/s, 6.7 paints/s] |
| 4 | desktop | about | 10 | 6.3 | 158.3 | 450 | 450 | 80 | 450 | 3.4 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 97.6% waiting for the compositor — on screen: 1 mask [while scrolling: raster 849.5 ms/s, 41.1 paints/s — repainting: #document ×10; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×10 \| idle 60.2 fps, raster 0 ms/s, 0 paints/s] |
| 5 | native | beyond | 37 | 7 | 143.7 | 533.2 | 666.7 | 62.2 | 666.7 | 2 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.6% waiting for the compositor — on screen: 7 mask, 1 will-change, 4.5 MP of images [while scrolling: raster 486.2 ms/s, 29.7 paints/s — repainting: #document ×32; div.act-card-stage.relative.flex in #act-3 ×20 \| idle 60.7 fps, raster 0 ms/s, 0 paints/s] |
| 6 | alt | about | 12 | 7.5 | 133.3 | 466.6 | 466.6 | 66.7 | 466.6 | 3 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 96.6% waiting for the compositor — on screen: 1 mask [while scrolling: raster 894.4 ms/s, 31.3 paints/s — repainting: #document ×12; div.absolute.inset-0.will-change-transform in #top ×11 \| idle 60.2 fps, raster 0 ms/s, 0 paints/s] |
| 7 | native | kill-list | 19 | 8.3 | 120.2 | 300 | 300 | 68.4 | 300 | 1.7 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 97.5% waiting for the compositor — on screen: 3 will-change, 0.3 MP of images [while scrolling: raster 711.3 ms/s, 39.9 paints/s — repainting: #document ×19; div.relative.@container.will-change-[transform,opacity] in #header ×13 \| idle 60.3 fps, raster 0 ms/s, 0 paints/s] |
| 8 | native | act-1 transition | 50 | 8.4 | 118.7 | 283.3 | 983.3 | 52 | 983.3 | 1.7 | 1 | raster/composite-bound: only 3.2% of janky frames overlap real main-thread work; the LoAFs are 98.4% waiting for the compositor — on screen: 4 mask, 18 will-change, 14 infinite anims, 1.2 MP of images [while scrolling: raster 457.2 ms/s, 32.3 paints/s — repainting: #document ×28; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×14 \| idle 57 fps, raster 0 ms/s, 0 paints/s] |
| 9 | native | voices | 14 | 8.6 | 116.7 | 316.7 | 316.7 | 64.3 | 316.7 | 1.6 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 97.5% waiting for the compositor — on screen: 1 mask, 12 will-change, 9 infinite anims, 1.8 MP of images [while scrolling: raster 390.6 ms/s, 70.4 paints/s — repainting: #document ×13; div.relative in #principles ×8 \| idle 60.1 fps, raster 0 ms/s, 0 paints/s] |
| 10 | native | optuna-screener | 30 | 8.8 | 113.3 | 333.4 | 349.9 | 53.3 | 349.9 | 1.6 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.4% waiting for the compositor — on screen: 2 filter, 1.3 MP of images [while scrolling: raster 511.2 ms/s, 46.2 paints/s — repainting: #document ×30; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×17 \| idle 60.2 fps, raster 0 ms/s, 0 paints/s] |

## Idle probe (desktop: parked 2.5 s on each section, then 1.5 s traced standing still; high raster with few paints = a raster-heavy layer, many paints/s = continuous animation)

| section | idle fps | raster ms/s | paints/s | paint ms/s | style+layout ms/s | rAF JS ms/s | top repainting nodes |
|---|---|---|---|---|---|---|---|
| top | 59.5 | 19.7 | 16 | 2.4 | 3.2 | 20 | #document ×4; video.absolute.inset-0.size-full ×2; div.act-card-stage.relative.flex ×1 |
| act-1 | 57 | 0 | 0 | 0 | 9.2 | 21.4 |  |
| about | 60.2 | 0 | 0 | 0 | 11.6 | 25.7 |  |
| journey | 20.5 | 143 | 6.7 | 1.4 | 3.3 | 8 | #document ×2; div.pointer-events-none.absolute.inset-0 ×2; div.relative.mx-auto.w-full ×1 |
| act-2 | 60.6 | 0 | 0 | 0 | 0 | 15.6 |  |
| work | 60.4 | 0 | 0 | 0 | 0 | 17.7 |  |
| trading-algos | 60.3 | 0 | 0 | 0 | 11.7 | 27.9 |  |
| optuna-screener | 60.2 | 0 | 0 | 0 | 9.2 | 23.7 |  |
| experiment | 60.2 | 0 | 0 | 0 | 0 | 16.7 |  |
| systems | 60.7 | 0 | 0 | 0 | 0 | 14.6 |  |
| kill-list | 60.3 | 0 | 0 | 0 | 0 | 11.4 |  |
| films | 60.3 | 0 | 0 | 0 | 0 | 14.9 |  |
| act-3 | 60.6 | 0 | 0 | 0 | 0 | 13.8 |  |
| beyond | 60.7 | 0 | 0 | 0 | 0 | 18 |  |
| writing | 60.3 | 0 | 0 | 0 | 0 | 15 |  |
| voices | 60.1 | 0 | 0 | 0 | 9.8 | 24.8 |  |
| act-4 | 60.4 | 0 | 0 | 0 | 0 | 15.4 |  |
| principles | 60.7 | 0 | 0 | 0 | 0 | 15.9 |  |
| contact | 60.2 | 0 | 0 | 0 | 0 | 17.7 |  |
| credits | 60 | 0 | 0 | 0 | 12.5 | 27.8 |  |

## intro — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| intro:play-screen | 53 | 20.3 | 49.4 | 16.7 | 183.3 | 649.9 | 32.1 | 26.4 | 649.9 | 12 | 838 | 29.4 | 0.0094 | 299.2 | 39.4 | #document ×31; div#act-1-program.relative.px-gutter.pt-tier-group in #act-1 ×8 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (1057 ms) |  |
| intro:flight | 136 | 25.2 | 39.7 | 33.4 | 66.7 | 100 | 44.9 | 22.8 | 216.6 | 44 | 0 | 0 | 0 | 248.5 | 11.9 | #document ×26; div#act-1-program.relative.px-gutter.pt-tier-group in #act-1 ×20 | user-callback:FrameRequestCallback (5 ms) |  |
| intro:hold | 4 | 7.3 | 137.5 | 66.6 | 416.7 | 416.7 | 75 | 50 | 416.7 | 3 | 24 | 66.7 | 0 | 525.5 | 36.4 | #document ×4; div#intro-stage ×2 | user-callback:VideoFrameRequestCallback @ intro.js vn (7 ms) |  |
| intro:reveal | 5 | 8.3 | 120 | 116.6 | 183.4 | 183.4 | 100 | 100 | 183.4 | 5 | 0 | 0 | 0 | 185 | 5 | #document ×2; video.absolute.inset-0.size-full in #top ×1 |  |  |
| intro:titles | 149 | 45.2 | 22.1 | 16.7 | 50 | 66.7 | 10.1 | 3.4 | 100 | 6 | 0 | 0 | 0 | 8.2 | 2.4 | #document ×2; video.absolute.inset-0.size-full in #top ×1 | user-callback:FrameRequestCallback (5 ms) |  |
| top | 59 | 46.6 | 21.5 | 16.7 | 50 | 66.7 | 8.5 | 1.7 | 66.7 | 2 | 0 | 0 | 0 | 56.1 | 3.9 | #document ×3; div.hero-cap__in in #top ×2 |  | 1 video, 1 filter, 1 blend, 1 mask, 5 will-change, 1.2 MP of images |

### intro — marks and LoAF intro:warm → intro:titles-end

warm t=4.048s → titles-end t=9.844s: 25 LoAF, **25 > 50 ms** (max 405 ms, blocking 24 ms)

intro:arm@-3.166 · intro:ready@-2.776 · intro:play@0 · intro:flight@0.281 · intro:warm@4.048 · intro:hold@5.434 · intro:reveal@5.937 · intro:landing@5.937 · intro:titles@6.642 · intro:end@6.643 · intro:titles-end@9.844

### intro — longest animation frames (LoAF total 6416 ms, main-thread work 1160 ms, blocking 862 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| -2.63 | intro:play-screen | 827 | 719 | 809 | 1 | 808 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 760 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |
| 5.53 | intro:hold | 405 | 0 | 1 | 1 | 0 | (no script) |  |
| 0.14 | intro:flight | 215 | 0 | 0 | 0 | 0 | (no script) |  |
| 6.18 | intro:reveal | 175 | 0 | 0 | 0 | 0 | (no script) |  |
| -1.35 | intro:play-screen | 166 | 114 | 157 | 1 | 156 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 156 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |

### intro — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| -2.63 | intro:play-screen | 827 | 719 | 809 | 1 | 808 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 760 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |
| -1.35 | intro:play-screen | 166 | 114 | 157 | 1 | 156 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 156 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |
| -1.18 | intro:play-screen | 79 | 5 | 58 | 1 | 57 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 48 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |
| -0.85 | intro:play-screen | 144 | 0 | 53 | 2 | 51 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 19 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |
| -1.1 | intro:play-screen | 62 | 0 | 34 | 2 | 32 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 10 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |

### intro — layout shifts (CLS total 0.0094, session 0.0094, 1 shifts)

| t s | value | section | sources |
|---|---|---|---|
| -1.79 | 0.0094 | intro:play-screen | svg in #top ; svg in #top ; svg[data-instrument=jack-compass][data-lid=open] in #top |

### intro — visual pops (7; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| -1.06 | 0 | intro:play-screen | 0 | 6 | 410.5 | fill-in | 6.2 | 1 |
| 1.01 | 0 | intro:flight | 0 | 2.4 | 68.2 | change | 4.8 | 2 |
| 1.24 | 0 | intro:flight | 0 | 11.6 | 210.3 | change | 17.6 | 6 |
| 2.34 | 0 | intro:flight | 0 | 10.3 | 6.8 | change | 18.5 | 10 |
| 2.62 | 0 | intro:flight | 0 | 16.8 | 4 | change | 35.1 | 1 |
| 2.95 | 0 | intro:flight | 0 | 16.3 | 3.5 | change | 38.3 | 1 |
| 7.07 | 0 | intro:titles | 0 | 9.8 | 12.8 | fill-in | 9.2 | 1 |

## desktop — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 15 | 18 | 55.6 | 16.8 | 183.3 | 183.3 | 40 | 40 | 183.3 | 6 | 0 | 0 | 0 | 609.6 | 60 | #document ×10; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×10 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (9 ms) | 3 will-change, 0.6 MP of images |
| act-1 | 59 | 11.7 | 85.6 | 50 | 283.3 | 533.3 | 67.8 | 44.1 | 533.3 | 30 | 217 | 5 | 0 | 493.7 | 24.4 | #document ×24; div.absolute.inset-0.will-change-transform in #top ×21 | user-callback:TimerHandler:setTimeout @ 1_2f9ddauvl4s.js (258 ms) | 4 mask, 18 will-change, 14 infinite anims, 1.2 MP of images |
| about | 10 | 6.3 | 158.3 | 116.7 | 450 | 450 | 90 | 80 | 450 | 9 | 0 | 0 | 0 | 849.5 | 41.1 | #document ×10; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×10 | resolve-promise:Window.fetch.then @ 2eq9kz53ofs73.js (9 ms) | 1 mask |
| journey | 25 | 9.9 | 100.7 | 99.9 | 250 | 283.4 | 76 | 68 | 283.4 | 16 | 2 | 10.5 | 0 | 726 | 69.1 | #document ×25; video ×25 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (7 ms) | 1 mask, 2 will-change, 0.6 MP of images |
| act-2 | 86 | 19.9 | 50.2 | 33.2 | 183.3 | 216.8 | 33.7 | 26.7 | 216.8 | 24 | 11 | 3.4 | 0 | 497.8 | 70.7 | #document ×39; div.relative.@container in #work ×27 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (58 ms) | 2 filter, 3 mask, 20 will-change, 12 infinite anims, 2.4 MP of images |
| work | 66 | 34.1 | 29.3 | 16.7 | 66.6 | 166.7 | 16.7 | 7.6 | 166.7 | 6 | 0 | 0 | 0 | 351.2 | 51.2 | #document ×13; video ×13 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (6 ms) | 3 filter, 1 blend, 1 mask, 1 will-change, 1.6 MP of images |
| trading-algos | 48 | 18.2 | 54.9 | 16.7 | 200 | 300 | 35.4 | 33.3 | 300 | 17 | 0 | 0 | 0.0018 | 712.4 | 49.7 | #document ×24; video ×16 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (5 ms) | 2 filter, 0.1 MP of images |
| optuna-screener | 45 | 14.2 | 70.4 | 66.6 | 150 | 200 | 73.3 | 53.3 | 200 | 25 | 0 | 0 | 0 | 715.3 | 78.6 | #document ×45; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×45 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (6 ms) | 2 filter, 1.3 MP of images |
| experiment | 20 | 20.3 | 49.2 | 33.4 | 150 | 150 | 40 | 35 | 150 | 8 | 0 | 0 | 0 | 689.5 | 61 | #document ×16; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×13 |  |  |
| systems | 29 | 12.2 | 82.2 | 66.7 | 166.6 | 216.6 | 82.8 | 69 | 216.6 | 21 | 0 | 0 | 0.0001 | 865.2 | 44.1 | #document ×28; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×21 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (8 ms) | 1 will-change, 0.6 MP of images |
| kill-list | 26 | 11.2 | 89.1 | 100 | 183.3 | 200 | 80.8 | 73.1 | 200 | 18 | 0 | 0 | 0 | 841.7 | 44.9 | #document ×23; div.relative.@container.will-change-[transform,opacity] in #header ×21 |  | 3 will-change, 0.3 MP of images |
| films | 435 | 30.8 | 32.5 | 16.7 | 100 | 150 | 21.6 | 14 | 166.7 | 67 | 75 | 6.4 | 0 | 417 | 72.6 | #document ×258; div.act-card-stage.relative.flex in #act-3 ×127 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (144 ms) | 4 will-change, 3.8 MP of images |
| act-3 | 154 | 40.4 | 24.8 | 16.7 | 66.7 | 199.9 | 7.8 | 5.2 | 200 | 10 | 0 | 0 | 0 | 361.1 | 45.9 | #document ×57; div.plate-depth-far in #beyond ×29 |  | 1 filter, 3 mask, 6 will-change, 1 MP of images |
| beyond | 90 | 18.7 | 53.5 | 33.4 | 166.7 | 283.4 | 47.8 | 34.4 | 283.4 | 28 | 0 | 0 | 0.0108 | 678.5 | 59.8 | #document ×81; div.act-card-stage.relative.flex in #act-3 ×48 |  | 7 mask, 1 will-change, 4.5 MP of images |
| writing | 61 | 21.8 | 45.9 | 33.3 | 133.3 | 199.9 | 42.6 | 29.5 | 199.9 | 18 | 0 | 3.8 | 0.0007 | 729 | 154.3 | #document ×61; div.act-card-stage.relative.flex in #act-4 ×61 | classic-script:/_next/static/chunks/19vq58ko3wg2v.js @ 19vq58ko3wg2v.js (31 ms) | 6 mask, 4 will-change |
| voices | 23 | 12.9 | 77.5 | 66.6 | 133.4 | 300.1 | 78.3 | 56.5 | 300.1 | 12 | 123 | 16.7 | 0 | 594.4 | 110.5 | #document ×21; div.act-card-stage.relative.flex in #act-4 ×21 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (260 ms) | 1 mask, 12 will-change, 9 infinite anims, 1.8 MP of images |
| act-4 | 113 | 27.3 | 36.6 | 16.7 | 116.7 | 250 | 21.2 | 19.5 | 283.3 | 18 | 0 | 0 | 0 | 538.1 | 44.3 | #document ×45; div.rdr2-module__R8wI0W__campSticky in #voices ×33 | user-callback:FrameRequestCallback @ 02frwek6itxvz.js f (21 ms) | 2 canvas, 3 mask, 26 will-change, 21 infinite anims, 1.2 MP of images |
| principles | 59 | 19.1 | 52.3 | 16.7 | 283.3 | 366.7 | 18.6 | 16.9 | 366.7 | 9 | 0 | 0 | 0 | 714.2 | 30.2 | #document ×44; div.act-card-stage.relative.flex in #act-4 ×44 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (9 ms) | 7 will-change |
| contact | 4 | 2.6 | 383.3 | 416.7 | 616.7 | 616.7 | 100 | 100 | 616.7 | 4 | 0 | 0 | 0 | 874.6 | 17.6 | #document ×4; div.act-card-stage.relative.flex in #act-4 ×4 | user-callback:IntersectionObserverCallback @ 2hx1u5zg-b95a.js (6 ms) | 4 mask, 1 MP of images |
| credits | 96 | 26.2 | 38.2 | 33.3 | 116.6 | 316.7 | 21.9 | 12.5 | 316.7 | 12 | 0 | 0 | 0 | 548.7 | 18.5 | #document ×28; div.act-card-stage.relative.flex in #act-4 ×17 | event-listener:#document.onscroll @ 1is0gg5e6lopl.js tx (17 ms) | 1 will-change |

### desktop — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 384→2846 | 64 | 10.8 | 92.7 | 50 | 283.3 | 533.3 | 46.9 | 533.3 | 35 | 217 | 4.5 |
| act-2 | 6188→8185 | 94 | 20.4 | 48.9 | 16.8 | 183.3 | 216.8 | 26.6 | 216.8 | 27 | 11 | 3.2 |
| act-3 | 24829→26672 | 179 | 42 | 23.8 | 16.7 | 50.1 | 199.9 | 5 | 200 | 11 | 0 | 0 |
| act-4 | 34626→36623 | 122 | 26.8 | 37.3 | 16.7 | 116.7 | 283.3 | 18.9 | 283.3 | 19 | 0 | 0 |

### desktop — longest animation frames (LoAF total 40474 ms, main-thread work 1418 ms, blocking 428 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 62.28 | contact | 625 | 0 | 7 | 1 | 6 | user-callback:IntersectionObserverCallback @ 2hx1u5zg-b95a.js 6 ms | `e=>{let t=r;for(let n of e)n.isIntersecting&&(t=n.target.id);t!==r&&(r=t,i.forEach(e=>e())` |
| 2.47 | act-1 | 525 | 0 | 1 | 1 | 0 | (no script) |  |
| 1.13 | act-1 | 453 | 217 | 259 | 1 | 258 | user-callback:TimerHandler:setTimeout @ 1_2f9ddauvl4s.js 258 ms | `()=>{K=0,U&&eP(U)},180)));_&&_.parentElement!==e.el&&(e.el.appendChild(_),eM(e),V?.disconn` |
| 59.02 | act-4 | 432 | 0 | 11 | 1 | 10 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v 10 ms | `()=>{let i=e.MotionGlobalConfig.useManualTiming,o=i?a.timestamp:performance.now();n=!1,i\|\|` |
| 6.04 | about | 429 | 0 | 27 | 2 | 25 | resolve-promise:Window.fetch.then @ 2eq9kz53ofs73.js 9 ms |  |

### desktop — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 1.13 | act-1 | 453 | 217 | 259 | 1 | 258 | user-callback:TimerHandler:setTimeout @ 1_2f9ddauvl4s.js 258 ms | `()=>{K=0,U&&eP(U)},180)));_&&_.parentElement!==e.el&&(e.el.appendChild(_),eM(e),V?.disconn` |
| 53.39 | voices | 120 | 68 | 115 | 1 | 114 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r 114 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 53.52 | voices | 106 | 55 | 99 | 1 | 98 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r 98 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 28.8 | films | 115 | 25 | 73 | 2 | 71 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v 71 ms | `()=>{let i=e.MotionGlobalConfig.useManualTiming,o=i?a.timestamp:performance.now();n=!1,i\|\|` |
| 36.35 | films | 78 | 28 | 70 | 1 | 69 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r 69 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |

### desktop — layout shifts (CLS total 0.0133, session 0.0108, 9 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 48.77 | 0.0095 | beyond | span[data-w] in #beyond ; span[data-w] in #beyond ; span[data-words=scrub][data-words-variant=default] in #beyond |
| 17.35 | 0.0018 | trading-algos | span.scene-caption__film.world-face-idiots in #trading-algos ; p.scene-caption.mb-tier-group[data-caption=cap.trading-algos][data-caption-world=idiots] in #trading-algos |
| 48.98 | 0.0013 | beyond | span.whitespace-nowrap in #beyond ; span.scene-caption__sep in #beyond ; span.scene-caption__film.world-face-rdr2 in #beyond |
| 51.42 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 52.27 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 51.86 | 0.0001 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 24.46 | 0.0001 | systems | h3.type-heading.text-fg.lg:col-span-3 in #systems |
| 52.72 | 0.0001 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |

### desktop — visual pops (6; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 5.65 | 1725 | act-1 | 25 | 6.5 | 210.6 | change | 12.1 | 3 |
| 7.08 | 2530 | about | 11 | 9.7 | 261.7 | change | 15.9 | 1 |
| 14.19 | 7300 | act-2 | 17 | 9.2 | 462.1 | change | 18.4 | 3 |
| 34.96 | 22315 | films | 15 | 13.2 | 56 | change | 23.7 | 1 |
| 35.31 | 22480 | films | 17 | 10.3 | 43.8 | change | 19.3 | 1 |
| 43.53 | 25367 | act-3 | 16 | 14.7 | 7 | change | 45.7 | 2 |

## native — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 16 | 20.9 | 47.9 | 16.7 | 333.3 | 333.3 | 18.8 | 18.8 | 333.3 | 3 | 0 | 0 | 0 | 250.5 | 37.8 | #document ×10; header.fixed.inset-x-0.top-0 in #header ×8 |  | 3 will-change, 0.6 MP of images |
| act-1 | 47 | 11.5 | 86.9 | 50.1 | 266.7 | 283.3 | 59.6 | 51.1 | 283.3 | 19 | 1 | 3.6 | 0 | 457.2 | 32.3 | #document ×28; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×14 | user-callback:TimerHandler:setTimeout @ 1_2f9ddauvl4s.js (45 ms) | 4 mask, 18 will-change, 14 infinite anims, 1.2 MP of images |
| about | 6 | 2.3 | 441.7 | 400 | 983.3 | 983.3 | 100 | 83.3 | 983.3 | 4 | 0 | 0 | 0 | 411.3 | 23 | #document ×5; div.act-card-stage.relative.flex in #act-2 ×3 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (6 ms) | 1 mask |
| journey | 14 | 5.8 | 172.6 | 183.3 | 300 | 300 | 85.7 | 85.7 | 300 | 12 | 8 | 25 | 0 | 551.6 | 47.6 | #document ×14; div.act-card-stage.relative.flex in #act-2 ×11 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (13 ms) | 1 mask, 2 will-change, 0.6 MP of images |
| act-2 | 35 | 10.1 | 99 | 83.4 | 233.3 | 233.4 | 74.3 | 62.9 | 233.4 | 22 | 120 | 7.7 | 0 | 593.7 | 76.2 | #document ×31; div.absolute.inset-x-0.top-0 in #act-2 ×14 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (182 ms) | 2 filter, 3 mask, 20 will-change, 12 infinite anims, 2.4 MP of images |
| work | 58 | 33.1 | 30.2 | 16.7 | 100.1 | 250 | 15.5 | 12.1 | 250 | 8 | 0 | 0 | 0 | 264.6 | 42.9 | #document ×10; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×6 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (32 ms) | 3 filter, 1 blend, 1 mask, 1 will-change, 1.6 MP of images |
| trading-algos | 48 | 19.3 | 51.7 | 16.7 | 233.3 | 283.4 | 25 | 20.8 | 283.4 | 11 | 0 | 0 | 0.0018 | 565.8 | 36.2 | #document ×24; div.act-card-stage.relative.flex in #act-2 ×13 | user-callback:FrameRequestCallback (5 ms) | 2 filter, 0.1 MP of images |
| optuna-screener | 30 | 8.8 | 113.3 | 83.3 | 333.4 | 349.9 | 60 | 53.3 | 349.9 | 16 | 0 | 0 | 0 | 511.2 | 46.2 | #document ×30; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×17 | user-callback:IntersectionObserverCallback @ 2hx1u5zg-b95a.js (6 ms) | 2 filter, 1.3 MP of images |
| experiment | 34 | 33.4 | 29.9 | 16.7 | 116.6 | 216.6 | 11.8 | 11.8 | 216.6 | 3 | 0 | 0 | 0 | 198.7 | 29.5 | #document ×9; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×8 |  |  |
| systems | 24 | 10.2 | 97.9 | 66.7 | 233.4 | 266.6 | 62.5 | 62.5 | 266.6 | 15 | 0 | 0 | 0.0001 | 746.9 | 32.3 | #document ×21; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×13 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (5 ms) | 1 will-change, 0.6 MP of images |
| kill-list | 19 | 8.3 | 120.2 | 83.4 | 300 | 300 | 73.7 | 68.4 | 300 | 14 | 0 | 0 | 0 | 711.3 | 39.9 | #document ×19; div.relative.@container.will-change-[transform,opacity] in #header ×13 | user-callback:FrameRequestCallback (36 ms) | 3 will-change, 0.3 MP of images |
| films | 232 | 21.7 | 46 | 16.7 | 166.7 | 283.3 | 31.9 | 21.6 | 300.1 | 54 | 122 | 12.2 | 0.0006 | 472.5 | 49.9 | #document ×167; svg.pointer-events-none.absolute.inset-0 viewBox=0 0 1778 1000 in #films ×61 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (131 ms) | 4 will-change, 3.8 MP of images |
| act-3 | 62 | 20.8 | 48.1 | 16.7 | 166.7 | 216.7 | 27.4 | 25.8 | 216.7 | 17 | 0 | 0 | 0 | 393.2 | 29.8 | #document ×25; div.act-card-stage.relative.flex in #act-3 ×11 |  | 1 filter, 3 mask, 6 will-change, 1 MP of images |
| beyond | 37 | 7 | 143.7 | 83.3 | 533.2 | 666.7 | 75.7 | 62.2 | 666.7 | 24 | 0 | 0 | 0.0108 | 486.2 | 29.7 | #document ×32; div.act-card-stage.relative.flex in #act-3 ×20 | event-listener:#document.onscroll @ 1is0gg5e6lopl.js tx (9 ms) | 7 mask, 1 will-change, 4.5 MP of images |
| writing | 33 | 11.6 | 86.4 | 49.9 | 266.7 | 266.7 | 57.6 | 45.5 | 266.7 | 14 | 1 | 10.5 | 0.0007 | 614.1 | 83.2 | #document ×33; svg.absolute.inset-0.size-full viewBox=0 0 400 500[data-motif=journal-landscape] in #writing ×21 | classic-script:/_next/static/chunks/19vq58ko3wg2v.js @ 19vq58ko3wg2v.js (34 ms) | 6 mask, 4 will-change |
| voices | 14 | 8.6 | 116.7 | 100 | 316.7 | 316.7 | 71.4 | 64.3 | 316.7 | 9 | 0 | 0 | 0 | 390.6 | 70.4 | #document ×13; div.relative in #principles ×8 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (11 ms) | 1 mask, 12 will-change, 9 infinite anims, 1.8 MP of images |
| act-4 | 57 | 17.4 | 57.6 | 16.7 | 200.1 | 349.9 | 33.3 | 29.8 | 349.9 | 18 | 20 | 10.5 | 0.0009 | 467.8 | 40.5 | #document ×28; div.act-card-stage.relative.flex in #act-4 ×8 | resolve-promise:Promise.resolve @ 2eq9kz53ofs73.js (59 ms) | 2 canvas, 3 mask, 26 will-change, 21 infinite anims, 1.2 MP of images |
| principles | 16 | 4 | 250 | 133.3 | 950 | 950 | 68.8 | 56.3 | 950 | 8 | 0 | 0 | 0 | 724.3 | 17.3 | #document ×16; div.relative in #principles ×9 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (25 ms) | 7 will-change |
| contact | 5 | 3.5 | 286.6 | 200 | 716.6 | 716.6 | 80 | 80 | 716.6 | 4 | 0 | 0 | 0 | 835.9 | 35.6 | #document ×5; div.relative.grid.grid-cols-1 in #principles ×3 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (5 ms) | 4 mask, 1 MP of images |
| credits | 85 | 25.4 | 39.4 | 33.3 | 100.1 | 299.9 | 23.5 | 14.1 | 299.9 | 10 | 0 | 0 | 0 | 500.3 | 18.5 | #document ×25; footer#credits.relative.isolate.z-(--z-main) in #credits ×15 | user-callback:FrameRequestCallback @ 29bl5kt6u0_n3.js (5 ms) | 1 will-change |

### native — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 384→2846 | 50 | 8.4 | 118.7 | 50.1 | 283.3 | 983.3 | 52 | 983.3 | 22 | 1 | 3.2 |
| act-2 | 6188→8185 | 36 | 10.1 | 99.1 | 100 | 233.3 | 233.4 | 63.9 | 233.4 | 24 | 120 | 7.4 |
| act-3 | 24829→26672 | 66 | 19.2 | 52 | 16.7 | 183.3 | 283.2 | 28.8 | 283.2 | 21 | 0 | 0 |
| act-4 | 34626→36623 | 60 | 15.3 | 65.3 | 16.7 | 233.4 | 566.6 | 30 | 566.6 | 19 | 20 | 9.5 |

### native — longest animation frames (LoAF total 45162 ms, main-thread work 922 ms, blocking 272 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 5.73 | about | 971 | 0 | 7 | 1 | 6 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 6 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |
| 56.19 | principles | 944 | 0 | 0 | 0 | 0 | (no script) |  |
| 55.01 | principles | 811 | 0 | 0 | 0 | 0 | (no script) |  |
| 4.91 | about | 808 | 0 | 0 | 0 | 0 | (no script) |  |
| 58.15 | contact | 704 | 0 | 2 | 2 | 0 | (no script) |  |

### native — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 12.18 | act-2 | 181 | 120 | 169 | 0 | 169 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r 169 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 33.27 | films | 80 | 30 | 79 | 1 | 78 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r 78 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 53 | act-4 | 331 | 20 | 66 | 1 | 65 | resolve-promise:Promise.resolve @ 2eq9kz53ofs73.js 59 ms |  |
| 3.33 | act-1 | 61 | 1 | 46 | 1 | 45 | user-callback:TimerHandler:setTimeout @ 1_2f9ddauvl4s.js 45 ms | `()=>{K=0,U&&eP(U)},180)));_&&_.parentElement!==e.el&&(e.el.appendChild(_),eM(e),V?.disconn` |
| 25.57 | kill-list | 124 | 0 | 39 | 8 | 31 | user-callback:FrameRequestCallback 31 ms |  |

### native — layout shifts (CLS total 0.0149, session 0.0108, 11 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 44.02 | 0.0095 | beyond | span[data-w] in #beyond ; span[data-w] in #beyond ; span[data-words=scrub][data-words-variant=default] in #beyond |
| 16.27 | 0.0018 | trading-algos | span.scene-caption__film.world-face-idiots in #trading-algos ; p.scene-caption.mb-tier-group[data-caption=cap.trading-algos][data-caption-world=idiots] in #trading-algos |
| 44.69 | 0.0013 | beyond | span.whitespace-nowrap in #beyond ; span.scene-caption__sep in #beyond ; span.scene-caption__film.world-face-rdr2 in #beyond |
| 50.46 | 0.0009 | act-4 | span.whitespace-nowrap in #act-4 ; span.scene-caption__film.world-face-rdr2 in #act-4 |
| 36.59 | 0.0006 | films | span[data-words-i] in #films |
| 46.64 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 48.24 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 47.96 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |

### native — visual pops (40; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 1.22 | 200 | act-1 | 0 | 2.1 | 17.5 | change | 2.2 | 1 |
| 2.66 | 1200 | act-1 | 0 | 10.7 | 20.9 | change | 20.3 | 2 |
| 2.93 | 1500 | act-1 | 0 | 15.4 | 25.9 | change | 49.6 | 3 |
| 3.27 | 1500 | act-1 | 0 | 3.9 | 3.2 | change | 5.8 | 1 |
| 5.41 | 2500 | about | 0 | 3.2 | 23.1 | change | 2.8 | 1 |
| 7.77 | 3400 | journey | 0 | 6.5 | 650.9 | change | 10 | 1 |
| 8.66 | 4300 | journey | 0 | 4.7 | 472 | change | 6.1 | 1 |
| 9.53 | 4900 | journey | 0 | 2.2 | 7.3 | change | 4.5 | 1 |
| 9.81 | 5300 | journey | 0 | 2.5 | 3.2 | change | 5.7 | 1 |
| 11.41 | 6900 | act-2 | 0 | 31.9 | 33.7 | change | 41.7 | 2 |
| 11.73 | 7000 | act-2 | 0 | 10.2 | 8.4 | change | 21.1 | 1 |
| 12.01 | 7000 | act-2 | 0 | 6.4 | 4.9 | change | 12.2 | 1 |
| 13.20 | 7300 | act-2 | 0 | 8.2 | 15.1 | change | 14.3 | 1 |
| 13.46 | 7500 | work | 0 | 17.3 | 25.9 | change | 38.1 | 1 |
| 18.47 | 12000 | optuna-screener | 0 | 5.2 | 12.5 | fill-in | 9.6 | 1 |
| 19.47 | 13100 | optuna-screener | 0 | 3.3 | 15.5 | change | 1 | 1 |
| 19.71 | 13200 | optuna-screener | 0 | 2.4 | 11.2 | change | 1.1 | 1 |
| 19.87 | 13200 | optuna-screener | 0 | 6.9 | 20.3 | change | 15.1 | 1 |
| 20.30 | 13400 | optuna-screener | 0 | 7.2 | 11.3 | change | 15.6 | 1 |
| 23.20 | 16400 | systems | 0 | 2.1 | 42.5 | fill-in | 2 | 1 |
| 24.11 | 17100 | systems | 0 | 3.7 | 3.3 | change | 9.4 | 1 |
| 28.00 | 20700 | films | 0 | 4.4 | 4.1 | fill-in | 7.8 | 1 |
| 30.38 | 21600 | films | 0 | 15.2 | 195.6 | fill-in | 8.9 | 1 |
| 30.61 | 21800 | films | 0 | 7 | 66.4 | change | 6.5 | 1 |
| 32.71 | 22600 | films | 0 | 3.6 | 22.6 | fill-in | 5.8 | 1 |
| 34.98 | 23600 | films | 0 | 2.7 | 77.8 | fill-in | 2.5 | 1 |
| 38.79 | 25300 | act-3 | 0 | 4.3 | 5.3 | change | 8.1 | 1 |
| 39.55 | 25600 | act-3 | 0 | 7.4 | 10.2 | change | 15 | 1 |
| 39.89 | 25600 | act-3 | 0 | 14.8 | 20.4 | change | 14.2 | 2 |
| 41.17 | 26200 | beyond | 0 | 8.2 | 5.2 | change | 14.3 | 1 |
| 42.28 | 27200 | beyond | 0 | 30.9 | 19 | change | 18.3 | 1 |
| 45.72 | 30300 | writing | 0 | 2.9 | 285.3 | change | 2.7 | 1 |
| 46.14 | 30500 | writing | 0 | 5 | 504.7 | change | 5 | 4 |
| 50.34 | 34200 | act-4 | 0 | 2.2 | 10.6 | change | 5.2 | 1 |
| 50.51 | 34200 | act-4 | 0 | 3.6 | 17.4 | change | 6.3 | 1 |
| 52.00 | 35600 | act-4 | 0 | 16.6 | 36.3 | change | 49.8 | 5 |
| 54.13 | 36500 | principles | 0 | 11.5 | 9.8 | change | 6.3 | 1 |
| 54.36 | 36600 | principles | 0 | 12.1 | 12 | change | 7.2 | 1 |
| 54.66 | 36800 | principles | 0 | 22.2 | 19 | change | 13.6 | 2 |
| 56.32 | 37100 | principles | 0 | 4.2 | 7.7 | change | 7.5 | 1 |

## alt — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 14 | 19.5 | 51.2 | 16.7 | 183.3 | 183.3 | 28.6 | 28.6 | 183.3 | 4 | 0 | 0 | 0 | 489.8 | 44.7 | #document ×8; div.absolute.inset-0.will-change-transform in #top ×8 |  | 3 will-change, 0.6 MP of images |
| act-1 | 62 | 12.7 | 79 | 66.7 | 216.6 | 366.6 | 69.4 | 58.1 | 366.6 | 39 | 230 | 4.7 | 0 | 509 | 27.3 | #document ×27; div.absolute.inset-0.will-change-transform in #top ×25 | user-callback:TimerHandler:setTimeout @ 1_2f9ddauvl4s.js (267 ms) | 3 mask, 18 will-change, 14 infinite anims, 1.3 MP of images |
| about | 12 | 7.5 | 133.3 | 116.7 | 466.6 | 466.6 | 75 | 66.7 | 466.6 | 8 | 0 | 0 | 0 | 894.4 | 31.3 | #document ×12; div.absolute.inset-0.will-change-transform in #top ×11 | resolve-promise:Window.fetch.then @ 2eq9kz53ofs73.js (25 ms) | 1 mask |
| journey | 29 | 11.4 | 87.9 | 83.3 | 183.3 | 233.2 | 86.2 | 75.9 | 233.2 | 22 | 46 | 16 | 0 | 719.6 | 55.3 | #document ×29; div.act-card-stage.relative.flex in #act-2 ×29 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (87 ms) | 1 mask, 2 will-change, 0.6 MP of images |
| act-2 | 113 | 28.6 | 35 | 16.7 | 133.3 | 183.2 | 25.7 | 11.5 | 216.7 | 17 | 0 | 0 | 0 | 385.6 | 38.2 | #document ×26; div.absolute.inset-0.will-change-transform in #top ×22 |  | 1 filter, 3 mask, 17 will-change, 12 infinite anims, 1.9 MP of images |
| work | 52 | 24 | 41.7 | 16.8 | 116.6 | 299.9 | 26.9 | 19.2 | 299.9 | 11 | 0 | 0 | 0 | 545.5 | 44.3 | #document ×13; div.act-card-stage.relative.flex in #act-2 ×13 |  | 4 filter, 1 blend, 1 mask, 1 will-change, 0.8 MP of images |
| trading-algos | 43 | 16.4 | 60.8 | 33.4 | 133.4 | 200 | 46.5 | 39.5 | 200 | 18 | 0 | 0 | 0.0018 | 808.7 | 45.5 | #document ×24; div.act-card-stage.relative.flex in #act-2 ×18 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (11 ms) | 2 filter, 0.1 MP of images |
| optuna-screener | 62 | 19.8 | 50.5 | 33.4 | 116.7 | 183.3 | 46.8 | 40.3 | 183.3 | 22 | 0 | 0 | 0 | 713.6 | 87.1 | #document ×60; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×56 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (5 ms) | 3 filter, 1 mask, 1 will-change, 1.3 MP of images |
| experiment | 33 | 30.5 | 32.8 | 16.7 | 100 | 116.7 | 24.2 | 12.1 | 116.7 | 5 | 0 | 0 | 0 | 637.9 | 122.8 | #document ×33; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×32 |  |  |
| systems | 27 | 11.8 | 84.6 | 83.3 | 183.3 | 233.4 | 77.8 | 66.7 | 233.4 | 19 | 0 | 0 | 0 | 852.7 | 32 | #document ×26; div.relative.@container.overflow-clip in #header ×16 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (5 ms) | 0.6 MP of images |
| kill-list | 30 | 12.7 | 78.9 | 66.7 | 183.4 | 200 | 90 | 56.7 | 200 | 21 | 0 | 0 | 0 | 840.5 | 28.7 | #document ×27; div.relative.@container.overflow-clip in #header ×14 |  | 2 will-change, 0.1 MP of images |
| films | 419 | 29.8 | 33.6 | 16.7 | 100 | 216.6 | 20.3 | 14.1 | 250 | 55 | 59 | 7.1 | 0 | 458.3 | 41.6 | #document ×196; div.act-card-stage.relative.flex in #act-3 ×68 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (62 ms) | 2 mask, 6 will-change, 3.3 MP of images |
| act-3 | 152 | 38.5 | 26 | 16.7 | 83.3 | 150 | 11.8 | 7.9 | 166.6 | 14 | 0 | 0 | 0 | 373.4 | 44.8 | #document ×47; div.act-card-stage.relative.flex in #act-3 ×20 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t (5 ms) | 1 filter, 2 mask, 9 will-change, 1 MP of images |
| beyond | 67 | 13.9 | 72.1 | 50 | 166.6 | 483.3 | 73.1 | 49.3 | 483.3 | 34 | 0 | 0 | 0.0108 | 819.1 | 53.8 | #document ×60; div.act-card-stage.relative.flex in #act-3 ×52 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (6 ms) | 7 mask, 1 will-change, 3.5 MP of images |
| writing | 59 | 21.9 | 45.8 | 33.3 | 116.6 | 166.6 | 44.1 | 32.2 | 166.6 | 22 | 0 | 0 | 0.0004 | 708.2 | 79.3 | #document ×58; div.act-card-stage.relative.flex in #act-4 ×58 |  | 5 mask, 3 will-change |
| voices | 34 | 22.9 | 43.6 | 33.4 | 100 | 100 | 47.1 | 29.4 | 100 | 10 | 18 | 12.5 | 0 | 426.1 | 62 | #document ×34; div.act-card-stage.relative.flex in #act-4 ×34 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (62 ms) | 9 will-change, 9 infinite anims, 1.8 MP of images |
| act-4 | 140 | 34.9 | 28.7 | 16.7 | 99.9 | 200 | 14.3 | 10 | 216.7 | 12 | 0 | 0 | 0.0009 | 312.2 | 34.1 | #document ×34; div.act-card-stage.relative.flex in #act-4 ×18 |  | 1 canvas, 1 blend, 2 mask, 27 will-change, 21 infinite anims, 1.2 MP of images |
| principles | 51 | 17.6 | 56.9 | 16.7 | 216.7 | 383.3 | 31.4 | 29.4 | 383.3 | 15 | 0 | 0 | 0 | 866.3 | 19.7 | #document ×26; div.act-card-stage.relative.flex in #act-4 ×26 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (11 ms) | 3 mask |
| contact | 5 | 3.8 | 260 | 216.7 | 516.7 | 516.7 | 100 | 100 | 516.7 | 5 | 0 | 0 | 0 | 862.3 | 23.1 | #document ×5; div.act-card-stage.relative.flex in #act-4 ×5 |  | 4 mask, 0.5 MP of images |
| credits | 95 | 26.5 | 37.7 | 33.3 | 66.7 | 233.4 | 29.5 | 14.7 | 233.4 | 16 | 0 | 0 | 0 | 592.2 | 44.7 | #document ×61; div.flex.-translate-x-1/2.-translate-y-1/2[data-motif=bracket-monogram] in #contact ×37 |  |  |

### alt — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 384→2817 | 66 | 11.8 | 84.8 | 66.7 | 216.7 | 466.6 | 59.1 | 466.6 | 43 | 230 | 4.3 |
| act-2 | 6159→8156 | 133 | 30.6 | 32.7 | 16.7 | 100 | 183.2 | 9.8 | 216.7 | 19 | 0 | 0 |
| act-3 | 24871→26714 | 156 | 31.8 | 31.4 | 16.7 | 133.3 | 183.4 | 10.3 | 483.3 | 19 | 0 | 0 |
| act-4 | 34493→36490 | 163 | 37 | 27 | 16.7 | 83.3 | 200 | 8.6 | 216.7 | 13 | 0 | 0 |

### alt — longest animation frames (LoAF total 38285 ms, main-thread work 1009 ms, blocking 353 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 61.32 | contact | 510 | 0 | 1 | 1 | 0 | (no script) |  |
| 45.86 | beyond | 474 | 0 | 1 | 1 | 0 | (no script) |  |
| 5.86 | about | 459 | 0 | 42 | 1 | 41 | resolve-promise:Window.fetch.then @ 2eq9kz53ofs73.js 25 ms |  |
| 2.14 | act-1 | 368 | 0 | 1 | 1 | 0 | (no script) |  |
| 59.7 | principles | 367 | 0 | 1 | 1 | 0 | (no script) |  |

### alt — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 2.82 | act-1 | 329 | 230 | 268 | 1 | 267 | user-callback:TimerHandler:setTimeout @ 1_2f9ddauvl4s.js 267 ms | `()=>{K=0,U&&eP(U)},180)));_&&_.parentElement!==e.el&&(e.el.appendChild(_),eM(e),V?.disconn` |
| 9.28 | journey | 122 | 45 | 88 | 1 | 87 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r 87 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 27.48 | films | 110 | 17 | 64 | 2 | 62 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v 62 ms | `()=>{let i=e.MotionGlobalConfig.useManualTiming,o=i?a.timestamp:performance.now();n=!1,i\|\|` |
| 52.91 | voices | 77 | 18 | 63 | 1 | 62 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r 62 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 35.86 | films | 59 | 9 | 54 | 1 | 53 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r 53 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |

### alt — layout shifts (CLS total 0.0139, session 0.0108, 7 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 48.48 | 0.0095 | beyond | span[data-w] in #beyond ; span[data-w] in #beyond ; span[data-words=scrub][data-words-variant=default] in #beyond |
| 16.93 | 0.0018 | trading-algos | span.scene-caption__film.world-face-idiots in #trading-algos ; p.scene-caption.mb-tier-group[data-caption=cap.trading-algos][data-caption-world=idiots] in #trading-algos |
| 48.66 | 0.0013 | beyond | span.whitespace-nowrap in #beyond ; span.scene-caption__film.world-face-rdr2 in #beyond |
| 54.78 | 0.0009 | act-4 | span.whitespace-nowrap in #act-4 ; span.scene-caption__film.world-face-rdr2 in #act-4 |
| 51.21 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 51.53 | 0.0001 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 52.42 | 0 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |

### alt — visual pops (11; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 5.38 | 1658 | act-1 | 11 | 4.5 | 129.8 | change | 7.4 | 1 |
| 6.60 | 2480 | about | 38 | 9.2 | 251.8 | change | 17.3 | 1 |
| 13.94 | 7396 | work | 30 | 8.2 | 818.2 | change | 14.1 | 4 |
| 14.12 | 7500 | work | 26 | 15.2 | 1524.4 | change | 29.1 | 2 |
| 32.19 | 21741 | films | 30 | 4.6 | 456.1 | change | 8.7 | 1 |
| 33.25 | 22294 | films | 7 | 28.4 | 4.2 | change | 37 | 1 |
| 34.79 | 22389 | films | 25 | 12.1 | 1209.1 | change | 24 | 1 |
| 34.98 | 22479 | films | 29 | 10 | 1002 | change | 17.6 | 2 |
| 38.85 | 23753 | films | 17 | 6.4 | 174.5 | change | 13.1 | 2 |
| 58.34 | 35499 | act-4 | 32 | 2.2 | 218.4 | change | 1.6 | 1 |
| 58.77 | 35929 | principles | 20 | 4.1 | 411.4 | change | 4.7 | 1 |

## rm — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 22 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 10.9 | 13.6 | #document ×4; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×1 |  | 0.6 MP of images |
| act-1 | 170 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 1.8 | 1.4 | #document ×4 |  | 2 mask, 0.6 MP of images |
| about | 77 | 58.5 | 17.1 | 16.7 | 16.8 | 33.4 | 0 | 0 | 33.4 | 1 | 0 |  | 0 | 40.3 | 6.1 | #document ×6; svg.pointer-events-none.absolute.inset-0 viewBox=0 0 600 190 in #work ×2 | user-callback:FrameRequestCallback (33 ms) | 1 mask |
| journey | 72 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 6.7 | 0.8 | #document ×1 |  | 1 mask, 0.2 MP of images |
| act-2 | 124 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 1.5 | 1.9 | #document ×3; header.fixed.inset-x-0.top-0 in #header ×1 |  | 1 filter, 2 mask, 0.6 MP of images |
| work | 132 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 34.1 | 1.4 | #document ×3 |  | 4 filter, 1 blend, 1 mask, 1 will-change, 0.8 MP of images |
| trading-algos | 99 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 2.4 | 1.8 | #document ×3 |  | 2 filter |
| optuna-screener | 152 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 3.2 | 2.4 | #document ×5; div.absolute.inset-x-0.top-0 in #kill-list ×1 |  | 2 filter, 0.6 MP of images |
| experiment | 66 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 26.4 | 2.7 | #document ×3 |  |  |
| systems | 137 | 59.6 | 16.8 | 16.7 | 16.7 | 16.8 | 0 | 0 | 33.4 | 0 | 0 |  | 0 | 3 | 1.7 | #document ×4 |  | 0.6 MP of images |
| kill-list | 135 | 58.3 | 17.2 | 16.7 | 16.8 | 33.4 | 0.7 | 0.7 | 66.7 | 1 | 30 | 100 | 0 | 8.2 | 8.6 | #document ×14; div.absolute.inset-x-0.top-0 in #kill-list ×6 | user-callback:FrameRequestCallback (74 ms) | 1 will-change, 0.1 MP of images |
| films | 626 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 1.1 | 0.9 | #document ×9 |  | 2.2 MP of images |
| act-3 | 130 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 0.9 | 3.7 | #document ×3; div.sticky.top-[calc(var(--header-h)+2rem)].pt-tier-group in #writing ×1 |  | 2 mask, 0.5 MP of images |
| beyond | 257 | 59.8 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 33.3 | 1 | 0 |  | 0 | 12.3 | 2.6 | #document ×7; div.rdr2-module__R8wI0W__campSticky in #voices ×3 |  | 6 mask, 2.2 MP of images |
| writing | 158 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 1.9 | 8.7 | #document ×5; div.absolute.inset-0.-z-10 in #principles ×4 |  | 5 mask, 3 will-change |
| voices | 99 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 1.8 | 6.7 | #document ×4; div.rdr2-module__R8wI0W__campSticky in #voices ×3 |  | 1.2 MP of images |
| act-4 | 130 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 5.5 | 2.8 | #document ×3; div.rdr2-module__R8wI0W__campSticky in #voices ×3 |  | 2 mask, 0.6 MP of images |
| principles | 165 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 19.6 | 3.6 | #document ×9; div.rdr2-module__R8wI0W__campSticky in #voices ×1 |  | 2 will-change |
| contact | 46 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 3.9 | 2.6 | #document ×2 |  | 4 mask, 0.5 MP of images |
| credits | 193 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 0.6 | 0.9 | #document ×3 |  |  |

### rm — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 384→2093 | 189 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 16.8 | 0 | 0 |  |
| act-2 | 4013→5182 | 150 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 16.8 | 0 | 0 |  |
| act-3 | 20542→21734 | 157 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 16.8 | 0 | 0 |  |
| act-4 | 29197→30362 | 156 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 16.8 | 0 | 0 |  |

### rm — longest animation frames (LoAF total 202 ms, main-thread work 123 ms, blocking 30 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 18.74 | kill-list | 88 | 30 | 79 | 5 | 74 | user-callback:FrameRequestCallback 74 ms |  |
| 34.02 | beyond | 59 | 0 | 0 | 0 | 0 | (no script) |  |
| 4.04 | about | 55 | 0 | 44 | 11 | 33 | user-callback:FrameRequestCallback 33 ms |  |

### rm — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 18.74 | kill-list | 88 | 30 | 79 | 5 | 74 | user-callback:FrameRequestCallback 74 ms |  |
| 4.04 | about | 55 | 0 | 44 | 11 | 33 | user-callback:FrameRequestCallback 33 ms |  |
| 34.02 | beyond | 59 | 0 | 0 | 0 | 0 | (no script) |  |

### rm — layout shifts (CLS total 0, session 0, 0 shifts)


### rm — visual pops (0; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)


## gl — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 17 | 18.5 | 53.9 | 16.7 | 200 | 200 | 35.3 | 29.4 | 200 | 6 | 0 | 0 | 0 | 550.9 | 65.5 | #document ×12; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×12 |  | 3 will-change, 0.6 MP of images |
| act-1 | 65 | 14.3 | 69.7 | 66.6 | 166.6 | 216.7 | 67.7 | 53.8 | 216.7 | 38 | 14 | 2.3 | 0 | 450 | 31.1 | #document ×31; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×25 | user-callback:TimerHandler:setTimeout @ 1_2f9ddauvl4s.js (58 ms) | 4 mask, 18 will-change, 14 infinite anims, 1.2 MP of images |
| about | 14 | 9.7 | 103.6 | 83.3 | 533.3 | 533.3 | 71.4 | 64.3 | 533.3 | 9 | 0 | 0 | 0 | 820.1 | 42.1 | #document ×9; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×9 | resolve-promise:Response.blob.then @ 2eq9kz53ofs73.js (28 ms) | 1 mask |
| journey | 31 | 12 | 83.3 | 83.2 | 166.7 | 200.1 | 90.3 | 67.7 | 200.1 | 20 | 23 | 17.9 | 0 | 648.8 | 72 | #document ×27; div.act-card-stage.relative.flex in #act-2 ×27 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (66 ms) | 1 mask, 2 will-change, 0.6 MP of images |
| act-2 | 76 | 18 | 55.5 | 33.4 | 150.1 | 216.7 | 47.4 | 40.8 | 216.7 | 33 | 11 | 5.6 | 0 | 534.3 | 82.3 | #document ×43; div.relative.@container in #work ×33 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (67 ms) | 2 filter, 3 mask, 20 will-change, 12 infinite anims, 2.4 MP of images |
| work | 68 | 34.6 | 28.9 | 16.7 | 66.7 | 166.7 | 13.2 | 7.4 | 166.7 | 4 | 0 | 0 | 0 | 316.8 | 38.6 | #document ×10; div.act-card-stage.relative.flex in #act-2 ×10 |  | 3 filter, 1 blend, 1 mask, 1 will-change, 1.6 MP of images |
| trading-algos | 53 | 21.2 | 47.2 | 16.7 | 133.4 | 200 | 34 | 32.1 | 200 | 17 | 0 | 0 | 0.0018 | 615.2 | 57.6 | #document ×26; div.act-card-stage.relative.flex in #act-2 ×17 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (8 ms) | 2 filter, 0.1 MP of images |
| optuna-screener | 47 | 14.2 | 70.6 | 66.6 | 150 | 200 | 68.1 | 55.3 | 200 | 26 | 0 | 0 | 0 | 774.9 | 80.2 | #document ×48; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×48 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (6 ms) | 2 filter, 1.3 MP of images |
| experiment | 29 | 26.4 | 37.9 | 33.3 | 83.4 | 116.7 | 24.1 | 24.1 | 116.7 | 7 | 0 | 0 | 0 | 700.9 | 83.6 | #document ×23; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×22 |  |  |
| systems | 25 | 11.2 | 89.3 | 83.4 | 166.6 | 199.9 | 76 | 76 | 199.9 | 19 | 0 | 0 | 0 | 853.9 | 40.7 | #document ×24; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×17 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (13 ms) | 1 will-change, 0.6 MP of images |
| kill-list | 29 | 12.6 | 79.3 | 83.3 | 116.6 | 183.3 | 86.2 | 75.9 | 183.3 | 21 | 0 | 0 | 0 | 843.5 | 53.5 | #document ×27; div.relative.@container.will-change-[transform,opacity] in #header ×26 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (13 ms) | 3 will-change, 0.3 MP of images |
| films | 455 | 32.3 | 31 | 16.7 | 99.9 | 150 | 18.5 | 13.4 | 216.7 | 58 | 55 | 4.8 | 0 | 430.3 | 73.1 | #document ×258; div.act-card-stage.relative.flex in #act-3 ×138 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (154 ms) | 4 will-change, 3.8 MP of images |
| act-3 | 155 | 41 | 24.4 | 16.7 | 83.3 | 133.3 | 9 | 5.8 | 166.7 | 12 | 0 | 0 | 0 | 351.3 | 37.5 | #document ×44; div.act-card-stage.relative.flex in #act-3 ×19 |  | 1 filter, 3 mask, 6 will-change, 1 MP of images |
| beyond | 93 | 19.4 | 51.6 | 33.3 | 166.7 | 266.6 | 44.1 | 33.3 | 266.6 | 30 | 0 | 0 | 0.0108 | 695 | 63.5 | #document ×85; div.act-card-stage.relative.flex in #act-3 ×52 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (6 ms) | 7 mask, 1 will-change, 4.5 MP of images |
| writing | 61 | 22.5 | 44.5 | 16.7 | 133.3 | 216.7 | 36.1 | 27.9 | 216.7 | 18 | 0 | 0 | 0.0004 | 766.8 | 153.9 | #document ×61; div.act-card-stage.relative.flex in #act-4 ×61 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (8 ms) | 6 mask, 4 will-change |
| voices | 27 | 15.3 | 65.4 | 50 | 133.3 | 216.7 | 63 | 44.4 | 216.7 | 12 | 0 | 0 | 0 | 531 | 131.9 | #document ×25; div.act-card-stage.relative.flex in #act-4 ×25 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (36 ms) | 1 mask, 12 will-change, 9 infinite anims, 1.8 MP of images |
| act-4 | 112 | 27.3 | 36.6 | 16.7 | 149.9 | 216.7 | 22.3 | 17 | 233.4 | 19 | 0 | 0 | 0.0009 | 534.4 | 42.9 | #document ×41; div.rdr2-module__R8wI0W__campSticky in #voices ×34 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r (8 ms) | 2 canvas, 3 mask, 26 will-change, 21 infinite anims, 1.2 MP of images |
| principles | 62 | 18.1 | 55.4 | 16.7 | 300 | 466.7 | 22.6 | 19.4 | 466.7 | 11 | 0 | 0 | 0 | 711.6 | 28 | #document ×45; div.act-card-stage.relative.flex in #act-4 ×45 |  | 7 will-change |
| contact | 5 | 5.6 | 180 | 166.6 | 283.3 | 283.3 | 80 | 80 | 283.3 | 4 | 0 | 0 | 0 | 749 | 34.4 | #document ×5; div.plate-cam.absolute.inset-0 in #contact ×5 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v (5 ms) | 4 mask, 1 MP of images |
| credits | 98 | 26.1 | 38.3 | 33.3 | 100 | 200 | 24.5 | 17.3 | 200 | 17 | 0 | 0 | 0 | 554.1 | 23.5 | #document ×37; div.act-card-stage.relative.flex in #act-4 ×19 |  | 1 will-change |

### gl — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 384→2846 | 69 | 13.1 | 76.3 | 66.6 | 183.3 | 533.3 | 55.1 | 533.3 | 42 | 14 | 2.1 |
| act-2 | 6188→8185 | 86 | 19.2 | 52.1 | 33.4 | 150 | 216.7 | 37.2 | 216.7 | 35 | 30 | 5.4 |
| act-3 | 24829→26672 | 178 | 42.7 | 23.4 | 16.7 | 66.7 | 133.3 | 5.1 | 166.7 | 12 | 0 | 0 |
| act-4 | 34626→36623 | 122 | 26.3 | 38 | 16.7 | 149.9 | 233.4 | 16.4 | 333.2 | 21 | 0 | 0 |

### gl — longest animation frames (LoAF total 38770 ms, main-thread work 987 ms, blocking 103 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 5.66 | about | 534 | 0 | 35 | 1 | 34 | resolve-promise:Response.blob.then @ 2eq9kz53ofs73.js 28 ms |  |
| 61.34 | principles | 455 | 0 | 0 | 0 | 0 | (no script) |  |
| 58.36 | principles | 382 | 0 | 3 | 3 | 0 | (no script) |  |
| 60.45 | principles | 300 | 0 | 1 | 1 | 0 | (no script) |  |
| 59.97 | principles | 293 | 0 | 1 | 1 | 0 | (no script) |  |

### gl — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 28.1 | films | 121 | 33 | 80 | 2 | 78 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v 78 ms | `()=>{let i=e.MotionGlobalConfig.useManualTiming,o=i?a.timestamp:performance.now();n=!1,i\|\|` |
| 9.43 | journey | 72 | 19 | 67 | 1 | 66 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r 66 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 27.31 | films | 120 | 22 | 67 | 2 | 65 | user-callback:FrameRequestCallback @ 0-0b3v37mf8ek.js v 65 ms | `()=>{let i=e.MotionGlobalConfig.useManualTiming,o=i?a.timestamp:performance.now();n=!1,i\|\|` |
| 11.78 | act-2 | 61 | 11 | 59 | 0 | 59 | user-callback:IdleRequestCallback @ 3-hs4lm3bz94q.js r 59 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 3.36 | act-1 | 65 | 14 | 58 | 0 | 58 | user-callback:TimerHandler:setTimeout @ 1_2f9ddauvl4s.js 58 ms | `()=>{K=0,U&&eP(U)},180)));_&&_.parentElement!==e.el&&(e.el.appendChild(_),eM(e),V?.disconn` |

### gl — layout shifts (CLS total 0.0139, session 0.0108, 8 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 48.05 | 0.0095 | beyond | span[data-w] in #beyond ; span[data-w] in #beyond ; span[data-words=scrub][data-words-variant=default] in #beyond |
| 16.74 | 0.0018 | trading-algos | span.scene-caption__film.world-face-idiots in #trading-algos ; p.scene-caption.mb-tier-group[data-caption=cap.trading-algos][data-caption-world=idiots] in #trading-algos |
| 48.24 | 0.0013 | beyond | span.whitespace-nowrap in #beyond ; span.scene-caption__sep in #beyond ; span.scene-caption__film.world-face-rdr2 in #beyond |
| 54.58 | 0.0009 | act-4 | span.whitespace-nowrap in #act-4 ; span.scene-caption__film.world-face-rdr2 in #act-4 |
| 50.82 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 51.06 | 0.0001 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 52.35 | 0 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 52.03 | 0 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |

### gl — visual pops (11; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 5.33 | 1765 | act-1 | 23 | 7.1 | 177.4 | change | 12.6 | 3 |
| 6.44 | 2533 | about | 34 | 11 | 274.4 | change | 17.1 | 1 |
| 13.52 | 7261 | act-2 | 7 | 2.3 | 118.1 | change | 3.6 | 1 |
| 13.67 | 7341 | act-2 | 34 | 5.1 | 258 | change | 6.7 | 1 |
| 13.94 | 7429 | work | 32 | 7.8 | 398.8 | change | 10.9 | 1 |
| 34.52 | 22488 | films | 37 | 12.8 | 127.9 | change | 25.1 | 8 |
| 37.22 | 23340 | films | 5 | 5.1 | 506.8 | change | 10.7 | 3 |
| 42.63 | 25403 | act-3 | 22 | 17.1 | 9.4 | change | 49.7 | 2 |
| 49.95 | 30346 | writing | 38 | 24.8 | 3.9 | change | 31.5 | 1 |
| 56.16 | 35589 | act-4 | 26 | 25.8 | 3.1 | change | 50.9 | 1 |
| 59.20 | 36661 | principles | 31 | 3.6 | 20.7 | change | 7.6 | 1 |

## Strips

- strips/intro.png
- strips/intro-landing.png
- strips/pop-intro-56.png
- strips/pop-intro-60.png
- strips/pop-intro-40.png
- strips/pop-intro-108.png
- strips/desktop-act-1.png
- strips/desktop-act-2.png
- strips/desktop-act-3.png
- strips/desktop-act-4.png
- strips/desktop-first-60s.png
- strips/pop-desktop-582.png
- strips/pop-desktop-453.png
- strips/pop-desktop-457.png
- strips/native-act-1.png
- strips/native-act-2.png
- strips/native-act-3.png
- strips/native-act-4.png
- strips/native-first-60s.png
- strips/pop-native-171.png
- strips/pop-native-599.png
- strips/pop-native-807.png
- strips/pop-native-434.png
- strips/alt-act-1.png
- strips/alt-act-2.png
- strips/alt-act-3.png
- strips/alt-act-4.png
- strips/alt-first-60s.png
- strips/pop-alt-457.png
- strips/pop-alt-188.png
- strips/pop-alt-486.png
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
- strips/pop-gl-789.png
- strips/pop-gl-704.png
- strips/pop-gl-604.png
