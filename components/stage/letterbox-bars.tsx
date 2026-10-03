"use client";

/* ============================================================================
   LETTERBOX BARS — the static facade (PHASE3-PLAN DP-13; spec §7.4, §12.1).
   OWNER: B1-STAGE. The bars and their store live in ./letterbox-bars-impl
   (see its header), loaded only on DESKTOP_FINE with motion on:
   - <LetterboxBars/> (app/page.tsx, before <main>): renders nothing on the
     server, during hydration, on phones, under reduced motion and Pause;
     otherwise it lazy-loads and mounts the one fixed pair.
   - useLetterboxScene(ref, { close, open }) lives in ./letterbox-bars-impl
     (its only host, films-desktop.tsx, is a lazy chunk itself): it ties a
     host to the bars with ScrollTrigger position strings, through
     useScrollScene (DESKTOP_FINE + motion on + ladder step 2; otherwise a
     no-op). Nothing of it is in the first load.
   ========================================================================== */

import { Suspense } from "react";
import { useDesktopFine, useReducedMotion } from "@/lib/flags";
import { safeLazy } from "@/lib/safe-lazy";

export type LetterboxSceneOptions = {
  close: readonly [start: string, end: string];
  open: readonly [start: string, end: string];
};

const Bars = safeLazy(() => import("./letterbox-bars-impl").then((m) => ({ default: m.Bars })));

export function LetterboxBars() {
  const fine = useDesktopFine();
  const reduced = useReducedMotion();
  return fine && !reduced ? (
    <Suspense fallback={null}>
      <Bars />
    </Suspense>
  ) : null;
}
