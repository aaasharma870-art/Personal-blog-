"use client";

import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import type { MotionValue } from "motion/react";
import { useDesktopFine, useReducedMotion } from "@/lib/flags";
import { cn } from "@/lib/utils";

/* ============================================================================
   VIRTUAL CAMERA (spec §6.1, P3-5; plan §3.4) — OWNER: W2-PLATES.
   <CameraGroup spec progress?> moves its children (a plate and its
   registered overlays: chalk FIG. 0, the WANTED text, the Jolly Roger) by
   one CameraSpec: transform only (`translate3d(x%, y%) scale(s)` about
   `focal`), never an edge (the translation is clamped inside the scale's
   overscan), `will-change: transform` only while in view.

   THE FACADE (DP-13, spec §12.1). This file is first-load: it renders the
   wrapper and, on DESKTOP_FINE with motion on and after ladder step 2 (the
   intro's quiet window is over), lazy-loads the driver from the desktop
   plates engine (components/stage/stage.tsx `CameraDrive`, the stage's own
   chunk). Server, hydration, phones, touch, reduced motion and Pause: the
   static wrapper, identity transform (Pause mid-scroll resets it within one
   render: posters only, no camera transforms).

   SPEC.
     kind     drift | push | pan-l | pan-r | settle (a move over the driver's
              range) · hold (no move; the driver is never loaded)
     scale    [from, to]; values below 1 are treated as 1 (never an edge)
     x, y     [from, to] translation as fractions of the box (+ = right/down)
     focal    the point the camera scales about, [x, y] 0–1 of the box
              (LivePlate passes the plate's focal when the host gives none)
     driver   flow     in-flow plates: ScrollTrigger over the wrapper's
                       passage, top entering the viewport (0) → bottom leaving
                       the top (1); `settle` runs 0 → 1 from the top entering
                       to the box centred
              sticky   a sticky / pinned plate: ScrollTrigger over its track,
                       the nearest `[data-camera-track]` ancestor (else the
                       parent), "top top" → "bottom bottom"
              progress the host's MotionValue (0–1), e.g. a card's p; without
                       one the group stays static
   A group that starts while on screen eases from identity into its pose
   over 500 ms (no pop when the engine arrives mid-view).
   ========================================================================== */

export type CameraSpec = {
  kind: "drift" | "push" | "pan-l" | "pan-r" | "hold" | "settle";
  scale: readonly [number, number];
  x?: readonly [number, number];
  y?: readonly [number, number];
  focal?: readonly [number, number];
  driver: "flow" | "sticky" | "progress";
};

export type CameraGroupProps = {
  spec: CameraSpec;
  progress?: MotionValue<number>;
  className?: string;
  children?: ReactNode;
};

/** The desktop plates engine is wanted: DESKTOP_FINE, motion on (no OS
 *  reduced motion, not paused) and ladder step 2 reached. false on the
 *  server and during hydration. Shared by the plate facades (camera, depth,
 *  weather, LivePlate). The ladder is imported lazily (it is not first-load). */
export function usePlateEngine(): boolean {
  const fine = useDesktopFine();
  const reduced = useReducedMotion();
  const live = fine && !reduced;
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!live || ready) return;
    let on = true;
    import("@/lib/ladder")
      .then((m) => m.whenLadder(2))
      .then(
        () => {
          if (on) setReady(true);
        },
        () => undefined,
      );
    return () => {
      on = false;
    };
  }, [live, ready]);
  return live && ready;
}

const Drive = lazy(() => import("@/components/stage/stage").then((m) => ({ default: m.CameraDrive })));

export function CameraGroup({ spec, progress, className, children }: CameraGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const engine = usePlateEngine();
  return (
    <div ref={ref} className={cn("plate-cam", className)} data-camera={spec.kind}>
      {children}
      {engine && spec.kind !== "hold" ? (
        <Suspense fallback={null}>
          <Drive target={ref} spec={spec} progress={progress} />
        </Suspense>
      ) : null}
    </div>
  );
}
