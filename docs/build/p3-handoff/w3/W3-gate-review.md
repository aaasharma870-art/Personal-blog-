**W3 correctness review of `778d3b1..HEAD`, head 79b69b1. Read-only; nothing was edited, built or committed. 15 findings, most severe first.**

Each finding was checked by tracing the code paths. I did not run a browser: another agent's timing probe run (`p3-probes.mjs` against :3161 and :3162) was in progress, and the rule is one browser at a time for timing.

Areas checked with no findings:
- Analytics makes no network calls: `SEND` is false in every build and nothing calls fetch or sendBeacon.
- Kill-list data, `lib/content.ts` and research text are unchanged. The two new strings are proposed and unsigned.
- Every new `useVariant` key is registered in `lib/variants.ts`.
- Pause stops the drone, the director's cut, the wand cursor, the candle toy, the curve cover, the coin sweep, the RDR2 eggs and the compass, each at once.
- No new CSS matches `<html>`, uses `[class*=]` or keys on `html.lenis*`.
- No hydration mismatch was found.
- The Pause control triggers no egg, and no egg is counted twice.

---

**1. HIGH — The drone landing freezes when the band scrolls fully out of view; its fixed HUD stays on screen.**
- Where: `components/games/drone/flight.ts:151-153` (`loop()` only schedules a frame while `inView`) and `:308-317` (the observer callback only acts on `phase === "flying"`).
- Scenario:
  1. The visitor flies, then scrolls on with the wheel. Below 50 % visible, the drone starts its 600 ms landing glide.
  2. The band (about 560 px tall at 1440) reaches 0 % visible before the glide ends. That is under 300 px of scroll.
  3. The observer sets `inView = false`, so the next frame is never scheduled and `end()` never runs.
- Result: the phase stays "landing" until the band comes back into view. Meanwhile:
  - the fixed game HUD ("n/7 gates · t s" and the how-to-fly text) stays over every later section;
  - `html[data-game="drone"]` stays set, so every typed egg is ignored page-wide;
  - the rotor hum keeps playing;
  - the band's camera stays held.
- Fix: in the observer callback, before the existing test, add `if (ratio === 0 && (phase === "flying" || phase === "landing")) { land("offscreen", false); return; }`. Also let a landing run off-view: `if (!raf && visible && (phase === "landing" || (phase === "flying" && inView))) raf = requestAnimationFrame(frame);`. In `onVis`, when the tab hides during a landing, call `end(glide?.reason ?? "hidden")`.

**2. MEDIUM — Pressing Enter anywhere fires a Dead Eye round started by the typed word or the palette, even on "Release".**
- Where: `components/eggs/egg-runtime.tsx:333-346`, reached through `components/eggs/dead-eye.ts:58`.
- Scenario: while `deadEye.current` is set, the window keydown handler calls `d.fire()` on any Enter that is not in an input. Its Escape branch also fires when Escape closes a dialog.
- Results:
  - Enter on "Release" fires the round first (score saved to `aryan:games:v1`; at 5/5 `recordDeadEyeWin` earns the pen), then releases it.
  - Enter on a survivor row fires instead of costing 0.5 s.
  - Enter on the DEAD EYE pill fires, then stops the round.
  - Escape to close the palette mid-round also ends the round, because `d.abort()` ignores `defaultPrevented`. `run.ts`'s own handler deliberately leaves Escape to dialogs.
  - A round started from the pill behaves differently from one started by the word or the palette.
- Fix: delete the Dead Eye key effect in `egg-runtime.tsx`. `run.ts` already handles Escape, Shift+Enter on a row and the Fire button. `deadEye.current` is still cleared by `game:stop` (`dead-eye.ts:53`).

**3. MEDIUM — A first take-off when the band is under half in view lands itself straight away.**
- Where: `flight.ts:264-270` (start centring, take off at once) together with `:308-317` (the observer's first callback).
- Scenario:
  1. A keyboard user Shift+Tabs to "▲ Take off", so the pill sits at the top of the viewport and the band is about 30 % visible.
  2. Enter mounts the game; `takeOff()` runs and starts the centring scroll.
  3. The new observer's first callback reports a ratio under 0.5 while the flight is on, so it calls `land("offscreen")`.
- Result: the "bring it to the middle first" path is dead on the first press.
- Fix: keep `let centering = false`. In `takeOff()`, set it to true and run `scrollToTarget(...).finally(() => { centering = false; if (phase === "flying" && lastRatio < 0.5) land("offscreen", true); })`. In the observer, store `lastRatio = ratio` and skip the landing while `centering` is true.

**4. MEDIUM (gate failure) — First-load JS is over budget.**
- Where: `docs/build/p3-reports/W3-notes.md` §3.
- Numbers: JS is +8,813 B gz over the pre-Phase-3 base; the binding limit is +6,144 B, so it is 2,669 B over. CSS is +6,089 B, 55 B under.
- Candidates beyond the notes' list:
  - Move `DeadEyeCall`'s two effects (the `DEAD_EYE_CALL` listener and the B28 invite with chunk warming) into a lazy "desk" module, as `drone-desk.tsx` does. The first-load file would keep only the button and a `useState`.
  - Merge the per-section `lazy()` entry points into one desktop-extras chunk. Each one adds a 100–140 B loader stub; about 3.7 KB of raw stubs are listed.

**5. MEDIUM — Both games start a round by themselves when the screen re-enters the desktop/fine-pointer size.**
- Where: `components/worlds/idiots/drone-band.tsx:74,84` with `flight.ts:340-348` (the count of answered presses is per controller), and `components/games/dead-eye/dead-eye-call.tsx:34,109`.
- Scenario: the visitor plays once, then the window is narrowed below 64rem, or a convertible changes hover/pointer mode, and goes back.
  - `run` and `round` stay above 0, so the game remounts.
  - The new drone controller has answered no presses and calls `takeOff()`; if the band is under half visible, the page is also scrolled to it.
  - `DeadEyeHud` remounts and `startRound()` scrolls to the kill-list and slows time.
  - The hidden DEAD EYE pill is also left with `aria-pressed="true"`.
- Fix: in `DroneBand`, `useEffect(() => { if (!fine) setRun(0); }, [fine]);`. In `DeadEyeCall`, `useEffect(() => { if (!fine) setRound(0); }, [fine]);`.

**6. MEDIUM — No error boundary around the new lazy chunks, so one failed chunk load blanks the whole page.**
- Where: there is no `app/error.tsx` or `app/global-error.tsx`, and `lazy()` call sites went from 10 to 24:
  - `drone-band.tsx:17-18`, `dead-eye-call.tsx:11`
  - `contact-scene.tsx:91-92`, `about-pillars.tsx:62`
  - `film-frame.tsx:80`, `curve-draw.tsx:23`
  - `gauntlet-tabs.tsx:26`, `plate-band.tsx:460-461`
  - `journey-chart.tsx:56`, `rdr2/kit.tsx:103`
- Scenario: a chunk request fails (deploy skew after a redeploy, or a flaky network). The `lazy()` rejection throws to the root and Next shows "Application error: a client-side exception has occurred".
  - Several of these mount with no visitor action once the desktop engine is ready: the wand, candles, compass toy, curve cover, Run invite, films extras, pen and drone desk.
- Fix: wrap each import as `lazy(() => import("…").catch(() => ({ default: () => null })))`, or add one shared class boundary that renders `null` around each desktop-extras `<Suspense>`.

**7. MEDIUM-LOW — Focus is lost when Dead Eye's "Fire" button is used.**
- Where: `components/games/dead-eye/dead-eye-hud.tsx:236-240`.
- Scenario: a keyboard user presses Enter on "Fire" (or the 5 s core runs out while focus is on it). The phase becomes "read", the button unmounts and focus drops to `<body>`.
- Fix: keep the button rendered with `aria-disabled` in the read phase. Or, when the phase leaves "paint" while the Fire button has focus, move focus to the Release button (add a ref).

**8. MEDIUM-LOW — After firing, Dead Eye keeps the page in "game" mode until the visitor releases it.**
- Where: `components/games/dead-eye/run.ts:336-359` (`fire()`); `data-game` is only cleared at `:511`.
- Scenario: the visitor fires (or the core runs out) and simply scrolls on.
  - `html[data-game="deadeye"]` stays set, so `egg-host.tsx:125` ignores every typed egg for the rest of the visit.
  - The fixed HUD stays over every later section.
  - `run.ts`'s ↑/↓ handler keeps limiting the ledger's own arrow keys to the killed rows.
- Fix: clear `data-game` when the round enters the read phase, since it has no game keys left. Also release with reason "offscreen" when `#kill-list` falls below about 10 % visible (one IntersectionObserver).

**9. MEDIUM-LOW — The chapter select is broken on every page except the home page.**
- Where: `components/site/chapter-select.tsx:155-167`; it is mounted for every route at `components/site/header.tsx:453`.
- Scenario: on the 404 page (or `/lab/*`) on a desktop:
  - each tile's handler calls `preventDefault()` and then `scrollToTarget("#act-1")`, which resolves to nothing, so the link is dead;
  - "▶ Director's cut" closes the menu and `startDirectorsCut()` returns because the path is not "/";
  - in both cases the menu closes without restoring focus, so focus is lost.
- Fix: render it only on the home page (`{fine && pathname === "/" ? <ChapterSelect …/> : null}`). Alternatively, off "/", let tiles navigate to `/${href}` without `preventDefault`, and hide the play button.

**10. LOW — The director's cut ignores input while its player is still loading.**
- Where: `components/director/api.ts:67-79`; listeners are attached only inside `play()` at `directors-cut.ts:351-371`.
- Scenario: the cut is started from the palette or the chapter select, which do not pre-load the player as the hero button's hover does. A wheel, key or fast-lane jump during the chunk load is not seen. The run then starts and, at `directors-cut.ts:297-298`, cuts the page back to the top.
- Fix: in `startDirectorsCut`, attach one-shot capture listeners at once (wheel, touchstart, pointerdown, keydown, and `on("fastlane")`). They set a cancel flag; `.then(m => cancelled ? (setDirectorsCutState(false), borrowed.then(r => r())) : m.play(borrowed))`.

**11. LOW — Restarting Dead Eye within 300 ms of a release wipes the new round's grade.**
- Where: `run.ts:499-510`, where the deferred `clear()` runs after the release fade.
- Scenario: Esc, then the pill again within about 300 ms.
  - The new round's `draw()` (`:444-449`) reuses the old layer's children.
  - The old `clear()` then hides and empties the layer mid-paint.
  - The new round also stores the old fading `opacity:0` style as the original (`:159`) and puts it back on its own exit.
- Fix: keep the pending fade in a module-level variable. On a new start, cancel it and call `clear()` synchronously before reading `gradeStyle`.

**12. LOW (gate failure) — The beats probe still shows two gaps over 100vh at both widths.**
- Where: `W3-notes.md` §4.
- Gaps:
  - B29 → B30: 159 / 199vh. The ledger (`[data-ledger]`) carries no beat; spec row B29 is "kill-list rows".
  - B56 → B57: 167 / 178vh. The credits roll carries no beat.
- The W3 gate requires 0. These go to the fixer: host the declared B29 and B57 ranges on the ledger and the roll. B57's move needs the spotlight's "host left the viewport" check for the Snitch dart adjusted.

**13. LOW (plausible, not confirmed in a browser) — The candle toy may arm when the page scrolls under a still mouse.**
- Where: `components/worlds/hp/candle-toy.tsx:246-251` accepts any mouse `pointermove`.
- Scenario: Chromium can send move events when content scrolls under a still cursor; `ledger-reckoning.tsx:258` already filters these out. If it does, the hall goes dark although the visitor never moved, including while the director's cut scrolls. That would break "toys never auto-run".
- Fix: ignore moves whose `clientX`/`clientY` equal the last seen values, as the ledger does.

**14. LOW — `--time-scale` has no reader.**
- Where: `run.ts:230` sets it on `#kill-list`, but nothing in the repo consumes `--time-scale`.
- Effect: any canvas or weather loop there runs at 1× during Dead Eye; spec §9.2 #3 says time slows "incl. `--time-scale`".
- Fix: have the weather/canvas loop read the custom property from its section, or drop the claim from the spec and the code comment.

**15. LOW — Phones without `::details-content` lose the visible "Built with AI assistance" credits row.**
- Where: `components/site/footer.tsx:197` (the row is hidden on desktop inside the disclosure) and `:286`.
- Scenario: phone browsers without `::details-content` (for example iOS Safari before 18.4) get a closed disclosure, as `app/p3/words.css:20-30` intends. The credits roll is therefore no longer unchanged on those phones, and the AI-assistance row sits behind a toggle.
- Fix: put the AI row outside the `<Collapse>` on every width. Keep a single `<dl>` row before the disclosure and drop the `dw:hidden` copy.