"use client";

import { useRef, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { springSoft } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Hydration-safe media-query read: `false` on the server and the first client
 *  render (so SSR matches), then upgrades to the live value and keeps in sync.
 *  Uses useSyncExternalStore (NOT setState-in-effect) per the project's
 *  react-hooks/set-state-in-effect guardrail. */
function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/**
 * ParallaxLayer — scroll-linked depth as a first-class layer (Spec §5).
 * The element translates on `y` across the window (offset start-end → end-start)
 * fed through useSpring(springSoft) for a buttery scrub; `depth` scales travel
 * (±~40px × depth). Cap usage to backdrop + media layers only (a handful of
 * nodes) to protect scroll perf. Transform-only.
 *
 * HARD GATES: under prefers-reduced-motion OR a coarse (touch) pointer it
 * returns plain children with NO motion wrapper and NO bound scroll transform,
 * so touch/low-end devices get the static composition (Spec §9).
 */
export function ParallaxLayer({
  children,
  depth = 1,
  className,
}: {
  children: ReactNode;
  depth?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  // Fine pointer starts false so SSR and first client render match (no hydration
  // mismatch); the store keeps it correct if the pointer type changes.
  const finePointer = useMediaQuery("(pointer: fine)");

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const travel = 40 * depth;
  const yRaw = useTransform(scrollYProgress, [0, 1], [travel, -travel]);
  const y = useSpring(yRaw, springSoft);

  if (reduce || !finePointer) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <motion.div ref={ref} style={{ y }} className={cn(className)}>
      {children}
    </motion.div>
  );
}
