"use client";

import { lazy, Suspense, useRef } from "react";
import type { MotionValue } from "motion/react";
import type { MediaId } from "@/lib/media";
import { MediaFrame } from "@/components/primitives/media-frame";
import { usePlateEngine } from "@/components/primitives/camera";

/* ============================================================================
   DEPTH PLATE (spec §6.1, P3-5; plan §3.4) — OWNER: W2-PLATES.
   A still split at its registered line (horizon, lake, ledge) into a FAR
   and a NEAR band that parallax against each other: two copies of ONE
   decoded image (next/image with identical props, so the same URL and one
   decode), the near copy masked by a static gradient (a 6% feather) and
   promoted once (a mask riding a transform, never animated). Per scroll
   step only the far band's transform changes: it lags the near band by
   (far − near) × the virtual camera's travel, ≤ max of the box width
   (default 1%, never above the spec's ±1.5%), and scales just enough to
   cover its box (identity at the centre of the travel, so nothing pops).
   The ALT of every loop (DP-8) and the DEFAULT of the loop-less plates.

   THE FACADE (DP-13). First-load: the still (MediaFrame, never plays) in a
   far wrapper. On DESKTOP_FINE with motion on, after ladder step 2, the
   near copy and the driver load from the desktop plates engine
   (components/stage/stage.tsx `DepthNear`). Server, phones, reduced
   motion, Pause: the plain still (the near copy unmounts, the far band's
   transform resets).

   PROGRESS. `progress` (0–1) when the host has one (a card's p); else the
   plate's own passage through the viewport (ScrollTrigger, like the
   camera's `flow`). `line` is in plate rows (0–1); the engine maps it to
   the box through the cover crop (object-position = the plate's focal),
   on resize only. A plate's registered line: stage.tsx `lineOf` (the
   `horizon` / `lake` mark, or the mean of `ledgeL` / `ledgeR`).
   ========================================================================== */

export type DepthSpec = {
  /** The split, as a plate row 0–1 (a registered line mark). */
  line: number;
  /** Feather of the split as a fraction of the box height (default .06). */
  feather?: number;
  /** Far band speed relative to the camera (default .4). */
  far?: number;
  /** Near band speed relative to the camera (default 1). */
  near?: number;
  /** Camera travel as a fraction of the box width (default .01, ≤ .015). */
  max?: number;
};

export type DepthPlateProps = {
  media: MediaId;
  spec: DepthSpec;
  progress?: MotionValue<number>;
  /** next/image sizes of both copies (default "100vw", MediaFrame's). */
  sizes?: string;
};

const Near = lazy(() => import("@/components/stage/stage").then((m) => ({ default: m.DepthNear })));

export function DepthPlate({ media, spec, progress, sizes = "100vw" }: DepthPlateProps) {
  const root = useRef<HTMLDivElement>(null);
  const far = useRef<HTMLDivElement>(null);
  const engine = usePlateEngine();
  return (
    <div ref={root} className="plate-depth" data-depth="">
      <div ref={far} className="plate-depth-far">
        <MediaFrame media={media} layout="fill" playOn="never" loop={false} sizes={sizes} />
      </div>
      {engine ? (
        <Suspense fallback={null}>
          <Near root={root} far={far} media={media} spec={spec} progress={progress} sizes={sizes} />
        </Suspense>
      ) : null}
    </div>
  );
}
