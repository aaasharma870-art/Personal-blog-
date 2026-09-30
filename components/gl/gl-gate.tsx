"use client";

import type { MotionValue } from "motion/react";
import type { GlTier } from "@/lib/gl/support";
import type { GlCardSpec } from "@/lib/gl/types";

/* ============================================================================
   GL GATE (spec §3.3, P3-6) — OWNER: W2-GL.
   Lazy-loads the contained WebGL frame for one act card; the tier switches
   only at p ≤ 0 / ≥ 1, and it sets data-gl="on" on the closest
   [data-act-card-frame] after its first draw at a p end.
   W1.0 stub: renders nothing (every card keeps its css tier).
   ========================================================================== */

export type GlGateProps = {
  spec: GlCardSpec;
  p: MotionValue<number>;
  live: boolean;
  onTier?: (t: GlTier) => void;
};

export function GlGate(props: GlGateProps): null {
  void props;
  return null;
}
