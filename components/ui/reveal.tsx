"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import {
  item,
  itemReduced,
  revealByName,
  revealReduced,
  staggerParent,
  viewportOnce,
  viewportSignature,
  type RevealVariant,
} from "@/lib/motion";

/**
 * Reveal — the single scroll-reveal primitive used site-wide.
 * DEFAULT is once-settle (viewportOnce): a block animates in ONCE and stays,
 * no mid-scroll re-trigger flicker (Spec §5 replay grammar). Pass `replay` to
 * opt a signature beat into re-firing on a full deliberate re-entry
 * (viewportSignature) — reserved for Hero, the two MediaBands, and the
 * Projects header. Transform+opacity only, with a real reduced-motion path
 * (gentle opacity, no movement). Set `stagger` to orchestrate children wrapped
 * in <RevealItem>. NOTE: for stagger to work, RevealItems must be the DIRECT
 * children of a stagger Reveal — never nest a plain <ul>/<ol> between.
 */
export function Reveal({
  children,
  className,
  stagger = false,
  variant = "up",
  replay = false,
  role,
  ariaLabel,
  id,
}: {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
  variant?: RevealVariant;
  replay?: boolean;
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
      viewport={replay ? viewportSignature : viewportOnce}
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
