"use client";

import { useEffect } from "react";
import { emit } from "@/lib/events";
import { reapplyHash } from "@/lib/smooth-scroll";

/* ============================================================================
   PAGE HYDRATED (PHASE3-SPEC §4.2) — OWNER: B1-INTRO.
   The LAST Suspense child of app/page.tsx: its effect runs once every
   section boundary before it has hydrated, so it is the page's "React is
   fully up" sentinel. It sets window.__pageHydrated, marks
   `page:hydrated` and emits "page:hydrated" (lib/events.ts). The intro
   controller's hold waits for it (≤ intro.hydrateMaxMs) so no Suspense
   hydration task lands in the reveal. A deep link still held at its target
   (lib/smooth-scroll.ts, every motion state) is re-landed here, the last
   late layout of the load (P3-11 r3 R01). Renders nothing; hydration-safe.
   ========================================================================== */

export function PageHydrated(): null {
  useEffect(() => {
    if (window.__pageHydrated) return;
    window.__pageHydrated = true;
    try {
      performance.mark("page:hydrated");
    } catch {
      /* no User Timing */
    }
    emit("page:hydrated");
    reapplyHash();
  }, []);
  return null;
}
