"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { springSnappy } from "@/lib/motion";

/**
 * ScrollVelocity — a tamed, DIRECTIONAL aqua flick accent on the screen edges
 * (Spec §5, Locked Decision 3 = TAME not cut). Scrolling DOWN briefly lights
 * the LEFT edge; scrolling UP lights the RIGHT edge. Low-alpha (≤0.26) with a
 * high deadzone so it only fires on a genuine fast flick — an ordinary scroll
 * shows nothing (ScrollProgress already implies velocity). Transform/opacity
 * only, pointer-events-none, and fully disabled under reduced motion.
 */
export function ScrollVelocity() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  // Shared snappy spring (low mass, ζ≈0.9): rises within a few frames of a
  // fast flick and settles back to 0 quickly. One physics language site-wide.
  const smooth = useSpring(velocity, springSnappy);
  // Directional + high deadzone: nothing until |velocity| clears ~600 px/s,
  // full (capped) glow by ~2200. Down (positive) → left edge; up → right edge.
  const leftOpacity = useTransform(smooth, [0, 600, 2200], [0, 0, 0.26]);
  const rightOpacity = useTransform(smooth, [-2200, -600, 0], [0.26, 0, 0]);

  if (reduce) return null;

  return (
    <>
      <motion.div
        aria-hidden="true"
        style={{
          opacity: leftOpacity,
          background:
            "linear-gradient(to right, rgba(45,212,191,0.18), transparent)",
        }}
        className="pointer-events-none fixed inset-y-0 left-0 z-[55] w-24 mix-blend-screen"
      />
      <motion.div
        aria-hidden="true"
        style={{
          opacity: rightOpacity,
          background:
            "linear-gradient(to left, rgba(45,212,191,0.18), transparent)",
        }}
        className="pointer-events-none fixed inset-y-0 right-0 z-[55] w-24 mix-blend-screen"
      />
    </>
  );
}
