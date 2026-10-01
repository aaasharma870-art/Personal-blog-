# Motion baseline — 2026-10-01T13:37:26.567Z

Base http://localhost:3162 · Chromium 141.0.7390.37 headless · 4 CPUs · screencast everyNthFrame=1.

> Headless Chromium rasterises in software (SwiftShader) on a few CPUs and pays for the screencast readback, so absolute frame times are pessimistic vs a real laptop/phone GPU. Read them as RELATIVE hotspots: which sections and transitions are worst. "busy∩jank %" = share of >33.4 ms frames that overlap a long animation frame in which the main thread really worked (script + style/layout/paint >= half the frame, or a >50 ms task); low = the frame was raster/composite-bound (the LoAF is the main thread waiting on the compositor), high = main-thread script/style/layout. "paint suspects" = what the section holds that is costly to raster (filters, blend, masks, canvas, video, image megapixels, infinite animations).

## Runs

| run | viewport | lenis | secs | rAF frames | fps | mean ms | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | LoAF block ms | busy∩jank % | CLS total | CLS (session) | pops | shots |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| intro | 1024x768 |  | 10.4 | 295 | 28.2 | 35.4 | 16.7 | 116.6 | 183.3 | 23.7 | 23.1 | 233.3 | 84 | 391 | 11.4 | 0 | 0 | 4 | 115 |
| desktop | 1024x768 | off | 66.9 | 713 | 10.7 | 93.9 | 16.7 | 366.6 | 999.9 | 31.8 | 28.1 | 2833.2 | 200 | 112 | 0.9 | 0 | 0 | 19 | 414 |

## Top 10 hotspots (by mean frame time; rm excluded)

| # | run | where | frames | fps | mean | p95 | p99 | >50 % | max | mean / run mean | LoAF block ms | likely cause |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | desktop | principles | 9 | 1.2 | 862.9 | 2649.9 | 2649.9 | 100 | 2649.9 | 9.2 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.6% waiting for the compositor — on screen: 52 will-change [while scrolling: raster 1117.2 ms/s, 3.3 paints/s — repainting: #document ×8; div.rdr2-module__R8wI0W__campSticky in #voices ×6 \| idle 3.5 fps, raster 1073.1 ms/s, 3.3 paints/s] |
| 2 | desktop | journey | 8 | 2.9 | 350 | 1033.3 | 1033.3 | 100 | 1033.3 | 3.7 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.4% waiting for the compositor — on screen: 1 mask, 0.6 MP of images [while scrolling: raster 705.8 ms/s, 10.7 paints/s — repainting: #document ×8; span.block in #act-1 ×7 \| idle 60.2 fps, raster 0 ms/s, 0 paints/s] |
| 3 | desktop | systems | 8 | 3.2 | 316.7 | 750 | 750 | 87.5 | 750 | 3.4 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.2% waiting for the compositor — on screen: 1 mask, 0.6 MP of images [while scrolling: raster 866.1 ms/s, 4.7 paints/s — repainting: #document ×7; div.relative.mx-auto.w-full in #systems ×1 \| idle 59.9 fps, raster 0 ms/s, 0 paints/s] |
| 4 | desktop | act-2 | 13 | 3.8 | 264.1 | 999.9 | 999.9 | 84.6 | 999.9 | 2.8 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.1% waiting for the compositor — on screen: 2 filter, 2 mask, 7 will-change, 1.8 MP of images [while scrolling: raster 645.2 ms/s, 16 paints/s — repainting: #document ×12; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×6 \| idle 60.4 fps, raster 0 ms/s, 1.3 paints/s] |
| 5 | desktop | work | 10 | 4.1 | 245 | 533.3 | 533.3 | 60 | 533.3 | 2.6 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.4% waiting for the compositor — on screen: 3 filter, 1 blend, 2 mask, 0.8 MP of images [while scrolling: raster 940.9 ms/s, 12.2 paints/s — repainting: #document ×10; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×6 \| idle 60.2 fps, raster 0 ms/s, 0 paints/s] |
| 6 | desktop | kill-list | 12 | 4.8 | 206.9 | 883.3 | 883.3 | 58.3 | 883.3 | 2.2 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 98.7% waiting for the compositor — on screen: 1 mask, 0.1 MP of images [while scrolling: raster 756.7 ms/s, 12.1 paints/s — repainting: #document ×12; svg.absolute.inset-0.size-full viewBox=0 0 360 488 in #systems ×4 \| idle 60.1 fps, raster 0 ms/s, 0 paints/s] |
| 7 | desktop | trading-algos | 8 | 5 | 200 | 450 | 450 | 87.5 | 450 | 2.1 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.3% waiting for the compositor — on screen: 2 filter [while scrolling: raster 774.4 ms/s, 22.5 paints/s — repainting: #document ×8; span.block in #act-1 ×5 \| idle 60.6 fps, raster 0 ms/s, 0 paints/s] |
| 8 | desktop | writing | 13 | 5.3 | 188.4 | 616.6 | 616.6 | 46.2 | 616.6 | 2 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99% waiting for the compositor — on screen: 8 filter, 1 mask, 2 will-change [while scrolling: raster 933.1 ms/s, 28.2 paints/s — repainting: #document ×14; svg.size-full.overflow-visible.will-change-transform viewBox=0 0 400 500[data-motif=journal-landscape] in #writing ×11 \| idle 60.3 fps, raster 0 ms/s, 0 paints/s] |
| 9 | desktop | beyond | 26 | 5.7 | 176.3 | 566.7 | 583.3 | 69.2 | 583.3 | 1.9 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 98.4% waiting for the compositor — on screen: 6 filter, 2.2 MP of images [while scrolling: raster 711.5 ms/s, 11.6 paints/s — repainting: #document ×22; div.rdr2-module__R8wI0W__bandLayer in #beyond ×5 \| idle 60.5 fps, raster 0 ms/s, 0.7 paints/s] |
| 10 | desktop | optuna-screener | 24 | 6 | 167.4 | 416.7 | 466.6 | 75 | 466.6 | 1.8 | 32 | raster/composite-bound: only 5.3% of janky frames overlap real main-thread work; the LoAFs are 97.9% waiting for the compositor — on screen: 2 filter, 0.6 MP of images [while scrolling: raster 762.4 ms/s, 12.9 paints/s — repainting: #document ×23; svg.absolute.inset-0.size-full viewBox=0 0 1000 236 in #optuna-screener ×5 \| idle 60 fps, raster 0 ms/s, 0 paints/s] |

## Idle probe (desktop: parked 2.5 s on each section, then 1.5 s traced standing still; high raster with few paints = a raster-heavy layer, many paints/s = continuous animation)

| section | idle fps | raster ms/s | paints/s | paint ms/s | style+layout ms/s | rAF JS ms/s | top repainting nodes |
|---|---|---|---|---|---|---|---|
| top | 2 | 917.9 | 6 | 6.3 | 4.8 | 5 | #document ×3; header.fixed.inset-x-0.top-0 ×2; html.geist_deef94d5-module__Sms4YG__variable.geist_mono_1bf8cbf6-module__FlyLvG__variable.newsreader_7f842e3a-module__oV ×1 |
| act-1 | 60.6 | 0 | 2.7 | 1.9 | 17.1 | 23.7 | #document ×2; img.pointer-events-none.absolute.inset-0 ×1; div.pointer-events-none.absolute.inset-0 ×1 |
| about | 60.6 | 0 | 0 | 0 | 4.1 | 20.4 |  |
| journey | 60.2 | 0 | 0 | 0 | 0.2 | 17.4 |  |
| act-2 | 60.4 | 0 | 1.3 | 0.9 | 6.4 | 23.7 | #document ×1; div.pointer-events-none.absolute ×1 |
| work | 60.2 | 0 | 0 | 0 | 0 | 18 |  |
| trading-algos | 60.6 | 0 | 0 | 0 | 0 | 15.7 |  |
| optuna-screener | 60 | 0 | 0 | 0 | 0 | 16 |  |
| experiment | 60.4 | 0 | 0 | 0 | 0 | 15.2 |  |
| systems | 59.9 | 0 | 0 | 0 | 0 | 15.5 |  |
| kill-list | 60.1 | 0 | 0 | 0 | 0 | 14.6 |  |
| films | 59.5 | 0 | 0.7 | 1 | 3.9 | 19.2 | #document ×1 |
| act-3 | 60.2 | 0 | 0.7 | 3.5 | 6.8 | 18 | #document ×1 |
| beyond | 60.5 | 0 | 0.7 | 0.6 | 1.3 | 15.3 | #document ×1 |
| writing | 60.3 | 0 | 0 | 0 | 0 | 15.5 |  |
| voices | 60.5 | 0 | 0 | 0 | 0 | 15.4 |  |
| act-4 | 60.5 | 0 | 0 | 0 | 0 | 13.7 |  |
| principles | 3.5 | 1073.1 | 3.3 | 1.5 | 7.1 | 4.1 | #document ×2; div.relative.flex.flex-col ×1; div.relative.grid.grid-cols-1 ×1 |
| contact | 0.5 | 1138.2 | 2 | 2.6 | 1.1 | 0.6 | #document ×1; div.relative.flex.flex-col ×1; div.rdr2-module__R8wI0W__campSticky ×1 |
| credits | 60.4 | 0 | 0 | 0 | 0 | 16.4 |  |

## intro — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| intro:play-screen | 55 | 20.6 | 48.5 | 50 | 116.6 | 133.3 | 56.4 | 34.5 | 133.3 | 19 | 164 | 12.9 | 0 | 410.6 | 32.3 | #document ×33; div.relative.px-gutter.pt-tier-group in #act-1 ×17 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (290 ms) |  |
| intro:flight | 68 | 12.1 | 82.8 | 83.3 | 133.3 | 216.7 | 89.7 | 86.8 | 216.7 | 58 | 134 | 4.9 | 0 | 537.4 | 3.9 | #document ×7; video ×3 | event-listener:BUTTON#intro-play.onclick @ intro.js (89 ms) |  |
| intro:reveal | 5 | 6.8 | 146.7 | 133.4 | 233.3 | 233.3 | 100 | 100 | 233.3 | 4 | 0 | 40 | 0 | 570 | 16.4 | #document ×5; div#intro ×5 |  |  |
| intro:titles | 132 | 52.1 | 19.2 | 16.7 | 16.8 | 116.7 | 2.3 | 2.3 | 183.3 | 2 | 66 | 66.7 | 0 | 21.7 | 2.8 | #document ×2; html.geist_deef94d5-module__Sms4YG__variable.geist_mono_1bf8cbf6-module__FlyLvG__variable.newsreader_7f842e3a-module__oV ×1 | user-callback:FrameRequestCallback (107 ms) |  |
| top | 90 | 58.1 | 17.2 | 16.7 | 16.7 | 66.7 | 1.1 | 1.1 | 66.7 | 1 | 27 | 100 | 0 | 4.5 | 3.2 | #document ×3; div.hero-cap__in in #top ×2 | user-callback:TimerHandler:setTimeout @ intro.js (75 ms) | 1 filter, 1 blend, 1 mask, 3 will-change, 1.2 MP of images |

### intro — marks and LoAF intro:warm → intro:titles-end

**window incomplete** (intro:warm or intro:titles-end mark missing)

intro:arm@-4.703 · intro:ready@-4.462 · intro:play@0 · intro:flight@0.083 · intro:landing@5.603 · intro:end@6.375

### intro — longest animation frames (LoAF total 7788 ms, main-thread work 807 ms, blocking 391 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 6.34 | intro:titles | 291 | 66 | 115 | 3 | 112 | user-callback:FrameRequestCallback 107 ms |  |
| 5.82 | intro:reveal | 228 | 0 | 1 | 1 | 0 | (no script) |  |
| 0.45 | intro:flight | 211 | 0 | 1 | 1 | 0 | (no script) |  |
| 5.53 | intro:flight | 209 | 82 | 130 | 130 | 0 | (no script) |  |
| -2.33 | intro:play-screen | 191 | 86 | 174 | 2 | 172 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 120 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |

### intro — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| -2.33 | intro:play-screen | 191 | 86 | 174 | 2 | 172 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 120 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| 5.53 | intro:flight | 209 | 82 | 130 | 130 | 0 | (no script) |  |
| 6.34 | intro:titles | 291 | 66 | 115 | 3 | 112 | user-callback:FrameRequestCallback 107 ms |  |
| -2.14 | intro:play-screen | 135 | 75 | 96 | 1 | 95 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 95 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| -0.02 | intro:flight | 120 | 52 | 89 | 0 | 89 | event-listener:BUTTON#intro-play.onclick @ intro.js 89 ms | `(){we()})),o.addEventListener("click",(function(){Ne("skip")})),a.addEventListener("pointe` |

### intro — layout shifts (CLS total 0, session 0, 0 shifts)


### intro — visual pops (4; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| -1.20 | 0 | intro:play-screen | 0 | 2.9 | 7 | change | 2.7 | 1 |
| 2.07 | 0 | intro:flight | 0 | 11.2 | 264.6 | change | 13.2 | 9 |
| 2.52 | 0 | intro:flight | 0 | 12.3 | 277.9 | change | 19.2 | 7 |
| 7.24 | 0 | intro:titles | 0 | 9.2 | 6.2 | change | 11.1 | 1 |

## desktop — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 10 | 18.2 | 55 | 16.7 | 266.6 | 266.6 | 20 | 20 | 266.6 | 2 | 0 | 0 | 0 | 832.7 | 34.5 | #document ×5; span.block in #act-1 ×3 |  | 1 filter, 1 blend, 1 mask, 3 will-change, 1.2 MP of images |
| act-1 | 28 | 8.4 | 119.6 | 50.1 | 533.4 | 650.1 | 50 | 50 | 650.1 | 12 | 0 | 0 | 0 | 830.8 | 16.7 | #document ×16; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×8 |  | 2 mask, 1 will-change, 0.6 MP of images |
| about | 16 | 7.2 | 138.5 | 50 | 800 | 800 | 50 | 37.5 | 800 | 7 | 0 | 0 | 0 | 852.2 | 18.9 | #document ×13; span.block in #act-1 ×6 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (18 ms) | 1 mask |
| journey | 8 | 2.9 | 350 | 266.7 | 1033.3 | 1033.3 | 100 | 100 | 1033.3 | 8 | 0 | 0 | 0 | 705.8 | 10.7 | #document ×8; span.block in #act-1 ×7 | user-callback:FrameRequestCallback @ 3ak3gv1hj96wq.js v (5 ms) | 1 mask, 0.6 MP of images |
| act-2 | 13 | 3.8 | 264.1 | 200 | 999.9 | 999.9 | 84.6 | 84.6 | 999.9 | 10 | 0 | 0 | 0 | 645.2 | 16 | #document ×12; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×6 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (15 ms) | 2 filter, 2 mask, 7 will-change, 1.8 MP of images |
| work | 10 | 4.1 | 245 | 266.7 | 533.3 | 533.3 | 80 | 60 | 533.3 | 5 | 0 | 0 | 0 | 940.9 | 12.2 | #document ×10; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×6 |  | 3 filter, 1 blend, 2 mask, 0.8 MP of images |
| trading-algos | 8 | 5 | 200 | 200 | 450 | 450 | 87.5 | 87.5 | 450 | 7 | 0 | 0 | 0 | 774.4 | 22.5 | #document ×8; span.block in #act-1 ×5 |  | 2 filter |
| optuna-screener | 24 | 6 | 167.4 | 133.3 | 416.7 | 466.6 | 79.2 | 75 | 466.6 | 17 | 32 | 5.3 | 0 | 762.4 | 12.9 | #document ×23; svg.absolute.inset-0.size-full viewBox=0 0 1000 236 in #optuna-screener ×5 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (14 ms) | 2 filter, 0.6 MP of images |
| experiment | 31 | 34.4 | 29 | 16.7 | 183.3 | 183.4 | 9.7 | 6.5 | 183.4 | 2 | 0 | 0 | 0 | 594.4 | 17.8 | #document ×10; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×4 |  |  |
| systems | 8 | 3.2 | 316.7 | 266.7 | 750 | 750 | 87.5 | 87.5 | 750 | 7 | 0 | 0 | 0 | 866.1 | 4.7 | #document ×7; div.relative.mx-auto.w-full in #systems ×1 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (6 ms) | 1 mask, 0.6 MP of images |
| kill-list | 12 | 4.8 | 206.9 | 216.7 | 883.3 | 883.3 | 66.7 | 58.3 | 883.3 | 7 | 0 | 0 | 0 | 756.7 | 12.1 | #document ×12; svg.absolute.inset-0.size-full viewBox=0 0 360 488 in #systems ×4 | event-listener:DOMWindow.onwheel @ http://localhost:3162/?skip=intro early (6 ms) | 1 mask, 0.1 MP of images |
| films | 217 | 21 | 47.5 | 16.7 | 200 | 433.4 | 18 | 16.1 | 999.9 | 34 | 0 | 0 | 0 | 554 | 36 | #document ×183; svg.pointer-events-none.absolute.inset-0 viewBox=0 0 2333 1000 in #films ×92 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (6 ms) | 2.2 MP of images |
| act-3 | 47 | 20.3 | 49.3 | 16.7 | 200 | 333.4 | 27.7 | 21.3 | 333.4 | 11 | 0 | 0 | 0 | 596.6 | 23.3 | #document ×20; span.block in #header ×8 | user-callback:FrameRequestCallback @ 3ak3gv1hj96wq.js v (5 ms) | 1 filter, 2 mask, 5 will-change, 1 MP of images |
| beyond | 26 | 5.7 | 176.3 | 150 | 566.7 | 583.3 | 69.2 | 69.2 | 583.3 | 18 | 0 | 0 | 0 | 711.5 | 11.6 | #document ×22; div.rdr2-module__R8wI0W__bandLayer in #beyond ×5 | user-callback:FrameRequestCallback @ 3ak3gv1hj96wq.js v (13 ms) | 6 filter, 2.2 MP of images |
| writing | 13 | 5.3 | 188.4 | 50 | 616.6 | 616.6 | 53.8 | 46.2 | 616.6 | 7 | 0 | 0 | 0 | 933.1 | 28.2 | #document ×14; svg.size-full.overflow-visible.will-change-transform viewBox=0 0 400 500[data-motif=journal-landscape] in #writing ×11 |  | 8 filter, 1 mask, 2 will-change |
| voices | 12 | 9.4 | 106.9 | 66.7 | 333.4 | 333.4 | 75 | 50 | 333.4 | 6 | 0 | 0 | 0 | 652.2 | 24.9 | #document ×12; div.relative.flex.flex-col in #act-4 ×6 |  | 1 mask, 1.2 MP of images |
| act-4 | 74 | 26.4 | 37.8 | 16.7 | 150 | 283.4 | 18.9 | 12.2 | 283.4 | 12 | 80 | 7.1 | 0 | 474.7 | 27.5 | #document ×30; div.block in #act-4 ×13 |  | 2 mask, 5 will-change, 1.2 MP of images |
| principles | 9 | 1.2 | 862.9 | 800 | 2649.9 | 2649.9 | 100 | 100 | 2649.9 | 9 | 0 | 0 | 0 | 1117.2 | 3.3 | #document ×8; div.rdr2-module__R8wI0W__campSticky in #voices ×6 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (7 ms) | 52 will-change |
| contact | 2 | 0.4 | 2608.2 | 2833.2 | 2833.2 | 2833.2 | 100 | 100 | 2833.2 | 2 | 0 | 0 | 0 | 639.9 | 0.6 | #document ×1; div.relative.flex.flex-col in #act-4 ×1 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (6 ms) | 4 mask, 0.5 MP of images |
| credits | 145 | 37.3 | 26.8 | 16.7 | 83.3 | 116.7 | 14.5 | 11.7 | 166.7 | 17 | 0 | 0 | 0 | 442.9 | 30.1 | #document ×57; footer#credits.relative.isolate.bg-bg in #credits ×25 |  |  |

### desktop — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 384→2093 | 37 | 9.7 | 103.6 | 33.3 | 533.4 | 650.1 | 43.2 | 650.1 | 14 | 0 | 0 |
| act-2 | 5459→7056 | 14 | 4 | 247.6 | 200 | 999.9 | 999.9 | 78.6 | 999.9 | 11 | 0 | 0 |
| act-3 | 23137→24289 | 51 | 19.2 | 52 | 16.7 | 200 | 333.4 | 23.5 | 333.4 | 13 | 0 | 0 |
| act-4 | 31478→33075 | 78 | 18.9 | 53 | 16.7 | 250 | 800 | 16.7 | 800 | 16 | 80 | 5.6 |

### desktop — longest animation frames (LoAF total 54685 ms, main-thread work 603 ms, blocking 112 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 60.24 | contact | 2841 | 0 | 13 | 7 | 6 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 6 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| 54.09 | principles | 2624 | 0 | 2 | 2 | 0 | (no script) |  |
| 57.85 | contact | 2374 | 0 | 2 | 2 | 0 | (no script) |  |
| 52.28 | principles | 1259 | 0 | 5 | 5 | 0 | (no script) |  |
| 56.72 | principles | 1127 | 0 | 8 | 1 | 7 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 7 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |

### desktop — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 5.16 | about | 790 | 0 | 26 | 3 | 23 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 7 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| 17.14 | optuna-screener | 51 | 0 | 22 | 3 | 19 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 14 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| 60.24 | contact | 2841 | 0 | 13 | 7 | 6 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 6 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| 36.4 | films | 174 | 0 | 9 | 3 | 6 | user-callback:FrameRequestCallback @ 3ak3gv1hj96wq.js v 6 ms | `()=>{let s=i.MotionGlobalConfig.useManualTiming,o=s?a.timestamp:performance.now();n=!1,s\|\|` |
| 39.02 | beyond | 69 | 0 | 9 | 2 | 7 | user-callback:FrameRequestCallback @ 3ak3gv1hj96wq.js v 7 ms | `()=>{let s=i.MotionGlobalConfig.useManualTiming,o=s?a.timestamp:performance.now();n=!1,s\|\|` |

### desktop — layout shifts (CLS total 0, session 0, 2 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 43.88 | 0 | writing | span.pointer-events-none.absolute.bottom-[0.18em] in #writing |
| 43.9 | 0 | writing | span.pointer-events-none.absolute.bottom-[0.18em] in #writing |

### desktop — visual pops (19; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 2.35 | 500 | act-1 | 0 | 9.7 | 4 | fill-in | 19.5 | 1 |
| 11.65 | 6100 | act-2 | 0 | 14 | 9 | change | 19.7 | 1 |
| 11.97 | 6100 | act-2 | 0 | 28.2 | 18 | change | 39.5 | 1 |
| 12.69 | 6300 | work | 0 | 11.7 | 4.6 | change | 22.9 | 1 |
| 16.65 | 9300 | optuna-screener | 0 | 4.6 | 11.4 | change | 9.2 | 1 |
| 28.63 | 19900 | films | 0 | 15.8 | 5.3 | fill-in | 8.7 | 1 |
| 35.67 | 22100 | films | 0 | 3.8 | 15.1 | change | 5.2 | 1 |
| 36.28 | 22200 | films | 0 | 2.7 | 7.7 | change | 4.3 | 1 |
| 38.67 | 23300 | act-3 | 0 | 10.3 | 31.4 | change | 17.8 | 1 |
| 39.01 | 23600 | beyond | 0 | 2.8 | 8.7 | change | 1.2 | 1 |
| 44.13 | 27500 | writing | 0 | 42.6 | 20.7 | change | 22.2 | 1 |
| 44.79 | 27600 | writing | 0 | 6.5 | 3 | change | 4.5 | 1 |
| 46.19 | 29200 | voices | 0 | 161.3 | 78.3 | blank-out | 78.8 | 1 |
| 46.96 | 29900 | voices | 0 | 3.1 | 4.4 | change | 7.4 | 1 |
| 47.22 | 30400 | voices | 0 | 13 | 5.9 | change | 28.8 | 1 |
| 52.30 | 32600 | principles | 0 | 17.2 | 12.8 | change | 9.4 | 1 |
| 53.51 | 32900 | principles | 0 | 4.2 | 3.2 | change | 2.8 | 1 |
| 59.60 | 33700 | contact | 0 | 67.2 | 23.1 | fill-in | 35.1 | 1 |
| 62.47 | 34500 | contact | 0 | 65.5 | 15.4 | change | 35.8 | 1 |

## Strips

- strips/intro.png
- strips/intro-landing.png
- strips/pop-intro-47.png
- strips/pop-intro-42.png
- strips/pop-intro-94.png
- strips/desktop-act-1.png
- strips/desktop-act-2.png
- strips/desktop-act-3.png
- strips/desktop-act-4.png
- strips/desktop-first-60s.png
- strips/pop-desktop-366.png
- strips/pop-desktop-297.png
- strips/pop-desktop-65.png
- strips/pop-desktop-308.png
