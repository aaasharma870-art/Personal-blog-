"use client";

import { useRef, type ReactNode } from "react";
import type { MotionValue } from "motion/react";
import type { MediaId } from "@/lib/media";
import { cn } from "@/lib/utils";
import { MediaFrame } from "@/components/primitives/media-frame";
import { enginePart, type CameraSpec } from "@/components/primitives/camera";
import type { DepthSpec } from "@/components/primitives/depth-plate";

/* ============================================================================
   LIVE PLATE (spec §6.1–§6.3, P3-5; plan §3.4, DP-5, DP-8) — OWNER: W2-PLATES.
   A plate that moves. Hosts name the PLATE; the loop is found, never named
   (lib/loops.ts `loopFor(media, plates.loops variant)`):

   - LOOP (a usable loop is registered to the plate): a MediaFrame of the
     loop plays over the plate on DESKTOP_FINE with motion on, in view, while
     it holds the DecoderLock at `priority` (a card's star loop passes 2). A
     loop that loses the decoder pauses and shows its frame as the still
     before the incoming one plays; a loop GL grabs (`gl:frame`) stays paused
     with the lock released until `gl:release` (MediaFrame).
   - CODE (no loop: camp, frontier, drone, express, the `plates.loops` ALT
     without a media alternate): the still with depth parallax on its
     registered line (horizon, lake, ledge) under the virtual camera. 0 video
     bytes.

   `camera` moves the plate and `children` (registered overlays ride the
   same transform). Without one the LOOP path is still; the CODE path gets a
   slow drift (1 → 1.03 over the plate's passage) so it never sits dead.
   `depth`: false = never; a DepthSpec = that split; true / omitted = the
   plate's registered line, on the CODE path only (a loop already moves the
   picture). `progress` (a host MotionValue 0–1) drives a `progress` camera
   and the depth instead of the page scroll. `playOn="never"` (an inline
   plate the stage covers) = no loop and no automatic drift or depth (only a
   camera / depth the host asks for). `alt` labels the box (role="img"); by
   default every film plate is decorative (lib/media.ts alt null).

   THE FACADE (DP-13). First-load renders exactly the still: the plate
   (MediaFrame, never plays) in a far wrapper inside the camera wrapper,
   then `children`. On DESKTOP_FINE with motion on, after ladder step 2,
   the desktop plates engine (components/stage/stage.tsx `LiveImpl`)
   decides the path, adds the loop or the near band between the still and
   the overlays, and drives the camera. Server, phones, reduced motion,
   Pause, no JS: the still, identity transform, 0 video bytes. The engine
   marks the box `data-plate="loop" | "depth" | "still"` (probes).
   ========================================================================== */

export type LivePlateProps = {
  media: MediaId;
  camera?: CameraSpec;
  depth?: boolean | DepthSpec;
  loop?: "auto" | false;
  /** DecoderLock priority for the loop (MediaFrame `decoderPriority`). */
  priority?: number;
  playOn?: "desktop" | "never";
  /** Drives a `progress` camera and the depth (W2-PLATES addition). */
  progress?: MotionValue<number>;
  sizes?: string;
  className?: string;
  /** Labels the plate (role="img"); omitted = decorative. */
  alt?: string;
  children?: ReactNode;
};

const Live = enginePart("LiveImpl");

export function LivePlate({ children, ...props }: LivePlateProps) {
  const { media, sizes, className, alt } = props;
  const cam = useRef<HTMLDivElement>(null);
  const far = useRef<HTMLDivElement>(null);
  return (
    <div className={cn("relative overflow-hidden", className)} data-live-plate={media} role={alt ? "img" : undefined} aria-label={alt || undefined}>
      <div ref={cam} className="plate-cam absolute inset-0">
        <div ref={far} className="plate-depth-far">
          <MediaFrame media={media} layout="fill" playOn="never" loop={false} sizes={sizes} />
        </div>
        <Live {...props} cam={cam} far={far} />
        {children}
      </div>
    </div>
  );
}
