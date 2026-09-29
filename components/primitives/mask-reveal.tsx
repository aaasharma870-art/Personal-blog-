"use client";

import { Fragment, useRef } from "react";
import type { ElementType, ReactNode } from "react";
import { motion } from "motion/react";
import { dur, ease, maskTravel, stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useEnterOnce } from "@/components/primitives/use-enter-once";

/**
 * MaskReveal — R1 masked line rise (DESIGN v2 §2.3, §6.2): each line sits in
 * an `overflow: hidden` mask and rises from y 115% → 0 over `dur.reveal` on
 * `ease`, once, when the block first enters the viewport. Lines stagger by
 * `stagger.line` (0.08 s), capped at 4 lines.
 *
 * SSR-CRISP: the server HTML (and hydration, and no-JS) is the final text —
 * no opacity 0, no blur, no transform. A line is pushed below its mask only
 * when the block mounted OFFSCREEN (useEnterOnce "armed"), so text already
 * in view never hides, and headings are never blanked for crawlers or
 * slow devices. Reduced motion / Pause: static final text.
 *
 * The mask keeps a .15em descender pad (padding-bottom + equal negative
 * margin), so g/y/p aren't shaved and layout is unchanged. Lines are joined
 * with a real space, so the accessible text reads "Aryan Sharma", not
 * "AryanSharma".
 *
 * Note: DESIGN v2 keeps the REPO `maskedLine` travel of 115% (the P1-early
 * brief said 110%); DESIGN wins on tokens.
 */
type MaskRevealProps = {
  /** Element to render (default "div"). Use the real heading level. */
  as?: ElementType;
  /** Explicit lines; each gets its own mask. Omit to mask `children` as one line. */
  lines?: readonly ReactNode[];
  children?: ReactNode;
  id?: string;
  className?: string;
  /** Classes for each masked line's inner span. */
  lineClassName?: string;
  /** Viewport fraction that triggers the rise (default viewportOnce.amount = .25). */
  amount?: number;
};

export function MaskReveal({
  as: Tag = "div",
  lines,
  children,
  id,
  className,
  lineClassName,
  amount,
}: MaskRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const phase = useEnterOnce(ref, { amount });
  const items = lines ?? [children];

  return (
    <Tag ref={ref} id={id} className={className} data-reveal={phase}>
      {items.map((line, i) => (
        <Fragment key={i}>
          {i > 0 ? " " : null}
          <span className="-mb-[0.15em] block overflow-hidden pb-[0.15em]">
            <motion.span
              className={cn("block", lineClassName)}
              initial={false}
              animate={{ y: phase === "armed" ? maskTravel : "0%" }}
              transition={
                phase === "entered"
                  ? {
                      duration: dur.reveal,
                      ease,
                      delay: Math.min(i, stagger.maxLines - 1) * stagger.line,
                    }
                  : { duration: 0 }
              }
            >
              {line}
            </motion.span>
          </span>
        </Fragment>
      ))}
    </Tag>
  );
}
