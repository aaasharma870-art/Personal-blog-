"use client";

import { useRef } from "react";
import type { ReactNode, RefObject } from "react";
import { motion } from "motion/react";
import { dur, ease, easeDraw } from "@/lib/motion";
import { useEnterOnce, type EnterPhase } from "@/components/primitives/use-enter-once";

/* ============================================================================
   WORLD MOTION — the two R1 grammars the M1 sections share, both built on
   useEnterOnce so the SERVER HTML IS THE FINAL STATE (no opacity:0 in SSR,
   nothing already in view ever hides, plays once, motion-off = static):
     - Rise: a block rises 24 px / fades in once (replaces ui/Reveal, whose
       SSR markup was opacity:0 — a banned tell, DESIGN §11.3).
     - drawn(): the stroke draw-on for chalk, graphite, brass and ink marks
       (pathLength on easeDraw), for every world icon that "draws once".
   ========================================================================== */

type RiseTag = "div" | "li" | "article" | "figure" | "aside";

const MOTION_TAGS = {
  div: motion.div,
  li: motion.li,
  article: motion.article,
  figure: motion.figure,
  aside: motion.aside,
} as const;

export function Rise({
  as = "div",
  children,
  className,
  delay = 0,
  amount,
  id,
}: {
  as?: RiseTag;
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const phase = useEnterOnce(ref, { amount });
  const Tag = MOTION_TAGS[as];
  return (
    <Tag
      // motion's per-tag ref types differ; the element is always an HTMLElement
      ref={ref as RefObject<never>}
      id={id}
      className={className}
      initial={false}
      animate={phase === "armed" ? { opacity: 0, y: 24 } : { opacity: 1, y: 0 }}
      transition={phase === "entered" ? { duration: dur.reveal, ease, delay } : { duration: 0 }}
    >
      {children}
    </Tag>
  );
}

/** Enter-once phase of an element (re-export for icon components). */
export function useDrawPhase(ref: RefObject<Element | null>, amount = 0.35): EnterPhase {
  return useEnterOnce(ref, { amount });
}

/** motion props for a path that draws once when its figure enters. */
export function drawn(
  phase: EnterPhase,
  { delay = 0, duration = dur.draw.med }: { delay?: number; duration?: number } = {},
) {
  return {
    initial: false as const,
    animate: { pathLength: phase === "armed" ? 0 : 1 },
    transition: phase === "entered" ? { duration, ease: easeDraw, delay } : { duration: 0 },
  };
}

/** motion props for a mark that fades in once (dots, fills, labels in SVG). */
export function faded(phase: EnterPhase, { delay = 0 }: { delay?: number } = {}) {
  return {
    initial: false as const,
    animate: { opacity: phase === "armed" ? 0 : 1 },
    transition: phase === "entered" ? { duration: dur.base, ease, delay } : { duration: 0 },
  };
}
