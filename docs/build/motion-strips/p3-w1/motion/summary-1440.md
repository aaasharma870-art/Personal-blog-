# Motion baseline — 2026-10-01T13:24:31.650Z

Base http://localhost:3161 · Chromium 141.0.7390.37 headless · 4 CPUs · screencast everyNthFrame=1.

> Headless Chromium rasterises in software (SwiftShader) on a few CPUs and pays for the screencast readback, so absolute frame times are pessimistic vs a real laptop/phone GPU. Read them as RELATIVE hotspots: which sections and transitions are worst. "busy∩jank %" = share of >33.4 ms frames that overlap a long animation frame in which the main thread really worked (script + style/layout/paint >= half the frame, or a >50 ms task); low = the frame was raster/composite-bound (the LoAF is the main thread waiting on the compositor), high = main-thread script/style/layout. "paint suspects" = what the section holds that is costly to raster (filters, blend, masks, canvas, video, image megapixels, infinite animations).

## Runs

| run | viewport | lenis | secs | rAF frames | fps | mean ms | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | LoAF block ms | busy∩jank % | CLS total | CLS (session) | pops | shots |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| intro | 1440x900 |  | 14.4 | 149 | 10.4 | 96.1 | 83.2 | 183.3 | 616.7 | 62.4 | 59.1 | 2066.6 | 100 | 4194 | 15.1 | 0.0051 | 0.0051 | 8 | 81 |
| desktop | 1440x900 | on | 148.8 | 884 | 5.9 | 168.4 | 16.7 | 416.8 | 2316.7 | 35.3 | 33.1 | 11183 | 295 | 3281 | 17.9 | 0.0032 | 0.0011 | 1 | 350 |
| native | 1440x900 | off | 107.7 | 630 | 5.9 | 168.4 | 16.7 | 433.3 | 883.3 | 39.8 | 34.8 | 25282.3 | 213 | 391 | 4.4 | 0.0033 | 0.0014 | 19 | 436 |
| rm | 1440x900 | off | 58.2 | 2948 | 50.6 | 19.7 | 16.7 | 16.8 | 100 | 1.4 | 1.2 | 1499.8 | 42 | 491 | 22.5 | 0.008 | 0.008 | 2 | 455 |

## Top 10 hotspots (by mean frame time; rm excluded)

| # | run | where | frames | fps | mean | p95 | p99 | >50 % | max | mean / run mean | LoAF block ms | likely cause |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | native | principles | 8 | 0.2 | 5672.7 | 25282.3 | 25282.3 | 100 | 25282.3 | 33.7 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.9% waiting for the compositor — on screen: 5 will-change [while scrolling: raster 931 ms/s, 0.6 paints/s — repainting: #document ×8; div.relative.flex.flex-col in #act-4 ×8 \| idle 0.3 fps, raster 4731.4 ms/s, 4 paints/s] |
| 2 | desktop | principles | 10 | 0.2 | 4196.5 | 10016.3 | 10016.3 | 100 | 10016.3 | 24.9 | 622 | main thread, script-bound (1.8% script; top: user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t 731 ms) [while scrolling: raster 1119 ms/s, 1 paints/s — repainting: #document ×10; div.relative.flex.flex-col in #act-4 ×10 \| idle 0.3 fps, raster 4731.4 ms/s, 4 paints/s] |
| 3 | native | journey | 11 | 2.5 | 395.4 | 899.9 | 899.9 | 100 | 899.9 | 2.3 | 162 | raster/composite-bound: only 18.2% of janky frames overlap real main-thread work; the LoAFs are 94.4% waiting for the compositor — on screen: 1 mask, 1 will-change, 0.8 MP of images [while scrolling: raster 684.4 ms/s, 18.9 paints/s — repainting: #document ×11; div.relative.flex.flex-col in #act-2 ×9 \| idle 60.5 fps, raster 0 ms/s, 0 paints/s] |
| 4 | desktop | act-2 | 8 | 2.7 | 364.6 | 883.4 | 883.4 | 100 | 883.4 | 2.2 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.3% waiting for the compositor — on screen: 2 filter, 2 mask, 8 will-change, 3.5 MP of images [while scrolling: raster 670.3 ms/s, 19.5 paints/s — repainting: #document ×8; div#intro ×8 \| idle 60.6 fps, raster 0 ms/s, 0 paints/s] |
| 5 | desktop | journey | 11 | 3 | 336.3 | 716.6 | 716.6 | 100 | 716.6 | 2 | 113 | raster/composite-bound: only 18.2% of janky frames overlap real main-thread work; the LoAFs are 95.1% waiting for the compositor — on screen: 1 mask, 1 will-change, 0.8 MP of images [while scrolling: raster 861.9 ms/s, 23.8 paints/s — repainting: #document ×11; div.relative.flex.flex-col in #act-2 ×11 \| idle 60.5 fps, raster 0 ms/s, 0 paints/s] |
| 6 | native | act-4 transition | 14 | 3 | 333.3 | 799.9 | 799.9 | 78.6 | 799.9 | 2 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.2% waiting for the compositor — on screen: 2 mask, 5 will-change, 2.3 MP of images [while scrolling: raster 703 ms/s, 10 paints/s — repainting: #document ×10; div.relative.flex.flex-col in #act-4 ×3 \| idle 60.6 fps, raster 0 ms/s, 0 paints/s] |
| 7 | desktop | about | 8 | 3.1 | 327.1 | 683.3 | 683.3 | 87.5 | 683.3 | 1.9 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 94.8% waiting for the compositor — on screen: 1 mask [while scrolling: raster 872.5 ms/s, 15.3 paints/s — repainting: div#intro ×9; div.relative.flex.flex-col in #act-2 ×9 \| idle 58.1 fps, raster 0 ms/s, 0 paints/s] |
| 8 | intro | intro:hold | 8 | 3.5 | 287.5 | 2066.6 | 2066.6 | 25 | 2066.6 | 3 | 2157 | main thread, script-bound (94.4% script; top: event-listener:VIDEO.onended @ intro.js 1989 ms) [while scrolling: raster 23.5 ms/s, 7.8 paints/s — repainting: #document ×4; div.origin-right.will-change-transform in #principles ×2] |
| 9 | desktop | beyond | 20 | 3.5 | 285.8 | 533.3 | 533.3 | 90 | 533.3 | 1.7 | 10 | raster/composite-bound: only 10% of janky frames overlap real main-thread work; the LoAFs are 99.1% waiting for the compositor — on screen: 6 mask, 3 MP of images [while scrolling: raster 771.8 ms/s, 10.8 paints/s — repainting: #document ×19; div.stage-window in #beyond ×15 \| idle 60.5 fps, raster 0 ms/s, 0 paints/s] |
| 10 | desktop | top | 10 | 3.6 | 280 | 1249.9 | 1249.9 | 70 | 1249.9 | 1.7 | 181 | main thread, script-bound (3.5% script; top: user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t 91 ms) [while scrolling: raster 430 ms/s, 15.4 paints/s — repainting: #document ×14; div.relative.px-gutter.pt-tier-group in #act-1 ×9 \| idle 0.2 fps, raster 48.6 ms/s, 1.3 paints/s] |

## Idle probe (desktop: parked 2.5 s on each section, then 1.5 s traced standing still; high raster with few paints = a raster-heavy layer, many paints/s = continuous animation)

| section | idle fps | raster ms/s | paints/s | paint ms/s | style+layout ms/s | rAF JS ms/s | top repainting nodes |
|---|---|---|---|---|---|---|---|
| top | 0.2 | 48.6 | 1.3 | 0.9 | 1.4 | 1.7 | #document ×1; div.absolute.inset-0.will-change-transform ×1 |
| act-1 | 60.6 | 0 | 0 | 0 | 0 | 21.7 |  |
| about | 58.1 | 0 | 0 | 0 | 3.9 | 25 |  |
| journey | 60.5 | 0 | 0 | 0 | 0 | 19.3 |  |
| act-2 | 60.6 | 0 | 0 | 0 | 0 | 20.6 |  |
| work | 60.2 | 0 | 0 | 0 | 0 | 20.6 |  |
| trading-algos | 60.5 | 0 | 0 | 0 | 0 | 18.8 |  |
| optuna-screener | 60.5 | 0 | 0 | 0 | 0 | 21.1 |  |
| experiment | 60.7 | 0 | 0 | 0 | 0 | 20.3 |  |
| systems | 60.2 | 0 | 0 | 0 | 0 | 22.4 |  |
| kill-list | 60.2 | 0 | 0 | 0 | 0 | 20.8 |  |
| films | 60.3 | 0 | 0 | 0 | 0 | 21.8 |  |
| act-3 | 60.1 | 0 | 0 | 0 | 0 | 18.6 |  |
| beyond | 60.5 | 0 | 0 | 0 | 0 | 18.5 |  |
| writing | 60.1 | 0 | 0 | 0 | 0 | 19.6 |  |
| voices | 60.2 | 0 | 0 | 0 | 0 | 19.7 |  |
| act-4 | 60.6 | 0 | 0 | 0 | 0 | 20.7 |  |
| principles | 0.3 | 4731.4 | 4 | 1.7 | 63.9 | 63.7 | #document ×1; div.relative.order-2.flex ×1; div.absolute.inset-0.-z-10 ×1 |
| contact | 0.3 | 1638.5 | 0 | 0 | 102.9 | 103.2 |  |
| credits | 0.1 | 4729.1 | 2 | 1.6 | 139.4 | 67.9 | #document ×1; div.stage-layer ×1; div.stage-cam ×1 |

## intro — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| intro:play-screen | 25 | 9 | 110.7 | 50 | 150 | 1399.9 | 60 | 40 | 1399.9 | 10 | 1474 | 40 | 0.0051 | 313.4 | 25.7 | #document ×18; div.relative.px-gutter.pt-tier-group in #act-1 ×8 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (1682 ms) |  |
| intro:flight | 71 | 10.7 | 93.2 | 99.9 | 183.3 | 616.7 | 69 | 69 | 616.7 | 48 | 144 | 8.2 | 0 | 373.9 | 6.3 | #document ×11; div.relative.px-gutter.pt-tier-group in #act-1 ×6 | user-callback:FrameRequestCallback (120 ms) |  |
| intro:hold | 8 | 3.5 | 287.5 | 16.7 | 2066.6 | 2066.6 | 25 | 25 | 2066.6 | 3 | 2157 | 100 | 0 | 23.5 | 7.8 | #document ×4; div.origin-right.will-change-transform in #principles ×2 | event-listener:VIDEO.onended @ intro.js (1989 ms) |  |
| intro:reveal | 6 | 8 | 125 | 150 | 200 | 200 | 83.3 | 83.3 | 200 | 5 | 0 | 20 | 0 | 37.3 | 13.3 | #document ×3; video.absolute.inset-0.size-full in #top ×2 |  |  |
| intro:titles | 47 | 14.6 | 68.4 | 50.1 | 166.6 | 200.1 | 55.3 | 51.1 | 200.1 | 23 | 61 | 7.7 | 0 | 0.3 | 3.7 | #document ×3; video.absolute.inset-0.size-full in #top ×2 | user-callback:FrameRequestCallback (106 ms) |  |
| top | 17 | 11.9 | 84.3 | 50 | 266.7 | 266.7 | 64.7 | 47.1 | 266.7 | 11 | 358 | 45.5 | 0 | 153.5 | 23.7 | #document ×7; div.origin-right.will-change-transform in #principles ×4 | user-callback:IdleRequestCallback @ 2ihssomsxg640.js r (167 ms) | 1 video, 1 filter, 1 blend, 1 mask, 5 will-change, 2.3 MP of images |

### intro — marks and LoAF intro:warm → intro:titles-end

warm t=4.973s → titles-end t=12.851s: 46 LoAF, **46 > 50 ms** (max 2086 ms, blocking 2376 ms)

intro:arm@-3.529 · intro:ready@-3.063 · intro:play@0 · intro:flight@0.273 · intro:warm@4.973 · intro:hold@6.579 · intro:reveal@8.878 · intro:landing@8.878 · intro:titles@9.65 · intro:end@9.651 · intro:titles-end@12.851

### intro — longest animation frames (LoAF total 15747 ms, main-thread work 4972 ms, blocking 4194 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 6.58 | intro:hold | 2086 | 2035 | 2083 | 1 | 2082 | event-listener:VIDEO.onended @ intro.js 1989 ms | `(){Y===t&&xn()})),t.addEventListener("error",(function(){Y===t&&(V?xn():Ln())}),!0);try{r=` |
| -2.77 | intro:play-screen | 1429 | 1343 | 1417 | 2 | 1415 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 1384 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| 0.39 | intro:flight | 604 | 0 | 1 | 1 | 0 | (no script) |  |
| 4.8 | intro:flight | 294 | 75 | 122 | 2 | 120 | user-callback:FrameRequestCallback 120 ms |  |
| 1.1 | intro:flight | 289 | 0 | 8 | 1 | 7 | classic-script:/_next/static/chunks/3ziz-5d0ajg82.js @ 3ziz-5d0ajg82.js 7 ms | `(globalThis.TURBOPACK\|\|(globalThis.TURBOPACK=[])).push(["object"==typeof document?document` |

### intro — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 6.58 | intro:hold | 2086 | 2035 | 2083 | 1 | 2082 | event-listener:VIDEO.onended @ intro.js 1989 ms | `(){Y===t&&xn()})),t.addEventListener("error",(function(){Y===t&&(V?xn():Ln())}),!0);try{r=` |
| -2.77 | intro:play-screen | 1429 | 1343 | 1417 | 2 | 1415 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 1384 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| -1.04 | intro:play-screen | 196 | 76 | 182 | 1 | 181 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 114 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| 13.15 | top | 175 | 125 | 168 | 1 | 167 | user-callback:IdleRequestCallback @ 2ihssomsxg640.js r 167 ms | `()=>{n\|\|(n=!0,e())},i=window;if("function"==typeof i.requestIdleCallback){let e=i.requestI` |
| 14.26 | top | 162 | 111 | 147 | 1 | 146 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js 146 ms | `i=>{for(let r of i){if(!r.isIntersecting)continue;let i=t.get(r.target);if(!(!i\|\|e.has(i))` |

### intro — layout shifts (CLS total 0.0051, session 0.0051, 1 shifts)

| t s | value | section | sources |
|---|---|---|---|
| -1.28 | 0.0051 | intro:play-screen | svg in #top ; svg in #top |

### intro — visual pops (8; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 0.79 | 0 | intro:flight | 0 | 5.1 | 18.4 | change | 4.8 | 1 |
| 2.32 | 0 | intro:flight | 0 | 2.4 | 17.4 | change | 5.7 | 1 |
| 2.80 | 0 | intro:flight | 0 | 11 | 48.2 | change | 16.1 | 5 |
| 3.41 | 0 | intro:flight | 0 | 10.5 | 21.9 | change | 16.7 | 3 |
| 3.88 | 0 | intro:flight | 0 | 5.8 | 10.9 | change | 9 | 1 |
| 4.47 | 0 | intro:flight | 0 | 16.6 | 18.3 | change | 35.6 | 5 |
| 4.75 | 0 | intro:flight | 0 | 8.2 | 3.4 | change | 10.5 | 1 |
| 11.16 | 0 | intro:titles | 0 | 10.4 | 3.9 | fill-in | 8.7 | 1 |

## desktop — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 10 | 3.6 | 280 | 133.3 | 1249.9 | 1249.9 | 70 | 70 | 1249.9 | 7 | 181 | 42.9 | 0 | 430 | 15.4 | #document ×14; div.relative.px-gutter.pt-tier-group in #act-1 ×9 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t (91 ms) | 1 filter, 1 blend, 1 mask, 5 will-change, 2.3 MP of images |
| act-1 | 20 | 4.5 | 222.5 | 166.7 | 683.4 | 683.4 | 75 | 75 | 683.4 | 14 | 147 | 33.3 | 0 | 724.3 | 11.2 | #document ×16; div#intro ×9 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t (127 ms) | 2 mask, 1 will-change, 1.2 MP of images |
| about | 8 | 3.1 | 327.1 | 333.3 | 683.3 | 683.3 | 87.5 | 87.5 | 683.3 | 7 | 0 | 0 | 0 | 872.5 | 15.3 | div#intro ×9; div.relative.flex.flex-col in #act-2 ×9 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (78 ms) | 1 mask |
| journey | 11 | 3 | 336.3 | 283.3 | 716.6 | 716.6 | 100 | 100 | 716.6 | 11 | 113 | 18.2 | 0 | 861.9 | 23.8 | #document ×11; div.relative.flex.flex-col in #act-2 ×11 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js (134 ms) | 1 mask, 1 will-change, 0.8 MP of images |
| act-2 | 8 | 2.7 | 364.6 | 383.3 | 883.4 | 883.4 | 100 | 100 | 883.4 | 8 | 0 | 0 | 0 | 670.3 | 19.5 | #document ×8; div#intro ×8 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (6 ms) | 2 filter, 2 mask, 8 will-change, 3.5 MP of images |
| work | 58 | 11 | 90.8 | 16.7 | 450 | 800 | 36.2 | 34.5 | 800 | 19 | 141 | 14.3 | 0 | 726.3 | 17.1 | #document ×16; div.stage-window in #trading-algos ×12 | user-callback:FrameRequestCallback (117 ms) | 3 filter, 1 blend, 2 mask, 2 will-change, 1.6 MP of images |
| trading-algos | 8 | 4 | 250 | 283.3 | 366.7 | 366.7 | 100 | 100 | 366.7 | 8 | 0 | 0 | 0 | 937.5 | 19 | #document ×8; div.stage-window in #optuna-screener ×8 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (33 ms) | 2 filter, 0.2 MP of images |
| optuna-screener | 21 | 3.9 | 256.3 | 200 | 516.7 | 583.4 | 90.5 | 90.5 | 583.4 | 19 | 0 | 0 | 0.0011 | 793.6 | 19.3 | #document ×19; div.stage-window in #trading-algos ×16 | user-callback:FrameRequestCallback @ 3tsl4njztm8lt.js v (19 ms) | 2 filter, 1.2 MP of images |
| experiment | 9 | 10.6 | 94.4 | 100 | 216.7 | 216.7 | 66.7 | 55.6 | 216.7 | 5 | 0 | 0 | 0 | 1068.2 | 29.4 | #document ×7; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×6 | event-listener:DOMWindow.onwheel @ http://localhost:3161/?skip=intro early (5 ms) |  |
| systems | 14 | 4.7 | 211.9 | 233.2 | 500 | 500 | 92.9 | 92.9 | 500 | 12 | 0 | 0 | 0 | 795.9 | 18.9 | #document ×12; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×11 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (8 ms) | 1 mask, 1 will-change, 1 MP of images |
| kill-list | 10 | 5.2 | 191.7 | 183.4 | 383.4 | 383.4 | 100 | 100 | 383.4 | 10 | 0 | 0 | 0 | 898.9 | 24 | #document ×10; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×10 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (10 ms) | 1 mask, 3 will-change, 0.3 MP of images |
| films | 376 | 22.2 | 45.1 | 16.7 | 166.7 | 383.3 | 18.9 | 17 | 1399.9 | 66 | 832 | 26.8 | 0 | 478.5 | 20.1 | #document ×123; svg.pointer-events-none.absolute.inset-0 viewBox=0 0 1778 1000 in #films ×40 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t (412 ms) | 4 will-change, 3.9 MP of images |
| act-3 | 78 | 20.3 | 49.1 | 16.7 | 200 | 966.6 | 14.1 | 14.1 | 966.6 | 11 | 88 | 27.3 | 0 | 676.5 | 15.7 | #document ×25; span.block in #header ×13 | user-callback:FrameRequestCallback (94 ms) | 1 filter, 2 mask, 6 will-change, 2 MP of images |
| beyond | 20 | 3.5 | 285.8 | 283.4 | 533.3 | 533.3 | 100 | 90 | 533.3 | 18 | 10 | 10 | 0.0006 | 771.8 | 10.8 | #document ×19; div.stage-window in #beyond ×15 | user-callback:FrameRequestCallback @ 3tsl4njztm8lt.js v (25 ms) | 6 mask, 3 MP of images |
| writing | 17 | 6.8 | 147 | 166.7 | 266.7 | 266.7 | 94.1 | 94.1 | 266.7 | 16 | 0 | 0 | 0.0006 | 776.9 | 35.6 | #document ×17; svg.size-full.overflow-visible.will-change-transform viewBox=0 0 400 500[data-motif=journal-landscape] in #writing ×17 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t (14 ms) | 4 mask, 3 will-change |
| voices | 14 | 9.7 | 103.6 | 100.1 | 183.3 | 183.3 | 100 | 85.7 | 183.3 | 12 | 0 | 0 | 0 | 789.7 | 28.3 | #document ×14; div.relative.flex.flex-col in #act-4 ×12 | user-callback:FrameRequestCallback @ 3tsl4njztm8lt.js v (5 ms) | 2 will-change, 2.3 MP of images |
| act-4 | 119 | 25.1 | 39.9 | 16.7 | 149.9 | 383.3 | 12.6 | 12.6 | 750 | 14 | 82 | 20 | 0 | 371.6 | 15.2 | #document ×24; div.rdr2-module__R8wI0W__campSticky in #voices ×19 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t (96 ms) | 2 mask, 5 will-change, 2.3 MP of images |
| principles | 10 | 0.2 | 4196.5 | 2966.6 | 10016.3 | 10016.3 | 100 | 100 | 10016.3 | 10 | 622 | 70 | 0.001 | 1119 | 1 | #document ×10; div.relative.flex.flex-col in #act-4 ×10 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t (731 ms) | 5 will-change |
| contact | 2 | 0.1 | 10916.3 | 11183 | 11183 | 11183 | 100 | 100 | 11183 | 2 | 253 | 100 | 0 | 897.3 | 0.3 | #document ×2; div.relative.flex.flex-col in #act-4 ×2 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t (221 ms) | 4 mask, 0.9 MP of images |
| credits | 71 | 4.7 | 210.8 | 16.7 | 916.5 | 7482.9 | 39.4 | 31 | 7482.9 | 26 | 812 | 25 | 0 | 492.2 | 3.1 | #document ×22; footer#credits.relative.isolate.z-(--z-main) in #credits ×13 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t (570 ms) |  |

### desktop — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 450→2481 | 25 | 4.6 | 215.3 | 166.7 | 633.3 | 683.4 | 76 | 683.4 | 19 | 217 | 26.3 |
| act-2 | 6213→8085 | 52 | 9.5 | 105.1 | 16.7 | 450 | 883.4 | 38.5 | 883.4 | 19 | 141 | 15 |
| act-3 | 27162→28512 | 82 | 16.1 | 62.2 | 16.7 | 300 | 966.6 | 18.3 | 966.6 | 16 | 88 | 20 |
| act-4 | 36465→38337 | 122 | 21.5 | 46.6 | 16.7 | 233.3 | 383.3 | 14.8 | 750 | 18 | 82 | 16.7 |

### desktop — longest animation frames (LoAF total 136619 ms, main-thread work 4142 ms, blocking 3281 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 122.8 | contact | 11139 | 154 | 88 | 2 | 86 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t 86 ms | `(e){var r,i,n,o,y=f()-d,T=!0===e;if((y>c\|\|y<0)&&(_+=y-p),d+=y,((r=(n=d-_)-g)>0\|\|T)&&(o=++u` |
| 112.11 | contact | 10683 | 99 | 147 | 1 | 146 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t 135 ms | `(e){var r,i,n,o,y=f()-d,T=!0===e;if((y>c\|\|y<0)&&(_+=y-p),d+=y,((r=(n=d-_)-g)>0\|\|T)&&(o=++u` |
| 82.85 | principles | 10024 | 89 | 128 | 2 | 126 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t 126 ms | `(e){var r,i,n,o,y=f()-d,T=!0===e;if((y>c\|\|y<0)&&(_+=y-p),d+=y,((r=(n=d-_)-g)>0\|\|T)&&(o=++u` |
| 92.89 | principles | 9957 | 92 | 131 | 1 | 130 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t 125 ms | `(e){var r,i,n,o,y=f()-d,T=!0===e;if((y>c\|\|y<0)&&(_+=y-p),d+=y,((r=(n=d-_)-g)>0\|\|T)&&(o=++u` |
| 102.85 | principles | 9249 | 42 | 83 | 1 | 82 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t 82 ms | `(e){var r,i,n,o,y=f()-d,T=!0===e;if((y>c\|\|y<0)&&(_+=y-p),d+=y,((r=(n=d-_)-g)>0\|\|T)&&(o=++u` |

### desktop — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 143.81 | credits | 1208 | 253 | 166 | 2 | 164 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t 164 ms | `(e){var r,i,n,o,y=f()-d,T=!0===e;if((y>c\|\|y<0)&&(_+=y-p),d+=y,((r=(n=d-_)-g)>0\|\|T)&&(o=++u` |
| 141.45 | credits | 2355 | 276 | 165 | 2 | 163 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t 163 ms | `(e){var r,i,n,o,y=f()-d,T=!0===e;if((y>c\|\|y<0)&&(_+=y-p),d+=y,((r=(n=d-_)-g)>0\|\|T)&&(o=++u` |
| 43.32 | films | 172 | 115 | 162 | 2 | 160 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js 160 ms | `i=>{for(let r of i){if(!r.isIntersecting)continue;let i=t.get(r.target);if(!(!i\|\|e.has(i))` |
| 35.72 | films | 165 | 114 | 155 | 1 | 154 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js 154 ms | `i=>{for(let r of i){if(!r.isIntersecting)continue;let i=t.get(r.target);if(!(!i\|\|e.has(i))` |
| 112.11 | contact | 10683 | 99 | 147 | 1 | 146 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t 135 ms | `(e){var r,i,n,o,y=f()-d,T=!0===e;if((y>c\|\|y<0)&&(_+=y-p),d+=y,((r=(n=d-_)-g)>0\|\|T)&&(o=++u` |

### desktop — layout shifts (CLS total 0.0032, session 0.0011, 7 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 27.42 | 0.0011 | optuna-screener | h3.mt-tier-pair.max-w-title.type-title in #optuna-screener |
| 70.98 | 0.001 | principles | p.world-face-hp.text-center.text-[1rem][data-lettered=hp] in #principles ; span.whitespace-nowrap in #principles ; span.scene-caption__sep in #principles |
| 60.44 | 0.0006 | beyond | span.whitespace-nowrap in #beyond ; span.scene-caption__film.world-face-rdr2 in #beyond |
| 63.56 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 62.75 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 63.3 | 0.0001 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 32.39 | 0 | systems | h3.type-heading.text-fg.lg:text-[length:var(--text-lead)] in #systems |

### desktop — visual pops (1; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 73.87 | 37884 | principles | 13 | 10.5 | 3.8 | change | 13.8 | 1 |

## native — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 6 | 9 | 111.1 | 66.6 | 433.2 | 433.2 | 50 | 50 | 433.2 | 3 | 0 | 0 | 0 | 619.6 | 52.5 | #document ×14; div.relative.px-gutter.pt-tier-group in #act-1 ×11 |  | 1 filter, 1 blend, 1 mask, 5 will-change, 2.3 MP of images |
| act-1 | 72 | 11.7 | 85.6 | 16.7 | 233.3 | 2449.9 | 22.2 | 19.4 | 2449.9 | 13 | 0 | 0 | 0 | 326.4 | 10.4 | #document ×24; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×10 | user-callback:TimerHandler:setTimeout @ 0cuac4a3q3k7b.js (8 ms) | 2 mask, 1 will-change, 1.2 MP of images |
| about | 6 | 3.6 | 275 | 183.3 | 883.3 | 883.3 | 83.3 | 83.3 | 883.3 | 5 | 0 | 0 | 0 | 466.7 | 17.6 | #document ×6; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×3 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (12 ms) | 1 mask |
| journey | 11 | 2.5 | 395.4 | 383.3 | 899.9 | 899.9 | 100 | 100 | 899.9 | 11 | 162 | 18.2 | 0 | 684.4 | 18.9 | #document ×11; div.relative.flex.flex-col in #act-2 ×9 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js (191 ms) | 1 mask, 1 will-change, 0.8 MP of images |
| act-2 | 16 | 6.2 | 161.4 | 116.6 | 400 | 400 | 75 | 68.8 | 400 | 12 | 0 | 0 | 0 | 649.2 | 21.7 | #document ×10; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×5 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (12 ms) | 2 filter, 2 mask, 8 will-change, 3.5 MP of images |
| work | 20 | 7.8 | 127.5 | 99.9 | 416.7 | 416.7 | 70 | 65 | 416.7 | 13 | 0 | 0 | 0.0014 | 802 | 22 | #document ×11; div.relative.flex.flex-col in #act-2 ×5 | user-callback:TimerHandler:setTimeout @ 0cuac4a3q3k7b.js (5 ms) | 3 filter, 1 blend, 2 mask, 2 will-change, 1.6 MP of images |
| trading-algos | 12 | 4.4 | 225 | 233.3 | 516.7 | 516.7 | 91.7 | 91.7 | 516.7 | 10 | 0 | 0 | 0 | 834.8 | 20.4 | #document ×11; div.relative.sm:overflow-hidden.sm:rounded-frame in #work ×9 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (17 ms) | 2 filter, 0.2 MP of images |
| optuna-screener | 28 | 5.6 | 177.4 | 133.3 | 500 | 916.6 | 78.6 | 67.9 | 916.6 | 17 | 0 | 0 | 0 | 550.5 | 19.1 | #document ×19; div.stage-window in #trading-algos ×16 | user-callback:FrameRequestCallback @ 3tsl4njztm8lt.js v (23 ms) | 2 filter, 1.2 MP of images |
| experiment | 52 | 37.1 | 26.9 | 16.7 | 133.3 | 250 | 7.7 | 5.8 | 250 | 4 | 0 | 0 | 0 | 277.9 | 17.1 | #document ×7; div.absolute.inset-x-0.top-0 in #kill-list ×4 |  |  |
| systems | 14 | 5 | 200 | 216.7 | 783.4 | 783.4 | 78.6 | 71.4 | 783.4 | 9 | 0 | 0 | 0 | 770.4 | 17.5 | #document ×12; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×8 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (6 ms) | 1 mask, 1 will-change, 1 MP of images |
| kill-list | 8 | 3.9 | 254.2 | 266.7 | 733.3 | 733.3 | 87.5 | 87.5 | 733.3 | 7 | 0 | 0 | 0 | 770.2 | 18.2 | #document ×8; div.absolute.inset-x-0.top-0 in #kill-list ×7 | event-listener:#document.onwheel @ 3p9eevrhj-twl.js fO (6 ms) | 1 mask, 3 will-change, 0.3 MP of images |
| films | 278 | 20.7 | 48.3 | 16.7 | 183.3 | 533.3 | 24.8 | 20.5 | 850 | 54 | 191 | 7.2 | 0 | 586.6 | 31.8 | #document ×170; svg.pointer-events-none.absolute.inset-0 viewBox=0 0 1778 1000 in #films ×69 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js (198 ms) | 4 will-change, 3.9 MP of images |
| act-3 | 38 | 17.7 | 56.6 | 16.7 | 416.6 | 416.7 | 34.2 | 21.1 | 416.7 | 8 | 0 | 0 | 0 | 515.4 | 26 | #document ×22; span.block in #act-3 ×13 |  | 1 filter, 2 mask, 6 will-change, 2 MP of images |
| beyond | 30 | 4.6 | 217.2 | 100 | 683.3 | 783.2 | 66.7 | 63.3 | 783.2 | 17 | 38 | 10 | 0.0008 | 781.7 | 11.5 | #document ×24; div.stage-window in #beyond ×9 | user-callback:FrameRequestCallback @ 3tsl4njztm8lt.js v (15 ms) | 6 mask, 3 MP of images |
| writing | 14 | 5.5 | 181 | 233.3 | 383.3 | 383.3 | 71.4 | 57.1 | 383.3 | 8 | 0 | 0 | 0.0008 | 723.6 | 33.6 | #document ×15; svg.size-full.overflow-visible.will-change-transform viewBox=0 0 400 500[data-motif=journal-landscape] in #writing ×13 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (14 ms) | 4 mask, 3 will-change |
| voices | 6 | 4.8 | 208.3 | 99.9 | 583.3 | 583.3 | 100 | 66.7 | 583.3 | 6 | 0 | 33.3 | 0 | 776.1 | 18.4 | #document ×6; div.rdr2-module__R8wI0W__campSticky in #voices ×4 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (30 ms) | 2 will-change, 2.3 MP of images |
| act-4 | 11 | 3.7 | 272.7 | 233.3 | 766.6 | 766.6 | 81.8 | 72.7 | 766.6 | 9 | 0 | 0 | 0 | 703 | 10 | #document ×10; div.relative.flex.flex-col in #act-4 ×3 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (5 ms) | 2 mask, 5 will-change, 2.3 MP of images |
| principles | 8 | 0.2 | 5672.7 | 799.9 | 25282.3 | 25282.3 | 100 | 100 | 25282.3 | 7 | 0 | 0 | 0.0003 | 931 | 0.6 | #document ×8; div.relative.flex.flex-col in #act-4 ×8 | user-callback:FrameRequestCallback @ 3tsl4njztm8lt.js v (16 ms) | 5 will-change |

### native — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 450→2481 | 76 | 11.6 | 86.4 | 16.7 | 233.3 | 2449.9 | 22.4 | 2449.9 | 16 | 0 | 0 |
| act-2 | 6213→8085 | 23 | 7.6 | 131.2 | 99.9 | 400 | 400 | 65.2 | 400 | 17 | 0 | 0 |
| act-3 | 27162→28512 | 49 | 17.7 | 56.5 | 16.7 | 216.7 | 416.7 | 26.5 | 416.7 | 12 | 0 | 0 |
| act-4 | 36465→38337 | 14 | 3 | 333.3 | 283.3 | 799.9 | 799.9 | 78.6 | 799.9 | 13 | 0 | 0 |

### native — longest animation frames (LoAF total 85647 ms, main-thread work 946 ms, blocking 391 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 73.46 | principles | 25273 | 0 | 1 | 1 | 0 | (no script) |  |
| 62.69 | principles | 10311 | 0 | 11 | 0 | 11 | user-callback:FrameRequestCallback @ 21-_nxqm8ngj-.js 6 ms | `()=>{c=0,E()}))}function O(e,t,i,o=!0){window.clearTimeout(e.timer),e.offIdle?.(),e.io?.di` |
| 20.68 | optuna-screener | 911 | 0 | 1 | 1 | 0 | (no script) |  |
| 9.18 | journey | 900 | 0 | 1 | 1 | 0 | (no script) |  |
| 7.23 | about | 891 | 0 | 1 | 1 | 0 | (no script) |  |

### native — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 10.8 | journey | 408 | 162 | 194 | 2 | 192 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js 185 ms | `i=>{for(let r of i){if(!r.isIntersecting)continue;let i=t.get(r.target);if(!(!i\|\|e.has(i))` |
| 37.99 | films | 118 | 62 | 111 | 2 | 109 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js 109 ms | `i=>{for(let r of i){if(!r.isIntersecting)continue;let i=t.get(r.target);if(!(!i\|\|e.has(i))` |
| 34.85 | films | 105 | 42 | 91 | 2 | 89 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js 89 ms | `i=>{for(let r of i){if(!r.isIntersecting)continue;let i=t.get(r.target);if(!(!i\|\|e.has(i))` |
| 57.14 | voices | 50 | 0 | 31 | 1 | 30 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 30 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| 22.15 | optuna-screener | 168 | 0 | 29 | 1 | 28 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 12 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |

### native — layout shifts (CLS total 0.0033, session 0.0014, 7 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 17.32 | 0.0014 | work | span.scene-caption__film.world-face-idiots in #work |
| 52.55 | 0.0008 | beyond | span.whitespace-nowrap in #beyond ; span.scene-caption__film.world-face-rdr2 in #beyond |
| 56.12 | 0.0004 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 55.33 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 61.71 | 0.0003 | principles | p.world-face-hp.text-center.text-[1rem][data-lettered=hp] in #principles ; span.whitespace-nowrap in #principles ; span.scene-caption__sep in #principles |
| 55.04 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 29.24 | 0 | systems | h3.type-heading.text-fg.lg:text-[length:var(--text-lead)] in #systems ; h3.type-heading.text-fg.lg:text-[length:var(--text-lead)] in #systems |

### native — visual pops (19; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 4.80 | 600 | act-1 | 0 | 9.6 | 93.1 | change | 18.7 | 1 |
| 8.28 | 2000 | about | 0 | 3.8 | 15.1 | change | 4.7 | 1 |
| 8.48 | 2000 | about | 0 | 3.2 | 12.6 | change | 4.1 | 1 |
| 9.90 | 2600 | journey | 0 | 7.3 | 24 | change | 20 | 1 |
| 10.16 | 2700 | journey | 0 | 5.7 | 14.7 | change | 15.1 | 1 |
| 15.19 | 7100 | act-2 | 0 | 8.4 | 6.7 | change | 12.6 | 1 |
| 23.42 | 13300 | optuna-screener | 0 | 4 | 3.7 | change | 0.7 | 1 |
| 28.43 | 17400 | systems | 0 | 28.6 | 4.5 | fill-in | 27.2 | 1 |
| 37.07 | 23400 | films | 0 | 6 | 84 | change | 5.3 | 1 |
| 37.55 | 23500 | films | 0 | 5.3 | 10.5 | change | 4 | 1 |
| 46.79 | 27300 | act-3 | 0 | 8 | 8.7 | change | 17.3 | 1 |
| 47.42 | 27700 | act-3 | 0 | 3.4 | 5.1 | change | 4.7 | 1 |
| 49.40 | 28100 | beyond | 0 | 2.9 | 22.1 | change | 3.6 | 1 |
| 53.72 | 29900 | beyond | 0 | 26 | 8.9 | fill-in | 24.1 | 1 |
| 61.32 | 37800 | principles | 0 | 7.5 | 3.3 | change | 4.2 | 1 |
| 66.47 | 38100 | principles | 0 | 45.2 | 6.9 | change | 25.5 | 1 |
| 88.71 | 39000 | principles | 0 | 106.5 | 14.2 | change | 56.7 | 1 |
| 98.72 | 39800 | principles | 0 | 49.7 | 4.6 | fill-in | 26 | 1 |
| 100.30 | 39800 | principles | 0 | 50.2 | 4.6 | fill-in | 26 | 1 |

## rm — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 28 | 60 | 16.7 | 16.7 | 16.7 | 16.7 | 0 | 0 | 16.7 | 0 | 0 |  | 0 | 6.4 | 6.4 | #document ×2; header.fixed.inset-x-0.top-0 in #header ×1 |  | 1.2 MP of images |
| act-1 | 184 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 2 | 2 | #document ×5; img.object-cover in #journey ×1 |  | 2 mask, 1.2 MP of images |
| about | 52 | 33.5 | 29.8 | 16.7 | 116.6 | 166.7 | 13.5 | 13.5 | 166.7 | 7 | 229 | 57.1 | 0.008 | 273.5 | 6.5 | #document ×8; svg.pointer-events-none.absolute.inset-0 viewBox=0 0 600 190 in #work ×2 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js (287 ms) | 1 mask |
| journey | 37 | 30 | 33.3 | 16.7 | 133.4 | 233.2 | 16.2 | 13.5 | 233.2 | 5 | 0 | 0 | 0 | 431.4 | 4.1 | #document ×4; img.object-cover in #work ×1 |  | 1 mask, 0.4 MP of images |
| act-2 | 137 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 2.2 | 1.8 | #document ×3; header.fixed.inset-x-0.top-0 in #header ×1 |  | 1 filter, 2 mask, 1.2 MP of images |
| work | 158 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 13.3 | 2.3 | #document ×5; img.object-cover in #optuna-screener ×1 |  | 4 filter, 1 blend, 2 mask, 1 will-change, 1.6 MP of images |
| trading-algos | 119 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 4 | 1.5 | #document ×3 |  | 2 filter |
| optuna-screener | 242 | 59.5 | 16.8 | 16.7 | 16.7 | 16.8 | 0.4 | 0 | 50 | 1 | 0 | 0 | 0 | 13 | 2.7 | #document ×9; div.absolute.inset-x-0.top-0 in #kill-list ×1 |  | 2 filter, 1 MP of images |
| experiment | 73 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 50.1 | 0.8 | #document ×1 |  |  |
| systems | 145 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 8.7 | 2.9 | #document ×6; img.object-cover in #films ×1 |  | 1 mask, 1 MP of images |
| kill-list | 79 | 30.4 | 32.9 | 16.7 | 166.6 | 433.2 | 8.9 | 8.9 | 433.2 | 8 | 0 | 0 | 0 | 461.6 | 18.8 | #document ×20; ol.relative.border-t.border-rule in #kill-list ×4 |  | 1 mask, 1 will-change, 0.3 MP of images |
| films | 564 | 50.1 | 19.9 | 16.7 | 16.8 | 150 | 1.8 | 1.6 | 466.6 | 11 | 262 | 50 | 0 | 90.9 | 2.5 | #document ×20; div.absolute.inset-x-0.top-0 in #kill-list ×3 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js (323 ms) | 3.9 MP of images |
| act-3 | 143 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 2.5 | 2.5 | #document ×4; header.fixed.inset-x-0.top-0 in #header ×1 |  | 2 mask, 1 MP of images |
| beyond | 263 | 59.6 | 16.8 | 16.7 | 16.8 | 16.8 | 0.4 | 0.4 | 50.1 | 1 | 0 | 0 | 0 | 30.8 | 3.4 | #document ×8; div.rdr2-module__R8wI0W__campSticky in #voices ×3 |  | 6 mask, 2.8 MP of images |
| writing | 171 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 4.9 | 4.9 | #document ×6; div.rdr2-module__R8wI0W__campSticky in #voices ×5 |  | 4 mask, 2 will-change |
| voices | 93 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 36.1 | 3.9 | #document ×3; div.rdr2-module__R8wI0W__campSticky in #voices ×3 |  | 2.3 MP of images |
| act-4 | 130 | 56.1 | 17.8 | 16.7 | 16.8 | 16.8 | 0.8 | 0.8 | 166.7 | 1 | 0 | 0 | 0 | 95.8 | 2.6 | #document ×3; div.rdr2-module__R8wI0W__campSticky in #voices ×2 |  | 2 mask, 1.2 MP of images |
| principles | 76 | 15.1 | 66.4 | 16.7 | 216.7 | 1499.8 | 7.9 | 6.6 | 1499.8 | 6 | 0 | 0 | 0 | 729.7 | 3 | #document ×7; div.rdr2-module__R8wI0W__campSticky in #voices ×6 |  |  |
| contact | 46 | 58.7 | 17 | 16.7 | 16.8 | 33.3 | 0 | 0 | 33.3 | 0 | 0 |  | 0 | 3.8 | 5.1 | #document ×2; div.relative.grid.grid-cols-1 in #principles ×1 |  | 4 mask, 0.9 MP of images |
| credits | 208 | 50.7 | 19.7 | 16.7 | 16.8 | 16.8 | 0.5 | 0.5 | 633.4 | 2 | 0 | 0 | 0 | 169.5 | 0.7 | #document ×2; header.fixed.inset-x-0.top-0 in #header ×1 |  |  |

### rm — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 450→2481 | 210 | 57.5 | 17.4 | 16.7 | 16.8 | 16.8 | 1 | 116.6 | 2 | 82 | 100 |
| act-2 | 4561→5941 | 170 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 16.8 | 0 | 0 |  |
| act-3 | 24175→25554 | 170 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 16.8 | 0 | 0 |  |
| act-4 | 33146→34496 | 154 | 56 | 17.9 | 16.7 | 16.8 | 50 | 0.6 | 166.7 | 2 | 0 | 0 |

### rm — longest animation frames (LoAF total 9554 ms, main-thread work 679 ms, blocking 491 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 51.83 | principles | 1487 | 0 | 0 | 0 | 0 | (no script) |  |
| 50.57 | principles | 1243 | 0 | 0 | 0 | 0 | (no script) |  |
| 49.87 | principles | 656 | 0 | 0 | 0 | 0 | (no script) |  |
| 54.15 | credits | 648 | 0 | 0 | 0 | 0 | (no script) |  |
| 23.83 | films | 439 | 0 | 1 | 1 | 0 | (no script) |  |

### rm — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 4.34 | about | 176 | 121 | 167 | 1 | 166 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js 166 ms | `i=>{for(let r of i){if(!r.isIntersecting)continue;let i=t.get(r.target);if(!(!i\|\|e.has(i))` |
| 24.86 | films | 178 | 115 | 164 | 1 | 163 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js 163 ms | `i=>{for(let r of i){if(!r.isIntersecting)continue;let i=t.get(r.target);if(!(!i\|\|e.has(i))` |
| 28.69 | films | 169 | 118 | 161 | 1 | 160 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js 160 ms | `i=>{for(let r of i){if(!r.isIntersecting)continue;let i=t.get(r.target);if(!(!i\|\|e.has(i))` |
| 3.89 | about | 132 | 82 | 122 | 1 | 121 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js 121 ms | `i=>{for(let r of i){if(!r.isIntersecting)continue;let i=t.get(r.target);if(!(!i\|\|e.has(i))` |
| 25.04 | films | 155 | 29 | 58 | 1 | 57 | user-callback:TimerHandler:setTimeout @ 0cuac4a3q3k7b.js 57 ms | `()=>{let e=function(){let e=.475*window.innerHeight,t=null;for(let n of z){let i=document.` |

### rm — layout shifts (CLS total 0.008, session 0.008, 2 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 4.09 | 0.005 | about | p.type-body.text-fg-muted in #about ; svg[data-instrument=jack-compass][data-lid=open] in #about ; li.max-w-[34ch] in #about |
| 4.02 | 0.0029 | about | p.type-body.text-fg in #about ; p.type-body.text-fg-muted in #about ; svg[data-instrument=jack-compass][data-lid=open] in #about |

### rm — visual pops (2; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 26.25 | 19600 | films | 0 | 5.8 | 8.1 | fill-in | 12 | 1 |
| 53.05 | 36100 | principles | 0 | 49.7 | 5.2 | change | 27.5 | 1 |

## Strips

- strips/intro.png
- strips/intro-landing.png
- strips/pop-intro-36.png
- strips/pop-intro-24.png
- strips/pop-intro-29.png
- strips/pop-intro-64.png
- strips/desktop-act-1.png
- strips/desktop-act-2.png
- strips/desktop-act-3.png
- strips/desktop-act-4.png
- strips/desktop-first-60s.png
- strips/pop-desktop-320.png
- strips/native-act-1.png
- strips/native-act-2.png
- strips/native-act-3.png
- strips/native-act-4.png
- strips/native-first-60s.png
- strips/pop-native-429.png
- strips/pop-native-425.png
- strips/pop-native-31.png
- strips/pop-native-433.png
- strips/rm-act-1.png
- strips/rm-act-2.png
- strips/rm-act-3.png
- strips/rm-act-4.png
- strips/rm-first-60s.png
- strips/pop-rm-429.png
- strips/pop-rm-236.png
