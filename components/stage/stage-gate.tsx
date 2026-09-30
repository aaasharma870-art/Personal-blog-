"use client";

/* ============================================================================
   STAGE GATE (spec §3.2) — OWNER: B1-STAGE.
   Mounted by app/page.tsx before <main>. It will lazy-load ./stage
   (`dynamic(() => import("./stage"), { ssr: false })`) at ladder step 3 on
   DESKTOP_FINE with motion on; phones and reduced motion never fetch it.
   W1.0 stub: renders nothing.
   ========================================================================== */

export function StageGate(): null {
  return null;
}
