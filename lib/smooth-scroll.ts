/* ============================================================================
   SMOOTH SCROLL — the Lenis store and every scroll helper (PHASE3-SPEC §3.1).
   No Lenis import here: <SmoothScroll/> (components/providers/
   smooth-scroll.tsx) creates the one instance as ladder step 1 and hands it
   over with `setLenis()`. Everything below works with or without it.

   W1.0 STUB (B1-SCROLL implements the rest): no instance is ever created, so
   jumps are native `scrollIntoView` / `scrollTo` (instant under reduced
   motion or Pause), locks are a ref-counted `body.style.overflow`, and a
   refresh only resizes Lenis (when there is one). Long-jump cuts, `landAt`
   anchors, scroll-margin handling and ScrollTrigger refreshes are
   B1-SCROLL's. Client only; every function is a no-op on the server.
   ========================================================================== */

import { useSyncExternalStore } from "react";
import { emit } from "./events";
import { motionOffNow } from "./flags";

/** The subset of Lenis 1.3's `scrollTo` options this page uses. */
export type LenisScrollOptions = {
  offset?: number;
  immediate?: boolean;
  lock?: boolean;
  duration?: number;
  force?: boolean;
  onComplete?: () => void;
};

/** What the page reads from the Lenis instance (a Lenis is assignable). */
export type LenisLike = {
  scrollTo(t: number | string | HTMLElement, o?: LenisScrollOptions): void;
  stop(): void;
  start(): void;
  resize(): void;
  /** Lenis 1.3 types this `boolean | "native" | "smooth"` (false at rest). */
  readonly isScrolling: boolean | "smooth" | "native";
  readonly velocity: number;
  readonly actualScroll: number;
};

export type ScrollTarget = string | Element | number;
export type ScrollToTargetOptions = {
  block?: "start" | "center" | "nearest";
  /** Focus the target's heading (or the target, tabindex -1) on arrival. */
  focus?: boolean;
  /** pushState for link clicks, replaceState for programmatic jumps. */
  history?: "push" | "replace" | false;
  immediate?: boolean;
  /** Wrap the jump in the cut (§11.3; B1-SCROLL). Implies immediate. */
  cut?: boolean;
};

const noop = () => {};

/* — the instance ———————————————————————————————————————————————————— */

let lenis: LenisLike | null = null;
const lenisListeners = new Set<() => void>();

/** <SmoothScroll/> only: register (or clear) the one Lenis instance. */
export function setLenis(next: LenisLike | null): void {
  lenis = next;
  if (typeof window !== "undefined") window.__lenis = next ?? undefined;
  lenisListeners.forEach((l) => l());
}

export function getLenis(): LenisLike | null {
  return lenis;
}

function subscribeLenis(onChange: () => void): () => void {
  lenisListeners.add(onChange);
  return () => lenisListeners.delete(onChange);
}

/** The Lenis instance (null on the server, during hydration and whenever
 *  smooth scroll is off). */
export function useLenis(): LenisLike | null {
  return useSyncExternalStore(subscribeLenis, getLenis, () => null);
}

/* — jumps ——————————————————————————————————————————————————————————— */

function resolveTarget(t: string | Element): Element | null {
  if (typeof t !== "string") return t;
  let id = t.startsWith("#") ? t.slice(1) : t;
  try {
    id = decodeURIComponent(id);
  } catch {
    /* keep the raw id */
  }
  return id ? document.getElementById(id) : null;
}

function arrive(instant: boolean): Promise<void> {
  return new Promise<void>((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.removeEventListener("scrollend", finish);
      window.clearTimeout(timer);
      resolve();
    };
    const timer = window.setTimeout(finish, instant ? 100 : 1200);
    if (instant) requestAnimationFrame(() => finish());
    else window.addEventListener("scrollend", finish);
  });
}

function focusOn(el: Element): void {
  const heading = el.matches("h1, h2, h3") ? el : el.querySelector("h1, h2, h3");
  const target = (heading ?? el) as HTMLElement;
  if (typeof target.focus !== "function") return;
  if (target.tabIndex < 0 && !target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
}

/** Scroll to an element, an id ("#about" or "about") or a page y. Resolves
 *  on arrival (and after the focus move). Unknown targets resolve at once. */
export async function scrollToTarget(t: ScrollTarget, o: ScrollToTargetOptions = {}): Promise<void> {
  if (typeof window === "undefined") return;
  const el = typeof t === "number" ? null : resolveTarget(t);
  if (typeof t !== "number" && !el) return;
  const instant = Boolean(o.immediate || o.cut) || motionOffNow();
  const behavior: ScrollBehavior = instant ? "instant" : "smooth";

  if (instant) {
    const y = el ? el.getBoundingClientRect().top + window.scrollY : (t as number);
    emit("scroll:jump", { y, immediate: true });
  }
  if (el) el.scrollIntoView({ behavior, block: o.block ?? "start" });
  else window.scrollTo({ top: t as number, behavior });

  if (o.history && el?.id) {
    const url = `#${el.id}`;
    if (o.history === "push") window.history.pushState(null, "", url);
    else window.history.replaceState(null, "", url);
  }

  await arrive(instant);
  if (o.focus && el) focusOn(el);
}

/* — locks (ref-counted by owner) ——————————————————————————————————— */

const lockOwners = new Set<string>();
let savedOverflow = "";

/** Lock page scroll for `owner` (menu, palette, map dialog …). */
export function lockScroll(owner: string): void {
  if (typeof document === "undefined" || lockOwners.has(owner)) return;
  lockOwners.add(owner);
  if (lockOwners.size !== 1) return;
  savedOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  lenis?.stop();
}

/** Release `owner`'s lock; the page scrolls again when no owner is left. */
export function unlockScroll(owner: string): void {
  if (typeof document === "undefined" || !lockOwners.delete(owner) || lockOwners.size) return;
  document.body.style.overflow = savedOverflow;
  savedOverflow = "";
  lenis?.start();
}

/* — refresh ————————————————————————————————————————————————————————— */

let refreshTimer: number | undefined;

/** Debounced (200 ms) re-measure after a layout change. Stub: Lenis resize
 *  only (B1-SCROLL adds ScrollTrigger.refresh() + sort()). */
export function requestScrollRefresh(): void {
  if (typeof window === "undefined") return;
  window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => lenis?.resize(), 200);
}

/* — velocity + idle ————————————————————————————————————————————————— */

const sample = { y: 0, t: 0, v: 0, on: false };

function ensureSampler(): void {
  if (sample.on || typeof window === "undefined") return;
  sample.on = true;
  sample.y = window.scrollY;
  sample.t = performance.now();
  window.addEventListener(
    "scroll",
    () => {
      const now = performance.now();
      const dt = now - sample.t;
      if (dt > 0) sample.v = ((window.scrollY - sample.y) / dt) * 1000;
      sample.y = window.scrollY;
      sample.t = now;
    },
    { passive: true },
  );
}

/** Current scroll speed in px/s (0 at rest; measured from scroll events,
 *  so it is the same with or without Lenis). */
export function scrollVelocity(): number {
  if (typeof window === "undefined") return 0;
  ensureSampler();
  return performance.now() - sample.t > 120 ? 0 : Math.abs(sample.v);
}

/** Call `fn` ONCE, when the page has not scrolled (or wheeled) for `ms`
 *  (default 150) — with `below`, a scroll slower than `below` px/s does not
 *  reset the wait. Returns a cancel function. */
export function onScrollIdle(fn: () => void, o: { ms?: number; below?: number } = {}): () => void {
  if (typeof window === "undefined") return noop;
  ensureSampler();
  const ms = o.ms ?? 150;
  let timer = 0;
  const arm = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(fire, ms);
  };
  const onMove = () => {
    if (o.below != null && scrollVelocity() < o.below) return;
    arm();
  };
  const stop = () => {
    window.clearTimeout(timer);
    window.removeEventListener("scroll", onMove);
    window.removeEventListener("wheel", onMove);
  };
  function fire() {
    stop();
    fn();
  }
  window.addEventListener("scroll", onMove, { passive: true });
  window.addEventListener("wheel", onMove, { passive: true });
  arm();
  return stop;
}
