/* ============================================================================
   SPOTLIGHT (facade) — one star at runtime (PHASE3-SPEC §3.8). Scroll stars
   own it while their range crosses the middle 60% of the viewport; time
   stars `request()` it and get "play" or "skip" (skip = show the end state
   without animating). Facade + lazy impl (DP-13): this file stays < 1 KB;
   lib/spotlight-impl.ts loads on first use, on DESKTOP_FINE with motion on.
   Not DESKTOP_FINE, motion off, or the server → "skip" at once.
   ========================================================================== */

import { DESKTOP_FINE, motionOffNow } from "./flags";
import type { BeatWeight } from "./beats";

export type SpotlightRequest = { weight: BeatWeight; needsIdle?: boolean; maxWait?: number; durationMs?: number };
export type SpotlightAnswer = "play" | "skip";

type Impl = typeof import("./spotlight-impl");
let impl: Impl | null = null;
let loading: Promise<Impl> | null = null;

function eligible(): boolean {
  return typeof window !== "undefined" && window.matchMedia(DESKTOP_FINE).matches && !motionOffNow();
}

function load(): Promise<Impl> {
  if (!loading) {
    loading = import("./spotlight-impl").then((m) => (impl = m));
    loading.catch(() => {
      loading = null;
    });
  }
  return loading;
}

export const spotlight = {
  request(id: string, o: SpotlightRequest): Promise<SpotlightAnswer> {
    if (!eligible()) return Promise.resolve("skip");
    return load().then(
      (m) => m.request(id, o),
      (): SpotlightAnswer => "skip",
    );
  },
  release(id: string): void {
    impl?.release(id);
  },
  registerScrollStar(id: string, el: Element, weight: BeatWeight): () => void {
    if (!eligible()) return () => {};
    let off: (() => void) | null = null;
    let cancelled = false;
    load().then(
      (m) => {
        if (!cancelled) off = m.registerScrollStar(id, el, weight);
      },
      () => {},
    );
    return () => {
      cancelled = true;
      off?.();
    };
  },
};
