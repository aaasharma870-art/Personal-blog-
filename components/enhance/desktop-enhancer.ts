/* ============================================================================
   DESKTOP ENHANCER (plan §3.2, DP-13; spec §3.1) — OWNER: B1-SCROLL (the
   framework); the binders belong to W2-WORDS (words), W2-HUNT (hotspots),
   W3-CINEMA (dc) and W3-GAMES (games).
   One lazy chunk, loaded by <SmoothScroll/> (components/providers/
   smooth-scroll.tsx) on DESKTOP_FINE, home page only: at ladder step 2 with
   motion on, or after the quiet window at idle with motion off. It binds
   every binder to the server markup (`data-words`, `data-egg-hotspot`,
   `data-dc`, the game pills …) and replays `window.__enhanceQ`: the clicks
   on `[data-enhance-queue]` elements that the pre-paint boot script
   recorded before anything was bound (components/site/boot-head-script.tsx).
   The attribute's value is the selector the click replays on (empty = the
   element's #id).
   One binder per idle slice (lib/idle.ts): the step-2 task stays short (no
   long task under the first wheel, P3-2 #9). The boot script keeps
   recording until the last slice, so each binder's own queued clicks are
   replayed right after IT binds, and a click on its elements recorded after
   that (answered live) is dropped, never replayed: no toggle runs twice.
   Clicks no binder claims are replayed after the last one; then recording
   stops.
   ========================================================================== */

import { onIdle } from "@/lib/idle";
import bindWords from "./binders/words";
import bindHotspots from "./binders/hotspots";
import bindDc from "./binders/dc";
import bindGames from "./binders/games";

/** A binder: wires its behaviour onto `root`; returns its own cleanup. */
export type Binder = (root: Document) => () => void;

/** Each binder and the queued elements it answers (`[data-enhance-queue]`
 *  markup it handles; null: none). */
const BINDERS: readonly (readonly [Binder, string | null])[] = [
  [bindWords, null],
  [bindHotspots, "[data-egg-hotspot]"],
  [bindDc, "[data-dc]"],
  [bindGames, "#drone-takeoff, #deadeye-call"],
];

/** A click older than this is not replayed (the visitor has moved on). */
const REPLAY_MAX_AGE_MS = 10_000;

function queuedEl(root: Document, sel: string): Element | null {
  try {
    return sel ? root.querySelector(sel) : null;
  } catch {
    return null; // not a valid selector
  }
}

/** Take the queued clicks whose element `take` accepts (and every entry
 *  whose element is gone) out of the queue; replay those `replay` accepts:
 *  each element's latest click, oldest first, once. */
function drain(root: Document, take: (el: Element) => boolean, replay: (el: Element) => boolean): void {
  const q = window.__enhanceQ;
  if (!q?.length) return;
  const now = Date.now();
  const latest = new Map<Element, number>();
  for (let i = q.length - 1; i >= 0; i--) {
    const { sel, t } = q[i]!;
    const el = queuedEl(root, sel);
    if (el && !take(el)) continue;
    q.splice(i, 1);
    if (el && replay(el) && now - t <= REPLAY_MAX_AGE_MS) latest.set(el, Math.max(t, latest.get(el) ?? 0));
  }
  if (!latest.size) return;
  // the replays are not recorded again
  window.__enhanceQ = undefined;
  try {
    for (const [el] of [...latest].sort((a, b) => a[1] - b[1])) {
      if (el instanceof HTMLElement || el instanceof SVGElement) {
        el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      }
    }
  } finally {
    window.__enhanceQ = q;
  }
}

export default function enhance(root: Document): () => void {
  const undo: (() => void)[] = [];
  const owned: string[] = [];
  let cancel = () => {};
  const step = (i: number) => {
    const next = BINDERS[i];
    if (!next) {
      // all bound: a claimed element's remaining clicks were answered live
      const any = owned.join(", ");
      drain(root, () => true, (el) => !any || !el.matches(any));
      // stop recording: from now on the binders handle every click
      window.__enhanceQ = undefined;
      return;
    }
    const [bind, owns] = next;
    try {
      undo.push(bind(root));
      if (owns) {
        owned.push(owns);
        drain(root, (el) => el.matches(owns), () => true);
      }
    } finally {
      // a binder that throws never stops the ones after it
      cancel = onIdle(() => step(i + 1), { timeout: 500 });
    }
  };
  cancel = onIdle(() => step(0), { timeout: 500 });
  return () => {
    cancel();
    for (const u of undo) u();
  };
}
