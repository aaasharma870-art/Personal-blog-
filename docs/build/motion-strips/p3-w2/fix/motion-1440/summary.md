# Motion baseline — 2026-10-02T22:01:03.169Z

Base http://localhost:3161 · Chromium 141.0.7390.37 headless · 4 CPUs · screencast everyNthFrame=1.

> Headless Chromium rasterises in software (SwiftShader) on a few CPUs and pays for the screencast readback, so absolute frame times are pessimistic vs a real laptop/phone GPU. Read them as RELATIVE hotspots: which sections and transitions are worst. "busy∩jank %" = share of >33.4 ms frames that overlap a long animation frame in which the main thread really worked (script + style/layout/paint >= half the frame, or a >50 ms task); low = the frame was raster/composite-bound (the LoAF is the main thread waiting on the compositor), high = main-thread script/style/layout. "paint suspects" = what the section holds that is costly to raster (filters, blend, masks, canvas, video, image megapixels, infinite animations).

## Runs

| run | viewport | lenis | secs | rAF frames | fps | mean ms | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | LoAF block ms | busy∩jank % | CLS total | CLS (session) | pops | shots |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| desktop | 1440x900 | on | 77.7 | 989 | 12.7 | 78.6 | 16.7 | 300 | 566.6 | 39.3 | 35.1 | 1033.3 | 355 | 933 | 3.9 | 0.0039 | 0.0016 | 3 | 487 |
| native | 1440x900 | off | 71 | 640 | 9 | 111 | 50 | 416.7 | 749.9 | 51.7 | 45.2 | 1333.3 | 282 | 634 | 2.7 | 0.0152 | 0.0134 | 30 | 621 |

## Top 10 hotspots (by mean frame time; rm excluded)

| # | run | where | frames | fps | mean | p95 | p99 | >50 % | max | mean / run mean | LoAF block ms | likely cause |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | native | principles | 7 | 1.6 | 638.1 | 966.6 | 966.6 | 100 | 966.6 | 5.7 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 98.4% waiting for the compositor — on screen: 7 will-change [while scrolling: raster 912.4 ms/s, 6.9 paints/s — repainting: #document ×7; div.act-card-stage.relative.flex in #act-4 ×4 \| idle 60.1 fps, raster 0 ms/s, 0 paints/s] |
| 2 | native | about | 7 | 3 | 328.6 | 1333.3 | 1333.3 | 85.7 | 1333.3 | 3 | 117 | raster/composite-bound: only 16.7% of janky frames overlap real main-thread work; the LoAFs are 92.4% waiting for the compositor — on screen: 1 mask [while scrolling: raster 643.5 ms/s, 32.2 paints/s — repainting: #document ×7; div.act-card-stage.relative.flex in #act-2 ×6 \| idle 60.8 fps, raster 0 ms/s, 0 paints/s] |
| 3 | desktop | principles | 10 | 3.3 | 305 | 500 | 500 | 100 | 500 | 3.9 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.4% waiting for the compositor — on screen: 7 will-change [while scrolling: raster 1066.6 ms/s, 12.8 paints/s — repainting: #document ×10; div.act-card-stage.relative.flex in #act-4 ×10 \| idle 60.1 fps, raster 0 ms/s, 0 paints/s] |
| 4 | native | act-2 | 15 | 3.7 | 272.2 | 749.9 | 749.9 | 66.7 | 749.9 | 2.5 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99% waiting for the compositor — on screen: 2 filter, 3 mask, 20 will-change, 12 infinite anims, 4.7 MP of images [while scrolling: raster 491.3 ms/s, 24.5 paints/s — repainting: #document ×14; div.act-card-stage.relative.flex in #act-2 ×6 \| idle 60.3 fps, raster 0 ms/s, 0 paints/s] |
| 5 | native | journey | 12 | 3.9 | 254.2 | 500 | 500 | 91.7 | 500 | 2.3 | 28 | raster/composite-bound: only 18.2% of janky frames overlap real main-thread work; the LoAFs are 96.4% waiting for the compositor — on screen: 1 mask, 1 will-change, 0.8 MP of images [while scrolling: raster 671.2 ms/s, 22.3 paints/s — repainting: #document ×12; div.act-card-stage.relative.flex in #act-2 ×9 \| idle 0.5 fps, raster 18.6 ms/s, 0 paints/s] |
| 6 | native | act-1 | 24 | 4.2 | 240.3 | 766.7 | 816.7 | 66.7 | 816.7 | 2.2 | 297 | raster/composite-bound: only 12.5% of janky frames overlap real main-thread work; the LoAFs are 91.8% waiting for the compositor — on screen: 4 mask, 18 will-change, 14 infinite anims, 2.3 MP of images [while scrolling: raster 458.3 ms/s, 18.9 paints/s — repainting: #document ×21; div.absolute.inset-0.origin-center in #top ×11 \| idle 24 fps, raster 0 ms/s, 0 paints/s] |
| 7 | desktop | kill-list | 11 | 4.3 | 230.3 | 450 | 450 | 100 | 450 | 2.9 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.3% waiting for the compositor — on screen: 1 mask, 3 will-change, 0.3 MP of images [while scrolling: raster 928.1 ms/s, 19.3 paints/s — repainting: #document ×11; div.relative.@container.will-change-[transform,opacity] in #header ×11 \| idle 60.3 fps, raster 0 ms/s, 0 paints/s] |
| 8 | native | beyond | 23 | 4.5 | 221 | 466.7 | 600 | 87 | 600 | 2 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.7% waiting for the compositor — on screen: 6 mask, 3 MP of images [while scrolling: raster 552.2 ms/s, 24.8 paints/s — repainting: #document ×23; div.act-card-stage.relative.flex in #act-3 ×16 \| idle 60.1 fps, raster 0 ms/s, 0 paints/s] |
| 9 | desktop | act-1 | 25 | 4.5 | 220 | 366.7 | 700 | 88 | 700 | 2.8 | 238 | raster/composite-bound: only 13% of janky frames overlap real main-thread work; the LoAFs are 93.8% waiting for the compositor — on screen: 4 mask, 18 will-change, 14 infinite anims, 2.3 MP of images [while scrolling: raster 591.8 ms/s, 23.8 paints/s — repainting: #document ×23; div.act-card-stage.relative.flex in #act-1 ×15 \| idle 24 fps, raster 0 ms/s, 0 paints/s] |
| 10 | desktop | about | 9 | 4.6 | 218.5 | 400 | 400 | 88.9 | 400 | 2.8 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 96.6% waiting for the compositor — on screen: 1 mask [while scrolling: raster 757.1 ms/s, 26.4 paints/s — repainting: #document ×9; div.act-card-stage.relative.flex in #act-2 ×9 \| idle 60.8 fps, raster 0 ms/s, 0 paints/s] |

## Idle probe (desktop: parked 2.5 s on each section, then 1.5 s traced standing still; high raster with few paints = a raster-heavy layer, many paints/s = continuous animation)

| section | idle fps | raster ms/s | paints/s | paint ms/s | style+layout ms/s | rAF JS ms/s | top repainting nodes |
|---|---|---|---|---|---|---|---|
| top | 37.1 | 155.9 | 4.7 | 2.9 | 1.3 | 15.6 | #document ×4; video.absolute.inset-0.size-full ×3 |
| act-1 | 24 | 0 | 0 | 0 | 5.4 | 11.8 |  |
| about | 60.8 | 0 | 0 | 0 | 16.1 | 36.8 |  |
| journey | 0.5 | 18.6 | 0 | 0 | 1.1 | 1.4 |  |
| act-2 | 60.3 | 0 | 0 | 0 | 0 | 20.6 |  |
| work | 60.4 | 0 | 0 | 0 | 0 | 17.6 |  |
| trading-algos | 60.6 | 0 | 0 | 0 | 14.2 | 33.2 |  |
| optuna-screener | 60.2 | 0 | 0 | 0 | 13.3 | 31.7 |  |
| experiment | 60.1 | 0 | 0 | 0 | 0 | 16.2 |  |
| systems | 60.5 | 0 | 0 | 0 | 0 | 16.5 |  |
| kill-list | 60.3 | 0 | 0 | 0 | 0 | 18.3 |  |
| films | 60.6 | 0 | 0 | 0 | 0 | 19.7 |  |
| act-3 | 60.6 | 0 | 0 | 0 | 0 | 18 |  |
| beyond | 60.1 | 0 | 0 | 0 | 0 | 18.7 |  |
| writing | 60.6 | 0 | 0 | 0 | 0 | 17.6 |  |
| voices | 60 | 0 | 0 | 0 | 0 | 18.2 |  |
| act-4 | 60.4 | 0 | 0 | 0 | 0 | 19.1 |  |
| principles | 60.1 | 0 | 0 | 0 | 0 | 16.2 |  |
| contact | 60.6 | 0 | 0 | 0 | 0 | 17.7 |  |
| credits | 60.1 | 0 | 0 | 0 | 14.5 | 33.6 |  |

## desktop — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 9 | 6.1 | 164.8 | 16.7 | 799.9 | 799.9 | 33.3 | 33.3 | 799.9 | 3 | 0 | 0 | 0 | 294.6 | 19.6 | #document ×11; div#act-1-program.relative.px-gutter.pt-tier-group in #act-1 ×8 |  | 1 filter, 1 blend, 1 mask, 5 will-change, 2.3 MP of images |
| act-1 | 25 | 4.5 | 220 | 233.3 | 366.7 | 700 | 92 | 88 | 700 | 22 | 238 | 13 | 0 | 591.8 | 23.8 | #document ×23; div.act-card-stage.relative.flex in #act-1 ×15 | user-callback:IntersectionObserverCallback @ 17uxrkbdeaanq.js (278 ms) | 4 mask, 18 will-change, 14 infinite anims, 2.3 MP of images |
| about | 9 | 4.6 | 218.5 | 216.7 | 400 | 400 | 88.9 | 88.9 | 400 | 8 | 0 | 0 | 0 | 757.1 | 26.4 | #document ×9; div.act-card-stage.relative.flex in #act-2 ×9 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (30 ms) | 1 mask |
| journey | 16 | 5.2 | 192.7 | 150.1 | 616.6 | 616.6 | 93.8 | 93.8 | 616.6 | 14 | 156 | 13.3 | 0 | 811.2 | 34.1 | #document ×16; div.act-card-stage.relative.flex in #act-2 ×16 | resolve-promise:Promise.resolve @ 1vb142oniqzf6.js (180 ms) | 1 mask, 1 will-change, 0.8 MP of images |
| act-2 | 32 | 6.7 | 149.5 | 116.7 | 399.9 | 500 | 84.4 | 84.4 | 500 | 26 | 121 | 14.8 | 0 | 745.9 | 39.3 | #document ×24; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×20 | user-callback:IdleRequestCallback @ 1zum7z4o80845.js i (250 ms) | 2 filter, 3 mask, 20 will-change, 12 infinite anims, 4.7 MP of images |
| work | 19 | 7.3 | 137.7 | 116.7 | 316.7 | 316.7 | 89.5 | 84.2 | 316.7 | 17 | 0 | 0 | 0 | 831.6 | 38.6 | #document ×14; div.act-card-stage.relative.flex in #act-2 ×11 | user-callback:IdleRequestCallback @ 1zum7z4o80845.js i (65 ms) | 3 filter, 1 blend, 2 mask, 2 will-change, 1.6 MP of images |
| trading-algos | 16 | 5.8 | 171.9 | 133.4 | 583.3 | 583.3 | 87.5 | 81.3 | 583.3 | 13 | 0 | 0 | 0.0001 | 812 | 36.7 | #document ×15; div.relative.sm:overflow-hidden.sm:rounded-frame in #work ×15 | user-callback:IdleRequestCallback @ 1zum7z4o80845.js i (51 ms) | 2 filter, 0.2 MP of images |
| optuna-screener | 29 | 7 | 141.9 | 116.7 | 333.4 | 349.9 | 89.7 | 72.4 | 349.9 | 23 | 0 | 0 | 0.001 | 821.6 | 25.3 | #document ×25; div.stage-window in #trading-algos ×18 | user-callback:IdleRequestCallback @ 1zum7z4o80845.js i (59 ms) | 2 filter, 1.2 MP of images |
| experiment | 17 | 12.4 | 80.4 | 83.3 | 200 | 200 | 76.5 | 64.7 | 200 | 10 | 0 | 0 | 0 | 773.5 | 34.4 | #document ×12; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×9 | user-callback:FrameRequestCallback @ 1rezhhvr7fq6o.js v (5 ms) |  |
| systems | 17 | 6.4 | 156.9 | 133.3 | 466.6 | 466.6 | 88.2 | 82.4 | 466.6 | 15 | 0 | 0 | 0 | 867.8 | 22.9 | #document ×15; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×12 | user-callback:FrameRequestCallback @ 1rezhhvr7fq6o.js v (14 ms) | 1 mask, 1 will-change, 1 MP of images |
| kill-list | 11 | 4.3 | 230.3 | 216.6 | 450 | 450 | 100 | 100 | 450 | 11 | 0 | 0 | 0 | 928.1 | 19.3 | #document ×11; div.relative.@container.will-change-[transform,opacity] in #header ×11 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (10 ms) | 1 mask, 3 will-change, 0.3 MP of images |
| films | 440 | 27.6 | 36.2 | 16.7 | 166.7 | 333.4 | 12.5 | 10.7 | 516.7 | 47 | 418 | 10.9 | 0 | 482.7 | 24.7 | #document ×153; svg.pointer-events-none.absolute.inset-0 viewBox=0 0 1778 1000 in #films ×73 | user-callback:IdleRequestCallback @ 1zum7z4o80845.js i (169 ms) | 4 will-change, 3.9 MP of images |
| act-3 | 98 | 18.8 | 53.2 | 16.7 | 233.3 | 550 | 20.4 | 18.4 | 550 | 19 | 0 | 0 | 0 | 502.4 | 29.5 | #document ×44; div.stage-window in #beyond ×42 | user-callback:FrameRequestCallback @ 1rezhhvr7fq6o.js v (5 ms) | 1 filter, 3 mask, 6 will-change, 2 MP of images |
| beyond | 24 | 4.9 | 204.2 | 149.9 | 616.6 | 866.7 | 91.7 | 83.3 | 866.7 | 21 | 0 | 0 | 0 | 754.7 | 26.1 | #document ×23; div.act-card-stage.relative.flex in #act-3 ×19 | user-callback:FrameRequestCallback @ 3dewhjypacr5m.js t (11 ms) | 6 mask, 3 MP of images |
| writing | 32 | 11.6 | 86.5 | 99.9 | 150 | 166.7 | 81.3 | 71.9 | 166.7 | 25 | 0 | 0 | 0.0012 | 794.8 | 65.4 | #document ×30; div.act-card-stage.relative.flex in #act-4 ×27 | user-callback:FrameRequestCallback @ 2gtmnwptgq-6o.js (10 ms) | 4 mask, 3 will-change |
| voices | 31 | 16.6 | 60.2 | 33.2 | 183.4 | 333.3 | 45.2 | 38.7 | 333.3 | 12 | 0 | 0 | 0 | 849.1 | 105 | #document ×30; div.act-card-stage.relative.flex in #act-4 ×25 | user-callback:IdleRequestCallback @ 1zum7z4o80845.js i (32 ms) | 2 will-change, 2.3 MP of images |
| act-4 | 88 | 18.1 | 55.1 | 16.7 | 233.4 | 566.6 | 25 | 20.5 | 566.6 | 19 | 0 | 0 | 0 | 580.2 | 25.2 | #document ×27; div.rdr2-module__R8wI0W__campSticky in #voices ×25 | user-callback:FrameRequestCallback @ 3iq4ltb5_88fz.js f (13 ms) | 2 canvas, 3 mask, 26 will-change, 21 infinite anims, 2.3 MP of images |
| principles | 10 | 3.3 | 305 | 350 | 500 | 500 | 100 | 100 | 500 | 10 | 0 | 0 | 0.0016 | 1066.6 | 12.8 | #document ×10; div.act-card-stage.relative.flex in #act-4 ×10 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (10 ms) | 7 will-change |
| contact | 3 | 1.5 | 672.2 | 583.3 | 1033.3 | 1033.3 | 100 | 100 | 1033.3 | 3 | 0 | 0 | 0 | 864.3 | 10.4 | #document ×3; div.act-card-stage.relative.flex in #act-4 ×3 |  | 4 mask, 0.9 MP of images |
| credits | 63 | 14.9 | 67.2 | 50.1 | 133.4 | 599.9 | 71.4 | 55.6 | 599.9 | 37 | 0 | 0 | 0 | 478.6 | 13 | #document ×29; div.stage-cam ×15 | user-callback:FrameRequestCallback @ 2gtmnwptgq-6o.js (6 ms) | 1 will-change |

### desktop — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 450→3283 | 29 | 4.6 | 215.5 | 216.7 | 400 | 700 | 86.2 | 700 | 26 | 238 | 11.5 |
| act-2 | 7015→9355 | 35 | 6.7 | 149 | 116.7 | 399.9 | 500 | 85.7 | 500 | 30 | 121 | 13.3 |
| act-3 | 28472→30632 | 100 | 16.3 | 61.5 | 16.7 | 316.6 | 616.6 | 20 | 616.6 | 22 | 0 | 0 |
| act-4 | 38532→40872 | 91 | 16.1 | 62.1 | 16.7 | 266.6 | 566.6 | 23.1 | 566.6 | 23 | 0 | 0 |

### desktop — longest animation frames (LoAF total 63413 ms, main-thread work 1708 ms, blocking 933 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 71.48 | contact | 1010 | 0 | 1 | 1 | 0 | (no script) |  |
| 56.66 | beyond | 881 | 0 | 5 | 5 | 0 | (no script) |  |
| 0.68 | top | 782 | 0 | 1 | 1 | 0 | (no script) |  |
| 3.46 | act-1 | 688 | 0 | 1 | 1 | 0 | (no script) |  |
| 10.7 | journey | 618 | 0 | 1 | 1 | 0 | (no script) |  |

### desktop — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 1.48 | act-1 | 294 | 238 | 279 | 1 | 278 | user-callback:IntersectionObserverCallback @ 17uxrkbdeaanq.js 278 ms | `e=>{e.forEach(e=>{let t=H.get(e.target);if(!t)return;let r=e.boundingClientRect;t.visible=` |
| 9.68 | journey | 447 | 156 | 181 | 1 | 180 | resolve-promise:Promise.resolve @ 1vb142oniqzf6.js 180 ms |  |
| 42.19 | films | 168 | 118 | 164 | 2 | 162 | user-callback:IdleRequestCallback @ 1zum7z4o80845.js i 162 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |
| 15.02 | act-2 | 160 | 110 | 158 | 0 | 158 | user-callback:IdleRequestCallback @ 1zum7z4o80845.js i 158 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |
| 12.3 | act-2 | 268 | 11 | 56 | 1 | 55 | user-callback:IdleRequestCallback @ 1zum7z4o80845.js i 55 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |

### desktop — layout shifts (CLS total 0.0039, session 0.0016, 11 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 69.59 | 0.0016 | principles | h3.type-title.text-fg.max-sm:hyphens-auto in #principles ; h3.type-title.text-fg.max-sm:hyphens-auto in #principles ; h3.type-title.text-fg.max-sm:hyphens-auto in #principles |
| 25.02 | 0.001 | optuna-screener | h3.mt-tier-pair.max-w-title.type-title in #optuna-screener |
| 61.56 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 59.82 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 60.85 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 61.28 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 60.41 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 20.39 | 0.0001 | trading-algos | span.scene-caption__film.world-face-idiots in #trading-algos |

### desktop — visual pops (3; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 6.21 | 1900 | act-1 | 18 | 8.2 | 23.8 | change | 18.6 | 1 |
| 6.52 | 1900 | act-1 | 0 | 9.5 | 14.3 | change | 18.1 | 1 |
| 17.12 | 8468 | work | 27 | 17.9 | 4 | change | 28.9 | 1 |

## native — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 10 | 8.2 | 121.7 | 16.7 | 516.7 | 516.7 | 40 | 40 | 516.7 | 3 | 0 | 0 | 0 | 330.5 | 14 | #document ×5; div#act-1-program.relative.px-gutter.pt-tier-group in #act-1 ×3 |  | 1 filter, 1 blend, 1 mask, 5 will-change, 2.3 MP of images |
| act-1 | 24 | 4.2 | 240.3 | 133.4 | 766.7 | 816.7 | 66.7 | 66.7 | 816.7 | 14 | 297 | 12.5 | 0 | 458.3 | 18.9 | #document ×21; div.absolute.inset-0.origin-center in #top ×11 | user-callback:IntersectionObserverCallback @ 3tw7jfo5o-q7k.js (337 ms) | 4 mask, 18 will-change, 14 infinite anims, 2.3 MP of images |
| about | 7 | 3 | 328.6 | 100 | 1333.3 | 1333.3 | 85.7 | 85.7 | 1333.3 | 5 | 117 | 16.7 | 0 | 643.5 | 32.2 | #document ×7; div.act-card-stage.relative.flex in #act-2 ×6 | resolve-promise:Promise.resolve @ 1vb142oniqzf6.js (154 ms) | 1 mask |
| journey | 12 | 3.9 | 254.2 | 266.6 | 500 | 500 | 91.7 | 91.7 | 500 | 11 | 28 | 18.2 | 0 | 671.2 | 22.3 | #document ×12; div.act-card-stage.relative.flex in #act-2 ×9 | user-callback:IdleRequestCallback @ 1zum7z4o80845.js i (83 ms) | 1 mask, 1 will-change, 0.8 MP of images |
| act-2 | 15 | 3.7 | 272.2 | 300 | 749.9 | 749.9 | 73.3 | 66.7 | 749.9 | 10 | 0 | 0 | 0 | 491.3 | 24.5 | #document ×14; div.act-card-stage.relative.flex in #act-2 ×6 | user-callback:IdleRequestCallback @ 1zum7z4o80845.js i (11 ms) | 2 filter, 3 mask, 20 will-change, 12 infinite anims, 4.7 MP of images |
| work | 11 | 5.1 | 195.4 | 116.7 | 750 | 750 | 63.6 | 54.5 | 750 | 6 | 0 | 0 | 0.0134 | 942.4 | 34.4 | #document ×10; div.relative.sm:overflow-hidden.sm:rounded-frame in #work ×9 | user-callback:IdleRequestCallback @ 1zum7z4o80845.js i (25 ms) | 3 filter, 1 blend, 2 mask, 2 will-change, 1.6 MP of images |
| trading-algos | 14 | 5.5 | 180.9 | 116.7 | 733.3 | 733.3 | 92.9 | 78.6 | 733.3 | 12 | 0 | 0 | 0 | 678.2 | 29.2 | #document ×12; div.stage-window in #optuna-screener ×8 | user-callback:IdleRequestCallback @ 1zum7z4o80845.js i (40 ms) | 2 filter, 0.2 MP of images |
| optuna-screener | 31 | 7.2 | 138.7 | 100 | 400 | 666.6 | 80.6 | 74.2 | 666.6 | 22 | 0 | 0 | 0.0001 | 612.8 | 20.5 | #document ×23; div.stage-window in #trading-algos ×11 | user-callback:IdleRequestCallback @ 1zum7z4o80845.js i (122 ms) | 2 filter, 1.2 MP of images |
| experiment | 19 | 14.3 | 70.2 | 49.9 | 266.7 | 266.7 | 52.6 | 36.8 | 266.7 | 8 | 0 | 0 | 0 | 696.1 | 20.3 | #document ×8; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×7 | user-callback:IdleRequestCallback @ 1zum7z4o80845.js i (6 ms) |  |
| systems | 15 | 6.8 | 147.8 | 116.6 | 400 | 400 | 80 | 73.3 | 400 | 12 | 0 | 0 | 0 | 792.2 | 22.6 | #document ×13; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×7 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (11 ms) | 1 mask, 1 will-change, 1 MP of images |
| kill-list | 15 | 5.1 | 194.4 | 116.7 | 566.7 | 566.7 | 53.3 | 53.3 | 566.7 | 8 | 0 | 0 | 0 | 840.7 | 20.9 | #document ×14; div.relative.@container.will-change-[transform,opacity] in #header ×11 |  | 1 mask, 3 will-change, 0.3 MP of images |
| films | 259 | 22.6 | 44.2 | 16.7 | 199.9 | 350 | 22.8 | 17.4 | 516.6 | 45 | 192 | 6.8 | 0 | 538.6 | 35.3 | #document ×154; svg.pointer-events-none.absolute.inset-0 viewBox=0 0 2333 1000 in #films ×77 | user-callback:TimerHandler:setTimeout @ 3nczl85xqg5o6.js (132 ms) | 4 will-change, 3.9 MP of images |
| act-3 | 30 | 8.4 | 118.9 | 83.3 | 316.6 | 433.3 | 70 | 66.7 | 433.3 | 21 | 0 | 0 | 0 | 372.4 | 22.2 | #document ×27; div.act-card-stage.relative.flex in #act-3 ×10 | user-callback:IntersectionObserverCallback @ 3nczl85xqg5o6.js (7 ms) | 1 filter, 3 mask, 6 will-change, 2 MP of images |
| beyond | 23 | 4.5 | 221 | 249.9 | 466.7 | 600 | 91.3 | 87 | 600 | 19 | 0 | 0 | 0.0008 | 552.2 | 24.8 | #document ×23; div.act-card-stage.relative.flex in #act-3 ×16 | user-callback:FrameRequestCallback @ 1rezhhvr7fq6o.js v (5 ms) | 6 mask, 3 MP of images |
| writing | 24 | 9.2 | 109 | 116.6 | 250 | 299.9 | 91.7 | 70.8 | 299.9 | 16 | 0 | 0 | 0.0004 | 643.6 | 57.3 | #document ×23; svg.size-full.overflow-visible.will-change-transform viewBox=0 0 400 500[data-motif=journal-landscape] in #writing ×22 |  | 4 mask, 3 will-change |
| voices | 21 | 10.2 | 97.6 | 83.3 | 250 | 416.7 | 61.9 | 61.9 | 416.7 | 9 | 0 | 0 | 0 | 696.1 | 51.2 | #document ×22; div.act-card-stage.relative.flex in #act-4 ×9 | user-callback:IdleRequestCallback @ 1zum7z4o80845.js i (31 ms) | 2 will-change, 2.3 MP of images |
| act-4 | 32 | 8.3 | 119.8 | 66.7 | 366.6 | 466.7 | 65.6 | 59.4 | 466.7 | 18 | 0 | 0 | 0 | 737.5 | 28.7 | #document ×23; div.rdr2-module__R8wI0W__campSticky in #voices ×9 | user-callback:IdleRequestCallback @ 1zum7z4o80845.js i (19 ms) | 2 canvas, 3 mask, 26 will-change, 21 infinite anims, 2.3 MP of images |
| principles | 7 | 1.6 | 638.1 | 650 | 966.6 | 966.6 | 100 | 100 | 966.6 | 7 | 0 | 0 | 0.0005 | 912.4 | 6.9 | #document ×7; div.act-card-stage.relative.flex in #act-4 ×4 | user-callback:IdleRequestCallback @ 1zum7z4o80845.js i (49 ms) | 7 will-change |
| contact | 3 | 2.5 | 400 | 300.1 | 650 | 650 | 100 | 100 | 650 | 3 | 0 | 0 | 0 | 715 | 15 | #document ×2; div.act-card-stage.relative.flex in #act-4 ×2 | user-callback:IdleRequestCallback @ 1zum7z4o80845.js i (16 ms) | 4 mask, 0.9 MP of images |
| credits | 68 | 13.9 | 72.1 | 50 | 233.3 | 316.7 | 60.3 | 47.1 | 316.7 | 33 | 0 | 0 | 0 | 314.9 | 13.9 | #document ×31; div.stage-cam ×14 | user-callback:IdleRequestCallback @ 1zum7z4o80845.js i (109 ms) | 1 will-change |

### native — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 450→3283 | 25 | 4.3 | 234.7 | 133.3 | 766.7 | 816.7 | 68 | 816.7 | 15 | 297 | 11.8 |
| act-2 | 7015→9355 | 17 | 3.9 | 256.9 | 266.6 | 749.9 | 749.9 | 64.7 | 749.9 | 11 | 0 | 0 |
| act-3 | 28472→30632 | 33 | 7.8 | 128.3 | 83.4 | 316.6 | 433.3 | 69.7 | 433.3 | 25 | 0 | 0 |
| act-4 | 38532→40872 | 34 | 6.3 | 157.8 | 83.3 | 683.3 | 849.9 | 61.8 | 849.9 | 21 | 0 | 0 |

### native — longest animation frames (LoAF total 59591 ms, main-thread work 1612 ms, blocking 634 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 7.96 | about | 1337 | 117 | 155 | 1 | 154 | resolve-promise:Promise.resolve @ 1vb142oniqzf6.js 154 ms |  |
| 62.02 | principles | 946 | 0 | 10 | 1 | 9 | user-callback:IdleRequestCallback @ 1zum7z4o80845.js i 9 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |
| 60.47 | principles | 841 | 0 | 1 | 1 | 0 | (no script) |  |
| 5.74 | act-1 | 814 | 0 | 1 | 1 | 0 | (no script) |  |
| 16.7 | work | 759 | 0 | 10 | 1 | 9 | user-callback:IdleRequestCallback @ 1zum7z4o80845.js i 9 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |

### native — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 2.17 | act-1 | 355 | 297 | 343 | 1 | 342 | user-callback:IntersectionObserverCallback @ 3tw7jfo5o-q7k.js 337 ms | `e=>{e.forEach(e=>{let t=H.get(e.target);if(!t)return;let r=e.boundingClientRect;t.visible=` |
| 7.96 | about | 1337 | 117 | 155 | 1 | 154 | resolve-promise:Promise.resolve @ 1vb142oniqzf6.js 154 ms |  |
| 32.67 | films | 278 | 94 | 133 | 1 | 132 | user-callback:TimerHandler:setTimeout @ 3nczl85xqg5o6.js 132 ms | `()=>{let e=function(){let e=.475*window.innerHeight,t=null;for(let n of R){let r=document.` |
| 12.07 | journey | 240 | 28 | 74 | 0 | 74 | user-callback:IdleRequestCallback @ 1zum7z4o80845.js i 74 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |
| 61.32 | principles | 696 | 0 | 25 | 2 | 23 | user-callback:IdleRequestCallback @ 1zum7z4o80845.js i 8 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |

### native — layout shifts (CLS total 0.0152, session 0.0134, 7 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 17.48 | 0.0134 | work | span.scene-caption__moment.world-face-idiots in #work ; span.scene-caption__moment.world-face-idiots in #work ; span.whitespace-nowrap in #work |
| 50.88 | 0.0008 | beyond | span.whitespace-nowrap in #beyond ; span.scene-caption__sep in #beyond ; span.scene-caption__film.world-face-rdr2 in #beyond |
| 62.01 | 0.0005 | principles | p.world-face-hp.text-center.text-[1rem][data-lettered=hp] in #principles ; span.whitespace-nowrap in #principles ; span.scene-caption__sep in #principles |
| 52.8 | 0.0003 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 53.18 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 24.26 | 0.0001 | optuna-screener | h3.mt-tier-pair.max-w-title.type-title in #optuna-screener |
| 28.96 | 0 | systems | h3.type-heading.text-fg.lg:text-[length:var(--text-lead)] in #systems |

### native — visual pops (30; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 4.13 | 1500 | act-1 | 0 | 2.1 | 9.4 | change | 2.8 | 1 |
| 4.52 | 1600 | act-1 | 0 | 3.5 | 15.5 | change | 4.6 | 1 |
| 5.14 | 1700 | act-1 | 0 | 9.4 | 36.9 | change | 17.9 | 1 |
| 5.51 | 1700 | act-1 | 0 | 13.2 | 47.2 | change | 26.2 | 2 |
| 6.06 | 1700 | act-1 | 0 | 8.7 | 9 | change | 18.5 | 3 |
| 8.61 | 3300 | about | 0 | 13.6 | 3.9 | blank-out | 25.1 | 1 |
| 10.44 | 4100 | journey | 0 | 4 | 64.3 | change | 3 | 1 |
| 10.83 | 4200 | journey | 0 | 7.1 | 114.5 | change | 9 | 1 |
| 11.40 | 5000 | journey | 0 | 7.1 | 22.2 | change | 9.3 | 1 |
| 14.66 | 8100 | act-2 | 0 | 33.2 | 23.4 | change | 45.3 | 1 |
| 14.92 | 8100 | act-2 | 0 | 11.1 | 7.8 | change | 19 | 1 |
| 15.32 | 8100 | act-2 | 0 | 6.5 | 19.5 | change | 12 | 1 |
| 16.82 | 8900 | work | 0 | 6.3 | 100.3 | change | 12.8 | 1 |
| 17.32 | 9200 | work | 0 | 3 | 218.5 | change | 5.7 | 1 |
| 18.80 | 10900 | trading-algos | 0 | 2.9 | 110.1 | change | 4.4 | 1 |
| 18.97 | 10900 | trading-algos | 0 | 12.7 | 477.2 | change | 29.4 | 1 |
| 22.61 | 13800 | optuna-screener | 0 | 15.5 | 5.3 | fill-in | 30.9 | 1 |
| 24.96 | 15900 | optuna-screener | 0 | 4.7 | 5.6 | fill-in | 8.7 | 1 |
| 30.70 | 21300 | kill-list | 0 | 8.4 | 3.7 | fill-in | 9.1 | 1 |
| 33.07 | 23100 | films | 0 | 3.8 | 4.4 | fill-in | 5.4 | 1 |
| 35.49 | 24700 | films | 0 | 8.2 | 15.5 | change | 5.8 | 1 |
| 44.70 | 28700 | act-3 | 0 | 20.9 | 21.1 | change | 34.5 | 1 |
| 46.46 | 29500 | act-3 | 0 | 3.9 | 6 | change | 9.8 | 1 |
| 47.06 | 29500 | beyond | 0 | 16.8 | 41.4 | change | 18.2 | 3 |
| 52.47 | 34500 | writing | 0 | 10 | 1003.3 | change | 7.1 | 2 |
| 52.84 | 34800 | writing | 0 | 2.6 | 105.4 | change | 2.8 | 1 |
| 59.16 | 39600 | act-4 | 0 | 16.6 | 9.7 | change | 37 | 1 |
| 59.59 | 39600 | act-4 | 0 | 21 | 12.3 | change | 56.6 | 2 |
| 61.70 | 40800 | principles | 0 | 22.4 | 47.9 | change | 21.2 | 1 |
| 62.58 | 40800 | principles | 0 | 72 | 50.8 | change | 42.8 | 3 |

## Strips

- strips/desktop-act-1.png
- strips/desktop-act-2.png
- strips/desktop-act-3.png
- strips/desktop-act-4.png
- strips/desktop-first-60s.png
- strips/pop-desktop-88.png
- strips/pop-desktop-25.png
- strips/pop-desktop-24.png
- strips/native-act-1.png
- strips/native-act-2.png
- strips/native-act-3.png
- strips/native-act-4.png
- strips/native-first-60s.png
- strips/pop-native-553.png
- strips/pop-native-115.png
- strips/pop-native-547.png
- strips/pop-native-192.png
