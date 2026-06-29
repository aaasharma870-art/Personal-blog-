"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import {
  item,
  itemReduced,
  revealByName,
  revealReduced,
  staggerParent,
  viewportReplay,
  type RevealVariant,
} from "@/lib/motion";

/**
 * Reveal — the single scroll-reveal primitive used site-wide.
 * One-shot (viewport once), transform+opacity only, with a real reduced-motion
 * path (gentle opacity, no movement). Set `stagger` to orchestrate children
 * wrapped in <RevealItem>. NOTE: for stagger to work, RevealItems must be the
 * DIRECT children of a stagger Reveal — never nest a plain <ul>/<ol> between.
 */
export function Reveal({
  children,
  className,
  stagger = false,
  variant = "up",
  role,
  ariaLabel,
  id,
}: {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
  variant?: RevealVariant;
  role?: string;
  ariaLabel?: string;
  id?: string;
}) {
  const reduce = useReducedMotion();
  const variants = stagger
    ? staggerParent
    : reduce
      ? revealReduced
      : revealByName[variant];
  return (
    <motion.div
      id={id}
      className={className}
      role={role}
      aria-label={ariaLabel}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={viewportReplay}
    >
      {children}
    </motion.div>
  );
}

/** A child of a `stagger` Reveal — carries the per-item entrance. */
export function RevealItem({
  children,
  className,
  role,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  role?: string;
  as?: "div" | "li";
}) {
  const reduce = useReducedMotion();
  const variants = reduce ? itemReduced : item;
  if (as === "li") {
    return (
      <motion.li className={className} role={role} variants={variants}>
        {children}
      </motion.li>
    );
  }
  return (
    <motion.div className={className} role={role} variants={variants}>
      {children}
    </motion.div>
  );
}
