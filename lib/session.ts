/* ============================================================================
   SESSION — sessionStorage behind try/catch (private windows, blocked site
   data, thumbnail capture and sandboxed previews can all throw on access),
   plus the once-per-session helper the Lens aperture and the intro use.

   Hydration: the server can't read sessionStorage, so the hook reports
   `null` ("unknown") on the server and during hydration, then the real value
   — never a mismatched first render (see lib/flags.ts HYDRATION RULE).
   ========================================================================== */

import { useCallback, useSyncExternalStore } from "react";

/** The stored value, or null when absent OR when storage is unavailable. */
export function readSession(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Writes (or removes, for null). Returns false when storage is unavailable. */
export function writeSession(key: string, value: string | null): boolean {
  try {
    if (value === null) window.sessionStorage.removeItem(key);
    else window.sessionStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

let available: boolean | null = null;

/** True when storage can be read AND written (probed once per page view). */
export function sessionAvailable(): boolean {
  if (available !== null) return available;
  try {
    const k = "__session_probe__";
    window.sessionStorage.setItem(k, "1");
    window.sessionStorage.removeItem(k);
    available = true;
  } catch {
    available = false;
  }
  return available;
}

/* — Once per session ——————————————————————————————————————————————— */

const ONCE_PREFIX = "once:";
const onceListeners = new Set<() => void>();
/** In-memory marks, so a flourish marked in this page view stays marked even
 *  when storage is unavailable. */
const memoryMarks = new Set<string>();

/** Whether `key` already ran this session. Storage failure counts as SEEN:
 *  a flourish we can't remember is skipped rather than replayed on every
 *  navigation (the same conservative rule the intro uses: a throw means "do
 *  not arm"). */
export function hasRunThisSession(key: string): boolean {
  if (memoryMarks.has(key)) return true;
  if (!sessionAvailable()) return true;
  return readSession(ONCE_PREFIX + key) === "1";
}

export function markRunThisSession(key: string): void {
  memoryMarks.add(key);
  writeSession(ONCE_PREFIX + key, "1");
  onceListeners.forEach((l) => l());
}

/** Clears a mark (QA: "watch the intro again"). */
export function clearRunThisSession(key: string): void {
  memoryMarks.delete(key);
  writeSession(ONCE_PREFIX + key, null);
  onceListeners.forEach((l) => l());
}

function subscribeOnce(onChange: () => void): () => void {
  onceListeners.add(onChange);
  return () => onceListeners.delete(onChange);
}

/**
 * `shouldRun`: null on the server / during hydration (unknown — render the
 * final state), then true exactly while `key` has not run this session.
 * Call `markRun()` when the flourish starts, so a reload mid-flourish or a
 * second mount doesn't replay it.
 */
export function useOncePerSession(key: string): {
  shouldRun: boolean | null;
  markRun: () => void;
} {
  const seen = useSyncExternalStore(
    subscribeOnce,
    () => hasRunThisSession(key),
    () => null,
  );
  const markRun = useCallback(() => markRunThisSession(key), [key]);
  return { shouldRun: seen === null ? null : !seen, markRun };
}
