# Motion baseline — 2026-10-01T20:56:56.676Z

Base http://localhost:3161 · Chromium 141.0.7390.37 headless · 4 CPUs · screencast everyNthFrame=1.

> Headless Chromium rasterises in software (SwiftShader) on a few CPUs and pays for the screencast readback, so absolute frame times are pessimistic vs a real laptop/phone GPU. Read them as RELATIVE hotspots: which sections and transitions are worst. "busy∩jank %" = share of >33.4 ms frames that overlap a long animation frame in which the main thread really worked (script + style/layout/paint >= half the frame, or a >50 ms task); low = the frame was raster/composite-bound (the LoAF is the main thread waiting on the compositor), high = main-thread script/style/layout. "paint suspects" = what the section holds that is costly to raster (filters, blend, masks, canvas, video, image megapixels, infinite animations).

## Runs

| run | viewport | lenis | secs | rAF frames | fps | mean ms | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | LoAF block ms | busy∩jank % | CLS total | CLS (session) | pops | shots |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| intro | 1440x900 |  | 11.7 | 217 | 18.5 | 54 | 33.3 | 133.3 | 316.6 | 47.5 | 40.1 | 600 | 129 | 185 | 1.9 | 0.0051 | 0.0051 | 7 | 121 |
| desktop | 1440x900 | on | 71.9 | 1367 | 19 | 52.6 | 16.7 | 216.6 | 383.3 | 28.5 | 23.6 | 1083.4 | 341 | 208 | 1.3 | 0.0047 | 0.0026 | 1 | 579 |
| native | 1440x900 | off | 64.3 | 1018 | 15.8 | 63.2 | 16.7 | 266.7 | 416.7 | 32.1 | 27.5 | 1383.3 | 282 | 267 | 1.2 | 0.0032 | 0.0011 | 25 | 613 |

## Top 10 hotspots (by mean frame time; rm excluded)

| # | run | where | frames | fps | mean | p95 | p99 | >50 % | max | mean / run mean | LoAF block ms | likely cause |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | native | journey | 12 | 3.7 | 268 | 750 | 750 | 91.7 | 750 | 4.2 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.9% waiting for the compositor — on screen: 1 mask, 1 will-change, 0.8 MP of images [while scrolling: raster 684.9 ms/s, 24.9 paints/s — repainting: #document ×12; div.relative.flex.flex-col in #act-2 ×10 \| idle 60.4 fps, raster 0 ms/s, 0 paints/s] |
| 2 | desktop | principles | 16 | 4.4 | 229.2 | 433.3 | 433.3 | 87.5 | 433.3 | 4.4 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.8% waiting for the compositor — on screen: 7 will-change [while scrolling: raster 980.5 ms/s, 16.4 paints/s — repainting: #document ×16; div.relative.flex.flex-col in #act-4 ×16 \| idle 60.6 fps, raster 0 ms/s, 0 paints/s] |
| 3 | native | principles | 19 | 4.5 | 223.7 | 849.9 | 849.9 | 68.4 | 849.9 | 3.5 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.5% waiting for the compositor — on screen: 7 will-change [while scrolling: raster 1037.2 ms/s, 15.8 paints/s — repainting: #document ×17; div.origin-right in #principles ×9 \| idle 60.6 fps, raster 0 ms/s, 0 paints/s] |
| 4 | desktop | beyond | 22 | 4.5 | 222.7 | 533.3 | 550 | 86.4 | 550 | 4.2 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.8% waiting for the compositor — on screen: 6 mask, 3 MP of images [while scrolling: raster 817.6 ms/s, 14.3 paints/s — repainting: #document ×21; div.stage-window in #beyond ×15 \| idle 60.5 fps, raster 0 ms/s, 0 paints/s] |
| 5 | desktop | trading-algos | 12 | 4.9 | 204.2 | 466.6 | 466.6 | 91.7 | 466.6 | 3.9 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.3% waiting for the compositor — on screen: 2 filter, 0.2 MP of images [while scrolling: raster 877.2 ms/s, 25.7 paints/s — repainting: #document ×12; div.relative.px-gutter.pt-tier-group in #act-1 ×12 \| idle 60.3 fps, raster 0 ms/s, 0 paints/s] |
| 6 | native | about | 9 | 5 | 200 | 416.7 | 416.7 | 77.8 | 416.7 | 3.2 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 97.9% waiting for the compositor — on screen: 1 mask [while scrolling: raster 582.3 ms/s, 23.3 paints/s — repainting: #document ×9; div.relative.flex.flex-col in #act-2 ×6 \| idle 60.6 fps, raster 0 ms/s, 0 paints/s] |
| 7 | native | work | 13 | 5.5 | 180.8 | 416.7 | 416.7 | 92.3 | 416.7 | 2.9 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.5% waiting for the compositor — on screen: 3 filter, 1 blend, 2 mask, 2 will-change, 1.6 MP of images [while scrolling: raster 628.1 ms/s, 28.9 paints/s — repainting: #document ×11; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×8 \| idle 60.2 fps, raster 0 ms/s, 0 paints/s] |
| 8 | desktop | about | 11 | 5.6 | 177.3 | 483.3 | 483.3 | 81.8 | 483.3 | 3.4 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 98.6% waiting for the compositor — on screen: 1 mask [while scrolling: raster 737.9 ms/s, 24.1 paints/s — repainting: #document ×11; div.relative.px-gutter.pt-tier-group in #act-1 ×10 \| idle 60.6 fps, raster 0 ms/s, 0 paints/s] |
| 9 | native | trading-algos | 12 | 5.8 | 172.2 | 266.6 | 266.6 | 83.3 | 266.6 | 2.7 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.2% waiting for the compositor — on screen: 2 filter, 0.2 MP of images [while scrolling: raster 707.5 ms/s, 24.2 paints/s — repainting: #document ×11; div.stage-window in #optuna-screener ×9 \| idle 60.3 fps, raster 0 ms/s, 0 paints/s] |
| 10 | desktop | journey | 18 | 5.9 | 169.4 | 433.3 | 433.3 | 88.9 | 433.3 | 3.2 | 55 | raster/composite-bound: only 11.8% of janky frames overlap real main-thread work; the LoAFs are 95.7% waiting for the compositor — on screen: 1 mask, 1 will-change, 0.8 MP of images [while scrolling: raster 834.5 ms/s, 35.7 paints/s — repainting: #document ×18; div.relative.px-gutter.pt-tier-group in #act-1 ×17 \| idle 60.4 fps, raster 0 ms/s, 0 paints/s] |

## Idle probe (desktop: parked 2.5 s on each section, then 1.5 s traced standing still; high raster with few paints = a raster-heavy layer, many paints/s = continuous animation)

| section | idle fps | raster ms/s | paints/s | paint ms/s | style+layout ms/s | rAF JS ms/s | top repainting nodes |
|---|---|---|---|---|---|---|---|
| top | 60.5 | 0 | 0 | 0 | 2.3 | 22.5 |  |
| act-1 | 60.2 | 0 | 0 | 0 | 0 | 17.6 |  |
| about | 60.6 | 0 | 0 | 0 | 3.4 | 20 |  |
| journey | 60.4 | 0 | 0 | 0 | 0 | 15.8 |  |
| act-2 | 60.1 | 0 | 0 | 0 | 0 | 16.7 |  |
| work | 60.2 | 0 | 0 | 0 | 0 | 18.7 |  |
| trading-algos | 60.3 | 0 | 0 | 0 | 0 | 19.4 |  |
| optuna-screener | 60.3 | 0 | 0 | 0 | 0 | 18.8 |  |
| experiment | 60.4 | 0 | 0 | 0 | 0 | 17.2 |  |
| systems | 60.4 | 0 | 0 | 0 | 0 | 16.4 |  |
| kill-list | 60.3 | 0 | 0 | 0 | 0 | 15.9 |  |
| films | 60 | 0 | 0 | 0 | 0 | 16 |  |
| act-3 | 60.1 | 0 | 0 | 0 | 0 | 18.6 |  |
| beyond | 60.5 | 0 | 0 | 0 | 0 | 17.4 |  |
| writing | 60 | 0 | 0 | 0 | 0 | 18.9 |  |
| voices | 60.2 | 0 | 0 | 0 | 0 | 18.4 |  |
| act-4 | 60.4 | 0 | 0 | 0 | 0 | 17.7 |  |
| principles | 60.6 | 0 | 0 | 0 | 0 | 15.6 |  |
| contact | 60.4 | 0 | 0 | 0 | 0 | 14.7 |  |
| credits | 60.1 | 0 | 0 | 0 | 0 | 15.9 |  |

## intro — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| intro:play-screen | 50 | 18.9 | 53 | 50 | 116.6 | 116.7 | 62 | 42 | 116.7 | 26 | 89 | 16.1 | 0.0051 | 507.2 | 33.6 | #document ×33; div.relative.px-gutter.pt-tier-group in #act-1 ×13 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (230 ms) |  |
| intro:flight | 103 | 16.6 | 60.4 | 66.6 | 133.3 | 183.3 | 60.2 | 54.4 | 316.6 | 62 | 0 | 0 | 0 | 354.1 | 4.7 | #document ×8; node 61 ×5 | event-listener:BUTTON#intro-play.onclick @ intro.js (12 ms) |  |
| intro:hold | 2 | 12 | 83.4 | 150 | 150 | 150 | 50 | 50 | 150 | 2 | 15 | 100 | 0 | 0 | 78 | #document ×2; div#intro-stage ×2 | user-callback:FrameRequestCallback (57 ms) |  |
| intro:reveal | 3 | 4 | 250 | 133.3 | 600 | 600 | 66.7 | 66.7 | 600 | 2 | 0 | 0 | 0 | 577.4 | 4 | #document ×2; video.absolute.inset-0.size-full in #top ×1 |  |  |
| intro:titles | 78 | 24.4 | 41 | 16.7 | 116.7 | 316.7 | 33.3 | 21.8 | 316.7 | 25 | 0 | 0 | 0 | 73.8 | 2.5 | #document ×2; div#intro-cap-hp.absolute.right-(--spacing-gutter).bottom-[max(7svh,2.75rem)] ×1 | user-callback:FrameRequestCallback (7 ms) |  |
| top | 31 | 22.4 | 44.6 | 33.3 | 100 | 150 | 38.7 | 35.5 | 150 | 12 | 81 | 8.3 | 0 | 205.3 | 18.1 | #document ×8; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×2 | user-callback:FrameRequestCallback (116 ms) | 1 video, 1 filter, 1 blend, 1 mask, 5 will-change, 2.3 MP of images |

### intro — marks and LoAF intro:warm → intro:titles-end

warm t=4.819s → titles-end t=10.343s: 46 LoAF, **46 > 50 ms** (max 609 ms, blocking 15 ms)

intro:arm@-4.18 · intro:ready@-3.92 · intro:play@0 · intro:flight@0.119 · intro:warm@4.819 · intro:hold@6.2 · intro:reveal@6.367 · intro:landing@6.367 · intro:titles@7.142 · intro:end@7.142 · intro:titles-end@10.343

### intro — longest animation frames (LoAF total 11563 ms, main-thread work 622 ms, blocking 185 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 6.49 | intro:reveal | 609 | 0 | 0 | 0 | 0 | (no script) |  |
| 0.17 | intro:flight | 327 | 0 | 19 | 1 | 18 | user-callback:FrameRequestCallback 12 ms |  |
| 7.29 | intro:titles | 306 | 0 | 0 | 0 | 0 | (no script) |  |
| 1.22 | intro:flight | 189 | 0 | 0 | 0 | 0 | (no script) |  |
| 7.1 | intro:titles | 178 | 0 | 12 | 0 | 12 | user-callback:FrameRequestCallback 7 ms |  |

### intro — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 11.48 | top | 168 | 81 | 130 | 14 | 116 | user-callback:FrameRequestCallback 116 ms |  |
| -2.28 | intro:play-screen | 91 | 0 | 83 | 1 | 82 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 30 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| -2.09 | intro:play-screen | 102 | 52 | 83 | 1 | 82 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 82 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| -2.19 | intro:play-screen | 91 | 37 | 72 | 1 | 71 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 71 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| 6.2 | intro:hold | 71 | 15 | 60 | 3 | 57 | user-callback:FrameRequestCallback 57 ms |  |

### intro — layout shifts (CLS total 0.0051, session 0.0051, 1 shifts)

| t s | value | section | sources |
|---|---|---|---|
| -2.66 | 0.0051 | intro:play-screen | svg in #top ; svg in #top |

### intro — visual pops (7; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| -1.47 | 0 | intro:play-screen | 0 | 6.6 | 286.7 | change | 6.6 | 1 |
| 2.23 | 0 | intro:flight | 0 | 13.4 | 279.7 | change | 20.1 | 9 |
| 2.80 | 0 | intro:flight | 0 | 8.9 | 145.3 | change | 11.4 | 3 |
| 3.20 | 0 | intro:flight | 0 | 8.7 | 9.6 | change | 14.9 | 2 |
| 3.60 | 0 | intro:flight | 0 | 15.8 | 4.3 | change | 33.1 | 3 |
| 3.85 | 0 | intro:flight | 0 | 18.4 | 4.8 | change | 42.9 | 1 |
| 8.52 | 0 | intro:titles | 0 | 11.4 | 9.3 | change | 9.8 | 1 |

## desktop — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 11 | 12.9 | 77.3 | 16.7 | 350 | 350 | 36.4 | 36.4 | 350 | 4 | 0 | 0 | 0 | 452.9 | 31.8 | #document ×7; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×6 |  | 1 filter, 1 blend, 1 mask, 5 will-change, 2.3 MP of images |
| act-1 | 114 | 25.4 | 39.3 | 16.7 | 150 | 383.3 | 18.4 | 13.2 | 383.3 | 18 | 0 | 0 | 0 | 412.7 | 19.9 | #document ×34; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×34 | user-callback:FrameRequestCallback @ 2gtmnwptgq-6o.js (5 ms) | 2 mask, 1 will-change, 1.2 MP of images |
| about | 11 | 5.6 | 177.3 | 183.3 | 483.3 | 483.3 | 81.8 | 81.8 | 483.3 | 9 | 0 | 0 | 0 | 737.9 | 24.1 | #document ×11; div.relative.px-gutter.pt-tier-group in #act-1 ×10 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (15 ms) | 1 mask |
| journey | 18 | 5.9 | 169.4 | 150 | 433.3 | 433.3 | 94.4 | 88.9 | 433.3 | 16 | 55 | 11.8 | 0 | 834.5 | 35.7 | #document ×18; div.relative.px-gutter.pt-tier-group in #act-1 ×17 | user-callback:TimerHandler:setInterval (101 ms) | 1 mask, 1 will-change, 0.8 MP of images |
| act-2 | 111 | 30.8 | 32.4 | 16.7 | 150 | 183.3 | 14.4 | 12.6 | 333.3 | 15 | 0 | 0 | 0 | 420.8 | 29.7 | #document ×21; div.relative.sm:overflow-hidden.sm:rounded-frame in #work ×15 |  | 2 filter, 2 mask, 8 will-change, 3.5 MP of images |
| work | 25 | 8.9 | 112 | 83.4 | 300 | 350 | 68 | 64 | 350 | 16 | 0 | 0 | 0.0026 | 751.5 | 25.4 | #document ×12; div.relative.px-gutter.pt-tier-group in #act-1 ×9 | user-callback:FrameRequestCallback @ 058gzlmolh0-t.js v (5 ms) | 3 filter, 1 blend, 2 mask, 2 will-change, 1.6 MP of images |
| trading-algos | 12 | 4.9 | 204.2 | 183.3 | 466.6 | 466.6 | 91.7 | 91.7 | 466.6 | 11 | 0 | 0 | 0 | 877.2 | 25.7 | #document ×12; div.relative.px-gutter.pt-tier-group in #act-1 ×12 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (6 ms) | 2 filter, 0.2 MP of images |
| optuna-screener | 38 | 8.4 | 118.4 | 116.6 | 283.3 | 283.3 | 81.6 | 65.8 | 283.3 | 26 | 0 | 0 | 0.0002 | 788.7 | 29.1 | #document ×32; div.stage-window in #trading-algos ×22 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (18 ms) | 2 filter, 1.2 MP of images |
| experiment | 26 | 21.4 | 46.8 | 49.9 | 116.8 | 183.3 | 50 | 26.9 | 183.3 | 8 | 0 | 0 | 0 | 745.5 | 35.3 | #document ×14; div.pointer-events-none.absolute.inset-x-0 in #systems ×7 |  |  |
| systems | 23 | 9.9 | 101.4 | 66.7 | 250 | 250.1 | 87 | 56.5 | 250.1 | 14 | 0 | 0 | 0 | 869.2 | 34.7 | #document ×21; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×15 |  | 1 mask, 1 will-change, 1 MP of images |
| kill-list | 19 | 8.6 | 115.8 | 100 | 200 | 200 | 89.5 | 78.9 | 200 | 15 | 0 | 0 | 0 | 829.1 | 35 | #document ×19; div.relative.@container.will-change-[transform,opacity] in #header ×17 |  | 1 mask, 3 will-change, 0.3 MP of images |
| films | 496 | 31.4 | 31.8 | 16.7 | 116.7 | 216.7 | 16.3 | 12.7 | 333.3 | 68 | 153 | 3.7 | 0 | 465.4 | 37.5 | #document ×238; svg.pointer-events-none.absolute.inset-0 viewBox=0 0 1778 1000 in #films ×77 | user-callback:FrameRequestCallback @ 058gzlmolh0-t.js v (5 ms) | 4 will-change, 3.9 MP of images |
| act-3 | 123 | 33.7 | 29.7 | 16.7 | 83.3 | 250 | 13 | 10.6 | 283.2 | 15 | 0 | 0 | 0 | 546.3 | 16.4 | #document ×25; div.rdr2-module__R8wI0W__bandLayer in #beyond ×13 |  | 1 filter, 2 mask, 6 will-change, 2 MP of images |
| beyond | 22 | 4.5 | 222.7 | 216.6 | 533.3 | 550 | 95.5 | 86.4 | 550 | 20 | 0 | 0 | 0 | 817.6 | 14.3 | #document ×21; div.stage-window in #beyond ×15 |  | 6 mask, 3 MP of images |
| writing | 31 | 11.4 | 87.6 | 83.3 | 149.9 | 266.7 | 93.5 | 80.6 | 266.7 | 26 | 0 | 0 | 0.0009 | 809.5 | 69.6 | #document ×28; div.stage-window in #beyond ×27 | user-callback:FrameRequestCallback @ 2gtmnwptgq-6o.js (5 ms) | 4 mask, 3 will-change |
| voices | 30 | 14.5 | 68.9 | 33.4 | 266.7 | 416.6 | 40 | 33.3 | 416.6 | 11 | 0 | 0 | 0 | 794.1 | 87.1 | #document ×28; div.relative.flex.flex-col in #act-4 ×24 | user-callback:FrameRequestCallback @ 2gtmnwptgq-6o.js (6 ms) | 2 will-change, 2.3 MP of images |
| act-4 | 132 | 39.6 | 25.3 | 16.7 | 66.6 | 216.7 | 5.3 | 5.3 | 300 | 7 | 0 | 0 | 0 | 358.8 | 19.8 | #document ×18; div.rdr2-module__R8wI0W__campSticky in #voices ×17 |  | 2 mask, 5 will-change, 2.3 MP of images |
| principles | 16 | 4.4 | 229.2 | 266.7 | 433.3 | 433.3 | 93.8 | 87.5 | 433.3 | 14 | 0 | 0 | 0.001 | 980.5 | 16.4 | #document ×16; div.relative.flex.flex-col in #act-4 ×16 |  | 7 will-change |
| contact | 3 | 1.6 | 627.8 | 466.6 | 1083.4 | 1083.4 | 100 | 100 | 1083.4 | 3 | 0 | 0 | 0 | 1109.2 | 4.8 | #document ×3; div.relative.flex.flex-col in #act-4 ×3 | user-callback:FrameRequestCallback @ 058gzlmolh0-t.js v (5 ms) | 4 mask, 0.9 MP of images |
| credits | 106 | 23.6 | 42.3 | 16.7 | 99.9 | 300 | 28.3 | 21.7 | 716.6 | 25 | 0 | 0 | 0 | 471.3 | 12.7 | #document ×30; div.stage-cam ×14 | user-callback:IntersectionObserverCallback @ 3fg-gestn5u7o.js (5 ms) |  |

### desktop — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 450→2481 | 121 | 22.9 | 43.7 | 16.7 | 166.6 | 383.3 | 16.5 | 383.3 | 24 | 0 | 0 |
| act-2 | 6213→8085 | 123 | 28.3 | 35.4 | 16.7 | 150 | 200 | 15.4 | 333.3 | 21 | 0 | 0 |
| act-3 | 27093→28443 | 127 | 28.3 | 35.3 | 16.7 | 166.7 | 250 | 13.4 | 283.2 | 19 | 0 | 0 |
| act-4 | 36343→38215 | 138 | 31.6 | 31.6 | 16.7 | 200 | 283.4 | 8 | 300 | 12 | 0 | 0 |

### desktop — longest animation frames (LoAF total 50589 ms, main-thread work 414 ms, blocking 208 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 65.89 | contact | 1075 | 0 | 1 | 1 | 0 | (no script) |  |
| 67.44 | credits | 720 | 0 | 5 | 0 | 5 | user-callback:IntersectionObserverCallback @ 3fg-gestn5u7o.js 5 ms | `([e])=>{if(!e\|\|!e.isIntersecting)return;let i=e.rootBounds?.height??window.innerHeight;if(` |
| 50.99 | beyond | 545 | 0 | 0 | 0 | 0 | (no script) |  |
| 51.54 | beyond | 526 | 0 | 1 | 1 | 0 | (no script) |  |
| 6.14 | about | 486 | 0 | 10 | 0 | 10 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 5 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |

### desktop — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 8.51 | journey | 209 | 55 | 102 | 1 | 101 | user-callback:TimerHandler:setInterval 101 ms |  |
| 20.2 | optuna-screener | 65 | 0 | 19 | 1 | 18 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 11 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| 6.14 | about | 486 | 0 | 10 | 0 | 10 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 5 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| 7.45 | journey | 74 | 0 | 7 | 1 | 6 | event-listener:#document.onpointerout @ 3p9eevrhj-twl.js fO 6 ms | `(e,t,n,r){var l=W.T;W.T=null;var a=q.p;try{q.p=8,fz(e,t,n,r)}finally{q.p=a,W.T=l}}function` |
| 57.59 | voices | 130 | 0 | 7 | 1 | 6 | user-callback:FrameRequestCallback @ 2gtmnwptgq-6o.js 6 ms | `()=>{c=0,k()}))}function T(e,t,i,o=!0){window.clearTimeout(e.timer),e.offIdle?.(),e.io?.di` |

### desktop — layout shifts (CLS total 0.0047, session 0.0026, 8 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 15.89 | 0.0026 | work | span.whitespace-nowrap in #work ; span.scene-caption__film.world-face-idiots in #work |
| 62.92 | 0.001 | principles | span.whitespace-nowrap in #principles ; span.scene-caption__film.world-face-hp in #principles ; h3.type-title.text-fg.max-sm:hyphens-auto in #principles |
| 54.72 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 55.55 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 56.08 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 22.48 | 0.0002 | optuna-screener | h3.mt-tier-pair.max-w-title.type-title in #optuna-screener |
| 55.1 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 26.77 | 0 | systems | h3.type-heading.text-fg.lg:text-[length:var(--text-lead)] in #systems |

### desktop — visual pops (1; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 63.22 | 37828 | principles | 30 | 19.7 | 3.3 | change | 25.2 | 1 |

## native — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 10 | 10.2 | 98.3 | 33.3 | 316.7 | 316.7 | 40 | 40 | 316.7 | 3 | 0 | 0 | 0 | 560.4 | 19.3 | #document ×6; node 8 ×3 | user-callback:FrameRequestCallback @ 058gzlmolh0-t.js v (11 ms) | 1 filter, 1 blend, 1 mask, 5 will-change, 2.3 MP of images |
| act-1 | 64 | 19.3 | 51.8 | 16.7 | 183.3 | 333.3 | 34.4 | 26.6 | 333.3 | 17 | 0 | 0 | 0 | 444.1 | 17.8 | #document ×25; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×8 | user-callback:IntersectionObserverCallback @ 20o9udm79ri6d.js (5 ms) | 2 mask, 1 will-change, 1.2 MP of images |
| about | 9 | 5 | 200 | 166.6 | 416.7 | 416.7 | 88.9 | 77.8 | 416.7 | 7 | 0 | 0 | 0 | 582.3 | 23.3 | #document ×9; div.relative.flex.flex-col in #act-2 ×6 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (33 ms) | 1 mask |
| journey | 12 | 3.7 | 268 | 266.6 | 750 | 750 | 91.7 | 91.7 | 750 | 10 | 0 | 0 | 0 | 684.9 | 24.9 | #document ×12; div.relative.flex.flex-col in #act-2 ×10 |  | 1 mask, 1 will-change, 0.8 MP of images |
| act-2 | 79 | 23.9 | 41.8 | 16.7 | 233.3 | 416.6 | 12.7 | 11.4 | 416.6 | 9 | 0 | 0 | 0 | 523.1 | 37.3 | #document ×35; span.block in #act-2 ×11 |  | 2 filter, 2 mask, 8 will-change, 3.5 MP of images |
| work | 13 | 5.5 | 180.8 | 150 | 416.7 | 416.7 | 92.3 | 92.3 | 416.7 | 12 | 0 | 0 | 0 | 628.1 | 28.9 | #document ×11; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×8 | event-listener:DOMWindow.onscroll @ 38gvb2tdj56o_.js e (5 ms) | 3 filter, 1 blend, 2 mask, 2 will-change, 1.6 MP of images |
| trading-algos | 12 | 5.8 | 172.2 | 200 | 266.6 | 266.6 | 83.3 | 83.3 | 266.6 | 10 | 0 | 0 | 0.0009 | 707.5 | 24.2 | #document ×11; div.stage-window in #optuna-screener ×9 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (7 ms) | 2 filter, 0.2 MP of images |
| optuna-screener | 55 | 11.9 | 84.2 | 33.3 | 316.6 | 466.6 | 43.6 | 40 | 466.6 | 21 | 0 | 0 | 0 | 579.1 | 28.3 | #document ×30; div.stage-window in #trading-algos ×19 | user-callback:FrameRequestCallback @ 058gzlmolh0-t.js v (12 ms) | 2 filter, 1.2 MP of images |
| experiment | 74 | 60 | 16.7 | 16.7 | 16.8 | 16.8 | 0 | 0 | 16.8 | 0 | 0 |  | 0 | 17 | 32.4 | #document ×15; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×10 |  |  |
| systems | 32 | 12.1 | 82.8 | 49.9 | 316.7 | 483.3 | 53.1 | 40.6 | 483.3 | 13 | 0 | 0 | 0 | 788.3 | 28.7 | #document ×26; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×16 |  | 1 mask, 1 will-change, 1 MP of images |
| kill-list | 15 | 6.8 | 147.8 | 133.2 | 400 | 400 | 66.7 | 66.7 | 400 | 10 | 0 | 0 | 0 | 746.2 | 28 | #document ×14; div.relative.@container.will-change-[transform,opacity] in #header ×9 | user-callback:FrameRequestCallback @ 058gzlmolh0-t.js v (5 ms) | 1 mask, 3 will-change, 0.3 MP of images |
| films | 277 | 23.7 | 42.1 | 16.7 | 183.2 | 283.3 | 24.2 | 19.1 | 333.3 | 56 | 267 | 6 | 0 | 640.1 | 43.5 | #document ×214; svg.pointer-events-none.absolute.inset-0 viewBox=0 0 2333 1000 in #films ×92 | user-callback:FrameRequestCallback (164 ms) | 4 will-change, 3.9 MP of images |
| act-3 | 82 | 34.6 | 28.9 | 16.7 | 66.7 | 266.7 | 14.6 | 8.5 | 266.7 | 8 | 0 | 0 | 0 | 316.9 | 25.8 | #document ×26; span.block in #header ×9 |  | 1 filter, 2 mask, 6 will-change, 2 MP of images |
| beyond | 69 | 13.4 | 74.4 | 16.7 | 283.3 | 950 | 33.3 | 33.3 | 950 | 22 | 0 | 0 | 0.0008 | 578.8 | 26.1 | #document ×49; div.stage-window in #beyond ×16 |  | 6 mask, 3 MP of images |
| writing | 28 | 9.8 | 102.4 | 100 | 216.7 | 233.4 | 78.6 | 64.3 | 233.4 | 20 | 0 | 0 | 0.0011 | 650.9 | 57.6 | #document ×26; svg.size-full.overflow-visible.will-change-transform viewBox=0 0 400 500[data-motif=journal-landscape] in #writing ×23 |  | 4 mask, 3 will-change |
| voices | 18 | 10.3 | 97.2 | 83.3 | 316.7 | 316.7 | 77.8 | 66.7 | 316.7 | 11 | 0 | 0 | 0 | 632 | 49.7 | #document ×17; div.relative.flex.flex-col in #act-4 ×9 |  | 2 will-change, 2.3 MP of images |
| act-4 | 99 | 34.9 | 28.6 | 16.7 | 100 | 399.9 | 6.1 | 5.1 | 399.9 | 5 | 0 | 0 | 0 | 362.1 | 40.2 | #document ×40; div.block in #act-4 ×15 |  | 2 mask, 5 will-change, 2.3 MP of images |
| principles | 19 | 4.5 | 223.7 | 200 | 849.9 | 849.9 | 68.4 | 68.4 | 849.9 | 10 | 0 | 0 | 0.0004 | 1037.2 | 15.8 | #document ×17; div.origin-right in #principles ×9 | user-callback:FrameRequestCallback @ 2gtmnwptgq-6o.js (5 ms) | 7 will-change |
| contact | 3 | 1.8 | 561.1 | 283.3 | 1383.3 | 1383.3 | 66.7 | 66.7 | 1383.3 | 2 | 0 | 0 | 0 | 716.5 | 6.5 | #document ×3; div.relative.flex.flex-col in #act-4 ×2 | user-callback:FrameRequestCallback @ 2gtmnwptgq-6o.js (6 ms) | 4 mask, 0.9 MP of images |
| credits | 48 | 12.1 | 83 | 66.7 | 166.6 | 700.1 | 83.3 | 66.7 | 700.1 | 36 | 0 | 0 | 0 | 506.6 | 17.1 | #document ×29; footer#credits.relative.isolate.z-(--z-main) in #credits ×18 | event-listener:#document.ontransitionrun @ 3p9eevrhj-twl.js fz (6 ms) |  |

### native — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 450→2481 | 69 | 17.5 | 57 | 16.7 | 200 | 333.3 | 29 | 333.3 | 20 | 0 | 0 |
| act-2 | 6213→8085 | 80 | 22.7 | 44 | 16.7 | 233.3 | 416.6 | 12.5 | 416.6 | 11 | 0 | 0 |
| act-3 | 27093→28443 | 113 | 39.2 | 25.5 | 16.7 | 66.7 | 199.9 | 6.2 | 266.7 | 8 | 0 | 0 |
| act-4 | 36343→38215 | 111 | 25.8 | 38.7 | 16.7 | 216.7 | 366.6 | 10.8 | 399.9 | 10 | 0 | 0 |

### native — longest animation frames (LoAF total 47495 ms, main-thread work 570 ms, blocking 267 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 58.65 | contact | 1383 | 0 | 7 | 1 | 6 | user-callback:FrameRequestCallback @ 2gtmnwptgq-6o.js 6 ms | `()=>{c=0,k()}))}function T(e,t,i,o=!0){window.clearTimeout(e.timer),e.offIdle?.(),e.io?.di` |
| 43.52 | beyond | 956 | 0 | 0 | 0 | 0 | (no script) |  |
| 56.19 | principles | 834 | 0 | 4 | 4 | 0 | (no script) |  |
| 7.55 | journey | 746 | 0 | 1 | 1 | 0 | (no script) |  |
| 60.32 | credits | 703 | 0 | 0 | 0 | 0 | (no script) |  |

### native — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 28.91 | films | 236 | 127 | 174 | 10 | 164 | user-callback:FrameRequestCallback 164 ms |  |
| 5.72 | about | 388 | 0 | 19 | 2 | 17 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 7 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| 18.74 | optuna-screener | 330 | 0 | 13 | 1 | 12 | user-callback:FrameRequestCallback @ 058gzlmolh0-t.js v 12 ms | `()=>{let n=t.MotionGlobalConfig.useManualTiming,o=n?a.timestamp:performance.now();r=!1,n\|\|` |
| 5.4 | about | 312 | 0 | 10 | 0 | 10 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 5 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| 15.44 | trading-algos | 238 | 0 | 8 | 1 | 7 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 7 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |

### native — layout shifts (CLS total 0.0032, session 0.0011, 9 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 15.95 | 0.0009 | trading-algos | span.scene-caption__film.world-face-idiots in #trading-algos ; p.scene-caption.mb-tier-group[data-caption=cap.trading-algos][data-caption-world=idiots] in #trading-algos |
| 45.53 | 0.0008 | beyond | span.whitespace-nowrap in #beyond ; span.scene-caption__film.world-face-rdr2 in #beyond |
| 55.53 | 0.0004 | principles | p.world-face-hp.text-center.text-[1rem][data-lettered=hp] in #principles ; span.whitespace-nowrap in #principles ; span.scene-caption__film.world-face-hp in #principles |
| 49.5 | 0.0004 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 47.85 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 48.86 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 48.43 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 24.77 | 0 | systems | h3.type-heading.text-fg.lg:text-[length:var(--text-lead)] in #systems |

### native — visual pops (25; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 2.42 | 400 | act-1 | 0 | 7.2 | 61 | change | 13.7 | 1 |
| 2.73 | 800 | act-1 | 0 | 3.6 | 13.4 | change | 4.9 | 1 |
| 5.31 | 1900 | about | 0 | 3.7 | 66.5 | change | 3.9 | 1 |
| 5.60 | 2000 | about | 0 | 2.6 | 46.2 | change | 4 | 1 |
| 5.88 | 2100 | about | 0 | 2.2 | 40.5 | change | 3.2 | 1 |
| 10.98 | 6800 | act-2 | 0 | 8.4 | 4.3 | change | 12.5 | 1 |
| 11.28 | 7100 | act-2 | 0 | 32.2 | 24.5 | change | 44.9 | 1 |
| 12.55 | 7200 | act-2 | 0 | 3.2 | 15.9 | change | 4.8 | 1 |
| 13.88 | 7800 | work | 0 | 19.4 | 99.9 | fill-in | 20 | 1 |
| 14.23 | 8400 | work | 0 | 2.3 | 8.5 | fill-in | 2 | 1 |
| 14.71 | 8800 | work | 0 | 2.3 | 8.5 | change | 5.9 | 1 |
| 15.19 | 9600 | trading-algos | 0 | 15.4 | 6.6 | fill-in | 30.2 | 1 |
| 29.04 | 21900 | films | 0 | 3.1 | 9.6 | fill-in | 3.9 | 1 |
| 31.70 | 23400 | films | 0 | 5.1 | 6.3 | change | 5.1 | 2 |
| 40.46 | 27200 | act-3 | 0 | 8.3 | 10.5 | change | 17.5 | 1 |
| 40.81 | 27400 | act-3 | 0 | 4.1 | 5.2 | change | 10.9 | 1 |
| 45.28 | 29500 | beyond | 0 | 23.1 | 25 | fill-in | 19.3 | 1 |
| 46.58 | 31600 | beyond | 0 | 6.1 | 16.4 | change | 10.1 | 1 |
| 46.82 | 31800 | beyond | 0 | 10.6 | 19.3 | change | 17.7 | 2 |
| 47.64 | 32200 | writing | 0 | 8.2 | 5.6 | change | 5.2 | 1 |
| 54.46 | 37600 | principles | 0 | 5.2 | 7.4 | change | 3.3 | 1 |
| 56.55 | 38100 | principles | 0 | 24.2 | 16.1 | change | 15.6 | 1 |
| 57.31 | 38800 | principles | 0 | 51.8 | 26 | change | 27.5 | 1 |
| 57.62 | 38800 | principles | 0 | 18.9 | 9.2 | change | 10.7 | 1 |
| 57.87 | 39100 | principles | 0 | 28.1 | 13.8 | change | 15.3 | 1 |

## Strips

- strips/intro.png
- strips/intro-landing.png
- strips/pop-intro-54.png
- strips/pop-intro-52.png
- strips/pop-intro-39.png
- strips/desktop-act-1.png
- strips/desktop-act-2.png
- strips/desktop-act-3.png
- strips/desktop-act-4.png
- strips/desktop-first-60s.png
- strips/pop-desktop-519.png
- strips/native-act-1.png
- strips/native-act-2.png
- strips/native-act-3.png
- strips/native-act-4.png
- strips/native-first-60s.png
- strips/pop-native-554.png
- strips/pop-native-98.png
- strips/pop-native-560.png
- strips/pop-native-429.png
