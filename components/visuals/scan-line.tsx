"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { ease } from "@/lib/motion";

/**
 * ScanLine — a single aqua "console scan" that sweeps top→bottom across its host
 * exactly once when it enters view. Transform + opacity only; the host must be
 * position:relative + overflow-hidden. Fully inert under prefers-reduced-motion.
 */
export function ScanLine({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <motion.span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-aqua/12 to-transparent",
        className,
      )}
      initial={{ y: "-100%", opacity: 0 }}
      whileInView={{ y: "620%", opacity: [0, 1, 0] }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 1.2, ease }}
    />
  );
}
