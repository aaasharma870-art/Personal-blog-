"use client";

/* ============================================================================
   WORLD FONTS — the static facade (PHASE3-PLAN DP-13; spec §12.1). Mounted
   once by app/layout.tsx; renders nothing. At DESKTOP_WIDE only (where the
   world faces apply) it lazy-loads ./world-fonts-impl, which adds each
   world's font token as the world approaches (see that file's header).
   Phones never fetch it, and fetch no world face.
   ========================================================================== */

import { Suspense } from "react";
import { useDesktopWide } from "@/lib/flags";
import { safeLazy } from "@/lib/safe-lazy";

// renders nothing: a failed chunk only means today's fonts, as on phones
const Impl = safeLazy(() => import("./world-fonts-impl"));

export function WorldFonts() {
  const wide = useDesktopWide();
  return wide ? (
    <Suspense fallback={null}>
      <Impl />
    </Suspense>
  ) : null;
}
