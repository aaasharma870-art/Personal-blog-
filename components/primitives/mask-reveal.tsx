"use client";

import { Fragment, useRef } from "react";
import type { ElementType, ReactNode } from "react";
import { motion } from "motion/react";
import { dur, ease, maskTravel, stagger } from "@/lib/motion";
import { useDesktopFine } from "@/lib/flags";
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
 *
 * `handOff` (PHASE3-SPEC §8.2, W2-WORDS): the line holds an in-character
 * title (components/words/in-character-title.tsx). On DESKTOP_FINE the
 * words binder owns that title's entrance, so the rise stays static there
 * and the line drops its overflow mask (the arrival's scorch, dust and nib
 * reach past the line box). Everywhere else (phones, touch, narrow windows)
 * the rise plays exactly as before.
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
  /** An in-character title inside: on DESKTOP_FINE the words binder owns
   *  the entrance (static rise, no overflow mask). */
  handOff?: boolean;
};

export function MaskReveal({
  as: Tag = "div",
  lines,
  children,
  id,
  className,
  lineClassName,
  amount,
  handOff = false,
}: MaskRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const entered = useEnterOnce(ref, { amount });
  // false on the server and during hydration, so the SSR markup is unchanged
  const quiet = useDesktopFine() && handOff;
  const phase = quiet ? "static" : entered;
  const items = lines ?? [children];

  return (
    <Tag ref={ref} id={id} className={className} data-reveal={phase}>
      {items.map((line, i) => (
        <Fragment key={i}>
          {i > 0 ? " " : null}
          <span className={quiet ? "-mb-[0.15em] block pb-[0.15em]" : "-mb-[0.15em] block overflow-hidden pb-[0.15em]"}>
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
