/* ============================================================================
   LADDER — the warm-up ladder (PHASE3-SPEC §3.1, D3-11): after
   `intro:quiet-end`, heavy work starts one step per idle slice:
     1 Lenis · 2 ScrollTrigger + the desktop enhancer · 3 StageGate ·
     4 GL tier + context · 5 world fonts.
   Nothing new starts inside the quiet window (intro warm → quiet-end).

   W1.0 STUB (B1-SCROLL implements the real ladder: scroll-idle gating, the
   1.5 s per-step timeout, DESKTOP_FINE): `whenQuietEnd()` and every step
   resolve together on the first idle slice after `load`, and `ladder:step`
   is emitted for 1…5 in order. Client only; the server never resolves.
   ========================================================================== */

import { useSyncExternalStore } from "react";
import { emit, on } from "./events";
import { onIdle } from "./idle";

export type LadderStep = 1 | 2 | 3 | 4 | 5;

let installed = false;
let quiet = false;
/** Highest step reached (0 = none yet). */
let reached = 0;
let base: Promise<void> | null = null;
const listeners = new Set<() => void>();

const never = () => new Promise<void>(() => {});

function install(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;
  on("intro:quiet", () => {
    quiet = true;
  });
  on("intro:quiet-end", () => {
    quiet = false;
  });
}

function reach(step: number): void {
  if (step <= reached) return;
  reached = step;
  emit("ladder:step", { step: step as LadderStep });
  listeners.forEach((l) => l());
}

/** The stub's single gate: the first idle slice after `load`. */
function afterLoadIdle(): Promise<void> {
  if (typeof window === "undefined") return never();
  install();
  if (!base) {
    base = new Promise<void>((resolve) => {
      const go = () => void onIdle(() => resolve(), { timeout: 1500 });
      if (document.readyState === "complete") go();
      else window.addEventListener("load", go, { once: true });
    }).then(() => {
      for (let s = 1; s <= 5; s++) reach(s);
    });
  }
  return base;
}

/** True inside the quiet window (intro warm → `intro:quiet-end`). */
export function isQuiet(): boolean {
  install();
  return quiet;
}

/** Resolves when the quiet window has ended (at once when no intro is armed;
 *  stub: the first idle after load). */
export function whenQuietEnd(): Promise<void> {
  return afterLoadIdle();
}

/** Resolves once ladder step `s` has been reached. */
export function whenLadder(s: LadderStep): Promise<void> {
  if (typeof window === "undefined") return never();
  void afterLoadIdle();
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
  listeners.add(onChange);
  void afterLoadIdle();
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

/** Warm chunk caches: `import()` each loader in its own idle slice, in
 *  order (fetch + evaluate only; no instance, no context). Errors are
 *  swallowed: a failed prefetch just loads later on demand. */
export function prefetchChunks(loaders: (() => Promise<unknown>)[]): void {
  if (typeof window === "undefined") return;
  const queue = [...loaders];
  const next = (): void => {
    const load = queue.shift();
    if (!load) return;
    onIdle(() => {
      load()
        .catch(() => undefined)
        .then(next);
    });
  };
  next();
}
