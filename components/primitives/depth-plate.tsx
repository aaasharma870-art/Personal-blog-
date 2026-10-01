import type { MotionValue } from "motion/react";
import type { MediaId } from "@/lib/media";
import { MediaFrame } from "@/components/primitives/media-frame";

/* ============================================================================
   DEPTH PLATE (spec §6.1, P3-5; plan §3.4) — OWNER: W2-PLATES.
   A still split at a horizon `line` into far and near layers that parallax
   against each other (transform only; the ALT of every loop, DP-8).
   W1.0 stub: the still (MediaFrame, fill, never plays).
   ========================================================================== */

export type DepthSpec = {
  line: number;
  feather?: number;
  far?: number;
  near?: number;
  max?: number;
};

export type DepthPlateProps = {
  media: MediaId;
  spec: DepthSpec;
  progress?: MotionValue<number>;
};

export function DepthPlate({ media }: DepthPlateProps) {
  return <MediaFrame media={media} layout="fill" playOn="never" loop={false} />;
}
