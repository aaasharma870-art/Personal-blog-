"use client";

/* ============================================================================
   STAGE GATE — the static facade (PHASE3-PLAN DP-13; spec §12.1). Mounted
   by app/page.tsx before <main>; renders nothing on the server, during
   hydration and below DESKTOP_FINE. On DESKTOP_FINE it lazy-loads
   ./stage-gate-impl (the gate itself: motion, boot gate, Save-Data,
   ?skip=stage and ladder step 3 decide when ./stage loads; see that file),
   so phones and touch screens never fetch any stage code.
   ========================================================================== */

import { lazy, Suspense } from "react";
import { useDesktopFine } from "@/lib/flags";

const Gate = lazy(() => import("./stage-gate-impl"));

export function StageGate() {
  const fine = useDesktopFine();
  return fine ? (
    <Suspense fallback={null}>
      <Gate />
    </Suspense>
  ) : null;
}
