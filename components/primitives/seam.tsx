"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useReducedMotion } from "@/lib/flags";
import { cn } from "@/lib/utils";
import { planeAttrs, type ToneId, type WorldId } from "@/lib/worlds";

/**
 * Seam — the dome edge where one plane gives way to the next (DESIGN v2
 * §5.2; Dennis geometry, VER). Place it as the FIRST child of the incoming
 * section, which must be `position: relative`.
 *
 * Geometry: a wrapper `--seam-h` tall (10vh; 5vh ≤ 540 px) with overflow
 * hidden, holding an ellipse 150% wide × 750% tall, border-radius 50%,
 * translate(-50%, -86.666%), filled with the OUTGOING plane's --bg (it
 * carries that plane's data-tone/data-world, so the colour is data-driven).
 * No stroke: the tone change is the edge.
 *
 * Motion (R2, direct, no spring): the dome flattens 10vh → 0 over the first
 * 60vh of the section's entry (scroll offset "start end" → "start 40%"),
 * as a scaleY on the wrapper (origin top) — compositor-only, no layout. The
 * ellipse is 750% of the wrapper, so a scaled cap keeps its shape.
 *
 * Reduced motion / Pause: a flat edge (the dome is not rendered). This is
 * CSS-level (`motion-off:hidden`), so the server HTML is already flat for
 * reduced-motion visitors. No JS: the static dome (a legitimate final frame).
 */
type SeamProps = {
  /** The plane the page is leaving (painted as the dome). */
  from: { tone: ToneId; world: WorldId };
  className?: string;
};

export function Seam({ from, className }: SeamProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 40%"],
  });
  const scaleY = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      data-seam=""
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 z-(--z-content) h-(--seam-h) origin-top overflow-hidden motion-off:hidden",
        className,
      )}
      style={reduced ? undefined : { scaleY }}
    >
      <div
        {...planeAttrs(from.tone, from.world)}
        className="absolute left-1/2 top-0 h-[750%] w-[150%] -translate-x-1/2 -translate-y-[86.666%] rounded-[50%] bg-bg"
      />
    </motion.div>
  );
}
