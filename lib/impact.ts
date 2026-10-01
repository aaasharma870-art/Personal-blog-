/* ============================================================================
   IMPACT — "new world revealed" (PHASE3-SPEC §7.6): once per world per page
   view, a no-op under reduced motion or Pause. Shake = a WAAPI transform on
   the frame element only; flash = one overlay opacity pulse (or `uFlash`);
   one flash, never saturated red (WCAG 2.3.1). Emits `impact` for sound.

   W1.0 STUB: the once-per-world bookkeeping and the event only (W2-CARDS
   adds the shake, flash and bloom on `o.el`).
   ========================================================================== */

import { emit } from "./events";
import { motionOffNow } from "./flags";
import type { WorldId } from "./worlds";

export type ImpactOptions = { el?: HTMLElement; shake?: number; flash?: number; bloomEv?: number };

const fired = new Set<WorldId>();

/** Fire `world`'s impact. true when it fired (first time this view, motion
 *  on); false when it already fired, motion is off, or on the server. */
export function impact(world: WorldId, o: ImpactOptions = {}): boolean {
  void o;
  if (typeof window === "undefined" || motionOffNow() || fired.has(world)) return false;
  fired.add(world);
  emit("impact", { world });
  return true;
}
