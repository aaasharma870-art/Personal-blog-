/* ============================================================================
   DESKTOP ENHANCER (plan §3.2, DP-13; spec §3.1) — OWNER: B1-SCROLL (the
   framework); the binders belong to W2-WORDS (words), W2-HUNT (hotspots)
   and W3-CINEMA (dc).
   One lazy chunk, loaded by <SmoothScroll/> (components/providers/
   smooth-scroll.tsx) on DESKTOP_FINE, home page only: at ladder step 2 with
   motion on, or after the quiet window at idle with motion off. It binds
   every binder to the server markup (`data-words`, `data-egg-hotspot`,
   `data-dc` …), then replays `window.__enhanceQ`: the clicks on
   `[data-enhance-queue]` elements that the pre-paint boot script recorded
   before anything was bound (components/site/boot-head-script.tsx). The
   attribute's value is the selector the click replays on (empty = the
   element's #id). Recording stops once the queue has been replayed.
   ========================================================================== */

import bindWords from "./binders/words";
import bindHotspots from "./binders/hotspots";
import bindDc from "./binders/dc";

/** A binder: wires its behaviour onto `root`; returns its own cleanup. */
export type Binder = (root: Document) => () => void;

const BINDERS: readonly Binder[] = [bindWords, bindHotspots, bindDc];

/** A click older than this is not replayed (the visitor has moved on). */
const REPLAY_MAX_AGE_MS = 10_000;

/** Replay each recorded element's latest click, oldest first, once. */
function replayQueue(root: Document): void {
  const q = window.__enhanceQ ?? [];
  // stop recording: from now on the binders handle clicks themselves
  window.__enhanceQ = undefined;
  const now = Date.now();
  const latest = new Map<string, number>();
  for (const { sel, t } of q) {
    if (sel && now - t <= REPLAY_MAX_AGE_MS) latest.set(sel, Math.max(t, latest.get(sel) ?? 0));
  }
  const order = [...latest.entries()].sort((a, b) => a[1] - b[1]);
  for (const [sel] of order) {
    let el: Element | null = null;
    try {
      el = root.querySelector(sel);
    } catch {
      continue; // not a valid selector
    }
    if (el instanceof HTMLElement || el instanceof SVGElement) {
      el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
    }
  }
}

export default function enhance(root: Document): () => void {
  const undo = BINDERS.map((bind) => bind(root));
  replayQueue(root);
  return () => {
    for (const u of undo) u();
  };
}
