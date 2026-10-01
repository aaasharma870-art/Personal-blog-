"use client";

import dynamic from "next/dynamic";
import type { MotionValue } from "motion/react";
import { useCallback, useEffect, useRef } from "react";
import { registerChunk, useLadder } from "@/lib/ladder";
import { useGlTier, type GlTier } from "@/lib/gl/support";
import type { GlCardSpec } from "@/lib/gl/types";

/* ============================================================================
   GL GATE (spec §3.3, P3-6; plan §3.5, DP-13) — OWNER: W2-GL.
   The facade (first-load bundle, < 1 KB): mounts the lazy GlFrame
   (`next/dynamic`, ssr:false) only when the tier is "gl", the card is
   `live` and the warm-up ladder has reached step 4. Everything else — the
   one context, the programs, the textures, the draws — is in the GL chunk.

   Place it INSIDE the card frame element that carries
   `data-act-card-frame` (relative, overflow hidden): GlFrame fills it at
   z-index 1 (above the plate layers, below the SVG/DOM overlays at z ≥ 2).
   After its first draw at a p end it fades in (.2 s) and sets
   `data-gl="on"` on that frame; DOM layers GL replaces carry
   `data-gl-replaced` (hidden by CSS under `[data-gl="on"]`).

   `onTier(t)` reports what the card SHOWS: "off" (no GL, no P3 choreo:
   reduced motion / Pause / not DESKTOP_FINE), "css" (the DOM choreography),
   "gl" (engaged). It switches only at p ≤ 0 / p ≥ 1, except Pause, reduced
   motion and a lost context, which fall back at once.
   ========================================================================== */

export type GlGateProps = {
  spec: GlCardSpec;
  p: MotionValue<number>;
  live: boolean;
  onTier?: (t: GlTier) => void;
};

const loadFrame = () => import("./gl-frame");
// a failed chunk load (deploy skew, offline) must not throw in render: the
// layer is additive, so the card simply stays on its css tier
const GlFrame = dynamic(() => import("./gl-frame").catch(() => ({ default: () => null })), { ssr: false });

export function GlGate({ spec, p, live, onTier }: GlGateProps) {
  const tier = useGlTier();
  const ladder = useLadder(4);
  const on = tier === "gl" && live && ladder;

  const cb = useRef(onTier);
  const shown = useRef<GlTier | null>(null);
  useEffect(() => {
    cb.current = onTier;
  });
  const report = useCallback((t: GlTier) => {
    if (shown.current === t) return;
    shown.current = t;
    cb.current?.(t);
  }, []);

  // warm the GL chunk with the ladder's prefetch (DESKTOP_FINE, motion on)
  useEffect(() => {
    if (tier === "gl") registerChunk(loadFrame);
  }, [tier]);

  useEffect(() => {
    if (tier && !on) report(tier === "gl" ? "css" : tier);
  }, [tier, on, report]);

  return on ? <GlFrame spec={spec} p={p} onTier={report} /> : null;
}
