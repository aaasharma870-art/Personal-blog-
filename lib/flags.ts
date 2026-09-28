/* ============================================================================
   FLAGS — URL flags + environment preferences (SYNTHESIS §8).
   Client-safe AND server-safe: every reader returns the conservative default
   when `window` / `navigator` are unavailable (SSR, Node). No behaviour
   depends on these yet (Phase 0); later phases gate intros, cinematic scenes
   and heavy media on them.

   ?skip                → skip every skippable moment (intro, scenes, …)
   ?skip=intro,scene    → skip only the named moments
   ========================================================================== */

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

/** `?skip` flags for the current page (no flags on the server). */
export function readSkipFlags(): SkipFlags {
  if (typeof window === "undefined") return NO_SKIP;
  return parseSkipFlags(window.location.search);
}

/** True when `name` (e.g. "intro") should be skipped. */
export function shouldSkip(name: string, flags: SkipFlags = readSkipFlags()): boolean {
  return flags.all || flags.names.has(name.toLowerCase());
}

/* — Environment preferences ——————————————————————————————————————————— */

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const FINE_POINTER = "(pointer: fine)";

function matches(query: string): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(query).matches;
}

/** OS-level reduced-motion preference (false on the server). */
export function prefersReducedMotion(): boolean {
  return matches(REDUCED_MOTION);
}

/** Primary input is a precise pointer (mouse / trackpad). */
export function prefersFinePointer(): boolean {
  return matches(FINE_POINTER);
}

/** Subscribe to reduced-motion changes (for useSyncExternalStore). */
export function subscribeReducedMotion(onChange: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const m = window.matchMedia(REDUCED_MOTION);
  m.addEventListener("change", onChange);
  return () => m.removeEventListener("change", onChange);
}

type NetworkInformationLike = { saveData?: boolean; effectiveType?: string };

/** Data Saver on, or a 2G/3G-class link: prefer stills over video. Mirrors the
 *  rule AmbientBackground already applies to its ambient loops. */
export function prefersSaveData(): boolean {
  if (typeof navigator === "undefined") return false;
  const c = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
  if (!c) return false;
  if (c.saveData) return true;
  return Boolean(c.effectiveType && /(?:^|-)(?:2g|3g)$/.test(c.effectiveType));
}
