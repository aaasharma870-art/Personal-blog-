# Motion baseline — 2026-10-02T19:12:14.704Z

Base http://localhost:3161 · Chromium 141.0.7390.37 headless · 4 CPUs · screencast everyNthFrame=1.

> Headless Chromium rasterises in software (SwiftShader) on a few CPUs and pays for the screencast readback, so absolute frame times are pessimistic vs a real laptop/phone GPU. Read them as RELATIVE hotspots: which sections and transitions are worst. "busy∩jank %" = share of >33.4 ms frames that overlap a long animation frame in which the main thread really worked (script + style/layout/paint >= half the frame, or a >50 ms task); low = the frame was raster/composite-bound (the LoAF is the main thread waiting on the compositor), high = main-thread script/style/layout. "paint suspects" = what the section holds that is costly to raster (filters, blend, masks, canvas, video, image megapixels, infinite animations).

## Runs

| run | viewport | lenis | secs | rAF frames | fps | mean ms | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | LoAF block ms | busy∩jank % | CLS total | CLS (session) | pops | shots |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| desktop | 1024x768 | on | 71 | 1257 | 17.7 | 56.5 | 16.7 | 200.1 | 350 | 35.2 | 29.4 | 949.8 | 382 | 1005 | 2.9 | 0.0052 | 0.0015 | 5 | 703 |
| native | 1024x768 | off | 63.6 | 1004 | 15.8 | 63.3 | 16.8 | 249.9 | 416.7 | 36.3 | 29.9 | 966.7 | 302 | 438 | 3.8 | 1.3884 | 1.3828 | 32 | 836 |

## Top 10 hotspots (by mean frame time; rm excluded)

| # | run | where | frames | fps | mean | p95 | p99 | >50 % | max | mean / run mean | LoAF block ms | likely cause |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | native | principles | 10 | 3 | 328.3 | 966.7 | 966.7 | 80 | 966.7 | 5.2 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 98.6% waiting for the compositor — on screen: 7 will-change [while scrolling: raster 915.9 ms/s, 14.9 paints/s — repainting: #document ×10; div.rdr2-module__R8wI0W__campSticky in #voices ×8 \| idle 60.6 fps, raster 0 ms/s, 0 paints/s] |
| 2 | desktop | principles | 14 | 4.2 | 240.5 | 400 | 400 | 92.9 | 400 | 4.3 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.2% waiting for the compositor — on screen: 7 will-change [while scrolling: raster 1058.3 ms/s, 18.1 paints/s — repainting: div.act-card-stage.relative.flex in #act-4 ×15; div.rdr2-module__R8wI0W__campSticky in #voices ×15 \| idle 60.6 fps, raster 0 ms/s, 0 paints/s] |
| 3 | native | journey | 15 | 5.2 | 191.1 | 483.4 | 483.4 | 100 | 483.4 | 3 | 0 | raster/composite-bound: only 6.7% of janky frames overlap real main-thread work; the LoAFs are 99.1% waiting for the compositor — on screen: 1 mask, 1 will-change, 0.6 MP of images [while scrolling: raster 584.3 ms/s, 33.5 paints/s — repainting: #document ×15; div.act-card-stage.relative.flex in #act-2 ×12 \| idle 38.5 fps, raster 33.2 ms/s, 2 paints/s] |
| 4 | desktop | about | 11 | 5.6 | 178.8 | 350 | 350 | 100 | 350 | 3.2 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 98.3% waiting for the compositor — on screen: 1 mask [while scrolling: raster 834.9 ms/s, 32 paints/s — repainting: #document ×11; div.act-card-stage.relative.flex in #act-2 ×11 \| idle 60.2 fps, raster 0 ms/s, 0 paints/s] |
| 5 | desktop | systems | 12 | 6.3 | 158.3 | 266.7 | 266.7 | 100 | 266.7 | 2.8 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 98.9% waiting for the compositor — on screen: 1 mask, 1 will-change, 0.6 MP of images [while scrolling: raster 866.8 ms/s, 30.5 paints/s — repainting: #document ×12; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×11 \| idle 59.7 fps, raster 0 ms/s, 0 paints/s] |
| 6 | native | beyond | 29 | 6.4 | 156.9 | 416.7 | 433.3 | 82.8 | 433.3 | 2.5 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.4% waiting for the compositor — on screen: 6 mask, 2.3 MP of images [while scrolling: raster 473.4 ms/s, 29.5 paints/s — repainting: #document ×27; div.act-card-stage.relative.flex in #act-3 ×21 \| idle 60.3 fps, raster 0 ms/s, 0 paints/s] |
| 7 | native | act-1 | 30 | 6.5 | 153.9 | 466.6 | 533.3 | 83.3 | 533.3 | 2.4 | 127 | raster/composite-bound: only 7.7% of janky frames overlap real main-thread work; the LoAFs are 94.2% waiting for the compositor — on screen: 4 mask, 18 will-change, 14 infinite anims, 1.2 MP of images [while scrolling: raster 352 ms/s, 23.2 paints/s — repainting: #document ×25; div.act-card-stage.relative.flex in #act-1 ×10 \| idle 49.2 fps, raster 0 ms/s, 0 paints/s] |
| 8 | desktop | journey | 15 | 6.7 | 150 | 400 | 400 | 73.3 | 400 | 2.7 | 89 | raster/composite-bound: only 14.3% of janky frames overlap real main-thread work; the LoAFs are 92.7% waiting for the compositor — on screen: 1 mask, 1 will-change, 0.6 MP of images [while scrolling: raster 859.1 ms/s, 48.4 paints/s — repainting: #document ×15; div.act-card-stage.relative.flex in #act-2 ×15 \| idle 38.5 fps, raster 33.2 ms/s, 2 paints/s] |
| 9 | native | kill-list | 17 | 7.4 | 135.3 | 416.7 | 416.7 | 70.6 | 416.7 | 2.1 | 0 | raster/composite-bound: only 0% of janky frames overlap real main-thread work; the LoAFs are 99.5% waiting for the compositor — on screen: 1 mask, 3 will-change, 0.1 MP of images [while scrolling: raster 752.6 ms/s, 29.1 paints/s — repainting: #document ×16; div.relative.@container.will-change-[transform,opacity] in #header ×12 \| idle 60.5 fps, raster 0 ms/s, 0 paints/s] |
| 10 | desktop | act-1 | 41 | 7.6 | 130.9 | 350 | 583.4 | 70.7 | 583.4 | 2.3 | 0 | raster/composite-bound: only 2.9% of janky frames overlap real main-thread work; the LoAFs are 99.4% waiting for the compositor — on screen: 4 mask, 18 will-change, 14 infinite anims, 1.2 MP of images [while scrolling: raster 552.5 ms/s, 32.2 paints/s — repainting: #document ×33; div.act-card-stage.relative.flex in #act-1 ×24 \| idle 49.2 fps, raster 0 ms/s, 0 paints/s] |

## Idle probe (desktop: parked 2.5 s on each section, then 1.5 s traced standing still; high raster with few paints = a raster-heavy layer, many paints/s = continuous animation)

| section | idle fps | raster ms/s | paints/s | paint ms/s | style+layout ms/s | rAF JS ms/s | top repainting nodes |
|---|---|---|---|---|---|---|---|
| top | 61.3 | 0 | 0.7 | 0.4 | 3.9 | 21.7 | #document ×1 |
| act-1 | 49.2 | 0 | 0 | 0 | 10.9 | 24.4 |  |
| about | 60.2 | 0 | 0 | 0 | 16 | 33.8 |  |
| journey | 38.5 | 33.2 | 2 | 0.6 | 1.3 | 11.1 | #document ×1; div.sticky.top-[calc(var(--header-h)+1.5rem)] ×1; canvas.absolute.inset-0.size-full ×1 |
| act-2 | 60.6 | 0 | 0 | 0 | 12.9 | 30 |  |
| work | 60 | 0 | 0 | 0 | 0 | 18.1 |  |
| trading-algos | 60.4 | 0 | 0 | 0 | 12.7 | 29.1 |  |
| optuna-screener | 60.2 | 0 | 0 | 0 | 12.4 | 29.1 |  |
| experiment | 60.1 | 0 | 0 | 0 | 0 | 15.5 |  |
| systems | 59.7 | 0 | 0 | 0 | 0 | 15.8 |  |
| kill-list | 60.5 | 0 | 0 | 0 | 0 | 16.4 |  |
| films | 60.2 | 0 | 0 | 0 | 0 | 15.5 |  |
| act-3 | 60.4 | 0 | 0 | 0 | 0 | 15.1 |  |
| beyond | 60.3 | 0 | 0 | 0 | 0 | 16.3 |  |
| writing | 60 | 0 | 0 | 0 | 0 | 17.5 |  |
| voices | 60 | 0 | 0 | 0 | 0 | 17.6 |  |
| act-4 | 59.5 | 0 | 0 | 0 | 22.8 | 42.1 |  |
| principles | 60.6 | 0 | 0 | 0 | 0 | 15.5 |  |
| contact | 60.4 | 0 | 0 | 0 | 13.7 | 31 |  |
| credits | 60.1 | 0 | 0 | 0 | 13.4 | 31 |  |

## desktop — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 13 | 13.4 | 74.4 | 16.7 | 250 | 250 | 38.5 | 30.8 | 250 | 5 | 495 | 20 | 0 | 508 | 49.7 | #document ×15; div#act-1-program.relative.px-gutter.pt-tier-group in #act-1 ×9 | user-callback:IntersectionObserverCallback @ 156sqqmkx2usx.js (537 ms) | 1 filter, 1 blend, 1 mask, 5 will-change, 1.2 MP of images |
| act-1 | 41 | 7.6 | 130.9 | 100 | 350 | 583.4 | 85.4 | 70.7 | 583.4 | 31 | 0 | 2.9 | 0 | 552.5 | 32.2 | #document ×33; div.act-card-stage.relative.flex in #act-1 ×24 | user-callback:TimerHandler:setTimeout (5 ms) | 4 mask, 18 will-change, 14 infinite anims, 1.2 MP of images |
| about | 11 | 5.6 | 178.8 | 133.4 | 350 | 350 | 100 | 100 | 350 | 11 | 0 | 0 | 0 | 834.9 | 32 | #document ×11; div.act-card-stage.relative.flex in #act-2 ×11 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (12 ms) | 1 mask |
| journey | 15 | 6.7 | 150 | 116.7 | 400 | 400 | 93.3 | 73.3 | 400 | 12 | 89 | 14.3 | 0 | 859.1 | 48.4 | #document ×15; div.act-card-stage.relative.flex in #act-2 ×15 | resolve-promise:Promise.resolve @ 00a5balkm-w3j.js (131 ms) | 1 mask, 1 will-change, 0.6 MP of images |
| act-2 | 43 | 10.4 | 95.7 | 66.7 | 233.4 | 316.6 | 81.4 | 72.1 | 316.6 | 32 | 143 | 8.6 | 0 | 769.3 | 78.2 | #document ×38; div.sticky.top-[calc(var(--header-h)+1.5rem)] in #journey ×30 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (228 ms) | 2 filter, 3 mask, 20 will-change, 12 infinite anims, 2.4 MP of images |
| work | 22 | 9 | 110.6 | 100 | 200 | 316.7 | 100 | 90.9 | 316.7 | 21 | 0 | 0 | 0 | 707.3 | 52.6 | #document ×17; div.act-card-stage.relative.flex in #act-2 ×13 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (37 ms) | 3 filter, 1 blend, 2 mask, 2 will-change, 0.8 MP of images |
| trading-algos | 25 | 10 | 100 | 66.6 | 250.1 | 483.3 | 56 | 52 | 483.3 | 13 | 0 | 0 | 0.0015 | 908.8 | 48 | #document ×19; div.stage-window in #optuna-screener ×17 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (32 ms) | 2 filter, 0.1 MP of images |
| optuna-screener | 82 | 15.3 | 65.4 | 50 | 183.3 | 366.7 | 53.7 | 40.2 | 366.7 | 36 | 0 | 0 | 0.0009 | 731.6 | 32.6 | #document ×42; div.stage-window in #trading-algos ×34 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (64 ms) | 2 filter, 0.7 MP of images |
| experiment | 28 | 17.7 | 56.5 | 16.7 | 200 | 250 | 35.7 | 32.1 | 250 | 9 | 0 | 0 | 0 | 817.3 | 47.4 | #document ×18; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×15 | user-callback:FrameRequestCallback @ 2gtmnwptgq-6o.js (5 ms) |  |
| systems | 12 | 6.3 | 158.3 | 150 | 266.7 | 266.7 | 100 | 100 | 266.7 | 12 | 0 | 0 | 0 | 866.8 | 30.5 | #document ×12; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×11 | user-callback:FrameRequestCallback @ 1rezhhvr7fq6o.js v (11 ms) | 1 mask, 1 will-change, 0.6 MP of images |
| kill-list | 17 | 8.2 | 122.5 | 133.2 | 283.4 | 283.4 | 88.2 | 82.4 | 283.4 | 15 | 0 | 0 | 0 | 905.3 | 34.6 | #document ×16; div.relative.@container.will-change-[transform,opacity] in #header ×15 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (5 ms) | 1 mask, 3 will-change, 0.1 MP of images |
| films | 534 | 37.8 | 26.5 | 16.7 | 100 | 166.7 | 10.7 | 8.6 | 233.3 | 47 | 278 | 10.5 | 0 | 403.9 | 52.7 | #document ×285; svg.pointer-events-none.absolute.inset-0 viewBox=0 0 1778 1000 in #films ×112 | user-callback:TimerHandler:setInterval (164 ms) | 4 will-change, 2.2 MP of images |
| act-3 | 105 | 24.8 | 40.3 | 16.7 | 150 | 250 | 24.8 | 20 | 366.7 | 24 | 0 | 0 | 0 | 365.7 | 46.8 | #document ×59; div.stage-window in #beyond ×47 | user-callback:FrameRequestCallback @ 1rezhhvr7fq6o.js v (10 ms) | 1 filter, 3 mask, 6 will-change, 1 MP of images |
| beyond | 35 | 7.8 | 128.6 | 83.4 | 300 | 649.9 | 82.9 | 77.1 | 649.9 | 26 | 0 | 0 | 0.0012 | 736.3 | 37.6 | #document ×34; div.act-card-stage.relative.flex in #act-3 ×29 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (5 ms) | 6 mask, 2.3 MP of images |
| writing | 37 | 14.2 | 70.3 | 66.6 | 133.3 | 133.4 | 81.1 | 54.1 | 133.4 | 23 | 0 | 0 | 0.0005 | 791.9 | 90.4 | #document ×37; div.act-card-stage.relative.flex in #act-4 ×33 | user-callback:FrameRequestCallback @ 1rezhhvr7fq6o.js v (16 ms) | 4 mask, 3 will-change |
| voices | 40 | 23.3 | 42.9 | 16.8 | 166.7 | 183.3 | 27.5 | 20 | 183.3 | 7 | 0 | 0 | 0 | 667.1 | 130.5 | #document ×36; div.act-card-stage.relative.flex in #act-4 ×29 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (16 ms) | 2 will-change, 1.2 MP of images |
| act-4 | 94 | 22.1 | 45.2 | 16.7 | 116.6 | 616.7 | 33 | 25.5 | 616.7 | 22 | 0 | 0 | 0 | 410.8 | 37.6 | #document ×43; div.rdr2-module__R8wI0W__campSticky in #voices ×26 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (11 ms) | 2 canvas, 3 mask, 26 will-change, 21 infinite anims, 1.2 MP of images |
| principles | 14 | 4.2 | 240.5 | 266.7 | 400 | 400 | 100 | 92.9 | 400 | 12 | 0 | 0 | 0.0011 | 1058.3 | 18.1 | div.act-card-stage.relative.flex in #act-4 ×15; div.rdr2-module__R8wI0W__campSticky in #voices ×15 | user-callback:FrameRequestCallback @ 1rezhhvr7fq6o.js v (15 ms) | 7 will-change |
| contact | 2 | 1.5 | 658.3 | 949.8 | 949.8 | 949.8 | 100 | 100 | 949.8 | 2 | 0 | 0 | 0 | 512.7 | 13.7 | #document ×2; div.act-card-stage.relative.flex in #act-4 ×2 | user-callback:IntersectionObserverCallback @ 26z_dkgic0ush.js (9 ms) | 4 mask, 0.5 MP of images |
| credits | 87 | 19.9 | 50.2 | 33.3 | 150.1 | 433.3 | 28.7 | 25.3 | 433.3 | 22 | 0 | 0 | 0 | 540.9 | 10.3 | #document ×23; div.stage-cam ×11 | user-callback:FrameRequestCallback @ 1rezhhvr7fq6o.js v (6 ms) | 1 will-change |

### desktop — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 384→2846 | 45 | 7.8 | 127.8 | 100 | 350 | 583.4 | 73.3 | 583.4 | 36 | 495 | 2.6 |
| act-2 | 6367→8364 | 48 | 10.4 | 95.8 | 66.7 | 233.4 | 316.6 | 72.9 | 316.6 | 38 | 143 | 7.5 |
| act-3 | 26843→28686 | 108 | 22.4 | 44.6 | 16.7 | 183.4 | 250 | 22.2 | 366.7 | 27 | 0 | 0 |
| act-4 | 36445→38442 | 98 | 20.9 | 47.8 | 16.7 | 133.3 | 616.7 | 27.6 | 616.7 | 24 | 0 | 0 |

### desktop — longest animation frames (LoAF total 50067 ms, main-thread work 1960 ms, blocking 1005 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 65.36 | contact | 940 | 0 | 16 | 1 | 15 | user-callback:IntersectionObserverCallback @ 26z_dkgic0ush.js 9 ms | `e=>{let t=i;for(let n of e)n.isIntersecting&&(t=n.target.id);t!==i&&(i=t,r.forEach(e=>e())` |
| 51.08 | beyond | 644 | 0 | 1 | 1 | 0 | (no script) |  |
| 3.35 | act-1 | 578 | 0 | 6 | 1 | 5 | user-callback:TimerHandler:setTimeout 5 ms |  |
| 0.75 | top | 552 | 495 | 538 | 1 | 537 | user-callback:IntersectionObserverCallback @ 156sqqmkx2usx.js 537 ms | `e=>{e.forEach(e=>{let t=H.get(e.target);if(!t)return;let r=e.boundingClientRect;t.visible=` |
| 17.97 | trading-algos | 463 | 0 | 9 | 1 | 8 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i 8 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |

### desktop — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 0.75 | top | 552 | 495 | 538 | 1 | 537 | user-callback:IntersectionObserverCallback @ 156sqqmkx2usx.js 537 ms | `e=>{e.forEach(e=>{let t=H.get(e.target);if(!t)return;let r=e.boundingClientRect;t.visible=` |
| 31.65 | films | 323 | 118 | 165 | 1 | 164 | user-callback:TimerHandler:setInterval 164 ms |  |
| 11.14 | act-2 | 164 | 109 | 154 | 1 | 153 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i 153 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |
| 38.77 | films | 141 | 88 | 133 | 0 | 133 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i 133 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |
| 8.98 | journey | 205 | 89 | 132 | 1 | 131 | resolve-promise:Promise.resolve @ 00a5balkm-w3j.js 131 ms |  |

### desktop — layout shifts (CLS total 0.0052, session 0.0015, 10 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 18.43 | 0.0015 | trading-algos | span.scene-caption__film.world-face-idiots in #trading-algos ; p.scene-caption.mb-tier-group[data-caption=cap.trading-algos][data-caption-world=idiots] in #trading-algos |
| 52.52 | 0.0012 | beyond | span.whitespace-nowrap in #beyond ; span.scene-caption__sep in #beyond ; span.scene-caption__film.world-face-rdr2 in #beyond |
| 62.95 | 0.0011 | principles | span.scene-caption__film.world-face-hp in #principles ; p.scene-caption[data-caption=cap.principles][data-caption-world=hp] in #principles ; h3.type-title.text-fg.max-sm:hyphens-auto in #principles |
| 23.02 | 0.0009 | optuna-screener | h3.mt-tier-pair.max-w-title.type-title in #optuna-screener |
| 54.47 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 54.83 | 0.0001 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 55.92 | 0.0001 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 28.21 | 0 | systems | h3.type-heading.text-fg.lg:text-[length:var(--text-lead)] in #systems |

### desktop — visual pops (5; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 2.45 | 643 | act-1 | 4 | 2.8 | 14.9 | change | 4.6 | 1 |
| 3.55 | 1285 | act-1 | 37 | 3.6 | 18.3 | change | 5.6 | 1 |
| 37.68 | 24378 | films | 27 | 14.5 | 1446.9 | change | 28.2 | 11 |
| 44.75 | 26448 | act-3 | 33 | 13.3 | 9.8 | change | 28 | 1 |
| 62.98 | 37927 | principles | 34 | 9.8 | 108.7 | change | 16.8 | 1 |

## native — per section

| section | frames | fps | mean | p50 | p95 | p99 | >33.4 % | >50 % | max | LoAF n | block ms | busy∩jank % | CLS | raster ms/s | paints/s | top repainting nodes (scroll) | top script | paint suspects |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| top | 13 | 17 | 59 | 33.3 | 233.3 | 233.3 | 30.8 | 23.1 | 233.3 | 3 | 38 | 50 | 0 | 287 | 39.1 | #document ×8; header.fixed.inset-x-0.top-0 in #header ×5 |  | 1 filter, 1 blend, 1 mask, 5 will-change, 1.2 MP of images |
| act-1 | 30 | 6.5 | 153.9 | 116.7 | 466.6 | 533.3 | 86.7 | 83.3 | 533.3 | 23 | 127 | 7.7 | 0 | 352 | 23.2 | #document ×25; div.act-card-stage.relative.flex in #act-1 ×10 | user-callback:IntersectionObserverCallback @ 12p-0lmbeg6on.js (172 ms) | 4 mask, 18 will-change, 14 infinite anims, 1.2 MP of images |
| about | 5 | 4.3 | 230 | 300.1 | 399.9 | 399.9 | 100 | 80 | 399.9 | 5 | 0 | 0 | 0 | 482.6 | 38.3 | #document ×5; div.act-card-stage.relative.flex in #act-2 ×5 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (7 ms) | 1 mask |
| journey | 15 | 5.2 | 191.1 | 150 | 483.4 | 483.4 | 100 | 100 | 483.4 | 12 | 0 | 6.7 | 0.6914 | 584.3 | 33.5 | #document ×15; div.act-card-stage.relative.flex in #act-2 ×12 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (12 ms) | 1 mask, 1 will-change, 0.6 MP of images |
| act-2 | 34 | 10 | 100 | 100 | 266.6 | 266.6 | 70.6 | 67.6 | 266.6 | 24 | 103 | 4.2 | 0.6914 | 643.6 | 65 | #document ×28; div.absolute.inset-x-0.top-0 in #act-2 ×18 | resolve-promise:Promise.resolve @ 00a5balkm-w3j.js (133 ms) | 2 filter, 3 mask, 20 will-change, 12 infinite anims, 2.4 MP of images |
| work | 22 | 10.7 | 93.2 | 66.7 | 250.1 | 250.1 | 72.7 | 59.1 | 250.1 | 13 | 0 | 0 | 0 | 588.3 | 75.1 | #document ×17; div.stage-window in #trading-algos ×13 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (7 ms) | 3 filter, 1 blend, 2 mask, 2 will-change, 0.8 MP of images |
| trading-algos | 28 | 10.3 | 97 | 50 | 316.7 | 500 | 50 | 42.9 | 500 | 13 | 0 | 0 | 0.0018 | 488.9 | 33.5 | #document ×17; div.act-card-stage.relative.flex in #act-2 ×12 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (71 ms) | 2 filter, 0.1 MP of images |
| optuna-screener | 93 | 17.7 | 56.6 | 16.8 | 183.4 | 316.7 | 36.6 | 28 | 316.7 | 24 | 0 | 0 | 0.0009 | 412 | 30.6 | #document ×39; div.stage-window in #trading-algos ×23 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (16 ms) | 2 filter, 0.7 MP of images |
| experiment | 55 | 47.1 | 21.2 | 16.7 | 50 | 99.9 | 7.3 | 3.6 | 99.9 | 2 | 0 | 0 | 0 | 223.7 | 30 | #document ×12; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×8 |  |  |
| systems | 29 | 12.4 | 80.5 | 50 | 250 | 350 | 55.2 | 41.4 | 350 | 13 | 0 | 0 | 0 | 719.2 | 30.9 | #document ×20; div.relative.sm:overflow-hidden.sm:rounded-frame in #systems ×12 |  | 1 mask, 1 will-change, 0.6 MP of images |
| kill-list | 17 | 7.4 | 135.3 | 150 | 416.7 | 416.7 | 70.6 | 70.6 | 416.7 | 12 | 0 | 0 | 0 | 752.6 | 29.1 | #document ×16; div.relative.@container.will-change-[transform,opacity] in #header ×12 | user-callback:TimerHandler:setInterval (5 ms) | 1 mask, 3 will-change, 0.1 MP of images |
| films | 343 | 33.1 | 30.2 | 16.7 | 100 | 216.7 | 13.4 | 11.1 | 450 | 37 | 167 | 10.9 | 0 | 422.7 | 62.3 | #document ×259; svg.pointer-events-none.absolute.inset-0 viewBox=0 0 2333 1000 in #films ×107 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (112 ms) | 4 will-change, 2.2 MP of images |
| act-3 | 64 | 20.1 | 49.7 | 16.7 | 183.3 | 250 | 29.7 | 26.6 | 250 | 18 | 3 | 5.3 | 0 | 351.8 | 36.4 | #document ×40; div.stage-window in #beyond ×13 | event-listener:MessagePort.onmessage @ 3p9eevrhj-twl.js O (5 ms) | 1 filter, 3 mask, 6 will-change, 1 MP of images |
| beyond | 29 | 6.4 | 156.9 | 133.3 | 416.7 | 433.3 | 89.7 | 82.8 | 433.3 | 23 | 0 | 0 | 0.0013 | 473.4 | 29.5 | #document ×27; div.act-card-stage.relative.flex in #act-3 ×21 | user-callback:FrameRequestCallback @ 1rezhhvr7fq6o.js v (7 ms) | 6 mask, 2.3 MP of images |
| writing | 41 | 15.8 | 63.4 | 50 | 133.3 | 166.7 | 61 | 41.5 | 166.7 | 18 | 0 | 0 | 0.0006 | 581.2 | 95 | #document ×41; svg.size-full.overflow-visible.will-change-transform viewBox=0 0 400 500[data-motif=journal-landscape] in #writing ×37 | user-callback:FrameRequestCallback @ 2gtmnwptgq-6o.js (7 ms) | 4 mask, 3 will-change |
| voices | 30 | 17.3 | 57.8 | 50 | 133.3 | 183.3 | 60 | 40 | 183.3 | 14 | 0 | 11.1 | 0 | 606.9 | 70.4 | #document ×28; div.act-card-stage.relative.flex in #act-4 ×13 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (104 ms) | 2 will-change, 1.2 MP of images |
| act-4 | 54 | 16.6 | 60.2 | 33.3 | 250 | 283.3 | 40.7 | 31.5 | 283.3 | 19 | 0 | 0 | 0 | 409.3 | 34.2 | #document ×26; div.rdr2-module__R8wI0W__campSticky in #voices ×12 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (16 ms) | 2 canvas, 3 mask, 26 will-change, 21 infinite anims, 1.2 MP of images |
| principles | 10 | 3 | 328.3 | 316.7 | 966.7 | 966.7 | 90 | 80 | 966.7 | 8 | 0 | 0 | 0.001 | 915.9 | 14.9 | #document ×10; div.rdr2-module__R8wI0W__campSticky in #voices ×8 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (24 ms) | 7 will-change |
| contact | 2 | 1.7 | 575 | 666.7 | 666.7 | 666.7 | 100 | 100 | 666.7 | 2 | 0 | 0 | 0 | 662.6 | 20.9 | #document ×2; footer#credits.relative.isolate.z-(--z-main) in #credits ×1 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (16 ms) | 4 mask, 0.5 MP of images |
| credits | 90 | 18.7 | 53.5 | 33.3 | 249.9 | 350 | 30 | 20 | 350 | 19 | 0 | 0 | 0 | 407.2 | 14.9 | #document ×30; footer#credits.relative.isolate.z-(--z-main) in #credits ×14 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i (16 ms) | 1 will-change |

### native — act-card transitions (scrollY from 0.5 vh before the card to its end)

| card | scrollY | frames | fps | mean | p50 | p95 | p99 | >50 % | max | LoAF n | block ms | busy∩jank % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-1 | 384→2846 | 31 | 6.6 | 151.6 | 116.7 | 466.6 | 533.3 | 83.9 | 533.3 | 25 | 127 | 7.4 |
| act-2 | 6367→8364 | 35 | 9.6 | 103.8 | 100 | 266.6 | 266.6 | 68.6 | 266.6 | 26 | 0 | 0 |
| act-3 | 26843→28686 | 66 | 18.4 | 54.3 | 16.8 | 216.7 | 283.3 | 28.8 | 283.3 | 20 | 3 | 4.8 |
| act-4 | 36445→38442 | 57 | 14.7 | 67.8 | 33.3 | 266.6 | 366.6 | 35.1 | 366.6 | 23 | 0 | 0 |

### native — longest animation frames (LoAF total 45281 ms, main-thread work 1182 ms, blocking 438 ms)

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 55.65 | principles | 969 | 0 | 14 | 1 | 13 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i 8 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |
| 56.64 | principles | 866 | 0 | 17 | 1 | 16 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i 8 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |
| 58.08 | contact | 660 | 0 | 18 | 1 | 17 | user-callback:IntersectionObserverCallback @ 26z_dkgic0ush.js 9 ms | `e=>{let t=i;for(let n of e)n.isIntersecting&&(t=n.target.id);t!==i&&(i=t,r.forEach(e=>e())` |
| 4.86 | act-1 | 530 | 0 | 0 | 0 | 0 | (no script) |  |
| 16.15 | trading-algos | 503 | 0 | 9 | 0 | 9 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i 9 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |

### native — LoAFs with the most main-thread work

| t s | section | dur | block | work | style/layout/paint | script | top script | snippet |
|---|---|---|---|---|---|---|---|---|
| 0.79 | act-1 | 185 | 127 | 173 | 1 | 172 | user-callback:IntersectionObserverCallback @ 12p-0lmbeg6on.js 172 ms | `e=>{e.forEach(e=>{let t=H.get(e.target);if(!t)return;let r=e.boundingClientRect;t.visible=` |
| 7.1 | act-2 | 202 | 103 | 144 | 1 | 143 | resolve-promise:Promise.resolve @ 00a5balkm-w3j.js 133 ms |  |
| 34.83 | films | 84 | 33 | 82 | 1 | 81 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i 81 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |
| 49.43 | voices | 67 | 0 | 41 | 4 | 37 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i 37 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |
| 10.06 | act-2 | 66 | 0 | 26 | 0 | 26 | user-callback:IdleRequestCallback @ 0olxhk6koxkii.js i 26 ms | `()=>{o\|\|(o=!0,e())},r=window;if("function"==typeof r.requestIdleCallback){let e=r.requestI` |

### native — layout shifts (CLS total 1.3884, session 1.3828, 9 shifts)

| t s | value | section | sources |
|---|---|---|---|
| 7.08 | 0.6914 | journey | section#act-2.relative.bg-bg.text-fg[data-section=act-2][data-act-card=seam] in #act-2 |
| 7.29 | 0.6914 | act-2 | section#act-2.relative.bg-bg.text-fg[data-section=act-2][data-act-card=seam] in #act-2 |
| 16.1 | 0.0018 | trading-algos | span.scene-caption__film.world-face-idiots in #trading-algos ; p.scene-caption.mb-tier-group[data-caption=cap.trading-algos][data-caption-world=idiots] in #trading-algos |
| 45.5 | 0.0013 | beyond | span.whitespace-nowrap in #beyond ; span.scene-caption__sep in #beyond ; span.scene-caption__film.world-face-rdr2 in #beyond |
| 55.6 | 0.001 | principles | span.scene-caption__film.world-face-hp in #principles ; p.scene-caption[data-caption=cap.principles][data-caption-world=hp] in #principles ; h3.type-title.text-fg.max-sm:hyphens-auto in #principles |
| 20.87 | 0.0009 | optuna-screener | h3.mt-tier-pair.max-w-title.type-title in #optuna-screener |
| 47.59 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |
| 48.52 | 0.0002 | writing | h3.mt-tier-pair.type-title.text-fg in #writing |

### native — visual pops (32; diff = 96×60 grey mean abs diff > 3× running median and > 2, scroll moved < 40 px; kind: fill-in = flat/blank → content (raster lag under SwiftShader, or a late image), blank-out = content → flat, change = content → other content)

| t s | scrollY | section | dy | diff | x median | kind | area % | frames |
|---|---|---|---|---|---|---|---|---|
| 2.31 | 700 | act-1 | 0 | 2.5 | 15.8 | change | 3.1 | 1 |
| 2.94 | 1600 | act-1 | 0 | 4.6 | 9 | change | 7.2 | 1 |
| 3.21 | 1700 | act-1 | 0 | 8.9 | 10.6 | change | 16.3 | 2 |
| 3.55 | 1700 | act-1 | 0 | 10.7 | 11.9 | change | 22.3 | 1 |
| 6.29 | 3100 | about | 0 | 2.4 | 97.2 | change | 2.6 | 1 |
| 7.59 | 3500 | journey | 0 | 4.2 | 423.6 | change | 10 | 1 |
| 8.49 | 4100 | journey | 0 | 8.2 | 93.1 | change | 9.6 | 1 |
| 8.95 | 4700 | journey | 0 | 6.8 | 8.6 | change | 10 | 1 |
| 11.40 | 7300 | act-2 | 0 | 26.1 | 47.7 | change | 35.7 | 3 |
| 11.99 | 7300 | act-2 | 0 | 7.5 | 4.5 | change | 13.1 | 1 |
| 13.72 | 8200 | work | 0 | 15.6 | 6.2 | change | 17.8 | 1 |
| 14.78 | 9300 | work | 0 | 15.6 | 4.3 | fill-in | 26.3 | 1 |
| 19.04 | 13300 | optuna-screener | 0 | 4.1 | 7.9 | fill-in | 4.2 | 1 |
| 27.24 | 20600 | kill-list | 0 | 5.4 | 5.4 | change | 6.8 | 1 |
| 31.93 | 23700 | films | 0 | 4.6 | 457.6 | change | 4.2 | 1 |
| 32.34 | 23900 | films | 0 | 3.5 | 352.3 | change | 4.6 | 1 |
| 39.89 | 26900 | act-3 | 0 | 2.3 | 34.3 | change | 4 | 2 |
| 41.09 | 27600 | act-3 | 0 | 6.4 | 113 | change | 14.6 | 1 |
| 41.38 | 27600 | act-3 | 0 | 7.4 | 17.1 | change | 17.3 | 1 |
| 41.67 | 27600 | act-3 | 0 | 9 | 8.5 | change | 8.3 | 2 |
| 43.04 | 28100 | beyond | 0 | 6.8 | 3.5 | change | 8.8 | 1 |
| 44.68 | 29800 | beyond | 0 | 19.1 | 21.3 | change | 23.6 | 1 |
| 45.60 | 30800 | beyond | 0 | 2.6 | 8.1 | fill-in | 2.8 | 1 |
| 46.57 | 32000 | beyond | 0 | 6.1 | 145.9 | change | 9.8 | 1 |
| 46.74 | 32100 | writing | 0 | 18.6 | 443.8 | change | 23.4 | 1 |
| 46.97 | 32400 | writing | 0 | 7.4 | 39.9 | change | 6.8 | 2 |
| 47.27 | 32600 | writing | 0 | 2.8 | 13.9 | change | 3.3 | 1 |
| 53.21 | 37400 | act-4 | 0 | 16 | 3.2 | change | 49.3 | 2 |
| 54.61 | 37500 | principles | 0 | 9 | 23.4 | blank-out | 25.6 | 2 |
| 55.88 | 38400 | principles | 0 | 64 | 98.2 | change | 35.8 | 2 |
| 57.49 | 39400 | principles | 0 | 63.4 | 79.1 | change | 37.8 | 1 |
| 58.38 | 40200 | contact | 0 | 52.5 | 34.3 | change | 31.9 | 1 |

## Strips

- strips/desktop-act-1.png
- strips/desktop-act-2.png
- strips/desktop-act-3.png
- strips/desktop-act-4.png
- strips/desktop-first-60s.png
- strips/pop-desktop-372.png
- strips/pop-desktop-463.png
- strips/pop-desktop-638.png
- strips/native-act-1.png
- strips/native-act-2.png
- strips/native-act-3.png
- strips/native-act-4.png
- strips/native-first-60s.png
- strips/pop-native-747.png
- strips/pop-native-756.png
- strips/pop-native-759.png
- strips/pop-native-190.png
