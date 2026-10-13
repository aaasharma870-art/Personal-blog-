# Motion baseline — 2026-10-03T13:35:45.699Z

Base http://localhost:3161 · Chromium 141.0.7390.37 headless · 4 CPUs · screencast everyNthFrame=1.

> Headless Chromium rasterises in software (SwiftShader) on a few CPUs and pays for the screencast readback, so absolute frame times are pessimistic vs a real laptop/phone GPU. Read them as RELATIVE hotspots: which sections and transitions are worst. "busy∩jank %" = share of >33.4 ms frames that overlap a long animation frame in which the main thread really worked (script + style/layout/paint >= half the frame, or a >50 ms task); low = the frame was raster/composite-bound (the LoAF is the main thread waiting on the compositor), high = main-thread script/style/layout. "paint suspects" = what the section holds that is costly to raster (filters, blend, masks, canvas, video, image megapixels, infinite animations).

## Runs

| run | viewport | lenis | secs | rAF frames | fps | mean ms | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | LoAF block ms | busy∩jank % | CLS total | CLS (session) | pops | shots |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| intro | 1440x900 |  | 12 | 242 | 20.2 | 49.4 | 33.3 | 116.7 | 333.3 | 45 | 33.5 | 583.3 | 120 | 537 | 5.5 | 0 | 0 | 7 | 143 |
| desktop | 1440x900 | on | 72.1 | 1229 | 17 | 58.7 | 16.8 | 200.1 | 433.3 | 37.1 | 29.4 | 800 | 368 | 573 | 4.4 | 0.0196 | 0.0113 | 10 | 769 |
| native | 1440x900 | off | 64.2 | 656 | 10.2 | 97.8 | 49.9 | 333.3 | 700 | 51.1 | 43.1 | 1233.3 | 282 | 610 | 4.5 | 0.0204 | 0.0113 | 42 | 780 |
| alt | 1440x900 | on | 99.8 | 1482 | 14.8 | 67.3 | 16.7 | 266.7 | 516.7 | 28.9 | 27.3 | 699.9 | 336 | 3749 | 6.1 | 0.0166 | 0.0132 | 21 | 1196 |
| rm | 1440x900 | off | 53.8 | 3086 | 57.4 | 17.4 | 16.7 | 16.8 | 16.8 | 0.4 | 0.4 | 550 | 12 | 281 | 30.8 | 0.061 | 0.061 | 0 | 465 |
| gl | 1440x900 | on | 70.5 | 1320 | 18.7 | 53.4 | 33.3 | 183.4 | 316.7 | 37.6 | 29.1 | 616.7 | 401 | 524 | 3 | 0.0171 | 0.0113 | 8 | 843 |

## Top 10 hotspots (by mean frame time; rm excluded)

| # | run | where | frames | fps | mean | p95 | p99 | >50 % | max | mean / run mean | LoAF block ms | likely cause |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | native | principles | 8 | 2 | 506.2 | 1233.3 | 1233.3 | 87.5 | 1233.3 | 5.2 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 98.1% waiting for the compositor — on screen: 7 will-change [while scrolling: raster 892.9 ms/s, 11.1 paints/s — repainting: #document ×8; div.act-card-stage.relative.flex in #act-4 ×6 \| idle 60.6 fps, raster 0 ms/s, 0 paints/s] |
| 2 | native | act-1 | 21 | 4.1 | 246.8 | 933.2 | 1100 | 76.2 | 1100 | 2.5 | 305 | raster/composite-bound: only 11.1% of janky frames overlap real main-thread work; the LoAFs are 91.9% waiting for the compositor — on screen: 4 mask, 18 will-change, 14 infinite anims, 2.3 MP of images [while scrolling: raster 458.8 ms/s, 19.9 paints/s — repainting: #document ×19; div.absolute.inset-0.origin-center in #top ×11 \| idle 30.7 fps, raster 0 ms/s, 0 paints/s] |
| 3 | native | voices | 8 | 4.5 | 222.9 | 666.7 | 666.7 | 75 | 666.7 | 2.3 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 97.6% waiting for the compositor — on screen: 1 mask, 12 will-change, 9 infinite anims, 3.5 MP of images [while scrolling: raster 380.2 ms/s, 39.8 paints/s — repainting: #document ×9; div.act-card-stage.relative.flex in #act-4 ×8 \| idle 58.7 fps, raster 0 ms/s, 0 paints/s] |
| 4 | gl | principles | 15 | 4.5 | 221.1 | 516.6 | 516.6 | 80 | 516.6 | 4.1 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.4% waiting for the compositor — on screen: 7 will-change [while scrolling: raster 1005 ms/s, 21.7 paints/s — repainting: #document ×15; div.act-card-stage.relative.flex in #act-4 ×15 \| idle 60.6 fps, raster 0 ms/s, 0 paints/s] |
| 5 | desktop | act-1 | 25 | 4.6 | 216.7 | 733.3 | 800 | 84 | 800 | 3.7 | 0 | raster/composite-bound: only 4.3% of janky frames overlap real main-thread work; the LoAFs are 99.4% waiting for the compositor — on screen: 4 mask, 18 will-change, 14 infinite anims, 2.3 MP of images [while scrolling: raster 613.5 ms/s, 25.5 paints/s — repainting: #document ×22; div.absolute.inset-0.origin-center in #top ×20 \| idle 30.7 fps, raster 0 ms/s, 0 paints/s] |
| 6 | desktop | principles | 15 | 4.9 | 203.3 | 383.3 | 383.3 | 93.3 | 383.3 | 3.5 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.3% waiting for the compositor — on screen: 7 will-change [while scrolling: raster 975.5 ms/s, 24.6 paints/s — repainting: #document ×15; div.act-card-stage.relative.flex in #act-4 ×15 \| idle 60.6 fps, raster 0 ms/s, 0 paints/s] |
| 7 | alt | contact | 9 | 5 | 198.1 | 666.7 | 666.7 | 55.6 | 666.7 | 2.9 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 98.2% waiting for the compositor — on screen: 4 mask, 0.9 MP of images [while scrolling: raster 630.9 ms/s, 22.4 paints/s — repainting: #document ×9; div.origin-right in #principles ×9 \| idle 60.2 fps, raster 0 ms/s, 0 paints/s] |
| 8 | native | optuna-screener | 16 | 5.1 | 194.8 | 533.2 | 533.2 | 81.3 | 533.2 | 2 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 98.7% waiting for the compositor — on screen: 2 filter, 2.1 MP of images [while scrolling: raster 526.2 ms/s, 49.1 paints/s — repainting: #document ×16; div.stage-window in #trading-algos ×14 \| idle 60.4 fps, raster 0 ms/s, 0 paints/s] |
| 9 | desktop | top | 11 | 6.5 | 154.5 | 799.9 | 799.9 | 36.4 | 799.9 | 2.6 | 224 | raster/composite-bound: only 25% of janky frames overlap real main-thread work; the LoAFs are 84.2% waiting for the compositor — on screen: 1 filter, 1 blend, 1 mask, 5 will-change, 2.3 MP of images [while scrolling: raster 421.8 ms/s, 11.8 paints/s — repainting: #document ×4; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×4 \| idle 0.6 fps, raster 3.8 ms/s, 12.7 paints/s] |
| 10 | native | beyond | 32 | 6.6 | 150.5 | 400.1 | 733.2 | 68.8 | 733.2 | 1.5 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.7% waiting for the compositor — on screen: 7 mask, 1 will-change, 5.8 MP of images [while scrolling: raster 528.6 ms/s, 35.5 paints/s — repainting: #document ×31; div.act-card-stage.relative.flex in #act-3 ×15 \| idle 60.4 fps, raster 0 ms/s, 0 paints/s] |

## Idle probe (desktop: parked 2.5 s on each section, then 1.5 s traced standing still; high raster with few paints = a raster-heavy layer, many paints/s = continuous animation)

| section | idle fps | raster ms/s | paints/s | paint ms/s | style+layout ms/s | rAF JS ms/s | top repainting nodes |
|---|---|---|---|---|---|---|---|
| top | 0.6 | 3.8 | 12.7 | 1 | 1.7 | 1.4 | #document ×1; div.act-card-stage.relative.flex ×1; video.absolute.inset-0.size-full ×1 |
| act-1 | 30.7 | 0 | 0 | 0 | 6.4 | 13.3 |  |
| about | 60.2 | 0 | 0 | 0 | 7.4 | 18.1 |  |
| journey | 7.3 | 104.6 | 3.3 | 1.4 | 2.5 | 5.3 | #document ×2; div.sticky.top-[calc(var(--header-h)+1.5rem)] ×1; div.pointer-events-none.absolute.inset-0 ×1 |
| act-2 | 60.6 | 0 | 0 | 0 | 0 | 9.1 |  |
| work | 60.6 | 0 | 0 | 0 | 0 | 9.9 |  |
| trading-algos | 60.3 | 0 | 0 | 0 | 5.9 | 15.1 |  |
| optuna-screener | 60.4 | 0 | 0 | 0 | 5.4 | 14.9 |  |
| experiment | 60.6 | 0 | 0 | 0 | 0 | 9.3 |  |
| systems | 60.1 | 0 | 0 | 0 | 0 | 9.6 |  |
| kill-list | 60.3 | 0 | 0 | 0 | 0 | 9.4 |  |
| films | 60.6 | 0 | 0 | 0 | 0 | 8.8 |  |
| act-3 | 60.3 | 0 | 0 | 0 | 0 | 10.2 |  |
| beyond | 60.4 | 0 | 0 | 0 | 0 | 9 |  |
| writing | 60.5 | 0 | 0 | 0 | 0 | 8.7 |  |
| voices | 58.7 | 0 | 0 | 0 | 5.8 | 15.4 |  |
| act-4 | 41.6 | 68.2 | 10.7 | 3.9 | 2 | 9.8 | #document ×8; div.act-card-shape ×4; div.block ×3 |
| principles | 60.6 | 0 | 0 | 0 | 0 | 9.7 |  |
| contact | 60.2 | 0 | 0 | 0 | 0 | 11 |  |
| credits | 60.2 | 0 | 0 | 0 | 6.6 | 16.9 |  |

## intro — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| intro:play-screen | 66 | 25.5 | 39.1 | 16.7 | 100 | 116.7 | 42.4 | 27.3 | 116.7 | 21 | 79 | 14.3 | 0 | 408.4 | 36.8 | #document ×35; div#act-1-program.relative.px-gutter.pt-tier-group in #act-1 ×13 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (242 ms) |  |
| intro:flight | 101 | 16.2 | 61.5 | 66.6 | 116.7 | 183.4 | 66.3 | 54.5 | 333.3 | 66 | 0 | 0 | 0 | 417.8 | 4.3 | #document ×8; node 70 ×4 | event-listener:BUTTON#intro-play.onclick @ intro.js (10 ms) |  |
| intro:hold | 2 | 15 | 66.7 | 116.6 | 116.6 | 116.6 | 50 | 50 | 116.6 | 1 | 17 | 100 | 0 | 0 | 30 | #document ×1; div#intro ×1 |  |  |
| intro:reveal | 3 | 4.1 | 244.4 | 133.3 | 583.3 | 583.3 | 66.7 | 66.7 | 583.3 | 2 | 0 | 50 | 0 | 591.8 | 20.5 | #document ×3; main#main.relative.z-(--z-main).flex-1 ×1 |  |  |
| intro:titles | 102 | 31.1 | 32.2 | 16.7 | 83.3 | 116.7 | 23.5 | 13.7 | 350 | 19 | 0 | 0 | 0 | 76.4 | 2.4 | #document ×2; video.absolute.inset-0.size-full in #top ×1 | event-listener:#document.ontimeupdate @ 3jh1u-s3k0bkk.js fL (7 ms) |  |
| top | 34 | 21.3 | 47.1 | 33.2 | 166.7 | 200 | 44.1 | 26.5 | 200 | 11 | 441 | 26.7 | 0 | 168.1 | 39.4 | #document ×15; div.letterbox-bar ×3 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r (380 ms) | 1 video, 1 filter, 1 blend, 1 mask, 5 will-change, 2.3 MP of images |

### intro — marks and LoAF intro:warm → intro:titles-end

warm t=4.764s → titles-end t=10.363s: 40 LoAF, **38 > 50 ms** (max 586 ms, blocking 17 ms)

intro:arm@-3.879 · intro:ready@-3.641 · intro:play@0 · intro:flight@0.151 · intro:warm@4.764 · intro:hold@6.207 · intro:reveal@6.398 · intro:landing@6.398 · intro:titles@7.162 · intro:end@7.163 · intro:titles-end@10.363

### intro — longest animation frames (LoAF total 10839 ms, main-thread work 892 ms, blocking 537 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 6.47 | intro:reveal | 586 | 0 | 1 | 1 | 0 | (no script) |  |
| 11.58 | top | 374 | 318 | 367 | 0 | 367 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r 367 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 7.17 | intro:titles | 344 | 0 | 0 | 0 | 0 | (no script) |  |
| 0.16 | intro:flight | 332 | 0 | 1 | 1 | 0 | (no script) |  |
| 11.32 | top | 187 | 123 | 171 | 17 | 154 | user-callback:FrameRequestCallback 148 ms |  |

### intro — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 11.58 | top | 374 | 318 | 367 | 0 | 367 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r 367 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 11.32 | top | 187 | 123 | 171 | 17 | 154 | user-callback:FrameRequestCallback 148 ms |  |
| -2.16 | intro:play-screen | 144 | 79 | 136 | 1 | 135 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 122 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |
| -1.7 | intro:play-screen | 93 | 0 | 60 | 2 | 58 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 26 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |
| -2.01 | intro:play-screen | 59 | 0 | 39 | 2 | 37 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ 37 ms | `(){if(b=!1,N){var e=t.unstable_now();z=e;var n=!0;try{e:{v=!1,y&&(y=!1,w(C),C=-1),g=!0;var` |

### intro — layout shifts (CLS total 0, session 0, 0 shifts)


### intro — visual pops (7; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| -1.89 | 0 | intro:play-screen | 0 | 6.8 | 598.4 | change | 7 | 1 |
| 1.57 | 0 | intro:flight | 0 | 2.1 | 38.2 | change | 4.7 | 1 |
| 1.76 | 0 | intro:flight | 0 | 15.2 | 245.8 | change | 20.2 | 7 |
| 2.65 | 0 | intro:flight | 0 | 7.8 | 94.1 | change | 9.7 | 7 |
| 3.23 | 0 | intro:flight | 0 | 10.3 | 4.9 | change | 19.8 | 2 |
| 3.44 | 0 | intro:flight | 0 | 17.4 | 4.5 | change | 36 | 1 |
| 8.44 | 0 | intro:titles | 0 | 11.5 | 9.4 | change | 10.2 | 1 |

## desktop — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 11 | 6.5 | 154.5 | 16.7 | 799.9 | 799.9 | 36.4 | 36.4 | 799.9 | 4 | 224 | 25 | 0 | 421.8 | 11.8 | #document ×4; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×4 | user-callback:IntersectionObserverCallback @ 17uxrkbdeaanq.js (269 ms) | 1 filter, 1 blend, 1 mask, 5 will-change, 2.3 MP of images |
| act-1 | 25 | 4.6 | 216.7 | 133.4 | 733.3 | 800 | 92 | 84 | 800 | 21 | 0 | 4.3 | 0 | 613.5 | 25.5 | #document ×22; div.absolute.inset-0.origin-center in #top ×20 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (6 ms) | 4 mask, 18 will-change, 14 infinite anims, 2.3 MP of images |
| about | 6 | 4.3 | 230.6 | 250.1 | 466.6 | 466.6 | 83.3 | 83.3 | 466.6 | 5 | 0 | 0 | 0.0046 | 645.5 | 23.1 | #document ×5; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×5 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (12 ms) | 1 mask |
| journey | 21 | 7.2 | 138.1 | 116.5 | 299.9 | 516.7 | 90.5 | 76.2 | 516.7 | 16 | 54 | 10.5 | 0 | 789.4 | 45.5 | #document ×20; div.act-card-stage.relative.flex in #act-2 ×20 | resolve-promise:Promise.resolve @ 3c41okqj08im4.js (99 ms) | 1 mask, 1 will-change, 0.8 MP of images |
| act-2 | 74 | 15.8 | 63.3 | 33.3 | 250 | 283.3 | 36.5 | 35.1 | 283.3 | 26 | 16 | 7.4 | 0 | 512.3 | 52.1 | #document ×33; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×26 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r (82 ms) | 2 filter, 3 mask, 20 will-change, 12 infinite anims, 4.7 MP of images |
| work | 37 | 14.7 | 68 | 50 | 233.4 | 249.9 | 51.4 | 37.8 | 249.9 | 14 | 0 | 0 | 0 | 646.1 | 58.8 | #document ×17; div.relative.sm:overflow-hidden.sm:rounded-frame in #work ×17 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r (8 ms) | 3 filter, 1 blend, 2 mask, 2 will-change, 3.2 MP of images |
| trading-algos | 25 | 11.4 | 88 | 66.6 | 233.4 | 250 | 80 | 52 | 250 | 14 | 0 | 0 | 0.0009 | 820.9 | 50.5 | #document ×15; div.act-card-stage.relative.flex in #act-2 ×10 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (15 ms) | 2 filter, 0.2 MP of images |
| optuna-screener | 27 | 8.6 | 116 | 83.3 | 266.7 | 283.4 | 81.5 | 63 | 283.4 | 20 | 0 | 0 | 0 | 712.4 | 62.2 | #document ×27; div.stage-window in #trading-algos ×27 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (16 ms) | 2 filter, 2.1 MP of images |
| experiment | 14 | 13.5 | 73.8 | 66.7 | 150 | 150 | 92.9 | 78.6 | 150 | 10 | 0 | 0 | 0 | 724.8 | 50.3 | #document ×14; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×7 |  |  |
| systems | 33 | 13.2 | 75.8 | 66.7 | 166.6 | 200 | 69.7 | 63.6 | 200 | 21 | 0 | 0 | 0 | 823.3 | 55.2 | #document ×30; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×19 |  | 1 mask, 1 will-change, 1 MP of images |
| kill-list | 27 | 12.3 | 81.5 | 66.7 | 200 | 200 | 70.4 | 63 | 200 | 15 | 17 | 10.5 | 0 | 858.7 | 50.9 | #document ×24; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×22 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (62 ms) | 1 mask, 3 will-change, 0.6 MP of images |
| films | 510 | 34 | 29.4 | 16.7 | 83.4 | 150 | 15.3 | 10.2 | 516.7 | 57 | 225 | 10.3 | 0 | 407.6 | 63.2 | #document ×272; div.act-card-stage.relative.flex in #act-3 ×115 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r (88 ms) | 4 will-change, 6.8 MP of images |
| act-3 | 108 | 22.7 | 44.1 | 16.7 | 166.7 | 383.3 | 20.4 | 19.4 | 433.3 | 21 | 0 | 0 | 0 | 409.1 | 43 | #document ×46; div.stage-window in #beyond ×42 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (17 ms) | 1 filter, 3 mask, 6 will-change, 2 MP of images |
| beyond | 56 | 12.4 | 80.4 | 50.1 | 250 | 366.6 | 57.1 | 50 | 366.6 | 29 | 0 | 0 | 0.0113 | 723.6 | 59.3 | #document ×54; div.act-card-stage.relative.flex in #act-3 ×42 |  | 7 mask, 1 will-change, 5.8 MP of images |
| writing | 42 | 13.9 | 71.8 | 50.1 | 150 | 150.1 | 73.8 | 52.4 | 150.1 | 24 | 37 | 9.7 | 0.0011 | 830.7 | 124 | #document ×42; div.act-card-stage.relative.flex in #act-4 ×42 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r (127 ms) | 5 mask, 3 will-change |
| voices | 20 | 12.6 | 79.2 | 66.6 | 266.7 | 266.7 | 85 | 70 | 266.7 | 13 | 0 | 5.9 | 0 | 711.8 | 92.2 | #document ×18; div.act-card-stage.relative.flex in #act-4 ×18 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r (32 ms) | 1 mask, 12 will-change, 9 infinite anims, 3.5 MP of images |
| act-4 | 104 | 22.3 | 44.9 | 16.7 | 200.1 | 299.9 | 26 | 21.2 | 316.8 | 19 | 0 | 0 | 0 | 572.2 | 30.9 | #document ×35; div.rdr2-module__R8wI0W__campSticky in #voices ×29 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r (8 ms) | 2 canvas, 3 mask, 26 will-change, 21 infinite anims, 2.3 MP of images |
| principles | 15 | 4.9 | 203.3 | 233.3 | 383.3 | 383.3 | 93.3 | 93.3 | 383.3 | 14 | 0 | 0 | 0.0017 | 975.5 | 24.6 | #document ×15; div.act-card-stage.relative.flex in #act-4 ×15 | user-callback:TimerHandler:setTimeout @ 3u_vlb8_9wwtr.js (7 ms) | 7 will-change |
| contact | 4 | 1.8 | 541.7 | 550 | 683.2 | 683.2 | 100 | 100 | 683.2 | 4 | 0 | 0 | 0 | 931.4 | 12.5 | #document ×4; div.act-card-stage.relative.flex in #act-4 ×4 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (6 ms) | 4 mask, 1.9 MP of images |
| credits | 70 | 19.1 | 52.4 | 49.9 | 83.4 | 333.4 | 52.9 | 27.1 | 333.4 | 21 | 0 | 0 | 0 | 531.6 | 14.7 | #document ×30; div.stage-cam ×12 |  | 1 will-change |

### desktop — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 450→3283 | 28 | 4.8 | 210.1 | 133.4 | 733.3 | 800 | 82.1 | 800 | 24 | 224 | 4 |
| act-2 | 6861→9201 | 80 | 15.5 | 64.4 | 33.4 | 250 | 283.3 | 35 | 283.3 | 29 | 16 | 6.7 |
| act-3 | 26632→28792 | 111 | 20.6 | 48.5 | 16.7 | 200.1 | 383.3 | 21.6 | 433.3 | 24 | 0 | 0 |
| act-4 | 36727→39067 | 107 | 21.3 | 47 | 16.7 | 216.7 | 299.9 | 22.4 | 316.8 | 22 | 0 | 0 |

### desktop — longest animation frames (LoAF total 51071 ms, main-thread work 1466 ms, blocking 573 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 0.62 | top | 810 | 0 | 1 | 1 | 0 | (no script) |  |
| 4.45 | act-1 | 790 | 0 | 0 | 0 | 0 | (no script) |  |
| 3.73 | act-1 | 717 | 0 | 2 | 2 | 0 | (no script) |  |
| 66.74 | contact | 669 | 0 | 1 | 1 | 0 | (no script) |  |
| 3.16 | act-1 | 558 | 0 | 6 | 1 | 5 | user-callback:FrameRequestCallback @ 3u_vlb8_9wwtr.js 5 ms | `()=>{c=0,k()}))}function T(){if(r.size&&(0,i.scrollVelocity)()>=o.below)for(let e of r.val` |

### desktop — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 1.6 | top | 278 | 224 | 270 | 1 | 269 | user-callback:IntersectionObserverCallback @ 17uxrkbdeaanq.js 269 ms | `e=>{e.forEach(e=>{let t=H.get(e.target);if(!t)return;let r=e.boundingClientRect;t.visible=` |
| 9.17 | journey | 170 | 54 | 100 | 1 | 99 | resolve-promise:Promise.resolve @ 3c41okqj08im4.js 99 ms |  |
| 38.64 | films | 93 | 43 | 88 | 0 | 88 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r 88 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 56.89 | writing | 90 | 37 | 84 | 1 | 83 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r 83 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 30.69 | films | 186 | 22 | 68 | 3 | 65 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v 65 ms | `()=>{let i=e.MotionGlobalConfig.useManualTiming,o=i?a.timestamp:performance.now();n=!1,i\|\|` |

### desktop — layout shifts (CLS total 0.0196, session 0.0113, 13 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 52.75 | 0.0113 | beyond | span.whitespace-nowrap in #beyond ; span[data-w] in #beyond ; span[data-words=scrub][data-words-variant=default] in #beyond |
| 8.27 | 0.0046 | about | span[data-w] in #about ; span[data-w] in #about ; span[data-w] in #about |
| 64.31 | 0.0017 | principles | h3.type-title.text-fg.max-sm:hyphens-auto in #principles ; h3.type-title.text-fg.max-sm:hyphens-auto in #principles ; h3.type-title.text-fg.max-sm:hyphens-auto in #principles |
| 19.63 | 0.0009 | trading-algos | span.scene-caption__film.world-face-idiots in #trading-algos ; p.scene-caption.mb-tier-group[data-caption=cap.trading-algos][data-caption-world=idiots] in #trading-algos |
| 56.35 | 0.0004 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 54.89 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 55.98 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 55.31 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |

### desktop — visual pops (10; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 4.16 | 720 | act-1 | 30 | 5.9 | 38.5 | change | 7.7 | 1 |
| 6.20 | 2000 | act-1 | 6 | 11.9 | 17.8 | change | 22.8 | 1 |
| 15.53 | 7950 | act-2 | 28 | 2.8 | 43.7 | change | 4.3 | 1 |
| 15.70 | 8027 | act-2 | 18 | 3 | 46.6 | change | 4.6 | 2 |
| 16.01 | 8109 | act-2 | 36 | 16.4 | 253.8 | change | 34.9 | 2 |
| 37.04 | 23525 | films | 25 | 13.3 | 68.5 | change | 26.6 | 7 |
| 44.29 | 26034 | films | 5 | 3.6 | 360.3 | change | 5.2 | 1 |
| 61.00 | 37878 | act-4 | 15 | 32 | 4.2 | change | 57.2 | 1 |
| 63.54 | 38115 | principles | 7 | 3.5 | 349.6 | change | 6.4 | 1 |
| 64.76 | 39190 | principles | 32 | 6.2 | 621.6 | change | 9.9 | 1 |

## native — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 14 | 23.3 | 42.9 | 16.7 | 300 | 300 | 14.3 | 14.3 | 300 | 2 | 0 | 0 | 0 | 171.7 | 50 | #document ×10; header.fixed.inset-x-0.top-0 in #header ×7 |  | 1 filter, 1 blend, 1 mask, 5 will-change, 2.3 MP of images |
| act-1 | 21 | 4.1 | 246.8 | 133.3 | 933.2 | 1100 | 85.7 | 76.2 | 1100 | 12 | 305 | 11.1 | 0 | 458.8 | 19.9 | #document ×19; div.absolute.inset-0.origin-center in #top ×11 | user-callback:IntersectionObserverCallback @ 17uxrkbdeaanq.js (349 ms) | 4 mask, 18 will-change, 14 infinite anims, 2.3 MP of images |
| about | 6 | 4.6 | 216.7 | 266.6 | 516.7 | 516.7 | 66.7 | 50 | 516.7 | 4 | 0 | 0 | 0.0061 | 711.6 | 40 | #document ×6; video.absolute.inset-0.size-full in #top ×3 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (14 ms) | 1 mask |
| journey | 23 | 7.5 | 132.6 | 116.7 | 350 | 399.9 | 69.6 | 69.6 | 399.9 | 15 | 77 | 12.5 | 0 | 633.1 | 43.6 | #document ×23; video.absolute.inset-0.size-full in #top ×12 | resolve-promise:Promise.resolve @ 3c41okqj08im4.js (124 ms) | 1 mask, 1 will-change, 0.8 MP of images |
| act-2 | 35 | 9.1 | 110 | 83.3 | 300 | 366.6 | 65.7 | 62.9 | 366.6 | 23 | 0 | 0 | 0 | 596.7 | 53.8 | #document ×32; div#intro ×14 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r (65 ms) | 2 filter, 3 mask, 20 will-change, 12 infinite anims, 4.7 MP of images |
| work | 21 | 8.4 | 119 | 49.9 | 300 | 550 | 57.1 | 47.6 | 550 | 9 | 0 | 0 | 0 | 641.6 | 49.2 | #document ×16; div.relative.sm:overflow-hidden.sm:rounded-frame in #work ×11 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r (24 ms) | 3 filter, 1 blend, 2 mask, 2 will-change, 3.2 MP of images |
| trading-algos | 17 | 8 | 125.5 | 100 | 350 | 350 | 76.5 | 76.5 | 350 | 13 | 0 | 0 | 0.0009 | 630.5 | 27.2 | #document ×13; video.absolute.inset-0.size-full in #top ×6 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r (44 ms) | 2 filter, 0.2 MP of images |
| optuna-screener | 16 | 5.1 | 194.8 | 183.3 | 533.2 | 533.2 | 81.3 | 81.3 | 533.2 | 13 | 0 | 0 | 0 | 526.2 | 49.1 | #document ×16; div.stage-window in #trading-algos ×14 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r (18 ms) | 2 filter, 2.1 MP of images |
| experiment | 17 | 21.7 | 46.1 | 33.3 | 133.3 | 133.3 | 35.3 | 29.4 | 133.3 | 5 | 0 | 0 | 0 | 425.1 | 62.6 | #document ×10; div.absolute.inset-x-0.top-0 in #kill-list ×6 |  |  |
| systems | 30 | 11 | 90.6 | 50 | 283.3 | 316.6 | 63.3 | 46.7 | 316.6 | 14 | 0 | 0 | 0 | 720.8 | 39.4 | #document ×28; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×15 |  | 1 mask, 1 will-change, 1 MP of images |
| kill-list | 15 | 7.3 | 137.8 | 116.7 | 283.3 | 283.3 | 73.3 | 66.7 | 283.3 | 11 | 0 | 0 | 0 | 703.1 | 34.8 | #document ×15; div.relative.@container.will-change-[transform,opacity] in #header ×10 |  | 1 mask, 3 will-change, 0.6 MP of images |
| films | 232 | 20.4 | 49.1 | 16.7 | 199.9 | 316.7 | 28.4 | 22.4 | 366.6 | 54 | 228 | 13.6 | 0 | 393.6 | 49.7 | #document ×167; svg.pointer-events-none.absolute.inset-0 viewBox=0 0 1778 1000 in #films ×54 | user-callback:TimerHandler:setTimeout @ 3c41okqj08im4.js (227 ms) | 4 will-change, 6.8 MP of images |
| act-3 | 43 | 12.5 | 80.2 | 16.7 | 300 | 350 | 41.9 | 34.9 | 350 | 15 | 0 | 0 | 0 | 498 | 28.1 | #document ×32; div.act-card-stage.relative.flex in #act-3 ×11 |  | 1 filter, 3 mask, 6 will-change, 2 MP of images |
| beyond | 32 | 6.6 | 150.5 | 83.3 | 400.1 | 733.2 | 75 | 68.8 | 733.2 | 22 | 0 | 0 | 0.0113 | 528.6 | 35.5 | #document ×31; div.act-card-stage.relative.flex in #act-3 ×15 |  | 7 mask, 1 will-change, 5.8 MP of images |
| writing | 31 | 9.4 | 105.9 | 50 | 316.7 | 466.6 | 61.3 | 45.2 | 466.6 | 14 | 0 | 10.5 | 0.0008 | 686.8 | 68.8 | #document ×30; svg.size-full.overflow-visible.will-change-transform viewBox=0 0 400 500[data-motif=journal-landscape] in #writing ×26 | classic-script:/_next/static/chunks/19vq58ko3wg2v.js @ 19vq58ko3wg2v.js (31 ms) | 5 mask, 4 will-change |
| voices | 8 | 4.5 | 222.9 | 250 | 666.7 | 666.7 | 87.5 | 75 | 666.7 | 6 | 0 | 0 | 0 | 380.2 | 39.8 | #document ×9; div.act-card-stage.relative.flex in #act-4 ×8 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r (34 ms) | 1 mask, 12 will-change, 9 infinite anims, 3.5 MP of images |
| act-4 | 27 | 8.1 | 123.4 | 83.4 | 416.6 | 416.7 | 59.3 | 55.6 | 416.7 | 14 | 0 | 0 | 0 | 535.2 | 28.8 | #document ×18; div.act-card-stage.relative.flex in #act-4 ×9 |  | 2 canvas, 3 mask, 26 will-change, 21 infinite anims, 2.3 MP of images |
| principles | 8 | 2 | 506.2 | 683.3 | 1233.3 | 1233.3 | 87.5 | 87.5 | 1233.3 | 7 | 0 | 0 | 0.0013 | 892.9 | 11.1 | #document ×8; div.act-card-stage.relative.flex in #act-4 ×6 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r (59 ms) | 7 will-change |
| contact | 4 | 3.9 | 254.2 | 316.6 | 400 | 400 | 75 | 75 | 400 | 3 | 0 | 0 | 0 | 895.1 | 27.5 | #document ×4; div.act-card-stage.relative.flex in #act-4 ×3 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r (8 ms) | 4 mask, 1.9 MP of images |
| credits | 56 | 14.9 | 67 | 50 | 166.7 | 566.6 | 67.9 | 44.6 | 566.6 | 26 | 0 | 0 | 0 | 522.1 | 20 | #document ×27; footer#credits.relative.isolate.z-(--z-main) in #credits ×17 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r (85 ms) | 1 will-change |

### native — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 450→3283 | 22 | 4.2 | 237.9 | 133.3 | 933.2 | 1100 | 72.7 | 1100 | 14 | 305 | 10.5 |
| act-2 | 6861→9201 | 39 | 9.2 | 108.5 | 83.3 | 300 | 366.6 | 61.5 | 366.6 | 26 | 0 | 0 |
| act-3 | 26632→28792 | 46 | 10.6 | 94.6 | 16.7 | 300 | 400.1 | 39.1 | 400.1 | 18 | 0 | 0 |
| act-4 | 36727→39067 | 28 | 7.9 | 127.4 | 99.9 | 416.6 | 416.7 | 57.1 | 416.7 | 16 | 0 | 0 |

### native — longest animation frames (LoAF total 53244 ms, main-thread work 1605 ms, blocking 610 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 58.17 | principles | 1228 | 0 | 17 | 1 | 16 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r 8 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 3.3 | act-1 | 1105 | 0 | 2 | 2 | 0 | (no script) |  |
| 2.12 | act-1 | 866 | 0 | 1 | 1 | 0 | (no script) |  |
| 55.59 | principles | 826 | 0 | 11 | 0 | 11 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r 11 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 4.84 | act-1 | 780 | 0 | 1 | 1 | 0 | (no script) |  |

### native — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 0.72 | act-1 | 359 | 305 | 349 | 0 | 349 | user-callback:IntersectionObserverCallback @ 17uxrkbdeaanq.js 349 ms | `e=>{e.forEach(e=>{let t=H.get(e.target);if(!t)return;let r=e.boundingClientRect;t.visible=` |
| 28.91 | films | 207 | 90 | 128 | 3 | 125 | user-callback:TimerHandler:setTimeout @ 3c41okqj08im4.js 125 ms | `()=>{let e=function(){let e=.475*window.innerHeight,t=null;for(let n of I){let r=document.` |
| 7.93 | journey | 159 | 77 | 126 | 2 | 124 | resolve-promise:Promise.resolve @ 3c41okqj08im4.js 124 ms |  |
| 31.59 | films | 343 | 74 | 106 | 4 | 102 | user-callback:TimerHandler:setTimeout @ 3c41okqj08im4.js 102 ms | `()=>{let e=function(){let e=.475*window.innerHeight,t=null;for(let n of I){let r=document.` |
| 35 | films | 114 | 26 | 74 | 2 | 72 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r 72 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |

### native — layout shifts (CLS total 0.0204, session 0.0113, 11 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 45.81 | 0.0113 | beyond | span.whitespace-nowrap in #beyond ; span[data-w] in #beyond ; span[data-words=scrub][data-words-variant=default] in #beyond |
| 6.67 | 0.0061 | about | span[data-w] in #about ; span[data-words=scrub][data-words-variant=default] in #about ; span[data-w] in #about |
| 57.17 | 0.0013 | principles | h3.type-title.text-fg.max-sm:hyphens-auto in #principles ; h3.type-title.text-fg.max-sm:hyphens-auto in #principles ; h3.type-title.text-fg.max-sm:hyphens-auto in #principles |
| 17.39 | 0.0009 | trading-algos | span.scene-caption__film.world-face-idiots in #trading-algos ; p.scene-caption.mb-tier-group[data-caption=cap.trading-algos][data-caption-world=idiots] in #trading-algos |
| 48.01 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 50.23 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 48.56 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 49.15 | 0.0001 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |

### native — visual pops (42; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 3.08 | 1500 | act-1 | 0 | 2.8 | 14 | change | 3.6 | 1 |
| 3.41 | 1700 | act-1 | 0 | 3.1 | 14.4 | change | 4.6 | 1 |
| 3.75 | 1700 | act-1 | 0 | 3.5 | 17.3 | change | 4.9 | 1 |
| 3.98 | 1700 | act-1 | 0 | 12.7 | 54.7 | change | 24 | 1 |
| 4.88 | 1700 | act-1 | 0 | 13.7 | 58.9 | change | 28.3 | 1 |
| 6.25 | 2500 | about | 0 | 4.3 | 188.4 | change | 3.1 | 1 |
| 7.21 | 3300 | journey | 0 | 4.5 | 448.1 | fill-in | 12.1 | 1 |
| 7.48 | 3600 | journey | 0 | 3.5 | 347.6 | change | 4.7 | 1 |
| 7.98 | 4400 | journey | 0 | 3.6 | 358.3 | change | 3 | 1 |
| 8.86 | 5000 | journey | 0 | 3.5 | 6 | change | 6.8 | 1 |
| 9.98 | 5800 | journey | 0 | 3.5 | 4 | change | 7.5 | 1 |
| 11.96 | 7700 | act-2 | 0 | 32.9 | 38.1 | change | 44 | 1 |
| 12.34 | 7800 | act-2 | 0 | 7.7 | 4.3 | change | 15.2 | 1 |
| 14.15 | 8200 | work | 0 | 11.6 | 49.9 | change | 20.8 | 1 |
| 14.65 | 8700 | work | 0 | 8.2 | 54.6 | change | 14.7 | 1 |
| 14.88 | 9200 | work | 0 | 4.9 | 14.7 | change | 7.8 | 2 |
| 17.42 | 11500 | trading-algos | 0 | 4.6 | 66.5 | fill-in | 18.9 | 1 |
| 19.93 | 13300 | optuna-screener | 0 | 3.6 | 14.9 | change | 5.4 | 1 |
| 20.12 | 13700 | optuna-screener | 0 | 2.2 | 5.8 | change | 3.8 | 1 |
| 20.27 | 13700 | optuna-screener | 0 | 6.2 | 9.7 | change | 14.6 | 1 |
| 20.94 | 14200 | optuna-screener | 0 | 7.6 | 20.3 | change | 35.1 | 1 |
| 28.39 | 21400 | films | 0 | 3.6 | 4.2 | change | 4.9 | 1 |
| 32.24 | 23300 | films | 0 | 10 | 251.4 | change | 10.9 | 2 |
| 34.01 | 24100 | films | 0 | 2.2 | 6.8 | fill-in | 2.5 | 1 |
| 34.67 | 24400 | films | 0 | 3.2 | 10.1 | change | 7.6 | 1 |
| 37.65 | 25900 | films | 0 | 2.6 | 20.1 | change | 4.9 | 1 |
| 37.86 | 25900 | films | 0 | 2.3 | 6.1 | change | 4.3 | 1 |
| 41.74 | 27700 | act-3 | 0 | 13.6 | 26.8 | change | 11.4 | 2 |
| 42.05 | 27700 | act-3 | 0 | 21.4 | 24 | change | 25.3 | 1 |
| 43.48 | 28200 | beyond | 0 | 5.6 | 5.5 | change | 6 | 1 |
| 45.78 | 30700 | beyond | 0 | 2.1 | 212.1 | small | 0.3 | 1 |
| 45.99 | 31000 | beyond | 0 | 2.7 | 269.5 | change | 4.7 | 1 |
| 47.15 | 32300 | writing | 0 | 2 | 23.5 | change | 2 | 1 |
| 47.36 | 32600 | writing | 0 | 8.1 | 58.5 | change | 5.2 | 1 |
| 51.13 | 35700 | voices | 0 | 10.2 | 23.4 | fill-in | 24.3 | 1 |
| 53.67 | 37700 | act-4 | 0 | 19.3 | 81.7 | change | 53.2 | 5 |
| 53.98 | 37700 | act-4 | 0 | 13.4 | 36.5 | change | 49.5 | 2 |
| 55.20 | 38000 | act-4 | 0 | 5.4 | 13.1 | change | 9.6 | 1 |
| 56.07 | 38400 | principles | 0 | 3.2 | 6 | change | 5.6 | 1 |
| 56.77 | 39200 | principles | 0 | 5.9 | 10.8 | change | 10.5 | 1 |
| 57.30 | 40000 | principles | 0 | 38 | 70.2 | change | 19.8 | 2 |
| 59.56 | 40900 | contact | 0 | 79.3 | 82.2 | change | 44.3 | 1 |

## alt — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 12 | 13.1 | 76.4 | 16.7 | 333.4 | 333.4 | 41.7 | 41.7 | 333.4 | 5 | 171 | 20 | 0 | 451.7 | 21.8 | #document ×5; div#intro ×5 | user-callback:IntersectionObserverCallback @ 3tw7jfo5o-q7k.js (216 ms) | 1 canvas, 1 filter, 1 mask, 4 will-change, 2.3 MP of images |
| act-1 | 39 | 6.7 | 148.3 | 100 | 566.6 | 650 | 89.7 | 82.1 | 650 | 32 | 0 | 2.9 | 0 | 615.2 | 22 | #document ×23; div#intro ×21 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (20 ms) | 3 mask, 18 will-change, 14 infinite anims, 2.4 MP of images |
| about | 4 | 4.3 | 233.3 | 216.7 | 333.3 | 333.3 | 100 | 100 | 333.3 | 4 | 0 | 0 | 0 | 827.2 | 21.4 | #document ×4; div#intro-stage ×4 |  | 1 mask |
| journey | 48 | 10.7 | 93.1 | 33.3 | 266.7 | 583.3 | 43.8 | 43.8 | 583.3 | 16 | 214 | 9.5 | 0 | 236.4 | 49.9 | #document ×46; div#intro-stage ×46 | user-callback:FrameRequestCallback @ 0gidbk80-6e1r.js tr (5 ms) | 1 mask, 1 will-change, 0.8 MP of images |
| act-2 | 101 | 16.9 | 59.2 | 16.7 | 250 | 416.6 | 21.8 | 20.8 | 516.7 | 17 | 767 | 18.2 | 0 | 45.3 | 37.1 | #document ×42; div#intro ×33 |  | 1 filter, 3 mask, 17 will-change, 12 infinite anims, 3.6 MP of images |
| work | 72 | 15.4 | 65 | 16.7 | 233.4 | 366.6 | 33.3 | 33.3 | 366.6 | 19 | 32 | 4.2 | 0.0132 | 29.7 | 34.2 | #document ×21; div#intro ×20 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (5 ms) | 4 filter, 1 blend, 2 mask, 1 will-change, 1.6 MP of images |
| trading-algos | 39 | 9 | 110.7 | 16.7 | 483.3 | 666.6 | 33.3 | 33.3 | 666.6 | 12 | 0 | 0 | 0.0009 | 28.5 | 29.4 | #document ×21; div#intro-stage ×20 | event-listener:#document.onscroll @ 1is0gg5e6lopl.js tx (12 ms) | 2 filter, 0.2 MP of images |
| optuna-screener | 51 | 10 | 100.3 | 16.7 | 500 | 549.9 | 37.3 | 33.3 | 549.9 | 15 | 508 | 21.1 | 0 | 37.5 | 49.1 | #document ×50; div.stage-window in #trading-algos ×37 | event-listener:#document.onscroll @ 1is0gg5e6lopl.js tx (6 ms) | 3 filter, 1 mask, 1 will-change, 2.1 MP of images |
| experiment | 30 | 17.6 | 56.7 | 16.7 | 200 | 216.7 | 33.3 | 33.3 | 216.7 | 8 | 0 | 0 | 0 | 41.8 | 26.5 | #document ×16; div.pointer-events-none.absolute.inset-x-0 in #systems ×9 |  |  |
| systems | 45 | 12.8 | 78.1 | 16.8 | 350 | 483.2 | 33.3 | 31.1 | 483.2 | 14 | 0 | 0 | 0 | 40.1 | 33 | #document ×31; div.relative.@container.overflow-clip in #header ×22 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (14 ms) | 1 mask, 1 MP of images |
| kill-list | 60 | 11.6 | 86.1 | 16.7 | 316.6 | 416.7 | 33.3 | 33.3 | 416.7 | 14 | 528 | 15 | 0.0005 | 19 | 22.5 | #document ×42; div.stage-window in #optuna-screener ×15 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (69 ms) | 1 mask, 2 will-change, 0.3 MP of images |
| films | 367 | 18.9 | 52.9 | 16.7 | 249.9 | 416.7 | 25.1 | 22.1 | 683.3 | 67 | 414 | 4.3 | 0 | 48.7 | 27.4 | #document ×156; div.act-card-stage.relative.flex in #act-3 ×55 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (120 ms) | 2 mask, 6 will-change, 5.7 MP of images |
| act-3 | 113 | 19.2 | 52.2 | 16.7 | 316.6 | 516.6 | 13.3 | 13.3 | 699.9 | 12 | 0 | 0 | 0 | 21.2 | 20.8 | #document ×26; div.stage-window in #beyond ×19 |  | 1 filter, 2 mask, 9 will-change, 2 MP of images |
| beyond | 101 | 13.3 | 74.9 | 16.7 | 266.6 | 533.3 | 34.7 | 34.7 | 616.6 | 28 | 0 | 0 | 0.0008 | 72.6 | 37.7 | #document ×70; div.act-card-stage.relative.flex in #act-3 ×51 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (8 ms) | 7 mask, 1 will-change, 5.3 MP of images |
| writing | 51 | 13.8 | 72.2 | 16.7 | 249.9 | 333.3 | 33.3 | 33.3 | 333.3 | 15 | 330 | 11.8 | 0.0012 | 39.1 | 70.3 | #document ×52; div.origin-right in #principles ×52 | event-listener:DOMWindow.onscroll @ 3c41okqj08im4.js n (7 ms) | 4 mask, 3 will-change |
| voices | 34 | 14.9 | 67.2 | 16.7 | 266.7 | 283.4 | 32.4 | 32.4 | 283.4 | 10 | 0 | 0 | 0 | 12.7 | 34.2 | #document ×33; div.origin-right in #principles ×30 |  | 9 will-change, 9 infinite anims, 3.5 MP of images |
| act-4 | 147 | 26.3 | 38 | 16.7 | 166.7 | 250 | 14.3 | 14.3 | 500 | 15 | 113 | 4.8 | 0 | 21.7 | 21.5 | #document ×41; div.origin-right in #principles ×22 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (12 ms) | 1 canvas, 1 blend, 2 mask, 27 will-change, 21 infinite anims, 2.3 MP of images |
| principles | 45 | 7.4 | 135.2 | 33.3 | 500.1 | 533.3 | 46.7 | 42.2 | 533.3 | 13 | 583 | 9.5 | 0 | 195 | 13.8 | #document ×40; div.origin-right in #principles ×38 | user-callback:FrameRequestCallback @ 3u_vlb8_9wwtr.js (6 ms) | 3 mask |
| contact | 9 | 5 | 198.1 | 166.6 | 666.7 | 666.7 | 55.6 | 55.6 | 666.7 | 4 | 0 | 0 | 0 | 630.9 | 22.4 | #document ×9; div.origin-right in #principles ×9 | user-callback:IntersectionObserverCallback @ 3c41okqj08im4.js (7 ms) | 4 mask, 0.9 MP of images |
| credits | 114 | 23.2 | 43.1 | 16.7 | 183.3 | 233.3 | 20.2 | 16.7 | 300.1 | 16 | 89 | 4.3 | 0 | 36.4 | 23 | #document ×45; div.stage-cam ×29 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (6 ms) |  |

### alt — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 450→3209 | 41 | 6.6 | 150.4 | 100 | 483.3 | 650 | 82.9 | 650 | 35 | 171 | 2.7 |
| act-2 | 6786→9126 | 116 | 16.1 | 62.2 | 16.7 | 250.1 | 416.6 | 22.4 | 516.7 | 21 | 767 | 14.8 |
| act-3 | 26602→28762 | 122 | 16.1 | 62 | 16.7 | 366.7 | 616.6 | 14.8 | 699.9 | 15 | 0 | 0 |
| act-4 | 36774→39114 | 153 | 25.2 | 39.8 | 16.7 | 183.3 | 250 | 15 | 500 | 18 | 113 | 4.2 |

### alt — longest animation frames (LoAF total 67444 ms, main-thread work 1011 ms, blocking 3749 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 66.04 | act-3 | 725 | 0 | 1 | 1 | 0 | (no script) |  |
| 24.32 | trading-algos | 686 | 0 | 19 | 1 | 18 | event-listener:#document.onscroll @ 1is0gg5e6lopl.js tx 12 ms | `(){ec&&ec.isPressed&&!(ec.startX>V.clientWidth)\|\|(m.cache++,ec?e_\|\|(e_=requestAnimationFra` |
| 2.1 | act-1 | 669 | 0 | 2 | 2 | 0 | (no script) |  |
| 67.89 | act-3 | 629 | 0 | 5 | 5 | 0 | (no script) |  |
| 8.76 | journey | 582 | 0 | 6 | 1 | 5 | user-callback:FrameRequestCallback @ 0gidbk80-6e1r.js tr 5 ms | `(){ti=0;let t=[...tt];for(let e of t)e.measure();for(let e of t)e.apply()}function ta(){ti` |

### alt — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 0.83 | top | 225 | 171 | 217 | 1 | 216 | user-callback:IntersectionObserverCallback @ 3tw7jfo5o-q7k.js 216 ms | `e=>{e.forEach(e=>{let t=H.get(e.target);if(!t)return;let r=e.boundingClientRect;t.visible=` |
| 46.84 | films | 179 | 118 | 117 | 2 | 115 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v 115 ms | `()=>{let i=e.MotionGlobalConfig.useManualTiming,o=i?a.timestamp:performance.now();n=!1,i\|\|` |
| 42.25 | kill-list | 284 | 26 | 71 | 2 | 69 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v 69 ms | `()=>{let i=e.MotionGlobalConfig.useManualTiming,o=i?a.timestamp:performance.now();n=!1,i\|\|` |
| 6.22 | act-1 | 478 | 0 | 31 | 1 | 30 | user-callback:IntersectionObserverCallback @ 0gidbk80-6e1r.js 10 ms | `t=>{for(let e of t){if(!e.isIntersecting)continue;let t=e.rootBounds?.height??window.inner` |
| 24.32 | trading-algos | 686 | 0 | 19 | 1 | 18 | event-listener:#document.onscroll @ 1is0gg5e6lopl.js tx 12 ms | `(){ec&&ec.isPressed&&!(ec.startX>V.clientWidth)\|\|(m.cache++,ec?e_\|\|(e_=requestAnimationFra` |

### alt — layout shifts (CLS total 0.0166, session 0.0132, 11 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 19.54 | 0.0132 | work | span.scene-caption__moment.world-face-idiots in #work ; span.scene-caption__moment.world-face-idiots in #work ; span.whitespace-nowrap in #work |
| 24.3 | 0.0009 | trading-algos | span.scene-caption__film.world-face-idiots in #trading-algos ; p.scene-caption.mb-tier-group[data-caption=cap.trading-algos][data-caption-world=idiots] in #trading-algos |
| 73.86 | 0.0008 | beyond | span.whitespace-nowrap in #beyond ; span.scene-caption__film.world-face-rdr2 in #beyond |
| 38.96 | 0.0005 | kill-list | span.scene-caption__film.world-face-idiots in #kill-list ; p.scene-caption[data-caption=cap.kill-list][data-caption-world=idiots] in #kill-list |
| 76.68 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 77.57 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 78.84 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 78.62 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |

### alt — visual pops (21; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 4.08 | 1797 | act-1 | 3 | 8.5 | 9.6 | change | 19 | 1 |
| 13.27 | 7423 | act-2 | 8 | 18.9 | 5.1 | change | 22.8 | 1 |
| 13.45 | 7595 | act-2 | 33 | 11.5 | 3.1 | change | 24.2 | 1 |
| 14.29 | 7906 | act-2 | 4 | 12.6 | 5.9 | change | 23.6 | 1 |
| 16.90 | 8069 | act-2 | 38 | 2.8 | 275.7 | change | 5.4 | 1 |
| 17.30 | 8237 | act-2 | 3 | 2.4 | 243.4 | change | 2.8 | 1 |
| 18.37 | 8529 | work | 0 | 7.8 | 376.1 | change | 13.6 | 1 |
| 18.65 | 8616 | work | 3 | 3.3 | 95.6 | change | 5.3 | 2 |
| 18.86 | 8721 | work | 2 | 12.9 | 13.6 | change | 23.8 | 1 |
| 19.09 | 8735 | work | 14 | 18.8 | 16.9 | change | 32.3 | 2 |
| 29.44 | 14081 | optuna-screener | 16 | 4.5 | 5.4 | change | 8.2 | 1 |
| 44.46 | 21913 | films | 25 | 14.3 | 9.8 | change | 25.3 | 1 |
| 49.56 | 23134 | films | 15 | 59.1 | 22.2 | change | 50.4 | 1 |
| 50.18 | 23334 | films | 17 | 12.3 | 7.5 | change | 21.5 | 1 |
| 51.67 | 23348 | films | 10 | 7.9 | 31.2 | change | 15.2 | 3 |
| 54.13 | 24561 | films | 5 | 19.1 | 4 | change | 33.5 | 1 |
| 57.93 | 25111 | films | 3 | 2.9 | 269.3 | change | 5.3 | 1 |
| 63.99 | 27232 | act-3 | 12 | 13.6 | 21.2 | change | 51.5 | 1 |
| 82.99 | 37550 | act-4 | 33 | 14 | 4.1 | change | 31.6 | 1 |
| 83.37 | 37767 | act-4 | 27 | 19.6 | 5.5 | change | 53.9 | 2 |
| 85.95 | 37976 | act-4 | 1 | 7.2 | 715.2 | change | 16.8 | 1 |

## rm — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 29 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 4.1 | 8.3 | #document ×3; header.fixed.inset-x-0.top-0 in #header ×1 |  | 1.2 MP of images |
| act-1 | 181 | 59.7 | 16.8 | 16.7 | 16.8 | 16.8 | 0 | 0 | 33.4 | 0 | 0 |  | 0 | 1.3 | 1.3 | #document ×4 |  | 2 mask, 1.2 MP of images |
| about | 79 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 35.7 | 3.8 | #document ×4; svg.pointer-events-none.absolute.inset-0 viewBox=0 0 600 190 in #work ×1 |  | 1 mask |
| journey | 66 | 53.5 | 18.7 | 16.7 | 16.8 | 133.3 | 1.5 | 1.5 | 133.3 | 1 | 90 | 100 | 0.061 | 6.5 | 4.1 | #document ×4; svg.pointer-events-none.absolute.inset-0 viewBox=0 0 600 190 in #work ×1 | user-callback:FrameRequestCallback (130 ms) | 1 mask, 0.4 MP of images |
| act-2 | 137 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 3.1 | 1.8 | #document ×3; header.fixed.inset-x-0.top-0 in #header ×1 |  | 1 filter, 2 mask, 1.2 MP of images |
| work | 152 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 12.2 | 2.4 | #document ×5; img.object-cover in #optuna-screener ×1 |  | 4 filter, 1 blend, 2 mask, 1 will-change, 1.6 MP of images |
| trading-algos | 119 | 60 | 16.7 | 16.7 | 16.7 | 16.7 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 2 | 1.5 | #document ×3 |  | 2 filter |
| optuna-screener | 171 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 10.2 | 2.1 | #document ×5; div.absolute.inset-x-0.top-0 in #kill-list ×1 |  | 2 filter, 1 MP of images |
| experiment | 79 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 14.4 | 2.3 | #document ×2; div.absolute.inset-x-0.top-0 in #kill-list ×1 |  |  |
| systems | 139 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 11.7 | 2.2 | #document ×5 |  | 1 mask, 1 MP of images |
| kill-list | 98 | 41.1 | 24.3 | 16.7 | 16.8 | 316.6 | 4.1 | 3.1 | 316.6 | 4 | 0 | 0 | 0 | 376.4 | 21.8 | #document ×21; ol.relative.border-t.border-rule in #kill-list ×4 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (5 ms) | 1 mask, 1 will-change, 0.3 MP of images |
| films | 594 | 52.6 | 19 | 16.7 | 16.8 | 133.3 | 1.3 | 1.3 | 550 | 7 | 191 | 37.5 | 0 | 87.5 | 2.9 | #document ×18; header.fixed.inset-x-0.top-0 in #header ×3 | user-callback:FrameRequestCallback (272 ms) | 3.9 MP of images |
| act-3 | 136 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 1.8 | 2.6 | #document ×4; img.object-cover in #beyond ×1 |  | 2 mask, 1 MP of images |
| beyond | 264 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 15 | 3.4 | #document ×8; div.rdr2-module__R8wI0W__campSticky in #voices ×3 |  | 6 mask, 2.8 MP of images |
| writing | 172 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 1.4 | 7 | #document ×5; div.rdr2-module__R8wI0W__campSticky in #voices ×5 |  | 4 mask, 2 will-change |
| voices | 99 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 1.8 | 4.8 | #document ×3; div.rdr2-module__R8wI0W__campSticky in #voices ×3 |  | 2.3 MP of images |
| act-4 | 137 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 3.1 | 2.6 | #document ×3; div.rdr2-module__R8wI0W__campSticky in #voices ×2 |  | 2 mask, 1.2 MP of images |
| principles | 177 | 59.7 | 16.8 | 16.7 | 16.8 | 16.8 | 0 | 0 | 33.4 | 0 | 0 |  | 0 | 17.2 | 7.4 | #document ×11; div.rdr2-module__R8wI0W__campSticky in #voices ×11 |  | 2 will-change |
| contact | 59 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 1 | 0 |  |  | 4 mask, 0.9 MP of images |
| credits | 198 | 59.4 | 16.8 | 16.7 | 16.7 | 33.3 | 0 | 0 | 33.4 | 0 | 0 |  | 0 | 0.6 | 0.9 | #document ×2; header.fixed.inset-x-0.top-0 in #header ×1 |  |  |

### rm — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 450→2481 | 208 | 59.7 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 33.4 | 0 | 0 |  |
| act-2 | 4325→5705 | 170 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 16.8 | 0 | 0 |  |
| act-3 | 22842→24221 | 170 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 16.8 | 0 | 0 |  |
| act-4 | 31814→33164 | 162 | 59.6 | 16.8 | 16.7 | 16.8 | 16.8 | 0 | 33.4 | 0 | 0 |  |

### rm — longest animation frames (LoAF total 2456 ms, main-thread work 431 ms, blocking 281 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 22.05 | films | 545 | 0 | 0 | 0 | 0 | (no script) |  |
| 21.4 | kill-list | 317 | 0 | 0 | 0 | 0 | (no script) |  |
| 21.13 | kill-list | 256 | 0 | 5 | 0 | 5 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v 5 ms | `()=>{let i=e.MotionGlobalConfig.useManualTiming,o=i?a.timestamp:performance.now();n=!1,i\|\|` |
| 22.97 | films | 245 | 105 | 153 | 7 | 146 | user-callback:FrameRequestCallback 146 ms |  |
| 22.68 | films | 224 | 0 | 0 | 0 | 0 | (no script) |  |

### rm — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 22.97 | films | 245 | 105 | 153 | 7 | 146 | user-callback:FrameRequestCallback 146 ms |  |
| 5.01 | journey | 153 | 90 | 139 | 9 | 130 | user-callback:FrameRequestCallback 130 ms |  |
| 26.94 | films | 149 | 86 | 134 | 8 | 126 | user-callback:FrameRequestCallback 126 ms |  |
| 21.13 | kill-list | 256 | 0 | 5 | 0 | 5 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v 5 ms | `()=>{let i=e.MotionGlobalConfig.useManualTiming,o=i?a.timestamp:performance.now();n=!1,i\|\|` |
| 20.75 | kill-list | 60 | 0 | 0 | 0 | 0 | (no script) |  |

### rm — layout shifts (CLS total 0.061, session 0.061, 1 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 5.16 | 0.061 | journey | div.absolute.inset-0 in #journey ; div.mt-tier-block.border-t.border-rule in #about ; svg in #journey |

### rm — visual pops (0; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)


## gl — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 18 | 27.7 | 36.1 | 16.7 | 133.3 | 133.3 | 27.8 | 16.7 | 133.3 | 3 | 204 | 20 | 0 | 204.6 | 84.6 | #document ×11; div#intro ×11 | user-callback:IntersectionObserverCallback @ 17uxrkbdeaanq.js (250 ms) | 1 filter, 1 blend, 1 mask, 5 will-change, 2.3 MP of images |
| act-1 | 47 | 8.2 | 122.7 | 83.4 | 300.1 | 466.7 | 74.5 | 66 | 466.7 | 33 | 0 | 2.9 | 0 | 455.2 | 25.5 | #document ×25; div.absolute.inset-0.origin-center in #top ×22 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (8 ms) | 4 mask, 18 will-change, 14 infinite anims, 2.3 MP of images |
| about | 7 | 7 | 142.9 | 116.7 | 283.4 | 283.4 | 71.4 | 71.4 | 283.4 | 5 | 0 | 0 | 0.0025 | 849 | 51 | #document ×8; div#intro-stage ×8 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (6 ms) | 1 mask |
| journey | 36 | 11.4 | 87.5 | 83.3 | 150.1 | 233.4 | 88.9 | 72.2 | 233.4 | 28 | 64 | 6.3 | 0 | 719.4 | 61.9 | #document ×33; div#intro-stage ×33 | resolve-promise:Promise.resolve @ 3c41okqj08im4.js (98 ms) | 1 mask, 1 will-change, 0.8 MP of images |
| act-2 | 75 | 17.4 | 57.3 | 33.3 | 200 | 366.7 | 41.3 | 36 | 366.7 | 27 | 0 | 0 | 0 | 551.4 | 59.8 | #document ×35; div#intro ×27 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r (33 ms) | 2 filter, 3 mask, 20 will-change, 12 infinite anims, 4.7 MP of images |
| work | 48 | 19.2 | 52.1 | 33.3 | 150 | 233.3 | 39.6 | 22.9 | 233.3 | 14 | 0 | 0 | 0 | 593.2 | 69.2 | #document ×21; div.relative.sm:overflow-hidden.sm:rounded-frame in #work ×21 |  | 3 filter, 1 blend, 2 mask, 2 will-change, 3.2 MP of images |
| trading-algos | 26 | 11.3 | 88.5 | 66.7 | 183.4 | 250 | 73.1 | 61.5 | 250 | 18 | 0 | 0 | 0.0009 | 777 | 48.7 | #document ×15; div#intro-stage ×10 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (10 ms) | 2 filter, 0.2 MP of images |
| optuna-screener | 30 | 9.6 | 104.4 | 99.9 | 200 | 366.7 | 73.3 | 70 | 366.7 | 20 | 0 | 0 | 0 | 737.9 | 69.9 | #document ×30; div.stage-window in #trading-algos ×30 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (7 ms) | 2 filter, 2.1 MP of images |
| experiment | 17 | 18.5 | 53.9 | 50 | 100.1 | 100.1 | 70.6 | 35.3 | 100.1 | 7 | 0 | 0 | 0 | 697.1 | 58.9 | #document ×15; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×7 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (6 ms) |  |
| systems | 38 | 15.3 | 65.4 | 66.6 | 150 | 216.6 | 60.5 | 52.6 | 216.6 | 20 | 0 | 0 | 0 | 788.9 | 58 | #document ×32; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×21 |  | 1 mask, 1 will-change, 1 MP of images |
| kill-list | 28 | 12.3 | 81.5 | 83.3 | 166.7 | 183.4 | 78.6 | 71.4 | 183.4 | 21 | 15 | 4.5 | 0 | 865 | 54.7 | #document ×26; div.relative.@container.will-change-[transform,opacity] in #header ×26 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (67 ms) | 1 mask, 3 will-change, 0.6 MP of images |
| films | 503 | 33.9 | 29.5 | 16.7 | 83.3 | 200 | 13.9 | 10.9 | 283.4 | 58 | 241 | 10 | 0 | 425.9 | 65.3 | #document ×286; div.act-card-stage.relative.flex in #act-3 ×118 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r (119 ms) | 4 will-change, 6.8 MP of images |
| act-3 | 99 | 21.1 | 47.3 | 16.7 | 266.6 | 433.3 | 21.2 | 17.2 | 433.3 | 19 | 0 | 0 | 0 | 496.3 | 47 | #document ×52; div.stage-window in #beyond ×47 |  | 1 filter, 3 mask, 6 will-change, 2 MP of images |
| beyond | 59 | 12.9 | 77.7 | 50.1 | 233.4 | 616.7 | 67.8 | 54.2 | 616.7 | 33 | 0 | 0 | 0.0113 | 645.6 | 58.7 | #document ×56; div.act-card-stage.relative.flex in #act-3 ×46 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (11 ms) | 7 mask, 1 will-change, 5.8 MP of images |
| writing | 41 | 14.2 | 70.3 | 66.7 | 133.4 | 183.3 | 80.5 | 58.5 | 183.3 | 25 | 0 | 9.1 | 0.0009 | 838.3 | 130.4 | #document ×42; div.act-card-stage.relative.flex in #act-4 ×42 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r (45 ms) | 5 mask, 3 will-change |
| voices | 26 | 14.4 | 69.2 | 66.7 | 133.3 | 183.3 | 80.8 | 65.4 | 183.3 | 17 | 0 | 0 | 0 | 606.7 | 101.7 | #document ×23; div.act-card-stage.relative.flex in #act-4 ×23 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r (50 ms) | 1 mask, 12 will-change, 9 infinite anims, 3.5 MP of images |
| act-4 | 124 | 26.5 | 37.8 | 16.7 | 116.7 | 316.7 | 18.5 | 16.9 | 333.3 | 20 | 0 | 0 | 0 | 508.9 | 30.5 | #document ×33; div.rdr2-module__R8wI0W__campSticky in #voices ×28 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r (44 ms) | 2 canvas, 3 mask, 26 will-change, 21 infinite anims, 2.3 MP of images |
| principles | 15 | 4.5 | 221.1 | 250 | 516.6 | 516.6 | 86.7 | 80 | 516.6 | 12 | 0 | 0 | 0.0015 | 1005 | 21.7 | #document ×15; div.act-card-stage.relative.flex in #act-4 ×15 | event-listener:MessagePort.onmessage @ 3jh1u-s3k0bkk.js _ (5 ms) | 7 will-change |
| contact | 3 | 2.7 | 372.2 | 383.2 | 400 | 400 | 100 | 100 | 400 | 3 | 0 | 0 | 0 | 811.4 | 20.6 | #document ×3; div.act-card-stage.relative.flex in #act-4 ×3 | user-callback:IntersectionObserverCallback @ 3c41okqj08im4.js (6 ms) | 4 mask, 1.9 MP of images |
| credits | 80 | 19.6 | 51 | 50 | 83.4 | 300 | 58.8 | 21.3 | 300 | 18 | 0 | 0 | 0 | 599 | 18.6 | #document ×36; div.stage-cam ×22 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v (5 ms) | 1 will-change |

### gl — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 450→3283 | 49 | 8.3 | 120.4 | 83.4 | 300.1 | 466.7 | 65.3 | 466.7 | 35 | 204 | 2.8 |
| act-2 | 6861→9201 | 83 | 17.7 | 56.6 | 33.3 | 166.6 | 366.7 | 34.9 | 366.7 | 31 | 0 | 0 |
| act-3 | 26632→28792 | 103 | 18.6 | 53.7 | 16.7 | 266.6 | 433.3 | 19.4 | 616.7 | 23 | 0 | 0 |
| act-4 | 36727→39067 | 127 | 25 | 40 | 16.7 | 149.9 | 316.7 | 18.1 | 333.3 | 23 | 0 | 0 |

### gl — longest animation frames (LoAF total 47713 ms, main-thread work 1486 ms, blocking 524 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 48.03 | beyond | 600 | 0 | 1 | 1 | 0 | (no script) |  |
| 64.78 | principles | 516 | 0 | 1 | 1 | 0 | (no script) |  |
| 2.58 | act-1 | 455 | 0 | 1 | 1 | 0 | (no script) |  |
| 44.61 | act-3 | 419 | 0 | 1 | 1 | 0 | (no script) |  |
| 65.3 | contact | 395 | 0 | 7 | 1 | 6 | user-callback:IntersectionObserverCallback @ 3c41okqj08im4.js 6 ms | `e=>{let t=r;for(let n of e)n.isIntersecting&&(t=n.target.id);t!==r&&(r=t,i.forEach(e=>e())` |

### gl — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 0.52 | top | 263 | 204 | 251 | 1 | 250 | user-callback:IntersectionObserverCallback @ 17uxrkbdeaanq.js 250 ms | `e=>{e.forEach(e=>{let t=H.get(e.target);if(!t)return;let r=e.boundingClientRect;t.visible=` |
| 37.33 | films | 110 | 60 | 106 | 1 | 105 | user-callback:IdleRequestCallback @ 1uwt76h5owkqh.js r 105 ms | `()=>{o\|\|(o=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 8.08 | journey | 127 | 64 | 99 | 1 | 98 | resolve-promise:Promise.resolve @ 3c41okqj08im4.js 98 ms |  |
| 29.61 | films | 109 | 17 | 64 | 1 | 63 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v 63 ms | `()=>{let i=e.MotionGlobalConfig.useManualTiming,o=i?a.timestamp:performance.now();n=!1,i\|\|` |
| 28.33 | kill-list | 97 | 15 | 62 | 1 | 61 | user-callback:FrameRequestCallback @ 31ldopvygyepf.js v 61 ms | `()=>{let i=e.MotionGlobalConfig.useManualTiming,o=i?a.timestamp:performance.now();n=!1,i\|\|` |

### gl — layout shifts (CLS total 0.0171, session 0.0113, 11 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 51.12 | 0.0113 | beyond | span.whitespace-nowrap in #beyond ; span[data-w] in #beyond ; span[data-words=scrub][data-words-variant=default] in #beyond |
| 7.33 | 0.0025 | about | span[data-w] in #about ; span[data-w] in #about ; span[data-words=scrub][data-words-variant=default] in #about |
| 63.08 | 0.0015 | principles | h3.type-title.text-fg.max-sm:hyphens-auto in #principles ; h3.type-title.text-fg.max-sm:hyphens-auto in #principles ; h3.type-title.text-fg.max-sm:hyphens-auto in #principles |
| 18.35 | 0.0009 | trading-algos | span.scene-caption__film.world-face-idiots in #trading-algos ; p.scene-caption.mb-tier-group[data-caption=cap.trading-algos][data-caption-world=idiots] in #trading-algos |
| 53.6 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 54.51 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 55.38 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 53.97 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |

### gl — visual pops (8; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 14.84 | 8118 | act-2 | 25 | 8.3 | 151.4 | change | 17 | 7 |
| 36.21 | 23663 | films | 33 | 12.8 | 77.9 | change | 26.7 | 8 |
| 39.30 | 24810 | films | 9 | 4.7 | 251.1 | change | 7.4 | 1 |
| 42.87 | 26035 | films | 9 | 6 | 113.7 | change | 11.1 | 2 |
| 59.41 | 37744 | act-4 | 35 | 29.8 | 3.5 | change | 54.6 | 2 |
| 62.24 | 37959 | principles | 39 | 4.5 | 450.4 | change | 5.6 | 1 |
| 62.43 | 38064 | principles | 9 | 3.4 | 342 | change | 6.3 | 1 |
| 64.41 | 39807 | principles | 20 | 7.5 | 753.1 | change | 14.7 | 1 |

## Strips

- strips/intro.png
- strips/intro-landing.png
- strips/pop-intro-60.png
- strips/pop-intro-41.png
- strips/pop-intro-102.png
- strips/desktop-act-1.png
- strips/desktop-act-2.png
- strips/desktop-act-3.png
- strips/desktop-act-4.png
- strips/desktop-first-60s.png
- strips/pop-desktop-679.png
- strips/pop-desktop-108.png
- strips/pop-desktop-364.png
- strips/native-act-1.png
- strips/native-act-2.png
- strips/native-act-3.png
- strips/native-act-4.png
- strips/native-first-60s.png
- strips/pop-native-727.png
- strips/pop-native-715.png
- strips/pop-native-138.png
- strips/pop-native-645.png
- strips/alt-act-1.png
- strips/alt-act-2.png
- strips/alt-act-3.png
- strips/alt-act-4.png
- strips/alt-first-60s.png
- strips/pop-alt-578.png
- strips/pop-alt-1004.png
- strips/pop-alt-632.png
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
- strips/pop-gl-739.png
- strips/pop-gl-434.png
- strips/pop-gl-156.png
