/* ============================================================================
   LADDER — the quiet window and the warm-up ladder (PHASE3-SPEC §3.1, §3.7;
   D3-11). Nothing heavy starts under the visitor's first wheel after the
   opening titles.

   QUIET WINDOW: `intro:quiet` (the intro controller, at warm) → `intro:quiet-
   end` (after the titles, or on any exit). Nothing new starts inside it.
   With no intro armed it is over at once; an intro that ends without ever
   opening it (dismissed on the play screen, the 3 s failsafe) closes it on
   `intro:end`; a quiet-end that never comes is capped 8 s after `intro:end`.

   (a) PREFETCH: `prefetchChunks()` imports chunks (fetch + evaluate only)
       one per idle slice, before warm or at page idle, held during quiet.
       Desktop chunks registered with `registerChunk()` (Lenis, GSAP, the
       enhancer, the stage, GL) ride along on DESKTOP_FINE with motion on.
   (b) LADDER: after quiet-end, one step per idle slice, each gated on
       scroll-idle (200 ms without wheel/scroll; a scroll that never settles
       still climbs, one step per 6 s):
         1 Lenis · 2 ScrollTrigger + the desktop enhancer · 3 StageGate ·
         4 GL tier + context · 5 world fonts.
       P3-11 (J8 #1): after a quiet window that really opened (the titles
       played), nothing climbs and no held prefetch resumes for a 3 s
       grace: the reader's first wheel after the titles meets an idle main
       thread. A step's React consumers (`useLadder`) re-render in a
       TRANSITION (interruptible slices), never one long synchronous render
       inside the idle slice that reached it.
       The ladder only times the steps: every consumer still gates its own
       work on DESKTOP_FINE / motion. It HALTS while motion is off (OS
       reduced motion or Pause) and resumes when motion returns; steps
       already reached stay reached. Work that must also run with motion off
       (world fonts on a reduced-motion desktop) waits on `whenQuietEnd()` +
       `onIdle`, not on a ladder step.
   (c) TURNS: `nextTurn()` hands step-2 work out a few pieces per idle slice
       (the plates' engine parts, the scroll scenes), never one long task,
       and never while the page is scrolling (J8 #1: ≤ 2 per slice, each
       slice after the scroll has been still for 200 ms or 2 s have gone).
   performance marks: "p3:quiet-end", "p3:ladder-<n>" (the probes read them).
   Client only: on the server nothing resolves and every hook reads false.
   ========================================================================== */

import { startTransition, useEffect, useState, useSyncExternalStore } from "react";
import { emit, on } from "./events";
import { DESKTOP_FINE, motionOffNow, onMotionOffChange } from "./flags";
import { onIdle } from "./idle";

export type LadderStep = 1 | 2 | 3 | 4 | 5;

/** A scroll that never settles still climbs: one step per this long. */
const STEP_CAP_MS = 6000;
const SCROLL_IDLE_MS = 200;
/** After `intro:end`, a quiet window that never closes is closed anyway. */
const QUIET_CAP_MS = 8000;
/** After a quiet window that opened (the titles played): nothing new starts
 *  for this long (J8 #1, §12.1: the 3 s after the titles stay free). */
const QUIET_GRACE_MS = 3000;

let installed = false;
/** Inside the quiet window (intro warm → quiet-end). */
let quiet = false;
/** Highest step reached (0 = none yet). */
let reached = 0;
let climbing = false;
const listeners = new Set<() => void>();
const quietWaiters = new Set<() => void>();
let quietCap: ReturnType<typeof setTimeout> | undefined;
/** "p3:quiet-end" was marked for the current window. */
let quietMarked = false;
/** When the last quiet window that really opened ended (0 = none yet). */
let quietEndAt = 0;
/** A quiet window opened since the last quiet-end. */
let quietOpened = false;
/** The last scroll / wheel (performance.now(); scroll-idle gates). */
let lastScroll = -1e9;

const never = () => new Promise<void>(() => {});

function mark(name: string): void {
  try {
    performance.mark(name);
  } catch {
    /* marks are diagnostics only */
  }
}

function notify(): void {
  listeners.forEach((l) => l());
}

const introArmed = (): boolean => document.documentElement.classList.contains("intro-armed");

/** The quiet window is over (and no armed intro is still to open one). */
function quietOver(): boolean {
  return !quiet && !introArmed();
}

function settleQuiet(): void {
  if (!quietOver()) return;
  clearTimeout(quietCap);
  if (!quietMarked) {
    quietMarked = true;
    mark("p3:quiet-end");
  }
  if (quietOpened) {
    quietOpened = false;
    quietEndAt = performance.now();
  }
  const waiters = [...quietWaiters];
  quietWaiters.clear();
  waiters.forEach((w) => w());
  notify();
}

function install(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;
  const moved = () => {
    lastScroll = performance.now();
  };
  window.addEventListener("scroll", moved, { passive: true });
  window.addEventListener("wheel", moved, { passive: true });
  on("intro:quiet", () => {
    quiet = true;
    quietOpened = true;
    quietMarked = false;
    clearTimeout(quietCap);
    notify();
  });
  on("intro:quiet-end", () => {
    quiet = false;
    settleQuiet();
  });
  window.addEventListener("intro:end", () => {
    // the controller removes `intro-armed` before it dispatches; a window
    // that opened (warm) closes with quiet-end, which is capped
    setTimeout(() => {
      if (quiet) {
        clearTimeout(quietCap);
        quietCap = setTimeout(() => {
          quiet = false;
          settleQuiet();
        }, QUIET_CAP_MS);
      } else settleQuiet();
    }, 0);
  });
  // This module is a lazy desktop chunk (the facades load it after
  // hydration, DP-13), so the intro's events may predate it: the controller
  // keeps the window's state on window.__introQuiet. A window still open
  // after the overlay has gone is capped like one seen on `intro:end`.
  if (window.__introQuiet === 1) {
    quiet = true;
    quietOpened = true;
    if (!introArmed()) {
      quietCap = setTimeout(() => {
        quiet = false;
        settleQuiet();
      }, QUIET_CAP_MS);
    }
  }
  if (quietOver()) settleQuiet();
  else quietMarked = false;
  void climb();
}

// Listen from module evaluation (whenever this chunk loads); see install().
if (typeof window !== "undefined") install();

/* — the quiet window ————————————————————————————————————————————————— */

/** True inside the quiet window (intro warm → `intro:quiet-end`). */
export function isQuiet(): boolean {
  install();
  return quiet;
}

/** Inside the quiet window (false on the server and during hydration). */
export function useQuiet(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => quiet,
    () => false,
  );
}

/** Resolves when the quiet window has ended (at once when no intro is armed
 *  and none is playing its titles). */
export function whenQuietEnd(): Promise<void> {
  if (typeof window === "undefined") return never();
  install();
  if (quietOver()) return Promise.resolve();
  return new Promise<void>((resolve) => {
    quietWaiters.add(resolve);
  });
}

/** Inside the 3 s grace after a quiet window that really opened. */
export function inQuietGrace(): boolean {
  install();
  return !quiet && quietEndAt > 0 && performance.now() - quietEndAt < QUIET_GRACE_MS;
}

/** ms since the last scroll or wheel event (very large before any). */
export function sinceScroll(): number {
  install();
  return performance.now() - lastScroll;
}

/** The quiet window has ended AND its grace has run out (at once when no
 *  window opened in this page view). */
async function whenSettled(): Promise<void> {
  for (;;) {
    await whenQuietEnd();
    const left = quietEndAt ? quietEndAt + QUIET_GRACE_MS - performance.now() : 0;
    if (left <= 0) return;
    await new Promise<void>((r) => window.setTimeout(r, left));
  }
}

/* — the ladder ———————————————————————————————————————————————————————— */

/** Resolves when motion is on (at once if it is). */
function whenMotionOn(): Promise<void> {
  if (!motionOffNow()) return Promise.resolve();
  return new Promise<void>((resolve) => {
    const off = onMotionOffChange(() => {
      if (motionOffNow()) return;
      off();
      resolve();
    });
  });
}

/** `idleMs` without a scroll or wheel event (J8 #1: work starts only once
 *  scrolling settles), or `capMs`, whichever is first. */
function whenScrollIdle(idleMs = SCROLL_IDLE_MS, capMs = STEP_CAP_MS): Promise<void> {
  return new Promise<void>((resolve) => {
    const t0 = performance.now();
    const check = () => {
      const now = performance.now();
      const wait = Math.min(lastScroll + idleMs - now, t0 + capMs - now);
      if (wait <= 0) resolve();
      else window.setTimeout(check, wait);
    };
    check();
  });
}

const whenIdleSlice = (): Promise<void> =>
  new Promise<void>((resolve) => {
    onIdle(resolve, { timeout: 1000 });
  });

function reach(step: LadderStep): void {
  if (step <= reached) return;
  reached = step;
  mark(`p3:ladder-${step}`);
  emit("ladder:step", { step });
  notify();
}

async function climb(): Promise<void> {
  if (climbing) return;
  climbing = true;
  while (reached < 5) {
    await whenSettled();
    await whenMotionOn();
    await whenScrollIdle();
    await whenIdleSlice();
    // re-check after the waits: an intro replay or a Pause may have come
    if (!quietOver() || motionOffNow()) continue;
    reach((reached + 1) as LadderStep);
  }
  climbing = false;
}

/** Resolves once ladder step `s` has been reached (never while motion is
 *  off and the ladder is halted below `s`). */
export function whenLadder(s: LadderStep): Promise<void> {
  if (typeof window === "undefined") return never();
  install();
  if (reached >= s) return Promise.resolve();
  return new Promise<void>((resolve) => {
    const check = () => {
      if (reached < s) return;
      listeners.delete(check);
      resolve();
    };
    listeners.add(check);
  });
}

function subscribe(onChange: () => void): () => void {
  install();
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

/** Step `s` reached (false on the server and during hydration). Steps never
 *  go back, so it turns true once. The re-render is a TRANSITION (J8 #1):
 *  the subtree a step enables (the stage, the GL tier) renders in
 *  interruptible slices after the idle slice, where a store update would
 *  render it synchronously inside that slice (the 225–500 ms idle tasks). */
export function useLadder(s: LadderStep): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    install();
    let live = true;
    const check = () => {
      if (reached < s) return;
      listeners.delete(check);
      startTransition(() => {
        if (live) setOn(true);
      });
    };
    listeners.add(check);
    check();
    return () => {
      live = false;
      listeners.delete(check);
    };
  }, [s]);
  return on;
}

/* — (a) chunk prefetch ———————————————————————————————————————————————— */

type Loader = () => Promise<unknown>;

/** Desktop chunks: prefetched on DESKTOP_FINE with motion on. */
const registered: Loader[] = [];
/** Every loader already queued (each is imported once). */
const queued = new Set<Loader>();
let prefetchedDesktop = false;
let pumping = false;
const pending: Loader[] = [];

const desktopMotion = (): boolean => window.matchMedia(DESKTOP_FINE).matches && !motionOffNow();

function pump(): void {
  if (pumping) return;
  const load = pending.shift();
  if (!load) return;
  pumping = true;
  const run = () =>
    whenScrollIdle().then(() =>
      onIdle(
        () => {
          load()
            .catch(() => undefined)
            .then(() => {
              pumping = false;
              pump();
            });
        },
        { timeout: 2000 },
      ),
    );
  // nothing new starts inside the quiet window, nor in its grace
  void whenSettled().then(run);
}

function enqueue(loaders: readonly Loader[]): void {
  for (const l of loaders) {
    if (queued.has(l)) continue;
    queued.add(l);
    pending.push(l);
  }
  pump();
}

/** Register a desktop-only chunk loader (e.g. `() => import("./stage")`):
 *  it is prefetched with the next `prefetchChunks()` on DESKTOP_FINE with
 *  motion on (at once, if that prefetch already ran). Never on phones. */
export function registerChunk(load: Loader): void {
  if (typeof window === "undefined" || registered.includes(load)) return;
  registered.push(load);
  if (prefetchedDesktop && desktopMotion()) enqueue([load]);
}

/** Warm chunk caches: `import()` each loader in its own idle slice, in
 *  order (fetch + evaluate only; no instance, no context), plus every
 *  registered desktop chunk on DESKTOP_FINE with motion on. Idempotent per
 *  loader; held during the quiet window. Errors are swallowed: a failed
 *  prefetch just loads later on demand. */
export function prefetchChunks(loaders: (() => Promise<unknown>)[]): void {
  if (typeof window === "undefined") return;
  install();
  const desktop = desktopMotion();
  if (desktop) prefetchedDesktop = true;
  enqueue(desktop ? [...loaders, ...registered] : loaders);
}

/* — (c) the step-2 hand-out ————————————————————————————————————————————
   Work that waits for a step (the plates' engine parts, the scroll scenes)
   takes TURNS: a few waiters per idle slice, each slice after a frame, so
   it mounts over a few frames instead of one long commit under the first
   wheel (P3-2 #9: the W3 gate traced 35–72 ms frames at step 2, the plate
   engine's mount and every ScrollTrigger scene in one task). */

const TURNS_PER_SLICE = 2;
/** A turn waits for the scroll to settle this long at most. */
const TURN_CAP_MS = 2000;
const turns: (() => void)[] = [];
let handing = false;

function handOut(): void {
  if (handing) return;
  handing = true;
  void whenScrollIdle(SCROLL_IDLE_MS, TURN_CAP_MS).then(() =>
    requestAnimationFrame(() =>
      onIdle(
        () => {
          handing = false;
          for (let i = 0; i < TURNS_PER_SLICE && turns.length; i++) turns.shift()!();
          if (turns.length) handOut();
        },
        { timeout: 250 },
      ),
    ),
  );
}

/** Resolves on this caller's turn: at most a few callers per idle slice,
 *  one slice per frame, first come first served. Await the step first
 *  (`whenLadder(2)`), then the turn. */
export function nextTurn(): Promise<void> {
  if (typeof window === "undefined") return never();
  return new Promise<void>((resolve) => {
    turns.push(resolve);
    handOut();
  });
}
