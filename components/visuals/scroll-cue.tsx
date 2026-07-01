"use client";

import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * ScrollCue — a quiet "keep scrolling" affordance for the full-viewport hero.
 * A 1px aqua line with a dot that gently travels down it (≤6px, transform-only),
 * plus a chevron. Decorative + aria-hidden. Reduced motion: static line + dot +
 * chevron, no bob. The fade-on-scroll is applied by the consumer, not here.
 */
export function ScrollCue({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className={cn("flex flex-col items-center gap-1", className)}
    >
      <span className="relative block h-10 w-px overflow-hidden bg-gradient-to-b from-aqua/50 to-transparent">
        {reduce ? (
          <span
            className="absolute left-1/2 top-0 h-1.5 w-1.5 rounded-full bg-aqua"
            style={{ transform: "translateX(-50%)" }}
          />
        ) : (
          <motion.span
            className="absolute left-1/2 top-0 h-1.5 w-1.5 rounded-full bg-aqua"
            style={{ x: "-50%" }}
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, ease, repeat: Infinity }}
          />
        )}
      </span>
      <ChevronDown className="h-3 w-3 text-aqua/60" />
    </div>
  );
}
