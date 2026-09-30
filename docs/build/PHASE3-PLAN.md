# PHASE3-PLAN: waves, builders, file ownership (P3-2 … P3-12)

**Status:** binding build plan for Phase 3, written 2026-09-30 on `design/three-films` (P3-1, after `PHASE3-SPEC.md` final).
**Authority:** IDEAS §O + §0 + §P → `CONTINUE.md` Phase 3 brief → `PHASE3-SPEC.md` (the spec) → this plan. Where this plan and the spec disagree on *what* to build, the spec wins; this plan decides *who builds it, when, in which files*.
**Read with:** `docs/build/PHASE3-SPEC.md` (every "§" below is a spec section unless marked "plan §"), `docs/build/CONTENT-RULES.md` (absolute), the skills in `.claude/skills/<name>/SKILL.md`.
**The orchestrator** runs the builders of one wave concurrently in ONE shared working tree. Builders never commit. After every builder of a wave has returned, that wave's ASSEMBLER integrates, runs the full checks and captures, commits and pushes. The MEDIA LANE runs beside the code waves from the start and is registered by each assembler.

---

## 0. Rules

### 0.1 Every builder
1. **Own only your globs.** Create, edit or delete files only inside the globs listed for you. Everything else is read-only. If you need a change outside your globs, put it in your return as a `handoff` (plan §0.2). The one standing exception: B1-BEATS may add `data-beat*` attributes (attribute-only diffs) to wave-1 files nobody else owns (plan §5.3).
2. **Shared tree safety.** Never run a mutating git command (`checkout`, `stash`, `reset`, `restore`, `clean`, `add`, `commit`, `rebase`, `merge`). `git status` and `git diff -- <your files>` are fine. Never run `npm install`, `npm run build`, `next dev`/`next start`, or `scripts/check-manifest.mjs` (assemblers do). Per-builder exceptions are named in your section (the intro controller build, the font fetch).
3. **Your checks:** `npx tsc --noEmit` and `npx eslint <your files>`. A tsc error in a file outside your globs is not yours: do not "fix" it; mention it in `notes`. Your own files must be clean. (`tools/**` and `docs/build/**` are ESLint-ignored; run `node --check` on new `.mjs`/`.js` tools.)
4. **Code against the contracts** in plan §3. Never change an exported signature listed there; if one is wrong, hand it off.
5. **Content:** use existing copy keys only. W1.0 adds every Phase-3 key (plan §4.4). Never invent a fact; new text is page microcopy, `status:"proposed"`, `unsigned:true`, via a handoff. Sharpe, PSR and PF never animate. Research data stays Geist/Geist Mono (`data-research`).
6. **Media:** never write `public/media/**`, `public/audio/**` or `lib/media.ts` (assembler only). Reference media that may not be registered yet only through `loopFor()` or an `isMediaId("…")` guard, with the ALT as the fallback, so tsc never depends on registration order. New sprites, masks, cursors and SVG frames are **code or `assets/p3/<your-id>/`** files imported statically, never `public/` (validator H2 needs a `lib/media.ts` row for every public image/video).
7. **Gates:** desktop-only UI is shown with the full media query (`DESKTOP_WIDE`/`DESKTOP_FINE`, or the `dw:`/`df:`/`boot:` Tailwind variants W1.0 adds), never `lg:`. Layout differences key only on the boot gate. All new client state appears after mount (hydration rule, `lib/flags.ts`). Every-frame motion is transform/opacity only (a mask may ride a transform); no animated filter, blur, `mask-position`, `background-color` or `box-shadow`.
8. **RM/Pause:** reduced motion or Pause stops your motion and sound within 100 ms, with no layout shift; the Pause control is never a trigger for anything you build.
9. **Variants:** every animated piece you build implements the DEFAULT and the ALT registered for it in `lib/variants.ts` (read with `useVariant(key)`). W1.0 registers the keys (plan §4.5); you do not edit `lib/variants.ts`.
10. **Beats:** the DOM element that performs a beat you build carries `beatAttrs(id, …)` (plan §3.2, §8).
11. **Next 16:** before Next-specific code read `node_modules/next/dist/docs` (fonts `01-app/03-api-reference/02-components/font.md`; `next/dynamic` + `ssr:false` only inside client components, `01-app/02-guides/lazy-loading.md`; head scripts `01-app/02-guides/scripts.md` + `03-file-conventions/layout.md`; preload `04-functions/generate-metadata.md` → `ReactDOM.preload`).
12. **Skills:** read the SKILL.md files named in your section. Where a skill contradicts the spec (e.g. `gsap-react` recommends `@gsap/react`/`useGSAP`), the spec wins (`useScrollScene`, no `@gsap/react`).

### 0.2 Builder return (the builder's final text; JSON only)
```json
{ "id": "B1-SCROLL", "status": "done | partial | blocked",
  "files": ["every path created/edited/deleted"],
  "apis": [{ "file": "lib/smooth-scroll.ts", "export": "scrollToTarget", "signature": "(t, o?) => Promise<void>", "changed": false }],
  "handoffs": [{ "file": "lib/film.ts", "change": "acts[act-2].landAt = 0.45", "why": "…", "blocking": false }],
  "acceptance": [{ "item": "P3-2 #1", "how_to_verify": "probe lenis.mjs", "self_check": "tsc/eslint clean" }],
  "notes": ["out-of-glob tsc errors seen, open questions, anything Aryan must decide"] }
```

### 0.3 Every assembler (plan §10 has the checklist)
Runs after all builders of its wave return. It may edit any file to integrate, applies handoffs, registers staged media, runs `npm run check`, `RELEASE=1 npm run check` (expected failures only: plan DP-9), `npx eslint .`, `npm run build`, serves the build (`npx next start -p 3161`), runs the captures and probes, fixes small integration faults itself (big ones → a follow-up builder with a disjoint glob), ticks `CONTINUE.md`, commits and pushes on `design/three-films` (never force). Commit messages end with the session's attribution lines.

### 0.4 Media agents
Write only `docs/build/media-staged/p3/**`, `docs/build/media/p3/**`, `media-src/**` (gitignored) and the scratchpad. Never `public/`, `lib/`, `LOG.md` or the ledgers (assemblers append those from the batch files). Plan §9.

### 0.5 Planner decisions (DP)
| # | Decision | Why |
|---|---|---|
| DP-1 | **Wave 1 = P3-2 + P3-3 + P3-4.** The intro and the type are isolated and are the spec's Appendix C step 1; the new fonts registration is a wave-2 dependency. | Parallel from day 1. |
| DP-2 | **A serial contracts step (W1.0) precedes wave 1.** It installs the dependencies, writes every shared signature as a working stub, pre-mounts every new component at its final place, adds every Phase-3 copy key, variant key and egg id, creates the CSS partials and splits the validator and probes into per-owner modules. After it, no builder needs a shared file it does not own. | Disjoint globs in one tree. |
| DP-3 | `pickCodec()` lives in `lib/codec.ts` (client), not `lib/media.ts`. | `lib/media.ts` stays pure data, validator-importable, assembler-owned. The spec's "one pickCodec in lib/media" is honoured in spirit: one function for intro, MediaFrame and StageVideo (the vanilla intro controller carries the same rule in JS). |
| DP-4 | `lib/media.ts`, `public/media/**`, `public/audio/**`, `LOG.md`, `LEDGER-p3loops.md` are **assembler-only** after W1.0. | The media lane stages; assemblers register (`npm run check` errors on unregistered public files). |
| DP-5 | Loops are wired by **`loopFor(plate)`** (a registered video `registeredTo` the plate). Stage cues and hosts name the plate, never the loop. | A loop lights up the moment it is registered; no host edit, no tsc dependency. |
| DP-6 | Code sprites/masks live in code or `assets/p3/<builder-id>/` (static imports). | H2 walks `public/`. |
| DP-7 | Audio files live under `public/audio/**`; W1.0 exempts that folder from the H2 media-row rule; spec check #9 (SOUNDS.md rows) covers it. | `.webm` Opus would otherwise need a media row. |
| DP-8 | A loop's ALT is code (depth + camera, §6.1): W1.0 lets the media-variants rule accept `codeAlt: "code:plate-camera"` on a Higgsfield loop video in place of a media alternate. | Otherwise every loop is a release gate. |
| DP-9 | `RELEASE=1 npm run check` is expected to fail on exactly two Aryan-owned lists: the **unsigned copy** (validator #10) and the **Check-L2 countersignatures** (`aryan:pending`) of Phase-3 media. Anything else failing is a bug. | Spec §6.4 accepts media with `claude:<date>` pending Aryan. |
| DP-10 | Phase-3 CSS goes in **`app/p3/<owner>.css` partials**, imported by `app/layout.tsx` after `intro.css` (the existing `intro.css` precedent), one owner each. Plain CSS (no `@apply`; `@reference "../globals.css"` if ever needed). Tokens and custom variants stay in `globals.css`. | Disjoint CSS ownership; cascade after the base. |
| DP-11 | The validator becomes a loader: `scripts/check-manifest.mjs` auto-imports every `scripts/checks/*.mjs` (sorted) and calls `default(ctx)`. The existing #10 lettering block moves to `scripts/checks/lettering.mjs`. | One owner per check module. |
| DP-12 | Probes live in `tools/capture/probes/*.mjs`, run by `tools/capture/p3-probes.mjs <base> <out> [--only=…] [--vw=…]`. | One owner per probe. |
| DP-13 | Spotlight, audio engine, hunt panel, GL and the enhancer follow **facade + lazy impl**: the static import is < 1 KB and dynamic-imports the implementation on DESKTOP_FINE/first use. | Initial route ≤ +6 KB gz JS. |
| DP-14 | The **fast lane** (header relabel, intro skip-row link, the cut) lands in **wave 1**, not with P3-10. | "Always visible" is a standing constraint. |
| DP-15 | **Wave 3 is per world.** One builder per world owns every in-world file and does all host work there: words hosts, eggs, simple toys, invites, `LivePlate` wiring, collapses and `data-beat`. The two real games and the kill-list/systems files form their own builder. | The same world files are touched by P3-5/7/8/10; one owner per file per wave. |
| DP-16 | The director's cut, chapter select and analytics land in wave 3 with the films and credits (**W3-CINEMA**): they need the final beats and they share the "cinema" files. | ≤ 6 builders per wave. |
| DP-17 | The chapter select carries "▶ Director's cut" as its first item (the DVD "Play movie"); W1.0 pre-mounts it lazily in the menu sheet, and the director's-cut button in the hero CTA row. | No wave-3 edit of `header.tsx`/`hero-section.tsx`. |
| DP-18 | The W1 assembler builds the **pre-Phase-3 base** (`git worktree add <scratch>/p3-base <the last commit before W1.0, e.g. 97e7b30>`, port 3162) and captures 390, 320, 844×390, 1024×1366, 1024×768 and 1440×900 baselines with the new tools. | "Phones unchanged" and 1024 need same-tool baselines (P3-0 captured 1440 only). |

---

## 1. Wave map

| stage | builders (run in parallel) | queue | starts when | gate (plan §10) |
|---|---|---|---|---|
| **W1.0 Contracts** | C0-LIB, C0-WIRE (or one builder C0 doing both) | P3-2 prep | now | home page identical at 1440/390; check, eslint, build green |
| **W1 Foundation** | B1-SCROLL, B1-STAGE, B1-BEATS, B1-RASTER, B1-INTRO, B1-TYPE | P3-2, P3-3, P3-4 (+ fast lane) | W1.0 committed | spec §13 P3-2 #1–12, P3-3 #1–6, P3-4 #1, #3–7 |
| **W2 Engines** | W2-CARDS, W2-GL, W2-PLATES, W2-WORDS, W2-HUNT, W2-SOUND | P3-5 (engine), P3-6, P3-7 (act titles, subtitles, primitives), P3-8 (core), P3-9 | W1 committed | P3-6 #1–11, P3-7 #1, #4, P3-8 #1–3, #7–9, P3-9 #1–4, P3-5 #1, #3, #5, #6 |
| **W3 Hosts** | W3-GAMES, W3-PIRATES, W3-IDIOTS, W3-RDR2, W3-HP, W3-CINEMA | P3-5 (hosts), P3-7 (hosts), P3-8 (eggs, toys, games), P3-10 | W2 committed | every remaining §13 item; beats probe 0 gaps |
| **P3-11** | TOOLS (1 builder), then ≤ 3 rounds of capture → judges → fixers (≤ 6, disjoint) | P3-11 | W3 committed | §13 P3-11 ship bar |
| **P3-12** | QA assembler | P3-12 | P3-11 done | §13 P3-12 |
| **Media lane** | M-CHECK, M-GEN, M-AUX (parallel with all code waves) | P3-5 media, P3-9 TTS | now | registered at W1, W2, W3 assemblies |

Time order of the media lane against the code: M-CHECK and M-AUX(a) marks must be staged before the W1 assembler finishes (W2-CARDS needs the marks); SEQ-PEARL/SEQ-HALL staged before the W2 assembly; the horse frames before W3 starts; TTS before the W2 assembly.

---

## 2. Shared files: one owner per wave

"asm" = the wave's assembler only (applies handoffs). "—" = untouched.

| file | W1.0 | W1 | W2 | W3 |
|---|---|---|---|---|
| `lib/page.ts` | C0-LIB (types: `stage?`, `beats?`, `tempo?`, `estVh?`) | **B1-BEATS** (all beats, tempo, estVh, stage specs) | **W2-PLATES** (cue camera/depth/weather refinements) | asm (+ `beats.mjs --write`) |
| `lib/film.ts` | C0-LIB (all P3 copy keys, `Copy.unsigned`, loglines `unsigned`, eggs registry, `cardTravel`, `smoothScroll/gl/sound`, `fontScope.worlds/name`, name lettering entry, `acts[]` fields) | **B1-BEATS** (acts beats/tempo/landAt/stage) | **W2-HUNT** (egg registry corrections); CARDS' `landAt`/`maskOrigin` via asm | asm |
| `lib/media.ts` | C0-LIB (type fields only, if any) | asm (registration) | asm | asm |
| `lib/fonts.ts` | — | **B1-TYPE** | asm | asm |
| `lib/variants.ts` | **C0-LIB** (every P3 key, both sides) | asm | asm | asm |
| `lib/flags.ts` | C0-LIB | **B1-SCROLL** | asm | asm |
| `lib/sections.ts` (palette commands) | — | asm | **W2-HUNT** | asm |
| `lib/quotes.ts` | — | — | **W2-HUNT** | asm |
| `lib/derive.ts` | — | asm | **W2-CARDS** | asm |
| `lib/motion.ts` | — | **B1-INTRO** | **W2-CARDS** | asm |
| `app/globals.css` | **C0-WIRE** (z tokens, custom variants) | **B1-TYPE** (world blocks, type vars) | asm | asm |
| `app/layout.tsx` | **C0-WIRE** (partial imports, mounts) | **B1-TYPE** (Pirata preload, comment) | asm | asm |
| `app/page.tsx` | **C0-WIRE** (mounts) | **B1-STAGE** (z-main, fixed-layer audit) | asm | asm |
| `app/p3/*.css` | C0-WIRE (empty, owner banner) | per plan §4.6 | per plan §4.6 | per plan §4.6 |
| `components/site/header.tsx` | **C0-WIRE** (slots) | **B1-SCROLL** (locks, fast lane, prevent) | asm | asm |
| `components/site/footer.tsx` | **C0-WIRE** (slots) | **B1-STAGE** (backdrop; TYPE + libraries rows) | **W2-HUNT** (SEEKER, hunt credits, tail) | **W3-CINEMA** (collapses) |
| `components/site/command-palette.tsx` | — | **B1-SCROLL** | **W2-HUNT** | asm |
| `components/eggs/egg-bus.ts` | **C0-LIB** (new EggIds) | asm | **W2-HUNT** | asm |
| `components/eggs/egg-host.tsx` | — | **B1-SCROLL** (scrollToTarget, await) | **W2-HUNT** | asm |
| `components/eggs/snitch.tsx` | — | — | **W2-HUNT** | **W3-CINEMA** |
| `scripts/check-manifest.mjs` (core) | **C0-WIRE** (loader, #10 extraction, H2 audio, loop code-ALT) | **B1-BEATS** (retire #3/#4) | asm | asm |
| `scripts/checks/*.mjs` | C0-WIRE (stubs) | per plan §4.7 | per plan §4.7 | asm |
| `components/primitives/media-frame.tsx` | — | **B1-INTRO** | **W2-PLATES** | asm |
| `components/site/world-kit.tsx` | — | **B1-STAGE** | **W2-WORDS** (`SectionHead inCharacter`) | asm |
| `components/sections/SectionFrame.tsx` | — | **B1-STAGE** | asm | asm |
| `components/sections/chapter/chapter-section.tsx` | — | **B1-STAGE** (split, `split-stack`, `data-research`) | — | **W3-IDIOTS** |
| `components/sections/hero/hero-section.tsx` | C0-WIRE (DC slot) | **B1-TYPE** | — | — |
| `components/sections/hero/hero-stage.tsx` | — | **B1-INTRO** | — | — |
| `components/sections/act-card/**` | — | B1-RASTER (overlay layers in 4 frames only) | **W2-CARDS** | asm |
| `components/stage/stage.tsx`, `stage-video.tsx` | C0-WIRE (stubs) | **B1-STAGE** | **W2-PLATES** | asm |
| `components/worlds/pirates/use-frame-sequence.ts` | C0-LIB (signature only) | — | **W2-PLATES** | **W3-PIRATES** |
| `tools/capture/motion.js` | — | **B1-SCROLL** | **W2-GL** (`?gl=force` run) | asm / P3-11 TOOLS |
| `tools/capture/{scenes.js,qa.js,browser.js}` | — | **B1-SCROLL** | asm | P3-11 TOOLS |
| `docs/build/CONTINUE.md`, SPEC/DESIGN/ICONS/MOTION-REPORT/AUTOPILOT (Appendix A overrides) | asm | asm | asm | asm |
| `docs/build/FONTS.md` | — | **B1-TYPE** | asm | asm |
| `docs/build/SOUNDS.md` | — | — | **W2-SOUND** (creates) + asm rows | asm |

---

## 3. Stable APIs (written by W1.0 as working stubs; implemented by the named builder)

Signatures are TypeScript. "Stub" = what W1.0 ships so the page is unchanged and callers compile. Types shared by several files live beside their functions (no barrel files).

### 3.1 Flags, idle, events, ladder, scroll (implemented by B1-SCROLL)
| file | exports | stub |
|---|---|---|
| `lib/flags.ts` (add) | `DESKTOP_WIDE = "(min-width: 64rem)"`; `DESKTOP_FINE = "(min-width: 64rem) and (hover: hover) and (pointer: fine)"`; `useDesktopWide(): boolean`; `useDesktopFine(): boolean` (false on server/hydration); `motionOffNow(): boolean` (live OS-reduce OR Pause, non-hook); `bootGateOn(): boolean` (non-hook: `html.js` && no `data-motion-boot="paused"` && DESKTOP_FINE && no-preference); skip flags gain `"smooth" \| "gl" \| "stage"` | real (small) |
| `lib/idle.ts` | `onIdle(fn: () => void, o?: { timeout?: number }): () => void` (rIC → `scheduler.postTask` background → `setTimeout 1`; returns cancel) | real |
| `lib/events.ts` | `type P3Events` (below); `emit<K extends keyof P3Events>(k: K, d: P3Events[K]): void`; `on<K>(k, fn: (d) => void): () => void` (window CustomEvents) | real |
| `lib/ladder.ts` | `type LadderStep = 1\|2\|3\|4\|5` (1 Lenis, 2 ScrollTrigger + enhancer, 3 StageGate, 4 GL, 5 world fonts); `isQuiet(): boolean`; `whenQuietEnd(): Promise<void>` (resolves at once when no intro is armed); `whenLadder(s): Promise<void>`; `useLadder(s): boolean`; `prefetchChunks(loaders: (() => Promise<unknown>)[]): void` | `whenQuietEnd` and every step resolve on the first idle after load |
| `lib/gsap.ts` | `loadGsap(): Promise<{ gsap: typeof import("gsap").gsap; ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger }>` (registers ScrollTrigger, `config({ ignoreMobileResize:true })` once) | real |
| `lib/use-scroll-scene.ts` | `useScrollScene(ref: RefObject<Element \| null>, build: (api: { gsap; ScrollTrigger; scope: Element }) => void \| (() => void), deps: readonly unknown[]): void` (DESKTOP_FINE + motion on only; `gsap.context` + `revert`; builds queued until ladder step 2) | no-op |
| `lib/smooth-scroll.ts` | `type LenisLike = { scrollTo(t, o?): void; stop(): void; start(): void; resize(): void; isScrolling: false \| "smooth" \| "native"; velocity: number; actualScroll: number }`; `getLenis(): LenisLike \| null`; `useLenis(): LenisLike \| null`; `scrollToTarget(t: string \| Element \| number, o?: { block?: "start"\|"center"\|"nearest"; focus?: boolean; history?: "push"\|"replace"\|false; immediate?: boolean; cut?: boolean }): Promise<void>` (resolves on arrival + focus); `lockScroll(owner: string): void`; `unlockScroll(owner: string): void`; `requestScrollRefresh(): void`; `scrollVelocity(): number` (px/s); `onScrollIdle(fn, o?: { ms?: number; below?: number }): () => void` | native `scrollIntoView` + body overflow lock |

`P3Events` (final in W1.0): `"intro:quiet"`, `"intro:quiet-end"`, `"page:hydrated"`, `"ladder:step" {step}`, `"scroll:jump" {y, immediate}`, `"fastlane"`, `"stage:live" {on}`, `"impact" {world}`, `"transition:meet" {card}`, `"letterbox" {state:"close"\|"open"}`, `"title:in-character" {world, id}`, `"hunt:found" {id, count}`, `"egg:trigger" {id}` (the existing `EGG_EVENT` name), `"game:start" {game}`, `"game:stop" {game, reason}`, `"game:gate" {n}`, `"game:mark" {row}`, `"game:fire"`, `"game:finish" {game, score}`, `"toy" {toy, action, n?}`, `"dc:start"`, `"dc:stop" {reason, pct}`, `"post-credits" {extended}`, `"sound:change" {on}`.

### 3.2 Beats, spotlight, enhancer (B1-BEATS; enhancer framework B1-SCROLL)
| file | exports |
|---|---|
| `lib/beats.ts` | `BeatKind`, `Beat`, `Tempo`, `EstVh = { d: number; t: number }` (types exactly as spec §3.4); `beatAttrs(id: string, star?: { weight: 1\|2\|3 }): Record<"data-beat"\|"data-beat-star"\|"data-beat-weight", string>` |
| `lib/spotlight.ts` (facade) | `spotlight.request(id: string, o: { weight: 1\|2\|3; needsIdle?: boolean; maxWait?: number; durationMs?: number }): Promise<"play" \| "skip">`; `spotlight.release(id)`; `spotlight.registerScrollStar(id: string, el: Element, weight: 1\|2\|3): () => void`. Not DESKTOP_FINE or motion off → resolves `"skip"` at once (the element shows its end state). Impl lazy (`lib/spotlight-impl.ts`). Stub: `"play"`. |
| `components/primitives/use-enter-once.ts` (add option) | `useEnterOnce(ref, { …existing, star?: { id: string; weight: 1\|2\|3 } })`: an armed element asks the spotlight before "entered"; `skip` → entered without animating. |
| `components/enhance/desktop-enhancer.ts` | loaded as ladder step 2 on DESKTOP_FINE; imports `./binders/{words,hotspots,dc}.ts`, each `export default function bind(root: Document): () => void`; replays `window.__enhanceQ`. Binder stubs return a no-op. |

**Beat ids:** `B<nn>` = the star of spec §2.3 row nn (a merged row like B04–05 is `B04`); secondary or quiet beats in that row are `B<nn>-<slug>` (e.g. `B08-invite`, `B12-q-l20`). B1-BEATS declares every id in the manifest; the probe reports ids missing from the DOM.

### 3.3 Stage, bars, layers (B1-STAGE)
| file | exports |
|---|---|
| `lib/stage.ts` | `StageCue`, `Scrim`, `StageSpec` (spec §3.2 types; `StageCue.loop` omitted in data, DP-5); `stageCues(items: readonly PageItem[]): StageCueAt[]`; `stageAt(y: number, cues: readonly StageCueAt[]): { a: number; b: number; mix: number; local: number }` (pure) |
| `lib/sky.ts` | `SkyKey = "moonlit"\|"squall"\|"dawn"\|"day"\|"cinema"\|"golden"\|"dusk"\|"candle"`; `SKY: Record<SkyKey, { k: number; ev: number; gain: readonly [number, number, number] }>`; `skyOf(sectionOrAct: string): SkyKey` (spec §7.5, pure) |
| `components/stage/stage-layers.tsx` | `<StageLayers/>` (mounted before `<main>`); `<StageLayerPortal layer="cut" \| "stop" \| "game-hud" \| "toast">` (portal into the fixed container at its z token) |
| `components/stage/letterbox-bars.tsx` | `<LetterboxBars/>`; `useLetterboxScene(ref: RefObject<Element \| null>, o: { close: [start: string, end: string]; open: [start: string, end: string] })` (ScrollTrigger position strings; RM/phones: no-op, bars never mount) |
| `components/stage/stage-gate.tsx` | `<StageGate/>` (client; `dynamic(() => import("./stage"), { ssr:false })` at ladder step 3) |
| `components/stage/stage-window.tsx` | `<StageWindow section: string; cue: StageCue; side: "left" \| "right">` (server markup; B1-STAGE uses it itself) |

### 3.4 Media, codec, plates (B1-INTRO: codec; W2-PLATES: the rest)
| file | exports | stub |
|---|---|---|
| `lib/codec.ts` | `pickCodec(e: { src: string; webm?: string; width: number; height: number }): Promise<{ src: string; type: "video/mp4" \| "video/webm" }>`; `pickCodecSync(e)` (cached result or MP4) | MP4 |
| `lib/loops.ts` | `loopFor(plate: MediaId, variant?: Variant): MediaId \| null` (usable `kind:"video"` entry `registeredTo(video, plate)`, not a flight; ALT variant → the alt's loop or null) | real (C0-LIB) |
| `components/primitives/live-plate.tsx` | `<LivePlate media: MediaId; camera?: CameraSpec; depth?: boolean \| DepthSpec; loop?: "auto" \| false; priority?: number; playOn?: "desktop" \| "never"; sizes?; className?; alt?; children?>` (children = registered overlays inside the camera group; RM → poster, 0 video bytes) | renders today's `MediaFrame`/`next/image` still |
| `components/primitives/camera.tsx` | `type CameraSpec = { kind: "drift"\|"push"\|"pan-l"\|"pan-r"\|"hold"\|"settle"; scale: readonly [number, number]; x?: readonly [number, number]; y?: readonly [number, number]; focal?: readonly [number, number]; driver: "flow" \| "sticky" \| "progress" }`; `<CameraGroup spec progress?: MotionValue<number>>` | static wrapper |
| `components/primitives/depth-plate.tsx` | `type DepthSpec = { line: number; feather?: number; far?: number; near?: number; max?: number }`; `<DepthPlate media spec progress?>` | still |
| `components/stage/weather-layer.tsx` | `<WeatherLayer kind: "spray" \| "chalk" \| "fireflies" \| "motes"; zone?: "frame" \| "image" \| "window"; count?: number>` | null |
| `components/worlds/pirates/use-frame-sequence.ts` | `useFrameSequence(urls, enabled, o?: { window?: number; index?: MutableRefObject<number> }): FrameSequence & { frameAt(i: number): CanvasImageSource \| null }` (`frames` kept for JV until W3-PIRATES migrates) | `frameAt` returns `frames.current[i]` |

### 3.5 Cards, GL, impact (W2-CARDS, W2-GL)
| file | exports | stub |
|---|---|---|
| `lib/gl/support.ts` | `type GlTier = "gl" \| "css" \| "off"`; `glTier(): GlTier` (`?gl=off\|force`); `useGlTier(): GlTier \| null` (null until probed) | `"off"` |
| `lib/gl/types.ts` | `GlFlavour = "iris"\|"wave"\|"chalk"\|"duster"\|"develop"\|"deadeye"\|"burn"\|"ink"\|"lumos"\|"title"`; `CoverBox = { scale: number; ox: number; oy: number }`; `GlCardSpec = { card: "opening"\|"seam"\|"tintype"\|"ignite"; variant: Variant; a: { flavour: GlFlavour; from: MediaId; to: MediaId; range: readonly [number, number] }; b: { flavour: "title"; text: string; world: WorldId; maskOrigin: readonly [number, number]; range: readonly [number, number] }; row: number; cover: { from: CoverBox; to: CoverBox }; center?: readonly [number, number]; radius?: readonly [number, number]; shapes?: { from: "ring32"\|"gear12"\|"wheel12"\|"snitch"; to: …; at: number }; grade?: { from: SkyKey; to: SkyKey }; flash?: { at: number; amount: number }; kraken?: MotionValue<number> }` | types |
| `components/gl/gl-gate.tsx` | `<GlGate spec: GlCardSpec; p: MotionValue<number>; live: boolean; onTier?(t: GlTier): void>` (lazy `GlFrame`; tier switches only at p ≤ 0 / ≥ 1; sets `data-gl="on"` on the closest `[data-act-card-frame]` after its first draw at a p end) | null |
| `lib/impact.ts` | `impact(world: WorldId, o?: { el?: HTMLElement; shake?: number; flash?: number; bloomEv?: number }): boolean` (once per world per view; RM no-op; emits `impact`) | emits only |

### 3.6 Words (W2-WORDS; consumers are wave 3)
| file | exports |
|---|---|
| `components/words/in-character-title.tsx` | `<InCharacterTitle world: WorldId; as?: "h2" \| "span"; id?; className?; beat?: string>{text}</InCharacterTitle>` (server markup, real text, `data-words="title"`) |
| `components/site/world-kit.tsx` | `SectionHead` gains `inCharacter?: boolean` |
| `components/primitives/scene-caption.tsx` | gains `inCharacter?: boolean` (films-screen titles) |
| `components/words/scrub-sentence.tsx` | `<ScrubSentence text: string; beat: string; className?>`; helper `splitAround(body: string, sentence: string): [before, sentence, after] \| null` (null → the host renders plain text) |
| `components/words/physical-word.tsx` | `<PhysicalWord text: string; word: "noise" \| "Killed"; kind: "grain" \| "strike"; beat: string>` (wraps the first token; absent → plain) |
| `components/words/fly-through.tsx` | `<FlyThrough kind: "gull" \| "horse"; path: { points: readonly (readonly [number, number])[]; ms: number }; frames?: readonly string[]; beat: string>` (aria-hidden, inside the host's image zone; `needsIdle` star) |
| `components/primitives/collapse.tsx` | `<Collapse summary: ReactNode; id?; className?>` (native `<details class="collapse">`, closed in SSR; toggle → `requestScrollRefresh()`) |

### 3.7 Hunt, eggs, sound, director, fonts, analytics
| file | exports | impl |
|---|---|---|
| `lib/hunt.ts` | `HuntId` = `"hp-map"\|"hp-lumos"\|"hp-snitch"\|"pc-parley"\|"pc-coin"\|"pc-kraken"\|"3i-aal"\|"3i-quad"\|"3i-pen"\|"rd-eagle"\|"rd-bone"\|"rd-fire"`; `HUNT: Readonly<Record<HuntId, { world: WorldId; registryId: EggId; host: string; name: CopyKey; hint: CopyKey; spell?: readonly string[] }>>` (final data, C0-LIB); `useHunt(): { count: number \| null; found: ReadonlySet<HuntId>; enabled: boolean }` (null on server/hydration → "–/12"); `markFound(id): boolean`; `resetHunt(): void`; `recordLedgerRowRead(row: string): void`; `recordDeadEyeWin(): void`; `worthyOfPen(): boolean` | W2-HUNT |
| `components/eggs/egg-bus.ts` | `EggId` gains `"aztec-coin" \| "worthy-pen" \| "eagle-eye" \| "fossil-bone" \| "campfire-flare"`; `triggerEgg(id)` unchanged | C0-LIB / W2-HUNT |
| `components/eggs/egg-hotspot.tsx` | `<EggHotspot hunt: HuntId; label: CopyKey; className?; children?>` (server `<button data-egg-hotspot>`, DESKTOP_FINE by media query; keyboard; bound by the hotspots binder) | W2-HUNT |
| `components/eggs/hunt-chip.tsx`, `hunt-credits.tsx`, `components/site/post-credits.tsx` | `<HuntChip/>`, `<HuntCredits/>`, `<PostCredits/>` (pre-mounted) | W2-HUNT |
| `lib/audio/index.ts` (facade) | `CueId` (union, plan §4.8); `BedId = "pirates"\|"idiots"\|"rdr2"\|"hp"\|"house"`; `sound.cue(id: CueId, o?: { pan?: number; rate?: number; gain?: number }): void`; `sound.loop(id, o?): { set(o): void; stop(): void }`; `sound.bed(b: BedId \| null): void`; `sound.duck(db: number, ms: number): void`; `sound.borrow(): Promise<() => void>` (director's cut: unmute for its duration; returns restore) | no-ops (W2-SOUND) |
| `lib/audio/store.ts` | `useSound(): { on: boolean; available: boolean }`; `setSoundOn(on: boolean): Promise<void>` (first call creates the AudioContext in the click) | W2-SOUND |
| `components/audio/sound-toggle.tsx` | `<SoundToggle/>` (pre-mounted in the header) | W2-SOUND |
| `components/director/api.ts` | `startDirectorsCut(): void`; `stopDirectorsCut(reason: string): void`; `useDirectorsCut(): { running: boolean }` | W3-CINEMA |
| `components/director/directors-cut-button.tsx`, `components/site/chapter-select.tsx` | pre-mounted (hero CTA row; menu sheet, lazy on open, DESKTOP_FINE) | W3-CINEMA |
| `components/director/cut-overlay.tsx` | `<CutOverlay/>` rendered in `StageLayerPortal("cut")`; driven by `scrollToTarget({ cut:true })` | B1-SCROLL |
| `lib/world-fonts.ts` | `markWorldFontsReady(world: WorldId, timeoutMs = 300): Promise<void>`; `<WorldFonts/>` in `components/providers/world-fonts.tsx` (pre-mounted in layout) | B1-TYPE |
| `lib/analytics.ts` | `track(event: "depth"\|"act"\|"fast_lane"\|"chapter"\|"directors_cut"\|"toy"\|"egg_count"\|"sound_on", props?: Record<string, string \| number \| boolean>): void` (no-op; `?debug=analytics` logs in dev) | C0-LIB final; W3-CINEMA adds trackers |
| `components/site/page-hydrated.tsx` | `<PageHydrated/>` (last Suspense child; sets `window.__pageHydrated`, emits `page:hydrated`) | B1-INTRO |

---

## 4. W1.0 Contracts (serial; C0-LIB + C0-WIRE, or one C0)

**Goal:** after W1.0 the page renders identically at every width (every stub renders null or today's markup), `npm run check`, `npx eslint .` and `npm run build` are green, and every later builder edits only its own files.

### 4.1 C0-LIB: owns `lib/**`, `components/eggs/egg-bus.ts`, `types/p3-globals.d.ts`
- `lib/flags.ts` additions (plan §3.1); replace nothing yet.
- Create with the plan §3 signatures: `lib/{idle,events,ladder,gsap,use-scroll-scene,smooth-scroll,beats,spotlight,spotlight-impl,stage,sky,codec,loops,impact,hunt,world-fonts,analytics}.ts`, `lib/gl/{support,types}.ts`, `lib/audio/{index,store}.ts`.
- `lib/page.ts`: optional `stage`, `beats`, `tempo`, `estVh` fields on entries (types only).
- `lib/film.ts`: `Copy.unsigned?: true`; `ActSpec` gains `beats?`, `tempo?`, `landAt?` (placeholder .45), `maskOrigin?` (placeholder [.5,.5]), `stage?: StageSpec` (the act-1 program block); `film.cardTravel = { opening: 90, seam: 110, tintype: 90, ignite: 110 }`; `film.smoothScroll/gl/sound = true`; `fontScope.worlds = true`, `fontScope.name = true`; `LetteringSlot` gains `"display"` and one entry `{ id: "name", text: "Aryan Sharma", face: "Pirata One", mode: "A", slot: "display", shipped: true }`; the loglines gain `unsigned: true`; every copy key in plan §4.4; the egg registry: `patronus` `enabled:false`, `dead-eye` marked as the toy (not a hunt egg), new entries `aztec-coin`, `worthy-pen`, `eagle-eye`, `fossil-bone`, `campfire-flare` with hosts (journey, kill-list, beyond, writing, voices).
- `lib/variants.ts`: every key in plan §4.5, both sides, `files` = the owner's globs.
- `lib/hunt.ts`: the full `HUNT` table (12 rows, spec §9.1; hints and names from plan §4.4) + working localStorage store (W2-HUNT may rewrite internals).
- `components/eggs/egg-bus.ts`: the 5 new `EggId`s + `REGISTRY_ID` rows.
- `types/p3-globals.d.ts`: `Window.__lenis?`, `__enhanceQ?: { sel: string; t: number }[]`, `__pageHydrated?: boolean`.

### 4.2 C0-WIRE: owns `package.json`, `package-lock.json`, `eslint.config.mjs`, `app/**`, `components/**` (new stub files + the mount edits below), `scripts/**`, `tools/capture/p3-probes.mjs`, `tools/capture/probes/**`
- `npm install lenis@^1.3.26 gsap@^3.15.0` (no `@gsap/react`).
- ESLint: merge into the existing `no-restricted-imports` (keep the motion rule) patterns `gsap`, `gsap/*`, `@gsap/react`, `lenis` with `allowTypeImports: true`, and a `files`-scoped override that allows them only in `lib/gsap.ts` and `components/providers/smooth-scroll.tsx`; `no-restricted-globals: ["error", "requestIdleCallback"]` except `lib/idle.ts`.
- `app/globals.css`: z tokens `--z-stage:0`, `--z-main:1`, `--z-bars:20`, `--z-game-hud:25`, `--z-stop:30`, `--z-toast:32`, `--z-cut:35` beside the existing ones; Tailwind custom variants `dw` (DESKTOP_WIDE), `df` (DESKTOP_FINE), `boot` (the boot gate: `@media DESKTOP_FINE and (prefers-reduced-motion:no-preference)` + `&:where(html.js:not([data-motion-boot="paused"]) *)`), `stage-live` (boot + `html[data-stage="live"]:not([data-motion="paused"])`).
- `app/p3/*.css` (plan §4.6), each with an owner banner, imported by `app/layout.tsx` after `./intro.css`.
- Stubs (render null or today's markup) and their mounts: `components/providers/smooth-scroll.tsx` (layout: inside `MotionProvider` → `ChromeGate`); `components/site/boot-head-script.tsx` (layout `<head>` on every request, beside `IntroHeadScript`; stub renders nothing); `components/providers/world-fonts.tsx` (layout); `components/stage/{stage-gate,letterbox-bars,stage-layers}.tsx` (page, before `<main>`); `components/stage/{stage,stage-video,stage-window,weather-layer,subtitle,carried-shape}.tsx`; `components/site/page-hydrated.tsx` (page, last Suspense child); `components/enhance/desktop-enhancer.ts` + `binders/{words,hotspots,dc}.ts`; `components/director/{api.ts,directors-cut-button.tsx,cut-overlay.tsx}` (button in the hero CTA row of `hero-section.tsx`; overlay inside `StageLayers`); `components/site/chapter-select.tsx` (header menu sheet via `dynamic(…, { ssr:false })` when open on DESKTOP_FINE); `components/eggs/{hunt-chip,hunt-credits,egg-hotspot}.tsx` (chip in the header's right cluster before Pause); `components/audio/sound-toggle.tsx` (header, between chip and Pause); `components/site/post-credits.tsx` + `HuntCredits` (footer: after `<SeekerRow/>`, after `[data-credits-last]`); `components/gl/gl-gate.tsx`; `components/primitives/{live-plate,camera,depth-plate,collapse}.tsx`; `components/words/{in-character-title,scrub-sentence,physical-word,fly-through}.tsx` (plain-text stubs).
- Validator: `scripts/check-manifest.mjs` loads `scripts/checks/*.mjs` (`export default function run(ctx)`; ctx = `{ ROOT, RELEASE, err, warn, gate, page, film, mediaAssets, quotes, OUT_LINES, content, VARIANT_REGISTRY, derive: { actCardsOf, actRunsOf, actsInUse, pageItemsOf, worldOfIn }, css, readFile }`); move the #10 block verbatim to `scripts/checks/lettering.mjs`; H2 skips `public/audio/**` (DP-7); the media-variants rule accepts `codeAlt: "code:plate-camera"` on a Higgsfield `kind:"video"` loop (DP-8). Stub modules (plan §4.7).
- Probes: `tools/capture/p3-probes.mjs` (runner) + stub modules (plan §4.7).
- **Do not** change `<main>`'s classes (B1-STAGE audits fixed descendants first).

### 4.3 W1.0 acceptance (assembler)
Check/eslint/build green; `scenes.js --only=desktop,mobile,rm` at 1440/390 pixel-identical to the pre-W1.0 commit (ignore anti-alias noise ≤ 0.1%); no console or hydration errors; `node tools/capture/p3-probes.mjs --help` runs.

### 4.4 Phase-3 copy keys (C0-LIB adds; all `status:"proposed"`, `unsigned:true`)
Texts come from the spec where it gives them; "draft" = page microcopy C0 writes in the page's voice (never a fact, never a film quote).
| keys | text |
|---|---|
| `titles.1`, `titles.2`, `titles.3` | "A RESEARCH JOURNAL IN {ACTS} ACTS" · "AFTER {WORKS}" (renders "AFTER PIRATES OF THE CARIBBEAN • 3 IDIOTS • RED DEAD REDEMPTION 2 • HARRY POTTER") · "ACT I • {ACT} ↓" ("THE CROSSING" via `<Lettered>` `pc-crossing`) |
| `systems.pencil.body` (rewrite) | "The same question, asked of this page: CSS and SVG first; on desktop, one small WebGL layer only where the scenes change." |
| `systems.meta.scroll/.native/.css/.webgl` | "Smooth scroll on desktop (Lenis)" · "Native scroll on phones and with reduced motion" · "CSS + SVG first" · "WebGL, where supported, only for scene changes" |
| `fastlane.label` | "Skip to the research" |
| `optuna.appendix.summary` | "Where the discipline started · Automated 0DTE Options Bots · paper-traded on a no-code platform; not a proven edge" (C0 verifies every phrase against `optionAlpha.tag/name/summary/honest` in `lib/content.ts`; any phrase not found there → use the nearest existing words and flag) |
| `about.philosophy.summary`, `credits.more.summary` | "The philosophy note" · draft ("More credits: media, fonts and quotes") |
| `egg.hunt.chip`, `.chip.name`, `.toast`, `.panel.title`, `.reset`, `.reset.confirm`, `.off`, `.complete` | "{n}/12" · "Easter-egg hunt: {n} of 12 found. Show hints" · "Egg {n} of 12 · {name}" · draft · "Reset the egg hunt" · draft · "Turn off easter eggs" · "12 / 12" |
| `egg.hunt.name.<HuntId>` ×12 | "The cursed coin" (pc-coin, spec) + 11 drafts in the same register |
| `egg.hunt.hint.<HuntId>` ×12 | spec §9.1 hint column ("I solemnly swear…", "Lumos — resume motion" = existing `pause.tooltip.resume`, "parley?", "Hold the coin to the moonlight", "HERE BE MONSTERS", "Kept for the one who proves worthy.", "Warm your hands by the fire", …; drafts where the hint is a drawing) |
| `egg.hunt.credit.<HuntId>` ×12 | spec §9.4 rows ("Solemn swearer — you" … "Warmed by the fire — you") |
| `egg.console`, `egg.parley.fallback`, `egg.quad.toast`, `egg.pen.read`, `egg.pen.win`, `egg.bone.note`, `egg.fire.toast`, `toast.lumos.os` | "12 eggs hide on this page (on a desktop browser)" · "Parley granted — the terms are at Contact." · "It flies. Take it up in Systems." · "Kept for the one who proves worthy. Read the whole ledger." · "Worthy." · "another bone for the collector" · draft · draft |
| `toy.compass.label`; `toy.drone.cmd/.pill/.gate/.next/.score/.rm/.help`; `toy.deadeye.pill/.survivor/.score/.fire/.release`; `toy.candles.lumos/.done` | "Spin Jack's compass"; "Fly the homemade drone" · "▲ Take off" · "Gate {n} of 7 · {title}" · "Next: the kill-list ↓" · "{n}/7 gates · {s} s" · "Motion is off: here is the flight plan" · draft; "DEAD EYE" · "Survived: not a target" · "{n}/5 marked · {s} s of Dead Eye left" · "Fire" · "Release"; "Lumos" · "The hall is lit." |
| `sound.name/.on/.off/.disabled` | "Sound" · "Sound on" · "Sound off" · "Sound follows motion: resume motion to hear it" |
| `dc.button/.sound/.stop/.speed/.act/.cmd/.paused` | "▶ Director's cut" · "(sound on)" · "■ Stop" · "2×" · "Act {n}/4" · "Play the director's cut" · "Motion is paused" |
| `chapter.heading/.prologue/.intermission/.credits`, `palette.play/.hints` | draft · existing strings where they exist (reuse, do not duplicate) · "Play" · "Show egg hints" |

### 4.5 Variant keys (C0-LIB registers DEFAULT and ALT; notes from the spec)
| key | DEFAULT | ALT | built by |
|---|---|---|---|
| `card-opening.choreo`, `card-seam.choreo`, `card-tintype.choreo`, `card-ignite.choreo` (update notes) | iris · wave→chalk · develop · burn→ink (GL + css tiers) | chart-unfold · wave→duster · Dead Eye ramp · burn→Lumos sweep | W2-CARDS + W2-GL |
| `card-opening.push`, `card-seam.push`, `card-ignite.push` | SEQ-PEARL · code camera on L08 1→1.35 · SEQ-HALL | code push on L01 · rack from the benches + 1→1.2 · code crane on L02 | W2-CARDS |
| `title.mask` | text-as-mask (GL SDF / css knockout) | rising title + plain bars | W2-CARDS + W2-GL |
| `match.shape` | fold (SDF morph) | roll | W2-GL (css: static SVG both sides) |
| `letterbox.breath` | slide (scaleY from edges) | iris-bars | B1-STAGE |
| `stage.camera` | drift per cue | push per cue | B1-STAGE (W2-PLATES refines) |
| `plates.loops` | living loop | code depth + camera on the still | W2-PLATES |
| `words.title-pirates/-idiots/-rdr2/-hp` | stamped · chalked · poster press · ink nib | branded · duster-reveal · typewriter · ink bleed | W2-WORDS |
| `words.scrub` | per-word opacity scrub | per-line clip sweep scrubbed over the same range | W2-WORDS |
| `words.physical` | grain-settle · ember strike | letter-jitter only · graphite strike | W2-WORDS |
| `words.flythrough` | gull glide · graphite gallop | shadow pass (the sprite's shadow crosses the image zone only) | W2-WORDS |
| `intro.titles` | three cards bottom-right (§4.3) | the same three strings as a short credit roll (translateY) | B1-INTRO |
| `post-credits.scene` | riderless broom | ink footprints walk to "↑ Back to the opening" and stop | W2-HUNT |

### 4.6 CSS partials (`app/p3/`) and owners
`foundation.css` B1-SCROLL · `stage.css` B1-STAGE · `type.css` B1-TYPE · `cards.css` W2-CARDS · `plates.css` W2-PLATES · `words.css` W2-WORDS · `game.css` W2-HUNT · `sound.css` W2-SOUND · `games.css` W3-GAMES · `world-pirates.css` W3-PIRATES · `world-idiots.css` W3-IDIOTS · `world-rdr2.css` W3-RDR2 · `world-hp.css` W3-HP · `cinema.css` W3-CINEMA. (B1-INTRO keeps `app/intro.css`; B1-RASTER edits component classes and `rdr2.module.css`.)

### 4.7 Check modules and probes (C0-WIRE creates stubs; owners fill)
Checks (`scripts/checks/`; spec §3.4 numbers): `lettering.mjs` (#10 moved) + `fonts.mjs` (spec check 8, glyphs, budgets) B1-TYPE · `beats.mjs` (1, 2, 3, 11, 12, 13 static, 14) + `travel.mjs` (5; W2-CARDS in W2) + `honesty.mjs` (6) + `unsigned.mjs` (10) B1-BEATS · `stage.mjs` (4) B1-STAGE · `hunt.mjs` (7) W2-HUNT · `sound.mjs` (9) W2-SOUND · `words.mjs` (scrub strings exact, physical tokens present) W2-WORDS.
Probes (`tools/capture/probes/`): `lenis.mjs`, `bundle.mjs`, `loaf.mjs` B1-SCROLL · `aa-scrim.mjs`, `decoder.mjs`, `split.mjs`, `layout-gates.mjs` B1-STAGE · `spotlight.mjs` B1-BEATS · `research-font.mjs`, `font-network.mjs` B1-TYPE · `cards.mjs` W2-CARDS · `gl.mjs` W2-GL · `plates-live.mjs` W2-PLATES · `words.mjs` W2-WORDS · `hunt.mjs` W2-HUNT · `sound.mjs` W2-SOUND · `games.mjs` W3-GAMES · `cinema.mjs` W3-CINEMA · `keyboard.mjs` P3-11 TOOLS.

### 4.8 `CueId` (C0-LIB, spec §10.3)
`broom-whoosh broom-land wave-wash wave-recede duster-swipe shutter flash-whumpf match-strike shimmer-rise letterbox-whum projector-start reel-runout impact-iris impact-chalk impact-flash impact-lumos title-sting typewriter-click compass-lid compass-ratchet compass-settle drone-hum drone-gate drone-finish deadeye-swell deadeye-scratch deadeye-strike deadeye-release candle-fwip hall-swell map-unfold ink-scratch lumos-bell nox-snuff snitch-flutter snitch-ting parley-creak flag-snap coin-ting hollow-wind kraken-rumble wave-slap heartbeat-2 quad-spinup pen-creak pen-ting eagle-shimmer bone-scratch fire-shift fire-crackle found-pirates found-idiots found-rdr2 found-hp hunt-complete postcredits-whoosh postcredits-chime toggle-click tts-lumos tts-nox tts-solemn tts-mischief tts-parley`.

---

## 5. Wave 1: Foundation (6 builders)

### 5.1 B1-SCROLL: smooth scroll, ladder, anchors, locks, fast lane, capture tools
- **Covers:** P3-2 (spec §3.1, §3.7 quiet window/ladder), the P3-10 fast lane (§11.3, DP-14), the enhancer framework.
- **Owns:** `lib/{smooth-scroll,gsap,use-scroll-scene,idle,ladder,flags}.ts`; `components/providers/smooth-scroll.tsx`; `components/site/boot-head-script.tsx`; `components/enhance/desktop-enhancer.ts` (not `binders/**`); `components/director/cut-overlay.tsx`; `components/site/{header,command-palette,hp-ink,use-active-section}.tsx`; `components/eggs/{marauders-map-dialog,egg-host}.tsx`; `app/p3/foundation.css`; `tools/capture/{motion.js,scenes.js,qa.js,browser.js,diff.mjs}`; `tools/capture/probes/{lenis,bundle,loaf}.mjs`.
- **Uses:** `whenQuietEnd`/`intro:*` events (B1-INTRO emits), `markWorldFontsReady` (B1-TYPE), `StageLayerPortal("cut")` (B1-STAGE), spotlight impl (B1-BEATS, loaded by the enhancer).
- **Builds:** Lenis wiring exactly per §3.1 (one clock, `virtualScroll` rule, `html.lenis, html.lenis body{height:auto}`, `scroll-behavior:auto`, `[data-lenis-prevent]`); created only when `DESKTOP_FINE && !motionOffNow() && pathname==="/" && introSettled && !quiet && !skip("smooth")`, re-checked after import; destroyed (never stopped) on RM/Pause; the warm-up ladder (a) chunk prefetch in idle slices during the flight or at page idle, (b) steps 1–5 each on scroll-idle or 1.5 s; `requestScrollRefresh` (200 ms debounce, deferred while gliding, `lenis.resize()` then refresh then sort; ResizeObserver on `<main>`, `fonts.loadingdone`, quiet-end once, stage mount; re-apply `location.hash` after the first refresh); `scrollToTarget` (native fallback with `motionOffNow()` instant, Lenis `force`, `block:"center"` number, `landAt` resolution for `#act-n` via `film.acts[].landAt × travel`, long jumps > 3 viewports immediate + cut, damped-p sync via `emit("scroll:jump")`, focus + `tabindex=-1`, push/replace history); the delegated bubble-phase `#` click handler; keydown-capture and `intro-armed` resets; `lockScroll`/`unlockScroll` replacing the three hand-rolled locks + `data-lenis-prevent` on the menu sheet, palette overlay/list, map dialog; call-site migrations: palette `go()` (fixes the Pause bug), `hp-ink.tsx` Time-Turner, `egg-host.tsx` 160/185/270 (await instead of 900 ms: B3); the boot head script (< 400 B: `html.js`, `data-motion-boot`, `[data-enhance-queue]` recorder); the enhancer loader (ladder step 2); **fast lane**: header Work pill relabelled "Skip to the research" at DESKTOP_WIDE (`data-fast-lane`, `href="#work"`, "Work" below 64rem), jump = `scrollToTarget("#work", { immediate, cut, focus, history:"push" })` after `markWorldFontsReady("idiots")`, `emit("fastlane")` (stops the director's cut and games), `track("fast_lane")`; `CutOverlay` (140 ms in → jump + `ScrollTrigger.update()` → 220 ms out; RM instant, no overlay); optional header settle probe on Lenis idle. **Tools:** `motion.js` waits on `window.__lenis?.isScrolling === false`, gains `?skip=smooth` A/B runs and `--vw=1024x768`; `scenes.js`/`qa.js` gain `--vw=<w>x<h>` and `--touch`; `diff.mjs <dirA> <dirB>` (per-frame % changed pixels, sharp).
- **Accept:** P3-2 #1, #2, #3, #9, #10, #12 (fast lane part); P3-10 #3 (visible over bars/games/cut, `#work` focused ≤ 400 ms with fonts ready, "Work" at 390).
- **Variants:** none of its own; `motion.js --runs=alt` keeps working.
- **RM/Pause:** Lenis destroyed ≤ 100 ms, page stays scrollable, anchors instant, ladder halts, no rAF left on the ticker.
- **Read:** gsap-scrolltrigger, gsap-performance, cinematic-gsap-lenis-motion-system, fixing-motion-performance; motion-infra map notes are folded into §3.1.

### 5.2 B1-STAGE: persistent stage, split, backdrop, bars, layers, decoder
- **Covers:** P3-2 (§3.2, §7.4 infrastructure, §7.5 data, §12.1 CLS/layout gates).
- **Owns:** `lib/{stage,sky,decoder-lock}.ts`; `components/stage/{stage-gate,stage,stage-video,stage-window,stage-layers,letterbox-bars,scrim}.tsx`; `components/sections/{SectionFrame,story-section}.tsx`; `components/site/{world-kit,about,about-bio,about-pillars,beyond,rdr2-frontier,footer}.tsx`; `components/sections/chapter/chapter-section.tsx`; `components/sections/credits/credits-section.tsx`; `app/page.tsx`; `app/p3/stage.css`; `scripts/checks/stage.mjs`; `tools/capture/probes/{aa-scrim,decoder,split,layout-gates}.mjs`.
- **Uses:** `pickCodec` (B1-INTRO), `loopFor`, `whenLadder(3)`, `useScrollScene`, `lib/page.ts` stage specs (B1-BEATS writes them from the §3.2 cue plan).
- **Builds:** the stage (two slots, cue positions measured on `ResizeObserver(document.body)` only, `mix`→slot B opacity, `local`→camera transform, `visibility:hidden` under own/opaque/card cues, camera per cue drift/push/pan per `stage.camera` DEFAULT/ALT); `StageVideo` (one `<video>`, DecoderLock priority 1, `video.src` from `pickCodec`, rVFC then fade; plays only at `mix ≤ .02`/`≥ .98`, posters during crossfades; releases one viewport before an `own` section); liveness `html[data-stage="live"]` after the first poster decodes; modes via `SectionFrame` from `entry.stage`: **backdrop** (transparent + one static scrim from `Scrim`; about `gutters`, credits `gutters`), **split** (boot-gate CSS grid from first paint; named container `split`; `split-stack` on the research grids of `chapter-section.tsx` claim/problem, approach + metric tiles and the Option Alpha block; `StageWindow` sticky SSR poster that turns transparent when live; rack focus by crossfading the 384 px rung), `own`, `opaque`; the beyond lower half as a left window; `<main>` and the credits `<footer>` get `relative z-[var(--z-main)]` after moving any fixed descendant into `StageLayers`; `StageLayers` + portal; `LetterboxBars` + `useLetterboxScene` (`--lb-h` per §7.4, 11svh cap below 80rem, `scroll-padding` while live, `focusin` opens bars); `lib/sky.ts` keyframes; `data-research` on the chapter data islands (reported figures `:223`, caveats/limitations `:185-188`, metric tiles) for B1-TYPE's guard; **footer:** the credits TYPE row lists the faces B1-TYPE ships (Pirata One, Cormorant Garamond, Kalam, Patrick Hand, Rye, Courier Prime, Nothing You Could Do, IM Fell English SC, Crimson Pro, plus the house faces) and a libraries row adds "GSAP (standard no-charge licence) · Lenis (MIT)".
- **Accept:** P3-2 #4 (AA probe passes for every text box, every cue, 1440 and 1024; split windows sticky and never empty; no split overflow at 1024), #5 (decoder log ≤ 1 playing at every sample), #11 (paused reload no reflow; Pause mid-scroll 0 shift; no-JS 1440 no travel/split/tail), #12 (z-scale). 390/RM/no-JS identical to P3-0 (diff).
- **Variants:** `stage.camera`, `letterbox.breath` (both sides).
- **RM/Pause:** stage never mounts under RM at boot; mid-session Pause → sections opaque (transparency off), split windows keep the poster, bars never mount, 0 video requests under RM, 0 layout shift.
- **Read:** core-web-vitals, fixing-motion-performance, gsap-scrolltrigger, web-design-guidelines.

### 5.3 B1-BEATS: beats in the manifest, validator, beats probe, spotlight, honesty copy
- **Covers:** P3-2 (§3.4, §3.8, §8.6 honesty in the Lenis commit).
- **Owns:** `lib/{beats,page,film,spotlight,spotlight-impl}.ts`; `components/primitives/use-enter-once.ts`; `components/site/capabilities.tsx`; `scripts/check-manifest.mjs`; `scripts/checks/{beats,travel,honesty,unsigned}.mjs`; `tools/capture/beats.mjs`; `tools/capture/probes/spotlight.mjs`; **attribute-only** `data-beat*` edits in any wave-1 file no other W1 builder owns.
- **Uses:** `onScrollIdle`/`scrollVelocity` (B1-SCROLL), the enhancer (loads the spotlight impl).
- **Builds:** `beats` + `tempo` on every `lib/page.ts` entry and `film.acts[]` (at `p × travel`), every row of spec §2.3 with kind, timing, star, weight, `push`, `pairWith`, `needsIdle`, world, act, `feature`; `estVh` seeded from spec §2.2 (d = h@1440/900, t = h@1024/768); `acts[].tempo/landAt(.45)/stage` (the act-1 program block backdrop spec); `stage` specs for about, trading-algos, optuna-screener (body), beyond, credits + `own`/`opaque` modes for the rest (§3.2 cue plan; plates only, DP-5); validator checks 1–14 as modules (gaps and pacing WARN → ERROR under RELEASE; rations, star spans, hooks, travel ERROR); retire the old #3/#4; `tools/capture/beats.mjs <base> --widths=1440,1024 [--write]` (scrolls `/?skip=intro&skip=smooth`, records every `[data-beat]` y, star, weight and the `?debug=spotlight` log; prints gaps, overlaps, spans, pacing, **declared-but-missing ids**; exits non-zero on a gap > 100vh or a span < 300 px; `--write` updates `estVh` in `lib/page.ts` and `lib/film.ts`); the spotlight impl (§3.8: middle-60% scroll ownership from rects cached on resize, time-star queue, `maxWait` 1.5 s → `skip`, `needsIdle` = velocity < 300 px/s for 600 ms, once per view, dropped when the host leaves, `?debug=spotlight`); `useEnterOnce({ star })`; honesty: `capabilities.tsx:116` reads the four `systems.meta.*` keys; the honesty lint catches unqualified claims (validator #6).
- **Accept:** P3-2 #6, #8; `beats.mjs` runs at 1440 and 1024 and writes `estVh`; spotlight log shows grants/waits/skips.
- **Variants:** none (data + arbiter).
- **RM/Pause:** the spotlight never loads; `request` resolves `skip` at once.
- **Read:** design-motion-principles, review-animations (for the pacing rules).

### 5.4 B1-RASTER: the raster diet (§12.1) + call-site migrations in its files
- **Covers:** P3-2 #7.
- **Owns:** `components/site/{principles-map,journey-voyage,ledger-reckoning,idiots-chalk,rdr2-graphite}.tsx`; `components/worlds/idiots/{plate-band,gauntlet-board,chalk,machine-board}.tsx`; `components/worlds/rdr2/{journal-spread.tsx,journal-sketches.ts,campfire-stage.tsx,kit.tsx,satchel.tsx,rdr2.module.css}`; `components/worlds/hp/{footprints,map-ink}.tsx`; `components/worlds/pirates/voyage-chart.ts`; `components/sections/ledger/lens-figure.tsx`; `components/sections/hero/velocity-layers.tsx`; `components/sections/films/finales.tsx`; `components/sections/act-card/frames/{board-fig,tintype,tintype-deadeye,ignite-lumos}.tsx` (overlay layering only).
- **Uses:** `scrollToTarget` (contract).
- **Builds:** the 8 items of §12.1 (principles 52 `will-change` → ≤ 8 + one Map scroll tracker instead of five; work plate-band `filter`/scale/clip-path entrances → transform/opacity and drop the 150%-wide `mix-blend-screen` sweep; journey sticky column promoted canvas + static cartouche; kill-list lens bracket by transform; writing's 8 live filters → baked graphite, title dot by transform; voices `campSticky` baked mask + opacity veil; hero velocity `will-change` + `--vn` only on change > .01; chalk filter never on a moving element, SVG overlays on photos on their own layers); `journey-voyage` waypoints → `scrollToTarget(el, { block:"center", focus, history:"replace" })`; `ledger-reckoning` row keys → `scrollToTarget(b, { block:"nearest" })`; `data-beat` for every existing beat hosted in these files (e.g. B10–B11 voyage, B17 board, B22 MachineBoard, B54 ribbons; rule in plan §8).
- **Accept:** P3-2 #7: headless `motion.js --runs=desktop` with `?skip=smooth` shows work, principles, journey, kill-list each ≥ 1.5× their baseline fps (3.2 / 3.3 / 3.5 / 3.9), CLS 0; 1440 and 390 frames visually unchanged (diff); `?variant=alt` runs unchanged.
- **Variants:** keep both sides of every touched piece (`journey.voyage`, `work.board`, `work.head`, `kill-list.reckoning`, `principles.map`, `writing.journal`, `voices.fire`) working and equal-looking.
- **RM/Pause:** no change in the RM captures.
- **Read:** fixing-motion-performance, gsap-performance, core-web-vitals.

### 5.5 B1-INTRO: hand-off fix + opening titles (P3-3), codec, hydration sentinel
- **Covers:** P3-3 (§4), the intro fast-lane link (§11.3), L05 host (§6.3), `pickCodec`.
- **Owns:** `components/intro/**`, `public/intro/intro.js`, `app/intro.css`, `components/sections/hero/{intro-phase.ts,hero-stage.tsx,hero-boot.ts,focal.ts}`, `components/primitives/media-frame.tsx`, `lib/{codec,motion}.ts`, `components/site/page-hydrated.tsx`. May run `node components/intro/build-controller.mjs`.
- **Uses:** `loopFor` (hero loop, L05), `scrollToTarget` (fast lane), `prefetchChunks` (B1-SCROLL), `titles.*` and `fastlane.label` keys.
- **Builds:** state machine `flight → warm → hold → reveal → end → titles` exactly per §4.2 (rVFC trail, idle `frame()`, trail fade by WAAPI, DPR 1.5; warm = poster `decode()`, `html.intro-warm` opacity .999, `fetch(heroLoop, {priority:"low"})`, `emit intro:quiet`; hold canvas → `killVideo()` → `intro-handoff` → `setInert(false)` in its own task → IntroBridge releases → phase `"handoff"` → wait for `data-media-state="playing"` (≤ 450 ms) and `page:hydrated` (≤ 1200 ms); reveal = compositor-only 300% stage with a static feather mask + counter-moved film, two WAAPI transforms in one task; delete the `mask-position` rules; the ALT map-fold uses a CSS/static feather (no new public file) and pre-draws `foldShade` once); title sequence §4.3 (3 cards in `#intro-caps`, WAAPI opacity + 8 px, exits, marks `intro:titles`/`intro:titles-end`, `intro:quiet-end` at titles end or on any exit); `FLIGHTS[*].loopAt` support; codec pick in the controller (vanilla, same rule) and `lib/codec.ts` for MediaFrame (webm/mp4 via `mediaCapabilities.decodingInfo` smooth + powerEfficient, H.264 on a tie; `video.src` set directly; `fade` override); `PageHydrated`; L05 living play screen (mounts after hydration + idle, pauses and releases on Play, 200 ms crossfade from its still into IN-02 frame 0; guarded by `loopFor("IN-01")`); DESKTOP_WIDE "Skip to the research" link in the overlay skip row (`dismiss()` then the jump); hero pointer-shift gain ramp 0 → 1 over 800 ms after the titles; DESKTOP_FINE flag replaces the duplicate in `media-frame.tsx:84`.
- **Accept:** P3-3 #1–#6 and the §4.4 table (`motion.js --runs=intro`: 0 `#intro` repaints in the reveal, no LoAF > 50 ms warm → titles end, hand-off script < 10 ms, name on the 2nd reveal frame, loop playing at reveal t0, fps/p95 no regression).
- **Variants:** `intro.titles`, and every existing `intro.*`/`hero.*` piece keeps both sides (the ALT landing uses the same compositor technique).
- **RM/Pause:** no intro and no titles under RM/`?skip`/seen; Pause mid-reveal → `finish()` at once; `capsStop(0)` on RM.
- **Read:** animate, fixing-motion-performance, emil-design-eng; the intro-hero map is folded into §4.

### 5.6 B1-TYPE: typography per world (P3-4) + the fonts registration
- **Covers:** P3-4 (§5).
- **Owns:** `lib/fonts.ts`, `lib/world-fonts.ts`, `components/providers/world-fonts.tsx`, `scripts/fetch-display-fonts.mjs`, `assets/fonts/film/**`, `public/fonts/**`, `app/globals.css`, `app/p3/type.css`, `app/layout.tsx`, `components/sections/hero/hero-section.tsx`, `components/site/metric-tile.tsx`, `components/sections/experiment/experiment-section.tsx`, `components/sections/ledger/ledger-section.tsx`, `scripts/checks/{lettering,fonts}.mjs`, `tools/capture/probes/{research-font,font-network}.mjs`, `docs/build/FONTS.md`. May run `node scripts/fetch-display-fonts.mjs` (network to Google Fonts).
- **Uses:** `whenLadder(5)`, `onIdle`.
- **Builds:** the §5.2 faces (head/body/lead per world, RFN faces from unmodified Google-served files, `glyphs.txt` beside each, licences beside each), registered in `lib/fonts.ts` (preload false) and referenced **only inside `@media (min-width:64rem)`** so phones fetch today's 54,336 B exactly; `[data-world]` blocks point at `--font-world-X-live` + set `--world-font-head/body/lead` and `--world-head-scale`; lazy per world (`html[data-fonts~="X"]` on approach, 150% margin, Pirates at mount, after quiet-end = ladder step 5; touch DESKTOP_WIDE via `onIdle`); `markWorldFontsReady` (≤ 300 ms); faces applied by CSS on the existing type steps (heads, body, lead) inside `[data-world]` and reset inside `[data-research]` (no TSX edits beyond the files owned); `type-name` + Pirata ASCII+ at `public/fonts/film/pirata-one/pirata-one-ascii.woff2` + `OFL.txt`, `@font-face` with a Geist-matched fallback under `@media (min-width:64rem)`, `ReactDOM.preload(…, { as:"font", type:"font/woff2", crossOrigin:"anonymous", media:"(min-width: 64rem)" })` in the layout; the h1 keeps its markup, mixed case, lh .96; `data-research` on metric tiles, the experiment section and the ledger data; validator #10 → "class allow + data deny" (allow list adds `components/words/**`, `components/site/chapter-select.tsx`, `scene-caption.tsx`), the `display` slot rules, glyph coverage, budgets; the §5.4 doc overrides in FONTS.md and the `lib/fonts.ts` / layout comments (SPEC/DESIGN lines: handoff to the assembler); the Kalam line-height ≥ 1.05 rule in CSS.
- **Accept:** P3-4 #1, #3 (desktop LCP ≤ 400 ms, mobile ±5%, CLS 0, the 390 trace fetches no new font), #4 (research probe 0 non-Geist text), #5, #6, #7. #2 (blind test) is P3-11.
- **Variants:** none (type); New Rocker is the documented fallback face if the 1024 blind test fails.
- **RM/Pause:** unaffected (static type).
- **Read:** better-typography, core-web-vitals, frontend-design; Next font docs.

---

## 6. Wave 2: Engines (6 builders)

### 6.1 W2-CARDS: the four pinned cards (P3-6 css tier, P3-7 act-title masks + subtitles, card push-ins, kraken)
- **Owns:** `components/sections/act-card/**`, `components/primitives/loaders/**`, `components/stage/{subtitle,carried-shape}.tsx`, `lib/{impact,derive,motion}.ts`, `app/p3/cards.css`, `scripts/checks/travel.mjs`, `tools/capture/probes/cards.mjs`, `app/lab/p3/cards/**`.
- **Uses:** `GlGate`/`GlCardSpec` (W2-GL), `LivePlate`/`CameraGroup`/`WeatherLayer`/`useFrameSequence({window})` (W2-PLATES), `markFound("pc-kraken")` (W2-HUNT), `sound.cue` (W2-SOUND), `spotlight.registerScrollStar`, `useLetterboxScene`, `SKY`, `markOf` with the spec §7.2 provisional marks as fallback constants until the assembler registers `marks.json`.
- **Builds:** D3-1 pin mode (`pinned = travelOf(kind) > 0 && desktopFine && !pausedAtBoot`; per-kind `--act-card-travel-*` only inside the boot gate; below DESKTOP_FINE today's `long`/driver/eligibility byte-for-byte; CSS sticky only); the opening's pin wrapper (`data-act-card-pin`, the p target, `bg-bg`) with `ProgramStage` as a transparent `backdrop` sibling (from `film.acts[0].stage`); damped p (λ ≈ 8/s, one rAF owner, snaps to 0/1, `scroll:jump` → p = p_raw; none under RM); two stars per card on the §7.1 ranges with the hooks at p ≤ .05, settle .45–.50; the css tier = today's DOM choreographies on the new ranges (opening inset aperture from the 12% disc as mask-on-transform; seam baked masks; tintype 3-plate stack; ignite burn/ink); the ALTs; MATCH_ROW `registerLine(plate, marks, row, maxZoom)` + zoom term in `coverBox`/`PlateBox`; carried shapes (static SVG fallback; GL spec for the morph); impacts (§7.6) via `impact()`; push-ins: #1 SEQ-PEARL frames on the card canvas (guarded `isMediaId`; ALT/fallback = code push on L01), #2 `CameraGroup` on L08 1 → 1.35 with FIG. 0 inside, #3 SEQ-HALL (ALT crane on L02), tintype sun push on L04 1 → 1.04; act titles: css-tier SVG knockout ×1 → ×6 over p .68–1 then crossfade, ALT rising title + plain bars, GL title via `GlCardSpec.b`; subtitles (the four loglines, static lines in the lower bars, spec §8.4 styling, AA on deep); the kraken (upper-bar "HERE BE MONSTERS" button, 2.0 s still dwell at p ≤ .05, DOM tentacle sprite above the canvas, css-tier swell, `uKraken` driven via the spec); `data-gl-replaced` on DOM layers GL replaces; weather in card frames; the global-bars hand-off rule (card geometry); B35's tintype half (latent ghost, sun mark on arrival); `[data-wand-zone]` on the act-4 frame's media layer; `data-beat` for B03–B06, B13–B15, B35 (tintype half), B36–B38, B48–B51; measured `landAt` and `maskOrigin` per title → handoff to `lib/film.ts` (asm); `DESKTOP_FINE` from `lib/flags.ts` (replaces `card-shell.tsx:131`); travel check reads `cards.css` and `film.cardTravel`.
- **Accept:** P3-6 #1, #2, #3 (hooks + `landAt` anchors), #6, #7, #8 (card side), #9, #10; P3-7 #1 (css tier + SR text), #4; P3-5 #3 (push-ins scrub inside star (b); first frame vs plate SSIM ≥ .95; the ICE push keeps FIG. 0 within 2 px at 1440).
- **Variants:** `card-*.choreo`, `card-*.push`, `title.mask`, `match.shape` (css side).
- **RM/Pause:** static settled card; no damping, impacts, swell (static tip + toast) or bars; subtitles static; anchors land at `landAt`.
- **Read:** gsap-scrolltrigger, animate, review-animations, design-motion-principles, emil-design-eng.

### 6.2 W2-GL: the contained WebGL layer
- **Owns:** `lib/gl/**`, `components/gl/**`, `tools/capture/probes/gl.mjs`, `tools/capture/motion.js` (the `?gl=force` run with `--use-angle=swiftshader --enable-unsafe-swiftshader`), `app/lab/p3/gl/**`.
- **Uses:** `onIdle`, `whenLadder(4)`, `getImageProps` (next/image), `GlCardSpec` from W2-CARDS, `SKY`.
- **Builds:** §3.3 in full: tiers (the probe context is the page context), one context re-parented between the four hosts (nearest-to-centre live host wins), `KHR_parallel_shader_compile` polling, context/SDF/compile/texture uploads as separate idle slices once the card is ≤ 2 (textures ≤ 1) viewports away, tier switch only at p ends, draw only on p change, LRU 3 plates, ≤ 25 MB, context-loss fallback, video → one `texImage2D` frame then release; the ten flavours (iris, wave + `uKraken`, chalk, duster, develop, deadeye, burn, ink, lumos, title SDF) with the shared header contract; the SDF title generator (EDT, cached); carried-shape SDFs (ring32, gear12, wheel12, snitch at rest); fade-in at a p end and `data-gl="on"`.
- **Accept:** P3-6 #4, #5 (one context, no compile during p motion), #6 (GL morph), #11; P3-7 #1 (GL SDF crisp at every scale); no LoAF > 50 ms at context creation or compile; ≤ 8 KB gz.
- **Variants:** implements the DEFAULT and ALT flavour of every card and `match.shape`.
- **RM/Pause:** tier `off`; no context is ever created under RM; Pause mid-transition → the card shows the static settled state (CARDS) and GL stops drawing.
- **Read:** fixing-motion-performance, gsap-performance.

### 6.3 W2-PLATES: every plate moves (engine) + stage refinements
- **Owns:** `components/primitives/{live-plate,camera,depth-plate,media-frame}.tsx`, `components/worlds/pirates/use-frame-sequence.ts`, `components/stage/{stage,stage-video,weather-layer}.tsx`, `lib/{loops,page}.ts`, `app/p3/plates.css`, `tools/capture/probes/plates-live.mjs`, `app/lab/p3/plates/**`.
- **Uses:** `pickCodec`, DecoderLock, `useScrollScene`, `spotlight` (none), `SKY`.
- **Builds:** `CameraGroup` (in-flow plates on ScrollTrigger `scrub:true` or motion's accelerated path; sticky/card plates may use motion `useScroll`; `will-change` only in view; pointer shift ≤ 6 px only on hero and stage), `DepthPlate` (two copies of one decoded `<img>`, static gradient masks along the registered line, far .4× / near 1×, ≤ ±1.5%), `LivePlate` (poster → `loopFor` loop on DESKTOP_FINE with motion on; decoder claim; outgoing video shown as a still before any incoming plays; RM → poster, 0 bytes; ALT = depth + camera), the sequence window mode (§6.2: compressed blobs, ±12 `ImageBitmap` window decoded ahead in the scroll direction off the main thread, `close()` outside, ≤ 1 sequence resident, ≤ 128 MB; `ready` semantics; JV keeps working), `WeatherLayer` (§7.7: ≤ 16 pre-rendered sprites per world as code/`assets/p3/plates/`, compositor keyframes, paused offscreen, never over text), stage refinements (depth on the two stage stills, per-cue camera ranges from §6.1, weather in the three split windows and the backdrops), `MediaFrame` renders `playOn="never"` while the stage covers it and serves WebM first per `pickCodec`; the stage-cue values in `lib/page.ts`.
- **Accept:** P3-5 #1 (MediaFrame, intro and StageVideo share `pickCodec`; the network shows the chosen encode), #5, #6; the plates-live probe passes for the stage, the cards and the hero (the other hosts land in W3).
- **Variants:** `plates.loops`, `stage.camera` refinements.
- **RM/Pause:** posters only, no camera transforms, weather cancelled, 0 video requests.
- **Read:** motion, gsap-performance, core-web-vitals, fixing-motion-performance.

### 6.4 W2-WORDS: word primitives (P3-7) + collapse primitive
- **Owns:** `components/words/**`, `components/enhance/binders/words.ts`, `components/primitives/{collapse,mask-reveal,scene-caption}.tsx`, `components/site/{world-kit,world-motion}.tsx`, `app/p3/words.css`, `assets/p3/words/**`, `scripts/checks/words.mjs`, `tools/capture/probes/words.mjs`, `app/lab/p3/words/**`.
- **Uses:** the enhancer, spotlight, `useScrollScene`, `sound.cue("typewriter-click")`, `requestScrollRefresh`.
- **Builds:** `InCharacterTitle` + `SectionHead inCharacter` + `SceneCaption inCharacter` (§8.2: 4 worlds × DEFAULT/ALT, armed offscreen, once per view, a time star through the spotlight, `skip` → simply there, masks on transforms, sprites as code/assets); `ScrubSentence` (§8.3: server-split words, per-word opacity .28 → 1 from 92% → 52% of the viewport on the accelerated path, reversible, never a number); `PhysicalWord` (§8.5: "noise" grain-settle, "Killed" ember strike that stays; one-shot 600 ms; time star); `FlyThrough` (§3.8 `needsIdle`; image zones and margins only; gull drawn as code; horse frames from the staged Muybridge trace, plan §9.3(d), passed by the host; absent → no fly-through); `Collapse` (§11.5 native `<details>`, phones expanded via `::details-content`, `interpolate-size`, RM instant, refresh on toggle); the words binder; `words.mjs` checks that the four scrub strings are exactly spec §8.3's and that each physical token exists in its host copy.
- **Accept:** in `/lab/p3/words` and on the About/Work/Beyond/Principles hosts after W3: P3-7 #2, #3, #5, #6. Here: SSR text identical with and without the enhancer; no-JS readable; phones untouched.
- **Variants:** `words.title-*`, `words.scrub`, `words.physical`, `words.flythrough`.
- **RM/Pause/no-JS/phones:** full text, no animation, spotlight never loaded.
- **Read:** animate, motion, better-typography, emil-design-eng, design-motion-principles.

### 6.5 W2-HUNT: the hunt core, spells, chip, panel, 12/12, post-credits
- **Owns:** `lib/{hunt,film,quotes,sections}.ts`, `components/eggs/**` except `dead-eye.ts`, `components/site/{command-palette,footer,post-credits}.tsx`, `components/primitives/motion-toggle.tsx`, `components/enhance/binders/hotspots.ts`, `app/p3/game.css`, `scripts/checks/hunt.mjs`, `tools/capture/probes/hunt.mjs`, `assets/p3/hunt/**`.
- **Uses:** `StageLayerPortal("toast")`, spotlight, `sound.cue`, `startDirectorsCut` (stub), `scrollToTarget`.
- **Builds:** §3.6 store (localStorage v1, try/catch, cap 12, `storage` sync, `markFound` idempotent + `hunt:found`), Obliviate keeps the count, "Reset the egg hunt" with confirm, eggs-off hides chip + hints and keeps the count; the four spells (hp-map, hp-lumos incl. the media light ±10% + wand-tip bloom at the Pause control for typed/palette only, pc-parley typed word + fallback toast, 3i-aal typed buffer) + hp-snitch (`snitch.tsx` counts via the hunt; SEEKER row reads the hunt: B10); the palette: hunt eggs hidden from the empty-query browse list, surfaced by their spell words, a "Play" group (Fly the homemade drone → scroll to systems + focus `#drone-takeoff`; Dead Eye; Show egg hints; Reset the egg hunt; Play the director's cut → `startDirectorsCut()`); `HuntChip` (§9.3; fixed width reserving "12/12"; DESKTOP_FINE by media query; tick 400 ms on `hunt:found`), the lazy `hunt-panel.tsx` popover (non-modal, Esc), toasts moved into `StageLayerPortal("toast")` and kept clear of the fast lane (B8); 12/12 (gold chip, `HuntCredits` rows, Q-HP-2 via `FilmQuote`, 3-note sting cue); the post-credits 60vh tail under the boot gate + scene (tail ≥ 50% in view + 1 s dwell, once per session, time star; riderless broom from `components/intro/broom.ts`, 12/12 extended cut; ALT footprints; RM static broom; `data-beat` B58); `EggHotspot` + the hotspots binder; egg-host: every counted egg calls `markFound`, typed keys ignored while `html[data-game]` (B9), the Pause control never triggers or counts (motion-toggle); patronus off (B2); the console line; `recordLedgerRowRead`/`recordDeadEyeWin`/`worthyOfPen` storage; hunt check (exactly 12, 3 per world, hint key, `keyboard:true`, an RM state, `browse:false`).
- **Accept:** P3-8 #1, #2, #3, #7, #8, #9 (B2, B3 verified, B9, B10).
- **Variants:** `post-credits.scene`.
- **RM/Pause:** no tick, spell effects per §9.1 RM column (`toast.lumos.os`), broom static, Pause silent and never counted.
- **Read:** web-design-guidelines, emil-design-eng, vercel-react-best-practices.

### 6.6 W2-SOUND: sound (P3-9)
- **Owns:** `lib/audio/**`, `components/audio/**`, `docs/build/SOUNDS.md`, `scripts/checks/sound.mjs`, `app/p3/sound.css`, `tools/capture/probes/sound.mjs`, `app/lab/p3/sound/**`.
- **Uses:** `lib/events.ts` (impact, hunt:found, egg:trigger, letterbox, transition:meet, game:*, toy, post-credits, dc:*), the active-section store (`use-active-section.ts`), `motionOffNow`, the Pause store.
- **Builds:** §3.5 + §10: store (sessionStorage "sound", muted every new visit, SSR muted), the engine chunk + `AudioContext` created only on the first unmute click, procedural recipes for every `CueId` and the five beds (§10.2) with the mix rules, bed crossfade by the world at the reading line (300 ms debounce, 1.5 s equal-power), ducking, event listeners, `sound.loop` handles (drone hum), `sound.borrow()` for the director's cut, TTS/CC0 files decoded into `AudioBuffer`s from `public/audio/**` (Opus WebM, MP3 fallback by `canPlayType`), fetched only after the first unmute, played by `AudioBufferSourceNode`; suspend on Pause, RM or hidden tab < 100 ms; `SoundToggle` (speaker SVG, `aria-pressed`, tooltips, `aria-disabled` + note under RM/Pause, one soft click on the first press); SOUNDS.md table (id, source, licence, edits, bytes); check #9.
- **Accept:** P3-9 #1–#4; #5 (the manual listen) is recorded by the W2 assembler.
- **Variants:** none (sound is not a registered animation).
- **RM/Pause:** suspended, toggle disabled with its note, nothing before Play, intro silent unless unmuted.
- **Read:** vercel-react-best-practices.

---

## 7. Wave 3: Hosts, games, cinema (6 builders)

Common duties for every W3 builder: wire every plate in your files to `LivePlate` with the §6.1 camera row (loops light up via `loopFor` as the assembler registers them); route your world's existing time-star signatures through the spotlight (`useEnterOnce({ star })`); put `beatAttrs` on every beat of plan §8 you host; keep both variants of every existing piece in your files working; RM/Pause per §12.2.

### 7.1 W3-GAMES: the drone game, Dead Eye, the kill-list and systems band
- **Owns:** `components/games/**`, `components/eggs/dead-eye.ts` (retire), `components/worlds/idiots/drone-band.tsx`, `components/site/{capabilities,ledger-reckoning}.tsx`, `components/sections/ledger/**`, `app/p3/games.css`, `assets/p3/games/**`, `tools/capture/probes/games.mjs`, `app/lab/p3/games/**`.
- **Builds:** §9.2 #2 the homemade drone (pill `#drone-takeoff`, course, physics, keyboard only in the focused field, Esc lands, auto-land below 50% visible, no crash/fall/fail/bounce, live-region gate titles verbatim, best time, pre-rasterized chalk sprite, `html[data-game]`, HUD via `StageLayerPortal("game-hud")` if fixed, B26 invite on scroll-idle through the spotlight, L07 `LivePlate` drift that holds still while flying); §9.2 #3 Dead Eye (pill with the eye-ring glyph, typed/palette paths, B28 invite, `scrollToTarget` centring, draw/paint/fire/read/exit per spec, time → 0.25× incl. `gsap.globalTimeline.timeScale` (B5), grade as an opacity overlay on the media layer (B6), roving focus over the 5 killed rows, verbatim reasons and existing links, best in `aryan:games:v1`, `recordDeadEyeWin`); `recordLedgerRowRead` as rows reach the reading line; the "Killed" physical word (B29); systems FIG (existing) data-beat; the §8.6 capabilities copy stays. (The kill-list head's PenInset lives in `plate-band.tsx`: W3-IDIOTS gives it L17 and the `3i-pen` egg.)
- **Accept:** P3-8 #4, #5, #9 (B5, B6); P3-7 #5 (Killed); INP ≤ 200 ms.
- **RM/Pause:** drone take-off disabled + static labelled course; Dead Eye untimed, instant; Pause lands the drone and pauses Dead Eye.
- **Read:** animate, web-design-guidelines, emil-design-eng.

### 7.2 W3-PIRATES: Act I hosts (about, journey)
- **Owns:** `components/site/{about,about-bio,about-pillars,journey,journey-voyage,journey-chart,journey-experience,journey-stack,journey-carousel}.tsx`, `components/worlds/pirates/**`, `app/p3/world-pirates.css`, `assets/p3/pirates/**`.
- **Builds:** About h2 stamped in character (B07); the Act I scrub sentence on pillar 02 (B08); the compass toy (§9.2 #1, `use-compass-spin.ts`, button wrapper, spin/drag/keyboard, needle only springs to pillar bearings, lid clicks, sounds) + its B08 invite; the philosophy note in `Collapse`; the journey sticky column starting at its h2 and the stage → JV frame 0 match cut (B09, `pairWith` the stage cue); JV on the sequence window mode; L19/L20 at-rest swaps (B11–B12 quiet); the gull fly-through in the voyage window's sky (B12); `pc-coin` (≥ 44 px button, moon-silver sweep over the brass layer only, RM instant swap); the "parley?" marginal hint by the brass X (B11).
- **Accept:** P3-7 #2/#3/#6 for Act I; P3-8 #1/#6 for pc-coin and the compass.

### 7.3 W3-IDIOTS: Act II hosts (work, chapters, experiment)
- **Owns:** `components/site/{projects,gauntlet-tabs,idiots-chalk}.tsx`, `components/worlds/idiots/**` except `drone-band.tsx`, `components/sections/chapter/**`, `components/sections/experiment/**`, `app/p3/world-idiots.css`, `assets/p3/idiots/**`.
- **Builds:** the Work HeadBand settles as it enters (top at 90%, no armed-at-0) + L18 (B16); the Work h2 chalked in character (B16); the board L09 loop (no camera) and the gauntlet chalk (existing, B17); the Run invite (B18) + `3i-quad` counts via the hunt + the chalk.tsx `eggs:off` fix (B1); the Act II scrub sentence on "learned" (B21); the optuna MachineBoard L16 drift (B22); the physical word "noise" (B23); the `3i-aal` chalk heart (press-and-hold 600 ms / Enter) on the ICE board ledge; the optuna appendix collapses (Option Alpha as one whole block with `optuna.appendix.summary`, supporting list, earlier repos; never split a claim from its caveat) and the chart-slot placeholders removed at every width; the experiment curve draws once with its "Synthetic • illustrative" label visible from frame 1, and its empty head tightened (B25, H4: no film); `3i-pen` on the PenInset via `worthyOfPen()`, plus the PenInset's L17 drift (the kill-list head band renders it).
- **Accept:** P3-10 #5 (optuna part); P3-7 for Act II; P3-8 #1 for 3i-aal/3i-quad/3i-pen.

### 7.4 W3-RDR2: Act III hosts (beyond, writing, voices)
- **Owns:** `components/site/{beyond,rdr2-frontier,rdr2-graphite,writing,testimonials}.tsx`, `components/worlds/rdr2/**`, `app/p3/world-rdr2.css`, `assets/p3/rdr2/**`.
- **Builds:** FrontierBand L04 push continuing 1.04 → 1.08 from the card's end scale (B39); the Beyond h2 poster-pressed (B40); `rd-eagle` (eye-ring glyph button at the TrailMap start; media greys 1.5 s, trail brightens to the tent); the Act III scrub sentence (B42); L15 on the WANTED plate with the HTML WANTED registered (B43); `rd-bone` (graphite bone in `journal-sketches.ts`, a `<button>` outside the aria-hidden page, pencilled note); the graphite horse fly-through along the journal's bottom edge (B45) + vignettes also swapping as entries cross the reading line; the camp fade-up (B46); voices: camp drift toward `marks.fire` 1 → 1.04 (no bars, no subtitle), night veil, the quote into firelight, fireflies, `rd-fire` (hover 0.8 s or the ≥ 44 px hotspot; brightness on a masked plate region + ≤ 16 embers; toast never near the WANTED bill) (B47).
- **Accept:** P3-7/P3-8 for Act III; P3-5 #4 for its plates.

### 7.5 W3-HP: Act IV hosts (principles, contact)
- **Owns:** `components/site/{principles,principles-map,principles-stage,principles-lumos,contact,contact-scene,contact-finale,hp-ink}.tsx`, `components/worlds/hp/**`, `app/p3/world-hp.css`, `assets/p3/hp/**`.
- **Builds:** the map unfold (existing, weight 1 breath, B52); the Principles h2 inked with a nib (B53); the Act IV scrub sentence in room 05 (B55); the `hp-map` hint line on the banner (aria-hidden); the wand cursor (`cursor:url(…) 3 3` on non-interactive areas; one 96 px bloom below text inside the media/art layer; rAF only while moving) in `#act-4 [data-wand-zone]`, `#principles`, `#contact`; the candle toy (per-candle `lit` in `hall-ceiling.tsx`, arms dark only on the first pointer move inside `#contact` after it was fully offscreen, 56 px radius, never self-lights, 39 lit → copy-flare + "The hall is lit.", "Lumos" button, sounds); contact MV-08 → MV-09 `LivePlate` drift; the bracket close through the spotlight (B56).
- **Accept:** P3-8 #6 (candles), P3-7 for Act IV, P3-8 #1 for hp-map's hint.

### 7.6 W3-CINEMA: films, credits, director's cut, chapter select, analytics
- **Owns:** `components/sections/films/**`, `components/sections/credits/**`, `components/site/{footer,chapter-select}.tsx`, `components/eggs/snitch.tsx`, `components/director/**`, `components/enhance/binders/dc.ts`, `lib/analytics.ts`, `app/p3/cinema.css`, `tools/capture/probes/cinema.mjs`, `app/lab/p3/cinema/**`.
- **Builds:** "house lights down" (`useLetterboxScene`: close over 40vh at the INTERMISSION head, open when the Pirates frame centres, B30–B31); the four film titles in character (B31–B34); loops L14/L22/L21/L13 via `LivePlate` with the 1 → 1.05 push; the outgoing loop shown as a still before the incoming plays; the warm point descending onto the tintype's sun (B35 films half, `pairWith` the card); credits: the long provenance/quote lists in `Collapse` (the H3 fan-tribute line byte-for-byte, "To be continued." and "Mischief managed." stay visible), the Snitch dart through the spotlight (B57); the director's cut (§11.1: shot list from the manifest beats and `estVh`, chained `lenis.scrollTo` per tempo speed, dwell by weight, 2×, stops on any input/Esc/Pause/fast lane, stop pill in `StageLayerPortal("stop")`, `sound.borrow()`, never plays a toy, invisible on touch DESKTOP_WIDE, the enhance-queue replay); the chapter select (7 tiles, lazy `next/image` 320w on open, act titles in world face, "▶ Director's cut" first, `scrollToTarget(anchor, { cut, focus, history:"push" })`, act tiles at `landAt`); analytics (§11.4: `depth`, `act`, `chapter`, `directors_cut`, `?debug=analytics`; no network without the env flag).
- **Accept:** P3-10 #1, #2, #4, #5 (credits part); P3-6 #8 (films bars); P3-5 #4 for the films plates; P3-2 #5 (films crossfades through a still).

---

## 8. Beat ownership (who puts `data-beat` on which beat)
Existing beats are tagged in wave 1 by the file's W1 owner, else by B1-BEATS (attribute-only). New beats are tagged by the builder that builds them.

| beats | owner |
|---|---|
| B00, B01, B02 | B1-INTRO |
| B03–B06, B13–B15, B36–B38, B48–B51; B35 card half | W2-CARDS (B06 existing: tagged in W1 by B1-BEATS) |
| B19 (window arrival) | B1-STAGE |
| B58 | W2-HUNT |
| B07–B12 | W3-PIRATES (existing B10–B11: tagged in W1 by their file's owner) |
| B16, B18, B21, B23, B25 | W3-IDIOTS (existing B17, B20, B22, B24: tagged in W1 by their file's owner, else B1-BEATS) |
| B26, B28, B29 | W3-GAMES (existing B27: B1-BEATS in W1) |
| B39, B40, B42, B45, B47 | W3-RDR2 (existing B41, B43, B44, B46: tagged in W1) |
| B53, B55 | W3-HP (existing B52, B54, B56: tagged in W1) |
| B30–B34, B35 films half, B57 | W3-CINEMA |

---

## 9. Media lane (parallel with every code wave)

### 9.1 State at planning time (from `docs/build/media/p3/B1–B6.md`, `tools.md`)
- **Spent 265.5 credits** (B1 56 · B2 49 · B3 42 · B4 42 · B5 31.5 · B6 45); balance ≈ **241** (re-read before any submit).
- **23 loop masters** generated: L01–L06, L08–L24. **Checked PASS (13):** L01, L02 (flagged), L05 (broom hold-out), L06, L08 (near-still), L09, L10 (wall/column hold-out), L11 (near-still), L12 (flagged), L14 (blend seam), L15 (poster hold-out, near-still), L16 (near-still), L17 (stopwatch hold-out, near-still). **FAIL (3), all "motion not delivered" (near-still):** L03 camp, L04 frontier, L13 express; each FAIL JSON carries a retake prompt that names one continuous, visible motion (the lesson: "extremely restrained … one slow even cycle" + a pinned end frame lets Kling return a still). **Unchecked (7):** L18–L20 (B5), L21–L24 (B6). **Not generated:** L07, L25, SEQ-PEARL, SEQ-HALL, TTS.
- **Staged, unregistered** in `docs/build/media-staged/p3/accepted/`: the six 0-credit re-seams (MV-03, MV-03-alt, MV-11L, MV-11L-alt, MV-09, MV-09-alt, in `reseam/`) and the 13 passing loops.

### 9.2 Cost cap and reserve
- **Cap:** cumulative Phase-3 spend ≤ **350** → **≤ 84.5 more**. **Floor:** before every submit, `balance − cost ≥ 156.5` (target); the hard minimum reserve is 100. If a `balance` call fails, do not submit.
- **Protocol:** `get_cost` preflight per distinct config; batches ≤ 4 (`generate_video_batch`); `declined_preset_id = 24bae836-2c4a-48e0-89b6-49fcc0b21612` ("IN THE DARK") on every preflight and item; `jobs_wait`, then one `show_generation_by_ids`; downloads from `d8j0ntlcm91z4.cloudfront.net` into `media-src/p3/masters/`; every job logged in a batch file `docs/build/media/p3/B<n>.md` (the assembler copies rows to `LOG.md` and `LEDGER-p3loops.md`). Prompts = spec §6.3 PREFIX + MOTION + STILL + SUFFIX; never name a film, character, studio or place. **Retakes use their FAIL JSON prompt**, which names the one continuous, visible motion the plate needs (three near-still failures so far).

### 9.3 Agents and ranked queue
**M-CHECK (0 credits; start now):** the check step for B5 and B6 (L18–L24; B3 and B4 are done) per `tools.md` §5: `loop.mjs seam --method=residual` (K per batch notes; boomerang only L21 if the seam reads static), `check` on both encodes with `--plate`, `--static`, `--light`; the open items the batch logs list (L21 homestead zone 1.35/255, L24 sun disc 1.94/255, L22/L23 21:9 crop vs the 2520×1080 still + `-an`, L22 ripple rings and reflection wash vs "restrained", L23 glints vs the sparkle rule); the L2 sweep at 0/25/50/75/100% with 100–200% crops; verdict JSON + staged files (`<stem>-loop.{mp4,webm,json}`, `-poster.webp`) or `<stem>-loop.FAIL.json` with a retake prompt. Report the FAIL list to M-GEN.

**M-GEN (credits; start now; in this order):**
| rank | job | model / settings | credits | cumulative |
|---|---|---|---|---|
| 1 | SEQ-PEARL (push-in #1 DEFAULT) | kling3_0 pro 5 s, start image iconic-pearl job 4273a1be, start frame only, "slow steady dolly-in toward the ship" + locked prefix/suffix minus the camera-lock sentence | 8.75 | 274.25 |
| 2 | SEQ-HALL (push-in #3 DEFAULT) | same, start image iconic-hall 1ef4355e, "slow steady dolly-in along the tables toward the high table" | 8.75 | 283 |
| 3 | L03 camp retake (voices: 0.74 of the viewport) | kling3_0 pro 8 s start = end 3c420eac, the FAIL JSON's fire-only prompt | 14 | 297 |
| 4 | L04 frontier retake (3 hosts) | kling3_0 pro 8 s, uploaded media 3a486a0a, the FAIL JSON's breeze/tail prompt | 14 | 311 |
| 5 | L07 drone band | kling3_0 pro 6 s start = end 69cafb24 (boomerang allowed) | 10.5 | 321.5 |
| 6 | TTS × 5 lines × 2 takes ("Lumos", "Nox", "I solemnly swear that I am up to no good", "Mischief managed", "Parley") | `qwen_audio_tts`, a generic preset voice (never "Arthur", never a film reference), instruction "a hushed, breathy whisper" | ≤ 10 | ≤ 331.5 |
| 7 | contingency: ONE retake of the highest-ranked failure by host rank (films screens > work/optuna/kill-list heads > journey at rest). Today that is **L13 express** (films HP screen; FAIL JSON prompt on the reusable upload d5d4bc0f), unless B5/B6 checking fails a higher-ranked host | per its FAIL JSON | 10.5 (≤ 12; ≤ 18.5 only for a T1) | ≤ 342–350 |
- **Never:** L25 (cut first); a second retake of anything; a SEQ retake (a SEQ that fails L2 or first-frame SSIM ≥ .95 hands DEFAULT to its code ALT); any Higgsfield music/SFX model; Kling "sound on"; anything imitating an actor.
- A retake that fails again → the code ALT (depth + camera) becomes that host's DEFAULT; flag it.

**M-AUX (0 credits):**
(a) **marks** (deadline: before the W1 assembly ends): re-measure on the 2560 files MV-10 `horizon`; iconic-camp `lake`, `wheel`, `wheelR`; iconic-hall `tableL`, `tableR`; the same on MV-10-alt, iconic-camp-alt, iconic-hall-alt, iconic-deadeye → `docs/build/media-staged/p3/marks.json` + method notes in a batch file.
(b) **SEQ post-processing** (after M-GEN 1–2; deadline: W2 assembly): `loop.mjs sequence --frames=72 --width=1280`, first frame vs plate SSIM ≥ .95, the L2 sweep, `seq-pearl-end.webp` / `seq-hall-end.webp` (the stage hand-off stills) → `accepted/seq-pearl/`, `accepted/seq-hall/`.
(c) **Optional:** re-blend IN-02's last 12 frames into MV-03 frames 0–11 and propose `FLIGHTS["IN-02"].loopAt = 0.5`; tag encodes BT.709 (deadline: W1 assembly, else skip).
(d) **The graphite horse** (deadline: W3 start): fetch Muybridge "The Horse in Motion" (1878, public domain, Wikimedia Commons), trace 8 frames to SVG path data, jockey omitted, graphite style → `docs/build/media-staged/p3/sprites/horse/frames.json` + provenance (source URL, licence, edits).
(e) **TTS post-processing:** Opus WebM 48 kHz mono 48–64 kbps + MP3 96 kbps fallback, ≤ 10 KB each, `loudnorm`, staged in `accepted/audio/` with a SOUNDS row draft.
(f) CC0 sea wash only if W2-SOUND hands off a request.

### 9.4 Registration (every assembler, for everything newly staged)
1. Loops/re-seams: copy into `public/media/films/` (re-seams overwrite the same names; W1 sets `durationS` 8.04 → 8.0 on the six and updates their provenance from each JSON's `manifestChanges`). New loop rows: `kind:"video"`, `src`, `webm`, `poster` = plate, `endsOn` = plate, `durationS`, `reduced:"poster"`, `provenance: hf(model settings, credits, jobId, notes)`, `accept` clean with `checkL2: "claude:<date>+aryan:pending"`, `codeAlt: "code:plate-camera"` (DP-8), `status:"accepted"`.
2. Sequences: `public/media/films/<seq>/000–071.webp` + a `kind:"sequence"` row + the end still as an image row.
3. Marks: `marks.json` → `lib/media.ts` marks on each plate.
4. Audio: `public/audio/<id>.{webm,mp3}` + a `docs/build/SOUNDS.md` row (source, licence, edits).
5. Horse frames: `components/words/sprites/horse-frames.ts` (asm writes it from `frames.json`, provenance in its header and in LOG.md).
6. Append the batch rows to `docs/build/media/LOG.md` and `LEDGER-p3loops.md`; then `npm run check`.

---

## 10. Assembler checklist

### 10.1 Every wave
1. **Collect** every builder return. **Ownership audit:** `git status --porcelain` vs plan §2/§4–§7 globs; any file outside its builder's globs → revert that hunk or accept it explicitly and note it in the commit.
2. **Handoffs:** apply in this order: `lib/film.ts` → `lib/page.ts` → `lib/variants.ts` (flip an ALT a builder could not build to `alt:null` + `plan`, and list it) → CSS/validator/doc items.
3. **Register media** (plan §9.4).
4. `npm run check`; `RELEASE=1 npm run check` (expected failures only per DP-9; save the printed unsigned list); `npx eslint .`; `npm run build`. Fix or route every failure.
5. Serve `npx next start -p 3161`; run: `node tools/capture/beats.mjs http://localhost:3161 --widths=1440,1024` (from W2: `--write`, then rebuild); `node tools/capture/p3-probes.mjs http://localhost:3161 docs/build/motion-strips/p3-w<n>/probes --vw=1440x900` and `--vw=1024x768`; `node tools/capture/motion.js … --runs=desktop,intro,alt,rm` at both widths (+ `?skip=smooth`; from W2 + `?gl=force`); `node tools/capture/scenes.js … --only=desktop,intro,alt,rm` at both widths and `--only=mobile` at 390; `node tools/capture/diff.mjs` of the 390, 844×390 and 1024×1366 frames against the base (DP-18): only the spec §13 intended 390 changes may differ; `node tools/capture/qa.js`.
6. Check the wave gate (below). Fix small faults; for a large one, run a follow-up builder with a disjoint glob before committing.
7. Record Appendix A overrides in the docs where each rule lives (W1: SPEC/DESIGN/ICONS/MOTION-REPORT/AUTOPILOT; the rest as features land).
8. Tick `CONTINUE.md` (one-line outcomes), commit ("P3-<n> …", attribution lines), push `design/three-films`. Never merge, never force-push.

### 10.2 Wave gates
- **W1.0:** plan §4.3.
- **W1:** also build the base worktree and capture the baselines (DP-18). Register the re-seams, the six passing loops, every M-CHECK pass, `marks.json`, and (c) if staged. Gate: P3-2 #1–#12 (P3-2 #5's films crossfade waits for W3; the decoder log must still hold everywhere else), P3-3 #1–#6 with the §4.4 table, P3-4 #1, #3–#7; beats probe runs and lists gaps (WARN) and missing ids; 390 unchanged except the capabilities/`systems.pencil.body` strings; initial route ≤ +6 KB gz JS and CSS; gsap/lenis absent from first-load chunks. Commit, then CONTINUE ticks P3-2, P3-3, P3-4.
- **W2:** register the SEQs, TTS, new loop passes; apply CARDS' `landAt`/`maskOrigin`; `beats.mjs --write`. Gate: P3-6 #1–#11, P3-7 #1 and #4, P3-8 #1–#3 and #7–#9, P3-9 #1–#4 (+ #5 manual listen noted), P3-5 #1, #3, #5, #6; no star span < 300 px; one GL context and one decoder in every sample. Tick P3-6 and P3-9.
- **W3:** register the horse frames and any contingency retake. Gate: every remaining §13 item for P3-5, P3-7, P3-8, P3-10, plus P3-2 #5 (films); beats probe: 0 gaps > 100vh at both widths, 0 declared-but-missing ids, spotlight log clean in a scripted scroll. Tick P3-5, P3-7, P3-8, P3-10.

---

## 11. P3-11 critic loop (up to 3 rounds)

### 11.1 P3-11.0 TOOLS (one builder; owns `tools/capture/{screencast.mjs,anon.mjs,score.mjs,clips.mjs}`, `tools/capture/probes/keyboard.mjs`, and `motion.js`/`scenes.js`/`qa.js` for fixes)
- `screencast.mjs --profile=reader|skimmer --vw=<w>x<h>`: Lenis on, headed Chrome (via `xvfb-run` when available, else `--headless=new`, labelled in the output); reader ≈ 250 px/s with a 2 s pause at each h2; skimmer = pixel-mode wheel flings ≈ 2,500 px/s with an inertial tail; frame timings + LoAF observer + `?debug=spotlight` log; `clips.mjs` cuts 1 s clips and per-screen contact sheets.
- `anon.mjs`/`score.mjs` at 1024 as well as 1440; `keyboard.mjs` walks every toy and egg by keyboard only.

### 11.2 Capture matrix (per round; `docs/build/motion-strips/p3-r<r>/`)
reader + skimmer screencasts at 1440×900 and 1024×768; `scenes.js --only=desktop,intro,alt,rm` at both widths + `--only=mobile` at 390; `motion.js --runs=desktop,intro,alt,rm` at both widths, default vs `?skip=smooth`, plus `?gl=force`; `beats.mjs --widths=1440,1024`; `p3-probes.mjs` (all) + `qa.js`; the card hook frames (p .05) at both widths; `anon.mjs` blind captures; the director's-cut capture (shown only to its own axis).

### 11.3 Judges (fresh subagents, captures only, no repo or build context; score each axis 1–5 with findings `{screen, t, clip, finding, severity}`)
| judge | axis | input | pass bar (spec §13 P3-11) |
|---|---|---|---|
| J1 STAR | one star per screen | 1 s clips, both profiles, both widths | ≥ 90% reader clips exactly one star; none only in declared breaths; 0 clips with two or more |
| J2–J4 PANEL | would you keep scrolling · tempo · game discovery | reader capture per screen | ≥ 80% "yes" per act, no two consecutive "no", hand-off + 4 cards + first Work screen "yes"; tempo named correctly by ≥ 2/3; chip + one invite noticed within 3 screens |
| J5–J7 STRANGERS | blind stranger test · hooks | `anon.mjs` captures, p .05 card frames | recognizability ≥ P3-0 per world; the name read 3/3 at 1440 and 1024; 0 "can't read"; fast lane found ≤ 10 s by 3/3; each hook 3/3 |
| J8 SMOOTH | smoothness | motion.js tables, skimmer frame timings, Aryan's laptop recording if any | §12.1 headless targets and §4.4 met |
| J9 HONEST | honesty + a11y | check / RELEASE output, research-font probe, RM run (no motion, no sound, 0 video bytes), Pause mid-scroll (0 shift, silent), keyboard pass, AA probe | green; RELEASE fails only per DP-9 |
| automated | no dead screen | `beats.mjs` + strips | 0 gaps > 100vh; every §2.4 stretch shows its fill |

### 11.4 Fix loop
Triage (the assembler) merges and deduplicates findings, maps each to the owning globs of plan §2/§5–§7, and groups them into ≤ 6 **fixer builders** with disjoint globs (same builder rules, one return each). Assemble, re-capture the affected axes plus one full reader pass, re-judge with new judge instances. **Ship bar:** every axis ≥ 4 and every pass bar met. After round 3, any residual goes to PHASE3-REPORT as a flag for Aryan. Commit and push every round.

---

## 12. P3-12 final QA
- `npm run check`, `npx eslint .`, `npm run build` green; `RELEASE=1 npm run check` fails only per DP-9, and its printed lists are saved.
- Widths 1440, 1024, 390, 320, 844×390, 1024×1366: no console or hydration errors, no horizontal overflow, 390/320/844×390/1024×1366 unchanged except the intended changes; RM run; no-JS run (today's page, readable, no travel/split/tail); LCP (desktop ≤ 400 ms; mobile ±5% with the intro armed); CLS 0; bundle deltas.
- `docs/build/PHASE3-REPORT.md`: before/after numbers (P3-0 vs final), credits spent and balance, the loop table (shipped / ALT-as-DEFAULT / cut), what Aryan should review (spec Appendix B + DP-9 lists + the TTS lines + the loglines + the real-laptop recording request + the blind-test result + unsigned copy printed by `RELEASE=1`).
- Tick P3-11 and P3-12 in `CONTINUE.md`; commit and push. **No merge to `main`** unless Aryan asks.

---

## 13. Risks and how the plan handles them
1. **Concurrent tsc noise** in one tree: builders judge only their own files (plan §0.1 #3); contracts are stubs that compile from W1.0.
2. **A builder edits outside its globs:** the assembler's ownership audit (plan §10.1 #1).
3. **Media not yet registered** when code needs it: `loopFor`/`isMediaId` guards with the ALT as fallback (DP-5); marks fall back to spec §7.2 constants.
4. **Lenis + raster cost** makes headless numbers look worse (more frames per notch): B1-RASTER lands in the same wave; judge `?skip=smooth` and default separately; ask Aryan for a real-laptop recording (optional, non-blocking).
5. **First-load budget:** facades + lazy impls (DP-13), `probes/bundle.mjs` in every wave.
6. **Partial CSS order:** partials load after `globals.css` and `intro.css`; tokens/variants stay in `globals.css` (DP-10). If Tailwind's pipeline rejects a partial, fall back to a marked block in `globals.css` owned by the same builder.
7. **Credit drift:** hard floor re-read before each submit (plan §9.2); the SEQs and retakes have code ALTs, so no retake is ever required to ship.
8. **Aryan-owned items** (loglines on screen, TTS lines, unsigned copy, Check-L2 countersignatures, new egg picks, the drone's photographed lift, no Act III toy): built as the spec defaults, listed in PHASE3-REPORT; never block a wave on them. The P3-0 questions are answered; do not ask them again.
