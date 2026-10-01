# Motion baseline — 2026-10-01T13:43:02.985Z

Base http://localhost:3161 · Chromium 141.0.7390.37 headless · 4 CPUs · screencast everyNthFrame=1.

> Headless Chromium rasterises in software (SwiftShader) on a few CPUs and pays for the screencast readback, so absolute frame times are pessimistic vs a real laptop/phone GPU. Read them as RELATIVE hotspots: which sections and transitions are worst. "busy∩jank %" = share of >33.4 ms frames that overlap a long animation frame in which the main thread really worked (script + style/layout/paint >= half the frame, or a >50 ms task); low = the frame was raster/composite-bound (the LoAF is the main thread waiting on the compositor), high = main-thread script/style/layout. "paint suspects" = what the section holds that is costly to raster (filters, blend, masks, canvas, video, image megapixels, infinite animations).

## Runs

| run | viewport | lenis | secs | rAF frames | fps | mean ms | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | LoAF block ms | busy∩jank % | CLS total | CLS (session) | pops | shots |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| native | 1440x900 | off | 78.9 | 636 | 8.2 | 121.3 | 16.7 | 416.7 | 950 | 34.3 | 31 | 15399.4 | 189 | 267 | 2.8 | 0.0026 | 0.0012 | 15 | 366 |

## Top 10 hotspots (by mean frame time; rm excluded)

| # | run | where | frames | fps | mean | p95 | p99 | >50 % | max | mean / run mean | LoAF block ms | likely cause |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | native | principles | 6 | 0.3 | 3152.7 | 15399.4 | 15399.4 | 100 | 15399.4 | 26 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.8% waiting for the compositor — on screen: 5 will-change [while scrolling: raster 1006.7 ms/s, 1.3 paints/s — repainting: #document ×6; div.relative.flex.flex-col in #act-4 ×4] |
| 2 | native | act-1 | 6 | 1.7 | 575 | 1583.2 | 1583.2 | 100 | 1583.2 | 4.7 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.1% waiting for the compositor — on screen: 2 mask, 1 will-change, 1.2 MP of images [while scrolling: raster 684.4 ms/s, 6.7 paints/s — repainting: #document ×6; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×3] |
| 3 | native | journey | 8 | 1.9 | 529.2 | 800 | 800 | 100 | 800 | 4.4 | 39 | raster/composite-bound: only 25% of janky frames overlap real main-thread work; the LoAFs are 95.9% waiting for the compositor — on screen: 1 mask, 1 will-change, 0.8 MP of images [while scrolling: raster 705.1 ms/s, 15.8 paints/s — repainting: #document ×8; div.relative.flex.flex-col in #act-2 ×8] |
| 4 | native | trading-algos | 7 | 3 | 338.1 | 600 | 600 | 100 | 600 | 2.8 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.3% waiting for the compositor — on screen: 2 filter, 0.2 MP of images [while scrolling: raster 636.4 ms/s, 14.4 paints/s — repainting: #document ×7; div.relative.flex.flex-col in #act-2 ×7] |
| 5 | native | act-2 | 11 | 3.9 | 254.5 | 1083.4 | 1083.4 | 72.7 | 1083.4 | 2.1 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 98.9% waiting for the compositor — on screen: 2 filter, 2 mask, 8 will-change, 3.5 MP of images [while scrolling: raster 783.6 ms/s, 18.2 paints/s — repainting: #document ×10; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×5] |
| 6 | native | about | 7 | 4 | 247.6 | 533.2 | 533.2 | 85.7 | 533.2 | 2 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 96.8% waiting for the compositor — on screen: 1 mask [while scrolling: raster 704.5 ms/s, 21.9 paints/s — repainting: #document ×7; div.relative.flex.flex-col in #act-2 ×4] |
| 7 | native | kill-list | 11 | 4.5 | 224.2 | 733.3 | 733.3 | 63.6 | 733.3 | 1.8 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.7% waiting for the compositor — on screen: 1 mask, 3 will-change, 0.3 MP of images [while scrolling: raster 749.6 ms/s, 17 paints/s — repainting: #document ×11; div.relative.@container.will-change-[transform,opacity] in #header ×7] |
| 8 | native | top | 8 | 4.9 | 202.1 | 1000 | 1000 | 62.5 | 1000 | 1.7 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.4% waiting for the compositor — on screen: 1 filter, 1 blend, 1 mask, 5 will-change, 2.3 MP of images [while scrolling: raster 666.2 ms/s, 21 paints/s — repainting: #document ×13; div.relative.px-gutter.pt-tier-group in #act-1 ×9] |
| 9 | native | work | 15 | 5.5 | 183.3 | 416.7 | 416.7 | 73.3 | 416.7 | 1.5 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.7% waiting for the compositor — on screen: 3 filter, 1 blend, 2 mask, 2 will-change, 1.6 MP of images [while scrolling: raster 825.1 ms/s, 28.4 paints/s — repainting: #document ×12; div.relative.sm:overflow-hidden.sm:rounded-frame in #work ×10] |
| 10 | native | systems | 16 | 5.6 | 178.1 | 416.7 | 416.7 | 75 | 416.7 | 1.5 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.1% waiting for the compositor — on screen: 1 mask, 1 will-change, 1 MP of images [while scrolling: raster 904.6 ms/s, 22.1 paints/s — repainting: #document ×16; div.relative.@container.will-change-[transform,opacity] in #header ×9] |

## native — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 8 | 4.9 | 202.1 | 83.3 | 1000 | 1000 | 62.5 | 62.5 | 1000 | 5 | 0 | 0 | 0 | 666.2 | 21 | #document ×13; div.relative.px-gutter.pt-tier-group in #act-1 ×9 |  | 1 filter, 1 blend, 1 mask, 5 will-change, 2.3 MP of images |
| act-1 | 6 | 1.7 | 575 | 466.7 | 1583.2 | 1583.2 | 100 | 100 | 1583.2 | 6 | 0 | 0 | 0 | 684.4 | 6.7 | #document ×6; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×3 | event-listener:#document.onwheel @ 3p9eevrhj-twl.js fO (9 ms) | 2 mask, 1 will-change, 1.2 MP of images |
| about | 7 | 4 | 247.6 | 216.6 | 533.2 | 533.2 | 100 | 85.7 | 533.2 | 3 | 0 | 0 | 0 | 704.5 | 21.9 | #document ×7; div.relative.flex.flex-col in #act-2 ×4 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (30 ms) | 1 mask |
| journey | 8 | 1.9 | 529.2 | 483.3 | 800 | 800 | 100 | 100 | 800 | 8 | 39 | 25 | 0 | 705.1 | 15.8 | #document ×8; div.relative.flex.flex-col in #act-2 ×8 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js (81 ms) | 1 mask, 1 will-change, 0.8 MP of images |
| act-2 | 11 | 3.9 | 254.5 | 250 | 1083.4 | 1083.4 | 72.7 | 72.7 | 1083.4 | 8 | 0 | 0 | 0 | 783.6 | 18.2 | #document ×10; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×5 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (18 ms) | 2 filter, 2 mask, 8 will-change, 3.5 MP of images |
| work | 15 | 5.5 | 183.3 | 183.3 | 416.7 | 416.7 | 86.7 | 73.3 | 416.7 | 12 | 0 | 0 | 0 | 825.1 | 28.4 | #document ×12; div.relative.sm:overflow-hidden.sm:rounded-frame in #work ×10 |  | 3 filter, 1 blend, 2 mask, 2 will-change, 1.6 MP of images |
| trading-algos | 7 | 3 | 338.1 | 283.4 | 600 | 600 | 100 | 100 | 600 | 7 | 0 | 0 | 0 | 636.4 | 14.4 | #document ×7; div.relative.flex.flex-col in #act-2 ×7 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (7 ms) | 2 filter, 0.2 MP of images |
| optuna-screener | 41 | 9.7 | 103.2 | 33.3 | 350 | 399.9 | 43.9 | 41.5 | 399.9 | 16 | 0 | 0 | 0.0012 | 603.1 | 24.1 | #document ×24; div.stage-window in #trading-algos ×16 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (12 ms) | 2 filter, 1.2 MP of images |
| experiment | 58 | 45.8 | 21.8 | 16.7 | 16.8 | 216.7 | 3.4 | 3.4 | 216.7 | 2 | 0 | 0 | 0 | 260.5 | 16.6 | #document ×7; div.absolute.inset-x-0.top-0 in #kill-list ×3 |  |  |
| systems | 16 | 5.6 | 178.1 | 150 | 416.7 | 416.7 | 75 | 75 | 416.7 | 10 | 0 | 0 | 0 | 904.6 | 22.1 | #document ×16; div.relative.@container.will-change-[transform,opacity] in #header ×9 |  | 1 mask, 1 will-change, 1 MP of images |
| kill-list | 11 | 4.5 | 224.2 | 100 | 733.3 | 733.3 | 63.6 | 63.6 | 733.3 | 7 | 0 | 0 | 0 | 749.6 | 17 | #document ×11; div.relative.@container.will-change-[transform,opacity] in #header ×7 | user-callback:FrameRequestCallback @ 21-_nxqm8ngj-.js (5 ms) | 1 mask, 3 will-change, 0.3 MP of images |
| films | 232 | 19.3 | 51.9 | 16.7 | 250 | 333.4 | 26.3 | 22.8 | 583.3 | 53 | 228 | 6.6 | 0 | 663.6 | 28.7 | #document ×135; svg.pointer-events-none.absolute.inset-0 viewBox=0 0 1778 1000 in #films ×43 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js (249 ms) | 4 will-change, 3.9 MP of images |
| act-3 | 87 | 30.2 | 33.1 | 16.7 | 16.8 | 733.3 | 4.6 | 4.6 | 733.3 | 4 | 0 | 0 | 0 | 438.7 | 15.3 | #document ×19; span.block in #header ×11 |  | 1 filter, 2 mask, 6 will-change, 2 MP of images |
| beyond | 60 | 9.7 | 102.8 | 16.7 | 500 | 1249.9 | 33.3 | 28.3 | 1249.9 | 18 | 0 | 0 | 0.0006 | 630.4 | 16.4 | #document ×35; div.stage-window in #beyond ×13 | user-callback:FrameRequestCallback @ 3tsl4njztm8lt.js v (10 ms) | 6 mask, 3 MP of images |
| writing | 18 | 6.4 | 157.4 | 116.7 | 583.4 | 583.4 | 83.3 | 72.2 | 583.4 | 12 | 0 | 0 | 0.0008 | 703.1 | 31.4 | #document ×16; svg.size-full.overflow-visible.will-change-transform viewBox=0 0 400 500[data-motif=journal-landscape] in #writing ×13 | user-callback:FrameRequestCallback @ 21-_nxqm8ngj-.js (12 ms) | 4 mask, 3 will-change |
| voices | 9 | 5.6 | 177.8 | 166.6 | 283.3 | 283.3 | 88.9 | 88.9 | 283.3 | 8 | 0 | 0 | 0 | 717.5 | 14.4 | #document ×8; div.relative.flex.flex-col in #act-4 ×6 |  | 2 will-change, 2.3 MP of images |
| act-4 | 36 | 12.2 | 81.9 | 16.7 | 383.3 | 950 | 30.6 | 19.4 | 950 | 7 | 0 | 0 | 0 | 727.1 | 23.1 | #document ×23; span.block in #act-4 ×9 | user-callback:FrameRequestCallback @ 3tsl4njztm8lt.js v (5 ms) | 2 mask, 5 will-change, 2.3 MP of images |
| principles | 6 | 0.3 | 3152.7 | 766.6 | 15399.4 | 15399.4 | 100 | 100 | 15399.4 | 3 | 0 | 0 | 0 | 1006.7 | 1.3 | #document ×6; div.relative.flex.flex-col in #act-4 ×4 |  | 5 will-change |

### native — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 450→2481 | 7 | 1.9 | 533.3 | 366.7 | 1583.2 | 1583.2 | 100 | 1583.2 | 8 | 0 | 0 |
| act-2 | 6213→8085 | 15 | 4.8 | 206.7 | 150 | 1083.4 | 1083.4 | 66.7 | 1083.4 | 11 | 0 | 0 |
| act-3 | 27162→28512 | 116 | 34 | 29.5 | 16.7 | 16.8 | 283.3 | 4.3 | 733.3 | 6 | 0 | 0 |
| act-4 | 36465→38337 | 38 | 9.5 | 104.8 | 16.7 | 516.7 | 950 | 23.7 | 950 | 10 | 0 | 0 |

### native — longest animation frames (LoAF total 49050 ms, main-thread work 899 ms, blocking 267 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 3.15 | act-1 | 1539 | 0 | 8 | 2 | 6 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 6 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |
| 45.7 | beyond | 1246 | 0 | 3 | 3 | 0 | (no script) |  |
| 11.7 | act-2 | 1096 | 0 | 1 | 1 | 0 | (no script) |  |
| 0.61 | top | 988 | 0 | 2 | 2 | 0 | (no script) |  |
| 56.35 | act-4 | 943 | 0 | 1 | 1 | 0 | (no script) |  |

### native — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 35.15 | films | 149 | 90 | 136 | 2 | 134 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js 134 ms | `i=>{for(let r of i){if(!r.isIntersecting)continue;let i=t.get(r.target);if(!(!i\|\|e.has(i))` |
| 9.08 | journey | 456 | 39 | 135 | 1 | 134 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js 81 ms | `i=>{for(let r of i){if(!r.isIntersecting)continue;let i=t.get(r.target);if(!(!i\|\|e.has(i))` |
| 31.28 | films | 126 | 75 | 117 | 2 | 115 | user-callback:IntersectionObserverCallback @ 0cuac4a3q3k7b.js 115 ms | `i=>{for(let r of i){if(!r.isIntersecting)continue;let i=t.get(r.target);if(!(!i\|\|e.has(i))` |
| 31.41 | films | 180 | 63 | 92 | 1 | 91 | user-callback:TimerHandler:setTimeout @ 0cuac4a3q3k7b.js 91 ms | `()=>{let e=function(){let e=.475*window.innerHeight,t=null;for(let n of z){let i=document.` |
| 5.38 | about | 537 | 0 | 21 | 0 | 21 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O 6 ms | `(){if(b=!1,x){var e=n.unstable_now();C=e;var t=!0;try{e:{v=!1,y&&(y=!1,S(P),P=-1),g=!0;var` |

### native — layout shifts (CLS total 0.0026, session 0.0012, 7 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 21.92 | 0.0012 | optuna-screener | h3.mt-tier-pair.max-w-title.type-title in #optuna-screener |
| 49.61 | 0.0006 | beyond | span.whitespace-nowrap in #beyond ; span.scene-caption__film.world-face-rdr2 in #beyond |
| 53 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 51.66 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 52.41 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 59.25 | 0 | principles | p.world-face-hp.text-center.text-[1rem][data-lettered=hp] in #principles |
| 27.25 | 0 | systems | h3.type-heading.text-fg.lg:text-[length:var(--text-lead)] in #systems ; h3.type-heading.text-fg.lg:text-[length:var(--text-lead)] in #systems ; h3.type-heading.text-fg.lg:text-[length:var(--text-lead)] in #systems |

### native — visual pops (15; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 4.78 | 1000 | act-1 | 0 | 17.5 | 68 | fill-in | 32.8 | 1 |
| 6.77 | 2300 | about | 0 | 6 | 11.7 | change | 6.4 | 1 |
| 7.24 | 2800 | journey | 0 | 6.3 | 8.6 | change | 12.6 | 1 |
| 7.88 | 2800 | journey | 0 | 8.1 | 15.8 | change | 19.3 | 1 |
| 13.72 | 7100 | act-2 | 0 | 22.4 | 7.5 | change | 30.5 | 1 |
| 14.00 | 7100 | work | 0 | 23.4 | 7.8 | change | 38.4 | 1 |
| 25.99 | 17500 | systems | 0 | 36.8 | 5 | fill-in | 37.7 | 1 |
| 28.85 | 20000 | kill-list | 0 | 4.1 | 6.3 | fill-in | 7.2 | 1 |
| 29.29 | 20000 | kill-list | 0 | 7.6 | 11.8 | change | 9.5 | 1 |
| 34.92 | 23400 | films | 0 | 10.2 | 9.8 | change | 7.8 | 1 |
| 43.67 | 27500 | act-3 | 0 | 13.8 | 7.9 | change | 21.7 | 1 |
| 49.70 | 29800 | beyond | 0 | 26.2 | 14.3 | fill-in | 23.9 | 1 |
| 51.54 | 32100 | writing | 0 | 11.2 | 5.8 | change | 12.4 | 1 |
| 64.35 | 38400 | principles | 0 | 23.3 | 3.7 | change | 13 | 1 |
| 71.65 | 38400 | principles | 0 | 36.5 | 5.7 | change | 20.6 | 1 |

## Strips

- strips/native-act-1.png
- strips/native-act-2.png
- strips/native-act-3.png
- strips/native-act-4.png
- strips/native-first-60s.png
- strips/pop-native-365.png
- strips/pop-native-65.png
- strips/pop-native-363.png
- strips/pop-native-148.png
