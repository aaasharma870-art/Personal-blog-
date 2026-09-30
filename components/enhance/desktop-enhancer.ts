/* ============================================================================
   DESKTOP ENHANCER (plan §3.2, DP-13) — OWNER: B1-SCROLL (the framework);
   the binders belong to W2-WORDS (words), W2-HUNT (hotspots) and
   W3-CINEMA (dc).
   Loaded with a dynamic import as ladder step 2 on DESKTOP_FINE only. It
   binds every binder to the server markup and (B1-SCROLL) replays
   window.__enhanceQ, the interactions queued before it arrived.
   W1.0 stub: binds the (no-op) binders; no queue replay yet.
   ========================================================================== */

import bindWords from "./binders/words";
import bindHotspots from "./binders/hotspots";
import bindDc from "./binders/dc";

/** A binder: wires its behaviour onto `root`; returns its own cleanup. */
export type Binder = (root: Document) => () => void;

const BINDERS: readonly Binder[] = [bindWords, bindHotspots, bindDc];

export default function enhance(root: Document): () => void {
  const undo = BINDERS.map((bind) => bind(root));
  return () => {
    for (const u of undo) u();
  };
}
