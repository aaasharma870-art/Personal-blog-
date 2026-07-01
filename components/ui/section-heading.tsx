"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import { Reveal } from "@/components/ui/reveal";
import { dur, ease, maskedLine, type RevealVariant } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * SectionHeading — the shared header for every section: an oversized ghost serif
 * index numeral (editorial spine, decorative), a mono eyebrow with a kinetic
 * underline that draws left→right, and a serif title that reveals via a masked
 * line slide. All three inherit the surrounding <Reveal> entrance. Reduced
 * motion: static hairline + plain title text (opacity-only via the Reveal).
 */
const underline: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: dur.base, ease } },
};

export function SectionHeading({
  index,
  eyebrow,
  title,
  intro,
  className,
  variant = "up",
}: {
  index: string;
  eyebrow: string;
  title: string;
  intro?: string;
  className?: string;
  variant?: RevealVariant;
}) {
  const reduce = useReducedMotion();
  return (
    <Reveal variant={variant} className={cn("relative max-w-3xl", className)}>
      {/* Oversized ghost serif index numeral — editorial spine, decorative only.
          Newsreader (never mono/tnum) so it never reads as a metric. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-8 left-0 -z-10 select-none font-serif text-[5rem] leading-none text-line-strong/60 sm:text-[7rem]"
      >
        {index}
      </span>
      <div className="flex items-center gap-3">
        <span className="eyebrow text-gold/80">{index}</span>
        {reduce ? (
          <span className="h-px w-8 bg-line-strong" aria-hidden="true" />
        ) : (
          <motion.span
            aria-hidden="true"
            variants={underline}
            className="h-px w-8 origin-left bg-line-strong"
          />
        )}
        <span className="eyebrow">{eyebrow}</span>
      </div>
      <h2 className="mt-5 font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl">
        {reduce ? (
          title
        ) : (
          <span className="block overflow-hidden pb-[0.15em]">
            <motion.span
              variants={maskedLine}
              className="block will-change-transform"
            >
              {title}
            </motion.span>
          </span>
        )}
      </h2>
      {intro ? (
        <p className="measure mt-5 text-base leading-relaxed text-stone sm:text-lg">
          {intro}
        </p>
      ) : null}
    </Reveal>
  );
}
