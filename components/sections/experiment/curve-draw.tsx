"use client";

import { Suspense, useRef, type ReactNode } from "react";
import { safeLazy } from "@/lib/safe-lazy";
import { beatAttrs } from "@/lib/beats";
import { useDesktopFine, useReducedMotion } from "@/lib/flags";
import type { VariantChoice } from "@/lib/variants";
import { cn } from "@/lib/utils";

/* ============================================================================
   CURVE DRAW (facade; PHASE3-SPEC §2.3 B25, P3-7 "small") — OWNER: W3-IDIOTS.
   The experiment's synthetic curve draws ONCE on entry. This wrapper is the
   B25 host (data-beat) and the only first-load part: on DESKTOP_FINE with
   motion on it lazy-loads ./curve-draw-impl (DP-13), which hides the plot
   only while the demo is OFFSCREEN ("armed") and reveals it when it enters,
   as a time star through the spotlight. Server, hydration, phones, touch,
   reduced motion, Pause and no-JS: the demo exactly as today (the cover
   never mounts, or unmounts at once when motion turns off).
   The demo's header, its "Synthetic • illustrative" label, the toggle and
   the explanatory line are never covered: the label is visible from frame 1.
   H4: no film styling here — a plain plot reveal, no chalk, no world face.
   ========================================================================== */

const Impl = safeLazy(() => import("./curve-draw-impl"));

export function CurveDraw({ choice, className, children }: { choice: VariantChoice; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useDesktopFine();
  const reduced = useReducedMotion();
  return (
    <div ref={ref} className={cn("relative", className)} {...beatAttrs("B25", { weight: 1 })}>
      {children}
      {fine && !reduced ? (
        <Suspense fallback={null}>
          <Impl host={ref} choice={choice} />
        </Suspense>
      ) : null}
    </div>
  );
}
