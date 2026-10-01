# Motion baseline — 2026-10-01T13:30:41.635Z

Base http://localhost:3161 · Chromium 141.0.7390.37 headless · 4 CPUs · screencast everyNthFrame=1.

> Headless Chromium rasterises in software (SwiftShader) on a few CPUs and pays for the screencast readback, so absolute frame times are pessimistic vs a real laptop/phone GPU. Read them as RELATIVE hotspots: which sections and transitions are worst. "busy∩jank %" = share of >33.4 ms frames that overlap a long animation frame in which the main thread really worked (script + style/layout/paint >= half the frame, or a >50 ms task); low = the frame was raster/composite-bound (the LoAF is the main thread waiting on the compositor), high = main-thread script/style/layout. "paint suspects" = what the section holds that is costly to raster (filters, blend, masks, canvas, video, image megapixels, infinite animations).

## Runs

| run | viewport | lenis | secs | rAF frames | fps | mean ms | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | LoAF block ms | busy∩jank % | CLS total | CLS (session) | pops | shots |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| intro | 1024x768 |  | 13.8 | 184 | 13.3 | 75.1 | 66.6 | 166.6 | 233.4 | 62 | 52.7 | 1883.2 | 130 | 2764 | 14 | 0 | 0 | 8 | 114 |
| desktop | 1024x768 | on | 77.6 | 1226 | 15.8 | 63.3 | 16.7 | 216.6 | 466.6 | 31.7 | 28 | 2516.5 | 344 | 2621 | 10 | 0.0024 | 0.0013 | 0 | 523 |
| native | 1024x768 | off | 66 | 882 | 13.4 | 74.9 | 16.7 | 283.3 | 566.6 | 35 | 30.7 | 3683.2 | 278 | 355 | 2.3 | 0.0042 | 0.0018 | 24 | 580 |
| rm | 1024x768 | off | 58.6 | 2712 | 46.3 | 21.6 | 16.7 | 16.8 | 66.7 | 1.2 | 1.1 | 3483.2 | 33 | 628 | 18.8 | 0.1157 | 0.1157 | 2 | 410 |

## Top 10 hotspots (by mean frame time; rm excluded)

| # | run | where | frames | fps | mean | p95 | p99 | >50 % | max | mean / run mean | LoAF block ms | likely cause |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | desktop | principles | 14 | 1.8 | 566.7 | 2066.6 | 2066.6 | 85.7 | 2066.6 | 9 | 629 | raster/composite-bound: only 33.3% of janky frames overlap real main-thread work; the LoAFs are 94.5% waiting for the compositor — on screen: 5 will-change [while scrolling: raster 1102.8 ms/s, 6.6 paints/s — repainting: #document ×14; div.relative.flex.flex-col in #act-4 ×14 \| idle 60.6 fps, raster 32.7 ms/s, 0 paints/s] |
| 2 | native | contact | 5 | 1.9 | 533.3 | 1850 | 1850 | 60 | 1850 | 7.1 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.7% waiting for the compositor — on screen: 4 mask, 0.5 MP of images [while scrolling: raster 1047.8 ms/s, 8.3 paints/s — repainting: #document ×5; div.relative.grid.grid-cols-1 in #principles ×2 \| idle 60.3 fps, raster 0 ms/s, 0 paints/s] |
| 3 | native | principles | 14 | 2 | 497.6 | 3683.2 | 3683.2 | 71.4 | 3683.2 | 6.6 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.7% waiting for the compositor — on screen: 5 will-change [while scrolling: raster 896.6 ms/s, 7.6 paints/s — repainting: #document ×14; div.relative.flex.flex-col in #act-4 ×7 \| idle 60.6 fps, raster 32.7 ms/s, 0 paints/s] |
| 4 | native | journey | 7 | 2.5 | 400 | 899.9 | 899.9 | 100 | 899.9 | 5.3 | 118 | raster/composite-bound: only 28.6% of janky frames overlap real main-thread work; the LoAFs are 93.1% waiting for the compositor — on screen: 1 mask, 1 will-change, 0.6 MP of images [while scrolling: raster 563.2 ms/s, 22.9 paints/s — repainting: #document ×7; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×6 \| idle 60.1 fps, raster 0 ms/s, 0 paints/s] |
| 5 | intro | intro:hold | 7 | 3.2 | 314.3 | 1883.2 | 1883.2 | 42.9 | 1883.2 | 4.2 | 1919 | main thread, script-bound (88.2% script; top: event-listener:VIDEO.onended @ intro.js 1732 ms) [while scrolling: raster 33.6 ms/s, 7.3 paints/s — repainting: #document ×3; div.origin-right.will-change-transform in #principles ×2] |
| 6 | desktop | about | 7 | 3.9 | 257.1 | 433.3 | 433.3 | 100 | 433.3 | 4.1 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 97.5% waiting for the compositor — on screen: 1 mask [while scrolling: raster 891.2 ms/s, 18.9 paints/s — repainting: #document ×7; main#main.relative.z-(--z-main).flex-1 ×7 \| idle 60.3 fps, raster 0 ms/s, 0 paints/s] |
| 7 | native | about | 9 | 4.4 | 229.6 | 433.3 | 433.3 | 100 | 433.3 | 3.1 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 96.3% waiting for the compositor — on screen: 1 mask [while scrolling: raster 819.2 ms/s, 20.3 paints/s — repainting: #document ×9; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×5 \| idle 60.3 fps, raster 0 ms/s, 0 paints/s] |
| 8 | desktop | journey | 12 | 4.6 | 219.4 | 566.7 | 566.7 | 91.7 | 566.7 | 3.5 | 92 | raster/composite-bound: only 16.7% of janky frames overlap real main-thread work; the LoAFs are 91.5% waiting for the compositor — on screen: 1 mask, 1 will-change, 0.6 MP of images [while scrolling: raster 832 ms/s, 36.8 paints/s — repainting: #document ×12; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×12 \| idle 60.1 fps, raster 0 ms/s, 0 paints/s] |
| 9 | desktop | beyond | 30 | 6.2 | 162.2 | 333.3 | 383.3 | 93.3 | 383.3 | 2.6 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.2% waiting for the compositor — on screen: 6 mask, 2.3 MP of images [while scrolling: raster 857.1 ms/s, 19.1 paints/s — repainting: #document ×28; div.stage-window in #beyond ×22 \| idle 60.5 fps, raster 0 ms/s, 0 paints/s] |
| 10 | desktop | trading-algos | 14 | 6.9 | 145.2 | 299.9 | 299.9 | 78.6 | 299.9 | 2.3 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 98.1% waiting for the compositor — on screen: 2 filter, 0.1 MP of images [while scrolling: raster 862.6 ms/s, 36.9 paints/s — repainting: #document ×14; div.relative.sm:overflow-hidden.sm:rounded-frame in #work ×14 \| idle 60.5 fps, raster 0 ms/s, 0 paints/s] |

## Idle probe (desktop: parked 2.5 s on each section, then 1.5 s traced standing still; high raster with few paints = a raster-heavy layer, many paints/s = continuous animation)

| section | idle fps | raster ms/s | paints/s | paint ms/s | style+layout ms/s | rAF JS ms/s | top repainting nodes |
|---|---|---|---|---|---|---|---|
| top | 60.7 | 0 | 0 | 0 | 3.4 | 21.5 |  |
| act-1 | 60.3 | 0 | 0 | 0 | 0 | 23 |  |
| about | 60.3 | 0 | 0 | 0 | 3.9 | 25.6 |  |
| journey | 60.1 | 0 | 0 | 0 | 0 | 21.1 |  |
| act-2 | 60 | 0 | 0 | 0 | 0 | 24.8 |  |
| work | 60.4 | 0 | 0 | 0 | 0 | 19.1 |  |
| trading-algos | 60.5 | 0 | 0 | 0 | 0 | 18.1 |  |
| optuna-screener | 60.5 | 0 | 0 | 0 | 0 | 19.2 |  |
| experiment | 60.5 | 0 | 0 | 0 | 0 | 21.9 |  |
| systems | 60.3 | 0 | 0 | 0 | 0 | 19.8 |  |
| kill-list | 60.1 | 0 | 0 | 0 | 0 | 21.1 |  |
| films | 60.2 | 0 | 0 | 0 | 0 | 21.3 |  |
| act-3 | 60.1 | 0 | 0 | 0 | 0 | 21.6 |  |
| beyond | 60.5 | 0 | 0 | 0 | 0 | 19.8 |  |
| writing | 60.5 | 0 | 0 | 0 | 0 | 22.1 |  |
| voices | 60.3 | 0 | 0 | 0 | 0 | 29.1 |  |
| act-4 | 60 | 0 | 0 | 0 | 0 | 21.8 |  |
| principles | 60.6 | 32.7 | 0 | 0 | 0 | 21.4 |  |
| contact | 60.3 | 0 | 0 | 0 | 0 | 23.3 |  |
| credits | 60.1 | 0 | 0 | 0 | 0 | 19.5 |  |

## intro — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| intro:play-screen | 50 | 18.2 | 55 | 50 | 133.3 | 150 | 60 | 46 | 150 | 24 | 201 | 16.7 | 0 | 443.7 | 37.8 | #document ×36; div.relative.px-gutter.pt-tier-group in #act-1 ×22 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (332 ms) |  |
| intro:flight | 78 | 12.4 | 80.6 | 83.3 | 166.7 | 233.4 | 75.6 | 70.5 | 233.4 | 56 | 240 | 6.8 | 0 | 372.3 | 5.6 | #document ×9; video ×5 | user-callback:FrameRequestCallback (181 ms) |  |
| intro:hold | 7 | 3.2 | 314.3 | 16.8 | 1883.2 | 1883.2 | 42.9 | 42.9 | 1883.2 | 3 | 1919 | 100 | 0 | 33.6 | 7.3 | #document ×3; div.origin-right.will-change-transform in #principles ×2 | event-listener:VIDEO.onended @ intro.js (1732 ms) |  |
| intro:reveal | 7 | 10 | 100 | 100 | 166.7 | 166.7 | 85.7 | 71.4 | 166.7 | 6 | 0 | 16.7 | 0 | 51.4 | 12.9 | #document ×3; div.absolute.inset-0.will-change-transform in #top ×1 |  |  |
| intro:titles | 71 | 21.7 | 46 | 33.3 | 116.7 | 166.6 | 45.1 | 32.4 | 166.6 | 28 | 90 | 6.3 | 0 | 6.7 | 3.1 | #document ×2; div.origin-right.will-change-transform in #principles ×1 | user-callback:FrameRequestCallback (130 ms) |  |
| top | 21 | 15.4 | 65.1 | 66.6 | 166.7 | 200 | 66.7 | 52.4 | 200 | 13 | 314 | 42.9 | 0 | 145.6 | 25.6 | #document ×8; div.origin-right.will-change-transform in #principles ×4 | user-callback:FrameRequestCallback (201 ms) | 1 video, 1 filter, 1 blend, 1 mask, 5 will-change, 1.2 MP of images |

### intro — marks and LoAF intro:warm → intro:titles-end

warm t=5.1s → titles-end t=12.427s: 50 LoAF, **50 > 50 ms** (max 2000 ms, blocking 2239 ms)

intro:arm@-4.751 · intro:ready@-4.49 · intro:play@0 · intro:flight@0.263 · intro:warm@5.1 · intro:hold@6.378 · intro:reveal@8.449 · intro:landing@8.449 · intro:titles@9.222 · intro:end@9.226 · intro:titles-end@12.427

### intro — longest animation frames (LoAF total 14242 ms, main-thread work 3478 ms, blocking 2764 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 6.25 | intro:hold | 2000 | 1820 | 1870 | 2 | 1868 | event-listener:VIDEO.onended @ intro.js 1732 ms | `(){Y===t&&xn()})),t.addEventListener("error",(function(){Y===t&&(V?xn():Ln())}),!0);try{r=` |
| 4.98 | intro:flight | 307 | 136 | 183 | 2 | 181 | user-callback:FrameRequestCallback 181 ms |  |
| 9.16 | intro:titles | 246 | 90 | 138 | 2 | 136 | user-callback:FrameRequestCallback 130 ms |  |
| -2.52 | intro:play-screen | 223 | 105 | 183 | 2 | 181 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 125 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| 12.42 | top | 209 | 94 | 142 | 1 | 141 | user-callback:FrameRequestCallback 136 ms |  |

### intro — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 6.25 | intro:hold | 2000 | 1820 | 1870 | 2 | 1868 | event-listener:VIDEO.onended @ intro.js 1732 ms | `(){Y===t&&xn()})),t.addEventListener("error",(function(){Y===t&&(V?xn():Ln())}),!0);try{r=` |
| -2.52 | intro:play-screen | 223 | 105 | 183 | 2 | 181 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 125 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| 4.98 | intro:flight | 307 | 136 | 183 | 2 | 181 | user-callback:FrameRequestCallback 181 ms |  |
| -0.03 | intro:flight | 177 | 104 | 142 | 1 | 141 | event-listener:BUTTON#intro-play.onclick @ intro.js 141 ms | `(){Je()})),l.addEventListener("click",(function(){Wn("skip")})),c&&c.addEventListener("cli` |
| 12.42 | top | 209 | 94 | 142 | 1 | 141 | user-callback:FrameRequestCallback 136 ms |  |

### intro — layout shifts (CLS total 0, session 0, 0 shifts)


### intro — visual pops (8; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| -1.62 | 0 | intro:play-screen | 0 | 6.4 | 284.7 | fill-in | 6.7 | 1 |
| 1.75 | 0 | intro:flight | 0 | 2.5 | 56.5 | change | 3.5 | 2 |
| 2.57 | 0 | intro:flight | 0 | 12.1 | 183.4 | change | 16.6 | 6 |
| 3.03 | 0 | intro:flight | 0 | 12.3 | 172.1 | change | 19.3 | 4 |
| 3.70 | 0 | intro:flight | 0 | 17.2 | 82 | change | 38.8 | 3 |
| 4.01 | 0 | intro:flight | 0 | 17.1 | 7.3 | change | 36.5 | 2 |
| 4.21 | 0 | intro:flight | 0 | 16.3 | 6.6 | change | 38.3 | 1 |
| 10.34 | 0 | intro:titles | 0 | 10.1 | 6.9 | change | 9.3 | 1 |

## desktop — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 9 | 6.9 | 144.4 | 33.4 | 600 | 600 | 44.4 | 44.4 | 600 | 4 | 68 | 50 | 0 | 221.6 | 14.6 | #document ×5; main#main.relative.z-(--z-main).flex-1 ×4 | user-callback:FrameRequestCallback (112 ms) | 1 filter, 1 blend, 1 mask, 5 will-change, 1.2 MP of images |
| act-1 | 90 | 22.3 | 44.8 | 16.7 | 200 | 433.3 | 15.6 | 14.4 | 433.3 | 13 | 151 | 21.4 | 0 | 441.1 | 16.4 | #document ×20; main#main.relative.z-(--z-main).flex-1 ×16 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t (126 ms) | 2 mask, 1 will-change, 0.6 MP of images |
| about | 7 | 3.9 | 257.1 | 200.1 | 433.3 | 433.3 | 100 | 100 | 433.3 | 7 | 0 | 0 | 0 | 891.2 | 18.9 | #document ×7; main#main.relative.z-(--z-main).flex-1 ×7 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (28 ms) | 1 mask |
| journey | 12 | 4.6 | 219.4 | 200 | 566.7 | 566.7 | 100 | 91.7 | 566.7 | 11 | 92 | 16.7 | 0 | 832 | 36.8 | #document ×12; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×12 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js (138 ms) | 1 mask, 1 will-change, 0.6 MP of images |
| act-2 | 87 | 23.6 | 42.3 | 16.7 | 149.9 | 483.4 | 17.2 | 16.1 | 483.4 | 14 | 114 | 20 | 0 | 550.3 | 24.7 | #document ×15; main#main.relative.z-(--z-main).flex-1 ×11 | user-callback:FrameRequestCallback (100 ms) | 2 filter, 2 mask, 8 will-change, 1.8 MP of images |
| work | 31 | 9.9 | 100.5 | 50 | 466.6 | 500 | 54.8 | 41.9 | 500 | 14 | 0 | 0 | 0 | 774.9 | 24.7 | #document ×13; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×10 | user-callback:FrameRequestCallback @ 3tsl4njztm8lt.js v (11 ms) | 3 filter, 1 blend, 2 mask, 2 will-change, 0.8 MP of images |
| trading-algos | 14 | 6.9 | 145.2 | 166.8 | 299.9 | 299.9 | 85.7 | 78.6 | 299.9 | 10 | 0 | 0 | 0 | 862.6 | 36.9 | #document ×14; div.relative.sm:overflow-hidden.sm:rounded-frame in #work ×14 | user-callback:FrameRequestCallback @ 3tsl4njztm8lt.js v (19 ms) | 2 filter, 0.1 MP of images |
| optuna-screener | 64 | 12 | 83.3 | 66.7 | 216.7 | 350 | 73.4 | 62.5 | 350 | 39 | 0 | 0 | 0 | 791.1 | 25.3 | #document ×34; div.stage-window in #trading-algos ×25 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (27 ms) | 2 filter, 0.7 MP of images |
| experiment | 16 | 15.2 | 65.6 | 83.2 | 100 | 100 | 75 | 62.5 | 100 | 11 | 0 | 0 | 0 | 857.2 | 39.1 | #document ×11; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×8 | user-callback:FrameRequestCallback @ 3tsl4njztm8lt.js v (6 ms) |  |
| systems | 17 | 7.5 | 133.3 | 133.4 | 233.4 | 233.4 | 94.1 | 94.1 | 233.4 | 15 | 0 | 0 | 0 | 833 | 32.2 | #document ×16; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×15 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (6 ms) | 1 mask, 1 will-change, 0.6 MP of images |
| kill-list | 19 | 7.9 | 127.2 | 133.2 | 300 | 300 | 84.2 | 84.2 | 300 | 15 | 0 | 0 | 0 | 861.2 | 32.7 | #document ×18; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×17 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (8 ms) | 1 mask, 3 will-change, 0.1 MP of images |
| films | 431 | 29.9 | 33.5 | 16.7 | 133.3 | 216.6 | 17.6 | 13.9 | 366.6 | 60 | 775 | 19.7 | 0 | 460.9 | 41.6 | #document ×223; svg.pointer-events-none.absolute.inset-0 viewBox=0 0 1778 1000 in #films ×73 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t (420 ms) | 4 will-change, 2.2 MP of images |
| act-3 | 120 | 33 | 30.3 | 16.7 | 133.3 | 200.1 | 13.3 | 12.5 | 299.9 | 15 | 166 | 12.5 | 0 | 471.2 | 17.3 | #document ×25; div.rdr2-module__R8wI0W__bandLayer in #beyond ×12 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t (136 ms) | 1 filter, 2 mask, 6 will-change, 1 MP of images |
| beyond | 30 | 6.2 | 162.2 | 133.4 | 333.3 | 383.3 | 93.3 | 93.3 | 383.3 | 28 | 0 | 0 | 0.0013 | 857.1 | 19.1 | #document ×28; div.stage-window in #beyond ×22 | user-callback:FrameRequestCallback @ 3tsl4njztm8lt.js v (11 ms) | 6 mask, 2.3 MP of images |
| writing | 25 | 9.6 | 104.7 | 100 | 166.7 | 216.7 | 96 | 92 | 216.7 | 23 | 0 | 0 | 0.0003 | 796.9 | 47.8 | #document ×25; div.relative.flex.flex-col in #act-4 ×24 | user-callback:FrameRequestCallback @ 21-_nxqm8ngj-.js (10 ms) | 4 mask, 3 will-change |
| voices | 27 | 15.3 | 65.4 | 50 | 183.4 | 200 | 51.9 | 40.7 | 200 | 13 | 0 | 0 | 0 | 763.6 | 46.4 | #document ×26; div.relative.flex.flex-col in #act-4 ×23 | user-callback:FrameRequestCallback @ 21-_nxqm8ngj-.js (6 ms) | 2 will-change, 1.2 MP of images |
| act-4 | 132 | 35.7 | 28 | 16.7 | 100 | 216.6 | 10.6 | 8.3 | 233.3 | 11 | 163 | 14.3 | 0 | 279.5 | 26.8 | #document ×27; div.rdr2-module__R8wI0W__campSticky in #voices ×24 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t (153 ms) | 2 mask, 5 will-change, 1.2 MP of images |
| principles | 14 | 1.8 | 566.7 | 450 | 2066.6 | 2066.6 | 85.7 | 85.7 | 2066.6 | 12 | 629 | 33.3 | 0.0008 | 1102.8 | 6.6 | #document ×14; div.relative.flex.flex-col in #act-4 ×14 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t (410 ms) | 5 will-change |
| contact | 2 | 0.5 | 1908.2 | 2516.5 | 2516.5 | 2516.5 | 100 | 100 | 2516.5 | 2 | 317 | 100 | 0 | 806.8 | 1.8 | #document ×2; div.relative.flex.flex-col in #act-4 ×2 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t (171 ms) | 4 mask, 0.5 MP of images |
| credits | 79 | 15.3 | 65.2 | 16.8 | 216.6 | 983.3 | 39.2 | 32.9 | 983.3 | 27 | 146 | 12.9 | 0 | 522 | 10.1 | #document ×25; footer#credits.relative.isolate.z-(--z-main) in #credits ×12 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t (113 ms) |  |

### desktop — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 384→2093 | 93 | 19.2 | 52 | 16.7 | 216.7 | 433.3 | 17.2 | 433.3 | 17 | 151 | 17.6 |
| act-2 | 5614→7211 | 105 | 25 | 40 | 16.7 | 116.8 | 450 | 15.2 | 483.4 | 18 | 114 | 15.8 |
| act-3 | 25691→26843 | 123 | 30 | 33.3 | 16.7 | 133.3 | 200.1 | 14.6 | 299.9 | 18 | 166 | 10.5 |
| act-4 | 34757→36354 | 137 | 30.1 | 33.2 | 16.7 | 166.7 | 233.3 | 10.2 | 450 | 15 | 163 | 11.8 |

### desktop — longest animation frames (LoAF total 58427 ms, main-thread work 3597 ms, blocking 2621 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 68.83 | contact | 2404 | 138 | 92 | 1 | 91 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t 91 ms | `(e){var r,i,n,o,y=f()-d,T=!0===e;if((y>c\|\|y<0)&&(_+=y-p),d+=y,((r=(n=d-_)-g)>0\|\|T)&&(o=++u` |
| 63.37 | principles | 2134 | 38 | 81 | 1 | 80 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t 80 ms | `(e){var r,i,n,o,y=f()-d,T=!0===e;if((y>c\|\|y<0)&&(_+=y-p),d+=y,((r=(n=d-_)-g)>0\|\|T)&&(o=++u` |
| 71.24 | contact | 1423 | 179 | 87 | 1 | 86 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t 80 ms | `(e){var r,i,n,o,y=f()-d,T=!0===e;if((y>c\|\|y<0)&&(_+=y-p),d+=y,((r=(n=d-_)-g)>0\|\|T)&&(o=++u` |
| 65.51 | principles | 1257 | 234 | 132 | 2 | 130 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t 119 ms | `(e){var r,i,n,o,y=f()-d,T=!0===e;if((y>c\|\|y<0)&&(_+=y-p),d+=y,((r=(n=d-_)-g)>0\|\|T)&&(o=++u` |
| 67.78 | principles | 1038 | 168 | 90 | 2 | 88 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t 88 ms | `(e){var r,i,n,o,y=f()-d,T=!0===e;if((y>c\|\|y<0)&&(_+=y-p),d+=y,((r=(n=d-_)-g)>0\|\|T)&&(o=++u` |

### desktop — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 58.41 | act-4 | 167 | 107 | 155 | 2 | 153 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t 153 ms | `(e){var r,i,n,o,y=f()-d,T=!0===e;if((y>c\|\|y<0)&&(_+=y-p),d+=y,((r=(n=d-_)-g)>0\|\|T)&&(o=++u` |
| 36.22 | films | 157 | 92 | 140 | 1 | 139 | user-callback:FrameRequestCallback 139 ms |  |
| 8.38 | journey | 151 | 92 | 139 | 1 | 138 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js 138 ms | `i=>{for(let r of i){if(!r.isIntersecting)continue;let i=t.get(r.target);if(!(!i\|\|e.has(i))` |
| 30.67 | films | 317 | 185 | 138 | 1 | 137 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js 137 ms | `i=>{for(let r of i){if(!r.isIntersecting)continue;let i=t.get(r.target);if(!(!i\|\|e.has(i))` |
| 45.72 | act-3 | 153 | 90 | 138 | 2 | 136 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t 136 ms | `(e){var r,i,n,o,y=f()-d,T=!0===e;if((y>c\|\|y<0)&&(_+=y-p),d+=y,((r=(n=d-_)-g)>0\|\|T)&&(o=++u` |

### desktop — layout shifts (CLS total 0.0024, session 0.0013, 6 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 51.54 | 0.0013 | beyond | span.whitespace-nowrap in #beyond ; span.scene-caption__sep in #beyond ; span.scene-caption__film.world-face-rdr2 in #beyond |
| 61.54 | 0.0008 | principles | p.world-face-hp.text-center.text-[1rem][data-lettered=hp] in #principles ; span.scene-caption__film.world-face-hp in #principles ; p.scene-caption[data-caption=cap.principles][data-caption-world=hp] in #principles |
| 53.68 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 53.97 | 0.0001 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 26.56 | 0 | systems | h3.type-heading.text-fg.lg:text-[length:var(--text-lead)] in #systems |
| 55.1 | 0 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |

### desktop — visual pops (0; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)


## native — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 7 | 14 | 71.4 | 16.7 | 350 | 350 | 28.6 | 28.6 | 350 | 1 | 0 | 0 | 0 | 876.2 | 36 | #document ×7; div.relative.px-gutter.pt-tier-group in #act-1 ×4 |  | 1 filter, 1 blend, 1 mask, 5 will-change, 1.2 MP of images |
| act-1 | 29 | 8.4 | 118.4 | 83.3 | 483.3 | 566.6 | 69 | 69 | 566.6 | 19 | 0 | 0 | 0 | 535.9 | 18.6 | #document ×20; div.relative.px-gutter.pt-tier-group in #act-1 ×12 |  | 2 mask, 1 will-change, 0.6 MP of images |
| about | 9 | 4.4 | 229.6 | 283.3 | 433.3 | 433.3 | 100 | 100 | 433.3 | 9 | 0 | 0 | 0 | 819.2 | 20.3 | #document ×9; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×5 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (26 ms) | 1 mask |
| journey | 7 | 2.5 | 400 | 283.3 | 899.9 | 899.9 | 100 | 100 | 899.9 | 7 | 118 | 28.6 | 0 | 563.2 | 22.9 | #document ×7; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×6 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js (132 ms) | 1 mask, 1 will-change, 0.6 MP of images |
| act-2 | 24 | 10.1 | 99.3 | 83.3 | 283.2 | 450 | 54.2 | 50 | 450 | 13 | 0 | 0 | 0 | 669.3 | 35.7 | #document ×19; div.pointer-events-none.absolute.origin-top-left in #act-2 ×10 | user-callback:FrameRequestCallback @ 3tsl4njztm8lt.js v (6 ms) | 2 filter, 2 mask, 8 will-change, 1.8 MP of images |
| work | 21 | 8.9 | 112.7 | 83.3 | 266.6 | 383.3 | 52.4 | 52.4 | 383.3 | 11 | 0 | 0 | 0 | 582.7 | 24.9 | #document ×12; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×7 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (5 ms) | 3 filter, 1 blend, 2 mask, 2 will-change, 0.8 MP of images |
| trading-algos | 19 | 7 | 143 | 116.6 | 433.4 | 433.4 | 68.4 | 68.4 | 433.4 | 12 | 0 | 0 | 0.0018 | 641.6 | 23.9 | #document ×15; div.stage-window in #optuna-screener ×10 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (7 ms) | 2 filter, 0.1 MP of images |
| optuna-screener | 115 | 21.8 | 45.9 | 16.7 | 283.3 | 366.6 | 19.1 | 17.4 | 416.6 | 21 | 0 | 0 | 0 | 434.4 | 23.1 | #document ×32; div.stage-window in #trading-algos ×16 | user-callback:FrameRequestCallback @ 3tsl4njztm8lt.js v (20 ms) | 2 filter, 0.7 MP of images |
| experiment | 63 | 52.5 | 19 | 16.7 | 16.8 | 133.4 | 1.6 | 1.6 | 133.4 | 1 | 0 | 0 | 0 | 141.7 | 62.5 | #document ×30; div.relative.mx-auto.w-full in #experiment ×14 |  |  |
| systems | 19 | 7.8 | 128.1 | 83.3 | 433.3 | 433.3 | 73.7 | 73.7 | 433.3 | 14 | 0 | 0 | 0 | 666.6 | 26.7 | #document ×18; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×10 | user-callback:FrameRequestCallback @ 21-_nxqm8ngj-.js (6 ms) | 1 mask, 1 will-change, 0.6 MP of images |
| kill-list | 17 | 8.7 | 114.7 | 116.6 | 266.6 | 266.6 | 70.6 | 64.7 | 266.6 | 10 | 0 | 0 | 0 | 780 | 36.9 | #document ×17; div.relative.@container.will-change-[transform,opacity] in #header ×12 |  | 1 mask, 3 will-change, 0.1 MP of images |
| films | 211 | 20 | 49.9 | 16.7 | 166.7 | 366.7 | 31.8 | 23.7 | 716.7 | 54 | 237 | 7.5 | 0 | 516.7 | 39 | #document ×155; svg.pointer-events-none.absolute.inset-0 viewBox=0 0 1778 1000 in #films ×56 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js (242 ms) | 4 will-change, 2.2 MP of images |
| act-3 | 78 | 31.4 | 31.8 | 16.7 | 116.6 | 483.4 | 10.3 | 9 | 483.4 | 8 | 0 | 0 | 0 | 475.6 | 30.2 | #document ×31; span.block in #header ×12 |  | 1 filter, 2 mask, 6 will-change, 1 MP of images |
| beyond | 63 | 12.7 | 78.6 | 16.7 | 283.4 | 433.4 | 42.9 | 34.9 | 433.4 | 23 | 0 | 0 | 0.0013 | 592.1 | 22.8 | #document ×42; div.stage-window in #beyond ×15 | user-callback:FrameRequestCallback @ 3tsl4njztm8lt.js v (6 ms) | 6 mask, 2.3 MP of images |
| writing | 26 | 9.3 | 107.1 | 100 | 249.9 | 283.4 | 76.9 | 73.1 | 283.4 | 18 | 0 | 0 | 0.0003 | 656.1 | 47.1 | #document ×25; svg.size-full.overflow-visible.will-change-transform viewBox=0 0 400 500[data-motif=journal-landscape] in #writing ×23 | user-callback:FrameRequestCallback @ 21-_nxqm8ngj-.js (6 ms) | 4 mask, 3 will-change |
| voices | 15 | 8 | 125.5 | 83.4 | 383.4 | 383.4 | 73.3 | 66.7 | 383.4 | 10 | 0 | 0 | 0 | 546.9 | 25.5 | #document ×15; div.relative.flex.flex-col in #act-4 ×9 |  | 2 will-change, 1.2 MP of images |
| act-4 | 80 | 32.4 | 30.8 | 16.7 | 83.3 | 449.9 | 8.8 | 6.3 | 449.9 | 5 | 0 | 0 | 0 | 341 | 37.7 | #document ×39; div.block in #act-4 ×15 |  | 2 mask, 5 will-change, 1.2 MP of images |
| principles | 14 | 2 | 497.6 | 183.3 | 3683.2 | 3683.2 | 78.6 | 71.4 | 3683.2 | 10 | 0 | 0 | 0.0008 | 896.6 | 7.6 | #document ×14; div.relative.flex.flex-col in #act-4 ×7 |  | 5 will-change |
| contact | 5 | 1.9 | 533.3 | 283.3 | 1850 | 1850 | 60 | 60 | 1850 | 3 | 0 | 0 | 0 | 1047.8 | 8.3 | #document ×5; div.relative.grid.grid-cols-1 in #principles ×2 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (5 ms) | 4 mask, 0.5 MP of images |
| credits | 60 | 14.3 | 69.7 | 50 | 283.3 | 599.9 | 51.7 | 41.7 | 599.9 | 29 | 0 | 0 | 0 | 599.5 | 15.5 | #document ×31; footer#credits.relative.isolate.z-(--z-main) in #credits ×25 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (12 ms) |  |

### native — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 384→2093 | 32 | 8.2 | 122.4 | 83.3 | 483.3 | 566.6 | 71.9 | 566.6 | 22 | 0 | 0 |
| act-2 | 5614→7211 | 36 | 12.4 | 80.6 | 33.4 | 283.2 | 450 | 41.7 | 450 | 17 | 0 | 0 |
| act-3 | 25691→26843 | 102 | 35 | 28.6 | 16.7 | 66.7 | 216.6 | 6.9 | 483.4 | 10 | 0 | 0 |
| act-4 | 34757→36354 | 86 | 27 | 37 | 16.7 | 100 | 449.9 | 10.5 | 449.9 | 10 | 0 | 0 |

### native — longest animation frames (LoAF total 51282 ms, main-thread work 1082 ms, blocking 355 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 55.51 | principles | 3667 | 0 | 3 | 3 | 0 | (no script) |  |
| 59.53 | contact | 1861 | 0 | 1 | 1 | 0 | (no script) |  |
| 53.32 | principles | 1165 | 0 | 1 | 1 | 0 | (no script) |  |
| 6.03 | journey | 909 | 0 | 25 | 2 | 23 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 8 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| 54.7 | principles | 799 | 0 | 1 | 1 | 0 | (no script) |  |

### native — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 28.46 | films | 148 | 97 | 138 | 2 | 136 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js 136 ms | `i=>{for(let r of i){if(!r.isIntersecting)continue;let i=t.get(r.target);if(!(!i\|\|e.has(i))` |
| 7.38 | journey | 426 | 118 | 135 | 3 | 132 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js 132 ms | `i=>{for(let r of i){if(!r.isIntersecting)continue;let i=t.get(r.target);if(!(!i\|\|e.has(i))` |
| 30.69 | films | 122 | 61 | 109 | 3 | 106 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js 106 ms | `i=>{for(let r of i){if(!r.isIntersecting)continue;let i=t.get(r.target);if(!(!i\|\|e.has(i))` |
| 30.82 | films | 116 | 34 | 57 | 1 | 56 | user-callback:TimerHandler:setTimeout @ 0cuac4a3q3k7b.js 56 ms | `()=>{let e=function(){let e=.475*window.innerHeight,t=null;for(let n of z){let i=document.` |
| 5.32 | about | 400 | 0 | 53 | 3 | 50 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 10 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |

### native — layout shifts (CLS total 0.0042, session 0.0018, 5 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 14.79 | 0.0018 | trading-algos | span.scene-caption__film.world-face-idiots in #trading-algos ; p.scene-caption.mb-tier-group[data-caption=cap.trading-algos][data-caption-world=idiots] in #trading-algos |
| 43.77 | 0.0013 | beyond | span.whitespace-nowrap in #beyond ; span.scene-caption__sep in #beyond ; span.scene-caption__film.world-face-rdr2 in #beyond |
| 53.23 | 0.0008 | principles | p.world-face-hp.text-center.text-[1rem][data-lettered=hp] in #principles ; span.scene-caption__film.world-face-hp in #principles ; p.scene-caption[data-caption=cap.principles][data-caption-world=hp] in #principles |
| 46.01 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 47.19 | 0.0001 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |

### native — visual pops (24; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 1.93 | 100 | act-1 | 0 | 2.5 | 25.4 | change | 4.5 | 1 |
| 2.27 | 500 | act-1 | 0 | 9.8 | 70.8 | fill-in | 20 | 1 |
| 2.83 | 1500 | act-1 | 0 | 2.4 | 12.5 | fill-in | 2 | 1 |
| 3.06 | 1500 | act-1 | 0 | 2.2 | 3.2 | change | 3.2 | 1 |
| 6.53 | 2400 | journey | 0 | 11.1 | 111.3 | change | 24 | 1 |
| 7.11 | 2800 | journey | 0 | 4.6 | 43.4 | change | 9.2 | 1 |
| 7.75 | 3600 | journey | 0 | 3.8 | 18.2 | change | 5.9 | 3 |
| 10.74 | 6400 | act-2 | 0 | 30.5 | 18.4 | change | 43.3 | 1 |
| 12.27 | 6800 | work | 0 | 9.4 | 165.4 | fill-in | 12.2 | 1 |
| 12.71 | 7200 | work | 0 | 4.4 | 13.2 | change | 4.4 | 1 |
| 13.08 | 7400 | work | 0 | 5.3 | 15.9 | change | 7.7 | 1 |
| 18.75 | 12400 | optuna-screener | 0 | 5.7 | 6.7 | change | 12 | 1 |
| 19.30 | 12800 | optuna-screener | 0 | 17 | 17.3 | change | 24.6 | 1 |
| 28.27 | 21300 | films | 0 | 3.4 | 5.1 | change | 5.4 | 1 |
| 39.16 | 25800 | act-3 | 0 | 10.3 | 15 | change | 16.9 | 1 |
| 39.59 | 26100 | act-3 | 0 | 3.7 | 5.1 | change | 7.3 | 1 |
| 42.48 | 27300 | beyond | 0 | 10.6 | 8.1 | change | 6 | 1 |
| 42.93 | 27700 | beyond | 0 | 10.1 | 5.3 | change | 13.3 | 2 |
| 45.16 | 30200 | writing | 0 | 25 | 8.3 | change | 29.5 | 1 |
| 53.36 | 35900 | principles | 0 | 4.6 | 22.2 | change | 2.6 | 1 |
| 53.89 | 36000 | principles | 0 | 3.2 | 10.5 | change | 2.9 | 1 |
| 56.94 | 36900 | principles | 0 | 67.9 | 129.2 | change | 36.8 | 1 |
| 59.00 | 37700 | principles | 0 | 116.2 | 200.8 | fill-in | 61.1 | 1 |
| 59.15 | 37700 | principles | 0 | 18.3 | 13.4 | change | 10.7 | 1 |

## rm — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 22 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 30 | 8.2 | #document ×2; div.relative.px-gutter.pt-tier-group in #act-1 ×1 |  | 0.6 MP of images |
| act-1 | 170 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 1.8 | 1.8 | #document ×4; img.object-cover in #act-2 ×1 |  | 2 mask, 0.6 MP of images |
| about | 100 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 1 | 254 |  | 0 | 37.2 | 4.2 | #document ×6; span.block in #header ×1 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js (301 ms) | 1 mask |
| journey | 54 | 43.2 | 23.1 | 16.7 | 16.7 | 300 | 3.7 | 3.7 | 300 | 1 | 0 | 100 | 0.1157 | 9.6 | 4 | #document ×4; span.block in #header ×1 |  | 1 mask, 0.2 MP of images |
| act-2 | 130 | 60 | 16.7 | 16.7 | 16.7 | 16.7 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 2.3 | 1.8 | #document ×3; div.relative.px-gutter.pt-tier-group in #act-1 ×1 |  | 1 filter, 2 mask, 0.6 MP of images |
| work | 139 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 6.9 | 1.3 | #document ×3 |  | 4 filter, 1 blend, 2 mask, 1 will-change, 0.8 MP of images |
| trading-algos | 99 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 3.6 | 1.8 | #document ×3 |  | 2 filter |
| optuna-screener | 238 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 16.6 | 3.5 | #document ×9; div.absolute.inset-x-0.top-0 in #kill-list ×2 |  | 2 filter, 0.6 MP of images |
| experiment | 65 | 59.1 | 16.9 | 16.7 | 16.8 | 33.3 | 0 | 0 | 33.3 | 0 | 0 |  | 0 | 39.1 | 1.8 | #document ×2 |  |  |
| systems | 118 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 4.6 | 3.1 | #document ×5; img.object-cover in #films ×1 |  | 1 mask, 0.6 MP of images |
| kill-list | 103 | 41.8 | 23.9 | 16.7 | 50 | 166.7 | 5.8 | 4.9 | 283.3 | 6 | 0 | 0 | 0 | 393.3 | 23.1 | #document ×22; ol.relative.border-t.border-rule in #kill-list ×6 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (10 ms) | 1 mask, 1 will-change, 0.1 MP of images |
| films | 528 | 51.4 | 19.4 | 16.7 | 16.8 | 133.3 | 1.7 | 1.7 | 316.6 | 9 | 374 | 44.4 | 0 | 77.7 | 2.8 | #document ×18; div.absolute.inset-x-0.top-0 in #kill-list ×3 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js (379 ms) | 2.2 MP of images |
| act-3 | 131 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 1.8 | 2.7 | #document ×4; img.object-cover in #beyond ×1 |  | 2 mask, 0.5 MP of images |
| beyond | 252 | 58.8 | 17 | 16.7 | 16.8 | 16.8 | 0.8 | 0.4 | 66.6 | 2 | 0 | 0 | 0 | 14.7 | 3 | #document ×7; div.rdr2-module__R8wI0W__campSticky in #voices ×3 |  | 6 mask, 2.2 MP of images |
| writing | 159 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 6.8 | 4.5 | #document ×5; div.rdr2-module__R8wI0W__campSticky in #voices ×4 |  | 4 mask, 2 will-change |
| voices | 99 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 14.5 | 4.2 | #document ×4; div.rdr2-module__R8wI0W__campSticky in #voices ×3 |  | 1.2 MP of images |
| act-4 | 127 | 58.6 | 17.1 | 16.7 | 16.7 | 16.8 | 0.8 | 0.8 | 66.6 | 1 | 0 | 0 | 0 | 5.5 | 2.8 | #document ×3; div.rdr2-module__R8wI0W__campSticky in #voices ×2 |  | 2 mask, 0.6 MP of images |
| principles | 38 | 6.2 | 162.3 | 16.7 | 1450 | 2466.6 | 13.2 | 13.2 | 2466.6 | 5 | 0 | 0 | 0 | 1345.4 | 1.5 | #document ×4; div.rdr2-module__R8wI0W__campSticky in #voices ×3 |  |  |
| contact | 1 | 0.3 | 3483.2 | 3483.2 | 3483.2 | 3483.2 | 100 | 100 | 3483.2 | 1 | 0 | 0 | 0 | 216.5 | 0 |  |  | 4 mask, 0.5 MP of images |
| credits | 139 | 34.6 | 28.9 | 16.7 | 33.3 | 516.6 | 4.3 | 4.3 | 650 | 7 | 0 | 0 | 0 | 33.9 | 0.7 | #document ×2; div.relative.px-gutter.pt-tier-group in #act-1 ×1 |  |  |

### rm — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 384→2093 | 190 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 16.8 | 0 | 0 |  |
| act-2 | 4250→5419 | 157 | 60 | 16.7 | 16.7 | 16.7 | 16.8 | 0 | 16.8 | 0 | 0 |  |
| act-3 | 21702→22894 | 151 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 16.8 | 0 | 0 |  |
| act-4 | 30357→31522 | 154 | 58.9 | 17 | 16.7 | 16.7 | 16.8 | 0.6 | 66.6 | 1 | 0 | 0 |

### rm — longest animation frames (LoAF total 13930 ms, main-thread work 826 ms, blocking 628 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 51.13 | contact | 3476 | 0 | 0 | 0 | 0 | (no script) |  |
| 46.93 | principles | 2461 | 0 | 0 | 0 | 0 | (no script) |  |
| 45.45 | principles | 1452 | 0 | 0 | 0 | 0 | (no script) |  |
| 49.78 | principles | 1354 | 0 | 6 | 6 | 0 | (no script) |  |
| 54.61 | credits | 661 | 0 | 0 | 0 | 0 | (no script) |  |

### rm — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 4.85 | about | 315 | 254 | 302 | 1 | 301 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js 301 ms | `i=>{for(let r of i){if(!r.isIntersecting)continue;let i=t.get(r.target);if(!(!i\|\|e.has(i))` |
| 22.82 | films | 242 | 191 | 230 | 2 | 228 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js 228 ms | `i=>{for(let r of i){if(!r.isIntersecting)continue;let i=t.get(r.target);if(!(!i\|\|e.has(i))` |
| 25.05 | films | 151 | 101 | 147 | 1 | 146 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js 146 ms | `i=>{for(let r of i){if(!r.isIntersecting)continue;let i=t.get(r.target);if(!(!i\|\|e.has(i))` |
| 23.06 | films | 136 | 82 | 113 | 1 | 112 | user-callback:TimerHandler:setInterval 112 ms |  |
| 21.42 | kill-list | 178 | 0 | 11 | 1 | 10 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 5 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |

### rm — layout shifts (CLS total 0.1157, session 0.1157, 2 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 5.24 | 0.0735 | journey | figure.mt-tier-block.border-t.border-rule in #about ; li.max-w-[34ch] in #about ; li.max-w-[34ch] in #about |
| 5.16 | 0.0421 | journey | figure.mt-tier-block.border-t.border-rule in #about ; p.mt-tier-pair.type-body.text-fg-muted in #about ; p.mt-tier-pair.type-body.text-fg-muted in #about |

### rm — visual pops (2; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 53.36 | 32400 | contact | 0 | 89.9 | 6.9 | fill-in | 47.4 | 1 |
| 55.71 | 33200 | credits | 0 | 78.9 | 5.6 | fill-in | 42.8 | 1 |

## Strips

- strips/intro.png
- strips/intro-landing.png
- strips/pop-intro-50.png
- strips/pop-intro-53.png
- strips/pop-intro-54.png
- strips/pop-intro-11.png
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
- strips/pop-native-531.png
- strips/pop-native-88.png
- strips/pop-native-445.png
- strips/pop-native-535.png
- strips/rm-act-1.png
- strips/rm-act-2.png
- strips/rm-act-3.png
- strips/rm-act-4.png
- strips/rm-first-60s.png
- strips/pop-rm-396.png
- strips/pop-rm-399.png
