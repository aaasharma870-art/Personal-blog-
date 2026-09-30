/* ============================================================================
   useScrollScene — the only way a component builds a GSAP/ScrollTrigger
   scene (PHASE3-SPEC §3.1). On DESKTOP_FINE with motion on it awaits
   loadGsap(), queues the build until ladder step 2, runs `build` inside
   `gsap.context(…, ref)` and cleans up with `ctx.revert()`; it re-runs when
   motion turns off/on. `build` may return its own cleanup.

   W1.0 STUB: a no-op (B1-SCROLL implements it). Nothing is loaded, nothing
   is built, so every host renders exactly as today.
   ========================================================================== */

import type { RefObject } from "react";
import type { Gsap, ScrollTriggerStatic } from "./gsap";

export type ScrollSceneApi = { gsap: Gsap; ScrollTrigger: ScrollTriggerStatic; scope: Element };
export type ScrollSceneBuild = (api: ScrollSceneApi) => void | (() => void);

export function useScrollScene(
  ref: RefObject<Element | null>,
  build: ScrollSceneBuild,
  deps: readonly unknown[],
): void {
  void ref;
  void build;
  void deps;
}
