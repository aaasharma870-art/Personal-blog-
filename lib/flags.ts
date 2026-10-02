/* ============================================================================
   FLAGS — URL flags + environment preferences (SYNTHESIS §8).

   HYDRATION RULE: environment state (reduced motion, pointer type, Save-Data,
   `?skip`) is unknowable on the server, so it is exposed ONLY through the
   hooks below. Each is a `useSyncExternalStore` with a server snapshot equal
   to the conservative default, so the hydration pass renders exactly what the
   server rendered and the real value arrives in a follow-up render — never a
   mismatched tree (React #418). Do not add raw `window` / `navigator`
   readers here that components could call during render. (For reduced
   motion, MotionProvider then remounts the app once so mount-only props like
   Motion's `initial` take their reduced values.)

   `useReducedMotion` replaces Motion's hook of the same name (which reads the
   OS preference synchronously on the client's FIRST render and so broke
   hydration under prefers-reduced-motion). ESLint bans importing Motion's
   version (eslint.config.mjs).

   MOTION OFF = OS reduced motion OR the Pause toggle (P1-early). Since the
   Pause toggle exists, `useReducedMotion()` means "motion is off for any
   reason": every existing consumer (loops, videos, canvases, reveals) honours
   Pause without edits. `useOsReducedMotion()` is the raw OS preference; the
   pause state is `useMotionPaused()` / `setMotionPaused()` (sessionStorage
   "motion" = "paused", every access in try/catch; the CSS mirror is
   html[data-motion="paused"], kept in sync by MotionProvider).

   ?skip                → skip every skippable moment (intro, scenes, …)
   ?skip=intro,scene    → skip only the named moments
   Phase 3 adds the names "smooth" (no Lenis), "gl" (no WebGL tier) and
   "stage" (no persistent stage) — see `SkipName`.

   PHASE 3 GATES (PHASE3-PLAN §3.1): DESKTOP_WIDE / DESKTOP_FINE are the full
   media queries every desktop-only piece keys on (never Tailwind `lg:`);
   `useDesktopWide()` / `useDesktopFine()` are their hydration-safe hooks
   (false on the server and during hydration). `motionOffNow()` and
   `bootGateOn()` are NON-HOOK readers for effects, event handlers and lazy
   chunks only: never call them during render.
   ========================================================================== */

import { useSyncExternalStore } from "react";
import { readSession, writeSession } from "./session";

/** Named skippable moments (`?skip=a,b`). Phase 3 adds "smooth", "gl" and
 *  "stage". `shouldSkip()` still accepts any string (unknown names are
 *  simply never read). */
export type SkipName = "intro" | "hero" | "scene" | "smooth" | "gl" | "stage";

export type SkipFlags = {
  /** Bare `?skip` (or `?skip=all`): skip everything skippable. */
  all: boolean;
  /** Named moments from `?skip=a,b`. */
  names: ReadonlySet<string>;
};

const NO_SKIP: SkipFlags = { all: false, names: new Set() };

/** Pure parser — pass any `location.search`-style string. */
export function parseSkipFlags(search: string): SkipFlags {
  const params = new URLSearchParams(search);
  if (!params.has("skip")) return NO_SKIP;
  const names = new Set(
    params
      .getAll("skip")
      .flatMap((v) => v.split(","))
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean),
  );
  return { all: names.size === 0 || names.has("all"), names };
}

/** True when `name` (e.g. "intro") should be skipped. Pure. */
export function shouldSkip(name: string, flags: SkipFlags): boolean {
  return flags.all || flags.names.has(name.toLowerCase());
}

/* — Stores (client snapshot + subscription; module-private) ——————————— */

const noop = () => {};
const serverFalse = () => false;
const hasMatchMedia = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function";

function mediaQueryStore(query: string) {
  return {
    subscribe(onChange: () => void): () => void {
      if (!hasMatchMedia()) return noop;
      const m = window.matchMedia(query);
      m.addEventListener("change", onChange);
      return () => m.removeEventListener("change", onChange);
    },
    getSnapshot(): boolean {
      return hasMatchMedia() && window.matchMedia(query).matches;
    },
  };
}

const reducedMotion = mediaQueryStore("(prefers-reduced-motion: reduce)");
const finePointer = mediaQueryStore("(pointer: fine)");

/* Generic media-query stores, cached per query string so every consumer of
   the same query shares one MediaQueryList subscription. */
const queryStores = new Map<string, ReturnType<typeof mediaQueryStore>>();
function queryStore(query: string) {
  let store = queryStores.get(query);
  if (!store) {
    store = mediaQueryStore(query);
    queryStores.set(query, store);
  }
  return store;
}

/* — Motion pause (the Pause toggle; SPEC §13, DESIGN v2 §6.5) ————————— */

const MOTION_KEY = "motion";
const PAUSED = "paused";
const pauseListeners = new Set<() => void>();
/** Current pause state; null until first read on the client. */
let paused: boolean | null = null;
/** The state this page view STARTED in (read once, never updated by later
 *  toggles) — MotionProvider remounts once for it, like OS reduced motion. */
let pausedAtBoot: boolean | null = null;

function pausedSnapshot(): boolean {
  if (paused === null) paused = readSession(MOTION_KEY) === PAUSED;
  return paused;
}

function pausedAtBootSnapshot(): boolean {
  if (pausedAtBoot === null) pausedAtBoot = pausedSnapshot();
  return pausedAtBoot;
}

function subscribePaused(onChange: () => void): () => void {
  pauseListeners.add(onChange);
  return () => pauseListeners.delete(onChange);
}

/** Pause (true) or resume (false) all decorative motion for this session.
 *  Persists in sessionStorage when it can; works in memory when it can't. */
export function setMotionPaused(next: boolean): void {
  pausedAtBootSnapshot(); // pin the boot value before the first change
  paused = next;
  writeSession(MOTION_KEY, next ? PAUSED : null);
  syncMotionAttribute(next);
  pauseListeners.forEach((l) => l());
}

/** Mirrors the pause state onto <html data-motion="paused"> for CSS
 *  (globals.css kills CSS animations/transitions under it, like reduced
 *  motion). Called by MotionProvider AFTER hydration, never during render,
 *  so the server-rendered <html> attributes still hydrate cleanly. */
export function syncMotionAttribute(isPaused: boolean): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (isPaused) root.dataset.motion = PAUSED;
  else delete root.dataset.motion;
}

/* — Document visibility ——————————————————————————————————————————— */

function subscribeVisibility(onChange: () => void): () => void {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

type NetworkInformationLike = EventTarget & {
  saveData?: boolean;
  effectiveType?: string;
};

function connection(): NetworkInformationLike | undefined {
  if (typeof navigator === "undefined") return undefined;
  return (navigator as Navigator & { connection?: NetworkInformationLike })
    .connection;
}

function subscribeConnection(onChange: () => void): () => void {
  const c = connection();
  if (!c || typeof c.addEventListener !== "function") return noop;
  c.addEventListener("change", onChange);
  return () => c.removeEventListener("change", onChange);
}

/** Data Saver on, or a 2G/3G-class link. Mirrors the rule AmbientBackground
 *  already applies to its ambient loops. */
function saveDataSnapshot(): boolean {
  const c = connection();
  if (!c) return false;
  if (c.saveData) return true;
  return Boolean(c.effectiveType && /(?:^|-)(?:2g|3g)$/.test(c.effectiveType));
}

// `?skip` only changes on navigation. The snapshot is cached per search
// string so useSyncExternalStore sees a stable reference between renders.
let lastSearch: string | null = null;
let lastSkip: SkipFlags = NO_SKIP;

function skipSnapshot(): SkipFlags {
  const search = window.location.search;
  if (search !== lastSearch) {
    lastSearch = search;
    lastSkip = parseSkipFlags(search);
  }
  return lastSkip;
}

function subscribePopState(onChange: () => void): () => void {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

/* — Hooks (the only public readers) ————————————————————————————————— */

/** MOTION OFF: OS reduced motion OR the Pause toggle. false on the server
 *  and during hydration, then the real value; follows live changes. Every
 *  loop, video, canvas and reveal gates on this. */
export function useReducedMotion(): boolean {
  const os = useOsReducedMotion();
  const isPaused = useMotionPaused();
  return os || isPaused;
}

/** The raw OS prefers-reduced-motion preference (ignores the Pause toggle).
 *  false on the server and during hydration, then the real value. */
export function useOsReducedMotion(): boolean {
  return useSyncExternalStore(
    reducedMotion.subscribe,
    reducedMotion.getSnapshot,
    serverFalse,
  );
}

/** The session Pause toggle. false on the server and during hydration. */
export function useMotionPaused(): boolean {
  return useSyncExternalStore(subscribePaused, pausedSnapshot, serverFalse);
}

/** Whether this page view started paused (constant after hydration). */
export function useMotionPausedAtBoot(): boolean {
  return useSyncExternalStore(subscribePaused, pausedAtBootSnapshot, serverFalse);
}

/** Any media query, hydration-safe (false on the server / during hydration). */
export function useMediaQuery(query: string): boolean {
  const store = queryStore(query);
  return useSyncExternalStore(store.subscribe, store.getSnapshot, serverFalse);
}

/** false while the tab is hidden (document.visibilityState). true on the
 *  server and during hydration. */
export function useDocumentVisible(): boolean {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState !== "hidden",
    () => true,
  );
}

/** Primary input is a precise pointer (mouse / trackpad). */
export function useFinePointer(): boolean {
  return useSyncExternalStore(
    finePointer.subscribe,
    finePointer.getSnapshot,
    serverFalse,
  );
}

/** Data Saver or a slow link: prefer stills over video. */
export function useSaveData(): boolean {
  return useSyncExternalStore(subscribeConnection, saveDataSnapshot, serverFalse);
}

/** `?skip` flags for the current page (no flags on the server). */
export function useSkipFlags(): SkipFlags {
  return useSyncExternalStore(subscribePopState, skipSnapshot, () => NO_SKIP);
}

/* — Phase 3 desktop gates (PHASE3-PLAN §3.1; SPEC §3.1–§3.2) ———————————— */

/** Wide desktop: ≥ 64rem. Layout-free desktop pieces (type, split grids). */
export const DESKTOP_WIDE = "(min-width: 64rem)";

/** Wide desktop with a precise hovering pointer: every Phase-3 motion piece
 *  (Lenis, the stage, GL, toys, hotspots) keys on this full query. */
export const DESKTOP_FINE = "(min-width: 64rem) and (hover: hover) and (pointer: fine)";

/** DESKTOP_WIDE, hydration-safe (false on the server / during hydration). */
export function useDesktopWide(): boolean {
  return useMediaQuery(DESKTOP_WIDE);
}

/** DESKTOP_FINE, hydration-safe (false on the server / during hydration). */
export function useDesktopFine(): boolean {
  return useMediaQuery(DESKTOP_FINE);
}

/** NON-HOOK: motion is off right now (live OS reduced motion OR the Pause
 *  toggle). For effects, handlers and lazy chunks, never for render. true
 *  where there is no window (nothing may animate there). */
export function motionOffNow(): boolean {
  if (!hasMatchMedia()) return true;
  // the Pause state first: right after a Pause click html[data-motion] has
  // invalidated the whole document's style, and matchMedia() would force
  // that restyle inside the click
  return pausedSnapshot() || reducedMotion.getSnapshot();
}

/** NON-HOOK: call `fn` whenever motion may have turned off or on (the OS
 *  reduced-motion preference changed, or the Pause toggle flipped); read
 *  `motionOffNow()` inside it. Synchronous with the change (no React render
 *  in between), so smooth scroll and the ladder can stop within one task.
 *  Returns the unsubscribe; a no-op where there is no window. */
export function onMotionOffChange(fn: () => void): () => void {
  if (!hasMatchMedia()) return noop;
  const offOs = reducedMotion.subscribe(fn);
  pauseListeners.add(fn);
  return () => {
    offOs();
    pauseListeners.delete(fn);
  };
}

/** NON-HOOK: the boot gate is on — `html.js`, the view did not START paused
 *  (`html[data-motion-boot="paused"]`, set once by the pre-paint boot
 *  script), DESKTOP_FINE and no reduced-motion preference. The CSS twin is
 *  the `boot:` variant in globals.css; every layout difference keys on it. */
export function bootGateOn(): boolean {
  if (typeof document === "undefined" || !hasMatchMedia()) return false;
  const root = document.documentElement;
  return (
    root.classList.contains("js") &&
    root.dataset.motionBoot !== PAUSED &&
    window.matchMedia(DESKTOP_FINE).matches &&
    window.matchMedia("(prefers-reduced-motion: no-preference)").matches
  );
}
