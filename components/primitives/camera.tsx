"use client";

import { startTransition, Suspense, useEffect, useRef, useState, type ComponentProps, type ComponentType, type ReactNode } from "react";
import type { MotionValue } from "motion/react";
import { useDesktopFine, useReducedMotion } from "@/lib/flags";
import { safeLazy } from "@/lib/safe-lazy";
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
   chunk) through `enginePart()`, the one loader the four plate facades
   share (camera, depth, LivePlate, weather). Server, hydration, phones, touch, reduced motion and Pause: the
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
      .then((m) => m.whenLadder(2).then(() => m.nextTurn()))
      .then(
        () => {
          // on this plate's turn (a few plates per idle slice: their engine
          // parts mount over a few frames, not one commit) and in a
          // transition (its render is time-sliced): no long task under the
          // first wheel (P3-2 #9)
          if (on) startTransition(() => setReady(true));
        },
        () => undefined,
      );
    return () => {
      on = false;
    };
  }, [live, ready]);
  return live && ready;
}

type Stage = typeof import("@/components/stage/stage");
type EnginePartName = "CameraDrive" | "DepthNear" | "LiveImpl" | "WeatherImpl";

/** One part of the desktop plates engine (components/stage/stage.tsx, the
 *  stage's own chunk, lazy; a failed chunk renders nothing), rendered only
 *  while usePlateEngine() holds. One loader for the four facades (camera,
 *  depth, LivePlate, weather). */
export function enginePart<K extends EnginePartName>(name: K): (props: ComponentProps<Stage[K]>) => ReactNode {
  const Part = safeLazy(() => import("@/components/stage/stage").then((m) => ({ default: m[name] as ComponentType<object> })));
  return function EnginePart(props) {
    return usePlateEngine() ? (
      <Suspense fallback={null}>
        <Part {...props} />
      </Suspense>
    ) : null;
  };
}

const Drive = enginePart("CameraDrive");

export function CameraGroup({ spec, progress, className, children }: CameraGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className={cn("plate-cam", className)} data-camera={spec.kind}>
      {children}
      {spec.kind !== "hold" ? <Drive target={ref} spec={spec} progress={progress} /> : null}
    </div>
  );
}
