/* ============================================================================
   FLAGS — URL flags + environment preferences (SYNTHESIS §8).

   HYDRATION RULE: environment state (reduced motion, pointer type, Save-Data,
   `?skip`) is unknowable on the server, so it is exposed ONLY through the
   hooks below. Each is a `useSyncExternalStore` with a server snapshot equal
   to the conservative default, so the hydration pass renders exactly what the
   server rendered and the real value arrives in a follow-up render — never a
   mismatched tree (React #418). Do not add raw `window` / `navigator`
   readers here that components could call during render.

   `useReducedMotion` replaces Motion's hook of the same name (which reads the
   OS preference synchronously on the client's FIRST render and so broke
   hydration under prefers-reduced-motion). ESLint bans importing Motion's
   version (eslint.config.mjs).

   ?skip                → skip every skippable moment (intro, scenes, …)
   ?skip=intro,scene    → skip only the named moments
   ========================================================================== */

import { useSyncExternalStore } from "react";

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

/** OS reduced-motion preference. false on the server and during hydration,
 *  then the real value; follows live OS changes. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    reducedMotion.subscribe,
    reducedMotion.getSnapshot,
    serverFalse,
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
