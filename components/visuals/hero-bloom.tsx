"use client";

import { motion, useReducedMotion } from "motion/react";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * HeroBloom — a soft aqua radial that "ignites the dark" behind the hero
 * headline (Signature Moment 1). It is mounted as a SIBLING layer behind the
 * h1, never as a parent opacity wrapper of it, so it can never delay the LCP
 * paint of the headline. Transform + opacity only; alpha capped ≤0.16 so ink
 * contrast is untouched. Reduced motion renders it static.
 *
 * Position, size and z-index are supplied by the consumer via `className`.
 */
const BLOOM =
  "radial-gradient(circle at center, rgba(45,212,191,0.16), rgba(45,212,191,0.06) 40%, transparent 65%)";

export function HeroBloom({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div
        aria-hidden="true"
        className={cn("pointer-events-none", className)}
        style={{
          background: BLOOM,
          opacity: 0.5,
          mixBlendMode: "screen",
          transform: "translate(-50%, -50%)",
        }}
      />
    );
  }

  return (
    <motion.div
      aria-hidden="true"
      className={cn("pointer-events-none", className)}
      style={{ background: BLOOM, mixBlendMode: "screen" }}
      initial={{ opacity: 0, scale: 0.92, x: "-50%", y: "-50%" }}
      animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
      transition={{ duration: 1.2, ease, delay: 0.15 }}
    />
  );
}
