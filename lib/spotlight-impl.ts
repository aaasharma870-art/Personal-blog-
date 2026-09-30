/* ============================================================================
   SPOTLIGHT (impl) — loaded lazily by lib/spotlight.ts on DESKTOP_FINE with
   motion on (PHASE3-SPEC §3.8). W1.0 STUB: every request plays, nothing is
   arbitrated (B1-BEATS implements scroll-star ownership, waits, needsIdle,
   maxWait timeouts and the `?debug=spotlight` log).
   ========================================================================== */

import type { BeatWeight } from "./beats";
import type { SpotlightAnswer, SpotlightRequest } from "./spotlight";

export function request(id: string, o: SpotlightRequest): Promise<SpotlightAnswer> {
  void id;
  void o;
  return Promise.resolve("play");
}

export function release(id: string): void {
  void id;
}

export function registerScrollStar(id: string, el: Element, weight: BeatWeight): () => void {
  void id;
  void el;
  void weight;
  return () => {};
}
