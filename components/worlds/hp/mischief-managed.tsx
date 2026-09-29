"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { dur } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { FilmQuote } from "@/components/site/film-quote";
import { drawn, useDrawPhase } from "@/components/site/world-motion";

/**
 * MischiefManaged — the Marauder's Map closing (RECOGNIZABILITY S19 item 4;
 * SPEC SM-13 "the last line"; the bookend to the oath on the play screen):
 * Q-HP-2 lettered in IM Fell at --text-heading (FilmQuote `lettered`, the
 * registry's text; the credits' LINES QUOTED row carries its attribution),
 * with a short ink fold-line under it that draws CLOSED once — two halves
 * meeting at the crease, the way the map folds shut.
 *
 * Offered to the credits roll (loaders-eggs-chrome owns the footer): render
 * it as the roll's last text node. It is the page's only rendering of Q-HP-2
 * (the Act IV sections do not repeat it). SSR / reduced motion / Pause /
 * already in view: the fold is drawn (final state). Ink only (Law 1).
 */
export function MischiefManaged({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const phase = useDrawPhase(ref, 0.6);
  return (
    <div className={cn("flex flex-col items-center text-center", className)} data-motif="mischief-managed">
      <p className="text-heading leading-[1.15] text-fg">
        <FilmQuote id="Q-HP-2" rendition="lettered" attribution="credits" />
      </p>
      <svg
        ref={ref}
        viewBox="0 0 160 12"
        aria-hidden="true"
        focusable="false"
        className="mt-tier-pair h-3 w-40 overflow-visible"
        fill="none"
        strokeLinecap="round"
      >
        {/* the two halves of the fold travel to the crease and meet */}
        <motion.path
          d="M4 6 L80 6"
          className="stroke-(--w-ink-contour)"
          strokeWidth={1.2}
          vectorEffect="non-scaling-stroke"
          {...drawn(phase, { duration: dur.draw.short, delay: 0.2 })}
        />
        <motion.path
          d="M156 6 L80 6"
          className="stroke-(--w-ink-contour)"
          strokeWidth={1.2}
          vectorEffect="non-scaling-stroke"
          {...drawn(phase, { duration: dur.draw.short, delay: 0.2 })}
        />
        {/* the crease, inked last */}
        <motion.path
          d="M80 1 L80 11"
          className="stroke-(--w-ink-contour)"
          strokeWidth={1.2}
          vectorEffect="non-scaling-stroke"
          {...drawn(phase, { duration: dur.base, delay: 0.2 + dur.draw.short })}
        />
      </svg>
    </div>
  );
}
