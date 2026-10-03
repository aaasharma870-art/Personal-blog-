# Motion baseline — 2026-10-03T13:44:39.849Z

Base http://localhost:3161 · Chromium 141.0.7390.37 headless · 4 CPUs · screencast everyNthFrame=1.

> Headless Chromium rasterises in software (SwiftShader) on a few CPUs and pays for the screencast readback, so absolute frame times are pessimistic vs a real laptop/phone GPU. Read them as RELATIVE hotspots: which sections and transitions are worst. "busy∩jank %" = share of >33.4 ms frames that overlap a long animation frame in which the main thread really worked (script + style/layout/paint >= half the frame, or a >50 ms task); low = the frame was raster/composite-bound (the LoAF is the main thread waiting on the compositor), high = main-thread script/style/layout. "paint suspects" = what the section holds that is costly to raster (filters, blend, masks, canvas, video, image megapixels, infinite animations).

## Runs

| run | viewport | lenis | secs | rAF frames | fps | mean ms | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | LoAF block ms | busy∩jank % | CLS total | CLS (session) | pops | shots |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| intro | 1024x768 |  | 11.9 | 400 | 33.6 | 29.7 | 16.7 | 66.7 | 133.3 | 22 | 10.5 | 399.9 | 63 | 947 | 3.4 | 0.0071 | 0.0071 | 4 | 215 |
| desktop | 1024x768 | on | 66.3 | 1548 | 23.4 | 42.8 | 16.7 | 133.3 | 233.4 | 30.2 | 21.6 | 683.3 | 346 | 619 | 2.6 | 0.0435 | 0.0275 | 12 | 1037 |
| native | 1024x768 | off | 59.9 | 962 | 16.1 | 62.2 | 33.2 | 250 | 433.3 | 36.4 | 30.7 | 800 | 288 | 526 | 4.3 | 0.0321 | 0.016 | 35 | 1012 |
| alt | 1024x768 | on | 83.2 | 1780 | 21.4 | 46.7 | 16.7 | 183.3 | 333.3 | 25.4 | 22.4 | 633.2 | 343 | 1940 | 4.4 | 0.0425 | 0.0275 | 13 | 1437 |
| rm | 1024x768 | off | 49.9 | 2929 | 58.6 | 17.1 | 16.7 | 16.8 | 16.8 | 0.5 | 0.3 | 166.6 | 12 | 227 | 20 | 0.1164 | 0.1164 | 0 | 441 |
| gl | 1024x768 | on | 65.7 | 1696 | 25.8 | 38.8 | 16.7 | 116.5 | 200 | 29.4 | 20.6 | 433.3 | 363 | 668 | 3 | 0.0438 | 0.0275 | 5 | 1126 |

## Top 10 hotspots (by mean frame time; rm excluded)

| # | run | where | frames | fps | mean | p95 | p99 | >50 % | max | mean / run mean | LoAF block ms | likely cause |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | native | principles | 11 | 3.6 | 280.3 | 783.3 | 783.3 | 81.8 | 783.3 | 4.5 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 98.6% waiting for the compositor — on screen: 7 will-change [while scrolling: raster 844 ms/s, 17.5 paints/s — repainting: #document ×10; div.act-card-stage.relative.flex in #act-4 ×8 \| idle 57.9 fps, raster 0 ms/s, 0 paints/s] |
| 2 | native | journey | 11 | 4.6 | 218.2 | 566.6 | 566.6 | 81.8 | 566.6 | 3.5 | 87 | raster/composite-bound: only 22.2% of janky frames overlap real main-thread work; the LoAFs are 93% waiting for the compositor — on screen: 1 mask, 1 will-change, 0.6 MP of images [while scrolling: raster 470.9 ms/s, 34.2 paints/s — repainting: #document ×11; div.relative.z-10.mx-auto in #top ×8 \| idle 52.1 fps, raster 109.6 ms/s, 3.3 paints/s] |
| 3 | native | about | 11 | 5 | 201.5 | 500 | 500 | 72.7 | 500 | 3.2 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.3% waiting for the compositor — on screen: 1 mask [while scrolling: raster 610.4 ms/s, 42 paints/s — repainting: #document ×11; div.pointer-events-none.absolute in #journey ×5 \| idle 60.3 fps, raster 0 ms/s, 0 paints/s] |
| 4 | desktop | about | 10 | 6.5 | 155 | 300 | 300 | 100 | 300 | 3.6 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 96.8% waiting for the compositor — on screen: 1 mask [while scrolling: raster 769.7 ms/s, 28.4 paints/s — repainting: #document ×8; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×8 \| idle 60.3 fps, raster 0 ms/s, 0 paints/s] |
| 5 | native | voices | 13 | 7 | 142.3 | 533.2 | 533.2 | 61.5 | 533.2 | 2.3 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.5% waiting for the compositor — on screen: 1 mask, 12 will-change, 9 infinite anims, 1.8 MP of images [while scrolling: raster 435.1 ms/s, 47.6 paints/s — repainting: #document ×13; div.act-card-stage.relative.flex in #act-4 ×8 \| idle 60.5 fps, raster 0 ms/s, 0 paints/s] |
| 6 | gl | principles | 21 | 7.1 | 141.3 | 283.4 | 350 | 81 | 350 | 3.6 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.2% waiting for the compositor — on screen: 7 will-change [while scrolling: raster 935.1 ms/s, 33.4 paints/s — repainting: #document ×22; div.rdr2-module__R8wI0W__campSticky in #voices ×22 \| idle 57.9 fps, raster 0 ms/s, 0 paints/s] |
| 7 | desktop | principles | 21 | 7.1 | 141.3 | 233.4 | 300 | 81 | 300 | 3.3 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.1% waiting for the compositor — on screen: 7 will-change [while scrolling: raster 1105.7 ms/s, 34.4 paints/s — repainting: #document ×22; div.act-card-stage.relative.flex in #act-4 ×22 \| idle 57.9 fps, raster 0 ms/s, 0 paints/s] |
| 8 | alt | contact | 12 | 7.5 | 133.3 | 500 | 500 | 50 | 500 | 2.9 | 92 | raster/composite-bound: only 16.7% of janky frames overlap real main-thread work; the LoAFs are 99% waiting for the compositor — on screen: 4 mask, 0.5 MP of images [while scrolling: raster 397.5 ms/s, 23.8 paints/s — repainting: #document ×8; div.act-card-stage.relative.flex in #act-4 ×8 \| idle 60.5 fps, raster 0 ms/s, 0 paints/s] |
| 9 | alt | principles | 54 | 8.1 | 123.8 | 466.7 | 633.2 | 38.9 | 633.2 | 2.7 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.2% waiting for the compositor — on screen: 3 mask [while scrolling: raster 283 ms/s, 12.6 paints/s — repainting: #document ×40; div.act-card-stage.relative.flex in #act-4 ×36 \| idle 57.9 fps, raster 0 ms/s, 0 paints/s] |
| 10 | native | beyond | 40 | 8.4 | 119.2 | 383.4 | 450 | 65 | 450 | 1.9 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.4% waiting for the compositor — on screen: 7 mask, 1 will-change, 4.5 MP of images [while scrolling: raster 461.6 ms/s, 36.5 paints/s — repainting: #document ×31; div.act-card-stage.relative.flex in #act-3 ×19 \| idle 60.3 fps, raster 0 ms/s, 0 paints/s] |

## Idle probe (desktop: parked 2.5 s on each section, then 1.5 s traced standing still; high raster with few paints = a raster-heavy layer, many paints/s = continuous animation)

| section | idle fps | raster ms/s | paints/s | paint ms/s | style+layout ms/s | rAF JS ms/s | top repainting nodes |
|---|---|---|---|---|---|---|---|
| top | 60.3 | 0 | 0 | 0 | 1.1 | 10 |  |
| act-1 | 60.2 | 0 | 0 | 0 | 6.6 | 16.1 |  |
| about | 60.3 | 0 | 0 | 0 | 6.9 | 16.5 |  |
| journey | 52.1 | 109.6 | 3.3 | 1.5 | 2.3 | 10.4 | #document ×2; div.sticky.top-[calc(var(--header-h)+1.5rem)] ×1; div.relative.mx-auto.w-full ×1 |
| act-2 | 60.1 | 0 | 0 | 0 | 0 | 9 |  |
| work | 60.5 | 0 | 0 | 0 | 0 | 10 |  |
| trading-algos | 60.3 | 0 | 0 | 0 | 6.4 | 16.7 |  |
| optuna-screener | 60.5 | 0 | 0 | 0 | 5.9 | 18.6 |  |
| experiment | 60.4 | 0 | 0 | 0 | 0 | 8.1 |  |
| systems | 58.6 | 0 | 0 | 0 | 0 | 8.6 |  |
| kill-list | 60.5 | 0 | 0 | 0 | 0 | 10.5 |  |
| films | 60.5 | 0 | 0 | 0 | 0 | 10.2 |  |
| act-3 | 60.3 | 0 | 0 | 0 | 0 | 9.5 |  |
| beyond | 60.3 | 0 | 0 | 0 | 0 | 10.1 |  |
| writing | 60.2 | 0 | 0 | 0 | 0 | 9.4 |  |
| voices | 60.5 | 0 | 0 | 0 | 6.1 | 18.1 |  |
| act-4 | 60.1 | 0.4 | 0 | 0 | 0 | 10 |  |
| principles | 57.9 | 0 | 0 | 0 | 0 | 8.9 |  |
| contact | 60.5 | 0 | 0 | 0 | 0 | 10.4 |  |
| credits | 60.2 | 0 | 0 | 0 | 6.9 | 18.5 |  |

## intro — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| intro:play-screen | 62 | 23.7 | 42.2 | 16.8 | 66.7 | 649.9 | 24.2 | 9.7 | 649.9 | 6 | 782 | 46.7 | 0.0071 | 257.2 | 40.5 | #document ×41; div#act-1-program.relative.px-gutter.pt-tier-group in #act-1 ×12 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (973 ms) |  |
| intro:flight | 169 | 27.4 | 36.5 | 33.3 | 66.7 | 83.3 | 39.1 | 16.6 | 83.4 | 41 | 0 | 0 | 0 | 324.7 | 8.1 | #document ×18; div#act-1-program.relative.px-gutter.pt-tier-group in #act-1 ×14 |  |  |
| intro:hold | 3 | 6.2 | 161.1 | 66.8 | 399.9 | 399.9 | 66.7 | 66.7 | 399.9 | 2 | 30 | 100 | 0 | 610.4 | 37.2 | #document ×3; div.absolute.inset-0.will-change-transform in #top ×2 |  |  |
| intro:reveal | 12 | 17.1 | 58.3 | 66.7 | 150 | 150 | 50 | 50 | 150 | 6 | 0 | 0 | 0 | 161.5 | 1.4 | #document ×1 |  |  |
| intro:titles | 168 | 51.4 | 19.4 | 16.7 | 49.9 | 66.7 | 5.4 | 1.8 | 83.4 | 4 | 0 | 0 | 0 | 12.6 | 2.4 | #document ×2; video.absolute.inset-0.size-full in #top ×1 | user-callback:FrameRequestCallback (6 ms) |  |
| top | 49 | 37.2 | 26.9 | 16.7 | 66.7 | 183.3 | 10.2 | 6.1 | 183.3 | 4 | 135 | 20 | 0 | 99.5 | 48.6 | #document ×16; div.letterbox-bar ×3 | user-callback:FrameRequestCallback (161 ms) | 1 video, 1 filter, 1 blend, 1 mask, 5 will-change, 1.2 MP of images |

### intro — marks and LoAF intro:warm → intro:titles-end

warm t=4.707s → titles-end t=10.582s: 27 LoAF, **27 > 50 ms** (max 336 ms, blocking 30 ms)

intro:arm@-2.961 · intro:ready@-2.753 · intro:play@0 · intro:flight@0.1 · intro:warm@4.707 · intro:hold@6.143 · intro:reveal@6.638 · intro:landing@6.638 · intro:titles@7.381 · intro:end@7.381 · intro:titles-end@10.582

### intro — longest animation frames (LoAF total 5498 ms, main-thread work 1214 ms, blocking 947 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| -2.64 | intro:play-screen | 793 | 693 | 774 | 1 | 773 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 731 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |
| 6.3 | intro:hold | 336 | 0 | 1 | 1 | 0 | (no script) |  |
| 11.45 | top | 221 | 135 | 181 | 14 | 167 | user-callback:FrameRequestCallback 161 ms |  |
| 6.88 | intro:reveal | 148 | 0 | 0 | 0 | 0 | (no script) |  |
| -1.42 | intro:play-screen | 146 | 89 | 138 | 1 | 137 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 132 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |

### intro — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| -2.64 | intro:play-screen | 793 | 693 | 774 | 1 | 773 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 731 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |
| 11.45 | top | 221 | 135 | 181 | 14 | 167 | user-callback:FrameRequestCallback 161 ms |  |
| -1.42 | intro:play-screen | 146 | 89 | 138 | 1 | 137 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 132 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |
| -0.96 | intro:play-screen | 81 | 0 | 53 | 2 | 51 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 26 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |
| -1.27 | intro:play-screen | 52 | 0 | 41 | 2 | 39 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 34 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |

### intro — layout shifts (CLS total 0.0071, session 0.0071, 1 shifts)

| t s | value | section | sources |
|---|---|---|---|
| -1.84 | 0.0071 | intro:play-screen | svg in #top ; svg in #top |

### intro — visual pops (4; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| -1.15 | 0 | intro:play-screen | 0 | 6.4 | 25.1 | fill-in | 6.7 | 1 |
| 0.94 | 0 | intro:flight | 0 | 3.7 | 66.7 | change | 8.2 | 1 |
| 1.26 | 0 | intro:flight | 0 | 10.1 | 180.2 | change | 14.2 | 15 |
| 7.59 | 0 | intro:titles | 0 | 9.2 | 18.2 | fill-in | 8.9 | 1 |

## desktop — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 15 | 20.5 | 48.9 | 16.7 | 149.9 | 149.9 | 33.3 | 33.3 | 149.9 | 5 | 238 | 20 | 0 | 660 | 61.4 | #document ×9; div.act-card-stage.relative.flex in #act-1 ×9 | user-callback:IntersectionObserverCallback @ 3tw7jfo5o-q7k.js (282 ms) | 1 filter, 1 blend, 1 mask, 5 will-change, 1.2 MP of images |
| act-1 | 58 | 12.2 | 81.9 | 50 | 249.9 | 533.2 | 58.6 | 43.1 | 533.2 | 26 | 0 | 2.9 | 0 | 512.7 | 37.5 | #document ×31; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×29 | user-callback:IntersectionObserverCallback @ 0gidbk80-6e1r.js (7 ms) | 4 mask, 18 will-change, 14 infinite anims, 1.2 MP of images |
| about | 10 | 6.5 | 155 | 166.6 | 300 | 300 | 100 | 100 | 300 | 10 | 0 | 0 | 0.0121 | 769.7 | 28.4 | #document ×8; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×8 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (32 ms) | 1 mask |
| journey | 28 | 10.8 | 92.3 | 99.9 | 166.7 | 233.3 | 82.1 | 75 | 233.3 | 18 | 53 | 8.7 | 0 | 826.5 | 77.4 | #document ×29; div.act-card-stage.relative.flex in #act-2 ×29 | resolve-promise:Promise.resolve @ 3c41okqj08im4.js (98 ms) | 1 mask, 1 will-change, 0.6 MP of images |
| act-2 | 63 | 15.6 | 64.3 | 49.9 | 183.4 | 316.7 | 52.4 | 30.2 | 316.7 | 23 | 72 | 6.1 | 0 | 568.7 | 62.2 | #document ×27; div.relative.@container in #work ×25 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r (133 ms) | 2 filter, 3 mask, 20 will-change, 12 infinite anims, 2.4 MP of images |
| work | 55 | 24.1 | 41.5 | 33.3 | 150 | 216.7 | 29.1 | 16.4 | 216.7 | 12 | 0 | 0 | 0 | 550.1 | 91.5 | #document ×22; div.act-card-stage.relative.flex in #act-2 ×22 |  | 3 filter, 1 blend, 2 mask, 2 will-change, 1.6 MP of images |
| trading-algos | 49 | 20.1 | 49.7 | 16.7 | 133.4 | 250.1 | 44.9 | 32.7 | 250.1 | 18 | 0 | 0 | 0.0018 | 649.8 | 82.6 | #document ×28; div.act-card-stage.relative.flex in #act-2 ×21 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (5 ms) | 2 filter, 0.1 MP of images |
| optuna-screener | 50 | 15.2 | 66 | 66.6 | 133.4 | 216.6 | 68 | 56 | 216.6 | 27 | 0 | 0 | 0 | 676.1 | 119.4 | #document ×50; div.stage-window in #trading-algos ×50 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (11 ms) | 2 filter, 1.3 MP of images |
| experiment | 31 | 28.6 | 34.9 | 33.3 | 83.3 | 116.6 | 29 | 16.1 | 116.6 | 7 | 0 | 0 | 0 | 680.3 | 88.6 | #document ×19; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×15 |  |  |
| systems | 37 | 18.3 | 54.5 | 50 | 116.7 | 116.8 | 62.2 | 48.6 | 116.8 | 18 | 0 | 0 | 0 | 804.3 | 88.8 | #document ×36; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×27 | event-listener:DOMWindow.onscroll @ 3c41okqj08im4.js (6 ms) | 1 mask, 1 will-change, 0.6 MP of images |
| kill-list | 38 | 16.2 | 61.8 | 66.6 | 133.2 | 133.3 | 71.1 | 52.6 | 133.3 | 22 | 16 | 3.7 | 0 | 807.7 | 71.5 | #document ×37; div.relative.@container.will-change-[transform,opacity] in #header ×36 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (61 ms) | 1 mask, 3 will-change, 0.3 MP of images |
| films | 571 | 41.8 | 23.9 | 16.7 | 66.6 | 116.7 | 10.2 | 5.6 | 200 | 37 | 238 | 5.2 | 0 | 296 | 96.2 | #document ×377; div.act-card-stage.relative.flex in #act-3 ×155 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (58 ms) | 4 will-change, 3.8 MP of images |
| act-3 | 125 | 31.8 | 31.5 | 16.7 | 116.8 | 166.7 | 15.2 | 12 | 233.3 | 17 | 0 | 0 | 0 | 276.1 | 53.4 | #document ×58; div.stage-window in #beyond ×41 | user-callback:FrameRequestCallback @ 3u_vlb8_9wwtr.js (23 ms) | 1 filter, 3 mask, 6 will-change, 1 MP of images |
| beyond | 81 | 17.2 | 58.2 | 50 | 149.9 | 300 | 56.8 | 34.6 | 300 | 24 | 0 | 0 | 0.0275 | 707.5 | 63.8 | #document ×65; div.act-card-stage.relative.flex in #act-3 ×50 | event-listener:DOMWindow.onscroll @ 3c41okqj08im4.js e (5 ms) | 7 mask, 1 will-change, 4.5 MP of images |
| writing | 58 | 21.2 | 47.1 | 33.4 | 99.9 | 116.7 | 48.3 | 31 | 116.7 | 17 | 0 | 0 | 0.0009 | 784.8 | 189.9 | #document ×58; div.stage-window in #beyond ×57 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (10 ms) | 5 mask, 3 will-change |
| voices | 39 | 19.7 | 50.9 | 33.3 | 133.4 | 200 | 38.5 | 28.2 | 200 | 13 | 0 | 0 | 0 | 495.1 | 146.7 | #document ×35; div.act-card-stage.relative.flex in #act-4 ×35 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r (64 ms) | 1 mask, 12 will-change, 9 infinite anims, 1.8 MP of images |
| act-4 | 124 | 30.2 | 33.1 | 16.7 | 99.9 | 166.6 | 19.4 | 13.7 | 516.7 | 15 | 2 | 8.3 | 0 | 392.4 | 45.6 | #document ×52; div.rdr2-module__R8wI0W__campSticky in #voices ×40 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (44 ms) | 2 canvas, 3 mask, 26 will-change, 21 infinite anims, 1.2 MP of images |
| principles | 21 | 7.1 | 141.3 | 150 | 233.4 | 300 | 85.7 | 81 | 300 | 16 | 0 | 0 | 0.0011 | 1105.7 | 34.4 | #document ×22; div.act-card-stage.relative.flex in #act-4 ×22 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (7 ms) | 7 will-change |
| contact | 4 | 2.7 | 366.7 | 350 | 683.3 | 683.3 | 100 | 100 | 683.3 | 4 | 0 | 0 | 0 | 623.9 | 19.1 | #document ×4; div.act-card-stage.relative.flex in #act-4 ×4 | user-callback:IntersectionObserverCallback @ 3c41okqj08im4.js (9 ms) | 4 mask, 1 MP of images |
| credits | 91 | 25.5 | 39.2 | 33.3 | 116.7 | 183.4 | 22 | 17.6 | 183.4 | 17 | 0 | 0 | 0 | 662.8 | 20.2 | #document ×32; div.stage-cam ×14 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (5 ms) | 1 will-change |

### desktop — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 384→2846 | 62 | 11.6 | 86.3 | 50 | 233.4 | 533.2 | 46.8 | 533.2 | 31 | 238 | 2.6 |
| act-2 | 6188→8185 | 77 | 17.4 | 57.6 | 33.4 | 183.4 | 316.7 | 24.7 | 316.7 | 24 | 72 | 5.6 |
| act-3 | 24479→26322 | 131 | 29.1 | 34.3 | 16.7 | 149.9 | 233.3 | 14.5 | 233.3 | 20 | 0 | 0 |
| act-4 | 34276→36273 | 129 | 28.8 | 34.8 | 16.7 | 100 | 233.3 | 15.5 | 516.7 | 18 | 2 | 7.4 |

### desktop — longest animation frames (LoAF total 36773 ms, main-thread work 1394 ms, blocking 619 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 61.24 | contact | 667 | 0 | 10 | 1 | 9 | user-callback:IntersectionObserverCallback @ 3c41okqj08im4.js 9 ms | `e=>{let t=r;for(let n of e)n.isIntersecting&&(t=n.target.id);t!==r&&(r=t,i.forEach(e=>e())` |
| 2.43 | act-1 | 525 | 0 | 1 | 1 | 0 | (no script) |  |
| 55.13 | act-4 | 508 | 0 | 9 | 1 | 8 | user-callback:FrameRequestCallback @ 3u_vlb8_9wwtr.js 8 ms | `()=>{c=0,k()}))}function T(){if(r.size&&(0,i.scrollVelocity)()>=o.below)for(let e of r.val` |
| 62.36 | contact | 322 | 0 | 1 | 1 | 0 | (no script) |  |
| 11.26 | act-2 | 310 | 0 | 6 | 1 | 5 | user-callback:TimerHandler:setTimeout @ 3c41okqj08im4.js M 5 ms | `(){let e=d;if(e&&"smooth"===e.isScrolling){let e=performance.now();if(S\|\|(S=e),e-S<3e3){n=` |

### desktop — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 0.63 | top | 291 | 238 | 283 | 1 | 282 | user-callback:IntersectionObserverCallback @ 3tw7jfo5o-q7k.js 282 ms | `e=>{e.forEach(e=>{let t=H.get(e.target);if(!t)return;let r=e.boundingClientRect;t.visible=` |
| 9.82 | act-2 | 124 | 72 | 118 | 1 | 117 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r 117 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 7.94 | journey | 143 | 53 | 99 | 1 | 98 | resolve-promise:Promise.resolve @ 3c41okqj08im4.js 98 ms |  |
| 27 | kill-list | 69 | 16 | 63 | 2 | 61 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v 61 ms | `()=>{let i=e.MotionGlobalConfig.useManualTiming,o=i?a.timestamp:performance.now();n=!1,i\|\|` |
| 28.06 | films | 211 | 136 | 60 | 2 | 58 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v 58 ms | `()=>{let i=e.MotionGlobalConfig.useManualTiming,o=i?a.timestamp:performance.now();n=!1,i\|\|` |

### desktop — layout shifts (CLS total 0.0435, session 0.0275, 11 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 48.02 | 0.0275 | beyond | span.scene-caption__film.world-face-rdr2 in #beyond ; span[data-w] in #beyond ; span[data-words=scrub][data-words-variant=default] in #beyond |
| 6.68 | 0.0121 | about | span[data-w] in #about ; span[data-w] in #about ; span[data-w] in #about |
| 16.94 | 0.0018 | trading-algos | span.scene-caption__film.world-face-idiots in #trading-algos ; p.scene-caption.mb-tier-group[data-caption=cap.trading-algos][data-caption-world=idiots] in #trading-algos |
| 59.25 | 0.0011 | principles | span.scene-caption__film.world-face-hp in #principles ; p.scene-caption[data-caption=cap.principles][data-caption-world=hp] in #principles ; h3.type-title.text-fg.max-sm:hyphens-auto in #principles |
| 51.59 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 50.42 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 51.23 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 50.85 | 0.0001 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |

### desktop — visual pops (12; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 2.08 | 559 | act-1 | 22 | 5 | 24.2 | change | 6.5 | 1 |
| 3.02 | 1413 | act-1 | 19 | 11.2 | 3.4 | change | 19.4 | 1 |
| 5.47 | 1866 | act-1 | 28 | 8.6 | 238.7 | change | 14.9 | 2 |
| 6.41 | 2442 | about | 38 | 10.6 | 294.4 | change | 16.9 | 1 |
| 12.11 | 7276 | act-2 | 13 | 22.9 | 3.3 | change | 42.9 | 1 |
| 13.58 | 7338 | act-2 | 38 | 11.1 | 3.1 | change | 18.2 | 1 |
| 13.89 | 7431 | work | 34 | 14.6 | 4.1 | change | 28.6 | 1 |
| 34.09 | 22089 | films | 24 | 12.6 | 202.7 | change | 23.4 | 7 |
| 40.41 | 24026 | films | 5 | 5.9 | 586.4 | change | 14 | 4 |
| 58.38 | 35442 | principles | 28 | 2.6 | 255.3 | change | 4.6 | 1 |
| 58.64 | 35626 | principles | 35 | 12.9 | 1290.6 | change | 23.5 | 1 |
| 59.03 | 35934 | principles | 22 | 10.2 | 1019.6 | change | 11.3 | 2 |

## native — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 15 | 22 | 45.6 | 16.7 | 316.7 | 316.7 | 20 | 20 | 316.7 | 3 | 0 | 0 | 0 | 206.4 | 51.2 | #document ×11; header.fixed.inset-x-0.top-0 in #header ×7 |  | 1 filter, 1 blend, 1 mask, 5 will-change, 1.2 MP of images |
| act-1 | 39 | 9 | 110.7 | 66.7 | 349.9 | 350 | 69.2 | 66.7 | 350 | 25 | 179 | 7.4 | 0 | 358.4 | 34.3 | #document ×26; div.act-card-stage.relative.flex in #act-1 ×16 | user-callback:IntersectionObserverCallback @ 3tw7jfo5o-q7k.js (219 ms) | 4 mask, 18 will-change, 14 infinite anims, 1.2 MP of images |
| about | 11 | 5 | 201.5 | 216.6 | 500 | 500 | 72.7 | 72.7 | 500 | 5 | 0 | 0 | 0.0125 | 610.4 | 42 | #document ×11; div.pointer-events-none.absolute in #journey ×5 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (5 ms) | 1 mask |
| journey | 11 | 4.6 | 218.2 | 183.4 | 566.6 | 566.6 | 81.8 | 81.8 | 566.6 | 9 | 87 | 22.2 | 0 | 470.9 | 34.2 | #document ×11; div.relative.z-10.mx-auto in #top ×8 | resolve-promise:Promise.resolve @ 3c41okqj08im4.js (121 ms) | 1 mask, 1 will-change, 0.6 MP of images |
| act-2 | 38 | 12.2 | 82 | 66.7 | 216.7 | 266.6 | 65.8 | 60.5 | 266.6 | 22 | 0 | 0 | 0 | 550 | 66.4 | #document ×29; div.absolute.inset-x-0.top-0 in #act-2 ×16 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r (12 ms) | 2 filter, 3 mask, 20 will-change, 12 infinite anims, 2.4 MP of images |
| work | 23 | 10.3 | 97.1 | 66.7 | 283.3 | 283.4 | 52.2 | 52.2 | 283.4 | 12 | 0 | 0 | 0 | 515.9 | 60 | #document ×18; div.relative.sm:overflow-hidden.sm:rounded-frame in #work ×13 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r (32 ms) | 3 filter, 1 blend, 2 mask, 2 will-change, 1.6 MP of images |
| trading-algos | 40 | 17.1 | 58.3 | 16.8 | 183.3 | 383.4 | 40 | 30 | 383.4 | 12 | 41 | 12.5 | 0.0018 | 432 | 66.4 | #document ×28; div.stage-window in #optuna-screener ×15 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (11 ms) | 2 filter, 0.1 MP of images |
| optuna-screener | 35 | 10.4 | 95.7 | 66.6 | 366.7 | 433.2 | 60 | 51.4 | 433.2 | 16 | 0 | 0 | 0 | 479.7 | 65.7 | #document ×35; div.stage-window in #trading-algos ×20 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (5 ms) | 2 filter, 1.3 MP of images |
| experiment | 63 | 55.6 | 18 | 16.7 | 16.8 | 66.6 | 3.2 | 3.2 | 66.6 | 0 | 0 | 0 | 0 | 43.2 | 142.9 | #document ×59; svg.pointer-events-none.absolute.inset-0 in #optuna-screener ×27 |  |  |
| systems | 34 | 15.6 | 64.2 | 49.9 | 183.3 | 250 | 50 | 44.1 | 250 | 17 | 0 | 0 | 0 | 688.4 | 53.1 | #document ×26; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×19 | user-callback:IntersectionObserverCallback @ 0gidbk80-6e1r.js (5 ms) | 1 mask, 1 will-change, 0.6 MP of images |
| kill-list | 20 | 8.8 | 113.3 | 100 | 283.4 | 283.4 | 85 | 85 | 283.4 | 17 | 19 | 5.9 | 0 | 657.8 | 45.4 | #document ×20; div.relative.@container.will-change-[transform,opacity] in #header ×17 | event-listener:DOMWindow.onscroll @ 3c41okqj08im4.js e (61 ms) | 1 mask, 3 will-change, 0.3 MP of images |
| films | 295 | 29 | 34.5 | 16.7 | 100 | 200 | 23.7 | 16.6 | 266.7 | 50 | 200 | 11.4 | 0 | 362.7 | 66.3 | #document ×201; svg.pointer-events-none.absolute.inset-0 viewBox=0 0 1778 1000 in #films ×69 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r (56 ms) | 4 will-change, 3.8 MP of images |
| act-3 | 67 | 22.5 | 44.5 | 16.7 | 233.4 | 300 | 23.9 | 20.9 | 300 | 13 | 0 | 0 | 0 | 319.5 | 38.2 | #document ×33; div.act-card-stage.relative.flex in #act-3 ×12 |  | 1 filter, 3 mask, 6 will-change, 1 MP of images |
| beyond | 40 | 8.4 | 119.2 | 100 | 383.4 | 450 | 70 | 65 | 450 | 27 | 0 | 0 | 0.016 | 461.6 | 36.5 | #document ×31; div.act-card-stage.relative.flex in #act-3 ×19 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (7 ms) | 7 mask, 1 will-change, 4.5 MP of images |
| writing | 42 | 15.5 | 64.7 | 50 | 200 | 250 | 52.4 | 42.9 | 250 | 15 | 0 | 0 | 0.0009 | 619.9 | 110.8 | #document ×42; svg.size-full.overflow-visible.will-change-transform viewBox=0 0 400 500[data-motif=journal-landscape] in #writing ×38 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (5 ms) | 5 mask, 3 will-change |
| voices | 13 | 7 | 142.3 | 83.4 | 533.2 | 533.2 | 69.2 | 61.5 | 533.2 | 8 | 0 | 0 | 0 | 435.1 | 47.6 | #document ×13; div.act-card-stage.relative.flex in #act-4 ×8 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (5 ms) | 1 mask, 12 will-change, 9 infinite anims, 1.8 MP of images |
| act-4 | 67 | 21.2 | 47.3 | 16.7 | 216.6 | 333.3 | 25.4 | 20.9 | 333.3 | 16 | 0 | 0 | 0 | 367.9 | 38.2 | #document ×28; canvas.act-card-seq in #act-4 ×13 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r (22 ms) | 2 canvas, 3 mask, 26 will-change, 21 infinite anims, 1.2 MP of images |
| principles | 11 | 3.6 | 280.3 | 266.7 | 783.3 | 783.3 | 90.9 | 81.8 | 783.3 | 9 | 0 | 0 | 0.0008 | 844 | 17.5 | #document ×10; div.act-card-stage.relative.flex in #act-4 ×8 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r (31 ms) | 7 will-change |
| contact | 3 | 2.9 | 350 | 216.6 | 800 | 800 | 66.7 | 66.7 | 800 | 2 | 0 | 0 | 0 | 905.7 | 33.3 | #document ×4; div.act-card-stage.relative.flex in #act-4 ×3 | user-callback:IntersectionObserverCallback @ 3c41okqj08im4.js (8 ms) | 4 mask, 1 MP of images |
| credits | 95 | 24.7 | 40.5 | 33.3 | 116.6 | 433.3 | 20 | 10.5 | 433.3 | 10 | 0 | 0 | 0 | 163.1 | 29.1 | #document ×40; video.stage-video ×20 |  | 1 will-change |

### native — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 384→2846 | 41 | 8.9 | 112.2 | 66.7 | 266.7 | 350 | 65.9 | 350 | 27 | 179 | 7.1 |
| act-2 | 6188→8185 | 40 | 11.7 | 85.4 | 66.7 | 233.3 | 266.6 | 62.5 | 266.6 | 25 | 0 | 0 |
| act-3 | 24479→26322 | 73 | 21 | 47.7 | 16.7 | 250 | 300 | 21.9 | 300 | 15 | 0 | 0 |
| act-4 | 34276→36273 | 70 | 16.9 | 59 | 16.7 | 250 | 483.2 | 24.3 | 483.2 | 20 | 0 | 0 |

### native — longest animation frames (LoAF total 41618 ms, main-thread work 925 ms, blocking 526 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 55.03 | contact | 801 | 0 | 14 | 1 | 13 | user-callback:IntersectionObserverCallback @ 3c41okqj08im4.js 8 ms | `e=>{let t=r;for(let n of e)n.isIntersecting&&(t=n.target.id);t!==r&&(r=t,i.forEach(e=>e())` |
| 53.66 | principles | 761 | 0 | 16 | 1 | 15 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r 8 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 7.24 | journey | 559 | 0 | 1 | 1 | 0 | (no script) |  |
| 47.74 | voices | 532 | 0 | 6 | 1 | 5 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 5 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |
| 8.57 | journey | 503 | 0 | 1 | 1 | 0 | (no script) |  |

### native — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 1.1 | act-1 | 234 | 179 | 220 | 1 | 219 | user-callback:IntersectionObserverCallback @ 3tw7jfo5o-q7k.js 219 ms | `e=>{e.forEach(e=>{let t=H.get(e.target);if(!t)return;let r=e.boundingClientRect;t.visible=` |
| 8.32 | journey | 168 | 87 | 124 | 3 | 121 | resolve-promise:Promise.resolve @ 3c41okqj08im4.js 121 ms |  |
| 26.15 | kill-list | 151 | 19 | 62 | 1 | 61 | event-listener:DOMWindow.onscroll @ 3c41okqj08im4.js e 61 ms | `()=>j(window.scrollY>12);return e(),window.addEventListener("scroll",e,{passive:!0}),()=>w` |
| 32.79 | films | 50 | 0 | 49 | 1 | 48 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r 48 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 53.66 | principles | 761 | 0 | 16 | 1 | 15 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r 8 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |

### native — layout shifts (CLS total 0.0321, session 0.016, 10 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 43.01 | 0.016 | beyond | span.scene-caption__sep in #beyond ; span[data-w] in #beyond ; span[data-words=scrub][data-words-variant=default] in #beyond |
| 6.1 | 0.0125 | about | span[data-w] in #about ; span[data-words=scrub][data-words-variant=default] in #about ; span[data-w] in #about |
| 16.05 | 0.0018 | trading-algos | span.scene-caption__film.world-face-idiots in #trading-algos ; p.scene-caption.mb-tier-group[data-caption=cap.trading-algos][data-caption-world=idiots] in #trading-algos |
| 53.61 | 0.0008 | principles | h3.type-title.text-fg.max-sm:hyphens-auto in #principles ; h3.type-title.text-fg.max-sm:hyphens-auto in #principles ; h3.type-title.text-fg.max-sm:hyphens-auto in #principles |
| 46.52 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 46.87 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 45.25 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 45.63 | 0.0001 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |

### native — visual pops (35; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 1.12 | 200 | act-1 | 0 | 2.1 | 17.9 | change | 2.3 | 1 |
| 2.23 | 900 | act-1 | 0 | 2.3 | 6.6 | change | 3.1 | 1 |
| 2.83 | 1400 | act-1 | 0 | 5.2 | 14.8 | change | 9.7 | 1 |
| 3.39 | 1500 | act-1 | 0 | 12.1 | 50.6 | change | 22.1 | 7 |
| 5.37 | 2300 | about | 0 | 6.5 | 36.4 | change | 10.3 | 2 |
| 5.70 | 2300 | about | 0 | 3.7 | 29.3 | change | 3.7 | 1 |
| 6.47 | 2900 | about | 0 | 10.2 | 15.4 | change | 23.8 | 4 |
| 9.80 | 5400 | act-2 | 0 | 4.1 | 406.2 | change | 8.6 | 1 |
| 11.36 | 7100 | act-2 | 0 | 23 | 44.2 | change | 35 | 3 |
| 12.71 | 7200 | act-2 | 0 | 6.5 | 64.3 | change | 11.4 | 1 |
| 12.95 | 7300 | work | 0 | 18 | 280.8 | change | 36.2 | 1 |
| 13.32 | 7600 | work | 0 | 14 | 138 | change | 22.4 | 1 |
| 14.62 | 9000 | work | 0 | 6 | 9.3 | change | 12.9 | 1 |
| 20.52 | 13700 | optuna-screener | 0 | 6.5 | 14.9 | change | 17.4 | 1 |
| 21.94 | 15900 | systems | 0 | 7 | 269.3 | fill-in | 18.5 | 4 |
| 30.29 | 21800 | films | 0 | 16 | 94.2 | change | 15 | 1 |
| 33.98 | 23300 | films | 0 | 7.5 | 752.2 | fill-in | 7.7 | 1 |
| 35.20 | 23900 | films | 0 | 2.8 | 17.6 | change | 4.8 | 1 |
| 37.22 | 24500 | act-3 | 0 | 3.8 | 13.3 | change | 5.8 | 2 |
| 38.74 | 25200 | act-3 | 0 | 15.6 | 94.3 | change | 19.4 | 3 |
| 39.99 | 25700 | beyond | 0 | 11.8 | 8.1 | fill-in | 10.6 | 3 |
| 43.42 | 28600 | beyond | 0 | 4.3 | 430 | change | 7.7 | 1 |
| 43.58 | 29300 | beyond | 0 | 11.2 | 1118.6 | fill-in | 10.7 | 1 |
| 44.34 | 30000 | writing | 0 | 4.4 | 435 | change | 3.4 | 4 |
| 47.62 | 32800 | voices | 0 | 6.4 | 14.4 | fill-in | 14.1 | 1 |
| 49.02 | 33500 | act-4 | 0 | 2.9 | 19.5 | change | 4.6 | 1 |
| 49.25 | 33600 | act-4 | 0 | 2.8 | 26.7 | change | 6.6 | 1 |
| 50.34 | 35200 | act-4 | 0 | 14.6 | 1277.7 | change | 32.6 | 2 |
| 50.60 | 35200 | act-4 | 0 | 19.6 | 1175.7 | change | 50.4 | 3 |
| 51.88 | 35300 | act-4 | 0 | 2.6 | 156 | change | 2.3 | 1 |
| 52.30 | 35400 | principles | 0 | 4.1 | 246.9 | change | 3.5 | 2 |
| 53.25 | 36200 | principles | 0 | 8.8 | 882.8 | change | 16.6 | 1 |
| 53.83 | 36500 | principles | 0 | 101.3 | 411.1 | change | 55.4 | 1 |
| 54.38 | 37200 | principles | 0 | 54.3 | 50.4 | change | 30.8 | 1 |
| 54.97 | 37600 | principles | 0 | 51.6 | 27.4 | change | 29.3 | 1 |

## alt — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 16 | 20 | 50 | 16.8 | 233.4 | 233.4 | 31.3 | 31.3 | 233.4 | 5 | 136 | 40 | 0 | 501.3 | 50 | #document ×10; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×10 | user-callback:IntersectionObserverCallback @ 3tw7jfo5o-q7k.js (177 ms) | 1 canvas, 1 filter, 1 mask, 4 will-change, 1.2 MP of images |
| act-1 | 58 | 12 | 83.6 | 50 | 183.4 | 383.3 | 77.6 | 48.3 | 383.3 | 33 | 0 | 0 | 0 | 552 | 33.4 | #document ×29; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×27 | user-callback:IntersectionObserverCallback @ 0gidbk80-6e1r.js (8 ms) | 3 mask, 18 will-change, 14 infinite anims, 1.3 MP of images |
| about | 8 | 6.2 | 162.5 | 183.4 | 316.7 | 316.7 | 100 | 87.5 | 316.7 | 6 | 0 | 0 | 0.0125 | 809.2 | 26.2 | #document ×7; div.act-card-stage.relative.flex in #act-2 ×7 | resolve-promise:Response.blob.then @ 3qb1qrlov240j.js (22 ms) | 1 mask |
| journey | 42 | 12.1 | 82.9 | 33.3 | 233.3 | 383.4 | 45.2 | 45.2 | 383.4 | 16 | 0 | 0 | 0 | 286.8 | 62.9 | #document ×41; div.act-card-stage.relative.flex in #act-2 ×41 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (6 ms) | 1 mask, 1 will-change, 0.6 MP of images |
| act-2 | 107 | 24.7 | 40.5 | 16.7 | 133.3 | 316.6 | 16.8 | 16.8 | 366.6 | 18 | 357 | 11.1 | 0 | 28.2 | 48.7 | #document ×43; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×32 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (10 ms) | 1 filter, 3 mask, 17 will-change, 12 infinite anims, 1.9 MP of images |
| work | 69 | 20.7 | 48.3 | 16.7 | 183.3 | 283.3 | 29 | 24.6 | 283.3 | 14 | 220 | 10 | 0 | 31.8 | 60 | #document ×25; div.act-card-stage.relative.flex in #act-2 ×25 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (9 ms) | 4 filter, 1 blend, 2 mask, 1 will-change, 0.8 MP of images |
| trading-algos | 57 | 17.1 | 58.5 | 16.7 | 249.9 | 316.6 | 33.3 | 31.6 | 316.6 | 14 | 0 | 0 | 0.0018 | 16.5 | 48.3 | #document ×34; div.act-card-stage.relative.flex in #act-2 ×30 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (6 ms) | 2 filter, 0.1 MP of images |
| optuna-screener | 81 | 17.5 | 57.2 | 16.7 | 250 | 300 | 32.1 | 30.9 | 300 | 20 | 248 | 7.7 | 0 | 20.3 | 70.8 | #document ×65; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×60 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (11 ms) | 3 filter, 1 mask, 1 will-change, 1.3 MP of images |
| experiment | 33 | 30 | 33.3 | 16.7 | 100.1 | 116.6 | 27.3 | 21.2 | 116.6 | 6 | 0 | 0 | 0 | 17.3 | 43.6 | #document ×18; div.pointer-events-none.absolute.inset-x-0 in #systems ×9 |  |  |
| systems | 54 | 21 | 47.5 | 16.7 | 199.9 | 200.1 | 33.3 | 29.6 | 200.1 | 16 | 0 | 0 | 0 | 28.1 | 57.7 | #document ×42; div.relative.@container.overflow-clip in #header ×30 | event-listener:DOMWindow.onscroll @ 0i5v3qc-ervn9.js m (6 ms) | 1 mask, 0.6 MP of images |
| kill-list | 63 | 21 | 47.6 | 16.7 | 133.4 | 183.4 | 33.3 | 30.2 | 183.4 | 14 | 23 | 4.8 | 0 | 20.7 | 43.3 | #document ×49; div.stage-window in #optuna-screener ×30 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (66 ms) | 1 mask, 2 will-change, 0.1 MP of images |
| films | 450 | 28.8 | 34.8 | 16.7 | 133.3 | 233.3 | 17.8 | 14.7 | 466.7 | 62 | 340 | 6.3 | 0 | 82.6 | 47.9 | #document ×247; div.act-card-stage.relative.flex in #act-3 ×76 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (61 ms) | 2 mask, 6 will-change, 3.3 MP of images |
| act-3 | 126 | 27.6 | 36.2 | 16.7 | 150 | 316.6 | 12.7 | 12.7 | 366.6 | 16 | 0 | 0 | 0 | 22.3 | 27.8 | #document ×28; div.stage-window in #beyond ×20 |  | 1 filter, 2 mask, 9 will-change, 1 MP of images |
| beyond | 123 | 18.2 | 54.9 | 16.7 | 166.7 | 466.7 | 34.1 | 31.7 | 483.4 | 25 | 0 | 0 | 0.0275 | 65.2 | 51.1 | #document ×80; div.act-card-stage.relative.flex in #act-3 ×60 | user-callback:FrameRequestCallback @ 3u_vlb8_9wwtr.js (12 ms) | 7 mask, 1 will-change, 3.5 MP of images |
| writing | 81 | 23.7 | 42.2 | 16.7 | 116.7 | 166.7 | 33.3 | 29.6 | 166.7 | 21 | 157 | 11.1 | 0.0006 | 19.9 | 112.4 | #document ×81; div.act-card-stage.relative.flex in #act-4 ×81 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (17 ms) | 4 mask, 2 will-change |
| voices | 36 | 23 | 43.5 | 16.7 | 133.3 | 200 | 33.3 | 30.6 | 200 | 10 | 0 | 0 | 0 | 9.6 | 45.3 | #document ×23; div.act-card-stage.relative.flex in #act-4 ×23 |  | 9 will-change, 9 infinite anims, 1.8 MP of images |
| act-4 | 160 | 33 | 30.3 | 16.7 | 116.7 | 200 | 13.8 | 11.3 | 316.7 | 15 | 0 | 0 | 0 | 52 | 28.2 | #document ×48; div.act-card-stage.relative.flex in #act-4 ×28 |  | 1 canvas, 1 blend, 2 mask, 27 will-change, 21 infinite anims, 1.2 MP of images |
| principles | 54 | 8.1 | 123.8 | 16.8 | 466.7 | 633.2 | 40.7 | 38.9 | 633.2 | 16 | 0 | 0 | 0 | 283 | 12.6 | #document ×40; div.act-card-stage.relative.flex in #act-4 ×36 | event-listener:DOMWindow.onscroll @ 0i5v3qc-ervn9.js m (11 ms) | 3 mask |
| contact | 12 | 7.5 | 133.3 | 83.3 | 500 | 500 | 50 | 50 | 500 | 6 | 92 | 16.7 | 0 | 397.5 | 23.8 | #document ×8; div.act-card-stage.relative.flex in #act-4 ×8 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (5 ms) | 4 mask, 0.5 MP of images |
| credits | 150 | 28.1 | 35.6 | 16.7 | 183.4 | 249.9 | 12 | 12 | 250 | 10 | 367 | 11.1 | 0 | 11.8 | 18.9 | #document ×38; div.stage-cam ×23 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (17 ms) |  |

### alt — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 384→2817 | 61 | 11.5 | 86.9 | 50 | 183.4 | 383.3 | 49.2 | 383.3 | 35 | 0 | 0 |
| act-2 | 6159→8156 | 119 | 22.7 | 44.1 | 16.7 | 216.7 | 316.6 | 18.5 | 366.6 | 22 | 524 | 13.6 |
| act-3 | 24520→26363 | 137 | 23 | 43.4 | 16.7 | 216.6 | 466.7 | 14.6 | 483.4 | 17 | 0 | 0 |
| act-4 | 34143→36140 | 169 | 32 | 31.3 | 16.7 | 116.6 | 200 | 12.4 | 316.7 | 19 | 0 | 0 |

### alt — longest animation frames (LoAF total 49369 ms, main-thread work 922 ms, blocking 1940 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 71.37 | principles | 716 | 0 | 7 | 1 | 6 | event-listener:DOMWindow.onscroll @ 0i5v3qc-ervn9.js m 6 ms | `()=>{o(),l===c\|\|(d?.disconnect(),d=null,c=l,u=!1,l&&(d=new IntersectionObserver(([e])=>{(u` |
| 74.07 | principles | 634 | 0 | 1 | 1 | 0 | (no script) |  |
| 75.3 | principles | 529 | 0 | 7 | 1 | 6 | user-callback:FrameRequestCallback @ 3u_vlb8_9wwtr.js 6 ms | `()=>{c=0,k()}))}function T(){if(r.size&&(0,i.scrollVelocity)()>=o.below)for(let e of r.val` |
| 52.93 | act-3 | 497 | 0 | 3 | 3 | 0 | (no script) |  |
| 72.12 | principles | 486 | 0 | 1 | 1 | 0 | (no script) |  |

### alt — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 0.47 | top | 186 | 136 | 178 | 1 | 177 | user-callback:IntersectionObserverCallback @ 3tw7jfo5o-q7k.js 177 ms | `e=>{e.forEach(e=>{let t=H.get(e.target);if(!t)return;let r=e.boundingClientRect;t.visible=` |
| 32.62 | kill-list | 73 | 23 | 68 | 2 | 66 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v 66 ms | `()=>{let i=e.MotionGlobalConfig.useManualTiming,o=i?a.timestamp:performance.now();n=!1,i\|\|` |
| 33.77 | films | 309 | 16 | 63 | 2 | 61 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v 61 ms | `()=>{let i=e.MotionGlobalConfig.useManualTiming,o=i?a.timestamp:performance.now();n=!1,i\|\|` |
| 5.79 | about | 324 | 0 | 34 | 1 | 33 | resolve-promise:Response.blob.then @ 3qb1qrlov240j.js 22 ms |  |
| 80.88 | credits | 209 | 159 | 15 | 3 | 12 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v 12 ms | `()=>{let i=e.MotionGlobalConfig.useManualTiming,o=i?a.timestamp:performance.now();n=!1,i\|\|` |

### alt — layout shifts (CLS total 0.0425, session 0.0275, 10 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 57.9 | 0.0275 | beyond | span.scene-caption__sep in #beyond ; span[data-w] in #beyond ; span[data-words=scrub][data-words-variant=default] in #beyond |
| 6.59 | 0.0125 | about | span[data-w] in #about ; span[data-words=scrub][data-words-variant=default] in #about ; span[data-w] in #about |
| 19.31 | 0.0018 | trading-algos | span.scene-caption__film.world-face-idiots in #trading-algos ; p.scene-caption.mb-tier-group[data-caption=cap.trading-algos][data-caption-world=idiots] in #trading-algos |
| 61.99 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 61 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 61.72 | 0.0001 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 62.58 | 0 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 28.72 | 0 | systems | h3.type-heading.text-fg.lg:text-[length:var(--text-lead)] in #systems |

### alt — visual pops (13; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 11.49 | 6808 | act-2 | 33 | 16.5 | 3.9 | change | 27.8 | 1 |
| 12.64 | 7097 | act-2 | 21 | 8.6 | 5.4 | change | 17.5 | 1 |
| 14.57 | 7386 | act-2 | 3 | 16 | 1597 | change | 23.5 | 1 |
| 15.24 | 7699 | work | 20 | 18.8 | 1881.5 | change | 30.7 | 1 |
| 15.65 | 8074 | work | 10 | 14.9 | 408 | change | 27.4 | 3 |
| 37.74 | 21753 | films | 9 | 51 | 70.2 | change | 48.4 | 1 |
| 39.97 | 22027 | films | 8 | 6.2 | 618.9 | change | 13.2 | 3 |
| 40.31 | 22065 | films | 14 | 9.2 | 920.1 | change | 18 | 3 |
| 41.30 | 22870 | films | 10 | 19.2 | 4.9 | change | 37.2 | 1 |
| 45.43 | 23978 | films | 12 | 10.3 | 4.3 | change | 20.2 | 1 |
| 59.84 | 30243 | writing | 12 | 13.1 | 3.9 | change | 14.1 | 1 |
| 63.47 | 32871 | voices | 34 | 14.6 | 4.5 | change | 38.3 | 1 |
| 66.47 | 34976 | act-4 | 15 | 18.3 | 3.7 | change | 50.6 | 2 |

## rm — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 22 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 13.6 | 30 | #document ×7; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×3 |  | 0.6 MP of images |
| act-1 | 170 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 1.4 | 2.1 | #document ×5; img.object-cover in #act-2 ×1 |  | 2 mask, 0.6 MP of images |
| about | 85 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 47.3 | 3.5 | #document ×4; node 72 ×1 |  | 1 mask |
| journey | 60 | 54.5 | 18.3 | 16.7 | 16.8 | 100 | 1.7 | 1.7 | 100 | 1 | 62 | 100 | 0.1164 | 9.1 | 3.6 | #document ×3; node 72 ×1 | user-callback:FrameRequestCallback (102 ms) | 1 mask, 0.2 MP of images |
| act-2 | 124 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 1.5 | 1.9 | #document ×3; header.fixed.inset-x-0.top-0 in #header ×1 |  | 1 filter, 2 mask, 0.6 MP of images |
| work | 139 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 15.5 | 1.3 | #document ×3 |  | 4 filter, 1 blend, 2 mask, 1 will-change, 0.8 MP of images |
| trading-algos | 105 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 5.1 | 1.7 | #document ×3 |  | 2 filter |
| optuna-screener | 152 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 14.6 | 3.9 | #document ×8; div.absolute.inset-x-0.top-0 in #kill-list ×1 |  | 2 filter, 0.6 MP of images |
| experiment | 65 | 59.1 | 16.9 | 16.7 | 16.8 | 33.4 | 0 | 0 | 33.4 | 0 | 0 |  | 0 | 28.2 | 2.7 | #document ×3 |  |  |
| systems | 119 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 4.5 | 2 | #document ×4 |  | 1 mask, 0.6 MP of images |
| kill-list | 122 | 46.9 | 21.3 | 16.7 | 49.9 | 133.4 | 6.6 | 3.3 | 166.6 | 5 | 0 | 0 | 0 | 243.5 | 32.7 | #document ×30; ol.relative.border-t.border-rule in #kill-list ×9 | user-callback:FrameRequestCallback (5 ms) | 1 mask, 1 will-change, 0.1 MP of images |
| films | 566 | 57.3 | 17.5 | 16.7 | 16.8 | 50 | 1.1 | 0.9 | 133.4 | 6 | 165 | 33.3 | 0 | 22.3 | 1.6 | #document ×14; div.absolute.inset-x-0.top-0 in #kill-list ×2 | user-callback:FrameRequestCallback (246 ms) | 2.2 MP of images |
| act-3 | 137 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 3.1 | 1.8 | #document ×3; header.fixed.inset-x-0.top-0 in #header ×1 |  | 2 mask, 0.5 MP of images |
| beyond | 258 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 14.9 | 3 | #document ×7; div.rdr2-module__R8wI0W__campSticky in #voices ×3 |  | 6 mask, 2.2 MP of images |
| writing | 158 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 1.5 | 6.1 | #document ×4; div.rdr2-module__R8wI0W__campSticky in #voices ×4 |  | 4 mask, 2 will-change |
| voices | 99 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 1.8 | 6.7 | #document ×4; div.rdr2-module__R8wI0W__campSticky in #voices ×3 |  | 1.2 MP of images |
| act-4 | 130 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 2.8 | 2.8 | #document ×3; div.rdr2-module__R8wI0W__campSticky in #voices ×2 |  | 2 mask, 0.6 MP of images |
| principles | 159 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 36.2 | 7.5 | #document ×10; div.rdr2-module__R8wI0W__campSticky in #voices ×10 |  | 2 will-change |
| contact | 52 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 32.3 | 0 |  |  | 4 mask, 0.5 MP of images |
| credits | 207 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 0.6 | 1.2 | #document ×2; header.fixed.inset-x-0.top-0 in #header ×1 |  |  |

### rm — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 384→2093 | 189 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 16.8 | 0 | 0 |  |
| act-2 | 4013→5182 | 151 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 16.8 | 0 | 0 |  |
| act-3 | 20192→21384 | 157 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 16.8 | 0 | 0 |  |
| act-4 | 28847→30012 | 157 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 16.8 | 0 | 0 |  |

### rm — longest animation frames (LoAF total 1201 ms, main-thread work 381 ms, blocking 227 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 19.64 | kill-list | 162 | 0 | 1 | 1 | 0 | (no script) |  |
| 22.07 | films | 152 | 92 | 140 | 8 | 132 | user-callback:FrameRequestCallback 132 ms |  |
| 23.18 | films | 139 | 73 | 122 | 8 | 114 | user-callback:FrameRequestCallback 114 ms |  |
| 19.39 | kill-list | 132 | 0 | 3 | 3 | 0 | (no script) |  |
| 4.91 | journey | 127 | 62 | 110 | 8 | 102 | user-callback:FrameRequestCallback 102 ms |  |

### rm — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 22.07 | films | 152 | 92 | 140 | 8 | 132 | user-callback:FrameRequestCallback 132 ms |  |
| 23.18 | films | 139 | 73 | 122 | 8 | 114 | user-callback:FrameRequestCallback 114 ms |  |
| 4.91 | journey | 127 | 62 | 110 | 8 | 102 | user-callback:FrameRequestCallback 102 ms |  |
| 19.95 | kill-list | 125 | 0 | 5 | 0 | 5 | user-callback:FrameRequestCallback 5 ms |  |
| 19.39 | kill-list | 132 | 0 | 3 | 3 | 0 | (no script) |  |

### rm — layout shifts (CLS total 0.1164, session 0.1164, 1 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 5.04 | 0.1164 | journey | li.max-w-[34ch] in #about ; li.max-w-[34ch] in #about ; div.world-ground.pointer-events-none.absolute in #journey |

### rm — visual pops (0; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)


## gl — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 16 | 19.2 | 52.1 | 16.7 | 266.7 | 266.7 | 31.3 | 31.3 | 266.7 | 5 | 212 | 40 | 0 | 487.2 | 60 | #document ×10; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×10 | user-callback:IntersectionObserverCallback @ 3tw7jfo5o-q7k.js (257 ms) | 1 filter, 1 blend, 1 mask, 5 will-change, 1.2 MP of images |
| act-1 | 69 | 14.9 | 67.1 | 50 | 166.7 | 233.4 | 66.7 | 43.5 | 233.4 | 34 | 0 | 0 | 0 | 429.1 | 45.5 | #document ×37; div.absolute.inset-0.will-change-transform in #top ×33 |  | 4 mask, 18 will-change, 14 infinite anims, 1.2 MP of images |
| about | 14 | 10.2 | 97.6 | 66.7 | 283.3 | 283.3 | 78.6 | 64.3 | 283.3 | 10 | 0 | 0 | 0.0125 | 807.8 | 58.5 | #document ×14; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×14 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (19 ms) | 1 mask |
| journey | 38 | 13.7 | 73.2 | 83.3 | 116.7 | 149.9 | 78.9 | 65.8 | 149.9 | 26 | 74 | 3.3 | 0 | 671.5 | 82.6 | #document ×35; div.act-card-stage.relative.flex in #act-2 ×35 | resolve-promise:Promise.resolve @ 3c41okqj08im4.js (111 ms) | 1 mask, 1 will-change, 0.6 MP of images |
| act-2 | 87 | 21.8 | 46 | 33.3 | 116.6 | 200.1 | 43.7 | 32.2 | 200.1 | 31 | 98 | 10.5 | 0 | 536.8 | 91.3 | #document ×46; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×38 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r (214 ms) | 2 filter, 3 mask, 20 will-change, 12 infinite anims, 2.4 MP of images |
| work | 56 | 24.9 | 40.2 | 16.8 | 100 | 150 | 35.7 | 26.8 | 150 | 15 | 0 | 0 | 0 | 588 | 107.1 | div.relative.sm:overflow-hidden.sm:rounded-frame in #work ×27; #document ×26 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (5 ms) | 3 filter, 1 blend, 2 mask, 2 will-change, 1.6 MP of images |
| trading-algos | 52 | 21.2 | 47.1 | 16.7 | 116.7 | 150 | 42.3 | 34.6 | 150 | 18 | 0 | 0 | 0.0018 | 652.7 | 79.2 | #document ×28; div.relative.sm:overflow-hidden.sm:rounded-frame in #work ×20 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (7 ms) | 2 filter, 0.1 MP of images |
| optuna-screener | 58 | 17.6 | 56.9 | 33.4 | 133.3 | 216.6 | 48.3 | 39.7 | 216.6 | 22 | 0 | 0 | 0 | 703.7 | 141.5 | #document ×58; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×58 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (6 ms) | 2 filter, 1.3 MP of images |
| experiment | 35 | 33.3 | 30 | 16.7 | 83.2 | 100.1 | 22.9 | 11.4 | 100.1 | 5 | 0 | 0 | 0 | 585.8 | 100 | #document ×21; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×17 |  |  |
| systems | 41 | 19.8 | 50.4 | 49.9 | 100 | 116.7 | 53.7 | 36.6 | 116.7 | 15 | 0 | 0 | 0 | 852.1 | 94.4 | #document ×39; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×28 |  | 1 mask, 1 will-change, 0.6 MP of images |
| kill-list | 37 | 16.1 | 62.2 | 66.7 | 116.8 | 133.4 | 70.3 | 56.8 | 133.4 | 21 | 27 | 7.7 | 0 | 818.7 | 72.6 | #document ×36; div.relative.@container.will-change-[transform,opacity] in #header ×35 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (72 ms) | 1 mask, 3 will-change, 0.3 MP of images |
| films | 588 | 43.3 | 23.1 | 16.7 | 50.1 | 100 | 10.7 | 6.3 | 233.4 | 35 | 257 | 9.5 | 0 | 267.2 | 98.1 | #document ×401; div.act-card-stage.relative.flex in #act-3 ×149 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (84 ms) | 4 will-change, 3.8 MP of images |
| act-3 | 146 | 37.3 | 26.8 | 16.7 | 83.4 | 183.3 | 12.3 | 9.6 | 216.7 | 13 | 0 | 0 | 0 | 261.7 | 55.7 | #document ×55; div.stage-window in #beyond ×42 |  | 1 filter, 3 mask, 6 will-change, 1 MP of images |
| beyond | 95 | 20.1 | 49.8 | 33.4 | 116.7 | 300 | 46.3 | 26.3 | 300 | 27 | 0 | 0 | 0.0275 | 687.1 | 72.3 | #document ×75; div.act-card-stage.relative.flex in #act-3 ×60 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (5 ms) | 7 mask, 1 will-change, 4.5 MP of images |
| writing | 65 | 24.1 | 41.5 | 33.4 | 83.3 | 83.4 | 43.1 | 21.5 | 83.4 | 15 | 0 | 0 | 0.0009 | 799.7 | 209.6 | #document ×64; div.act-card-stage.relative.flex in #act-4 ×64 |  | 5 mask, 3 will-change |
| voices | 44 | 23.4 | 42.8 | 33.3 | 100 | 183.3 | 34.1 | 29.5 | 183.3 | 12 | 0 | 0 | 0 | 520.4 | 154 | #document ×38; div.act-card-stage.relative.flex in #act-4 ×34 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r (38 ms) | 1 mask, 12 will-change, 9 infinite anims, 1.8 MP of images |
| act-4 | 120 | 29.9 | 33.5 | 16.7 | 133.3 | 183.3 | 22.5 | 17.5 | 183.3 | 21 | 0 | 0 | 0 | 348.1 | 40.6 | #document ×42; div.rdr2-module__R8wI0W__campSticky in #voices ×40 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (11 ms) | 2 canvas, 3 mask, 26 will-change, 21 infinite anims, 1.2 MP of images |
| principles | 21 | 7.1 | 141.3 | 133.3 | 283.4 | 350 | 85.7 | 81 | 350 | 17 | 0 | 0 | 0.0011 | 935.1 | 33.4 | #document ×22; div.rdr2-module__R8wI0W__campSticky in #voices ×22 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (6 ms) | 7 will-change |
| contact | 4 | 4.1 | 241.7 | 233.3 | 433.3 | 433.3 | 100 | 100 | 433.3 | 4 | 0 | 0 | 0 | 909.4 | 27.9 | #document ×4; div.plate-cam.absolute.inset-0 in #contact ×4 | user-callback:IntersectionObserverCallback @ 3c41okqj08im4.js (5 ms) | 4 mask, 1 MP of images |
| credits | 110 | 28 | 35.8 | 33.3 | 66.7 | 83.4 | 22.7 | 10.9 | 283.4 | 17 | 0 | 0 | 0 | 586.5 | 21.9 | #document ×39; div.stage-cam ×21 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (10 ms) | 1 will-change |

### gl — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 384→2846 | 73 | 14.2 | 70.5 | 50 | 183.3 | 250 | 46.6 | 250 | 39 | 0 | 0 |
| act-2 | 6188→8185 | 98 | 22.4 | 44.7 | 33.3 | 116.6 | 200.1 | 30.6 | 200.1 | 34 | 98 | 9.5 |
| act-3 | 24479→26322 | 152 | 34 | 29.4 | 16.7 | 83.4 | 216.7 | 10.5 | 300 | 18 | 0 | 0 |
| act-4 | 34276→36273 | 125 | 27.4 | 36.5 | 16.7 | 149.9 | 183.3 | 19.2 | 216.7 | 24 | 0 | 0 |

### gl — longest animation frames (LoAF total 34017 ms, main-thread work 1402 ms, blocking 668 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 60.83 | contact | 433 | 0 | 6 | 1 | 5 | user-callback:IntersectionObserverCallback @ 3c41okqj08im4.js 5 ms | `e=>{let t=r;for(let n of e)n.isIntersecting&&(t=n.target.id);t!==r&&(r=t,i.forEach(e=>e())` |
| 59.55 | principles | 351 | 0 | 1 | 1 | 0 | (no script) |  |
| 44.69 | beyond | 301 | 0 | 1 | 1 | 0 | (no script) |  |
| 60.04 | principles | 282 | 0 | 1 | 1 | 0 | (no script) |  |
| 6.14 | about | 281 | 0 | 1 | 1 | 0 | (no script) |  |

### gl — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 0.47 | top | 266 | 212 | 258 | 1 | 257 | user-callback:IntersectionObserverCallback @ 3tw7jfo5o-q7k.js 257 ms | `e=>{e.forEach(e=>{let t=H.get(e.target);if(!t)return;let r=e.boundingClientRect;t.visible=` |
| 7.71 | journey | 155 | 74 | 112 | 1 | 111 | resolve-promise:Promise.resolve @ 3c41okqj08im4.js 111 ms |  |
| 9.78 | act-2 | 105 | 53 | 100 | 1 | 99 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r 99 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 9.62 | act-2 | 104 | 45 | 90 | 1 | 89 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r 89 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 27.92 | films | 262 | 174 | 76 | 2 | 74 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v 74 ms | `()=>{let i=e.MotionGlobalConfig.useManualTiming,o=i?a.timestamp:performance.now();n=!1,i\|\|` |

### gl — layout shifts (CLS total 0.0438, session 0.0275, 10 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 47.77 | 0.0275 | beyond | span.scene-caption__film.world-face-rdr2 in #beyond ; span[data-w] in #beyond ; span[data-words=scrub][data-words-variant=default] in #beyond |
| 6.42 | 0.0125 | about | span[data-w] in #about ; span[data-words=scrub][data-words-variant=default] in #about ; span[data-w] in #about |
| 16.95 | 0.0018 | trading-algos | span.scene-caption__film.world-face-idiots in #trading-algos ; p.scene-caption.mb-tier-group[data-caption=cap.trading-algos][data-caption-world=idiots] in #trading-algos |
| 58.76 | 0.0011 | principles | span.scene-caption__film.world-face-hp in #principles ; p.scene-caption[data-caption=cap.principles][data-caption-world=hp] in #principles ; h3.type-title.text-fg.max-sm:hyphens-auto in #principles |
| 51.43 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 50.2 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 51.06 | 0.0001 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 50.67 | 0.0001 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |

### gl — visual pops (5; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 6.20 | 2458 | about | 27 | 9.5 | 253 | change | 15 | 1 |
| 13.78 | 7416 | work | 35 | 15.7 | 1574 | change | 25.3 | 5 |
| 34.31 | 22230 | films | 37 | 14.1 | 201.2 | change | 23.2 | 9 |
| 36.77 | 22945 | films | 5 | 4.9 | 491.6 | change | 10.2 | 1 |
| 57.75 | 35296 | act-4 | 31 | 3 | 298 | change | 1.5 | 1 |

## Strips

- strips/intro.png
- strips/intro-landing.png
- strips/pop-intro-46.png
- strips/pop-intro-41.png
- strips/pop-intro-137.png
- strips/pop-intro-14.png
- strips/desktop-act-1.png
- strips/desktop-act-2.png
- strips/desktop-act-3.png
- strips/desktop-act-4.png
- strips/desktop-first-60s.png
- strips/pop-desktop-128.png
- strips/pop-desktop-152.png
- strips/pop-desktop-955.png
- strips/native-act-1.png
- strips/native-act-2.png
- strips/native-act-3.png
- strips/native-act-4.png
- strips/native-first-60s.png
- strips/pop-native-933.png
- strips/pop-native-937.png
- strips/pop-native-940.png
- strips/pop-native-682.png
- strips/alt-act-1.png
- strips/alt-act-2.png
- strips/alt-act-3.png
- strips/alt-act-4.png
- strips/alt-first-60s.png
- strips/pop-alt-682.png
- strips/pop-alt-744.png
- strips/pop-alt-226.png
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
- strips/pop-gl-192.png
- strips/pop-gl-573.png
- strips/pop-gl-89.png
