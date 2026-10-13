"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { bootGateOn, shouldSkip, useDesktopFine, useMotionPausedAtBoot, useReducedMotion, useSaveData, useSkipFlags } from "@/lib/flags";
import { registerChunk, useLadder } from "@/lib/ladder";

/* ============================================================================
   STAGE GATE (spec §3.2) — OWNER: B1-STAGE.
   The lazy half of <StageGate/> (./stage-gate.tsx, the static facade
   app/page.tsx mounts before <main>; DP-13: loaded on DESKTOP_FINE only).
   Renders nothing on the server and during hydration (so the hero poster stays the LCP and the HTML is the
   same for every visitor). It lazy-loads ./stage (next/dynamic, ssr: false)
   only when ALL hold, read after mount:
     DESKTOP_FINE · motion on (no OS reduced motion, not paused) · the view
     did not start paused · the boot gate is on (html.js; the CSS layout
     gates key on the same) · no Save-Data / slow link · no `?skip=stage`
     · ladder step 3 reached (after the intro's quiet window; lib/ladder).
   Phones, reduced motion and a paused view never fetch the chunk. Once
   mounted it stays mounted: a mid-session Pause or reduced motion is the
   stage's own concern (it stops at once; the CSS drops it in the same
   frame), so toggling Pause never re-downloads or re-measures anything.
   ========================================================================== */

// a failed chunk renders nothing (the page stays opaque: never a blank section)
const Stage = dynamic(() => import("./stage").catch(() => ({ default: () => null })), { ssr: false });
/** The same chunk for the warm-up ladder's prefetch (lib/ladder registerChunk):
 *  a stable reference, registered once on DESKTOP_FINE. */
const loadStage = () => import("./stage");

export default function StageGateImpl() {
  const fine = useDesktopFine();
  const reduced = useReducedMotion();
  const pausedAtBoot = useMotionPausedAtBoot();
  const saveData = useSaveData();
  const skip = useSkipFlags();
  const step3 = useLadder(3);
  const [armed, setArmed] = useState(false);

  const eligible = fine && !reduced && !pausedAtBoot && !saveData && !shouldSkip("stage", skip) && step3;

  // the ladder prefetches the stage chunk early (idle slices) on desktop
  useEffect(() => {
    if (fine) registerChunk(loadStage);
  }, [fine]);

  useEffect(() => {
    if (armed || !eligible) return;
    // the boot gate is DOM state (html.js, data-motion-boot): read it here,
    // never during render
    const t = window.setTimeout(() => {
      if (bootGateOn()) setArmed(true);
    }, 0);
    return () => window.clearTimeout(t);
  }, [armed, eligible]);

  return armed ? <Stage /> : null;
}
