"use client";

import type { ReactNode } from "react";
import { motion, useMotionValueEvent } from "motion/react";
import { useState } from "react";
import { dur, ease, maskTravel } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useCard } from "@/components/sections/act-card/card-context";

/**
 * A caption that rises once the card's p reaches `at` (the R1 masked rise,
 * y 115 % → 0 inside an overflow mask with the .15em descender pad) and
 * sinks again below it — captions swap by STATE on dur.reveal, never
 * scrubbed (act-cards.BAR §4). The static card (SSR, no JS, RM/Pause,
 * < 640, in view at hydration) renders the final text: nothing is ever
 * hidden in front of the reader, and the server HTML is complete.
 * Put it INSIDE the real element (h2 / p) so the heading never moves.
 */
export function CardReveal({
  at,
  as = "span",
  pinned = "rise",
  children,
  className,
}: {
  at: number;
  /** "div" when the content is a block (a FilmQuote figure); else "span". */
  as?: "span" | "div";
  /** Phase 3 pin mode (PHASE3-SPEC §7.1): "static" = up from arrival (the
   *  film title in the upper bar: legible, no stamp); "rise" (default) =
   *  rises at `at` of star (a) (the h2 and the epigraph / TIP). */
  pinned?: "rise" | "static";
  children: ReactNode;
  className?: string;
}) {
  const { p, live, pin } = useCard();
  const [shown, setShown] = useState(() => p.get() >= at);
  useMotionValueEvent(p, "change", (v) => {
    const next = v >= at;
    if (next !== shown) setShown(next);
  });
  const up = !live || shown || (pin != null && pinned === "static");
  const Outer = as;
  const Inner = as === "div" ? motion.div : motion.span;
  return (
    <Outer className={cn("-mb-[0.15em] block overflow-hidden pb-[0.15em]", className)}>
      <Inner
        className="block"
        initial={false}
        animate={{ y: up ? "0%" : maskTravel }}
        transition={live ? { duration: dur.reveal, ease } : { duration: 0 }}
      >
        {children}
      </Inner>
    </Outer>
  );
}
