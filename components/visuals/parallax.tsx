"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Parallax — shifts a child a few pixels on scroll for quiet depth.
 * Transform-only, capped small, and zeroed under reduced motion.
 * `depth` scales the travel magnitude (the rate DELTA between stacked layers
 * is the depth cue); `sign` flips direction so near/counter-move layers can
 * travel opposite to the backdrop (Spec §2 3-plane depth). Backward-compatible:
 * amount-only callers get depth=1, sign=1 = the original behavior.
 */
export function Parallax({
  children,
  amount = 24,
  depth = 1,
  sign = 1,
  className,
}: {
  children: ReactNode;
  amount?: number;
  depth?: number;
  sign?: 1 | -1;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const travel = amount * depth * sign;
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [travel, -travel],
  );

  return (
    <motion.div ref={ref} style={{ y }} className={cn(className)}>
      {children}
    </motion.div>
  );
}
