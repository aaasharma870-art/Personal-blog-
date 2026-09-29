# P1-EARLY — tokens, SectionFrame v1.5, primitives, /lab

**Branch:** `design/three-films` · base `bcff748` → head `d64bf51` (10 commits, not pushed) · 2026-09-28
**Status:** all green. The home page is pixel-identical to `bcff748`. The new primitives run on `/lab` (noindex).

## 0. Commits (oldest first)

| SHA | What |
|---|---|
| `ab561b3` | Motion: DESIGN v2 tokens (`easeClip`, `easeDraw`, `dur.preview/flash/draw`, the springs, `intro.*`, `loader.*`, `scrollBudget`, `stagger`) |
| `59ba07a` | Tokens: v2 type steps, space, radii, surfaces, tone planes, worlds (`app/globals.css`), `lib/worlds.ts`, `World` retyped, validator updated |
| `1e9f609` | SectionFrame v1.5: `data-section` / `data-tone` / `data-world` wrapper + `WorldProvider` |
| `31506ca` | Motion preference: the session Pause joins the reduced-motion stack; `MotionPreference` context; `lib/session.ts` |
| `8dc3059` | DecoderLock: one page-wide decoder shared by the legacy `AmbientBackground` and `MediaFrame` |
| `b8ebaee` | Primitives: Lens, Seam, MaskReveal, MotionToggle, and the `useEnterOnce` hook |
| `95f206d` | Primitives: Loader shell + renderer registry, ActCard shell |
| `f43a149` | Primitives: MediaFrame |
| `ad0c214` | `/lab` route; `ChromeGate` (no site chrome on `/lab`); ESLint ignores `.claude/**` |
| `d64bf51` | Loader: the `role=status` region stays mounted through the show delay |

## 1. Verification (run by me, final state `d64bf51`)

| Check | Result |
|---|---|
| `npm run check` | exit 0 (tsc + check-manifest OK) |
| `npx eslint .` | exit 0, 0 problems (after ignoring `.claude/**`; the only errors had been in the git-excluded `.claude/worktrees/phase0-parity/tools/*.js` and `.claude/skills`) |
| `npm run build` | exit 0. Routes: `/`, `/lab`, `/icon`, `/opengraph-image`, `/robots.txt`, `/sitemap.xml`, all static |
| **Home parity** at 1440×900 under reduced motion vs a baseline build of `bcff748`, captured **before any edit** (run twice: anchor noise ≤ 3 px at Δ1) | 8 anchors (`top about journey work systems principles writing contact`): **0 px differ** (writing: 3 px at Δ = 1, the baseline noise). Section geometry and doc height (17507) are **identical**. Full page: 0.0096%, below the baseline's own run-to-run noise of 0.24% |
| Home, motion ON, desktop | 0 console errors. Legacy ambient loops still play; one active section at a time |
| Home, session **started paused** | `html[data-motion=paused]`, 0 `<video>`, **0 video requests**, 0 console or hydration errors |
| `/lab` at 1440 and 390 × motion on and reduced (with frames and DOM probes) | 0 console errors in all 4 configs. No horizontal overflow. 1 `h1`. Reduced: seams flat, text static, the aperture open, cards static with the summary visible, 0 video elements |
| `/lab` HTML | `<meta name="robots" content="noindex, nofollow, nocache">`; absent from `sitemap.xml`; no site header or footer; **0 `opacity:0` in the SSR HTML** |

**Frames I looked at** (copies in `build/frames/p1-early/`):
- the planes grid (5 worlds × 4 tones)
- the type steps
- media, with v-contour playing and band-flow queued on the decoder
- the Lens aperture at 80 / 300 / 1100 ms, and track on hover and on arrow keys
- the Loader modes, and a real throttled load with its status line
- the strip at 12 scroll positions, motion and reduced (masked rises, the domes flattening, letterboxed cards, the aperture once per session)
- the 390 contact sheet
- the paused masthead

**Capture harness:** `build/tools/p1-early/`, copied from my scratchpad. `run.sh` does start → capture → diff → kill on port 3121, and uses `research/browser.js` only. It also includes `parity.js`, `lab.js`, `home-motion.js` and `diff.js`/`bbox.js`. `lab.js` throttles the network through CDP for the real-load step.

## 2. What exists (file → API → notes)

### Tokens: `app/globals.css`
Additions only. Every legacy token keeps its name and value.

- **`@theme static`** holds the DESIGN v2 tokens:
  - `--color-deep` / `overlay` / `slate` / `intro-night`
  - the 8 `--text-*` steps, with `--line-height` / `--letter-spacing` / `--font-weight`
  - the radii `--radius-focus` / `control` / `frame` / `pill`
  - space: `--spacing-tier-pair` / `tier-group` / `tier-block` / `gutter`
  - `--container-page` / `body` / `lead` / `title`
  - `--ease-clip` / `--ease-draw`
  - the `--animate-loader-sweep` keyframes

  `static` is needed because Tailwind v4 drops theme vars that no utility uses yet.
- **`@theme inline`** exposes the semantic, plane-aware utilities:
  - `bg-bg`, `text-fg`, `text-fg-muted`, `text-fg-ghost`
  - `bg-surface-1` / `-2`, `border-rule`
  - `text-accent` / `-accent-bright`, `text-kill`, `text-exception`
  - `stroke-world-line` / `-emphasis` / `-quiet`, `bg-world-panel`
  - `py-section` (= `--section-pad`)
- **Raw palette** (`:root`): every DESIGN v2 world hex under its DESIGN name:
  - `--house-*`, `--pir-*`, `--idi-*`, `--bp-panel`, `--hp-*`
  - `--paper*`
  - `--w-*` inks

  It also holds density (`--density-*`, `--section-pad`), `--dur-*`, `--z-*`, the Lens, seam and letterbox geometry, and `--loader-*` sizes.
- **World blocks** `[data-world="house|pirates|idiots|hp"]` map each palette onto **role slots**:
  - grounds: `--world-canvas/raised/overlay/slate/deep`
  - inks: `--world-line/emphasis/quiet/panel` (the SPEC §12.1 `line` / `emphasis` slots)

  `[data-world="rdr2"]` is empty on purpose, with a TODO: every slot inherits, so it renders house values.
- **Tone blocks** `[data-tone="canvas|raised|deep|paper"]` map the slots to `--bg --surface-1 --surface-2 --fg --fg-muted --fg-ghost --rule --accent --accent-bright --kill --exception`. The mapping follows DESIGN §1.3.4 exactly.
- **Type steps:** `@utility type-display … type-meta` are complete steps: family, size, leading, tracking, weight, case, `text-wrap`, and `tnum` on meta.
- **Surfaces:** `surface-1` and `surface-2` are a tone step plus a 1 px inset `--rule`.
- **Pause mirror:** `html[data-motion="paused"]` copies the reduced-motion CSS block. The `@custom-variant motion-off` variant covers OS reduce OR paused.

### Data: `lib/worlds.ts` (pure)
- `WORLD_IDS` (house, pirates, idiots, hp, rdr2)
- `WorldId`, `TONE_IDS`, `ToneId`, `LoaderKind`
- `worlds[id] = { ready, loader }` (rdr2: `ready:false`)
- `DEFAULT_WORLD` / `DEFAULT_TONE`, `isWorldId`
- `planeAttrs(tone, world)`: always emit both attributes together

`lib/page.ts`: `Tone = ToneId`, `World = WorldId`, and the default world is now `"house"` (it replaces `neutral/potc`; no entry used it). The validator checks that the two defaults agree, and warns on a placeholder world.

### Motion: `lib/motion.ts`
Additions:
- `easeClip`, `easeDraw`
- `dur.preview .26`, `dur.flash .12`, `dur.draw {short .7, med 1.2, long 1.5}`
- `stagger {line .08, maxLines 4}`
- springs: `springFollow {120,22,.6}`, `springSnap {420,41,1}`, `springSettle {260,22,.9}`, `springPlayful {180,14,1.1}`, `springNeedle {55,8,1}`
- `intro.*`, `loader.*`, `scrollBudget`, and `maskTravel "115%"`

Existing values are unchanged. `springSoft` and `springNav` already matched v2.

### Motion preference: `lib/flags.ts`, `components/providers/motion-provider.tsx`
- `useReducedMotion()` now means **motion off** (OS reduced OR paused). All ~40 existing consumers honour Pause with no edits.
- `useOsReducedMotion()` is the raw OS preference.
- The pause state: `useMotionPaused()`, `useMotionPausedAtBoot()`, and `setMotionPaused(bool)`, which writes sessionStorage `"motion"="paused"` (in try/catch, with an in-memory fallback).
- Other hooks: `useMediaQuery(q)`, `useDocumentVisible()`. All are hydration-safe: false on the server and during hydration, the #418 fix is kept.
- `MotionProvider` provides the `MotionPreference` context `{reduced, osReduced, paused, setPaused}` through `useMotionPreference()`, which falls back to the stores outside the provider. It:
  - sets `MotionConfig reducedMotion="always"` while paused
  - mirrors `data-motion` after hydration
  - remounts once only for OS reduce or a page view that **started** paused, never on a mid-session toggle, so focus stays on the toggle

### `lib/session.ts`
- `readSession` / `writeSession` / `sessionAvailable`, all in try/catch
- `useOncePerSession(key) → {shouldRun: boolean|null, markRun}` (null = unknown on the server). Storage failure counts as already run.

### `lib/decoder-lock.ts`
- `acquireDecoder(id, {priority, wait, onRevoke, onGrant, label})`, `releaseDecoder`, `decoderHolder`, `decoderHolderLabel`, `subscribeDecoder`.
- An equal or higher priority claim preempts the holder (most recent wins); a lower one is refused.
- `wait:true` claims queue and are re-granted on release. `AmbientBackground` uses `wait:false`, so it behaves exactly as before.

### `components/sections/SectionFrame.tsx` (server)
Renders `<div class="contents" data-section data-tone data-world>` + `<WorldProvider>`.

`display: contents` removes the box but not the element, and custom-property inheritance follows the DOM tree. So descendants resolve their plane's vars while layout, margin collapsing, sticky containment and sibling structure stay exactly as before; parity proved this.

Verified in Chromium (`tools/p1-early/contents-probe.js`): a `<section class="bg-bg">` inside `<div class="contents" data-tone=deep data-world=pirates>` resolves `--bg` = `#050b0d` and `--world-line` = `#a8834a`, paints `rgb(5,11,13)`, and the wrapper's box height is 0. Firefox and WebKit were not run (the one-browser rule allows `browser.js`/Chromium only); support is per CSS Display 3 §2.5. The limits: the frame can't paint, be observed or be measured. The section inside it does those.

### `components/primitives/`

| File | API | Notes |
|---|---|---|
| `world.tsx` | `WorldProvider({world,tone})`, `useWorld() → {world,tone}` | The plane as **data** (for renderer choice). Colours always come from CSS vars |
| `use-enter-once.ts` | `useEnterOnce(ref,{amount=.25}) → "static"\|"armed"\|"entered"` | Server and hydration = `static` (final). The pre-enter state is applied only when the element mounted **offscreen**. Plays once. Motion off → `static` |
| `mask-reveal.tsx` | `<MaskReveal as lines? children? amount? className lineClassName id>` | y 115%→0, `dur.reveal`, `ease`, 0.08 s stagger capped at 4 lines, .15em descender pad. Lines are joined by a real space. SSR-crisp |
| `lens.tsx` | `<Lens state="closed\|aperture\|open\|track" frame={x0,x1,y0,y1} origin target={x,y,width,height} focus clip onSettled>` plus `useApertureOnce(ref,key) → {state,onSettled}` | Details below |
| `seam.tsx` | `<Seam from={{tone,world}}>` (first child of a `relative` section) | Details below |
| `motion-toggle.tsx` | `<MotionToggle label="Pause motion" showLabel? className>` | Details below |
| `loader.tsx` | `<Loader world? size="mini\|card\|route" mode? progress?: number\|MotionValue status? delayMs? parallel?>`; `loaderRenderers`, `rendererFor(kind)`, `LoaderRendererProps` | Details below |
| `act-card.tsx` | `<ActCard id kind world title subtitle? label? reel? summary? progress? children?>` | Details below |
| `media-frame.tsx` | `<MediaFrame media poster? priority sizes fit layout="intrinsic\|fill" ratio radius playOn="desktop\|any\|never" loop decoderPriority loader world onStateChange>` | Details below |

**Lens**
- Two aria-hidden SVG halves: non-scaling `--lens-stroke`, square caps. The arm is `clamp(8px,.12h,24px)` via `cqh`, and the bracket sits `--lens-inset` outside the edge.
- **closed:** the slit clip `inset(0 (1−o) 0 o)`.
- **aperture:** the clip and the halves move on `easeClip`/`dur.hero`, then call `onSettled("open")`.
- **track:** position follows on `springFollow`; the height is instant.
- The halves are zero-width anchors moved by measured px transforms (a % version widened the page), with a static % `left` before measurement.
- `useApertureOnce` = offscreen arming, played at 50% in view, recorded on settle.

**Seam**
- A Dennis dome: an ellipse 150% × 750% at `translate(-50%,-86.666%)` inside a `--seam-h` band (10vh; 5vh at ≤ 540 px).
- It is painted with the outgoing plane's `--bg`, through that plane's data attributes on the ellipse.
- `scaleY` 1→0 over the first 60vh of entry (useScroll `start end → start 40%`).
- `motion-off:hidden` makes it flat already in the server HTML.

**MotionToggle**
- `aria-pressed` = paused. The name is constant; the state lives only in `aria-pressed`, so it is never duplicated in the label.
- The sine/flat `d` morph runs on `dur.base`. The sine travels one period on hover **and** `:focus-visible`: a one-shot transition, never a loop.
- The target is ≥ 44 px. Colours are ink and muted, so it is not an aqua mark.

**Loader**
- **Real load** (`status`): a `role=status` region is mounted at once, then the visible Meta status plus the aria-hidden motif appear after 400 ms. Real fraction or indeterminate; never a %.
- **Scroll mode** (`MotionValue`): aria-hidden, no status, direct mapping.
- Indeterminate stops after 5 s (`parallel`). Reduced motion → static.
- `data-loader`, `data-mode` and `data-progress` (written to the DOM, with no per-frame re-render) serve tests.
- The only renderer is `plain`: a hairline with a `--fg-muted` fill.

**ActCard**
- `<section id aria-labelledby data-tone=deep data-world>`.
- At ≥ 640: `min-h-svh` grid `1fr / 2.39:1 frame / 1fr`. The frame is 603 px at 1440×900 (C7 ✓).
- Upper bar: Meta label + reel. Lower bar: h2 `type-title` + one `type-lead` line + a progress line.
- Progress = the card's own scroll passage. Static complete under RM/Pause, below 640 px and in SSR, with the summary visible then.
- No "loading" text, no status, 0 tab stops.

**MediaFrame**
- Resolves through `resolveMedia`. The poster is next/image (lazy; `priority` → Next 16 `preload`).
- A `<video>` mounts only if: video kind, motion on, no Save-Data/2G/3G, the device qualifies (default ≥ 1024 + fine pointer), in view, and it holds the DecoderLock (`wait:true`).
- It swaps in on `playing` (fade `dur.preview`) and pauses while the tab is hidden. It unmounts when it leaves view or is revoked, and then queues.
- A rejected `play()` or an `error` keeps the poster for good; an AbortError is not treated as a failure.
- `object-position` comes from `focal`; decorative media is aria-hidden. The world mini loader shows if the poster is still pending 400 ms after the frame enters view.

### Other files
- `components/site/chrome-gate.tsx`: `<ChromeGate>` (client, no DOM) hides the header, footer, rail, palette and legacy cursor/scroll effects on `/lab*`. Home is unchanged.
- `app/lab/page.tsx` + `app/lab/demos.tsx`: the workbench sections are masthead (toggle + readout), planes, type, media, lens, loader, and a native-scroll strip:
  - pirates canvas
  - a seam into idiots canvas
  - a seam into hp paper
  - a `reel` card (idiots)
  - the aperture once per session
  - a `title` card (hp)
- `eslint.config.mjs`: `.claude/**` is ignored (local agent tooling, already git-excluded).

## 3. Deviations from DESIGN v2 / SPEC (and why)

1. **`--color-raised` name collision.**
   - DESIGN v2 names `#121820` `--color-raised`, but the live components use legacy `--color-raised` = `#202b35`.
   - Kept the legacy name. The house raised ground is `--house-raised`, and `#202b35` is also exposed as `--color-slate`.
   - Likewise, DESIGN's raw `--color-rule` is the legacy `--color-line`; `--color-rule` is the *semantic* `border-rule` (= `--rule`).
   - Rename at the D-3 retirement pass.
2. **Spacing tier names are `tier-pair / tier-group / tier-block`.**
   - A bare `--spacing-block` hijacked every `inline-block` (Tailwind v4's `inline-*` = inline-size) and broke the hero. The first parity capture caught it (14.8% of the hero frame).
   - Rule for the planner: no theme key may equal a CSS keyword a static class ends with.
3. **MaskReveal travel is 115%** (DESIGN §2.3 / REPO `maskedLine`), not the brief's 110%. DESIGN wins on tokens.
4. **No `html.motion-ok` head script yet.**
   - DESIGN §6.5 pre-hides under `motion-ok`. `useEnterOnce` instead hides only elements that mounted offscreen, so the server HTML is final and nothing in view at load ever blanks.
   - The cost: anything already in view at load gets no entrance, and the hero aperture can't be closed at first paint. See open item 1.
5. **Role slots** (`--world-canvas/raised/overlay/slate/deep`, `--world-line/emphasis/quiet/panel`) are PROP names; DESIGN names only the raw hexes.
   - House slot inks = stone / ink / muted (DESIGN lists none for house).
   - hp `quiet` = muted (DESIGN lists none).
   - pirates `emphasis` = brass (the X-stamp, never ember).
6. **The paper tone remaps the world inks** to paper-muted / paper-fg / paper-ghost / paper-s1 (PROP). The dark-plane inks (bp-line, brass) vanish on parchment, and DESIGN names no paper inks. `--accent-bright` on paper = `--paper-accent`, since DESIGN has no brighter paper accent.
7. **A lone `data-world` resolves as the canvas tone** of that world. `planeAttrs()` always emits the pair, so this only matters if someone sets `data-world` by hand.
8. **`useReducedMotion()` semantics changed** to OS OR paused (intended: the one "motion off" gate). Code that truly needs the OS-only value must use `useOsReducedMotion()`.
9. **Lens `track`:** the height applies instantly and only the position spring-follows (transform-only; ledger rows are near-equal). The `drawn-in`, `launch` and `resolve` states are **not built** (intro and contact phases).
10. **Loader `plain`** = a hairline progress line, with the status line only on real loads. SPEC §12.4 says `plain` is "a Meta status line only" (the `film.enabled=false` case). Easy to strip later if wanted.
11. **ActCard shell.**
    - It renders two loader instances: the frame motif (card size) and the lower-bar progress line (route size). With only `plain`, both are lines.
    - Long-card pinned travel (seam/ignite ≤ 60vh) is **not built**; it is 0 travel.
    - The **static** card (summary visible) can exceed 100svh: the idiots demo card is 943 px at 1440×900, so its bars are then unequal. Live cards are exactly 900 with a 603 px frame.
12. **MediaFrame default `playOn="desktop"`** = ≥ 1024 px + fine pointer (SPEC). The legacy `AmbientBackground` gate stays ≥ 768 px, untouched.
13. **SeamlessVideo (legacy) decodes 2 videos** for ~0.7 s per loop (crossfade). This violates "≤ 1 decoding video" but is left as is (D-3 retires it). It is now behind the shared lock, one claimant per section.
14. **`lib/worlds.ts` is new.** SPEC §12.1 puts `WorldId` in `lib/film.ts`; recommendation: `film.ts` imports ids from `worlds.ts` (see open items).
15. **Validator:** only the world/tone ids and defaults changed. `MAX_SIGNATURE` is still the v1 value 3 (v2 wants 5), and the AA table and banned-term lint are not built (SPEC §12.5 foundation work).

## 4. Open items for the planner

1. **The head script** (SPEC §5.1 / DESIGN §6.5): `html.js`, `html.motion-ok`, `intro-armed`, the 3 s failsafe, and `data-motion="paused"` before paint.
   - It needs `suppressHydrationWarning` on `<html>`.
   - It unlocks the hero aperture at first paint (Lens `closed` pre-state gated on `.motion-ok`).
   - It removes the pre-hydration window in which a boot-paused visitor still sees CSS loops. JS loops already stop at hydration.
2. **RDR2 and the iconic override.** Add rdr2 to its block in `globals.css` (every slot the house block sets) plus `worlds.rdr2 = {ready:true, loader:<kind>}`.
   - For per-world display fonts on act titles and loaders only, add one slot (e.g. `--world-font-act`, defaulting to `var(--font-serif)` in the house block).
   - Point ActCard's h2 at it, and let each world block override it.
   - DESIGN §2.1 currently bans film typography, so DESIGN needs the amendment first. Font loading must stay per-world code-split.
3. **World loader renderers:** register `course` / `gauge` / `ink-light` in `loaderRenderers` (the `LoaderRendererProps` contract gives mode, size, a progress MotionValue, and `animate`). The shell already provides the delay, status, idle stop and reduced-motion handling.
4. **SectionFrame Phase 1:** move `<section id>` into the frame (the wrapper then becomes the box), `data-density` → `py-section`, and auto-insert `<Seam from={prevPlane}>` where the plane changes. Suppress it next to act cards (C15).
5. **Card derivation** (`lib/sections.ts` `cards`, `worldOf` via acts), `lib/film.ts`, long-card travel, and the fixtures A–H.
6. **Media model:** `focalBox` (the Lens `frame` for the hero), `srcMobile` art direction without double downloads, mono variants, the text-side feather, and a `higgsfield` `accept` block.
7. **Validator:** the world × tone AA table parsed from the raw palette block (structured for this), `maxSignature` 5, the banned-term lint, and draft/proposed copy gates.
8. **Header integration:** put `<MotionToggle>` (the waveform) in the header and add the act label. Retire the legacy loops/effects (D-3), including SeamlessVideo's 2-decoder crossfade and the legacy seams, cursor glow and progress bar.
9. **Cross-engine check** of `display: contents` var inheritance and `cqh` arm widths in Firefox and WebKit when a non-Chromium runner is allowed. Both are in the specs and in shipping browsers.
