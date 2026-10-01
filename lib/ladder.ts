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
       scroll-idle (150 ms without wheel/scroll) or its own 1.5 s timeout:
         1 Lenis · 2 ScrollTrigger + the desktop enhancer · 3 StageGate ·
         4 GL tier + context · 5 world fonts.
       The ladder only times the steps: every consumer still gates its own
       work on DESKTOP_FINE / motion. It HALTS while motion is off (OS
       reduced motion or Pause) and resumes when motion returns; steps
       already reached stay reached. Work that must also run with motion off
       (world fonts on a reduced-motion desktop) waits on `whenQuietEnd()` +
       `onIdle`, not on a ladder step.
   performance marks: "p3:quiet-end", "p3:ladder-<n>" (the probes read them).
   Client only: on the server nothing resolves and every hook reads false.
   ========================================================================== */

import { useSyncExternalStore } from "react";
import { emit, on } from "./events";
import { DESKTOP_FINE, motionOffNow, onMotionOffChange } from "./flags";
import { onIdle } from "./idle";

export type LadderStep = 1 | 2 | 3 | 4 | 5;

const STEP_TIMEOUT_MS = 1500;
const SCROLL_IDLE_MS = 150;
/** After `intro:end`, a quiet window that never closes is closed anyway. */
const QUIET_CAP_MS = 8000;

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
  const waiters = [...quietWaiters];
  quietWaiters.clear();
  waiters.forEach((w) => w());
  notify();
}

function install(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;
  on("intro:quiet", () => {
    quiet = true;
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
  if (quietOver()) settleQuiet();
  else quietMarked = false;
  void climb();
}

// Listen from module evaluation (before hydration), like intro-phase.ts, so
// an early `intro:quiet` / `intro:end` is never missed.
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

/** 150 ms without a scroll or wheel event, or 1.5 s, whichever is first. */
function whenScrollIdleOrTimeout(): Promise<void> {
  return new Promise<void>((resolve) => {
    let idle: ReturnType<typeof setTimeout> | undefined;
    const finish = () => {
      clearTimeout(idle);
      clearTimeout(cap);
      window.removeEventListener("scroll", arm);
      window.removeEventListener("wheel", arm);
      resolve();
    };
    function arm() {
      clearTimeout(idle);
      idle = setTimeout(finish, SCROLL_IDLE_MS);
    }
    const cap = setTimeout(finish, STEP_TIMEOUT_MS);
    window.addEventListener("scroll", arm, { passive: true });
    window.addEventListener("wheel", arm, { passive: true });
    arm();
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
    await whenQuietEnd();
    await whenMotionOn();
    await whenScrollIdleOrTimeout();
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

/** Step `s` reached (false on the server and during hydration). */
export function useLadder(s: LadderStep): boolean {
  return useSyncExternalStore(
    subscribe,
    () => reached >= s,
    () => false,
  );
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
    );
  // nothing new starts inside the quiet window
  if (isQuiet()) void whenQuietEnd().then(run);
  else run();
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
