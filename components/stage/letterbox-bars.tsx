"use client";

/* ============================================================================
   LETTERBOX BARS — the static facade (PHASE3-PLAN DP-13; spec §7.4, §12.1).
   OWNER: B1-STAGE. The bars and their store live in ./letterbox-bars-impl
   (see its header), loaded only on DESKTOP_FINE with motion on:
   - <LetterboxBars/> (app/page.tsx, before <main>): renders nothing on the
     server, during hydration, on phones, under reduced motion and Pause;
     otherwise it lazy-loads and mounts the one fixed pair.
   - useLetterboxScene(ref, { close, open }): ties a host to the bars with
     ScrollTrigger position strings, through useScrollScene (DESKTOP_FINE +
     motion on + ladder step 2; otherwise a no-op). The scene's code loads
     with the bars.
   ========================================================================== */

import { lazy, Suspense, type RefObject } from "react";
import { useDesktopFine, useReducedMotion } from "@/lib/flags";
import { requestScrollRefresh } from "@/lib/smooth-scroll";
import { useScrollScene } from "@/lib/use-scroll-scene";

export type LetterboxSceneOptions = {
  close: readonly [start: string, end: string];
  open: readonly [start: string, end: string];
};

const loadImpl = () => import("./letterbox-bars-impl");
const Bars = lazy(() => loadImpl().then((m) => ({ default: m.Bars })));

export function LetterboxBars() {
  const fine = useDesktopFine();
  const reduced = useReducedMotion();
  return fine && !reduced ? (
    <Suspense fallback={null}>
      <Bars />
    </Suspense>
  ) : null;
}

/** Close the global bars over `o.close`, open them over `o.open` (both
 *  ScrollTrigger [start, end] position strings on the host `ref`). A no-op
 *  on phones, under reduced motion / Pause and before ladder step 2. */
export function useLetterboxScene(ref: RefObject<Element | null>, o: LetterboxSceneOptions): void {
  const [c0, c1] = o.close;
  const [o0, o1] = o.open;
  useScrollScene(
    ref,
    (api) => {
      let dead = false;
      let undo: (() => void) | null = null;
      void loadImpl().then((m) => {
        if (dead) return;
        undo = m.letterboxScene(api, { close: [c0, c1], open: [o0, o1] });
        requestScrollRefresh();
      });
      return () => {
        dead = true;
        undo?.();
      };
    },
    [c0, c1, o0, o1],
  );
}
