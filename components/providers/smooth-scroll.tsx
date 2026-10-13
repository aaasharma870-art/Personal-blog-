"use client";

/* ============================================================================
   SMOOTH SCROLL — the static facade (PHASE3-PLAN DP-13; spec §12.1 "initial
   route ≤ +6 KB gz JS"). Mounted once by app/layout.tsx; renders nothing.
   On DESKTOP_FINE only it lazy-loads ./smooth-scroll-impl (Lenis as ladder
   step 1, the warm-up prefetch, the refresh triggers and the desktop
   enhancer: see that file's header). Phones, touch tablets and every
   narrow window never fetch it: native scroll, byte-for-byte.
   ========================================================================== */

import { Suspense } from "react";
import { useDesktopFine } from "@/lib/flags";
import { safeLazy } from "@/lib/safe-lazy";

// renders nothing: a failed chunk only means native scroll, as on phones
const Impl = safeLazy(() => import("./smooth-scroll-impl"));

export function SmoothScroll() {
  const fine = useDesktopFine();
  return fine ? (
    <Suspense fallback={null}>
      <Impl />
    </Suspense>
  ) : null;
}
