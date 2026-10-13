# P3-12 final QA evidence

Build under test: `design/three-films` at `ef0a549` ("P3-11 final pass: review fixes"), clean tree, no app code touched in this run.
Base for comparisons: `5aa4587` (pre-Phase-3), worktree `scratchpad/p3-base`, rebuilt for this run (`logs/build-base-5aa4587.txt`).
Cards-probe comparison build: `e91fbd6`, worktree `scratchpad/qa-base`, built for this run (`logs/build-qa-base-e91fbd6.txt`).
Environment: Chromium 141.0.7390.37 (headless shell), 4 CPUs, software GL (SwiftShader), no GPU, localhost server, one browser and one server at a time (3161 = HEAD, 3162 = base or e91fbd6).
Every number below comes from a file in this folder (path given) or from a command whose output is in `logs/`. Where a number does not exist, the line says so. The scripts that produced the JSON are verbatim in `METHODS.md`.

## 1. Gates

| gate | result | source |
|---|---|---|
| `npx tsc --noEmit -p .` | exit 0, no output (4.1 s) | `logs/tsc.txt` |
| `npm run check` | exit 0, `check-manifest: OK (67 warning(s))` | `logs/check.txt` |
| `npx eslint .` | exit 0, no output | `logs/eslint.txt` |
| `npm run build` | exit 0, Next 16.2.9 (Turbopack), 16 routes, compiled in 12.1 s | `logs/build.txt` |
| `RELEASE=1 npm run check` | exit 1, **47 errors, all owner items** | `release.txt` (full printed lists) |

`RELEASE=1` errors, counted from `release.txt`: 40 "Check L2 awaits Aryan's countersignature" media rows (L01 to L23 and their posters except L03/L04/L07/L13, plus SEQ-HALL and SEQ-HALL-end), 1 community-quote gate `[J9 F3]` (Q-PC-1, Q-PC-3, Q-3I-3, Q-RD-1, Q-RD-2), 5 TTS lines awaiting Aryan (tts-lumos, -mischief, -nox, -parley, -solemn), 1 unsigned copy list (107 strings, all 107 wired into the page). 40 + 1 + 5 + 1 = 47. The error lines are identical to `docs/build/p3-reports/P3-11-r3-release.txt` (same 47). Nothing else fails.

## 2. Widths (`widths-head.json`, `widths-base.json`, `compare-head-vs-base.json`)

Method: fresh context per load, `/?skip=intro`, wait for network idle, scripted full scroll (0.8 viewport per 90 ms jump, repeated until the page height is stable), 3 runs per viewport on each build. Touch contexts (`isMobile`, `hasTouch`, iPhone or iPad UA) for 1024x1366, 844x390, 390x844, 320x640 (dpr 2 for the phones).

| viewport | console errors | page errors | hydration errors | failed requests | HTTP >= 400 | h1 | horizontal overflow (scrollWidth - clientWidth) | page height HEAD (base) |
|---|---|---|---|---|---|---|---|---|
| 1440x900 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 44,250 (41,499) |
| 1024x768 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 41,397 (37,916) |
| 1024x1366 touch | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 37,762 / 37,425 / 37,762 (39,043) |
| 844x390 touch | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 39,525 (39,564) |
| 390x844 touch | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 46,356 (46,391) |
| 320x640 touch | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 49,915 (49,968) |

All 18 HEAD runs: 0 console errors, 0 page errors, 0 hydration errors, 0 failed requests. Overflow: scrollWidth equals clientWidth at all six widths; one clipped SVG path (`path.stroke-(--w-storm)`) sits past the right edge but does not scroll the page (the base has the same offender: `widths-base.json`, `offenders`). `qa.js` at 1440 and 1024 (`qa/qa-head-*.json`) agrees: overflow 0 at 320, 390, 1024, 1440; 52 anchors, 0 broken, 0 duplicate ids, sitemap hashes all present; 59 console lines per run, all in the deliberate media-blocked context; 0 hydration errors.

### Phones, tablet and landscape against the base (`compare-head-vs-base.json`)

Not strictly "unchanged except the intended changes". 844x390, 390x844 and 320x640 show the same difference set (rendered text via `innerText`; stable across all runs of each build at 390 and 320, but not at 844x390, where both builds vary between runs, see below):

Intended, per PHASE3-SPEC section 13 (line 1416) and D3-9:
1. capabilities Meta strip: `NATIVE SCROLL • CSS + SVG FIRST • NO WEBGL` became `SMOOTH SCROLL ON DESKTOP (LENIS) • NATIVE SCROLL ON PHONES AND WITH REDUCED MOTION • CSS + SVG FIRST • WEBGL, WHERE SUPPORTED, ONLY FOR SCENE CHANGES`.
2. `systems.pencil.body`: now `Why not just use a pencil? The same question, asked of this page: CSS and SVG first; on desktop, one small WebGL layer only where the scenes change.`
3. The chart-slot placeholder `[ CHART SLOT — DROP A REAL EXPORTED EQUITY CURVE / REPORT HERE ]` no longer renders (twice, trading-algos and optuna-screener). Section heights follow: trading-algos -42 / -61 / -78 px and optuna-screener -43 / -60 / -79 px at 844 / 390 / 320.

Not on the section 13 list (found here, all small, all text):
4. Four act-card loglines now exist in the page text (`acts.act-1..4.logline`). On phones they are the screen-reader-only subtitle: 1x1 px, clipped, no layout (`app/p3/cards.css:127`, `components/sections/act-card/card-shell.tsx:425`), so they change what a screen reader announces, not what a phone shows.
5. Writing caption `ARTHUR MORGAN'S JOURNAL` became `A JOURNAL LIKE ARTHUR MORGAN'S` (`cap.writing`, commit d7a6543, in the unsigned copy list).
6. The credits Higgsfield line gained `minimax_h3` (`(GPT Image 2.5, Kling 3.0, nano_banana_pro, minimax_h3)`); the line is built from media provenance (`components/site/footer.tsx:134`, `lib/media.ts:1364`), not typed.
7. Section heights: systems +18 / +59 / +77 px and credits +27 / +28 / +27 px (the longer pencil body and the credits line), page height -39 / -35 / -53 px at 844 / 390 / 320.

Everything else matches: 390 and 320 have identical text hashes in each build, 20 sections each, h1 1, overflow 0. 844x390 text varies between runs on both builds, 3 different hashes each (`compare-head-vs-base.json`: HEAD `innerText` 25,280 / 25,312 / 25,313 chars, base 24,975 / 24,957 / 24,990), so no single hash is quoted for either; the cause of the variation was not diagnosed. (This sentence earlier said HEAD's was stable, which the JSON contradicts.)

1024x1366 (touch, wide layout, no Lenis / stage / GL): page height 37,762 / 37,425 / 37,762 against 39,043 (-1,281 to -1,618 px). The rendered text drops by about 3,300 characters (`innerText` 21,704 to 21,717 chars against 25,023 to 25,055) because the >= 64rem collapses are closed `<details>` (PHASE3-SPEC 11.5: optuna appendix, the About philosophy note, the credits lists) plus the systems matrix fold (`components/site/capabilities.tsx:106`, P3-11 r2 D3-9: four area rows closed except the first). `textContent` (collapsed text included) is higher in HEAD (28,160 to 28,172 chars against 25,691 to 25,722), so the collapsed text is still in the page. Section height deltas vs base: about +187, journey +41, work -38, trading-algos -44, optuna-screener -1,116, experiment +69, systems +170, kill-list +104, principles +134. The same items 1 to 6 apply. The tablet text is not stable between runs on either build (rotating labels), so no single hash is quoted.

Phone deep links (record only, Phase 4): at 390x844, `/#work /#beyond /#principles /#journey` with and without `?skip=intro`: 2 of 8 land on HEAD and 2 of 8 on the base, same positions (`phone-deeplinks-390-head.json`, `phone-deeplinks-390-base.json`). Not a Phase 3 regression; `#work` overshoots by about 2,000 px, `#beyond` and `#principles` stay at the top.

### Layout shift inside the width sweep (instant jump scroll)

The sweep scrolls by instant 0.8-viewport jumps every 90 ms, much faster than a wheel. CLS per HEAD run (the base in brackets): 1440: 0 / 0.2363 / 0.2363 (0.108 / 0.055 / 0.055); 1024x768: 0.10035 / 0.19813 / 0.19813 (0.11864 x3); 1024x1366: 0 / 0 / 0.03319 (0.05858 x3); phones 0 on both builds. Sources, HEAD:
- 1440 (2 of 3 runs; `e91fbd6` gives the same 0.2363 in 2 of 3 runs and 0.09706 once at 1024, `widths-e91fbd6-jump-cls.json`, so it predates the final pass): at the end of the page `html[data-fonts]` goes `pirates` to `pirates rdr2 idiots` (the per-world face swap), sections above the footer change height in the same frame (beyond +180, writing +97, voices +48, systems +54, work -31, a net +340 px above the footer) and `footer#credits` / `div.stage-scrim` move (`footdbg.cjs` log, METHODS.md). The swap waits for the world's boxes to be off screen, so a reader who jumps to the end before the warm-up ladder finishes gets it at the bottom.
- 1024x768: `div.absolute.inset-0` inside the act-card frame at scrollY 1,842 (0.19813, 2 of 3 runs) or `section#act-2` at scrollY 7,982 (0.09706): pin spacers created while the page is being jumped through.
- 1024x1366: `section#contact` and `footer#credits` (-60 px) at scrollY 36,084: the same face swap on the tablet.
The base has non-zero CLS in the same sweep, but at load (a hero `::before`, 0.055 to 0.119 at 197 to 514 ms), before any scroll. HEAD has none at load.

## 3. Reduced motion and Pause (`modes-rm-*.json`, `modes-paused-*.json`, `qa/qa-head-*.json`)

Method: `reducedMotion: 'reduce'` (RM) or `sessionStorage motion=paused` set before first script (Pause); 1440x900 and 1024x768; 2 loads each; `/?skip=intro`; wait for `window.__pageHydrated`; 2.5 s settle; a 100 px / 110 ms wheel pass over the whole page (390 to 420 notches, 45 to 52 s) sampled every 60 notches; then an 11-section walk (1.5 s each). Deep links: `/#work /#beyond /#principles /#journey`, 3 fresh loads each (2 without `skip`, 1 with), landed = target top within -2..300 px at 5.5 s, stable = moved <= 4 px by 9 s.

| check | RM 1440 | RM 1024 | Pause 1440 | Pause 1024 |
|---|---|---|---|---|
| running animations (rest, wheel samples, 11-section walk) | 0 | 0 | 0 | 0 |
| `<video>` elements / playing | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| media requests / video bytes | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| AudioContext created / running, media `play()` calls, audio requests | 0 / 0, 0, 0 | 0 / 0, 0, 0 | 0 / 0, 0, 0 | 0 / 0, 0, 0 |
| rAF callbacks in 1 s idle, WebGL canvases, Lenis | 0, 0, off | 0, 0, off | 0, 0, off | 0, 0, off |
| CLS at rest / after wheel pass / after walk | 0 / 0 / 0 (both loads) | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 |
| layout shifts after `page:hydrated` | 0 | 0 | 0 | 0 |
| deep links landed / stable | 12 / 12 | 12 / 12 | 12 / 12 | 12 / 12 |
| h1, horizontal overflow, console errors | 1, 0, 0 | 1, 0, 0 | 1, 0, 0 | 1, 0, 0 |

All 48 deep-link loads landed (target top 92 or 93 px, the header offset) and none moved afterwards. `qa.js` agrees: 0 running animations and 0 playing videos in all 11 sections under RM and Pause at both widths; Lenis absent under RM and after Pause (`lenis.reducedBefore` false, `pauseAfter` false; `pauseBefore` false is the known late attach, tool-side).
Triage R01 (deep links under RM and Pause: 2 of 8 and 0 of 4 before) is fixed on desktop: 48 of 48. Phones are untouched, see section 2.

## 4. No JavaScript (`nojs-head.json`, `nojs-base.json`, `nojs-shots/`)

`javaScriptEnabled: false`, `/`, 1440x900, 1024x768, 390x844.

| check | 1440 | 1024 | 390 |
|---|---|---|---|
| `[data-section]` elements with real height (>= 40 px) | 20 of 20 (min 900) | 20 of 20 (min 768) | 20 of 20 (min 721) |
| sections not visible / zero height | 0 / 0 | 0 / 0 | 0 / 0 |
| streamed `div[hidden][id^="S:"]` shown | 19 of 19 | 19 of 19 | 19 of 19 |
| h1 | 1 | 1 | 1 |
| "Skip to the research" link (header fast lane, `href="#work"`, target exists) | present, label reads "Skip to the research" | same | present, label reads "Work" (today's phone label; the long text is in a `display:none` span, the relabel is desktop-wide only) |
| page text (`innerText` chars) / page height | 23,973 / 40,552 | 23,950 / 37,337 | 27,006 / 49,234 |
| horizontal overflow, console errors | 0, 0 | 0, 0 | 0, 0 |
| intro overlay visible | no | no | no |
| act-card pin wrapper height equals its stage (no travel) | 4 of 4 | 4 of 4 | 4 of 4 |

The desktop controls (Egg hunt chip, sound toggle, Director's cut button) render without JS and do nothing there (visible in `nojs-shots/nojs-1440x900-top.jpg`); spec line 1283 only gates them by media query, not by JS. Hidden text elements: 22 / 23 / 33, every one `display:none` from a responsive or disclosure variant (`lg:hidden`, an inactive gauntlet tab panel, a desktop-only caption), none from an armed reveal (opacity or clip). Screenshots in `nojs-shots/` (JPG, long edge <= 1600): the hero, work, journey, principles, contact and credits read at all three widths. A contrast sample (69 / 69 / 68 text elements, `contrastLows`) flags 5 / 5 / 4 elements, all in `principles`: dark brown text on the parchment image, which my background resolver reads as the page's dark colour; the screenshots show them legible, so they are false positives, not a measurement of the parchment. One request is aborted (the first script chunk) and one 1-iteration CSS animation runs at desktop widths (`trail-fog-lift`, finite); the base aborts the same chunk.
The base page without JS is only the hero: 1 of 20 sections with height, 0 of 19 streamed blocks shown, 317 characters, page height equal to the viewport, no skip link (`nojs-base.json`). So the no-JS page is better than today's.
`qa.js` `noJs.allInView` is false at both widths because `html { scroll-behavior: smooth }` animates `scrollTo` while the tool reads (tool-side, as in round 3); my script scrolls instantly.

## 5. LCP and CLS

### Desktop (budget: LCP <= 400 ms, CLS 0)

Three loads per cell, cache off, 4 s settle, same observers as `qa.js`. "armed" = `/` (intro shown), "skip" = `/?skip=intro`.

| width | build | path | LCP per load (ms) | element | CLS at load | source |
|---|---|---|---|---|---|---|
| 1440 | HEAD | armed | 440 / 956 / 1,024 (qa.js: 904 / 948 / 932) | first candidate the h1 span at 440 / 256 / 288 ms; final candidate in loads 2 and 3 is `VIDEO intro-play-loop.webm` | 0.00077 | `modes-normal-1440x900.json`, `qa/qa-head-1440x900.json` |
| 1440 | base | armed | 288 / 292 / 240 | h1 span | 0.00738 | `lcp-base-desktop-1440-armed.json` |
| 1440 | HEAD | skip | 212 / 216 / 288 | h1 span | 0 | `modes-normal-1440x900.json` |
| 1440 | base | skip | 264 / 380 / 312 | h1 span | 0.055 | `lcp-base-desktop-1440-skip.json` |
| 1024 | HEAD | armed | 380 / 972 / 828 (qa.js: 984 / 1,004 / 848) | h1 span 380 / 288 / 236, then the video | 0.00117 | `modes-normal-1024x768.json`, `qa/qa-head-1024x768.json` |
| 1024 | base | armed | 268 / 328 / 264 | h1 span | 0.01599 | `lcp-base-desktop-1024-armed.json` |
| 1024 | HEAD | skip | 228 / 232 / 212 | h1 span | 0 | `modes-normal-1024x768.json` |
| 1024 | base | skip | 248 / 296 / 228 | h1 span | 0.11926 | `lcp-base-desktop-1024-skip.json` |

Reading: with the intro armed the budget is missed at both widths (qa.js method: 1440 904 to 948 ms, 1024 848 to 1,004 ms; my loads 5 of 6 over 400). The h1 candidate itself paints at 236 to 440 ms; the loop video of the intro play screen then arrives as a larger candidate at about 830 to 1,020 ms and becomes the LCP. The base in the same method is 240 to 328 ms. With `?skip=intro` HEAD meets the budget (212 to 288 ms). Headless: the absolute video time includes software decode and compositing, and a real GPU will differ; what is not an artifact is that a second, larger candidate exists. It cannot be settled without a real-laptop trace (triage R26 / R28 ask for one).

CLS, load only: armed 0.00077 (1440) and 0.00117 (1024), from the intro play button's text moving 3 to 5 px at about 0.3 s (`span.intro-lens` in `button#intro-play`); skip 0. Not strictly 0. Scrolling with a wheel (100 px / 110 ms, the `motion.js` pace) over the whole page, 3 loads per width: CLS 0 at 1440 and at 1024 in every run (`modes-normal-*.json`); RM and Pause 0 (section 3). The instant-jump sweep is in section 2.

### Mobile (390x844, intro armed, 4x CPU, 150 ms RTT, 1.6 Mbps down)

Same-session A/B, alternating HEAD, base, HEAD, base, 3 loads per block (`lcp-mobile-head-r1/r2.json`, `lcp-mobile-base-r1/r2.json`). Element on both builds: `IMG hero-sea-mobile.webp`.

| build | LCP per load (ms) | sorted median | mean | CLS |
|---|---|---|---|---|
| HEAD | 1,580 / 1,612 / 1,596 / 2,432 / 1,772 / 1,660 | **1,636** | 1,775 | 0.0142 to 0.0143 |
| base | 1,404 / 1,524 / 1,528 / 1,564 / 1,504 / 1,464 | **1,514** | 1,498 | 0.01419 to 0.0142 |

HEAD is +8.1 % on the median (+12.5 % on the best load), outside the +-5 % bar; without the one 2,432 ms load HEAD's median is 1,612 ms (+6.5 %). `qa.js` mobile on HEAD: 1,436 / 1,628 / 2,416 ms (1440 run) and 1,788 / 2,348 / 1,656 ms (1024 run). The "P3-0 mobile baseline in `docs/build/motion-strips/p3-before/summary.md`" does not exist: that file has desktop and intro frame statistics only, no LCP. The older recorded mobile-lab numbers are `docs/build/FINAL-REPORT.md:233` (qa.js 1,724 / 1,604 / 1,500 ms, qa2 x5 median 1,612 ms, an earlier build and session) and `docs/build/motion-strips/p3-w1/MEASURE.md:168` (mobile LCP 224 ms against base 244 ms, a different, unthrottled method); neither is comparable to the throttled runs above, so the A/B is the controlled number.
Likely cause (bytes, not rendering): the "/" HTML is 1,179,857 B raw against 982,238 (+197,619 B), 202,351 B gz-9 against 170,736 (+31,615 B, +18.5 %), measured on `.next/server/app/index.html`; plus first-load JS +3,612 B and CSS +4,906 B gz. About +40 KB gz over a 1.6 Mbps link is about +200 ms. The +6 KB budget counts JS and CSS only; the HTML growth is not budgeted. The 4x CPU throttle and the link are lab settings, so the size of the gap is a lab number; the byte growth is real.

## 6. Bundle (`bundle-head.json`, `bundle-base.json`)

"/" first load = the scripts and stylesheets the document HTML itself references, zlib level 9 of the served bytes, the method of `docs/build/p3-reports/W3-notes.md` section 3 and `tools/capture/probes/bundle.mjs`.

| build | JS gz | files | CSS gz | files |
|---|---|---|---|---|
| base `5aa4587` (rebuilt) | 439,092 | 19 | 29,433 | 4 |
| HEAD `ef0a549` | 442,704 | 20 | 34,339 | 4 |
| delta | **+3,612** | +1 | **+4,906** | 0 |

Both under the +6,144 B line (headroom 2,532 B JS, 1,238 B CSS). Matches the commit message of ef0a549 (JS +3,612, CSS +4,906) and `p3-r3/TRIAGE.md` (CSS +4,906). The `bundle` probe on HEAD at 1440 passes (`probe-bundle-head-1440.json`): no gsap, ScrollTrigger or lenis marker in the HTML-referenced scripts or in anything a 390x844 phone fetches (23 responses); on desktop they arrive lazily after `load` (50,143 B gz); no raw `requestIdleCallback`. Note the HTML growth above (+31,615 B gz) is outside this budget.

## 7. Cards probe recheck (`cards/cards-alternation.json`, `cards/raw/`)

`node tools/capture/p3-probes.mjs <base> <out> --only=cards --vw=1440x900`, the HEAD copy of the probe (`cards.mjs` is identical at `e91fbd6` and HEAD), five runs per build, alternating HEAD (3161), `e91fbd6` (3162), one server at a time, each run about 95 s.

| run | HEAD `ef0a549` | `e91fbd6` |
|---|---|---|
| 1 | FAIL `scrub` (ignite p .05: damped p 0.0453 vs raw 0.0505, not settled) | pass |
| 2 | FAIL `damping` (the early sample already read raw 1 / phase e) | pass |
| 3 | pass | FAIL `damping` + `scrub` (tintype p 1: 0.9921 vs 1) |
| 4 | pass | pass |
| 5 | pass | FAIL `damping` + `scrub` (ignite p .05: 0.0437 vs 0.0505) |
| passes | **3 of 5** | **3 of 5** |

Both builds fail 2 of 5 on the same two timing-sensitive sub-checks (`scrub` settle within 1.2 s at one p, and the `damping` early sample). The other six sub-checks (pins, stars, impacts, landAt, rm, phone) passed in all 10 runs. HEAD is not worse: `cardsRegression` is false, so no bisect was run. The earlier "4 of 5 on e91fbd6, 0 of 5 on 9c5f6fc" is not reproduced here: the same probe, machine and build give 3 of 5 on both. The probe is flaky under software rendering; the failing sub-check varies per run.

## 8. What was not re-run here

`motion.js` fps / p95 / LoAF tables, the screencasts, the intro idle-task figure (triage R03), the blind-test judges and the director's cut capture are outside this brief; their last numbers are in `docs/build/motion-strips/p3-r3/`. The absolute fps numbers there remain headless-software numbers (R26).

## Files

`logs/` (tsc, check, eslint, build, base and e91fbd6 builds), `release.txt`, `widths-{head,base}.json`, `compare-head-vs-base.json`, `modes-{rm,paused,normal}-*.json`, `nojs-{head,base}.json`, `nojs-shots/`, `qa/`, `lcp-*.json`, `bundle-*.json`, `probe-bundle-head-1440.json`, `phone-deeplinks-390-*.json`, `cards/`, `METHODS.md`.

## Corrections (2026-10-13, after a source check of `docs/build/PHASE3-REPORT.md`)

- Section 2 (844x390 text): fixed in place above. Both builds vary at 844x390.
- Section 2 (layout shift, instant jump): the `footdbg.cjs` log behind the "type swap" and "pin spacers" causes and the "net +340 px" is **not stored** in this folder (only the script is, in `METHODS.md`). The section deltas listed (+180, +97, +48, +54, -31) sum to +348, not +340. Treat the font-swap and pin-spacer causes as hypotheses. The stored evidence is in `widths-head.json`: at 1440 the node that moves is `div.stage-scrim` in `footer#credits`, 563 to 900 px tall (scrollY 43,412 in run 2, scrollY 0 in run 3); at 1024x768 the 0.19813 shift has an identical rect before and after.
- Section 5 (mobile LCP): "Likely cause (bytes, not rendering)" is an untested hypothesis. No run isolates bytes. About +200 ms is an upper bound (all JS and CSS counted as on the critical path); the measured median gap is 122 ms (1,636 against 1,514) and the best-load gap is 176 ms (1,580 against 1,404).
- Section 5 (desktop LCP): the QA run's own loads and the `qa.js` loads differ. In load 1 of each width (440 ms at 1440, 380 ms at 1024) no video candidate fired, so the video was the LCP in 4 of 6 own loads and 6 of 6 `qa.js` loads. Pooled: 440 to 1,024 ms at 1440, 380 to 1,004 ms at 1024.
- Section 7 (cards probe): the "HEAD is not worse" reading is low power (3 of 5 against 3 of 5), and the earlier 0 of 5 on `9c5f6fc` is a conflicting result that was not reproduced.

