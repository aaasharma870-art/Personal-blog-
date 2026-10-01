import type { ReactNode } from "react";
import type { MediaId } from "@/lib/media";
import { cn } from "@/lib/utils";
import { MediaFrame } from "@/components/primitives/media-frame";
import type { CameraSpec } from "@/components/primitives/camera";
import type { DepthSpec } from "@/components/primitives/depth-plate";

/* ============================================================================
   LIVE PLATE (spec §6.1–§6.3, P3-5; plan §3.4, DP-5) — OWNER: W2-PLATES.
   A plate that moves: the still, a code camera (CameraGroup) and optional
   depth parallax, and — on desktop with motion on — its registered loop
   (lib/loops.ts loopFor(media)). `children` are registered overlays that
   ride inside the camera group. Reduced motion: the poster, 0 video bytes.
   W1.0 stub: today's still — a MediaFrame (fill, never plays) inside a
   positioned box carrying `className`, then the children. No host uses it
   yet, so the page is unchanged.
   ========================================================================== */

export type LivePlateProps = {
  media: MediaId;
  camera?: CameraSpec;
  depth?: boolean | DepthSpec;
  loop?: "auto" | false;
  /** DecoderLock priority for the loop (MediaFrame `decoderPriority`). */
  priority?: number;
  playOn?: "desktop" | "never";
  sizes?: string;
  className?: string;
  /** Overrides the asset's alt (W2-PLATES; the stub uses the asset's). */
  alt?: string;
  children?: ReactNode;
};

export function LivePlate({ media, sizes, className, children }: LivePlateProps) {
  return (
    <div className={cn("relative overflow-hidden", className)} data-live-plate="">
      <MediaFrame media={media} layout="fill" playOn="never" loop={false} sizes={sizes} />
      {children}
    </div>
  );
}
