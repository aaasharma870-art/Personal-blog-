"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

/** A bright aqua reading-progress bar pinned to the top of the viewport —
 *  thick + glowing so it reads as "alive" from the first pixel. */
export function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  // A touch of smoothing so the bar glides rather than snaps — but bound to the
  // raw scroll value when the user prefers reduced motion (no inertia lag).
  const smooth = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.3,
  });
  return (
    <motion.div
      aria-hidden="true"
      style={{
        scaleX: reduce ? scrollYProgress : smooth,
        boxShadow: "0 0 12px 1px rgba(45,212,191,0.7)",
      }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-aqua via-aqua-bright to-aqua"
    />
  );
}
